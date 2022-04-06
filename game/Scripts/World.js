// Copyright (C) 2022 Scott Henshaw
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class World {

    constructor($view) {

        // Setup view and model and properties
        this.$view = $view
        this.screenWidth = this.$view.width()
        this.screenHeight = this.$view.height()

        const gravityVector = new Physics.Vec2(0, Physics.GRAVITY)
        this.model = new Physics.World(gravityVector)

        this.collidableList = []

        // create walls and floor
        this.createBoundaries()

        // TODL Future - add listeners for physical collisions
    }

    createBoundaries() {
        // Create floor
        let p = new Point()
        p.fromSCreen(this.screenHeight, this.screenWidth / 2)
        let delta = new Point()
        delta.fromSCreen(10, this.screenWidth)
        this.createWalls()

        // right wall
        this.createWalls()

        // Up wall
        this.createWalls()

        // Down wall
        this.createWalls()
    }

    createWalls(x = 0, y = 0, dx = 10, dy = 10) {
        // Create walls and floor at sides of screen
        //      Model for a static body that things can bounce off
        
        
        // Create rigid body
        const bodyDef = new Physics.BodyDef()
        bodyDef.type = Physics.Body.b2_staticBody

        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = 10
        fixtureDef.restitution = 0.1
        fixtureDef.shape = new Physics.PolygonShape()
        
        // Create the shape
        bodyDef.position.Set(x, y)
        const centerVector = new Physics.Vec2(x, y)
        fixtureDef.shape.SetAsBox(dx, dy, centerVector, 0)

        let wallBody = this.model.CreateBody(bodyDef)
        wallBody.CreateFixture(fixtureDef)

        return wallBody
        
    }

    update() {
        // TODO: simulate for a periiod of time

        // run a single step of the simulation
        this.model.Step(1/60, 10, 10)

        // TODO: remove later - for early testing how things are moving
        this.model.ClearForces()
    }

    render() {
        // TODO: re-render/update the css for everything 
        this.collidableList.forEach(collidable => {
            collidable.render()
        })
    }
}