
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.test("Tx.FileLog: ctor/dispose", function () {
    var f = new Tx.FileLog({ addEventListener: Tx.fnEmpty, removeEventListener: Tx.fnEmpty });
    f.dispose();
});

// TODO: add more tests
