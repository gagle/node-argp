"use strict";

var events = require ("events");
var util = require ("util");
var path = require ("path");
var wrap = require ("./wrap");
var ArgpError = require ("./error");

var Argp = function (){
	events.EventEmitter.call (this);
	
	this._debug = process.argv[1] === "debug";
	this._filename = process.argv[this._debug ? 2 : 1];
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
	this._argv = null;
	this._script = path.basename (process.argv[this._debug ? 2 : 1]);
	this._ignore = false;
	var me = this;
	this._ignoreFn = function (){
		me._ignore = true;
	};
	
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
/*
Argp.prototype._wrap = function (str, prefix, columns){
	var s = "";
	var lines = wrap (str, columns, "\n").split (/\r\n|\n/);
	for (var i=1, ii=lines.length; i<ii; i++){
		s += prefix + lines[i] + (i === ii - 1 ? "" : "\n");
	}
	return s ? lines[0] + "\n" + s : lines[0];
};
*/
Argp.prototype._printHelp = function (){
	var h = "";
	
	//Cannot use this._optionsArray because text and group lines are also pushed
	//to this array
	if (Object.keys (this._options).length){
		h += " [OPTIONS...]";
	}
	
	var prefix = "         ";
	var c = this._configuration.columns;
	
	if (this._usages.length){
		var s = "";
		for (var i=0, ii=this._usages.length; i<ii; i++){
			s += (i ? "\n       " : "") + wrap ((i ? "" : "Usage: ") +
					this._script + h + this._usages[i], i ? c - 7 : c, prefix);
		}
		h = s;
	}else if (Object.keys (this._arguments).length){
		h = wrap ("Usage: " + this._script + h + " [ARGUMENTS...]", c, prefix);
	}
	
	if (this._description) h += "\n\n" + wrap (this._description, c);
	
	var previousGroup;
	var previousLine;
	
	this._optionsArray.forEach (function (o){
		if (o.text){
			h += "\n\n" + wrap (o.text, c);
			previousGroup = false;
			previousLine = false;
			return;
		}
		
		if (o.group){
			h += "\n\n " + wrap (o.group + ":", c, " ");
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
		prefix = "";
		for (var i=0; i<30; i++){
			prefix += " ";
		}
		
		//Fill the line with spaces
		var spaces = 30 - line.length;
		if (spaces < 0 && o.description){
			line += "\n" + prefix;
		}else{
			for (var i=0; i<spaces; i++){
				line += " ";
			}
		}
		
		if (o.description){
			var description = "";
			var arr = wrap (o.description, c - 30, "  ").split ("\n");
			for (var i=0, ii=arr.length; i<ii; i++){
				if (i) description += "\n" + prefix;
				description += arr[i];
			}
			line += description;
		}
		h += line;
		
		previousGroup = false;
		previousLine = true;
	});
	
	if (this._email) h += "\n\n" + wrap ("Report bugs to <" + this._email + ">.",
			c);
	
	console.log (h);
	process.exit (0);
};

Argp.prototype._printUsage = function (){
	var usage = "";
	var short = "";
	var shortArgs = [];
	var o;
	var c = this._configuration.columns;
		
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
			s += (i ? "\n       " : "") + wrap ((i ? "" : "Usage: ") +
					this._script + usage + this._usages[i], i ? c - 7 : c, prefix);
		}
		usage = s;
	}else if (Object.keys (this._arguments).length){
		for (var p in this._arguments){
			usage += " [" + p + "]";
		}
		usage = wrap ("Usage: " + this._script + usage, c, prefix);
	}
	
	console.log (usage);
	process.exit (0);
};

Argp.prototype._printVersion = function (){
	console.log (wrap (this._version, this._configuration.columns));
	process.exit (0);
};

Argp.prototype._newArgument = function (str){
	this._ignore = false;
	this.emit ("argument", this._argv, str, this._ignoreFn);
	if (this._ignore) return;
	this._argv[str] = true;
};

Argp.prototype._newOption = function (o){
	this._ignore = false;
	
	//Normalize the value
	if (o.flag){
		o.value = !o.negate;
	}else{
		if (o.opt){
			if (o.value === undefined){
				//Defined and no input value, set default
				o.value = o.opt.value;
			}
			//Use the reviver, if any
			if (o.opt.reviver){
				o.value = o.opt.reviver (o.value);
			}
		}else if (o.value === undefined){
			//Undefined and no input value, set null
			o.value = null;
		}
	}
	
	//At this point o.value contains the input value or the default whether it's
	//a flag or not
	
	this.emit ("option", this._argv, o.long || o.short, o.value, !!o.long,
			this._ignoreFn);
	
	if (this._ignore) return;
	
	if (o.opt){
		//Check for --help or --usage
		if (if (this._configuration.showHelp && o.opt.id === "help"){
			this._printHelp ();
		}
		if (this._configuration.showUsage && o.opt.id === "usage"){
			this._printUsage ();
		}
		if (this._version && o.opt.id === "version"){
			this._printVersion ();
		}
		
		this._argv[o.opt.id] = o.value;
	}else{
		this._argv[o.long || o.short] = o.value;
	}


	/*this._ignore = false;
	var opt = o.long ? this._optionsLong[o.long] : this._optionsShort[o.short];
	var value;
	var v = o.value || null;
	var reviver = opt && opt.reviver;
	
	if (o.flag){
		value = !o.negate;
	}else{
		value = reviver ? opt.reviver (v) : v;
	}
	
	this.emit ("option", this._argv, !!o.long, o.long || o.short, value,
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
		
		this._argv[opt.name] = value || opt.value;
	}else{
		//Undefined option
		this._argv[o.long || o.short] = value;
	}*/
};

Argp.prototype._fullname = function (name, negate){
	var o = this._optionsLong[name];
	
	//Don't need to check for o.negate === negate
	
	//Exact match
	if (o) return name;
		
	//Check abbreviations
	var matches = 0;
	var re = new RegExp ("^" + name);
	var lastMatch = null;
	
	for (var p in this._optionsLong){
		if (re.test (p)){
			matches++;
			if (matches === 2){
				this._errorAbbreviation ("--" + (negate ? "no-" : "") + name);
			}
			lastMatch = p;
		}
	}
	
	//If null, the option is not defined
	return lastMatch;
};

Argp.prototype._read = function (){
	var me = this;
	var onlyArguments = false;
	//Properties: short/long, flag, negate, value, opt
	var option;
	var undefinedArguments = this._configuration.allowUndefinedArguments;
	var undefinedOptions = this._configuration.allowUndefinedOptions;
	
	var find = function (o){
		return o.long ? me._optionsLong[o.long] : me._optionsShort[o.short];
	};
	
	var free = function (){
		//This function must be called on finish, when found "--" option and when
		//found any short and long options
		if (!option) return;
		
		//Check any previous option waiting for a value and, if any, free it; the
		//previous option doesn't have a value and therefore:
		//- it's a flag (if undefined)
		//- doesn't have a value (no error if optional, error if mandatory)
		//At this point the option has been validated
		
		if (option.opt){
			//Defined option
			if (option.opt.optional){
				//No value
				me._newOption (option);
			}else{
				//If requires a value
				me._errorExpectedValue (option.long
						? "--" + option.long
						: "-" + option.short);
			}
		}else{
			//Undefined options with no value are always a flag
			option.flag = true;
			me._newOption (option);
		}
		
		option = null;
	};
	
	var value = function (str){
		if (me._arguments[str]){
			//Defined argument between an option and a possible value, eg: --a arg 1,
			//where "arg" is an argument and "a" has "1" as a value
			//Simply save the argument and proceed
			me._newArgument (str);
			return;
		}
		
		//At this point the string contains the value of the previous option
		option.value = str;
		me._newOption (option);
		option = null;
	};
	
	var long = function (str){
		//Free the previous option
		free ();
		
		var o;
		var name;
	
		if (str[2] === "n" && str[3] === "o" && str[4] === "-"){
			//Negated flag
			//Get the full name
			str = str.substring (5);
			name = str;
			str = me._fullname (name, true);
			o = str ? me._optionsLong (str) : null;
			
			if ((o && !o.flag) || (!undefinedOptions && !o)){
				//Defined no-flag option or undefined option and no undefined allowed
				me._errorUnrecognizedOption ("--no-" + str);
			}
			
			//The option doesn't require a value
			me._newOption ({
				opt: o,
				flag: true,
				negate: true,
				long: str || name
			});
			
			return;
		}
		
		str = str.substring (2);
		name = str;
		
		//Check for the value in the same token
		var value;
		var i = str.indexOf ("=");
		if (i !== -1){
			value = str.substring (i + 1);
			str = str.substring (0, i);
		}
		
		//Get the full name
		str = me._fullname (str);
		o = str ? me._optionsLong (str) : null;
		
		if (o && o.flag){
			if (value){
				//A flag with a value
				me._errorNotExpectedValue (str);
			}
			
			//If o.negate, this is the default value of the flag, eg: --no-a is
			//defined and we read --a. The default value of --no-a is true, the same
			//as --a, so we can omit it
			if (!o.negate){
				me._newOption ({
					opt: o,
					flag: true,
					long: str
				});
			}
			
			return;
		}else if (!undefinedOptions){
			//Undefined option and no undefined allowed
			me._errorUnrecognizedOption ("--" + str);
		}
		
		if (value){
			me._newOption ({
				opt: o,
				long: str || name
			});
		}else{
			//Wait for the value
			option = {
				opt: o,
				long: str || name
			};
		}
	};
	
	var short = function (str){
		//Free the previous option
		free ();
		
		str = str.substring (1);
		var name;
		var o;
		
		//Grouped options
		for (var i=0, ii=str.length; i<ii; i++){
			//Free the previous option
			free ();
			
			name = str[i];
			o = this._optionsShort[name];
			
			if (o){
				if (o.flag){
					this._newOption ({
						flag: true,
						short: name
					});
				}else{
					if (!i){
						//First option
						//Check whether the value is in the same token
						if (ii > 1){
							//Assumption: if an undefined option follows the first defined
							//no-flag option, the next undefined characters to the first
							//defined option are the value of this option
							if (!this._optionsShort[str[i + 1]]){
								this._newOption ({
									opt: o,
									short: str.substring (1);
								});
								break;
							}
						}
					}else if (i < ii - 1){
						//Options between the first and the last
						if (o.optional){
							//No value
							this._newOption ({
								short: name
							});
						}else{
							//The option requires a value
							this._errorExpectedValue ("-" + name);
						}
					}else{
						//Last option
						//Wait for the value
						option = {
							opt: o,
							short: name
						};
					}
				}
			}else{
				if (!undefinedOptions){
					//Undefined option and no undefined allowed
					me._errorUnrecognizedOption ("-" + name);
				}
				
				//Wait for the value
				option = {
					opt: null,
					short: name
				};
			}
		}
	};
	
	var argument = function (str){
		if (!undefinedArguments && !me._arguments[str]){
			//Undefined argument and no undefined allowed
			me._errorUnrecognizedArgument (str);
		}
		
		me._newArgument (str);
	};

	process.argv.slice (this._debug ? 3 : 2).forEach (function (str){
		if (onlyArguments){
			me._newArgument (str);
			return;
		}
		
		if (str === "--"){
			free ();
			onlyArguments = true;
			return;
		}
		
		if (option && str === "-"){
			//Special case
			//Allow the option value "-"
			option.value = str;
			me._newOption (option);
			option = null;
			return;
		}
		
		if (str[0] === "-"){
			if (str[1] === "-"){
				//Long option
				long (str);
			}else{
				//Short option
				short (str);
			}
		}else if (option){
			//Option waiting for a value
			value (str);
		}else{
			argument (str);
		}
	
	
	
		/*if (onlyArguments){
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
				if (option){
					checkOptionValue (arg);
				}else{
					long (arg);
				}
			}else{
				if (option){
					checkOptionValue (arg);
				}else{
					short (arg);
				}
			}
		}else if (option){
			checkOptionValue (arg);
		}else{
			argument (arg);
		}*/
	});
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

Argp.prototype._default = function (){
	var me = this;
	this._optionsArray.forEach (function (o){
		if (o.text || o.group) return;
		me._argv[o.id] = o.value;
	});
	for (var p in this._arguments){
		this._argv[p] = true;
	}
};

Argp.prototype.argv = function (){
	if (this._argv) return this._argv;
	
	this._argv = {
		_debug: this._debug,
		_filename: this._filename
	};
	
	//Set default values
	this._default ();
	
	//Read options
	this._read ();
	
	//Uncache modules because this module is not going to be used anymore
	delete require.cache[__filename];
	delete require.cache[__dirname + path.sep + "error.js"];
	delete require.cache[__dirname + path.sep + "wrap.js"];
	
	this.emit ("end", this._argv);
	
	return this._argv;
};

Argp.prototype.body = function (fn){
	fn (new Body (this));
};

Argp.prototype.configuration = function (o){
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

Argp.prototype._option = function (o, push){
	o.flag = !o.argument;
	o.id = o.long || o.short;
	
	//Clean up
	//The value property is always set
	if (o.flag){
		delete o.reviver;
		delete o.value;
		delete o.optional;
		o.negate = !!o.negate;
		o.value = o.negate;
	}else{
		delete o.negate;
		if (o.value === undefined){
			o.value = null;
		}
	}
	
	//Save the option
	if (push){
		this._optionsArray.push (o);
	}else{
		this._optionsArray.splice (this._next++, 0, o);
	}
	
	this._options[o.id] = o;
	
	//Shortcuts
	if (o.short) this._optionsShort[o.short] = o;
	if (o.long) this._optionsLong[o.long] = o;
};

Argp.prototype.options = function (){
	return this._options;
};

Argp.prototype.usage = function (str){
	this._usages.push (str);
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

var Body = function (argp){
	this._argp = argp;
	this._reWhitespace = /\s/;
};

Body.prototype.group = function (str){
	//Group lines are pushed to the options array to maintain the insertion order
	this._argp._optionsArray.splice (this._argp._next++, 0, {
		group: str
	});
	return this;
};

Body.prototype.option = function (o){
	if (!o.long && !o.short) throw new ArgpError ("At least a long name " +
			"must be configured");
			
	if (o.long){
		//Long names cannot contain whitespaces
		if (this._reWhitespace.test (o.long)){
			throw new ArgpError ("The long name canot contain whitespace characters");
		}
		//Cannot be already defined
		for (var p in this._argp._optionsLong){
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
		for (var p in this._argp._optionsShort){
			if (p === o.short){
				throw new ArgpError ("The short name \"" + o.short +
						"\" is already defined");
			}
		}
	}
	
	this._argp._option (o);
	
	return this;
};

Body.prototype.text = function (str){
	//Text lines are pushed to the options array to maintain the insertion order
	this._argp._optionsArray.splice (this._argp._next++, 0, {
		text: str
	});
	return this;
};

module.exports = new Argp ();




/*var me = this;
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
				if (option){
					//Undefined -abc or -a -b
					me._newOption (option);
				}
				option = {
					flag: true,
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
	
	process.argv.slice (this._debug ? 3 : 2).forEach (function (arg){
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
				if (option){
					checkOptionValue (arg);
				}else{
					long (arg);
				}
			}else{
				if (option){
					checkOptionValue (arg);
				}else{
					short (arg);
				}
			}
		}else if (option){
			checkOptionValue (arg);
		}else{
			argument (arg);
		}
	});
	
	checkOptionValue ();*/