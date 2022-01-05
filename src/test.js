import { Engine, Scene } from "babylonjs";
import { onSceneReady } from './index';

const canvas = document.getElementById("renderCanvas");
console.log(canvas);

// Display an image
/*const ctx = canvas.getContext("2d");
let img = new Image();
img.onload = () => {       
    ctx.drawImage(img,0,0);
}
img.src = "https://pbs.twimg.com/media/FIGI6rIWYAIFbrj?format=jpg&name=900x900";
*/
const engine = new Engine(canvas, true, null, false);
const scene = new Scene(engine);
onSceneReady("",scene, "MapId");