"use strict";

var argv = require ("../lib")
		.body ()
				.option ({ short: "v", long: "verbose" })
				.help ()
				.usage ()
				//Disable -v option
				.version ("v1.2.3", { short: false })
				.argv ();

console.log (argv);

/*
$ node modifying-builtin-options.js --help

Usage: modifying-builtin-options [options]

  -v, --verbose
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
      --version               Output version information and exit
*/