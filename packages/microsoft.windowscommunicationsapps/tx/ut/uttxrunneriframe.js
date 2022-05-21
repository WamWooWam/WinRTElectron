
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.RunnerIFrame UTs

/*global self,setImmediate,Tx*/

Tx.test("Tx.RunnerIFrame: ctor/dispose", function (tc) {
    var r = new Tx.RunnerIFrame();
    tc.ok("addEventListener" in r);
    tc.ok("removeEventListener" in r);
    tc.ok("dispatchEvent" in r);
    r.dispose();
});

Tx.test("Tx.RunnerIFrame: throw", function () {
    throw "this should fail";
});

// TODO: add more event tests

Tx.asyncTest("Tx.RunnerIFrame: async no stop()", function () {
});

Tx.asyncTest("Tx.RunnerIFrame: async 1", function (tc) {
    tc.stop();
    setImmediate(function () {
        tc.start();
    });
});

Tx.test("Tx.RunnerIFrame: after async 1", function (tc) {
    tc.ok(true);
});

Tx.asyncTest("Tx.RunnerIFrame: async timeout", function (tc) {
    tc.stop();

    // set a timer for 1000ms after the current async timeout
    self.setTimeout(function () {
        tc.start();
    }, tc.test.timeoutMs + 1000);
});

Tx.test("Tx.RunnerIFrame: after async timeout", function (tc) {
    tc.ok(true);
});

Tx.asyncTest("Tx.RunnerIFrame: async 1 nested", function (tc) {
    tc.stop();
    setImmediate(function () {
        setImmediate(function () {
            tc.start();
        });
    });
});

Tx.asyncTest("Tx.RunnerIFrame: async 2", function (tc) {
    tc.stop(2);
    setImmediate(function () {
        tc.start();
    });
    setImmediate(function () {
        tc.start();
    });
});

// TODO: add async timeout test
// TODO: async test - use a setTimeout with the interval greater than the default timeout. 

// TODO: add more tests
