
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Tx.PageList UTs

/*global Tx*/

Tx.test("Tx.PageList: new/dispose", function () {
    var model = new Tx.Model({});
    var pageList = new Tx.PageList(model);
    pageList.dispose();
    model.dispose();
});

// TODO: add more tests
