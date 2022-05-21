
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
            emailAddress: senderEmail
        };
    }

    function MockInboxView() {
        this.mockedType = Mail.UIDataModel.MailView;
        this.folder = {
            specialMailFolderType: Plat.MailFolderType.inbox
        };
        this.name = "Inbox";
    }

    function MockPersonView() {
        this.mockedType = Mail.UIDataModel.MailView;
        this.type = Plat.MailViewType.person;
    }

    function MockCustomFolderView() {
        this.mockedType = Mail.UIDataModel.MailView;
        this.name = "Custom Folder";
    }

    var chosenView = null;

    function setup(tc, runMoveAllRuleArguments) {
        var originalGetAppName = Jx.getAppNameFromId;
        Jx.getAppNameFromId = function () {
            return "mail";
        };

        var originalShowMoveAllChooserFlyout = Mail.MoveFlyout.showMoveAllChooserFlyout;
        Mail.MoveFlyout.showMoveAllChooserFlyout = function (container, dialogContent) {
            dialogContent.chosenView = chosenView;
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
            chosenView = null;
            Mail.SweepRules.runMoveAllRule = originalRunMoveAllRule;
            Mail.MoveFlyout.showMoveAllChooserFlyout = originalShowMoveAllChooserFlyout;
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

    Tx.test("MoveAllDialog.testSingleEmail", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [{}];
        setup(tc, actualArguments);
        var emailAddress = "test@example.com",
            selection = {
                account: {},
                messages: [new MockMailMessage(emailAddress)],
                view: new MockInboxView()
        };
        chosenView = new MockCustomFolderView();

        Mail.showMoveAllDialog(selection);

        var dialogRoot = document.getElementById("moveAllDialogRoot");
        tc.isTrue(Jx.isHTMLElement(dialogRoot));

        // With only one email selected, the dialog should list the email address in the heading
        var heading = dialogRoot.querySelector(".moveAllDialogDescription");
        tc.isTrue(heading.innerText.indexOf(emailAddress) !== -1);

        // Every radio button should have a name of "moveType". They should also have a value that
        // maps to an entry in Mail.SweepRules.sweepType
        var radios = dialogRoot.querySelectorAll("input[type='radio']");
        Array.prototype.forEach.call(radios, function (radio) {
            var name = radio.name;
            tc.areEqual(name, "moveType");

            var type = Mail.SweepRules.sweepType[radio.value];
            tc.isTrue(Jx.isNumber(type));
        });

        // The confirm button should be disabled initially
        var confirmButton = document.getElementById("idMoveAllConfirm");
        tc.isTrue(confirmButton.disabled);

        // Clicking the choose folder button and picking something from the flyout should
        // update the text on the button to indicate the folder was changed. For this test,
        // the move flyout has been mocked out by replacing Mail.MoveAllDialogContent.prototype._onChooseFolder
        var chooseFolderButton = document.getElementById("moveAllChooseFolderLink");
        chooseFolderButton.click();
        tc.isTrue(chooseFolderButton.innerText.indexOf(chosenView.name) !== -1);

        // The confirm button should also be enabled now
        tc.isFalse(confirmButton.disabled);

        // Clicking the confirm button should result in a sweep being performed with the expected arguments
        confirmButton.click();

        var expectedArguments = {
            senderEmail: emailAddress,
            sourceView: selection.view,
            destinationView: chosenView,
            sweepType: Mail.SweepRules.sweepType.moveAll
        };
        verifyRunMoveAllRuleArguments(tc, actualArguments[0], expectedArguments);
    });

    Tx.test("MoveAllDialog.testMultipleSenders", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [],
            expectedArguments = [],
            messages = [],
            sourceView = new MockInboxView(),
            destinationView = new MockCustomFolderView(),
            senders = ["test@example.com", "another@example.com", "yet-another@example.com"];
        for (var i = 0; i < senders.length; i++) {
            var email = senders[i];
            actualArguments[i] = {};
            expectedArguments[i] = {
                senderEmail: email,
                sourceView: sourceView,
                destinationView: destinationView,
                sweepType: Mail.SweepRules.sweepType.moveNotMostRecent
            };
            messages[i] = new MockMailMessage(email);
        }
        setup(tc, actualArguments);
        var selection = {
                account: {},
                messages: messages,
                view: sourceView
        };
        chosenView = destinationView;

        Mail.showMoveAllDialog(selection);

        var dialogRoot = document.getElementById("moveAllDialogRoot");
        tc.isTrue(Jx.isHTMLElement(dialogRoot));

        // The dialog should not display any of the email addresses when there is more than one sender
        var heading = dialogRoot.querySelector(".moveAllDialogDescription");
        senders.forEach(function (sender) {
            tc.isTrue(heading.innerText.indexOf(sender) === -1);
        });

        // Choose a non-default radio button
        var moveNotMostRecent = document.querySelector("input[value='moveNotMostRecent']");
        moveNotMostRecent.checked = true;

        var chooseFolderButton = document.getElementById("moveAllChooseFolderLink");
        chooseFolderButton.click();

        // Clicking the confirm button should result in a sweep being performed with the expected arguments
        var confirmButton = document.getElementById("idMoveAllConfirm");
        confirmButton.click();

        for (i = 0; i < expectedArguments.length; i++) {
            verifyRunMoveAllRuleArguments(tc, actualArguments[i], expectedArguments[i]);
        }
    });

    Tx.test("MoveAllDialog.testCancel", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [];
        setup(tc, actualArguments);
        var selection = {
                account: {},
                messages: [new MockMailMessage("test@example.com")],
                view: new MockPersonView()
            };
        chosenView = new MockInboxView();

        Mail.showMoveAllDialog(selection);

        var dialogRoot = document.getElementById("moveAllDialogRoot");
        tc.isTrue(Jx.isHTMLElement(dialogRoot));

        var chooseFolderButton = document.getElementById("moveAllChooseFolderLink");
        chooseFolderButton.click();

        // Clicking the cancel button should result in the dialog closing without performing a sweep
        var cancelButton = document.getElementById("idMoveAllCancel");
        cancelButton.click();
    });
})();
