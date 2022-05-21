
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore*/

(function () {

    Tx.test("ReminderTests.testSingle", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();
            var day = dtNow.getDate();

            TestCore.log("Getting Reminder");
            var reminders = TestCore.calendarManager.getReminders(new Date(year, month, day), new Date(year, month, day + 1));
            tc.areEqual(0, reminders.count);

            TestCore.log("Creating early event");
            var event1 = calendar.createEvent();
            event1.subject = "Early Event";
            event1.startDate = new Date(year, month, day - 1, 12);
            event1.endDate = new Date(year, month, day - 1, 13);
            event1.reminder = 60;
            event1.commit();

            TestCore.log("Creating late event");
            var event2 = calendar.createEvent();
            event2.subject = "Late Event";
            event2.startDate = new Date(year, month, day + 1, 12);
            event2.endDate = new Date(year, month, day + 1, 13);
            event2.reminder = 60;
            event2.commit();

            TestCore.log("Creating wholly contained event");
            var event3 = calendar.createEvent();
            event3.subject = "Contained Event";
            event3.startDate = new Date(year, month, day, 12);
            event3.endDate = new Date(year, month, day, 13);
            event3.reminder = 60;
            event3.commit();

            TestCore.log("Creating early overlap event");
            var event4 = calendar.createEvent();
            event4.subject = "Early Overlap Event";
            event4.startDate = new Date(year, month, day - 1, 23, 30);
            event4.endDate = new Date(year, month, day, 0, 30);
            event4.reminder = 60;
            event4.commit();

            TestCore.log("Creating late overlap event");
            var event5 = calendar.createEvent();
            event5.subject = "Late Overlap Event";
            event5.startDate = new Date(year, month, day + 1, 0, 30);
            event5.endDate = new Date(year, month, day + 1, 1, 30);
            event5.reminder = 60;
            event5.commit();

            TestCore.verifyNotifications(reminders, 3, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Early Overlap Event", new Date(year, month, day-1, 22, 30), new Date(year, month, day-1, 23, 30)],
                                            ["Contained Event", new Date(year, month, day, 11), new Date(year, month, day, 12)],
                                            ["Late Overlap Event", new Date(year, month, day, 23, 30), new Date(year, month, day + 1, 0, 30)]
                                         ]);

            TestCore.log("Remove Late Overlap Event");
            event5.reminder = -1;
            event5.commit();

            TestCore.verifyNotifications(reminders, TestCore.ignoreValue, TestCore.ignoreValue, 1);

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Early Overlap Event", new Date(year, month, day-1, 22, 30), new Date(year, month, day-1, 23, 30)],
                                            ["Contained Event", new Date(year, month, day, 11), new Date(year, month, day, 12)]
                                         ]);

            TestCore.log("Changing Reminder for Wholly Contained Event");
            event3.reminder = 120;
            event3.commit();

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Early Overlap Event", new Date(year, month, day-1, 22, 30), new Date(year, month, day-1, 23, 30)],
                                            ["Contained Event", new Date(year, month, day, 10), new Date(year, month, day, 12)]
                                         ]);

            TestCore.log("Changing Start Time for Wholly Contained Event");
            event3.startDate = new Date(year, month, day, 11);
            event3.endDate = new Date(year, month, day, 12);
            event3.commit();

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Early Overlap Event", new Date(year, month, day-1, 22, 30), new Date(year, month, day-1, 23, 30)],
                                            ["Contained Event", new Date(year, month, day, 9), new Date(year, month, day, 11)]
                                         ]);

            reminders.dispose();
            
        }
    });

    Tx.test("ReminderTests.testSeries", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();
            var day = dtNow.getDate();

            TestCore.log("Getting Reminder");
            var reminders = TestCore.calendarManager.getReminders(new Date(year, month, day), new Date(year, month, day + 7));
            tc.areEqual(0, reminders.count);

            TestCore.log("Creating Recurring Appointment");
            var event = calendar.createEvent();
            event.subject = "Recurring Event";
            event.startDate = new Date(year, month, day, 12);
            event.endDate = new Date(year, month, day, 13);
            event.reminder = 15;
            event.recurring = true;
            event.recurrence.occurrences = 7;
            event.commit();

            TestCore.verifyNotifications(reminders, 7, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 11, 45), new Date(year, month, day    , 12)],
                                            ["Recurring Event", new Date(year, month, day + 1, 11, 45), new Date(year, month, day + 1, 12)],
                                            ["Recurring Event", new Date(year, month, day + 2, 11, 45), new Date(year, month, day + 2, 12)],
                                            ["Recurring Event", new Date(year, month, day + 3, 11, 45), new Date(year, month, day + 3, 12)],
                                            ["Recurring Event", new Date(year, month, day + 4, 11, 45), new Date(year, month, day + 4, 12)],
                                            ["Recurring Event", new Date(year, month, day + 5, 11, 45), new Date(year, month, day + 5, 12)],
                                            ["Recurring Event", new Date(year, month, day + 6, 11, 45), new Date(year, month, day + 6, 12)]
                                         ]);

            TestCore.log("Changing reminder");
            event.reminder = 60;
            event.commit();

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 11), new Date(year, month, day    , 12)],
                                            ["Recurring Event", new Date(year, month, day + 1, 11), new Date(year, month, day + 1, 12)],
                                            ["Recurring Event", new Date(year, month, day + 2, 11), new Date(year, month, day + 2, 12)],
                                            ["Recurring Event", new Date(year, month, day + 3, 11), new Date(year, month, day + 3, 12)],
                                            ["Recurring Event", new Date(year, month, day + 4, 11), new Date(year, month, day + 4, 12)],
                                            ["Recurring Event", new Date(year, month, day + 5, 11), new Date(year, month, day + 5, 12)],
                                            ["Recurring Event", new Date(year, month, day + 6, 11), new Date(year, month, day + 6, 12)]
                                         ]);

            TestCore.log("Changing start time");
            event.startDate = new Date(year, month, day, 10);
            event.commit();

            TestCore.verifyNotifications(reminders, 7, TestCore.ignoreValue, 7);

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 9), new Date(year, month, day    , 10)],
                                            ["Recurring Event", new Date(year, month, day + 1, 9), new Date(year, month, day + 1, 10)],
                                            ["Recurring Event", new Date(year, month, day + 2, 9), new Date(year, month, day + 2, 10)],
                                            ["Recurring Event", new Date(year, month, day + 3, 9), new Date(year, month, day + 3, 10)],
                                            ["Recurring Event", new Date(year, month, day + 4, 9), new Date(year, month, day + 4, 10)],
                                            ["Recurring Event", new Date(year, month, day + 5, 9), new Date(year, month, day + 5, 10)],
                                            ["Recurring Event", new Date(year, month, day + 6, 9), new Date(year, month, day + 6, 10)]
                                         ]);

            reminders.dispose();

        }
    });

    Tx.test("ReminderTests.testExceptions", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(calendar, "Failed to create calendar");

            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();
            var day = dtNow.getDate();

            TestCore.log("Getting Reminder");
            var reminders = TestCore.calendarManager.getReminders(new Date(year, month, day), new Date(year, month, day + 7));
            tc.areEqual(0, reminders.count);

            TestCore.log("Creating Recurring Appointment");
            var event = calendar.createEvent();
            event.subject = "Recurring Event";
            event.startDate = new Date(year, month, day, 12);
            event.endDate = new Date(year, month, day, 13);
            event.reminder = 15;
            event.recurring = true;
            event.recurrence.occurrences = 7;
            event.commit();

            TestCore.verifyNotifications(reminders, 7, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 11, 45), new Date(year, month, day    , 12)],
                                            ["Recurring Event", new Date(year, month, day + 1, 11, 45), new Date(year, month, day + 1, 12)],
                                            ["Recurring Event", new Date(year, month, day + 2, 11, 45), new Date(year, month, day + 2, 12)],
                                            ["Recurring Event", new Date(year, month, day + 3, 11, 45), new Date(year, month, day + 3, 12)],
                                            ["Recurring Event", new Date(year, month, day + 4, 11, 45), new Date(year, month, day + 4, 12)],
                                            ["Recurring Event", new Date(year, month, day + 5, 11, 45), new Date(year, month, day + 5, 12)],
                                            ["Recurring Event", new Date(year, month, day + 6, 11, 45), new Date(year, month, day + 6, 12)]
                                         ]);

            TestCore.log("Creating Reminder Exception");
            var occurrence1 = event.getOccurrence(new Date(year, month, day + 1, 12));
            occurrence1.reminder = 60;
            occurrence1.commit();

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 11, 45), new Date(year, month, day    , 12)],
                                            ["Recurring Event", new Date(year, month, day + 1, 11),     new Date(year, month, day + 1, 12)],
                                            ["Recurring Event", new Date(year, month, day + 2, 11, 45), new Date(year, month, day + 2, 12)],
                                            ["Recurring Event", new Date(year, month, day + 3, 11, 45), new Date(year, month, day + 3, 12)],
                                            ["Recurring Event", new Date(year, month, day + 4, 11, 45), new Date(year, month, day + 4, 12)],
                                            ["Recurring Event", new Date(year, month, day + 5, 11, 45), new Date(year, month, day + 5, 12)],
                                            ["Recurring Event", new Date(year, month, day + 6, 11, 45), new Date(year, month, day + 6, 12)]
                                         ]);

            TestCore.log("Creating Start Date Exception");
            var occurrence2 = event.getOccurrence(new Date(year, month, day + 2, 12));
            occurrence2.startDate = new Date(year, month, day + 2, 11);
            occurrence2.commit();

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 11, 45), new Date(year, month, day    , 12)],
                                            ["Recurring Event", new Date(year, month, day + 1, 11),     new Date(year, month, day + 1, 12)],
                                            ["Recurring Event", new Date(year, month, day + 2, 10, 45), new Date(year, month, day + 2, 11)],
                                            ["Recurring Event", new Date(year, month, day + 3, 11, 45), new Date(year, month, day + 3, 12)],
                                            ["Recurring Event", new Date(year, month, day + 4, 11, 45), new Date(year, month, day + 4, 12)],
                                            ["Recurring Event", new Date(year, month, day + 5, 11, 45), new Date(year, month, day + 5, 12)],
                                            ["Recurring Event", new Date(year, month, day + 6, 11, 45), new Date(year, month, day + 6, 12)]
                                         ]);

            TestCore.log("Changing series reminder");
            event.reminder = 30;
            event.commit();

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 11, 30), new Date(year, month, day    , 12)],
                                            ["Recurring Event", new Date(year, month, day + 1, 11),     new Date(year, month, day + 1, 12)],
                                            ["Recurring Event", new Date(year, month, day + 2, 10, 30), new Date(year, month, day + 2, 11)],
                                            ["Recurring Event", new Date(year, month, day + 3, 11, 30), new Date(year, month, day + 3, 12)],
                                            ["Recurring Event", new Date(year, month, day + 4, 11, 30), new Date(year, month, day + 4, 12)],
                                            ["Recurring Event", new Date(year, month, day + 5, 11, 30), new Date(year, month, day + 5, 12)],
                                            ["Recurring Event", new Date(year, month, day + 6, 11, 30), new Date(year, month, day + 6, 12)]
                                         ]);

            TestCore.log("Modifying Exceptions");
            occurrence1.reminder = 120;
            occurrence1.commit();
            occurrence2.startDate = new Date(year, month, day + 2, 10);
            occurrence2.commit();

            TestCore.verifyEventsByOrder(reminders,
                                         ["subject", "reminderTime", "startDate"],
                                         [
                                            ["Recurring Event", new Date(year, month, day    , 11, 30), new Date(year, month, day    , 12)],
                                            ["Recurring Event", new Date(year, month, day + 1, 10),     new Date(year, month, day + 1, 12)],
                                            ["Recurring Event", new Date(year, month, day + 2, 9,  30), new Date(year, month, day + 2, 10)],
                                            ["Recurring Event", new Date(year, month, day + 3, 11, 30), new Date(year, month, day + 3, 12)],
                                            ["Recurring Event", new Date(year, month, day + 4, 11, 30), new Date(year, month, day + 4, 12)],
                                            ["Recurring Event", new Date(year, month, day + 5, 11, 30), new Date(year, month, day + 5, 12)],
                                            ["Recurring Event", new Date(year, month, day + 6, 11, 30), new Date(year, month, day + 6, 12)]
                                         ]);

            reminders.dispose();

        }
    });
})();