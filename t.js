var argp = require ("./lib");
var util = require ("util");

//All operations are synchronous

//argp.debug it's true if the node process is started in debug mode:
//node debug <script> ...

var opts = argp
		//With the obj parameter we can define aliases, for example a flag "-f" that
		//is the same as "-a 3". When the flag "-f" is found it can just do:
		//In the "argument" event: if (argument === "f") obj.a = 3
		//In the "end" event: if (argument.f) obj.a = 3
		.on ("argument", function (obj, argument, ignore){
			//obj is the final object with al the options/arguments already parsed
			//argument is a string
			//ignore is a function, if it's executed the argument is ignored an does
			//not modify the final object
			console.log (argument);
			console.log (argp.arguments ()); //Returns an array with all the defined arguments
			//fail() prints a message to stderr and exits. Messages are prefixed like so:
			//<script>: message...
			if (argument === "fail") argp.fail ("fail() test");
		})
		.on ("option", function (obj, long, option, value, ignore){
			//obj is the final object with al the options/arguments already parsed
			//long is true if the option has a long name, otherwise false
			//option is a string
			//value is undefined if the option is a flag or the value returned by the
			//replacer; it can be null if is optional
			//ignore is a function, if it's executed the argument is ignored an does
			//not modify the final object
			console.log (option);
			console.log (util.inspect (argp.options (), { depth: null })); //Returns an array with all the defined options
		})
		.on ("end", function (obj){
			//obj is the final object with al the options/arguments already parsed
			//Called when all the options and arguments are parsed, just before parse() returns
			//This is the place to clean up and prepare information
			if (obj.ellipsis) obj.dots = 3;
			console.log ("end");
		})
		.configure ({
			columns: 80, //Default is 80
			//No error with duplicate options
			undefinedArguments: true, //Allows to write any argument
			undefinedOptions: false, //Does not allow to write undefined options
			//-h, --help and --usage are default options
			//Short and long names can be changed:
			//var options = argp.options ()
			//options.help.short = "?"; //help option
			//options.usage.short = "u"; //usage option
			showHelp: true, //Default is true
			showUsage: true //Default is true
		})
		//Adds the option -v, --version
		.version ("v0.0.1") //Typically: .version("v" + require("package.json").version)
		.description ("Show some dots on the screen.")
		//Contact email
		.email ("a@b.c")
		//By default, the usage description is:
		//<filename> [OPTIONS...] [ARGUMENTS...]
		//With the usage() function it can be changed and add multiple uses:
		//Usage: my-script hack nasa
		//       my-script goto jail
		.usage ("my-script hack nasa")
		.usage ("my-script goto jail")
		//Defined arguments
		//Argument definitions can be configured at any time, they don't need to be
		//set before the options
		.argument ("build")
		.argument ("fail")
		//Options and group definitions have an insertion order
		//Options can be grouped
		.group ("Basic options")
		//Defined options
		.option ({
			//If long and short are defined, the long name is used to save the value in the final object
			short: "d",
			long: "dots",
			argument: "NUM", //If the argument is null then it's a flag and "reviver", "value"
											 //and "optional" are ignored and "negate" can be configured
											 //Default is null so all the options are flags by default
											 //Example of flags:
											 //.option({ short: "f1", description: "..." })
											 //.option({ short: "f2", long: "flag2", negate: true }) -> --no-flag2
			description: "Show NUM dots on the screen", //Default is null
			value: 1, //Default value, default is null
			optional: false, //Default is false
			hidden: false, //Default is false
			reviver: function (value){
				//Transforms the value
				//Useful to parse comma-separated values, dates, etc
				//Default is null
				return value;
			}
		})
		//At anytime we can add text. Text lines are not indented.
		.text ("The following option is an alias. An ellipsis has 3 dots.")
		.option ({
			long: "ellipsis",
			description: "Shows 3 dots"
		})
		//This group applies to --help, --usage and --version
		.group ("Informational options")
		//Footer information
		.text ("Bye!")
		.parse ();

//At this point all the data is ready to be used
//opts.dots
//opts.ellipsis
//opts.build
//opts.fail
console.log (util.inspect (opts, { depth: null }));