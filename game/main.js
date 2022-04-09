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
        this.chooseLevel()

        // TODO: Nick
        //      Run simulation after selecting a level to load inside ChooseLevel
        this.run()
    }

    update( deltaTime ) {

        // update the world positions of everything
        this.world.update()
    }

    chooseLevel() {
        // TODO: Nick
        //      Get the level from the server if exists 
    }

    initSplash() {

        // TODO: Nick
        //      Initialize the splash screen, wait for play now pressed
    }

    render( deltaTime ) {

        // redraw the entire scene by telling each thing in the scene to render itself
        this.world.render()
    }

    run( deltaTime ) {

        let currgameState = this.world.CurrGameState()
        // TODO: Andre
        //      Check Curr state if game
        //            Send to methods gotoLoseScreen() or gotoWinScreen() based on state of game
        //            Stop game from simulating/rendering if won/lost

        this.update( deltaTime );
        this.render( deltaTime );

        window.requestAnimationFrame( deltaTime => { this.run( deltaTime )})
    }

    gotoLoseScreen() {
        // TODO: Nick
    }   

     gotoWinScreen() {
         // TODO: Nick
     }
}

// Main entry point for application
//$(window).on('DOMContentLoaded', event => {

    const game = new Game();
    game.run();
//})