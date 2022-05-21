
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var wl = Microsoft.WindowsLive.Platform;
    var wlt = wl.Test;

    var platform;
    var accountManager;
    var peopleManager;
    var mailManager;
    var folderManager;
    var defaultInbox;
    var people;
    var MailTest;
    var appTilesFolder;

    function cleanup (tc) {
        platform.dispose();
        platform = null;
        
        accountManager = null;
        peopleManager = null;
        mailManager = null;
        folderManager = null
        defaultInbox = null;
        people = null;

        // Clean up XMLs 
        MailTest.MailSecondaryTile.cleanUpXMLs();

        tc.start();
    }

    function setup (tc) {
        platform = new wlt.ClientTestHarness("unittests", wlt.PluginsToStart.none);
        
        // Clean up store
        platform.store.clearTable(wlt.StoreTableIdentifier.contact);
        platform.store.clearTable(wlt.StoreTableIdentifier.folder);
        platform.store.clearTable(wlt.StoreTableIdentifier.mailMessage);
        platform.store.clearTable(wlt.StoreTableIdentifier.mailMessageViewLink);
        platform.store.clearTable(wlt.StoreTableIdentifier.mailView);
        platform.store.clearTable(wlt.StoreTableIdentifier.person);
        platform.store.clearTable(wlt.StoreTableIdentifier.wordWheel);

        platform.requestServiceResources("peopleAggregator");
        platform.requestServiceResources("mailChangeHandler");

        accountManager = platform.client.accountManager;
        peopleManager = platform.client.peopleManager;
        mailManager = platform.client.mailManager;
        folderManager = platform.client.folderManager;

        // Turn on XML caching
        Windows.Storage.ApplicationData.current.localSettings.values.insert("PEOPLE_CacheTileAndToastXml", "1");

        // Projected C# API class instance 
        MailTest = Platform.TestApi.Mail;

        // Inbox folder in default account
        defaultInbox = folderManager.getSpecialMailFolder(accountManager.defaultAccount, wl.MailFolderType.inbox);

        // Account resource
        accountMailResource = accountManager.defaultAccount.getResourceByType(wl.ResourceType.mail);
        MailTest.accountMailResource = accountMailResource;

        // Add two contacts C0: people[0] and C1: people[1], pin people[1] to navPane
        // We choose set usertile by randomly choose from true or false
        people = [];
        regularHasUserTile = Math.floor(Math.random() * 2) == 0;
        favoriteHasUserTile = Math.floor(Math.random() * 2) == 0;
        people.push(AddContact(tc, false, regularHasUserTile));
        people.push(AddContact(tc, true, favoriteHasUserTile));
        MailTest.MailSecondaryTile.favoritePerson = people[1];

        // Caculate folder path for validation XMLs
        dbRoot = "LiveComm";
        schemaVersion = "120712-0049";
        folderName = "AppTiles";
        cid = "92ef2b7026c6780e"; // Hard-coded value for the account email:secondaryAppTile01@outlook.com password:Longhorn!
        appTilesFolder = Windows.Storage.ApplicationData.current.localFolder.path + "\\" + dbRoot + "\\" + cid + "\\" + schemaVersion + "\\" + folderName;
        MailTest.MailSecondaryTile.appTilesFolder = appTilesFolder;

        tc.stop();
    }

    var testDataJustOrder = [
    { "iterationName": "1", "value": "1" },
    { "iterationName": "2", "value": "2" },
    { "iterationName": "3", "value": "3" },
    { "iterationName": "4", "value": "4" },
    { "iterationName": "5", "value": "5" },
    ]

    var testDataSenderType = [
    { "iterationName": "1", "value": "0" },
    { "iterationName": "2", "value": "1" },
    { "iterationName": "3", "value": "00" },
    { "iterationName": "4", "value": "01" },
    { "iterationName": "5", "value": "10" },
    { "iterationName": "6", "value": "11" },
    { "iterationName": "7", "value": "000" },
    { "iterationName": "8", "value": "001" },
    { "iterationName": "9", "value": "010" },
    { "iterationName": "10", "value": "011" },
    { "iterationName": "11", "value": "100" },
    { "iterationName": "12", "value": "101" },
    { "iterationName": "13", "value": "110" },
    { "iterationName": "14", "value": "111" },
    { "iterationName": "15", "value": "10000" },
    { "iterationName": "16", "value": "10001" },
    { "iterationName": "17", "value": "10010" },
    { "iterationName": "18", "value": "10011" },
    { "iterationName": "19", "value": "10100" },
    { "iterationName": "20", "value": "10101" },
    { "iterationName": "21", "value": "10110" },
    { "iterationName": "22", "value": "10111" },
    { "iterationName": "23", "value": "11000" },
    { "iterationName": "24", "value": "11001" },
    { "iterationName": "25", "value": "11010" },
    { "iterationName": "26", "value": "11011" },
    { "iterationName": "27", "value": "11100" },
    { "iterationName": "28", "value": "11101" },
    { "iterationName": "29", "value": "11110" },
    { "iterationName": "30", "value": "11111" },
    ]

    // A data driven test-case that simulate pinned Mail Inbox tile updates when getting various number of unseen messages from regular or favorite contacts
    BVT.Test("VerifyMailPinnedTile_Inbox", {
        "data": testDataSenderType
    }, function (tc) {
        setup(tc);

        VerifyMailPinnedTileHelper_SenderType(tc, wl.MailViewType.inbox, this.value);

        cleanup(tc);
    })

    // A data driven test-case that simulate pinned Mail FlaggedView tile updates when getting unseen messages from regular or favorite contacts
    BVT.Test("VerifyMailPinnedTile_Flagged", {
        "data": testDataSenderType
    }, function (tc) {
        setup(tc);

        VerifyMailPinnedTileHelper_SenderType(tc, wl.MailViewType.flagged, this.value);

        cleanup(tc);
    })

    /* TODO: We need proper file listener to enable these two tests, currently since no good solution in JS, we are using manual tests to cover this
    // A data driven test-case that simulate pinned Mail Outbox tile updates when getting unseen messages from favorite contacts
    BVT.Test("VerifyMailPinnedTile_Outbox", {
        "data": testDataJustOrder
    }, function (tc) {
        setup(tc);

        VerifyMailPinnedTileHelper_JustOrder(tc, wl.MailViewType.outbox, this.value);

        cleanup(tc);
    })

    // A data driven test-case that simulate pinned Mail Draft tile updates when getting unseen messages from favorite contacts
    BVT.Test("VerifyMailPinnedTile_Draft", {
        "data": testDataJustOrder
    }, function (tc) {
        setup(tc);

        VerifyMailPinnedTileHelper_JustOrder(tc, wl.MailViewType.draft, this.value);

        cleanup(tc);
    })
    * */

    // Helper to verify the pinnedTile when mails sent from favorite/regular contact matters (Inbox/UserGeneratedFolder/Flagged)
    function VerifyMailPinnedTileHelper_SenderType(tc, pinnedViewType, value){
        // 1. Read the indicies from data source
        var indices = [];
        for (var i = 0; i < value.length; i++) {
            var c = value.charAt(i);
            indices.push(parseInt(c));
        }

        // 2. Simulate receiving messages from above two contacts based on the data-driven scenarios
        var allMessages = [];
        indices.forEach(            
            function AddMessage(value, index, array) {
                allMessages.push(
                    new MailTest.SenderMessage(
                        CreateUnseenMessage(accountManager.defaultAccount, people[value].mostRelevantEmail, defaultInbox, pinnedViewType == wl.MailViewType.flagged),
                        people[value]));
            }
        );

        // 4. Run verb
        RunVerb();
        MailTest.MailSecondaryTile.waitForFileGenerated(allMessages.length, MailTest.TileToastScenario.mailPinnedTile);

        // 5. Caculate the large Mail tile display messages list
        largeTileMessages = MailTest.MailSecondaryTile.calculateLargeTileMessageList(allMessages, pinnedViewType);

        // 6. Read and validate actual tile metadata from XML binding generated by product code
        MailTest.MailSecondaryTile.validateMailPinnedTile(largeTileMessages, allMessages, MailTest.TileToastScenario.mailPinnedTile, pinnedViewType);
    }

    // Helper to verify the pinnedTile when mails sent from favorite/regular contact matters (Drafts/Outbox/AllPinnedPeopleView)
    function VerifyMailPinnedTileHelper_JustOrder(tc, pinnedViewType, value){
        // 1. Parse the EmailCount
        var emailCount = parseInt(value);
        
        // 2. Simulate receiving messages from favorite contact based on the data-driven scenarios
        var allMessages = [];
        for (i = 0; i < emailCount; i++)
        {
            var sender = null;
            var senderEmail = accountManager.defaultAccount.emailAddress;
            var parentFolder = null;

            switch (pinnedViewType)
            {
                case wl.MailViewType.outbox:
                    parentFolder = folderManager.getSpecialMailFolder(accountManager.defaultAccount, wl.MailFolderType.outbox);
                    break;
                case wl.MailViewType.draft:
                    parentFolder = defaultInbox;
                    break;
                default:
                    UTVerify.Fail("MailViewType not support in this helper");
                    break;
            }

            inboxView = mailManager.ensureMailView(wl.MailViewType.inbox, accountManager.defaultAccount.objectId, "");
            message = (pinnedViewType == wl.MailViewType.draft) ?
                CreateDraftMessage(accountManager.defaultAccount, senderEmail, inboxView) :
                CreateUnseenMessage(accountManager.defaultAccount, senderEmail, parentFolder, false);
            allMessages.push(new MailTest.SenderMessage(message, sender));
        }

        // 3. Run verb
        RunVerb();
        MailTest.MailSecondaryTile.waitForFileGenerated(allMessages.length, MailTest.TileToastScenario.mailPinnedTile);

        // 4. Caculate the large Mail tile display messages list
        largeTileMessages = MailTest.MailSecondaryTile.calculateLargeTileMessageList(allMessages, pinnedViewType);

        // 5. Read and validate actual tile metadata from XML binding generated by product code
        MailTest.MailSecondaryTile.validateMailPinnedTile(largeTileMessages, allMessages, MailTest.TileToastScenario.mailPinnedTile, pinnedViewType);
    }

    // Create unseen message for account in the given folder that sent from specified email address
    function CreateUnseenMessage(account, from, parentFolder, flagged) {
        var subject = "Test Subject" + Math.floor(Math.random() * 10000).toString();
        var body = "Test body" + Math.floor(Math.random() * 10000).toString();
        var testServerId = Math.floor(Math.random() * 10000).toString();

        mailMessage = mailManager.createMessageInFolder(parentFolder);
        mailMessagePrivate = MailTest.MailMessagePrivate(mailMessage);

        if (parentFolder.specialMailFolderType == wl.MailFolderType.outbox) {
            mailMessage.outboxQueue = wl.OutboxQueue.sendMail;
        }

        mailMessage.read = false;
        mailMessage.subject = subject;
        mailMessagePrivate.serverMessageId = testServerId;
        mailMessage.flagged = flagged;

        textBody = mailMessage.createBody();
        textBody.body = body;
        textBody.type = wl.MailBodyType.plainText;

        mailMessage.from = from;
        mailMessagePrivate.commitMessageNoStash();

        return mailMessage;
    }

    // create a draft message
    function CreateDraftMessage(account, from, parent){
        var subject = "Test Subject" + Math.floor(Math.random() * 10000).toString();
        var body = "Test body" + Math.floor(Math.random() * 10000).toString();
        var draftMessage = mailManager.createDraftMessage(parent);

        textBody = draftMessage.createBody();
        textBody.body = body;
        textBody.type = wl.MailBodyType.plainText;

        draftMessage.subject = subject;
        draftMessage.from = from;
        draftMessage.commit();

        return draftMessage;
    }

    // Pin/Unpin person to NavPane for account to make sure we have regular contact and favorite contact
    function AddContact(tc, pinToNavPane, hasUsertile) {
        var url = "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash4/370852_1388112291_2030668892_q.jpg";
        var firstName = "Andrew" + Math.floor(Math.random() * 10000).toString();
        var email = Math.floor(Math.random() * 10000).toString() + "@outlook.com";

        var contact = peopleManager.createContact();
        contact.firstName = firstName;
        contact.personalEmailAddress = email;
        if (hasUsertile) {
            platform.store.setObjectProperty(contact, wlt.STOREPROPERTYID.idPropertyUserTileExtraLargeFileName, url);
            platform.store.setObjectProperty(contact, wlt.STOREPROPERTYID.idPropertyUserTileMediumFileName, url);
        }
        contact.commit();

        var fired = false;

        function onObjectChange(ev) {
            if (contact.person != null) {
                fired = true;
            }
        }

        // listen for person insert
        contact.addEventListener("changed", onObjectChange);
        var count = 0;
        while (!fired && count < 200) {
            count++;
            platform.runMessagePump(50);
        }
        contact.removeEventListener("changed", onObjectChange);

        var person = contact.person;
        tc.isNotNull(person, "Person should not be null.");

        if (pinToNavPane) {
            personView = mailManager.ensureMailView(wl.MailViewType.person, accountManager.defaultAccount.objectId, person.objectId);
            tc.isNotNull(personView, "PersonView should not be null");

            personView.pinToNavPane(true);
            tc.isTrue(personView.isPinnedToNavPane, "View property IsPinnedToNavPane is false");
        }

        return person;
    }

    // Run verb to push the mail tile or toast updates
    function RunVerb()
    {
        var mailVerb = platform.client.createVerb("ProcessUpdates", accountManager.defaultAccount.objectId);

        platform.client.runResourceVerb(
            accountManager.defaultAccount,
            "mailNotification",
            mailVerb);
    }
})();