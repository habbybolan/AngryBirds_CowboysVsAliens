// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class Bullet {

    constructor(world, $worldView, position, mass) {
        this.world = world
        this.$worldView = $worldView

        this.CreateBulletObject(position, mass)
    }

    /**
     * Create a bullet at a position with no initial force
     * @param {b2Vec2} position     Position to shoot bullet from
     * @param {float} mass          Mass of bullet
     */
    CreateBulletObject(position, mass) {

        // TODO: Should there be a separate force and direction?
        //          Force can be placed in the direction vector as magnitude??

        // TODO 
        // *********************
        // THIS CREATION OF BULLET IS NOT TESTED - MIGHT NOT WORK
        //  ********************

        // Create rigid body
        const bodyDef = new Physics.BodyDef()
        bodyDef.type = Physics.Body.b2_dynamicBody
        
        let width = this.data.width / Physics.WORLD_SCALE
        let height = this.data.height / Physics.WORLD_SCALE
        
        // Create the shape
        bodyDef.position.Set(position.x, position.y)
        
        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = mass
        fixtureDef.restitution = 0.1
        fixtureDef.friction = 0.1

        // TODO: Andre
        //          Shape if bullet? (Circle, Oval, Polygon...)
        if (this.data.shape == "square") {
            fixtureDef.shape = new Physics.PolygonShape()
            fixtureDef.shape.SetAsBox(width / 2, height / 2)
        } else {
            fixtureDef.shape = new Physics.CircleShape()
            fixtureDef.shape.m_radius = width / 2
        }        
        
        // Add to world
        let gameObjectBody = this.world.CreateBody(bodyDef)
        gameObjectBody.CreateFixture(fixtureDef)

        this.body = gameObjectBody
    }

    /**
     * Apply the inital force to the bullet
     * @param {float} force         Initial force of bullet 
     * @param {b2Vec2} direction    Direction for bullet to apply force to
     */
    ShootBullet(force, direction) {
        // TODO: Andre
        //      Apply inital force in direction to this.body
    }

    Render() {
        // TODO: Nick
    }
}