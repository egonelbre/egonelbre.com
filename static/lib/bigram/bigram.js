function Node(token, priority){
    this.left = null;
    this.right = null;
    this.scope = null;
    this.ltr = false;
    this.token = token || null;
    this.priority = priority || null;
}

Node.prototype.toString = function(){
    if(!this.scope && !this.left && !this.right )
        return this.token;
    if(this.scope && !this.left && !this.right)
        return this.scope.toString();
    var result = "";
    result += "("  + this.token;
    if( this.scope )
        result += " `" + this.scope.toString();
    if( this.left )
        result += " " + this.left.toString();
    if( this.right )
        result += " " + this.right.toString();
    result += ")";
    return result;
};

/* =================================================== */

function find(root, node){
    var parent = root;
    
    if( node.ltr ){
        while(  (parent.right !== null) && 
                (parent.right.priority > node.priority))
            parent = parent.right;
        return parent;
    } else {
        while(  (parent.right !== null) && 
                (parent.right.priority >= node.priority) )
            parent = parent.right;
    }

    return parent;
}

function add(root, node){
    var parent = find(root, node);
    var tmp = parent.right;
    parent.right = node;
    node.left = tmp;
}

function parse(next, input){
    var root = new Node("root", Infinity);
    while( input.length > 0 ){
        var node = new Node(),
            token = next(root, input);

        node.token    = token.name;
        node.priority = token.priority;
        node.ltr      = token.ltr;
        
        if(token.scope)
            node.scope = parse(token.scope, input);
        if(token.exit)
            break;

        add(root, node);
    }
    return root.right;
}
