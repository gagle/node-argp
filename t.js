"use strict"

var argv = require("./lib")
		.on ("start", function (){
			//console.log(this.options())
		})
		.body ()
				.option ({ short: "a", long: "abc", argument:"asd", type: Number, optional: true, choices: [2] })
				.help()
				.end ()
		.argv ()
console.log(argv)