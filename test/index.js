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
	"empty required value": function (){
		assert.doesNotThrow (function (){
			argv (["--a="]);
			opts = n ().argv ();
			assert.strictEqual (opts.a, null);
		});
	},
	"type conversion, no configuration": function (){
		assert.doesNotThrow (function (){
			argv (["--a=undefined", "--b=null", "--c=true", "--d=false", "--e=12",
					"--f=12.34", "--g=asd"]);
			opts = n ().argv ();
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
					"--g=1,true,a", "--h=", "--i", "-12.34"]);
			opts = n ().body (function (body){
				body
						.option ({ long: "a", argument: true })
						.option ({ long: "b", argument: true })
						.option ({ long: "c", argument: true, type: Number })
						.option ({ long: "d", argument: true, type: Number })
						.option ({ long: "e", argument: true, type: Boolean })
						.option ({ long: "f", argument: true, type: Boolean })
						.option ({ long: "g", argument: true, type: Array })
						.option ({ long: "h", argument: true, type: Array })
						.option ({ long: "i", argument: true, type: Number })
			}).argv ();
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
		});
		
		assert.throws (function (){
			argv (["--a=b"]);
			n ().body (function (body){
				body
						.option ({ long: "a", argument: true, type: Number })
			}).argv ();
		});
		
		assert.throws (function (){
			argv (["--a=b"]);
			n ().body (function (body){
				body
						.option ({ long: "a", argument: true, type: Boolean })
			}).argv ();
		});
	},
	"no configuration, nothing": function (){
		assert.doesNotThrow (function (){
			argv ([]);
			
			opts = n ().argv ();
			assert.deepEqual (opts, {
				_debug: debug,
				_filename: __filename
			});
			
			opts = n ().configuration ({ showHelp: true, showUsage: true })
					.argv ();
			assert.deepEqual (opts, {
				_debug: debug,
				_filename: __filename,
				help: false,
				usage: false
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
			
			argv (["--a", "--b-c", "--1", "2"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				"b-c": true,
				"1": 2
			});
			assert.strictEqual (opts["1"], 2);
			
			argv (["--a=--b", "--b=c", "--1"]);
			opts = n ().argv ();
			equal (opts, {
				a: "--b",
				b: "c",
				"1": true
			});
			
			argv (["--no-a", "--b", "1"]);
			opts = n ().argv ();
			equal (opts, {
				a: false,
				b: 1
			});
			assert.strictEqual (opts.b, 1);
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
			
			argv (["-a", "-b-c", "-1", "2"]);
			opts = n ().argv ();
			equal (opts, {
				a: true,
				"b": true,
				"-": true,
				"c": true,
				"1": 2
			});
			assert.strictEqual (opts["1"], 2);
			
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
	"no configuration, miscellaneous": function (){
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
	"configuration, no undefined": function (){
		assert.throws (function (){
			argv (["-a"]);
			new Argp ().configuration ({ allowUndefinedOptions: false })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["--a"]);
			new Argp ().configuration ({ allowUndefinedOptions: false })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["--no-a"]);
			new Argp ().configuration ({ allowUndefinedOptions: false })
					.argv ();
		});
		
		assert.throws (function (){
			argv (["a"]);
			new Argp ().configuration ({ allowUndefinedArguments: false })
					.argv ();
		});
	},
	"configuration, nothing, default values": function (){
		assert.doesNotThrow (function (){
			argv ([]);
			opts = n ().body (function (body){
				body.argument ("a");
				body.option ({ long: "b", short: "x" });
				body.option ({ long: "c", negate: true });
				body.option ({ short: "d", argument: "a", value: "a" });
				body.option ({ short: "e", argument: "a", optional: true });
			}).argv ();
			equal (opts, {
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
			opts = n ().body (function (body){
				body.option ({ long: "a" });
			}).argv ();
			equal (opts, {
				a: true
			});
			
			argv (["--a"]);
			opts = n ().body (function (body){
				body.option ({ long: "a", negate: true });
			}).argv ();
			equal (opts, {
				a: true
			});
			
			argv (["--no-a"]);
			opts = n ().body (function (body){
				body.option ({ long: "a", negate: true });
			}).argv ();
			equal (opts, {
				a: false
			});
			
			argv (["--no-a"]);
			opts = n ().body (function (body){
				body.option ({ long: "a" });
			}).argv ();
			equal (opts, {
				a: false
			});
			
			argv (["--a", "b"]);
			opts = n ().body (function (body){
				body.option ({ long: "a" });
			}).argv ();
			equal (opts, {
				a: true,
				b: true
			});
			
			argv (["--a", "b"]);
			opts = n ().body (function (body){
				body.option ({ long: "a", argument: "a" });
			}).argv ();
			equal (opts, {
				a: "b"
			});
			
			argv (["--a"]);
			opts = n ().body (function (body){
				body.option ({ long: "a", argument: "a", optional: true });
			}).argv ();
			equal (opts, {
				a: null
			});
			
			argv (["--a=b", "--b"]);
			opts = n ().body (function (body){
				body.option ({ long: "a", argument: "a" });
			}).argv ();
			equal (opts, {
				a: "b",
				b: true
			});
			
			argv (["--a", "b"]);
			opts = n ().body (function (body){
				body.option ({ long: "abc", argument: "a" });
			}).argv ();
			equal (opts, {
				abc: "b"
			});
			
			argv (["--no-a"]);
			opts = n ().body (function (body){
				body.option ({ long: "abc", negate: true });
			}).argv ();
			equal (opts, {
				abc: false
			});
		});
		
		assert.throws (function (){
			argv (["--a=b"]);
			n ().body (function (body){
				body.option ({ long: "a" });
			}).argv ();
		});
		
		assert.throws (function (){
			argv (["--a"]);
			n ().body (function (body){
				body.option ({ long: "a", argument: "a" });
			}).argv ();
		});
		
		assert.throws (function (){
			argv (["--a", "--b"]);
			n ().body (function (body){
				body.option ({ long: "a", argument: "a" });
			}).argv ();
		});
		
		assert.throws (function (){
			argv (["--a"]);
			n ().body (function (body){
				body.option ({ long: "a12" });
				body.option ({ long: "a34" });
			}).argv ();
		});
	},
	"configuration, short": function (){
		assert.doesNotThrow (function (){
			argv (["-a"]);
			opts = n ().body (function (body){
				body.option ({ short: "a" });
			}).argv ();
			equal (opts, {
				a: true
			});
			
			argv (["-a", "b"]);
			opts = n ().body (function (body){
				body.option ({ short: "a" });
			}).argv ();
			equal (opts, {
				a: true,
				b: true
			});
			
			argv (["-a", "b"]);
			opts = n ().body (function (body){
				body.option ({ short: "a", argument: "a" });
			}).argv ();
			equal (opts, {
				a: "b"
			});
			
			argv (["-a"]);
			opts = n ().body (function (body){
				body.option ({ short: "a", argument: "a", optional: true });
			}).argv ();
			equal (opts, {
				a: null
			});
			
			argv (["-ab", "-c"]);
			opts = n ().body (function (body){
				body.option ({ short: "a", argument: "a" });
			}).argv ();
			equal (opts, {
				a: "b",
				c: true
			});
			
			argv (["-abc", "-d"]);
			opts = n ().body (function (body){
				body.option ({ short: "a", argument: "a" });
			}).argv ();
			equal (opts, {
				a: "bc",
				d: true
			});
			
			argv (["-abc", "d"]);
			opts = n ().body (function (body){
				body.option ({ short: "a" });
				body.option ({ short: "b" });
			}).argv ();
			equal (opts, {
				a: true,
				b: true,
				c: "d"
			});
			
			argv (["-abcd", "e"]);
			opts = n ().body (function (body){
				body.option ({ short: "a" });
				body.option ({ short: "b" });
			}).argv ();
			equal (opts, {
				a: true,
				b: true,
				c: true,
				d: "e"
			});
			
			argv (["-abc", "b"]);
			opts = n ().body (function (body){
				body.option ({ short: "a" });
				body.option ({ short: "b" });
				body.option ({ short: "c", argument: "a" });
			}).argv ();
			equal (opts, {
				a: true,
				b: true,
				c: "b"
			});
			
			argv (["-abc", "d"]);
			opts = n ().body (function (body){
				body.option ({ short: "a" });
				body.option ({ short: "b" });
				body.option ({ short: "c" });
			}).argv ();
			equal (opts, {
				a: true,
				b: true,
				c: true,
				d: true
			});
			
			argv (["-abc", "b"]);
			opts = n ().body (function (body){
				body.option ({ short: "a", argument: "a", optional: true });
				body.option ({ short: "b", argument: "a", optional: true });
				body.option ({ short: "c", argument: "a" });
			}).argv ();
			equal (opts, {
				a: null,
				b: null,
				c: "b"
			});
			
			argv (["-ab"]);
			opts = n ().body (function (body){
				body.option ({ short: "a", argument: "a", optional: true });
				body.option ({ short: "b" });
			}).argv ();
			equal (opts, {
				a: null,
				b: true
			});
		});
		
		assert.throws (function (){
			argv (["-a"]);
			opts = n ().body (function (body){
				body.option ({ short: "a", negate: true });
			}).argv ();
			equal (opts, {
				a: true
			});
		});
		
		assert.throws (function (){
			argv (["-ab"]);
			n ().body (function (body){
				body.option ({ short: "a", argument: "a" });
				body.option ({ short: "b" });
			}).argv ();
		});
		
		assert.throws (function (){
			argv (["-ab"]);
			n ().body (function (body){
				body.option ({ short: "a", argument: "a" });
				body.option ({ short: "b", argument: "a" });
			}).argv ();
		});
		
		assert.throws (function (){
			argv (["-ab", "--c"]);
			n ().body (function (body){
				body.option ({ short: "a", argument: "a" });
				body.option ({ short: "b", argument: "a" });
			}).argv ();
		});
		
		assert.throws (function (){
			argv (["-abc"]);
			n ().body (function (body){
				body.option ({ short: "a" });
				body.option ({ short: "b", argument: "a" });
			}).argv ();
		});
	},
	"configuration, arguments": function (){
		assert.doesNotThrow (function (){
			argv (["--c", "a", "c"]);
			opts = n ().body (function (body){
				body.argument ("a");
			}).argv ();
			equal (opts, {
				c: "c",
				a: true
			});
		});
	}
};

for (var test in tests){
	tests[test] ();
}