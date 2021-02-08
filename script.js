// script.js
// Handles workers/etc
"use strict"; // strict

const offscreen = document.getElementById('3d').transferControlToOffscreen();
const canvas = document.getElementById('3d');
let typingCommand = false;
let typedCommand = '';

const worker = new Worker('main.js', { type: 'module' });

worker.postMessage(['main', offscreen, window.innerWidth, window.innerHeight], [offscreen]);

// Recieve
worker.onmessage = function(e){
  let msg = e.data[0];
  if(msg == 'message'){
    makeMessage(e.data[1]);
  }
}

function makeMessage(msg){
  let div = document.createElement('div');
  let br = document.createElement('br');
  div.setAttribute('class','message');
  div.innerHTML = msg;
  document.getElementById('chatBox').appendChild(div);
  document.getElementById('chatBox').appendChild(br);
  document.getElementById('chatBox').scrollBy(0,30)
  setTimeout(function(){
    div.style.transform ='translateY(-25px)';
    div.style.opacity = '0'
    setTimeout(function(){
    document.getElementById('chatBox').removeChild(div);
    document.getElementById('chatBox').removeChild(br);
    },500);
  },4500)
}

// Pass events
canvas.addEventListener('mousemove', function (e) {
  if (typingCommand == false) {
    worker.postMessage(['mousemove', e.movementX, e.movementY]);
  }
});

canvas.addEventListener('mousedown', function (e) {
  if (typingCommand == false) {
    canvas.requestPointerLock(); //pointerlock
    worker.postMessage(['mousedown', e.button]);
  }
});
canvas.addEventListener('mouseup', function (e) {
  if (typingCommand == false) {
    worker.postMessage(['mouseup', e.button])
  }
})
document.body.addEventListener('keydown', function (e) {
  if (e.key == '/' && typingCommand == false) {
    typingCommand = true;
    typedCommand = '';
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
    if(typedCommand == '/'){
      document.getElementById('inputCommand').innerHTML = '<span style="color:gray">/ (type a command)</span>'
    } else {
    document.getElementById('inputCommand').innerHTML = typedCommand;
    }
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