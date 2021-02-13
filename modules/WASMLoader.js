/*
WASM Compilation handler
@author Baconman321
@coauthor xxperthacker
*/

// dead code
const {
  WebAssembly: { instantiateStreaming },
  fetch,
} = globalThis;

const compileS = async (path) =>
  (await instantiateStreaming(fetch(path))).instance.exports;

export default compileS;
