// Copyright (C) 2022 Scott Henshaw
'use strict';

import '../common/libs/jquery-3.6.0.min.js';
import World from './scripts/World.js';

class Game {

    constructor() {

        // some properties for the game application
        this.tick = 0;

        this.$view = $("#game-area")
        this.world = new World(this.$view);
        

        // Initialize the app behind a splash screen
        this.initSplash()

        // Choose a level
        this.chooseLevel('level-1')

        // TODO: Load leveland generate world
        this.loadlevel('level-1')

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

    loadlevel(leveName) {

        // TODO; Ask the server for the level data
        // TODO: Post request to server for level
        // TODO: Walk through the level data and create game objects
        // TODO: Create game object here
    }

    initSplash() {

        // TODO: Initialize the splash screen, wait for play now pressed
    }

    render( deltaTime ) {

        // redraw the entire scene by telling each thing in the scene to render itself
        this.world.render()
        $("#my-console").html(`Running ${this.tick++}`)
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