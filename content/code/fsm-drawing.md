---
date: "2011-06-09T12:00:00+03:00"
title: "FSM Line Drawing"
tags: ["JavaScript", "Experiment"]
---

Simple finite state machine used to implement a drawing tool.

<!--more-->

<style>
    .post {
        max-width: none;
        width: 600px;
        padding: 0;
    }
</style>
<canvas id="canvas"></canvas>
<script>
// canvas setup
var d=document,
    canvas = document.getElementById("canvas"),
    c=canvas,
    W=600,H=600;
    c.width = W,
    c.height = H,
    c = c.getContext("2d");

// Math function aliases
var cos=Math.cos,
    sin=Math.sin,
    abs=Math.abs,
    sqrt=Math.sqrt,
    sgn=function(val) { return val >= 0 ? 1 : -1 },
    dist = function(a,b){ var x = a[0] - b[0], y = a[1] - b[1]; return sqrt(x*x + y * y)},
    atan2=Math.atan2,
    rand=Math.random;

M = [W/2,H/2];
TAU = 2*Math.PI;

lines = [];
start = false;
pressed = false;
selected_tool = 0;

function EmptyFunc(){}

function State(instance, funcs){
    this.instance = instance || this;
    
    this.BeginState = funcs.begin  || EmptyFunc;
    this.State      = funcs.update || EmptyFunc;
    this.EndState   = funcs.end    || EmptyFunc;
}

State.prototype.ExecuteBeginState = function(){ this.BeginState.call(this.instance) };
State.prototype.ExecuteState      = function(){ this.State.call(this.instance)      };
State.prototype.ExecuteEndState   = function(){ this.EndState.call(this.instance)   };

function CFSM(defaultUpdate){
    this.currentState = false;
    this.newState = false;
    this.currentState = new State(this, { update: defaultUpdate || EmptyFunc });
}

CFSM.prototype.Update: function(){
    if( this.newState ){
        this.currentState.ExecuteEndState();
        this.currentState = this.newState;
        this.newState = false;
        this.currentState.ExecuteBeginState();
    }
    this.currentState.ExecuteState();
}

CFSM.prototype.IsState = function(state){
    return this.currentState == state;
}

CFSM.prototype.GotoState = function(state){
    this.newState = state;
}

CFSM.prototype.makeState = function(funcs){
    return new State(this, funcs);
}

CFSM.prototype.init = function(initFunc){
    CFSM.call(this, initFunc);
}

function LightBulb(){
    this.init( function(){ this.GotoState(this.stateOff); } );
    this.newState = 
    this.stateOff = this.makeState({  
        begin  : function(){ console.log("I'm off!"); },
        update : function(){ this.GotoState(this.stateOn); },
        end    : function(){ console.log("heating..."); }
    });
    
    var data = { life : 0 };
    this.stateOn  = this.makeState({
        begin  : function(){ data.life = 3 },
        update : function(){ 
            console.log("burning"); 
            data.life--; 
            if (data.life <= 0)
                this.GotoState(this.stateOff);
        }
    });
}
LightBulb.prototype = new CFSM();

function Pointer(){
    // alternatively
    // this.init( function(){ this.GotoState( this.stateOff ) } );
    // without newState
    this.init();
    this.newState = 
    this.noAction = this.makeState({  
        update : function(){ 
            this.Draw(M, '#8f3'); 
            if( pressed ){
                switch( selected_tool ){
                    case 0 : this.GotoState(this.drawLine); break;
                    case 1 : this.GotoState(this.drawCircle); break;
                }
            }
    }});
    
    var line = {
        start : [0,0],
        end   : [0,0]
    }
    this.drawLine = this.makeState({
        begin : function(){ line.start = M; line.end = M; },
        update: function(){ 
            this.Draw(M, '#f83');
            line.end = M;            
            c.strokeStyle = '#f33';
            c.beginPath();
            c.moveTo(line.start[0], line.start[1]);
            c.lineTo(line.end[0],  line.end[1]);
            c.stroke();
            if( !pressed ) this.GotoState(this.noAction);
        },
        end   : function(){
            lines.push( [ line.start, line.end ] );
        }
    });
    var circle = {
        start : [0,0],
        end   : [0,0]
    }
    this.drawCircle = this.makeState({
        begin : function(){ circle.start = M; circle.end = M; },
        update: function(){ 
            this.Draw(M, '#f83');
            circle.end = M;            
            c.strokeStyle = '#f33';
            c.beginPath();
            c.arc( circle.start[0], circle.start[1], dist(circle.start,circle.end), 0, TAU, true );
            c.stroke();
            if( !pressed ) this.GotoState(this.noAction);
        }
    });
}

Pointer.prototype = new CFSM();

Pointer.prototype.Draw = function(pos, color){
    c.fillStyle = color;
    c.beginPath();
    c.arc( pos[0], pos[1], 5, 0, TAU, true );
    c.closePath();
    c.fill();
}

pointer = new Pointer();

render = function(){
    // Background
    c.beginPath();
    c.fillStyle="#efe";
    c.fillRect(0,0,W,H);
    c.fillRect(0,0,W,H);
    c.fillStyle="#000";
    c.fill();
    c.strokeStyle="#000";
    
    for( var i = lines.length; i--; ){
        var from = lines[i][0],
              to = lines[i][1];
        c.beginPath();
        c.moveTo(from[0], from[1]);
        c.lineTo(to[0], to[1]);
        c.stroke();
    }
    
    pointer.Update();
}

window.requestAnimFrame = 
    window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(callback, element){ window.setTimeout(callback, 1000 / 60); };

canvas.onmousemove = function(e){ M = [ e.offsetX, e.offsetY];};
canvas.onmousedown = function(e){ pressed = true; };
canvas.onmouseup = function(e){ pressed = false; };

(function _animation_loop_(){
    render();
    requestAnimFrame(_animation_loop_);
})();
</script>

