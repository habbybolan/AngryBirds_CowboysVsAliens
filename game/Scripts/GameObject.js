// Copyright (C) 2022 Scott Henshaw
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class GameObject {

    /**
     * 
     * @param {WorldContoller} world 
     */
    constructor(world, $worldView) {
        this.world = world;
        this.$worldView = $worldView
    }

     /**
     * 
     * @param {JSON} sourceData {bounce, filename, friction, height, id, mass, 
     *                          name, shape, texture, type, value, width, (w)x, (w)y}
     */
      initiateFromRawData(sourceData) {
        this.data = sourceData

        this.data.x = this.data.wx ? this.data.wx : this.data.x
        this.data.y = this.data.wy ? this.data.wy : this.data.y

        // Create gameObject view
        this.$view = $(`<div id="${this.data.id}" 
                            type="${this.data.type}" 
                            class="gameobject ${this.data.type}"
                            style="height: ${sourceData.height}px; 
                                width: ${sourceData.width}px; 
                                background-image: url(${this.data.texture});" ></div>`)
        this.$worldView.append(this.$view)

        // Create rigid body
        const bodyDef = new Physics.BodyDef()
        bodyDef.type = Physics.Body.b2_dynamicBody
        
        let width = this.data.width / Physics.WORLD_SCALE
        let height = this.data.height / Physics.WORLD_SCALE
        
        // Create the shape
        let p = Point.pixelsToMeters(this.data.x, this.data.y)
        bodyDef.position.Set(p.left + width/2, p.top + height/2)
        
        // Add to world
        let gameObjectBody = this.world.CreateBody(bodyDef)
        
        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = 10
        fixtureDef.restitution = 0.1
        fixtureDef.shape = new Physics.PolygonShape()
        fixtureDef.shape.SetAsBox(width / 2, height / 2)
        gameObjectBody.CreateFixture(fixtureDef)

        this.body = gameObjectBody
    }

    update() {
        // Note: won't do much
    }

    render() {
        let vec = this.body.GetPosition()
        let point = Point.metersToPixels(vec.x, vec.y)
        let x = point.left + $('#game-area').offset().left - this.data.width / 2
        let y = point.top + $('#game-area').offset().top - this.data.height / 2
        this.$view.offset({ left: x, top: y })
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