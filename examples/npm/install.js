"use strict";

module.exports = function (parser){
	parser
			//"trailing: {}" is equivalent to "trailing: { min: 0, max: Infinity }"
			.command ("install", { trailing: {} })
					.on ("end", install)
					.description ("Installs packages.")
					.body ()
							.text ("npm install\n" +
									"npm install <pkg>\n" +
									"npm install <pkg>@<tag>\n" +
									"npm install <pkg>@<version>\n" +
									"npm install <pkg>@<version range>\n" +
									"npm install <folder>\n" +
									"npm install <tarball file>\n" +
									"npm install <tarball url>\n" +
									"npm install <git:// url>\n" +
									"npm install <github username>/<github project>\n\n" +
									" Options:")
							.help ();
};

//Note: The parser doesn't need to be explicitly nulled because when the
//"install" function is executed, at this point the parser object is
//unreferenced automatically (it was nulled in the main module, npm.js)

function install (argv){
	//Code...
	console.log (argv);
};