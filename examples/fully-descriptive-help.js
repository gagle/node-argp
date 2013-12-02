"use strict";

require ("../lib").createParser ({ once: true })
		.description ("Sample app.")
		.footer ("The program exits with a status code of 0 if no error, " +
				"otherwise 99.")
		.email ("a@b.c")
		.exitStatus (99)
		.body ()
				.text (" Group 1:")
				.argument ("arg1", { description: "aaaa" })
				.argument ("arg2", { description: "bbbb" })
				.text ("\n Group 2:")
				.option ({ short: "a", long: "aa", description: "aaaa" })
				.option ({ short: "b", long: "bb", description: "bbbb" })
				.text ("\nThis is a multiline text.\nRemember that all the messages " +
						"are line-wrapped at 80 columns and you can use \\n to split " +
						"them in multiple lines.\n")
				.text ("You can prefix the lines with any string. This is useful " +
						"when you need to indent the lines or quote messages.", "> ")
				.text ("\nList: (column 1 cannot contain \\n)")
				.columns ("  this is column 1", "This is a multiline in\ncolumn 2")
				.text ("\n Informational options:")
				.help ()
				.version ("v1.2.3")
		.argv ();

/*
$ node fully-descriptive-help.js --help

Usage: fully-descriptive-help [options] [arguments]

Sample app.

 Group 1:
  arg1                        aaaa
  arg2                        bbbb

 Group 2:
  -a, --aa                    aaaa
  -b, --bb                    bbbb

This is a multiline text.
Remember that all the messages are line-wrapped at 80 columns and you can use \n
to split them in multiple lines.

> You can prefix the lines with any string. This is useful when you need to
> indent the lines or quote messages.

List: (column 1 cannot contain \n)
  this is column 1            This is a multiline in
                                column 2

 Informational options:
  -h, --help                  Display this help message and exit
  -v, --version               Output version information and exit

The program exits with a status code of 0 if no error, otherwise 1.

Report bugs to <a@b.c>.
*/