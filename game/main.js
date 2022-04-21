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
        this.showLoseScreen(false)
        this.showWinScreen(false)
        this.isGameFinished = false
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

        // check game state only if game not yet reached a finished game state
        if (!this.isGameFinished) {
            let currgameState = this.world.CurrGameState()

            //go to win screen
            if(currgameState == World.GAME_STATE.WON)
            {
                this.gotoWinScreen(this.world.level.CalcScore())
            }

            //go to lose screen
            if(currgameState == World.GAME_STATE.LOST)
            {
                this.gotoLoseScreen()
            }
        }
        
        // only calculate if time passed between calculations
        if (elapsed) {
            this.update(elapsed);
            this.render(elapsed);
        }

        this.requestIDAnimFrame = window.requestAnimationFrame( timestamp => { this.run(timestamp) })
    }

    gotoLoseScreen() {
        this.isGameFinished = true
        this.showLoseScreen(true)
    }   

     gotoWinScreen(score) {
        this.isGameFinished = true
        this.showWinScreen(true, score)
     }

    showLoseScreen(isShowScreen) {
        if (isShowScreen) {
            $("#lose-screen-popup").removeAttr('style')
        } else {
            $("#lose-screen-popup").css('display', 'none')
        }
    }

    showWinScreen(isShowScreen, score) {
        if (isShowScreen) {
            // TODO: show score
            $("#win-screen-popup").removeAttr('style')
        } else {
            $("#win-screen-popup").css('display', 'none')
        }
    }
}

const game = new Game();
