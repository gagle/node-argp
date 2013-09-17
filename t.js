require ("./lib")
		.columns (80)
		.sort ()
		.allowUndefinedArguments ()
		.allowUndefinedOptions ()
		.description ("description")
		.email ("a@b.c")
		.usages ([
			"asd",
			"qwe"
		])
		.body ()
			.text ("text")
			.group ("group 1")
			.argument ("arg1", { description: "aaaa" })
			.argument ("arg2", { description: "bbbb" })
			.group ("group 2")
			.option ({ short: "a", long: "aa", description: "aaaa" })
			.option ({ short: "b", long: "bb", description: "bbbb" })
			.text ("text\ntext\text")
			.group ("group 3")
			.help () //Enables -h, --help
			.usage () //Enables -u, --usage
			.version ("v1.2.3") //Enables -v, --version
			.text ("text")
		.argv ();

/*
node t.js --help

Usage: node t.js [OPTIONS] asd
       node t.js [OPTIONS] qwe

description

text

 group 1:
  arg1                        aaaa
  arg1                        bbbb

 group 2:
  -a, --aa                    aaaa
  -b, --bb                    bbbb

text
text
text

 group 3:
  -h, --help                  Display this help message and exit
      --usage                 Display a short usage message and exit
  -v, --version               Output version information and exit

text

Report bugs to <a@b.c>.
*/