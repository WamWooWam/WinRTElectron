
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Microsoft,Mocks,WinJS,Debug*/

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    var sandbox, provider, settings, flyoutFactory;
    function setup(tc) {
        Mail.UnitTest.stubJx(tc, "bici");

        sandbox = document.createElement("div");
        sandbox.setAttribute("style", "position:fixed;top:0px;right:0px");
        document.body.appendChild(sandbox);

        settings = { get: Jx.fnEmpty, set: Jx.fnEmpty, container: function () { return this; } };
        flyoutFactory = function (content) {
            sandbox.insertAdjacentHTML("beforeend", Jx.getUI(content).html);
            content.activateUI();
            return {
                hide: Jx.fnEmpty,
                dispose: function () {
                    content.shutdownUI();
                    content.shutdownComponent();
                }
            };
        };
        provider = new D.JsonProvider({
            Account: {
                all: [
                    { objectId: "firstAccount" },
                    { objectId: "secondAccount", accountType: Plat.AccountType.imap },
                    { objectId: "thirdAccount", accountType: Plat.AccountType.imap, sourceId: "GOOG" }
                ]
            },
            MailView: {
                all: [
                    {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.flagged,
                        objectId: "firstFlagged",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.inbox,
                        objectId: "firstInbox",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.allPinnedPeople,
                        objectId: "favorites",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.person,
                        mock$sourceObjectId: "firstPerson",
                        objectId: "firstPersonView",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.person,
                        mock$sourceObjectId: "secondPerson",
                        objectId: "secondPersonView",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.newsletter,
                        objectId: "newsletter",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.social,
                        objectId: "social",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.userGeneratedFolder,
                        mock$sourceObjectId: "firstFolder",
                        objectId: "firstFolderView",
                        notificationCount: 8,
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.userGeneratedFolder,
                        mock$sourceObjectId: "secondFolder",
                        objectId: "secondFolderView",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.userGeneratedFolder,
                        mock$sourceObjectId: "unpinnedFolder",
                        objectId: "unpinnedFolderView",
                        isPinnedToNavPane: false
                    }, {
                        accountId: "secondAccount",
                        type: Plat.MailViewType.flagged,
                        isPinnedToNavPane: true
                    }, {
                        accountId: "secondAccount",
                        type: Plat.MailViewType.inbox,
                        isPinnedToNavPane: true
                    }, {
                        accountId: "thirdAccount",
                        type: Plat.MailViewType.flagged,
                        isPinnedToNavPane: true
                    }, {
                        accountId: "thirdAccount",
                        type: Plat.MailViewType.inbox,
                        isPinnedToNavPane: true
                    }
                ]
            },
            Folder: {
                all: [
                    {
                        objectId: "firstFolder",
                        folderName: "A"
                    }, {
                        objectId: "secondFolder",
                        folderName: "B"
                    }, {
                        objectId: "unpinnedFolder",
                        folderName: "C"
                    }
                ]
            },
            Person: {
                all: [
                    {
                        objectId: "firstPerson",
                        calculatedUIName: "X"
                    }, {
                        objectId: "secondPerson",
                        calculatedUIName: "Y"
                    }
                ]
            }
        }, D.MethodHandlers);
        WinJS.UI.disableAnimations();

        tc.cleanup = function () {
            WinJS.UI.enableAnimations();
            sandbox.removeNode(true);
            sandbox = null;
            provider = null;
        };
    }

    Tx.test("AccountViews.testContent", function (tc) {
        setup(tc);

        var switcher = { selectViewAsync: function () { tc.fail(); }, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var accountViews = new Mail.AccountViews(new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient()), switcher, settings, Jx.fnEmpty);
        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        tc.ok(sandbox.querySelector(".inbox"));
        tc.ok(sandbox.querySelector(".flagged"));
        tc.ok(sandbox.querySelector(".favorites"));
        tc.areEqual(sandbox.querySelectorAll(".person").length, 2);
        tc.ok(sandbox.querySelector(".morePeople"));
        tc.ok(sandbox.querySelector(".newsletter"));
        tc.ok(sandbox.querySelector(".social"));
        tc.ok(sandbox.querySelector(".folders"));
        tc.areEqual(sandbox.querySelectorAll(".folder").length, 4);

        accountViews.shutdownUI();
        Jx.scheduler.testFlush();
    });

    Tx.test("AccountViews.testMultiple", function (tc) {
        setup(tc);

        var switcher = { selectViewAsync: function () { tc.fail(); }, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var accountViews = new Mail.AccountViews(new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient()), switcher, settings, Jx.fnEmpty),
            accountViews2 = new Mail.AccountViews(new Mail.Account(provider.getObjectById("secondAccount"), provider.getClient()), switcher, settings, Jx.fnEmpty),
            accountViews3 = new Mail.AccountViews(new Mail.Account(provider.getObjectById("thirdAccount"), provider.getClient()), switcher, settings, Jx.fnEmpty);
        sandbox.innerHTML = Jx.getUI(accountViews).html + Jx.getUI(accountViews2).html + Jx.getUI(accountViews3).html;
        accountViews.activateUI();
        accountViews2.activateUI();
        accountViews3.activateUI();

        tc.areEqual(sandbox.querySelectorAll(".inbox").length, 3);
        tc.areEqual(sandbox.querySelectorAll(".flagged").length, 3);
        tc.areEqual(sandbox.querySelectorAll(".folders").length, 3);
        tc.areEqual(sandbox.querySelectorAll(".favorites").length, 1);

        accountViews.shutdownUI();
        accountViews2.shutdownUI();
        accountViews3.shutdownUI();
        Jx.scheduler.testFlush();
    });

    Tx.test("AccountViews.testClickView", function (tc) {
        setup(tc);

        var switcher = {
            selectViewAsync: function (view) { view.platformMailView.clicked = true; },
            addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty
        };

        var accountViews = new Mail.AccountViews(new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient()), switcher, settings, Jx.fnEmpty);
        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        sandbox.querySelector(".inbox").click();
        tc.isTrue(provider.getObjectById("firstInbox").clicked);

        sandbox.querySelector(".flagged").click();
        tc.isTrue(provider.getObjectById("firstFlagged").clicked);

        accountViews.shutdownUI();
        Jx.scheduler.testFlush();
    });

    Tx.test("AccountViews.testFlyout", function (tc) {
        setup(tc);

        var shown = 0, hidden = 0;
        var switcher = { selectViewAsync: function () { tc.fail(); }, isWide: true };
        Jx.mix(switcher, Jx.Events);
        Debug.Events.define(switcher, "widthChanged");

        var account = new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient());
        var accountViews = new Mail.AccountViews(account, switcher, settings, function (content) {
            sandbox.insertAdjacentHTML("beforeend", Jx.getUI(content).html);
            content.activateUI();
            return {
                show: function () { ++shown; },
                hide: function () { ++hidden; }
            };
        });
        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        sandbox.querySelector(".folders").click();
        tc.areEqual(shown, 1);

        accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("firstFlagged"), account));
        tc.areEqual(hidden, 1);

        accountViews.getFlyout("folders").show();
        tc.areEqual(shown, 2);

        accountViews.getFlyout("folders").hide();
        tc.areEqual(hidden, 2);

        sandbox.querySelector(".morePeople").click();
        tc.areEqual(shown, 3);

        accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("firstFlagged"), account));
        tc.areEqual(hidden, 4);

        provider.getObjectById("firstPersonView").pinToNavPane(false);
        provider.getObjectById("secondPersonView").pinToNavPane(false);
        sandbox.querySelector(".favorites").click();
        tc.areEqual(shown, 4);

        accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("firstFlagged"), account));
        tc.areEqual(hidden, 6);

        switcher.isWide = false;
        switcher.raiseEvent("widthChanged");
        provider.getObjectById("firstPersonView").pinToNavPane(true);
        provider.getObjectById("secondPersonView").pinToNavPane(true);
        sandbox.querySelector(".favorites").click();
        tc.areEqual(shown, 5);

        accountViews.shutdownUI();
        Jx.scheduler.testFlush();
    });

    Tx.asyncTest("AccountViews.testViewSelection", function (tc) {
        tc.stop();
        setup(tc);

        var switcher = { selectViewAsync: function () { tc.fail(); }, isWide: true, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var account = new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient());
        var accountViews = new Mail.AccountViews(account, switcher, settings, flyoutFactory);

        accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("firstInbox"), account));

        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        tc.isTrue(sandbox.querySelector(".inbox").classList.contains("selected"));
        tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

        accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("firstFolderView"), account));
        tc.isTrue(sandbox.querySelectorAll(".folder")[2].classList.contains("selected"));
        tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

        accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("unpinnedFolderView"), account));
        tc.isTrue(sandbox.querySelector(".moreFolders").classList.contains("selected"));
        tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

        provider.getObjectById("unpinnedFolderView").pinToNavPane(true);
        accountViews.waitForAnimation().then(function () {
            tc.isTrue(sandbox.querySelectorAll(".folder")[4].classList.contains("selected"));
            tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

            provider.getObjectById("unpinnedFolderView").pinToNavPane(false);
            return accountViews.waitForAnimation();
        }).then(function () {
            tc.isTrue(sandbox.querySelector(".moreFolders").classList.contains("selected"));
            tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

            accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("firstPersonView"), account));
            tc.isTrue(sandbox.querySelectorAll(".person")[0].classList.contains("selected"));
            tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

            provider.getObjectById("firstPersonView").pinToNavPane(false);
            return accountViews.waitForAnimation();
        }).then(function () {
            tc.isTrue(sandbox.querySelector(".morePeople").classList.contains("selected"));
            tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

            provider.getObjectById("secondPersonView").pinToNavPane(false);
            return accountViews.waitForAnimation();
        }).then(function () {
            tc.isTrue(sandbox.querySelector(".favorites").classList.contains("selected"));
            tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

            provider.getObjectById("secondPersonView").pinToNavPane(true);
            return accountViews.waitForAnimation();
        }).then(function () {
            tc.isTrue(sandbox.querySelector(".morePeople").classList.contains("selected"));
            tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

            provider.getObjectById("firstPersonView").pinToNavPane(true);
            return accountViews.waitForAnimation();
        }).then(function () {
            tc.isTrue(sandbox.querySelectorAll(".person")[0].classList.contains("selected"));
            tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

            accountViews.shutdownUI();
            Jx.scheduler.testFlush();
            tc.start();
        });
    });

    Tx.test("AccountViews.testSkinny", function (tc) {
        setup(tc);

        var switcher = { selectViewAsync: function () { tc.fail(); }, isWide: true };
        Jx.mix(switcher, Jx.Events);
        Debug.Events.define(switcher, "widthChanged");

        var account = new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient());
        var accountViews = new Mail.AccountViews(account, switcher, settings, Jx.fnEmpty);
        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        accountViews.onViewSelected(new Mail.UIDataModel.MailView(provider.getObjectById("firstFolderView"), account));
        tc.isTrue(sandbox.querySelectorAll(".folder")[2].classList.contains("selected"));
        tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

        switcher.isWide = false;
        switcher.raiseEvent("widthChanged");
        tc.isTrue(sandbox.querySelector(".folders").classList.contains("selected"));
        tc.areEqual(sandbox.querySelectorAll(".selected").length, 1);

        accountViews.shutdownUI();
        Jx.scheduler.testFlush();
    });

    Tx.test("AccountViews.testCount", function (tc) {
        setup(tc);

        var switcher = { selectViewAsync: function () { tc.fail(); }, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var accountViews = new Mail.AccountViews(new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient()), switcher, settings, flyoutFactory);
        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        tc.areEqual(sandbox.querySelectorAll(".folder .count")[2].innerText, "8");
        provider.getObjectById("firstFolderView").mock$setProperty("notificationCount", 50);
        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.querySelectorAll(".folder .count")[2].innerText, "50");

        provider.getObjectById("firstFolderView").mock$setProperty("notificationCount", 1000);
        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.querySelectorAll(".folder .count")[2].innerText, "999\u207a");

        provider.getObjectById("firstFolderView").mock$setProperty("notificationCount", 0);
        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.querySelectorAll(".folder .count")[2].innerText, "");

        accountViews.shutdownUI();
        Jx.scheduler.testFlush();
    });
   
   Tx.test("AccountViews.testName", function (tc) {
        setup(tc);

        var switcher = { selectViewAsync: function () { tc.fail(); }, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var accountViews = new Mail.AccountViews(new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient()), switcher, settings, function (content) {
            sandbox.insertAdjacentHTML("beforeend", Jx.getUI(content).html);
            content.activateUI();
            return { };
        });
        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        tc.areEqual(sandbox.querySelectorAll(".folder .name")[2].innerText, "A");
        tc.areEqual(sandbox.querySelectorAll(".folder .name")[3].innerText, "B");
        provider.getObjectById("firstFolder").mock$setProperty("folderName", "Q");
        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.querySelectorAll(".folder .name")[2].innerText, "B");
        tc.areEqual(sandbox.querySelectorAll(".folder .name")[3].innerText, "Q");

        tc.areEqual(sandbox.querySelector(".person .name").innerText, "X");
        provider.getObjectById("firstPerson").mock$setProperty("calculatedUIName", "R");
        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.querySelector(".person .name").innerText, "R");

        accountViews.shutdownUI();
        Jx.scheduler.testFlush();
    });
   
    Tx.test("AccountViews.testReset", function (tc) {
        setup(tc);

        var switcher = { selectViewAsync: function () { tc.fail(); }, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var accountViews = new Mail.AccountViews(new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient()), switcher, settings, function (content) {
            sandbox.insertAdjacentHTML("beforeend", Jx.getUI(content).html);
            content.activateUI();
            return { };
        });
        sandbox.innerHTML = Jx.getUI(accountViews).html;
        accountViews.activateUI();

        tc.ok(sandbox.querySelector(".inbox"));
        tc.ok(sandbox.querySelector(".flagged"));
        tc.ok(sandbox.querySelector(".favorites"));
        tc.areEqual(sandbox.querySelectorAll(".person").length, 2);
        tc.ok(sandbox.querySelector(".morePeople"));
        tc.ok(sandbox.querySelector(".newsletter"));
        tc.ok(sandbox.querySelector(".social"));
        tc.ok(sandbox.querySelector(".folders"));
        tc.areEqual(sandbox.querySelectorAll(".folder").length, 4);

        var collection = provider.getClient().mailManager.getMailViews(Plat.MailViewScenario.navPane, "firstAccount");
        collection.mock$suspendNotifications();
        collection.mock$removeItem(0);
        collection.mock$resumeNotifications();

        tc.ok(sandbox.querySelector(".inbox"));
        tc.ok(!sandbox.querySelector(".flagged"));
        tc.ok(sandbox.querySelector(".favorites"));
        tc.areEqual(sandbox.querySelectorAll(".person").length, 2);
        tc.ok(sandbox.querySelector(".morePeople"));
        tc.ok(sandbox.querySelector(".newsletter"));
        tc.ok(sandbox.querySelector(".social"));
        tc.ok(sandbox.querySelector(".folders"));
        tc.areEqual(sandbox.querySelectorAll(".folder").length, 4);

        accountViews.shutdownUI();
        Jx.scheduler.testFlush();
    });
})();
