
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,Microsoft,Jx,msWriteProfilerMark */

(function () {
    function _start(s) { msWriteProfilerMark("PeopleWorker:" + s + ",StartTA,People"); }
    function _stop(s)  { msWriteProfilerMark("PeopleWorker:" + s + ",StopTA,People"); }

    // JxWorker.js contains the ETW initialization code but it's too much overhead to load the whole file.
    // Assign the Jx abi to a global variable to keep it alive. It will speed up the initialization on the UI thread.

    _start("Jx.abi");
    self.Jx = {
        abi: new Microsoft.WindowsLive.Jx()
    };
    _stop("Jx.abi");

    // Start the ETW session. 
    _start("startSession");
    Jx.abi.startSession();
    _stop("startSession");
})();