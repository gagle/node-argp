"use strict";

var argp = require ("../lib");

/*
If you want to use the -v option as the short name of --verbose, you can modify
the --version option.
*/


argp.body ()
		.option ({ short: "v", long: "verbose" })
		.help ()
		.usage ()
		.version ();

//Remove the short name

delete argp.options ().version.short;

var argv = argp.argv ();

//If you cache the module into a variable remember to null it when you finish or
//you'll produce a memory leak
argp = null;

/*
$ node modifying-builtin-options.js --help

Usage: modifying-builtin-options [options]

  -v, --verbose
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
      --version               Output version information and exit
*/