// Copyright (C) Nicholas Johnson 2022
'use strict'

import { enitityTypesEnum } from "./GameObject.js"
import { shapesEnum } from "./prefab.js"

// Data class holding all target and collidable prefab filenames
export default class prefabFilenames {
    static squareCollidables = ['/images/brick-square.png', '/images/stone-square.jpg']
    static circleCollidables = []
    static triangleCollidables = []

    static squareTargets = []
    static circletTargets = ['/images/angry-pig-1.png', '/images/angry-pig-2.png']
    static triangleTargets = []

    /**
     * Get the list of filenames associated with the specific shape and type
     * @param {shapesEnum} shape        Shape of prefab
     * @param {enitityTypesEnum} type   type of the prefab
     * @returns 
     */
    static getFilenamesByShapeAndType(shape, type) {
        switch (type) {
            case enitityTypesEnum.COLLIDABLE:
                switch (shape) {
                    case shapesEnum.CIRCLE:
                        return prefabFilenames.circleCollidables
                    case shapesEnum.SQUARE:
                        return prefabFilenames.squareCollidables
                    case shapesEnum.TRIANGLE:
                        return prefabFilenames.triangleCollidables
                    default:
                        throw `No shape of ${shape} exists`
                }
            case enitityTypesEnum.TARGET:
                switch (shape) {
                    case shapesEnum.CIRCLE:
                        return prefabFilenames.circletTargets
                    case shapesEnum.SQUARE:
                        return prefabFilenames.squareTargets
                    case shapesEnum.TRIANGLE:
                        return prefabFilenames.triangleTargets
                    default:
                        throw `No shape of ${shape} exists`
                }
            default:
                throw `No type of ${type} exists`
        }
    }
}