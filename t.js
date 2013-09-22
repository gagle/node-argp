var argv = require("./lib")
		.body ()
				.option ({ long: "asd", negate: true })
				.end ()
		.argv ()

console.log (argv);