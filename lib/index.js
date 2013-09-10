"use strict";

var events = require ("events");
var util = require ("util");
var path = require ("path");
var wrap = require ("line-wrap");
var ArgpError = require ("./error");

/*TODO
hacer el wrap
http://www.gnu.org/software/libc/manual/html_node/Argp.html
https://sourceware.org/git/?p=glibc.git;a=blob_plain;f=argp/argp-parse.c
http://nongnu.askapache.com/argpbook/step-by-step-into-argp.pdf
http://www.gnu.org/software/libc/manual/html_node/Argument-Syntax.html#Argument-Syntax
*/

var Argp = function (){
	events.EventEmitter.call (this);
	
	this._configuration = {
		allowUndefinedOptions: true,
		allowUndefinedArguments: true,
		columns: 80,
		showHelp: true,
		showUsage: true
	};
	this._description = null;
	this._version = null;
	this._email = null;
	this._next = 0;
	this._arguments = {};
	this._optionsArray = [];
	this._options = {};
	this._optionsShort = {};
	this._optionsLong = {};
	this._usages = [];
	this._obj = null;
	this._script = path.basename (process.argv[this.debug ? 2 : 1]);
	this._reWhitespace = /\s/;
	this._ignore = false;
	var me = this;
	this._ignoreFn = function (){
		me._ignore = true;
	};
	
	this._argv = [];
	
	//Add default options: --help, --usage
	this._option ({
		short: "h",
		long: "help",
		description: "Display this help and exit"
	}, true);
	
	this._option ({
		long: "usage",
		description: "Display a short usage message and exit"
	}, true);
};

util.inherits (Argp, events.EventEmitter);

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

Argp.prototype._errorAbbreviation = function (name){
	console.error (this._script + ": Option '" + name + "' is ambiguous.");
	this._errorTry ();
	process.exit (1);
};

Argp.prototype._errorNotExpectedValue = function (name){
	this._errorExpectedValue (name, "not");
};

Argp.prototype._errorExpectedValue = function (name, negate){
	console.error (this._script + ": Option '" + name + "' " +
			(negate ? "does not require" : "requires") + " an argument.");
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

Argp.prototype._printHelp = function (){
	var h = "";
	
	//Cannot use this._optionsArray because text and group lines are also pushed
	//to this array
	if (Object.keys (this._options).length){
		h += " [OPTIONS...]";
	}
	
	if (Object.keys (this._usages).length){
		var s = h;
		h = "";
		for (var i=0, ii=this._usages.length; i<ii; i++){
			if (i) h += "\n       " + this._script;
			h += s + " " + this._usages[i];
		}
	}else if (Object.keys (this._arguments).length){
		h += " [ARGUMENTS...]";
	}
	
	h = "Usage: " + this._script + h;
	
	if (this._description) h += "\n\n" + this._description;
	
	var previousGroup;
	var previousLine;
	this._optionsArray.forEach (function (o){
		if (o.text){
			h += "\n\n" + o.text;
			previousGroup = false;
			previousLine = false;
			return;
		}
		
		if (o.group){
			h += "\n\n " + o.group + ":";
			previousGroup = true;
			previousLine = false;
			return;
		}
		
		h += (previousGroup || previousLine ? "\n" : "\n\n");
		var line = "  ";
		
		if (o.short){
			if (o.long){
				line += "-" + o.short + ", --" + o.long;
				if (!o.flag){
					line += (o.optional ? "[=" + o.argument + "]" : "=" + o.argument);
				}
			}else{
				line += "-" + o.short;
				if (!o.flag){
					line += (o.optional ? "[" + o.argument + "]" : " " + o.argument);
				}
			}
		}else if (o.long){
			line += "    --" + o.long;
			if (!o.flag){
				line += (o.optional ? "[=" + o.argument + "]" : "=" + o.argument);
			}
		}
		
		line += "  ";
		
		//Fill the line with spaces
		var c = 30 - line.length;
		if (c < 0 && o.description){
			line += "\n";
			for (var i=0; i<30; i++){
				line += " ";
			}
		}else{
			for (var i=0; i<c; i++){
				line += " ";
			}
		}
		
		if (o.description) line += o.description;
		h += line;
		
		previousGroup = false;
		previousLine = true;
	});
	
	if (this._email) h += "\n\nReport bugs to <" + this._email + ">.";
	
	console.log (h);
	process.exit (0);
};

Argp.prototype._wrap = function (str, prefix, columns){
	var s = "";
	var lines = wrap (str, columns).split (/\r\n|\n/);
	for (var i=1, ii=lines.length; i<ii; i++){
		s += prefix + lines[i] + "\n";
	}
	return lines[0] + "\n" + s;
};

Argp.prototype._printUsage = function (){
	var usage = "";
	var short = "";
	var shortArgs = [];
	var o;
		
	//Short names go first
	//-h and -v are the first options
	if (this._optionsShort.h) short += "h";
	if (this._optionsShort.v) short += "v";
	
	for (var p in this._optionsShort){
		if (p === "h" || p === "v") continue;
		
		o = this._optionsShort[p];
		if (o.flag){
			short += p;
		}else{
			//Short option with value, they go after the short flags
			shortArgs.push (o);
		}
	}
	
	if (short){
		usage += " [-" + short + "]";
	}
	
	shortArgs.forEach (function (o){
		usage += " [-" + o.short +
				(o.optional ? "[" + o.argument + "]" : " " + o.argument) + "]";
	});
	
	//Long names
	this._optionsArray.forEach (function (o){
		if (!o.long) return;
		
		usage += " [--" + o.long + (o.flag
				? "]"
				: (o.optional ? "[=" + o.argument + "]" : "=" + o.argument) + "]");
	});
	
	usage += " ";
	var prefix = "         ";
	
	//Arguments
	if (this._usages.length){
		var s = "";
		for (var i=0, ii=this._usages.length; i<ii; i++){
			s += (i ? "\n       " : "") + this._wrap ((i ? "" : "Usage: ") +
					this._script + usage + this._usages[i], prefix,
					i ? this._configuration.columns - 7 : this._configuration.columns);
		}
		usage = s;
	}else if (Object.keys (this._arguments).length){
		for (var p in this._arguments){
			usage += " [" + p + "]";
		}
		usage = this._wrap ("Usage: " + this._script + usage, prefix,
				this._configuration.columns);
	}
	
	console.log (usage);
	process.exit (0);
};

Argp.prototype._printVersion = function (){
	console.log (this._version);
	process.exit (0);
};

Argp.prototype._newArgument = function (o){
	o.argument = true;
	this._argv.push (o);
	
	this._ignore = false;
	this.emit ("argument", this._obj, o.name, this._ignoreFn);
	if (this._ignore) return;
	this._obj[o.name] = true;
};

Argp.prototype._newOption = function (o){
	o.option = true;
	this._argv.push (o);
	
	this._ignore = false;
	var opt = o.long ? this._optionsLong[o.long] : this._optionsShort[o.short];
	var value;
	var v = o.value || null;
	var reviver = opt && opt.reviver;
	
	if (o.flag){
		value = !o.negate;
	}else{
		value = reviver ? opt.reviver (v) : v;
	}
	
	this.emit ("option", this._obj, !!o.long, o.long || o.short, value,
			this._ignoreFn);
	
	//Return whether the option is ignored or is optional and doesn't have a value
	if (this._ignore || (o.optional && !v)) return;
	
	if (opt){
		//Defined option
		//Check default options
		if (this._configuration.showHelp && opt.name === "help"){
			this._printHelp ();
		}
		if (this._configuration.showUsage && opt.name === "usage"){
			this._printUsage ();
		}
		if (this._version && opt.name === "version") this._printVersion ();
		
		this._obj[opt.name] = value || opt.value;
	}else{
		//Undefined option
		this._obj[o.long || o.short] = value;
	}
};

var sameBooleans = function (b1, b2){
	return (b1 && b2) || (!b1 && !b2);
};

Argp.prototype._fullLongName = function (name, negate){
	//Exact match
	var opt = this._optionsLong[name];
	if (opt && sameBooleans (opt.negate, negate)) return name;
		
	//Check abbreviation
	var matches = 0;
	var re = new RegExp ("^" + name);
	var lastMatch;
	
	for (var p in this._optionsLong){
		if (re.test (p) && sameBooleans (this._optionsLong[p].negate, negate)){
			matches++;
			if (matches === 2){
				this._errorAbbreviation ("--" + (negate ? "no-" : "") + name);
			}
			lastMatch = p;
		}
	}
	
	return lastMatch;
};

Argp.prototype._normalize = function (){
	var me = this;
	var onlyArguments = false;
	var option;
	
	var checkOptionValue = function (arg){
		if (!option) return;
		
		if (!option.optional){
			//Undefined options also execute this
			var opt = option.long
					? me._optionsLong[option.long]
					: me._optionsShort[option.short];
		
			if (me._configuration.allowUndefinedOptions && !opt){
				if (arg){
					//-ab c, "a" is a defined flag
					option.value = arg;
					me._newOption (option);
				}else{
					//The option is a flag
					option.flag = true;
					me._newOption (option);
				}
				option = null;
				return;
			}
			
			//The option was expecting a non optional value, eg: we have --a=N and we
			//read --a --, so any subsequent tokens are arguments, or if --a was the
			//last token. The same applies with short names.
			me._errorExpectedValue (option.long
					? "--" + option.long
					: "-" + option.short);
		}else{
			if (arg) option.value = arg;
			me._newOption (option);
		}
		option = null;
	};
	
	var long = function (arg){
		checkOptionValue (arg);
		
		var opt;
		var i;
		var value;
		var name;
		
		if (arg[2] === "n" && arg[3] === "o" && arg[4] === "-"){
			//Negated options are always a flag, the possible value part is not
			//checked, it's the user responsability to pass a well-formed negated
			//option
			arg = arg.substring (5);
			name = arg;
			arg = me._fullLongName (arg, true);
			opt = me._optionsLong[arg];
			
			if (!me._configuration.allowUndefinedOptions &&
					(!opt || (opt.flag && !opt.negate))){
				me._errorUnrecognizedOption ("--no-" + name);
			}
			
			me._newOption ({
				flag: true,
				negate: true,
				long: arg || name
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
		
		name = arg;
		arg = me._fullLongName (arg, false);
		opt = me._optionsLong[arg];
		
		//If negate is true, it's a flag, no need to do: flag && negate
		if (!me._configuration.allowUndefinedOptions && (!opt || opt.negate)){
			me._errorUnrecognizedOption ("--" + name);
		}
		
		if (!opt){
			option = {
				long: arg || name
			};
			
			if (value){
				//The value is in the same token, eg: --a=b
				option.value = value;
				me._newOption (option);
				option = null;
			}
			
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
		checkOptionValue (arg);
	
		arg = arg.substring (1);
		var opt;
		var name;
		
		//Grouped options
		for (var i=0, ii=arg.length; i<ii; i++){
			name = arg[i];
			opt = me._optionsShort[name];
			
			if (!me._configuration.allowUndefinedOptions && !opt){
				me._errorUnrecognizedOption ("-" + name);
			}
			
			if (!opt){
				option = {
					short: name
				};
				continue;
			}
			
			if (opt.flag){
				me._newOption ({
					flag: true,
					short: name
				});
				continue;
			}
			
			//The next characters or the next token is the value
			option = {
				short: name,
				optional: opt.optional
			};
			
			if (ii > i + 1){
				//The value is in the same token
				option.value = arg.substring (1);
				me._newOption (option);
				option = null;
				break;
			}
		}
	};
	
	var argument = function (arg){
		if (!me._configuration.allowUndefinedArguments && !me._arguments[arg]){
			me._errorUnrecognizedArgument (arg);
		}
		
		me._newArgument ({
			name: arg
		});
	};
	
	process.argv.slice (this.debug ? 3 : 2).forEach (function (arg){
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
		
		if (option && arg === "-"){
			//A single - character can also be a value
			option.value = arg;
			me._newOption (option);
			option = null;
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

Argp.prototype._default = function (){
	var me = this;
	this._optionsArray.forEach (function (o){
		if (o.text || o.group) return;
		me._obj[o.name] = o.flag ? o.negate : o.value;
	});
	for (var p in this._arguments){
		this._obj[p] = false;
	}
};

Argp.prototype.argument = function (str){
	if (this._reWhitespace.test (str)){
		throw new ArgpError ("The argument canot contain whitespace characters");
	}
	if (this._arguments[str]){
		throw new ArgpError ("The argument \"" + str + "\" is already defined");
	}
	this._arguments[str] = true;
	return this;
};

Argp.prototype.arguments = function (){
	return this._arguments;
};

Argp.prototype.argv = function (){
	if (this._obj) return this._obj;
	
	this._obj = {};
	
	//Set default values
	this._default ();
	
	//Read options
	this._normalize ();
	console.log (this._argv);
	
	this.emit ("end", this._obj);
	
	//Uncache modules because this module is not going to be used anymore
	delete require.cache[__filename];
	delete require.cache[__dirname + path.sep + "error.js"];
	
	return this._obj;
};

Argp.prototype.configure = function (o){
	if (o.showHelp === false){
		this._configuration.showHelp = false;
		for (var i=this._optionsArray.length-1; i>=0; i--){
			if (this._optionsArray[i].long === "help"){
				this._optionsArray.splice (i, 1);
				break;
			}
		}
		delete this._options.help;
		delete this._optionsLong.help;
		delete this._optionsShort.h;
	}
	
	if (o.showUsage === false){
		this._configuration.showUsage = false;
		for (var i=this._optionsArray.length-1; i>=0; i--){
			if (this._optionsArray[i].long === "usage"){
				this._optionsArray.splice (i, 1);
				break;
			}
		}
		delete this._options.usage;
		delete this._optionsLong.usage;
	}
	
	if (o.allowUndefinedOptions === false){
		this._configuration.allowUndefinedOptions = false;
	}
	if (o.allowUndefinedArguments === false){
		this._configuration.allowUndefinedArguments = false;
	}
	if (o.columns) this._configuration.columns = 80;
	return this;
};

Argp.prototype.debug = process.argv[1] === "debug";

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
	this._optionsArray.splice (this._next++, 0, {
		group: str
	});
	return this;
};

Argp.prototype._option = function (o, push){
	o.flag = !o.argument;
	o.name = o.long || o.short;
	
	//Clean up
	if (o.flag){
		delete o.reviver;
		delete o.value;
		delete o.optional;
		o.negate = !!o.negate;
	}else{
		delete o.negate;
		if (!("value" in o)){
			o.value = null;
		}
	}
	
	if (push){
		this._optionsArray.push (o);
	}else{
		this._optionsArray.splice (this._next++, 0, o);
	}
	this._options[o.name] = o;
	if (o.short) this._optionsShort[o.short] = o;
	if (o.long) this._optionsLong[o.long] = o;
};

Argp.prototype.option = function (o){
	if (!o.long && !o.short) throw new ArgpError ("At least a long name " +
			"must be configured");
	if (o.long){
		//Long names cannot contain whitespaces
		if (this._reWhitespace.test (o.long)){
			throw new ArgpError ("The long name canot contain whitespace characters");
		}
		//Cannot be already defined
		for (var p in this._optionsLong){
			if (p === o.long){
				throw new ArgpError ("The long name \"" + o.long +
						"\" is already defined");
			}
		}
	}
	if (o.short){
		//Short names must be alphanumeric characters
		var code = o.short.charCodeAt (0);
		if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 90) ||
				(code >= 97 && code <= 122))){
			throw new ArgpError ("The short name must be an alphanumeric character");
		}
		//Cannot be already defined
		for (var p in this._optionsShort){
			if (p === o.short){
				throw new ArgpError ("The short name \"" + o.short +
						"\" is already defined");
			}
		}
	}
	this._option (o);
	return this;
};

Argp.prototype.options = function (){
	return this._options;
};

Argp.prototype.usage = function (str){
	this._usages.push (str);
	return this;
};

Argp.prototype.text = function (str){
	//Text lines are pushed to the options array to maintain the insertion order
	this._optionsArray.splice (this._next++, 0, {
		text: str
	});
	return this;
};

Argp.prototype.version = function (str){
	this._version = str;
	this._option ({
		short: "v",
		long: "version",
		description: "Output version information and exit"
	}, true);
	return this;
};

module.exports = new Argp ();