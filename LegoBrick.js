

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
	var brickSizeX = obj.brickSizeX|1;
	var brickSizeY = obj.brickSizeY|1;
	var isThinPiece = obj.isThinPiece|false;
	var brickColor = obj.brickColor | 0xFF0000;

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
	var brickMaterial = new THREE.MeshPhongMaterial({color: brickColor })

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

			knob.position.set(knobStartX+xx*xUnitLength,knobStartY+yy*yUnitLength,(zLength+knobHeight)/2);
			brick.add(knob);

		}
	}
	bricks.push(brick);

	return brick;

};
	