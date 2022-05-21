
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    var elHeader, accountNameHeader,
        account, resource;

    var MP = Mocks.Microsoft.WindowsLive.Platform;

    function setup(tc) {
        var div;
        tc.cleanup = function () {
            try {
                document.body.removeChild(div);
            } catch (e) { }

            accountNameHeader = null;
            elHeader = null;
        };

        account = new MP.Object("Account", { clone: function (item) { return item; } });
        resource = new MP.Object("AccountResource", { clone: function (item) { return item; } });
        account.getResourceByType = function () { return resource; };
        account._objectId = "123456789";
        account.mockedType = Microsoft.WindowsLive.Platform.Account;
        account._displayName = account.displayName = "Foo";
        resource.lastSyncResult = 0;
        resource.lastPushResult = 0;

        div = document.createElement("div");
        document.body.appendChild(div);
        var platform = { mockedType: Microsoft.WindowsLive.Platform.Client };
        var selection = { account: new Mail.Account(account, platform) };
        Jx.mix(selection, Jx.Events);
        Debug.Events.define(selection, "navChanged");
        accountNameHeader = new Mail.AccountNameHeader(selection);
        div.innerHTML = Jx.getUI(accountNameHeader).html;
        elHeader = div.firstElementChild;
        accountNameHeader.activateUI();
    }

    Tx.test("AccountNameRenderer.testName", function (tc) {
        setup(tc);

        // Test the name
        tc.areEqual(elHeader.innerText.trim(), account.displayName);

        // Test changes
        account.mock$setProperty("displayName", "Bar");
        tc.areEqual(elHeader.innerText.trim(), account.displayName);
    });

})();
