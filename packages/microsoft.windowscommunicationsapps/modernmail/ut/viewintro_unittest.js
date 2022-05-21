
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/* jshint browser:true */
/* globals Jx,Mail,Microsoft,Mocks,Tx,WinJS */

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    function MockAppData(data) {
        return {
            get: function (key) { return data[key]; },
            set: function (key, value) { data[key] = value; },
            container: function (name) { return new MockAppData(data[name] = data[name] || {}); }
        };
    }

    var intro, container, settings, account;
    function setup(tc) {

        var provider = new D.JsonProvider({
            Account: {
                all: [
                    { objectId: "defaultAccount" }
                ]
            },
            MailView: {
                all: [
                    {
                        accountId: "defaultAccount",
                        type: Plat.MailViewType.inbox
                    }, {
                        accountId: "defaultAccount",
                        type: Plat.MailViewType.newsletter
                    }, {
                        accountId: "defaultAccount",
                        type: Plat.MailViewType.social
                    }, {
                        accountId: "defaultAccount",
                        type: Plat.MailViewType.allPinnedPeople
                    }
                ]
            }
        }, D.MethodHandlers);

        settings = {
            dismissedInboxIntro: false,
            dismissedNewsletterIntro: false,
            dismissedSocialIntro: false,
            dismissedAllFavoritesIntro: false,
            getLocalSettings: function () { return new MockAppData(this._appData); },
            mock$setAppData: function (appData) { this._appData = appData; },
            _appData: {}
        };

        intro = new Mail.ViewIntroductionHeader(settings);

        var sandbox = document.getElementById("sandbox");
        sandbox.innerHTML = "<div id='container'>" + Jx.getUI(intro).html + "</div>";
        intro.activateUI();

        container = sandbox.querySelector("#container");
        intro.setContainer(container);

        account = new Mail.Account(provider.getObjectById("defaultAccount"), provider.getClient());

        WinJS.UI.disableAnimations();
        tc.cleanup = function () {
            intro.shutdownUI();
            intro.shutdownComponent();

            WinJS.UI.enableAnimations();
            sandbox.innerText = "";
            sandbox = null;
        };
    }

    Tx.asyncTest("ViewIntro.testDismiss", function (tc) {
        tc.stop();
        setup(tc);

        intro.setView(account.inboxView);
        tc.isTrue(container.classList.contains("showViewIntro"));

        var button = container.querySelector("button");
        button.click();

        intro.waitForAnimation().then(function () { 
            tc.isFalse(container.classList.contains("showViewIntro"));
            tc.areEqual(settings.dismissedInboxIntro, true);
            tc.start();
        });

    });

    Tx.test("ViewIntro.testPreDismiss", function (tc) {
        setup(tc);

        settings.dismissedInboxIntro = true;
        intro.setView(account.inboxView);
        tc.isFalse(container.classList.contains("showViewIntro"));
    });

    Tx.test("ViewIntro.testAutoDismiss", function (tc) {
        setup(tc);

        settings.mock$setAppData({
            ViewIntroCounts: {
                Inbox: "3",
                Newsletter: "0",
                Social: 1
            }
        });

        intro.setView(account.inboxView);
        tc.isTrue(container.classList.contains("showViewIntro"));

        intro.setView(account.newsletterView);
        tc.isTrue(container.classList.contains("showViewIntro"));

        intro.setView(account.inboxView);
        tc.isFalse(container.classList.contains("showViewIntro"));
        tc.areEqual(settings.dismissedInboxIntro, true);

        intro.setView(account.newsletterView);
        tc.isTrue(container.classList.contains("showViewIntro"));

        intro.setView(account.newsletterView);
        tc.isTrue(container.classList.contains("showViewIntro"));

        intro.setView(account.newsletterView);
        tc.isFalse(container.classList.contains("showViewIntro"));
        tc.areEqual(settings.dismissedNewsletterIntro, true);
    });

    Tx.asyncTest("ViewIntro.testDisabledCategory", function (tc) {
        tc.stop();
        setup(tc);

        intro.setView(account.inboxView);
        tc.isTrue(container.classList.contains("showViewIntro"));

        account.newsletterView.platformMailView.setEnabled(false);
        intro.waitForAnimation().then(function () {
            tc.isFalse(container.classList.contains("showViewIntro"));
            tc.areEqual(settings.dismissedInboxIntro, true);
            tc.start();
        });
    });

    Tx.test("ViewIntro.testAccountType", function (tc) {
        setup(tc);

        account.platformObject.mock$easSettings.mock$setProperty("isWlasSupported", false);

        intro.setView(account.inboxView);
        tc.isFalse(container.classList.contains("showViewIntro"));

        account.platformObject.mock$easSettings.mock$setProperty("isWlasSupported", true);
        tc.isTrue(container.classList.contains("showViewIntro"));
    });

    Tx.asyncTest("ViewIntro.testNoPeopleViews", function (tc) {
        tc.stop();
        setup(tc);

        account.platformObject.mock$setProperty("peopleViewComplete", false);

        intro.setView(account.pinnedPeopleView);
        tc.isTrue(container.classList.contains("showViewIntro"));

        account.platformObject.mock$setProperty("peopleViewComplete", true);
        intro.waitForAnimation().then(function () {
            tc.isFalse(container.classList.contains("showViewIntro"));
            tc.areEqual(settings.dismissedAllFavoritesIntro, true);
            tc.start();
        });
    });

})();
