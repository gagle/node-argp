"use strict";

require ("../lib")
		.description ("Sample app.")
		.body ()
				.help ()
				.usage ()
				.version ("v1.2.3")
		.argv ();

/*
$ node abbreviations.js --he

Usage: abbreviations [options]

Sample app.

  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
  -v, --version               Output version information and exit

--------------------------------------------------------------------------------

$ node abbreviations.js --u

Usage: abbreviations [-h|--help] [--usage] [-v|--version]

--------------------------------------------------------------------------------

$ node abbreviations.js --ver

v1.2.3
*/