'use strict'

class Game {

    
    constructor() {
        let my = this.__private__ = {

        }
    }

    update() {

    }

    render() {

    }

    run() {
        
    }
}


$(window).on("DOMContentLoaded", event => {
    const game = new Game();
    game.run();
})