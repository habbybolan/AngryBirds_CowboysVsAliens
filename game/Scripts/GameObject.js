// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class GameObject {

    /**
     * @param {b2World} world 
     * @param {JQuery} $worldView
     */
    constructor(world, $worldView) {
        this.world = world;
        this.$worldView = $worldView

        // TODO: Nick or Andre 
        //      Based on Mass?
        this.health = 10
    }

     /**
     * 
     * @param {JSON} sourceData {bounce, filename, friction, height, id, mass, 
     *                          name, shape, texture, type, value, width, (w)x, (w)y}
     */
      initiateFromRawData(sourceData) {

        this.CreateGameObject(sourceData, false)
    }

    /**
     * Creates a game object with the given parameters
     * @param {JSON} gameObjectdata {id: int, shape: SHAPE, width: float(pixels), height: float(pixels), x: float(pixels), y: float(pixels),
     *                               density: [0-1], resitution: [0-1], friction: [0-1], texure: string, type: String}
     *                              Size and Position values in pixels
     * @param {Boolean} isStatic    If the gameObject is static or dynamic
     */
    CreateGameObject(gameObjectdata, isStatic, isBoundary) {

        this.data = gameObjectdata;
        this.data.x = this.data.wx ? this.data.wx : this.data.x
        this.data.y = this.data.wy ? this.data.wy : this.data.y
        
        // if a texture exists, create a view
        if (gameObjectdata.texture) {
            this.$view = $(`<div id="${gameObjectdata.id}" 
                            type="${gameObjectdata.type}" 
                            class="gameobject ${gameObjectdata.type ? gameObjectdata.type : ""}"
                            style="height: ${gameObjectdata.height}px; 
                                width: ${gameObjectdata.width}px; 
                                background-image: url(${gameObjectdata.texture});" ></div>`)  
            this.$worldView.append(this.$view)     
        }

        // Create rigid body
        const bodyDef = new Physics.BodyDef()

        if (isStatic)
            bodyDef.type = Physics.Body.b2_staticBody
        else
            bodyDef.type = Physics.Body.b2_dynamicBody

        // set size
        let width = gameObjectdata.width / Physics.WORLD_SCALE
        let height = gameObjectdata.height / Physics.WORLD_SCALE
        
        // Create the shape
        let p = Point.pixelsToMeters(gameObjectdata.x, gameObjectdata.y)

        // If the game object is bounary
        if (isBoundary) {
            bodyDef.position.Set(p.left, p.top)
        } else {
            bodyDef.position.Set(p.left + width / 2, p.top + height / 2)
        }
        
        // Create fixture
        const fixtureDef = new Physics.FixtureDef()
        fixtureDef.density = gameObjectdata.mass
        fixtureDef.restitution = gameObjectdata.bounce
        fixtureDef.friction = gameObjectdata.friction

        if (gameObjectdata.shape == SHAPE.SQUARE) {
            fixtureDef.shape = new Physics.PolygonShape()
            fixtureDef.shape.SetAsBox(width / 2, height / 2)
        } else if (gameObjectdata.shape == SHAPE.CIRCLE) {
            fixtureDef.shape = new Physics.CircleShape()
            fixtureDef.shape.m_radius = width / 2
        } else {
            // TODO: Nick or Andre: 
            //      Triangle creation
        }     
    
        // Add to world
        let gameObjectBody = this.world.CreateBody(bodyDef)
        gameObjectBody.CreateFixture(fixtureDef)

        this._body = gameObjectBody
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

    render(deltaTime) {
        // if a view exists, then render it
        if (this.$view) {
            // position of b2Body in world
            let vec = this.body.GetPosition()
            let point = Point.metersToPixels(vec.x, vec.y)
            
            // center coordinates of GameObject
            let x = point.left + $('#game-area').offset().left - this.data.width / 2
            let y = point.top + $('#game-area').offset().top - this.data.height / 2

            // Rotate and translate
            this.$view.css('transform', ``)
            this.$view.offset({ left: x, top: y})
            this.$view.css('transform', `rotate(${this.body.GetAngle() * Physics.RAD_2_DEG}deg)`)
        }
        
    }

    get id() { return this.data.id }
    get point() { return this.data.point }
    get name() { return this.data.name }
    get type() { return this.data.type }
    get view() { return this.$view }
    get body() { return this._body }
    set body(val) { this._body = val }
}

export let SHAPE = {
    SQUARE: "square",
    CIRCLE: "circle",
    TRIANGLE: "triangle"
}

export let enitityTypesEnum  = {
    COLLIDABLE: "collidable",
    TARGET: "target"
}