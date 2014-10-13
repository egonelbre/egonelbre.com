
function clone(obj){
	if(typeof(obj) != "object")
		return obj;
	var result = {};
	for(var i in obj)
		result[i] = clone(obj[i]);
	return result;
}

function foreach(obj, f){
	if(obj instanceof Array){
		for(var i = 0; i < obj.length; i += 1){
			f(obj[i], i, obj);
		};
	} else {
		for(var name in obj){
			if(!obj.hasOwnProperty(name)) continue;
			f(obj[name], name, obj);
		};
	}
}