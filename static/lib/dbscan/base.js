function $(id){ return document.getElementById(id); }
main = {
	canvas : $("canvas"),
	draw : null,
	nav  : $("menu"),
	size : {x: 480, y:480},
	
	updateTimer: 0,
	drawTimer: 0,
	history: [],

	tick : 0,
	updateRate: 1000,
	drawRate : 33,

	running : false,

	state : null,
	updates : function(state){},
	render : function(draw, size, state){},
	
	runRendering: function(){
		this.drawTimer = window.setInterval($render, this.drawRate);
	},
	stopRendering: function(){
		window.clearInterval(this.drawTimer);
	},
	
	run : function(){ 
		this.stop();
		this.running = true;
		this.updateTimer = window.setInterval($update, this.updateRate);
	},
	stop : function(){ 
		this.running = false;
		window.clearInterval(this.updateTimer);
	},
	reset : function(){
		this.stop();
		this.tick = 0;
		this.history = [];
		this.state = {};
		this.resetState(this.draw, this.size, this.state);
		this.render(this.draw, this.size, this.state);
	},

	log : function(data){
		this.history.unshift(data);
	},
	
	update : function(){
		this.tick += 1;
		this.updates(this.state);
	},
	updateDisplay : function(){
		this.render(this.draw, this.size, this.state);
	},
	setSize : function(w,h){
		this.size = {x:w, y:h};
		this.canvas.width = this.size.x;
		this.canvas.height = this.size.y;
	},

	mouse : $P(0,0)
};

$update	= function(){main.update()};
$run	= function(){main.run()};
$stop	= function(){main.stop()};
$reset	= function(){main.reset()};
$render = function(){main.updateDisplay()};

main.draw = main.canvas.getContext("2d");

function button(caption, func){
	var elem = document.createElement("button");
	elem.innerHTML = caption;
	elem.addEventListener("click", func);
	main.nav.appendChild(elem);
	return elem;
}

function input(id, value){
	var elem = document.createElement("input");
	elem.id = id;
	elem.value = value;
	main.nav.appendChild(elem);
	return elem;
}

main.canvas.addEventListener("mousemove", function(e){
	main.mouse.x = e.pageX - main.canvas.offsetLeft;
	main.mouse.y = e.pageY - main.canvas.offsetTop;
});
