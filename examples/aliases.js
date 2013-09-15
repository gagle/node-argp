"use strict";

process.argv = ["node", __filename, "--ellipsis"];

var argp = require ("../lib");

/*
Aliases are rarely used, that's why they cannot be configured explicitly.
If you need aliases you can play with the events. Say we have a --dot option. By
default it prints one dot. If we want to print an ellipsis we can pass the value
of 3 or we can define an --ellipsis flag. When it is enabled it prints 3 dots.
--ellipsis will we an alias.
*/

var argv = argp
		.configuration ({
			showHelp: true
		})
		.on ("end", function (argv){
			if (argv.ellipsis) argv.dot = 3;
		})
		.body (function (body){
			body
					.option ({
						short: "d",
						long: "dot",
						argument: "N",
						optional: true,
						value: 1,
						type: Number,
						description: "Print N dots, default is 1"
					})
					.option ({
						long: "ellipsis",
						description: "Print 3 dots, same as --dots=3"
					});
		})
		.argv ();

console.log (argv);

/*
{
	_debug: false,
	_filename: <__filename>,
	dot: 3,
	ellipisis: true,
	help: false
}
*/