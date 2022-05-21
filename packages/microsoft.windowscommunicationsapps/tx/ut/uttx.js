
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx UTs

/*global Tx*/

Tx.test("Tx: API", function () {
    // TODO:
});

Tx.test("Tx: API 2", { pri: 1 }, function () {
    // TODO:
});

Tx.test("Tx: WWA only", function () {
    // TODO:
});

Tx.test("Tx.dispose: args", function (tc) {

    // noop calls
    Tx.dispose();
    Tx.dispose(null);
    Tx.dispose(null, "foo");
    Tx.dispose(null, "foo", "bar");
    Tx.dispose({});

    // should assert on invalid args
    tc.expectTxAssert(function () {
        Tx.dispose(888);
    });

    // should assert on invalid dispose
    tc.expectTxAssert(function () {
        Tx.dispose({ dispose: 1 });
    });

    // should assert on non existing properties
    tc.expectTxAssert(function () {
        Tx.dispose({}, "nonExistingProp");
    });
});

Tx.test("Tx.dispose: 1 call", function (tc) {
    var disposeCalls = 0;

    var obj = {
        dispose: function () {
            disposeCalls++;
        }
    };

    Tx.dispose(obj);

    // dispose should be called
    tc.areEqual(disposeCalls, 1);
});

Tx.test("Tx.dispose: dispose and set 1 prop to null", function (tc) {
    var disposeCalls = 0;

    var obj = {
        dispose: function () {
            disposeCalls++;
        }
    };

    var obj2 = {
        prop: obj
    };

    Tx.dispose(obj2, "prop");

    // obj.dispose should be called
    tc.areEqual(disposeCalls, 1);

    // obj2.prop should be null
    tc.areEqual(obj2.prop, null);
});

Tx.test("Tx.dispose: dispose and set 2 props to null", function (tc) {
    var disposeCalls = 0;

    var obj = {
        dispose: function () {
            disposeCalls++;
        }
    };

    var obj2 = {
        prop1: obj,
        prop2: obj
    };

    Tx.dispose(obj2, "prop1", "prop2");

    // obj.dispose should be called two times
    tc.areEqual(disposeCalls, 2);

    // obj2.prop1 and obj2.prop2 should be null
    tc.areEqual(obj2.prop1, null);
    tc.areEqual(obj2.prop2, null);
});

Tx.test("Tx.isRegEx:", function (tc) {
    tc.ok(Tx.isRegExp(/./));
    tc.ok(Tx.isRegExp(new RegExp()));
    tc.ok(!Tx.isRegExp());
    tc.ok(!Tx.isRegExp("/./"));
});

Tx.test("Tx.format:", function (tc) {
    tc.areEqual(Tx.format(), "");
    tc.areEqual(Tx.format(""), "");
    tc.areEqual(Tx.format("1"), "1");
    tc.areEqual(Tx.format("%s"), "%s");
    tc.areEqual(Tx.format("%s", 1), "1");
    tc.areEqual(Tx.format("%s", "a"), "a");
    tc.areEqual(Tx.format("%s", true), "true");
    tc.areEqual(Tx.format("%s", false), "false");
    tc.areEqual(Tx.format("%s%s", 1, 2), "12");
    tc.areEqual(Tx.format("%s %s", 1, 2), "1 2");
});

Tx.test("Tx: log", function (tc) {
    tc.log("context log message");
    Tx.log("global log message");
});

Tx.test("Tx: default timeout", function (tc) {
    if (Tx.config.isLab) {
        tc.areEqual(tc.test.timeoutMs, Tx.config.timeoutMs * 10);
    } else {
        tc.areEqual(tc.test.timeoutMs, Tx.config.timeoutMs);
    }
});

Tx.test("Tx: custom timeout", { timeoutMs: 2 }, function (tc) {
    if (Tx.config.isLab) {
        tc.areNotEqual(tc.test.timeoutMs, Tx.config.timeoutMs * 10);
        tc.areEqual(tc.test.timeoutMs, 2 * 10);
    } else {
        tc.areNotEqual(tc.test.timeoutMs, Tx.config.timeoutMs);
        tc.areEqual(tc.test.timeoutMs, 2);
    }
});

// TODO: add more tests
