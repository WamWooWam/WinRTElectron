
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.Test UTs

/*global Tx*/

Tx.test("Tx.Test: ctor", function () {
    new Tx.Test({
        desc:"111",
        fn: Tx.fnEmpty,
        callback: Tx.fnEmpty
    });
});

// TODO: add more tests

