"use strict";

var argp = require ("../lib");

argp
		.description ("Sample app.")
		.body ()
				.help ()
				.usage ()
				.version ("v1.2.3")
				.end ()
		.argv ();

/*
$ node abbreviations.js --he

Usage: help-usage-version.js [OPTIONS] [ARGUMENTS]

Usage: abbreviations.js [OPTIONS]

Sample app.

  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
  -v, --version               Output version information and exit

--------------------------------------------------------------------------------

$ node abbreviations.js --u

Usage: abbreviations.js [-hv] [--help] [--usage] [--version]

--------------------------------------------------------------------------------

$ node help-usage-version.js --ver

v1.2.3
*/