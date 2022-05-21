
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global WinJS,Jx,Tx,$,Microsoft,Calendar,MockJobset,MockPlatformWorker,runSync*/

(function () {

    var Helpers = Calendar.Helpers;
    var Agenda = Calendar.Views.Agenda;
    var AgendaHelpers = Calendar.Views.AgendaHelpers;

    Tx.noop(Calendar.App); // for delayDefine

    var agenda = null;
    var jobset = null;
    var platform = null;
    var manager = null;
    var calendar = null;
    var host = null;
    var root = null;
    var worker = null;
    var workerex = null;
    var marks = null;

    var now;
    var today;
    var earlyTomorrow;
    var lateYesterday;
    var endRange;
    var endRangeMinusOne;
    var yesterday;
    var tomorrow;
    var lastDay;

    var ev1;
    var ev2;
    var ev3;
    var ev4;
    var ev5;
    var ev6;
    var ev7;
    var ev8;
    var ev9;

    var listEventsSelector;

    var noEventsText;
    var seeMoreEventsText;

    // Marks is a class for listening and handling ETW events that get fired via msWriteProfilerMark.
    // TODO: Copied from uibvts - move it to Tx
    var Marks = function () {
        this._callbacks = {};
        this._oldWPM = window.msWriteProfilerMark;

        var that = this;

        window.msWriteProfilerMark = function (msg) {
            if (msg in that._callbacks) {
                var fns = that._callbacks[msg];
                for (var i = fns.length - 1; i >= 0; i--) {
                    if (Tx.isUndefined(fns[i].many)) {
                        // No many set, so just fire the callback.
                        fns[i].fn(msg);
                    }
                    else {
                        if (fns[i].many === 1) {
                            // If many === 1, this means that we have observed the required number
                            // of events, so fire the callback.
                            fns[i].fn(msg);
                        }
                        fns[i].many--;
                        if (fns[i].many === 0) {
                            fns.splice(i, 1);
                        }
                    }
                }
            }

            that._oldWPM.call(window, msg);
        };
    };

    Marks.prototype = {
        dispose: function () {
            if (this._oldWPM ) {
                window.msWriteProfilerMark = this._oldWPM;
            }
         },

        _on: function (type, fn, count) {
            Tx.chkStrNE(type);
            Tx.chkFn(fn);

            var events = this._callbacks;

            // get or create the callbacks array
            var callbacks = (events[type] = events[type] || []);

            // add the callback
            callbacks.push({ fn: fn, many: count });
        },

        on: function (type, fn) {
            this._on(type, fn);
        },

        once: function (type, fn) {
            this._on(type, fn, 1);
        },

        off: function (type, fn) {
            Tx.chkStrNE(type);
            Tx.chkFn(fn);

            // TODO: assert if it's called from dispachEvent 

            // get the callbacks array
            var callbacks = this._txev[type];
            if (callbacks) {
                // find the callback
                var i = callbacks.indexOf(fn);
                if (i >= 0) {
                    // remove the callback
                    callbacks.splice(i, 1);
                }
            }
        },

        many: function (type, fn, count) {
            this._on(type, fn, count);
        },
    };

    // TestRoot component

    function TestRoot() {
        this._deferredWork = new Calendar.WorkQueue();
        this.on("viewReady", this._onViewReady, this);
    }

    Jx.augment(TestRoot, Jx.Component);

    TestRoot.prototype.isCompanion = function () {
        return false;
    };

    TestRoot.prototype.dispose = function () {
        if (this._deferredWork) {
            this._deferredWork.dispose();
            this._deferredWork = null;
        }
        this.detach("viewReady", this._onViewReady);
    };

    TestRoot.prototype.onQueryService = function (serviceName) {
        return (serviceName === "deferredWork") ? this._deferredWork : null;
    };

    TestRoot.prototype._onViewReady = function (ev) {
        if (ev.stage === Jx.EventManager.Stages.bubbling) {
            this._deferredWork.unlock();
        }
    };


    //
    // Setup
    //

    function setup(eventCreator) {
        // initialize dates
        now = new Date();
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        earlyTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        lateYesterday = new Date(today.getTime() - 1);
        endRange = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 61);
        endRangeMinusOne = new Date(endRange.getTime() - 1);

        yesterday = new Date(now.getTime());
        yesterday.setDate(now.getDate() - 1);

        tomorrow = new Date(now.getTime());
        tomorrow.setDate(now.getDate() + 1);

        lastDay = new Date(now.getTime());
        lastDay.setDate(now.getDate() + 60);

        listEventsSelector = '.timeline .event';

        noEventsText = Jx.res.getString('AgendaNoEvents');
        seeMoreEventsText = Jx.res.getString('AgendaSeeMoreEvents');

        // Initialize the calendar platform
        marks = new Marks();

        // set up platform
        platform = new Calendar.Mock.Platform();

        // dump the store to remove all events
        manager = platform.calendarManager;
        manager.dumpStore();

        // prepare our test calendar
        calendar = manager.addCalendar(platform.accountManager.defaultAccount, 'testCalendar');
        calendar.name = 'Agenda UTs';

        // create the worker
        worker   = new MockPlatformWorker(platform);
        workerex = new Calendar.WorkerEx(worker);

        // Execute the creation delegate, if provided.
        if (eventCreator) {
            runSync(eventCreator);
        }

        // Create the view
        var body = document.body;

        // add our host
        host = document.createElement('div');
        host.id = 'host';
        body.insertBefore(host, body.firstChild);

        // create the jobset
        jobset = new MockJobset();

        agenda = new Agenda(jobset);

        // respond to view events
        agenda.on('getPlatform', function (ev) {
            ev.data.platform = platform;
        });

        agenda.on("getPlatformWorker", function (ev) {
            ev.data.platformWorker = workerex;
        });

        agenda.on("getSettings", function (ev) {
            ev.data.settings = {
                get: function () { return null; },
                set: function () { },
                remove: function () { }
            };
        });

        agenda.on("getAppBar", function (ev) {
            ev.data.appBar = {
                showCommands: function () { },
                hideCommands: function () { },
                getCommandById: function () { return {}; },
                addEventListener: function () { },
                removeEventListener: function () { },
            };
        });

        agenda.on("getPeekBar", function (ev) {
            ev.data.peekBar = {
                allowTabVersion: function () { },
                isTabMode: function () { return true; },
            };
        });

        root = new TestRoot();
        root.append(agenda);

        // initialize the view
        runSync(function () {
            host.innerHTML = Jx.getUI(agenda).html;
            agenda.activateUI(jobset);
        });
    }

    //
    // Teardown
    //

    function cleanup() {
        // shut down the agenda
        runSync(function () {
            agenda.shutdownUI();
        }, this, [], true);

        // clean up the jobset
        jobset.dispose();
        jobset = null;

        // get rid of any test events we created
        manager.dumpStore();

        // remove our elements
        document.body.removeChild(host);

        // release references
        agenda = null;
        host = null;

        if (root) {
            root.dispose();
            root = null;
        }

        calendar = null;
        manager = null;
        platform = null;

        now = null;
        today = null;
        lateYesterday = null;
        endRange = null;
        endRangeMinusOne = null;
        yesterday = null;
        tomorrow = null;
        lastDay = null;

        if (marks) {
            marks.dispose();
            marks = null;
        }
    }

    ///
    /// Helpers
    ///

    function getDayFromDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function getDate(base, dayOffset, hourOffset, minuteOffset) {
        dayOffset = dayOffset || 0;
        hourOffset = hourOffset || 0;
        minuteOffset = minuteOffset || 0;

        var newTime = base.getTime();
        newTime += Helpers.dayInMilliseconds * dayOffset;
        newTime += Helpers.hourInMilliseconds * hourOffset;
        newTime += Helpers.minuteInMilliseconds * minuteOffset;

        return new Date(newTime);
    }

    function verifyNoEventsItem(tc, item) {
        tc.areEqual(true, item.hasClass('textcontainer'), 'Has textcontainer class');
        tc.areEqual(noEventsText, item.text(), 'Correct text');
    }

    function verifySeeMoreEventsItem(tc, item) {
        tc.areEqual(true, item.hasClass('textcontainer'), 'Has textcontainer class');
        tc.areEqual(seeMoreEventsText, item.text(), 'Correct text');
    }

    function waitForListViewLoadComplete() {
        return new WinJS.Promise(function (onComplete) {
            marks.once("Calendar:Agenda._listViewLoadingItems,StopTM,Calendar", function () {
                setTimeout(function () { onComplete(); }, 100);
            });
        });
    }

    function waitForInitialLoad() {
        return new WinJS.Promise(function (onComplete) {
            // Wait for the events to be retrieved.
            marks.once("Calendar:Agenda._onGetEvents,StopTA,Calendar", function () {
                // Wait for the listview to finish loading the items
                waitForListViewLoadComplete().then(onComplete);
            });
        });
    }

    //
    // Event Creation
    //

    function createEvents() {
        // Starts in 14 minutes, length 1 hour
        ev1 = calendar.createEvent();
        ev1.startDate = getDate(now, 0, 0, 14);
        ev1.endDate = getDate(ev1.startDate, 0, 1, 0);

        ev1.subject = '1';
        ev1.location = 'a';
        ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev1.commit();

        // Starts in 1 hour, length 2 hours
        ev2 = calendar.createEvent();
        ev2.startDate = getDate(now, 0, 1, 0);
        ev2.endDate = getDate(ev2.startDate, 0, 2, 0);

        ev2.subject = '2';
        ev2.location = 'b';
        ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.workingElsewhere;
        ev2.commit();

        // Starts tomorrow at 6:45 AM, length 1.5 hours
        ev3 = calendar.createEvent();
        ev3.startDate = getDate(getDayFromDate(now), 1, 6, 45);
        ev3.endDate = getDate(ev3.startDate, 0, 1.5, 0);

        ev3.subject = '3';
        ev3.location = 'c';
        ev3.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
        ev3.commit();

        // Starts in 3 days at 10:15AM, length 3 hours
        ev4 = calendar.createEvent();
        ev4.startDate = getDate(getDayFromDate(now), 3, 10, 15);
        ev4.endDate = getDate(ev4.startDate, 0, 3, 0);

        ev4.subject = '4';
        ev4.location = 'd';
        ev4.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.workingElsewhere;
        ev4.commit();

        // Starts in 8 days, all day event
        ev5 = calendar.createEvent();
        ev5.startDate = getDate(getDayFromDate(now), 8, 0, 0);
        ev5.endDate = getDate(ev5.startDate, 1, 0, 0);
        ev5.allDayEvent = true;

        ev5.subject = '5';
        ev5.location = 'e';
        ev5.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
        ev5.commit();

        // Starts in 13 days at 1:00PM, length 2.25 days (multi-day)
        ev6 = calendar.createEvent();
        ev6.startDate = getDate(getDayFromDate(now), 13, 13, 0);
        ev6.endDate = getDate(ev6.startDate, 2, 3, 0);

        ev6.subject = '6';
        ev6.location = 'f';
        ev6.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
        ev6.commit();

        // Starts in 17 days at 5:30PM, length 10 hours (multiday, not all-day)
        ev7 = calendar.createEvent();
        ev7.startDate = getDate(getDayFromDate(now), 17, 17, 30);
        ev7.endDate = getDate(ev7.startDate, 0, 10, 0);

        ev7.subject = '7';
        ev7.location = 'g';
        ev7.commit();

        // Starts in 18 days at 8:45AM, length 3.5 hours
        ev8 = calendar.createEvent();
        ev8.startDate = getDate(getDayFromDate(now), 18, 8, 45);
        ev8.endDate = getDate(ev8.startDate, 0, 3, 30);

        ev8.subject = '8';
        ev8.location = 'h';
        ev8.commit();

        // Starts in 27 days at 3:15PM, length 1 hour
        ev9 = calendar.createEvent();
        ev9.startDate = getDate(getDayFromDate(now), 27, 15, 15);
        ev9.endDate = getDate(ev9.startDate, 0, 1, 0);

        ev9.subject = '9';
        ev9.location = 'i';
        ev9.commit();
    }

    //
    // Tests
    //

    Tx.asyncTest('AgendaViewTests.containsDate: empty list', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the no events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(1, eventElements.length, 'Number of items');
            verifyNoEventsItem(tc, eventElements.first());

            tc.areEqual(true, agenda.containsDate(today), 'Today');
            tc.areEqual(true, agenda.containsDate(now), 'Now');
            tc.areEqual(true, agenda.containsDate(earlyTomorrow), 'Early Tomorrow');
            tc.areEqual(true, agenda.containsDate(tomorrow), 'Tomorrow');
            tc.areEqual(true, agenda.containsDate(lastDay), 'Last Day');
            tc.areEqual(true, agenda.containsDate(endRangeMinusOne), 'End Range Minus One');

            tc.areEqual(false, agenda.containsDate(yesterday), 'Yesterday');
            tc.areEqual(false, agenda.containsDate(lateYesterday), 'Late Yesterday');
            tc.areEqual(false, agenda.containsDate(endRange), 'End Range');

            tc.start();
        });
    });
    
    Tx.asyncTest('AgendaViewTests.containsDate: full list', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;
        setup(createEvents);

        tc.stop();
        waitForInitialLoad().then(function () {
            tc.areEqual(true, agenda.containsDate(today), 'Today');
            tc.areEqual(true, agenda.containsDate(now), 'Now');
            tc.areEqual(true, agenda.containsDate(earlyTomorrow), 'Early Tomorrow');
            tc.areEqual(true, agenda.containsDate(tomorrow), 'Tomorrow');

            tc.areEqual(false, agenda.containsDate(yesterday), 'Yesterday');
            tc.areEqual(false, agenda.containsDate(lateYesterday), 'Late Yesterday');
            tc.areEqual(false, agenda.containsDate(lastDay), 'Last Day');
            tc.areEqual(false, agenda.containsDate(endRangeMinusOne), 'End Range Minus One');
            tc.areEqual(false, agenda.containsDate(endRange), 'End Range');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.getFocusedDay: empty list', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the no events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(1, eventElements.length, 'Number of items');
            verifyNoEventsItem(tc, eventElements.first());

            tc.areEqual(today.getTime(), agenda.getFocusedDay().getTime(), 'Today');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.getFocusedDay: full list', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;
        setup(createEvents);

        tc.stop();
        waitForInitialLoad().then(function () {
            tc.areEqual(today.getTime(), agenda.getFocusedDay().getTime(), 'Today');

            // Set the first visible item in the list
            agenda._listView.indexOfFirstVisible = 2;

            return waitForListViewLoadComplete();
        }).then(function () {
            tc.areEqual(earlyTomorrow.getTime(), agenda.getFocusedDay().getTime(), 'Early Tomorrow');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.events: past, now, next', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;
        
        var ev1;
        var ev2;
        var ev3;

        setup(function () {
            // Starts two minutes ago, goes for 1 minute
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(now, 0, 0, -2);
            ev1.endDate = getDate(ev1.startDate, 0, 0, 1);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();

            // Starts one minute ago, goes for 3 minutes
            ev2 = calendar.createEvent();
            ev2.startDate = getDate(now, 0, 0, -1);
            ev2.endDate = getDate(ev2.startDate, 0, 0, 3);

            ev2.subject = '2';
            ev2.location = 'b';
            ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            ev2.commit();

            // Starts 20 minutes from now, goes for 10 minutes
            ev3 = calendar.createEvent();
            ev3.startDate = getDate(now, 0, 0, 20);
            ev3.endDate = getDate(ev3.startDate, 0, 0, 10);

            ev3.subject = '3';
            ev3.location = 'c';
            ev3.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
            ev3.commit();
        });

        var pastEventQuery = '.event[data-handle="' + ev1.handle + '"]';
        var nowEventQuery = '.timeline .event[data-handle="' + ev2.handle + '"]';
        var nextEventQuery = '.timeline .event[data-handle="' + ev3.handle + '"]';
        var allDayEventQuery = '.alldayevent';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(3, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be one now event
            tc.areEqual(1, $(nowEventQuery).length, 'Number of now events');

            // There should be one normal event
            tc.areEqual(1, $(nextEventQuery).length, 'Number of next events');

            // There should be no past events
            tc.areEqual(0, $(pastEventQuery).length, 'Number of past events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of elements');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.events: zero minutes', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;
        var ev2;

        setup(function () {
            // Starts one minute ago, goes for 3 minutes
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(now, 0, 0, -1);
            ev1.endDate = getDate(ev1.startDate, 0, 0, 3);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            ev1.commit();

            // Starts 20 minutes from now, goes for 0 minutes
            ev2 = calendar.createEvent();
            ev2.startDate = getDate(now, 0, 0, 20);
            ev2.endDate = getDate(ev2.startDate, 0, 0, 0);

            ev2.subject = '2';
            ev2.location = 'b';
            ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.free;
            ev2.commit();
        });

        var nowEventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var nextEventQuery = '.timeline .event[data-handle="' + ev2.handle + '"]';
        var allDayEventQuery = '.alldayevent';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(3, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be one now event
            tc.areEqual(1, $(nowEventQuery).length, 'Number of now events');

            // There should be one normal event
            tc.areEqual(1, $(nextEventQuery).length, 'Number of next events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of elements');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.conflicts: past, now', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;
        var ev2;

        setup(function () {
            // Starts two minutes ago, goes for 1 minute
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(now, 0, 0, -2);
            ev1.endDate = getDate(ev1.startDate, 0, 0, 1);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();

            // Starts three minutes ago, goes for 10 minutes
            ev2 = calendar.createEvent();
            ev2.startDate = getDate(now, 0, 0, -3);
            ev2.endDate = getDate(ev2.startDate, 0, 0, 10);

            ev2.subject = '2';
            ev2.location = 'b';
            ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            ev2.commit();
        });

        var pastEventQuery = '.event[data-handle="' + ev1.handle + '"]';
        var nowEventQuery = '.timeline .event[data-handle="' + ev2.handle + '"]';
        var allDayEventQuery = '.alldayevent';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(2, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be one now event with no conflicts
            var nowEvent = $(nowEventQuery);
            tc.areEqual(1, nowEvent.length, 'Number of now events');
            tc.areEqual(0, nowEvent.find('.conflict').length, 'Number of conflict elements');

            // There should be no past events
            tc.areEqual(0, $(pastEventQuery).length, 'Number of past events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of elements');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.conflicts: now, next', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;
        var ev2;

        setup(function () {
            // Starts two minutes ago, goes for 15 minutes
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(now, 0, 0, -2);
            ev1.endDate = getDate(ev1.startDate, 0, 0, 15);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();

            // Starts ten minutes from now, goes for 10 minutes
            ev2 = calendar.createEvent();
            ev2.startDate = getDate(now, 0, 0, 10);
            ev2.endDate = getDate(ev2.startDate, 0, 0, 10);

            ev2.subject = '2';
            ev2.location = 'b';
            ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            ev2.commit();
        });

        var nowEventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var nextEventQuery = '.timeline .event[data-handle="' + ev2.handle + '"]';
        var allDayEventQuery = '.alldayevent';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(3, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // The now event should be in the timeline with conflicts
            var nowEvent = $(nowEventQuery);
            tc.areEqual(1, nowEvent.length, 'Number of now events');
            tc.areEqual(1, nowEvent.find('.conflict').length, 'Number of conflict elements');

            // The next event should be in the now with conflicts
            var nextEvent = $(nextEventQuery);
            tc.areEqual(1, nextEvent.length, 'Number of next events');
            tc.areEqual(1, nextEvent.find('.conflict').length, 'Number of conflict elements');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of elements');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.conflicts: multiday', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;
        var ev2;

        setup(function () {
            // Starts tomorrow at 2:30PM, goes 22 hours
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(getDayFromDate(now), 1, 14, 30);
            ev1.endDate = getDate(ev1.startDate, 0, 22, 0);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();

            // Starts tomorrow at 1:30PM, goes for 2 hours
            ev2 = calendar.createEvent();
            ev2.startDate = getDate(getDayFromDate(now), 1, 13, 30);
            ev2.endDate = getDate(ev2.startDate, 0, 2, 0);

            ev2.subject = '2';
            ev2.location = 'b';
            ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            ev2.commit();
        });

        var multiDayEventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var allDayEventQuery = '.alldayevent';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(4, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // The next event should be in the now with conflicts
            var nextEvent = $('.timeline .event[data-handle="' + ev2.handle + '"]');
            tc.areEqual(1, nextEvent.length, 'Number of next events');
            tc.areEqual(1, nextEvent.find('.conflict').length, 'Number of conflict elements');

            // The multiday event should be in the timeline with conflicts
            var multiDayEvent = $(multiDayEventQuery);
            tc.areEqual(2, multiDayEvent.length, 'Number of multiday events');
            tc.areEqual(1, multiDayEvent.first().find('.conflict').length, 'Number of conflict elements');
            tc.areEqual(0, multiDayEvent.last().find('.conflict').length, 'Number of conflict elements');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of elements');

            runSync(function () {
                // Move the event to 10:30AM two days from now, keep it at 2 hours
                ev2.startDate = getDate(getDayFromDate(now), 2, 10, 30);
                ev2.endDate = getDate(ev2.startDate, 0, 2, 0);
                ev2.commit();
            });

            return waitForListViewLoadComplete();
        }).then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(4, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // The next event should be in the timeline with conflicts
            var nextEvent = $('.timeline .event[data-handle="' + ev2.handle + '"]');
            tc.areEqual(1, nextEvent.length, 'Number of next events');
            tc.areEqual(1, nextEvent.find('.conflict').length, 'Number of conflict elements');

            // The multiday event should be in the now without conflicts
            var multiDayNow = $('.timeline .event[data-handle="' + ev1.handle + '"]');
            tc.areEqual(2, multiDayNow.length, 'Number of multiday events');
            tc.areEqual(0, multiDayNow.first().find('.conflict').length, 'Number of conflict elements');

            // The multiday event should be in the timeline with conflicts
            var multiDayEvent = $(multiDayEventQuery);
            tc.areEqual(2, multiDayEvent.length, 'Number of multiday events');
            tc.areEqual(0, multiDayEvent.first().find('.conflict').length, 'Number of conflict elements');
            tc.areEqual(1, multiDayEvent.last().find('.conflict').length, 'Number of conflict elements');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of elements');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.multiDayEvents: past, now - promote to all day', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;

        setup(function () {
            // Starts 23 hours, 57 minutes ago, ends in two minutes
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(now, -1, 0, 3);
            ev1.endDate = getDate(ev1.startDate, 0, 23, 59);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();
        });

        var eventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var allDayEventQuery = '.timeline .alldayevent[data-handle="' + ev1.handle + '"]';
        var allDayHeroQuery = '.herocontainer .alldayevent[data-handle="' + ev1.handle + '"]';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(2, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be one event
            tc.areEqual(1, $(eventQuery).length, 'Number of events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of all day elements');

            // There should be no all day events
            tc.areEqual(0, $(allDayHeroQuery).length, 'Number of all day hero elements');

            runSync(function () {
                // Extend the event to one day, one minute long
                ev1.endDate = getDate(ev1.startDate, 1, 0, 1);
                ev1.commit();
            });

            return waitForListViewLoadComplete();
        }).then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(1, eventElements.length, 'Number of items');
            verifyNoEventsItem(tc, eventElements.first());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of all day elements');

            // There should be no all day events
            tc.areEqual(1, $(allDayHeroQuery).length, 'Number of all day hero elements');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.multiDayEvents: promote to all day', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;

        setup(function () {
            // Starts tomorrow at 6:30AM, goes 23 hours (multiday)
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(getDayFromDate(now), 1, 6, 30);
            ev1.endDate = getDate(ev1.startDate, 0, 23, 0);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();
        });

        var eventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var allDayEventQuery = '.timeline .alldayevent[data-handle="' + ev1.handle + '"]';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(3, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be two normal events
            tc.areEqual(2, $(eventQuery).length, 'Number of events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of all day events');

            runSync(function () {
                // Extend the event to four days and two hours long
                ev1.endDate = getDate(ev1.startDate, 4, 2, 0);
                ev1.commit();
            });

            return waitForListViewLoadComplete();
        }).then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(6, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // Five all day events should take their place
            tc.areEqual(5, $(allDayEventQuery).length, 'Number of all day events');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.multiDayEvents: demote from all day', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;

        setup(function () {
            // Starts tomorrow at 3:00AM, goes for two days
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(getDayFromDate(now), 1, 3, 0);
            ev1.endDate = getDate(ev1.startDate, 2, 0, 0);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();
        });

        var eventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var allDayEventQuery = '.timeline .alldayevent[data-handle="' + ev1.handle + '"]';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(4, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // There should be three all day events
            tc.areEqual(3, $(allDayEventQuery).length, 'Number of all day events');

            runSync(function () {
                // Update the event length to be shorter than 24 hours
                ev1.endDate = getDate(ev1.startDate, 0, 23, 59);
                ev1.commit();
            });

            return waitForListViewLoadComplete();
        }).then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(3, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be two normal events
            tc.areEqual(2, $(eventQuery).length, 'Number of events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of all day events');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.multiDayEvents: move and extend', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;

        setup(function () {
            // Starts tomorrow at 5:00AM, goes for two days
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(getDayFromDate(now), 1, 5, 0);
            ev1.endDate = getDate(ev1.startDate, 2, 0, 0);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();
        });

        var eventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var allDayEventQuery = '.timeline .alldayevent[data-handle="' + ev1.handle + '"]';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(4, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // There should be three all day events
            tc.areEqual(3, $(allDayEventQuery).length, 'Number of all day events');

            runSync(function () {
                // Move it 1 day into the future, extend to 4 days
                ev1.startDate = getDate(ev1.startDate, 1, 0, 0);
                ev1.endDate = getDate(ev1.startDate, 4, 0, 0);
                ev1.commit();
            });

            return waitForListViewLoadComplete();
        }).then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(6, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // There should be five all day events
            tc.areEqual(5, $(allDayEventQuery).length, 'Number of all day events');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.allDayEvents: promote to all day', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;
        var ev2;

        setup(function () {
            // Starts tomorrow at 5:00AM, goes for two hours
            ev1 = calendar.createEvent();
            ev1.startDate = getDate(getDayFromDate(now), 1, 5, 0);
            ev1.endDate = getDate(ev1.startDate, 0, 2, 0);

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();

            // Starts tomorrow at 6:00AM, goes for one hour
            ev2 = calendar.createEvent();
            ev2.startDate = getDate(getDayFromDate(now), 1, 6, 0);
            ev2.endDate = getDate(ev2.startDate, 0, 1, 0);

            ev2.subject = '2';
            ev2.location = 'b';
            ev2.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.busy;
            ev2.commit();
        }, this, [], true);

        var eventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var allDayEventQuery = '.timeline .alldayevent[data-handle="' + ev1.handle + '"]';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(3, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be one normal event
            tc.areEqual(1, $(eventQuery).length, 'Number of events');

            // There should be three all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of elements');

            runSync(function () {
                // Convert it to an all-day event
                ev1.startDate = getDayFromDate(ev1.startDate);
                ev1.endDate = getDate(ev1.startDate, 1, 0, 0);
                ev1.allDayEvent = true;
                ev1.commit();

                // Move forward one hour, extend to two hours
                ev2.startDate = getDate(ev2.startDate, 0, 1, 0);
                ev2.endDate = getDate(ev2.startDate, 0, 2, 0);
                ev2.commit();
            }, this, [], true);

            return waitForListViewLoadComplete();
        }).then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(3, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // There should be one all day event
            tc.areEqual(1, $(allDayEventQuery).length, 'Number of all day events');

            tc.start();
        });
    });

    Tx.asyncTest('AgendaViewTests.allDayEvents: extend event', { timeoutMs: 2000 }, function (tc) {
        tc.cleanup = cleanup;

        var ev1;

        setup(function () {
            // Starts tomorrow
            ev1 = calendar.createEvent();
            ev1.startDate = getDayFromDate(now);
            ev1.endDate = getDate(ev1.startDate, 1, 0, 0);
            ev1.allDayEvent = true;

            ev1.subject = '1';
            ev1.location = 'a';
            ev1.busyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus.tentative;
            ev1.commit();
        });

        var eventQuery = '.timeline .event[data-handle="' + ev1.handle + '"]';
        var allDayEventQuery = '.timeline .alldayevent[data-handle="' + ev1.handle + '"]';
        var allDayHeroQuery = '.herocontainer .alldayevent[data-handle="' + ev1.handle + '"]';

        tc.stop();
        waitForInitialLoad().then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(1, eventElements.length, 'Number of items');
            verifyNoEventsItem(tc, eventElements.first());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // There should be no all day events
            tc.areEqual(0, $(allDayEventQuery).length, 'Number of all day events');

            // There should be one all day hero event
            tc.areEqual(1, $(allDayHeroQuery).length, 'Number of all day hero events');

            runSync(function () {
                // Extend the event to two days
                ev1.endDate = getDate(ev1.startDate, 2, 0, 0);
                ev1.commit();
            });

            return waitForListViewLoadComplete();
        }).then(function () {
            // Verify the see more events item
            var eventElements = $(listEventsSelector);
            tc.areEqual(2, eventElements.length, 'Number of items');
            verifySeeMoreEventsItem(tc, eventElements.last());

            // There should be no normal events
            tc.areEqual(0, $(eventQuery).length, 'Number of events');

            // There should be one all day event
            tc.areEqual(1, $(allDayEventQuery).length, 'Number of all day events');

            // There should be one all day hero event
            tc.areEqual(1, $(allDayHeroQuery).length, 'Number of all day hero events');

            tc.start();
        });
    });

    Tx.test('AgendaViewTests.getDayFromDate', function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.areEqual(today.getTime(), AgendaHelpers.getDayFromDate(now).getTime(), 'Now');
        tc.areEqual(today.getTime(), AgendaHelpers.getDayFromDate(today).getTime(), 'Today');
    });

})();
