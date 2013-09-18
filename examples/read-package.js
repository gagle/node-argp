"use strict";

require ("../lib")
		.readPackage ("../package.json")
		.body ()
				.argument ("arg1")
				.argument ("arg2")
				.option ({ short: "a", long: "aa", description: "aaaa" })
				.option ({ short: "b", long: "bb", description: "bbbb",
						argument: "bb", optional: true, value: 5, type: Number })
				.help ()
				.usage ()
				.end ()
		.argv ();

/*
$ node read-package.json --help

Usage: read-package.js [OPTIONS] [ARGUMENTS]

Command-line option parser

  arg1
  arg2

  -a, --aa                    aaaa
  -b, --bb[=bb]               bbbb
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
  -v, --version               Output version information and exit

Report bugs to <gagle@outlook.com>.
*/