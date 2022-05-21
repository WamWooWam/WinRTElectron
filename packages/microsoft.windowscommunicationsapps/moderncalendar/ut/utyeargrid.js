
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Jx,Calendar,MockJobset,runSync*/

(function() {
    var Grid = Calendar.Controls.YearGrid;

    var grid,
        host;

    var jobset;

    var platform,
        manager,
        calendar;

    //
    // Setup
    //

    function setup() {
        // set up platform
        platform = new Calendar.Mock.Platform();

        // dump the store to remove all events
        manager = platform.calendarManager;

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
        manager.dumpStore();

        // shut down the grid
        grid.deactivateUI();

        // clean up the jobset
        jobset.dispose();
        jobset = null;

        // release references
        grid = null;
        host = null;

        calendar = null;
        manager  = null;
        platform = null;
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

    function verifyHasClass(tc, className, elements, indicesThatShould, msg) {
        for (var i = 0, len = elements.length; i < len; ++i) {
            var el       = elements[i],
                hasClass = Jx.hasClass(el, className),
                should   = (indicesThatShould.indexOf(i) !== -1);

            tc.areEqual(should, hasClass, msg + " " + i);
        }
    }

    //
    // Tests
    //

    Tx.test("YearGridTests.testFocusedDay", function (tc) {
        /// <summary>tests whether the proper values are set in response to choosing a particular
        ///     focus date, including the header, the displayed short month names, and the
        ///     calculated month ordinals which are read out on click</summary>

        tc.cleanup = cleanup;
        setup();

        var a = new Date(2011, 6,   4),
            b = new Date(2011, 10, 10),
            c = new Date(2012, 0,   1);

        var header = document.querySelector(".yearGrid .header"),
            date;

        var yearFormatter = Grid._header;
        function generateHeader(date) {
            return yearFormatter.format(date);
        }

        var monthFormatter = Grid._month;
        function generateMonth(date) {
            return monthFormatter.format(date);
        }

        // first date
        grid.setFocusedDay(a);
        tc.areEqual(generateHeader(a), header.innerText, "July 4 Header");

        date = host.querySelector(".yearGrid .focused").parentNode.firstChild.innerText;
        tc.areEqual(generateMonth(a), date, "July 4 Focused Text");

        date = host.querySelector(".yearGrid .focused").parentNode.getAttribute("data-month");
        tc.areEqual(a.getMonth().toString(), date, "July 4 Stored Ordinal");

        // second date
        grid.setFocusedDay(b);
        tc.areEqual(generateHeader(b), header.innerText, "Nov 10 Header");

        date = host.querySelector(".yearGrid .focused").parentNode.firstChild.innerText;
        tc.areEqual(generateMonth(b), date, "Nov 10 Focused Text");

        date = host.querySelector(".yearGrid .focused").parentNode.getAttribute("data-month");
        tc.areEqual(b.getMonth().toString(), date, "Nov 10 Stored Ordinal");

        // third date
        grid.setFocusedDay(c);
        tc.areEqual(generateHeader(c), header.innerText, "Jan 1 Header");

        date = host.querySelector(".yearGrid .focused").parentNode.firstChild.innerText;
        tc.areEqual(generateMonth(c), date, "Jan 1 Focused Text");

        date = host.querySelector(".yearGrid .focused").parentNode.getAttribute("data-month");
        tc.areEqual(c.getMonth().toString(), date, "Jan 1 Stored Ordinal");

    });

    Tx.test("YearGridTests.testStyle", function (tc) {
        /// <summary>tests that the appropriate stlye classes for today and highlighting are
        ///     set appropriately depending on the where today, the highlighted dates, and
        ///     the current focus are located.</summary>

        tc.cleanup = cleanup;
        setup();

        var a = new Date(2011, 6,  4),
            b = new Date(2012, 0,  1),
            c = new Date(2012, 1, 14);

        var months = qsa(host, ".yearGrid .month");

        tc.areEqual(12, months.length, "Total Months");

        grid.setFocusedDay(a);
        grid.setToday(a);
        grid.setHighlightDates([a, b, c]);
        verifyHasClass(tc, "today",         months, [6], "July 4 Today");
        verifyHasClass(tc, "highlightDate", months, [6], "July 4 Highlight");

        grid.setFocusedDay(b);
        verifyHasClass(tc, "today",         months, [],     "Jan 1 Today");
        verifyHasClass(tc, "highlightDate", months, [0, 1], "Jan 1 Highlight");

        grid.setFocusedDay(c);
        grid.setToday(b);
        verifyHasClass(tc, "today",         months, [0],     "Feb 14 Today");
        verifyHasClass(tc, "highlightDate", months, [0, 1], "Feb 14 Highlight");
    });

    Tx.test("YearGridTests.testClick", function (tc) {
        /// <summary>tests whether clicking each grid item of the rendered display raises
        ///     the appropriate event with the correct value</summary>

        tc.cleanup = cleanup;
        setup();

        var months = qsa(host, ".yearGrid .month"),
            date = new Date(2011, 10, 10);

        var clickEv = document.createEvent("MouseEvents");
        clickEv.initEvent("click", true, true);

        var selected;
        function onDaySelected(ev) {
            selected = ev.data;
        }

        tc.areEqual(12, months.length, "Months");

        grid.setFocusedDay(date);
        grid.on("daySelected", onDaySelected);

        // click each month
        for (var i = 0; i < 12; ++i) {
            months[i].dispatchEvent(clickEv);
            verifySameDate(tc, new Date(2011, i, 1), selected, (i + 1).toString() + "/1");
        }

        grid.detach("daySelected", onDaySelected);
    });
})();