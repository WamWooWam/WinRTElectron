
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global BVT,Tx,$,CalendarLib,DatePickerLib,UtilitiesLib,WinJS,WeekViewLib,EventDetailsLib*/


(function () {

    var conflictingEvent1title = "Conflicting Event 1";
    var conflictingEvent2title = "Conflicting Event 2";
    var conflictingEvent3title = "Conflicting Event 3";
    var conflictingEvent4title = "Conflicting Event 4";
    var conflictingEvent5title = "Conflicting Event 5";
    var conflictingEvent6title = "Conflicting Event 6";

    var allDayEvent1title = "Event 1";
    var allDayEvent2title = "Event 2";
    var allDayEvent3title = "Event 3";
    var allDayEvent4title = "Event 4";

    // Cleanup function that cleans up after running a test.
    function cleanup (tc) {
        tc.start();
    }

    /// OWNER: chwhit
    /// Injects events for later verification.
    function eventInjection(tc) {
        var eventForViewChange;
        CalendarLib.weekView()
        .then(function () { return new WinJS.Promise.wrap(eventForViewChange = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView())); })
        .then(function () { return CalendarLib.openEvent(conflictingEvent1title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return CalendarLib.openEvent(conflictingEvent2title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return CalendarLib.openEvent(conflictingEvent3title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return CalendarLib.openEvent(conflictingEvent4title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return CalendarLib.openEvent(conflictingEvent5title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return CalendarLib.openEvent(conflictingEvent6title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .done(function () { tc.start(); });
    }
    
    /// OWNER: chwhit
    /// cleanup function for verify events
    /// deletes the all day events created
    function cleanupAllDayEvents(tc) {
        var eventForViewChange;
        CalendarLib.weekView()
        .then(function () { return new WinJS.Promise.wrap(eventForViewChange = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView())); })
        .then(function () { return CalendarLib.openEvent(allDayEvent1title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return WeekViewLib.clickOnMore(new Date().getDay()); })
        .then(function () { return CalendarLib.openEvent(allDayEvent2title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return WeekViewLib.clickOnMore(new Date().getDay()); })
        .then(function () { return CalendarLib.openEvent(allDayEvent3title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .then(function () { return WeekViewLib.clickOnMore(new Date().getDay()); })
        .then(function () { return CalendarLib.openEvent(allDayEvent4title); })
        .then(function () { return EventDetailsLib.deleteEvent(eventForViewChange); })
        .done(function () { tc.start();});
    }

    /// Verify the header for days, month and year displayed in weekview.
    BVT.Test("WeekView_HeaderVerification", {"owner" : "chwhit"}, function (tc) {
        tc.stop();

        var curCalendarDay;
        var curCalendarMonth;
        var curMonth;
        var curDay;
        CalendarLib.weekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                var curDayMonth = WeekViewLib.getMonthForIndex(0);
                var lastDayMonth = WeekViewLib.getMonthForIndex(6);
                tc.areEqual(curDayMonth != lastDayMonth, WeekViewLib.weekViewCrossesMonth(), "Week Should show that it crosses into the next month");
                var currentDate = new Date();
                var weekFirstDay = WeekViewLib.getDateForIndex(0);
                var weekFirstDayMonth = CalendarLib.getShortHand(WeekViewLib.getMonthForIndex(0));
                var count = 6;
                var fn;
                BVT.marks.once("{\"Tx\":\"testLog\",\"desc\":\"\",\"msg\":\"Day 1 verified\"}", fn = function () {
                    if (count === 0) {
                        complete();
                    } else {
                        curMonth = CalendarLib.getShortHand(CalendarLib.getMonthText(currentDate.getMonth()));
                        curCalendarDay = WeekViewLib.getDayForIndex(7 - count);
                        curCalendarMonth = CalendarLib.getShortHand(WeekViewLib.getMonthForIndex(7 - count));
                        Tx.log("Verifying Day: " + (8 - count));
                        if (weekFirstDayMonth === curMonth) {
                            currentDate.setDate(weekFirstDay + (7 - count));
                        } else {
                            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, weekFirstDay + (7 - count));
                        }
                        curDay = CalendarLib.getShortHand(WeekViewLib.getDayText(currentDate.getDay()));
                        curMonth = CalendarLib.getShortHand(CalendarLib.getMonthText(currentDate.getMonth()));
                        tc.areEqual(curDay, curCalendarDay, "Day in header do not match: expected: " + curDay + " Actual: " + curCalendarDay);
                        tc.areEqual(curMonth, curCalendarMonth, "Month in header do not match: expected: " + curMonth + " Actual: " + curCalendarMonth);
                        --count;
                        fn();
                    }
                });
                curMonth = CalendarLib.getShortHand(CalendarLib.getMonthText(currentDate.getMonth()));
                curCalendarDay = WeekViewLib.getDayForIndex(0);
                curCalendarMonth = CalendarLib.getShortHand(WeekViewLib.getMonthForIndex(0));
                Tx.log("Verifying Day: 1");
                if (weekFirstDayMonth === curMonth) {
                    currentDate.setDate(weekFirstDay);
                } else {
                    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, weekFirstDay);
                }
                curDay = CalendarLib.getShortHand(WeekViewLib.getDayText(currentDate.getDay()));
                curMonth = CalendarLib.getShortHand(CalendarLib.getMonthText(currentDate.getMonth()));
                tc.areEqual(curDay, curCalendarDay, "Day in header do not match: expected: " + curDay + " Actual: " + curCalendarDay);
                tc.areEqual(curMonth, curCalendarMonth, "Month in header do not match: expected: " + curMonth + " Actual: " + curCalendarMonth);
                Tx.log("Day 1 verified");
            });//Promise
        })
        .done(function () {
            cleanup(tc);
        }, //End-success handler
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); // End Header Verification

    /// verify the text for this week, last week and next week
    BVT.Test("WeekView_LabelVerification", { "owner": "chwhit" }, function (tc) {
        tc.stop();

        CalendarLib.weekView()
        .then(function () { return CalendarLib.goToToday(); })
        //Verify label text for this week
        .then(function () {
            return new WinJS.Promise(function (complete) {
                Tx.log("Verifying label for This week");
                tc.areEqual(WeekViewLib.getHeaderText(), "This week", "The header for this week not correct: Expected: This week, Actual: " + WeekViewLib.getHeaderText());
                complete();
            });
        })
        //verify label text for next week
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                Tx.log("Verifying label for Next week");
                tc.areEqual(WeekViewLib.getHeaderText(), "Next week", "The header for this week not correct: Expected: Next week, Actual: " + WeekViewLib.getHeaderText());
                complete();
            });
        })
        //verify label text for last week
        .then(function () { return CalendarLib.nextViewPast(); })
        .then(function () { return CalendarLib.nextViewPast(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                Tx.log("Verifying label for Last week");
                tc.areEqual(WeekViewLib.getHeaderText(), "Last week", "The header for this week not correct: Expected: Last week, Actual: " + WeekViewLib.getHeaderText());
                complete();
            });
        })
        .done(function () {
            Tx.log("WeekView_LabelVerification Verification Test Passed");
            cleanup(tc);
        }, //End-success handler
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); // end Label verification

    /// Verify that weekends are displayed
    BVT.Test("WeekView_WeekendVerification", { "owner": "chwhit" }, function (tc) {
        tc.stop();
        CalendarLib.weekView()
        .then(function () {
            return new WinJS.Promise(function (complete) {
                var weekendNum = WeekViewLib.getWeekendDays().length;
                tc.areEqual(weekendNum, 2, "Weekends not shown properly");
                complete();
            });
        })
        .done(function () {
            cleanup(tc);
        }, //End-success handler
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); // end Weekendverification

    /// Verify the week displayed by default for current month and next month
    BVT.Test("WeekView_VerifyWeekSelected", { "owner": "chwhit" }, function (tc) {
        tc.stop();
        var d = new Date();
        CalendarLib.weekView()
        //go to month view and navigate to today
        .then(function () { return CalendarLib.monthView(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return CalendarLib.goToToday(); })
        //then navigate to week view and verify if today is shown or not
        .then(function () { return CalendarLib.weekView(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                //curDay would be of format Jul 2
                var curDay = CalendarLib.getShortHand(CalendarLib.getMonthText(d.getMonth())) + " " + d.getDate();
                var curDayShown = false;
                for (var i = 0; i < 7; i++) {
                    //curCalendarDay should be of index curCalendarDay
                    var curCalendarDay = UtilitiesLib.removeTextMarkers(WeekViewLib.getMonthForIndex(i) + " " + WeekViewLib.getDateForIndex(i));
                    Tx.log(curCalendarDay + " " + curDay);
                    //verifies if current day is shown or not : format of both strings is 'Jul 2'
                    if (curCalendarDay === curDay) {
                        curDayShown = true;
                        break;
                    }
                }
                tc.isTrue(curDayShown, "Current day not shown for current month");
                complete();
            });
        })
        .then(function () { return CalendarLib.monthView(); })
        .then(function () { return CalendarLib.nextViewFuture(); })
        .then(function () { return CalendarLib.weekView(); })
        // the next block verifies if first day of next month is shown if weekview is called if in monthview
        // user is currently on next month
        // text can be of form Sun, Jun 23( in case of next Week) or Saturday 23(in case of all other views)
        .then(function () {
            return new WinJS.Promise(function (complete) {
                //verifying if there is a day with date 1;
                //if it is next week then we need two splits, else only one split would do
                var firsDayShown = false;
                for (var i = 0; i < 7; i++) {
                    var dateDisplayed = WeekViewLib.getDateForIndex(i);
                    if (dateDisplayed === 1) {
                        firsDayShown = true;
                        break;
                    }
                }

                //if there is no day that has date = 1, then throw error else verify month for that day
                tc.isTrue(firsDayShown, "First week not shown for next month");
                Tx.log("First day shown for next month in week view");

                //verifies that we're in next month
                var weekHeader = WeekViewLib.getHeaderText();
                var specialWeekHeader = (weekHeader.indexOf("Next week") !== -1 || weekHeader.indexOf("This week") !== -1);
                if (specialWeekHeader) {
                    weekHeader = WeekViewLib.getHeaderDays()[6].innerText;
                }
                var monthReq = CalendarLib.getShortHand(CalendarLib.getMonthText(d.getMonth() + 1));
                tc.areEqual(weekHeader.indexOf(monthReq) !== -1, true, "Expected " + monthReq + " to be in header or subheader " + weekHeader);
                Tx.log("Expected week shown in next month after switching to week view from month view");
                complete();
            });
        })
        .done(function () {
            cleanup(tc);
        }, //End-success handler
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); // End WeekView_VerifyWeekSelected


    /// OWNER: chwhit
    /// Verifies events created above
    function verifyEvents() {
        return new WinJS.Promise(function (complete) {
            var day = new Date().getDay();
            CalendarLib.weekView()
            ///Click on all the more buttons present
            .then(function () { return WeekViewLib.clickOnMore(day); })
            ///verifying first two events are present in allDay events and have correct subjects
            .then(function () {
                return new WinJS.Promise(function (complete) {
                    CalendarLib.getSingleAllDayEvent(allDayEvent4title);
                    CalendarLib.getSingleAllDayEvent(allDayEvent3title);
                    CalendarLib.getSingleAllDayEvent(allDayEvent2title);
                    CalendarLib.getSingleAllDayEvent(allDayEvent1title);
                    complete();
                });
            })
            .done(function () {
                Tx.log("Events verified");
                complete();
            });
        });
    }   
        
    /// Verify if the all day events in timeline are displayed correctly or not
    BVT.Test("WeekView_VerifyEvents", { "owner": "chwhit", "timeoutMs": 60000 }, function (tc) {
        tc.stop();
        var count = 4;
        CalendarLib.weekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return CalendarLib.createAllDayEventLoop(tc, count); })
        .then(function () { return verifyEvents(); })
        .done(function () {
            cleanupAllDayEvents(tc);
        }, //End-success handler
        function (failure) {
            tc.error(failure);
            cleanupAllDayEvents(tc);
        }); //End Failure
    }); // End WeekView_VerifyEvents

    /// OWNER: chwhit
    /// creates six events with some conflicting
    function createConflictingEvents(tc) {
        return new WinJS.Promise(function (complete) {
            var today = new Date();
            var theDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            var eventForViewChange;
                eventForViewChange = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView());
                //Create first event at 11AM for 1 hour
                CalendarLib.createEvent()
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        Tx.log("Creating first event");
                        EventDetailsLib.title(conflictingEvent1title);
                        EventDetailsLib.startDate(theDate);
                        EventDetailsLib.hour(11);
                        EventDetailsLib.minute(0);
                        EventDetailsLib.ampm("am");
                        EventDetailsLib.duration(2);
                        complete();
                    }); //Promise
                })
                .then(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); })

                //create Event 2 at the same time and day of the first event
                .then(function () { return CalendarLib.createEvent(); })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        Tx.log("Creating second event");
                        EventDetailsLib.title(conflictingEvent2title);
                        EventDetailsLib.startDate(theDate);
                        EventDetailsLib.hour(11);
                        EventDetailsLib.minute(0);
                        EventDetailsLib.ampm("am");
                        EventDetailsLib.duration(2);
                        complete();
                    }); //Promise
                })
                .then(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); })

                //Create event 3 at 12PM for an hour
                .then(function () { return CalendarLib.createEvent(); })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        Tx.log("Creating third event");
                        EventDetailsLib.title(conflictingEvent3title);
                        EventDetailsLib.startDate(theDate);
                        EventDetailsLib.hour(12);
                        EventDetailsLib.minute(0);
                        EventDetailsLib.ampm("pm");
                        EventDetailsLib.duration(2);
                        complete();
                    }); //Promise
                })
                .then(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); })

                //Create event 4 at 12PM for 90Minutes
                .then(function () { return CalendarLib.createEvent(); })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        Tx.log("Creating fourth event");
                        EventDetailsLib.title(conflictingEvent4title);
                        EventDetailsLib.startDate(theDate);
                        EventDetailsLib.hour(12);
                        EventDetailsLib.minute(0);
                        EventDetailsLib.ampm("pm");
                        EventDetailsLib.duration(3);
                        complete();
                    }); //Promise
                })
                .then(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); })

                //create event 5 at 1PM for 30 mins
                .then(function () { return CalendarLib.createEvent(); })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        Tx.log("Creating fifth event");
                        EventDetailsLib.title(conflictingEvent5title);
                        EventDetailsLib.startDate(theDate);
                        EventDetailsLib.hour(1);
                        EventDetailsLib.minute(0);
                        EventDetailsLib.ampm("pm");
                        EventDetailsLib.duration(1);
                        complete();
                    }); //Promise
                })
                .then(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); })

                //create event 6 at 2PM for 60 mins
                .then(function () { return CalendarLib.createEvent(); })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        Tx.log("Creating sixth event");
                        EventDetailsLib.title(conflictingEvent6title);
                        EventDetailsLib.startDate(theDate);
                        EventDetailsLib.hour(2);
                        EventDetailsLib.minute(0);
                        EventDetailsLib.ampm("pm");
                        EventDetailsLib.duration(2);
                        complete();
                    }); //Promise
                })
                .then(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); })
                .then(function () { complete(); });
        }); // WinJS Promise
    } // End createConflictingEvents

    /// OWNER: chwhit
    /// verifies the conflicting events created above
    /// positions, width, and height of events verified
    function verifyConflictingEvents(tc) {
        return new WinJS.Promise(function (complete) {
            var eventsStyle = $(WeekViewLib.getContainer()[new Date().getDay()].children);
            var eventHeight = new Array(6);
            var eventLeftPos = new Array(6);
            var eventWidth = new Array(6);
            var eventTopPos = new Array(6);

            for (var j = 0; j < eventsStyle.length; j++){
                var subject = eventsStyle[j].innerText;
                if (subject.indexOf(conflictingEvent1title) !== -1) {
                    break;
                }
            }
            for (var i = 0; i < 6; i++) {
                eventHeight[i] = eventsStyle[i + j].style.pixelHeight;
                eventLeftPos[i] = eventsStyle[i + j].style.pixelLeft;
                eventWidth[i] = eventsStyle[i + j].style.posWidth - eventsStyle[i].style.posLeft;
                eventTopPos[i] = eventsStyle[i + j].style.pixelTop;
            }
           
            ///verify heights of events
            Tx.log("Verifying height of the events");
            ///Verify height of other events respect to event 1
            ///as the heights of event 1,2,3 are same thie would also make sure of height match for event 2,3
            tc.isTrue(eventHeight[0] === eventHeight[1], "Height of events 1 & 2 do not match");
            tc.isTrue(eventHeight[0] === eventHeight[3], "Height of events 1 & 3 do not match");
            tc.isTrue(eventHeight[0] < eventHeight[2], "Height of events 1 & 4 not correct, event 1 should have less height than event 4");
            tc.isTrue(eventHeight[0] > eventHeight[4], "Height of events 1 & 5 do not match, event 5 should have smaller height");
            tc.isTrue(eventHeight[0] === eventHeight[5], "Height of events 1 & 6 do not match");

            ///verify height of other events with respect to event 4
            tc.isTrue(eventHeight[2] > eventHeight[4], "Height of events 4 & 5 do not match, event 5 should have smaller height");
            tc.isTrue(eventHeight[2] > eventHeight[5], "Height of events 4 & 6 do not match, event 6 should have smaller height");

            ///verify height of other events with respect to event 5
            tc.isTrue(eventHeight[5] > eventHeight[4], "Height of events 5 & 6 do not match, event 5 should have smaller height");
            Tx.log("height of the events verified");

            ///Verify width of each event with respect to event 1
            Tx.log("Verifying width of the events");
            tc.isTrue(eventWidth[0] <= eventWidth[1], "Width of events 1 & 2 do not match");
            tc.isTrue(eventWidth[0] <= eventWidth[3], "Width of events 1 & 3 do not match");
            tc.isTrue(eventWidth[0] <= eventWidth[2], "Width of events 1 & 4 do not match");
            tc.isTrue(eventWidth[0] <= eventWidth[4], "Width of events 1 & 5 do not match");
            tc.isTrue(eventWidth[0] < eventWidth[5], "Width of events 1 & 6 do not match");
            Tx.log("width of the events verified");

            ///verify positions of events
            Tx.log("Verifying positioning of the events");
            //verify event 1 is on left of 2 and on top of 4
            tc.isTrue(eventTopPos[0] === eventTopPos[1] && eventLeftPos[0] < eventLeftPos[1], "Position of events 1 & 2 not correct");
            tc.isTrue(eventTopPos[0] < eventTopPos[3] && eventLeftPos[0] < eventLeftPos[3], "Position of events 1 & 3 not correct");

            //verify event 3 is below event 2 and on right of event 4
            tc.isTrue(eventTopPos[3] === eventTopPos[2] && eventLeftPos[3] > eventLeftPos[2], "Position of events 3 & 4 not correct");
            tc.isTrue(eventTopPos[3] > eventTopPos[1] && eventLeftPos[3] === eventLeftPos[1], "Position of events 2 & 3 not correct");

            //verify event 5 is on right of event 4 and below event 3
            tc.isTrue(eventTopPos[4] > eventTopPos[2] && eventLeftPos[4] > eventLeftPos[2], "Position of events 4 & 5 not correct");
            tc.isTrue(eventTopPos[3] < eventTopPos[4] && eventLeftPos[3] === eventLeftPos[1], "Position of events 3 & 5 not correct");

            //verify event 6 is below event 5 and is at same start position as event 1
            tc.isTrue(eventTopPos[5] > eventTopPos[4] && eventLeftPos[4] > eventLeftPos[5], "Position of events 5 & 6 not correct");
            tc.isTrue(eventTopPos[5] > eventTopPos[0] && eventLeftPos[0] === eventLeftPos[5], "Position of events 1 & 6 not correct");
            Tx.log("position of the events verified");
            complete();
        });
    }
     
    /// Create conflicting events and verify they are displayed correctly in timeline
    BVT.Test("WeekView_VerifyConflictingEvents", { "owner": "chwhit", "timeoutMs": 120000 }, function (tc) {
        tc.stop();
        CalendarLib.weekView()
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return createConflictingEvents(tc); })
        .then(function () { return verifyConflictingEvents(tc); })
        .done(function () {
            eventInjection(tc);
        }, //End-success handler
        function (failure) {
            tc.error(failure);
            eventInjection(tc);
        }); //End Failure
    }); // End WeekView_VerifyConflictingEvents
    
    /// OWNER: chwhit
    /// WinBlue:390831
    /// verifies the hour and date values in events details page
    function verifyEventDetails(tc, theDate) {
        return new WinJS.Promise(function (complete) {
            Tx.log("Verifying event for day: " + theDate);
            var dateOnly = new Date(theDate.getFullYear(), theDate.getMonth(), theDate.getDate());
            var hour24 = theDate.getHours();
            var hour = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);  // Handle 12am case
            tc.strictEqual(EventDetailsLib.startDate().toUTCString(), dateOnly.toUTCString(), "Date not set correctly");
            tc.strictEqual(EventDetailsLib.hour(), hour, "Hour not set correctly");
            Tx.log("Event verified");
            complete();
        });
    }//VerifyEventDetails
        
    /// Verify clicking a position on timeline shows correct time and date.
    BVT.Test("WeekView_VerifyEventDateTime", { "owner": "chwhit" }, function (tc) {
        tc.stop();
        var today = new Date();
        var theDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours());
        var eventForViewChange;
        CalendarLib.weekView()
        .then(function () { 
            return new WinJS.Promise.wrap(
                eventForViewChange = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView())
            );
        })
        .then(function () { return CalendarLib.goToToday(); })
        .then(function () { return WeekViewLib.clickOnDay(today.getDay()); })
        .then(function () { return verifyEventDetails(tc, theDate); })
        .then(function () { return EventDetailsLib.closeEvent(eventForViewChange); })
        .then(function () { return CalendarLib.monthView(); })
        .then(function () { return DatePickerLib.openFlyout(); })
        .then(function () { return DatePickerLib.selectMonth((today.getMonth() + 1),true); })
        .then(function () { return CalendarLib.weekView(); })
        .then(function () {
            return new WinJS.Promise(function (complete) {
                theDate = new Date(today.getFullYear(), (today.getMonth() + 1), 1, today.getHours());
                complete();
            });
        })
        .then(function () { return WeekViewLib.clickOnDay(theDate.getDay()); })
        .then(function () { return verifyEventDetails(tc, theDate); })
        .then(function () { return EventDetailsLib.closeEvent(eventForViewChange); })
        .done(function () {
            cleanup(tc);
        }, //End-success handler
        function (failure) {
            tc.error(failure);
            cleanup(tc);
        }); //End Failure
    }); // End WeekView_VerifyEventDateTime

    
})();
