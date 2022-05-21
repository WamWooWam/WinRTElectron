
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        M = Mocks.Microsoft.WindowsLive.Platform,
        D = M.Data;

    var sandbox, provider, switcher, allViews, mailViews, callbacks, platform;

    function setup(tc) {
        sandbox = document.createElement("div");
        sandbox.setAttribute("style", "position:fixed;top:0px;right:0px");
        document.body.appendChild(sandbox);

        provider = new D.JsonProvider();
        allViews = new M.Collection("MailView", provider);
        var account = new Mail.Account(provider.loadObject("Account", { objectId: "account" }), provider.getClient());
        provider.loadCollection(allViews, [
            { type: Plat.MailViewType.allPinnedPeople, accountId: "account" },
            { type: Plat.MailViewType.person, accountId: "account" },
            { type: Plat.MailViewType.person, accountId: "account" }
        ]);
        mailViews = new Mail.MappedCollection(
            new Mail.QueryCollection(function () { return allViews; }),
            function (v) { return new Mail.UIDataModel.MailView(v, account); }
        );
        mailViews.unlock();
        platform = provider.getClient();

        callbacks = [];
        switcher = {
            selectView: function (view) { tc.fail(); },
            getSettings: function () {
                return { get: Jx.fnEmpty, set: Jx.fnEmpty, container: function () { return this; } };
            },
            isWide: true, 
            getViewCollection: function () { return mailViews; },
            requestAnimation: function () {
                return new WinJS.Promise(function (c) {
                    callbacks.push(c);
                });
            },
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty
        };

        WinJS.UI.disableAnimations();

        tc.cleanup = function () {
            WinJS.UI.enableAnimations();
            sandbox.removeNode(true);
            sandbox = provider = switcher = mailViews = allViews = callbacks = null;
        };
    }

    function runCallbacks() {
        callbacks.forEach(function (c) { c([]); });
        callbacks = [];
    }

    Tx.asyncTest("ViewItems.testFavoritesExpandCollapse", function (tc) {
        tc.stop();
        setup(tc);

        var favorites = Mail.ViewItems.create(switcher, platform, true, mailViews.item(0));
        sandbox.innerHTML = Jx.getUI(favorites).html;
        favorites.activateUI();

        // Initially expanded
        tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
        favorites.onClick({ target: sandbox.querySelector(".chevron"), stopPropagation: Jx.fnEmpty, preventDefault: Jx.fnEmpty });

        tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
        tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
        runCallbacks();
        favorites.waitForAnimation().then(function () {
            tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
            favorites.onClick({ target: sandbox.querySelector(".chevron"), stopPropagation: Jx.fnEmpty, preventDefault: Jx.fnEmpty });
            tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
            runCallbacks();
            return favorites.waitForAnimation();
        }).then(function () {
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
            favorites.shutdownUI();
            tc.start();
        });
    });

    Tx.asyncTest("ViewItems.testFavoritesExpandCollapseKeyboard", function (tc) {
        tc.stop();
        setup(tc);

        var favorites = Mail.ViewItems.create(switcher, platform, true, mailViews.item(0));
        sandbox.innerHTML = Jx.getUI(favorites).html;
        favorites.activateUI();

        // Initially expanded
        tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
        favorites.onKeyDown({ target: sandbox.querySelector(".favorites"), key: "Left", stopPropagation: Jx.fnEmpty, preventDefault: Jx.fnEmpty });

        tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
        tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
        runCallbacks();
        favorites.waitForAnimation().then(function () {
            tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
            favorites.onKeyDown({ target: sandbox.querySelector(".favorites"), key: "Right", stopPropagation: Jx.fnEmpty, preventDefault: Jx.fnEmpty });
            tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
            runCallbacks();
            return favorites.waitForAnimation();
        }).then(function () {
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsing"));
            favorites.shutdownUI();
            tc.start();
        });
    });

    Tx.asyncTest("ViewItems.testFavoritesExpandCollapseAria", function (tc) {
        tc.stop();
        setup(tc);

        var favorites = Mail.ViewItems.create(switcher, platform, true, mailViews.item(0));
        sandbox.innerHTML = Jx.getUI(favorites).html;
        favorites.activateUI();

        // Initially expanded
        tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
        tc.areEqual(sandbox.querySelector(".favorites").getAttribute("aria-expanded"), "true");
        sandbox.querySelector(".favorites").setAttribute("aria-expanded", "false");
        favorites.onAttributeChange({
            target: sandbox.querySelector(".favorites"),
            attributeName: "aria-expanded"
        });
        WinJS.Promise.timeout().then(function () {
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            runCallbacks();
            return favorites.waitForAnimation();
        }).then(function () {
            tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            sandbox.querySelector(".favorites").setAttribute("aria-expanded", "true");
            favorites.onAttributeChange({
                target: sandbox.querySelector(".favorites"),
                attributeName: "aria-expanded"
            });
            return WinJS.Promise.timeout();
        }).then(function () {
            tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            runCallbacks();
            return favorites.waitForAnimation();
        }).then(function () {
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            favorites.shutdownUI();
            tc.start();
        });
    });

    Tx.asyncTest("ViewItems.testFavoritesExpandCollapseEmpty", function (tc) {
        tc.stop();
        setup(tc);

        var p1 = allViews.mock$removeItem(1),
            p2 = allViews.mock$removeItem(1);
        var favorites = Mail.ViewItems.create(switcher, platform, true, mailViews.item(0));
        sandbox.innerHTML = Jx.getUI(favorites).html;
        favorites.activateUI();

        // Collapsed, empty
        tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
        tc.isTrue(sandbox.querySelector(".chevron").classList.contains("hidden"));
        tc.areEqual(null, sandbox.querySelector(".favorites").getAttribute("aria-expanded"));

        // Adding an item expands
        allViews.mock$addItem(p1, 1);
        tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide")); // expand animation pending
        tc.isFalse(sandbox.querySelector(".chevron").classList.contains("hidden"));
        tc.areEqual("true", sandbox.querySelector(".favorites").getAttribute("aria-expanded"));

        runCallbacks();
        favorites.waitForAnimation().then(function () {
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide")); // expand animation complete
            tc.isFalse(sandbox.querySelector(".chevron").classList.contains("hidden"));
            tc.areEqual("true", sandbox.querySelector(".favorites").getAttribute("aria-expanded"));

            // Removing it collapses again
            allViews.mock$removeItem(1);
            tc.isFalse(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isTrue(sandbox.querySelector(".chevron").classList.contains("hidden"));
            tc.areEqual(null, sandbox.querySelector(".favorites").getAttribute("aria-expanded"));

            runCallbacks();
            return favorites.waitForAnimation();
        }).then(function () {
            tc.isTrue(sandbox.querySelector(".children").classList.contains("collapsed-wide"));
            tc.isTrue(sandbox.querySelector(".chevron").classList.contains("hidden"));
            tc.areEqual(null, sandbox.querySelector(".favorites").getAttribute("aria-expanded"));
            favorites.shutdownUI();
            tc.start();
        });
    });
        
})();

