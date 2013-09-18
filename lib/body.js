"use strict";

var ArgpError = require ("./error");

var Body = module.exports = function (argp){
	this._argp = argp;
	this._reWhitespace = /\s/;
};

Body.prototype.argument = function (name, o){
	if (this._reWhitespace.test (name)){
		throw new ArgpError ("The argument canot contain white space characters");
	}
	if (this._argp._arguments[name]){
		throw new ArgpError ("The argument \"" + name + "\" is already defined");
	}
	this._argp._argument (name, o);
	return this;
};

Body.prototype.end = function (){
	return this._argp;
};

Body.prototype.group = function (str){
	//Group lines are pushed to the options array to maintain the insertion order
	this._argp._option ({
		group: str
	});
	return this;
};

Body.prototype.help = function (){
	this._argp._showHelp = true;
	this._argp._option ({
		short: "h",
		long: "help",
		description: "Display this help message and exit"
	});
	return this;
};

Body.prototype.option = function (o){
	if (!o.long && !o.short) throw new ArgpError ("At least a long name " +
			"must be configured");
	
	if (o.negate && o.short) throw new ArgpError ("Cannot configure a short " +
			"name if the option is a negative flag");
			
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
		if (o.short.length > 1){
			throw new ArgpError ("The short name must be a single character");
		}
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
	this._argp._option ({
		text: str
	});
	return this;
};

Body.prototype.usage = function (){
	this._argp._showUsage = true;
	this._argp._option ({
		long: "usage",
		description: "Display a short usage message and exit"
	});
	return this;
};

Body.prototype.version = function (str){
	this._argp._version = str;
	this._argp._option ({
		short: "v",
		long: "version",
		description: "Output version information and exit"
	});
	return this;
};