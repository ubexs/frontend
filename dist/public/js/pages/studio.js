"use strict";var canvas=document.getElementById("renderCanvas"),engine=new BABYLON.Engine(canvas,!0),createScene=function(){// Create a basic BJS Scene object.
var a=new BABYLON.Scene(engine),b=new BABYLON.FreeCamera("camera",new BABYLON.Vector3(0,5,-10),a);// Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
b.setTarget(BABYLON.Vector3.Zero()),b.attachControl(canvas,!1);// Create a basic light, aiming 0,1,0 - meaning, to the sky.
var c=new BABYLON.HemisphericLight("light1",new BABYLON.Vector3(0,1,0),a),d=BABYLON.MeshBuilder.CreateSphere("sphere",{segments:16,diameter:2},a);// Create a built-in "sphere" shape. 
d.position.y=1;// Create a built-in "ground" shape.
BABYLON.MeshBuilder.CreateGround("ground1",{height:6,width:6,subdivisions:2},a);// Return the created scene.
return a},scene=createScene();// Get the canvas element 
//Call the createScene function
// Register a render loop to repeatedly render the scene
// Watch for browser/canvas resize events
engine.runRenderLoop(function(){scene.render()}),window.addEventListener("resize",function(){engine.resize()}),$(document).keypress(function(){// 119 = W
// 97 = A
// 115 = S
// 100 = D
console.log(scene.cameras[0])});