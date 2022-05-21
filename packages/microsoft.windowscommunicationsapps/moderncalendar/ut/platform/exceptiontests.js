
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    Tx.test("ExceptionTests.testExceptionFields", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Recurring Event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            series.location = "Office";
            series.allDayEvent = false;
            series.reminder = -1;
            series.sensitivity = Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal;
            series.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
            series.meetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting;
            series.recurring = true;
            series.data = "Series Data";

            series.commit();           

            TestCore.log("Getting occurrence on the 2nd");
            var occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 12));
            TestCore.verifyObject(occurrence2nd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 2, 12), 
                                    new Date(2011, 5, 2, 13), 
                                    "Recurring Event",
                                    "Office",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence2nd, ["data"], ["Series Data"]);

            TestCore.log("Getting occurrence on the 3rd");
            var occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 3, 12), 
                                    new Date(2011, 5, 3, 13), 
                                    "Recurring Event",
                                    "Office",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence3rd, ["data"], ["Series Data"]);

            TestCore.log("Changing the startDate of the occurrence on the 2nd");
            occurrence2nd.startDate = new Date(2011, 5, 2, 13);
            occurrence2nd.commit();
            
            TestCore.log("Getting occurrence on the 2nd");
            occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 13));
            TestCore.verifyObject(occurrence2nd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 2, 13), 
                                    new Date(2011, 5, 2, 13), 
                                    "Recurring Event",
                                    "Office",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence2nd, ["data"], ["Series Data"]);

            TestCore.log("Getting occurrence on the 3rd");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 3, 12), 
                                    new Date(2011, 5, 3, 13), 
                                    "Recurring Event",
                                    "Office",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence3rd, ["data"], ["Series Data"]);

            TestCore.log("Changing the endDate of the occurrence on the 2nd");
            occurrence2nd.endDate = new Date(2011, 5, 2, 15);
            occurrence2nd.commit();
            
            TestCore.log("Getting occurrence on the 2nd");
            occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 13));
            TestCore.verifyObject(occurrence2nd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 2, 13), 
                                    new Date(2011, 5, 2, 15), 
                                    "Recurring Event",
                                    "Office",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence2nd, ["data"], ["Series Data"]);

            TestCore.log("Getting occurrence on the 3rd");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 3, 12), 
                                    new Date(2011, 5, 3, 13), 
                                    "Recurring Event",
                                    "Office",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence3rd, ["data"], ["Series Data"]);

            TestCore.log("Updating Location of Series");
            series.location = "Commons";
            series.commit();

            TestCore.log("Getting occurrence on the 2nd");
            occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 13));
            TestCore.verifyObject(occurrence2nd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 2, 13), 
                                    new Date(2011, 5, 2, 15), 
                                    "Recurring Event",
                                    "Commons",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence2nd, ["data"], ["Series Data"]);

            TestCore.log("Getting occurrence on the 3rd");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 3, 12), 
                                    new Date(2011, 5, 3, 13), 
                                    "Recurring Event",
                                    "Commons",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence3rd, ["data"], ["Series Data"]);

            TestCore.log("Changing the subject and location of the occurrence on the 2nd");
            occurrence2nd.subject = "Exception";
            occurrence2nd.location = "Home";
            occurrence2nd.commit();

            TestCore.log("Getting occurrence on the 2nd");
            occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 13));
            TestCore.verifyObject(occurrence2nd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 2, 13), 
                                    new Date(2011, 5, 2, 15), 
                                    "Exception",
                                    "Home",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence2nd, ["data"], ["Series Data"]);

            TestCore.log("Getting occurrence on the 3rd");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 3, 12), 
                                    new Date(2011, 5, 3, 13), 
                                    "Recurring Event",
                                    "Commons",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence3rd, ["data"], ["Series Data"]);

            TestCore.log("Changing the reminder, sensitivity, busyStatus, and data of the occurrence on the 2nd");
            occurrence2nd.reminder = 15;
            /*jshint es5:true*/
            occurrence2nd.sensitivity = Microsoft.WindowsLive.Platform.Calendar.Sensitivity.private;
            /*jshint es5:false*/
            occurrence2nd.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.outOfOffice;
            occurrence2nd.data = "Exception Data";
            occurrence2nd.commit();

            TestCore.log("Getting occurrence on the 2nd");
            occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 13));
            TestCore.verifyObject(occurrence2nd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 2, 13), 
                                    new Date(2011, 5, 2, 15), 
                                    "Exception",
                                    "Home",
                                    false,
                                    15,
                                    /*jshint es5:true*/
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.private,
                                    /*jshint es5:false*/
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.outOfOffice,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence2nd, ["data"], ["Exception Data"]);

            TestCore.log("Getting occurrence on the 3rd");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, 
                                  [
                                    "startDate", 
                                    "endDate", 
                                    "subject",
                                    "location",
                                    "allDayEvent",
                                    "reminder",
                                    "sensitivity",
                                    "busyStatus",
                                    "meetingStatus"
                                  ], 
                                  [
                                    new Date(2011, 5, 3, 12), 
                                    new Date(2011, 5, 3, 13), 
                                    "Recurring Event",
                                    "Commons",
                                    false,
                                    -1,
                                    Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal,
                                    Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free,
                                    Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.notAMeeting
                                  ]);
            TestCore.verifyObject(occurrence3rd, ["data"], ["Series Data"]);
            
        }
    });

    Tx.test("ExceptionTests.testGetOccurrence", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Recurring Event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            
            series.recurring = true;
            var recur = series.recurrence;
            recur.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
            recur.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.all;

            series.commit();

            var event = calendar.createEvent();
            event.startDate = new Date(2011, 5, 1, 12);
            event.endDate = new Date(2011, 5, 1, 13);
            event.subject = "Single Event";
            event.commit();

            TestCore.log("Retrieving occurrence for the 2nd");
            var occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 12));
            TestCore.verifyObject(occurrence2nd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 2, 12), new Date(2011, 5, 2, 13), "Recurring Event"]);

            TestCore.log("Retrieving occurrence for the 3rd");
            var occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 3, 12), new Date(2011, 5, 3, 13), "Recurring Event"]);

            TestCore.log("Retrieving occurrence for single event");
            var singleOccurrence = event.getOccurrence(new Date(2011, 5, 1, 12));
            TestCore.verifyObject(singleOccurrence, ["startDate", "endDate", "subject"], [new Date(2011, 5, 1, 12), new Date(2011, 5, 1, 13), "Single Event"]);

            var caughtException = false;
            try
            {
                TestCore.log("Retrieving invalid occurrence for single event");
                event.getOccurrence(new Date(2011, 5, 2, 12));
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            caughtException = false;
            try
            {
                TestCore.log("Retrieving invalid occurrence for recurring event");
                series.getOccurrence(new Date(2011, 5, 2, 13));
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Changing subject of occurrence on the 2nd");
            occurrence2nd.subject = "Subject Exception";
            occurrence2nd.commit();

            TestCore.log("Retrieving occurrence for the 2nd");
            occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 12));
            TestCore.verifyObject(occurrence2nd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 2, 12), new Date(2011, 5, 2, 13), "Subject Exception"]);

            TestCore.log("Retrieving occurrence for the 3rd");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 3, 12), new Date(2011, 5, 3, 13), "Recurring Event"]);

            TestCore.log("Changing start time of occurrence on the 3rd");
            occurrence3rd.startDate = new Date(2011, 5, 3, 14);
            occurrence3rd.endDate = new Date(2011, 5, 3, 15);
            occurrence3rd.commit();

            TestCore.log("Retrieving occurrence for the 2nd");
            occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 12));
            TestCore.verifyObject(occurrence2nd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 2, 12), new Date(2011, 5, 2, 13), "Subject Exception"]);

            caughtException = false;
            try
            {
                TestCore.log("Retrieving occurrence for the 3rd at the old time");
                series.getOccurrence(new Date(2011, 5, 3, 12));
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Retrieving occurrence for the 3rd at the new time");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 14));
            TestCore.verifyObject(occurrence3rd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 3, 14), new Date(2011, 5, 3, 15), "Recurring Event"]);

            TestCore.log("Deleting occurrence for the 2nd");
            occurrence2nd.deleteObject();

            caughtException = false;
            try
            {
                TestCore.log("Retrieving occurrence for the 2nd");
                series.getOccurrence(new Date(2011, 5, 2, 12));
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Retrieving occurrence for the 3rd at the new time");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 14));
            TestCore.verifyObject(occurrence3rd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 3, 14), new Date(2011, 5, 3, 15), "Recurring Event"]);

            TestCore.log("Calling deleteExceptions");
            series.deleteExceptions();

            TestCore.log("Verify exceptions not deleted before commit");
            caughtException = false;
            try
            {
                TestCore.log("Retrieving occurrence for the 2nd");
                series.getOccurrence(new Date(2011, 5, 2, 12));
            }
            catch (exception)
            {
                tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime, exception.number, "Received unexpected exception");
                caughtException = true;
            }
            tc.isTrue(caughtException, "No Exception Caught");

            TestCore.log("Retrieving occurrence for the 3rd at the new time");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 14));
            TestCore.verifyObject(occurrence3rd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 3, 14), new Date(2011, 5, 3, 15), "Recurring Event"]);

            TestCore.log("Committing Series (which should delete exceptions)");
            series.commit();

            try
            {
                TestCore.log("Retrieving occurrence for the 2nd");
                occurrence2nd = series.getOccurrence(new Date(2011, 5, 2, 12));
                TestCore.verifyObject(occurrence2nd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 2, 12), new Date(2011, 5, 2, 13), "Recurring Event"]);
            }
            catch (exception)
            {
                if (exception.number === Microsoft.WindowsLive.Platform.Calendar.Status.errorEventInvalidOccurrenceTime){
                    tc.error("Caught unexpected exception: Invalid Occurrence Time");
                } else {
                    tc.error("Caught unexpected exception: " + exception);
                }
            }

            TestCore.log("Retrieving occurrence for the 3rd at the old time");
            occurrence3rd = series.getOccurrence(new Date(2011, 5, 3, 12));
            TestCore.verifyObject(occurrence3rd, ["startDate", "endDate", "subject"], [new Date(2011, 5, 3, 12), new Date(2011, 5, 3, 13), "Recurring Event"]);
        }
    });

    Tx.test("ExceptionTests.testDelayedException", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Recurring Event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            series.location = "Commons";
            
            series.recurring = true;
            var recur = series.recurrence;
            recur.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
            recur.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.all;

            series.commit();

            TestCore.log("Getting 3 copies of occurrence on 2nd");
            var occurrence1 = series.getOccurrence(new Date(2011, 5, 2, 12));
            var occurrence2 = series.getOccurrence(new Date(2011, 5, 2, 12));
            var occurrence3 = series.getOccurrence(new Date(2011, 5, 2, 12));

            TestCore.log("Setting (but not committing) location on occurrence 3");
            occurrence3.location = "Cafe 50";

            var count = 0;
            var propertyChanged = function(ev) {

                var properties = ev.detail[0];
                
                var fFound = false;
                for (var i = 0; i < properties.length && !fFound; i ++) {

                    if (properties[i] === "subject" || properties[i] === "location") {
                        count ++;
                        fFound = true;
                    }
                }
            };

            occurrence1.addEventListener("changed", propertyChanged);
            occurrence2.addEventListener("changed", propertyChanged);
            occurrence3.addEventListener("changed", propertyChanged);

            TestCore.log("Changing subject and location on occurrence 2");
            occurrence2.subject = "Lunch";
            occurrence2.location = "Red Robin";
            occurrence2.commit();

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Received events: " + count);

            TestCore.log("Verifying occurrence1");
            TestCore.verifyObject(occurrence1, ["subject", "location"], ["Lunch", "Red Robin"]);
            
            TestCore.log("Verifying occurrence2");
            TestCore.verifyObject(occurrence2, ["subject", "location"], ["Lunch", "Red Robin"]);
            
            TestCore.log("Verifying occurrence3");
            TestCore.verifyObject(occurrence3, ["subject", "location"], ["Lunch", "Cafe 50"]);

            occurrence1.removeEventListener("changed", propertyChanged);
            occurrence2.removeEventListener("changed", propertyChanged);
            occurrence3.removeEventListener("changed", propertyChanged);
        }
    });

    Tx.test("ExceptionTests.testExceptionChanged", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Recurring Event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            series.location = "Commons";
            series.recurring = true;
            series.commit();

            TestCore.log("Getting occurrence on 2nd");
            var occurrence = series.getOccurrence(new Date(2011, 5, 2, 12));

            var changes = [];
            var changed = function (ev) {
                var properties = ev.detail[0];
                for (var i = 0; i < properties.length; i++) {
                    TestCore.log("Received Property Change: " + properties[i]);
                    changes.push(properties[i]);
                }
            };

            occurrence.addEventListener("changed", changed);

            TestCore.log("Setting subject");
            occurrence.subject = "Exception Event";
            occurrence.commit();
            
            TestCore.waitForArrayLength(TestCore.defaultWait, changes, 2);
            TestCore.verifyArrays("Property Change", changes, ["eventType", "subject"]);

            TestCore.log("Setting location");
            changes = [];
            occurrence.location = "Not Commons";
            occurrence.commit();

            TestCore.waitForArrayLength(TestCore.defaultWait, changes, 1);
            TestCore.verifyArrays("Property Change", changes, ["location"]);

            TestCore.log("Setting data");
            changes = [];
            occurrence.data = "This is data";
            occurrence.commit();

            TestCore.waitForArrayLength(TestCore.defaultWait, changes, 1);
            TestCore.verifyArrays("Property Change", changes, ["data"]);

            occurrence.removeEventListener("changed", changed);
        }
    });

    Tx.test("ExceptionTests.testDeleteRequired", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Recurring Event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            series.location = "Commons";
            series.recurring = true;
            series.commit();

            TestCore.log("Getting occurrence on 2nd, and making it an exception");
            var occurrence = series.getOccurrence(new Date(2011, 5, 2, 12));
            occurrence.subject = "Exception";
            occurrence.commit();

            tc.isTrue(series.exceptions, "series should now have exceptions");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, series.validate(), "series should be valid");

            TestCore.log("Attempting to change start date of series");
            var series1 = occurrence.getSeries();
            series1.startDate = new Date(2011, 5, 1, 12, 30);
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventExceptionDeleteRequired, series1.validate(), "series should require exception delete");

            TestCore.log("Attempting to change end date of series");
            var series2 = occurrence.getSeries();
            series2.endDate = new Date(2011, 5, 1, 12, 30);
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventExceptionDeleteRequired, series2.validate(), "series should require exception delete");

            TestCore.log("Attempting to change recurrence of series");
            var series3 = occurrence.getSeries();
            series3.recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.wednesday;
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorEventExceptionDeleteRequired, series3.validate(), "series should require exception delete");

            TestCore.log("Attempting to change subject of series");
            var series4 = occurrence.getSeries();
            series3.subject = "This should work";
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, series4.validate(), "series should not require exception delete");
        }
    });

    Tx.test("ExceptionTests.testExceptionAttendees", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Recurring Event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            series.location = "Commons";
            series.recurring = true;
            series.commit();

            TestCore.log("Adding attendees to series");
            series.addAttendee("Bob", "bob@barker.com");
            series.addAttendee("Susan", "susan@surandon.net");
            series.addAttendee("Foo", "foo@bar.org");
            series.commit();

            var seriesAttendees = series.getAttendees();
            
            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Foo", 
                                                email: "foo@bar.org", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Getting occurrence on 2nd");
            var occurrence = series.getOccurrence(new Date(2011, 5, 2, 12));

            TestCore.log("Getting Attendees");
            var occurrenceAttendees = occurrence.getAttendees();

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Foo", 
                                                email: "foo@bar.org", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Removing attendee from series");
            seriesAttendees.item(2).deleteObject();
            series.commit();

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyNotifications(seriesAttendees, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyNotifications(occurrenceAttendees, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Adding attendee to series");
            series.addAttendee("Robert", "robert@redford.gov");
            series.commit();

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyNotifications(seriesAttendees, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyNotifications(occurrenceAttendees, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Removing attendee from occurrence");
            occurrenceAttendees.item(2).deleteObject();
            occurrence.commit();

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyNotifications(occurrenceAttendees, 2, TestCore.ignoreValue, 3);
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyNotifications(seriesAttendees, 0, 0, 0);
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );


            TestCore.log("Adding attendee to occurrence");
            occurrence.addAttendee("Jack", "jack@black.tv");
            occurrence.commit();
            
            TestCore.verifyNotifications(occurrenceAttendees, 1, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Jack", 
                                                email: "jack@black.tv", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Getting occurrence on 3rd");
            var occurrence2 = series.getOccurrence(new Date(2011, 5, 3, 12));

            var occurrenceAttendees2 = occurrence2.getAttendees();

            TestCore.log("Verifying Occurrence 2 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees2,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );
            
            TestCore.log("Adding attendee to occurrence 2");
            occurrence2.addAttendee("Mark", "mark@twain.edu");
            occurrence2.commit();

            TestCore.verifyNotifications(occurrenceAttendees2, 4, TestCore.ignoreValue, 3);

            TestCore.log("Verifying Occurrence 2 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees2,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Mark", 
                                                email: "mark@twain.edu", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Jack", 
                                                email: "jack@black.tv", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Removing attendee from occurrence2");
            occurrenceAttendees2.item(0).deleteObject();
            occurrence2.commit();

            TestCore.verifyNotifications(occurrenceAttendees2, TestCore.ignoreValue, TestCore.ignoreValue, 1);

            TestCore.log("Verifying Occurrence 2 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees2,
                                        [
                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Mark", 
                                                email: "mark@twain.edu", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Jack", 
                                                email: "jack@black.tv", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Removing attendee from series");
            seriesAttendees.item(1).deleteObject();
            series.commit();

            TestCore.verifyNotifications(seriesAttendees, TestCore.ignoreValue, TestCore.ignoreValue, 1);

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Occurrence 2 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees2,
                                        [
                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Mark", 
                                                email: "mark@twain.edu", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Jack", 
                                                email: "jack@black.tv", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Getting occurrence on 4th");
            var occurrence3 = series.getOccurrence(new Date(2011, 5, 4, 12));

            var occurrenceAttendees3 = occurrence3.getAttendees();

            TestCore.log("Verifying Occurrence 3 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees3,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );
            
            TestCore.log("Modifying attendee on occurrence 3");
            occurrence3.getAttendees().item(0).name = "Bobby";
            occurrence3.commit();

            TestCore.verifyNotifications(occurrenceAttendees3, 2, TestCore.ignoreValue, 2);
            
            TestCore.log("Verifying Occurrence 3 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees3,
                                        [
                                            { 
                                                name: "Bobby", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );


            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Occurrence 2 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees2,
                                        [
                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Mark", 
                                                email: "mark@twain.edu", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.waitForIdle(TestCore.defaultWait);

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Jack", 
                                                email: "jack@black.tv", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            var changes = {
                            count: 0,
                            filter: "name"
                          };
            var changed = function (ev) {
                var props = ev.detail[0];
                for (var i = 0; i < props.length; i++) {
                    if (props[i] === changes.filter) {
                        changes.count++;
                    }
                }
            };

            changes.count = 0;
            TestCore.log("Modifying attendee on occurrence 3");
            var robert = occurrence3.getAttendees().item(1);
            robert.addEventListener("changed", changed);
            occurrence3.getAttendees().item(1).name = "Roberta";
            occurrence3.commit();

            TestCore.waitForPropertyValue(TestCore.defaultWait, changes, "count", 1);
            tc.areEqual(1, changes.count, "Should have received one attendee name changed event");

            TestCore.log("Verifying Occurrence 3 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees3,
                                        [
                                            { 
                                                name: "Bobby", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Roberta", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Series Attendee List");
            TestCore.verifyAttendees(   seriesAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Occurrence 2 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees2,
                                        [
                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Mark", 
                                                email: "mark@twain.edu", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Occurrence Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Susan", 
                                                email: "susan@surandon.net", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Jack", 
                                                email: "jack@black.tv", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Getting 2 copies of occurrence on 5th");
            var occurrence4 = series.getOccurrence(new Date(2011, 5, 5, 12));
            var occurrence5 = series.getOccurrence(new Date(2011, 5, 5, 12));

            var occurrenceAttendees4 = occurrence4.getAttendees();
            var occurrenceAttendees5 = occurrence5.getAttendees();

            TestCore.log("Verifying Occurrence 4 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees4,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Occurrence 5 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees5,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );
            
            TestCore.log("Deleting, but not committing, attendee on occurrence 4");
            occurrenceAttendees4.item(0).deleteObject();

            TestCore.log("Adding attendee to occurrence 5");
            occurrence5.addAttendee("Sylvester", "sylvester@thecat.us");
            occurrence5.commit();

            TestCore.verifyNotifications(occurrenceAttendees4, 3, TestCore.ignoreValue, 2);
            TestCore.verifyNotifications(occurrenceAttendees5, 3, TestCore.ignoreValue, 2);

            TestCore.log("Verifying Occurrence 5 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees5,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Sylvester", 
                                                email: "sylvester@thecat.us", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Occurrence 4 Attendee List");
            TestCore.verifyAttendees(   occurrenceAttendees4,
                                        [
                                            { 
                                                name: "Bob", 
                                                email: "bob@barker.com", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Sylvester", 
                                                email: "sylvester@thecat.us", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );                           

            TestCore.log("Committing Occurrence 4 (item delete)");
            occurrence4.commit();

            TestCore.verifyNotifications(occurrenceAttendees4, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            TestCore.verifyNotifications(occurrenceAttendees5, TestCore.ignoreValue, TestCore.ignoreValue, 1);

            TestCore.log("Verifying Occurrence 5");
            TestCore.verifyAttendees(   occurrenceAttendees5,
                                        [
                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Sylvester", 
                                                email: "sylvester@thecat.us", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );

            TestCore.log("Verifying Occurrence 4");    
            TestCore.verifyAttendees(   occurrenceAttendees4,
                                        [
                                            { 
                                                name: "Robert", 
                                                email: "robert@redford.gov", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            },

                                            { 
                                                name: "Sylvester", 
                                                email: "sylvester@thecat.us", 
                                                responseType: Microsoft.WindowsLive.Platform.Calendar.ResponseType.none,
                                                attendeeType: Microsoft.WindowsLive.Platform.Calendar.AttendeeType.required 
                                            }
                                        ]
                                    );
                                        
            robert.removeEventListener("changed", changed);

            seriesAttendees.dispose();
            occurrenceAttendees.dispose();
            occurrenceAttendees2.dispose();
            occurrenceAttendees3.dispose();
            occurrenceAttendees4.dispose();
            occurrenceAttendees5.dispose();
        }
    });

    Tx.test("ExceptionTests.testExceptionAttendeeStatus", function (tc) {

        TestCore.setupTest(tc);
        
        if (TestCore.verifyHostedInWwa()) {

            var responseAccepted = Microsoft.WindowsLive.Platform.Calendar.ResponseType.accepted;
            var responseDeclined = Microsoft.WindowsLive.Platform.Calendar.ResponseType.declined;
            var responseTentative = Microsoft.WindowsLive.Platform.Calendar.ResponseType.tentative;
            var responseNone = Microsoft.WindowsLive.Platform.Calendar.ResponseType.none;
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Recurring Event");
            var series = calendar.createEvent();
            series.startDate = new Date(2011, 5, 1, 12);
            series.endDate = new Date(2011, 5, 1, 13);
            series.subject = "Recurring Event";
            series.location = "Commons";
            series.recurring = true;
            series.commit();

            TestCore.log("Adding attendees to series");
            series.addAttendee("Bob", "bob@barker.com").responseType = responseAccepted;
            series.addAttendee("Susan", "susan@surandon.net").responseType = responseAccepted;
            series.addAttendee("Foo", "foo@bar.org").responseType = responseAccepted;
            series.commit();

            var seriesAttendees = series.getAttendees();
            
            TestCore.log("Verifying Series Attendee List");
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Response 2 should be accepted");

            TestCore.log("Changing Location (shouldn't affect attendees)");
            series.location = "Uncommons";
            series.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Response 2 should be accepted");

            TestCore.log("Changing End Date (should clear responses");
            series.endDate = new Date(2011, 5, 1, 14);
            series.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseNone, "Response 0 should be none");
            tc.areEqual(seriesAttendees.item(1).responseType, responseNone, "Response 1 should be none");
            tc.areEqual(seriesAttendees.item(2).responseType, responseNone, "Response 2 should be none");

            TestCore.log("Restoring Responses");
            seriesAttendees.item(0).responseType = responseAccepted;
            seriesAttendees.item(1).responseType = responseAccepted;
            seriesAttendees.item(2).responseType = responseAccepted;
            series.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Response 2 should be accepted");

            TestCore.log("Changing Recurrence (should clear responses)");
            series.recurrence.interval = 2;
            series.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseNone, "Response 0 should be none");
            tc.areEqual(seriesAttendees.item(1).responseType, responseNone, "Response 1 should be none");
            tc.areEqual(seriesAttendees.item(2).responseType, responseNone, "Response 2 should be none");

            TestCore.log("Restoring Responses");
            seriesAttendees.item(0).responseType = responseAccepted;
            seriesAttendees.item(1).responseType = responseAccepted;
            seriesAttendees.item(2).responseType = responseAccepted;
            series.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Response 2 should be accepted");

            TestCore.log("Creating start date exception (should clear responses on exception)");
            var occur = series.getOccurrence(new Date(2011, 5, 3, 12));
            occur.startDate = new Date(2011, 5, 3, 12, 15);
            occur.commit();

            var occurAttendees = occur.getAttendees();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Series Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Series Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Series Response 2 should be accepted");

            tc.areEqual(occurAttendees.item(0).responseType, responseNone, "Occur Response 0 should be none");
            tc.areEqual(occurAttendees.item(1).responseType, responseNone, "Occur Response 1 should be none");
            tc.areEqual(occurAttendees.item(2).responseType, responseNone, "Occur Response 2 should be none");

            TestCore.log("Restoring Responses");
            occurAttendees.item(0).responseType = responseAccepted;
            occurAttendees.item(1).responseType = responseAccepted;
            occurAttendees.item(2).responseType = responseAccepted;
            occur.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Series Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Series Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Series Response 2 should be accepted");

            tc.areEqual(occurAttendees.item(0).responseType, responseAccepted, "Occur Response 0 should be accepted");
            tc.areEqual(occurAttendees.item(1).responseType, responseAccepted, "Occur Response 1 should be accepted");
            tc.areEqual(occurAttendees.item(2).responseType, responseAccepted, "Occur Response 2 should be accepted");

            TestCore.log("Change exception location (should not clear responses)");
            occur.location = "Verycommons";
            occur.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Series Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Series Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Series Response 2 should be accepted");

            tc.areEqual(occurAttendees.item(0).responseType, responseAccepted, "Occur Response 0 should be accepted");
            tc.areEqual(occurAttendees.item(1).responseType, responseAccepted, "Occur Response 1 should be accepted");
            tc.areEqual(occurAttendees.item(2).responseType, responseAccepted, "Occur Response 2 should be accepted");

            TestCore.log("Changing exception start date (should clear responses)");
            occur.startDate = new Date(2011, 5, 3, 12);
            occur.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Series Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseAccepted, "Series Response 1 should be accepted");
            tc.areEqual(seriesAttendees.item(2).responseType, responseAccepted, "Series Response 2 should be accepted");

            tc.areEqual(occurAttendees.item(0).responseType, responseNone, "Occur Response 0 should be none");
            tc.areEqual(occurAttendees.item(1).responseType, responseNone, "Occur Response 1 should be none");
            tc.areEqual(occurAttendees.item(2).responseType, responseNone, "Occur Response 2 should be none");

            TestCore.log("Set the attendee responses back to known values (accept, decline, tentative) and remove the exception");
            seriesAttendees.item(0).responseType = responseAccepted;
            seriesAttendees.item(1).responseType = responseDeclined;
            seriesAttendees.item(2).responseType = responseTentative;
            series.deleteExceptions();
            series.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseAccepted, "Series Response 0 should be accepted");
            tc.areEqual(seriesAttendees.item(1).responseType, responseDeclined, "Series Response 1 should be declined");
            tc.areEqual(seriesAttendees.item(2).responseType, responseTentative, "Series Response 2 should be tentative");
            
            TestCore.log("Change the time and delete one attendee (should clear remaining attendee responses and not throw)");
            series.startDate = new Date(2011, 5, 1, 13);
            series.endDate = new Date(2011, 5, 1, 14);
            seriesAttendees.item(2).deleteObject();
            series.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            tc.areEqual(seriesAttendees.item(0).responseType, responseNone, "Occur Response 0 should be none");
            tc.areEqual(seriesAttendees.item(1).responseType, responseNone, "Occur Response 1 should be none");
            
            seriesAttendees.dispose();
            occurAttendees.dispose();
        }
    });

})();



