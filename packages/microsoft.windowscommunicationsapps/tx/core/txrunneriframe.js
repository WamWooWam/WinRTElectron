
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,parent,location,Tx*/

//
// Tx.RunnerIFrame
//

(function () {
    function _markStart(s) { Tx.mark("Tx.RunnerIFrame." + s + ",StartTA,Tx"); }
    function _markStop(s) { Tx.mark("Tx.RunnerIFrame." + s + ",StopTA,Tx"); }
    function _markInfo(s) { Tx.mark("Tx.RunnerIFrame." + s + ",Info,Tx"); }
    // TODO: fix all Tx.mark

    Tx.RunnerIFrame = function (options) {
        Tx.chkNew(this, Tx.RunnerIFrame);
        Tx.chkIf(Tx.isIFrame);

        _markStart("ctor");

        this.initRunnerBase(options);

        this._callbacks = new Tx.Callbacks().ael(self, "message", this._onMessage, this);

        this._eventsProxy = new Tx.EventsProxy(this);

        _markStop("ctor");
    };

    Tx.RunnerIFrame.prototype = {
        dispose: function () {
            _markStart("dispose");

            Tx.dispose(this, "_eventsProxy", "_callbacks");

            this.disposeRunnerBase();

            _markStop("dispose");
        },

        run: function () {
            _markStart("run");

            if (this._wexLogger) {
                this._wexLogger.init();
            }

            this.pageStartTime = Date.now();
            this.dispatchEvent({ type: "pageStart", src: location.href, testCount: this._testStore.getCount() });
            this._processTests();

            _markStop("run");
        },

        postToMain: function (msg) {
            Tx.chkObj(msg);
            parent.postMessage(JSON.stringify(msg), "*"); // TODO: fix *
        },

        _onMessage: function (ev) {
            Tx.chkObj(ev);

            _markInfo("_onMessage:" + ev.data);
            var e = JSON.parse(ev.data);
            Tx.chkEq(e.msg, "run");
            this.run();
        }
    };

    Tx.mix(Tx.RunnerIFrame.prototype, Tx.RunnerBase);

})();
