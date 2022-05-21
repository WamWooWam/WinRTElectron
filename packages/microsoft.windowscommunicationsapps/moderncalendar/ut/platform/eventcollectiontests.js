
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    Tx.test("EventCollectionTests.testSimple", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();
            var dtFirst = new Date(year, month, 1);
            var sunday = 1 + 7 + (7 - dtFirst.getDay()); // second or third sunday

            TestCore.log("Creating Event on " + (month + 1) + "/" + (sunday + 2) + "/" + year);
            var event1 = calendar.createEvent();
            event1.startDate = new Date(year, month, sunday + 2, 12);
            event1.endDate = new Date(year, month, sunday + 2, 13);
            event1.subject = "event1";
            event1.commit();

            TestCore.log("Creating Event on " + (month + 1) + "/" + (sunday + 5) + "/" + year);
            var event2 = calendar.createEvent();
            event2.startDate = new Date(year, month, sunday + 5, 12);
            event2.endDate = new Date(year, month, sunday + 5, 13);
            event2.subject = "event2";
            event2.commit();

            TestCore.log("Creating Recurring Event, Weekly on Monday and Thursday");
            var event3 = calendar.createEvent();
            event3.startDate = new Date(year, month, sunday - 6, 12);
            event3.endDate = new Date(year, month, sunday - 6, 13);
            event3.subject = "event3";
            event3.recurring = true;
            var recur3 = event3.recurrence;
            recur3.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recur3.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.monday | Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.thursday;
            recur3.until = new Date(year, month, sunday + 7)
            event3.commit();

            TestCore.log("Creating Recurring Event, Weekly, on Wednesday");
            var event4 = calendar.createEvent();
            event4.startDate = new Date(year, month, sunday - 4, 12);
            event4.endDate = new Date(year, month, sunday - 4, 13);
            event4.subject = "event4";
            event4.recurring = true;
            var recur4 = event4.recurrence;
            recur4.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recur4.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.wednesday;
            recur4.until = new Date(year, month, sunday + 7);
            event4.commit();

            TestCore.log("Retrieving Events");
            var events = TestCore.calendarManager.getEvents(new Date(year, month, sunday), new Date(year, month, sunday + 7));
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 5, true);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["event3", new Date(year, month, sunday + 1, 12), new Date(year, month, sunday + 1, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event1", new Date(year, month, sunday + 2, 12), new Date(year, month, sunday + 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.single],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event3", new Date(year, month, sunday + 4, 12), new Date(year, month, sunday + 4, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.single]
                                         ]);

            TestCore.log("Retrieving series for recurring event");
            var series = events.item(0).getSeries();
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.EventType.series, series.eventType, "Unexpected event type");
            tc.areEqual(events.item(0).id, series.id, "Unexpected id");

            TestCore.log("Deleting instance event");
            event1.deleteObject();
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 4, false);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["event3", new Date(year, month, sunday + 1, 12), new Date(year, month, sunday + 1, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event3", new Date(year, month, sunday + 4, 12), new Date(year, month, sunday + 4, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.single]
                                         ]);

            TestCore.log("Creating new instance event on " + (month + 1) + "/" + (sunday + 2) + "/" + year);
            var event5 = calendar.createEvent();
            event5.startDate = new Date(year, month, sunday + 2, 13);
            event5.endDate = new Date(year, month, sunday + 2, 14);
            event5.subject = "event5";
            event5.commit();
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 5, false);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["event3", new Date(year, month, sunday + 1, 12), new Date(year, month, sunday + 1, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event5", new Date(year, month, sunday + 2, 13), new Date(year, month, sunday + 2, 14), Microsoft.WindowsLive.Platform.Calendar.EventType.single],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event3", new Date(year, month, sunday + 4, 12), new Date(year, month, sunday + 4, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.single]
                                         ]);

            TestCore.log("Deleting recurring event");
            event3.deleteObject();
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 3, false);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["event5", new Date(year, month, sunday + 2, 13), new Date(year, month, sunday + 2, 14), Microsoft.WindowsLive.Platform.Calendar.EventType.single],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.single]
                                         ]);

            TestCore.log("Creating Recurring Event, Weekly on WeekDays and Saturday");
            var event6 = calendar.createEvent();
            event6.startDate = new Date(year, month, sunday - 6, 8);
            event6.endDate = new Date(year, month, sunday - 6, 9);
            event6.subject = "event6";
            event6.recurring = true;
            var recur6 = event6.recurrence;
            recur6.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recur6.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays | Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.saturday;
            recur6.until = new Date(year, month, sunday + 7);
            event6.commit();
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 9, false);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["event6", new Date(year, month, sunday + 1, 8),  new Date(year, month, sunday + 1, 9)],
                                            ["event6", new Date(year, month, sunday + 2, 8),  new Date(year, month, sunday + 2, 9)],
                                            ["event5", new Date(year, month, sunday + 2, 13), new Date(year, month, sunday + 2, 14)],
                                            ["event6", new Date(year, month, sunday + 3, 8),  new Date(year, month, sunday + 3, 9)],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13)],
                                            ["event6", new Date(year, month, sunday + 4, 8),  new Date(year, month, sunday + 4, 9)],
                                            ["event6", new Date(year, month, sunday + 5, 8),  new Date(year, month, sunday + 5, 9)],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13)],
                                            ["event6", new Date(year, month, sunday + 6, 8),  new Date(year, month, sunday + 6, 9)]
                                         ]);

            TestCore.log("Turning Recurring Event into Single Instance Event");
            event6.recurring = false;
            event6.commit();
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 3, false);

            event6.startDate = new Date(year, month, sunday, 12);
            event6.endDate = new Date(year, month, sunday, 13);
            event6.commit();
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 4, false);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["event6", new Date(year, month, sunday,     12), new Date(year, month, sunday,     13)],
                                            ["event5", new Date(year, month, sunday + 2, 13), new Date(year, month, sunday + 2, 14)],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13)],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13)]
                                         ]);

            events.dispose();
            events = null;
        }
    });

    Tx.test("EventCollectionTests.testProperties", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();
            var dtFirst = new Date(year, month, 1);
            var sunday = 1 + 7 + (7 - dtFirst.getDay()); // second or third sunday

            TestCore.log("Creating Event on " + (month + 1) + "/" + (sunday + 2) + "/" + year);
            var event1 = calendar.createEvent();
            event1.startDate = new Date(year, month, sunday + 2, 12);
            event1.endDate = new Date(year, month, sunday + 2, 13);
            event1.subject = "event1";
            event1.commit();

            TestCore.log("Creating Event on " + (month + 1) + "/" + (sunday + 5) + "/" + year);
            var event2 = calendar.createEvent();
            event2.startDate = new Date(year, month, sunday + 5, 12);
            event2.endDate = new Date(year, month, sunday + 5, 13);
            event2.subject = "event2";
            event2.commit();

            TestCore.log("Creating Recurring Event, Weekly on Monday and Thursday");
            var event3 = calendar.createEvent();
            event3.startDate = new Date(year, month, sunday - 6, 12);
            event3.endDate = new Date(year, month, sunday - 6, 13);
            event3.subject = "event3";
            event3.recurring = true;
            var recur3 = event3.recurrence;
            recur3.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recur3.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.monday | Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.thursday;
            recur3.until = new Date(year, month, sunday + 7);
            event3.commit();

            TestCore.log("Creating Recurring Event, Weekly, on Wednesday");
            var event4 = calendar.createEvent();
            event4.startDate = new Date(year, month, sunday - 4, 12);
            event4.endDate = new Date(year, month, sunday - 4, 13);
            event4.subject = "event4";
            event4.recurring = true;
            var recur4 = event4.recurrence;
            recur4.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recur4.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.wednesday;
            recur4.until = new Date(year, month, sunday + 7);
            event4.commit();

            TestCore.log("Retrieving Events");
            var events = TestCore.calendarManager.getEvents(new Date(year, month, sunday), new Date(year, month, sunday + 7));
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 5, true);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["event3", new Date(year, month, sunday + 1, 12), new Date(year, month, sunday + 1, 13)],
                                            ["event1", new Date(year, month, sunday + 2, 12), new Date(year, month, sunday + 2, 13)],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13)],
                                            ["event3", new Date(year, month, sunday + 4, 12), new Date(year, month, sunday + 4, 13)],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13)]
                                         ]);

            TestCore.log("Moving event1 to " + (month + 1) + "/" + (sunday) + "/" + year + " @ 12");
            event1.startDate = new Date(year, month, sunday, 12);
            event1.endDate = new Date(year, month, sunday, 13);
            event1.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            
            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["event1", new Date(year, month, sunday,     12), new Date(year, month, sunday,     13)],
                                            ["event3", new Date(year, month, sunday + 1, 12), new Date(year, month, sunday + 1, 13)],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13)],
                                            ["event3", new Date(year, month, sunday + 4, 12), new Date(year, month, sunday + 4, 13)],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13)]
                                         ]);

            TestCore.log("Moving event3 from Monday/Wednesday to Monday/Tuesday");
            recur3.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.monday | Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday;
            event3.commit();

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["event1", new Date(year, month, sunday,     12), new Date(year, month, sunday,     13)],
                                            ["event3", new Date(year, month, sunday + 1, 12), new Date(year, month, sunday + 1, 13)],
                                            ["event3", new Date(year, month, sunday + 2, 12), new Date(year, month, sunday + 2, 13)],
                                            ["event4", new Date(year, month, sunday + 3, 12), new Date(year, month, sunday + 3, 13)],
                                            ["event2", new Date(year, month, sunday + 5, 12), new Date(year, month, sunday + 5, 13)]
                                         ]);

            events.dispose();
            events = null;
        }
    });

})();