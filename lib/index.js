"use strict";

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

module.exports = function (){
	
};