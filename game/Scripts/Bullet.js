// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import GameObject from './GameObject.js';
import Point from './Point.js'

export default class Bullet {

    constructor(world, $worldView, id) {
        this.world = world
        this.$worldView = $worldView

        this.id = `bullet-${id}`
        this.bulletObject

        this.cannonData
        this.timer = 0

        this.diameter = 30;
    }

    /**
     * Create a bullet at a position with no initial force
     * @param {b2Vec2} position     Position to shoot bullet from
     * @param {float} mass          Mass of bullet
     */
    CreateBulletObject(position, mass) {
        
        this.cannonData = {
            shape: "circle",
            id: `${this.id}`,
            type: "bullet",
            width: this.diameter,
            height: this.diameter,
            x: position.x,
            y: position.y,
            mass: mass,
            texture: "/images/cannonball.png",
            friction: .7,
            bounce: 0.5
        }
        //make bullet a gameobject
        this.bulletObject = new GameObject(this.world, this.$worldView)
        //create bullet
        this.bulletObject.CreateGameObject(this.cannonData, false)
        
    }

    //delete bullet physics body
    destroyBody()
    {
        this.world.DestroyBody(this.bulletObject.body)
    }
    
    update(deltaTime)
    {
        this.timer += deltaTime
    }
    
   
    ShootBullet(force) {
        console.log(`(${this.cannonData.x}, ${this.cannonData.y})`)
        let cp = Point.metersToPixels(this.bulletObject.body.GetPosition().x, this.bulletObject.body.GetPosition().y)
        console.log(`(${cp.left}, ${cp.top})`)
        let p = Point.pixelsToMeters(this.cannonData.x + this.diameter / 2, this.cannonData.y + this.diameter / 2)
        let newP = new Physics.Vec2(p.left, p.top)
        
        
        console.log(newP)
        this.bulletObject.body.ApplyForce(force, newP);
    }

    render(deltaTime) {
        if(this.bulletObject != null)
        {
            this.bulletObject.render()
        }
    }

    getIsCollided()
    {
        return this.bulletObject.IsCollided
    }
}