"use strict";

var ArgpError = module.exports = function (msg){
	var error = Error.call (this, typeof msg === "object" ? msg.message : msg);
	Error.captureStackTrace (error, this.constructor);
	Object.defineProperty (error, "name", {
		enumerable: false,
		value: "ArgpError"
	});
	return error;
};