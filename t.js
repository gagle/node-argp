"use strict"

var argv = require("./lib")
		.body ()
				.option ({ short: "a", long: "abc", negate: true })
				.end ()
		.argv ()
console.log(argv)