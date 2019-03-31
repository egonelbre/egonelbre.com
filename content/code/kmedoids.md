---
date: "2012-10-24T12:00:00+03:00"
title: "K-Medoids"
tags: ["js", "data-mining"]
---

A visualization of a <a href="http://en.wikipedia.org/wiki/K-medoids">K-medoids clustering</a>.

<!--more-->

<style>
    .post {
        max-width: none;
        width: 480px;
        padding: 0;
    }
</style>

<button onclick="doStep()">Step</button>
<canvas id="canvas"></canvas>

<script>
var size = {x: 480, y:480};
var canvas = document.getElementById("canvas");
canvas.width = size.x;
canvas.height = size.y;
var TAU = Math.PI*2;
var draw = canvas.getContext("2d");

var data = [{ label : "A", x : 2, y : 4 },
			{ label : "B", x : 7, y : 3 },
			{ label : "C", x : 3, y : 5 },
			{ label : "D", x : 5, y : 3 },
			{ label : "E", x : 7, y : 4 },
			{ label : "F", x : 6, y : 8 },
			{ label : "G", x : 6, y : 5 },
			{ label : "H", x : 8, y : 4 },
			{ label : "I", x : 2, y : 5 },
			{ label : "J", x : 3, y : 7 }];

var dataMap = {};
for(var i = 0; i < data.length; i += 1)
	dataMap[data[i].label] = data[i];


var stepInterval = 0;
var state = {
	tick : 0,
	centers : []
};

function clone(obj){
	var res = {};
	for(var i in obj)
		if(typeof(obj[i]) == "object")
			res[i] = clone(obj[i])
		else
			res[i] = obj[i];
	return res;
}

function stop(){
	clearInterval(stepInterval);
}

function reset(){
	state.tick = 0;
	state.centers = [{link:"D"}, {link:"E"}, {link:"H"}];
	for(var i = 0; i < state.centers.length; i += 1){
		state.centers[i].children = [];
	}
}

function start(){
	stop();
	reset();
	stepInterval = setInterval(doStep, 1000);
}

function render(state){
	var background = "#222",
		foreground = "#ddd";

	draw.fillStyle = background;
	draw.fillRect(0,0,size.x,size.y);

	draw.save();

	draw.translate(10, size.y-10);
	draw.scale(46, -46);

	draw.strokeStyle = foreground;
	draw.lineWidth = 0.07;

	// axis
	draw.beginPath();
	draw.moveTo(0,0); draw.lineTo(0, 10);
	draw.moveTo(0,0); draw.lineTo(10, 0);
	draw.stroke();

	// grid
	draw.beginPath();
	draw.lineWidth = 0.01;
	for(var i = 0; i < 10; i += 1){
		draw.moveTo(i, -0.1); draw.lineTo(i, 10);
		draw.moveTo(-0.1, i); draw.lineTo(10, i);
	}
	draw.stroke();

	draw.font = "bold 1px sans-serif";
	var radius = 0.3;
	for(var i = 0; i < data.length; i += 1){
		draw.fillStyle = foreground;

		var p = data[i];
		draw.beginPath();
		draw.arc(p.x, p.y, radius, 0, TAU, 0);
		draw.fill();

		draw.save();
			draw.translate(p.x - 0.18, p.y - 0.18);
			draw.scale(0.5,-0.5);

			draw.fillStyle = "#000";
			draw.fillText(p.label, 0, 0);
		draw.restore();
	}


	draw.lineWidth = 0.1;
	draw.strokeStyle = "080";
	var centers = state.centers;
	for(var i = 0; i < centers.length; i += 1){
		draw.fillStyle = "#f00";
		
		var center = centers[i];
			p = dataMap[center.link];
		draw.beginPath();
		draw.arc(p.x, p.y, 0.2, 0, TAU, 0);
		draw.fill();

		for(var k = 0; k < center.children.length; k += 1 ){
			var o = dataMap[center.children[k]];
			draw.beginPath();
			draw.moveTo(p.x, p.y);
			draw.lineTo(o.x, o.y);
			draw.stroke();
		}
	}
	
	draw.save();
		draw.scale(1,-1);
		draw.fillStyle = "#fff";
		draw.fillText(state.tick, 0.2, -0.2);
	draw.restore();

	draw.restore();
}

function distance(from, to){
	var dx = from.x - to.x,
		dy = from.y - to.y;
	return dx*dx + dy*dy;
}

function reassignChildren(state){
	var centers = state.centers;

	for(var i = 0; i < centers.length; i += 1){
		centers[i].children = [];
	}

	data.map(function(p){
		var nearest = 0,
			dist = distance(p, dataMap[centers[nearest].link]);

		for(var k = 1; k < centers.length; k += 1){
			var kdist = distance(p, dataMap[centers[k].link]);
			if(kdist < dist){
				dist = kdist;
				nearest = k;
			}
		}

		centers[nearest].children.push(p.label);
	});
}

function recalculateCenters(state){
	var centers = state.centers;

	centers.map(function(center){
		if(center.children.length <= 0)
			return;

		var sum = {x:0, y:0};
		center.children.map(function(child){
			var c = dataMap[child];
			sum.x += c.x;
			sum.y += c.y;
		});

		var len = center.children.length;
		sum.x /= len;
		sum.y /= len;

		var minDist = 100000, best = "";
		data.map(function(p){
			var dist = distance(sum, p);
			if(dist < minDist){
				minDist = dist;
				best = p.label;
			}
		});
		center.link = best;
	});
}

function kmedoids(state){
	if(state.tick % 2)
		reassignChildren(state)
	else
		recalculateCenters(state);
}

var tick = 0;

function doStep(){
	state.tick += 1;
	render(state);
	kmedoids(state);
}

reset();
render(state);

</script>