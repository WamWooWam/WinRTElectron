
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /// <summary>Tests Compose.CalendaCancelMessageModelFactory</summary>

    var MeetingStatus;

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

        preserver.preserve(Compose.MessageFromEventCreator, "instance");
        preserver.preserve(Compose.MailMessageModel, "instance");

        Compose.MailMessageModel.instance = function () { tc.fail("Unexpected call to Compose.MailMessageModel.instance"); };
        Compose.MessageFromEventCreator.instance = function () { tc.fail("Unexpected call to Compose.MessageFromEventCreator.instance"); };

        var calendarUtil = Compose.CalendarUtil;

        preserver.preserve(calendarUtil, "getRecipientsArray");
        calendarUtil.getRecipientsArray = function () { return []; };

        preserver.preserve(calendarUtil, "getReplyHeaderHtmlFromEvent");

        var factoryUtil = Compose.mailMessageFactoryUtil;
        preserver.preserve(factoryUtil, "getRecipientsStringWithoutReceiver");
        
        factoryUtil.getRecipientsStringWithoutReceiver = function () {
            return "recipients";
        }

        // Set up some mock objects
        Mail.UnitTest.setupCalendarStubs();
        Mail.UnitTest.setupModernCanvasStubs();

        MeetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus;
    }

    Tx.test("CalendarCancelMessageModelFactory_UnitTest.testBodyContent", function (tc) {
        /// <summary>Verifies the body content in the new message</summary>
        setup(tc);

        var replyHeaderHtml = "Reply header html";

        var mockMessage = {
            set: function () { },
            addBodyContents: function (contents) {
                this.bodyContents = contents;
            },
            bodyContents: null
        };

        Compose.CalendarUtil.getReplyHeaderHtmlFromEvent = function () { return replyHeaderHtml; };

        var callback = setupMessageFactory(tc, mockMessage, []);

        callback(mockMessage);
        
        tc.isTrue(!!mockMessage.bodyContents, "Body contents not set on message");
        tc.areEqual(2, mockMessage.bodyContents.length, "Unexpected number of items added to body");
        tc.areEqual(replyHeaderHtml, mockMessage.bodyContents[0].content, "Body contents 0");
    });

    Tx.test("CalendarCancelMessageModelFactory_UnitTest.testAttendeesInCorrectFields", function (tc) {
        /// <summary>Verifies that different types of attendees (optional/required/resource) are in the correct field</summary>
        setup(tc);

        var toString, ccString;

        var mockMessage = {
            set: function (input) {
                tc.isTrue(!!input, "No input to set function");

                toString = input.to;
                ccString = input.cc;
            },
            addBodyContents: function () { },
        };

        var AttendeeType = Microsoft.WindowsLive.Platform.Calendar.AttendeeType;

        var attendees = [
            { attendeeType: AttendeeType.optional, name: "Optional1" },
            { attendeeType: AttendeeType.required, name: "Required1" },
            { attendeeType: AttendeeType.resource, name: "Resource1" },
            { attendeeType: AttendeeType.optional, name: "Optional2" },
            { attendeeType: AttendeeType.required, name: "Required2" },
            { attendeeType: AttendeeType.resource, name: "Resource2" },
        ];

        var setupToString = false;

        Compose.CalendarUtil.getReplyHeaderHtmlFromEvent = function () { return "replyHeaderHtml" };

        var callback = setupMessageFactory(tc, mockMessage, attendees);

        callback(mockMessage);

        tc.isTrue(Jx.isString(toString), "To string was not set");
        tc.isTrue(Jx.isString(ccString), "CC string was not set");
        tc.isTrue(ccString.indexOf("Optional1") >= 0, "Optional1");
        tc.isTrue(ccString.indexOf("Optional2") >= 0, "Optional2");
        tc.isTrue(toString.indexOf("Resource1") >= 0, "Resource1");
        tc.isTrue(toString.indexOf("Resource2") >= 0, "Resource2");
        tc.isTrue(toString.indexOf("Required1") >= 0, "Required1");
        tc.isTrue(toString.indexOf("Required2") >= 0, "Required2");
    });

    Tx.test("CalendarCancelMessageModelFactory_UnitTest.testIsValidWithAttendee", function (tc) {
        /// <summary>Verifies that the messageModelFactory doesn't handle an event where the current user is an attendee</summary>
        setup(tc);

        var attendees = [
            { id: "attendee1" }
        ];
        var originalEvent = createMockEvent(attendees);
        originalEvent.isOrganizer = false;

        var messageModel = Compose.calendarCancelMessageModelFactory.instance(originalEvent);

        tc.isNull(messageModel, "Unexpected messageModel returned when trying to cancel as attendee");
    });

    // Helper functions

    function setupMessageFactory (tc, message, attendees) {
        /// <summary>Sets up a message model factory and returns the create callback</summary>
        
        var callback = null;

        var originalEvent = createMockEvent(attendees);
        var expectedAccount = originalEvent.calendar.account;

        Compose.MailMessageModel.instance = function () {
            return message;
        };

        Compose.MessageFromEventCreator.instance = function (creatorEvent, creatorAccount, creatorAction) {
            tc.areEqual(originalEvent, creatorEvent, "Unexpected event passed to MessageFromEventCreator");
            tc.areEqual(expectedAccount, creatorAccount, "Unexpected account passed to MessageFromEventCreator");
            tc.areEqual(Compose.CalendarActionType.cancel, creatorAction, "Unexpected action passed to MessageFromEventCreator");

            return {
                setCallback: function (creatorCallback) {
                    callback = creatorCallback;
                }
            }
        };

        var messageModel = Compose.calendarCancelMessageModelFactory.instance(originalEvent);

        tc.isNotNull(callback, "Expected messageModelFactory to set up a create callback");

        return callback;
    }

    function createMockEvent(attendees) {
        /// <summary>Creates a mock meeting with the given attendees</summary>
        /// <param name="attendees" type="Array">Array of attendees</param>
        return {
            calendar: {
                account: { id: "fakeAccount" }
            },
            subject: "This is the subject",
            getAttendees: function () {
                return {
                    item: function (index) {
                        return attendees[index];
                    },
                    count: attendees.length
                }
            },
            meetingStatus: MeetingStatus.isAMeeting,
            isOrganizer: true
        };
    }

})();
