// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'
import Bullet from './Bullet.js';


export default class Cannon {

    constructor(world, $worldView, numProjectiles) {
        this.world = world;
        this.$worldView = $worldView
        this.numProjectiles = numProjectiles
        this.angle = 45;
        this.id = 0;

        this.direction = Physics.Vec2(1, 1) // Direction cannon faces
        
        const bulletList = []                // List of bullets currently in the level

        this.bulletList = bulletList;
        
        
        document.querySelector('#game-area').addEventListener("click", this.OnShoot)

    }

        
    render() {
        // TODO: Nick
        //      Render movement on arrow keys held down / follow mouse to have (Gun?) visually follow
        //      Create graphic for the level of power to use (or functionality to choose)
        //      Stop cannon movement if no projectiles left 
        
        this.bulletList.forEach(element => {
            element.render();
        });
    }

    update() {
        // TODO: Andre
        //      Destroy any bullet based on some condition (like moving slowly, time...)
        
        this.bulletList.forEach(element => {
            element.update();
        });
    }


    OnShoot = () => {
        // TODO: Andre
        //          Shoot with certain force and direction

        // TODO: ANDRE: REMOVE THIS.BULLET, PLACE INSIDE ARRAY
        
        let positionX = 30
        let positionY = Point.HALF.HEIGHT + 200

        //this.id = this.bullet.index;
        // let cannonPos = new b2Vec2(positionX, positionY)
        const cannonPos = new Physics.Vec2(positionX, positionY)

        //create bullet at cannons position
        
        let bullet = new Bullet(this.world, this.$worldView, this.id)
        
        bullet.CreateBulletObject(cannonPos, 10)
        this.bulletList.push(bullet)

        //add the bullet to an array
        //this.bulletList.push(this.bullet)

        console.log(this.bulletList)

        //apply impulse to bullet
        bullet.ShootBullet(new Physics.Vec2(30000, -8000), cannonPos)
        
    }
}