"use strict";

require ("../lib")
		.readPackage ("../package.json")
		.body ()
				.help ()
				.usage ()
				.end ()
		.argv ();

/*
$ node read-package.js --help

Usage: read-package [options]

Command-line option parser

  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
  -v, --version               Output version information and exit

Report bugs to <gagle@outlook.com>.
*/