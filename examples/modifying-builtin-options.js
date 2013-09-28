"use strict";

var argp = require ("../lib");

argp
		.body ()
				.option ({ short: "v", long: "verbose" })
				.help ()
				.usage ()
				//Disable -v option
				.version ("v1.2.3", { short: false });

argp.options ().help.description = "???";

var argv = argp.argv ();
//If you cache the module, remember to null it when you finish with it
argp = null;

console.log (argv);

/*
$ node modifying-builtin-options.js --help

Usage: modifying-builtin-options [options]

  -v, --verbose
  -h, --help                  ???
      --usage                 Display a short usage message and exit
      --version               Output version information and exit
*/