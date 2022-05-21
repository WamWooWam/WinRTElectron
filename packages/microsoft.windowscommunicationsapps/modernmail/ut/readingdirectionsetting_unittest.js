
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Tx,$,Jx*/

(function () {
    var sandbox,
        settings,
        selector;

    function setup(tc, enabled) {
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");

        Mail.UnitTest.initGlobals();
        Mail.Globals.appSettings = new Mail.AppSettings();

        // Make sure the setting is enabled/disabled
        Mail.Utilities.haveRtlLanguage = function () { return enabled; };

        sandbox = document.createElement("div");

        settings = new Mail.ReadingDirectionSetting(sandbox);

        sandbox.innerHTML = settings.getHTML();

        settings.populateControls();
        settings.update();

        selector = sandbox.querySelector("#mailReadingDirectionSelect");

        document.body.appendChild(sandbox);

        tc.addCleanup(function () {
            Mail.UnitTest.restoreJx();
            Mail.Globals.appSettings.dispose();
            Mail.Globals.appSettings = null;
            Mail.UnitTest.disposeGlobals();
            settings.dispose();
            document.body.removeChild(sandbox);
            sandbox = null;
            settings = null;
        });
    }

    function verifyValue(tc) {
        tc.areEqual(selector.value, Mail.Globals.appSettings.readingDirection);
    }

    Tx.test("ReadingDirectionSetting.End_To_End", { owner: "andrha" }, function (tc) {
        setup(tc, true /*enabled*/);

        var optionsCount = selector.childNodes.length,
            $selector = $(selector);
        for (var i = 0; i < 12; i++) {
            $selector.val(selector[i%optionsCount].value).change();
            verifyValue(tc);
        }
    });

    Tx.test("ReadingDirectionSetting.Disabled", { owner: "andrha" }, function (tc) {
        setup(tc, false /*enabled*/);

        // Assert that the selector is empty because the HTML isn't loaded in
        tc.isFalse(Jx.isObject(selector));
    });
})();