// Copyright (C) Nicholas Johnson 2022
'use strict';

import Level from "./Level.js";
import { enitityTypesEnum } from "./GameObject.js"
import PrefabCollidable from "./prefabCollidable.js";
import PrefabTarget from "./prefabTarget.js";
import PrefabInfoBoxImport from './prefabInfoBox.js'

// Application handler
export default class LevelEditor {

    /**
     * @param {Function(JSON)} newLevelAdded    Sends level name and filename of newly added level to level selector
     */
    constructor(newLevelAdded) {

        this.newLevelAdded = newLevelAdded

        this.prefabInfoBox = new PrefabInfoBoxImport(this)
        
        $('#editor-area')
            .on('dragenter', event => {/* nothing */})
            .on('dragover', event => {
                event.preventDefault();
            })
            .on('dragleave', event => {})
            .on('drop', event => this.onDropEditor(event));

        $('#save-level-button').on('click', event => this.onSaveLevel(event))

        $("#level-name").change(() => {
            this.level.name = $("#level-name").val()
        })

        $("#level-info-projectiles").change(() => {
            this.level.projectiles = $("#level-info-projectiles").val()
        })

        $("#garbage-can")
            .on('dragenter', event => {/* nothing */})
            .on('dragover', event => event.preventDefault())
            .on('drop', event => {
                this.onDropGarbageCan(event)
            })
    }


    /**
     * Run the editor view and display level
     * @param {String} filename     
     */
    async run(filename) {

        $("#editor-area").empty()
        $("#prefab-container").empty()

        
        this.prefabCollidables = []
        this.prefabTargets = []

        await this.loadLevel(filename);
        
        $("#level-name").val(this.level.name)

        this.showLevelData()
    }

    showLevelData() {
        $('#level-name').val(this.level.name)
        $('#level-info-projectiles').val(this.level.projectiles)
        $('#level-info-num-targets').text(this.level.targets.length)
        $('#level-info-num-collidables').text(this.level.collidables.length)
        $('#level-info-filename').text(this.level.filename ? this.level.filename : "")
    } 

    /**
     * @param {String} filename     Name of file if loading saved level, undefined if new level being created
     */
    async loadLevel(filename) {
        this.disableMouseEvents(true)
        let collidablesData = [];   // Level collidables data from server
        let targetsData = [];       // level targets data from server

        // if not a new level created, load saved level
        if (filename) {
            let data = JSON.stringify({type: "level", name: filename})
            let resLevel = await $.post('api/load', { data })
            resLevel = JSON.parse(resLevel);
            
            console.log(resLevel.payload.entities)
            if (!resLevel.error) {
                this.level = new Level(resLevel.payload);
                collidablesData = resLevel.payload.entities.collidables
                targetsData = resLevel.payload.entities.targets
            }
        // Otherwise, load default level
        } else {
            this.level = new Level()
        }
        
        // Load prefab data
        let resPrefabs = await $.post('api/get_object_list')
        resPrefabs = JSON.parse(resPrefabs);
        if (!resPrefabs.error) {

            // Loop through all retrieved prefabs and load them into the editor
            for (let prefabData of resPrefabs.payload) {

                let data = JSON.stringify({name: prefabData.filename, type: "object"})
                let resPrefab = await $.post('api/load', { data })
                resPrefab = JSON.parse(resPrefab)

                let prefab;
                // Setup the collidable prefab
                if (resPrefab.payload.type == "collidable") {
                    prefab = new PrefabCollidable(resPrefab.payload)
                    this.prefabCollidables.push(prefab)
                // setup the target prefab
                } else if (resPrefab.payload.type == "target") {
                    prefab = new PrefabTarget(resPrefab.payload)
                    this.prefabTargets.push(prefab)
                }

                // add prefab to view and set event handlers
                this.addPrefabToView(prefab);
            }

            let collidableObjects = this.level.addGameObjectsFromData(collidablesData)
            for (let collidable of collidableObjects) {
                $("#editor-area").append(collidable.view)
                this.setDraggableHandlers(collidable.view)
                this.placeObject(collidable.view, collidable.x, collidable.y)
            }
            let targetObjects = this.level.addGameObjectsFromData(targetsData)
            for (let target of targetObjects) {
                $("#editor-area").append(target.view)
                this.setDraggableHandlers(target.view)
                this.placeObject(target.view, target.x, target.y)
            }
        }
        this.disableMouseEvents(false)
    }

    addPrefabToView(prefab) {
        $("#prefab-container").append(prefab.view)
        this.setDraggableHandlers(prefab.view) 
        this.prefabInfoBox.setPrefabOnClick(prefab)
    }

    /**
     * Load any previously saved collidable objects in level using the loaded prefabs
     */
     loadSavedCollidableLevelObjects(collidableData) {
        // prevent iterating over empty object
        if (!collidableData)
            return;

        // place all saved collidables
        for (let collidable of collidableData) {
            let $prefab = this.getCollidablePrefab(collidable.name);
            if ($prefab)
                this.placeObject($prefab, collidable.x, collidable.y)
        }
    }

    /**
     * Load any previously saved target objects in level using the loaded prefabs
     */
    loadSavedTargetLevelObjects(targetData) {
        // prevent iterating over empty object
        if (!targetData)
            return;

        // place all saved targets
        for (let target of targetData) {
            let $prefab = this.getTargetPrefab(target.name);
            if ($prefab)
                this.placeObject($prefab, target.wx, target.wy);
        }
    }

    /**
     * Get the collidable prefab that has name attribute
     * @param {String} name     The prefab attribute type
     * @returns                 The collidable prefab with type attribute
     */
    getCollidablePrefab(name) {
        for (let prefab of this.prefabCollidables) {
            if (prefab.view.attr("name") == name)
                return prefab.view;
        }
        //throw `No prefab of ${type}`;
    }

    /**
     * Get the target prefab that has name attribute
     * @param {String} name     The prefab attribute type
     * @returns                 The target prefab with type attribute
     */
    getTargetPrefab(name) {
        for (let prefab of this.prefabTargets) {
            if (prefab.view.attr("name") == name)
                return prefab.view;
        }
        //throw `No prefab of ${type}`;
    }

    onSaveLevel() {
        this.disableMouseEvents(true)
        this.level.onSave(this.onSaveLevelCallback);
    }  

    onSaveLevelCallback = (message, bNewLevel) => {
        // if new level created, sent to level selector to add to list
        if (bNewLevel) {
            this.newLevelAdded({ name: this.level.name, filename: this.level.filename })
        }
        this.showLevelData()
        this.onMessageCallback(message)
    }

    // Display message for a few seconds, then remove it
    onMessageCallback = (message) => {
        this.disableMouseEvents(false)
        $("#message-bar").text(message);

        setTimeout(() => {
            $("#message-bar").text("");
        }, 5000)
    }
    
    /**
     * Add all drag events to the new draggable object
     * @param {HTMLElement} $draggableObject    The object being dragged
     */
    setDraggableHandlers($draggableObject) {
        $draggableObject
            .on('dragstart', event => {
                this.prefabInfoBox.onLeavePrefabSave()

                // Saved drag info
                const dragData = {
                    dx: event.offsetX,
                    dy: event.offsetY,
                    id: `#${event.target.id}`
                };
                const someDataString = JSON.stringify(dragData);
                event.originalEvent.dataTransfer.setData("text/plain", someDataString)

                // styling changes applied here
            })
            .on('drag', event => {
                // update css and stuff on screen 
                // Debug information
                // ex) mouse x, y location at bottom of screen 
            })
            .on('dragend', event => {
                // undo styling changes
            })
            .on('click', event => {
            })
    }

    /**
     * drop Mouse event, placing or updating the position of a draggable object.
     * @param {MouseEvent} event    drop mouse event
     */
    onDropEditor(event) {
        // Use the edit zone
        const dragData = this.extractDraggableData(event)
        const $draggable = $(dragData.id); // Get the original object that was dragged
        this.placeObject($draggable, event.clientX - dragData.dx - $('#editor-area').offset().left, event.clientY - dragData.dy - $('#editor-area').offset().top)
    }

    onDropGarbageCan(event) {
        // Use the edit zone
        const dragData = this.extractDraggableData(event)
        // prevent dragging prefabs into the garbage can
        if (dragData.id.includes('prefab')) {
            this.onMessageCallback("Cannot delete a prefab by dragging")
            return
        }
            
        const $draggable = $(dragData.id); // Get the original object that was dragged

        $draggable.remove();
        this.level.removeGameObject($draggable.attr("id"))
    }

    /**
     * Place an object based on a previous object, at (locX, locY)
     * @param {JQuery Object} $draggable    Object based on a prefab dragged or an already placed object user is moving.  
     *                                      Can be either a collidable or target.
     *                                      If it contains 'placed' class, then it is an already placed object, otherwise it's a prefab to create a new object from.
     * @param {int} locX                    X location to place the object
     * @param {int} locY                    Y location to palce the object
     */
    placeObject($draggable, locX, locY)
    {
        let $obj = $draggable // Copy of originally dragged object

        // If  placing new object in editor
        if (!$draggable.hasClass("placed")) {

            
            let newGameObject = this.level.addGameObjectFromPrefab($draggable, locX, locY)
            $obj = newGameObject.view

            // place new object into level
            $("#editor-area").append($obj)
            // Attach the drag/drop handlers to the new object 
            this.setDraggableHandlers($obj)

        // otherwise, update the postition of the exising game object in level data
        } else {
            this.level.updateGameObjectLocation($draggable.attr("id"), locX, locY, $draggable.hasClass(enitityTypesEnum.COLLIDABLE) ? enitityTypesEnum.COLLIDABLE : enitityTypesEnum.TARGET)
        }

        // calculate offset from cursor position dropped at
        $obj.offset({left: locX + $('#editor-area').offset().left, top: locY + $('#editor-area').offset().top})
        this.updateGameObjectAmounts()
    }

    updateGameObjectAmounts() {
        $("#level-info-num-targets").text(this.level.targets.length)
        $("#level-info-num-collidables").text(this.level.collidables.length)
    }

    // Get the HTML/CSS data from the dragged object
    extractDraggableData(event) {

        // Get the string data of the dragged object
        const dragData = event.originalEvent.dataTransfer.getData('text/plain');
        return JSON.parse(dragData);
    }

    disableMouseEvents(bDisableEvents) {
        $("#back-button").prop('disabled', bDisableEvents);
        $("#save-level-button").prop('disabled', bDisableEvents);
        $("#create-prefab").prop('disabled', bDisableEvents);
        $("#level-name").prop('disabled', bDisableEvents);
        $("#level-info-projectiles").prop('disabled', bDisableEvents);
        $("#garbage-can").prop('disabled', bDisableEvents);
    }
}