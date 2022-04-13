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

        this.direction = Physics.Vec2(1, 1) // Direction cannon faces
        this.bulletList = []                // List of bullets currently in the level

        
        
        document.querySelector('#game-area').addEventListener("click", this.OnShoot)
    }

        
    render() {
        // TODO: Nick
        //      Render movement on arrow keys held down / follow mouse to have (Gun?) visually follow
        //      Create graphic for the level of power to use (or functionality to choose)
        //      Stop cannon movement if no projectiles left 
    }

    update() {
        // TODO: Andre
        //      Destroy any bullet based on some condition (like moving slowly, time...)
        //console.log(this.OnShoot.cannonPos)
        
        if(this.bullet != null)
        {
            this.bullet.update();
        }
        
    }


    OnShoot = () => {
        // TODO: Andre
        //          Shoot with certain force and direction

        this.bullet = new Bullet(this.world, this.$worldView)

        let positionX = $('#game-area').offset().left
        let positionY = $('#game-area').offset().top //- $('#game-area').height() + 10;

        // let cannonPos = new b2Vec2(positionX, positionY)
        const cannonPos = new Physics.Vec2(positionX, positionY)

        //create bullet at cannons position
        this.bullet.CreateBulletObject(cannonPos, 0.3)

        //apply impulse to bullet
        this.bullet.ShootBullet(1000, 0, cannonPos, 45)
        
    }
}