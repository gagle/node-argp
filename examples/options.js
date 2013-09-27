"use strict";

var argv = require ("../lib")
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
				.option ({ short: "c", metavar: "C" })
				
				//Option with a Number type and 0 as default value
				//By default the options are strings
				.option ({ short: "d", metavar: "D", type: Number })
				
				//Option with an Array type and [] as default value
				//Array-type values must be comma-separated values, eg: --a 1,a,true
				//Each element is converted automatically to the type it represents,
				//the previous example is converted to { a: [1, "a", true] }
				.option ({ short: "e", metavar: "E", type: Array })
				
				//Option with a Boolean type and false as default value
				//This type is not very useful because you can just use a flag, eg:
				//--a true is converted to { a: true }
				.option ({ short: "f", metavar: "F", type: Boolean })
				
				//Option with a mandatory value and "gggg" as default value
				.option ({ long: "g", metavar: "G", default: "gggg" })
				
				//Option with an optional value and null as default value
				.option ({ short: "i", metavar: "I", optional: true })
				
				//Option with an optional value and "jjjj" as default value
				.option ({ long: "j", metavar: "J", default: "jjjj",
						optional: true })
				
				//Option with a description and reviver
				//The reviver receives the string value and returns the new value,
				//it's like the json reviver function
				.option ({ short: "k", long: "kkkk", metavar: "K", description: "kkkk",
						reviver: function (value){
							return value + "foo";
						}})
				
				//Hidden option, it isn't printed in the --help and --usage messages
				.option ({ short: "l", hidden: true })
				
				//Option with an alias
				.option ({ short: "m", long: "mm", aliases: ["x"] })
				
				//Option with choices
				.option ({ short: "n", type: Number, choices: [1, 10, 100] })
				
				.help ()
				.usage ()
		.argv ();

console.log (argv);

/*
$ node options.js

{
	aaaa: false,
	b: true,
	c: null,
	d: 0,
	e: [],
	f: false,
	g: "gggg",
	i: null,
	j: "jjjj",
	kkkk: null,
	l: false,
	mm: false,
	n: false,
	help: false,
	usage: false,
	arg1: false,
	arg2: false,
	arg3: false
}

--------------------------------------------------------------------------------

$ node options.js --help

Usage: options [options] [arguments]

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
  -k, --kkkk=K                kkkk
  -m, --mm, --x
  -n
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit

--------------------------------------------------------------------------------

$ node options.js --usage

Usage: options [-n] [-c C] [-d D] [-e E] [-f F] [-i[I]] [-a|--aaaa] [--b]
         [--g=G] [--j[=J]] [-k|--kkkk=K] [-m|--mm|--x] [-h|--help] [--usage]
         [arg1] [arg2]
*/