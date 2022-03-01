import TroisDchan, { BLOCK_SIZE } from './index';

const WALL_TYPE = 1;

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

const createPile = (x,z,n) => {
    if(n < 1) return  [];
    let blocks = [];
    for (let y = 0; y < n; y++) {
        blocks.push( troisDchan.addBlock({x, y, z}, WALL_TYPE, blocks.length > 0 ? blocks[blocks.length-1].name : ""));
    }
    return blocks
}

let blocks = [];

// Set full screen
const canvas = document.getElementById("renderCanvas");


const troisDchan = new TroisDchan(canvas,
    (dataReceive) => {
        // console.log("dataReceive", dataReceive)
    },
    (dataToSendMethod) => {
       // console.log("dataToSendMethod", dataToSendMethod)
})
troisDchan.setFullScreen();
troisDchan.addFPSCamera();

let x = 0
let z = 0

const dungonWidth = dungeonMap.length;
const dungonHeight = dungeonMap[0].length;

for (x; x < dungonWidth; x++) {
    for (z; z < dungonHeight; z++) {
        if(dungeonMap[x][z] !== 0){
            blocks = [...blocks,...createPile(x,z, dungeonMap[x][z])]
        } else if(Math.floor(Math.random() * 10) > 7) {
            troisDchan.addCharacter({ position: {x: x*BLOCK_SIZE , y:0 , z: z*BLOCK_SIZE}})
        }
    }
    z = 0
}

let fileMesh1 = troisDchan.addFile({
    fileData: "https://pbs.twimg.com/media/Dl8jZ-pVAAA8P8f?format=jpg&name=900x900",
    fileType:"image/",
    fileName:"some file"
});
fileMesh1.setToGround({x: 1, y:0, z:5});

for(let i = 0; i < images.length; i++){
    const numBlock = Math.floor(Math.random() * (blocks.length-1) )
    const dir = Math.floor(Math.random() * 3 )
    const block = blocks[numBlock]
    const fileMesh2 = troisDchan.addFile({
        fileData: images[i],
        fileType:"image/",
        fileName:"some file"
    });
    
    fileMesh2.setToWall(block.position, dir, block);
    fileMesh2.setSize( block.position.y / BLOCK_SIZE )
}

// Create controls
const btnAddBlock = document.getElementById("btnBlock");
btnAddBlock.addEventListener('click', event => {
    troisDchan.addBlock(null, WALL_TYPE, null);
});

const btnDel = document.getElementById("btnDel");
btnDel.addEventListener('click', event => {
    troisDchan.deleteSelection()
});

const btnCam = document.getElementById("btnCam");
btnCam.addEventListener('click', event => {
    troisDchan.changeCam()
});

const btnAddArt = document.getElementById("btnArt");
btnAddArt.addEventListener('click', event => {
    const inputUrl = document.getElementById("inputURL");
    troisDchan.addFile({
        fileData: inputUrl.value,
        fileType:"image/",
        fileName:""
    });
});

const btnAddChar = document.getElementById("btnChar");
btnAddChar.addEventListener('click', event => {
    troisDchan.addCharacter({});
});


troisDchan.setPlayerPosition({x:4,y:0,z:-4}, 0);
