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

  import {
    BLOCK_SIZE,
    CANVAS_SCALE,
  } from "../constants";

export default class EntityMesh{

    constructor(){
        
    }

    finishInit(){
        if(this.name == undefined) return console.error('EntityMesh as no name!');
        if(this.mapInstance == undefined) return console.error('EntityMesh as no map instance!');
        if(this.height == undefined){
            return console.error('EntityMesh as no height');
        }
         
        this.mapInstance.addEntityToDict(this);
    }

    /**
   * Move the canvas to a certain point of a wall
   * @param {Vector3} pos_ position where
   * @param {BlockMesh} block_ mesh of the wall block
   * @param  {boolean} forceMiddle force the picture to be at the middle of the wall
   */
  setToWall(pos_, block_, forceMiddle) {
    //Block size after scaling
    let blockRealSize = BLOCK_SIZE;
    //Are we at the top of a block?
    if (pos_.y >= BLOCK_SIZE * 0.49 + block_.y) {
      return this.setToGround(pos_);
    }

    if (this.isGrounded) {
      this.isGrounded = false;
    }

    this.mesh.scaling = new Vector3(
      CANVAS_SCALE * this.size * this.proportionW,
      CANVAS_SCALE * this.size * this.proportionH,
      CANVAS_SCALE * this.size
    );

    //Get the rotation  of the canvas
    let wBlock = blockRealSize;
    let dBlock = blockRealSize;
    let gap = 0.2; //Gap between the canvas and the block;

    if (
      pos_.z >= dBlock * 0.49 + block_.z &&
      pos_.x > -wBlock * 0.5 + block_.x &&
      pos_.x < wBlock * 0.5 + block_.x
    ) {
      //N
      pos_.z += gap;
      if (forceMiddle) {
        pos_.x = block_.x;
        pos_.y = blockRealSize * 0.5 + (block_.y - BLOCK_SIZE * 0.5); //+ (this.mesh._boundingInfo.minimum.y*0.5);
      }
      this.mesh.rotation.y = 180 * (Math.PI / 180);
      //console.log("N");
    } else if (
      pos_.x >= wBlock * 0.49 + block_.x &&
      pos_.z > -dBlock * 0.5 + block_.z &&
      pos_.z < dBlock * 0.5 + block_.z
    ) {
      //E
      pos_.x += gap;
      if (forceMiddle) {
        pos_.z = block_.z;
        pos_.y = blockRealSize * 0.5 + (block_.y - BLOCK_SIZE * 0.5); //+ (this.mesh._boundingInfo.maximum.y*0.5);
      }
      this.mesh.rotation.y = 270 * (Math.PI / 180);
      //console.log("E");
    } else if (
      pos_.z <= -dBlock * 0.49 + block_.z &&
      pos_.x > -wBlock * 0.5 + block_.x &&
      pos_.x < wBlock * 0.5 + block_.x
    ) {
      //S
      pos_.z -= gap;
      if (forceMiddle) {
        pos_.x = block_.x;
        console.log(this.mesh._boundingInfo);
        pos_.y = blockRealSize * 0.5 + (block_.y - BLOCK_SIZE * 0.5); //+ (this.mesh._boundingInfo.maximum.y*0.5);
      }
      this.mesh.rotation.y = 0;
      //console.log("S");
    } else if (
      pos_.x <= -wBlock * 0.49 + block_.x &&
      pos_.z > -dBlock * 0.5 + block_.z &&
      pos_.z < dBlock * 0.5 + block_.z
    ) {
      //W
      pos_.x -= gap;
      if (forceMiddle) {
        pos_.z = block_.z;
        pos_.y = blockRealSize * 0.5 + (block_.y - BLOCK_SIZE * 0.5); // + (this.mesh._boundingInfo.maximum.y*0.5);
      }
      this.mesh.rotation.y = 90 * (Math.PI / 180);
      //console.log("W");
    } else {
      //console.log("None");
    }

    this.mesh.position.x = pos_.x;
    this.mesh.position.z = pos_.z;
    this.mesh.position.y = pos_.y;
    //console.log(" this.mesh.position.y", this.mesh.position.y);

    this.posx = pos_.x;
    this.posy = pos_.y;
    this.posz = pos_.z;
    this.blockx = block_.x;
    this.blocky = block_.y;
    this.blockz = block_.z;

  }

  setToGround(point_) {

    if (!this.isGrounded) {
      this.isGrounded = true;
    }
    this.mesh.scaling = new Vector3(
      0.25 * this.proportionW,
      0.25 * this.proportionH,
      0.25
    );
    this.mesh.position.x = point_.x;
    this.mesh.position.y = point_.y + this.height * BLOCK_SIZE;
    this.mesh.position.z = point_.z;

    this.pointx = point_.x;
    this.pointy = point_.y;
    this.pointz = point_.z;

  }

    canDrag(){
       return true;
    }

    setPickable(val_) {
        if(this.mesh == undefined) return console.error('EntityMesh no mesh to drag');
        this.mesh.isPickable = val_;
    }

    delete() {
        if(this.mapInstance == undefined) return console.error('EntityMesh as no map instace!');
        this.mapInstance.mapService.deleteBlockOrCanvas(this.name);
        this.mesh.dispose();
        this.mapInstance.deleteEntityFromDict(this.name);
        delete this;
      }
}