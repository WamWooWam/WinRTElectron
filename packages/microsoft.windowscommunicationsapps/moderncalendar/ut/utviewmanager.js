
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Jx,Calendar,runSync,mockTimeIndicator,MockPlatformWorker,MockJobset,restoreTimeIndicator,mockDatePicker,restoreDatePicker*/

(function() {
    var ViewManager = Calendar.Views.Manager;

    var platform,
        manager,
        calendar,
        worker,
        workerex;

    var jobset;

    var host,
        views;

    function setup() {

        var body = document.body;

        // add the view manager to the body
        for (var i = 0; i < body.childNodes.length; i++) {
            body.childNodes[i].display = "none";
        }

        host = document.createElement("div");
        host.id = "host";
        body.insertBefore(host, body.firstChild);

        // set up the view manager
        mockTimeIndicator();
        mockDatePicker();
        views = new ViewManager();

        // set up platform
        platform = new Calendar.Mock.Platform();

        // dump the store to remove all events
        manager = platform.calendarManager;
        manager.dumpStore();

        // get our calendar
        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");

        // create the worker
        worker   = new MockPlatformWorker(platform);
        workerex = new Calendar.WorkerEx(worker);

        // create the jobset
        jobset = new MockJobset();

        // add event listeners
        views.on("getAppBar", function (ev) {
            ev.data.appBar = {
                setCommands: function (/*commands*/) {},
                showCommands: function () {},
                hideCommands: function () {},
                getCommandById: function () { return {}; },
                addEventListener: function () {},
                removeEventListener: function () {},
            };
        });

        views.on("getPeekBar", function (ev) {
            ev.data.peekBar = {
                allowTabVersion: function () { },
                isTabMode: function () { return false; },
            };
        });

        views.on("getPlatform", function(ev) {
            ev.data.platform = platform;
        });

        views.on("getPlatformWorker", function(ev) {
            ev.data.platformWorker = workerex;
        });

        views.on("getSettings", function(ev) {
            ev.data.settings = {
                get: function() {
                    return false;
                },
                set: function () {},
                remove: function () {},
            };
        });

        host.innerHTML = Jx.getUI(views).html;
        views.activateUI(jobset);
    }

    //
    // Teardown
    //

    function cleanup() {
        restoreDatePicker();
        restoreTimeIndicator();

        var body = document.body;

        views.deactivateUI();
        body.removeChild(body.firstChild);

        // clean up the worker
        workerex.dispose();
        worker.dispose();

        workerex = null;
        worker   = null;

        // clean up the jobset
        jobset.dispose();
        jobset = null;

        // get rid of any test events we entered
        manager.dumpStore();

        calendar = null;
        manager  = null;
        platform = null;

        views = null;
    }

    //
    // Tests
    //

    Tx.test("ViewManagerTests.testCurrentView", function (tc) {
        tc.cleanup = cleanup;
        setup();
        
        var agenda, month, week, day;

        function queryHtml() {
            agenda = host.querySelector(".agendaview");
            month = host.querySelector(".monthview");
            week = host.querySelector(".week");
            day = host.querySelector(".dayview");
        }

        tc.log("Test 1: default view.");
        queryHtml();
        tc.isNotNull(agenda,    "Agenda div should exist.");
        tc.isNull(month,        "Month div should not exist.");
        tc.isNull(week,         "Week div should not exist.");
        tc.isNull(day,          "Day div should not exist.");
        tc.areEqual(ViewManager.Views.agenda, views.getCurrentView(), "Agenda should be the currently saved view.");

        tc.log("Test 2: switch to day view");
        views.setCurrentView(ViewManager.Views.day);
        queryHtml();

        tc.isNull(agenda, "Agenda div should not exist.");
        tc.isNull(month,  "Month div should not exist.");
        tc.isNull(week,   "Week div should not exist.");
        tc.isNotNull(day, "Day div should exist.");
        tc.areEqual(ViewManager.Views.day, views.getCurrentView(), "Day should be the currently saved view.");
    });

    Tx.test("ViewManagerTests.testCurrentView-companion", function (tc) {
        /// <summary>Verifies various companion behaviors with setCurrentView</summary>
        tc.cleanup = cleanup;
        setup();

        views.setCurrentView(ViewManager.Views.month);

        runSync(function() {
            views._onResizeWindow({ data: { outerWidth: 320 } });
        });

        var agenda, month, week, day;

        function queryHtml() {
            agenda = host.querySelector(".agendaview");
            month = host.querySelector(".monthview");
            week = host.querySelector(".week");
            day = host.querySelector(".dayview");
        }

        tc.log("Test 1: Switch to companion from month view");
        queryHtml();
        tc.isNull(month, "Month div should not exist.");
        tc.isNull(week, "Week div should not exist.");
        tc.isNull(agenda, "Agenda div should not exist.");
        tc.isNotNull(day, "Day div should exist.");
        tc.areEqual(ViewManager.Views.month, views.getCurrentView(), "Month should be the currently saved view.");

        tc.log("Test 2: Switch to day view");
        views.setCurrentView(ViewManager.Views.day);
        queryHtml();

        tc.isNull(month, "Month div should not exist.");
        tc.isNull(week, "Week div should not exist.");
        tc.isNull(agenda, "Agenda div should not exist.");
        tc.isNotNull(day, "Day div should exist.");
        tc.areEqual(ViewManager.Views.day, views.getCurrentView(), "Day should be the currently saved view.");

        tc.log("Test 2: Switch to agenda view");
        views.setCurrentView(ViewManager.Views.agenda);
        queryHtml();

        tc.isNull(month, "Month div should not exist.");
        tc.isNull(week, "Week div should not exist.");
        tc.isNotNull(agenda, "Agenda div should exist.");
        tc.isNull(day, "Day div should not exist.");
        tc.areEqual(ViewManager.Views.agenda, views.getCurrentView(), "Agenda should be the currently saved view.");

        tc.log("Test 3: Switch from agenda to week view");
        views.setCurrentView(ViewManager.Views.week);
        queryHtml();

        tc.isNull(month, "Month div should not exist.");
        tc.isNull(week, "Week div should not exist.");
        tc.isNull(agenda, "Agenda div should not exist.");
        tc.isNotNull(day, "Day div should exist.");
        tc.areEqual(ViewManager.Views.week, views.getCurrentView(), "Week should be the currently saved view.");
    });

    Tx.test("ViewManagerTests.testFocusedDay", function (tc) {
        // Events are the same

        tc.cleanup = cleanup;
        setup();

        var day = new Date("1/1/2000");
        views.setCurrentView(ViewManager.Views.day);
        views.setFocusedDay(day);

        tc.areEqual(day.toString(), views.getFocusedDay().toString(),        "1. ViewManager should have the new focused day.");
        tc.areEqual(day.toString(), views._child.getFocusedDay().toString(), "1. Child should have the new focused day.");

        day = new Date("2/1/2002");
        views.setFocusedDay(day);

        tc.areEqual(day.toString(), views.getFocusedDay().toString(),        "2. ViewManager should have the new focused day.");
        tc.areEqual(day.toString(), views._child.getFocusedDay().toString(), "2. Child should have the new focused day.");

        runSync(function() {
            views._onResizeWindow({ data: { outerWidth: 320 } });
        });

        day = new Date("3/3/2003");
        views.setFocusedDay(day);

        tc.areEqual(day.toString(), views.getFocusedDay().toString(),        "3. ViewManager should have the new focused day.");
        tc.areEqual(day.toString(), views._child.getFocusedDay().toString(), "3. Child should have the new focused day.");
    });

    Tx.test("ViewManagerTests.testOnFocusEvent", function (tc) {
        /// <summary>Verifies onFocusEvent behavior</summary>

        tc.cleanup = cleanup;
        setup();

        var agenda, month, week, day;
        var eventArgs = {};
        var Helpers = Calendar.Helpers;

        function queryHtml() {
            agenda = host.querySelector(".agendaview");
            month = host.querySelector(".monthview");
            week = host.querySelector(".week");
            day = host.querySelector(".dayview");
        }

        tc.log("Fire focusEvent with zero duration");
        eventArgs.startDate = new Date("3/4/2014");
        eventArgs.endDate = new Date(eventArgs.startDate);
        views.fire("focusEvent", eventArgs);
        queryHtml();

        tc.isNotNull(day, "Current view should be day view.");
        tc.areEqual(eventArgs.startDate.toString(), views.getFocusedDay().toString(), "Focused day should match args");


        tc.log("Fire focusEvent with two day duration");
        eventArgs.startDate = new Date("4/15/2015");
        eventArgs.endDate = new Date(eventArgs.startDate.getTime() + 2 * Helpers.dayInMilliseconds);
        views.fire("focusEvent", eventArgs);
        queryHtml();

        tc.isNotNull(day, "Current view should be day view.");
        tc.areEqual(eventArgs.startDate.toString(), views.getFocusedDay().toString(), "Focused day should match args");


        tc.log("Fire focusEvent with five day duration");
        eventArgs.startDate = new Date("9/29/2011");
        eventArgs.endDate = new Date(eventArgs.startDate.getTime() + 5 * Helpers.dayInMilliseconds);
        views.fire("focusEvent", eventArgs);
        queryHtml();

        tc.isNotNull(week, "Current view should be week view.");
        tc.areEqual(eventArgs.startDate.toString(), views.getFocusedDay().toString(), "Focused day should match args");


        tc.log("Fire focusEvent with seven day duration");
        eventArgs.startDate = new Date("7/7/2017");
        eventArgs.endDate = new Date(eventArgs.startDate.getTime() + 7 * Helpers.dayInMilliseconds);
        views.fire("focusEvent", eventArgs);
        queryHtml();

        tc.isNotNull(week, "Current view should be week view.");
        tc.areEqual(eventArgs.startDate.toString(), views.getFocusedDay().toString(), "Focused day should match args");


        tc.log("Fire focusEvent with nine day duration");
        eventArgs.startDate = new Date("6/21/2013");
        eventArgs.endDate = new Date(eventArgs.startDate.getTime() + 9 * Helpers.dayInMilliseconds);
        views.fire("focusEvent", eventArgs);
        queryHtml();

        tc.isNotNull(month, "Current view should be month view.");
        tc.areEqual(eventArgs.startDate.toString(), views.getFocusedDay().toString(), "Focused day should match args");


        tc.log("Switch to companion mode and agenda view");
        runSync(function () {
            views._onResizeWindow({ data: { outerWidth: 320 } });
        });
        views.setCurrentView(ViewManager.Views.agenda);
        tc.isTrue(views.isCompanion(), "Invalid test setup: not in companion mode");

        
        tc.log("FocusEvent switches from agenda view");
        eventArgs.startDate = new Date("9/03/2034");
        eventArgs.endDate = new Date(eventArgs.startDate.getTime() + 5 * Helpers.dayInMilliseconds);
        views.fire("focusEvent", eventArgs);
        queryHtml();

        tc.isNotNull(day, "Currently displayed view should be day view.");
        tc.areEqual(ViewManager.Views.week, views.getCurrentView(), "Currently saved view should be week view");
        tc.areEqual(eventArgs.startDate.toString(), views.getFocusedDay().toString(), "Focused day should match args");

        
        tc.log("FocusEvent while already displaying day companion");
        eventArgs.startDate = new Date("6/27/2015");
        eventArgs.endDate = new Date(eventArgs.startDate);
        views.fire("focusEvent", eventArgs);
        queryHtml();

        tc.isNotNull(day, "Currently displayed view should be day view.");
        tc.areEqual(ViewManager.Views.day, views.getCurrentView(), "Currently saved view should be day view");
        tc.areEqual(eventArgs.startDate.toString(), views.getFocusedDay().toString(), "Focused day should match args");
    });

    Tx.test("ViewManagerTests.testEvents", function (tc) {
        tc.cleanup = cleanup;
        setup();

        tc.log("Test dayChosen event");
        views.fire("dayChosen");
        tc.areEqual(ViewManager.Views.day, views.getCurrentView(), "Day should be the current view.");

        tc.log("Test monthChosen event");
        views.fire("monthChosen");
        tc.areEqual(ViewManager.Views.month, views.getCurrentView(), "Month should be the current view.");
    });

})();