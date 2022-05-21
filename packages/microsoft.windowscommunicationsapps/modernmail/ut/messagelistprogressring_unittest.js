
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//
/*jshint browser:true*/
/*global Mail,Jx,Tx,WinJS*/

(function () {
    var U = Mail.UnitTest,
        progressRing = null,
        sandbox = null;

    var MockWinJSUI = function () {
        this._enabled = true;
    };

    MockWinJSUI.prototype.enableAnimations = function () {
        this._enabled = true;
    };

    MockWinJSUI.prototype.disableAnimations = function () {
        this._enabled = false;
    };

    MockWinJSUI.prototype.isAnimationEnabled = function () {
        return this._enabled;
    };

    function setup(tc) {
        var oldWinJS = window.WinJS;
        window.WinJS = { UI: new MockWinJSUI() };

        sandbox = document.createElement("progress");
        progressRing = new Mail.MessageListProgressRing(sandbox);

        tc.addCleanup(function () {
            Jx.dispose(progressRing);
            progressRing = null;
            sandbox = null;
            window.WinJS = oldWinJS;
        });
    }

    var verifyProgressRingVisibility = function (tc, isVisible) {
        tc.isTrue(Jx.isHTMLElement(sandbox));
        var isInvisible = sandbox.classList.contains("hidden");
        tc.isTrue(isInvisible !== isVisible);
    };

    Tx.test("MessageListProgressRing.foldersWithSyncFailure", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc);
        // Assert the progressRing is off
        // Assert the animation is on
        verifyProgressRingVisibility(tc, false);
        tc.isTrue(WinJS.UI.isAnimationEnabled());
    });


    Tx.test("MessageListProgressRing.animationDisabledInitially", {owner: "kepoon", priority: 0}, function (tc) {
        setup(tc);
        WinJS.UI.disableAnimations();

        // Assert the progressRing is off
        // Assert the animation is still off
        verifyProgressRingVisibility(tc, false);
        tc.isFalse(WinJS.UI.isAnimationEnabled());
    });

    Tx.test("MessageListProgressRing.initialFolderSync", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc);
        verifyProgressRingVisibility(tc, false);

        // Assert the progressRing is off
        progressRing.adjustVisibilityForSyncStatus(true);

        // Assert the progressRing is on
        // Assert that animations is on
        verifyProgressRingVisibility(tc, true);
        tc.isTrue(WinJS.UI.isAnimationEnabled());

        // Folder sync is done
        U.ensureSynchronous(function () {
            progressRing.adjustVisibilityForSyncStatus(false);
        });

        // Assert that animations is still enabled
        tc.isTrue(WinJS.UI.isAnimationEnabled());
        // Assert the progressRing is off
        verifyProgressRingVisibility(tc, false);
    });

})();
