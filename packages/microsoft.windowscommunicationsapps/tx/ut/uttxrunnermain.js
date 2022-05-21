
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.RunnerMain UTs

/*global setImmediate,Tx*/

// TODO: add an option to disable the wexlogger
Tx.noop("Tx.RunnerMain: ctor/dispose", function (tc) {
    var r = new Tx.RunnerMain();
    tc.ok("addEventListener" in r);
    tc.ok("removeEventListener" in r);
    tc.ok("dispatchEvent" in r);
    r.dispose();
});

Tx.asyncTest("Tx.RunnerMain: async 1", function (tc) {
    tc.stop();
    setImmediate(function () {
        tc.start();
    });
});

Tx.test("Tx.RunnerMain: after async 1", function (tc) {
    tc.ok(true);
});

Tx.test("Tx.RunnerMain: after async timeout", function (tc) {
    tc.ok(true);
});

Tx.asyncTest("Tx.RunnerMain: async 1 nested", function (tc) {
    tc.stop();
    setImmediate(function () {
        setImmediate(function () {
            tc.start();
        });
    });
});

Tx.asyncTest("Tx.RunnerMain: async 2", function (tc) {
    tc.stop(2);
    setImmediate(function () {
        tc.start();
    });
    setImmediate(function () {
        tc.start();
    });
});

// TODO: add async timeout test

// TODO: add more tests
