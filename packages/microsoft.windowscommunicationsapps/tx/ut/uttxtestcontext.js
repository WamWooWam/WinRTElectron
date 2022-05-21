
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.TestContext UTs

/*global Tx*/

Tx.test("Tx.TestContext: ctor", function () {
    new Tx.TestContext({}, function () {});
});

Tx.test("Tx.TestContext: cleanup", function (tc) {
    tc.cleanup = function () {
        // cleanup here
    };
});

Tx.test("Tx.TestContext: expect exception", function (tc) {
    tc.expectException(function () {
        throw "foo";
    }, "foo");

    tc.expectException(function () {
        throw new Error("bar");
    }, "bar");
});

Tx.test("Tx.TestContext: ok", function (tc) {
    var expected = [];
    var actual = [];

    function callback(type, data) {
        tc.areEqual(type, "error");
        actual.push(data.split("\n")[0]);
    }

    var ctx = new Tx.TestContext({}, callback);

    ctx.ok(true, "a");

    ctx.ok(false, "b");
    expected.push("ok: 'false' b");

    tc.arraysEqual(actual, expected);

    ctx.dispose();
});

// TODO: add more tests

