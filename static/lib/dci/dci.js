function ContextMacro(init, roles) {
	
	// closure for scoping things 
	var sfn = "(function(){\n";
	
	// scoped role players
	sfn += "  var " + Object.keys(roles).join(",") + ";\n";
	
	// creates the function  
	var mkName = function(role, fn){ return role + "$" + fn; };  
	
	// redirects all role method calls
	var fixMethod = function(fn){
		fn = fn.toString();
		for(var roleName in roles){
			var role = roles[roleName];
			for(var fnName in role){
				// replaces Role.method(arg1,arg2,arg3) with
				//     with Role$method.call(Role, arg1, arg2, arg3)
				var rx = new RegExp( "(?!\\.)" + roleName + "\\s*\\.\\s*" + fnName + "\\s*\\(", "g");
				fn = fn.replace(rx,  mkName(roleName, fnName) + ".call(" + roleName + ",");
			}
		}
		// hack-fix Role$method.call(Arg,)
		fn = fn.replace(/,\)/g, ")");
		return fn;
	};
	
	// define role methods in to the context
	var methods = [];
	for(var roleName in roles){
		var role = roles[roleName];
		for(var fnName in role){
			methods.push("  var " + mkName(roleName, fnName) + " = " 	+ fixMethod(role[fnName]));
		}
	}
	sfn += methods.join(";\n") + ";\n";
	
	// call the init
	sfn += "  return (" + fixMethod(init) + ").apply(null, arguments);\n})";
	return sfn;
};

function Context(init, roles, debug){
	// scoped role players
	var sfn = "  var " + Object.keys(roles).join(",") + ";\n";
	// creates the function
	var mkName = function(role, fn){ return role + "$" + fn; };  
	// redirects all role method calls
	var fixMethod = function(fn){
		fn = fn.toString();
		for(var roleName in roles){
			var role = roles[roleName];
			for(var fnName in role){
				// replaces Role.method(arg1,arg2,arg3) with
				//     with Role$method.call(Role, arg1, arg2, arg3)
				var rx = new RegExp( "(?!\\.)" + roleName + "\\s*\\.\\s*" + fnName + "\\s*\\(", "g");
				fn = fn.replace(rx,  mkName(roleName, fnName) + ".call(" + roleName + ",");
			}
		}
		// hack-fix Role$method.call(Arg,)
		fn = fn.replace(/,\)/g, ")");
		return fn;
	};
	// define role methods in to the context
	var methods = [];
	for(var roleName in roles){
		var role = roles[roleName];
		for(var fnName in role){
			methods.push("  var " + mkName(roleName, fnName) + " = "  + fixMethod(role[fnName]));
		}
	}
	sfn += methods.join(";\n") + ";\n";
	// return the init
	sfn += "  return (" + fixMethod(init) + ").apply(null, arguments);";

	if(debug){ 
		console.log(sfn);
	}
	return (new Function(sfn));
}

function CompileDCI(source){
	return ProcessMacros(source, {Context : ContextMacro});
};
