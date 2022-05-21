
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Jx,Calendar,$*/

(function () {

    function setup() {
    }

    function cleanup() {
    }

    Tx.test("ModernCanvas.Component.test_create", function (tc) {
        var c = new ModernCanvas.Component();
        tc.areEqual(Object.keys(c.getUsageData()).length, 0, "component not created");
    });

})();