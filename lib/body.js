"use strict";

var Command = require ("./command");

var Body = module.exports = function (instance){
  this._instance = instance;
  this._reWhitespace = /\s/;
};

Body.prototype.argument = function (name, o){
  if (this._reWhitespace.test (name)){
    throw new Error ("The argument canot contain white space characters");
  }
  if (this._instance._arguments[name]){
    throw new Error ("The argument \"" + name + "\" is already defined");
  }
  o = o || {};
  if (this._instance._command){
    Command._validateTrailing (o.trailing);
  }
  this._instance._argument (name, o);
  return this;
};

Body.prototype.argv = function (input){
  return this._instance.argv (input);
};

Body.prototype.columns = function (col1, col2){
  this._instance._option ({
    columns: [col1, col2]
  });
  return this;
};

Body.prototype.command = function (name, o){
  return this._instance.command.call (this._instance, name, o);
};

Body.prototype.help = function (o){
  this._instance._showHelp = true;
  var short = !(o && o.short === false);
  var opt = {};
  if (short) opt.short = "h";
  opt.long = "help";
  opt.description = "Display this help message";
  if (!this._instance.listeners ("error").length){
    opt.description += " and exit";
  }
  this._instance._option (opt);
  return this;
};

Body.prototype.main = function (){
  return this._instance.main.call (this._instance);
};

Body.prototype.option = function (o){
  if (!o.long && !o.short) throw new Error ("At least a long name must be " +
      "configured");
      
  if (o.long){
    //Long names cannot contain whitespaces
    if (this._reWhitespace.test (o.long)){
      throw new Error ("The long name canot contain whitespace characters");
    }
    //Cannot be already defined
    for (var p in this._instance._optionsLong){
      if (p === o.long){
        throw new Error ("The long name \"" + o.long + "\" is already defined");
      }
    }
  }
  
  if (o.short){
    if (o.short.length > 1){
      throw new Error ("The short name must be a single character");
    }
    //Short names must be alphanumeric characters
    var code = o.short.charCodeAt (0);
    if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122))){
      throw new Error ("The short name must be an alphanumeric character");
    }
    //Cannot be already defined
    for (var p in this._instance._optionsShort){
      if (p === o.short){
        throw new Error ("The short name \"" + o.short + "\" is already " +
            "defined");
      }
    }
  }
  
  if (o.aliases){
    var me = this;
    o.aliases.forEach (function (alias){
      //Cannot be already defined
      if (alias === o.long) throw new Error ("The alias name \"" + alias +
              "\" is already defined");
      
      for (var p in me._instance._optionsLong){
        if (p === alias){
          throw new Error ("The alias name \"" + alias + "\" is already " +
              "defined");
        }
      }
    });
  }
  
  this._instance._option (o);
  
  return this;
};

Body.prototype.text = function (str, prefix){
  this._instance._option ({
    text: str,
    prefix: prefix
  });
  return this;
};

Body.prototype.usage = function (){
  this._instance._showUsage = true;
  var opt = {
    long: "usage",
    description: "Display a short usage message"
  };
  if (!this._instance.listeners ("error").length){
    opt.description += " and exit";
  }
  this._instance._option (opt);
  return this;
};

Body.prototype.version = function (str, o){
  this._instance._packageVersion = false;
  this._instance._version = str + "";
  var short = !(o && o.short === false);
  var opt = {};
  if (short) opt.short = "v";
  opt.long = "version";
  opt.description = "Output version information";
  if (!this._instance.listeners ("error").length){
    opt.description += " and exit";
  }
  this._instance._option (opt);
  return this;
};