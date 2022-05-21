
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.HtmlLog UTs

/*global Tx*/

Tx.test("Tx.HtmlLog: ctor", function () {
    new Tx.HtmlLog({ addEventListener: Tx.fnEmpty, removeEventListener: Tx.fnEmpty });
});

Tx.test("Tx.HtmlLog: log", function (tc) {
    tc.log("HTML logging");
});

// TODO: add more tests
