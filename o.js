//console.log (require ("optimist").argv);
//console.log (require ("./lib").argv ())

var opts = require ("./lib").argument ("a").body (function (body){
			body.option ({ long: "b" });
			body.option ({ short: "c", negate: true });
			body.option ({ short: "d", argument: "a", value: 2 });
			body.option ({ short: "e", argument: "a", optional: true });
		}).argv ();

console.log (opts);