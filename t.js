"use strict"

var argv = require("./lib")
		.on ("start", function (){
			//console.log(this.options())
		})
		.body ()
				.option ({ short: "a", long: "abc", argument:"asd", aliases:["wat","por"] })
				.option ({ short: "c" })
				.help()
				.usage()
				.end ()
		.argv ()
console.log(argv)