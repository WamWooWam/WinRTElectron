
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,Jx,setTimeout,BVT,WinJS,CalendarLib,DatePickerLib*/

(function () {
    
    // Cleanup function that cleans up after running a test
    function cleanup (tc) {
        setTimeout(function() { tc.start(); }, BVT.delayFinish);
    }

    function VerifyFocusedDay (tc, day) {
        return new WinJS.Promise(function (complete) {
            Tx.log("VerifyFocusedDay: Checking if focused day is " + day);
            tc.areEqual(day, DatePickerLib.getFocusedDay(), "Incorrect day in focus!");
            complete();
        });
    }

    function ArrowKeyTest (tc, arrowKey) {
        var curDate = new Date();
        curDate.setDate(1); //Focus is always on the first day of the month now
        var value;
        switch (arrowKey) {
            case Jx.KeyCode.leftarrow:
                value = -1;
                break;
            case Jx.KeyCode.uparrow:
                value = -7;
                break;
            case Jx.KeyCode.rightarrow:
                value = 1;
                break;
            case Jx.KeyCode.downarrow:
                value = 7;
                break;
            default:
                Tx.AssertError("Not an arrow key");
                break;
        }
        Tx.assert(undefined !== value, "Invalid value specified");

        CalendarLib.weekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.arrowKey(arrowKey); })
        .then(function () { return WinJS.Promise.wrap(curDate.setDate(curDate.getDate() + value)); })
        .then(function () { return VerifyFocusedDay(tc, curDate.getDate()); })
        .then(function () { return DatePickerLib.closeFlyout(); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    }

    function VerifyChevronVisibility (tc) {
        Tx.log("VerifyChevronVisibility: 1 visible, the rest are hidden");
        tc.areEqual(DatePickerLib.getChevron().length, 1, "The number of visible chevrons is not equal to 1");
    }
    
    function VerifyHighlightedDays (tc) {
        return new WinJS.Promise(function (complete) {
            Tx.log("VerifyHighlightedDays...");
            var visible = CalendarLib.getVisibleDates();
            var highlighted = DatePickerLib.getHighlightedDates();

            // Do a cursory length check
            tc.areEqual(visible.length, highlighted.length,
            "visible[" + visible.length + "] != highlighted[" + highlighted + "]");

            //All of the dates should be in order, so just compare them each 1-by-1
            for (var i = 0; i < visible.length; i++) {
                tc.areEqual(visible[i].getDate(), highlighted[i].getDate(), "Iteration " + i + ": Date is incorrect!");
                tc.areEqual(visible[i].getMonth(), highlighted[i].getMonth(), "Iteration " + i + ": Month is incorrect!");
                tc.areEqual(visible[i].getFullYear(), highlighted[i].getFullYear(), "Iteration " + i + ": Full year is incorrect!");
            }

            complete();
        });
    }
    
    function VerifyHighlightedMonth() {
        return new WinJS.Promise(function (complete) {
            Tx.log("VerifyHighlightedMonth...");
            var visibleMonth = CalendarLib.getCurrentMonth();
            var actualHighlight = DatePickerLib.getHighlightedMonth();
            Tx.log("Highlighted month: " + actualHighlight);
            if (visibleMonth.toString() !== actualHighlight)
            {
                Tx.AssertError("Highlighted month is incorrect!");
            }

            complete();
        });
    }
        
    /// Does basic validation that the flyout can be opened and closed with a mouse-button click
    ///
    /// REMARKS - This test will fail if the Flyout fails to open or close for any reason
    BVT.Test("DatePicker_OpenFlyout_CloseFlyout", {"owner":"algore"}, function (tc) {
        tc.stop();

        CalendarLib.dayView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.closeFlyout(); })
        .then(function () { return CalendarLib.weekView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.closeFlyout(); })
        .then(function () { return CalendarLib.workWeekView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.closeFlyout(); })
        .then(function () { return CalendarLib.monthView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.closeFlyout(); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// Does basic validation that:
    /// 1) The flyout can be opened in each view
    /// 2) Switching views will close the flyout
    ///
    /// REMARKS - This test will fail if the Flyout fails to open or close for any reason
    BVT.Test("DatePicker_OpenFlyout_HideFlyout_SwitchView", {"owner":"algore"}, function (tc) {
        tc.stop();
 
        CalendarLib.monthView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.waitForFlyoutDismiss(CalendarLib.dayView); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.waitForFlyoutDismiss(CalendarLib.weekView); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.waitForFlyoutDismiss(CalendarLib.workWeekView); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.waitForFlyoutDismiss(CalendarLib.monthView); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });
    
    /// Basic validation for day view:
    /// 1. Selecting the left-most-visible day within the set of current days does NOT change the view
    /// 2. Selecting a day outside of the current set of days DOES change the view
    ///
    /// REMARKS - This case will not cover every "DayView" scenario (eg. potentially multiple visible days,
    ///           selecting the second one will make the UI update, etc)
    BVT.Test("DatePicker_SelectDays_DayView", {"owner":"algore"}, function (tc) {
        tc.stop();

        var curDate = new Date(Date.now());
        var dateToSelect = curDate.getDate();
        var visibleDates;
        var visibleDateLeft;
        var visibleDateRight;
        
        CalendarLib.dayView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                // Initialize test-case variables that are actually view-specific
                visibleDates = CalendarLib.getVisibleDates();
                visibleDateLeft = visibleDates[0].getDate();
                visibleDateRight = visibleDates[visibleDates.length - 1].getDate();
                complete();
            });
        })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(dateToSelect, false); })
        .then(function () { return WinJS.Promise.wrap(tc.areEqual(visibleDateLeft, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates no longer match!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(visibleDateLeft - visibleDates.length, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDateLeft, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(visibleDateRight + visibleDates.length, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDateLeft, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });    
    
    /// Basic validation for week view:
    /// 1. Selecting a day within the week does NOT change the view
    /// 2. Selecting a day outside of the week DOES change the view
    BVT.Test("DatePicker_SelectDays_WeekView", {"owner":"algore"}, function (tc) {
        tc.stop();

        var curDate = new Date(Date.now());
        var dateToSelect = curDate.getDate();
        var visibleDate;

        CalendarLib.weekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                // Initialize test-case variables that are actually view-specific
                visibleDate = CalendarLib.getVisibleDates()[0].getDate();
                complete();
            });
        })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(dateToSelect, false); })
        .then(function () { return WinJS.Promise.wrap(tc.areEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates no longer match!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(dateToSelect - 7, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(dateToSelect + 7, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// Basic validation for workweek view:
    /// 1. Selecting a day within the work week does NOT change the view
    /// 2. Selecting a day outside of the work week DOES change the view
    /// 3. Selecting the saturday or sunday of the current work week does NOT change the view
    /// 4. Selecting a saturday or sunday in a different work week DOES change the view
    ///
    /// REMARKS - This test-case is tailored to only work when the starting-day of the week is 'Sunday'
    BVT.Test("DatePicker_SelectDays_WorkWeekView", {"owner":"algore"}, function (tc) {
        tc.stop();

        var curDate = new Date(Date.now());
        var dateToSelect = curDate.getDate();
        var firstWeekendDay = dateToSelect - curDate.getDay();
        var secondWeekendDay = firstWeekendDay + 6;
        var visibleDate;

        CalendarLib.workWeekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                // Initialize test-case variables that are actually view-specific
                visibleDate = CalendarLib.getVisibleDates()[0].getDate();
                complete();
            });
        })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(dateToSelect, false); })
        .then(function () { return WinJS.Promise.wrap(tc.areEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates no longer match!")); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(dateToSelect - 7, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(dateToSelect + 7, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(firstWeekendDay, false); })
        .then(function () { return WinJS.Promise.wrap(tc.areEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates no longer match!")); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(secondWeekendDay, false); })
        .then(function () { return WinJS.Promise.wrap(tc.areEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates no longer match!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(firstWeekendDay - 1, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectDay(secondWeekendDay + 1, true); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleDate, CalendarLib.getVisibleDates()[0].getDate(), "Visible dates still match, but shouldn't!")); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// Basic validation for month view:
    /// 1. Selecting the current month will NOT change the view
    /// 2. Selecting any other month WILL change the view
    BVT.Test("DatePicker_SelectMonths", {"owner":"algore"}, function (tc) {
        tc.stop();

        var curDate = new Date(Date.now());
        var monthToSelect = curDate.getMonth();
        var visibleMonth;

        CalendarLib.monthView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                // Initialize test-case variables that are actually view-specific
                visibleMonth = CalendarLib.getCurrentMonth();
                complete();
            });
        })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectMonth(monthToSelect); })
        .then(function () { return WinJS.Promise.wrap(tc.areEqual(visibleMonth, CalendarLib.getCurrentMonth(), "Visible month no longer matches!")); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectMonth(monthToSelect - 1); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleMonth, CalendarLib.getCurrentMonth(), "Visible month still matches, but shouldn't!")); })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectMonth(monthToSelect + 1); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(visibleMonth, CalendarLib.getCurrentMonth(), "Visible month still matches, but shouldn't!")); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// A simple test-case that validates that the Chevrons are on all appropriate elements and visible
    /// at the appropriate times
    BVT.Test("DatePicker_VerifyChevronVisibility", {"owner":"algore"}, function (tc) {
        tc.stop();
        CalendarLib.monthView()
        .then(function () { return CalendarLib.goToToday(); })
        .then( function() { return WinJS.Promise.wrap(VerifyChevronVisibility(tc)); })
        .then(function () { return CalendarLib.workWeekView(); })
        .then( function() { return WinJS.Promise.wrap(VerifyChevronVisibility(tc)); })
        .then(function () { return CalendarLib.weekView(); })
        .then( function() { return WinJS.Promise.wrap(VerifyChevronVisibility(tc)); })
        .then(function () { return CalendarLib.dayView(); })
        .then( function() { return WinJS.Promise.wrap(VerifyChevronVisibility(tc)); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// A simple test-case that checks to make sure the highlighted dates are the correct
    /// ones for WeekView, WorkWeekView, and DayView.  It will also make sure that MonthView
    /// has no highlighted dates, because it should show a different picker that doesn't use
    /// highlighted dates
    BVT.Test("DatePicker_CheckHighlightedDates", {"owner":"algore"}, function (tc) {
        tc.stop();

        CalendarLib.workWeekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return VerifyHighlightedDays(tc); })
        .then(function () { return CalendarLib.weekView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return VerifyHighlightedDays(tc); })
        .then(function () { return CalendarLib.dayView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return VerifyHighlightedDays(tc); })
        .then(function () { return CalendarLib.monthView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return VerifyHighlightedMonth(tc); })
        .then(function () { return DatePickerLib.closeFlyout(); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// A simple test-case that validates that the DatePicker and MonthPicker today buttons take you to the current day
    ///
    /// REMARKS - This test doesn't exhaustively test every view because they all actually send the same info to the timeline
    BVT.Test("DatePicker_VerifyTodayButton", {"owner":"algore"}, function (tc) {
        tc.stop();

        CalendarLib.workWeekView()
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.goToToday(false); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.arrowKey(Jx.KeyCode.downarrow); })
        .then(function () { return DatePickerLib.arrowKey(Jx.KeyCode.downarrow); })
        .then(function () { return DatePickerLib.arrowKey(Jx.KeyCode.downarrow); })
        .then(function () { return DatePickerLib.arrowKey(Jx.KeyCode.downarrow); })
        .then(function () { return DatePickerLib.arrowKey(Jx.KeyCode.downarrow); })
        .then(function () { return DatePickerLib.selectDay(DatePickerLib.getFocusedDay()); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.goToToday(true); })
        .then(function () { return CalendarLib.monthView(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.goToToday(true); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.goToToday(false); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// A simple test-case that attempts right-arrow-key-navigation and validates UI elements
    BVT.Test("DatePicker_ArrowKeyNavigation_RightArrow", {"owner":"algore"}, function (tc) {
        tc.stop();
        ArrowKeyTest(tc, Jx.KeyCode.rightarrow);
    });

    /// A simple test-case that attempts left-arrow-key-navigation and validates UI elements
    BVT.Test("DatePicker_ArrowKeyNavigation_LeftArrow", {"owner":"algore"}, function (tc) {
        tc.stop();
        ArrowKeyTest(tc, Jx.KeyCode.leftarrow);
    });

    /// A simple test-case that attempts down-arrow-key-navigation and validates UI elements
    BVT.Test("DatePicker_ArrowKeyNavigation_DownArrow", {"owner":"algore"}, function (tc) {
        tc.stop();
        ArrowKeyTest(tc, Jx.KeyCode.downarrow);
    });

    /// A simple test-case that attempts up-arrow-key-navigation and validates UI elements
    BVT.Test("DatePicker_ArrowKeyNavigation_UpArrow", {"owner":"algore"}, function (tc) {
        tc.stop();
        ArrowKeyTest(tc, Jx.KeyCode.uparrow);
    });

    /// A simple test-case that attempts to use the PageUp/PageDown navigations
    BVT.Test("DatePicker_PagingTests", {"owner":"algore"}, function (tc) {
        tc.stop();
        var month;

        CalendarLib.workWeekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return WinJS.Promise.wrap(month = DatePickerLib.getHeaderMonth()); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(month, DatePickerLib.getHeaderMonth(), "Expected the month to change - this is a sanity that the view changing did something")); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return DatePickerLib.nextViewFuture(); })
        .then(function () { return WinJS.Promise.wrap(tc.areEqual(month, DatePickerLib.getHeaderMonth(), "months do not match as-expected")); })
        .then(function () { return CalendarLib.weekView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return WinJS.Promise.wrap(tc.areNotEqual(month, DatePickerLib.getHeaderMonth(), "Expected the month to change - this is a sanity that the view changing did something")); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { return DatePickerLib.nextViewPast(); })
        .then(function () { WinJS.Promise.wrap(tc.areEqual(month, DatePickerLib.getHeaderMonth(), "months do not match as-expected")); })
        .then(function () { return DatePickerLib.closeFlyout(); })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

})();
