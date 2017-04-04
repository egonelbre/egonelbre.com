+++
date = "2011-06-09T12:00:00+03:00"
title = "js3d"
tags = ["js", "experiment"]
+++

An experiment with 3D rendering on a 2D Canvas.

<!--more-->

<style>
    .post {
        max-width: none;
        width: 600px;
        padding: 0;
    }
</style>

<canvas id="c"></canvas>

<script>
// set up canvas for drawing
c=document.getElementById('c'),
_W=600,
_H=600;
c.width=_W;
c.height=_H;
c=c.getContext('2d');

// rotation
function vRx(v,s){is=Math.sin(s),ic=Math.cos(s);return [v[0],v[1]*ic-v[2]*is,v[1]*is+v[2]*ic]}
function vRy(v,s){is=Math.sin(s),ic=Math.cos(s);return [v[2]*is+v[0]*ic,v[1],v[2]*ic-v[0]*is]}
function vRz(v,s){is=Math.sin(s),ic=Math.cos(s);return [v[0]*ic-v[1]*is,v[0]*is+v[1]*ic,v[2]]}
// scalar mul
function vs(v,s){return [v[0]*s,v[1]*s,v[2]*s]}
// length
function vl(v,s){return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])}
// add
function va(v,s){return [v[0]+s[0],v[1]+s[1],v[2]+s[2]]}
function vd(v,s){return [v[0]*s[0],v[1]*s[1],v[2]*s[2]]}
// vector dot
function vmd(v,s){return v[0]*s[0]+v[1]*s[1]+v[2]*s[2]}
// vector cross
function vmc(v,s){return [v[1]*s[2]-s[1]*v[2],s[0]*v[2]-v[0]*s[2],v[0]*s[1]-s[0]*v[1]]}
// vector normalize
function vn(v){return vs(v,1/vl(v))}
// face coordinize
function fc(f,p){r=[];for(var i in f)r.push(p[f[i]]);return r}
// face normal
function fn(v){r=vs(v[0],-1);return vn(vmc(va(v[1],r),va(v[2],r)))}

// conversion from 3d to 2d
C=[_W/2,_H/2,0];
function v2D(v,s){r=[];r[2]=((s=v[2]/2)+30)/30;r[0]=C[0]-v[0]*r[2]*10;r[1]=C[1]-v[1]*r[2]*10;r[2]=C[2]+r[2]*3;return r}

for(a in c)(function(a){c[a[0]+(a[6]||'')]=(''+c[a])[27]?c[a]:function(_){c[a]=_}})(a);

function dF(p,f,color){
    c.ba();
    c.fy(hsla(color));
    //c.sS(hsla(color));
    c.m(p[f[0]][0],p[f[0]][1]);
    for(var i=1; i<f.length;i++)
        c.l(p[f[i]][0],p[f[i]][1]);
    c.l(p[f[0]][0],p[f[0]][1]);
    c.ca();
    //c.s();
    c.f();
}

function zcentroid(a,points){
    var r = 0;
    for(var i in a)
        r += points[a[i]][2];
    return r / a.length;
}

function range(len){
    var r = [];
    for(var i =0; i < len; i++)
        r.push(i);
    return r;
}

Ordered = [];
function orderFaces(points,faces){
    var centroids = app(faces,zcentroid,points);
    if(faces.length != Ordered.length)
        Ordered=range(faces.length);
    Ordered.sort(function(a,b){return centroids[a] - centroids[b]});
}

function drawFaces(points,faces,colors){
    orderFaces(points,faces);
    for(var i in Ordered)
        dF(points,faces[Ordered[i]],colors[Ordered[i]])
}

// color string
//  HSLa
function hsla(v){return 'hsla('+v[0]+','+v[1]+'%,'+v[2]+'%,'+v[3]+')'}

// functional programming
function app(p,func,a,b){
    var r=[];
    for(var i in p)
        r[i]=func(p[i],a,b);
    return r;
}

function timeRotate(p,time){
    return vRx(vRy(p,time),0.5);
    //return vRx(vRy(vRz(p,time*4),time),0.4*time);
    //return vRy(vRz(p,time*4),time);
    //return vRx(vRy(p,0.4),0.4);
}

function animate(p,time){
    return timeRotate(lxd(p,time*10),time);
}

Light=vn([1,1,1]);
Ambient=20;

function shade(idx,points,face,colors){
    var v = Math.abs(vmd(fn(fc(face[idx],points)),Light));
    return [5,80,Math.max(Ambient,70*v),0.8]
}

function spherize(v){return vs(v,13/vl(v))}
function wave(v,time){return [v[0],v[1]+Math.cos(Math.sqrt(v[0]*v[0]+v[2]*v[2])/2+time)*3,v[2]]}
function wavex(v,time){
    var r=vl(v);
    var r2=(v[0]*v[0]+v[1]*v[1]+v[2]*v[2])/32 + Math.sin(time/3);
    //var t=Math.atan(v[0]/v[1]);
    n = [v[0]*Math.sin(r2)-v[1]*Math.cos(r2),v[0]*Math.cos(r2)+v[1]*Math.sin(r2),v[2]]
    //n = [(v[0]-v[1])*(v[0]+v[1])/r,2*v[0]*v[1]/r,v[2]];
    vdist = ((v[0]-n[0])*(v[0]-n[0])+(v[1]-n[1])*(v[1]-n[1]))/32;
    return [n[0],n[1],n[2]+vdist]
    //return v;
}

function lxd(v,time){
    h = 16;
    cs = Math.cos(time/8);
    th = cs * h;
    diff = Math.abs(th - v[1])/4;
    m = Math.pow(1.5 + cs/1.2,-diff) + 1;
    return [v[0]*m,v[1],v[2]*m]
}

function tr(v){return [v[0]+Math.cos(time),v[1],v[2]]}
    
function R(time){
    Time = time;
    // particles and links
    links=14;
    elems=19;
    w=0;
    Points=[];
    Faces=[];
    for(i=0;i<links;i++){
        for(z=elems;z--;){
            Points.push([Math.cos(z*2*Math.PI/elems),i-links/2,Math.sin(z*2*Math.PI/elems)]);
            if(i<links-1)
                Faces.push([i*elems+z,i*elems+(z+1)%elems,(i+1)*elems+(z+1)%elems,(i+1)*elems+z]);
        }
    }
    /*
    for(i=0;i<links;i++){
        for(j=0;j<links;j++){
            Points.push([i,j,0]);
            if((j<links-1)&&(i<links-1)){
                Faces.push([i*links+j,i*links+j+1,(i+1)*links+j+1,(i+1)*links+j]);
                //Faces.push([i*links+j,i*links+j+1,(i+1)*links+j+1]);
                //Faces.push([i*links+j,(i+1)*links+j+1,(i+1)*links+j]);
            }
        }
    }*/
    //Points = app(Points,va,[0,-links/2,0]);
    Points = app(Points,vs,32/links);
    Points = app(Points,vd,[links/16,1,links/16]);
    //Points = app(Points,spherize);
}
R(0);

function callback(){
    //c.globalCompositeOperation ="source-over";
    c.ce(0,0,_W,_H);
    //c.globalCompositeOperation ="lighter";
    Time += 0.03;
    var p = app(Points,animate,Time);
    var colors = app(range(Faces.length),shade,p,Faces);
    //Light = vRy(Light,0.1*Math.cos(Time)+0.1);
    drawFaces(app(p,v2D),Faces,colors);
}

setInterval(callback, 30);
</script>