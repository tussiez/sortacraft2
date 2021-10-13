/*
SortaCraft Misc Functions
Extra stuff to make debugging etc easier

@author tussiez

sortagames.repl.co
*/

// Get version
const getVersion = () => {
  fetch('VERSION.txt').then(res => res.text()).then(bdy => {
    let num = Number(bdy);
    if(!Number.isNaN(num)) {
      console.log('%cSORTACRAFT VERSION %c'+num,'font-size: 32px;font-weight:bold;font-family:"Arial"', 'font-size: 48px');
    }
  })
}


getVersion();