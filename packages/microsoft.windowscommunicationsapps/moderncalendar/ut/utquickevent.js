
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Jx,Calendar,$,runSync,mockDateTimeFormatting*/

(function () {
    var QuickEvent = Calendar.Controls.QuickEvent;

    var host,
        platform,
        manager,
        calendar, calendar2,
        quickEvent,
        createdEvent,
        settings,
        _originalStopPropagation;

    function setup() {
        platform = new Calendar.Mock.Platform();
        manager = platform.calendarManager;
        calendar = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");
        calendar2 = manager.addCalendar(platform.accountManager.defaultAccount, "testCalendar");

        mockDateTimeFormatting();

        manager.defaultCalendar = calendar;

        host = document.getElementById("calendar");

        quickEvent = new QuickEvent();
        quickEvent._useAnimation = false;

        quickEvent.on("getPlatform", function (ev) {
            ev.data.platform = platform;
        });

        createdEvent = null;

        quickEvent.on("createEvent", function (ev) {
            createdEvent = ev.data;
        });

        calendar.addListener("eventAdded", function (ev) {
            createdEvent = ev;
        });
        calendar2.addListener("eventAdded", function (ev) {
            createdEvent = ev;
        });

        quickEvent._setupCalendarCombo = function () {
            settings = { lastCalendarId: calendar.id };

            this._settings = {
                get: function (str) {
                    return settings[str];
                },
                set: function (key, value) {
                    settings[key] = value;
                }
            };

            this._calendarSelector.setCalendars([{
                calendar: calendar,
                email: calendar.account.emailAddress,
                color: calendar.color,
                name: calendar.name,
            }, {
                calendar: calendar2,
                email: calendar2.account.emailAddress,
                color: calendar2.color,
                name: calendar2.name,
            }]);
            this._calendarSelector.updateSelectionById(0);
        };
    }

    function cleanup() {
        manager.dumpStore();

        quickEvent = null;
        createdEvent = null;
        settings = null;
        host = null;
        calendar = null;
        calendar2 = null;
        manager = null;
        platform = null;
    }

    /*
        Tests
    */
    Tx.test("QuickEventTests.testOpenClose", function (tc) {
        tc.cleanup = cleanup;
        setup();

        quickEvent.activateUI(host, new Date(), null, null);
        quickEvent._useAnimation = false;

        tc.areEqual(quickEvent.isOpen(), true, "isOpen 1");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty 1");

        quickEvent.deactivateUI();

        tc.areEqual(quickEvent.isOpen(), false, "isOpen 2");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty 2");

        quickEvent.activateUI(host, new Date(), null, null);
        quickEvent._useAnimation = false;

        tc.areEqual(quickEvent.isOpen(), true, "isOpen 3");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty 3");

        quickEvent.deactivateUI();

        tc.areEqual(quickEvent.isOpen(), false, "isOpen 4");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty 4");
    });

    function mockStopPropagation() {
        _originalStopPropagation = Event.prototype.stopPropagation;
        Event.prototype.propagationStopped = false;
        Event.prototype.stopPropagation = function () {
            this.propagationStopped = true;
        };
    }

    function restoreStopPropagation() {
        Event.prototype.stopPropagation = _originalStopPropagation;
        Event.prototype.propagationStopped = undefined;
    }

    Tx.test("QuickEventTests.testCreateKeyEvents", function (tc) {
        tc.cleanup = cleanup;
        setup();
        mockStopPropagation();

        var subject = "subject",
            location = "location";

        // Test using Enter
        quickEvent.activateUI(host, new Date(), null, null);
        quickEvent._subject.value = subject;
        quickEvent._location.value = location;

        var keyEvent = $.Event("keydown", { keyCode: Jx.KeyCode.enter });

        tc.areEqual(quickEvent.isDirty(), true, "isDirty should be true because of subject and location");

        runSync(function () {
            quickEvent._onKeyDownInputBox(keyEvent);
            tc.isFalse(keyEvent.propagationStopped, "Event propagation stopped unexpectedly");
            quickEvent._onKeyDown(keyEvent);
        });

        tc.isNotNull(createdEvent, "Event failed to create");
        tc.areEqual(createdEvent.subject, subject, "Subject failed to write");
        tc.areEqual(createdEvent.location, location, "Location failed to write");
        tc.areEqual(quickEvent.isOpen(), false, "isOpen 5");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty 5");

        createdEvent = null;

        quickEvent.activateUI(host, new Date(), null, null);
        quickEvent._subject.value = subject;
        quickEvent._location.value = location;

        tc.areEqual(quickEvent.isDirty(), true, "isDirty should be true because of subject and location");

        keyEvent = $.Event("keydown", { keyCode: Jx.KeyCode.s, ctrlKey: true });

        runSync(function () {
            quickEvent._onKeyDownInputBox(keyEvent);
            tc.isFalse(keyEvent.propagationStopped, "Event propagation stopped unexpectedly");
            quickEvent._onKeyDown(keyEvent);
        });

        tc.isNotNull(createdEvent, "Event failed to create");
        tc.areEqual(createdEvent.subject, subject, "Subject failed to write");
        tc.areEqual(createdEvent.location, location, "Location failed to write");
        tc.areEqual(quickEvent.isOpen(), false, "isOpen");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty");

        restoreStopPropagation();
    });

    Tx.test("QuickEventTests.testCancelKeyEvent", function (tc) {
        tc.cleanup = cleanup;
        setup();
        mockStopPropagation();

        var subject = "subject",
            location = "location";

        quickEvent.activateUI(host, new Date(), null, null);
        quickEvent._subject.value = subject;
        quickEvent._location.value = location;

        var keyEvent = $.Event("keydown", { keyCode: Jx.KeyCode.escape });

        runSync(function () {
            quickEvent._onKeyDownInputBox(keyEvent);
            tc.isFalse(keyEvent.propagationStopped, "Event propagation stopped unexpectedly");
            quickEvent._onKeyDown(keyEvent);
        });
        tc.isNull(createdEvent, "Event creation should have been cancelled");

        restoreStopPropagation();
    });

    Tx.test("QuickEventTests.testTabKeyEvent", function (tc) {
        tc.cleanup = cleanup;
        setup();
        mockStopPropagation();

        var originalStopPropagation = Event.prototype.stopPropagation;
        Event.prototype.propagationStopped = false;
        Event.prototype.stopPropagation = function () {
            this.propagationStopped = true;
        };

        quickEvent.activateUI(host, new Date(), null, null);

        var location = quickEvent._host.querySelector("#qeLocation");
        var subject = quickEvent._host.querySelector("#qeSubject");
        var caret = quickEvent._host.querySelector("#qeCaret");
        var startGrabber = quickEvent._host.querySelector("#startgrabberTouch");
        var stopGrabber = quickEvent._host.querySelector("#stopgrabberTouch");

        var tabEvent = $.Event("keydown", { keyCode: Jx.KeyCode.tab });
        var shiftTabEvent = $.Event("keydown", { keyCode: Jx.KeyCode.tab, shiftKey: true });
        var charEvent = $.Event("keydown", { keyCode: Jx.KeyCode.s });

        // start on subject
        quickEvent._onKeyDownInputBox(charEvent);
        tc.isTrue(charEvent.propagationStopped, "Expected event propagation to stop");
        tc.areEqual(quickEvent._host.querySelector(":focus"), subject, "Focus should be on subject");

        // tab to location
        quickEvent._onKeyDownInputBox(tabEvent);
        tc.isFalse(tabEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(tabEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), location, "Focus should be on location");

        tabEvent.propagationStopped = false;

        // tab to caret
        quickEvent._onKeyDownInputBox(tabEvent);
        tc.isFalse(tabEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(tabEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), caret, "Focus should be on caret");

        tabEvent.propagationStopped = false;

        // tab to startgrabber
        quickEvent._onKeyDownInputBox(tabEvent);
        tc.isFalse(tabEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(tabEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), startGrabber, "Focus should be on startgrabber");

        tabEvent.propagationStopped = false;

        // tab to stopgrabber
        quickEvent._onKeyDown(tabEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), stopGrabber, "Focus should be on stopgrabber");

        // tab to subject
        quickEvent._onKeyDown(tabEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), subject, "Focus should be on subject");

        // tab back to stopgrabber
        quickEvent._onKeyDownInputBox(shiftTabEvent);
        tc.isFalse(shiftTabEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(shiftTabEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), stopGrabber, "Focus should be on stopgrabber");

        // tab back to startgrabber
        quickEvent._onKeyDown(shiftTabEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), startGrabber, "Focus should be on startgrabber");

        quickEvent.deactivateUI();
        restoreStopPropagation();
    });

    Tx.test("QuickEventTests.testArrowKeyEvent", function (tc) {
        tc.cleanup = cleanup;
        setup();

        quickEvent.activateUI(host, new Date(), null, null);

        var location = quickEvent._host.querySelector("#qeLocation");
        var subject = quickEvent._host.querySelector("#qeSubject");

        var mockKeyEvent = {
            stopPropagation: function () { this.propagationStopped = true },
            preventDefault: function () { },
            propagationStopped: false,
            keyCode: Jx.KeyCode.downarrow,
            target: subject
        };

        // arrow to location
        quickEvent._onKeyDownInputBox(mockKeyEvent);
        tc.isFalse(mockKeyEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(mockKeyEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), location, "Focus should be on location");

        mockKeyEvent.propagationStopped = false;
        mockKeyEvent.target = location;

        // stay on location
        quickEvent._onKeyDownInputBox(mockKeyEvent);
        tc.isFalse(mockKeyEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(mockKeyEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), location, "Focus should be on location");

        mockKeyEvent.keyCode = Jx.KeyCode.uparrow;
        mockKeyEvent.propagationStopped = false;

        // arrow to subject
        quickEvent._onKeyDownInputBox(mockKeyEvent);
        tc.isFalse(mockKeyEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(mockKeyEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), subject, "Focus should be on subject");

        mockKeyEvent.propagationStopped = false;
        mockKeyEvent.target = subject;

        // stay on subject
        quickEvent._onKeyDownInputBox(mockKeyEvent);
        tc.isFalse(mockKeyEvent.propagationStopped, "Event propagation stopped unexpectedly");
        quickEvent._onKeyDown(mockKeyEvent);
        tc.areEqual(quickEvent._host.querySelector(":focus"), subject, "Focus should be on subject");

        quickEvent.deactivateUI();
    });

    Tx.test("QuickEventTests.testCreateUsingCalendarSelector", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var subject = "subject",
            location = "location";

        quickEvent.activateUI(host, new Date(), null, null);
        quickEvent._subject.value = subject;
        quickEvent._location.value = location;

        $(quickEvent._calendarSelector._selection).click();
        $(".entry:nth-child(2)", $(".dropDown")).click();
        tc.isTrue(quickEvent._calendarSelector._selectedCalendar === 1, "Second Calendar should be selected by click.");

        var keyEvent = $.Event("keydown", { keyCode: Jx.KeyCode.enter });

        runSync(function () {
            quickEvent._onKeyDown(keyEvent);
        });

        tc.isNotNull(createdEvent, "Event failed to create");
        tc.areEqual(createdEvent.subject, subject, "Subject failed to write");
        tc.areEqual(createdEvent.location, location, "Location failed to write");
        tc.areEqual(quickEvent.isOpen(), false, "isOpen");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty");
    });

    Tx.test("QuickEventTests.testEventDetailsLink", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var subject = "subject",
            location = "location";

        quickEvent.activateUI(host, new Date(), null, null);
        quickEvent._useAnimation = false;
        quickEvent._subject.value = subject;
        quickEvent._location.value = location;

        $(quickEvent._calendarSelector._selection).click();
        $(".link").click();
        // Normally the viewManager will deactivate quick event by deactivating its parent view while switching to event details, so we deactivate manually.
        quickEvent.deactivateUI();

        tc.isNotNull(createdEvent, "Event failed to create");
        tc.areEqual(createdEvent.subject, subject, "Subject failed to write");
        tc.areEqual(createdEvent.location, location, "Location failed to write");
        tc.areEqual(quickEvent.isOpen(), false, "isOpen");
        tc.areEqual(quickEvent.isDirty(), false, "isDirty");
    });
})();