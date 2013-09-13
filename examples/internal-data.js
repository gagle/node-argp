"use strict";

var argp = require ("../lib");

/*
The arguments() and options() functions returns the configured arguments and
options for informational purposes. For example, they can be used to change the
--help, --usage and --version descriptions.
*/

argp
		.configuration ({
			showHelp: true
		})
		.version ("v1.2.3")
		.description ("Sample app.")
		.email ("a@b.c")
		.argument ("arg1")
		.argument ("arg2")
		.body (function (body){
			body
					.group ("Group 1")
					.option ({ short: "a", long: "aa", description: "aaaa" })
					.option ({ short: "b", long: "bb", description: "bbbb",
							argument: "bb", optional: true, value: 5 })
					.text ("This is a random text.")
		});

console.log (argp.arguments ());

/*
{
	arg1: true,
	arg2: true
}
*/

console.log (argp.options ());

/*
{
	help: {
		short: "h",
		long: "help",
		description: "Display this help and exit",
		flag: true,
		id: "help",
		negate: false,
		value: false
	},
	version: {
		short: "v",
		long: "version",
		description: "Output version information and exit",
		flag: true,
		id: "version",
		negate: false,
		value: false
	},
	aa: {
		short: "a",
		long: "aa",
		description: "aaaa",
		flag: true,
		id: "aa",
		negate: false,
		value: false
	},
	bb: {
		short: "b",
		long: "bb",
		description: "bbbb",
		argument: "bb",
		optional: true,
		value: 5,
		flag: false,
		id: "bb",
		reviver: null
	}
}
*/