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
	"no configuration, nothing": function (){
		assert.doesNotThrow (function (){
			argv ([]);
			opts = new Argp ().argv ();
			assert.deepEqual (opts, {
				_debug: debug,
				_filename: __filename,
				help: false,
				usage: false
			});
			
			opts = new Argp ().body (function (){})
					.configuration ({ showHelp: false, showUsage: false }).argv ();
			assert.deepEqual (opts, {
				_debug: debug,
				_filename: __filename
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
			argv (["a"]);
			new Argp ().configuration ({ allowUndefinedArguments: false })
					.argv ();
		});
	},
	"configuration, nothing, default values": function (){
		assert.doesNotThrow (function (){
			argv ([]);
			opts = n ().argument ("a").body (function (body){
				body.option ({ long: "b", short: "x" });
				body.option ({ short: "c", negate: true });
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
			
			argv (["--a=b", "--b"]);
			opts = n ().body (function (body){
				body.option ({ long: "a", argument: "a" });
			}).argv ();
			equal (opts, {
				a: "b",
				"b": true
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
	},
	"configuration, arguments": function (){
		assert.doesNotThrow (function (){
			argv (["--c", "a", "c"]);
			opts = n ().argument ("a").argv ();
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