
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $,WinJS,Tx,Jx,Debug,TestApplication,EventDetailsLib,BVT,UtilitiesLib,document,setTimeout,window*/

var CalendarLib = function () {

    /// OWNER: DaLowe
    /// 
    /// This is an internal function that ultimately changes your view based
    /// on where you currently are in the app.  It also takes in a parameter
    /// that allows you to choose how you would like to enter that view.  By
    /// default, we will attempt to randomly select a hotkey that leads you
    /// to your view if you do not fill in this parameter.
    var changeView = function (view, how) {
        return new WinJS.Promise(function (complete) {
            var currentView = CalendarLib.getCurrentView();
            var x = new Date().getTime() % 2;
            var fnShortcutKey;
            var shortcutKeyLog;
            var selector;
            if (currentView === view) {
                Tx.log("Already in " + view);
                complete();
                return;
            } else {
                if (currentView === CalendarLib.agendaViewText ) {
                    selector = window;
                } else {
                    selector = ".timelineScroller";
                }
            }
            
            switch (view) {
                case CalendarLib.monthViewText:
                    if (x === 0) {
                        shortcutKeyLog = "Ctrl+M";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode.m, ctrlKey: true }); };
                    } else {
                        shortcutKeyLog = "Ctrl+5 [MonthView]";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode["5"], ctrlKey: true }); };
                    }
                    break;
                case CalendarLib.weekViewText:
                    if (x === 0) {
                        shortcutKeyLog = "Ctrl+W";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode.w, ctrlKey: true }); };
                    } else {
                        shortcutKeyLog = "Ctrl+4 [WeekView]";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode["4"], ctrlKey: true }); };
                    }
                    break;
                case CalendarLib.workWeekViewText:
                    if (x === 0) {
                        shortcutKeyLog = "Ctrl+O";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode.o, ctrlKey: true }); };
                    } else {
                        shortcutKeyLog = "Ctrl+3 [WorkWeekView]";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode["3"], ctrlKey: true }); };
                    }
                    break;
                case CalendarLib.dayViewText:
                    if (x === 0) {
                        shortcutKeyLog = "Ctrl+D";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode.d, ctrlKey: true }); };
                    } else {
                        shortcutKeyLog = "Ctrl+2 [DayView]";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode["2"], ctrlKey: true }); };
                    }
                    break;
                case CalendarLib.agendaViewText:
                    if (x === 0) {
                        shortcutKeyLog = "Ctrl+A";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode.a, ctrlKey: true }); };
                    } else {
                        shortcutKeyLog = "Ctrl+1 [AgendaView]";
                        fnShortcutKey = function () { $(selector).trigger("keydown", { keyCode: Jx.KeyCode["1"], ctrlKey: true }); };
                    }
                    break;
                default:
                    Tx.assert(false, "Unsupported view" + view);
                    break;
            }

            
            BVT.marks.once(CalendarLib.getEventForViewChanged(view), function (s) {
                Tx.log("Found calendar view change event " + s);

                // Additionally, wait for the queue to empty so we know the view is ready
                // i.e. has painted
                BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function (s) {
                    Tx.log("Found WinJS scheduler yield event " + s);
                    Tx.log("Finished view change, now in " + CalendarLib.getCurrentView());
                    complete(s);
                });
            });

            if (!how) {
                Tx.log("Triggering " + shortcutKeyLog);
                fnShortcutKey.call();
            } else if ("navbar" === how) {
                Tx.log("Triggering Nav Bar");
                TestApplication.ToggleAppBar();
                var className;
                switch (view) {
                    case CalendarLib.monthViewText:
                        className = ".cal-navbar-month .win-navbarcommand-button";
                        break;
                    case CalendarLib.weekViewText:
                        className = ".cal-navbar-week .win-navbarcommand-button";
                        break;
                    case CalendarLib.workWeekViewText:
                        className = ".cal-navbar-workweek .win-navbarcommand-button";
                        break;
                    case CalendarLib.dayViewText:
                        className = ".cal-navbar-day .win-navbarcommand-button";
                        break;
                    case CalendarLib.agendaViewText:
                        className = "#agendaCommand";
                        break;
                    default:
                        Tx.assert(false, "Unsupported view" + view);
                        break;
                }
                Tx.assert(className !== null, "Invalid option for changeView: " + how);                
                $(className)[0].click();
            }
        });
    }; //changeView

    return {

        ///OWNER - AlGore
        ///
        /// This function finds the first instance of an event in your current view with the given name and returns it
        ///
        /// TODO - Support AgendaView
        getSingleEvent: function (title) {
            return CalendarLib.getMultipleEvents(title)[0];
        }, //getSingleEvent

        ///OWNER - AlGore
        ///
        /// This function finds all events with the given name in your current view and returns an array of event objects
        ///
        /// REMARKS - This function doesnt disambiguate multiple distinct events with the same name
        ///
        /// TODO - Support AgendaView
        getMultipleEvents: function (title, expectEvent) {
            if (expectEvent === undefined) {
                expectEvent = true;
            }

            var events;
            var eventSubject;
            var view = CalendarLib.getCurrentView();
            switch (view) {
                case CalendarLib.monthViewText:
                    events = $(".monthview .month:not([aria-hidden='true']) .event[role='button']");
                    eventSubject = $(".monthview .month:not([aria-hidden='true']) .event[role='button'] .subject");
                    break;
                case CalendarLib.weekViewText:
                    events = $(".weekview .week:not([aria-hidden='true']) .event[role='button']");
                    eventSubject = $(".weekview .week:not([aria-hidden='true']) .event[role='button'] .subject");
                    break;
                case CalendarLib.workWeekViewText:
                    events = $(".weekview .week:not([aria-hidden='true']) .event[role='button']");
                    eventSubject = $(".weekview .week:not([aria-hidden='true']) .event[role='button'] .subject");
                    break;
                case CalendarLib.dayViewText:
                    events = $(".dayview .day:not([aria-hidden='true']) .event[role='button']");
                    eventSubject = $(".dayview .day:not([aria-hidden='true']) .event[role='button'] .subject");
                    break;
                default:
                    Tx.assert(false, "Unsupported view" + view);
                    break;
            }
            Tx.assert(undefined !== events, "events is undefined!");
            Tx.assert(undefined !== eventSubject, "eventSubject is undefined!");

            Tx.log("getEvent: Found [" + events.length + "] events!");
            Tx.log("Searching for all events with title [" + title + "]");

            var multipleEventArray = [];
            var count = 0;
            for (var i = 0; i < eventSubject.length; i++) {
                if (eventSubject[i].innerText === title) {
                    multipleEventArray[count] = events[i];
                    count++;
                }
            }

            if (expectEvent) {
                Tx.assert(multipleEventArray.length > 0, "Did not find any events by that name!");
            }
            else {
                Tx.assert(multipleEventArray.length === 0, "Event still exists!");
            }
            return multipleEventArray;
        }, //getMultipleEvents

        ///OWNER - AlGore
        ///
        /// This is an internal function that determines the event you want to wait
        /// for when listening for view-changes, based on the view you pass in.
        getEventForViewChanged: function (view) {
            var eventForCurrentView;
            switch (view) {
                case CalendarLib.monthViewText:
                    eventForCurrentView = CalendarLib.monthViewChangeEventText;
                    break;
                case CalendarLib.weekViewText:
                    eventForCurrentView = CalendarLib.weekViewChangeEventText;
                    break;
                case CalendarLib.workWeekViewText:
                    eventForCurrentView = CalendarLib.workWeekViewChangeEventText;
                    break;
                case CalendarLib.dayViewText:
                    eventForCurrentView = CalendarLib.dayViewChangeEventText;
                    break;
                case CalendarLib.agendaViewText:
                    eventForCurrentView = CalendarLib.agendaViewChangeEventText;
                    break;
                default:
                    Tx.assert(false, "Unsupported view " + view);
                    break;
            }
            Tx.assert(undefined !== eventForCurrentView, "Invalid view specified.");
            return eventForCurrentView;
        }, //getEventForViewChanged

        /// OWNER - StevenRy
        ///
        /// This function returns the CalendarLib.[view text] property for 
        /// whichever view change event is passed in.
        getViewForChangeEvent: function(event) {
            var viewText;
            switch (event) {
                case CalendarLib.monthViewChangeEventText:
                    viewText = CalendarLib.monthViewText;
                    break;
                case CalendarLib.weekViewChangeEventText:
                    viewText = CalendarLib.weekViewText;
                    break;
                case CalendarLib.workWeekViewChangeEventText:
                    viewText = CalendarLib.workWeekViewText;
                    break;
                case CalendarLib.dayViewChangeEventText:
                    viewText = CalendarLib.dayViewText;
                    break;
                case CalendarLib.agendaViewChangeEventText:
                    viewText = CalendarLib.agendaViewText;
                    break;
                default:
                    Tx.assert(false, "Unsupported view change event " + event);
                    break;
            }
            Tx.assert(undefined !== viewText, "Invalid view change event specified.");
            return viewText;
        }, //getViewForChangeEvent

        ///OWNER - AlGore
        ///
        /// This is an internal function that determines what view you're currently in.
        /// It currently outputs "monthview", "weekview" "weekview workweek" and "dayview"
        ///
        /// TODO - Improve this function to eventually return other views as well, and return
        ///        them as an ENUM instead, for consistency throughout the system everywhere
        ///        this function is used
        getCurrentView: function () {
            return $("#viewManager")[0].children[0].className;
        }, //getCurrentView
        
        /// OWNER: DaLowe
        ///
        /// This function switches you to the Month View
        monthView: function (how) {
            return changeView(CalendarLib.monthViewText , how);
        }, //monthView

        /// OWNER: DaLowe
        ///
        /// This function switches you to the Week View
        weekView: function (how) {
            return changeView(CalendarLib.weekViewText, how);
        }, //weekView

        /// OWNER: DaLowe
        ///
        /// This function switches you to the Work Week View
        workWeekView: function (how) {
            return changeView(CalendarLib.workWeekViewText , how);
        }, //workWeekView

        /// OWNER: DaLowe
        ///
        /// This function switches you to the Work Day View
        dayView: function (how) {
            return changeView(CalendarLib.dayViewText, how);
        }, //dayView

        /// OWNER: AdKell
        ///
        /// This function switches you to the Agenda View
        agendaView: function (how) {
            return changeView(CalendarLib.agendaViewText , how);
        }, //agendaView

        /// OWNER: AlGore
        ///
        /// This function switches to today no matter what view you're currently in
        ///
        /// TODO - The functionality should be extended to attempt to use the app-bar
        ///        (ie. pass in 'how' parameter)
        goToToday: function () {
            return new WinJS.Promise(function (complete) {
                Tx.log("Navigating to today");
                var isTodayVisible;
                var view = CalendarLib.getCurrentView();
                switch (view) {
                    case CalendarLib.monthViewText:
                        isTodayVisible = $(".monthview .month:not([aria-hidden='true']) .today").length !== 0;
                        break;
                    case CalendarLib.weekViewText:
                        isTodayVisible = $(".week:not([aria-hidden='true']) .today").length !== 0;
                        break;
                    case CalendarLib.workWeekViewText:
                        isTodayVisible = $(".week:not([aria-hidden='true']) .today").length !== 0;
                        break;
                    case CalendarLib.dayViewText:
                        isTodayVisible = $(".dayview .day:not([aria-hidden='true']).today").length !== 0;
                        break;
                    default:
                        Tx.assert(false, "Unsupported view" + view);
                        break;
                }

                if (!isTodayVisible) {
                    BVT.marks.once(CalendarLib.getEventForViewChanged(view), function () {
                        BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                            complete();
                        });
                    });

                    // Generate a random number between 0 and 1 to determine
                    // which hotkey to trigger
                    var x = new Date().getTime() % 2;
                    if (x === 0) {
                        Tx.log("Triggering Ctrl+T");
                        $(".timelineScroller", Debug.view._host).trigger("keydown", { keyCode: Jx.KeyCode.t, ctrlKey: true });
                    } else {
                        Tx.log("Triggering Home [TodayView]");
                        $(".timelineScroller", Debug.view._host).trigger("keydown", { keyCode: Jx.KeyCode.home });
                    }
                } else {
                    Tx.log("Today is already visible");
                    complete();
                }
            }); //WinJS.Promise
        }, //goToToday

        /// OWNER: AlGore
        ///
        /// This function finds the view you're in and goes one unit of movement towards
        /// the past using a randomly selected shortcut key
        ///
        /// TODO - The functionality should be extended to find the button in the UI and click() it
        nextViewPast: function () {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once(CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView()), function () {
                    BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                        complete();
                    });
                });

                // Generate a random number between 0 and 1 to determine
                // which hotkey to trigger
                var x = new Date().getTime() % 2;
                if (x === 0) {
                    Tx.log("Triggering PageUp");
                    $(".timelineScroller", Debug.view._host).trigger("keydown", { keyCode: 33 /* pageUp */ });
                } else {
                    Tx.log("Triggering Ctrl+H [PageUp]");
                    $(".timelineScroller", Debug.view._host).trigger("keydown", { keyCode: 72 /* h */, ctrlKey: true });
                } 
            }); //WinJS.Promise
        }, //nextViewPast~

        /// OWNER: AlGore
        ///
        /// This function finds the view you're in and goes one unit of movement towards
        /// the future using a randomly selected shortcut key
        ///
        /// TODO - The functionality should be extended to find the button in the UI and click() it
        nextViewFuture: function () {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once(CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView()), function () {
                    BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                        complete();
                    });
                });

                var x = new Date().getTime() % 2;
                if (x === 0) {
                    Tx.log("Triggering PageDown");
                    $(".timelineScroller", Debug.view._host).trigger("keydown", { keyCode: 34 /* pageDown */ });

                } else {
                    Tx.log("Triggering Ctrl+J [PageDown]");
                    $(".timelineScroller", Debug.view._host).trigger("keydown", { keyCode: 74 /* j */, ctrlKey: true });
                }
            }); //WinJS.Promise
        }, //nextViewFuture

        /// OWNER: AlGore
        ///
        /// This function finds the view you're in and creates an array of Date() objects that are visible to the 
        /// user in the current view
        getVisibleDates: function () {
            Tx.log("Getting all visible dates in view");
            var elementsOnScreen;

            var view = CalendarLib.getCurrentView();
            switch (view) {	
                case CalendarLib.monthViewText:
                    elementsOnScreen = $(".monthview .month:not([aria-hidden='true']) .day:not(.hidden)");
                    break;
                case CalendarLib.weekViewText:
                    elementsOnScreen = $(".week:not([aria-hidden='true']) .date");
                    break;
                case CalendarLib.workWeekViewText:
                    elementsOnScreen = $(".week:not([aria-hidden='true']) .date:not(.weekend)");
                    break;
                case CalendarLib.dayViewText:
                    elementsOnScreen = $(".dayview .day:not([aria-hidden='true']) .fullDate-text");
                    break;
                default:
                    Tx.assert(false, "Unsupported view" + view);
                    break;
            }

            var returnDates = Array.prototype.map.call(elementsOnScreen, function(element) {
                return new Date(UtilitiesLib.removeTextMarkers(element.getAttribute("aria-label")));
            });

            Tx.assert(returnDates.length === elementsOnScreen.length, "Not every element found on screen had an aria-label on it");

            Tx.log(returnDates.length + " visible days");
            for (var i = 0; i < returnDates.length; i++) {
                Tx.log("Month:" + returnDates[i].getMonth().toString() + " Day:" + returnDates[i].getDate().toString());
            }
            return returnDates;
        }, //getVisibleDates

        /// OWNER: AlGore
        ///
        /// getVisibleDates() returns an array of all dates visible in the current view.  This function will return the 
        /// 'current' month in MonthView (despite also showing days in the previous and next months)
        getCurrentMonth: function () {
            if (CalendarLib.getCurrentView() !== CalendarLib.monthViewText ) {
                Tx.assert(false, "This function is only valid for MonthView");
            }
            return CalendarLib.getVisibleDates()[8].getMonth();
        }, //getCurrentMonth

        /// OWNER: DaLowe
        ///
        /// This function brings you into the Event Details page by trying to create an
        /// event by simply calling the shortcut key Ctrl+N
        ///
        /// TODO - The functionality should be extended to attempt to use the app-bar
        ///        (ie. pass in 'how' parameter)
        createEvent: function () {
            return new WinJS.Promise(function (complete) {
                Tx.log("Creating event");
                BVT.marks.once(EventDetailsLib.evtDetailsReady, function () {
                    complete();
                });

                var selector;
                if (CalendarLib.getCurrentView() === CalendarLib.agendaViewText) {
                    selector = window;
                } else {
                    selector = ".timelineScroller";
                }

                Tx.log("Triggering Ctrl+N");
                $(selector, Debug.view._host).trigger("keydown", { keyCode: Jx.KeyCode.n, ctrlKey: true });
            });
        }, //createEvent

        /// OWNER: DaLowe
        ///
        /// Given a subject of a specific event, this function will attempt to find it and open it
        /// (ie. it will bring you to the Event Details page and click the 'Show More' button)
        ///
        /// TODO - Make this function support all views
        openEvent: function (title) {
            Tx.log("Opening event titled: '" + title + "'");
            var evt = CalendarLib.getSingleEvent(title);
            return new WinJS.Promise(function (complete) {
                BVT.marks.once(EventDetailsLib.evtDetailsReady, function () {
                    complete();
                });
                
                $(evt).click();
            })
            .then(function () {
                // Click 'Show more' and wait for it to expand.
                return new WinJS.Promise(function (complete) {
                    $("#RecurrenceCombo").on("focus", function callback() {
                        $("#RecurrenceCombo").off("focus", callback);
                        complete();
                    });
                    EventDetailsLib.showMore();
                });
            });
        }, //openEvent

        ///OWNER: t-niravn
        ///Creates All day event
        createSingleAllDayEvent: function(tc){
            return CalendarLib.createEventLoop(tc,1);
        },
        
        ///OWNER: t-niravn
        ///Creates All day events, based on number assigned to count
        //Values for events created are set: 
        //Date: current date
        //title: Event <index>
        //duration: All day
        //other values are default
        createAllDayEventLoop: function (tc,count) {
            return new WinJS.Promise(function (complete) {
                var today = new Date();
                var theDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                var eventForViewChange;
                count--;
                BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function fn() {
                    if (count === 0) {
                        complete();
                    } else {
                        CalendarLib.createEvent()
                        .then(function () {
                            return new WinJS.Promise(function (complete) {
                                EventDetailsLib.title("Event " + (count));
                                EventDetailsLib.startDate(theDate);
                                EventDetailsLib.duration(5);
                                complete();
                            }); //Promise
                        })
                        .then(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); })
                        .then(function () { fn(--count); });
                    }//else loop
                });
                CalendarLib.weekView()
                .then(function () {
                    var currentView = CalendarLib.getCurrentView();
                    eventForViewChange = CalendarLib.getEventForViewChanged(currentView);
                    return CalendarLib.createEvent();
                })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        EventDetailsLib.title("Event " + (count + 1));
                        EventDetailsLib.startDate(theDate);
                        EventDetailsLib.duration(5);
                        complete();
                    }); //Promise
                })
                .done(function () { return EventDetailsLib.saveEvent(eventForViewChange, tc); });
            }); // WinJS Promise
        },

        /// OWNER: t-niravn
        /// This function finds the first instance of an all day event in your week view with the given name and returns it
        getSingleAllDayEvent: function (title) {
            return CalendarLib.getMultipleAllDayEvents(title)[0];
        }, //getSingleAllDayEvent

        /// OWNER: t-niravn
        /// This function finds all day events with the given name in week view and returns an array of event objects
        /// REMARKS - This function doesnt disambiguate multiple distinct events with the same name
        getMultipleAllDayEvents: function (title) {

            var events;
            var eventSubject;
            switch (CalendarLib.getCurrentView()) {
                case CalendarLib.weekViewText:
                    events = $(".weekview .week:not([aria-hidden='true']) .allDay .events");
                    eventSubject = $(".weekview .week:not([aria-hidden='true']) .allDay .events .subject");
                    break;

                case CalendarLib.dayViewText:
                    events = $(".dayview .day:not([aria-hidden='true']) .allDay .events");
                    eventSubject = $(".dayview .day:not([aria-hidden='true']) .allDay .events .subject");
                    break;

                case CalendarLib.workWeekViewText:
                    events = $(".weekview .week:not([aria-hidden='true']) .allDay .events:not(.weekend)");
                    eventSubject = $(".weekview .week:not([aria-hidden='true']) .allDay .events:not(.weekend) .subject");
            }

            if (CalendarLib.getCurrentView() !== CalendarLib.weekViewText) {
                Tx.assert(false, "Wrong view");
            }
            Tx.assert(undefined !== events, "events is undefined!");
            Tx.assert(undefined !== eventSubject, "eventSubject is undefined!");

            Tx.log("getEvent: Found [" + events.length + "] events!");
            Tx.log("Searching for all events with title [" + title + "]");

            var multipleEventArray = [];
            var count = 0;
            for (var i = 0; i < eventSubject.length; i++) {
                if (eventSubject[i].innerText === title) {
                    multipleEventArray[count] = events[i];
                    count++;
                }
            }
            Tx.assert(multipleEventArray.length > 0, "Did not find any events by that name!");
            return multipleEventArray;
        }, //getMultipleAllDayEvents

        /// OWNER: StevenRy
        ///
        /// Clicks on the center of the specified HTML object at the 'document' level.
        /// This allows Mita-style clicks on objects who's event listeners are fairly complicated
        ///
        /// TODO - Ensure the control is visible before click
        clickOnElement: function (element, eventToWaitFor) {
            var rect = element.getBoundingClientRect();
            var midX = (rect.left + rect.right) / 2;
            var midY = (rect.top + rect.bottom) / 2;            

            return new WinJS.Promise(function (complete) {
                if (eventToWaitFor) {
                    BVT.marks.once(eventToWaitFor, function () {
                        complete();
                    });
                }

                var point = document.elementFromPoint(midX, midY);
                $(point).click();
            });
        }, // clickOnElement

        ///OWNER: t-niravn
        ///function that returns the name of month from its index value
        ///takes month index as a parameter
        ///Works for any view
        getMonthText: function (month) {
            var monthText;
            Tx.log("Getting text for month: " + month);
            switch (month) {
                case 0:
                    monthText = "January";
                    break;
                case 1:
                    monthText = "February";
                    break;
                case 2:
                    monthText = "March";
                    break;
                case 3:
                    monthText =  "April";
                    break;
                case 4:
                    monthText =  "May";
                    break;
                case 5:
                    monthText = "June";
                    break;
                case 6:
                    monthText = "July";
                    break;
                case 7:
                    monthText = "August";
                    break;
                case 8:
                    monthText = "September";
                    break;
                case 9:
                    monthText = "October";
                    break;
                case 10:
                    monthText = "November";
                    break;
                case 11:
                    monthText = "December";
                    break;
                default:
                    Tx.assert(false, "Invalid Month");
                    break;
            } // switch
            return monthText;
        }, //getMonthText

        //OWNER:t-niravn
        //gets the shorthand version of string from index 0 to 3
        //Works only for en-us
        getShortHand: function (str) {
            return UtilitiesLib.removeTextMarkers(str).substring(0, 3);
        },

        /// OWNER: t-niravn
        /// delays the execution of a function for specified amount of time
        /// functions expecting a return value cannot be passed to this function
        startAfterDelay: function (fn, timeout) {
            return new WinJS.Promise(function (complete) {
                timeout = Tx.config.isLab ? timeout * 10 : timeout;
                Tx.log("waiting for specified delay");
                setTimeout(function () { fn(); complete();}, timeout);
            });
        },

        /// OWNER: t-niravn
        /// changes the view based on specified in parameter
        goToView: function (view) {
            return new WinJS.Promise(function (complete) {
                switch (view) {
                    case CalendarLib.dayViewText:
                        CalendarLib.dayView().done(function () { complete(); })
                        break;
                    case CalendarLib.weekViewText:
                        CalendarLib.weekView().done(function () { complete(); })
                        break;
                    case CalendarLib.agendaViewText:
                        CalendarLib.agendaView().done(function () { complete(); })
                        break;
                    case CalendarLib.monthViewText:
                        CalendarLib.monthView().done(function () { complete(); })
                        break;
                    case CalendarLib.workWeekViewText:
                        CalendarLib.workWeekView().done(function () { complete(); })
                        break;
                    default:
                        Tx.assert(false, "Unsupported view" + view);
                        break;
                } // End switch
            }); // End promise
        }, // End goToView

        /// OWNER: chwhit
        /// Removes any months with exactly matching subject from this month, next and previous months
        removeEventBySubject: function (subject) {
            var calman = Jx.root._platform.calendarManager;
            var today = new Date();
            var start = new Date(today.getFullYear(), today.getMonth() - 1, 0, 0, 0, 0, 0);
            var end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 0, 0, 0, 0);
            Tx.log("Deleting events with subject '" + subject + "' between " + start.toDateString() + " and " + end.toDateString());

            // iterate events and look for matching subject
            var events = calman.getEvents(start, end);
            var count = 0;
            for (var i = 0; i < events.count; i++) {
                var event = events.item(i);
                if (event.subject === subject) {
                    event.deleteObject();
                    count++;
                }
            }

            events.dispose();
            Tx.assert(count !== 0, "Failed to delete any events with subject '" + subject + "'");
            Tx.log("Deleted " + count + " events");
        } // End removeEventBySubject
    };
}();

// Constants
CalendarLib.DAY_IN_MILLISECONDS = 86400000;
CalendarLib.DAY_IN_MINUTES = 1440;

CalendarLib.dayViewText = "dayview";
CalendarLib.weekViewText = "weekview";
CalendarLib.monthViewText = "monthview";
CalendarLib.agendaViewText = "agendaview";
CalendarLib.workWeekViewText = "weekview workweek";

CalendarLib.dayViewChangeEventText = "Calendar:Day._onGetEvents:inner,StopTA,Calendar";
CalendarLib.weekViewChangeEventText = "Calendar:Week._onGetEvents:inner,StopTA,Calendar";
CalendarLib.monthViewChangeEventText = "Calendar:Month._onGetEvents:inner,StopTA,Calendar";
CalendarLib.agendaViewChangeEventText = "WinJS.UI.ListView::aria work,StopTM";
CalendarLib.workWeekViewChangeEventText = "Calendar:Week._onGetEvents:inner,StopTA,Calendar";
