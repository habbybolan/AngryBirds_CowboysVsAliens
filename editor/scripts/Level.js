// Copyright (C) Nicholas Johnson 2022
'use strict'

import GameObject, {enitityTypesEnum} from "./GameObject.js"

export default class Level {

    /**
     * Constructor for loading an existing level
     * filename:    Filename level stored in
     * name:        Level name
     * projectiles: Projectile speed
     * cannon:      x, y coordiantes of the cannon
     * @param {JSON} sourceData {filename: string, name: string, projectiles: int, cannon: {x: int, y: int}}
     */
    constructor (sourceData) {

        this.data = { ...sourceData }

        delete this.data.entities; // TODO: this seems bad?

        if (!sourceData) {
            this.data.filename = undefined;                   
            this.data.name = "default name";   
            this.data.projectiles = 10;         
            this.data.cannon = {x: 0, y: 0};   
        }

        this.data.collidables = []           // Collidable GameObjects
        this.data.targets = []               // target GameObjects


        // max shots
        // background image
        // 1/2/3 start score
    }

    serialize() {
        // serialize level data
        let levelJSON = {filename: this.data.filename,
                        name: this.data.name,
                        projectiles: this.data.projectiles,
                        cannon: this.data.cannon}
        levelJSON.entities = {targets: [], collidables: []}

        // serialize target data
        for (let target of this.data.targets) {
            levelJSON.entities.targets.push(target.serialize())
        }

        // serialize collidable data
        for (let collidable of this.data.collidables) {
            levelJSON.entities.collidables.push(collidable.serialize())
        }
        return levelJSON;
    }

    /**
     * Add a new game object to the level at position x, y
     * @param {JSON} sourceData                 {id: int, type: string, x: int, y: int, enitityTypesEnum entityType}
     */
    addGameObject(sourceData) {
        let gameObject = new GameObject(sourceData) // New object to insert into level

        // inserting a collidable object
        if (sourceData.type == enitityTypesEnum.COLLIDABLE) {
            this.data.collidables.push(gameObject);
        // otherwise inserting a target object
        } else {
            this.data.targets.push(gameObject);
        }
    }

    /**
     * Remove an stored gameObject based on the id
     * @param {String} idToDelete   id of game object to delete
     */
    removeGameObject(idToDelete) {
        if (idToDelete.includes("target")) {
            this.removeGameObjectsHelper(idToDelete, this.data.targets)
        } else {
            this.removeGameObjectsHelper(idToDelete, this.data.collidables)
        }
    }

    /**
     * Helper for removing a stored game object
     * @param {String} idToDelete                       id of game object to delete
     * @param {Array<GameObject>} listOfGameObjects     Array of stored targets/prefabs 
     */
    removeGameObjectsHelper(idToDelete, listOfGameObjects) {
        for (let i = 0; i < listOfGameObjects.length; i++) {
            if (listOfGameObjects[i].id == idToDelete) {
                listOfGameObjects.splice(i, 1)
                return
            }
        }
        throw `No GameObject with id: ${idToDelete}`
    }

    /**
     * @param {Function(message)} callback    Callback function when save successful/failed
     */
    onSave(callback) {
        let payload = this.serialize();
        let data = { payload }
        data.type = "level"
        data.name = payload.filename

        data = JSON.stringify(data);
        $.post('api/save', {data})
            .then(responseString => JSON.parse(responseString))
            .then(response => {
                if (!response.error) {
                    if (this.data.filename)
                        callback("Level saved successful")
                    else {
                        this.data.filename = response.filename;
                        callback("New level Created", true)
                    }
                    
                    
                } else {
                    if (response.error == 2)
                        callback("Level name must be unique")
                    else
                        callback("Level save failed")
                }
            })
            .catch(error => callback("Level save failed: " + error.message))
    }

    /**
     * Update the location of an already existing GameObject in level
     * @param {String} id                   unique id of GameObject
     * @param {int} x                       location x to update GameObject to
     * @param {int} y                       location y to update GameObject to
     * @param {enitityTypesEnum} entityType Either a collidable or target type
     */
    updateGameObjectLocation(id, x, y, entityType) {

        let isUpdated = false;  // Checks if the object with id was found and updated
        // updating a collidable object position
        if (entityType == enitityTypesEnum.COLLIDABLE) {
            for (let collidable of this.data.collidables) {
                if (collidable.id == id) {
                    collidable.updatePosition(x, y)
                    isUpdated = true;
                    break;
                }
            }
        // otherwise updating a target object position
        } else {
            for (let target of this.data.targets) {
                if (target.id == id) {
                    target.updatePosition(x, y);
                    isUpdated = true;
                    break;
                }
            }
        }
        // Cannot update an GameObject that doesn't exist
        if (!isUpdated)
            throw `No object with id: ${id} exists`
    }

    getTargetOfName(targetName) {
        for (let target of targets) {
            if (target.name == targetName)
                return target;
        }
        throw `Target with name: ${targetName} does not exist`
    }

    getCollidableOfName(collidableName) {
        for (let collidable of collidables) {
            if (collidable.name == collidableName)
                return collidable;
        }
        throw `Collidable with name: ${collidableName} does not exist`
    }

    // Getters 

    get collidables() { return this.data.collidables }
    get targets() { return this.data.targets }
    get filename() { return this.data.filename }
    get name() { return this.data.name }
    get projectiles() { return this.data.projectiles }
    get cannon() { return this.data.cannon }

    set filename(val) { this.data.filename = val }
    set name(val) { this.data.name = val }
    set projectiles(val) { this.data.projectiles = val }
}