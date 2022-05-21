
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Microsoft,Chat,Mocks*/

(function () {

    var Plat = Microsoft.WindowsLive.Platform;
    var MP = Mocks.Microsoft.WindowsLive.Platform;
    var testInfo = { owner: "tonypan", priority: 0 };
    var outboxMonitor = null;
    var checkedMessages = { };
    var messagesByAccount = { };
    var accounts = null;
    var provider = null;

    function setup (tc) {
        checkedMessages = { };
        messagesByAccount = { };

        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.initGlobals();

        provider = new MP.Data.JsonProvider({
            Account: {
                all: [ { objectId: "account0" }, { objectId: "account1" } ]
            },
            Folder: {
                all: [ { objectId: "folder0", specialMailFolderType: Plat.MailFolderType.outbox },
                       { objectId: "folder1", specialMailFolderType: Plat.MailFolderType.outbox } ]
            },
            MailView: {
                all: [ { accountId: "account0", objectId: "outbox0", type: Plat.MailViewType.outbox, mock$sourceObjectId: "folder0" },
                       { accountId: "account1", objectId: "outbox1", type: Plat.MailViewType.outbox, mock$sourceObjectId: "folder1" } ]
            },
            MailMessage: {
                all: [ { objectId : "message00", displayViewIds: [ "outbox0" ] },
                       { objectId : "message01", displayViewIds: [ "outbox0" ] },
                       { objectId : "message10", displayViewIds: [ "outbox1" ] },
                       { objectId : "message11", displayViewIds: [ "outbox1" ] } ]
            }
        });

        accounts = new MP.Collection("Account");
        accounts.mock$addItem(provider.getObjectById("account0"), 0);

        var messagesOutbox0 = new MP.Collection("MailMessage");
        messagesOutbox0.mock$addItem(provider.getObjectById("message00"), 0);

        var messagesOutbox1 = new MP.Collection("MailMessage");
        messagesOutbox1.mock$addItem(provider.getObjectById("message10"), 0);
        messagesOutbox1.mock$addItem(provider.getObjectById("message11"), 0);

        messagesByAccount.account0 = messagesOutbox0;
        messagesByAccount.account1 = messagesOutbox1;

        Mail.Globals.platform = {
            accountManager: {
                getConnectedAccountsByScenario: function () { return accounts; }
            },
            mailManager: {
                ensureMailView: function (type, accountId) { return { getMessages: function () { return messagesByAccount[accountId]; } }; }
            },
            mockedType: Microsoft.WindowsLive.Platform.Client
        };

        outboxMonitor = new Mail.OutboxMonitor();
        outboxMonitor.init(
            { mockedType: Chat.MessageBar },
            Mail.Globals.platform,
            {
                init: Jx.fnEmpty,
                dispose: Jx.fnEmpty,
                queueType: Plat.OutboxQueue.sendMail,
                removeAccount: Jx.fnEmpty,
                removeMessage: Jx.fnEmpty,
                checkForError: function (message) { checkedMessages[message.objectId] = true; },
                subscribedProperties: [ "syncStatus" ],
                mockedType: Mail.OutboxQueueHandlerBase
            }
        );

        tc.addCleanup(function () {
            Mail.UnitTest.restoreJx();
            Mail.UnitTest.disposeGlobals();
            checkedMessages = { };
            messagesByAccount = { };
            accounts = null;
            provider = null;
            outboxMonitor.dispose();
            outboxMonitor = null;
        });
    }

    Tx.test("OutboxMonitor_UnitTest.test_InitialMessage", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(checkedMessages.message00);

        checkedMessages.message00 = false;
        var message00 = provider.getObjectById("message00");
        message00.syncStatus = -123456;
        message00.commit();

        tc.isTrue(checkedMessages.message00);
    });

    Tx.test("OutboxMonitor_UnitTest.test_NewMessage", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(!checkedMessages.message01);

        messagesByAccount.account0.mock$addItem(provider.getObjectById("message01"), 1);

        tc.isTrue(!checkedMessages.message01);

        var message01 = provider.getObjectById("message01");
        message01.syncStatus = -123456;
        message01.commit();

        tc.isTrue(checkedMessages.message01);
    });

    Tx.test("OutboxMonitor_UnitTest.test_NewAccount", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(!checkedMessages.message10);
        tc.isTrue(!checkedMessages.message11);

        accounts.mock$addItem(provider.getObjectById("account1"), 1);

        tc.isTrue(checkedMessages.message10);
        tc.isTrue(checkedMessages.message11);
    });

    Tx.test("OutboxMonitor_UnitTest.test_RemovedMessage", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(checkedMessages.message00);

        checkedMessages.message00 = false;
        messagesByAccount.account0.mock$removeItem(0);
        var message00 = provider.getObjectById("message00");
        message00.syncStatus = -123456;
        message00.commit();

        tc.isFalse(checkedMessages.message00);
    });

    Tx.test("OutboxMonitor_UnitTest.test_RemovedAccount", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(checkedMessages.message00);

        checkedMessages.message00 = false;
        accounts.mock$removeItem(0);
        var message00 = provider.getObjectById("message00");
        message00.syncStatus = -123456;
        message00.commit();

        tc.isFalse(checkedMessages.message00);
    });

    Tx.test("OutboxMonitor_UnitTest.test_ResetMessages", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(checkedMessages.message00);

        checkedMessages.message00 = false;
        messagesByAccount.account0.mock$suspendNotifications();
        messagesByAccount.account0.mock$addItem(provider.getObjectById("message01"), 1);
        messagesByAccount.account0.mock$resumeNotifications();

        tc.isTrue(checkedMessages.message00);
    });

    Tx.test("OutboxMonitor_UnitTest.test_ResetAccounts", testInfo, function (tc) {
        setup(tc);

        tc.isTrue(checkedMessages.message00);
        tc.isTrue(!checkedMessages.message10);
        tc.isTrue(!checkedMessages.message11);

        checkedMessages.message00 = false;
        accounts.mock$suspendNotifications();
        accounts.mock$addItem(provider.getObjectById("account1"), 1);
        accounts.mock$resumeNotifications();

        tc.isTrue(checkedMessages.message00);
        tc.isTrue(checkedMessages.message10);
        tc.isTrue(checkedMessages.message11);
    });

})();
