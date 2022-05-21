
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/ApplicationView.js" />

/*global Tx, Jx, Debug */

(function () {

    Tx.test("ApplicationViewTests.testgetStateFromWidth", function (tc) {

        var appViewState = Jx.ApplicationView.State,
            appView = Jx.ApplicationView;

        tc.areEqual(appViewState.wide, appView.getStateFromWidth(Number.MAX_VALUE), "Wide upper");
        tc.areEqual(appViewState.wide, appView.getStateFromWidth(1920), "Wide lower");

        tc.areEqual(appViewState.full, appView.getStateFromWidth(1919), "Full upper");
        tc.areEqual(appViewState.full, appView.getStateFromWidth(1366), "Full lower");

        tc.areEqual(appViewState.large, appView.getStateFromWidth(1365), "large upper");
        tc.areEqual(appViewState.large, appView.getStateFromWidth(1025), "large lower");

        tc.areEqual(appViewState.more, appView.getStateFromWidth(1024), "more upper");
        tc.areEqual(appViewState.more, appView.getStateFromWidth(844), "more lower");

        tc.areEqual(appViewState.portrait, appView.getStateFromWidth(843), "portrait upper");
        tc.areEqual(appViewState.portrait, appView.getStateFromWidth(768), "portrait lower");

        tc.areEqual(appViewState.split, appView.getStateFromWidth(767), "split upper");
        tc.areEqual(appViewState.split, appView.getStateFromWidth(672), "split lower");

        tc.areEqual(appViewState.less, appView.getStateFromWidth(671), "less upper");
        tc.areEqual(appViewState.less, appView.getStateFromWidth(502), "less lower");

        tc.areEqual(appViewState.minimum, appView.getStateFromWidth(501), "minimum upper");
        tc.areEqual(appViewState.minimum, appView.getStateFromWidth(321), "minimum lower");

        tc.areEqual(appViewState.snap, appView.getStateFromWidth(320), "snap upper");
        tc.areEqual(appViewState.snap, appView.getStateFromWidth(1), "snap lower");
    });

    // Verify that an assert fires.
    function verifyAssert(tc, fn) {
        if (Debug.hasOwnProperty("assert")) {
            var lastError;
            try {
                Debug.throwOnAssert = true;
                fn();
            }
            catch (e) {
                Debug.throwOnAssert = false;
                lastError = e;
            }
            tc.isTrue(lastError instanceof Debug.AssertError);
        }
    }

    Tx.test("ApplicationViewTests.testAsserts", function (tc) {

        var appView = Jx.ApplicationView;

        verifyAssert(tc, function () { appView.getStateFromWidth(0); });
        verifyAssert(tc, function () { appView.getStateFromWidth(-1); });
        verifyAssert(tc, function () { appView.getStateFromWidth(Number.NaN); });
        verifyAssert(tc, function () { appView.getStateFromWidth(Number.NEGATIVE_INFINITY); });
        verifyAssert(tc, function () { appView.getStateFromWidth(Number.POSITIVE_INFINITY); });
    });

    Tx.test("ApplicationViewTests.testValue", function (tc) {

        var appViewState = Jx.ApplicationView.State,
            appView = Jx.ApplicationView,
            state = appView.getState();

        tc.isTrue(state >= appViewState.wide);
        tc.isTrue(state <= appViewState.snap);
    });

})();
