// Copyright (C) 2022 Scott Henshaw
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'
import Level from './Level.js'

export default class World {

    constructor($view, filenameSelected) {

        // Setup view and model and properties
        this.$view = $view
        this.screenWidth = this.$view.width()
        this.screenHeight = this.$view.height()

        const gravityVector = new Physics.Vec2(0, Physics.GRAVITY)
        this.model = new Physics.World(gravityVector)

        // create walls and floor
        //this.createBoundaries()

        // initiate level
        this.level = new Level(this.$view, this.model)
        this.level.LoadLevel(filenameSelected)
        //this.Level.LoadLevel(filenameSelected)

        // TODL Future - add listeners for physical collisions
    }

    createBoundaries() {
        // Create floor

        // ceiling
        let topCoords = Point.pixelsToMeters(this.screenWidth / 2, 0)
        this.createWalls(topCoords.left, topCoords.top, Point.SCREEN_METERS.WIDTH, 10)

        // floor
        let downCoords = Point.pixelsToMeters(this.screenWidth / 2, this.screenHeight)
        this.createWalls(downCoords.left, downCoords.top, Point.SCREEN_METERS.WIDTH, 10)

        // Left wall
        let leftCoords = Point.pixelsToMeters(0, this.screenHeight / 2)
        this.createWalls(leftCoords, left, leftCoords.top, 10, Point.SCREEN_METERS.HEIGHT)

        // Right wall
        let rightCoords = Point.pixelsToMeters(this.screenWidth, this.screenHeight / 2)
        this.createWalls(rightCoords.left, rightCoords.top, 10, Point.SCREEN_METERS.HEIGHT)
    }

    /**
     * Creates the 4 boundaries around the level
     * @param {Int} x   x-coord in meters
     * @param {Int} y   y-coord in meters
     * @param {Int} dx  width in meters
     * @param {Int} dy  height in meters
     * @returns 
     */
    createWalls(x = 0, y = 0, dx = 10, dy = 10) {
        
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
        this.level.render()
    }
}