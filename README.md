argp
====

_Node.js project_

#### Command-line option parser ####

Version: 0.0.5

Inspired by the extremly well-known [argp C library](http://www.gnu.org/software/libc/manual/html_node/Argp.html), this module parses GNU-style command-line arguments. Help, usage and version messages are automatically generated, line-wrapped at 80 columns and fully customizable. The modules checks for errors and can be easily adapted to your needs. You don't even need to configure anything, the options will be parsed following the GNU rules:

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
			//"long" is a boolean; true if the option found is a long name,
			//false if the option found is a short name
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
		//Display a footer after the options and before the email
		.footer ("Random footer")
		//Display a contact email at the end of the help message
		.email ("a@b.c")
		//Configure some arguments
		.argument ("arg1")
		.argument ("arg2")
		//Configure the body part: options, groups and text
		.body (function (body){
			//The configuration has an insertion order
			body
					//Display a text line
					.text ("Random text")
					//Display a group line
					.group ("Group 1")
					//After a group line you typically want to display some options
					.option ({ short: "a", long: "aa", description: "aaa" })
					.option ({ short: "b", long: "bb", type: Number, description: "bbb" })
					//This group line will be displayed before --help, --usage and
					//--version
					.group ("Group 2");
					
		})
		//Parse the options
		.argv ();
```

---

<a name="quick"></a>
__Quick examples with no configuration__

If the option is undefined, the type of the value is converted automatically from a string to a number, boolean, null or undefined.

- `node script.js -a -b -c`  
  `{ a: true, b: true, c: true }`
- `node script.js a b c`  
  `{ a: true, b: true, c: true }`
- `node script.js -abc d`  
  `{ a: true, b: true, c: "d" }`
- `node script.js --a --b 1 --d=e`  
  `{ a: true, b: 1, d: "e" }`
- `node script.js --no-a b`  
  `{ a: false, b: true }`
- `node script.js --a -- -b --c d`  
  `{ a: true, "-b": true, "--c": true, d: true }`

---

<a name="options"></a>
__Configuring options__

They are configured using the `Argp#body()` and `Body#option()` functions. The order of configuration is important, they will be listed in the --help and --usage messages in the same order they are configured.

Some important things you must know:

1. Every option has an id. This id is used to store the option in the final object. It can be the short or the long name. The long name is prioritary over the short name, so if you configure an option with a short and long names, the long name will be used as the id.
2. There are 2 types of entities: options and arguments. An option starts with `-` or `--` and an argument is a simple string. For example, `node script.js deploy --port 1337`, where `deploy` is an argument and `--port` is an option with value `1337`.
3. There are 2 types of options: a flag and an option with a value. If the option requires a value the `argument` property must be defined. This property is a string and can be seen when the --help message is printed. For example, `--a[=NUM]`, where `NUM` is the argument property: `option({ short: "o", argument: "NUM" })`.
4. By default, the options are strings. Configure the `type` property if the value is a number, boolean or array.

Common properties:

- __description__ - _String_  
  The description.
- __hidden__ - _Boolean_  
  If true, the option is not displayed in the --help and --usage messages. Default is false.
- __long__ - _String_  
  The long name, eg: `--name`.
- __short__ - _String_  
  The short name, eg: `-a`.

Flag:

- __negate__ - _Boolean_  
  If true, the flag is negated. Its default value is true and when set becomes false. Cannot negate a flag with a short, only the long name must be configured.

	```javascript
	body.option ({ long: "name", negate: true });
	
	/*
	$ node script.js
	{ a: true }
	
	$ node script.js --no-name
	{ a: false }
	*/
	```

Options with value:

- __argument__ - _String_  
  Must be configured if the option requires a value. The string is used when the --help message is printed.

	```javascript
	body.option ({ long: "name", argument: "STR" });
	
	/*
	$ node script.js --help
	...
	      --name=STR
	...
	*/
	```
- __optional__ - _Boolean_  
  If true, the value is optional. Default is false. If the option doesn't receive any value a default value is set and it depends on the `value` and `type` properties.

	```javascript
	body.option ({ long: "name", argument: "STR", optional: true });
	
	/*
	$ node script.js --name
	//Null because all the options are strings by default, and the default value of a string is null
	{ name: null }
	*/
	```
- __reviver__ - _Function_  
  
- __type__ - _String | Number | Boolean | Array_  
  
- __value__ - _Object_  
  

Look at and play with the [options.js](https://github.com/gagle/node-argp/blob/master/examples/options.js) example to see how the things are parsed.

---

<a name="argp_object"></a>
__Argp__

The module returns an instance of `Argp`. It inherits from an EventEmitter.

The parser follows the GNU-style rules: `-a`, `-abc`, `--a`, `--no-a`, `--a=b`, etc.

If you don't want to configure anything simply require the module and call to `argv()`.


```javascript
var argv = require ("argp").argv ();
```

Note: If no configuration is provided you cannot join a short name with its value in the same token, eg: `-Dvalue`, all the characters following a dash, `-`, are interpreted as individual flags.

The `argv()` function returns an object. It is cached, so you can require and call the function from any module at any time. All the internal stuff that is used to parse the options is freed, only the object that is returned remains in memory, so this module has a very low memory footprint.

The object that `argv()` returns has two special properties: `_debug` and `_filename`. `_debug` is a boolean and it's true if the Node.js process has been started in debug mode, otherwise false (debug mode: node debug \<script\>). `_filename` is the absolute path of the main script.

If you are using this module it's because you want a fully customizable help message, so you should always enable it. The usage message is not really useful, you can ignore it if you prefer.

All the text messages can be split up in multiple lines using `\n`. They will be indented according to the functionality of the caller function.

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

- Set the description, version, footer and email. If you make use of the `package.json` file you can take the information from there. If you set the version the __-v, --version__ option will be enabled. The description is displayed at the top of the help message and the email at the bottom.

	```javascript
	argp.description ("Random description.");
	argp.version ("v1.2.3");
	argp.footer ("Random footer.");
	argp.email ("a@b.c");
	```

- If your program requires arguments like `build`, `install`, etc. add them, but they will be only displayed in the usage message. They are initialized to false and can be retrieved with the `arguments()` function. Not very useful if you allow undefined arguments.

	```javascript
	argp.argument ("build");
	argp.argument ("install");
	```

- Finally, configure the options with the `body()` function. The options, groups and text are displayed in the same order they are configured, this allows you to fully customize the help message.

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
	See how you can configure the options [here](#options).
	
- You can also listen to some events: `start`, `end`, `option` and `argument`. They are pretty useful and allows you to fully adapt this module to your needs.

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
	
	script.js: Option '-o' requires an argument.
	Try 'script.js --help' for more information.
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
	
	Usage: script.js [OPTIONS] [ARGUMENTS]

	Random description.
	
	 Random group:
	  -o, --outfile=PATH          Destination PATH of the file
	      --strict                Enable strict parse mode
	
	Random text.
	
	 Informational options:
	  -h, --help                  Display this help message and exit
	  -v, --version               Output version information and exit
	
	Random footer.
	
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
- [Argp#footer(str) : Argp](#argp_footer)
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



<a name="argp_footer"></a>
__Argp#footer(str) : Argp__



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

