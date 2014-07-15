
/*global THREE, document, dat, window*/

var camera, scene, renderer;
var cameraControls, effectController;
var projector;
var clock = new THREE.Clock();

var clickPlaceBrickControls;

var viewSize;
var aspectRatio;

var planeSize = 100; //mm
var groundPlaneSize = 20;

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var bricks = []

function init() {

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

	camera.position.set(-450,-1000,350);
	camera.up.set(0,0,1);
	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera,renderer.domElement);

	cameraControls.target.set(80,80,0);


	//custom event listener
	renderer.domElement.addEventListener('mousedown',mouseDownPlaceBrick);
	//renderer.domElement.addEventListener('mouseup',mouseUpPlaceBrick);
	//renderer.domElement.addEventListener('mousemove',mouseMovePlaceBrick);

	projector = new THREE.Projector();

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
	//var groundPlane = new LegoBrick(20,20,true);
	var groundPlane = new LegoBrick({brickSizeX:20,brickSizeY:20,isThinPiece:true });

	groundPlane.position.z -= 3.1; //place top surface of brick at z=0
	scene.add(groundPlane);

	Coordinates.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50});
}

function printCameraData() {
	console.log("position(x,y,z)" + "(" + camera.position.x + "," + camera.position.y + "," + camera.position.z + ")");
	console.log("targed: " + camera.target);
	console.log("center: " + camera.center);
}

//Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
//COPIED--- NOT USED
function drawHelpers() {
	Coordinates.drawGround({size:10000});
	Coordinates.drawGrid({size:10000,scale:0.01});
	Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
	Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
	
}

//list bricks
function listAllObjects() {
	console.log('bricks:');
	for(var x=0; x<bricks.length; x++) {
		console.log(bricks[x]);
	}
}

function mouseDownPlaceBrick(event) {
	if(effectController.placeBrick) {
		event.preventDefault(); //doesnt prevent call to OrbitControls???
		
		console.log(event);

		var bx = Math.floor(effectController.brickSizeX);
		var by = Math.floor(effectController.brickSizeY);
		
		//listAllObjects();

		//finding object intersection
		var canvasPosition = renderer.domElement.getBoundingClientRect();
		var mouseX = event.clientX - canvasPosition.left;
		var mouseY = event.clientY - canvasPosition.top;
		var mouseVector = new THREE.Vector3(2 * ( mouseX / canvasWidth ) - 1,
											1 - 2 * ( mouseY / canvasHeight ));

	// debug: console.log( "client Y " + event.clientY + ", mouse Y " + mouseY );

		var raycaster = projector.pickingRay( mouseVector.clone(), camera );
		// console.log(raycaster.ray.origin);
		// console.log(raycaster.ray.direction);

		var intersects = raycaster.intersectObjects( bricks,true );
		// console.log('int');
		// console.log(intersects);
		// console.log(bricks.length);
		if ( intersects.length > 0 ) {
			//console.log('found obj: ' + intersects[0]);
			var pos = intersects[0].object.position;

			leg = new LegoBrick({brickSizeX:bx,brickSizeY:by,isThinPiece:effectController.brickThin});
			// console.log(pos);

			//TODO: need to translate into correct position
			//offset is half x,y and full knob height from registered click
			var offset = new THREE.Vector3(4,4,1.8);
			leg.position.set(pos.x-offset.x,pos.y-offset.y,pos.z-offset.z);
			scene.add(leg);
		}
	
	}
}

/*
function mouseMovePlaceBrick( event_info ) {
    if(!effectController.rotateCamera) {
		event_info.preventDefault();
	}
}

function mouseUpPlaceBrick( event_info ) {
	if(!effectController.rotateCamera) {
			event_info.preventDefault();
		}    
}
*/
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
		height:80,

		placeBrick:true,
		brickSizeX:1,
		brickSizeY:1,

		brickThin:false,
	};

	var gui = new dat.GUI();
	var f = gui.addFolder("Camera")
	f.add(effectController, "height", 1, 300).name("height");
	f = gui.addFolder("BrickInfo");
	f.add(effectController,"brickSizeX",1,10).name("brick size x");
	f.add(effectController,"brickSizeY",1,10).name("brick size y");
	f.add(effectController,"brickThin").name("Thin brick?");
	f.add(effectController,"placeBrick").name("Place Brick");
}
init();
setupGui();
animate();
