
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />

/*jshint browser:true*/
/*global Calendar,Debug,Jx,Microsoft,$ */
Jx.delayDefine(Calendar.Views, "CalendarSelector", function () {

    function _start(s) { Jx.mark("Calendar.CS." + s + ",StartTA,Calendar"); }
    function _stop(s) { Jx.mark("Calendar.CS." + s + ",StopTA,Calendar"); }

    _start("calendarSelector.js");

    var CalendarSelector = Calendar.Views.CalendarSelector = function /* @constructor */(externalButton) {
        /// <summary>Calendar Selector - acts similar to a standard select control.</summary>
        /// <param name="externalButton" type="String">
        /// If defined, indicates that the control's "selection" UI / entry point has been replaced by the caller with an element with the given selector.
        /// </param>

        _start("ctor");
        
        this.initComponent();

        this._onCalendarSelectClick = this._onCalendarSelectClick.bind(this);

        this._onActiveState     = this._onActiveState.bind(this);
        this._offActiveState    = this._offActiveState.bind(this);
        this._onHoverState      = this._onHoverState.bind(this);
        this._offHoverState     = this._offHoverState.bind(this);
        this._onKeyDown         = this._onKeyDown.bind(this);
        this._onShowDropdown    = this._onShowDropdown.bind(this);
        this._onExpandChange    = this._onExpandChange.bind(this);
        this._onClickEater = this._onClickEater.bind(this);

        this.onDismiss          = this.onDismiss.bind(this);
        this.updateSelectionByIndex = this.updateSelectionByIndex.bind(this);

        this._eventDetailsLinkHandler = this._eventDetailsLinkHandler.bind(this);

        // DOM cache
        this._control           = null;
        this._selection         = null;
        this._dropDown          = null;
        this._dropDownContainer = null;
        this._clickEater        = null;

        // Immutable state
        this._id                      = "CalendarCombo";
        this._externalButton          = externalButton;
        this._selectionID             = this._id + "Selection";

        // Mutable state
        this._calendars               = [];
        this._isDirty                 = true;
        this._selectedCalendar        = 0;
        this._eventsEnabled           = false;
        this._dropDownDown            = false;
        this._eventDetailsLink        = false;
        this._eventDetailsLinkFocused = false;
        this._disableInitialFocus     = false;

        _stop("ctor");
    };

    Jx.augment(CalendarSelector, Jx.Component);

    CalendarSelector.createCalendarOption = function (calendar, hidden) {
        /// <summary>Creates a "calendarOption" object which can be passed to the selector using setCalendars</summary>
        /// <returns>Object contains: name (string), email (string), color (string), colorRaw (Number), and calendar (platform ICalendar).</returns>
        _start("_createCalendarOption");
        var cname = calendar.name;
        var account = calendar.account.emailAddress;
        var secondLine = "";

        if (hidden) {
            if (cname === "") {
                secondLine = Jx.res.getString("HiddenCalendar");
            } else {
                secondLine = Jx.res.loadCompoundString("HiddenCalendarWithEmail", account);
            }
        } else {
            if (cname === "") {
                secondLine = "";
            } else {
                secondLine = account;
            }
        }

        var result = {
            name: (cname !== "" ? cname : account),
            email: secondLine,
            color: Calendar.Helpers.processEventColor(calendar.color),
            colorRaw: calendar.color,
            calendar: calendar,
        };
        _stop("_createCalendarOption");
        return result;
    };

    CalendarSelector.getCalendarsForSelector = function (platform) {
        /// <summary>
        /// "Static" method to retrieve a list of "calendarOption" objects which can be passed to the setCalendars function.
        /// Does not include readonly calendars.  Hidden calendars are only included in the list if there are no other calendars.
        /// </summary>
        /// <returns type="Array">Returns an array of "calendarOption", which contains: name, email, color, colorRaw, and calendar (see createCalendarOption).</returns>

        _start("getCalendarsForSelector");

        var calendarManager = platform.calendarManager;
        var numCalendars = calendarManager.getAllCalendars().count;
        var calendarOptions = [];

        // If just one calendar then add it.
        // This is important since numCalendars can be 0, but we'll always have a default calendar to add.
        if (numCalendars <= 1) {
            calendarOptions.push(CalendarSelector.createCalendarOption(calendarManager.defaultCalendar, false));
        } else {
            // More than one calendar so we have to build a list

            var MWP = Microsoft.WindowsLive.Platform;
            var accounts = platform.accountManager.getConnectedAccountsByScenario(
                    Calendar.scenario,
                    MWP.ConnectedFilter.normal,
                    MWP.AccountSort.rank);
            var calendarsNotHidden = 0;
            var calendars = [];
            var calendar;
            var i;
            var len;

            // Build array of non- read only calendars in order.
            for (i = 0, len = accounts.count; i < len; i++) {
                var account = accounts.item(i),
                    platformCalendarCollection = calendarManager.getAllCalendarsForAccount(account),
                    accountCalendars = [];

                for (var j = 0, jLen = platformCalendarCollection.count; j < jLen; j++) {
                    calendar = platformCalendarCollection.item(j);

                    if (!calendar.readOnly) {
                        if (calendar.isDefault) {
                            accountCalendars.unshift(calendar);
                        } else {
                            accountCalendars.push(calendar);
                        }

                        if (!calendar.hidden) {
                            calendarsNotHidden++;
                        }
                    }
                }

                platformCalendarCollection.dispose();
                calendars = calendars.concat(accountCalendars);
            }

            accounts.dispose();
            accounts = null;

            // Collect only non-hidden calendars unless they are all hidden.
            var showHiddenCalendars = (calendarsNotHidden === 0);
            var createCalendarOption = CalendarSelector.createCalendarOption;

            for (i = 0, len = calendars.length; i < len; i++) {
                calendar = calendars[i];

                if (showHiddenCalendars || !calendar.hidden) {
                    calendarOptions.push(createCalendarOption(calendar, showHiddenCalendars));
                }
            }
        }

        _stop("getCalendarsForSelector");
        return calendarOptions;
    };

    var proto = CalendarSelector.prototype;

    proto.getUI = function (ui) {
        ui.html = this._containerTemplate();
    };

    proto.activateUI = function () {
        _start("activateUI");

        this._control = $.id(this._id);

        // if the control wasn't inserted by a parent container, insert it dynamically.
        if (!this._control) {
            var host = $.id("calendar");
            host.insertAdjacentHTML("beforeend", Jx.getUI(this).html);
            this._control = host.lastElementChild;
        }

        if (!this._clickEater) {
            // create clickeater very high up in the DOM (like winjs flyouts)
            var body = document.body;
            body.insertAdjacentHTML("beforeend", '<div class="calendarSelector-clickEater"></div>');
            this._clickEater = body.lastElementChild;
        }

        var control = this._control;

        this._dropDown          = control.querySelector(".dropDown");
        this._dropDownContainer = control.querySelector(".dropDownContainer");

        $("#eventDetailsLink").on("click", this._eventDetailsLinkHandler);

        this._selection = (this._externalButton ? $(this._externalButton) : $(".selection", control))[0];

        $(this._clickEater)
            .on("MSPointerDown", this._stopPropagation) // This disables scrolling outside of the calendar selector.
            .on("wheel", this._stopPropagation)
            .on("click", this._onClickEater);

        $(this._dropDownContainer)
            .on("click", this._stopPropagation);

        // enables hover events
        this._hideDropdown();

        _stop("activateUI");
    };

    proto.deactivateUI = function () {
        _start("deactivateUI");
        
        this.toggleEventBindings(false);

        $(this._control).remove();
        this._control = null;

        $(this._clickEater)
            .off("MSPointerDown", this._stopPropagation)
            .off("wheel", this._stopPropagation)
            .off("click", this._onClickEater)
            .remove();
        this._clickEater = null;
            
        $(this._dropDownContainer)
            .off("click", this._stopPropagation);
        this._dropDownContainer = null;
        this._dropDown = null;

        $("#eventDetailsLink").off("click", this._eventDetailsLinkHandler);

        _stop("deactivateUI");
    };

    // true enables events and false disables them.
    proto.toggleEventBindings = function (enable) {
        _start("toggleEventBindings");

        if (!this._eventsEnabled && enable) {
            // TODO talk with dantib and figure out why I can't bind to click and keyup in the same statement.
            $(this._selection)
                .on("click", this._onShowDropdown)
                .on("keydown", this._onShowDropdown);

            $(this._dropDown)
                .on("click", this._onCalendarSelectClick)
                .on("mouseover", this._onHoverState)
                .on("mouseout", this._offHoverState)
                .on("mousedown", this._onActiveState)
                .on("mouseup", this._offActiveState)
                .on("MSPointerDown", this._stopPropagation)
                .on("MSPointerCancel", this._stopPropagation)
                .on("DOMAttrModified", this._onExpandChange);

            this._control.addEventListener("keydown", this._onKeyDown, true);
        } else if (this._eventsEnabled && !enable) {
            $(this._selection)
                .off("click", this._onShowDropdown)
                .off("keydown", this._onShowDropdown);

            $(this._dropDown)
                .off("click", this._onCalendarSelectClick)
                .off("mouseover", this._onHoverState)
                .off("mouseout", this._offHoverState)
                .off("mousedown", this._onActiveState)
                .off("mouseup", this._offActiveState)
                .off("MSPointerDown", this._stopPropagation)
                .off("MSPointerCancel", this._stopPropagation)
                .off("DOMAttrModified", this._onExpandChange);

            this._control.removeEventListener("keydown", this._onKeyDown, true);
        }

        this._eventsEnabled = enable;

        _stop("toggleEventBindings");
    };

    proto.enableEventDetailsLink = function (eventDetailsLink) {
        /// <param name="eventDetailsLink" type="Boolean">If true, adds a link into the bottom of calendar selector that fires createEvent when activated.</param>
        this._eventDetailsLink = eventDetailsLink;
    };

    proto._eventDetailsLinkHandler = function (ev) {
        ev.stopPropagation();
        ev.preventDefault();

        this.fire("createEvent");
    };

    proto.setCalendars = function (calendars) {
        /// <summary>
        /// Populates the calendar dropdown with a new list of calendars.  
        /// One of the updateSelectionBy functions should be called immediately after setting calendars.
        /// </summary>
        /// <param name="calendars" type="Array">Expects an array of "calendarOption" objects, which can be created using createCalendarOption or getCalendarsForSelector.</param>
        /// <param name="selectedCalendarId" type="Number">ID of the calendar selection</param>
        _start("setCalendars");

        this._calendars = calendars;
        this._isDirty = true;

        // Enable events if more than one calendar exist or there is an external button.
        this.toggleEventBindings(calendars.length > 1 || this._externalButton);

        _stop("setCalendars");
    };

    proto.updateSelectionByIndex = function (selectedCalendarIndex) {
        /// <summary>Updates the calendar selection to the given index into the current list of calendars.</summary>
        /// <param name="selectedCalendarIndex" type="Number">ID of the new selection</param>
        _start("updateSelectionByIndex");

        if (selectedCalendarIndex > this._calendars.length - 1) {
            return;
        }

        this._selectedCalendar = selectedCalendarIndex;
        this.updateSelectionUI(this._calendars[selectedCalendarIndex]);
        $(this._selection).attr("aria-haspopup", "true");

        Jx.EventManager.fire(this, "calendarSelected", { index: selectedCalendarIndex });

        _stop("updateSelectionByIndex");
    };

    proto.updateSelectionById = function (selectedCalendarId) {
        /// <summary>Updates the calendar selection to the given calendar ID.  If the calendar is not found, the selection will be changed to a default value.</summary>
        /// <param name="selectedCalendarId" type="Number" optional="true">ID of the new selection</param>
        _start("updateSelectionById");

        var defaultCalendarIndex = -1;
        var selectedCalendarIndex = -1;
        for (var i = 0, len = this._calendars.length; (i < len) && (selectedCalendarIndex === -1) ; i++) {
            var calendar = this._calendars[i].calendar;
            if (calendar.id === selectedCalendarId) {
                selectedCalendarIndex = i;
            } else if (calendar.isDefault) {
                if (Jx.isNumber(selectedCalendarId)) {
                    // Save the default calendar for later, we'll use it if we can't find the ideal selected calendar.
                    defaultCalendarIndex = i;
                } else {
                    // We're done looking since there's no selectedCalendarId to look for.
                    selectedCalendarIndex = i;
                }
            }
        }

        if (selectedCalendarIndex === -1) {
            // We might not have either of our preferred calendars - in that case select the first calendar.
            selectedCalendarIndex = (defaultCalendarIndex === -1) ? 0 : defaultCalendarIndex;
        }

        Debug.assert(selectedCalendarIndex >= 0, "selectedCalendarIndex too small");
        Debug.assert(selectedCalendarIndex < this._calendars.length, "selectedCalendarIndex out of array bounds");

        this.updateSelectionByIndex(selectedCalendarIndex);

        _stop("updateSelectionById");
    };

    proto.updateSelectionUI = function (calendar) {
        /// <summary>
        /// Updates the rest state of the control at selection time.  
        /// Does not need to be called by consumers, but can be overridden in cases such as quick event when the consumer controls the at-rest UI.
        /// </summary>

        if (this._externalButton) {
            // The caller will have to update the selection UI since it's external. 
            // Currently quick event does this by overriding this function.
            return;
        }

        _start("updateSelectionUI");

        $(this._selection).html(this._selectionTemplate(calendar, this._calendars.length > 1, this._selectionID));

        var label = calendar.name + " " + calendar.email; 
        $(this._selection).attr("aria-label", label);

        _stop("updateSelectionUI");
    };

    proto.hasDropdown = function () {
        /// <summary>Indicates whether the calendar selector is in a state where it has a functional dropdown (more than one calendar)</summary>

        return this._calendars.length > 1;
    };

    proto.isOpen = function () {
        return this._dropDownDown;
    };

    proto.getSelectedCalendarIndex = function () {
        /// <summary>Returns the index (into the array passed in to setCalendars) of the currently selected calendar.</summary>

        return this._selectedCalendar;
    };

    proto._showDropdown = function (ev) {
        // Don't show dropdown if already visible.
        if (this._dropDownDown) {
            return;
        }

        _start("_showDropdown");
        this._dropDownDown = true;

        // disable events on main control
        $(this._selection)
            .off("mouseover", this._onHoverState)
            .off("mouseout", this._offHoverState)
            .off("mousedown", this._onActiveState)
            .off("mouseup", this._offActiveState);

        if (this._isDirty) {
            $(this._dropDown).html(this._entryListTemplate(this._calendars));        
            this._isDirty = false;
        }

        this._dropDownContainer.style.display = "block";
        $(this._dropDown)
            .attr("aria-hidden", false)
            .attr("aria-selected", true)
            .attr("aria-expanded", true) // will fire showDropdown event
            .attr("aria-owns", "calendarMenu");

        this._keySelect = this._selectedCalendar;

        this.fire("showDropdown", {container: this._dropDownContainer, ev : ev});

        this._clickEater.style.display = "block";

        this._eventDetailsLinkFocused = false;

        if (!this._disableInitialFocus) {
            this.setFocus();
        }

        _stop("_showDropdown");
    };

    CalendarSelector.prototype.disableInitialFocus = function () {
        /// <summary>Calling this will prevent activateUI from setting focus.  e.g.  QuickEvent creation calls this and then calls setFocus after it finishes centering the calendar selector. </summary>
        this._disableInitialFocus = true;
    };

    CalendarSelector.prototype.setFocus = function () {
        _start("setFocus");
        
        var $entries = $(".entry", this._dropDown);    
        // Set tab indexes
        $entries.each(function (i) { $(this).attr("tabindex", i + 1); });

        this._setActiveEntryStyle($entries, this._selectedCalendar);

        var entry = $entries[this._selectedCalendar];
        entry.focus();

        _stop("setFocus");
    };

    proto._hideDropdown = function () {
        if (!this._dropDownDown) {
            return;
        }

        _start("_hideDropdown");

        this._clickEater.style.display = "";

        this._dropDownContainer.style.display = "none";
        $(this._dropDown).attr("aria-hidden", true);

        // enable events on main control
        $(this._selection)
            .on("mouseover", this._onHoverState)
            .on("mouseout", this._offHoverState)
            .on("mousedown", this._onActiveState)
            .on("mouseup", this._offActiveState);
        
        this._dropDownDown = false;

        if (!this._externalButton) {
            // If the caller isn't managing it, put focus on the rest state of the control.
            Jx.safeSetActive($("#CalendarCombo .selection")[0]);
        }

        Jx.EventManager.fire(this, "CalendarSelectorHidden");

        _stop("_hideDropdown");
    };

    // This function travels up the dom on nodes that have the class ctcsel until it finds a node with class entry.
    function getEntryElementFromEvent(ev) {
        var node = ev.target;

        while ($(node).hasClass("ctcsel")) {
            node = node.parentNode;
        }

        return $(node).hasClass("entry") ? $(node) : false;
    }

    proto._onCalendarSelectClick = function (ev) {
        _start("_onCalendarSelectClick");

        ev.stopPropagation();
        ev.preventDefault();

        var $entry = getEntryElementFromEvent(ev);
        if ($entry) {
            var $entries      = $(".entry", this._dropDown),
                calendarIndex = Array.prototype.indexOf.call($entries, $entry[0]);

            this._removeActiveEntryStyle($entries, this._keySelect);
            this.updateSelectionByIndex(calendarIndex);
            this._hideDropdown();
        }

        _stop("_onCalendarSelectClick");
    };

    proto._onClickEater = function (ev) {
        ev.stopPropagation();
        this._hideDropdown();
    };

    proto._stopPropagation = function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
    };

    proto._onActiveState = function (ev) {
        var $entry = getEntryElementFromEvent(ev);

        if ($entry) {
           $entry.addClass("active");
        }
    };

    proto._offActiveState = function (ev) {
        var $entry = getEntryElementFromEvent(ev);

        if ($entry) {
            $entry.removeClass("active");
        }
    };

    proto._onHoverState = function (ev) {
        var $entry = getEntryElementFromEvent(ev);

        if ($entry) {
            $(".entry", this._dropDown).removeClass("hover");
            $entry.addClass("hover");
        }
        ev.stopPropagation();
        ev.preventDefault();
    };

    proto._offHoverState = function (ev) {
        var $entry = getEntryElementFromEvent(ev);

        if ($entry) {
            $entry.removeClass("hover").removeClass("active");
        }
    };

    proto._onShowDropdown = function (ev) {
        _start("onShowDropdown");
        var code  = ev.keyCode,
            codes = Jx.KeyCode;

        // no code equals mouse click
        if (!code) {
            ev.stopPropagation();
            // close dropdown if already opened and then clicked on
            if (this._dropDownDown) {
                this._hideDropdown();
            } else {
                this._showDropdown(ev);
            }
        } else if (!ev.altKey && !ev.ctrlKey && (code === codes.enter || code === codes.space)) {
            this._showDropdown(ev);
            ev.stopPropagation();
            ev.preventDefault();
        }
        _stop("onShowDropdown");
    };

    proto._setActiveEntryStyle = function ($entries, index) {
        var entry = $entries.get(index);
        
        $(entry).css("background-color", this._calendars[this._selectedCalendar].color);
        $(".name, .email", entry).css("color", "white");
        $(".color", entry).css("background-color", "white");
    };

    proto._removeActiveEntryStyle = function ($entries, index) {
        var entry = $entries.get(index);
        
        $(entry).each(function () { this.style["background-color"] = ""; });
        $(".name, .email", entry).each(function () { this.style.color = ""; });
        $(".color", entry).css("background-color", this._calendars[index].color);
    };

    proto._onKeyDown = function (ev) {
        var code  = ev.keyCode,
            codes = Jx.KeyCode;

        if (this._dropDownDown) {
            var calendarCount = this._calendars.length,
                keySelect     = this._keySelect,
                $entries      = $(".entry", this._dropDown);
                
            ev.stopPropagation();
            ev.preventDefault();

            if (this._eventDetailsLink && code === codes.tab) {
                this._eventDetailsLinkFocused = !this._eventDetailsLinkFocused;

                if (this._eventDetailsLinkFocused) {
                    $.id("eventDetailsLink").focus();
                } else {
                    $entries[keySelect].focus();                    
                }
            }

            if (this._eventDetailsLinkFocused) {
                if (code === codes.enter || code === codes.space) {
                    this._eventDetailsLinkHandler(ev);
                }
            } else {
                if (code === codes.uparrow) {
                    keySelect = (keySelect + calendarCount - 1) % calendarCount;
                } else if (code === codes.downarrow) {
                    keySelect = (keySelect + 1) % calendarCount;
                } else if (code === codes.home) {
                    keySelect = 0;
                } else if (code === codes.end) {
                    keySelect = calendarCount - 1;
                } else if (code === codes.enter || code === codes.space) {
                    this.updateSelectionByIndex(this._keySelect);
                    this._hideDropdown();
                } else if (code === codes.escape) {
                    this._removeActiveEntryStyle($entries, this._keySelect);
                    this._hideDropdown();
                }

                if (keySelect !== this._keySelect) {
                    this._removeActiveEntryStyle($entries, this._keySelect);
                    this._setActiveEntryStyle($entries, keySelect);
                    
                    var entry = $entries[keySelect];
                    entry.focus();
                    
                    this._keySelect = keySelect;
                }
            }
        }
    };

    proto.activeCalendarItem = function () {
        return this._calendars[this._keySelect];
    };

    proto.onDismiss = function () {
        _start("onDismiss");

        this._hideDropdown();

        _stop("onDismiss");
    };

    proto._onExpandChange = function (ev) {
        _start("_onExpandChange");

        if (ev.attrName === "aria-expanded") {
            if (ev.newValue === "true") {
                this._showDropdown(ev);
            } else {
                this._hideDropdown();
            }
        }

        _stop("_onExpandChange");
    };

    ///
    /// Templates
    ///
    proto._entryListTemplate = function(calendars) {
        var html = "";

        for (var i = 0, leni = calendars.length; i < leni; i++) {
            var calendar = calendars[i];

            html +=
            '<div class="entry" id="calendarSelectEntry' + i + '" role="menuitem" aria-label="' + Jx.escapeHtml(calendar.name + " " + calendar.email) + '">' +
                '<div class="color ctcsel" style="background:' + calendar.color + '" aria-hidden="true"></div>' +
                '<div class="name ctcsel" aria-hidden="true"><span class="ctcsel">' + Jx.escapeHtml(calendar.name) + '</span></div>' +
                '<div class="email ctcsel" aria-hidden="true">' + Jx.escapeHtml(calendar.email) + '</div>' +
            '</div>';
        }

        return html;
    };

    proto._selectionTemplate = function(calendar, caret, id) {
        var caretHtml = caret ? '<div class="ctcsel">' + Jx.escapeHtml(calendar.name) + '</div><div class="caret ctcsel">&#xE099;</div>' : Jx.escapeHtml(calendar.name);
       
        var html =
        '<div class="entry currentEntry" id="' + id + '">' +
            '<div class="color ctcsel" style="background:' + calendar.color + '" aria-hidden="true"></div>' +
            '<div class="name ctcsel">' + caretHtml + '</div>' +
            '<div class="email ctcsel">' + Jx.escapeHtml(calendar.email) + '</div>' +
        '</div>';

        return html;
    };

    proto._containerTemplate = function() {
        var selectionHTML = this._externalButton ? "" :
            '<div class="selection" tabindex="0" aria-label="' + Jx.res.getString("EventCalendarLabel") + '" role="button"></div>';

        var extraHtml = !this._eventDetailsLink ? "" :
            '<div class="eventDetailsLink">' +
                '<div class="hr"></div>' +
                '<div class="link" id="eventDetailsLink" tabindex="0" role="button">' + Jx.escapeHtml(Jx.res.getString("AddMoreDetailLink")) + '</div>' +
            '</div>';

        var html =
            '<div id="' + this._id + '" class="calendarSelector">' +
                selectionHTML +
                '<div class="dropDownContainer">' +
                    '<div class="dropDown" id="calendarMenu" aria-hidden="true" role="menu" aria-label="menu"></div>' +
                    extraHtml +
                '</div>' +
            '</div>';

        return html;
    };
});