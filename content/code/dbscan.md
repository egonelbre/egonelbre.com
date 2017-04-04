+++
date = "2012-10-24T12:00:00+03:00"
title = "DBSCAN"
tags = ["js", "data-mining"]
+++

A visualization of a <a href="http://en.wikipedia.org/wiki/DBSCAN">DBSCAN algorithm</a>.

<!--more-->

<style>
    .post {
        max-width: none;
        width: 640px;
        padding: 0;
    }
</style>

<header>
	<nav id="menu"></nav>
	<div class="clear"></div>
</header>

<canvas id="canvas"></canvas>

<script src="/lib/dbscan/math.js"></script>
<script src="/lib/dbscan/utils.js"></script>

<script src="/lib/dbscan/base.js"></script>
<script src="/lib/dbscan/data.js"></script>

<script src="/lib/dbscan/grid.js"></script>

<script>

function loaded(){
	main.setSize(640, 640);

	button("Step",  $update);
	button("Run",   $run);
	button("Stop",  $stop);
	button("Reset", $reset);

	input("eps", 2);
	input("minPts", 2);

	main.reset();
	main.runRendering();
}

var conf = {
	main : {
		background : "#222",
		foreground : "#ddd",
	},
	data : {
		background : "#fff",
		foreground : "#222",
		radius : 15,
	},
	algorithm : {
		marking : 18,
	}
};

main.resetState = function(draw, size, state){
	state.data = clone(inputData);
	state.next = algorithm.init;
	draw.grid = new Grid($R(10,10,size.x-20,size.y-20), $R(0,10,10,0));
};

main.renderBase = function(draw, grid, size, state){
	draw.fillStyle = conf.main.background;
	draw.fillRect(0, 0, size.x, size.y);

	draw.fillStyle = "#777";
	draw.strokeStyle = "#333";
	draw.lineWidth = 1;
	draw.font = "11px Courier New, monospace"
	grid.render(draw);

	var r = $R(size.x - 180, 10, size.x - 20, 170);
	draw.fillStyle = "rgba(255,255,255,0.3)";
	draw.fillRect(r.left, r.top, r.width, r.height);

	draw.fillStyle = conf.main.foreground;
	draw.fillText("time: " + main.tick, r.left + 5, r.top + 12);

	var top = this.history.slice(0, 10),
		y = r.top + 30, dy = 12;
	for(var i = top.length - 1; i >= 0; i -= 1){
		draw.fillText(top[i], r.left + 15, y);
		y += dy;
	}
};

main.renderMouse = function(draw, grid, size, state){
	var p = grid.fromScreen(main.mouse);
	draw.font = "13px Courier New, monospace";
	draw.fillStyle = "#f00";
	draw.fillText(p.toString(), main.mouse.x, main.mouse.y);
};

main.renderInputData = function(draw, grid, size, state){
	foreach(state.data, function(point, label){
		var p = grid.toScreen(point);
		draw.fillStyle = conf.data.background;
		
		draw.beginPath();
		draw.arc(p.x, p.y, conf.data.radius, 0, Math.TAU, 0);
		draw.fill();

		draw.fillStyle = conf.data.foreground;
		draw.font = "bold 16px Georgia";
		draw.fillText(label, p.x - 6, p.y + 6);
	});
};

function mark(draw, grid, point, off, color, strength){
	var p = grid.toScreen(point);
	draw.lineWidth = strength || 1;
	draw.beginPath();
	draw.arc(p.x, p.y, conf.algorithm.marking + off, 0, Math.TAU, 0);
	draw.strokeStyle = color;
	draw.stroke();
};

function renderQuery(draw, grid, point, color, eps){
	var p = grid.toScreen( point );
	// render area
	draw.beginPath();
	draw.lineWidth = 1;
	draw.fillStyle = color;
	draw.save();
		draw.translate(p.x, p.y);
		draw.scale(grid.scale.x, grid.scale.y);
		draw.arc(0, 0, eps, 0, Math.TAU, 0);
	draw.restore();
	draw.fill();
}

main.renderAlgorithm = function(draw, grid, size, state){
	if(state.visiting){
		var point = state.data[state.visiting];
		renderQuery(draw, grid, point, "rgba(0,255,0,0.1)", state.eps);

		var point = state.data[state.lastQuery];
		renderQuery(draw, grid, point, "rgba(255,255,255,0.07)", state.eps);
	}

	// draw visiting 
	if(state.visiting){
		mark(draw, grid, state.data[state.visiting], 0, "#f00", 10);
		foreach(state.neighbors, function(label){
			mark(draw, grid, state.data[label], 2, "#ff0");
		});
	}
	
	if(state.visited){
		foreach(state.data, function(point, label){
			if(state.noise[label])
				mark(draw, grid, point, 0, "rgba(100,100,100,1)", 5)
			else if(state.visited[label])
				mark(draw, grid, point, 2, "#0f0");
		});
	}

	if(state.clusters){
		for(var i = 0; i < state.clusters.length; i += 1){
			var col = "hsla("+i*90+",60%,60%,0.3)";
			foreach(state.clusters[i], function(_, label){
				mark(draw, grid, state.data[label], 9, col, 5);
			});
		}

		foreach(state.cluster, function(_, label){
			mark(draw, grid, state.data[label], 9, "hsla(-60,60%,60%,0.7)", 5);
		});
	}
};

main.render = function(draw, size, state){
	var grid = draw.grid;
	this.renderBase(draw, grid, size, state);
	// this.renderMouse(draw, grid, size, state);

	this.renderAlgorithm(draw, grid, size, state);
	this.renderInputData(draw, grid, size, state);
};

main.updates = function(state){
	algorithm.fixup(state);
	state.next(state);
};

dist = function(a, b){
		var dx = a.x - b.x,
			dy = a.y - b.y;
		return Math.sqrt(dx*dx + dy*dy);
};

regionQuery = function(point, data, eps){
	var result = [],
		p = data[point];
	foreach(data, function(o, label){
		if(label == point) return;
		if(this.dist(p, o) < eps)
			result.push(label);
	});
	return result;
};

visitNextThing = function(state){
	state.visited[state.visiting] = true;
	state.next = algorithm.visitNode;
};

filteredNeighbors = function(neighbors, visited, current){
	var result = [];
	for(var i = 0; i < neighbors.length; i+= 1){
		var n = neighbors[i],
			hasBeenVisited = visited[n],
			isAlreadyInList = current.indexOf(n) >= 0;
		if(!(hasBeenVisited || isAlreadyInList))
			result.push(n);
	}
	return result;
}

algorithm = {
	fixup: function(state){
		// remove visited from unvisited;
		if(state.unvisited)
		for(var i = state.unvisited.length - 1; i >= 0; i -= 1){
			var lbl = state.unvisited[i];
			if(state.visited[lbl])
				state.unvisited.splice(i, 1);
		}
	},
	init : function(state){
		console.log("initializing");
		state.minPts = $("minPts").value;
		state.eps = $("eps").value;
		state.unvisited = Object.keys(state.data);
		state.noise = {};
		state.visited = {};
		state.clustered = {};
		state.clusters = [];
		state.next = algorithm.visitNode;
	},
	visitNode : function(state){
		if(state.unvisited.length == 0){
			state.next = algorithm.done;
			return;
		};
		
		state.visiting = state.unvisited.pop();
		main.log("visiting: " + state.visiting);
		
		var p = state.data[state.visiting];
		state.lastQuery = state.visiting;
		state.neighbors = regionQuery(state.visiting, state.data, state.eps)
		main.log("  neighbors [" + state.neighbors + "]");

		if(state.neighbors.length < state.minPts) {
			state.noise[state.visiting] = true;
			main.log("  mark as noise " + state.visiting);
			visitNextThing(state);
		} else {
			state.next = algorithm.startExpanding;
		}
	},
	
	startExpanding : function(state){
		main.log("  new cluster");
		state.cluster = {};
		state.visitedNeighbors = {};
		state.visitedNeighbors[state.visiting] = true;
		state.cluster[state.visiting] = true;
		state.next = algorithm.visitNeighbor;
	},

	visitNeighbor : function(state){	
		if(state.neighbors.length <= 0){
			state.next = algorithm.doneVisitingNeighbors;
			return;
		}

		state.neighbor = state.neighbors.pop();
		state.visitedNeighbors[state.neighbor] = true;

		main.log("  ..visit: " + state.neighbor);

		if(!state.visited[state.neighbor]){
			state.visited[state.neighbor] = true;
			state.lastQuery = state.neighbor;
			var neighbors = regionQuery(state.neighbor, state.data, state.eps);
			if(neighbors.length > state.minPts){
				neighbors = filteredNeighbors(neighbors, state.visitedNeighbors, state.neighbors);
				main.log("    add [" + neighbors + "]");
				state.neighbors = state.neighbors.concat(neighbors);
			}
		}

		if(!state.clustered[state.neighbor]){
			state.clustered = true;
			state.cluster[state.neighbor] = true;
		}
	},

	doneVisitingNeighbors : function(state){
		main.log("done neighbors");
		state.clusters.push(state.cluster);
		state.cluster = {};
		visitNextThing(state);
	},

	done : function(state){
		state.lastQuery = null;
		state.visiting = null;
		main.log("done");

		main.log("> noise [" + Object.keys(state.noise) + "]");
		for(var i = 0; i < state.clusters.length; i += 1 ){
			main.log("> cluster [" + Object.keys(state.clusters[i]) + "]");
		};

		state.next = algorithm.nothing;
		$stop();
	},
	nothing : function(state){}
}

loaded();
$run();

</script>