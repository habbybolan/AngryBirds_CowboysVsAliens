// Copyright (C) 2022 Scott Henshaw
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'

export default class GameObject {

    /**
     * 
     * @param {WorldContoller} world 
     */
    constructor(world) {

        // TODO: collidable properties here
        this.$view = {}
        this.model = {}
    }

    update() {
        // Note: won't do much
    }

    render() {
        // Draw inside game
    }
}