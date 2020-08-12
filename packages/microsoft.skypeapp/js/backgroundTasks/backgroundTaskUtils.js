

(function () {
    "use strict";

    
    
    importScripts("/js/loginManager.js");
    
    importScripts("/js/globalextensions.js");

    function taskLog(taskName, message) {
        
        ///<disable>JS2043.RemoveDebugCode</disable>
        console.log(taskName + ": " + message);
        ///<enable>JS2043.RemoveDebugCode</enable>

        
        LibWrap.WrSkyLib.log(taskName, message);
    }
    

    WinJS.Namespace.define("Skype.BackgroundTaskUtils", {
        log: taskLog
    });
})();