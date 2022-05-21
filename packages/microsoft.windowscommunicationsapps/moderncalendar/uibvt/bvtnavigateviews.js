
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,setTimeout,BVT,CalendarLib,WinJS*/

(function () {
    
    // Cleanup function that cleans up after running a test.
    function cleanup (tc) {
        setTimeout(function() { tc.start(); }, BVT.delayFinish);
    }

    /// A function that allows you to pass in a value or range of values to check the
    /// number of visible dates in the view you are currently in for correctness.
    ///
    /// REMARKS - The second parameter is currently used for relaxed validation for views
    ///           like DayView and MonthView. (MonthView can show between 4 and 6 weeks worth
    ///           of dates in the grid, and DayView can show several as well)
    function VerifyVisibleDates (tc, numExpectedVisibleDatesLow, numExpectedVisibleDatesHigh) {
        Tx.log("VerifyVisibleDates: low[" + numExpectedVisibleDatesLow + "] high[" + numExpectedVisibleDatesHigh + "]");
        var errorString = "Incorrect number of visible dates in view";
        var visibleDates = CalendarLib.getVisibleDates().length;

        if (!numExpectedVisibleDatesHigh) {
            tc.areEqual(visibleDates, numExpectedVisibleDatesLow, errorString);
        } else {
            tc.isTrue(visibleDates >= numExpectedVisibleDatesLow && visibleDates <= numExpectedVisibleDatesHigh, errorString);
        }
    }

    /// A simple test that goes to today, opens MonthView, and makes sure that we can see
    /// the next and previous months, and that they contain the correct number of visible days
    BVT.Test("NavigateViews_MonthView", {"owner": "algore"}, function (tc) {
        tc.stop();
        CalendarLib.goToToday()
        .then(function () { return CalendarLib.monthView(); })
        .then(function () {
            VerifyVisibleDates(tc, 28, 42);
            return CalendarLib.monthView(); // Should no-op
        })
        .then(function () {
            VerifyVisibleDates(tc, 28, 42);
            return CalendarLib.nextViewPast();
        })
        .then(function () {
            VerifyVisibleDates(tc, 28, 42);
            return CalendarLib.goToToday();
        })
        .then(function () {
            VerifyVisibleDates(tc, 28, 42);
            return CalendarLib.nextViewFuture();
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                VerifyVisibleDates(tc, 28, 42);
                complete(true);
            });
        })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// A simple test that goes to today, opens WeekView, and makes sure that we can see
    /// the next and previous weeks, and that they contain the correct number of visible days
    BVT.Test("NavigateViews_WeekView", { "owner": "algore" }, function (tc) {
        tc.stop();
        CalendarLib.goToToday()
        .then(function () { return CalendarLib.weekView(); })
        .then(function () {
            VerifyVisibleDates(tc, 7);
            return CalendarLib.weekView(); // Should no-op
        })
        .then(function () {
            VerifyVisibleDates(tc, 7);
            return CalendarLib.nextViewPast();
        })
        .then(function () {
            VerifyVisibleDates(tc, 7);
            return CalendarLib.goToToday();
        })
        .then(function () {
            VerifyVisibleDates(tc, 7);
            return CalendarLib.nextViewFuture();
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                VerifyVisibleDates(tc, 7);
                complete(true);
            });
        })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// A simple test that goes to today, opens WorkWeekView, and makes sure that we can see
    /// the next and previous work weeks, and that they contain the correct number of visible days
    BVT.Test("NavigateViews_WorkWeekView", { "owner": "algore" }, function (tc) {
        tc.stop();
        CalendarLib.goToToday()
        .then(function () { return CalendarLib.workWeekView(); })
        .then(function () {
            VerifyVisibleDates(tc, 5);
            return CalendarLib.workWeekView(); // Should no-op
        }) 
        .then(function () {
            VerifyVisibleDates(tc, 5);
            return CalendarLib.nextViewPast();
        })
        .then(function () {
            VerifyVisibleDates(tc, 5);
            return CalendarLib.goToToday();
        })
        .then(function () {
            VerifyVisibleDates(tc, 5);
            return CalendarLib.nextViewFuture();
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                VerifyVisibleDates(tc, 5);
                complete(true);
            });
        })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });
    
    /// A simple test that goes to today, opens DayView, and makes sure that we can see
    /// the next and previous days, and that the correct number of days are visible
    BVT.Test("NavigateViews_DayView", { "owner": "algore" }, function (tc) {
        tc.stop();
        CalendarLib.goToToday()
        .then(function () { return CalendarLib.dayView(); })
        .then(function () {
            VerifyVisibleDates(tc, 1, 3);
            return CalendarLib.dayView(); // Should no-op
        })
        .then(function () {
            VerifyVisibleDates(tc, 1, 3);
            return CalendarLib.nextViewPast();
        })
        .then(function () {
            VerifyVisibleDates(tc, 1, 3);
            return CalendarLib.goToToday();
        })
        .then(function () {
            VerifyVisibleDates(tc, 1, 3);
            return CalendarLib.nextViewFuture();
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                VerifyVisibleDates(tc, 1, 3);
                complete(true);
            });
        })
        .done(function () {
            cleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        });
    });
})();