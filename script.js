var svg = d3.select('#svg1').append('svg')

function drawPoint(x,y) {
	svg.append("circle")
		.attr("cx",x)
		.attr("cy",y)
		.attr("r",5);
}
	
function quadrille(a,L) {
	for (var n=1; n*a<L; n++) {
		for (var m=1;2*a*n-m*a>0;m++) {
			drawPoint(m*a,2*a*n-m*a)
		}
	}
}

drawPoint(20,150)
quadrille(20,150)