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
        this.endGameState = World.GAME_STATE.RUNNING

        this.$winScreen = $("#win-screen-popup")
        this.winningScore = 0
        this.$loseScreen = $("#lose-screen-popup")
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
        window.cancelAnimationFrame(this.requestIDAnimFrame)
        this.showEditor(true)
        this.resetGameState()
        
    }

    resetGameState() {
        this.showLoseScreen(false)
        this.showWinScreen(false)
        this.endGameState = World.GAME_STATE.RUNNING
        this.winningScore = 0
        this.$winScreen.text(0)
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
        if (this.endGameState == World.GAME_STATE.RUNNING) {
            let currgameState = this.world.CurrGameState()

            //go to win screen
            if(currgameState == World.GAME_STATE.WON)
            {
                this.endGameState = currgameState
                this.gotoWinScreen()
                this.winningScore = this.world.level.CalcScore()
            }

            //go to lose screen
            if(currgameState == World.GAME_STATE.LOST)
            {
                this.endGameState = currgameState
                this.gotoLoseScreen()
            }
        } else {
            if (this.endGameState == World.GAME_STATE.WON) {
                console.log("check1")
                if (this.$winScreen.text() * 1 < this.winningScore)  {
                    console.log("check2")
                    let newScore = this.$winScreen.text() * 1 + 3
                    this.$winScreen.text(newScore)
                    // prevent diplaying over winning score
                    if (this.$winScreen.text() > this.winningScore)
                        this.$winScreen.text(this.winningScore)
                }
            }
        }
        
        // only calculate if time passed between calculations
        if (elapsed) {
            this.update(elapsed)
            this.render(elapsed)
        }

        this.requestIDAnimFrame = window.requestAnimationFrame( timestamp => { this.run(timestamp) })
    }

    gotoLoseScreen() {
        
        this.showLoseScreen(true)
    }   

    gotoWinScreen() {

        this.showWinScreen(true)
    }

    showLoseScreen(isShowScreen) {
        if (isShowScreen) {
            this.$loseScreen.removeAttr('style')
        } else {
            this.$loseScreen.css('display', 'none')
        }
    }

    showWinScreen(isShowScreen) {
        if (isShowScreen) {
            this.$winScreen.removeAttr('style')
        } else {
            this.$winScreen.css('display', 'none')
        }
    }
}

const game = new Game();
