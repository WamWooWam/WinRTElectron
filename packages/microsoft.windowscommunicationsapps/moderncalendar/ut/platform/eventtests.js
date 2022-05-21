
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    // testSimpleEvent verifies we can create, retrieve and delete an event
    Tx.test("EventTests.testSimpleEvent", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var dtNow    = new Date();
            var dtEleven = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 11);
            var dtNoon   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 12);
            var dtOne    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 13);
            var dtTwo    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 14);

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");
            tc.areEqual(0, event.id, "Event has been committed");

            var uid = event.uid;
            TestCore.log("Event UID: " + uid);

            TestCore.log("Populating Event Properties");
            event.subject = "Lunch";
            event.location = "Commons";
            event.startDate = dtNoon;
            event.endDate = dtOne;
            event.meetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.isAMeeting;
            event.reminder = 15;
            event.organizerName = "Bob";
            event.organizerEmail = "bob@live.com";
            event.dataType = Microsoft.WindowsLive.Platform.Calendar.DataType.mime;
            event.responseRequested = true;
            event.disallowNewTime = true;

            TestCore.log("Committing Event");
            event.commit();

            tc.areNotEqual(0, event.id, "Event has not been committed");
            var id = event.id;
            TestCore.log("Event ID: " + id);

            TestCore.log("Verifying Event");
            TestCore.verifyObject(event, ["id", "subject", "location", "startDate", "endDate", "reminder"], [id, "Lunch", "Commons", dtNoon, dtOne, 15]);
            TestCore.verifyObject(event, ["uid", "organizerName", "organizerEmail", "dataType", "responseRequested", "disallowNewTime"], [uid, "Bob", "bob@live.com", 4, true, true]);
            tc.areEqual(calendar.id, event.calendar.id, "Calendar id should match");

            TestCore.log("Retrieving Event via getSeries");
            var eventseries = event.getSeries();

            TestCore.log("Verifying Event Retrieved via getSeries");
            TestCore.verifyObject(eventseries, ["id", "subject", "location", "startDate", "endDate", "reminder"], [id, "Lunch", "Commons", dtNoon, dtOne, 15]);
            TestCore.verifyObject(eventseries, ["uid", "organizerName", "organizerEmail", "dataType", "responseRequested", "disallowNewTime"], [uid, "Bob", "bob@live.com", 4, true, true]);
            tc.areEqual(calendar.id, eventseries.calendar.id, "Calendar id should match");

            TestCore.log("Retrieving Event via id");
            var eventid = TestCore.calendarManager.getEventFromID(id);
            tc.isNotNull(eventid);

            TestCore.log("Verifying Event Retrieved via id");
            TestCore.verifyObject(eventid, ["id", "subject", "location", "startDate", "endDate", "reminder"], [id, "Lunch", "Commons", dtNoon, dtOne, 15]);
            TestCore.verifyObject(eventid, ["uid", "organizerName", "organizerEmail", "dataType", "responseRequested", "disallowNewTime"], [uid, "Bob", "bob@live.com", 4, true, true]);
            tc.areEqual(calendar.id, eventid.calendar.id, "Calendar id should match");
            
            TestCore.log("Retrieving Event via uid");
            var eventuid = TestCore.calendarManager.getEventFromUID(TestCore.defaultAccount, uid);
            tc.isNotNull(eventid);

            TestCore.log("Verifying Event Retrieved via uid");
            TestCore.verifyObject(eventuid, ["id", "subject", "location", "startDate", "endDate", "reminder", "meetingStatus"], [id, "Lunch", "Commons", dtNoon, dtOne, 15, 1]);
            TestCore.verifyObject(eventuid, ["uid", "organizerName", "organizerEmail", "dataType", "responseRequested", "disallowNewTime"], [uid, "Bob", "bob@live.com", 4, true, true]);
            tc.areEqual(calendar.id, eventuid.calendar.id, "Calendar id should match");

            TestCore.log("Retrieving Event via calendarManager.getEvents");
            var events = TestCore.calendarManager.getEvents(dtEleven, dtTwo);
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 1, true);
            tc.areEqual(1, events.count, "Should only have one event");

            TestCore.log("Verifying Event Retrieved via calendarManager.getEvents");
            TestCore.verifyObject(events.item(0), ["id", "subject", "location", "startDate", "endDate", "reminder", "meetingStatus"], [id, "Lunch", "Commons", dtNoon, dtOne, 15, 1]);
            TestCore.verifyObject(events.item(0), ["uid", "organizerName", "organizerEmail", "dataType", "responseRequested", "disallowNewTime"], [uid, "Bob", "bob@live.com", 4, true, true]);
            tc.areEqual(calendar.id, events.item(0).calendar.id, "Calendar id should match");

            TestCore.log("Verifying failed to retrieve event with early range");
            var events3 = TestCore.calendarManager.getEvents(dtEleven, dtNoon);
            tc.areEqual(0, events3.count, "Shouldn't have any events");

            TestCore.log("Verifying failed to retrieve event with late range");
            var events4 = TestCore.calendarManager.getEvents(dtOne, dtTwo);
            tc.areEqual(0, events4.count, "Shouldn't have any events");

            events.dispose();
            events = null;
            
            events3.dispose();
            events3 = null;
            
            events4.dispose();
            events4 = null;
            
        }
    });

    // testEventOrder verifies events are correctly sorted
    Tx.test("EventTests.testEventOrder", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow           = new Date();
            var dtMidnightAM    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate());
            var dtMidnightPM    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1);
            var dtEleven        = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 11);
            var dtNoon          = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 12);
            var dtOne           = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 13);
            var dtTwo           = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 14);

            TestCore.log("Adding 1-2 Tentative");
            var event = calendar.createEvent();
            event.startDate = dtOne;
            event.endDate = dtTwo;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            event.subject = "1-2 Tentative";
            event.commit();

            var events = TestCore.calendarManager.getEvents(dtEleven, dtTwo);
            var eventssnap = TestCore.calendarManager.getEvents(dtEleven, dtTwo, Microsoft.WindowsLive.Platform.Calendar.EventSortOrder.snapSort);
            var eventsnot = TestCore.calendarManager.getEvents(dtEleven, dtTwo, Microsoft.WindowsLive.Platform.Calendar.EventSortOrder.notificationsSort);
            
            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 1, true);
            TestCore.verifyEventsByOrder(events,
                                         ["subject"],
                                         [["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 1, true);
            TestCore.verifyEventsByOrder(eventssnap,
                                         ["subject"],
                                         [["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 1, true);
            TestCore.verifyEventsByOrder(eventsnot,
                                         ["subject"],
                                         [["1-2 Tentative"]]);

            TestCore.log("Adding 12-1 Tentative");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtOne;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            event.subject = "12-1 Tentative";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 2, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 2, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 2, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["12-1 Tentative"], ["1-2 Tentative"]]);

            TestCore.log("Adding 12-2 Tentative");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtTwo;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            event.subject = "12-2 Tentative";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 3, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 3, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 3, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["12-1 Tentative"], ["12-2 Tentative"], ["1-2 Tentative"]]);

            TestCore.log("Adding 12-1 Busy");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtOne;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            event.subject = "12-1 Busy";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 4, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 4, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 4, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["12-1 Busy"], ["12-1 Tentative"], ["12-2 Tentative"], ["1-2 Tentative"]]);

            TestCore.log("Adding 12-2 Busy");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtTwo;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            event.subject = "12-2 Busy";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 5, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 5, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 5, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["12-1 Busy"], ["12-2 Busy"], ["12-1 Tentative"], ["12-2 Tentative"], ["1-2 Tentative"]]);

            TestCore.log("Adding 12-2 OOF");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtTwo;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.outOfOffice;
            event.subject = "12-2 OOF";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 6, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 6, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 6, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["12-1 Busy"], ["12-2 Busy"], ["12-1 Tentative"], ["12-2 Tentative"], ["12-2 OOF"], ["1-2 Tentative"]]);

            TestCore.log("Adding 12-2 Working Elsewhere");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtTwo;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.workingElsewhere;
            event.subject = "12-2 WE";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 7, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["12-2 WE"], ["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 7, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["12-2 WE"], ["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 7, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["12-1 Busy"], ["12-2 Busy"], ["12-2 WE"], ["12-1 Tentative"], ["12-2 Tentative"], ["12-2 OOF"], ["1-2 Tentative"]]);

            TestCore.log("Adding 12-2 Free");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtTwo;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
            event.subject = "12-2 Free";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 8, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["12-2 WE"], ["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["12-2 Free"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 8, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["12-2 WE"], ["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["12-2 Free"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 8, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["12-1 Busy"], ["12-2 Busy"], ["12-2 WE"], ["12-1 Tentative"], ["12-2 Tentative"], ["12-2 OOF"], ["12-2 Free"], ["1-2 Tentative"]]);

            TestCore.log("Adding All Day");
            event = calendar.createEvent();
            event.startDate = dtMidnightAM;
            event.endDate = dtMidnightPM;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
            event.subject="Allday Free";
            event.allDayEvent = true;
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 9, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject"],
                                         [["Allday Free"], ["12-2 WE"], ["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["12-2 Free"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 9, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["Allday Free"], ["12-2 WE"], ["12-2 OOF"], ["12-2 Busy"], ["12-1 Busy"], ["12-2 Tentative"], ["12-1 Tentative"], ["12-2 Free"], ["1-2 Tentative"]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 9, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["Allday Free"], ["12-1 Busy"], ["12-2 Busy"], ["12-2 WE"], ["12-1 Tentative"], ["12-2 Tentative"], ["12-2 OOF"], ["12-2 Free"], ["1-2 Tentative"]]);

            TestCore.log("Adding Midnight-Midnight (not all day)");
            event = calendar.createEvent();
            event.startDate = dtMidnightAM;
            event.endDate = dtMidnightPM;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
            event.subject="Midnight-Midnight Free";
            event.allDayEvent = false;
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 10, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject", "allDayEvent"],
                                         [["Allday Free", true], ["Midnight-Midnight Free", true], ["12-2 WE", false], ["12-2 OOF", false], ["12-2 Busy", false], ["12-1 Busy", false], ["12-2 Tentative", false], ["12-1 Tentative", false], ["12-2 Free", false], ["1-2 Tentative", false]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 10, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["Allday Free", true], ["Midnight-Midnight Free", true], ["12-2 WE", false], ["12-2 OOF", false], ["12-2 Busy", false], ["12-1 Busy", false], ["12-2 Tentative", false], ["12-1 Tentative", false], ["12-2 Free", false], ["1-2 Tentative", false]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 10, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["Allday Free", true], ["Midnight-Midnight Free", true], ["12-1 Busy", false], ["12-2 Busy", false], ["12-2 WE", false], ["12-1 Tentative", false], ["12-2 Tentative", false], ["12-2 OOF", false], ["12-2 Free", false], ["1-2 Tentative", false]]);

            TestCore.log("Adding Midnight-12 Busy)");
            event = calendar.createEvent();
            event.startDate = dtMidnightAM;
            event.endDate = dtNoon;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            event.subject="Midnight-12 Busy";
            event.commit();

            TestCore.log("Verifying event order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 11, false);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject", "allDayEvent"],
                                         [["Midnight-12 Busy", false], ["Allday Free", true], ["Midnight-Midnight Free", true], ["12-2 WE", false], ["12-2 OOF", false], ["12-2 Busy", false], ["12-1 Busy", false], ["12-2 Tentative", false], ["12-1 Tentative", false], ["12-2 Free", false], ["1-2 Tentative", false]]);
            TestCore.log("Verifying event snap order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventssnap, 11, false);
            TestCore.verifyEventsByOrder(eventssnap, 
                                         ["subject"],
                                         [["Allday Free", true], ["Midnight-Midnight Free", true], ["Midnight-12 Busy", false], ["12-2 WE", false], ["12-2 OOF", false], ["12-2 Busy", false], ["12-1 Busy", false], ["12-2 Tentative", false], ["12-1 Tentative", false], ["12-2 Free", false], ["1-2 Tentative", false]]);
            TestCore.log("Verifying event notification order");
            TestCore.waitForCollectionCount(TestCore.defaultWait, eventsnot, 11, false);
            TestCore.verifyEventsByOrder(eventsnot, 
                                         ["subject"],
                                         [["Midnight-12 Busy", false], ["Allday Free", true], ["Midnight-Midnight Free", true], ["12-1 Busy", false], ["12-2 Busy", false], ["12-2 WE", false], ["12-1 Tentative", false], ["12-2 Tentative", false], ["12-2 OOF", false], ["12-2 Free", false], ["1-2 Tentative", false]]);
            
            events.dispose();
            eventssnap.dispose();
            eventsnot.dispose();
            events = null;
            eventssnap = null;
            eventsnot = null;
            
        }
    });

    // testZeroDuration verifies proper behavior of zero duration events
    Tx.test("EventTests.testZeroDuration", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow    = new Date();
            var dtEleven = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 11);
            var dtNoon   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 12);
            var dtOne    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 13);
            var dtTwo    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 14);

            TestCore.log("Adding 11");
            var event = calendar.createEvent();
            event.startDate = dtEleven;
            event.endDate = dtEleven;
            event.subject = "11";
            event.commit();

            TestCore.log("Adding 12");
            event = calendar.createEvent();
            event.startDate = dtNoon;
            event.endDate = dtNoon;
            event.subject = "12";
            event.commit();

            TestCore.log("Adding 1");
            event = calendar.createEvent();
            event.startDate = dtOne;
            event.endDate = dtOne;
            event.subject = "1";
            event.commit();

            TestCore.log("Verifying events from 11 - 2");
            var events = TestCore.calendarManager.getEvents(dtEleven, dtTwo);
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 3, true);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject", "startDate", "endDate"],
                                         [["11", dtEleven, dtEleven], ["12", dtNoon, dtNoon], ["1", dtOne, dtOne]]);
            events.dispose();

            TestCore.log("Verifying events from 11 - 1");
            events = TestCore.calendarManager.getEvents(dtEleven, dtOne);
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 2, true);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject", "startDate", "endDate"],
                                         [["11", dtEleven, dtEleven], ["12", dtNoon, dtNoon]]);
            events.dispose();

            TestCore.log("Verifying events from 11 - 12");
            events = TestCore.calendarManager.getEvents(dtEleven, dtNoon);
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 1, true);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject", "startDate", "endDate"],
                                         [["11", dtEleven, dtEleven]]);
            events.dispose();

            TestCore.log("Verifying events from 12 - 1");
            events = TestCore.calendarManager.getEvents(dtNoon, dtOne);
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 1, true);
            TestCore.verifyEventsByOrder(events, 
                                         ["subject", "startDate", "endDate"],
                                         [["12", dtNoon, dtNoon]]);
            events.dispose(); 
            events = null;
            
        }
    });

    // testAttendees verifies that attendees are properly added, updated and removed
    Tx.test("EventTests.testAttendees", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Adding event");
            var event = calendar.createEvent();
            var attendees = event.getAttendees();
            TestCore.log("Adding Attendee Bob");
            var attendeeBob = event.addAttendee("Bob", "bob@barker.com");

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(0, attendees.count, "Bob added before commit");

            TestCore.log("Comitting event (and Bob)");
            event.commit();
            
            TestCore.verifyNotifications(attendees, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Attendee List");
            TestCore.verifyAttendees(   attendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Adding Attendee Alice");
            var attendeeAlice = event.addAttendee("Alice", "alice@wonderland.com");

            TestCore.verifyNotifications(attendees, 0, 0, 0);

            TestCore.log("Committing");
            event.commit();
            
            TestCore.verifyNotifications(attendees, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            
            TestCore.log("Verifying Attendee List");
            TestCore.verifyAttendees(   attendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Alice", 
                                                email: "alice@wonderland.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Adding Attendee Foo");
            event.addAttendee("Foo", "foo@bar.com");
            
            TestCore.verifyNotifications(attendees, 0, 0, 0);
            
            TestCore.log("Committing");
            event.commit();
            
            TestCore.verifyNotifications(attendees, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Attendee List");
            TestCore.verifyAttendees(   attendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Alice", 
                                                email: "alice@wonderland.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Foo", 
                                                email: "foo@bar.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Adding Event Listeners");
            var changeCount = 0;
            var attendeeChanged = function () {
                changeCount++;
            };

            attendeeBob.addEventListener("changed", attendeeChanged);
            attendeeAlice.addEventListener("changed", attendeeChanged);

            TestCore.log("Modifying Attendee Properties");
            attendeeBob.responseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative;
            attendeeAlice.attendeeType = Microsoft.WindowsLive.Platform.Calendar.AttendeeType.optional;

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(0, changeCount, "Properties changed before commit");
            
            event.commit();

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.waitForPropertyValue(TestCore.defaultWait, attendees.item(0), "responseType", Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative);
            TestCore.waitForPropertyValue(TestCore.defaultWait, attendees.item(1), "attendeeType", Microsoft.WindowsLive.Platform.Calendar.AttendeeType.optional);

            TestCore.log("Verifying Attendee List");
            TestCore.verifyAttendees(   attendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Alice", 
                                                email: "alice@wonderland.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.optional 
                                            },

                                            { 
                                                name: "Foo", 
                                                email: "foo@bar.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );


            TestCore.log("Removing Event Listeners");
            attendeeBob.removeEventListener("changed", attendeeChanged);
            attendeeAlice.removeEventListener("changed", attendeeChanged);

            TestCore.log("Deleting Alice");
            attendeeAlice.deleteObject();
            
            TestCore.verifyNotifications(attendees, 0, 0, 0);
            
            TestCore.log("Committing");
            event.commit();
            
            TestCore.verifyNotifications(attendees, TestCore.ignoreValue, TestCore.ignoreValue, 1);

            TestCore.log("Verifying Attendee List");
            TestCore.verifyAttendees(   attendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Foo", 
                                                email: "foo@bar.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Adding Duplicate of Bob");
            event.addAttendee("Bob2", "bob@barker.com");

            TestCore.log("Adding Sam");
            event.addAttendee("Sam", "sam@kinison.org");

            event.commit();
            
            TestCore.verifyNotifications(attendees, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Attendee List");
            TestCore.verifyAttendees(   attendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Foo", 
                                                email: "foo@bar.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            {
                                                name: "Sam",
                                                email: "sam@kinison.org",
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            var responseAccepted = Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted;
            var responseDeclined = Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined;
            var responseTentative = Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative;
            var responseNone = Microsoft.WindowsLive.Platform.Calendar.ResponseType.none;

            TestCore.log("Set the attendee responses back to known values (accept, decline, tentative)");
            attendees.item(0).responseType = responseAccepted;
            attendees.item(1).responseType = responseDeclined;
            attendees.item(2).responseType = responseTentative;
            event.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(attendees.item(0).responseType, responseAccepted, "Series Response 0 should be accepted");
            tc.areEqual(attendees.item(1).responseType, responseDeclined, "Series Response 1 should be declined");
            tc.areEqual(attendees.item(2).responseType, responseTentative, "Series Response 2 should be tentative");

            TestCore.log("Change the time and delete one attendee (should clear remaining attendee responses and not throw)");
            event.startDate = new Date(2011, 5, 1, 13);
            event.endDate = new Date(2011, 5, 1, 14);
            attendees.item(2).deleteObject();
            event.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(attendees.item(0).responseType, responseNone, "Occur Response 0 should be none");
            tc.areEqual(attendees.item(1).responseType, responseNone, "Occur Response 1 should be none");
            
            attendees.dispose();
            attendees = null;
            
        }
    });

    // testOrganizer verifies that the isOrganizer property is properly computed
    // as event/account properties change
    Tx.test("EventTests.testOrganizer", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var MeetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus;
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Adding event");
            var event = calendar.createEvent();
            event.commit();

            tc.isTrue(event.isOrganizer, "We should be the organizer");

            TestCore.log("Setting isAMeeting");
            event.meetingStatus = MeetingStatus.isAMeeting;
            event.commit();
            tc.isTrue(event.isOrganizer, "We should be the organizer");

            TestCore.log("Settting isAMeeting and isReceived"); 
            event.meetingStatus = MeetingStatus.meetingReceived;
            event.commit();
            tc.isFalse(event.isOrganizer, "We should not be the organizer");

            TestCore.log("Setting isAMeeting and isCanceled");
            event.meetingStatus = MeetingStatus.meetingCanceled;
            event.commit();
            tc.isTrue(event.isOrganizer, "We should be the organizer");

            TestCore.log("Settting isAMeeting and isCanceled and isReceived"); 
            event.meetingStatus = MeetingStatus.meetingCanceledAndReceived;
            event.commit();
            tc.isFalse(event.isOrganizer, "We should not be the organizer");

            TestCore.log("Settting isAMeeting and isForwarded"); 
            event.meetingStatus = MeetingStatus.isAMeeting | MeetingStatus.isForwarded;
            event.commit();
            tc.isFalse(event.isOrganizer, "We should not be the organizer");

            TestCore.log("Setting notAMeeting");
            event.meetingStatus = MeetingStatus.notAMeeting;
            event.commit();
            tc.isTrue(event.isOrganizer, "We should be the organizer");

            TestCore.log("Adding Attendees");
            event.addAttendee("bob", "bob@bob.com");
            event.addAttendee("sue", "sue@sue.com");
            event.commit();
            tc.isTrue(event.isOrganizer, "We should be the organizer");

            TestCore.log("Changing Organizer Email");
            event.organizerEmail = "gene@gene.com";
            event.commit();
            tc.isFalse(event.isOrganizer, "We should not be the organizer");

            TestCore.log("Adding new email to list of \"all emails\" for account");
            var oldValue = TestCore.platform.store.getObjectProperty(TestCore.defaultAccount, 
                                                                     Microsoft.WindowsLive.Platform.Test.STOREPROPERTYID.idPropertyEasAllEmailAddresses);
            TestCore.platform.store.setObjectProperty(TestCore.defaultAccount, 
                                                      Microsoft.WindowsLive.Platform.Test.STOREPROPERTYID.idPropertyEasAllEmailAddresses,
                                                      "fred@fred.com;gene@gene.com;sarah@sarah.com");
            TestCore.defaultAccount.commit();
            tc.isTrue(event.isOrganizer, "We should be the organizer");

            TestCore.log("Restoring all emails to \"" + oldValue + "\"");
            TestCore.platform.store.setObjectProperty(TestCore.defaultAccount, 
                                                      Microsoft.WindowsLive.Platform.Test.STOREPROPERTYID.idPropertyEasAllEmailAddresses,
                                                      oldValue);
        }
    });

    Tx.test("EventTests.testModified", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Getting event");
            var event = calendar.createEvent();
            event.commit();

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Getting modified");
            var modified1 = event.modified;
            TestCore.log("Modified Time: " +
                            (modified1.getMonth() + 1) +
                            "/" +
                            modified1.getDate() +
                            "/" +
                            modified1.getFullYear() +
                            " " +
                            (modified1.getHours() < 10 ? "0" : "") + modified1.getHours() +
                            ":" +
                            (modified1.getMinutes() < 10 ? "0" : "") + modified1.getMinutes() +
                            ":" +
                            (modified1.getSeconds() < 10 ? "0" : "") + modified1.getSeconds() +
                            "." +
                            (modified1.getMilliseconds() < 100 ? "0" : "") + (modified1.getMilliseconds() < 10 ? "0" : "") + modified1.getMilliseconds());

            TestCore.log("Adding Event Listener");
            var receivedChanges = false;
            var eventChanged = function() {
                receivedChanges = true;
            };

            event.addEventListener("changed", eventChanged);

            TestCore.platform.runMessagePump(10);

            TestCore.log("Modifying Event");
            event.location = "Commons";
            event.commit();

            TestCore.waitForIdle(TestCore.defaultWait);

            tc.isTrue(receivedChanges, "Never received modification");
            var modified2 = event.modified;
            TestCore.log("Modified Time: " +
                            (modified2.getMonth() + 1) +
                            "/" +
                            modified2.getDate() +
                            "/" +
                            modified2.getFullYear() +
                            " " +
                            (modified2.getHours() < 10 ? "0" : "") + modified2.getHours() +
                            ":" +
                            (modified2.getMinutes() < 10 ? "0" : "") + modified2.getMinutes() +
                            ":" +
                            (modified2.getSeconds() < 10 ? "0" : "") + modified2.getSeconds() +
                            "." +
                            (modified2.getMilliseconds() < 100 ? "0" : "") + (modified2.getMilliseconds() < 10 ? "0" : "") + modified2.getMilliseconds());

            tc.isTrue(modified2.getTime() > modified1.getTime(), "New modified is not greater than old modified");

            TestCore.log("Committing event without changes");
            TestCore.platform.runMessagePump(10);
            event.commit();

            TestCore.waitForIdle(TestCore.defaultWait);

            var modified3 = event.modified;
            TestCore.log("Modified Time: " +
                            (modified3.getMonth() + 1) +
                            "/" +
                            modified3.getDate() +
                            "/" +
                            modified3.getFullYear() +
                            " " +
                            (modified3.getHours() < 10 ? "0" : "") + modified3.getHours() +
                            ":" +
                            (modified3.getMinutes() < 10 ? "0" : "") + modified3.getMinutes() +
                            ":" +
                            (modified3.getSeconds() < 10 ? "0" : "") + modified3.getSeconds() +
                            "." +
                            (modified3.getMilliseconds() < 100 ? "0" : "") + (modified3.getMilliseconds() < 10 ? "0" : "") + modified3.getMilliseconds());

            tc.isTrue(modified3.getTime() === modified2.getTime(), "New modified is not equal to old modified");

            TestCore.log("Marking Dirty and Committing");
            event.markDirty();
            event.commit();            

            TestCore.waitForIdle(TestCore.defaultWait);
            
            var modified4 = event.modified;
            TestCore.log("Modified Time: " +
                            (modified4.getMonth() + 1) +
                            "/" +
                            modified4.getDate() +
                            "/" +
                            modified4.getFullYear() +
                            " " +
                            (modified4.getHours() < 10 ? "0" : "") + modified4.getHours() +
                            ":" +
                            (modified4.getMinutes() < 10 ? "0" : "") + modified4.getMinutes() +
                            ":" +
                            (modified4.getSeconds() < 10 ? "0" : "") + modified4.getSeconds() +
                            "." +
                            (modified4.getMilliseconds() < 100 ? "0" : "") + (modified4.getMilliseconds() < 10 ? "0" : "") + modified4.getMilliseconds());

            tc.isTrue(modified4.getTime() > modified2.getTime(), "New modified is not greater than old modified");
            event.removeEventListener("changed", eventChanged);

        }
    });

    /* Disabling due to PS 548158.  We thought this new version of the test would be unaffacted,
       but that is unfortunately not the case 

    Tx.test("EventTests.testColor", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var colorTable = [
                                { name: "Blue",          value: 0x2671eb, linkValue: 0x246bde },
                                { name: "Purple",        value: 0x5133ab, linkValue: 0x5133ab },
                                { name: "Raspberry",     value: 0x8c0095, linkValue: 0x8c0095 },
                                { name: "Green",         value: 0x008a00, linkValue: 0x008200 },
                                { name: "Orange",        value: 0xd24726, linkValue: 0xc93f1c },
                                { name: "Teal",          value: 0x008299, linkValue: 0x00798f },
                                { name: "Red",           value: 0xac193d, linkValue: 0xac193d },
                                { name: "Pink",          value: 0xdc4fad, linkValue: 0xdc4fad },
                                { name: "Mango",         value: 0xff8f32, linkValue: 0xed6b01 },
                                { name: "Lime",          value: 0x83ba1f, linkValue: 0x5c9e00 },
                                { name: "Turquoise",     value: 0x00aaaa, linkValue: 0x009e9e },
                                { name: "Sky",           value: 0x53bdfa, linkValue: 0x1e9ce6 }
                            ];

            var colorCustom   = { name: "Custom",        value: 0x123456, linkValue: 0x123456 };

            TestCore.log("Verifying color table");
            tc.areEqual(colorTable.length, TestCore.calendarManager.colorTable.count, "Unexpected colorTable length");

            for (var i = 0; i < TestCore.calendarManager.colorTable.count; i++) {
                tc.areEqual(colorTable[i].name, TestCore.calendarManager.colorTable.name(i), "Unexpected color name at index " + i);
                tc.areEqual(colorTable[i].value, TestCore.calendarManager.colorTable.value(i), "Unexpected color value at index " + i);
                tc.areEqual(colorTable[i].linkValue, TestCore.calendarManager.colorTable.linkValue(i), "Unexpected link color value at index " + i);
            }

            TestCore.log("Creating Calendars");

            TestCore.calendarManager.defaultCalendar;
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 01");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 02");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 03");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 04");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 05");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 06");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 07");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 08");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 09");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 10");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 11");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 12");

            TestCore.log("Verifying expected color values");
            var calendars = TestCore.calendarManager.getAllCalendars();

            var expectedValues = [ { calendar: "",            data: colorTable[0] }, 
                                   { calendar: "Calendar 01", data: colorTable[1] },
                                   { calendar: "Calendar 02", data: colorTable[2] },
                                   { calendar: "Calendar 03", data: colorTable[3] },
                                   { calendar: "Calendar 04", data: colorTable[4] },
                                   { calendar: "Calendar 05", data: colorTable[5] },
                                   { calendar: "Calendar 06", data: colorTable[6] },
                                   { calendar: "Calendar 07", data: colorTable[1] },
                                   { calendar: "Calendar 08", data: colorTable[2] },
                                   { calendar: "Calendar 09", data: colorTable[3] },
                                   { calendar: "Calendar 10", data: colorTable[4] },
                                   { calendar: "Calendar 11", data: colorTable[5] },
                                   { calendar: "Calendar 12", data: colorTable[6] } ];

            TestCore.waitForCollectionCount(TestCore.defaultWait, calendars, expectedValues.length, true);
            tc.areEqual(expectedValues.length, calendars.count, "Unexpected number of calendars");

            for (var i = 0; i < expectedValues.length; i++) {
                var calendar = calendars.item(i);
                tc.isNotNull(calendar);
                TestCore.log("    Verifying Calendar \"" + expectedValues[i].calendar + "\", expected \"" + expectedValues[i].data.name + "\"");
                tc.areEqual("" + expectedValues[i].calendar, "" + calendar.name, "Retrieved unexpected calendar");
                TestCore.waitForPropertyValue(TestCore.defaultWait, calendar, "color", expectedValues[i].data.value);
                tc.areEqual(expectedValues[i].data.value, calendar.color, "Unexpected color for calendar");
                tc.areEqual(expectedValues[i].data.linkValue, TestCore.calendarManager.colorTable.computeLinkValue(calendar.color), "Unexpected link color for calendar color");
            }

            calendars.lock();

            TestCore.log("Changing default calendar's color");
            var defaultCalendar = calendars.item(0);
            defaultCalendar.color = colorCustom.value;
            defaultCalendar.commit();

            TestCore.log("Changing Calendar 12's color");
            var calendar12 = calendars.item(12);
            calendar12.color = colorCustom.value;
            calendar12.commit();

            TestCore.log("Adding two additional calendars");
            
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 13");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar 14");

            var expectedValues = [ { calendar: "",            data: colorCustom   }, 
                                   { calendar: "Calendar 01", data: colorTable[1] },
                                   { calendar: "Calendar 02", data: colorTable[2] },
                                   { calendar: "Calendar 03", data: colorTable[3] },
                                   { calendar: "Calendar 04", data: colorTable[4] },
                                   { calendar: "Calendar 05", data: colorTable[5] },
                                   { calendar: "Calendar 06", data: colorTable[6] },
                                   { calendar: "Calendar 07", data: colorTable[1] },
                                   { calendar: "Calendar 08", data: colorTable[2] },
                                   { calendar: "Calendar 09", data: colorTable[3] },
                                   { calendar: "Calendar 10", data: colorTable[4] },
                                   { calendar: "Calendar 11", data: colorTable[5] },
                                   { calendar: "Calendar 12", data: colorCustom   },
                                   { calendar: "Calendar 13", data: colorTable[6] },
                                   { calendar: "Calendar 14", data: colorTable[1] } ];

            TestCore.waitForCollectionCount(TestCore.defaultWait, calendars, expectedValues.length, true);
            tc.areEqual(expectedValues.length, calendars.count, "Unexpected number of calendars");

            for (var i = 0; i < expectedValues.length; i++) {
                var calendar = calendars.item(i);
                tc.isNotNull(calendar);
                TestCore.log("    Verifying Calendar \"" + expectedValues[i].calendar + "\", expected \"" + expectedValues[i].data.name + "\"");
                tc.areEqual("" + expectedValues[i].calendar, "" + calendar.name, "Retrieved unexpected calendar");
                TestCore.waitForPropertyValue(TestCore.defaultWait, calendar, "color", expectedValues[i].data.value);
                tc.areEqual(expectedValues[i].data.value, calendar.color, "Unexpected color for calendar");
                tc.areEqual(expectedValues[i].data.linkValue, TestCore.calendarManager.colorTable.computeLinkValue(calendar.color), "Unexpected link color for calendar color");
            }

            calendars.dispose();
            
        }
    });

    */

    // testiCalendar verifies proper components are created for the iCalendar string
    Tx.test("EventTests.testiCalendar", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtEleven = new Date(2011, 2, 10, 11);
            var dtNoon   = new Date(2011, 2, 10, 12);

            TestCore.log("Adding event");
            var event = calendar.createEvent();

            event.startDate = dtEleven;
            event.endDate = dtNoon;
            event.subject = "Lunch";
            event.location = "Commons";
            event.meetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.isAMeeting;
            event.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            event.reminder = 15;
            event.organizerName = "Bob";
            event.organizerEmail = "bob@live.com";
            event.dataType = Microsoft.WindowsLive.Platform.Calendar.DataType.plainText;
            event.data = "Meet upstairs";
            event.responseRequested = true;

            var attendees = event.getAttendees();
            var attendee1 = event.addAttendee("Alice", "alice@live.com");
            attendee1.responseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType.notResponded;
            attendee1.attendeeType = Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required;
            var attendee2 = event.addAttendee("Eve", "eve@gmail.com");
            attendee2.responseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted;
            attendee2.attendeeType = Microsoft.WindowsLive.Platform.Calendar.AttendeeType.optional;
            event.commit();
            TestCore.waitForCollectionCount(TestCore.defaultWait, attendees, 2, true);

            TestCore.log("Verifying iCalendar");
            var iCalendar = event.getiCalendar();
            tc.isNotNull(iCalendar, "Failed to create iCalendar");
            // remove linebreaks in the middle of a line
            iCalendar = iCalendar.replace(/\r\n /g, "");
            TestCore.log(iCalendar);
            TestCore.verifyComponentProperty(iCalendar, "METHOD", "REQUEST");

            TestCore.log("Verifying Event");
            var eventIndex = iCalendar.indexOf("BEGIN:VEVENT\r\n");
            tc.isTrue(eventIndex > -1, "iCalendar should have event component");
            var vevent = iCalendar.substring(eventIndex, iCalendar.indexOf("END:VEVENT\r\n"));

            TestCore.verifyComponentDate(vevent, "DTSTART", event.startDate);
            TestCore.verifyComponentDate(vevent, "DTEND", event.endDate);
            TestCore.verifyComponentProperty(vevent, "UID", event.uid);
            TestCore.verifyComponentProperty(vevent, "SUMMARY", event.subject);
            TestCore.verifyComponentProperty(vevent, "LOCATION", event.location);
            TestCore.verifyComponentProperty(vevent, "DESCRIPTION", "Meet upstairs");
            TestCore.verifyComponentProperty(vevent, "STATUS", "TENTATIVE");
            TestCore.verifyComponentProperty(vevent, "ORGANIZER", "MAILTO:bob@live.com", ["CN"], ["Bob"]);
            TestCore.verifyComponentProperty(vevent, "ATTENDEE", "MAILTO:alice@live.com",
                                             ["CN", "RSVP", "ROLE", "PARTSTAT"],
                                             ["Alice", "TRUE", "REQ-PARTICIPANT", "NEEDS-ACTION"]);
            TestCore.verifyComponentProperty(vevent, "ATTENDEE", "MAILTO:eve@gmail.com",
                                             ["CN", "RSVP", "ROLE", "PARTSTAT"],
                                             ["Eve", "TRUE", "OPT-PARTICIPANT", "ACCEPTED"]);

            TestCore.log("Verifying Alarm");
            var alarmIndex = vevent.indexOf("BEGIN:VALARM\r\n");
            tc.isTrue(alarmIndex > -1, "iCalendar should have alarm component");
            var valarm = vevent.substring(alarmIndex, vevent.indexOf("END:VALARM\r\n"));
            TestCore.verifyComponentProperty(valarm, "TRIGGER", "-PT15M");

            event.recurring = true;
            event.commit();

            var occurrenceDate = new Date(dtEleven);
            occurrenceDate.setDate(dtEleven.getDate() + 1);
            var occurrence = event.getOccurrence(occurrenceDate);
            occurrence.deleteObject();

            event.meetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.meetingCanceled;

            TestCore.log("Verifying Recurrence");
            iCalendar = event.getiCalendar();
            iCalendar = iCalendar.replace(/\r\n /g, "");
            eventIndex = iCalendar.indexOf("BEGIN:VEVENT\r\n");
            vevent = iCalendar.substring(eventIndex, iCalendar.indexOf("END:VEVENT\r\n"));
            TestCore.verifyComponentProperty(vevent, "STATUS", "CANCELLED");
            TestCore.verifyComponentProperty(vevent, "RRULE", "FREQ=DAILY;WKST=SU");
            TestCore.verifyComponentDate(vevent, "EXDATE", occurrenceDate);

            attendees.dispose();
        }
    });

    // testDoNotPopulateOrganizer verifies syncing a created event populates 
    // organizer email, but not the organizer name
    Tx.test("EventTests.testDoNotPopulateOrganizer", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var dtNow    = new Date();
            var dtNoon   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 12);
            var dtOne    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 13);

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");
            tc.areEqual(0, event.id, "Event has been committed");

            var uid = event.uid;
            TestCore.log("Event UID: " + uid);

            TestCore.log("Populating Event Properties");
            event.subject = "Lunch";
            event.location = "Commons";
            event.startDate = dtNoon;
            event.endDate = dtOne;
            event.meetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.isAMeeting;
            event.reminder = 15;
            event.dataType = Microsoft.WindowsLive.Platform.Calendar.DataType.mime;
            event.responseRequested = true;
            event.disallowNewTime = true;

            TestCore.log("Validating Organizer Values Pre-commit");
            tc.areEqual("", event.organizerName, "before commit, organizer name should not have a value");

            TestCore.log("Committing Event");
            event.commit();

            // check the organizer values
            TestCore.log("Validating Organizer Values Post-commit");
            tc.areEqual("", event.organizerName, "after commit, organizer name should still not have a value");
            tc.areEqual(TestCore.defaultAccount.emailAddress, event.organizerEmail, "after commit, organizer email should have a value");
        }
    });
})();
