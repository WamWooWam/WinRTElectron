
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    Tx.test("ExceptionCollectionTests.testExceptionsInCollection", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {

            var receivedEvents = [];
            var collectionChanged = function (ev) {
                var args = ev.detail[0];

                switch (args.eType) {
                    case Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded:
                        receivedEvents.push("IA:" + args.index);
                        break;

                    case Microsoft.WindowsLive.Platform.CollectionChangeType.itemChanged:
                        receivedEvents.push("IC:" + args.index + "," + args.previousIndex);
                        break;

                    case Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved:
                        receivedEvents.push("IR:" + args.index);
                        break;

                    case Microsoft.WindowsLive.Platform.CollectionChangeType.batchBegin:
                        receivedEvents.push("BB");
                        break;

                    case Microsoft.WindowsLive.Platform.CollectionChangeType.batchEnd:
                        receivedEvents.push("BE");
                        break;
                }
            };

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();

            TestCore.log("Creating recurring event");
            var series = calendar.createEvent();
            series.startDate = new Date(year, month, 1, 12);
            series.endDate = new Date(year, month, 1, 13);
            series.subject = "Recurring Event";
            series.recurring = true;
            series.recurrence.until = new Date(year, month, 8);
            series.commit();

            TestCore.log("Retrieving Events");
            var events = TestCore.calendarManager.getEvents(new Date(year, month, 2, 0), new Date(year, month, 7, 0));

            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 5, true);
            
            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 4, 12), new Date(year, month, 4, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 6, 12), new Date(year, month, 6, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries]
                                         ]);

            TestCore.log("Adding Collection Listener");
            events.addEventListener("collectionchanged", collectionChanged);
            receivedEvents = [];
            
            TestCore.log("Deleting Last Occurrence in Range (creates exception)");
            events.item(4).deleteObject();
            
            TestCore.waitForArrayLength(TestCore.defaultWait, receivedEvents, 1);

            TestCore.log("Verifying Received Events");
            tc.arraysEqual(["IR:4"], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 4, 12), new Date(year, month, 4, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries]
                                         ]);
            
            receivedEvents = [];

            TestCore.log("Changing subject of 2nd occurrence (creates exception)");
            var occurrence = events.item(1);
            occurrence.subject = "Subject Exception";
            occurrence.commit();

            TestCore.waitForPropertyValue(TestCore.defaultWait, occurrence, "subject", "Subject Exception");

            TestCore.log("Verifying Received Events");
            tc.arraysEqual([], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 12), new Date(year, month, 4, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries]
                                         ]);

            receivedEvents = [];
            
            TestCore.log("Changing start date of 3rd occurrence (creates exception)");
            occurrence = events.item(2);
            occurrence.startDate = new Date(year, month, 4, 13);
            occurrence.commit();

            TestCore.waitForPropertyValue(TestCore.defaultWait, occurrence, "startDate", new Date(year, month, 4, 13));

            TestCore.log("Verifying Received Events");
            tc.arraysEqual([], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 13), new Date(year, month, 4, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries]
                                         ]);

            receivedEvents = [];
            
            TestCore.log("Changing start date of 3rd occurrence (modifies exception)");
            occurrence = events.item(2);
            occurrence.startDate = new Date(year, month, 4, 14);
            occurrence.endDate = new Date(year, month, 4, 15);
            occurrence.commit();

            TestCore.waitForPropertyValue(TestCore.defaultWait, occurrence, "startDate", new Date(year, month, 4, 14));
            TestCore.waitForPropertyValue(TestCore.defaultWait, occurrence, "endDate", new Date(year, month, 4, 15));

            TestCore.log("Verifying Received Events");
            tc.arraysEqual([], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 14), new Date(year, month, 4, 15), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries]
                                         ]);

            receivedEvents = [];

            TestCore.log("Creating filtered exception");
            var filtered = series.getOccurrence(new Date(year, month, 7, 12));
            filtered.subject = "Filtered Exception";
            filtered.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            
            TestCore.log("Verifying Received Events");
            tc.arraysEqual([], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 14), new Date(year, month, 4, 15), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries]
                                         ]);

            receivedEvents = [];
            
            TestCore.log("Bringing filtered exception into range");
            filtered.startDate = new Date(year, month, 6, 12);
            filtered.endDate = new Date(year, month, 6, 13);
            filtered.commit();
            
            TestCore.waitForArrayLength(TestCore.defaultWait, receivedEvents, 1);

            TestCore.log("Verifying Received Events");
            tc.arraysEqual(["IA:4"], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 14), new Date(year, month, 4, 15), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Filtered Exception", new Date(year, month, 6, 12), new Date(year, month, 6, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries]
                                         ]);

            receivedEvents = [];
            
            TestCore.log("Creating 2nd recurring event");
            var series2 = calendar.createEvent();
            series2.startDate = new Date(year, month, 1, 10);
            series2.endDate = new Date(year, month, 1, 11);
            series2.subject = "Recurring Event 2";
            series2.recurring = true;
            series2.recurrence.interval = 2;
            series2.recurrence.until = new Date(year, month, 8);
            series2.commit();
            
            TestCore.waitForArrayLength(TestCore.defaultWait, receivedEvents, 2);

            TestCore.log("Verifying Received Events");
            tc.arraysEqual(["IA:1", "IA:4"], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event 2", new Date(year, month, 3, 10), new Date(year, month, 3, 11), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 14), new Date(year, month, 4, 15), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event 2", new Date(year, month, 5, 10), new Date(year, month, 5, 11), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Filtered Exception", new Date(year, month, 6, 12), new Date(year, month, 6, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries]
                                         ]);

            receivedEvents = [];

            TestCore.log("Creating exception in 2nd recurring event");
            occurrence = events.item(1);
            occurrence.subject = "Subject Exception 2";
            occurrence.commit();

            TestCore.waitForPropertyValue(TestCore.defaultWait, occurrence, "subject", "Subject Exception 2");

            TestCore.log("Verifying Received Events");
            tc.arraysEqual([], receivedEvents, "Received Events Unexpected");

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception 2", new Date(year, month, 3, 10), new Date(year, month, 3, 11), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 14), new Date(year, month, 4, 15), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event 2", new Date(year, month, 5, 10), new Date(year, month, 5, 11), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Filtered Exception", new Date(year, month, 6, 12), new Date(year, month, 6, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries]
                                         ]);

            events.removeEventListener("collectionchanged", collectionChanged);
            events.dispose();

            TestCore.log("Retrieving Events Again");
            events = TestCore.calendarManager.getEvents(new Date(year, month, 2, 0), new Date(year, month, 7, 0));

            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 7, true);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate", "eventType"],
                                         [
                                            ["Recurring Event", new Date(year, month, 2, 12), new Date(year, month, 2, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Subject Exception 2", new Date(year, month, 3, 10), new Date(year, month, 3, 11), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Subject Exception", new Date(year, month, 3, 12), new Date(year, month, 3, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event", new Date(year, month, 4, 14), new Date(year, month, 4, 15), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries],
                                            ["Recurring Event 2", new Date(year, month, 5, 10), new Date(year, month, 5, 11), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Recurring Event", new Date(year, month, 5, 12), new Date(year, month, 5, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries],
                                            ["Filtered Exception", new Date(year, month, 6, 12), new Date(year, month, 6, 13), Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries]
                                         ]);

            events.dispose();
        }
    });

    Tx.test("ExceptionCollectionTests.testExceptionExpired", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();

            TestCore.log("Retrieving Events");
            var events = TestCore.calendarManager.getEvents(new Date(year, month, 1, 0), new Date(year, month + 1, 1, 0));

            TestCore.log("Creating recurring event");
            var series = calendar.createEvent();
            series.startDate = new Date("1/1/2000 12:00PM");
            series.endDate = new Date("1/1/2000 1:00PM");
            series.subject = "Recurring Event";
            series.recurring = true;
            series.recurrence.until = new Date("2/1/2000");
            series.commit();

            TestCore.log("Creating exception");
            var exception = series.getOccurrence(new Date("1/31/2000 12:00PM"));
            exception.subject = "Event Exception";
            exception.commit();

            TestCore.log("Creating Single Instance");
            var single = calendar.createEvent();
            single.startDate = new Date(year, month, 1, 13);
            single.endDate = new Date(year, month, 1, 14);
            single.subject = "Single Event";
            single.commit();
            
            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Single Event", new Date(year, month, 1, 13), new Date(year, month, 1, 14)]
                                         ]);

            TestCore.log("Moving Exception");
            exception.startDate = new Date(year, month, 15, 12);
            exception.endDate = new Date(year, month, 15, 13);
            exception.commit();
            
            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Single Event", new Date(year, month, 1, 13), new Date(year, month, 1, 14)],
                                            ["Event Exception", new Date(year, month, 15, 12), new Date(year, month, 15, 13)]
                                         ]);

            events.dispose();

            
        }
    });

    Tx.test("ExceptionCollectionTests.testExceptionErrors", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var sameDay = Microsoft.WindowsLive.Platform.Calendar.Status.errorExceptionsStartOnSameDay;
            var overlap = Microsoft.WindowsLive.Platform.Calendar.Status.errorExceptionsOverlap;
                
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating recurring event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            series.recurring = true;
            series.commit();

            TestCore.log("Getting occurrence on the 3rd");
            var occurrence = series.getOccurrence(new Date(2011, 5, 3, 12));

            TestCore.log("Changing to same day as previous");
            occurrence.startDate = new Date(2011, 5, 2, 18);
            occurrence.endDate = new Date(2011, 5, 2, 19);
            tc.areEqual(sameDay, occurrence.validate(), "Expected errorExceptionsStartOnSameDay");

            TestCore.log("Changing to middle of previous");
            occurrence.startDate = new Date(2011, 5, 2, 12, 30);
            occurrence.endDate = new Date(2011, 5, 2, 13, 30);
            tc.areEqual(overlap, occurrence.validate(), "Expected errorExceptionsOverlap");

            TestCore.log("Changing to before previous");
            occurrence.startDate = new Date(2011, 5, 2, 8);
            occurrence.endDate = new Date(2011, 5, 2, 9);
            tc.areEqual(overlap, occurrence.validate(), "Expected errorExceptionsOverlap");

            TestCore.log("Changing to same day as next");
            occurrence.startDate = new Date(2011, 5, 4, 8);
            occurrence.endDate = new Date(2011, 5, 4, 9);
            tc.areEqual(sameDay, occurrence.validate(), "Expected errorExceptionsStartOnSameDay");

            TestCore.log("Changing to overlap next");
            occurrence.startDate = new Date(2011, 5, 4, 11, 30);
            occurrence.endDate = new Date(2011, 5, 4, 12, 30);
            tc.areEqual(overlap, occurrence.validate(), "Expected errorExceptionsOverlap");

            TestCore.log("Changing to after next");
            occurrence.startDate = new Date(2011, 5, 4, 18);
            occurrence.endDate = new Date(2011, 5, 4, 19);
            tc.areEqual(overlap, occurrence.validate(), "Expected errorExceptionsOverlap");

        }
    });

})();


