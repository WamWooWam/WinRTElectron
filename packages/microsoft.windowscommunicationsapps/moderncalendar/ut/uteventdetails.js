
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Jx,Tx,$,Calendar,Microsoft,runSync,ModernCanvas,WinJS,People,MockJobset*/

(function () {
    var EventDetails = Calendar.Views.EventDetails,
        Helpers      = Calendar.Helpers;

    // Globals
    var div = null,
        eventDetails = null,
        root = null,
        finishedEditing = false,
        shownFlyout = false,
        launchedMail = false,
        realLaunchMail = Calendar.Helpers.launchMail,
        realShowFlyout = Calendar.Helpers.showFlyout,
        realShowMenu = Calendar.Helpers.showMenu,
        elems = {},
        invitesManager = null,
        testDate = null,
        savedEventId = null,
        uiLoaded = false,
        _settings,
        account,
        futureDate1,
        futureDate2,
        pastDate1,
        jobset,
        pastDate2;


    var harness         = null,
        platform        = null,
        calendarManager = null,
        calendar        = null;

    if (!Jx.activation) {
        Jx.init({});
    }

    //
    // People
    //

    People.Priority = {};

    //
    // Root component stub
    //
    var Root = function () {
        eventDetails = new Calendar.Views.EventDetails();
        this.append(eventDetails);
    };

    function value (element) {
        var temp = element.getAttribute("data-value-override");
        return (temp !== null)?temp:element.value;
    }

    Jx.augment(Root, Jx.Component);

    Root.prototype.onGetAppBar = function (ev) {
        ev.data.appBar = {
            hide: function () {},
            setCommands: function (/*commands*/) {},
            show: function () {},
            addEventListener: function () {},
            removeEventListener: function () {}
        };
    };

    Root.prototype.onGetPlatform = function (ev) {
        ev.data.platform = {
            accountManager:  platform.accountManager,
            calendarManager: platform.calendarManager,
            folderManager:   platform.folderManager,
            peopleManager:   platform.peopleManager,
            invitesManager:  invitesManager
        };

        ev.handled = true;
    };

    Root.prototype.onGetSettings = function (ev) {
        ev.data.settings = _settings;
        ev.handled = true;
    };

    Root.prototype.onShowFlyout = function(ev) {
        shownFlyout = true;
        ev.handled = true;
    };

    Root.prototype.onFinishedEditing = function (ev) {
        finishedEditing = true;
        savedEventId = ev.data ? ev.data.id : null;
        ev.handled = true;
    };

    Root.prototype.waitForAttendees = function (tc, timeout, attendees, count, unlock) {
        Tx.chkObj(tc);

        if (unlock) {
            attendees.unlock();
        }
        var wait = 0;
        var maxWait = timeout / 50;

        while (attendees.count !== count && wait < maxWait) {
            if (wait === 0) {
                tc.log("Waiting for " + count + " attendees");
            }
            wait ++;
            platform.runMessagePump(50);
        }
    };

    // Mock ModernCanvas ctor
    ModernCanvas.ModernCanvas = function (el) {
        this._body = document.createElement("div");
        el.appendChild(this._body);

        this.activate = function () { };
        this.addContent = function (content) {
            this._body.innerHTML = content;
        };
        this.addEventListener = function () { };
        this.removeEventListener = function () { };
        this.dispose = function () { };
        this.setCueText = function () { };
        this.getDocument = function () { return { body: this._body }; };
        this.getContent = function (format) {
            if (format === ModernCanvas.ContentFormat.htmlString) {
                return this._body.innerHTML;
            } else {
                return this._body.innerText;
            }
        };

        this.components = {
            dirtyTracker: {
                isDirty: false
            }
        };
    };

    ModernCanvas.createCanvasAsync = function (el) { return WinJS.Promise.wrap(new ModernCanvas.ModernCanvas(el)); };

    var mockMailMessage = function () {};
    mockMailMessage.prototype.commit = function () {
        this.committed = true;
    };

    mockMailMessage.prototype.moveToOutbox = function () {
        this.movedToOutbox = true;
    };

    var mockInvitesManager = function () {
        this.mails = [];
    };

    mockInvitesManager.prototype.mailFromEvent = function (event /*, account*/) {
        var mail = new mockMailMessage();
        mail.subject = event.subject;
        this.mails.push(mail);
        return mail;
    };
    mockInvitesManager.prototype.sendMeetingResponse = function () {
    };
    mockInvitesManager.prototype.createResponseMail = function (event, msg, response /*, account*/) {
        this._response = response;
    };

    Root.prototype.setupMail = function () {
        invitesManager = new mockInvitesManager();
    };

    // retrieves calendar index with specific 'name'
    function calendarByName(name) {
        var calendars = eventDetails._calendarSelector._calendars;

        for (var i = 0, length = calendars.length; i < length; ++i) {
            if (calendars[i].name === name) {
                return i;
            }
        }

        return 0;
    }

    function dumpStore() {
        calendarManager.dumpStore();
    }

    //
    // Setup
    //
    function setup(tc) {
        Tx.chkObj(tc);

        var body = document.body;

        // Create calendar app div and insert it
        div = document.createElement("div");
        div.id = "calendarApp";
        body.insertBefore(div, body.firstChild);


        // Create root component
        root = new Root();

        // Remove animations
        eventDetails._animateIn = Jx.fnEmpty;
        eventDetails._animateOut = (function (command, targetEvent) {
            this._close(targetEvent);
        }).bind(eventDetails);

        // Create calendar manager and calendar
        var wlt = Microsoft.WindowsLive.Platform.Test;

        harness  = wlt.ClientTestHarness("calendarTest", wlt.PluginsToStart.none, "account@calendarmanager.default");
        platform = harness.client;

        // prepare our test calendar
        calendarManager = platform.calendarManager;

        tc.log("Dumping store.");
        dumpStore();

        tc.log("Getting default account.");
        account = platform.accountManager.defaultAccount;
        tc.log("Default account retrieved, id=" + account.objectId + ", " + account.displayName + " <" + account.emailAddress + ">");

        calendar = calendarManager.addDefaultCalendar(account, "Default Calendar");

        // create the jobset
        jobset = new MockJobset();

        // Listen to events
        Jx.EventManager.addListener(root, "getAppBar", root.onGetAppBar, root);
        Jx.EventManager.addListener(root, "getSettings", root.onGetSettings, root);
        Jx.EventManager.addListener(root, "getPlatform", root.onGetPlatform, root);
        Jx.EventManager.addListener(root, "finishedEditing", root.onFinishedEditing, root);
        Jx.EventManager.addListener(root, "showFlyout", root.onShowFlyout, root);
        testDate = new Date(2011, 6, 28, 18, 30);

        shownFlyout = false;
        launchedMail = false;
        Calendar.Helpers.launchMail = function () { launchedMail = true; };
        Calendar.Helpers.showFlyout = function () { shownFlyout = true; };
        Calendar.Helpers.showMenu = function () { shownFlyout = true; };

        _settings = {
            data: {},
            get: function(key) {return _settings.data[key];},
            set: function(key, value) {_settings.data[key] = value;}
        };

        // Set up a couple of dates
        var nowDate = new Date(Date.now());
        futureDate1 = new Date(nowDate.getTime());
        futureDate1.setFullYear(nowDate.getFullYear() + 1);
        futureDate2 = new Date(futureDate1.getTime() + Helpers.hourInMilliseconds);

        pastDate1 = new Date(nowDate.getTime());
        pastDate1.setFullYear(nowDate.getFullYear() - 1);
        pastDate2 = new Date(pastDate1.getTime() + Helpers.hourInMilliseconds);
    }

    function unloadUI() {
        eventDetails.deactivateUI();

        elems = {};
        div.innerHTML = "";
        uiLoaded = false;
    }

    function cleanup() {
        // clean up the jobset
        jobset.dispose();
        jobset = null;

        Calendar.Helpers.launchMail = realLaunchMail;
        Calendar.Helpers.showFlyout = realShowFlyout;
        Calendar.Helpers.showMenu = realShowMenu;

        // Remove event listeners
        Jx.EventManager.removeListener(root, "getAppBar", root.onGetAppBar, root);
        Jx.EventManager.removeListener(root, "getSettings", root.onGetSettings, root);
        Jx.EventManager.removeListener(root, "getPlatform", root.onGetPlatform, root);
        Jx.EventManager.removeListener(root, "finishedEditing", root.onFinishedEditing, root);
        Jx.EventManager.removeListener(root, "showFlyout", root.onShowFlyout, root);

        // Clean up calendar
        dumpStore();

        // Clean up DOM
        if (uiLoaded) {
            unloadUI();
        }
        document.body.removeChild(div);
        div = null;
    }

    // if async is not true then force synchronous execution of activateUI.
    function loadUI(tc, async) {
        Tx.chkObj(tc);

        if (uiLoaded) {
            unloadUI();
        }

        tc.log("getUI");
        div.innerHTML =
            Jx.getUI(eventDetails).html +
            // fake buttons
            '<button id="cedSave" type="button">Save<button>' +
            '<button id="cedRespond" type="button">Respond<button>' +
            '<button id="deleteCommand" type="button">Delete<button>';

        tc.log("activateUI");
        if (async) {
            eventDetails.activateUI(jobset);
        } else {
            runSync(eventDetails.activateUI.bind(eventDetails, jobset));
        }

        tc.log("elems");

        elems = {};
        elems.subject = document.getElementById("EventTitleTextbox");
        elems.location = document.getElementById("LocationTextbox");
        elems.allDay = document.getElementById("AlldayCheckbox");
        elems.startDate = eventDetails._controls.startDate;
        elems.startTime = eventDetails._controls.startTime;
        elems.endDate = eventDetails._controls.endDate;
        elems.endDateCombo = document.getElementById("EndDateCombo");
        elems.endTime = eventDetails._controls.endTime;
        elems.duration = document.getElementById("EventDuration");
        elems.recurrence = document.getElementById("RecurrenceCombo");
        elems.reminder = document.getElementById("ReminderCombo");
        elems.busyStatus = document.getElementById("StatusCombo");
        elems.sensitivity = document.getElementById("PrivateCheckbox");
        elems.yourResponse = document.getElementById("yourResponse");
        elems.calendar = $(".CalendarSelector").get(0);
        elems.notes = eventDetails._canvasControl;
        elems.guests = document.getElementById("GuestsCombo");
        elems.endCustom = document.getElementById("EndCustom");
        elems.showMore = document.getElementById("ShowMore");
        elems.setEndOccurrenceButton = document.getElementById("SetEndOccurrenceButton");
        elems.clearEndOccurrenceButton = document.getElementById("ClearEndOccurrenceButton");

        finishedEditing = false;

        uiLoaded = true;
    }

    Tx.test("EventDetailsTests.testControls", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        eventDetails.createEvent({startDate: testDate});

        tc.log("loadUI");
        loadUI(tc);

        tc.log("elems");
        for (var element in elems) {
            tc.isNotNull(elems[element], "Couldn't find " + element + " element.");
        }
    });

    function getSelectedCalendarID() {
        var calendarSelector = eventDetails._calendarSelector;
        var calendar = calendarSelector._calendars[calendarSelector._selectedCalendar];
        return calendar.calendar.id;
    }

    Tx.test("EventDetailsTests.testCalendars", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        tc.log("Removing the sticky calendar id from appsettings.");
        new Jx.AppData().localSettings().remove("lastCalendarId");

        // Add test-specific calendars
        tc.log("Adding test calendars...");
        calendarManager.addCalendar(account, "Sticky Calendar");
        calendarManager.addCalendar(account, "AAA First in list calendar");
        tc.log("...done");

        tc.log("Creating test event (should default to 'Default Calendar').");
        eventDetails.createEvent({startDate: testDate});
        loadUI(tc);

        tc.log("Checking the number of calendars.");
        var numCalendars = calendarManager.getAllCalendars().count;
        tc.log(numCalendars + " calendar(s) detected.");
        if (numCalendars < 2) {
            throw "Should be more than one calendar present.";
        }

        // Since we have more than one calendar, check that the calendar combo is visible
        tc.log("Checking selected calendar.");
        var selectedId = getSelectedCalendarID();
        tc.log("Selected calendar Id = " + selectedId);
        tc.isTrue(selectedId == calendarManager.defaultCalendar.id,
            "Calendar selected (" + selectedId + ") is not default (" + calendarManager.defaultCalendar.id + ")");

        // Let's select 'Sticky Calendar' and see if it sticks.
        tc.log("Selecting sticky calendar");
        var calendarIndex = calendarByName("Sticky Calendar");
        var stickyId = eventDetails._calendars[calendarIndex].calendar.id;
        eventDetails._calendarSelector.updateSelectionByIndex(calendarIndex);

        elems.subject.value = "Sticky subject";
        elems.location.value = "Sticky location";

        tc.log("Saving event...");
        eventDetails._onSave();
        tc.log("...saved, id = " + savedEventId);
        tc.log("Checking event calendar to be 'Sticky Calendar'...");
        var savedEvent = calendarManager.getEventFromID(savedEventId);
        tc.isTrue(!!savedEvent, "Cannot load saved event");
        if (savedEvent.calendar.id == stickyId) {
            tc.log("...match.");
        } else {
            throw "...not a sticky calendar.";
        }

        tc.log("Repopulating event details view with sticky event in 'edit' mode...");
        eventDetails.editEvent(savedEvent);
        loadUI(tc);
        tc.log("...done.");


        tc.log("Checking calendar selected by default...");
        selectedId = getSelectedCalendarID();
        tc.log("...calendar id = " + selectedId + " is selected" + (selectedId == stickyId) ? ", as expected" : "NOT EXPECTED");
        tc.isTrue(selectedId == stickyId, "Expected sticky calendar to be selected, something else is selected instead. 1");

        tc.log("Deleting saved event...");
        savedEvent.deleteObject();
        tc.log("...deleted.");

        tc.log("Repopulating event details view...");
        eventDetails.createEvent({startDate: testDate});
        loadUI(tc);
        tc.log("...done.");

        tc.log("Checking calendar selected by default...");
        selectedId = getSelectedCalendarID();
        tc.log("...calendar id = " + selectedId + " is selected" + ((selectedId == stickyId) ? ", as expected" : ", NOT EXPECTED"));
        tc.isTrue(selectedId == stickyId, "Expected sticky calendar to be selected, something else is selected instead. 2");

        tc.log("Dumping store...");
        dumpStore();
        tc.log("...done.");

        tc.log("Recreating default and AAA calendars...");
        calendarManager.addDefaultCalendar(account, "Default Calendar");
        calendarManager.addCalendar(account, "AAA First in list calendar");
        tc.log("...done.");

        tc.log("Repopulating event details view...");
        eventDetails.createEvent({startDate: testDate});
        loadUI(tc);
        tc.log("...done.");

        tc.log("Checking calendar selected by default...");
        selectedId = getSelectedCalendarID();
        tc.log("...calendar id = " + selectedId + " is selected" + ((selectedId == calendarManager.defaultCalendar.id) ? ", as expected" : ", NOT EXPECTED"));
        tc.isTrue(selectedId == calendarManager.defaultCalendar.id, "Expected default calendar to be selected, something else is selected instead.");

        tc.log("Cleaning up lastCalendarId appdata setting...");
        new Jx.AppData().localSettings().remove("lastCalendarId");
        tc.log("...done");
    });

    Tx.test("EventDetailsTests.testCustomDuration", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        eventDetails.createEvent({startDate: testDate});
        loadUI(tc);

        // Ensure end date hidden
        tc.areEqual("true", elems.endDateCombo.parentNode.getAttribute("aria-hidden"), "End date should be hidden");

        // Change duration to Custom
        elems.duration.selectedIndex = EventDetails.durationCustom;
        var ev = { target: elems.duration };
        eventDetails._onDurationChanged(ev);

        tc.isNull(elems.duration.parentNode, "Duration item should be removed");
        tc.areEqual("false", elems.endDateCombo.parentNode.getAttribute("aria-hidden"), "End date should be visible");
    });

    Tx.test("EventDetailsTests.testEndDate", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        eventDetails.createEvent({startDate: testDate});
        loadUI(tc);

        tc.areEqual(false, eventDetails._initEvent.recurring, "New Events should not be recurring");
        tc.areEqual("true", elems.endCustom.getAttribute("aria-hidden"), "End recurrence parent should be hidden");

        eventDetails._onShowMore();

        // Change recurrence to every day
        elems.recurrence.selectedIndex = 1;
        eventDetails._endOccurrence.update();
        tc.areEqual("false", elems.endCustom.getAttribute("aria-hidden"), "End recurrence parent should be visible");
        tc.areEqual("false", elems.setEndOccurrenceButton.getAttribute("aria-hidden"), "Set End recurrence button should be visible");
        tc.areEqual("true", elems.clearEndOccurrenceButton.getAttribute("aria-hidden"), "Clear End recurrence button should be hidden");

        eventDetails._endOccurrence._setEndOccurance();
        tc.areEqual("true", elems.setEndOccurrenceButton.getAttribute("aria-hidden"), "Set End recurrence button should be hidden");
        tc.areEqual("false", elems.clearEndOccurrenceButton.getAttribute("aria-hidden"), "Clear End recurrence button should be visible");

        eventDetails._endOccurrence._clearEndOccurance();
        tc.areEqual("false", elems.setEndOccurrenceButton.getAttribute("aria-hidden"), "Set End recurrence button should be visible again");
        tc.areEqual("true", elems.clearEndOccurrenceButton.getAttribute("aria-hidden"), "Clear End recurrence button should be hidden again");

        // Change recurrence to once
        elems.recurrence.selectedIndex = 0;
        eventDetails._endOccurrence.update();
        tc.areEqual("true", elems.endCustom.getAttribute("aria-hidden"), "End recurrence parent should be hidden again");

        // Change recurrence to every day
        elems.recurrence.selectedIndex = 1;
        eventDetails._endOccurrence.update();
        eventDetails._endOccurrence._setEndOccurance();

        // Change recurrence to once
        elems.recurrence.selectedIndex = 0;
        eventDetails._endOccurrence.update();
        tc.areEqual("true", elems.endCustom.getAttribute("aria-hidden"), "End recurrence parent should be hidden again 2");

        // Change recurrence to every day
        elems.recurrence.selectedIndex = 1;
        eventDetails._endOccurrence.update();

        // settings the recurrence to once should should hide the parent element
        tc.areEqual("false", elems.endCustom.getAttribute("aria-hidden"), "End recurrence parent should be visible again");
    });

    Tx.test("EventDetailsTests.testAllDay", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Create all day event
        var startDate = new Date(testDate.getYear(), testDate.getMonth(),
                                 testDate.getDate());
        eventDetails.createEvent({ startDate: startDate, allDayEvent: true });
        loadUI(tc);

        // Ensure all day chosen
        tc.areEqual(EventDetails.durationAllDay, elems.duration.selectedIndex, "Duration should be all day");

        eventDetails.createEvent({startDate: testDate});
        loadUI(tc);

        // Change duration to Custom
        elems.duration.selectedIndex = EventDetails.durationCustom;
        var ev = { target: elems.duration };
        eventDetails._onDurationChanged(ev);

        var initStart = new Date("07/28/2011 5:45 PM");
        var initEnd = new Date("07/28/2011 7:20 PM");

        // Set initial values on fields that will change
        elems.reminder.selectedIndex = 0;
        elems.busyStatus.selectedIndex = 1;
        eventDetails._setStartDate(new Date(initStart));
        elems.startTime.current = new Date(initStart);
        eventDetails._setEndDate(new Date(initEnd));
        elems.endTime.current = new Date(initEnd);

        var controls = eventDetails._controls;

        // Check All Day
        elems.allDay.checked = true;
        ev = { target: elems.allDay };
        eventDetails._onAllDayChanged(ev);

        tc.isTrue(controls.startTime._disabled, "All day checkbox should disable start time");
        tc.isTrue(controls.endTime._disabled, "All day checkbox should disable end time");

        tc.areEqual(Calendar.DEFAULT_ALLDAY_EVENT_REMINDER, parseInt(value(elems.reminder), 10), "All day checkbox should update reminder");
        tc.areEqual(EventDetails.statusFree, elems.busyStatus.selectedIndex, "All day checkbox should update status");
        tc.isTrue(controls.startTime.current.getHours() === 0 && controls.startTime.current.getMinutes() === 0, "All day checkbox should set start time");
        tc.isTrue(controls.endTime.current.getHours() === 0 && controls.endTime.current.getMinutes() === 0, "All day checkbox should set end time");

        // Restore previous values
        elems.allDay.checked = false;
        eventDetails._onAllDayChanged(ev);

        tc.isFalse(controls.startTime._disabled, "Start time should be enabled");
        tc.isFalse(controls.endTime._disabled, "End time should be enabled");

        tc.areEqual(0, elems.reminder.selectedIndex, "Reminder should be set back");
        tc.areEqual(1, elems.busyStatus.selectedIndex, "Status should be set back");
        var newStart = eventDetails._getDateFromControls(elems.startDate, elems.startTime);
        tc.isTrue(newStart - initStart === 0, "End time should be set back");
        var newEnd = eventDetails._getDateFromControls(elems.endDate, elems.endTime);
        tc.isTrue(newEnd - initEnd === 0, "End time should be set back");
    });

    Tx.test("EventDetailsTests.testAttendees", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var event = calendar.createEvent();
        event.startDate = testDate;
        event.endDate = new Date(testDate.getTime() + Helpers.hourInMilliseconds);
        event.addAttendee("", "att1@hotmail.com");
        event.addAttendee("", "att2@hotmail.com");
        event.addAttendee("", "att3@hotmail.com");
        event.commit();
        var attendees = event.getAttendees();
        root.waitForAttendees(tc, 10000, attendees, 3, true);

        eventDetails.editEvent(event);
        loadUI(tc);

        var toDelete = attendees.item(1);
        eventDetails._who.clear();
        eventDetails._who.addRecipientsByString(attendees.item(0).email + ", " + attendees.item(2).email + ", " + "att4@hotmail.com");

        var att = eventDetails._parseAttendees();
        tc.areEqual(1, att.added.length, "parseAttendees should have returned one added attendee.");
        tc.areEqual("att4@hotmail.com", att.added[0].emailAddress, "parseAttendees should have returned the added attendee.");
        tc.areEqual(1, att.deleted.length, "parseAttendees should have returned one deleted attendee.");
        tc.areEqual(toDelete.email, att.deleted[0].email, "parseAttendees should have returned the deleted attendee.");
    });

    Tx.test("EventDetailsTests.testExistingEvent", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var event = calendar.createEvent();
        event.startDate = new Date(2011,6,28,6,30);
        event.endDate = new Date(2011,6,28,9,0);
        event.commit();

        eventDetails.editEvent(event);
        loadUI(tc);

        tc.isNull(elems.duration, "Duration item should be removed");
        tc.areEqual("false", elems.endDateCombo.parentNode.getAttribute("aria-hidden"), "End date should be visible");

        var startDate = eventDetails._getDateFromControls(elems.startDate, elems.startTime);
        tc.isTrue(startDate - event.startDate === 0, "Start date should be set on custom event.");
        var endDate = eventDetails._getDateFromControls(elems.endDate, elems.endTime);
        tc.isTrue(endDate - event.endDate === 0, "End date should be set on custom event.");
    });

    Tx.test("EventDetailsTests.testSave", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var event = calendar.createEvent();
        event.startDate = new Date(2011,6,28,6,30);
        event.endDate = new Date(2011,6,28,8,0);
        event.subject = "Event subject";
        event.location = "Event location";
        event.reminder = 30;
        event.busyStatus = 1;
        event.sensitivity = 1;
        event.recurring = true;
        event.recurrenceType = 1;
        event.dayOfWeek = 4;
        event.data = "<strong>Event</strong> description";
        event.dataType = Microsoft.WindowsLive.Platform.Calendar.DataType.html;
        event.commit();

        eventDetails.editEvent(event);
        loadUI(tc);

        // Verify populated details
        tc.areEqual("Event subject", value(elems.subject));
        tc.areEqual("Event location", value(elems.location));
        tc.areEqual("30", value(elems.reminder));
        tc.areEqual("1", value(elems.busyStatus));
        tc.isTrue(elems.sensitivity.checked);
        tc.isTrue(eventDetails._initEvent.description === "<strong>Event</strong> description");
        tc.areEqual(EventDetails.recurrences.Daily, elems.recurrence.selectedIndex);

        elems.subject.value = "New subject";
        elems.location.value = "New location";
        elems.reminder.value = "60";
        elems.busyStatus.value = "2";
        elems.recurrence.selectedIndex = EventDetails.recurrences.Monthly;

        // Sensitivity should not change
        event.sensitivity = 0;

        eventDetails._onSave();
        tc.isTrue(finishedEditing);

        // Verify new details
        tc.areEqual("New subject", event.subject);
        tc.areEqual("New location", event.location);
        tc.areEqual(60, event.reminder);
        tc.areEqual(2, event.busyStatus);
        tc.areEqual(0, event.sensitivity);
        tc.areEqual(true, event.recurring);
        tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.monthly, event.recurrence.recurrenceType);
    });

    Tx.test("EventDetailsTests.testRecurrenceExceptions", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        tc.log("Create a series");
        var seriesStart = new Date(2011, 6, 28, 18, 30);
        eventDetails.createEvent({startDate: seriesStart});
        loadUI(tc);

        tc.log("Save");
        elems.recurrence.selectedIndex = EventDetails.recurrences.Weekdays;
        elems.subject.value = "Event subject";
        eventDetails._onSave();

        var event = eventDetails._targetEvent;
        tc.areNotEqual(0, event.id, "Target event should have been commited");

        tc.areEqual(Microsoft.WindowsLive.Platform.Calendar.RecurrenceType.weekly, event.recurrence.recurrenceType, "Recurrence type should be weekly");
        tc.areEqual(62, event.recurrence.dayOfWeek, "Recurrence should be set for weekdays");

        tc.log("Create an exception");
        var occurrenceStart = new Date(seriesStart);
        occurrenceStart.setDate(seriesStart.getDate() + 1);
        var occurrence = event.getOccurrence(occurrenceStart);
        eventDetails.editEvent(occurrence);
        tc.isTrue(occurrenceStart - eventDetails._targetEvent.startDate === 0, "EventDetails should have found occurrence of series");

        tc.log("Load UI");
        loadUI(tc);
        elems.subject.value = "Exception subject";
        tc.isTrue(elems.recurrence.readOnly, "Recurrence combo should be disabled for instance of event");
        //tc.isTrue(elems.recurrence.disabled, "Recurrence combo should be disabled for instance of event");
        eventDetails._onSave();
        tc.isTrue(event.exceptions, "Event should have been saved to become an exception");

        tc.log("Edit the series");
        eventDetails.editEvent(event);
        loadUI(tc);
        tc.isTrue(!elems.recurrence.readOnly, "Recurrence combo should be enabled for a series");
        tc.areEqual(EventDetails.recurrences.Weekdays, elems.recurrence.selectedIndex, "Recurrence combo should populate properly");

        tc.log("Save 2");
        var newStartDate = new Date(eventDetails._controls.startDate);
        newStartDate.setDate(newStartDate.getDate() + 1);
        eventDetails._setStartDate(newStartDate);
        eventDetails._onSave();

        event = eventDetails._targetEvent;
        tc.isTrue(event.exceptions, "Exceptions should not have been deleted without prompting");
        tc.isTrue(shownFlyout, "Flyout was not shown");
    });

    Tx.test("EventDetailsTests.testSend", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        tc.log("Part 1 -----------");

        tc.log("Setup mail");
        root.setupMail();

        tc.log("Create event");
        var event = calendar.createEvent();
        event.startDate = testDate;
        event.endDate = new Date(testDate.getTime() + Helpers.hourInMilliseconds);
        event.subject = "Event subject";
        event.location = "Event location";
        event.reminder = 30;
        event.busyStatus = 1;
        event.sensitivity = 1;
        event.commit();

        tc.log("Edit event");
        eventDetails.editEvent(event);

        tc.log("Load UI");
        loadUI(tc);

        eventDetails._who.addRecipientsByString("attendee@hotmail.com, attendee2@hotmail.com");
        tc.log("Send");
        eventDetails._onSend({});
        tc.isTrue(finishedEditing);

        tc.log("Verify mail properties");
        tc.areEqual(1, invitesManager.mails.length, "Only one mail should have been created");
        tc.areEqual('attendee@hotmail.com; attendee2@hotmail.com; ', invitesManager.mails[0].to);
        tc.areEqual("Event subject", invitesManager.mails[0].subject);
        tc.isTrue(invitesManager.mails[0].committed);

        tc.log("Part 2 -----------");

        invitesManager.mails = new Array(0);

        tc.log("Edit event");
        eventDetails.editEvent(event);

        tc.log("Load UI");
        loadUI(tc);

        tc.log("Update attendees only");
        eventDetails._who.clear();
        eventDetails._who.addRecipientsByString("attendee2@hotmail.com; attendee3@hotmail.com; attendee4@hotmail.com");
        eventDetails._onSend({});
        tc.isTrue(finishedEditing);

        tc.log("Verify mail properties");
        tc.areEqual(2, invitesManager.mails.length, "Two mails should have been created");
        tc.areEqual("attendee@hotmail.com; ", invitesManager.mails[0].to);
        tc.areEqual(Jx.res.getString("EventCancelledPrefix") + "Event subject", invitesManager.mails[0].subject);
        tc.isTrue(invitesManager.mails[0].committed);
        tc.areEqual("attendee2@hotmail.com; attendee3@hotmail.com; attendee4@hotmail.com; ", invitesManager.mails[1].to);
        tc.areEqual("Event subject", invitesManager.mails[1].subject);
        tc.isTrue(invitesManager.mails[1].committed);

        tc.log("Part 3 -----------");

        tc.log("Update another field");
        invitesManager.mails = new Array(0);
        eventDetails.editEvent(event);
        eventDetails._who.clear();
        loadUI(tc);

        tc.areEqual('"attendee2@hotmail.com" <attendee2@hotmail.com>;"attendee3@hotmail.com" <attendee3@hotmail.com>;"attendee4@hotmail.com" <attendee4@hotmail.com>;',
                                 eventDetails._who.getRecipientsStringInNameEmailPairs(), "Updated attendees list should have been saved");
        elems.location.value = "New location";
        tc.log("Send");
        eventDetails._onSend({});
        tc.isTrue(finishedEditing);

        tc.areEqual(1, invitesManager.mails.length, "One mail should have been created");
        tc.areEqual("attendee2@hotmail.com; attendee3@hotmail.com; attendee4@hotmail.com; ", invitesManager.mails[0].to);
        tc.isTrue(invitesManager.mails[0].committed);
    });

    Tx.test("EventDetailsTests.testIsDirty", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        tc.log("Create event");
        var event = calendar.createEvent();
        event.startDate = testDate;
        event.endDate = new Date(testDate.getTime() + Helpers.hourInMilliseconds);
        event.subject = "Event subject";
        event.location = "Event location";
        event.reminder = 30;
        event.busyStatus = 1;
        event.sensitivity = 1;
        event.dataType = Microsoft.WindowsLive.Platform.Calendar.DataType.html;
        event.data = "<a href='http://wwww.bing.com'>Bing! <img src='http://www.bing.com/fd/s/a/hpc3.png'/></a>";
        event.commit();

        // runSync replaces windows functions that are async and then runs them synchronously.
        runSync(function() {
            tc.log("Edit event");
            eventDetails.editEvent(event);

            tc.log("Load UI");
            loadUI(tc, true);

            // mock calendar account support for html
            eventDetails._capabilities = 1; //html

            // This is false because of the canvasContentLoaded flag.
            tc.isFalse(eventDetails._isDirty(), "Canvas adds style information to html content.");
        }, this);

        tc.isFalse(eventDetails._isDirty(), "Delayed isDirty state should be false.");
    });

    Tx.test("EventDetailsTests.testOnDelete", function testOnDelete (tc) {
        /// <summary>Verifies various behaviors in _onDelete</summary>

        var MeetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus;

        tc.cleanup = cleanup;
        setup(tc);

        tc.log("Setup mail");
        root.setupMail();

        tc.log("Test case: Deleting a past event");
        var event = calendar.createEvent();
        var startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        event.startDate = startDate;
        event.endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        event.commit();

        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("onDelete");
        var fakeDomEvent = { currentTarget: document.getElementById("deleteCommand") };
        eventDetails._onDelete(fakeDomEvent);
        tc.isTrue(shownFlyout, "Flyout should have been shown");

        tc.log("Test case: Cancel a meeting");
        event = calendar.createEvent();
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 5);
        event.startDate = startDate;
        event.endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        event.addAttendee("", "att1@hotmail.com");
        event.meetingStatus = MeetingStatus.isAMeeting;
        event.commit();

        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("onDelete");
        fakeDomEvent = { currentTarget: document.getElementById("deleteCommand") };
        eventDetails._onDelete(fakeDomEvent);
        tc.isTrue(shownFlyout, "Flyout should have been shown");

        tc.log("Test case: Delete a cancelled meeting as attendee");
        event = calendar.createEvent();
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 5);
        event.startDate = startDate;
        event.endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        event.addAttendee("", "att1@hotmail.com");
        event.meetingStatus = MeetingStatus.isAMeeting | MeetingStatus.isCanceled | MeetingStatus.isReceived; // Should mark the meeting as cancelled and the current user is an attendee
        event.commit();

        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("onDelete");
        fakeDomEvent = { currentTarget: document.getElementById("deleteCommand") };
        eventDetails._onDelete(fakeDomEvent);
        tc.isTrue(shownFlyout, "Flyout should have been shown");

        var deleted = false;
        try {
            event = platform.calendarManager.getEventFromID(event.id);
        } catch (ex1) {
            tc.log("Deleted");
            deleted = true;
        }
        // When deleting a canceled event we delete without the confirmation dialog.
        tc.isTrue(deleted, "Event should have been deleted");
    });

    Tx.test("EventDetailsTests.testDelete", function testDelete(tc) {
        /// <summary>Verifies _deleteEvent</summary>

        tc.cleanup = cleanup;
        setup(tc);

        tc.log("Setup mail");
        root.setupMail();

        tc.log("Deleting a past event");
        var event = calendar.createEvent();
        var startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        event.startDate = startDate;
        event.endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        event.commit();

        tc.log("Edit event");
        eventDetails.editEvent(event);

        tc.log("Load UI");
        loadUI(tc);

        tc.log("Delete");
        eventDetails._deleteEvent();

        tc.log("getEventFromID");
        var deleted = false;
        try {
            event = platform.calendarManager.getEventFromID(event.id);
        } catch (ex1) {
            tc.log("Deleted");
            deleted = true;
        }
        tc.isTrue(deleted, "Event should have been deleted");
    });

    Tx.test("EventDetailsTests.testRespondAdditionalActions", function (tc) {
        /// <summary>Verifies that responding to an event changes the busy status for accept/tentative and deletes the event for decline.</summary>

        tc.cleanup = cleanup;
        setup(tc);

        root.setupMail();
        var ResponseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType;

        var event = calendar.createEvent();
        var startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        event.startDate = startDate;
        event.endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        var self = event.addAttendee("", platform.accountManager.defaultAccount.emailAddress);
        self.responseType = ResponseType.notResponded;
        harness.store.setObjectProperty(event, Microsoft.WindowsLive.Platform.Test.STOREPROPERTYID.idPropertyResponseType, String(ResponseType.notResponded));
        event.commit();

        var attendees = event.getAttendees();
        root.waitForAttendees(tc, 5000, attendees, 1, true);
        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("respond tentative");
        eventDetails._respondEx(ResponseType.tentative, true);
        tc.areEqual(ResponseType.tentative, invitesManager._response, "Response type (tentative) should have been set");
        tc.isTrue(finishedEditing);

        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("respond declined");
        eventDetails._respondEx(ResponseType.declined, true);
        tc.areEqual(ResponseType.declined, invitesManager._response, "Response type (declined) should have been set");
        tc.isTrue(finishedEditing);

        var deleted = false;
        try {
            event = platform.calendarManager.getEventFromID(event.id);
        } catch (x) {
            deleted = true;
        }
        tc.isTrue(deleted, "Event should have been deleted");
    });

    Tx.test("EventDetailsTests.testRespondMailProperties", function (tc) {
        /// <summary>Verifies that the response mail properties are set up correctly</summary>

        tc.cleanup = cleanup;
        setup(tc);

        root.setupMail();
        var ResponseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType;

        var event = calendar.createEvent();
        var organizerEmail = event.organizerEmail;
        var startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        event.startDate = startDate;
        event.endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        var self = event.addAttendee("", platform.accountManager.defaultAccount.emailAddress);
        self.responseType = ResponseType.notResponded;
        harness.store.setObjectProperty(event, Microsoft.WindowsLive.Platform.Test.STOREPROPERTYID.idPropertyResponseType, String(ResponseType.notResponded));
        event.commit();

        var mockMail = new mockMailMessage();

        mockInvitesManager.prototype.createResponseMail = function () { // (event, msg, response, account)
            mockMail.to = organizerEmail;
            return mockMail;
        };

        var attendees = event.getAttendees();
        root.waitForAttendees(tc, 5000, attendees, 1, true);
        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("respond tentative");
        eventDetails._respondEx(ResponseType.tentative, true);
        tc.isTrue(finishedEditing);

        // Check mail properties
        tc.isTrue(mockMail.committed, "committed");
        tc.areEqual(organizerEmail, mockMail.to, "to");

        // Reset for next test case
        mockMail = new mockMailMessage();
        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("respond declined");
        eventDetails._respondEx(ResponseType.declined, true);
        tc.isTrue(finishedEditing);

        // Check mail properties
        tc.isTrue(mockMail.committed, "committed");
        tc.areEqual(organizerEmail, mockMail.to, "to");
    });

    Tx.test("EventDetailsTests.testReplyForwardWithChanges", function (tc) {
        /// <summary>Verifies that the only action performed when replying to a changed meeting is to open mail</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._validate = function () { return true; };
        eventDetails._shouldShowSendButton = function () { return false; };
        eventDetails._updateEvent = function () { return true; };
        eventDetails._commitEvent = function () { throw "Unexpected call to commit"; };
        eventDetails._sendEvent = function () { throw "Unexpected call to send"; };
        eventDetails._close = function () { throw "Unexpected call to close"; };
        
        eventDetails._replyForward(Calendar.MailAction.reply);
        tc.isTrue(launchedMail, "Mail should have been launched");
    });

    Tx.test("EventDetailsTests.testReplyForwardWithChangesAsForward", function (tc) {
        /// <summary>Verifies that when forwarding a changed meeting, it commits and saves, then closes event details</summary>

        tc.cleanup = cleanup;
        setup(tc);

        var closed = false;
        var committed = false;

        eventDetails._validate = function () { return true; };
        eventDetails._shouldShowSendButton = function () { return false; };
        eventDetails._updateEvent = function () { return true; };
        eventDetails._commitEvent = function () { committed = true; return true; };
        eventDetails._sendEvent = function () { throw "Unexpected call to send"; };
        eventDetails._close = function () { closed = true; };
        
        eventDetails._replyForward(Calendar.MailAction.forward);

        tc.isTrue(committed, "Expected call to save event");
        tc.isTrue(launchedMail, "Mail should have been launched");
        tc.isTrue(closed, "Event details should have been closed");
    });

    Tx.test("EventDetailsTests.testReplyForwardWithChangesOrganizer", function (tc) {
        /// <summary>Verifies that changes are sent to recipients when forwarding a meeting with changes</summary>

        tc.cleanup = cleanup;
        setup(tc);

        var closed = false;
        var committed = false;
        var sentEvent = false;

        eventDetails._validate = function () { return true; };
        eventDetails._shouldShowSendButton = function () { return true; };
        eventDetails._updateEvent = function () { return true; };
        eventDetails._commitEvent = function () { committed = true; return true; };
        eventDetails._sendEvent = function () { sentEvent = true; return true; };
        eventDetails._close = function () { closed = true; };

        eventDetails._replyForward(Calendar.MailAction.forward);

        tc.isTrue(sentEvent, "Expected call to send event");
        tc.isTrue(launchedMail, "Mail should have been launched");
        tc.isTrue(closed, "Event details should have been closed");
    });

    Tx.test("EventDetailsTests.testReplyForwardValidateFailsAsForward", function (tc) {
        /// <summary>Verifies that if validation fails during a forward, we don't launch mail or close the page</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._validate = function () { return false; }; // set up validate fail
        eventDetails._shouldShowSendButton = function () { return false; };
        eventDetails._updateEvent = function () { return true; };
        eventDetails._commitEvent = function () { throw "Unexpected call to commit"; };
        eventDetails._sendEvent = function () { throw "Unexpected call to send"; };
        eventDetails._close = function () { throw "Unexpected call to close"; };

        // Mostly verifies that the above asserts are not hit
        eventDetails._replyForward(Calendar.MailAction.forward);
        tc.isFalse(launchedMail, "Unexpected launch of mail app");
    });

    Tx.test("EventDetailsTests.testReplyForwardSaveFails", function (tc) {
        /// <summary>Verifies that if the save fails, we don't launch mail or close the page</summary>

        tc.cleanup = cleanup;
        setup(tc);

        var sentEvent = false;

        eventDetails._validate = function () { return true; };
        eventDetails._shouldShowSendButton = function () { return true; };
        eventDetails._updateEvent = function () { return true; };
        eventDetails._commitEvent = function () { throw "Unexpected call to commit"; };
        eventDetails._sendEvent = function () { sentEvent = true; return false; }; // set up send fail
        eventDetails._close = function () { throw "Unexpected call to close"; };

        eventDetails._replyForward(Calendar.MailAction.forward);
        tc.isFalse(launchedMail, "Unexpected launch of mail app");
    });

    function getEventForCancelTest(attendeesCount) {
        /// <summary>Helper function for cancel tests creates target event with attendees</summary>

        var ResponseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType;

        var attendees = [];

        for (var i = 0; i < attendeesCount; i++) {
            attendees.push({ responseType: ResponseType.accepted });
        }

        var event = {
            getAttendees: function () {
                return {
                    item: function (index) { return attendees[index]; },
                    count: attendees.length
                };
            }
        };

        // Just needed for length test attendeeList.length
        eventDetails._initEvent = eventDetails._initEvent || {};
        eventDetails._initEvent.attendeeList = attendees;

        return event;
    }

    Tx.test("EventDetailsTests.testCancelEvent", function (tc) {
        /// <summary>Verifies that cancelEvent saves the event and launches mail</summary>

        tc.cleanup = cleanup;
        setup(tc);

        var loaded = false;
        var closed = false;

        eventDetails._reloadPlatformEvent = function () { loaded = true; };
        eventDetails._close = function () { closed = true; };
        eventDetails._deleteEvent = function () { throw "Unexpected call to deleteEvent"; };
        eventDetails._targetEvent = getEventForCancelTest(5);

        eventDetails._cancelEvent();

        tc.isTrue(loaded, "load");
        tc.isTrue(closed, "close");
        tc.isTrue(launchedMail, "Expected mail app to be launched");
    });

    Tx.test("EventDetailsTests.testCancelEventLoadFails", function (tc) {
        /// <summary>Verifies that if the load fails, we don't launch mail or close the page</summary>

        tc.cleanup = cleanup;
        setup(tc);

        var loaded = false;

        eventDetails._reloadPlatformEvent = function () { this._saveFailedBecauseOfDelete = true; loaded = true; };
        eventDetails._close = function () { throw "Unexpected call to close"; };
        eventDetails._deleteEvent = function () { throw "Unexpected call to deleteEvent"; };
        eventDetails._targetEvent = getEventForCancelTest(2);

        eventDetails._cancelEvent();

        tc.isTrue(loaded, "Invalid test setup: test did not attempt to load the event");
        tc.isFalse(launchedMail, "Unexpected launch of mail app");
    });

    Tx.test("EventDetailsTests.testCancelEventNoAttendees", function (tc) {
        /// <summary>Verifies cancelEvent when there are no attendees</summary>

        tc.cleanup = cleanup;
        setup(tc);

        // This may seem like a weird test but it's technically possible if the attendees were all removed via sync after the event details page was opened.

        var loaded = false;
        var deleted = false;

        eventDetails._reloadPlatformEvent = function () { loaded = true; };
        eventDetails._close = function () { throw "Unexpected call to close"; };
        eventDetails._deleteEvent = function () { deleted = true; };
        eventDetails._targetEvent = getEventForCancelTest(0);

        eventDetails._cancelEvent();

        tc.isTrue(loaded, "load");
        tc.isFalse(launchedMail, "Unexpected launch of mail app");
        tc.isTrue(deleted, "Delete");
    });

    function verifyMenuContents(tc, menuCommands, responseShouldShow, forwardShouldShow) {
        /// <summary>Helper function for testRespondMenu - verifies that the given menu state is correct</summary>
        /// <param name="responseShouldShow" type="Boolean"></param>
        /// <param name="forwardShouldShow" type="Boolean"></param>

        Tx.chkObj(tc);

        var forwardString = Jx.res.loadCompoundString("EventForward", Jx.key.getLabel("Ctrl+F"));
        var replyString = Jx.res.loadCompoundString("EventReply", Jx.key.getLabel("Ctrl+R"));
        var replyAllString = Jx.res.loadCompoundString("EventReplyAll", Jx.key.getLabel("Ctrl+Shift+R"));
        var acceptString = Jx.res.getString("EventAccept");
        var tentativeString = Jx.res.getString("EventTentative");
        var declineString = Jx.res.getString("EventDecline");

        var foundMenuItems = [];

        for (var i = 0; i < menuCommands.length; i++) {
            var label = menuCommands[i].label;
            if (label) {
                tc.isFalse(!!foundMenuItems[label], "Menu item label was found in menu multiple times");
                foundMenuItems[label] = true;
            }
        }

        tc.isTrue(foundMenuItems[replyString], "Reply should always be in the menu");
        tc.isTrue(foundMenuItems[replyAllString], "Reply-all should always be in the menu");
        tc.areEqual(responseShouldShow, !!foundMenuItems[acceptString], "Accept show state did not match");
        tc.areEqual(responseShouldShow, !!foundMenuItems[tentativeString], "Tentative show state did not match");
        tc.areEqual(responseShouldShow, !!foundMenuItems[declineString], "Decline show state did not match");
        tc.areEqual(forwardShouldShow, !!foundMenuItems[forwardString], "Forward show state did not match");
    }

    Tx.test("EventDetailsTests.testRespondMenu", function (tc) {
        /// <summary>Verifies various expected states of content in the respond menu</summary>

        tc.cleanup = cleanup;
        setup(tc);

        var ServerCapability = Microsoft.WindowsLive.Platform.Calendar.ServerCapability,
            MeetingStatus    = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus;

        var commandsShown   = null,
            editingEvent    = {},
            eventIsInPast   = false;

        Calendar.Helpers.showMenu = function (stuff) {
            commandsShown = stuff.commands;
        };

        eventDetails._targetEvent = editingEvent;
        eventDetails._isInPast = function () {
            return eventIsInPast;
        };

        eventDetails._isMailEnabled = function () {
            return true;
        };

        // For this case, everything should be in the menu.
        tc.log("Attendee looking at future single event");
        commandsShown = null;
        eventDetails._organizer = false;
        eventDetails._capabilities = ServerCapability.canForward | ServerCapability.canReplaceMime | ServerCapability.canRespond;
        eventIsInPast = false;
        editingEvent.meetingStatus = MeetingStatus.isAMeeting;
        tc.isTrue(eventDetails._canRespondSupport(), "Invalid test setup: respond support is not available");
        tc.isTrue(eventDetails._canForwardSupport(), "Invalid test setup: forward support is not available");

        eventDetails._onRespond({});

        verifyMenuContents(tc, commandsShown, true, true);

        // Verify A/T/D doesn't show up for meetings in the past
        // Forward also shouldn't show up
        tc.log("Attendee looking at past single event");
        commandsShown = null;
        eventDetails._organizer = false;
        eventDetails._capabilities = ServerCapability.canForward | ServerCapability.canReplaceMime | ServerCapability.canRespond;
        eventIsInPast = true;
        editingEvent.meetingStatus = MeetingStatus.isAMeeting;
        tc.isTrue(eventDetails._canRespondSupport(), "Invalid test setup: respond support is not available");
        tc.isTrue(eventDetails._canForwardSupport(), "Invalid test setup: forward support is not available");

        eventDetails._onRespond({});

        verifyMenuContents(tc, commandsShown, false, false);

        // Verify A/T/D doesn't show up for the organizer
        // Also forward
        tc.log("Organizer looking at future single event");
        commandsShown = null;
        eventDetails._organizer = true;
        eventDetails._capabilities = ServerCapability.canForward | ServerCapability.canReplaceMime | ServerCapability.canRespond;
        eventIsInPast = false;
        editingEvent.meetingStatus = MeetingStatus.isAMeeting;
        tc.isTrue(eventDetails._canRespondSupport(), "Invalid test setup: respond support is not available");
        tc.isTrue(eventDetails._canForwardSupport(), "Invalid test setup: forward support is not available");

        eventDetails._onRespond({});

        verifyMenuContents(tc, commandsShown, false, false);

        // Verify A/T/D doesn't show up if the server doesn't support it
        tc.log("Attendee looking at future single event without respond server support");
        commandsShown = null;
        eventDetails._organizer = false;
        eventDetails._capabilities = ServerCapability.canForward | ServerCapability.canReplaceMime;
        eventIsInPast = false;
        editingEvent.meetingStatus = MeetingStatus.isAMeeting;
        tc.isFalse(eventDetails._canRespondSupport(), "Invalid test setup: respond support should not be available");
        tc.isTrue(eventDetails._canForwardSupport(), "Invalid test setup: forward support is not available");

        eventDetails._onRespond({});

        verifyMenuContents(tc, commandsShown, false, true);

        // Verify forward doesn't show up if the server doesn't support replaceMime
        tc.log("Attendee looking at future single event without replaceMime server support");
        commandsShown = null;
        eventDetails._organizer = false;
        eventDetails._capabilities = ServerCapability.canForward | ServerCapability.canRespond;
        eventIsInPast = false;
        editingEvent.meetingStatus = MeetingStatus.isAMeeting;
        tc.isTrue(eventDetails._canRespondSupport(), "Invalid test setup: respond support is not available");
        tc.isFalse(eventDetails._canForwardSupport(), "Invalid test setup: forward support should not be available");

        eventDetails._onRespond({});

        verifyMenuContents(tc, commandsShown, true, false);

        // Verify A/T/D doesn't show up if the meeting is canceled
        tc.log("Attendee looking at future single event that has been canceled");
        commandsShown = null;
        eventDetails._organizer = false;
        eventDetails._capabilities = ServerCapability.canForward | ServerCapability.canReplaceMime | ServerCapability.canRespond;
        eventIsInPast = false;
        editingEvent.meetingStatus = MeetingStatus.isAMeeting | MeetingStatus.isCanceled;
        tc.isTrue(eventDetails._canRespondSupport(), "Invalid test setup: respond support is not available");
        tc.isTrue(eventDetails._canForwardSupport(), "Invalid test setup: forward support is not available");

        eventDetails._onRespond({});

        verifyMenuContents(tc, commandsShown, false, false);
    });

    Tx.test("EventDetailsTests.testIsInPast_Span", function (tc) {
        /// <summary>Test isInPast when the event starts in the past and ends in the future</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: pastDate1,
            endDate: futureDate1,
            recurring: false
        };
        eventDetails._eventType = EventDetails.eventType.Event;

        var result = eventDetails._isInPast();

        tc.isFalse(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_Past", function (tc) {
        /// <summary>Test isInPast when the event is non-recurring and in the past</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: pastDate1,
            endDate: pastDate2,
            recurring: false
        };
        eventDetails._eventType = EventDetails.eventType.Event;

        var result = eventDetails._isInPast();

        tc.isTrue(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_Future", function (tc) {
        /// <summary>Test isInPast when the event is non-recurring and in the future</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: futureDate1,
            endDate: futureDate2,
            recurring: false
        };
        eventDetails._eventType = EventDetails.eventType.Event;

        var result = eventDetails._isInPast();

        tc.isFalse(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_InstancePast", function (tc) {
        /// <summary>Test isInPast when the event is recurring, but we're looking at an instance in the past.</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: pastDate1,
            endDate: pastDate2,
            recurring: true,
            recurrence: {
                until: futureDate2
            }
        };
        eventDetails._eventType = EventDetails.eventType.Instance;

        var result = eventDetails._isInPast();

        tc.isTrue(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_RecurrenceSpan", function (tc) {
        /// <summary>Test isInPast when the event is recurring, starts in the past, and ends in the future.</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: pastDate1,
            endDate: pastDate2,
            recurring: true,
            recurrence: {
                until: futureDate2
            }
        };
        eventDetails._eventType = EventDetails.eventType.Series;

        var result = eventDetails._isInPast();

        tc.isFalse(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_RecurrenceFuture", function (tc) {
        /// <summary>Test isInPast when the event is recurring, and is entirely in the future.</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: futureDate1,
            endDate: futureDate2,
            recurring: true,
            recurrence: {
                until: futureDate2
            }
        };
        eventDetails._eventType = EventDetails.eventType.Series;

        var result = eventDetails._isInPast();

        tc.isFalse(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_RecurrencePast", function (tc) {
        /// <summary>Test isInPast when the event is recurring, and is entirely in the past.</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: pastDate1,
            endDate: pastDate2,
            recurring: true,
            recurrence: {
                until: pastDate2
            }
        };
        eventDetails._eventType = EventDetails.eventType.Series;

        var result = eventDetails._isInPast();

        tc.isTrue(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_RecurrenceNoEnd", function (tc) {
        /// <summary>Test isInPast when the event is recurring, starts in the past, but doesn't end.</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 1234,
            startDate: pastDate1,
            endDate: pastDate2,
            recurring: true,
            recurrence: {
                until: EventDetails.InfiniteDate
            }
        };
        eventDetails._eventType = EventDetails.eventType.Series;

        var result = eventDetails._isInPast();

        tc.isFalse(result);
    });

    Tx.test("EventDetailsTests.testIsInPast_NewEvent", function (tc) {
        /// <summary>Test isInPast when the event is new</summary>

        tc.cleanup = cleanup;
        setup(tc);

        eventDetails._initEvent = {
            id: 0,
            startDate: pastDate1,
            endDate: pastDate2,
            recurring: false
        };
        eventDetails._eventType = EventDetails.eventType.Event;

        var result = eventDetails._isInPast();

        tc.isFalse(result);
    });

    Tx.test("EventDetailsTests.testUpdateYourResponse", function (tc) {
        /// <summary>Verifies that responding to an event changes the busy status for accept/tentative and deletes the event for decline.</summary>

        tc.cleanup = cleanup;
        setup(tc);

        root.setupMail();
        var ResponseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType;

        var event = calendar.createEvent();
        var startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        event.startDate = startDate;
        event.endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        var self = event.addAttendee("", platform.accountManager.defaultAccount.emailAddress);
        self.responseType = ResponseType.notResponded;
        harness.store.setObjectProperty(event, Microsoft.WindowsLive.Platform.Test.STOREPROPERTYID.idPropertyResponseType, String(ResponseType.notResponded));
        event.commit();

        eventDetails.editEvent(event);
        loadUI(tc);

        tc.log("respond tentative");
        eventDetails._editResponseInMail(ResponseType.tentative);
        tc.areEqual("EventYourResponseTentative", elems.yourResponse.innerHTML, "Response type (tentative) should have been set");

        tc.log("respond accepted");
        eventDetails._editResponseInMail(ResponseType.accepted);
        tc.areEqual("EventYourResponseAccepted", elems.yourResponse.innerHTML, "Response type (accepted) should have been set");
    });
})();
