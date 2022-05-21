
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference src="ProviderModel.js" />

/*jshint browser:true*/
/*global $,Calendar,Debug,Jx,Microsoft,Windows*/

Jx.delayDefine(Calendar, "ProviderEventView", function () {
    "use strict";

    function _start(s) { Jx.mark("Calendar.ProviderEventView." + s + ",StartTA,Calendar,App"); }
    function _stop(s) { Jx.mark("Calendar.ProviderEventView." + s + ",StopTA,Calendar,App"); }
    function _info(s) { Jx.mark("Calendar.ProviderEventView." + s + ",Info,Calendar,App"); }

    var Helpers = Calendar.Helpers;
    var ProviderAction = Calendar.ProviderAction;
    var EventType;

    var ProviderEventView = Calendar.ProviderEventView = function (model) {
        /// <summary>
        /// The ProviderEventView class handles UI display for the main page in the appointment provider.
        /// </summary>
        /// <param name="model" type="Calendar.ProviderModel">model containing page info</param>

        _start("constructor");

        this._model = model;
        this._calendarSelector = null;
        this._selectedCalendarIndex = 0;

        this._calendarSelectorElement = null;
        this._buttonElement = null;
        this._beforeElement = null;
        this._afterElement = null;

        this._handleFocusOut = this._handleFocusOut.bind(this);
        this._handleButton = this._handleButton.bind(this);
        this._handleCalendarChange = this._handleCalendarChange.bind(this);
        this._settingsContainer = null;

        this.initComponent();

        _stop("constructor");
    };

    Jx.augment(ProviderEventView, Jx.Component);

    function getEventSubjectText(event) {
        /// <summary>Returns subject text</summary>

        var subjectText = "";

        if (event) {
            subjectText = event.subject.trim(); // trim helps prevent space-only strings from displaying
        }

        if (!Jx.isNonEmptyString(subjectText)) {
            subjectText = Jx.res.getString("NoSubject");
        }

        return subjectText;
    }

    function getInfoText (action, hasCalendars, event) {
        /// <summary>Returns appropriate informational text based on the given action</summary>
        /// <param name="action" type="String">Action being taken</param>
        /// <param name="hasCalendars" type="Boolean">Indicates whether there is a calendar picker being displayed</param>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent" optional="true">Event that is being acted on. Only required in case of remove.</param>

        var infoText = null;

        // Some actions require extra explanatory text at the top
        if (action === ProviderAction.remove) {

            EventType = EventType || Microsoft.WindowsLive.Platform.Calendar.EventType;
            if (event && (event.eventType === EventType.series)) {
                // Message for removing a series
                infoText = hasCalendars ? Jx.res.getString("ProviderWarningDeleteSeriesChoose") : Jx.res.getString("ProviderWarningDeleteSeries");
            } else {
                infoText = hasCalendars ? Jx.res.getString("ProviderWarningDeleteChoose") : Jx.res.getString("ProviderWarningDelete");
            }

        } else if (action === ProviderAction.replace) {
            infoText = Jx.res.getString("ProviderWarningReplace");
        }

        return infoText;
    }

    var proto = ProviderEventView.prototype;

    proto._getFullEventHtml = function (event, originalEvent) {
        /// <summary>Builds and returns HTML for the full event view</summary>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">event to render (new event data)</param>
        /// <param name="originalEvent" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Original event that this one will replace (used for attendee message)</param>

        var subjectText = getEventSubjectText(event); 
        var locationHtml = Jx.escapeHtml(event.location.trim());

        var hasLocation = Jx.isNonEmptyString(locationHtml);

        // Get event notes using temporary element to convert to text
        var notesElement = document.createElement("div");
        notesElement.innerHTML = event.data; // event.data has already been through toStaticHtml in the converter code
        var notesAsText = notesElement.innerText.trim();

        if (Jx.isNonEmptyString(notesAsText)) {
            notesAsText = Jx.res.getString("ProviderNotes") + notesAsText;
        }

        var displayAttendeeMessage = this._model.willEmailAttendees(originalEvent);
        
        var attendeeMessageHtml = Jx.escapeHtml(Jx.res.getString("ProviderAttendeesUpdate"));

        var html =
            '<div class="provEvent1">' +
                '<div id="provSubject">' + Jx.escapeHtml(subjectText) + '</div>' +
                (hasLocation ? '<div class="provLocation">' + locationHtml + '</div>' : "") +
                '<div class="provDateContainer">' +
                    '<div class="provDate">' + Jx.escapeHtml(this._formatEventDate(event)) + '</div>' +
                    ((event.recurring) ? '<div class="provRecur">&#x1f503;</div>' : '') +
                '</div>' +
                '<div id="provAttendees" title="' + attendeeMessageHtml + '" ' + ((displayAttendeeMessage) ? '' : 'style="display:none"') + '>' +
                     attendeeMessageHtml +
                '</div>' +
            '</div>' +
            '<div class="provEvent2">' +
                '<div id="provNotes">' + Jx.escapeHtml(notesAsText) + '</div>' +
            '</div>';

        return html;
    };

    proto._getRemoveEventHtml = function (event) {
        /// <summary>Builds and returns HTML for the event summary for remove</summary>
        /// <param name="event" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">event to render</param>
        /// <param name="titleOnly" type="Boolean">Indicates whether only the title HTML (not including wrapper and </param>

        var subjectText = getEventSubjectText(event);
        var displayAttendeeMessage = this._model.willEmailAttendees(event);

        // Use the notes field to display the attendee info message since we want it to behave similarly -
        // take up the remaining vertical space and wrap to multiple lines.

        var html =  '<div class="provEvent1">' +
                        '<div id="provSubject">' + Jx.escapeHtml(subjectText) + '</div>' +
                    '</div>' +
                    '<div class="provEvent2">' +
                        '<div id="provNotes"' + ((displayAttendeeMessage) ? '' : 'style="display:none"') + '>' + Jx.escapeHtml(Jx.res.getString("ProviderInfoDeleteAttendees")) + '</div>' +
                    '</div>';

        return html;
    };

    proto._formatEventDate = function (event) {
        /// <summary>Returns a string representing date/time range of the event</summary>

        var shortDate = new Jx.DTFormatter("shortDate");
        var shortTime = new Jx.DTFormatter("shortTime");
        
        var start = event.startDate;
        var end = event.endDate;
        var startText;
        var rangeText;

        // what we do depends on whether or not it's an all day event
        if (event.allDayEvent) {
            // all-day events that end at midnight technically end on "the next day".
            // however, that's not what we want to show when building the text, so we
            // adjust the end date back by one millisecond for all-day events.
            end = new Date(end.getTime() - 1);

            startText = shortDate.format(start);

            if (!Helpers.isSameDate(start, end)) {
                // it's not the same day, so append the next date
                rangeText = Jx.res.loadCompoundString("DateRangeShort", startText, shortDate.format(end));
            } else {
                rangeText = Jx.res.loadCompoundString("AllDaySuffix", startText);
            }
        } else {
            var shortDateAndTime = Helpers.shortDateAndTime;

            if (start.getTime() === end.getTime()) {
                // If it's a zero-duration event, only show the start date and time
                rangeText = shortDateAndTime.format(start);
            } else {
                // Either show two date/times, or one date followed by a time range.
                if (Helpers.isSameDate(start, end)) {
                    // Here we assume that date comes before time, which is confirmed in the Helpers unit tests.
                    startText = shortDate.format(start);
                    rangeText = startText + " " + Jx.res.loadCompoundString("TimeRange", shortTime.format(start), shortTime.format(end));
                } else {
                    startText = shortDateAndTime.format(start);
                    var endText = shortDateAndTime.format(end);
                    rangeText = Jx.res.loadCompoundString("DateRangeShort", startText, endText);
                }
            }
        }

        return rangeText;
    };

    proto.getUI = function (ui) {
        /// <summary>Builds UI for the main provider page</summary>

        var action = this._model.getAction();
        var isRemoveAction = action === ProviderAction.remove;
        var errorText = this._model.getErrorText();
        var hasError = Jx.isNonEmptyString(errorText);
        var bodyHtml = "";

        // This element helps with an accessibility issue.  See _handleFocusOut for more info.
        bodyHtml = '<a href="#" aria-hidden="true" class="provAccessHelper" id="provBefore"></a>';

        if (hasError) {
            bodyHtml += '<div class="provError">' + Jx.escapeHtml(errorText) + '</div>';
        } else {
            var calendars = this._model.getCalendars();
            var showCalendarSelector = calendars.length > 1;
            var eventToRender = null;
            var originalEvent = null;

            if (!showCalendarSelector && action !== ProviderAction.add) {
                // Can only load the original event if there is no calendar picker - otherwise we don't know which one to load.
                originalEvent = this._model.getOriginalEvent();
            }

            if (!isRemoveAction) {
                eventToRender = this._model.getEvent();
            } else {
                eventToRender = originalEvent;
            }

            var infoText = getInfoText(action, showCalendarSelector, eventToRender);

            if (Jx.isNonEmptyString(infoText)) {
                bodyHtml += '<div id="provInfo">' + Jx.escapeHtml(infoText) + '</div>';
            }

            if (showCalendarSelector) {
                var selector = this._calendarSelector = new Calendar.Views.CalendarSelector();

                bodyHtml += Jx.getUI(selector).html;
                this.append(selector);
            }

            if (!isRemoveAction) {
                Debug.assert(eventToRender !== null, "Should have event if there is no error text");
                // add/replace
                bodyHtml += this._getFullEventHtml(eventToRender, originalEvent);
            } else {
                bodyHtml += this._getRemoveEventHtml(originalEvent);
            }
        }

        // Button
        var buttonText;
        switch (action) {
            case ProviderAction.add:
                buttonText = Jx.res.getString("ProviderAdd");
                break;
            case ProviderAction.remove:
                buttonText = Jx.res.getString("ProviderDelete");
                break;
            case ProviderAction.replace:
                buttonText = Jx.res.getString("ProviderReplace");
                break;
            case ProviderAction.signIn:
                buttonText = Jx.res.getString("ProviderSignIn");
                break;
            default:
                Debug.assert(action === ProviderAction.closeError || action === ProviderAction.closeSuccess, "Unexpected action: " + action);
                buttonText = Jx.res.getString("ProviderClose");
                break;
        }

        bodyHtml += '<div class="provFooter"><button id="provButton" class="prov' + action + '">' + Jx.escapeHtml(buttonText) + '</button></div>';

        // This element helps handle an accessibility issue.  See _handleFocusOut for more info.
        bodyHtml += '<a href="#" aria-hidden="true" class="provAccessHelper" id="provAfter"></a>';

        ui.html = bodyHtml;
    };

    proto.activateUI = function () {
        /// <summary>Hooks up UI events</summary>
        _start("activateUI");

        Jx.Component.prototype.activateUI.call(this);

        this._buttonElement = $.id("provButton");
        Debug.assert(this._buttonElement, "Unexpected lack of button element");
        this._buttonElement.addEventListener("click", this._handleButton, false);

        this._beforeElement = $.id("provBefore");
        this._afterElement = $.id("provAfter");
        this._beforeElement.addEventListener("focus", this._handleFocusOut, true);
        this._afterElement.addEventListener("focus", this._handleFocusOut, true);

        if (this._calendarSelector) {
            this._calendarSelectorElement = $("#CalendarCombo .selection")[0];
            Debug.assert(this._calendarSelectorElement, "Unable to find calendar selector element");

            // The event has to be hooked up first because setting the calendar also fires the calendarSelected event
            if (this._model.getAction() !== ProviderAction.add) {
                this._calendarSelector.on("calendarSelected", this._handleCalendarChange);
            }
            
            this._setupCalendarSelector();
        }
        _stop("activateUI");
    };

    proto.deactivateUI = function () {
        /// <summary>Unregisters UI events</summary>

        if (this._buttonElement) {
            this._buttonElement.removeEventListener("click", this._handleButton, false);
            this._buttonElement = null;
        }

        this._calendarSelectorElement = null;

        if (this._beforeElement) {
            this._beforeElement.removeEventListener("focus", this._handleFocusOut, true);
            this._beforeElement = null;
        }

        if (this._afterElement) {
            this._afterElement.removeEventListener("focus", this._handleFocusOut, true);
            this._afterElement = null;
        }

        if (this._calendarSelector && this._model.getAction() !== ProviderAction.add) {
            this._calendarSelector.detach("calendarSelected", this._handleCalendarChange);
        }
    };

    proto.displayErrorUI = function () {
        /// <summary>Shows appropriate error UI.  Error should be set on model before calling this function</summary>

        if (!this._model.getErrorText()) {
            Debug.assert(false, "No error message present in displayErrorUI; error message will not be correct");
            var defaultErrorString = Jx.res.getString("ProviderStartErrorGeneric");
            this._model.setError(defaultErrorString, defaultErrorString);
        }

        var root = document.getElementById("providerRoot");

        this.deactivateUI();

        // Also need to remove the calendar selector - deactivate doesn't do that.
        var selector = this._calendarSelector;
        if (selector) {
            selector.shutdownComponent();
            this.removeChild(selector);
            this._calendarSelector = null;
        }

        var errorHtml = Jx.getUI(this).html;
        root.innerHTML = errorHtml;
        this.activateUI(); // hooks up the button
    };

    proto._setupCalendarSelector = function () {
        /// <summary>Initializes calendar selector with calendars</summary>

        var selector = this._calendarSelector;
        Debug.assert(selector);
        var idealSelectedCalendarId = null;

        var availableCalendars = this._model.getCalendars();
        selector.setCalendars(availableCalendars);

        if (this._model.getAction() === ProviderAction.add) {
            // For add, we'll share the calendar selection setting with the rest of calendar.
            idealSelectedCalendarId = this._getSettings().get("lastCalendarId");
        }
        selector.updateSelectionById(idealSelectedCalendarId);
    };

    proto._handleCalendarChange = function (ev) {
        /// <summary>Updates the UI related to the original event when the calendar changes.</summary>
        
        var calendar = this._model.getCalendars()[ev.data.index].calendar;
        var event = this._model.getOriginalEvent(calendar.id);
        var action = this._model.getAction();
        var displayAttendeeMessage = this._model.willEmailAttendees(event);
        var attendeesMessageElement;

        if (action === ProviderAction.remove) {
            // Both the event text and the info text can change as the event changes.
            document.getElementById("provSubject").innerText = getEventSubjectText(event);
            document.getElementById("provInfo").innerText = getInfoText(action, true, event);
            
            // For remove, we store the "you're going to send email" warning message in the notes field.
            attendeesMessageElement = document.getElementById("provNotes");
        } else {
            // For replace, we store the "you're going to send email" warning message in the attendees field.
            attendeesMessageElement = document.getElementById("provAttendees");
        }

        attendeesMessageElement.style.display = displayAttendeeMessage ? "" : "none";
    };

    proto._getSelectedCalendar = function (saveSelection) {
        /// <summary>Gets currently selected calendar.  Expected to be called in situations where there is an event (not closeSuccess when an event was not found for remove)</summary>
        /// <param name="name" type="Boolean">This function also has the option to save the selection as the last selected calendar ID.</param>

        var calendars = this._model.getCalendars();

        var selectedCalendar = null;
        if (this._calendarSelector) {
            selectedCalendar = calendars[this._calendarSelector.getSelectedCalendarIndex()].calendar;
        } else {
            Debug.assert(calendars.length === 1, "Expect there to be only one calendar option when the calendar picker is not present");
            selectedCalendar = calendars[0].calendar;
        }

        if (saveSelection) {
            this._getSettings().set("lastCalendarId", selectedCalendar.id);
        }

        return selectedCalendar;
    };

    proto._handleButton = function () {
        /// <summary>
        /// Handles button click event:
        /// 1. Performs appropriate action
        /// 2. Notifies Windows of action, which will also close the page.
        /// 2a. On error, shows error UI with new button.
        /// </summary>
        _start("handleButton");

        var showErrorUI = false;
        var model = this._model;
        var action = this._model.getAction();
        var selectedCalendar;

        _info("handleButton.action:" + action);

        switch (action) {
            case ProviderAction.remove:
                // If this fails, we'll show error UI after.
                selectedCalendar = this._getSelectedCalendar();
                showErrorUI = !model.deleteEvent(selectedCalendar);
                break;
            case ProviderAction.add:
            case ProviderAction.replace:
                // If this fails, we'll show error UI after.
                selectedCalendar = this._getSelectedCalendar(action === ProviderAction.add);
                showErrorUI = !model.saveEvent(selectedCalendar);
                break;
            case ProviderAction.signIn:
                // It might be nice to dismiss the dialog but we're seeing that sometimes it causes the calendar app to not launch.
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri("wlcalendar:")).done();
                break;
            default:
                Debug.assert(action === ProviderAction.closeError || action === ProviderAction.closeSuccess, "Unexpected action: " + action);
                model.reportWithoutSave();
                break;
        }

        if (showErrorUI) {
            this.displayErrorUI();
        }
        _stop("handleButton");
    };

    proto._handleFocusOut = function (ev) {
        /// <summary>Handles focus leaving the UI surface - workaround for Windows Blue Bugs 458592 </summary>
        /// <param name="ev" type="Event">Focus event object</param>

        // This is a workaround for Windows Blue Bugs 458592 in which the focus gets stuck on an incorrect element instead of wrapping between the beginning/end of the document.
        // In the UI I have added a "before" and "after" element which will get focus if tabbing before or after supported content.
        // Here, focus is handled on those elements, and the focus is switched to either the beginning or end of the document, as appropriate.

        if (!this._buttonElement) {
            return; // Just in case
        }

        if (!this._calendarSelectorElement || (ev.target === this._beforeElement)) {
            // The only focusable element on the page is the button, or we've wrapped around past the beginning of the document.
            // Put focus on the button.
            this._buttonElement.focus();
        } else {
            this._calendarSelectorElement.focus();
        }
    };

    proto._getSettings = function () {
        /// <summary>Gets access to the localSettings calendar object</summary>

        // get and cache our settings
        if (!this._settingsContainer) {
            var appData = new Jx.AppData();
            var localSettings = appData.localSettings();
            this._settingsContainer = localSettings.container("Calendar");
        }

        return this._settingsContainer;
    };
});