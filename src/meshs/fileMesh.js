import {
  Scene,
  StandardMaterial,
  Mesh,
  MeshBuilder,
  Texture,
  Vector3,
  Animation,
  VideoTexture,
} from "babylonjs";
import * as GUI from 'babylonjs-gui';
import { BLOCK_SIZE, CANVAS_SCALE, TEXTURE_ITEM_DEFAULT, TEXTURE_ITEM_MP3, TEXTURE_ITEM_WEB } from "../constants";
import { getTypeFromFile } from '../utils/helpers';
import EntityMesh from "./entityMesh";

export default class FileMesh  extends EntityMesh{
  size = 1;
  proportionW = 1;
  proportionH = 1;

  constructor(scene_, fileMeshData_, mapInstance_, options_) {

    super();

    this.fileData = fileMeshData_.fileData;
    this.fileType = fileMeshData_.fileType;
    this.fileName = fileMeshData_.fileName;
    this.description = (fileMeshData_.description)? fileMeshData_.description : '';

    this.height =  0.25;
    this.mapInstance = mapInstance_;
    this.scene = scene_;
    //this.targetPosition = Vector3.Zero();
    this.targetRotation = Vector3.Zero();

    this.name =
      options_ != undefined && options_.name
        ? options_.name
        : "canvas_" + Date.now().toString();

    this.size =
      options_ != undefined && options_.size != undefined ? options_.size : 1;
    this.makeCanvas();
    //this.mapInstance.addEntityToDict(this);
    this.finishInit();
  }

  makeCanvas() {

    let mat = new StandardMaterial("matCanvas", this.scene);
    let textureCanvas;

    //Is not a picture OR a video
    if(this.fileType.indexOf('image/') == -1 && this.fileType.indexOf('video/mp4') == -1){

      this.mesh = MeshBuilder.CreatePlane(
        this.name,
        { size: BLOCK_SIZE, sideOrientation: Mesh.DOUBLESIDE },
        this.scene,
      );
      this.mesh.isPickable = true;

      let textureAsset = TEXTURE_ITEM_DEFAULT;
      if( getTypeFromFile(this.fileName) === 'audio/'){
        textureAsset = TEXTURE_ITEM_MP3;
      } else if(getTypeFromFile(this.fileName) === 'web/'){
        textureAsset = TEXTURE_ITEM_WEB;
      }

      let mat2 = new StandardMaterial("matFileSprite2", this.mapInstance.scene);
      let textureSprite2  = new Texture(
            this.mapInstance.subFolder + textureAsset,
            this.mapInstance.scene,
            false,
            false,
            Texture.NEAREST_SAMPLINGMODE,
            null,
            null
          );
      //Add texture
      textureSprite2.hasAlpha = true;
      textureSprite2.vScale = -1;
      mat2.diffuseTexture = textureSprite2;
      this.mesh.material = mat2;

      // Make the name
      var rectLabel = new GUI.Rectangle();
      rectLabel.width = 1;
      rectLabel.thickness = 0;
      rectLabel.height = "40px";
      rectLabel.color = "#dcdcdc";
      rectLabel.fontFamily = "pixelmix";
      this.mapInstance.advancedTexture.addControl(rectLabel);

      var label = new GUI.TextBlock();
      label.text = this.fileName;
      rectLabel.addControl(label);
      rectLabel.linkWithMesh(this.mesh);   
      rectLabel.linkOffsetY = -50;

      return;

      //If vid or image
    } else {
      this.mesh = MeshBuilder.CreatePlane(
      this.name,
      { size: BLOCK_SIZE, sideOrientation: Mesh.DOUBLESIDE },
      this.scene);
      this.mesh.isPickable = true;

    //Get proportion of the image
    //Is image?
    if(this.fileType.indexOf('image') > -1){
      //if not it's an image
      let img = new Image();
      img.onload = () => {
        //alert(img.width + 'x' + img.height);
        if (img.width > img.height) {
          this.proportionH = img.height / img.width;
        } else {
          this.proportionW = img.width / img.height;
        }
        this.mesh.scaling = new Vector3(
          this.mesh.scaling.x * this.proportionW,
          this.mesh.scaling.y * this.proportionH,
          this.mesh.scaling.z
        );
        img.src = null;
        img = null;
      };
      img.src = this.fileData;
      textureCanvas = new Texture(
        this.fileData,
        this.scene,
        false,
        false,
        Texture.NEAREST_SAMPLINGMODE,
        null,
        null
      );
    } else {
      textureCanvas = new VideoTexture("video_"+ this.fileName, this.fileData, this.scene, true);
      //textureCanvas.video.muted = true;
      textureCanvas.video.currentTime = 1;
      //textureCanvas.video.autoplay= true;
      textureCanvas.vScale = -1;
    }}

    textureCanvas.uScale = -1;
    textureCanvas.hasAlpha = true;
    if(textureCanvas != undefined) mat.diffuseTexture = textureCanvas;
    this.mesh.material = mat;
    this.mesh.rotation.z = this.targetRotation.z = 180 * (Math.PI / 180);

  }

  setToWall(pos_, block_, forceMiddle){
   
    if (this.isGrounded) {
      if (this.animation != null){
        this.animation.stop();
        this.animation = null;
      }
    }
    super.setToWall(pos_, block_, forceMiddle);
   
  }

  setToGround(point_) {
    if (!this.isGrounded) {
      this.animate();
    }
    super.setToGround(point_);
  }

  animate() {
    const positionResolution = 4;
    var keysRot = [];
    keysRot.push({
      frame: 0,
      value: -Math.PI,
    });
    keysRot.push({
      frame: positionResolution - 1,
      value: Math.PI,
    });
    let itemRotation = new Animation(
      "cardRotation",
      "rotation.y",
      positionResolution / 2,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    itemRotation.setKeys(keysRot);
    this.animation = this.scene.beginDirectAnimation(
      this.mesh,
      [itemRotation],
      0,
      positionResolution,
      true
    );
  }

  updateAndSave( data_ ){
    this.fileData = data_.fileData;
    this.fileType = data_.fileType;
    this.fileName = data_.fileName;
    this.mapInstance.mapService.saveCanvas({
      name: this.name,
      fileData: this.fileData,
      fileType: this.fileType,
      fileName: this.fileName,
    });
  }

  save(){
    this.mapInstance.mapService.saveCanvas({
      fileData: this.fileData,
      fileType: this.fileType,
      fileName: this.fileName,
      description: this.description,
      name: this.name,
      groundx: this.pointx,
      groundy: this.pointy,
      groundz: this.pointz,
      posx: this.posx,
      posy: this.posy,
      posz: this.posz,
      blockx: this.blockx,
      blocky: this.blocky,
      blockz: this.blockz,
      isGrounded: this.isGrounded,
      size: this.size,
    });
  }

  setPickable(val_) {
    this.mesh.isPickable = val_;
  }

  upSize() {
    this.size *= 3;
    this.setSize();
  }

  downSize() {
    if (this.size > 1) {
      this.size /= 3;
      this.setSize();
    }
  }

  setSize() {
    this.mesh.scaling = new Vector3(
      CANVAS_SCALE * this.size,
      CANVAS_SCALE * this.size,
      CANVAS_SCALE * this.size
    );
    //this.mesh.position.y = BLOCK_SIZE * 0.5 * this.size;
    this.mapInstance.mapService.changeSize(this.mesh.name, this.size);
  }

  delete() {
    this.mapInstance.mapService.deleteBlockOrCanvas(this.name);
    this.mesh.dispose();
    this.mapInstance.deleteEntityFromDict(this.name);
    delete this;
  }
}
