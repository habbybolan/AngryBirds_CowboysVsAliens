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

        this.contactObjs = []    // After each simluation, store the objects that collided with this obj for calculation in Update

        // TODO: Nick or Andre 
        //      Based on Mass?
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
            // TODO: Nick or Andre: 
            //      Triangle creation
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
            this.$view.offset({ left: x, top: y})
            this.$view.css('transform', `rotate(${this.body.GetAngle() * Physics.RAD_2_DEG}deg)`)
        }
    }

    update(deltaTime) {

       
        // TODO: Andre - Do hit logic, using contactObj if not undefined
        for (let i in this.contactObjs) { 
            console.log(`do logic on ${this.data.id} that collided with ${this.contactObjs[i].data.id}`)

            console.log(this.contactObjs[i]._body.GetLinearVelocity().Length())

            //minus health on contact as long as the collidable is going fast enough
            if(this._body.GetLinearVelocity().Length() >= 25 || this.contactObjs[i]._body.GetLinearVelocity().Length() >= 25)
                this.health--
            //console.log(this.health)
            console.log()
            if (this.health <= 0){
                console.log(this.contactObjs[i])
                console.log(this._body.GetLinearVelocity())
                $(`#${this.data.id}`).remove()
                this.world.DestroyBody(this._body)
                this.isDeleted = false;
            }
        }

        // reset collided objects list once collision dealth with
        this.contactObjs = [];
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