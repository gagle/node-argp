"use strict";

var argp = require ("../lib");

/*
By default when the help or usage messages are printed there is only one usage
line. The [ARGUMENTS] part can be changed and multiple lines can be added with
the usage() function.
*/

argp
		.configuration ({
			showHelp: true,
			showUsage: true
		})
		.usage ("<input file> <output file>")
		.usage ("[word [word [word]]]")
		.argv ();

/*
$ node custom-usages.js --help

Usage: custom-usages.js [OPTIONS] <input file> <output file>
       custom-usages.js [OPTIONS] [word [word [word]]]

  -h, --help                  Display this help and exit
      --usage                 Display a short usage message and exit

--------------------------------------------------------------------------------

$ custom-usages.js --usage

Usage: custom-usages.js [-h] [--help] [--usage] <input file> <output file>
       custom-usages.js [-h] [--help] [--usage] [word [word [word]]]

*/