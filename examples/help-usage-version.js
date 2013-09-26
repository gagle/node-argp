"use strict";

require ("../lib")
		.description ("Sample app.")
		.body ()
				.argument ("arg1")
				.argument ("arg2")
				.option ({ short: "a", long: "aaaa" })
				.option ({ long: "b", negate: true })
				.option ({ short: "c", argument: "C" })
				.option ({ long: "d", argument: "D", default: "dddd" })
				.option ({ short: "e", argument: "E", optional: true })
				.option ({ long: "f", argument: "F", default: "ffff",
						optional: true })
				.option ({ short: "g", argument: "G", aliases: ["foo", "bar"]})
				.help ()
				.usage ()
				.version ("v1.2.3")
				.end ()
		.argv ();

/*
$ node help-usage-version.js --help

Usage: help-usage-version [options] [arguments]

Sample app.

  arg1
  arg2
  -a, --aaaa
      --no-b
  -c C
      --d=D
  -e[E]
      --f[=F]
  -g, --foo, --bar=G
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
  -v, --version               Output version information and exit

--------------------------------------------------------------------------------

$ node help-usage-version.js --usage

Usage: help-usage-version [-c C] [-e[E]] [-a|--aaaa] [--b] [--d=D] [--f[=F]]
         [-g|--foo|--bar=G] [-h|--help] [--usage] [-v|--version] [arg1] [arg2]

--------------------------------------------------------------------------------

$ node help-usage-version.js -v

v1.2.3
*/