// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'
import Bullet from './Bullet.js';


export default class Cannon {

    constructor(world, $worldView, numProjectiles) {
        this.world = world;
        this.$worldView = $worldView
        this.numProjectiles = numProjectiles //Change to "numProjectiles" when numPorjectiles actually gets grabbed from server/level data
        this.id = 0

        this.direction = Physics.Vec2(1, 1) // Direction cannon faces

        this.bulletList = []

        //Power and angle
        this.power = 1
        this.angle = 45     // Angle in degrees
        
        $('#game-area').on("click", this.OnShoot)

        $(document).on('keypress', event => {
            var name = event.key;
            
            //angle down
            if(name === 's' && this.angle != 10)
            {
                this.angle -= 10
                console.log(this.angle)
            }

            //angle up
            if(name === 'w' && this.angle != -10)
            {
                this.angle += 10
                console.log(this.angle)
            }

            //power up
            if(name === 'q' && this.power != 10)
            {
                this.power += 1
                console.log(this.power)
            }

            //power down
            if(name === 'e' && this.power != -10)
            {
                this.power -= 1
                console.log(this.power)
            }
        })
    }

        
    render(deltaTime) {
        // TODO: Nick
        //      Render movement on arrow keys held down / follow mouse to have (Gun?) visually follow
        //      Create graphic for the level of power to use (or functionality to choose)
        //      Stop cannon movement if no projectiles left 
        
        this.bulletList.forEach(bullet => {
            bullet.render(deltaTime);
        });
    }

    update(deltaTime) {
        this.bulletList.forEach(bullet => {
            bullet.update(deltaTime);
        });

        let lastBullet = this.bulletList[this.bulletList.length - 1]
        if (this.bulletList.length != 0 && lastBullet.timer > 10000) {
            //delete bullet
            console.log(lastBullet.id)
            $(`#${lastBullet.id}`).remove()
            //removes bullet from bulletList and calls function to remove physics body
            this.bulletList.pop().destroyBody()
        }
    }

    OnShoot = () => {

        // Only shoot if there are remaining projectiles and the last bullet shot has collided
        if(this.numProjectiles > 0 && (this.bulletList.length == 0 || this.bulletList[this.bulletList.length - 1].getIsCollided()))
        {
            //cannon pos x and y
            let positionX = 30
            let positionY = Point.HALF.HEIGHT + 200
    
            //cannon pos
            const cannonPos = new Physics.Vec2(positionX, positionY)
    
            //create new bullet
            let bullet = new Bullet(this.world, this.$worldView, this.id++)
            
            //create bullet at cannons position
            bullet.CreateBulletObject(cannonPos, 10)
    
            //add bullet to array
            this.bulletList.push(bullet)
    
            console.log(this.bulletList)
    
            //apply impulse to bullet
            let XPower = Math.cos(this.angle) * this.power * 1000
            let YPower = Math.sin(this.angle) * this.power * 1000

            bullet.ShootBullet(new Physics.Vec2(XPower, YPower))

            //remove 1 ammo
            this.numProjectiles--
        }  
    }
}