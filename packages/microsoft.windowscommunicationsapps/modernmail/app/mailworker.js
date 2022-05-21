
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,Microsoft,Jx,msWriteProfilerMark */

(function () {
    function _markStart(s) { msWriteProfilerMark("MailWorker:" + s + ",StartTA,Mail"); }
    function _markStop(s)  { msWriteProfilerMark("MailWorker:" + s + ",StopTA,Mail"); }

    importScripts(
        "ms-appx://winrt/dist/winrt.bundle.js", 
        "ms-appx://microsoft.windowscommunicationsapps.shim/dist/bundle.js");

    // JxWorker.js contains the ETW initialization code but it's too much overhead to load the whole file.
    // Assign the Jx abi to a global variable to keep it alive. It will speed up the initialization on the UI thread.

    _markStart("Jx.abi");
    self.Jx = {
        abi: new Microsoft.WindowsLive.Jx()
    };
    _markStop("Jx.abi");

    // Start the ETW session. 
    _markStart("startSession");
    Jx.abi.startSession();
    _markStop("startSession");
})();