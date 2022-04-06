/*
Node Express Server (MEVN Stack)
Copyright (c) 2019-2020. Scott Henshaw, Kibble Online Inc. All Rights Reserved.
*/
'use strict';

import { fileURLToPath } from 'url'
import Path, { dirname } from 'path'
import CORS from 'cors'
import FileSystem from 'fs-extra'  // supports promses

const __filename = fileURLToPath( import.meta.url );
const __dirname = Path.resolve();

import Express from 'express'
import HTTP from 'http'

// import AppAPI from './server/AppAPI.js';
// import LevelAPI from './server/LevelAPI.js';

const PORT = 4000;

// Simplify this...
class Server {

    constructor( api, port = PORT ) {

        this.api = Express();
        this.router = Express.Router();
        this.port = port;
        this.title = "Angry Pigs";

        const crossOrigin = {
            'allowedHeaders':['Content-Type'],
            'allowedMethods':['GET, POST, OPTIONS'],
            'origin':'*',
            'preflightContinue': true,
        }

        this.api
            // .use( crossOrigin ).options('/*', this.corsHeader )
            .use( Express.json() )
            .use( Express.urlencoded({ extended: false }))
            .use('/', Express.static(`${Path.join(__dirname,'/game')}`))
            .use('/common', Express.static(`${Path.join(__dirname,'/common')}`))
            .use('/editor', Express.static(`${Path.join(__dirname,'/editor')}`));
            // .use('/api', LevelAPI );
            // append your APIs here

        this.run()
    }


    corsHeader(req, respnse, next ) {
        //  Middleware
        // reqs send and options req first, this is the res
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-reqed-With');
        res.sendStatus( 200 );
        next()
    }


    dataPath( userid ) {

        return `${Path.dirname( FileSystem.realpathSync(__filename))}/data/${userid}`
    }

    handleListenerError( error ) {
        // Listen on provided port, on all network interfaces
        if (error.syscall !== 'listen')
            throw error;

        // handle specific listen errors with friendly messages
        let bind = typeof this.port === `string`?`Pipe ${this.port}`:`Port ${this.port}`;
        switch (error.code) {

            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit (1 );
                break;

            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;

            default:
                throw error;
        }
    }

    handleListenerListening() {

        let addr = this.listener.address();
        let bind = typeof addr === `string`?`pipe ${addr}`:`port ${addr.port}`;
        console.log(`Listening on ${bind}`)
    }

    run() {
        // Create HTTP server.
        this.api.set('port', this.port );

        this.listener = HTTP.createServer( this.api );
        this.listener.listen( PORT );

        this.listener.on('error', error => this.handleListenerError( error ));
        this.listener.on('listening', () => this.handleListenerListening())
    }
}

const server = new Server()
