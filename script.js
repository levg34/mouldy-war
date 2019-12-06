var canvas = document.getElementById('myCanvas')
var context = canvas.getContext('2d')

var quadrillage = {
	côté: 20,
	hauteur: window.innerHeight,
	largeur: window.innerWidth
}

canvas.setAttribute('height', quadrillage.hauteur)
canvas.setAttribute('width', quadrillage.largeur)

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

const points = chaos(quadrille(quadrillage.côté,quadrillage.hauteur,quadrillage.largeur),quadrillage.côté)
const delaunay = Delaunay.from(points)
const voronoi = delaunay.voronoi([0, 0, quadrillage.largeur, quadrillage.hauteur])

var entités = []

var montagne = {
	nom : 'montagne',
	couleur : 'black',
	invincible : true,
	polygones : points.filter(point => point[0] < quadrillage.côté+(quadrillage.côté/2) || point[1] < quadrillage.côté+(quadrillage.côté/2) || point[0] > quadrillage.largeur-(quadrillage.côté+(quadrillage.côté/2)) || point[1] > quadrillage.hauteur-(quadrillage.côté+(quadrillage.côté/2))).map(point => indexPolygoneAuPoint(point))
}

entités.push(montagne)

var premièreCaseViolet = polygoneDisponibleAléatoire()

var violet = {
	nom : 'violet',
	couleur : '#663399',
	mobile : true,
	polygones :  [premièreCaseViolet,...delaunay.neighbors(premièreCaseViolet)].filter(polygone => polygoneDisponible(polygone))
}

entités.push(violet)

var premièreCase = polygoneDisponibleAléatoire()

var joueur = {
	nom : 'joueur',
	couleur : '#4169E1',
	joueur : true,
	polygones :  [premièreCase,...delaunay.neighbors(premièreCase)].filter(polygone => polygoneDisponible(polygone))
}

entités.push(joueur)

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function ajouterUnité(mobile) {
	var premièreCase = polygoneDisponibleAléatoire()

	var unité = {
		nom : 'unité_'+entités.length,
		couleur : getRandomColor(),
		mobile : mobile,
		polygones :  [premièreCase,...delaunay.neighbors(premièreCase)].filter(polygone => polygoneDisponible(polygone))
	}

	entités.push(unité)
}

ajouterUnité(true)
ajouterUnité(true)
ajouterUnité()

function tracer(point) {
	context.clearRect(0,0,quadrillage.largeur,quadrillage.hauteur)
	
	// voronoi.update()
	
	// Tracé des côtés des polygones
	context.beginPath()
	voronoi.render(context)
	context.strokeStyle = '#00008B'
	context.stroke()
	
	// Tracé des entités
	entités.forEach(entité => {
		context.fillStyle = entité.couleur
		entité.polygones.forEach(polygone => {
			context.beginPath()
			voronoi.renderCell(polygone, context)
			context.fill()
		})
	})
	
	// Tracé de survol de la souris
	if (point) {
		var polygone = indexPolygoneAuPoint(point)
		if (polygoneInvincible(polygone) || joueur.polygones.indexOf(polygone) !== -1 || !jouxtant(point,joueur)) return
		context.beginPath()
		voronoi.renderCell(polygone, context)
		if (!polygoneDisponible(polygone)) {
			context.fillStyle = 'red'
		} else {
			context.fillStyle = joueur.couleur
		}
		context.globalAlpha = 0.6
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

function polygoneDisponibleAléatoire() {
	var casesDisponibles = [...points.keys()].filter(polygone => polygoneDisponible(polygone))
	return casesDisponibles[Math.floor((Math.random()*casesDisponibles.length))]
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
				combat(polygone,joueur)
			}
		}
	}
	bougerIA()
	tracer()
}

function combat(polygone,attaquant) {
	var attaqueRéussie = !polygoneInvincible(polygone)
	if (attaqueRéussie) {
		enleverPolygone(polygone)
		attaquant.polygones.push(polygone)
	}
}

function enleverPolygone(polygone) {
	var entité = entitéAuPolygone(polygone)
	if (entité && !entité.invincible) {
		var index = entité.polygones.indexOf(polygone)
		entité.polygones.splice(index, 1)
	}
	if (entité.polygones.length === 0) {
		enleverEntité(entité)
	}
}

function enleverEntité(entité) {
	alert(entité.nom+' a perdu.')
}

function entitéAuPolygone(polygone) {
	return entités.filter(_entité => _entité.polygones.indexOf(polygone) !== -1)[0]
}

function bougerIA() {
	entités.forEach(entité => {
		if (entité.mobile) {
			var déplacementPossible
			entité.polygones.some(polygone => {
				for (const voisin of delaunay.neighbors(polygone)) {
					if (polygoneDisponible(voisin)) {
						déplacementPossible = voisin
						break
					}
				}
				return typeof déplacementPossible !== 'undefined'
			})
			if (typeof déplacementPossible !== 'undefined') {
				entité.polygones.push(déplacementPossible)
			} else {
				alert('bravo, '+entité.nom+' est bloqué !')
				entité.mobile = false
			}
		}
	})
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
