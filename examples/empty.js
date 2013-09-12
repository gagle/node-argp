"use strict";

//argp also works when node is in debug mode
process.argv = ["node", "debug", "empty.js"];

var argp = require ("../lib");

var argv = argp.argv ();
console.log (argv);

/*
{
	_debug: true,
	_filename: <__filename>,
}
*/