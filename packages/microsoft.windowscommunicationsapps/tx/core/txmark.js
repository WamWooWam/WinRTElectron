
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.Mark = function (runner) {
    Tx.chkNew(this, Tx.Mark);
    Tx.chkObj(runner);

    // hook up the events
    this._callbacks = new Tx.Callbacks()
        .ael(runner, "suiteStart", this.onSuiteStart, this)
        .ael(runner, "suiteStop", this.onSuiteStop, this)
        .ael(runner, "pageStart", this.onPageStart)
        .ael(runner, "pageStop", this.onPageStop)
        .ael(runner, "start", this.onStart)
        .ael(runner, "error", this.onError)
        .ael(runner, "log", this.onLog)
        .ael(runner, "done", this.onDone);
};

Tx.Mark.prototype = {
    dispose: function () {
        Tx.dispose(this, "_callbacks");
    },

    onSuiteStart: function (ev) {
        Tx.mark(Tx.format('{"Tx":"suiteStart","page":"%s"}', ev.src));
    },

    onSuiteStop: function (/*ev*/) {
        Tx.mark('{"Tx":"suiteStop"}');
    },

    onPageStart: function (ev) {
        Tx.mark(Tx.format('{"Tx":"pageStart","page":"%s"}', ev.src));
    },

    onPageStop: function (ev) {
        Tx.mark(Tx.format('{"Tx":"pageStop","page":"%s"}', ev.src));
    },

    onStart: function (ev) {
        Tx.mark(Tx.format('{"Tx":"testStart","desc":"%s","feature":"%s","owner":"%s"}', ev.testDesc, ev.feature, ev.owner));
    },

    onError: function (ev) {
        Tx.mark(Tx.format('{"Tx":"testError","desc":"%s","msg":"%s"}', ev.testDesc, ev.msg));
    },

    onLog: function (ev) {
        Tx.mark(Tx.format('{"Tx":"testLog","desc":"%s","msg":"%s"}', ev.testDesc, ev.msg));
    },

    onDone: function (ev) {
        Tx.mark(Tx.format('{"Tx":"testStop","desc":"%s","duration":%s,"hasErrors":%s}', ev.testDesc, ev.duration, ev.hasErrors));
    }
};
