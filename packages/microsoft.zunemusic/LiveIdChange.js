/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    var backgroundTaskInstance = Windows.UI.WebUI.WebUIBackgroundTaskInstance.current;
    if (backgroundTaskInstance.task.name === "LiveIdChange")
        close()
})()
