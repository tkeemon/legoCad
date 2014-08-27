

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
THREE.LegoBrick = function ( obj ) {
	"use strict";

	THREE.Geometry.call( this );

	var scope = this;
	var brick = this;
	
	//defaults
	this.unitsLength = obj.unitsLength || 1;
	this.unitsWidth = obj.unitsWidth || 1;
	this.isThinPiece = obj.isThinPiece || false;
	this.isSmoothPiece = obj.isSmoothPiece || false;
	//var brickColor = obj.brickColor || 0xFF0000;
	//var brickOpacity = obj.brickOpacity || 1;
	this.brickRotation = obj.brickRotation || 0;
	//CONSTANTS
	var legoUnitLength = 8; 
	var zUnitLength = this.isThinPiece ? 3.2 : 9.6; //height
	var brickGap = 0.1; //between bricks
	var knobRadius = 2.4;
	var knobHeight = 1.8;


	//calculated
	this.length = this.unitsLength*legoUnitLength + 2*brickGap;
	this.width = this.unitsWidth*legoUnitLength + 2*brickGap;
	this.depth = zUnitLength;

	this.height = this.width; //not sure if THREE.js uses height for anything

	var transX = this.length/2;
	var transY = this.width/2;
	var transZ = this.depth/2;

	//begin objects
	//var brickMaterial = new THREE.MeshPhongMaterial({color: brickColor, transparent:true, opacity:brickOpacity })

	//var brick = new THREE.Geometry();
	var transMat = new THREE.Matrix4();

	var base = new THREE.BoxGeometry(this.length,this.width,this.depth);

	transMat.setPosition(new THREE.Vector3(transX,transY,transZ));
	brick.merge(base,transMat);
	
	//only add knobs if lego piece isn't defined as smooth
	if(!this.isSmoothPiece) {	
		
		for(var xx=0; xx<this.unitsLength; xx++) {
			for(var yy=0; yy<this.unitsWidth; yy++) {
				var knob = new THREE.CylinderGeometry(knobRadius,knobRadius, this.depth+knobHeight, 10, 10, false);
				
				// transMat.identity(); //needed???
				transMat.makeRotationX(Math.PI/2);
				var knobStartX = knobRadius+1.6;
				var knobStartY = knobRadius+1.6;

				transMat.setPosition(new THREE.Vector3(knobStartX+xx*legoUnitLength,knobStartY+yy*legoUnitLength,(this.depth+knobHeight)/2));
				brick.merge(knob,transMat);

			}
		}
	}
/*
	var brickMesh = new THREE.Mesh(
		brick,
		brickMaterial
		);
	//TODO - need to translate into correct position for rotation around correct location
	brickMesh.rotation.z = brickRotation*Math.PI/180;
	//bricks.push(brickMesh);
	return brickMesh;
*/

	// this.computeCentroids();
	// this.computeFaceNormals();
	this.mergeVertices();
};

THREE.LegoBrick.prototype = Object.create( THREE.Geometry.prototype );