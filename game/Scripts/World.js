// Copyright (C) 2022 Nicholas Johnson
'use strict';

import Physics from '../common/libs/Physics.js'
import Point from './Point.js'
import Level from './Level.js'
import GameObject from './GameObject.js';
import ContactListener from './ContactListener.js';

export default class World {

    /**
     * @param {JQuery} $view                    GameScreen view
     * @param {String} filenameSelected         Filename of selected level to load
     * @param {Function} backToSplashCallback   Callback for returning to splash screen
     */
    constructor($view, filenameSelected, backToSplashCallback) {

        // Setup view and model and properties
        this.$view = $view

        const gravityVector = new Physics.Vec2(0, Physics.GRAVITY)
        this.model = new Physics.World(gravityVector)
        this.backToSplashCallback = backToSplashCallback;

        // Create and set collision listener
        this.contactListener = new ContactListener()
        this.model.SetContactListener(this.contactListener)

        // create walls and floor
        this.createBoundaries()

        // initiate level
        console.log("world created")
        this.level = new Level(this.$view, this.model)
        this.level.LoadLevel(filenameSelected)

        $("#back-to-menu-button").on('click', event => this.gotoSplashScreen())

        // TODL Future - add listeners for physical collisions
    }

    gotoSplashScreen() {
        $("#play-game-screen *").children().off()
        this.$view.empty();
        this.backToSplashCallback()
    }

    createBoundaries() {
        this.boundaryList = [] // [ceiling, floor, leftWall, rightWall]
        // ceiling
        this.boundaryList.push(this.createWalls($('#game-area').width() / 2, 0, Point.SCREEN.WIDTH, 0))

        // floor
        this.boundaryList.push(this.createWalls($('#game-area').width() / 2, $('#game-area').height(), Point.SCREEN.WIDTH, 0))

        // Left wall
        this.boundaryList.push(this.createWalls(0, $('#game-area').height() / 2, 0, Point.SCREEN.HEIGHT))

        // Right wall
        this.boundaryList.push(this.createWalls($('#game-area').width(), $('#game-area').height() / 2, 0, Point.SCREEN.HEIGHT))
    }

    /**
     * Creates the 4 boundaries around the level
     * @param {Int} x       x-coord in pixels
     * @param {Int} y       y-coord in pixels
     * @param {Int} dx      width in meters
     * @param {Int} dy      height in meters
     * @returns             Created boundary world object
     */
    createWalls(x = 0, y = 0, dx = 10, dy = 10) {

        let wallData = {
            shape: "square",
            width: dx,
            height: dy,
            x: x,
            y: y,
            density: 10,
            friction: .5,
            restitution: .5
        }
        let boundaryObject = new GameObject(this.model);
        boundaryObject.CreateGameObject(wallData, true, true);
        return boundaryObject
    }

    
    /**
     * Gets the current game state, either lost, won, or running
     * @returns {JSON}  State of game 
     *                      {state: GAME_STATE, score: float, levelData: {any end of game JSON data to put, such as num projectiles left...}},
     *                      score only passed at GAME_STATE = WON
     */
    CurrGameState() {
     
        //Check the level for the current game state of being won/lost/running
        if(this.level.allTargetsDestroyed() == true)
        {   
            return World.GAME_STATE.WON;
        }

        if(this.level.outOfPorjectiles() == true)
        {
            if(this.level.IsAllObjectsStopped())
            {
                return World.GAME_STATE.LOST
            }
        }

        else
        {
            return World.GAME_STATE.RUNNING
        }
       
    }
    
    update(deltaTime) {

        // run a single step of the simulation
        this.model.Step(1/60, 10, 10)

        // TODO: remove later - for early testing how things are moving
        this.model.ClearForces()

        this.level.update(deltaTime)

        this.CurrGameState();
    }

    render(deltaTime) {
        this.level.render(deltaTime)
    }
    
    /**
    * Enum for current game state
    */
    static GAME_STATE = {
        WON: 0,
        LOST: 1,
        RUNNING: 2
    }
}

