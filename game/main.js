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

        this.prevTimestamp;
        this.start;

        // TODO: Nick
        //      Run simulation after selecting a level to load inside ChooseLevel
        this.run()
    }

    
    chooseLevel() {
        // TODO: Nick
        //      Get the level from the server if exists 
        //      Create separate class to deal with selecting a level that sends a callback on level selected back here
    }
    
    initSplash() {
        
        // TODO: Nick
        //      Initialize the splash screen, wait for play now pressed
    }
    
    update(deltaTime) {

        // update the world positions of everything
        this.world.update(deltaTime)
    }
    render(deltaTime) {

        // redraw the entire scene by telling each thing in the scene to render itself
        this.world.render(deltaTime)
    }

    run(timestamp) {

        const elapsed = timestamp - this.prevTimestamp
        this.prevTimestamp = timestamp

        let currgameState = this.world.CurrGameState()
        // TODO: Andre
        //      Check Curr state if game
        //            Send to methods gotoLoseScreen() or gotoWinScreen() based on state of game
        //            Stop game from simulating/rendering if won/lost

        // only calculate if time passed between calculations
        if (elapsed) {
            this.update(elapsed);
            this.render(elapsed);
        }
        

        window.requestAnimationFrame( timestamp => { this.run(timestamp) })
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