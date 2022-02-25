# 3Dchan NPM library
It's a javascript library to display and manage a 3Dchan's dungeon. The goal of 3Dchan is to provide a 3D abstraction layer for data's, especially images and users, in the web browser. It's important to aknowledge than this version is an alpha and than the next even minor versions will probably introduce some form of refactoring.

## Installation
```
npm i @asalvatore/troisdchan
```

## Usage
Import the library
```
import TroisDchan, { BLOCK_SIZE } from '@asalvatore/troisdchan';

// Get a canvas view where put the 3Dview inside
const canvas = document.getElementById("renderCanvas");

// Instantiate the lib
const troisDchan = new TroisDchan(canvas,
    (dataReceive) => {
        console.log("dataReceive", dataReceive)
    },
    (dataToSendMethod) => {
       console.log("dataToSendMethod", dataToSendMethod)
})
```

Add a Block
```
    // x, y , z are tile coordonate, they are automatically multiplied
    // by the block size inside of the library
    const x = 3;
    const z = 3;
    const y = 0;
    const block = troisDchan.addBlock(
        {x, y, z}, // position of the block
        1, // ID of the type of the block
        "" // name of the parent, if a name is provided we put it on top of it
        );
    // The method return the created block and you can get it name
    console.log(block.name)


    /*
    The list of the bloc types and IDs
    These value can be subject to changes
    BLOCK_CATALOG = [
        { id:1, name: "Concrete", type: BLOCK_TYPE_WALL, u: 0, v: 0 },
        { id:2, name: "Brick", type: BLOCK_TYPE_WALL, u: 2, v: 0 },
        { id:3, name: "Elevator", type: BLOCK_TYPE_ELEVATOR, u: 4, v: 0 }, // Elevator goes up and down
        { id:4, name: "Grass", type: BLOCK_TYPE_WALL, u: 0, v: 1 },
    ];
    */
```

Add art
```
    const fileMesh = troisDchan.addFile({
        fileData: "https://pbs.twimg.com/media/FKhh5iyVkAEQHd1?format=jpg&name=medium", // the URL or the base64
        fileType:"image/", // the type of the file
        fileName:"some file"
    });
    
    fileMesh.setToWall(
        block.position, 
        dir, // dir is optional (0 = north, 1 = east, 2 = south, 3 west)
        block); // the parent block
```

Add a characters at a position
```
    // X & y are tile coordonate, we mutiply them with the real size of a block
    // if position not provided Art or characters are added on the selected object or place on the ground
    const x = 1;
    const z = 1;
    troisDchan.addCharacter({ position: {x: x*BLOCK_SIZE , y:0 , z: z*BLOCK_SIZE}})
```

## Roadmap

- Method to place player (that's dumb bu it doesn't exist)
- Loading and saving the map as a JSON object
- deploy on 3Dchan.net and offering hosting to 3Dchanner
- Work on texture, to manage characters avatar
- Mobile control support (it's a real pain, I will probably need financial support for this one)
