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

        this.cannon = new Cannon(this.world, this.$view, this.data.projectiles)

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
        
        if (!resLevel.error) {
            //this.level = new Level(resLevel.payload);
            collidablesData = resLevel.payload.entities.collidables
            targetsData = resLevel.payload.entities.targets
        }
        this.addGameObjectsFromData(collidablesData)
        this.addGameObjectsFromData(targetsData)
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
        return true;
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

    update() {

        this.cannon.update();
        // check for all collisions and proceess them
        this.CheckCollisions()
    }

    render() {
        // render collidables
        for (let collidable of this.data.collidableList) {
            collidable.render();
        }
        // render targets
        for (let target of this.data.targetList) {
            target.render();
        }
    }

    /**
     * Check for any collisions between gameObjects as well as bullets.
     * Send collion data to the gameObjects to deal with damage
     */
    CheckCollisions() {
        // TODO: Andre
        //      Check for collisions of all gameObjects and bullets 
        //      Apply collision with OnHit() method in GameObject??
        //      Deal with if object is destroyed, remove from world and remove from list in this class
        //      This collision logic and dealing with it is probably going to be your bigget task

        //this.listener = new Physics.Listener;
    }
}