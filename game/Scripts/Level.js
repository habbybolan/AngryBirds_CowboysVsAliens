// Copyright (C) Nicholas Johnson 2022
'use strict'

import GameObject from "./GameObject.js"
import { enitityTypesEnum } from "./GameObject.js"

export default class Level {

    constructor ($view, world) {
        this.$view = $view
        this.world = world;
        this.data = {}
        this.data.collidableList = []  // Collidable GameObjects
        this.data.targetList = []      // target GameObjects
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
            this.level = new Level(resLevel.payload);
            collidablesData = resLevel.payload.entities.collidables
            targetsData = resLevel.payload.entities.targets
        }
        this.addGameObjectsFromData(collidablesData)
        this.addGameObjectsFromData(targetsData)
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
        
    }

    render() {
        for (let collidable of this.data.collidableList) {
            collidable.render();
        }
        for (let target of this.data.targetList) {
            target.render();
        }
    }

}