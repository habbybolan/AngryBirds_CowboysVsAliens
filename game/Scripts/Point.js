// Copyright (C) 2022 Scott Henshaw
'use strict';

import Physics from "../../common/libs/Physics.js";

const SCREEN = {
    HEIGHT: 720,
    WIDTH: 1280
}

const HALF = {
    HEIGHT: SCREEN.HEIGHT /2,
    WIDTH: SCREEN.WIDTH /2
}


export default class Point {

    constructor(x = 0, y = 0) {

        // default coords in World Space
        this._x = x;
        this._y = y;
    }

    asScreen() {

        return {
            x: this.left,
            y: this.right
        }
    }

    fromScreen(top, left) {

        // update X, Y from a given positon
    }

    get x() { return this._x }
    get y() { return this._y }
    get left() { return this.x * Physics.WORLD_SCALE + (0.5 * HALF.WIDTH) }
    get right() {return HALF.HEIGHT - (this.y * Physics.WORLD_SCALE)}
}
