
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function() {

    var Plat = Microsoft.WindowsLive.Platform,
        inboxId = "InboxFolderId",
        deletedItemsId = "DeletedItemsFolderId";

    var setup = function (tc, rules) {
        var origCreateRule = Mail.SweepRules._createRule,
            createRuleCalls = 0;

        tc.cleanup = function () {
            Mail.SweepRules._createRule = origCreateRule;
        };

        Mail.SweepRules._createRule = function () {
            tc.isTrue(createRuleCalls <= rules.length);
            var rule = rules[createRuleCalls];

            createRuleCalls++;
            return rule;
        };
    };

    var MockView = function (folderId, viewType) {
        this.mockedType = Mail.UIDataModel.MailView;
        this.type = viewType;
        this.account = account;
        this.accountId = "account";

        if ((viewType >= Plat.MailViewType.draft) && (viewType <= Plat.MailViewType.userGeneratedFolder)) {
            this.folder = {
                objectId: folderId
            };
        } else {
            this.platformMailFolder = null;
        }
    };

    var account = {
        mockedType: Mail.Account,
        objectId: "account",
        inboxView: new MockView(inboxId, Plat.MailViewType.inbox),
        deletedView: new MockView(deletedItemsId, Plat.MailViewType.deletedItems),
    };
    account.inboxView.account = account;
    account.deletedView.account = account;

    var MockRule = function (tc) {
        this._tc = tc;
        this.commitCalled = false;
        this.runMailRuleCalled = false;
    };

    MockRule.prototype.commit = function () {
        this.commitCalled = true;
    };

    MockRule.prototype.runMailRule = function (scopeFolderId) {
        this._tc.isFalse(this.runMailRuleCalled); // We should never call runMailRule() more than once on a given rule
        this.runMailRuleCalled = true;
        this.scopeFolderId = scopeFolderId;
    };

    var verifySweepRule = function (tc, actualRule, expectedRule) {
        tc.areEqual(actualRule.actionType, expectedRule.actionType);
        tc.areEqual(actualRule.deferredActionAge, expectedRule.deferredActionAge);
        tc.areEqual(actualRule.deferredActionType, expectedRule.deferredActionType);
        tc.areEqual(actualRule.scopeFolderId, expectedRule.scopeFolderId);
        tc.areEqual(actualRule.senderEmailAddress, expectedRule.senderEmailAddress);
        tc.areEqual(actualRule.targetCategoryId, expectedRule.targetCategoryId);
        tc.areEqual(actualRule.targetFolderId, expectedRule.targetFolderId);
        tc.areEqual(actualRule.commitCalled, expectedRule.commitCalled);
        tc.isTrue(actualRule.runMailRuleCalled);
    };

    Tx.test("SweepRules.testSweepAllInbox", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            sweepEmailAddress = "junk@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runSweepRule(sweepEmailAddress, account.inboxView, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: deletedItemsId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testSweepTenDaysPersonView", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            personView = new MockView("PersonView", Plat.MailViewType.person),
            sweepEmailAddress = "junk@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runSweepRule(sweepEmailAddress, personView, Mail.SweepRules.sweepType.moveTenDays);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 10,
            deferredActionType: Plat.MailRuleDeferredActionType.days,
            scopeFolderId: "",
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: deletedItemsId,
            commitCalled: true
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testSweepNotMostRecentCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "junk@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runSweepRule(sweepEmailAddress, customFolder, Mail.SweepRules.sweepType.moveNotMostRecent);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 1,
            deferredActionType: Plat.MailRuleDeferredActionType.count,
            scopeFolderId: "",
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: deletedItemsId,
            commitCalled: true
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testSweepAllAndBlockNewsletter", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            sweepEmailAddress = "junk@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runSweepRule(sweepEmailAddress, newsletterView, Mail.SweepRules.sweepType.moveAllFuture);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: deletedItemsId,
            commitCalled: true
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllInboxCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, account.inboxView, customFolder, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: customFolderId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllFutureCustomInbox", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, customFolder, account.inboxView, Mail.SweepRules.sweepType.moveAllFuture);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: customFolderId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: inboxId,
            commitCalled: true
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveTenDaysInboxCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, account.inboxView, customFolder, Mail.SweepRules.sweepType.moveTenDays);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 10,
            deferredActionType: Plat.MailRuleDeferredActionType.days,
            scopeFolderId: "",
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: customFolderId,
            commitCalled: true
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveNotMostRecentInboxCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, account.inboxView, customFolder, Mail.SweepRules.sweepType.moveNotMostRecent);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 1,
            deferredActionType: Plat.MailRuleDeferredActionType.count,
            scopeFolderId: "",
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: customFolderId,
            commitCalled: true
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllCustomCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            customFolderId1 = "JustSomeFolder",
            customFolder1 = new MockView(customFolderId1, Plat.MailViewType.userGeneratedFolder),
            customFolderId2 = "AnotherFolder",
            customFolder2 = new MockView(customFolderId2, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, customFolder1, customFolder2, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: customFolderId1,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: customFolderId2,
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllInboxNewsletter", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, account.inboxView, newsletterView, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.addCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.newsletter,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllInboxSocial", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            socialView = new MockView("SocialId", Plat.MailViewType.social),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, account.inboxView, socialView, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.addCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.social,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllNewsletterInbox", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, newsletterView, account.inboxView, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.removeCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.newsletter,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllSocialInbox", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            socialView = new MockView("SocialId", Plat.MailViewType.social),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, socialView, account.inboxView, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.removeCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.social,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllPersonCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            personView = new MockView("PersonId", Plat.MailViewType.person),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, personView, customFolder, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: "",
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: customFolderId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllNewsletterSocial", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRules = [ new MockRule(tc), new MockRule(tc) ],
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            socialView = new MockView("SocialId", Plat.MailViewType.social),
            sweepEmailAddress = "someone@example.com";
        setup(tc, actualRules);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, newsletterView, socialView, Mail.SweepRules.sweepType.moveAll);

        var expectedDecategorizeRule = {
            actionType: Plat.MailRuleActionType.removeCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.newsletter,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[0], expectedDecategorizeRule);

        var expectedCategorizeRule = {
            actionType: Plat.MailRuleActionType.addCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.social,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[1], expectedCategorizeRule);
    });

    Tx.test("SweepRules.testMoveAllSocialNewsletter", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRules = [ new MockRule(tc), new MockRule(tc) ],
            socialView = new MockView("SocialId", Plat.MailViewType.social),
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            sweepEmailAddress = "someone@example.com";
        setup(tc, actualRules);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, socialView, newsletterView, Mail.SweepRules.sweepType.moveAll);

        var expectedDecategorizeRule = {
            actionType: Plat.MailRuleActionType.removeCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.social,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[0], expectedDecategorizeRule);

        var expectedCategorizeRule = {
            actionType: Plat.MailRuleActionType.addCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.newsletter,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[1], expectedCategorizeRule);
    });

    Tx.test("SweepRules.testMoveAllNewsletterCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRules = [ new MockRule(tc), new MockRule(tc) ],
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, actualRules);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, newsletterView, customFolder, Mail.SweepRules.sweepType.moveAll);

        var expectedDecategorizeRule = {
            actionType: Plat.MailRuleActionType.removeCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.newsletter,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[0], expectedDecategorizeRule);

        var expectedMoveRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: customFolderId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[1], expectedMoveRule);
    });

    Tx.test("SweepRules.testMoveAllSocialCustom", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRules = [ new MockRule(tc), new MockRule(tc) ],
            socialView = new MockView("SocialId", Plat.MailViewType.social),
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            sweepEmailAddress = "someone@example.com";
        setup(tc, actualRules);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, socialView, customFolder, Mail.SweepRules.sweepType.moveAll);

        var expectedDecategorizeRule = {
            actionType: Plat.MailRuleActionType.removeCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.social,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[0], expectedDecategorizeRule);

        var expectedMoveRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: customFolderId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[1], expectedMoveRule);
    });

    Tx.test("SweepRules.testMoveAllCustomNewsletter", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRules = [ new MockRule(tc), new MockRule(tc) ],
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            sweepEmailAddress = "someone@example.com";
        setup(tc, actualRules);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, customFolder, newsletterView, Mail.SweepRules.sweepType.moveAll);

        var expectedMoveRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: customFolderId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: inboxId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[0], expectedMoveRule);

        var expectedCategorizeRule = {
            actionType: Plat.MailRuleActionType.addCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.newsletter,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[1], expectedCategorizeRule);
    });

    Tx.test("SweepRules.testMoveAllCustomSocial", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRules = [ new MockRule(tc), new MockRule(tc) ],
            customFolderId = "NotTheInboxId",
            customFolder = new MockView(customFolderId, Plat.MailViewType.userGeneratedFolder),
            socialView = new MockView("SocialId", Plat.MailViewType.social),
            sweepEmailAddress = "someone@example.com";
        setup(tc, actualRules);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, customFolder, socialView, Mail.SweepRules.sweepType.moveAll);

        var expectedMoveRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: customFolderId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: inboxId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[0], expectedMoveRule);

        var expectedCategorizeRule = {
            actionType: Plat.MailRuleActionType.addCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.social,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[1], expectedCategorizeRule);
    });

    Tx.test("SweepRules.testMoveAllPersonInbox", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRule = new MockRule(tc),
            personView = new MockView("PersonView", Plat.MailViewType.person),
            sweepEmailAddress = "someone@example.com";
        setup(tc, [actualRule]);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, personView, account.inboxView, Mail.SweepRules.sweepType.moveAll);

        var expectedRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: "",
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: inboxId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRule, expectedRule);
    });

    Tx.test("SweepRules.testMoveAllPersonNewsletter", {owner:"kevbarn", priority:0}, function (tc) {
        var actualRules = [ new MockRule(tc), new MockRule(tc) ],
            personView = new MockView("PersonView", Plat.MailViewType.person),
            newsletterView = new MockView("NewsletterId", Plat.MailViewType.newsletter),
            sweepEmailAddress = "someone@example.com";
        setup(tc, actualRules);

        Mail.SweepRules.runMoveAllRule(sweepEmailAddress, personView, newsletterView, Mail.SweepRules.sweepType.moveAll);

        var expectedMoveRule = {
            actionType: Plat.MailRuleActionType.move,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: "",
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.none,
            targetFolderId: inboxId,
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[0], expectedMoveRule);

        var expectedCategorizeRule = {
            actionType: Plat.MailRuleActionType.addCategory,
            deferredActionAge: 0,
            deferredActionType: Plat.MailRuleDeferredActionType.none,
            scopeFolderId: inboxId,
            senderEmailAddress: sweepEmailAddress,
            targetCategoryId: Plat.MailRuleCategoryId.newsletter,
            targetFolderId: "",
            commitCalled: false
        };

        verifySweepRule(tc, actualRules[1], expectedCategorizeRule);
    });
})();
