






(function () {
    "use strict";

    importScripts("//Microsoft.WinJS.2.0/js/base.js", "/js/globalextensions.js", "/js/log.js", "/js/backgroundTasks/backgroundTasksRegistrator.js");

    self.onmessage = function (e) {
        if (e.data === "register") {
            log("register tasks");
            Skype.BackgroundTasks.Registrator.registerTasks();
        } else if (e.data === "unregister") {
            log("unregister tasks");
            Skype.BackgroundTasks.Registrator.unregisterTasks();
        }
    };
})();
