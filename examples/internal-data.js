"use strict";

var argp = require ("../lib");

/*
The arguments() and options() functions returns the configured arguments and
options for informational purposes. For example, they can be used to change the
--help, --usage and --version descriptions.
*/

argp
		.configuration ({
			showHelp: true,
			showUsage: true
		})
		.version ("v1.2.3")
		.body (function (body){
			body
					.argument ("arg1")
					.argument ("arg2")
					.option ({ short: "a", long: "aa", description: "aaaa" })
					.option ({ short: "b", long: "bb", description: "bbbb",
							argument: "bb", optional: true, value: 5, type: Number });
		});

console.log (argp.arguments ());

/*
{
	arg1: {
		hidden: false,
		description: null
	},
	arg2: {
		hidden: false,
		description: null
	}
}
*/

console.log (argp.options ());

/*
{
	help: {
		short: "h",
		long: "help",
		description: "Display this help message and exit",
		flag: true,
		id: "help",
		hidden: false,
		negate: false,
		value: false
	},
	usage: {
		long: "usage",
		description: "Display a short usage message and exit",
		flag: true,
		id: "usage",
		hidden: false,
		negate: false,
		value: false
	},
	version: {
		short: "v",
		long: "version",
		description: "Output version information and exit",
		flag: true,
		id: "version",
		hidden: false,
		negate: false,
		value: false
	},
	aa: {
		short: "a",
		long: "aa",
		description: "aaaa",
		flag: true,
		id: "aa",
		hidden: false,
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
		type: [Function: Number],
		flag: false,
		id: "bb",
		hidden: false,
		reviver: null
	}
}
*/