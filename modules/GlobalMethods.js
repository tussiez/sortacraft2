/*
Methods useful for and accessable to any program reguardless of it's thread*.
@Author Baconman321
@Co-author xxpertHacker

*: Only uses native functions that typically are available on different threads, like console.log.

*/

const {
  console: { log },
  Boolean,
} = globalThis;

let debugMode = false;

const debugModeInterface = {
  set value(bool) {
    debugMode = Boolean(bool);
  },
  get value() {
    return debugMode;
  },
};

const nop = (...args) => {};

const GlobalM = {
  get log() {
    return debugMode === true ? log : nop;
  },

  debugMode: debugModeInterface,
};

export default GlobalM;
