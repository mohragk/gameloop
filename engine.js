const ENTITY_TYPES = require('./entity_types')
const Vector = require('./math/Vector2d')

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
                rotation: 0,
                mass: size.w * size.w * size.w
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

        // move
        self.moveEntities(dt) 

        // check collision
        self.checkCollisions()
        
        for (var key in self.Entities) {


            switch(self.Entities[key].type) {
                case ENTITY_TYPES.BOX:
                   
        
                    //clamp
                    if (self.Entities[key].pos.x > self.world.width - self.Entities[key].size.w || self.Entities[key].pos.x < 0) {
                        self.Entities[key].velocity.x *= -1;
                    } 
                    if (self.Entities[key].pos.y > self.world.height - self.Entities[key].size.h || self.Entities[key].pos.y < 0) {
                        self.Entities[key].velocity.y *= -1;
                    }

                    if (self.Entities[key].pos.x < 0) self.Entities[key].pos.x = 0
                    if (self.Entities[key].pos.x > self.world.width) self.Entities[key].pos.x = self.world.width - self.Entities[key].size.w/2

                    if (self.Entities[key].pos.y < 0) self.Entities[key].pos.y = 0
                    if (self.Entities[key].pos.y > self.world.height) self.Entities[key].pos.y = self.world.height - self.Entities[key].size.h /2

                    if(self.Entities[key].rotating) {
                        self.Entities[key].rotation += 3 % 360
                    }

                break;

                case ENTITY_TYPES.CIRCLE:
                    
                    
                     //clamp
                    if (self.Entities[key].pos.x > self.world.width - self.Entities[key].size.w || self.Entities[key].pos.x < 0) {
                        self.Entities[key].velocity.x *= -1;
                    } 
                    if (self.Entities[key].pos.y > self.world.height - self.Entities[key].size.h || self.Entities[key].pos.y < 0) {
                        self.Entities[key].velocity.y *= -1;
                    }

                    if (self.Entities[key].pos.x < 0) self.Entities[key].pos.x = 0
                    if (self.Entities[key].pos.x > self.world.width) self.Entities[key].pos.x = self.world.width - self.Entities[key].size.w

                    if (self.Entities[key].pos.y < 0) self.Entities[key].pos.y = 0
                    if (self.Entities[key].pos.y > self.world.height) self.Entities[key].pos.y = self.world.height - self.Entities[key].size.w 

                    /*
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

                    */

                break;
            }
        }
    }

    self.moveEntities = function(dt) {
        for (var key in self.Entities) {
            self.Entities[key].lastPos.x = self.Entities[key].pos.x
            self.Entities[key].lastPos.y = self.Entities[key].pos.y 
            self.Entities[key].pos.x += self.Entities[key].velocity.x * dt
            self.Entities[key].pos.y += self.Entities[key].velocity.y * dt
        }
    }

    // UNUSED
    self.solvePosition = function(pos, vel, acc, dt)  {
        return pos + vel * dt + ((acc * (dt*dt)) / 2);
    };

    self.distanceSquared= function(p1, p2) {
        const x = Math.abs(p1.x - p2.x)
        const x2 = x * x;

        const y = Math.abs(p1.y - p2.y)
        const y2 = y * y;

        return y2 + x2
    }

    self.distance = function(p1, p2) {
        return Math.sqrt( self.distanceSquared(p1, p2) )

    }

    self.checkCollisions = function() {
        for (var key in self.Entities) {
            switch(self.Entities[key].type) {
                case ENTITY_TYPES.CIRCLE:
                    
                    const center = {
                        x:self.Entities[key].pos.x + (0.5 * self.Entities[key].size.w), 
                        y:self.Entities[key].pos.y + (0.5 * self.Entities[key].size.h), 
                    } 
                    const radius = self.Entities[key].size.w / 2
                    Object.keys(self.Entities).forEach((key2, i) => {

                        // dont check itself
                        if (key === key2) return
                        // dont check other shapes
                        if (self.Entities[key2].type !== ENTITY_TYPES.CIRCLE) return
        
    
                        const other_center = {
                            x:self.Entities[key2].pos.x + (0.5 * self.Entities[key2].size.w), 
                            y:self.Entities[key2].pos.y + (0.5 * self.Entities[key2].size.h), 
                        }
                        const other_radius = self.Entities[key2].size.w /2
    
                        const distance = self.distance(center, other_center)
                        
                        if (distance < (radius + other_radius)) {
                            
                            let theta1 = Math.atan2( self.Entities[key].velocity.y, self.Entities[key].velocity.x )
                            let theta2 = Math.atan2( self.Entities[key2].velocity.y, self.Entities[key2].velocity.x )
                            let phi = Math.atan2(self.Entities[key2].pos.y -self.Entities[key].pos.y,self.Entities[key2].pos.x - self.Entities[key].pos.x)

                            let m1 = self.Entities[key].mass
                            let m2 = self.Entities[key2].mass
                            let v1 = Math.sqrt(self.Entities[key].velocity.x * self.Entities[key].velocity.x + self.Entities[key].velocity.y * self.Entities[key].velocity.y);
                            let v2 = Math.sqrt(self.Entities[key2].velocity.x * self.Entities[key2].velocity.x + self.Entities[key2].velocity.y * self.Entities[key2].velocity.y);

                            let dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                            let dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                            let dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                            let dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);

                            self.Entities[key].velocity.x = dx1F
                            self.Entities[key].velocity.y = dy1F
                            self.Entities[key2].velocity.x = dx2F
                            self.Entities[key2].velocity.y = dy2F

                            //self.staticCollision(self.Entities[key], self.Entities[key2])

                            

                            loops = 0
                            let dist = self.distance( 
                                {
                                    x: self.Entities[key].pos.x + self.Entities[key].size.w * 0.5, 
                                    y: self.Entities[key].pos.y + self.Entities[key].size.w * 0.5
                                } 
                                ,
                                {
                                    x: self.Entities[key2].pos.x + self.Entities[key2].size.w * 0.5, 
                                    y: self.Entities[key2].pos.y + self.Entities[key2].size.w * 0.5
                                } 
                             )
                            while (dist < (radius + other_radius)) {
                                const overlap  = (radius + other_radius) - dist
                                let smaller = self.Entities[key].size.w < self.Entities[key2].size.w ? self.Entities[key] : self.Entities[key2];
                                let bigger  = self.Entities[key].size.w > self.Entities[key2].size.w ? self.Entities[key] : self.Entities[key2];
                                
                                let theta = Math.atan2((bigger.pos.y - smaller.pos.y), (bigger.pos.x - smaller.pos.x));

                                //self.Entities[key].pos.x += overlap * Math.cos(theta);
                                //self.Entities[key].pos.y += overlap * Math.sin(theta); 
                                smaller.pos.x -= overlap * Math.cos(theta);
                                smaller.pos.y -= overlap * Math.sin(theta); 

                                dist = self.distance( 
                                    {
                                        x: self.Entities[key].pos.x + self.Entities[key].size.w * 0.5, 
                                        y: self.Entities[key].pos.y + self.Entities[key].size.w * 0.5
                                    } 
                                    ,
                                    {
                                        x: self.Entities[key2].pos.x + self.Entities[key2].size.w * 0.5, 
                                        y: self.Entities[key2].pos.y + self.Entities[key2].size.w * 0.5
                                    } 
                                 )

                                if (loops > 20)  {break }
                                loops++
                            }
                                 
                            
                           
                        }
                    }, self.Entities)
                        
                        
                    
                break;
            }
        }
    }
    
    self.staticCollision = function(ob1, ob2, panic=false) {
        let center1 = ob1.pos.x + ob1.size.w / 2
        let center2 = ob2.pos.x + ob2.size.w / 2
        let overlap = (ob1.size.w/2) + (ob2.size.w/2) - self.distance(center1, center2)
        let smaller = ob1.size.w < ob2.size.w ? ob1 : ob2;
        let bigger  = ob1.size.w > ob2.size.w ? ob1 : ob2;

        // "Panic" is when staticCollision has run, but the collision
        // still hasn't been resolved. Which implies that one of the objects
        // is likely being jammed against a corner, so we must now move the OTHER one instead.
        // in other words: this line basically swaps the "little guy" role, because
        // the actual little guy can't be moved away due to being blocked by the wall.
        if (panic) [smaller, bigger] = [bigger, smaller]

        let theta = Math.atan2( bigger.pos.y - smaller.pos.y, bigger.pos.x - smaller.pos.x )
        smaller.pos.x -= overlap * Math.cos(theta)
        smaller.pos.y -= overlap * Math.sin(theta)

        if (self.distance( center1, center2 ) < ob1.size.w/2 + ob2.size.w/2 ) {
            if(!panic) staticCollision(ob1, ob2, true)
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

