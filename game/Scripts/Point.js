// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from "../../common/libs/Physics.js";

/**
 * Holds Screen sizes and converting from pixel and meters
 */
export default class Point {
    
    // convert from meters to screen pixels
    static metersToPixels(x, y) {

        return {
            left: (x * Physics.WORLD_SCALE) + this.HALF.WIDTH,
            top: (y * Physics.WORLD_SCALE ) + this.HALF.HEIGHT
        }
    }

    // Convert from screen pixels to game meters
    static pixelsToMeters(x, y) {

        return {
            left: (x - this.HALF.WIDTH) / Physics.WORLD_SCALE,
            top: (y - this.HALF.HEIGHT) / Physics.WORLD_SCALE
        }
    }
    
    static SCREEN = {
        HEIGHT: 720,
        WIDTH: 1280
    }

    static HALF = {
        HEIGHT: this.SCREEN.HEIGHT /2,
        WIDTH: this.SCREEN.WIDTH /2
    }

    static SCREEN_METERS = {
        HEIGHT: this.SCREEN.HEIGHT / Physics.WORLD_SCALE,
        WIDTH: this.SCREEN.WIDTH / Physics.WORLD_SCALE
    }
}
