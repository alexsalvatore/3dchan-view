import Motor from './index';

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
let y = 0

let lastBlock;

for (x; x < 5; x++) {
    motor.addBlock(x, y, z, 0);
}

for (y; y < 5; y++) {
    lastBlock = motor.addBlock(x, y, z, 0);
}

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

fileMesh2.setToWall(lastBlock.position, lastBlock, true)
fileMesh2.upSize()
fileMesh2.upSize()

