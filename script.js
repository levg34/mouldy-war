
var canvas = document.getElementById('myCanvas')
var context = canvas.getContext('2d')

var côtéQuadrillage = 20
var hauteurQuadrillage = 500
var largeurQuadrillage = 960

function quadrille(côté,hauteur,largeur) {
	if (!largeur) largeur = hauteur
	var res = []
	for (var n=1; n*côté<Math.max(largeur,hauteur); n++) {
		for (var m=1;2*côté*n-m*côté>0;m++) {
			if (m*côté < largeur && 2*côté*n-m*côté < hauteur) {
				res.push([m*côté,2*côté*n-m*côté])
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

const points = chaos(quadrille(côtéQuadrillage,hauteurQuadrillage,largeurQuadrillage),côtéQuadrillage)
const delaunay = Delaunay.from(points)
const voronoi = delaunay.voronoi([0, 0, largeurQuadrillage, hauteurQuadrillage])

var entités = []

var montagne = {
	nom : 'montagne',
	couleur : 'black',
	invincible : true,
	polygones : points.filter(point => point[0] < côtéQuadrillage+(côtéQuadrillage/2) || point[1] < côtéQuadrillage+(côtéQuadrillage/2) || point[0] > largeurQuadrillage-(côtéQuadrillage+(côtéQuadrillage/2)) || point[1] > hauteurQuadrillage-(côtéQuadrillage+(côtéQuadrillage/2))).map(point => indexPolygoneAuPoint(point))
}

entités.push(montagne)

var premièreCaseViolet = Math.floor(Math.random()*points.length)

var violet = {
	nom : 'violet',
	couleur : '#663399',
	polygones :  [premièreCaseViolet,...delaunay.neighbors(premièreCaseViolet)].filter(polygone => polygoneDisponible(polygone))
}

entités.push(violet)

var premièreCase = Math.floor(Math.random()*points.length)

var joueur = {
	nom : 'joueur',
	couleur : '#4169E1',
	polygones :  [premièreCase,...delaunay.neighbors(premièreCase)].filter(polygone => polygoneDisponible(polygone))
}

entités.push(joueur)

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

function polygoneDisponible(polygone) {
	return entités.map(entité => entité.polygones).flat().indexOf(polygone) === -1
}

function polygoneInvincible(polygone) {
	return entités.filter(entité => entité.invincible).map(entité => entité.polygones).flat().indexOf(polygone) !== -1
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
}

canvas.onclick = event => {
    event.preventDefault()
	
	var rect = canvas.getBoundingClientRect()
    var souris = [event.clientX - rect.left, event.clientY - rect.top]
	if (jouxtant(souris,joueur)) {
		var polygone = indexPolygoneAuPoint(souris)
		if (polygoneDisponible(polygone)) {
			joueur.polygones.push(polygone)
		} else {
			if (!polygoneInvincible(polygone)) {
				enleverPolygone(polygone)
				joueur.polygones.push(polygone)
			}
		}
	}
	bougerIA()
	tracer()
}

function enleverPolygone(polygone) {
	var entité = entités.filter(_entité => _entité.polygones.indexOf(polygone) !== -1)[0]
	if (entité && !entité.invincible) {
		var index = entité.polygones.indexOf(polygone)
		entité.polygones.splice(index, 1)
	}
}

function bougerIA() {
	var déplacementPossible
	violet.polygones.some(polygone => {
		for (const voisin of delaunay.neighbors(polygone)) {
			if (polygoneDisponible(voisin)) {
				déplacementPossible = voisin
				break
			}
		}
		return typeof déplacementPossible !== 'undefined'
	})
	if (typeof déplacementPossible !== 'undefined') {
		violet.polygones.push(déplacementPossible)
	} else {
		alert('bravo, violet est bloqué !')
	}
}

function jouxtant(point,joueur) {
	var res = false
	for (const voisin of delaunay.neighbors(indexPolygoneAuPoint(point))) {
		if (joueur.polygones.indexOf(voisin) !==-1) {
			res = true
		}
	}
	return res
}

tracer()
