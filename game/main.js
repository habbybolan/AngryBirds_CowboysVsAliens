// Copyright (C) 2022 Scott Henshaw
'use strict';

import '../common/libs/jquery-3.6.0.min.js';
import World from './scripts/World.js';

class Game {

    constructor() {

        this.$view = $("#game-area")
        this.world = new World(this.$view, 'level-0');
        

        // Initialize the app behind a splash screen
        this.initSplash()

        // Choose a level
        this.chooseLevel('level-1')

        // TODO: Run simulation
        this.run()
    }

    update( deltaTime ) {

        // update the world positions of everything
        this.world.update()
    }

    chooseLevel(levelName) {

        // TODO: Get the level from the server if exists 
    }

    initSplash() {

        // TODO: Initialize the splash screen, wait for play now pressed
    }

    render( deltaTime ) {

        // redraw the entire scene by telling each thing in the scene to render itself
        this.world.render()
    }

    run( deltaTime ) {

        this.update( deltaTime );
        this.render( deltaTime );

        window.requestAnimationFrame( deltaTime => { this.run( deltaTime )})
    }
}

// Main entry point for application
// $(window).on('DOMContentLoaded', event => {

    const game = new Game();
    game.run();
// })