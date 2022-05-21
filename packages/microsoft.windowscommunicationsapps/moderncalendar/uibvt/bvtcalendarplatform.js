
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Jx,Tx,EventDetailsLib,Microsoft,BVT,MessageBar,CalendarLib,CalendarPlatformLib*/

(function () {
    
    var calendarManager;
    var testHarness;
    // Cleanup function that cleans up after running a test.
    function cleanup (tc) {
        if (calendarManager) {
            calendarManager.dumpStore();
        }
        MessageBar.closeAll();
        tc.start();
    }

    function setup (tc) {
        tc.stop();
        calendarManager = Jx.root._platform.calendarManager;
        testHarness = Jx.root._harness;
        tc.areNotEqual(undefined, calendarManager, "calendarManager is undefined");
        tc.areNotEqual(null, calendarManager, "calendarManager is null");
        calendarManager.dumpStore();
    }

    /// Verify that the error message without a valid event just has the 'Close' button.
    //  NEW:  This is an example data-driven Tx test.
    BVT.Test("CalendarPlatform_ErrorNoEvent", {
        "owner": "dalowe", "data": [
                    { "iterationName": "ShortTitle", "value": "Short title" },
                    { "iterationName": "MediumTitle", "value": "This is a medium error message" },
                    { "iterationName": "LongTitle", "value": "This title is the longest <b>error</b> message of them all." }
        ]
    }, function (tc) {
       setup(tc);

       var eventToClose = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView());
       var errorMessage = this.value;
       calendarManager.addCalendarError(errorMessage, Microsoft.WindowsLive.Platform.Calendar.ErrorPriority.lowest);

       MessageBar.waitUntilShown(5000)
       .then(function () {
          tc.areEqual(errorMessage, MessageBar.messageHtml, "Error message is incorrect.");
          tc.isTrue(MessageBar.button1.hasClass("mbhidden"), "Expected 'button1' to be hidden on the Message Bar since it should only have a 'Close' button (button2)");
          MessageBar.button2.click();
          return EventDetailsLib.waitUntilShown(5000);
       })
       .then(function () {
           return EventDetailsLib.closeEvent(eventToClose);
       })
       .done(function (/*success*/) {
          tc.error("Expected a timeout waiting for event details to load because there is no event.");
          cleanup(tc);
       }, function (/*error*/) {
          // Error should always fire here.
          cleanup(tc);
       });
    }),
        

    /// Creates an event, sets an error on that event, verifies that the message bar
    /// displays with the correct options, and clicks the "open event" button to
    /// show the event in event details.
    BVT.Test("CalendarPlatform_ErrorWithEvent", {"owner": "dalowe"}, function (tc) {
        setup(tc);

        var eventToClose = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView());
        var event = null;
        var errorMessage = "Foobar";

        event = CalendarPlatformLib.addEvent();
        var eventHandle = event.handle;

        calendarManager.addCalendarError(errorMessage, Microsoft.WindowsLive.Platform.Calendar.ErrorPriority.lowest, eventHandle);

        MessageBar.waitUntilShown(5000)
        .then(function () {
            tc.areEqual(errorMessage, MessageBar.messageHtml, "Error message is incorrect.");
            MessageBar.button1.click();
            return EventDetailsLib.waitUntilShown(5000);
        })
        .then(function () {
           tc.areEqual(EventDetailsLib.title(), event.subject);
           return EventDetailsLib.closeEvent(eventToClose);
        })
        .done(function () {
            // Success
            cleanup(tc);
        }, function (failure) {
            // Failure
            tc.error(failure);
            cleanup(tc);
        });
    }),
    
    // Force collection of calendar platform reporting data (although it doesn't actually report)
    BVT.Test("CalendarPlatform_Reporting", { "owner": "dalowe" }, function (tc) {
        setup(tc);

        var props = { "startDate": new Date(2013, 6, 1, 13, 30), "endDate": new Date(2013, 6, 1, 15, 30) };
        var event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;
                
        event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;
        Tx.log("Add all-day weekday recurrence.");
        event.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
        event.recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays;        
        event.recurrence.interval = 1;
        event.allDayEvent = true;
        event.commit();

        event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;
        Tx.log("Add Daily recurrence.");
        event.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
        event.recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.all;
        event.recurrence.interval = 1;
        event.endDate = new Date(2013, 6, 1, 15, 0); // 90 mins
        event.commit();

        event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;
        Tx.log("Add Monthly recurrence.");
        event.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly;
        event.recurrence.dayOfMonth = 1;
        event.endDate = new Date(2013, 6, 1, 14, 0); // 30 mins
        event.commit();

        event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;        
        Tx.log("Add Weekly recurrence.");
        event.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly;
        event.recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.monday;
        event.recurrence.interval = 1;
        event.endDate = new Date(2013, 6, 1, 14, 30); // 60 mins
        event.commit();

        event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;        
        Tx.log("Add Yearly recurrence.");
        event.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly;
        event.recurrence.monthOfYear = 2;
        event.recurrence.dayOfMonth = 28;
        event.recurrence.interval = 1;
        event.endDate = new Date(2013, 6, 1, 13, 30); // 0 mins
        event.commit();

        event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;
        Tx.log("Add Yearly recurrence (custom time).");
        event.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.yearly;
        event.recurrence.monthOfYear = 2;
        event.recurrence.dayOfMonth = 28;
        event.recurrence.interval = 1;
        event.endDate = new Date(2013, 6, 1, 13, 42); // 12 mins (custom)
        event.commit();

        event = CalendarPlatformLib.addEvent(props);
        event.recurring = true;
        Tx.log("Add event with attendees.");
        event.recurrence.recurrenceType = Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.daily;
        event.recurrence.dayOfWeek = Microsoft.WindowsLive.Platform.Calendar.DayOfWeek.weekDays;
        event.recurrence.interval = 1;
        Tx.log("Adding Attendee Bob");
        event.addAttendee("Bob", "bob@barker.com");
        testHarness.waitForPlatformIdle(5000);
        event.commit();

        event = CalendarPlatformLib.addEvent(props);
        Tx.log("Add multiday event.");
        event.endDate = new Date(2013, 6, 2, 13, 31); // 1 day + minute (custom)
        event.commit();

        // Wait for all events to be present in the platform before triggering the report.
        testHarness.waitForPlatformIdle(5000);
                
        // Run the report.
        calendarManager.runPlatformReport();        
        testHarness.waitForPlatformIdle(5000);

        cleanup(tc);
    });
})();