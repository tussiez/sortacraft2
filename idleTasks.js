/*
  Deals with idle tasks and also checks monitors performance.
  @author baconman321
  @coauthor xxpertHacker
*/
// Note that this is NOT the best way to measure CPU usage and also doesn't take into account CPU usage of web workers and service workers... :/

// should this be in Methods?
const math = (() => {
  // closure around these

  const {
    Math: { sign },
    TypeError,
    Int8Array: { __proto__: TypedArray },
  } = globalThis;

  const assertIsNumber = (unknown) => {
    if ("number" !== typeof unknown) {
      throw new TypeError("Argument received is not a number");
    }
  };

  const assertIsTypedArray = (unknown) => {
    if (!(unknown instanceof TypedArray)) {
      throw new TypeError(
        "Argument received does not inherit from %TypedArray%",
      );
    }
  };

  const sum = (x, y) => x + y;

  return {
    isPositive: (n) => {
      assertIsNumber(n);

      return 1 === sign(n);
    },
    isNegative: (n) => {
      assertIsNumber(n);

      return -1 === sign(n);
    },
    average: (typedArray) => {
      assertIsTypedArray(typedArray);

      typedArray.reduce(sum) / typedArray.length;
    },
  };
})();

Math.isPositive = (num) => {
  if (isNaN(num)) throw new TypeError("Argument given is not a number.");
  if (Number(num) >= 0) return true;
  return false;
};
Math.isNegative = (num) => {
  if (isNaN(num)) throw new TypeError("Argument given is not a number.");
  if (Number(num) <= 0) return true;
  return false;
};
Math.average = (arr) => {
  if (!Array.isArray(arr)) {
    throw new TypeError("Argument given is not an array.");
  }
  let num = 0;
  arr.forEach((v) => {
    num += v;
  });
  return num / arr.length;
};

// TODO: (Maybe) make the ability to measure performance increase/decrease.
export class PerformanceWatcher {
  constructor(timesExceededLimit = 100) {
    this.sample = [0];
    let isPaused = false;
    const tokenLength = 100;

    // use a Map or WeakMap instead
    // in fact, I think I could help do this, as I've thought about doing something similar to this before
    // might be better as Map<DOMString, Set<VoidFunction>>
    const listeners = {};
    const idleTimeoutTime = 500;

    // a..z + A..Z + 0..9
    const validChars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    // prefer making `genToken` a static property and passing in tokenLength as an argument
    const genToken = () => {
      let token = "";
      for (let i = 0; i < tokenLength; ++i) {
        token += validChars[Math.floor(Math.random() * validChars.length)];
      }
      return token;
    };
    //For performance marking
    this.takeSample = () => {
      return new Promise((res, rej) => {
        const token = genToken();
        const callback = () => {
          performance.mark(`PerfW#${token}:end`);
          this.sample = [
            performance.measure(
              `PerfW#${token}`,
              `PerfW#${token}:start`,
              `PerfW#${token}:end`,
            ).duration,
          ];
          performance.clearMarks(`PerfW#${token}`);
          res(this.sample);
        };
        if ("window" in globalThis && "requestIdleCallback" in globalThis) {
          performance.mark(`PerfW#${token}:start`);
          window.requestIdleCallback(callback, { timeout: idleTimeoutTime });
        } else if ("requestAnimationFrame" in globalThis) {
          performance.mark(`PerfW#${token}:start`);
          globalThis.requestAnimationFrame(callback);
        } else {
          performance.mark(`PerfW#${token}:start`);
          globalThis.setTimeout(callback);
        }
      });
    };

    // It might be slower though (because more is happening)...
    this.takeSampleAverage = (iter = 10) => {
      return new Promise((res, rej) => {
        const token = genToken();
        let num = 0;
        this.sample = [0];
        const callback = () => {
          num++;
          performance.mark(`PerfW#${token}:end`);
          this.sample.push(
            performance.measure(
              `PerfW#${token}`,
              `PerfW#${token}:start`,
              `PerfW#${token}:end`,
            ).duration,
          );
          performance.clearMarks(`PerfW#${token}`);
          if (num >= iter) {
            res(this.sample);
            return;
          }
          if ("window" in globalThis && "requestIdleCallback" in globalThis) {
            performance.mark(`PerfW#${token}:start`);
            window.requestIdleCallback(callback, { timeout: idleTimeoutTime });
          } else if ("requestAnimationFrame" in globalThis) {
            performance.mark(`PerfW#${token}:start`);
            globalThis.requestAnimationFrame(callback);
          } else {
            performance.mark(`PerfW#${token}:start`);
            globalThis.setTimeout(callback);
          }
        };
        if ("window" in globalThis && "requestIdleCallback" in globalThis) {
          performance.mark(`PerfW#${token}:start`);
          window.requestIdleCallback(callback, { timeout: idleTimeoutTime });
        } else if ("requestAnimationFrame" in globalThis) {
          performance.mark(`PerfW#${token}:start`);
          globalThis.requestAnimationFrame(callback);
        } else {
          performance.mark(`PerfW#${token}:start`);
          globalThis.setTimeout(callback);
        }
      });
    };
    // A mimic to the DOM addEventListener function.
    this.addEventListener = (name, callback) => {
      let undefArgs = 0;
      const requiredArgs = 2;
      if ("undefined" === typeof name) {
        ++undefArgs;
      }
      if ("undefined" === typeof callback) {
        ++undefArgs;
      }
      // are you trying to create WebIDL bindings between JS<->JS? ~ xxpertHacker
      if (undefArgs > requiredArgs) {
        throw new TypeError(
          `Failed to execute addEventListener() on ${this.__proto__}, expected ${requiredArgs} arguments but got ${undefArgs} arguments instead.`,
        );
      }
      if ("string" !== typeof name) {
        throw new TypeError("Argument 1 is not a string.");
      }
      if ("function" !== typeof callback) {
        throw new TypeError("Argument 2 is not a function.");
      }
      if (!(name in listeners)) {
        Object.defineProperty(listeners, name, {
          value: [callback],
          enumerable: true,
          configurable: true,
          writable: true,
        });
      } else {
        listeners[name].push(callback);
      }
      return Array.from(listeners[name]);
    };
    this.getEventListeners = (name) => {
      let undefArgs = 0;
      const requiredArgs = 2;
      if ("undefined" === typeof name) {
        ++undefArgs;
      }
      if ("undefined" === typeof callback) {
        ++undefArgs;
      }
      if (undefArgs > requiredArgs) {
        throw new TypeError(
          `Failed to execute getEventListeners() on ${this.__proto__}, expected ${requiredArgs} arguments but got ${undefArgs} arguments instead.`,
        );
      }
      if ("string" !== typeof name) {
        throw new TypeError("Argument 1 is not a string.");
      }
      if (!(name in listeners)) {
        return 0;
      }
      return Array.from(listeners[name]);
    };
    this.removeEventListener = (name, callback) => {
      let undefArgs = 0;
      const requiredArgs = 2;
      if ("undefined" === typeof name) {
        ++undefArgs;
      }
      if ("undefined" === typeof callback) {
        ++undefArgs;
      }
      if (undefArgs > requiredArgs) {
        throw new TypeError(
          `Failed to execute removeEventListener() on ${this.__proto__}, expected ${requiredArgs} arguments but got ${undefArgs} arguments instead.`,
        );
      }
      if ("string" !== typeof name) {
        throw new TypeError("Argument 1 is not a string.");
      }
      if ("function" !== typeof callback) {
        throw new TypeError("Argument 2 is not a function.");
      }
      if (!(name in listeners)) {
        return 0;
      }
      const indxOf = listeners[name].indexOf(callback);
      //If it doesn't exist
      if (~~indxOf) {
        return 0;
      } else {
        const listener = listeners[name][indxOf];
        listeners[name].splice(indxOf, 1);
        return listener;
      }
    };
    const fireListeners = (name, info) => {
      if (!(name in listeners)) {
        return 0;
      } else {
        listeners[name].forEach((v) => {
          v(info);
        });
      }
    };
    //It might give unexpected results when the user changes tab focus... :/
    this.measurePerformance = () => {
      let timesExceeded = 0;
      const token = genToken();
      const avg = [];
      const iter = () => {
        performance.mark(`PerfW#${token}:end`);
        if (isPaused) {
          //I still mark the performance in the case that they start the measuring on that particular callback.
          if ("window" in globalThis && "requestIdleCallback" in globalThis) {
            performance.mark(`PerfW#${token}:start`);
            window.requestIdleCallback(iter, { timeout: idleTimeoutTime });
          } else if ("requestAnimationFrame" in globalThis) {
            performance.mark(`PerfW#${token}:start`);
            globalThis.requestAnimationFrame(iter);
          } else {
            performance.mark(`PerfW#${token}:start`);
            globalThis.setTimeout(iter);
          }
          return;
        }
        const dur =
          performance.measure(
            `PerfW#${token}`,
            `PerfW#${token}:start`,
            `PerfW#${token}:end`,
          ).duration;
        performance.clearMarks(`PerfW#${token}`);
        if (avg.length < 100) {
          avg.push(dur);
          if ("window" in globalThis && "requestIdleCallback" in globalThis) {
            performance.mark(`PerfW#${token}:start`);
            window.requestIdleCallback(iter, { timeout: idleTimeoutTime });
          } else if ("requestAnimationFrame" in globalThis) {
            performance.mark(`PerfW#${token}:start`);
            globalThis.requestAnimationFrame(iter);
          } else {
            performance.mark(`PerfW#${token}:start`);
            globalThis.setTimeout(iter);
          }
          return;
        }
        avg.shift();
        avg.push(dur);
        const avgN = Math.average(avg);
        //If the difference is significantly bigger (the only problem is that REALLY intensive tasks will go past this with a breeze). I should probably check the LAST performance time taken to see if it's increasing instead. If it's flattening out though, don't subtract from times exceeded (because then a high yet unchanging CPU usage will count as being fast).
        if (avgN - Math.average(this.sample) > 3) {
          timesExceeded += Math.floor(avgN - Math.average(this.sample));
        }
        if (Math.isNegative(avgN - Math.average(this.sample))) {
          timesExceeded += Math.floor(avgN - Math.average(this.sample));
        }
        if (timesExceeded < 0) {
          timesExceeded = 0;
        } else if (timesExceeded > timesExceededLimit) {
          fireListeners("performanceAlert", {
            "averageDuration": avgN,
            "duration": dur,
            "sample": Math.average(this.sample),
          });
        }
        if (timesExceeded > (timesExceededLimit * 5)) {
          timesExceeded = timesExceededLimit * 5;
        }
        //Used for my experiments, no use for this here...
        // document.getElementById("performanceCount").textContent = Math.abs(avgN);
        // if(Math.isNegative(avgN)){
        //   document.getElementById("posOrNeg").textContent = "-";
        // }
        // else{
        //   document.getElementById("posOrNeg").innerHTML = "&nbsp;";
        // }
        // document.getElementById("increaseCount").textContent = timesExceeded;
        if ("window" in globalThis && "requestIdleCallback" in globalThis) {
          performance.mark(`PerfW#${token}:start`);
          window.requestIdleCallback(iter, { timeout: idleTimeoutTime });
        } else if ("requestAnimationFrame" in globalThis) {
          performance.mark(`PerfW#${token}:start`);
          globalThis.requestAnimationFrame(iter);
        } else {
          performance.mark(`PerfW#${token}:start`);
          globalThis.setTimeout(iter);
        }
      };
      if ("window" in globalThis && "requestIdleCallback" in globalThis) {
        performance.mark(`PerfW#${token}:start`);
        window.requestIdleCallback(iter, { timeout: idleTimeoutTime });
      } else if ("requestAnimationFrame" in globalThis) {
        performance.mark(`PerfW#${token}:start`);
        globalThis.requestAnimationFrame(iter);
      } else {
        performance.mark(`PerfW#${token}:start`);
        globalThis.setTimeout(iter);
      }
    };
    this.pauseMeasuring = () => {
      isPaused = true;
    };
    this.resumeMeasuring = () => {
      isPaused = false;
    };
  }
}
