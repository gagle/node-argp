"use strict";

module.exports = function (parser){
	parser
			.command ("whoami")
				.on ("end", whoami)
				.description ("Display npm username. Just prints the 'username' " +
						"config.")
				.body ()
						.help ();
};

//Note: The parser doesn't need to be explicitly nulled because when the
//"whoami" function is executed, at this point the parser object is
//unreferenced automatically (it was nulled in the main module, npm.js)

function whoami (){
	//Code...
	console.log ("gagle");
};