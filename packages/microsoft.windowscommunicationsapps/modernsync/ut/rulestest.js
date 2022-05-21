
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// Unit tests for Rules functionality

(function() {

    var wl;
    var platform;
    var accountManager;
    var folderManager;
    var account;
    var ruleResource;

    function setup() {   
        wl = Microsoft.WindowsLive.Platform;  
 
        platform = SetupPlatform();
        accountManager = platform.client.accountManager;
        folderManager = platform.client.folderManager;
       
        // Create a clean account for every test run
        account = accountManager.defaultAccount;
    }

    function cleanup() {   
        platform.dispose();
        platform = null;
  
        account = null;
        folderManager = null;      
        ruleResource = null;
        accountManager = null;	
    }
 
    // Verify user can create a rule:
    Tx.test("RulesTest.testCreateRules", function (tc) {
        tc.cleanup = cleanup;
        setup();
   
        ruleResource = account.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.mailRule);  
        tc.isNotNull(ruleResource);

        var rulesCollection = ruleResource.rules;

        var collectionChangeListener = new CollectionListener(rulesCollection);
        rulesCollection.unlock();

        var rule;

        var deletedItemsFolder = folderManager.getSpecialMailFolder(account, wl.MailFolderType.deletedItems);

        var createRule = function()
        {
            rule = ruleResource.createRule();
            rule.actionType = Microsoft.WindowsLive.Platform.MailRuleActionType.move;
            rule.deferredActionType = Microsoft.WindowsLive.Platform.MailRuleDeferredActionType.none;
            rule.deferredActionAge = 0;
            rule.senderEmailAddress = account.emailAddress;
            rule.targetFolderId = deletedItemsFolder.objectId;
            rule.commit();
        }
        
        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, createRule, wl.CollectionChangeType.itemAdded, 1), "Collection was not updated after adding a rule");
        tc.isTrue(collectionChangeListener.waitForCollectionChanged(platform, function () { rule.deleteObject(); }, wl.CollectionChangeType.itemRemoved, 1), "Collection was not updated after deleting a rule");
        
        rulesCollection.lock();
        collectionChangeListener.dispose();
        rulesCollection.dispose();
    });
})();