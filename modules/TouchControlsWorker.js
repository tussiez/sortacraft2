
/*
TouchControlsWorker

Responds to touch events from DOM in WebWorker
for SortaCraft

@author tussiez
@author Baconman321
@author xxpertHacker

sortagames.repl.co
*/
import { Euler, Vector3 } from "https://threejs.org/build/three.module.js";

const { max, min, PI } = Math;


const TouchControlsWorker = function (camera,keys) {
  if (!camera) throw new Error("Require camera");

  this.euler = new Euler(0, 0, 0, "YXZ");
  this.vec = new Vector3(),
  this.pi2 = PI / 2,
  this.moveSpeed = 12;
  this.camera = camera;

  this.look = (moveX,moveY) => {
    const { euler, moveSpeed, pi2, camera } = this;

    euler.setFromQuaternion(camera.quaternion);

    {
      const temp = moveSpeed / 1000;

      euler.x -= moveY * temp;
      euler.y -= moveX * temp;
    }

    const halfPI = PI / 2.0;

    euler.x = max(halfPI - PI, min(halfPI, euler.x));

    camera.quaternion.setFromEuler(euler);
  }

  this.onForward = () => keys.add('w');
  this.onBackward = () => keys.add('s');
  this.onLeft = () => keys.add('a');
  this.onRight = () => keys.add('d');
  this.onForwardEnd = () => keys.delete('w');
  this.onBackwardEnd = () => keys.delete('s');
  this.onLeftEnd = () => keys.delete('a');
  this.onRightEnd = () => keys.delete('d');
  this.onJump = () => keys.add(' ');
  this.onJumpEnd = () => keys.delete(' ');
}
export default TouchControlsWorker;