/*
Player Controls

Simplified version of PointerLockControls (https://threejs.org/examples/jsm/controls/PointerLockControls.js)
made for SortaCraft

@author tussiez

sortagames.repl.co
*/

import {
  Euler,
  Vector3
} from 'https://threejs.org/build/three.module.js'

function PlayerControls(camera) {
  this.minPolarAngle = 0;
  this.maxPolarAngle = Math.PI;
  this.pi2 = Math.PI / 2;
  this.euler = new Euler(0, 0, 0, 'YXZ');
  this.vec = new Vector3();

  this.getDir = function () {
    return new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  }
  this.generateSplit = function (vec) {
    return [new Vector3(vec.x, 0, 0), new Vector3(0, vec.y, 0), new Vector3(0, 0, vec.z)];
  }
  this.checkIntersect = function (x, y, z, camera, inter, dist) {
    let i = 3;
    let ar = [x, y, z]
    while (i--) {
      let y = ar[i];
      camera.position.addScaledVector(y, dist);
      if (inter() === true) {
        camera.position.addScaledVector(y.negate(), dist);
      }
      
      camera.position.y -= 1.5;
      if(inter() === true) {
        camera.position.addScaledVector(y.negate(),dist);
      }
      camera.position.y += 1.5;
      
    }
  }
  this.right = function (dist, inter) {
    this.vec.setFromMatrixColumn(camera.matrix, 0);
    let [x, y, z] = this.generateSplit(this.vec);
    this.checkIntersect(x, y, z, camera, inter, dist);
  }
  this.forward = function (dist, inter) {
    this.vec.setFromMatrixColumn(camera.matrix, 0);
    this.vec.crossVectors(camera.up, this.vec);
    let [x, y, z] = this.generateSplit(this.vec);
    this.checkIntersect(x, y, z, camera, inter, dist);
  }
  this.look = function (x, y) {
    this.euler.setFromQuaternion(camera.quaternion);
    this.euler.y -= x * 0.002;
    this.euler.x -= y * 0.002;
    this.euler.x = Math.max(this.pi2 - this.maxPolarAngle, Math.min(this.pi2 - this.minPolarAngle, this.euler.x));
    camera.quaternion.setFromEuler(this.euler);
  }
}

export default PlayerControls;