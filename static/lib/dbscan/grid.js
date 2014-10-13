
function Grid(rect, range){
	this._rect = rect;
	this._range = range;
	this.tick = $P(1.0,1.0);
	this.scale = $P(1.0,1.0);
	this.recalc();
}

Grid.prototype = {
	get range(){ return this._range; },
	set range(range){ this._range = range; this.recalc(); },

	get rect(){ return this._rect; },
	set rect(rect){ this._rect = rect; this.recalc(); },

	recalc : function(){
		this.scale.x = this.rect.dx / this.range.dx;
		this.scale.y = this.rect.dy / this.range.dy;
	},
	render : function(draw){
		var zero = this.toScreen($P(0.0,0.0)),
			one = this.toScreen(this.tick),
			dx = one.x - zero.x,
			dy = one.y - zero.y,

			topLeft = this.toScreen(this.range.topLeft),
			bottomRight = this.toScreen(this.range.bottomRight);

		draw.beginPath();
		
		var r = sortRange(zero.x, topLeft.x, bottomRight.x, dx),
			gx = this.range.left;

		for(var x = r.from; x <= r.to; x += r.delta){
			draw.moveTo(x, topLeft.y);
			draw.lineTo(x, bottomRight.y);

			draw.fillText(gx.toFixed(1), x+2, zero.y-2);
			gx += this.tick.x;
		}

		var r = sortRange(zero.y, topLeft.y, bottomRight.y, dy),
			gy = this.range.top;

		for(var y = r.from; y <= r.to; y += r.delta){
			draw.moveTo(topLeft.x, y);
			draw.lineTo(bottomRight.x, y);
			
			draw.fillText(gy.toFixed(1), zero.x+2, y-2);
			gy -= this.tick.y;
		}

		draw.stroke();
	},
	toScreen : function(p, r){
		r = r || new Point(0,0);
		r.x = (p.x - this._range.left) * this.scale.x + this._rect.left,
		r.y = (p.y - this._range.top) * this.scale.y + this._rect.top;
		return r;
	},
	fromScreen : function(p, r){
		r = r || new Point(0,0);
		r.x = (p.x - this._rect.left) / this.scale.x + this._range.left,
		r.y = (p.y - this._rect.top) / this.scale.y + this._range.top;
		return r;
	}
};