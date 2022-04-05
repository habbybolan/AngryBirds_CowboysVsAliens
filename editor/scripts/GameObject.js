'use strict'

export default class GameObject {

    /**
     * id:      Unique id inside its type
     * name:    name of the collidable/target data
     * x:       x location
     * y:       y location  
     * type:    Collidable or Target    
     * @param {JSON} sourceData {id: String, name: String, x: int, y: int, type: enitityTypesEnum} 
     */
    constructor(sourceData) {

        this.data = {...sourceData}

        if (!sourceData)
            throw "Cannot instantiate an empty object"
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

    // get prefabType() { return this.data.type }
    // get entityType() { return this.data.entityType }
    // get id() { return this.data.id }

    // get x() { return this.data.x }
    // get y() { return this.data.y }

    get id() { return this.data.id }
    get x() { return this.data.x }
    get y() { return this.data.y }
    get name() { return this.data.name }
}



export let enitityTypesEnum  = {
    COLLIDABLE: "collidable",
    TARGET: "target"
}