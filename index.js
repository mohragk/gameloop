const express = require('express')
const app = express()
const http = require('http').createServer(app)
const PORT = 3000;
const path = require('path')
const io = require('socket.io')(http)

const Engine = require('./engine.js')
var engine = new Engine()
var intervalID;

http.listen(PORT, () => {
    console.log('Listening on port: ', PORT)
})

app.use('/', express.static('public'))

app.get('/dependencies/:filename', (req, res, next) => {
    var filename = req.params.filename
    
    res.sendFile(filename, {root:path.join( __dirname , '')})
})

io.on('connection', function(socket) {
    console.log('User connected')

    socket.on('reset', (client) => {
        console.log('RESET')
        
        delete engine
        engine = new Engine()
        engine.resizeWorld(client.dimensions)
        clearInterval(intervalID)
        intervalID = setInterval(
            () => {
                io.emit('game update', engine.Entities)
                io.emit('debug state', engine.debugData)
            }
            ,
            1000/engine.fps
        )
        
    })

    socket.on('register player', (player) => {
        engine.registerEntity(player.pos, player.velocity, player.id)
    })

    socket.on('delete entity', (entity_id) => {
        engine.deleteEntity(entity_id);
    })

    
    intervalID = setInterval(
        () => {
            io.emit('game update', engine.Entities)
        }
        ,
        1000/engine.fps
    )
})