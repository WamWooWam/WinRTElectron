
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Tx*/

//
// Tx runner helpers
//

Tx.runner = null;
Tx.suite = null;

Tx.init = function (config) {
    Tx.chkNull(Tx.runner); // Tx.init called multiple times
    Tx.chkObj(config);

    // TODO: revisit this
    if (Tx.isWorker) {
        Tx.runner = new Tx.RunnerWorker(config);
    } else if (Tx.isIFrame) {
        Tx.runner = new Tx.RunnerIFrame(config);
    } else if (Tx.isMain) {
        var ssPages = window.sessionStorage.txPages; // TODO: find a better way
        if (ssPages) {
            config.pages = JSON.parse(ssPages);
        }
        Tx.runner = new Tx.RunnerMain(config);
    } else {
        Tx.assert(false);
    }
};

Tx.shutdown = function () {
    Tx.chkObj(Tx.runner, "Tx.shutdown: already called");
    Tx.runner.dispose();
    Tx.runner = null;
};

Tx.initSuite = function (el) {
    Tx.chkNull(Tx.suite); // Tx.initSuite called multiple times
    Tx.suite = new Tx.Suite(Tx.runner, Tx.config);
    Tx.suite.show(el);
};

Tx.shutdownSuite = function () {
    Tx.suite.deactivateUI();
    Tx.suite.dispose();
    Tx.suite = null;
};

Tx.test = function (desc, options, fn) {
    Tx.runner.test(desc, options, fn);
};

Tx.asyncTest = function (desc, options, fn) {
    Tx.runner.asyncTest(desc, options, fn);
};

Tx.run = function () {
    Tx.runner.run();
};

Tx.log = function (msg) {
    Tx.chkStr(msg);
    Tx.runner.log(msg);
};

Tx.runWorker = function () {
    Tx.runner.runWorker();
};

Tx.addWorkerScript = function (src) {
    Tx.chkStrNE(src);
    Tx.chkIf(Tx.isMain); // should be called on the UI thread, it posts a message to the worker to import the script

    // TODO: support multiple scripts

    Tx.mark("Tx.addWorkerScript: " + src + ",StartTA,Tx");
    Tx.runner.postToWorker({ msg: "addScript", src: src });
    Tx.mark("Tx.addWorkerScript: " + src + ",StopTA,Tx");
};

Tx.init(Tx.config);
