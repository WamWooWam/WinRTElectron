
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Mail message functionality

(function() {

    var wl;
    var mailtest;
    var platform;
    var accountManager;
    var folderManager;
    var mailManager;
    var account;

    function setup() {
        wl = Microsoft.WindowsLive.Platform;
        mailtest = Platform.TestApi.Mail;

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

    // Verify basic functionalities of MailMessage properties:
    //    - A newly created MailMessage is instantiated with the correct default value
    //    - Setting inproper value to a property throws an exception
    //    - Setting uber long subject does not crash the app
    Tx.test("MailMessageTest.testMailMessageProperties", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var msg = null;

        var inbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        tc.isNotNull(inbox,"setup failed");

        var outbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.outbox);
        tc.isNotNull(outbox,"setup failed");

        msg = mailManager.createMessage(account);

        var utc = new Date(0);
        utc.setUTCFullYear(1601);

        tc.areEqual("", msg.subject, "message subject is non empty");
        tc.areEqual("", msg.from, "from is not empty");
        tc.areEqual("", msg.replyTo, "reply to is not empty");
        tc.areEqual("", msg.sender, "sender is not empty");
        tc.areEqual("", msg.preview, "message preview is not empty");
        tc.areEqual("0", msg.objectId, "object id is not zero");
        tc.areEqual(null, msg.sent, "sent time is not null");
        tc.isFalse(msg.hasAttachments, "message should not have any attachments");
        tc.areEqual(0, msg.syncStatus, "message should have no sync status");
        tc.isNotNull(msg.folder, "New messages should have a default folder");
        tc.isNull(msg.calendarEvent, "CalendarEvent should be null if there is no attached calendar info or UID");

        // Make sure a modified date is set
        msg.commit();
        tc.isFalse((utc.toUTCString() == msg.modified.toUTCString()), "modified time is zero, it should've been set");

        // Long subject should automatically truncate to 1024 characters
        // Bug 158533 - add verification on the actual truncated subject
        msg.subject = "3000+ long subject 1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345607890";
        msg.commit();

        msg.deleteObject();
    });

    // Verify that the LastVerb property on the source message is updated correctly when a reply message is sent
    Tx.test("MailMessageTest.testMailMessageLastVerb", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var inboxView = mailManager.ensureMailView(wl.MailViewType.inbox, account.objectId, "");
        var outbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.outbox);
        var sourceMessage = CreateGenericMessage(account, mailManager, "Source Message Test", null, true);
        var cloneVerb = wl.MailMessageLastVerb.replyToSender;

        // Create a reply clone and save to drafts
        var replyClone = sourceMessage.cloneMessage(false, cloneVerb, inboxView);
        tc.isTrue(replyClone.isInSpecialFolderType(wl.MailFolderType.drafts), "The message should've been created in the drafts folder");

        replyClone.commit();

        // Verify the source message hasn't changed
        tc.areEqual(sourceMessage.lastVerb, 0, "Source message last verb should not be defined");

        // Reload clone and put it in the outbox
        replyClone = mailManager.loadMessage(replyClone.objectId);
        replyClone.moveToOutbox();
        replyClone.commit();

        sourceMessage = mailManager.loadMessage(sourceMessage.objectId);
        tc.areEqual(sourceMessage.lastVerb, cloneVerb, "Source message last verb was not set");

        // Do another clone, but this time delete the source before putting it in the outbox
        var secondClone = sourceMessage.cloneMessage(false, cloneVerb, inboxView);

        sourceMessage.deleteObject();

        secondClone.moveToOutbox();
        secondClone.commit();

        // Done, clean up
        replyClone.deleteObject();
        secondClone.deleteObject();
    });

    // Verify that basic recipient parsing is correct. This is a sanity test, more comprehensive test are in the mime unit tests.
    Tx.test("MailMessageTest.testMailMessageRecipients", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var testMessage = CreateGenericMessage(account, mailManager, "Recipient Message Test", null, true);

        testMessage.from = "charlie@theunicorn.com";
        testMessage.to = "\"test test\" <test@test.com>;joe@example.com";
        testMessage.cc = "\"Giant; \\\"Big\\\" Box\" <sysservices@example.net>,Who? <one@y.test>";
        testMessage.bcc = "Undisclosed recipients:";
        testMessage.sender = "";

        // Verify from
        var fromRecipient = testMessage.fromRecipient;
        tc.areEqual("charlie@theunicorn.com", fromRecipient.emailAddress, "From recipient email address incorrect");
        tc.areEqual("charlie@theunicorn.com", fromRecipient.calculatedUIName, "From recipient name incorrect");

        // Verify "to"
        var toRecipients = testMessage.toRecipients;
        tc.areEqual(toRecipients.length, 2, "Incorrect number of recipients");
        tc.areEqual(toRecipients[0].calculatedUIName, "test test", "Incorrect name");
        tc.areEqual(toRecipients[0].emailAddress, "test@test.com", "Incorrect email");
        tc.areEqual(toRecipients[1].calculatedUIName, "joe@example.com", "Incorrect name");
        tc.areEqual(toRecipients[1].emailAddress, "joe@example.com", "Incorrect email");

        // Verify cc
        var ccRecipient = testMessage.ccRecipients;
        tc.areEqual(ccRecipient.length, 2, "Expected number of recipients not returned by ccRecipients");
        tc.areEqual(ccRecipient[0].emailAddress, "sysservices@example.net", "cc recipient email address incorrect");
        tc.areEqual(ccRecipient[0].calculatedUIName, "Giant; \"Big\" Box", "cc recipient name incorrect");
        tc.areEqual(ccRecipient[1].emailAddress, "one@y.test", "cc recipient email address incorrect");
        tc.areEqual(ccRecipient[1].calculatedUIName, "Who?", "cc recipient name incorrect");

        // Verify empty fields
        tc.isNull(testMessage.senderRecipient, "Expected null sender");
        tc.areEqual(testMessage.bccRecipients.length, 0, "Expected a null list");
    });

    // Verify that deleting a message works properly (collection updated, can no longer load email)
    Tx.test("MailMessageTest.testMessageDelete", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var msg1, msg2;
        var draftView = mailManager.ensureMailView(Microsoft.WindowsLive.Platform.MailViewType.draft, account.objectId, "");
        tc.isNotNull(draftView, "failed to get draft view");

        var draftCollection = draftView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.all);
        draftCollection.unlock();
        var collectionChangeListener = new CollectionListener(draftCollection);

        // Create 2 messages
        var createMessages = function () {
            msg1 = CreateGenericMessage(account, mailManager, "testMessageDelete Message 1", null, false);
            msg2 = CreateGenericMessage(account, mailManager, "testMessageDelete Message 2", null, false);
        };

        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, createMessages, wl.CollectionChangeType.itemAdded, 2), "Expected Number of collection change events were not fired after insert");

        // Verify that there are 2 drafts
        tc.areEqual(2, draftCollection.count, "draft folder should have 2 messages");

        // Save the object id and delete the first draft
        var msg1Id = msg1.objectId;
        msg1.deleteObject();

        // Verify that only 1 message is left
        var draftCollection2 = draftView.getMessages(Microsoft.WindowsLive.Platform.FilterCriteria.all);
        tc.areEqual(1, draftCollection2.count, "draft folder should have 1 remaining messages");
        tc.areEqual(null, mailManager.loadMessage(msg1Id), "loading a deleted draft should return null");
    });

    // Verify that keep alive works properly on server search messages
    Tx.asyncTest("MailMessageTest.testServerSearchMessageKeepAlive", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var folder = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);

        // Create a 'server search' and two messages
        var wlt = Microsoft.WindowsLive.Platform.Test;
        var requestEntry = platform.store.createTableEntry(wlt.StoreTableIdentifier.searchRequest);
        requestEntry.searchType = 0;
        requestEntry.rangeStart = 0;
        requestEntry.rangeEnd = 0;
        requestEntry.searchTerm = 'foo';
        requestEntry.searchBefore = new Date(2100, 1, 3);
        platform.store.createRelationship(requestEntry, account, wlt.STOREPROPERTYID.idPropertyAccountStoreId);
        requestEntry.commit();

        var messageEntry1 = platform.store.createTableEntry(wlt.StoreTableIdentifier.searchMail);
        messageEntry1.dateLastModified = new Date(2001, 1, 3);
        messageEntry1.dateReceived = new Date(2001, 1, 3);
        messageEntry1.dateSent = new Date(2001, 1, 3);
        messageEntry1.from = 'foo@bar.com';
        messageEntry1.hasOrdinaryAttachments = false;
        messageEntry1.importance = 1;
        messageEntry1.sender = 'foo@bar.com';
        messageEntry1.subject = 'foo 1';
        platform.store.createRelationship(messageEntry1, account, wlt.STOREPROPERTYID.idPropertyAccountId);
        platform.store.createRelationship(messageEntry1, folder, wlt.STOREPROPERTYID.idPropertyOriginalFolderId);
        platform.store.createRelationship(messageEntry1, requestEntry, wlt.STOREPROPERTYID.idPropertyRequestStoreId);
        messageEntry1.commitNoStash();

        var messageEntry2 = platform.store.createTableEntry(wlt.StoreTableIdentifier.searchMail);
        messageEntry2.dateLastModified = new Date(2001, 1, 4);
        messageEntry2.dateReceived = new Date(2001, 1, 4);
        messageEntry2.dateSent = new Date(2001, 1, 4);
        messageEntry2.from = 'foo@bar.com';
        messageEntry2.hasOrdinaryAttachments = false;
        messageEntry2.importance = 1;
        messageEntry2.sender = 'foo@bar.com';
        messageEntry2.subject = 'foo 2';
        platform.store.createRelationship(messageEntry2, account, wlt.STOREPROPERTYID.idPropertyAccountId);
        platform.store.createRelationship(messageEntry2, folder, wlt.STOREPROPERTYID.idPropertyOriginalFolderId);
        platform.store.createRelationship(messageEntry2, requestEntry, wlt.STOREPROPERTYID.idPropertyRequestStoreId);
        messageEntry2.commitNoStash();

        var message1 = mailManager.loadMessage(messageEntry1.objectId);
        tc.isNotNull(message1, "populated message not found");
        var message2 = mailManager.loadMessage(messageEntry2.objectId);
        tc.isNotNull(message1, "populated message not found");

        var keepAlive1 = message1.getKeepAlive();
        var keepAlive2 = message2.getKeepAlive();

        tc.areEqual(keepAlive1.objectId, message1.objectId, "ObjectIds are not equal");
        tc.areEqual(keepAlive2.objectId, message2.objectId, "ObjectIds are not equal");

        var message1Callback = null;
        var message2Callback = null;
        function detachEvents() {
            if (message1Callback) {
                message1.removeEventListener("deleted", message1Callback);
                message1Callback = null;
            }
            if (message2Callback) {
                message2.removeEventListener("deleted", message2Callback);
                message2Callback = null;
            }
        }

        function onFail() {
            detachEvents();
            tc.error("message should not be deleted at this time");
        }

        function onMessage1Deleted() {
            detachEvents();

            // this is the success at the end of the events
            tc.start();
        }

        function onMessage2Deleted() {
            detachEvents();

            message1Callback = onMessage1Deleted;
            message1.addEventListener("deleted", message1Callback);

            keepAlive1.dispose();
        }

        message1Callback = onFail;
        message2Callback = onMessage2Deleted;
        message1.addEventListener("deleted", message1Callback);
        message2.addEventListener("deleted", message2Callback);

        tc.stop();
        keepAlive2.dispose();
        requestEntry.deleteObjectCascade();
    });

    // Verify that we remove the XML Declaration in the body correctly
    Tx.test("MailMessageTest.testXmlDeclarationRemoval", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var msg = mailManager.createMessage(account);
        var htmlBody = msg.createBody();
        htmlBody.type = wl.MailBodyType.html;

        // Verify the normal case (no xml declaration)
        var strExpected = "<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        var strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Normal case failed");

        // Verify most common XML declaration case scenario
        strExpected = "\r\n<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = "\r\n<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?>" + strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Common XML declaration case failed");

        // Verify that it trims whitespace
        strExpected = "\r\n<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = "\r\n     <?xml     version = \"1.0\" encoding=\"UTF-8\"     standalone=\"no\"       ?>" + strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "XML declaration with lots of whitespace case failed");

        // Verify that it doesn't remove xml declarations in the middle of the page
        strExpected = "\r\n<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>" + "\r\n<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?>";
        strInputBody =  strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Verification that it doesn't remove xml declarations in the middle of the page failed");

        // Verify that it doesn't remove malformed xml declaration
        strExpected = "<?xml version=\"1.0\" encoding=\"UTF-8\" stan><html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Malformed XML case failed");

        // Verify that it doesn't remove malformed xml declaration 2
        strExpected = "<?x<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Malformed XML case failed 2");

        // Verify that it doesn't remove malformed xml declaration 3
        strExpected = "<?xm";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Malformed XML case failed 3");

        // Verify that it doesn't remove if body is just xml decl.
        strExpected = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?>";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Invalid removal");

        // Verify that it isn't case sensitive
        strExpected = "<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = "<?XML VERSION=\"1.0\" ENCODING=\"UTF-8\" STANDALONE=\"no\" ?>" + strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "XML declaration removal shouldn't be case sensitive");

        // Verify that it doesn't strip for plain text
        var textBody =  msg.createBody();
        textBody.type = wl.MailBodyType.plainText;

        strExpected = "\r\n<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?><html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = strExpected;

        textBody.body = strInputBody;
        tc.areEqual(strExpected, textBody.body, "It shouldn't strip xml decl for plain text email");

    });

    // Verify that we remove the DocType in the body correctly
    Tx.test("MailMessageTest.testDoctypeRemoval", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var msg = mailManager.createMessage(account);
        var htmlBody = msg.createBody();
        htmlBody.type = wl.MailBodyType.html;

        // Verify the normal case (no doctype)
        var strExpected = "<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        var strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Normal case failed");

        // Verify most common doctype case scenario
        strExpected = "\r\n<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = "\r\n<!doctype html>" + strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Common doctype case failed");

        // Verify other common doctype case scenario
        strExpected = "\r\n<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = "\r\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">" + strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Common doctype case failed");

        // Verify that it trims whitespace
        strExpected = "\r\n<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = "\r\n     <!DOCTYPE     html       >" + strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Doctype with lots of whitespace didn't get removed");

        // Verify that it doesn't remove doctype that is not at the beginning
        strExpected = "\r\n<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>" + "\r\n<!doctype html>";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Verification that it doesn't remove doctype at the end failed");

        // Verify that it doesn't remove malformed doctype
        strExpected = "<!docty<html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Malformed doctype case failed");

        // Verify that it doesn't remove malformed doctype 2
        strExpected = "<doctype><html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Malformed doctype case failed 2");

        // Verify that it doesn't remove malformed doctype 3
        strExpected = "<!doc";
        strInputBody = strExpected;

        htmlBody.body = strInputBody;
        tc.areEqual(strExpected, htmlBody.body, "Malformed doctype case failed 3");

        // Verify that it doesn't strip for plain text
        var textBody = msg.createBody();
        textBody.type = wl.MailBodyType.plainText;

        strExpected = "\r\n<!doctype html><html><head><title>Ignore</title></head><body><p>The quick brown fox<br>jumped over the <a href=\"http://www.bing.com\">lazy dog</a>??</p></body>";
        strInputBody = strExpected;

        textBody.body = strInputBody;
        tc.areEqual(strExpected, textBody.body, "It shouldn't strip doctype for plain text email");
    });

    // Verifies that a message is cloned properly
    Tx.test("MailMessageTest.verifyCloneBehavior", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var strEmailMessageId = "<TESTEMAILMESSAGEID-BAY171-W128A3B3D9EF104EF7BB90F1DCD40@phx.gbl>";
        var strSourceEmailMessageId = "<TESTEMAILSOURCEMESSAGEID-WIW133-SO12I3G4A13P25WP56Q45I45OFJGS@phx.gbl>";
        var strEmailReferences = "<REFERENCE1@example.com>,<REFERENCE2@example.com>";
        var strMessageHtmlBody = "This is the html body for the message";
        var strMessageTextBody = "This is the plain text body for the message";

        // Create a message.
        var inbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        var messageOriginal = CreateGenericMessage(account, mailManager, "Original Message", inbox, false);
        messageOriginal.to = "someone@hotmail.com";
        messageOriginal.cc = "someoneelse@hotmail.com";
        messageOriginal.bcc = "someoneinbcc@hotmail.com";
        messageOriginal.importance = wl.MailMessageImportance.high;
        messageOriginal.lastVerb = wl.MailMessageLastVerb.forward;

        var messagePrivate = new mailtest.MailMessagePrivate(messageOriginal);
        messagePrivate.mimeMessageId = strEmailMessageId;
        messagePrivate.mimeSourceMessageId = strSourceEmailMessageId;
        messagePrivate.mimeReferences = strEmailReferences;

        // Modify the existing html body.
        var htmlBody = messageOriginal.getBody(wl.MailBodyType.html);
        htmlBody.body = strMessageHtmlBody;

        // Add a plain text body.
        var textBody = messageOriginal.createBody();
        textBody.type = wl.MailBodyType.plainText;
        textBody.body = strMessageTextBody;
        messagePrivate.commitMessageNoStash();

        // Add an attachment.
        var attachment = messageOriginal.createAttachment();
        attachment.uiType = wl.AttachmentUIType.ordinary;
        attachment.fileName = "My attachment";
        attachment.contentLocation = "C:\\";
        attachment.contentId = "123";
        attachment.photoMailFileType = wl.PMFileType.video;
        attachment.composeStatus = wl.AttachmentComposeStatus.done;

        // Copy test to where app can access it.
        var fileName = "platform.testapi.winmd";
        var attachmentPath = mailtest.MailTestHelpers.moveFileToAppData(fileName, "");
        attachment.bodyFile = attachmentPath;

        // Finished setting up the original message, commit it.
        messageOriginal.commit();

        // Load the original message from the store and clone it.
        var sourceMessage = mailManager.loadMessage(messageOriginal.objectId);
        var inboxView = mailManager.ensureMailView(wl.MailViewType.inbox, account.objectId, "");
        var messageClone = sourceMessage.cloneMessage(true, wl.MailMessageLastVerb.replyToAll, inboxView);
        messageClone.commit();

        // Verify store properties on the cloned message.
        var messageClonePrivate = new mailtest.MailMessagePrivate(messageClone);
        tc.areNotEqual(sourceMessage.objectId, messageClone.objectId, "Object IDs for the cloned message must be different than the source message");
        tc.isTrue(messageClone.isInSpecialFolderType(wl.MailFolderType.drafts), "Cloned message should be in the drafts folder");
        tc.areEqual(messageClonePrivate.mimeSourceMessageId, strEmailMessageId, "Cloned source message ID should be original message ID");
        tc.areEqual(messageClonePrivate.mimeMessageId, "", "Cloned message ID should be empty");
        tc.areEqual(messageClonePrivate.mimeReferences, strEmailReferences, "Email references should have been cloned");

        // Verify bodies on the cloned message.
        verifyClonedBodies(tc, messageOriginal, messageClone);

        // Verify the attachments on the cloned message.
        verifyClonedAttachments(tc, messageOriginal.getOrdinaryAttachmentCollection(), messageClone.getOrdinaryAttachmentCollection());
    });

    function verifyClonedBodies(tc, messageSource, messageClone) {
        // Check HTML bodies.
        tc.areEqual(messageSource.hasBody(wl.MailBodyType.html), messageClone.hasBody(wl.MailBodyType.html), "Cloned message's HTML body does not match source");
        var htmlBodySource = messageSource.getBody(wl.MailBodyType.html);
        var htmlBodyClone = messageClone.getBody(wl.MailBodyType.html);
        tc.areEqual(htmlBodySource.body, htmlBodyClone.body, "Cloned message's HTML body does not match source");

        // Check plain text bodies.
        tc.areEqual(messageSource.hasBody(wl.MailBodyType.plainText), messageClone.hasBody(wl.MailBodyType.plainText), "Cloned message's plain text body does not match source");
        var textBodySource = messageSource.getBody(wl.MailBodyType.html);
        var textBodyClone = messageClone.getBody(wl.MailBodyType.html);
        tc.areEqual(textBodySource.body, textBodyClone.body, "Cloned message's plain text body does not match source");
    }

    function verifyClonedAttachments(tc, attachmentCollectionSource, attachmentCollectionClone) {
        tc.areEqual(attachmentCollectionSource.count, attachmentCollectionClone.count, "Cloned attachment count does not match the source");

        for (i = 0; i < attachmentCollectionSource.count; i++) {
            var attachmentSource = attachmentCollectionSource.item(i);
            var attachmentClone = attachmentCollectionClone.item(i);

            tc.areEqual(attachmentSource.uiType, attachmentClone.uiType, "Cloned attachment type does not match source");
            tc.areEqual(attachmentSource.fileName, attachmentClone.fileName, "Cloned attachment file name does not match source");
            tc.areEqual(attachmentSource.contentLocation, attachmentClone.contentLocation, "Cloned attachment content location does not match source");
            tc.areEqual(attachmentSource.contentId, attachmentClone.contentId, "Cloned attachment content ID does not match source");
            tc.areEqual(attachmentSource.photoMailFileType, attachmentClone.photoMailFileType, "Cloned attachment photomail file type does not match source");
            tc.areEqual(attachmentSource.composeStatus, attachmentClone.composeStatus, "Cloned attachment compose status does not match source");
        }
    }

    // Verify that the SanitizedVersion of a message is updated correctly
    Tx.test("MailMessageTest.testSanitizedVersion", function (tc) {
        tc.cleanup = cleanup;
        setup();

        // Create a message with only plain text body
        var msg = mailManager.createMessage(account);
        msg.subject = "Testing Sanitized Version";
        var textBody = msg.createBody();
        textBody.type = wl.MailBodyType.plainText;
        textBody.body = "Plain Text body";
        msg.commit();

        // Verify that the sanitized version is NoHtmlBody
        tc.areEqual(msg.sanitizedVersion, wl.SanitizedVersion.noHtmlBody, "Message has not HTML body, so SanitizedVersion should be NoHtmlBody");

        // Add an HTML body and verify that sanitized version is updated to NotSanitized
        var htmlBody = msg.createBody();
        htmlBody.type = wl.MailBodyType.html;
        htmlBody.body = "HTML body";
        msg.commit();
        tc.areEqual(msg.sanitizedVersion, wl.SanitizedVersion.notSanitized, "Message has HTML body but no sanitized body, so SanitizedVersion should be NotSanitized");

        // Add a sanitized body and update the santized version
        var sanitizedBody = msg.createBody();
        sanitizedBody.type = wl.MailBodyType.sanitized;
        sanitizedBody.body = "Sanitized body";
        msg.sanitizedVersion = wl.SanitizedVersion.current;
        msg.commit();
        tc.areEqual(msg.sanitizedVersion, wl.SanitizedVersion.current, "Message have been sanitized, so SanitizedVersion should be Current");

        // Modify the HTML body and make sure the sanitized version is updated appropriately
        htmlBody.body = "HTML body 2";
        msg.commit();
        tc.areEqual(msg.sanitizedVersion, wl.SanitizedVersion.notSanitized, "Message HTML body has been changed, so SanitizedVersion should be NotSanitized");

        // Verify that we can get a sanitized body anymore
        tc.isNull(msg.getBody(wl.SanitizedVersion.sanitized), "Sanitized body should have been deleted because the HTML body changed");
    });

    // Verify that updating Santized body from one MailMessage object will update the Sanitized body of a different MailMessage object that is backed by the same MailMessage row
    Tx.test("MailMessageTest.testUpdatingSanitizedBody", function (tc) {
        tc.cleanup = cleanup;
        setup();

        // Helper for listening to changes on the Sanitized Version
        var expected = wl.SanitizedVersion.notSanitized;
        var fired = false;
        var count = 0;
        function onSanitizedVersionChange(ev) {
            var message = ev.target;
            if (message.sanitizedVersion == expected) {
                fired = true;
            }
        }

        // Create a message with HTML body
        var msg = mailManager.createMessage(account);
        msg.subject = "Testing Sanitized Body Update";
        var htmlBody = msg.createBody();
        htmlBody.type = wl.MailBodyType.html;
        htmlBody.body = "HTML body";
        msg.commit();

        // Add a sanitized body
        var sanitizedBody = msg.createBody();
        sanitizedBody.type = wl.MailBodyType.sanitized;
        sanitizedBody.body = "Sanitized body";
        msg.sanitizedVersion = wl.SanitizedVersion.current;
        msg.commit();

        // Verify that the sanitized version is current
        tc.areEqual(msg.sanitizedVersion, wl.SanitizedVersion.current, "Message should be sanitized");

        // Get a copy of the MailMessage object
        var sanitizedMsgs = mailManager.getMessageCollectionBySanitizedVersion(wl.SanitizedVersion.current);
        var msgCopy = sanitizedMsgs.item(0);

        // Reset the sanitized version to 0 first
        msg.sanitizedVersion = wl.SanitizedVersion.notSanitized;

        // Wait for the sanitized version to update on the copy message
        expected = wl.SanitizedVersion.notSanitized;
        fired = false;
        count = 0;

        msgCopy.addEventListener("changed", onSanitizedVersionChange);
        msg.commit();

        while (!fired && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        tc.areEqual(expected, msgCopy.sanitizedVersion, "Sanitized Version on msgCopy is incorrect");
        msg.removeEventListener("changed", onSanitizedVersionChange);

        // Modify the sanitized body of the msgCopy object and update the SanitizedVersion back to current
        var sanitizedBodyCopy = msg.getBody(wl.MailBodyType.sanitized);
        sanitizedBodyCopy.body = "Modified Sanitized body";
        msgCopy.sanitizedVersion = wl.SanitizedVersion.current;

        // Wait for the sanitized version to update on the original message
        expected = wl.SanitizedVersion.current;
        fired = false;
        count = 0;

        msg.addEventListener("changed", onSanitizedVersionChange);
        msgCopy.commit();

        while (!fired && count < 200) {
            count++;
            platform.runMessagePump(50);
        }

        tc.areEqual(expected, msg.sanitizedVersion, "Sanitized Version on msg is incorrect");
        msg.removeEventListener("changed", onSanitizedVersionChange);

        // Verify the new sanitized body
        tc.areEqual(sanitizedBodyCopy.body, sanitizedBody.body, "Sanitized body was not updated on the original message");
    });
})();
