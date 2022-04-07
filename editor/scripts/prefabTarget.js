// Copyright (C) Nicholas Johnson 2022
'use strict'

import { enitityTypesEnum } from "./GameObject.js";
import Prefab from "./prefab.js";

export default class PrefabTarget extends Prefab{

    /** 
     * @param {JSON} sourceData {  height, width, bounce, mass, friction, name, type, texture, filename, shape }
     */
    constructor( sourceData ) {
        super(sourceData);

        console.log(sourceData.texture)
        this.data.id = this.getNewIndex()
        this.$view = $(`<div id="${this.data.id}" 
                            name="${sourceData.name}" 
                            type="${sourceData.type}" 
                            style="height: ${sourceData.height}px; 
                                width: ${sourceData.width}px; 
                                background-image: url(${sourceData.texture});" 
                            draggable="true" 
                            class="${enitityTypesEnum.TARGET} draggable">
                        </div>`)
    }
}