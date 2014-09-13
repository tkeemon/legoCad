
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
var groundPlane;
var backgroundColor;

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

var bricks = [];
var tempBricks = [];
var selectedBricks = [];
var brickMap;
var brickIdCount = 1;

function init() {
	backgroundColor = 0x808080;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(backgroundColor,1.0);

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

	// camera.position.set(-450,-1000,350);
	camera.position.set(40,-10,30);
	camera.up.set(0,0,1);
	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera,renderer.domElement);
	cameraControls.target.set(80,80,0);

	//custom event listener
	//TODO- break into separate .js files
	renderer.domElement.addEventListener('mousedown',mouseDownPlaceBrick);
	renderer.domElement.addEventListener('mousemove',mouseMovePlaceBrick);

	renderer.domElement.addEventListener('mousedown',mouseDownSelectBrick);

	renderer.domElement.addEventListener('mousedown',mouseDownSetGroundPlaneHeight);

	window.addEventListener('resize',windowResizeListener,false);

	projector = new THREE.Projector();

	fillScene();
	initBrickMap();
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
	var groundPlaneGeometry = new THREE.LegoBrick({unitsLength:groundPlaneSize,unitsWidth:groundPlaneSize,isThinPiece:true });

	groundPlane = new THREE.Mesh(groundPlaneGeometry,
								new THREE.MeshPhongMaterial({color: 0xFF0000, transparent:true, opacity:1.0 }));
	groundPlane.position.z -= 3.2; //place top surface of brick at z=0
	scene.add(groundPlane);
	bricks.push(groundPlane);

	Coordinates.drawAllAxes({axisLength:100,axisRadius:1,axisTess:50});
}

function initBrickMap() {
	brickMap = new Array(groundPlaneSize);
	for(var x=0; x<groundPlaneSize; x++) {
		brickMap[x] = new Array(groundPlaneSize);
		for(var y=0; y<groundPlaneSize; y++) {
			brickMap[x][y] = new Array(1);
			brickMap[x][y][0] = 0;
		}
	}
}


function isValidBrickPosition(pos,brickVals) {
	var xStart, yStart, xDist, yDist;

	var zStart = Math.round(pos.z/3.2);
	var zDist = brickVals.isThinPiece ? 1 : 3;
	switch(brickVals.brickRotation) {
		case 0:
			xStart = pos.x/8;
			yStart = pos.y/8;
			xDist = brickVals.unitsLength;
			yDist = brickVals.unitsWidth;
			break;
		case 90:
			xStart = pos.x/8 - brickVals.unitsWidth + 1;
			yStart = pos.y/8;
			xDist = brickVals.unitsWidth;
			yDist = brickVals.unitsLength;
			break;
		case 180:
			xStart = pos.x/8 - brickVals.unitsLength + 1;
			yStart = pos.y/8 - brickVals.unitsWidth + 1;
			xDist = brickVals.unitsLength;
			yDist = brickVals.unitsWidth;
			break;
		case 270:
			xStart = pos.x/8;
			yStart = pos.y/8 - brickVals.unitsLength + 1;
			xDist = brickVals.unitsWidth;
			yDist = brickVals.unitsLength;
			break;
		default: 
			throw new Error('Could not determine brick rotation');
	}

	for(var x=0; x<xDist; x++) {
		for(var y=0; y<yDist; y++) {
			for(var z=0; z<zDist; z++) {
				if(brickMap[xStart+x][yStart+y][zStart+z] > 0) {
					return false;
				}
			}
		}
	}
	return true;
}

function updateBrickMap(pos,brickVals) {
	var xStart, yStart, xDist, yDist;

	var zStart = Math.round(pos.z/3.2);
	var zDist = brickVals.isThinPiece ? 1 : 3;
	switch(brickVals.brickRotation) {
		case 0:
			xStart = pos.x/8;
			yStart = pos.y/8;
			xDist = brickVals.unitsLength;
			yDist = brickVals.unitsWidth;
			break;
		case 90:
			xStart = pos.x/8 - brickVals.unitsWidth + 1;
			yStart = pos.y/8;
			xDist = brickVals.unitsWidth;
			yDist = brickVals.unitsLength;
			break;
		case 180:
			xStart = pos.x/8 - brickVals.unitsLength + 1;
			yStart = pos.y/8 - brickVals.unitsWidth + 1;
			xDist = brickVals.unitsLength;
			yDist = brickVals.unitsWidth;
			break;
		case 270:
			xStart = pos.x/8;
			yStart = pos.y/8 - brickVals.unitsLength + 1;
			xDist = brickVals.unitsWidth;
			yDist = brickVals.unitsLength;
			break;
		default: 
			throw new Error('Could not determine brick rotation');
	}

	for(var x=0; x<xDist; x++) {
		for(var y=0; y<yDist; y++) {
			for(var z=0; z<zDist; z++) {
				brickMap[xStart+x][yStart+y][zStart+z] = brickIdCount;
			}
		}
	}

	brickIdCount++;
}

function printCameraData() {
	console.log("position(x,y,z)" + "(" + camera.position.x + "," + camera.position.y + "," + camera.position.z + ")");
	console.log("targed: " + camera.target);
	console.log("center: " + camera.center);
}

//list bricks
function listParts() {
	console.log('num bricks: ' + bricks.length);
	console.log('bricks:');
	
	var partList = [];
	//start collecting at x=1 to skip groundplane
	//TDOO count and similar types of bricks
	//TODO (4,2) size brick = (2,4) size brick rotated 90deg
	for(var x=1; x<bricks.length; x++) {
		var b = bricks[x].geometry;

		var len1, len2, isSmooth, isThin;
		if(b.unitsLength>b.unitsWidth) {
			len1 = b.unitsLength;
			len2 = b.unitsWidth;
		}else {
			len1 = b.unitsWidth;
			len2 = b.unitsLength;
		}

		isSmooth = b.isSmoothPiece;
		isThin = b.isThinPiece;

		var dims = {length:len1,width:len2,smooth:isSmooth,thin:isThin};
		if(!partList[dims]) {
			partList[dims] = 0;
		}
		partList[dims]++;

	}

	return partList;
}

/**
 * return position of lego brick intersected
 * @param  {[type]} mx - mouseX from event 
 * @param  {[type]} my - mouseY from event
 * @return {[type]}    [description]
 */
function findIntersectingBrick(mx,my) {
	//finding object intersection
	var canvasPosition = renderer.domElement.getBoundingClientRect();
	var mouseX = mx - canvasPosition.left;
	var mouseY = my - canvasPosition.top;
	var mouseVector = new THREE.Vector3(2 * ( mouseX / canvasWidth ) - 1,
										1 - 2 * ( mouseY / canvasHeight ));

	// debug: console.log( "client Y " + event.clientY + ", mouse Y " + mouseY );

	var raycaster = projector.pickingRay( mouseVector.clone(), camera );
	// console.log(raycaster.ray.origin);
	// console.log(raycaster.ray.direction);

	var intersects = raycaster.intersectObjects( bricks,true );
	// console.log('int');
	// console.log(intersects.length);

	if ( intersects.length > 0 ) {
		// console.log('found obj: ' + intersects[0]);
		// console.log(intersects[0]);

		return intersects[0];
	}
	return undefined;
}

//should go in lego brick class
function calculateClosestBrickPosition(brick,vec) {
	//prevent adding a brick by clicking on the side of another
	var CLICK_THRESHOLD = .1;

	var e = brick.matrix.elements;
	var objPos = new THREE.Vector3(e[12],e[13],e[14]);
	var clickPos = vec;

	var legoUnitSize = 8;
	var xClickPos = clickPos.x/legoUnitSize;
	var yClickPos = clickPos.y/legoUnitSize;
	//finding brick offset
	var xBlockNum = Math.floor(xClickPos);
	var yBlockNum = Math.floor(yClickPos);

	//prevent clicking on side of previous brick
	// TODO: find a more efficient way of doing this
	if(Math.abs(xClickPos-xBlockNum) < CLICK_THRESHOLD ||
	   Math.abs(yClickPos-yBlockNum) < CLICK_THRESHOLD) {
		return undefined;
	}
	if(Math.abs(xClickPos-xBlockNum) > 1-CLICK_THRESHOLD ||
	   Math.abs(yClickPos-yBlockNum) > 1-CLICK_THRESHOLD) {
		return undefined;
	}

	//calculating 3d position based off of brick offset
	var pos = new THREE.Vector3(xBlockNum*legoUnitSize,yBlockNum*legoUnitSize,0);
	//setting z component above selected brick
	pos.z += (brick.geometry.depth + objPos.z);
	
	return pos;
}

function calculateBrickMatrix(brickPosition) {
		
		//RIGHT MULT - forward
		// TODO - make more efficient??
		//		mat.multiply(new THREE.Matrix().make...).multiply(new THREE...)...
		var mat = new THREE.Matrix4();
		mat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeTranslation(-4,-4,0),mat);
		mat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeRotationZ(effectController.brickRotation*Math.PI/180),mat);
		mat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeTranslation(4,4,0),mat);
		mat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeTranslation(brickPosition.x,brickPosition.y,brickPosition.z),mat);

		//for exploded view
		var transVec = new THREE.Vector3(
				(brickPosition.x/8)*(effectController.explodeXDist),
				(brickPosition.y/8)*(effectController.explodeYDist),
				(brickPosition.z/3.2)*(effectController.explodeZDist)
			);

		mat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().makeTranslation(transVec.x,transVec.y,transVec.z),mat);

		return mat;
}

//used by exploded view
function updateAllBrickPositions() {
	for(var x=1; x<bricks.length; x++) {
		var brick = bricks[x];
		
		//calculate 0 exploded position based on segment positions

		//take the 0 position from Mesh object
		var pos = brick.position;

		var newMat = calculateBrickMatrix(pos);

		brick.matrixAutoUpdate = false;
		brick.matrix.copy(newMat);
		brick.matrixWorldNeedsUpdate = true;
	}
}

function checkIfExploded() {
	return effectController.explodeAll > 0 ||
			effectController.explodeXDist > 0 ||
			effectController.explodeYDist > 0 ||
			effectController.explodeZDist > 0;						
}

function mouseDownPlaceBrick(event) {
	if(checkIfExploded()) {
		return;
	}
	//TODO - prevent/fix placing bricks when in exploded state
	if(effectController.mouseState == "Place Brick") {
		event.preventDefault(); //doesnt prevent call to OrbitControls???
		
		var bx = Math.floor(effectController.brickSizeX);
		var by = Math.floor(effectController.brickSizeY);
		
		var intersection = findIntersectingBrick(event.clientX,event.clientY);
		//if no intersection found
		if(!intersection)
			return;

		//cant add to the top of a smooth piece
		if(intersection.object.geometry.isSmoothPiece) 
			return;
		
		var pos = calculateClosestBrickPosition(intersection.object,intersection.point);
		if(!pos)
			return;

		var brickVals = {unitsLength:bx,
						 unitsWidth:by,
						 isThinPiece:effectController.brickThin,
						 isSmoothPiece:effectController.brickSmooth,
						 brickColor:effectController.brickColor,
						 brickRotation:effectController.brickRotation,
						};
		
		//if the brick doesn't fit cleanly
		if(!isValidBrickPosition(pos,brickVals)) 
			return;

		updateBrickMap(pos,brickVals);

		var brickGeometry = new THREE.LegoBrick(brickVals);

		var leg = new THREE.Mesh(brickGeometry,
						new THREE.MeshPhongMaterial({color: effectController.brickColor, transparent:false }));
		
		//set 0 position (to handle exploded view)
		leg.position = pos;

		//account for rotation
		var mat = calculateBrickMatrix(pos);

		leg.matrixAutoUpdate = false;
		leg.matrix.copy(mat);
		leg.matrixWorldNeedsUpdate = true;

		scene.add(leg);
	
		bricks.push(leg);
	}
}

function mouseMovePlaceBrick( event ) {
	while(tempBricks.length > 0) {
		var b = tempBricks.pop();
		scene.remove(b);
	}

    if(effectController.mouseState == "Place Brick") {
		event.preventDefault(); //doesnt prevent call to OrbitControls???
		
		var bx = Math.floor(effectController.brickSizeX);
		var by = Math.floor(effectController.brickSizeY);
		
		var intersection = findIntersectingBrick(event.clientX,event.clientY);
		//if no intersection found
		if(!intersection)
			return;

		//cant add to the top of a smooth piece
		if(intersection.object.geometry.isSmoothPiece) 
			return;
		
		var pos = calculateClosestBrickPosition(intersection.object,intersection.point);
		if(!pos)
			return;

		var brickVals = {unitsLength:bx,
						 unitsWidth:by,
						 isThinPiece:effectController.brickThin,
						 isSmoothPiece:effectController.brickSmooth,
						 brickColor:effectController.brickColor,
						 brickRotation:effectController.brickRotation,
						};

		//TODO - apply some sort of texture to transparent brick that can't be placed
		//if the brick doesn't fit cleanly
		// if(!isValidBrickPosition(pos,brickVals)) 
			// return;

		
		var brickGeometry = new THREE.LegoBrick(brickVals);

		var leg = new THREE.Mesh(brickGeometry,
						new THREE.MeshPhongMaterial({color: effectController.brickColor, transparent:true, opacity: .5 }));
		
		//account for rotation
		var mat = calculateBrickMatrix(pos);

		leg.matrixAutoUpdate = false;
		leg.matrix.copy(mat);
		leg.matrixWorldNeedsUpdate = true;

		scene.add(leg);
	
		tempBricks.push(leg);
	}
}

//change how bricks look when selected
function mouseDownSelectBrick(event) {

	if(effectController.mouseState == "Select Brick") {
		event.preventDefault(); //doesnt prevent call to OrbitControls???

		//remove previously selected blocks if CTRL key not held
		if(!event.ctrlKey) {
			while(selectedBricks.length > 0) {
				var b = selectedBricks.pop();
				b.material.opacity = .5;
			}
		}

		var intersection = findIntersectingBrick(event.clientX,event.clientY);
		//if no intersection found
		if(!intersection)
			return;
		
		var brick = intersection.object;
		if(brick==groundPlane)
			return; 
		
		brick.material.opacity = 1;

		selectedBricks.push(brick);
	}
}

function mouseDownSetGroundPlaneHeight(event) {
	if(effectController.mouseState == "Set Ground Plane Height") {
		var intersection = findIntersectingBrick(event.clientX,event.clientY);
		//if no intersection found
		if(!intersection)
			return;
		
		var pos = calculateClosestBrickPosition(intersection.object,intersection.point);

		var brick = intersection.object;
		if(brick==groundPlane) {
			return;
		}
		var newHeight = brick.matrix.elements[14];

		//update effectController and set groundPlane object's height
		effectController.groundPlaneHeight = Math.round((newHeight+3.2)/3.2) - 1;
		groundPlane.position.z = newHeight-3.2;
	}
}

function windowResizeListener(event) {
	console.log(event);
	renderer.setSize(window.innerWidth,window.innerHeight);
}

//just creates json string for now
function exportToJson() {
	var VERSION = '0.0.2';
	
	var jsonObj = {};
	jsonObj['version'] = VERSION;
	jsonObj['bricks'] = { numBricks:bricks.length-1 };

	//skip brick[0] -> the ground plane
	for(var i=1; i<bricks.length; i++) {
		var brick = bricks[i];
		var geom = brick.geometry;

		var brickName = "brick"+i;
		jsonObj['bricks'][brickName] = {
				"unitsLength": geom.unitsLength,
				"unitsWidth": geom.unitsWidth,
				"thin": geom.isThinPiece,
				"smooth":geom.isSmoothPiece,
				"rotation": geom.brickRotation,
				"color": brick.material.color,

				//in px coordinates. should this be in lego units??? (heights diff between thin/thick bricks)
				"position": new THREE.Vector3().setFromMatrixPosition(brick.matrix),
				"matrix": brick.matrix,
		};
	}

	return jsonObj;
}

//add specified bricks to scene from json
function importJson(jsonStr) {
	var VERSION = '0.0.2';
	var json;
	try {
		json = JSON.parse(jsonStr);
	}catch(e) {
		alert('Could not load JSON data. \nException:\n\t' + e);
		return;
	}

	if(json['version'] != VERSION) {
		console.log('JSON brick data incompatible. Expected version ' + 
			VERSION + ' but found version: ' + json['version']);
		return;
	}

	var jsonBricks = json['bricks'];
	var len = jsonBricks['numBricks'];
	for(var i=0; i<len; i++) {

		//TODO: find a better way of iterating over values
		var brickName = 'brick'+(i+1);
		// var brick = jsonBricks[brickName];
		var brick = jsonBricks[brickName];

		//TODO potentially use json 'brick' values directly
		var brickVals = {unitsLength:brick['unitsLength'],
						 unitsWidth:brick['unitsWidth'],
						 isThinPiece:brick['thin'],
						 isSmoothPiece:brick['smooth'],
						 // brickColor:brick['color'],
						 // brickRotation:brick['rotation'],
						};
		var colorObj = brick['color'];
		var brickColor = new THREE.Color(colorObj.r,colorObj.g,colorObj.b);

		var brickGeometry = new THREE.LegoBrick(brickVals);
		var leg = new THREE.Mesh(brickGeometry,
						new THREE.MeshPhongMaterial({color: brickColor, transparent:false }));

		//TODO find a better way of generating matrix
		var mat = new THREE.Matrix4();
		for(var x=0; x<16; x++) {
			mat.elements[x] = brick['matrix']['elements'][x];
		}
// 		mat.elements = brick['matrix'].elements;
		leg.matrixAutoUpdate = false;
		leg.matrix.copy(mat);
		leg.matrixWorldNeedsUpdate = true;

		scene.add(leg);
	
		bricks.push(leg);
	}

	return;

}

function clearBricks() {
	for(var i=0; i<bricks.length; i++) {
		var b = bricks[i];
		scene.remove(b);
	}

	bricks = [];
	scene.add(groundPlane);
	bricks.push(groundPlane);

	//clear then reinit brickMap
	brickMap = [];
	initBrickMap();
}

function setAllBrickOpacity(val) {
	//skip ground plane
	for(var x=1; x<bricks.length; x++) {
		var b = bricks[x];

		b.material.transparent = val<1 ? true : false;
		b.material.opacity = val;
	}
}

/*
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

	//calculate view size based on camera distance from target
	var diff = new THREE.Vector3().subVectors(camera.position,cameraControls.target);
	var dist = Math.sqrt(diff.x*diff.x + diff.y*diff.y + diff.z*diff.z);
	// console.log(dist);
	viewSize = dist;

	camera.left = -aspectRatio*viewSize / 2;
	camera.right = aspectRatio*viewSize / 2;
	camera.top = viewSize / 2;
	camera.bottom = -viewSize / 2;
	camera.updateProjectionMatrix();

	renderer.render(scene, camera);
}

//TODO update brickMap on change
//		TODO prevent moving out of bounds
//		TODO prevent bricks from overlapping
//	can all three be accomplished by updating brickMap???
function moveSelectedBrick(xDelta, yDelta, zDelta) {

	var disp = new THREE.Vector3(xDelta*8,yDelta*8,zDelta*3.2);
	for(var i=0; i<selectedBricks.length; i++) {
		var b = selectedBricks[i];
		var currentMatrix = b.matrix;

		var newMat = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().setPosition(disp), currentMatrix);

		b.matrixAutoUpdate = false;
		b.matrix.copy(newMat);
		b.matrixWorldNeedsUpdate = true;

		//update position
		var newPos = new THREE.Vector3();
		newPos.addVectors(b.position,disp);
		b.position = newPos;

	}
}

//TODO - reset effect controller back to what it used to be
//TOOD - make sure current value for effect controller doesn't affect rotation
function rotateSelectedBrick(deg) {

	for(var x=0; x<selectedBricks.length; x++) {
		var b = selectedBricks[x];
		var currentMatrix = b.matrix;

		effectController.brickRotation += deg;
		effectController.brickRotation %= 360;

		var newMat = calculateBrickMatrix(b.position);
		b.matrixAutoUpdate = false;
		b.matrix.copy(newMat);
		b.matrixWorldNeedsUpdate = true;
	}
}

function setupGui() {

	effectController = {
		mouseState:"Place Brick",

		groundPlaneHeight:0,
		groundPlaneVisible:true,
		groundPlaneOpacity:1.0,
		groundPlaneWireframe:false,
		groundPlaneColor:0xFF0000,

		wireframeAllBricks:false,
		backgroundColor:0x808080,

		brickSizeX:1,
		brickSizeY:1,

		brickThin:false,
		brickSmooth:false,
		brickColor:0x0000FF,
		brickRotation:0,

		explodeAll:0,
		explodeXDist:0,
		explodeYDist:0,
		explodeZDist:0,

		plusXPosition: function(){moveSelectedBrick(1,0,0);},
		minusXPosition: function(){moveSelectedBrick(-1,0,0);},
		plusYPosition: function(){moveSelectedBrick(0,1,0);},
		minusYPosition: function(){moveSelectedBrick(0,-1,0);},
		plusZPosition: function(){moveSelectedBrick(0,0,1);}, 
		minusZPosition: function(){moveSelectedBrick(0,0,-1);},
		rotationPlus90: function(){rotateSelectedBrick(90);},
		rotationMinus90: function(){rotateSelectedBrick(-90);},
		saveLabel:'',
		saveData:function() {
			var jsonStr = JSON.stringify(exportToJson());
			//console.log(jsonStr);
			effectController.saveLabel = jsonStr;
			//is it ok to use 'saveText' handle before it's defined
			saveText.updateDisplay();
		},

		loadLabel:'',
		loadData:function() {
			//TODO catch syntax exception, set alert box
			importJson(effectController.loadLabel);			
		},

		clearScene:function() {
			clearBricks();
		},
	};

	//default state for mouse control
	cameraControls.enabled = false;

	var gui = new dat.GUI();
	f = gui.addFolder("Mouse Control");
	var mouseControlHandle = f.add(effectController,"mouseState",
				["Place Brick","Select Brick","Rotate Camera", "Set Ground Plane Height"]).name("Mouse State");

	f = gui.addFolder("Ground Plane");
	var gpHeight = f.add(effectController,"groundPlaneHeight",0,30).step(1).name("Height").listen();
	var gpv = f.add(effectController,"groundPlaneVisible").name("Visible?");
	var gpt = f.add(effectController,"groundPlaneOpacity",0,1).name("Opacity"); 
	var gpwf = f.add(effectController,"groundPlaneWireframe").name("Wireframe?");
	var gpc = f.addColor(effectController,"groundPlaneColor").name("Color");

	f = gui.addFolder("Global");
	var wireFrameHandle = f.add(effectController,"wireframeAllBricks").name("Wireframe?");
	var backgroundColorHandle = f.addColor(effectController,"backgroundColor").name("Background Color");

	f = gui.addFolder("Brick Placement");
	// var placeBrickHandle = f.add(effectController,"placeBrick").name("Place Brick");
	var lengthHandle = f.add(effectController,"brickSizeX",1,10).step(1).name("Length");
	var widthHandle = f.add(effectController,"brickSizeY",1,10).step(1).name("Width");
	var rotateHandle = f.add(effectController,'brickRotation',0,270).step(90).name("Rotation (deg)");
	f.add(effectController,"brickThin").name("Thin brick?");
	f.add(effectController,"brickSmooth").name("Smooth top?");
	f.addColor(effectController,"brickColor").name("Color");

	f = gui.addFolder("Edit Brick");
	var plusXPositionHandle = f.add(effectController,"plusXPosition").name("+X");
	var minusXPositionHandle = f.add(effectController,"minusXPosition").name("-X");
	var plusYPositionHandle = f.add(effectController,"plusYPosition").name("+Y");
	var minusYPositionHandle = f.add(effectController,"minusYPosition").name("-Y");
	var plusZPositionHandle = f.add(effectController,"plusZPosition").name("+Z");
	var minusZPositionHandle = f.add(effectController,"minusZPosition").name("-Z");
	f.add(effectController,"rotationPlus90").name("Rotation +90 deg")
	f.add(effectController,"rotationMinus90").name("Rotation -90 deg")	
	var editColorHandle = f.addColor(effectController,"brickColor").name("Color");

	f = gui.addFolder("Exploded View");
	var expAll = f.add(effectController,'explodeAll',0,10).step(1).name("Distance (mm)");
	var expX = f.add(effectController,"explodeXDist",0,10).step(1).name("X Distance (mm)").listen();
	var expY = f.add(effectController,"explodeYDist",0,10).step(1).name("Y Distance (mm)").listen();
	var expZ = f.add(effectController,"explodeZDist",0,10).step(1).name("Z Distance (mm)").listen();

	f = gui.addFolder("Load Brick Data JSON");
	f.add(effectController,"loadLabel").name("JSON Data");
	f.add(effectController,"loadData").name("Load");

	f = gui.addFolder("Save Brick Data JSON");
	var saveButton = f.add(effectController,"saveData").name("Save");
	var saveText = f.add(effectController,"saveLabel").name("JSON Data");
		
	f = gui.addFolder("Clear Scene");
	f.add(effectController,"clearScene").name("Clear");

	mouseControlHandle.onChange(function(value) {
		
		if(value=="Place Brick") {
			cameraControls.enabled = false;
			setAllBrickOpacity(1);

		}else if(value=="Select Brick") {
			cameraControls.enabled = false;
			setAllBrickOpacity(.5);

		}else if(value=="Rotate Camera") {
			cameraControls.enabled = true;
			setAllBrickOpacity(1);

		}
	});

	//ground plane vis controls
	gpHeight.onChange(function(value) {
		groundPlane.position.z = (value-1)*3.2;
	});
	gpv.onChange(function(value) { //visibility
		groundPlane.visible = value;
	});
	gpt.onChange(function(value) { //transparancy
		groundPlane.material.opacity = value;
	});
	gpwf.onChange(function(value) {
		groundPlane.material.wireframe = value;
	});
	gpc.onChange(function(value) { //color
		groundPlane.material.color = new THREE.Color(value);
	});

	//global
	wireFrameHandle.onChange(function(value) {
		for(var x=1; x<bricks.length; x++) {
			bricks[x].material.wireframe = value;
		}
	});

	backgroundColorHandle.onChange(function(value) {
		renderer.setClearColor(value,1.0);
	});

	//length control
	lengthHandle.onChange(function(value) {
		effectController.brickSizeX = Math.floor(value);
	});

	widthHandle.onChange(function(value) {
		effectController.brickSizeY = Math.floor(value);
	});

	//rotation control
	rotateHandle.onChange(function(value) {
		//round down to nearest 90 deg
		effectController.brickRotation = Math.floor(value/90) * 90;
	});

	editColorHandle.onChange(function(value) {
		for(var x=0; x<selectedBricks.length; x++) {
			selectedBricks[x].material.color = new THREE.Color(value);
		}
	});

	//explosion control
	expAll.onChange(function(value) {
		effectController.explodeXDist = Math.floor(value);
		effectController.explodeYDist = Math.floor(value);
		effectController.explodeZDist = Math.floor(value);
		updateAllBrickPositions();
	});

	expX.onChange(function(value) {
		effectController.explodeXDist = Math.floor(value);
		updateAllBrickPositions();
	});

	expY.onChange(function(value) {
		effectController.explodeYDist = Math.floor(value);
		updateAllBrickPositions();
	});

	expZ.onChange(function(value) {
		effectController.explodeZDist = Math.floor(value);
		updateAllBrickPositions();
	});

}
init();
setupGui();
animate();
