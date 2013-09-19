"use strict";

/*
Mimics two npm commands: deprecate and install.
The deprecate command is partially implemented but the install command
implements just the barebones.

Try the following commands:
	node npm -v
	node npm --help
	node npm deprecate --help
	node npm deprecate foo -> error! too few arguments
	node npm deprecate foo bar baz -> error! too many arguments
	node npm deprecate foo@0.0.1 "deprecated, if you know what I mean"
*/

//For a better organization these objects can be stored in different modules
var commands = {
	deprecate: {
		_first: true,
		_arguments: [],
		_options: null,
		onArgument: function (argp, argv, argument, ignore){
			if (this._first){
				//Ignore the first argument: "deprecate"
				this._first = false;
				//The argv object can be cached
				this._options = argv;
				return;
			}
			
			this._arguments.push (argument);
			
			if (this._arguments.length > 2){
				argp.fail ("deprecate: Too many arguments");
			}
			
			//Don't store the arguments into the argv object
			ignore ();
		},
		onEnd: function (argp){
			if (this._options.help){
				//npm deprecate --help
				console.log ("deprecate help");
				return;
			}else if (this._options.usage){
				//npm deprecate --usage
				console.log ("deprecate usage");
				return;
			}
			
			if (this._arguments.length < 2){
				argp.fail ("deprecate: Too few arguments");
			}
			
			//Do something with the options and arguments
			console.log (this._arguments);
			console.log (this._options);
		}
	},
	install: {
		onStart: function (argv){
			//...
		},
		onArgument: function (argp, argument){
			//...
		},
		onEnd: function (argp){
			//...
		}
	}
};

var command;

var argv = require ("../lib")
		.on ("argument", function (argv, argument, ignore){
			//Each command knows what to do, we only need to forward the a
			if (!command){
				command = argument;
			}
			
			//Pass the argp instance to do some validations
			//Don't cache it or remember to free it when you're not going to use it
			//anymore
			commands[command].onArgument (this, argv, argument, ignore);
		})
		.on ("option", function (argv, option, value, long, ignore){
			//When -h,--help, --usage and -v,--version are found the process exits
			//automatically
			//Because we want to use help and usage messages per command we have to
			//ignore and add them manually and check them later
			
			//First we get the option definition because we should use the "id"
			//property to set values to defined options
			
			var opt = this.options (long ? { long: true } : { short: true })[option];
			//Not need to check if opt is falsy because if the option is undefined
			//the program fails with a descriptive message
			
			//Check for the help and usage options
			if (opt.long === "help" || opt.long == "usage"){
				//Add the value manually
				argv[opt.id] = true;
				//Ignore the option or the process will finish
				ignore ();
			}
		})
		.on ("end", function (argv){
			//We also want to print a help and usage messages even if no command is
			//passed, eg: npm --help
			
			//This is a bit hacky because we are going to call to private functions:
			//_printHelp(), _printUsage(), _printVersion()
			//If any of these functions are called they print a message and the
			//process exits automatically
			
			if (!argv.deprecate && !argv.install){
				if (argv.help) this._printHelp ();
				if (argv.usage) this._printUsage ();
			}
			
			//Pass the argp instance to do some validations
			//Don't cache it or remember to free it when you're not going to use it
			//anymore
			commands[command].onEnd (this);
		})
		//Deprecate and install commands receive undefined strings
		.allowUndefinedArguments ()
		.description ("npm is the package manager for the Node JavaScript " +
				"platform. It puts modules in place so that node can find them, and " +
				"manages dependency conflicts intelligently.\n\n" +
				"It is extremely configurable to support a wide variety of use " +
				"cases. Most commonly, it is used to publish, discover, install, and " +
				"develop node programs.")
		.usages ([ "npm <command> [args]" ])
		.body ()
				//The commands are hidden, otherwise they're printed in the help message
				.argument ("deprecate", { hidden: true })
				.argument ("install", { hidden: true })
				
				.group ("Commands")
				.line ("deprecate, install", "  ")
				.group ("Informational options")
				.version ("v1.2.3")
				.line ("\n(the following can be used with any command)", "  ")
				.help ()
				.usage ()
				.end ()
		.argv ();