"use strict";

var assert = require ("assert");
var Argp = require ("../lib").constructor;

console.error = function (){};
process.exit = function (){
	throw new Error ();
};
var opts;

var tests = {
	"long, undefined flag": function (){
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
	},
	"long, value with --": function (){
		process.argv = ["node", __filename, "--a", "--"];
		assert.throws (function (){
			new Argp ()
					.option ({ long: "a", argument: true })
					.parse ();
		});
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a", argument: true, optional: true, value: "b" })
					.parse ();
		});
		assert.strictEqual (opts.a, "b");
	},
	"long, value, last token": function (){
		process.argv = ["node", __filename, "--a"];
		assert.throws (function (){
			new Argp ()
					.option ({ long: "a", argument: true })
					.parse ();
		});
		assert.doesNotThrow (function (){
			opts = new Argp ()
					.option ({ long: "a", argument: true, optional: true, value: "b" })
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
					.option ({ long: "a", argument: true })
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
	}
};

for (var test in tests){
	tests[test] ();
}