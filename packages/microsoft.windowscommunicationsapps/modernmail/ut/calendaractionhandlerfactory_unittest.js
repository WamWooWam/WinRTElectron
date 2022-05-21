
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /// <summary>Tests Mail.CalendarMessageModelFactory</summary>
    function setup (tc) {
        var preserver = new Jm.Preserve();
        tc.cleanup = function() {
            preserver.restore();
        };

        preserver.preserve(Compose, "platform");
        preserver.preserve(Compose, "mailMessageFactoryUtil");
        preserver.preserve(Mail, "Account");
        preserver.preserve(Mail, "UIDataModel");

        var account = {
            getResourceByType: Jx.fnEmpty,
            mockedType: Microsoft.WindowsLive.Platform.Account
        };

        Compose.platform = {
            accountManager: {
                loadAccount: function () {
                    return account;
                }
            },
            calendarManager: {},
            invitesManager: {},
            mockedType: Microsoft.WindowsLive.Platform.Client
        };

        Compose.mailMessageFactoryUtil = {};

        // Throw (and fail unit tests) on asserts
        if (window.Debug) {
            preserver.preserve(Debug, "throwOnAssert");
            Debug.throwOnAssert = true;
        }

        Mail.Account = {
            load: function () {
                return { mockedType: Mail.Account };
            }
        };
        Mail.UIDataModel = {};
        Mail.Utilities.ComposeHelper._selection = {
            account: {inboxView: {}, deletedView: {}},
            moveItemsFrom: function () {}
        };
        Mail.UnitTest.setupCalendarStubs();
    }

    Tx.test("CalendarActionHandlerFactory_UnitTest.testNonCalendarRequest", function (tc) {
        /// <summary>Verifies that if this is not a calendar-related mail, it returns the correct result (null)</summary>
        setup(tc);

        var factory = new Mail.CalendarActionHandlerFactory();

        var mockMessage = {
            id: "this is a mock message",
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.none
        };
        var result = factory.handle(createMockMessageModel(mockMessage));

        tc.isNull(result, "Did not expect an action handler for non-calendar message");
    });

    Tx.test("CalendarActionHandlerFactory_UnitTest.testCalendarOtherRequest", function (tc) {
        /// <summary>Verifies that if this is not a cancel mail, it returns the correct result (null)</summary>
        setup(tc);

        var factory = new Mail.CalendarActionHandlerFactory();

        var mockMessage = {
            id: "this is a mock message",
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.other
        };
        var result = factory.handle(createMockMessageModel(mockMessage));

        tc.isNull(result, "Did not expect an action handler for non-cancel message");
    });

    Tx.test("CalendarActionHandlerFactory_UnitTest.testCancelSend", function (tc) {
        /// <summary>Validates the cancel send handler in the normal case</summary>
        setup(tc);

        var eventDeleted = false;
        var mockMessage = {
            id: "this is a mock message",
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled,
            eventHandle: "handle4"
        };

        var mockEvent = {
            id: "Mock event",
            canDelete: true,
            deleteObject: function () { eventDeleted = true; }
        };

        Compose.platform.calendarManager.getEventFromHandle = function (handle) {
            tc.areEqual(mockMessage.eventHandle, handle, "Unexpected handle");
            return mockEvent;
        };

        var sendHandler = getSendHandler(tc, mockMessage);

        sendHandler(createMockMessageModel(mockMessage));

        tc.isTrue(eventDeleted, "Cancel send handler did not delete event");
    });

    Tx.test("CalendarActionHandlerFactory_UnitTest.testCancelSendEventNotFoundException", function (tc) {
        /// <summary>Verifies that if the event is not found (exception) when we send a cancellation, it does not throw.</summary>
        setup(tc);

        var eventLoadAttempted = false;

        var mockMessage = {
            id: "this is a mock message",
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled,
            eventHandle: "handle5"
        };

        Compose.platform.calendarManager.getEventFromHandle = function () {
            eventLoadAttempted = true;
            throw new Error("Unit test event load failure");
        };

        var sendHandler = getSendHandler(tc, mockMessage);

        // Test is mostly that this does not throw
        sendHandler(createMockMessageModel(mockMessage));
        tc.isTrue(eventLoadAttempted, "Test did not attempt to load the event");
    });

    Tx.test("CalendarActionHandlerFactory_UnitTest.testCancelSendEventNotFoundNull", function (tc) {
        /// <summary>Verifies that if the event is not found (null) when we send a cancellation, it does not throw.</summary>
        setup(tc);

        var eventLoadAttempted = false;

        var mockMessage = {
            id: "this is a mock message",
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled,
            eventHandle: "handle5"
        };

        Compose.platform.calendarManager.getEventFromHandle = function () {
            eventLoadAttempted = true;
            return null;
        };

        var sendHandler = getSendHandler(tc, mockMessage);

        // Test is mostly that this does not throw
        sendHandler(createMockMessageModel(mockMessage));
        tc.isTrue(eventLoadAttempted, "Test did not attempt to load the event");
    });

    Tx.test("CalendarActionHandlerFactory_UnitTest.testDeclineSend", function (tc) {
        /// <summary>Validates the decline send handler</summary>
        setup(tc);

        var responseSent = false;
        var eventDeleted = false;
        var messageDeleted = false;
        var mockMessage = {
            id: "this is a mock message",
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.responseDeclined,
            eventHandle: "handle6",
            sourceMessageStoreId: "sourceId"
        };

        var mockEvent = {
            id: "Mock event",
            canDelete: true,
            deleteObject: function () { eventDeleted = true; }
        };

        Compose.platform.calendarManager.getEventFromHandle = function (handle) {
            tc.areEqual(mockMessage.eventHandle, handle, "Unexpected handle");
            return mockEvent;
        };
        
        Compose.platform.invitesManager.sendMeetingResponse = function (ev, msg, responseReceived, account) {
            responseSent = true;
        };       
        
        Compose.mailMessageFactoryUtil.getSourceMessage = function (message) {
            if (Jx.isNonEmptyString(message.sourceMessageStoreId) &&  message.sourceMessageStoreId !== '0') {
                return {id: message.sourceMessageStoreId, mockedType: Microsoft.WindowsLive.Platform.MailMessage };
            } else {
                return null;
            }
        };
        Mail.Utilities.ComposeHelper._selection.moveItemsFrom = function (source, target, messages) {
            if (messages[0].id === mockMessage.sourceMessageStoreId) {
                messageDeleted = true;
            }
        };
        Mail.UIDataModel.MailMessage = function (originalMessage) {
            return {id: originalMessage.id};
        };

        var sendHandler = getSendHandler(tc, mockMessage);

        sendHandler(createMockMessageModel(mockMessage));

        tc.isTrue(responseSent, "Decline send handler did not send meeting response");

        // When the sourceMessageStoreId on the message is set, the message should be deleted.
        tc.isTrue(eventDeleted, "Decline send handler did not delete event");
        tc.isTrue(messageDeleted, "Decline send handler did not delete message");
        
        
        // When dhe sourceMessageStoreId isn't set, the message shouldn't be deleted.
        mockMessage.sourceMessageStoreId = "";
        eventDeleted = false;
        messageDeleted = false;

        sendHandler(createMockMessageModel(mockMessage));
        tc.isTrue(eventDeleted, "Decline send handler did not delete event");
        tc.isFalse(messageDeleted, "Decline send handler shouldn't delete message because the sourceMessageStoreId isn't set");
    });

    // Helpers
    function createMockMessageModel(platformMessage) {
        /// <summary>Creates a message model that returns the given (mock) platform message</summary>

        return {
            getPlatformMessage: function () {
                return platformMessage;
            }
        };
    }

    function getSendHandler(tc, platformMessage) {
        /// <summary>Retrieves the send handler that will be associated with the given platform message</summary>

        var factory = new Mail.CalendarActionHandlerFactory();

        var result = factory.handle(createMockMessageModel(platformMessage));

        tc.isNotNull(result, "Invalid test setup: no action handler");
        tc.isNotNull(result.send, "Invalid test setup: no send handler");
        tc.isNotNull(result.send.afterAction, "Invalid test setup: no after send handler");

        return result.send.afterAction;
    }

})();
