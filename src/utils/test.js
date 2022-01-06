import { Engine, Scene, SceneLoader, ArcRotateCamera, Vector3, HemisphericLight } from "babylonjs";

export const displayImageInCanvas = (canvas) =>{
    const ctx = canvas.getContext("2d");
    let img = new Image();
    img.onload = () => {       
        ctx.drawImage(img,0,0);
    }
    img.src = "https://pbs.twimg.com/media/FIGI6rIWYAIFbrj?format=jpg&name=900x900";
}

export const display3DInCanvas = (canvas) =>{
   
    const engine = new Engine(canvas, true);
    const scene = createScene(canvas, engine);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop( () => {
        scene.render();
    });
    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
            engine.resize();
    });
}

const createScene = (canvas, engine) => {
    const scene = new Scene(engine);  
    SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "box.babylon");

    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    const light = new HemisphericLight("light", new Vector3(1, 1, 0));
    return scene;
}