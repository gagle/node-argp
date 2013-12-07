"use strict";

//Configure the main menu
var parser = require ("../../lib").createParser ({ once: true });

parser
    //main() is optional, no-op, just for a better visual organization
    .main ()
        .on ("end", function (argv){
          if (argv.l){
            fullInfo ();
          }else{
            this.printHelp ();
          }
        })
        .usages (["npm <command>"])
        .body ()
            .text ("Where command is one of:")
            .text ("config, install, whoami\n", "  ")
            .columns ("npm <command> --help", "Quick help on <command>")
            .text ("\n Options:")
            .option ({ short: "l", description: "Display full usage info" })
            .help ()
            .version ("v1.2.3");

//Configure comands
require ("./config")(parser);
require ("./install")(parser);
require ("./whoami")(parser);

//Start the parser
parser.argv ();

//Free the parser!
parser = null;

function fullInfo (){
  //Code...
  console.log ("full usage info");
  process.exit (0);
};