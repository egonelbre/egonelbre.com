
Math.TAU = Math.PI*2;

function $P(x,y){ return new Point(x,y);}
function Point(x,y){
	this.x = x;
	this.y = y;
}

Point.prototype = {
	toString : function(){ 
		return "<" + this.x.toFixed(2) + ";" + this.y.toFixed(2) + ">"; 
	}
};

function $R(left, top, right, bottom){
	return new Rect(left, top, right, bottom);
}

function Rect(left, top, right, bottom){
	this.left = left;
	this.top = top;
	this.right = right;
	this.bottom = bottom;
}

Rect.prototype = {
	get width(){ return Math.abs(this.right - this.left); },
	get height(){ return Math.abs(this.bottom - this.top); },

	get dx(){ return this.right - this.left; },
	get dy(){ return this.bottom - this.top; },

	get topLeft(){ return new Point(this.left, this.top); },
	get bottomRight(){ return new Point(this.right, this.bottom); },

	intersect : function(rect){
		var left = this.left > other.left ? this.left : other.left,
			top = this.top > other.top ? this.top : other.top,
			right = this.right < other.right ? this.right : other.right,
			bottom = this.bottom < other.bottom ? this.bottom : other.bottom;
		return new Rect(left, top, right, bottom);
	}
};

function sortRange(zero, from, to, delta){
	if (from < to) {
		return {from:from, to:to, delta:Math.abs(delta)};
	} else {
		return {from:to, to:from, delta:Math.abs(delta)};
	}
}