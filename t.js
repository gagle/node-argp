"use strict"

var argv = require("./lib")
		.on ("start", function (){
			console.log(this.options())
		})
		.body ()
				.option ({ short: "a", long: "abc", aliases: ["wat"] })
				.help()
				.usage()
				.end ()
		.argv ()
console.log(argv)