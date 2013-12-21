"use strict";

/*
This example shows 2 types of aliases:
- Pure aliases: They are just a different name which points to the same option.
- Defined aliases: They have their own option definition but they are related
  with other options.

Say we have a --dot option. We want to also use the --point name to refer to the
same option. By default it prints one dot. If we want to print an ellipsis we
can pass the value of 3 or we can define an --ellipsis flag. When it is enabled
it prints 3 dots.

--point is a pure alias and --ellipsis is a defined alias.
*/

var argv = require ("../lib").createParser ({ once: true })
    .on ("end", function (argv){
      if (argv.ellipsis) argv.dot = 3;
    })
    .body ()
        .option ({
          short: "d",
          long: "dot",
          aliases: ["point"],
          metavar: "N",
          optional: true,
          default: 1,
          type: Number,
          description: "Print N dots, default is 1"
        })
        .option ({
          long: "ellipsis",
          description: "Print 3 dots, same as --dots=3"
        })
    .argv ();

console.log (argv);

/*
$ node aliases.js --po 2 # The aliases can be also abbreviated

{
  dot: 2,
  ellipisis: false
}

--------------------------------------------------------------------------------

$ node aliases.js --ellipsis

{
  dot: 3,
  ellipisis: true
}
*/