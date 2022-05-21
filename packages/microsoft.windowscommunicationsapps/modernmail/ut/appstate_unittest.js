
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {
    var Plat = Microsoft.WindowsLive.Platform;
    var D = Mocks.Microsoft.WindowsLive.Platform.Data;

    var provider = new D.JsonProvider({
            Account: {
                all: [
                    {
                        objectId : "defaultAccount",
                        mailScenarioState: Plat.ScenarioState.connected,
                    }, {
                        objectId : "foo",
                        mailScenarioState: Plat.ScenarioState.connected,
                    }, {
                        objectId : "account2",
                        mailScenarioState: Plat.ScenarioState.connected,
                    }
                ]
            },
            MailView: {
                all: [
                    {
                        objectId: "inboxView",
                        accountId: "defaultAccount",
                        type: Plat.MailViewType.inbox,
                        mock$sourceObjectId: "inboxFolder"
                    }, {
                        objectId: "draftsView",
                        accountId: "defaultAccount",
                        type: Plat.MailViewType.draft,
                        mock$sourceObjectId: "draftsFolder"
                    }, {
                        objectId : "otherView",
                        accountId : "defaultAccount",
                        type: Plat.MailViewType.userGeneratedFolder,
                        mock$sourceObjectId: "otherFolder"
                    }, {
                        objectId : "desiredView",
                        accountId : "foo",
                        type: Plat.MailViewType.userGeneratedFolder,
                        mock$sourceObjectId: "desiredFolder"
                    }, {
                        objectId : "viewFromAccount2",
                        accountId : "account2",
                        type: Plat.MailViewType.userGeneratedFolder,
                        mock$sourceObjectId: "folderFromAccount2"
                    }
                ]
            },
            Folder: {
                all: [
                    {
                        objectId : "inboxFolder",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.inbox,
                        accountId : "defaultAccount",
                    }, {
                        objectId : "draftsFolder",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.drafts,
                        accountId : "defaultAccount",
                    }, {
                        objectId : "otherFolder",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        accountId : "defaultAccount",
                    }, {
                        objectId : "desiredFolder",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        accountId : "foo",
                    }, {
                        objectId : "calendarFolder",
                        folderType: Plat.FolderType.calendar,
                        accountId : "foo",
                    }, {
                        objectId : "folderFromAccount2",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        accountId : "account2",
                    }
                ]
            },
            MailMessage: {
                all: [
                    {
                        objectId : "desiredMessage",
                        displayViewIds: ["desiredView"],
                        accountId: "foo"
                    }, {
                        objectId : "messageFromFolder2",
                        displayViewIds: ["viewFromAccount2"],
                        accountId: "account2"
                    }, {
                        objectId : "draftMessage",
                        displayViewIds: ["draftsView"],
                        accountId: "defaultAccount"
                    }
                ]
            }
        }, D.MethodHandlers);

    var platform = provider.getClient();

    function expect(accountId, viewId, messageId) {
        return {
            accountId: accountId,
            viewId: viewId,
            messageId: messageId,
        };
    }

    function container(data) {
        return {
            container: function () {
                return {
                    get: function () { return data; },
                    set: Jx.fnEmpty,
                    remove: Jx.fnEmpty,
                };
            }
        };
    }

    function serialize(accountId, viewId, messageId) {

        var view = provider.getObjectById(viewId);

        return JSON.stringify({
            accountId: accountId,
            viewId: viewId,
            viewType: view ? view.type : -1,
            messageId: messageId
        });
    }

    function setup(tc) {
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.Globals.platform = platform;
        tc.cleanup = function () {
            Mail.Globals.platform = null;
            Mail.UnitTest.restoreJx;
        }
    }

    Tx.test("AppState.hydration", function (tc) {
        setup(tc);

        [
            { name:"empty hydration",   expect: expect("defaultAccount", "inboxView"),          settings: container("") },
            { name:"account only",      expect: expect("defaultAccount", "inboxView"),          settings: container(serialize("foo", "")) },
            { name:"invalid view",      expect: expect("defaultAccount", "inboxView"),          settings: container(serialize("foo", "invalid")) },
            { name:"view only",         expect: expect("defaultAccount", "inboxView"),          settings: container(serialize("", "draftsView")) },
            { name:"invalid account",   expect: expect("defaultAccount", "inboxView"),          settings: container(serialize("invalid", "otherView")) },
            { name:"other view",        expect: expect("defaultAccount", "otherView"),          settings: container(serialize("defaultAccount", "otherView")) },
            { name:"drafts view",       expect: expect("defaultAccount", "draftsView"),         settings: container(serialize("defaultAccount", "draftsView")) },
            { name:"foo desired",       expect: expect("foo", "desiredView"),                   settings: container(serialize("foo", "desiredView")) },
            { name:"mismatch view",     expect: expect("defaultAccount", "inboxView"),          settings: container(serialize("foo", "draftsView")) },
            { name:"invalid message",   expect: expect("account2", "viewFromAccount2"),         settings: container(serialize("account2", "viewFromAccount2", "invalid")) },
            { name:"everything",        expect: expect("foo", "desiredView", "desiredMessage"), settings: container(serialize("foo", "desiredView", "desiredMessage")) },
            { name:"corrupt hydration", expect: expect("defaultAccount", "inboxView"),          settings: container("foo = bar") }
        ]
        .forEach(function (test) {
            var defaultAccount = new Mail.Account(provider.getObjectById("defaultAccount"), platform),
                appState = new Mail.AppState(platform, {}, defaultAccount, test.settings);
            tc.areEqual(appState.selectedAccount.objectId, test.expect.accountId, test.name);
            tc.areEqual(appState.getStartupView().platformMailView.objectId, test.expect.viewId, test.name);

            if (test.expect.messageId) {
                tc.areEqual(appState.lastSelectedMessage.objectId, test.expect.messageId, test.name);
            } else {
                tc.areEqual(appState.lastSelectedMessage, null, test.name);
            }
        });
    });

})();
