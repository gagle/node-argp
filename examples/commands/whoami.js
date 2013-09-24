"use strict";

require ("../../lib")
		.command ("whoami")
				.on ("end", whoami)
				.description ("Display npm username. Just prints the 'username' " +
						"config.")
				.body ()
						.help ()
						.end ();
						
function whoami (){
	//Code...
	console.log ("gagle");
};