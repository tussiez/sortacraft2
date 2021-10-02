/*
TouchControls
DOM side of TouchControlsWorker

@author tussiez
@author Baconman321
@author xxpertHacker

sortagames.repl.co
*/

import { Euler, Vector3 } from "https://threejs.org/build/three.module.js";

const { max, min, PI } = Math;

class TouchControls {
  euler = new Euler(0, 0, 0, "YXZ");
  vec = new Vector3();
  pi2 = Math.PI / 2;
  lastTouch = null;
  moveSpeed = 12;

  createUI() {
    const template = document.createElement("div");

    const circle = this.circle = template.cloneNode();

    circle.setAttribute(
      "style",
      "height:100px;width:100px;border-radius:50%; border: 2px solid white;z-index:2;position:absolute;top:0;left:0; opacity: 0",
    );

    const container = template.cloneNode();

    // template becomes arrow template here
    template.classList.add("arrow");
    const up = template.cloneNode();
    const down = template.cloneNode();
    const left = template.cloneNode();
    const right = template.cloneNode();
    const jump = template.cloneNode();

    const arrows = this.arrows = {
      up,
      down,
      left,
      right,
      jump,
      container,
    };

    up.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onForward();
    });
    up.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onForwardEnd();
    });

    down.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onBackward();
    });
    down.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onBackwardEnd();
    });

    left.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onLeft();
    });
    left.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onLeftEnd();
    });

    right.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onRight();
    });
    right.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onRightEnd();
    });

    jump.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onJump();
    });
    jump.addEventListener("touchend", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onJumpEnd();
    })

    const table = document.createElement("table");

    const tr1 = document.createElement("tr"); // 3 rows
    const tr2 = tr1.cloneNode();
    const tr3 = tr1.cloneNode();

    const td1 = document.createElement("td");
    const td2 = td1.cloneNode(); // 3 per row
    const td3 = td1.cloneNode();
    const td4 = td1.cloneNode();
    const td5 = td1.cloneNode();
    const td6 = td1.cloneNode();
    const td7 = td1.cloneNode();
    const td8 = td1.cloneNode();
    const td9 = td1.cloneNode();

    tr1.append(td1, td2, td3);
    tr2.append(td4, td5, td6);
    tr3.append(td7, td8, td9);

    table.append(tr1, tr2, tr3);

    table.setAttribute("style",
      "height:100%;width: 100%;");

    td2.appendChild(up);
    td4.appendChild(left);
    td5.appendChild(jump); // Jump button
    td6.appendChild(right);
    td8.appendChild(down);

    container.setAttribute(
      "style",
      "position:fixed;bottom:0;left:0;height:20vw;width:20vw;z-index:2",
    ); // test

    container.appendChild(table);


    document.body.append(circle, container);
  }

  constructor(ele) {

    if (!ele) throw new Error("Pass element");

    ele.addEventListener(
      "touchstart",
      ({ changedTouches }) => {
        const [touch] = changedTouches;

        const { clientX, clientY } = touch;

        const { style } = this.circle;

        style.opacity = "1";
        style.left = (clientX - 50) + "px";
        style.top = (clientY - 50) + "px";
      },
    );

    ele.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        const touches = e.changedTouches;

        const [touch] = touches;

        this.lastTouch || (this.lastTouch = touch);

        const { lastTouch, circle: { style } } = this;

        style.left = (touch.clientX - 50) + "px";
        style.top = (touch.clientY - 50) + "px";

        this.lookEvent(
          touch.clientX - lastTouch.clientX,
          touch.clientY - lastTouch.clientY,
        );

        this.lastTouch = touch;
      },
    );

    ele.addEventListener(
      "touchend",
      () => {
        this.lastTouch = undefined;
        // Hide mr.circle
        this.circle.style.opacity = "0";
      },
    );

    this.getDeviceOrientation = () => {
      if (!("screen" in globalThis)) {
        // this check should happen at startup and just crash the game & warn user, imho
        throw new Error(
          "Cannot read screen orientation because the screen object is not defined.",
        );
      }

      const { type } = globalThis.screen.orientation;

      // Orientation returns a ScreenOrientation object. The type is in the "type" property.
      // Returns 1 for landscape (the proper orientation), 0 for portrait (the improper orientation), and -1 for unknown (like array indexing).
      return type === "landscape-primary"
        ? 1
        : type === "portrait-primary"
          ? 0
          : -1;
    };
    // Callback should have a parameter that will get passed in a value relating to the return values of the method above.
    this.onOrientationChange = (callback) => {
      globalThis.addEventListener("orientationchange", () => {
        if (!("screen" in globalThis)) {
          throw new Error(
            "Cannot read screen orientation because the screen object is not defined.",
          );
        }
        const { type } = globalThis.screen.orientation;

        callback(
          type === "landscape-primary"
            ? 1
            : type === "portrait-primary"
              ? 0
              : -1,
        );
      });
    };
  }
}

export default TouchControls;
