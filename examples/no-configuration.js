"use strict";

process.argv = ["node", __filename, "-abc", "d", "--e=f", "g", "-i", "j", "--",
		"--k", "l"];

var argp = require ("../lib");

var argv = argp.allowUndefinedOptions ().allowUndefinedArguments ().argv ();
console.log (argv);

/*
{
	_debug: false,
	_filename: <__filename>,
	a: true,
	b: true,
	c: "d",
	e: "f",
	g: true,
	i: "j",
	"--k": true,
	l: true
}
*/