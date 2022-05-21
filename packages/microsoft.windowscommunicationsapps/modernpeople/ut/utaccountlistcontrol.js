
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Mocks,Microsoft,document,window,Include*/

Include.initializeFileScope(function () {

    var M = Mocks;
    var Plat = Microsoft.WindowsLive.Platform;
    var A = People.Accounts;

    var divRoot = null;
    var priorWinJSAnimation = null;

    function setup () {
        if (!Jx.app) {
            Jx.app = new Jx.Application();
            Jx.res.getString = function () { return "null"; };
        }
        divRoot = document.createElement("div");
        divRoot.style.visibility = "hidden";
        document.body.appendChild(divRoot);

        // Mock out the animations.
        priorWinJSAnimation = WinJS.UI.Animation;
        WinJS.UI.Animation.createAddToListAnimation = function () { return { execute: function () { } }; };
        WinJS.UI.Animation.createDeleteFromListAnimation = function () { return { execute: function () { } }; };
        WinJS.UI.Animation.createRepositionAnimation = function () { return { execute: function () { } }; };

    }

    function cleanup () {
        if (divRoot !== null) {
            document.body.removeChild(divRoot);
            divRoot = null;
        }
        WinJS.UI.Animation = priorWinJSAnimation;
    }

    function createControl(type, options) {
        var platform = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({
            "Account": {
                "connected": [
                    { displayName: "Facebook", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@facebook.com", mock$configureType: Plat.ConfigureType.editOnWeb },
                    { displayName: "Gmail", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@gmail.com", mock$configureType: Plat.ConfigureType.editOnClient },
                    { displayName: "Hotmail", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@hotmail.com", mock$configureType: Plat.ConfigureType.editOnWeb },
                    { displayName: "LinkedIn", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@linkedin.com", mock$configureType: Plat.ConfigureType.editOnWeb }
                ], "connectable": [
                    { displayName: "Twitter", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "MySpace", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "Flickr", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "Blogger", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "YouTube", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" }
                ]
            }
        }).getClient();
        var accountList = new A.AccountListControl(type,
                                                   platform,
                                                   Plat.ApplicationScenario.people,
                                                   "biciSuffix",
                                                   options);
        accountList.initUI(divRoot);

        return accountList;
    }

    function createAccount(name, email) {
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var account = provider.loadObject("Account", {
            displayName: name,
            emailAddress: email,
            iconMediumUrl: "http://oeexchange/photos/jerryder.jpg",
            mock$configureType: Plat.ConfigureType.editOnWeb
        });
        return account;
    }

    function getAccountItemAtIndex(index) {
        var accountItems = document.querySelectorAll("div.ali");
        // Get the first one in the list
        return accountItems[index];
    }

    function getAccountItemDisplayName(item) {
        var el = item.querySelector(".ali-displayName");
        return el.innerText;
    }

    Tx.test("accountListControlTests.testCount", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var alc = createControl(A.AccountListType.connectedUpsells, {});

        // Verify that we loaded the number of accounts we expected.
        tc.isTrue(alc.getCount() === 4);

        // Verify that we created as many UI items.
        var accountItems = document.querySelectorAll("div.ali");
        tc.isTrue(accountItems.length === 4);
    });

    Tx.test("accountListControlTests.testFilteredUpsellsQuery", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var platform = Mocks.Microsoft.WindowsLive.Platform.Data.makeHeadtraxDataset().getClient();
        var queryVerifier = new M.AccountsQueryVerifier(tc, platform);

        var accountList = new A.AccountListControl(A.AccountListType.filteredUpsells,
                                                   platform,
                                                   Plat.ApplicationScenario.people,
                                                   {});

        accountList.initUI(divRoot);

        queryVerifier.verifyLastQuery(queryVerifier.getConnectableAccountsByScenario /*expected query*/,
                                      Plat.ApplicationScenario.people /*expected scenario*/,
                                      Plat.ConnectableFilter.excludeIfAnyAccountIsConnected /*expected filter*/,
                                      -1 /*expected sort -- none*/);


    });

    Tx.test("accountListControlTests.testUnfilteredUpsellsQuery", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var platform = Mocks.Microsoft.WindowsLive.Platform.Data.makeHeadtraxDataset().getClient();
        var queryVerifier = new M.AccountsQueryVerifier(tc, platform);

        var accountList = new A.AccountListControl(A.AccountListType.unfilteredUpsells,
                                                   platform,
                                                   Plat.ApplicationScenario.people,
                                                   {});

        accountList.initUI(divRoot);

        queryVerifier.verifyLastQuery(queryVerifier.getConnectableAccountsByScenario /*expected query*/,
                                      Plat.ApplicationScenario.people /*expected scenario*/,
                                      Plat.ConnectableFilter.normal /*expected filter*/,
                                      -1 /*expected sort -- none*/);


    });

    Tx.test("accountListControlTests.testConnectedQuery", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var platform = Mocks.Microsoft.WindowsLive.Platform.Data.makeHeadtraxDataset().getClient();
        var queryVerifier = new M.AccountsQueryVerifier(tc, platform);

        var accountList = new A.AccountListControl(A.AccountListType.connectedUpsells,
                                                   platform,
                                                   Plat.ApplicationScenario.people,
                                                   {});

        accountList.initUI(divRoot);

        queryVerifier.verifyLastQuery(queryVerifier.getConnectedAccountsByScenario /*expected query*/,
                                      Plat.ApplicationScenario.people /*expected scenario*/,
                                      Plat.ConnectedFilter.includeDisabledAccounts /*expected filter*/,
                                      Plat.AccountSort.name /*expected sort*/);


    });

    Tx.test("accountListControlTests.testSelection", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var alc = createControl(A.AccountListType.connectedUpsells, { selectionEnabled: true, onPrimaryAction: function () { return false; } });

        var callVerifier = new M.CallVerifier(tc);
        var listener = callVerifier.hookEvents(alc, ["selectionChanged"]);

        // Get the second UI item
        var item = getAccountItemAtIndex(1);
        // Create fake click-event
        var ev = { target: item };
        callVerifier.expectOnce(listener, "selectionChanged", null, function (ev) {
            tc.areEqual(ev.data.object, alc._collection.item(1));
        });
        // Simulate a click event.
        alc._onClick(ev);
        callVerifier.verify();

        // Switch selection back to the first item
        item = getAccountItemAtIndex(0);
        // Create fake click-event
        ev = { target: item };
        callVerifier.expectOnce(listener, "selectionChanged", null, function (ev) {
            tc.areEqual(ev.data.object, alc._collection.item(0));
        });
        // Simulate a click event.
        alc._onClick(ev);
        callVerifier.verify();

        var count = alc._collection.count;
        for (var i = 0; i < count; i++) {
            // Loop through and delete off the front of the list and verify that selection changes.
            callVerifier.expectOnce(listener, "selectionChanged", null, function (ev) {
                if (i < (count - 1)) {
                    tc.areEqual(ev.data.object, alc._collection.item(0));
                } else {
                    tc.areEqual(ev.data.object, null);
                }
            });
            alc._collection.mock$removeItem(0);
            callVerifier.verify();
        }

        // Add a new account to the empty list and verify that it gets selected
        var account = createAccount("test account", "test@live.com");
        callVerifier.expectOnce(listener, "selectionChanged", null, function (ev) {
            tc.areEqual(ev.data.object, account);
        });
        alc._collection.mock$addItem(account, 0);
        callVerifier.verify();

    });

    Tx.test("accountListControlTests.testAccountAdd", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var alc = createControl(A.AccountListType.connectedUpsells, { selectionEnabled: true });

        var callVerifier = new M.CallVerifier(tc);
        var listener = callVerifier.hookEvents(alc, ["objectAdded"]);

        // Add a new account to the empty list and verify that it gets selected
        var account = createAccount("test account", "test@live.com");
        callVerifier.expectOnce(listener, "objectAdded", null, function (ev) {
            tc.areEqual(ev.data.object, account);
        });
        alc._collection.mock$addItem(account, 0);
        callVerifier.verify();

        // Check that the account was added to the correct location
        var displayNameFirst = getAccountItemDisplayName(getAccountItemAtIndex(0));
        tc.areEqual(account.displayName, displayNameFirst);

        // Add a new account to the end of the list and verify that it's properly added.
        account = createAccount("test account2", "test2@live.com");
        callVerifier.expectOnce(listener, "objectAdded", null, function (ev) {
            tc.areEqual(ev.data.object, account);
        });
        alc._collection.mock$addItem(account, alc._collection.count);
        callVerifier.verify();

        var displayNameLast = getAccountItemDisplayName(getAccountItemAtIndex(alc._collection.count - 1));
        tc.areEqual(account.displayName, displayNameLast);
    });

    Tx.test("accountListControlTests.testAccountRemove", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var alc = createControl(A.AccountListType.connectedUpsells);

        var callVerifier = new M.CallVerifier(tc);
        var listener = callVerifier.hookEvents(alc, ["objectRemoved"]);

        var displayNameFirst = getAccountItemDisplayName(getAccountItemAtIndex(0));
        var displayNameSecond = getAccountItemDisplayName(getAccountItemAtIndex(1));

        // Sanity check. If this fails, we probably need to fix the sample data.
        tc.areNotEqual(displayNameFirst, displayNameSecond);

        var accountIdRemoved = alc._collection.item(0).objectId;

        // Remove the first item from the list
        callVerifier.expectOnce(listener, "objectRemoved", null, function (ev) {
            tc.areEqual(ev.data.objectId, accountIdRemoved);
        });
        alc._collection.mock$removeItem(0);
        callVerifier.verify();

        // Make sure the first item in the display has properly changed.
        displayNameFirst = getAccountItemDisplayName(getAccountItemAtIndex(0));

        // What was a position 1 should now be at position 0.
        tc.areEqual(displayNameFirst, displayNameSecond);
    });

    Tx.test("accountListControlTests.testAccountMove", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var alc = createControl(A.AccountListType.connectedUpsells);

        var account = createAccount("test account", "test@live.com");
        alc._collection.mock$addItem(account, 0);

        var displayName;

        // Move our new item all around.
        for (var i = 0; i < alc._collection.count - 1; i++) {
            alc._collection.mock$moveItem(i /*from*/, i + 1 /*to*/);

            // Verify it's new location.
            displayName = getAccountItemDisplayName(getAccountItemAtIndex(i + 1));
            tc.areEqual(account.displayName, displayName);
        }

        for (; i > 0; i--) {
            alc._collection.mock$moveItem(i /*from*/, i - 1 /*to*/);

            // Verify it's new location.
            displayName = getAccountItemDisplayName(getAccountItemAtIndex(i - 1));
            tc.areEqual(account.displayName, displayName);
        }
    });

    Tx.test("accountListControlTests.testAccountOptions", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var onPrimaryActionCalled = false;
        var options = { selectionEnabled: false,
            onPrimaryAction: function () { onPrimaryActionCalled = true; return false; }
        };
        var alc = createControl(A.AccountListType.connectedUpsells, options);

        // We'll use this to ensure we don't get selectionChanged events, seince selection is disabled.
        var callVerifier = new M.CallVerifier(tc);
        var listener = callVerifier.hookEvents(alc, ["selectionChanged"]);

        // Simulate a click event
        var item = getAccountItemAtIndex(1);
        var ev = { target: item, preventDefault: function () { } };
        alc._onClick(ev);
        callVerifier.verify();

        // Verify that the overloaded primary action was called.
        tc.isTrue(onPrimaryActionCalled);
    });

    Tx.test("accountListControlTests.testAccountUpdate", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var alc = createControl(A.AccountListType.connectedUpsells);

        var account = alc._collection.item(0);
        // Simulate a platform change to the account.
        account.displayName = "New name";
        account._notifyPropertyChange([]);

        var newDisplayName = getAccountItemDisplayName(getAccountItemAtIndex(0));
        tc.areEqual("New name", newDisplayName);
    });
});