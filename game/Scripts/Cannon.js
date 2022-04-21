// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'
import Bullet from './Bullet.js';


export default class Cannon {

    constructor(world, $worldView, numProjectiles) {
        this.world = world;
        this.$worldView = $worldView
        this.maxNumProjectiles = numProjectiles;    // Keep track of max number of projectiles
        this.numProjectiles = numProjectiles        // remaining projectiles
        this.id = 0                                 // id count for number of projectiles spawned

        this.direction = Physics.Vec2(1, 1)         // Direction cannon faces

        this.bulletList = []                        // List of currently spawned projectiles

        this.maxPower = 2
        this.minPower = 1
        this.powerChangeAmount = .1
        this.power = 1.5    // Power of shot
        this.angle = 0      // Angle of shot in degrees
        
        this.setupKeyboardHandlers()

        this.createGun()

        this.addCannonUI()
    }

    setupKeyboardHandlers() {
        $('#game-area').on("click", this.OnShoot)

        $(document).on('keypress', event => {
            var name = event.key;
            
            //angle down
            if(name === 's' && this.angle < 0)
            {
                this.angle += 10
            }

            //angle ups
            if(name === 'w' && this.angle > -55)
            {
                this.angle -= 10
            }

            //power up
            if(name === 'q' && this.power < this.maxPower)
            {
                this.power += this.powerChangeAmount
                this.updatePowerBar()
            }

            //power down
            if(name === 'e' && this.power > this.minPower)
            {
                this.power -= this.powerChangeAmount
                this.updatePowerBar()
            }
        })
    }

    updatePowerBar() {
        $("#power-meter").attr("value", 100 * (this.power - this.minPower) / (this.maxPower - this.minPower))
    }

    createGun() {
        this.gunHeight = 60
        this.gunWidth = 150
        this.$gunview = $(`<div id="pistol" 
                        class="gun-image"
                        style="height: ${this.gunHeight}px; 
                            width: ${this.gunWidth}px; 
                            background-image: url(/images/pistol.png);" ></div>`)
        this.$worldView.append(this.$gunview)  
        this.$gunview.offset({left: $('#game-area').offset().left, top: $('#game-area').offset().top + Point.SCREEN.HEIGHT - this.gunHeight})
    }

    addCannonUI() {
        $("#projectile-number-container").empty()
        for (let i = 0; i < this.numProjectiles; i++) {
            let $projectileUI =  $(`<div id="projectile-ui-${i}" 
                                    class="projectile-number-display bullet-filled">
                                    </div>`)
            $("#projectile-number-container").append($projectileUI)
        }
        this.updatePowerBar()
    }
        
    render(deltaTime) {
        this.$gunview.css('transform', ``)
        this.$gunview.css('transform', `rotate(${this.angle}deg)`)
        
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
            // Get position cannon shot at given the rotation of the gun
            let gunCenterRotX = 0
            let gunCenterRotY = Point.SCREEN.HEIGHT

            let originalXPos = gunCenterRotX + this.gunWidth
            let originalYPos = gunCenterRotY - this.gunHeight

            let xRot = gunCenterRotX + Math.cos(this.angle * Physics.DEG_2_RAD) * (originalXPos - gunCenterRotX) - Math.sin(this.angle * Physics.DEG_2_RAD) * (originalYPos - gunCenterRotY) 
            let yRot = gunCenterRotY + Math.cos(this.angle * Physics.DEG_2_RAD) * (originalYPos - gunCenterRotY) + Math.sin(this.angle * Physics.DEG_2_RAD) * (originalXPos - gunCenterRotX) 
    
            // cannon barrel position
            const cannonBarrelPos = new Physics.Vec2(xRot - 15, yRot - 15)
    
            //create new bullet
            let bullet = new Bullet(this.world, this.$worldView, this.id++)
            
            //create bullet at cannons position
            bullet.CreateBulletObject(cannonBarrelPos, 10)
    
            //add bullet to array
            this.bulletList.push(bullet)
    
            //apply impulse to bullet
            let XPower = Math.cos(this.angle * Physics.DEG_2_RAD) * this.power * 50000
            let YPower = Math.sin(this.angle * Physics.DEG_2_RAD) * this.power * 50000

            bullet.ShootBullet(new Physics.Vec2(XPower, YPower))
            
            //remove 1 ammo
            this.numProjectiles--

            // TODO: Update list of projectiles displayed
            let $projectileViewToAlter = $("#projectile-number-container").children().eq(this.numProjectiles)
            $projectileViewToAlter.removeClass("bullet-filled")
            $projectileViewToAlter.addClass("bullet-empty")
        }  
    }
}