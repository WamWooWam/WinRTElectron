
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\views\datepicker\datepicker.js" />

/*jshint browser:true*/
/*global Tx,Jx,Calendar,MockJobset,runSync,WinJS*/

(function() {
    var DatePicker = Calendar.Controls.DatePicker,
        Helpers = Calendar.Helpers;


    var host,
        anchor,
        platform,
        manager,
        calendar,
        datePicker,
        today,
        jobset;

    var _longDate = new Jx.DTFormatter("longDate");

    function setup(pickMode) {
        WinJS.UI.disableAnimations();

        platform = new Calendar.Mock.Platform();

        manager = platform.calendarManager;

        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");
        
        manager.defaultCalendar = calendar;

        host = document.getElementById("host");
        anchor = document.getElementById("anchor");

        // create the jobset
        jobset = new MockJobset();

        datePicker = new DatePicker(pickMode || Calendar.Controls.DatePicker.PickMode.monthGrid);

        datePicker.on("getPlatform", function(ev) {
            ev.data.platform = platform;
        });

        datePicker.on("getSettings", function(ev) {
            ev.data.settings = {
                get: function() {
                    return false;
                }
            };
        });

        today = new Date(2011, 0, 6);  // Mon Jan 6 2011

        // initialize the datepicker control
        runSync(function() {
            host.innerHTML = Jx.getUI(datePicker).html;
            datePicker.setToday(today);
            datePicker.setFocusDate(today);
            datePicker.activateUI(jobset);
        });
    }
 
    function cleanup() {
        WinJS.UI.enableAnimations();

        manager.dumpStore();

        datePicker.deactivateUI();

        // clean up the jobset
        jobset.dispose();
        jobset = null;

        // release remaining references
        datePicker = null;
        host = null;
        calendar = null;
        manager = null;
        platform = null;
    }

    /*
        Tests
    */
    Tx.asyncTest("DatePickerTests.testDatePickerShowHide", function(tc) {
        /// <summary>validates the event stream of showing and hiding the datepicker, and confirms a key
        ///     requirement for the timeline to work: that the scrollLeft of the nest scroller is non-zero
        ///     regardless of the visibility, which reflects that the timeline can correctly calculate
        ///     offsets and position elements.</summary>

        tc.cleanup = cleanup;
        setup();

        tc.stop();

        var afterHide = function() {
            tc.isFalse(datePicker.getVisible(), "Should be hidden, but is showing");
            tc.isTrue(datePicker._timeline._scroller.scrollLeft !== 0, "after hide, scrollLeft should be non-zero");

            datePicker.detach("visibilityChanged", afterHide);
            
            // resume tx
            tc.start();
        };

        var afterShow = function() {
            tc.isTrue(datePicker.getVisible(), "Should be showing, but is hidden");
            tc.isTrue(datePicker._timeline._scroller.scrollLeft !== 0, "after show, scrollLeft should be non-zero");
            datePicker.detach("visibilityChanged", afterShow);
            datePicker.on("visibilityChanged", afterHide);
            datePicker.hide();
        };

        datePicker.on("visibilityChanged", afterShow);

        // confirm that the timeline scroll left starts out as non-zero
        tc.isTrue(datePicker._timeline._scroller.scrollLeft !== 0, "before show, scrollLeft should be non-zero");

        datePicker.show(anchor);
    });

    function verifySameDate(tc, a, b, msg) {
        tc.isTrue(Helpers.isSameDate(a, b), msg);
    }

    Tx.test("DatePickerTests.testDatePickerFocusedDay", function(tc) {
        /// <summary>sets the focused day in a number of ways and validates that the indicated day remains
        ///     set after having the timeline scroll logic fire.  the two events checked are the ways that the
        ///     internal monthgrid controls can notify its host that a change has occured.</summary>

        tc.cleanup = cleanup;
        setup();

        var now = new Date();
        var nov10 = new Date(2011, 10, 10);
        var feb29 = new Date(2012, 1, 29);
        var mar15 = new Date(2012,  3, 15);

        datePicker.setFocusDate(now);
        datePicker._timeline._onScroll();
        verifySameDate(tc, now, datePicker.getFocusDate(), "Now");

        datePicker.setFocusDate(nov10);
        datePicker._timeline._onScroll();
        verifySameDate(tc, nov10, datePicker.getFocusDate(), "November 10");

        datePicker.fire("daySelected", feb29);
        datePicker._timeline._onScroll();
        verifySameDate(tc, feb29, datePicker.getFocusDate(), "February 29");

        datePicker.fire("dayFocused", mar15);
        datePicker._timeline._onScroll();
        verifySameDate(tc, mar15, datePicker.getFocusDate(), "March 15");
    });

    function isStringInIntegerList(str, intList) {
        var num = parseInt(str, 10);
        for (var i = 0, len = intList.length; i < len; ++i) {
            if (intList[i] === num) { return true; }
        }

        return false;
    }

    Tx.asyncTest("DatePickerTests.testDatePickerHighlights", function (tc) {
        /// <summary>validates that the highlighted cells in the rendered datepicker reflect the values that
        ///     were passed in.</summary>

        tc.cleanup = cleanup;
        setup();

        tc.stop();

        var setHighlights = [
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        ];
        var dates = setHighlights.map(function(arg){ return arg.getDate(); });

        datePicker.setFocusDate(today);
        datePicker.setHighlightDates(setHighlights);

        var afterShow = function() {

            // get the highlights from the dom
            var days = datePicker._grid._host.querySelectorAll(".highlightDate");
            tc.areEqual(days.length, 3, "incorrect number of highlighted dates");

            for (var i = 0; i < 3; ++i) {
                tc.isTrue(isStringInIntegerList(days[i].innerText, dates), "incorrect date found in cell");
            }

            datePicker.detach("visibilityChanged", afterShow);

            // resume Tx
            tc.start();
        };

        datePicker.on("visibilityChanged", afterShow);
        datePicker.show(anchor);
    });

    Tx.asyncTest("DatePickerTests.testDatePickerPickDate", function (tc) {
        /// <summary>validates that the datepicker raises the proper event in response to receiving
        ///     notification that a day in a child monthgrid was selected, and that the date provided
        ///     in the event was correct.</summary>

        tc.cleanup = cleanup;
        setup();

        tc.stop();

        datePicker.setFocusDate(today);

        var afterPick = function(ev) {
            tc.isTrue(Helpers.isSameDate(today, ev.data), "should have picked today");
            tc.isFalse(datePicker.getVisible(), "Should be hidden, but is showing");

            datePicker.detach("dateSelected", afterPick);

            // resume Tx
            tc.start();
        };

        var afterShow = function() {
            // remove visibility handler so we only trigger this once
            datePicker.detach("visibilityChanged", afterShow);

            // register pick handler
            datePicker.on("dateSelected", afterPick);

            // signal that we picked something (similate the event raised by the
            // internal grids)
            datePicker.fire("daySelected", today);
        };

        datePicker.on("visibilityChanged", afterShow);
        datePicker.show(anchor);
    });

    Tx.test("DatePickerTests.testMonthPickerFocusedDay", function(tc) {
        /// <summary>sets the focused day in a number of ways and validates that the indicated day remains
        ///     set after having the timeline scroll logic fire.  the two events checked are the ways that the
        ///     internal yeargrid controls can notify its host that a change has occured.  using the yeargrid,
        ///     the datepicker will still allow setting dates down to the granularity of a day, though it
        ///     obviously can't display them finer than a month</summary>

        tc.cleanup = cleanup;
        setup(Calendar.Controls.DatePicker.PickMode.yearGrid);

        var now   = new Date();
        var nov10 = new Date(2011, 10, 10);
        var feb29 = new Date(2012, 1, 29);
        var mar15 = new Date(2012,  3, 15);

        datePicker.setFocusDate(now);
        datePicker._timeline._onScroll();
        verifySameDate(tc, now, datePicker.getFocusDate(), "Now");

        datePicker.setFocusDate(nov10);
        datePicker._timeline._onScroll();
        verifySameDate(tc, nov10, datePicker.getFocusDate(), "November 10");

        datePicker.fire("daySelected", feb29);
        datePicker._timeline._onScroll();
        verifySameDate(tc, feb29, datePicker.getFocusDate(), "February 29");

        datePicker.fire("dayFocused", mar15);
        datePicker._timeline._onScroll();
        verifySameDate(tc, mar15, datePicker.getFocusDate(), "March 15");
    });

    Tx.asyncTest("DatePickerTests.testMonthPickerHighlights", function (tc) {
        /// <summary>validates that the highlighted cells in the rendered datepicker reflect the values that
        ///     were passed in, using the yeargrid provider</summary>

        tc.cleanup = cleanup;
        setup(Calendar.Controls.DatePicker.PickMode.yearGrid);

        tc.stop();

        var setHighlights = [
            new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
            new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()),
            new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()),
        ];
        var dates = setHighlights.map(function(arg){ return arg.getMonth(); });

        datePicker.setFocusDate(today);
        datePicker.setHighlightDates(setHighlights);

        var afterShow = function() {

            // get the highlights from the dom
            var months = datePicker._grid._host.querySelectorAll(".highlightDate");
            tc.areEqual(months.length, 3, "incorrect number of highlighted dates");

            for (var i = 0; i < 3; ++i) {
                tc.isTrue(isStringInIntegerList(months[i].getAttribute("data-month"), dates), "incorrect date found in cell");
            }

            datePicker.detach("visibilityChanged", afterShow);

            // resume Tx
            tc.start();
        };

        datePicker.on("visibilityChanged", afterShow);
        datePicker.show(anchor);
    });

    Tx.asyncTest("DatePickerTests.testMonthPickerPickDate", function (tc) {
        /// <summary>validates that the datepicker raises the proper event in response to receiving
        ///     notification that a day in a child yeargrid was selected, and that the date provided
        ///     in the event was correct.</summary>

        tc.cleanup = cleanup;
        setup(Calendar.Controls.DatePicker.PickMode.yearGrid);

        tc.stop();

        datePicker.setFocusDate(today);

        var afterPick = function(ev) {
            tc.isTrue(Helpers.isSameDate(new Date(today.getFullYear(), 6, 1), ev.data), "should have picked July 1, 2011");
            tc.isFalse(datePicker.getVisible(), "Should be hidden, but is showing");

            datePicker.detach("dateSelected", afterPick);

            // resume Tx
            tc.start();
        };

        var afterShow = function() {
            // remove visibility handler so we only trigger this once
            datePicker.detach("visibilityChanged", afterShow);

            // register pick handler
            datePicker.on("dateSelected", afterPick);

            var months = datePicker._host.querySelectorAll(".yearGrid .month");
            var clickEv = document.createEvent("MouseEvents");

            clickEv.initEvent("click", true, true);
            months[6].dispatchEvent(clickEv);
        };

        datePicker.on("visibilityChanged", afterShow);
        datePicker.show(anchor);
    });


    Tx.asyncTest("DatePickerTests.testDatePickerToday", function (tc) {
        /// <summary>validates that the datepicker raises the proper event when the Today is selected</summary>

        tc.cleanup = cleanup;
        setup();

        tc.stop();

        datePicker.setFocusDate(today);
        datePicker.setToday(today);

        var afterPick = function(ev) {
            tc.isTrue(Helpers.isSameDate(today, ev.data), "should have picked Jan 6, 2011");
            tc.isFalse(datePicker.getVisible(), "Should be hidden, but is showing");

            datePicker.detach("dateSelected", afterPick);

            // resume Tx
            tc.start();
        };

        var afterShow = function() {
            // remove visibility handler so we only trigger this once
            datePicker.detach("visibilityChanged", afterShow);

            // register pick handler
            datePicker.on("dateSelected", afterPick);

            var todayEl = datePicker._dpHidden.querySelector(".dp-today");
            var clickEv = document.createEvent("MouseEvents");

            clickEv.initEvent("click", true, true);
            todayEl.dispatchEvent(clickEv);
        };

        datePicker.on("visibilityChanged", afterShow);
        datePicker.show(anchor);
    });

    Tx.test("DatePickerTests.testDatePickerAriaLabels", function (tc) {
        /// <summary>Verifies that aria text is correct for each</summary>

        tc.cleanup = cleanup;
        setup();

        // Test a case where the focused month starts in the first week of the date picker and a 
        // case where the focused month starts on Sunday of the second week of the date picker
        var sep5 = new Date(2013, 8, 5);
        var aug15 = new Date(2013, 7, 15);

        datePicker.setFocusDate(aug15);        

        var day = datePicker._grid._host.querySelector(".focused").parentElement;
        var label = day.getAttribute("aria-label");
        tc.areEqual(label, _longDate.format(aug15), "aria-label date does not match focused date");

        datePicker.setFocusDate(sep5);

        day = datePicker._grid._host.querySelector(".focused").parentElement;
        label = day.getAttribute("aria-label");
        tc.areEqual(label, _longDate.format(sep5), "aria-label date does not match focused date");
    });

    Tx.asyncTest("DatePickerTests.testDatePickerResetTodayMonthGrid", function (tc) {
        /// <summary>validates that the datepicker today highlight moves properly in the month grid, first within the same month, then month crossing</summary>

        tc.cleanup = cleanup;
        setup(Calendar.Controls.DatePicker.PickMode.monthGrid);

        tc.stop();

        datePicker.setFocusDate(today);

        // move today to be different from the focus date so the contents don't also have focus markup to contend with
        var testToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        datePicker.setToday(testToday);

        var afterThirdShow = function() {

            // get today from the dom
            var days = datePicker._grid._host.querySelectorAll(".day.today");
            tc.areEqual(days.length, 1, "incorrect number of today dates");

            tc.isTrue(days[0].innerText === testToday.getDate().toString(), "incorrect date found in cell");

            datePicker.detach("visibilityChanged", afterThirdShow);

            // resume Tx
            tc.start();
        };

        var afterSecondShow = function() {

            // get today from the dom
            var days = datePicker._grid._host.querySelectorAll(".day.today");
            tc.areEqual(days.length, 1, "incorrect number of today dates");

            tc.isTrue(days[0].innerText === testToday.getDate().toString(), "incorrect date found in cell");

            datePicker.detach("visibilityChanged", afterSecondShow);
            datePicker.hide();

            datePicker.on("visibilityChanged", afterThirdShow);
            testToday = new Date(testToday.getFullYear(), testToday.getMonth() + 1, testToday.getDate() + 1);

            datePicker.setToday(testToday);
            datePicker.show(anchor);
        };

        var afterFirstShow = function() {

            // get today from the dom
            var days = datePicker._grid._host.querySelectorAll(".day.today");
            tc.areEqual(days.length, 1, "incorrect number of today dates");

            tc.isTrue(days[0].innerText === testToday.getDate().toString(), "incorrect date found in cell");

            datePicker.detach("visibilityChanged", afterFirstShow);
            datePicker.hide();

            datePicker.on("visibilityChanged", afterSecondShow);
            testToday = new Date(testToday.getFullYear(), testToday.getMonth(), testToday.getDate() + 1);

            datePicker.setToday(testToday);
            datePicker.show(anchor);
        };

        datePicker.on("visibilityChanged", afterFirstShow);
        datePicker.show(anchor);
    });


    Tx.asyncTest("DatePickerTests.testDatePickerResetTodayYearGrid", function (tc) {
        /// <summary>validates that the datepicker today highlight moves properly in the year grid, first in the same year, then across years</summary>

        tc.cleanup = cleanup;
        setup(Calendar.Controls.DatePicker.PickMode.yearGrid);

        tc.stop();

        datePicker.setFocusDate(today);

        // formatter for comparisons
        var monthFormatter = new Jx.DTFormatter("month.abbreviated");

        // move today to be different from the focus date so the contents don't also have focus markup to contend with
        var testToday = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        datePicker.setToday(testToday);

        var afterThirdShow = function() {

            // get today from the dom
            var months = datePicker._grid._host.querySelectorAll(".month.today");
            tc.areEqual(months.length, 1, "incorrect number of today dates");

            tc.isTrue(months[0].innerText === monthFormatter.format(testToday), "incorrect date found in cell");

            datePicker.detach("visibilityChanged", afterThirdShow);

            // resume Tx
            tc.start();
        };

        var afterSecondShow = function() {

            // get today from the dom
            var months = datePicker._grid._host.querySelectorAll(".month.today");
            tc.areEqual(months.length, 1, "incorrect number of today dates");

            tc.isTrue(months[0].innerText === monthFormatter.format(testToday), "incorrect date found in cell");

            datePicker.detach("visibilityChanged", afterSecondShow);
            datePicker.hide();

            datePicker.on("visibilityChanged", afterThirdShow);
            testToday = new Date(testToday.getFullYear() + 1, testToday.getMonth() + 1, testToday.getDate());

            datePicker.setToday(testToday);
            datePicker.show(anchor);
        };

        var afterFirstShow = function() {

            // get today from the dom
            var months = datePicker._grid._host.querySelectorAll(".month.today");
            tc.areEqual(months.length, 1, "incorrect number of today dates");

            tc.isTrue(months[0].innerText === monthFormatter.format(testToday), "incorrect date found in cell");

            datePicker.detach("visibilityChanged", afterFirstShow);
            datePicker.hide();

            datePicker.on("visibilityChanged", afterSecondShow);
            testToday = new Date(testToday.getFullYear(), testToday.getMonth() + 1, testToday.getDate());

            datePicker.setToday(testToday);
            datePicker.show(anchor);
        };

        datePicker.on("visibilityChanged", afterFirstShow);
        datePicker.show(anchor);
    });
})();