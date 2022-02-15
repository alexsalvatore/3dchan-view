import Motor from './index';
import {
    BLOCK_SIZE
  } from "./constants";


const ELEVATOR_TYPE = 3;
const WALL_TYPE = 1;

const strats = []
const stratsRoom = []

const images = [
    "https://pbs.twimg.com/media/FKXXfqZXoAI8hnt?format=jpg&name=small",
    "https://pbs.twimg.com/media/FJb6dBqXoAEjGl1?format=jpg&name=small",
    "https://pbs.twimg.com/media/E1HB3zEWYAQiufM?format=jpg&name=small",
    "https://pbs.twimg.com/media/Cepl5UwWAAAU5av?format=jpg&name=small",
    "https://pbs.twimg.com/media/EuCVKgZWQAMuW-Q?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FGoIs-yUUAIvkGC?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FGhWsmwXMAoC0sf?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FGfYiJoVgAIaphP?format=jpg&name=small",
    "https://pbs.twimg.com/media/FGfQGtqXwAQcfFW?format=jpg&name=small",
    "https://pbs.twimg.com/media/FGPMRl2UUAAyATC?format=jpg&name=900x900",
    "https://pbs.twimg.com/media/EKkQZmPVAAAzNEW?format=jpg&name=900x900",
    "https://pbs.twimg.com/media/FDiL_vSWQAEWPci?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FBbZVF5X0AIP9yk?format=jpg&name=medium",
]

const dungeonMap = [
    [1,1,0,1,0,1,1,1,1,1,1,1,1,1,],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,5,5,0,1,],
    [1,0,0,2,2,2,3,3,3,0,5,9,0,1,],
    [0,0,1,1,2,2,3,3,3,0,5,5,0,1,],
    [1,0,0,2,2,2,3,9,3,0,5,5,0,1,],
    [0,0,0,2,2,2,2,0,1,1,1,1,1,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,1,1,1,9,1,1,1,1,1,1,1,1,1,],
]

const getValueForXZ = (x, z) =>{
    if( dungeonMap[x] != undefined &&  dungeonMap[x][z] != undefined) return dungeonMap[x][z]
    return 0;
}

const getMinAndMaxHeightAroundPoint = (x, z) =>{
    var max = 0;
    var min = 0;

    var pointToTest = getValueForXZ(x+1, z);
    console.log("getValueForXZ(x+1, z)", pointToTest);
    max = pointToTest;
    min = pointToTest;

    pointToTest = getValueForXZ(x+1, z+1);
    console.log("getValueForXZ(x+1, z)", pointToTest);
    if(pointToTest > max) max = pointToTest
    if(pointToTest < min) min = pointToTest

    pointToTest = getValueForXZ(x, z+1);
    console.log("getValueForXZ(x, z+1)", pointToTest);
    if(pointToTest > max) max = pointToTest
    if(pointToTest < min) min = pointToTest

    pointToTest = getValueForXZ(x-1, z);
    console.log("getValueForXZ(x-1, z)", pointToTest);
    if(pointToTest > max) max = pointToTest
    if(pointToTest < min) min = pointToTest

    pointToTest = getValueForXZ(x-1, z-1);
    console.log("getValueForXZ(x-1, z-1)", pointToTest);
    if(pointToTest > max) max = pointToTest
    if(pointToTest < min) min = pointToTest

    pointToTest = getValueForXZ(x, z-1);
    console.log("getValueForXZ(x, z-1)", pointToTest);
    if(pointToTest > max) max = pointToTest
    if(pointToTest < min) min = pointToTest

    return [min, max]
}


const createPile = (x,z,n) => {
    if(n < 1) return  [];
    let blocks = [];

    let [min, max] = [9,9]
    if(n == 9){
        [min, max] = getMinAndMaxHeightAroundPoint(x,z)
    }

    for (let y = 0; y < n; y++) {
        if(n == 9){
            console.log([min, max]);
            if(y < min){
                blocks.push( motor.addBlock(x, y, z, WALL_TYPE, blocks.length > 0 ? blocks[blocks.length-1].name : ""));
            } else if(y >= min && y < max){
                blocks.push( motor.addBlock(x, y, z, ELEVATOR_TYPE, blocks.length > 0 ? blocks[blocks.length-1].name : ""));
            }
        }else {
            blocks.push( motor.addBlock(x, y, z, WALL_TYPE, blocks.length > 0 ? blocks[blocks.length-1].name : ""));
        }
       
    }
    return blocks
}

let blocks = [];

const canvas = document.getElementById("renderCanvas");

const motor = new Motor(canvas,
    (dataReceive) => {
        console.log("dataReceive", dataReceive)
    },
    (dataToSendMethod) => {
        console.log("dataToSendMethod", dataToSendMethod)
})

let x = 0
let z = 0

const dungonWidth = dungeonMap.length;
const dungonHeight = dungeonMap[0].length;

for (x; x < dungonWidth; x++) {
    for (z; z < dungonHeight; z++) {
        if(dungeonMap[x][z] !== 0){
            blocks = [...blocks,...createPile(x,z, dungeonMap[x][z])]
        } else if(Math.floor(Math.random() * 10) > 7) {
            motor.addCharacter({name: `ch@r ${x}+${z}`  , posx: x*BLOCK_SIZE ,posy: 0, posz: z*BLOCK_SIZE})
        }
    }
    z = 0
}

let fileMesh1 = motor.addFile({
    fileData: "https://pbs.twimg.com/media/Dl8jZ-pVAAA8P8f?format=jpg&name=900x900",
    fileType:"image/",
    fileName:"some file"
});
fileMesh1.setToGround({x: 1, y:0, z:5});

for(let i = 0; i < images.length; i++){
    const numBlock = Math.floor(Math.random() * (blocks.length-1) )
    const dir = Math.floor(Math.random() * 3 )
    const block = blocks[numBlock]
    const fileMesh2 = motor.addFile({
        fileData: images[i],
        fileType:"image/",
        fileName:"some file"
    });
    
    fileMesh2.setToWall(block.position, dir, block.position);
    fileMesh2.setSize( block.position.y / BLOCK_SIZE )
}

