"use strict"

var argv = require("./lib")
		.main()
				.body ()
						.help()
						.usage()
						.end ()
		.command ("a", { trailing: { eq: 1 } }).body ()
					.argument ("b", { trailing: { eq: 1 } })
					.argument ("c")
					.end ()
		.argv ()
console.log(argv)