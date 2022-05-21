
(function () {
    /// <summary>Tests Mail.CalendarMessageModelFactory</summary>

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

        preserver.preserve(Compose, "calendarForwardMessageModelFactory");
        preserver.preserve(Compose, "calendarReplyMessageModelFactory");
        preserver.preserve(Compose, "calendarCancelMessageModelFactory");
        preserver.preserve(Compose, "calendarEditResponseMessageModelFactory");

        // Individual tests will override these if they do expect calls
        Compose.calendarForwardMessageModelFactory = {
            instance: function () {
                tc.fail("Unexpected call to CalendarForwardMessageModelFactory");
            }
        };
        Compose.calendarReplyMessageModelFactory = {
            instance: function () {
                tc.fail("Unexpected call to CalendarReplyMessageModelFactory");
            }
        };
        Compose.calendarCancelMessageModelFactory = {
            instance: function () {
                tc.fail("Unexpected call to CalendarCancelMessageModelFactory");
            }
        };

        Compose.calendarEditResponseMessageModelFactory = {
            instance: function () {
                tc.fail("Unexpected call to calendarEditResponseMessageModelFactory");
            }
        };

        // Set up some mock objects
        Mail.UnitTest.setupCalendarStubs();
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.initGlobals(tc);
    }

    Tx.test("CalendarMessageModelFactory_UnitTest.testNonCalendarRequest", function (tc) {
        /// <summary>Verifies that when the spec does not indicate a calendar request, it returns the appropriate result (null)</summary>
        setup(tc);

        var factorySpec = {
            initAction: Compose.ComposeAction.createNew
        };

        var factory = new Mail.CalendarMessageModelFactory();
        var result = factory.handle(factorySpec);

        tc.isNull(result, "Calendar factory should not have handled this request");
    });

    function verifyCalendarReply(tc, action) {
        /// <summary>Helper function tests calendar reply scenarios</summary>

        var originalEvent = getValidEvent();
        var factory = new Mail.CalendarMessageModelFactory();
        var factorySpec = {
            originalEvent: originalEvent,
            calendarAction: action
        };
        var messageModel = {
            id: "this is the message model"
        };

        Compose.calendarReplyMessageModelFactory.instance = function (factoryEvent, factoryAction) {
            tc.areEqual(originalEvent, factoryEvent, "Event passed to message model factory did not match");
            tc.areEqual(action, factoryAction, "Action passed to message model factory did not match");

            return messageModel;
        };
        
        var result = factory.handle(factorySpec);

        tc.areEqual(messageModel, result, "Unexpected message model returned");
    }

    Tx.test("CalendarMessageModelFactory_UnitTest.testCalendarReply", function (tc) {
        /// <summary>Verifies the calendar reply scenario</summary>
        setup(tc);

        verifyCalendarReply(tc, Compose.CalendarActionType.reply);
    });

    Tx.test("CalendarMessageModelFactory_UnitTest.testCalendarReplyAll", function (tc) {
        /// <summary>Verifies the calendar replyAll scenario</summary>
        setup(tc);

        verifyCalendarReply(tc, Compose.CalendarActionType.replyAll);
    });

    Tx.test("CalendarMessageModelFactory_UnitTest.testCalendarForward", function (tc) {
        /// <summary>Verifies the calendar forward scenario</summary>
        setup(tc);

        var originalEvent = getValidEvent();
        var factory = new Mail.CalendarMessageModelFactory();
        var factorySpec = {
            originalEvent: originalEvent,
            calendarAction: Compose.CalendarActionType.forward
        };

        var messageModel = {
            id: "this is the message model"
        };

        Compose.calendarForwardMessageModelFactory.instance = function (factoryEvent) {
            tc.areEqual(originalEvent, factoryEvent, "Event passed to messageModelFactory did not match");

            return messageModel;
        };

        var result = factory.handle(factorySpec);

        tc.areEqual(messageModel, result, "Unexpected final messageModel");
    });

    Tx.test("CalendarMessageModelFactory_UnitTest.testCalendarInvalid", function (tc) {
        /// <summary>Verifies that if the calendar action is not handled, we return a default message model factory</summary>
        setup(tc);

        var factorySpec = {
            originalEvent: getValidEvent(),
            calendarAction: Compose.CalendarActionType.cancel
        };
        var factory = new Mail.CalendarMessageModelFactory();

        Compose.calendarCancelMessageModelFactory.instance = function () {
            return null;
        };

        var result = factory.handle(factorySpec);

        tc.isNull(result, "Invalid test setup: unexpected valid return value from handle");
        tc.areEqual(Compose.ComposeAction.createNew, factorySpec.initAction, "Unexpected new action");
    });

    function verifyCalendarEditResponse(tc, action) {
        /// <summary>Helper function tests calendar reply scenarios</summary>

        var originalEvent = getValidEvent();
        var factory = new Mail.CalendarMessageModelFactory();
        var factorySpec = {
            originalEvent: originalEvent,
            calendarAction: action,
            originalMessage: {}
        };
        var messageModel = {
            id: "this is the message model"
        };

        Compose.calendarEditResponseMessageModelFactory.instance = function (message, factoryEvent, factoryAction) {
            tc.areEqual(originalEvent, factoryEvent, "Event passed to message model factory did not match");
            tc.areEqual(action, factoryAction, "Action passed to message model factory did not match");

            return messageModel;
        };
        
        var result = factory.handle(factorySpec);

        tc.areEqual(messageModel, result, "Unexpected message model returned");
    }

    Tx.test("CalendarMessageModelFactory_UnitTest.testCalendarEditResponseAccept", function (tc) {
        /// <summary>Verifies the calendar replyAll scenario</summary>
        setup(tc);

        verifyCalendarEditResponse(tc, Compose.CalendarActionType.accept);
    });
    
    Tx.test("CalendarMessageModelFactory_UnitTest.testCalendarEditResponseTentative", function (tc) {
        /// <summary>Verifies the calendar replyAll scenario</summary>
        setup(tc);

        verifyCalendarEditResponse(tc, Compose.CalendarActionType.tentative);
    });

    Tx.test("CalendarMessageModelFactory_UnitTest.testCalendarEditResponseDecline", function (tc) {
        /// <summary>Verifies the calendar replyAll scenario</summary>
        setup(tc);

        verifyCalendarEditResponse(tc, Compose.CalendarActionType.decline);
    });


    // Helper functions

    function getValidEvent() {
        /// <summary>Provides a valid mock event object for unit testing</summary>

        return {
            mockedType: Microsoft.WindowsLive.Platform.Calendar.Event
        };
    }
})();
