import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  Color4,
  Mesh,
  StandardMaterial,
  Texture,
  HemisphericLight,
  ActionManager,
  ExecuteCodeAction,
  Tools,
  Axis,
} from "babylonjs";
import { BLOCK_SIZE } from './constants'
import { TEXTURE_GOUND_DEFAULT } from './textures';
import Map from "./map";

const PLAYER_HEIGHT = 4; // The player eyes height
const SPEED = 1;
const INTERTIA = 0.9;
const GRAVITY = -0.9;
const ANGULAR_SENSITIVITY = 0.005;

export default class Motor {
  
  map;
  camera;
  ground;

  constructor (canvas, subscribeToUIAction_, sendToUI_) {
    const engine = new Engine(canvas, true, null, false);
    const scene = new Scene(engine);
    this.setScene("",scene, "MapId", subscribeToUIAction_, sendToUI_);
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop( () => {
        scene.render();
    });
  }

  setScene(subFolder_ ,scene, mapId_, subscribeToUIAction_, sendToUI_){
    // We need a scene to create all our geometry and babylonjs items in
    scene.audioEnabled = false;
    const canvas = scene.getEngine().getRenderingCanvas();

    //Camera FPS
    this.map = new Map(subFolder_, scene, mapId_);
    this.camera = new FreeCamera(
      "freeCamera",
      //new Vector3(0, 5, 0),
      new Vector3(
        this.map.getPlayerFirstPosition().x,
        5,
        this.map.getPlayerFirstPosition().z
      ),
      scene
    );

    if(subscribeToUIAction_) subscribeToUIAction_((e_) => {
      map.handeUIAction(e_);
    });

    scene.gravity = new Vector3(0, GRAVITY, 0);
    
    this.map.handeSendToUI(sendToUI_);
    this.camera.attachControl(canvas);
  
    this.camera.applyGravity = true;
    this.camera.ellipsoid = new Vector3(2.5, PLAYER_HEIGHT, 2.5);
    this.camera.ellipsoidOffset = new Vector3(0, PLAYER_HEIGHT, 0);
    this.camera.checkCollisions = true;
    this.camera.sensibility = ANGULAR_SENSITIVITY;
    this.camera.speed = SPEED;
    this.camera.inertia = INTERTIA;
    //  this.addNewInputToCamera(camera, canvas);
    this.addRotation(this.camera, scene);

    let handleCameraUpdate = (evt_) => {
      this.map.updateFrontBlock(this.camera);
    };

    this.map.getPlayerLegacyPosition(this.camera);

    this.camera.onViewMatrixChangedObservable.add(handleCameraUpdate);
    this.map.addPlayerCollision(this.camera, scene);

    //Add sky
    scene.clearColor = new Color4(132 / 255, 197 / 255, 232 / 255, 1);
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
    this.ground = Mesh.CreateGround("ground", groundSize*BLOCK_SIZE, groundSize*BLOCK_SIZE, 2, scene);
    this.ground.checkCollisions = true;
    this.ground.position.y = -0.1;

    let mat = new StandardMaterial("matGround", scene);
    let texture = new Texture(
      TEXTURE_GOUND_DEFAULT,
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
    this.ground.material = mat;

    // Hemispheric light to enlight the scene
    let hLight = new HemisphericLight("hemi", new Vector3(0, 0.5, 0), scene);
    hLight.intensity = 1.35;
  }

  addRotation(camera_,  scene_){
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

  /*
  addNewInputToCamera( camera_, canvas ){

  //  New Input Management for Camera
    
    //First remove the default management.
    camera_.inputs.removeByType("FreeCameraKeyboardMoveInput");
    //camera_.inputs.removeByType("FreeCameraMouseInput");
    
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
                  // var posX = Math.sin(camera.rotation.y);
                  // var posZ = Math.cos(camera.rotation.y);
                  // camera.position.x -= posX * this.speed;
                  // camera.position.z -= posZ * this.speed;
                } else if (this.keysUp.indexOf(keyCode) !== -1) {
                  camera.position.addInPlace(camera.getDirection(Axis.Z).scale(this.speed));
                 // var posX = Math.sin(camera.rotation.y);
                  // var posZ = Math.cos(camera.rotation.y);
                 //  camera.position.x += posX * this.speed;
                  // camera.position.z += posZ * this.speed;
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
  }*/
}
