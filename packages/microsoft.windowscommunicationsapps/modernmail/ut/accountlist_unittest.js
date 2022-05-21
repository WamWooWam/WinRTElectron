
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Microsoft,Mocks*/

(function () {

    var U = Mail.UnitTest;
    var P = Microsoft.WindowsLive.Platform;
    var MP = Mocks.Microsoft.WindowsLive.Platform;

    function mockAccount(id) {
        var resource = {
            displayName: id,
            addEventListener: function () {},
            removeEventListener: function () {}
        };
        return {
            objectId: id,
            displayName: id,
            getResourceByType: function () { return resource; },
            getServerByType: function () { return null; },
            addEventListener: function () {},
            removeEventListener: function () {},
            mockedType : Microsoft.WindowsLive.Platform.Account
        };
    }

    var setUp = function (tc) {
        Mail.UnitTest.stubJx(tc, "res");
        var div = document.createElement("div");
        document.body.appendChild(div);
        return div;
    };

    var tearDown = function (div) {
        Jx.scheduler.testFlush();
        try {
            document.body.removeChild(div);
        } catch(e) { }
        Mail.UnitTest.restoreJx();
    };

    // Overwrite getUnseenCollection
    Mail.AccountItem._getUnseenCollection = function () { 
        return { addEventListener: function () {}, removeEventListener: function () {}, unlock: function () { }, count: 0};
    };
    
    // Overwrite AccountSwitcherAggregator
    Mail.AccountSwitcherAggregator = function () {};
    Jx.augment(Mail.AccountSwitcherAggregator, Jx.Component);

    Tx.test("AccountSwitcher.addRemoveAccount", {owner:"neilpa", priority:0}, function (tc) {
        var containerDiv = setUp(tc);
        tc.cleanup = function () {
            tearDown(containerDiv);
        };
        var calls = new U.CallVerifier(tc);

        // Start with a single account
        var accounts = new MP.Collection("Account", { clone: function (item) { return item; } });
        accounts.mock$addItem(mockAccount("0"), 0);

        // Need to mock the platform, app state, animator and folder cache
        var platform = { accountManager: {}, mockedType: P.Client };
        calls.expectOnce(platform.accountManager, "getConnectedAccountsByScenario", [
            P.ApplicationScenario.mail, P.ConnectedFilter.normal, P.AccountSort.name
        ], function () { return accounts; });

        var selection = { account: new Mail.Account(accounts.item(0), platform) }, host = { };

        // Create the account switcher and verify the mocks were called as expected
        var switcher = new Mail.AccountSwitcher(platform, host, selection, Jx.scheduler);
        calls.verify();

        // Create a place to host the UI
        var div = document.createElement("div");
        div.innerHTML = Jx.getUI(switcher).html;
        var list = div.querySelector("#accountSwitcher");
        tc.isTrue(Jx.isHTMLElement(list));

        // We started with a single account
        tc.isTrue(list.classList.contains("singleAccount"));

        // Once we're hosted the collection should be unlocked for changes
        calls.expectOnce(accounts, "unlock");
        containerDiv.appendChild(list);
        switcher.activateUI();
        calls.verify();

        // Add a second account to the collection and validate the list gets shown
        U.ensureSynchronous(function () {
            accounts.mock$addItem(mockAccount("1"), 1);
        });
        tc.isFalse(list.classList.contains("singleAccount"));

        // Remove the first item and validate the list gets hidden again and the
        // selected item is switched synchronously to the remaining account
        calls.expectOnce(host, "selectAccount", [accounts.item(1), true]);
        U.ensureSynchronous(function () {
            accounts.mock$removeItem(0);
        });
        calls.verify();
        tc.isTrue(list.classList.contains("singleAccount"));

        // Cleanup
        switcher.deactivateUI();
        Jx.dispose(switcher);
    });

})();
