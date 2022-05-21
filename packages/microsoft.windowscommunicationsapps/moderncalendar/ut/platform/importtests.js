
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/


/*jshint multistr:true*/

(function () {
    
    var errorCount = 0;

    var logHandler = function (ev) {
        if (ev.error) {
            TestCore.log("    ERROR: " + ev.message);
            errorCount++;
        } else {
            TestCore.log("    Log  : " + ev.message);
        }
    };

    var tearDown = function () {
        // Cleanup after each test so we don't leave bad
        // test state for a future user
        TestCore.cleanupTest();
        TestCore.calendarManager.removeEventListener("onimportxmllog", logHandler);
    };

    var setUp = function (tc, requiresCache) {
        // Cleanup before each test so pre-existing state
        // does not screw up our results
        TestCore.setupTest(tc, requiresCache);
        tc.cleanup = tearDown;
        TestCore.calendarManager.addEventListener("onimportxmllog", logHandler);
    };

    var replaceDate = function (source, token, date) {

        var oldString = "";
        var newString = source;

        do {
            oldString = newString;
            newString = oldString.replace(token, "" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear());
        } while (oldString !== newString);

        return newString;
    };

    var importCalendarsXml1 = " \
        <Calendars> \
            <Calendar> \
                <Name>Calendar1</Name> \
                <ReadOnly>True</ReadOnly> \
            </Calendar> \
            <Calendar> \
                <Name>Calendar2</Name> \
                <ReadOnly>False</ReadOnly> \
            </Calendar> \
            <Calendar> \
            </Calendar> \
        </Calendars> \
    ";

    var importCalendarsXml2 = " \
        <Calendars> \
            <Calendar> \
                <Name>Calendar3</Name> \
                <ReadOnly>True</ReadOnly> \
            </Calendar> \
        </Calendars> \
    ";

    Tx.test("ImportTests.testImportCalendars", function (tc) {

        setUp(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding XML with only calendars");
            errorCount = 0;
            
            TestCore.calendarManager.importXml(TestCore.defaultAccount, importCalendarsXml1);
            tc.areEqual(1, errorCount, "Unexpected number of errors");

            var collection = TestCore.calendarManager.getAllCalendars();
            TestCore.verifyCalendarsByOrder(collection,     
                                            ["name", "isDefault", "readOnly"], 
                                            [["Calendar", false, false], ["Calendar1", false, true], ["Calendar2", true, false]]);
            collection.dispose();

            TestCore.log("Adding XML without default calendar");
            errorCount = 0;
            TestCore.calendarManager.importXml(TestCore.defaultAccount, importCalendarsXml2);
            tc.areEqual(1, errorCount, "Unexpected number of errors");

            collection = TestCore.calendarManager.getAllCalendars();
            TestCore.verifyCalendarsByOrder(collection,     
                                            ["name", "isDefault", "readOnly"], 
                                            [["Calendar3", false, true]]);
            collection.dispose();
        }
    });

    var importInstanceEventsXml1 = " \
        <Calendars> \
            <Calendar> \
                <Name>Calendar</Name> \
                <Event> \
                    <Title>Missing Times</Title> \
                </Event> \
                <Event> \
                    <Title>All Defaults</Title> \
                    <StartTime>#Today# 12:00</StartTime> \
                    <EndTime>#Today# 13:00</EndTime> \
                </Event> \
                <Event> \
                    <Title>No Defaults</Title> \
                    <Location>Here</Location> \
                    <StartTime>#Tomorrow#</StartTime> \
                    <EndTime>#Tomorrow#</EndTime> \
                    <AllDay>True</AllDay> \
                    <Reminder>30</Reminder> \
                    <Status>Tentative</Status> \
                    <Private>True</Private> \
                    <Notes>We have us some notes</Notes> \
                </Event> \
            </Calendar> \
        </Calendars> \
    ";

    Tx.test("ImportTests.testImportInstanceEvents", function (tc) {

        setUp(tc);

        if (TestCore.verifyHostedInWwa()) {

            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
            var one = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13);
            var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            var twodays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
            var xml = replaceDate(replaceDate(importInstanceEventsXml1, "#Today#", today), "#Tomorrow#", tomorrow);
                
            TestCore.log("Adding Event XML");
            
            errorCount = 0;
            TestCore.calendarManager.importXml(TestCore.defaultAccount, xml);
            tc.areEqual(2, errorCount, "Unexpected number of errors");

            TestCore.log("Getting Event Collection");
            var collection = TestCore.calendarManager.getEvents(today, twodays);
            TestCore.waitForCollectionCount(TestCore.defaultWait, collection, 2, true);
            collection.lock();

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(collection,     
                                            ["subject", "location", "startDate", "endDate", "allDayEvent", "reminder", "busyStatus", "sensitivity", "data"], 
                                            [
                                                ["All Defaults", "", noon, one, false, 15, Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy, Microsoft.WindowsLive.Platform.Calendar.Sensitivity.normal, ""],
                                                /*jshint es5:true*/
                                                ["No Defaults", "Here", tomorrow, twodays, true, 30, Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative, Microsoft.WindowsLive.Platform.Calendar.Sensitivity.private, "We have us some notes"]
                                                /*jshint es5:false*/
                                            ]);
            collection.dispose();
        }
    });

    var importAttendeesXml = " \
        <Calendars> \
            <Calendar> \
                <Name>Calendar</Name> \
                <Event> \
                    <StartTime>#Today# 12:00</StartTime> \
                    <EndTime>#Today# 13:00</EndTime> \
                    <Attendees> \
                      <Attendee> \
                          <Name>Bob</Name> \
                          <Email>bob@e.com</Email> \
                      </Attendee> \
                      <Attendee> \
                          <Email>sue@ellen.com</Email> \
                      </Attendee> \
                      <Attendee> \
                          <Name>Dave</Name> \
                      </Attendee> \
                      <Attendee> \
                          <Name>Robert</Name> \
                          <Email>bob@e.com</Email> \
                      </Attendee> \
                    </Attendees> \
                </Event> \
            </Calendar> \
        </Calendars> \
    ";

    Tx.test("ImportTests.testImportAttendees", function (tc) {

        setUp(tc);

        if (TestCore.verifyHostedInWwa()) {

            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            var xml = replaceDate(importAttendeesXml, "#Today#", today);
                
            TestCore.log("Adding Attendee XML");
            
            errorCount = 0;
            TestCore.calendarManager.importXml(TestCore.defaultAccount, xml);
            tc.areEqual(1, errorCount, "Unexpected number of errors");

            TestCore.log("Getting Event Collection");
            var events = TestCore.calendarManager.getEvents(today, tomorrow);
            TestCore.waitForCollectionCount(TestCore.defaultWait, events, 1, true);
            events.lock();

            TestCore.log("Getting Attendeees");
            var attendees = events.item(0).getAttendees();
            TestCore.waitForCollectionCount(TestCore.defaultWait, attendees, 2, true);
            attendees.lock();

            TestCore.log("Verifing Attendees");
            TestCore.verifyObjectsByOrder("Attendee", attendees, 
                                          ["name", "email"],
                                          [
                                            ["Bob", "bob@e.com"],
                                            ["", "sue@ellen.com"]
                                          ]);
            
            attendees.dispose();
            events.dispose();
            
        }
    });

    var importRecurringXml = " \
        <Calendars> \
            <Calendar> \
                <Name>Calendar</Name> \
                <Event> \
                    <Title>Daily</Title> \
                    <StartTime>#Sunday# 4:00</StartTime> \
                    <EndTime>#Sunday# 4:30</EndTime> \
                    <Recurrence>Daily</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Weekdays Saturday</Title> \
                    <StartTime>#Saturday# 6:30</StartTime> \
                    <EndTime>#Saturday# 7:00</EndTime> \
                    <Recurrence>Weekdays</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Weekdays Sunday</Title> \
                    <StartTime>#Sunday# 9:00</StartTime> \
                    <EndTime>#Sunday# 9:30</EndTime> \
                    <Recurrence>Weekdays</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Weekdays Monday</Title> \
                    <StartTime>#Monday# 9:30</StartTime> \
                    <EndTime>#Monday# 10:00</EndTime> \
                    <Recurrence>Weekdays</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Weekly Sunday</Title> \
                    <StartTime>#Sunday# 10:00</StartTime> \
                    <EndTime>#Sunday# 11:00</EndTime> \
                    <Recurrence>Weekly</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Weekly Wednesday</Title> \
                    <StartTime>#Wednesday# 11:00</StartTime> \
                    <EndTime>#Wednesday# 12:00</EndTime> \
                    <Recurrence>Weekly</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Weekly Friday</Title> \
                    <StartTime>#Friday# 12:00</StartTime> \
                    <EndTime>#Friday# 13:00</EndTime> \
                    <Recurrence>Weekly</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Monthly Thursday</Title> \
                    <StartTime>#Thursday# 13:00</StartTime> \
                    <EndTime>#Thursday# 14:00</EndTime> \
                    <Recurrence>Monthly</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
                <Event> \
                    <Title>Yearly Tuesday</Title> \
                    <StartTime>#Tuesday# 14:00</StartTime> \
                    <EndTime>#Tuesday# 16:00</EndTime> \
                    <Recurrence>Yearly</Recurrence> \
                    <EndDate>#NextSaturday#</EndDate> \
                </Event> \
            </Calendar> \
        </Calendars> \
    ";

    Tx.test("ImportTests.testImportRecurring", function (tc) {

        setUp(tc, true);

        if (TestCore.verifyHostedInWwa()) {

            var now = new Date();
            var sundayDate = now.getDate() - now.getDay();

            var saturday = new Date(now.getFullYear(), now.getMonth(), sundayDate - 1);
            var sunday = new Date(now.getFullYear(), now.getMonth(), sundayDate);
            var monday = new Date(now.getFullYear(), now.getMonth(), sundayDate + 1);
            var tuesday = new Date(now.getFullYear(), now.getMonth(), sundayDate + 2);
            var wednesday = new Date(now.getFullYear(), now.getMonth(), sundayDate + 3);
            var thursday = new Date(now.getFullYear(), now.getMonth(), sundayDate + 4);
            var friday = new Date(now.getFullYear(), now.getMonth(), sundayDate + 5);
            var nextSaturday = new Date(now.getFullYear(), now.getMonth(), sundayDate + 6);
            
            var xml = replaceDate(importRecurringXml, "#Saturday#", saturday);
                xml = replaceDate(xml, "#Sunday#", sunday);
                xml = replaceDate(xml, "#Monday#", monday);
                xml = replaceDate(xml, "#Tuesday#", tuesday);
                xml = replaceDate(xml, "#Wednesday#", wednesday);
                xml = replaceDate(xml, "#Thursday#", thursday);
                xml = replaceDate(xml, "#Friday#", friday);
                xml = replaceDate(xml, "#NextSaturday#", nextSaturday);
                
            TestCore.log("Adding Recurring Event XML");
            
            errorCount = 0;
            TestCore.calendarManager.importXml(TestCore.defaultAccount, xml);
            tc.areEqual(0, errorCount, "Unexpected number of errors");

            TestCore.log("Getting Event Collection");
            var events = TestCore.calendarManager.getEvents(saturday, nextSaturday);
            TestCore.waitForCollectionCount(4 * TestCore.defaultWait, events, 26, true);
            events.lock();

            TestCore.log("Verifying Events");
            TestCore.verifyEventsByOrder(events,     
                                            ["subject", "recurring"], 
                                            [
                                                ["Daily", true],
                                                ["Weekly Sunday", true],
                                                ["Daily", true],
                                                ["Weekdays Saturday", true],
                                                ["Weekdays Sunday", true],
                                                ["Weekdays Monday", true],
                                                ["Daily", true],
                                                ["Weekdays Saturday", true],
                                                ["Weekdays Sunday", true],
                                                ["Weekdays Monday", true],
                                                ["Yearly Tuesday", true],
                                                ["Daily", true],
                                                ["Weekdays Saturday", true],
                                                ["Weekdays Sunday", true],
                                                ["Weekdays Monday", true],
                                                ["Weekly Wednesday", true],
                                                ["Daily", true],
                                                ["Weekdays Saturday", true],
                                                ["Weekdays Sunday", true],
                                                ["Weekdays Monday", true],
                                                ["Monthly Thursday", true],
                                                ["Daily", true],
                                                ["Weekdays Saturday", true],
                                                ["Weekdays Sunday", true],
                                                ["Weekdays Monday", true],
                                                ["Weekly Friday", true]
                                            ]);

            TestCore.log("Getting Series");

            TestCore.log("Verifing Daily");
            var dailySeries = events.item(0).getSeries();
            TestCore.verifyObject(dailySeries.recurrence, ["recurrenceType"], [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily]);

            TestCore.log("Verifying Weekdays Saturday");
            var weekdaysSaturday = events.item(3).getSeries();
            TestCore.verifyObject(weekdaysSaturday.recurrence, 
                                  ["recurrenceType", "dayOfWeek"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays]);

            TestCore.log("Verifying Weekdays Sunday");
            var weekdaysSunday = events.item(4).getSeries();
            TestCore.verifyObject(weekdaysSunday, ["startDate"], [new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 9)]);
            TestCore.verifyObject(weekdaysSunday.recurrence, 
                                  ["recurrenceType", "dayOfWeek"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays]);

            TestCore.log("Verifying Weekdays Monday");
            var weekdaysMonday = events.item(5).getSeries();
            TestCore.verifyObject(weekdaysMonday, ["startDate"], [new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 9, 30)]);
            TestCore.verifyObject(weekdaysMonday.recurrence, 
                                  ["recurrenceType", "dayOfWeek"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays]);

            TestCore.log("Verifying Weekly Sunday");
            var weeklySunday = events.item(1).getSeries();
            TestCore.verifyObject(weeklySunday.recurrence, 
                                  ["recurrenceType", "dayOfWeek"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.sunday]);

            TestCore.log("Verifying Weekly Wednesday");
            var weeklyWednesday = events.item(15).getSeries();
            TestCore.verifyObject(weeklyWednesday.recurrence, 
                                  ["recurrenceType", "dayOfWeek"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.wednesday]);

            TestCore.log("Verifying Weekly Friday");
            var weeklyFriday = events.item(25).getSeries();
            TestCore.verifyObject(weeklyFriday.recurrence, 
                                  ["recurrenceType", "dayOfWeek"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.friday]);

            TestCore.log("Verifying Monthly Thursday");
            var monthlyThursday = events.item(20).getSeries();
            TestCore.verifyObject(monthlyThursday.recurrence, 
                                  ["recurrenceType", "dayOfMonth"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly, thursday.getDate()]);

            TestCore.log("Verifying Yearly Tuesday");
            var yearlyTuesday = events.item(10).getSeries();
            TestCore.verifyObject(yearlyTuesday.recurrence, 
                                  ["recurrenceType", "dayOfMonth", "monthOfYear"],
                                  [Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly, tuesday.getDate(), tuesday.getMonth() + 1]);

            events.dispose();
            
        }
    });

})();

/*jshint multistr:false*/