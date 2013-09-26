"use strict"

var argv = require("./lib")
		.main ()
				.description ("Main menu")
				.body ()
						.help ()
						.usage ()
						.end ()
		.command ("config")
				.body ()
						.argument ("set", { help: "set <key> [<value>]",
								trailing: { min: 1, max: 2 } })
						.help ()
						.end ()
		.command ("install")
				.body ()
						.argument ("x", { trailing: { eq: 1 } })
						.argument ("z", { trailing: {} })
						.usage ()
						.end ()
		.argv ()

console.log(argv)