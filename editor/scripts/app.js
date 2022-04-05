// Copyright (C) Nicholas Johnson 2022
'use strict';

import LevelSelector from './level-selector.js';
import LevelEditor from './level-editor.js';

// Application handler
export default class App {

    constructor() {

        this.levelSelector = new LevelSelector(this.loadNewLevel)
        this.levelEditor = new LevelEditor(this.newLevelAdded)
    }

    run() {

        this.levelSelector.run();
    }

    /**
     * Level filename to edit
     * @param {String} fileName 
     */
    loadNewLevel = fileName => {
        this.levelEditor.run(fileName)
    }

    /**
     * Add newly added level to list of levels in selector
     * @param {JSON} levelToAdd {name: string, filename: string}
     */
    newLevelAdded = levelToAdd => {
        this.levelSelector.addNewLevel(levelToAdd)
    }
}