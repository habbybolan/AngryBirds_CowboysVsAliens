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
     * Deals with OnHit Event, dealing damage to GameObject
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
        
        // center coordinates of GameObject
        let x = point.left + $('#game-area').offset().left - this.data.width / 2
        let y = point.top + $('#game-area').offset().top - this.data.height / 2

        // rotate around the origin of the GameObject view
        //this.$view.css('transform', `rotate(${this.body.GetAngle() * Physics.RAD_2_DEG}deg)`)
        
        //console.log(`(${this.$view.position().left}, ${this.$view.position().top})`)
        this.$view.css('transform', ``)
        // if (this.data.type == "target")
        //     console.log(`(${this.$view.position().left}, ${this.$view.position().top})`)

        // get top top-left coord of box if origin of box placed at origin of world
        // let xRot = this.data.width / 2
        // let yRot = this.data.height / 2

        // let angle = this.body.GetAngle();
        // // rotate vector coord by angle rotation
        // let newX = xRot * Math.cos(angle) - yRot * Math.sin(angle)
        // let newY = xRot * Math.sin(angle) + yRot * Math.cos(angle)
        //console.log(`(${newX}, ${newY})`)
        // if (this.data.type == "target")
        //     console.log(`(${newX}, ${newY}) with radians ${this.body.GetAngle()}`)
        
        // move to center of GameObject plus rotation offset
        //this.$view.offset({ left: x + newX, top: y + newY })
        this.$view.offset({ left: x, top: y})
        this.$view.css('transform', `rotate(${this.body.GetAngle() * Physics.RAD_2_DEG}deg)`)

        // console.log(`
        // ele: (${this.$view.position().left - $('#game-area').offset().left}, ${this.$view.position().top - $('#game-area').offset().top}) 
        // game: (${x - this.data.width/2 - $('#game-area').offset().left}, ${y-this.data.height/2 - $('#game-area').offset().top})`)
        
        // let centerX = point.left + $('#game-area').offset().left
        // let centerY = point.top + $('#game-area').offset().top 
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