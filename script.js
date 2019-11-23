var canvas = document.getElementById('myCanvas')
var context = canvas.getContext('2d')

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

const points = chaos(quadrille(20,500,960),20)
const delaunay = Delaunay.from(points)
const voronoi = delaunay.voronoi([0, 0, 960, 500])

var violet = {
	couleur : '#663399',
	polygones :  [5,6,7]
}

var joueur = {
	couleur : '#4169E1',
	polygones :  [13]
}

var entités = [violet,joueur]

function tracer(point) {
	context.clearRect(0,0,canvas.width,canvas.height)
	
	// voronoi.update()
	
	context.beginPath()
	voronoi.render(context)
	context.strokeStyle = '#00008B'
	context.stroke()
	
	entités.forEach(entité => {
		context.fillStyle = entité.couleur
		entité.polygones.forEach(polygone => {
			context.beginPath()
			voronoi.renderCell(polygone, context)
			context.fill()
		})
	})
	
	if (point) {
		context.beginPath()
		voronoi.renderCell(indexPolygoneAuPoint(point), context)
		context.fillStyle = joueur.couleur
		context.globalAlpha = 0.5
		context.fill()
		context.globalAlpha = 1
	}
}

function indexPolygoneAuPoint(point) {
	var index = -1
	for (var i=0; i<points.length; ++i) {
		if (voronoi.contains(i, point[0], point[1])) {
			index = i
		}
	}
	return index
}

canvas.onmousemove = event => {
    event.preventDefault()
	
	var rect = canvas.getBoundingClientRect()
    var souris = [event.clientX - rect.left, event.clientY - rect.top]
	tracer(souris)
	// voronoi.contains(i, x, y)
    // tracer()
}

canvas.onclick = event => {
    event.preventDefault()
	
	var rect = canvas.getBoundingClientRect()
    var souris = [event.clientX - rect.left, event.clientY - rect.top]
	joueur.polygones.push(indexPolygoneAuPoint(souris))
	tracer()
	// voronoi.contains(i, x, y)
    // tracer()
}

tracer()
