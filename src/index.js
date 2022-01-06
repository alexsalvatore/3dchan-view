import {
  FreeCamera,
  Vector3,
  Mesh,
  StandardMaterial,
  Texture,
  HemisphericLight,
  CubeTexture,
  Color3,
  MeshBuilder,
  Tools,
  Axis,
  ActionManager,
  ExecuteCodeAction,
} from "babylonjs";
import { BLOCK_SIZE } from './constants'
import { TEXTURE_BLOCK_DEFAULT } from './textures';
import Map from "./map";

let camera;
let ground;

const PLAYER_HEIGHT = 4; // The player eyes height
const SPEED = 1;
const INTERTIA = 0.9;
const GRAVITY = -0.9;
const ANGULAR_SENSITIVITY = 0.005;

export const onSceneReady = (subFolder_ ,scene, mapId_, subscribeToUIAction_, sendToUI_) => {
  // We need a scene to create all our geometry and babylonjs items in
  scene.audioEnabled = false;
  const canvas = scene.getEngine().getRenderingCanvas();

  //Camera FPS
  let map = new Map(subFolder_, scene, mapId_);
  camera = new FreeCamera(
    "freeCamera",
    //new Vector3(0, 5, 0),
    new Vector3(
      map.getPlayerFirstPosition().x,
      5,
      map.getPlayerFirstPosition().z
    ),
    scene
  );

  if(subscribeToUIAction_) subscribeToUIAction_((e_) => {
    map.handeUIAction(e_);
  });

  map.handeSendToUI(sendToUI_);
  

  camera.attachControl(canvas);
  scene.gravity = new Vector3(0, GRAVITY, 0);
  camera.applyGravity = true;
  camera.ellipsoid = new Vector3(2.5, PLAYER_HEIGHT, 2.5);
  camera.ellipsoidOffset = new Vector3(0, PLAYER_HEIGHT, 0);
  camera.checkCollisions = true;
  camera.sensibility = ANGULAR_SENSITIVITY;
  camera.speed = SPEED;
  camera.inertia = INTERTIA;
  // addNewInputToCamera(camera, canvas);
  addRotation(camera, scene);

  let handleCameraUpdate = (evt_) => {
    map.updateFrontBlock(camera);
  };

  map.getPlayerLegacyPosition(camera);

  camera.onViewMatrixChangedObservable.add(handleCameraUpdate);
  map.addPlayerCollision(camera, scene);

//Add sky
//scene.clearColor = new Color4(132 / 255, 197 / 255, 232 / 255, 1);
/*var skybox = MeshBuilder.CreateBox("skyBox", {size: 10000}, scene);
var skyboxMaterial = new StandardMaterial("skyBox", scene);

skyboxMaterial.backFaceCulling = false;
skyboxMaterial.reflectionTexture = new CubeTexture(subFolder_+TEXTURE_SKYBOX_DEFAULT, scene);
skyboxMaterial.reflectionTexture.updateSamplingMode( Texture.NEAREST_NEAREST );
skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
skyboxMaterial.specularColor = new Color3(0, 0, 0);
skybox.material = skyboxMaterial;*/

  const groundSize = 100;
  //Add ground
  ground = Mesh.CreateGround("ground", groundSize*BLOCK_SIZE, groundSize*BLOCK_SIZE, 2, scene);
  ground.checkCollisions = true;
  ground.position.y = -0.1;

  let mat = new StandardMaterial("matGround", scene);
  let texture = new Texture(
    TEXTURE_BLOCK_DEFAULT,
    scene,
    true,
    true,
    Texture.NEAREST_NEAREST
  );
  
  texture.uScale = groundSize/3;
  texture.vScale = groundSize/3;
  /*
  var myMaterial = new BABYLON.StandardMaterial('barMaterial', scene)
  myMaterial.diffuseTexture = myTexture;
  myBar1.material = myBar2.material = myMaterial;*/


  mat.diffuseTexture = texture;
  ground.material = mat;

  // Hemispheric light to enlight the scene
  let hLight = new HemisphericLight("hemi", new Vector3(0, 0.5, 0), scene);
  hLight.intensity = 1.35;
};

/**
 * Render Loops
 */
export const onRender = (scene) => {
  
};


const addRotation = (camera_, scene_) => {

  camera_.keysLeft = [65]; //A
  camera_.keysRight = [65]; //Z
  let inputMap ={};
  
  scene_.actionManager = new ActionManager(scene_);
  scene_.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {								
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
  }));
  scene_.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {								
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
  }));

  scene_.onBeforeRenderObservable.add(()=>{
    if(inputMap["ArrowLeft"]){
      camera_.cameraRotation.y -= camera.sensibility;
    }  
    if(inputMap["ArrowRight"]){
      camera_.cameraRotation.y += camera.sensibility;
    }
  });
}

/**
 * Add rotation to the camera
 * @param {*} camera 
 */
const addNewInputToCamera = ( camera, canvas ) => {
  /* New Input Management for Camera
    __________________________________*/
    
    //First remove the default management.
    camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
    //camera.inputs.removeByType("FreeCameraMouseInput");
    
    //Add attachment controls
    //Key Input Manager To Use Keys to Move Forward and BackWard and Look to the Left or Right
    var FreeCameraKeyboardWalkInput = function () {
      this._keys = [];
      this.keysUp = [38];
      this.keysDown = [40];
      this.keysLeft = [37];
      this.keysRight = [39];
  }
  
  //Add attachment controls
  FreeCameraKeyboardWalkInput.prototype.attachControl = function (noPreventDefault) {
          var _this = this;
          var engine = this.camera.getEngine();
          var element = engine.getInputElement();
          if (!this._onKeyDown) {
              element.tabIndex = 1;
              this._onKeyDown = function (evt) {                 
                  if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                      _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                      _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                      _this.keysRight.indexOf(evt.keyCode) !== -1) {
                      var index = _this._keys.indexOf(evt.keyCode);
                      if (index === -1) {
                          _this._keys.push(evt.keyCode);
                      }
                      if (!noPreventDefault) {
                          evt.preventDefault();
                      }
                  }
              };
              this._onKeyUp = function (evt) {
                  if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                      _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                      _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                      _this.keysRight.indexOf(evt.keyCode) !== -1) {
                      var index = _this._keys.indexOf(evt.keyCode);
                      if (index >= 0) {
                          _this._keys.splice(index, 1);
                      }
                      if (!noPreventDefault) {
                          evt.preventDefault();
                      }
                  }
              };
              element.addEventListener("keydown", this._onKeyDown, false);
              element.addEventListener("keyup", this._onKeyUp, false);
          }
      };


        //Add detachment controls
         FreeCameraKeyboardWalkInput.prototype.detachControl = function () {
          var engine = this.camera.getEngine();
          var element = engine.getInputElement();
          if (this._onKeyDown) {
              element.removeEventListener("keydown", this._onKeyDown);
              element.removeEventListener("keyup", this._onKeyUp);
              Tools.UnregisterTopRootEvents([
                  { name: "blur", handler: this._onLostFocus }
              ]);
              this._keys = [];
              this._onKeyDown = null;
              this._onKeyUp = null;
          }
      };

        //Keys movement control by checking inputs
        FreeCameraKeyboardWalkInput.prototype.checkInputs = function () {
          if (this._onKeyDown) {
            var camera = this.camera;
            // Keyboard
            for (var index = 0; index < this._keys.length; index++) {
              var keyCode = this._keys[index];
              if (this.keysLeft.indexOf(keyCode) !== -1) {
                camera.cameraRotation.y -= this.sensibility;
              } else if (this.keysRight.indexOf(keyCode) !== -1) {
                camera.cameraRotation.y += this.sensibility;
              } else if (this.keysDown.indexOf(keyCode) !== -1) {
                camera.position.addInPlace(camera.getDirection(Axis.Z).scale(-this.speed));
                /*var posX = Math.sin(camera.rotation.y);
                var posZ = Math.cos(camera.rotation.y);
                camera.position.x -= posX * this.speed;
                camera.position.z -= posZ * this.speed;*/
              } else if (this.keysUp.indexOf(keyCode) !== -1) {
                camera.position.addInPlace(camera.getDirection(Axis.Z).scale(this.speed));
                /*var posX = Math.sin(camera.rotation.y);
                var posZ = Math.cos(camera.rotation.y);
                camera.position.x += posX * this.speed;
                camera.position.z += posZ * this.speed;*/
              }
            }
          }
        };

        //Add the onLostFocus function
        FreeCameraKeyboardWalkInput.prototype._onLostFocus = function (e) {
            this._keys = [];
        };
        
        //Add the two required functions for the control Name
        FreeCameraKeyboardWalkInput.prototype.getClassName = function () {
            return "FreeCameraKeyboardWalkInput";
        };

        FreeCameraKeyboardWalkInput.prototype.getSimpleName = function () {
            return "keyboard";
        };
    
    //Add the new keys input manager to the camera.
     camera.inputs.add(new FreeCameraKeyboardWalkInput());
};
