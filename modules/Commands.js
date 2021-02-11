import Methods from "../modules/Methods.js";

const Commands = {
  supported: ["tp", "pos", "fps", "help", "speed"],
  parse: function (str, Player) {
    if (!str.startsWith("/")) {
      this.message("[You]: " + str);
      return;
    }// Not a command
    let cmd = str.replace("/", "").split(" ")[0];
    let args = str.replace("/", "").split(" ").splice(1);

    // Commands
    if (cmd == "tp") {
      if (
        args.length == 3 && Methods.arrIsNum(Methods.arrToNum(args)) == true
      ) {
        // Command is 'tp', there are 3 arguments (x,y,z) && the array is comprised of numbers
        Player.camera.position.set(...Methods.arrToNum(args)); //Spread lol

        this.message(
          "[Game]: Teleported to " + (Methods.string(Methods.arrToNum(args))),
        );
      } else {
        this.message(
          "[Game]: Invalid arguments, check your syntax and try again",
        );
      }
    }

    if (cmd == "fps") {
      this.message("[Game]: " + Player.fps + " fps");
    }

    if (cmd == "speed") {
      if (
        args.length == 1 &&
        Methods.arrIsNum(Methods.arrToNum([args[0]])) == true
      ) {
        Player.speed = Number(args[0]);
        this.message("[Game]: Set speed to " + args[0]);
      } else {
        this.message("[Game]: Invalid argument - use a number");
      }
    }

    if (cmd == "pos") {
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
    }

    if (cmd == "help") {
      this.message("[Game]: Supported: " + Methods.string(this.supported));
    }

    if (!this.supported.includes(cmd)) {
      this.message("[Game]: Unknown command - Try /help");
    }
  },
};

export default Commands;
