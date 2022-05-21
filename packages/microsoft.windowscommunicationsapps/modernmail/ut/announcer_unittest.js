
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Tx*/

(function () {

    var testInfo = { owner: "tonypan", priority: 0 };
    var sandbox = null;

    function setup (tc) {
        sandbox = document.createElement("div");

        tc.addCleanup(function () {
            sandbox = null;
        });
    }

    Tx.test("Announcer_UnitTest.test_Default", testInfo, function (tc) {
        setup(tc);

        var announcer = new Mail.Announcer(sandbox);

        tc.isTrue(sandbox.classList.contains("hidden"));
        tc.areEqual(sandbox.getAttribute("role"), "status");
        tc.areEqual(sandbox.getAttribute("aria-live"), "polite");

        announcer.speak("Something happened");

        tc.areEqual(sandbox.title, "Something happened");
        tc.areEqual(sandbox.innerText, "Something happened");
        announcer.dispose();
    });

    Tx.test("Announcer_UnitTest.test_Custom", testInfo, function (tc) {
        setup(tc);

        var announcer = new Mail.Announcer(sandbox, "combobox", "assertive");

        tc.isTrue(sandbox.classList.contains("hidden"));
        tc.areEqual(sandbox.getAttribute("role"), "combobox");
        tc.areEqual(sandbox.getAttribute("aria-live"), "assertive");

        announcer.speak("Status update");

        tc.areEqual(sandbox.title, "Status update");
        tc.areEqual(sandbox.innerText, "Status update");

        announcer.dispose();
    });

})();
