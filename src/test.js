import TroisDchan, { BLOCK_SIZE } from './index';

const WALL_TYPE = 1;

const images = [
    "https://pbs.twimg.com/media/FSdp2VoVsAU9Ykz?format=jpg&name=small",
    "https://pbs.twimg.com/media/FSPowdbVEAMFbwo?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FSGIinWWYAEn6_G?format=jpg&name=medium",
]

const dungeonMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
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
    fileData: "https://pbs.twimg.com/media/FSfFsyvXMAMU-BP?format=jpg&name=medium",
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

    fileMesh2.setToWall(null, dir, block);
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

/*
const mapSave = '';
troisDchan.parseMap(
    JSON.parse(mapSave)
)
console.log(troisDchan.objectifyMap());
*/

troisDchan.setPlayerPosition({x:4,y:0,z:4}, 0);
console.log(troisDchan.objectifyMap());
