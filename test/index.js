"use strict";

var assert = require ("assert");
var Argp = require ("../lib").constructor;

var debug = process.argv[1] === "debug";

var argv = function (arr){
	process.argv = ["node", __filename].concat (arr);
};

var n = function (){
	return new Argp ().configuration ({ showHelp: false, showUsage: false });
};

var equal = function (o, expected){
	delete o._debug;
	delete o._filename;
	assert.deepEqual (o, expected);
};

console.error = function (){};

process.exit = function (){
	throw new Error ();
};

var opts;

var tests = {
	"nothing": function (){
		assert.doesNotThrow (function (){
			argv ([]);
			opts = new Argp ().argv ();
			assert.deepEqual (opts, {
				_debug: debug,
				_filename: __filename
			});
			
			opts = new Argp ().body (function (){})
					.configuration ({ showHelp: false, showUsage: false }).argv ();
			assert.deepEqual (opts, {
				_debug: debug,
				_filename: __filename
			});
		});
	},
	"miscellaneous": function (){
		assert.doesNotThrow (function (){
			argv (["--a", "-", "-b", "-", "-", "-1"]);
			opts = n ().argv ();
			equal (opts, {
				a: "-",
				b: "-",
				"-": true,
				"1": true
			});
			
			argv (["-"]);
			opts = n ().argv ();
			equal (opts, {
				"-": true
			});
			
			argv (["--"]);
			opts = n ().argv ();
			equal (opts, {});
			
			argv (["--", "-", "--"]);
			opts = n ().argv ();
			equal (opts, {
				"-": true,
				"--": true
			});
			
			argv (["--a", "--", "--b"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				"--b": true
			});
			
			argv (["-a", "--", "-b"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				"-b": true
			});
		});
	},
	"no configuration, long": function (){
		assert.doesNotThrow (function (){
			argv (["--a"]);
			opts = n ().argv ();
			equal (opts, {
				a: true
			});
			
			argv (["--a", "--b"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				b: true
			});
			
			argv (["--a", "--b", "--c"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				b: true,
				c: true
			});
			
			argv (["--a", "b", "--c", "d"]);
			opts = n ().argv ();
			equal (opts, {
				a: "b",
				c: "d"
			});
			
			argv (["--a", "--b-c", "--1", 2]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				"b-c": true,
				"1": "2"
			});
			
			argv (["--a=--b", "--b=c", "--1"]);
			opts = n ().argv ();
			equal (opts, {
				a: "--b",
				b: "c",
				"1": true
			});
			
			argv (["--no-a", "--b", 1]);
			opts = n ().argv ();
			equal (opts, {
				a: false,
				b: "1"
			});
		});
	},
	"no configuration, short": function (){
		assert.doesNotThrow (function (){
			argv (["-a"]);
			opts = n ().argv ();
			equal (opts, {
				a: true
			});
			
			argv (["-a", "-b"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				b: true
			});
			
			argv (["-a", "-b", "-c"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				b: true,
				c: true
			});
			
			argv (["-a", "b", "-c", "d"]);
			opts = n ().argv ();
			equal (opts, {
				a: "b",
				c: "d"
			});
			
			argv (["-a", "-b-c", "-1", 2]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				"b": true,
				"-": true,
				"c": true,
				"1": "2"
			});
			
			argv (["-abc", "d", "-ef"]);
			opts = n ().argv ();
			equal (opts, {
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
			opts = n ().argv ();
			equal (opts, {
				a: true
			});
			
			argv (["a", "b"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				b: true
			});
			
			argv (["-a", "b", "c"]);
			opts = n ().argv ();
			equal (opts, {
				a: "b",
				c: true
			});
			
			argv (["a", "-b", "c"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				b: "c"
			});
			
			argv (["-a", "--", "b", "c"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				b: true,
				c: true
			});
		});
	},
	/*"arguments": function (){
		
	},
	"long": function (){
	
	},
	"short": function (){
	
	},
	"mix": function (){
	
	}
	/*"long, undefined flag": function (){
		process.argv = ["node", __filename, "--a"];
		assert.throws (function (){
			new Argp ().parse ();
		});
		assert.throws (function (){
			new Argp ().option ({ long: "a", negate: true }).parse ();
		});
	},
	"long, undefined negated flag": function (){
		process.argv = ["node", __filename, "--no-a"];
		assert.throws (function (){
			new Argp ().parse ();
		});
		assert.throws (function (){
			new Argp ().option ({ long: "a" }).parse ();
		});
	},
	"long, flag": function (){
		process.argv = ["node", __filename, "--a"];
		assert.doesNotThrow (function (){
			opts = new Argp ().option ({ long: "a" }).parse ();
		});
		assert.strictEqual (opts.a, true);
	},
	"long, multiple flags": function (){
		process.argv = ["node", __filename, "--a", "--b"];
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a" })
					.option ({ long: "b" })
					.option ({ long: "c" })
					.parse ();
		});
		assert.strictEqual (opts.a, true);
		assert.strictEqual (opts.b, true);
		assert.strictEqual (opts.c, false);
	},
	"long, negated flag": function (){
		process.argv = ["node", __filename, "--no-a"];
		assert.doesNotThrow (function (){
			opts = new Argp ().option ({ long: "a", negate: true }).parse ();
		});
		assert.strictEqual (opts.a, false);
	},
	"long, multiple negated flags": function (){
		process.argv = ["node", __filename, "--no-a", "--no-b"];
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a", negate: true })
					.option ({ long: "b", negate: true })
					.option ({ long: "c", negate: true })
					.parse ();
		});
		assert.strictEqual (opts.a, false);
		assert.strictEqual (opts.a, false);
		assert.strictEqual (opts.a, true);
	},
	"long, undefinedOptions flag": function (){
		process.argv = ["node", __filename, "--a"];
		assert.doesNotThrow (function (){
			opts = new Argp ().configure ({ undefinedOptions: true }).parse ();
		});
		assert.strictEqual (opts.a, undefined);
		assert.doesNotThrow (function (){
			opts = new Argp ().option ({ long: "a", negate: true }).parse ();
		});
		assert.strictEqual (opts.a, true);
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.configure ({ undefinedOptions: true })
					.option ({ long: "a", negate: true })
					.parse ();
		});
		assert.strictEqual (opts.a, true);
		assert.doesNotThrow (function (){
			opts = new Argp ().option ({ long: "a" }).parse ();
		});
		assert.strictEqual (opts.a, true);
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.configure ({ undefinedOptions: true })
					.option ({ long: "a" })
					.parse ();
		});
		assert.strictEqual (opts.a, true);
		process.argv = ["node", __filename, "--a b"];
		assert.doesNotThrow (function (){
			opts = new Argp ().configure ({ undefinedOptions: true }).parse ();
		});
		assert.strictEqual (opts.a, undefined);
		assert.strictEqual (opts.b, undefined);
	},
	"long, value with --": function (){
		process.argv = ["node", __filename, "--a", "--"];
		assert.throws (function (){
			new Argp ()
					.option ({ long: "a", argument: "a" })
					.parse ();
		});
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a", argument: "a", optional: true, value: "b" })
					.parse ();
		});
		assert.strictEqual (opts.a, "b");
	},
	"long, value, last token": function (){
		process.argv = ["node", __filename, "--a"];
		assert.throws (function (){
			new Argp ()
					.option ({ long: "a", argument: "a" })
					.parse ();
		});
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a", argument: "a", optional: true, value: "b" })
					.parse ();
		});
		assert.strictEqual (opts.a, "b");
	},
	"long, value in the same token": function (){
		process.argv = ["node", __filename, "--a=b"];
		assert.throws (function (){
			new Argp ()
					.option ({ long: "a" })
					.parse ();
		});
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a", argument: "a" })
					.parse ();
		});
		assert.strictEqual (opts.a, "b");
	},
	"long, abbreviation": function (){
		process.argv = ["node", __filename, "--a"];
		assert.throws (function (){
			new Argp ()
					.option ({ long: "ab" })
					.option ({ long: "abc" })
					.parse ();
		});
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "ab", negate: true })
					.option ({ long: "abc" })
					.parse ();
		});
		assert.strictEqual (opts.abc, true);
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "ab" })
					.parse ();
		});
		assert.strictEqual (opts.ab, true);
	},
	"long, reviver": function (){
		process.argv = ["node", __filename, "--a", "b"];
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a", argument: "a", reviver: function (value){
						return value + "b";
					}})
					.parse ();
		});
		assert.strictEqual (opts.a, "bb");
	},
	"short, undefined": function (){
		process.argv = ["node", __filename, "-a"];
		assert.throws (function (){
			new Argp ().parse ();
		});
	},
	"arguments": function (){
		process.argv = ["node", __filename, "a"];
		assert.throws (function (){
			new Argp ()
					.configure ({ undefinedArguments: false })
					.parse ();
		});
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.argument ("a")
					.parse ();
		});
		assert.strictEqual (opts.a, true);
		assert.doesNotThrow (function (){
			opts = new Argp ().parse ();
		});
		assert.strictEqual (opts.a, undefined);
	}*/
};

for (var test in tests){
	tests[test] ();
}