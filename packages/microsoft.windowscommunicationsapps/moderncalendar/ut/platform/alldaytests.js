
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/


(function () {

    Tx.test("AllDayTests.testSingleInstance", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {

            var dtNow           = new Date();
            var dtMidnight      = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate());
            var dtNextMidnight  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1);
            var dtLastEleven    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), -1);
            var dtOne           = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 1);
            var dtEleven        = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 23);
            var dtNextOne       = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 1);

            var dtUTCMinus4Midnight = new Date(0);
            dtUTCMinus4Midnight.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4Midnight.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4Midnight.setUTCDate(dtNow.getDate());
            dtUTCMinus4Midnight.setUTCHours(4);

            var dtUTCMinus4NextMidnight = new Date(0);
            dtUTCMinus4NextMidnight.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4NextMidnight.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4NextMidnight.setUTCDate(dtNow.getDate() + 1);
            dtUTCMinus4NextMidnight.setUTCHours(4);

            var dtUTCPlus4Midnight = new Date(0);
            dtUTCPlus4Midnight.setUTCFullYear(dtNow.getFullYear());
            dtUTCPlus4Midnight.setUTCMonth(dtNow.getMonth());
            dtUTCPlus4Midnight.setUTCDate(dtNow.getDate() - 1);
            dtUTCPlus4Midnight.setUTCHours(20);

            var dtUTCPlus4NextMidnight = new Date(0);
            dtUTCPlus4NextMidnight.setUTCFullYear(dtNow.getFullYear());
            dtUTCPlus4NextMidnight.setUTCMonth(dtNow.getMonth());
            dtUTCPlus4NextMidnight.setUTCDate(dtNow.getDate());
            dtUTCPlus4NextMidnight.setUTCHours(20);

            var utcplus4 = {
                standardDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,   
                    wMilliseconds: 0
                },
                daylightDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,
                    wMilliseconds: 0
                },
                standardName: "UTC+4",
                daylightName: "UTC+4",
                bias: -240,
                standardBias: 0,
                daylightBias: 0
            };

            var utcminus4 = {
                standardDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,   
                    wMilliseconds: 0
                },
                daylightDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,
                    wMilliseconds: 0
                },
                standardName: "UTC-4",
                daylightName: "UTC-4",
                bias: 240,
                standardBias: 0,
                daylightBias: 0
            };

            TestCore.log("Creating Event");
            var event = TestCore.calendarManager.defaultCalendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Populating Event Properties");
            event.subject = "All Day Event";
            event.startDate = dtMidnight;
            event.endDate = dtNextMidnight;
            event.allDayEvent = true;
            event.commit();

            TestCore.log("Verifying Event");
            TestCore.verifyObject(event, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Getting Occurrence");
            var occurrence = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Populating Early Properties");
            event.startDate = dtLastEleven;
            event.endDate = dtEleven;

            TestCore.log("Verifying Event");            
            TestCore.verifyObject(event, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Getting Occurrence");
            occurrence = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Populating Late Properties");
            event.startDate = dtOne;
            event.endDate = dtNextOne;

            TestCore.log("Verifying Event");            
            TestCore.verifyObject(event, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Getting Occurrence");
            occurrence = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Populating Properties for UTC + 4");
            event.setTimezone(utcplus4);
            event.startDate = dtUTCPlus4Midnight;
            event.endDate = dtUTCPlus4NextMidnight;

            TestCore.log("Verifying Event");            
            TestCore.verifyObject(event, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Getting Occurrence");
            occurrence = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Removing Timezone");
            event.clearTimezone();

            TestCore.log("Verifying Event");            
            TestCore.verifyObject(event, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Getting Occurrence");
            occurrence = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Populating Properties for UTC - 4");
            event.setTimezone(utcminus4);
            event.startDate = dtUTCMinus4Midnight;
            event.endDate = dtUTCMinus4NextMidnight;

            TestCore.log("Verifying Event");            
            TestCore.verifyObject(event, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Getting Occurrence");
            occurrence = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Removing Timezone");
            event.clearTimezone();

            TestCore.log("Verifying Event");            
            TestCore.verifyObject(event, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);

            TestCore.log("Getting Occurrence");
            occurrence = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence, ["startDate", "endDate"], [dtMidnight, dtNextMidnight]);
            
        }
    });

    Tx.test("AllDayTests.testRecurring", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {

            var dtNow           = new Date();
            var dtMidnight      = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate());
            var dtMidnightPlus1 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1);
            var dtMidnightPlus2 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2);
            var dtMidnightPlus3 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 3);

            var utcminus4 = {
                standardDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,   
                    wMilliseconds: 0
                },
                daylightDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,
                    wMilliseconds: 0
                },
                standardName: "UTC-4",
                daylightName: "UTC-4",
                bias: 240,
                standardBias: 0,
                daylightBias: 0
            };

            var dtUTCMinus4Midnight = new Date(0);
            dtUTCMinus4Midnight.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4Midnight.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4Midnight.setUTCDate(dtNow.getDate());
            dtUTCMinus4Midnight.setUTCHours(4);

            var dtUTCMinus4MidnightPlus1 = new Date(0);
            dtUTCMinus4MidnightPlus1.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus1.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus1.setUTCDate(dtNow.getDate() + 1);
            dtUTCMinus4MidnightPlus1.setUTCHours(4);

            var dtUTCMinus4MidnightPlus2 = new Date(0);
            dtUTCMinus4MidnightPlus2.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus2.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus2.setUTCDate(dtNow.getDate() + 2);
            dtUTCMinus4MidnightPlus2.setUTCHours(4);

            var dtUTCMinus4MidnightPlus3 = new Date(0);
            dtUTCMinus4MidnightPlus3.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus3.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus3.setUTCDate(dtNow.getDate() + 3);
            dtUTCMinus4MidnightPlus3.setUTCHours(4);

            var caughtException = false;
            
            TestCore.log("Creating Event");
            var event = TestCore.calendarManager.defaultCalendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Populating Properties");
            event.subject = "All Day Recurring";
            event.startDate = dtMidnight;
            event.endDate = dtMidnightPlus1;
            event.allDayEvent = true;
            event.recurring = true;
            event.commit();

            TestCore.log("Getting Recurrence");
            var recur = event.recurrence;

            TestCore.log("Verifying Dates");
            TestCore.verifyDates(recur.getOccurrences(dtMidnight, dtMidnightPlus3),
                                 [ dtMidnight,
                                   dtMidnightPlus1,
                                   dtMidnightPlus2 ]);

            TestCore.log("Getting occurence on " + dtMidnight);
            var occurrence0 = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence0, ["startDate", "endDate"], [dtMidnight, dtMidnightPlus1]);

            TestCore.log("Getting occurence on " + dtMidnightPlus1);
            var occurrence1 = event.getOccurrence(dtMidnightPlus1);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence1, ["startDate", "endDate"], [dtMidnightPlus1, dtMidnightPlus2]);

            TestCore.log("Getting occurence on " + dtMidnightPlus2);
            var occurrence2 = event.getOccurrence(dtMidnightPlus2);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence2, ["startDate", "endDate"], [dtMidnightPlus2, dtMidnightPlus3]);

            TestCore.log("Deleting Occurrence on " + dtMidnightPlus1);
            occurrence1.deleteObject();
            
            try
            {
                TestCore.log("Retrieving invalid occurrence on " + dtMidnightPlus1);
                caughtException = false;
                occurrence1 = event.getOccurrence(dtMidnightPlus1);
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Changing subject of occurrence on " + dtMidnightPlus2);
            occurrence2.subject = "All Day Recurring Exception";
            occurrence2.commit();

            TestCore.log("Getting occurrence on " + dtMidnightPlus2);
            occurrence2 = event.getOccurrence(dtMidnightPlus2);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence2, ["startDate", "endDate", "subject"], [dtMidnightPlus2, dtMidnightPlus3, "All Day Recurring Exception"]);

            TestCore.log("Moving occurrence on " + dtMidnightPlus2);
            TestCore.log("Moving it to " + dtMidnightPlus1);
            occurrence2.startDate = dtMidnightPlus1;
            occurrence2.commit();

            try
            {
                TestCore.log("Retrieving invalid occurrence on " + dtMidnightPlus2);
                caughtException = false;
                occurrence1 = event.getOccurrence(dtMidnightPlus2);
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Getting occurrence on " + dtMidnightPlus1);
            occurrence1 = event.getOccurrence(dtMidnightPlus1);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence1, ["startDate", "endDate", "subject"], [dtMidnightPlus1, dtMidnightPlus3, "All Day Recurring Exception"]);

            TestCore.log("Creating Event in UTC-4");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Populating Properties");
            event.setTimezone(utcminus4);
            event.subject = "All Day Recurring UTC-4";
            event.startDate = dtUTCMinus4Midnight;
            event.endDate = dtUTCMinus4MidnightPlus1;
            event.allDayEvent = true;
            event.recurring = true;
            event.commit();

            TestCore.log("Verifying Dates");
            TestCore.verifyDates(recur.getOccurrences(dtMidnight, dtMidnightPlus3),
                                 [ dtMidnight,
                                   dtMidnightPlus1,
                                   dtMidnightPlus2 ]);

            TestCore.log("Getting occurence on " + dtMidnight);
            occurrence0 = event.getOccurrence(dtMidnight);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence0, ["startDate", "endDate"], [dtMidnight, dtMidnightPlus1]);

            TestCore.log("Getting occurence on " + dtMidnightPlus1);
            occurrence1 = event.getOccurrence(dtMidnightPlus1);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence1, ["startDate", "endDate"], [dtMidnightPlus1, dtMidnightPlus2]);

            TestCore.log("Getting occurence on " + dtMidnightPlus2);
            occurrence2 = event.getOccurrence(dtMidnightPlus2);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence2, ["startDate", "endDate"], [dtMidnightPlus2, dtMidnightPlus3]);

            TestCore.log("Deleting Occurrence on " + dtMidnightPlus1);
            occurrence1.deleteObject();
            
            try
            {
                TestCore.log("Retrieving invalid occurrence on " + dtMidnightPlus1);
                caughtException = false;
                occurrence1 = event.getOccurrence(dtMidnightPlus1);
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Changing subject of occurrence on " + dtMidnightPlus2);
            occurrence2.setTimezone(utcminus4);
            occurrence2.subject = "All Day Recurring Exception";
            occurrence2.commit();

            TestCore.log("Getting occurrence on " + dtMidnightPlus2);
            occurrence2 = event.getOccurrence(dtMidnightPlus2);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence2, ["startDate", "endDate", "subject"], [dtMidnightPlus2, dtMidnightPlus3, "All Day Recurring Exception"]);

            TestCore.log("Moving occurrence on " + dtMidnightPlus2);
            TestCore.log("Moving it to (using UTC-4 time) " + dtMidnightPlus1);
            occurrence2.setTimezone(utcminus4);
            occurrence2.startDate = dtUTCMinus4MidnightPlus1;
            occurrence2.commit();

            event.commit();

            try
            {
                TestCore.log("Retrieving invalid occurrence on " + dtMidnightPlus2);
                caughtException = false;
                occurrence1 = event.getOccurrence(dtMidnightPlus2);
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Getting occurrence on " + dtMidnightPlus1);
            occurrence1 = event.getOccurrence(dtMidnightPlus1);

            TestCore.log("Verifying Occurrence");
            TestCore.verifyObject(occurrence1, ["startDate", "endDate", "subject"], [dtMidnightPlus1, dtMidnightPlus3, "All Day Recurring Exception"]);
        }
    });

    Tx.test("AllDayTests.testInCollection", function (tc) {

        TestCore.setupTest(tc, true);
        
        if (TestCore.verifyHostedInWwa()) {

            var dtNow           = new Date();
            var dtMidnight      = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate());
            var dtMidnightPlus1 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1);
            var dtMidnightPlus2 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2);
            var dtMidnightPlus3 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 3);
            var dtMidnightPlus4 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 4);
            var dtMidnightPlus5 = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 5);

            var utcminus4 = {
                standardDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,   
                    wMilliseconds: 0
                },
                daylightDate: {
                    wYear: 0,
                    wMonth: 0,
                    wDayOfWeek: 0,
                    wDay: 0,
                    wHour: 0,
                    wMinute: 0,
                    wSecond: 0,
                    wMilliseconds: 0
                },
                standardName: "UTC-4",
                daylightName: "UTC-4",
                bias: 240,
                standardBias: 0,
                daylightBias: 0
            };

            var dtUTCMinus4Midnight = new Date(0);
            dtUTCMinus4Midnight.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4Midnight.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4Midnight.setUTCDate(dtNow.getDate());
            dtUTCMinus4Midnight.setUTCHours(4);

            var dtUTCMinus4MidnightPlus1 = new Date(0);
            dtUTCMinus4MidnightPlus1.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus1.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus1.setUTCDate(dtNow.getDate() + 1);
            dtUTCMinus4MidnightPlus1.setUTCHours(4);

            var dtUTCMinus4MidnightPlus2 = new Date(0);
            dtUTCMinus4MidnightPlus2.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus2.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus2.setUTCDate(dtNow.getDate() + 2);
            dtUTCMinus4MidnightPlus2.setUTCHours(4);

            var dtUTCMinus4MidnightPlus3 = new Date(0);
            dtUTCMinus4MidnightPlus3.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus3.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus3.setUTCDate(dtNow.getDate() + 3);
            dtUTCMinus4MidnightPlus3.setUTCHours(4);

            var dtUTCMinus4MidnightPlus4 = new Date(0);
            dtUTCMinus4MidnightPlus4.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus4.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus4.setUTCDate(dtNow.getDate() + 4);
            dtUTCMinus4MidnightPlus4.setUTCHours(4);

            var dtUTCMinus4MidnightPlus5 = new Date(0);
            dtUTCMinus4MidnightPlus5.setUTCFullYear(dtNow.getFullYear());
            dtUTCMinus4MidnightPlus5.setUTCMonth(dtNow.getMonth());
            dtUTCMinus4MidnightPlus5.setUTCDate(dtNow.getDate() + 5);
            dtUTCMinus4MidnightPlus5.setUTCHours(4);

            TestCore.log("Retrieving Events");
            var events = TestCore.calendarManager.getEvents(dtMidnight, dtMidnightPlus5);

            TestCore.log("Adding Single Instance in this Time Zone");
            var event1 = TestCore.calendarManager.defaultCalendar.createEvent();
            event1.subject = "Event 1";
            event1.startDate = dtMidnightPlus1;
            event1.endDate = dtMidnightPlus2;
            event1.allDayEvent = true;
            event1.commit();

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 1", dtMidnightPlus1, dtMidnightPlus2]
                                         ]);

            TestCore.log("Adding Single Instance in UTC-4");
            var event2 = TestCore.calendarManager.defaultCalendar.createEvent();
            event2.subject = "Event 2";
            event2.setTimezone(utcminus4);
            event2.startDate = dtUTCMinus4MidnightPlus3;
            event2.endDate = dtUTCMinus4MidnightPlus4;
            event2.allDayEvent = true;
            event2.commit();

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 1", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event 2", dtMidnightPlus3, dtMidnightPlus4]
                                         ]);

            TestCore.log("Adding Recurring in this Time Zone");
            var event3 = TestCore.calendarManager.defaultCalendar.createEvent();
            event3.subject = "Event 3";
            event3.startDate = dtMidnight;
            event3.endDate = dtMidnightPlus1;
            event3.allDayEvent = true;
            event3.recurring = true;
            event3.recurrence.interval = 2;
            event3.recurrence.until = dtMidnightPlus5;
            event3.commit();

            TestCore.verifyNotifications(events, 3, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", dtMidnight,      dtMidnightPlus1],
                                            ["Event 1", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event 3", dtMidnightPlus2, dtMidnightPlus3],
                                            ["Event 2", dtMidnightPlus3, dtMidnightPlus4],
                                            ["Event 3", dtMidnightPlus4, dtMidnightPlus5]
                                         ]);

            TestCore.log("Adding Recurring in UTC-4");
            var event4 = TestCore.calendarManager.defaultCalendar.createEvent();
            event4.subject = "Event 4";
            event4.setTimezone(utcminus4);
            event4.startDate = dtUTCMinus4MidnightPlus1;
            event4.endDate = dtUTCMinus4MidnightPlus2;
            event4.allDayEvent = true;
            event4.recurring = true;
            event4.recurrence.interval = 2;
            event4.recurrence.until = dtMidnightPlus5;
            event4.commit();

            TestCore.verifyNotifications(events, 2, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", dtMidnight,      dtMidnightPlus1],
                                            ["Event 1", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event 4", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event 3", dtMidnightPlus2, dtMidnightPlus3],
                                            ["Event 2", dtMidnightPlus3, dtMidnightPlus4],
                                            ["Event 4", dtMidnightPlus3, dtMidnightPlus4],
                                            ["Event 3", dtMidnightPlus4, dtMidnightPlus5]
                                         ]);

            TestCore.log("Deleting Event Occurrences (Single, Recurring, and Recurring in UTC)");
            events.item(6).deleteObject();
            events.item(5).deleteObject();
            events.item(4).deleteObject();

            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 3);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", dtMidnight,      dtMidnightPlus1],
                                            ["Event 1", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event 4", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event 3", dtMidnightPlus2, dtMidnightPlus3]
                                         ]);

            TestCore.log("Updating Subjects for Occurrences");
            var event = events.item(1);
            event.subject = "Event-1";
            event.commit();

            event = events.item(2);
            event.subject = "Event-4";
            event.commit();
            
            event = events.item(3);
            event.subject = "Event-3";
            event.commit();

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", dtMidnight,      dtMidnightPlus1],
                                            ["Event-1", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event-4", dtMidnightPlus1, dtMidnightPlus2],
                                            ["Event-3", dtMidnightPlus2, dtMidnightPlus3]
                                         ]);

            TestCore.log("Moving Occurrences");
            event1 = events.item(1);
            event3 = events.item(3);
            event4 = events.item(2);

            event3.startDate = dtMidnightPlus4;
            event3.endDate = dtMidnightPlus5;
            event3.commit();

            event4.setTimezone(utcminus4);
            event4.startDate = dtUTCMinus4MidnightPlus3;
            event4.endDate = dtUTCMinus4MidnightPlus4;
            event4.commit();
            
            event1.startDate = dtMidnightPlus2;
            event1.endDate = dtMidnightPlus3;
            event1.commit();

            events.unlock();
            TestCore.waitForIdle(TestCore.defaultWait);
            events.lock();

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", dtMidnight,      dtMidnightPlus1],
                                            ["Event-1", dtMidnightPlus2, dtMidnightPlus3],
                                            ["Event-4", dtMidnightPlus3, dtMidnightPlus4],
                                            ["Event-3", dtMidnightPlus4, dtMidnightPlus5]
                                         ]);

            events.dispose();
            
        }

    });
    
})();