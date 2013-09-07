"use strict";

var events = require ("events");
var util = require ("util");
var path = require ("path");
var wrap = require ("./wrap");
var ArgpError = require ("./error");

var debug = process.argv[1] === "debug";

var Argp = function (){
	events.EventEmitter.call (this);
	
	this._configuration = {};
	this._description = null;
	this._version = null;
	this._email = null;
	this._configureNext = 0;
	this._parseNext = 0;
	this._arguments = {};
	this._optionsArray = [];
	this._options = {};
	this._usages = [];
	this._obj = null;
	this._script = path.basename (process.argv[debug ? 2 : 1]);
	this._argv = [];
	
	//Add default options: --help, --usage
	var o = {
		short: "h",
		long: "help",
		description: "Display this help and exit"
	};
	this._optionsArray.push (o);
	this._options[o.long] = o;
	
	o = {
		long: "usage",
		description: "Display a short usage message and exit"
	};
	this._optionsArray.push (o);
	this._options[o.long] = o;
};

util.inherits (Argp, events.EventEmitter);

Argp.debug = debug;

Argp.prototype._errorTry = function (){
	var c = this._configuration;
	
	if (!c.showHelp && !c.showUsage) return;
	
	var str;
	if (c.showHelp && c.showUsage){
		str = "'" + this._script + " --help' or '" + this._script + " --usage'";
	}else if (c.showHelp && !c.showUsage){
		str = "'" + this._script + " --help'";
	}else{
		str = "'" + this._script + " --usage'";
	}
	
	console.error ("Try " + str + " for more information.");
};

Argp.prototype._errorNotExpectedValue = function (name){
	this._errorExpectedValue (name, "not");
};

Argp.prototype._errorExpectedValue = function (name, negate){
	console.error (this._script + ": The option '" + name + "' was " +
			(negate ? "not " : "") + "expecting a value.");
	this._errorTry ();
	process.exit (1);
};

Argp.prototype._errorUnrecognized = function (str, name){
	console.error (this._script + ": Unrecognized " + str + " '" + name + "'.");
	this._errorTry ();
	process.exit (1);
};

Argp.prototype._errorUnrecognizedOption = function (name){
	this._errorUnrecognized ("option", name);
};

Argp.prototype._errorUnrecognizedArgument = function (name){
	this._errorUnrecognized ("argument", name);
};

Argp.prototype._newArgument = function (o){
	o.argument = true;
	this._argv.push (o);
};

Argp.prototype._newOption = function (o){
	o.option = true;
	if (this._configuration.inOrder){
		this._argv.push (o);
	}else{
		this._argv.splice (this._parseNext++, 0, o);
	};
};

Argp.prototype._normalize = function (){
	var me = this;
	var onlyArguments = false;
	var option;
	
	var checkOptionValue = function (arg){
		if (!option) return;
		
		if (!option.optional && !arg){
			//The option was expecting a non optional value, eg: we have --a=N and we
			//read --a --, so any subsequent tokens are arguments, or if --a was the
			//last token. The same applies with short names.
			me._errorExpectedValue (option.long
					? "--" + option.long
					: "-" + option.short);
		}else{
			var o = {};
			if (arg) o.value = arg;
			if (option.long){
				o.long = option.long;
			}else{
				o.short = option.short;
			}
			me._newOption (o);
		}
		option = null;
	};
	
	var long = function (arg){
		var opt;
		var i;
		var value;
		
		if (arg[2] === "n" && arg[3] === "o" && arg[4] === "-"){
			//Negated options are always a flag, the possible value part is not
			//checked
			arg = arg.substring (5);
			opt = me._options[arg];
			
			if (!me._configuration.undefinedOptions &&
					(!opt || (opt.flag && !opt.negate))){
				me._errorUnrecognizedOption ("--no-" + arg);
			}
			
			me._newOption ({
				flag: true,
				negate: true,
				long: arg
			});
			
			return;
		}
		
		arg = arg.substring (2);
		
		//Check whether the token also contains de value
		i = arg.indexOf ("=");
		if (i !== -1){
			value = arg.substring (i + 1);
			arg = arg.substring (0, i);
		}
		
		opt = me._options[arg];
		
		//If negate is true, it's a flag, no need to do: flag && negate
		if (!me._configuration.undefinedOptions && (!opt || opt.negate)){
			me._errorUnrecognizedOption (arg);
		}
		
		if (!opt){
			//Undefined options are always flags
			me._newOption ({
				flag: true,
				long: arg
			});
			return;
		}
		
		if (opt.flag){
			//if opt.negate, this is the default value of the flag, eg: we have --no-a
			//and we read --a. Because we have --no-a, we know that "a" is a flag. The
			//default value of --no-a is true, then if the --no-a option is not found,
			//we set the value true, the same as the virtual --a. Therefore, we can
			//omit this option
			if (!opt.negate){
				me._newOption ({
					flag: true,
					long: arg
				});
			}
			
			//Value in the same token
			if (value){
				me._errorNotExpectedValue (arg);
			}
			
			return;
		}
		
		//The next token is the value of the current option
		option = {
			long: arg,
			optional: opt.optional
		};
		
		if (value){
			//The value is in the same token, eg: --a=b
			option.value = value;
			me._newOption (option);
			option = null;
		}
	};
	
	var short = function (arg){
		arg = arg.substring (1);
	};
	
	var argument = function (arg){
		me._newArgument ({
			name: arg
		});
	};
	
	process.argv.slice (debug ? 3 : 2).forEach (function (arg){
		if (onlyArguments){
			me._newArgument ({
				name: arg
			});
			return;
		}
		
		if (arg === "--"){
			checkOptionValue ();
			onlyArguments = true;
			return;
		}
		
		if (arg[0] === "-"){
			if (arg[1] === "-"){
				long (arg);
			}else{
				short (arg);
			}
		}else if (option){
			checkOptionValue (arg);
		}else{
			argument (arg);
		}
	});
	
	checkOptionValue ();
};

Argp.prototype.argument = function (str){
	this._arguments[str] = true;
	return this;
};

Argp.prototype.arguments = function (){
	return this._arguments;
};

Argp.prototype.configure = function (obj){
	this._configuration = obj;
	if (obj.showHelp === undefined) obj.showHelp = true;
	if (obj.showUsage === undefined) obj.showUsage = true;
	if (obj.undefinedArguments === undefined) obj.undefinedArguments = true;
	if (!obj.columns) obj.columns = 80;
	return this;
};

Argp.prototype.description = function (str){
	this._description = str;
	return this;
};

Argp.prototype.email = function (str){
	this._email = str;
	return this;
};

Argp.prototype.fail = function (str, code){
	console.error (this._script + ": " + str);
	process.exit (code || 1);
};

Argp.prototype.group = function (str){
	//Group lines are pushed to the options array to maintain the insertion order
	this._optionsArray.splice (this._configureNext++, 0, {
		group: str
	});
	return this;
};

Argp.prototype.option = function (obj){
	if (!obj.long && !obj.short) throw new ArgpError ("At least a long name " +
			"must be configured");
	obj.flag = !obj.argument;
	//Clean up
	if (obj.flag){
		delete obj.reviver;
		delete obj.value;
		delete obj.optional;
	}else{
		delete obj.negate;
	}
	this._optionsArray.splice (this._configureNext++, 0, obj);
	this._options[obj.long || obj.short] = obj;
	return this;
};

Argp.prototype.options = function (){
	return this._options;
};

Argp.prototype.parse = function (){
	if (this._obj) return this._obj;
	
	this._obj = {};
	
	//Detect options and arguments
	this._normalize ();
	console.log (this._argv);
	
	return this._obj;
};

Argp.prototype.usage = function (str){
	this._usages.push (str);
	return this;
};

Argp.prototype.text = function (str){
	//Text lines are pushed to the options array to maintain the insertion order
	this._optionsArray.splice (this._configureNext++, 0, {
		text: str
	});
	return this;
};

Argp.prototype.version = function (str){
	this._version = str;
	//Add --version option
	var o = {
		short: "v",
		long: "version",
		description: "Output version information and exit"
	};
	this._optionsArray.push (o);
	this._options[o.long] = o;
	return this;
};

module.exports = new Argp ();

/*
http://www.gnu.org/software/libc/manual/html_node/Argp.html
https://sourceware.org/git/?p=glibc.git;a=blob_plain;f=argp/argp-parse.c
http://nongnu.askapache.com/argpbook/step-by-step-into-argp.pdf
http://www.gnu.org/software/libc/manual/html_node/Argument-Syntax.html#Argument-Syntax

pag12

Features:
--no-opt
--opt
-o
--opt 123
--opt=213
-o 123
-o123
--hel -> --help
app.js a b -> como "node-gyp build"
-- ->para ignorar las demas opciones
añadir si no encuentra:
$ rmdir ­­foo 
rmdir: unrecognized option '­­foo' 
Try `rmdir ­­help' for more information.
*/