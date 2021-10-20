/*
Commands

Commands system

@author tussiez

sortagames.repl.co
*/

import Methods from '../modules/Methods.js'

const Commands = {
  supported: ['tp', 'pos', 'fps', 'help', 'speed', 'seed', 'fog', 'renderdist','fly','daycycle','graphics'],
  parse: function (str, Player) {
    if (!str.startsWith('/')) {
      this.message('<You> ' + str);
      return;
    }; // Not a command
    let cmd = str.replace('/', '').split(' ')[0];
    let args = str.replace('/', '').split(' ').splice(1)

    // Commands
    if (cmd == 'tp') {
      if (args.length == 3 && Methods.arrIsNum(Methods.arrToNum(args)) == true) {
        // Command is 'tp', there are 3 arguments (x,y,z) && the array is comprised of numbers
        Player.camera.position.set(...Methods.arrToNum(args)); //Spread lol

        this.message("<Game> Teleported to " + (Methods.string(Methods.arrToNum(args))));
      } else {
        this.message("<Game> Invalid arguments, check your syntax and try again");
      }
    }

    if (cmd == 'fps') {
      this.message("<Game> " + Player.fps + " fps");
    }

    if (cmd == 'seed') {
      this.message("<Game> Seed: " + Player.seed)
    }

    if (cmd == 'fog') {
      if (args.length == 1 && !isNaN(Number(args[0]))) {
        Player.fogDensityMult = Number(args[0]);
        Player.updateFog();
      } else {
        this.message("<Game> Fog: " + Player.fogDensityMult + ", set with /fog #");

      }
    }

    if (cmd == 'speed') {
      if (args.length == 1 && Methods.arrIsNum(Methods.arrToNum([args[0]])) == true) {
        Player.speed = Number(args[0]);
        this.message("<Game> Set speed to " + args[0])
      } else if (args.length == 1 && !Methods.arrIsNum(Methods.arrToNum([args[0]]))) {
        this.message("<Game> Invalid argument - use a number")
      } else if (args.length == 0) {
        this.message("<Game> Player speed: " + Player.speed + ", set with /speed #");
      }
    }

    if (cmd == 'pos') {
      this.message("<Game> Your position is " + (
        Methods.string(
          Methods.arrToNum(
            Methods.floor(
              Methods.spread(
                Player.camera.position
              )
            )
          )
        )
      )
      );
    }
    
    if(cmd == 'fly') {
      Player.fly = !Player.fly;
      this.message("<Game> Flying is: " + (Player.fly === true ? "enabled" : "disabled"));
    }

    if(cmd === 'graphics') {
      Player.setGraphics(!Player.graphicsMode);
      this.message("<Game> Changed graphics mode to "+(Player.graphicsMode === true ? 'fancy' : 'fast [shadowmap baked]'));
    }

    if (cmd == 'renderdist') {
      if (args.length == 1 && Methods.arrIsNum(Methods.arrToNum([args[0]])) == true) {
        let dist = Number(args[0]);
        if (dist > 1 && dist <= 12) {
          Player.setRenderDist(dist);
          this.message("<Game> Set render distance to " + dist + " chunks")
        } else {
          this.message("<Game> Allowed values for render distance: 2-12");
        }
      } else {
        this.message("<Game> Render dist: " + Player.getRenderDist()+", set with /renderdist #");
      }
    }
    if(cmd == 'daycycle') {
      Player.sunCycle = !Player.sunCycle;
      this.message("<Game> Day cycle: "+Player.sunCycle);
    }
    if (cmd == 'help') {
      this.message("<Game> Supported: " + Methods.string(this.supported))
    }


    if (!this.supported.includes(cmd)) {
      this.message('<Game> Unknown command - Try /help')
    }
  }
}

export default Commands;