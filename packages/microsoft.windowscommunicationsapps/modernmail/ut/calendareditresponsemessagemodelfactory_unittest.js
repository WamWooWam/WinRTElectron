
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /// <summary>Tests Compose.CalendarEditResponseMessageModelFactory</summary>

    function setup (tc) {
        var preserver = new Jm.Preserve();
        tc.cleanup = function() {
            preserver.restore();
        };

        // Throw (and fail unit tests) on asserts
        if (window.Debug) {
            preserver.preserve(Debug, "throwOnAssert");
            Debug.throwOnAssert = true;
        }

        preserver.preserve(Compose.MessageForEditResponseCreator, "instance");
        preserver.preserve(Compose.MailMessageModel, "instance");
        
        // Set up some mock objects
        Mail.UnitTest.setupCalendarStubs();
        Mail.UnitTest.setupModernCanvasStubs();
    }

    Tx.test("CalendarEditReponseMessageModelFactory_UnitTest.testEditResponseMessage", function (tc) {
        /// <summary>Verifies that the downlevel forward body content is included as appropriate</summary>
        setup(tc);

        var mockMessage = {
            set: function () { },
            addBodyContents: function (contents) {
                this.bodyContents = contents;
            },
            bodyContents: null,
            to: null,
            subject: null
        };

        var callback = setupMessageFactory(tc, mockMessage, Compose.CalendarActionType.accept);

        callback(mockMessage);

        tc.isNotNull(mockMessage.subject, "Subject not set on message");
        tc.isNotNull(mockMessage.to, "To not set on message");
        tc.isNotNull(mockMessage.bodyContents, "Body contents not set on message");
        tc.areEqual(1, mockMessage.bodyContents.length, "Unexpected number of items added to body");
    });

    // Helper functions

    function setupMessageFactory (tc, message, calendarAction) {
        /// <summary>Sets up a message model factory and returns the create callback</summary>
        
        var callback = null;

        var originalEvent = {
            calendar: {
                account: { id: "fakeAccount" }
            },
            subject: "This is the subject",
            organizerEmail: "organizer email"
        };
        var expectedAccount = originalEvent.calendar.account;

        Compose.MailMessageModel.instance = function () {
            message.subject = originalEvent.subject;
            message.to = originalEvent.organizerEmail;
            return message;
        };

        Compose.MessageForEditResponseCreator.instance = function (originalMessage, creatorEvent, creatorAccount, creatorAction) {
            tc.areEqual(originalEvent, creatorEvent, "Unexpected event passed to MessageFromEventCreator");
            tc.areEqual(expectedAccount, creatorAccount, "Unexpected account passed to MessageFromEventCreator");
            tc.areEqual(calendarAction, creatorAction, "Unexpected action passed to MessageForEditResponseCreator");

            return {
                setCallback: function (creatorCallback) {
                    callback = creatorCallback;
                }
            }
        };

        var messageModel = Compose.calendarEditResponseMessageModelFactory.instance(null, originalEvent, calendarAction);

        tc.isNotNull(callback, "Expected messageModelFactory to set up a create callback");

        return callback;
    }

})();
