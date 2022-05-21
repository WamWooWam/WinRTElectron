
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,Windows,Microsoft,Tx*/


(function () {

    // TODO: provide more info using the logger API: %SDXROOT%\sdktools\WEXTest\sparta\Runtime\Wex.Logger\WinRtIdl

    function _markStart(s) { Tx.mark("Tx.WexLogger." + s + ",StartTA,Tx"); }
    function _markStop(s) { Tx.mark("Tx.WexLogger." + s + ",StopTA,Tx"); }

    Tx.WexLogger = function (runner, config) {
        Tx.chkNew(this, Tx.WexLogger);
        Tx.chkObj(runner);

        this._config = config;
        this._logger = null;
        this._callbacks = new Tx.Callbacks()
            .ael(runner, "suiteStop", this.onSuiteStop, this)
            .ael(runner, "pageStart", this.onPageStart, this)
            .ael(runner, "pageStop", this.onPageStop, this)
            .ael(runner, "start", this.onStart, this)
            .ael(runner, "error", this.onError, this)
            .ael(runner, "log", this.onLog, this)
            .ael(runner, "done", this.onDone, this);
    };

    Tx.WexLogger.prototype = {
        dispose: function () {
            Tx.dispose(this, "_callbacks");
            this._logger = null;
        },

        _createLogger: function () {
            if (!this._logger && self.Windows && self.Windows.WEX) {
                try {
                    // TODO: Do we need to append to an existing log? If yes then ensure the old results are removed.
                    var Logging = Windows.WEX.Logging;
                    var logSettings = new Logging.LogSettings();
                    logSettings.enableWttLogging = true;

                    // Determine if we have a WTT Task Guid
                    var taskGuid = "wttTaskGuidNotSet";
                    if ("wttTaskGuid" in this._config._data.protocolArgs) {
                        taskGuid = this._config._data.protocolArgs.wttTaskGuid;
                    } else if (Tx.isString(Tx.config.wttTaskGuid)) {
                        taskGuid = Tx.config.wttTaskGuid;
                    }

                    logSettings.wttTaskGuid = taskGuid;
                    Tx.log("wttTaskGuid = " + logSettings.wttTaskGuid);
                    logSettings.wttRunWorkingDir = Windows.Storage.ApplicationData.current.localFolder.path;
                    var d = Date.now();
                    logSettings.logName = "tx" + d + ".wtl";
                    this._logger = new Logging.Log(logSettings);
                } catch (e) {
                    Tx.mark("Tx.WexLogger._createLogger: exception: " + e.toString() + ",Info,Tx");
                }
            }
        },

        onSuiteStop: function (/*ev*/) {
            _markStart("createFile");
            var fs = new Microsoft.WindowsLive.Tx.FileSystem();
            var h = fs.createFile(Windows.Storage.ApplicationData.current.localFolder.path + "\\txdone", Tx.GENERIC_WRITE, Tx.FILE_SHARE_READ, Tx.CREATE_ALWAYS);
            fs.writeFile(h, "Tx");
            fs.closeHandle(h);
            _markStop("createFile");
        },

        onPageStart: function (/*ev*/) {
            this._createLogger();
        },

        onPageStop: function (/*ev*/) {
            this._logger = null;
        },

        onStart: function (ev) {
            if (this._logger) {
                this._logger.startGroup(ev.testDesc);
                if (ev.feature) {
                    this._logger.comment("Feature: " + ev.feature);
                }
                if (ev.owner) {
                    this._logger.comment("Owner: " + ev.owner);
                }
            }
        },

        onError: function (ev) {
            if (this._logger) {
                this._logger.error(ev.msg);
            }
        },

        onLog: function (ev) {
            if (this._logger) {
                this._logger.comment(ev.msg);
            }
        },

        onDone: function (ev) {
            if (this._logger) {
                var tr = Windows.WEX.Logging.TestResult;
                this._logger.result(ev.hasErrors ? tr.testResult_Failed : tr.testResult_Passed);
                this._logger.endGroup(ev.testDesc);
            }
        }
    };

})();
