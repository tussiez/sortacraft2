// script.js
// Handles workers/etc
"use strict"; // strict

const offscreen = document.getElementById('3d').transferControlToOffscreen();
const canvas = document.getElementById('3d');

const worker = new Worker('main.js',{type:'module'});

worker.postMessage(['main',offscreen,window.innerWidth,window.innerHeight],[offscreen]);


// Pass events
canvas.addEventListener('mousemove',function(e){
  worker.postMessage(['mousemove',e.movementX,e.movementY]);
});
canvas.addEventListener('mousedown',function(e){
  canvas.requestPointerLock(); //pointerlock
  worker.postMessage(['mousedown',e.button]);
});
canvas.addEventListener('mouseup',function(e){
  worker.postMessage(['mouseup',e.button])
})
document.body.addEventListener('keydown',function(e){
  worker.postMessage(['keydown',e.key]);
});
document.body.addEventListener('keyup',function(e){
  worker.postMessage(['keyup',e.key])
})
window.addEventListener('resize',function(e){
  worker.postMessage(['resize',window.innerWidth,window.innerHeight])
})