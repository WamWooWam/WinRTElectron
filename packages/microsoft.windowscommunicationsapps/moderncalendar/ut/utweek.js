
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,document,KeyboardEvent,Jx,Tx,Calendar,Microsoft,MockPlatformWorker,MockJobset,runSync,mockTimeIndicator,restoreTimeIndicator,removeTextMarkers,getComputedStyle,mockDatePicker,restoreDatePicker,Windows*/

(function() {
    var Week    = Calendar.Views.Week,
        Helpers = Calendar.Helpers;

    var week,
        host;

    var jobset, worker, workerex;

    var platform,
        manager,
        calendar;

    var ev1,
        ev2,
        ev3,
        ev4,
        ev5,
        ev6,
        ev7,
        ev8,
        ev9;

    var WEEK_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

    var oldFirstDay;

    var left,
        right;

    function getTimeRange(from, to) {
        return "TimeRange;" + from + ";" + to;
    }

    //
    // Setup
    //

    function setup() {
        // set up platform
        platform = new Calendar.Mock.Platform();

        // dump the store to remove all events
        manager = platform.calendarManager;
        manager.dumpStore();

        // prepare our test calendar
        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");
        calendar.name = "Week UTs";

        var body = document.body;

        // add our host
        host = document.createElement("div");
        host.id = "host";
        body.insertBefore(host, body.firstChild);

        // create the worker
        worker   = new MockPlatformWorker(platform);
        workerex = new Calendar.WorkerEx(worker);

        // create the jobset
        jobset = new MockJobset();

        // create the week view
        Helpers.ensureFormats();
        oldFirstDay = Helpers.firstDayOfWeek;
        Helpers.firstDayOfWeek = 1;

        mockTimeIndicator();
        mockDatePicker();
        week = new Week();

        left  = -week.left();
        right =  week.right();

        // respond to week view events
        week.on("getPlatform", function(ev) {
            ev.data.platform = platform;
        });
        week.on("getPlatformWorker", function(ev) {
            ev.data.platformWorker = workerex;
        });
        week.on("getSettings", function(ev) {
            ev.data.settings = {
                get: function() {
                    return false;
                }
            };
        });

        // initialize the week view
        runSync(function() {
            host.innerHTML = Jx.getUI(week).html;
            week.activateUI(jobset);
        });

        // Test formatting against fullscreen
        week._isNarrow = false;
        week._isTall   = false;
    }

    //
    // Teardown
    //

    function cleanup() {
        restoreDatePicker();
        restoreTimeIndicator();

        // shut down the week
        runSync(function () {
            if (week) {
                week.deactivateUI();
                Week._name = null;
            }
        });

        // clean up worker
        workerex.dispose();
        worker.dispose();

        workerex = null;
        worker = null;

        // clean up the jobset
        jobset.dispose();
        jobset = null;

        // get rid of any test events we created
        manager.dumpStore();

        // remove our elements
        document.body.removeChild(host);

        // release references
        week = null;
        host = null;

        calendar = null;
        manager  = null;
        platform = null;

        Helpers.firstDayOfWeek = oldFirstDay;
    }

    //
    // Tests
    //

    function normalize(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function verifySameDate(tc, a, b, msg) {
        tc.areEqual(normalize(a).toString(), normalize(b).toString(), msg);
    }

    // API

    Tx.test("WeekTests.testGetFocusedDay", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var now  = new Date(),
            date = new Date(2011, 0, 1);

        week._focusedDay   = date;
        week._focusedIndex = 0;
        verifySameDate(tc, now, week.getFocusedDay(), "Today For Index 0");

        week._focusedIndex = 2;
        verifySameDate(tc, date, week.getFocusedDay(), "Date For Index 2");

        var nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        week.setFocusedDay(nextWeek);

        verifySameDate(tc, nextWeek, week.getFocusedDay(), "Next Week Day");
        tc.areEqual(1, week._focusedIndex, "Next Week Index");
    });

    Tx.test("WeekTests.testGetItem", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var now = new Date();

        var item,
            diff;

        item = week.getItem(0);
        diff = now - item;

        tc.isTrue(0 <= diff && diff <= WEEK_IN_MILLISECONDS, "This Week");
        tc.areEqual(Helpers.firstDayOfWeek, item.getDay(),   "This Week Day");

        item = week.getItem(left);
        diff = Calendar.FIRST_DAY - item;

        tc.isTrue(0 <= diff && diff <= WEEK_IN_MILLISECONDS, "First");
        tc.areEqual(Helpers.firstDayOfWeek, item.getDay(),   "First Day");

        item = week.getItem(right);
        diff = Calendar.LAST_DAY - item;

        tc.isTrue(0 <= diff && diff <= WEEK_IN_MILLISECONDS, "Last");
        tc.areEqual(Helpers.firstDayOfWeek, item.getDay(),   "Last Day");
    });

    Tx.test("WeekTests.testGetItemIllegalLeft", function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () {
            week.getItem(left - 1);
        }, "Index for Calendar.Views.Week is out of bounds (" + (left - 1) + " < " + left + ").");
    });

    Tx.test("WeekTests.testGetItemIllegalRight", function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () {
            week.getItem(right + 1);
        }, "Index for Calendar.Views.Week is out of bounds (" + (right + 1) + " > " + right + ").");
    });

    Tx.test("WeekTests.testContainsDate", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var date = new Date("7/4/2011"),
            prev = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
            last = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6),
            next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);

        week.setFocusedDay(date);

        tc.isTrue(week.containsDate(date), "Contains set day");
        tc.isTrue(week.containsDate(last), "Contains last day");

        tc.isFalse(week.containsDate(prev), "Contains previous day");
        tc.isFalse(week.containsDate(next), "Contains next week");
    });

    // UI

    Tx.test("WeekTests.testHeader", function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.areEqual("January 2011",  removeTextMarkers(week._getHeaderText(new Date("1/1/2011"))));
        tc.areEqual("February 2011", removeTextMarkers(week._getHeaderText(new Date("2/1/2011"))));

        tc.areEqual("May 2011", removeTextMarkers(week._getHeaderText(new Date("5/23/2011"))));
        tc.areEqual("May 2011", removeTextMarkers(week._getHeaderText(new Date("5/24/2011"))));
        tc.areEqual("May 2011", removeTextMarkers(week._getHeaderText(new Date("5/25/2011"))));

        tc.areEqual(getTimeRange("May 2011", "June 2011"), removeTextMarkers(week._getHeaderText(new Date("5/26/2011"))));
        tc.areEqual(getTimeRange("May 2011", "June 2011"), removeTextMarkers(week._getHeaderText(new Date("5/27/2011"))));
        tc.areEqual(getTimeRange("May 2011", "June 2011"), removeTextMarkers(week._getHeaderText(new Date("5/28/2011"))));
        tc.areEqual(getTimeRange("May 2011", "June 2011"), removeTextMarkers(week._getHeaderText(new Date("5/29/2011"))));
        tc.areEqual(getTimeRange("May 2011", "June 2011"), removeTextMarkers(week._getHeaderText(new Date("5/30/2011"))));
        tc.areEqual(getTimeRange("May 2011", "June 2011"), removeTextMarkers(week._getHeaderText(new Date("5/31/2011"))));

        tc.areEqual("December 2010", removeTextMarkers(week._getHeaderText(new Date("12/24/2010"))));
        tc.areEqual("December 2010", removeTextMarkers(week._getHeaderText(new Date("12/25/2010"))));

        tc.areEqual(getTimeRange("December 2010", "January 2011"), removeTextMarkers(week._getHeaderText(new Date("12/26/2010"))));
        tc.areEqual(getTimeRange("December 2010", "January 2011"), removeTextMarkers(week._getHeaderText(new Date("12/27/2010"))));
        tc.areEqual(getTimeRange("December 2010", "January 2011"), removeTextMarkers(week._getHeaderText(new Date("12/28/2010"))));
        tc.areEqual(getTimeRange("December 2010", "January 2011"), removeTextMarkers(week._getHeaderText(new Date("12/29/2010"))));
        tc.areEqual(getTimeRange("December 2010", "January 2011"), removeTextMarkers(week._getHeaderText(new Date("12/30/2010"))));
        tc.areEqual(getTimeRange("December 2010", "January 2011"), removeTextMarkers(week._getHeaderText(new Date("12/31/2010"))));
    });

    var slice = Array.prototype.slice;

    function getFirstItem() {
        return week._timeline.getRealized()[0].el;
    }

    function queryFirstItem(query) {
        return getFirstItem().querySelector(query);
    }

    function validateChevrons(tc, week) {
        var chevrons    = host.querySelectorAll(".dateChevron"),
            selChevrons = host.querySelectorAll(".activeAnchor .dateChevron"),
            todayEl     = week._timeline.getRealized()[0].el,
            todaySel    = todayEl.querySelectorAll(".activeAnchor .dateChevron");

        tc.isTrue(chevrons.length > 1, "Expected to find multiple chevrons");
        tc.areEqual(selChevrons.length, 1, "Expected to find single active chevron");
        tc.areEqual(todaySel.length, 1, "Expected active chevron on today");
    }

    Tx.test("WeekTests.testHeaderHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        // run as sync to give the timeline a chance to update the off-screen instances
        runSync(function(){
            week.setFocusedDay(new Date("1/3/2011"));
            week._timeline._onScroll();
        });
        tc.areEqual("January 2011", removeTextMarkers(queryFirstItem(".header .anchorText").innerText));
        validateChevrons(tc, week);

        runSync(function(){
            week.setFocusedDay(new Date("5/29/2011"));
            week._timeline._onScroll();
        });
        tc.areEqual("May 2011", removeTextMarkers(queryFirstItem(".header .anchorText").innerText));
        validateChevrons(tc, week);

        runSync(function(){
            week.setFocusedDay(new Date("5/30/2011"));
            week._timeline._onScroll();
        });
        tc.areEqual(getTimeRange("May 2011", "June 2011"), removeTextMarkers(queryFirstItem(".header .anchorText").innerText));
        validateChevrons(tc, week);

        runSync(function(){
            week.setFocusedDay(new Date("12/29/2007"));
            week._timeline._onScroll();
        });
        tc.areEqual("December 2007", removeTextMarkers(queryFirstItem(".header .anchorText").innerText));
        validateChevrons(tc, week);

        runSync(function(){
            week.setFocusedDay(new Date("12/31/2007"));
            week._timeline._onScroll();
        });
        tc.areEqual(getTimeRange("December 2007", "January 2008"), removeTextMarkers(queryFirstItem(".header .anchorText").innerText));
        validateChevrons(tc, week);
    });

    Tx.test("WeekTests.testDays", function (tc) {
        tc.cleanup = cleanup;
        setup();

        week.setFocusedDay(new Date("5/2/2011"));
        week._timeline._onScroll();

        var days = queryFirstItem(".days").innerText.replace(/[\r\n]/g, "");
        tc.areEqual("Monday 2Tuesday 3Wednesday 4Thursday 5Friday 6Saturday 7Sunday 8", days);

        week.setFocusedDay(new Date("5/5/2011"));
        week._timeline._onScroll();

        days = queryFirstItem(".days").innerText.replace(/[\r\n]/g, "");
        tc.areEqual("Monday 2Tuesday 3Wednesday 4Thursday 5Friday 6Saturday 7Sunday 8", days);

        week.setFocusedDay(new Date("6/1/2011"));
        week._timeline._onScroll();

        days = queryFirstItem(".days").innerText.replace(/[\r\n]/g, "");
        tc.areEqual("Monday 30Tuesday 31Wednesday 1Thursday 2Friday 3Saturday 4Sunday 5", days);
    });

    // Events

    function createEvents() {
        ev1 = calendar.createEvent();
        ev1.startDate = new Date("6/13/2011 12:00pm");
        ev1.endDate   = new Date("6/14/2011 6:00am");

        ev1.subject    = "1";
        ev1.location   = "a";
        ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev1.commit();

        ev2 = calendar.createEvent();
        ev2.startDate = new Date("6/14/2011");
        ev2.endDate   = new Date("6/14/2011 12:00pm");

        ev2.subject  = "2";
        ev2.location = "b";
        ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.workingElsewhere;
        ev2.commit();
    }

    function createAllDayEvents() {
        ev3 = calendar.createEvent();
        ev3.startDate   = new Date("6/13/2011");
        ev3.endDate     = new Date("6/14/2011 12:00pm");
        ev3.allDayEvent = true;

        ev3.subject    = "3";
        ev3.location   = "c";
        ev3.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev3.commit();

        ev4 = calendar.createEvent();
        ev4.startDate   = new Date("6/14/2011");
        ev4.endDate     = new Date("6/14/2011 12:00pm");
        ev4.allDayEvent = true;

        ev4.subject  = "4";
        ev4.location = "d";
        ev4.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.workingElsewhere;
        ev4.commit();

        ev5 = calendar.createEvent();
        ev5.startDate   = new Date("6/14/2011 12:01am");
        ev5.endDate     = new Date("6/14/2011 12:00pm");
        ev5.allDayEvent = true;

        ev5.subject  = "5";
        ev5.location = "e";
        ev5.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
        ev5.commit();

        ev6 = calendar.createEvent();
        ev6.startDate   = new Date("6/14/2011 12:02am");
        ev6.endDate     = new Date("6/14/2011 12:00pm");
        ev6.allDayEvent = true;

        ev6.subject  = "6";
        ev6.location = "f";
        ev6.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
        ev6.commit();
    }

    function createMultiDayEvents() {
        ev7 = calendar.createEvent();
        ev7.startDate = new Date("3/4/2012 1:00am");
        ev7.endDate   = new Date("3/5/2012 12:59am");

        ev7.subject  = "7";
        ev7.location = "g";
        ev7.commit();

        ev8 = calendar.createEvent();
        ev8.startDate = new Date("3/4/2012 1:00am");
        ev8.endDate   = new Date("3/5/2012 1:00am");

        ev8.subject  = "8";
        ev8.location = "h";
        ev8.commit();

        ev9 = calendar.createEvent();
        ev9.startDate = new Date("3/3/2012 2:00am");
        ev9.endDate   = new Date("3/5/2012 3:30pm");

        ev9.subject  = "9";
        ev9.location = "i";
        ev9.commit();
    }

    function initializeHtml(date) {
        week.setFocusedDay(date || new Date("6/13/2011"));
        week._timeline._onScroll();
    }

    Tx.test("WeekTests.testEventsHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            initializeHtml();
        });

        var divs = getFirstItem().querySelectorAll(".grid .events > div"),
            div;

        div = divs[0];
        tc.areEqual(1, div.children.length, "Day 1 Children");

        tc.areEqual("1", div.children[0].querySelector(".subject").innerText,  "Day 1 Event 1 HTML Subject");
        tc.areEqual("a", div.children[0].querySelector(".location").innerText, "Day 1 Event 1 HTML Location");

        tc.areEqual("100%", div.children[0].style.width,  "Day 1 Event 1 Width");
        tc.areEqual("49.93%",  div.children[0].style.height, "Day 1 Event 1 Height");

        tc.areEqual("0%",  div.children[0].style.left, "Day 1 Event 1 Left");
        tc.areEqual("50%", div.children[0].style.top,  "Day 1 Event 1 Top");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Day 1 Event 1 HTML Status");

        div = divs[1];
        tc.areEqual(2, div.children.length, "Day 2 Children");

        tc.areEqual("1", div.children[0].querySelector(".subject").innerText,  "Day 2 Event 1 HTML Subject");
        tc.areEqual("a", div.children[0].querySelector(".location").innerText, "Day 2 Event 1 HTML Location");

        tc.areEqual("calc(50% - 1px)", div.children[0].style.width,  "Day 2 Event 1 Width");
        tc.areEqual("24.93%", div.children[0].style.height, "Day 2 Event 1 Height");

        tc.areEqual("0%", div.children[0].style.left, "Day 2 Event 1 Left");
        tc.areEqual("0%", div.children[0].style.top,  "Day 2 Event 1 Top");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Day 2 Event 1 HTML Status");

        tc.areEqual("2", div.children[1].querySelector(".subject").innerText,  "Day 2 Event 2 HTML Subject");
        tc.areEqual("b", div.children[1].querySelector(".location").innerText, "Day 2 Event 2 HTML Location");

        tc.areEqual("50%", div.children[1].style.width,  "Day 2 Event 2 Width");
        tc.areEqual("49.93%", div.children[1].style.height, "Day 2 Event 2 Height");

        tc.areEqual("50%", div.children[1].style.left, "Day 2 Event 2 Left");
        tc.areEqual("0%",  div.children[1].style.top,  "Day 2 Event 2 Top");

        tc.areEqual("workingElsewhere", div.children[1].getAttribute("data-status"), "Day 2 Event 2 HTML Status");

        div = divs[2];
        tc.areEqual(0, div.children.length, "Day 3 Children");
    });

    Tx.test("WeekTests.testEventsEvents", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            initializeHtml();
        });

        var grid = queryFirstItem(".grid"),
            divs = grid.querySelectorAll(".events > div");

        var evEdit   = null,
            evCreate = null;

        week.on("editEvent", function(ev) {
            evEdit = ev;
        });

        week.on("createEvent", function(ev) {
            evCreate = ev;
        });

        var pointerDown = document.createEvent("Event"),
            pointerUp   = document.createEvent("Event");

        // A ctrl click opens event details instead of quick event creation.
        pointerDown.ctrlKey = true;
        pointerDown.button  = 0;
        pointerDown.offsetY = 0;
        pointerDown.initEvent("MSPointerDown", true, true);

        pointerUp.ctrlKey = true;
        pointerUp.button  = 0;
        pointerUp.offsetY = 0;
        pointerUp.initEvent("click", true, true);

        runSync(function() {
            grid.dispatchEvent(pointerDown);
            grid.dispatchEvent(pointerUp);
        });

        tc.areEqual(null, evEdit,   "Click Grid No Edit Event");
        tc.areEqual(null, evCreate, "Click Grid No Create Event");

        runSync(function() {
            divs[0].children[0].dispatchEvent(pointerDown);
            divs[0].children[0].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev1.id, evEdit.data.event.id, "Click Day 1 Event 1");
        tc.areEqual(null,   evCreate,       "Click Day 1 Event 1 No Create Event");

        runSync(function() {
            divs[1].children[0].dispatchEvent(pointerDown);
            divs[1].children[0].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev1.id, evEdit.data.event.id, "Click Day 2 Event 1");
        tc.areEqual(null,   evCreate,       "Click Day 2 Event 1 No Create Event");

        runSync(function() {
            divs[1].children[1].dispatchEvent(pointerDown);
            divs[1].children[1].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev2.id, evEdit.data.event.id, "Click Day 2 Event 2");
        tc.areEqual(null,   evCreate,       "Click Day 2 Event 2 No Create Event");

        evEdit = null;

        runSync(function() {
            divs[3].dispatchEvent(pointerDown);
            divs[3].dispatchEvent(pointerUp);
        });

        tc.areEqual(null, evEdit, "Click Day 4 No Edit Event");
        tc.areEqual(new Date(2011, 5, 15, 23).toString(), String(evCreate.data.startDate), "Click Day 4");
    });

    Tx.test("WeekTests.testFocusEvent", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();

            week.deactivateUI();
            week.setFocusedDay(new Date("1/1/2000"));

            week.focusEvent(ev1);
            week.activateUI(jobset);
            week._timeline._onScroll();
        });

        tc.isTrue(document.documentElement.querySelector("[data-handle='" + ev1.id + "']") !== null, "Focus Event");
    });

    Tx.test("WeekTests.testFocusEventException", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var ev = calendar.createEvent();
        ev.startDate = new Date("8/9/2011");
        ev.endDate   = new Date("8/9/2011 1:00am");

        ev.subject   = "foo";
        ev.location  = "bar";
        ev.recurring = true;

        ev.commit();

        var ex = ev.getOccurrence(new Date("9/9/2011"));

        tc.areNotEqual(null, ex, "Get Excpetion");

        runSync(function() {
            week.deactivateUI();
            week.setFocusedDay(new Date("1/1/2000"));

            week.focusEvent(ex);
            week.activateUI(jobset);
            week._timeline._onScroll();
        });

        var el = getFirstItem();

        tc.areNotEqual(null, document.getElementById(ex.id + "." + ex.startDate.getTime()), "Focus Event");
        tc.areEqual(0, el.querySelector(".grid").scrollTop, "Event Scrolled Into View");
    });

    Tx.test("WeekTests.testKeyboard", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            createAllDayEvents();
            initializeHtml();
        });

        var els = Array.prototype.slice.call(getFirstItem().querySelectorAll("[data-order]"));
        els.sort(function(a, b) { return a.getAttribute("data-order") - b.getAttribute("data-order"); });

        tc.areEqual(14, els.length, "Tabbable Items");

        // verify days
        tc.areEqual("Monday 13",    els[0].innerText,  "Monday");
        tc.areEqual("Tuesday 14",   els[3].innerText,  "Tuesday");
        tc.areEqual("Wednesday 15", els[9].innerText,  "Wednesday");
        tc.areEqual("Thursday 16",  els[10].innerText, "Thursday");
        tc.areEqual("Friday 17",    els[11].innerText, "Friday");
        tc.areEqual("Saturday 18",  els[12].innerText, "Saturday");
        tc.areEqual("Sunday 19",    els[13].innerText, "Sunday");

        // verify events
        tc.areEqual(ev3.subject, els[1].querySelector(".subject").innerText, "Day 1 All Day 1 Subject");
        tc.areEqual(ev1.subject, els[2].querySelector(".subject").innerText, "Day 1 Event 1 Subject");
        tc.areEqual(ev3.subject, els[4].querySelector(".subject").innerText, "Day 2 All Day 1 Subject");
        tc.areEqual(ev4.subject, els[5].querySelector(".subject").innerText, "Day 2 All Day 2 Subject");
        tc.areEqual(ev1.subject, els[7].querySelector(".subject").innerText, "Day 2 Event 1 Subject");
        tc.areEqual(ev2.subject, els[8].querySelector(".subject").innerText, "Day 2 Event 2 Subject");

        // verify more
        tc.areEqual("AllDayMore;2", els[6].innerText, "More Button");

        var keyEv = document.createEvent("KeyboardEvent");
        // Ctrl enter opens event details instead of quick event creation.
        keyEv.initKeyboardEvent("keydown", true, true, window, "Enter", KeyboardEvent.DOM_KEY_LOCATION_STANDARD, "Control", false, "");

        var evEdit   = null,
            evCreate = null;

        week.on("editEvent", function(ev) {
            evEdit = ev;
        });

        week.on("createEvent", function(ev) {
            evCreate = ev;
        });

        runSync(function() {
            evEdit = null;
            els[2].dispatchEvent(keyEv);
        });

        tc.areEqual(ev1.id, evEdit.data.event.id, "Hit Enter Day 1 Event 1");
        tc.areEqual(null,   evCreate,       "Hit Enter Day 1 Event 1 No Create Event");

        runSync(function() {
            evEdit = null;
            els[4].dispatchEvent(keyEv);
        });

        tc.areEqual(ev3.id, evEdit.data.event.id, "Hit Enter Day 2 All Day 1");
        tc.areEqual(null,   evCreate,       "Hit Enter Day 2 All Day 1 No Create Event");

        var now  = new Date(),
            date = new Date("6/17/2011");
        date.setHours(now.getHours());

        runSync(function() {
            evEdit = null;
            els[11].dispatchEvent(keyEv);
        });

        tc.areEqual(null,         evEdit,                          "Click Friday No Edit Event");
        tc.areEqual(String(date), String(evCreate.data.startDate), "Click Friday");

        runSync(function() {
            evCreate = null;
            els[6].dispatchEvent(keyEv);
        });

        tc.areEqual(null, evEdit,   "Click Day 2 More No Edit Event");
        tc.areEqual(null, evCreate, "Click Day 2 More No Create Event");

        var allDay = queryFirstItem(".allDay"),
            divs   = allDay.querySelectorAll(".events > div");

        var div = divs[1];
        tc.areEqual(4, div.children.length, "Day 2 All Day Events");
    });

    Tx.test("WeekTests.testAllDayHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createAllDayEvents();
            initializeHtml();
        });

        var divs = getFirstItem().querySelectorAll(".allDay .events > div"),
            div;

        div = divs[0];
        tc.areEqual(1, div.children.length, "Day 1 Children");

        tc.areEqual(ev3.subject, div.children[0].querySelector(".subject").innerText, "Day 1 Event 1 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Day 1 Event 1 HTML Location");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Day 1 Event 1 HTML Status");

        div = divs[1];
        tc.areEqual(3, div.children.length, "Day 2 Children");

        tc.areEqual(ev3.subject, div.children[0].querySelector(".subject").innerText, "Day 2 Event 1 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Day 2 Event 1 HTML Location");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Day 2 Event 1 HTML Status");

        tc.areEqual(ev4.subject, div.children[1].querySelector(".subject").innerText, "Day 2 Event 2 HTML Subject");
        tc.areEqual(null,        div.children[1].querySelector(".location"),          "Day 2 Event 2 HTML Location");

        tc.areEqual("workingElsewhere", div.children[1].getAttribute("data-status"), "Day 2 Event 2 HTML Status");

        tc.areEqual("more", div.children[2].className, "Day 2 More Button");

        div = divs[2];
        tc.areEqual(0, div.children.length, "Day 3 Children");
    });

    Tx.test("WeekTests.testAllDayEvents", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createAllDayEvents();
            initializeHtml();
        });

        var allDay = queryFirstItem(".allDay"),
            divs   = allDay.querySelectorAll(".events > div");

        var evEdit   = null,
            evCreate = null;

        week.on("editEvent", function(ev) {
            evEdit = ev;
        });

        week.on("createEvent", function(ev) {
            evCreate = ev;
        });

        var pointerDown = document.createEvent("Event"),
            pointerUp   = document.createEvent("Event");

        pointerDown.ctrlKey = true;
        pointerDown.button  = 0;
        pointerDown.offsetY = 0;
        pointerDown.initEvent("MSPointerDown", true, true);

        pointerUp.ctrlKey = true;
        pointerUp.button  = 0;
        pointerUp.offsetY = 0;
        pointerUp.initEvent("click", true, true);

        runSync(function() {
            allDay.dispatchEvent(pointerDown);
            allDay.dispatchEvent(pointerUp);
        });

        var date = new Date("6/13/2011");

        tc.areEqual(null,         evEdit,                          "Click All Day No Edit Event");
        tc.areEqual(String(date), String(evCreate.data.startDate), "Click All Day");
        tc.areEqual(true,         evCreate.data.allDayEvent,       "Click All Day All Day");

        evCreate = null;

        runSync(function() {
            divs[0].children[0].dispatchEvent(pointerDown);
            divs[0].children[0].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev3.id, evEdit.data.event.id, "Click Day 1 Event 1");
        tc.areEqual(null,   evCreate,       "Click Day 1 Event 1 No Create Event");

        runSync(function() {
            divs[1].children[0].dispatchEvent(pointerDown);
            divs[1].children[0].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev3.id, evEdit.data.event.id, "Click Day 2 Event 1");
        tc.areEqual(null,   evCreate,       "Click Day 2 Event 1 No Create Event");

        runSync(function() {
            divs[1].children[1].dispatchEvent(pointerDown);
            divs[1].children[1].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev4.id, evEdit.data.event.id, "Click Day 2 Event 2");
        tc.areEqual(null,   evCreate,       "Click Day 2 Event 2 No Create Event");

        evEdit = null;
        date = new Date("6/16/2011");

        runSync(function() {
            divs[3].dispatchEvent(pointerDown);
            divs[3].dispatchEvent(pointerUp);
        });

        tc.areEqual(null, evEdit, "Click Day 4 No Edit Event");
        tc.areEqual(String(date), String(evCreate.data.startDate), "Click Day 4");
        tc.areEqual(true,         evCreate.data.allDayEvent,            "Click Day 4 All Day");

        evCreate = null;

        runSync(function() {
            divs[1].children[2].dispatchEvent(pointerDown);
            divs[1].children[2].dispatchEvent(pointerUp);
        });

        tc.areEqual(null, evEdit,   "Click Day 2 More No Edit Event");
        tc.areEqual(null, evCreate, "Click Day 2 More No Create Event");

        var div = divs[1];
        tc.areEqual(4, div.children.length, "Day 2 Events");

        tc.areEqual(ev3.subject, div.children[0].querySelector(".subject").innerText, "Day 2 Event 1 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Day 2 Event 1 HTML Location");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Day 2 Event 1 HTML Status");

        tc.areEqual(ev4.subject, div.children[1].querySelector(".subject").innerText, "Day 2 Event 2 HTML Subject");
        tc.areEqual(null,        div.children[1].querySelector(".location"),          "Day 2 Event 2 HTML Location");

        tc.areEqual("workingElsewhere", div.children[1].getAttribute("data-status"), "Day 2 Event 2 HTML Status");

        tc.areEqual(ev5.subject, div.children[2].querySelector(".subject").innerText, "Day 2 Event 3 HTML Subject");
        tc.areEqual(null,        div.children[2].querySelector(".location"),          "Day 2 Event 3 HTML Location");

        tc.areEqual("free", div.children[2].getAttribute("data-status"), "Day 2 Event 3 HTML Status");

        tc.areEqual(ev6.subject, div.children[3].querySelector(".subject").innerText, "Day 2 Event 4 HTML Subject");
        tc.areEqual(null,        div.children[3].querySelector(".location"),          "Day 2 Event 4 HTML Location");

        tc.areEqual("busy", div.children[3].getAttribute("data-status"), "Day 2 Event 4 HTML Status");

        runSync(function() {
            divs[1].children[2].dispatchEvent(pointerDown);
            divs[1].children[2].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev5.id, evEdit.data.event.id, "Click Day 2 Event 3");
        tc.areEqual(null,   evCreate,       "Click Day 2 Event 3 No Create Event");

        runSync(function() {
            divs[1].children[3].dispatchEvent(pointerDown);
            divs[1].children[3].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev6.id, evEdit.data.event.id, "Click Day 2 Event 4");
        tc.areEqual(null,   evCreate,       "Click Day 2 Event 4 No Create Event");
    });

    Tx.test("WeekTests.testMultiDayHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createMultiDayEvents();
            initializeHtml(new Date("3/4/2012"));
        });

        var div = getFirstItem().querySelectorAll(".grid .events > div")[6];

        tc.areEqual(1, div.children.length, "3/4 Instance Children");

        tc.areEqual(ev7.subject,  div.children[0].querySelector(".subject").innerText,  "Event 1 HTML Subject");
        tc.areEqual(ev7.location, div.children[0].querySelector(".location").innerText, "Event 1 HTML Location");

        tc.areEqual("100%",   div.children[0].style.width,  "Event 1 Width");
        tc.areEqual("95.76%", div.children[0].style.height, "Event 1 Height");

        tc.areEqual("0%",    div.children[0].style.left, "Event 1 Left");
        tc.areEqual("4.16%", div.children[0].style.top,  "Event 1 Top");

        div = getFirstItem().querySelectorAll(".allDay .events > div")[6];

        tc.areEqual(2, div.children.length, "3/4 All Day Children");

        tc.areEqual(ev8.subject, div.children[1].querySelector(".subject").innerText, "Event 2 HTML Subject");
        tc.areEqual(null,        div.children[1].querySelector(".location"),          "Event 2 HTML Location");

        var shortTime = Calendar.Helpers.simpleTime;
        tc.areEqual(shortTime.format(new Date(2012, 8, 8, 1)), div.children[1].querySelector(".startTime").innerText, "Event 2 HTML Start Time");
        tc.areEqual(null,  div.children[1].querySelector(".endTime"),                              "Event 2 HTML End Time");

        tc.areEqual(ev9.subject, div.children[0].querySelector(".subject").innerText, "Event 3 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 3 HTML Location");

        tc.areEqual(null, div.children[0].querySelector(".startTime"), "Event 3 HTML Start Time");
        tc.areEqual(null, div.children[0].querySelector(".endTime"),   "Event 3 HTML End Time");

        runSync(function() {
            initializeHtml(new Date("3/3/2012"));
        });

        div = getFirstItem().querySelectorAll(".allDay .events > div")[5];

        tc.areEqual(1, div.children.length, "3/3 Children");

        tc.areEqual(ev9.subject, div.children[0].querySelector(".subject").innerText, "Event 3 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 3 HTML Location");

        tc.areEqual(shortTime.format(new Date(2012, 8, 8, 2)), div.children[0].querySelector(".startTime").innerText, "Event 3 HTML Start Time");
        tc.areEqual(null,  div.children[0].querySelector(".endTime"),                              "Event 3 HTML End Time");

        runSync(function() {
            initializeHtml(new Date("3/5/2012"));
        });

        div = getFirstItem().querySelectorAll(".allDay .events > div")[0];

        tc.areEqual(2, div.children.length, "3/5 Children");

        tc.areEqual(ev9.subject, div.children[0].querySelector(".subject").innerText, "Event 3 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 3 HTML Location");

        tc.areEqual(null,     div.children[0].querySelector(".startTime"),                          "Event 3 HTML Start Time");
        tc.areEqual(shortTime.format(new Date(2012, 8, 8, 15, 30)), div.children[0].querySelector(".endTime").innerText, "Event 3 HTML End Time");
    });

    Tx.test("WeekTests.testAccessibility", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            createAllDayEvents();
            initializeHtml();
        });

        var el,
            els = Array.prototype.slice.call(getFirstItem().querySelectorAll("[data-order]")),
            longDate = new Jx.DTFormatter("longDate"),
            longDateTime = Calendar.Helpers.dateAndTime,
            shortTime = new Jx.DTFormatter("shortTime");
        els.sort(function(a, b) { return a.getAttribute("data-order") - b.getAttribute("data-order"); });
        tc.areEqual(14, els.length, "Tabbable Items");

        // verify monday
        el = els[0];
        tc.areEqual(longDate.format(new Date(2011, 5, 13)), el.getAttribute("aria-label"), "Monday Label");

        // verify thursday
        el = els[10];
        tc.areEqual(longDate.format(new Date(2011, 5, 16)), el.getAttribute("aria-label"), "Thursday Label");

        // verify all day 1
        el = els[1];
        tc.areEqual("AccEventAllDay;3;c;Week UTs;fake@fake.com;EventStatusTentative", removeTextMarkers(el.getAttribute("aria-label")), "All Day 1");

        // verify all day 2
        el = els[5];
        tc.areEqual("AccEventAllDay;4;d;Week UTs;fake@fake.com;EventStatusElsewhere", removeTextMarkers(el.getAttribute("aria-label")), "All Day 2");

        // verify event 1
        el = els[2];
        tc.areEqual(removeTextMarkers("AccEvent;" + longDateTime.format(new Date(2011, 5, 13, 12)) + ";" + longDateTime.format(new Date(2011, 5, 14, 6)) + ";1;a;Week UTs;fake@fake.com;EventStatusTentative"), removeTextMarkers(el.getAttribute("aria-label")), "Event 1");

        // verify event 2
        el = els[8];
        tc.areEqual(removeTextMarkers("AccEvent;" + shortTime.format(new Date(2012, 8, 8, 0)) + ";" + shortTime.format(new Date(2012, 8, 8, 12)) + ";2;b;Week UTs;fake@fake.com;EventStatusElsewhere"), removeTextMarkers(el.getAttribute("aria-label")), "Event 2");
    });

    function testLanguageFormat(tc, language, expectDayOfWeekParentheses) {
        /// <summary>Helper function to test language formatters</summary>

        // It's easier to run these tests as separate Tx tests since the formatters are initialized in the Week constructor.

        var DTF = Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
        Week._dayHeaderAlt = new DTF("dayofweek.abbreviated month.abbreviated day", [language]);
        Week._updateFormatsForLanguage();
        
        var dayUnitSearch = /\{day(?:\.[^}]*)?\}\s*([^{\s]*)/;

        // Verify dayHeaderAlt
        if (expectDayOfWeekParentheses) {
            tc.isNotNull(Week._dayHeaderAlt._pattern, "Could not find _pattern - expected customization of date format");
            tc.isTrue(Week._dayHeaderAlt._pattern.indexOf("({dayofweek.abbreviated})") >= 0, "Abbreviated date should be surrounded by parentheses");
        } else {
            tc.isTrue(Jx.isNullOrUndefined(Week._dayHeaderAlt._pattern), "Short day header should not be modified for " + language);
        }

        // Verify dayHeader
        var generatedPattern = Week._dayHeader._pattern;
        
        if (!generatedPattern) {
            // It will use the hard-coded pattern from the constructor, which is difficult to get to from UT's, so recreate it
            generatedPattern = new Jx.DTFormatter("{dayofweek.full} {day.integer}")._pattern;
        }

        var builtinPattern = new DTF("month day dayofweek", [language]).patterns[0];
        var builtinPatternDayCharacter = null;
        var generatedPatternDayCharacter = null;

        tc.log("Built in pattern: " + builtinPattern);
        tc.log("Generated pattern: " + generatedPattern);

        var builtinPatternHasDayFirst = builtinPattern.indexOf("dayofweek") > builtinPattern.indexOf("day");
        var generatedPatternHasDayFirst = generatedPattern.indexOf("dayofweek") > generatedPattern.indexOf("day");

        var builtinPatternRegexResult = dayUnitSearch.exec(builtinPattern);
        var generatedPatternRegexResult = dayUnitSearch.exec(builtinPattern);

        if (builtinPatternRegexResult !== null && builtinPatternRegexResult.length > 1) {
            builtinPatternDayCharacter = builtinPatternRegexResult[1];
        }

        if (generatedPatternRegexResult !== null && generatedPatternRegexResult.length > 1) {
            generatedPatternDayCharacter = generatedPatternRegexResult[1];
        }

        tc.areEqual(builtinPatternHasDayFirst, generatedPatternHasDayFirst, "Day / dayOfWeek order is not the same");
        tc.areEqual(builtinPatternDayCharacter, generatedPatternDayCharacter, "Day unit");
    }

    Tx.test("WeekTests.testLanguageFormat-ja", function (tc) {
        /// <summary>Verifies language formats for JA</summary>

        tc.cleanup = cleanup;
        setup();

        testLanguageFormat(tc, "ja-JP", true);
    });

    Tx.test("WeekTests.testLanguageFormat-ko", function (tc) {
        /// <summary>Verifies language formats for KO</summary>

        tc.cleanup = cleanup;
        setup();

        testLanguageFormat(tc, "ko-KR", true);
    });

    Tx.test("WeekTests.testLanguageFormat-zh-cn", function (tc) {
        /// <summary>Verifies language formats for zh-cn</summary>

        tc.cleanup = cleanup;
        setup();

        testLanguageFormat(tc, "zh-CN", false);
    });

    Tx.test("WeekTests.testLanguageFormat-zh-tw", function (tc) {
        /// <summary>Verifies language formats for zh-tw</summary>

        tc.cleanup = cleanup;
        setup();

        testLanguageFormat(tc, "zh-TW", false);
    });

    Tx.test("WeekTests.testLanguageFormat-kok", function (tc) {
        /// <summary>Verifies language formats for KOK</summary>

        tc.cleanup = cleanup;
        setup();

        testLanguageFormat(tc, "kok-IN", false);
    });

    Tx.test("WeekTests.testWeekends", function (tc) {
        tc.cleanup = cleanup;
        setup();

        function isHidden(el) {
            return (getComputedStyle(el).display === "none");
        }

        week.setWorkWeek(true);
        var areAllHidden = slice.call(host.querySelectorAll(".weekend")).every(isHidden);
        tc.isTrue(areAllHidden, "Weekends hidden in work week");

        week.setWorkWeek(false);
        var anyAreHidden = slice.call(host.querySelectorAll(".weekend")).some(isHidden);
        tc.isFalse(anyAreHidden, "Weekends shown in work week");
    });

    Tx.test("WeekTests.testPickDatePickerFocus", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var cases = [
            { name: "month outnumbered, but has today", today: new Date(2013, 5, 1), startDate: new Date(2013, 4, 26), isWorkWeek: false, expected: new Date(2013, 5, 1) },
            { name: "pick max month prev", today: new Date(2013, 5, 7), startDate: new Date(2013, 4, 26), isWorkWeek: false, expected: new Date(2013, 4, 1) },
            { name: "pick max month next", today: new Date(2013, 5, 7), startDate: new Date(2013, 5, 30), isWorkWeek: false, expected: new Date(2013, 6, 1) },
            { name: "just current month", today: new Date(2013, 5, 7), startDate: new Date(2013, 5, 16), isWorkWeek: false, expected: new Date(2013, 5, 1) },
            { name: "workweek month outnumbered, but has today", today: new Date(2013, 2, 1), startDate: new Date(2013, 1, 24), isWorkWeek: true, expected: new Date(2013, 2, 1) },
            { name: "workweek month outnumbered, today is not considered", today: new Date(2013, 5, 1), startDate: new Date(2013, 4, 26), isWorkWeek: true, expected: new Date(2013, 4, 1) },
            { name: "workweek pick max month prev", today: new Date(2013, 5, 7), startDate: new Date(2013, 1, 24), isWorkWeek: true, expected: new Date(2013, 1, 1) },
            { name: "workweek pick max month next", today: new Date(2013, 5, 7), startDate: new Date(2013, 8, 29), isWorkWeek: true, expected: new Date(2013, 9, 1) },
            { name: "workweek just current month", today: new Date(2013, 5, 7), startDate: new Date(2013, 5, 16), isWorkWeek: true, expected: new Date(2013, 5, 1) },
        ];

        for (var i = 0, len = cases.length; i < len; i++)
        {
            var testCase = cases[i];

            var config = week._generateDatePickerConfig(testCase.today, testCase.startDate, testCase.isWorkWeek);
            tc.isTrue(Helpers.isSameDate(config.focusDate, testCase.expected), testCase.name);
        }
    });

})();