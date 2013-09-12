//console.log (require ("optimist").argv);
//console.log (require ("./lib").argv ())

var opts = require ("./lib").body (function (body){
	body.option ({ short: "a", argument: "a" });
				body.option ({ short: "b", argument: "a" });
}).argv ();

console.log (opts);