import {
  Scene,
  StandardMaterial,
  Mesh,
  Color4,
  MeshBuilder,
  Texture,
  Vector3,
  Animation,
  ActionManager,
  ExecuteCodeAction,
  Animatable,
  Color3,
  Camera,
  Ray,
  Vector4,
} from "babylonjs";
import {
  BLOCK_SIZE,
  BLOCK_CATALOG,
  // BLOCK_TEXTURES,
  // TEXTURE_FILE_DEFAULT,
  BLOCK_TYPE_WALL,
  BLOCK_TYPE_DOOR,
  BLOCK_TYPE_ELEVATOR,
} from "../constants";
import Map from "../map";
//import blockDataInterface from "src/app/models/texture-data.interface";

import { TEXTURE_BLOCK_DEFAULT } from '../textures';

export default class BlockMesh {
  type = 0;
  isElevator = false;
  blockDataInterface = BLOCK_CATALOG[0];

  /**
   *
   * @param posx_ Position for ID, no pixel
   * @param posy_ Position for ID, no pixel
   * @param posz_ Position for ID, no pixel
   * @param {Map} mapInstance_
   * @param {Number} blockType_ integer index of the catalog
   * @param {string} parentName_ The name of the parent
   */

  constructor( subFolder_ , posx_, posy_, posz_, mapInstance_, blockType_, parentName_) {
    
    this.subFolder = subFolder_;
    this.idPosition = Vector3.Zero();
    this.idPosition.x = posx_;
    this.idPosition.y = posy_;
    this.idPosition.z = posz_;

    //if(blockType_ > 4) blockType_ = 2;

    // Taking the ID of block as ref
    const isIdInCatalog = (element) => element.id === blockType_;
    if(BLOCK_CATALOG.findIndex(isIdInCatalog) >= 0){
      this.blockDataInterface = BLOCK_CATALOG[BLOCK_CATALOG.findIndex(isIdInCatalog)];
    }
  
    this.type = blockType_;
    this.typeName = this.blockDataInterface.type;

    this.mapInstance = mapInstance_;

    this.position = new Vector3(
      posx_ * BLOCK_SIZE,
      posy_ * BLOCK_SIZE + BLOCK_SIZE * 0.5,
      posz_ * BLOCK_SIZE
    );

    let prefix = "block";
    if (this.typeName === BLOCK_TYPE_DOOR) prefix = "door";
    if (this.typeName === BLOCK_TYPE_ELEVATOR) prefix = "elevator";
    this.name = "wall_" + prefix + "_" + posx_ + "_" + posy_ + "_" + posz_;

    if (parentName_ != undefined) {
      this.parentBlock = this.mapInstance.getEnityFromDict(parentName_);
      if (this.parentBlock == undefined || parentName_ == this.name) {
        //console.error("parent not found for " + parentName_);
        this.parentBlock = null;
        parentName_ = null;
      } else {
        //console.log("Parent found!!!", this.parentBlock);
        this.parentBlock.topBlock = this;
      }
    }

    if (this.mapInstance.mapService != undefined)
      this.mapInstance.mapService.addBlock({
        posx: posx_,
        posy: posy_,
        posz: posz_,
        type: this.type,
        name: this.name,
        parentName: parentName_,
      });
    this.createMesh();
    this.mapInstance.addEntityToDict(this);
  }

  /**
   *
   * @param {blockDataInterface} textureData_
   */
  setTexture(textureData_) {
    this.blockDataInterface = textureData_;
    this.delete();
    this.createMesh();
  }

  createMesh() {
    //Doc of UV is here
    //https://doc.babylonjs.com/how_to/createbox_per_face_textures_and_colors
    let mat = new StandardMaterial("block", this.mapInstance.scene);
    mat.diffuseTexture = new Texture(
      TEXTURE_BLOCK_DEFAULT,
      this.mapInstance.scene,
      true,
      true,
      Texture.NEAREST_NEAREST
    );
    // mat.wireframe = true;
    let columns = 6; // 24 columns
    let rows = 6; // 87 rows
    let faceUV = new Array(6);

    let unitU = (1 / columns) * this.blockDataInterface.u;
    let unitV = (1 / rows) * this.blockDataInterface.v;
    let tileToDisplay = 0;

    for (let i = 0; i < 6; i++) {
      if (i < 4) {
        //Side
        tileToDisplay = 0;
      } else if (i == 4) {
        //Top
        tileToDisplay = 1;
      } else {
        //Bottom
        tileToDisplay = 1;
      }

      //Use now the top left sprite.
      let Ubottom_left = tileToDisplay / columns + unitU;
      let Vbottom_left = 1 - 1 / rows - unitV;
      let Utop_right = (tileToDisplay + 1) / columns + unitU;
      let Vtop_right = 1 - unitV;

      faceUV[i] = new Vector4(
        Ubottom_left,
        Vbottom_left,
        Utop_right,
        Vtop_right
      );
    }

    //Create colors
    let faceColors = new Array(6);

    const max = 1;
    const step = 0.05;

    let percent = max - (step * 6);
    for (let n = 0; n < faceColors.length; n++){
      faceColors[n] = new Color3(percent,percent,percent);
      percent += step;
    }

    //https://playground.babylonjs.com/#NLWBJP#8
    let options = {
      faceUV: faceUV,
      faceColors: faceColors,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      depth: BLOCK_SIZE,
      wrap: true,
    };

    // Mechnisme de clonage
    if(this.mapInstance && this.mapInstance.firstBlock != null){
      this.mesh =this.mapInstance.firstBlock.mesh.clone(this.name)
    } else {
      this.mesh = MeshBuilder.CreateBox(
        this.name,
        options,
        this.mapInstance.scene
      );
    }
   
    this.mesh.checkCollisions = true;
    this.mesh.isPickable = true;

    this.mesh.material = mat;
    this.mesh.position.x = this.position.x;
    this.mesh.position.z = this.position.z;
    this.mesh.position.y = this.position.y;
    this.mesh.scaling = new Vector3(1, 1, 1);
  

    if (this.typeName !== BLOCK_TYPE_WALL) {
      this.mesh.actionManager = new ActionManager(this.mapInstance.scene);
      this.mesh.actionManager
        .registerAction(
          new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (evt) => {
            this.launchAction();
          })
        )
        .then(
          new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (evt) => {
            this.launchAction();
          })
        );
    }
  }

  launchAction() {
    let numTOpBlock = 0;
    let parent = this.getFirstParentOfSameType();
    if (parent != undefined) {
      let topBlocks = parent.getTopBlocks();
      console.log("num top blocks", topBlocks);
      numTOpBlock = topBlocks.length - 1;
      parent.animateDoor(numTOpBlock);
    }
  }

  addTopBlock(idBlock_) {
    let type = BLOCK_TYPE_WALL;
    const isIdInCatalog = (element) => element.id === idBlock_;
    if(BLOCK_CATALOG.findIndex(isIdInCatalog) >= 0){
      type = BLOCK_CATALOG[BLOCK_CATALOG.findIndex(isIdInCatalog)].type;
    }
  
    if (
      this.typeName === BLOCK_TYPE_ELEVATOR &&
      type !== BLOCK_TYPE_ELEVATOR
    ) {
      console.log(this.typeName);
      console.log(type);
      console.warn("cannot build another block on the to of an elevator");
      return null;
    }

    let lastBlock = this.getTopBlock(); //BlockMesh
    console.log("addTopBlock(type_) type_",type);
    let newBlock = new BlockMesh(
      this.subFolder,
      lastBlock.idPosition.x,
      lastBlock.idPosition.y + 1,
      lastBlock.idPosition.z,
      this.mapInstance,
      idBlock_,
      this.name
    );

    newBlock.mesh.position.y = BLOCK_SIZE + lastBlock.mesh.position.y;
    lastBlock.topBlock = newBlock;
    return newBlock;
  }

  getTopBlock() {
    if (this.topBlock === null || this.topBlock === undefined) return this;
    return this.topBlock;
  }

  /**
   *
   * @param {BlockMesh[]} blocks_  mandatory
   */
  getTopBlocks(blocks_) {
    if (!blocks_) blocks_ = [];
    blocks_.push(this);
    if (blocks_.length >= 10) return blocks_;
    if (this.topBlock != undefined)
      blocks_ = this.topBlock.getTopBlocks(blocks_);
    return blocks_;
  }

  delete() {
    this.mapInstance.mapService.deleteBlockOrCanvas(this.name);
    this.mapInstance.deleteEntityFromDict(this.name);
    if (
      this.parentBlock != undefined &&
      this.parentBlock.topBlock != undefined
    ) {
      this.parentBlock.topBlock = null;
      //if the door/elevator is open
      if (
        this.parentBlock.typeName == BLOCK_TYPE_ELEVATOR &&
        this.parentBlock.doorIsOpen
      )
        this.parentBlock.launchAction();
    }

    if (this.topBlock != undefined && this.topBlock.parentBlock != undefined)
      this.topBlock.parentBlock = null;

    this.mesh.dispose();
    delete this;
  }

  /**
   * Get the first parent of Same type
   */
  getFirstParentOfSameType() {
    if (
      this.parentBlock == undefined ||
      this.parentBlock.typeName != this.typeName
    )
      return this;
    return this.parentBlock.getFirstParentOfSameType();
  }

  doorIsOpen = false;

  /**
   *
   * @param {number} amplitudeY_ Amplitude is the number of block to move
   */
  animateDoor(amplitudeY_) {
    let amplitudeY = 0;
    let stairStep = BLOCK_SIZE * 0.01; //Pour eviter que la porte ne disparaisse sous le ground
    if (amplitudeY_) amplitudeY = amplitudeY_;

    if (this.typeName == BLOCK_TYPE_WALL) return;

    if (this.topBlock !== null && this.topBlock != undefined) {
      this.topBlock.doorIsOpen = this.doorIsOpen;
      this.topBlock.animateDoor(amplitudeY_);
    }

    const numFrame = 2;
    const keysDoor = [];
    const normalPosY = this.idPosition.y * BLOCK_SIZE;

    //Close
    if (this.doorIsOpen) {
      //close Door
      keysDoor.push({
        frame: 0,
        value:
          normalPosY - BLOCK_SIZE * 0.5 - BLOCK_SIZE * amplitudeY + stairStep,
      });

      keysDoor.push({
        frame: numFrame,
        value: BLOCK_SIZE * 0.5 + normalPosY,
      });
      this.doorIsOpen = false;
    } else {
      //OPenning
      keysDoor.push({
        frame: 0,
        value: BLOCK_SIZE * 0.5 + normalPosY,
      });

      keysDoor.push({
        frame: numFrame,
        value:
          normalPosY - BLOCK_SIZE * 0.5 - BLOCK_SIZE * amplitudeY + stairStep,
      });
      this.doorIsOpen = true;
    }

    let doorMove = new Animation(
      "door" + this.name,
      "position.y",
      numFrame,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    doorMove.setKeys(keysDoor);
    this.animation = this.mapInstance.scene.beginDirectAnimation(
      this.mesh,
      [doorMove],
      0,
      numFrame,
      false,
      1 / (amplitudeY_ + 1)
    );
  }
}
