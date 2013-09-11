var argp = require ("./lib");
var util = require ("util");

var argv = argp
		.on ("argument", function (obj, argument){
			//console.log (argument);
		})
		.on ("option", function (obj, option, value, long){
			//console.log (option, value, long);
		})
		.configuration ({
			//allowUndefinedOptions: false
			//allowUndefinedArguments: false
		})
		.version ("v0.0.0")
		.email ("a@b.c")
		.description ("Does something magic that I still don't know asd asdasdasdasdas asd asd asasd asda sassda dasd asd")
		.usage ("sdasd ad adasd asdas asd asasas asdas asd asd asdas asd asdas asd asdas")
		.usage ("sdasd ad adasd asdas asd asasas asdas asd asd asdas asd asdas asd asdas asd 123")
		.argument ("asdetertrqweqwe")
		.argument ("qwedfgdfgdfg")
		.argument ("dfgdfgdfg")
		.body (function (body){
			body
					.option ({ short: "a", argument: "NUM", optional: true })
					.text ("some text some text some text some text some text some text some text some text some text some text")
					.option ({ long: "b", argument: "NUM", optional: false, description: "asda sdas asdas asd asd asdasasd asd asd asdas asd adas asdasdas asd asdas asd asd asda asd asdasd asdas asd asd asd asda sd" })
					.option ({ long: "cc", short: "c", description: "cccccccc" })
					.group ("Informational options asd asd adas asdqqwe qwe qeqe qwe qe qwe qwe qwe qwe qqwe qwe")
		})
		.argv ();

console.log (argv);