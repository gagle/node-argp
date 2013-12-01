"use strict";

var argp = require ("./lib");

var p = argp.createParser ({ once: false });

p.on ("error", function (str){
	console.error (str);
})

console.log (p.argv (["-n", "-b"]));
console.log (p)
//console.log (p.argv (["-s"]));