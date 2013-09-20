argp
====

_Node.js project_

#### Command-line option parser ####

Version: 0.0.9

Inspired by the extremly well-known [argp C library](http://www.gnu.org/software/libc/manual/html_node/Argp.html), this module parses GNU-style command-line options. Help, usage and version messages are automatically generated and line-wrapped at 80 columns. The module checks for errors, can be easily adapted to your needs thanks to its evented system and also works when Node.js is in debug mode. The module is uncached and nulled once all the data has been parsed, so there's no memory footprint.

This module it's made for you if you want:

- A robust solution that reads GNU-style parameters.
- Basic error checking.
- Nice help messages without caring about indentation, multilines, etc.
- Zero memory footprint.

A common configuration looks like this:

```javascript
var argv = require ("argp")
    .description ("Sample app.")
    .email ("a@b.c")
    .body ()
        //The object an argument definition and the text of the help message are
        //configured at the same time
        .group ("Arguments")
        .argument ("arg", { description: "Sample argument" })
        .group ("Options")
        .option ({ short: "o", long: "opt", description: "Sample option" })
        .help ()
        .version ("v1.2.3")
        .end ()
    .argv ();

console.log (argv);

/*
$ node script.js

{
  _debug: false,
  _filename: __filename,
  opt: false,
  help: false,
  version: false,
  arg: false
}

$ node script.js --help

Usage: t.js [OPTIONS] [ARGUMENTS]

Sample app.

 Arguments:
  arg                         Sample argument

 Options:
  -o, --opt                   Sample option
  -h, --help                  Display this help message and exit
  -v, --version               Output version information and exit

Report bugs to <a@b.c>.
*/
```

If you have a `package.json` file you can take from it the description, email and version using the `readPackage()` function. Take into account that this function calls a synchronous `fs` operation. Doesn't really matter because this module is the first thing you're going to execute.

```javascript
var argv = require ("argp")
    //If no path is provided, it tries to read the "./package.json" file
    .readPackage ("path/to/package.json")
    .body ()
        .group ("Arguments")
        .argument ("arg", { description: "Sample argument" })
        .group ("Options")
        .option ({ short: "o", long: "opt", description: "Sample option" })
        .help ()
        .end ()
    .argv ();
```

#### Installation ####

```
npm install argp
```

#### Documentation ####

- [Quick examples with no configuration](#quick)
- [Configuring arguments](#arguments)
- [Configuring options](#options)
- [Full example explained](#full)

#### Objects ####

- [Argp](#argp_object)

---

<a name="quick"></a>
__Quick examples with no configuration__

If an option has not been defined the type of the value is converted automatically from a string to a number, boolean, null or undefined.

By default the parser doesn't allow undefined arguments and options because you typically want to have an absolute control over the calls to your program in order to avoid unexpected behaviours. Allowing undefined arguments and options is as simple as this:

```javascript
var argv = require ("argv")
    .allowUndefinedArguments ()
    .allowUndefinedOptions ()
    .argv ();
```

```bash
$ node script.js -a -b -c
{ a: true, b: true, c: true }

$ node script.js a b c
{ a: true, b: true, c: true }

$ node script.js -abc null
{ a: true, b: true, c: null }

$ node script.js --a --b 1 --d=e
{ a: true, b: 1, d: "e" }

$ node script.js --no-a b
{ a: false, b: true }

$ node script.js --a -- -b --c d
{ a: true, "-b": true, "--c": true, d: true }
```

---

<a name="arguments"></a>
__Configuring arguments__

Properties:

- __description__ - _String_  
  The description.
- __hidden__ - _Boolean_  
  If true, the option is not displayed in the --help and --usage messages. Default is false.

```javascript
.argument ("arg1")
.argument ("arg2", { description: "..." })
.argument ("arg3", { description: "...", hidden: true })
```
```bash
$ node script.js arg1
{ arg1: true, arg2: false, arg3: false }
```

Example: [options.js](https://github.com/gagle/node-argp/blob/master/examples/options.js).

---

<a name="options"></a>
__Configuring options__

Considerations:

1. By default the options are flags. If the option requires a value, the `argument` property must be defined. This property is a string and can be seen when the --help message is printed. For example,

	```bash
	$ node script.js --help
	...
	  o, --opt=STR               Sample option
	...
	```
  
  Where `STR` is the `argument` property.

2. By default, the value of the options is a string. Configure the `type` property if the value is a number, boolean or array (comma-separated values).
3. Each option has an id which is used to store the value into the final object. This id is the long name. If the long name has not been configured then the id is the short name.

	```javascript
	.option ({ short: "a", long: "aa" })
	//{ aa: false }
	.option ({ long: "aa" })
	//{ aa: false }
	.option ({ short: "a" })
	//{ a: false }
	```

Common properties between flags and options with value:

- __description__ - _String_  
  The description.
- __hidden__ - _Boolean_  
  If true, the option is not displayed in the --help and --usage messages. Default is false.
- __long__ - _String_  
  The long name, eg: `--name`. Cannot contain white spaces.
- __short__ - _String_  
  The short name, eg: `-a`. It must be an alphanumeric character.

Flags:

- __negate__ - _Boolean_  
  If true, the flag is negated. The default value is true. Cannot negate a flag with a short name, only the long name can be configured.

	```javascript
	.option ({ short: "n", long: "name", negate: true }) //Error!
	.option ({ long: "name", negate: true })
	```
	```bash
	$ node script.js
	{ a: true }
	
	$ node script.js --no-name
	{ a: false }
	```

Options with value:

- __argument__ - _String_  
  Must be configured if the option requires a value. The string is used when the --help message is printed.

	```javascript
	.option ({ long: "name", argument: "STR" })
	```
	```bash
	$ node script.js --help
	...
       --name=STR
  ...
	```
- __optional__ - _Boolean_  
  If true, the value is optional. Default is false. If the option doesn't receive any value the default value is set and it depends on the `value` and `type` properties.

	```javascript
	.option ({ long: "name1", argument: "STR", optional: true })
	.option ({ long: "name2", argument: "NUM", optional: true, type: Number })
	.option ({ long: "name3", argument: "ARR", optional: true, type: Array })
	//Boolean type is rarely used, use a flag instead
	.option ({ long: "name4", argument: "BOOL", optional: true, type: Boolean })
	```
	```bash
	$ node script.js --name1 --name2 --name3
	# "name1" is null because all the options are strings by default, and the default value of a string is null
	# "name2" is 0 because the default value of a number is 0
	# "name3" is [] because the default value of an array is []
	# "name4" is false because the default value of a boolean is false
	{ name1: null, name2: 0, name3: [], name4: false }
	```
	```bash
	$ node script.js --name1 foo --name2 12 --name3 -12.34,foo,true --name4 true
	{ name1: "foo", name2: 12, name3: [-12.34, "foo", true], name4: true }
	```
- __reviver__ - _Function_  
  The function is executed when the option is parsed. It is similar to the reviver of the `JSON.parse()` function. This is the right place where you can validate the input data and `fail()` if is not valid. For example, if the option requires a number you can validate the range here.

	```javascript
	.option ({ long: "name", argument: "STR", reviver: function (value){
	  return value + "bar";
	}})
	```
	```bash
	$ node script.js --name foo
	{ name: "foobar" }
	```
	```javascript
	//The reviver is used to validate the range of the number
	.option ({ long: "name", argument: "STR", type: Number,
	    reviver: function (value){
    //"value" is already a number
    if (value < 1 || value > 3){
      argp.fail ("Option 'name': invalid range");
    }
    return value;
	}})
	```
	```javascript
	//The reviver can be also used to allow only a few string values, a.k.a. choices.
	.option ({ long: "name", argument: "STR", reviver: function (value){
    if (value !== "a" && value !== "b" && value !== "c"){
      argp.fail ("Option 'name': invalid choice");
    }
    return value;
	}})
	```
- __type__ - _String | Number | Boolean | Array_  
  The type of the value. Default is a String. If the type is an Array, comma-separated values are automatically stored into an array and each element is converted to the type it represents.

	```javascript
	.option ({ long: "name", argument: "STR", type: Array })
	```
	```bash
	$ node script.js --name 1,true,foo
	{ name: [1, true, "foo"] }
	```
  
- __value__ - _Object_  
  The default value.

	```javascript
	.option ({ long: "name", argument: "STR", value: "bar", optional: true })
	```
	```bash
	$ node script.js
	{ name: "bar" }
	
	$ node script.js --name
	{ name: "bar" }
	
	$ node script.js --name foo
	{ name: "foo" }
	```

Example: [options.js](https://github.com/gagle/node-argp/blob/master/examples/options.js).

---

<a name="full"></a>
__Full example explained__

```javascript
/*
Avoid storing the module in a variable because when the parser finishes it
is removed from the cache. If you store a reference remember to unreference it
if you want a zero memory footprint.

var argp = require ("argp")
var argv = ...
argp = null;
*/

var argv = require ("./lib")
    //The evented system allows you to fully adapt the module to your needs
    //The "start" and "end" events are useful when you need to initialize or
    //clean up things
    .on ("start", function (argv){
      //Emitted after the default values of the configured options and arguments
			//have been set and before starting the read.
			
			//"argv" is the final object
    })
    .on ("argument", function (argv, argument, ignore){
      //Emitted when an argument is found
			
			//"argv" is the final object
			//"argument" is the argument found
			//"ignore" is a function that when called ignores the argument, hence it
			//it isn't stored in the final object
    })
    .on ("option", function (argv, option, value, long, ignore){
      //Emitted when an option is found
			
			//"argv" is the final object
			//"option" is the name of the option found
			//"value" is the value of the option after calling the reviver, if any
			//"long" is a boolean; true if the option is a long name, otherwise false
			//"ignore" is a function that when called ignores the argument, hence it
			//it isn't stored in the final object
    })
    .on ("end", function (argv){
      //Emitted when all the options and arguments have been read
			
			//"argv" is the final object
    })
    //Wrap lines at 100 columns, default is 80
    .columns (100)
    //If "sort" is enabled, the options are parsed before the arguments, if not,
    //the options and arguments are parsed in the same order they come
    .sort ()
    //Allow undefined arguments
    .allowUndefinedArguments ()
    //Allow undefined options
    .allowUndefinedOptions ()
    //The [ARGUMENTS] part of the "usage" line in the --help and --usage messages can be changed
    //See "custom-usages.js" example
    .usages ([
      "foo",
      "bar"
    ])
    //Print a description at the top of the help message
    .description ("Sample app.")
    //Print a contact email at the end of the help message
    .email ("a@b.c")
    //Configure the body
    .body ()
        //The object an argument definition and the text of the help message are
        //configured at the same time
        //The order of the configuration is important
        
        //Print a paragraph
        .paragraph ("Random paragraph")
			  //Print a line
        .line ("Random line")
        //Print a group line
        .group ("Group 1")
        //After a group line you typically want to print some options or
        //arguments
        .argument ("arg1", { description: "aaa" })
        .argument ("arg2")
        .group ("Group 2")
        .option ({ short: "a", long: "aa", description: "aaa" })
        .option ({ short: "b", long: "bb", type: Number, description: "bbb" })
        .group ("Group 2")
        //Enable the -h, --help option
        .help ()
        //Enable the --usage option
        .usage ()
        //Enable the -v, --version option
        .version ("v1.2.3")
        //Explicit ending
        .end ()
    //Parse the options
    .argv ();
```

---

<a name="argp_object"></a>
__Argp__

The module returns an instance of `Argp`. It inherits from an EventEmitter.

The parser follows the GNU-style rules: `-a`, `-abc`, `--a`, `--no-a`, `--a=b`, etc.

If you don't want to configure anything simply require the module, allow undefined arguments and options and call to `argv()`.

```javascript
var argv = require ("argv")
    .allowUndefinedArguments ()
    .allowUndefinedOptions ()
    .argv ();
```

Note: If no configuration is provided you cannot join a short name with its value in the same token, eg: `-Dvalue`, all the characters following a dash, `-`, are interpreted as individual flags.

The object that `argv()` returns has 2 special properties: `_debug` and `_filename`. `_debug` is a boolean and it's true if the Node.js process has been started in debug mode, otherwise false (debug mode: `$ node debug <script>`). `_filename` is the absolute path of the main script.

__Events__

With the event system you can fully adapt this module to yours needs. For example, you can create [aliases.js](https://github.com/gagle/node-argp/blob/master/examples/aliases.js), read phases without being surrounded with `"` ([to-upper-case.js](https://github.com/gagle/node-argp/blob/master/examples/to-upper-case.js)), do complex things ([mimic npm](https://github.com/gagle/node-argp/blob/master/examples/npm.js)), etc. Look at the [events.js](https://github.com/gagle/node-argp/blob/master/examples/events.js) example for further details.

- [argument](#event_argument)
- [end](#event_end)
- [option](#event_option)
- [start](#event_start)

__Methods__

- [Argp#allowUndefinedArguments() : Argp](#argp_allowundefinedarguments)
- [Argp#allowUndefinedOptions() : Argp](#argp_allowundefinedoptions)
- [Argp#arguments() : Object](#argp_arguments)
- [Argp#argv() : Object](#argp_argv)
- [Argp#body() : Body](#argp_body)
- [Argp#columns(columns) : Argp](#argp_columns)
- [Argp#description(str) : Argp](#argp_description)
- [Argp#email(str) : Argp](#argp_email)
- [Argp#fail(str[, code]) : undefined](#argp_fail)
- [Argp#options([filter]) : Object](#argp_options)
- [Argp#readPackage([path]) : Argp](#argp_readpackage)
- [Argp#sort() : Argp](#argp_sort)
- [Argp#usages(usages) : Argp](#argp_usage)

__Objects__

- [Body](#body)

---

<a name="event_argument"></a>
__argument__

Emitted when an argument is found.

Parameters:

- __argv__ - _Object_  
  The final object.
- __argument__ - _String_  
  The name of the argument found.
- __ignore__ - _Function_  
  When the function is called the parser ignores the argument, hence it isn't stored in the final object.

<a name="event_end"></a>
__end__

Emitted when all the options and arguments have been parsed.

- __argv__ - _Object_  
  The final object.

<a name="event_option"></a>
__option__

Emitted when an option is found.

- __argv__ - _Object_  
  The final object.
- __option__ - _String_  
  The name of the option found.
- __value__ - _String_  
  The value of the option after calling the reviver, if any.
- __long__ - _Boolean_  
  True if the option is a long name, otherwise false.
- __ignore__ - _Function_  
  When the function is called the parser ignores the argument, hence it isn't stored in the final object.

<a name="event_start"></a>
__start__

Emitted just before the parser begins to read the input data.

- __argv__ - _Object_  
  The final object. The default values are already set.

---

<a name="argp_allowundefinedarguments"></a>
__Argp#allowUndefinedArguments() : Argp__

Allows undefined arguments.

<a name="argp_allowundefinedOptions"></a>
__Argp#allowUndefinedOptions() : Argp__

Allows undefined options.

<a name="argp_arguments"></a>
__Argp#arguments() : Object__

Returns the configured arguments. Look at the [internal-data.js](https://github.com/gagle/node-argp/blob/master/examples/internal-data.js) example for further details.

<a name="argp_argv"></a>
__Argp#argv() : Object__

Parses the `process.argv` array. It uncaches and nulls the module after parsing the input data.

<a name="argp_body"></a>
__Argp#body() : Argp__

Returns a `Body` instance.

<a name="argp_columns"></a>
__Argp#columns(columns) : Argp__

Sets a maximum line length. By default lines are wrapped at 80 columns.

<a name="argp_description"></a>
__Argp#description(str) : Argp__

Sets a description. The description is printed at the start of the --help message, after the usage lines.

<a name="argp_email"></a>
__Argp#email(str) : Argp__

Sets a contact email. The email is printed at the end of the --help message.

<a name="argp_fail"></a>
__Argp#fail(str[, code]) : undefined__

Prints a message to the stderr and exists the program. By default it exists with code 1.

<a name="argp_options"></a>
__Argp#options([filter]) : Object__

Returns the configured options. `filter` is an object which can be used to return the options with a short name or with a long name.

```javascript
.options ()
.options ({ short: true })
.options ({ long: true })
```

Look at the [internal-data.js](https://github.com/gagle/node-argp/blob/master/examples/internal-data.js) example for further details.

<a name="argp_readpackage"></a>
__Argp#readPackage([path]) : Argp__

Reads a `package.json` file and configures the parser with the description, email and version. If no path is provided it uses the `./package.json` path. It's an `fs` synchronous operation.

<a name="argp_usages"></a>
__Argp#usages(usages) : Argp__

Changes the "usage" line from the --help and --usage messages. `usages` is an array of strings.

Look at the [custom-usages.js](https://github.com/gagle/node-argp/blob/master/examples/custom-usages.js) example for further details.

<a name="argp_sort"></a>
__Argp#sort() : Argp__

If `sort()` is enabled, the options are parsed before the arguments, if not, the options and arguments are parsed in the same order they come.

---

<a name="body"></a>
__Body__

The `Body` instance is returned by [Argp#body()](#argp_body). All the following functions print a message in the same order they are configured, this allows you to fully customize the --help message very easily.

The difference among `group()`, `line()` and `paragraph()` are:

- `group()` is mainly used to introduce a list of things like arguments or options. The line has an indentation of 1 space and ends with `:`. A group line always starts in a new paragraph.
- `line()` prints text in a new line (the text is prefixed with `\n`).
- `paragraph()` prints text in a new paragraph (the text is prefixed with `\n\n`).

All the text messages can be split up in multiple lines using `\n` or `\r\n`. They will be indented according to the functionality of the caller function.

Look at [fully-descriptive-help.js](https://github.com/gagle/node-argp/blob/master/examples/fully-descriptive-help.js) for further details.

__Methods__

- [Body#argument(name[, configuration]) : Body](#body_argument)
- [Body#columns(column1, column2) : Body](#body_columns)
- [Body#end() : Argp](#body_end)
- [Body#group(str) : Body](#body_group)
- [Body#help() : Body](#body_help)
- [Body#line(str[, prefix]) : Body](#body_line)
- [Body#option(o) : Body](#body_option)
- [Body#paragraph(str[, prefix]) : Body](#body_paragraph)
- [Body#usage() : Body](#body_usage)
- [Body#version(str) : Body](#body_version)

<a name="body_argument"></a>
__Body#argument(name[, configuration]) : Body__

Defines an argument. See [Configuring arguments](#arguments).

<a name="body_columns"></a>
__Body#columns(column1, column2) : Body__

Prints a line with 2 columns. This functionality is used to print the options and arguments.

<a name="body_end"></a>
__Body#end() : Argp__

Returns the `Argp` instance. Use it to explicitly end the body configuration.

<a name="body_group"></a>
__Body#group(str) : Body__

Prints a group line.

<a name="body_help"></a>
__Body#help() : Body__

Enables the `-h, --help` option.

<a name="body_line"></a>
__Body#line(str[, prefix]) : Body__

Prints a line. The `prefix` is mainly used to indent the line with some spaces.

<a name="body_option"></a>
__Body#option(o) : Body__

Defines an option. See [Configuring options](#options).

<a name="body_paragraph"></a>
__Body#paragraph(str[, prefix]) : Body__

Prints a paragraph. The `prefix` is mainly used to indent the paragraph with some spaces.

<a name="body_usage"></a>
__Body#usage() : Body__

Enables the `--usage` option.

<a name="body_version"></a>
__Body#version(str) : Body__

Enables the `-v, --version` option. `str` is the text to print when the option is called.