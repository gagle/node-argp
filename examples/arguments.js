"use strict";

var argv = require ("../lib").createParser ({ once: true })
		.body ()
				//Argument
				.argument ("arg1")
				
				//Argument with a description
				.argument ("arg2", { description: "foo" })
				
				//Hidden argument
				.argument ("arg3", { hidden: true })
				
				.help ()
				.usage ()
		.argv ();

console.log (argv);

/*
$ node options.js

{
	help: false,
	usage: false,
	arg1: false,
	arg2: false,
	arg3: false
}

--------------------------------------------------------------------------------

$ node options.js --help

Usage: options [options] [arguments]

  arg1
  arg2                        foo
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit

--------------------------------------------------------------------------------

$ node options.js --usage

Usage: options [-h|--help] [--usage] [arg1] [arg2]
*/