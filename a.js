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
			undefinedOptions: true
			//undefinedArguments: false
		})
		.option ({ long: "a", argument: "." })
		.parse ();
		
console.log (util.inspect (opts, { depth: null }));