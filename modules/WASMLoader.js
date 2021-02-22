/*
WASM Compilation handler
@author Baconman321
Runs in main thread
*/

const WASM = {
  compile: function(wasmPath){
    if(typeof wasmPath === typeof void 0){
      throw new TypeError("Parameter \"wasmPath\" (argument 1) is not defined.");
    }
    return new Promise(function(res,rej){
      fetch(wasmPath).then(response =>
        response.arrayBuffer()
      ).then(bytes => WebAssembly.instantiate(bytes)).then(results => {
        let instance = results.instance;
        res(instance.exports);
      }).catch(function(err){
        rej(err);
      });
    });
  },
  /*instantiateStreaming instead*/
  compileS: async function(wasmPath){
    if(typeof wasmPath === typeof void 0){
      throw new TypeError("Parameter \"wasmPath\" (argument 1) is not defined.");
    }
    return (await WebAssembly.instantiateStreaming(fetch(wasmPath))).instance.exports;
  }
};
export default WASM;