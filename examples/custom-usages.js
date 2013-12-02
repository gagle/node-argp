"use strict";

/*
By default when the --help and --usage messages are printed there is only one
"usage" line. This line can be changed and multiple lines can be added with the
usages() function.
*/

require ("../lib").createParser ({ once: true })
		.usages ([
			"custom-usages <input file> <output file>",
			"custom-usages [word [word [word]]]"
		])
		.body ()
				.help ()
				.usage ()
		.argv ();

/*
$ node custom-usages.js --help

Usage: custom-usages <input file> <output file>
       custom-usages [word [word [word]]]

  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit

--------------------------------------------------------------------------------

$ custom-usages.js --usage

Usage: custom-usages <input file> <output file>
       custom-usages [word [word [word]]]
*/