// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class Cannon {

    constructor(world, $worldView, numProjectiles) {
        this.world = world;
        this.$worldView = $worldView
        this.numProjectiles = numProjectiles
        this.angle = 45;

        this.direction = Physics.Vec2(1, 1) // Direction cannon faces
        this.bulletList = []                // List of bullets currently in the level
        
    }

    render() {
        // TODO: Nick
        //      Render movement on arrow keys held down / follow mouse to have (Gun?) visually follow
        //      Create graphic for the level of power to use (or functionality to choose)
        //      Stop cannon movement if no projectiles left 
    }

    update() {
        // TODO: Andre
        //      Destroy any bullet based on some condition (like moving slowly, time...)
        console.log(this.body.GetPosition())
    }


    OnShoot(force) {
        // TODO: Andre
        //          Shoot with certain force and direction

        //In Theory, i want to grab the cannon pos and its angle and launch an object from that point
        let cannonX = $('#game-area').offset().left
        let cannonY = $('#game-area').offset().top //- $('#game-area').height();
        
        // Create rigid body
        const bodyDef = new Physics.BodyDef()
        bodyDef.type = Physics.Body.b2_dynamicBody
        
        let width = 70 / Physics.WORLD_SCALE
        let height = 70 / Physics.WORLD_SCALE
        
        console.log(cannonX)
        console.log(cannonY)

        // Create the shape
        let p = Point.pixelsToMeters(cannonX, cannonY)
        bodyDef.position.Set(p.left + width / 2, p.top + height / 2)
        
        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = 1
        fixtureDef.restitution = 0.3
        fixtureDef.friction = 0.7
        fixtureDef.shape = new Physics.CircleShape()
        fixtureDef.shape.m_radius = width / 2
        
        let gameObjectBody = this.world.CreateBody(bodyDef)
        gameObjectBody.CreateFixture(fixtureDef)
    
        this.body = gameObjectBody

        
        
        
    }
}