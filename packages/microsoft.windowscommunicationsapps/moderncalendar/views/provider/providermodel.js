
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug,Calendar,Jx,Microsoft,Windows*/

Jx.delayDefine(Calendar, ["ProviderModel", "ProviderAction", "ProviderHresult"], function () {

    function _start(s) { Jx.mark("Calendar.ProviderModel." + s + ",StartTA,Calendar,App"); }
    function _stop(s) { Jx.mark("Calendar.ProviderModel." + s + ",StopTA,Calendar,App"); }
    function _info(s) { Jx.mark("Calendar.ProviderModel." + s + ",Info,Calendar,App"); }

    // Describes the sets of "actions" the user can take 
    // Used to determine what to put in the button and whether to return error/cancel/completed to Windows
    var ProviderAction = Calendar.ProviderAction = {
        add: "add",
        closeError: "closeError", // There was an error, and we should report the error to Windows
        closeSuccess: "closeSuccess", // Close button / report "complete" to windows, such as "we couldn't find the item, it was probably already deleted"
        remove: "remove",
        replace: "replace",
        signIn: "signIn"
    };

    var Hresult = Calendar.ProviderHresult = {
        generalFailure: -2147467259,  // 0x80004005, E_FAIL
        organizerChange: -2057961215, // 0x85560101 This error is specific to the calendar provider JS
    };

    var CalendarSelector;
    var EventType;
    var Helpers = Calendar.Helpers;

    var ProviderModel = Calendar.ProviderModel = function () {
        /// <summary>
        /// The ProviderModel class generally handles interaction with the platform, 
        /// translates API input into format we support, 
        /// and helps inform the view as to what it should display.
        /// </summary>

        _start("constructor");

        CalendarSelector = Calendar.Views.CalendarSelector;

        this._action = null;
        // Stores events by calendar ID
        this._calendarEventMap = {};
        this._calendars = [];
        this._event = null;
        this._errorText = null;
        this._errorDetails = null;
        this._errorHresult = null;
        this._operation = null;
        this._platform = null;
        this._reportInformation = null; // used in reportCompleted

        // we only want to record BICI data if the original requested action was add.
        this._shouldRecordBici = false;

        this._providerConverter = new Calendar.ProviderConverter();

        this._doReport = this._doReport.bind(this);

        Debug.only(Object.seal(this));

        _stop("constructor");
    };

    ProviderModel.prototype = {

        initialize: function (activationArgs, platform, platformHresult) {
            /// <summary>Initializes the ProviderModel with the windows activation data</summary>
            /// <param name="activationArgs" type="Windows.ApplicationModel.Activation.IAppointmentsProviderActivatedEventArgs">activation arguments containing verb and appointment info</param>
            /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client">Platform client</param>
            /// <param name="platformHresult" type="Number">HRESULT from constructing the platform</param>

            this._platform = platform;
            var hasPlatformError = platformHresult; // If this is 0 or null/undefined it will be false.

            var Verbs = Windows.ApplicationModel.Appointments.AppointmentsProvider.AppointmentsProviderLaunchActionVerbs;

            switch (activationArgs.verb) {
                case Verbs.addAppointment:
                    // Stores local state, such as the operation, the event, and any initially detected errors
                    this._operation = activationArgs.addAppointmentOperation;
                    if (!hasPlatformError) {
                        this._shouldRecordBici = true; // only true for original add action
                        this._prepareAddAction(true);
                    }
                    break;
                case Verbs.removeAppointment:
                    // Stores local state, such as the operation, the event, and any initially detected errors
                    this._operation = activationArgs.removeAppointmentOperation;
                    if (!hasPlatformError) {
                        this._prepareRemoveAction();
                    }
                    break;
                case Verbs.replaceAppointment:
                    // Stores local state, such as the operation, the event, and any initially detected errors
                    this._operation = activationArgs.replaceAppointmentOperation;
                    if (!hasPlatformError) {
                        this._prepareReplaceAction();
                    }
                    break;
                default:
                    // This should never happen
                    Debug.assert("Unsupported action: " + activationArgs.verb);
                    var errorString = "Calendar.ProviderModel: Unsupported action: " + activationArgs.verb;
                    Jx.log.error(errorString);
                    throw new Error(errorString);
            }

            if (hasPlatformError) {
                Debug.assert(Jx.isNullOrUndefined(platform), "Should not have both platform and platform error");
                this.setPlatformError(platformHresult);
            }
        },

        willEmailAttendees: function (event) {
            /// <summary>Determines whether the attendees would be emailed when changing the given event.</summary>  
            /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event to check attendees on</param>

            var hasAttendees = false;
            var willEmailAttendees = false;

            if (event && event.isOrganizer) {
                var attendees = event.getAttendees();
                hasAttendees = attendees.count > 0;
                attendees.dispose();
            }

            if (hasAttendees && this._action === ProviderAction.remove) {
                // For cancellations, we only email the attendees if the event is not in the past.
                willEmailAttendees = !this.eventIsInPast(event);
            } else {
                willEmailAttendees = hasAttendees;
            }

            return willEmailAttendees;
        },

        eventIsInPast: function (event) {
            var recurrence;
            var isInPast = false;
            // JS equivalent of MIN_EVENT_DATETIME (JS and C++ have different int representations of time)
            // 2/1/1601, midnight UTC
            var minValidDate = -11641795200000;
            EventType = EventType || Microsoft.WindowsLive.Platform.Calendar.EventType;

            if (event.recurring && event.eventType === EventType.series) {
                recurrence = event.recurrence;
                // Check to see if the end of the recurrence is in the past, if the recurrence end is set
                if (+recurrence.until < Date.now() && +recurrence.until >= minValidDate) {
                    isInPast = true;
                }
            } else {
                // Determine whether the end date is before now
                isInPast = +event.endDate < Date.now();
            }

            return isInPast;
        },

        getAction: function () {
            /// <summary>Returns the action associated with this request</summary>
            /// <returns type="Calendar.ProviderAction" />

            return this._action;
        },

        getCalendars: function () {
            /// <summary>
            /// Returns the list of calendars that the given event could be saved to or deleted from.
            /// Calendars are represented by "calendarOption" objects suitable for use with the calendar selector.
            /// </summary>

            return this._calendars;
        },

        getErrorText: function () {
            /// <summary>Returns any error associated with this request</summary>

            return this._errorText;
        },

        getEvent: function () {
            /// <summary>Returns the event that is associated with this request</summary>

            Debug.assert(this._action !== ProviderAction.remove, "Should use getOriginalEvent rather than getEvent when action is remove");

            // this._event contains a newly created object that has the converted info from the Win API input, and that's what we want to display.
            return this._event;
        },

        getOriginalEvent: function (calendarId) {
            /// <summary>Returns the event that is associated with this request</summary>
            /// <param name="calendarId" type="Number" optional="true">For some scenarios (remove), the event info will be different as the calendar changes. Not required if there is only one calendar.</param>

            if (!Jx.isNumber(calendarId)) {
                // Sometimes there is only one calendar and we don't force the caller to pass it in for that case.
                Debug.assert(this._calendars.length === 1, "Calendar ID is required when there is more than one calendar");
                calendarId = this._calendars[0].calendar.id;
            }

            var event = this._calendarEventMap[calendarId];
            Debug.assert(event, "Unable to find an event. Should have stored an event for any calendar ID that could be passed in to getOriginalEvent");

            return event;
        },

        setError: function (errorText, errorDetails, hresult) {
            /// <summary>
            /// Sets the model into a state where there is an error. 
            /// errorText will be shown in the UI while the errorDetails is developer-focused text that will go in the event log during reportError.
            /// reportError is separate since it will close the page and not allow us to show UI.
            /// </summary>
            /// <param name="errorText" type="String">UI Text to display to the user about the error</param>
            /// <param name="errorDetails" type="String">Developer-focused text about the error, for logs (Jx ETW + event log)</param>
            /// <param name="hresult" type="Number">HRESULT to include in event log</param>

            this._errorHresult = hresult;
            this._errorText = errorText;
            this._errorDetails = errorDetails;
            this._action = ProviderAction.closeError;
            
            Jx.log.error(errorDetails);
        },

        setPlatformError: function (hresult) {
            /// <summary>Indicates that there was an error constructing the platform</summary>
            /// <param name="hresult" type="Number">HRESULT from constructing the platform</param>

            var Result = Microsoft.WindowsLive.Platform.Result;

            // Determine whether this is an error for which the "sign in" message is appropriate (we'll send the user to the full app)
            var showSignIn = [
                Result.accountLocked,
                Result.accountSuspendedAbuse,
                Result.accountSuspendedCompromise,
                Result.accountUpdateRequired,
                Result.actionRequired,
                Result.authRequestThrottled,
                Result.defaultAccountDoesNotExist,
                Result.emailVerificationRequired,
                Result.forceSignIn,
                Result.parentalConsentRequired,
                Result.passwordDoesNotExist,
                Result.passwordLogonFailure,
                Result.passwordUpdateRequired,
                -2147023665, // 0x800704CF, HRESULT_FROM_WIN32(ERROR_NETWORK_UNREACHABLE) - we get this one when the platform needs auth and disconnected from the internet
                -2146893042  // 0x8009030E, SEC_E_NO_CREDENTIALS
            ].indexOf(hresult) !== -1;

            var errorText;
            if (showSignIn) {
                errorText = Jx.res.getString("ProviderErrorSignIn");
                this.setError(errorText, errorText, hresult);
                this._action = ProviderAction.signIn;
            } else {
                errorText = Jx.res.getString("ProviderStartErrorGeneric");
                this.setError(errorText, errorText, hresult);
            }
        },

        reportWithoutSave: function () {
            /// <summary>
            /// Windows will be notified that there was an error. Does not save/delete the event. 
            /// This will call dismissUI and tear down the page.
            /// </summary>

            if (this._action === ProviderAction.closeSuccess) {
                _info("reportWithoutSave.closeSuccess");
                // This will close the page.
                this._dismissUI();
            } else if (this._action === ProviderAction.signIn) {
                _info("reportWithoutSave.signIn");
                // This will close the page.
                this._dismissUI();
            } else {
                Debug.assert(this._action === ProviderAction.closeError, "Unexpected action: " + this._action);
                Debug.assert(Jx.isNonEmptyString(this._errorText), "Unexpected call to reportWithoutSave: no error info");
                Debug.assert(Jx.isNonEmptyString(this._errorDetails), "Unexpected call to reportWithoutSave: no error details");

                var errorDetailsToReport = this._errorDetails;
                if (this._errorHresult) {
                    errorDetailsToReport += " " + this._formatHresult(this._errorHresult);
                }

                // This will also close the page.
                _info("reportWithoutSave.closeError");
                this._dismissUI(errorDetailsToReport);
            }
        },

        saveEvent: function (calendar) {
            /// <summary>
            /// Saves the event, and Windows will be notified that the event was saved.
            /// If successful, dismissUI will be called and the page will be torn down.
            /// </summary>
            /// <param name="calendar" type="Microsoft.WindowsLive.Platform.Calendar.ICalendar">
            /// Selected calendar on which event should be saved.
            /// Must be one of the calendars provided by this model.
            /// </param>
            /// <returns type="Boolean">True if save was successful, false otherwise.</returns>

            _start("saveEvent");

            Debug.assert(this._action === ProviderAction.add || this._action === ProviderAction.replace, "Unexpected action for save");

            var success = false;
            var eventToSave;

            try {
                // Update any necessary fields before save 
                // This also makes sure we're replacing the event on the correct calendar or saving a new event in the correct calendar
                eventToSave = this._providerConverter.updateBeforeSave(this._event, calendar, this._calendarEventMap[calendar.id]);

                // Validate generally checks to see if the event is valid, which we've already done at convert time (potentially with a different event object).
                // One other thing that it does for recurrences is check to see if the start time / recurrence properties have changed - in which case we need to delete the exceptions.
                // Check for that now.
                // If there are any other validation failures, commit will throw an exception and we'll handle it there.
                var result = eventToSave.validate();
                if (result === Microsoft.WindowsLive.Platform.Calendar.Status.errorEventExceptionDeleteRequired) {
                    eventToSave.deleteExceptions();
                }

                eventToSave.commit();

                success = true;
            } catch (exception) {
                Jx.log.exception(exception, "Error saving event");
                var errorString = Jx.res.getString("ProviderErrorGeneric");
                var errorDetails = errorString;

                if (exception.number === Hresult.organizerChange) {
                    // We have a specific event log message for this error
                    errorDetails = Jx.res.getString("ProviderErrorOrganizer");
                }

                this.setError(errorString, errorDetails, exception.number);
            }

            if (success) {
                // If there are attendees, send an update

                this._logEventData(eventToSave);

                try {
                    if (this.willEmailAttendees(eventToSave)) {
                        this._sendMail(eventToSave);
                    }
                } catch (attendeeException) {
                    Jx.log.exception(attendeeException, "Error sending update email");
                    // We won't notify the user that this didn't work.
                }

                Debug.assert(Jx.isNonEmptyString(eventToSave.uid, "Unexpected lack of UID for created appointment"));
                _info("saveEvent.success");
                this._dismissUI(eventToSave.uid);
            }
            // On failure, the UI will transition to error UI, and clicking a button there will report error.

            _stop("saveEvent");

            return success;
        },

        deleteEvent: function (calendar) {
            /// <summary>
            /// Deletes the event.  Windows will be notified that the action was complete.
            /// If successful, dismissUI is called and the page is shut down.
            /// </summary>
            /// <param name="calendar" type="Microsoft.WindowsLive.Platform.Calendar.ICalendar">
            /// Calendar from which the event should be deleted. 
            /// Must be one of the calendars provided by this model.
            /// </param>
            /// <returns type="Boolean">True if the delete was successful, false otherwise.</returns>

            Debug.assert(this._action === ProviderAction.remove, "Unexpected action for delete");
            var eventToDelete = this.getOriginalEvent(calendar.id);
            var success = false;

            try {
                if (this.willEmailAttendees(eventToDelete)) {
                    // Need to send a cancellation mail
                    eventToDelete.meetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.meetingCanceled;
                    eventToDelete.subject = Jx.res.getString("EventCancelledPrefix") + eventToDelete.subject;

                    // Replace any body with a cancellation message

                    this._sendMail(eventToDelete);
                }

                // Always delete the event
                eventToDelete.deleteObject();
                success = true;

            } catch (exception) {
                // The platform will not bubble up an error if the event has already been deleted - this is some other error.
                Jx.log.exception(exception, "Error deleting event");
                var errorString = Jx.res.getString("ProviderErrorDeleteReadonly");
                var errorDetails = errorString;
                this.setError(errorString, errorDetails, exception.number);
            }

            if (success) {
                _info("deleteEvent.success");
                this._dismissUI();
            }
            // On failure, the caller will transition to error UI, and clicking a button there will report error.

            return success;
        },

        dispose: function (isDismissUI) {
            /// <summary>Disposes any resources for page shutdown</summary>
            /// <param name="isDismissUI" type="Boolean">Indicates whether this is a dismissUI event</param>

            // The page handles the lifetime of the platform, it is disposed there.
            this._platform = null;
            this._calendarEventMap = null;

            if (!isDismissUI) {
                this._doReport = null;
                this._operation = null;
            }
        },

        _dismissUI: function (reportInformation) {
            /// <summary>Dismisses UI and sets up a timer to call the actual reportCompleted / etc function at a later time.</summary>
            /// <param name="reportInformation">Object to be passed to report function</param>

            this._reportInformation = reportInformation;
            this._operation.dismissUI();

            // We have up to 15 seconds to continue to act after dismissUI.  Arbitrarily use 2 seconds.
            setTimeout(this._doReport, 2000);

            // The Page will listen to this and tear down everything
            // This class keeps around just enough to finish _doReport.
            Jx.EventManager.fireDirect(null, "dismissUI");
        },

        _doReport: function () {
            /// <summary>Should be called some time after dismissUI, to perform the actual reportCompleted / etc</summary>
            _start("doReport");

            if (this._action === ProviderAction.closeError) {
                _info("doReport.closeError");
                Debug.assert(this._reportInformation, "Error should always have additional information");
                this._operation.reportError(this._reportInformation);
            } else if (this._action === ProviderAction.signIn) {
                _info("doReport.signIn");
                this._operation.reportCanceled();
            } else {
                // All other actions indicate success
                if (this._reportInformation) {
                    _info("doReport.reportCompleted.information");
                    this._operation.reportCompleted(this._reportInformation);
                } else {
                    _info("doReport.reportSuccess.noInformation");
                    this._operation.reportCompleted();
                }
            }

            _stop("doReport");
        },

        _sendMail: function (event) {
            /// <summary>Uses mailFromEvent to send a cancellation or meeting update mail about the event.</summary>
            /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Which event are we sending mail about</param>

            // Put together the To line for the email
            var attendees = event.getAttendees();
            var mailTo = "";
            var numAttendees = attendees.count;
            var formatEmailAddress = Helpers.formatEmailAddress;

            for (var i = 0; i < numAttendees; i++) {
                var attendee = attendees.item(i);
                mailTo += formatEmailAddress(attendee.name, attendee.email) + "; ";
            }
            attendees.dispose();

            var mailMessage = this._platform.invitesManager.mailFromEvent(event, event.calendar.account);

            mailMessage.to = mailTo;
            mailMessage.moveToOutbox();
            mailMessage.commit();
        },

        _loadEvents: function (appointmentId, occurrenceInstanceStart) {
            /// <summary>Given an appointment ID, loads the event and returns it.</summary>
            /// <param name="appointmentId" type="String">UID of event to load</param>
            /// <param name="occurrenceInstanceStart" type="Date" optional="true">DateTime of the occurrence to load (original start time rather than any updated start time)</param>
            /// <returns type="Microsoft.WindowsLive.Platform.Calendar.IEvent" />

            Debug.assert(this._calendars.length === 0, "Calendars should not be populated before the first _loadEvents call");
            this._calendars = [];
            var calendarManager = this._platform.calendarManager;
            var matchingEvents = calendarManager.getEventsFromUID(appointmentId);

            try {
                for (var i = 0, len = matchingEvents.count; i < len; i++) {
                    var event = matchingEvents.item(i);
                    var matchingEvent = null;

                    if (occurrenceInstanceStart) {
                        // If the caller requested a specific event instance, load that.

                        if (event.recurring) {
                            try {
                                matchingEvent = event.getOccurrenceByExceptionStart(occurrenceInstanceStart);
                            } catch (occurrenceException) {
                                Jx.log.exception("Error loading occurrence - may be expected if instanceStartDate was incorrect", occurrenceException);
                                matchingEvent = null;
                            }
                        } else {
                            // If the event isn't recurring, then we won't find any instance.
                            matchingEvent = null;
                        }
                    } else {
                        matchingEvent = event;
                    }

                    if (matchingEvent) {
                        // Store the event and the calendar
                        var calendar = matchingEvent.calendar;
                        this._calendarEventMap[calendar.id] = matchingEvent;
                        this._calendars.push(CalendarSelector.createCalendarOption(calendar));
                    }
                }
            } finally {
                matchingEvents.dispose();
            }

            // Caller needs to know whether we found any events
            return (this._calendars.length > 0);
        },

        _prepareAddAction: function (saveRecurrenceInfo) {
            /// <summary>Based on this._operation, prepares the information required for the Add action.</summary>
            /// <param name="saveRecurrenceInfo" type="Boolean">Indicates whether recurrence information on the event should be saved</param>

            var eventInfo = this._providerConverter.convertToEvent(this._operation.appointmentInformation, this._platform.calendarManager.defaultCalendar, saveRecurrenceInfo);

            // Populate the list of calendars where the event could be saved
            Debug.assert(this._calendars.length === 0, "Calendars should not be populated before prepareAddAction");
            this._calendars = CalendarSelector.getCalendarsForSelector(this._platform);

            if (Jx.isNonEmptyString(eventInfo.errorText)) {
                this.setError(eventInfo.errorText, eventInfo.errorDetails, eventInfo.errorHresult);
            } else {
                this._event = eventInfo.event;
                this._action = ProviderAction.add;
            }
        },

        _prepareReplaceAction: function () {
            /// <summary>Based on this._operation, prepares information required for Replace action</summary>
            Debug.assert(Jx.isNullOrUndefined(this._operation.instanceStartDate) || Jx.isDate(this._operation.instanceStartDate), "optional instanceStartDate had unexpected type");
            
            var foundEvent = this._loadEvents(this._operation.appointmentId, this._operation.instanceStartDate);
            var isInstance = Jx.isDate(this._operation.instanceStartDate);

            if (foundEvent) {
                // We're replacing an event.
                var eventInfo = this._providerConverter.convertToEvent(
                    this._operation.appointmentInformation,
                    this._platform.calendarManager.defaultCalendar,
                    !isInstance); // Don't try to save recurrence information on an instance

                if (Jx.isNonEmptyString(eventInfo.errorText)) {
                    this.setError(eventInfo.errorText, eventInfo.errorDetails, eventInfo.errorHresult);
                } else {
                    this._event = eventInfo.event;
                    this._action = ProviderAction.replace;
                }
            } else {
                // We couldn't find an event to replace - go through the add flow instead.
                // Note that we do this even when trying to replace an instance of a series - which will create a new event not in the series.
                // Make sure not to save any recurrence info if an instance replacement was requested.
                this._prepareAddAction(!isInstance);
            }
        },

        _prepareRemoveAction: function () {
            /// <summary>Based on this._operation, prepares information required for the Remove action</summary>

            // Load the event(s) so that we can tell what to display in the UI

            var foundEvent = this._loadEvents(this._operation.appointmentId, this._operation.instanceStartDate);

            if (!foundEvent) {
                // We couldn't find any events that match
                // This is not an "error", since we're trying to delete something that's probably already gone. 
                // We'll show a message to the user and report success to Windows.
                this._errorText = Jx.res.getString("ProviderErrorDeleteNotFound");
                this._action = ProviderAction.closeSuccess;
            } else {
                this._action = ProviderAction.remove;
            }
        },

        _logEventData: function (eventToRecord) {
            /// <summary>Submits BICI data for this action, records item UID for event details BICI</summary>

            // Save the event UID so that we can record the "did users edit events created via provider" data in event details
            var settingsContainer = (new Jx.AppData()).localSettings().container("Calendar");
            settingsContainer.set("lastProviderUid", eventToRecord.uid);

            if (this._action === ProviderAction.add && this._shouldRecordBici) {

                var isRecurring = eventToRecord.recurring ? 1 : 0;
                var hasLocation = eventToRecord.location.length > 0 ? 1 : 0;
                var hasNotes = eventToRecord.data.length > 0 ? 1 : 0;
                var numAttendees = this._providerConverter.getNumAttendees();
                var daysToEvent = Helpers.getDaysUntilStart(eventToRecord);
                var biciEventTimeCategory;

                // The BICI report time category uses 0 as a special case for "in the past", then 1 is today, etc.
                if (daysToEvent < 0 || (eventToRecord.startDate < Helpers.getNowDate())) {
                    biciEventTimeCategory = 0;
                } else {
                    biciEventTimeCategory = daysToEvent + 1;
                }

                // ETW log BICI in debug only
                Debug.only(_info("IdsCalendar.CalendarProviderCreateEvent - recurring: " + isRecurring));
                Debug.only(_info("IdsCalendar.CalendarProviderCreateEvent - location: " + hasLocation));
                Debug.only(_info("IdsCalendar.CalendarProviderCreateEvent - notes: " + hasNotes));
                Debug.only(_info("IdsCalendar.CalendarProviderCreateEvent - time category: " + biciEventTimeCategory));
                Debug.only(_info("IdsCalendar.CalendarProviderCreateEvent - attendees: " + numAttendees));

                Jx.bici.addToStream(
                    Microsoft.WindowsLive.Instrumentation.Ids.Calendar.calendarProviderCreateEvent,
                    isRecurring,
                    hasLocation,
                    hasNotes,
                    biciEventTimeCategory,
                    numAttendees
                );
            }
        },

        _formatHresult: function (hresult) {
            /// <summary>Returns nicely formatted HRESULT (intended for display in event viewer error details)</summary>
            /// <param name="hresult" type="Number">HRESULT to display</param>
            /// <returns type="String" />

            if (!Jx.isValidNumber(hresult)) {
                return "";
            }

            var positiveNumber;

            if (hresult < 0) {
                // Convert to a positive number while keeping the bits the same
                positiveNumber = 0xFFFFFFFF + hresult + 1;
            } else {
                positiveNumber = hresult;
            }

            // Make sure the string is at least 8 characters long by prepending 0's
            var numberString = ("0000000" + positiveNumber.toString(16)).substr(-8);

            // prepend 0x
            numberString = "0x" + numberString.toUpperCase();

            return numberString;
        },

    };
});