import Methods from '../modules/Methods.js'

const Commands = {
  supported: ['tp', 'pos'],
  parse: function (str, Player) {
    if (!str.startsWith('/')) return; // Not a command
    let cmd = str.replace('/', '').split(' ')[0];
    let args = str.replace('/', '').split(' ').splice(1)


    // Commands
    if (cmd == 'tp' && args.length == 3 && Methods.arrIsNum(Methods.arrToNum(args)) == true) {
      // Command is 'tp', there are 3 arguments (x,y,z) && the array is comprised of numbers
      Player.camera.position.set(...Methods.arrToNum(args)); //Spread lol

      this.message("[Game]: Teleported to " + (Methods.string(Methods.arrToNum(args))));
    }

    if (cmd == 'pos') {
      this.message("[Game]: Your position is " + (
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

    if (!this.supported.includes(cmd)) {
      this.message('[Game]: Unsupported command.. :/')
    }
  }
}

export default Commands;