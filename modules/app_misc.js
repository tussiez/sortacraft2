/*
SortaCraft Misc Functions
Extra stuff to make debugging etc easier

@author tussiez

sortagames.repl.co
*/
window.PlayerPosition = {x:0,y:0,z:0};
window.PlayerFPS = 0;
let debugFPS = document.querySelector('#debug_fps');
let debugPos = document.querySelector('#debug_pos');
let debugVer = document.querySelector('#debug_ver');

// Get version
const getVersion = () => {
  fetch('VERSION.txt').then(res => res.text()).then(bdy => {
    let num = Number(bdy);
    if(!Number.isNaN(num)) {
      console.log('%cSORTACRAFT VERSION %c'+num,'font-size: 32px;font-weight:bold;font-family:"Arial"', 'font-size: 48px');
      window.scVer = num;
    }
  })
}


getVersion();

const debugLoop = () => {
  requestAnimationFrame(debugLoop);
  debugFPS.innerText = 'FPS: ' + window.PlayerFPS;
  debugPos.innerText = 'x: '+(window.PlayerPosition.x.toFixed(1)+', y: '+window.PlayerPosition.y.toFixed(1)+', z: '+window.PlayerPosition.z.toFixed(1));
  debugVer.innerText = 'Ver '+window.scVer;

}

debugLoop()