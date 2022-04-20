// Copyright (C) 2022 Scott Henshaw
'use strict';

import '../common/libs/jquery-3.6.0.min.js';
import SplashScreen from './Scripts/SplashScreen.js';
import World from './scripts/World.js';

class Game {

    constructor() {
        this.prevTimestamp;

        // Initialize the app behind a splash screen
        this.initSplash();
        this.requestIDAnimFrame = 0;
        
    }
    
    initSplash() {
        this.SplashScreen = new SplashScreen(this.selectLevelCallback)
        this.SplashScreen.run()
    }

    
    chooseLevel(filename) {
        this.showEditor(false)
        this.$gameview = $("#game-area")
        this.world = new World(this.$gameview, filename, this.backToSplashCallback)
        this.run()
    }

    /**
     * Callback when level chosen from SplashScreen
     * @param {String} filename    filename of level chosen to play
     */
    selectLevelCallback = filename => {
        this.chooseLevel(filename)
    }

    backToSplashCallback = () => {
        console.log("back to splash screen")
        window.cancelAnimationFrame(this.requestIDAnimFrame);
        this.showEditor(true);
    }

    // Either shows splash screen or game screen
    showEditor(bShowSplash) {
        if (bShowSplash) {
            $("#splash-screen").removeAttr('style')
            $("#play-game-screen").css('display', 'none')
        } else {
            $("#play-game-screen").removeAttr('style')
            $("#splash-screen").css('display', 'none')
        }
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

        //go to win screen
        if(currgameState == World.GAME_STATE.WON)
        {
            this.gotoWinScreen()
            console.log("WINED")
            this.world.level.CalcScore()
        }

        //go to lose screen
        if(currgameState == World.GAME_STATE.LOST)
        {
            this.gotoLoseScreen()
            console.log("LOST")
            this.world.level.CalcScore()
        }

        // only calculate if time passed between calculations
        if (elapsed) {
            this.update(elapsed);
            this.render(elapsed);
        }
        

        this.requestIDAnimFrame = window.requestAnimationFrame( timestamp => { this.run(timestamp) })
    }

    gotoLoseScreen() {
        //window.cancelAnimationFrame(this.requestIDAnimFrame);
    }   

     gotoWinScreen(score) {
        //window.cancelAnimationFrame(this.requestIDAnimFrame);
     }
}

// Main entry point for application
//$(window).on('DOMContentLoaded', event => {

const game = new Game();
//})