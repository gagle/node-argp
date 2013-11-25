"use strict";

var assert = require ("assert");
var Argp = require ("../lib").constructor;

var debug = process.argv[1] === "debug";

var argv = function (arr){
	process.argv = ["node", __filename].concat (arr);
};

var n = function (){
	return new Argp ();
};

var a = function (){
	return new Argp ().allowUndefinedArguments ().allowUndefinedOptions ();
};

console.error = function (){};

process.exit = function (){
	throw new Error ();
};

var opts;

var tests = {
	"empty required value": function (){
		assert.doesNotThrow (function (){
			argv (["--a="]);
			opts = a ().argv ();
			assert.strictEqual (opts.a, null);
		});
	},
	"type conversion, no configuration": function (){
		assert.doesNotThrow (function (){
			argv (["--a=undefined", "--b=null", "--c=true", "--d=false", "--e=12",
					"--f=12.34", "--g=asd"]);
			opts = a ().argv ();
			assert.strictEqual (opts.a, undefined);
			assert.strictEqual (opts.b, null);
			assert.strictEqual (opts.c, true);
			assert.strictEqual (opts.d, false);
			assert.strictEqual (opts.e, 12);
			assert.strictEqual (opts.f, 12.34);
			assert.strictEqual (opts.g, "asd");
		});
	},
	"type conversion, configuration": function (){
		assert.doesNotThrow (function (){
			argv (["--a=b", "--b=", "--c=12.34", "--d=", "--e=true", "--f=",
					"--g=1,true,a", "--h=", "--i", "-12.34", "--j", "-1.2,foo", "--k",
					"1", "--k", "true,foo"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true })
					.option ({ long: "b", metavar: true })
					.option ({ long: "c", metavar: true, type: Number })
					.option ({ long: "d", metavar: true, type: Number })
					.option ({ long: "e", metavar: true, type: Boolean })
					.option ({ long: "f", metavar: true, type: Boolean })
					.option ({ long: "g", metavar: true, type: Array })
					.option ({ long: "h", metavar: true, type: Array })
					.option ({ long: "i", metavar: true, type: Number })
					.option ({ long: "j", metavar: true, type: Array })
					.option ({ long: "k", metavar: true, type: Array })
					.argv ();
			assert.strictEqual (opts.a, "b");
			assert.strictEqual (opts.b, null);
			assert.strictEqual (opts.c, 12.34);
			assert.strictEqual (opts.d, 0);
			assert.strictEqual (opts.e, true);
			assert.strictEqual (opts.f, false);
			assert.strictEqual (opts.g[0], 1);
			assert.strictEqual (opts.g[1], true);
			assert.strictEqual (opts.g[2], "a");
			assert.deepEqual (opts.h, []);
			assert.strictEqual (opts.i, -12.34);
			assert.strictEqual (opts.j[0], -1.2);
			assert.strictEqual (opts.j[1], "foo");
			assert.strictEqual (opts.k[0], 1);
			assert.strictEqual (opts.k[1], true);
			assert.strictEqual (opts.k[2], "foo");
		});
		
		assert.throws (function (){
			argv (["--a=b"]);
			n ().body ()
					.option ({ long: "a", metavar: true, type: Number })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["--a=b"]);
			n ().body ()
					.option ({ long: "a", metavar: true, type: Boolean })
					.argv ();
		});
	},
	"abbreviations": function (){
		assert.doesNotThrow (function (){
			argv (["--a"]);
			opts = n ().body ()
					.option ({ long: "aa" })
					.argv ();
			assert.deepEqual (opts, {
				aa: true
			});
			
			argv (["--a", "b"]);
			opts = n ().body ()
					.option ({ long: "abc", metavar: true })
					.argv ();
			assert.deepEqual (opts, {
				abc: "b"
			});
		});
		
		assert.throws (function (){
			argv (["--a"]);
			n ().body ()
					.option ({ long: "a1" })
					.option ({ long: "a2" })
					.argv ();
		});
	},
	"no configuration, nothing": function (){
		assert.doesNotThrow (function (){
			argv ([]);
			
			opts = a ().argv ();
			assert.deepEqual (opts, {});
			
			opts = a ().body ()
					.help ()
					.usage ()
					.argv ();
			assert.deepEqual (opts, {
				help: false,
				usage: false
			});
		});
	},
	"no configuration, long": function (){
		assert.doesNotThrow (function (){
			argv (["--a"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true
			});
			
			argv (["--a", "--b"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true
			});
			
			argv (["--a", "--b", "--c"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: true
			});
			
			argv (["--a", "b", "--c", "d"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: "b",
				c: "d"
			});
			
			argv (["--a", "--b-c", "--1", "2"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				"b-c": true,
				"1": 2
			});
			assert.strictEqual (opts["1"], 2);
			
			argv (["--a=--b", "--b=c", "--1"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: "--b",
				b: "c",
				"1": true
			});
			
			argv (["--no-a", "--b", "1"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: false,
				b: 1
			});
			assert.strictEqual (opts.b, 1);
		});
	},
	"no configuration, short": function (){
		assert.doesNotThrow (function (){
			argv (["-a"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true
			});
			
			argv (["-a", "-b"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true
			});
			
			argv (["-a", "-b", "-c"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: true
			});
			
			argv (["-a", "b", "-c", "d"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: "b",
				c: "d"
			});
			
			argv (["-a", "-b-c", "-1", "2"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				"b": true,
				"-": true,
				"c": true,
				"1": 2
			});
			assert.strictEqual (opts["1"], 2);
			
			argv (["-abc", "d", "-ef"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: "d",
				e: true,
				f: true
			});
		});
	},
	"no configuration, arguments": function (){
		assert.doesNotThrow (function (){
			argv (["a"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true
			});
			
			argv (["a", "b"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true
			});
			
			argv (["-a", "b", "c"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: "b",
				c: true
			});
			
			argv (["a", "-b", "c"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: "c"
			});
			
			argv (["-a", "--", "b", "c"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: true
			});
		});
	},
	"no configuration, miscellaneous": function (){
		assert.doesNotThrow (function (){
			argv (["--a", "-", "-b", "-", "-", "-1"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: "-",
				b: "-",
				"-": true,
				"1": true
			});
			
			argv (["-"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				"-": true
			});
			
			argv (["--"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {});
			
			argv (["--", "-", "--"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				"-": true,
				"--": true
			});
			
			argv (["--a", "--", "--b"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				"--b": true
			});
			
			argv (["-a", "--", "-b"]);
			opts = a ().argv ();
			assert.deepEqual (opts, {
				a: true,
				"-b": true
			});
		});
	},
	"configuration, no undefined": function (){
		assert.throws (function (){
			argv (["-a"]);
			n ().argv ();
		});
		
		assert.throws (function (){
			argv (["--a"]);
			n ().argv ();
		});
		
		assert.throws (function (){
			argv (["--no-a"]);
			n ().argv ();
		});
		
		assert.throws (function (){
			argv (["a"]);
			n ().argv ();
		});
	},
	"configuration, default values": function (){
		assert.doesNotThrow (function (){
			argv ([]);
			opts = n ().body ()
					.argument ("a")
					.option ({ long: "b", short: "x" })
					.option ({ long: "c", negate: true })
					.option ({ short: "d", metavar: true, default: "a" })
					.option ({ short: "e", metavar: true, optional: true })
					.argv ();
			assert.deepEqual (opts, {
				a: false,
				b: false,
				c: true,
				d: "a",
				e: null
			});
		});
	},
	"configuration, long": function (){
		assert.doesNotThrow (function (){
			argv (["--a"]);
			opts = n ().body ()
					.option ({ long: "a" })
					.argv ();
			assert.deepEqual (opts, {
				a: true
			});
			
			argv (["--a"]);
			opts = n ().body ()
					.option ({ long: "a", negate: true })
					.argv ();
			assert.deepEqual (opts, {
				a: true
			});
			
			argv (["--no-a"]);
			opts = n ().body ()
					.option ({ long: "a", negate: true })
					.argv ();
			assert.deepEqual (opts, {
				a: false
			});
			
			argv (["--no-no-"]);
			opts = n ().body ()
					.option ({ long: "no-" })
					.argv ();
			assert.deepEqual (opts, {
				"no-": false
			});
			
			argv (["-a"]);
			opts = n ().body ()
					.option ({ short: "a", long: "abc", negate: true })
					.argv ();
			assert.deepEqual (opts, {
				abc: false
			});
			
			argv (["--no-a"]);
			opts = n ().body ()
					.option ({ long: "a" })
					.argv ();
			assert.deepEqual (opts, {
				a: false
			});
			
			argv (["--a", "b"]);
			opts = n ().body ()
					.argument ("b")
					.option ({ long: "a" })
					.argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true
			});
			
			argv (["--a", "b"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true })
					.argv ();
			assert.deepEqual (opts, {
				a: "b"
			});
			
			argv (["--a"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true, optional: true })
					.argv ();
			assert.deepEqual (opts, {
				a: null
			});
			
			argv (["--a=b", "--b"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true })
					.option ({ long: "b" })
					.argv ();
			assert.deepEqual (opts, {
				a: "b",
				b: true
			});
			
			argv (["--no-a"]);
			opts = n ().body ()
					.option ({ long: "abc", negate: true })
					.argv ();
			assert.deepEqual (opts, {
				abc: false
			});
			
			argv (["--a", "--b", "--c", "--d"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true, optional: true })
					.option ({ long: "b", metavar: true, optional: true,
							type: Number })
					.option ({ long: "c", metavar: true, optional: true,
							type: Array })
					.option ({ long: "d", metavar: true, optional: true,
							type: Boolean })
					.argv ();
			assert.strictEqual (opts.a, null);
			assert.strictEqual (opts.b, 0);
			assert.deepEqual (opts.c, []);
			assert.strictEqual (opts.d, false);
			
			argv (["--b"]);
			opts = n ().body ()
					.option ({ long: "a", aliases: ["b"] })
					.argv ();
			assert.deepEqual (opts, {
				a: true
			});
			
			argv (["--a", "b"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true, choices: ["b"] })
					.argv ();
			assert.deepEqual (opts, {
				a: "b"
			});
			
			argv (["--a", "1"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true, type: Number, choices: [1] })
					.argv ();
			assert.strictEqual (opts.a, 1);
			
			argv (["--a"]);
			opts = n ().body ()
					.option ({ long: "a", metavar: true, type: Number, optional: true,
							choices: [1] })
					.argv ();
			assert.strictEqual (opts.a, 0);
		});
		
		assert.throws (function (){
			argv (["--no-"]);
			n ().body ().argv ();
		});
		
		assert.throws (function (){
			argv (["--a=b"]);
			n ().body ()
					.option ({ long: "a" })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["--a"]);
			n ().body ()
					.option ({ long: "a", metavar: true })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["--a", "--b"]);
			n ().body ()
					.option ({ long: "a", metavar: true })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["--a"]);
			n ().body ()
					.option ({ long: "a12" })
					.option ({ long: "a34" })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["--a=2"]);
			n ().body ()
					.option ({ long: "a", metavar: true, type: Number, choices: [1] })
					.argv ();
		});
	},
	"configuration, short": function (){
		assert.doesNotThrow (function (){
			argv (["-a"]);
			opts = n ().body ()
					.option ({ short: "a" })
					.argv ();
			assert.deepEqual (opts, {
				a: true
			});
			
			argv (["-a", "b"]);
			opts = n ().body ()
					.argument ("b")
					.option ({ short: "a" })
					.argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true
			});
			
			argv (["-a", "b"]);
			opts = n ().body ()
					.option ({ short: "a", metavar: true })
					.argv ();
			assert.deepEqual (opts, {
				a: "b"
			});
			
			argv (["-a"]);
			opts = n ().body ()
					.option ({ short: "a", metavar: true, optional: true })
					.argv ();
			assert.deepEqual (opts, {
				a: null
			});
			
			argv (["-ab", "-c"]);
			opts = n ().body ()
					.option ({ short: "a", metavar: true })
					.option ({ short: "c" })
					.argv ();
			assert.deepEqual (opts, {
				a: "b",
				c: true
			});
			
			argv (["-abc", "-d"]);
			opts = n ().body ()
					.option ({ short: "a", metavar: true })
					.option ({ short: "d" })
					.argv ();
			assert.deepEqual (opts, {
				a: "bc",
				d: true
			});
			
			argv (["-abc", "d"]);
			opts = n ().allowUndefinedOptions ().body ()
					.option ({ short: "a" })
					.option ({ short: "b" })
					.argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: "d"
			});
			
			argv (["-abcd", "e"]);
			opts = n ().allowUndefinedOptions ().body ()
					.option ({ short: "a" })
					.option ({ short: "b" })
					.argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: true,
				d: "e"
			});
			
			argv (["-abc", "b"]);
			opts = n ().body ()
					.option ({ short: "a" })
					.option ({ short: "b" })
					.option ({ short: "c", metavar: true })
					.argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: "b"
			});
			
			argv (["-abc", "d"]);
			opts = n ().allowUndefinedArguments ().body ()
					.option ({ short: "a" })
					.option ({ short: "b" })
					.option ({ short: "c" })
					.argv ();
			assert.deepEqual (opts, {
				a: true,
				b: true,
				c: true,
				d: true
			});
			
			argv (["-abc", "b"]);
			opts = n ().body ()
					.option ({ short: "a", metavar: true, optional: true })
					.option ({ short: "b", metavar: true, optional: true })
					.option ({ short: "c", metavar: true })
					.argv ();
			assert.deepEqual (opts, {
				a: null,
				b: null,
				c: "b"
			});
			
			argv (["-ab"]);
			opts = n ().body ()
					.option ({ short: "a", metavar: true, optional: true })
					.option ({ short: "b" })
					.argv ();
			assert.deepEqual (opts, {
				a: null,
				b: true
			});
		});
		
		assert.throws (function (){
			argv (["-a"]);
			opts = n ().body ()
					.option ({ short: "a", negate: true })
					.argv ();
			assert.deepEqual (opts, {
				a: true
			});
		});
		
		assert.throws (function (){
			argv (["-ab"]);
			n ().body ()
					.option ({ short: "a", metavar: "a" })
					.option ({ short: "b" })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["-ab"]);
			n ().body ()
					.option ({ short: "a", metavar: "a" })
					.option ({ short: "b", metavar: "a" })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["-ab", "--c"]);
			n ().body ()
					.option ({ short: "a", metavar: "a" })
					.option ({ short: "b", metavar: "a" })
					end ().argv ();
		});
		
		assert.throws (function (){
			argv (["-abc"]);
			n ().body ()
					.option ({ short: "a" })
					.option ({ short: "b", metavar: "a" })
					end ().argv ();
		});
	},
	"configuration, arguments": function (){
		assert.doesNotThrow (function (){
			argv (["--c", "a", "c"]);
			opts = n ().allowUndefinedOptions ().body ()
					.argument ("a")
					.argv ();
			assert.deepEqual (opts, {
				c: "c",
				a: true
			});
		});
	},
	"command, trailing error check": function (){
		assert.throws (function (){
			n ().command ("a", { trailing: { eq: 1, min: 2 } });
		});
		
		assert.throws (function (){
			n ().command ("a", { trailing: { eq: 1, max: 2 } });
		});
		
		assert.throws (function (){
			n ().command ("a", { trailing: { eq: 0 } });
		});
		
		assert.throws (function (){
			n ().command ("a", { trailing: { min: -1 } });
		});
		
		assert.throws (function (){
			n ().command ("a", { trailing: { max: 0 } });
		});
		
		assert.throws (function (){
			n ().command ("a", { trailing: { min: 2, max: 1 } });
		});
		
		assert.throws (function (){
			argv (["a"]);
			n ().command ("a", { trailing: { eq: 1 } }).argv ();
		});
		
		assert.throws (function (){
			argv (["a"]);
			n ().command ("a", { trailing: { min: 1 } }).argv ();
		});
	},
	"command": function (){
		assert.doesNotThrow (function (){
			argv (["a", "1"]);
			opts = n ().command ("a", { trailing: { eq: 1 } }).body ()
					.argument ("b", { trailing: { eq: 1 } })
					.argument ("c")
					.argv ();
			assert.deepEqual (opts, {
				a: [1],
				b: [],
				c: false
			});
		});
		
		assert.doesNotThrow (function (){
			argv (["a", "1", "b", "2", "c"]);
			opts = n ().command ("a", { trailing: { eq: 1 } }).body ()
					.argument ("b", { trailing: { eq: 1 } })
					.argument ("c")
					.argv ();
			assert.deepEqual (opts, {
				a: [1],
				b: [2],
				c: true
			});
		});
		
		assert.doesNotThrow (function (){
			argv (["a", "1"]);
			opts = n ().command ("a", { trailing: { max: 2 } }).argv ();
			assert.deepEqual (opts, {
				a: [1],
			});
		});
		
		assert.doesNotThrow (function (){
			argv (["a", "1", "2", "b", "1", "2", "3"]);
			opts = n ().command ("a", { trailing: { max: 2 } }).body ()
					.argument ("b", { trailing: {} })
					.argv ();
			assert.deepEqual (opts, {
				a: [1, 2],
				b: [1, 2, 3]
			});
		});
		
		assert.doesNotThrow (function (){
			argv (["b", "1", "c"]);
			opts = n ()
					.command ("a", { trailing: { max: 2 } }).body ()
							.argument ("b", { trailing: {} })
							
					.command ("b", { trailing: { eq: 1 } }).body ()
							.argument ("c", { trailing: {} })
							
					.argv ();
			assert.deepEqual (opts, {
				b: [1],
				c: []
			});
		});
		
		assert.doesNotThrow (function (){
			argv (["a", "b", "c"]);
			opts = n ()
					.command ("a").body ()
							.argument ("b", { trailing: {} })
							
					.argv ();
			assert.deepEqual (opts, {
				a: [],
				b: ["c"]
			});
		});
		
		assert.doesNotThrow (function (){
			argv (["a", "1", "b", "2"]);
			opts = n ()
					.command ("a", { trailing: { eq: 1 } }).body ()
							.argument ("b", { trailing: { eq: 1 } })
							
					.argv ();
			assert.deepEqual (opts, {
				a: [1],
				b: [2]
			});
		});
	},
	"input array": function (){
		assert.doesNotThrow (function (){
			opts = a ().argv (["--a", "b", "--c", "d"]);
			assert.deepEqual (opts, {
				a: "b",
				c: "d"
			});
		});
	}
};

for (var test in tests){
	tests[test] ();
}