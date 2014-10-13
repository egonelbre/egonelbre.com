/* Simple ObjectMap implementation, since javascript doesn't have one */
function ObjectMap(){
	this.items = [];
};

ObjectMap.prototype = {
	indexOf : function(key){
		for(var i = 0; i < this.items.length; i += 1){
			if(this.items[i].key == key)
				return i;
		}
		return -1;
	},
	put : function(key, value){
		var i = this.indexOf(key);
		if(i >= 0){
			this.items[i].value = value;
		} else {
			this.items.push({key:key, value:value});
		}
	},
	has : function(key){
		return this.indexOf(key) >= 0;
	},
	remove : function(key){
		var i = this.indexOf(key);
		if(i >= 0){
			this.items.splice(i,1);
		}
	},
	get : function(key){
		var i = this.indexOf(key);
		if(i >= 0){
			return this.items[i].value;
		}
	},
	map : function(fn){
		var result = [];
		for(var i = 0; i < this.items.length; i += 1){
			var item = this.items[i];
			result[i] = fn(item.key, item.value);
		}
		return result;
	},
	isEmpty : function(){
		return this.items.length === 0;
	},
	size : function(){
		return this.items.length;
	}
};