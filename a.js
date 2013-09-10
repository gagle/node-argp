var argp = require ("./lib");
var util = require ("util");

var argv = argp
		.on ("argument", function (obj, argument){
			//console.log (argument);
		})
		.on ("option", function (obj, long, option, value){
			//console.log (long, option, value);
		})
		.configure ({
			//allowUndefinedOptions: false
			//allowUndefinedArguments: false
		})
		.option ({ short: "a", argument: "NUM", optional: true })
		//.text ("some text some text")
		.option ({ long: "b", argument: "NUM", optional: false })
		.option ({ long: "cc", short: "c", description: "cccccccc" })
		.group ("Informational options")
		//.version ("v0.0.0")
		.argument ("asdetertrqweqwe")
		.argument ("qwedfgdfgdfg")
		.argument ("dfgdfgdfg")
		.description ("Does something magic that I still don't know asd asdasdasdasdas asd asd asasd asda sassda dasd asd")
		.email ("a@b.c")
		.usage ("sdasd ad adasd asdas asd asasas asdas asd asd asdas asd asdas asd asdas")
		.usage ("sdasd ad adasd asdas asd asasas asdas asd asd asdas asd asdas asd asdas asd 123")
		.argv ();

console.log (argv);