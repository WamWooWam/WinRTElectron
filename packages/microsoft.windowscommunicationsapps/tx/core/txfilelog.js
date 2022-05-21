
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Windows,Microsoft,Tx*/

(function () {
    function _markStart(s) { Tx.mark("Tx.FileLog." + s + ",StartTA,Tx"); }
    function _markStop(s) { Tx.mark("Tx.FileLog." + s + ",StopTA,Tx"); }
    function _markInfo(s) { Tx.mark("Tx.FileLog." + s + ",Info,Tx"); }

    Tx.FileLog = function (runner) {
        Tx.chkNew(this, Tx.FileLog);

        _markInfo("ctor");

        this._fs = null;
        this._fileName = "\\tx.log";
        this._hLogFile = -1;

        // hook up the events
        this._callbacks = new Tx.Callbacks()
            .ael(runner, "suiteStart", this.onSuiteStart, this)
            .ael(runner, "suiteStop", this.onSuiteStop, this)
            .ael(runner, "pageStart", this.onPageStart, this)
            .ael(runner, "pageStop", this.onPageStop, this)
            .ael(runner, "start", this.onStart, this)
            .ael(runner, "error", this.onError, this)
            .ael(runner, "log", this.onLog, this)
            .ael(runner, "done", this.onDone, this);
    };

    Tx.FileLog.prototype = {
        dispose: function () {
            _markStart("dispose");
            Tx.dispose(this, "_callbacks");

            this.closeLog();

            this._fs = null;
            _markStop("dispose");
        },

        getFS: function () {
            return this._fs || (this._fs = new Microsoft.WindowsLive.Tx.FileSystem());
        },

        createLog: function () {
            _markStart("createLog");
            var fs = this.getFS();
            var h = fs.createFile(Windows.Storage.ApplicationData.current.localFolder.path + this._fileName, Tx.GENERIC_WRITE, Tx.FILE_SHARE_READ, Tx.CREATE_ALWAYS);
            fs.writeFile(h, "\uFEFF\r\n" + JSON.stringify({Tx: "suiteStart", time: Date.now(), page: window.location.href }) + "\r\n"); // \uFEFF is the UTF-16 BOM
            fs.closeHandle(h);
            _markStop("createLog");
        },

        openLog: function () {
            _markStart("openLog");
            var fs = this.getFS();
            this._hLogFile = fs.createFile(Windows.Storage.ApplicationData.current.localFolder.path + this._fileName, Tx.GENERIC_WRITE, Tx.FILE_SHARE_READ, Tx.OPEN_EXISTING);
            fs.setFilePointer(this._hLogFile, 0, Tx.FILE_END);
            _markStop("openLog");
        },

        closeLog: function(){
            if (this._hLogFile != -1) {
                _markInfo("closeHandle");
                this._fs.closeHandle(this._hLogFile);
                this._hLogFile = -1;
            }
        },

        log: function (str) {
            if (this._hLogFile != -1) {
                this.getFS().writeFile(this._hLogFile, str);
            }
        },

        onSuiteStart: function (/*ev*/) {
            this.createLog();
        },

        onSuiteStop: function (ev) {
            this.openLog();
            this.log(JSON.stringify({Tx: ev.type, time: Date.now()}) + "\r\n");
        },

        onPageStart: function (ev) {
            this.openLog();
            this.log(JSON.stringify({Tx: ev.type, time: Date.now(), page: ev.src }) + "\r\n");
        },

        onPageStop: function (ev) {
            this.log(JSON.stringify({ Tx: ev.type, time: Date.now(), page: ev.src }) + "\r\n");
            this.closeLog();
        },

        onStart: function (ev) {
            this.log(JSON.stringify({Tx: ev.type, time: Date.now(), desc: ev.testDesc, feature: ev.feature, owner: ev.owner }) + "\r\n");
        },

        onError: function (ev) {
            this.log(JSON.stringify({Tx: ev.type, time: Date.now(), desc: ev.testDesc, msg: ev.msg }) + "\r\n");
        },

        onLog: function (ev) {
            this.log(JSON.stringify({Tx: ev.type, time: Date.now(), desc: ev.testDesc, msg: ev.msg }) + "\r\n");
        },

        onDone: function (ev) {
            this.log(JSON.stringify({Tx: ev.type, time: Date.now(), desc: ev.testDesc, duration: ev.duration, hasErrors: ev.hasErrors }) + "\r\n");
        }
    };
})();