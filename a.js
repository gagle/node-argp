var argp = require ("./lib");
var util = require ("util");

var opts = argp
		.on ("argument", function (obj, argument){
			console.log (argument);
		})
		.on ("option", function (obj, long, option, value){
			console.log (long, option, value);
		})
		.configure ({
			//allowUndefinedOptions: false
			//allowUndefinedArguments: false
		})
		.option ({ short: "a", argument: "NUM", optional: true })
		.text ("Lies and more lies motherfucker!")
		.option ({ long: "b", argument: "NUM", optional: false })
		.option ({ long: "cc", short: "c", description: "jajaja" })
		.group ("Informational options")
		//.version ("v0.0.0")
		.argument ("asd")
		//.usage ("asdadasdadasd")
		//.usage ("wwwwwwwwwwww")
		.description ("hey go!")
		.email ("a@b.c")
		.parse ();
		
console.log (util.inspect (opts, { depth: null }));