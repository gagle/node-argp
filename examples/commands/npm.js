"use strict";

//Configure the main menu
require ("../../lib")
		//main() is optional, no-op, just for a better visual organization
		.main ()
				.on ("end", function (argv, printHelp){
					if (argv.l){
						fullInfo ();
					}else{
						printHelp ();
					}
				})
				.usages (["npm <command>"])
				.body ()
						.text ("Where command is one of:")
						.text ("config, install, whoami\n", "  ")
						.columns ("npm <command> --help", "Quick help on <command>")
						.text ("\n Options:")
						.option ({ short: "l", description: "Display full usage info" })
						.help ()
						.version ("v1.2.3");

//Configure comands
require ("./config");
require ("./install");
require ("./whoami");

//Start the parser
require ("../../lib").argv ();

function fullInfo (){
	//Code...
	console.log ("full usage info")
};