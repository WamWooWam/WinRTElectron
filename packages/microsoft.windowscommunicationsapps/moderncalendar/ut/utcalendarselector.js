
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global $,Calendar,Jx,Tx,createMockPlatformCollection*/

(function () {

    var Root = function () {
        this.calendarSelector = new Calendar.Views.CalendarSelector();
        this.append(this.calendarSelector);
    };

    Jx.augment(Root, Jx.Component);

    Tx.test("CalendarSelector.testControls", function (tc) {

        var root = new Root();
        var calendarSelector = root.calendarSelector;

        var div = document.getElementById("calendarSelector");
        div.innerHTML = Jx.getUI(calendarSelector).html;
        calendarSelector.activateUI();

        calendarSelector.setCalendars([{
            name:  "Jeremy's Calendar",
            email: "jnelson@live.com",
            color: "green"
        }, {
            name:  "Calendar",
            email: "j-Nelson@comcast.com",
            color: "blue"
        }, {
            name:  "Jeremy.nelson@gmail.com",
            email: "Jeremy.nelson@gmail.com",
            color: "purple"
        }]);

        calendarSelector.updateSelectionByIndex(0);

        $(".selection").click();
        var target = $(".entry:nth-child(2)", $(".dropDown"));
        target.trigger("click");

        tc.isTrue(calendarSelector._selectedCalendar === 1, "Second Calendar should be selected by mouse.");

        $(".selection").click();
        $(".entry:nth-child(3)", $(".dropDown")).trigger("click");

        tc.isTrue(calendarSelector._selectedCalendar === 2, "Third Calendar should be selected by mouse.");

        $(".selection").click();
        $(".dropDown").get(0).dispatchEvent($.Event("keydown", { keyCode: Jx.KeyCode.uparrow }));
        $(".dropDown").get(0).dispatchEvent($.Event("keydown", { keyCode: Jx.KeyCode.enter }));

        tc.isTrue(calendarSelector._selectedCalendar === 1, "Second Calendar should be selected by arrow key.");

        $(".selection").click();
        $(".selection").click();

        tc.isTrue(calendarSelector._selectedCalendar === 1, "Calendar selection should not have changed.");

        $(".selection").click();
        $(".dropDown").get(0).dispatchEvent($.Event("keydown", { keyCode: Jx.KeyCode.enter }));

        tc.isTrue(calendarSelector._selectedCalendar === 1, "Calendar selection should not have changed on open and enter key.");

        calendarSelector.deactivateUI();
        div.innerHTML = "";
    });

    Tx.test("CalendarSelector.testSelectById", function testSelectById (tc) {
        /// <summary>Verifies selectById functionality</summary>

        var calendarSelector;

        var mockCalendarOptions = [
            {
                name: "Default Calendar",
                email: "defaultcalendar@fabrikam.com",
                color: "red",
                calendar: {
                    id: 0,
                    isDefault: true,
                },
            },
            {
                name: "Calendar 1",
                email: "calendar@fabrikam.com",
                color: "green",
                calendar: {
                    id: 101,
                },
            },
            {
                name: "Calendar 2",
                email: "calendar@fabrikam.com",
                color: "blue",
                calendar: {
                    id: 102,
                },
            },
            {
                name: "Calendar 3",
                email: "calendar@email.com",
                color: "teal",
                calendar: {
                    id: 103,
                },
            }];

        function setupCalendarSelector(useCalendars) {
            /// <summary>Creates the calendar selector, activates, associates with #calendarSelector element, and sets the given calendars on the object.</summary>
            /// <param name="useCalendars" type="Array">
            /// Array of indexes of calendars to add to the selector.  For each number in this array, it will pull the corresponding calendar option from mockCalendarOptions.
            /// </param>

            var calendars = [];
            for (var i = 0; i < useCalendars.length; i++) {
                calendars[i] = mockCalendarOptions[useCalendars[i]];
            }

            var calendarSelector = new Calendar.Views.CalendarSelector();

            var div = document.getElementById("calendarSelector");
            div.innerHTML = Jx.getUI(calendarSelector).html;
            calendarSelector.activateUI();

            calendarSelector.setCalendars(calendars);

            return calendarSelector;
        }

        tc.log("normal case - there is a default calendar, and the calendar we're trying to select is present.");
        calendarSelector = setupCalendarSelector([0,1,2]);
        calendarSelector.updateSelectionById(mockCalendarOptions[2].calendar.id);

        tc.areEqual(2, calendarSelector._selectedCalendar, "Unexpected selection");

        tc.log("The calendar we're trying to select is not present, it will fall back to the default calendar.");
        calendarSelector = setupCalendarSelector([2, 3, 0]);
        calendarSelector.updateSelectionById(mockCalendarOptions[1].calendar.id);

        tc.areEqual(2, calendarSelector._selectedCalendar, "Unexpected selection");

        tc.log("No parameter passed in, it will fall back to the default calendar.");
        calendarSelector = setupCalendarSelector([2, 1, 3, 0]);
        calendarSelector.updateSelectionById();

        tc.areEqual(3, calendarSelector._selectedCalendar, "Unexpected selection");

        tc.log("The calendar we're trying to select is not present, and there is no default, it will fall back to the first calendar.");
        calendarSelector = setupCalendarSelector([1, 2, 3]);
        calendarSelector.updateSelectionById(mockCalendarOptions[0].calendar.id);

        tc.areEqual(0, calendarSelector._selectedCalendar, "Unexpected selection");
    });


    Tx.test("CalendarSelector.testGetCalendars", function testGetCalendars(tc) {
        /// <summary>Verifies various behavior of the getCalendarsForSelector function</summary>

        var CalendarSelector = Calendar.Views.CalendarSelector;

        var mockCalendar1 = {
            account: {},
            color: 0,
            id: "calendar1",
        };

        var mockCalendar2 = {
            account: {},
            color: 0,
            id: "calendar2",
        };

        var mockCalendar3 = {
            account: {},
            color: 0,
            id: "calendar3",
        };

        var mockHiddenCalendar1 = {
            account: {},
            color: 0,
            id: "hiddenCalendar1",
            hidden: true,
        };

        var mockHiddenCalendar2 = {
            account: {},
            color: 0,
            id: "hiddenCalendar2",
            hidden: true,
        };

        var mockHiddenCalendar3 = {
            account: {},
            color: 0,
            id: "hiddenCalendar3",
            hidden: true,
        };

        var mockDefaultCalendar = {
            account: {},
            color: 0,
            id: "defaultCalendar",
            isDefault: true,
        };

        var mockHiddenDefaultCalendar = {
            account: {},
            color: 0,
            id: "defaultHiddenCalendar",
            isDefault: true,
            hidden: true,
        };

        function generateMockPlatform(calendarArrays) {
            /// <summary>Given the calendar info, puts together a mock platform object.</summary>
            /// <param name="calendarArrays" type="Array">An array of arrays of calendars.  Each entry in the top level array represents an account that should have the given array of calendars.</param>

            var accountList = [];
            var calendarList = [];

            for (var i = 0; i < calendarArrays.length; i++) {
                var account = {
                    _calendars: calendarArrays[i],
                };
                calendarList = calendarList.concat(calendarArrays[i]);
                accountList.push(account);
            }

            var generatedPlatform = {
                accountManager: {
                    getConnectedAccountsByScenario: function () {
                        return createMockPlatformCollection(accountList);
                    }
                },
                calendarManager: {
                    getAllCalendars: function () {
                        return createMockPlatformCollection(calendarList);
                    },
                    getAllCalendarsForAccount: function (account) {
                        return createMockPlatformCollection(account._calendars);
                    },
                },
            };

            return generatedPlatform;
        }

        var mockPlatform;
        var calendars;
        var result;

        // Calendars should be grouped by account, and the default calendar should be first within that account (but not at the top of the overall list).
        tc.log("Calendar order test");
        calendars = [
            [mockCalendar1],
            [mockCalendar2, mockDefaultCalendar],
            [mockCalendar3],
        ];
        mockPlatform = generateMockPlatform(calendars);
        result = CalendarSelector.getCalendarsForSelector(mockPlatform);

        tc.areEqual(4, result.length, "Unexpected number of calendars");
        tc.areEqual(mockCalendar1, result[0].calendar, "Unexpected calendar at position 0");
        tc.areEqual(mockDefaultCalendar, result[1].calendar, "Unexpected calendar at position 1");
        tc.areEqual(mockCalendar2, result[2].calendar, "Unexpected calendar at position 2");
        tc.areEqual(mockCalendar3, result[3].calendar, "Unexpected calendar at position 3");

        tc.log("Hidden calendars are not returned");
        calendars = [
            [mockCalendar1, mockHiddenCalendar1, mockHiddenCalendar2],
            [mockCalendar2, mockCalendar3, mockHiddenDefaultCalendar],
            [mockHiddenCalendar3],
        ];
        mockPlatform = generateMockPlatform(calendars);
        result = CalendarSelector.getCalendarsForSelector(mockPlatform);

        tc.areEqual(3, result.length, "Unexpected number of calendars");
        for (var i = 0; i < result.length; i++) {
            tc.isFalse(!!result[i].calendar.hidden, "Hidden calendar was unexpectedly included");
        }


        tc.log("Hidden calendars are returned if the only calendars available are hidden");
        calendars = [
            [mockHiddenCalendar1, mockHiddenCalendar2],
            [mockHiddenCalendar3, mockHiddenDefaultCalendar]
        ];
        mockPlatform = generateMockPlatform(calendars);
        result = CalendarSelector.getCalendarsForSelector(mockPlatform);

        tc.areEqual(4, result.length, "Unexpected number of calendars");


        tc.log("Default calendar is returned when there are no calendars");
        calendars = [];
        mockPlatform = generateMockPlatform(calendars);
        mockPlatform.calendarManager.defaultCalendar = mockDefaultCalendar;
        result = CalendarSelector.getCalendarsForSelector(mockPlatform);

    });

    Tx.test("CalendarSelector.testCreateCalendarOption", function testCreateCalendarOption (tc) {
        /// <summary>Verifies the createCalendarOption function</summary>

        var CalendarSelector = Calendar.Views.CalendarSelector;
        var calendar;
        var result;

        tc.log("Verify normal calendar output");
        calendar = {
            name: "Unit Test Calendar",
            account: {
                emailAddress: "calendar@fabrikam.com",
            },
            color: 255, // #0000FF
        };
        result = CalendarSelector.createCalendarOption(calendar, false);

        tc.areEqual(calendar, result.calendar, "calendar");
        tc.areEqual(calendar.name, result.name, "name");
        tc.areEqual(calendar.color, result.colorRaw, "colorRaw");
        tc.areEqual("#0000ff", result.color, "color");
        tc.areEqual(calendar.account.emailAddress, result.email, "email");


        tc.log("Verify calendar with no name");
        calendar.name = "";
        result = CalendarSelector.createCalendarOption(calendar, false);
        
        tc.areEqual(calendar.account.emailAddress, result.name, "name");
        tc.areEqual("", result.email, "email");


        tc.log("Verify hidden calendar with name");
        calendar.name = "Unit test hidden calendar";
        result = CalendarSelector.createCalendarOption(calendar, true);

        tc.areEqual(calendar.name, result.name, "name");
        tc.isTrue(result.email.indexOf(calendar.account.emailAddress) >= 0, "Email did not contain email address");
        tc.isTrue(result.email.indexOf(Jx.res.getString("HiddenCalendar")) >= 0, "Email did not contain hidden calendar text");

        tc.log("Verify hidden calendar with no name");
        calendar.name = "";
        result = CalendarSelector.createCalendarOption(calendar, true);

        tc.areEqual(calendar.account.emailAddress, result.name, "name");
        tc.areEqual(Jx.res.getString("HiddenCalendar"), result.email, "email");
    });
})();