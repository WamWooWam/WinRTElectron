
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global WinJS,BVT,CalendarLib, EventDetailsLib,RecurringEventLib,DatePickerLib*/

(function () {

    // Cleanup function that cleans up after running a test.
    function cleanup(tc,title) {
        RecurringEventLib.deleteRecurringEvent(title).done(function () { tc.start(); });
    }
        
    /// Creates every day recurring event 
    /// and verifies if the event is created properly 
    BVT.Test("RecurringEvent_VerifyRecurDailyEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        var today = new Date();
        var currentView;
        var title = "Recurring event test Daily " + "UID: " + today.getTime();
        CalendarLib.weekView()
        .then(function () { currentView = CalendarLib.getCurrentView(); })
        .then(function () { return CalendarLib.createEvent(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.startDate(today);
                EventDetailsLib.recurrence(EventDetailsLib.recurrenceDaily);
                complete();
            }); //Promise
        })
        .then(function () { return EventDetailsLib.saveEvent(CalendarLib.getEventForViewChanged(currentView), tc); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return RecurringEventLib.verifyRecurEvents(tc, EventDetailsLib.recurrenceDaily, title); })
        .done(function () {
            cleanup(tc, title);
        }, //End success
        function (failure) {
            tc.error(failure);
            cleanup(tc, title);
        }); //End Failure
    }); // End RecurringEvent_VerifyRecurDailyEvent
        
    /// Creates every weekday recurring event
    /// and verifies if the event is created properly 
    BVT.Test("RecurringEvent_VerifyRecurWeekdaysEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        var today = new Date();
        var title = "Recurring event test Weekday" + " UID: " + today.getTime();
        var currentView;
        CalendarLib.weekView()
        .then(function () { currentView = CalendarLib.getCurrentView(); })
        .then(function () { return CalendarLib.createEvent();})
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.startDate(today);
                EventDetailsLib.recurrence(EventDetailsLib.recurrenceWeekdays);
                complete();
            }); //Promise
        })
        .then(function () { return EventDetailsLib.saveEvent(CalendarLib.getEventForViewChanged(currentView), tc); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return RecurringEventLib.verifyRecurEvents(tc, EventDetailsLib.recurrenceWeekdays, title); })
        .done(function () {
            cleanup(tc, title);
        }, //End success
        function (failure) {
            tc.error(failure);
            cleanup(tc, title);
        }); //End Failure
    }); // End RecurringEvent_VerifyRecurWeekdaysEvent

    /// Creates every Mon, Wed, Fri recurring event
    /// and verifies if the event is created properly 
    BVT.Test("RecurringEvent_VerifyRecurMWFEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        var today = new Date();
        var currentView;
        var title = "Recurring event test Every MWF" + " UID: " + today.getTime();
        CalendarLib.weekView()
        .then(function () { currentView = CalendarLib.getCurrentView(); })
        .then(function () { return CalendarLib.createEvent(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.startDate(today);
                EventDetailsLib.recurrence(EventDetailsLib.recurrenceMWF);
                complete();
            }); //Promise
        })
        .then(function () { return EventDetailsLib.saveEvent(CalendarLib.getEventForViewChanged(currentView), tc); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return RecurringEventLib.verifyRecurEvents(tc, EventDetailsLib.recurrenceMWF, title); })
        .done(function () {
            cleanup(tc, title);
        }, //End success
        function (failure) {
            tc.error(failure);
            cleanup(tc, title);
        }); //End Failure
    }); // End RecurringEvent_VerifyRecurMWFEvent

    /// Creates every Tue, Thu recurring event
    /// and verifies if the event is created properly 
    BVT.Test("RecurringEvent_VerifyRecurTuThEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        var today = new Date();
        var currentView;
        var title = "Recurring event test every Tue,Thu" + " UID: " + today.getTime();
        CalendarLib.weekView()
        .then(function () { currentView = CalendarLib.getCurrentView();})
        .then(function () {return CalendarLib.createEvent(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.startDate(today);
                EventDetailsLib.recurrence(EventDetailsLib.recurrenceTuTh);
                complete();
            }); //Promise
        })
        .then(function () { return EventDetailsLib.saveEvent(CalendarLib.getEventForViewChanged(currentView), tc); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return RecurringEventLib.verifyRecurEvents(tc, EventDetailsLib.recurrenceTuTh, title); })
        .done(function () {
            cleanup(tc, title);
        }, //End success
        function (failure) {
            tc.error(failure);
            cleanup(tc, title);
        }); //End Failure
    }); // End RecurringEvent_VerifyRecurTuThEvent

    /// Creates every week recurring event
    /// and verifies if the event is created properly 
    BVT.Test("RecurringEvent_VerifyRecurWeeklyEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        var today = new Date();
        var currentView;
        var title = "Recurring event test every week" + " UID: " + today.getTime();
        CalendarLib.weekView()
        .then(function () { currentView = CalendarLib.getCurrentView(); })
        .then(function () { return CalendarLib.createEvent(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.startDate(today);
                EventDetailsLib.recurrence(EventDetailsLib.recurrenceWeekly);
                complete();
            }); //Promise
        })
        .then(function () { return EventDetailsLib.saveEvent(CalendarLib.getEventForViewChanged(currentView), tc); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return RecurringEventLib.verifyRecurEvents(tc, EventDetailsLib.recurrenceWeekly, title); })
        .done(function () {
            cleanup(tc, title);
        }, //End success
        function (failure) {
            tc.error(failure);
            cleanup(tc, title);
        }); //End Failure
    }); // End RecurringEvent_VerifyRecurWeeklyEvent

    /// Creates every month recurring event
    /// and verifies if the event is created properly 
    BVT.Test("RecurringEvent_VerifyRecurMonthlyEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        var today = new Date();
        var currentView;
        var title = "Recurring event test every month" + " UID: " + today.getTime();
        CalendarLib.weekView()
        .then(function () { currentView = CalendarLib.getCurrentView(); })
        .then(function () { return CalendarLib.createEvent(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.startDate(today);
                EventDetailsLib.recurrence(EventDetailsLib.recurrenceMonthly);
                complete();
            }); //Promise
        })
        .then(function () { return EventDetailsLib.saveEvent(CalendarLib.getEventForViewChanged(currentView), tc); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.selectDay(new Date().getDate(),true); })
        .then(function () { return RecurringEventLib.verifyRecurEvents(tc, EventDetailsLib.recurrenceMonthly, title); })
        .done(function () {
           cleanup(tc, title);
        }, //End success
        function (failure) {
            tc.error(failure);
            cleanup(tc, title);
        }); //End Failure
    }); // End RecurringEvent_VerifyRecurMonthlyEvent

    /// Creates every year recurring event
    /// and verifies if the event is created properly 
    BVT.Test("RecurringEvent_VerifyRecurYearlyEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        var today = new Date();
        var currentView;
        var title = "Recurring event test every year" + " UID: " + today.getTime();
        var shouldViewChange = true;
        CalendarLib.weekView()
        .then(function () { currentView = CalendarLib.getCurrentView(); })
        .then(function () { return CalendarLib.createEvent(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                EventDetailsLib.title(title);
                EventDetailsLib.startDate(today);
                EventDetailsLib.recurrence(EventDetailsLib.recurrenceYearly);
                complete();
            }); //Promise
        })
        .then(function () { return EventDetailsLib.saveEvent(CalendarLib.getEventForViewChanged(currentView), tc); })
        .then(function () { return CalendarLib.goToToday(); })
        //the event is not verified in monthView because
        //we might need to click on more button if there are many events for same day
        .then(function () { return CalendarLib.monthView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.selectMonth(today.getMonth(),true); })
        .then(function () { return CalendarLib.weekView(); })
        .then(function () {
            // Weekview was already showing the selected date and so no 'view change' will occur
            return new WinJS.Promise(function (complete) {
                var dateArray = CalendarLib.getVisibleDates();
                for (var i = 0; i < dateArray.length; i++) {
                    if (today.getDate() === dateArray[i].getDate()) {
                        shouldViewChange = false;
                        break;
                    }
                }
                complete();
            });
        })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () {
            // if month shown in datepicker is not of the current month then go to next month
            // as week view would always go to the first week of current month, month cross can always be
            // past month and current month
            return new WinJS.Promise(function (complete) {
                if (CalendarLib.getMonthText(today.getMonth()) !== DatePickerLib.getHeaderMonth()) {
                    DatePickerLib.nextViewFuture();
                }
                complete();
            });
        })
        .then(function () { return DatePickerLib.selectDay(today.getDate(), shouldViewChange); })
        .then(function () { return RecurringEventLib.verifyRecurEvents(tc, EventDetailsLib.recurrenceYearly, title); })
        .done(function () {
            cleanup(tc, title);
        }, //End success
        function (failure) {
            tc.error(failure);
            cleanup(tc, title);
        }); //End Failure
    }); // End RecurringEvent_VerifyRecurYearlyEvent
})();