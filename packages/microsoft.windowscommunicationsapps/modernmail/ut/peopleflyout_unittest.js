
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        M = Mocks.Microsoft.WindowsLive.Platform,
        D = M.Data;

    var sandbox, provider, account, views, platform, host, selectedView;
    function setup(tc) {
        sandbox = document.createElement("div");
        sandbox.setAttribute("style", "position:fixed;top:0px;right:0px");
        document.body.appendChild(sandbox);

        provider = new D.JsonProvider({
            Account: {
                default: [ { objectId: "account" } ]
            },
            MailView: {
                pinned: [ { type: Plat.MailViewType.allPinnedPeople, objectId: "allFavorites", accountId: "account" } ]
            }
        });
        platform = provider.getClient();
        account = new Mail.Account(provider.getObjectById("account"), platform);
        views = platform.mailManager.getMailViews(Plat.MailViewScenario.allPeople, "account");

        host = {
            isWide: true,
            selectView: function (view) { selectedView = view; },
            getViewCollection: function () {
                return new Mail.ArrayCollection([
                    new Mail.UIDataModel.MailView(provider.getObjectById("allFavorites"), account)
                ]);
            }
        };
        Jx.mix(host, Jx.Events);
        Debug.Events.define(host, "widthChanged");

        WinJS.UI.disableAnimations();
        tc.cleanup = function () {
            WinJS.UI.enableAnimations();
            sandbox.removeNode(true);
            sandbox = null;
            provider = null;
        };
    }

    Tx.asyncTest("PeopleFlyout.testContent", function (tc) {
        tc.stop();
        setup(tc);

        var flyout = new Mail.PeopleFlyout(host, account);
        sandbox.innerHTML = Jx.getUI(flyout).html;
        flyout.activateUI();
        flyout.beforeShow();

        var list = sandbox.querySelector(".list");
        tc.areEqual(list.children.length, 3);
        tc.isTrue(list.children[0].classList.contains("header"));
        tc.isTrue(list.children[1].classList.contains("blurb"));
        tc.isTrue(list.children[2].classList.contains("picker"));

        provider.loadObject("Person", { objectId: "bob", calculatedUIName: "Bob" });
        var view = provider.loadObject("MailView", { type: Plat.MailViewType.person, mock$sourceObjectId: "bob", accountId: "account" });
        views.mock$addItem(view, 0);
        flyout.waitForAnimation().then(function () {
            tc.areEqual(list.children.length, 5);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("blurb"));
            tc.isTrue(list.children[2].classList.contains("header"));
            tc.isTrue(list.children[3].classList.contains("person"));
            tc.isTrue(list.children[4].classList.contains("picker"));

            view.mock$setProperty("isPinnedToNavPane", true);
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(list.children.length, 3);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("person"));
            tc.isTrue(list.children[2].classList.contains("picker"));

            provider.loadObject("Person", { objectId: "joe", calculatedUIName: "Joe" });
            var view2 = provider.loadObject("MailView", { type: Plat.MailViewType.person, mock$sourceObjectId: "joe", accountId: "account" });
            views.mock$addItem(view2, 0);
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(list.children.length, 5);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("person"));
            tc.isTrue(list.children[2].classList.contains("header"));
            tc.isTrue(list.children[3].classList.contains("person"));
            tc.isTrue(list.children[4].classList.contains("picker"));

            view.mock$setProperty("isPinnedToNavPane", false);
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(list.children.length, 6);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("blurb"));
            tc.isTrue(list.children[2].classList.contains("header"));
            tc.isTrue(list.children[3].classList.contains("person"));
            tc.isTrue(list.children[4].classList.contains("person"));
            tc.isTrue(list.children[5].classList.contains("picker"));

            views.mock$removeItem(0);
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(list.children.length, 5);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("blurb"));
            tc.isTrue(list.children[2].classList.contains("header"));
            tc.isTrue(list.children[3].classList.contains("person"));
            tc.isTrue(list.children[4].classList.contains("picker"));

            flyout.afterHide();
            flyout.shutdownUI();
            flyout.shutdownComponent();
            tc.start();
        });
    });

    Tx.asyncTest("PeopleFlyout.testAllPinned", function (tc) {
        tc.stop();
        setup(tc);

        provider.loadObject("Person", { objectId: "bob", calculatedUIName: "Bob" });
        var view = provider.loadObject("MailView", { type: Plat.MailViewType.person, mock$sourceObjectId: "bob", isPinnedToNavPane: true, accountId: "account" });
        views.mock$addItem(view, 0);

        var flyout = new Mail.PeopleFlyout(host, account);
        sandbox.innerHTML = Jx.getUI(flyout).html;
        flyout.activateUI();
        flyout.beforeShow();

        var list = sandbox.querySelector(".list");
        tc.areEqual(list.children.length, 3);
        tc.isTrue(list.children[0].classList.contains("header"));
        tc.isTrue(list.children[1].classList.contains("person"));
        tc.isTrue(list.children[2].classList.contains("picker"));

        host.isWide = false;
        host.raiseEvent("widthChanged");
        flyout.waitForAnimation().then(function () {
            tc.areEqual(list.children.length, 4);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("favorites"));
            tc.isTrue(list.children[2].classList.contains("person"));
            tc.isTrue(list.children[3].classList.contains("picker"));

            view.mock$setProperty("isPinnedToNavPane", false);
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(list.children.length, 5);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("blurb"));
            tc.isTrue(list.children[2].classList.contains("header"));
            tc.isTrue(list.children[3].classList.contains("person"));
            tc.isTrue(list.children[4].classList.contains("picker"));

            view.mock$setProperty("isPinnedToNavPane", true);
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(list.children.length, 4);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("favorites"));
            tc.isTrue(list.children[2].classList.contains("person"));
            tc.isTrue(list.children[3].classList.contains("picker"));

            list.children[1].click();
            tc.areEqual(selectedView.objectId, "allFavorites");

            provider.getObjectById("allFavorites").mock$setProperty("notificationCount", 5);
            Jx.scheduler.testFlush();
            tc.areEqual(list.querySelector(".favorites .count").innerText, "5");

            host.isWide = true;
            host.raiseEvent("widthChanged");
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(list.children.length, 3);
            tc.isTrue(list.children[0].classList.contains("header"));
            tc.isTrue(list.children[1].classList.contains("person"));
            tc.isTrue(list.children[2].classList.contains("picker"));

            flyout.afterHide();
            flyout.shutdownUI();
            flyout.shutdownComponent();
            tc.start();
        });
    });

    Tx.test("PeopleFlyout.testPerson", function (tc) {
        setup(tc);

        var person = provider.loadObject("Person", { objectId: "bob", calculatedUIName: "Bob" });
        var view = provider.loadObject("MailView", {
            objectId: "theView",
            accountId: "account",
            type: Plat.MailViewType.person,
            mock$sourceObjectId: "bob",
            isPinnedToNavPane: false,
            notificationCount: 12
        });
        views.mock$addItem(view, 0);

        var flyout = new Mail.PeopleFlyout(host, account);
        sandbox.innerHTML = Jx.getUI(flyout).html;
        flyout.activateUI();
        flyout.beforeShow();

        tc.areEqual(sandbox.querySelector(".person .name").innerText, "Bob");
        tc.areEqual(sandbox.querySelector(".person .count").innerText, "12");

        person.mock$setProperty("calculatedUIName", "Joe");
        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.querySelector(".person .name").innerText, "Joe");

        view.mock$setProperty("notificationCount", 8);
        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.querySelector(".person .count").innerText, "8");

        sandbox.querySelector(".person .content").click();
        tc.areEqual(selectedView.objectId, "theView");

        var pinned;
        view.pinToNavPane = function (arg) { pinned = arg; };
        sandbox.querySelector(".person .star").click();
        tc.areEqual(pinned, true);

        flyout.afterHide();
        flyout.shutdownUI();
        flyout.shutdownComponent();
    });

    Tx.asyncTest("PeopleFlyout.testSortPinned", function (tc) {
        tc.stop();
        setup(tc);

        var p1 = provider.loadObject("Person", { objectId: "p1", calculatedUIName: "Albert" }),
            p2 = provider.loadObject("Person", { objectId: "p2", calculatedUIName: "Chuck", calculatedYomiDisplayName: "Zeke" }),
            p3 = provider.loadObject("Person", { objectId: "p3", calculatedUIName: "Fred" });
        provider.loadCollection(views, [
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p1", isPinnedToNavPane: true, accountId: "account" },
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p2", isPinnedToNavPane: true, accountId: "account" },
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p3", isPinnedToNavPane: true, accountId: "account" }
        ]);

        var flyout = new Mail.PeopleFlyout(host, account);
        sandbox.innerHTML = Jx.getUI(flyout).html;
        flyout.activateUI();
        flyout.beforeShow();

        tc.areEqual(sandbox.querySelectorAll(".person .name").length, 3);
        tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Albert");
        tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Fred");
        tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Chuck");

        p1.mock$setProperty("calculatedUIName", "George");
        Jx.scheduler.testFlush();
        flyout.waitForAnimation().then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 3);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "George");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Chuck");

            p2.mock$setProperty("calculatedYomiDisplayName", "");
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 3);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Chuck");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "George");

            flyout.afterHide();
            flyout.shutdownUI();
            flyout.shutdownComponent();
            tc.start();
        });
    });

    Tx.asyncTest("PeopleFlyout.testSortUnpinned", function (tc) {
        tc.stop();
        setup(tc);

        var p1 = provider.loadObject("Person", { objectId: "p1", calculatedUIName: "Albert" }),
            p2 = provider.loadObject("Person", { objectId: "p2", calculatedUIName: "Chuck", calculatedYomiDisplayName: "Zeke" }),
            p3 = provider.loadObject("Person", { objectId: "p3", calculatedUIName: "Fred" }),
            p4 = provider.loadObject("Person", { objectId: "p4", calculatedUIName: "George" });
        provider.loadCollection(views, [ 
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p1", isPinnedToNavPane: false, accountId: "account" },
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p2", isPinnedToNavPane: false, accountId: "account" },
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p4", isPinnedToNavPane: true, accountId: "account" },
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p3", isPinnedToNavPane: false, accountId: "account" },
        ]);

        var flyout = new Mail.PeopleFlyout(host, account);
        sandbox.innerHTML = Jx.getUI(flyout).html;
        flyout.activateUI();
        flyout.beforeShow();

        tc.areEqual(sandbox.querySelectorAll(".person .name").length, 4);
        tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "George");
        tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Albert");
        tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Chuck");
        tc.areEqual(sandbox.querySelectorAll(".person .name")[3].innerText, "Fred");

        views.mock$moveItem(3, 0);
        flyout.waitForAnimation().then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 4);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "George");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Albert");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[3].innerText, "Chuck");

            sandbox.querySelectorAll(".person .star")[2].click();
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 4);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Albert");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "George");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[3].innerText, "Chuck");

            sandbox.querySelectorAll(".person .star")[0].click();
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 4);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "George");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Albert");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[3].innerText, "Chuck");

            sandbox.querySelectorAll(".person .star")[0].click();
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 4);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "George");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Albert");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[3].innerText, "Chuck");

            flyout.afterHide();
            flyout.beforeShow();

            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 4);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Albert");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Chuck");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[3].innerText, "George");

            flyout.afterHide();
            flyout.shutdownUI();
            flyout.shutdownComponent();
            tc.start();
        });
    });

    Tx.asyncTest("PeopleFlyout.testSortLastFirst", function (tc) {
        tc.stop();
        setup(tc);

        var p1 = provider.loadObject("Person", { objectId: "p1", calculatedUIName: "Roger" }),
            p2 = provider.loadObject("Person", { objectId: "p2", calculatedUIName: "Chuck", sortNameLastFirst: "Zeke" }),
            p3 = provider.loadObject("Person", { objectId: "p3", calculatedUIName: "Fred", sortNameLastFirst: "Paul" });
        provider.loadCollection(views, [ 
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p1", isPinnedToNavPane: true, accountId: "account" },
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p2", isPinnedToNavPane: true, accountId: "account" },
            { type: Plat.MailViewType.person, mock$sourceObjectId: "p3", isPinnedToNavPane: true, accountId: "account" }
        ]);
        platform.peopleManager.nameSortOrder = true;

        var flyout = new Mail.PeopleFlyout(host, account);
        sandbox.innerHTML = Jx.getUI(flyout).html;
        flyout.activateUI();
        flyout.beforeShow();

        tc.areEqual(sandbox.querySelectorAll(".person .name").length, 3);
        tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Fred");
        tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Roger");
        tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Chuck");

        p3.mock$setProperty("sortNameLastFirst", "Steve");
        flyout.waitForAnimation().then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 3);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Roger");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Fred");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Chuck");

            p2.mock$setProperty("sortNameLastFirst", "");
            return flyout.waitForAnimation();
        }).then(function () {
            tc.areEqual(sandbox.querySelectorAll(".person .name").length, 3);
            tc.areEqual(sandbox.querySelectorAll(".person .name")[0].innerText, "Chuck");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[1].innerText, "Roger");
            tc.areEqual(sandbox.querySelectorAll(".person .name")[2].innerText, "Fred");

            flyout.afterHide();
            flyout.shutdownUI();
            flyout.shutdownComponent();
            tc.start();
        });
    });

})();
