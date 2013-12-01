"use strict";

var Argp = require ("./argp");

module.exports.createParser = function (options){
	return new Argp (options);
};