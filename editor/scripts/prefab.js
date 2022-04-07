'use strict'

export default class Prefab {

    /** 
     * @param {JSON} sourceData {  id, texture, height, width, bounce, mass, friction, name, type, shape, filename }
     */
    constructor( sourceData ) {
        if (!sourceData)
            throw "sourceData is empty"

        this.data = { ...sourceData }
        this.$view = null;
    }

    serialize() {
        return { ...this.data }
    }

    /**
     * @param {Function(message, errorCode, prefab, bNewPrefab)} callback    Callback function when save successful/failed
     */
    onSave(callback) {
        let payload = this.serialize()
        let data = { payload }
        data.type = "object"
        data.name = payload.filename

        data = JSON.stringify(data)
        $.post('/api/save', {data})
        .then(responseString => JSON.parse(responseString))
        .then(response => {
            if (!response.error) {
                // if updating an existing prefab
                if (this.data.filename)
                    callback("Refresh page to load new prefab look", 0, this, false)
                // Otherwise creating new prefab, can add directly to level
                else {
                    this.data.filename = response.filename;
                    callback("New prefab saved", 0, this, true)
                } 
            } else {
                if (response.error == 2)
                    callback("Prefab names must be unique", response.error)
                else
                    callback("Prefab save failed", response.error)
            }
        })
        .catch(error => callback("Prefab save failed: " + error.message, -1))
    }


    /**
     * @param {Function(message, errorCode, prefab)} callback    Callback function when save successful/failed
     */
    onDelete(callback) {
        let data = JSON.stringify({name: this.getFilenameWithoutExtension(this.data.filename), type: "object"}) 
        $.post(`/api/delete`, {data})
            .then(responseString => JSON.parse(responseString))
            .then(response => {
                if (!response.error) {
                    callback("Prefab deleted", 0, this)
                } else {
                    callback(`Prefab still references in levels: ${response.levels}`, response.error)
                }
            })
            .catch(error => callback("Prefab delete failed: " + error.message, -1))
    }

    /**
     * TODO: Repeat method from level-selector.js
     * Get the filename without the .json extension
     * @param {String} filename     .json filename
     * @returns                     Filename without the extension
     */
     getFilenameWithoutExtension(filename) {
        return filename.substr(0, filename.lastIndexOf('.')) || filename;
    }

    isInvalidPrefab() {
        if (this.height <= 10 || this.width <= 10)
            return "Cannot have width or height <= 10"
        
        if (this.mass <= 0)
            return "Cannot have a negative or 0 mass"

        if (this.friction < 0 || this.friction > 1 || this.bounce < 0 || this.bounce > 1)
            return "Cannot have a negative or > 1 friction or bounce";
        
        if (this.name == "" || this.texture == "")
            return "cannot have an empty name or texture"

        return false
    }
    
    static getTriangleCollidables() {
        return ['stone-square.jpg']
    }

    static getSquareCollidables() {
        return ['brick-square.png']
    }

    static getCircleImages() {
        return ['stone-square.jpg']
    }

    getNewIndex() {
        return `prefab-${Prefab.staticIndex++}`
    }


    // getters / setters

    get mass() { return this.data.mass }
    get view() { return this.$view }
    get height() { return this.data.height }
    get width () { return this.data.width }
    get friction() { return this.data.friction }
    get type() { return this.data.type }
    get id() { return this.data.id } 
    get bounce() { return this.data.bounce }
    get texture() { return this.data.texture }
    get filename() { return this.data.filename }   
    get name() { return this.data.name }
    get shape() { return this.data.shape }

    get AllDdata() { return this.data }
}

Prefab.staticIndex = 0;

export let shapesEnum  = {
    SQUARE: "square",
    CIRCLE: "circle",
    TRIANGLE: "triangle"
}