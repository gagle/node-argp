"use strict";

//Based on Apache Commons WordUtils's wrap() function

module.exports = function (str, columns, prefix, prefixAlways){
	prefix = prefix || "";
	var lines = "";
	var first = true;
	var newColumns = columns - prefix.length;
	if (prefixAlways){
		columns = newColumns;
	}
	
	str.split (/\r\n|\n/).forEach (function (line){
		var lineLength = line.length;
		var offset = 0;
		var wrapOffset;
		
		while (lineLength - offset > columns){
			if (prefixAlways || !first) lines += prefix;
			
			if (line[offset] === " "){
				offset++;
				continue;
			}
			
			wrapOffset = line.lastIndexOf (" ", columns + offset);
			if (wrapOffset >= offset){
				lines += line.substring (offset, wrapOffset) + "\n";
				offset = wrapOffset + 1;
			}else{
				wrapOffset = line.indexOf (" ", columns + offset);
				if (wrapOffset >= 0){
					lines += line.substring (offset, wrapOffset) + "\n";
					offset = wrapOffset + 1;
				}else{
					lines += line.substring (offset);
					offset = lineLength;
				}
			}
			
			if (!prefixAlways && first){
				columns = newColumns;
				first = false;
			}
		}
		
		lines += (!prefixAlways && first ? "" : prefix) +
				line.substring (offset) + "\n";
		first = false;
	});
	
	return lines.substring (0, lines.length - 1);
};