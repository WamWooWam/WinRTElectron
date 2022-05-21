
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug,Calendar,Jx,Microsoft,toStaticHTML,Windows*/

Jx.delayDefine(Calendar, "ProviderConverter", function () {

    function _start(s) { Jx.mark("Calendar.ProviderConverter." + s + ",StartTA,Calendar,App"); }
    function _stop(s) { Jx.mark("Calendar.ProviderConverter." + s + ",StopTA,Calendar,App"); }

    var Helpers = Calendar.Helpers;
    var Appointments = Windows.ApplicationModel.Appointments;
    var CalPlat = Microsoft.WindowsLive.Platform.Calendar;
    var Status = CalPlat.Status;
    var Hresult = Calendar.ProviderHresult;

    function _msToMinutes(milliSeconds) {
        /// <summary>Converts from milliSeconds to minutes</summary>
        /// <param name="milliSeconds" type="Number">Unit of time in milliSeconds</param>
        /// <returns type="Number">Rounded number of minutes</returns>

        return Math.round(milliSeconds / Helpers.minuteInMilliseconds);
    }

    function _busyStatusWithCalendar(busyStatus, calendar) {
        /// <summary>Returns busyStatus to use given that the event will be on the given calendar</summary>

        var updatedBusyStatus = busyStatus;

        if (busyStatus === CalPlat.BusyStatus.workingElsewhere) {
            if ((calendar.capabilities & CalPlat.ServerCapability.statusWorkingElsewhere) !== CalPlat.ServerCapability.statusWorkingElsewhere) {
                // This calendar does not support working elsewhere (recent EAS changes make it likely that this will be true for any calendar)
                updatedBusyStatus = CalPlat.BusyStatus.free;
            }
        }

        return updatedBusyStatus;
    }

    function _getRecurrenceEventLogErrorDetails(appointment) {
        /// <summary>Returns the event log error details for the appointment</summary>
        /// <param name="appointment" type="Windows.ApplicationModel.Appointments.IAppointment">Appointment information from API</param>

        // These strings are not localized since they are describing fields in the appointment object, and the object fields are not localized.  This error string goes in the event log.
        return Jx.res.getString("ProviderErrorRecurrenceLog") +
            "unit: " + appointment.recurrence.unit +
            ", occurrences: " + appointment.recurrence.occurrences +
            ", until: " + appointment.recurrence.until +
            ", interval: " + appointment.recurrence.interval +
            ", daysOfWeek: " + appointment.recurrence.daysOfWeek +
            ", weekOfMonth: " + appointment.recurrence.weekOfMonth +
            ", month: " + appointment.recurrence.month +
            ", day: " + appointment.recurrence.day + ".";
    }

    function _convertBusyStatus(appointmentBusyStatus) {
        /// <summary>Converts the given busy status into a value suitable for saving to our platform</summary>
        /// <param name="appointmentBusyStatus" type="Windows.ApplicationModel.Appointments.AppointmentBusyStatus">input busy status</param>
        /// <returns type="Microsoft.WindowsLive.Platform.Calendar.BusyStatus" />

        var AppointmentBusyStatus = Appointments.AppointmentBusyStatus;
        var busyStatus;
        switch (appointmentBusyStatus) {
            case AppointmentBusyStatus.free:
                busyStatus = CalPlat.BusyStatus.free;
                break;
            case AppointmentBusyStatus.tentative:
                busyStatus = CalPlat.BusyStatus.tentative;
                break;
            case AppointmentBusyStatus.outOfOffice:
                busyStatus = CalPlat.BusyStatus.outOfOffice;
                break;
            case AppointmentBusyStatus.workingElsewhere:
                busyStatus = CalPlat.BusyStatus.workingElsewhere;
                break;
            case AppointmentBusyStatus.busy:
                /*falls through*/
            default:
                // Busy is also the default if we get a bad value
                busyStatus = CalPlat.BusyStatus.busy;
                break;
        }

        return busyStatus;
    }

    function _convertDates (originalStartDate, duration, isAllDay) {
        /// <summary>Given the information from the appointment, calculates and returns start/end dates</summary>
        /// <param name="originalStartDate" type="Date">Date(+time) of event start</param>
        /// <param name="duration" type="Number">"TimeSpan" duration of the event in milliseconds.</param>
        /// <param name="isAllDay" type="Boolean">Indicates whether this is an "all day" event</param>
        /// <returns>Object containing startDate, endDate</returns>

        // Windows API will validate this
        Debug.assert(duration >= 0, "Duration should not be negative");

        var endDate = new Date(originalStartDate.getTime() + duration);
        // We need to change the startDate into a JS start date in case it was a native one, since the resolutions are different.
        // Otherwise, there are issues with zero-duration events where the end date can be slightly before the start date.
        var startDate = new Date(originalStartDate);

        if (isAllDay) {
            // Make sure that the start/end dates land on midnights

            // Round the startDate down
            startDate = new Date(originalStartDate.getFullYear(), originalStartDate.getMonth(), originalStartDate.getDate());

            var dateAdjustment = 0;
            if (endDate.getHours() > 0 || endDate.getMinutes() > 0 || endDate.getSeconds() > 0 || endDate.getMilliseconds() > 0) {
                // Round the end date up if it's not already on a date boundary
                dateAdjustment = 1;
            }
            endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + dateAdjustment);

            if (endDate <= startDate) {
                // Increase the date by one if it's the same as the start date
                endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
            }

            Debug.assert(endDate > startDate, "End date should be after start date for all day events");
        }

        Debug.assert(endDate >= startDate, "End date should not be less than start date");

        return {
            startDate: startDate,
            endDate: endDate
        };
    }

    function _convertOrganizer (appointmentOrganizer) {
        /// <summary>Given organizer info from appointment, clean up the values and determine whether we should populate the organizer related fields</summary>
        /// <param name="appointmentOrganizer" type="Windows.ApplicationModel.Appointments.AppointmentOrganizer">Organizer info from appointment</param>
        /// <returns>Object containing organizerName, organizerEmail, hasOrganizer</returns>

        var organizerName = null,
            organizerEmail = null,
            hasOrganizer = false;

        if (appointmentOrganizer) {
            organizerName = appointmentOrganizer.displayName;
            organizerEmail = appointmentOrganizer.address;

            // Trim the strings to avoid marking as a meeting when we receive only-whitespace values
            if (Jx.isNonEmptyString(organizerEmail)) {
                organizerEmail = organizerEmail.trim();
            }

            if (Jx.isNonEmptyString(organizerEmail)) {
                hasOrganizer = true;

                // Organizer email is not optional, only set name if we have the email
                if (Jx.isNonEmptyString(organizerName)) {
                    organizerName = organizerName.trim();
                }
            }
        }

        return {
            organizerName: organizerName,
            organizerEmail: organizerEmail,
            hasOrganizer: hasOrganizer
        };
    }

    function _getHresult (exception) {
        /// <summary>Given an error object, returns the associated hresult.</summary>
        /// <param name="exception" type="Error">Exception</param>

        var hresult = exception.number;
        if (!Jx.isNumber(hresult) || hresult === 0) {
            // Make sure we have an error value
            hresult = Hresult.generalFailure;
        }

        return hresult;
    }

    function _tryConvertDayOfWeek(recurrence, event) {
        /// <summary>Given recurrence info from appointment, convert dayOfWeek and put it into the given event object. </summary>
        /// <param name="recurrence" type="Windows.ApplicationModel.Appointments.AppointmentRecurrence">recurrence info</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event where converted info is stored</param>
        /// <returns type="Number">HRESULT, 0 for success</returns>

        var hresult = 0;

        try {
            // Let the platform validate dayOfWeek
            event.recurrence.dayOfWeek = recurrence.daysOfWeek;
        } catch (dayOfWeekError) {
            Jx.log.exception("Error setting recurrence dayOfWeek.", dayOfWeekError);
            hresult = _getHresult(dayOfWeekError);
        }

        return hresult;
    }

    function _tryConvertWeekOfMonth(recurrence, event) {
        /// <summary>Given recurrence info from appointment, convert weekOfMonth and put it into the given event object. </summary>
        /// <param name="recurrence" type="Windows.ApplicationModel.Appointments.AppointmentRecurrence">recurrence info</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event where converted info is stored</param>
        /// <returns type="Number">HRESULT, 0 for success</returns>

        var hresult = 0;

        var AppointmentWeekOfMonth = Appointments.AppointmentWeekOfMonth;

        switch (recurrence.weekOfMonth) {
            case AppointmentWeekOfMonth.first:
                event.recurrence.weekOfMonth = CalPlat.WeekOfMonth.first;
                break;
            case AppointmentWeekOfMonth.second:
                event.recurrence.weekOfMonth = CalPlat.WeekOfMonth.second;
                break;
            case AppointmentWeekOfMonth.third:
                event.recurrence.weekOfMonth = CalPlat.WeekOfMonth.third;
                break;
            case AppointmentWeekOfMonth.fourth:
                event.recurrence.weekOfMonth = CalPlat.WeekOfMonth.fourth;
                break;
            case AppointmentWeekOfMonth.last:
                event.recurrence.weekOfMonth = CalPlat.WeekOfMonth.last;
                break;
            default:
                Jx.log.error("Invalid week of month");
                hresult = Status.errorInvalidWeekOfMonth;
        }

        return hresult;
    }

    function _tryConvertMonthOfYear(recurrence, event) {
        /// <summary>Given recurrence info from appointment, convert monthOfYear and put it into the given event object. </summary>
        /// <param name="recurrence" type="Windows.ApplicationModel.Appointments.AppointmentRecurrence">recurrence info</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event where converted info is stored</param>
        /// <returns type="Number">HRESULT, 0 for success</returns>

        var hresult = 0;

        try {
            // Let the platform validate monthOfYear
            event.recurrence.monthOfYear = recurrence.month;
        } catch (monthOfYearError) {
            Jx.log.exception("Error setting recurrence monthOfYear.", monthOfYearError);
            hresult = _getHresult(monthOfYearError);
        }

        return hresult;
    }

    function _tryConvertDayOfMonth(recurrence, event) {
        /// <summary>Given recurrence info from appointment, convert dayOfMonth and put it into the given event object. </summary>
        /// <param name="recurrence" type="Windows.ApplicationModel.Appointments.AppointmentRecurrence">recurrence info</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event where converted info is stored</param>
        /// <returns type="Number">HRESULT, 0 for success</returns>

        var hresult = 0;

        try {
            // Let the platform validate dayOfMonth
            event.recurrence.dayOfMonth = recurrence.day;
        } catch (dayOfMonthError) {
            Jx.log.exception("Error setting recurrence dayOfMonth.", dayOfMonthError);
            hresult = _getHresult(dayOfMonthError);
        }

        return hresult;
    }


    function _tryConvertRecurrence(recurrence, event) {
        /// <summary>Given recurrence info from appointment, convert the values and put them into the given event object. </summary>
        /// <param name="recurrence" type="Windows.ApplicationModel.Appointments.AppointmentRecurrence">recurrence info</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event where converted info is stored</param>
        /// <returns type="Number">HRESULT, 0 for success</returns>

        var recurrenceHresult = Status.success;

        if (!recurrence) {
            return recurrenceHresult;
        }

        var AppointmentRecurrenceUnit = Appointments.AppointmentRecurrenceUnit;
        var RecurrenceType = CalPlat.RecurrenceType;

        event.recurring = true;

        // Fields: until, occurrences
        // Only one of occurrences or until can be specified (Windows will validate this)
        if (recurrence.until) {
            Debug.assert(recurrence.occurrences === null, "Unexpectedly found both until and occurrences; Should have been validated by Windows");

            // The platform will valiate until at validate time.
            event.recurrence.until = recurrence.until;

        } else if (recurrence.occurrences > 0) {
            try {
                event.recurrence.occurrences = recurrence.occurrences;
            } catch (occurrencesError) {
                // The platform also has a max value, there can be an error here that we haven't checked for.
                Jx.log.exception("Error setting occurrences", occurrencesError);
                recurrenceHresult = _getHresult(occurrencesError);
            }
        }
        // It's perfectly valid to have neither, which corresponds to an unbounded recurring event.

        // Convert the unit, and then convert remaining fields accordingly.
        // The platform will ignore any fields that aren't relevant when sync'ing and expanding the recurrence, 
        // but other code in the calendar app may not (Windows Blue Bugs:458244)
        switch (recurrence.unit) {
            case AppointmentRecurrenceUnit.daily:
                event.recurrence.recurrenceType = RecurrenceType.daily;
                recurrenceHresult = recurrenceHresult || _tryConvertDayOfWeek(recurrence, event);
                break;
            case AppointmentRecurrenceUnit.weekly:
                event.recurrence.recurrenceType = RecurrenceType.weekly;
                recurrenceHresult = recurrenceHresult || _tryConvertDayOfWeek(recurrence, event);
                break;
            case AppointmentRecurrenceUnit.monthly:
                event.recurrence.recurrenceType = RecurrenceType.monthly;
                recurrenceHresult = recurrenceHresult || _tryConvertDayOfMonth(recurrence, event);
                break;
            case AppointmentRecurrenceUnit.monthlyOnDay:
                event.recurrence.recurrenceType = RecurrenceType.monthlyOnDay;
                recurrenceHresult = recurrenceHresult || _tryConvertDayOfWeek(recurrence, event);
                recurrenceHresult = recurrenceHresult || _tryConvertWeekOfMonth(recurrence, event);
                break;
            case AppointmentRecurrenceUnit.yearly:
                event.recurrence.recurrenceType = RecurrenceType.yearly;
                recurrenceHresult = recurrenceHresult || _tryConvertDayOfMonth(recurrence, event);
                recurrenceHresult = recurrenceHresult || _tryConvertMonthOfYear(recurrence, event);
                break;
            case AppointmentRecurrenceUnit.yearlyOnDay:
                event.recurrence.recurrenceType = RecurrenceType.yearlyOnDay;
                recurrenceHresult = recurrenceHresult || _tryConvertDayOfWeek(recurrence, event);
                recurrenceHresult = recurrenceHresult || _tryConvertWeekOfMonth(recurrence, event);
                recurrenceHresult = recurrenceHresult || _tryConvertMonthOfYear(recurrence, event);
                break;
            default:
                Jx.log.error("Invalid recurrence type");
                recurrenceHresult = Status.errorInvalidRecurrenceType;
        }

        // Field: interval
        try {
            // It's important to set interval after recurrenceType since recurrenceType clears out interval
            // Let the platform validate interval too small / too large errors
            event.recurrence.interval = recurrence.interval;
        } catch (intervalError) {
            Jx.log.exception("Error setting recurrence interval.", intervalError);
            recurrenceHresult = _getHresult(intervalError);
        }

        // We also need to set firstDayOfWeek - since that affects the recurrence for some recurrence types. 
        // If this is not set the platform will always use the default value of Sunday.
        event.recurrence.firstDayOfWeek = Helpers.firstDayOfWeek;

        return recurrenceHresult;
    }

    function _setProperty(event, propertyName, newValue) {
        /// <summary>Sets the given property on the event object, but only if it hasn't changed from its previous value</summary>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event to modify</param>
        /// <param name="propertyName" type="String">Name of the property to modify</param>
        /// <param name="newValue">New value for the property</param>
        /// <returns type="Boolean">True if the property was updated, otherwise false.</returns>

        // Need to avoid setting properties that haven't changed on exceptions to series
        if (event[propertyName] !== newValue) {
            event[propertyName] = newValue;
            return true;
        }

        return false;
    }

    Calendar.ProviderConverter = function () {
        // We need to save the organizer conversion information from convertToEvent to make sure we can do the right thing in updateBeforeSave.
        this._organizerInfo = null;
        this._numAttendees = 0;
    };

    Calendar.ProviderConverter.prototype = {

        _convertAttendees: function (attendees) {
            /// <summary>
            /// "Converts" attendee information from the appointment
            /// Currently this involves storing the number of attendees added, for BICI, 
            /// but this could be expanded in the future.
            /// </summary>
            /// <param name="attendees" type="Array" elementType="Windows.ApplicationModel.Appointments.IAppointmentInvitee">Description</param>

            this._numAttendees = attendees.length;
        },

        convertToEvent: function (appointment, calendar, useRecurrenceInfo) {
            /// <summary>
            /// Converts the given appointment to an event. 
            /// Not quite everything can be set to final values now - use updateBeforeSave before saving (once the calendar is finalized).
            /// </summary>
            /// <param name="appointment" type="Windows.ApplicationModel.Appointments.IAppointment">Appointment information from API</param>
            /// <param name="calendar" type="Microsoft.WindowsLive.Platform.Calendar.ICalendar">calendar on which the event should be created</param>
            /// <param name="useRecurrenceInfo" type="Boolean">Indicates whether the recurrence info should be converted. For example, when replacing an instance, the recurrence info should not be saved.</param>
            /// <returns>Object containing 'event' and 'errorText', only one of which will be populated.</returns>

            _start("convertToEvent");

            // Create the event now without committing
            // We'll set the correct calendar/etc on the event before committing at save time.
            var event = calendar.createEvent();
            var errorText = null;
            var errorDetails;
            var errorHresult;
            var rawReminder;

            // Validate fields and add to event

            // Field: startDate, endDate, allDayEvent

            var dateInfo = _convertDates(appointment.startTime, appointment.duration, appointment.allDay);

            // Dates must be within valid calendar range
            if ((dateInfo.startDate < Calendar.FIRST_DAY) || (Calendar.LAST_DAY < dateInfo.endDate)) {
                var shortDateFormatter = new Jx.DTFormatter("shortDate");
                var firstDateString = shortDateFormatter.format(Calendar.FIRST_DAY);
                var lastDateString = shortDateFormatter.format(Calendar.LAST_DAY);
                errorText = Jx.res.loadCompoundString("ProviderErrorDate", firstDateString, lastDateString);
                // This error message goes in the event log. 
                errorDetails = errorText + " " + Jx.res.loadCompoundString("ProviderErrorDateLog", String(appointment.startTime), _msToMinutes(appointment.duration));
                errorHresult = (dateInfo.startDate < Calendar.FIRST_DAY) ? Status.errorEventDateTooSmall : Status.errorEventDateTooLarge;
            } else {
                event.startDate = dateInfo.startDate;
                event.endDate = dateInfo.endDate;
                event.allDayEvent = appointment.allDay;
            }

            // Recurrence fields
            if (useRecurrenceInfo) {
                var recurrenceResult = _tryConvertRecurrence(appointment.recurrence, event);
                if (recurrenceResult !== 0) {
                    errorText = Jx.res.getString("ProviderErrorRecurrenceGeneric");
                    errorDetails = errorText + " " + _getRecurrenceEventLogErrorDetails(appointment);
                    errorHresult = recurrenceResult;
                }
            }

            // Fields: location, subject

            event.subject = appointment.subject;
            event.location = appointment.location;

            // Field: reminder

            rawReminder = appointment.reminder;
            if (Jx.isNumber(rawReminder)) {
                Debug.assert(rawReminder >= 0, "Expected reminder to be >= 0"); // Windows will validate this
                event.reminder = _msToMinutes(rawReminder);
            } else {
                Debug.assert(rawReminder === null, "Unexpected non-numeric value for reminder: " + rawReminder);
                event.reminder = -1; // This is how we represent "No reminder"
            }

            // Field: data

            // The DB will auto-truncate if this is too long.
            // Technically we should run it through toStaticHtml again if it's truncated, but since toStaticHtml crashes before the string gets long enough for that, it doesn't seem worth coding for.
            _start("convertToEvent.toStaticHtml");
            event.data = toStaticHTML(appointment.details);
            event.dataType = CalPlat.DataType.html;
            _stop("convertToEvent.toStaticHtml");

            // Fields: organizerName, organizerEmail
            this._organizerInfo = _convertOrganizer(appointment.organizer);

            // DB will silently truncate these if they are too long.  This is OK since we are setting responseRequested to false and we don't expect any email to be sent.
            if (this._organizerInfo.hasOrganizer) {
                event.organizerName = this._organizerInfo.organizerName;
                event.organizerEmail = this._organizerInfo.organizerEmail;
            }

            // Field: sensitivity

            if (appointment.sensitivity === Appointments.AppointmentSensitivity.private) {
                event.sensitivity = CalPlat.Sensitivity.private;
            }
            // If we receive any unexpected value, default to "normal", which is also the default value for new events

            // Attendees 
            // (we store information about the attendees for BICI but don't support saving them right now)
            this._convertAttendees(appointment.invitees);

            // Field: busyStatus

            event.busyStatus = _convertBusyStatus(appointment.busyStatus, null);

            // Field: responseRequested

            // Generally new events should be set to responseRequested = true.
            // For events with an organizer, we don't want to send any responses via this calendar (since the meeting definition resides in the source app).
            event.responseRequested = !this._organizerInfo.hasOrganizer;

            if (!Jx.isNonEmptyString(errorText)) {
                // Validate the event. 
                var validationResult = event.validate();
                if (validationResult !== Status.success) {
                    // Assume recurrence errors range from errorNotRecurring to 0x85550250 (leave some space for new errors)
                    var isRecurrenceError = (validationResult >= Status.errorNotRecurring) && (validationResult <= -2058026416);
                    
                    // We have pre-validated the fields, only recurrence errors are expected.
                    Debug.assert(isRecurrenceError, "Unexpected validation failure: " + validationResult);

                    if (validationResult === Status.errorExceptionsOverlap) {
                        // We have a specific message for this one
                        errorText = Jx.res.getString("ProviderErrorRecurrenceOverlap");
                        errorDetails = errorText + " " + _getRecurrenceEventLogErrorDetails(appointment);
                    } else if (isRecurrenceError && appointment.recurrence) {
                        errorText = Jx.res.getString("ProviderErrorRecurrenceGeneric");
                        errorDetails = errorText + " " + _getRecurrenceEventLogErrorDetails(appointment);
                    } else {
                        errorText = Jx.res.getString("ProviderErrorGeneric");
                        errorDetails = errorText;
                    }

                    errorHresult = validationResult;
                }
            }

            if (Jx.isNonEmptyString(errorText)) {
                // We should either return an event, or an error, but not both.
                event = null;
            }

            _stop("convertToEvent");

            return {
                event: event,
                errorText: errorText,
                errorDetails: errorDetails,
                errorHresult: errorHresult 
            };
        },

        updateBeforeSave: function (event, calendar, originalEvent) {
            /// <summary>
            /// Performs logic that needs to be performed before save, for example logic based on the calendar, and making sure the event gets onto the correct calendar. 
            /// Returns the result (which might or might not be the param passed in).
            /// </summary>
            /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event containing information to save. </param>
            /// <param name="calendar" type="Microsoft.WindowsLive.Platform.Calendar.ICalendar">Calendar on which the event should be saved</param>
            /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">The event to replace.  May be null if we're creating a new event.</param>
            /// <returns type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event to save (might be the same event as passed in)</returns>

            var finalEvent = null;

            if (originalEvent) {
                finalEvent = originalEvent;
            } else {
                // When creating a new event, create it on the calendar that the user chose.
                finalEvent = calendar.createEvent();
            }
            Debug.assert(calendar.id === finalEvent.calendar.id, "ERROR: Event was not on expected calendar");

            // We'll be creating an exception even if it's currently an instance
            var isException = (finalEvent.eventType === CalPlat.EventType.instanceOfSeries) || (finalEvent.eventType === CalPlat.EventType.exceptionToSeries);

            // determine this value before the event changes. Indicates whether the event has an external organizer
            var originalEventIsOrganizer = originalEvent ? originalEvent.isOrganizer : false;

            // Replace all finalEvent fields with the information from event, which is where we stored the data provided by the source app

            // setProperty avoids setting a property that already contains the same value. 
            // This is important for exceptions which otherwise would pull their values from the series.
            _setProperty(finalEvent, "startDate", event.startDate);
            _setProperty(finalEvent, "endDate", event.endDate);
            _setProperty(finalEvent, "allDayEvent", event.allDayEvent);
            _setProperty(finalEvent, "subject", event.subject);
            _setProperty(finalEvent, "location", event.location);
            _setProperty(finalEvent, "reminder", event.reminder);
            if (_setProperty(finalEvent, "data", event.data)) {
                // Always set dataType if data is set since it refers to the data.
                finalEvent.dataType = event.dataType;
            }
            _setProperty(finalEvent, "sensitivity", event.sensitivity);
                
            // Some fields can't be set on exceptions (the value is stored only in the series).  Only set them if this is not an exception.
            if (!isException) {

                // Only set the organizer if we got an organizer from the appointment input
                // Can't always copy from the original event since organizerEmail defaults to the calendar's account's email
                if (this._organizerInfo.hasOrganizer) {
                    finalEvent.organizerName = event.organizerName;
                    finalEvent.organizerEmail = event.organizerEmail;
                }
                finalEvent.responseRequested = event.responseRequested;

                finalEvent.recurring = event.recurring;
                if (event.recurring) {
                    finalEvent.recurrence.recurrenceType = event.recurrence.recurrenceType;
                    finalEvent.recurrence.occurrences = event.recurrence.occurrences;
                    finalEvent.recurrence.until = event.recurrence.until;
                    finalEvent.recurrence.interval = event.recurrence.interval;
                    finalEvent.recurrence.dayOfWeek = event.recurrence.dayOfWeek;
                    finalEvent.recurrence.weekOfMonth = event.recurrence.weekOfMonth;
                    finalEvent.recurrence.monthOfYear = event.recurrence.monthOfYear;
                    finalEvent.recurrence.dayOfMonth = event.recurrence.dayOfMonth;
                    finalEvent.recurrence.firstDayOfWeek = event.recurrence.firstDayOfWeek;
                }
            }

            var finalEventIsOrganizer = !this._organizerInfo.hasOrganizer;
            if (!finalEventIsOrganizer) {
                // We've got an organizer from the API - but before assuming the current account is not the organizer,
                // check to see whether the organizer email matches the current account.
                // The platform isOrganizer check does something similar but doesn't work well with our half-created meetings.
                var organizerUpper = finalEvent.organizerEmail.toUpperCase();
                var currentAccountEmails = finalEvent.calendar.account.allEmailAddresses;
                for (var i = 0, count = currentAccountEmails.length; i < count; i++) {
                    var emailAddress = currentAccountEmails[i].toUpperCase();

                    if (emailAddress === organizerUpper) {
                        finalEventIsOrganizer = true;
                        break; // Stop looking once we've found one that's the same
                    }
                }
            }

            // Make sure that the the organizer field on the event has not been added or removed
            // Changing the organizer is allowed, adding or removing the organizer is not.
            if (originalEvent) {
                if (finalEventIsOrganizer !== originalEventIsOrganizer) {
                    var error = new Error("Cannot add or remove organizer using the provider");
                    error.number = Hresult.organizerChange;
                    throw error;
                }
            }

            // Set the meetingStatus.  This field can be dependent on the exact meeting we're replacing so we'll only do it here when that's final.
            if (!finalEventIsOrganizer) {
                finalEvent.meetingStatus = CalPlat.MeetingStatus.meetingReceived;

                if (!originalEvent) {
                    // This is a new event - we need to add the current user as an attendee.
                    var address = finalEvent.calendar.account.preferredSendAsAddress;
                    var newAttendee = finalEvent.addAttendee(address, address);
                    newAttendee.responseType = CalPlat.ResponseType.notResponded;
                    newAttendee.attendeeType = CalPlat.AttendeeType.required;
                }
            } else {
                // Determine whether the meeting has attendees
                var attendees = finalEvent.getAttendees();
                var hasAttendees = attendees.count > 0;
                attendees.dispose();
                attendees = null;

                if (hasAttendees) {
                    // This is a meeting and current user is the organizer
                    finalEvent.meetingStatus = CalPlat.MeetingStatus.isAMeeting;
                } else {
                    finalEvent.meetingStatus = CalPlat.MeetingStatus.notAMeeting;
                }
            }

            // Update the busyStatus property if necessary.  This value may change based on the calendar, so we always calculate it here where the calendar is final.
            finalEvent.busyStatus = _busyStatusWithCalendar(event.busyStatus, finalEvent.calendar);

            return finalEvent;
        },

        getNumAttendees: function () {
            /// <summary>Returns the number of attendees requested to be added to the meeting by the API</summary>
            return this._numAttendees;
        }

    };
});