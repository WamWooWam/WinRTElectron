
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />
/// <reference path="..\..\..\Controls\AddressWell\src\AddressWell.dep.js" />
/// <reference path="..\datepicker\DatePickerAnchor.js" />
/// <reference path="..\datepicker\DatePicker.js" />

/*jshint browser:true*/
/*global Microsoft,WinJS,Debug,Jx,$,ModernCanvas,Calendar,AddressWell,setImmediate,requestAnimationFrame,EndOccurrence,AttendeeResponses*/

Jx.delayDefine(Calendar.Views, "EventDetails", function () {

    function _info(s) { Jx.mark("Calendar.ED." + s + ",Info,Calendar"); }
    function _markStart(s) { Jx.mark("Calendar.ED." + s + ",StartTA,Calendar"); }
    function _markStop(s) { Jx.mark("Calendar.ED." + s + ",StopTA,Calendar"); }

    var MWP              = Microsoft.WindowsLive.Platform,
        Platform         = MWP.Calendar,
        DataType         = Platform.DataType,
        ResponseType     = Platform.ResponseType,
        Sensitivity      = Platform.Sensitivity,
        RecurrenceType   = Platform.RecurrenceType,
        DayOfWeek        = Platform.DayOfWeek,
        AttendeeType     = Platform.AttendeeType,
        Status           = Platform.Status,
        BusyStatus       = Platform.BusyStatus,
        MeetingStatus    = Platform.MeetingStatus,
        ServerCapability = Platform.ServerCapability,
        UI               = WinJS.UI,
        Helpers          = Calendar.Helpers,
        loc              = Calendar.Loc,
        CalendarSelector = Calendar.Views.CalendarSelector;

    // HRESULTS (used for ErrorResponder error codes)
    var MailSendAddressErrorCode = -100,
        NoResponseMailErrorCode  = -200;

    var _longDate = new Jx.DTFormatter("longDate");

    function getAreaHidden(element) {
        var hidden = element.getAttribute("aria-hidden");
        return hidden ? hidden === "true" : false;
    }

    function setAreaHidden(e, v) {
        Debug.assert(Jx.isHTMLElement(e), "EventDetails.setAreaHidden: invalid element");
        Debug.assert(Jx.isBoolean(v), "EventDetails.setAreaHidden: invalid value");
        e.setAttribute("aria-hidden", v);
    }

    function setReadOnly(target) {
        var element = (Jx.isHTMLElement(target) ? target : this);

        Debug.assert(Jx.isHTMLElement(element), "EventDetails.setReadOnly: invalid element");
        element.setAttribute("aria-readonly", true);
        element.setAttribute("readonly", "readonly");
        $(element).addClass("readonly");

        // TODO Dantib make this Qx code work!
        // var label = $("#"+$(element).attr("aria-labelledby")).attr("readonly", "readonly");

        var ariaLabel = element.getAttribute("aria-labelledby");
        var label = ariaLabel ? $.id(ariaLabel) : null;
        if (label) {
            label.setAttribute("readonly", "readonly");
        }
    }

    function changeSelectIntoReadOnlyInput(target) {
        var element = (Jx.isHTMLElement(target) ? target : this);

        Debug.assert(Jx.isHTMLElement(element), "EventDetails.changeSelectIntoReadOnlyInput: invalid element");
        var input = document.createElement("input");

        input.type = "text";
        input.value = element.options[element.selectedIndex].text;
        input.id = element.id;
        input.className = element.className;
        input.setAttribute("aria-hidden", element.getAttribute("aria-hidden"));
        input.setAttribute("data-value-override", element.value);
        input.setAttribute("data-selectedIndex", element.selectedIndex);
        input.setAttribute("aria-readonly", true);
        input.setAttribute("role", "combobox");
        input.setAttribute("readonly", "readonly");

        $(input).addClass("readonly");

        if (element.getAttribute("aria-labelledby") !== null) {
            input.setAttribute("aria-labelledby", element.getAttribute("aria-labelledby"));
        }

        if (element.getAttribute("aria-label") !== null) {
            input.setAttribute("aria-label", element.getAttribute("aria-label"));
        }

        // TODO Dantib make this Qx code work!
        // var label = $("#"+$(element).attr("aria-labelledby")).attr("readonly", "readonly");

        var ariaLabel = element.getAttribute("aria-labelledby");
        var label = ariaLabel ? $.id(ariaLabel) : null;
        if (label) {
            label.setAttribute("readonly", "readonly");
        }

        element.parentNode.replaceChild(input, element);
    }

    function getSelectValue (select) {
        var attribute = select.getAttribute("data-value-override");
        return parseInt((attribute !== null ? attribute : select.value), 10);
    }

    function getSelectIndex (select) {
        var attribute = select.getAttribute("data-selectedIndex");
        return (attribute !== null ? parseInt(attribute, 10) : select.selectedIndex);
    }

    function _setTooltip(id, resid, shortcut) {
        new UI.Tooltip($.id(id), {innerHTML: loc.loadCompoundString(resid, Jx.key.getLabel(shortcut))});
    }

    function _isCustomDuration(minutes) {
        return (minutes < 0 || minutes > 120 || minutes % 30);
    }

    //
    // Event Details
    //

    var EventDetails = Calendar.Views.EventDetails = function /* @constructor */() {
        /// <summary>Event details view with edit functionality</summary>

        Debug.only(_info("EventDetails: constructor"));

        // Component initialization
        this.initComponent();
        this._id = "eventDetails";

        this._close              = this._close.bind(this);
        this._onCancel           = this._onCancel.bind(this);
        this._onDelete           = this._onDelete.bind(this);
        this._onSave             = this._onSave.bind(this);
        this._onSaveButton       = this._onSaveButton.bind(this);
        this._onSend             = this._onSend.bind(this);
        this._onRespond          = this._onRespond.bind(this);
        this._onHintReset        = this._onHintReset.bind(this);
        this._onKeyDown          = this._onKeyDown.bind(this);
        this._onGuestsChanged    = this._onGuestsChanged.bind(this);
        this._onCalendarSelected = this._onCalendarSelected.bind(this);
        this._onShowMoreSetFocus = this._onShowMore.bind(this, true);

        this._onFreeBusy     = this._onFreeBusy.bind(this);
        this._onFreeBusyBack = this._onFreeBusyBack.bind(this);

        this._onAccountChanged         = this._onAccountChanged.bind(this);
        this._onAccountResourceChanged = this._onAccountResourceChanged.bind(this);

        this._showDatePicker = this._showDatePicker.bind(this);

        Helpers.ensureFormats();

        this._calendarSelector  = new CalendarSelector();
        this._endOccurrence     = new EndOccurrence(this);
        this._attendeeResponses = new AttendeeResponses();

        this._selectedCalendarIndex = 0;
        this._calendars             = [];
        this._recipients            = [];
        this._readOnlyEndDate       = false;
        this._outerWidth            = 0;

        this._parseAttendeesCache    = null;
        this._idsCalendar            = null;
        this._isSkinny               = null;
        this._isSnap                 = null;
        this._datePickerPattern      = null;
        this._lastSelectedCalendarId = null;
        this._clickAnchor            = null;
        this._datePicker             = null;
        this._datePickerAnchor       = null;
        this._lastCancelDate         = null;
        this._startedAsMeeting       = false;
        this._forceDirty             = false;

        this._providerBiciInfo = {
            locationChanged: 0,
            recurrenceChanged: 0,
            notesChanged: 0,
        };
    };

    Jx.augment(EventDetails, Jx.Component);

    //
    // Constants
    //

    // Indices of relevant values in select fields
    EventDetails.reminder18 = 6;
    EventDetails.statusFree = 0;
    EventDetails.statusBusy = 1;
    EventDetails.durationAllDay = 5;
    EventDetails.durationCustom = 6;
    EventDetails.recurrences = {
        None: 0,
        Daily: 1,
        Weekdays: 2,
        MWF: 3,
        TTH: 4,
        Weekly: 5,
        Monthly: 6,
        Yearly: 7,
        Custom: 8
    };

    EventDetails.mwfDays = DayOfWeek.monday | DayOfWeek.wednesday | DayOfWeek.friday;
    EventDetails.tthDays = DayOfWeek.tuesday | DayOfWeek.thursday;
    EventDetails.weekDays = DayOfWeek.monday | DayOfWeek.tuesday | DayOfWeek.wednesday | DayOfWeek.thursday | DayOfWeek.friday;
    EventDetails.allDays = DayOfWeek.monday | DayOfWeek.tuesday | DayOfWeek.wednesday | DayOfWeek.thursday | DayOfWeek.friday | DayOfWeek.saturday | DayOfWeek.sunday;

    EventDetails.eventType = {
        Event: 0,
        Series: 1,
        Instance: 2,
        Exception: 3
    };

    EventDetails.CloseCommands = {
        cancel: 0,
        del:    1,
        save:   2,
        send:   3
    };

    EventDetails.BiciResponseType = {
        Edit: 0,
        Send: 1,
        NoSend: 2
    };

    EventDetails.BiciResponse = {
        3: 0, //ResponseType.Accepted
        2: 1, //ResponseType.Tentative
        4: 2  //ResponseType.Declined
    };

    EventDetails.InfiniteDate = -11644473600000; // JS numerical value for '0' date in C++, used to check to see whether we have a date set or not in recurrences.

    //
    // Public
    //

    EventDetails.prototype.createEvent = function (data) {
        /// <summary>
        ///     Tells eventDetails to create an event.
        ///     Has to be called before activateUI().
        /// </summary>
        /// <param name="data" type="Object">
        ///     data: Initial event state overrides. startDate, allDayEvent, etc ...
        /// </param>

        Debug.only(_info("EventDetails.createEvent:"));
        Debug.assert(!!data.startDate, 'Events must be created with at least a "startDate" e.g. data.startDate = new Date();');
        Debug.assert(!data.isAllDay, '"isAllDay" has been renamed to "allDayEvent".  Update your code and try again.');

        this._lastSelectedCalendarId = data.calendarId;

        // Validate arguments
        var endDate     = data.endDate,
            startDate   = data.startDate,
            allDayEvent = !!data.allDayEvent;

        if (!endDate) {
            if (allDayEvent) {
                // All day event should span from midnight to midnight
                startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                endDate   = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
            } else {
                // End date defaults to one hour after start date
                endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);

                if (endDate >= Calendar.LAST_DAY) {
                    endDate = startDate;
                }
            }
        }

        // Set fields on new event with default values.
        this._initEvent = {
            subject         : (data.subject ? data.subject : ""),
            location        : (data.location ? data.location : ""),
            startDate       : startDate,
            endDate         : endDate,
            allDayEvent     : allDayEvent,
            busyStatus      : (allDayEvent ? BusyStatus.free : BusyStatus.busy),
            reminder        : (allDayEvent ? Calendar.DEFAULT_ALLDAY_EVENT_REMINDER : Calendar.DEFAULT_EVENT_REMINDER),
            sensitivity     : Sensitivity.normal,
            description     : "",
            dataType        : DataType.html,
            responseType    : ResponseType.organizer,
            recurring       : false,
            attendeeList    : [],
            recurrenceIndex : 0,
        };

        this._eventType   = EventDetails.eventType.Event;
        this._targetEvent = null;
        this._organizer   = true;
    };

    EventDetails.prototype.editEvent = function (targetEvent, dirty) {
        /// <summary>
        ///     Tells eventDetails to start editing an existing event.
        ///     Has to be called before activateUI().
        /// </summary>
        /// <param name="targetEvent">The event to edit</param>

        Debug.only(_info("EventDetails.editEvent:"));

        this._eventType = null;

        try {
            this._getEvent(null, targetEvent);
            this._cacheEvent();
            this._forceDirty = dirty;

            return true;
        } catch (e) {
            // TODO There was work after 4.2 to prompt the user with an error message.
            Debug.only(_info("EventDetails.editEvent: exception in edit Event - Error #: " + e.number));

            // TODO rethrow once we can add an error dialog
            //if (e.number !== Platform.Status.errorEventInvalidOccurrenceTime) {
            //    Jx.promoteOriginalStack(e);
            //    throw e;
            //}
        }

        return false;
    };

    // Jx.Component Methods

    EventDetails.prototype.getUI = function (ui) {
        _markStart("getUI");

        if (!this._who) {
            _markStart("getUI:AW");
            // disable the who field if you're not the organizer or if the event is read only
            var disableAddressWell = (this._targetEvent && this._targetEvent.calendar.readOnly) || !this._organizer;

            this._who = new AddressWell.Controller(
                "who",
                null,           // no prefilled recipients
                this._getPlatform(),
                false,           // showSuggestions
                loc.getString("EventGuestsPlaceholder"),
                null);          // use default contact search mode (email)
            
            AddressWell.dropdownToContainerWidthPercentage = 1;
            
            this._who.setDisabled(disableAddressWell);

            this.append(this._who);
            _markStop("getUI:AW");
        }

        var guestLabel = this._organizer ? loc.getString("EventGuestsLabel") : loc.getString("EventGuestsLabelAttendee");

        ui.html = this._mainTemplate(Jx.getUI(this._who).html, Jx.getUI(this._calendarSelector).html, guestLabel);

        _markStop("getUI");
    };

    EventDetails.prototype.activateUI = function (jobset) {
        _markStart("activateUI");

        var eventDetailsRoot = $.id(this._id);

        // Hide the DOM while we are making updates.
        eventDetailsRoot.style.visibility = "hidden";

        Jx.Component.prototype.activateUI.call(this);

        this._jobset = jobset;

        _markStart("activateUI:AW");

        // setup addresswell
        this._whoElement = $.id(this._who.getInputElementId());
        this._who._scrollableElement = $.id("schedule");
        this._who.setLabelledBy("GuestsDescrip");

        _markStop("activateUI:AW");

        // Reset UI settings
        this._isCustomDuration = false;
        this._prevValues = null;
        this._hasAttendee = false;
        this._targetEventCommitting = false; // Prevent multiple saves due to slow animations
        this._selectedCalendarIndex = 0;
        this._calendars  = [];
        this._recipients = [];
        this._parseAttendeesCache = null;
        this._canAddSignature = false;

        // Clear reference to account
        this._account = null;

        // load storage data
        var data = {};
        this.fire("getSettings", data);
        this._settings = data.settings;

        // Apply localization to the address well control only,
        // the rest of the event details UI is doing localization in the HTML template
        loc.processAll(this._whoElement);

        // Set up the buttons
        $("#cedCancel").on("click",      this._onCancel);
        $("#FreeBusyButton").on("click", this._onFreeBusy);

        // Set up form controls
        this._calendarSelector.activateUI();
        this._setupCalendarCombo();
        this._setupStatus(this._initEvent.busyStatus);
        this._who.setContextualAccount(this._calendars[this._selectedCalendarIndex].calendar.account);

        _markStart("activateUI:Canvas");

        this._canvas = $.id("NotesTextbox");
        this._dirtyTracker = new ModernCanvas.Plugins.DirtyTracker();

        ModernCanvas.createCanvasAsync(this._canvas, {
            className: "calendar",
            delayActivation: true,
            plugins: {dirtyTracker: this._dirtyTracker}
        }).done(function (canvasControl) {
                /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />

                this._canvasControl = canvasControl;
                canvasControl.setCueText(Jx.res.getString("cedCanvasCueText"));

                _markStart("activateUI:CanvasContent");

                // Set canvas content (avoid misleading error message when length is 0)
                if (!this.isNewEvent() && this._initEvent.description.length > 0) {
                    var description = this._initEvent.description;
                    var contentFormat = ModernCanvas.ContentFormat.text;

                    if (this._initEvent.dataType === DataType.html) {
                        description = description.replace(/[\r\n]/g, "");
                        contentFormat = ModernCanvas.ContentFormat.htmlString;
                    } else if (this._initEvent.dataType === DataType.plainText) {
                        this._initEvent.dataType = DataType.html;
                    } else {
                        description = "";
                    }
                    canvasControl.addContent(description, contentFormat, ModernCanvas.ContentLocation.all);
                }

                canvasControl.activate();
                this._updateCanvasStyles();

                // Listen for shortcuts inside the canvas
                canvasControl.addEventListener("keydown", this._onKeyDown, false);

                _markStop("activateUI:CanvasContent");
            }.bind(this));

        _markStop("activateUI:Canvas");

        _markStart("activateUI:Duration");
        // Set up date/time fields
        UI.processAll($.id("schedule"));
        var isCustomDuration = this._setupDuration(this._initEvent.startDate, this._initEvent.endDate, this._initEvent.allDayEvent);
        _markStop("activateUI:Duration");

        if (this._initEvent.recurrence) {
            this._setupRecurrence(this._initEvent.recurrence);
        }

        if (!this._organizer || this._initEvent.recurring && this._eventType !== EventDetails.eventType.Series) {
            changeSelectIntoReadOnlyInput($.id("RecurrenceCombo"));
        }

        this._setupAttendees();

        setAreaHidden($.id("OrganizerDescrip"), !!this._organizer);

        if (this._organizer) {
            if (this._hasAttendee && this._hasAttendeeStatus()) {
                this._attendeeResponses.activateUI(this._who, this._initEvent.attendeeList, this._targetEvent.organizerEmail);
            }
        } else {
            this._insertOrganizer(this._who);
            this._showYourResponse();
        }

        $.id("ReminderCombo").value     = this._initEvent.reminder;
        $.id("EventTitleTextbox").value = this._initEvent.subject;
        $.id("LocationTextbox").value   = this._initEvent.location;

        if (!this.isNewEvent()) {
            if ($.id("ReminderCombo").selectedIndex < 0) {
                // Create custom option for reminder minutes
                this._addOption($.id("ReminderCombo"), loc.getString("EventReminderCustom"), this._initEvent.reminder, true);
            }

            // Check "private" for any non-normal sensitivity
            if (this._initEvent.sensitivity !== Sensitivity.normal) {
                $.id("PrivateCheckbox").checked = true;
            }
        }

        this._startedAsMeeting = this._isMeeting();
        this._updateButtons();

        _setTooltip("cedCancel", "cedCancelTooltip", "Escape");
        _setTooltip("cedDelete", "cedDeleteTooltip", "Ctrl+D");
        _setTooltip("cedSave", "cedSaveTooltip", "Ctrl+S");
        _setTooltip("cedSend", "cedSendTooltip", "Alt+S");
        _setTooltip("cedRespond", "RespondCommand", "Ctrl+P");

        this._updateAppBar();

        // We care about portrait and snap widths, so we use a generic resize handler
        this.on("resizeWindow", this._onResizeWindow);

        // resize needs to run on startup to set button sizes for snap/full view etc...
        this._outerWidth = 0;
        this._onResizeWindow({data:{outerWidth:window.outerWidth}});

        // Hook events
        if (!isCustomDuration) {
            $("#EventDuration").on("change", this._onDurationChanged.bind(this));
        }

        if (this._targetEvent && this._targetEvent.calendar.readOnly) {
            $("input:not(#" + this._who.getInputElementId() + ")", $.id("schedule")).each(setReadOnly);
            $("select", $.id("schedule")).each(changeSelectIntoReadOnlyInput);

            setReadOnly($.id("StartDateCombo"));
            setReadOnly($.id("GuestsDescrip"));
            setReadOnly($.id("PrivateCheckbox"));
            setReadOnly($.id("AlldayCheckbox"));
            $.id("PrivateCheckbox").disabled = true;
            $.id("AlldayCheckbox").disabled = true;
        } else {
            $("#AlldayCheckbox").on("change", this._onAllDayChanged.bind(this));

            if (this._organizer) {
                this._who.addListener(AddressWell.Events.recipientsAdded,  this._onGuestsChanged);
                this._who.addListener(AddressWell.Events.recipientRemoved, this._onGuestsChanged);
                this._whoIsListening = true;
            } else {
                setReadOnly($.id("GuestsDescrip"));
            }

            $("#EventTitleTextbox").on("blur", this._onHintReset);

            $("#PrivateCheckboxDescrip").click(function() {
                $.id("PrivateCheckbox").click();
            });

            $("#AlldayCheckboxDescrip").click(function() {
                $.id("AlldayCheckbox").click();
            });
        }

        $("#GuestsCombo").on("keydown", function(ev) {
            if (ev.key === "Esc") {
                ev.stopImmediatePropagation();
                ev.target.blur();
            }
        });

        this._endOccurrence.activateUI();

        $("#ShowMoreButton").on("click", this._onShowMoreSetFocus).on("keyup", this._onShowMoreSetFocus);

        // Disable the time selectors for series if you are an attendee.
        if (this._eventType !== EventDetails.eventType.Event && !this._organizer) {
            setReadOnly($.id("StartDateCombo"));
            $("select", $.id("StartTimeCombo")).each(changeSelectIntoReadOnlyInput);

            if (!isCustomDuration) {
                $("select#EventDuration").each(changeSelectIntoReadOnlyInput);
            }
        }

        $(document).on("keydown", this._onKeyDown);

        if (!this.isNewEvent()) {
            Jx.ptStop("Calendar-EventDetails-Data");
        } else {
            Jx.ptStop("Calendar-EventDetails-NoData");
        }

        $("#StartDateCombo,#EndDateCombo,#EndOccurrenceCombo").on("click", this._showDatePicker);
        $("#StartDateCombo,#EndDateCombo,#EndOccurrenceCombo").on("keydown", this._showDatePicker);

        eventDetailsRoot.style.visibility = "";

        this._animateIn();

        _markStop("activateUI"); // used in perfbench
    };

    EventDetails.prototype._getDatePicker = function () {
        if (!this._datePicker) {
            // instantiate a date picker with a fixed winjs id (just dp-flyout with no suffix)
            // doing this allows test to watch for winjs events with a known name, otherwise
            // winjs uses an internal id in its log string that is difficult to capture
            // use the full path to the DatePicker to allow for mocking
            var datePicker = this._datePicker = new Calendar.Controls.DatePicker(Calendar.Controls.DatePicker.PickMode.monthGrid),
                today      = Calendar.getToday();

            this.appendChild(datePicker);

            datePicker.showFreeBusy = false;
            datePicker.showJumpTargets = false;
            datePicker.setIdSuffix("");  // forces the id to be "dp-flyout" for test
            datePicker.addCustomClass("eventDetailsPicker");  // don't set to normal view class, or style cross-contamination can occur
            datePicker.setToday(today);
            datePicker.setFocusDate(today);
            datePicker.clientView = Calendar.Controls.DatePicker.ClientView.day;
            datePicker.activateUI(this._jobset);
            datePicker.on("dateSelected", this._onDatePickerDateSelected, this);
        }

        return this._datePicker;
    };

    EventDetails.prototype._updateCanvasStyles = function () {
        var layout = this._getLayout();
        Debug.assert(Jx.isBoolean(layout.isSkinny));
        Debug.assert(Jx.isBoolean(layout.isSnap));
        if (this._canvasControl) {
            var canvasIframeBody = this._canvasControl.getDocument().body;
            Jx.setClass(canvasIframeBody, "skinny", layout.isSkinny);
            Jx.setClass(canvasIframeBody, "snap", layout.isSnap);
        }
    };

    EventDetails.prototype._onShowMore = function (setFocus, ev) {
        /// <param name="ev" type="Object" optional="true">Event to check for specific key presses.</param>

        if (!ev || !ev.key || (ev.key === "Enter" || ev.key === "Spacebar")) {
            if (!getAreaHidden($.id("ShowMoreButton"))) {
                setAreaHidden($.id("ShowMoreButton"), true);
                setAreaHidden($.id("ShowMore"), false);

                // Update the AddressWell's flow-to to account for the layout change.
                this._updateWhoAriaFlow();

                if (setFocus) {
                    $.id("RecurrenceCombo").focus();
                }

                this._endOccurrence.update();
            }
        }
    };

    EventDetails.prototype.deactivateUI = function () {
        Debug.only(_info("EventDetails.deactivateUI:"));

        this._unhookAccount();
        this._unhookAccountResource();

        if (this._freeBusy) {
            this._freeBusy.removeListener("back", this._onFreeBusyBack, this);
            this._freeBusy.shutdownUI();

            this.removeChild(this._freeBusy);

            this._freeBusy     = null;
            this._freeBusyHost = null;
        }

        // shut down date picker
        $("#StartDateCombo,#EndDateCombo,#EndOccurrenceCombo").off("click", this._showDatePicker);
        $("#StartDateCombo,#EndDateCombo,#EndOccurrenceCombo").off("keydown", this._showDatePicker);

        if (this._datePicker) {
            this._datePicker.detach("dateSelected", this._onDatePickerDateSelected, this);
            this.removeChild(this._datePicker);
            this._datePicker.shutdownUI();
            this._datePickerAnchor = null;
            this._datePicker = null;
        }

        this._calendarSelector.detach("calendarSelected", this._onCalendarSelected);
        this._calendarSelector.deactivateUI();

        Jx.Component.prototype.deactivateUI.call(this);

        $(document).off("keydown", this._onKeyDown);

        $("#ShowMoreButton").off("click", this._onShowMoreSetFocus).off("keyup", this._onShowMoreSetFocus);

        this.detach("resizeWindow", this._onResizeWindow);

        if (this._whoIsListening) {
            this._who.removeListener(AddressWell.Events.recipientsAdded,  this._onGuestsChanged);
            this._who.removeListener(AddressWell.Events.recipientRemoved, this._onGuestsChanged);
            this._whoIsListening = false;
        }

        if (this._appBar) {
            this._appBar.disabled = false;
        }
        if (this._peekBar) {
            this._peekBar.show();
        }

        if (this._canvasControl) {
            this._canvasControl.removeEventListener("keydown", this._onKeyDown, false);
            this._canvasControl.dispose();
            this._canvasControl = null;
        }

        if (this._buttonStyle) {
            var head = document.getElementsByTagName("head")[0];
            head.removeChild(this._buttonStyle);
            this._buttonStyle = null;
        }
    };

    EventDetails.prototype._setStartDate = function(date) {
        this._controls.startDate = date;

        var dateString = _longDate.format(date);
        var label = loc.getString("EventDateLabel");

        $.id("StartDateCombo").setAttribute("aria-label", label + ", " + dateString);
        $("#StartDateCombo .value").text(dateString);
    };

    EventDetails.prototype._setEndDate = function(date) {
        this._controls.endDate = date;

        var dateString = _longDate.format(date);
        var label = loc.getString("EventEndLabel");

        $.id("EndDateCombo").setAttribute("aria-label", label + ", " + dateString);
        $("#EndDateCombo .value").text(dateString);
    };

    EventDetails.prototype._onDatePickerDateSelected = function(ev) {
        Debug.assert(this._datePickerAnchor !== null, "_datePickerAnchor should be a dom element");

        if (this._datePickerAnchor === $.id("StartDateCombo")) {
            this._setStartDate(ev.data);

            var duration = this.getDuration();

            if (duration.startDate > duration.endDate) {
                this._setEndDate(this._controls.startDate);
            }
        } else if (this._datePickerAnchor === $.id("EndDateCombo")) {
            this._setEndDate(ev.data);
        } else if (this._datePickerAnchor === $.id("EndOccurrenceCombo")) {
            this._endOccurrence.setDate(ev.data);
        }
    };

    EventDetails.prototype._showDatePicker = function(ev) {
        var target    = ev.target,
            className = target.className;

        // Date picker anchors are not real selection boxes, so we select their parent element here.
        if (className === "check" || className === "value") {
            target = target.parentNode;
        }

        // Don't activate the date picker if this element is readonly.
        if (target.getAttribute("readonly")) {
            return;
        }

        var code  = ev.keyCode,
            codes = Jx.KeyCode;

        // Only respond to the space or enter key.
        if (code && code !== codes.enter && code !== codes.space) {
            return;
        }

        this._datePickerAnchor = target;

        ev.stopPropagation();
        ev.preventDefault();

        var datePicker = this._getDatePicker();
        if (!datePicker.getActive()) {
            var position = "bottom";
            var checkPosition = false;

            datePicker.setToday(Calendar.getToday());

            if (this._datePickerAnchor === $.id("StartDateCombo")) {
                datePicker.setFocusDate(this._controls.startDate);
                datePicker.setHighlightDates([this._controls.startDate]);
            } else if (this._datePickerAnchor === $.id("EndDateCombo")) {
                datePicker.setFocusDate(this._controls.endDate);
                datePicker.setHighlightDates([this._controls.endDate]);
                // end date can sometimes reach the bottom of the screen
                checkPosition = true;
            } else if (this._datePickerAnchor === $.id("EndOccurrenceCombo")) {
                datePicker.setFocusDate(this._endOccurrence.date());
                datePicker.setHighlightDates([this._endOccurrence.date()]);

                // recurrence end date can sometimes reach the bottom of the screen
                checkPosition = true;
            }

            if (checkPosition) {
                _markStart("_showDatePicker:checkPosition");

                var MIN_FLYOUT_CLEARANCE = 369;  // sum of the datepicker, margin
                var schedule = $.id("schedule");
                var eventDetails = $.id("eventDetails");

                // validates that the MIN_FLYOUT_CLEARANCE hard-coded value agrees with the current styling
                Debug.call(function() {
                    // only perform this check if the flyout exists (might not if this is the first
                    // datepicker access in this view)
                    var datePickerFlyout = datePicker._flyoutHost;
                    if (datePickerFlyout)
                    {
                        var datePickerEl = datePicker._flyoutHost.element;
                        var elStyle = datePickerEl.currentStyle;

                        // this assumes the border and width are given in px
                        var calcHeight = datePickerEl.offsetHeight +
                            parseInt(elStyle.marginTop, 10) + parseInt(elStyle.marginBottom, 10);
                        Debug.assert(calcHeight === MIN_FLYOUT_CLEARANCE,
                            "unexpected MIN_FLYOUT_CLEARANCE, expected " + MIN_FLYOUT_CLEARANCE + ", but got " + calcHeight);
                    }
                });

                // #schedule scrolls in full screen, while #eventDetails scrolls when narrow.  both do not scroll at the same time
                Debug.assert(schedule.scrollTop === 0 || eventDetails.scrollTop === 0, "both schedule and eventDetails are scrolled");

                // favor bottom for flyouts unless there isn't room
                var anchor = this._datePickerAnchor;
                var bottomOfAnchor = anchor.offsetTop + anchor.offsetHeight - schedule.scrollTop - eventDetails.scrollTop;
                if (window.outerHeight - bottomOfAnchor < MIN_FLYOUT_CLEARANCE) {
                    position = "top";
                }
                _markStop("_showDatePicker:checkPosition");
            }

            datePicker.show(this._datePickerAnchor, position, (Jx.isRtl()) ? "right" : "left");
        }
    };

    EventDetails.prototype._showYourResponse = function () {
        // Don't show the user their response if it's set to organizer
        if (this._initEvent.responseType === ResponseType.organizer) {
            return;
        }

        var responseRequested = this._targetEvent.responseRequested;
        if (!responseRequested || this._hasResponseStatus()) {
            var yourResponse  = $.id("yourResponse");

            var responseTypes = [
                loc.getString("EventYourResponseNoResponse"),
                "organizer", // Not Shown
                loc.getString("EventYourResponseTentative"),
                loc.getString("EventYourResponseAccepted"),
                loc.getString("EventYourResponseDeclined"),
                loc.getString("EventYourResponseNoResponse"),
            ];
            var shouldShowNoResponseRequestedIndicator = !responseRequested && !this.hasResponded();
            yourResponse.innerText = shouldShowNoResponseRequestedIndicator ? loc.getString("EventYourResponseNoResponseRequested") : responseTypes[this._initEvent.responseType];
            setAreaHidden(yourResponse, false);
        }
    };

    EventDetails.prototype.getEvent = function () {
        /// <summary>
        /// Returns the event currently being edited (original data)
        /// May return null if it is a new event
        /// </summary>

        return this._targetEvent;
    };

    EventDetails.prototype.getTitle = function () {
        return $.id("EventTitleTextbox").value;
    };

    function isDescendantOf(descendent, ancestor) {
        Debug.assert(Jx.isHTMLElement(descendent), "EventDetails isDescendantOf: descendent must be an HTML element");
        Debug.assert(Jx.isHTMLElement(ancestor), "EventDetails isDescendantOf: ancestor must be an HTML element");

        while (descendent && descendent !== ancestor) {
            descendent = descendent.parentNode;
        }

        return descendent === ancestor;
    }

    EventDetails.prototype._animateIn = function () {
        _markStart("_animateIn");

        if (!this.isNewEvent()) {
            // work around for windows bug, long titles are not showing until clicked in ur-pk
            $.id("EventTitleTextbox").value = $.id("EventTitleTextbox").value;
        }

        var leftPane = [$.id("nav"), $.id("schedule")],
            rightPane = [$.id("cedTitle"), $.id("cedNotes")];

        var onAnimationEnd = (function () {
            if (this.hasUI()) {
                // We don't want to override user focus if they select something before animation ends.
                // Sometimes focus is left on flyout prompt click eaters when we enter event details.
                if (!document.activeElement || !isDescendantOf(document.activeElement, $.id(this._id))) {
                    $.id("EventTitleTextbox").focus();
                }

                $.id("cedBackground").style.opacity = 1;

                this.fire("viewReady");

                _info("eventDetailsReady");
            }
        }).bind(this);

        WinJS.UI.Animation.enterPage([leftPane, rightPane]).done(onAnimationEnd, onAnimationEnd);

        _markStop("_animateIn");
    };

    // copied gratuitously from mail compose to align behavior
    EventDetails.prototype._animateOut = function (command, targetEvent) {
        this._closing = true;

        var CloseCommands = EventDetails.CloseCommands;

        // NOTE: WLI data points always start lowercase even when defined uppercase. (calendarEventExit)
        if (command === CloseCommands.save) {
            Jx.bici.addToStream(this._getIdsCalendar().calendarEventExit, 0);
            Debug.only(_info("IdsCalendar.calendarEventExit: 0"));
        } else if (command === CloseCommands.cancel) {
            Jx.bici.addToStream(this._getIdsCalendar().calendarEventExit, 1);
            Debug.only(_info("IdsCalendar.calendarEventExit: 1"));
        }

        var background = $.id("cedBackground"),
            container  = $.id("cedWrapper"),
            nav        = $.id("nav");

        var containerAnimation = null,
            navAnimation = null;

        // fade out background
        var backgroundAnimation = {
            property: "opacity",
            delay: 0,
            duration: 333,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            keyframe: "cedExitFade"
        };

        if (command === CloseCommands.send || command === CloseCommands.del) {
            backgroundAnimation.duration = 166;
            backgroundAnimation.delay    = 366;
            backgroundAnimation.timing   = "linear";

            var width = this._outerWidth;
            if (width > 440) {
                // we want a specific transform origin for the scale for non-snap
                // this is the middle of the divider between the left and right panes
                if (Jx.isRtl()) {
                    container.style.msTransformOrigin = String(width - 580) + "px";
                } else {
                    container.style.msTransformOrigin = "580px";
                }
            }

            if (command === CloseCommands.send) {
                // move to the top
                containerAnimation = {
                    property: "transform",
                    delay: 0,
                    duration: 532,
                    timing: "linear",
                    keyframe: "cedExitUp"
                };
                container.style.msTransform = "matrix(0.75, 0.0, 0.0, 0.75, 0, -500)";
            } else if (command === CloseCommands.del){
                // move to the bottom
                containerAnimation = {
                    property: "transform",
                    delay: 0,
                    duration: 532,
                    timing: "linear",
                    keyframe: "cedExitDown"
                };
                container.style.msTransform = "matrix(0.75, 0.0, 0.0, 0.75, 0, 500)";
            }
        } else {
            containerAnimation = backgroundAnimation;

            // The #nav element is inside the container, but is absolutely positioned,
            // so the opacity animation needs to be specified separately.  This happens
            // in snap and portrait.
            var layout = this._getLayout();
            if (layout.isSkinny) {
                navAnimation = containerAnimation;
            }
        }

        // set the opacities that we expect when the animation ends
        background.style.opacity = 0;
        container.style.opacity = 0;
        if (navAnimation) {
            nav.style.opacity = 0;
        }

        var onAnimationEnd = (function (ev) {
                                    this._close(ev);

                                    if (command === CloseCommands.save) {
                                        _info("save_complete"); // used in perfbench
                                    }
                              }).bind(this, targetEvent);

        var onAnimationError = (function (ev, error) {
                                    Jx.log.error("Animation out failed during execution with error: " + error);
                                    Debug.assert(false, "Animation out failed during execution with error: " + error);
                                    this._close(ev);
                                }).bind(this, targetEvent);

        // reset focus so we don't have floating carets
        if (document.activeElement) {
            // blur can throw an exception #505708
            try {
                document.activeElement.blur();
            } catch (e) {}
        }

        // make sure we independently animate
        background.style.zIndex = "auto";

        try {
            // multiple executeAnimation calls should cause animations to occur
            // simultaneously at the next layout pass
            WinJS.UI.executeAnimation(background, backgroundAnimation);
            if (navAnimation) {
                WinJS.UI.executeAnimation(nav, navAnimation);
            }
            WinJS.UI.executeAnimation(container, containerAnimation).done(
                onAnimationEnd,
                onAnimationError
            );
        } catch (err) {
            // If we failed to execute the animation, still go ahead and continue on.
            Jx.log.error("Animation out failed with error: " + err);
            Debug.assert(false, "Animation out failed with error: " + err);
            this.close(targetEvent);
        }
    };

    EventDetails.prototype._hookAccountResource = function(resource) {
        Debug.assert(!this._hookedAccountResource);

        this._hookedAccountResource = resource;
        resource.addEventListener("changed", this._onAccountResourceChanged);
    };

    EventDetails.prototype._unhookAccountResource = function() {
        if (this._hookedAccountResource) {
            this._hookedAccountResource.removeEventListener("changed", this._onAccountResourceChanged);
            this._hookedAccountResource = null;
        }
    };

    EventDetails.prototype._hookAccount = function (account) {
        Debug.assert(!this._hookedAccount);

        this._hookedAccount = account;
        account.addEventListener("changed", this._onAccountChanged);
    };

    EventDetails.prototype._unhookAccount = function () {
        if (this._hookedAccount) {
            this._hookedAccount.removeEventListener("changed", this._onAccountChanged);
            this._hookedAccount = null;
        }
    };

    // this fixes strange windows 8 behavoir with hint text / value text, showing / not showing
    EventDetails.prototype._onHintReset = function (ev) {
        var element = ev.srcElement;

        if (element.value === "") {
            element.value = "";
        } else {
            element.value = element.value;
        }
    };

    EventDetails.prototype._onKeyDown = function (ev) {
        /*
        ESC    - Cancel/Close edits
        CTRL+S - Send and Save
        ALT+S  - Send
        CTRL+D - Delete event
        CTRL+P - Respond button (e.g., button to launch the menu to Accept or Decline the invite)
        */

        if (this._closing) {
            return;
        }

        this._clickAnchor = null;

        var code  = ev.keyCode,
            codes = Jx.KeyCode;

        if (ev.shiftKey && ev.ctrlKey && !ev.altKey) {
            if (code === codes.r) {
                Debug.only(_info("EventDetails _onKeyDown: Ctrl+Shift+R"));

                if (this._showForwardReplyOptions().reply) {
                    this._replyForward(Calendar.MailAction.replyAll);
                }
            }
        } else if (!ev.shiftKey && ev.ctrlKey && !ev.altKey) {
            switch (code) {
            case codes.r:
                Debug.only(_info("EventDetails _onKeyDown: Ctrl+R"));

                if (this._showForwardReplyOptions().reply) {
                    this._replyForward(Calendar.MailAction.reply);
                }
                break;

            case codes.f:
                Debug.only(_info("EventDetails _onKeyDown: Ctrl+F"));

                if (this._showForwardReplyOptions().forward) {
                    this._replyForward(Calendar.MailAction.forward);
                }
                break;

            case codes.s:
                Debug.only(_info("EventDetails _onKeyDown: Ctrl+S"));

                if (!this._targetEvent || !this._targetEvent.calendar.readOnly) {
                    if (this._shouldShowSendButton()) {
                        this._onSend({});
                    } else {
                        this._onSaveButton({});
                    }
                }
                break;

            case codes.d:
                Debug.only(_info("EventDetails _onKeyDown: Ctrl+D"));

                if (this._targetEvent && !this._targetEvent.calendar.readOnly) {
                    // anchor the confirmation popup on the title
                    this._onDelete({});
                }

                break;

            case codes.p:
                Debug.only(_info("EventDetails _onKeyDown: Ctrl+P"));

                var cedRespond = $.id("cedRespond"),
                    isRespondVisible = !getAreaHidden(cedRespond);

                if (isRespondVisible) {
                    this._onRespond({currentTarget:$.id("cedRespond")});
                }

                break;
            }
        } else if (!ev.shiftKey && !ev.ctrlKey && ev.altKey) {
            if (code === codes.period) {
                Debug.only(_info("EventDetails _onKeyDown: Alt+."));

                if (this._who) {
                    this._who.launchPeoplePicker();
                }
            } else if (code === codes.s) {
                Debug.only(_info("EventDetails _onKeyDown: Alt+S"));

                var cedSend = $.id("cedSend"),
                    isSendVisible = !getAreaHidden(cedSend);

                if (isSendVisible) {
                    this._onSend({});
                }
            }
        } else if (!ev.shiftKey && !ev.ctrlKey && !ev.altKey) {
            if (code === codes.escape) {
                Debug.only(_info("EventDetails _onKeyDown: Esc"));

                // Do nothing if there are any flyout visible.
                var flyouts       = $(".win-flyout"),
                    flyoutVisible = false,
                    i             = flyouts.length;

                while (i--) {
                    if (flyouts[i].currentStyle.visibility !== "hidden") {
                        flyoutVisible = true;
                        break;
                    }
                }

                if (!flyoutVisible) {
                    ev.preventDefault(); // Esc in input fields restores the original text value
                    this._onCancel({currentTarget:$.id("cedCancel")});
                }
            }
        }
    };

    EventDetails.prototype._getLayout = function (width) {
        var outerWidth = width || this._outerWidth;

        return {
            outerWidth: outerWidth,
            isSkinny: (outerWidth <= 1023),
            isSnap: (outerWidth <= 499)
        };
    };

    EventDetails.prototype._onResizeWindow = function (ev) {
        // don't resize if only the height changed, this happens when you open the keyboard.
        var layout = this._getLayout(ev.data.outerWidth);
        if (this._outerWidth === layout.outerWidth) {
            return;
        }

        _markStart("_onResizeWindow");

        // Save focus and reset it, if it is lost during resize.
        var activeElement = document.activeElement;
        if (activeElement && activeElement !== document.querySelector(".modernCanvas-frame")) {
            setImmediate(function () {
                if (!document.activeElement) {
                    activeElement.focus();
                }
            });
        }

        // Re-show the cancel dialog if it has been requested "recently" (arbitrarily: 2 seconds) and it's still open, since the resize will close it.
        if (this._lastCancelDate && (Date.now() - this._lastCancelDate.getTime() < 2000) && Helpers.isPopupVisible()) {
            this._onCancel({});
        }

        this._outerWidth = layout.outerWidth;

        if (layout.isSkinny !== this._isSkinny) {
            // Update event title placeholder
            // Workaround for Win8 bug #688943: Setting the placeholder needs to be done before moving the element and the value needs to be refreshed.
            var e = $.id("EventTitleTextbox");
            e.value = e.value;
            e.placeholder = layout.isSkinny ? "" : loc.getString("EventTitlePlaceholder");

            [
                { full:"cedButtonsFull", skinny:"cedButtonsSnap" },
                { full:"cedTitleFull"  , skinny:"cedTitleSnap" },
                { full:"cedBackFull"   , skinny:"cedBackSnap" },
            ].forEach(function (item) {
                var full   = $.id(item.full),
                    skinny = $.id(item.skinny),
                    src    = layout.isSkinny ? full : skinny,
                    dest   = layout.isSkinny ? skinny : full,
                    el     = src.firstChild;

                while (el) {
                    var next = el.nextSibling;
                    dest.appendChild(el);
                    el = next;
                }
            });

            this._isSkinny = layout.isSkinny;
        }

        if (layout.isSnap !== this._isSnap) {
            _markStart("_onResizeWindow:pickers");

            _markStart("_onResizeWindow:pickers-aria");

            $("#StartTimeCombo select").each(function() {
                this.setAttribute("aria-labelledby", "StartTimeDescrip");
            });

            $("#EndTimeCombo select").each(function() {
                this.setAttribute("aria-labelledby", "EndDateDescrip");
            });

            _markStop("_onResizeWindow:pickers-aria");

            _markStop("_onResizeWindow:pickers");

            if (this._targetEvent && this._targetEvent.calendar.readOnly) {
                $("select", $.id("schedule")).each(changeSelectIntoReadOnlyInput);
                if (layout.isSnap) {
                    $("#EventTitleTextbox").each(setReadOnly);
                } else {
                    $.id("EventTitleTextbox").removeAttribute("readonly");
                }
            }

            // update addresswell width
            _markStart("_onResizeWindow:who.resize");
            this._who.resize();
            _markStop("_onResizeWindow:who.resize");

            this._isSnap = layout.isSnap;
        }

        this._updateCanvasStyles();
        this._updateFreeBusyButton();

        _markStop("_onResizeWindow");
    };

    EventDetails.prototype.cancel = function () {
        /// <summary>Public method to close event details. Prompts the user if there are unsaved changes.</summary>

        // Used by the view manager if it needs to close event details and open something else

        // Record the time, it's used in our workaround to reopen the dialog if it gets closed by resize - in this._onResizeWindow
        this._lastCancelDate = new Date();

        if (this._freeBusyOpen) {
            this._onFreeBusyBack(this._freeBusy.getState());
        }

        this._onCancel({});
    };



    //
    // Private
    //

    EventDetails.prototype._getPlatform = function () {
        if (!this._platform) {
            // get and cache the platform
            var data = {};
            this.fire("getPlatform", data);
            this._platform = data.platform;
        }

        return this._platform;
    };

    EventDetails.prototype._getIdsCalendar = function () {
        if (!this._idsCalendar) {
            this._idsCalendar = Microsoft.WindowsLive.Instrumentation.Ids.Calendar;
        }

        return this._idsCalendar;
    };    

    // Event handlers

    EventDetails.prototype._onCancel = function (ev) {
        this._clickAnchor = ev.currentTarget;

        var isDirty = this._isDirty();

        Debug.only(_info("EventDetails._onCancel: isDirty=" + isDirty));

        // Show confirmation flyout if changes have been made
        if (isDirty) {
            Helpers.hideFocusRectangleOnNextFocusOnly(ev.target);

            if (this._targetEvent && this._targetEvent.calendar.readOnly) {
                Helpers.showFlyout({
                    anchor: this._clickAnchor || $.id("cedCancel"),
                    message: loc.getString("ReadOnlyDialog"),
                    commands: [{
                        label: loc.getString("CloseButton"),
                        onclick: this._animateOut.bind(this, EventDetails.CloseCommands.cancel, this._targetEvent)
                    }]
                });
            } else {
                var title = $.id("EventTitleTextbox").value;
                var message = title.length ?
                    loc.loadCompoundString("EventSaveConfirmationTitled", title) :
                    loc.getString("EventSaveConfirmationUntitled");

                //Helpers.showFlyout(data);
                Helpers.showMenu({
                    anchor: this._clickAnchor || $.id("cedCancel"),
                    message: message,
                    commands: [{
                        label: loc.getString("EventButtonSave"),
                        onclick: this._onSave
                    }, {
                        label: loc.getString("EventButtonDontSave"),
                        onclick: this._animateOut.bind(this, EventDetails.CloseCommands.cancel, this._targetEvent)
                    }]
                });
            }
        } else {
            this._animateOut(EventDetails.CloseCommands.cancel, this._targetEvent);
        }
    };

    EventDetails.prototype._onDelete = function (ev) {
        if (this._targetEventCommitting) {
            return;
        }

        Helpers.hideFocusRectangleOnNextFocusOnly(ev.target);

        Debug.only(_info("EventDetails._onDelete:"));

        var hasAttendees    = this._initEvent.attendeeList.length > 0,
            futureEvent     = !this._isInPast(),
            meetingCanceled = this._targetEvent.meetingStatus & MeetingStatus.isCanceled;

        if (meetingCanceled) {
            return this._deleteEvent();
        }

        var anchor = !getAreaHidden($.id("cedDelete")) ? $.id("cedDelete") : $.id("cedRespond");

        var menuCommands,
            flyoutCommands,
            flyoutMessage;

        if (hasAttendees && futureEvent) {
            // We need to either cancel the meeting or decline the meeting

            if (this._organizer) {
                if (this._canCancelSupport()) {

                    // "Delete dialog" but the button starts the send cancellation flow.
                    // We require the author to send a cancellation because exchange doesn't allow you to just delete the meeting (Windows Blue Bugs 315191).
                    if (this._initEvent.recurring && !this.seriesInstance()) {
                        // Show a specific message when cancelling a whole series
                        flyoutMessage = loc.getString("EventCancelPromptMeeting");
                    } else {
                        flyoutMessage = loc.getString("EventCancelPromptEvent");
                    }

                    flyoutCommands = [{
                        label: loc.getString("EventButtonOK"),
                        onclick: this._cancelEvent.bind(this)
                    }];
                }
            } else if (this._canRespondSupport()) {
                // Prompt to send cancellation to organizer
                menuCommands = [{
                    label: loc.getString("EventButtonSendResponse"),
                    onclick: this._respondEx.bind(this, ResponseType.declined, true /*send*/)
                }, {
                    label: loc.getString("EventButtonDontSendResponse"),
                    onclick: this._deleteEvent.bind(this)
                }];
            }
        } else {
            // Show the delete dialog
            var title = $.id("EventTitleTextbox").value;

            flyoutMessage = title.length ?
                loc.loadCompoundString("EventDeleteConfirmationTitled", title) :
                loc.getString("EventDeleteConfirmationUntitled");

            flyoutCommands = [{
                label: loc.getString("EventButtonDelete"),
                onclick: this._deleteEvent.bind(this)
            }];
        }

        if (menuCommands) {
            Helpers.showMenu({
                message: loc.getString("EventResponseOptions"),
                anchor: anchor,
                commands: menuCommands
            });
        } else {
            Helpers.showFlyout({
                anchor: anchor,
                message: flyoutMessage,
                commands: flyoutCommands
            });
        }
    };

    EventDetails.prototype._showForwardReplyOptions = function () {
        // Determine what to show in the menu and gate keyboard shortcuts
        var isMailEnabled = this._isMailEnabled();

        return {
            respond: this._shouldShowResponseOptions(),
            reply: isMailEnabled,
            forward: !this._organizer &&  // organizers can't forward their own meetings
                      this._canForwardSupport() &&
                      isMailEnabled &&
                     !this._isInPast() &&
                     !this._isCanceled()
        };
    };

    EventDetails.prototype._onRespond = function (ev) {
        Debug.only(_info("EventDetails._onRespond:"));

        this._clickAnchor = ev.currentTarget;
        Helpers.hideFocusRectangleOnNextFocusOnly(ev.target);

        if (this._saveFailedBecauseOfDelete) {
            this._showAlreadyDeletedDialog();
            return;
        }

        var show = this._showForwardReplyOptions(),
            commands = [];

        if (show.respond) {
            commands = [
                {
                    label: loc.getString("EventAccept"),
                    onclick: this._respond.bind(this, ResponseType.accepted)
                },
                {
                    label: loc.getString("EventTentative"),
                    onclick: this._respond.bind(this, ResponseType.tentative)
                },
                {
                    label: loc.getString("EventDecline"),
                    onclick: this._respond.bind(this, ResponseType.declined)
                }
            ];

            if (show.reply || show.forward) {
                commands.push(
                    {
                        type: "separator"
                    });
            }
        }

        if (show.reply) {
            commands.push(
                {
                    label: loc.loadCompoundString("EventReply", Jx.key.getLabel("Ctrl+R")),
                    onclick: this._replyForward.bind(this, Calendar.MailAction.reply)
                },
                {
                    label: loc.loadCompoundString("EventReplyAll", Jx.key.getLabel("Ctrl+Shift+R")),
                    onclick: this._replyForward.bind(this, Calendar.MailAction.replyAll)
                }
            );
        }

        if (show.forward) {
            commands.push(
                {
                    label: loc.loadCompoundString("EventForward", Jx.key.getLabel("Ctrl+F")),
                    onclick: this._replyForward.bind(this, Calendar.MailAction.forward)
                }
            );
        }

        Helpers.showMenu({
            anchor: ev.currentTarget,
            message: loc.loadCompoundString("RespondCommand", Jx.key.getLabel("Ctrl+P")),
            commands: commands
        });
    };

    EventDetails.prototype._shouldShowResponseOptions = function () {
        /// <summary>
        /// Indicates whether the A/T/D response options should be shown for the current meeting within the respond button menu.
        /// This is NOT the same as whether the respond button should be visible.
        /// </summary>

        var isInPast = this._isInPast(),
            isCanceled = this._isCanceled();

        return !this._organizer && this._canRespondSupport() && !isInPast && !isCanceled;
    };

    EventDetails.prototype._onSaveButton = function (ev) {
        this._clickAnchor = ev.currentTarget;
        Helpers.hideFocusRectangleOnNextFocusOnly(ev.target);

        // _isDirty has side effects so check it first, before _forceDirty
        var isDirty = this._isDirty() || this._forceDirty;

        Debug.only(_info("EventDetails._onSaveButton: isDirty=" + isDirty));

        if (isDirty) {
           this._onSave();
        } else {
            this._animateOut(EventDetails.CloseCommands.cancel, this._targetEvent);
        }
    };

    EventDetails.prototype._onSave = function () {
        if (this._targetEventCommitting) {
            return;
        }

        _info("save_start"); // used in perfbench

        if (this._validate()) {
            var changed = this._updateEvent();
            if (this._commitEvent(changed)) {
                // Return to previous view and focus on event
                this._animateOut(EventDetails.CloseCommands.save, this._targetEvent);
            }
        }
    };

    EventDetails.prototype._onSend = function (ev) {
        if (this._targetEventCommitting) {
            return;
        }

        this._clickAnchor = ev.currentTarget;
        Helpers.hideFocusRectangleOnNextFocusOnly(ev.target);

        Debug.only(_info("EventDetails._onSend:"));

        if (this._sendEvent()) {
            // Return to previous view and focus on event
            this._animateOut(EventDetails.CloseCommands.send, this._targetEvent);
        }
    };

    EventDetails.prototype._onFreeBusy = function() {
        // do some initial work if the view hasn't yet been created
        if (!this._freeBusy) {
            // create the view itself
            this._freeBusy = new Calendar.Views.FreeBusy();
            this.appendChild(this._freeBusy);

            // hook its events
            this._freeBusy.addListener("back", this._onFreeBusyBack, this);
        }

        // ensure we have a valid meeting duration
        var duration = this.getDuration();

        if (duration.endDate < duration.startDate) {
            duration.endDate = new Date(duration.startDate.getTime());
        }

        // set our meeting time range and calendar
        this._freeBusy.setRange(duration.startDate, duration.endDate);
        this._freeBusy.setCalendar(this._getSelectedCalendar());

        // build up our list of attendees
        var attendees = this._who.getRecipients();

        /* Remove room finder entry points for M1.

        // if we have a resource, filter it from the attendees
        if (this._resource) {
            attendees = [];
            var isValid = false;

            for (var i = 0, len = recipients.length; i < len; i++) {
                var recipient = recipients[i];

                // we'll compare based on email alone
                if (recipient.emailAddress === this._resource.email) {
                    isValid = true;
                } else {
                    attendees.push(recipient);
                }
            }

            if (!isValid) {
                this._resource = null;
            }
        } else {
            attendees = recipients;
        }

        */

        if (!this._organizer) {
            attendees.push({
                emailAddress: this._targetEvent.organizerEmail,
                calculatedUIName: this._targetEvent.organizerName,
            });
        }

        // set our attendees and resource
        this._freeBusy.setAttendees(attendees);
        /* Remove room finder entry points for M1.
        this._freeBusy.setResource(this._resource);
        */

        // remove our key listener and disable ourself
        $(document).off("keydown", this._onKeyDown);
        var root = $.id("eventDetails");
        root.disabled = true;
        root.setAttribute("aria-hidden", true);

        // the free/busy ui uses the app bar.  let it display.
        this._appBar.disabled = false;

        if (!this._freeBusyHost) {
            // build its ui
            var ui = Jx.getUI(this._freeBusy);

            var container = document.getElementById("cedContainer");
            container.insertAdjacentHTML("beforeend", ui.html);
            this._freeBusyHost = container.lastElementChild;

            // activate its ui
            this._freeBusy.activateUI(this._jobset);
        } else {
            this._freeBusy.resume();

            requestAnimationFrame(function() {
                this._freeBusyHost.removeAttribute("aria-hidden");
                var style = this._freeBusyHost.style;
                style.zIndex  = "";
                style.opacity = "";
            }.bind(this));
        }

        this._freeBusyOpen = true;
    };

    EventDetails.prototype._onFreeBusyBack = function(data) {
        // update our start and end times
        this._updateDuration(data.start, data.end);

        /* Remove room finder entry points for M1.

        // update our resource, if necessary
        var resource = data.resource;

        if (resource) {
            var changed = (!this._resource || this._resource.email !== resource.email);

            if (changed) {
                // remove our old resource
                this._removeResource();

                // add the new one and set our location to match
                var recipient = AddressWell.Recipient.fromEmail(resource.email, resource.name, this._getPlatform());
                // pass false since we don't want to track this as preFilled.
                this._who.addRecipients([recipient], false);

                $.id("LocationTextbox").value = resource.name;

                // save the resource
                this._resource = resource;
            }
        } else {
            this._removeResource();
        }

        */

        // put the free/busy ui behind the normal ui.  setting visiblity="hidden" or
        // display="none" is slow.  this is more efficient.
        this._freeBusyHost.setAttribute("aria-hidden", true);
        var style = this._freeBusyHost.style;
        style.zIndex  = "-1";
        style.opacity = "0";

        // tell it to quit working
        this._freeBusy.pause();

        // enable ourself and re-attach our key listener
        var root = $.id("eventDetails");
        root.setAttribute("aria-hidden", false);
        root.disabled = false;

        $(document).on("keydown", this._onKeyDown);

        // re-disable and hide the app bar.
        this._appBar.hide();
        this._appBar.disabled = true;
        this._peekBar.hide();

        // focus the button we used to open the ui
        var freeBusyButton = $.id("FreeBusyButton");

        if (freeBusyButton.offsetWidth) {
            freeBusyButton.focus();
        }

        this._freeBusyOpen = false;
    };

    EventDetails.prototype._onAccountResourceChanged = function(ev) {
        var properties = ev.detail[0];

        for (var i = 0, len = properties.length; i < len; i++) {
            if (properties[i] === "signatureType") {
                // we're done listening for changes on this resource
                this._unhookAccountResource();

                // we can potentially add a signature now.  let's try.
                this._canAddSignature = true;

                if (this._hasAttendee) {
                    this._addSignatureIfPossible();
                }

                break;
            }
        }
    };

    EventDetails.prototype._onAccountChanged = function (ev) {
        var properties = ev.detail[0];

        for (var i = 0, len = properties.length; i < len; i++) {
            if (properties[i] === "mailScenarioState") {
                // update the button visibility.
                this._updateButtons();
            }
        }
    };

    EventDetails.prototype._removeResource = function() {
        // only do work if we actually have a resource
        if (this._resource) {
            // delete the resource from the address well
            this._who.deleteRecipientByEmail(this._resource.email);

            // clear the where field if it matches
            var where = $.id("LocationTextbox");

            if (where.value === this._resource.name) {
                where.value = "";
            }

            // finally release the resource
            this._resource = null;
        }
    };

    // Form helpers

    EventDetails.prototype._showPlatformError = function (result) {
        Debug.only(_info("EventDetails._ShowError: res=" + result));

        var message,
            data;

        switch (result) {
            case Status.errorExceptionsStartOnSameDay:
                message = loc.getString("EventErrorInstanceExists");
                break;
            case Status.errorExceptionsOverlap:
                message = loc.getString("EventErrorRecurrenceDate");
                break;
            case Status.errorRecurrenceInvalid:
                message = loc.getString("EventErrorRecurrencePattern");
                break;
            case Status.errorEventExceptionDeleteRequired:
                // Confirm exceptions to be deleted
                data = {
                    anchor: this._clickAnchor || $.id("cedCancel"),
                    message: loc.getString(this._isMeeting() ? "EventConfirmExceptions" : "EventConfirmExceptionsNoAttendees"),
                    commands: [{
                        label: loc.getString("EventButtonSave"),
                        onclick: function () {
                            this._targetEvent.deleteExceptions();

                            if (this._sendEvent()) {
                                this._animateOut(EventDetails.CloseCommands.send, this._targetEvent);
                            }
                        }.bind(this)
                    }]
                };
                Debug.assert(data.anchor, "EventDetails._showPlatformError: cedSave not found");
                break;
            default:
                // Notify of unexpected error
                data = {
                    anchor: this._clickAnchor || $.id("cedSave"),
                    message: loc.getString("EventErrorSaveGeneric"),
                    commands: []
                };
                Debug.assert(data.anchor, "EventDetails._showPlatformError: cedSave not found");
                break;
        }

        if (data) {
            // Show popup error message
            Helpers.showFlyout(data);
        } else {
            // Show inline error message
            if (!$.id("showError")) {
                var div = document.createElement("div");
                div.setAttribute("role", "status");
                div.className = "error";
                div.id = "showError";

                var errorNode = $.id("schedule");
                errorNode.insertBefore(div, errorNode.firstChild);
            }

            $.id("showError").innerHTML = message;
        }
    };

    EventDetails.prototype._close = function (targetEvent) {
        Debug.only(_info("EventDetails._close:"));
        if (this._who) {
            this._who.cancelPendingSearches();
        }

        this.fire("finishedEditing", targetEvent);
    };

    EventDetails.prototype._isDirty = function () {
        var attendees = this._parseAttendees();

        if (attendees.added.length || attendees.deleted.length) {
            return true;
        }

        if (this._isCanvasDirty()) {
            return true;
        }

        var subject  = $.id("EventTitleTextbox").value,
            location = $.id("LocationTextbox").value;

        // Quick Event most likely
        if (this.isNewEvent() && (subject !== "" || location !== "")) {
            return true;
        }

        // Determines whether any fields are different from their initial values
        if (subject !== this._initEvent.subject ||
            location !== this._initEvent.location ||
            getSelectValue($.id("ReminderCombo")) !== this._initEvent.reminder ||
            getSelectValue($.id("StatusCombo")) !== this._initEvent.busyStatus) {
            return true;
        }

        // Get the start and end dates, adjusting end date if event is all day
        //   allow for less than 5 minute difference (300000)
        var duration = this.getDuration();

        if (duration.isAllDay && !this._initEvent.allDayEvent ||
            (Math.abs(this._initEvent.startDate - duration.startDate) >= 300000) ||
            (Math.abs(this._initEvent.endDate - duration.endDate) >= 300000)) {
            return true;
        }

        // If private checkbox checked and sensitivity is normal, or the inverse
        if ($.id("PrivateCheckbox").checked ^ this._initEvent.sensitivity !== Sensitivity.normal) {
            return true;
        }

        // has the recurrence drop down changed?
        if (this._initEvent.recurrenceIndex !== getSelectIndex($.id("RecurrenceCombo"))) {
            return true;
        // has the recurrence end date changed?
        } else if (this._endOccurrence.isDirty()) {
            return true;
        }

        return false;
    };

    // UI helpers

    EventDetails.prototype._updateAppBar = function () {
        _markStart("_updateAppBar");

        Debug.only(_info("EventDetails._updateAppBar:"));

        var eventData = {};
        this.fire("getAppBar", eventData);
        this._appBar = eventData.appBar;
        this._peekBar = eventData.peekBar;

        if (this._appBar) {
            this._appBar.hide();
            this._appBar.disabled = true;
        }
        if (this._peekBar) {
            this._peekBar.hide();
        }

        _markStop("_updateAppBar");
    };

    EventDetails.prototype._shouldShowSendButton = function() {
        return this._organizer && this._isMeeting();
    };

    EventDetails.prototype._shouldShowRespondButton = function () {
        // respond includes accept/tentative/decline as well as reply/replyAll/forward
        return !this.isNewEvent() && this._startedAsMeeting && this._isMeeting() && (this._shouldShowResponseOptions() || this._isMailEnabled());
    };

    EventDetails.prototype._isMeeting = function () {
        /// <summary>Whether this is a meeting - based on attendees in the who field or were in the who field</summary>
        // Also checks whether we're the organizer, which is based on meetingStatus.
        // If we get conflicting information such as meetingStatus indicating that we received the meeting, but no attendee info - the meetingStatus wins.
        return (!this._organizer || this._whoElement.value !== "" || this._hasAttendee || this._initEvent.attendeeList.length);
    };

    EventDetails.prototype._isMailEnabled = function () {
        /// <summary>Whether mail is being synced.</summary>
        return this._selectedAccount.mailScenarioState === MWP.ScenarioState.connected;
    };

    EventDetails.prototype._isCanceled = function () {
        /// <summary>Whether the meeting has been canceled.</summary>
        var meetingStatus = this._targetEvent && this._targetEvent.meetingStatus;
        return meetingStatus & MeetingStatus.isCanceled;
    };

    EventDetails.prototype._isInPast = function () {
        /// <summary>Whether the end of the meeting is in the past. Works for instances and recurrences.</summary>

        // This function is intended to be used to update button state and behavior, and does its calculations based on _initEvent rather than what's in the UI

        var recurrence,
            isInPast = false;

        if (!this.isNewEvent()) {

            if (this._initEvent.recurring && this._eventType === EventDetails.eventType.Series) {
                recurrence = this._initEvent.recurrence;
                // Check to see if the end of the recurrence is in the past, if the recurrence end is set
                if (+recurrence.until < Date.now() && +recurrence.until !== EventDetails.InfiniteDate) {
                    isInPast = true;
                }
            } else {
                // Determine whether the end date is before now
                isInPast = +this._initEvent.endDate < Date.now();
            }
        }

        return isInPast;
    };

    EventDetails.prototype._updateButtons = function () {
        _markStart("_updateButtons");

        var cedSend = $.id("cedSend"),
            isSendVisible = !getAreaHidden(cedSend),
            showSend = this._shouldShowSendButton(),

            cedSave = $.id("cedSave"),
            isSaveVisible = !getAreaHidden(cedSave),
            isNewMeeting = !this._targetEvent,
            isReadOnly = !isNewMeeting && this._targetEvent.calendar.readOnly,
            showSave = !showSend && (isNewMeeting || !isReadOnly),

            cedRespond = $.id("cedRespond"),
            isRespondVisible = !getAreaHidden(cedRespond),
            showRespond = this._shouldShowRespondButton(),

            cedDelete = $.id("cedDelete"),
            isDeleteVisible = !getAreaHidden(cedDelete),
            showDelete = !isNewMeeting && !isReadOnly && (this._organizer || !this._shouldShowResponseOptions()); // Show delete if you're the organizer or if the decline option won't be present in respond

        Debug.only(_info("EventDetails._updateButtons:"));

        if (showDelete !== isDeleteVisible) {
            setAreaHidden(cedDelete, !showDelete);
            if (showDelete) {
                $(cedDelete).on("click", this._onDelete);
            } else {
                $(cedDelete).off("click", this._onDelete);
            }
        }

        if (showSend !== isSendVisible) {
            setAreaHidden(cedSend, !showSend);
            if (showSend) {
                $(cedSend).on("click", this._onSend);
            } else {
                $(cedSend).off("click", this._onSend);
            }
        }

        if (showRespond !== isRespondVisible) {
            setAreaHidden(cedRespond, !showRespond);
            if (showRespond) {
                WinJS.UI.Animation.fadeIn(cedRespond);
                $(cedRespond).on("click", this._onRespond);
            } else {
                WinJS.UI.Animation.fadeOut(cedRespond);
                $(cedRespond).off("click", this._onRespond);
            }
        }

        if (showSave !== isSaveVisible) {
            setAreaHidden(cedSave, !showSave);
            if (showSave) {
                $(cedSave).on("click", this._onSaveButton);
            } else {
                $(cedSave).off("click", this._onSaveButton);
            }
        }

        _markStop("_updateButtons");
    };


    EventDetails.prototype._showErrorMessage = function (error) {
        var div = $.id(error.id);

        if (!div) {
            div = document.createElement("div");

            div.setAttribute("role", "status");
            div.id = error.id;
            div.className = "error";

            error.before.parentNode.insertBefore(div, error.before);
        }

        // This is always done so narrator always reads out the status.
        div.innerText = error.text;
    };

    EventDetails.prototype._hideErrorMessage = function (id) {
        var elem = $.id(id);
        if (elem) {
            elem.parentNode.removeChild(elem);
        }
    };

    EventDetails.prototype._validate = function () {
        var duration = this.getDuration(),
            error;

        // Validate duration and overwrite platform error id #showError so only one error is shown.
        if (duration.endDate < duration.startDate) {
            error = {
                id:     "showError",
                text:   loc.getString("EventErrorEndDate"),
                before: $.id("schedule").firstChild
            };

            this._showErrorMessage(error);
        } else {
            this._hideErrorMessage("showError");
        }

        if ((this._whoElement.value !== "" || this._hasAttendee) && this._who.getError() !== null) {
            error = {
                id:     "addressWellError",
                text:   this._who.getError(),
                before: $.id("GuestsDescrip")
            };

            this._showErrorMessage(error);
        } else {
            this._hideErrorMessage("addressWellError");
        }

        if (getSelectIndex($.id("RecurrenceCombo")) !== 0 && duration.startDate > this._endOccurrence.date() && +this._endOccurrence.date() !== EventDetails.InfiniteDate) {
            // expand showMore so user can see error.
            this._onShowMore(false);

            error = {
                id:     "endOccurrenceError",
                text:   loc.getString("OccurrenceEndDateBeforeStartDateError"),
                before: $.id("EndOccurrence")
            };

            this._showErrorMessage(error);
        } else {
            this._hideErrorMessage("endOccurrenceError");
        }

        return !error;
    };

    // Event handlers

    EventDetails.prototype._onDurationChanged = function (ev) {
        if (ev.target.selectedIndex === EventDetails.durationAllDay) {
            $.id("AlldayCheckbox").checked = true;
            this._toggleAllDay(true);
        } else if (ev.target.selectedIndex === EventDetails.durationCustom) {
            var start = this._getDateFromControls(this._controls.startDate, this._controls.startTime);
            // Set end date to start date plus one hour
            var end = new Date(start.getTime() + ($.id("AlldayCheckbox").checked ? 0 : Helpers.hourInMilliseconds));

            // Don't set end date past available range
            if (end > Calendar.LAST_DAY) {
                end = start;
            }

            // if the endDate control is mocked then unmock it i.e. replace it with DatePicker control.
            if (this._controls.endTime.unmock) {
                this._controls.endTime.unmock();
            }

            this._setEndDate(end);
            this._controls.endTime.current = end;

            this._showCustomDuration(true);
            $.id("EndDateCombo").focus();
        } else {
            this._previousEventDuration = $.id("EventDuration").value;
            $.id("AlldayCheckbox").checked = false;
            this._toggleAllDay(false);
        }
    };

    EventDetails.prototype._onAllDayChanged = function (ev) {
        this._toggleAllDay(ev.target.checked);
    };

    EventDetails.prototype._onGuestsChanged = function () {
        this._hasAttendee = (this._who.getRecipients().length !== 0);
        this._parseAttendeesCache = null;
        this._updateButtons();
        // Bug 115278: Remove signature entry points for M1.
        // this._addSignatureIfPossible();
    };

    // Control helpers

    EventDetails.prototype.getDuration = function () {
        var startDate, endDate;
        var isAllDay = this._controls.startTime.disabled;

        startDate = this._getDateFromControls(this._controls.startDate,
                                              this._controls.startTime);
        // Check for custom end date
        if (this._isCustomDuration) {
            endDate = this._getDateFromControls(this._controls.endDate,
                                                this._controls.endTime);
            if (isAllDay && startDate <= endDate)  {
                // Set end date to the day after the specified end date
                endDate.setDate(endDate.getDate() + 1);
            }
        } else {
            // Calculate end date based on duration
            var duration = $.id("EventDuration");
            if (duration.selectedIndex === EventDetails.durationAllDay || isAllDay) {
                isAllDay = true;
                endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
            } else {
                // Add duration minutes to start date
                endDate = new Date(startDate.getTime() + this._previousEventDuration * Helpers.minuteInMilliseconds);
            }
        }
        return { startDate: startDate, endDate: endDate, isAllDay: isAllDay };
    };

    EventDetails.prototype.getStartTime = function () {
        return this._controls.startTime.current;
    };

    EventDetails.prototype._updateStartDate = function (startDate) {
        this._controls.startDate = startDate;
        // getDuration calculates the endDate based on the startDate which was just set
        var duration = this.getDuration();

        if (this._targetEvent) {
            this._targetEvent.startDate = duration.startDate;
            this._targetEvent.endDate = duration.endDate;
        } else {
            this._initEvent.startDate = duration.startDate;
            this._initEvent.endDate = duration.endDate;
        }
    };

    // When you change the recurrenceType the platform zeros out recurrence fields so set the recurrenceType first.
    EventDetails.prototype.setRecurrence = function (recurrence) {
        var startDate       = this._controls.startDate,
            recurrenceIndex = getSelectIndex($.id("RecurrenceCombo"));

        switch (recurrenceIndex) {
            case EventDetails.recurrences.None:
                break;
            case EventDetails.recurrences.Daily:
                recurrence.recurrenceType = RecurrenceType.daily;
                break;
            case EventDetails.recurrences.Weekdays:
                recurrence.recurrenceType = RecurrenceType.weekly;
                recurrence.dayOfWeek      = EventDetails.weekDays;

                // move the startDate off of weekends
                while (startDate.getDay() === 6 || startDate.getDay() === 0) {
                    startDate.setDate(startDate.getDate() + 1);
                }

                this._updateStartDate(startDate);
                break;
            case EventDetails.recurrences.MWF:
                recurrence.recurrenceType = RecurrenceType.weekly;
                recurrence.dayOfWeek      = EventDetails.mwfDays;

                while (startDate.getDay() !== 1 && startDate.getDay() !== 3 && startDate.getDay() !== 5) {
                    startDate.setDate(startDate.getDate() + 1);
                }

                this._updateStartDate(startDate);
                break;
            case EventDetails.recurrences.TTH:
                recurrence.recurrenceType = RecurrenceType.weekly;
                recurrence.dayOfWeek      = EventDetails.tthDays;

                while (startDate.getDay() !== 2 && startDate.getDay() !== 4) {
                    startDate.setDate(startDate.getDate() + 1);
                }

                this._updateStartDate(startDate);
                break;
            case EventDetails.recurrences.Weekly:
                recurrence.recurrenceType = RecurrenceType.weekly;
                // To select the nth day, set the nth bit (from the right)
                recurrence.dayOfWeek      = Math.pow(2, startDate.getDay());
                break;
            case EventDetails.recurrences.Monthly:
                recurrence.recurrenceType = RecurrenceType.monthly;
                recurrence.dayOfMonth     = startDate.getDate();
                break;
            case EventDetails.recurrences.Yearly:
                recurrence.recurrenceType = RecurrenceType.yearly;
                recurrence.monthOfYear    = startDate.getMonth() + 1;
                recurrence.dayOfMonth     = startDate.getDate();
                break;
        }

        if (recurrenceIndex !== EventDetails.recurrences.None) {
            if (this._eventType === EventDetails.eventType.Event || this.isNewEvent()) {
                recurrence.interval = 1;
            }
        }

        if (recurrence.occurrences !== 0) {
            recurrence.occurrences = 0;
        }
    };

    // round a dates minutes e.g. interval = 15 round to 0, 15, 30, 45
    function roundDateMinutes(date, interval) {
        var minutes = date.getMinutes();
        minutes = Math.round(minutes / interval) * interval;

        return new Date(date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        date.getHours(),
                        minutes);
    }

    // unmockControl creates the real control, sets its properties and returns it
    function unmockControl(controlName, unmock) {
        var mock    = this[controlName],
            control = this[controlName] = unmock();

        /// <disable>JS2078.DoNotDeleteObjectProperties</disable>
        delete mock.unmock;
        /// <enable>JS2078.DoNotDeleteObjectProperties</enable>

        // copy properties from mock to control
        for (var key in mock) {
            if (mock.hasOwnProperty(key)) {
                control[key] = mock[key];
            }
        }

        return control;
    }

    // Mock a generic WinJS.UI.Control
    //  This mock allows you to write and read properties without initializing the control.
    //
    //  - controlName should be the property name that will hold the mock
    //  - unmock is a callback that should return a control, that will be assigned to the property controlName and replace the mock
    function mockControl(target, controlName, unmock) {
        target[controlName] = {
            unmock: unmockControl.bind(target, controlName, unmock)
        };
    }

    EventDetails.prototype._setupDuration = function (startDate, endDate, isAllDay) {
        _markStart("_setupDuration");

        var isCustom = false;

        // Copy the Date objects
        startDate = new Date(startDate.getTime());
        endDate   = new Date(endDate.getTime());

        if (!isAllDay) {
            // Calculate minutes between start and end
            var minutes = Math.floor((endDate - startDate) / Helpers.minuteInMilliseconds);
            isCustom = _isCustomDuration(minutes);

            if (!isCustom) {
                $.id("EventDuration").value = minutes.toString();
                this._previousEventDuration = minutes.toString();
            }
        } else {
            // Make sure the event spans one day
            if (endDate - startDate <= Helpers.dayInMilliseconds) {
                $.id("EventDuration").selectedIndex = EventDetails.durationAllDay;
            } else {
                // Custom all day duration
                isCustom = true;

                // End date is 12AM after last day, but should appear as last day
                endDate.setDate(endDate.getDate() - 1);
            }
        }

        if (!isCustom) {
            // Let custom end date default to an hour after start date
            endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
        }

        // time is selected in 5 minute intervals
        var roundStart = roundDateMinutes(startDate, 5),
            roundEnd = roundDateMinutes(endDate, 5);

        // Don't assume date controls won't affect time values or vice versa
        this._controls = {
            startTime: new WinJS.UI.TimePicker($.id("StartTimeCombo"), {
                current: roundStart,
                minuteIncrement: 5
            })
        };

        mockControl(this._controls, "endTime", function() {
            setImmediate(function () {
                $("#EndTimeCombo select").each(function() {
                    this.setAttribute("aria-labelledby", "EndDateDescrip");
                });
            });

            return new WinJS.UI.TimePicker($.id("EndTimeCombo"), {
                current: roundEnd,
                minuteIncrement: 5
            });
        });

        this._setStartDate(startDate);
        this._setEndDate(endDate);

        this._controls.endTime.current = roundEnd;

        if (isAllDay) {
            this._controls.startTime.disabled = true;
            this._controls.endTime.disabled = true;

            $.id("AlldayCheckbox").checked = true;
        }

        if (isCustom) {
            this._controls.endTime.unmock();
        }

        // Disable the time selectors for series if you are an attendee.
        if (this._eventType !== EventDetails.eventType.Event && !this._organizer) {
            setReadOnly($.id("StartDateCombo"));
            $("select", $.id("StartTimeCombo")).each(changeSelectIntoReadOnlyInput);

            if (isCustom) {
                setReadOnly($.id("EndDateCombo"));
                $("select", $.id("EndTimeCombo")).each(changeSelectIntoReadOnlyInput);
            } else {
                $("select#EventDuration").each(changeSelectIntoReadOnlyInput);
            }

            setReadOnly($.id("AlldayCheckbox"));
            $.id("AlldayCheckbox").disabled = true;
            // TODO why does this exist?
            this._readOnlyEndDate = true;
        }

        this._showCustomDuration(isCustom);

        _markStop("_setupDuration");

        return isCustom;
    };

    EventDetails.prototype._updateDuration = function(start, end) {
        // Given a new start and end date, this function properly updates the UI
        // controls, taking their current state (custom or not) into account.

        _markStart("_updateDuration");

        // toggle our all day state off if we need to
        var allDay   = $.id("AlldayCheckbox"),
            isAllDay = allDay.checked;

        if (isAllDay) {
            if (start.getHours() || start.getMinutes() || end.getHours() || end.getMinutes()) {
                isAllDay       = false;
                allDay.checked = false;

                this._toggleAllDay(false);
            } else {
                end.setDate(end.getDate() - 1);
            }
        }

        if (!this._isCustomDuration) {
            if (isAllDay) {
                if (start.getTime() < end.getTime()) {
                    this._controls.endTime.unmock();
                    this._showCustomDuration(true);
                }
            } else {
                var minutes = Math.floor((end - start) / Helpers.minuteInMilliseconds);

                if (_isCustomDuration(minutes)) {
                    this._controls.endTime.unmock();
                    this._showCustomDuration(true);
                } else {
                    $.id("EventDuration").value = minutes.toString();
                    this._previousEventDuration = minutes;
                }
            }
        }

        // set our times
        this._setStartDate(start);
        this._controls.startTime.current = start;

        this._setEndDate(end);
        this._controls.endTime.current = end;
    };

    EventDetails.prototype._setupStatus = function (busyStatus) {
        Debug.only(_markStart("_setupStatus"));

        var statusOptions = $.id("StatusCombo").options,
            statusValues  = [BusyStatus.free, BusyStatus.busy, BusyStatus.tentative, BusyStatus.outOfOffice];

        // Select proper status
        for (var i = 0, statusLength = statusValues.length; i < statusLength; i++) {
            statusOptions[i].value = statusValues[i];

            if (statusValues[i] === busyStatus) {
                statusOptions[i].selected = true;
            }
        }

        Debug.only(_markStop("_setupStatus"));
    };

    EventDetails.prototype._setupRecurrence = function (recurrence) {
        _markStart("_setupRecurrence");

        var recurrenceIndex;
        if (recurrence.interval === 1) {
            switch (recurrence.recurrenceType) {
            case RecurrenceType.daily:
                // fallthrough to weekly
            case RecurrenceType.weekly:
                if (recurrence.dayOfWeek === 0 || recurrence.dayOfWeek === EventDetails.allDays) {
                    recurrenceIndex = EventDetails.recurrences.Daily;
                } else if (recurrence.dayOfWeek === EventDetails.mwfDays) {
                    recurrenceIndex = EventDetails.recurrences.MWF;
                } else if (recurrence.dayOfWeek === EventDetails.tthDays) {
                    recurrenceIndex = EventDetails.recurrences.TTH;
                } else if (recurrence.dayOfWeek === EventDetails.weekDays) {
                    recurrenceIndex = EventDetails.recurrences.Weekdays;
                } else if (!(recurrence.dayOfWeek & recurrence.dayOfWeek - 1)) {
                    // Exactly one day set
                    recurrenceIndex = EventDetails.recurrences.Weekly;
                }
                break;
            case RecurrenceType.monthly:
                recurrenceIndex = EventDetails.recurrences.Monthly;
                break;
            case RecurrenceType.yearly:
                recurrenceIndex = EventDetails.recurrences.Yearly;
                break;
            }
        }

        if (recurrenceIndex && !recurrence.occurrences) {
            $.id("RecurrenceCombo").selectedIndex = recurrenceIndex;
            this._initEvent.recurrenceIndex = recurrenceIndex;
        } else {
            // Create custom option for unhandled recurrence
            this._addOption($.id("RecurrenceCombo"), loc.getString("EventRecurrenceCustom"), "", true);
            this._initEvent.recurrenceIndex = $("#RecurrenceCombo option").length - 1;
        }

        _markStop("_setupRecurrence");
    };

    EventDetails.prototype._setupCalendarCombo = function () {
        _markStart("_setupCalendarCombo");

        this._calendars = [];
        var lastCalendarId = null;

        // For existing events only insert the calendar they belong to and select it.
        if (!this.isNewEvent()) {
            this._calendars.push(CalendarSelector.createCalendarOption(this._targetEvent.calendar, false));
        } else {
            // For new events...
            lastCalendarId = this._lastSelectedCalendarId || this._settings.get("lastCalendarId");
            var platform = this._getPlatform();
            this._calendars = CalendarSelector.getCalendarsForSelector(platform);
        }

        this._calendarSelector.on("calendarSelected", this._onCalendarSelected);
        this._calendarSelector.setCalendars(this._calendars);
        this._calendarSelector.updateSelectionById(lastCalendarId);

        _markStop("_setupCalendarCombo");
    };

    EventDetails.prototype._onCalendarSelected = function (ev) {
        Debug.only(_info("EventDetails._onCalendarSelected:"));

        this._selectedCalendarIndex = ev.data.index;
        var calendar = this._calendars[this._selectedCalendarIndex],
            account  = calendar.calendar.account;
        this._updateColors(calendar.colorRaw);

        var showWho = (MWP.ScenarioState.connected === account.mailScenarioState);
        setAreaHidden($.id("GuestsDescrip"), !showWho);
        setAreaHidden($.id("GuestsCombo"), !showWho);
        if (showWho) {
            this._who.setContextualAccount(account);
        }

        this._capabilities = calendar.calendar.capabilities;

        this._updateFreeBusyButton();

        if (account !== this._selectedAccount) {
            this._unhookAccount();
            this._selectedAccount = account;
            this._hookAccount(account);
            // Bug 115278: Remove signature entry points for M1.
            // this._updateSignatureForAccount();
        }

        this._updateWhoAriaFlow();
    };

    EventDetails.prototype._updateWhoAriaFlow = function () {
        if (getAreaHidden($.id("FreeBusy"))) {
            if (getAreaHidden($.id("ShowMore"))) {
                this._who.setAriaFlow("GuestDescrip" /*flowFrom*/, "ShowMoreButton" /*flowTo*/);
            } else {
                this._who.setAriaFlow("GuestDescrip" /*flowFrom*/, "RecurrenceDescrip" /*flowTo*/);
            }
        } else {
            this._who.setAriaFlow("GuestDescrip" /*flowFrom*/, "FreeBusyButton" /*flowTo*/);
        }
    };

    EventDetails.prototype._updateFreeBusyButton = function () {
        var showFreeBusy = this._requestFreeBusySupport() && !this.isReadOnly() && this._organizer && this._outerWidth > 499;
        setAreaHidden($.id("FreeBusy"), !showFreeBusy);
    };

    EventDetails.prototype._fadeOutColor = function (color, alpha) {
        var r = color >> 16 & 255,
            g = color >> 8 & 255,
            b = color & 255;
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    };

    EventDetails.prototype._updateColors = function (color) {
        _markStart("_updateColors");
        Debug.only(_info("EventDetails._updateColors:"));

        var hexColor          = Helpers.processEventColor(color),
            secondaryColor    = this._platform.calendarManager.colorTable.computeLinkValue(color);

        AddressWell.updateColor(color);
        $.id("ShowMoreButton").style.color = secondaryColor;
        $.id("ToggleResponsesButton").style.color = secondaryColor;

        var head = document.getElementsByTagName("head")[0];
        if (this._buttonStyle) {
            head.removeChild(this._buttonStyle);
            this._buttonStyle = null;
        }

        var hoverColor = this._fadeOutColor(color, 0.13);
        var style = document.createElement("style"),
            rules = "#eventDetails button:hover:active .win-commandimage,        " +
                    "#eventDetails button:-ms-keyboard-active .win-commandimage, " +
                    "#eventDetails input:hover:active::-ms-check,                " +
                    "#eventDetails input:-ms-keyboard-active::-ms-check {        " +
                    "    color: rgba(255, 255, 255, 1.0);                        " +
                    "}                                                           " +
                    "#eventDetails input::-ms-check,                             " +
                    "#eventDetails .win-commandimage,                            " +
                    "#eventDetails #cedTitle {                                   " +
                    "    color: " + hexColor + ";                                " +
                    "}                                                           " +
                    "#eventDetails .win-commandring,                             " +
                    "#eventDetails input:active::-ms-check,                      " +
                    "#eventDetails input:focus::-ms-check,                       " +
                    "#eventDetails input[type=text]:active,                      " +
                    "#eventDetails input[type=text]:focus,                       " +
                    "#eventDetails select:focus,                                 " +
                    "#eventDetails select:active {                               " +
                    "    border-color: " + hexColor + ";                         " +
                    "}                                                           " +
                    "#eventDetails input[readonly],                              " +
                    "#eventDetails input:disabled::-ms-check,                    " +
                    "#eventDetails select:disabled {                             " +
                    "    border-color: rgba(0, 0, 0, 0.15);                      " +
                    "}                                                           " +
                    "#eventDetails > #cedNotes {                                 " +
                    "    border-top-color: " + hexColor + ";                     " +
                    "}                                                           " +
                    "#eventDetails button:hover .win-commandring {               " +
                    "    background-color: " + hoverColor + ";                   " +
                    "}                                                           " +
                    "#eventDetails button:hover:active .win-commandring,         " +
                    "#eventDetails button:-ms-keyboard-active .win-commandring,  " +
                    "#eventDetails input:hover:active::-ms-check,                " +
                    "#eventDetails input:-ms-keyboard-active::-ms-check,         " +
                    "#eventDetails option:checked,                               " +
                    "#eventDetails ::selection,                                  " +
                    "#eventDetails select:focus::-ms-value {                     " +
                    "    background-color: " + hexColor + ";                     " +
                    "}                                                           " +
                    ".messageBar .messagebar-status {                            " +
                    "    top: 5px;                                               " +
                    "}                                                           ",
            text  = document.createTextNode(rules);

        style.appendChild(text);
        head.appendChild(style);
        this._buttonStyle = style;

        _markStop("_updateColors");
    };

    EventDetails.prototype._setupAttendees = function () {
        Debug.only(_markStart("_setupAttendees"));

        var attendeeList = this._initEvent.attendeeList,
            numAttendees = attendeeList.length,
            recipients   = [],
            platform     = this._getPlatform();

        if (numAttendees) {
            for (var i = 0; i < numAttendees; i++) {
                var attendee = attendeeList[i];
                recipients.push(AddressWell.Recipient.fromEmail(attendee.email, attendee.name, platform));
            }

            this._who.addRecipients(recipients, true);
            this._hasAttendee = true;
        }

        Debug.only(_markStop("_setupAttendees"));
    };

    EventDetails.prototype._showCustomDuration = function (isCustom) {
        this._isCustomDuration = isCustom;

        if (isCustom) {
            // remove duration dropdown and title
            $('#EventDurationDescrip, #EventDuration').remove();
        }

        // Show custom duration options
        $('.durationCustom').each(function() {
            setAreaHidden(this, !isCustom);
        });

        // Adjust the canvas minHeight
        this._resizeCanvas();
    };

    EventDetails.prototype._toggleAllDay = function (allDay) {
        // Disable/enable time fields
        this._controls.startTime.disabled = allDay;
        this._controls.endTime.disabled = allDay;

        if (allDay) {
            // Save values of fields we're updating
            this._prevValues = {};
            this._prevValues.reminder = $.id("ReminderCombo").selectedIndex;
            this._prevValues.status = $.id("StatusCombo").selectedIndex;
            this._prevValues.startTime = this._controls.startTime.current;
            this._prevValues.endTime = this._controls.endTime.current;

            // Update reminder and status fields
            $.id("ReminderCombo").selectedIndex = EventDetails.reminder18;

            // only set the status to free if it's currently set to the default
            // status (busy).
            if (this._prevValues.status === EventDetails.statusBusy) {
                $.id("StatusCombo").selectedIndex = EventDetails.statusFree;
            }

            // Temporarily reset time fields
            this._controls.startTime.current = "12:00 AM";
            this._controls.endTime.current = "12:00 AM";
        } else if (this._prevValues) {
            // Restore saved values
            if ($.id("ReminderCombo").selectedIndex === EventDetails.reminder18) {
                $.id("ReminderCombo").selectedIndex = this._prevValues.reminder;
            }
            if ($.id("StatusCombo").selectedIndex === EventDetails.statusFree) {
                $.id("StatusCombo").selectedIndex = this._prevValues.status;
            }
            this._controls.startTime.current = this._prevValues.startTime;
            this._controls.endTime.current = this._prevValues.endTime;

            // Clear previous values so we don't overwrite next time
            this._prevValues = null;
        }
    };

    EventDetails.prototype._resizeCanvas = function () {
        // Calculate min height for canvas based on controls it aligns with
        var numControls = 5;  // Basic controls
        if (this._isCustomDuration) {
            numControls += 1; // End date and time
        }
        if (this._calendarSelector.hasDropdown()) {
            numControls--;    //  Account for control on right side
        }

        // Update the canvas minHeight (minus 8px padding, 2px border = 20)
        this._canvas.style.minHeight =
            (numControls * 32 + (numControls - 1) * 27 - 20) + "px";
    };

    function getDateFromDateTime (date, time) {
        var newDate = new Date(date);

        newDate.setHours(time.getHours());
        newDate.setMinutes(time.getMinutes());

        return newDate;
    }

    EventDetails.prototype._getDateFromControls = function (date, timeControl) {
        return getDateFromDateTime(date, timeControl.current);
    };

    EventDetails.prototype._addOption = function (select, text, value, selected) {
        var opt = document.createElement("option");
        opt.text = text;
        opt.value = value;
        opt.selected = selected;
        select.appendChild(opt);
        return opt;
    };

    EventDetails.prototype._addSignatureIfPossible = function() {
        if (this._canAddSignature && !this._addedSignature) {
            var calendar         = this._getSelectedCalendar(),
                account          = calendar.account,
                calendarResource = account.getResourceByType(MWP.ResourceType.calendar);

            // check to see if the signature is enabled for this account
            if (calendarResource.signatureType === MWP.SignatureType.enabled) {
                var mailResource = account.getResourceByType(MWP.ResourceType.mail);

                if (mailResource) {
                    if (mailResource.signatureType === MWP.SignatureType.enabled) {
                        var outer  = document.createElement("div"),
                            inner  = document.createElement("div"),
                            signature = mailResource.signatureText,
                            showCueText = false;

                        // put the signature in via innerText to handle new lines (only works if it happens before inner is appended to outer)
                        inner.innerText = signature;

                        // we wrap the entire html in a div so we can access it if we need to
                        outer.setAttribute("class", "wl-calendar-signature");
                        // we actually need to wrap the html in some other divs for spacing
                        outer.appendChild(document.createElement("br"));
                        outer.appendChild(inner);
                        outer.appendChild(document.createElement("br"));

                        // if we don't have content yet, add another blank line
                        if (!this._canvasControl.getCharacterCount()) {
                            outer.insertBefore(document.createElement("br"), outer.firstChild);
                            showCueText = true;
                        }

                        // add the signature, and make sure we don't do it again
                        this._dirtyTracker.pause();
                        // documentFragment is preferable to html string because less pre-processing is required
                        this._canvasControl.addContent(outer, ModernCanvas.ContentFormat.documentFragment, ModernCanvas.ContentLocation.end);
                        this._addedSignature = true;
                        this._dirtyTracker.resume();

                        // if we need to, show the cue text again
                        if (showCueText) {
                            this._canvasControl.showCueText();
                        }
                    } else {
                        // the signature is not enabled, but that could change
                        this._hookAccountResource(mailResource);
                    }
                }
            } else {
                // the signature is not enabled, but that could change
                this._hookAccountResource(calendarResource);
            }

            // we don't want to do these checks again
            this._canAddSignature = false;
        }
    };

    EventDetails.prototype._removeOldSignature = function() {
        var canvas    = this._canvasControl.getCanvasElement(),
            signature = canvas.querySelector(".wl-calendar-signature");

        if (signature) {
            signature.outerHTML = "";
        }

        this._addedSignature = false;
    };

    EventDetails.prototype._updateSignatureForAccount = function() {
        this._canAddSignature = this.isNewEvent();
        this._unhookAccountResource();

        if (this._addedSignature) {
            this._removeOldSignature();
        }

        if (this._hasAttendee) {
            this._addSignatureIfPossible();
        }
    };

    EventDetails.prototype._isCalendarAccountEmail = function (email) {
        if (!this._calendarAccountEmails) {
            var emailAddresses    = [];
            // existing event vs new event
            var currentAccount    = (this._targetEvent ? this._targetEvent.calendar.account : this._selectedAccount);
            var allEmailAddresses = currentAccount.allEmailAddresses;

            for (var i = 0, len = allEmailAddresses.size; i < len; ++i) {
                emailAddresses[i] = allEmailAddresses[i].toUpperCase();
            }

            this._calendarAccountEmails = emailAddresses;
        }

        return this._calendarAccountEmails.indexOf(email.toUpperCase()) !== -1;
    };

    EventDetails.prototype._sendEvent = function () {
        if (!this._validate()) {
            return false;
        }

        // updateEvent creates a targetEvent if none exist.
        var changed = this._updateEvent();
        var account   = this._getAccount(this._targetEvent);
        var platform  = this._getPlatform();
        var attendees = this._parseAttendees();
        var formatEmailAddress = Helpers.formatEmailAddress;

        var mailCancel, i;

        Debug.assert(this._organizer, "Should not be sending event updates as non-organizer");

        if (this._canCancelSupport()) {
            // Generate cancellation
            var numDeleted = attendees.deleted.length;
            if (numDeleted) {                
                var mailCancelTo = "";

                for (i = 0; i < numDeleted; i++) {
                    var deletedAttendee = attendees.deleted[i];
                    mailCancelTo += formatEmailAddress(deletedAttendee.name, deletedAttendee.email) + "; ";
                }

                Debug.assert(this._targetEvent.isOrganizer, "Invalid organizer status for cancel - should not be able to send cancellation as attendee");

                // save meetingStatus
                var meetingStatus = this._targetEvent.meetingStatus;
                // Set meetingStatus to canceled in order to generate a cancellation
                this._targetEvent.meetingStatus = MeetingStatus.isAMeeting | MeetingStatus.isCanceled;

                mailCancel         = platform.invitesManager.mailFromEvent(this._targetEvent, account, attendees.deleted);
                mailCancel.to      = mailCancelTo;
                mailCancel.subject = loc.getString("EventCancelledPrefix") + this._initEvent.subject;

                // restore meetingStatus
                this._targetEvent.meetingStatus = meetingStatus;
            }
        }

        // Now commit the event
        if (!this._commitEvent(changed)) {
            return false;
        }

        // The commit was successful, so send cancellations
        if (mailCancel && this._canCancelSupport()) {
            this._sendMail(mailCancel);
        }

        this._targetEvent = platform.calendarManager.getEventFromHandle(this._targetEvent.handle);

        // getEventFromHandle may also return null if the event doesn't exist
        if (this._targetEvent === null) {
            this._saveFailedBecauseOfDelete = true;
            this._showAlreadyDeletedDialog();
            return false;
        }

        // Send invitations
        var mailTo = "";

        if (changed || attendees.added.length > 0) {
            // Send update to all attendees
            var curAttendees = this._targetEvent.getAttendees();
            var numAttendees = curAttendees.count;

            for (i = 0; i < numAttendees; i++) {
                var curAttendee = curAttendees.item(i);
                
                if (!this._isCalendarAccountEmail(curAttendee.email)) {
                    mailTo += formatEmailAddress(curAttendee.name, curAttendee.email) + "; ";
                }
            }

            curAttendees.dispose();
        }

        if (mailTo !== "") {
            var mail = platform.invitesManager.mailFromEvent(this._targetEvent, account);
            mail.to = mailTo;
            this._sendMail(mail, account);
        }

        return true;
    };

    EventDetails.prototype._cancelEvent = function () {
        /// <summary>Handles cancel action where organizer sends cancellation mail to attendees.  Launches mail.</summary>
        if (this._targetEventCommitting) {
            return;
        }

        // This makes it more likely we will catch deleted events before going to Mail
        this._reloadPlatformEvent();

        if (this._saveFailedBecauseOfDelete) {
            this._showAlreadyDeletedDialog();
        } else {
            // Make sure that we've got recipients for the mail before launching mail.
            if (this._initEvent.attendeeList.length > 0) {
                Helpers.launchMail(Calendar.MailAction.cancel, this._targetEvent);
                // We've just launched mail and don't need an animation
                this._close(this._targetEvent);
            } else {
                this._deleteEvent();
            }
        }
    };

    EventDetails.prototype._respond = function (response) {       
        if (this._isMailEnabled() && this._targetEvent.responseRequested) {
            Helpers.showMenu({
                anchor: $.id("respondCommand") || $.id("cedRespond"),
                message: loc.getString("EventResponseOptions"),
                commands: [
                    {
                        label:   Jx.res.getString("EventEditBeforeSend"),
                        onclick: this._editResponseInMail.bind(this, response),
                    },
                    {
                        label: loc.getString("EventSendNow"),
                        onclick: this._respondEx.bind(this, response, true)
                    },
                    {
                        label: loc.getString("EventDontSend"),
                        onclick: this._respondEx.bind(this, response, false)
                    }
                ]
            });
        } else {
            // Short-circuit the response -- we are not mail enabled, so we can only go with the "Don't Send" option.
            this._respondEx(response, /* sendResponse */ false);
        }
    };

    EventDetails.prototype._editResponseInMail = function (response) {
        /// <param name="response" type="Microsoft.WindowsLive.Platform.Calendar.ResponseType">ResponseType enum value</param>
        var responseAction;
        switch (response) {
            case ResponseType.accepted: responseAction = Calendar.MailAction.accept; break;
            case ResponseType.tentative: responseAction = Calendar.MailAction.tentative; break;
            case ResponseType.declined: responseAction = Calendar.MailAction.decline; break;
            default: Debug.assert("unexpected response type"); break;
        }        

        this._initEvent.responseType = response;
        this._showYourResponse();

        Jx.bici.addToStream(
            this._getIdsCalendar().inviteResponse, 
            EventDetails.BiciResponse[response], 
            EventDetails.BiciResponseType.Edit, 
            1 /* EntryPointApp.Calendar */
        );

        Helpers.launchMail(responseAction, this._targetEvent);

        // Close the event detail page for decline response as the event can be deleted. Leaving the page open leads to subpar user experience.
        if (response === ResponseType.declined) {
            // We've just launched mail and don't need an animation
            this._close(this._targetEvent);
        }        
    };

    EventDetails.prototype._respondEx = function (response, sendResponse) {
        /// <param name="response" type="Number">ResponseType enum value</param>
        /// <param name="sendResponse" type="Boolean">Send response flag indicating whether the user selected to send a response</param>

        Jx.bici.addToStream(
            this._getIdsCalendar().inviteResponse, 
            EventDetails.BiciResponse[response], 
            sendResponse ? EventDetails.BiciResponseType.Send : EventDetails.BiciResponseType.NoSend, 
            1 /* EntryPointApp.Calendar */
        );

        if (this._targetEventCommitting) {
            return;
        }        

        // In Event View, respond should close the page, so while it's all in
        // Event Edit, close the page but do a save first.
        var account = this._getAccount(this._targetEvent),
            mailmessage = null,
            platform = this._getPlatform();

        platform.invitesManager.sendMeetingResponse(this._targetEvent, null, response, account);

        if (sendResponse) {
            mailmessage = platform.invitesManager.createResponseMail(this._targetEvent, null, response, account);

            // Even though the user chose to send a response, the organizer may not have asked for a response. If that's the case, there won't be a mail.
            var sendMailError = null;
            if (mailmessage) {
                if (Jx.isNonEmptyString(mailmessage.to)) {
                    this._sendMail(mailmessage, account);
                } else {
                    sendMailError = {
                        message: "Unable to send response mail due to lack of organizer email",
                        number: MailSendAddressErrorCode
                    };
                }

            } else if (this._targetEvent.responseRequested) {
                // We didn't get a mail, but the organizer requested a response
                sendMailError = {
                    message: "Failed to get mail from platform even though a response was requested",
                    number: NoResponseMailErrorCode
                };
            }

            if (sendMailError) {
                Debug.assert(false, sendMailError.message);
                Jx.fault("eventDetails.js", "_respondEx", sendMailError);
            }
        }

        if (response === ResponseType.declined) {
            this._deleteEvent();
        } else {
            if (this._validate()) {
                var changed = this._updateEvent();
                if (this._initEvent.responseType !== response) {
                    changed = true;

                    this._targetEvent.responseType = response;

                    var busyStatus;
                    if (response === ResponseType.accepted) {
                        busyStatus = (this._targetEvent.allDayEvent ? BusyStatus.free : BusyStatus.busy);
                    } else {
                        busyStatus = BusyStatus.tentative;
                    }

                    this._setProp("busyStatus", busyStatus);
                }

                if (this._commitEvent(changed)) {
                    // Commit successful
                    this._animateOut(EventDetails.CloseCommands.send, this._targetEvent);
                }
            }
        }
    };

    EventDetails.prototype._replyForward = function (replyAction) {
        /// <summary>
        /// Handles reply/replyAll/Forward action
        /// </summary>
        /// <param name="replyAction" type="Calendar.MailAction"></param>

        Debug.assert((replyAction === Calendar.MailAction.reply) || (replyAction === Calendar.MailAction.replyAll) || (replyAction === Calendar.MailAction.forward),
            "unsupported action " + replyAction + " - should be reply/replyAll/forward");

        if (this._targetEventCommitting) {
            return;
        }

        var saveSuccess = false;

        // If reply or reply all then don't save or exit event details.
        if (replyAction === Calendar.MailAction.reply || replyAction === Calendar.MailAction.replyAll) {
            Helpers.launchMail(replyAction, this._targetEvent);
            return;
        }

        // Save the event before trying any action that will leave the page.
        // In case of failure, the function in question shows error UX and we won't continue.
        if (this._validate()) {
            if (this._shouldShowSendButton()) {
                saveSuccess = this._sendEvent();
            } else {
                var changed = this._updateEvent();
                saveSuccess = this._commitEvent(changed);
            }
        }

        if (saveSuccess) {
            Helpers.launchMail(replyAction, this._targetEvent);
            // We've just launched mail and don't need an animation
            this._close(this._targetEvent);
        }
    };

    EventDetails.prototype._loadAttendees = function () {
        var attendees    = this._targetEvent.getAttendees(),
            attendeeList = [];

        for (var i = 0, numAttendees = attendees.count; i < numAttendees; i++) {
            var attendee = attendees.item(i);

            // treat the last resource as *the* resource
            if (attendee.attendeeType === AttendeeType.resource) {
                this._resource = attendee;
            }

            if (!this._isCalendarAccountEmail(attendee.email)) {
                attendeeList.push(attendee);
            }
        }

        attendees.dispose();
        return attendeeList;
    };

    // returns added and deleted attendees.
    EventDetails.prototype._parseAttendees = function () {
        if (!this._parseAttendeesCache) {
            Debug.only(_info("EventDetails._parseAttendees:"));

            var oldAttendees       = this._initEvent.attendeeList,
                oldAttendeesLength = oldAttendees.length,
                attendeeLookup     = {},
                deleted            = [],
                added              = [],
                attendee,
                i;

            // build email lookup table from addresswell
            if (this._who) {
                var whoRecipients  = this._who.getRecipients(),
                    whoLength      = whoRecipients.length;

                for (i = 0; i < whoLength; ++i) {
                    var recipient = whoRecipients[i];

                    if (!this._isCalendarAccountEmail(recipient.emailAddress)) {
                        attendeeLookup[recipient.emailAddress] = recipient;
                    }
                }
            }

            // For each old attendee, try to find him in the lookup table.
            for (i = 0; i < oldAttendeesLength; ++i) {
                attendee = oldAttendees[i];

                // If the old attendee isn't in the new lookup table then add it to the deleted list.
                if (attendeeLookup[attendee.email]) {
                    delete attendeeLookup[attendee.email];
                } else {
                    deleted.push(attendee);
                }
            }

            // All emails left in the lookup table must be new recipients.
            for (var key in attendeeLookup) {
                added.push(attendeeLookup[key]);
            }

            this._parseAttendeesCache = {
                added:   added,
                deleted: deleted
            };
        }

        return this._parseAttendeesCache;
    };

    EventDetails.prototype._updateAttendees = function () {
        var numAttendees  = this._initEvent.attendeeList.length;
        var attendees     = this._parseAttendees();
        var numAdded      = attendees.added.length;
        var numDeleted    = attendees.deleted.length;
        var resourceEmail = null;
        var i;

        if (this._resource) {
            resourceEmail = this._resource.email;
        }

        for (i = 0; i < numAdded; i++) {
            var toAdd = attendees.added[i];
            var newAttendee = this._targetEvent.addAttendee(toAdd.calculatedUIName, toAdd.emailAddress);
            newAttendee.responseType = ResponseType.notResponded;

            if (toAdd.emailAddress === resourceEmail) {
                newAttendee.attendeeType = AttendeeType.resource;
            } else {
                newAttendee.attendeeType = AttendeeType.required;
            }
        }

        for (i = 0; i < numDeleted; i++) {
            if (attendees.deleted[i].canDelete) {
                attendees.deleted[i].deleteObject();
            }
        }

        if (this._targetEvent.meetingStatus & MeetingStatus.isAMeeting) {
            // If we removed all attendees, we're no longer a meeting
            if (numAttendees + numAdded - numDeleted === 0) {
                this._targetEvent.meetingStatus = MeetingStatus.notAMeeting;
            }
        } else {
            // If we aren't a meeting but we added attendees, set to meeting
            if (!numAttendees && Boolean(numAdded)) {
                this._targetEvent.meetingStatus = MeetingStatus.isAMeeting;
            }
        }

        return (numAdded || numDeleted);
    };

    EventDetails.prototype._sendMail = function (mail) {
        mail.moveToOutbox();
        mail.commit();
    };

    EventDetails.prototype._getSelectedCalendar = function() {
        // if we're viewing a pre-existing event, use its calendar
        if (!this.isNewEvent()) {
            return this._targetEvent.calendar;
        }

        // if there's more than one calendar, use the selected one
        return this._calendars[this._selectedCalendarIndex].calendar;
    };

    EventDetails.prototype._createEvent = function () {
        var calendar = this._getSelectedCalendar();
        return calendar.createEvent();
    };

    EventDetails.prototype._getEvent = function (handle, _targetEvent) {
        /// <summary>
        /// Gets the given event from the platform and saves into this._targetEvent
        /// </summary>
        /// <param name="handle">Event handle</param>
        /// <param name="_targetEvent">Loaded target event.  If this is an instance, targetEvent should also be the instance.</param>

        var targetEvent = _targetEvent || this._getPlatform().calendarManager.getEventFromHandle(handle);
        this._eventType = targetEvent.eventType;

        this._organizer = targetEvent.isOrganizer;

        this._targetEvent = targetEvent;

        Debug.only(_info("EventDetails._getEvent:"));
    };

    EventDetails.prototype._sameRecurrence = function (recurrence, initRecurrence) {
        return recurrence.recurrenceType === initRecurrence.recurrenceType &&
               recurrence.interval       === initRecurrence.interval &&
               recurrence.dayOfWeek      === initRecurrence.dayOfWeek &&
               recurrence.dayOfMonth     === initRecurrence.dayOfMonth &&
               recurrence.monthOfYear    === initRecurrence.monthOfYear &&
               Helpers.isSameDate(recurrence.until, initRecurrence.until);
    };

    EventDetails.prototype._updateEvent = function () {
        // Update the target event
        var changed = false;
        var initEvent = this._initEvent;
        var targetEvent;

        // For a new event, create the target event
        if (!initEvent.id) {
            targetEvent = this._targetEvent = this._createEvent();
            // Ensure we attempt to commit
            changed = true;

            // For all new events, set responseRequested to true, since we don't have an option for it in our UI.
            targetEvent.responseRequested = true;
        } else {
            targetEvent = this._targetEvent;
        }

        var duration = this.getDuration();
        var startDate = duration.startDate;
        var endDate = duration.endDate;
        var isAllDay = duration.isAllDay;
        var allDayChanged = false;

        // Update all day first, because we need to know if it changed
        // to handle setting the dates
        if (this._setProp("allDayEvent", isAllDay)) {
            changed = true;
            allDayChanged = true;
        }

        // Update dates if they've changed, or for new events
        var startDateChanged = false;
        if (allDayChanged || (startDate - initEvent.startDate && startDate - targetEvent.startDate) || !initEvent.id) {
            changed = true;
            startDateChanged = true;
            targetEvent.startDate = startDate;
            Debug.only(_info("Setting start date: " + startDate));
        }
        if (allDayChanged || (endDate - initEvent.endDate && endDate - targetEvent.endDate) || !initEvent.id) {
            targetEvent.endDate = endDate;
            changed = true;
            Debug.only(_info("Setting end date: " + endDate));
        }

        // Update properties on target event
        if (this._setProp("subject", $.id("EventTitleTextbox").value)) {
            changed = true;
        }
        if (this._setProp("location", $.id("LocationTextbox").value)) {
            this._providerBiciInfo.locationChanged = 1;
            changed = true;
        }
        if (this._setProp("reminder", getSelectValue($.id("ReminderCombo")))) {
            changed = true;
        }
        if (this._setProp("busyStatus", getSelectValue($.id("StatusCombo")))) {
            changed = true;
        }

        // Don't get rid of Sensitivity values like "personal" if box is checked
        if ($.id("PrivateCheckbox").checked) {
            /*jshint es5:true */ // 'private' is a reserved keyword
            // If the old sensitivity was normal, change target to private
            if (initEvent.sensitivity === Sensitivity.normal && targetEvent.sensitivity !== Sensitivity.private) {
                targetEvent.sensitivity = Sensitivity.private;
                changed = true;
            }
            /*jshint es5:false */
        } else if (initEvent.sensitivity !== Sensitivity.normal) {
            // Private checkbox was unchecked, so change target to normal
            if (targetEvent.sensitivity !== Sensitivity.normal) {
                targetEvent.sensitivity = Sensitivity.normal;
                changed = true;
            }
        }

        // update recurrence options
        var selectedRecurrenceIndex = getSelectIndex($.id("RecurrenceCombo"));
        var isRecurring             = selectedRecurrenceIndex !== 0;
        var isSeries                = this._eventType === EventDetails.eventType.Series;
        var endOccurrenceIsDirty    = this._endOccurrence.isDirty();

        if (this._initEvent.recurrenceIndex !== selectedRecurrenceIndex) {
            if (isRecurring) {
                // This happens when an existing event is converted into a series.
                if (this._initEvent.recurrenceIndex === 0) {
                    targetEvent.recurring = true;
                    targetEvent.recurrence.until = this._endOccurrence.date();
                }

                this.setRecurrence(targetEvent.recurrence);
            } else {
                targetEvent.recurring = false;
            }

            this._providerBiciInfo.recurrenceChanged = 1;
            changed = true;
        } else if (isSeries && isRecurring && startDateChanged) {
            this.setRecurrence(targetEvent.recurrence);
            changed = true;
        }

        if ((isSeries && (endOccurrenceIsDirty || startDateChanged)) || (this.isNewEvent() && endOccurrenceIsDirty)) {
            // only set until if a recurrence was created (might not if user changed how often to Once without
            // removing an end recurrence date)
            if (targetEvent.recurrence) {
                targetEvent.recurrence.until = this._endOccurrence.date();
            }
            this._providerBiciInfo.recurrenceChanged = (this._providerBiciInfo.recurrenceChanged || endOccurrenceIsDirty) ? 1 : 0;
            changed = true;
        }

        // Update event description
        if (this._isCanvasDirty()) {
            targetEvent.data = this._getCanvasContent();

            // update platform support type (html / text)
            targetEvent.dataType = (this._htmlBodySupport() ? DataType.html : DataType.plainText);

            this._providerBiciInfo.notesChanged = 1;
            changed = true;
        }

        return changed;
    };

    EventDetails.prototype._getCanvasContent = function () {
        var contentFormat = this._htmlBodySupport() ? ModernCanvas.ContentFormat.htmlString : ModernCanvas.ContentFormat.text,
            content = this._canvasControl.getContent([contentFormat]);
        return content[contentFormat];
    };

    EventDetails.prototype.getCanvasWindow = function () {
        return this._canvasControl.getWindow();
    };

    EventDetails.prototype._isCanvasDirty = function () {
        return this._dirtyTracker.isDirty;
    };

    EventDetails.prototype._setProp = function (property, /*@dynamic*/newValue) {
        // Only update if the field differs from the init value, and only set a property on targetEvent when necessary
        if ((this.isNewEvent() || this._initEvent[property] !== newValue) && this._targetEvent[property] !== newValue) {
            this._targetEvent[property] = newValue;
            return true;
        }

        return false;
    };

    // Save WLI data on new event save
    EventDetails.prototype._writeWLINewEventData = function () {
        var targetEvent = this._targetEvent,
            daysUntilStart = Math.ceil((Helpers.roundDateDown(targetEvent.startDate) - Helpers.roundDateDown(new Date())) / (1000 * 60 * 60 * 24)),
            recurrenceType = getSelectIndex($.id("RecurrenceCombo")),
            attendees = this._parseAttendees().added.length,
            locationUsed = (targetEvent.location === "" ? 0 : 1),
            freeBusy = (getAreaHidden($.id("FreeBusy")) ? 0 : (this._freeBusy ? 1 : 2));

        Debug.only(_info("IdsCalendar.CalendarCreateEvent - daysUntilStart: " + daysUntilStart));
        if (daysUntilStart >= 0) {
            Jx.bici.addToStream(this._getIdsCalendar().calendarCreateEvent, daysUntilStart, recurrenceType, attendees, locationUsed, freeBusy);
            Debug.only(_info("IdsCalendar.CalendarCreateEvent - recurrenceType: " + recurrenceType));
            Debug.only(_info("IdsCalendar.CalendarCreateEvent - attendees: " + attendees));
            Debug.only(_info("IdsCalendar.CalendarCreateEvent - locationUsed: " + locationUsed));
            Debug.only(_info("IdsCalendar.CalendarCreateEvent - freeBusy: " + freeBusy));
        }
    };

    // WLI data for updated events
    EventDetails.prototype._writeWLIUpdatedEventData = function () {

        // Currently we only record a data point on update if this event was created by the provider
        var targetEvent = this._targetEvent;
        if (targetEvent.uid !== this._settings.get("lastProviderUid")) {
            return;
        }

        // This event indicates that users are editing events that are created via the provider.  
        // We want to track what fields they're editing so we can get a better understanding of
        // whether we should change the provider UI.
        
        var attendeesInfo = this._parseAttendees();
        var attendeesChanged = ((attendeesInfo.added.length > 0) || (attendeesInfo.deleted.length > 0)) ? 1 : 0;
        var biciInfo = this._providerBiciInfo;

        // Don't record this more than once
        this._settings.set("lastProviderUid", false);

        Jx.bici.addToStream(this._getIdsCalendar().calendarProviderCreateEventUpdate,
            biciInfo.recurrenceChanged,
            attendeesChanged,
            biciInfo.locationChanged,
            biciInfo.notesChanged
        );
        Debug.only(_info("IdsCalendar.CalendarProviderCreateEventUpdate - recurrence: " + biciInfo.recurrenceChanged));
        Debug.only(_info("IdsCalendar.CalendarProviderCreateEventUpdate - attendees: " + attendeesChanged));
        Debug.only(_info("IdsCalendar.CalendarProviderCreateEventUpdate - location: " + biciInfo.locationChanged));
        Debug.only(_info("IdsCalendar.CalendarProviderCreateEventUpdate - notes: " + biciInfo.notesChanged));
    };

    EventDetails.prototype._commitEvent = function (changed) {
        if (!this._saveFailedBecauseOfDelete) {
            // Validate with the platform
            var result = this._targetEvent.validate();
            if (result !== Status.success) {
                this._showPlatformError(result);

                // Reload the target event to revert the changes to _targetEvent (changes are still available in UI)
                this._reloadPlatformEvent();

                return false;
            }

            // If the user is the organizer, update attendees list now that we are definitely saving
            if (this._organizer && this._updateAttendees()) {
                changed = true;
            }

            if (this._forceDirty) {
                this._targetEvent.markDirty();
                changed = true;
            }

            if (changed) {

                this._targetEventCommitting = true;

                try {
                    this._targetEvent.commit();
                } catch (e) {
                    Jx.log.exception("EventDetails._commitEvent: Error committing event, assume the event was deleted.", e);
                    this._targetEventCommitting = false;
                    this._saveFailedBecauseOfDelete = true;
                }

                if (!this._saveFailedBecauseOfDelete) {
                    if (this.isNewEvent()) {
                        this._writeWLINewEventData();
                    } else {
                        this._writeWLIUpdatedEventData();
                    }
                }
            }
        }

        if (this._saveFailedBecauseOfDelete) {
            this._showAlreadyDeletedDialog();

            return false;
        } else {
            // load our last used view
            this._settings.set("lastCalendarId", this._targetEvent.calendar.id);

            return true;
        }
    };

    EventDetails.prototype._reloadPlatformEvent = function () {
        /// <summary>
        /// Reloads event to revert any changes to the platform event object
        /// Changes are still available in UI
        /// </summary>

        this._targetEvent = null;

        try {
            if (!this.isNewEvent()) {
                this._getEvent(this._initEvent.handle, null);

                // reload the attendees list so that the attendees actually 
                // belong to the current in-memory copy of the event
                this._initEvent.attendeeList = this._loadAttendees();
                this._parseAttendeesCache = null;
            }
        } catch (e) {
            Jx.log.exception("Failed to load event, assume event is deleted", e);
            this._targetEvent = null;
        }

        if (this._targetEvent === null) {
            this._saveFailedBecauseOfDelete = true;
        }
    };

    EventDetails.prototype._showAlreadyDeletedDialog = function () {
        /// <summary>Shows the dialog that indicates that the event is deleted and can't be updated.</summary>
        Helpers.showFlyout({
            anchor: this._clickAnchor || $.id("cedCancel"),
            message: loc.getString("cedAlreadyDeleted"),
            commands: [{
                label: loc.getString("CloseButton"),
                onclick: this._animateOut.bind(this, EventDetails.CloseCommands.del, null)
            }]
        });
    };

    EventDetails.prototype._deleteEvent = function () {
        try {
            if (this._targetEvent && this._targetEvent.canDelete) {
                this._targetEvent.deleteObject();
            }

            this._animateOut(EventDetails.CloseCommands.del, null);
        } catch (e) {
            // currently platform only returns a generic winrt error when you try to delete an already deleted event
            // TODO Have Jeremy add a specific error number.
            if (e.number === -2067070973) { // generic WinRT error
                this._animateOut(EventDetails.CloseCommands.del, null);
            }
        }
    };

    EventDetails.prototype._cacheEvent = function () {
        var initEvent   = this._initEvent = {},
            targetEvent = this._targetEvent;

        initEvent.id           = targetEvent.id;
        initEvent.handle       = targetEvent.handle;
        initEvent.startDate    = targetEvent.startDate;
        initEvent.endDate      = targetEvent.endDate;
        initEvent.allDayEvent  = targetEvent.allDayEvent;
        initEvent.subject      = targetEvent.subject;
        initEvent.location     = targetEvent.location;
        initEvent.reminder     = targetEvent.reminder;
        initEvent.busyStatus   = (targetEvent.busyStatus === BusyStatus.workingElsewhere ? BusyStatus.outOfOffice : targetEvent.busyStatus);
        initEvent.sensitivity  = targetEvent.sensitivity;
        initEvent.attendeeList = this._loadAttendees();
        initEvent.description  = targetEvent.data;
        initEvent.dataType     = targetEvent.dataType;
        initEvent.responseType = targetEvent.responseType;

        // setupRecurrence will set this correctly if this is recurring
        // 0 stands for once
        initEvent.recurrenceIndex = 0;

        if (targetEvent.recurring) {
            initEvent.recurring = true;
            var recurrence = {};
            var targetRecurrence = targetEvent.recurrence;

            // Copy the relevant fields from the target recurrence
            recurrence.recurrenceType = targetRecurrence.recurrenceType;
            recurrence.interval       = targetRecurrence.interval;
            recurrence.dayOfWeek      = targetRecurrence.dayOfWeek;
            recurrence.dayOfMonth     = targetRecurrence.dayOfMonth;
            recurrence.monthOfYear    = targetRecurrence.monthOfYear;
            recurrence.until          = targetRecurrence.until;
            recurrence.occurrences    = targetRecurrence.occurrences;

            initEvent.recurrence = recurrence;
        } else {
            this._eventType = EventDetails.eventType.Event;
        }
    };


    EventDetails.prototype._getAccount = function (targetEvent) {
        var account = this._account;

        if (!account) {
            account = targetEvent.calendar.account;

            // For existing events, cache the account
            if (!this.isNewEvent()) {
                this._account = account;
            }
        }

        return account;
    };

    EventDetails.prototype.isNewEvent = function () {
        return !this._initEvent.id;
    };

    EventDetails.prototype.isReadOnly = function () {
        return !this.isNewEvent() && this._targetEvent.calendar.readOnly;
    };

    EventDetails.prototype.hasResponded = function () {
        var responseType = this._initEvent.responseType;
        return responseType !== ResponseType.notResponded && responseType !== ResponseType.organizer && responseType !== ResponseType.none;
    };

    EventDetails.prototype._hasAttendeeStatus = function () {
        return this._capabilities && (this._capabilities & ServerCapability.attendeeStatus);
    };

    EventDetails.prototype._hasResponseStatus = function () {
        return this._capabilities && (this._capabilities & ServerCapability.responseType);
    };

    EventDetails.prototype._canRespondSupport = function () {
        return !this._capabilities || ((this._capabilities & ServerCapability.canRespond) === ServerCapability.canRespond);
    };

    EventDetails.prototype._canForwardSupport = function () {
        return !this._capabilities || (((this._capabilities & ServerCapability.canForward) === ServerCapability.canForward) && ((this._capabilities & ServerCapability.canReplaceMime) === ServerCapability.canReplaceMime));
    };

    EventDetails.prototype._canCancelSupport = function () {
        return !this._capabilities || ((this._capabilities & ServerCapability.canCancel) === ServerCapability.canCancel);
    };

    EventDetails.prototype._htmlBodySupport = function () {
        return !this._capabilities || ((this._capabilities & ServerCapability.htmlBody) === ServerCapability.htmlBody);
    };

    EventDetails.prototype._requestFreeBusySupport = function () {
        return !this._capabilities || ((this._capabilities & ServerCapability.requestFreeBusy) === ServerCapability.requestFreeBusy);
    };

    EventDetails.prototype.seriesInstance = function () {
        var targetEvent = this._targetEvent;

        return targetEvent && (targetEvent.eventType === EventDetails.eventType.Instance ||
                               targetEvent.eventType === EventDetails.eventType.Exception);
    };


    // Can't use templates here because of image url security restrictions
    var formatAttendee = function (attendee, response) {
        /// <param name="response" type="String" optional="true">Optional response string added to aria description.</param>
        var div    = document.createElement("div"),
            avatar = document.createElement("div"),
            attendeeName  = attendee.name,
            attendeeEmail = attendee.email;

        div.className = "attendee";
        div.setAttribute("aria-label", (attendeeName === attendeeEmail ? attendeeName : attendeeName + ", " + attendeeEmail) + (response ? ", " + response : ""));
        div.setAttribute("role", "option");
        div.innerHTML = "<div class='name' aria-hidden='true'>" + Jx.escapeHtml(attendeeName) + "</div><div class='email' aria-hidden='true'>" + Jx.escapeHtml(attendeeEmail) + "</div>";

        div.insertBefore(avatar, div.firstChild);
        avatar.className = "avatar";
        avatar.style.background = "url('" + (attendee.image !== "" ? attendee.image : "/ModernAddressWell/UserPawn.png") + "')";

        return div;
    };

    EventDetails.prototype._insertOrganizer = function (/*addresswell*/) {
        var recipient = AddressWell.Recipient.fromEmail(this._targetEvent.organizerEmail, this._targetEvent.organizerName, this._getPlatform());

        $.id("GuestsDescrip").parentNode.insertBefore(formatAttendee({
            email: recipient.emailAddress,
            name:  recipient.calculatedUIName,
            image: AddressWell.getUserTileUrl(recipient.person, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall)
        }), $.id("GuestsDescrip"));
    };


    var AttendeeResponses = function () {
        this._responsesInserted  = false;
        this._visible            = false;
        this._onToggleVisibility = this._onToggleVisibility.bind(this);
    };

    AttendeeResponses.prototype.activateUI = function (addresswell, attendeeList, organizerEmail) {
        // Exit early if the only attendee is the organizer.
        if (attendeeList.length === 1 && attendeeList[0].email === organizerEmail) {
            return;
        }

        // Bind needed data for lazy initialization.
        this._insertResponses = this._insertResponses.bind(this, addresswell, attendeeList, organizerEmail);

        $("#ToggleResponsesButton").click(this._onToggleVisibility);

        setAreaHidden($.id("ToggleResponsesButton"), false);
    };

    AttendeeResponses.prototype._onToggleVisibility = function () {
        var visible   = !this._visible;
        this._visible = visible;

        if (visible && !this._responsesInserted) {
            this._insertResponses();
        }

        var toggleButton = $.id("ToggleResponsesButton");
        toggleButton.innerText = loc.getString(visible ? "HideResponsesButton" : "ShowResponsesButton");
        toggleButton.setAttribute("aria-expanded", visible);

        setAreaHidden($.id("AttendeeResponses"), !visible);
    };

    AttendeeResponses.prototype._insertResponses = function (addresswell, attendeeList) {
        var responseTypes = [
            loc.getString("EventResponseTypeNoResponse"),
            "organizer", // Not Shown
            loc.getString("EventResponseTypeTentative"),
            loc.getString("EventResponseTypeAccepted"),
            loc.getString("EventResponseTypeDeclined"),
        ];

        var recipients  = addresswell.getRecipients();
        var imageLookup = {};
        var i, len;

        for (i = 0, len = recipients.length; i < len; ++i) {
            var recipient = recipients[i];

            imageLookup[recipient.emailAddress] = AddressWell.getUserTileUrl(recipient.person, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall);
        }

        var attendence = [[], [], [], [], []];

        for (i = 0, len = attendeeList.length; i < len; ++i) {
            var attendee = attendeeList[i];

            if (attendee.responseType !== ResponseType.organizer) {
                var responseIndex = (attendee.responseType > 4 ? 0 : attendee.responseType);

                attendence[responseIndex].push({
                    email: attendee.email,
                    name: attendee.name,
                    image: imageLookup[attendee.email]
                });
            }
        }

        var containerDiv = $.id("AttendeeResponses");

        for (i = 0, len = responseTypes.length; i < len; ++i) {
            var attendees       = attendence[i],
                attendeesLength = attendees.length,
                response        = responseTypes[i];

            if (attendeesLength > 0) {
                var parentDiv = document.createElement("div");
                parentDiv.setAttribute("role", "listbox");
                containerDiv.insertBefore(parentDiv, null);

                // todo use document fragment for insertion
                var div = document.createElement("div");
                div.className = "responseHeader";
                div.innerText = response + " - " + attendence[i].length;

                parentDiv.insertBefore(div, null);

                for (var j = 0; j < attendeesLength; ++j) {
                   parentDiv.insertBefore(formatAttendee(attendees[j], response), null);
                }
            }
        }

        this._responsesInserted = true;
    };

    var EndOccurrence = function (eventDetails) {
        this.update = this.update.bind(this);
        this.hasEndOccurrence = null;

        this._readonly = null;
        this._date = null;
        this._readonly = null;
        this._eventDetails = eventDetails;
        this._startEndOccurrence = null;
    };

    EndOccurrence.prototype.activateUI = function () {
        this._readonly = this._eventDetails.seriesInstance() ||
                         !this._eventDetails._organizer ||
                         this._eventDetails.isReadOnly();

        if (!this._readonly) {
            this._setEndOccurance = function () {
                this._setHasEndOccurance(true);

                setImmediate(function () {
                    // DOM may not exist in unit tests
                    var monthElement = $.id("EndOccurrenceCombo");
                    if (monthElement) {
                        monthElement.focus();
                    }
                });
            }.bind(this);

            this._clearEndOccurance = function () {
                this._setHasEndOccurance(false);

                this._eventDetails._validate();

                setImmediate(function () {
                    // DOM may not exist in unit tests
                    var endElement = $.id("SetEndOccurrenceButton");
                    if (endElement) {
                        endElement.focus();
                    }
                });
            }.bind(this);

            $("#SetEndOccurrenceButton").on("click", this._setEndOccurance);
            $("#ClearEndOccurrenceButton").on("click", this._clearEndOccurance);
            $("#RecurrenceCombo").change(this.update);

            this.update();
        }
    };

    EndOccurrence.prototype.deactivateUI = function () {
        if (!this._readonly) {
            $("#SetEndOccurrenceButton").off("click", this._setEndOccurance);
            $("#ClearEndOccurrenceButton").off("click", this._clearEndOccurance);
        }
    };

    EndOccurrence.prototype._setHasEndOccurance = function (hasEndOccurrence) {
        if (hasEndOccurrence) {
            var until = this.date();

            if (+until === EventDetails.InfiniteDate) {
                until = this._eventDetails.getDuration().startDate;
            }

            if (this._startEndOccurrence === null) {
                this._startEndOccurrence = until;
            }

            this.setDate(until);

            if (this._readonly) {
                $("#EndCustom, #EndOccurrence, #EndOccurrenceCombo").each(setReadOnly);
            }
        } else {
            this._date = null;
            if (this._startEndOccurrence === null) {
                this._startEndOccurrence = EventDetails.InfiniteDate;
            }
        }

        this.hasEndOccurrence = hasEndOccurrence;

        setAreaHidden($.id("SetEndOccurrenceButton"), hasEndOccurrence || this._readonly);
        setAreaHidden($.id("ClearEndOccurrenceButton"), !hasEndOccurrence || this._readonly);
        setAreaHidden($.id("EndOccurrenceCombo"), !hasEndOccurrence);
        setAreaHidden($.id("EndOccurrence"), !hasEndOccurrence);
    };

    EndOccurrence.prototype.setDate = function (date) {
        this._date = new Date(date);

        var dateString = _longDate.format(date);
        var label = loc.getString("OccurrenceEndDateLabel");

        $.id("EndOccurrenceCombo").setAttribute("aria-label", label + ", " + dateString);
        $("#EndOccurrenceCombo .value").text(dateString);
    };

    EndOccurrence.prototype.date = function () {
        // True if the DatePicker hasn't been created yet
        if (!this._date) {
            if (this._eventDetails.isNewEvent()) {
                this._date = this._eventDetails.getDuration().startDate;
            } else {
                var initEvent = this._eventDetails._initEvent;

                if (initEvent.recurring) {
                    if (+initEvent.recurrence.until === EventDetails.InfiniteDate) {
                        this._date = initEvent.recurrence.until;
                    } else {
                        this._date = getDateFromDateTime(initEvent.recurrence.until, this._eventDetails.getStartTime());
                    }
                } else {
                    this._date = this._eventDetails.getDuration().startDate;
                }
            }
        // DatePicker exist so use its date unless we don't have an end occurrence.
        } else {
            if (this.hasEndOccurrence) {
                this._date = getDateFromDateTime(this._date, this._eventDetails.getStartTime());
            } else {
                return new Date(EventDetails.InfiniteDate);
            }
        }

        return this._date;
    };

    EndOccurrence.prototype.update = function () {
        if (getSelectIndex($.id("RecurrenceCombo")) === 0) {
            setAreaHidden($.id("EndCustom"), true);
        } else {
            setAreaHidden($.id("EndCustom"), false);

            if (!this._date) {
                if (this._eventDetails.isNewEvent()) {
                    this._setHasEndOccurance(false);
                } else {
                    var initEvent = this._eventDetails._initEvent;
                    this._setHasEndOccurance(initEvent.recurring && +initEvent.recurrence.until !== EventDetails.InfiniteDate);
                }
            } else {
                if (this.hasEndOccurrence) {
                    // update in case start date changed
                    if (this._readonly) {
                        this._setHasEndOccurance(true);
                    }
                }
            }

            if (this.hasEndOccurrence) {
                this.setDate(this.date());
            }
        }
    };

    // end occurrence can't be dirty if the UI was never presented
    EndOccurrence.prototype.isDirty = function () {
        return !this._readonly && this._date && +this._startEndOccurrence !== +this.date();
    };



    EventDetails.prototype._mainTemplate = function (who, calendarSelector, guestLabel) {
        function res(resId) {
            return Jx.escapeHtml(Jx.res.getString(resId));
        }

        var eventDetailsHtml =
            '<div id="eventDetails" aria-labelledby="cedDetails" aria-hidden="false">' +
                '<div id="nav">' +
                    '<div class="cedHeader">' +
                        '<div id="cedBackSnap">' +
                            '<button id="cedCancel" class="win-command mirrorInRTL" aria-hidden="false" aria-label="' + res('EventButtonBack') + '" type="button">' +
                                '<span class="win-commandicon win-commandring">' +
                                    '<span class="win-commandimage">&#xE0D5;</span>' +
                                '</span>' +
                            '</button>' +
                        '</div>' +
                        '<div id="cedButtonsSnap"></div>' +
                    '</div>' +
                    '<div id="cedBackFull"></div>' +
                    calendarSelector +
                '</div>' +
                '<div id="schedule">' +
                    '<div id="cedTitleSnap" class="fullWidth"></div>' +
                    '<label id="StartDateDescrip">' + res("EventDateLabel") + '</label>' +
                    '<div id="StartDateCombo" tabindex="0" role="button" aria-expanded="false">' +
                        '<div class="check" aria-hidden="false"></div>' +
                        '<div class="value" aria-hidden="true"></div>' +
                    '</div>' +
                    '<div id="StartTimeHolder">' +
                        '<label id="StartTimeDescrip">' + res("EventStartLabel") + '</label>' +
                        '<span id="StartTimeCombo" aria-labelledby="StartTimeDescrip"></span>' +
                        '<div id="allDayHolder">' +
                            '<input id="AlldayCheckbox" aria-labelledby="AlldayCheckboxDescrip" class="durationCustom" type="checkbox" aria-hidden="true"/>' +
                            '<label id="AlldayCheckboxDescrip" class="durationCustom" aria-hidden="true">' + res("AllDay") + '</label>' +
                        '</div>' +
                    '</div>' +
                    '<div class="durationCustom" aria-hidden="true">' +
                        '<label id="EndDateDescrip">' + res("EventEndLabel") + '</label>' +
                        '<div id="EndDateCombo" tabindex="0" role="button" aria-expanded="false">' +
                            '<div class="check" aria-hidden="false"></div>' +
                            '<div class="value" aria-hidden="true"></div>' +
                        '</div>' +
                    '<label></label>' +
                        '<div id="EndTimeCombo" aria-label="' + res('EventStartLabel') + '"></div>' +
                    '</div>' +
                    '<div class="fullWidth">' +
                        '<label id="EventDurationDescrip">' + res("EventDurationLabel") + '</label>' +
                        '<select id="EventDuration" aria-labelledby="EventDurationDescrip">' +
                            '<option value="0">' + res("EventDuration0") + '</option>' +
                            '<option value="30">' + res("EventDuration30") + '</option>' +
                            '<option value="60">' + res("EventDuration60") + '</option>' +
                            '<option value="90">' + res("EventDuration90") + '</option>' +
                            '<option value="120">' + res("EventDuration120") + '</option>' +
                            '<option value="All day">' + res("EventDurationDay") + '</option>' +
                            '<option value="Custom">' + res("EventDurationCustom") + '</option>' +
                        '</select>' +
                        '<label id="LocationDescrip">' + res("EventLocationLabel") + '</label>' +
                        '<input id="LocationTextbox" spellcheck="true" aria-labelledby="LocationDescrip" maxlength="1000" type="text"/>' +
                        '<label id="OrganizerDescrip" aria-hidden="false">' + res("OrganizerLabel") + '</label>' +
                        '<label id="GuestsDescrip">' + Jx.escapeHtml(guestLabel) + '</label>' +
                        '<div id="GuestsCombo" class="compose-address-editbox typeSizeNormal">' + who + '</div>' +
                        '<div id="yourResponse" aria-hidden="true"></div>' +
                        '<div id="FreeBusy"><button id="FreeBusyButton" type="button">' + res("FreeBusyButton") + '</button></div>' +
                        '<button id="ToggleResponsesButton" aria-hidden="true" aria-expanded="false" type="button"><span>' + res("ShowResponsesButton") + '</span></button>' +
                        '<div id="AttendeeResponses" aria-hidden="true" role="group"></div>' +
                        '<button id="ShowMoreButton" aria-hidden="false" type="button"><span>' + res("ShowMoreLabel") + '</span></button>' +
                        '<div id="ShowMore" aria-hidden="true">' +
                            '<label id="RecurrenceDescrip">' + res("EventRecurrenceLabel") + '</label>' +
                            '<select id="RecurrenceCombo" aria-labelledby="RecurrenceDescrip">' +
                                '<option id="RecurrenceOnce" value="none">' + res("EventRecurrenceOnce") + '</option>' +
                                '<option id="RecurrenceDay" value="daily">' + res("EventRecurrenceDay") + '</option>' +
                                '<option id="RecurrenceWeekday" value="weekdays">' + res("EventRecurrenceWeekday") + '</option>' +
                                '<option id="RecurrenceMWF" value="mwf">' + res("EventRecurrenceMWF") + '</option>' +
                                '<option id="RecurrenceTTH" value="tth">' + res("EventRecurrenceTTH") + '</option>' +
                                '<option id="RecurrenceWeek" value="weekly">' + res("EventRecurrenceWeek") + '</option>' +
                                '<option id="RecurrenceMonth" value="monthly">' + res("EventRecurrenceMonth") + '</option>' +
                                '<option id="RecurrenceYear" value="yearly">' + res("EventRecurrenceYear") + '</option>' +
                            '</select>' +
                            '<div id="EndCustom" aria-hidden="true">' +
                                '<label id="EndOccurrence" aria-hidden="true">' + res("OccurrenceEndDateLabel") + '</label>' +
                                '<div id="EndOccurrenceCombo" tabindex="0" role="button" aria-expanded="false">' +
                                    '<div class="check" aria-hidden="false"></div>' +
                                    '<div class="value" aria-hidden="true"></div>' +
                                '</div>' +
                                '<button id="SetEndOccurrenceButton" aria-hidden="true" type="button"><span>' + res("SetOccurrenceEndDateButton") + '</span></button>' +
                                '<button id="ClearEndOccurrenceButton" aria-hidden="true" type="button"><span>' + res("ClearOccurrenceEndDateButton") + '</span></button>' +
                            '</div>' +
                            '<label id="ReminderDescrip">' + res("EventReminderLabel") + '</label>' +
                            '<select id="ReminderCombo" aria-labelledby="ReminderDescrip">' +
                                '<option id="ReminderNone" value="-1">' + res("EventReminderNone") + '</option>' +
                                '<option id="Reminder0" value="0">' + res("EventReminder0") + '</option>' +
                                '<option id="Reminder5" value="5">' + res("EventReminder5") + '</option>' +
                                '<option id="Reminder15" value="15">' + res("EventReminder15") + '</option>' +
                                '<option id="Reminder30" value="30">' + res("EventReminder30") + '</option>' +
                                '<option id="ReminderHour" value="60">' + res("EventReminder60") + '</option>' +
                                '<option id="Reminder18Hours" value="1080">' + res("EventReminder1080") + '</option>' +
                                '<option id="ReminderDay" value="1440">' + res("EventReminder1440") + '</option>' +
                                '<option id="ReminderWeek" value="10080">' + res("EventReminder10080") + '</option>' +
                            '</select>' +
                            '<label id="StatusDescrip">' + res("EventBusyStatusLabel") + '</label>' +
                            '<select id="StatusCombo" aria-labelledby="StatusDescrip">' +
                                '<option id="StatusFree">' + res("EventStatusFree") + '</option>' +
                                '<option id="StatusBusy">' + res("EventStatusBusy") + '</option>' +
                                '<option id="StatusTentative">' + res("EventStatusTentative") + '</option>' +
                                '<option id="StatusOut">' + res("EventStatusOOF") + '</option>' +
                            '</select>' +
                            '<div id="PrivateHolder">' +
                                '<input id="PrivateCheckbox" class="privateEvent" type="checkbox" aria-labelledby="PrivateCheckboxDescrip"/>' +
                                '<label id="PrivateCheckboxDescrip" class="privateEvent">' + res("EventPrivateCheckbox") + '</label>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div id="cedTitle">' +
                    '<div id="cedTitleFull">' +
                        '<label id="EventTitleDescrip">' + res("EventTitleLabel") + '</label>' +
                        '<input id="EventTitleTextbox" spellcheck="true" aria-label="' + res('EventTitleLabel') + '" maxlength="255" type="text"/>' +
                        '<div id="cedButtonsFull">' +
                            '<button id="cedRespond" class="win-command" aria-hidden="true" aria-label="' + res('EventRespond') + '" type="button">' +
                                '<span class="win-commandicon win-commandring">' +
                                    '<span class="win-commandimage">&#xE1DB;</span>' +
                                '</span>' +
                            '</button>' +
                            '<button id="cedSend" class="win-command useCustomFont" aria-hidden="true" aria-label="' + res('EventSendNow') + '" type="button">' +
                                '<span class="win-commandicon win-commandring">' +
                                    '<span class="win-commandimage new-icon">&#xE122;</span>' +
                                '</span>' +
                            '</button>' +
                            '<button id="cedSave" class="win-command" aria-hidden="true" aria-label="' + res('EventButtonSave') + '" type="button">' +
                                '<span class="win-commandicon win-commandring">' +
                                    '<span class="win-commandimage">&#xE105;</span>' +
                                '</span>' +
                            '</button>' +
                            '<button id="cedDelete" class="win-command" aria-hidden="true" aria-label="' + res('EventButtonDelete') + '" type="button">' +
                                '<span class="win-commandicon win-commandring">' +
                                    '<span class="win-commandimage">&#xE107;</span>' +
                                '</span>' +
                            '</button>' +
                       '</div>' +
                    '</div>' +
                '</div>' +
                '<div id="cedNotes">' +
                    '<div id="NotesTextbox" aria-label="' + res('EventNotesLabel') + '"></div>' +
                '</div>' +
            '</div>';

        var html =
            '<div id="cedContainer">' +
                '<div id="cedBackground"></div>' +
                '<div id="cedWrapper">' + eventDetailsHtml + '</div>' +
            '</div>';

        return html;
    };

});
