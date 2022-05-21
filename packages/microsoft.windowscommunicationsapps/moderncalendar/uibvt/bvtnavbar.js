
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global BVT,CalendarLib,WinJS*/

(function () {
    
    // Cleanup function that cleans up after running a test.
    function cleanup (tc) {
        tc.start();
    }

    /// This function exhaustively navigates from a starting view to every other view, returning
    /// to the starting view each time
    /// 
    /// Param: startViewFunc - promise method used to navigate calendar to the starting view
    /// Param: startViewName - the name of the view (as returned but CalendarLib.getCurrentView()
    /// Param: tc            - TestContext object of the test
    function runTest (startViewFunc, startViewName, tc) {
        // starting view
        startViewFunc()
        .then(function () {
            // Try to navigate to day view from start view
            return CalendarLib.dayView("navbar");
        })
        .then(function () {
            // Verify and return to start
            tc.areEqual("dayview", CalendarLib.getCurrentView(), "Failed to switch to day view from " + startViewName + " via nav bar");
            return startViewFunc();
        })
        .then(function () {
            // Verify we are in starting view
            tc.areEqual(startViewName, CalendarLib.getCurrentView(), "Failed to return to " + startViewName + " from day view via nav bar");
    
            // Try to navigate to workweek view from start view
            return CalendarLib.workWeekView("navbar");
        })
        .then(function () {
            // Verify and return to start
            tc.areEqual("weekview workweek", CalendarLib.getCurrentView(), "Failed to switch to work week view from " + startViewName + " via nav bar");
            return startViewFunc();
        })
        .then(function () {
            // Verify we are in starting view
            tc.areEqual(startViewName, CalendarLib.getCurrentView(), "Failed to return to " + startViewName + " from work week view via nav bar");
    
            // Try to navigate to week view from start view
            return CalendarLib.weekView("navbar");
        })
        .then(function () {
            // Verify and return to start
            tc.areEqual("weekview", CalendarLib.getCurrentView(), "Failed to switch to week view from " + startViewName + " via nav bar");
            return startViewFunc();
        })
        .then(function () {
            // Verify we are in starting view
            tc.areEqual(startViewName, CalendarLib.getCurrentView(), "Failed to return to " + startViewName + " from week view via nav bar");
    
            // Try to navigate to month view from start view
            return CalendarLib.monthView("navbar");
        })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                // Finish in month view
                tc.areEqual("monthview", CalendarLib.getCurrentView(), "Failed to switch to month view view from " + startViewName + " via nav bar");
                complete(true);
            });
        })
        .done(function () {
            // This is the success function. It gets called if all previous promises returned success.        
            cleanup(tc);
        },
        function (failure) {
            // This gets called if ANY previous promise returned failure and will stop
            // calling the next .then() in that case. It's kind of like a try/catch (kind of)
            // In this case, I have designed the previous promises to return string error descriptions
            // in the event of any error, so I'm passing it here to get logged with the error message.
            tc.error(failure);
            cleanup(tc);
        });
    }

    /// Starts in day view, then navigates to all the other views,
    /// returning to day view before each navigation
    ///
    BVT.Test("NavBar_FromDayView", { timeoutMs: 15000,"owner": "chwhit" }, function (tc) {

        // This is an async test, so we have to stop Tx from continuing until we tell it 
        // to start again with tc.start(). You have to match each call to tc.stop()
        // with a call to tc.start().
        tc.stop();

        runTest(CalendarLib.dayView, "dayview", tc);
    });

    /// Starts in work week view, then navigates to all the other views,
    /// returning to work week view before each navigation
    ///
    BVT.Test("NavBar_FromWorkWeekView", { timeoutMs: 15000, "owner": "chwhit" }, function (tc) {

        // This is an async test, so we have to stop Tx from continuing until we tell it 
        // to start again with tc.start(). You have to match each call to tc.stop()
        // with a call to tc.start().
        tc.stop();

        runTest(CalendarLib.workWeekView, "weekview workweek", tc);
    });

    /// Starts in week view, then navigates to all the other views,
    /// returning to week view before each navigation
    ///
    BVT.Test("NavBar_FromWeekView", { timeoutMs: 15000, "owner": "chwhit" }, function (tc) {

        // This is an async test, so we have to stop Tx from continuing until we tell it 
        // to start again with tc.start(). You have to match each call to tc.stop()
        // with a call to tc.start().
        tc.stop();

        runTest(CalendarLib.weekView, "weekview", tc);
    });

    /// Starts in month view, then navigates to all the other views,
    /// returning to month view before each navigation
    ///
    BVT.Test("NavBar_FromMonthView", { timeoutMs: 15000, "owner": "chwhit" }, function (tc) {

        // This is an async test, so we have to stop Tx from continuing until we tell it 
        // to start again with tc.start(). You have to match each call to tc.stop()
        // with a call to tc.start().
        tc.stop();

        runTest(CalendarLib.monthView, "monthview", tc);
    });
})();