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
        this.power = 1.5
        this.angle = 0     // Angle in degrees
        
        this.setupKeyboardHandlers()

        this.createGun()
    }

    setupKeyboardHandlers() {
        $('#game-area').on("click", this.OnShoot)

        $(document).on('keypress', event => {
            var name = event.key;
            
            //angle down
            if(name === 's' && this.angle < 0)
            {
                this.angle += 10
                console.log(this.angle)
            }

            //angle ups
            if(name === 'w' && this.angle > -55)
            {
                this.angle -= 10
                console.log(this.angle)
            }

            //power up
            if(name === 'q' && this.power <= 2)
            {
                this.power += .1
                console.log(this.power)
            }

            //power down
            if(name === 'e' && this.power >= 1)
            {
                this.power -= .1
                console.log(this.power)
            }
        })
    }

    createGun() {
        this.gunHeight = 60
        this.gunWidth = 150
        this.$view = $(`<div id="pistol" 
                        class="gun-image"
                        style="height: ${this.gunHeight}px; 
                            width: ${this.gunWidth}px; 
                            background-image: url(/images/pistol.png);" ></div>`)
        this.$worldView.append(this.$view)  
        this.$view.offset({left: $('#game-area').offset().left, top: $('#game-area').offset().top + Point.SCREEN.HEIGHT - this.gunHeight})
    }
        
    render(deltaTime) {
        // TODO: Nick
        //      Render movement on arrow keys held down / follow mouse to have (Gun?) visually follow
        //      Create graphic for the level of power to use (or functionality to choose)
        //      Stop cannon movement if no projectiles left 

        this.$view.css('transform', ``)
        this.$view.css('transform', `rotate(${this.angle}deg)`)
        
        this.bulletList.forEach(bullet => {
            bullet.render(deltaTime);
        });
    }

    update(deltaTime) {
        this.bulletList.forEach(bullet => {
            bullet.update(deltaTime);
        });

        let firstbullet = this.bulletList[0]
        if (this.bulletList.length != 0 && firstbullet.timer > 10000) {
            this.bulletList.shift().destroyBullet()
        }
    }

    OnShoot = () => {

        // Only shoot if there are remaining projectiles and the last bullet shot has collided
        if(this.numProjectiles > 0 && (this.bulletList.length == 0 || this.bulletList[this.bulletList.length - 1].getIsCollided()))
        {
            //cannon pos x and y
            let gunCenterRotX = 0
            let gunCenterRotY = Point.SCREEN.HEIGHT

            let originalXPos = gunCenterRotX + this.gunWidth
            let originalYPos = gunCenterRotY - this.gunHeight

            let xRot = gunCenterRotX + Math.cos(this.angle * Physics.DEG_2_RAD) * (originalXPos - gunCenterRotX) - Math.sin(this.angle * Physics.DEG_2_RAD) * (originalYPos - gunCenterRotY) 
            let yRot = gunCenterRotY + Math.cos(this.angle * Physics.DEG_2_RAD) * (originalYPos - gunCenterRotY) + Math.sin(this.angle * Physics.DEG_2_RAD) * (originalXPos - gunCenterRotX) 

            console.log(`(${xRot}, ${yRot})`)
    
            //cannon pos
            const cannonBarrelPos = new Physics.Vec2(xRot - 15, yRot - 15)
    
            //create new bullet
            let bullet = new Bullet(this.world, this.$worldView, this.id++)
            
            //create bullet at cannons position
            bullet.CreateBulletObject(cannonBarrelPos, 10)
    
            //add bullet to array
            this.bulletList.push(bullet)
    
            console.log(this.bulletList)
    
            //apply impulse to bullet
            let XPower = Math.cos(this.angle * Physics.DEG_2_RAD) * this.power * 20000
            let YPower = Math.sin(this.angle * Physics.DEG_2_RAD) * this.power * 20000

            bullet.ShootBullet(new Physics.Vec2(XPower, YPower))

            //remove 1 ammo
            this.numProjectiles--
        }  
    }
}