// Copyright (C) Nicholas Johnson 2022
'use strict'

export default class SplashScreen {

    constructor(levelSelectedCallback) {
        this.levelSelectedCallback = levelSelectedCallback

        $("#load-level-button").on('click', event => {
            if (this.levelList.length != 0)
                this.levelSelectedCallback(this.levelList[this.selectedIndex].filename);
        })
    }

    // Run the level selection view
    run() {
        $("#level-list").empty()
        this.loadLevels();
    }

    /**    
     * Load the levels from the server, storing their data and displaying a list of them, as well a a preview of the maps
     */
    loadLevels() {
        this.disableButtons(true)
        this.levelList = [];    // List of all loaded levels
        this.selectedIndex = 0; // Current selected level

        $.post('/api/get_level_list')
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
                }
                this.disableButtons(false)
            })
            .catch(error => console.log(error.message));
    }

    addLevelToView(level) {
        let $level = $(`<div id="${this.getLevelId(level.name)}" class="level-list-item unselected-level">${level.name}</div>`);
        $("#level-list").append($level);

        // Show preview on selecting level from list
        $level.on('click', {name: level.name}, event => this.onLevelSelect(event.data.name));
    }

    getLevelId(name) {
        let id = `level-${name}`;
        id = id.replace(/\s+/g, '')
        return id;
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
        $("#load-level-button").prop('disabled', bDisableButtons);
    }
}