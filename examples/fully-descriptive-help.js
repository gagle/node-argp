"use strict";

var argp = require ("../lib");

var argv = argp
		.configure ()
		.argv ();

console.log (argv);

/*
{
	_debug: false,
	_filename: <__filename>,
}
*/