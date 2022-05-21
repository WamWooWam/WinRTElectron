
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,location,Worker,Tx*/

(function () {
    function _markStart(s) { Tx.mark("Tx.RunnerMain." + s + ",StartTA,Tx"); }
    function _markStop(s) { Tx.mark("Tx.RunnerMain." + s + ",StopTA,Tx"); }
    function _markInfo(s) { Tx.mark("Tx.RunnerMain." + s + ",Info,Tx"); }
    
    Tx.RunnerMain = function (options) {
        Tx.chkNew(this, Tx.RunnerMain);
        Tx.chkIf(Tx.isMain);

        _markStart("ctor");

        this.initRunnerBase(options);

        this._storage = new Tx.SuiteStorage(); // TODO: rename it?
        this._config = new Tx.Config(options);
        this._config.loadStorage(this._storage);

        this._callbacks = new Tx.Callbacks()
            .ael(window, "message", this.onIFrameMessage, this)
            .ael(window, "beforeunload", this.onBeforeUnload);

        this._worker = null; // created on demand
        this._mark = new Tx.Mark(this);
        this._htmlLog = new Tx.HtmlLog(this);
        this._bvtLog = new Tx.BvtLog(this);
        this._fileLog = new Tx.FileLog(this);
        this._wexLogger = Tx.isWWA ? new Tx.WexLogger(this, this._config) : null;
        this._shortcutKeys = new Tx.ShortcutKeys(options.shortcutKeys);
        this._navigator = new Tx.Navigator(this, this._config);
        this._protocol = Tx.isWWA ? new Tx.Protocol(this, this._config) : null;
        
        this.commands = new Tx.Commands(this._navigator, this._config);

        _markStop("ctor");
    };

    Tx.RunnerMain.prototype = {
        dispose: function () {
            _markStart("dispose");

            // TODO: terminate the worker?
            this._worker = null;

            Tx.dispose(this, "_protocol", "_navigator", "_config", "_shortcutKeys", "_storage", "_wexLogger", "_htmlLog", "_bvtLog", "_mark", "_callbacks", "_fileLog");

            this.disposeRunnerBase();

            _markStop("dispose");
        },

        run: function () {
            _markStart("run");
            
            this.pageStartTime = Date.now();
            // TODO: fix location for iframes and workers
            this.dispatchEvent({ type: "pageStart", src: location.href, testCount: this._testStore.getCount() });
            this._processTests();

            _markStop("run");
        },

        runWorker: function () {
            _markStart("runWorker");

            this.pageStartTime = Date.now();
            this.postToWorker({ msg: "run" });

            _markStop("runWorker");
        },

        createWorker: function (src) {
            Tx.chkStrNE(src);
            Tx.chkIf(!this._worker); // the worker is already created

            _markInfo("createWorker: " + src);
            this._worker = new Worker(src);
            this._callbacks.ael(this._worker, "message", this.onWorkerMessage, this);
        },

        postToWorker: function (msg) {
            Tx.chkObj(msg);
            Tx.chkObj(this._worker);

            var m = JSON.stringify(msg);
            _markInfo("postToWorker:" + m);
            this._worker.postMessage(m);
        },

        onProtocol: function () {
            _markInfo("onProtocol");
            if ("isLab" in this._config._data.protocolArgs){
                this._config._data.isLab = (this._config._data.protocolArgs.isLab === "true");
                Tx.log("Running under lab conditions.");
            }
            this.onSuiteStart();
            this._config.setAutoClose(true);            

            // use setImmediate to dismiss the splash screen
            var that = this;
            Tx.setImmediate(function () {
                that.commands.runAll();
            });
        },

        onSuiteStart: function () {
            _markInfo("onSuiteStart");
            this.dispatchEvent({ type: "suiteStart", src: window.location.href });
        },

        onSuiteStop: function () {
            _markInfo("onSuiteStop");
            this.dispatchEvent({ type: "suiteStop" });
        },

        onBeforeUnload: function () {
            _markInfo("onBeforeUnload");
            Tx.shutdown(); // TODO: find a better way
        },

        onIFrameMessage: function (ev) {
            if (!ev.data.purpose) {
                // The post message queue is also used by glomManager.
                // Checking ev.data.purpose to make sure glomManager messages are not used here.
                Tx.chkObj(ev);
                _markInfo("onIFrameMessage:" + ev.data);
                var e = JSON.parse(ev.data);
                this.dispatchEvent(e);
            }
        },

        onWorkerMessage: function (ev) {
            if (!ev.data.purpose) {
                // The post message queue is also used by glomManager.
                // Checking ev.data.purpose to make sure glomManager messages are not used here.
                Tx.chkObj(ev);
                var data = ev.data;
                _markInfo("onWorkerMessage:" + data);
                this.dispatchEvent(JSON.parse(data));
            }
        }
        
    };

    Tx.mix(Tx.RunnerMain.prototype, Tx.RunnerBase);
})();
