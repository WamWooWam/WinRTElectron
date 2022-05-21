
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Calendar,Chat,MockPlatformWorker,MockJobset,Jx,Tx,Windows,mockTimeIndicator,restoreTimeIndicator,runSync,mockDatePicker,restoreDatePicker*/

(function() {
    var Frame = Calendar.Views.Frame;
    var Helpers = Calendar.Helpers;

    var manager;
    var worker;
    var workerex;
    var settings;
    var jobset;
    var frame;
    var root;
    var host;
    var app;
    var origJxEventManager;

    var Views;

    // MockWorkQueue

    function MockWorkQueue() {}

    MockWorkQueue.prototype = {
        dispose: function () {},
        queue: function () {},
        run: function () {},
    };

    // TestRoot component

    function TestRoot () {
        this._workQueue = new MockWorkQueue();
    }

    Jx.augment(TestRoot, Jx.Component);

    TestRoot.prototype.onQueryService = function (serviceName) {
        return (serviceName === "deferredWork") ? this._workQueue : null;
    };

    //
    // Setup
    //

    function setup() {
        // cache the platform
        var platform = new Calendar.Mock.Platform();

        Views = Views || Calendar.Views.Manager.Views;

        // This is something that we don't need to clean up, since we don't ever want the real code to run during UT's
        Jx.bici = {
            addToStream: function () { }
        };

        manager = platform.calendarManager;
        manager.dumpStore();

        // create the worker
        worker   = new MockPlatformWorker(platform);
        workerex = new Calendar.WorkerEx(worker);

        // clear our stored data
        var appData = new Jx.AppData(),
            local   = appData.localSettings();

        local.deleteContainer("Calendar");
        settings = local.container("Calendar");

        // create the activaton object
        if (!Jx.activation) {
            Jx.activation = new Jx.Activation();
        }

        var body = document.body;

        // add our host
        host = document.createElement("div");
        host.id = "host";
        body.insertBefore(host, body.firstChild);

        // Mock out Sas
        window.SasManager = function () { };
        window.SasManager.init = function () { };

        // mock out MessageBar and presenters
        window.Chat = {};
        Chat.MessageBar = function () { };
        Chat.MessageBar.prototype.hide = function () { };

        Chat.AuthMessageBarPresenter = function () { };
        Chat.AuthMessageBarPresenter.prototype.init = function () { };
        Chat.AuthMessageBarPresenter.prototype.shutdown = function () { };

        Chat.SyncMessageBarPresenter = function () { };
        Chat.SyncMessageBarPresenter.prototype.init = function () { };
        Chat.SyncMessageBarPresenter.prototype.shutdown = function () { };

        jobset = new MockJobset();

        // create the frame view
        mockTimeIndicator();
        mockDatePicker();
        frame = new Frame();

        // respond to frame view events
        frame.on("getPlatform", function(ev) {
            ev.data.platform = platform;
        });

        frame.on("getPlatformWorker", function(ev) {
            ev.data.platformWorker = workerex;
        });

        frame.on("getSettings", function(ev) {
            ev.data.settings = settings;
        });
    
        root = new TestRoot();
        root.append(frame);
    }

    //
    // Teardown
    //

    function cleanup() {
        restoreDatePicker();
        restoreTimeIndicator();

        // remove our elements
        frame.shutdownUI();
        document.body.removeChild(host);

        // clean up the worker
        workerex.dispose();
        worker.dispose();

        workerex = null;
        worker   = null;

        // clean up the jobset
        jobset.dispose();
        jobset = null;

        // get rid of any test events we created
        manager.dumpStore();
        manager = null;

        // release references
        frame = null;
        host = null;
        root = null;
    }

    //
    // Tests
    //

    // These tests verify the view is saved and rehydrated correctly.  There are more tests for setCurrentView in utViewManager.js.

    Tx.test("CalendarTests.testCurrentView1", function testCurrentView1 (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function initTestCurrentView1 () {
            frame.initUI(host, jobset);
        });
        tc.areEqual(Views.agenda, frame._views.getCurrentView(), "Should have defaulted to Agenda view.");
    });

    Tx.test("CalendarTests.testCurrentView2", function testCurrentView2 (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function initTestCurrentView2 () {
            settings.set("view", Views.day);
            frame.initUI(host, jobset);
        });
        tc.areEqual(Views.day, frame._views.getCurrentView(), "Should have rehydrated to Day view.");
    });

    Tx.test("CalendarTests.testCurrentView3", function testCurrentView3 (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function initTestCurrentView3() {
            frame.initUI(host, jobset);
        });

        // set a day and dehydrate it
        frame._views.setCurrentView(Views.day);
        Jx.activation.raiseEvent(Jx.activation.suspending);

        var view = settings.get("view");
        tc.areEqual(Views.day, view, "Should have dehydrated Day view.");
    });

    Tx.test("CalendarTests.testFocusedDay1", function testFocusedDay1 (tc) {
        tc.cleanup = cleanup;
        setup();

        runSync(function initTestFocusedDay1 () {
            frame.initUI(host, jobset);
        });

        var now = new Date(),
            day = frame._views.getFocusedDay();

        tc.areEqual(now.getFullYear(), day.getFullYear(), "Year should be the same.");
        tc.areEqual(now.getMonth(),    day.getMonth(),    "Month should be the same.");
        tc.areEqual(now.getDate(),     day.getDate(),     "Date should be the same.");
    });

    Tx.test("CalendarTests.testFocusedDay2", function testFocusedDay2 (tc) {
        tc.cleanup = cleanup;
        setup();

        var day = new Date("1/1/1901");

        settings.set("view", Views.week);
        settings.set("time", Date.now());
        settings.set("day",  day);

        runSync(function initTestFocusedDay2() {
            frame.initUI(host, jobset);
        });

        tc.areEqual(day.toString(), frame._views.getFocusedDay().toString(), "Should have rehydrated the day.");
    });

    Tx.test("CalendarTests.testFocusedDay3", function testFocusedDay3 (tc) {
        tc.cleanup = cleanup;
        setup();

        settings.set("view", Views.week);
        settings.set("time", Date.now() - Frame.REHYDRATION_TIMEOUT - 1);
        settings.set("day",  new Date("1/1/1901"));

        runSync(function initTestFocusedDay2() {
            frame.initUI(host, jobset);
        });

        var now = new Date(),
            day = frame._views.getFocusedDay();

        tc.areEqual(now.getFullYear(), day.getFullYear(), "Year should be the same.");
        tc.areEqual(now.getMonth(),    day.getMonth(),    "Month should be the same.");
        tc.areEqual(now.getDate(),     day.getDate(),     "Date should be the same.");
    });

    function appLaunchWithHandleSetup(tc, validHandles, validIds, expectedBroadcast) {
        app = {
            _onTile: Calendar.App.prototype._onTile,
            _getEventFromPreHandleToastId: Calendar.App.prototype._getEventFromPreHandleToastId,
            _loadEvent: Calendar.App.prototype._loadEvent,
            _ui: true,
        };

        // mock a platform to handle the lookup
        app._platform = {
            calendarManager: {
                getEventFromHandleCalled: false,
                getEventFromIdCalled: false,
                getOccurrenceCalled: false,
                malformedHandle: false,
                malformedStoreObjectId: false,
                getEventFromHandle: function (handleStr) {
                    this.getEventFromHandleCalled = true;

                    // return a mock event if defined
                    var result = null;
                    var record = validHandles[handleStr];

                    if (record) {
                        // valid registered handles return a mock event
                        result = {
                            id: record.id,
                            startDate: null,
                        };
                    } else {
                        // invalid handles that don't look valid throw (the actual platform returns E_UNEXPECTED)
                        var handleNum = parseInt(handleStr, 16);
                        if (handleNum < 0x117000000 || handleNum > 0x117ffffff || isNaN(handleNum)) {
                            this.malformedHandle = true;
                            throw "malformed event handle";
                        }
                    }

                    // if it was invalid but looked valid, result will just be null

                    return result;
                },
                getEventFromID: function (storeObjectId) {
                    this.getEventFromIdCalled = true;

                    // winrt throws if you pass NaN where a UINT32 is expected
                    if (isNaN(storeObjectId)) {
                        throw "invalid storeObjectId";
                    }

                    // return a mock event if defined
                    var result = null;
                    var record = validIds[storeObjectId];

                    if (record) {
                        // if the id is valid, return a mock event
                        result = {
                            id: record.id,
                            startDate: record.startDate,
                            getOccurrence: function (startDate) {
                                app._platform.calendarManager.getOccurrenceCalled = true;

                                // winrt throws if the date is invalid
                                if (isNaN(startDate.getTime())) {
                                    throw "invalid date";
                                }

                                var instance = null;
                                if (Helpers.isSameDate(startDate, this.startDate)) {
                                    instance = this;
                                }

                                return instance;
                            },
                        };
                    } else {
                        // invalid ids that don't look valid throw (the actual platform returns E_UNEXPECTED)
                        if (storeObjectId < 0x17000000 || storeObjectId > 0x17ffffff) {
                            this.malformedStoreObjectId = true;
                            throw "malformed store object id";
                        }
                        // else - we are just a store id for data that we couldn't find, which just returns null
                    }

                    return result;
                },
            }
        };

        // mock the EventManager
        origJxEventManager = Jx.EventManager;
        Jx.EventManager = {
            broadcastCalled: false,
            broadcast: function (eventName, data, frame) {
                this.broadcastCalled = true;
                tc.areEqual(eventName, "editEvent", "unexpected event: " + eventName);
                tc.areEqual(frame, true, "possibly called from incorrect context");
                tc.areEqual(data.event.id, expectedBroadcast.id, "mock had unexpected id: " + data.event.id);
                tc.isTrue((data.event.startDate === null && expectedBroadcast.startDate === null) ||
                    Helpers.isSameDate(data.event.startDate, expectedBroadcast.startDate), "mock had unexpected startDate: " + data.event.startDate);
            },
        };
    }

    function appLaunchWithHandleSharedSetup(tc, expectedBroadcast) {
        appLaunchWithHandleSetup(tc, 
            { "117000000": { id: 0x17000000, startDate: null }},  // handles
            { 385894857: { id: 385894857, startDate: null },  // old ids
              385876012: { id: 385876012, startDate: new Date(1366441200000) }},
            expectedBroadcast);
    }

    function appLaunchWithHandleCleanup() {
        Jx.EventManager = origJxEventManager;
        app = null;
    }

    Tx.test("CalendarTests.tileLaunchWithHandle", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testIdStr = "17000000";
        var testHandleStr = "1" + testIdStr;

        appLaunchWithHandleSharedSetup(tc, { id: 0x17000000, startDate: null });

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testHandleStr
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isFalse(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle");
        tc.isFalse(app._platform.calendarManager.getEventFromIdCalled, "attempted to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "shouldn't have treated as a store object id");
        tc.isFalse(app._platform.calendarManager.getOccurrenceCalled, "attempted to lookup event as recurring event");
        tc.isTrue(Jx.EventManager.broadcastCalled, "didn't attempt to broadcast edit");
    });

    Tx.test("CalendarTests.tileLaunchWithValidLookingButInvalidHandle", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testIdInvalidStr = "17000001";
        var testHandleInvalidStr = "1" + testIdInvalidStr;

        appLaunchWithHandleSharedSetup(tc, null);

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testHandleInvalidStr
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isFalse(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle");
        tc.isFalse(app._platform.calendarManager.getEventFromIdCalled, "attempted to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "shouldn't have treated as a store object id");
        tc.isFalse(app._platform.calendarManager.getOccurrenceCalled, "attempted to lookup event as recurring event");
        tc.isFalse(Jx.EventManager.broadcastCalled, "attempted to broadcast edit with invalid event");
    });

    Tx.test("CalendarTests.tileLaunchWithOldSingleInstanceId", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testId = "385894857";

        appLaunchWithHandleSharedSetup(tc, { id: 385894857, startDate: null });

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testId
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isTrue(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle as valid");
        tc.isTrue(app._platform.calendarManager.getEventFromIdCalled, "didn't attempt to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "misreporting a valid store object id as malformed");
        tc.isFalse(app._platform.calendarManager.getOccurrenceCalled, "attempted to lookup event as recurring event");
        tc.isTrue(Jx.EventManager.broadcastCalled, "didn't attempt to broadcast edit");
    });

    Tx.test("CalendarTests.tileLaunchWithOldRecurringId", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testId = "385876012.1366441200000.toast";

        appLaunchWithHandleSharedSetup(tc, { id: 385876012, startDate: new Date(1366441200000) });

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testId
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isTrue(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle as valid");
        tc.isTrue(app._platform.calendarManager.getEventFromIdCalled, "didn't attempt to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "misreporting a valid store object id as malformed");
        tc.isTrue(app._platform.calendarManager.getOccurrenceCalled, "didn't attempt to lookup event as recurring event");
        tc.isTrue(Jx.EventManager.broadcastCalled, "didn't attempt to broadcast edit");
    });

    Tx.test("CalendarTests.tileLaunchWithInvalidData", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testId = "invalid";

        appLaunchWithHandleSharedSetup(tc, null);

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testId
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isTrue(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle as valid");
        tc.isTrue(app._platform.calendarManager.getEventFromIdCalled, "didn't attempt to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "shouldn't have tried to validate id");
        tc.isFalse(app._platform.calendarManager.getOccurrenceCalled, "attempted to lookup event as recurring event");
        tc.isFalse(Jx.EventManager.broadcastCalled, "attempted to broadcast edit");
    });

    Tx.test("CalendarTests.tileLaunchWithInvalidLookingStoreId", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testId = "2385894857.1.toast";

        appLaunchWithHandleSharedSetup(tc, null);

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testId
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isTrue(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle as valid");
        tc.isTrue(app._platform.calendarManager.getEventFromIdCalled, "didn't attempt to lookup event as id");
        tc.isTrue(app._platform.calendarManager.malformedStoreObjectId, "misreporting a malformed store object id as valid");
        tc.isFalse(app._platform.calendarManager.getOccurrenceCalled, "attempted to lookup event as recurring event");
        tc.isFalse(Jx.EventManager.broadcastCalled, "attempted to broadcast edit");
    });

    Tx.test("CalendarTests.tileLaunchWithInvalidDateInstance", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testId = "385876012.1368846000000.toast";

        appLaunchWithHandleSharedSetup(tc, null);

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testId
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isTrue(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle as valid");
        tc.isTrue(app._platform.calendarManager.getEventFromIdCalled, "didn't attempt to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "misreporting a valid store object id as malformed");
        tc.isTrue(app._platform.calendarManager.getOccurrenceCalled, "didn't attempt to lookup event as recurring event");
        tc.isFalse(Jx.EventManager.broadcastCalled, "attempted to broadcast edit");
    });

    Tx.test("CalendarTests.tileLaunchWithInvalidDateParameter", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        var testId = "385876012.invalid.toast";

        appLaunchWithHandleSharedSetup(tc, null);

        // create mock activation args that _onTile expects
        var ev = {
            arguments: testId
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isTrue(app._platform.calendarManager.getEventFromHandleCalled, "didn't attempt to lookup event");
        tc.isTrue(app._platform.calendarManager.malformedHandle, "misreporting a malformed handle as valid");
        tc.isTrue(app._platform.calendarManager.getEventFromIdCalled, "didn't attempt to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "misreporting a valid store object id as malformed");
        tc.isTrue(app._platform.calendarManager.getOccurrenceCalled, "didn't attempt to lookup event as recurring event");
        tc.isFalse(Jx.EventManager.broadcastCalled, "attempted to broadcast edit");
    });

    Tx.test("CalendarTests.tileLaunchWithNoArgument", { owner: "anselr" }, function (tc) {
        tc.cleanup = appLaunchWithHandleCleanup;

        appLaunchWithHandleSharedSetup(tc, null);

        // create mock activation args that _onTile expects
        var ev = {
            arguments: null
        };

        // call the ontile
        app._onTile(ev);

        // confirm everything got called
        tc.isFalse(app._platform.calendarManager.getEventFromHandleCalled, "attempted to lookup event");
        tc.isFalse(app._platform.calendarManager.malformedHandle, "shouldn't have tried to identity id");
        tc.isFalse(app._platform.calendarManager.getEventFromIdCalled, "attempted to lookup event as id");
        tc.isFalse(app._platform.calendarManager.malformedStoreObjectId, "shouldn't have treated as a store object id");
        tc.isFalse(app._platform.calendarManager.getOccurrenceCalled, "attempted to lookup event as recurring event");
        tc.isFalse(Jx.EventManager.broadcastCalled, "attempted to broadcast edit");
    });

    function focusEventSetup (broadcastFunction) {
        /// <summary>Common setup for tests involving focusEvent - onProtocol, onShowTimeFrame</summary>
        /// <param name="broadcastFunction" type="Function">Mock Jx.EventManager.broadcast function</param>
        /// <returns>Calendar.App object suitable for testing _onProtocol</returns>
        
        var app = {
            _onProtocol: Calendar.App.prototype._onProtocol,
            _onShowTimeFrame: Calendar.App.prototype._onShowTimeFrame
        };

        origJxEventManager = Jx.EventManager;
        Jx.EventManager = {
            broadcast: broadcastFunction
        };

        return app;
    }

    function focusEventCleanup() {
        /// <summary>Cleanup for focusEventSetup</summary>
        Jx.EventManager = origJxEventManager;
    }

    Tx.test("CalendarTests.protocolLaunch-invalid", function protocolLaunchInvalid (tc) {
        /// <summary>Verifies protocol launch with invalid params</summary>

        function broadcast () {
            tc.error("Unexpected call to broadcast");
        }

        var app = focusEventSetup(broadcast);
        tc.cleanup = focusEventCleanup;

        var args = {};

        function runTest(uriString) {
            tc.log(uriString);
            args.uri = new Windows.Foundation.Uri(uriString);
            app._onProtocol(args);
        }

        // No action
        runTest("wlcalendar:");

        // No arguments
        runTest("wlcalendar://focusEvent");

        // No allDay param
        runTest("wlcalendar://focusEvent?start=1234667&end=4357823490");

        // No start param
        runTest("wlcalendar://focusEvent?end=123405747&allDay=false");
        
        // No end param
        runTest("wlcalendar://focusEvent?start=141362345&allDay=false");

        // start param is not a number
        runTest("wlcalendar://focusEvent?start=%20&end=141362345&allDay=false");

        // end param is not a number
        runTest("wlcalendar://focusEvent?end=%20&start=141362345&allDay=false");

        // start is greater than end
        runTest("wlcalendar://focusEvent?start=141362345&end=141362&allDay=false");
    });

    Tx.test("CalendarTests.protocolLaunch-valid", function protocolLaunchValid (tc) {
        /// <summary>Verifies the valid protocol launch scenario</summary>

        var performedBroadcast = false;
        var startDate = new Date("2/15/2015 4:00pm");
        var endDate = new Date("2/15/2015 5:00pm");
        
        function mockBroadcast(eventName, data) {
            performedBroadcast = true;
            tc.areEqual("focusEvent", eventName, "Unexpected event broadcast");
            tc.areEqual(startDate.toString(), data.startDate.toString(), "startDate");
            tc.areEqual(endDate.toString(), data.endDate.toString(), "endDate");
            tc.areEqual(false, data.allDayEvent, "allDayEvent");
        }

        var app = focusEventSetup(mockBroadcast);
        tc.cleanup = focusEventCleanup;

        var args = {
            uri: new Windows.Foundation.Uri("wlcalendar://focusEvent?start=" + startDate.getTime() + "&end=" + endDate.getTime() + "&allDay=false")
        };

        app._onProtocol(args);
        tc.isTrue(performedBroadcast, "Broadcast event not sent");
        // The rest of the test statements are in the mockBroadcast function
    });

    Tx.test("CalendarTests.onShowTimeFrame", function onShowTimeFrame (tc) {
        /// <summary>Verifies onShowTimeFrame</summary>

        var performedBroadcast = false;
        var startDate = new Date("4/15/2014 1:00pm");
        var duration = 6 * Calendar.Helpers.hourInMilliseconds;
        var expectedEndDate = new Date("4/15/2014 7:00pm");

        function mockBroadcast(eventName, data) {
            performedBroadcast = true;
            tc.areEqual(startDate.toString(), data.startDate.toString(), "startDate");
            tc.areEqual(expectedEndDate.toString(), data.endDate.toString(), "endDate");
            tc.isFalse(data.allDayEvent, "allDayEvent");
        }

        var app = focusEventSetup(mockBroadcast);
        tc.cleanup = focusEventCleanup;

        var args = {
            verb: Windows.ApplicationModel.Appointments.AppointmentsProvider.AppointmentsProviderLaunchActionVerbs.showTimeFrame,
            duration: duration,
            timeToShow: startDate,
        };

        app._onShowTimeFrame(args);
        tc.isTrue(performedBroadcast, "Broadcast event not sent");
        // The rest of the test statements are in the mockBroadcast function
    });

})();
