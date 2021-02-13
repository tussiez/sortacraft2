/*
Methods
Makes coding easier
@author tussiez
@coauthor Baconman321
@coauthor xxpertHacker
*/

// Removed some unnecessary code ~ xxpertHacker
// TODO(xxpertHacker): Remove all calls to Methods.WASMInitiateS and Methods.WASMInitiate

import { Vector3 } from "../modules/three.js";

const {
  Array: { from },
  Number,
  isNaN,
  Math: { floor },
} = globalThis;

const Methods = {
  arrToNum: (arr) => from(arr, Number),
  arrIsNum: (arr) => false === arr.some(isNaN),
  string: (arr) => arr.toString(),
  spread: ({ x, y, z }) => [x, y, z],
  arr: (string) => string.split(","),
  numVec: (vec) => {
    vec.x = Number(vec.x);
    vec.y = Number(vec.y);
    vec.z = Number(vec.z);

    return vec;
  },
  floor: (vec) => vec.map(floor),
  sub: (x, y) => [
    x[0] - y[0],
    x[1] - y[1],
    x[2] - y[2],
  ],
  multiply: (arr, multiplier) => (arr.forEach((_, i) => {
    arr[i] *= multiplier;
  }),
    arr),
  divide: (arr, divisor) => (arr.forEach((_, i) => {
    arr[i] /= divisor;
  }),
    arr),
  numArr: (arr) => arr.map(Number),
  arrVec: ([x, y, z]) => new Vector3(x, y, z),
  negate: (vec) => {
    vec.x = -vec.x;
    vec.y = -vec.y;
    vec.z = -vec.z;
    return vec;
  },
};

export default Methods;
