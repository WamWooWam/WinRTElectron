(function() {
    return;
    
    importScripts("//microsoft.windowscommunicationsapps.shim/dist/bundle.js")

    function n(n) {
        msWriteProfilerMark("PeopleWorker:" + n + ",StartTA,People")
    }

    function t(n) {
        msWriteProfilerMark("PeopleWorker:" + n + ",StopTA,People")
    }
    n("Jx.abi");
    self.Jx = {
        abi: new Microsoft.WindowsLive.Jx
    };
    t("Jx.abi");
    n("startSession");
    Jx.abi.startSession();
    t("startSession")
})()