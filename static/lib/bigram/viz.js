guid = (function(){
	var id = 0;
	return function(){return id++;}
})();

var vis = d3.select("viz")
			.append("svg")
			.attr("width", size.x)
			.attr("height", size.y)
		  .append("svg:g")
			.attr("transform", "translate(30,30)");

var tree = d3.layout.tree()
			.size([size.x-60, size.y-60])
			.children(getChildren);

var diagonal = d3.svg.diagonal();

function updateViz(){
	// Compute the new tree layout. We'll stash the old layout in the data.
	var nodes = tree(root);

	// Update the nodes ...
	var node = vis.selectAll("g.node")
	  .data(nodes, nodeId);

	// Enter any new nodes at the parent's previous position.
	var news = node.enter().append("svg:g")
		.attr("class", "node")
		.attr("transform", parentPosition);

	news.append("svg:circle")
		.style("fill", "#0f0")
		.attr("r", 13);

	news.append("svg:text")
		.attr("y", 3)
		.attr("text-anchor", "middle")
		.text(getName);

	var updates = node.transition()
		.duration(speed)
		.style("opacity", 1)
		.attr("transform", actualPosition);

	updates.select("circle")
		.style("fill", "#fff");

	var exits = node.exit().transition()
		.duration(speed)
		.style("opacity", 1e-6)
		.remove();

	var link = vis.selectAll("path.link")
		.data(tree.links(nodes), linkId);

	link.enter().insert("svg:path", "g")
		.attr("class", "link")
		.style("stroke", linkColor)
		.style("opacity", 1e-6)
		.attr("d", parentDiagonal);

	link.transition()
		.duration(speed)
		.style("stroke", linkColor)
		.style("opacity", 1)
		.attr("d", diagonal);

	link.exit().transition()
		.duration(speed)
		.style("opacity", 1e-6)
		.remove();
}

function nodeId(d){ 
	if(!d.data.id)
		d.data.id = guid();
	return d.data.id
}

function linkId(d){	return d.target.data.id; }

function parentPosition(d){
	if(!d.parent)
		return "translate(" + size.x/2 + "," + 0 + ")";
	return "translate(" + size.x + "," + d.parent.y + ")";
}

function actualPosition(d){
	return "translate(" + d.x + "," + d.y + ")";
}

function parentDiagonal(d) {
	var o = {x: d.source.x, y: d.source.y};
	return diagonal({source: o, target: o});
}

function _add(r, node){
	if(!node) return;
		r.push(node);
}

function getChildren(data){
	if(!data)
		return null;
	if(!data.left && !data.right && !data.scope)
		return null;
	var r = [];
	_add(r, data.left);
	_add(r, data.scope);
	_add(r, data.right);
	return r;
}
