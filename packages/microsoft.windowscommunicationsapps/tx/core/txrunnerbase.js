

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global location,Tx*/

// common runner mixin
Tx.RunnerBase = {
    initRunnerBase: function (options) {
        this.initEvents();
        this._options = options; // TODO: use Tx.Config
        this._testStore = new Tx.TestStore();
        this._testList = [];
        this.pageStartTime = 0;
        this.pageStopTime = 0;
        this.testsPassed = [];
        this.testsFailed = [];
        this._reentrant = false;
        this._testCallback = this._testCallback.bind(this);
        this._processTests = this._processTests.bind(this);
    },

    disposeRunnerBase: function () {
        Tx.dispose(this, "_testStore");
        this.options = null;
        this.disposeEvents();
    },

    test: function (desc, options, fn) {
        this._test(false, desc, options, fn);
    },

    asyncTest: function (desc, options, fn) {
        this._test(true, desc, options, fn);
    },

    log: function (msg) {
        this.dispatchEvent({ type: "log", testDesc: "", msg: msg });
    },

    testList: function (tests) {
        // Takes an array of test descriptions and if they exist 
        // in the test store, removes them.
        this._testList = tests;
    },

    _testCallback: function (type, test, msg) {
        // Called by the current test when something interesting happens

        Tx.chkNumRange(arguments.length, 2, 3);
        Tx.chkStrNE(type);
        Tx.chkObj(test);
        Tx.chkStrOpt(msg);
        Tx.chkEq(this._testStore.current(), test);

        // TODO: Rename ev.testDesc as ev.desc
        switch (type) {
            case "start":
                this.dispatchEvent({ type: "start", testDesc: test.desc, feature: test.options.feature, owner: test.options.owner });
                break;

            case "done":
                if (test.hasErrors) {
                    this.testsFailed++;
                } else {
                    this.testsPassed++;
                }

                this.dispatchEvent({ type: "done", testDesc: test.desc, duration: test.duration, hasErrors: test.hasErrors });
                if (test.async) {
                    // move to the next test
                    this._testStore.next();
                    // unwind the stack to avoid running tests in callbacks
                    Tx.setImmediate(this._processTests);
                }
                break;

            case "error":
                this.dispatchEvent({ type: "error", testDesc: test.desc, msg: msg });
                break;

            case "log":
                this.dispatchEvent({ type: "log", testDesc: test.desc, msg: msg });
                break;

            default:
                Tx.assert(false);
        }
    },

    _test: function (async, desc, options, fn) {
        // Register a test

        Tx.chkStrNE(desc);

        // the "options" argument is optional
        if (Tx.isUndefined(fn)) {
            fn = options;
            options = {};
        } else {
            Tx.chkObj(options);
        }

        Tx.chkFn(fn);

        // Lab mode, update timeoutMs
        var timeout = options.timeoutMs || this._options.timeoutMs;
        if (this._options.isLab){
            timeout *=  10;
        }

        // add the test info to the store
        this._testStore.add(new Tx.Test({
            desc: desc,
            options: options,
            fn: fn,
            async: async,
            timeoutMs: timeout,
            garbageCollect: options.garbageCollect || this._options.garbageCollect,
            useTryCatch: this._options.useTryCatch,
            debuggerOnError: this._options.debuggerOnError,
            callback: this._testCallback,
        }));
    },

    _canRunTest: function (test) {

        // if there is no test list then run all tests
        if (this._testList.length === 0) {
            return true;
        }
        
        // find the test in the list
        var testDesc = test.desc.toLowerCase();
        var testList = this._testList;
        for (var i = 0, len = testList.length; i < len; i++) {
            var crtTest = testList[i];
            if (testDesc === crtTest.toLowerCase()) {
                return true; // fuound it, so it can run
            }
        }

        return false; // not found, don't run it
    },

    _done: function () {
        // we're done
        this.pageStopTime = Date.now();

        this.dispatchEvent({
            type: "pageStop",
            src: location.href, // TODO: fix location for iframes and workers
            testsPassed: this.testsPassed,
            testsFailed: this.testsFailed,
            pageStartTime: this.pageStartTime,
            pageStopTime: this.pageStopTime
        });

        this.dispatchEvent({
            type: "nextPage",
            src: location.href // TODO: fix location for iframes and workers
        });
    },

    _processTests: function () {
        Tx.chkIf(!this._reentrant); // reentrant test, use an async test or setImmediate for the reentrant code

        var testStore = this._testStore;
        var yieldBetweenTests = this._options.yieldBetweenTests;
        var test;

        while (true) {

            if (testStore.isEmpty()) {
                this._done();
                return; // stop processing tests
            }

            // get the current test
            test = testStore.current();

            // skip the test if it should not run
            if (!this._canRunTest(test)) {
                testStore.next();
                continue;
            } 
            
            // run the sync part of the test 
            this._reentrant = true;
            test.start();
            this._reentrant = false;

            if (test.async) {
                if (test.hasPendingCallbacks()) {
                    return; // stop processing to wait for pending callbacks
                }
                Tx.log("asyncTest has no pending callbacks");
                return; // nothing to do, tc.start() already scheduled the next test
            }

            testStore.next();

            if (testStore.isEmpty()) {
                this._done();
                return;
            }

            if (yieldBetweenTests) {
                Tx.setImmediate(this._processTests);
                return; // stop processing to yield to the browser
            }
        }
    },
};

Tx.mix(Tx.RunnerBase, Tx.Events);
