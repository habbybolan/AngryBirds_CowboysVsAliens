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
        this.id = 0

        this.direction = Physics.Vec2(1, 1) // Direction cannon faces

        this.bulletList = []

        this.maxBullets = 3;

        this.timer = 0;
        
        $('#game-area').on("click", this.OnShoot)

    }

        
    render(deltaTime) {
        // TODO: Nick
        //      Render movement on arrow keys held down / follow mouse to have (Gun?) visually follow
        //      Create graphic for the level of power to use (or functionality to choose)
        //      Stop cannon movement if no projectiles left 
        
        this.bulletList.forEach(element => {
            element.render(deltaTime);
        });

        
        
    }

    update(deltaTime) {
        // TODO: Andre
        //      Destroy any bullet based on some condition (like moving slowly, time...)
        //IMPORTANT DO THIS FIRST - Andre
        
        this.bulletList.forEach(element => {
            element.update(deltaTime);
        });


        //bullet life timer
        this.timer += deltaTime
        console.log(this.timer)

        //remove bullet time
        if(this.timer > 10000)
        {
            //removes bullet from bulletList
            this.bulletList.pop()
            $(`#${this.id}`).remove()
            //reset timer
            this.timer = 0;
        }        
    }


    OnShoot = () => {

        //will only create and shoot a new bullet if there is no active bullet and the player has ammo
        if(this.maxBullets > 0 && this.bulletList.length == 0)
        {
            //cannon pos x and y
            let positionX = 30
            let positionY = Point.HALF.HEIGHT + 200
    
            //cannon pos
            const cannonPos = new Physics.Vec2(positionX, positionY)
    
            //create new bullet
            let bullet = new Bullet(this.world, this.$worldView, this.id)
            
            //create bullet at cannons position
            bullet.CreateBulletObject(cannonPos, 10)
    
            //add bullet to array
            this.bulletList.push(bullet)
    
            console.log(this.bulletList)
    
            //apply impulse to bullet
            bullet.ShootBullet(new Physics.Vec2(30000, -8000), cannonPos)

            //remove 1 ammo
            this.maxBullets--

            //reset timer to zero
            this.timer = 0;
        }

        
        
    }
}