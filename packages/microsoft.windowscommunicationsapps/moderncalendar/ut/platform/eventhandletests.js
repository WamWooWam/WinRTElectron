
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    // testSimpleEventHandle verifies handles work as expected for
    // single and series events
    Tx.test("EventHandleTests.testSimpleEventHandle", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var dtNow    = new Date();
            var dtEleven = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 11);
            var dtNoon   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 12);
            var dtOne    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(), 13); 
            
            TestCore.log("Getting default calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to get default calendar");    

            TestCore.log("Creating Single Event");
            var single = calendar.createEvent();
            single.subject = "Single";
            single.startDate = dtEleven;
            single.endDate = dtNoon;
            single.commit();

            var singleHandle = single.handle;
            TestCore.log("Handle for single event: " + singleHandle);

            TestCore.log("Creating Series Event");
            var series = calendar.createEvent();
            series.subject = "Series";
            series.startDate = dtNoon;
            series.endDate = dtOne;
            series.recurring = true;
            series.commit();

            var seriesHandle = series.handle;
            TestCore.log("Handle for series event: " + seriesHandle);

            TestCore.log("Retrieving single event by handle");
            var singleRetrieved = TestCore.calendarManager.getEventFromHandle(singleHandle);
            tc.isNotNull(singleRetrieved, "Failed to get single event");
            TestCore.verifyObject(singleRetrieved, 
                                  ["subject", "startDate", "endDate"],
                                  ["Single", dtEleven, dtNoon]);

            TestCore.log("Retrieving series event by handle");
            var seriesRetrieved = TestCore.calendarManager.getEventFromHandle(seriesHandle);
            tc.isNotNull(seriesRetrieved, "Failed to get series event");
            TestCore.verifyObject(seriesRetrieved, 
                                  ["subject", "startDate", "endDate"],
                                  ["Series", dtNoon, dtOne]);

            TestCore.log("Deleteing single event");
            single.deleteObject();

            TestCore.log("Attempting to retrieve deleted event by handle");
            var singleRetrieved2 = TestCore.calendarManager.getEventFromHandle(singleHandle);
            tc.isNull(singleRetrieved2, "Actually got the deleted event");

            TestCore.log("Attempting retrieve event with \"empty handle\"");
            tc.isNull(TestCore.calendarManager.getEventFromHandle("0"));

            TestCore.log("Attempting to retrieve event with invalidly formatted handles");
            
            try
            {
                TestCore.calendarManager.getEventFromHandle("01");
                tc.error("No exception with \"too long\" empty handle");
            }
            catch(exception)
            {
            }
            
            try
            {
                TestCore.calendarManager.getEventFromHandle("1abcd0123");
                tc.error("No exception with \"non-event\" event handle");
            }
            catch(exception)
            {
            }
            
            try
            {
                TestCore.calendarManager.getEventFromHandle("F");
                tc.error("No exception with \"unrecognized type\" event handle");
            }
            catch(exception)
            {
            }
            
        }
    });

    // testInstanceEventHandle verifies handles work as expected for
    // instances of series events, including exceptions
    Tx.test("EventHandleTests.testInstanceEventHandle", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var dtNow       = new Date();
            var dtDay0Noon  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     12);
            var dtDay0One   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     13);
            var dtDay0Two   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     14);
            var dtDay0Three = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     15);
            var dtDay1Noon  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 12);
            var dtDay1One   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 13);
            var dtDay1Two   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 14);
            var dtDay2Noon  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2, 12);
            var dtDay2One   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2, 13);
            var dtDay2Two   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2, 14);
            
            TestCore.log("Getting default calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to get default calendar");

            TestCore.log("Creating series");
            var series = calendar.createEvent();
            series.subject = "Series";
            series.startDate = dtDay0Noon;
            series.endDate = dtDay0One;
            series.recurring = true;
            series.commit();

            TestCore.log("Retrieving Occurrences");
            var occur1 = series.getOccurrence(dtDay0Noon);
            var occur2 = series.getOccurrence(dtDay1Noon);
            var occur3 = series.getOccurrence(dtDay2Noon);

            TestCore.log("Creating Subject Exception");
            occur2.subject = "Subject Exception";
            occur2.commit();

            TestCore.log("Creating Time Exception");
            occur3.subject = "Time Exception";
            occur3.startDate = dtDay2One;
            occur3.endDate = dtDay2Two;
            occur3.commit();

            TestCore.log("Retrieving Handles");
            var occur1Handle = occur1.handle;
            var occur2Handle = occur2.handle;
            var occur3Handle = occur3.handle;

            TestCore.log("" + dtDay0Noon.toDateString() + ": " + occur1Handle);
            TestCore.log("" + dtDay1Noon.toDateString() + ": " + occur2Handle);
            TestCore.log("" + dtDay2Noon.toDateString() + ": " + occur3Handle);

            TestCore.log("Retrieving Non Exception by Handle");
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(occur1Handle),
                                  ["subject", "eventType", "startDate", "endDate"],
                                  [
                                    "Series",
                                    Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries,
                                    dtDay0Noon,
                                    dtDay0One
                                  ]);

            TestCore.log("Retrieving Subject Exception by Handle");
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(occur2Handle),
                                  ["subject", "eventType", "startDate", "endDate"],
                                  [
                                    "Subject Exception",
                                    Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries,
                                    dtDay1Noon,
                                    dtDay1One
                                  ]);

            TestCore.log("Retrieving Time Exception by Handle");
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(occur3Handle),
                                  ["subject", "eventType", "startDate", "endDate"],
                                  [
                                    "Time Exception",
                                    Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries,
                                    dtDay2One,
                                    dtDay2Two
                                  ]);

            TestCore.log("Making Subject Exception a Time Exception");
            occur2.startDate = dtDay1One;
            occur2.endDate = dtDay1Two;
            occur2.commit();
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(occur2Handle),
                                  ["subject", "eventType", "startDate", "endDate"],
                                  [
                                    "Subject Exception",
                                    Microsoft.WindowsLive.Platform.Calendar.EventType.exceptionToSeries,
                                    dtDay1One,
                                    dtDay1Two
                                  ]);

            TestCore.log("Deleting non-exception instance");
            occur1.deleteObject();
            tc.isNull(TestCore.calendarManager.getEventFromHandle(occur1Handle), "Retrieved deleted event");

            TestCore.log("Changing Series start time (invalidating all instance handles");
            series.startDate = dtDay0Two;
            series.endDate = dtDay0Three;
            series.deleteExceptions();
            series.commit();
            tc.isNull(TestCore.calendarManager.getEventFromHandle(occur1Handle), "Retrieved occur1");
            tc.isNull(TestCore.calendarManager.getEventFromHandle(occur2Handle), "Retrieved occur2");
            tc.isNull(TestCore.calendarManager.getEventFromHandle(occur3Handle), "Retrieved occur3");
            
        }
    });

    // testAllDayInstanceEventHandle verifies handles work as expected for
    // all day events, including exceptions
    Tx.test("EventHandleTests.testAllDayInstanceEventHandle", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            var dtNow          = new Date();
            var dtDay0Eleven   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     23);
            var dtDay1Midnight = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 0);
            var dtDay1Eleven   = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 23);
            var dtDay2Midnight = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2, 0);
            var dtDay3Midnight = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 3, 0);
            
            TestCore.log("Getting default calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to get default calendar");

            TestCore.log("Creating 'all-day' series in another timezone");
            var series = calendar.createEvent();
            series.subject = "All Day Series";
            series.startDate = dtDay0Eleven;
            series.endDate = dtDay1Eleven;
            series.allDayEvent = true;
            series.recurring = true;
            series.commit();

            var tz = series.getTimezone();
            tz.bias = tz.bias - 60;
            tz.standardName = "Foo ST";
            tz.daylightName = "Foo DT";
            series.setTimezone(tz);
            series.commit();

            TestCore.log("Get events for tomorrow and the day after");
            var tomorrow = series.getOccurrence(dtDay1Midnight);
            var dayafter = series.getOccurrence(dtDay2Midnight);

            TestCore.log("Making day after a subject exception");
            dayafter.subject = "All Day Exception";
            dayafter.commit();

            TestCore.log("Getting handles");
            var tomorrowHandle = tomorrow.handle;
            var dayafterHandle = dayafter.handle;
            TestCore.log("" + tomorrow.startDate + ": " + tomorrowHandle);
            TestCore.log("" + dayafter.startDate + ": " + dayafterHandle);

            TestCore.log("Retrieving tomorrow (instance) via handle");
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(tomorrowHandle), 
                                  ["subject", "startDate", "endDate"],
                                  ["All Day Series", dtDay1Midnight, dtDay2Midnight]);
            
            TestCore.log("Retrieving day after (exception) via handle");
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(dayafterHandle), 
                                  ["subject", "startDate", "endDate"],
                                  ["All Day Exception", dtDay2Midnight, dtDay3Midnight]);
            
        }
    });

    // testCacheEventHandle verifies that event's can be retrieved from
    // the event handles populated in the cache
    Tx.test("EventHandleTests.testCacheEventHandle", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {

            var dtNow           = new Date();
            var dtDay0Midnight  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     0);
            var dtDay0Noon      = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     12);
            var dtDay0One       = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     13);
            var dtDay0Eleven    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate(),     23);
            var dtDay1Midnight  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 0);
            var dtDay1Noon      = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 12);
            var dtDay1One       = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 13);
            var dtDay1Eleven    = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 1, 23);
            var dtDay2Midnight  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2, 0);
            var dtDay2Noon      = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2, 12);
            var dtDay2One       = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 2, 13);
            var dtDay3Midnight  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 3, 0);
            var dtDay3Noon      = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 3, 12);
            var dtDay3One       = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 3, 13);
            var dtDay3Two       = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 3, 14);
            var dtDay4Midnight  = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate() + 4, 0);
            
            TestCore.log("Getting default calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to get default calendar");

            TestCore.log("Creating series");
            var series = calendar.createEvent();
            series.subject = "Series";
            series.startDate = dtDay1Noon;
            series.endDate = dtDay1One;
            series.recurring = true;
            series.recurrence.until = dtDay4Midnight;
            series.commit();

            TestCore.log("Creating exception");
            var occur = series.getOccurrence(dtDay3Noon);
            occur.subject = "Exception";
            occur.startDate = dtDay3One;
            occur.endDate = dtDay3Two;
            occur.commit();

            TestCore.log("Creating 'all-day' series in another timezone");
            var allday = calendar.createEvent();
            allday.subject = "All Day";
            allday.startDate = dtDay0Eleven;
            allday.endDate = dtDay1Eleven;
            allday.allDayEvent = true;
            allday.recurring = true;
            allday.recurrence.until = dtDay4Midnight;
            allday.commit();

            var tz = allday.getTimezone();
            tz.bias = tz.bias - 60;
            tz.standardName = "Foo ST";
            tz.daylightName = "Foo DT";
            allday.setTimezone(tz);
            allday.commit();

            TestCore.log("Creating 'all-day' exception");
            var alldayoccur = allday.getOccurrence(dtDay2Midnight);
            alldayoccur.subject = "All Day Exception";
            alldayoccur.commit();

            TestCore.log("Creating single");
            var single = calendar.createEvent();
            single.subject = "Single";
            single.startDate = dtDay0Noon;
            single.endDate = dtDay0One;
            single.commit();
            
            TestCore.waitForIdle(TestCore.defaultWait);
            var events = TestCore.calendarManager.getEvents(dtDay0Midnight, dtDay4Midnight);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Single",              dtDay0Noon,     dtDay0One],
                                            ["All Day",             dtDay1Midnight, dtDay2Midnight],
                                            ["Series",              dtDay1Noon,     dtDay1One],
                                            ["All Day Exception",   dtDay2Midnight, dtDay3Midnight],
                                            ["Series",              dtDay2Noon,     dtDay2One],
                                            ["All Day",             dtDay3Midnight, dtDay4Midnight],
                                            ["Exception",           dtDay3One,      dtDay3Two]
                                         ]);

            TestCore.log("Verifying events retrieved by handle");
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(events.item(0).handle),
                                  ["subject", "startDate", "endDate"],
                                  ["Single", dtDay0Noon, dtDay0One]);
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(events.item(1).handle),
                                  ["subject", "startDate", "endDate"],
                                  ["All Day", dtDay1Midnight, dtDay2Midnight]);
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(events.item(2).handle),
                                  ["subject", "startDate", "endDate"],
                                  ["Series", dtDay1Noon, dtDay1One]);
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(events.item(3).handle),
                                  ["subject", "startDate", "endDate"],
                                  ["All Day Exception", dtDay2Midnight, dtDay3Midnight]);
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(events.item(4).handle),
                                  ["subject", "startDate", "endDate"],
                                  ["Series", dtDay2Noon, dtDay2One]);
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(events.item(5).handle),
                                  ["subject", "startDate", "endDate"],
                                  ["All Day", dtDay3Midnight, dtDay4Midnight]);
            TestCore.verifyObject(TestCore.calendarManager.getEventFromHandle(events.item(6).handle),
                                  ["subject", "startDate", "endDate"],
                                  ["Exception", dtDay3One, dtDay3Two]);

            events.dispose();
        }
    });
    
})();