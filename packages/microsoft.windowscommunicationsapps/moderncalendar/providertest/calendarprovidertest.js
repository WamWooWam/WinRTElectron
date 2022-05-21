
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Windows,WinJS*/

(function () {
    "use strict";

    var currentView = "add";

    var AppointmentManager = Windows.ApplicationModel.Appointments.AppointmentManager;

    function initialize() {
        // Called after script is loaded at the end of this file
        document.querySelector("#viewButton").addEventListener("click", viewCalendar, false);
        document.querySelector("#createButton").addEventListener("click", createAndAddAppointment, false);
        document.querySelector("#removeButton").addEventListener("click", removeAppointmentAction, false);
        document.querySelector("#replaceButton").addEventListener("click", replaceAppointmentAction, false);
        document.querySelector("#organizerRadioButton").addEventListener("click", organizerRadioSelectedHandler, false);
        document.querySelector("#inviteeRadioButton").addEventListener("click", inviteeRadioSelectedHandler, false);
        document.querySelector("#noneRadioButton").addEventListener("click", noneRadioSelectedHandler, false);
        document.querySelector("#actionOnInstance").addEventListener("click", onInstanceChangeHandler, false);
        document.querySelector("#inputSelect").addEventListener("click", toggle, false);
        document.querySelector("#actionSelect").addEventListener("click", toggle, false);

        // This creates the date pickers
        WinJS.UI.processAll();
    }

    function viewCalendar() {
        /// <summary>Activates the "view" action in the appointment provider</summary>

        var viewTime = getDateTimeFromControls(document.querySelector('#viewDatePicker').winControl, document.querySelector('#viewTimePicker').winControl);
        var duration = getDurationFromInput(document.querySelector("#viewDurationBox"), document.querySelector("#viewDurationOption"), minutesToAppointmentType(60 * 8));

        AppointmentManager.showTimeFrameAsync(viewTime, duration);
    }

    function replaceAppointmentAction(ev) {
        /// <summary>Calls the calendar provider to replace the appointment as specified by UI fields</summary>
        var appointmentId = document.querySelector("#idBox").value;

        var appointment = createAppointment();

        replaceAppointment(ev.target, appointment, appointmentId, getInstanceStartDate());
    }

    function removeAppointmentAction(ev) {
        /// <summary>Calls the calendar provider to remove the appointment specified by UI fields</summary>
        var appointmentId = document.querySelector("#idBox").value;

        deleteAppointment(ev.target, appointmentId, getInstanceStartDate());
    }

    function createAndAddAppointment() {
        /// <summary>Creates the appointment based on UI user input and adds it via the calendar provider.</summary>

        var appointment;

        if (currentView === "addDefault") {
            appointment = new Windows.ApplicationModel.Appointments.Appointment();
        } else {
            appointment = createAppointment();
        }

        addAppointment(appointment);
    }

   
    function minutesToAppointmentType(minutes) {
        /// <summary>Converts an integer number of minutes to a value suitable for placing in the appointment object</summary>
        /// <param name="minutes" type="Number">Number of minutes</param>

        // Time is expected to be in milliseconds
        return minutes * 60000;
    }

    function getInstanceStartDate() {
        /// <summary>Returns the instanceStartDate to use with remove/replace request, or null if it should not be used.</summary>

        var instanceStartDate = null;

        if (document.querySelector("#actionOnInstance").checked) {
            instanceStartDate = getDateTimeFromControls(document.querySelector("#instanceDatePicker").winControl, document.querySelector("#instanceTimePicker").winControl);
        }

        return instanceStartDate;
    }

    function getDateTimeFromControls(dateControl, timeControl) {
        /// <summary>Given a date and time control, returns the composite DateTime.</summary>

        var date = dateControl.current;
        var time = timeControl.current;
        
        date.setMinutes(time.getMinutes());
        date.setHours(time.getHours());
        
        return date;
    }

    function getDurationFromInput(durationInput, optionInput, defaultValue) {
        /// <summary>Puts together a duration int (in appointment-appropriate units) from a number + option control</summary>

        // This input element contains free text, which we will try to turn into an int.
        var duration = parseInt(durationInput.value, 10);
        if (isNaN(duration)) {
            // Visual indicator that we couldn't parse the value
            durationInput.value = "><";
            return defaultValue;
        }

        var finalDuration;

        switch (optionInput.value) {
            case "raw":
                finalDuration = duration;
                break;
            case "day":
                finalDuration = minutesToAppointmentType(60 * 24 * duration);
                break;
            case "hour":
                finalDuration = minutesToAppointmentType(60 * duration);
                break;
            case "minute":
                /*falls through*/
            default:
                finalDuration = minutesToAppointmentType(duration);
                break;
        }

        return finalDuration;
    }

    function createAppointment() {
        /// <summary>Creates and returns an appointment object based on UI user input</summary>

        var appointment = new Windows.ApplicationModel.Appointments.Appointment();

        // StartTime
        var startTime = getDateTimeFromControls(document.querySelector('#startDatePicker').winControl, document.querySelector('#startTimePicker').winControl);
        appointment.startTime = startTime;

        // Subject
        appointment.subject = document.querySelector('#subjectInput').value;

        // Location
        appointment.location = document.querySelector('#locationInput').value;

        // Details
        appointment.details = document.querySelector('#detailsInput').value;

        // Duration
        appointment.duration = getDurationFromInput(document.querySelector("#durationInput"), document.querySelector("#durationOption"), minutesToAppointmentType(30));

        // All Day
        appointment.allDay = (document.querySelector('#allDayCheckBox').checked);

        // Reminder
        if (document.querySelector('#reminderCheckBox').checked) {
            appointment.reminder = getDurationFromInput(document.querySelector("#reminderInput"), document.querySelector("#reminderSelect"), minutesToAppointmentType(15));
        }

        //Busy Status
        switch (document.querySelector('#busyStatusSelect').selectedIndex) {
            case 0:
                appointment.busyStatus = Windows.ApplicationModel.Appointments.AppointmentBusyStatus.busy;
                break;
            case 1:
                appointment.busyStatus = Windows.ApplicationModel.Appointments.AppointmentBusyStatus.tentative;
                break;
            case 2:
                appointment.busyStatus = Windows.ApplicationModel.Appointments.AppointmentBusyStatus.free;
                break;
            case 3:
                appointment.busyStatus = Windows.ApplicationModel.Appointments.AppointmentBusyStatus.outOfOffice;
                break;
            case 4:
                appointment.busyStatus = Windows.ApplicationModel.Appointments.AppointmentBusyStatus.workingElsewhere;
                break;
        }

        // Sensitivity
        switch (document.querySelector('#sensitivitySelect').selectedIndex) {
            case 0:
                appointment.sensitivity = Windows.ApplicationModel.Appointments.AppointmentSensitivity.public;
                break;
            case 1:
                appointment.sensitivity = Windows.ApplicationModel.Appointments.AppointmentSensitivity.private;
                break;
        }

        // Uri
        var uriValue = document.querySelector('#uriInput').value;
        if (uriValue.length > 0) {
            try {
                appointment.uri = new Windows.Foundation.Uri(uriValue);
            } catch (e) {
                document.querySelector('#result').innerText = "The Uri provided is invalid. Continuing without the Uri.";
            }
        }

        // Organizer
        // Note: Organizer can only be set if there are no invitees added to this appointment.
        if (document.querySelector('#organizerRadioButton').checked) {
            var organizer = new Windows.ApplicationModel.Appointments.AppointmentOrganizer();

            // Organizer Display Name
            organizer.displayName = document.querySelector('#organizerDisplayNameInput').value;

            // Organizer Address (e.g. Email Address)
            organizer.address = document.querySelector('#organizerAddressInput').value;
            appointment.organizer = organizer;
        }

        // Invitees
        // Note: If the size of the Invitees list is not zero, then an Organizer cannot be set.
        if (document.querySelector('#inviteeRadioButton').checked) {
            var invitee = new Windows.ApplicationModel.Appointments.AppointmentInvitee();

            // Invitee Display Name
            invitee.displayName = document.querySelector('#inviteeDisplayNameInput').value;


            // Invitee Address (e.g. Email Address)
            invitee.address = document.querySelector('#inviteAddressInput').value;

            // Invitee Role
            switch (document.querySelector('#inviteeRoleSelect').selectedIndex) {
                case 0:
                    invitee.role = Windows.ApplicationModel.Appointments.AppointmentParticipantRole.requiredAttendee;
                    break;
                case 1:
                    invitee.role = Windows.ApplicationModel.Appointments.AppointmentParticipantRole.optionalAttendee;
                    break;
                case 2:
                    invitee.role = Windows.ApplicationModel.Appointments.AppointmentParticipantRole.resource;
                    break;
            }

            // Invitee Response
            switch (document.querySelector('#inviteeResponseSelect').selectedIndex) {
                case 0:
                    invitee.response = Windows.ApplicationModel.Appointments.AppointmentParticipantResponse.none;
                    break;
                case 1:
                    invitee.response = Windows.ApplicationModel.Appointments.AppointmentParticipantResponse.tentative;
                    break;
                case 2:
                    invitee.response = Windows.ApplicationModel.Appointments.AppointmentParticipantResponse.accepted;
                    break;
                case 3:
                    invitee.response = Windows.ApplicationModel.Appointments.AppointmentParticipantResponse.declined;
                    break;
                case 4:
                    invitee.response = Windows.ApplicationModel.Appointments.AppointmentParticipantResponse.unknown;
                    break;
            }

            appointment.invitees.append(invitee);
        }

        if (document.querySelector("#recurringCheck").checked) {
            appointment.recurrence = createRecurrence();
        }

        return appointment;
    }

    function createRecurrence() {
        /// <summary>Creates recurrence object based on user input fields.</summary>

        var recurrence = new Windows.ApplicationModel.Appointments.AppointmentRecurrence();

        // Unit
        var unit = parseInt(document.querySelector('#unitSelect').value, 10);
        if (!isNaN(unit)) {
            recurrence.unit = unit;
        }

        // Note: Occurrences and Until properties are mutually exclusive, but since this is a test app we'll allow them both to be specified.

        // Occurrences
        if (document.querySelector('#occurrencesCheck').checked) {
            var occurrences = parseInt(document.querySelector('#occurrencesRange').value, 10);

            if (!isNaN(occurrences)) {
                recurrence.occurrences = occurrences;
            }
        }

        // Until
        if (document.querySelector('#untilCheck').checked) {
            recurrence.until = document.querySelector('#untilDatePicker').winControl.current;
        }

        // Interval

        var interval = parseInt(document.querySelector('#intervalRange').value, 10);
        if (!isNaN(interval)) {
            recurrence.interval = interval;
        }

        // Week of the month
        switch (document.querySelector('#weekOfMonthSelect').selectedIndex) {
            case 0:
                recurrence.weekOfMonth = Windows.ApplicationModel.Appointments.AppointmentWeekOfMonth.first;
                break;
            case 1:
                recurrence.weekOfMonth = Windows.ApplicationModel.Appointments.AppointmentWeekOfMonth.second;
                break;
            case 2:
                recurrence.weekOfMonth = Windows.ApplicationModel.Appointments.AppointmentWeekOfMonth.third;
                break;
            case 3:
                recurrence.weekOfMonth = Windows.ApplicationModel.Appointments.AppointmentWeekOfMonth.fourth;
                break;
            case 4:
                recurrence.weekOfMonth = Windows.ApplicationModel.Appointments.AppointmentWeekOfMonth.last;
                break;
            default:
                // Invalid
                recurrence.weekOfMonth = 200;
                break;
        }

        // Days of the Week
        if (document.querySelector('#sundayCheckBox').checked) { recurrence.daysOfWeek |= Windows.ApplicationModel.Appointments.AppointmentDaysOfWeek.sunday; }
        if (document.querySelector('#mondayCheckBox').checked) { recurrence.daysOfWeek |= Windows.ApplicationModel.Appointments.AppointmentDaysOfWeek.monday; }
        if (document.querySelector('#tuesdayCheckBox').checked) { recurrence.daysOfWeek |= Windows.ApplicationModel.Appointments.AppointmentDaysOfWeek.tuesday; }
        if (document.querySelector('#wednesdayCheckBox').checked) { recurrence.daysOfWeek |= Windows.ApplicationModel.Appointments.AppointmentDaysOfWeek.wednesday; }
        if (document.querySelector('#thursdayCheckBox').checked) { recurrence.daysOfWeek |= Windows.ApplicationModel.Appointments.AppointmentDaysOfWeek.thursday; }
        if (document.querySelector('#fridayCheckBox').checked) { recurrence.daysOfWeek |= Windows.ApplicationModel.Appointments.AppointmentDaysOfWeek.friday; }
        if (document.querySelector('#saturdayCheckBox').checked) { recurrence.daysOfWeek |= Windows.ApplicationModel.Appointments.AppointmentDaysOfWeek.saturday; }
        if (document.querySelector('#invalidCheckBox').checked) { recurrence.daysOfWeek |= 0x200; } // invalid value

        // Month of the year
        var month = parseInt(document.querySelector('#monthOfYearRange').value, 10);
        if (!isNaN(month)) {
            recurrence.month = month;
        }

        // Day of the month
        var day = parseInt(document.querySelector('#dayOfMonthRange').value, 10);
        if (!isNaN(day)) {
            recurrence.day = day;
        }

        return recurrence;
    }

    function populateIdBoxes(uid) {
        /// <summary>Populates all UID-related textboxes with the given UID</summary>

        var idBoxes = document.querySelectorAll(".idBox");

        for (var i = 0; i < idBoxes.length; i++) {
            idBoxes[i].value = uid;
        }
    }

    function displayAppointmentResult(appointmentId) {
        /// <summary>Puts HTML in the result area</summary>

        var resultArea = document.querySelector('#result');

        if (appointmentId) {
            resultArea.innerText = 'Appointment Id: ' + appointmentId;
            populateIdBoxes(appointmentId);
        } else {
            resultArea.innerText = "Appointment not saved successfully.";
        }
    }

    function replaceAppointment(sourceElement, appointment, appointmentId, instanceStartDate) {
        /// <summary>Calls the calendar provider to replace the specified appointment</summary>

        // Get the selection rect of the button pressed to add this appointment
        var boundingRect = sourceElement.getBoundingClientRect();
        var selectionRect = { x: boundingRect.left, y: boundingRect.top, width: boundingRect.width, height: boundingRect.height };

        try {
            var promise;
            if (instanceStartDate) {
                promise = AppointmentManager.showReplaceAppointmentAsync(appointmentId, appointment, selectionRect, Windows.UI.Popups.Placement.default, instanceStartDate);
            } else {
                promise = AppointmentManager.showReplaceAppointmentAsync(appointmentId, appointment, selectionRect, Windows.UI.Popups.Placement.default);
            }

            promise.done(displayAppointmentResult, function replaceError() {
                document.querySelector('#result').innerText = "Appointment was not saved.";
            });
        } catch (e) {
            var exceptionMessage;
            if (e.message) {
                exceptionMessage = e.message;
            } else {
                exceptionMessage = e.toString();
            }
            document.querySelector("#result").innerText = "showReplaceAppointmentAsync failed to start: " + exceptionMessage;
        }
    }

    function deleteAppointment(sourceElement, appointmentId, instanceStartDate) {
        /// <summary>Calls the calendar provider to remove specified appointment</summary>

        // Get the selection rect of the button pressed to add this appointment
        var boundingRect = sourceElement.getBoundingClientRect();
        var selectionRect = { x: boundingRect.left, y: boundingRect.top, width: boundingRect.width, height: boundingRect.height };

        try {
            var promise;

            if (instanceStartDate) {
                promise = AppointmentManager.showRemoveAppointmentAsync(appointmentId, selectionRect, Windows.UI.Popups.Placement.default, instanceStartDate);
            } else {
                promise = AppointmentManager.showRemoveAppointmentAsync(appointmentId, selectionRect, Windows.UI.Popups.Placement.default);
            }

            promise.done(function removeSuccess(success) {
                if (success) {
                    document.querySelector('#result').innerText = "Appointment removed successfully.";
                } else {
                    document.querySelector('#result').innerText = "Appointment was not removed.";
                }
            }, function removeError() {
                document.querySelector('#result').innerText = "Appointment was not removed.";
            });
        } catch (e) {
            var exceptionMessage;
            if (e.message) {
                exceptionMessage = e.message;
            } else {
                exceptionMessage = e.toString();
            }
            document.querySelector("#result").innerText = "showRemoveAppointmentAsync failed to start: " + exceptionMessage;
        }
    }

    function addAppointment(appointment) {
        /// <summary>Adds the given appointment via appointment provider</summary>

        // Get the selection rect of the button pressed to add this appointment
        var boundingRect = document.getElementById("createButton").getBoundingClientRect();
        var selectionRect = { x: boundingRect.left, y: boundingRect.top, width: boundingRect.width, height: boundingRect.height };

        // ShowAddAppointmentAsync returns an appointment id if the appointment given was added to the user's calendar.
        // This value should be stored in app data and roamed so that the appointment can be replaced or removed in the future.
        // An empty string return value indicates that the user canceled the operation before the appointment was added.
        try {
            AppointmentManager.showAddAppointmentAsync(appointment, selectionRect, Windows.UI.Popups.Placement.default)
                .done(displayAppointmentResult);
        } catch (e) {
            var exceptionMessage;
            if (e.message) {
                exceptionMessage = e.message;
            } else {
                exceptionMessage = e.toString();
            }
            document.querySelector("#result").innerText = "showAddAppointment failed: " + exceptionMessage;
        }
    }

    function organizerRadioSelectedHandler() {
        /// <summary>Handles "organizer" radio button selection</summary>

        // show organizer area, hide invitee area
        document.querySelector('#inviteeDiv').style.display = "none";
        document.querySelector('#organizerDiv').style.display = "";
    }

    function inviteeRadioSelectedHandler() {
        /// <summary>Handles "invitee" radio button selection</summary>

        // show invitee area, hide organizer area
        document.querySelector('#organizerDiv').style.display = "none";
        document.querySelector('#inviteeDiv').style.display = "";
    }

    function noneRadioSelectedHandler() {
        /// <summary>Handles "none" radio button selection</summary>

        // hide organizer and invitee area
        document.querySelector('#organizerDiv').style.display = "none";
        document.querySelector('#inviteeDiv').style.display = "none";
    }

    function onInstanceChangeHandler() {
        /// <summary>Handles checking the box to show the instance selection fields</summary>

        var dateBox = document.querySelector("#instanceDatePicker");
        var timeBox = document.querySelector("#instanceTimePicker");

        if (document.querySelector("#actionOnInstance").checked) {
            dateBox.style.display = "";
            timeBox.style.display = "";
        } else {
            dateBox.style.display = "none";
            timeBox.style.display = "none";
        }
    }

    function toggle () {
        /// <summary>Shows/hides appropriate UI based on current settings.</summary>

        currentView = document.querySelector("#actionSelect").value;
        var currentInputOption = document.querySelector("#inputSelect").value;

        var hidableElements = document.querySelectorAll(".actionToggle, .inputToggle");

        for (var i = 0; i < hidableElements.length; i++) {
            var shouldShow = true;
            var element = hidableElements[i];

            if (element.classList.contains("actionToggle") && !element.classList.contains(currentView)){
                shouldShow = false;
            }

            if (element.classList.contains("inputToggle") && !element.classList.contains(currentInputOption)) {
                shouldShow = false;
            }

            if (shouldShow) {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        }
    }

    initialize();
})();
