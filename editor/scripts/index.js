// Copyright (C) 2022 Nicholas Johnson 
'use strict';

import App from "./app.js"

// waits for every request before running javacript
document.addEventListener('DOMContentLoaded', event => {

    // Execute main app
    const app = new App();
    app.run()
})