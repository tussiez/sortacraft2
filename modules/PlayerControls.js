/*
Player Controls

Simplified version of PointerLockControls (https://threejs.org/examples/jsm/controls/PointerLockControls.js)
made for SortaCraft

@author tussiez
*/

import {
  Euler,
  Vector3
 } from 'https://threejs.org/build/three.module.js'

function PlayerControls(camera){
  this.minPolarAngle = 0;
  this.maxPolarAngle = Math.PI;
  this.pi2 = Math.PI/2;
  this.euler = new Euler(0,0,0,'YXZ');
  this.vec = new Vector3();

  this.getDir = function(){
    return new Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  }
  this.right = function(dist){
    this.vec.setFromMatrixColumn(camera.matrix,0);
    camera.position.addScaledVector(this.vec,dist);
  }
  this.forward = function(dist) {
    this.vec.setFromMatrixColumn(camera.matrix,0);
    this.vec.crossVectors(camera.up, this.vec);
    camera.position.addScaledVector(this.vec,dist);
  }
  this.look = function(x,y){
    this.euler.setFromQuaternion(camera.quaternion);
    this.euler.y -= x * 0.002;
    this.euler.x -= y * 0.002;
    this.euler.x = Math.max(this.pi2 - this.maxPolarAngle, Math.min(this.pi2 - this.minPolarAngle, this.euler.x));
    camera.quaternion.setFromEuler(this.euler);
  }
}

export default PlayerControls;