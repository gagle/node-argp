"use strict";

var Command = require ("./command");
var ArgpError = require ("./error");

var Body = module.exports = function (instance){
	this._instance = instance;
	this._reWhitespace = /\s/;
};

Body.prototype.argument = function (name, o){
	if (this._reWhitespace.test (name)){
		throw new ArgpError ("The argument canot contain white space characters");
	}
	if (this._instance._arguments[name]){
		throw new ArgpError ("The argument \"" + name + "\" is already defined");
	}
	o = o || {};
	if (this._instance._command){
		Command._validateTrailing (o.trailing);
	}
	this._instance._argument (name, o);
	return this;
};

Body.prototype.argv = function (){
	return this._instance.argv ();
};

Body.prototype.columns = function (col1, col2){
	this._instance._option ({
		columns: [col1, col2]
	});
	return this;
};

Body.prototype.command = function (){
	return this._instance.command.apply (this._instance, arguments);
};

Body.prototype.help = function (){
	this._instance._showHelp = true;
	this._instance._option ({
		short: "h",
		long: "help",
		description: "Display this help message and exit"
	});
	return this;
};

Body.prototype.main = function (){
	return this._instance.main.apply (this._instance, arguments);
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
		for (var p in this._instance._optionsLong){
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
		for (var p in this._instance._optionsShort){
			if (p === o.short){
				throw new ArgpError ("The short name \"" + o.short +
						"\" is already defined");
			}
		}
	}
	
	if (o.aliases){
		var me = this;
		o.aliases.forEach (function (alias){
			//Cannot be already defined
			if (alias === o.long) throw new ArgpError ("The alias name \"" + alias +
							"\" is already defined");
			
			for (var p in me._instance._optionsLong){
				if (p === alias){
					throw new ArgpError ("The alias name \"" + alias +
							"\" is already defined");
				}
			}
		});
	}
	
	this._instance._option (o);
	
	return this;
};

Body.prototype.text = function (str, prefix){
	this._instance._option ({
		text: str,
		prefix: prefix
	});
	return this;
};

Body.prototype.usage = function (){
	this._instance._showUsage = true;
	this._instance._option ({
		long: "usage",
		description: "Display a short usage message and exit"
	});
	return this;
};

Body.prototype.version = function (str){
	this._instance._packageVersion = false;
	this._instance._version = str;
	this._instance._option ({
		short: "v",
		long: "version",
		description: "Output version information and exit"
	});
	return this;
};