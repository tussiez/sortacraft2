/*
Commands
Basic command system to set/get client info
@author tussiez
@coauthor xxpertHacker
*/

import Methods from "../modules/Methods.js";
const { Number } = globalThis;

// is this.message undefined?

const Commands = {
  supported: ["tp", "pos", "fps", "help", "speed"],
  parse(str, Player) {
    // suggestion, use a switch case with a default:, or use a struct/Map of callbacks for each command and check if the property exists in hte object first ~ xxpertHacker
    if (!str.startsWith("/")) {
      // Not a command
      this.message(`[You]: ${str}`);
      return;
    } else {
      const [cmd, ...args] = str.replace("/", "").split(" ");

      // Commands
      if ("tp" === cmd) {
        if (
          args.length == 3 && Methods.arrIsNum(Methods.arrToNum(args)) == true
        ) {
          // Command is 'tp', there are 3 arguments (x,y,z) && the array is comprised of numbers
          Player.camera.position.set(...Methods.arrToNum(args)); // Spread lol

          this.message(
            "[Game]: Teleported to " + (Methods.string(Methods.arrToNum(args))),
          );
        } else {
          this.message(
            "[Game]: Invalid arguments, check your syntax and try again",
          );
        }
      } else if ("fps" === cmd) {
        this.message("[Game]: " + Player.fps + " fps");
      } else if ("speed" === cmd) {
        if (
          1 === args.length &&
          true === Methods.arrIsNum(Methods.arrToNum(args.slice(0, 1)))
        ) {
          Player.speed = Number(args[0]);
          // use speed for message instead?
          this.message("[Game]: Set speed to " + args[0]);
        } else {
          this.message("[Game]: Invalid argument - use a number");
        }
      } else if ("pos" === cmd) {
        this.message(
          "[Game]: Your position is " + (
            Methods.string(
              Methods.arrToNum(
                Methods.floor(
                  Methods.spread(
                    Player.camera.position,
                  ),
                ),
              ),
            )
          ),
        );
      } else if ("help" === cmd) {
        this.message("[Game]: Supported: " + Methods.string(this.supported));
      } else if (false === this.supported.includes(cmd)) {
        // check this before anything else
        this.message("[Game]: Unknown command - Try /help");
      }
    }
  },
};

export default Commands;
