/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    if (window.onNewMusicPage)
        return;
    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
    if (config.shell.useNewMusicPage) {
        if (window.sessionStorage["NewAppNavigated"] !== "true")
            window.usingNewMusicPage = true;
        window.setImmediate(function() {
            window.sessionStorage["NewAppNavigated"] = "true";
            window.navigate("/lxmain.html")
        })
    }
})()
