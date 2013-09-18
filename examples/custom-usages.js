"use strict";

/*
By default when the help or usage messages are printed there is only one usage
line. The [ARGUMENTS] part can be changed and multiple lines can be added with
the usage() function.
*/

require ("../lib")
		.usages ([
			"<input file> <output file>",
			"[word [word [word]]]"
		])
		.body ()
				.help ()
				.usage ()
				.end ()
		.argv ();

/*
$ node custom-usages.js --help

Usage: custom-usages.js [OPTIONS] <input file> <output file>
       custom-usages.js [OPTIONS] [word [word [word]]]

  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit

--------------------------------------------------------------------------------

$ custom-usages.js --usage

Usage: custom-usages.js [-h] [--help] [--usage] <input file> <output file>
       custom-usages.js [-h] [--help] [--usage] [word [word [word]]]

*/