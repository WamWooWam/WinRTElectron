
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />

/*global Calendar,Jx,$,Microsoft,WinJS,window,document,msWriteProfilerMark,setImmediate */
Jx.delayDefine(Calendar.Controls, "QuickEvent", function () {

    function _start(evt) { msWriteProfilerMark("Calendar:QuickEvent." + evt + ",StartTA,Calendar"); }
    function _stop(evt)  { msWriteProfilerMark("Calendar:QuickEvent." + evt + ",StopTA,Calendar");  }

    var Helpers = Calendar.Helpers,
        Manager = Calendar.Views.Manager,
        loc     = Calendar.Loc,
        CalendarSelector;

    var QuickEvent = Calendar.Controls.QuickEvent = function(view) {
        this.initComponent();

        CalendarSelector = Calendar.Views.CalendarSelector;

        // DOM cache
        this._surface          = null;
        this._glyph            = null;
        this._subject          = null;
        this._location         = null;
        this._textContainer    = null;
        this._caret            = null;
        this._dropdownHolder   = null;
        this._closeButton      = null;

        // Platform objects
        this._platform = null;
        this._settings = null;
        this._calendar = null;

        // Event handlers
        this._onKeyDown                = this._onKeyDown.bind(this);
        this._onKeyDownInputBox        = this._onKeyDownInputBox.bind(this);
        this._onResizeWindow           = this._onResizeWindow.bind(this);
        this._onCalendarSelectorHidden = this._onCalendarSelectorHidden.bind(this);
        this._onClickCloseButton       = this._onClickCloseButton.bind(this);

        this.onDismiss = this.onDismiss.bind(this);

        this._ensureVisible     = this._ensureVisible.bind(this);
        this._shutdown          = this._shutdown.bind(this);
        this._startEventDetails = this._startEventDetails.bind(this);

        // private none mutable state
        this._view         = view;  //Manager.Views.month
        this._element      = null;
        this._allDayEvent  = true;
        this._focusRestore = null;

        // private mutable state
        this._host         = null;
        this._date         = null;
        this._tabElements  = null;
        this._windowWidth  = null;
        this._animation    = null;
        this._useAnimation = false;

        // Child Jx.Components
        this._calendarSelector = new CalendarSelector(".qe-caret");
        this._calendarSelector.updateSelectionUI = this._updateSelectionUI.bind(this);
        this._calendarSelector.disableInitialFocus();

        this._timeSlider = new Calendar.Views.TimeSlider(60, false);
        this.appendChild(this._timeSlider);        
    };

    Jx.augment(QuickEvent, Jx.Component);

    //
    // Public members
    //

    QuickEvent.prototype.activateUI = function(host, date, allDayEvent, item, focusRestore) {
        /// <param name="item">Layout information passed from the current view.</param>
        _start("activateUI");

        if (this.isOpen()) {
            this.onDismiss();
        } else {
            this._calendar     = this._getPlatform().calendarManager.defaultCalendar;
            this._host         = host;
            this._date         = date;
            this._windowWidth  = window.outerWidth;
            this._allDayEvent  = allDayEvent;
            this._focusRestore = focusRestore;
            this._useAnimation = true;

            this._createOrRecycleHtml(item);

            if (!this._allDayEvent) {
                var anchor = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                this._timeSlider.setAllowStartStopSwap(false);
                this._timeSlider.setAllowSliderJump(false);
                this._timeSlider.setRange(anchor, date, new Date(+date + Helpers.hourInMilliseconds));
            }

            this._calendarSelector.enableEventDetailsLink(true);
            this._calendarSelector.activateUI();
            
            this._setupCalendarCombo();
            this._setupTabIndex();
            this._bindEvents();

            // Disable scrolling of an ancestor timeline since we support dragging sliders.
            this.fire("setScrollable", false);

            // set opacity for animations
            var element = (this._timeSliderElement ? this._timeSliderElement : this._element);
            element.style.opacity = 1;

            // Set initial focus
            this._subject.focus();
        }

        _stop("activateUI");
    };

    QuickEvent.prototype._shutdown = function () {
        this._subject.value = "";
        this._location.value = "";

        this._calendarSelector.deactivateUI();
        this._timeSlider.deactivateUI();

        if (this._focusRestore && this._focusRestore.parentNode) {
            Jx.safeSetActive(this._focusRestore);
        }

        if (this._element.parentNode) {
            this._element.parentNode.removeChild(this._element);
        }

        this._host      = null;
        this._element   = null;            
        this._animation = null;
    };

    QuickEvent.prototype.deactivateUI = function () {
        _start("deactivateUI"); 

        if (this._host) {
            if (this._animation) {
                this._animation.cancel();
            } else {
                this._unhookEvents();
                this._timeSlider.unhookEvents();

                if (this._useAnimation) {
                    var element = (this._timeSliderElement ? this._timeSliderElement : this._element);
                    this._animation = WinJS.UI.Animation.fadeOut(element).then(this._shutdown, this._shutdown);
                } else {
                    this._shutdown();
                }
            }

            // Re-enable scrolling of an ancestor timeline.
            this.fire("setScrollable", true);
        }

        _stop("deactivateUI");
    };

    QuickEvent.prototype.isDirty = function () {
        return this._subject.value !== "" || this._location.value !== "";
    };

    QuickEvent.prototype.isOpen = function () {
        return this._host !== null;
    };

    //
    // Events
    //

    QuickEvent.prototype._bindEvents = function () {
        Jx.EventManager.addListener(Jx.root, "resizeWindow", this._onResizeWindow, this);

        if (this._allDayEvent) {
            this._element.addEventListener("keydown", this._onKeyDown, false);
        } else {
            this._timeSlider.getElement().addEventListener("keydown", this._onKeyDown, false);
        }
        this._subject.addEventListener("keydown", this._onKeyDownInputBox, false);
        this._location.addEventListener("keydown", this._onKeyDownInputBox, false);
        this._subject.addEventListener("input", this._refreshHintTextVisibility, false);
        this._location.addEventListener("input", this._refreshHintTextVisibility, false);
        this._element.addEventListener("click", this._onStopPropagation, false);
        this._element.addEventListener("MSPointerDown", this._onStopPropagation, false);
        this._element.addEventListener("MSPointerCancel", this._onStopPropagation, false);
        this._closeButton.addEventListener("click", this._onClickCloseButton, false);

        this._calendarSelector.on("showDropdown", this._ensureVisible);
        this._calendarSelector.on("CalendarSelectorHidden", this._onCalendarSelectorHidden);
        this._calendarSelector.on("createEvent", this._startEventDetails);

        this.on("lightDismiss", this.onDismiss);

        // listen for events from the time slider
        this.on("timeSliderBegin", this._onTimeSliderBegin);
        this.on("timeSliderEnd", this._onTimeSliderEnd);
    };

    QuickEvent.prototype._unhookEvents = function () {
        Jx.EventManager.removeListener(Jx.root, "resizeWindow", this._onResizeWindow, this);
        
        if (this._allDayEvent) {
            this._element.removeEventListener("keydown", this._onKeyDown, false);
        } else {
            this._timeSlider.getElement().removeEventListener("keydown", this._onKeyDown, false);
        }
        this._subject.removeEventListener("keydown", this._onKeyDownInputBox, false);
        this._location.removeEventListener("keydown", this._onKeyDownInputBox, false);
        this._subject.removeEventListener("input", this._refreshHintTextVisibility, false);
        this._location.removeEventListener("input", this._refreshHintTextVisibility, false);
        this._element.removeEventListener("click", this._onStopPropagation, false);
        this._element.removeEventListener("MSPointerDown", this._onStopPropagation, false);
        this._element.removeEventListener("MSPointerCancel", this._onStopPropagation, false);
        this._closeButton.removeEventListener("click", this._onClickCloseButton, false);

        this._calendarSelector.detach("showDropdown", this._ensureVisible);
        this._calendarSelector.detach("CalendarSelectorHidden", this._onCalendarSelectorHidden);
        this._calendarSelector.detach("createEvent", this._startEventDetails);

        this.detach("lightDismiss", this.onDismiss);

        // detach from events from the time slider
        this.detach("timeSliderBegin", this._onTimeSliderBegin);
        this.detach("timeSliderEnd", this._onTimeSliderEnd);
    };

    QuickEvent.prototype._onClickCloseButton = function (ev) {
        ev.stopPropagation();
        ev.preventDefault();

        this.onDismiss();
    };

    QuickEvent.prototype._onCalendarSelectorHidden = function () {
        this._subject.focus();
    };
    
    QuickEvent.prototype._onResizeWindow = function () {  // ev
        this.onDismiss(true);
    };

    QuickEvent.prototype._onStopPropagation = function (ev) {
        ev.stopPropagation();
        // Cancel focus change unless input box.  Moving focus can dismiss the on screen keyboard.
        if (ev.target.nodeName !== "INPUT") {
            ev.preventDefault();
        }
    };

    QuickEvent.prototype._onKeyDownInputBox = function (ev) {
        var keycode = ev.keyCode,
            stop    = true;

        if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
            if (keycode === Jx.KeyCode.s) {
                stop = false;
            }
        } else {
            if (keycode === Jx.KeyCode.enter) {
                stop = false;
            } else if (keycode === Jx.KeyCode.tab) {
                stop = false;
            } else if (keycode === Jx.KeyCode.escape) {
                stop = false;
            } else if (keycode === Jx.KeyCode.uparrow) {
                stop = false;
            } else if (keycode === Jx.KeyCode.downarrow) {
                stop = false;
            }
        }

        if (stop) {
            ev.stopPropagation();
        }
    };

    QuickEvent.prototype._refreshHintTextVisibility = function (ev) {
        var target = ev.target;

        if (target.id === "qeSubject") {
            $.id("qeSubjectHint").style.visibility = (target.value === "" ? "visible" : "hidden");
        } else if  (target.id === "qeLocation") {
            $.id("qeLocationHint").style.visibility = (target.value === "" ? "visible" : "hidden");
        }
    };

    QuickEvent.prototype._onKeyDown = function (ev) {
        var keycode = ev.keyCode;

        if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
            if (keycode === Jx.KeyCode.s) {
                this._createEvent();
            }
        } else {
            if (keycode === Jx.KeyCode.enter) {
                this.onDismiss();
            } else if (keycode === Jx.KeyCode.tab) {
                var tabElements = this._tabElements,
                    index       = tabElements.indexOf(document.activeElement),
                    tabLength   = tabElements.length;

                // if we currently don't have focus
                if (index < 0) {
                    index = 0;
                } else {
                    if (ev.shiftKey) {
                        index = (index - 1 + tabLength) % tabLength;
                    } else {
                        index = (index + 1) % tabLength;
                    }       
                } 

                tabElements[index].focus();
            } else if (keycode === Jx.KeyCode.escape) {
                this.deactivateUI();
            } else if (!this._allDayEvent) {
                if (keycode === Jx.KeyCode.uparrow) {
                    if (ev.target.id === "qeLocation") {
                        $.id("qeSubject").focus();
                    } else {
                        this._timeSlider._handleDecrement(ev.target);
                    }
                } else if (keycode === Jx.KeyCode.downarrow) {
                    if (ev.target.id === "qeSubject") {
                        $.id("qeLocation").focus();
                    } else {
                        this._timeSlider._handleIncrement(ev.target);
                    }
                }                            
            }
        }
        ev.stopPropagation();
        ev.preventDefault();
    };

    QuickEvent.prototype.onDismiss = function (force) {
        /// <param name="force" type="boolean">If true, close this control, its sub controls and don't set focus.  If false, only close this control unless a sub control is open.  In that case only call sub controls onDismiss function.</param>
        _start("onDismiss");

        if (this._host) {
            // Don't blur if we have something to restore focus to.
            if (this._subject === document.activeElement && !this._focusRestore) {
                this._subject.blur();
            }

            // Don't restore focus if the event is forced closed, since forced closed events are caused by things that will set their own focus.
            if (force) {
                this._focusRestore = null;
            }

            if (!this._calendarSelector.isOpen() || force) {
                if (this.isDirty()) {
                    this._createEvent();
                } else {
                    this.deactivateUI();
                }
            }

            this._calendarSelector.onDismiss();
        }
        
        _stop("onDismiss");
    };

    QuickEvent.prototype._isChild = function (queryEl) {
        var result = false;

        while (queryEl && queryEl.parentNode && !result) {
            if (queryEl.parentNode === this._element) {
                result = true;
            } else {
                queryEl = queryEl.parentNode;
            }
        }

        return result;
    };

    QuickEvent.prototype._onTimeSliderBegin = function () {
        // cache the current element with focus
        var activeEl = document.activeElement;

        // if this is a child of ours, remember it and blur it
        // this is a workaround to keep the field touch target from sticking during a resize
        if (activeEl && this._isChild(activeEl)) {
            this._focusedElAtSliderBegin = activeEl;
            activeEl.blur();
        }
    };

    QuickEvent.prototype._onTimeSliderEnd = function () {
        // restore the element focus if we remember one
        if (this._focusedElAtSliderBegin) {
            Jx.safeSetActive(this._focusedElAtSliderBegin);
            this._focusedElAtSliderBegin = null;
        }
    };

    //
    // Private members
    //

    QuickEvent.prototype._createOrRecycleHtml = function (item) {
        /// <param name="item">Layout information passed from the current view.</param>
            
        _start("_createOrRecycleHtml");
        // make sure the element exists

        if (this._allDayEvent) {
            if (this._element) {
                // Place quick event creation into the DOM.
                this._host.appendChild(this._element);
            } else {
                this._host.insertAdjacentHTML("beforeend", this._html());
                this._element = this._host.lastElementChild;
            }
        } else {
            if (this._timeSliderElement) {
                // Place the time slider into the DOM.
                this._host.appendChild(this._timeSliderElement);
            } else {
                this._host.insertAdjacentHTML("beforeend", Jx.getUI(this._timeSlider).html);
                this._timeSliderElement = this._host.lastElementChild;
            }

            this._timeSlider.activateUI(this._timeSliderElement);

            if (this._element) {
                // Move quick event creation into the time slider.
                this._timeSlider.getContentRegion().appendChild(this._element);
            } else {
                this._timeSlider.getContentRegion().insertAdjacentHTML("beforeend", this._html());
                this._element = this._timeSlider.getContentRegion().lastElementChild;
            }
        }

        function _setTooltip(id, resid, shortcut) {
            var message = (shortcut ? loc.loadCompoundString(resid, Jx.key.getLabel(shortcut)) : loc.getString(resid));

            new WinJS.UI.Tooltip($.id(id), {innerHTML: message});
        }

        _setTooltip("qeSubject", "EventTitleLabel");
        _setTooltip("qeLocation", "EventLocationLabel");
        _setTooltip("qeCaret", "EventCalendarLabel");

        var element = this._element;

        this._surface          = element.querySelector(".surface");
        this._glyph            = element.querySelector(".qe-glyph");
        this._subject          = element.querySelector(".qe-subject");
        this._location         = element.querySelector(".qe-location");
        this._textContainer    = element.querySelector(".textContainer");
        this._caret            = element.querySelector(".qe-caret");
        this._dropdownHolder   = element.querySelector(".dropdownHolder");
        this._closeButton      = $.id("qecClose");

        // The item object contains information about positioning in the month view.
        if (this._view === Manager.Views.month) {
            this._textContainer.style.paddingTop = Math.floor((item.height - 28) / 2) + "px";
            this._surface.style.height = item.height - 1 + "px";
            this._element.style.bottom = item.bottom + "px";

            var padding = (item.height < 35 ? 0 : "5px"),
                style   = this._dropdownHolder.style;

            style.paddingTop = padding;
            style.paddingBottom = padding;
        }

        if (this._allDayEvent) {
            element.setAttribute("data-status", "free");
        } else {
            element.setAttribute("data-status", "busy");            
        }

        _stop("_createOrRecycleHtml");
    };

    QuickEvent.prototype._updateAriaFlow = function () {
        var lastEntry = $("#CalendarCombo .entry").last()[0];

        if (lastEntry) {
            // this._calendarSelector.enableEventDetailsLink(true) must have been called or eventDetailsLink will not exist.
            var eventDetailsLink = $.id("eventDetailsLink");
            var calendarMenu     = $.id("calendarMenu");

            lastEntry.setAttribute("aria-flowto", eventDetailsLink.id);
            eventDetailsLink.setAttribute("x-ms-aria-flowfrom", lastEntry.id);    
            eventDetailsLink.setAttribute("aria-flowto", calendarMenu.id);
            calendarMenu.setAttribute("x-ms-aria-flowfrom", eventDetailsLink.id);
        }
    };

    QuickEvent.prototype._ensureVisible = function (ev) {
        _start("_ensureVisible");

        var flyout        = ev.data.container,
            originalEvent = ev.data.ev,
            style         = flyout.style,
            element       = this._element;

        style.position = "-ms-device-fixed";
        style.left     = 0;
        style.top      = 0;
        style.opacity  = 0;

        var screenWidth  = window.innerWidth;
        var screenHeight = window.innerHeight;

        var anchorLeft = 0;
        var anchorTop  = 0;
        var current    = element.querySelector(".qe-caret");
        var target     = $.id("calendar");

        // if we have a click point then use that location directly.
        if (originalEvent.pageX && originalEvent.pageY) {
            anchorLeft = originalEvent.pageX;
            anchorTop  = originalEvent.pageY;
        } else {
            if (this._allDayEvent) {
                if (this._view !== Manager.Views.day) {
                    target = this._host.parentNode;
                }
            }

            // get the center of the drop down 
            anchorLeft += Math.floor(current.offsetWidth / 2);
            anchorTop  += Math.floor(current.offsetHeight / 2);

            // Walk up DOM tree to get relative offset to the container we are hosted in.
            while (current !== target) {
                anchorLeft += current.offsetLeft - current.scrollLeft;
                anchorTop  += current.offsetTop - current.scrollTop;
                current = current.parentNode;
            }

        }

        setImmediate(function () {
            _start("_ensureVisible:inner");

            if (this.isOpen()) {
                var margin      = 10;
                var caretHeight = 12;
                var width       = flyout.offsetWidth;
                var height      = flyout.offsetHeight;
                var left        = anchorLeft - Math.floor(width / 2);
                var top         = anchorTop + caretHeight - window.pageYOffset;

                if (left < 0) {
                    left = margin;
                } else if (left + width >= screenWidth) {
                    left = screenWidth - width - margin;
                }

                if (top < 0) {
                    top = margin;
                } else if (top + height > screenHeight) {
                    top = screenHeight - height - margin;
                }

                style.left     = left + "px";
                style.top      = top + "px";
                style.opacity  = "";

                // This requires entries to be in the calendar drop down which is why it's in the setImmediate.  An alternative would be to fire two events beforeShowDropdown and afterShowDropdown and bind _updateAriaFlow to afterShowDropdown.
                this._updateAriaFlow();

                this._calendarSelector.setFocus();
            }
            
            _stop("_ensureVisible:inner");
        }.bind(this));

        _stop("_ensureVisible");
    };

    QuickEvent.prototype._setupTabIndex = function () {
        _start("_setupTabIndex");

        var tabElements = [this._subject];

        if (this._view !== Manager.Views.month) {
            tabElements.push(this._location);
        }

        tabElements.push(this._caret);

        if (!this._allDayEvent) {
            tabElements = tabElements.concat(this._timeSlider.getTouchTargets());
        }

        this._tabElements = tabElements;

        // Build a different aria flow order.  Leave out closeButton from tab order.
        var ariaFlowOrder = tabElements.concat([this._closeButton]);

        for (var i = 0, len = ariaFlowOrder.length; i < len; i++) {
            var to      = ariaFlowOrder[(i + 1) % len],
                from    = ariaFlowOrder[(i - 1 + len) % len],
                element = ariaFlowOrder[i];

            element.setAttribute("aria-flowto", to.id);
            element.setAttribute("x-ms-aria-flowfrom", from.id);
        }

        _stop("_setupTabIndex");
    };

    QuickEvent.prototype._updateSelectionUI = function (calendar) {
        this._calendar = calendar.calendar;
        this._updateColors();
    };

    QuickEvent.prototype._updateColors = function () {
        _start("_updateColors");

        var color = this._calendar.color;

        this._subject.style.color = color;
        this._glyph.style["background-color"] = color;
        
        // Add style rules to apply color for selection so selected text and the grippers use the same color.
        var styleElement = document.getElementById("quickEventStyles");
        if (!styleElement) {
            styleElement = document.createElement("STYLE");
            styleElement.setAttribute("id", "quickEventStyles");
            document.querySelector("head").appendChild(styleElement);
        }
        styleElement.innerHTML = "";
        styleElement.appendChild(document.createTextNode(".quickEvent ::selection {background-color: #" + ("00000" + color.toString(16)).slice(-6) + ";}"));

        _stop("_updateColors");
    };

    // I dislike the way we designed this.
    QuickEvent.prototype._getPlatform = function () {
        if (!this._platform) {
            // get and cache the platform
            var data = {};
            this.fire("getPlatform", data);
            this._platform = data.platform;
        }

        return this._platform;
    };

    QuickEvent.prototype._startEventDetails = function () {
        _start("_startEventDetails");

        var initEvent = {
            startDate:   this._date,
            allDayEvent: true,
            subject:     this._subject.value,
            location:    this._location.value,
            calendarId:  this._calendarSelector.activeCalendarItem().calendar.id,
        };

        if (!this._allDayEvent) {
            var sliderState = this._timeSlider.getState();

            initEvent.startDate   = sliderState.start;
            initEvent.endDate     = sliderState.end;
            initEvent.allDayEvent = false;
        }

        this.fire("createEvent", initEvent);

        // Normally the view is destroyed when changing but clean up values anyways.
        this._subject.value = "";
        this._location.value = "";

        _stop("_startEventDetails");
    };

    QuickEvent.prototype._createEvent = function () {
        _start("_createEvent");

        var MWPC         = Microsoft.WindowsLive.Platform.Calendar,
            startDate    = this._date,
            allDayEvent  = this._allDayEvent,
            endDate,
            busyStatus,
            reminder;
        
        if (allDayEvent) {
            // All day event should span from midnight to midnight
            startDate  = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            endDate    = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);

            busyStatus = MWPC.BusyStatus.free;
            reminder   = Calendar.DEFAULT_ALLDAY_EVENT_REMINDER;
        } else {
            busyStatus = MWPC.BusyStatus.busy;
            reminder   = Calendar.DEFAULT_EVENT_REMINDER;

            if (this._timeSlider) {
                var sliderState = this._timeSlider.getState();

                startDate = sliderState.start;
                endDate   = sliderState.end;
            } else {
                endDate = new Date(startDate.getTime() + Helpers.hourInMilliseconds);
            }

            if (endDate >= Calendar.LAST_DAY) {
                endDate = startDate;
            }
        }

        var targetEvent  = this._calendar.createEvent();

        targetEvent.subject           = this._subject.value;
        targetEvent.location          = this._location.value;
        targetEvent.startDate         = startDate;
        targetEvent.endDate           = endDate;
        targetEvent.busyStatus        = busyStatus;
        targetEvent.responseType      = MWPC.ResponseType.organizer;
        targetEvent.allDayEvent       = allDayEvent;
        targetEvent.reminder          = reminder;
        targetEvent.responseRequested = true;

        if (targetEvent.validate() === MWPC.Status.success) {
            try {
                targetEvent.commit();
                this._settings.set("lastCalendarId", this._calendar.id);
            } catch (e) {
                Jx.fault("quickEvent.js", "_createEvent", e);
            }
        }

        _stop("_createEvent");

        this._useAnimation = true;
        this.deactivateUI();
    };

    QuickEvent.prototype._setupCalendarCombo = function () {
        _start("_setupCalendarCombo");
        
        var platform = this._getPlatform();

        // Get the last selected calendar
        var data = {};
        this.fire("getSettings", data);
        this._settings = data.settings;
        var lastCalendarId = this._settings.get("lastCalendarId");

        // Unlike most calendar selector consumers, quickEvent does not need to save this collection since it overrides updateSelectionUI
        var calendars = CalendarSelector.getCalendarsForSelector(platform);

        this._calendarSelector.setCalendars(calendars);
        this._calendarSelector.updateSelectionById(lastCalendarId);
        
        _stop("_setupCalendarCombo");
    };

    //
    // Templates
    //

    QuickEvent.prototype._html = function () {
        var subjectHtml     = Jx.escapeHtml(loc.getString("EventTitleLabel")),
            locationHtml    = Jx.escapeHtml(loc.getString("EventLocationLabel")),
            closeButtonHtml = Jx.escapeHtml(loc.getString("CloseButton")),
            calendarHtml    = Jx.escapeHtml(loc.getString("EventCalendarLabel"));

        var allDay = (this._allDayEvent ? " allDayQuickEvent" : "");

        var html =
        '<div class="quickEvent' + allDay + '">' +
            '<div class="surface">' +
                '<div class="dropdownHolder">' +
                    '<div id="qeCaret" class="qe-caret" tabindex="3" aria-label="' + calendarHtml + '" role="button">&#xE099;</div></div>' +
                    '<div class="qe-glyph"><div class="glyphInner"></div></div>' +
                    '<div class="textContainer">' +
                        '<div id="qeSubjectHint" aria-hidden="true">' + subjectHtml + '</div>' +
                        '<input id="qeSubject" class="qe-subject" tabindex="1" maxlength="255" aria-label="' + subjectHtml + '" type="text" aria-readonly="false"/>' +
                        '<div id="qeLocationHint" aria-hidden="true">' + locationHtml + '</div>' +
                        '<input id="qeLocation" class="qe-location" tabindex="2" maxlength="255" aria-label="' + locationHtml + '" type="text" aria-readonly="false"/>' +
                    '</div>' +
                '<div id="qecClose" class="qec-close-button" role="button" aria-hidden="false">' + closeButtonHtml + '</div>' +
            '</div>' +
        '</div>';

        return html;
    };
});