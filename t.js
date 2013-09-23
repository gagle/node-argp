"use strict"

var argv = require("./lib")
		.main()
				.body ()
						
						.help()
						.usage()
						.end ()
		/*.command("foo")
				.body ()
						.option ({ long: "b" })
						.help()
						.usage()
						.end ()*/			
		.argv ()
console.log(argv)