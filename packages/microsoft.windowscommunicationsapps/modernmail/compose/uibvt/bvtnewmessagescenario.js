
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global WinJS, setTimeout, BVT, ComposeLfm */

(function () {
    var timeoutMs = 15000;
    var composeLfm = new ComposeLfm();
    
    // testInitialize function that launches Compose if necessary
    var testInitialize = function (tc) {
        tc.stop();
    };

    // testCleanup function that cleans up after running a test. Not to be confused with tc.cleanup
    var testCleanup = function (tc) {
        if (BVT.isVisible(composeLfm.objectModel.window))
        {
            composeLfm.discardDraft();
        }
        setTimeout(function () {
            // Arbitrarily waiting 3 seconds here after the test completes to allow for tester
            // inspection. After 3 seconds tc.start() continues with the next test in this file.
            tc.start();
        }, 3000);
    };
    
    BVT.Test("DraftMessageListItem", function (tc) {
        testInitialize(tc);
        var emptySubject = "[Draft]\r\nNo subject";
        var mailSubject = "DraftMessageListItem " + Date.now().toString();

        MailTest.createMessage()
        .then(function () {
            var mail = MailTest.getMailItemBySubject(emptySubject)._value;
            tc.isTrue(MailTest.isMailSelected(mail), "Mail was not selected in message list");
            tc.isTrue(BVT.isVisible(mail), "Message list item was not visible alongside Compose");
            tc.isTrue(BVT.isVisible(composeLfm.objectModel.window), "Compose was not visible alongside the MessageList");
            composeLfm.subject(mailSubject);
            return composeLfm.save(true);
        })
        .then(function () {
            tc.isTrue(MailTest.getMailItemBySubject(mailSubject) !== undefined, "Preview text was not updated on save");
            return composeLfm.discardDraft();
        })
        .done(function (/*success*/) {
            // This is the success function. It gets called if all previous promises returned success.
            testCleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            testCleanup(tc);
        });
    });

    BVT.Test("AddressWellCheck", { timeoutMs: timeoutMs }, function (tc) {
        testInitialize(tc);
        var recipients = ["foo", "bar"];

        MailTest.createMessage()
        .then(function () {
            tc.isTrue(BVT.isVisible(composeLfm.objectModel.toLine.inputField), "To Line was not onscreen after Compose launched.");
            tc.isTrue(BVT.isVisible(composeLfm.objectModel.ccLine.inputField), "CC Line was not onscreen after Compose launched.");
            tc.strictEqual(composeLfm.to().length, 0, "To Line was not empty after Compose launched.");
            return composeLfm.to(recipients);
        })
        .then(function () {
            tc.strictEqual(composeLfm.to().length, 2, "ToLine did not have the right number of recipients");
            tc.areNotEqual(composeLfm.to().indexOf(recipients[0]), -1, "Recipient  was not added to the To line");
            tc.areNotEqual(composeLfm.to().indexOf(recipients[1]), -1, "Recipient  was not added to the To line");
            return composeLfm.discardDraft();
        })
        .done(function (/*success*/) {
            // This is the success function. It gets called if all previous promises returned success.
            testCleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            testCleanup(tc);
        });
    });
})();
