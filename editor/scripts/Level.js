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

        this.collidableCount = 0
        this.targetCount = 0

        delete this.data.entities; 

        if (!sourceData) {
            this.data.filename = undefined;                   
            this.data.name = "default name";   
            this.data.projectiles = 10;         
            this.data.cannon = {x: 0, y: 0};   
        }

        this.data.collidables = []  // Collidable GameObjects
        this.data.targets = []      // target GameObjects
    }

    serialize() {
        // serialize level data
        let levelJSON = {filename: this.data.filename,
                        name: this.data.name,
                        projectiles: this.data.projectiles,
                        cannon: this.data.cannon,
                        background: this.data.background}
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
     * Add a new game object to the level at position x, y from prefab view data
     * @param {JQuery} $prefabView   Prefab view to create GameObject from    
     * @param {int} x               X position to place GameObject
     * @param {int} y               Y position to place GameObject 
     * @returns                     Newly created GameObject
     */
     addGameObjectFromPrefab($prefabView, x, y) {
        let type = $prefabView.hasClass(enitityTypesEnum.COLLIDABLE) ? enitityTypesEnum.COLLIDABLE : enitityTypesEnum.TARGET
        let newObject = new GameObject()
        newObject.initiateFromPrefab($prefabView, x, y, this.getNewGameObjectID(type), type)
        
        if (type == enitityTypesEnum.COLLIDABLE) {
            this.data.collidables.push(newObject)
        } else {
            this.data.targets.push(newObject)
        }
        return newObject;
    }

    /**
     * Load all possible background images can be applied to level, and display the current background image.
     * If no background image exists, set as first loaded (Case for newly created levels)
     */
    async loadBackgroundImagesAndDisplay() {
        let responseString = await $.post('/api/loadBackgrounds');
        let response = JSON.parse(responseString);
        if (!response.error) {
            this.backgroundImages = response.payload;

            // if The level has no background image, default to first one loaded
            if (this.backgroundImages.length > 0)
                this.data.background = this.backgroundImages[0]
        }
    }

    selectNewBackgroundImage(index) {
        this.background = this.backgroundImages[index]
    }

    backgroundImageDisplayString(index) {
        return this.backgroundImageDisplayStringFromULR(this.backgroundImages[index])
    }

    selectedBackgroundImageDisplayString() {
        if (!this.data.background)
            return ""
        return this.backgroundImageDisplayStringFromULR(this.data.background)
    }

    backgroundImageDisplayStringFromULR(url) {
        return url.substring(url.lastIndexOf("/") + 1)
    }

    /**
     * Add a list of game objects 
     * @param {JSON} listOfObjects  List of data for GameObjects to add
     * @returns                     List of GameObjects that were added
     */
    addGameObjectsFromData(listOfObjects) {
        let gameObjectsAdded = []   // keep track of objects added for returning
        for (let gameObjectData of listOfObjects) {
            let type = gameObjectData.type
            let newGameObject = new GameObject();
            newGameObject.initiateFromRawData(gameObjectData, this.getNewGameObjectID(type))
            if (type == enitityTypesEnum.COLLIDABLE) {
                this.collidables.push(newGameObject)
            } else {
                this.targets.push(newGameObject)
            }
            gameObjectsAdded.push(newGameObject);
        }
        return gameObjectsAdded;
    }

    /**
     * Get a valid id for a new GameObject to add to level
     * @param {enitityTypesEnum} type   GameObject type
     * @returns                         New valid id
     */
    getNewGameObjectID(type) {
        return type == enitityTypesEnum.COLLIDABLE ? 
                `${enitityTypesEnum.COLLIDABLE}-${this.collidableCount++}` : 
                `${enitityTypesEnum.TARGET}-${this.targetCount++}`
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
        $.post('/api/save', {data})
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
    get background() { return this.data.background }
    get allBackground() { return this.backgroundList }

    set filename(val) { this.data.filename = val }
    set name(val) { this.data.name = val }
    set projectiles(val) { this.data.projectiles = val }
    set background(val) { this.data.background = val }
}