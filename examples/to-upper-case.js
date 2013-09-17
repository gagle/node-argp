"use strict";

var argp = require ("../lib");

/*
Converts to upper case any phrase if the -u option is passed.

$ node to-upper-case.js this is a sample text with the -u option

{
	_debug: false,
	_filename: <__filename>,
	u: true,
	phrase: "THIS IS A SAMPLE TEXT WITH THE OPTION"
}
*/

argp
		.on ("start", function (argv){
			argv.phrase = [];
		})
		.on ("argument", function (argv, argument, ignore){
			argv.phrase.push (argv.u ? argument.toUpperCase () : argument);
			
			//We don't want to store the words into the final object
			ignore ();
		})
		.on ("option", function (argv, option, value, long, ignore){
			//We only need the "-u" option, ignore the rest, if any
			if (option !== "u") ignore ();
		})
		.on ("end", function (argv){
			argv.phrase = argv.phrase.join (" ");
			console.log (argv);
		})
		//If "sort" is enabled, the options are parsed before the arguments
		.allowUndefinedArguments ()
		.sort ()
		.body ()
				.option ({ short: "u" })
				.end ()
		.argv ();