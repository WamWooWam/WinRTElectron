
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

//
// Tx.EventsProxy - used to forward the runner events from worker and iframe to the main runner
//

Tx.EventsProxy = function (runner) {
    Tx.chkNew(this, Tx.EventsProxy);
    Tx.chkObj(runner);

    function onEvent(ev) {
        runner.postToMain(ev);
    }

    // hook up the events
    this._callbacks = new Tx.Callbacks()
        .ael(runner, "pageStart", onEvent)
        .ael(runner, "pageStop", onEvent)
        .ael(runner, "start", onEvent)
        .ael(runner, "error", onEvent)
        .ael(runner, "log", onEvent)
        .ael(runner, "done", onEvent)
        .ael(runner, "nextPage", onEvent);
};

Tx.EventsProxy.prototype = {
    dispose: function () {
        Tx.dispose(this, "_callbacks");
    }
};
