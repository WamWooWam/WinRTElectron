
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Element,Jx,Tx,Calendar,Microsoft,mockDateTimeFormatting,MockPlatformWorker,MockJobset,restoreDateTimeFormatting,runSync,removeTextMarkers*/

(function() {
    var FreeBusy = Calendar.Views.FreeBusy,
        Helpers  = Calendar.Helpers;

    var width60 = FreeBusy._hourWidth,
        width30 = FreeBusy._halfWidth,
        width15 = FreeBusy._quarterWidth,
        width90 = width60 + width30;

    var numberOfDays = FreeBusy._numberOfDays;

    var getToday,
        firstDayOfWeek,
        setPointerCapture,
        releasePointerCapture;

    var freebusy,
        appbar,
        host;

    var jobset, worker, workerex;

    var platform,
        manager,
        calendar;

    var ev1, ev2, ev3, ev4, ev5, ev6;

    //
    // Setup
    //

    function setup () {
        // set up platform
        platform = new Calendar.Mock.Platform();

        mockDateTimeFormatting();

        // dump the store to remove all events
        manager = platform.calendarManager;
        manager.dumpStore();

        // prepare our test calendar
        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");
        calendar.name = "FreeBusy UTs";

        var body = document.body;

        // add our host
        host = document.createElement("div");
        host.id = "host";
        body.insertBefore(host, body.firstChild);

        // save old globals
        getToday       = Calendar.getToday;
        firstDayOfWeek = Helpers.firstDayOfWeek;

        setPointerCapture     = Element.prototype.msSetPointerCapture;
        releasePointerCapture = Element.prototype.msReleasePointerCapture;

        // override some globals
        Element.prototype.msSetPointerCapture     = Jx.fnEmpty;
        Element.prototype.msReleasePointerCapture = Jx.fnEmpty;

        // create the worker
        worker   = new MockPlatformWorker(platform);
        workerex = new Calendar.WorkerEx(worker);

        // create the jobset
        jobset = new MockJobset();

        // create the freebusy view
        freebusy = new FreeBusy();

        // initialize it
        freebusy.setRange(new Date(), new Date());
        freebusy.setCalendar(calendar);

        // respond to freebusy view events
        freebusy.on("getPlatformWorker", function(ev) {
            ev.data.platformWorker = workerex;
        });

        freebusy.on("getPlatform", function(ev) {
            ev.data.platform = {
                accountManager: {
                    loadAccount: Jx.fnEmpty
                }
            };
        });

        appbar = {
            getCommandById: function() {
                return {
                    addEventListener:    Jx.fnEmpty,
                    removeEventListener: Jx.fnEmpty
                };
            },

            hideCommands: Jx.fnEmpty,
            showCommands: Jx.fnEmpty,
            hide: Jx.fnEmpty
        };

        freebusy.on("getAppBar", function(ev) {
            ev.data.appBar = appbar;
        });

        // initialize the freebusy view
        runSync(function() {
            freebusy._setWorkHours(false);
            host.innerHTML = Jx.getUI(freebusy).html;
            freebusy.activateUI(jobset);
        });
    }

    //
    // Teardown
    //

    function cleanup() {
        // shut down the freebusy
        runSync(function() {
            if (freebusy) {
                freebusy.deactivateUI();
            }
        });

        restoreDateTimeFormatting();

        // clean up worker
        workerex.dispose();
        worker.dispose();

        workerex = null;
        worker   = null;

        // clean up the jobset
        jobset.dispose();
        jobset = null;

        // get rid of any test events we created
        manager.dumpStore();

        // restore old globals
        Element.prototype.msReleasePointerCapture = releasePointerCapture;
        Element.prototype.msSetPointerCapture     = setPointerCapture;

        Calendar.getToday      = getToday;
        Helpers.firstDayOfWeek = firstDayOfWeek;

        // remove our elements
        document.body.removeChild(host);

        // release references
        freebusy = null;
        host     = null;

        calendar = null;
        manager  = null;
        platform = null;
    }

    //
    // API
    //

    /* testSetRangeStart

       - Sets date to past, verifies start date is set date.
       - Sets date to a day two years ago, verifies start date is the set date.
       - Sets date to yesterday, verifies start date is yesterday.
       - Sets date to today, verifies start date is today.
       - Sets date to tomorrow, verifies start date is today.
       - Sets date to today+6, verifies start date is today.
       - Sets date to a day more than 6 days past today, verifies start date is that day's first day of the week.
       - In all cases, includes various times with the dates and verifies we're scrolled correctly.
       - In all cases, verifies slider position.
    */
    Tx.test("FreeBusyTests.testSetRangeStart", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Calendar.getToday      = function() { return new Date("11/28/2012"); };
        Helpers.firstDayOfWeek = 0;

        var scroller  = host.querySelector(".scroller"),
            sl = host.querySelector(".slider"),
            d  = host.querySelector(".grid .date"),
            time;

        time = new Date("11/25/2012");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Sun, Nov 25", removeTextMarkers(d.innerText), "11/25 Date");
        tc.areEqual(0,             scroller.scrollLeft,           "11/25 Scroll");
        tc.areEqual(0,             parseInt(sl.style.left, 10),   "11/25 Slider");

        time = new Date("11/25/2012 8:00am");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Sun, Nov 25", removeTextMarkers(d.innerText), "11/25 8am Date");
        tc.areEqual(width60 * 7,   scroller.scrollLeft,           "11/25 8am Scroll");
        tc.areEqual(width60 * 8,   parseInt(sl.style.left, 10),   "11/25 8am Slider");

        time = new Date("11/25/2010");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Thu, Nov 25", removeTextMarkers(d.innerText), "11/25 2010 Date");
        tc.areEqual(0,             scroller.scrollLeft,           "11/25 2010 Scroll");
        tc.areEqual(0,             parseInt(sl.style.left, 10),   "11/25 2010 Slider");

        time = new Date("11/27/2012");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Yesterday", removeTextMarkers(d.innerText), "11/27 Date");
        tc.areEqual(0,           scroller.scrollLeft,           "11/27 Scroll");
        tc.areEqual(0,           parseInt(sl.style.left, 10),   "11/27 Slider");

        time = new Date("11/28/2012");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Today", removeTextMarkers(d.innerText), "11/28 Date");
        tc.areEqual(0,       scroller.scrollLeft,           "11/28 Scroll");
        tc.areEqual(0,       parseInt(sl.style.left, 10),   "11/28 Slider");

        time = new Date("11/29/2012 1:00am");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Tomorrow",   removeTextMarkers(d.innerText), "11/29 Date");
        tc.areEqual(width60 * 24, scroller.scrollLeft,           "11/29 Scroll");
        tc.areEqual(width60 * 25, parseInt(sl.style.left, 10),   "11/29 Slider");

        time = new Date("12/4/2012 11:59pm");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Tue, Dec 4",            removeTextMarkers(d.innerText), "12/4 11:59pm Date");
        tc.areEqual(width60 * (24 * 6 + 22), scroller.scrollLeft,           "12/4 11:59pm Scroll");
        tc.areEqual(parseFloat((width60 * (24 * 6 + 23 + 59 / 60)).toFixed(2)), parseFloat(sl.style.left),     "12/4 11:59pm Slider");

        time = new Date("12/5/2012 1:00am");
        runSync(function() { freebusy.setRange(time, new Date(time.getTime() + 10000000)); });

        tc.areEqual("Wed, Dec 5",           removeTextMarkers(d.innerText), "12/5 Date");
        tc.areEqual(width60 * (24 * 3),     scroller.scrollLeft,           "12/5 Scroll");
        tc.areEqual(width60 * (24 * 3 + 1), parseInt(sl.style.left, 10),   "12/5 Slider");
    });

    function getSliderWidth() {
        var slider = host.querySelector(".slider"),
            parent = slider.parentNode,
            style  = slider.style,
            left   = parseFloat(style.left),
            right  = parent.offsetWidth - parseFloat(style.right);

        return (right - left);
    }

    /* testSetRangeEnd

       - Sets 30 minute range, verifies slider width.
       - Sets two week range, verifies slider width.
    */
    Tx.test("FreeBusyTests.testSetRangeEnd", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var start = new Date("11/25/2012 4:00pm");

        runSync(function() { freebusy.setRange(start, new Date(start.getTime() + Helpers.minuteInMilliseconds * 30)); });
        tc.areEqual(width60 / 2, getSliderWidth(), "30 minute width");

        runSync(function() { freebusy.setRange(start, new Date(start.getTime() + Helpers.dayInMilliseconds * 14)); });
        tc.areEqual(width60 * 24 * 14, getSliderWidth(), "2 week width");

        runSync(function() { freebusy.setRange(start, start); });
        tc.areEqual(0, getSliderWidth(), "0 minute width");
    });

    /* testSetCalendar

       - Sets two calendars
       - Verifies the CSS is updated correctly for the calendars' colors.
    */
    Tx.test("FreeBusyTests.testSetCalendar", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var s = host.querySelector("style"),
            cal;

        cal = new Calendar.Mock.Calendar();
        cal.color = 0;

        runSync(function() { freebusy.setCalendar(cal); });
        tc.isNotNull(s.innerHTML.match("background-color: " + Helpers.processEventColor(cal.color)), "Color 0");

        cal = new Calendar.Mock.Calendar();
        cal.color = 12872;

        runSync(function() { freebusy.setCalendar(cal); });
        tc.isNotNull(s.innerHTML.match("background-color: " + Helpers.processEventColor(cal.color)), "Color 12872");
    });

    /* testSetAttendees
       * Never tests free/busy info--just attendees themselves.

       - Sets three attendees, verifies they show up in the UI.
       - Sets two attendees six times, verifies they only show up once.
    */
    Tx.test("FreeBusyTests.testSetAttendees", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var otherAttendees = host.querySelector(".attendees .other").children,
            attendees;

        tc.areEqual(0, otherAttendees.length, "No attendees by default");

        attendees = [];
        runSync(function() { freebusy.setAttendees(attendees); });

        tc.areEqual(0, otherAttendees.length, "No attendees setting empty array");

        attendees = [
            {
                emailAddress:     "a",
                calculatedUIName: "A"
            },
            {
                emailAddress:     "b",
                calculatedUIName: "B"
            },
            {
                emailAddress:     "c",
                calculatedUIName: "C"
            }
        ];
        runSync(function() { freebusy.setAttendees(attendees); });

        tc.areEqual(3, otherAttendees.length, "3 attendees");

        tc.areEqual(attendees[0].calculatedUIName, otherAttendees[0].innerText, "3 attendees 1");
        tc.areEqual(attendees[1].calculatedUIName, otherAttendees[1].innerText, "3 attendees 2");
        tc.areEqual(attendees[2].calculatedUIName, otherAttendees[2].innerText, "3 attendees 3");

        tc.areEqual(attendees[0].emailAddress, otherAttendees[0].getAttribute("data-attendee"), "3 attendees 1 data");
        tc.areEqual(attendees[1].emailAddress, otherAttendees[1].getAttribute("data-attendee"), "3 attendees 2 data");
        tc.areEqual(attendees[2].emailAddress, otherAttendees[2].getAttribute("data-attendee"), "3 attendees 3 data");

        attendees = [
            {
                emailAddress:     "a",
                calculatedUIName: "A"
            },
            {
                emailAddress:     "b",
                calculatedUIName: "B"
            },
            {
                emailAddress:     "a",
                calculatedUIName: "A"
            },
            {
                emailAddress:     "B",
                calculatedUIName: "b"
            },
            {
                emailAddress:     "B",
                calculatedUIName: "b"
            },
            {
                emailAddress:     "A",
                calculatedUIName: "a"
            }
        ];
        runSync(function() { freebusy.setAttendees(attendees); });

        tc.areEqual(2, otherAttendees.length, "2 attendees dupes");

        tc.areEqual(attendees[0].calculatedUIName, otherAttendees[0].innerText, "2 attendees dupes 1");
        tc.areEqual(attendees[1].calculatedUIName, otherAttendees[1].innerText, "2 attendees dupes 2");

        tc.areEqual(attendees[0].emailAddress, otherAttendees[0].getAttribute("data-attendee"), "2 attendees dupes 1 data");
        tc.areEqual(attendees[1].emailAddress, otherAttendees[1].getAttribute("data-attendee"), "2 attendees dupes 2 data");
   });

    /* testSetResource

       - Start with no rooms.
       - Set a resource.
       - Verify the room is added.

       - Start with rooms.
       - Set a resource.
       - Verify the room is added and selected.

       - Start with rooms.
       - Set a null resource.
       - Verify the rooms are unselected.
    */

    Tx.test("FreeBusyTests.testSetResource", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var attendees = host.querySelector(".attendees .rooms").children,
            schedules = host.querySelector(".schedules .rooms").children,
            attendee, schedule;

        tc.areEqual(0, attendees.length, "Attendees 1");
        tc.areEqual(0, schedules.length, "Schedules 1");

        runSync(function() {
            freebusy.setResource({
                name:  "1",
                email: "a"
            });
        });

        tc.areEqual(1, attendees.length, "Attendees 2");
        tc.areEqual(1, schedules.length, "Schedules 2");

        attendee = attendees[0];
        schedule = schedules[0];

        tc.isTrue(attendee.querySelector("input").checked, "Attendee Checked 1");
        tc.areEqual("1", attendee.querySelector(".name").innerText,                     "Attendee Name 1");
        tc.areEqual("a", attendee.querySelector("input").getAttribute("data-attendee"), "Attendee Email 1");
        tc.areEqual("a", schedule.getAttribute("data-attendee"),                        "Schedule Email 1");

        runSync(function() {
            freebusy.setResource({
                name:  "2",
                email: "b"
            });
        });

        tc.areEqual(1, attendees.length, "Attendees 3");
        tc.areEqual(1, schedules.length, "Schedules 3");

        attendee = attendees[0];
        schedule = schedules[0];

        tc.isTrue(attendee.querySelector("input").checked, "Attendee Checked 2");
        tc.areEqual("2", attendee.querySelector(".name").innerText,                     "Attendee Name 2");
        tc.areEqual("b", attendee.querySelector("input").getAttribute("data-attendee"), "Attendee Email 2");
        tc.areEqual("b", schedule.getAttribute("data-attendee"),                        "Schedule Email 2");

        runSync(function() {
            freebusy.setResource(null);
        });

        tc.areEqual(1, attendees.length, "Attendees 3");
        tc.areEqual(1, schedules.length, "Schedules 3");

        attendee = attendees[0];
        schedule = schedules[0];

        tc.isFalse(attendee.querySelector("input").checked, "Attendee Checked 3");
        tc.areEqual("2", attendee.querySelector(".name").innerText,                     "Attendee Name 3");
        tc.areEqual("b", attendee.querySelector("input").getAttribute("data-attendee"), "Attendee Email 3");
        tc.areEqual("b", schedule.getAttribute("data-attendee"),                        "Schedule Email 3");
    });

    //
    // Slider
    //

    // Helpers

    var pointerDown = document.createEvent("Event"),
        pointerMove = document.createEvent("Event"),
        pointerUp   = document.createEvent("Event");

    pointerDown.button = 0;
    pointerDown.initEvent("MSPointerDown", true, true);

    pointerMove.button = 0;
    pointerMove.initEvent("MSPointerMove", true, true);

    pointerUp.button = 0;
    pointerUp.initEvent("MSPointerUp", true, true);

    function resetPointerOffsets() {
        pointerDown.offsetX = 0;
        pointerDown.offsetY = 0;

        pointerMove.offsetX = 0;
        pointerMove.offsetY = 0;

        pointerUp.offsetX = 0;
        pointerUp.offsetY = 0;
    }

    function sendPointerDownAndUp(target) {
        runSync(function() {
            target.dispatchEvent(pointerDown);
            target.dispatchEvent(pointerMove);
            target.dispatchEvent(pointerUp);
        });
    }

    var oldLeft  = 0,
        oldRight = 0;

    function markLeft() {
        var left = parseFloat(host.querySelector(".slider").style.left),
            diff = (left - oldLeft);

        oldLeft = left;
        return diff;
    }

    function markRight() {
        var right = parseFloat(host.querySelector(".slider").style.right),
            diff  = (right - oldRight);

        oldRight = right;
        return diff;
    }

    /* testClickHours

       - Clicks an hour, verifies the slider moves.
       - Clicks a half hour, verifies the slider moves.
       - Clicks one half hour, moves to another, verifies the slider doesn't move.
       - Clicks one half hour, moves vertically out of range, verifies the slider doesn't move.
    */
    Tx.test("FreeBusyTests.testClickHours", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var times   = host.querySelector(".times"),
            surface = host.querySelector(".surface");

        // initialize the view
        var start = new Date("5/5/2012 3:00am"),
            end   = new Date("5/5/2012 4:30am");
        runSync(function() { freebusy.setRange(start, end); });

        resetPointerOffsets();
        markLeft();
        markRight();

        // click 2:00am
        pointerDown.offsetX = width60 * 2;
        pointerUp.offsetX   = width60 * 2 + (width30 - 1); // absolute right limit before it will cancel
        sendPointerDownAndUp(times);

        tc.areEqual(-width60, markLeft(),  "2:00am left");
        tc.areEqual( width60, markRight(), "2:00am right");

        // click 3:30am
        pointerDown.offsetX = width60 * 3 + (width60 - 1);
        pointerUp.offsetX   = width60 * 3 + width30; // absolute left limit before it will cancel
        sendPointerDownAndUp(surface);

        tc.areEqual( width90, markLeft(),  "3:30am left");
        tc.areEqual(-width90, markRight(), "3:30am right");

        // click 4:00am, moves 4:30am
        pointerDown.offsetX = width60 * 4;
        pointerUp.offsetX   = width60 * 4 + width30; // first right limit that will cancel
        sendPointerDownAndUp(times);

        tc.areEqual(0, markLeft(),  "4-4:30 left");
        tc.areEqual(0, markRight(), "4-4:30 right");

        // click 4:00am, moves vertically out of range
        pointerDown.offsetX = width60 * 4;
        pointerUp.offsetX   = width60 * 4;
        pointerUp.offsetY   = -1; // out of range vertically
        sendPointerDownAndUp(surface);

        tc.areEqual(0, markLeft(),  "4am vertical left");
        tc.areEqual(0, markRight(), "4am vertical right");
    });

    /* testClickLeftVsRight

       - Sets time to start at 2am.
       - Click within 15 minutes of start on right, verifies does not move (2:00 am)
       - Click within 16 minutes of start on right, verifies does not move (2:00 am)
       - Click within 15 minutes of start on left, verifies moves back 30 (1:30 am)
       - Click within 16 minutes of start on left, verifies moves back 30 (1:00 am)
    */
    Tx.test("FreeBusyTests.testClickLeftVsRight", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var times = host.querySelector(".times");

        // initialize the view
        var start = new Date("5/5/2012 2:00am");
        runSync(function() { freebusy.setRange(start, start); });

        resetPointerOffsets();
        markLeft();
        markRight();

        // click 2:15am, verify no movement (2:00 am)
        pointerDown.offsetX = width60 * 2 + width60 / 60;      // 2h1m
        pointerUp.offsetX   = width60 * 2 + width60 * 45 / 60; // 2h15m unclick point
        sendPointerDownAndUp(times);

        tc.areEqual(0, markLeft(),  "2:00am left no movement");
        tc.areEqual(0, markRight(), "2:00am right no movement");

        // click 2:16am, verify no movement (2:00 am)
        pointerDown.offsetX = width60 * 2 + width60 * 16 / 60; // 2h16m
        pointerUp.offsetX   = width60 * 2.5 - 1;  // ~2h29m unclick point
        sendPointerDownAndUp(times);

        tc.areEqual(0, markLeft(),   "2:00am left no movement");
        tc.areEqual(0, markRight(), "2:00am right no movement");

        // click 1:45am, verify movement (1:30 am)
        pointerDown.offsetX = width60 * 1.75;     // 1h45m
        pointerUp.offsetX   = width60 * 1.75 - 1; // 1px short of 2h0m
        sendPointerDownAndUp(times);

        tc.areEqual(-width30, markLeft(),  "1:30am left moved thirty minutes back");
        tc.areEqual( width30, markRight(), "1:30am right moved thirty minutes back");

        // click 1:14am, verify movement (1:00 am)
        pointerDown.offsetX = width60 + width60 * 14 / 60; // 1h14m
        pointerUp.offsetX   = width60 + width60 * 14 / 60; // 1h14m
        sendPointerDownAndUp(times);

        tc.areEqual(-width30, markLeft(),  "1:00am left moved thirty minutes back");
        tc.areEqual( width30, markRight(), "1:00am right moved thirty minutes back");
   });

    /* testSlideLeftGrabber
       * All actions taken on the left grabber.

       - Moves right 30 mins, verifies slider updated.
       - Moves right <15 mins, verifies slider not updated.
       - Moves left <15 mins, verifies slider not updated.
       - Moves left >15 mins, verifies slider updated.
       - Moves right past other grabber, verifies slider updated and grabbers swapped.
    */

    Tx.test("FreeBusyTests.testSlideLeftGrabber", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var slider       = host.querySelector(".slider"),
            grabberLeft  = slider.querySelector(".grabberTouch.left  > .grabber");

        // initialize the view
        var start = new Date("5/5/2012 3:00am"),
            end   = new Date("5/5/2012 4:30am");
        runSync(function() { freebusy.setRange(start, end); });

        resetPointerOffsets();
        markLeft();
        markRight();

        // move right 30 min
        pointerMove.offsetX = width30;
        sendPointerDownAndUp(grabberLeft);

        tc.areEqual(width30, markLeft(),  "Right 30 min left");
        tc.areEqual(0,       markRight(), "Right 30 min right");

        // move right <15 min
        pointerMove.offsetX = (width15 - 1);
        sendPointerDownAndUp(grabberLeft);

        tc.areEqual(0, markLeft(),  "Right <15 min left");
        tc.areEqual(0, markRight(), "Right <15 min right");

        // move left <15 min
        pointerMove.offsetX = -(width15 - 1);
        sendPointerDownAndUp(grabberLeft);

        tc.areEqual(0,  markLeft(),  "Left <15 min left");
        tc.areEqual(0,  markRight(), "Left <15 min right");

        // move left >15 min
        pointerMove.offsetX = -(width15 + 1);
        sendPointerDownAndUp(grabberLeft);

        tc.areEqual(-width30, markLeft(),  "Left >15 min left");
        tc.areEqual(0,        markRight(), "Left >15 min right");

        // move left to right
        pointerMove.offsetX = getSliderWidth();

        var oldSwap = freebusy._swapPointerListener,
            swapped = false;

        freebusy._swapPointerListener = function() {
            swapped = true;
        };

        try {
            sendPointerDownAndUp(grabberLeft);
        } finally {
            freebusy._swapPointerListener = oldSwap;
        }

        tc.isFalse(swapped,  "Left to right not swapped");
        tc.areEqual(width90, markLeft(),  "Left to right left");
        tc.areEqual(0,       markRight(), "Left to right right");

        // move left past right
        pointerMove.offsetX = 1;

        freebusy._swapPointerListener = function() {
            swapped = true;
        };

        try {
            sendPointerDownAndUp(grabberLeft);
        } finally {
            freebusy._swapPointerListener = oldSwap;
        }

        tc.isTrue(swapped, "Left past right swapped");
        tc.areEqual(0, markLeft(),  "Left past right left");
        tc.areEqual(0, markRight(), "Left past right right");
    });

    /* testSlideRightGrabber
       * All actions taken on the right grabber.

       - Moves right 30 mins, verifies slider updated.
       - Moves right <15 mins, verifies slider not updated.
       - Moves left <15 mins, verifies slider not updated.
       - Moves left >15 mins, verifies slider updated.
       - Moves left past other grabber, verifies slider updated and grabbers swapped.
    */
    Tx.test("FreeBusyTests.testSlideRightGrabber", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var slider       = host.querySelector(".slider"),
            grabberRight = slider.querySelector(".grabberTouch.right > .grabber");

        // initialize the view
        var start = new Date("5/5/2012 3:00am"),
            end   = new Date("5/5/2012 4:30am");
        runSync(function() { freebusy.setRange(start, end); });

        resetPointerOffsets();
        markLeft();
        markRight();

        // move right 30 min
        pointerMove.offsetX = width30;
        sendPointerDownAndUp(grabberRight);

        tc.areEqual(0,        markLeft(),  "Right 30 min left");
        tc.areEqual(-width30, markRight(), "Right 30 min right");

        // move right <15 min
        pointerMove.offsetX = (width15 - 1);
        sendPointerDownAndUp(grabberRight);

        tc.areEqual(0, markLeft(),  "Right <15 min left");
        tc.areEqual(0, markRight(), "Right <15 min right");

        // move right <15 min
        pointerMove.offsetX = -(width15 - 1);
        sendPointerDownAndUp(grabberRight);

        tc.areEqual(0,  markLeft(),  "Left <15 min left");
        tc.areEqual(0,  markRight(), "Left <15 min right");

        // move right >15 min
        pointerMove.offsetX = -(width15 + 1);
        sendPointerDownAndUp(grabberRight);

        tc.areEqual(0,       markLeft(),  "Left >15 min left");
        tc.areEqual(width30, markRight(), "Left >15 min right");

        // move right to left
        pointerMove.offsetX = -getSliderWidth();

        var oldSwap = freebusy._swapPointerListener,
            swapped = false;

        freebusy._swapPointerListener = function() {
            swapped = true;
        };

        try {
            sendPointerDownAndUp(grabberRight);
        } finally {
            freebusy._swapPointerListener = oldSwap;
        }

        tc.isFalse(swapped, "Right to left not swapped");
        tc.areEqual(0,       markLeft(),  "Right to left left");
        tc.areEqual(width90, markRight(), "Right to left right");

        // move right past left
        pointerMove.offsetX = -1;

        freebusy._swapPointerListener = function() {
            swapped = true;
        };

        try {
            sendPointerDownAndUp(grabberRight);
        } finally {
            freebusy._swapPointerListener = oldSwap;
        }

        tc.isTrue(swapped, "Right past left swapped");
        tc.areEqual(0, markLeft(),  "Right past left left");
        tc.areEqual(0, markRight(), "Right past left right");
    });

    var keyLeft  = document.createEvent("Event"),
        keyRight = document.createEvent("Event");

    keyLeft.key = "Left";
    keyLeft.initEvent("keydown", true, true);

    keyRight.key = "Right";
    keyRight.initEvent("keydown", true, true);

    /* testKeySlider
       * All actions taken on the slider itself.

       - Starts at 3:15am, keys left, verifies slider moved 15 min.
       - Starts at 3:00am, keys left, verifies slider moved 30 min.
       - Starts at 3:15am, keys right, verifies slider moved 15 min.
       - Starts at 3:30am, keys right, verifies slider moved 30 min.
    */
    Tx.test("FreeBusyTests.testKeySlider", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var slider = host.querySelector(".slider .focus-region");

        // initialize the view
        var start = new Date("5/5/2012 3:15am"),
            end   = new Date("5/5/2012 4:30am");
        runSync(function() { freebusy.setRange(start, end); });

        // initialize our event
        var keyLeft  = document.createEvent("Event"),
            keyRight = document.createEvent("Event");

        keyLeft.key = "Left";
        keyLeft.initEvent("keydown", true, true);

        keyRight.key = "Right";
        keyRight.initEvent("keydown", true, true);

        markLeft();
        markRight();

        // move left 15
        runSync(function() { slider.dispatchEvent(keyLeft); });

        tc.areEqual(-width15, markLeft(),  "Left 15 left");
        tc.areEqual( width15, markRight(), "Left 15 right");

        // move left 30
        runSync(function() { slider.dispatchEvent(keyLeft); });

        tc.areEqual(-width30, markLeft(),  "Left 30 left");
        tc.areEqual( width30, markRight(), "Left 30 right");

        // move right 15
        runSync(function() {
            freebusy._onBack();
            freebusy.setRange(start, end);
        });

        markLeft();
        markRight();

        runSync(function() { slider.dispatchEvent(keyRight); });

        tc.areEqual( width15, markLeft(),  "Right 15 left");
        tc.areEqual(-width15, markRight(), "Right 15 right");

        // move right 30
        runSync(function() { slider.dispatchEvent(keyRight); });

        tc.areEqual( width30, markLeft(),  "Right 30 left");
        tc.areEqual(-width30, markRight(), "Right 30 right");
    });

    /* testKeyLeftGrabber
       * All actions taken on the left grabber.

       - Starts at 3:15am, keys left, verifies left side moved 15 min & right side not moved.
       - Starts at 3:00am, keys left, verifies left side moved 30 min & right side not moved.
       - Starts at 3:15am, keys right, verifies left side moved 15 min & right side moved 30 min.
       - Starts at 3:30am, keys right, verifies left side moved 30 min & right side moved 30 min.
    */
    Tx.test("FreeBusyTests.testKeyLeftGrabber", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var slider       = host.querySelector(".slider"),
            grabberLeft  = slider.querySelector(".grabberTouch.left");

        // initialize the view
        var start = new Date("5/5/2012 3:15am"),
            end   = new Date("5/5/2012 3:30am");
        runSync(function() { freebusy.setRange(start, end); });

        // initialize our event
        markLeft();
        markRight();

        // move left 15
        runSync(function() { grabberLeft.dispatchEvent(keyLeft); });

        tc.areEqual(-width15, markLeft(),  "Left 15 left");
        tc.areEqual(0,        markRight(), "Left 15 right");

        // move left 30
        runSync(function() { grabberLeft.dispatchEvent(keyLeft); });

        tc.areEqual(-width30, markLeft(),  "Left 30 left");
        tc.areEqual(0,        markRight(), "Left 30 right");

        // move right 15
        runSync(function() {
            freebusy._onBack();
            freebusy.setRange(start, end);
        });

        markLeft();
        markRight();
        runSync(function() { grabberLeft.dispatchEvent(keyRight); });

        tc.areEqual( width15, markLeft(),  "Right 15 left");
        tc.areEqual(-width30, markRight(), "Right 15 right");

        // move right 30
        runSync(function() { grabberLeft.dispatchEvent(keyRight); });

        tc.areEqual( width30, markLeft(),  "Right 30 left");
        tc.areEqual(-width30, markRight(), "Right 30 right");
    });

    /* testKeyRightGrabber
       * All actions taken on the right grabber.

       - Starts at 3:15am, keys left, verifies right side moved 15 min & left side moved 30 min.
       - Starts at 3:00am, keys left, verifies right side moved 30 min & left side moved 30 min.
       - Starts at 3:15am, keys right, verifies right side moved 15 min & left side not moved.
       - Starts at 3:30am, keys right, verifies right side moved 30 min & left side not moved.
    */
    Tx.test("FreeBusyTests.testKeyRightGrabber", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var slider       = host.querySelector(".slider"),
            grabberRight = slider.querySelector(".grabberTouch.right");

        // initialize the view
        var start = new Date("5/5/2012 3:00am"),
            end   = new Date("5/5/2012 3:15am");
        runSync(function() { freebusy.setRange(start, end); });

        // initialize our event
        markLeft();
        markRight();

        // move left 15
        runSync(function() { grabberRight.dispatchEvent(keyLeft); });

        tc.areEqual(-width30, markLeft(),  "Left 15 left");
        tc.areEqual( width15, markRight(), "Left 15 right");

        // move left 30
        runSync(function() { grabberRight.dispatchEvent(keyLeft); });

        tc.areEqual(-width30, markLeft(),  "Left 30 left");
        tc.areEqual( width30, markRight(), "Left 30 right");

        // move right 15
        runSync(function() {
            freebusy._onBack();
            freebusy.setRange(start, end);
        });

        markLeft();
        markRight();

        runSync(function() { grabberRight.dispatchEvent(keyRight); });

        tc.areEqual(0,        markLeft(),  "Right 15 left");
        tc.areEqual(-width15, markRight(), "Right 15 right");

        // move right 30
        runSync(function() { grabberRight.dispatchEvent(keyRight); });

        tc.areEqual(0,        markLeft(),  "Right 30 left");
        tc.areEqual(-width30, markRight(), "Right 30 right");
    });

    //
    // Events
    //

    /* testBack

       - Clicks the back button, verifies the back event is fired with the selected time.
       - Programmatically moves the slider.
       - Clicks the back button, verifies the back event is fired with the selected time.
       - Resets range.
       - Clicks the back button, verifies the back event is fired with the selected time.
       - Programmatically moves the slider to 0-duration.
       - Clicks the back button, verifies the back event is fired with the selected time.
    */
    Tx.test("FreeBusyTests.testBack", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var b  = host.querySelector(".win-backbutton"),
            sl = host.querySelector(".slider"),
            result, start, end;

        freebusy.addListener("back", function(data) {
            result = data;
        });

        start = new Date("10/25/2012 3:00pm");
        end   = new Date("10/25/2012 5:15pm");

        runSync(function() { freebusy.setRange(start, end); });
        b.click();

        tc.areEqual(start.getTime(), result.start.getTime(), "Initial start");
        tc.areEqual(end.getTime(),   result.end.getTime(),   "Initial end");

        sl.style.left  = parseFloat(sl.style.left)  - width90 + "px";
        sl.style.right = parseFloat(sl.style.right) - width30 + "px";
        b.click();

        tc.areEqual(new Date("10/25/2012 1:30pm").getTime(), result.start.getTime(), "Adjusted start");
        tc.areEqual(new Date("10/25/2012 5:45pm").getTime(), result.end.getTime(),   "Adjusted end");

        start = new Date("10/25/2012 3:00pm");
        end   = new Date("10/25/2012 3:30pm");
        runSync(function() { freebusy.setRange(start, end); });
        b.click();

        tc.areEqual(start.getTime(), result.start.getTime(), "3:00pm start");
        tc.areEqual(end.getTime(),   result.end.getTime(),   "3:30pm end");

        //Move right slider back to 3:00 (30 min to left)
        sl.style.right = parseFloat(sl.style.right) + width30 + "px";
        b.click();

        tc.areEqual(new Date("10/25/2012 3:00pm").getTime(), result.start.getTime(), "Adjusted start 3pm");
        tc.areEqual(new Date("10/25/2012 3:00pm").getTime(), result.end.getTime(),   "Adjusted end 3pm");
    });

    //
    // Schedules
    //

    /* testMeSchedule

       - Creates tentative event from 12am to 7am.
       - Creates busy event from 1am to 3am.
       - Creates oof event from 2am to 5am.
       - Creates tentative event from 3am to 8am.
       - Creates oof event from 4am to 6am.
       - Creates free event from 9am to 10am.

       - Verifies first hour of tentative 1.
       - Verifies first hour of busy.
       - Verifies all three hours of oof 1.
       - Verifies last hour of oof 2.
       - Verifies last hour of tentative 1.
       - Verifies last hour of tentative 2.
       - Verifies no free.
    */
    Tx.test("FreeBusyTests.testMeSchedule", function (tc) {
        tc.cleanup = cleanup;
        setup();

        ev1 = calendar.createEvent();
        ev1.startDate = new Date("6/13/2011");
        ev1.endDate   = new Date("6/13/2011 6:00am");

        ev1.subject    = "1";
        ev1.location   = "a";
        ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev1.commit();

        ev2 = calendar.createEvent();
        ev2.startDate = new Date("6/13/2011 1:00am");
        ev2.endDate   = new Date("6/13/2011 3:00am");

        ev2.subject    = "2";
        ev2.location   = "b";
        ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
        ev2.commit();

        ev3 = calendar.createEvent();
        ev3.startDate = new Date("6/13/2011 2:00am");
        ev3.endDate   = new Date("6/13/2011 5:00am");

        ev3.subject    = "3";
        ev3.location   = "c";
        ev3.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.outOfOffice;
        ev3.commit();

        ev4 = calendar.createEvent();
        ev4.startDate = new Date("6/13/2011 3:00am");
        ev4.endDate   = new Date("6/13/2011 8:00am");

        ev4.subject    = "4";
        ev4.location   = "d";
        ev4.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev4.commit();

        ev5 = calendar.createEvent();
        ev5.startDate = new Date("6/13/2011 4:00am");
        ev5.endDate   = new Date("6/13/2011 6:00am");

        ev5.subject    = "5";
        ev5.location   = "e";
        ev5.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.outOfOffice;
        ev5.commit();

        ev6 = calendar.createEvent();
        ev6.startDate = new Date("6/13/2011 9:00am");
        ev6.endDate   = new Date("6/13/2011 10:00am");

        ev6.subject    = "6";
        ev6.location   = "f";
        ev6.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
        ev6.commit();

        runSync(function() {
            freebusy.setRange(new Date("6/13/2011"), new Date("6/13/2011 1:00am"));
        });

        var m = host.querySelector(".schedules .me .container"),
            b;

        tc.areEqual(5, m.children.length, "Blocks");

        // the first event will display as much as it can until conflicting with
        // a higher priority event.
        b = m.children[0];
        tc.areEqual(-1,          parseFloat(b.style.left),              "Block 1 offset");
        tc.areEqual(width60,     parseFloat(b.style.width),             "Block 1 width");
        tc.areEqual("1",         b.querySelector(".subject").innerText, "Block 1 subject");
        tc.areEqual("tentative", b.getAttribute("data-status"),         "Block 1 status");

        // the second event is higher priority and will display until being
        // overlapped.
        b = m.children[1];
        tc.areEqual(width60 - 1, parseFloat(b.style.left),              "Block 2 offset");
        tc.areEqual(width60,     parseFloat(b.style.width),             "Block 2 width");
        tc.areEqual("2",         b.querySelector(".subject").innerText, "Block 2 subject");
        tc.areEqual("busy",      b.getAttribute("data-status"),         "Block 2 status");

        // the third event will display in its entirety
        b = m.children[2];
        tc.areEqual(width60 * 2 - 1, parseFloat(b.style.left),              "Block 3 offset");
        tc.areEqual(width60 * 3,     parseFloat(b.style.width),             "Block 3 width");
        tc.areEqual("3",             b.querySelector(".subject").innerText, "Block 3 subject");
        tc.areEqual("outOfOffice",   b.getAttribute("data-status"),         "Block 3 status");

        // the 4th event is skipped for now, because the 5th event is higher priority
        b = m.children[3];
        tc.areEqual(width60 * 5 - 1, parseFloat(b.style.left),              "Block 4 offset");
        tc.areEqual(width60 * 1,     parseFloat(b.style.width),             "Block 4 width");
        tc.areEqual("5",             b.querySelector(".subject").innerText, "Block 4 subject");
        tc.areEqual("outOfOffice",   b.getAttribute("data-status"),         "Block 4 status");

        // now we'll get the tail end of the 4th event.
        b = m.children[4];
        tc.areEqual(width60 * 6 - 1, parseFloat(b.style.left),              "Block 5 offset");
        tc.areEqual(width60 * 2,     parseFloat(b.style.width),             "Block 5 width");
        tc.areEqual("4",             b.querySelector(".subject").innerText, "Block 5 subject");
        tc.areEqual("tentative",     b.getAttribute("data-status"),         "Block 5 status");

        // we won't get the 5th event, because it's free.
    });

    /* testAttendeeSchedules

       - Set 11 attendees, verify we make 3 requests.
       - Set 3 attendees, verify ui matches expected.
    */
    Tx.test("FreeBusyTests.testAttendeeSchedules", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Calendar.Mock.FreeBusyRequest.results = [
            new Array(500).join("1234"),
            new Array(337).join("001100"),
            "lsdahflahsdflkhaoihy576887585778KHLKHRSDFs-!@#%$&"
        ];

        var otherSchedules = host.querySelector(".schedules .other").children,
            attendees;

        attendees = [
            { emailAddress: "1",  calculatedUIName: "1"  },
            { emailAddress: "2",  calculatedUIName: "2"  },
            { emailAddress: "3",  calculatedUIName: "3"  },
            { emailAddress: "4",  calculatedUIName: "4"  },
            { emailAddress: "5",  calculatedUIName: "5"  },
            { emailAddress: "6",  calculatedUIName: "6"  },
            { emailAddress: "7",  calculatedUIName: "7"  },
            { emailAddress: "8",  calculatedUIName: "8"  },
            { emailAddress: "9",  calculatedUIName: "9"  },
            { emailAddress: "10", calculatedUIName: "10" },
            { emailAddress: "11", calculatedUIName: "11" }
        ];

        var count = 0,
            originalRequestFreeBusyData = manager.requestFreeBusyData;

        var requestFreeBusyDataWrapper = function (account, start, end, collection) {
            /// <summary>Wraps manager.requestFreeBusyData and allows us to make some assertions</summary>
            for (var i = 0, len = collection.length; i < len; i++) {
                tc.areEqual(attendees[i + count * 5].emailAddress, collection[i], "Attendee " + i);
            }

            count++;

            return originalRequestFreeBusyData.apply(this, arguments);
        };

        try {
            manager.requestFreeBusyData = requestFreeBusyDataWrapper;
            runSync(function() { freebusy.setAttendees(attendees); });
        } finally {
            manager.requestFreeBusyData = originalRequestFreeBusyData;
        }

        tc.areEqual(3, count, "3 requests");

        attendees = [
            { emailAddress: "1", calculatedUIName: "1" },
            { emailAddress: "2", calculatedUIName: "2" },
            { emailAddress: "3", calculatedUIName: "3" }
        ];

        count = 0;

        try {
            manager.requestFreeBusyData = requestFreeBusyDataWrapper;
            runSync(function() { freebusy.setAttendees(attendees); });
        } finally {
            manager.requestFreeBusyData = originalRequestFreeBusyData;
        }

        tc.areEqual(0, count,                 "0 requests");
        tc.areEqual(3, otherSchedules.length, "3 schedules");

        // get start and end days
        var now   = new Date(),
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + numberOfDays);

        // verify first attendee
        var blocks = otherSchedules[0].firstElementChild.children;

        // when we switch *to* dst, one half hour block will get extended to 90 minutes
        if (end.getTimezoneOffset() < start.getTimezoneOffset()) {
            tc.areEqual(numberOfDays * 48 - 2, blocks.length, "Attendee 1 Children");
        } else {
            tc.areEqual(numberOfDays * 48, blocks.length, "Attendee 1 Children");
        }

        // verify second attendee
        blocks = otherSchedules[1].firstElementChild.children;
        tc.areEqual(numberOfDays * 48 / 6, blocks.length, "Attendee 2 Children");

        // verify third attendee
        blocks = otherSchedules[2].firstElementChild.children;
        tc.areEqual(1, blocks.length, "Attendee 3 Children");

        var block = blocks[0],
            style = block.style;

        tc.areEqual(0,                         parseFloat(style.left),  "Attendee 3 Left");
        tc.areEqual(FreeBusy._scrollWidth - 1, parseFloat(style.width), "Attendee 3 Width");
        tc.isTrue(block.classList.contains("unknown"), "Attendee 3 Class");
    });


    //
    // Work Hours
    //

    /* testWorkHoursMe

       - Start in non-work hours.
       - Verify me schedule.
       - Switch to work hours.
       - Verify me schedule.
    */

    Tx.test("FreeBusyTests.testWorkHoursMe", function (tc) {
        tc.cleanup = cleanup;
        setup();
       
        var m, b;

        ev1 = calendar.createEvent();
        ev1.startDate = new Date("6/13/2011 6:00am");
        ev1.endDate   = new Date("6/13/2011 8:00am");

        ev1.subject    = "before - before";
        ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev1.commit();

        ev2 = calendar.createEvent();
        ev2.startDate = new Date("6/13/2011 7:00am");
        ev2.endDate   = new Date("6/13/2011 9:00am");

        ev2.subject    = "before - within";
        ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev2.commit();

        ev3 = calendar.createEvent();
        ev3.startDate = new Date("6/13/2011 10:00am");
        ev3.endDate   = new Date("6/13/2011 11:00am");

        ev3.subject    = "within - within";
        ev3.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev3.commit();

        ev4 = calendar.createEvent();
        ev4.startDate = new Date("6/13/2011 5:00pm");
        ev4.endDate   = new Date("6/13/2011 7:00pm");

        ev4.subject    = "within - after";
        ev4.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev4.commit();

        ev5 = calendar.createEvent();
        ev5.startDate = new Date("6/13/2011 7:00pm");
        ev5.endDate   = new Date("6/13/2011 9:00pm");

        ev5.subject    = "after - after";
        ev5.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev5.commit();

        ev6 = calendar.createEvent();
        ev6.startDate = new Date("6/14/2011 7:00am");
        ev6.endDate   = new Date("6/14/2011 9:00pm");

        ev6.subject    = "before - after";
        ev6.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev6.commit();

        runSync(function() {
            freebusy.setRange(new Date("6/13/2011"), new Date("6/13/2011 1:00am"));
        });

        m = host.querySelector(".schedules .me .container");
        tc.areEqual(6, m.children.length, "All Hours Blocks");

        b = m.children[0];
        tc.areEqual(width60 * 6 - 1, parseFloat(b.style.left), "All Hours Block 1 offset");
        tc.areEqual(width60 * 2, parseFloat(b.style.width), "All Hours Block 1 width");
        tc.areEqual("before - before", b.querySelector(".subject").innerText, "All Hours Block 1 subject");

        b = m.children[1];
        tc.areEqual(width60 * 8 - 1, parseFloat(b.style.left), "All Hours Block 2 offset");
        tc.areEqual(width60 * 1, parseFloat(b.style.width), "All Hours Block 2 width");
        tc.areEqual("before - within", b.querySelector(".subject").innerText, "All Hours Block 2 subject");

        b = m.children[2];
        tc.areEqual(width60 * 10 - 1, parseFloat(b.style.left), "All Hours Block 3 offset");
        tc.areEqual(width60 * 1, parseFloat(b.style.width), "All Hours Block 3 width");
        tc.areEqual("within - within", b.querySelector(".subject").innerText, "All Hours Block 3 subject");

        b = m.children[3];
        tc.areEqual(width60 * 17 - 1, parseFloat(b.style.left), "All Hours Block 4 offset");
        tc.areEqual(width60 * 2, parseFloat(b.style.width), "All Hours Block 4 width");
        tc.areEqual("within - after", b.querySelector(".subject").innerText, "All Hours Block 4 subject");

        b = m.children[4];
        tc.areEqual(width60 * 19 - 1, parseFloat(b.style.left), "All Hours Block 5 offset");
        tc.areEqual(width60 * 2, parseFloat(b.style.width), "All Hours Block 5 width");
        tc.areEqual("after - after", b.querySelector(".subject").innerText, "All Hours Block 5 subject");

        b = m.children[5];
        tc.areEqual(width60 * 31 - 1, parseFloat(b.style.left), "All Hours Block 6 offset");
        tc.areEqual(width60 * 14, parseFloat(b.style.width), "All Hours Block 6 width");
        tc.areEqual("before - after", b.querySelector(".subject").innerText, "All Hours Block 6 subject");

        // we won't get the 5th event, because it's free.
        runSync(function() {
            freebusy._setWorkHours(true);
        });

        m = host.querySelector(".schedules .me .container");
        tc.areEqual(4, m.children.length, "Work Hours Blocks");

        // the 1st event is entirely before.  it won't show.

        // the 2nd event starts before and ends within.  it'll be bound to the start.
        b = m.children[0];
        tc.areEqual(width60 * 0 - 1, parseFloat(b.style.left), "Work Hours Block 1 offset");
        tc.areEqual(width60 * 1, parseFloat(b.style.width), "Work Hours Block 1 width");
        tc.areEqual("before - within", b.querySelector(".subject").innerText, "Work Hours Block 1 subject");

        // the 3rd event starts and ends within the day.  it'll have it's fill area.
        b = m.children[1];
        tc.areEqual(width60 * 2 - 1, parseFloat(b.style.left), "Work Hours Block 2 offset");
        tc.areEqual(width60 * 1, parseFloat(b.style.width), "Work Hours Block 2 width");
        tc.areEqual("within - within", b.querySelector(".subject").innerText, "Work Hours Block 2 subject");

        // the 4th event starts within and ends after.  it'll be bound to the end.
        b = m.children[2];
        tc.areEqual(width60 * 9 - 1, parseFloat(b.style.left), "Work Hours Block 3 offset");
        tc.areEqual(width60 * 2, parseFloat(b.style.width), "Work Hours Block 3 width");
        tc.areEqual("within - after", b.querySelector(".subject").innerText, "Work Hours Block 3 subject");

        // the 5th event is entirely after.  it won't show.

        // the 6th event starts before and ends after.  it'll be bound on both sides.
        b = m.children[3];
        tc.areEqual(width60 * 11 - 1, parseFloat(b.style.left), "Work Hours Block 4 offset");
        tc.areEqual(width60 * 11, parseFloat(b.style.width), "Work Hours Block 4 width");
        tc.areEqual("before - after", b.querySelector(".subject").innerText, "Work Hours Block 4 subject");
    });

    /* testWorkHoursAttendees

       - Start in non-work hours.
       - Verify attendee schedule.
       - Switch to work hours.
       - Verify attendee schedule.
    */
    Tx.test("FreeBusyTests.testWorkHoursAttendees", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Calendar.Mock.FreeBusyRequest.results = [
            new Array(337).join("111111111111112222222222222222222222222211111111")
        ];

        var otherSchedules = host.querySelector(".schedules .other").children,
            attendees, blocks;

        attendees = [
            { emailAddress: "1", calculatedUIName: "1" }
        ];

        runSync(function() {
            freebusy.setAttendees(attendees);
        });

        blocks = otherSchedules[0].firstElementChild.children;
        tc.areEqual(numberOfDays * 2 + 1, blocks.length, "All Hours Attendee Children");

        runSync(function() {
            freebusy._setWorkHours(true);
        });

        blocks = otherSchedules[0].firstElementChild.children;
        tc.areEqual(numberOfDays, blocks.length, "Work Hours Attendee Children");
    });

    //
    // Refresh
    //

    /* testRefresh

       - Verify attendee schedule.
       - Change attendee schedule.
       - Verify attendee schedule.
       - Refresh.
       - Verify attendee schedule.
    */
    Tx.test("FreeBusyTests.testRefresh", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Calendar.Mock.FreeBusyRequest.results = [
            "X"
        ];

        var otherSchedules = host.querySelector(".schedules .other").children,
            attendees, blocks;

        attendees = [
            { emailAddress: "1", calculatedUIName: "1" }
        ];

        runSync(function() {
            freebusy.setAttendees(attendees);
        });

        // initially we should have one unknown block
        blocks = otherSchedules[0].firstElementChild.children;
        tc.areEqual(1, blocks.length, "Attendee Children 1");
        tc.isTrue(blocks[0].classList.contains("unknown"), "Attendee Status 1");

        Calendar.Mock.FreeBusyRequest.results = [
            new Array(36 * 24 * 2).join("1")
        ];

        // nothing should have changed yet.  we haven't refreshed.
        blocks = otherSchedules[0].firstElementChild.children;
        tc.areEqual(1, blocks.length, "Attendee Children 2");
        tc.isTrue(blocks[0].classList.contains("unknown"), "Attendee Status 2");

        runSync(function() {
            freebusy._onRefresh();
        });

        // now we should have one tentative block
        blocks = otherSchedules[0].firstElementChild.children;
        tc.areEqual(1, blocks.length, "Attendee Children 3");
        tc.isTrue(blocks[0].classList.contains("tentative"), "Attendee Status 3");
    });

    //
    // Accessibility
    //

    /* testSliderAccessibility

       - Select various times, verify the aria info is correct.
       - Use keyboard to move the slider, verify the aria info is updated.
    */

    function getSliderLabel() {
        return host.querySelector(".slider .focus-region").getAttribute("aria-label");
    }

    Tx.test("FreeBusyTests.testSliderAccessibility", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var slider       = host.querySelector(".slider .focus-region"),
            grabberLeft  = host.querySelector(".grabberTouch.left"),
            grabberRight = host.querySelector(".grabberTouch.right"),
            longDateTime = Calendar.Helpers.dateAndTime,
            shortTime = new Jx.DTFormatter("shorttime"),
            start, end;

        tc.log("Start and end are the same");
        start = new Date("12/12/2012 3:00am");
        runSync(function () { freebusy.setRange(start, start); });
        tc.areEqual("DateRange;" + longDateTime.format(start) + ";" + shortTime.format(start), getSliderLabel());

        tc.log("Simple start/end");
        start = new Date("12/12/2012 3:00am");
        end   = new Date("12/12/2012 3:30pm");
        runSync(function () { freebusy.setRange(start, end); });
        tc.areEqual("DateRange;" + longDateTime.format(start) + ";" + shortTime.format(end), getSliderLabel());

        tc.log("Range is over date boundary");
        start = new Date("12/12/2012 3:00am");
        end   = new Date("12/13/2012");
        runSync(function () { freebusy.setRange(start, end); });
        tc.areEqual("DateRange;" + longDateTime.format(start) + ";" + longDateTime.format(end), getSliderLabel());

        tc.log("Slider - Right key");
        runSync(function () { slider.dispatchEvent(keyRight); });
        tc.areEqual("DateRange;" + longDateTime.format(new Date("12/12/2012 3:30am")) + ";" + longDateTime.format(new Date("12/13/2012 12:30am")), getSliderLabel());

        tc.log("Left grabber - Right key");
        runSync(function () { grabberLeft.dispatchEvent(keyRight); });
        tc.areEqual("DateRange;" + longDateTime.format(new Date("12/12/2012 4:00am")) + ";" + longDateTime.format(new Date("12/13/2012 12:30am")), getSliderLabel());


        tc.log("Right grabber - Left key");
        runSync(function () { grabberRight.dispatchEvent(keyLeft); });
        tc.areEqual("DateRange;" + longDateTime.format(new Date("12/12/2012 4:00am")) + ";" + longDateTime.format(end), getSliderLabel());
    });

    /* testAttendeeAccessibility

       - Add three attendees.
       - Select various times, verify the aria info is correct.
       - Use keyboard to move the slider, verify the aria info is updated.
    */

    function getAttendeeLabel(index) {
        return host.querySelectorAll(".attendees .other .attendee")[index].getAttribute("aria-label").trim();
    }

    Tx.test("FreeBusyTests.testAttendeeAccessibility", function (tc) {
        tc.cleanup = cleanup;
        setup();

        Calendar.Mock.FreeBusyRequest.results = [
            new Array(337).join("01234"),
            new Array(337).join("00110"),
            "lsdahflahsdflkhaoihy576887585778KHLKHRSDFs-!@#%$&"
        ];

        var slider = host.querySelector(".slider .focus-region"),
            grabberLeft = host.querySelector(".grabberTouch.left"),
            grabberRight = host.querySelector(".grabberTouch.right"),
            longDateTime = Calendar.Helpers.dateAndTime,
            shortTime = new Jx.DTFormatter("shorttime"),
            start, end;

        runSync(function () {
            freebusy.setAttendees([
                { emailAddress: "1", calculatedUIName: "A" },
                { emailAddress: "2", calculatedUIName: "B" },
                { emailAddress: "3", calculatedUIName: "C" }
            ]);
        });

        start = new Date("12/12/2012 3:00am");
        end = new Date("12/12/2012 5:30am");
        var three = shortTime.format(start),
            threeThirty = shortTime.format(new Date("12/12/2012 3:30am")),
            four = shortTime.format(new Date("12/12/2012 4:00am")),
            fourThirty = shortTime.format(new Date("12/12/2012 4:30am")),
            five = shortTime.format(new Date("12/12/2012 5:00am")),
            fiveThirty = shortTime.format(new Date("12/12/2012 5:30am"));

        runSync(function () { freebusy.setRange(start, end); });
        tc.areEqual("A: DateRange;" + three + ";" + threeThirty + ", EventStatusTentative; DateRange;" + threeThirty + ";" + four + ", EventStatusBusy; DateRange;" + four + ";" + fourThirty + ", EventStatusOOF; DateRange;" + fourThirty+ ";" + five + ", FreeBusyUnknown; DateRange;" + five + ";" + fiveThirty + ", EventStatusFree;", getAttendeeLabel(0));
        tc.areEqual("B: DateRange;" + three + ";" + threeThirty + ", EventStatusFree; DateRange;" + threeThirty + ";" + fourThirty + ", EventStatusTentative; DateRange;" + fourThirty + ";" + fiveThirty + ", EventStatusFree;", getAttendeeLabel(1));
        tc.areEqual("C: DateRange;" + three + ";" + fiveThirty + ", FreeBusyUnknown;", getAttendeeLabel(2));

        start = new Date("12/12/2012 11:50pm");
        end = new Date("12/13/2012 1:00am");
        var eleven = shortTime.format(start),
            midnightLong = longDateTime.format(new Date("12/13/2012 12:00am")),
            twelveThirtyLong = longDateTime.format(new Date("12/13/2012 12:30am")),
            oneLong = longDateTime.format(new Date("12/13/2012 1:00am")),
            midnight = shortTime.format(new Date("12/13/2012 12:00am")),
            twelveThirty = shortTime.format(new Date("12/13/2012 12:30am")),
            one = shortTime.format(new Date("12/13/2012 1:00am")),
            oneThirty = shortTime.format(new Date("12/13/2012 1:30am"));

        runSync(function () { freebusy.setRange(start, end); });
        tc.areEqual("A: DateRange;" + eleven + ";" + midnightLong + ", EventStatusBusy; DateRange;" + midnight + ";" + twelveThirty + ", EventStatusOOF; DateRange;" + twelveThirty + ";" + one + ", FreeBusyUnknown;", getAttendeeLabel(0));
        tc.areEqual("B: DateRange;" + eleven + ";" + twelveThirtyLong + ", EventStatusTentative; DateRange;" + twelveThirty + ";" + one + ", EventStatusFree;", getAttendeeLabel(1));
        tc.areEqual("C: DateRange;" + eleven + ";" + oneLong + ", FreeBusyUnknown;", getAttendeeLabel(2));

        runSync(function () { slider.dispatchEvent(keyRight); });
        tc.areEqual("A: DateRange;" + midnight + ";" + twelveThirty + ", EventStatusOOF; DateRange;" + twelveThirty + ";" + one + ", FreeBusyUnknown; DateRange;" + one + ";" + oneThirty + ", EventStatusFree;", getAttendeeLabel(0));
        tc.areEqual("B: DateRange;" + midnight + ";" + twelveThirty + ", EventStatusTentative; DateRange;" + twelveThirty + ";" + oneThirty + ", EventStatusFree;", getAttendeeLabel(1));
        tc.areEqual("C: DateRange;" + midnight + ";" + oneThirty + ", FreeBusyUnknown;", getAttendeeLabel(2));

        runSync(function () { grabberLeft.dispatchEvent(keyRight); });
        tc.areEqual("A: DateRange;" + twelveThirty + ";" + one + ", FreeBusyUnknown; DateRange;" + one + ";" + oneThirty + ", EventStatusFree;", getAttendeeLabel(0));
        tc.areEqual("B: DateRange;" + twelveThirty + ";" + oneThirty + ", EventStatusFree;", getAttendeeLabel(1));
        tc.areEqual("C: DateRange;" + twelveThirty + ";" + oneThirty + ", FreeBusyUnknown;", getAttendeeLabel(2));

        runSync(function () { grabberRight.dispatchEvent(keyLeft); });
        tc.areEqual("A: DateRange;" + twelveThirty + ";" + one + ", FreeBusyUnknown;", getAttendeeLabel(0));
        tc.areEqual("B: DateRange;" + twelveThirty + ";" + one + ", EventStatusFree;", getAttendeeLabel(1));
        tc.areEqual("C: DateRange;" + twelveThirty + ";" + one + ", FreeBusyUnknown;", getAttendeeLabel(2));
    });


    //
    // Room Finder
    //

    /* testRoomInteractions

       - Add rooms.
       - Verify they show in the UI.

       - Fire back.
       - Verify no resource.

       - Select room.
       - Fire back.
       - Verify resource set.

       - Clear rooms.
       - Verify UI cleared.
    */
 
    Tx.test("FreeBusyTests.testRoomInteractions", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var attendees = host.querySelector(".attendees .rooms").children,
            schedules = host.querySelector(".schedules .rooms").children,
            recipients, attendee, blocks;

        freebusy._roomFinderWell = {
            setDisabled:    Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            shutdownUI:     Jx.fnEmpty
        };

        freebusy._flyoutHost = {};

        Calendar.Mock.FreeBusyRequest.results = [
            new Array(337).join("111111111111112222222222222222222222222211111111"),
            "X"
        ];

        recipients = [
            { emailAddress: "a", calculatedUIName: "1" },
            { emailAddress: "b", calculatedUIName: "2" }
        ];

        runSync(function() {
            freebusy._onBeforeRoomsAdded({
                recipients: recipients
            });
        });

        tc.areEqual(2, attendees.length, "Attendees");
        tc.areEqual(2, schedules.length, "Schedules");

        recipients = [
            { emailAddress: "b", calculatedUIName: "2" }
        ];

        runSync(function() {
            freebusy._onBeforeRoomsAdded({
                recipients: recipients
            });
        });

        tc.areEqual(2, attendees.length, "Attendees Same");
        tc.areEqual(2, schedules.length, "Schedules Same");

        attendee = attendees[0];
        tc.areEqual("1", attendee.querySelector(".name").innerText, "Room 1 Name");
        tc.isFalse(attendee.querySelector("input").checked,         "Room 1 Status");

        attendee = attendees[1];
        tc.areEqual("2", attendee.querySelector(".name").innerText, "Room 2 Name");
        tc.isFalse(attendee.querySelector("input").checked,         "Room 2 Status");

        blocks = schedules[0].firstElementChild.children;
        tc.areEqual(numberOfDays * 2 + 1, blocks.length, "Schedule 1");

        blocks = schedules[1].firstElementChild.children;
        tc.areEqual(1, blocks.length, "Schedule 2");

        var result;

        freebusy.addListener("back", function(data) {
            result = data;
        });

        freebusy._onBack();
        tc.isNull(result.resource, "Resource Unchecked");

        attendee.querySelector("input").checked = true;
        freebusy._onBack();

        tc.isNotNull(result.resource, "Resource Checked");
        tc.areEqual("2", result.resource.name,  "Resource Name");
        tc.areEqual("b", result.resource.email, "Resource Email");

        runSync(function() {
            freebusy._onClearRooms();
        });

        tc.areEqual(0, attendees.length, "Attendees Cleared");
        tc.areEqual(0, schedules.length, "Schedules Cleared");

        freebusy._onBack();
        tc.isNull(result.resource, "Resource Cleared");
    });
   
})();