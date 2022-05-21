
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Jx,Calendar,MockJobset,runSync*/

(function() {
    var Grid = Calendar.Controls.MonthGrid;

    var grid,
        host;

    var jobset;

    var platform,
        manager,
        calendar;

    var originalFirstDay;

    //
    // Setup
    //

    function setup() {
        // set up platform
        platform = new Calendar.Mock.Platform();

        // dump the store to remove all events
        manager = platform.calendarManager;

        Calendar.Helpers.ensureFormats();
        originalFirstDay = Calendar.Helpers.firstDayOfWeek;

        // prepare our test calendar
        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");

        // get our host
        host = document.getElementById("host");

        // create the jobset
        jobset = new MockJobset();

        // create the snap grid view
        grid = new Grid();

        // respond to snap grid view events
        grid.on("getPlatform", function(ev) {
            ev.data.platform = platform;
        });

        // initialize the grid grid view
        runSync(function() {
            host.innerHTML = Jx.getUI(grid).html;
            grid.activateUI(jobset);
        });
    }

    //
    // Teardown
    //

    function cleanup() {
        // get rid of any test events we created
        if (manager) {
            manager.dumpStore();
        }

        // shut down the snap
        if (grid) {
            grid.deactivateUI();
        }

        // clean up the jobset
        if (jobset) {
            jobset.dispose();
        }
        jobset = null;

        // release references
        grid = null;
        host = null;

        calendar = null;
        manager  = null;
        platform = null;

        Calendar.Helpers.firstDayOfWeek = originalFirstDay;
    }

    //
    // Utils
    //

    function normalize(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function verifySameDate(tc, a, b, msg) {
        tc.areEqual(normalize(a).toString(), normalize(b).toString(), msg);
    }

    function qsa(el, query) {
        return Array.prototype.slice.call(el.querySelectorAll(query));
    }

    function verifyHasClass(tc, className, days, daysThatShould, msg) {
        for (var i = 0, len = days.length; i < len; i++) {
            var day      = days[i],
                hasClass = Jx.hasClass(day, className),
                should   = (daysThatShould.indexOf(i) !== -1);

            tc.areEqual(should, hasClass, msg + " " + i);
        }
    }

    //
    // Tests
    //

    Tx.test("SnapGridTests.testFocusedDay", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var a = new Date(2011, 6,   4),
            b = new Date(2011, 10, 10),
            c = new Date(2012, 0,   1);

        var header = document.querySelector(".monthGrid .header"),
            date;

        var monthYear = Grid._header;
        function generateHeader(date) {
            return monthYear.format(date);
        }

        grid.setFocusedDay(a);
        tc.areEqual(generateHeader(a), header.innerText, "July 4 Header");

        date = host.querySelector(".monthGrid .focused").parentNode.firstChild.innerText;
        tc.areEqual("4", date, "July 4 Focused Text");

        grid.setFocusedDay(b);
        tc.areEqual(generateHeader(b), header.innerText, "November 10 Header");

        date = host.querySelector(".monthGrid .focused").parentNode.firstChild.innerText;
        tc.areEqual("10", date, "November 10 Focused Text");

        grid.setFocusedDay(c);
        tc.areEqual(generateHeader(c), header.innerText, "January 1 Header");

        date = host.querySelector(".monthGrid .focused").parentNode.firstChild.innerText;
        tc.areEqual("1", date, "January 1 Focused Text");
    });

    Tx.test("SnapGridTests.testCalendar", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Calendar.Helpers.firstDayOfWeek = 0;

        var a = new Date(2011, 6,  4),
            b = new Date(2012, 0,  1),
            c = new Date(2012, 1, 14),  // 29 day feb
            d = new Date(2015, 1, 14);  // 28 day feb starting on sun

        var previous = qsa(host, ".monthGrid .previous"),
            current  = qsa(host, ".monthGrid .current"),
            next     = qsa(host, ".monthGrid .next");

        // there are up to 10 days from the previous month (28 - 7 = 21 -> 31)
        // and up to 13 days from the next month (28 day feb starting on second day of week)
        tc.areEqual(10,  previous.length, "Previous Days");
        tc.areEqual(31, current.length,  "Current Days");
        tc.areEqual(13, next.length,     "Next Days");

        grid.setFocusedDay(a);
        verifyHasClass(tc, "hidden", previous, [0, 1, 2, 3, 9],          "July 4 Previous");
        verifyHasClass(tc, "hidden", current,  [],                       "July 4 Current");
        verifyHasClass(tc, "hidden", next,     [6, 7, 8, 9, 10, 11, 12], "July 4 Next");

        grid.setFocusedDay(b);
        verifyHasClass(tc, "hidden", previous, [0, 1, 2],                      "Jan 1 Previous");
        verifyHasClass(tc, "hidden", current,  [],                             "Jan 1 Current");
        verifyHasClass(tc, "hidden", next,     [4, 5, 6, 7, 8, 9, 10, 11, 12], "Jan 1 Next");

        grid.setFocusedDay(c);
        verifyHasClass(tc, "hidden", previous, [0, 1, 2, 3, 4, 5, 6], "Feb 14 Leap Previous");
        verifyHasClass(tc, "hidden", current,  [29, 30],              "Feb 14 Leap Current");
        verifyHasClass(tc, "hidden", next,     [10, 11, 12],          "Feb 14 Leap Next");

        grid.setFocusedDay(d);
        verifyHasClass(tc, "hidden", previous, [0, 1, 2],             "Feb 14 4wk Previous");
        verifyHasClass(tc, "hidden", current,  [28, 29, 30],          "Feb 14 4wk Current");
        verifyHasClass(tc, "hidden", next,     [7, 8, 9, 10, 11, 12], "Feb 14 4wk Next");
    });

    Tx.test("SnapGridTests.testClick", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var days = qsa(host, ".monthGrid .day"),
            date = new Date(2011, 10, 10);

        var clickEv = document.createEvent("MouseEvents");
        clickEv.initEvent("click", true, true);

        var selected;
        function onDaySelected(ev) {
            selected = ev.data;
        }

        // total number of days (10prev + 31curr + 13next = 54)
        tc.areEqual(54, days.length, "Days");

        grid.setFocusedDay(date);
        grid.on("daySelected", onDaySelected);

        days[10].dispatchEvent(clickEv);
        verifySameDate(tc, new Date(2011, 10, 1), selected, "Nov 1");

        days[39].dispatchEvent(clickEv);
        verifySameDate(tc, new Date(2011, 10, 30), selected, "Nov 30");

        days[42].dispatchEvent(clickEv);
        verifySameDate(tc, new Date(2011, 11, 2), selected, "Dec 2");

        days[36].dispatchEvent(clickEv);
        verifySameDate(tc, new Date(2011, 10, 27), selected, "Nov 27");

        grid.detach("daySelected", onDaySelected);
    });

    Tx.test("SnapGridTests.testHasEvents", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var days = qsa(host, ".monthGrid .day"),
            date = new Date(2011, 10, 10);
        var ev;

        runSync(function() {
            ev = calendar.createEvent();
            ev.startDate = new Date(2011, 9, 31);
            ev.endDate   = new Date(2011, 9, 31, 12);
            ev.commit();

            ev = calendar.createEvent();
            ev.startDate = new Date(2011, 10, 9);
            ev.endDate   = new Date(2011, 10, 9, 12);
            ev.commit();

            ev = calendar.createEvent();
            ev.startDate = new Date(2011, 11, 2);
            ev.endDate   = new Date(2011, 11, 2, 12);
            ev.commit();
        });

        tc.areEqual(54, days.length, "Days");

        runSync(function() {
            grid.setFocusedDay(date);
        });

        verifyHasClass(tc, "hasEvents", days, [9, 18, 42], "days with events");
    });

    Tx.test("SnapGridTests.testHighlights", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Calendar.Helpers.firstDayOfWeek = 0;

        var cases = [
            { name: "May/June 2013", focusDate: new Date(2013, 5,  4), highlights: [ new Date(2013, 4, 31), new Date(2013, 5, 1), new Date(2013, 5, 2) ], expected: [9, 10, 11] },
        ];

        var days = qsa(host, ".monthGrid .day");

        // set the highlighted days and the focus date
        for (var i = 0, len = cases.length; i < len; ++i) {
            var testCase = cases[i];
            grid.setHighlightDates(testCase.highlights);
            grid.setFocusedDay(testCase.focusDate);

            verifyHasClass(tc, "highlightDate", days, testCase.expected, testCase.name);
        }
    });
})();