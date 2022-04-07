// Copyright (C) 2020 Scott Henshaw, All Rights Reserved
'use strict';

import Express from 'express'
import Path, { dirname } from 'path'
import HTTP from 'http'
import URL, { fileURLToPath } from 'url'
import fs from 'fs'

const PORT = 3000;
const __dirname = dirname( fileURLToPath( import.meta.url ));

class Server {

    constructor() {

        this.api = Express();
        this.api.use(Express.json()) 
                .use(Express.urlencoded({ extended: false }))
                .use(Express.static(Path.join( __dirname, '.')));

        this.api.post('/api/loadBackgrounds', (request, response) => {
            let result = { error: 1 }

            let backgroundList = fs.readdirSync('./images/backgrounds')
                                    .map((imageName) => '../images/backgrounds/' + imageName)
            result.payload = backgroundList;

            result.error = 0
            this.respondToClient(result, response)
        })

        this.api.post('/api/delete', (request, response) => {
             
            let result = { error: 1 }

            let data = JSON.parse(request.body.data);     // data attached as JSON data
            /*{
                "name": "filename", // name of entity, no spaces, no extension
                "type": "object" | "level", // one of these two key strings
            }*/

            let filenameToDelete = data.name 

            if (data.type == "level") {
                let levels = JSON.parse(fs.readFileSync('./data/levels.json'))

                // Delete level from level list
                for (let i = 0; i < levels.length; i++) {
                    if (levels[i].filename == `${filenameToDelete}.json`) {
                        levels.splice(i, 1);
                        fs.writeFileSync('./data/levels.json', JSON.stringify(levels))
                        break;
                    }
                }
                // delete level file
                fs.unlinkSync(`./data/${filenameToDelete}.json`)
                result.error = 0;
            } else if (data.type == "object") {

                let prefabName = JSON.parse(fs.readFileSync(`./data/${filenameToDelete}.json`)).name
                let levels = JSON.parse(fs.readFileSync('./data/levels.json'))

                let levelsHoldingPrefab = [];   // Holds all levels that currently contain this prefab
                for (let level of levels) {
                    let levelData = JSON.parse(fs.readFileSync(`./data/${level.filename}`))

                    if (this.checkPrefabUsed(prefabName, levelData.entities.targets) || this.checkPrefabUsed(prefabName, levelData.entities.collidables)) {
                        levelsHoldingPrefab.push(levelData.name)
                        continue;
                    }
                }

                // If prefab found inside a level, prevent deleting
                if (levelsHoldingPrefab.length > 0) {

                    result.error = 3
                    result.levels = JSON.stringify(levelsHoldingPrefab)
                // Otherwise prefab safe to delete
                } else {
                    // delete prefab file
                    fs.unlinkSync(`./data/${filenameToDelete}.json`)
                    // delete from prefab list
                    let prefabs = JSON.parse(fs.readFileSync('./data/prefabs.json'))
                    for (let i = 0; i < prefabs.length; i++) {
                        if (prefabs[i].filename == `${filenameToDelete}.json`) {
                            prefabs.splice(i, 1);
                            fs.writeFileSync('./data/prefabs.json', JSON.stringify(prefabs))
                            break;
                        }
                    }

                    result.error = 0
                }
            }
            this.respondToClient(result, response);
        }) 

        this.api.post('/api/load', (request, response) => {

            let result = { error: 1 }
            // Make sure necessary JSON files exist
            
            let data = JSON.parse(request.body.data)

            result.name = data.name
            
            let path
            if (data.name.includes(".json"))
                path = `./data/${data.name}`
            else
                path = `./data/${data.name}.json`
                
            // load level/object from JSON
            if (fs.existsSync(path)) {
                result.payload = JSON.parse(fs.readFileSync(path))
                result.bytes = fs.statSync(path)
                result.error = 0
            }

            // extra computations for level object
            if (data.type == "level") {
                
                this.combineLevelObjectWithPrefabs(result.payload.entities.targets)
                this.combineLevelObjectWithPrefabs(result.payload.entities.collidables)

            // convert resititution to bounce
            } else {
                this.convertRestitutionToBounce(result.payload)
            }

            this.respondToClient(result, response);
        })

        this.api.post('/api/get_object_list', (request, response) => {

            let result = { error: 1 }
            this.CheckMainJSONsExists();
            result.payload = JSON.parse(fs.readFileSync('./data/prefabs.json'));

            result.error = 0;
            this.respondToClient(result, response);
        })

        this.api.post('/api/save', (request, response) => {
            let result = { error: 1 }

            // TODO: Save directly in body instead of data?
            let data = JSON.parse(request.body.data)     // data attached as JSON data
            /*
            {
                "userid": "valid vfs username", // eg pg22student
                "name": "filename", // name of entity, no spaces, no extension
                "type": "object" | "level", // one of these two key strings
                "payload": "JSONString" // actual data in JSON format 
            }       
             */
            const payload = data.payload
            const type = data.type
            const name = data.name
            let saveObject = payload

            // store number of bytes written to the file
            const size = Buffer.byteLength(JSON.stringify(payload))
            result.bytes = size

            // if saving new level/object
            if (!name) {

                // prevent duplicate names
                if ((type == 'object' && !this.isValidPrefabName(payload.name)) ||
                    (type == "level" && !this.isValidLevelName(payload.name))) {
                    result.error = 2
                    this.respondToClient(result, response);
                } else {
                    this.saveNew(saveObject, type, result, response)
                }
                
            // otherwise, update existing level/object
            } else {
                this.update(saveObject, type, name, result, response)
            }
        })

        this.api.post('/api/get_level_list', (request, response) => {
            let result = { error: 1 };
            this.CheckMainJSONsExists();
            let rawdata = fs.readFileSync('./data/levels.json');
            result.payload = JSON.parse(rawdata);

            result.error = 0;
            this.respondToClient(result, response)
        });

        this.run();
    }

    /**
     * Checks if the the main prefabs.json, levels.json and index.json exist. If not, create them with an empty list.
     */
    CheckMainJSONsExists() {
        // Check if level list exists
        if (!fs.existsSync('./data/levels.json')) 
            fs.writeFileSync('./data/levels.json', JSON.stringify([]))
        
        // check if prefab list exists
        if (!fs.existsSync('./data/prefabs.json')) 
            fs.writeFileSync('./data/prefabs.json', JSON.stringify([]))

        // check if index tracker exists
        if (!fs.existsSync('./data/index.json')) 
            fs.writeFileSync('./data/index.json', JSON.stringify({"level-index":0,"prefab-index":0}))
        
    }

    combineLevelObjectWithPrefabs(levelObjects) {
        let prefabs = []
        // Get all filenames of prefabs
        let filenames = fs.readdirSync('./data').filter(filename => filename.includes("prefab"))
        // get all prefab's data  
        for (let filename of filenames) {
            prefabs.push(JSON.parse(fs.readFileSync(`./data/${filename}`)))
        }

        // apply the prefab data to the corresponding target objects
        for (let i = 0; i < levelObjects.length; i++) {
            for (let prefab of prefabs) {
                if (prefab.name == levelObjects[i].name) {
                    this.convertRestitutionToBounce(prefab)
                    levelObjects[i] = { ...levelObjects[i], ...prefab }
                    break;
                }
            }
        }
    }

    convertBounceToRestitution(objToAlter) {
        objToAlter.restitution = objToAlter.bounce
        delete objToAlter.bounce
    }

    convertRestitutionToBounce(objToAlter) {
        objToAlter.bounce = objToAlter.restitution
        delete objToAlter.restitution
    }

    checkPrefabUsed(nameToCheck, listOfGameObjects) {

        for (let gameObject of listOfGameObjects) {
            if (gameObject.name == nameToCheck)
                return true
        }
        return false
    }

    /**
     * Update an existing level/prefab
     */
    update(saveObject, type, name, result, response) {
        let typeFilepath    // filepath to list of prefabs/levels 
        if (type == "level") {
            typeFilepath = './data/levels.json'
            saveObject.id = saveObject.filename
            this.combineLevelObjectWithPrefabs(saveObject.entities.targets)
            this.combineLevelObjectWithPrefabs(saveObject.entities.collidables)
        } else  {
            typeFilepath = './data/prefabs.json'
            saveObject.value = 0
            this.convertBounceToRestitution(saveObject)
        }
        
        // List of objects related to the object currently saving
        let listOfType = JSON.parse(fs.readFileSync(typeFilepath));

        let bUpdated = false
        // loop through all stored level to find the one with the same filename and update
        for (let i = 0; i < listOfType.length; i++) {
            if (listOfType[i].filename == `${saveObject.filename}.json`) {
                listOfType[i] = {name: saveObject.name, filename: `${saveObject.filename}.json`};
                fs.writeFileSync(typeFilepath, JSON.stringify(listOfType));
                fs.writeFileSync(`./data/${name}.json`, JSON.stringify(saveObject))
                result.filename = saveObject.filename;
                bUpdated = true;
                break;
            }
        }

        if (bUpdated) 
            result.error = 0;
        this.respondToClient(result, response);
    }

    /**
     * Save a new level/prefab
     */
    saveNew(saveObject, type, result, response) {
        // Get the new filename of the level/prefab
        let ids = JSON.parse(fs.readFileSync('./data/index.json'))

        let filename;
        // get index of level
        if (type == "level") {
            filename = `level-${ids["level-index"]++}`
            saveObject.id = filename
            this.combineLevelObjectWithPrefabs(saveObject.entities.targets)
            this.combineLevelObjectWithPrefabs(saveObject.entities.collidables)
        // get index of prefab
        } else if (type == "object") {
            saveObject.id = ids["prefab-index"]
            saveObject.value = 0
            filename = `prefab-${ids["prefab-index"]++}`   

            this.convertBounceToRestitution(saveObject)
        }
        saveObject.filename = filename

        fs.writeFileSync('./data/index.json', JSON.stringify(ids));

        if (type == "level") {
            let levels = JSON.parse(fs.readFileSync('./data/levels.json'))
            levels.push({name: saveObject.name, filename: `${saveObject.filename}.json`})
            fs.writeFileSync('./data/levels.json', JSON.stringify(levels))
            fs.writeFileSync(`./data/${saveObject.filename}.json`, JSON.stringify(saveObject))
        } else {
            let prefabs = JSON.parse(fs.readFileSync('./data/prefabs.json'))
            prefabs.push({name: saveObject.name, filename: `${saveObject.filename}.json`})
            fs.writeFileSync('./data/prefabs.json', JSON.stringify(prefabs))
            fs.writeFileSync(`./data/${saveObject.filename}.json`, JSON.stringify(saveObject))
        }

        result.filename = saveObject.filename;
        
        result.error = 0;
        this.respondToClient(result, response);
    }

    isValidPrefabName(name) {
        let prefabs = JSON.parse(fs.readFileSync('./data/prefabs.json'))
        for (let prefab of prefabs) {
            if (prefab.name == name)
                return false;
        }
        return true;
    }

    isValidLevelName(name) {
        let levels = JSON.parse(fs.readFileSync('./data/levels.json'))
        for (let level of levels) {
            if (level.name == name)
                return false;
        }
        return true;
    }


    respondToClient(result, response) {
        const JSONString = JSON.stringify(result);
        response.send(JSONString);
    }

    run() {

        this.api.set('port', PORT);
        this.listener = HTTP.createServer( this.api );
        this.listener.listen(PORT);
        this.listener.on('listening', event => {

            let addr = this.listener.address();
            let bind = typeof addr == `string` ? `pipe ${addr}`: `port ${addr.port}`;

            console.log(`Listening on ${bind}`)
        });
    }
}

const server = new Server();