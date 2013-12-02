"use strict";

var argv = require ("../lib").createParser ({ once: true })
		.allowUndefinedOptions ()
		.allowUndefinedArguments ()
		.argv (["-abc", "d", "--e=f", "g", "-i", "j", "--", "--k", "l"]);

console.log (argv);

/*
{
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