"use strict";

var argp = require ("../lib");

var argv = argp
		.body ()
				//Argument
				.argument ("arg1")
				
				//Argument with a description
				.argument ("arg2", { description: "aaaa" })
				
				//Hidden argument
				.argument ("arg3", { hidden: true })
				
				//Positive flag because it doesn't define the "argument" property
				.option ({ short: "a", long: "aaaa" })
				
				//Negative flag because it doesn't define the "argument" property
				.option ({ long: "b", negate: true })
				
				//Option with a mandatory value and null as default value
				.option ({ short: "c", argument: "C" })
				
				//Option with a Number type and 0 as default value
				//By default the options are strings
				.option ({ short: "d", argument: "D", type: Number })
				
				//Option with an Array type and [] as default value
				//Array-type values must be comma-separated values, eg: --a 1,a,true
				//Each element is converted automatically to the type it represents,
				//the previous example is converted to { a: [1, "a", true] }
				.option ({ short: "e", argument: "E", type: Array })
				
				//Option with a Boolean type and false as default value
				//This type is not very useful because you can just use a flag, eg:
				//--a true is converted to { a: true }
				.option ({ short: "f", argument: "F", type: Boolean })
				
				//Option with a mandatory value and "gggg" as default value
				.option ({ long: "g", argument: "G", value: "gggg" })
				
				//Option with an optional value and null as default value
				.option ({ short: "i", argument: "I", optional: true })
				
				//Option with an optional value and "jjjj" as default value
				.option ({ long: "j", argument: "J", value: "jjjj",
						optional: true })
				
				//Option with a description and reviver
				//The reviver receives the string value and returns the new value,
				//it's like the json reviver function
				.option ({ short: "k", argument: "K", description: "kkkk",
						reviver: function (value){
							return value + "foo";
						}})
				
				//Hidden option, it isn't printed in the --help and --usage messages
				.option ({ short: "l", hidden: true })
				
				.help ()
				.usage ()
				.end ()
		.argv ();

console.log (argv);

/*
$ node options.js

{
	_debug: false,
	_filename: <__filename>,
	aaaa: false,
	b: true,
	c: null,
	d: 0,
	e: [],
	f: false,
	g: "gggg",
	i: null,
	j: "jjjj",
	k: null,
	l: false,
	help: false,
	usage: false,
	arg1: false,
	arg2: false,
	arg3: false
}

--------------------------------------------------------------------------------

$ node options.js --help

Usage: options.js [OPTIONS] [ARGUMENTS]

  arg1
  arg2                        aaaa

  -a, --aaaa
      --no-b
  -c C
  -d D
  -e E
  -f F
      --g=G
  -i[I]
      --j[=J]
  -k K                        kkkk
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit

--------------------------------------------------------------------------------

$ node options.js --usage

Usage: options.js [-ha] [-c C] [-d D] [-e E] [-f F] [-i[I]] [-k K] [--aaaa]
         [--b] [--g=G] [--j[=J]] [--help] [--usage] [arg1] [arg2]
*/