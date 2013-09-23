"use strict";

process.argv = ["node", __filename, "-a", "b", "arg1", "--c=d", "arg2"];

//The events allow you to fully adapt the parser to your needs
//See to-upper-case.js example

require ("../lib")
		.on ("start", function (argv){
			//Emitted after the default values of the configured options and arguments
			//have been set and before starting the read.
			
			//"argv" is the final object
			
			console.log ("START");
		})
		.on ("argument", function (argv, argument, ignore){
			//Emitted when an argument is found
			
			//"argv" is the final object
			//"argument" is the argument found
			//"ignore" is a function that when called ignores the argument, hence it
			//it isn't stored in the final object
			
			console.log ("ARGUMENT:", argument);
		})
		.on ("option", function (argv, option, value, long, ignore){
			//Emitted when an option is found
			
			//"argv" is the final object
			//"option" is the name of the option found
			//"value" is the value of the option after calling the reviver, if any
			//"long" is a boolean; true if the option is a long name, otherwise false
			//"ignore" is a function that when called ignores the argument, hence it
			//it isn't stored in the final object
			
			console.log ("OPTION:", option, value, long);
		})
		.on ("end", function (argv){
			//Emitted when all the options and arguments have been read
			
			//"argv" is the final object
			
			console.log ("END");
		})
		.sort ()
		.allowUndefinedOptions ()
		.allowUndefinedArguments ()
		.argv ();

/*
START
OPTION: a b false
ARGUMENT: arg1
OPTION: c d true
ARGUMENT: arg2
END

If the "sort()" function is uncommented:

START
OPTION: a b false
OPTION: c d true
ARGUMENT: arg1
ARGUMENT: arg2
END
*/