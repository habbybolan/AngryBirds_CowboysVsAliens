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

        this.bullet = new Bullet(this.world, this.$worldView)
        
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
        //console.log(this.bullet.Point)
    }


    OnShoot() {
        // TODO: Andre
        //          Shoot with certain force and direction

        this.bullet.CreateBulletObject()
        

        
        
        
    }
}