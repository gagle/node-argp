"use strict";

process.argv = ["node", __filename, "-h"];

var argp = require ("../lib");

/*
Things you can configure and show in the help message:
- Version
- Description
- Email
- Usages
- Options
- Arguments
- Groups
- Text

The groups and text are used to fully customize the body of the help message.
The body is printed after the description and before the email, and it contains
the options, arguments, groups and text.
*/

argp
		.description ("Sample app.")
		.email ("a@b.c")
		.body ()
				//The configuration has an insertion order
				.group ("Group 1")
				.argument ("arg1", { description: "aaaa" })
				.argument ("arg2", { description: "bbbb" })
				.group ("Group 2")
				.option ({ short: "a", long: "aa", description: "aaaa" })
				.option ({ short: "b", long: "bb", description: "bbbb" })
				.text ("This is a random text. You can add descriptive messages " +
						"very easily with the text() function.\nRemember that all the " +
						"messages are line-wrapped at 80 columns and you can use \\n " +
						"to split them in multiple lines...")
				.text ("...or if you want to print a new paragraph use the text() " +
						"function again.")
				.group ("Informational options")
				.help ()
				.version ("v1.2.3")
				.text ("The program exits with a status code of 0 if no error, " +
						"otherwise 1.")
				.end ()
		.argv ();

/*
Usage: fully-descriptive-help.js [OPTIONS] [ARGUMENTS]

Sample app.

 Group 1:
  arg1                        aaaa
  arg2                        bbbb

 Group 2:
  -a, --aa                    aaaa
  -b, --bb                    bbbb

This is a random text. You can add descriptive messages very easily with the
text() function.
Remember that all the messages are line-wrapped at 80 columns and you can use \n
to split them in multiple lines...

...or if you want to print a new paragraph use the text() function again.

 Informational options:
  -h, --help                  Display this help message and exit
  -v, --version               Output version information and exit

The program exits with a status code of 0 if no error, otherwise 1.

Report bugs to <a@b.c>.
*/