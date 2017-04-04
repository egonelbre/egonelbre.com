+++
date = "2013-03-02T12:00:00+03:00"
title = "Pendulum"
tags = ["js", "game", "physics", "experiment"]
+++

Physics simulation with an elastic band. Press Ctrl+R after centered on the screen.

<!--more-->
<canvas id="view"></canvas>

<script>
TAU = Math.PI*2;
SCREEN = {x: 800, y: 640};

canvas = document.getElementById("view");
canvas.width = 800;
canvas.height = 640;
ctx = canvas.getContext("2d");

mouse = {
	pos : {x:SCREEN.x/2, y:SCREEN.y/2},
	size : 4,
	draw: function(ctx){
		ctx.fillStyle = "#f00";
		ctx.strokeStyle = "#ccc";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, TAU, 0);
		ctx.fill();
		ctx.stroke();
	}
};

canvas.onmousemove = function(e){
	mouse.pos = { 
		x: e.clientX - canvas.offsetLeft,	
		y: e.clientY - canvas.offsetTop
	};
};

gravity = -300;
points = 0;

ball = {
	pos : {x:SCREEN.x/2, y:SCREEN.y/2},
	speed : {x: 0, y: 0},
	controller : mouse,
	size : 10,
	weight : 2,
	tension : 0,
	draw : function(ctx){
		ctx.lineWidth = 10;

		if(this.controller){
			ctx.fillStyle = "#fff";
			ctx.strokeStyle = "hsla(" + 
				((Math.exp(-this.tension/2000)*120)|0) + 
				", 70%, 60%, 1.0)";
			ctx.beginPath();
			ctx.moveTo(this.pos.x, this.pos.y);
			ctx.lineTo(this.controller.pos.x, this.controller.pos.y);
			ctx.stroke();
		}

		ctx.lineWidth = 4;
		ctx.fillStyle = "#cfc";
		ctx.strokeStyle = "#ccc";
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.size, 0, TAU, 0);
		ctx.fill();
		ctx.stroke();
	},
	update : function(dt){
		var f = { x: 0, y: -this.weight * gravity};

		this.tension = 0;
		if(this.controller){
			var dx = this.pos.x - this.controller.pos.x,
				dy = this.pos.y - this.controller.pos.y,
				dist = Math.sqrt(dx*dx + dy*dy),
				diff = Math.max(dist - 10, 0);

			this.tension = diff*25;

			f.x -= dx * this.tension / (dist + 1);
			f.y -= dy * this.tension / (dist + 1);

			if(this.tension > 10000){
				this.controller = null;
			}
		}

		this.speed.x += f.x * dt / this.weight;
		this.speed.y += f.y * dt / this.weight;
		this.speed.x *= 0.9999;
		this.speed.y *= 0.9999;
		this.pos.x += this.speed.x * dt;
		this.pos.y += this.speed.y * dt;
	}
};

var targets = [];

function mkTarget(){
	return {
		pos :{ x: (SCREEN.x-20)*Math.random() + 10 , 
			   y: (SCREEN.y-20)*Math.random() + 10 },
		size:Math.random()*10+5
	};
}

function distance(a, b){
	var dx = a.x - b.x, dy = a.y - b.y;
	return Math.sqrt(dx*dx + dy*dy);
}

for(var i = 0; i < 10; i += 1){
	targets.push(mkTarget());
}

function update(dt){
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, SCREEN.x, SCREEN.y);	

	ball.update(dt);
	ball.draw(ctx);
	mouse.draw(ctx);

	for(var i = targets.length - 1; i >= 0; i -= 1){
		var target = targets[i],
			dist = distance(target.pos, ball.pos);

		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.arc(target.pos.x, target.pos.y, target.size, 0, TAU, 0);
		ctx.fill();

		if(dist < target.size + ball.size){
			points += target.size;
			ball.weight += target.size/14;
			ball.size += target.size/14;
			targets.splice(i, 1);
			targets.push(mkTarget());
		}
	}

	ctx.fillStyle = "#fff";
	ctx.font = "20px Georgia";
	ctx.fillText("POINTS: " + (points|0), 20, 20);
}

setInterval(function(){ update(33/1000); }, 33);
</script>