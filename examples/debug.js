"use strict";

//argp also works when Node.js is in debug mode
process.argv = ["node", "debug", __filename];

console.log (require ("../lib").argv ());

/*
{
	_debug: true,
	_filename: __filename,
}
*/