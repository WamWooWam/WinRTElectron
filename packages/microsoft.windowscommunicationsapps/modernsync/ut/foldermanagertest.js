
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Folder and Folder Manager functionality

(function() {

    var wl;
    var platform;
    var accountManager;
    var folderManager;
    var account;

    function setUp() {
        wl = Microsoft.WindowsLive.Platform;

        platform = SetupPlatform();
        accountManager = platform.client.accountManager;
        folderManager = platform.client.folderManager;
        account = accountManager.defaultAccount;
    }
    
    function cleanup() {
        platform.dispose();
        platform = null;
        
        accountManager = null;
        folderManager = null;
        account = null;
    }

    // Utility functions for use in this class
    function tryAccountCommit(account, tc) {
        try
        {
            account.commit();
        }
        catch (e)
        {
            tc.log("Account commit failed");
            for (var name in e) {
                tc.log(name + ": \"" + e[name] + "\"");
            }
            tc.fail("Account commit passed on retry - Error details above.");
        }
    }
    
    // Verify that creating a folder works correctly
    Tx.test("FolderManagerTest.testCreateFolder", function (tc) {
        tc.cleanup = cleanup;
        setUp()

        var folder = folderManager.createFolder(account);
        tc.isNotNull(folder, "Failed to create folder");
        
        folder.folderName = "ExampleFolder" + (new Date()).getTime();
        folder.folderType = wl.FolderType.mail;
        folder.commit();
        
        folder.deleteObject();
    });

    // Verify that retrieiving the mail/contact/calendar root folders works correctly
    Tx.test("FolderManagerTest.testRetrieveRootFolders", function (tc) {
        tc.cleanup = cleanup;
        setUp()
        
        // Create a clean account for this test
        var account = accountManager.defaultAccount.createConnectedAccount("mailtest2011" + Math.random() + "@example.com");
        tryAccountCommit(account, tc);
        
        var account2 = accountManager.defaultAccount.createConnectedAccount("mailtest2012" + Math.random() + "@example.com");
        tryAccountCommit(account2, tc);

        // Get (auto-create) two special root folder
        var folderInbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        var folderOutbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.outbox);
        var folderContact = folderManager.getSpecialContactFolder(account, wl.ContactFolderType.defaultFolder);

        var folderJunk = folderManager.getSpecialMailFolder(account, wl.MailFolderType.junkMail);
        tc.isNull(folderJunk, "JunkMail should not be automatically created");

        // Add a child to inbox
        var folder = folderManager.createFolder(account);
        tc.isNotNull(folder, "Failed to create folder");
        
        folder.folderName = "ExampleNonRootFolder" + (new Date()).getTime();
        folder.folderType = wl.FolderType.mail;
        folder.parentFolder = folderInbox; 
        folder.commit();

        // Verify getAllFoldersCollection in one account (five special folders (no junk) and one user folder)
        var allMailFolders = folderManager.getAllFoldersCollection(wl.FolderType.mail, account);
        tc.areEqual(allMailFolders.count, 6, "Incorrect number of mail folders (" + allMailFolders.count + ")");
        
        var allContactsFolders = folderManager.getAllFoldersCollection(wl.FolderType.contacts, account);
        tc.areEqual(allContactsFolders.count, 1, "Incorrect number of contacts folders");
        
        var allCalendars = folderManager.getAllFoldersCollection(wl.FolderType.calendar, account);
        tc.areEqual(allCalendars.count, 0, "Incorrect number of calendar folders");
        
        // Verify getAllFoldersCollection (five special folders for all three account plus the one user folder)
        var allMailFoldersForAllAccounts = folderManager.getAllFoldersCollection(wl.FolderType.mail);
        tc.isTrue(allMailFoldersForAllAccounts.count >= 16, "Incorrect number of folders for all accounts");

        // Verify getRootFolderCollection (five special folders -- junk is not automatically created)
        var allMailRootFolders = folderManager.getRootFolderCollection(account, wl.FolderType.mail);
        tc.areEqual(allMailRootFolders.count, 5, "Incorrect number of root mail folders");

        // Verify getRootUserMailFolderCollection
        var userRootfolder = folderManager.createFolder(account);
        userRootfolder.folderName = "ExampleUserRootFolder" + (new Date()).getTime();
        userRootfolder.folderType = wl.FolderType.mail;
        userRootfolder.commit();
        
        var allUserRootFolders = folderManager.getRootUserMailFolderCollection(account);
        tc.areEqual(allUserRootFolders.count, 1, "Incorrect number of root user mail folders (" + allUserRootFolders.count + ")");

        var userFolder = allUserRootFolders.item(0);
        tc.areEqual(userFolder.objectId, userRootfolder.objectId, "Did not retrieve expected user folder");

        folder.deleteObject();
        userRootfolder.deleteObject();
        
        account.deleteObject();
        account2.deleteObject();
    });

    // Verify retrieving special mail folders work correctly
    Tx.test("FolderManagerTest.testSpecialFolders", function (tc) {
        tc.cleanup = cleanup;
        setUp();

        // Create a clean account for this test
        var account = accountManager.defaultAccount.createConnectedAccount("mailtest2011" + Math.random() +"@example.com");
        tryAccountCommit(account, tc);
    
        tc.isNotNull(account, "Could not get the default account");
        
        var folderInbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        tc.isNotNull(folderInbox, "getSpecialMailFolder returned null for the inbox special folder");
        tc.areEqual(wl.MailFolderType.inbox, folderInbox.specialMailFolderType, "getSpecialMailFolder did not get the inbox folder");
        
        var folderOutbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.outbox);
        tc.isNotNull(folderOutbox, "getSpecialMailFolder returned null for the outbox special folder");
        tc.isTrue(wl.MailFolderType.outbox == folderOutbox.specialMailFolderType, "getSpecialMailFolder did not get the outbox folder");

        tc.isTrue(null == folderInbox.folderName || 0 == folderInbox.folderName.length, "Inbox folder should not have a name");

        try
        {
            var deftFolderCalendar = folderManager.getSpecialCalendarFolder(account, wl.CalendarFolderType.defaultFolder);
            tc.fail(folderCalendar, "getSpecialCalendarFolder should fail if none exists");
        }
        catch(e)
        {
            if (typeof e.number === 'undefined') throw e;
        }
        
        // Test Calendar special types
        var folderCalendar = folderManager.createFolder(account);
        folderCalendar.folderType = wl.FolderType.calendar;
        
        folderCalendar.specialCalendarFolderType = wl.CalendarFolderType.defaultFolder;
        tc.areEqual(wl.CalendarFolderType.defaultFolder, folderCalendar.specialCalendarFolderType, "Calendar special type not set correctly");

        var testCalendarName = "Testing default calendar folder name";
        folderCalendar.folderName = testCalendarName;
        tc.areEqual(folderCalendar.folderName, testCalendarName, "Calendar folder name was not set correctly");

        try
        {
            folderInbox.specialCalendarFolderType = 0;
            tc.fail("Expected to fail 2");
        }
        catch(e)
        {
            if (typeof e.number === 'undefined') throw e;
        }
        
        try
        {
            var alwaysNull = folderManager.getSpecialCalendarFolder(account, 500);
            tc.fail("Passing an invalid argument to getSpecialCalendarFolder should fail");
        }
        catch(e)
        {
            if (typeof e.number === 'undefined') throw e;
        }
    });

    // Verify basic behavior of loading a folder
    Tx.test("FolderManagerTest.testLoadFolder", function (tc) {
        tc.cleanup = cleanup;
        setUp();

        var folder = folderManager.createFolder(account);
        tc.isNotNull(folder, "Folder creation failed");
        
        folder.folderName = "LoadFolderTestFolder" + (new Date()).getTime();
        folder.folderType = wl.FolderType.mail;
        folder.commit();
        
        var folder2 = folderManager.loadFolder(folder.objectId);
        tc.areEqual(folder.folderName, folder2.folderName, "15");
        
        var folderInvalid = folderManager.loadFolder("123456");
        tc.isNull(folderInvalid, "Loading a folder with an invalid id should return null");
        
        folder.deleteObject();
    });

    // Verify deleting a folder works correctly and the DeletedState property is updated properly
    Tx.test("FolderManagerTest.testDeleteFolders", function (tc) {
        tc.cleanup = cleanup;
        setUp();
        
        var folderParent = folderManager.createFolder(account);
        tc.isNotNull(folderParent, "Failed to create folder");
        
        folderParent.folderName = "ParentFolderDeleteTest" + (new Date()).getTime();
        folderParent.folderType = wl.FolderType.mail;
        folderParent.commit();
        
        var folderChild = folderManager.createFolder(account);
        tc.isNotNull(folderChild, "Folder not created in testDeleteFolders");
        
        folderChild.folderName = "ChildFolderDeleteTest" + (new Date()).getTime();
        folderChild.folderType = wl.FolderType.mail;
        folderChild.parentFolder = folderParent;
        folderChild.commit();
        tc.areEqual("0" /* DeleteState.NotDeleted */, platform.store.getObjectProperty(folderChild, wl.Test.STOREPROPERTYID.idPropertyDeleteState), "Child folder deleteState should be true before the delete");
        
        var folderChildId = folderChild.objectId;
        folderChild = null;
        
        tc.areEqual("0" /* DeleteState.NotDeleted */, platform.store.getObjectProperty(folderParent, wl.Test.STOREPROPERTYID.idPropertyDeleteState), "Parent folder deleteState should be true before the delete");
        folderParent.deleteObject();
        tc.areEqual("1" /* DeleteState.DeletedLocally */, platform.store.getObjectProperty(folderParent, wl.Test.STOREPROPERTYID.idPropertyDeleteState), "Parent folder deleteState should be false after the delete");

        // Delete only marks folders for delete, it doesn't actually delete the folder.  The actual delete happens during sync.
        var folderDead = folderManager.loadFolder(folderChildId);
        tc.isNotNull(folderDead, "Child folder could not be found");
        tc.areEqual("2" /* DeleteState.AncestorDeletedLocally */, platform.store.getObjectProperty(folderDead, wl.Test.STOREPROPERTYID.idPropertyDeleteState), "Child folder deleteState should be false after the delete");
    });

    // Verify basic folder operations works correctly with a child folder
    Tx.test("FolderManagerTest.testChildFolders", function (tc) {
        tc.cleanup = cleanup;
        setUp();
        
        var folder = folderManager.createFolder(account);
        tc.isNotNull(folder, "Failed to create folder");
        
        var folderInbox = folderManager.getSpecialMailFolder(account, wl.MailFolderType.inbox);
        tc.isNotNull(folderInbox, "getSpecialMailFolder returned a null object for the inbox");
        
        folder.folderName = "NotSpecialFolder" + (new Date()).getTime();
        folder.folderType = wl.FolderType.mail;
        folder.parentFolder = folderInbox;
        folder.commit();
        
        tc.areEqual(folder.parentFolder.objectId, folderInbox.objectId, "Folder was not created under the inbox folder");
        
        var inboxChildren = folderInbox.getChildFolderCollection(false);
        tc.isNotNull(inboxChildren, "getChildFolderCollection returned a null object for the inbox");
        tc.areNotEqual(0, inboxChildren.count, "Unexpected number of children");
        
        var calFolder = folderManager.createFolder(account);
        tc.isNotNull(calFolder, "Failed to create folder");
        
        calFolder.folderName = "NotSpecialCalendar" + (new Date()).getTime();
        calFolder.folderType = wl.FolderType.calendar;
        calFolder.parentFolder = folderInbox;
        calFolder.commit();
        
        var inboxChildrenAll = folderInbox.getChildFolderCollection(true);
        tc.isNotNull(inboxChildrenAll, "getChildFolderCollection returned a null object for the inbox");
        tc.isTrue(inboxChildren.count < inboxChildrenAll.count, "Unexpected number of all children " + inboxChildren.count + ", " + inboxChildrenAll.count);
        
        var allFolders = folderManager.getAllFoldersCollection(wl.FolderType.mail, account);
        tc.isNotNull(allFolders, "getAllFoldersCollection should not return a null object");
        tc.isTrue(allFolders.count > 0, "getAllFoldersCollection should be non-empty for mail folders");
        
        var allFoldersAllAccounts = folderManager.getAllFoldersCollection(wl.FolderType.mail);
        tc.isNotNull(allFolders, "getAllFoldersCollection should not return a null object");
        tc.isTrue(allFoldersAllAccounts.count > 0, "getAllFoldersCollection should be non-empty for mail folders");
        
        var fNewFolderFound = false;
        var i = 0;
        for (i = 0; i < allFolders.count; i++)
        {
            var curFolder = allFolders.item(i);
            if (curFolder.folderName == folder.folderName)
            {
                fNewFolderFound = true;
            }
        }
        tc.isTrue(fNewFolderFound, "The created mail folder " + folder.folderName + " was not found");
        
        var folderId = folder.objectId;
        tc.isNotNull(folderId, "folder id for a saved message should not be null");
        
        var folderLoaded = folderManager.loadFolder(folderId);
        tc.isNotNull(folderLoaded, "loadFolder returned a null object for an existing folder");
        tc.areEqual(folder.folderName, folderLoaded.folderName, "Loaded folder has a different name from the saved folder");
        
        try
        {
            folder.parentFolder = folder;
            tc.fail("Setting a folder as its own parent should fail");
        }
        catch(e)
        {
            if (typeof e.number === 'undefined') throw e;
        }
        
        folder.deleteObject();
        calFolder.deleteObject();
    });

    Tx.test("FolderManagerTest.testFolderProperties", function (tc) {
        tc.cleanup = cleanup;
        setUp();

        tc.isNotNull(account, "Could not get the default account");
        
        var folder = folderManager.createFolder(account);
        tc.isNotNull(folder, "Failed to create folder");
        
        // Test properties by setting and getting them
        folder.folderName = "FolderNameName";
        tc.areEqual("FolderNameName", folder.folderName, "Failed to set or get folder name");
        
        try
        {
            folder.folderType = 5999;
            tc.fail("Should fail with folder type out of range");
        }
        catch(e)
        {
            if (typeof e.number === 'undefined') throw e;
        }
        
        try
        {
            folder.folderType = 0;
            tc.fail("Should fail with folder type out of range");
        }
        catch(e)
        {
            if (typeof e.number === 'undefined') throw e;
        }
        
        folder.folderType = wl.FolderType.calendar;
        tc.areEqual(wl.FolderType.calendar, folder.folderType, "Failed to set or get folder type");
        
        try
        {
            folder.folderType = wl.FolderType.mail;
            tc.fail("Shouldn't be able to set folder type twice");
        }
        catch(e)
        {
            if (typeof e.number === 'undefined') throw e;
        }
        
        tc.isNull(folder.parentFolder, "There shouldn't be a parent for a new folder");
        
        // These don't have expected values
        var temp = folder.parentFolder;
        var temp = folder.syncFolderContents;
        var temp = folder.syncStatus;
        
        // Verify it saves correctly
        folder.commit();
        
        folder.deleteObject();
    });

    // Verifies that updating a folder will correctly trigger a change notification
    Tx.test("FolderManagerTest.testChangeNotifications", function (tc) {
        tc.cleanup = cleanup;
        setUp();
               
        tc.isNotNull(account, "Could not get the default account");
        
        var allRootFolders = folderManager.getRootFolderCollection(account);
        var collectionChangeListener = new CollectionListener(allRootFolders);
        allRootFolders.unlock();
        
        var folder;        
        
        var createFolder = function()
        {
            folder = folderManager.createFolder(account);
            folder.folderName = "ExampleNonRootFolder" + (new Date()).getTime();
            folder.folderType = wl.FolderType.mail;
            folder.commit();
        }
        
        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, createFolder, wl.CollectionChangeType.itemAdded, 1), "Collection was not updated after adding a folder");
        
        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, function () { folder.deleteObject(); }, wl.CollectionChangeType.itemRemoved, 1), "Collection was not updated after deleting a folder");
        
        allRootFolders.lock();

        var folder2;
        
        createFolder = function()
        {
            folder2 = folderManager.createFolder(account);
            folder2.folderName = "ExampleNonRootFolder" + (new Date()).getTime();
            folder2.folderType = wl.FolderType.mail;
            folder2.commit();
        }
        tc.isFalse(collectionChangeListener.waitForCollectionChanged(platform, createFolder, wl.CollectionChangeType.itemAdded, 1), "Collection was updated when locked");

        tc.isTrue(collectionChangeListener.unlockCollectionAndWaitForCollectionChanged(platform, wl.CollectionChangeType.itemAdded, 1), "Collection was not updated after unlocking");
                
        collectionChangeListener.dispose();
        allRootFolders.dispose();
    });
})();

