argp
====

#### Command-line option parser ####

[![NPM version](https://badge.fury.io/js/argp.png)](http://badge.fury.io/js/argp "Fury Version Badge")
[![Build Status](https://secure.travis-ci.org/gagle/node-argp.png)](http://travis-ci.org/gagle/node-argp "Travis CI Badge")

[![NPM installation](https://nodei.co/npm/argp.png?mini=true)](https://nodei.co/npm/argp "NodeICO Badge")

Inspired by the extremly well-known [argp C library](http://www.gnu.org/software/libc/manual/html_node/Argp.html), this module parses GNU-style command-line options. Help, usage and version messages are automatically generated and line-wrapped at 80 columns. The module checks for errors, can be easily adapted to your needs thanks to its evented system and it also works when Node.js is in debug mode. The module is uncached and each property is deleted once all the input parameters have been parsed, so there's no memory footprint.

This module it's made for you if you want:

- Robust solution that reads GNU-style options.
- Command configuration.
- Basic error checking.
- Nice help messages without caring about indentation, multilines, etc.
- Zero memory footprint.

A common configuration looks like this:

```javascript
//If you're not going to use multiple parser instances or you don't need to
//reuse a parser, don't cache the module, this will guarantee a zero memory
//footprint
var argv = require ("argp").createParser ({ once: true })
    .description ("Sample app.")
    .email ("a@b.c")
    .body ()
        //The object and argument definitions and the text of the --help message
        //are configured at the same time
        .text (" Arguments:")
        .argument ("arg", { description: "Sample argument" })
        .text ("\n Options:")
        .option ({ short: "o", long: "opt", description: "Sample option" })
        .help ()
        .version ("v1.2.3")
    .argv ();

console.log (argv);

/*
$ node script.js

{
  opt: false,
  help: false,
  version: false,
  arg: false
}

$ node script.js --help

Usage: script [options] [arguments]

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

If you have a `package.json` file you can take from it the description, email and version using the `readPackage()` function. Take into account that this function calls a synchronous `fs` operation. Doesn't really matter because this module is one of the first things you're going to execute in your program.

```javascript
var argv = require ("argp")
    //If no path is provided, it tries to read the "./package.json" file
    .readPackage ("path/to/package.json")
    .body ()
        .text (" Arguments:")
        .argument ("arg", { description: "Sample argument" })
        .text ("\n Options:")
        .option ({ short: "o", long: "opt", description: "Sample option" })
        .help ()
    .argv ();
```

#### Documentation ####

- [What's new in v1?](#new)
- [Quick examples with no configuration](#quick)
- [Configuring options](#options)
- [Configuring arguments](#arguments)
- [Configuring commands](#commands)
- [Real examples](#examples)

#### Functions ####

- [_module_.createParser([options]) : Argp](#createparser)

#### Objects ####

- [Argp](#argp_object)

---

<a name="new"></a>
__What's new in v1?__

Two things will break your code:

- Parser instances are introduced. To create one you need to call to [createParser()](#createparser).
  In most cases you only need to append `.createParser ({ once: true })`, for example:

  ```javascript
  var argv = require ("argp").createParser ({ once: true })
      ...
      argv ();
  ```
  
  The `once` option will uncache the module when [argv()](#argp_argv) is called.

- The second argument from the [end](#event_end) event is removed.
  
  Before:

  ```javascript
  .on ("end", function (argv, fns){
    /*
    fns.printHelp ();
    fns.printUsage ();
    fns.printVersion ();
    fns.fail ();
    */
  })
  ```
  
  After:

  ```javascript
  .on ("end", function (argv){
    /*
    this.printHelp ();
    this.printUsage ();
    this.printVersion ();
    this.fail ();
    */
  })
  ```

---

<a name="quick"></a>
__Quick examples with no configuration__

If an option has not been defined the type of the value is converted automatically from a string to a number, boolean, null or undefined.

By default the parser doesn't allow undefined arguments and options because you typically want to have an absolute control over the calls to your program in order to avoid unexpected behaviours. Allowing undefined arguments and options is as simple as this:

```javascript
var argv = require ("argp").createParser ({ once: true })
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

<a name="options"></a>
__Configuring options__

Example: [options.js](https://github.com/gagle/node-argp/blob/master/examples/options.js).

Considerations:

1. By default the options are flags. If the option requires a value, the `metavar` property must be defined. This property is a string and can be seen when the --help and --usage messages are printed.

  ```bash
  $ node script.js --help
  ...
    o, --opt=STR               Sample option
  ...
  ```
  
  Where `STR` is the `metavar` property.

2. By default, the value of the options is a string. Configure the `type` property if the value is a number, boolean (rarely used, use a flag instead) or array (comma-separated values and multiple assignments).
3. Each option has an id which is used to store the value in the final object. This id is the long name. If the long name has not been defined then the id is the short name.

  ```javascript
  .option ({ short: "a", long: "aa" })
  //{ aa: false }
  .option ({ long: "aa" })
  //{ aa: false }
  .option ({ short: "a" })
  //{ a: false }
  ```
4. Mandatory options (aka `required`) are not implemented because options are _optional_. Use a [command](#commands) if you need mandatory parameters.

Common properties between flags and options with a value:

- __description__ - _String_  
  The description.
- __hidden__ - _Boolean_  
  If true, the option is not displayed in the --help and --usage messages. Default is false.
- __long__ - _String_  
  The long name. Cannot contain white spaces.
- __short__ - _String_  
  The short name. It must be an alphanumeric character.

Flags:

- __negate__ - _Boolean_  
  If true, the flag is negated. The default value is true and it becomes false when the short name or the negated long name (eg. --no-flag) is present.

  ```javascript
  .option ({ short: "a", long: "aaa" })
  .option ({ short: "b", long: "bbb", negate: true })
  ```
  ```bash
  $ node script.js
  { aaa: false, bbb: true }
  
  $ node script.js -a -b
  { aaa: true, bbb: false }
  
  $ node script.js --aaa --bbb
  { aaa: true, bbb: true }
  
  $ node script.js --no-aaa --no-bbb
  { aaa: false, bbb: false }
  ```

Options with a value:

- __aliases__ - _Array_  
  An alias it's a long-name option that points to another option.

  ```javascript
  .body ()
      .option ({ long: "name", aliases: ["foo", "bar"] })
      .help ()
      .usage ()
  ```
  ```bash
  $ node script.js --foo
  { name: true }
  
  $ node script.js --usage
  Usage: script [--name|--foo|--bar] [-h|--help] [--usage]
  
  $ node script.js --help
  Usage: script [options]
  
        --name, --foo, --bar
    -h, --help                  Display this help message and exit
        --usage                 Display a short usage message and exit
  ```
  
  The `options()` function returns an object with all the configured options:
  
  ```javascript
  {
    name: { ... },
    foo: { ... },
    bar: { ... },
    help: { ... },
    usage: { ... }
  }
  ```
  Where `name`, `foo` and `bar` point to the same object:
  
  ```javascript
  .on ("start", function (){
    var options = this.options ();
    assert.ok (options.name === options.foo && options.name === options.bar);
  })
  ```
- __choices__ - _Array_  
  The input value must be one of these choices. If the option is `optional`, the `choices` property is ignored.

  ```javascript
  .option ({ long: "opt", metavar: "NUM", type: Number, choices: [1, 2, 3] })
  ```
  ```bash
  $ node script.js --opt=1
  { opt: 1 }
  
  $ node script.js --opt=7 # Error!
  ```
  
  When `default` and `choices` are defined in the same option the default value doesn't need to match any choice:
  
  ```javascript
  .option ({ long: "opt", metavar: "STR", default: "d", choices: ["a", "b", "c"] })
  ```
  ```bash
  $ node script.js
  { opt: "d" }
  ```
- __default__ - _Object_  
  The default value.

  ```javascript
  .option ({ long: "name", metavar: "STR", default: "bar", optional: true })
  ```
  ```bash
  $ node script.js
  { name: "bar" }
  
  $ node script.js --name
  { name: "bar" }
  
  $ node script.js --name foo
  { name: "foo" }
  ```
- __metavar__ - _String_  
  Must be defined if the option requires a value. If `metavar` is not defined, the option is a flag. The string is used when the --help and --usage messages are printed.

  ```javascript
  .option ({ long: "name", metavar: "STR" })
  ```
  ```bash
  $ node script.js --help
  ...
       --name=STR
  ...
  ```
- __optional__ - _Boolean_  
  If true, the value is optional. Default is false. If the option doesn't receive any value the default value is set and it depends on the `default` and `type` properties.

  Types and default values:
  - String: `null`
  - Number: `0`
  - Array: `[]`
  - Boolean: `false`

  ```javascript
  .option ({ long: "name1", metavar: "STR", optional: true })
  .option ({ long: "name2", metavar: "STR", optional: true, type: String })
  .option ({ long: "name3", metavar: "NUM", optional: true, type: Number })
  .option ({ long: "name4", metavar: "ARR", optional: true, type: Array })
  //Boolean type is rarely used, use a flag instead
  .option ({ long: "name5", metavar: "BOOL", optional: true, type: Boolean })
  ```
  ```bash
  $ node script.js --name1 --name2 --name3 --name4 --name5
  { name1: null, name2: null, name3: 0, name4: [], name5: false }
  ```
  ```bash
  $ node script.js --name1 foo --name2 bar --name3 12 --name4 -12.34,foo,true --name4 false --name5 true
  { name1: "foo", ame2: "bar", name3: 12, name4: [-12.34, "foo", true, false], name5: true }
  ```
- __reviver__ - _Function_  
  The function is executed when the option is parsed. It is similar to the reviver parameter of the `JSON.parse()` function. This is the right place where you can validate the input data and `fail()` if it's not valid. For example, if the option requires a number you can validate the range here.

  ```javascript
  .option ({ long: "name", metavar: "STR", reviver: function (value){
    return value + "bar";
  }})
  ```
  ```bash
  $ node script.js --name foo
  { name: "foobar" }
  ```
  ```javascript
  .option ({ long: "opt", metavar: "NUM", type: Number,
      reviver: function (value){
    //The "value" parameter is already a number
    if (value < 1 || value > 3){
      this.fail ("Option 'opt': Invalid range.");
    }
    return value;
  }})
  ```
- __type__ - _String | Number | Boolean | Array_  
  The type of the value. Default is String.

  If the type is an Array, comma-separated values are automatically stored in an array and each element is converted to the type it represents. Multiple assignments are also supported.

  ```javascript
  .option ({ long: "name", metavar: "ARR", type: Array })
  ```
  ```bash
  $ node script.js --name 1,true,foo
  { name: [1, true, "foo"] }
  
  $ node script.js --name 1 --name true --name foo
  { name: [1, true, "foo"] }
  
  $ node script.js --name 1,2 --name true,false --name foo,bar
  { name: [1, 2, true, false, "foo", "bar"] }
  ```

---

<a name="arguments"></a>
__Configuring arguments__

Example: [arguments.js](https://github.com/gagle/node-argp/blob/master/examples/arguments.js).

An argument is an individual name like `login`, `reset`, `build`, etc. They are basically flags.

Properties:

- __description__ - _String_  
  The description.
- __hidden__ - _Boolean_  
  If true, the option is not displayed in the --help and --usage messages. Default is false.

Note: `synopsis` and `trailing` properties can be also configured but they have meaning only with [commands](#commands).

```javascript
.argument ("arg1")
.argument ("arg2", { description: "foo" })
.argument ("arg3", { description: "bar", hidden: true })
```
```bash
$ node script.js arg1
{ arg1: true, arg2: false, arg3: false }

$ node script.js --help
...
  arg1                        foo
  arg2                        bar
...
```

Note that an argument is just a flag but it can be present without any prefixed hyphen. It is a flag with more weight, it is used to denote important actions.

As you can see, the arguments are also stored in a hash like regular options, undefined arguments inclusive. For example:

```javascript
var argv = require ("argp").createParser ({ once: true })
    .allowUndefinedArguments ()
    .allowUndefinedOptions ()
    .argv ();
    
console.log (argv);
```

```bash
$ node script.js a b c
{ a: true, b: true, c: true }
```

This feature is different from other cli parsers that store the arguments in an array. If you need to read undefined arguments and save them in an array you can use the events. For more details: [to-upper-case.js](https://github.com/gagle/node-argp/blob/master/examples/to-upper-case.js)

---

<a name="commands"></a>
__Configuring commands__

A command is an argument followed by other arguments and options. NPM is an example:

```
npm config set <key> [<value>]
npm install [<package>...] -g
```

`config` is a command and `set` an argument with 2 trailing arguments: minimum 1, maximum 2.  
`install` is a command with infinite trailing arguments: minimum 0, maximum Infinity. `-g` is an option which only applies to the `install` command.

If you have a very few commands you can configure them in the same file ([commands.js](https://github.com/gagle/node-argp/blob/master/examples/commands.js) example), but you typically want to modularize them, one command per file. Then you should check the [npm.js](https://github.com/gagle/node-argp/blob/master/examples/npm/npm.js) example.

The commands are configured exactly the same way as the `Argp` instance with only one difference: `argument()` accepts 2 new properties:

- __synopsis__ - _String_  
  The string replaces the argument name in the --help and --usage messages.

  ```javascript
  .argument ("set", { description: "Sample argument" });
  /*
  ...
      set                         Sample argument
  ...
  */
  
  .argument ("set", { synopsis: "set <key> [<value>]", description: "Sample argument" });
  /*
  ...
      set <key> [<value>]         Sample argument
  ...
  */
  ```
- __trailing__ - _Object_  
  Configures how many trailing arguments must follow this argument.

  There are 3 properties: `eq`, `min` and `max`. `eq` cannot be used with `min` or `max`. If `min` and `max` are used, by default `min` is 0 and `max` is Infinity. A `trailing` object without any of these 3 properties defaults to `min` 0 and `max` Infinity.
  
  Some examples:
  
  - 2 trailing arguments required: `cmd arg <x> <x>`.
  
      ```javascript
      .argument ("arg", { trailing: { eq: 2 } })
      ```
  - 1 required, 1 optional: `cmd arg <x> [<x>]`.
  
      ```javascript
      .argument ("arg", { trailing: { min 1, max: 2 } })
      ```
  - 1 optional: `cmd arg [<x>]`.
  
      ```javascript
      .argument ("arg", { trailing: { max: 1 } })
      ```
  - 1 required, infinite optional: `cmd arg <x> [<x>...]`.
  
      ```javascript
      .argument ("arg", { trailing: { min: 1 } })
      ```
  - Infinite: `cmd arg [<x>...]`.
  
      ```javascript
      .argument ("arg", { trailing: {} })
      //Same as trailing: { min: 0, max: Infinity }
      ```
  - No trailing arguments: `cmd arg`.
  
      ```javascript
      .argument ("arg")
      ```
  - Multiple arguments with trailing in the same line. Argument `arg1` with 1 required, and argument `arg2` with infinite trailing arguments: `cmd arg1 <x> arg2 [<y>...]`. Note that writing `cmd arg1 <x> arg2 [<y>...]` is not the same as `cmd arg2 [<y>...] arg1 <x>`. In the latter case, `arg1 <x>` will be eaten by the trailing arguments of `arg2`.
  
      ```javascript
       .argument ("arg1", { trailing: { eq: 1 } })
       .argument ("arg2", { trailing: {} })
      ```

---

<a name="examples"></a>
__Real examples__

- [brainfuck](https://github.com/gagle/node-brainfuck/blob/master/bin/brainfuck.js): Interpreter for the Brainfuck esoteric language.
- [ntftp](https://github.com/gagle/node-ntftp/blob/master/bin/ntftp.js): Streaming TFTP client and server.

---

<a name="createparser"></a>
___module_.createParser([options]) : Argp__

Returns a new [Argp](#argp_object) instance.

Options:

- __once__ - _Boolean_  
  Set it to true if you want to uncache the whole module when [argv()](#argp_argv) finishes. This will guarantee a zero memory footprint. Default is false.

---

<a name="argp_object"></a>
__Argp__

The module returns an instance of `Argp`. It inherits from an EventEmitter.

The parser follows the GNU-style rules: `-a`, `-abc`, `--a`, `--no-a`, `--a=b`, `--`, etc. Long-option abbreviation is also supported.

If you don't want to configure anything simply require the module, allow undefined arguments and options and call to `argv()`.

```javascript
var argv = require ("argp").createParser ({ once: true })
    .allowUndefinedArguments ()
    .allowUndefinedOptions ()
    .argv ();
```

Note: If no configuration is provided you cannot join a short name with its value in the same token, eg: `-Dvalue`, all the characters following a hyhen are interpreted as individual flags.

__Events__

With the event system you can fully adapt this module to yours needs. Examples: [to-upper-case.js](https://github.com/gagle/node-argp/blob/master/examples/to-upper-case.js), [mkdir.js](https://github.com/gagle/node-argp/blob/master/examples/mkdir.js).

- [argument](#event_argument)
- [end](#event_end)
- [error](#event_error)
- [option](#event_option)
- [start](#event_start)

__Methods__

- [Argp#allowUndefinedArguments() : Argp](#argp_allowundefinedarguments)
- [Argp#allowUndefinedOptions() : Argp](#argp_allowundefinedoptions)
- [Argp#arguments() : Object](#argp_arguments)
- [Argp#argv([input]) : Object](#argp_argv)
- [Argp#body() : Body](#argp_body)
- [Argp#columns(columns) : Argp](#argp_columns)
- [Argp#command(name[, configuration]) : Command](#argp_command)
- [Argp#commands() : Argp](#argp_commands)
- [Argp#description(str) : Argp](#argp_description)
- [Argp#email(str) : Argp](#argp_email)
- [Argp#exitStatus(code) : Argp](#argp_exitstatus)
- [Argp#fail(str[, code]) : undefined](#argp_fail)
- [Argp#main() : Argp](#argp_main)
- [Argp#options([filter]) : Object](#argp_options)
- [Argp#printHelp([code]) : undefined](#argp_printhelp)
- [Argp#printUsage([code]) : undefined](#argp_printusage)
- [Argp#printVersion([code]) : undefined](#argp_printversion)
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
  The name of the argument.
- __ignore__ - _Function_  
  When the function is called the parser ignores the argument, hence it isn't stored in the final object.

<a name="event_end"></a>
__end__

Emitted when all the options and arguments have been parsed.

Parameters:

- __argv__ - _Object_  
  The final object.

<a name="event_error"></a>
__error__

Emitted when an error occurs. If you don't listen for `error` events, the message will be printed to stderr and the process will exit. If you attach an error handler and an error occurs, [argv()](#argp_argv) returns null.

You typically want to listen for `error` events when you need to do something with the error and then quit the process, or simply because you want to continue executing the process (maybe because you are executing a shell prompt) and display the error in the console.

```javascript
.on ("error", function (error){
  doSomethingWith (error);
  //This will end the process
  this.fail (error);
})
```

For example, the [ntftp](https://github.com/gagle/node-ntftp/blob/master/bin/ntftp.js) module uses two parsers. One is the main parser. If something is not correct, it prints the error to stderr and finishes. The second parser is used when the program is executing a shell prompt. It is being reused and the errors are simply printed to console.

<a name="event_option"></a>
__option__

Emitted when an option is found.

Parameters:

- __argv__ - _Object_  
  The final object.
- __option__ - _String_  
  The name of the option.
- __value__ - _String_  
  The value of the option after calling the reviver, if any.
- __long__ - _Boolean_  
  True if the option is a long name, otherwise false.
- __ignore__ - _Function_  
  When the function is called the parser ignores the argument, hence it isn't stored in the final object.

<a name="event_start"></a>
__start__

Emitted just before the parser begins to read the cli parameters.

Parameters:

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
__Argp#argv([input]) : Object | null__

Parses the `process.argv` array or the given input array.

If you don't need to reuse the parser and want a zero memory footprint, you shouldn't cache the module and the parser instance. Remember to also set `once` to true.

```javascript
var argv = require ("argp").createParser ({ once: true })
    ...
    argv ();
```

If you need to reuse a parser, you probably want to listen for [error](#event_error) events. If an error occurs, [argv()](#arg_argv) returns null.

```javascript
var argp = require ("argp");

//Configuration
var parser = argp.createParser ()
    .on ("error", ...)
    ...;

var argv;
argv = parser.argv (["-a", "--b", ...]);
argv = parser.argv (["c", "d", ...]);
```

If you pass an input array, then the functions [printHelp()](#argp_printhelp), [printUsage()](#argp_printusage) and [printVersion()](#argp_printversion) will print the message but won't terminate the process.

<a name="argp_body"></a>
__Argp#body() : Argp__

Returns a `Body` instance.

<a name="argp_columns"></a>
__Argp#columns(columns) : Argp__

Sets the maximum line length. By default lines are wrapped at 80 columns.

<a name="argp_command"></a>
__Argp#command(name[, configuration]) : Command__

Configures a command. A command it's like a new fresh cli program. It behaves exactly like an `Argp`. See [Configuring commands](#commands).

<a name="argp_commands"></a>
__Argp#commands() : Object__

Returns the configured commands.

Look at the [internal-data.js](https://github.com/gagle/node-argp/blob/master/examples/internal-data.js) example for further details.

<a name="argp_description"></a>
__Argp#description(str) : Argp__

Sets a description. The description is printed at the start of the --help message, after the "Usage" lines.

<a name="argp_email"></a>
__Argp#email(str) : Argp__

Sets a contact email. The email is printed at the end of the --help message.

<a name="argp_exitstatus"></a>
__Argp#exitStatus(code) : Argp__

Sets the exit code that will be used is some methods. Default is 1.

<a name="argp_fail"></a>
__Argp#fail(str[, code]) : undefined__

Prints a message to the stderr and exits with the given code number or if not given, uses the code configured with [exitStatus()](#argp_exitstatus) or if not configured, exits with code 1.

<a name="argp_main"></a>
__Argp#main() : Argp__

Returns de main `Argp` instance. It's a no-op function, just for a better visual organization when configuring commands.

Look at the [npm.js](https://github.com/gagle/node-argp/blob/master/examples/npm/npm.js) example for further details.

<a name="argp_options"></a>
__Argp#options([filter]) : Object__

Returns the configured options. `filter` is an object which can be used to return the options that have a short name or a long name.

```javascript
.options ()
.options ({ short: true })
.options ({ long: true })
```

Look at the [internal-data.js](https://github.com/gagle/node-argp/blob/master/examples/internal-data.js) example for further details.

<a name="argp_printhelp"></a>
__Argp#printHelp([code]) : undefined__

Prints the help message and exits with the given code number or if not given, uses the code configured with [exitStatus()](#argp_exitstatus) or if not configured, exits with code 0.

If [argv()](#argp_argv) is called with an input array, the process doesn't exit.

<a name="argp_printusage"></a>
__Argp#printUsage([code]) : undefined__

Prints the usage message and exits with the given code number or if not given, uses the code configured with [exitStatus()](#argp_exitstatus) or if not configured, exits with code 0.

If [argv()](#argp_argv) is called with an input array, the process doesn't exit.

<a name="argp_printversion"></a>
__Argp#printVersion([code]) : undefined__

Prints the version message (if it was configured) and exits with the given code number or if not given, uses the code configured with [exitStatus()](#argp_exitstatus) or if not configured, exits with code 0.

If [argv()](#argp_argv) is called with an input array, the process doesn't exit.

<a name="argp_readpackage"></a>
__Argp#readPackage([path][, options]) : Argp__

Reads a `package.json` file and configures the parser with the description, email and version. If no path is provided it tries to read the `./package.json` path. The description, email and version labels can be ignored individually with the `options` parameter. For example, if you only want to ignore the email and read the description and version:

```javascript
.readPackage ("path/to/package.json", { email: false })
```

Options are: `description`, `version`, `email`. By default they are true. Set them to false to ignore them.

<a name="argp_usages"></a>
__Argp#usages(usages) : Argp__

Changes the "Usage" line from the --help and --usage messages. `usages` is an array of strings.

Look at the [custom-usages.js](https://github.com/gagle/node-argp/blob/master/examples/custom-usages.js) example for further details.

<a name="argp_sort"></a>
__Argp#sort() : Argp__

If `sort()` is enabled, the options are parsed before the arguments, if not, the options and arguments are parsed in the same order they come.

---

<a name="body"></a>
__Body__

The `Body` instance is returned by calling [Argp#body()](#argp_body). All the following functions (except `argv()`, `command()` and `main()`) print a message in the same order they are configured, this allows you to fully customize the --help message very easily.

Look at [fully-descriptive-help.js](https://github.com/gagle/node-argp/blob/master/examples/fully-descriptive-help.js) for further details.

__Methods__

- [Body#argument(name[, configuration]) : Body](#body_argument)
- [Body#argv([input]) : Object](#body_argv)
- [Body#columns(column1, column2) : Body](#body_columns)
- [Body#command(name[, configuration]) : Command](#body_command)
- [Body#help([options]) : Body](#body_help)
- [Body#main() : Argp](#body_main)
- [Body#option(o) : Body](#body_option)
- [Body#text(str[, prefix]) : Body](#body_text)
- [Body#usage() : Body](#body_usage)
- [Body#version(str[, options]) : Body](#body_version)

<a name="body_argument"></a>
__Body#argument(name[, configuration]) : Body__

Defines an argument. See [Configuring arguments](#arguments).

<a name="body_argv"></a>
__Body#argv([input]) : Object__

Same as [Argp#argv()](#argp_argv).

<a name="body_columns"></a>
__Body#columns(column1, column2) : Body__

Prints a line with 2 columns. The first column shouldn't contain line breaks (`\n`). This functionality is used to print the options and arguments.

<a name="body_command"></a>
__Body#command(name[, configuration]) : Command__

Same as [Argp#command()](#argp_command).

<a name="body_help"></a>
__Body#help([options]) : Body__

Enables the `-h, --help` option. The short option can be disabled using the `options` parameter.

```javascript
.help ({ short: false })
```
```bash
$ node script.js --help
...
      --help                  Display this help message and exit
...
```

<a name="body_main"></a>
__Body#main() : Argp__

Same as [Argp#main()](#argp_main).

<a name="body_option"></a>
__Body#option(o) : Body__

Defines an option. See [Configuring options](#options).

<a name="body_text"></a>
__Body#text(str[, prefix]) : Body__

Prints a text message. By default it's line-wrapped at 80 columns and supports multilines (line breaks, `\n`). The `prefix` is a string that is printed before each line. It's mainly used to indent the text with some spaces.

<a name="body_usage"></a>
__Body#usage() : Body__

Enables the `--usage` option.

<a name="body_version"></a>
__Body#version(str[, options]) : Body__

Enables the `-v, --version` option. `str` is the text to print when the option is called. The short option can be disabled using the `options` parameter.

```javascript
.version ("v1.2.3", { short: false })
```
```bash
$ node script.js --help
...
      --version               Output version information and exit
...
```