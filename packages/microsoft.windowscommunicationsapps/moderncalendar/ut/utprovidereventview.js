
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global $,Calendar,Jx,Microsoft,ProviderUTHelper,Tx,Windows,removeTextMarkers*/

(function () {

    var _helper = ProviderUTHelper;
    var _testUIContainer;

    var Helpers = Calendar.Helpers;

    function initialize(tc) {
        /// <summary>Sets up _testUIContainer</summary>

        _testUIContainer = document.createElement("div");
        document.body.appendChild(_testUIContainer);

        tc.cleanup = function () {
            _testUIContainer.parentElement.removeChild(_testUIContainer);
            _testUIContainer = null;
        };
    }

    Tx.test("ProviderEventView.transitionToError", function transitionToError (tc) {
        /// <summary>Verifies that the UI transitions to error correctly</summary>

        var errorText = "Unit test mock error";

        // This is the state of the model when transitioning from event to error - it has both an event and an error.
        var mockModel = {
            getEvent: function () {
                return {
                    subject: "mock event subject"
                };
            },
            getOriginalEvent: function () {
                tc.error("Unexpected call to getOriginalEvent");
            },
            getAction: function () { return Calendar.ProviderAction.closeError; },
            getCalendars: function () { return [{}];},
            getErrorText: function () { return errorText;}
        };

        var view = new Calendar.ProviderEventView(mockModel);
        var ui = {};
        
        view.getUI(ui);

        // Only the error should be rendered.
        tc.isFalse(ui.html.indexOf("provEventSubj") >= 0, "Unexpected event content while rendering error");
        tc.isTrue(ui.html.indexOf(errorText) >= 0, "Unable to find error message while rendering error");
    });

    Tx.test("ProviderEventView.testFormatEventDate", function testFormatEventDate(tc) {

        var originalJxRes = Jx.res;
        Jx.res = {};
        tc.cleanup = function () {
            Jx.res = originalJxRes;
        };

        var result;
        var mockEvent = _helper.getMockEvent();
        var formatEventDate = Calendar.ProviderEventView.prototype._formatEventDate;

        Jx.res.loadCompoundString = function (resourceId) {
            var str = this.getString(resourceId);
            if (str) {
                // This is a simplified version of the actual loadCompoundString - it doesn't deal with escape sequences.  So long as none of the strings below need it, that's fine.
                for (var i = arguments.length - 1; i > 0; i--) {
                    var rx = new RegExp("%" + String(i), "g");
                    str = str.replace(rx, arguments[i]);
                }
            }
            return str;
        };
        Jx.res.getString = function (stringId) {
            if (stringId === "AllDaySuffix") {
                return "%1 All day";
            } else if (stringId === "DateRangeShort" || stringId === "TimeRange") {
                return "%1 - %2";
            } else {
                tc.error("Unexpected string ID: " + stringId);
            }
        };

        // make sure the formatters have known patterns so that we can string match
        var DateTimeFormatter = Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
        var CalendarIdentifiers = Windows.Globalization.CalendarIdentifiers;
        var ClockIdentifiers = Windows.Globalization.ClockIdentifiers;
        Jx.DTFormatter._setFormatters({
            "shortTime": new DateTimeFormatter("shorttime", ["en-US"], "US", CalendarIdentifiers.gregorian, ClockIdentifiers.twelveHour),
            "shortDate": new DateTimeFormatter("{month.integer}/{day.integer}/{year.full}", ["en-US"], "US", CalendarIdentifiers.gregorian, ClockIdentifiers.twelveHour),
        });

        tc.log("All day event with one day");
        mockEvent.allDayEvent = true;
        mockEvent.startDate = new Date("10/24/2013");
        mockEvent.endDate = new Date("10/25/2013");

        result = formatEventDate(mockEvent);
        tc.areEqual("10/24/2013 All day", result, "Result did not match");


        tc.log("All day event with multiple days");
        mockEvent.allDayEvent = true;
        mockEvent.startDate = new Date("10/01/2013");
        mockEvent.endDate = new Date("11/01/2013");

        result = formatEventDate(mockEvent);
        tc.areEqual("10/1/2013 - 10/31/2013", result, "Result did not match");


        tc.log("Zero-duration event");
        mockEvent.allDayEvent = false;
        mockEvent.startDate = new Date("9/04/2013 3:00pm");
        mockEvent.endDate = mockEvent.startDate;

        result = formatEventDate(mockEvent);
        tc.areEqual(Helpers.shortDateAndTime.format(mockEvent.startDate), result, "Result did not match");


        tc.log("Event spans part of one day");
        mockEvent.allDayEvent = false;
        mockEvent.startDate = new Date("12/25/2013 10:00am");
        mockEvent.endDate = new Date("12/25/2013 3:00pm");

        result = formatEventDate(mockEvent);
        tc.areEqual("12/25/2013 10:00 AM - 3:00 PM", removeTextMarkers(result), "Result did not match");


        tc.log("Event spans multiple days");
        mockEvent.allDayEvent = false;
        mockEvent.startDate = new Date("12/31/2013 10:00pm");
        mockEvent.endDate = new Date("1/1/2014 3:00am");

        result = formatEventDate(mockEvent);
        tc.areEqual(Helpers.shortDateAndTime.format(mockEvent.startDate) + " - " + Helpers.shortDateAndTime.format(mockEvent.endDate), result, "Result did not match");
    });

    Tx.test("ProviderEventView.testGetUI", function testGetInfoText (tc) {
        /// <summary>Makes sure that the info text and other event-dependent UI is set up properly, especially for scenarios that are dependent on the original event.</summary>

        initialize(tc);

        var EventType = Microsoft.WindowsLive.Platform.Calendar.EventType;

        var willEmailAttendees = false;
        var modelCalendarList;
        var mockSingleCalendarList = [{}];
        var mockMultipleCalendarList = [
            { calendar: {} },
            { calendar: {} },
        ];
        var modelAction = Calendar.ProviderAction.remove;
        var mockEvent = _helper.getMockEvent();
        mockEvent.startDate = new Date();
        mockEvent.endDate = new Date();

        var mockModel = {
            willEmailAttendees: function () {
                return willEmailAttendees;
            },
            getOriginalEvent: function () {
                return mockEvent;
            },
            getEvent: function () {
                return mockEvent;
            },
            getAction: function () { return modelAction; },
            getCalendars: function () { return modelCalendarList; },
            getErrorText: function () { return null; }
        };

        function setupUI () {
            var view = new Calendar.ProviderEventView(mockModel);
            var ui = {};
            view.getUI(ui);
            _testUIContainer.innerHTML = ui.html;

            // Bypass the calendar selector setup and go straight to handleCalendarChange, which sets up the info text.
            if (view._calendarSelector && modelAction !== Calendar.ProviderAction.add) {
                var eventInfo = {
                    data: {
                        index: 0
                    }
                };
                view._handleCalendarChange(eventInfo);
            }
        }

        function isReplaceAttendeeMessageVisible () {
            return $.id("provAttendees").currentStyle.display === "block";
        }

        function isRemoveAttendeeMessageVisible () {
            return $.id('provNotes').currentStyle.display === "block";
        }

        // The attendees message behaves differently along the following axes:
        // - action (replace vs remove)
        // - multiple or single events (code is different, with same result)
        // - willEmailAttendees

        tc.log("Remove single non-recurring event with attendees");
        mockEvent.recurring = false;
        willEmailAttendees = true;
        mockEvent.eventType = EventType.single;
        modelCalendarList = mockSingleCalendarList;
        
        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningDelete"), $.id("provInfo").innerText, "Text did not match");
        tc.isTrue(isRemoveAttendeeMessageVisible(), "remove attendee message");

        tc.log("Remove single non-recurring event without attendees");
        mockEvent.recurring = false;
        willEmailAttendees = false;
        mockEvent.eventType = EventType.single;
        modelCalendarList = mockSingleCalendarList;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningDelete"), $.id("provInfo").innerText, "Text did not match");
        tc.isFalse(isRemoveAttendeeMessageVisible(), "remove attendee message");


        tc.log("Remove single recurring event with attendees");
        willEmailAttendees = true;
        mockEvent.recurring = true;
        mockEvent.eventType = EventType.series;
        modelCalendarList = mockSingleCalendarList;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningDeleteSeries"), $.id("provInfo").innerText, "Text did not match");
        tc.isTrue(isRemoveAttendeeMessageVisible(), "remove attendee message");


        tc.log("Remove multiple non-recurring event without attendees");
        willEmailAttendees = false;
        mockEvent.recurring = false;
        mockEvent.eventType = EventType.single;
        modelCalendarList = mockMultipleCalendarList;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningDeleteChoose"), $.id("provInfo").innerText, "Text did not match");
        tc.isFalse(isRemoveAttendeeMessageVisible(), "remove attendee message");


        tc.log("Remove multiple recurring event without attendees");
        willEmailAttendees = false;
        mockEvent.recurring = true;
        mockEvent.eventType = EventType.series;
        modelCalendarList = mockMultipleCalendarList;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningDeleteSeriesChoose"), $.id("provInfo").innerText, "Text did not match");


        tc.log("Add event");
        modelAction = Calendar.ProviderAction.add;
        
        setupUI();

        tc.areEqual(0, $("#provInfo").length, "Unexpected info text for add");
        tc.isFalse(isReplaceAttendeeMessageVisible(), "replace attendee message was visible");

        
        tc.log("Replace single event without attendees");
        modelAction = Calendar.ProviderAction.replace;
        modelCalendarList = mockSingleCalendarList;
        willEmailAttendees = false;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningReplace"), $.id("provInfo").innerText, "Text did not match");
        tc.isFalse(isReplaceAttendeeMessageVisible(), "replace attendee message");


        tc.log("Replace single event with attendees");
        modelCalendarList = mockSingleCalendarList;
        willEmailAttendees = true;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningReplace"), $.id("provInfo").innerText, "Text did not match");
        tc.isTrue(isReplaceAttendeeMessageVisible(), "replace attendee message");


        tc.log("Replace multiple events without attendees");
        modelCalendarList = mockMultipleCalendarList;
        willEmailAttendees = false;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningReplace"), $.id("provInfo").innerText, "Text did not match");
        tc.isFalse(isReplaceAttendeeMessageVisible(), "replace attendee message");


        tc.log("Replace multiple events with attendees");
        modelCalendarList = mockMultipleCalendarList;
        willEmailAttendees = true;

        setupUI();

        tc.areEqual(Jx.res.getString("ProviderWarningReplace"), $.id("provInfo").innerText, "Text did not match");
        tc.isTrue(isReplaceAttendeeMessageVisible(), "replace attendee message");
    });

    Tx.test("ProviderEventView.testDeactivateTwice", function testDeactivateTwice(tc) {
        /// <summary>Verifies that there aren't any crashes if the EventView is deactivated twice</summary>

        initialize(tc);

        var EventType = Microsoft.WindowsLive.Platform.Calendar.EventType;

        var modelCalendarList = [
            {
                calendar: _helper.getMockCalendar(),
                name: "calendar1",
                email: ""
            },
            {
                calendar: _helper.getMockCalendar(),
                name: "calendar2",
                email: ""
            },
        ];
        var modelAction = Calendar.ProviderAction.remove;
        var mockEvent = _helper.getMockEvent();

        var mockModel = {
            willEmailAttendees: function () {
                return false;
            },
            getOriginalEvent: function () {
                return mockEvent;
            },
            getEvent: function () {
                return mockEvent;
            },
            getAction: function () { return modelAction; },
            getCalendars: function () { return modelCalendarList; },
            getErrorText: function () { return null; }
        };

        var view = new Calendar.ProviderEventView(mockModel);
        view.initUI(_testUIContainer);

        view.deactivateUI();
        view.deactivateUI();
    });

})();