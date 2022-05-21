
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,Jx,PeekBar*/
/*jshint browser:true*/

(function () {
    var host;
    var count;
    function setUp() {
        // Just make sure the host is pointing to the right div
        host = document.getElementById("peekBarDiv");
        count = 0;
    }

    function cleanUp() {
        host.innerHTML = "";
    }

    Tx.test("PeekBar.init", { owner: "jamima", priority: 0 }, function (tc) {
        tc.cleanUp = cleanUp;
        setUp();
        var control = new Jx.PeekBar("top");

        control.initUI(host);
        tc.areEqual(host.childNodes.length, 1, "child count is wrong");

        Jx.dispose(control);
        host.innerHTML = "";
    });

})();