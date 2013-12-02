"use strict";

var util = require ("util");

var parser = require ("../lib").createParser ({ once: true });
parser
		.main ()
				.body ()
						.argument ("arg1")
						.argument ("arg2")
						.option ({ short: "a", long: "aa", description: "aaaa" })
						.option ({ long: "bb", description: "bbbb" })
						.option ({ short: "c", description: "cccc", metavar: "cc",
								aliases: ["dd"], optional: true, default: 5, type: Number })
						.help ()
						.usage ()
						.version ("v1.2.3")
		.command ("a", { trailing: {} })
				.body ()
						.help ()
		.command ("b")
				.body ()
						.argument ("c", { trailing: {} })
						.usage ();

console.log (parser.arguments ());

/*
{
	arg1: {
		hidden: false,
		synopsis: null,
		trailing: null,
		description: null
	},
	arg2: {
		hidden: false,
		synopsis: null,
		trailing: null,
		description: null
	}
}
*/

console.log (parser.options ());

/*
{
	aa: {
		short: "a",
		long: "aa",
		description: "aaaa",
		flag: true,
		id: "aa",
		hidden: false,
		aliases: [],
		negate: false,
		default: false
	},
	bb: {
		long: "bb",
		description: "bbbb",
		flag: true,
		id: "bb",
		hidden: false,
		aliases: [],
		negate: false,
		default: false
	},
	c: {
		short: "c",
		description: "cccc",
		metavar: "cc",
		aliases: ["dd"],
		optional: true,
		default: 5,
		type: [Function: Number],
		flag: false,
		id: "c",
		hidden: false,
		reviver: null,
		choices: null
	},
	dd: {
		short: "c",
		description: "cccc",
		metavar: "cc",
		aliases: ["dd"],
		optional: true,
		default: 5,
		type: [Function: Number],
		flag: false,
		id: "c",
		hidden: false,
		reviver: null,
		choices: null
	},
	help: {
		short: "h",
		long: "help",
		description: "Display this help message and exit",
		flag: true,
		id: "help",
		hidden: false,
		aliases: [],
		negate: false,
		default: false
	},
	usage: {
		long: "usage",
		description: "Display a short usage message and exit",
		flag: true,
		id: "usage",
		hidden: false,
		aliases: [],
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
		aliases: [],
		negate: false,
		default: false
	}
}
*/

console.log (parser.options ({ short: true }));

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

console.log (parser.options ({ long: true }));

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

console.log (util.inspect (parser.commands (), { depth: null }));

/*
{
	a: {
		arguments: {},
		options: {
			help: {
				short: "h",
				long: "help",
				description: "Display this help message and exit",
				flag: true,
				id: "help",
				hidden: false,
				aliases: [],
				negate: false,
				default: false
			}
		}
	},
	b: {
		arguments: {
			c: {
				trailing: {
					min: 0,
					max: Infinity
				},
				hidden: false,
				synopsis: null,
				description: null
			}
		},
		options: {
			usage: {
				long: "usage",
				description: "Display a short usage message and exit",
				flag: true,
				id: "usage",
				hidden: false,
				aliases: [],
				negate: false,
				default: false
			}
		}
	}
}
*/

//Note: In this example "argv()" is not called, so the module is never uncached
parser = null;