
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,Debug,Jx,importScripts,WinJS,Windows*/

// TODO: rename this file to utJxCore.js

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

    function keysLen(v) {
        return Object.keys(v).length;
    }

    Tx.test("JxTests.testMix1", function (tc) {
        var dest = { d1: 1, d2: 2 };
        var src = { s1: 11, s2: 12 };

        Jx.mix(dest, src);

        tc.isTrue(dest.s1 === 11);
        tc.isTrue(dest.s2 === 12);
    });

    Tx.test("JxTests.testAugment1", function (tc) {
        var Dest = function () {};
        var src = { s1: "s1", s2: true };

        Jx.augment(Dest, src);

        var dest = new Dest();

        tc.isTrue(dest.s1 === "s1");
        tc.isTrue(dest.s2);
    });

    Tx.test("JxTests.testAugment2", function (tc) {
        var Dest = function () {};
        var Src = function () {};
        var src = new Src();

        src.x = 55;
        src.y = 66;

        Jx.augment(Dest, src);

        var dest = new Dest();
        tc.isTrue(dest.x === 55);
        tc.isTrue(dest.y === 66);
    });

    Tx.test("JxTests.testAugment3", function (tc) {

        verifyAssert(tc, function () {
            var Dest1 = {};
            var Src = function () {};
            var src = new Src();

            src.x = 55;
            src.y = 66;

            Jx.augment(Dest1, src);
        });
    });

    Tx.test("JxTests.testInheritCtor", function (tc) {
        var obj;

        function Obj() {}

        function Base() {}
        Base.prototype.x = 55;

        Jx.inherit(Obj, Base);

        obj = new Obj();

        // Verify that x is on the prototype
        tc.areEqual(obj.x, 55);
        tc.isFalse(obj.hasOwnProperty("x"));

        // Verify instanceof
        tc.isTrue(obj instanceof Obj);
        tc.isTrue(obj instanceof Base);
        tc.isTrue(obj instanceof Object);
    });

    Tx.test("JxTests.testInheritObj", function (tc) {
        var obj, base;

        function Obj() {}

        base = {x: 55};

        Jx.inherit(Obj, base);

        obj = new Obj();

        // Verify that x is on the prototype
        tc.areEqual(obj.x, 55);
        tc.isFalse(obj.hasOwnProperty("x"));

        // Verify instanceof
        tc.isTrue(obj instanceof Obj);
        tc.isTrue(obj instanceof Object);
    });

    Tx.test("JxTests.testDispose", function (tc) {
        Jx.dispose();
        Jx.dispose(null);
        Jx.dispose({});
        Jx.dispose([]);
        // Jx.dispose(new String());

        var disposeCalled = 0;
        Jx.dispose({
            dispose: function () {
                disposeCalled++;
            }
        });

        // Verify instanceof
        tc.areEqual(disposeCalled, 1);

        // Assert if dispose is not a function
        verifyAssert(tc, function () {
            Jx.dispose({dispose: 1});
        });
    });

    Tx.test("JxTests.testEscapeHtml", function (tc) {
        var unescapedHtml = "<b>'\n\rUnescaped\"\r\n\r\n\r\r\nHtml&</b>",
            escapedHtml   = "&lt;b&gt;&#39;\n\rUnescaped&quot;\r\n\r\n\r\r\nHtml&amp;&lt;/b&gt;",
            singleLine    = "&lt;b&gt;&#39; Unescaped&quot; Html&amp;&lt;/b&gt;";

        tc.areEqual(escapedHtml, Jx.escapeHtml(unescapedHtml));
        tc.areEqual(singleLine, Jx.escapeHtmlToSingleLine(unescapedHtml));
    });

    Tx.test("JxTests.testUid", function (tc) {
        var uid1 = Jx.uid();
        var uid2 = Jx.uid();
        tc.isTrue(uid1 !== uid2);
    });

    Tx.test("JxTests.testFindKey", function (tc) {
        var obj = {};
        tc.areEqual(Jx.findKey(obj, 5), undefined);

        obj = { foo:5, bar: 6};
        tc.areEqual(Jx.findKey(obj, 5), "foo");
        tc.areEqual(Jx.findKey(obj, 6), "bar");
        tc.areEqual(Jx.findKey(obj, 7), undefined);
    });

    Tx.test("JxTests.testGetAppNameFromId", function (tc) {
        /// <summary>
        /// Verifies Jx.getAppNameFromId
        /// </summary>

        if (Jx.isWorker) {
            return; // Doesn't work in web workers TODO: fix it
        }

        tc.areEqual("chat", Jx.getAppNameFromId(Jx.AppId.chat), "Unexpected value for getAppNameFromId for chat");
        tc.areEqual("mail", Jx.getAppNameFromId(Jx.AppId.mail), "Unexpected value for getAppNameFromId for mail");
        tc.areEqual("people", Jx.getAppNameFromId(Jx.AppId.people), "Unexpected value for getAppNameFromId for people");
        tc.areEqual("photo", Jx.getAppNameFromId(Jx.AppId.photo), "Unexpected value for getAppNameFromId for photo");
        tc.areEqual("calendar", Jx.getAppNameFromId(Jx.AppId.calendar), "Unexpected value for getAppNameFromId for calendar");
        tc.areEqual("skydrive", Jx.getAppNameFromId(Jx.AppId.skydrive), "Unexpected value for getAppNameFromId for skydrive");
        tc.areEqual("call", Jx.getAppNameFromId(Jx.AppId.call), "Unexpected value for getAppNameFromId for call");
    });

    Tx.test("JxTests.testPromoteOriginalStack", function (tc) {
        if (Jx.isWorker) {
            return; // Doesn't work in web workers TODO: fix it
        }

        // Verify core rethrow scenario promotes stack properly
        function testFnName() {
            throw new Error("testError");
        }

        var originalDescription,
            originalStack;
        try {
            try {
                testFnName();
            } catch (ex) {
                // Avoid using tc.isTrue here; it throws exceptions on failure which'd be caught
                // below and confuse the logs
                originalDescription = ex.description;
                originalStack = ex.stack;

                Jx.promoteOriginalStack(ex);
                throw ex;
            }
        } catch (ex2) {
            tc.isTrue(ex2.description.indexOf(originalDescription) !== -1, "Original description not maintained: " + ex2.description);
            tc.isTrue(ex2.description.indexOf(originalStack) !== -1, "Stack not promoted to description: " + ex2.description);
        }

        // Verify silent no-op against Error without stack
        var obj = new Error("foobar"),
            jsonBefore = JSON.stringify(obj);
        tc.isTrue(!Jx.isNonEmptyString(obj.stack), "Unthrown Error has stack");
        Jx.promoteOriginalStack(obj);
        tc.isTrue(JSON.stringify(obj) === jsonBefore, "Changed Error without stack");

        // Verify silent no-op against other exception types
        Jx.promoteOriginalStack("foobar");
        Jx.promoteOriginalStack(42);
        obj = { a: "foobar", b: 42 };
        jsonBefore = JSON.stringify(obj);
        Jx.promoteOriginalStack(obj);
        tc.isTrue(JSON.stringify(obj) === jsonBefore, "Changed non-Error object");
    });

    Tx.test("JxTests.testPromiseErrorHandling", function (tc) {
        /// <summary>Tests core functionality of promise error handling override.</summary>

        if (Jx.isWorker) {
            return; // Doesn't work in web workers TODO: fix it
        }

        if (!Jx.isWWA) {
            return; // It only works in WWA
        }

        var oldTerminateApp = Jx.terminateApp,
            terminateAppCalled = false;
        // Override for verification
        Jx.terminateApp = function (error) {
            tc.isTrue(error.description.indexOf("foobar") !== -1, "Description doesn't contain sentinel value");
            terminateAppCalled = true;
        };

        // Load base.js
        if (Jx.isWorker) {
            var basejs = "ms-appx://Microsoft.WinJS.2.0/js/base.js";
            importScripts(basejs);
        }

        // Override promise error handling
        Jx.ensurePromiseErrorHandling();

        // Verify promise errors
        WinJS.Promise.wrap(10).then(function (/*v*/) {
            throw new Error("foobar");
        }).done();
        tc.isTrue(terminateAppCalled, "terminateApp not called for promise error");

        // Reset
        terminateAppCalled = false;

        // Verify errors in the done handler
        WinJS.Promise.wrap(12).done(function (/*v*/) {
            throw new Error("foobar");
        });
        tc.isTrue(terminateAppCalled, "terminateApp not called for error in the done handler");

        // Reset
        terminateAppCalled = false;

        // Verify no fail-fast on canceled promises
        var canceledPromise = new WinJS.Promise(function (/*c*/) { });
        canceledPromise.cancel();
        canceledPromise.done();
        tc.isFalse(terminateAppCalled, "terminateApp called for canceled promise");

        // Restore normal behavior
        Jx.terminateApp = oldTerminateApp;
    });

    Tx.test("JxTests.startTA_stopTA", function (tc) {
        // override msWriteProfileMark
        var oldJxMark = Jx.mark;
        tc.cleanup = function () {
            Jx.mark = oldJxMark;
        };

        var calls = 0;

        Jx.mark = function (s) {
            tc.areEqual(s, "Jx.foo,StartTA,Jx");
            calls++;
        };
        Jx._startTA("foo");

        Jx.mark = function (s) {
            tc.areEqual(s, "Jx.foo,StopTA,Jx");
            calls++;
        };
        Jx._stopTA("foo");

        tc.areEqual(calls, 2); // Ensure both functions are called
    });

    Tx.test("JxTests.DTFormatter", function (tc) {
        var now = new Date();
        var DTF = Jx.DTFormatter;

        DTF._setFormatters({}); // clear cache

        tc.areEqual(Jx.dtf(), Windows.Globalization.DateTimeFormatting.DateTimeFormatter);

        var f1 = new DTF("hour minute");
        tc.areEqual(keysLen(DTF._getFormatters()), 0); // no formatter created

        var s1 = f1.format(now);
        tc.areEqual(keysLen(DTF._getFormatters()), 1); // one formatter created
        var s0 = Windows.Globalization.DateTimeFormatting.DateTimeFormatter("hour minute").format(now);
        tc.areEqual(s0, s1); // same results

        new DTF("hour minute"); // same date time pattern as f1
        tc.areEqual(keysLen(DTF._getFormatters()), 1); // no extra formatters created

        var s2 = f1.format(now);
        tc.areEqual(s1, s2); // format works
        tc.areEqual(keysLen(DTF._getFormatters()), 1); // no extra formatters created

        f1 = new DTF("longDate");
        s1 = f1.format(now);
        tc.areEqual(keysLen(DTF._getFormatters()), 2); // new formatter
        s0 = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.longDate.format(now);
        tc.areEqual(s0, s1); // same results

        f1 = new DTF("shortDate");
        s1 = f1.format(now);
        tc.areEqual(keysLen(DTF._getFormatters()), 3); // new formatter
        s0 = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortDate.format(now);
        tc.areEqual(s0, s1); // same results

        f1 = new DTF("shortTime");
        s1 = f1.format(now);
        tc.areEqual(keysLen(DTF._getFormatters()), 4); // new formatter
        s0 = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortTime.format(now);
        tc.areEqual(s0, s1); // same results

        DTF._setFormatters({}); // clear cache
    });

    // TODO:
    // Verify mix with ES5 properties
    // Add tests for overriding properties
    // Add tests for augment with dest=null and dest={} (object literals)
    // Add tests for augment and mix param checking

})();
