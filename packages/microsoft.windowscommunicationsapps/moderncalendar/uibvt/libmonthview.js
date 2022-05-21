
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,Jx,$*/

//Helper function for monthview test cases
var MonthViewLib = function () {
    return {

        //OWNER: t-niravn
        //function returns no of weeks displayed in current month
        //if expectedNoOfWeeks is defined then it asserts no of weeks displayed with expected
        getNoOfWeeksDisplayed: function (expectedNoOfWeeks) {
            var noOfDaysDisplayed = MonthViewLib.getNoOfDaysDisplayed();
            var noOfRowsDisplayed = noOfDaysDisplayed / 7;
            if (Jx.isDefined(expectedNoOfWeeks)) {
                Tx.log("Verifying " + expectedNoOfWeeks + " Weeks Month");
                Tx.assert(noOfRowsDisplayed === expectedNoOfWeeks, "Wrong no of weeks displayed expected " + expectedNoOfWeeks + " Actual:" + noOfRowsDisplayed);
                Tx.assert(noOfDaysDisplayed % 7 === 0, "Wrong no of Days Displayed, number should be multiple of 7 Actual:" + noOfDaysDisplayed);
                Tx.log("No of rows for view verified");
            }
            return noOfRowsDisplayed;
        }, // End getNoOfWeeks

        //OWNER: t-niravn
        //returns no of days displayed in current month
        //if expectedNoOfDays is defined then it asserts no of days displayed with expected
        getNoOfDaysDisplayed: function (expectedNoOfDays) {
            var noOfDaysDisplayed = $(".monthview .month:not([aria-hidden='true']) .day:not(.hidden)").length;
            if (Jx.isDefined(expectedNoOfDays)) {
                Tx.log("Verifying " + expectedNoOfDays + " Days Month");
                Tx.assert(noOfDaysDisplayed === expectedNoOfDays, "Wrong no of Days Displayed Actual:" + noOfDaysDisplayed);
                Tx.log("No of days for view verified");
            }
            return noOfDaysDisplayed;
        }, // End getNoOfDaysDisplayed

        //OWNER: t-niravn
        //returns the no of days in current month
        //if expectedNoOfDays is defined then it asserts no of days displayed in current month with expected
        getNoOfDaysInCurrentMonth: function (expectedNoOfDays) {
            var noOfDaysDisplayed = $(".month:not([aria-hidden='true']) .container .grid .days .thisMonth:not(.hidden)").length;
            if (Jx.isDefined(expectedNoOfDays)) {
                Tx.log("Verifying " + expectedNoOfDays + " Days Month");
                Tx.assert(noOfDaysDisplayed === expectedNoOfDays, "Wrong no of Days Displayed for current month Actual:" + noOfDaysDisplayed);
                Tx.log("No of days for month verified");
            }
            return noOfDaysDisplayed;
        }, // End getNoOfDaysInCurrentMonth

        //OWNER: chwhit
        //returns the no of events in view (including those in past/future months that are in view)
        getNoOfEventsInView: function () {
            return $(".month:not([aria-hidden='true']) .container .grid .events")[0].children.length;
        }, // End getNoOfEventsInView

        //OWNER: chwhit
        //fires enter keyboard event into today
        invokeQuickEventCreationToday: function () {
            return new WinJS.Promise(function (complete) {
                BVT.marks.on("Calendar:QuickEvent.activateUI,StopTA,Calendar", function () {
                    Tx.log("Found QEC");
                    complete();
                });

                Tx.log("Pressing enter to invoke QEC");

                var today = $(".month:not([aria-hidden='true']) .container .grid .days .today");
                today.trigger("keydown", { keyCode: Jx.KeyCode.enter });
            });
        } // End invokeQuickEventCreationToday
    };

}();
