
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug,Tx,Mocks,Microsoft*/

(function () {
    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data,
        switcher = null,
        provider = null;

    function setup(tc, option) {
        // option.selectedViewId,
        // option.canServerSearchAllFolders,
        // option.canServerSearchView
        provider = new D.JsonProvider({
            Account: {
                all: [
                    { objectId: "account:1" }
                ]
            },
            Folder: {
                all: [
                    {
                        objectId: "folder:1",
                        folderName: "Inbox",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.inbox,
                        accountId: "account:1"
                    },
                    {
                        objectId: "folder:2",
                        folderName: "Sent",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.sentItems,
                        accountId: "account:1"
                    },
                    {
                        objectId: "folder:3",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        accountId: "account:1",
                        folderName: "before"
                    }
                ]
            },
            MailView: {
                all: [
                    {
                        accountId: "account:1",
                        type: Plat.MailViewType.inbox,
                        objectId: "inboxView:1",
                        mock$sourceObjectId: "folder:1",
                        isPinnedToNavPane: true
                    },
                    {
                        accountId: "account:1",
                        type: Plat.MailViewType.sentItems,
                        objectId: "sentItemsView:1",
                        mock$sourceObjectId: "folder:2",
                        isPinnedToNavPane: true
                    },
                    {
                        accountId: "account:1",
                        type: Plat.MailViewType.userGeneratedFolder,
                        objectId: "customView:1",
                        mock$sourceObjectId: "folder:3",
                        isPinnedToNavPane: true
                    }
                ]
            }
        }, D.MethodHandlers);

        var platform = provider.getClient(),
            platformAccount = provider.getObjectById("account:1"),
            account = new Mail.Account(platformAccount, platform),
            selection = {
                account: account,
                view: new Mail.UIDataModel.MailView(provider.getObjectById(option.selectedViewId), account),
                mockedType: Mail.Selection
            };

        Jx.mix(selection, Jx.Events);
        Debug.Events.define(selection, "navChanged");

        // setup the options
        var accountResource = platformAccount.getResourceByType(Plat.ResourceType.mail);
        accountResource.canServerSearchAllFolders = option.canServerSearchAllFolders;
        selection.view.canServerSearch = option.canServerSearchView;

        // setup the host
        var host = document.createElement("div");
        host.innerHTML = "<div class='comboboxText'/><div class='comboboxArrow'/>";
        switcher = new Mail.SearchScopeSwitcher(selection, host);
    }


    Tx.test("ScopeSwitcher_Unittest.init_allFolderSearchEnabled", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            selectedViewId: "inboxView:1",
            canServerSearchAllFolders: true,
            canServerSearchView: true
        });

        tc.areEqual(switcher.current.name, "Inbox");
        tc.areEqual(switcher.upsell.name, Jx.res.getString("mailMessageListSearchComboDropdownAllFolders"));
        tc.isTrue(switcher.canUpsell());

    });

    Tx.test("ScopeSwitcher_Unittest.init_allFolderSearchDisabled_inbox", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            selectedViewId: "inboxView:1",
            canServerSearchAllFolders: false,
            canServerSearchView: true
        });

        tc.areEqual(switcher.current.name, "Inbox");
        tc.areEqual(switcher.current.description, Jx.res.loadCompoundString("mailMessageListSearchComboText", "Inbox"));
        tc.areEqual(switcher.upsell, null);
        tc.isTrue(!switcher.canUpsell());
    });

    Tx.test("ScopeSwitcher_Unittest.init_allFolderSearchDisabled_sentItems", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            selectedViewId: "sentItemsView:1",
            canServerSearchAllFolders: false,
            canServerSearchView: true
        });

        tc.areEqual(switcher.current.name, "Sent");
        tc.isTrue(switcher.canUpsell());
    });

    Tx.test("ScopeSwitcher_Unittest.rescope", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            selectedViewId: "inboxView:1",
            canServerSearchAllFolders: true,
            canServerSearchView: true
        });

        switcher.rescopeToUpsell();
        tc.areEqual(switcher.current.name, Jx.res.getString("mailMessageListSearchComboDropdownAllFolders"));
        tc.isTrue(!switcher.canUpsell());
    });

    Tx.test("ScopeSwitcher_Unittest.viewNameChanges", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            selectedViewId: "customView:1",
            canServerSearchAllFolders: true,
            canServerSearchView: true
        });

        tc.areEqual(switcher.current.name, "before");
        var folder = provider.getObjectById("folder:3");
        folder.mock$setProperty("folderName", "after");

        var comboBox = switcher._comboBox,
            name = comboBox._menuItems[comboBox.value].text;
        tc.areEqual(name, "after");
    });
})();
