// script.js
// Handles workers/etc
"use strict"; // strict

import Alerts from '/modules/alerts.js';
//Msg (or Message) throws some errors sometimes, so I'm going to use alert for now.
Alerts.msgHTML(`Controls: Use WSAD to move around and the mouse to move and place/break blocks.`,10);
const perf = new PerformanceWatcher(100);
const h1 = document.createElement("h1");
let alertTimeout;
const timeoutHandler = ()=>{
  h1.remove();
};
perf.addEventListener("performanceAlert",(info)=>{
  globalThis.clearTimeout(alertTimeout);
  alertTimeout = globalThis.setTimeout(timeoutHandler,2000);
  if(!document.getElementById("highCPUAlert")){
    h1.title = "Your CPU usage might be affecting your game performance";
    h1.id = "highCPUAlert";
    h1.style = "color:orange;position:fixed;z-index:999;bottom:5px;left:20px;";
    h1.textContent = "!";
    document.body.appendChild(h1);
  }
});
perf.takeSample().then((res)=>{
  perf.measurePerformance();
});
const offscreen = document.getElementById('3d').transferControlToOffscreen();
const canvas = document.getElementById('3d');
//CHECK THE VENDOR!!! - baconman
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
document.addEventListener('pointerlockchange', changeCallback, false);
//Again, vendor differences, so check vendor.
document.addEventListener('mozpointerlockchange', changeCallback, false);
document.addEventListener('webkitpointerlockchange', changeCallback, false);
function changeCallback(){
  pointerLocked = !pointerLocked;
  worker.postMessage(['pointerLock',pointerLocked]);
} //when become pointerlock
let typingCommand = false;
let typedCommand = '';
let pointerLocked = false;
let removing = 0;

const worker = new Worker('main.js', { type: 'module' });

worker.postMessage(['main', offscreen, window.innerWidth, window.innerHeight], [offscreen]);

// Recieve
worker.onmessage = function (e) {
  let msg = e.data[0];
  if (msg == 'message') {
    makeMessage(e.data[1]);
  }
}



function makeMessage(msg) {
  let div = document.createElement('div');
  let br = document.createElement('br');
  div.setAttribute('class', 'message');
  div.innerHTML = msg;
  document.getElementById('chatBox').appendChild(div);
  document.getElementById('chatBox').appendChild(br);
  document.getElementById('chatBox').scrollBy(0, 30)
  setTimeout(function () {
    removing++;
    div.style.opacity = '0';
    div.removing = true;
    setTimeout(function () {
      document.getElementById('chatBox').removeChild(div);
      document.getElementById('chatBox').removeChild(br);
    }, 500);
  }, 4500)
}

// Pass events
canvas.addEventListener('mousemove', function (e) {
  if (typingCommand == false) {
    worker.postMessage(['mousemove', e.movementX, e.movementY]);
  }
});

canvas.addEventListener('mousedown', function (e) {
  if (typingCommand == false) {
    //Locks every time for some reason (fixed) - baconman321
    if(!pointerLocked){
      canvas.requestPointerLock(); //pointerlock
    }
    worker.postMessage(['mousedown', e.button]);
  }
});
canvas.addEventListener('mouseup', function (e) {
  if (typingCommand == false) {
    worker.postMessage(['mouseup', e.button])
  }
})
document.body.addEventListener('keydown', function (e) {
  let init = false;
  if (e.key == '/' && typingCommand == false) {
    typingCommand = true;
    typedCommand = '';
    document.getElementById('inputCommand').innerHTML = '';
    document.getElementById('commands').style.display = 'block';
  }
  if (e.key == 't' && typingCommand == false) {
    typingCommand = true;
    typedCommand = '';
    init = true;
    document.getElementById('inputCommand').innerHTML = '';
    document.getElementById('commands').style.display = 'block';
  }
  if (e.key == 'Enter' && typingCommand == true) {
    typingCommand = false;
    document.getElementById('commands').style.display = 'none';
    worker.postMessage(['playerCommand', typedCommand])
  }
  if (typingCommand == true && e.key.length == 1) {
    typedCommand += e.key;
    let placeholder = typedCommand;
    if (init == true) { typedCommand = ''; placeholder = ''}
    document.getElementById('inputCommand').innerText = placeholder;
  }
  if (typingCommand == true && e.key == 'Backspace') {
    typedCommand = typedCommand.substring(0, typedCommand.length - 1)
    document.getElementById('inputCommand').innerText = typedCommand;
  }
  if (typingCommand == false) {
    worker.postMessage(['keydown', e.key]);
  }
});
document.body.addEventListener('keyup', function (e) {
  if (typingCommand == false) {
    worker.postMessage(['keyup', e.key])
  }
});
window.addEventListener('resize', function (e) {
  worker.postMessage(['resize', window.innerWidth, window.innerHeight])
})