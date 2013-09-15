argp
====

_Node.js project_

#### Command-line option parser ####

Version: 0.0.3

Inspired by the extremly well-known [argp C library](http://www.gnu.org/software/libc/manual/html_node/Argp.html), this module provides a very handy and easy to use configuration to parse GUN-style command-line arguments. Help, usage and version messages are automatically generated, line-wrapped at 80 columns and fully customizable.

You don't even need to configure anything, just write:

```javascript
var argv = require ("argp").argv ();
```

`argp` also works when Node.js is in debug mode. 

#### Installation ####

```
npm install argp
```

#### Documentation ####

- [Full example explained](#full)
- [Quick examples with no configuration](#quick)
- [Configuring options](#options)

#### Objects ####

- [Argp](#argp_object)

---

<a name="full"></a>
__Full example explained__

Take a look at the [examples](https://github.com/gagle/node-argp/tree/master/examples) for further details, specially the [options.js](https://github.com/gagle/node-argp/blob/master/examples/options.js) example to see how to configure the different types of options.

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
		//Configure some arguments, this is only needed to display them in the --usage
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

---

<a name="quick"></a>
__Quick examples with no configuration__

- `node script.js -a -b -c`  
  `{ a: true, b: true, c: true }`
- `node script.js a b c`  
  `{ a: true, b: true, c: true }`
- `node script.js -abc d`  
  `{ a: true, b: true, c: "d" }`
- `node script.js --a --b c --d=e`  
  `{ a: true, b: "c", d: "e" }`
- `node script.js --no-a b`  
  `{ a: false, b: true }`
- `node script.js --a -- -b --c d`  
  `{ a: true, "-b": true, "--c": true, d: true }`

---

<a name="options"></a>
__Configuring options__

---

<a name="argp_object"></a>
__Argp__

The module returns an instance of `Argp`. It inherits from an EventEmitter.

The parser follows the GNU style: `-a`, `-abc`, `--a`, `--no-a`, `--a=b`, etc.

If you don't want to configure anything simply require the module and call to `argv()`.


```javascript
var argv = require ("argp").argv ();
```

Note: If no configuration is provided you cannot join a short name with its value in the same token, eg: `-Dvalue`, all the characters following a dash, `-`, are interpreted as individual flags.

The `argv()` function returns an object. It is cached, so you can require and call the function from any module at any time. All the internal stuff that is used to parse the options is freed, only the object that is returned remains in memory, so the module has a low memory footprint.

The object that `argv()` returns has two special properties: `_debug` and `_filename`. `_debug` is a boolean and is true if the Node.js process has been started in debug mode, otherwise false. Debug mode: node debug \<script\>. `_filename` is the absolute path of the main script.

If you are using this module it's because you want a fully customizable help message, so you should always enable it. The usage message is not really useful, you can ignore it if you prefer.

All the text messages accept line break characters (`\n`). They will be indented according to the functionality of the caller function.

That being said, the basic configuration steps are (all of them are optional):

- Configure the global settings. By default it allows undefined options and arguments, if this is not your case disable them. If they are disabled the program prints an error message and exits with code 1. Lines are automatically wrapped at 80 columns.

  Example enabling the help message and disabling undefined options and arguments. This is probably the most usual case.

	```javascript
	argp.configuration ({
		showHelp: true,
		allowUndefinedOptions: false,
		allowUndefinedArguments: false
	});
	```

- From highest to lowest relevance, set the description, version and email. If you use the `package.json` file you can take the information from there. If you set the version the __-v, --version__ option will be enabled. The description is displayed at the top of the help message and the email at the bottom.

	```javascript
	argp.description ("Random description.");
	argp.version ("v1.2.3");
	argp.email ("a@b.c");
	```

- If your program requires arguments like `build`, `install`, etc. add them, but they will be only displayed in the usage message. They are initialized to false and can be retrieved with the `arguments()` function. Not very useful if you allow undefined arguments.

	```javascript
	argp.argument ("build");
	argp.argument ("install");
	```

- Finally, configure the options with the `body()` function. It requires a callback, executes it and returns as a parameter a `Body` instance. The options, groups and text are displayed in the same order they are configured. This allows you to fully customize the help message.

	```javascript
	argp.body (function (body){
		body
				.group ("Random group")
				.option ({ short: "o", long: "outfile", value: ".", argument: "PATH",
						description: "Destination PATH of the file" })
				.option ({ long: "strict", description: "Enable strict parse mode" })
				.text ("Random text.")
				.group ("Informational options");
	});
	```
	See how you can configure the options [here](#options);
	
- You can also listen to some events: `start`, `end`, `option`, `argument`. They are pretty useful and allows you to fully adapt this module to your needs.

- Call to `argv()` and enjoy.

	```
	node script.js
	
	{
		_debug: false,
		_filename: <__filename>,
		outfile: ".",
		strict: false,
		help: false,
		version: false,
		build: false,
		install: false
	}
	```
	```
	node script.js -o
	
	t.js: Option '-o' requires an argument.
	Try 't.js --help' for more information.
	```
	```
	node script.js -o "random/path" --strict build
	
	{
		_debug: false,
		_filename: <__filename>,
		outfile: "random/file",
		strict: true,
		help: false,
		version: false,
		build: true,
		install: false
	}
	```
	```
	node script.js -h
	
	Usage: t.js [OPTIONS] [ARGUMENTS]

	Random description.
	
	 Random group:
	  -o, --outfile=PATH          Destination PATH of the file
	      --strict                Enable strict parse mode
	
	Random text.
	
	 Informational options:
	  -h, --help                  Display this help and exit
	  -v, --version               Output version information and exit
	
	Report bugs to <a@b.c>.
	```

__Events__

- [argument](#event_argument)
- [end](#event_end)
- [option](#event_option)
- [start](#event_start)

__Methods__

- [Argp#argument(str) : Argp](#argp_argument)
- [Argp#arguments() : Object](#argp_arguments)
- [Argp#argv() : Object](#argp_argv)
- [Argp#body(fn) : Argp](#argp_body)
- [Argp#configuration(o) : Argp](#argp_configuration)
- [Argp#description(str) : Argp](#argp_description)
- [Argp#email(str) : Argp](#argp_email)
- [Argp#fail(str[, code]) : undefined](#argp_fail)
- [Argp#options() : Argp](#argp_options)
- [Argp#version(str) : Argp](#argp_version)

__Objects__

- [Body](#body)

<a name="argp_argument"></a>
__Argp#argument(str) : Argp__



<a name="argp_arguments"></a>
__Argp#arguments() : Object__



<a name="argp_argv"></a>
__Argp#argv() : Object__



<a name="argp_body"></a>
__Argp#body(fn) : Argp__



<a name="argp_configuration"></a>
__Argp#configuration(o) : Argp__



<a name="argp_description"></a>
__Argp#description(str) : Argp__



<a name="argp_email"></a>
__Argp#email(str) : Argp__



<a name="argp_fail"></a>
__Argp#fail(str[, code]) : undefined__



<a name="argp_options"></a>
__Argp#options() : Object__



<a name="argp_version"></a>
__Argp#version(str) : Argp__



---

<a name="body"></a>
__Body__

The `Body` instance is returned by [Argp#body()](#argp_body).

__Methods__

- [Body#group(str) : Body](#body_group)
- [Body#option(o) : Body](#body_option)
- [Body#text(str) : Body](#body_text)

<a name="body_group"></a>
__Body#group(str) : Body__



<a name="body_option"></a>
__Body#option(o) : Body__



<a name="body_text"></a>
__Body#text(str) : Body__

