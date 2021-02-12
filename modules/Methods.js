/*
Methods
Makes coding easier
@author tussiez
*/

import {Vector3} from '../modules/three.js';
import WASM from "./WASMLoader.js";
let WASMSubtract;
let WASMInitiated = false;
let compiledErr;
const Methods = {
  WASMInitiate: function(){
    return WASM.compile("../WASM/Math/Math.wasm").then(function(res){
      WASMSubtract = res.subtractArrays;
      WASMInitiated = true;
    }).catch(function(err){
      compiledErr = err;
      WASMInitiated = true;
    });
  },
  WASMInitiateS: function(){
    return WASM.compileS("../WASM/Math/Math.wasm").then(function(res){
      WASMSubtract = res.subtractArrays;
      WASMInitiated = true;
      return res;
    }).catch(function(err){
      compiledErr = err;
      WASMInitiated = true;
      return err;
    });
  },
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
  // DOESN'T WORK
  WASMSub: function(arr1,arr2){
    /*Takes 2 arrays with 3 values in each array (must be a number) */
    if(!WASMInitiated){
      throw new Error("\"WASMSub\" canot be used because the WASM has not been initiated.");
    }
    if(typeof compiledErr !== typeof void 0 ){
      throw new Error("\"WASMSub\" cannot be used because the WebAssembly compilation failed with an error: " + err);
    }
    return WASMSubtract(arr1,arr2);
  },
  multiply: function(arr,amt){
    for(let i in arr){
      arr[i] *= amt;
    }
    return arr;
  },
  divide: function(arr,amt){
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
  arrVec: function(arr){
    return new Vector3(...arr);
  },
  negate: function(vec){
    vec.x = -vec.x;
    vec.y = -vec.y;
    vec.z = -vec.z;
    return vec;
  }
}
export default Methods;