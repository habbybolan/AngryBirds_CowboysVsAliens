// Copyright (C) Nicholas Johnson 2022
'use strict';

export default class LevelSelector {

    /**
     * Constructor
     * @param {Function(JSON)} loadLevel  Function called when loading new level
     */
    constructor(loadLevel) {

        this.loadLevel = loadLevel;

        // Leave selector view
        $("#edit-level-button").on('click', event => {
            this.loadSelectedLevel()
        })

        $("#add-level-button").on('click', event => {
            this.loadLevel();
        })

        $("#delete-level-button").on('click', event => {
            if (this.levelList.length > 0)
                this.onDeleteLevel(event)
        })
        this.disableButtons(true)
    }

    // Run the level selection view
    run() {
        $("#level-list").empty()
        this.loadLevels();
    }

    /**
     * Event for deleting the currently selected level
     * @param {MouseEvent} event    Delete button clicked
     */
    onDeleteLevel(event) {
        this.disableButtons(true)
        if (this.levelList.length == 0) 
            return;

        let data = JSON.stringify({name: this.getFilenameWithoutExtension(this.levelList[this.selectedIndex].filename), type: "level"}) 
        $.post(`api/delete`, {data})
        .then(responseString => JSON.parse(responseString))
        .then(response => {
            if (!response.error) {

                // remove level from html
                $(`#${this.getLevelId(this.levelList[this.selectedIndex].name)}`).remove()

                // remove level this list of levels
                this.levelList.splice(this.selectedIndex, 1)
                if (this.selectedIndex == this.levelList.length) {
                    this.selectedIndex--;
                }
                
                if (this.levelList.length != 0) {
                    this.onLevelSelect(this.levelList[this.selectedIndex].name);
                    this.loadSelectedLevel()
                }
            }
            this.disableButtons(false)
        });
    }

    loadSelectedLevel() {
        if (this.levelList.length > 0)
            this.loadLevel(this.levelList[this.selectedIndex].filename)
    }

    /**
     * Load the levels from the server, storing their data and displaying a list of them, as well a a preview of the maps
     */
    loadLevels() {
        this.disableButtons(true)
        this.levelList = [];    // List of all loaded levels
        this.selectedIndex = 0; // Current selected level

        $.post('api/get_level_list')
            .then(responseString => JSON.parse(responseString))
            .then(response => {
            
                // Display list of levels
                if (!response.error) {
  
                    this.levelList = response.payload;
                    
                    // add the levels to html
                    for (let level of this.levelList) {

                        this.addLevelToView(level)
                    }
                    // select first level
                    
                    if (this.levelList.length > 0)
                        this.onLevelSelect(this.levelList[0].name)
                    
                    this.loadSelectedLevel()
                }
                this.disableButtons(false)
            })
            .catch(error => console.log(error.message));
    }

    addLevelToView(level) {
        let $level = $(`<div id="${this.getLevelId(level.name)}" class="level-list-element unselected-level">${level.name}</div>`);
        $("#level-list").append($level);

        // Show preview on selecting level from list
        $level.on('click', {name: level.name}, event => this.onLevelSelect(event.data.name));
    }

    addNewLevel(newLevel) {
        this.levelList.push(newLevel)
        this.addLevelToView(newLevel)
        
        // prevent pointing to bad index value
        if (this.levelList.length == 1)
            this.selectedIndex = this.levelList.length - 1
            
        this.onLevelSelect(this.levelList[this.levelList.length - 1].name)
    }

    /**
     * Get the filename without the .json extension
     * @param {String} filename     .json filename
     * @returns                     Filename without the extension
     */
    getFilenameWithoutExtension(filename) {
        return filename.substr(0, filename.lastIndexOf('.')) || filename;
    }

    /**
     * On selecting a level, display the level was selected and preview its map
     * @param {String} name    Unique filename of the level without .json extension
     */
    onLevelSelect(selectedName) {
        // unselect previously selected level
        let prevSelectedName = this.levelList[this.selectedIndex].name;
        $(`#${this.getLevelId(prevSelectedName)}`).removeClass("selected-level");
        $(`#${this.getLevelId(prevSelectedName)}`).addClass("unselected-level");

        // select new list
        $(`#${this.getLevelId(selectedName)}`).removeClass("unselected-level");
        $(`#${this.getLevelId(selectedName)}`).addClass("selected-level");
        this.selectedIndex = this.getIndexOfLevelByName(selectedName);
    }

    getLevelId(name) {
        let id = `level-${name}`;
        id = id.replace(/\s+/g, '')
        return id;
    }

    /**
     * Get the index of the level based on a filename
     * @param {String} levelName    Name of file
     * @returns 
     */
     getIndexOfLevelByName(levelName) {
        for (let i = 0; i < this.levelList.length; i++) {
            if(this.levelList[i].name == levelName)
                return i;
        }
        throw `No level with name: ${levelName}`
    }

    disableButtons(bDisableButtons) {
        $("#delete-level-button").prop('disabled', bDisableButtons);
        $("#add-level-button").prop('disabled', bDisableButtons);
        $("#edit-level-button").prop('disabled', bDisableButtons);
    }
}