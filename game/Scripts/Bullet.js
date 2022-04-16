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

        
    }

    /**
     * Create a bullet at a position with no initial force
     * @param {b2Vec2} position     Position to shoot bullet from
     * @param {float} mass          Mass of bullet
     */
    CreateBulletObject(position, mass) {

    // TODO: Should there be a separate force and direction?
    //          Force can be placed in the direction vector as magnitude??

        //In Theory, i want to grab the cannon pos and its angle and launch an object from that point
        
        let cannonData = {
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
        this.bulletObject.CreateGameObject(cannonData, false)
    }

    update(deltaTime)
    {
    }
    
   
    ShootBullet(force, position) {
        let p = Point.pixelsToMeters(position.x, position.y)
        let newP = new Physics.Vec2(p.left, p.top)
        
        this.bulletObject.body.ApplyForce(force, newP);
    }

    render(deltaTime) {
        if(this.bulletObject != null)
        {
            this.bulletObject.render()
        }
    }

    
}