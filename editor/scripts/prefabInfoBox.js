// Copyright (C) Nicholas Johnson 2022
'use strict'

import { enitityTypesEnum } from "./GameObject.js";
import LevelEditor from "./level-editor.js";
import Level from "./Level.js";
import { shapesEnum } from "./prefab.js";
import PrefabCollidable from "./prefabCollidable.js";
import prefabFilenames from "./prefabFilenames.js";
import PrefabTarget from "./prefabTarget.js";

/**
 * View class for dealing with all clickers and visual updates with the prefab info box
 */
export default class prefabInfoBox {

    /**
     * @param {LevelEditor} levelEditor Level editor view class
     */
    constructor(levelEditor) {
        this.levelEditor = levelEditor

        this.bCreatingPrefab = false
        this.selectedPrefab = undefined

        this.setPrefabClickHandlers()
        this.disableInputBoxes(true)
    }

    setPrefabClickHandlers() {
        $("#create-prefab").on('click', event => this.onCreateNewPrefab())

        $("#save-prefab").on('click', event => this.onSavePrefab())

        $("#cancel-prefab").on('click', event => this.onLeavePrefabSave())

        $("#delete-prefab").on('click', event => this.onDeletePrefab())

        $("#select-cover-screen").on('click', event => {
            this.onLeavePrefabSave()
        })

        // Prefab info shape dropdown
        $("#prefab-info-shape").on('click', event => {
            this.prefabDropdownHandler(
                $("#prefab-info-shape"), 
                $("#prefab-info-shape-dropdown"), 
                [shapesEnum.SQUARE, shapesEnum.CIRCLE, shapesEnum.TRIANGLE])
        })

        // Prefab info texture dropdown
        $("#prefab-info-texture").on('click', event => {
            this.prefabDropdownHandler(
                $("#prefab-info-texture"), 
                $("#prefab-info-texture-dropdown"), 
                prefabFilenames.getFilenamesByShapeAndType($("#prefab-info-shape").text(), $("#prefab-info-type").text()))
        })

        // Prefab info type dropdown
        $("#prefab-info-type").on('click', event => {
            this.prefabDropdownHandler(
                $("#prefab-info-type"), 
                $("#prefab-info-type-dropdown"), 
                [enitityTypesEnum.COLLIDABLE, enitityTypesEnum.TARGET])
        })
    }

    /**
     * Sets the info box prefab texture to the first value that fits the shape and type values chosen.
     * Prevents having an invalid texture given the selected shape and type
     */
     updatePrefabInfoBoxTexture() {
        let textureList = prefabFilenames.getFilenamesByShapeAndType($("#prefab-info-shape").text(), $("#prefab-info-type").text());
        
        // empty data if texture list is empty
        if (textureList.length == 0)
            $("#prefab-info-texture").text("")
        else
        {
            $("#prefab-info-texture").text(textureList[0])
            console.log(textureList[0])
        }
    }

    /**
     * Set the dropdown handler events
     * @param {JQuery} $textSelector         The text selected that creates the dropdown
     * @param {JQuery} $dropdownContainer    The container holding all dropdown selectable ites
     * @param {Array}  list                 List of Strings to populate dropdown data with
     */
     prefabDropdownHandler($textSelector, $dropdownContainer, list) {
         if ($dropdownContainer.children().length > 0)
            return
        // create dropdown menu for texture
        for (let item of list) {
            
            let $dropdownData = $(`<div class="dropdown-item">${item}</div>`)
            $dropdownData.on('click', event => {
                
                // set text and remove dropdown
                $textSelector.text(item)
                $dropdownContainer.empty()
                
                let idEleSelected = $textSelector.attr("id")

                // if changing shape or type, update to valid texture
                if (idEleSelected != "prefab-info-texture")
                    this.updatePrefabInfoBoxTexture()
            })
            $dropdownContainer.append($dropdownData)
        }
        // close dropdown if hovered off
        $dropdownContainer.mouseleave(() => $dropdownContainer.empty())
    }

    // Once prefab selected, cover screen so can only interact with selected prefab and prefab info box
    showPrefabSelectCoverScreen(bShowScreen) {
        if (bShowScreen) {
            $("#select-cover-screen").removeAttr('style')
        } else {
            $("#select-cover-screen").css('display', 'none')
            this.enterSavePrefabMode(false)
        }
    }

    onCreateNewPrefab() {
        this.bCreatingPrefab = true;
        // display save prefab button and update style
        this.enterSavePrefabMode(true)
        this.disableNameInput(false)
        $('#prefab-info-box').addClass('prefab-box-create-new')

        // default prehab
        $('#prefab-info-name').val("")
        $('#prefab-info-width').val(70)
        $('#prefab-info-height').val(70)
        $('#prefab-info-bounce').val(0.5)
        $('#prefab-info-mass').val(10)
        $('#prefab-info-friction').val(.2)
        $('#prefab-info-shape').text("square")
        $('#prefab-info-type').text("collidable")
        $('#prefab-info-filename').text("---")
        this.updatePrefabInfoBoxTexture()
    }

    enterSavePrefabMode(bSaveMode) {
        // Hide create button, show save/cancel button
        if (bSaveMode) {
            $("#create-prefab").css('display', 'none')
            $('#save-prefab').removeAttr('style')
            $('#cancel-prefab').removeAttr('style')
            this.disableInputBoxes(false)
        // show create button, hide save/cancel button
        } else {
            $('#save-prefab').css('display', "none")
            $('#cancel-prefab').css('display', 'none')
            $("#create-prefab").removeAttr('style')
            this.disableInputBoxes(true)
        }
    }

    disableInputBoxes(bDisableInput) {
        $("#prefab-info-name").prop('disabled', bDisableInput)
        $("#prefab-info-width").prop('disabled', bDisableInput)
        $("#prefab-info-height").prop('disabled', bDisableInput)
        $("#prefab-info-bounce").prop('disabled', bDisableInput)
        $("#prefab-info-mass").prop('disabled', bDisableInput)
        $("#prefab-info-friction").prop('disabled', bDisableInput)
    }

    onDeletePrefab() {

        if (!this.isCurrentLevelReferencesPrefab(this.selectedPrefab.name)) {
            this.selectedPrefab.onDelete(
            (message, errorCode, prefabToDelete) => this.onDeletePrefabCallback(message, errorCode, prefabToDelete))
        } else {
            this.levelEditor.onMessageCallback("Prefab is referenced in this level")
        }
        
        this.onLeavePrefabSave()
    }

    isCurrentLevelReferencesPrefab(prefabName) {
        return this.isObjectListContainPrefab(prefabName, this.levelEditor.level.targets) 
                || this.isObjectListContainPrefab(prefabName, this.levelEditor.level.collidables)
    }

    isObjectListContainPrefab(prefabName, objectList) {
        for (let gameObject of objectList) {
            if (gameObject.name == prefabName)
                return true
        }
        return false;
    }   

      /**
     * Save a new Prefab or update an existing one if selected
     */
       onSavePrefab() {

        // {  height, width, bounce, mass, friction, name, type, texture, shape, filename? }
        let prefabJSON = this.createPrefabJSON()

        // add filename to save object if updating existing prefab
        if (!this.bCreatingPrefab) {
            // Reloading the level to update all objects using that prefab
            let filename = $('#prefab-info-filename').text()
            prefabJSON.filename = filename
        }

        let type = $('#prefab-info-type').text()
        let prefabToSave
        if (type == enitityTypesEnum.COLLIDABLE) 
            prefabToSave = new PrefabCollidable(prefabJSON)
        else
            prefabToSave = new PrefabTarget(prefabJSON)
        
        // If the prefab values are valid, attempt to save
        let errorMessage = prefabToSave.isInvalidPrefab()
        if (!errorMessage) {
            prefabToSave.onSave((message, errorCode, prefabSaved, bNewPrefab) => {
                this.levelEditor.disableMouseEvents(true)
                this.onSavePrefabCallback(message, errorCode, prefabSaved, bNewPrefab)
            })
        }
        else {
            this.levelEditor.onMessageCallback(errorMessage)
        }
    }

    createPrefabJSON() {
        return {    name: $('#prefab-info-name').val(), 
                    mass: $('#prefab-info-mass').val(),
                    height: $('#prefab-info-height').val(),
                    width: $('#prefab-info-width').val(),
                    friction: $('#prefab-info-friction').val(),
                    bounce: $('#prefab-info-bounce').val(),
                    shape: $('#prefab-info-shape').text(),
                    texture: $('#prefab-info-texture').text(),
                    type: $('#prefab-info-type').text()
                }
    }

    /**
     * Callback for when prefab succeeded/failed save
     * @param {String} message      Message to display
     * @param {Int} errorCode       Error code from server, 0 if successful save, -1 if client error
     * @param {Prefab} prefabSaved  Prefab that was saved / attempted to save
     * @param {boolean} bNewPrefab  If this is new prefab created, or an updated existing prefab
     */
     onSavePrefabCallback(message, errorCode, prefabSaved, bNewPrefab) {
        this.levelEditor.onMessageCallback(message);
       
        if (!errorCode) {
            this.onLeavePrefabSave();
            // can add the prefab to the view instantly if creating a new one
            if (bNewPrefab) {
                this.levelEditor.addPrefabToView(prefabSaved);
            }
        } 
    }

    /**
     * Callback for when prefab suceeded/failed delete
     * @param {String} message          Message to display
     * @param {Int} errorCode           Error code from server, 0 if successful save, -1 if client error
     * @param {Prefab} prefabToDeleted  Prefab that was deleted / attempted to delete
     */
    onDeletePrefabCallback(message, errorCode, prefabToDeleted) {
        this.levelEditor.onMessageCallback(message);
        
        // if deleted from server, delete on screen
        if (!errorCode) {
            prefabToDeleted.view.remove();
        }
    }

    // Resets the prefab info box to blank with nothing selected
    onLeavePrefabSave() {
        if (!this.bCreatingPrefab) {
            this.unselectPrefab()
        }
        // hide save button and update style
        this.enterSavePrefabMode(false)
        $('#prefab-info-box').removeClass('prefab-box-create-new')
        $('#prefab-info-box').removeClass('prefab-box-select')
        this.bCreatingPrefab = false;

        this.resetPrefabInfoBox()
        this.showDeleteButton(false)
    }

    showDeleteButton(bShowDelete) {
        if (bShowDelete)
            $('#delete-prefab').removeAttr('style')
        else
            $('#delete-prefab').css('display', 'none')
    }

    /**
     * On selecting a prefab from the prefab bar, update the visuals of the prefab info box
     * @param {Prefab} prefab  Prefab clicked
     */
     setPrefabOnClick(prefab) {
        prefab.view.on('click', event => {
            this.onLeavePrefabSave();

            // Set prefab info box to selected prefab data
            $('#prefab-info-name').val(prefab.name)
            $('#prefab-info-width').val(prefab.width)
            $('#prefab-info-height').val(prefab.height)
            $('#prefab-info-bounce').val(prefab.bounce)
            $('#prefab-info-mass').val(prefab.mass)
            $('#prefab-info-friction').val(prefab.friction)
            $('#prefab-info-shape').text(prefab.shape)
            $('#prefab-info-texture').text(prefab.texture)
            $('#prefab-info-type').text(prefab.type)
            $('#prefab-info-filename').text(prefab.filename)
            
            // Select prefab and put up cover screen
            prefab.view.addClass('prefab-selected')
            this.showPrefabSelectCoverScreen(true)
            this.selectedPrefab = prefab;

            this.enterSavePrefabMode(true)
            $('#prefab-info-box').addClass('prefab-box-select')

            this.showDeleteButton(true)
            this.disableNameInput(true)
        })
    }

    disableNameInput(bEnable) {
        $("#prefab-info-name").prop('disabled', bEnable)
    }

    resetPrefabInfoBox() {
        $('#prefab-info-name').val("")
        $('#prefab-info-width').val("")
        $('#prefab-info-height').val("")
        $('#prefab-info-bounce').val("")
        $('#prefab-info-mass').val("")
        $('#prefab-info-friction').val("")
        $('#prefab-info-shape').text("")
        $('#prefab-info-texture').text("")
        $('#prefab-info-type').text("")
        $('#prefab-info-filename').text("")
    }

    /**
     * Unselect the currently selected prefab
     */
     unselectPrefab() {
        // reset prefab info box
        this.resetPrefabInfoBox();

        // unselect prefab and hide cover screen
        if (this.selectedPrefab) {
            this.selectedPrefab.view.removeClass('prefab-selected')
            this.selectedPrefab = undefined;
        }
        
        this.showPrefabSelectCoverScreen(false)
    }
}