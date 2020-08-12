

(function () {
    "use strict";

    function log(message) {
        
        ///<disable>JS2043.RemoveDebugCode</disable>
        console.log("controlChannelTrigger: " + message);
        ///<enable>JS2043.RemoveDebugCode</enable>
        
        LibWrap.WrSkyLib.log("controlChannelTrigger", message);
    }
    
    log && log("Enter");

    
    var timeoutId;
    function onCancel(cancelSender, reason) {
        log && log("onCancel");
        timeoutId && clearTimeout(timeoutId);
        close();
    }

    
    var currentInstance = Windows.UI.WebUI.WebUIBackgroundTaskInstance.current;
    currentInstance.addEventListener("canceled", onCancel);

    var cctTaskExecutionTime = 2000;
    timeoutId = setTimeout(function () {
        log && log("Leave");
        close();
    }, cctTaskExecutionTime);

})();