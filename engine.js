const ENTITY_TYPES = require('./entity_types')

module.exports =  function() {
    const self = this
    self.started = false
    self.start
    self.tick = 0
    self.fps = 120
    self.world = {width: 1024, height: 768}
    self.entityCount = 0
    self.Entities = {}
    self.lastFrameDuration = 0
    self.debugData = {}

    self.resizeWorld = function(dimensions) {
        self.world.width  = dimensions.width
        self.world.height = dimensions.height
    }

    self.addEntity = function(pos, size, velocity, id, type) {
        self.Entities[id] =
            {
                id,
                type,
                pos,
                lastPos: pos,
                velocity,
                size,
                rotating: false,
                rotation: 0
            }
        
    }

    self.deleteEntity = function(id) {
        console.log('Deleted entity: ', id)
        delete self.Entities[id]
        self.entityCount--
    }
    self.handleHover = function(id) {
        self.Entities[id].rotating = !self.Entities[id].rotating  
    }

    self.update = function(dt) {
        for (var key in self.Entities) {

            switch(self.Entities[key].type) {
                case ENTITY_TYPES.BOX:
                    self.Entities[key].lastPos.x = self.Entities[key].pos.x
                    self.Entities[key].lastPos.y = self.Entities[key].pos.y 
                    self.Entities[key].pos.x += self.Entities[key].velocity.x * dt
                    self.Entities[key].pos.y += self.Entities[key].velocity.y * dt
        
                    //clamp
                    if (self.Entities[key].pos.x > self.world.width - self.Entities[key].size.w || self.Entities[key].pos.x < 0) {
                        
                        self.Entities[key].velocity.x *= -1;
                    } 
                    if (self.Entities[key].pos.y > self.world.height - self.Entities[key].size.h || self.Entities[key].pos.y < 0) {
                       
                        self.Entities[key].velocity.y *= -1;
                    }

                    if(self.Entities[key].rotating) {
                        self.Entities[key].rotation += 3 % 360
                    }

                break;

                case ENTITY_TYPES.CIRCLE:
                    self.Entities[key].lastPos.x = self.Entities[key].pos.x
                    self.Entities[key].lastPos.y = self.Entities[key].pos.y 
                    self.Entities[key].pos.x += self.Entities[key].velocity.x * dt
                    self.Entities[key].pos.y += self.Entities[key].velocity.y * dt
        
                    // wrap x
                    if (self.Entities[key].pos.x > self.world.width) {
                        self.Entities[key].pos.x = -self.Entities[key].size.w
                    }
                    if (self.Entities[key].pos.x < -self.Entities[key].size.w*2) {
                        self.Entities[key].pos.x = self.world.width
                    } 
                    // wrap y
                    if (self.Entities[key].pos.y > self.world.height) {
                        self.Entities[key].pos.y = -self.Entities[key].size.h
                    } 
                    if (self.Entities[key].pos.y < -self.Entities[key].size.h*2) {
                        self.Entities[key].pos.y = self.world.height
                    }

                break;
            }
        }
    }

    

    self.lastFrameTime = (new Date().getTime())
    
    self.run = function() {

        const dt = (new Date().getTime()) - self.lastFrameTime
        self.debugData.frameTime = dt
        self.update(dt/1000)
        self.lastFrameTime = (new Date().getTime())
   
    }
    self._intervalId = setInterval(self.run, 1000/self.fps)
    
   
}

