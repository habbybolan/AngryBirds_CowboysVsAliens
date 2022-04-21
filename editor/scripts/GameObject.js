// Copyright (C) 2022 Nicholas Johnson
'use strict'

export default class GameObject {

    // Empty constructor, use initiate... methods to create object
    constructor() {}

    /**
     * @param {JQuery} $prefabView   Prefab view to create GameObject from    
     * @param {int} x               X position to place GameObject
     * @param {int} y               Y position to place GameObject
     * @param {string} id           id of new GameObject    
     */
    initiateFromPrefab($prefabView, x, y, id, type) {
        this.data = {}
        this.$view = $(`<div id="${id}" 
                            type="${type}" 
                            draggable="true" 
                            class="placed"
                            name="${this.data.name}"></div>`)

        this.$view.prop("style", $prefabView.attr("style"))
                  .addClass($prefabView.attr("class"))

        this.data.x = x
        this.data.y = y
        this.data.type = type
        this.data.name = $prefabView.attr("name")
        this.data.id = id;
    }

    /**
     * 
     * @param {JSON} sourceData {bounce, filename, friction, height, id, mass, 
     *                          name, shape, texture, type, value, width, (w)x, (w)y}
     * @param {int} id          id to set for gameObject 
     */
    initiateFromRawData(sourceData, id) {
        this.data = sourceData
        this.data.id = id
        // Convert wx to x for targets
        if (this.data.wx) {
            this.data.x = this.data.wx
            delete this.data.wx
        }
        // Convert wy to y for targets
        if (this.data.wy) {
            this.data.y = this.data.wy
            delete this.data.wy
        }
        this.$view = $(`<div id="${this.data.id}" 
                            type="${this.data.type}" 
                            draggable="true" 
                            class="placed draggable ${this.data.type}"
                            name="${this.data.name}"
                            style="height: ${sourceData.height}px; 
                                width: ${sourceData.width}px; 
                                background-image: url(${this.data.texture});" ></div>`)
    }
    
    serialize() {
        let serializedJSON = { id: this.data.id, name: this.data.name, type: this.data.type }

        // Collidable and Target x, y keys stored different on server
        if (this.data.type == enitityTypesEnum.COLLIDABLE) {
            serializedJSON.x = this.data.x, 
            serializedJSON.y = this.data.y
        } else {
            serializedJSON.wx = this.data.x, 
            serializedJSON.wy = this.data.y
        }
        return serializedJSON;
    }

    updatePosition(x, y) {
        this.data.x = x;
        this.data.y = y;
    }

    get id() { return this.data.id }
    get x() { return this.data.x }
    get y() { return this.data.y }
    get name() { return this.data.name }
    get type() { return this.data.type }
    get view() { return this.$view }
}



export let enitityTypesEnum  = {
    COLLIDABLE: "collidable",
    TARGET: "target"
}