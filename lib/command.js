"use strict";

var util = require ("util");
var Argp = require ("./argp");

var Command = module.exports = function (argp, o){
	Argp.call (this);
	
	o = o || {};
	this._argp = argp;
	this._trailing = o.trailing;
};

util.inherits (Command, Argp);

//Forward calls to the main Argp instance
Command.prototype.argv = function (){
	return this._argp.argv.call (this._argp);
};

//Forward calls to the main Argp instance
Command.prototype.command = function (){
	return this._argp.command.apply (this._argp, arguments);
};

//Forward calls to the main Argp instance
Command.prototype.commands = function (){
	return this._argp.commands.apply (this._argp, arguments);
};

Command.prototype.main = function (){
	return this._argp;
};

Command.prototype.parse = function (argv, o){
	
};