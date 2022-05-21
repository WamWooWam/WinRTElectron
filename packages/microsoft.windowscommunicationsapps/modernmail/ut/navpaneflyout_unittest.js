
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var sandbox, mockPeekBar;

    function setup(tc) {
        sandbox = document.createElement("div");
        sandbox.setAttribute("style", "position:fixed;top:0px;right:0px");
        document.body.appendChild(sandbox);

        mockPeekBar = document.createElement("div");
        mockPeekBar.className = "peekbar";
        mockPeekBar.setAttribute("style", "zIndex:100");
        document.body.appendChild(mockPeekBar);

        host = {
            viewState: Jx.ApplicationView.State.full,
            isWide: true
        };

        WinJS.UI.disableAnimations();

        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;
            mockPeekBar.removeNode(true);
            mockPeekBar = null;

            WinJS.UI.enableAnimations();
        };
    }

    function isVisible(element) {
        var rect = element.getBoundingClientRect();
        return rect.width !== 0 && rect.height !== 0 && getComputedStyle(element).visibility === "visible";
    }

    Tx.asyncTest("NavPaneFlyout_UnitTest.testShowHide", function (tc) {
        setup(tc);
        tc.stop();

        var content = new Jx.Component();
        content.initComponent();
        content.getUI = function (ui) {
            tc.areEqual(++state, 1);
            ui.html = "<div id='flyoutTestContent'>Hello world</div>";
        };
        content.activateUI = function () {
            tc.areEqual(++state, 3);
            tc.ok(sandbox.querySelector("#flyoutTestContent"));
            tc.isFalse(isVisible(sandbox.querySelector("#flyoutTestContent")));
        };
        content.beforeShow = function () {
            tc.areEqual(++state, 5);
            tc.isTrue(isVisible(sandbox.querySelector("#flyoutTestContent")));
        };
        content.afterHide = function () {
            tc.areEqual(++state, 7);
            tc.isFalse(isVisible(sandbox.querySelector("#flyoutTestContent")));
        };
        content.deactivateUI = function () {
            tc.areEqual(++state, 9);
        };
        var state = 0;

        var flyout = new Mail.NavPaneFlyout(host, content, "people");

        sandbox.innerHTML = Jx.getUI(flyout).html;
        tc.areEqual(++state, 2);

        flyout.activateUI();
        tc.areEqual(++state, 4);

        flyout.show().then(function (result) {
            return flyout.hide();
        }).done(function () {
            tc.areEqual(++state, 8);

            flyout.dispose();
            tc.areEqual(++state, 10);

            tc.start();
        });
        tc.areEqual(++state, 6);

    });

    Tx.asyncTest("NavPaneFlyout_UnitTest.testMultipleInstances", function (tc) {
        setup(tc);
        tc.stop();

        var activated = 0, shown = 0, hidden = 0;
        var content1 = new Jx.Component(), content2 = new Jx.Component();
        content1.initComponent();
        content2.initComponent();
        content1.getUI = function (ui) { ui.html = "<div id='flyout1'>Hello world</div>"; };
        content2.getUI = function (ui) { ui.html = "<div id='flyout2'>Goodbye, cruel world</div>"; };
        content1.activateUI = content2.activateUI = function () { ++activated; };
        content1.beforeShow = content2.beforeShow = function () { ++shown; };
        content1.afterHide = content2.afterHide = function () { ++hidden; };

        var flyout1 = new Mail.NavPaneFlyout(host, content1, "folders"),
            flyout2 = new Mail.NavPaneFlyout(host, content2, "folders");

        sandbox.innerHTML = Jx.getUI(flyout1).html + Jx.getUI(flyout2).html;
        flyout1.activateUI();
        flyout2.activateUI();
        tc.areEqual(activated, 2);

        tc.ok(sandbox.querySelector("#flyout1"));
        tc.ok(sandbox.querySelector("#flyout2"));

        flyout1.show().then(function () {
            tc.areEqual(shown, 1);
            tc.isTrue(isVisible(sandbox.querySelector("#flyout1")));
            tc.isFalse(isVisible(sandbox.querySelector("#flyout2")));
            return flyout1.hide();
        }).then(function () {
            tc.areEqual(hidden, 1);
            tc.isFalse(isVisible(sandbox.querySelector("#flyout1")));
            tc.isFalse(isVisible(sandbox.querySelector("#flyout2")));
            return flyout2.show();
        }).then(function () {
            tc.areEqual(shown, 2);
            tc.isFalse(isVisible(sandbox.querySelector("#flyout1")));
            tc.isTrue(isVisible(sandbox.querySelector("#flyout2")));
            return flyout2.hide();
        }).done(function () {
            tc.areEqual(hidden, 2);
            tc.isFalse(isVisible(sandbox.querySelector("#flyout1")));
            tc.isFalse(isVisible(sandbox.querySelector("#flyout2")));

            flyout1.dispose();
            flyout2.dispose();
            tc.start();
        });
    });

    Tx.asyncTest("NavPaneFlyout_UnitTest.testDoubleCalls", function (tc) {
        setup(tc);
        tc.stop();

        var shown = 0, hidden = 0;
        var content = new Jx.Component();
        content.initComponent();
        content.getUI = function (ui) { ui.html = "<div id='flyout'>Text</div>"; };
        content.beforeShow = function () { ++shown; };
        content.afterHide = function () { ++hidden; };

        var flyout = new Mail.NavPaneFlyout(host, content, "accounts");

        sandbox.innerHTML = Jx.getUI(flyout).html;
        flyout.activateUI();

        flyout.show().then(function () {
            tc.areEqual(shown, 1);
            tc.isTrue(isVisible(sandbox.querySelector("#flyout")));
            return flyout.show();
        }).then(function () {
            tc.areEqual(shown, 1);
            tc.isTrue(isVisible(sandbox.querySelector("#flyout")));
            return flyout.hide();
        }).then(function () {
            tc.areEqual(hidden, 1);
            tc.isFalse(isVisible(sandbox.querySelector("#flyout")));
            return flyout.hide();
        }).done(function () {
            tc.areEqual(hidden, 1);
            tc.isFalse(isVisible(sandbox.querySelector("#flyout")));

            flyout.dispose();
            tc.start();
        });
    });

})();
