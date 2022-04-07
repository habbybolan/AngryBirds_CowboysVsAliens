// Copyright (C) 2022 Scott Henshaw
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class GameObject {

    /**
     * 
     * @param {WorldContoller} world 
     */
    constructor(world) {
        this.world = world;
    }

     /**
     * 
     * @param {JSON} sourceData {bounce, filename, friction, height, id, mass, 
     *                          name, shape, texture, type, value, width, (w)x, (w)y}
     */
      initiateFromRawData(sourceData) {
        this.data = sourceData

        // targets use (wx, wy) collidables (x, y)
        this.data.point = new Point(
            this.data.wx ? this.data.wx : this.data.x, 
            this.data.wy ? this.data.wy : this.data.y)

        this.$view = $(`<div id="${this.data.id}" 
                            type="${this.data.type}" 
                            class="gameobject ${this.data.type}"
                            style="height: ${sourceData.height}px; 
                                width: ${sourceData.width}px; 
                                background-image: url(${this.data.texture});" ></div>`)
        this.$view.append(gameObject.view)

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

        this.body = wallBody
    }

    update() {
        // Note: won't do much
    }

    render() {
        
    }

    get id() { return this.data.id }
    get point() { return this.data.point }
    get name() { return this.data.name }
    get type() { return this.data.type }
    get view() { return this.$view }
}



export let enitityTypesEnum  = {
    COLLIDABLE: "collidable",
    TARGET: "target"
}