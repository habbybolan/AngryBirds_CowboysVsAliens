// Copyright (C) 2022 Scott Henshaw
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'
import Level from './Level.js'

export default class World {

    constructor($view, filenameSelected) {

        // Setup view and model and properties
        this.$view = $view

        const gravityVector = new Physics.Vec2(0, Physics.GRAVITY)
        this.model = new Physics.World(gravityVector)

        // create walls and floor
        this.createBoundaries()

        // initiate level
        this.level = new Level(this.$view, this.model)
        this.level.LoadLevel(filenameSelected)

        // TODL Future - add listeners for physical collisions
    }

    createBoundaries() {

        // ceiling
        this.createWalls(Point.SCREEN.WIDTH / 2, 0, Point.SCREEN_METERS.WIDTH / 2, 0)

        // floor
        this.createWalls(Point.SCREEN.WIDTH / 2, Point.SCREEN.HEIGHT, Point.SCREEN_METERS.WIDTH / 2, 0)

        // Left wall
        this.createWalls(0, Point.SCREEN.HEIGHT / 2, 0, Point.SCREEN_METERS.HEIGHT / 2)

        // Right wall
        this.createWalls(Point.SCREEN.WIDTH, Point.SCREEN.HEIGHT / 2, 0, Point.SCREEN_METERS.HEIGHT / 2)
    }

    /**
     * Creates the 4 boundaries around the level
     * @param {Int} x   x-coord in pixels
     * @param {Int} y   y-coord in pixels
     * @param {Int} dx  width in meters
     * @param {Int} dy  height in meters
     * @returns         Created boundary wall
     */
    createWalls(x = 0, y = 0, dx = 10, dy = 10) {
        
        let meterCoords = Point.pixelsToMeters(x, y)

        // Create rigid body
        const bodyDef = new Physics.BodyDef()
        bodyDef.type = Physics.Body.b2_staticBody

        // create shape 
        bodyDef.position.Set(meterCoords.left, meterCoords.top)
        const centerVector = new Physics.Vec2(meterCoords.left, meterCoords.top)
        
        // add to world
        let wallBody = this.model.CreateBody(bodyDef)

        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = 10
        fixtureDef.restitution = .5
        fixtureDef.friction = .5
        fixtureDef.shape = new Physics.PolygonShape()
        fixtureDef.shape.SetAsBox(dx, dy, centerVector, 0)
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