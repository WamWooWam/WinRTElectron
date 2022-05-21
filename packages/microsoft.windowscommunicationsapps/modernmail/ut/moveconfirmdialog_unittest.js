
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Microsoft,Jx,Tx*/

(function() {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    function MockMailMessage(senderEmail) {
        this.from = {
            calculatedUIName: "Some Person",
            emailAddress: senderEmail
        };
    }

    function MockInboxView() {
        this.mockedType = Mail.UIDataModel.MailView;
        this.name = "Inbox";
        this.type = Plat.MailViewType.inbox;
    }

    function MockNewsletterView() {
        this.mockedType = Mail.UIDataModel.MailView;
        this.name = "Newsletters";
        this.type = Plat.MailViewType.newsletter;
    }

    function MockSocialView() {
        this.mockedType = Mail.UIDataModel.MailView;
        this.name = "Social";
        this.type = Plat.MailViewType.social;
    }

    function MockCustomFolderView() {
        this.mockedType = Mail.UIDataModel.MailView;
        this.name = "Custom Folder";
        this.type = Plat.MailViewType.userGeneratedFolder;
    }

    function MockSelection(tc, messages, view) {
        this.mockedType = Mail.Selection;
        this._tc = tc;
        this.messages = messages;
        this.view = view;
        this.moveDestination = null;
    }

    MockSelection.prototype = {
        moveItemsTo: function (destination) {
            // moveItemsTo should not be called more than once per object
            this._tc.isNull(this.moveDestination);
            this.moveDestination = destination;
        }
    };

    function setup(tc, runMoveAllRuleArguments) {
        var originalGetAppName = Jx.getAppNameFromId;
        Jx.getAppNameFromId = function () {
            return "mail";
        };

        var runMoveAllRuleCalls = 0,
            originalRunMoveAllRule = Mail.SweepRules.runMoveAllRule;
        Mail.SweepRules.runMoveAllRule = function (senderEmail, sourceView, destinationView, sweepType) {
            tc.isTrue(runMoveAllRuleCalls < runMoveAllRuleArguments.length);
            var args = runMoveAllRuleArguments[runMoveAllRuleCalls];
            args.senderEmail = senderEmail;
            args.sourceView = sourceView;
            args.destinationView = destinationView;
            args.sweepType = sweepType;

            runMoveAllRuleCalls++;
        };

        tc.cleanup = function () {
            Mail.SweepRules.runMoveAllRule = originalRunMoveAllRule;
            Jx.getAppNameFromId = originalGetAppName;

            // Ending the test with the dialog open will break subsequent tests
            var dialogOverlay = document.querySelector(".overlay-root");
            tc.isNull(dialogOverlay);
        };
    }

    function verifyRunMoveAllRuleArguments(tc, actualArguments, expectedArguments) {
        tc.areEqual(actualArguments.senderEmail, expectedArguments.senderEmail);
        tc.areEqual(actualArguments.sourceView, expectedArguments.sourceView);
        tc.areEqual(actualArguments.destinationView, expectedArguments.destinationView);
        tc.areEqual(actualArguments.sweepType, expectedArguments.sweepType);
    }

    Tx.test("MoveConfirm.testSingleEmailInboxNewsletter", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [{}];
        setup(tc, actualArguments);
        var emailAddress = "test@example.com",
            messages = [new MockMailMessage(emailAddress)],
            sourceView = new MockInboxView(),
            selection = new MockSelection(tc, messages, sourceView),
            destinationView = new MockNewsletterView();

        Mail.moveWithConfirmation(selection, destinationView);

        var dialogRoot = document.getElementById("moveConfirmDialogRoot");
        tc.isTrue(Jx.isHTMLElement(dialogRoot));

        // With only one email selected, the dialog should list the email address in the heading
        var heading = dialogRoot.querySelector(".moveConfirmDescription");
        tc.isTrue(heading.innerText.indexOf(emailAddress) !== -1);

        // With only one email selected, the move button should use the singular text
        var moveButton = document.getElementById("idMoveConfirmMove");
        tc.areEqual(moveButton.value, Jx.res.getString("mailMoveConfirmMoveButtonSingular"));

        // Clicking the create rule button should result in a call to SweepRules.runMoveAllRule
        var createRuleButton = document.getElementById("idMoveConfirmCreateRule");
        createRuleButton.click();

        var expectedArguments = {
            senderEmail: emailAddress,
            sourceView: sourceView,
            destinationView: destinationView,
            sweepType: Mail.SweepRules.sweepType.moveAllFuture
        };
        verifyRunMoveAllRuleArguments(tc, actualArguments[0], expectedArguments);
    });

    Tx.test("MoveConfirm.testTwoEmailsSameSenderSocialCustom", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [];
        setup(tc, actualArguments);
        var emailAddress = "test@example.com",
            messages = [new MockMailMessage(emailAddress), new MockMailMessage(emailAddress)],
            sourceView = new MockSocialView(),
            selection = new MockSelection(tc, messages, sourceView),
            destinationView = new MockCustomFolderView();

        Mail.moveWithConfirmation(selection, destinationView);

        var dialogRoot = document.getElementById("moveConfirmDialogRoot");
        tc.isTrue(Jx.isHTMLElement(dialogRoot));

        // When all the selected emails are from one sender, the dialog should list the email address in the heading
        var heading = dialogRoot.querySelector(".moveConfirmDescription");
        tc.isTrue(heading.innerText.indexOf(emailAddress) !== -1);

        // With multiple messages selected, the move button should use the plural text
        var moveButton = document.getElementById("idMoveConfirmMove");
        tc.areEqual(moveButton.value, Jx.res.getString("mailMoveConfirmMoveButtonPlural"));

        // Clicking the move button should result in a call to selection.moveItemsTo
        moveButton.click();

        tc.areEqual(selection.moveDestination, destinationView);
    });

    Tx.test("MoveConfirm.testTwoEmailsTwoSendersInboxSocial", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [];
        setup(tc, actualArguments);
        var emailAddresses = ["test@example.com", "another@example.com"],
            messages = [],
            expectedArguments = [],
            sourceView = new MockInboxView(),
            destinationView = new MockSocialView();

        for (var i = 0; i < emailAddresses.length; i++) {
            var email = emailAddresses[i];
            messages[i] = new MockMailMessage(email);
            actualArguments[i] = {};
            expectedArguments[i] = {
                senderEmail: email,
                sourceView: sourceView,
                destinationView: destinationView,
                sweepType: Mail.SweepRules.sweepType.moveAllFuture
            };
        }
        var selection = new MockSelection(tc, messages, sourceView);

        Mail.moveWithConfirmation(selection, destinationView);

        var dialogRoot = document.getElementById("moveConfirmDialogRoot");
        tc.isTrue(Jx.isHTMLElement(dialogRoot));

        // When the selected messages are from more than one sender, the dialog should not list any email addresses
        var heading = dialogRoot.querySelector(".moveConfirmDescription");
        emailAddresses.forEach(function (email) {
            tc.isTrue(heading.innerText.indexOf(email) === -1);
        });

        // With multiple messages selected, the move button should use the plural text
        var moveButton = document.getElementById("idMoveConfirmMove");
        tc.areEqual(moveButton.value, Jx.res.getString("mailMoveConfirmMoveButtonPlural"));

        // Clicking the create rule button should result in multiple calls to SweepRules.runMoveAllRule
        var createRuleButton = document.getElementById("idMoveConfirmCreateRule");
        createRuleButton.click();

        for (i = 0; i < expectedArguments.length; i++) {
            verifyRunMoveAllRuleArguments(tc, actualArguments[i], expectedArguments[i]);
        }
    });

    Tx.test("MoveConfirm.testSingleEmailInboxCustom", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [];
        setup(tc, actualArguments);
        var emailAddress = "test@example.com",
            messages = [new MockMailMessage(emailAddress)],
            sourceView = new MockInboxView(),
            selection = new MockSelection(tc, messages, sourceView),
            destinationView = new MockCustomFolderView();

        // Attempting to move a message between two views that are not newsletter or social
        // should immediately call selection.moveItemsTo without showing a dialog
        Mail.moveWithConfirmation(selection, destinationView);

        tc.areEqual(selection.moveDestination, destinationView);
    });
})();
