"use strict";

module.exports = function (parser){
	parser
			.command ("config")
					.on ("end", config)
					.description ("Manages the npm configuration files.")
					.body ()
							.text (" Commands:")
							.argument ("set", { trailing: { min: 1, max: 2 } ,
									synopsis: "set <key> [<value>]",
									description: "Sets the config key to the value. If value " +
											"is omitted, then it sets it to \"true\"." })
							.argument ("get", { trailing: { max: 1 },
									synopsis: "get [<key>]",
									description: "Echo the config value to stdout." })
							.argument ("list", { description: "Show all the config " +
									"settings." })
							.text ("\n Options:")
							.help ();
};

//Note: The parser doesn't need to be explicitly nulled because when the
//"config" function is executed, at this point the parser object is unreferenced
//automatically (it was nulled in the main module, npm.js)

function config (argv){
	//Code...
	console.log (argv);
};