import Motor from './index';
import {
    DIRECTION_NORTH,
    DIRECTION_EAST,
    DIRECTION_SOUTH,
    DIRECTION_WEST
  } from "./constants";
// import NewDungeon from "random-dungeon-generator"
import perlinNoise3d from 'perlin-noise-3d'

const createPile = (x,z,n) => {

    // if(n < 1) n = 0
    console.log(n)
    let lastBlock;
    for (let y = 0; y < n; y++) {
        lastBlock = motor.addBlock(x, y, z, 0);
    }
    return lastBlock
}

const n = new perlinNoise3d();
    n.noiseSeed(Math.PI);

const dungonWidth = 24;
const dungonHeight = 24;

const canvas = document.getElementById("renderCanvas");

const motor = new Motor(canvas,
    (dataReceive) => {
        console.log("dataReceive", dataReceive)
    },
    (dataToSendMethod) => {
        console.log("dataToSendMethod", dataToSendMethod)
})

let x = 32
let z = 32
let y = 0

let lastBlock;
for (x; x < dungonWidth; x++) {
    for (z; z < dungonHeight; z++) {
        // console.log(dungeon[x][z]);
        // if(dungeon[x][z] == 1){
            lastBlock = createPile(x,z, (n.get(x/10, z/10)*10) - 3 )
        // }
    }
    z = 0
}


/*
for (x; x < 5; x++) {
    motor.addBlock(x, y, z, 0);
}

for (y; y < 5; y++) {
    lastBlock = motor.addBlock(x, y, z, 0);
}*/

/*
let size = 20;
let output = [];
for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
        // lastBlock = motor.addBlock(x, y, z, 0);
        lastBlock = createPile(x,z, n.get(x/10, z/10)*10)
        // output.push({ x:x, y:y, value: n.get(x/10, y/10)});
    }
}
console.table(output);*/

let fileMesh1 = motor.addFile({
    fileData: "https://pbs.twimg.com/media/Dl8jZ-pVAAA8P8f?format=jpg&name=900x900",
    fileType:"image/",
    fileName:"some file"
});
fileMesh1.setToGround({x: 1, y:0, z:5});

let fileMesh2 = motor.addFile({
    fileData: "https://pbs.twimg.com/media/FJlTstCUYAAECME?format=jpg&name=small",
    fileType:"image/",
    fileName:"some file"
});

if(lastBlock != null){
    fileMesh2.setToWall(lastBlock.position, DIRECTION_WEST ,lastBlock.position)
    fileMesh2.upSize()
    fileMesh2.upSize()
}
