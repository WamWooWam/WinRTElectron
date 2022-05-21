
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />
/// <reference path="..\Helpers\Helpers.js" />
/// <reference path="..\datepicker\DatePickerAnchor.js" />
/// <reference path="..\Timeline\Timeline.js" />

/*jshint browser:true*/
/*global Jx,Calendar,WinJS,People,Debug,setImmediate,requestAnimationFrame*/

Jx.delayDefine(Calendar.Views, "Month", function () {

    function _info(evt)  { Jx.mark("Calendar:Month." + evt + ",Info,Calendar"); }
    function _start(evt) { Jx.mark("Calendar:Month." + evt + ",StartTA,Calendar"); }
    function _stop(evt)  { Jx.mark("Calendar:Month." + evt + ",StopTA,Calendar");  }

    var Helpers = Calendar.Helpers;
    var Animation = WinJS.UI.Animation;
    var DatePickerAnchor = Calendar.Controls.DatePickerAnchor;

    var _header = new Jx.DTFormatter("month year");
    var _longDate = new Jx.DTFormatter("longDate");

    var Month = Calendar.Views.Month = function /* @constructor */() {
        _start("ctor");

        // component initialization
        this.initComponent();
        this._id = "calMonth";

        // set up our event handlers
        this._recycler = this._recycler.bind(this);
        this._renderer = this._renderer.bind(this);

        this._onClick       = this._onClick.bind(this);
        this._onGridResize  = this._onGridResize.bind(this);
        this._onKeyDownNav  = this._onKeyDownNav.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);

        // Timeline data
        this._first = Calendar.FIRST_DAY;
        this._last = Calendar.LAST_DAY;

        this._updateToday(Calendar.getToday());

        this._focusedDate  = this._today.getDate();
        this._focusedIndex = 0;
        this._workerIds = {};

        // set default animation
        this._loadAnimation = Animation.enterPage;

        // initialize date time formatters
        Helpers.ensureFormats();

        _stop("ctor");
    };

    Month.prototype.setFocusedDay = function (/* @type(Date) */ day) {
        // Get the date without hours, minutes or seconds. We do this to circumvent
        // potential rounding errors when the date is passed back to the view manager.
        day = new Date(day.getFullYear(), day.getMonth(), day.getDate());

        // force date into valid range
        if (day < this._first)
        {
            _info("Day for " + Month.NAME + " is out of bounds (" + day + " < " + this._first + ").");
            day = this._first;
        }
        else if (day > this._last)
        {
            _info("Day for " + Month.NAME + " is out of bounds (" + day + " > " + this._last + ").");
            day = this._last;
        }

        // set our focused index
        this._focusedDate  = day.getDate();
        this._focusedIndex = Helpers.getMonthsBetween(this._today, day);

        if (this._timeline) {
            this._timeline.setFocusedIndex(this._focusedIndex);
        }
    };

    Month.prototype.getFocusedDay = function () {
        if (this._focusedDate) {
            var day   = new Date(this._today.getFullYear(), this._today.getMonth() + this._focusedIndex),
                month = day.getMonth();
            day.setDate(this._focusedDate);

            if (day.getMonth() !== month) {
                day.setDate(0);
            }

            return day;
        } else {
            if (this._focusedIndex === 0) {
                Debug.assert(this._today);
                return this._today;
            }

            return new Date(this._today.getFullYear(), this._today.getMonth() + this._focusedIndex, 1);
        }
    };

    Month.prototype.focusEvent = function (eventInfo) {
        /// <summary>Shifts the current view so that a particular date range is in view</summary>
        /// <param name="eventInfo">Object containing at least the following event info: startDate, endDate, allDayEvent</param>

        this.setFocusedDay(eventInfo.startDate);
    };

    Month.prototype.containsDate = function (date) {
        var firstDate = new Date(this._today.getFullYear(), this._today.getMonth() + this._focusedIndex),
            nextFirst = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1);
        return date >= firstDate && date < nextFirst;
    };

    Month.prototype.setLoadAnimation = function (animation) {
        this._loadAnimation = animation;
    };

    Month.prototype.showDatePicker = function() {
        this._showDatePicker();
    };

    Month.NAME = "Calendar.Views.Month";

    //
    // Loc
    //

    var Loc = Calendar.Loc;

    Month.OVERFLOW_EVENTS = Loc.getFormatFunction("OverflowEvents");
    Month.ACC_DAY = Loc.getFormatFunction("AccMonthDay");
    Month.ACC_OVERFLOW = Loc.getFormatFunction("AccMonthOverflow");

    //
    // JX component methods
    //

    Jx.augment(Month, Jx.Component);

    Month.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='monthview'><div class='dp-anchor'></div></div>";
    };

    Month.prototype.activateUI = function (jobset) {
        _start("activateUI");

        // save params
        this._jobset = jobset;

        // Keep reference to the month host
        this._host = document.getElementById(this._id);
        this._dpAnchor = this._host.querySelector(".dp-anchor");
        this._getWorker();

        // listen for day changes
        this._updateToday(Calendar.getToday());
        Calendar.addListener("dayChanged", this._onDayChanged, this);

        // get our ui settings
        var data = {};
        this.fire("getSettings", data);

        // create our timeline control
        var options = { hookWheel: true };
        var timeline = this._timeline = new Calendar.Controls.Timeline(this._host, this._jobset, this, this._renderer, this._recycler, options);
        timeline.setAlwaysShowArrows(data.settings.get("alwaysShowArrows"));

        // listen for arrow setting changes
        this.on("showArrows", this._onShowArrows);
        
        // listen for selection events from the date picker
        this.on("dateSelected", this._onDatePickerDateSelected);

        this.on("setScrollable", this._onSetScrollable);

        // Hook events
        timeline.addListener("focusChanged", this._onFocusChanged, this);
        timeline.addListener("itemRealized", this.onItemRealized,  this);
        timeline.addListener("itemRemoved",  this.onItemRemoved,   this);

        // Now initialize the timeline
        timeline.initialize(this._focusedIndex);

        // Handle resizing correctly
        this.on("resizeWindow", this._onResizeWindow);

        // Listen for key and pointer events
        this._host.addEventListener("keydown", this._onKeyDownNav, false);
        this._host.addEventListener("MSPointerDown", this._onPointerDown, false);
        this._host.addEventListener("click", this._onClick, false);

        // Animate
        var header     = this._host.querySelector(".header"),
            dayHeaders = this._host.querySelector(".dayHeaders"),
            grid       = this._host.querySelector(".grid");

        var onAnimationDone = function () {
            this.fire("viewReady");
        }.bind(this);

        this._loadAnimation([header, [dayHeaders, grid]]).done(onAnimationDone, onAnimationDone); // complete and error callbacks

        _stop("activateUI");
    };

    Month.prototype.deactivateUI = function () {
        _start("deactivateUI");
        if (this._quickEvent) {
            this._quickEvent.deactivateUI();
            this._quickEvent = null;
        }

        // shut down date picker
        if (this._datePicker) {
            this.removeChild(this._datePicker);
            this._datePicker.shutdownUI();
            this._datePicker = null;
        }
        this._dpAnchor = null;

        if (this._timeline) {
            this._timeline.shutdown();

            this._timeline.removeListener("itemRemoved",  this.onItemRemoved,   this);
            this._timeline.removeListener("itemRealized", this.onItemRealized,  this);
            this._timeline.removeListener("focusChanged", this._onFocusChanged, this);

            this._timeline = null;
        }

        this.detach("showArrows", this._onShowArrows);
        this.detach("dateSelected", this._onDatePickerDateSelected);
        this.detach("setScrollable", this._onSetScrollable);

        this._host.removeEventListener("keydown", this._onKeyDownNav, false);
        this._host.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._host.removeEventListener("click", this._onClick, false);
        this._host = null;

        this._worker.removeListener("Month/getEvents",     this._onGetEvents,     this);
        this._worker.removeListener("Month/eventChanged",  this._onEventChanged,  this);
        this._worker.removeListener("Month/eventsChanged", this._onEventsChanged, this);
        this._worker = null;

        Calendar.removeListener("dayChanged", this._onDayChanged, this);
    
        this.detach("resizeWindow", this._onResizeWindow);

        _stop("deactivateUI");
    };

    Month.prototype._onSetScrollable = function(ev) {
        if (this._timeline) {
            this._timeline.setScrollable(ev.data);
        }
    };

    //
    // Timeline DataSource
    //

    Month.prototype.left = function () {
        return this._left;
    };

    Month.prototype.right = function () {
        return this._right;
    };

    Month.prototype.getItem = function (index) {
        _start("getItem");

        if (index < -this._left) {
            throw new Error("Index for " + Month.NAME + " is out of bounds (" + String(index) + " < " + String(-this._left) + ").");
        }

        if (index > this._right) {
            throw new Error("Index for " + Month.NAME + " is out of bounds (" + String(index) + " > " + String(this._right) + ").");
        }

        var date              = new Date(this._today.getFullYear(), this._today.getMonth() + index),
            firstDayOffset    = this._getFirstDayOffset(date.getFullYear(), date.getMonth()),
            numDays           = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
            numWeeks          = Math.ceil((numDays + firstDayOffset) / 7),
            targetEventHeight = numWeeks < 6 ? 40 : 30;

        var item = {
            date:              date,
            firstDayOffset:    firstDayOffset,
            numDays:           numDays,
            numWeeks:          numWeeks,
            targetEventHeight: targetEventHeight
        };

        _stop("getItem");
        return item;
    };

    Month.prototype.onItemRealized = function (data) {
        _start("onItemRealized");

        var item = data.item,
            el   = data.el;
        el.jobset = data.jobset;

        // cache element pointers
        el._events = el.querySelector(".events");
        el._header = el.querySelector(".header");
        el._grid   = el.querySelector(".grid");
        el._days   = el.querySelector(".days").childNodes;
        el._days._today = null;

        // calculate our grid hight
        if (!this._gridHeight) {
            _start("onItemRealized:gridHeight");
            this._gridHeight = el._grid.offsetHeight;
            _stop("onItemRealized:gridHeight");
        }

        // fetch our events early to allow our worker as much time as possible to
        // process them and build our html.
        item.gridHeight = this._gridHeight;
        item.dayHeight  = Math.floor((this._gridHeight / item.numWeeks) - 3);
        this._getEvents(item, el);

        // our resize handler might be called before we finish updating the element
        // below.  bind it now.
        el._onResize = this._refreshUI.bind(this, item, el);

        el.jobset.addUIJob(this, this._updateRecycled, [item, el], People.Priority.realizeItem);
        _stop("onItemRealized");
    };

    Month.prototype.onItemRemoved = function (data) {
        _start("onItemRemoved");

        var item = data.item,
            el   = data.el;

        // cancel the event processing for this item
        this._worker.postCommand("Month/cancel", null, item.workerId);
        delete this._workerIds[item.workerId];

        // hide events
        if (el._eventAnimation) {
            el._eventAnimation.cancel();
            el._eventAnimation = null;
        }

        el._events.style.opacity = 0;
        el.removeEventListener("keydown", el._onKeyDown, false);

        _stop("onItemRemoved");
    };

    Month.prototype._onShowArrows = function (ev) {
        if (!ev.handled) {
            this._timeline.setAlwaysShowArrows(ev.data.value);
            ev.handled = true;
        }
    };

    Month.prototype._onDatePickerDateSelected = function (ev) {
        if (!ev.handled) {
            ev.handled = true;
            this.setFocusedDay(ev.data);
        }
    };

    Month.prototype._onDayChanged = function (today) {
        var old        = this._today,
            datePicker = this._datePicker;
        this._updateToday(today);

        // hide and update the datepicker
        if (datePicker) {
            datePicker.hide();
            datePicker.setToday(today);
        }

        // if we we're focused on today, update our index
        if (this._focusedIndex) {
            var offset = Helpers.getMonthsBetween(old, today);
            this._focusedIndex -= offset;
        } else {
            if (old.getDate() === this._focusedDate) {
                this._focusedDate = today.getDate();
            }
        }

        // re-initialize the timeline
        this._timeline.initialize(this._focusedIndex);
    };

    Month.prototype._updateToday = function (today) {
        if (!this._today || !Helpers.isSameDate(today, this._today)) {
            this._today = today;

            Debug.assert(this._first.getFullYear() < this._last.getFullYear());
            this._left  = Helpers.getMonthsBetween(this._first, today);
            this._right = Helpers.getMonthsBetween(today, this._last);
        }
    };

    Month.prototype._renderer = function (item) {
        _start("_renderer");

    var html = 
        '<div class="month recycling">' +
            '<div class="container">' +
                '<div class="header">' + 
                    '<div class="dateAnchor">' + 
                        '<div class="anchorText" role="heading" tabindex="0">' + 
                            Jx.escapeHtml(this._getHeaderText(item)) + 
                        '</div>' + 
                        '<div class="dateChevron" aria-hidden="true">&#xE09D;</div>' + 
                    '</div>' + 
                '</div>' +
                '<div class="dayHeaders">' +
                    this._getDayHeadersHtml() +
                '</div>' +
                '<div class="grid">' +
                    '<div class="events" role="list"></div>' +
                    '<div class="days" role="list">' + this._getDaysHtml() + '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

        _stop("_renderer");
        return html;
    };

    Month.prototype._recycler = function (old, data) {
        _start("_recycler");

        var item = data.item,
            el   = data.el;

        // set header text
        DatePickerAnchor.applyHeaderText(el._header, this._getHeaderText(item));

        // default the header to inactive
        DatePickerAnchor.deactivateHeader(el._header);

        // set the month as recycling
        el.classList.add("recycling");

        // fetch our events early to allow our worker as much time as possible to
        // process them and build our html.
        item.gridHeight = this._gridHeight;
        item.dayHeight  = Math.floor((this._gridHeight / item.numWeeks) - 3);
        el.jobset = data.jobset;
        this._getEvents(item, el);

        // our resize handler might be called before we finish updating the element
        // below.  bind it now.
        el._onResize = this._refreshUI.bind(this, item, el);

        el.jobset.addUIJob(this, this._updateRecycled, [item, el], People.Priority.realizeItem);

        _stop("_recycler");
    };

    Month.prototype._updateRecycled = function (item, el) {
        _start("_updateRecycled");

        this._configureGrid(item, el);
        el.classList.remove("recycling");

        el._onEventsClicked      = this._onEventsClicked.bind(this, item, el);
        el._onKeyDown            = this._onKeyDown.bind(this, item, el);
        el._handleKeyboardAndAcc = this._handleKeyboardAndAcc.bind(this, item);
        el.addEventListener("keydown", el._onKeyDown, false);

        _stop("_updateRecycled");
    };

    //
    // Days
    //

    Month.prototype._getDayAccLabel = function (date) {
        return _longDate.format(date);
    };

    Month.prototype._configureGrid = function (item, el) {
        _start("_configureGrid");

        var i = 0,
            date    = item.date,
            day     = null,
            days    = el._days,
            offset  = item.firstDayOffset,
            accDate = new Date(item.date);

        // clear today from last use
        if (days._today) {
            days._today.className = "day thisMonth";
            days._today = null;
        }

        // days from last month
        var daysLastMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate(),
            end   = daysLastMonth - 22,
            start = end - offset;

        // Side Effect: Needed to set previous month
        accDate.setDate(0);

        accDate.setDate(23 + start);
        for (i = 0; i < 9; i++) {
            day = days[i];
            if (i >= start && i < end) {
                day.classList.remove("hidden");

                day.setAttribute("aria-label", this._getDayAccLabel(accDate));
                accDate.setDate(accDate.getDate() + 1);
            } else {
                day.classList.add("hidden");
                day.removeAttribute("aria-label");
            }
        }

        // days this month
        accDate = new Date(item.date);
        for (i = 9; i < 36; i++) {
            day = days[i];
            day.setAttribute("aria-label", this._getDayAccLabel(accDate));
            accDate.setDate(accDate.getDate() + 1);
        }

        // last days in month
        start = 36;
        end = start + item.numDays - 27;
        for (i = 36; i < 40; i++) {
            day = days[i];
            if (i >= start && i < end) {
                day.classList.remove("hidden");

                day.setAttribute("aria-label", this._getDayAccLabel(accDate));
                accDate.setDate(accDate.getDate() + 1);
            } else {
                day.classList.add("hidden");
                day.removeAttribute("aria-label");
            }
        }

        // days next month
        start = 40;
        end = start + (item.numWeeks * 7 - offset - item.numDays);
        for (i = 40; i < days.length; i++) {
            day = days[i];
            if (i >= start && i < end) {
                day.classList.remove("hidden");

                day.setAttribute("aria-label", this._getDayAccLabel(accDate));
                accDate.setDate(accDate.getDate() + 1);
            } else {
                day.classList.add("hidden");
                day.removeAttribute("aria-label");
            }
        }

        // mark today
        if (date.getMonth() === this._today.getMonth() &&
            date.getFullYear() === this._today.getFullYear()) {
            day = days[8 + this._today.getDate()];
            day.className = "day thisMonth today";
            days._today = day;

            Jx.addClass(el._header, "todayHeader");
        } else {
            Jx.removeClass(el._header, "todayHeader");
        }

        _stop("_configureGrid");
    };

    Month.prototype._getDayHeadersHtml = function () {
        _start("_getDayHeadersHtml");

        if (!this._dayHeadersHtml) {
            var html       = "",
                isPortrait = (this._host.offsetWidth < 1024),
                dayNames   = isPortrait ? Helpers.getShortDay : Helpers.getDay;

            for (var i = 0; i < 7; i++) {
                html += "<div class='dayHeader'><div class='dayText'>" + Jx.escapeHtml(dayNames((i + Helpers.firstDayOfWeek) % 7)) + "</div></div>";
            }

            this._dayHeadersHtml = html;
        }

        _stop("_getDayHeadersHtml");
        return this._dayHeadersHtml;
    };

    Month.prototype._getDaysHtml = function () {
        _start("_getDaysHtml");

        var html = "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>23</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>24</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>25</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>26</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>27</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>28</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>29</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>30</div></div>" +
                   "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>31</div></div>" +

                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>1</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>2</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>3</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>4</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>5</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>6</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>7</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>8</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>9</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>10</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>11</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>12</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>13</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>14</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>15</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>16</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>17</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>18</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>19</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>20</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>21</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>22</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>23</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>24</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>25</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>26</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>27</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>28</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>29</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>30</div></div>" +
                   "<div class='day thisMonth' tabIndex='1' role='button'><div class='date'>31</div></div>" +

                   "<div class='day nextMonth' tabIndex='1' role='button'><div class='date'>1</div></div>" +
                   "<div class='day nextMonth' tabIndex='1' role='button'><div class='date'>2</div></div>" +
                   "<div class='day nextMonth' tabIndex='1' role='button'><div class='date'>3</div></div>" +
                   "<div class='day nextMonth' tabIndex='1' role='button'><div class='date'>4</div></div>" +
                   "<div class='day nextMonth hidden' tabIndex='1' role='button'><div class='date'>5</div></div>" +
                   "<div class='day nextMonth hidden' tabIndex='1' role='button'><div class='date'>6</div></div>" +
                   "<div class='day nextMonth hidden' tabIndex='1' role='button'><div class='date'>7</div></div>";

        _stop("_getDaysHtml");
        return html;
    };

    Month.prototype._getHeaderText = function (item) {
        var date = item.date;
        return _header.format(date);
    };

    //
    // Events
    //

    Month.prototype._getGridRange = function (date) {
        var month       = date.getMonth(),
            year        = date.getFullYear(),
            monthStart  = new Date(year, month),
            startDelta  = monthStart.getDay() - Helpers.firstDayOfWeek,
            startOffset = startDelta >= 0 ? startDelta : startDelta + 7,
            start       = new Date(year, month, 1 - startOffset),
            monthEnd    = new Date(year, month + 1),
            endDelta    = Helpers.firstDayOfWeek - monthEnd.getDay(),
            endOffset   = endDelta >= 0 ? endDelta : endDelta + 7,
            end         = new Date(year, month + 1, 1 + endOffset);

        return {start: start, end: end, startOffset: startOffset, endOffset: endOffset};
    };

    Month.prototype._getWorker = function () {
        Debug.assert(!this._worker);

        var data = {};
        this.fire("getPlatformWorker", data);

        this._worker = data.platformWorker;
        this._worker.addListener("Month/getEvents",     this._onGetEvents,     this);
        this._worker.addListener("Month/eventChanged",  this._onEventChanged,  this);
        this._worker.addListener("Month/eventsChanged", this._onEventsChanged, this);
    };

    Month.prototype._onGetEvents = function (data) {
        var el = this._workerIds[data.id];

        if (el) {
            _start("_onGetEvents");

            el.jobset.addUIJob(this, function() {
                _start("_onGetEvents:inner");

                el._events.innerHTML = data.html;
                el._eventAnimation = WinJS.UI.executeAnimation(el._events, {
                    property: "opacity",
                    delay:    0,
                    duration: 250,
                    timing:   "linear",
                    keyframe: "fadeInHack"
                });

                el._eventAnimation.done();
                el._events.style.opacity = 1;

                _stop("_onGetEvents:inner");
            }, null, People.Priority.userTileRender);

            _stop("_onGetEvents");
        }
    };

    Month.prototype._onEventsChanged = function (data) {
        var el = this._workerIds[data.id];

        if (el) {
            el.jobset.addUIJob(this, function() {
                _start("_onEventsChanged");

                var oldEvents = el._events;
                el._events = oldEvents.cloneNode(false);

                el._events.innerHTML = data.html;
                el._events.style.opacity = "0";
                el._grid.appendChild(el._events);

                setImmediate(function() {
                    WinJS.UI.executeTransition(el._events, {
                        property: "opacity",
                        delay: 0,
                        duration: 250,
                        timing: "linear",
                        to: 1
                    }).done(function() {
                        el._events.style.transition = "";
                    });

                    WinJS.UI.executeTransition(oldEvents, {
                        property: "opacity",
                        delay: 200,
                        duration: 250,
                        timing: "linear",
                        to: 0
                    }).done(function() {
                        if (el.parentNode) {
                            oldEvents.outerHTML = "";
                        }
                    });
                });

                _stop("_onEventsChanged");
            }, null, People.Priority.slowData);
        }
    };

    Month.prototype._getEvents = function (item, el) {
        _start("_getEvents");

        // get grid information
        var gridRange = this._getGridRange(item.date),
            gridStart = item.gridStart = gridRange.start,
            gridEnd   = item.gridEnd   = gridRange.end;

        item.gridStartOffset = gridRange.startOffset;
        item.gridEndOffset   = gridRange.endOffset;
        item.eventsPerDay    = this._getEventsPerDay(item);
        item.eventHeight     = this._getEventHeight(item);
        item.eventTopMargin  = this._getEventTopMargin(item);

        // call our worker to get the actual events
        item.workerId = this._worker.postCommand("Month/getEvents", {
            item: item,

            start: gridStart.getTime(),
            end:   gridEnd.getTime(),

            isVisible: el.jobset.isVisible
        });

        this._workerIds[item.workerId] = el;
        _stop("_getEvents");
    };

    Month.prototype._getEventHeight = function (item) {
        var dayHeaderMinHeight = 42;
        return parseInt((item.dayHeight - dayHeaderMinHeight) / item.eventsPerDay, 10);
    };

    Month.prototype._getEventsPerDay = function (item) {
        var dayHeaderHeightAdjust = 37;
        // This calculation determines the number of events per day.  This number is then used to calculate the size of the events.  Any space left over is used for the day header.
        var eventsPerDay = Math.floor((item.dayHeight - dayHeaderHeightAdjust) / item.targetEventHeight);
        return eventsPerDay < 0 ? 0 : eventsPerDay;
    };

    Month.prototype._getEventTopMargin = function (item) {
        return ((item.eventHeight - 22) / 2).toFixed(0);
    };

    //
    // Date related functions
    //

    Month.prototype._getFirstDayOffset = function (year, month) {
        var firstDay = new Date(year, month, 1).getDay(),
            offset = firstDay - Helpers.firstDayOfWeek;

        if (offset < 0) {
            offset = offset + 7;
        }

        return offset;
    };

    //
    // Event handlers
    //

    Month.prototype._refreshDayHeaders = function (el) {
        _start("_refreshDayHeaders");

        var old = el._isPortrait;
        el._isPortrait = (this._host.offsetWidth < 1024);

        // only update headers if orientation has changed
        if (el._isPortrait !== old) {
            var dayHeaders = el.querySelector(".dayHeaders");

            if (dayHeaders) {
                dayHeaders.innerHTML = this._getDayHeadersHtml();
            }
        }

        _stop("_refreshDayHeaders");
    };

    Month.prototype._refreshUI = function (item, el) {
        _start("_refreshUI");

        // the grid size may have changed
        item.gridHeight = this._gridHeight;
        item.dayHeight  = Math.floor((this._gridHeight / item.numWeeks) - 3);

        // get new events
        this._getEvents(item, el);

        // update our day headers
        this._refreshDayHeaders(el);

        _stop("_refreshUI");
    };

    Month._properties = {
        busyStatus: "update",
        color:      "update",
        location:   "update",
        subject:    "update"
    };

    Month.prototype._onEventChanged = function (data) {
        _start("_onEventChanged");

        var properties = data.properties,
            updates    = [];

        for (var i = 0, len = properties.length; i < len; i++) {
            var property = properties[i];

            if (Month._properties[property] === "update") {
                updates.push(property);
            }
        }

        if (updates.length) {
            var el = this._workerIds[data.id];

            if (el) {
                this._updateEventUi(el, data.ev, updates);
            }
        }

        _stop("_onEventChanged");
    };

    Month.prototype._onDateSelected = function (item, cellEl, dateEl, quick) {
        // determine date
        var dateOfMonth = parseInt(dateEl.lastChild.nodeValue, 10);

        // determine which month
        var month = item.date.getMonth();
        if (Jx.hasClass(cellEl, "lastMonth")) {
            month -= 1;
        } else if (Jx.hasClass(cellEl, "nextMonth")) {
            month += 1;
        }

        var date = new Date(item.date.getFullYear(), month, dateOfMonth, 9);
        
        if (quick) {
            this._startQuickEvent(cellEl, date);
        } else {
            if (this._quickEvent && this._quickEvent.isOpen()) {
                this._quickEvent.onDismiss();
            } else {
                this.fire("createEvent", {
                    startDate:   date,
                    allDayEvent: true,
                });
            }
        }
    };

    Month.prototype._onOverflowSelected = function (item, el) {
        var day = new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate() + parseInt(el.id, 10));

        this._focusedIndex = Helpers.getMonthsBetween(this._today, day);
        this._focusedDate = day.getDate();

        this.fire("dayChosen", day);
    };

    Month.prototype._onClick = function (ev) {
        // if we didn't get a pointer down event, then this came in through
        // accessibility.  we shouldn't honestly need this code, but the accessible
        // implementation in trident doesn't send a normal set of events (down, up,
        // then click) when uia invoke is called.

        var realized;
        var el;

        if (!this._gotPointerDown) {
            // get the appropriate handler from the realized item
            realized = this._timeline.getRealized();

            Debug.assert(realized.length);
            el = realized[0].el;

            // Don't allow events on an element that is still recycling.
            if (!el.classList.contains("recycling")) {
                Debug.assert(el._handleKeyboardAndAcc);
                el._handleKeyboardAndAcc(ev);
            }
        } else if (this._pressed) {
            // remove event listener
            this._host.removeEventListener("MSPointerCancel", this._onClick, false);

            // get the appropriate handler from the realized item
            realized = this._timeline.getRealized();            

            Debug.assert(realized.length);            
            el = realized[0].el;

            // Don't allow events on an element that is still recycling.
            if (!el.classList.contains("recycling")) {
                Debug.assert(el._onEventsClicked);

                var handled = el._onEventsClicked(ev);
                if (handled) { 
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            }
            this._pressed.removeAttribute("data-state");
            this._pressed = null;
        }

        this._gotPointerDown = false;
    };

    Month.prototype._onEventsClicked = function (item, el, ev) {
        var handled = false;

        if (this._pressed) {
            // if the pressed button is animated down, animate it up
            if (this._pressed.animatedDown) {
                Animation.pointerUp(this._pressed);
            }

            if (ev.type === "click") {
                if (this._quickEvent && this._quickEvent.isOpen()) {
                    this._quickEvent.onDismiss();
                    return true;
                }

                for (var evEl = ev.target; evEl !== ev.currentTarget; evEl = evEl.parentElement) {
                    // clicked on event
                    if (Jx.hasClass(evEl, "event")) {
                        if (evEl === this._pressed) {
                            Helpers.editEvent(this, evEl.id, evEl);
                            handled = true;
                            break;
                        }
                    }
                    
                    // clicked on overflow
                    if (Jx.hasClass(evEl, "overflow") || Jx.hasClass(evEl, "overflowToday")) {
                        if (evEl === this._pressed) {
                            this._onOverflowSelected(item, evEl);
                            handled = true;
                            break;
                        }
                    } 
                    
                    if (Jx.hasClass(evEl, "activeAnchor")) {
                        if (evEl === this._pressed) {
                            // handle date picker wiring
                            this._onDateAnchorClicked(evEl, ev);
                            handled = true;
                        }

                        break;
                    }
                }

                if (!handled) {
                    // didn't click on event or overflow
                    // set display to none to facilitate hit testing of bottom layer
                    var display = el._events.style.display;
                    el._events.style.display = "none";
                
                    var posX  = ev.pageX,
                        posY  = ev.pageY,
                        hitEl = document.elementFromPoint(posX, posY),
                        dateEl = null,
                        cellEl = null;
                
                    // check if we hit anything inside a day
                    // and also that we didn't hit space between days
                    if (hitEl && !Jx.hasClass(hitEl, "days")) {
                        if (Jx.hasClass(hitEl, "date")) {
                            dateEl = hitEl;
                            cellEl = dateEl.parentElement;
                        } else {
                            dateEl = hitEl.querySelector(".date");
                            cellEl = hitEl;
                        }
                    
                        if (dateEl && hitEl && this._pressed === cellEl) {
                            this._onDateSelected(item, cellEl, dateEl, !ev.ctrlKey);
                            handled = true;
                        }
                    }
                    
                    el._events.style.display = display;
                }
            }
        }

        return handled;
    };

    Month.prototype._onDateAnchorClicked = function() { // el, ev
        this._showDatePicker();
    };

    Month.prototype._showDatePicker = function() {
        /// <summary>displays the date picker UI</summary>

        _start("_showDatePicker");

        var datePicker = this._datePicker,
            today      = Calendar.getToday();

        if (!datePicker) {
            _start("_showDatePicker:!datePicker");

            // instantiate a date picker with a fixed winjs id (just dp-flyout with no suffix)
            // doing this allows test to watch for winjs events with a known name, otherwise
            // winjs uses an internal id in its log string that is difficult to capture
            // use the full path to the DatePicker to allow for mocking
            var DatePicker = Calendar.Controls.DatePicker;
            datePicker = this._datePicker = new DatePicker(DatePicker.PickMode.yearGrid);

            datePicker.setIdSuffix("");  // forces the id to be "dp-flyout" for test
            datePicker.addCustomClass("monthviewPicker");  // don't set to normal view class, or style cross-contamination can occur
            datePicker.showFreeBusy = false;
            datePicker.setToday(today);
            datePicker.setFocusDate(today);
            datePicker.clientView = DatePicker.ClientView.month;

            this.appendChild(datePicker);
            datePicker.activateUI(this._jobset);

            _stop("_showDatePicker:!datePicker");
        }

        if (!datePicker.getActive()) {
            this._configureDatePicker();
            datePicker.show(this._dpAnchor, "bottom", (Jx.isRtl()) ? "right" : "left");
        }

        _stop("_showDatePicker");
    };

    Month.prototype._configureDatePicker = function () {
        /// <summary>call before showing the datepicker to make sure all the state
        ///     values are updated properly for the current view</summary>

        _start("_configureDatePicker");

        var datePicker = this._datePicker,
            highlights = [],
            today = Calendar.getToday(),
            pickedDate, focusDate;

        datePicker.setToday(today);

        // set the highlighted dates based on the currently visible days
        var realized = this._timeline.getRealized();
        pickedDate = this.getItem(realized[0].index).date;
        highlights.push(pickedDate);
        datePicker.setHighlightDates(highlights);

        // focus on january by default
        focusDate = new Date(pickedDate.getFullYear(), 0, 1);
        datePicker.setFocusDate(focusDate);

        _stop("_configureDatePicker");
    };

    Month.prototype._handleKeyboardAndAcc = function (item, ev) {
        ev.preventDefault();

        var el = ev.target;

        if (Jx.hasClass(el, "event")) {
            Helpers.editEvent(this, el.id, el);
        } else if (el.parentElement && Jx.hasClass(el.parentElement, "days")) {
            var dateEl = el.querySelector(".date");
            
            if (dateEl) {
                this._onDateSelected(item, el, dateEl, !ev.ctrlKey);
                ev.stopPropagation();
            }
        } else if (Jx.hasClass(el, "overflow") || Jx.hasClass(el, "overflowToday")) {
            this._onOverflowSelected(item, el);
        } else if (DatePickerAnchor.isActiveDateAnchor(el)) {
            this._showDatePicker();
        }
    };

    Month.prototype._onKeyDown = function (item, el, ev) {
        var keycode = ev.keyCode;

        if (keycode === Jx.KeyCode.enter || keycode === Jx.KeyCode.space) {
            Debug.assert(el._handleKeyboardAndAcc);
            el._handleKeyboardAndAcc(ev);
        }
    };

    Month.prototype._onKeyDownNav = function (ev) {
        var keycode = ev.keyCode;

        if ((Jx.KeyCode.leftarrow <= keycode && keycode <= Jx.KeyCode.downarrow)) {
            this._onArrowKey(ev);
        } else if (keycode === Jx.KeyCode.tab) {
            this._onTabKey(ev);
        }
    };

    Month.prototype._onArrowKey = function (ev) {
        ev.preventDefault();

        var realized = this._timeline.getRealized();

        Debug.assert(realized.length);
        var el = realized[0].el;

        // Don't allow events on an element that is still recycling.
        if (el.classList.contains("recycling")) {
            return;
        }

        var header = el.querySelector("[tabIndex]");

        // grab the visible days
        var visibleDays =
            Array.prototype.slice.call(
                el.querySelectorAll(".days [tabIndex]:not(.hidden)"));
        Debug.assert(visibleDays.length);

        // find the currently focused element
        var current = this._host.querySelector(":focus");
        while (current && !current.hasAttribute("tabIndex")) {
            current = current.parentElement;
        }

        // figure out what day we're on
        var index = visibleDays.indexOf(current);

        // check whether it is the header which is focused
        var headerFocused = (header === current);

        // if we currently don't have a focus or if the focus isn't
        // on a day or the header, focus on the first day
        if (index < 0 && !headerFocused) {
            visibleDays[0].focus();
            return;
        }

        // handle the different arrows
        var newFocus = (headerFocused) ? header : visibleDays[index];
        switch (ev.keyCode) {
            case Jx.KeyCode.leftarrow:
                if (index > 0 && !headerFocused) {
                    newFocus = visibleDays[index - 1];
                }
                break;
            case Jx.KeyCode.uparrow:
                if (index >= 7) {
                    newFocus = visibleDays[index - 7];
                } else {
                    newFocus = header;
                }
                break;
            case Jx.KeyCode.rightarrow:
                if (!headerFocused && index < visibleDays.length - 1) {
                    newFocus = visibleDays[index + 1];
                }
                break;
            case Jx.KeyCode.downarrow:
                if (headerFocused) {
                    newFocus = visibleDays[0];
                } else if (index < visibleDays.length - 7) {
                    newFocus = visibleDays[index + 7];
                }
                break;
        }

        // set the new focus
        newFocus.focus();
    };

    Month.prototype._onTabKey = function (ev) {
        ev.preventDefault();

        var realized = this._timeline.getRealized();

        Debug.assert(realized.length);
        var el = realized[0].el;
        
        // Don't allow events on an element that is still recycling.
        if (el.classList.contains("recycling")) {
            return;
        }

        var header = el.querySelector("[tabIndex]");

        var events =
            Array.prototype.slice.call(
                el.querySelectorAll(".events [tabIndex]"));

        if (events.length) {
            // find the currently focused element
            var current = this._host.querySelector(":focus");
            while (current && !current.hasAttribute("tabIndex")) {
                current = current.parentElement;
            }

            var headerFocused = (header === current);
            
            // figure out what event we're on
            var index = events.indexOf(current);
            
            // if we currently don't have a focus or if the focus isn't
            // on an event, focus on the first event
            if (index < 0) {
                // reset focus to first event if either we shift-tabbed but nothing has focus, or
                // we tabbed
                if ((ev.shiftKey && !headerFocused) || !ev.shiftKey) {
                    events[0].focus();
                }

                return;
            }
            
            var newFocus = events[index];
            if (ev.shiftKey) {
                // go to previous event
                if (index > 0) {
                    newFocus = events[index - 1];
                } else {
                    // go to the header
                    newFocus = header;
                }
            } else {
                // go to next event
                if (index < events.length - 1) {
                    newFocus = events[index + 1];
                }
            }
            
            // set the new focus
            newFocus.focus();
        }
    };

    Month.prototype._getHoveredItem = function (ev) {
        var hovered = null;

        if (this._hasUI) {
            var classes;

            for (var el = ev.target; el !== ev.currentTarget; el = el.parentElement) {
                // over an event
                classes = el.classList;

                if (classes.contains("event") || classes.contains("overflow") || classes.contains("overflowToday") || classes.contains("activeAnchor")) {
                    return el;
                }
            }

            // not over an event
            // set display to none to facilitate hit testing of bottom layer
            var realized = this._timeline.getRealized();
            Debug.assert(realized.length);
            realized = realized[0].el;

            var eventLayer = realized.querySelector(".events"),
                display    = eventLayer.style.display;
            eventLayer.style.display = "none";
            
            var posX  = ev.pageX,
                posY  = ev.pageY,
                hitEl = document.elementFromPoint(posX, posY);

            // check if we hit a day
            if (hitEl && !hitEl.querySelector(".grid") && !Jx.hasClass(hitEl, "days")) {
                classes = hitEl.classList;

                if (classes.contains("date")) {
                    hovered = hitEl.parentElement;
                } else if (classes.contains("thisMonth") || classes.contains("lastMonth") || classes.contains("nextMonth") || classes.contains("today")){
                    hovered = hitEl;
                }
            }

            eventLayer.style.display = display;
        }

        return hovered;
    };

    Month.prototype._onPointerDown = function (ev) {
        // we don't support multi-touch
        if (!this._pressed) {
            // left-click, touch, or pen
            if (ev.button === 0) {
                var hovered = this._getHoveredItem(ev);

                if (hovered) {
                    // add pointerDown animation for events
                    // Don't do press animation if quick event is open.
                    if (Jx.hasClass(hovered, "event") && (!this._quickEvent || !this._quickEvent.isOpen())) {
                        Animation.pointerDown(hovered);
                        hovered.animatedDown = true;
                    }

                    // save the pressed element
                    this._pressed = hovered;

                    // Don't show a pressed state if quick event is open.
                    if (this._quickEvent && this._quickEvent.isOpen()) {
                        // only prevent propagation if quick event is active
                        ev.preventDefault();
                    } else {
                        // show pressed, since quick event is not active
                        this._pressed.setAttribute("data-state", "pressed");
                    }

                    // listen for the cancel if it occurs
                    this._host.addEventListener("MSPointerCancel", this._onClick, false);
                }
            }
        }

        this._gotPointerDown = true;
    };

    // Update our UI if we need to on resize
    Month.prototype._onResizeWindow = function () {
        _start("_onResizeWindow");

        // wait for the next animation frame to ensure that
        // the grid size is correct
        requestAnimationFrame(this._onGridResize);

        _stop("_onResizeWindow");
    };

    Month.prototype._onGridResize = function () {
        if (this._host) {
            _start ("_onGridResize");

            // save our old heigth and get the grid
            var oldHeight = this._gridHeight,
                grid      = document.querySelector(".monthview .grid");

            if (grid) {
                _start("_onGridResize:gridHeight");
                this._gridHeight = grid.offsetHeight;
                _stop("_onGridResize:gridHeight");
            }

            if (this._timeline) {
                // get our realized months
                var realized = this._timeline.getRealized(true),
                    i, len;
                this._dayHeadersHtml = null;

                // only update our events if our height changed.  changing our width
                // won't affect our event layout.
                if (this._gridHeight !== oldHeight) {
                    // cancel worker work
                    for (var workerId in this._workerIds) {
                        this._worker.postCommand("Month/cancel", null, workerId);
                    }

                    // remove all the events
                    for (i = 0, len = realized.length; i < len; i++) {
                        var el = realized[i].el;

                        el._events.innerHTML = "";
                        el._onResize();
                    }
                } else {
                    // otherwise we just update the headers
                    for (i = 0, len = realized.length; i < len; i++) {
                        this._refreshDayHeaders(realized[i].el);
                    }
                }
            } else {
                Debug.assert(false, "Unexpected null timeline");
                // We've seen the timeline as null here but we're not sure why - if we continue to see this it would be worth looking at logs. WinLive 648823.
                Jx.fault("Calendar.MonthView", "NullTimeline");
            }

            _stop("_onGridResize");
        }
    };

    Month.prototype._onFocusChanged = function (data) {
        _start("_onFocusChanged");

        var index = data.index;

        if (this._focusedIndex !== index) {
            this._focusedIndex = index;
            this._focusedDate  = 0;
        }

        // set the first day as the active element, unless today's month is focus
        var days = data.el.querySelectorAll(".thisMonth"),
            day;

        if (index === 0) {
            day = days[this._today.getDate() - 1];
        } else {
            day = days[0];
        }

        Jx.safeSetActive(day);

        // update the status of the current date chevron
        DatePickerAnchor.updateDatePickerButton(this._timeline, data);

        _stop("_onFocusChanged");
    };

    Month._updateBusyStatus = function (el, ev) {
        var glyph = el.querySelector(".glyph");

        Animation.fadeOut(glyph).done(function () {
            el.setAttribute("data-status", Helpers.busyStatusClasses[ev.busyStatus]);
            Animation.fadeIn(glyph).done();
        });
    };

    Month._updateColor = function (el, ev) {
        var color = Helpers.processEventColor(ev.color);
        el.style.color = color;
        el.querySelector(".glyph").style["background-color"] = color;
    };

    Month._updateProperty = function (el, ev, property) {
        var propEl = el.querySelector("." + property);

        // update event fields
        if (propEl) {
            Animation.fadeOut(propEl).done(function () {
                propEl.innerText = ev[property];
                Animation.fadeIn(propEl).done();
            });
        }
    };

    Month._updateFns = {
        busyStatus: Month._updateBusyStatus,
        color:      Month._updateColor,

        location: Month._updateProperty,
        subject:  Month._updateProperty
    };

    Month.prototype._updateEventUi = function (root, ev, properties) {
        _start("_updateEventUi");

        var els = root.querySelectorAll("[id='" + ev.handle + "']"),
            len = els.length;

        for (var i = 0; i < len; i++) {
            var el = els[i];

            for (var j = 0, jLen = properties.length; j < jLen; j++) {
                var property = properties[j],
                    fn       = Month._updateFns[property];

                if (fn) {
                    fn(el, ev, property);
                }
            }
        }

        _stop("_updateEventUi");
    };

    Month.prototype._startQuickEvent = function(el, date) {
        if (!this._quickEvent) {
            this._quickEvent = new Calendar.Controls.QuickEvent(Calendar.Views.Manager.Views.month, true);
            this.appendChild(this._quickEvent); 
        }

        var item          = this.getItem(this._focusedIndex);    
        item.gridHeight   = this._gridHeight;
        item.dayHeight    = Math.floor((this._gridHeight / item.numWeeks) - 3);
        item.eventsPerDay = this._getEventsPerDay(item);

        var eventHeight  = this._getEventHeight(item),
            bottom       = ((item.eventsPerDay - 1) * eventHeight).toFixed(2);

        this._quickEvent.activateUI(el, date, true, {
            height: eventHeight, 
            bottom: bottom, 
        }, el);
    };
});