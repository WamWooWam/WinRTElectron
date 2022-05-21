
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,Jx,$,CalendarLib,BVT,WinJS,UtilitiesLib*/

/// Helper library for abstracting common UI functionality in Calendar for the DatePicker
var DatePickerLib = function () {

    /// OWNER: AlGore
    /// A function that gets the current year in the MonthPicker
    var getMonthPickerYear = function () {
        var curYear = UtilitiesLib.removeTextMarkers($(".grid:not([aria-hidden='true']) .header[role='heading']")[0].innerText);
        return parseInt(curYear, 10);
    }; //getMonthPickerYear


    return {
        /// OWNER: AlGore
        ///
        /// Uses the PageUp or Ctrl+H keys to navigate through the picker
        nextViewPast: function () {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                    complete();
                });

                // Generate a random number between 0 and 1 to determine
                // which hotkey to trigger
                var x = new Date().getTime() % 2;
                if (x === 0) {
                    Tx.log("Triggering PageUp");
                    $(".dp-host").trigger("keydown", { keyCode: 33 /* pageUp */ });
                } else {
                    Tx.log("Triggering Ctrl+H [PageUp]");
                    $(".dp-host").trigger("keydown", { keyCode: 72 /* h */, ctrlKey: true });
                }
            }); //WinJS.Promise
        }, //nextViewPast

        /// OWNER: AlGore
        /// Uses the PageDown or Ctrl+J keys to navigate through the picker
        nextViewFuture: function () {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                    complete();
                });

                var x = new Date().getTime() % 2;
                if (x === 0) {
                    Tx.log("Triggering PageDown");
                    $(".dp-host").trigger("keydown", { keyCode: 34 /* pageDown */ });
                } else {
                    Tx.log("Triggering Ctrl+J [PageDown]");
                    $(".dp-host").trigger("keydown", { keyCode: 74 /* j */, ctrlKey: true });
                }
            }); //WinJS.Promise
        }, //nextViewFuture

        /// OWNER: AlGore
        ///
        /// Finds the current active chevron by
        /// 1. Finding all divs with class='dateAnchor activeAnchor' present
        /// 2. Contains a child class='anchorText' which has a role of 'button' on it
        /// 
        /// Both of these requirements must be satisfied in order for the chevron to be usable
        getChevron: function () {
            var chevronQuery = $(".dateAnchor.activeAnchor .anchorText[role='button']");
            return chevronQuery;
        }, //getChevron

        /// OWNER: AlGore
        ///
        /// Finds the current active chevron by
        /// 1. Finding all divs with class='dateAnchor' present
        /// 2. The dateAnchor class does NOT also mention 'activeAnchor' anywhere
        /// 3. There is a child of this div called 'anchorText' but the role is 'heading' instead of 'button'
        getAllChevrons: function () {
            var chevronQuery = $(".dateAnchor:not(.activeAnchor) .anchorText[role='heading']");
            return chevronQuery;
        }, //getAllChevrons

        /// OWNER: AlGore
        ///
        /// Finds the current view and opens the corresponding picker flyout
        openFlyout: function () {
            return new WinJS.Promise(function (complete) {
                Tx.log("Opening flyout");
                var chevron = DatePickerLib.getChevron();

                BVT.marks.once(DatePickerLib.flyoutShowComplete, function () {
                    Tx.log("Found opened flyout event!");
                    BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                        complete();
                    });
                });
                $(chevron).trigger("MSPointerDown", { button: 0 });
                $(chevron).trigger("click");
            });
        }, //openFlyout

        /// OWNER: AlGore
        ///
        /// Closes an open flyout
        closeFlyout: function () {
            return new WinJS.Promise(function (complete) {
                Tx.log("Closing flyout");
                BVT.marks.once(DatePickerLib.flyoutHideComplete, function () {
                    Tx.log("Found close-flyout event!");
                    BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                        complete();
                    });
                });
                $(".win-flyoutmenuclickeater").trigger("MSPointerDown", { button: 0 });
                $(".win-flyoutmenuclickeater").trigger("click");
            });
        }, //closeFlyout

        /// OWNER: AlGore
        ///
        /// Waits for the picker flyout to be hidden before continuing
        waitForFlyoutDismiss: function (runFunc) {
            return new WinJS.Promise(function (complete) {
                Tx.log("Waiting for flyout to dismiss...");
                BVT.marks.once(DatePickerLib.flyoutHideComplete, function (s) {
                    Tx.log("Found event " + s);
                    complete();
                });
                runFunc();
            });
        }, //waitForFlyoutDismiss

        /// OWNER: AlGore
        ///
        /// This function returns the month that is currently visible in the picker
        getHeaderMonth: function () {
            var header = $(".grid:not([aria-hidden='true']) .header[role='heading']")[0].innerText;
            return UtilitiesLib.removeTextMarkers(header).split(" ")[0];
        }, //getHeaderMonth

        /// OWNER: AlGore
        ///
        /// This function returns the day that currently has focus
        getFocusedDay: function () {
            var d = $(".grid:not([aria-hidden='true']) .day.current .focused")[0].innerText;
            var strippedHeader = UtilitiesLib.removeTextMarkers(d);
            var date = Date.parse(strippedHeader);
            return new Date(date).getDate();
        }, //getFocusedDay

        /// OWNER: AlGore
        ///
        /// This function returns the month that currently has focus
        getFocusedMonth: function () {
            return $(".year:not([aria-hidden='true']) .month.current .focused")[0].innerText;
        }, //getFocusedDay

        /// OWNER: AlGore
        ///
        /// This function returns an array of date objects that are highlighted in the DatePicker
        getHighlightedDates: function () {
            var elementsOnScreen = $(".grid:not([aria-hidden='true']) .highlightDate");
            var returnDates = Array.prototype.map.call(elementsOnScreen, function (element) {
                return new Date(UtilitiesLib.removeTextMarkers(element.getAttribute("aria-label")));
            });
            return returnDates;
        }, //getHighlightedDates

        /// OWNER: AlGore
        ///
        /// This function returns the month that is currently highlighted in the MonthPicker
        getHighlightedMonth: function () {
            var monthQuery = $(".grid:not([aria-hidden='true']) .month.highlightDate");
            if (monthQuery.length !== 1) {
                Tx.AssertError("Expected there to be only one highlighted month!");
            }
            return $(monthQuery).attr("data-month");
        }, //getHighlightedMonth

        /// OWNER: AlGore
        ///
        /// Takes in the keycode for the arrow key you're pressing.  This function will wait until each the view is loaded before completing
        arrowKey: function (keyToPress) {
            return new WinJS.Promise(function (complete) {
                if (!(keyToPress === Jx.KeyCode.rightarrow || keyToPress === Jx.KeyCode.leftarrow ||
                    keyToPress === Jx.KeyCode.downarrow || keyToPress === Jx.KeyCode.uparrow)) {
                    Tx.AssertError("Invalid keycode for this function");
                }

                BVT.marks.once("Calendar:DatePicker.setFocusedDay,StopTA,Calendar", function () {
                    Tx.log("Found setFocusedDay event!");
                    complete();
                });
                Tx.log("Triggering keypress " + keyToPress);
                $(".grid:not([aria-hidden='true']) .monthGrid").trigger("keydown", { keyCode: keyToPress });
            });
        }, //arrowKey

        /// OWNER: AlGore
        ///
        /// This function allows a person to pass in a number that represents the day they would like to select
        /// Anything above 31 or below 1 returns an error
        selectDay: function (day, expectedViewChange) {
            return new WinJS.Promise(function (complete) {
                Tx.log("Selecting day: " + day);

                // Return all months that are built in the dom => [ .grid ]
                // Filter out the non-visible month grid => [ :not([aria-hidden='true']) ]
                // Filter down to the days visible in the grid and only for the current month => [ .day.current ]
                // This always returns 31 days.  Filter down to the ones that are valid for the given month => [ :not(.hidden) ]
                // Make sure that the role for each of these dates is labelled button
                var dayQuery = ".dp-flyout .grid:not([aria-hidden='true']) .day.current:not(.hidden)[role='button']";
                var numDays = $(dayQuery).length;
                if (day > numDays || day < 1) {
                    Tx.AssertError("Invalid day passed in.  Must be between 1 and " + numDays);
                }

                var viewEventLoadComplete = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView());

                // Filter the day query down to the single day element, to be ready for selection
                var selectedDay = $(dayQuery)[day - 1];

                var visibleDates = CalendarLib.getVisibleDates();
                var viewChange = true;
                for (var i = 0; i < visibleDates.length; i++) {
                    if (visibleDates[i].getDate() === day) {
                        viewChange = false;
                        Tx.log("Date you've chosen to select is already visible.  Nothing should happen.");
                    }
                }

                if (undefined !== expectedViewChange) {
                    Tx.log("overriding ViewChange logic..");
                    viewChange = expectedViewChange;
                }

                if (viewChange) {
                    BVT.marks.once(DatePickerLib.flyoutHideComplete, function () {
                        BVT.marks.once(viewEventLoadComplete, function () {
                            Tx.log("View change event occurred!");
                            complete();
                        });
                        Tx.log("Found flyout hide event!");
                    });
                } else {
                    BVT.marks.once(DatePickerLib.flyoutHideComplete, function () {
                        Tx.log("Found flyout hide event!");
                        complete();
                    });
                }
                $(selectedDay).trigger("MSPointerDown", { button: 0 });
                $(selectedDay).trigger("click");
            });
        }, //selectDay

        /// OWNER: AlGore
        ///
        /// This function allows a person to pass in a number that represents the month they would like to select
        /// Anything above 11 or below 0 returns an error
        selectMonth: function (month, viewShouldChange) {
            Tx.log("Selecting month: " + month);

            return new WinJS.Promise(function (complete) {
                if (month > 11 || month < 0) {
                    Tx.AssertError("Invalid month passed in.  Must be between 0 and 11 (inclusive)");
                }

                var view = CalendarLib.getCurrentView();
                if (view !== "monthview") {
                    Tx.AssertError("You should only call this function while in monthview!");
                }

                // Return all Year grids in the MonthPicker [ .grid ]
                // Filter out the years that are marked hidden [ :not([aria-hidden='true']) ]
                // Filter down to the month buttons [ .month[role='button'] ]
                var monthQuery = $(".dp-flyout .grid:not([aria-hidden='true']) .month[role='button']");
                var selectedMonth = monthQuery[month];

                var viewChange = (CalendarLib.getCurrentMonth() !== month);
                var viewEventLoadComplete = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView());

                if (viewShouldChange || viewChange) {
                    BVT.marks.once(DatePickerLib.flyoutHideComplete, function () {
                        Tx.log("Found flyout hide event!");
                        BVT.marks.once(viewEventLoadComplete, function () {
                            Tx.log("View change event occurred!");
                            complete();
                        });
                    });
                } else {
                    BVT.marks.once(DatePickerLib.flyoutHideComplete, function () {
                        Tx.log("Found flyout hide event!");
                        //after closing the flyout wait for the jobs to get exhausted and view to come back in sight
                        BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                            Tx.log("Jobs exhausted event found!");
                            complete();
                        });
                    });
                }

                $(selectedMonth).trigger("MSPointerDown", { button: 0 });
                $(selectedMonth).trigger("click");
            });
        }, //selectMonth

        /// OWNER: AlGore
        ///
        /// A function that finds the "Today" button in the DOM and selects it.  Takes in a parameter as to whether or not we should
        /// expect a view-change event or whether to just expect a Flyout-Hide event
        goToToday: function (viewShouldChange) {
            return new WinJS.Promise(function (complete) {
                var todayButton = $(".dp-today[role='button']");

                if (viewShouldChange) {
                    var viewEventLoadComplete = CalendarLib.getEventForViewChanged(CalendarLib.getCurrentView());
                    BVT.marks.once(viewEventLoadComplete, function () {
                        Tx.log("View change event occurred!");
                        complete();
                    });
                } else {
                    BVT.marks.once(DatePickerLib.flyoutHideComplete, function () {
                        Tx.log("Found flyout hide event!");
                        complete();
                    });
                }

                $(todayButton).trigger("MSPointerDown", { button: 0 });
                $(todayButton).trigger("click");
            });
        }, //goToToday

        /// OWNER: T-NiravN
        /// A function that navigates to the specified year in future. Takes in a year as a parameter
        /// the function is created in order to make sure that we don't loose any command to change year as it may happen using the
        /// for loop.
        nextViewFutureLoop: function (year) {
            return new WinJS.Promise(function (complete) {
                var diff = year - getMonthPickerYear();
                // If there is no difference then dont go forward and call complete;
                if (diff === 0) {
                    complete();
                    return;
                }
                var yearsLeft = diff - 1;
                // We would run the below code for difference - 1 times as the below code would always run atleast once
                // and then would go to the loop, and when yearsLeft becomes zero we return a promise that we have navigated to specified year
                // Uses the PageDown or Ctrl+J keys to navigate through the picker
                BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function fn() {
                    if (yearsLeft === 0) {
                        complete();
                        return;
                    }
                    else {
                        var x = new Date().getTime() % 2;
                        if (x === 0) {
                            Tx.log("Triggering PageDown");
                            $(".dp-host").trigger("keydown", { keyCode: 34 /* pageDown */ });
                        } else {
                            Tx.log("Triggering Ctrl+J [PageDown]");
                            $(".dp-host").trigger("keydown", { keyCode: 74 /* j */, ctrlKey: true });
                        }
                        fn(--yearsLeft);
                    }
                });

                var x = new Date().getTime() % 2;
                if (x === 0) {
                    Tx.log("Triggering PageDown");
                    $(".dp-host").trigger("keydown", { keyCode: 34 /* pageDown */ });
                } else {
                    Tx.log("Triggering Ctrl+J [PageDown]");
                    $(".dp-host").trigger("keydown", { keyCode: 74 /* j */, ctrlKey: true });
                }
            }); //WinJS.Promise
        }, //nextViewPastFutureLoop

        /// OWNER: T-NiravN
        /// A function that navigates to the specified year in past. Takes in a year as a parameter
        /// the function is created in order to make sure that we don't loose any command to change year as it may happen using the
        /// for loop.
        nextViewPastLoop: function (year) {
            return new WinJS.Promise(function (complete) {
                var diff = getMonthPickerYear() - year;
                // If there is no difference then dont go forward and call complete;
                if (diff === 0) {
                    complete();
                    return;
                }
                var yearsLeft = diff - 1;
                // We would run the below code for difference - 1 times as the below code would always run atleast once
                // and then go to the loop, and when yearsLeft becomes zero we return a promise that we have navigated to specified year
                BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function fn() {
                    if (yearsLeft === 0) {
                        complete();
                        return;
                    } else {
                        var x = new Date().getTime() % 2;
                        if (x === 0) {
                            Tx.log("Triggering PageUp");
                            $(".dp-host").trigger("keydown", { keyCode: 33 /* pageUp */ });
                        } else {
                            Tx.log("Triggering Ctrl+H [PageUp]");
                            $(".dp-host").trigger("keydown", { keyCode: 72 /* h */, ctrlKey: true });
                        }
                        fn(--yearsLeft);
                    }
                });

                var x = new Date().getTime() % 2;
                if (x === 0) {
                    Tx.log("Triggering PageUp");
                    $(".dp-host").trigger("keydown", { keyCode: 33 /* pageUp */ });
                } else {
                    Tx.log("Triggering Ctrl+H [PageUp]");
                    $(".dp-host").trigger("keydown", { keyCode: 72 /* h */, ctrlKey: true });
                }
            }); //WinJS.Promise
        }, //nextViewPastLoop

        /// OWNER: T-NiravN
        /// A function that calls the past and future navigate years, based on current month and year
        loopUntilYear: function (year) {
            return new WinJS.Promise(function (complete) {
                var curYear = getMonthPickerYear();
                if (curYear === year) {
                    Tx.log("Selected Year : " + year);
                    complete();
                    return;
                } else if (curYear < year) {
                    DatePickerLib.nextViewFutureLoop(year)
                    .done(function () {
                        Tx.log("Selected Year : " + year);
                        complete();
                        return;
                    });
                } else {
                    DatePickerLib.nextViewPastLoop(year)
                    .done(function () {
                        Tx.log("Selected Year : " + year);
                        complete();
                        return;
                    });
                }
            });
        }, //loopUntilYear
    }; //DatePickerLib
}();

DatePickerLib.flyoutShowComplete = "WinJS.UI.Flyout:dp-flyout:show,StopTM";
DatePickerLib.flyoutHideComplete = "WinJS.UI.Flyout:dp-flyout:hide,StopTM";