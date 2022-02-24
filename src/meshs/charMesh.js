import {
    StandardMaterial,
    MeshBuilder,
    Mesh,
    Texture,
    Vector4,
  } from "babylonjs";
  import {
    BLOCK_SIZE,
  } from "../constants";
import EntityMesh from "./entityMesh";
import { facePoint } from '../utils/helpers';
//import { TEXTURE_CHAR } from '../constants';
import {TEXTURE_SPRITE} from '../textures';

export default class CharMesh extends EntityMesh{

    numSprites = 2;
    currentAnimationStartAt = 0;
    currentSprite = 0;
    intervalTime = 325;

    accessory1;
    accessory2;

    constructor(mapInstance_, npcData_){

        super();
        this.mapInstance = mapInstance_;

        this.name = (npcData_ != undefined &&  npcData_.id != undefined)? npcData_.id :  "char_" + Date.now().toString();
        this.charName = ( npcData_ && npcData_.charName )? npcData_.charName : null;
        this.accessory1 = (npcData_ != undefined )? npcData_.accessory1 : null;
        this.accessory2 = (npcData_ != undefined )? npcData_.accessory2 : null;
        this.height =  1;
        this.createSprite();
        this.updateCharStatus();
        this.interval = setInterval(() => {
           this.currentSprite ++;
           if(this.currentSprite >= this.numSprites) this.currentSprite = 0;
           this.updateAnimation();
            }, this.intervalTime);

        if(npcData_ != undefined ){
          this.setToGround({x: npcData_.position.x, y:npcData_.position.y, z:npcData_.position.z});
          //this.rotate(npcData_.rotz); 
        }
        this.finishInit();
    }

    createSprite(){

        let mat = new StandardMaterial("matSprite", this.mapInstance.scene);
        let textureSprite  = new Texture(
            TEXTURE_SPRITE,
            this.mapInstance.scene,
            false,
            false,
            Texture.NEAREST_SAMPLINGMODE,
            null,
            null
          );
        //textureSprite.uScale = -1;
        textureSprite.hasAlpha = true;
        mat.diffuseTexture = textureSprite;
        
        let mat2 = new StandardMaterial("matSprite2", this.mapInstance.scene);
        let textureSprite2  = new Texture(
              TEXTURE_SPRITE,
              this.mapInstance.scene,
              false,
              false,
              Texture.NEAREST_SAMPLINGMODE,
              null,
              null
            );
        textureSprite2.hasAlpha = true;
        mat2.diffuseTexture = textureSprite2;

        let mat3 = new StandardMaterial("matSprite2", this.mapInstance.scene);
        let textureSprite3  = new Texture(
              TEXTURE_SPRITE,
              this.mapInstance.scene,
              false,
              false,
              Texture.NEAREST_SAMPLINGMODE,
              null,
              null
            );
        textureSprite3.hasAlpha = true;
        mat3.diffuseTexture = textureSprite3;
       
      
        var f = new Vector4(0,0, 1, 1); // front image = half the whole image along the width 
        var b1 = new Vector4(0,1, 1, 2);

        this.mesh = new Mesh(this.name, this.scene);
        this.mesh.isPickable = true;

        this.meshSprite1 = MeshBuilder.CreatePlane(
            this.name,
            { size: BLOCK_SIZE, sideOrientation: Mesh.DOUBLESIDE, backUVs: b1 },
            this.scene);

        this.meshSprite2 = MeshBuilder.CreatePlane(
            this.name,
            { size: BLOCK_SIZE, sideOrientation: Mesh.DOUBLESIDE, backUVs: b1 },
            this.scene);
            mat2.diffuseTexture = textureSprite2;

        this.meshSprite3 = MeshBuilder.CreatePlane(
            this.name,
            { size: BLOCK_SIZE, sideOrientation: Mesh.DOUBLESIDE, backUVs: b1 },
            this.scene);
            mat3.diffuseTexture = textureSprite3;
        
       

        this.meshSprite1.material = mat;
        this.meshSprite1.parent = this.mesh;
        this.meshSprite1.material.zOffset = 1;
        this.meshSprite1.scaling.x =-1;

        this.meshSprite2.material = mat2;
        this.meshSprite2.parent = this.mesh;
        this.meshSprite2.material.zOffset = 0;
        this.meshSprite2.scaling.x =-1;
        if(this.accessory1  == null){
          this.meshSprite2.isVisible = false;
        }

        this.meshSprite3.material = mat3;
        this.meshSprite3.parent = this.mesh;
        this.meshSprite3.material.zOffset = 0;
        this.meshSprite3.scaling.x =-1;
        if( this.accessory2 == null){
          this.meshSprite3.isVisible = false;
        }

        this.mesh.rotation.z = Math.PI;
        this.rotz =  this.mesh.rotation.y;
        this.mesh.rotation.y = Math.PI*0.2;

        this.updateAnimation();
    }

    updateCharStatus(){
      /*if(!this.charName && !this.accessory1 && !this.accessory2){
        this.currentAnimationStartAt = 3;
      } else {*/
        this.currentAnimationStartAt = 0;
      //}
    }

    updateAnimation(){
      this.meshSprite1.material.diffuseTexture.vOffset = 16 / 16;
      this.meshSprite1.material.diffuseTexture.uOffset = (1/16) *this.currentSprite + (1/16) * this.currentAnimationStartAt;
      this.meshSprite1.material.diffuseTexture.uScale = 1 / 16;
      this.meshSprite1.material.diffuseTexture.vScale = 1 / 16;

      if(this.accessory1 != null){
        this.meshSprite2.material.diffuseTexture.vOffset = (2 + this.accessory1*2)/16;
        this.meshSprite2.material.diffuseTexture.uOffset = (1/16) *this.currentSprite;
        this.meshSprite2.material.diffuseTexture.uScale = 1 / 16;
        this.meshSprite2.material.diffuseTexture.vScale = 1 / 16;
      }

      if(this.accessory2 != null){
        this.meshSprite3.material.diffuseTexture.vOffset = (2 + this.accessory2*2)/16;
        this.meshSprite3.material.diffuseTexture.uOffset = (1/16) *this.currentSprite;
        this.meshSprite3.material.diffuseTexture.uScale = 1 / 16;
        this.meshSprite3.material.diffuseTexture.vScale = 1 / 16;
      }

      //Update rotation
      facePoint(this.mesh, this.mapInstance.scene.cameras[0].position);
    }

    /**
     * 
     * @param {*} pos_ 
     * @param {*} dir_ 
     * @param {*} block_ A Block
     * @param {*} forceMiddle 
     * @returns 
     */
    setToWall(pos_, dir_, block_, forceMiddle){
      
        //Is top block?
        if(pos_ == undefined || block_.getTopBlock == undefined) return

        if (pos_.y >= BLOCK_SIZE * 0.49 + block_.getTopBlock().position.y ) {
          return this.setToGround(pos_);
        }

    }
    
    updateAndSave( data_ ){
      // save in the DB
      /*this.mapInstance.mapService.saveNPC({
        ...data_,
        name: this.name,
      });*/

      //Update acessorries
      this.setAccessory(data_.accessory1, data_.accessory2);
      this.updateAnimation();

    }

    setAccessory(access1, access2){
      this.accessory1 = access1;
      this.accessory2 = access2;
      this.meshSprite2.isVisible = (this.accessory1)? true : false;
      this.meshSprite3.isVisible = (this.accessory2)? true : false;
    }

    setToGround(point_,) {
        this.mesh.position.x = point_.x ;
        this.mesh.position.y = point_.y + (BLOCK_SIZE * 0.5) ;
        this.mesh.position.z = point_.z ;
        this.pointx = point_.x;
        this.pointy = point_.y;
        this.pointz = point_.z;
    }

    save(){
      /*this.mapInstance.mapService.saveNPC({
          name: this.name,
          posx: this.pointx,
          posy: this.pointy,
          posz: this.pointz,
          rotz: this.rotz,
          accessory1: this.accessory1,
          accessory2: this.accessory2,
      });*/
    }

      
}