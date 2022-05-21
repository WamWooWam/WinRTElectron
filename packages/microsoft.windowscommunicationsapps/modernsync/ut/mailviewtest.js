
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Mail View functionality for different views

(function() {

    var wl;
    var platform;
    var accountManager;
    var folderManager;
    var mailManager;
    var account;
    var mailChangeHandler;
    var viewAggregationService;
    
    function setup() {
        wl = Microsoft.WindowsLive.Platform;

        platform = SetupPlatform();
        accountManager = platform.client.accountManager;
        folderManager = platform.client.folderManager;
        mailManager = platform.client.mailManager;

        // Create a clean account for every test run
        account = accountManager.defaultAccount.createConnectedAccount("mailtest2011" + Math.random() +"@example.com");
        account.commit();

        mailChangeHandler = platform.requestServiceResources("mailChangeHandler");
        viewAggregationService = platform.requestServiceResources("viewAggregator");
    }

    function cleanup() {
        account.deleteObject();
        account = null;

        platform.dispose();
        platform = null;
        
        accountManager = null;
        folderManager = null;
        mailManager = null;
        mailChangeHandler = null;
        viewAggregationService = null;
    }

    // verify the getMessages return correct messages for folder view with different filters
    Tx.test("MailManagerTest.testFolderViewMessages", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var folder = folderManager.createFolder(account);
        tc.isNotNull(folder, "Failed to create folder");

        folder.folderName = "ExampleFolder" + (new Date()).getTime();
        folder.folderType = wl.FolderType.mail;
        folder.commit();

        var folderView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.userGeneratedFolder, account.objectId, folder.objectId);
        tc.isNotNull(folderView, "Failed to get view for folder");

        var msgs = folderView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.all);

        var collectionChangeListener = new CollectionListener(msgs);
        msgs.unlock();

        var msg1, msg2, msg3;

        // create three messages, two unread, one read
        var createMessages = function () {
            msg1 = CreateGenericMessage(account, mailManager, "Peterborough", folder, false);
            msg2 = CreateGenericMessage(account, mailManager, "Kingston", folder, false);
            msg3 = CreateGenericMessage(account, mailManager, "Kitchener", folder, true);
        }

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, createMessages, wl.CollectionChangeType.itemAdded, 3), "Expected Number of collection change events were not fired after insert");

        // verify the count
        tc.areEqual(msgs.count, 3, "wrong count on message collection");

        // verify unread filter
        var unreadMessages = folderView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.unread);
        tc.areEqual(unreadMessages.count, 2, "wrong count on unread message collection");

        var listener2 = new CollectionListener(unreadMessages);
        unreadMessages.unlock();

        // verify keep in view
        var ids = [msg1.objectId];
        var expected = true;
        var fired = false;

        function onObjectChange(ev) {
            var msg = ev.target;
            if (msg.read == expected) {
                fired = true;
            }
        }

        // add listener to message 1 for read property change
        msg1.addEventListener("changed", onObjectChange);
        mailManager.batchChange(unreadMessages, folderView.objectId, Microsoft.WindowsLive.Platform.MailMessageChangeOperation.markAsRead, ids);

        var count = 0;
        while (!fired && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, msg1.read, "read property on msg1 is wrong");

        // wait for the unread change on message
        tc.areEqual(unreadMessages.count, 2, "wrong count on unread message collection after batch change");
        msg1.removeEventListener("changed", onObjectChange);
    }); 

    // verify the getConversations return correct conversations for folder view with different filters
    Tx.test("MailManagerTest.testFolderViewConversations", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var folder = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        tc.isNotNull(folder, "Setup failed");

        var folderView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.inbox, account.objectId, folder.objectId);
        tc.isNotNull(folderView, "Failed to get view for folder");

        var conversations = folderView.getConversations(Microsoft.WindowsLive.Platform.FilterCriteria.all);

        var collectionChangeListener = new CollectionListener(conversations);
        conversations.unlock();

        var msg1, msg2, msg3;

        // create 3 messages, which should create 3 conversations
        var createMessages = function () {
            msg1 = CreateGenericMessage(account, mailManager, "Peterborough", folder, false);
            msg2 = CreateGenericMessage(account, mailManager, "Kingston", folder, false);
            msg3 = CreateGenericMessage(account, mailManager, "Kitchener", folder, true);
        }

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, createMessages, wl.CollectionChangeType.itemAdded, 3), "Expected Number of collection change events were not fired after insert");

        // verify the count
        tc.areEqual(conversations.count, 3, "wrong count on conversation collection");

        // verify unread filter
        var unreadConversations = folderView.getConversations(Microsoft.WindowsLive.Platform.FilterCriteria.unread);
        tc.areEqual(unreadConversations.count, 2, "wrong count on unread message collection");

        var listener2 = new CollectionListener(unreadConversations);
        unreadConversations.unlock();

        // verify keep in view
        var conversation1 = unreadConversations.item(0);
        var ids = [conversation1.objectId];
        var expected = true;
        var fired = false;

        function onObjectChange(ev) {
            var conv = ev.target;
            if (conv.read == expected) {
                fired = true;
            }
        }

        // add listener to message 1 for read property change
        conversation1.addEventListener("changed", onObjectChange);
        tc.areEqual(false, conversation1.read, "conversation should be unread");
        mailManager.batchChange(unreadConversations, folderView.objectId, Microsoft.WindowsLive.Platform.MailMessageChangeOperation.markAsRead, ids);

        var count = 0;
        while (!fired && count < 200) {
            count++;
            if (conversation1.read == expected) {
                break;
            }
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, conversation1.read, "read property on msg1 is wrong");
        
        tc.areEqual(unreadConversations.count, 2, "wrong count on unread conversation collection after read messages");
        conversation1.removeEventListener("changed", onObjectChange);

    });

    // verify for user generated folder, the notificationCount is aggregated as unread count
    Tx.test("MailManagerTest.testFolderViewAggregation", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var folder = folderManager.createFolder(account);
        tc.isNotNull(folder, "Failed to create folder");

        folder.folderName = "ExampleFolder" + (new Date()).getTime();
        folder.folderType = wl.FolderType.mail;
        folder.commit();

        var folderView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.userGeneratedFolder, account.objectId, folder.objectId);
        tc.isNotNull(folderView, "Failed to get view for folder");

        var msg1, msg2, msg3;
        var fired = false;
        var expected = 0;

        function onObjectChange(ev) {
            var view = ev.target;
            if (view.notificationCount == expected) {
                fired = true;
            }
        }

        // insert 3 messages verify the count is updated correctly
        // add listener to folder view for notification Count
        folderView.addEventListener("changed", onObjectChange);

        msg1 = CreateGenericMessage(account, mailManager, "Peterborough", folder, false);
        msg2 = CreateGenericMessage(account, mailManager, "Kingston", folder, false);
        msg3 = CreateGenericMessage(account, mailManager, "Kitchener", folder, true);

        // there should be 2 unread messages
        expected = 2;
        var count = 0;
        while (!fired && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, folderView.notificationCount, "notification count is wrong");

        // change the unread count of msg3 verify the notiifcation count is updated correctly
        fired = false;
        count = 0;
        expected = 3;
        msg3.read = false;
        msg3.commit();

        // verify we receive a notification
        while (fired != 1 && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, folderView.notificationCount, "notification count is wrong");

        // delete the message, verify the notification count is updated
        fired = false;
        count = 0;
        expected = 2;
        msg3.deleteObject();

        // verify we receive a notification
        while (fired != 1 && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, folderView.notificationCount, "notification count is wrong");

        folderView.removeEventListener("changed", onObjectChange);

    });

    // verify for draft view, the notification count is aggregated as total count
    Tx.test("MailManagerTest.testDraftViewAggregation", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var inboxView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.inbox, account.objectId, "");
        tc.isNotNull(folderView, "Failed to get view for folder");

        var folderView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.draft, account.objectId, "");
        tc.isNotNull(folderView, "Failed to get view for folder");

        var msg1, msg2, msg3;
        var fired = false;
        var expected = 0;

        function onObjectChange(ev) {
            var view = ev.target;
            if (view.notificationCount == expected) {
                fired = true;
            }
        }

        // add listener to folder view for notification Count
        folderView.addEventListener("changed", onObjectChange);

        msg1 = mailManager.createDraftMessage(inboxView);
        msg2 = mailManager.createDraftMessage(inboxView);
        
        msg1.commit();
        msg2.commit();

        var count = 0;
        expected = 2;

        while (!fired && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, folderView.notificationCount, "notification count is wrong");

        // verify message delete
        var ids = [msg2.objectId];
        mailManager.batchDelete(ids);
        count = 0;
        fired = false;
        expected = 1;
        while (!fired && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, folderView.notificationCount, "notification count is wrong");
        folderView.removeEventListener("changed", onObjectChange);

    });

})();