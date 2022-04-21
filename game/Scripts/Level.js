// Copyright (C) Nicholas Johnson 2022
'use strict'

import Cannon from "./Cannon.js";
import GameObject from "./GameObject.js"
import { enitityTypesEnum } from "./GameObject.js"

export default class Level {

    /**
     * @param {JQuery} $view    GameScreen view
     * @param {b2World} world   World object
     */
    constructor ($view, world) {
        this.$view = $view
        this.world = world;
        this.data = {}
        this.data.collidableList = []  // Collidable GameObjects
        this.data.targetList = []      // target GameObjects
        
        this.isLoaded = false        
    }

    /**
     * Load the level and create all GameObjects
     * @param {String} filename     Filename of level to load
     */
    async LoadLevel(filename) {
        this.filename = filename
        let collidablesData = [];   // Level collidables data from server
        let targetsData = [];       // level targets data from server

        let data = JSON.stringify({type: "level", name: filename})
        let resLevel = await $.post('/api/load', { data })
        resLevel = JSON.parse(resLevel);
        
        if (!resLevel.error) {
            //this.level = new Level(resLevel.payload);
            collidablesData = resLevel.payload.entities.collidables
            targetsData = resLevel.payload.entities.targets
        }
        this.addGameObjectsFromData(collidablesData)
        this.addGameObjectsFromData(targetsData)

        this.$view.css("background-image", `url(${resLevel.payload.background})`)

        this.cannon = new Cannon(this.world, this.$view, resLevel.payload.projectiles)

        this.isLoaded = true
    }

    reloadLevel() {
        this.data.collidableList = []  
        this.data.targetList = []  
        this.isLoaded = false 
        this.LoadLevel(this.filename)
    }

    /**
     * Calculates the score based on the number of projectiles left
     * @returns {Float}   Calculated final score
     */
    CalcScore() {
        if(this.cannon != null)
        {   
            return this.cannon.numProjectiles * 100
        }
    }

    /**
     * Checks if all objects are going slow enough to be considered stopped.
     * Used when no projectiles are left and used for checking if the game should end
     * @returns {Boolean} True if all objects stopped
     */
    IsAllObjectsStopped() {
        for(let i = 0; i < this.data.collidableList.length; i++)
        {
            let collidable = this.data.collidableList[i]
            if(!collidable.isDeleted && collidable.body.GetLinearVelocity().Length() >= 1) {
                return false
            }  
        }

        for(let i = 0; i < this.data.targetList.length; i++)
        {
            let target = this.data.targetList[i]
            if(!target.isDeleted && this.data.targetList[i].body.GetLinearVelocity().Length() >= 1) {
                return false
            }
        }

        if(this.cannon != null)
        {
            for(let i = 0; i < this.cannon.bulletList.length; i++)
            {
                if(this.cannon.bulletList[i].bulletObject.body.GetLinearVelocity().Length() >= 1)
                {
                    return false
                }
            }
        }
        
        return true;
    }

    allTargetsDestroyed()
    {
        for(let i = 0; i < this.data.targetList.length; i++)
        {
            if(!this.data.targetList[i].isDeleted)
                return false
        }
        return true
    }

    outOfProjectiles()
    {
        if(this.cannon != null)
        {
            if(this.cannon.numProjectiles <= 0)
            {
                return true
            }
        }
        return false    
    }

    /**
     * Add a list of game objects 
     * @param {JSON} listOfObjects  List of data for GameObjects to add
     */
     addGameObjectsFromData(listOfObjects) {
        for (let gameObjectData of listOfObjects) {
            let type = gameObjectData.type
            let newGameObject = new GameObject(this.world, this.$view);
            newGameObject.initiateFromRawData(gameObjectData)
            if (type == enitityTypesEnum.COLLIDABLE) {
                this.data.collidableList.push(newGameObject)
            } else {
                this.data.targetList.push(newGameObject)
            }
        }
    }

    update(deltaTime) {

        if(this.cannon != null)
        {
            this.cannon.update(deltaTime);
        }

        // update collidables
        for (let collidable of this.data.collidableList) {
            collidable.update(deltaTime);
        }
        // update targets
        for (let target of this.data.targetList) {
            target.update(deltaTime);
        }
    }

    render(deltaTime) {
        // render collidables
        for (let collidable of this.data.collidableList) {
            collidable.render(deltaTime);
        }
        // render targets
        for (let target of this.data.targetList) {
            target.render(deltaTime);
        }

        if(this.cannon != null)
        {
            this.cannon.render(deltaTime)
        }
        
    }
}