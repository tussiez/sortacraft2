/*
Methods

Simplifies vector and array operations

@author tussiez
@author Baconman321
@author xxpertHacker

sortagames.repl.co
*/

import { Vector3 } from '../modules/three.js';
import WASM from "./WASMLoader.js";
let WASMSubtract;
let WASMInitiated = false;
let WASMHeap;
let compiledErr;
const Methods = {
  WASMInitiate: function() {
    return WASM.compile("../WASM/Math/Math.wasm").then(function(res){
      WASMSubtract = res.subtractArrays;
      WASMHeap = res.memory;
      WASMInitiated = true;
    }).catch(function(err) {
      compiledErr = err;
      WASMInitiated = true;
    });
  },
  WASMInitiateS: function(){
    return WASM.compileS("../WASM/Math/Math.wasm").then(function(res){
      WASMSubtract = res.subtractArrays;
      WASMHeap = res.memory
      WASMInitiated = true;
      return res;
    }).catch(function(err){
      compiledErr = err;
      WASMInitiated = true;
      return err;
    });
  },
  average: function(arr){
    let add = 0;
    for(let i in arr){
      add += arr[i];
    } 
    return add /= arr.length;
  },
	average2: (...argumentz) => argumentz.reduce(
		(x, y) => x + y
	) / argumentz.length,
  arrToNum: function(arr){
    let a = [];
    for(let i in arr){
      a.push(Number(arr[i]))
    };
    return a;
  },
  arrIsNum: function(arr){
    for(let i in arr){
      if(isNaN(arr[i])) return false;
    }
    return true;
  },
  string: function (arr) {
    return arr.toString();
  },
  spread: function (vec) {
    return [vec.x, vec.y, vec.z];
  },
  arr: function (string) {
    return string.split(',');
  },
  numVec: function(vec){
    vec.x = Number(vec.x);
    vec.y = Number(vec.y);
    vec.z = Number(vec.z);
    return vec;
  },
  floor: function(vec) {
    return [Math.floor(vec[0]),Math.floor(vec[1]),Math.floor(vec[2])];
  },
  sub: function(arr,ar2){
    return [arr[0]-ar2[0],arr[1]-ar2[1],arr[2]-ar2[2]];
  },
  WASMSub: function(arr1,arr2){
    /*Takes 2 arrays with 3 values in each array (must be a number) */
    if(!WASMInitiated){
      throw new Error("\"WASMSub\" cannot be used because the WASM has not been initiated.");
    }
    if ( typeof compiledErr !== typeof void 0 ){
      throw new Error("\"WASMSub\" cannot be used because the WebAssembly compilation failed with an error: " + err);
    }
    // Is this copying a JS array... or editing the exiting WASMHeap.buffer...?
	// these do nothing, no copy, no change, nothing; they merely create a view onto the heap, they don't write anyhting, see what I said below
  //OOH, yea!
    const buf = WASMHeap.buffer;
    const a = new Float64Array(buf, 8, 4);
    const b = new Float64Array(buf, 8 * a.BYTES_PER_ELEMENT, 4);
    a.set(arr1);
    b.set(arr2);
    const offset = WASMSubtract(arr1.length,arr2.length,a.byteOffset, b.byteOffset);

    return a.slice();
  },
  multiply: function(arr, amt) {
    for(let i in arr){
      arr[i] *= amt;
    }
    return arr;
  },
  divide: function(arr, amt) {
    for(let i in arr){
      arr[i] /= amt;
    }
    return arr;
  },
  numArr: function (arr) {
    let n = [];
    for (let i in arr) {
      n.push(Number(arr[i]));
    }
    return n;
  },
  arrVec: function(arr) {
    return new Vector3(...arr);
  },
  negate: function(vec) {
    vec.x = -vec.x;
    vec.y = -vec.y;
    vec.z = -vec.z;
    return vec;
  }
}

export default Methods;