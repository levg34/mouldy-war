canvas = {
	const context = DOM.context2d(width, height);
	const particles = Array.from({length: n}, () => [Math.random() * width, Math.random() * height]);

	function update() {
		const delaunay = new d3.Delaunay.from(particles);
		const voronoi = delaunay.voronoi([0.5, 0.5, width - 0.5, height - 0.5]);
		context.clearRect(0, 0, width, height);

		context.beginPath();
		delaunay.render(context);
		context.strokeStyle = "#ccc";
		context.stroke();

		context.beginPath();
		voronoi.render(context);
		voronoi.renderBounds(context);
		context.strokeStyle = "#000";
		context.stroke();

		context.beginPath();
		delaunay.renderPoints(context);
		context.fill();
	}

	context.canvas.ontouchmove = 
	context.canvas.onmousemove = event => {
		event.preventDefault();
		particles[0] = [event.layerX, event.layerY];
		update();
	};

	update();

	return context.canvas;
}