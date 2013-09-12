"use strict";

process.argv = ["node", __filename, "-a", "b", "arg1", "--c=d", "arg2"];

var argp = require ("../lib");

//The events allow you to fully adapt the parser to your needs
//See to-upper-case.js example

argp
		.on ("start", function (argv){
			//Emitted when the default values are set and before starting the read
			
			//"argv" is the final object
			
			console.log ("START");
		})
		.on ("argument", function (argv, argument, ignore){
			//Emitted when an argument is found
			
			//"argv" is the final object
			//"argument" is the argument found
			//"ignore" is a function that when called ignores the argument, hence it
			//doesn't appear in the final object
			
			console.log ("ARGUMENT:", argument);
		})
		.on ("option", function (argv, option, value, long, ignore){
			//Emitted when an option is found
			
			//"argv" is the final object
			//"option" is the name of the option found
			//"value" is the value of the option after using the reviver, if any
			//"long" is a boolean; true if the option found has a long name,
			//false if the option found has a short name
			//"ignore" is a function that when called ignores the argument, hence it
			//doesn't appear in the final object
			
			console.log ("OPTION:", option, value, long);
		})
		.on ("end", function (argv){
			//Emitted just before the argv() function returns
			
			//"argv" is the final object
			
			console.log ("END");
		})
		.argv ();

/*
START
OPTION: a b false
ARGUMENT: arg1
OPTION: c d true
ARGUMENT: arg2
END
*/