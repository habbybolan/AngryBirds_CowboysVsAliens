// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import GameObject from './GameObject.js';
import Point from './Point.js'

export default class Bullet {

    constructor(world, $worldView, id) {
        this.world = world
        this.$worldView = $worldView

        this.id = id
        this.bulletObject;

        this.cannonData;
        
    }

    /**
     * Create a bullet at a position with no initial force
     * @param {b2Vec2} position     Position to shoot bullet from
     * @param {float} mass          Mass of bullet
     */
    CreateBulletObject(position, mass) {
        
        this.cannonData = {
            shape: "circle",
            id: this.id,
            type: "bullet",
            width: 30,
            height: 30,
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
        this.world.DestroyBody(this.bulletObject._body)
    }
    
    update(deltaTime)
    {
    }
    
   
    ShootBullet(force) {
        let p = Point.pixelsToMeters(this.cannonData.x, this.cannonData.y)
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

    
}