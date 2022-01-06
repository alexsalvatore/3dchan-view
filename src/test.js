import { Engine, Scene } from "babylonjs";
import { onSceneReady } from './index';
import { display3DInCanvas } from "./utils/test";

const canvas = document.getElementById("renderCanvas");
console.log(canvas);
/*
const engine = new Engine(canvas, true, null, false);
const scene = new Scene(engine);
onSceneReady("",scene, "MapId");*/

display3DInCanvas(canvas);