
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,Tx,CollectGarbage*/

Tx.Test = function (test) {
    Tx.chkNew(this, Tx.Test);
    Tx.chkEq(arguments.length, 1);
    Tx.chkObj(test);
    Tx.chkStrNE(test.desc);
    Tx.chkFn(test.callback);

    // TODO: add a disabled test property

    // TODO: rename test to testInfo and store it
    this.desc = test.desc;
    this.options = test.options;
    this.fn = test.fn;
    this.async = test.async;
    this.useTryCatch = test.useTryCatch;
    this.debuggerOnError = test.debuggerOnError;
    this.timeoutMs = test.timeoutMs;
    this.hostCallback = test.callback;
    this.garbageCollect = test.garbageCollect;

    this.hasErrors = false;
    this.startTime = 0;
    this.duration = 0;

    this._onAsyncTimeout = this._onAsyncTimeout.bind(this);
    this._asyncTimeoutId = 0;

    this._context = new Tx.TestContext(this, this._contextCallback.bind(this)); // TODO: create two contexts: sync / async
    this._semaphore = 0;

    this._status = "not-started"; // "not-started", "running-sync", "running-async", "done"
};

Tx.Test.prototype = {
    dispose: function () {
        Tx.chkEq(this._asyncTimeoutId, 0);

        this.hostCallback = null;
        this.fn = null;

        Tx.dispose(this, "_context");
    },
    
    start: function () {
        Tx.chkEq(arguments.length, 0);
        Tx.chkEq(this._status, "not-started");

        this._status = "running-sync";
        this.hostCallback("start", this);

        // TODO: split this function into two: sync/async

        // Async tests can time out
        if (this.async) {
            this._asyncTimeoutId = self.setTimeout(this._onAsyncTimeout, this.timeoutMs);
        }

        this._garbageCollect();

        this.startTime = Date.now();

        if (this.useTryCatch) {
            try {
                this.fn(this._context);
                if (this.async) {
                    this._status = "running-async";
                } else {
                    this._done();
                }
            } catch (ex) {
                this._error("Exception: " + ex.stack);
                this._done();
            }
        } else {
            this.fn(this._context);
            if (this.async) {
                this._status = "running-async";
            } else {
                this._done();
            }
        }
    },

    hasPendingCallbacks: function () {
        return this._semaphore > 0;
    },

    _stop: function (count) {
        Tx.chkEq(arguments.length, 1);
        Tx.chkNumGt(count, 0);
        Tx.chkNumGte(this._semaphore, 0);
        Tx.chkTrue(this.async);

        this._semaphore += count;
    },

    _start: function (count) {
        Tx.chkEq(arguments.length, 1);
        Tx.chkNumGt(count, 0);
        Tx.chkTrue(this.async);

        this._semaphore -= count;
        Tx.chkNumGte(this._semaphore, 0);

        if (this._semaphore === 0) {
            this._done();
        }
    },

    _cleanup: function () {
        Tx.chkEq(arguments.length, 0);
        Tx.chkTrue(this._isRunning());

        if (this.useTryCatch) {
            try {
                this._context.runAllCleanup();
            } catch (ex) {
                this._error("Exception in cleanup: " + ex.stack);
            }
        } else {
            this._context.runAllCleanup();
        }
    },

    _done: function () {
        Tx.chkEq(arguments.length, 0);
        Tx.chkTrue(this._isRunning());

        this._cleanup();
        this.duration = Date.now() - this.startTime;

        this._garbageCollect();
        this._clearAsyncTimeout();
        this._status = "done";
        this.hostCallback("done", this);
    },

    _error: function (msg) {
        Tx.chkEq(arguments.length, 1);
        Tx.chkStr(msg);
        Tx.chkTrue(this._isRunning());

        this.hasErrors = true;

        if (this.debuggerOnError) {
            /*jshint debug:true*/
            debugger;
        }

        this.hostCallback("error", this, msg);
    },

    _log: function (msg) {
        Tx.chkEq(arguments.length, 1);
        Tx.chkStr(msg);
        Tx.chkTrue(this._isRunning());

        this.hostCallback("log", this, msg);
    },

    _contextCallback: function (type, data) {
        Tx.chkEq(arguments.length, 2);

        // handle events only if the test is running
        if (this._isRunning()) {
            switch (type) {
                case "start": this._start(data); break;
                case "stop": this._stop(data); break;
                case "log": this._log(data); break;
                case "error": this._error(data); break;
                default: Tx.assert(false);
            }
        }
    },

    _isRunning: function () {
        return this._status === "running-sync" || this._status === "running-async";
    },

    _clearAsyncTimeout: function () {
        if (this._asyncTimeoutId !== 0) {
            self.clearTimeout(this._asyncTimeoutId);
            this._asyncTimeoutId = 0;
        }
    },

    // TODO: inline it
    _onAsyncTimeout: function () {
        Tx.chkTrue(this.async);
        Tx.chkTrue(this._isRunning());

        this._error("Async timeout");
        this._done();
    },

    _garbageCollect: function () {
        if (this.garbageCollect) {
            /*jshint newcap:false*/
            // called twice per JScript team recommendation
            Tx.mark("CollectGarbage1");
            CollectGarbage();
            Tx.mark("CollectGarbage2");
            CollectGarbage();
            Tx.mark("CollectGarbage3");
        }
    },
};
