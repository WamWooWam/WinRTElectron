
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Debug,Jx,Microsoft,ProviderUTHelper,Tx,Windows,createMockPlatformCollection*/

(function () {

    var _helper = ProviderUTHelper;

    var CalPlat = Microsoft.WindowsLive.Platform.Calendar;
    var ServerCapability = CalPlat.ServerCapability;
    var BusyStatus = CalPlat.BusyStatus;
    var Sensitivity = CalPlat.Sensitivity;
    var DataType = CalPlat.DataType;
    var EventType = CalPlat.EventType;
    var Status = CalPlat.Status;
    var RecurrenceType = CalPlat.RecurrenceType;
    var WeekOfMonth = CalPlat.WeekOfMonth;
    var AppointmentRecurrenceUnit = Windows.ApplicationModel.Appointments.AppointmentRecurrenceUnit;
    var AppointmentWeekOfMonth = Windows.ApplicationModel.Appointments.AppointmentWeekOfMonth;

    Calendar.Helpers.ensureFormats();

    var _originalDebugAssert;

    function cleanupAssert() {
        Debug.assert = _originalDebugAssert;
    }

    function setup(tc) {
        /// <summary>Description</summary>
        /// <param name="tc" type="Tx.TestContext" />

        _originalDebugAssert = Debug.assert;

        tc.cleanup = cleanupAssert;
    }

    function assertDatesAreEqual(tc, expectedDate, actualDate, message) {
        /// <summary>Assert helper function</summary>

        // Can't use equality comparison on dates, and so the readable date value needs to be added to the assert message.
        tc.areEqual(expectedDate.getTime(), actualDate.getTime(), message + ": " + String(expectedDate) + ", " + String(actualDate));
    }

    Tx.test("CalendarProviderConverter.testDateCalculation", function testDateCalculation (tc) {
        /// <summary>Tests _calculateDates<summary>

        var result, startDate, duration, expectedStart, expectedEnd;
        
        function converter(tc, startDate, duration, isAllDay) {
            /// <summary>Helper function to test date conversion</summary>

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());

            var appointment = _helper.getAppointment();
            appointment.startTime = startDate;
            appointment.duration = duration;
            appointment.allDay = isAllDay;

            var converterObj = new Calendar.ProviderConverter();
            var eventResult = converterObj.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

            tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);

            return {
                startDate: eventResult.event.startDate,
                endDate: eventResult.event.endDate
            };
        }

        tc.log("Simple date test");
        startDate = new Date(2012, 3, 12, 5);
        duration = 45 * _helper.minutesToMilliSeconds;
        result = converter(tc, startDate, duration, false);
        expectedEnd = new Date(2012, 3, 12, 5, 45);
        assertDatesAreEqual(tc, startDate, result.startDate, "Unexpected change to start date");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");

        tc.log("Duration rounding test one: round down");
        startDate = new Date(2014, 5, 22, 5, 1);
        duration = 42 * _helper.minutesToMilliSeconds + 1;
        result = converter(tc, startDate, duration, false);
        tc.areEqual(43, result.endDate.getMinutes(), "Duration was not rounded correctly");

        tc.log("Duration rounding test two: round down max");
        duration = 42 * _helper.minutesToMilliSeconds + _helper.minutesToMilliSeconds - 1;
        result = converter(tc, startDate, duration, false);
        tc.areEqual(43, result.endDate.getMinutes(), "Duration was not rounded correctly");

        tc.log("Test all day event with no need of translation");
        startDate = new Date(2014, 7, 29);
        expectedEnd = new Date(2014, 7, 30);
        duration = _helper.daysToMilliSeconds;
        result = converter(tc, startDate, duration, true);
        assertDatesAreEqual(tc, startDate, result.startDate, "Unexpected change to start date");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");

        tc.log("Test all day event with perfect multiple day duration");
        startDate = new Date(2013, 12, 1);
        duration = 7 * _helper.daysToMilliSeconds;
        expectedEnd = new Date(2013, 12, 8);
        result = converter(tc, startDate, duration, true);
        assertDatesAreEqual(tc, startDate, result.startDate, "Unexpected change to start date");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");

        tc.log("Test all day event with same end date");
        startDate = new Date(2014, 9, 12);
        duration = 0;
        expectedEnd = new Date(2014, 9, 13);
        result = converter(tc, startDate, duration, true);
        assertDatesAreEqual(tc, startDate, result.startDate, "Unexpected change to start date");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");

        tc.log("Test all day event not on midnight");
        startDate = new Date(2015, 2, 5, 6, 30);
        duration = 4 * _helper.hoursToMilliSeconds;
        expectedStart = new Date(2015, 2, 5);
        expectedEnd = new Date(2015, 2, 6);
        result = converter(tc, startDate, duration, true);
        assertDatesAreEqual(tc, expectedStart, result.startDate, "Start date did not match");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");

        tc.log("Test all day event with multi day duration not on midnight");
        startDate = new Date(2015, 11, 25, 7, 15);
        duration = 5 * _helper.hoursToMilliSeconds + 5 * _helper.daysToMilliSeconds;
        expectedStart = new Date(2015, 11, 25);
        expectedEnd = new Date(2015, 11, 31);
        result = converter(tc, startDate, duration, true);
        assertDatesAreEqual(tc, expectedStart, result.startDate, "Start date did not match");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");

        tc.log("Test all day event with same end date not on midnight");
        startDate = new Date(2015, 4, 8, 23, 25);
        duration = 0;
        expectedStart = new Date(2015, 4, 8);
        expectedEnd = new Date(2015, 4, 9);
        result = converter(tc, startDate, duration, true);
        assertDatesAreEqual(tc, expectedStart, result.startDate, "Start date did not match");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");

        tc.log("Test all day event where 'date' for end is less than start");
        startDate = new Date(2015, 6, 30);
        duration = 5 * _helper.daysToMilliSeconds;
        expectedStart = startDate;
        expectedEnd = new Date(2015, 7, 4);
        result = converter(tc, startDate, duration, true);
        assertDatesAreEqual(tc, expectedStart, result.startDate, "Start date did not match");
        assertDatesAreEqual(tc, expectedEnd, result.endDate, "End date did not match");
    });

    Tx.test("CalendarProviderConverter.testReminderCalculation", function testReminderCalculation (tc) {
        /// <summary>Verifies reminder conversion</summary>

        var result, reminder;

        function converter(tc, reminder) {
            /// <summary>Helper function to test reminder conversion</summary>

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());

            var appointment = _helper.getAppointment();
            appointment.reminder = reminder;

            var converterObj = new Calendar.ProviderConverter();
            var eventResult = converterObj.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

            tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);

            return eventResult.event.reminder;
        }

        tc.log("Simple reminder test");
        reminder = 15 * _helper.minutesToMilliSeconds;
        result = converter(tc, reminder);
        tc.areEqual(15, result, "Reminder did not match");

        tc.log("Reminder is not an integer number of minutes test, round down");
        reminder = 15 * _helper.minutesToMilliSeconds + 499;
        result = converter(tc, reminder);
        tc.areEqual(15, result, "Reminder did not match");

        tc.log("Reminder is not an integer number of minutes test, round up");
        reminder = 15 * _helper.minutesToMilliSeconds - 499;
        result = converter(tc, reminder);
        tc.areEqual(15, result, "Reminder did not match");

        tc.log("Reminder is null test");
        reminder = null;
        result = converter(tc, reminder);
        tc.areEqual(-1, result, "Reminder did not match");
    });

    Tx.test("CalendarProvider.simpleFieldsTest", function simpleFieldsTest (tc) {
        /// <summary>Verifies that simple copy fields are copied as expected</summary>

        // Covers: subject, location, data

        var expectedLocation = "Location, Location, Location!";
        var expectedSubject = "This is the test subject";
        var expectedData = "This is the event's information";

        var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
        var appointment = _helper.getAppointment();
        var converter = new Calendar.ProviderConverter();

        appointment.location = expectedLocation;
        appointment.subject = expectedSubject;
        appointment.details = expectedData;

        
        var resultEvent = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true).event;

        tc.areEqual(expectedLocation, resultEvent.location, "Location");
        tc.areEqual(expectedSubject, resultEvent.subject, "Subject");
        tc.areEqual(expectedData, resultEvent.data, "Data");
    });

    Tx.test("CalendarProvider.busyStatusTest", function busyStatusTest(tc) {
        /// <summary>Verifies busy status conversion</summary>

        var AppointmentBusyStatus = Windows.ApplicationModel.Appointments.AppointmentBusyStatus;
        var BusyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus;
        var result;

        function converter(tc, busyStatus) {
            /// <summary>Helper function to test busyStatus conversion</summary>

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
            var appointment = _helper.getAppointment();
            appointment.busyStatus = busyStatus;
            var converterObj = new Calendar.ProviderConverter();

            var eventResult = converterObj.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

            tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);

            return eventResult.event.busyStatus;
        }

        tc.log("BusyStatus: busy");
        result = converter(tc, AppointmentBusyStatus.busy);
        tc.areEqual(BusyStatus.busy, result, "Expected busyStatus of busy");

        tc.log("BusyStatus: free");
        result = converter(tc, AppointmentBusyStatus.free);
        tc.areEqual(BusyStatus.free, result, "Expected busyStatus of busy");

        tc.log("BusyStatus: outOfOffice");
        result = converter(tc, AppointmentBusyStatus.outOfOffice);
        tc.areEqual(BusyStatus.outOfOffice, result, "Expected busyStatus of outOfOffice");

        tc.log("BusyStatus: workingElsewhere");
        result = converter(tc, AppointmentBusyStatus.workingElsewhere);
        tc.areEqual(BusyStatus.workingElsewhere, result, "Expected busyStatus of workingElsewhere");

        tc.log("BusyStatus: other");
        result = converter(tc, -25);
        tc.areEqual(BusyStatus.busy, result, "Expected busyStatus of busy");
    });

    Tx.test("CalendarProviderConverter.sensitivityTest", function sensitivityTest (tc) {
        /// <summary>Tests sensitivity conversion</summary>

        var AppointmentSensitivity = Windows.ApplicationModel.Appointments.AppointmentSensitivity;
        var Sensitivity = Microsoft.WindowsLive.Platform.Calendar.Sensitivity;
        var result;

        function converter(tc, sensitivity) {
            /// <summary>Helper function to test sensitivity conversion</summary>

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
            var appointment = _helper.getAppointment();
            appointment.sensitivity = sensitivity;
            var converterObj = new Calendar.ProviderConverter();

            var eventResult = converterObj.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

            tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);

            return eventResult.event.sensitivity;
        }

        tc.log("Sensitivity: private");
        result = converter(tc, AppointmentSensitivity.private);
        tc.areEqual(Sensitivity.private, result, "Expected sensitivity of private");

        tc.log("Sensitivity: public");
        result = converter(tc, AppointmentSensitivity.public);
        tc.areEqual(Sensitivity.normal, result, "Expected sensitivity of normal");

        tc.log("Sensitivity: other");
        result = converter(tc, -25);
        tc.areEqual(Sensitivity.normal, result, "Expected sensitivity of normal");
    });

    Tx.test("CalendarProviderConverter.organizerTest", function organizerTest (tc) {
        /// <summary>tests organizer-related fields</summary>

        // Includes: organizerName, organizerEmail, responseRequested
        
        var event;
        var testOrganizer;

        function converter(tc, organizer) {
            /// <summary>Helper function to test organizer conversion</summary>
            /// <param name="organizer" type="Windows.ApplicationModel.Appointments.AppointmentOrganizer">organizer</param>

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
            var appointment = _helper.getAppointment();
            appointment.organizer = organizer;
            var converterObj = new Calendar.ProviderConverter();

            var eventResult = converterObj.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

            tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);

            return eventResult.event;
        }

        tc.log("No organizer test");
        event = converter(tc, null);
        tc.isFalse(Jx.isNonEmptyString(event.organizerName), "Unexpectedly populated organizerName");
        tc.areEqual(_helper.defaultOrganizer, event.organizerEmail, "Unexpectedly populated organizerEmail");
        tc.isTrue(event.responseRequested, "responseRequested did not match");

        tc.log("Organizer test");
        testOrganizer = new Windows.ApplicationModel.Appointments.AppointmentOrganizer();
        testOrganizer.displayName = "organizer name";
        testOrganizer.address = "organizer@email";
        event = converter(tc, testOrganizer);
        tc.areEqual(testOrganizer.displayName, event.organizerName, "OrganizerName did not match");
        tc.areEqual(testOrganizer.address, event.organizerEmail, "organizerEmail did not match");
        tc.isFalse(event.responseRequested, "responseRequested did not match");

        tc.log("Organizer email not specified test");
        testOrganizer = new Windows.ApplicationModel.Appointments.AppointmentOrganizer();
        testOrganizer.displayName = "name name 2";
        event = converter(tc, testOrganizer);
        tc.isFalse(Jx.isNonEmptyString(event.organizerName), "Unexpectedly populated organizerName");
        tc.areEqual(_helper.defaultOrganizer, event.organizerEmail, "Unexpectedly populated organizerEmail");
        tc.isTrue(event.responseRequested, "responseRequested did not match");

        // We could add some more trim-related tests here
    });

    Tx.test("CalendarProviderConverter.testUnit", function testUnit (tc) {
        /// <summary>Verifies recurrence unit conversion</summary>

        function converter(tc, unit, expectFailure) {
            /// <summary>Helper function to test unit conversion</summary>
            /// <param name="unit" type="Windows.ApplicationModel.Appointments.AppointmentRecurrenceUnit">unit to convert</param>
            /// <param name="expectFailure" type="Boolean" optional="true">Whether to expect failure</param>

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
            var appointment = _helper.getAppointment(true);
            appointment.recurrence.unit = unit;
            var converterObj = new Calendar.ProviderConverter();

            var eventResult = converterObj.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

            if (expectFailure) {
                tc.isNull(eventResult.event, "Unexpectedly succeeded creating event");

                // Verify error fields
                tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
                tc.areEqual(Status.errorInvalidRecurrenceType, eventResult.errorHresult, "errorHresult");
            } else {
                tc.isNotNull(eventResult.event, "Unexpected error converting event");
                tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);
                tc.isNotNull(eventResult.event.recurrence, "recurrence should be present on result event");
            }

            return eventResult.event;
        }

        var event;

        tc.log("Convert daily unit");
        event = converter(tc, AppointmentRecurrenceUnit.daily);
        tc.areEqual(RecurrenceType.daily, event.recurrence.recurrenceType, "recurrenceType.daily");

        tc.log("Convert weekly unit");
        event = converter(tc, AppointmentRecurrenceUnit.weekly);
        tc.areEqual(RecurrenceType.weekly, event.recurrence.recurrenceType, "recurrenceType.weekly");

        tc.log("Convert monthly unit");
        event = converter(tc, AppointmentRecurrenceUnit.monthly);
        tc.areEqual(RecurrenceType.monthly, event.recurrence.recurrenceType, "recurrenceType.monthly");

        tc.log("Convert monthlyOnDay unit");
        event = converter(tc, AppointmentRecurrenceUnit.monthlyOnDay);
        tc.areEqual(RecurrenceType.monthlyOnDay, event.recurrence.recurrenceType, "recurrenceType.monthlyOnDay");

        tc.log("Convert yearly unit");
        event = converter(tc, AppointmentRecurrenceUnit.yearly);
        tc.areEqual(RecurrenceType.yearly, event.recurrence.recurrenceType, "recurrenceType.yearly");

        tc.log("Convert yearlyOnDay unit");
        event = converter(tc, AppointmentRecurrenceUnit.yearlyOnDay);
        tc.areEqual(RecurrenceType.yearlyOnDay, event.recurrence.recurrenceType, "recurrenceType.yearlyOnDay");
        
        tc.log("Conversion error for unit");
        event = converter(tc, 234, true); // the converter function does the validation
    });

    Tx.test("CalendarProviderConverter.testUntil", function testUntil (tc) {
        /// <summary>Verifies recurrence until conversion</summary>

        var untilDate = new Date("5/16/2014");

        var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
        var appointment = _helper.getAppointment(true);
        appointment.recurrence.until = untilDate;
        var converter = new Calendar.ProviderConverter();

        var eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNotNull(eventResult.event, "Unexpected failure converting event");
        assertDatesAreEqual(tc, untilDate, eventResult.event.recurrence.until, "until date");
    });

    Tx.test("CalendarProviderConverter.testOccurrences", function testOccurrences (tc) {
        /// <summary>Verifies recurrence occurrences conversion</summary>

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment(true);
        var eventResult;
        var occurrenceException = {
            number: Status.errorOccurrencesTooLarge
        };
        var converter = new Calendar.ProviderConverter();

        Tx.log("Success test");
        appointment.recurrence.occurrences = 5;
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNotNull(eventResult.event, "Event conversion unexpectedly failed");
        tc.areEqual(appointment.recurrence.occurrences, eventResult.event.recurrence.occurrences, "occurrences");

        Tx.log("Failure test");
        appointment.recurrence.occurrences = 1500;
        mockEvent.recurrence = {};
        Object.defineProperty(mockEvent.recurrence, "occurrences", {
            get: function () { return 5; },
            set: function () { throw occurrenceException; }
        });
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected success converting event");
        tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
        tc.areEqual(Status.errorOccurrencesTooLarge, eventResult.errorHresult, "Error code");
    });

    Tx.test("CalendarProviderConverter.testDaysOfWeek", function testDaysOfWeek (tc) {
        /// <summary>Verifies recurrence daysOfWeek conversion</summary>

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment(true);
        var eventResult;
        var assignmentException = {
            number: Status.errorInvalidDayOfWeek
        };
        var converter = new Calendar.ProviderConverter();

        Tx.log("Success test");
        appointment.recurrence.daysOfWeek = 5;
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNotNull(eventResult.event, "Event conversion unexpectedly failed");
        tc.areEqual(appointment.recurrence.daysOfWeek, eventResult.event.recurrence.dayOfWeek, "dayOfWeek");

        Tx.log("Failure test");
        appointment.recurrence.daysOfWeek = 1500;
        mockEvent.recurrence = {};
        Object.defineProperty(mockEvent.recurrence, "dayOfWeek", {
            get: function () { return 5; },
            set: function () { throw assignmentException; }
        });
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected success converting event");
        tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
        tc.areEqual(Status.errorInvalidDayOfWeek, eventResult.errorHresult, "Error code");
    });

    Tx.test("CalendarProviderConverter.testWeekOfMonth", function testWeekOfMonth (tc) {
        /// <summary>Verifies recurrence weekOfMonth conversion</summary>

        function converter(tc, weekOfMonth, expectFailure) {
            /// <summary>Helper function to test unit conversion</summary>
            /// <param name="weekOfMonth" type="Windows.ApplicationModel.Appointments.AppointmentWeekOfMonth">unit to convert</param>
            /// <param name="expectFailure" type="Boolean" optional="true">Whether to expect failure</param>

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
            var appointment = _helper.getAppointment(true);
            appointment.recurrence.unit = AppointmentRecurrenceUnit.monthlyOnDay;
            appointment.recurrence.weekOfMonth = weekOfMonth;
            var converterObj = new Calendar.ProviderConverter();

            var eventResult = converterObj.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

            if (expectFailure) {
                tc.isNull(eventResult.event, "Unexpectedly succeeded creating event");

                // Verify error fields
                tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
                tc.areEqual(Status.errorInvalidWeekOfMonth, eventResult.errorHresult, "hresult");
            } else {
                tc.isNotNull(eventResult.event, "Unexpected error converting event");
                tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);
                tc.isNotNull(eventResult.event.recurrence, "recurrence should be present on result event");
            }

            return eventResult.event;
        }

        var event;

        tc.log("Convert first WeekOfMonth");
        event = converter(tc, AppointmentWeekOfMonth.first);
        tc.areEqual(WeekOfMonth.first, event.recurrence.weekOfMonth, "WeekOfMonth.first");

        tc.log("Convert second WeekOfMonth");
        event = converter(tc, AppointmentWeekOfMonth.second);
        tc.areEqual(WeekOfMonth.second, event.recurrence.weekOfMonth, "WeekOfMonth.second");

        tc.log("Convert third WeekOfMonth");
        event = converter(tc, AppointmentWeekOfMonth.third);
        tc.areEqual(WeekOfMonth.third, event.recurrence.weekOfMonth, "WeekOfMonth.third");

        tc.log("Convert fourth WeekOfMonth");
        event = converter(tc, AppointmentWeekOfMonth.fourth);
        tc.areEqual(WeekOfMonth.fourth, event.recurrence.weekOfMonth, "WeekOfMonth.fourth");

        tc.log("Convert last WeekOfMonth");
        event = converter(tc, AppointmentWeekOfMonth.last);
        tc.areEqual(WeekOfMonth.last, event.recurrence.weekOfMonth, "WeekOfMonth.last");

        tc.log("Conversion error for WeekOfMonth");
        event = converter(tc, 234, true); // the converter function does the validation
    });

    Tx.test("CalendarProviderConverter.testMonthOfYear", function testMonthOfYear (tc) {
        /// <summary>Verifies recurrence testMonthOfYear conversion</summary>

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment(true);
        appointment.recurrence.unit = AppointmentRecurrenceUnit.yearly;
        var eventResult;
        var assignmentException = {
            number: Status.errorInvalidMonthOfYear
        };
        var converter = new Calendar.ProviderConverter();

        Tx.log("Success test");
        appointment.recurrence.month = 5;
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNotNull(eventResult.event, "Event conversion unexpectedly failed");
        tc.areEqual(appointment.recurrence.month, eventResult.event.recurrence.monthOfYear, "monthOfYear");

        Tx.log("Failure test");
        appointment.recurrence.month = 1500;
        mockEvent.recurrence = {};
        Object.defineProperty(mockEvent.recurrence, "monthOfYear", {
            get: function () { return 5; },
            set: function () { throw assignmentException; }
        });
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected success converting event");
        tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
        tc.areEqual(Status.errorInvalidMonthOfYear, eventResult.errorHresult, "Error code");
    });

    Tx.test("CalendarProviderConverter.testDayOfMonth", function testDayOfMonth (tc) {
        /// <summary>Verifies recurrence testDayOfMonth conversion</summary>

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment(true);
        appointment.recurrence.unit = AppointmentRecurrenceUnit.monthly;
        var eventResult;
        var assignmentException = {
            number: Status.errorInvalidDayOfMonth
        };
        var converter = new Calendar.ProviderConverter();

        Tx.log("Success test");
        appointment.recurrence.day = 5;
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNotNull(eventResult.event, "Event conversion unexpectedly failed");
        tc.areEqual(appointment.recurrence.day, eventResult.event.recurrence.dayOfMonth, "dayOfMonth");

        Tx.log("Failure test");
        appointment.recurrence.day = 99;
        mockEvent.recurrence = {};
        Object.defineProperty(mockEvent.recurrence, "dayOfMonth", {
            get: function () { return 5; },
            set: function () { throw assignmentException; }
        });
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected success converting event");
        tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
        tc.areEqual(Status.errorInvalidDayOfMonth, eventResult.errorHresult, "Error code");
    });

    Tx.test("CalendarProviderConverter.testInterval", function testInterval (tc) {
        /// <summary>Verifies recurrence interval conversion</summary>

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment(true);
        var eventResult;
        var intervalException = {
            number: Status.errorIntervalTooSmall
        };
        var converter = new Calendar.ProviderConverter();

        Tx.log("Success test");
        appointment.recurrence.interval = 5;
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNotNull(eventResult.event, "Event conversion unexpectedly failed");
        tc.areEqual(appointment.recurrence.interval, eventResult.event.recurrence.interval, "interval");

        Tx.log("Failure test");
        appointment.recurrence.interval = -15;
        mockEvent.recurrence = {};
        Object.defineProperty(mockEvent.recurrence, "interval", {
            get: function () { return 5; },
            set: function () { throw intervalException; }
        });
        eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected success converting event");
        tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
        tc.areEqual(Status.errorIntervalTooSmall, eventResult.errorHresult, "Error code");
    });

    Tx.test("CalendarProviderConverter.testValidationFailure", function testValidationFailure (tc) {
        /// <summary>Verifies behavior when event validation fails</summary>

        setup(tc);

        var errorCode = 512347; // some error code

        var mockEvent = _helper.getMockEvent();
        mockEvent.validate = function () {
            return errorCode; 
        };
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment();
        Debug.assert = function () { };
        var converter = new Calendar.ProviderConverter();

        var eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected event returned from conversion");
        tc.areEqual(Jx.res.getString("ProviderErrorGeneric"), eventResult.errorText, "errorText");
        tc.areEqual(errorCode, eventResult.errorHresult, "Error code");
    });

    Tx.test("CalendarProviderConverter.testValidationRecurrenceFailure", function testValidationRecurrenceFailure(tc) {
        /// <summary>Verifies behavior when event validation fails with a recurrence error</summary>

        var errorCode = Status.errorInvalidRecurrenceType;
        var mockEvent = _helper.getMockEvent();
        mockEvent.validate = function () {
            return errorCode;
        };
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment(true);
        var converter = new Calendar.ProviderConverter();

        var eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected event returned from conversion");
        tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceGeneric"), eventResult.errorText, "errorText");
        tc.areEqual(errorCode, eventResult.errorHresult, "Error code");
    });

    Tx.test("CalendarProviderConverter.testValidationRecurrenceOverlap", function testValidationRecurrenceFailure(tc) {
        /// <summary>Verifies behavior when event validation fails with the specific recurrence error</summary>

        var errorCode = Status.errorExceptionsOverlap;
        var mockEvent = _helper.getMockEvent();
        mockEvent.recurring = true;
        mockEvent.validate = function () {
            return errorCode;
        };
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var appointment = _helper.getAppointment(true);
        var converter = new Calendar.ProviderConverter();

        var eventResult = converter.convertToEvent(appointment, mockPlatform.calendarManager.defaultCalendar, true);

        tc.isNull(eventResult.event, "Unexpected event returned from conversion");
        tc.areEqual(Jx.res.getString("ProviderErrorRecurrenceOverlap"), eventResult.errorText, "errorText");
    });

    Tx.test("CalendarProviderConverter.testUpdateBeforeSaveFields", function testUpdateBeforeSave (tc) {
        /// <summary>Verifies that updateBeforeSave copies fields over correctly</summary>

        var mockNewEvent = _helper.getMockEvent();

        var mockCalendar = _helper.getMockCalendar(mockNewEvent);
        mockCalendar.capabilities = 0;
        mockNewEvent.calendar = mockCalendar;

        var mockConvertedEvent = _helper.getMockEvent();
        mockConvertedEvent.busyStatus = BusyStatus.busy;
        mockConvertedEvent.calendar = mockCalendar;

        var result;
        var converter = new Calendar.ProviderConverter();
        converter._organizerInfo = {
            hasOrganizer: true
        };

        tc.log("Simple add test");
        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, null);
        tc.areEqual(mockNewEvent, result, "Unexpected return value");

        // Verify that replace returns the loaded event, and all fields are copied over.
        tc.log("Replace test");
        var mockOriginalEvent = _helper.getMockEvent();
        mockOriginalEvent.calendar = mockCalendar;
        mockOriginalEvent.recurring = true;
        mockOriginalEvent.organizerEmail = "originalOrganizer@fabrikam.com";
        mockOriginalEvent.organizerName = "test organizer";
        mockOriginalEvent.isOrganizer = false;

        mockConvertedEvent = _helper.getMockEvent();
        mockConvertedEvent.startDate = new Date("7/29/2010 5:00pm");
        mockConvertedEvent.endDate = new Date("7/29/2010 6:00pm");
        mockConvertedEvent.allDayEvent = false;
        mockConvertedEvent.subject = "test UT subject";
        mockConvertedEvent.location = "test UT location";
        mockConvertedEvent.reminder = -1;
        mockConvertedEvent.data = "test UT data";
        mockConvertedEvent.dataType = DataType.html;
        mockConvertedEvent.organizerName = "ut test organizer name";
        mockConvertedEvent.organizerEmail = "utOrganizerEmail@contoso.com";
        mockConvertedEvent.sensitivity = Sensitivity.private;
        mockConvertedEvent.responseRequested = true;
        mockConvertedEvent.busyStatus = BusyStatus.free;
        mockConvertedEvent.calendar = mockCalendar;
        mockConvertedEvent.recurring = false;

        tc.log("Verify that each field is copied over correctly.");
        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(mockOriginalEvent, result, "Expected loaded event");
        tc.areEqual(mockConvertedEvent.startDate, result.startDate, "startDate");
        tc.areEqual(mockConvertedEvent.endDate, result.endDate, "endDate");
        tc.areEqual(mockConvertedEvent.allDayEvent, result.allDayEvent, "allDayEvent");
        tc.areEqual(mockConvertedEvent.subject, result.subject, "subject");
        tc.areEqual(mockConvertedEvent.location, result.location, "location");
        tc.areEqual(mockConvertedEvent.reminder, result.reminder, "reminder");
        tc.areEqual(mockConvertedEvent.data, result.data, "data");
        tc.areEqual(mockConvertedEvent.dataType, result.dataType, "dataType");
        tc.areEqual(mockConvertedEvent.organizerName, result.organizerName, "organizerName");
        tc.areEqual(mockConvertedEvent.organizerEmail, result.organizerEmail, "organizerEmail");
        tc.areEqual(mockConvertedEvent.sensitivity, result.sensitivity, "sensitivity");
        tc.areEqual(mockConvertedEvent.responseRequested, result.responseRequested, "responseRequested");
        tc.areEqual(mockConvertedEvent.busyStatus, result.busyStatus, "busyStatus");
        tc.areEqual(false, result.recurring, "recurring");

        tc.log("Verify that updateBeforeSave does not replace fields that have not changed");
        mockOriginalEvent = _helper.getMockEvent();
        mockOriginalEvent.calendar = mockCalendar;
        mockOriginalEvent.recurring = false;

        mockConvertedEvent.organizerEmail = mockOriginalEvent.organizerEmail;
        mockConvertedEvent.organizerName = mockOriginalEvent.organizerName;

        Object.defineProperties(mockOriginalEvent, {
            startDate: {
                set: function () { throw new Error("Unexpected call to set startDate"); },
                get: function () { return mockConvertedEvent.startDate; },
                enumerable: true,
            },
            endDate: {
                set: function () { throw new Error("Unexpected call to set endDate"); },
                get: function () { return mockConvertedEvent.endDate; },
                enumerable: true,
            },
            allDayEvent: {
                set: function () { throw new Error("Unexpected call to set allDayEvent"); },
                get: function () { return mockConvertedEvent.allDayEvent; },
                enumerable: true,
            },
            subject: {
                set: function () { throw new Error("Unexpected call to set subject"); },
                get: function () { return mockConvertedEvent.subject; },
                enumerable: true,
            },
            location: {
                set: function () { throw new Error("Unexpected call to set location"); },
                get: function () { return mockConvertedEvent.location; },
                enumerable: true,
            },
            reminder: {
                set: function () { throw new Error("Unexpected call to set reminder"); },
                get: function () { return mockConvertedEvent.reminder; },
                enumerable: true,
            },
            data: {
                set: function () { throw new Error("Unexpected call to set data"); },
                get: function () { return mockConvertedEvent.data; },
                enumerable: true,
            },
            dataType: {
                set: function () { throw new Error("Unexpected call to set dataType"); },
                get: function () { return mockConvertedEvent.dataType; },
                enumerable: true,
            },
            sensitivity: {
                set: function () { throw new Error("Unexpected call to set sensitivity"); },
                get: function () { return mockConvertedEvent.sensitivity; },
                enumerable: true,
            },

        });

        // Test is mostly that this does not throw.
        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(mockOriginalEvent, result, "Expected loaded event");

        tc.log("Verify that dataType is always set when data is changed");
        var oldData = "old data";
        var newData = "new Data";
        var dataTypeSet = false;
        mockOriginalEvent = _helper.getMockEvent();
        mockOriginalEvent.calendar = mockCalendar;
        mockOriginalEvent.recurring = false;
        mockOriginalEvent.data = oldData;

        mockConvertedEvent.data = newData;
        var htmlDataType = CalPlat.DataType.html;
        Object.defineProperties(mockOriginalEvent, {
            dataType: {
                set: function () {
                    dataTypeSet = true;
                },
                get: function () { return htmlDataType; },
                enumerable: true,
            }
        });

        tc.areEqual(mockOriginalEvent.dataType, mockConvertedEvent.dataType, "Invalid test setup: loaded dataType and converted dataType need to be the same");

        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(mockOriginalEvent, result, "Expected loaded event");
        tc.areEqual(mockOriginalEvent.data, newData, "Data was not set to new value");
        tc.isTrue(dataTypeSet, "dataType should have been set after data was updated");

        // Organizer should not be copied over if not specified by the appointment. Windows Blue Bugs: 459999
        // In this scenario, the converted event is on the default calendar, but the user chose to save the event on a different calendar.
        tc.log("Verify organizer is not copied over if not specified");
        converter._organizerInfo = {
            hasOrganizer: false
        };
        mockNewEvent.organizerName = "Email3";
        mockNewEvent.organizerEmail = "email3@fabrikam.com";

        mockConvertedEvent.organizerEmail = "email2@fabrikam.com";
        mockConvertedEvent.organizerName = "Email2";

        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, null);
        tc.areEqual("Email3", result.organizerName, "organizerName");
        tc.areEqual("email3@fabrikam.com", result.organizerEmail, "organizerEmail");
    });

    Tx.test("CalendarProviderConverter.testUpdateBeforeSaveRecurrence", function testUpdateBeforeSaveRecurrence (tc) {
        /// <summary>Verifies that recurrence fields are copied over correctly</summary>

        var mockCalendar = _helper.getMockCalendar();
        mockCalendar.capabilities = 0;
        mockCalendar.createEvent = function () { tc.error("Unexpected call to createEvent"); };

        var converter = new Calendar.ProviderConverter();
        converter._organizerInfo = {
            hasOrganizer: false,
        };

        var result;

        // Verify that replace returns the loaded event, and all fields are copied over.
        tc.log("Replace test");
        var mockOriginalEvent = _helper.getMockEvent();
        mockOriginalEvent.calendar = mockCalendar;
        mockOriginalEvent.recurring = false;
        mockOriginalEvent.recurrence = {};

        var mockConvertedEvent = _helper.getMockEvent(); 
        mockConvertedEvent.calendar = mockCalendar;
        mockConvertedEvent.recurring = true;
        mockConvertedEvent.recurrence = {
            recurrenceType: 5,
            occurrences: 32,
            until: new Date(),
            interval: 7,
            weekOfMonth: 3,
            dayOfWeek: 1,
            monthOfYear: 11
        };

        // Verify that each field is copied over correctly
        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(mockOriginalEvent, result, "Expected loaded event");
        tc.areEqual(true, result.recurring, "recurring");
        tc.areEqual(mockConvertedEvent.recurrence.recurrenceType, result.recurrence.recurrenceType, "recurrenceType");
        tc.areEqual(mockConvertedEvent.recurrence.occurrences, result.recurrence.occurrences, "occurrences");
        tc.areEqual(mockConvertedEvent.recurrence.until, result.recurrence.until, "until");
        tc.areEqual(mockConvertedEvent.recurrence.interval, result.recurrence.interval, "interval");
        tc.areEqual(mockConvertedEvent.recurrence.weekOfMonth, result.recurrence.weekOfMonth, "weekOfMonth");
        tc.areEqual(mockConvertedEvent.recurrence.dayOfWeek, result.recurrence.dayOfWeek, "dayOfWeek");
        tc.areEqual(mockConvertedEvent.recurrence.monthOfYear, result.recurrence.monthOfYear, "monthOfYear");
    });

    Tx.test("CalendarProviderConverter.testUpdateBeforeSaveException", function testUpdateBeforeSaveException (tc) {
        /// <summary>Verifies that updateBeforeSave does the right thing when saving an exception</summary>

        var mockCalendar = _helper.getMockCalendar();
        mockCalendar.capabilities = 0;
        mockCalendar.createEvent = function () { tc.error("Unexpected call to createEvent"); };

        var mockConvertedEvent = _helper.getMockEvent();
        mockConvertedEvent.busyStatus = BusyStatus.busy,
        mockConvertedEvent.calendar = mockCalendar;

        var result;
        var originalOrganizerName = "Original Organizer";
        var originalOrganizerEmail = "organizer@original.com";
        var originalResponseRequested = true;
        var originalRecurrence = { id: "originalRecurrence" };
        var converter = new Calendar.ProviderConverter();

        // Verify that replace returns the loaded event, and all appropriate fields are copied over.
        tc.log("Replace test");
        var mockOriginalEvent = _helper.getMockEvent();
        mockOriginalEvent.calendar = mockCalendar;
        mockOriginalEvent.organizerName = originalOrganizerName;
        mockOriginalEvent.organizerEmail = originalOrganizerEmail;
        mockOriginalEvent.responseRequested = originalResponseRequested;
        mockOriginalEvent.recurrence = originalRecurrence;
        mockOriginalEvent.eventType = EventType.exceptionToSeries;
        mockOriginalEvent.isOrganizer = false;

        mockConvertedEvent = {
            startDate: new Date("7/29/2010 5:00pm"),
            endDate: new Date("7/29/2010 6:00pm"),
            allDayEvent: false,
            subject: "test UT subject",
            location: "test UT location",
            reminder: -1,
            data: "test UT data",
            dataType: DataType.html,
            organizerName: "ut test organizer name",
            organizerEmail: "utOrganizerEmail@contoso.com",
            sensitivity: Sensitivity.private,
            responseRequested: false,
            busyStatus: BusyStatus.free,
            calendar: mockCalendar,
            recurrence: { id: "convertedRecurrence" }
        };
        converter._organizerInfo = {
            hasOrganizer: true
        };

        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(mockOriginalEvent, result, "Expected original event");
        tc.areEqual(mockConvertedEvent.startDate, result.startDate, "startDate");
        tc.areEqual(mockConvertedEvent.endDate, result.endDate, "endDate");
        tc.areEqual(mockConvertedEvent.allDayEvent, result.allDayEvent, "allDayEvent");
        tc.areEqual(mockConvertedEvent.subject, result.subject, "subject");
        tc.areEqual(mockConvertedEvent.location, result.location, "location");
        tc.areEqual(mockConvertedEvent.reminder, result.reminder, "reminder");
        tc.areEqual(mockConvertedEvent.data, result.data, "data");
        tc.areEqual(mockConvertedEvent.dataType, result.dataType, "dataType");
        tc.areEqual(mockConvertedEvent.sensitivity, result.sensitivity, "sensitivity");
        tc.areEqual(mockConvertedEvent.busyStatus, result.busyStatus, "busyStatus");

        // These fields shouldn't be copied over for exceptions
        tc.areEqual(originalOrganizerEmail, result.organizerEmail, "organizerEmail");
        tc.areEqual(originalOrganizerName, result.organizerName, "organizerName");
        tc.areEqual(originalResponseRequested, result.responseRequested, "responseRequested");
        tc.areEqual(originalRecurrence, result.recurrence, "recurrence");
    });

    Tx.test("CalendarProviderConverter.testUpdateBeforeSaveBusyStatus", function testUpdateBeforeSaveBusyStatus (tc) {
        /// <summary>Tests updateBeforeSave's busy status logic</summary>

        // statusWorkingElsewhere plus some semi-random other capabilities
        var capabilitiesSupportsWorkingElsewhere = ServerCapability.statusWorkingElsewhere | ServerCapability.canForward | ServerCapability.responseType | ServerCapability.firstDayOfWeek | ServerCapability.attendeeType;

        var capabilitiesNoWorkingElsewhere = ServerCapability.canForward | ServerCapability.responseType | ServerCapability.firstDayOfWeek | ServerCapability.attendeeType;

        var mockCalendar = _helper.getMockCalendar(); 
        mockCalendar.capabilities = 0;
        mockCalendar.createEvent = function () { tc.error("Unexpected call to createEvent"); };

        var mockConvertedEvent = _helper.getMockEvent();
        mockConvertedEvent.busyStatus = BusyStatus.busy;
        mockConvertedEvent.calendar = mockCalendar;

        var mockOriginalEvent = _helper.getMockEvent();
        mockOriginalEvent.calendar = mockCalendar;

        var result;
        var converter = new Calendar.ProviderConverter();
        converter._organizerInfo = {
            hasOrganizer: false,
        };

        tc.log("BusyStatus: Simple test");
        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(BusyStatus.busy, result.busyStatus, "Unexpected change in busy status");

        tc.log("BusyStatus: Server supports working elsewhere");
        mockCalendar.capabilities = capabilitiesSupportsWorkingElsewhere;
        mockConvertedEvent.busyStatus = BusyStatus.workingElsewhere;
        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(BusyStatus.workingElsewhere, result.busyStatus, "Should have kept workingElsewhere status");

        tc.log("BusyStatus: Server does not support working elsewhere");
        mockCalendar.capabilities = capabilitiesNoWorkingElsewhere;
        mockConvertedEvent.busyStatus = BusyStatus.workingElsewhere;
        result = converter.updateBeforeSave(mockConvertedEvent, mockCalendar, mockOriginalEvent);
        tc.areEqual(BusyStatus.free, result.busyStatus, "workingElsewhere should have been converted to free");
    });

    Tx.test("CalendarProviderConverter.testUpdateBeforeSaveCalendars", function testUpdateBeforeSaveCalendars (tc) {
        /// <summary>Verifies that the event is saved on the correct calendar</summary>

        var mockCreatedEvent = _helper.getMockEvent();
        mockCreatedEvent.uid = "created";

        var mockCalendar = _helper.getMockCalendar(mockCreatedEvent);
        mockCalendar.id = 1243;
        mockCreatedEvent.calendar = mockCalendar;
        
        var mockOriginalEvent = _helper.getMockEvent();
        mockOriginalEvent.calendar = mockCalendar;
        mockOriginalEvent.uid = "original";

        var result;
        var converter = new Calendar.ProviderConverter();
        converter._organizerInfo = {
            hasOrganizer: false,
        };

        tc.log("No original event");
        result = converter.updateBeforeSave({}, mockCalendar, null);
        tc.areEqual(mockCreatedEvent, result, "Unexpected event updated");

        tc.log("Original event");
        result = converter.updateBeforeSave({}, mockCalendar, mockOriginalEvent);
        tc.areEqual(mockOriginalEvent, result, "Unexpected event updated");
    });

    Tx.test("CalendarProviderConverter.testUpdateBeforeSave-meetingStatus", function testUpdateBeforeSaveMeetingStatus (tc) {
        /// <summary>Verifies that meetingStatus is correctly calculated in various scenarios</summary>

        var MeetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus;

        var noAttendeesCollection = [];
        var hasAttendeesCollection = [1, 2, 3]; // Contents of attendees are not examined in this code path
        var attendees;

        var mockCreatedEvent = _helper.getMockEvent();
        mockCreatedEvent.uid = "created";
        mockCreatedEvent.getAttendees = function () { return createMockPlatformCollection(attendees); };

        var mockCalendar = _helper.getMockCalendar(mockCreatedEvent);
        mockCalendar.id = 1243;
        mockCreatedEvent.calendar = mockCalendar;

        var mockOrganizer = new Windows.ApplicationModel.Appointments.AppointmentOrganizer();
        mockOrganizer.address = "other_user@fabrikam.com";

        var testAppointment;

        function updateBeforeSave(tc, appointment) {
            /// <summary>Helper function to test reminder conversion</summary>

            var converterObj = new Calendar.ProviderConverter();
            var eventResult = converterObj.convertToEvent(appointment, mockCalendar, true);

            tc.isFalse(Jx.isNonEmptyString(eventResult.errorText), "Unexpected error converting event: " + eventResult.errorText);

            return converterObj.updateBeforeSave(eventResult.event, mockCalendar, null);
        }

        var result;

        tc.log("No attendees");
        testAppointment = _helper.getAppointment();
        attendees = noAttendeesCollection;
        result = updateBeforeSave(tc, testAppointment);
        tc.areEqual(MeetingStatus.notAMeeting, mockCreatedEvent.meetingStatus, "meetingStatus did not match");

        tc.log("User is not the organizer");
        attendees = noAttendeesCollection;
        testAppointment.organizer = mockOrganizer;
        result = updateBeforeSave(tc, testAppointment);
        tc.areEqual(MeetingStatus.meetingReceived, mockCreatedEvent.meetingStatus, "meetingStatus did not match");

        tc.log("User is the organizer which is passed in from the appointment object");
        attendees = noAttendeesCollection;
        testAppointment.organizer.address = _helper.defaultOrganizer;
        result = updateBeforeSave(tc, testAppointment);
        tc.areEqual(MeetingStatus.notAMeeting, mockCreatedEvent.meetingStatus, "meetingStatus did not match");

        tc.log("User is the organizer with attendees");
        attendees = hasAttendeesCollection;
        testAppointment.organizer = null;
        result = updateBeforeSave(tc, testAppointment);
        tc.areEqual(MeetingStatus.isAMeeting, mockCreatedEvent.meetingStatus, "meetingStatus did not match");
    });

})();