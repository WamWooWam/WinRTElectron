
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.RunnerWorker UTs

/*global setImmediate,Tx*/

Tx.test("Tx.RunnerWorker: ctor/dispose", function (tc) {
    var r = new Tx.RunnerWorker();
    tc.ok("addEventListener" in r);
    tc.ok("removeEventListener" in r);
    tc.ok("dispatchEvent" in r);
    r.dispose();
});

// TODO: add more event tests

Tx.asyncTest("Tx.RunnerWorker: async 1", function (tc) {
    tc.stop();
    setImmediate(function () {
        tc.start();
    });
});

Tx.test("Tx.RunnerWorker: after async 1", function (tc) {
    tc.ok(true);
});

Tx.test("Tx.RunnerWorker: after async timeout", function (tc) {
    tc.ok(true);
});

Tx.asyncTest("Tx.RunnerWorker: async 1 nested", function (tc) {
    tc.stop();
    setImmediate(function () {
        setImmediate(function () {
            tc.start();
        });
    });
});

Tx.asyncTest("Tx.RunnerWorker: async 2", function (tc) {
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
