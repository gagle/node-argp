"use strict";

var events = require ("events");
var util = require ("util");
var path = require ("path");
var fs = require ("fs");
var wrap = require ("./wrap");
var ArgpError = require ("./error");

var debug = process.argv[1] === "debug";
var script = path.basename (process.argv[debug ? 2 : 1], ".js");
var mainScript = script;

var cast = function (value){
	if (value === "undefined") return undefined;
	if (value === "null") return null;
	if (value === "true") return true;
	if (value === "false") return false;
	var v = Number (value);
	return isNaN (v) ? value : v;
};

var Argp = module.exports = function (){
	events.EventEmitter.call (this);

	this._exitStatus = 1;

	this._argv = null;
	this._usages = [];
	this._description = null;
	this._version = null;
	this._email = null;

	this._rePackageEmail = /<(.+)>/;
	this._packageVersion = false;

	this._allowUndefinedOptions = false;
	this._allowUndefinedArguments = false;
	this._sort = false;
	this._columns = 80;
	this._showHelp = false;
	this._showUsage = false;

	this._emitArguments = false;

	this._command = false;
	this._commandInstances = {};
	//Shortcuts to the arguments and options of each command
	this._commands = {};

	this._lines = [];

	this._arguments = {};
	this._argumentsArray = [];

	this._options = {};
	this._optionsShort = {};
	this._optionsLong = {};

	var me = this;

	this._ignore = false;
	this._ignoreFn = function (){
		me._ignore = true;
	};

	this._printHelpBound = function (){
		me._printHelp ();
	};
	this._printUsageBound = function (){
		me._printUsage ();
	};
	this._printVersionBound = function (){
		me._printVersion ();
	};
	this._failBound = function (){
		me.fail ();
	};
};

util.inherits (Argp, events.EventEmitter);

Argp.prototype._errorTry = function (){
	var s = this._command ? script : mainScript;

	var str;
	if (this._showHelp && this._showUsage){
		str = "'" + s + " --help' or '" + s + " --usage'";
	}else if (this._showHelp && !this._showUsage){
		str = "'" + s + " --help'";
	}else if (!this._showHelp && this._showUsage){
		str = "'" + s + " --usage'";
	}else if (this._command){
		//If the command doesn't have a help or usage message, show the main help
		//and usage
		return this._argp._errorTry ();
	}else{
		return;
	}

	return "Try " + str + " for more information.";
};

Argp.prototype._errorChoice = function (value){
	console.error (script + ": Unrecognized choice '" + value + "'.");
	var error = this._errorTry ();
	if (error) console.error (error);
	process.exit (this._exitStatus);
};

Argp.prototype._errorConvert = function (name, type){
	console.error (script + ": Option '" + name + "' is not a " + type +
			".");
	var error = this._errorTry ();
	if (error) console.error (error);
	process.exit (this._exitStatus);
};

Argp.prototype._errorAbbreviation = function (name){
	console.error (script + ": Option '" + name + "' is ambiguous.");
	var error = this._errorTry ();
	if (error) console.error (error);
	process.exit (this._exitStatus);
};

Argp.prototype._errorNotExpectedValue = function (name){
	this._errorExpectedValue (name, "not");
};

Argp.prototype._errorExpectedValue = function (name, negate){
	console.error (script + ": Option '" + name + "' " +
			(negate ? "does not require" : "requires") + " an argument.");
	var error = this._errorTry ();
	if (error) console.error (error);
	process.exit (this._exitStatus);
};

Argp.prototype._errorUnrecognized = function (str, name){
	console.error (script + ": Unrecognized " + str + " '" + name + "'.");
	var error = this._errorTry ();
	if (error) console.error (error);
	process.exit (this._exitStatus);
};

Argp.prototype._errorUnrecognizedOption = function (name){
	this._errorUnrecognized ("option", name);
};

Argp.prototype._errorUnrecognizedArgument = function (name){
	this._errorUnrecognized ("argument", name);
};

Argp.prototype._errorExpectedCommand = function (name, num, min){
	console.error (script + ": Command '" + name + "' expects " +
			(min ? min + " " : "") + num + " argument/s.");
	var error = this._errorTry ();
	if (error) console.error (error);
	process.exit (this._exitStatus);
};

Argp.prototype._errorEmptyNegatedFlag = function (){
	console.error (script + ": A negated flag must contain a long name, eg. " +
			"'--no-' is invalid, '--no-flag' is valid");
	var error = this._errorTry ();
	if (error) console.error (error);
	process.exit (this._exitStatus);
};

Argp.prototype._columnize = function (col1, col2){
	var blank = "                              ";

	var spaces = 30 - col1.length;
	if (spaces < 0 && col2){
		col1 += "\n" + blank;
	}else{
		for (var i=0; i<spaces; i++){
			col1 += " ";
		}
	}

	if (col2){
		var arr = wrap (col2, this._columns - 30, "  ").split ("\n");
		for (var i=0, ii=arr.length; i<ii; i++){
			if (i) col1 += "\n" + blank;
			col1 += arr[i];
		}
	}

	return col1;
};

Argp.prototype._newArgument = function (str){
	if (!this._emitArguments && this._sort){
		this._argumentsArray.push (str);
		return;
	}

	this._ignore = false;
	this.emit ("argument", this._argv, str, this._ignoreFn);
	if (this._ignore) return;
	this._argv[str] = true;
};

Argp.prototype._convertType = function (o){
	if (o.opt.type === Number){
		var v = Number (o.value);
		if (isNaN (v)){
			this._errorConvert (o.long || o.short, "Number");
		}
		//Note: Number(null) returns 0, the default value
		o.value = v;
	}else if (o.opt.type === Boolean){
		if (o.value === "true"){
			o.value = true;
		}else if (o.value === "false"){
			o.value = false;
		}else{
			this._errorConvert (o.long || o.short, "Boolean");
		}
	}else if (o.opt.type === Array){
		o.value = o.value.split (",");
		for (var i=0, ii=o.value.length; i<ii; i++){
			//Convert the type of each element
			o.value[i] = cast (o.value[i]);
		}
	}
};

Argp.prototype._newOption = function (o){
	this._ignore = false;

	//Normalize the value
	if (o.flag){
		o.value = o.short && o.opt && o.opt.negate ? false : !o.negate;
	}else{
		if (o.opt){
			if (o.value === undefined){
				//Defined and no input value, set default
				o.value = o.opt.default;
			}else{
				//Convert to the configured type
				this._convertType (o);
			}

			//Validate with the choices
			if (o.opt.choices){
				var found = false;
				for (var i=0, ii=o.opt.choices.length; i<ii; i++){
					if (o.opt.choices[i] === o.value){
						found = true;
						break;
					}
				}
				if (!found){
					this._errorChoice (o.value);
				}
			}

			//Use the reviver, if any
			if (o.opt.reviver){
				o.value = o.opt.reviver.call (this, o.value);
			}
		}else if (o.value === undefined){
			//Undefined and no input value, set null
			o.value = null;
		}else{
			//Undefined options are converted automatically to the type they represent
			o.value = cast (o.value);
		}
	}

	//At this point o.value contains the input value or the default whether it's
	//a flag or not

	this.emit ("option", this._argv, o.long || o.short, o.value, !!o.long,
			this._ignoreFn);

	if (this._ignore) return;

	if (o.opt){
		//Check for --help, --usage or --version
		if (this._showHelp && o.opt.id === "help"){
			this._printHelp ();
		}
		if (this._showUsage && o.opt.id === "usage"){
			this._printUsage ();
		}
		if (this._version && o.opt.id === "version"){
			this._printVersion ();
		}

		if (o.opt.type === Array){
			//The user may cache the default array, so it cannot be replaced by the
			//new one, so all the elements must be copied
			var arr = this._argv[o.opt.id];
			o.value.forEach (function (v){
				arr.push (v);
			});
		}else{
			this._argv[o.opt.id] = o.value;
		}
	}else{
		this._argv[o.long || o.short] = o.value;
	}
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

Argp.prototype._read = function (argv){
	var me = this;
	var onlyArguments = false;
	//Properties: short/long, flag, negate, value, opt
	var option;

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
			if (str){
				//Make sure there's a name, eg: --no-a
				//--no- doesn't have a name, so "--no-" is the name
				name = str;
				str = me._fullname (name, true);
			}else{
				me._errorEmptyNegatedFlag ();
			}
			o = str ? me._optionsLong[str] : null;

			if ((o && !o.flag) || (!me._allowUndefinedOptions && !o)){
				//Defined no-flag option or undefined option and no undefined allowed
				me._errorUnrecognizedOption ("--no-" + (str || name));
			}

			//If --a is defined and --no-a is read, we must omit the option because
			//the value of --no-a, false, it's the same as the default value of --a,
			//false
			if (o && !o.negate) return;

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

		//Check for the value in the same token
		var emptyStringValue = false;
		var value;
		var i = str.indexOf ("=");
		if (i !== -1){
			value = str.substring (i + 1);
			if (!value){
				//Empty string value, --a=
				emptyStringValue = true;
				value = undefined;
			}
			str = str.substring (0, i);
		}

		//Get the full name
		name = str;
		str = me._fullname (str);
		o = str ? me._optionsLong[str] : null;

		if (o){
			if (o.flag){
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
			}
		}else if (!me._allowUndefinedOptions){
			//Undefined option and no undefined allowed
			me._errorUnrecognizedOption ("--" + (str || name));
		}

		if (value || emptyStringValue){
			me._newOption ({
				opt: o,
				long: str || name,
				value: value
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
		//Note: Cannot configure a negated short option

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
			o = me._optionsShort[name];

			if (o){
				if (o.flag){
					me._newOption ({
						opt: o,
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
							if (!me._optionsShort[str[i + 1]]){
								me._newOption ({
									opt: o,
									short: name,
									value: str.substring (1)
								});
								break;
							}else if (o.optional){
								me._newOption ({
									opt: o,
									short: name,
									value: null
								});
							}else{
								//The option requires a value
								me._errorExpectedValue ("-" + name);
							}
						}else{
							//Wait for the value
							option = {
								opt: o,
								short: name
							};
						}
					}else if (i < ii - 1){
						//Options between the first and the last
						if (o.optional){
							//No value
							me._newOption ({
								opt: o,
								short: name
							});
						}else{
							//The option requires a value
							me._errorExpectedValue ("-" + name);
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
				if (!me._allowUndefinedOptions){
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
		//Check for the trailing arguments if this is a command
		var curr = me._currentArgument;

		//The command's arguments have a greater priority than the defined
		//arguments, eg: foo 1 bar, where "foo" is a comamnd which expects 2
		//arguments and "bar" is a defined argument. In this case, "bar" belongs to
		//the "foo"'s arguments: { foo: [1, "bar"], bar: false }
		if (me._command && curr){
			me._argv[curr.name].push (cast (str));
			var length = me._argv[curr.name].length;
			if (length === curr.trailing.eq || length === curr.trailing.max){
				//Limit reached
				me._currentArgument = null;
			}
			return;
		}

		var arg = me._arguments[str];

		if (!me._allowUndefinedArguments && !arg){
			//Undefined argument and no undefined allowed
			me._errorUnrecognizedArgument (str);
		}

		if (me._command && arg && arg.trailing){
			//Store the new argument
			me._currentArgument = {
				name: str,
				trailing: arg.trailing
			};
			return;
		}

		me._newArgument (str);
	};

	var validateCommand = function (){
		if (!me._command) return;

		var curr = me._currentArgument;
		if (curr){
			if (curr.trailing.eq !== undefined){
				me._errorExpectedCommand (curr.name, curr.trailing.eq);
			}
			if (me._argv[curr.name].length < curr.trailing.min){
				me._errorExpectedCommand (curr.name, curr.trailing.min, "minimum");
			}
		}
	};

	argv.forEach (function (str){
		if (onlyArguments){
			me._newArgument (str);
			return;
		}

		if (str === "--"){
			free ();
			onlyArguments = true;
			return;
		}

		if (str === "-"){
			//Special case
			if (option){
				//Allow the option value "-"
				option.value = str;
				me._newOption (option);
				option = null;
			}else{
				//Assumption: an option with name "-" is an argument
				argument (str);
			}
			return;
		}

		if (str[0] === "-"){
			if (str[1] === "-"){
				//Long option
				long (str);
			}else{
				if (option && option.opt && (option.opt.type === Number ||
						option.opt.type === Array)){
					//Special case
					//Option with a negative Number value, eg: --a -12.34, or Array
					//beginning with a nevative number, eg: --a -1.2,foo
					option.value = str;
					me._newOption (option);
					option = null;
					return;
				}

				//Short option
				short (str);
			}
		}else if (option){
			//Option waiting for a value
			value (str);
		}else{
			argument (str);
		}
	});

	free ();
	validateCommand ();
};

Argp.prototype._createHelp = function (){
	var h = "";
	var prefix = "         ";

	if (this._usages.length){
		var s = "";
		for (var i=0, ii=this._usages.length; i<ii; i++){
			s += (i ? "\n       " : "") + wrap ((i ? "" : "Usage: ") +
					h + this._usages[i], i ? this._columns - 7 : this._columns, prefix);
		}
		h = s;
	}else{
		if (Object.keys (this._options).length){
			h += " [options]";
		}
		if (Object.keys (this._arguments).length){
			h += " [arguments]";
		}
		h = wrap ("Usage: " + script + h, this._columns, prefix);
	}

	if (this._description) h += "\n\n" + wrap (this._description, this._columns);

	h += "\n";

	var me = this;

	this._lines.forEach (function (o){
		if (o.text){
			h += "\n" + wrap (o.text, me._columns, o.prefix, true);
			return;
		}

		if (o.columns){
			h += "\n" + me._columnize (o.columns[0] + "  ", o.columns[1]);
			return;
		}

		var line = "  ";

		if (o.arg){
			var name = o.arg;
			o = me._arguments[o.arg];
			if (o.hidden) return;

			line += o.trailing && o.synopsis ? o.synopsis : name;
		}else{
			if (o.hidden) return;

			if (o.short){
				if (o.long){
					line += "-" + o.short + ", --" +
							(o.flag && o.negate ? "no-" + o.long : o.long);
					if (o.aliases){
						o.aliases.forEach (function (alias){
							line += ", --" + alias;
						});
					}
					if (!o.flag){
						line += (o.optional ? "[=" + o.metavar + "]" : "=" + o.metavar);
					}
				}else{
					line += "-" + o.short;
					var alias = "";
					if (o.aliases){
						alias = "=";
						o.aliases.forEach (function (alias){
							line += ", --" + alias;
						});
					}
					if (!o.flag){
						line += (o.optional
								? "[" + alias + o.metavar + "]"
								: (alias || " ") + o.metavar);
					}
				}
			}else if (o.long){
				line += "    --" + (o.flag && o.negate ? "no-" + o.long : o.long);
				if (o.aliases){
					o.aliases.forEach (function (alias){
						line += ", --" + alias;
					});
				}
				if (!o.flag){
					line += (o.optional ? "[=" + o.metavar + "]" : "=" + o.metavar);
				}
			}
		}

		h += "\n" + me._columnize (line + "  ", o.description);
	});

	if (this._email) h += "\n\n" + wrap ("Report bugs to <" + this._email + ">.",
			this._columns);

	return h;
};

Argp.prototype._createUsage = function (){
	var usage = "";
	var prefix = "         ";

	//Arguments
	if (this._usages.length){
		var s = "";
		for (var i=0, ii=this._usages.length; i<ii; i++){
			s += (i ? "\n       " : "") + wrap ((i ? "" : "Usage: ") +
					usage + this._usages[i],
					i ? this._columns - 7 : this._columns, prefix);
		}
		usage = s;
	}else{
		var short = "";
		var shortArgs = [];
		var o;

		//Short names go first
		for (var p in this._optionsShort){
			o = this._optionsShort[p];
			if (o.hidden || o.long || o.aliases) continue;

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
					(o.optional ? "[" + o.metavar + "]" : " " + o.metavar) + "]";
		});

		//Long names
		var longArgs = {};

		for (var p in this._optionsLong){
			o = this._optionsLong[p];
			if (o.hidden || longArgs[p]) continue;

			usage += " [";

			if (o.short){
				usage += "-" + o.short + (o.long ? "|" : "");
			}

			if (o.long){
				//Short name with aliases
				usage += "--" + o.long;
			}

			if (o.aliases){
				var me = this;
				o.aliases.forEach (function (alias){
					//Remember the alias
					longArgs[alias] = true;
					usage += "|--" + alias;
				});
			}

			usage += (o.flag
					? "]"
					: (o.optional ? "[=" + o.metavar + "]" : "=" + o.metavar) + "]");
		}

		//Arguments
		if (Object.keys (this._arguments).length){
			for (var p in this._arguments){
				o = this._arguments[p];
				if (o.hidden) continue;
				usage += " [" + (o.trailing && o.synopsis ? o.synopsis : p) + "]";
			}
		}
		usage = wrap ("Usage: " + script + usage, this._columns, prefix);
	}

	return usage;
};

Argp.prototype._createVersion = function (){
	if (!this._version) return null;
	return wrap (this._version, this._columns);
};

Argp.prototype._printHelp = function (){
	console.log (this._createHelp ());
	process.exit (0);
};

Argp.prototype._printUsage = function (){
	console.log (this._createUsage ());
	process.exit (0);
};

Argp.prototype._printVersion = function (){
	console.log (this._createVersion ());
	process.exit (0);
};

Argp.prototype._argument = function (name, o){
	this._lines.push ({
		arg: name
	});

	//Store the argument
	o.hidden = !!o.hidden;
	o.synopsis = o.synopsis || null;
	o.trailing = o.trailing || null;
	o.description = o.description || null;
	this._arguments[name] = o;
};

Argp.prototype._option = function (o){
	//Text message
	if (o.text || o.columns){
		this._lines.push (o);
		return;
	}

	o.flag = !o.metavar;
	o.id = o.long || o.short;
	o.description = o.description || null;
	o.hidden = !!o.hidden;
	o.aliases = o.aliases || null;

	//Clean up
	if (o.flag){
		delete o.reviver;
		delete o.default;
		delete o.optional;
		delete o.type;
		delete o.choices;
		o.negate = !!o.negate;
		o.default = o.negate;
	}else{
		o.type = o.type || String;
		o.optional = !!o.optional;
		o.reviver = o.reviver || null;
		o.choices = o.optional ? null : o.choices || null;
		delete o.negate;

		if (o.default === undefined){
			if (o.type === Number){
				o.default = 0;
			}else if (o.type === Boolean){
				o.default = false;
			}else if (o.type === Array){
				o.default = [];
			}else{
				o.default = null;
			}
		}
	}

	//Store the option
	this._lines.push (o);
	this._options[o.id] = o;

	//Shortcuts
	if (o.short) this._optionsShort[o.short] = o;
	if (o.long) this._optionsLong[o.long] = o;

	if (o.aliases){
		var me = this;
		o.aliases.forEach (function (alias){
			//Aliases are always long names
			me._options[alias] = me._optionsLong[alias] = o;
		});
	}
};

Argp.prototype._default = function (){
	var me = this;
	this._lines.forEach (function (o){
		if (o.text || o.columns || o.arg) return;
		me._argv[o.id] = o.default;
	});
	for (var p in this._arguments){
		this._argv[p] = this._arguments[p].trailing ? [] : false;
	}
};

Argp.prototype.allowUndefinedArguments = function (){
	this._allowUndefinedArguments = true;
	return this;
};

Argp.prototype.allowUndefinedOptions = function (){
	this._allowUndefinedOptions = true;
	return this;
};

Argp.prototype.arguments = function (){
	return this._arguments;
};

Argp.prototype.argv = function (input){
	//The Argp and Command instances execute this code

	var argv = input || process.argv.slice (debug ? 3 : 2);
	//The command name is always the first parameter
	var commandName = argv[0];
	var command = this._commandInstances[commandName];
	var instance;
	var o;
	var scriptStr = script;

	//Check whether the input data belongs to the main parser or to a command
	if (command){
		instance = command;

		script += " " + commandName;
		o = command._argv = {};

		//Store the first argument
		command._argv[commandName] = [];
		if (command._trailing){
			command._currentArgument = {
				name: commandName,
				trailing: command._trailing
			};
		}

		argv.shift ();
	}else{
		instance = this;
		o = this._argv = {};
	}

	//Add the version option if readPackage() was used (last option)
	if (instance._packageVersion){
		instance._option ({
			short: "v",
			long: "version",
			description: "Output version information and exit"
		});
	}

	//Set default values
	instance._default ();

	instance.emit ("start", instance._argv);

	//Read options
	instance._read (argv);

	//Emit arguments if sort is enabled
	if (instance._sort){
		instance._emitArguments = true;
		instance._argumentsArray.forEach (function (str){
			instance._newArgument (str);
		});
	}

	var end = instance.listeners ("end")[0];

	if (input){
		script = scriptStr;
		//The messages are created each time the function is called
		if (end) end (o, {
			printHelp: instance._printHelpBound,
			printUsage: instance._printUsageBound,
			printVersion: instance._printVersionBound,
			fail: instance._failBound,
		});
		return o;
	}

	//Uncache modules because this module is not going to be used anymore
	["index.js", "command.js", "argp.js", "body.js", "error.js", "wrap.js"]
	.forEach (function (filename){
		delete require.cache[__dirname + path.sep + filename];
	});

	var fns;
	
	if (end && end.length === 2){
		var helpString = instance._createHelp ();
		var usageString = instance._createUsage ();
		var versionString = instance._createVersion ();
		var fail = instance._createFail ();
		
		fns = {
			printHelp: function (){
				console.log (helpString);
				process.exit (0);
			},
			printUsage: function (){
				console.log (usageString);
				process.exit (0);
			},
			printVersion: function (){
				if (versionString) console.log (versionString);
				process.exit (0);
			},
			fail: function (str, code){
				console.error (fail.message, str);
				process.exit (code || fail.code);
			}
		};
	}

	//The user may have a reference to the module so the whole module (the Argp
	//instance) should be also freed
	for (var p in instance){
		delete instance[p];
	}

	//Call a simple function in order to free the instance and avoid memory leaks
	//(the user cannot store the pointer "this")
	if (end) end (o, fns);

	return o;
};

Argp.prototype.body = function (){
	this._lines = [];
	return new Body (this);
};

Argp.prototype.columns = function (n){
	this._columns = n < 32 ? 80 : n
	return this;
};

Argp.prototype.command = function (name, o){
	if (this._commands[name]){
		throw new ArgpError ("The command \"" + name + "\" is already defined");
	}

	var c = this._commandInstances[name] = new Command (this, name, o);

	//Create the shortcuts
	this._commands[name] = {
		arguments: c._arguments,
		options: c._options
	};

	return c;
};

Argp.prototype.commands = function (){
	return this._commands;
};

Argp.prototype.description = function (str){
	this._description = str;
	return this;
};

Argp.prototype.email = function (str){
	this._email = str;
	return this;
};

Argp.prototype.exitStatus = function (code){
	this._exitStatus = code;
	return this;
};

Argp.prototype._createFail = function (str){
	var msg = script + ": " + (str || "%s");
	var error = this._errorTry ();
	if (error){
		msg +=  "\n" + error;
	}
	return {
		message: msg,
		code: this._exitStatus
	};
};

Argp.prototype.fail = function (str, code){
	var fail = this._createFail (str);
	console.error (fail.message);
	process.exit (code || fail.code);
};

Argp.prototype.main = function (){
	//Better visual organization
	return this;
};

Argp.prototype.readPackage = function (p){
	try{
		var json = JSON.parse (fs.readFileSync (p || "package.json",
				{ encoding: "utf8" }));
		if (json.description){
			this._description = json.description;
		}
		if (json.version){
			//The option is added in argv()
			this._version = "v" + json.version;
			this._packageVersion = true;
		}
		if (json.author){
			if (json.author.email){
				this._email = json.author.email;
			}else{
				var res = this._rePackageEmail.exec (json.author.name || json.author);
				if (res){
					this._email = res[1];
				}
			}
		}
	}catch (e){
		if (e instanceof SyntaxError) throw new ArgpError ("JSON SyntaxError: " +
				e.message);
		if (p) throw new ArgpError (e);
	}

	return this;
};

Argp.prototype.options = function (filter){
	if (filter){
		if (filter.short) return this._optionsShort;
		if (filter.long) return this._optionsLong;
	}
	return this._options;
};

Argp.prototype.sort = function (){
	this._sort = true;
	return this;
};

Argp.prototype.usages = function (arr){
	this._usages = arr;
	return this;
};

var Body = require ("./body");
var Command = require ("./command");