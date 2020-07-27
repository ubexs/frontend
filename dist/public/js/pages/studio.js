var canvas = document.getElementById("renderCanvas"); // Get the canvas element 
        var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

        /******* Add the create scene function ******/
        var createScene = function () {
            // Create a basic BJS Scene object.
            var scene = new BABYLON.Scene(engine);

            // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
            var camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5,-10), scene);

            // Target the camera to scene origin.
            camera.setTarget(BABYLON.Vector3.Zero());

            // Attach the camera to the canvas.
            camera.attachControl(canvas, false);

            // Create a basic light, aiming 0,1,0 - meaning, to the sky.
            var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

            // Create a built-in "sphere" shape. 
            var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments:16, diameter:2}, scene);

            // Move the sphere upward 1/2 of its height.
            sphere.position.y = 1;

            // Create a built-in "ground" shape.
            var ground = BABYLON.MeshBuilder.CreateGround('ground1', {height:6, width:6, subdivisions: 2}, scene);

            // Return the created scene.
            return scene;
        }
        /******* End of the create scene function ******/    

        var scene = createScene(); //Call the createScene function

        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () { 
                scene.render();
        });

        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () { 
                engine.resize();
        });

        $(document).keypress(function(e) {
            // 119 = W
            // 97 = A
            // 115 = S
            // 100 = D
            console.log(scene.cameras[0]);
          });