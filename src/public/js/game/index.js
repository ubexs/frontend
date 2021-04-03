/**
 * Game Data
 */
const gamedata = document.getElementById('gamedata');
if (!gamedata) {
    window.location.href = "/game-error";
}
const gameId = parseInt(gamedata.getAttribute('data-gameid'), 10);
if (!gameId || isNaN(gameId)) {
    window.location.href = "/game-error";
}

/**
 * Global Babylon Vars
 */
BABYLON.OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY = false;
BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

function rotateVector(vect, quat) {
    var matr = new BABYLON.Matrix();
    quat.toRotationMatrix(matr);
    var rotatedvect = BABYLON.Vector3.TransformCoordinates(vect, matr);
    return rotatedvect;
}

window.addEventListener('DOMContentLoaded', function() {
    // Canvas
    var canvas = document.getElementById('renderCanvas');
    // Game Engine
    var engine = new BABYLON.Engine(canvas, true);
    // Create Scene
    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        // Use Right Handed (since I believe it's what blender uses)
        scene.useRightHandedSystem = true;

        var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        var physicsPlugin = new BABYLON.CannonJSPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);
        // Setup Player Camera
        var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4, Math.PI / 6, 45, new BABYLON.Vector3(0, 10, -10), scene);
        camera.maxZ = 100000;
        camera.angularSensibilityX = 2500;
        camera.angularSensibilityY = 2500;
        camera.panningSensibility = 2500;
        camera.checkCollisions = true;
        camera.wheelPrecision = 10;
        camera.useInputToRestoreState = true;

        camera.allowUpsideDown = false;
        // Attach the camera to the canvas.
        camera.attachControl(canvas, false);
        camera.useBouncingBehavior = false;
        camera.useAutoRotationBehavior = false;
        camera.useFramingBehavior = false;
    
        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 1.5;

        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("BackgroundSkybox", 2048, scene, undefined, BABYLON.Mesh.BACKSIDE);
    
        // Create and tweak the background material.
        var backgroundMaterial = new BABYLON.BackgroundMaterial("backgroundMaterial", scene);
        backgroundMaterial.reflectionTexture = new BABYLON.CubeTexture("https://ubexs_assets.storage.googleapis.com/TropicalSunnyDay", scene);
        backgroundMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skybox.material = backgroundMaterial;
    
        
        // ... \\
        // IMPORT MAP HERE

        fetch('/api/v1/game/'+gameId+'/map', {credentials: 'include'}).then((d) => {
            return d.text();
        }).then((d) => {
            Function(''+d+'')(scene);
        });

        // ... \\
    
        // Return the created scene.
        return scene;
    };
    var scene = createScene();
    engine.runRenderLoop(function() {
        scene.render();
    });
    window.addEventListener('resize', function() {
        engine.resize();
    });
});
