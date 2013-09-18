"use strict";

require ("../lib")
		.description ("Sample app.")
		.body ()
				.argument ("arg1")
				.argument ("arg2")
				.option ({ short: "a", long: "aaaa" })
				.option ({ long: "b", negate: true })
				.option ({ short: "c", argument: "C" })
				.option ({ long: "d", argument: "D", value: "dddd" })
				.option ({ short: "e", argument: "E", optional: true })
				.option ({ long: "f", argument: "F", value: "ffff",
						optional: true })
				.option ({ short: "g", argument: "G", description: "gggg",
						reviver: function (value){
							return value + "foo";
						}})
				.help ()
				.usage ()
				.version ("v1.2.3")
				.end ()
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

  arg1
  arg2

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

--------------------------------------------------------------------------------

$ node help-usage-version.js --usage

Usage: help-usage-version.js [-hva] [-c C] [-e[E]] [-g G] [--aaaa] [--b] [--d=D]
         [--f[=F]] [--help] [--usage] [--version] [arg1] [arg2]

--------------------------------------------------------------------------------

$ node help-usage-version.js -v

v1.2.3
*/