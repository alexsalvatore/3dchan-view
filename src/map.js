import {
  StandardMaterial,
  Mesh,
  MeshBuilder,
  Texture,
  Vector3,
  FreeCamera,
  
} from "babylonjs";
import * as GUI from 'babylonjs-gui';
// import { MapDBService } from "../services/dbService";
import { PLAYER_Y,
  BLOCK_SIZE,
  INTERACTION_TYPE_ADD_BLOCK,
  INTERACTION_TYPE_ADD_CHAR,
  INTERACTION_TYPE_DELETE_BLOCK,
  INTERACTION_TYPE_ADD_FILE,
  INTERACTION_TYPE_SCALE,
  INTERACTION_TYPE_ACTION,
  INTERACTION_TYPE_UPDATE_OBJECT,
  CLASS_BLOCK,
  CLASS_CHAR,
  CLASS_FILE,
 } from "./constants";
import BlockMesh from "./meshs/blockMesh";
import FileMesh from "./meshs/fileMesh";
import CharMesh from './meshs/charMesh';
import {TEXTURE_CURSOR, TEXTURE_CURSOR_ITEM} from './textures';

export default class Map {

  /*
  mapWidth = 16;
  mapHeight = 17;
  */
 
  /*
  fileMeshDict = {};
  blockMeshDict = {};*/

  constructor(subFolder_, scene_, mapId_) {
    this.scene = scene_;
    this.subFolder = subFolder_;
    this.mapId = mapId_;
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    this.entityDict = {};
    this.sLoaded = false;

    this.updateFrontBlockTimer = 0;
    this.UPDATE_FRONT_BLOCK = 30;
    this.playerLegacyTimer = 0;
    this.playerLegacyFreq = 550;

    //Add wireframe texture
    let matGhost = new StandardMaterial("matGhost_text", this.scene);
    let textGhost = new Texture(
      TEXTURE_CURSOR,
      this.scene,
      true,
      true,
      Texture.NEAREST_NEAREST
    );
    textGhost.hasAlpha = true;
    matGhost.diffuseTexture = textGhost;

    //Ghost mesh for ground
    this.selectorMeshGround = MeshBuilder.CreateBox(
      "ghost_tile",
      { size: BLOCK_SIZE },
      this.scene
    );
    this.selectorMeshGround.isPickable = false;
    this.selectorMeshGround.material = matGhost;

    let matGhostBlue = new StandardMaterial("matGhost_text", this.scene);
    let textGhostBlue = new Texture(
      TEXTURE_CURSOR_ITEM,
      this.scene,
      true,
      true,
      Texture.NEAREST_NEAREST
    );
    textGhostBlue.hasAlpha = true;
    matGhostBlue.diffuseTexture = textGhostBlue;

    //Ghost mesh for item
    this.selectorMeshItem = MeshBuilder.CreateBox(
      "ghost_tile",
      { size: BLOCK_SIZE },
      this.scene
    );
    this.selectorMeshItem.isPickable = false;
    this.selectorMeshItem.material = matGhostBlue;

    //prepare the pointer
    this.scene.pointerMovePredicate = function (mesh) {
      //Try to class
      return mesh.isPickable;
    };

    this.scene.pointerUpPredicate = function (mesh) {
      return mesh.isPickable;
    };

    this.scene.pointerDownPredicate = function (mesh) {
      return mesh.isPickable;
    };

    //When pointer down event is raised
    this.scene.onPointerMove = (evt, pickResult) => {
      if (pickResult.hit && this.fileMeshDragging) {
        //IF DRAG CANVAS
        if (pickResult.pickedMesh.name.indexOf("wall") > -1) {
          let blockMeshPicked = this.getEnityFromDict(
            pickResult.pickedMesh.name
          ); //BlockMesh
          this.fileMeshDragging.setToWall(
            pickResult.pickedPoint,
            null,
            blockMeshPicked,
            false,
            true
          );
        } else if (pickResult.pickedMesh.name.indexOf("ground") > -1) {
          this.fileMeshDragging.setToGround(pickResult.pickedPoint, true);
        }
        this.selectItem(this.fileMeshDragging.name);
      }
    };

    this.scene.onPointerUp = (evt, pickResult) => {
      //this.unSelectCanvas();
      if (this.fileMeshDragging != null) {
        this.fileMeshDragging.setPickable(true);
        this.fileMeshDragging.save();
        console.log('dragging stop for',this.fileMeshDragging);
        this.fileMeshDragging = null;
      }
    };

    this.scene.onPointerDown = (evt, pickResult) => {
      if (
        pickResult.pickedMesh != undefined &&
        pickResult.pickedMesh.name  != undefined  &&
        pickResult.pickedMesh.name.indexOf("ground") > -1
      ) {
        //We select the ground
        this.selectItem("");
        this.moveSelectorMeshGround(pickResult.pickedPoint);
        return;
      } else if (pickResult.pickedMesh == null) {
         //We select the nothing
        this.selectItem("");
        return;
      }

      if (pickResult.hit && this.fileMeshDragging == null) {
        //If we click on an already clicked item
        if (
          pickResult.pickedMesh != null &&
          this.fileMeshSelected != null &&
          this.fileMeshSelected.name === pickResult.pickedMesh.name
        ) {
          this.fileMeshDragging = this.fileMeshSelected;
          this.fileMeshDragging.setPickable(false);
        } else if (pickResult.pickedMesh != null) {
          //We selected an object
          this.selectItem(pickResult.pickedMesh.name);
        } else {
          //No object selected
          this.selectItem("");
        }
      }
    };
  }

  handeSendToUI(sendToUI_){
    this.sendToUI = sendToUI_;
  }

  updateSelectedMeshToUI(){
    //get the mesh

    //--> File
    if ( this.fileMeshSelected != undefined) {
      if (this.fileMeshSelected.mesh == undefined || this.lastMeshNameSend == this.fileMeshSelected.name) return;
      this.sendToUI({selected:{name:this.fileMeshSelected.mesh.name, fileType: this.fileMeshSelected.fileType, fileName: this.fileMeshSelected.fileName, fileData: this.fileMeshSelected.fileData}});
      this.lastMeshNameSend = this.fileMeshSelected.name;
   //--> Block
    } else if ( this.blockMeshSelected != undefined) {
      if (this.blockMeshSelected == undefined || this.lastMeshNameSend == this.blockMeshSelected.name) return;
      this.sendToUI({selected:{name:this.blockMeshSelected.mesh.name}});
      this.lastMeshNameSend = this.blockMeshSelected.name;
    } else {
      //Don't send null element!
      //this.sendToUI({selected:null});
    }
  }

  handeUIAction(interaction_) {
    switch (interaction_.action) {

      case INTERACTION_TYPE_ADD_BLOCK:

        let blockMesh; //BlockMesh
        if (this.blockMeshSelected != undefined) {
          blockMesh = this.blockMeshSelected.addTopBlock(interaction_.data);
          //console.log(blockMesh.position);
        } else {
          //shloud test if there's no block already
          blockMesh = new BlockMesh(
            this,
            this.selectorMeshGround.position.x / BLOCK_SIZE,
            0,
            this.selectorMeshGround.position.z / BLOCK_SIZE,
            interaction_.data
          );
        }

        if (blockMesh != undefined) {
          this.selectItem(blockMesh.name);
        }
      break;

      case INTERACTION_TYPE_ADD_CHAR:
          let  charMesh = new CharMesh( this,);
          //console.log('set char to block', this.selectorMeshItem);
          //console.log('this.selectorMeshGround', this.selectorMeshGround);
          if (this.selectorMeshItem && this.selectorMeshItem.visibility > 0) {
            charMesh.setToGround( {x:this.selectorMeshItem.position.x,
              y:this.selectorMeshItem.position.y + BLOCK_SIZE *0.5,
              z:this.selectorMeshItem.position.z}); 
          } else {
            charMesh.setToGround( {x:this.selectorMeshGround.position.x,
            y:0,
            z:this.selectorMeshGround.position.z}); 
          }
          this.selectItem(charMesh.name);
          charMesh.save();
      break;

      case INTERACTION_TYPE_ACTION:
        if (this.boundElevator) this.boundElevator.launchAction();
        break;

      case INTERACTION_TYPE_ADD_FILE:
        if (interaction_.data == null) return;
        let fileMeshData = interaction_.data; //FileMeshInterface

        let fileMesh = new FileMesh(this.scene, this , fileMeshData);

        let width = this.scene.getEngine().getRenderWidth();
        let height = this.scene.getEngine().getRenderHeight();
        let pickInfo = this.scene.pick(
          width / 2,
          height / 2,
          null,
          false,
          this.scene.cameras[0]
        );

        //Test if it's a block
        if (pickInfo.hit && pickInfo.pickedMesh) {
          if (pickInfo.pickedMesh.name.indexOf("wall") > -1) {
            let blockMeshPicked = this.getEnityFromDict(
              pickInfo.pickedMesh.name
            ); //BlockMesh
            fileMesh.setToWall(
              pickInfo.pickedPoint,
              null,
              blockMeshPicked,
              true,
              true
            );
          } else {
            let posSearch_ = this.searchFreeSpace();
            fileMesh.setToGround(posSearch_, true);
          }
        }
        fileMesh.save();
        this.selectItem(fileMesh.name);
        break;

      case INTERACTION_TYPE_DELETE_BLOCK:
        //pick the selected mesh
        if (this.blockMeshSelected != undefined) {
          this.blockMeshSelected.delete();
          this.blockMeshSelected = null;
        } else if (this.fileMeshSelected != undefined) {
          this.fileMeshSelected.delete();
          this.fileMeshSelected = null;
        }
        break;

      case INTERACTION_TYPE_SCALE:
        if (this.fileMeshSelected == undefined) return;
        //pick the selected mesh
        if (interaction_.data === "up") {
          this.fileMeshSelected.upSize();
        } else {
          this.fileMeshSelected.downSize();
        }
        this.selectItem(this.fileMeshSelected.name);
        //}
        break;

        case INTERACTION_TYPE_UPDATE_OBJECT:
          if (this.fileMeshSelected == undefined) return;
          //pick the selected mesh
          if ( this.fileMeshSelected.updateAndSave != undefined ) {
            this.fileMeshSelected.updateAndSave( interaction_.data );
          } 
        
          break;
    }
  }


  /**
   * Add a block
   * @param {*} x_ X of the block
   * @param {*} y_ Y " " "
   * @param {*} z_ Z " " "
   * @param {*} type_ type of the texture of the block
   * @param {*} parent_ Nom du parent
   * @returns Instance of the block
   */
  addBlock(position_, type_, parentName_){

    // If no position we took the selected place
    if(position_ == null && parentName_ == null){
      if(this.blockMeshSelected != null){
        parentName_ = this.blockMeshSelected.name
      } else {
        // We create a block adding the BLOCKsize + y
        position_ = {
          x: this.selectorMeshGround.position.x/BLOCK_SIZE,
          y: 0,
          z: this.selectorMeshGround.position.z/BLOCK_SIZE
        };
      }
    }

    // Important to use topblock
    if( parentName_ != null && this.getEnityFromDict(parentName_) != undefined){
      var parentBlock =  this.getEnityFromDict(parentName_)
      if(parentBlock == undefined) return;
      return parentBlock.addTopBlock(type_)
    }

    const block = new BlockMesh(this, position_.x, position_.y,  position_.z, type_, parentName_);
    this.selectItem(block.name)
     // We keep the first block to clone it
    if(!this.firstBlock) this.firstBlock = block;

    return block;
  }

  /**
   * Generate a file on the map
   * @param {*} fileMeshData_ {fileData, fileType, fileName, description }
   * @param {*} options_ 
   * @returns Instance of the file mesh
   */
  addFile(fileMeshData_, options_){
    // return new FileMesh( this.scene, fileMeshData_, this, options_)
        let fileMesh = new FileMesh(this.scene, this,fileMeshData_,options_);

        let width = this.scene.getEngine().getRenderWidth();
        let height = this.scene.getEngine().getRenderHeight();
        let pickInfo = this.scene.pick(
          width / 2,
          height / 2,
          null,
          false,
          this.scene.cameras[0]
        );

        //Test if it's a block
        if (pickInfo.hit && pickInfo.pickedMesh) {
          if (pickInfo.pickedMesh.name.indexOf("wall") > -1) {
            let blockMeshPicked = this.getEnityFromDict(
              pickInfo.pickedMesh.name
            ); //BlockMesh
            fileMesh.setToWall(
              pickInfo.pickedPoint,
              null,
              blockMeshPicked,
              true,
              true
            );
          } else {
            let posSearch_ = this.searchFreeSpace();
            fileMesh.setToGround(posSearch_, true);
          }
        }
        this.selectItem(fileMesh.name);
        return fileMesh;
  }

  /**
   * Generate a Char on the map
   * @param {*} data_ {charName, accessory1, accessory2}
   * @returns Instance of the file mesh
   */
   addCharacter(data_){
    const charMesh = new CharMesh(this, data_)

    // If no position defined
    if(data_ == undefined || data_.position == undefined){
      if (this.selectorMeshItem && this.selectorMeshItem.visibility > 0) {
            charMesh.setToGround( {x:this.selectorMeshItem.position.x,
              y:this.selectorMeshItem.position.y + BLOCK_SIZE *0.5,
              z:this.selectorMeshItem.position.z}); 
          } else {
            charMesh.setToGround( {x:this.selectorMeshGround.position.x,
            y:0,
            z:this.selectorMeshGround.position.z}); 
          }
    }
    this.selectItem(charMesh.name);
    return charMesh;
  }

  deleteSelection(){
     //pick the selected mesh
     if (this.blockMeshSelected != undefined) {
      this.blockMeshSelected.delete();
      this.blockMeshSelected = null;
    } else if (this.fileMeshSelected != undefined) {
      this.fileMeshSelected.delete();
      this.fileMeshSelected = null;
    }
  }

  /**
   * Get the first positionof the player
   * @returns 
   */
  getPlayerFirstPosition() {
    const mapWidth = 16;
    const mapHeight = 17;
    let pos = new Vector3(); //Vector3
    pos.x = mapWidth * BLOCK_SIZE * 0.5;
    pos.z = mapHeight * BLOCK_SIZE * 0.5;
    return pos;
  }

  /**
   * Method to get the first player position (at the middle of the map)
   */
  getPlayerLegacyPosition(cam_) {
    /*
    this.mapService.getPlayer(
      (doc_) => {
        if (!doc_.posx || !doc_.posz) return;
        cam_.position.x = doc_.posx;
        cam_.position.y = doc_.posy;
        cam_.position.z = doc_.posz;
        if(doc_.roty && doc_.roty != undefined) cam_.rotation.y = doc_.roty;
      },
      (err_) => {
        console.warn("No legacy position", err_);
      }
    );*/
  }

  /**
   * Set the position of the player on the map, with the tile coordonates
   * @param {*} cam_ the camera value
   * @param {*} position_ ({x, y, z})
   * @param {*} dir_ direction 0 | 1 | 2 | 3
   */
  setPlayerPosition(cam_, position_, dir_ = 0){
    cam_.position.x = position_.x * BLOCK_SIZE;
    cam_.position.y = (position_.y * BLOCK_SIZE) +PLAYER_Y;
    cam_.position.z = position_.z * BLOCK_SIZE;
    cam_.rotation.y = (Math.PI / 2) * dir_ ;
  }

  addPlayerCollision(cam_) {
    //FreeCamera

    this.scene.registerBeforeRender(() => {
      if (this.boundElevator) {
        //Am I still on the elevator?
        if (
          cam_.position.x <
            this.boundElevator.mesh.position.x - BLOCK_SIZE * 0.5 ||
          cam_.position.x >
            this.boundElevator.mesh.position.x + BLOCK_SIZE * 0.5 ||
          cam_.position.z <
            this.boundElevator.mesh.position.z - BLOCK_SIZE * 0.5 ||
          cam_.position.z >
            this.boundElevator.mesh.position.z + BLOCK_SIZE * 0.5
        ) {
          //No delete the elevator ref!
          this.boundElevator = null;
          return;
        }
        cam_.position.y =
          this.boundElevator.mesh.position.y + BLOCK_SIZE * 0.5 + PLAYER_Y + PLAYER_Y* 0.25;
      }

      this.playerLegacyTimer++;
      if (this.playerLegacyTimer > this.playerLegacyFreq) {
        if(!this.isLoaded) return;

        if(cam_.position.y < -30){
          let posInit = this.getPlayerFirstPosition();
          posInit.y = 30;
          cam_.position = posInit;
        }

        /*
        this.mapService.setPlayer({
          posx: cam_.position.x,
          posy: cam_.position.y,
          posz: cam_.position.z,
          roty: cam_.rotation.y,
        });*/

        this.playerLegacyTimer = 0;
      }
    });

    //mesh Mesh
    cam_.onCollide = (mesh_) => {
      if (mesh_.name.indexOf("elevator") > -1) {
        if (this.boundElevator) return;
        //I am over the elevator
        if (mesh_.position.y + BLOCK_SIZE * 0.5 < cam_.position.y)
          this.boundElevator = this.getEnityFromDict(mesh_.name);
      } else {
        this.boundElevator = null;
      }
    };
  }

  /**
   * Get the block in front of you
   */

  /**
   * @param {FreeCamera} cam_
   */
  updateFrontBlock(cam_) {
    this.updateFrontBlockTimer--;
    if (this.updateFrontBlockTimer > 0) return;
    let pos = cam_.position; //Vector3
    let ray = cam_.getForwardRay().direction; //Vector3
    ray = ray.multiply(new Vector3(BLOCK_SIZE * 2, 0, BLOCK_SIZE * 2));
    let selectPos = pos.add(ray); //Vector3
    selectPos.y = 0;

    //update the ghost mesh
    this.moveSelectorMeshGround(selectPos);

    this.updateFrontBlockTimer = this.UPDATE_FRONT_BLOCK;
  }

  /**
   *
   * @param {Vector3} pos_
   */
  moveSelectorMeshGround(pos_) {
    let posID = Vector3.Zero();
    posID.x = Math.round(pos_.x / BLOCK_SIZE);
    posID.z = Math.round(pos_.z / BLOCK_SIZE);

    pos_.x = Math.round(pos_.x / BLOCK_SIZE) * BLOCK_SIZE;
    pos_.z = Math.round(pos_.z / BLOCK_SIZE) * BLOCK_SIZE;
    pos_.y = pos_.y + -BLOCK_SIZE * 0.5;

    //Is there a block here?
    let block = this.getBlockMeshFromDictByPlace(posID); //this.blockMeshDict["wall_block_"+posID.x+"_"+0+"_"+posID.z];
    if (block != null) {
      this.selectItem(block.name);
    } else {
      this.selectorMeshGround.position = pos_;
    }
  }

  /**
   * @param {EntityMesh} entityMesh
   */
  addEntityToDict(entityMesh_) {
    this.entityDict[entityMesh_.name] = entityMesh_;
  }

  getEnityFromDict(name_) {
    return this.entityDict[name_];
  }

  deleteEntityFromDict(name_) {
    this.entityDict[name_] = null;
  }


  /**
   *  Get a block mesh from a place coordonate
   * @param {Vector3} pos_
   */
  getBlockMeshFromDictByPlace(pos_) {
    if (
      this.entityDict["wall_block_" + pos_.x + "_" + 0 + "_" + pos_.z] !=
        undefined ||
      this.entityDict["wall_block_" + pos_.x + "_" + 0 + "_" + pos_.z] !=
        undefined
    ) {
      return this.entityDict[
        "wall_block_" + pos_.x + "_" + 0 + "_" + pos_.z
      ];
    } else if (
      this.entityDict["wall_door_" + pos_.x + "_" + 0 + "_" + pos_.z] !=
        undefined ||
      this.entityDict["wall_door_" + pos_.x + "_" + 0 + "_" + pos_.z] !=
        undefined
    ) {
      return this.entityDict["wall_door_" + pos_.x + "_" + 0 + "_" + pos_.z];
    } else if (
      this.entityDict["wall_elevator_" + pos_.x + "_" + 0 + "_" + pos_.z] !=
        undefined ||
      this.entityDict["wall_elevator_" + pos_.x + "_" + 0 + "_" + pos_.z] !=
        undefined
    ) {
      return this.entityDict[
        "wall_elevator_" + pos_.x + "_" + 0 + "_" + pos_.z
      ];
    }

    return null;
  }

  /* SELECTION MECHANISM */

  /**
   *
   * @param {string} name_
   */
  selectItem(name_) {

    this.fileMeshSelected = null;
    this.blockMeshSelected = null;

    let entitySelected = this.getEnityFromDict(name_);
    //console.log('selected '+name_, entitySelected);

    //Test if item
    if ( entitySelected != undefined) {
     
      //It's a block
      if(name_.indexOf('wall_') > -1){

        this.blockMeshSelected = entitySelected;
        this.selectorMeshGround.visibility = 0;
        this.selectorMeshItem.visibility = 1;
        this.selectorMeshItem.position = this.blockMeshSelected.mesh.position;
        this.selectorMeshItem.scaling = new Vector3(
          this.blockMeshSelected.mesh.scaling.x * 1.05,
          this.blockMeshSelected.mesh.scaling.y * 1.05,
          this.blockMeshSelected.mesh.scaling.z * 1.05
        );

      //it's a Canvas
      } else if(name_.indexOf('canvas_') > -1 || name_.indexOf('char_') > -1){

        this.fileMeshSelected = entitySelected;
        if (this.fileMeshSelected.mesh == undefined) return;
        this.selectorMeshGround.visibility = 0;
        this.selectorMeshItem.visibility = 1;
        this.selectorMeshItem.position = this.fileMeshSelected.mesh.position;
        if (this.fileMeshSelected.isGrounded) {
          this.selectorMeshItem.scaling = new Vector3(
            this.fileMeshSelected.mesh.scaling.x * 1.6,
            this.fileMeshSelected.mesh.scaling.y * 1.6,
            this.fileMeshSelected.mesh.scaling.z * 1.6
          );
        } else {
          this.selectorMeshItem.scaling = new Vector3(
            this.fileMeshSelected.mesh.scaling.x * 0.8,
            this.fileMeshSelected.mesh.scaling.y * 0.8,
            this.fileMeshSelected.mesh.scaling.z * 0.8
          );
        }
      }
      
    } else {
      this.selectorMeshGround.visibility = 1;
      this.selectorMeshItem.visibility = 0;
    }

    this.updateSelectedMeshToUI();
  }

  /**
   *
   * @param {Vector3} point
   * @param {Mesh} mesh
   */
  testCollisionWithMesh(point, mesh) {
    let rayon = BLOCK_SIZE * 0.5 * mesh.scaling.x;

    if (
      point.x >= mesh.position.x - rayon &&
      rayon + mesh.position.x >= point.x
    )
      return true;
    if (
      point.z >= mesh.position.z - rayon &&
      rayon + mesh.position.z >= point.z
    )
      return true;

    return false;
  }

  searchFreeSpace() {
    let newPos = Vector3.Zero();

    let frontPos = this.scene.cameras[0].getFrontPosition(BLOCK_SIZE * 0.5);
    console.log(this.scene.cameras[0].getFrontPosition(BLOCK_SIZE * 0.5));

    newPos.x = frontPos.x;
    newPos.z = frontPos.z;
    newPos.y = this.scene.cameras[0].position.y - PLAYER_Y;

    let varX = this.scene.cameras[0].cameraDirection.x % (BLOCK_SIZE * 0.5);
    let varZ = this.scene.cameras[0].cameraDirection.z % (BLOCK_SIZE * 0.5);

    return newPos;
  }

  /**
   * Return a list of all the map object as JSON
   * @returns mapObject[]
   */
  objectifyMap(){
    const mapObject = [];
    Object.values(this.entityDict).forEach(entity => {
      mapObject.push(entity.objectify())
    });

    console.log(JSON.stringify(mapObject));
    return mapObject;
  }

  /**
   * Parse the whole map file
   * @param {*} map 
   */
  parseMap(mapData_){
    mapData_.forEach( obj =>{
      switch(obj.class){
        case CLASS_BLOCK:
          BlockMesh.parse(this, obj)
          break;
        case CLASS_CHAR:
          CharMesh.parse(this, obj)
          break;
        case CLASS_FILE:
          FileMesh.parse(this.scene, this, obj)
          break;
      }
    })
  }

}
