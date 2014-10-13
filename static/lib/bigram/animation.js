function Animation(next, input){
    this.input = input;
    this.nexts = [next];
    this.roots = [new Node("root", Infinity)];
}

Animation.prototype.step = function() {
    if(this.nexts.length <= 0)
        return false;
    if(this.input.length <= 0)
        return false;

    var next = this.nexts[this.nexts.length-1],
        root = this.roots[this.roots.length-1];

    var node = new Node(),
        token = next(root, this.input);

    node.token = token.name;
    node.priority = token.priority;
    node.ltr = token.ltr;

    if(token.exit){
        if(root.parent)
            root.parent.scope = root.right;
        this.nexts.pop();
        this.roots.pop();
        return true;
    }

    add(root, node);

    if(token.scope){
        this.nexts.push(token.scope);
        var sub = new Node("$", Infinity);
        sub.parent = node;
        this.roots.push(sub);
        node.scope = sub;
    }

    return true;
};
