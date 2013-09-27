"use strict";

require ("../../lib")
		.command ("config")
				.on ("end", config)
				.description ("Manages the npm configuration files.")
				.body ()
						.text (" Commands:")
						.argument ("set", { trailing: { min: 1, max: 2 } ,
								help: "set <key> [<value>]",
								description: "Sets the config key to the value. If value is " +
										"omitted, then it sets it to \"true\"." })
						.argument ("get", { trailing: { max: 1 },
								help: "get [<key>]",
								description: "Echo the config value to stdout." })
						.argument ("list", { description: "Show all the config settings." })
						.text ("\n Options:")
						.help ();
						
function config (argv){
	//Code...
	console.log (argv);
};