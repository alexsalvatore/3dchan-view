import TroisDchan, { BLOCK_SIZE } from './index';

const WALL_TYPE = 1;

const images = [
    "https://pbs.twimg.com/media/FSPo5ONaUAAOpYA?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FSPowdbVEAMFbwo?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FSHLBVgXIAAWny9?format=jpg&name=medium",
    "https://pbs.twimg.com/media/Cepl5UwWAAAU5av?format=jpg&name=small",
    "https://pbs.twimg.com/media/FSGfn7xXMAAl030?format=jpg&name=900x900",
    "https://pbs.twimg.com/media/FBbwRpgXMAMtCX1?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FSE6mTUakAE4zY5?format=jpg&name=900x900",
    "https://pbs.twimg.com/media/FR67XNGWQAA0dYk?format=jpg&name=medium",
    "https://pbs.twimg.com/media/FRzGATBWQAEyrS_?format=png&name=900x900",
    "https://pbs.twimg.com/media/FRoPXKQWQAIMd4X?format=jpg&name=900x900",
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
    fileData: "https://pbs.twimg.com/media/FQ5KDpSX0AMVutW?format=png&name=small",
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

/*
const mapSave = '[{"class":"block","x":0,"y":0,"z":0,"type":1},{"class":"block","x":0,"y":0,"z":1,"type":1},{"class":"block","x":0,"y":0,"z":3,"type":1},{"class":"block","x":0,"y":0,"z":5,"type":1},{"class":"block","x":0,"y":0,"z":6,"type":1},{"class":"block","x":0,"y":0,"z":7,"type":1},{"class":"block","x":0,"y":0,"z":8,"type":1},{"class":"block","x":0,"y":0,"z":9,"type":1},{"class":"block","x":0,"y":0,"z":10,"type":1},{"class":"block","x":0,"y":0,"z":11,"type":1},{"class":"block","x":0,"y":0,"z":12,"type":1},{"class":"block","x":0,"y":0,"z":13,"type":1},{"class":"block","x":1,"y":0,"z":0,"type":1},{"class":"block","x":1,"y":0,"z":2,"type":1},{"class":"character","name":"char_1652180129854","position":{"x":9,"y":0,"z":27}},{"class":"character","name":"char_1652180129856","position":{"x":9,"y":0,"z":54}},{"class":"block","x":1,"y":0,"z":13,"type":1},{"class":"block","x":2,"y":0,"z":0,"type":1},{"class":"character","name":"char_1652180129858","position":{"x":18,"y":0,"z":27}},{"class":"character","name":"char_1652180129860","position":{"x":18,"y":0,"z":36}},{"class":"character","name":"char_1652180129861","position":{"x":18,"y":0,"z":63}},{"class":"block","x":2,"y":0,"z":10,"type":1},{"class":"block","x":2,"y":1,"z":10,"type":1},{"class":"block","x":2,"y":2,"z":10,"type":1},{"class":"block","x":2,"y":3,"z":10,"type":1},{"class":"block","x":2,"y":4,"z":10,"type":1},{"class":"block","x":2,"y":0,"z":11,"type":1},{"class":"block","x":2,"y":1,"z":11,"type":1},{"class":"block","x":2,"y":2,"z":11,"type":1},{"class":"block","x":2,"y":3,"z":11,"type":1},{"class":"block","x":2,"y":4,"z":11,"type":1},{"class":"block","x":2,"y":0,"z":13,"type":1},{"class":"block","x":3,"y":0,"z":0,"type":1},{"class":"block","x":3,"y":0,"z":3,"type":1},{"class":"block","x":3,"y":1,"z":3,"type":1},{"class":"block","x":3,"y":0,"z":4,"type":1},{"class":"block","x":3,"y":1,"z":4,"type":1},{"class":"block","x":3,"y":0,"z":5,"type":1},{"class":"block","x":3,"y":1,"z":5,"type":1},{"class":"block","x":3,"y":0,"z":6,"type":1},{"class":"block","x":3,"y":1,"z":6,"type":1},{"class":"block","x":3,"y":2,"z":6,"type":1},{"class":"block","x":3,"y":0,"z":7,"type":1},{"class":"block","x":3,"y":1,"z":7,"type":1},{"class":"block","x":3,"y":2,"z":7,"type":1},{"class":"block","x":3,"y":0,"z":8,"type":1},{"class":"block","x":3,"y":1,"z":8,"type":1},{"class":"block","x":3,"y":2,"z":8,"type":1},{"class":"block","x":3,"y":0,"z":10,"type":1},{"class":"block","x":3,"y":1,"z":10,"type":1},{"class":"block","x":3,"y":2,"z":10,"type":1},{"class":"block","x":3,"y":3,"z":10,"type":1},{"class":"block","x":3,"y":4,"z":10,"type":1},{"class":"block","x":3,"y":0,"z":11,"type":1},{"class":"block","x":3,"y":1,"z":11,"type":1},{"class":"block","x":3,"y":2,"z":11,"type":1},{"class":"block","x":3,"y":3,"z":11,"type":1},{"class":"block","x":3,"y":4,"z":11,"type":1},{"class":"block","x":3,"y":5,"z":11,"type":1},{"class":"block","x":3,"y":6,"z":11,"type":1},{"class":"block","x":3,"y":7,"z":11,"type":1},{"class":"block","x":3,"y":8,"z":11,"type":1},{"class":"block","x":3,"y":0,"z":13,"type":1},{"class":"character","name":"char_1652180129879","position":{"x":36,"y":0,"z":0}},{"class":"block","x":4,"y":0,"z":2,"type":1},{"class":"block","x":4,"y":0,"z":3,"type":1},{"class":"block","x":4,"y":0,"z":4,"type":1},{"class":"block","x":4,"y":1,"z":4,"type":1},{"class":"block","x":4,"y":0,"z":5,"type":1},{"class":"block","x":4,"y":1,"z":5,"type":1},{"class":"block","x":4,"y":0,"z":6,"type":1},{"class":"block","x":4,"y":1,"z":6,"type":1},{"class":"block","x":4,"y":2,"z":6,"type":1},{"class":"block","x":4,"y":0,"z":7,"type":1},{"class":"block","x":4,"y":1,"z":7,"type":1},{"class":"block","x":4,"y":2,"z":7,"type":1},{"class":"block","x":4,"y":0,"z":8,"type":1},{"class":"block","x":4,"y":1,"z":8,"type":1},{"class":"block","x":4,"y":2,"z":8,"type":1},{"class":"block","x":4,"y":0,"z":10,"type":1},{"class":"block","x":4,"y":1,"z":10,"type":1},{"class":"block","x":4,"y":2,"z":10,"type":1},{"class":"block","x":4,"y":3,"z":10,"type":1},{"class":"block","x":4,"y":4,"z":10,"type":1},{"class":"block","x":4,"y":0,"z":11,"type":1},{"class":"block","x":4,"y":1,"z":11,"type":1},{"class":"block","x":4,"y":2,"z":11,"type":1},{"class":"block","x":4,"y":3,"z":11,"type":1},{"class":"block","x":4,"y":4,"z":11,"type":1},{"class":"block","x":4,"y":0,"z":13,"type":1},{"class":"block","x":5,"y":0,"z":0,"type":1},{"class":"block","x":5,"y":0,"z":3,"type":1},{"class":"block","x":5,"y":1,"z":3,"type":1},{"class":"block","x":5,"y":0,"z":4,"type":1},{"class":"block","x":5,"y":1,"z":4,"type":1},{"class":"block","x":5,"y":0,"z":5,"type":1},{"class":"block","x":5,"y":1,"z":5,"type":1},{"class":"block","x":5,"y":0,"z":6,"type":1},{"class":"block","x":5,"y":1,"z":6,"type":1},{"class":"block","x":5,"y":2,"z":6,"type":1},{"class":"block","x":5,"y":0,"z":7,"type":1},{"class":"block","x":5,"y":1,"z":7,"type":1},{"class":"block","x":5,"y":2,"z":7,"type":1},{"class":"block","x":5,"y":3,"z":7,"type":1},{"class":"block","x":5,"y":4,"z":7,"type":1},{"class":"block","x":5,"y":5,"z":7,"type":1},{"class":"block","x":5,"y":6,"z":7,"type":1},{"class":"block","x":5,"y":7,"z":7,"type":1},{"class":"block","x":5,"y":8,"z":7,"type":1},{"class":"block","x":5,"y":0,"z":8,"type":1},{"class":"block","x":5,"y":1,"z":8,"type":1},{"class":"block","x":5,"y":2,"z":8,"type":1},{"class":"character","name":"char_1652180129900","position":{"x":45,"y":0,"z":81}},{"class":"block","x":5,"y":0,"z":10,"type":1},{"class":"block","x":5,"y":1,"z":10,"type":1},{"class":"block","x":5,"y":2,"z":10,"type":1},{"class":"block","x":5,"y":3,"z":10,"type":1},{"class":"block","x":5,"y":4,"z":10,"type":1},{"class":"block","x":5,"y":0,"z":11,"type":1},{"class":"block","x":5,"y":1,"z":11,"type":1},{"class":"block","x":5,"y":2,"z":11,"type":1},{"class":"block","x":5,"y":3,"z":11,"type":1},{"class":"block","x":5,"y":4,"z":11,"type":1},{"class":"block","x":5,"y":0,"z":13,"type":1},{"class":"character","name":"char_1652180129907","position":{"x":54,"y":0,"z":9}},{"class":"block","x":6,"y":0,"z":3,"type":1},{"class":"block","x":6,"y":1,"z":3,"type":1},{"class":"block","x":6,"y":0,"z":4,"type":1},{"class":"block","x":6,"y":1,"z":4,"type":1},{"class":"block","x":6,"y":0,"z":5,"type":1},{"class":"block","x":6,"y":1,"z":5,"type":1},{"class":"block","x":6,"y":0,"z":6,"type":1},{"class":"block","x":6,"y":1,"z":6,"type":1},{"class":"block","x":6,"y":0,"z":8,"type":1},{"class":"block","x":6,"y":0,"z":9,"type":1},{"class":"block","x":6,"y":0,"z":10,"type":1},{"class":"block","x":6,"y":0,"z":11,"type":1},{"class":"block","x":6,"y":0,"z":12,"type":1},{"class":"block","x":6,"y":0,"z":13,"type":1},{"class":"block","x":7,"y":0,"z":0,"type":1},{"class":"character","name":"char_1652180129918","position":{"x":63,"y":0,"z":27}},{"class":"character","name":"char_1652180129923","position":{"x":63,"y":0,"z":72}},{"class":"block","x":7,"y":0,"z":13,"type":1},{"class":"block","x":8,"y":0,"z":0,"type":1},{"class":"character","name":"char_1652180129930","position":{"x":72,"y":0,"z":9}},{"class":"character","name":"char_1652180129933","position":{"x":72,"y":0,"z":90}},{"class":"character","name":"char_1652180129936","position":{"x":72,"y":0,"z":99}},{"class":"block","x":8,"y":0,"z":13,"type":1},{"class":"block","x":9,"y":0,"z":0,"type":1},{"class":"block","x":9,"y":0,"z":1,"type":1},{"class":"block","x":9,"y":0,"z":2,"type":1},{"class":"block","x":9,"y":0,"z":3,"type":1},{"class":"block","x":9,"y":0,"z":4,"type":1},{"class":"block","x":9,"y":1,"z":4,"type":1},{"class":"block","x":9,"y":2,"z":4,"type":1},{"class":"block","x":9,"y":3,"z":4,"type":1},{"class":"block","x":9,"y":4,"z":4,"type":1},{"class":"block","x":9,"y":5,"z":4,"type":1},{"class":"block","x":9,"y":6,"z":4,"type":1},{"class":"block","x":9,"y":7,"z":4,"type":1},{"class":"block","x":9,"y":8,"z":4,"type":1},{"class":"block","x":9,"y":0,"z":5,"type":1},{"class":"block","x":9,"y":0,"z":6,"type":1},{"class":"block","x":9,"y":0,"z":7,"type":1},{"class":"block","x":9,"y":0,"z":8,"type":1},{"class":"block","x":9,"y":0,"z":9,"type":1},{"class":"block","x":9,"y":0,"z":10,"type":1},{"class":"block","x":9,"y":0,"z":11,"type":1},{"class":"block","x":9,"y":0,"z":12,"type":1},{"class":"block","x":9,"y":0,"z":13,"type":1},{"class":"file","fileData":"https://pbs.twimg.com/media/FQ5KDpSX0AMVutW?format=png&name=small","fileType":"image/","fileName":"some file","description":"","isGrounded":true,"point":{"x":1,"y":0,"z":5},"block":{"position":{}},"size":1},{"class":"file","fileData":"https://pbs.twimg.com/media/FSPo5ONaUAAOpYA?format=jpg&name=medium","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":4.7,"y":4.5,"z":45}},"size":0.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FSPowdbVEAMFbwo?format=jpg&name=medium","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":22.7,"y":13.5,"z":90}},"size":1.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FSHLBVgXIAAWny9?format=jpg&name=medium","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":22.7,"y":31.5,"z":90}},"size":3.5},{"class":"file","fileData":"https://pbs.twimg.com/media/Cepl5UwWAAAU5av?format=jpg&name=small","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":81,"y":4.5,"z":31.3}},"size":0.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FSGfn7xXMAAl030?format=jpg&name=900x900","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":54,"y":4.5,"z":40.7}},"size":0.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FBbwRpgXMAMtCX1?format=jpg&name=medium","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":81,"y":4.5,"z":94.7}},"size":0.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FSE6mTUakAE4zY5?format=jpg&name=900x900","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":54,"y":4.5,"z":85.7}},"size":0.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FR67XNGWQAA0dYk?format=jpg&name=medium","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":4.7,"y":4.5,"z":117}},"size":0.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FRzGATBWQAEyrS_?format=png&name=900x900","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":18,"y":31.5,"z":103.7}},"size":3.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FRoPXKQWQAIMd4X?format=jpg&name=900x900","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":49.7,"y":40.5,"z":63}},"size":4.5},{"class":"file","fileData":"https://pbs.twimg.com/media/EKkQZmPVAAAzNEW?format=jpg&name=900x900","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":49.7,"y":4.5,"z":99}},"size":0.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FDiL_vSWQAEWPci?format=jpg&name=medium","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":45,"y":49.5,"z":67.7}},"size":5.5},{"class":"file","fileData":"https://pbs.twimg.com/media/FBbZVF5X0AIP9yk?format=jpg&name=medium","fileType":"image/","fileName":"some file","description":"","point":null,"block":{"position":{"x":40.7,"y":4.5,"z":27}},"size":0.5}]';
troisDchan.parseMap(
    JSON.parse(mapSave)
)*/

troisDchan.setPlayerPosition({x:4,y:0,z:-4}, 0);
console.log(troisDchan.objectifyMap());
