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

        //this.cannon = new Cannon(this.world, this.$view, this.data.projectiles)

        //this.cannon.OnShoot();

        
    }

    /**
     * Load the level and create all GameObjects
     * @param {String} filename     Filename of level to load
     */
    async LoadLevel(filename) {
        let collidablesData = [];   // Level collidables data from server
        let targetsData = [];       // level targets data from server

        let data = JSON.stringify({type: "level", name: filename})
        let resLevel = await $.post('/api/load', { data })
        resLevel = JSON.parse(resLevel);
        console.log(resLevel)
        
        if (!resLevel.error) {
            //this.level = new Level(resLevel.payload);
            collidablesData = resLevel.payload.entities.collidables
            targetsData = resLevel.payload.entities.targets
        }
        this.addGameObjectsFromData(collidablesData)
        this.addGameObjectsFromData(targetsData)

        this.cannon = new Cannon(this.world, this.$view, resLevel.payload.projectiles)
    }

    

    /**
     * Calculates the score based on the number of projectiles left (and number gameObjects destroyed?)
     * @returns {Float}   Calculated final score
     */
    CalcScore() {
        // TODO: Andre
        //      get the score based on number of projectiles left, and perhaps the number of gameObjects that were destroyed
        //          You would have to keep track of number of destoyed and perhaps their mass to get a final score, up to you...
    }

    /**
     * Checks if all objects are going slow enough to be considered stopped.
     * Used when no projectiles are left and used for checking if the game should end
     * @returns {Boolean} True if all objects stopped
     */
    IsAllObjectsStopped() {
        // TODO: Andre
        //      Check if all game objects are not moving
        for(let i = 0; i < this.data.collidableList.length; i++)
        {

        }

        for(let i = 0; i < this.data.targetList.length; i++)
        {

        }

        if(this.cannon != null)
        {
            for(let i = 0; i < this.cannon.bulletList.length; i++)
            {
                if(this.cannon.bulletList[i].body.GetLinearVelocity().Length() > 0)
                    return false
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

    outOfPorjectiles()
    {
        if(this.cannon.numProjectiles <= 0)
        {
            return true
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