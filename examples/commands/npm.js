"use strict";

//Configure the main menu
require ("../../lib")
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
						.line ("Where command is one of:")
						.line ("config, install, whoami\n", "  ")
						.columns ("npm <command> --help", "Quick help on <command>")
						.group ("Options")
						.option ({ short: "l", description: "Display full usage info" })
						.help ()
						.version ("v1.2.3");

//Configure subcomands
require ("./config");
require ("./install");
require ("./whoami");

//Start the parser
require ("../../lib").argv ();

function fullInfo (){
	//Code...
	console.log ("full usage info")
};