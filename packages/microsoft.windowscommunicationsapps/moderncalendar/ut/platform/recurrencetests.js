
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    Tx.test("RecurrenceTests.testDaily", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 7, 1, 12);
            event.endDate   = new Date(2011, 7, 1, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Recurrence to Daily, Every Day");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.all;
            recurrence.interval = 1;

            TestCore.log("Verifying Daily, Every Day");
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 7, 5, 13)),
                                 [  new Date(2011, 7, 1, 12), 
                                    new Date(2011, 7, 2, 12), 
                                    new Date(2011, 7, 3, 12), 
                                    new Date(2011, 7, 4, 12), 
                                    new Date(2011, 7, 5, 12)]);

            TestCore.log("Verifying Daily, Every Other Day");
            recurrence.interval = 2;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 7, 5, 13)),
                                 [  new Date(2011, 7, 1, 12), 
                                    new Date(2011, 7, 3, 12), 
                                    new Date(2011, 7, 5, 12)]);

            TestCore.log("Verifying Daily, Every Week Day");
            recurrence.interval = 1;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays;
            event.startDate = new Date(2011, 6, 28, 12);
            event.endDate = new Date(2011, 6, 28, 13);
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 7, 8, 13)),
                                 [  new Date(2011, 6, 28, 12), 
                                    new Date(2011, 6, 29, 12), 
                                    new Date(2011, 7,  1, 12),
                                    new Date(2011, 7,  2, 12),
                                    new Date(2011, 7,  3, 12),
                                    new Date(2011, 7,  4, 12),
                                    new Date(2011, 7,  5, 12),
                                    new Date(2011, 7,  8, 12)]);

            TestCore.log("Verifying Daily, Every Other Week Day (Not supported by any UI)");
            recurrence.interval = 2;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 7, 8, 13)),
                                 [  new Date(2011, 6, 28, 12), 
                                    new Date(2011, 7,  1, 12),
                                    new Date(2011, 7,  3, 12),
                                    new Date(2011, 7,  5, 12)]);
        }
    });

    Tx.test("RecurrenceTests.testWeekly", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 7, 1, 12);
            event.endDate   = new Date(2011, 7, 1, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Recurrence to Weekly Mondays");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.monday;
            recurrence.interval = 1;

            TestCore.log("Verifying Weekly Mondays");
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 8, 1)),
                                 [  new Date(2011, 7, 1, 12), 
                                    new Date(2011, 7, 8, 12), 
                                    new Date(2011, 7, 15, 12),
                                    new Date(2011, 7, 22, 12), 
                                    new Date(2011, 7, 29, 12)]);

            TestCore.log("Setting Recurrence to Weekly Tuesdays");
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday;
            event.startDate = new Date(2011, 7, 2, 12);
            event.endDate   = new Date(2011, 7, 2, 13);
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 8, 1)),
                                 [  new Date(2011, 7, 2, 12), 
                                    new Date(2011, 7, 9, 12), 
                                    new Date(2011, 7, 16, 12),
                                    new Date(2011, 7, 23, 12),
                                    new Date(2011, 7, 30, 12)] );

            TestCore.log("Setting Recurrence to Weekly Wednesday and Thursday");
            recurrence.dayOfWeek = (Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.wednesday | Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.thursday);
            event.startDate = new Date(2011, 7, 3, 12);
            event.endDate   = new Date(2011, 7, 3, 13);
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 8, 1)),
                                 [  new Date(2011, 7, 3, 12), 
                                    new Date(2011, 7, 4, 12), 
                                    new Date(2011, 7, 10, 12),
                                    new Date(2011, 7, 11, 12),
                                    new Date(2011, 7, 17, 12),
                                    new Date(2011, 7, 18, 12),
                                    new Date(2011, 7, 24, 12),
                                    new Date(2011, 7, 25, 12),
                                    new Date(2011, 7, 31, 12)]);

            TestCore.log("Setting Recurrence to Every Other Week Wednesday and Thursday");
            recurrence.interval = 2;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 8, 1)),
                                 [  new Date(2011, 7, 3, 12), 
                                    new Date(2011, 7, 4, 12), 
                                    new Date(2011, 7, 17, 12),
                                    new Date(2011, 7, 18, 12),
                                    new Date(2011, 7, 31, 12)]);

            TestCore.log("Setting Recurrence to Every Other Week, Tuesday and Thursday");
            recurrence.dayOfWeek = (Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday | Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.thursday);
            event.startDate = new Date(2011, 7, 2, 12);
            event.endDate   = new Date(2011, 7, 2, 13);
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 8, 1)),
                                 [  new Date(2011, 7, 2, 12), 
                                    new Date(2011, 7, 4, 12), 
                                    new Date(2011, 7, 16, 12),
                                    new Date(2011, 7, 18, 12),
                                    new Date(2011, 7, 30, 12)]);

            TestCore.log("Setting First Day of Week to Wednesday");
            recurrence.firstDayOfWeek = Microsoft.WindowsLive.Platform.Calendar.FirstDayOfWeek.wednesday;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 6, 15, 12), new Date(2011, 8, 1)),
                                 [  new Date(2011, 7, 2, 12), 
                                    new Date(2011, 7, 11, 12), 
                                    new Date(2011, 7, 16, 12),
                                    new Date(2011, 7, 25, 12),
                                    new Date(2011, 7, 30, 12)]);
        }
    });

    Tx.test("RecurrenceTests.testMonthly", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 1, 1, 12);
            event.endDate   = new Date(2011, 1, 1, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Recurrence to every Month on the 1st");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly;
            recurrence.dayOfMonth = 1;
            recurrence.interval = 1;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2010, 6, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 1, 12), 
                                    new Date(2011, 2, 1, 12), 
                                    new Date(2011, 3, 1, 12),
                                    new Date(2011, 4, 1, 12),
                                    new Date(2011, 5, 1, 12),
                                    new Date(2011, 6, 1, 12)]);

            TestCore.log("Setting Recurrence to every Month on the 15th");
            recurrence.dayOfMonth = 15;
            event.startDate = new Date(2011, 1, 15, 12);
            event.endDate   = new Date(2011, 1, 15, 13);
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2010, 6, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 15, 12), 
                                    new Date(2011, 2, 15, 12), 
                                    new Date(2011, 3, 15, 12),
                                    new Date(2011, 4, 15, 12),
                                    new Date(2011, 5, 15, 12),
                                    new Date(2011, 6, 15, 12)]);

            TestCore.log("Setting Recurrence to every Month on the 31st");
            recurrence.dayOfMonth = 31;
            event.startDate = new Date(2011, 1, 28, 12);
            event.endDate   = new Date(2011, 1, 28, 13);
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2010, 6, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 28, 12), 
                                    new Date(2011, 2, 31, 12), 
                                    new Date(2011, 3, 30, 12),
                                    new Date(2011, 4, 31, 12),
                                    new Date(2011, 5, 30, 12),
                                    new Date(2011, 6, 31, 12)]);

            TestCore.log("Setting Recurrence to every other Month on the 31st");
            recurrence.interval = 2;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2010, 6, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 28, 12), 
                                    new Date(2011, 3, 30, 12),
                                    new Date(2011, 5, 30, 12)]);

            TestCore.log("Testing \"31st\" on Leap Year February");
            recurrence.interval = 2;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2012, 1, 1, 12), new Date(2012, 7, 1)),
                                 [  new Date(2012, 1, 29, 12), 
                                    new Date(2012, 3, 30, 12),
                                    new Date(2012, 5, 30, 12)]);
        }
    });

    Tx.test("RecurrenceTests.testMonthlyOnDay", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 0, 1, 12);
            event.endDate   = new Date(2011, 0, 1, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Recurrence to 1st Monday of every month");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthlyOnDay;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.monday;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.first;
            recurrence.interval = 1;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 7, 12), 
                                    new Date(2011, 2, 7, 12), 
                                    new Date(2011, 3, 4, 12),
                                    new Date(2011, 4, 2, 12),
                                    new Date(2011, 5, 6, 12),
                                    new Date(2011, 6, 4, 12)]);

            TestCore.log("Setting Recurrence to 3rd Tuesday of every month");
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.third;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 15, 12), 
                                    new Date(2011, 2, 15, 12), 
                                    new Date(2011, 3, 19, 12),
                                    new Date(2011, 4, 17, 12),
                                    new Date(2011, 5, 21, 12),
                                    new Date(2011, 6, 19, 12)]);

            TestCore.log("Setting Recurrence to Last Thursday of every month");
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.thursday;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.last;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 24, 12), 
                                    new Date(2011, 2, 31, 12), 
                                    new Date(2011, 3, 28, 12),
                                    new Date(2011, 4, 26, 12),
                                    new Date(2011, 5, 30, 12),
                                    new Date(2011, 6, 28, 12)]);

            TestCore.log("Setting Recurrence to Fourth WeekDay of every month");
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.fourth;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 4, 12), 
                                    new Date(2011, 2, 4, 12), 
                                    new Date(2011, 3, 6, 12),
                                    new Date(2011, 4, 5, 12),
                                    new Date(2011, 5, 6, 12),
                                    new Date(2011, 6, 6, 12)]);

            TestCore.log("Setting Recurrence to Last WeekendDay of every month");
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekendDays;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.last;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 27, 12), 
                                    new Date(2011, 2, 27, 12), 
                                    new Date(2011, 3, 30, 12),
                                    new Date(2011, 4, 29, 12),
                                    new Date(2011, 5, 26, 12),
                                    new Date(2011, 6, 31, 12)]);

            TestCore.log("Setting Recurrence to Last WeekendDay of every other month");
            recurrence.interval = 2;
            event.startDate = new Date(2011, 1, 27, 12);
            event.endDate   = new Date(2011, 1, 27, 13);
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 12), new Date(2011, 7, 1)),
                                 [  new Date(2011, 1, 27, 12), 
                                    new Date(2011, 3, 30, 12),
                                    new Date(2011, 5, 26, 12)]);
        }
    });

    Tx.test("RecurrenceTests.testYearly", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 1, 28, 12);
            event.endDate   = new Date(2011, 1, 28, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Recurrence to the 31st of February Every Year");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly;
            recurrence.monthOfYear = 2;
            recurrence.dayOfMonth = 31;
            recurrence.interval = 1;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 0, 1, 0), new Date(2018, 0, 1, 0)),
                                 [  new Date(2011, 1, 28, 12),
                                    new Date(2012, 1, 29, 12),
                                    new Date(2013, 1, 28, 12),
                                    new Date(2014, 1, 28, 12),
                                    new Date(2015, 1, 28, 12),
                                    new Date(2016, 1, 29, 12),
                                    new Date(2017, 1, 28, 12)]);

            TestCore.log("Setting Recurrence to the 31st of February Every Other Year");
            recurrence.interval = 2;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 0, 1, 0), new Date(2018, 0, 1, 0)),
                                 [  new Date(2011, 1, 28, 12),
                                    new Date(2013, 1, 28, 12),
                                    new Date(2015, 1, 28, 12),
                                    new Date(2017, 1, 28, 12)]);
        }
    });

    Tx.test("RecurrenceTests.testYearlyOnDay", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 2, 15, 12);
            event.endDate   = new Date(2011, 2, 15, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Recurrence to the 3rd Tuesday in March Every Year");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearlyOnDay;
            recurrence.monthOfYear = 3;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.third;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 0, 1, 0), new Date(2018, 0, 1, 0)),
                                 [  new Date(2011, 2, 15, 12),
                                    new Date(2012, 2, 20, 12),
                                    new Date(2013, 2, 19, 12),
                                    new Date(2014, 2, 18, 12),
                                    new Date(2015, 2, 17, 12),
                                    new Date(2016, 2, 15, 12),
                                    new Date(2017, 2, 21, 12)]);

            TestCore.log("Setting Recurrence to the 3rd Tuesday in March Every Other Year");
            recurrence.interval = 2;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 0, 1, 0), new Date(2018, 0, 1, 0)),
                                 [  new Date(2011, 2, 15, 12),
                                    new Date(2013, 2, 19, 12),
                                    new Date(2015, 2, 17, 12),
                                    new Date(2017, 2, 21, 12)]);
        }
    });

    Tx.test("RecurrenceTests.testLimited", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 2, 1, 12);
            event.endDate   = new Date(2011, 2, 1, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Four Daily Occurrences");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
            recurrence.occurrences = 4;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 0, 1, 0), new Date(2012, 0, 1, 0)),
                                 [  new Date(2011, 2, 1, 12),
                                    new Date(2011, 2, 2, 12),
                                    new Date(2011, 2, 3, 12),
                                    new Date(2011, 2, 4, 12)]);

            TestCore.log("Setting One Week Until");
            recurrence.until = new Date(2011, 2, 8);

            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 0, 1, 0), new Date(2012, 0, 1, 0)),
                                 [  new Date(2011, 2, 1, 12),
                                    new Date(2011, 2, 2, 12),
                                    new Date(2011, 2, 3, 12),
                                    new Date(2011, 2, 4, 12),
                                    new Date(2011, 2, 5, 12),
                                    new Date(2011, 2, 6, 12),
                                    new Date(2011, 2, 7, 12)]);

            TestCore.log("Setting Five Daily Occurrences");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
            recurrence.occurrences = 5;
            tc.areEqual(0, event.validate(), "recurrence is not valid");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 0, 1, 0), new Date(2012, 0, 1, 0)),
                                 [  new Date(2011, 2, 1, 12),
                                    new Date(2011, 2, 2, 12),
                                    new Date(2011, 2, 3, 12),
                                    new Date(2011, 2, 4, 12),
                                    new Date(2011, 2, 5, 12)]);
        }
    });

    Tx.test("RecurrenceTests.testOverlapDetection", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date("2/17/2012 12:00PM");
            event.endDate   = new Date("2/17/2012 1:00PM");
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            //
            // Daily
            //
            
            TestCore.log("Setting Recurrence to 1 Hour Daily (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 12 Hours Daily (Auto Valid)");
            event.endDate = new Date("2/18/2012 12:00AM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 24 Hours Daily (Check Valid)");
            event.endDate = new Date("2/18/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 25 Hours Daily (Check Invalid)");
            event.endDate = new Date("2/18/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 48 Hours Daily (Auto Invalid)");
            event.endDate = new Date("2/19/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is not valid");

            //
            // Weekly
            //
            
            TestCore.log("Setting Recurrence to 1 Hour Weekly (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.friday;
            event.endDate = new Date("2/17/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 6 Days Weekly (Auto Valid)");
            event.endDate = new Date("2/23/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 7 Days Weekly (Check Valid)");
            event.endDate = new Date("2/24/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 7 Days, 1 Hour Weekly (Check Invalid)");
            event.endDate = new Date("2/24/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            TestCore.log("Setting Recurrence to 14 Days Weekly (Auto Invalid)");
            event.endDate = new Date("3/2/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            //
            // Weekdays
            //
            
            TestCore.log("Setting Recurrence to 1 Hour Weekdays (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays;
            event.endDate = new Date("2/17/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 12 Hours Weekdays (Auto Valid)");
            event.endDate = new Date("2/18/2012 12:00AM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 24 Hours Weekdays (Check Valid)");
            event.endDate = new Date("2/18/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 25 Hours Weekdays (Check Invalid)");
            event.endDate = new Date("2/18/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            TestCore.log("Setting Recurrence to 48 Hours Weekdays (Auto Invalid)");
            event.endDate = new Date("2/19/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            //
            // Monday/Saturday
            //

            TestCore.log("Setting Recurrence to 1 Hour Mondays and Saturdays (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            recurrence.dayOfWeek = (Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.monday | Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.saturday);
            event.startDate = new Date("2/18/2012 12:00PM");
            event.endDate = new Date("2/18/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 24 Hours Mondays and Saturdays (Auto Valid)");
            event.endDate = new Date("2/19/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 47 Hours Mondays and Saturdays (Check Valid)");
            event.endDate = new Date("2/20/2012 11:00AM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 49 Hours Mondays and Saturdays (Check Invalid)");
            event.endDate = new Date("2/20/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            TestCore.log("Setting Recurrence to 72 Hours Mondays and Saturdays (Auto Invalid)");
            event.endDate = new Date("2/21/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            //
            // Monthly
            //

            TestCore.log("Setting Recurrence to 1 Hour Monthly (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly;
            recurrence.dayOfMonth = 17;
            event.startDate = new Date("2/17/2012 12:00PM");
            event.endDate = new Date("2/17/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 2 Weeks Monthly (Auto Valid)");
            event.endDate = new Date("3/2/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 4 Weeks (Check Valid)");
            event.endDate = new Date("3/16/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 1 Month, 1 Hour Monthly (Check Invalid)");
            event.endDate = new Date("3/17/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            TestCore.log("Setting Recurrence to 2 Months Monthly (Auto Invalid)");
            event.endDate = new Date("4/21/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            //
            // Monthly on Day
            //

            TestCore.log("Setting Recurrence to 1 Hour Monthly on Day (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.friday;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.third;
            event.startDate = new Date("2/17/2012 12:00PM");
            event.endDate = new Date("2/17/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 2 Weeks Monthly on Day (Auto Valid)");
            event.endDate = new Date("3/2/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 3 Weeks Monthly on Day (Check Valid)");
            event.endDate = new Date("3/9/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 1 Month Monthly on Day (Check Invalid)");
            event.endDate = new Date("3/17/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            TestCore.log("Setting Recurrence to 2 Months Monthly on Day (Auto Invalid)");
            event.endDate = new Date("4/17/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            //
            // Yearly
            //

            TestCore.log("Setting Recurrence to 1 Hour Yearly (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly;
            recurrence.monthOfYear = 2;
            recurrence.dayOfMonth = 17;
            event.startDate = new Date("2/17/2012 12:00PM");
            event.endDate = new Date("2/17/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 6 Months Yearly (Auto Valid)");
            event.endDate = new Date("8/17/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 365 Days Yearly (Check Valid)");
            event.endDate = new Date("2/16/2013 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 366 Days Yearly (Check Invalid)");
            event.endDate = new Date("2/17/2013 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            TestCore.log("Setting Recurrence to 2 Years Yearly (Auto Invalid)");
            event.endDate = new Date("2/16/2014 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            //
            // Yearly on Day
            //

            TestCore.log("Setting Recurrence to 1 Hour Yearly on Day (Auto Valid)");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly;
            recurrence.monthOfYear = 2;
            recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.friday;
            recurrence.weekOfMonth = Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.third;
            event.startDate = new Date("2/17/2012 12:00PM");
            event.endDate = new Date("2/17/2012 1:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 6 Months Yearly on Day (Auto Valid)");
            event.endDate = new Date("8/17/2012 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 357 Days Yearly on Day (Check Valid)");
            event.endDate = new Date("2/8/2013 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.success, event.validate(), "recurrence is not valid");

            TestCore.log("Setting Recurrence to 366 Days Yearly on Day (Check Invalid)");
            event.endDate = new Date("2/17/2013 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");

            TestCore.log("Setting Recurrence to 2 Years Yearly on Day (Auto Invalid)");
            event.endDate = new Date("2/16/2014 12:00PM");
            tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.Status.errorRecurrenceInvalid, event.validate(), "recurrence is valid");
            
        }
    });

    Tx.test("RecurrenceTests.testTimezone", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa() &&
            TestCore.verifyIsPST()) {

            var tzarizona = {
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
                standardName: "US Mountain Standard Time",
                daylightName: "US Mountain Daylight Time",
                bias: 420,
                standardBias: 0,
                daylightBias: 0
            };

            var tzeastern = {
                standardDate: {
                    wYear: 0,
                    wMonth: 11,
                    wDayOfWeek: 0,
                    wDay: 1,
                    wHour: 2,
                    wMinute: 0,
                    wSecond: 0,   
                    wMilliseconds: 0
                },
                daylightDate: {
                    wYear: 0,
                    wMonth: 3,
                    wDayOfWeek: 0,
                    wDay: 2,
                    wHour: 2,
                    wMinute: 0,
                    wSecond: 0,
                    wMilliseconds: 0
                },
                standardName: "Eastern Standard Time",
                daylightName: "Eastern Daylight Time",
                bias: 300,
                standardBias: 0,
                daylightBias: -60
            };

            // This tzinfo is fictituous.  We use it to test the
            // application of an unkonwn timezone information
            var tzwl = {
                standardDate: {
                    wYear: 0,
                    wMonth: 11,
                    wDayOfWeek: 0,
                    wDay: 1,
                    wHour: 2,
                    wMinute: 0,
                    wSecond: 0,   
                    wMilliseconds: 0
                },
                daylightDate: {
                    wYear: 0,
                    wMonth: 3,
                    wDayOfWeek: 0,
                    wDay: 2,
                    wHour: 2,
                    wMinute: 0,
                    wSecond: 0,
                    wMilliseconds: 0
                },
                standardName: "WindowsLive Standard Time",
                daylightName: "WindowsLive Daylight Time",
                bias: 0,
                standardBias: -60,
                daylightBias: 0
            };

            // This tzinfo is fictituous.  We use it to test the
            // creation of standardName and daylightName in their
            // absences
            var tznames = {
                standardDate: {
                    wYear: 0,
                    wMonth: 11,
                    wDayOfWeek: 0,
                    wDay: 1,
                    wHour: 2,
                    wMinute: 0,
                    wSecond: 0,   
                    wMilliseconds: 0
                },
                daylightDate: {
                    wYear: 0,
                    wMonth: 3,
                    wDayOfWeek: 0,
                    wDay: 2,
                    wHour: 2,
                    wMinute: 0,
                    wSecond: 0,
                    wMilliseconds: 0
                },
                standardName: "",
                daylightName: "",
                bias: 0,
                standardBias: 0,
                daylightBias: 0
            };
            
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            TestCore.log("Creating Event");
            var event = calendar.createEvent();
            tc.isNotNull(event, "Failed to create event");

            TestCore.log("Setting Event Properties");
            event.startDate = new Date(2011, 1, 1, 12);
            event.endDate   = new Date(2011, 1, 1, 13);
            event.recurring = true;

            TestCore.log("Getting Recurrence");
            var recurrence = event.recurrence;
            tc.isNotNull(recurrence, "Failed to retrieve recurrence");

            TestCore.log("Setting Daily Recurrence");
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;

            TestCore.log("Testing during PST");
            tc.areEqual("Pacific Standard Time", event.timeZoneId);
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 0), new Date(2011, 1, 2, 0)),
                                 [  new Date(2011, 1, 1, 12) ]);

            TestCore.log("Testing during PDT");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 3, 1, 0), new Date(2011, 3, 2, 0)),
                                 [  new Date(2011, 3, 1, 12) ]);

            TestCore.log("Changing Event to Arizona Time (no DST)");
            event.setTimezone(tzarizona);
            tc.areEqual("US Mountain Standard Time", event.timeZoneId);

            TestCore.log("Testing during PST");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 0), new Date(2011, 1, 2, 0)),
                                 [  new Date(2011, 1, 1, 12) ]);

            TestCore.log("Testing during PDT");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 3, 1, 0), new Date(2011, 3, 2, 0)),
                                 [  new Date(2011, 3, 1, 13) ]);

            TestCore.log("Changing Event to Eastarn Time");
            event.setTimezone(tzeastern);
            tc.areEqual("Eastern Standard Time", event.timeZoneId);

            TestCore.log("Testing during PST");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 0), new Date(2011, 1, 2, 0)),
                                 [  new Date(2011, 1, 1, 12) ]);

            TestCore.log("Testing during PDT");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 3, 1, 0), new Date(2011, 3, 2, 0)),
                                 [  new Date(2011, 3, 1, 12) ]);

            TestCore.log("Changing Event to \"WindowsLive\" Time");
            event.setTimezone(tzwl);

            TestCore.log("Testing during PST");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 1, 1, 0), new Date(2011, 1, 2, 0)),
                                 [  new Date(2011, 1, 1, 12) ]);

            TestCore.log("Testing during PDT");
            TestCore.verifyDates(recurrence.getOccurrences(new Date(2011, 3, 1, 0), new Date(2011, 3, 2, 0)),
                                 [  new Date(2011, 3, 1, 14) ]);

            TestCore.log("Test Name Creation in UTC");
            event.setTimezone(tznames);
            var result = event.getTimezone();
            tc.areEqual("UTC", result.standardName, "Unexpected Standard Name");
            tc.areEqual("UTC", result.daylightName, "Unexpected Daylight Name");

            TestCore.log("Test Name Creation with Whole Hours");
            tznames.bias = 420;
            tznames.standardBias = 60;
            tznames.daylightBias = -60;
            event.setTimezone(tznames);
            result = event.getTimezone();
            tc.areEqual("UTC-08:00", result.standardName, "Unexpected Standard Name");
            tc.areEqual("UTC-06:00", result.daylightName, "Unexpected Daylight Name");

            TestCore.log("Test Name Creation with Negative Whole Hours");
            tznames.bias = -420;
            tznames.standardBias = 60;
            tznames.daylightBias = -60;
            event.setTimezone(tznames);
            result = event.getTimezone();
            tc.areEqual("UTC+06:00", result.standardName, "Unexpected Standard Name");
            tc.areEqual("UTC+08:00", result.daylightName, "Unexpected Daylight Name");

            TestCore.log("Test Name Creation with Fractional Hours");
            tznames.bias = 0;
            tznames.standardBias = 510;
            tznames.daylightBias = -510;
            event.setTimezone(tznames);
            result = event.getTimezone();
            tc.areEqual("UTC-08:30", result.standardName, "Unexpected Standard Name");
            tc.areEqual("UTC+08:30", result.daylightName, "Unexpected Daylight Name");

            TestCore.log("Test TZID Match with wrong standard name");
            tzeastern.standardName = "";
            tzeastern.daylightName = "";
            event.setTimezone(tzeastern);
            tc.areEqual("Eastern Standard Time", event.timeZoneId);

            TestCore.log("Test TZID Match with wrong rules");
            tzarizona.bias = 425;
            event.setTimezone(tzarizona);
            tc.areEqual("US Mountain Standard Time", event.timeZoneId);

            TestCore.log("Test Setting TZID");
            event.timeZoneId = "Tasmania Standard Time";
            var tz = event.getTimezone();
            tc.areEqual(-600, tz.bias);
            tc.areEqual(0, tz.standardBias);
            tc.areEqual(-60, tz.daylightBias);

            TestCore.log("Test expansion across tz rule boundary");
            event.timeZoneId = "Pacific Standard Time";
            event.startDate = new Date(2005, 1, 25, 12);
            event.endDate = new Date(2005, 1, 25, 13);
            recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly;
            recurrence.dayOfMonth = 25;

            TestCore.verifyDates(recurrence.getOccurrences(new Date("1/1/2006"), new Date("1/1/2007")),
                                 [new Date("1/25/2006 12:00PM"),
                                  new Date("2/25/2006 12:00PM"),
                                  new Date("3/25/2006 12:00PM"),
                                  new Date("4/25/2006 12:00PM"),
                                  new Date("5/25/2006 12:00PM"),
                                  new Date("6/25/2006 12:00PM"),
                                  new Date("7/25/2006 12:00PM"),
                                  new Date("8/25/2006 12:00PM"),
                                  new Date("9/25/2006 12:00PM"),
                                  new Date("10/25/2006 12:00PM"),
                                  new Date("11/25/2006 12:00PM"),
                                  new Date("12/25/2006 12:00PM")]);

            TestCore.verifyDates(recurrence.getOccurrences(new Date("1/1/2011"), new Date("1/1/2012")),
                                [new Date("1/25/2011 12:00PM"),
                                 new Date("2/25/2011 12:00PM"),
                                 new Date("3/25/2011 12:00PM"),
                                 new Date("4/25/2011 12:00PM"),
                                 new Date("5/25/2011 12:00PM"),
                                 new Date("6/25/2011 12:00PM"),
                                 new Date("7/25/2011 12:00PM"),
                                 new Date("8/25/2011 12:00PM"),
                                 new Date("9/25/2011 12:00PM"),
                                 new Date("10/25/2011 12:00PM"),
                                 new Date("11/25/2011 12:00PM"),
                                 new Date("12/25/2011 12:00PM")]);

        }
    });

    Tx.test("RecurrenceTests.testImplicit", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var May7Start = new Date("5/7/2013 12:00PM"); // Tuesday, May 7, 2013, in the First Week
            var May7End = new Date("5/7/2013 1:00PM");
            var May31Start = new Date("5/31/2013 12:00PM"); // Friday, May 31, 2013, in the Last (5th) Week
            var May31End = new Date("5/31/2013 1:00PM");
            var June31End = new Date("6/30/2013"); // An end date of 1 month just to keep the expansion cost down

            TestCore.log("Creating event");
            var ev = calendar.createEvent();
            ev.startDate = May7Start;
            ev.endDate = May7End;
            ev.recurring = true;
            ev.recurrence.until = June31End;

            TestCore.log("Testing Weekly on 7th");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            tc.areEqual(ev.recurrence.dayOfWeek, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, 0, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 0, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 0, "Unexpected monthOfYear");

            TestCore.log("Testing Monthly on 7th");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly;
            tc.areEqual(ev.recurrence.dayOfWeek, 0, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, 0, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 7, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 0, "Unexpected monthOfYear");

            TestCore.log("Testing MonthlyOnDay on 7th");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthlyOnDay;
            tc.areEqual(ev.recurrence.dayOfWeek, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.first, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 0, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 0, "Unexpected monthOfYear");

            TestCore.log("Testing Yearly on 7th");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly;
            tc.areEqual(ev.recurrence.dayOfWeek, 0, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, 0, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 7, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 5, "Unexpected monthOfYear");

            TestCore.log("Testing YearlyyOnDay on 7th");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearlyOnDay;
            tc.areEqual(ev.recurrence.dayOfWeek, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.tuesday, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.first, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 0, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 5, "Unexpected monthOfYear");

            ev.startDate = May31Start;
            ev.endDate = May31End;

            TestCore.log("Testing Weekly on 31st");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
            tc.areEqual(ev.recurrence.dayOfWeek, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.friday, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, 0, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 0, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 0, "Unexpected monthOfYear");

            TestCore.log("Testing Monthly on 31st");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly;
            tc.areEqual(ev.recurrence.dayOfWeek, 0, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, 0, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 31, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 0, "Unexpected monthOfYear");

            TestCore.log("Testing MonthlyOnDay on 31st");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthlyOnDay;
            tc.areEqual(ev.recurrence.dayOfWeek, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.friday, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.last, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 0, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 0, "Unexpected monthOfYear");

            TestCore.log("Testing Yearly on 31st");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly;
            tc.areEqual(ev.recurrence.dayOfWeek, 0, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, 0, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 31, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 5, "Unexpected monthOfYear");

            TestCore.log("Testing YearlyyOnDay on 31st");
            ev.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearlyOnDay;
            tc.areEqual(ev.recurrence.dayOfWeek, Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.friday, "Unexpected dayOfWeek");
            tc.areEqual(ev.recurrence.weekOfMonth, Microsoft.WindowsLive.Platform.Calendar.WeekOfMonth.last, "Unexpected weekOfMonth");
            tc.areEqual(ev.recurrence.dayOfMonth, 0, "Unexpected dayOfMonth");
            tc.areEqual(ev.recurrence.monthOfYear, 5, "Unexpected monthOfYear");
        }
    });

})();


