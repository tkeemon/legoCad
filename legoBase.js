////////////////////////////////////////////////////////////////////////////////
// Orthographic camera demo
////////////////////////////////////////////////////////////////////////////////

/*global THREE, document, dat, window*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();

var cylinder, sphere, cube;

//var bevelRadius = 1.9;	// TODO: 2.0 causes some geometry bug.
//var bevelRadius = 2.0;

var viewSize;
var aspectRatio;

var planeSize = 100; //mm
var groundPlaneSize = 20;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x808080,1.0);

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// CAMERA
	viewSize = 900;
	// aspect ratio of width of window divided by height of window
	aspectRatio = window.innerWidth/window.innerHeight;
	// OrthographicCamera( left, right, top, bottom, near, far )
	camera = new THREE.OrthographicCamera(
		-aspectRatio*viewSize / 2, aspectRatio*viewSize / 2,
		viewSize / 2, -viewSize / 2,
		-10000, 10000 );

	//(-449.13174881202895,-1029.086858129375,357.5586497691126)
//	camera.position.set( -890, -600, 480 );
	camera.position.set(-450,-1000,350);
	camera.up.set(0,0,1);
	// CONTROLS
	//cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement); //old
	cameraControls = new THREE.OrbitControls(camera,renderer.domElement);

	//cameraControls.target.set(0,0,0);	
	cameraControls.target.set(80,80,0);

	fillScene();
}

function fillScene() {
	scene = new THREE.Scene();

	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( -400, 200, -300 );

	scene.add( light );

	///////////////////////
	// GROUND

	// put grid lines every 10000/100 = 100 units

/*
	var solidGround = new THREE.Mesh(
		new THREE.PlaneGeometry( planeSize, planeSize ),
		new THREE.MeshPhongMaterial({ color: 0xFFFFFF,
			// polygonOffset moves the plane back from the eye a bit, so that the lines on top of
			// the grid do not have z-fighting with the grid:
			// Factor == 1 moves it back relative to the slope (more on-edge means move back farther)
			// Units == 4 is a fixed amount to move back, and 4 is usually a good value
			polygonOffset: true, polygonOffsetFactor: 1.0, polygonOffsetUnits: 4.0
		}));
	//solidGround.rotation.x = -Math.PI / 2;

	scene.add( solidGround );


	var ground = new THREE.Mesh(
		new THREE.PlaneGeometry( planeSize, planeSize, 10, 10 ),
		new THREE.MeshBasicMaterial( { color: 0x0, wireframe: true } ) );
	//ground.rotation.x = - Math.PI / 2;

	scene.add( ground );
*/	
	Coordinates.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50});
	

	//var leg1 = drawLego(6,10,true);
	//scene.add(leg1);

	var groundPlane = drawLego(20,20,true);
	groundPlane.position.z -= 3.1; //place top surface of brick at z=0
	scene.add(groundPlane);
}

/**
 * There are five basic dimensions:
		The horizontal pitch, or distance between knobs:  8mm.
		The vertical pitch, or height of a classic brick:  9.6mm.
		The horizontal tolerance:  0.1mm
		This is half the gap between bricks in the horizontal plane.  The horizontal tolerance prevents friction between bricks during building.
			The knob diameter:  4.8mm
		This is also the diameter of axles and holes.  Actually a knob must be slightly larger and an axle slightly smaller (4.85 and 4.75 respectively, otherwise axles would not turn in bearing holes and knobs would not stick in them) but we will ignore this difference here.
			The height of a knob:  1.8mm
 * [drawLego description]
 * 
 * @return {[type]} [description]
 */
function drawLego(brickSizeX,brickSizeY,isThinPiece) {
	//TODO: make lego brick into its own class
	// var brickSizeX = 6;
	// var brickSizeY = 10;

	//CONSTANTS
	var xUnitLength = 8; //length
	var yUnitLength = 8; //width
	var zUnitLength = isThinPiece ? 3.1 : 9.6; //height
	var brickGap = 0.1; //between bricks
	var knobRadius = 2.4;
	var knobHeight = 1.8;

	//calculated
	var xLength = brickSizeX*xUnitLength + 2*brickGap;
	var yLength = brickSizeY*yUnitLength + 2*brickGap;
	var zLength = zUnitLength;

	var transX = xLength/2;
	var transY = yLength/2;
	var transZ = zLength/2;

	//begin objects
	var brickMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000 })

	var brick = new THREE.Object3D();

	var base = new THREE.Mesh(
		new THREE.BoxGeometry(xLength,yLength,zLength),
		brickMaterial
		);
	base.position.set(transX,transY,transZ);
	brick.add(base);
	
	for(var xx=0; xx<brickSizeX; xx++) {
		for(var yy=0; yy<brickSizeY; yy++) {
			var knob = new THREE.Mesh(
				new THREE.CylinderGeometry(knobRadius,knobRadius, zLength+knobHeight, 10, 10, false),
				brickMaterial
				);
			knob.rotation.x = Math.PI/2;
			var knobStartX = knobRadius+1.6;
			var knobStartY = knobRadius+1.6;

			//knob.position.set(knobStartX,knobStartY,0);
			knob.position.set(knobStartX+xx*xUnitLength,knobStartY+yy*yUnitLength,(zLength+knobHeight)/2);
			brick.add(knob);

		}
	}

	//scene.add(brick);
	return brick;
}

function printCameraData() {
	console.log("position(x,y,z)" + "(" + camera.position.x + "," + camera.position.y + "," + camera.position.z + ")");
	console.log("targed: " + camera.target);
	console.log("center: " + camera.center);
}

//Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
//COPIED
function drawHelpers() {
	Coordinates.drawGround({size:10000});
	Coordinates.drawGrid({size:10000,scale:0.01});
	Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
	Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
	
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	viewSize = effectController.height;

	camera.left = -aspectRatio*viewSize / 2;
	camera.right = aspectRatio*viewSize / 2;
	camera.top = viewSize / 2;
	camera.bottom = -viewSize / 2;
	camera.updateProjectionMatrix();

	renderer.render(scene, camera);
}

function setupGui() {

	effectController = {
		height:80
	};

	var gui = new dat.GUI();
	gui.add(effectController, "height", 1, 300).name("height");
}
init();
setupGui();
animate();
