
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var sandbox, provider;
    function setup(tc) {
        sandbox = document.createElement("div");
        sandbox.setAttribute("style", "position:fixed;top:0px;right:0px");
        document.body.appendChild(sandbox);

        provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});

        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;
            provider = null;
        };
    }

    Tx.test("ViewFlyout_UnitTest.testBackgroundLoad", function (tc) {
        setup(tc);
        Jx.scheduler.testClear();

        var switcher = {},
            account = new Mail.Account(provider.createObject("Account"), provider.getClient());

        Mail.ViewFlyout.addTestContentFactory("test", function (s, a, jobset) {
            tc.areEqual(switcher, s);
            tc.areEqual(account, a);
            tc.isFalse(jobset.visible);

            var content = new Jx.Component();
            content.initComponent();
            content.getUI = function (ui) {
                tc.areEqual(++state, 6);
                ui.html = "<div id='flyoutTestContent'>Hello world</div>";
                tc.isFalse(jobset.visible);
                Jx.scheduler.yield(); // No effect, getUI/activateUI are paired
            };
            content.activateUI = function () {
                tc.areEqual(++state, 7);
                tc.ok(sandbox.querySelector("#flyoutTestContent"));
                tc.isFalse(jobset.visible);
            };
            content.beforeShow = function () {
                tc.areEqual(++state, 11);
                tc.isTrue(jobset.visible);
            };
            content.afterHide = function () {
                tc.areEqual(++state, 15);
                tc.isFalse(jobset.visible);
            };
            content.deactivateUI = function () {
                tc.areEqual(++state, 17);
            };
            return content;
        });
        var state = 0;

        var component;
        var flyout = new Mail.ViewFlyout(switcher, account, "test", function (c) {
            component = c;
            tc.areEqual(++state, 2);

            sandbox.innerHTML = Jx.getUI(component).html;
            tc.areEqual(++state, 3);

            component.activateUI();
            tc.areEqual(++state, 4);

            Jx.scheduler.yield();
            return {
                show: function () {
                    tc.areEqual(++state, 9);
                },
                hide: function () {
                    tc.areEqual(++state, 13);
                }
            };
        });

        tc.areEqual(++state, 1);
        Jx.scheduler.testFlush();

        tc.areEqual(++state, 5);
        Jx.scheduler.testFlush();

        tc.areEqual(++state, 8);
        flyout.show();

        tc.areEqual(++state, 10);
        component.beforeShow();

        tc.areEqual(++state, 12);
        flyout.hide();

        tc.areEqual(++state, 14);
        component.afterHide();

        tc.areEqual(++state, 16);
        component.deactivateUI();

        tc.areEqual(++state, 18);
        flyout.dispose();
        Jx.scheduler.testFlush();
    });

    Tx.test("ViewFlyout_UnitTest.testForegroundLoad", function (tc) {
        setup(tc);

        Mail.ViewFlyout.addTestContentFactory("test", function () {
            var content = new Jx.Component();
            content.initComponent();
            content.getUI = function (ui) {
                tc.areEqual(++state, 5);
                ui.html = "<div id='flyoutTestContent'>Hello world</div>";
            };
            content.activateUI = function () { tc.areEqual(++state, 6); };
            return content;
        });
        var state = 0;

        var flyout = new Mail.ViewFlyout({}, new Mail.Account(provider.createObject("Account"), provider.getClient()), "test", function (component) {
            tc.areEqual(++state, 2);

            sandbox.innerHTML = Jx.getUI(component).html;
            tc.areEqual(++state, 3);

            component.activateUI();
            tc.areEqual(++state, 4);

            return {
                show: function () {
                    tc.areEqual(++state, 7);
                }
            };
        });

        tc.areEqual(++state, 1);
        flyout.show();
        tc.areEqual(++state, 8);

        flyout.dispose();
        Jx.scheduler.testFlush();
    });

})();
