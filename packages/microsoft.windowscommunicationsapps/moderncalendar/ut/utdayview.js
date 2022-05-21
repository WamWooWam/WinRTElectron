
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,document,KeyboardEvent,Jx,Tx,Calendar,Microsoft,MockPlatformWorker,MockJobset,runSync,mockTimeIndicator,restoreTimeIndicator,removeTextMarkers,mockDatePicker,restoreDatePicker*/

(function() {
    var Day     = Calendar.Views.Day,
        Helpers = Calendar.Helpers;

    var day,
        host;

    var jobset;

    var left,
        right;

    var platform,
        manager,
        calendar,
        worker,
        workerex;

    var ev1,
        ev2,
        ev3,
        ev4,
        ev5,
        ev6,
        ev7,
        ev8,
        ev9;

    //
    // Setup
    //

    function setup() {
        // mock various objects
        mockTimeIndicator();
        mockDatePicker();

        // set up platform
        platform = new Calendar.Mock.Platform();

        // dump the store to remove all events
        manager = platform.calendarManager;
        manager.dumpStore();

        // prepare our test calendar
        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");
        calendar.name = "Day UTs";

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

        // create the day view
        day = new Day();

        left  = -day.left();
        right =  day.right();

        // respond to day view events
        day.on("getPlatform", function(ev) {
            ev.data.platform = platform;
        });
        day.on("getPlatformWorker", function(ev) {
            ev.data.platformWorker = workerex;
        });
        day.on("getSettings", function(ev) {
            ev.data.settings = {
                get: function() {
                    return false;
                }
            };
        });

        // initialize the day view
        runSync(function() {
            host.innerHTML = Jx.getUI(day).html;
            day.activateUI(jobset);
        });
    }

    //
    // Teardown
    //

    function cleanup() {
        // shut down the day
        runSync(function() {
            day.deactivateUI();
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
        day  = null;
        host = null;

        calendar = null;
        manager  = null;
        platform = null;

        // restore mocked objects
        restoreDatePicker();
        restoreTimeIndicator();
    }

    //
    // Tests
    //

    // API

    Tx.test("DayViewTests.testGetFocusedDay", function (tc) {
        tc.cleanup = cleanup;
        setup();

        day._focusedIndex = left;
        tc.areEqual(Calendar.FIRST_DAY.toString(), day.getFocusedDay().toString(), "First Failed");

        day._focusedIndex = right;
        tc.areEqual(Calendar.LAST_DAY.toString(),  day.getFocusedDay().toString(), "Last Failed");
    });

    Tx.test("DayViewTests.testGetItem", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var now   = new Date(),
            today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        tc.areEqual(today.toString(),              day.getItem(0).toString(),     "Today");
        tc.areEqual(Calendar.FIRST_DAY.toString(), day.getItem(left).toString(),  "First");
        tc.areEqual(Calendar.LAST_DAY.toString(),  day.getItem(right).toString(), "Last");
    });

    Tx.test("DayViewTests.testGetItemIllegalLeft", function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () {
            day.getItem(left - 1);
        }, "Index for Calendar.Views.Day is out of bounds (" + (left - 1) + " < " + left + ").");
    });

    Tx.test("DayViewTests.testGetItemIllegalRight", function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () {
            day.getItem(right + 1);
        }, "Index for Calendar.Views.Day is out of bounds (" + (right + 1) + " > " + right + ").");
    });

    Tx.test("DayViewTests.testContainsDate", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var date = new Date("7/4/2011"),
            prev = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
            next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        day.setFocusedDay(date);

        tc.isTrue(day.containsDate(date), "Contains set day");
        tc.isFalse(day.containsDate(prev), "Contains previous day");
        tc.isFalse(day.containsDate(next), "Contains next day");
    });

    // UI

    Tx.test("DayViewTests.testGetDayName", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var date = new Date("1/1/2000");

        tc.areEqual("Saturday",  day._getDayName(date, false, false, false));
        tc.areEqual("Today",     day._getDayName(date, true,  false, false));
        tc.areEqual("Tomorrow",  day._getDayName(date, false, true,  false));
        tc.areEqual("Yesterday", day._getDayName(date, false, false, true));
    });

    Tx.test("DayViewTests.testGetFullDate", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var date = new Date("1/1/2000"),
            expected = new Jx.DTFormatter("longDate").format(date);

        tc.areEqual("January 1, 2000",           removeTextMarkers(day._getFullDate(date, false, false, false)));
        tc.areEqual(expected, day._getFullDate(date, true, false, false));
        tc.areEqual(expected, day._getFullDate(date, false, true, false));
        tc.areEqual(expected, day._getFullDate(date, false, false, true));
    });

    function getFirstItem() {
        return day._timeline.getRealized()[0].el;
    }

    function queryFirstItem(query) {
        return getFirstItem().querySelector(query);
    }

    function validateChevrons(tc, day) {
        var chevrons    = host.querySelectorAll(".dateChevron"),
            selChevrons = host.querySelectorAll(".activeAnchor .dateChevron"),
            todayEl     = day._timeline.getRealized()[0].el,
            todaySel    = todayEl.querySelectorAll(".activeAnchor .dateChevron");

        tc.isTrue(chevrons.length > 1, "Expected to find multiple chevrons");
        tc.areEqual(selChevrons.length, 1, "Expected to find single active chevron");
        tc.areEqual(todaySel.length, 1, "Expected active chevron on today");
    }

    Tx.test("DayViewTests.testHeaderHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var now = new Date();

        // run as sync to give the timeline a chance to update the off-screen instances
        runSync(function(){
            day.setFocusedDay(new Date("1/3/2011"));
            day._timeline._onScroll();
        });

        tc.areEqual("Monday", removeTextMarkers(queryFirstItem(".dayName .anchorText").innerText));
        tc.areEqual("January 3, 2011", removeTextMarkers(queryFirstItem(".fullDate").innerText));
        validateChevrons(tc, day);

        runSync(function(){
            day.setFocusedDay(now);
            day._timeline._onScroll();
        });

        tc.areEqual("Today", queryFirstItem(".dayName .anchorText").innerText);
        validateChevrons(tc, day);

        runSync(function(){
            day.setFocusedDay(new Date(now.getTime() - Helpers.dayInMilliseconds));
            day._timeline._onScroll();
        });

        tc.areEqual("Yesterday", queryFirstItem(".dayName .anchorText").innerText);
        validateChevrons(tc, day);

        runSync(function(){
            day.setFocusedDay(new Date(now.getTime() + Helpers.dayInMilliseconds));
            day._timeline._onScroll();
        });

        tc.areEqual("Tomorrow", queryFirstItem(".dayName .anchorText").innerText);
        validateChevrons(tc, day);
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
        ev2.startDate = new Date("6/13/2011 6:00pm");
        ev2.endDate   = new Date("6/13/2011 9:00pm");

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
        ev4.startDate   = new Date("6/13/2011 12:01am");
        ev4.endDate     = new Date("6/13/2011 12:00pm");
        ev4.allDayEvent = true;

        ev4.subject    = "4";
        ev4.location   = "d";
        ev4.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.workingElsewhere;
        ev4.commit();

        ev5 = calendar.createEvent();
        ev5.startDate   = new Date("6/13/2011 12:02am");
        ev5.endDate     = new Date("6/13/2011 12:00pm");
        ev5.allDayEvent = true;

        ev5.subject    = "5";
        ev5.location   = "e";
        ev5.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
        ev5.commit();

        ev6 = calendar.createEvent();
        ev6.startDate   = new Date("6/13/2011 12:03am");
        ev6.endDate     = new Date("6/13/2011 12:00pm");
        ev6.allDayEvent = true;

        ev6.subject    = "6";
        ev6.location   = "f";
        ev6.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
        ev6.commit();
    }

    function createMultiDayEvents() {
        ev7 = calendar.createEvent();
        ev7.startDate = new Date("3/11/2012 1:00am");
        ev7.endDate   = new Date("3/12/2012 12:59am");

        ev7.subject  = "7";
        ev7.location = "g";
        ev7.commit();

        ev8 = calendar.createEvent();
        ev8.startDate = new Date("3/11/2012 1:00am");
        ev8.endDate   = new Date("3/12/2012 1:00am");

        ev8.subject  = "8";
        ev8.location = "h";
        ev8.commit();

        ev9 = calendar.createEvent();
        ev9.startDate = new Date("3/10/2012 2:00am");
        ev9.endDate   = new Date("3/12/2012 3:30pm");

        ev9.subject  = "9";
        ev9.location = "i";
        ev9.commit();
    }

    function initializeHtml(date) {
        day.setFocusedDay(date || new Date("6/13/2011"));
        day._timeline._onScroll();
    }

    Tx.test("DayViewTests.testEventsHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            initializeHtml();
        });

        var div = queryFirstItem(".grid .events > div");

        tc.areEqual(2, div.children.length, "Children");

        tc.areEqual("1", div.children[0].querySelector(".subject").innerText,  "Event 1 HTML Subject");
        tc.areEqual("a", div.children[0].querySelector(".location").innerText, "Event 1 HTML Location");

        tc.areEqual("calc(50% - 1px)", div.children[0].style.width,  "Event 1 Width");
        tc.areEqual("49.93%", div.children[0].style.height, "Event 1 Height");

        tc.areEqual("0%",  div.children[0].style.left, "Event 1 Left");
        tc.areEqual("50%", div.children[0].style.top,  "Event 1 Top");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Event 1 HTML Status");

        tc.areEqual("2", div.children[1].querySelector(".subject").innerText,  "Event 2 HTML Subject");
        tc.areEqual("b", div.children[1].querySelector(".location").innerText, "Event 2 HTML Location");

        tc.areEqual("50%",   div.children[1].style.width,  "Event 2 Width");
        tc.areEqual("12.43%", div.children[1].style.height, "Event 2 Height");

        tc.areEqual("50%", div.children[1].style.left, "Event 2 Left");
        tc.areEqual("75%", div.children[1].style.top,  "Event 2 Top");

        tc.areEqual("workingElsewhere", div.children[1].getAttribute("data-status"), "Event 2 HTML Status");
    });

    Tx.test("DayViewTests.testEventsEvents", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            initializeHtml();
        });

        var div = queryFirstItem(".grid .events > div");

        var evEdit   = null,
            evCreate = null;

        day.on("editEvent", function(ev) {
            evEdit = ev;
        });

        day.on("createEvent", function(ev) {
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
            div.dispatchEvent(pointerDown);
            div.dispatchEvent(pointerUp);
        });

        tc.areEqual(null, evEdit, "Click Grid No Edit Event");
        tc.areEqual(new Date(2011, 5, 13).toString(), String(evCreate.data.startDate), "Click Grid");

        evCreate = null;

        runSync(function() {
            div.children[0].dispatchEvent(pointerDown);
            div.children[0].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev1.id, evEdit.data.event.id, "Click Event 1");
        tc.areEqual(null,   evCreate,       "Click Event 1 No Create Event");

        runSync(function() {
            div.children[1].dispatchEvent(pointerDown);
            div.children[1].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev2.id, evEdit.data.event.id, "Click Event 2");
        tc.areEqual(null,   evCreate,       "Click Event 2 No Create Event");
    });

    Tx.test("DayViewTests.testFocusEvent", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();

            day.deactivateUI();
            day.setFocusedDay(new Date("1/1/2000"));

            day.focusEvent(ev1);
            day.activateUI(jobset);
            day._timeline._onScroll();
        });

        var start = ev1.startDate,
            date  = new Date(start.getFullYear(), start.getMonth(), start.getDate());

        tc.areEqual(date.toString(), day.getFocusedDay().toString(), "Focus Day");
        tc.areNotEqual(null, document.documentElement.querySelector("[data-handle='" + ev1.id + "']") , "Focus Event");
    });

    Tx.test("DayViewTests.testFocusEventException", function (tc) {
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
            day.deactivateUI();
            day.setFocusedDay(new Date("1/1/2000"));

            day.focusEvent(ex);
            day.activateUI(jobset);
            day._timeline._onScroll();
        });

        var el   = getFirstItem();

        tc.areNotEqual(null, document.getElementById(ex.handle), "Focus Event");
        tc.areEqual(0, el.querySelector(".grid").scrollTop, "Event Scrolled Into View");
    });

    Tx.test("DayViewTests.testKeyboard", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            createAllDayEvents();
            initializeHtml();
        });

        var els = Array.prototype.slice.call(getFirstItem().querySelectorAll("[tabindex]"));

        // verify basics
        tc.areEqual(7, els.length, "Tabbable Items");
        tc.areEqual("Monday", removeTextMarkers(els[0].innerText), "Date Picker");
        tc.areEqual("June 13, 2011", removeTextMarkers(els[1].innerText), "Full Date");

        // verify events
        tc.areEqual(ev3.subject, els[2].querySelector(".subject").innerText, "All Day 1 Subject");
        tc.areEqual(ev4.subject, els[3].querySelector(".subject").innerText, "All Day 2 Subject");
        tc.areEqual(ev1.subject, els[5].querySelector(".subject").innerText, "Event 1 Subject");
        tc.areEqual(ev2.subject, els[6].querySelector(".subject").innerText, "Event 2 Subject");

        // verify more
        tc.areEqual("AllDayMore;2", els[4].innerText, "More Button");

        var keyEv = document.createEvent("KeyboardEvent");
        // Ctrl enter opens event details instead of quick event creation.        
        keyEv.initKeyboardEvent("keydown", true, true, window, "Enter", KeyboardEvent.DOM_KEY_LOCATION_STANDARD, "Control", false, "");

        var evEdit   = null,
            evCreate = null;

        day.on("editEvent", function(ev) {
            evEdit = ev;
        });

        day.on("createEvent", function(ev) {
            evCreate = ev;
        });

        runSync(function() {
            evEdit = null;
            els[5].dispatchEvent(keyEv);
        });

        tc.areEqual(ev1.id, evEdit.data.event.id, "Hit Enter Event 1");
        tc.areEqual(null,   evCreate,       "Hit Enter Event 1 No Create Event");

        var now  = new Date(),
            date = new Date("6/13/2011");
        date.setHours(now.getHours());

        runSync(function() {
            evEdit = null;
            els[1].dispatchEvent(keyEv);
        });

        tc.areEqual(null,         evEdit,                          "Click Day No Edit Event");
        tc.areEqual(String(date), String(evCreate.data.startDate), "Click Day");

        runSync(function() {
            evCreate = null;
            els[4].dispatchEvent(keyEv);
        });

        tc.areEqual(null, evEdit,   "Click More No Edit Event");
        tc.areEqual(null, evCreate, "Click More No Create Event");

        var allDay = queryFirstItem(".allDay > div"),
            div    = allDay.children[0];

        tc.areEqual(4, div.children.length, "All Day Events");
    });

    Tx.test("DayViewTests.testAllDayHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createAllDayEvents();
            initializeHtml();
        });

        var div = queryFirstItem(".allDay .events > div");

        tc.areEqual(3, div.children.length, "Children");

        tc.areEqual(ev3.subject, div.children[0].querySelector(".subject").innerText, "Event 1 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 1 HTML Location");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Event 1 HTML Status");

        tc.areEqual(ev4.subject, div.children[1].querySelector(".subject").innerText, "Event 2 HTML Subject");
        tc.areEqual(null,        div.children[1].querySelector(".location"),          "Event 2 HTML Location");

        tc.areEqual("workingElsewhere", div.children[1].getAttribute("data-status"), "Event 2 HTML Status");

        tc.areEqual("more", div.children[2].className, "More Button");
    });

    Tx.test("DayViewTests.testAllDayEvents", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createAllDayEvents();
            initializeHtml();
        });

        var div = queryFirstItem(".allDay .events > div");

        var evEdit   = null,
            evCreate = null;

        day.on("editEvent", function(ev) {
            evEdit = ev;
        });

        day.on("createEvent", function(ev) {
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
            div.dispatchEvent(pointerDown);
            div.dispatchEvent(pointerUp);
        });

        var date = new Date("6/13/2011");

        tc.areEqual(null, evEdit, "Click All Day No Edit Event");
        tc.areEqual(String(date), String(evCreate.data.startDate), "Click All Day");
        tc.areEqual(true,         evCreate.data.allDayEvent,       "Click All Day");

        evCreate = null;

        runSync(function() {
            div.children[0].dispatchEvent(pointerDown);
            div.children[0].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev3.id, evEdit.data.event.id, "Click Event 1");
        tc.areEqual(null,   evCreate,       "Click Event 1 No Create Event");

        runSync(function() {
            div.children[1].dispatchEvent(pointerDown);
            div.children[1].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev4.id, evEdit.data.event.id, "Click Event 2");
        tc.areEqual(null,   evCreate,       "Click Event 2 No Create Event");

        evEdit = null;

        runSync(function() {
            div.children[2].dispatchEvent(pointerDown);
            div.children[2].dispatchEvent(pointerUp);
        });

        tc.areEqual(null, evEdit,   "Click More No Edit Event");
        tc.areEqual(null, evCreate, "Click More No Create Event");

        tc.areEqual(4, div.children.length, "All Day Events");

        tc.areEqual(ev3.subject, div.children[0].querySelector(".subject").innerText, "Event 1 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 1 HTML Location");

        tc.areEqual("tentative", div.children[0].getAttribute("data-status"), "Event 1 HTML Status");

        tc.areEqual(ev4.subject, div.children[1].querySelector(".subject").innerText, "Event 2 HTML Subject");
        tc.areEqual(null,        div.children[1].querySelector(".location"),          "Event 2 HTML Location");

        tc.areEqual("workingElsewhere", div.children[1].getAttribute("data-status"), "Event 2 HTML Status");

        tc.areEqual(ev5.subject, div.children[2].querySelector(".subject").innerText, "Event 3 HTML Subject");
        tc.areEqual(null,        div.children[2].querySelector(".location"),          "Event 3 HTML Location");

        tc.areEqual("free", div.children[2].getAttribute("data-status"), "Event 3 HTML Status");

        tc.areEqual(ev6.subject, div.children[3].querySelector(".subject").innerText, "Event 4 HTML Subject");
        tc.areEqual(null,        div.children[3].querySelector(".location"),          "Event 4 HTML Location");

        tc.areEqual("busy", div.children[3].getAttribute("data-status"), "Event 4 HTML Status");

        runSync(function() {
            div.children[2].dispatchEvent(pointerDown);
            div.children[2].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev5.id, evEdit.data.event.id, "Click Event 3");
        tc.areEqual(null,   evCreate,       "Click Event 3 No Create Event");

        runSync(function() {
            div.children[3].dispatchEvent(pointerDown);
            div.children[3].dispatchEvent(pointerUp);
        });

        tc.areEqual(ev6.id, evEdit.data.event.id, "Click Event 4");
        tc.areEqual(null,   evCreate,       "Click Event 4 No Create Event");
    });

    Tx.test("DayViewTests.testMultiDayHtml", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createMultiDayEvents();
            initializeHtml(new Date("3/11/2012"));
        });

        var div = queryFirstItem(".grid .events > div");

        tc.areEqual(1, div.children.length, "3/11 Instance Children");

        tc.areEqual(ev7.subject,  div.children[0].querySelector(".subject").innerText,  "Event 1 HTML Subject");
        tc.areEqual(ev7.location, div.children[0].querySelector(".location").innerText, "Event 1 HTML Location");

        tc.areEqual("100%",   div.children[0].style.width,  "Event 1 Width");
        tc.areEqual("95.76%", div.children[0].style.height, "Event 1 Height");

        tc.areEqual("0%",    div.children[0].style.left, "Event 1 Left");
        tc.areEqual("4.16%", div.children[0].style.top,  "Event 1 Top");

        div = queryFirstItem(".allDay .events > div");

        tc.areEqual(2, div.children.length, "3/11 All Day Children");

        tc.areEqual(ev8.subject, div.children[1].querySelector(".subject").innerText, "Event 2 HTML Subject");
        tc.areEqual(null,        div.children[1].querySelector(".location"),          "Event 2 HTML Location");

        var shortTime = Calendar.Helpers.simpleTime;
        tc.areEqual(shortTime.format(new Date(2012,8,8,1)), div.children[1].querySelector(".startTime").innerText, "Event 2 HTML Start Time");
        tc.areEqual(null,  div.children[1].querySelector(".endTime"),                              "Event 2 HTML End Time");

        tc.areEqual(ev9.subject, div.children[0].querySelector(".subject").innerText, "Event 3 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 3 HTML Location");

        tc.areEqual(null, div.children[0].querySelector(".startTime"), "Event 3 HTML Start Time");
        tc.areEqual(null, div.children[0].querySelector(".endTime"),   "Event 3 HTML End Time");

        runSync(function() {
            initializeHtml(new Date("3/10/2012"));
        });

        div = queryFirstItem(".allDay .events > div");

        tc.areEqual(1, div.children.length, "3/10 Children");

        tc.areEqual(ev9.subject, div.children[0].querySelector(".subject").innerText, "Event 3 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 3 HTML Location");

        tc.areEqual(shortTime.format(new Date(2012, 8, 8, 2)), div.children[0].querySelector(".startTime").innerText, "Event 3 HTML Start Time");
        tc.areEqual(null,  div.children[0].querySelector(".endTime"),                              "Event 3 HTML End Time");

        runSync(function() {
            initializeHtml(new Date("3/12/2012"));
        });

        div = queryFirstItem(".allDay .events > div");

        tc.areEqual(2, div.children.length, "3/12 Children");

        tc.areEqual(ev9.subject, div.children[0].querySelector(".subject").innerText, "Event 3 HTML Subject");
        tc.areEqual(null,        div.children[0].querySelector(".location"),          "Event 3 HTML Location");

        tc.areEqual(null,     div.children[0].querySelector(".startTime"),                          "Event 3 HTML Start Time");
        tc.areEqual(shortTime.format(new Date(2012, 8, 8, 15, 30)), div.children[0].querySelector(".endTime").innerText, "Event 3 HTML End Time");
    });

    Tx.test("DayViewTests.testAccessibility", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function() {
            createEvents();
            createAllDayEvents();
            initializeHtml();
        });

        var el,
            els = Array.prototype.slice.call(getFirstItem().querySelectorAll("[tabindex]")),
            longDate = new Jx.DTFormatter("longDate"),
            longDateTime = new Jx.DTFormatter("longdate shorttime"),
            shortTime = new Jx.DTFormatter("shorttime");

        tc.areEqual(7, els.length, "Tabbable Items");

        // verify monday
        el = els[1];
        tc.areEqual(longDate.format(new Date(2011, 5, 13)), el.getAttribute("aria-label"), "Monday Label");

        // verify all day 1
        el = els[2];
        tc.areEqual("AccEventAllDay;3;c;Day UTs;fake@fake.com;EventStatusTentative", removeTextMarkers(el.getAttribute("aria-label")), "All Day 1 Desc With Focus");

        // verify all day 2
        el = els[3];
        tc.areEqual("AccEventAllDay;4;d;Day UTs;fake@fake.com;EventStatusElsewhere", removeTextMarkers(el.getAttribute("aria-label")), "All Day 2 Desc With Focus");

        // verify event 1
        el = els[5];
        tc.areEqual(removeTextMarkers("AccEvent;" + longDateTime.format(new Date(2011, 5, 13, 12)) + ";" + longDateTime.format(new Date(2011, 5, 14, 6)) + ";1;a;Day UTs;fake@fake.com;EventStatusTentative"), removeTextMarkers(el.getAttribute("aria-label")), "Event 1 Desc With Focus");

        // verify event 2
        el = els[6];
        tc.areEqual(removeTextMarkers("AccEvent;" + shortTime.format(new Date(2012, 8, 8, 18)) + ";" + shortTime.format(new Date(2012, 8, 8, 21)) + ";2;b;Day UTs;fake@fake.com;EventStatusElsewhere"), removeTextMarkers(el.getAttribute("aria-label")), "Event 2 Desc With Focus");
    });

    Tx.test("DayViewTests.testPickDatePickerFocus", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var cases = [
            { name: "3-day month outnumbered, but has today", today: new Date(2013, 5, 1), 
                days: [ new Date(2013, 4, 30), new Date(2013, 4, 31), new Date(2013, 5, 1) ], 
                expected: new Date(2013, 5, 1) },
            { name: "3-day pick max month prev", today: new Date(2013, 5, 7), 
                days: [ new Date(2013, 4, 30), new Date(2013, 4, 31), new Date(2013, 5, 1) ], 
                expected: new Date(2013, 4, 1) },
            { name: "3-day pick max month next", today: new Date(2013, 5, 7), 
                days: [ new Date(2013, 4, 31), new Date(2013, 5, 1), new Date(2013, 5, 2) ], 
                expected: new Date(2013, 5, 1) },
            { name: "3-day just current month", today: new Date(2013, 5, 7), 
                days: [ new Date(2013, 5, 15), new Date(2013, 5, 16), new Date(2013, 5, 17) ], 
                expected: new Date(2013, 5, 1) },
            { name: "2-day month outnumbered, but has today", today: new Date(2013, 5, 1), 
                days: [ new Date(2013, 4, 31), new Date(2013, 5, 1) ], 
                expected: new Date(2013, 5, 1) },
            { name: "2-day pick max month prev", today: new Date(2013, 5, 7), 
                days: [ new Date(2013, 4, 30), new Date(2013, 4, 31) ], 
                expected: new Date(2013, 4, 1) },
            { name: "2-day just current month", today: new Date(2013, 5, 7), 
                days: [ new Date(2013, 5, 15), new Date(2013, 5, 16) ], 
                expected: new Date(2013, 5, 1) },
            { name: "2-day split stay on current month", today: new Date(2013, 5, 7), 
                days: [ new Date(2013, 4, 31), new Date(2013, 5, 1) ], 
                expected: new Date(2013, 4, 1) },
            { name: "1-day stay on current month", today: new Date(2013, 5, 7), 
                days: [ new Date(2013, 4, 31) ], 
                expected: new Date(2013, 4, 1) },
        ];

        for (var i = 0, len = cases.length; i < len; i++)
        {
            var testCase = cases[i];

            var focusDate = day._generateDatePickerConfig(testCase.today, testCase.days);
            tc.isTrue(Helpers.isSameDate(focusDate, testCase.expected), testCase.name);
        }
    });

    Tx.test("DayViewTests.testKeyboardNav", function (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function () {
            createEvents();
            createAllDayEvents();
            initializeHtml();
        });

        var els = Array.prototype.slice.call(day._host.querySelectorAll(".day"));
        els.sort(function (a, b) {
            return (a._day < b._day) ? -1 : ((a._day > b._day) ? 1 : 0);
        });

        var header1 = els[1].querySelector(".anchorText");
        var header2 = els[2].querySelector(".anchorText");
        var fullDate1 = els[1].querySelector(".fullDate-text");
        var fullDate2 = els[2].querySelector(".fullDate-text");
        var events1 = els[1].querySelectorAll(".event");
        var events2 = els[2].querySelectorAll(".event");

        var tabEvent = $.Event("keydown", { keyCode: Jx.KeyCode.tab });
        var shiftTabEvent = $.Event("keydown", { keyCode: Jx.KeyCode.tab, shiftKey: true });
        var upArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.uparrow });
        var downArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.downarrow });
        var leftArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.leftarrow });
        var rightArrowEvent = $.Event("keydown", { keyCode: Jx.KeyCode.rightarrow });

        header1.focus();

        // tab to full date
        day._onKeyDownNav(tabEvent);
        tc.areEqual(day._host.querySelector(":focus"), fullDate1, "Focus should be on full date");

        // tab back to date picker
        day._onKeyDownNav(shiftTabEvent);
        tc.areEqual(day._host.querySelector(":focus"), header1, "Focus should be on date picker");

        // stay on date picker
        day._onKeyDownNav(shiftTabEvent);
        tc.areEqual(day._host.querySelector(":focus"), header1, "Focus should be on date picker");

        // down arrow to full date
        day._onKeyDownNav(downArrowEvent);
        tc.areEqual(day._host.querySelector(":focus"), fullDate1, "Focus should be on full date");

        // up arrow to date picker
        day._onKeyDownNav(upArrowEvent);
        tc.areEqual(day._host.querySelector(":focus"), header1, "Focus should be on date picker");

        // right arrow to next day
        day._onKeyDownNav(rightArrowEvent);
        tc.areEqual(day._host.querySelector(":focus"), header2, "Focus should be on Tuesday");

        // down to full date
        day._onKeyDownNav(downArrowEvent);
        tc.areEqual(day._host.querySelector(":focus"), fullDate2, "Focus should be on full date");

        // down to event
        day._onKeyDownNav(downArrowEvent);
        tc.areEqual(day._host.querySelector(":focus"), events2[0], "Focus should be on event");

        // left to first day last event
        day._onKeyDownNav(leftArrowEvent);
        tc.areEqual(day._host.querySelector(":focus"), header1, "Focus should be on date picker");

        // right to second day
        day._onKeyDownNav(rightArrowEvent);
        tc.areEqual(day._host.querySelector(":focus"), header2, "Focus should be on Tuesday");

        // tab back to first day last event
        day._onKeyDownNav(shiftTabEvent);
        tc.areEqual(day._host.querySelector(":focus"), events1[3], "Focus should be on event");
    });
})();