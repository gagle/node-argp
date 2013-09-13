"use strict";

process.argv = ["node", __filename, "-h"];

var argp = require ("../lib");

/*
Things you can configure and show with the help message:
- Version
- Description
- Email
- Usages
- Options
- Arguments
- Groups
- Text

The last two things are used to fully customize the body of the help message.
The body is printed after the description and before the email, and it contains
the options, groups and text. The only difference between a group and a text is
the indentation: the group is indented with one space and the text has no
indention.
*/

argp
		.configuration ({
			showHelp: true
		})
		.version ("v1.2.3")
		.description ("Sample app.")
		.email ("a@b.c")
		.argument ("arg1")
		.argument ("arg2")
		.body (function (body){
			//The configuration has an insertion order
			body
					.group ("Group 1")
					.option ({ short: "a", long: "aa", description: "aaaa" })
					.option ({ short: "b", long: "bb", description: "bbbb" })
					.text ("This is a random text. You can add descriptive messages " +
							"very easily with the text() function.\nRemember that all the " +
							"messages are line-wrapped at 80 columns and you can use \\n " +
							"to split them in multiple lines...")
					.text ("...or if you want to print a new paragraph use the text() " +
							"function")
					.group ("Informational options")
		})
		.argv ();

/*
Usage: fully-descriptive-help.js [OPTIONS] [ARGUMENTS]

Sample app.

 Group 1:
  -a, --aa                    aaaa
  -b, --bb                    bbbb

This is a random text. You can add descriptive messages very easily with the
text() function.
Remember that all the messages are line-wrapped at 80 columns and you can use \n
to split them in multiple lines...

...or if you want to print a new paragraph use the text() function

 Informational options:
  -h, --help                  Display this help and exit
  -v, --version               Output version information and exit

Report bugs to <a@b.c>.
*/