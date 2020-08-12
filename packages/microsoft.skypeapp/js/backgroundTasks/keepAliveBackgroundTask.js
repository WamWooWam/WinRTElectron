

(function () {
    "use strict";

    importScripts("/js/backgroundTasks/backgroundTaskBase.js");

    var keepAlive = WinJS.Class.derive(Skype.BackgroundTasks.BackgroundTaskBase, function constructor(webUIBackgroundTaskInstance) {
        Skype.BackgroundTasks.BackgroundTaskBase.call(this, "keepAlive", webUIBackgroundTaskInstance);
    }, {
        _TIME_TO_EXECUTE_KEEP_ALIVE_LIB_TASKS: 4000, 

        _executeAsync: function () {
            return new WinJS.Promise(function(completedHandler, errorHandler) {
                importScripts("/js/globalextensions.js");
                importScripts("/js/loginManager.js");
                if (!Skype.LoginManager.isValidCurrentUser()) {
                    completedHandler();
                    return;
                }

                if (lib) {
                    log("library is available");
                    lib.executeBackgroundTask();
                    WinJS.Promise.timeout(this._TIME_TO_EXECUTE_KEEP_ALIVE_LIB_TASKS).then(completedHandler, errorHandler);
                } else {
                    log("library is not available");
                    
                    importScripts("/js/notifications/parsers/parserBase.js");
                    importScripts("/js/notifications/parsers/msnParserBase.js");
                    importScripts("/js/notifications/parsers/msnCntParser.js");
                    importScripts("/js/notifications/parsers/msnSdgParser.js");
                    importScripts("/js/notifications/parsers/msnOutParser.js");
                    importScripts("/js/notifications/parsers/callNotificationParser.js");
                    importScripts("/js/notifications/parsers/abchNotificationParser.js");
                    
                    
                    importScripts("/js/periodicWakeup.js");
                    
                    importScripts("/js/notifications/raw.js");

                    Skype.PeriodicWakeup.periodicWakeupAsync().then(completedHandler, errorHandler);
                }
            }.bind(this));
        },

        _fakeCloseTask: function () {
            
            
            
            close();
        }
    });

    WinJS.Namespace.define("Skype.BackgroundTasks", {
        KeepAlive: keepAlive
    });
})();

Skype.BackgroundTasks.BackgroundTaskBase.run(Skype.BackgroundTasks.KeepAlive);