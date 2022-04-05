// Copyright (C) Nicholas Johnson 2022
'use strict';

import App from "./app.js"

// waits for every request before running javacript
document.addEventListener('DOMContentLoaded', event => {

    // Execute main app
    const app = new App();
    app.run()
})