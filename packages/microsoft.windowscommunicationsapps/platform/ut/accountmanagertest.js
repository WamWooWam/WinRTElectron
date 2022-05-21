
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Account Manager functionality

(function() {

    var wl = Microsoft.WindowsLive.Platform;
    var wlt = wl.Test;

    Tx.test("AccountManagerTest.testDefaultAccount", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var accountManager = null;
        var account = null;

        tc.isNotNull(platform, "setup failed");

        accountManager = platform.client.accountManager;
        tc.isNotNull(accountManager, "account manager missing");

        var accountType = Microsoft.WindowsLive.Platform.AccountType.liveId;
        account = accountManager.defaultAccount;
        tc.isNotNull(account, "default account missing");

        // Verify its properties
        tc.areEqual(accountType, account.accountType, "accountType");
        tc.areEqual(PlatformTest.defaultUser, account.emailAddress, "email on Account");
        tc.areEqual(true, account.isDefault, "isDefault");
        tc.areEqual(Microsoft.WindowsLive.Platform.SyncType.push, account.syncType, "syncType");
        tc.areEqual(0, account.pollInterval, "pollInterval");

        // Verify the MeContact is available
        var meContact = account.meContact;
        tc.isNotNull(meContact, "MeContact is missing");
        tc.areEqual(account.emailAddress, meContact.windowsLiveEmailAddress, "email on MeContact");
    });

    Tx.test("AccountManagerTest.testCreateAccount", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var accountManager = null;
        var connectableAccount = null;
        var account = null;

        // Make a new account
        tc.isNotNull(platform);

        accountManager = platform.client.accountManager;
        tc.isNotNull(accountManager);

        connectableAccount = accountManager.getAccountBySourceId("EXCH", "");
        tc.isNotNull(connectableAccount);

        var accountType = Microsoft.WindowsLive.Platform.AccountType.eas;
        var accountEmail = "eas@account.unittest";
        account = connectableAccount.createConnectedAccount(accountEmail);
        tc.isNotNull(account);

        // Verify its properties
        tc.areEqual(accountType, account.accountType);
        tc.areEqual(accountEmail, account.emailAddress);
        tc.areEqual("Account", account.displayName);
        tc.areEqual(false, account.isDefault);
        tc.areEqual(wl.Result.success, account.lastAuthResult);
        tc.areEqual(wl.Result.autoDiscoveryNotAttempted, account.settingsResult);
        tc.areEqual(Microsoft.WindowsLive.Platform.SyncType.push, account.syncType);
        tc.areEqual(0, account.pollInterval);

        // Change the accountDisplayName property
        var accountDisplayName = "EAS Display Name";
        account.displayName = accountDisplayName;
        tc.areEqual(accountEmail, account.emailAddress);
        tc.areEqual(accountDisplayName, account.displayName);

        // Verify the resources
        var resources = account.resources;
        tc.isNotNull(resources);
        tc.isTrue(resources.count >= 3);
        var calendarSeen = false;
        var contactsSeen = false;
        var mailSeen = false;
        for (var i = 0; i < resources.count; ++i) {
            var resource = resources.item(i);
            tc.isNotNull(resource);
            if (wl.ResourceType.calendar == resource.resourceType) {
                calendarSeen = true;
                tc.areEqual(false, resource.isSyncNeeded);
                tc.areEqual(true, resource.isEnabled);
                tc.areEqual(wl.Result.serverNotAttempted, resource.lastSyncResult);
            }
            else if (wl.ResourceType.contacts == resource.resourceType) {
                contactsSeen = true;
                tc.areEqual(false, resource.isSyncNeeded);
                tc.areEqual(true, resource.isEnabled);
                tc.areEqual(wl.Result.serverNotAttempted, resource.lastSyncResult);
            }
            else if (wl.ResourceType.mail == resource.resourceType) {
                mailSeen = true;
                tc.areEqual(false, resource.isSyncNeeded);
                tc.areEqual(true, resource.isEnabled);
                resource.isEnabled = false;
                tc.areEqual(false, resource.isEnabled);
                tc.areEqual(wl.Result.serverNotAttempted, resource.lastSyncResult);
            }
        }
        tc.isTrue(calendarSeen);
        tc.isTrue(contactsSeen);
        tc.isTrue(mailSeen);
        var mailResource = account.getResourceByType(wl.ResourceType.mail);
        tc.isNotNull(mailResource);
        tc.areEqual(wl.ResourceType.mail, mailResource.resourceType);
        tc.areEqual(false, mailResource.isEnabled);

        // Verify the servers
        var servers = account.servers;
        tc.isNotNull(servers);
        tc.areEqual(1, servers.count);
        var easSettings = servers.item(0);
        tc.isNotNull(easSettings);
        tc.areEqual(wl.ServerType.eas, easSettings.serverType);
        var easServer = "m.fake.server";
        easSettings.server = easServer;
        tc.areEqual(easServer, easSettings.server);
        var easSettings2 = account.getServerByType(wl.ServerType.eas);
        tc.isNotNull(easSettings2);
        tc.areEqual(easServer, easSettings2.server);
    });

    Tx.test("AccountManagerTest.testDefaultAccountChangeNotifications", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var account = null;
        var updatedAuthResult = 2147811333;
        var updateToSuccess = false;

        account = platform.client.accountManager.defaultAccount;
        tc.isNotNull(account);

        if (0 != account.lastAuthResult) {
            updatedAuthResult = 0;
            updateToSuccess = true;
        }

        var fired = false;
        var count = 0;

        function onObjectChange(ev) {
            var value = ev.detail[0];
            for (var i = 0; i < value.length; ++i) {
                if (value[i] == "lastAuthResult") {
                    fired = true;
                }
            }
        }

        if (account.addEventListener) {
            account.addEventListener("changed", onObjectChange);
        }
        else {
            account["Microsoft.WindowsLive.Platform.IObject.addEventListener"]("changed", onObjectChange);
        }
        
        var accountRow = platform.store.loadTableEntry(wlt.StoreTableIdentifier.account, account.objectId);
        accountRow.authResult = updatedAuthResult;
        accountRow.commit();

        while (!fired && count < 100) {
            count++;
            platform.runMessagePump(50);
        }

        if (account.removeEventListener) {
            account.removeEventListener("changed", onObjectChange);
        }
        else {
            account["Microsoft.WindowsLive.Platform.IObject.removeEventListener"]("changed", onObjectChange);
        }
        tc.areEqual(true, fired, "event not fired");

        // Verify it changed
        tc.areEqual(updateToSuccess, 0 == account.lastAuthResult, "property did not update");
    });

    Tx.test("AccountManagerTest.testaccountResourceChangeNotifications", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var account = null;
        var accountresource = null;
        var updatedSyncResult = 2147811333;
        var updateToSuccess = false;

        account = platform.client.accountManager.defaultAccount;
        accountresource = account.getResourceByType(wl.ResourceType.mail);
        tc.isNotNull(accountresource);

        if (0 != accountresource.lastSyncResult) {
            updatedSyncResult = 0;
            updateToSuccess = true;
        }

        var fired = false;
        var count = 0;

        function onObjectChange(ev) {
            var value = ev.detail[0];
            for (var i = 0; i < value.length; ++i) {
                if (value[i] == "lastSyncResult") {
                    fired = true;
                }
            }
        }

        accountresource.addEventListener("changed", onObjectChange);

        var accountRow = platform.store.loadTableEntry(wlt.StoreTableIdentifier.account, account.objectId);
        accountRow.lastSyncMailResult = updatedSyncResult;
        accountRow.commit();

        while (!fired && count < 100) {
            count++;
            platform.runMessagePump(50);
        }
        accountresource.removeEventListener("changed", onObjectChange);
        tc.areEqual(true, fired, "event not fired");

        // Verify it changed
        tc.areEqual(updateToSuccess, 0 == accountresource.lastSyncResult, "property did not update");
    });

    Tx.test("AccountManagerTest.testaccountServerConnectionSettingsChangeNotifications", function (tc) {
        var platform = PlatformTest.createPlatform(tc);

        var account = null;
        var updatedMailServer = "m@foo.com";
        var updateToHotmail = false;
        var hotmailServer = "m@hotmail.com";

        account = platform.client.accountManager.defaultAccount;
        tc.isNotNull(account);
        var server = account.getServerByType(wl.ServerType.eas);
        tc.isNotNull(server);

        if (hotmailServer != server.server) {
            updatedMailServer = "m@hotmail.com";
            updateToHotmail = true;
        }

        var fired = false;
        var count = 0;

        function onObjectChange(ev) {
            var value = ev.detail[0];
            for (var i = 0; i < value.length; ++i) {
                if (value[i] == "server") {
                    fired = true;
                }
            }
        }

        server.addEventListener("changed", onObjectChange);
               
        var accountRow = platform.store.loadTableEntry(wlt.StoreTableIdentifier.account, account.objectId);
        accountRow.mailServer = updatedMailServer;
        accountRow.commit();

        while (!fired && count < 100) {
            count++;
            platform.runMessagePump(50);
        }
        server.removeEventListener("changed", onObjectChange);
        tc.areEqual(true, fired, "event not fired");

        // Verify it changed
        tc.areEqual(updateToHotmail, hotmailServer == server.server, "property did not update");
    });
})();

