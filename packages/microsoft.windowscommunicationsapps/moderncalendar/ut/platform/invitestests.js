
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    var _declinedString = "Declined: ";
    var _acceptedString = "Accepted: ";
    var _tentativeString = "Tentative: ";

    var _invalidDate = new Date(1600, 1, 1);

    var _mailManager = null;
    var _invitesManager = null;

    var setUp = function (tc) {
        /// <summary>
        /// Cleanup before each test so pre-existing state
        /// does not screw up our results
        /// </summary>

        TestCore.setupTest(tc);

        if (_mailManager === null) {
            _mailManager = TestCore.platform.client.mailManager;
            _invitesManager = TestCore.platform.client.invitesManager;
        }
    };

    var createCalendarAndEvent = function (calendarServerId, eventServerId) {
        /// <summary>
        /// Helper function creates a calendar and an event.  Returns the event.
        /// </summary>
        /// <returns>Newly created event, committed, populated with fields.  Current user is not the organizer.</returns>

        var wlp = Microsoft.WindowsLive.Platform;

        TestCore.log("Adding calendar");
        var calendar = TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar");
        TestCore.tc.isNotNull(calendar, "Failed to create calendar");

        if (calendarServerId) {
            TestCore.calendarManager.setCalendarServerId(calendar, calendarServerId);
        }

        TestCore.log("Creating Event");
        var event = calendar.createEvent();
        TestCore.tc.isNotNull(event, "Failed to create event");

        TestCore.log("Event UID: " + event.uid);

        var dtNoon = new Date(2011, 2, 10, 12);
        var dtOne = new Date(2011, 2, 10, 13);

        TestCore.log("Populating Event Properties");
        event.subject = "Lunch";
        event.location = "Commons";
        event.startDate = dtNoon;
        event.endDate = dtOne;
        event.meetingStatus = wlp.Calendar.MeetingStatus.isAMeeting;
        event.reminder = 15;
        event.organizerName = "Bob";
        event.organizerEmail = "bob@live.com";
        event.dataType = Microsoft.WindowsLive.Platform.Calendar.DataType.mime;
        event.responseRequested = true;
        event.disallowNewTime = true;

        if (eventServerId){
            TestCore.calendarManager.setEventServerId(event, eventServerId);
        }
        event.commit();

        TestCore.log("Event ID: " + event.id);

        return event;
    };

    var createMeetingRequest = function (event, requestId, folder) {
        /// <summary>
        /// Helper function creates a meeting request message that can be used to generate response mails and MeetingResponses
        /// </summary>
        /// <param name="event">Event for this meeting request</param>
        /// <param name="requestId" optional="true">Optional request ID to use for the server request ID</param>
        /// <returns>Committed/reloaded meeting request message</returns>

        var uid = event.uid;
        var mailMessage = null;

        var mailManager = _mailManager;
        TestCore.tc.isNotNull(mailManager, "Failed to open Mail Manager.");

        if (!folder) {
            var mailMessage = _mailManager.createMessage(TestCore.defaultAccount);
        } else {
            var mailMessage = _mailManager.createMessageInFolder(folder);
        }

        TestCore.tc.isNotNull(mailMessage, "Failed to create mail message.");

        var mailBody = mailMessage.createBody();
        mailBody.type = Microsoft.WindowsLive.Platform.MailBodyType.plainText;
        mailBody.body = "This is a test body";

        mailMessage.subject = "Test meeting request";
        mailMessage.to = "someone@somewhere.com";

        mailMessage.commit();

        // UpdateMail is a unit test helper function that helps turn this draft into a fake meeting request.
        if (!requestId) {
            requestId = Math.floor(Math.random() * 1000000);
        }
        TestCore.log("Updating mail, id = " + mailMessage.objectId + ", UID = " + uid + ", requestId = " + requestId);
        _invitesManager.updateMail(mailMessage.objectId, uid, requestId);

        var committedMessage = mailManager.loadMessage(mailMessage.objectId);
        TestCore.tc.isNotNull(committedMessage, "Meeting response was not committed.");
        TestCore.tc.areEqual(uid, committedMessage.eventUID, "Wrong UID on meeting response.");
        TestCore.tc.areEqual(Microsoft.WindowsLive.Platform.CalendarMessageType.request,
            committedMessage.calendarMessageType, "Wrong message type of meeting request.");
        TestCore.tc.areEqual(TestCore.defaultAccount.objectId,
            committedMessage.accountId, "Wrong accountId on meeting request.");

        return committedMessage;
    };

    var verifyMeetingResponseBody = function(responseMail) {
        /// <summary>
        /// Helper function verifies properties on a meeting response mail's mail and calendar bodies
        /// </summary>

        var textBody = responseMail.getBody(Microsoft.WindowsLive.Platform.MailBodyType.plainText);
        TestCore.tc.isNotNull(textBody, "Meeting response lacks required plain text body.");

        var calendarBody = responseMail.getBody(Microsoft.WindowsLive.Platform.MailBodyType.calendar);
        TestCore.tc.isNotNull(calendarBody, "Meeting response lacks required calendar body.");
        TestCore.tc.areEqual(calendarBody.method, "REPLY", "Improper method on calendar body.");
    };

    var verifyMailFromEvent = function (message, expectedSubject, isCancellation) {
        /// <summary>
        /// Verifies properties on the given request or cancellation mail
        /// </summary>
        /// <param name="message">Mail message generated from the event</param>
        /// <param name="expectedSubject">Subject expected for the message</param>
        /// <param name="isCancellation">Whether this should be a cancellation mail or not</param>

        var wlp = Microsoft.WindowsLive.Platform;

        TestCore.tc.areEqual(expectedSubject, message.subject, "Wrong message subject.");
        TestCore.tc.isTrue(message.hasBody(wlp.MailBodyType.plainText), "Message lacks plain text body.");
        TestCore.tc.isTrue(message.hasBody(wlp.MailBodyType.calendar), "Message lacks calendar body.");

        var plainTextBody = message.getBody(wlp.MailBodyType.plainText);
        var calendarBody = message.getBody(wlp.MailBodyType.calendar);
        TestCore.tc.isNotNull(plainTextBody, "Null plain text body.");
        TestCore.tc.isNotNull(calendarBody, "Null calendar body.");

        TestCore.tc.areNotEqual(plainTextBody.size, 0, "0-sized plain text body.");
        TestCore.tc.areNotEqual(calendarBody.size, 0, "0-sized calendar body.");

        TestCore.tc.areEqual(plainTextBody.method, "", "plain text body with non-trivial method.");
        if (isCancellation) {
            TestCore.tc.areEqual("CANCEL", calendarBody.method, "Expected CANCEL method for cancellation");
            TestCore.tc.areEqual(wlp.CalendarMessageType.cancelled, message.calendarMessageType, "Unexpected message type for cancel");
        } else {
            TestCore.tc.areEqual("REQUEST", calendarBody.method, "Expected REQUEST method for invite");
            TestCore.tc.areEqual(wlp.CalendarMessageType.request, message.calendarMessageType, "Unexpected message type for invite");
        }
    };

    Tx.test("InvitesTests.testCreateResponseMailBasic", function (tc) {
        /// <summary>
        /// Verifies IInvitesManager::createResponseMail
        /// This function verifies basic subject and body mail properties
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var wlp = Microsoft.WindowsLive.Platform;

        var event = createCalendarAndEvent();

        var meetingRequestMail = createMeetingRequest(event);

        TestCore.log("Generating response (accepted)");
        var responseMail = _invitesManager.createResponseMail(event,
            meetingRequestMail,
            wlp.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);

        responseMail.commit();

        TestCore.tc.areEqual(0, responseMail.subject.indexOf(_acceptedString), "Improper response subject: prefix not found");
        TestCore.tc.isTrue(responseMail.subject.indexOf(event.subject) > 0, "Improper response subject: original subject not found");
        TestCore.tc.areEqual(wlp.CalendarMessageType.responseAccepted, responseMail.calendarMessageType, "Improper calendarMessageType");
        TestCore.tc.areEqual(0, responseMail.to.indexOf(event.organizerEmail), "Improper to field: event organizer email not found");
        verifyMeetingResponseBody(responseMail);

        responseMail.deleteObject();

        TestCore.log("Generating response (tentative)");
        responseMail = _invitesManager.createResponseMail(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
            TestCore.defaultAccount);

        responseMail.commit();

        TestCore.tc.areEqual(0, responseMail.subject.indexOf(_tentativeString), "Improper response subject: prefix not found");
        TestCore.tc.isTrue(responseMail.subject.indexOf(event.subject) > 0, "Improper response subject: original subject not found");
        TestCore.tc.areEqual(wlp.CalendarMessageType.responseTentative, responseMail.calendarMessageType, "Improper calendarMessageType");
        TestCore.tc.areEqual(0, responseMail.to.indexOf(event.organizerEmail), "Improper to field: event organizer email not found");
        verifyMeetingResponseBody(responseMail);

        responseMail.deleteObject();

        TestCore.log("Generating response (declined)");
        responseMail = _invitesManager.createResponseMail(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
            TestCore.defaultAccount);

        responseMail.commit();

        TestCore.tc.areEqual(0, responseMail.subject.indexOf(_declinedString), "Improper response subject: prefix not found");
        TestCore.tc.isTrue(responseMail.subject.indexOf(event.subject) > 0, "Improper response subject: original subject not found");
        TestCore.tc.areEqual(wlp.CalendarMessageType.responseDeclined, responseMail.calendarMessageType, "Improper calendarMessageType");
        TestCore.tc.areEqual(0, responseMail.to.indexOf(event.organizerEmail), "Improper to field: event organizer email not found");
        verifyMeetingResponseBody(responseMail);

        responseMail.deleteObject();

        meetingRequestMail.deleteObject();
        event.deleteObject();
    });

    Tx.test("InvitesTests.testCreateResponseMailSubjectFallback", function (tc) {
        /// <summary>
        /// Verifies createResponseMail subject fall back
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var event = createCalendarAndEvent();
        var meetingRequestMail = createMeetingRequest(event);

        // The scenario here is that the event subject is blank, and the mail subject should be used
        // The subject isn't usually available from the event when responding to a mail invite
        event.subject = "";
        event.commit();
        meetingRequestMail.subject = "HERE IS THE SUBJECT";
        meetingRequestMail.commit();

        var responseMail = _invitesManager.createResponseMail(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
            TestCore.defaultAccount);

        TestCore.tc.isTrue(responseMail.subject.indexOf(meetingRequestMail.subject) > 0, "Improper response subject: mail subject not found");
    });


    Tx.test("InvitesTests.testCreateResponseMailNoSubject", function (tc) {

        /// <summary>
        /// Verifies createResponseMail when it isn't able to find an original subject
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var event = createCalendarAndEvent();
        var meetingRequestMail = createMeetingRequest(event);

        // The scenario here is that the original subject is blank, and the code should fall back to the "no subject" text.
        event.subject = "";
        event.commit();
        meetingRequestMail.subject = "";
        meetingRequestMail.commit();

        var responseMail = _invitesManager.createResponseMail(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
            TestCore.defaultAccount);

        TestCore.tc.areEqual(0, responseMail.subject.indexOf(_declinedString), "Improper response subject: prefix not found");
        TestCore.tc.isTrue(responseMail.subject.length > _declinedString.length, "Subject was expected to contain some content other than the prefix");
    });

    Tx.test("InvitesTests.testCreateResponseMailImportance", function (tc) {
        /// <summary>
        /// Verifies that createResponseMail carries through the importance value
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var event = createCalendarAndEvent();
        var meetingRequestMail = createMeetingRequest(event);

        var Importance = Microsoft.WindowsLive.Platform.MailMessageImportance;

        meetingRequestMail.importance = Importance.low;
        meetingRequestMail.commit();

        var responseMail = _invitesManager.createResponseMail(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
            TestCore.defaultAccount);

        // Importance doesn't transfer to the mail, just to the calendar info
        TestCore.tc.areEqual(Importance.normal, responseMail.importance, "Mail importance should always be normal for responses");

        var calendarBody = responseMail.getBody(Microsoft.WindowsLive.Platform.MailBodyType.calendar);
        TestCore.tc.isNotNull(calendarBody, "Unexpected null calendar body in response mail");

        // Find the importance value in the calendar body.  1 is high priority, 9 is low.
        var priorityRegex = /PRIORITY[\s]*:[\s]*([\d]+)/;
        var result = priorityRegex.exec(calendarBody.body);
        TestCore.tc.isNotNull(result, "Unable to find priority in meeting response");
        TestCore.tc.areEqual("9", result[1], "Unexpected priority value");
    });

    Tx.test("InvitesTests.testCreateResponseNoResponseRequested", function (tc) {
        /// <summary>
        /// Verifies that createResponseMail doesn't generate a response mail when no response mail was requested
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var event = createCalendarAndEvent();
        var meetingRequestMail = createMeetingRequest(event);

        event.responseRequested = false;
        event.commit();

        var responseMail = _invitesManager.createResponseMail(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);

        TestCore.tc.isNull(responseMail, "Should not have generated a response if no response was requested.");
    });

    Tx.test("InvitesTests.testCreateResponseMailNoMail", function (tc) {
        /// <summary>
        /// Verifies that createResponseMail works correctly when there is no mail item
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var event = createCalendarAndEvent();

        // Test is mostly that this doesn't throw/assert
        var responseMail = _invitesManager.createResponseMail(event,
            null,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
            TestCore.defaultAccount);

        TestCore.tc.isNotNull(responseMail, "Expected successful generation of response mail");
    });

    Tx.test("InvitesTests.testSendMeetingResponse", function (tc) {
        /// <summary>
        /// Verifies IInvitesManager::sendMeetingResponse functionality
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var event = createCalendarAndEvent();

        var request = Math.floor(Math.random() * 1000000);
        var collection = Math.floor(Math.random() * 1000000);
        var folder = _invitesManager.createMailFolder(TestCore.defaultAccount.objectId, collection);

        var meetingRequestMail = createMeetingRequest(event, request, folder);

        TestCore.log("Sending response (accepted)");
        _invitesManager.sendMeetingResponse(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);

        TestCore.log("Sending response (tentative)");
        _invitesManager.sendMeetingResponse(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
            TestCore.defaultAccount);

        TestCore.log("Sending response (declined)");
        _invitesManager.sendMeetingResponse(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
            TestCore.defaultAccount);

        TestCore.log("Checking responses");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate },
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate },
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Checking responses again (should be none)");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  []);

        TestCore.log("Sending response (accepted)");
        _invitesManager.sendMeetingResponse(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);

        TestCore.log("Sending response (tentative)");
        _invitesManager.sendMeetingResponse(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
            TestCore.defaultAccount);

        TestCore.log("Sending response (declined)");
        _invitesManager.sendMeetingResponse(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
            TestCore.defaultAccount);

        TestCore.log("Setting server responses (Success, Not a Meeting, Error)");
        _invitesManager.setResults([1, 2, 3]);

        TestCore.log("Checking responses");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate },
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate },
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Checking responses again (should be just the decline left)");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Checking responses again (should be none)");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  []);

        TestCore.log("Sending response (accepted)");
        _invitesManager.sendMeetingResponse(event,
            meetingRequestMail,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);

        TestCore.log("Setting server responses (Error)");
        _invitesManager.setResults([3]);

        TestCore.log("Checking responses");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Setting server responses (Error)");
        _invitesManager.setResults([3]);

        TestCore.log("Checking responses");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Setting server responses (Error)");
        _invitesManager.setResults([3]);

        TestCore.log("Checking responses");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Setting server responses (Error)");
        _invitesManager.setResults([3]);

        TestCore.log("Checking responses");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Setting server responses (Error)");
        _invitesManager.setResults([3]);

        TestCore.log("Checking responses");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Checking responses again (should be none)");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  []);

        meetingRequestMail.deleteObject();
        event.deleteObject();
        _invitesManager.deleteFolder(folder);
    });

    Tx.test("InvitesTests.testSendMeetingResponseNoMail", function (tc) {
        /// <summary>
        /// Verifies that sendMeetingResponse works correctly without a mail passed in
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var request = Math.floor(Math.random() * 1000000);
        var collection = Math.floor(Math.random() * 1000000);

        TestCore.log("Retrieving Server Version to restore at end of test");
        var oldVersion = TestCore.calendarManager.defaultCalendar.getServerVersion();

        var event = createCalendarAndEvent("" + collection, "" + request);

        TestCore.log("Verifying with 14.0");
        TestCore.calendarManager.defaultCalendar.setServerVersion("14.0");
        _invitesManager.sendMeetingResponse(event,
            null,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
            TestCore.defaultAccount);

        TestCore.log("Checking responses (should be none)");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  []);

        TestCore.log("Verifying with 14.1");
        TestCore.calendarManager.defaultCalendar.setServerVersion("14.1");
        _invitesManager.sendMeetingResponse(event,
            null,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);

        _invitesManager.setResults([1]);

        TestCore.log("Checking responses (should be one)");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: _invalidDate }
                                                  ]);

        TestCore.log("Verifying with Instance on 14.1");
        TestCore.calendarManager.defaultCalendar.setServerVersion("14.1");
        event.recurring = true;
        event.commit()

        var instance = event.getOccurrence(new Date(2011, 2, 11, 12));

        _invitesManager.sendMeetingResponse(instance,
            null,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);

        _invitesManager.setResults([1]);

        TestCore.log("Checking responses (should be one)");
        _invitesManager.mockSendResponses(TestCore.defaultAccount.objectId,
                                                  [
                                                    { response: Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
                                                      collectionId: "" + collection,
                                                      requestId: "" + request,
                                                      dtInstance: new Date(2011, 2, 11, 12) }
                                                  ]);

        TestCore.calendarManager.defaultCalendar.setServerVersion(oldVersion);
    });

    Tx.test("InvitesTests.testMailFromEvent", function (tc) {
        /// <summary>
        /// Verifies IInvitesManager::mailFromEvent functionality
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var wlp = Microsoft.WindowsLive.Platform;

        // Technically this test is a little weird since the current user is not the organizer of this event, but it works anyway.
        var event = createCalendarAndEvent();

        var inviteMessage = _invitesManager.mailFromEvent(event, TestCore.defaultAccount);
        inviteMessage.commit();

        verifyMailFromEvent(inviteMessage, event.subject, false);

        inviteMessage.deleteObject();

        // Cancel the event, and verify the cancellation message
        event.meetingStatus |= wlp.Calendar.MeetingStatus.isCanceled;

        var cancelMessage = _invitesManager.mailFromEvent(event, TestCore.defaultAccount);
        cancelMessage.commit();

        verifyMailFromEvent(cancelMessage, event.subject, true);

        event.deleteObject();
        cancelMessage.deleteObject();
    });

    // These are perhaps less unit tests and more end-to-end API verification tests that also involve MailMessage code

    Tx.test("InvitesTests.testCanLoadOriginalEventFromResponse", function (tc) {
        /// <summary>
        /// Verifies that when creating a response from an event, I can load the original event
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var wlp = Microsoft.WindowsLive.Platform;

        var startDate = new Date(2012, 12, 12, 12);

        // Set this up as a recurrence
        var event = createCalendarAndEvent();
        event.startDate = startDate;
        event.endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours() + 5);
        event.eventType = wlp.Calendar.EventType.series;
        event.recurring = true;
        event.recurrence.recurrenceType = wlp.Calendar.RecurrenceType.daily;
        event.commit();

        var nextDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, startDate.getHours());
        var instanceOfEvent = event.getOccurrence(nextDate);

        TestCore.tc.isNotNull(instanceOfEvent, "Invalid test setup: Expected instance to be valid");

        var responseMail = _invitesManager.createResponseMail(instanceOfEvent,
            null,
            Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted,
            TestCore.defaultAccount);
        responseMail.commit();

        TestCore.tc.isNotNull(responseMail.eventHandle, "Expected non-null event handle");
        TestCore.tc.isTrue(responseMail.eventHandle.length > 0, "Expected event handle");

        var loadedEvent = TestCore.calendarManager.getEventFromHandle(responseMail.eventHandle);

        TestCore.tc.isNotNull(loadedEvent, "Expected an event to be returned");

        TestCore.tc.areEqual(event.id, loadedEvent.id, "Loaded event from draft did not match original");

        // Once the instance field is functional there should also be some validation for that
    });

    Tx.test("InvitesTests.testCanLoadOriginalEventFromCancellation", function (tc) {
        /// <summary>
        /// Verifies that when creating a cancellation from an event, I can load the original event
        /// </summary>

        if (!TestCore.verifyHostedInWwa()) {
            return;
        }

        setUp(tc);

        var wlp = Microsoft.WindowsLive.Platform;

        var event = createCalendarAndEvent();
        event.meetingStatus |= wlp.Calendar.MeetingStatus.isCanceled;

        var cancelMessage = _invitesManager.mailFromEvent(event, TestCore.defaultAccount);

        TestCore.tc.isNotNull(cancelMessage.eventHandle, "Expected non-null event handle");
        TestCore.tc.isTrue(cancelMessage.eventHandle.length > 0, "Expected event handle");

        var loadedEvent = TestCore.calendarManager.getEventFromHandle(cancelMessage.eventHandle);

        TestCore.tc.isNotNull(loadedEvent, "Expected an event to be returned");

        TestCore.tc.areEqual(event.id, loadedEvent.id, "Loaded event from draft did not match original");
    });

})();

