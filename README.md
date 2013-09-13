argp
====

_Node.js project_

#### Command-line option parser ####

Version: 0.0.0

Inspired by the extremly well-known [argp C library](http://www.gnu.org/software/libc/manual/html_node/Argp.html), this module provides a very handy and easy to use configuration to parse GUN-style command-line arguments. Help, usage and version messages are automatically generated, line-wrapped at 80 columns and fully customizable.

You don't even need to configure anything, just write:

```javascript
var argv = require ("argp").argv ();
```

#### Installation ####

```
npm install argp
```

#### Documentation ####

__Full example explained__


Take a look at the [examples](https://github.com/gagle/node-argp/tree/master/examples) for further detais, specially the [options](https://github.com/gagle/node-argp/blob/master/examples/options.js) example to see how to configure the different types of options.

```javascript
var argp = require ("argp");

var argv = argp
		.on ("start", function (argv){
			//Emitted when the default values are set and before starting the read
			
			//"argv" is the final object
		})
		.on ("argument", function (argv, argument, ignore){
			//Emitted when an argument is found
			
			//"argv" is the final object
			//"argument" is the argument found
			//"ignore" is a function that when called ignores the argument, hence it
			//doesn't appear in the final object
		})
		.on ("option", function (argv, option, value, long, ignore){
			//Emitted when an option is found
			
			//"argv" is the final object
			//"option" is the name of the option found
			//"value" is the value of the option after using the reviver, if any
			//"long" is a boolean; true if the option found has a long name,
			//false if the option found has a short name
			//"ignore" is a function that when called ignores the argument, hence it
			//doesn't appear in the final object
		})
		.on ("end", function (argv){
			//Emitted just before the argv() function returns
			
			//"argv" is the final object
		})
		.configuration ({
			//Wrap lines at 80 columns
			columns: 80,
			//If true, the options are emitted before any argument, otherwise the
			//options and arguments are emitted in the same order they come
			sort: true,
			//Enable the option -h, --help
			showHelp: true,
			//Enable the option --usage
			showUsage: true,
			//Undefined options don't throw any error
			allowUndefinedOptions: true,
			//Undefined arguments don't throw any error
			allowUndefinedArguments: true
		})
		//Enable the option -v, --version
		.version ("v1.2.3")
		//Display a description
		.description ("Sample app.")
		//Display a contact email
		.email ("a@b.c")
		//Configure some arguments, this is only needed to show them in the --usage
		//message and arguments() function, and to set their default values to false
		.argument ("arg1")
		.argument ("arg2")
		//Configure the body part: options, groups and text
		.body (function (body){
			//The configuration has an insertion order
			body
					//Display a text label
					.text ("Random text")
					//Display a group label
					.group ("Group 1")
					//After a group label you tipically display options
					.option ({ short: "a", long: "aa", description: "aaa" })
					.option ({ short: "b", long: "bb", description: "bbb" })
					//This group label will be displayed before --help, --usage and
					//--version
					.group ("Group 2")
					
		})
		//Parse the options
		argv ();
```