

(function () {
    "use strict";

    var using = {
        
        
        
        bgTasksRegistrationWorker: null
    };
        

    function createWorker() {
        var worker = new Worker("/js/backgroundTasks/backgroundTasksRegistrationWorker.js");

        worker.onmessage = function (evt) {
            log("BG tasks registration worker, MESSAGE:", evt.data);
        };
        worker.onerror = function (evt) {
            log("BG tasks registration worker, ERROR:", evt);
        };

        return worker;
    }
    
    function refreshTasksAsync() {
        
        
        
        
        
        using.bgTasksRegistrationWorker.postMessage(Skype.BackgroundTasks.Manager.Commands.UNREGISTER);
        using.bgTasksRegistrationWorker.postMessage(Skype.BackgroundTasks.Manager.Commands.REGISTER);
    }
    
    function unregisterTasksAsync() {
        
        
        

        using.bgTasksRegistrationWorker.postMessage(Skype.BackgroundTasks.Manager.Commands.UNREGISTER);
    }

    WinJS.Namespace.define("Skype.BackgroundTasks.Manager", {
        
        
        
        

        refreshTasksAsync: refreshTasksAsync,
        unregisterTasksAsync: unregisterTasksAsync,
        external: using,
        Commands: {
            UNREGISTER: "unregister",
            REGISTER: "register"
        }
    });

    using.bgTasksRegistrationWorker = createWorker();
    
    Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGIN_FULL, refreshTasksAsync);
    Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGOUT, unregisterTasksAsync);
})();