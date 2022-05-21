
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />

/*jshint browser:true*/
/*global Calendar,Jx,People,$,Debug*/

Jx.delayDefine(Calendar.Controls, "MonthGrid", function () {

    function _start(evt) { Jx.mark("Calendar:MonthGrid." + evt + ",StartTA,Calendar"); }
    function _stop(evt)  { Jx.mark("Calendar:MonthGrid." + evt + ",StopTA,Calendar"); }

    var Helpers = Calendar.Helpers;
    var Templates = {};

    var _longDate = new Jx.DTFormatter("longDate");

    var MonthGrid = Calendar.Controls.MonthGrid = function() {
        this.initComponent();

        this._today = Calendar.getToday();
        this._date  = new Date(this._today);
        this._highlightDates = [];
    
        this._paused        = true;
        this._changeTimeout = null;

        // public fields (must be set before activation)
        this.showFreeBusy = true;  // whether to fetch free/busy data
        this.autoUpdate = true;  // whether to automatically respond to changes in the current day
        this.splitSelectFocus = false;  // whether to treat focusing and selecting a day as two different events

        // bind callbacks
        this._onClick   = this._onClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);

        this._onCollectionChanged     = this._onCollectionChanged.bind(this);
        this._handleCollectionChanged = this._handleCollectionChanged.bind(this);

        if (!MonthGrid._header) {
            Helpers.ensureFormats();

            MonthGrid._dayName    = new Jx.DTFormatter("{dayofweek.abbreviated(2)}");
            MonthGrid._dayNameAcc = new Jx.DTFormatter("dayofweek");

            MonthGrid._header = new Jx.DTFormatter("month year");
        }
    };

    Jx.augment(MonthGrid, Jx.Component);

    MonthGrid.PREV_MONTH_DAYS = 10;  // how many slots in the day array represent previous month dates?
    MonthGrid.PREV_MONTH_FIRST_DAY = 22;  // what is the date value of slot 0 in the previous month dates?
    MonthGrid.MAX_DAYS_PER_MONTH = 31;  // number of slots dedicated to the current month
    MonthGrid.NEXT_MONTH_DAYS = 13;  // how many slots in the day array represent next month dates?

    //
    // Static paging interface (see DatePicker._ensurePager for more about this interface)
    //

    MonthGrid.getItem = function(today, index) {
        return new Date(today.getFullYear(), today.getMonth() + index);
    };

    MonthGrid.getIndex = function(today, day) {
        return Helpers.getMonthsBetween(today, day);
    };

    MonthGrid.getLeft = function(today) {
        return Helpers.getMonthsBetween(Calendar.FIRST_DAY, today);
    };

    MonthGrid.getRight = function(today) {
        return Helpers.getMonthsBetween(today, Calendar.LAST_DAY);
    };

    MonthGrid.mergeDates = function(baseDate, newDate) {
        _start("mergeDates");

        var day   = new Date(baseDate),
            month = day.getMonth();

        // set our focused date
        day.setDate(newDate.getDate());

        // if the month changed, it means we set the date to a day past the end of
        // the month.  in that case, we reset the date to the last day of the
        // previous month.
        if (month !== day.getMonth()) {
            day.setDate(0);
        }

        _stop("mergeDates");

        return day;
    };


    //
    // Public
    //

    MonthGrid.prototype.setActive = function(active) {
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

    MonthGrid.prototype.focus = function() {
        this._focused.focus();
    };

    // Grid

    MonthGrid.prototype.getToday = function() {
        /// <summary>gets the currently configured today value</summary>
        /// <returns type="Date">a copy of the date the grid thinks is today</returns>

        return new Date(this._today);
    };

    MonthGrid.prototype.setToday = function(today) {
        /// <summary>sets what the grid thinks today is.  if today was also the focused date
        ///     this will also update the focused date.  if updating both, set today before setting
        ///     the focused date to avoid both moving unintentionally.</summary>
        /// <param name="today" type="Date">date to use for today.  it is copied.</param>

        this._updateToday(new Date(today));
        this._updateUiForToday();
    };

    MonthGrid.prototype.getFocusedDay = function() {
        /// <summary>retrieve the current focus date</summary>
        /// <returns type="Date">a copy of the date the grid is focused on</returns>

        return new Date(this._date);
    };

    MonthGrid.prototype.setFocusedDay = function(day) {
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
            if (!Helpers.isSameMonth(old, day)) {
                // quit any jobs we have pending for this month
                this._jobset.cancelAllChildJobs();
                clearTimeout(this._changeTimeout);

                // stop listening for event changes
                if (this._events) {
                    this._events.removeEventListener("collectionchanged", this._onCollectionChanged);
                    this._events.dispose();
                    this._events = null;
                }

                // update our ui for the new month
                this._updateUiForMonth(day);
                this._updateUiForToday();
                this._updateUiForHighlightedElements();

                // schedule getting new events if enabled
                if (this.showFreeBusy) {
                    this._jobset.addUIJob(this, this._getEvents, null, People.Priority.perfHighFidelity);
                }
            }

            // add the focused element to the right day
            this._updateFocusedElement(day.getDate());
        } else {
            this._dirty = true;
        }
    };

    MonthGrid.prototype.getFocusedElement = function() {
        /// <summary>retrieve the current focused element in the days</summary>
        /// <returns type="DOMElement">the element with focus, or null</returns>

        var focus = null;

        if (this._daysEl) {
            focus = this._daysEl.querySelector(":focus");
        }

        return focus;
    };

    MonthGrid.prototype.setHighlightDates = function(highlightDates) {
        /// <summary>sets the highlighted dates and updates the display if currently visible</summary>
        /// <param name="highlightDates" type="Array" elementType="Date">array of dates to highlight</param>

        this._highlightDates = [].concat(highlightDates);

        // if we've been activated, we need to update the highlights
        if (this._host) {
            this._updateUiForHighlightedElements();
        }
    };

    // Jx.Component

    MonthGrid.prototype.getUI = function(ui) {
        var info = this._getMonthInfo(this._date);
        this._info = info;

        ui.html = Templates.grid(info);
    };

    function qsa(el, query) {
        return Array.prototype.slice.call(el.querySelectorAll(query));
    }

    MonthGrid.prototype.activateUI = function(jobset) {
        // cache the host and create our focused element
        this._host = document.getElementById(this._id);
        this._focused = document.createElement("div");
        this._focused.className = "focused";
        this._focused.tabIndex  = 0;
        this._focused.setAttribute("role", "listitem");

        // cache the header text node
        this._header = this._host.querySelector(".header");

        // cache our sets of days
        this._daysEl   = this._host.querySelector(".days");
        this._days     = qsa(this._host, ".day");
        this._previous = qsa(this._host, ".previous");
        this._current  = qsa(this._host, ".current");
        this._next     = qsa(this._host, ".next");

        // activateUI implicitly resumes our state
        this.resume(jobset);
    };

    MonthGrid.prototype.resume = function(jobset) {
        _start("resume");

        this._jobset = jobset;

        if (this._paused) {
            // mark us as running
            this._paused = false;

            // update the ui if we need to
            if (this._dirty) {
                this._updateUiForMonth(this._date);
                this._dirty = false;
            }

            // highlight today and focus the right day, updating today if auto update is enabled
            if (this.autoUpdate) {
                this._updateToday(Calendar.getToday());
            }
            this._updateUiForToday();
            this._updateUiForHighlightedElements();
            this._updateFocusedElement(this._date.getDate());

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

            // schedule getting events if enabled
            if (this.showFreeBusy) {
                this._jobset.addUIJob(this, this._getEvents, null, People.Priority.perfHighFidelity);
            }
        }

        _stop("resume");
    };

    MonthGrid.prototype.pause = function() {
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

            if (this._events) {
                this._events.removeEventListener("collectionchanged", this._onCollectionChanged);
                this._events.dispose();
                this._events = null;
            }

            // don't do any remaining ui updates
            this._jobset.cancelAllChildJobs();
            clearTimeout(this._changeTimeout);
        }
    };

    MonthGrid.prototype.deactivateUI = function() {
        // deactivating implies pausing
        this.pause();

        // drop our refs to our jobset and host
        this._jobset = null;
        this._host   = null;
    };

    MonthGrid.prototype.ensureFocusRect = function() {
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

    MonthGrid.prototype._onDayChanged = function(today) {
        this._updateToday(today);
        this._updateUiForToday();
        this._updateUiForHighlightedElements();
    };

    // DOM Events

    MonthGrid.prototype._onClick = function(ev) {
        for (var el = ev.target; el !== ev.currentTarget; el = el.parentNode) {
            if (Jx.hasClass(el, "day")) {
                var date  = parseInt(el.innerText, 10),
                    month = this._date.getMonth();

                if (Jx.hasClass(el, "previous")) {
                    --month;
                } else if (Jx.hasClass(el, "next")) {
                    ++month;
                }

                this.fire("daySelected", new Date(this._date.getFullYear(), month, date));
                return;
            }
        }
    };

    MonthGrid.prototype._onKeyDown = function(ev) {
        var oldDate = this._date.getDate(),
            navKey = true,
            newDate;

        this.ensureFocusRect();

        // the arrow keys change our focus
        if (ev.keyCode === Jx.KeyCode.uparrow) {
            newDate = oldDate - 7;
        } else if (ev.keyCode === Jx.KeyCode.rightarrow) {
            newDate = oldDate + 1;
        } else if (ev.keyCode === Jx.KeyCode.downarrow) {
            newDate = oldDate + 7;
        } else if (ev.keyCode === Jx.KeyCode.leftarrow) {
            newDate = oldDate - 1;
        } else if (ev.keyCode === Jx.KeyCode.enter || ev.keyCode === Jx.KeyCode.space) {
            newDate = oldDate;
            navKey = false;
        }

        if (newDate !== undefined) {
            // if differentiating select and focus, modify the event here
            var eventName = (navKey && this.splitSelectFocus) ? "dayFocused" : "daySelected";

            // fire an event saying we've selected a new day
            this.fire(eventName, new Date(this._date.getFullYear(), this._date.getMonth(), newDate));

            // prevent the default behavior and focus our host
            ev.preventDefault();
        }
    };

    // WinRT Events

    MonthGrid.prototype._onCollectionChanged = function(ev) {
        if (ev.target === this._events) {
            if (!this._changeTimeout) {
                this._jobset.cancelAllChildJobs();
                this._changeTimeout = setTimeout(this._handleCollectionChanged, 1000);
            }
        }
    };

    MonthGrid.prototype._handleCollectionChanged = function() {
        this._events.lock();

        // schedule processing the events
        this._daysWithEvents = {};
        this._jobset.addUIJob(this, this._processEvents, null, People.Priority.perfHighFidelity);
    };

    // Helpers

    MonthGrid.prototype._updateToday = function(today) {
        if (!Helpers.isSameDate(today, this._today)) {
            if (Helpers.isSameDate(this._date, this._today)) {
                this._date = today;
            }

            this._today = today;
        }
    };

    Templates.dayNames = function() {
        // get the first day of the week
        var start = new Date(),
            html  = "";
        start.setDate(start.getDate() - start.getDay() + Helpers.firstDayOfWeek);

        for (var i = 0; i < 7; ++i) {
            html += "<div class='dayName' role='columnheader' aria-label='" + Jx.escapeHtml(MonthGrid._dayNameAcc.format(start)) + "'>" + Jx.escapeHtml(MonthGrid._dayName.format(start)) + "</div>";
            start.setDate(start.getDate() + 1);
        }

        return html;
    };

    function generateDays(className, day, first, last, start, end) {
        var html = "";

        for (var i = start; i < end; ++i) {
            html += '<div class="day ' + className;

            if (i < first || last < i) {
                html += ' hidden"';
            } else {
                html += '" aria-label="' + Jx.escapeHtml(_longDate.format(day)) + '"';
                day.setDate(day.getDate() + 1);
            }

            html += ' role="button"><span>' + i + '</span></div>';
        }

        return html;
    }

    Templates.days = function(data) {
        var html = "",
            day  = new Date(data.start);

        // all these end dates are 1 past the end in traditional iterator fashion
        html += generateDays("previous", day, data.previousFirst, data.previousLast, MonthGrid.PREV_MONTH_FIRST_DAY, MonthGrid.MAX_DAYS_PER_MONTH + 1);
        html += generateDays("current",  day, 1,                  data.last,         1,  MonthGrid.MAX_DAYS_PER_MONTH + 1);
        html += generateDays("next",     day, data.nextFirst,     data.nextLast,     1,  MonthGrid.NEXT_MONTH_DAYS + 1);

        return html;
    };

    Templates.grid = function(data) {
        return '<div id="' + data.id + '" class="monthGrid">' +
            '<div class="header" role="heading">' + Jx.escapeHtml(data.header) + '</div>' +
            '<div class="dayNames">' + Templates.dayNames(data) + '</div>' +
            '<div class="days">' +
                Templates.days(data) +
            '</div>' +
            '<div class="daysEnd"></div>' +
        '</div>';
    };

    MonthGrid.prototype._getMonthInfo = function(date) {
        var year = date.getFullYear();
        var month = date.getMonth();
        var desiredWeeks = 6;
        var daysPerWeek = 7;

        // get the first and last day of the month
        var first = new Date(year, month);
        var last  = new Date(year, month + 1, 0);

        // get the day of the week of the first and last days
        var firstDay = (first.getDay() - Helpers.firstDayOfWeek + daysPerWeek) % daysPerWeek;
        var lastDay = (last.getDay() - Helpers.firstDayOfWeek + daysPerWeek) % daysPerWeek;

        // start creating the info with some general ui information
        var info = {
            id:          this._id,
            header:      MonthGrid._header.format(date),
        };

        // get the start and end days of our month view
        // we allow up to a week of leading days and then as many days as need to fill out the 6 weeks

        firstDay = firstDay === 0 ? daysPerWeek : firstDay;

        var start = new Date(year, month, 1 - firstDay);

        info.start = start;
        info.previousFirst = new Date(year, month, 1 - firstDay).getDate();
        info.previousLast = new Date(year, month, 0).getDate();

        info.last = last.getDate();

        // figure out how many days we've made so far
        var dayCount = info.previousLast - info.previousFirst + 1;
        dayCount += info.last;

        var remainingCount = (desiredWeeks * daysPerWeek) - dayCount;
        var fillWeekCount = Math.floor(remainingCount / daysPerWeek) + 1;

        Debug.assert(fillWeekCount == 1 || fillWeekCount == 2, "unexpected number of weeks remaining: " + fillWeekCount);

        // figure out last date of next month
        var end = new Date(year, month + 1, (fillWeekCount * daysPerWeek - 1) - lastDay);

        info.end = end;
        info.nextFirst = 1;
        info.nextLast = end.getDate();

        // for querying events, we actually move the "end" one day further
        info.end.setDate(info.end.getDate() + 1);

        return info;
    };

    MonthGrid.prototype._updateUiForMonth = function(date) {
        // get our info for the new month
        var info = this._getMonthInfo(date);
        this._info = info;

        // update the header to represent the month
        this._header.firstChild.nodeValue = info.header;

        // update which days from the previous, current, and next months are hidden
        var current = new Date(info.start);
        this._updateDayArray(this._previous, current, info.previousFirst, info.previousLast, MonthGrid.PREV_MONTH_FIRST_DAY);
        this._updateDayArray(this._current,  current, 1,                  info.last,         1);
        this._updateDayArray(this._next,     current, info.nextFirst,     info.nextLast,     1);

        // remove the old "has events" classes
        for (var i = 0, len = this._days.length; i < len; ++i) {
            this._days[i].classList.remove("hasEvents");
        }
    };

    MonthGrid.prototype._updateUiForToday = function() {
        // remove the old today if there was one
        if (this._todayEl) {
            Jx.removeClass(this._header,  "today");
            Jx.removeClass(this._todayEl, "today");
            this._todayEl = null;
        }

        // add a new today if there is one
        if (this._current && Helpers.isSameMonth(this._today, this._date)) {
            this._todayEl = this._current[this._today.getDate() - 1];
            Jx.addClass(this._todayEl, "today");
            Jx.addClass(this._header,  "today");
        }
    };

    MonthGrid.prototype._updateDayArray = function(array, day, first, last, date) {
        for (var i = 0, len = array.length; i < len; ++i, ++date) {
            var el      = array[i],
                classes = el.classList;

            if (first <= date && date <= last) {
                classes.remove("hidden");

                el.setAttribute("aria-label", _longDate.format(day));
                day.setDate(day.getDate() + 1);
            } else {
                classes.add("hidden");
            }
        }
    };

    MonthGrid.prototype._updateFocusedElement = function(date) {
        /// <summary>moves the grid focus selector (outline around a particular date) into the
        ///     date cell indicated by the passed in day number.  this is usually being called
        ///     on multiple grids simultaneously, as the focus selector is kept in sync for not
        ///     only the visible grid, but also the offscreen grids used for scrolling.</summary>
        /// <param name="date" type="Number" integer="true">the day number in the month to put focus on</param>
        var focused = (document.activeElement === this._focused),
            el      = this._current[date - 1],
            label   = el.getAttribute("aria-label");

        el.appendChild(this._focused);
        this._focused.innerText = label;

        if (focused) {
            this._focused.setAttribute("aria-live", "polite");
            this._focused.focus();
        }
    };

    MonthGrid.prototype._updateUiForHighlightedElements = function() {
        var len, i, 
            info = this._info;

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
                day    = hd.getDate(),
                dateEl = null;

            if (Helpers.isSameMonth(hd, this._date)) {
                dateEl = this._current[day - 1];
            } else if (Helpers.isPreviousMonth(hd, this._date) && info.previousFirst <= day) {
                // this is in the previous month
                dateEl = this._previous[day - MonthGrid.PREV_MONTH_FIRST_DAY];
            } else if (Helpers.isNextMonth(hd, this._date) && day <= info.nextLast) {
                // it must be in the next month
                dateEl = this._next[day - 1];
            }

            if (dateEl) {
                Jx.addClass(dateEl, "highlightDate");
                this._highlightEls.push(dateEl);
            }
        }
    };

        // Events

    MonthGrid.prototype._getEvents = function() {
        // fire and event up the tree to get the calendar manager
        var result = {};
        this.fire("getPlatform", result);

        // get the events themselves
        var manager = result.platform.calendarManager,
            events  = manager.getEvents(this._info.start, this._info.end);

        // listen for changes on the events
        events.addEventListener("collectionchanged", this._onCollectionChanged);

        // and cache them
        this._events         = events;
        this._daysWithEvents = {};

        // process the events
        this._jobset.addUIJob(this, this._processEvents, null, People.Priority.perfHighFidelity);
    };

    MonthGrid.prototype._processEvents = function() {
        var days = this._daysWithEvents,
            day  = 0,
            daysLen = days.length;

        var quit   = false,
            events = this._events;

        for (var i = 0, len = events.count; i < len && !quit; ++i) {
            var ev  = events.item(i);

            if (ev !== null) {
                var end = ev.endDate;

                if (day < end) {
                    var start = ev.startDate;

                    if (day < start) {
                        day = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    }

                    while (day < end && !quit) {
                        var index;

                        if (Helpers.isSameMonth(day, this._date)) {
                            // the day is in the current month.  adjust the index for
                            // the elements we store from the previous month.
                            index = day.getDate() - 1 + MonthGrid.PREV_MONTH_DAYS;
                        } else if (day < this._date) {
                            // the day is in the previous month.  adjust the index for
                            // the fact that our first element represents a date in
                            // the previous month.
                            index = day.getDate() - MonthGrid.PREV_MONTH_FIRST_DAY;
                        } else {
                            // the day is in the next month.  adjust the index for the
                            // elements that we store from the previous and current
                            // months.
                            index = day.getDate() - 1 + (MonthGrid.MAX_DAYS_PER_MONTH + MonthGrid.PREV_MONTH_DAYS);
                        }

                        // we shouldn't continue to do work if we reach an element that
                        // spans past our view.
                        if (index >= daysLen) {
                            quit = true;
                        } else {
                            days[index] = true;
                            day.setDate(day.getDate() + 1);
                        }
                    }
                }
            }
        }

        // finally we begin setting the proper classes
        this._jobset.addUIJob(this, this._setHasEventsClasses, null, People.Priority.perfHighFidelity);
    };

    MonthGrid.prototype._setHasEventsClasses = function() {
        for (var i = 0, len = this._days.length; i < len; ++i) {
            if (i in this._daysWithEvents) {
                Jx.addClass(this._days[i], "hasEvents");
            } else {
                Jx.removeClass(this._days[i], "hasEvents");
            }
        }

        this._events.unlock();
        this._changeTimeout = null;
    };

});

