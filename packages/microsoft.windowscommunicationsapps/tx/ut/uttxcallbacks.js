
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.Callbacks UTs

/*global Tx*/

Tx.test("Tx.Callbacks: new/dispose", function (/*tc*/) {
    var c = new Tx.Callbacks();
    c.dispose();
});

Tx.test("Tx.Callbacks: 1 event", function (tc) {
    var aelCalled = 0;
    var relCalled = 0;

    var target = {
        addEventListener: function () { aelCalled++; },
        removeEventListener: function () { relCalled++; }
    };

    var c = new Tx.Callbacks();
    c.ael(target, "event1", function () {});
    c.dispose();

    tc.areEqual(aelCalled, 1, "aelCalled === 1");
    tc.areEqual(relCalled, 1, "relCalled === 1");
});

// TODO: add more tests
// TODO: test rel()
