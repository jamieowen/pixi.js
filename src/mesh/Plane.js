var Mesh = require('./Mesh');

/**
 * The Plane allows you to draw a texture across several points and them manipulate these points
 *
 *```js
 * for (var i = 0; i < 20; i++) {
 *     points.push(new PIXI.Point(i * 50, 0));
 * };
 * var Plane = new PIXI.Plane(PIXI.Texture.fromImage("snake.png"), points);
 *  ```
 *
 * @class
 * @extends PIXI.mesh.Mesh
 * @memberof PIXI.m
 * @param {PIXI.Texture} texture esh- The texture to use on the Plane.
 * @param {int} segmentsX - The number ox x segments
 * @param {int} segmentsY - The number of y segments
 *
 */
function Plane(texture, segmentsX, segmentsY, opts )
{
	Mesh.call(this, texture);

	/**
	 * Tracker for if the Plane is ready to be drawn. Needed because Mesh ctor can
	 * call _onTextureUpdated which could call refresh too early.
	 *
	 * @member {boolean}
	 * @private
	 */
	this._ready = true;

	this.opts = opts || {};
	this.segmentsX =  segmentsX || 10;
	this.segmentsY = segmentsY || 10;

	this.drawMode = Mesh.DRAW_MODES.TRIANGLES;
	this.refresh();

}


// constructor
Plane.prototype = Object.create( Mesh.prototype );
Plane.prototype.constructor = Plane;
module.exports = Plane;

/**
 * Refreshes
 *
 */
Plane.prototype.refresh = function()
{
	var total = this.segmentsX * this.segmentsY;
	var verts = [];
	var colors = [];
	var uvs = [];
	var indices = [];
	var texture = this.texture;

	//  texture.width = 800 texture.width || 800;
	//   texture.height = 800//texture.height || 800;

	var tUvs = texture._uvs;
	var segmentsXSub = this.segmentsX - 1;
	var segmentsYSub = this.segmentsY - 1;
	var i;

	var meshWidth = this.opts.meshWidth || texture.width;
	var meshHeight = this.opts.meshHeight || texture.height;

	var sizeX = meshWidth / segmentsXSub;
	var sizeY = meshHeight / segmentsYSub;

	var texelX,texelY;
	if( tUvs ){
		texelX = ( texture._uvs.x1 - texture._uvs.x0 ) / segmentsXSub;
		texelY = ( texture._uvs.y2 - texture._uvs.y1 ) / segmentsYSub;
	}

	for (i = 0; i < total; i++) {

		var x = (i % this.segmentsX);
		var y = ( (i / this.segmentsX ) | 0 );
		verts.push((x * sizeX),
			(y * sizeY));

		if( !tUvs ){
			uvs.push(x / (this.segmentsX-1), y/ (this.segmentsY-1));
		}else{
			uvs.push(tUvs.x0 + ( texelX * x), tUvs.y0 + ( texelY * y) );
		}

	}

	//  cons

	var totalSub = segmentsXSub * segmentsYSub;

	for (i = 0; i < totalSub; i++) {

		var xpos = i % segmentsXSub;
		var ypos = (i / segmentsXSub ) | 0;

		var  value = (ypos * this.segmentsX) + xpos;
		var  value2 = (ypos * this.segmentsX) + xpos + 1;
		var  value3 = ((ypos+1) * this.segmentsX) + xpos;
		var  value4 = ((ypos+1) * this.segmentsX) + xpos + 1;

		indices.push(value, value2, value3);
		indices.push(value2, value4, value3);
	}


	//console.log(indices)
	this.vertices = new Float32Array(verts);
	this.uvs = new Float32Array(uvs);
	this.colors = new Float32Array(colors);
	this.indices = new Uint16Array(indices);
};

/**
 * Clear texture UVs when new texture is set
 *
 * @private
 */
Plane.prototype._onTextureUpdate = function ()
{
	PIXI.mesh.Mesh.prototype._onTextureUpdate.call(this);

	// wait for the Plane ctor to finish before calling refresh
	if (this._ready) {
		this.refresh();
	}
};