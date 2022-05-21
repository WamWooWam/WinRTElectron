
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global BVT,CalendarLib,DatePickerLib,MonthViewLib,setTimeout,Tx,WinJS*/


(function () {

    // Cleanup function that cleans up after running a test.
    function cleanup(tc) {
        setTimeout(function () { tc.start(); }, BVT.delayFinish);
    }

    BVT.Test("MonthView_HeaderVerification", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        CalendarLib.monthView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            var d = new Date();
            var currentMonth = d.getMonth();
            Tx.log("Getting current Month");
            Tx.log("current Month: " + currentMonth);
            var calendarMonth = CalendarLib.getCurrentMonth();
            tc.areEqual(currentMonth, calendarMonth, "Month title does not match: expected: " + currentMonth + " Actual: " + calendarMonth);

            //Move to next Month and verify that it works for the next month also:
            Tx.log("Verifying header for next month");
            var nextMonth;
            var calendarNextMonth;
            // if the current Month is december then the next month would be January of next year i.e. index 0
            if (currentMonth == 11) {
                nextMonth = 0;
                CalendarLib.monthView()
                .then(function () { return DatePickerLib.openFlyout(); })
                .then(function () { return DatePickerLib.nextViewFuture(); })
                .then(function () { return DatePickerLib.selectMonth(0,true); })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        calendarNextMonth = CalendarLib.getCurrentMonth();
                        tc.areEqual(nextMonth, calendarNextMonth, "Month title does not match: expected: " + nextMonth + " Actual: " + calendarNextMonth);
                        complete();
                    });
                });
            }
            else {
                nextMonth = currentMonth + 1;
                CalendarLib.monthView()
                .then(function () { return DatePickerLib.openFlyout(); })
                .then(function () { return DatePickerLib.selectMonth((currentMonth + 1),true); })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        calendarNextMonth = CalendarLib.getCurrentMonth();
                        tc.areEqual(nextMonth, calendarNextMonth, "Month title does not match: expected: " + nextMonth + " Actual: " + calendarNextMonth);
                        complete();
                    });
                });
            }
        })
        .done(function () {
            cleanup(tc);
        }, //End Done
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); // End Header Verifcation

    //No of Weeks verification starts
    BVT.Test("MonthView_VerifyNoOfWeeks",  {"owner" : "chwhit", "timeoutMs" : 120000}, function (tc) {
        tc.stop();
          
        CalendarLib.monthView()
        //Navigate to 4 week Month - February 2009
        .then(function () { return new WinJS.Promise.wrap(Tx.log("Verifying 4 weeks month")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.loopUntilYear(2009); })
        .then(function () { return DatePickerLib.selectMonth(1,true); })
        .then(function () { return MonthViewLib.getNoOfWeeksDisplayed(4); })
        .then(function () { return new WinJS.Promise.wrap(Tx.log("4 weeks month verified")); })
        //End 4 weeks month verification

        //Navigate to a 6 week Month - June 2013
        .then(function () { return new WinJS.Promise.wrap(Tx.log("Verifying 6 weeks month")); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.loopUntilYear(2012); })
        .then(function () { return DatePickerLib.selectMonth(8,true); })
        .then(function () { return MonthViewLib.getNoOfWeeksDisplayed(6); })
        .then(function () { return new WinJS.Promise.wrap(Tx.log("6 weeks month verified")); })
        //End 6 weeks month verification

        //Navigate to a 5 week month - May 2013
        .then(function () { return new WinJS.Promise.wrap(Tx.log("Verifying 5 weeks month")); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.loopUntilYear(2013); })
        .then(function () { return DatePickerLib.selectMonth(4,true); })
        .then(function () { return MonthViewLib.getNoOfWeeksDisplayed(5); })
        .then(function () { return new WinJS.Promise.wrap(Tx.log("5 weeks month verified")); })
        //End 5 weeks month verification

        .done(function () {
            cleanup(tc);
        }, //End Done
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); //End no of Weeks verification
    
    BVT.Test("MonthView_QuickEvent", { "owner": "chwhit" }, function (tc) {
        tc.stop();
        var eventCount;
        var subject = "test qec";

        CalendarLib.monthView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                eventCount = MonthViewLib.getNoOfEventsInView();
                Tx.log("Starting UI event count: " + eventCount);
                complete();
            });
        })
        .then(function () { MonthViewLib.invokeQuickEventCreationToday(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                var qec = $("#qeSubject");
                qec.val(subject);

                // Wait for the event to show up, complete when it does
                var isCompleting = false;
                BVT.marks.on("Calendar:Month._onEventsChanged,StopTA,Calendar", function () {
                    if (!isCompleting) {
                        isCompleting = true;
                        setImmediate(complete());
                    }
                });

                qec.trigger("keydown", { keyCode: Jx.KeyCode.enter });

                // If we miss the eventsChanged event, timeout and assume it's there
                WinJS.Promise.timeout(3000).then(function () {
                    if (!isCompleting) {
                        isCompleting = true;
                        setImmediate(complete());
                    }
                });
            });
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                // Wait for the event to be added to the UI, then check for it
                WinJS.Promise.timeout(5000).then(function () {
                    newEventCount = MonthViewLib.getNoOfEventsInView();
                    Tx.log("New UI event count: " + newEventCount);
                    tc.areEqual(eventCount + 1, newEventCount, "New event count (" + newEventCount + ") should be 1 + old (" + eventCount + ")");
                    complete();
                });
            });
        })
        .then(function () {
            return new WinJS.Promise.wrap(CalendarLib.removeEventBySubject(subject));
        })
        
        .done(function () {
            cleanup(tc);
        }, //End Done
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); //End MonthView_QuickEvent
})(); //end MonthView
