
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global importScripts,msWriteProfilerMark*/

//
// TxWorkerHost.js
//

(function () {

    // TODO: move this code to TxLoader.js

    function _markStart(s) { msWriteProfilerMark("TxWorkerHost.js:" + s + ",StartTA,Tx"); }
    function _markStop(s) { msWriteProfilerMark("TxWorkerHost.js:" + s + ",StopTA,Tx"); }

    _markStart("global");

    [
        "Tx.js",
        "TxUtils.js",
        "TxChk.js",
        "TxConfig.js",
        "TxCallbacks.js",
        "TxEvents.js",
        "TxTestContext.js",
        "TxTest.js",
        "TxTestStore.js",
        "TxMark.js",
        "TxEventsProxy.js",
        "TxRunnerBase.js",
        "TxRunnerWorker.js",
        "TxInit.js"
    ].forEach(function (js) {
        _markStart('importScript:"' + js + '"');
        importScripts(js);
        _markStop('importScript:"' + js + '"');
    });

    // TODO: call Tx.shutdown() 

    _markStop("global");

})();