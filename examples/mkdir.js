"use strict";

var argv = require ("../lib").createParser ({ once: true })
    .description ("Create the DIRECTORY(ies), if they do not already exist.")
    .usages (["mkdir [OPTION]... DIRECTORY..."])
    .allowUndefinedArguments ()
    .on ("start", function (argv){
      argv.dirs = [];
    })
    .on ("argument", function (argv, argument, ignore){
      argv.dirs.push (argument);
      ignore ();
    })
    .body ()
        .text ("Mandatory arguments to long options are mandatory for short " +
            "options too.")
        .option ({ short: "m", long: "mode", metavar: "MODE",
            description: "Set file mode (as in chmod), not a=rwx - umask" })
        .option ({ short: "p", long: "parents", description: "No error if " +
            "existing, make parent directories as needed" })
        .option ({ short: "v", long: "verbose",
            description: "Print a message for each created directory" })
        .option ({ short: "Z", long: "context", metavar: "CTX",
            description: "Set the SELinux security cntext of each created " +
            "directory to CTX" })
        .help ({ short: false })
        .version ("v1.2.3", { short: false })
    .argv ();

console.log (argv);

/*
$ node mkdir.js --help

Usage: mkdir [OPTION]... DIRECTORY...

Create the DIRECTORY(ies), if they do not already exist.

Mandatory arguments to long options are mandatory for short options too.
  -m, --mode=MODE             Set file mode (as in chmod), not a=rwx - umask
  -p, --parents               No error if existing, make parent directories as
                                needed
  -v, --verbose               Print a message for each created directory
  -Z, --context=CTX           Set the SELinux security cntext of each created
                                directory to CTX
      --help                  Display this help message and exit
      --version               Output version information and exit
      
--------------------------------------------------------------------------------

$ node mkdir.js -p a b c

{
  mode: null,
  parents: true,
  verbose: false,
  context: null,
  help: false,
  version: false,
  dirs: ["a", "b", "c" ]
}

--------------------------------------------------------------------------------

$ node mkdir.js -- --help

{
  mode: null,
  parents: false,
  verbose: false,
  context: null,
  help: false,
  version: false,
  dirs: ["--help" ]
}
*/