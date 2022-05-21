
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

//
// Tx.TestContext
//

Tx.TestContext = function (test, callback) {
    Tx.chkNew(this, Tx.TestContext);
    Tx.chkEq(arguments.length, 2);
    Tx.chkObj(test);
    Tx.chkFn(callback);

    this.test = test;
    this._hostCallback = callback;
    this.cleanup = Tx.fnEmpty;
    this._cleanupFns = [];
};

Tx.TestContext.prototype = {
    dispose: function () {
        this._hostCallback = null;
        this.test = null;
    },

    addCleanup: function (fn) {
        Tx.chkFn(fn);
        this._cleanupFns.push(fn);
    },

    runAllCleanup: function () {
        this._cleanupFns.forEach(function (fn) {
            Tx.chkFn(fn);
            fn(this);
        }, this);
        this._cleanupFns = [];
        this.cleanup(this);
        this.cleanup = Tx.fnEmpty;
    },

    stop: function (count) {
        Tx.chkObj(this.test);
        Tx.chkTrue(this.test.async);
        Tx.chkNumGtOpt(count, 0);

        this._hostCallback("stop", count || 1);
    },

    start: function (count) {
        Tx.chkObj(this.test);
        Tx.chkTrue(this.test.async);
        Tx.chkNumGtOpt(count, 0);

        this._hostCallback("start", count || 1);
    },

    log: function (msg) {
        Tx.chkStr(msg);
        Tx.chkObj(this.test);

        this._hostCallback("log", msg);
    },

    error: function (msg) {
        Tx.chkEq(arguments.length, 1);
        Tx.chkObj(this.test);

        try {
            throw Error(msg || "Test error");
        } catch (ex) {
            this._hostCallback("error", ex.stack.replace(/^Error: /, ""));
        }
    },

    ok: function (value, msg) {
        Tx.chkNumRange(arguments.length, 1, 2);
        Tx.chkStrOpt(msg);

        if (!value) {
            this.error("ok: '" + String(value) + "' " + msg);
        }
    },

    equal: function (value1, value2, msg) {
        Tx.chkNumRange(arguments.length, 2, 3);
        Tx.chkStrOpt(msg);

        if (value1 != value2) {
            this.error("equal: '" + String(value1) + "', '" + String(value2) + "' " + msg);
        }
    },

    areEqual: function (value1, value2, msg) {
        Tx.chkNumRange(arguments.length, 2, 3);
        Tx.chkStrOpt(msg);

        if (value1 !== value2) {
            this.error("areEqual: '" + String(value1) + "', '" + String(value2) + "' " + msg);
        }
    },

    notEqual: function (value1, value2, msg) {
        Tx.chkNumRange(arguments.length, 2, 3);
        Tx.chkStrOpt(msg);

        if (value1 == value2) {
            this.error("notEqual: '" + String(value1) + "', '" + String(value2) + "' " + msg);
        }
    },

    areNotEqual: function (value1, value2, msg) {
        Tx.chkNumRange(arguments.length, 2, 3);
        Tx.chkStrOpt(msg);

        if (value1 === value2) {
            this.error("areNotEqual: '" + String(value1) + "', '" + String(value2) + "' " + msg);
        }
    },

    isTrue: function (value, msg) {
        Tx.chkNumRange(arguments.length, 1, 2);
        Tx.chkStrOpt(msg);

        if (value !== true) {
            this.error("isTrue: '" + String(value) + "' " + msg);
        }
    },

    isFalse: function (value, msg) {
        Tx.chkNumRange(arguments.length, 1, 2);
        Tx.chkStrOpt(msg);

        if (value !== false) {
            this.error("isFalse: '" + String(value) + "' " + msg);
        }
    },

    isNull: function (value, msg) {
        Tx.chkNumRange(arguments.length, 1, 2);
        Tx.chkStrOpt(msg);

        if (value !== null) {
            this.error("isNull: '" + String(value) + "' " + msg);
        }
    },

    isNotNull: function (value, msg) {
        Tx.chkNumRange(arguments.length, 1, 2);
        Tx.chkStrOpt(msg);

        if (value === null) {
            this.error("isNotNull: '" + String(value) + "' " + msg);
        }
    },

    isNotNullOrUndefined: function (value, msg) {
        Tx.chkNumRange(arguments.length, 1, 2);

        if (value === null || Tx.isUndefined(value)) {
            this.error("isNotNullOrUndefined: '" + String(value) + "' " + msg);
        }
    },

    // TODO: remove it
    strictEqual: function (actual, expected, msg) {
        Tx.chkNumRange(arguments.length, 2, 3);
        Tx.chkStrOpt(msg);

        if (actual !== expected) {
            this.error("Expected: " + String(expected) + " Actual: " + String(actual) + " " + msg);
        }
    },

    arraysEqual: function (actual, expected, msg) {
        Tx.chkNumRange(arguments.length, 2, 3);
        Tx.chkArr(actual);
        Tx.chkArr(expected);

        if (actual !== expected) {
            msg = msg || "";
            if (actual.length !== expected.length) {
                this.error("Different array length. Expected: " + expected.length + " Actual: " + actual.length + " " + msg);
            } else {
                for (var i = 0, len = expected.length; i < len; i++) {
                    if (expected[i] !== actual[i]) {
                        this.error("i = " + i + " Expected: " + String(expected[i]) + " Actual: " + String(actual[i]) + " " + msg);
                    }
                }    
            }
        }
    },

    expectException: function (fn, msg) {
        Tx.chkFn(fn);
        Tx.chkStrOpt(msg);
        var ex = null;

        try {
            fn();
        } catch (e) {
            ex = e;
        }

        this.ok(ex !== null, "Expected exception");
        if (msg) {
            if (ex.message) {
                this.strictEqual(ex.message, msg);
            } else {
                this.strictEqual(ex, msg);
            }
        }
    },

    expectTxAssert: function (fn) {
        var lastError;
        var oldThrowOnAssert = Tx.throwOnAssert;
        var oldDebuggerOnAssert = Tx.debuggerOnAssert;

        try {
            Tx.throwOnAssert = true;
            Tx.debuggerOnAssert = false;
            fn();
        } catch (e) {
            lastError = e;
        } finally {
            Tx.throwOnAssert = oldThrowOnAssert;
            Tx.debuggerOnAssert = oldDebuggerOnAssert;
        }

        this.ok(lastError instanceof Tx.AssertError);
    }
};
