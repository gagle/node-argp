//console.log (require ("optimist").argv);
//console.log (require ("./lib").argv ())

var opts = require ("./lib").configuration ({ showHelp: true, showUsage: true }).argv ();

console.log (opts);