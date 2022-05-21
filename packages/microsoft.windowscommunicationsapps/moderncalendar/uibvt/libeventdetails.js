
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $,Jx,Tx,WinJS,document,BVT,setTimeout,clearTimeout,Debug,UtilitiesLib,CalendarLib*/

// Library for interacting with event details UI elements.  (Including Quick Event Creation)

var EventDetailsLib = function () {

    /// OWNER - AlGore
    ///
    /// This function returns the value within a given combo box
    var returnTimePickerValue = function (timePickerClass, returnInt) {
        var value = $(timePickerClass)[0].value;
        return (returnInt ? parseInt(value, 10) : value);
    }; //returnTimePickerValue

    /// OWNER - AlGore
    ///
    /// This function runs a function as if the DatePicker was accessed and a date was selected on the given ComboBox
    /// 
    /// REMARKS - The Debug function is used by devs to run a function on a given view without polluting it.  In this case,
    ///           the funciton being called is one that selects the "_onDatePickerDateSelected" function in EventDetails.js
    var runDatePickerFunction = function (comboBoxId, theDate) {
        Debug.view._datePickerAnchor = $.id(comboBoxId);
        Debug.view._onDatePickerDateSelected({ data: theDate });
    }; //returnDatePickerValue

    /// OWNER - AlGore
    ///
    /// This function returns the value within a given datepicker element
    var returnDatePickerValue = function (comboBoxId) {
        return new Date(Date.parse(UtilitiesLib.removeTextMarkers($("#" + comboBoxId + " .value")[0].innerText)));
    }; //returnDatePickerValue

    /// OWNER - StevenRy
    ///
    /// This function verifies that a particular event doesn't show up anymore
    /// in the view after an event is deleted.
    var verifyDelete = function (viewChangeEvent, title) {
        if (CalendarLib.getViewForChangeEvent(viewChangeEvent) !== CalendarLib.agendaViewText) {
            CalendarLib.getMultipleEvents(title, false);  // function asserts
            Tx.log(title + " verified deleted");
        }
        else
        {
            Tx.log("Can't verify delete on AgendaView");
        }
    }

    return {
        /// PUBLIC LIBRARY FUNCTIONALITY GOES IN HERE

        // Some events we listen for
        evtDetailsReady: "Calendar.ED.eventDetailsReady,Info,Calendar",

        showMore: function () {
            $("#ShowMoreButton").click();
        },

        minute: function (minute, end) {
            /// <param name="end"> True if setting the end minute</param>

            // This first part won't work for loc...
            if (Jx.isDefined(minute)) {
                var minStr = String(minute);
                if (minute % 5 !== 0) {
                    Tx.AssertError("Minutes need to be set in increments of 5!");
                }
                if (minute < 0 || minute > 55) {
                    Tx.AssertError("Minutes need to be set between 0 and 55");
                }
                if (minStr.length === 1) {
                    minStr = "0" + minStr;
                }

                // Determine whether we're editing the start time or end time
                var timeCombo;
                if (end) {
                    timeCombo = $("#EndTimeCombo");
                } else {
                    timeCombo = $("#StartTimeCombo");
                }

                $(".win-timepicker-minute", timeCombo).prop("value", minStr);
                $(".win-timepicker-minute", timeCombo).trigger("change");

            } else {
                return returnTimePickerValue(".win-timepicker-minute", true);
            }
        },

        hour: function (hour, end) {
            /// <param name="end"> True if setting the end hour</param>

            if (hour < 1 || hour > 12) {
                Tx.AssertError("Hour needs to be set between 1 and 12 (inclusive)");
            }
            if (Jx.isDefined(hour)) {
                // Determine whether we're editing the start time or end time
                var timeCombo;
                if (end) {
                    timeCombo = $("#EndTimeCombo");
                } else {
                    timeCombo = $("#StartTimeCombo");
                }

                $(".win-timepicker-hour", timeCombo).prop("value", hour);
                $(".win-timepicker-hour", timeCombo).trigger("change");
            } else {
                return returnTimePickerValue(".win-timepicker-hour", true);
            }
        },

        ampm: function (amPm /* String */, end) {
            /// <param name="end"> True if setting the end AM/PM</param>

            if (Jx.isDefined(amPm)) {
                var amPmUpCase = amPm.toUpperCase();

                // Determine whether we're editing the start time or end time
                var timeCombo;
                if (end) {
                    timeCombo = $("#EndTimeCombo");
                } else {
                    timeCombo = $("#StartTimeCombo");
                }

                $(".win-timepicker-period", timeCombo).prop("value", amPmUpCase);
                $(".win-timepicker-period", timeCombo).trigger("change");
            } else {
                return returnTimePickerValue(".win-timepicker-period", false);
            }
        },

        startDate: function(theDate) {
            if (Jx.isDefined(theDate)) {
                runDatePickerFunction("StartDateCombo", theDate);
            } else {
                return returnDatePickerValue("StartDateCombo");
            }
        },

        setDateAndTime: function (theDate, isEnd) {
            var hour = theDate.getHours();
            var minute = theDate.getMinutes();
            var ampm = hour < 12 ? 'AM' : 'PM';
            hour = hour % 12;
            if (hour === 0) {
                hour = 12;
            }

            if (isEnd) {
                EventDetailsLib.duration(EventDetailsLib.durationCustom);
                EventDetailsLib.endDate(theDate);
            } else {
                EventDetailsLib.startDate(theDate);
            }

            EventDetailsLib.hour(hour, isEnd);
            EventDetailsLib.minute(minute, isEnd);
            EventDetailsLib.ampm(ampm, isEnd);
        },

        endDate: function(theDate) {
            if (Jx.isDefined(theDate)) {
                runDatePickerFunction("EndDateCombo", theDate);
            } else {
                return returnDatePickerValue("EndDateCombo");
            }
        },

        endRecurrenceDate: function (theDate) {
            if (Jx.isDefined(theDate)) {
                runDatePickerFunction("EndOccurrenceCombo", theDate);
            } else {
                return returnDatePickerValue("EndOccurrenceCombo");
            }
        },

        /// OWNER: AlGore
        ///
        /// Clicks the Cancel button when the UI is inside of the Event Details page and waits for
        /// the specified event to fire before returning
        closeEvent: function (viewChangeEvent, savePromptExpected) {
            return new WinJS.Promise(function (complete) {
                if (savePromptExpected) {
                    $(document).on("DOMNodeInserted", function cb(ev/*, data*/) {
                        if ("win-flyoutmenuclickeater" !== ev.target.className) {
                            Tx.log("DOMNodeInserted (not the menuclickeater)");
                            $(document).off("DOMNodeInserted", cb);
                            setTimeout(function () {                                
                                BVT.marks.once(viewChangeEvent, function (s) {
                                    Tx.log("Found event " + s);
                                    setTimeout(function () {
                                        // Sleeping 3 seconds to allow view to populate
                                        complete(s);
                                    }, 3000);
                                });

                                $(".win-disposable.win-command").last().click();
                                Tx.log("Clicked flyout");
                            }, 500);
                        }
                    });
                }
                else {
                    // Save prompt not expected to fire, so we just wait for viewChangeEvent
                    BVT.marks.once(viewChangeEvent, function (s) {
                        Tx.log("Found event " + s);
                        setTimeout(function () {
                            // Sleeping 3 seconds to allow view to populate
                            complete(s);
                        }, 3000);
                    });
                }

                $("#cedCancel").click();
                Tx.log("Event Details closed.");
            });
        },

        /// OWNER: AlGore
        ///
        /// Clicks the Save button when the UI is inside of the Event Details page and waits for
        /// the specified event to fire before returning
        saveEvent: function (viewChangeEvent) {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once(viewChangeEvent, function (s) {
                    Tx.log("Found event " + s);
                    BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function (s) {
                        Tx.log("Loaded events " + s);
                        setTimeout(function () {
                            // Sleeping 3 seconds to allow view to populate
                            complete(s);
                        }, 3000);
                    });
                });

                $("#cedSave").click();
                Tx.log("Event saved.");
            });
        },

        /// OWNER: StevenRy
        ///
        /// Clicks the Send button in Event Details and waits for the specified event to fire
        /// before returning
        sendEvent: function(viewChangeEvent) {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once(viewChangeEvent, function (s) {
                    Tx.log("Found event " + s);
                    BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function (s) {
                        Tx.log("Loaded events " + s);
                        setTimeout(function () {
                            // Sleeping 3 seconds to allow view to populate
                            complete(s);
                        }, 3000);
                    });
                });

                $("#cedSend").click();
                Tx.log("Event sent.");
            });
        },

        title: function (newTitle) {
            if (newTitle) {
                $("#EventTitleTextbox").val(newTitle);
            }
            else {
                return $("#EventTitleTextbox").val();
            }
        },

        /// OWNER: AlGore
        ///
        /// Clicks the Delete button when the UI is inside of the Event Details page and waits for
        /// the specified event to fire before returning
        deleteEvent: function (viewChangeEvent) {
            var eventTitle = this.title();

            return new WinJS.Promise(function (complete) {
                // Click on the "Confirm delete" dialog after clicking on the button.
                $(document).on("DOMNodeInserted", function cb(ev/*, data*/) {
                    if ("win-flyoutmenuclickeater" !== ev.target.className) {
                        Tx.log("DOMNodeInserted (not the menuclickeater)");
                        $(document).off("DOMNodeInserted", cb);
                        setTimeout(function () {
                            BVT.marks.once(viewChangeEvent, function (s) {
                                Tx.log("Found event " + s);
                                setTimeout(function () {
                                    // Sleeping 3 seconds to allow view to populate
                                    verifyDelete(viewChangeEvent, eventTitle);
                                    complete(s);
                                }, 3000);
                            });

                            $(".cal-flyout-button").click();
                            Tx.log("Clicked flyout");
                        }, 500);
                    }
                });
                Tx.log("Clicking delete");
                $("#cedDelete").click();
                Tx.log("Delete clicked");
            });
        },

        // Waits until the event details page appears.
        // Will time out after the specified number of milliseconds.
        waitUntilShown: function (timeout) {
           return new WinJS.Promise(function (complete, error) {
              // Set a timeout of 3 seconds by default if none is specified.
              if (!timeout) {
                 timeout = 3000;
              }

              var handle = setTimeout(function () {
                 error("timeout waiting for Event Details");
              }, timeout);

              BVT.marks.once(EventDetailsLib.evtDetailsReady, function () {
                 if (handle) {
                    clearTimeout(handle);
                 }
                 Tx.log("Event Details found.");
                 complete();
              });
           });
        },

        location: function (newLocation) {
            if (newLocation) {
                $("#LocationTextbox").val(newLocation);
            }
            else {
                return $("#LocationTextbox").val();
            }
        },

        duration: function (index) {
            // 0 = 0 minutes
            // 1 = 30 minutes
            // ...
            // 6 = Custom
            if (undefined !== index) {
                $("#EventDuration").prop("selectedIndex", index);
                $("#EventDuration").trigger("change");
            }
            else {
                return $("#EventDuration").prop("selectedIndex");
            }
        },

        reminder: function (index) {
            // 0 = No reminder
            // 1 = 5 minutes, etc
            if (undefined !== index) {
                $("#ReminderCombo").prop("selectedIndex", index);
                $("#ReminderCombo").trigger("change");
            }
            else {
                return $("#ReminderCombo").prop("selectedIndex");
            }
        },

        busyStatus: function (index) {
            // 0 = Free, 1 = Busy, 2 = Tentative, 3 = OOF
            if (undefined !== index) {
                $("#StatusCombo").prop("selectedIndex", index);
                $("#StatusCombo").trigger("change");
            }
            else {
                return $("#StatusCombo").prop("selectedIndex");
            }
        },

        isPrivate: function (priv) {
            if (undefined !== priv) {
                $("#PrivateCheckbox").prop("checked", priv);
            }
            else {
                return $("#PrivateCheckbox").prop("checked");
            }
        },

        recurrence: function (index) {
            // 0 = Once
            // 1 = Every day
            // 2 = Every weekday
            // 3 = Every week
            // 4 = Every month
            // 5 = Every year
            if (undefined !== index) {
                $("#RecurrenceCombo").prop("selectedIndex", index);
            }
            else {
                return $("#RecurrenceCombo").prop("selectedIndex");
            }
        },

        /// Adds the specified name/email pair to the Who field
        attendeeAdd: function (name, email) {
            var ed = Debug.view;
            var recipient = AddressWell.Recipient.fromEmail(email, name, ed._getPlatform());
            ed._who.addRecipients([recipient], false);

            this.attendeeFind(name, email);  // function asserts
        },

        /// Asserts whether a specified name/email pair exists 
        /// in the Who field. Defaults to numExpected = 1.
        attendeeFind: function (name, email, numExpected) {
            if (numExpected === undefined) {
                numExpected = 1;
            }
            
            var ed = Debug.view;
            var recipients = ed._who.getRecipients();
            var count = 0;
            for (var i = 0; i < recipients.length; i++) {
                var rec = recipients[i];
                if (rec.fastName === name && rec.emailAddress === email) {
                    count++;
                }
            }

            Tx.assert(numExpected === count, "Incorrect count of attendee: " + name + " " + email + " - " + "Expected=" + numExpected + ",Actual=" + count);
        },

        /// Clears all attendees on the meeting
        attendeeClear: function () {
            var ed = Debug.view;
            ed._who.clearInput();

            Tx.assert(ed._who.getRecipients().length === 0, "Attendees not cleared!");
        },

        selectedCalendar: function (/*name*/) {
            // TODO: Get/Set the selected calendar here.
        }
    }; // Public Functions
}(); // EventDetailsLib

// Some enumeration-like variables for easier testing.
EventDetailsLib.reminderNone = 0;
EventDetailsLib.reminderFiveMins = 1;
EventDetailsLib.reminderFifteenMins = 2;
EventDetailsLib.reminderThirtyMins = 3;
EventDetailsLib.reminderOneHour = 4;
EventDetailsLib.reminderEighteenHours = 5;
EventDetailsLib.reminderOneDay = 6;
EventDetailsLib.reminderOneWeek = 7;

EventDetailsLib.busyStatusFree = 0;
EventDetailsLib.busyStatusBusy = 1;
EventDetailsLib.busyStatusTentative = 2;
EventDetailsLib.busyStatusOof = 3;

EventDetailsLib.durationZeroMins = 0;
EventDetailsLib.durationThirtyMins = 1;
EventDetailsLib.durationSixtyMins = 2;
EventDetailsLib.durationNinetyMins = 3;
EventDetailsLib.durationOneHundredTwentyMins = 4;
EventDetailsLib.durationAllDay = 5;
EventDetailsLib.durationCustom = 6;

EventDetailsLib.recurrenceNone = 0;
EventDetailsLib.recurrenceDaily = 1;
EventDetailsLib.recurrenceWeekdays = 2;
EventDetailsLib.recurrenceMWF = 3;
EventDetailsLib.recurrenceTuTh = 4;
EventDetailsLib.recurrenceWeekly = 5;
EventDetailsLib.recurrenceMonthly = 6;
EventDetailsLib.recurrenceYearly = 7;



/// OWNER: StevenRy
var QuickEventLib = function () {

    // PRIVATE FUNCTIONS
    
    return {
        // PUBLIC FUNCTIONS

        title: function (newTitle) {
            if (newTitle) {
                $("#qeSubject").val(newTitle);
            }
            else {
                return $("#qeSubject").val();
            }
        },

        location: function (newLocation) {
            if (newLocation) {
                $("#qeLocation").val(newLocation);
            }
            else {
                return $("#qeLocation").val();
            }
        },

        goToEventDetails: function () {
            return new WinJS.Promise(function (complete) {
                var handle = setTimeout(function () {
                     error("Timeout waiting for Quick Event Creation calendar selector");
                }, 3000);

                // Click on the "Add more details" button after clicking on the chevron.
                $(document).on("DOMNodeInserted", function cb() {
                    if ($("#CalendarCombo").length === 1) {
                        if (handle) {
                            clearTimeout(handle);
                        }
                        $(document).off("DOMNodeInserted", cb);

                        // Explicitly waiting to allow calendar selector initialization
                        setTimeout(function () {
                            // Setup a wait for Event Details
                            EventDetailsLib.waitUntilShown().then(function () { complete(); });

                            Tx.log("Clicking event details link");
                            $("#eventDetailsLink").click();
                            Tx.log("Event details link clicked.");
                        }, 500);
                    }
                });

                Tx.log("Clicking chevron");
                $("#qeCaret").click();
                Tx.log("Chevron clicked.");
            });
        },

        /// TODO: Enable month view, all day area, and arbitrary day in the timeline.
        invokeQuickEventCreation: function (hourToClick) {
            return new WinJS.Promise(function (complete, error) {
                var handle = setTimeout(function () {
                    error("Timeout waiting for Quick Event Creation");
                }, 3000);

                $(document).on("DOMNodeInserted", function cb() {
                    if ($(".quickEvent").length !== 0) {
                        if (handle) {
                            clearTimeout(handle);
                        }

                        Tx.log("Quick Event Creation inserted");
                        $(document).off("DOMNodeInserted", cb);
                        complete();
                    }
                });
                
                var root;
                switch (CalendarLib.getCurrentView()) {
                    case "dayview":
                        root = $(".day")[0]._events.parentNode;
                        break;
                    case "weekview":
                        root = $(".grid .events")[0];
                        break;
                    case "weekview workweek":
                        root = $(".grid .events")[0];
                        break;
                    default:
                        break;                        
                }
                Tx.assert(undefined !== root, "QuickEventLib cannot find current view");
                
                var ev = $.Event("click");
                var firstDate = CalendarLib.getVisibleDates()[0];
                Debug.view._createEvent(ev, root, new Date(firstDate.getYear(), firstDate.getMonth(), firstDate.getDate(), hourToClick), false);
            });
        }
    }; // PUBLIC FUNCTIONS
}(); // QuickEventLib
