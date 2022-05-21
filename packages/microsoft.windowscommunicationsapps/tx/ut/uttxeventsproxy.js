
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.EventsProxy UTs

/*global Tx*/

Tx.test("Tx.EventsProxy: ctor", function () {
    var wp = new Tx.EventsProxy({ addEventListener: Tx.fnEmpty, removeEventListener: Tx.fnEmpty });
    wp.dispose();
});

// TODO: add more tests

