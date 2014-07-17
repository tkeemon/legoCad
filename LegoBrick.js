

/**
 * taken from: http://www.robertcailliau.eu/Lego/Dimensions/zMeasurements-en.xhtml
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
LegoBrick = function ( obj ) {
	
	//defaults
	var brickSizeX = obj.brickSizeX || 1;
	var brickSizeY = obj.brickSizeY || 1;
	var isThinPiece = obj.isThinPiece || false;
	var brickColor = obj.brickColor || 0xFF0000;
	var brickOpacity = obj.brickOpacity || 1;

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
	var brickMaterial = new THREE.MeshPhongMaterial({color: brickColor, transparent:true, opacity:brickOpacity })

	var brick = new THREE.Geometry();
	var transMat = new THREE.Matrix4();

	var base = new THREE.BoxGeometry(xLength,yLength,zLength);

	transMat.setPosition(new THREE.Vector3(transX,transY,transZ));
	console.log(transMat);
	
	brick.merge(base,transMat);
	
	
	for(var xx=0; xx<brickSizeX; xx++) {
		for(var yy=0; yy<brickSizeY; yy++) {
			var knob = new THREE.CylinderGeometry(knobRadius,knobRadius, zLength+knobHeight, 10, 10, false);
			
			// transMat.identity(); //needed???
			transMat.makeRotationX(Math.PI/2);
			var knobStartX = knobRadius+1.6;
			var knobStartY = knobRadius+1.6;

			transMat.setPosition(new THREE.Vector3(knobStartX+xx*xUnitLength,knobStartY+yy*yUnitLength,(zLength+knobHeight)/2));
			brick.merge(knob,transMat);

		}
	}
	var brickMesh = new THREE.Mesh(
		brick,
		brickMaterial
		);
	bricks.push(brickMesh);
	return brickMesh;

};
	