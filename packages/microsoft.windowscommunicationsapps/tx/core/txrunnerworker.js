
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,location,Tx*/

//
// Tx.RunnerWorker
//

(function () {
    function _markStart(s) { Tx.mark("Tx.RunnerWorker." + s + ",StartTA,Tx"); }
    function _markStop(s) { Tx.mark("Tx.RunnerWorker." + s + ",StopTA,Tx"); }
    function _markInfo(s) { Tx.mark("Tx.RunnerWorker." + s + ",Info,Tx"); }

    // TODO: add UT
    Tx.RunnerWorker = function (options) {
        Tx.chkNew(this, Tx.RunnerWorker);
        Tx.chkIf(Tx.isWorker);

        _markStart("ctor");

        this.initRunnerBase(options);

        this._callbacks = new Tx.Callbacks().ael(self, "message", this._onMessage, this);

        this._eventsProxy = new Tx.EventsProxy(this);

        _markStop("ctor");
    };

    Tx.RunnerWorker.prototype = {
        dispose: function () {
            _markStart("dispose");

            Tx.dispose(this, "_eventsProxy", "_callbacks");

            this.disposeRunnerBase();

            _markStop("dispose");
        },

        // TODO: move it to runner base?
        run: function () {
            _markStart("run");

            this.pageStartTime = Date.now();
            this.dispatchEvent({ type: "pageStart", src: location.href, testCount: this._testStore.getCount() });
            this._processTests();

            _markStop("run");
        },

        postToMain: function (msg) {
            Tx.chkObj(msg);
            self.postMessage(JSON.stringify(msg));
        },

        _onMessage: function (ev) {
            Tx.chkObj(ev);

            _markInfo("_onMessage: " + ev.data);
            var e = JSON.parse(ev.data);
            switch (e.msg) {
                case "addScript": Tx.importScripts(e.src); break; // TODO: support multiple scripts
                case "run": this.run(); break;
                default: Tx.assert(false);
            }
        }
    };

    Tx.mix(Tx.RunnerWorker.prototype, Tx.RunnerBase);
})();

