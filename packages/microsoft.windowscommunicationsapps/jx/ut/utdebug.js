
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Debug UTs

/// <reference path="../core/Debug.js" />

/*global self,Debug,Jx,Tx*/


Tx.test("DebugTests.testDebug", function (tc) {
    tc.ok(self.hasOwnProperty("Debug"));
    tc.ok(Debug.hasOwnProperty("AssertError"));
    tc.ok(Debug.hasOwnProperty("throwOnAssert"));

    // Ensure that throwOnAssert is false by default
    tc.ok(!Debug.throwOnAssert);
});

Tx.test("DebugTests.testAssertError", function (tc) {
    var e = new Debug.AssertError();
    tc.ok(e instanceof Debug.AssertError);
    tc.ok(e.message === "");
    tc.ok(e.toString() === "AssertError");

    e = new Debug.AssertError("test");
    tc.ok(e instanceof Debug.AssertError);
    tc.ok(e.message === "test");
    tc.ok(e.toString() === "AssertError: test");
});

Tx.test("DebugTests.testThrowOnAssert", function (tc) {
    // Verify throwOnAssert without message
    try {
        Debug.throwOnAssert = true;
        Debug.assert(false);
    } catch (e) {
        Debug.throwOnAssert = false; // restore it
        tc.ok(e instanceof Debug.AssertError);
        tc.ok(e.message === "");
    }
});

Tx.test("DebugTests.testThrowOnAssertWithMessage", function (tc) {
    // Verify throwOnAssert with message
    try {
        Debug.throwOnAssert = true;
        Debug.assert(false, "foo");
    } catch (e) {
        Debug.throwOnAssert = false; // restore it
        tc.ok(e instanceof Debug.AssertError);
        tc.ok(e.message === "foo");
    }
});

Tx.test("DebugTests.testSetObjectName", function (tc) {
    var obj = {};
    tc.ok(Debug.getObjectName(obj) === "");

    obj = {};
    Debug.setObjectName(obj, undefined);
    tc.ok(Debug.getObjectName(obj) === "");

    obj = {};
    Debug.setObjectName(obj, null);
    tc.ok(Debug.getObjectName(obj) === "");

    obj = {};
    Debug.setObjectName(obj, "");
    tc.ok(Debug.getObjectName(obj) === "");

    obj = {};
    Debug.setObjectName(obj, "foo");
    tc.ok(Debug.getObjectName(obj) === "foo");

    function A() {
        Debug.setObjectName(this, "A");
    }

    var a = new A();
    tc.ok(Debug.getObjectName(a) === "A");
        
    function B() {
    }

    Debug.setObjectName(B.prototype, "B");
    tc.ok(Debug.getObjectName(B.prototype) === "B");

    var b = new B();
    tc.ok(Debug.getObjectName(b) === "B");
});

Tx.test("DebugTests.testIsBoundFunction", function (tc) {
    // Different types of unbound functions
    tc.isFalse(Debug.isFunctionBound(function () {}));
    tc.isFalse(Debug.isFunctionBound(Debug.isFunctionBound));
    tc.isFalse(Debug.isFunctionBound(String));
    tc.isFalse(Debug.isFunctionBound(Array.prototype.forEach));
    tc.isFalse(Debug.isFunctionBound([].indexOf));
    tc.isFalse(Debug.isFunctionBound(Math.max));

    // Different types of bound functions
    tc.isTrue(Debug.isFunctionBound((function () {}).bind()));
    tc.isTrue(Debug.isFunctionBound((function () {}).bind({})));
    tc.isTrue(Debug.isFunctionBound((function () {}).bind(self)));
    tc.isTrue(Debug.isFunctionBound(Array.prototype.forEach.bind([])));
    tc.isTrue(Debug.isFunctionBound(Array.isArray.bind(null, "notAnArray")));
    tc.isTrue(Debug.isFunctionBound(Math.max.bind(null, 1, 2)));
});


