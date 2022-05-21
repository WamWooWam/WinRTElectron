
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Mail manager functionality

(function() {

    var wl;
    var platform;
    var accountManager;
    var folderManager;
    var mailManager;
    var account;

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
    }

    function cleanup() {
        account.deleteObject();
        account = null;

        platform.dispose();
        platform = null;

        accountManager = null;
        folderManager = null;
        mailManager = null;
    }

    // Verify creating a new message succeeds
    Tx.test("MailManagerTest.testCreateMessage", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var inbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        tc.isNotNull(inbox, "Setup failed");

        var newMessage = mailManager.createMessageInFolder(inbox);

        newMessage.subject = "TheUsualSubjects";

        tc.isNotNull(newMessage.folder, "New messages should have a folder");

        tc.areEqual(newMessage.modified, null, "Invalid dates should return null objects");
    });

    // Verify that getting the collection of message in a folder works correctly
    Tx.test("MailManagerTest.testMessageCollection", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var inbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        var inboxView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.inbox, account.objectId, "");
        var inboxMsgs = inboxView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.all);
        inboxMsgs.unlock();
        var collectionChangeListener = new CollectionListener(inboxMsgs);
        var inboxPrevCount = inboxMsgs.count;

        var msg1, msg2, msg3;

        var createMessages = function()
        {
            msg1 = CreateGenericMessage(account, mailManager, "Peterborough", inbox, true);
            msg2 = CreateGenericMessage(account, mailManager, "Kingston", inbox, true);
            msg3 = CreateGenericMessage(account, mailManager, "Kitchener", inbox, true);
        }

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, createMessages, wl.CollectionChangeType.itemAdded, 3), "Expected Number of collection change events were not fired after insert");

        var deleteMessages = function()
        {
            msg1.deleteObject();
            msg2.deleteObject();
            msg3.deleteObject();
        }
        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform,deleteMessages, wl.CollectionChangeType.itemRemoved, 3), "Expected Number of collection change events were not fired after delete");

        tc.areEqual(inboxPrevCount, inboxMsgs.count, " Incorrect number of messages after delete");

        var inboxMsgs2 = inboxView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.all);
        tc.areEqual(inboxPrevCount, inboxMsgs2.count, "Incorrect number of messages after delete ");

        collectionChangeListener.dispose();
        inboxMsgs.dispose();
    });

    // Verify getting the collection of unread messages works correctly
    Tx.test("MailManagerTest.testUnreadMessageCollection", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var inbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        var drafts = folderManager.getSpecialMailFolder(account, wl.MailFolderType.drafts);

        // 3 unread messages in inbox, 2 read
        // 1 unread message in drafts, 1 read
        var msg = new Array();
        msg[0] = CreateGenericMessage(account, mailManager, "Finch", inbox, false);
        msg[1] = CreateGenericMessage(account, mailManager, "North York", inbox, false);
        msg[2] = CreateGenericMessage(account, mailManager, "Sheppard", inbox, false);
        msg[3] = CreateGenericMessage(account, mailManager, "York Mills", inbox, true);
        msg[4] = CreateGenericMessage(account, mailManager, "Lawrence", inbox, true);
        msg[5] = CreateGenericMessage(account, mailManager, "Eglinton", drafts, false);
        msg[6] = CreateGenericMessage(account, mailManager, "Davisville", drafts, true);

        // Verify unread count

        var draftView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.draft, account.objectId, "");
        var inboxView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.inbox, account.objectId, "");

        var inboxUnreadMsgs = inboxView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.unread);
        tc.areEqual(3, inboxUnreadMsgs.count, " Incorrect number of unread messages in the inbox folder");

        var draftsUnreadMsgs = draftView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.unread);
        tc.areEqual(1, draftsUnreadMsgs.count, " Incorrect number of unread messages in the drafts folder");

        // Verify notifications
        inboxUnreadMsgs.unlock();
        draftsUnreadMsgs.unlock();
        var collectionChangeListener = new CollectionListener(inboxUnreadMsgs);

        var addUnreadMessage = function()
        {
            msg[7] = CreateGenericMessage(account, mailManager, "St. Clair", inbox, false);
        }
        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, addUnreadMessage, wl.CollectionChangeType.itemAdded, 1), "Unread collection didn't fire notification");

        tc.areEqual(4, inboxUnreadMsgs.count, "Incorrect number of unread messages in the inbox folder after adding");

        // Clean up
        var cleanupMessages = function ()
        {
            for (var i = 0; i < msg.length; i++)
            {
                msg[i].deleteObject();
            }
        }

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, cleanupMessages, wl.CollectionChangeType.itemRemoved, 4), "Unread collection didn't fire notification");
    });

    // Verify that MailBody related properties is updated correctly when adding a body and cloning a message
    Tx.test("MailManagerTest.testMailBodies", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var msg = mailManager.createMessage(account);
        msg.subject = "Testing Mail Body";

        // Test initial case
        tc.isFalse(msg.hasBody(wl.MailBodyType.html), "message should not have a html body");
        tc.isFalse(msg.hasBody(wl.MailBodyType.plainText), "message should not have a plain text body");

        // Test new HTML body
        var newBody = msg.createBody();

        newBody.type = wl.MailBodyType.html;
        tc.areEqual(wl.MailBodyType.html, newBody.type, "the type for the body should be html");

        // Split across multiple lines as otherwise some editors (e.g. Source Insight) will fail because the line is too long.
        var reallyLongBodyHTML =
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
            "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";

        newBody.body = reallyLongBodyHTML;
        tc.areEqual(reallyLongBodyHTML, newBody.body, "message bodies don't match");

        // Test getBody_ByType before committing
        var msgNewHtmlBody = msg.getBody(wl.MailBodyType.html);
        tc.areEqual(wl.MailBodyType.html, msgNewHtmlBody.type, "html body was not found after creating it");

        // Test hasBody
        msg.commit();
        tc.isTrue(msg.hasBody(wl.MailBodyType.html), "HTML body?");
        tc.isFalse(msg.hasBody(wl.MailBodyType.plainText), "Plain text body");

        var newPlainText = msg.createBody();
        newPlainText.type = wl.MailBodyType.plainText;
        var plainTextBody = "Hello Plain Text World";
        newPlainText.body = plainTextBody;
        msg.commit();
        tc.isTrue(msg.hasBody(wl.MailBodyType.html), "html body?");

        // Test getBody
        var msgBodyGet = msg.getBody();
        tc.areEqual(wl.MailBodyType.html, msgBodyGet.type, "expected message type not found");

        var msgBodyGetHtml = msg.getBody(wl.MailBodyType.html);
        tc.areEqual(wl.MailBodyType.html, msgBodyGetHtml.type, "html body was not found");
        tc.areEqual(reallyLongBodyHTML, msgBodyGetHtml.body,"html bodies don't match");

        var msgBodyGetPlainText = msg.getBody(wl.MailBodyType.plainText);
        tc.areEqual(wl.MailBodyType.plainText, msgBodyGetPlainText.type, "Plain text body not found on the message");
        tc.areEqual(plainTextBody, msgBodyGetPlainText.body, "Body text for plain text body does not match");

        // Test commit
        msg.commit();
        tc.areNotEqual("0", msg.objectId, "message was not assigned an id");

        // Test clone
        var inboxView = mailManager.ensureMailView(wl.MailViewType.inbox, account.objectId, "");
        var clone = msg.cloneMessage(false, wl.MailMessageLastVerb.unknown, inboxView);
        tc.areEqual(msg.subject, clone.subject, "subject for the cloned message is different from the original subject");

        clone.commit();
        tc.areNotEqual(msg.objectId, clone.objectId, "message id is the same for the original and cloned message");

        // Test clone bodies
        tc.isTrue(clone.hasBody(wl.MailBodyType.html), "Clone HTML body");
        tc.isTrue(clone.hasBody(wl.MailBodyType.plainText), "Clone Plain Text body");
        var cloneBody = clone.getBody(wl.MailBodyType.html);

        msg.deleteObject();
        clone.deleteObject();
    });

    // Verify moving a message to a different account works correctly
    Tx.test("MailManagerTest.testMailMessageAccountMoves", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var accountOther = accountManager.defaultAccount.createConnectedAccount("mailtest2012"  + Math.random() + "@example.com");
        accountOther.commit();

        var drafts = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.draft, account.objectId, "");
        var draftsOther = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.draft, accountOther.objectId, "");

        var msg = null;
        msg = mailManager.createMessage(account);

        tc.isTrue(msg.isInSpecialFolderType(wl.MailFolderType.drafts), "message should be in the drafts folder");

        // Test move to another account
        function moveMessage() {
            msg.accountId = accountOther.objectId;
            msg.commit();
        }

        var messages = draftsOther.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.all);
        messages.unlock();
        var collectionChangeListener = new CollectionListener(messages);

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, moveMessage, wl.CollectionChangeType.itemAdded, 1), "Expected Number of collection change events were not fired after move");

        tc.areEqual(msg.accountId, accountOther.objectId, "account property not set");
        tc.areEqual(msg.displayViewIds[0], draftsOther.objectId, "message was not moved to the other drafts folder");

        // Test invalid account move from an invalid folder, e.g. inbox
        var inbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        var messageInbox = mailManager.createMessageInFolder(inbox);

        try
        {
            messageInbox.accountId = accountOther;
            tc.fail("Account move should have failed");
        }
        catch (e)
        {
            if (typeof e.number === 'undefined') throw e;
        }

        // Cleanup
        accountOther.deleteObject();
    });

    // Verify that getting the collection of message with particular sanitized version works correctly
    Tx.test("MailManagerTest.testMessageCollectionBySanitizedVersion", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var sanitizedMsgs = mailManager.getMessageCollectionBySanitizedVersion(wl.SanitizedVersion.NotSanitized);
        var collectionChangeListener = new CollectionListener(sanitizedMsgs);
        sanitizedMsgs.unlock();
        var currentCount = sanitizedMsgs.count;

        var msg1, msg2, msg3;

        var createMessages = function()
        {
            msg1 = CreateGenericMessage(account, mailManager, "Peterborough", null, true);
            msg2 = CreateGenericMessage(account, mailManager, "Kingston", null, true);
            msg3 = CreateGenericMessage(account, mailManager, "Kitchener", null, true);
        }

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, createMessages, wl.CollectionChangeType.itemAdded, 3), "Expected Number of collection change events were not fired after insert");
        tc.areEqual(currentCount + 3, sanitizedMsgs.count, "Incorrect number of un-sanitized messages after insert");

        var addSanitizedBody = function()
        {
            var sanitizedBody = msg1.createBody();
            sanitizedBody.type = wl.MailBodyType.sanitized;
            sanitizedBody.body = "Sanitized body";
            msg1.sanitizedVersion = wl.SanitizedVersion.current;
            msg1.commit();
        }

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, addSanitizedBody, wl.CollectionChangeType.itemRemoved, 1), "Expected Number of collection change events were not fired after adding sanitized body");

        tc.areEqual(currentCount+2, sanitizedMsgs.count, " Incorrect number of messages after delete");

        collectionChangeListener.dispose();
        sanitizedMsgs.dispose();
    });


    // Verify that waitForInstanceNumberOnMessage API - unfortunately, this doesn't truly test the functionality since that requires having 2 different backing StoreObjectManagers.
    // Instead, this is a sanity test to make sure the API doesn't crash and do something unexpected.
    Tx.asyncTest("MailManagerTest.testWaitForInstanceNumberOnMessage", function (tc) {
        tc.cleanup = cleanup;
        setup();

        // Create 1 message
        var msg1 = mailManager.createMessage(account);
        msg1.commit();

        // Get the instance number of the message
        var instNumber = msg1.instanceNumber;

        // Load the message into a separate object via waitForInstanceNumberOnMessage
        tc.stop();
        mailManager.waitForInstanceNumberOnMessage(msg1.objectId, instNumber).done(function () {
            var msg2 = mailManager.loadMessage(msg1.objectId);

            // Verify that the message we get has the instance number that we requested
            tc.areEqual(msg2.instanceNumber, instNumber);
            tc.start();
        });
    });
})();
