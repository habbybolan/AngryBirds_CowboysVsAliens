// Copyright (C) 2022 Nicholas Johnson, Andre Dupuis
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

        this.contactObjs = []    // After each simluation, store the objects that collided with this obj for calculation in Update

        this.health = 2

        this.IsCollided = false;    // If object has collided with anything, including game objects or boundaries
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
            fixtureDef.shape = new Physics.PolygonShape()
            let listOfPoints = []
            listOfPoints.push(new Physics.Vec2(0, -height/2))       // top middle
            listOfPoints.push(new Physics.Vec2(width/2, height/2))  // Bottom right
            listOfPoints.push(new Physics.Vec2(-width/2, height/2)) // Bottom left
            fixtureDef.shape.SetAsArray(listOfPoints, 3)
            
        }     
    
        // Add to world
        let gameObjectBody = this.world.CreateBody(bodyDef)
        gameObjectBody.CreateFixture(fixtureDef)

        this._body = gameObjectBody
        if (!isBoundary)
            this._body.SetUserData(this)
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
            this.$view.offset({ left: x, top: y })
            this.$view.css('transform', `rotate(${this.body.GetAngle() * Physics.RAD_2_DEG}deg)`)
        }
    }

    update(deltaTime) {

        for (let i in this.contactObjs) { 

            //minus health on contact as long as the collidable is going fast enough
            if(this.calcMagnitudeSquared() >= 150 || this.contactObjs[i].calcMagnitudeSquared() >= 150) 
                this.health--

            if (this.health <= 0){
                $(`#${this.data.id}`).remove()
                this.world.DestroyBody(this._body)
                this.isDeleted = true;
            }
        }

        // reset collided objects list once collision dealth with
        this.contactObjs = [];
    }

    calcMagnitudeSquared() {
        return Math.pow(this._body.GetLinearVelocity().x, 2) + Math.pow(this._body.GetLinearVelocity().y, 2)
    }

    /**
     * Deals with collision event between two GameObjects
     * @param {GameObject} obj1 Collided with obj2
     * @param {GameObject} obj2 Collided with obj1
     */
    static startContact(obj1, obj2) {

        // Set contact
        obj1.contactObjs.push(obj2)
        obj2.contactObjs.push(obj1)
        obj1.IsCollided = true;
        obj2.IsCollided = true;
    }

    // Called when objects connects with a boundary
    contactWithBoundary() {
        this.IsCollided = true;
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