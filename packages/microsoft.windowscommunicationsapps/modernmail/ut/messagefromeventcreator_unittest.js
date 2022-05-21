
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    function setup (tc) {
        var preserver = new Jm.Preserve();
        tc.cleanup = function() {
            preserver.restore();
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreJx();
        };

        preserver.preserve(Compose, "platform");

        // Throw (and fail unit tests) on asserts
        if (window.Debug) {
            preserver.preserve(Debug, "throwOnAssert");
            Debug.throwOnAssert = true;
        }

        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.setupCalendarStubs();
    }

    Tx.test("MessageFromEventCreator_UnitTest.test_messageFromEventForward", function (tc) {
        /// <summary>Verifies the mail message is created correctly for forwarded events, and the callback is called</summary>
        setup(tc);

        var fakeEvent = {
            fakeId: "this is the fake event"
        };

        var fakeAccount = {
            id: "this is the account"
        };

        var fakeMail = {
            mockedType: Microsoft.WindowsLive.Platform.MailMessage
        };

        var mailCreated = false;
        var callbackCalled = false;

        Compose.platform = {
            invitesManager: {
                createSmartForwardMail: function (originalEvent, account) {
                    tc.areEqual(fakeEvent, originalEvent, "Unexpected object passed as event");
                    tc.areEqual(fakeAccount, account, "Unexpected account");
                    mailCreated = true;

                    return fakeMail;
                }
            }
        };

        function createCallback(callbackMessage) {
            callbackCalled = true;

            tc.areEqual(fakeMail, callbackMessage, "Unexpected mail message in callback");
        }
        var creator = Compose.MessageFromEventCreator.instance(fakeEvent, fakeAccount, Compose.CalendarActionType.forward);
        creator.setCallback(createCallback);
        creator.createMessage();
        creator.onMessageCreated();

        tc.isTrue(mailCreated, "Expected call to create mail");
        tc.isTrue(callbackCalled, "Expected a call to the callback");
    });

    function verifyMessageFromEventReply(tc, action) {
        /// <summary>Verifies the message is created correctly for reply scenarios (helper to reuse code)</summary>

        var callbackCalled = false;

        var fakeMail = {
            mockedType: Microsoft.WindowsLive.Platform.MailMessage
        };

        Compose.platform = {
            mailManager: {
                createMessage: function () { return fakeMail; }
            }
        };

        function createCallback(callbackMessage) {
            callbackCalled = true;

            tc.areEqual(fakeMail, callbackMessage, "Unexpected message in callback");
        }

        var creator = Compose.MessageFromEventCreator.instance({}, {}, action);
        creator.setCallback(createCallback);
        var resultMessage = creator.createMessage();
        creator.onMessageCreated();

        tc.isTrue(callbackCalled, "Failed to call create callback");
        tc.areEqual(fakeMail, resultMessage, "Unexpected message returned from create");
    }

    Tx.test("MessageFromEventCreator_UnitTest.test_messageFromEventReply", function (tc) {
        /// <summary>Verifies the message is created correctly for Reply scenario</summary>
        setup(tc);

        verifyMessageFromEventReply(tc, Compose.CalendarActionType.reply);
    });

    Tx.test("MessageFromEventCreator_UnitTest.test_messageFromEventReplyAll", function (tc) {
        /// <summary>Verifies the message is created correctly for ReplyAll scenario</summary>
        setup(tc);

        verifyMessageFromEventReply(tc, Compose.CalendarActionType.replyAll);
    });

    Tx.test("MessageFromEventCreator_UnitTest.test_messageFromEventCancel", function (tc) {
        /// <summary>Verifies the message is created correctly for Cancel scenario</summary>
        setup(tc);

        var originalMeetingStatus = 5;

        var fakeEvent = {
            id: "fake Event",
            meetingStatus: originalMeetingStatus,
            subject: "Event subject",
            isOrganizer: true
        };
        var fakeAccount = {
            id: "fake Account"
        };
        var fakeMail = {
            id: "This is the fake mail",
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled
        };

        Compose.platform = {
            invitesManager: {
                mailFromEvent: function (originalEvent, account) {
                    tc.areEqual(fakeEvent, originalEvent, "Unexpected object passed as event");
                    tc.areEqual(fakeAccount, account, "Unexpected account");

                    return fakeMail;
                }
            }
        };

        var creator = Compose.MessageFromEventCreator.instance(fakeEvent, fakeAccount, Compose.CalendarActionType.cancel);
        var resultMessage = creator.createMessage();
        creator.onMessageCreated();

        tc.areEqual(fakeMail, resultMessage, "Unexpected message returned from create");
    });

    Tx.test("MessageFromEventCreator_UnitTest.test_messageFromEventForwardNoCallback", function (tc) {
        /// <summary>Verifies that MessageFromEventCreator correctly handles it when there is no callback</summary>
        setup(tc);

        Compose.platform = {
            invitesManager: {
                createSmartForwardMail: function (originalEvent, account) {
                    return {};
                }
            }
        };

        // Test is basically that this does not throw.
        var creator = Compose.MessageFromEventCreator.instance({}, {}, Compose.CalendarActionType.forward);
        creator.createMessage();
        creator.onMessageCreated();
    });
})();
