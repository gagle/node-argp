"use strict";

var parser = require ("../lib").createParser ({ once: true });
parser
    .body ()
        .option ({ short: "v", long: "verbose" })
        .help ()
        .usage ()
        //Disable -v option
        .version ("v1.2.3", { short: false });

parser.options ().help.description = "???";

var argv = parser.argv ();

//Zero memory footprint!
parser = null;

console.log (argv);

/*
$ node modifying-builtin-options.js --help

Usage: modifying-builtin-options [options]

  -v, --verbose
  -h, --help                  ???
      --usage                 Display a short usage message and exit
      --version               Output version information and exit
*/