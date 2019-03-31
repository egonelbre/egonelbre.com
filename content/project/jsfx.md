---
title: "jsfx"
tags: ["js", "jsfx"]
aliases: ["/js/jsfx/"]
---

See <a href="http://www.github.com/egonelbre/jsfx">github</a> for more information.

<!--more-->

<div id="button-panel">
    <div id="sample-generators" class="button-set"></div>
    <div class="button-set">
        <button onclick="jsfxgui.reset()">Reset</button>
        <button onclick="jsfxgui.randomize()">Randomize</button>
        <button onclick="jsfxgui.play()">Play</button>
        <button onclick="jsfxgui.paramsToLibrary()">To Library</button>
    </div>
</div>

<div id="stuff">
    <input type="text" id="libload" value='["noise",0.0000,0.4000,0.0000,0.0060,0.0000,0.1220,20.0000,460.0000,2400.0000,-0.5240,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.9990,0.0000,0.0000,0.0000,0.0000]'></input><button onclick="jsfxgui.paramsFromFieldAndPlay()">Load</button>
    &nbsp;
    <a href="#" id="link">link</a>
    <br />
    <input type="checkbox" id="playonchange" checked>Play On Change</input>
    <br />
</div>

<div id="config-panel">
</div>

<h3>Library</h3>
<div id="library">
</div>

<h3>Log</h3>
<div id="log">
  jsfx... loading...
</div>

<script src="/lib/jsfx/audio.js"></script>
<script src="/lib/jsfx/jsfx.js"></script>
<script src="/lib/jsfx/jsfxlib.js"></script>
<script src="/lib/jsfx/jsfxgui.js"></script>
<script>
    jsfxgui.createSampleGenerators("sample-generators");
    jsfxgui.createConfigurationPanel("config-panel");
    jsfxgui.initLogging("log");
    jsfxgui.initLibrary("library");
    jsfxgui.initField("libload");
    jsfxgui.onplay = onplay;

    (function(){ // Import GET Vars
      document.$_GET = [];
      var urlHalves = String(document.location).split('?');
      if(urlHalves[1]){
         var urlVars = urlHalves[1].split('&');
         for(var i=0; i<=(urlVars.length); i++){
            if(urlVars[i]){
               var urlVarPair = urlVars[i].split('=');
               var gname  = window.decodeURI(urlVarPair[0]);
               var gvalue = window.decodeURI(urlVarPair[1]);
               document.$_GET[gname] = gvalue;               
            }
         }
      }
    })();

    var link = document.getElementById("link");
    var field  = document.getElementById("libload");

    function onplay(){
      this.paramsToField();
      link.href = "http://egonelbre.com/js/jsfx/index.html?load=" + window.encodeURI(field.value);
    }

    var onchange = document.getElementById("playonchange");
    jsfxgui.onvaluemodified = play;
    function play(){
      if( onchange.checked )
        jsfxgui.play();
    }

    var val = document.$_GET['load'];
    if(val !== undefined){
      document.getElementById('libload').value = val;
      jsfxgui.paramsFromField();
    }
</script>

<style>
h3 {
    padding-top: 10px;
}

label {
    display: inline;
}

#button-panel {
    padding: 3px;
    border: 1px dashed #666;
}

#button-panel button {
    margin-bottom: 3px;
}

#config-panel #Generator {
    width: 100%;
}

#config-panel #Generator label {
    padding-right: 10px;
}

#config-panel table {
    margin-top: 3px;
    background-color: #ffe;
    border: 1px dashed #333;
    border-collapse : collapse;
    width : 100%;
}

#config-panel table input[type="range"] {
    height : 18px;
    width  : 100%;
}

#config-panel table td, #config-panel table tr {
    text-align: right;
    padding : 0px 5px 0px;
    margin : 1px;
}

#config-panel table tr td:first-child {
    width: 150px;
    text-align: right;
    font-size: 12px;
}

#log, #library {
    width : 100%;
    height: 100px;
    padding : 5px;

    border: 1px #000 dashed; 

    text-wrap: suppress;
    overflow: scroll;
    overflow-style: marquee-line;

    font-family: monospace;
    font-size: 10px;
    line-height: 1;
}

#stuff {
    margin-bottom : 10px;
}

#libload {
    width: 370px;
}
</style>