

function ProcessMacros(source, macros){
	var rxMacro = RegExp("([a-zA-Z0-9_]+)\\(@([^@]*)@\\)", "g");
	return source.replace(rxMacro, function(match, macroName, args, offset, full){
		var macro = macros[macroName];
		if(macro === undefined){
			throw new Error("No macro named: '" + macroName + "'");
		}
		return eval("(" + macro.toString() + ")(" + args + ");");
	});
};