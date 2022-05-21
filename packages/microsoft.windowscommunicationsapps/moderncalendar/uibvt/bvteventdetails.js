
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,EventDetailsLib,QuickEventLib,BVT,CalendarLib,WinJS*/


// Event Details tests
(function () {

    var NAME = 0;
    var EMAIL = 1;
    
    // Cleanup function that cleans up after running a test.
    function cleanup (tc) {
        tc.start();
    }

    function VerifyTitle (tc, title) {
        tc.strictEqual(EventDetailsLib.title(), title, "Title didn't get set.");
    }
    function VerifyLocation (tc, location) {
        tc.strictEqual(EventDetailsLib.location(), location, "Location didn't get set.");
    }
    function VerifyPrivacy (tc, privacy) {
        tc.strictEqual(EventDetailsLib.isPrivate(), privacy, "Privacy not set correctly.");
    }
    function VerifyReminder (tc, reminder) {
        tc.strictEqual(EventDetailsLib.reminder(), reminder, "Reminder not set correctly");
    }
    function VerifyBusyStatus (tc, busyStatus) {
        tc.strictEqual(EventDetailsLib.busyStatus(), busyStatus, "Busy status not set correctly");
    }
    function VerifyDuration (tc, duration) {
        tc.strictEqual(EventDetailsLib.duration(), duration, "Duration not set correctly");
    }
    function VerifyRecurrence (tc, recurrence) {
        tc.strictEqual(EventDetailsLib.recurrence(), recurrence, "Recurrence not set correctly");
    }
    function VerifyDate (tc, theDate) {
        var dateOnly = new Date(theDate.getFullYear(), theDate.getMonth(), theDate.getDate());
        var hour24 = theDate.getHours();
        var hour = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);  // Handle 12am case
        var minute = theDate.getMinutes();
        var ampm = hour24 < 12 ? "AM" : "PM";
        tc.strictEqual(EventDetailsLib.startDate().toUTCString(), dateOnly.toUTCString(), "Date not set correctly");
        tc.strictEqual(EventDetailsLib.hour(), hour, "Hour not set correctly");
        tc.strictEqual(EventDetailsLib.minute(), minute, "Minute not set correctly");
        tc.strictEqual(EventDetailsLib.ampm(), ampm, "AM/PM not set correctly");
    }
    function VerifyAttendeesPresent(attendees) {
        for (var i = 0; i < attendees.length; i++) {
            EventDetailsLib.attendeeFind(attendees[i][NAME], attendees[i][EMAIL]);  // function asserts
        }
    }

    /// Creates an event, finds it, reopens it, verifies the properties that were set, and then deletes it
    ///
    /// TODO - Should be updated to verify the event is officially gone from MonthView
    BVT.Test("EventDetails_DeleteEvent", {"owner":"stevenry"}, function (tc) {
        tc.stop();
        
        // Set the title and location for this event. Date().getTime() ensures the event name is unique for this test.
        var title = "Purple " + (new Date().getTime());
        var location = "Building 85";
        var today = new Date();
        var theDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30);
        var busyStatus = EventDetailsLib.busyStatusTentative;
        var reminder = EventDetailsLib.reminderOneHour;
        var duration = EventDetailsLib.durationNinetyMins;
        var recurrence = EventDetailsLib.recurrenceNone;

        var privacy = true;
        var eventForViewChange;

        // Create an event with the specified details.
        CalendarLib.dayView()
        .then(function () {
            eventForViewChange = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView());
            return CalendarLib.createEvent();
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.location(location);
                EventDetailsLib.isPrivate(privacy);
                EventDetailsLib.reminder(reminder);
                EventDetailsLib.busyStatus(busyStatus);
                EventDetailsLib.duration(duration);
                EventDetailsLib.recurrence(recurrence);
                EventDetailsLib.setDateAndTime(theDate);
                complete();
            });
        })
        .then(function () { return EventDetailsLib.saveEvent(eventForViewChange); })
        .then(function () { return CalendarLib.openEvent(title); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                VerifyTitle(tc, title);
                VerifyLocation(tc, location);
                VerifyPrivacy(tc, privacy);
                VerifyReminder(tc, reminder);
                VerifyBusyStatus(tc, busyStatus);
                VerifyDuration(tc, duration);
                VerifyRecurrence(tc, recurrence);
                VerifyDate(tc, theDate);
                complete();
            });
        })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .done(function () {            
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });    
    });

    BVT.Test("EventDetails_SendEvent", { "owner": "stevenry" }, function (tc) {
        tc.stop();

        // Set the title and location for this event. Date().getTime() ensures the event name is unique for this test.
        var title = "Green " + (new Date().getTime());
        var location = "Building 50";
        var today = new Date();
        var theDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() - 3, 0);
        var attendees = [["Test1", "test1@fake.com"], ["Test2", "test2@fake.com"]];

        var eventForViewChange;

        CalendarLib.dayView()
        .then(function () {
            eventForViewChange = CalendarLib.dayViewChangeEventText;
            return CalendarLib.createEvent();
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.location(location);
                EventDetailsLib.setDateAndTime(theDate);

                EventDetailsLib.attendeeAdd(attendees[0][NAME], attendees[0][EMAIL]);
                EventDetailsLib.attendeeAdd(attendees[1][NAME], attendees[1][EMAIL]);

                complete();
            });
        })
        .then(function () { return EventDetailsLib.sendEvent(eventForViewChange); })
        .then(function () { return CalendarLib.openEvent(title); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                VerifyTitle(tc, title);
                VerifyLocation(tc, location);
                VerifyDate(tc, theDate);
                VerifyAttendeesPresent(attendees);
                complete();
            });
        })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });
})();  // Event Details tests end

// Quick Event tests
(function () {
    function cleanup (tc) {
        tc.start();
    }

    /// Opens Quick Event Creation on day view, populates with data, launches Event Details,
    /// and verifies the data was carried over correctly.
    ///
    /// TODO - update to iterate through all views
    BVT.Test("QuickEvent_LaunchEventDetails", {"owner": "stevenry"}, function (tc) {
        tc.stop();

        var now = new Date();
        var title = "QuickEvent " + (now.getTime());
        var location = "Building Infinity";

        CalendarLib.dayView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            // Click on today @ 12pm
            return QuickEventLib.invokeQuickEventCreation(12);
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                QuickEventLib.title(title);
                QuickEventLib.location(location);
                complete();
            });
        })
        .then(function () {
            return QuickEventLib.goToEventDetails();
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                Tx.assert(EventDetailsLib.title() === title, "Title not carried over");
                Tx.assert(EventDetailsLib.location() === location, "Location not carried over");
                Tx.assert(EventDetailsLib.startDate() - new Date(now.getYear(), now.getMonth(), now.getDate()) === 0, "Date not carried over");
                Tx.assert(EventDetailsLib.hour() === 12, "Hour not carried over");
                Tx.assert(EventDetailsLib.minute() === 0, "Minute not carried over");
                complete();
            });
        })
        .then(function () {
            return EventDetailsLib.closeEvent(CalendarLib.getEventForViewChanged("dayview"), true);
        })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });
})();  // Quick Event tests end