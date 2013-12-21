"use script";

var argv = require ("../lib").createParser ({ once: true })
    .main ()
        .description ("Main menu.")
        .body ()
            .help ()
            .usage ()
    .command ("config")
        .body ()
            .argument ("set", {
              synopsis: "set <key> [<value>]",
              trailing: { min: 1, max: 2 }
            })
            .help ()
    .command ("install", { trailing: {} })
        .body ()
            .option ({ short: "g", long: "global" })
            .usage ()
    .argv ()

console.log (argv);
    
/*
$ node commands.js -h

Usage: commands [options]

Main menu.

  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
      
--------------------------------------------------------------------------------

$ node commands.js config -h

Usage: commands config [options] [arguments]

  set <key> [<value>]
  -h, --help                  Display this help message and exit

--------------------------------------------------------------------------------

$ node commands.js config set 1 2

{ config: [], set: [ 1, 2 ] }

--------------------------------------------------------------------------------

$ node commands.js install --usage

Usage: commands install [-g|--global] [--usage]

--------------------------------------------------------------------------------

$ node commands.js install 1 2 3 -g

{ install: [ 1, 2, 3 ], global: true }
*/