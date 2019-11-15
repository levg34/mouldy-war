var svg = d3.select('#svg1').append('svg')

function drawPoint(x,y,color) {
	svg.append('circle')
		.attr('cx',x)
		.attr('cy',y)
		.attr('r',5)
		.style('fill', color)
}
	
function quadrille(a,L) {
	for (var n=1; n*a<L; n++) {
		for (var m=1;2*a*n-m*a>0;m++) {
			if (m*a < L && 2*a*n-m*a < L)
				drawPoint(m*a,2*a*n-m*a,'lightgrey')
		}
	}
}

drawPoint(150,150,'red')
quadrille(20,300)