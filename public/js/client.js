
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


$(function() {
    const socket = io();
    var entityCount = 0
    var unique_id = 0
    var entities = {}

    const boxes = {}

    $('#canvas').click(e => {
        e.preventDefault()
        createEntity({
            x:e.clientX,
            y:e.clientY
        })
    })
    createAndAddBox = function(id) {
        
        return $('<div>')
        .attr('class', 'box')
        .attr('id', id)
        .appendTo('body')
        .click((e) => {
            removeEntity(e.target.id)
        })
    }

    socket.on('game update', function(state) {
        entities = {...state};
    })

    const debugField = $('<div>')
        .attr('id', 'debug-field')
        .css({position: 'absolute', top:0, left:0})
        .appendTo('body')

    socket.on('debug state', (state) => {
        debugField.text(state.frameTime)
    })

    var start = null
    
    function mainLoop(timestamp) {
        if(!start) start = timestamp
        var dt = timestamp - start

        //update(1000/dt)
        draw();

        frameID = window.requestAnimationFrame(mainLoop)
        
    }

    frameID = window.requestAnimationFrame(mainLoop)

    socket.emit('reset', {dimensions: {
        width: $(window).width(),
        height: $(window).height()
    }})

    function removeEntity(id) {
        socket.emit('delete entity', id)
        delete boxes[id] 
        delete entities[id]
        const bx = $('div#'+id)
        bx.remove()
        entityCount--
        printItems()
    }

    function createEntity(position) {
        const id = uuidv4();
        socket.emit('register player', {
            pos:position,
            velocity: {
                x: Math.random()*100,
                y: Math.random()*100,
            },
            id,
            type: ENTITY_TYPES.BOX
        })
        boxes[id]= createAndAddBox(id)

        entityCount++
        
    }

    function printItems(){
        console.log(entities)
    }

    function update(dt) {
        predictPositions(dt)
    }

    function draw() {
        $.each(entities, (i, entity) => {
            const bx = $('div#'+entity.id)
            bx.css({
                left: entity.pos.x + 'px',
                top: entity.pos.y + 'px'
            })
        })
    }

    function predictPositions(dt) {
        $.each(entities, (i, entity) => {
            entity.pos.x += entity.velocity.x * dt
            entity.pos.y += entity.velocity.y * dt
        })
    }
    
    const entity_btn = $('<button>')
        .text('Add entity')
        .css({
            position: 'fixed',
            top:0,
            right: 0
        })
        .click((e) => {
            e.preventDefault()
            createEntity({x:0,y:0})
        })
    $('body').append(entity_btn)
}) //jQuery
