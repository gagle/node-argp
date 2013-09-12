"use strict";

process.argv = ["node", __filename];

var argp = require ("../lib");

//It doesn"t make any sense to define the options and don't parse the options
//--help or --usage, but here it is

var argv = argp
		.argument ("arg1")
		.argument ("arg2")
		.body (function (body){
			body
					//Every option has an id that is used to save the option into the
					//final object. The id is the long name, and if it isn't defined, the
					//short name.
					
					//Positive flag because it doesn't define the "argument" property
					.option ({ short: "a", long: "aaaa" })
					
					//Negative flag because it doesn't define the "argument" property
					.option ({ long: "b", negate: true })
					
					//Option with a mandatory value and null as default value
					//The argument string it's used in the --help and --usage options.
					//Because we don't need any of these two commands (again, it's silly;
					//--usage is less used but --help is essential) the argument can be
					//set to a truthy value, ie: true
					.option ({ short: "c", argument: "C" })
					
					//Option with a mandatory value and "dddd" as default value
					.option ({ long: "d", argument: true, value: "dddd" })
					
					//Option with an optional value and null as default value
					.option ({ short: "e", argument: true, optional: true })
					
					//Option with an optional value and "ffff" as default value
					.option ({ long: "f", argument: true, value: "ffff",
							optional: true })
					
					//Option with a description and reviver
					.option ({ short: "g", argument: true, description: "gggg",
							reviver: function (value){
								return "-> " + value + " <-";
							}});
		})
		.argv ();

console.log (argv);

/*
{
	_debug: false,
	_filename: <__filename>,
	aaaa: false,
	b: true,
	c: null,
	d: "dddd",
	e: null,
	f: "ffff",
	g: null,
	arg1: false,
	arg2: false
}
*/