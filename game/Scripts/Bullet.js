// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class Bullet {

    constructor(world, $worldView, position, mass) {
        this.world = world
        this.$worldView = $worldView

        //this.CreateBulletObject(position, mass)
    }

    /**
     * Create a bullet at a position with no initial force
     * @param {b2Vec2} position     Position to shoot bullet from
     * @param {float} mass          Mass of bullet
     */
    CreateBulletObject(position, mass) {

    // TODO: Should there be a separate force and direction?
    //          Force can be placed in the direction vector as magnitude??

        //In Theory, i want to grab the cannon pos and its angle and launch an object from that point
        
        // Create rigid body
        const bodyDef = new Physics.BodyDef()
        bodyDef.type = Physics.Body.b2_dynamicBody
        
        let width = 70 / Physics.WORLD_SCALE
        let height = 70 / Physics.WORLD_SCALE

        // Create the shape
        let p = Point.pixelsToMeters(position.x, position.y)
        bodyDef.position.Set(p.left + width / 2, p.top + height / 2)
        
        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = mass
        fixtureDef.restitution = 0.3
        fixtureDef.friction = 0.7
        fixtureDef.shape = new Physics.CircleShape()
        fixtureDef.shape.m_radius = width / 2
        
        let gameObjectBody = this.world.CreateBody(bodyDef)
        gameObjectBody.CreateFixture(fixtureDef)
    
        this.body = gameObjectBody

        console.log("Object created")
        console.log(this.body.GetPosition())
    }

    update()
    {
        console.log(this.body.GetPosition())
    }
    
   
    ShootBullet(force, direction, position) {
        // TODO: Andre
        //      Apply inital force in direction to this.body
        
        this.body.ApplyForce(new Physics.Vec2(force, direction), position)
    }

    Render() {
        // TODO: Nick
    }
}