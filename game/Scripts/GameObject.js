// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class GameObject {

    /**
     * @param {b2World} world 
     * @param {}
     */
    constructor(world, $worldView) {
        this.world = world;
        this.$worldView = $worldView

        // TODO: Based on Mass?
        this.health = 10
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
        bodyDef.position.Set(p.left + width / 2, p.top + height / 2)
        
        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = this.data.mass
        fixtureDef.restitution = this.data.bounce
        fixtureDef.friction = this.data.friction

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
     * Deals with OnHit Event
     * @param {b2Vec2} direction    Direction vector of object that hit this 
     * @param {float} velocity      Vecloty of object that hit this (will velocity data be stored in direction???)
     * @param {float} mass          Mass of object that hit this 
     * @returns {Boolean}           True if object was destroyed, false otherwise
     */
    OnHit(direction, velocity, mass) {
        // TODO: Andre
        //  Im not sure if this OnHit will be usedful, but I was thinking the level would call this when finding a collision that happened
        //  Could maybe pass an object that hit it, or b2WorldManifold that I believe holds the contact point and normal if you need it
        return false;
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