
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/* jshint browser:true */
/* globals Debug,Jx,Mail,Microsoft,Mocks,Tx,WinJS */

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    var sandbox, provider, selection, host, animator, commandManager, settings, components;
    function setup(tc) {
        sandbox = document.getElementById("sandbox");

        provider = new D.JsonProvider({
            Account: {
                all: [
                    { objectId: "outlookAccount" },
                    { objectId: "easAccount" }
                ]
            },
            MailView: {
                all: [
                    {
                        accountId: "outlookAccount",
                        type: Plat.MailViewType.inbox
                    }, {
                        accountId: "outlookAccount",
                        type: Plat.MailViewType.newsletter
                    }, {
                        accountId: "easAccount",
                        type: Plat.MailViewType.inbox,
                        objectId: "easInbox"
                    }
                ]
            }
        }, D.MethodHandlers);

        selection = { };
        Jx.mix(selection, Jx.Events);
        Debug.Events.define(selection, "navChanged");

        host = {
            hostComponent: function (component) {
                component.initUI(sandbox);
            }
        };

        animator = {
            setWelcomeMessageElement: function () { }
        };

        settings = {};

        commandManager = {
            disableCommands: function (reason) { tc.areEqual(reason, "welcomeMessage"); this.disabled++; },
            enableCommands: function (reason) { tc.areEqual(reason, "welcomeMessage"); this.disabled--; },
            disabled: 0
        };

        components = [{
            enabled: true,
            setEnabled: function (enabled) { this.enabled = enabled; }
        }, {
            enabled: true,
            setEnabled: function (enabled) { this.enabled = enabled; }
        }];

        WinJS.UI.disableAnimations();
        tc.cleanup = function () {
            WinJS.UI.enableAnimations();
            sandbox.innerText = "";
            sandbox = null;
        };
    }

    Tx.test("WelcomeMessage.testShow", function (tc) {
        setup(tc);

        selection.account = new Mail.Account(provider.getObjectById("outlookAccount"), provider.getClient());

        tc.isNull(sandbox.firstElementChild);
        var w = new Mail.WelcomeMessage(host, selection, animator, settings, [], commandManager);
        w.activateUI();
        tc.ok(sandbox.firstElementChild);

        w.shutdownUI();
        w.shutdownComponent();
    });

    Tx.test("WelcomeMessage.testAlreadyShown", function (tc) {
        setup(tc);

        settings.dismissedWelcomeMessage = true;
        selection.account = new Mail.Account(provider.getObjectById("easAccount"), provider.getClient());

        tc.isNull(sandbox.firstElementChild);
        var w = new Mail.WelcomeMessage(host, selection, animator, settings, [], commandManager);
        w.activateUI();
        tc.isNull(sandbox.firstElementChild);

        w.shutdownUI();
        w.shutdownComponent();
    });

    Tx.test("WelcomeMessage.testDismiss", function (tc) {
        setup(tc);

        selection.account = new Mail.Account(provider.getObjectById("easAccount"), provider.getClient());

        tc.isNull(sandbox.firstElementChild);
        var w = new Mail.WelcomeMessage(host, selection, animator, settings, [], commandManager);
        w.activateUI();
        tc.ok(sandbox.firstElementChild);

        selection.updateNav = function (account, view) {
            tc.areEqual(account.objectId, "easAccount");
            tc.areEqual(view.objectId, "easInbox");
            this.raiseEvent("navChanged", {});
        };
        sandbox.querySelector("button.inbox").click();
        tc.isTrue(settings.dismissedWelcomeMessage);

        w.shutdownUI();
        w.shutdownComponent();
    });

})();
