
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $, BVT, testCleanup, MailTest, WinJS, Tx */
(function () {

    // register all class wide functions here to avoid the need for stuff...
    var testInitialize = function (tc) {
        tc.stop();
        return {
            // testCleanup function that cleans up after running a test. Not to be confused with tc.cleanup
            testCleanup: function () { tc.start(); },

            // testFailure function that cleans up after failing a test.
            testFailure: function (failure) { tc.error(failure); testCleanup(tc); },
        };
    };

    // Creates a new email, sends it. Verifies that the email is in the sent item folder
    // then deletes it from the sent items folder.  Finally, this test selects the deleted
    // folder (but doesn't validate the item is there).
    BVT.Test("DeleteMessage", function (tc) {
        var test = testInitialize(tc);
        var emailSubject = "Hello " + Date.now().toString();
        MailTest.createMessage()
        .then(function () {
            MailTest.composeLfm.subject(emailSubject);
            MailTest.composeLfm.to("notarealaccount@x48sdsd023.com");
            return MailTest.composeLfm.sendMail();
        })
        .then(function () { return MailTest.selectFolder("Sent"); })
        .then(function () { return MailTest.deleteEmail(emailSubject); })
        .then(function () { return MailTest.selectFolder("Deleted"); })
        .done(test.testCleanup, test.testFailure);
    });

    // Opens the sweep flyout, then closes the sweep flyout by clicking away
    BVT.Test("OpenCloseSweepFlyout", function (tc) {
        var test = testInitialize(tc);
        test.openSweepFlyout = function () {
            return MailTest.openSweepFlyout(function () {
                tc.isFalse($("#mailSweepFlyout")[0].hidden, "Verify sweep flyout is visible");
            });
        };

        test.dismissFlyout = function () {
            return MailTest.dismissFlyout("mailSweepFlyout", function () {
                tc.isTrue($("#mailSweepFlyout")[0] === undefined, "Verify the sweep flyout is not in the DOM");
            });
        };

        // run test
        test.openSweepFlyout()
        .then(test.dismissFlyout)
        .done(test.testCleanup, test.testFailure);
    });

    // Opens the move all from dialog then closes the move all from dialog
    BVT.Test("OpenCloseMoveAllFrom", function (tc) {
        var test = testInitialize(tc);

        // Opens the move all from dialog and verifies the submit button is disabled
        test.openMoveAllFromDialog = function () {
            return MailTest.openMoveAllFromDialog(function () {
                tc.isTrue($("#idMoveAllConfirm")[0].disabled, "Verify the submit button is disabled");
            });
        };

        // Cancels out of the move all from dialog
        test.closeMoveAllFromDialog = function () {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("MoveAllDialogContent_deactivateUI,StopTM,Mail", function () {
                    Tx.log("Move all dialog dismissed");
                    complete();
                });

                $("#idMoveAllCancel")[0].click();
            });
        };

        test.openMoveAllFromDialog()
        .then(test.closeMoveAllFromDialog)
        .done(test.testCleanup, test.testFailure);
    });
})();
