
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global EventDetailsLib,CalendarLib, WinJS, Tx,BVT, $*/


//contains helper functions to test recurring events
var RecurringEventLib = function () {

    return {
        /// OWNER: t-niravn
        /// Verifies recurrence creates correct number of events
        /// based on the recurrence value passed a switch case is invoked
        /// number of events in View is verified.
        /// number of events in View would be unique for each recurrence 
        /// and thus would give fair idea of correct recurrence
        /// goes to weekview and returns back to user view
        ///Everything is verified in current view and it would break if events are not in view
        verifyRecurEvents: function (tc, recurrence, title) {
            return new WinJS.Promise(function (complete) {
                var view = CalendarLib.getCurrentView();
                switch (recurrence) {

                    //verify every day recurring event
                    case EventDetailsLib.recurrenceDaily:
                        Tx.log("Verifying everyday recurrence event");
                        CalendarLib.weekView()
                        .then(function () { return CalendarLib.startAfterDelay(function () { }, 1000); })
                        .then(function () { return tc.areEqual(CalendarLib.getMultipleEvents(title).length, 7, "Recurring event not shown every day"); })
                        .then(function () { return Tx.log("Verified everyday recurrence event"); })
                        .then(function () { return CalendarLib.goToView(view); })
                        .done(function () { complete(); });
                        break; //case 1

                    //verify for every weekday recurring event
                    case EventDetailsLib.recurrenceWeekdays:
                        Tx.log("Verifying Weekday recurrence event");
                        CalendarLib.weekView()
                        .then(function () { return CalendarLib.startAfterDelay(function () { }, 1000); })
                        .then(function () { return tc.areEqual(CalendarLib.getMultipleEvents(title).length, 5, "Recurring event not shown every day"); })
                        .then(function () { return Tx.log("Verified Weekday recurrence event"); })
                        .then(function () { return CalendarLib.goToView(view); })
                        .done(function () { complete(); });
                        break; //case 2

                    //verify for monday, wednesday and friday recurring event
                    case EventDetailsLib.recurrenceMWF:
                        Tx.log("Veriying every Monday, Wednesday, Friday recurring event");
                        CalendarLib.weekView()
                        .then(function () { return CalendarLib.startAfterDelay(function () { }, 1000); })
                        .then(function () { return tc.areEqual(CalendarLib.getMultipleEvents(title).length, 3, "Recurring event not shown every day"); })
                        .then(function () { return Tx.log("Verified every Monday, Wednesday, Friday recurring event"); })
                        .then(function () { return CalendarLib.goToView(view); })
                        .done(function () { complete(); });
                        break; //case 3
                    //verify for every tuesday, thursday
                    case EventDetailsLib.recurrenceTuTh:
                        Tx.log("Veriying every Tuesday, Thursday recurring event");
                        CalendarLib.weekView()
                        .then(function () { return CalendarLib.startAfterDelay(function () { }, 1000); })
                        .then(function () { return tc.areEqual(CalendarLib.getMultipleEvents(title).length, 2, "Recurring event not shown every day"); })
                        .then(function () { Tx.log("Verified every Tuesday, Thursday recurring event"); })
                        .then(function () { return CalendarLib.goToView(view); })
                        .done(function () { complete(); });
                        break; //case 4

                    //verify for every week
                    case EventDetailsLib.recurrenceWeekly:
                        Tx.log("Veriying every week recurring event");
                        CalendarLib.weekView()
                        .then(function () { return CalendarLib.startAfterDelay(function () { }, 1500); })
                        .then(function () { return tc.areEqual(CalendarLib.getMultipleEvents(title).length, 1, "Recurring event not shown every day"); })
                        .then(function () { return Tx.log("Verified every week recurring event"); })
                        .then(function () { return CalendarLib.goToView(view); })
                        .done(function () { complete(); });
                        break; //case 5

                    //verify for every month
                    case EventDetailsLib.recurrenceMonthly:
                        Tx.log("Veriying every month recurring event");
                        CalendarLib.weekView()
                        .then(function () { return CalendarLib.startAfterDelay(function () { }, 1000); })
                        .then(function () { return tc.areEqual(CalendarLib.getMultipleEvents(title).length, 1, "Recurring event not shown every day"); })
                        .then(function () { return Tx.log("Verified every month recurring event"); })
                        .then(function () { return CalendarLib.goToView(view); })
                        .done(function () { complete(); });
                        break; //case 6
                    
                    //verify for every year
                    case EventDetailsLib.recurrenceYearly:
                        Tx.log("Veriying every year recurring event");
                        CalendarLib.weekView()
                        .then(function () { return CalendarLib.startAfterDelay(function () { }, 1000); })
                        .then(function () { return tc.areEqual(CalendarLib.getMultipleEvents(title).length, 1, "Recurring event not shown every day"); })
                        .then(function () { return Tx.log("Verified every year recurring event"); })
                        .then(function () { return CalendarLib.goToView(view); })
                        .done(function () { complete(); });
                        break; //case 7
                    default: Tx.AssertError("Wrong recurrence value: " + recurrence);
                }//Switch
            }); //Promise
        },//end verifyRecurEvents

        /// OWNER: t-niravn
        /// opens recurring event series
        /// event should be in view to be opened
        openRecurringEventSeries: function (title) {
            return new WinJS.Promise(function (complete) {
                Tx.log("opening event series");
                BVT.marks.once(EventDetailsLib.evtDetailsReady, function () {
                    complete();
                });
                CalendarLib.getSingleEvent(title).click();
                CalendarLib.startAfterDelay(function () {
                    Tx.log("clicking on flyout");
                    $(".cal-flyout-button")[1].click();
                }, 500);
            });
        },

        /// OWNER:t-niravn
        /// deletes the recurring event with specified title
        /// event should be in view to get deleted
        deleteRecurringEvent: function (title) {
            return new WinJS.Promise(function (complete) {
                var currentView = CalendarLib.getCurrentView();
                var eventForViewChange;
                Tx.log("Deleting recurring event with title: " + title);

                RecurringEventLib.openRecurringEventSeries(title)
                .then(function () { eventForViewChange = CalendarLib.getEventForViewChanged(currentView); })
                .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
                .done(function () { complete(); });
            });
        }
    };
}();