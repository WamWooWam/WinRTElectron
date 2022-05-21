
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Microsoft,Jx,Tx,WinJS*/

(function() {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        sandbox = null;

    var mockCommandManager = {
        showAppBar: function () {
            return new WinJS.Promise(function (complete) {
                complete();
            });
        }
    };

    function MockMailMessage(senderEmail) {
        this.from = {
            calculatedUIName: "Test Sender",
            emailAddress: senderEmail
        };
    }

    function MockInboxView() {
        this.type = Plat.MailViewType.inbox;
        this.folder = {
            specialMailFolderType: Plat.MailFolderType.inbox
        };
    }

    function MockPersonView() {
        this.type = Plat.MailViewType.person;
    }

    function setup (tc, runSweepRuleArguments) {
        WinJS.UI.disableAnimations();
        var originalCommandManager = Mail.Globals.commandManager;
        Mail.Globals.commandManager = mockCommandManager;

        var runSweepRuleCalls = 0;
        var originalRunSweepRule = Mail.SweepRules.runSweepRule;
        Mail.SweepRules.runSweepRule = function (senderEmail, view, sweepType) {
            tc.isTrue(runSweepRuleCalls < runSweepRuleArguments.length);
            var args = runSweepRuleArguments[runSweepRuleCalls];
            args.senderEmail = senderEmail;
            args.view = view;
            args.sweepType = sweepType;

            runSweepRuleCalls++;
        };

        var originalRootId = Mail.CompApp.rootElementId;
        Mail.CompApp.rootElementId = "sandbox";
        sandbox = document.getElementById(Mail.CompApp.rootElementId);

        tc.cleanup = function () {
            sandbox.innerText = "";
            sandbox = null;
            Mail.SweepRules.runSweepRule = originalRunSweepRule;
            Mail.CompApp.rootElementId = originalRootId;
            Mail.Globals.commandManager = originalCommandManager;
            WinJS.UI.enableAnimations();
        };
    }

    function verifyRunSweepRuleArguments(tc, actualArguments, expectedArguments) {
        tc.areEqual(actualArguments.senderEmail, expectedArguments.senderEmail);
        tc.areEqual(actualArguments.view, expectedArguments.view);
        tc.areEqual(actualArguments.sweepType, expectedArguments.sweepType);
    }

    Tx.test("SweepFlyout.testSingleEmail", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [{}];
        setup(tc, actualArguments);
        var selection = {
            account: {},
            messages: [new MockMailMessage("test@example.com")],
            view: new MockInboxView()
        };

        Mail.SweepFlyout.onSweepButton(selection);

        // The sweep flyout should display the sender's name and email address when we only have a single
        // message selected.
        var senderName = sandbox.querySelector("#mailSweepSenderName");
        tc.isTrue(Jx.isHTMLElement(senderName));
        var senderEmail = sandbox.querySelector("#mailSweepSenderEmail");
        tc.isTrue(Jx.isHTMLElement(senderEmail));

        // Every radio button should have a name of "sweepType". They should also have a value that
        // maps to an entry in Mail.SweepRules.sweepType
        var radios = sandbox.querySelectorAll("input[type='radio']");
        Array.prototype.forEach.call(radios, function (radio) {
            var name = radio.name;
            tc.areEqual(name, "sweepType");

            var type = Mail.SweepRules.sweepType[radio.value];
            tc.isTrue(Jx.isNumber(type));
        });

        // Submit the form and verify the expected arguments are passed to Mail.SweepRules
        var button = sandbox.querySelector("#mailSweepConfirmButton");
        button.click();

        var expectedArguments = {
            senderEmail: "test@example.com",
            view: selection.view,
            sweepType: Mail.SweepRules.sweepType.moveAll
        };

        verifyRunSweepRuleArguments(tc, actualArguments[0], expectedArguments);
    });

    Tx.test("SweepFlyout.testTwoEmailsSameSender", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [{}];
        setup(tc, actualArguments);
        var selection = {
            account: {},
            messages: [new MockMailMessage("test@example.com"),
                new MockMailMessage("test@example.com")],
            view: new MockPersonView()
        };

        Mail.SweepFlyout.onSweepButton(selection);

        // The sweep flyout should display the sender's name and email address when all the
        // selected messages are from the same email address
        var senderName = sandbox.querySelector("#mailSweepSenderName");
        tc.isTrue(Jx.isHTMLElement(senderName));
        var senderEmail = sandbox.querySelector("#mailSweepSenderEmail");
        tc.isTrue(Jx.isHTMLElement(senderEmail));

        // Choose a non-default radio button
        var moveAllFuture = sandbox.querySelector("input[value='moveAllFuture']");
        moveAllFuture.checked = true;

        // Submit the form and verify the expected arguments are passed to Mail.SweepRules
        var button = sandbox.querySelector("#mailSweepConfirmButton");
        button.click();

        var expectedArguments = {
            senderEmail: "test@example.com",
            view: selection.view,
            sweepType: Mail.SweepRules.sweepType.moveAllFuture
        };

        verifyRunSweepRuleArguments(tc, actualArguments[0], expectedArguments);
    });

    Tx.test("SweepFlyout.testMultipleSenders", {owner:"kevbarn"}, function (tc) {
        var actualArguments = [],
            expectedArguments = [],
            messages = [],
            senders = ["test@example.com", "test2@example.com"],
            view = new MockInboxView();
        for (var i = 0; i < senders.length; i++) {
            var email = senders[i];
            actualArguments[i] = {};
            expectedArguments[i] = {
                senderEmail: email,
                view: view,
                sweepType: Mail.SweepRules.sweepType.moveNotMostRecent
            };
            messages[i] = new MockMailMessage(email);
        }

        setup(tc, actualArguments);
        var selection = {
            account: {},
            messages: messages,
            view: view
        };

        Mail.SweepFlyout.onSweepButton(selection);

        // The sweep flyout should not try to display a sender name or
        // email address when we have multiple senders selected
        var senderName = sandbox.querySelector("#mailSweepSenderName");
        tc.isNull(senderName);
        var senderEmail = sandbox.querySelector("#mailSweepSenderEmail");
        tc.isNull(senderEmail);

        // Choose a non-default radio button
        var moveAllFuture = sandbox.querySelector("input[value='moveNotMostRecent']");
        moveAllFuture.checked = true;

        // Submit the form and verify the expected arguments are passed to Mail.SweepRules
        var button = sandbox.querySelector("#mailSweepConfirmButton");
        button.click();

        verifyRunSweepRuleArguments(tc, actualArguments[0], expectedArguments[0]);
        verifyRunSweepRuleArguments(tc, actualArguments[1], expectedArguments[1]);
    });
})();
