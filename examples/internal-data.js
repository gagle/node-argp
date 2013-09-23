"use strict";

var argp = require ("../lib");

argp
		.body ()
				.argument ("arg1")
				.argument ("arg2")
				.option ({ short: "a", long: "aa", description: "aaaa" })
				.option ({ long: "bb", description: "bbbb" })
				.option ({ short: "c", description: "cccc", argument: "cc",
						aliases: ["dd"], optional: true, default: 5, type: Number })
				.help ()
				.usage ()
				.version ("v1.2.3")
				.end ();

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
	aa: {
		short: "a",
		long: "aa",
		description: "aaaa",
		flag: true,
		id: "aa",
		hidden: false,
		negate: false,
		default: false
	},
	bb: {
		long: "bb",
		description: "bbbb",
		flag: true,
		id: "bb",
		hidden: false,
		negate: false,
		default: false
	},
	c: {
		short: "c",
		description: "cccc",
		argument: "cc",
		optional: true,
		default: 5,
		type: [Function: Number],
		flag: false,
		id: "c",
		hidden: false,
		reviver: null
	},
	dd: {
		short: "c",
		description: "cccc",
		argument: "cc",
		optional: true,
		default: 5,
		type: [Function: Number],
		flag: false,
		id: "c",
		hidden: false,
		reviver: null
	},
	help: {
		short: "h",
		long: "help",
		description: "Display this help message and exit",
		flag: true,
		id: "help",
		hidden: false,
		negate: false,
		default: false
	},
	usage: {
		long: "usage",
		description: "Display a short usage message and exit",
		flag: true,
		id: "usage",
		hidden: false,
		negate: false,
		default: false
	},
	version: {
		short: "v",
		long: "version",
		description: "Output version information and exit",
		flag: true,
		id: "version",
		hidden: false,
		negate: false,
		default: false
	}
}
*/

console.log (argp.options ({ short: true }));

/*
{
	a: {
		...
	},
	c: {
		...
	},
	h: {
		...
	},
	v: {
		...
	}
*/

console.log (argp.options ({ long: true }));

/*
{
	aa: {
		...
	},
	bb: {
		...
	},
	dd: {
		...
	},
	help: {
		...
	},
	version: {
		...
	},
	usage: {
		...
	}
}
*/