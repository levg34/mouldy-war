function quadrille(cote,hauteur,largeur) {
	if (!largeur) largeur = hauteur
	var res = []
	for (var n=1; n*cote<Math.max(largeur,hauteur); n++) {
		for (var m=1;2*cote*n-m*cote>0;m++) {
			if (m*cote < largeur && 2*cote*n-m*cote < hauteur) {
				res.push([m*cote,2*cote*n-m*cote])
			}
		}
	}
	return res
}

function chaos(points,amplitude) {
	var res = []
	points.forEach(point => {
		res.push([point[0]+amplitude*(Math.random()-1/2),point[1]+amplitude*(-1/2+Math.random())])
	})
	return res
}
-
console.log(chaos(quadrille(20,500)))

var c = document.getElementById('myCanvas')
var context = c.getContext('2d')

const points = chaos(quadrille(20,500,960),20)
const delaunay = Delaunay.from(points)
const voronoi = delaunay.voronoi([0, 0, 960, 500])
console.log(voronoi)
context.beginPath();
voronoi.render(context);
// context.strokeStyle = "#fff";
context.stroke();
