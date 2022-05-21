
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,msWriteProfilerMark*/

Tx.throwOnAssert = true; // Useful for unit tests

Tx.debuggerOnAssert = true;

Tx.AssertError = function (message) {
    this.message = message || ""; // 'message' is an Error property
};

Tx.AssertError.prototype = new Error();

Tx.AssertError.prototype.name = "TxAssertError";

Tx.assert = function (expr, msg) {
    if (!expr) {
        msg = msg || "";
        
        msWriteProfilerMark("Tx Assert failed. " + msg); // TODO: dump the stack

        if (Tx.throwOnAssert) {
            if (Tx.debuggerOnAssert) {
                /*jshint debug:true*/
                debugger;
            }
            throw new Tx.AssertError(msg);
        }
    }
};

// TODO: add chk messages

Tx.chkEq = function (v1, v2) {
    Tx.assert(v1 === v2);
};

Tx.chkNotEq = function (v1, v2) {
    Tx.assert(v1 !== v2);
};

Tx.chkNew = function (v, t) {
    Tx.assert(v instanceof t, "use new");
};

Tx.chkObj = function (v) {
    Tx.assert(v !== undefined && v !== null && typeof v === "object");
};

Tx.chkObjOpt = function (v) {
    Tx.assert(v === undefined || (v !== null && typeof v === "object"));
};

Tx.chkOptNullObj = function (v) {
    Tx.assert(v === undefined || v === null || typeof v === "object");
};

Tx.chkUndef = function (v) {
    Tx.assert(v === undefined);
};

Tx.chkNull = function (v) {
    Tx.assert(v === null);
};

Tx.chkFn = function (v) {
    Tx.assert(typeof v === "function");
};

Tx.chkTrue = function (v) {
    Tx.assert(v === true);
};

Tx.chkFail = function () {
    Tx.assert(false);
};

Tx.chkIf = function (v) {
    Tx.assert(v);
};

Tx.chkBool = function (v) {
    Tx.assert(typeof v === "boolean");
};

Tx.chkNumGt = function (v, n) {
    Tx.assert(typeof v === "number" && isFinite(v) && v > n);
};

Tx.chkNumGte = function (v, n) {
    Tx.assert(typeof v === "number" && isFinite(v) && v >= n);
};

Tx.chkNumGtOpt = function (v, n) {
    Tx.assert(v === undefined || (typeof v === "number" && isFinite(v) && v > n));
};

Tx.chkNumRange = function (v, n1, n2) {
    Tx.assert(typeof v === "number" && isFinite(v) && v >= n1 && v <= n2);
};

Tx.chkStr = function (v) {
    Tx.assert(typeof v === "string");
};

Tx.chkStrNE = function (v) {
    Tx.assert(typeof v === "string" && Boolean(v));
};

Tx.chkStrOpt = function (v) {
    Tx.assert(v === undefined || typeof v === "string");
};

Tx.chkArr = function (v) {
    Tx.assert(Array.isArray(v), "invalid array");
};

Tx.chkElem = function (v) {
    // 1 - element node
    Tx.assert(v.nodeType === 1, "invalid array");
};
