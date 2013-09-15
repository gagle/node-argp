"use strict";

var argp = require ("../lib");

argp
		.configuration ({
			showHelp: true,
			showUsage: true
		})
		.version ("v1.2.3")
		.description ("Sample app.")
		.argument ("arg1")
		.argument ("arg2")
		.body (function (body){
			body
					.option ({ short: "a", long: "aaaa" })
					.option ({ long: "b", negate: true })
					.option ({ short: "c", argument: "C" })
					.option ({ long: "d", argument: "D", value: "dddd" })
					.option ({ short: "e", argument: "E", optional: true })
					.option ({ long: "f", argument: "F", value: "ffff",
							optional: true })
					.option ({ short: "g", argument: "G", description: "gggg",
							reviver: function (value){
								return "-> " + value + " <-";
							}});
		})
		.argv ();

/*
All the lines are wrapped at 80 columns. The limit can be changed with the
"columns" property:

.configuration ({
	columns: <number>
})

--------------------------------------------------------------------------------

$ node help-usage-version.js --help

Usage: help-usage-version.js [OPTIONS] [ARGUMENTS]

Sample app.

  -a, --aaaa
      --no-b
  -c C
      --d=D
  -e[E]
      --f[=F]
  -g G                        gggg
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
  -v, --version               Output version information and exit

Report bugs to <a@b.c>.

--------------------------------------------------------------------------------

$ node help-usage-version.js --u # long options can be abbreviated, --usage

Usage: help-usage-version.js [-hva] [-c C] [-e[E]] [-g G] [--aaaa] [--b] [--d=D]
         [--f[=F]] [--help] [--usage] [--version] [arg1] [arg2]

--------------------------------------------------------------------------------

$ node help-usage-version.js -v

v1.2.3
*/