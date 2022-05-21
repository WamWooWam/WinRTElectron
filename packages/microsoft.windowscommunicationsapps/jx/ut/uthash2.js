
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Hash2 UTs

/// <reference path="../core/Hash2.js" />

/*global Debug,Jx,document,Tx*/

(function () {

    // Verify that an assert fires when calling fn(). Do nothing in non-debug builds.
    function verifyAssert(tc, fn) {
        var lastError;
        if (Debug.hasOwnProperty("assert")) {
            try {
                Debug.throwOnAssert = true;
                fn();
            }
            catch (e) {
                Debug.throwOnAssert = false;
                lastError = e;
            }
            tc.isTrue(lastError instanceof Debug.AssertError);
        }
    }

    Tx.test("Hash2Tests.testSet", function (tc) {
        var h = new Jx.Hash2();

        tc.isFalse(h.has("a"));
        tc.isFalse(h.has("a", "x"));
        tc.isTrue(h.get("a", "x") === undefined);

        h.set("a", "x", 1);
        tc.isTrue(h.has("a"));
        tc.isTrue(h.has("a", "x"));
        tc.isTrue(h.get("a", "x") === 1);     
    });
    
    Tx.test("Hash2Tests.testSetAll", function (tc) {
        var h = new Jx.Hash2();

        var obj = { foo: "FOO", bar: "BAR" };

        h.setAll("a", obj);
        tc.isTrue(h.get("a", "foo") === "FOO");
        tc.isTrue(h.get("a", "bar") === "BAR");
    });

    Tx.test("Hash2Tests.testGet", function (tc) {
        var h = new Jx.Hash2();

        tc.isTrue(h.get("a", "x") === undefined);

        h.set("a", "x", 2);
        tc.isTrue(h.get("a", "x") === 2);

    });

    Tx.test("Hash2Tests.testHas", function (tc) {
        var h = new Jx.Hash2();

        tc.isFalse(h.has("a"));
        tc.isFalse(h.has("a", "x"));

        h.set("a", "x", 1);
        tc.isTrue(h.has("a"));
        tc.isTrue(h.has("a", "x"));
    });

    Tx.test("Hash2Tests.testRemove", function (tc) {
        var h = new Jx.Hash2();

        h.set("a", "x", 1);
        h.set("a", "y", 2);
        tc.isTrue(h.get("a", "x") === 1);
        tc.isTrue(h.get("a", "y") === 2);

        h.remove("a", "y");
        tc.isTrue(h.get("a", "x") === 1);
        tc.isTrue(h.get("a", "y") === undefined);
    });

    Tx.test("Hash2Tests.testRemoveAll", function (tc) {
        var h = new Jx.Hash2();

        h.set("a", "x", 1);
        h.set("a", "y", 2);
        tc.isTrue(h.get("a", "x") === 1);
        tc.isTrue(h.get("a", "y") === 2);

        h.removeAll("a");
        tc.isTrue(h.get("a", "x") === undefined);
        tc.isTrue(h.get("a", "y") === undefined);
    });

    Tx.test("Hash2Tests.testReset", function (tc) {
        var h = new Jx.Hash2();

        h.set("a", "x", 1);
        tc.isTrue(h.get("a", "x") === 1);

        h.reset();
        tc.isTrue(h.get("a", "x") === undefined);
    });

    Tx.test("Hash2Tests.testForEachKey1", function (tc) {
        var h = new Jx.Hash2();

        h.set("a", "value", 1);
        h.set("a", "extra", 11);

        h.set("b", "value", 2);
        h.set("b", "extra", 22);

        var s = "";

        h.forEachKey1(function (key1) {
            s += key1 + h.get(key1, "value");
        });

        tc.isTrue(s === "a1b2");
    });

    Tx.test("Hash2Tests.testSetInvalidArgs", function (tc) {
        var h = new Jx.Hash2();
        var obj = { foo: "FOO", bar: "BAR" };
        
        // Valid: NonEmptyString, NonEmptyString, value

        // Empty strings
        verifyAssert(tc, function () {
            h.set("", "", 1);
        });
        
        // NonEmptyString and empty string
        verifyAssert(tc, function () {
            h.set("x", "", 1);
        });    
        
        // Number
        verifyAssert(tc, function () {
            h.set(1, 2, 1);
        });
        
        // NonEmptyString and number
        verifyAssert(tc, function () {
            h.set("x", 2, 1);
        });
        
        // Object
        verifyAssert(tc, function () {
            h.set(obj, "y", 1);
        });

        // Undefined
        verifyAssert(tc, function () {
            h.set(undefined, "y", 1);
        });
        
        // Null
        verifyAssert(tc, function () {
            h.set(null, "y", 1);
        });
        
        if (!Jx.isWorker) {
            // HTML Element
            var div = document.createElement("div");
            verifyAssert(tc, function () {
                h.set(div, "y", 1);
            });
        }
        
        // Array
        verifyAssert(tc, function () {
            h.set([1, 2, 3], "y", 1);
        });
    });      
    
    Tx.test("Hash2Tests.testSetAllInvalidArgs", function (tc) {
        var h = new Jx.Hash2();
        var obj = { foo: "FOO", bar: "BAR" };
        
        // Valid: NonEmptyString, Object

        // Empty string, Object
        verifyAssert(tc, function () {
            h.setAll("", obj);
        });
        
        // String, String
        verifyAssert(tc, function () {
            h.setAll("x", "y");
        });    
        
        // Number, Number
        verifyAssert(tc, function () {
            h.setAll(1, 2);
        });
        
        // Number, Object
        verifyAssert(tc, function () {
            h.setAll(2, obj);
        });
        
        // Object, String
        verifyAssert(tc, function () {
            h.setAll(obj, "y");
        });

        // Undefined, Object
        verifyAssert(tc, function () {
            h.setAll(undefined, obj);
        });
        
        // String, Undefined
        verifyAssert(tc, function () {
            h.setAll("x", undefined);
        });
        
        // Null, Object
        verifyAssert(tc, function () {
            h.setAll(null, obj);
        });
        
        // String, Null
        verifyAssert(tc, function () {
            h.setAll("x", null);
        });

        if (!Jx.isWorker) {
            // HTML Element, Object
            var div = document.createElement("div");
            verifyAssert(tc, function () {
                h.setAll(div, obj);
            });
        }
        
        // Array, Object
        verifyAssert(tc, function () {
            h.setAll([1, 2, 3], obj);
        });
    });

})();
