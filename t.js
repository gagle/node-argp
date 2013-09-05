var argp = require ("./lib");
var utils = require ("utils");

//All operations are synchronous

//argp.nodeDebug it's true if the node process is started in debug mode:
//node debug <script> ...

var opts = argp
		.on ("argument", function (argument){ //argument is a string
			console.log (argument);
			console.log (argp.arguments ()); //Returns an array with all the defined arguments
			//fail() prints a message to stderr and exits. Messages are prefixed like so:
			//<script>: message...
			if (argument === "fail") argp.fail ("fail() test");
		})
		.on ("option", function (option, value){ //option and value are strings; value can be null
			console.log (option);
			utils.inspect (argp.options (), { depth: null }); //Returns an array with all the defined options
		})
		.on ("end", function (){
			//Called when all the options and arguments are parsed, just before parse returns
			//This is the place to clean up and prepare information
			console.log ("end");
		})
		.configure ({
			//false: options are parsed first, then the arguments
			//true: options and arguments are parsed in the same order they come
			//Note: options and arguments can override each other if they have the same name
			//Default is false
			inOrder: false,
			//Default is 80 columns
			columns: 80,
			errors: {
				//Default values
				argumentNotDefined: false,
				optionNotDefined: true,
				duplicateOptions: false,
				duplicateArguments: false
			},
			//-h, --help and --usage are default options
			//Short and long names can be changed:
			//var arr = argp.options ()
			//arr[arr.length - 2].short = "?"; //help option
			//arr[arr.length - 1].short = "u"; //usage option
			defaultOptions: {
				//Default values, set to false to remove them
				help: true,
				usage: true
			}
		})
		//Adds the option -v, --version
		.version ("v0.0.1")
		//By default, the usage description is:
		//<filename> [OPTIONS...]
		//followed by all the defined arguments surrounded by []:
		//<filename> [OPTIONS...] [arg1] [arg2]
		//With the usage() function it can be changed and add multiple uses:
		//Usage: my-script hack nasa
		//       my-script goto jail
		.usage ("my-script hack nasa")
		.usage ("my-script goto jail")
		.description ("Show some dots on the screen.")
		//Defined arguments
		//Argument definitions can be configured at any time, they don't need to be
		//set before the options
		.argument ("build")
		.argument ("fail")
		//Options and group definitions have an insertion order
		//Options can be grouped
		.group ("Basic options") //Internally it creates a numeric id
		//Defined options
		.option ({
			//Internally it adds the group property
			//group: ...,
			//long and short are optional by at least one must be defined
			long: "dot",
			short: "d",
			//The option value
			//Default is null
			argument: {
				string: "NUM",
				//Default value
				//Default is null
				value: null
				//Default is false
				optional: false
			},
			description: "Show NUM dots on the screen.",
			//Default is false
			hidden: false,
			//--no-dot
			//Default is false
			negate: false,
			//Transforms the value to specific needs
			//Default is null
			reviver: function (value){
				return value;
			}
		})
		//This group applies to --help, --usage and --version
		.group ("Informational options")
		//Footer information
		.footer ("Bye!")
		//Only one call to parse is allowed, subsequent calls throw an error
		.parse ();

//At this point all the data is ready to be used
//opts.dot
//opts.build
//opts.fail
utils.inspect (opts, { depth: null });