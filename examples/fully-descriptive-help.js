"use strict";

process.argv = ["node", __filename, "-h"];

require ("../lib")
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
				.paragraph ("This is a random paragraph. You can add descriptive " +
						"messages very easily with the paragraph() function.\nRemember " +
						"that all the messages are line-wrapped at 80 columns and you " +
						"can use \\n to split them in multiple lines...")
				.paragraph ("...or if you want to print a new paragraph use the " +
						"paragraph() function again.")
				.line ("Line messages differs from paragraph messages in that")
				.line ("they begin in a new line (\\n) and paragraphs")
				.line ("begin in a new paragraph (\\n\\n)")
				.paragraph ("Do you still need more printing functions? Check this:")
				.columns ("  this is column 1", "This is a multiline in\ncolumn 2")
				.group ("Informational options")
				.help ()
				.version ("v1.2.3")
				.paragraph ("The program exits with a status code of 0 if no error, " +
						"otherwise 1.")
				.end ()
		.argv ();

/*
Usage: fully-descriptive-help [OPTIONS] [ARGUMENTS]

Sample app.

 Group 1:
  arg1                        aaaa
  arg2                        bbbb

 Group 2:
  -a, --aa                    aaaa
  -b, --bb                    bbbb

This is a random paragraph. You can add descriptive messages very easily with
the paragraph() function.
Remember that all the messages are line-wrapped at 80 columns and you can use \n
to split them in multiple lines...

...or if you want to print a new paragraph use the paragraph() function again.
Line messages differs from paragraph messages in that
they begin in a new line (\n) and paragraphs
begin in a new paragraph (\n\n)

Do you still need more printing functions? Check this:
  this is column 1            This is a multiline in
                                column 2

 Informational options:
  -h, --help                  Display this help message and exit
  -v, --version               Output version information and exit

The program exits with a status code of 0 if no error, otherwise 1.

Report bugs to <a@b.c>.
*/