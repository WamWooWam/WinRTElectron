
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /// <summary>Tests Compose.CalendarUtil</summary>

    var CalendarUtil = Compose.CalendarUtil;
    var ServerCapability;

    function setup (tc) {
        var preserver = new Jm.Preserve();
        tc.cleanup = function() {
            preserver.restore();
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreJx();
       };

        // Throw (and fail unit tests) on asserts
        if (window.Debug) {
            preserver.preserve(Debug, "throwOnAssert");
            Debug.throwOnAssert = true;
        }

        preserver.preserve(Compose, "platform");

        Compose.platform = {
            accountManager: {
                loadAccount: function () { tc.fail("Unexpected call to loadAccount"); }
            },
            invitesManager: {
                sendMeetingResponse: function () { }
            }
        };

        // Set up some mock objects
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.setupCalendarStubs();
        Mail.UnitTest.setupModernCanvasStubs();
        ServerCapability = Microsoft.WindowsLive.Platform.Calendar.ServerCapability;
    }

    Tx.test("CalendarUtil_UnitTest.testGetBodyContentFromEventHtml", function (tc) {
        /// <summary>Verifies getBodyContentFromEvent when the event has an HTML body</summary>
        setup(tc);

        var expectedBodyContent = "<b>This is the body html</b>";

        var mockEvent = {
            data: expectedBodyContent,
            dataType: Microsoft.WindowsLive.Platform.Calendar.DataType.html,
            subject: "this is the subject"
        };

        var result = CalendarUtil.getBodyContentFromEvent(mockEvent);

        tc.areEqual(expectedBodyContent, result.content, "Body contents did not match");
        tc.areEqual(ModernCanvas.ContentFormat.htmlString, result.format, "Format did not match");
    });

    Tx.test("CalendarUtil_UnitTest.testGetBodyContentFromEventText", function (tc) {
        /// <summary>Verifies getBodyContentFromEvent when the event has a text body</summary>
        setup(tc);

        var expectedBodyContent = "This is the body text";

        var mockEvent = {
            data: expectedBodyContent,
            dataType: Microsoft.WindowsLive.Platform.Calendar.DataType.plainText,
            subject: "This is the subject"
        };

        var result = CalendarUtil.getBodyContentFromEvent(mockEvent);

        tc.areEqual(expectedBodyContent, result.content, "Body contents did not match");
        tc.areEqual(ModernCanvas.ContentFormat.text, result.format, "Format did not match");
    });

    Tx.test("CalendarUtil_UnitTest.testGetBodyContentFromEventRTF", function (tc) {
        /// <summary>Verifies getBodyContentFromEvent when the event has a body in RTF format</summary>
        setup(tc);

        var mockEvent = {
            data: "This is not supposed to be used",
            dataType: Microsoft.WindowsLive.Platform.Calendar.DataType.rtf,
            subject: "This is the subject"
        };

        var result = CalendarUtil.getBodyContentFromEvent(mockEvent);

        tc.areEqual(mockEvent.subject, result.content, "Body contents did not match");
        tc.areEqual(ModernCanvas.ContentFormat.text, result.format, "Format did not match");
    });

    Tx.test("CalendarUtil_UnitTest.testCreateRecipient", function (tc) {
        setup(tc);

        var name = "This is a name";
        var email = "This is an email";

        var recipient = CalendarUtil.createRecipient(name, email);

        tc.areEqual(name, recipient.calculatedUIName, "Name did not match");
        tc.areEqual(email, recipient.emailAddress, "Email did not match");
    });

    Tx.test("CalendarUtil_UnitTest.testCreateRecipientWithoutName", function (tc) {
        setup(tc);

        var name = "";
        var email = "this is an email";

        var recipient = CalendarUtil.createRecipient(name, email);

        tc.areEqual(email, recipient.calculatedUIName, "Name should have been set to email when empty");
        tc.areEqual(email, recipient.emailAddress, "Email did not match");
    });

    Tx.test("CalendarUtil_UnitTest.testGetRecipientsArray", function (tc) {
        setup(tc);

        var attendees = [
            { name: "Name1", email: "email1@email.com"},
            { name: "Name2", email: "email2@email.com" },
            { name: "", email: "email3@email.com" }
        ];
        // Mock platform collection
        var attendeesCollection = {
            count: attendees.length,
            item: function (index) { return attendees[index]; }
        }

        var mockEvent = {
            getAttendees: function () { return attendeesCollection; },
            organizerName: "OrganizerName",
            organizerEmail: "organizer@email.com"
        };

        var result = CalendarUtil.getRecipientsArray(mockEvent);

        tc.areEqual(attendees.length + 1, result.length, "Unexpected number of recipients");
        // Order doesn't really matter, but it's easier to write the test this way
        tc.areEqual("OrganizerName", result[0].calculatedUIName, "Organizer not found")
        tc.areEqual("email1@email.com", result[1].emailAddress, "First recipient email did not match");
        tc.areEqual("Name2", result[2].calculatedUIName, "Second recipient did not match");
        tc.areEqual("email3@email.com", result[3].calculatedUIName, "Third recipient did not match");
    });

    function getEmailFromForwardContent(tc, contentHtml) {
        /// <summary>Helper function pulls the email address out of downlevel forward content</summary>

        // Find the email address in the result html
        var match = /mailto\:([^'"]+)['"]/.exec(contentHtml);
        tc.isNotNull(match, "Unable to find email address in result string");
        tc.isTrue(match.length >= 2, "Unable to find email address in result string");
        return match[1];
    }

    Tx.test("CalendarUtil_UnitTest.testGetDownlevelForwardBodyContent", function (tc) {
        /// <summary>Validates getDownlevelForwardBodyContent in the normal case</summary>
        setup(tc);

        var mockEvent = {
            organizerName: "OrganizerName",
            organizerEmail: "organizer@email.com"
        };

        var result = CalendarUtil.getDownlevelForwardBodyContent(mockEvent, "alternate@email.com");
        var email = getEmailFromForwardContent(tc, result.content);

        tc.areEqual(mockEvent.organizerEmail, email, "Email address did not match");
    });

    Tx.test("CalendarUtil_UnitTest.testGetDownlevelForwardBodyContentWithoutOrganizer", function (tc) {
        /// <summary>Validates getDownlevelForwardBodyContent when there is no organizer</summary>
        setup(tc);

        // Some events received as mail invitations don't have an organizer email (see WinLive 653092)
        var mockEvent = { };
        var alternativeEmail = "alternate@email.com";

        var result = CalendarUtil.getDownlevelForwardBodyContent(mockEvent, alternativeEmail);
        var email = getEmailFromForwardContent(tc, result.content);

        tc.areEqual(alternativeEmail, email, "Email address did not match");
    });

    function messageRequiresForwardContentTestHelper(tc, calendarCapabilities, calendarMessageType, expectedResult) {
        /// <summary>Helper function verifies messageRequiresForwardContent scenarios</summary>

        var mockMessage = {
            calendarMessageType: calendarMessageType
        };
        var checkedCapabilities = false;
        var mockCalendar = {};
        Object.defineProperty(mockCalendar, "capabilities",
            {
                get: function () {
                    checkedCapabilities = true;
                    return calendarCapabilities;
                }
            }
        );

        // Set up the platform queries for the calendar
        Compose.platform.accountManager = {
            loadAccount: function () { return {}; }
        };
        Compose.platform.calendarManager = {
            getAllCalendarsForAccount: function () {
                return {
                    lock: function () { },
                    unlock: function () { },
                    item: function () { return mockCalendar; },
                    dispose: function () { },
                    count: 1
                };
            }
        };

        var result = CalendarUtil.messageRequiresForwardContent(mockMessage);

        // Check whether we requested the calendar capabilities
        tc.areEqual((calendarMessageType === Microsoft.WindowsLive.Platform.CalendarMessageType.request), checkedCapabilities, "calendar capabilities");

        tc.areEqual(expectedResult, result, "messageRequiresForwardContent did not match");
    }

    Tx.test("CalendarUtil_UnitTest.testMessageRequiresForwardContentYes", function (tc) {
        setup(tc);

        messageRequiresForwardContentTestHelper(
            tc,
            ServerCapability.canForward, // does not have the canReplaceMime capability
            Microsoft.WindowsLive.Platform.CalendarMessageType.request,
            true);
    });

    Tx.test("CalendarUtil_UnitTest.testMessageRequiresForwardContentCancellation", function (tc) {
        // Make sure that non-requests don't require the message
        setup(tc);

        messageRequiresForwardContentTestHelper(
            tc,
            ServerCapability.canForward, // does not have the canReplaceMime capability
            Microsoft.WindowsLive.Platform.CalendarMessageType.cancellation,
            false);
    });

    Tx.test("CalendarUtil_UnitTest.testMessageRequiresForwardContentNo", function (tc) {
        setup(tc);

        messageRequiresForwardContentTestHelper(
            tc,
            ServerCapability.canForward | ServerCapability.canReplaceMime, // these are the capabilites required so that we do not need the message
            Microsoft.WindowsLive.Platform.CalendarMessageType.request,
            false);
    });

    Tx.test("CalendarUtil_UnitTest.testMessageRequiresForwardContentNoCalendars", function (tc) {
        /// <summary>Verifies that if the account has no calendars, things work correctly</summary>
        setup(tc);

        var mockMessage = {
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.request
        };

        // Set up the platform queries for the calendar
        Compose.platform.accountManager = {
            loadAccount: function () { return {}; }
        };
        Compose.platform.calendarManager = {
            getAllCalendarsForAccount: function () {
                return {
                    lock: function () { },
                    unlock: function () {},
                    item: function () { tc.fail("Unexpected call to retrieve calendar"); },
                    dispose: function () { },
                    count: 0
                };
            }
        };

        tc.isTrue(CalendarUtil.messageRequiresForwardContent(mockMessage, false));
    });

    Tx.test("CalendarUtil_UnitTest.testPreEditResponseActionsEx", function (tc) {
        setup(tc);
        
        var committed = false;
        var meetingResponseSent = false;
        var event = {
            responseType: null,
            busyStatus: null,
            allDayEvent: false,
            commit: function () {committed = true;}
        };
 
        Compose.platform.invitesManager.sendMeetingResponse = function (event, message, response, account) { 
            meetingResponseSent = true;
        };
        
        function reset () {
            committed = false;
            meetingResponseSent = false;
            event.busyStatus = null;
            event.responseType = null;
        }
        
        var ResponseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType;
        var BusyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus;

        CalendarUtil.PreEditResponseActionsEx(event, event, null, ResponseType.accepted, {});       
        tc.isTrue(meetingResponseSent, "Meeting response is not sent for accepted response!");
        tc.isTrue(event.busyStatus === BusyStatus.busy, "Busy status isn't set to busy for accepted response!");
        tc.isTrue(event.responseType === ResponseType.accepted, "Response type isn't set correctly for accepted response!");
        tc.isTrue(committed, "Event properties not committed for accepted response!");

        reset();
        CalendarUtil.PreEditResponseActionsEx(event, event, null, ResponseType.tentative, {});       
        tc.isTrue(meetingResponseSent, "Meeting response is not sent for tentative response!");
        tc.isTrue(event.busyStatus === BusyStatus.tentative, "Busy status isn't set to tentative for tentative response!");
        tc.isTrue(event.responseType === ResponseType.tentative, "Response type isn't set correctly for tentative response!");
        tc.isTrue(committed, "Event properties not committed for tentative response!");

        reset();
        CalendarUtil.PreEditResponseActionsEx(event, event, null, ResponseType.declined, {});       
        tc.isFalse(meetingResponseSent, "Meeting response is sent for declined response before edit response!");
        tc.isNull(event.busyStatus, "Busy status is set for declined response before edit response!");
        tc.isNull(event.responseType, "Response type is set for declined response before edit response!");
        tc.isFalse(committed, "Event properties is committed for declined response before edit response!");
    });
})();
