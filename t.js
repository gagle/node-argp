"use strict"

var argv = require("./lib")
		.command ("config")
				.body ()
						.argument ("set", { help: "set <key> [<value>]",
								trailing: { max: -2 } })
						.help ()
						.end ()
		.argv ()

console.log(argv)