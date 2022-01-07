import { Engine, Scene } from "babylonjs";
import { initCanvas } from './index';

const canvas = document.getElementById("renderCanvas");
console.log(canvas);

initCanvas(canvas,
    (dataReceive) => {
        console.log("dataReceive", dataReceive)
    },
    (dataToSendMethod) => {
        console.log("dataToSendMethod", dataToSendMethod)
})