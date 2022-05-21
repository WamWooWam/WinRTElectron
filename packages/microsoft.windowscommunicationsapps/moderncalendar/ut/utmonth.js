
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Calendar,Windows,MockPlatformWorker,MockJobset,runSync,removeTextMarkers,Jx,mockDatePicker,restoreDatePicker,mockQuickEvent,restoreQuickEvent*/

(function () {
    var Month = Calendar.Views.Month,
        Helpers = Calendar.Helpers;

    var platform,
        manager,
        calendar;

    var month = null,
        container = null,
        host = null;

    var jobset = null;
    var worker = null;
    var workerex = null;

    var _activateMonth = false;

    var _originalFirstDayOfWeek;
    var _originalEditEvent;
    var _editEventCalled = false;

    var createEvent = function (subject, start, end, busyStatus, allDay) {
        var event = calendar.createEvent();
        event.subject = subject;
        event.startDate = start;
        event.endDate = end;
        event.busyStatus = busyStatus || 0;
        event.allDayEvent = allDay || false;
        event.commit();
    };

    var getEventWidth = function (n) {
        var percent = (n * 14.28).toFixed(2);
        return percent + "%";
    };

    //
    // Setup
    //
    function setup(activate) {
        /// <summary>setup the test.  by default it creates a worker in the month without activating it for headless tests</summary>
        /// <param name="activate" type="Boolean">(optional) whether to fully activate the month (and later deactivate in cleanup).
        ///        if not provided, interpretted as false (do not activate)</param>

        Helpers.ensureFormats();
        _originalFirstDayOfWeek = Helpers.firstDayOfWeek;
        _originalEditEvent = Helpers.editEvent;
        Helpers.editEvent = function () { _editEventCalled = true; };

        mockDatePicker();
        mockQuickEvent();

        var body = document.body;

        // add our host
        body.insertAdjacentHTML("afterbegin", "<div id='host'></div>");
        host = body.firstElementChild;

        // set up platform
        platform = new Calendar.Mock.Platform();

        // dump the store to remove all events
        manager = platform.calendarManager;
        manager.dumpStore();

        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");

        // create the worker
        worker = new MockPlatformWorker(platform);
        workerex = new Calendar.WorkerEx(worker);

        // create the jobset
        jobset = new MockJobset();

        // create the month component
        month = new Month();

        // intercept app events
        month.on("getPlatform", function (ev) {
            ev.data.platform = platform;
        });
        month.on("getPlatformWorker", function (ev) {
            ev.data.platformWorker = workerex;
        });
        month.on("getSettings", function (ev) {
            ev.data.settings = {
                get: function () {
                    return false;
                }
            };
        });

        if (activate) {
            _activateMonth = true;

            runSync(function () {
                host.innerHTML = Jx.getUI(month).html;
                month.activateUI(jobset);
            });
        } else {
            _activateMonth = false;

            month._getWorker();
        }

        // set grid height
        month._gridHeight = 864;
    }

    //
    // Tear down
    //
    function cleanup() {
        // do we need to deactivate?
        if (_activateMonth) {
            runSync(function () {
                month.deactivateUI();
            });
        }

        // clean up worker
        workerex.dispose();
        worker.dispose();

        workerex = null;
        worker = null;

        // remove test events
        manager.dumpStore();

        container = null;
        month = null;

        jobset.dispose();
        jobset = null;

        calendar = null;
        manager = null;
        platform = null;

        if (host) {
            document.body.removeChild(host);
            host = null;
        }

        restoreDatePicker();
        restoreQuickEvent();

        Helpers.firstDayOfWeek = _originalFirstDayOfWeek;
        Helpers.editEvent = _originalEditEvent;
    }

    Tx.test("MonthTests.testGetItem", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var item, expected;

        Helpers.firstDayOfWeek = 0;

        function validateItem(expected, item, description) {
            tc.areEqual(expected.date.getTime(), item.date.getTime(), "Incorrect date for: " + description);
            tc.areEqual(expected.numDays, item.numDays, "Incorrect numDays for: " + description);
            tc.areEqual(expected.numWeeks, item.numWeeks, "Incorrect numWeeks for: " + description);
            tc.areEqual(expected.firstDayOffset, item.firstDayOffset, "Incorrect offset for: " + description);
        }

        var dates = [new Date(2011, 5), new Date(2009, 1)],
            expectedItems = [{
                date: dates[0],
                numDays: 30,
                numWeeks: 5,
                firstDayOffset: 3
            }, {
                date: dates[1],
                numDays: 28,
                numWeeks: 4,
                firstDayOffset: 0
            }],
            now = new Date();

        for (var i = 0; i < dates.length; i++) {
            item = month.getItem(Helpers.getMonthsBetween(now, dates[i])),
            expected = expectedItems[i];

            validateItem(expected, item, i);
        }

        // Also that things work correctly with a different firstDayOfWeek
        Helpers.firstDayOfWeek = 6;

        var date = new Date(2011, 0);

        expected = {
            date: date,
            numDays: 31,
            numWeeks: 5,
            firstDayOffset: 0
        };

        validateItem(expected, month.getItem(Helpers.getMonthsBetween(now, date)), "modified first day of week");
    });

    var setupGrid = function (item) {
        // setup host element
        var el = document.createElement("div");
        month._host = el;
        el.innerHTML = month._renderer(item);
        container = el.firstChild;

        // create expected properties
        container.jobset = jobset;
        container._events = container.querySelector(".events");
        container._header = container.querySelector(".header");
        container._grid = container.querySelector(".grid");
        container._days = container.querySelector(".days").childNodes;

        var days = container._days;
        for (var i = 0; i < days.length; i++) {
            var day = days[i],
                dayName = day.querySelector(".dayName");
            if (dayName) {
                day._dayName = dayName;
            }
        }
        days._weekends = [];
        days._today = null;

        // setup event handlers
        container._onEventsClicked = month._onEventsClicked.bind(month, month.getItem(0), container);
        container._events.addEventListener("mouseup", container._onEventsClicked, false);

        return container;
    };

    Tx.test("MonthTests.testConfigureGrid", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var dates = [new Date(2009, 1), new Date(2009, 4), new Date()],
            now = new Date(),
            j;

        var monthFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("month");

        for (var i = 0; i < dates.length; i++) {
            var date = dates[i],
                item = month.getItem(Helpers.getMonthsBetween(now, date)),
                el = setupGrid(item);

            month._configureGrid(item, el);

            // verify header
            var matches = removeTextMarkers(el._header.innerText).match("(\\S+) (\\d+)"),
                monthText = matches[1],
                yearText = matches[2];
            tc.areEqual(removeTextMarkers(monthFormatter.format(date)), monthText, "Incorrect header month");
            tc.areEqual(date.getFullYear() + "", yearText, "Incorrect header year");

            // verify today
            var today = el.querySelectorAll(".today");
            tc.isTrue(today.length === 0 || today.length === 1, "More than one today in: " + date);

            // verify next month dates
            var nextMonthDays = el.querySelectorAll(".nextMonth:not(.hidden) .date");
            for (j = 0; j < nextMonthDays.length; j++) {
                var nextMonthDay = nextMonthDays[j],
                    nextMonthText = nextMonthDay.lastChild.nodeValue;

                tc.areEqual((j + 1) + "",
                                         nextMonthText,
                                         "Text is incorrect for next month days in " + date);
            }

            // verify last month dates            
            var lastMonthDays = el.querySelectorAll(".lastMonth:not(.hidden) .date"),
                daysLastMonth = (new Date(date.getFullYear(), date.getMonth(), 0)).getDate();
            for (j = 0; j < lastMonthDays.length; j++) {
                var lastMonthDay = lastMonthDays[j],
                    lastMonthText = lastMonthDay.lastChild.nodeValue;

                tc.areEqual((daysLastMonth - lastMonthDays.length + j + 1) + "",
                                         lastMonthText,
                                         "Text is incorrect for last month days in " + date);
            }

            var thisMonthDays = el.querySelectorAll(".thisMonth:not(.hidden)");

            // verify grid size
            var gridSize = thisMonthDays.length + nextMonthDays.length + lastMonthDays.length;
            tc.areEqual(0, gridSize % 7, "Gridsize isn't a multiple of 7 for month of " + date);

            // verify everything else is hidden
            var hidden = el.querySelectorAll(".hidden > div");
            tc.areEqual(0, el._days.length - gridSize - hidden.length, "Sum of hidden and non-hidden elements must be equal to the number of children");
        }
    });

    Tx.test("MonthTests.testOverflow", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var el;
        var date = new Date(1983, 10, 26),
            now = new Date(),
            item = month.getItem(Helpers.getMonthsBetween(now, date));

        item.dayHeight = Math.floor((month._gridHeight / item.numWeeks) - 3);
        item.eventsPerDay = month._getEventsPerDay(item);
        item.eventHeight = month._getEventHeight(item);

        var eventsPerDay = item.eventsPerDay;

        for (var i = 0; i < eventsPerDay; i++) {
            tc.log(i + " events");

            el = setupGrid(item);

            /*jshint loopfunc:true*/  // TODO: can this be pulled out in any meaningful way?
            // make another event, generate ui
            runSync(function () {
                createEvent("test", date, date);
                month._workerIds[workerex._nextId] = el;
                month._getEvents(item, el);
            });
            /*jshint loopfunc:false*/

            // should be no overflows in this loop
            tc.isNull(el._events.querySelector(".overflow"), "Found an overflow");

            // cleanup
            workerex.postCommand("Month/cancel", null, item.workerId);
        }

        for (i = 0; i < 5; i++) {
            tc.log((i + eventsPerDay) + " events");

            el = setupGrid(item);

            /*jshint loopfunc:true*/  // TODO: can this be pulled out in any meaningful way?
            // make another event, generate ui
            runSync(function () {
                createEvent("test", date, date);
                month._workerIds[workerex._nextId] = el;
                month._getEvents(item, el);
            });
            /*jshint loopfunc:false*/

            // should be an overflow
            var overflow = el._events.querySelector(".overflow");
            tc.isNotNull(overflow, "Did not find an overflow");
            tc.areEqual(Month.OVERFLOW_EVENTS(i + 1 + eventsPerDay), overflow.textContent);

            // cleanup
            workerex.postCommand("Month/cancel", null, item.workerId);
        }
    });

    Tx.test("MonthTests.testGlyph", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var now = new Date(),
            item = month.getItem(0);

        item.eventsPerDay = month._getEventsPerDay(item);

        for (var i = 0; i < Helpers.busyStatusClasses.length; i++) {
            var el = setupGrid(item);

            /*jshint loopfunc:true*/  // TODO: can this be pulled out in any meaningful way?
            runSync(function () {
                createEvent("test", now, now, i);
                month._workerIds[workerex._nextId] = el;
                month._getEvents(item, el);
            });
            /*jshint loopfunc:false*/

            // if busy then no glyph
            var event = el._events.querySelector(".event");

            // get busy attribute
            var status = event.getAttribute("data-status");
            tc.isTrue(status === Helpers.busyStatusClasses[i], "Missing glyph class");

            // cleanup
            workerex.postCommand("Month/cancel", null, item.workerId);
            manager.dumpStore();

            // recreate the test calendar
            calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");
        }
    });

    Tx.test("MonthTests.testEventContent", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var date = new Date(2011, 5, 27),
            now = new Date(),
            item = month.getItem(Helpers.getMonthsBetween(now, date));

        item.eventsPerDay = month._getEventsPerDay(item);

        createEvent("Normal", date, date);

        // render
        var el = setupGrid(item);
        runSync(function () {
            month._workerIds[workerex._nextId] = el;
            month._getEvents(item, el);
        });

        // verify content
        var event = el._events.querySelector(".event");
        tc.isNotNull(event, "Couldn't find event");

        var subject = event.querySelector(".subject");
        tc.isNotNull(subject, "Couldn't find subject");
        tc.areEqual("Normal", subject.innerHTML, "Subject does not match");

        var time = event.querySelector(".time");
        tc.isNotNull(time, "Couldn't find time");
        tc.areEqual(Calendar.Helpers.simpleTime.format(new Date(2012, 8, 8, 0)), time.innerHTML, "Time does not match");
    });

    Tx.test("MonthTests.testAllDayEventContent", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var date = new Date(2011, 5, 27),
            now = new Date(),
            item = month.getItem(Helpers.getMonthsBetween(now, date));

        item.eventsPerDay = month._getEventsPerDay(item);

        createEvent("All Day", date, date, 2, true);

        // render
        var el = setupGrid(item);
        runSync(function () {
            month._workerIds[workerex._nextId] = el;
            month._getEvents(item, el);
        });

        // verify content
        var event = el._events.querySelector(".event");
        tc.isNotNull(event, "Couldn't find event");

        var subject = event.querySelector(".subject");
        tc.isNotNull(subject, "Couldn't find subject");
        tc.areEqual("All Day", subject.innerHTML, "Subject does not match");

        var time = event.querySelector(".time");
        tc.isNull(time, "Shouldn't have time on an all day event");
    });

    Tx.test("MonthTests.testEventMidnight", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var startDate = new Date(2011, 5, 27),
            endDate = new Date(2011, 5, 28),
            now = new Date(),
            item = month.getItem(Helpers.getMonthsBetween(now, startDate));

        item.eventsPerDay = month._getEventsPerDay(item);

        createEvent("All Day", startDate, endDate);

        // render
        var el = setupGrid(item);
        runSync(function () {
            month._workerIds[workerex._nextId] = el;
            month._getEvents(item, el);
        });

        // verify that it only spans one day
        var event = el._events.querySelector(".event");
        tc.areEqual("14.28%", event.style.width, "Ending on midnight shouldn't span days");
    });

    Tx.test("MonthTests.testEventMultiDayLayout", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Helpers.firstDayOfWeek = 0;

        var startDate = new Date(2011, 5, 0), // June 1, 2011
            endDate = new Date(2011, 5, 31),
            date = new Date(2011, 5),
            now = new Date(),
            item = month.getItem(Helpers.getMonthsBetween(now, date));

        item.dayHeight = Math.floor((month._gridHeight / item.numWeeks) - 3);
        item.eventsPerDay = month._getEventsPerDay(item);
        item.eventHeight = month._getEventHeight(item);

        createEvent("Months Spanning Event", startDate, endDate);

        // render
        var el = setupGrid(item);
        runSync(function () {
            month._workerIds[workerex._nextId] = el;
            month._getEvents(item, el);
        });

        // verify that it drew in the right place
        var events = el._events.querySelectorAll(".event");
        tc.areEqual(5, events.length, "Should have five divs");

        tc.areEqual("28.56%", events[0].style.left, "First row left");
        tc.areEqual("calc(80% + 84.00px)", events[0].style.bottom, "First row bottom");
        tc.areEqual("71.4%", events[0].style.width, "First row width");

        tc.areEqual("0%", events[1].style.left, "Second row left");
        tc.areEqual("calc(60% + 84.00px)", events[1].style.bottom, "Second row bottom");
        tc.areEqual("99.96%", events[1].style.width, "Second row width");

        tc.areEqual("0%", events[2].style.left, "Third row left");
        tc.areEqual("calc(40% + 84.00px)", events[2].style.bottom, "Third row bottom");
        tc.areEqual("99.96%", events[2].style.width, "Third row width");

        tc.areEqual("0%", events[3].style.left, "Fourth row left");
        tc.areEqual("calc(20% + 84.00px)", events[3].style.bottom, "Fourth row bottom");
        tc.areEqual("99.96%", events[3].style.width, "Fourth row width");

        tc.areEqual("0%", events[4].style.left, "Fifth row left");
        tc.areEqual("calc(0% + 84.00px)", events[4].style.bottom, "Fifth row bottom");
        tc.areEqual("71.4%", events[4].style.width, "Fifth row width");
    });

    Tx.test("MonthTests.testEventLayout", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Helpers.firstDayOfWeek = 0;

        var date = new Date(2011, 5), // June 1, 2011
            end = new Date(2011, 5, 1, 1),
            now = new Date(),
            item = month.getItem(Helpers.getMonthsBetween(now, date));

        item.dayHeight = Math.floor((month._gridHeight / item.numWeeks) - 3);
        item.eventsPerDay = month._getEventsPerDay(item);
        item.eventHeight = month._getEventHeight(item);

        createEvent("multi", date, new Date(2011, 5, 4, 1)); // June 1st - June 4th (Saturday)
        createEvent("all", date, end, 0, true);
        createEvent("single", date, end);

        // render
        var el = setupGrid(item);
        runSync(function () {
            month._workerIds[workerex._nextId] = el;
            month._getEvents(item, el);
        });

        // verify that it drew in the right place
        var events = el._events.querySelectorAll(".event");

        tc.areEqual(getEventWidth(3), events[0].style.left, "Event 1 left");
        tc.areEqual("calc(80% + 84.00px)", events[0].style.bottom, "Event 1 bottom");
        tc.areEqual("57.12%", events[0].style.width, "Event 1 width");

        tc.areEqual(getEventWidth(3), events[1].style.left, "Event 2 left");
        tc.areEqual("calc(80% + 42.00px)", events[1].style.bottom, "Event 2 bottom");
        tc.areEqual("14.28%", events[1].style.width, "Event 2 width");

        tc.areEqual(getEventWidth(3), events[2].style.left, "Event 3 left");
        tc.areEqual("calc(80% + 0.00px)", events[2].style.bottom, "Event 3 bottom");
        tc.areEqual("14.28%", events[2].style.width, "Event 3 width");
    });

    function validateChevrons(tc, month) {
        var chevrons = host.querySelectorAll(".dateChevron"),
            selChevrons = host.querySelectorAll(".activeAnchor .dateChevron"),
            todayEl = month._timeline.getRealized()[0].el,
            todaySel = todayEl.querySelectorAll(".activeAnchor .dateChevron");

        tc.isTrue(chevrons.length > 1, "Expected to find multiple chevrons");
        tc.areEqual(selChevrons.length, 1, "Expected to find single active chevron");
        tc.areEqual(todaySel.length, 1, "Expected active chevron on today");
    }

    Tx.test("MonthTests.testHeaderHtml", function (tc) {
        var activate = true;
        tc.cleanup = cleanup;
        setup(activate);

        runSync(function () {
            month._timeline._onScroll();
        });
        validateChevrons(tc, month);

        runSync(function () {
            month.setFocusedDay(new Date("1/3/2011"));
            month._timeline._onScroll();
        });
        validateChevrons(tc, month);
    });

    Tx.test("MonthTests.testOnShowArrows", function (tc) {
        var activate = true;
        tc.cleanup = cleanup;
        setup(activate);

        var mockEvent = {
            value: true
        };

        month.fire("showArrows", mockEvent);
        tc.isTrue(month._timeline._alwaysShowArrows, "Arrows are not shown when they should be");

        mockEvent.value = false;

        month.fire("showArrows", mockEvent);
        tc.isFalse(!!month._timeline._alwaysShowArrows, "Arrows are shown when they shouldn't be");
    });

    Tx.test("MonthTests.testContainsDate", function (tc) {
        var activate = false;
        tc.cleanup = cleanup;
        setup(activate);

        var aug31 = new Date(2013, 7, 31);
        var sep1 = new Date(2013, 8, 1);
        var sep30 = new Date(2013, 8, 30);
        var oct1 = new Date(2013, 9, 1);
        var sep2014 = new Date(2014, 8, 23);
        var today = new Date(2013, 8, 15);

        month._updateToday(today);
        month.setFocusedDay(today);

        tc.isFalse(month.containsDate(aug31), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(oct1), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(sep2014), "Date contained in view when it shouldn't be");
        tc.isTrue(month.containsDate(sep1), "Date not contained in view when it should be");
        tc.isTrue(month.containsDate(sep30), "Date not contained in view when it should be");

        month.setFocusedDay(new Date(2013, 9, 15));

        tc.isFalse(month.containsDate(aug31), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(sep1), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(sep2014), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(sep30), "Date contained in view when it shouldn't be");
        tc.isTrue(month.containsDate(oct1), "Date not contained in view when it should be");

        month.setFocusedDay(new Date(2013, 7, 15));

        tc.isFalse(month.containsDate(oct1), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(sep1), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(sep2014), "Date contained in view when it shouldn't be");
        tc.isFalse(month.containsDate(sep30), "Date contained in view when it shouldn't be");
        tc.isTrue(month.containsDate(aug31), "Date not contained in view when it should be");
    });

    Tx.test("MonthTests.testOnTabKey", function (tc) {
        var activate = true;
        tc.cleanup = cleanup;
        setup(activate);

        var today = new Date();
        var event1Start = new Date(today.getFullYear(), today.getMonth(), 23, 8);
        var event1End = new Date(today.getFullYear(), today.getMonth(), 23, 9);
        var event2Start = new Date(today.getFullYear(), today.getMonth(), 24, 8);
        var event2End = new Date(today.getFullYear(), today.getMonth(), 24, 9);

        runSync(function () {
            createEvent("event1", event1Start, event1End);
            createEvent("event2", event2Start, event2End);
        });

        var events = month._host.querySelectorAll(".event");

        var tabEvent = $.Event("keydown", { keyCode: Jx.KeyCode.tab });
        var shiftTabEvent = $.Event("keydown", { keyCode: Jx.KeyCode.tab, shiftKey: true });

        // tab to first event
        month._onKeyDownNav(tabEvent);
        tc.areEqual(events[0], month._host.querySelector(":focus"), "Focused element is not the correct event");

        // tab to second event
        month._onKeyDownNav(tabEvent);
        tc.areEqual(events[1], month._host.querySelector(":focus"), "Focused element is not the correct event");

        // stay on second event since it is the last event
        month._onKeyDownNav(tabEvent);
        tc.areEqual(events[1], month._host.querySelector(":focus"), "Focused element is not the correct event");

        // tab back to first event
        month._onKeyDownNav(shiftTabEvent);
        tc.areEqual(events[0], month._host.querySelector(":focus"), "Focused element is not the correct event");

        // tab to header
        month._onKeyDownNav(shiftTabEvent);
        tc.areEqual("anchorText", month._host.querySelector(":focus").className, "Focused element is not the header");
    });

    Tx.test("MonthTests.testOnArrowKey", function (tc) {
        var activate = true;
        tc.cleanup = cleanup;
        setup(activate);

        var downArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.downarrow });
        var upArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.uparrow });
        var leftArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.leftarrow });
        var rightArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.rightarrow });

        var days = month._timeline.getRealized()[0].el.querySelectorAll(".days [tabIndex]:not(.hidden)");
         
        // focus on hidden day originally
        document.querySelector(".days [tabIndex].hidden").focus();

        // arrow to first non hidden day
        month._onKeyDownNav(leftArrowEvent);
        tc.areEqual(days[0], month._host.querySelector(":focus"), "Focus not on the expected day");

        // left arrow when on first day should remain on first day
        month._onKeyDownNav(leftArrowEvent);
        tc.areEqual(days[0], month._host.querySelector(":focus"), "Focus not on the expected day");

        // up arrow to header
        month._onKeyDownNav(upArrowEvent);
        tc.areEqual("anchorText", month._host.querySelector(":focus").className, "Expected focus to be the header");

        // down arrow to first day
        month._onKeyDownNav(downArrowEvent);
        tc.areEqual(days[0], month._host.querySelector(":focus"), "Focus not on the expected day");

        // right arrow to second day
        month._onKeyDownNav(rightArrowEvent);
        tc.areEqual(days[1], month._host.querySelector(":focus"), "Focus not on the expected day");

        // down arrow to second week second day
        month._onKeyDownNav(downArrowEvent);
        tc.areEqual(days[8], month._host.querySelector(":focus"), "Focus not on the expected day");

        // left arrow to second week first day
        month._onKeyDownNav(leftArrowEvent);
        tc.areEqual(days[7], month._host.querySelector(":focus"), "Focus not on the expected day");

        // left arrow to first week last day
        month._onKeyDownNav(leftArrowEvent);
        tc.areEqual(days[6], month._host.querySelector(":focus"), "Focus not on the expected day");

        // right arrow to second week first day
        month._onKeyDownNav(rightArrowEvent);
        tc.areEqual(days[7], month._host.querySelector(":focus"), "Focus not on the expected day");

        // up arrow to first day
        month._onKeyDownNav(upArrowEvent);
        tc.areEqual(days[0], month._host.querySelector(":focus"), "Focus not on the expected day");

        // last day should stay focused for down/right arrow
        days[days.length - 1].focus();

        month._onKeyDownNav(downArrowEvent);
        tc.areEqual(days[days.length - 1], month._host.querySelector(":focus"), "Focus not on the expected day");

        month._onKeyDownNav(rightArrowEvent);
        tc.areEqual(days[days.length - 1], month._host.querySelector(":focus"), "Focus not on the expected day");
    });    

    function firePointerClickEvent(target, ev, suppressPointerEvent) {
        ev.target = target;
        ev.pageX = target.offsetLeft;
        ev.pageY = target.offsetTop;

        if (!suppressPointerEvent) {
            month._onPointerDown(ev);
        }

        month._onClick(ev);
    }

    Tx.test("MonthTests.testPointerAndClickEvents", function (tc) {
        var activate = true;
        tc.cleanup = cleanup;
        setup(activate);

        var mockPointerClickEvent = {
            preventDefault: function () { },
            stopPropagation: function () { },
            currentTarget: month._host,
            type: "click",
            button: 0,
            ctrlKey: false
        };

        var today = new Date();
        var firstDate = new Date(today.getFullYear(), today.getMonth(), 1, 9);

        runSync(function () {
            var eventTime = 8;            
            for (var i = 0; i < 6; i++) {
                createEvent("event", new Date(today.getFullYear(), today.getMonth(), today.getDate(), eventTime++), new Date(today.getFullYear(), today.getMonth(), today.getDate(), eventTime++));
            }
        });

        var firstDay = month._host.querySelector(".days .day.thisMonth");
        var secondDay = firstDay.nextSibling;
        var event = month._host.querySelector(".event");
        var overflow = month._host.querySelector(".overflowToday");
        var createEventData = null;
        var dayChosenData = null;        

        month.on("createEvent", function (data) {
            createEventData = data;
        });

        month.on("dayChosen", function (day) {
            dayChosenData = day;
        });

        // A click/pen tap/touch fires a PointerDown event, then a click event. Only exception is when the event comes from accessibility

        // launch quick edit
        firePointerClickEvent(firstDay, mockPointerClickEvent);
        tc.isTrue(month._quickEvent && month._quickEvent.isOpen(), "Expected quick event to be open");
        tc.areEqual(month._quickEvent._date.getTime(), firstDate.getTime(), "Quick event open on incorrect date");

        // dismiss quick edit
        firePointerClickEvent(secondDay, mockPointerClickEvent);
        tc.isTrue(month._quickEvent && !month._quickEvent.isOpen(), "Expected quick event to not be opened");

        // edit event
        firePointerClickEvent(event, mockPointerClickEvent);
        tc.isTrue(_editEventCalled, "Expected edit event to be called");
        _editEventCalled = false;

        // edit event - accessibility
        firePointerClickEvent(event, mockPointerClickEvent, true);
        tc.isTrue(_editEventCalled, "Expected edit event to be called");
        _editEventCalled = false;

        // overflow
        runSync(function () {
            firePointerClickEvent(overflow, mockPointerClickEvent);
            tc.areEqual(dayChosenData.data.getTime(), new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime());
            dayChosenData = null;
        });

        // overflow - accessibility
        runSync(function () {
            firePointerClickEvent(overflow, mockPointerClickEvent, true);
            tc.areEqual(dayChosenData.data.getTime(), new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime());
            dayChosenData = null;
        });

        mockPointerClickEvent.ctrlKey = true;

        // event details
        runSync(function () {
            firePointerClickEvent(firstDay, mockPointerClickEvent);
            tc.areEqual(createEventData.data.startDate.getTime(), firstDate.getTime(), "Event details opened on the wrong date");
            createEventData = null;
        });

        // event details - accessibility
        runSync(function () {
            firePointerClickEvent(firstDay, mockPointerClickEvent, true);
            tc.areEqual(createEventData.data.startDate.getTime(), firstDate.getTime(), "Event details opened on the wrong date");
            createEventData = null;
        });
    });    
})();