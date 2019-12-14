var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/vue/index.html')
})

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' })
	socket.on('my other event', function (data) {
		console.log(data)
	})
})

server.listen(80, () => console.log('Serveur démarré sur le port 80.'))
// WARNING: app.listen(80) will NOT work here!
