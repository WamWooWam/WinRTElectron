
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.Mark UTs

/*global Tx*/

Tx.test("Tx.Mark: ctor/dispose", function () {
    var m = new Tx.Mark({ addEventListener: Tx.fnEmpty, removeEventListener: Tx.fnEmpty });
    m.dispose();
});

// TODO: add more tests

