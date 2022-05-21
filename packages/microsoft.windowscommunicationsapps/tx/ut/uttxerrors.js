
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Sample tests with errors

/*global setTimeout,Tx*/

Tx.test("TxErrors: throw", function () {
    throw "this should fail";
});

Tx.test("TxErrors: script error", function (tc) {
    tc.ok([].nonExistingProperty, "this should fail");
});

Tx.asyncTest("TxErrors: async no stop()", function () {
});

Tx.asyncTest("TxErrors: async timeout", function (tc) {
    tc.stop();

    // set a timer for 500ms after the current async timeout
    setTimeout(function () {
        tc.start();
    }, tc.test.timeoutMs + 500);
});

// TODO: handle parse errors

// TODO: add more tests
