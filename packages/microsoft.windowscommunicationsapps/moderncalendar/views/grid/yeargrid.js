
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />

/*jshint browser:true*/
/*global Calendar,Jx,$*/

Jx.delayDefine(Calendar.Controls, "YearGrid", function () {

    function _start(evt) { Jx.mark("Calendar:YearGrid." + evt + ",StartTA,Calendar"); }
    function _stop(evt)  { Jx.mark("Calendar:YearGrid." + evt + ",StopTA,Calendar"); }

    var Helpers = Calendar.Helpers;
    var Templates = {};

    var YearGrid = Calendar.Controls.YearGrid = function() {
        this.initComponent();

        this._today = Calendar.getToday();
        this._date  = new Date(this._today);
        this._highlightDates = [];
    
        this._paused        = true;
        this._changeTimeout = null;

        // public fields (must be set before activation)
        this.autoUpdate = true;  // whether to automatically respond to changes in the current day
        this.splitSelectFocus = false;  // whether to treat focusing and selecting a day as two different events

        // bind callbacks
        this._onClick   = this._onClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);

        if (!YearGrid._header) {
            Helpers.ensureFormats();

            YearGrid._header = new Jx.DTFormatter("year");
            YearGrid._monthYear = new Jx.DTFormatter("month year");
            YearGrid._month = new Jx.DTFormatter("month.abbreviated");
        }
    };

    Jx.augment(YearGrid, Jx.Component);

    //
    // Static paging interface (see DatePicker._ensurePager for more about this interface)
    //

    YearGrid.getItem = function(today, index) {
        return new Date(today.getFullYear() + index, 0, 1);
    };

    YearGrid.getIndex = function(today, day) {
        return Helpers.getYearsBetween(today, day);
    };

    YearGrid.getLeft = function(today) {
        return Helpers.getYearsBetween(Calendar.FIRST_DAY, today);
    };

    YearGrid.getRight = function(today) {
        return Helpers.getYearsBetween(today, Calendar.LAST_DAY);
    };

    YearGrid.mergeDates = function(baseDate, newDate) {
        _start("mergeDates");

        var day = new Date(baseDate.getFullYear(), newDate.getMonth(), 1);

        _stop("mergeDates");

        return day;
    };

    //
    // Public
    //

    YearGrid.prototype.setActive = function(active) {
        /// <summary>used to select the current grid as the active one for receiving user interaction</summary>
        /// <param name="active" type"Boolean">whether to mark this grid as active</param>

        if (active) {
            if (!this._paused) {
                try {
                    this._focused.setAttribute("aria-live", "polite");
                    this._focused.setActive();
                } catch (ex) {
                    // this can happen if our ui is disabled, such as when the "add
                    // account" dialog is currently visible.  this should happen
                    // extremely rarely, so a try/catch is not overly expensive.
                }
            } else {
                // remember that we need to try to setActive the next time we resume
                this._setActive = true;
            }
        } else {
            this._focused.setAttribute("aria-live", "off");
        }
    };

    YearGrid.prototype.focus = function() {
        this._focused.focus();
    };

    // Grid

    YearGrid.prototype.getToday = function() {
        /// <summary>gets the currently configured today value</summary>
        /// <returns type="Date">a copy of the date the grid thinks is today</returns>

        return new Date(this._today);
    };

    YearGrid.prototype.setToday = function(today) {
        /// <summary>sets what the grid thinks today is.  if today was also the focused date
        ///     this will also update the focused date.  if updating both, set today before setting
        ///     the focused date to avoid both moving unintentionally.</summary>
        /// <param name="today" type="Date">date to use for today.  it is copied.</param>

        this._updateToday(new Date(today));
        this._updateUiForToday();
    };

    YearGrid.prototype.getFocusedDay = function() {
        /// <summary>retrieve the current focus date</summary>
        /// <returns type="Date">a copy of the date the grid is focused on</returns>

        return new Date(this._date);
    };

    YearGrid.prototype.setFocusedDay = function(day) {
        /// <summary>sets the day currently focused on in the grid.  this method is also implicitly
        ///     part of the Grid interface to be used by the DatePicker to interact with the MonthGrid
        ///     and YearGrid.  If the grid is active on the screen this will also result in the grid
        ///     refocusing on the actual date, potentially triggering a scroll and recalculating the
        ///     new neighbors of the month in view, including free/busy data</summary>

        // swap our focused day
        var old = this._date;
        this._date = new Date(day);

        // we only need to do more work if we have ui
        if (!this._paused) {
            if (!Helpers.isSameYear(old, day)) {
                // quit any jobs we have pending for this month
                this._jobset.cancelAllChildJobs();

                // update our ui for the new month
                this._updateUiForYear(day);
                this._updateUiForToday();
                this._updateUiForHighlightedElements();
            }

            // add the focused element to the right day
            this._updateFocusedElement(day.getMonth());
        } else {
            this._dirty = true;
        }
    };

    YearGrid.prototype.getFocusedElement = function() {
        /// <summary>retrieve the current focused element in the days</summary>
        /// <returns type="DOMElement">the element with focus, or null</returns>

        var focus = null;

        if (this._monthsEl) {
            focus = this._monthsEl.querySelector(":focus");
        }

        return focus;
    };

    YearGrid.prototype.setHighlightDates = function(highlightDates) {
        /// <summary>sets the highlighted dates and updates the display if currently visible</summary>
        /// <param name="highlightDates" type="Array" elementType="Date">array of dates to highlight</param>

        this._highlightDates = [].concat(highlightDates);

        // if we've been activated, we need to update the highlights
        if (this._host) {
            this._updateUiForHighlightedElements();
        }
    };

    // Jx.Component

    YearGrid.prototype.getUI = function(ui) {
        var info = this._getYearInfo(this._date);
        this._info = info;

        ui.html = Templates.grid(info);
    };

    function qsa(el, query) {
        return Array.prototype.slice.call(el.querySelectorAll(query));
    }

    YearGrid.prototype.activateUI = function(jobset) {
        // cache the host and create our focused element
        this._host = document.getElementById(this._id);
        this._focused = document.createElement("div");
        this._focused.className = "focused";
        this._focused.tabIndex  = 0;
        this._focused.setAttribute("role", "listitem");

        // cache the header text node
        this._header = this._host.querySelector(".header");

        // cache our sets of days
        this._monthsEl = this._host.querySelector(".months");
        this._months   = qsa(this._host, ".month");

        // activateUI implicitly resumes our state
        this.resume(jobset);
    };

    YearGrid.prototype.resume = function(jobset) {
        _start("resume");

        this._jobset = jobset;

        if (this._paused) {
            // mark us as running
            this._paused = false;

            // update the ui if we need to
            if (this._dirty) {
                this._updateUiForYear(this._date);
                this._dirty = false;
            }

            // highlight today and focus the right day, updating today if auto update is enabled
            if (this.autoUpdate) {
                this._updateToday(Calendar.getToday());
            }
            this._updateUiForToday();
            this._updateUiForHighlightedElements();
            this._updateFocusedElement(this._date.getMonth());

            if (this._setActive) {
                this._focused.setActive();
                this._setActive = false;
            }

            // listen for day changes if auto update enabled
            if (this.autoUpdate) {
                Calendar.addListener("dayChanged", this._onDayChanged, this);
            }

            // hook events
            this._host.addEventListener("click",   this._onClick,   false);
            this._host.addEventListener("keydown", this._onKeyDown, false);
        }

        _stop("resume");
    };

    YearGrid.prototype.pause = function() {
        if (!this._paused) {
            // mark us as paused
            this._paused = true;

            // unhook events
            this._host.removeEventListener("keydown", this._onKeyDown, false);
            this._host.removeEventListener("click",   this._onClick,   false);

            // only unregister if we registered
            if (this.autoUpdate) {
                Calendar.removeListener("dayChanged", this._onDayChanged, this);
            }

            // don't do any remaining ui updates
            this._jobset.cancelAllChildJobs();
        }
    };

    YearGrid.prototype.deactivateUI = function() {
        // deactivating implies pausing
        this.pause();

        // drop our refs to our jobset and host
        this._jobset = null;
        this._host   = null;
    };

    YearGrid.prototype.ensureFocusRect = function() {
        /// <summary>ensures that the focused element does not have the win-hidefocus class which
        ///     the WinJS.UI.Flyout can apply when showing.  If this is set, then the focus rect
        ///     will never be visible on the initial view that opens, which we do not want</summary>

        var focused = this._focused;

        // make sure our focus has keyboard visibility
        if (focused.classList.contains("win-hidefocus")) {
            $(focused).removeClass("win-hidefocus");
        }
    };

    //
    // Private
    //

    // JX Events

    YearGrid.prototype._onDayChanged = function(today) {
        this._updateToday(today);
        this._updateUiForToday();
        this._updateUiForHighlightedElements();
    };

    // DOM Events

    YearGrid.prototype._onClick = function(ev) {
        for (var el = ev.target; el !== ev.currentTarget; el = el.parentNode) {
            if (Jx.hasClass(el, "month")) {
                var month = parseInt(el.getAttribute("data-month"), 10),
                    year  = this._date.getFullYear();

                this.fire("daySelected", new Date(year, month, 1));
                return;
            }
        }
    };

    YearGrid.prototype._onKeyDown = function(ev) {
        var oldMonth = this._date.getMonth(),
            navKey = true,
            newMonth;

        this.ensureFocusRect();

        // the arrow keys change our focus
        if (ev.keyCode === Jx.KeyCode.uparrow) {
            newMonth = oldMonth - 3;
        } else if (ev.keyCode === Jx.KeyCode.rightarrow) {
            newMonth = oldMonth + 1;
        } else if (ev.keyCode === Jx.KeyCode.downarrow) {
            newMonth = oldMonth + 3;
        } else if (ev.keyCode === Jx.KeyCode.leftarrow) {
            newMonth = oldMonth - 1;
        } else if (ev.keyCode === Jx.KeyCode.enter || ev.keyCode === Jx.KeyCode.space) {
            newMonth = oldMonth;
            navKey = false;
        }

        if (newMonth !== undefined) {
            // if differentiating select and focus, modify the event here
            var eventName = (navKey && this.splitSelectFocus) ? "dayFocused" : "daySelected";

            // fire an event saying we've selected a new day
            this.fire(eventName, new Date(this._date.getFullYear(), newMonth, 1));

            // prevent the default behavior and focus our host
            ev.preventDefault();
        }
    };

    // Helpers

    YearGrid.prototype._updateToday = function(today) {
        if (!Helpers.isSameMonth(today, this._today)) {
            if (Helpers.isSameMonth(this._date, this._today)) {
                this._date = today;
            }

            this._today = today;
        }
    };

    Templates.months = function(data) {
        var html = "";

        for (var i = 0; i < 12; ++i) {
            var date = new Date(data.date.getFullYear(), i, 1);
            html += '<div class="month" aria-label="' + 
                    Jx.escapeHtml(YearGrid._monthYear.format(date)) + 
                    '" role="button" data-month="' + i + '"><span>' + 
                    Jx.escapeHtml(YearGrid._month.format(date)) + '</span></div>';
        }

        return html;
    };

    Templates.grid = function(data) {
        return '<div id="' + data.id + '" class="yearGrid">' +
            '<div class="header" role="heading">' + Jx.escapeHtml(YearGrid._header.format(data.date)) + '</div>' +
            '<div class="months">' +
                Templates.months(data) +
            '</div>' +
        '</div>';
    };

    YearGrid.prototype._getYearInfo = function(date) {
        // start creating the info with some general ui information
        var info = {
            id:   this._id,
            date: date,
        };

        return info;
    };

    YearGrid.prototype._updateUiForYear = function(date) {
        // get our info for the new month
        var info = this._getYearInfo(date);
        this._info = info;

        // update the header to represent the month
        this._header.firstChild.nodeValue = Jx.escapeHtml(YearGrid._header.format(date));

        for (var i = 0; i < 12; ++i) {
            var newDate = new Date(date.getFullYear(), i, 1);
            var month = this._months[i];
            month.setAttribute("aria-label", Jx.escapeHtml(YearGrid._monthYear.format(newDate)));
        }
    };

    YearGrid.prototype._updateUiForToday = function() {
        var newEl   = null,
            todayEl = this._todayEl;

        // would we show the new today?
        if (this._months && Helpers.isSameYear(this._today, this._date)) {
            newEl = this._months[this._today.getMonth()];
        }

        // if the new element would differ from the old one, update
        if (todayEl !== newEl) {
            // remove the old today if there was one
            if (todayEl) {
                Jx.removeClass(this._header,  "today");
                Jx.removeClass(todayEl, "today");
                this._todayEl = null;
            }

            // add a new today if there is one
            if (newEl) {
                this._todayEl = newEl;
                Jx.addClass(newEl, "today");
                Jx.addClass(this._header,  "today");
            }
        }
    };

    YearGrid.prototype._updateFocusedElement = function(monthOrdinal) {
        /// <summary>moves the grid focus selector (outline around a particular date) into the
        ///     date cell indicated by the passed in day number.  this is usually being called
        ///     on multiple grids simultaneously, as the focus selector is kept in sync for not
        ///     only the visible grid, but also the offscreen grids used for scrolling.</summary>
        /// <param name="monthOrdinal" type="Number" integer="true">the month number (Jan=0) in the year to put focus on</param>

        var focused = (document.activeElement === this._focused),
            el      = this._months[monthOrdinal],
            label   = el.getAttribute("aria-label");

        el.appendChild(this._focused);
        this._focused.innerText = label;

        if (focused) {
            this._focused.setAttribute("aria-live", "polite");
            this._focused.focus();
        }
    };

    YearGrid.prototype._updateUiForHighlightedElements = function() {
        var len, i;

        // remove old highlights if any
        if (this._highlightEls && this._highlightEls.length > 0) {
            for (i = 0, len = this._highlightEls.length; i < len; ++i) {
                Jx.removeClass(this._highlightEls[i], "highlightDate");
            }
        }

        // clear old highlights or allocate new list
        this._highlightEls = [];

        // add new highlights if any
        for (i = 0, len = this._highlightDates.length; i < len; ++i) {

            var hd     = this._highlightDates[i],
                month  = hd.getMonth(),
                dateEl = null;

            if (Helpers.isSameYear(hd, this._date)) {
                dateEl = this._months[month];
            }

            if (dateEl) {
                Jx.addClass(dateEl, "highlightDate");
                this._highlightEls.push(dateEl);
            }
        }
    };
});

