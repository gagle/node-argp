"use strict";

require ("../lib")
		.readPackage ("../package.json")
		//If you use readPackage(), you can write text lines between the ---version
		//option and the email using the footer() function
		.footer ("Sample footer");
		.body ()
				.help ()
				.usage ()
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