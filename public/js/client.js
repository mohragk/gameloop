
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


$(function() {
    const socket = io();
    var entityCount = 0;
    var entities = {}
    const renderables = {}
    var selectedType = ENTITY_TYPES.BOX


    //init
    createUI()
    $("body").css("overflow", "hidden")

    // resized window
    $( window ).resize(function() {
        console.log('Window size changed: ',{width:$(window).width()})
        socket.emit('resize world', {
            width: $(window).width(), 
            height: $(window).height()
        })
    })

    // make canvas clickable and create Box at mousePos
    $('#canvas').click(e => {
        e.preventDefault()
        createEntity(
        { //pos
            x:e.clientX,
            y:e.clientY
        },
        { //size
            w: 50, h: 50
        },
        // type
        selectedType
        )
    })


    createAndAddRenderable = function(id, type) {
        return $('<div>')
        .attr('class', ENTITY_TYPES.classNames[type] )
        .attr('id', id)
        .appendTo('#canvas')
        .click((e) => {
            removeEntity(e.target.id)
        })
        .hover((e) => {
            socket.emit('hovering entity', e.target.id)
        })
    }

    socket.on('game update', function(state) {
        entities = {...state};
    })

    const debugField = $('<div>')
        .attr('id', 'debug-field')
        .css({position: 'absolute', top:0, left:0})
        .appendTo('#canvas')

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
        delete renderables[id] 
        delete entities[id]
        const bx = $('div#'+id)
        bx.remove()
        entityCount--
        printItems()
    }

    function createEntity(pos, size, type) {
        const id = uuidv4();
        socket.emit('register player', {
            id,
            type,
            pos,
            size,
            velocity: {
                x: Math.random()*100,
                y: Math.random()*100,
            },
        })


        renderables[id] = createAndAddRenderable(id, type)

        entityCount++
        printItems()
    }

    function printItems(){
        console.log(entities)
    }

   

    function draw() {
        $.each(entities, (i, entity) => {
           

            const $entity = $('div#'+entity.id)
            $entity.css({
                left: entity.pos.x + 'px',
                top: entity.pos.y + 'px',
                transform: `rotate(${entity.rotation}deg)`
            })
        })
    }

    function createUI() {
        const zIndex = 100000
        const typeSelector = $('<select>')
            .attr('id', 'selectType')
            .css({
                position: 'fixed',
                top:10,
                right: 10,
                zIndex
            })
            
            .append(
                $('<option>').text('Box').val(ENTITY_TYPES.BOX),
                $('<option>').text('Circle').val(ENTITY_TYPES.CIRCLE),
            );
        
        $('#canvas').append(typeSelector);
        
        typeSelector.change( function() {
            selectedType = parseInt( $(this).val() )
            
        });
    }
            
    
}) //jQuery
