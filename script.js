/*
script.js

Handles main worker for SortaCraft

@author xxpertHacker
@author tussiez
@author Baconman321

sortagames.repl.co
*/


import * as Alerts from "./modules/alerts.js";
import { PerformanceWatcher } from "./idleTasks.js";
import TouchControls from './modules/TouchControls.js'; // TouchControls 1
const {
  document,
  document: { body },
  clearTimeout,
  setTimeout,
  Promise,
} = globalThis;

let controls;
const delay = (seconds) =>
  new Promise(
    (resolve, _) => {
      setTimeout(resolve, 1000.0 * seconds);
    },
  );


{
  // Right now it's actually OK at measuring performance, it will only really measure spikes on the main thread though and not the other threads...  :/ -baconman321
  const perf = new PerformanceWatcher(100);

  {
    const h1 = document.createElement("h1");

    let alertTimeout;

    const timeoutHandler = () => {
      h1.remove();
    };

    perf.addEventListener(
      "performanceAlert",
      (info) => {
        clearTimeout(alertTimeout);
        alertTimeout = setTimeout(timeoutHandler, 2000);

        // how about a boolean that is updated when the <h1 /> is attached?
        if (!document.getElementById("highCPUAlert")) {
          h1.title = "Your high CPU usage may be affecting your game performance";
          h1.id = "highCPUAlert";
          h1.style =
            "color:orange;position:fixed;z-index:999;bottom:5px;left:20px;";
          h1.textContent = "!";
          body.appendChild(h1);
        }
      },
    );
  }

  perf.takeSample().then(
    (res) => {
      perf.measurePerformance();
    }
  );
}

const canvas = document.getElementById("3d");
const offscreen = canvas.transferControlToOffscreen();
let debugBox = document.querySelector('#debug');

let isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));



// CHECK THE VENDOR!!! - baconman
// prob usless nowadays; 2021 ~ xxpertHacker
{
  const Canvas = globalThis.HTMLCanvasElement.prototype;

  if (!("requestPointerLock" in Canvas)) {
    Canvas.requestPointerLock = Canvas.mozRequestPointerLock ||
      Canvas.webkitRequestPointerLoc;
  }
}

// Again, vendor differences, so check vendor.

// once again, it's 2021
for (const prefix of ["", "moz", "webkit"]) {
  document.addEventListener(
    `${prefix}pointerlockchange`,
    changeCallback,
    false,
  );
  // umm... you should use an object as the third parameter, not a boolean ~ xxpertHacker
}

let typingCommand = false;
let typedCommand = "";
let pointerLocked = false;
let removing = 0;

function changeCallback() {
  pointerLocked = !pointerLocked;
  worker.postMessage(["pointerLock", pointerLocked]);
}

const worker = new Worker("./main.js", { type: "module" });

worker.postMessage([
  "main",
  offscreen,
  globalThis.innerWidth,
  globalThis.innerHeight,
], [
    offscreen,
  ]);

window.startGame = () => {
  worker.postMessage(["startGame"]);
  menus.style.display = 'none';
  loadingDiv.style.display = 'block';
}

if (isMobile === true) {
  controls = new TouchControls(canvas);
  controls.createUI();


  controls.onOrientationChange(orien => {
    if (orien < 1) {
      if (!document.querySelector("#orienAlert")) {
        const orienAlert = document.createElement("div");
        orienAlert.id = "orienAlert";
        orienAlert.style = "background-color:orange;color:black;text-align:center;position:fixed;width:100%;height:100%;top:0;left:0;z-index:1000000;";
        orienAlert.innerHTML = "<h1 style='font-size:50px;'>For a better experience, please play in landscape mode.</h1>";
        document.body.appendChild(orienAlert);
      }
    }
    else {
      if (document.querySelector("#orienAlert")) {
        document.querySelector("#orienAlert").remove();
      }
    }
  });

  controls.onForward = () => {
    worker.postMessage(['touch_forward']);
  }
  controls.onBackward = () => {
    worker.postMessage(['touch_backward']);
  }
  controls.onLeft = () => {
    worker.postMessage(['touch_left']);
  }
  controls.onRight = () => {
    worker.postMessage(['touch_right']);
  }
  controls.onForwardEnd = () => {
    worker.postMessage(['touch_forward_end']);
  }
  controls.onBackwardEnd = () => {
    worker.postMessage(['touch_backward_end']);
  }
  controls.onLeftEnd = () => {
    worker.postMessage(['touch_left_end']);
  }
  controls.onRightEnd = () => {
    worker.postMessage(['touch_right_end']);
  }
  controls.onJump = () => {
    worker.postMessage(['touch_jump']);
  }
  controls.onJumpEnd = () => {
    worker.postMessage(['touch_jump_end']);
  }
  controls.lookEvent = (x, y) => {
    worker.postMessage(['touch_look', { x, y }]);
  }
}

const chatBox = document.getElementById("chatBox");

async function makeMessage(msg) {
  // how about caching the object and only making it once?
  const div = document.createElement("div");
  const br = document.createElement("br");

  div.classList.add("message");
  div.textContent = msg;
  chatBox.append(div, br);
  chatBox.scrollBy(0, 30);
  await delay(4.5);
  ++removing;
  div.style.opacity = "0";
  await delay(0.5);
  div.remove();
  br.remove();
}


let progressBar = document.getElementById('loader');
let loadingDiv = document.getElementById('centered');
let overlayDiv = document.getElementById('dirt_bg');
let progressInfo = document.getElementById('loadingInfo');
let menus = document.querySelector('#menu');

const setProgress = (state) => {
  if (state < 100) {
    // overlayDiv.style.display = 'block';
   // loadingDiv.style.display = 'block';
    progressBar.style.width = state + '%';
  } else {
    overlayDiv.style.display = 'none';
    loadingDiv.style.display = 'none';
  }
}

// Recieve
worker.onmessage = ({ data }) => {
  const [op, msg] = data;
  if ("message" === op) {
    makeMessage(msg);
  }
  if ("progress" === op) {
    setProgress(msg * 100)
  }
  if ("asset_loaded" == op) {
    progressInfo.innerText = 'Generating world..'
  }
  if ("debug_info" == op) {
    window.PlayerPosition = msg[1];
    window.PlayerFPS = msg[0];
  }

};

// Pass events
canvas.addEventListener(
  "mousemove",
  (e) => {
    if (!typingCommand) {
      worker.postMessage(["mousemove", e.movementX, e.movementY]);
    }
  },
);

canvas.addEventListener(
  "mousedown",
  (e) => {
    if (!typingCommand) {
      if (!pointerLocked) {
        canvas.requestPointerLock(); // pointerlock
      }
      worker.postMessage(["mousedown", e.button]);
    }
  },
);

canvas.addEventListener(
  "mouseup",
  (e) => {
    if (!typingCommand) {
      worker.postMessage(["mouseup", e.button]);
    }
  },
);

const inputCommand = document.getElementById("inputCommand");
const commands = document.getElementById("commands");

body.addEventListener(
  "keydown",
  ({ key, ctrlKey }) => {
    // const init = !typingCommand && "t" === key;
    // I think this ^ would work ~ xxpertHacker
    let init = false;

    if (!typingCommand) {
      const isT = "t" === key;
      if (isT || key === "/") {
        typingCommand = true;
        commands.style.display = "block";
      }
      if (key == '/') {
        typedCommand = '/';
        inputCommand.textContent = "/";
      }
      if ("t" === key) {
        init = true;
      }
      if ("`" === key && ctrlKey === true) {
        if (debugBox.style.display === "" || debugBox.style.display == 'block') {
          debugBox.style.display = 'none';
        } else {
          debugBox.style.display = 'block';
        }
      }
      // I added this so that it allows you to move... - baconman321
      worker.postMessage(["keydown", key]);
    } else {
      // typingCommand should be true already
      if (typingCommand && "Enter" === key) {
        typingCommand = false;
        commands.style.display = "none";
        worker.postMessage(["playerCommand", typedCommand]);
        typedCommand = "";
        inputCommand.textContent = ""
      }
      if (typingCommand) {
        if (1 === key.length) {
          typedCommand += key;
          let placeholder = typedCommand;
          if (init) {
            typedCommand = "";
            placeholder = "";
          }
          inputCommand.innerText = placeholder;
        } else if ("Backspace" === key) {
          // remove last character
          typedCommand = typedCommand.slice(0, -1);

          inputCommand.innerText = typedCommand;
        }
      } else {
        worker.postMessage(["keydown", key]);
      }
    }
  },
);

body.addEventListener(
  "keyup",
  ({ key }) => {
    if (!typingCommand) {
      worker.postMessage(["keyup", key]);
    }
  },
);

globalThis.addEventListener(
  "resize",
  () => {
    worker.postMessage([
      "resize",
      globalThis.innerWidth,
      globalThis.innerHeight,
    ]);
  },
);
