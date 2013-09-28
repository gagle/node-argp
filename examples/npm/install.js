"use strict";

require ("../../lib")
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
						
function install (argv){
	//Code...
	console.log (argv);
};