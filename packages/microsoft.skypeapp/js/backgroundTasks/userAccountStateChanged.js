

(function () {
    "use strict";

    importScripts("/js/backgroundTasks/backgroundTaskBase.js");

    var userAccountStateChanged = WinJS.Class.derive(Skype.BackgroundTasks.BackgroundTaskBase, function constructor(webUIBackgroundTaskInstance) {
        Skype.BackgroundTasks.BackgroundTaskBase.call(this, "userAccountStateChanged", webUIBackgroundTaskInstance);
    }, {
        _executeAsync: function () {
            return new WinJS.Promise(function (completed, error) {
                importScripts("/js/globalextensions.js");
                importScripts("/js/loginManager.js");
                if (Skype.LoginManager.isValidCurrentUser()) {
                    
                    completed();
                    return;
                }

                
                if (lib) {
                    
                    Skype.LoginManager.invalidateCurrentUser();
                    completed();
                } else {
                    
                    
					importScripts("/js/notifications/wnsChannelRegistration.js");
                    importScripts("/js/notifications/notifications.js");
                    Skype.Notifications.closeChannelAsync().then(completed, error);
                }
            });
        },
        
        _fakeCloseTask: function() {
            
            
            
            close();
        }
    });

    WinJS.Namespace.define("Skype.BackgroundTasks", {
        UserAccountStateChanged: userAccountStateChanged
    });
})();

Skype.BackgroundTasks.BackgroundTaskBase.run(Skype.BackgroundTasks.UserAccountStateChanged);