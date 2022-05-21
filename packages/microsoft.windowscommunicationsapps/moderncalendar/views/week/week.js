
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />
/// <reference path="..\datepicker\DatePickerAnchor.js" />
/// <reference path="..\datepicker\DatePicker.js" />

/*jshint browser:true*/
/*global Calendar,WinJS,Jx,People,Debug,setImmediate*/

Jx.delayDefine(Calendar.Views, "Week", function() {

    function _info(evt) { Jx.mark("Calendar:Week." + evt + ",Info,Calendar"); }
    function _start(evt) { Jx.mark("Calendar:Week." + evt + ",StartTA,Calendar"); }
    function _stop(evt) { Jx.mark("Calendar:Week." + evt + ",StopTA,Calendar"); }

    var Helpers = Calendar.Helpers;
    var DatePickerAnchor = Calendar.Controls.DatePickerAnchor;
    var Animation = WinJS.UI.Animation;
    var _longDate = new Jx.DTFormatter("longDate");

    function tmplHost(data) {
        var html =
            '<div id="' + data.id + '" class="' + data.className + '">' +
                '<div id="aria-flowstart" role="listitem"></div>' +
                '<div class="timeline-host"></div>' +
                '<div id="aria-flowend" role="listitem"></div>' +
                '<div class="dp-anchor"></div>' +
            '</div>';
        return html;
    }

    function tmplDays(data) {
        var week    = data.week,
            dayDate = week.getDate(),
            day     = new Date(week.getFullYear(), week.getMonth(), dayDate),
            html    = "";

        // we put a special class on the element for today
        var formatter = data.context._getHeaderFormatter(week),
            todayDate = -1;

        if (week.isThisWeek) {
            todayDate = data.context._today.getDate();
        }

        // build up our ui for the week
        for (var i = 0; i < 7; i++) {
            html += "<div id='date-" + i + data.uid + "' tabIndex='0' data-order='" + i + "' role='button' aria-label='" + Jx.escapeHtml(_longDate.format(day)) + "' class='date";

            if (dayDate === todayDate) {
                html += " today";
            }

            html += "'>" + formatter.format(day) + "</div>";

            day.setDate(dayDate + 1);
            dayDate = day.getDate();
        }

        return html;
    }

    function tmplItem(data) {
        var html =
            '<div class="week">' +
                '<div class="' + data.headerClass + '">' + 
                    '<div class="dateAnchor">' + 
                        '<div id="da-' + data.uid + '" class="anchorText" role="heading" tabindex="0">' + 
                            Jx.escapeHtml(data.header) + 
                        '</div>' + 
                        '<div class="dateChevron" aria-hidden="true">&#xE09D;</div>' + 
                    '</div>' + 
                '</div>' +
                '<div class="days">' + tmplDays(data) + '</div>' +
                '<div class="allDay">' +
                    '<div class="margin"></div>' +
                    '<div class="events"><div class="container"></div></div>' +
                    '<div class="events"><div class="container"></div></div>' +
                    '<div class="events"><div class="container"></div></div>' +
                    '<div class="events"><div class="container"></div></div>' +
                    '<div class="events"><div class="container"></div></div>' +
                    '<div class="events"><div class="container"></div></div>' +
                    '<div class="events"><div class="container"></div></div>' +
                '</div>' +
                '<div class="allDaySpacer">' +
                    '<div class="margin"></div>' +
                    '<div class="events"></div>' +
                    '<div class="events"></div>' +
                    '<div class="events"></div>' +
                    '<div class="events"></div>' +
                    '<div class="events"></div>' +
                    '<div class="events"></div>' +
                    '<div class="events"></div>' +
                '</div>' +
                '<div class="grid">' +
                    '<div class="hours" aria-hidden="true">' + Helpers.getHoursHtml(data) + '</div>' +
                    '<div class="events" role="list"><div class="container"></div></div>' +
                    '<div class="events" role="list"><div class="container"></div></div>' +
                    '<div class="events" role="list"><div class="container"></div></div>' +
                    '<div class="events" role="list"><div class="container"></div></div>' +
                    '<div class="events" role="list"><div class="container"></div></div>' +
                    '<div class="events" role="list"><div class="container"></div></div>' +
                    '<div class="events" role="list"><div class="container"></div></div>' +
                '</div>' +
            '</div>';
        return html;
    }

    function isElementRendered(el) {
        return (el.offsetWidth && el.offsetHeight);
    }

    var Week = Calendar.Views.Week = function() {
        _start("ctor");

        // call the jx component initialization code
        this.initComponent();
        this._id = "calWeek";

        // do some one-time initialization
        if (!Week._name) {
            _start("ctor:static");
            Helpers.ensureFormats();

            Week._name = "Calendar.Views.Week";
            Week._fourAmOffset = 240;
            Week._nineAmOffset = 540;

            // localization
            Week._lastWeek = Jx.res.getString("LastWeek");
            Week._thisWeek = Jx.res.getString("ThisWeek");
            Week._nextWeek = Jx.res.getString("NextWeek");

            Week._header         = new Jx.DTFormatter("month year");
            Week._headerPortrait = new Jx.DTFormatter("month.abbreviated year");
            Week._headerRange    = Jx.res.getFormatFunction("TimeRange");

            // _dayHeaderAlt can't use the Jx wrapper because the wrappers are created on demand and the customization requires an instance of DateTimeFormatter
            Week._dayHeader = new Jx.DTFormatter("{dayofweek.full} {day.integer}"); // UT's have some dependency on this specific pattern
            Week._dayHeaderAlt = new Jx.dtf()("dayofweek.abbreviated month.abbreviated day");
            Week._updateFormatsForLanguage();

            Week._dayHeaderShort = new Jx.DTFormatter("{dayofweek.abbreviated(2)}, " + Jx.res.loadCompoundString("ShortDateFormatter", "{month.integer}", "{day.integer}"));

            var header      = Week._dayHeader,
                headerAlt   = Week._dayHeaderAlt,
                headerShort = Week._dayHeaderShort;

            Week._dayHeader      = { format: function(date) { return Jx.escapeHtml(header.format(date));    } };
            Week._dayHeaderAlt   = { format: function(date) { return Jx.escapeHtml(headerAlt.format(date)); } };
            Week._dayHeaderShort = { format: function(date) { return Jx.escapeHtml(headerShort.format(date)); } };

            _stop("ctor:static");
        }

        this._resetUiMembers();

        // bind callbacks
        this._renderer = this._renderer.bind(this);
        this._recycler = this._recycler.bind(this);

        this._onKeyDown    = this._onKeyDown.bind(this);
        this._onKeyDownNav = this._onKeyDownNav.bind(this);

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onClick       = this._onClick.bind(this);

        // set default animation
        this._loadAnimation = WinJS.UI.Animation.enterPage;

        _stop("ctor");
    };

    Jx.augment(Week, Jx.Component);

    var proto = Week.prototype;

    proto.setWorkWeek = function(isWorkWeek) {
        if (this._isWorkWeek !== isWorkWeek) {
            this._isWorkWeek = isWorkWeek;

            if (this._host) {
                this._host.classList.toggle("workweek");

                // we have to adjust our header in many cases
                var realized = this._timeline.getRealized(true);

                for (var i = 0, len = realized.length; i < len; i++) {
                    var el   = realized[i].el,
                        week = el._week;

                    // update our header first
                    DatePickerAnchor.applyHeaderText(el._header, this._getHeaderText(week));
                }
            }
        }
    };

    proto.setFocusedDay = function(day) {
        // get the date without any hours, minutes, or seconds.
        // we do this because rounding below can round up a day if we're more than
        // 12 hours from midnight.  we have to round, because otherwise dst
        // differences throw us off by a day.
        day = new Date(day.getFullYear(), day.getMonth(), day.getDate());

        // force date into valid range
        if (day < Calendar.FIRST_DAY)
        {
            _info("Day for " + Week._name + " is out of bounds (" + day + " < " + Calendar.FIRST_DAY + ").");
            day = Calendar.FIRST_DAY;
        }
        else if (day > Calendar.LAST_DAY)
        {
            _info("Day for " + Week._name + " is out of bounds (" + day + " > " + Calendar.LAST_DAY  + ").");
            day = Calendar.LAST_DAY;
        }

        // set our focused index
        this._focusedDay   = day;
        this._focusedIndex = Math.floor(Math.round((day - this._week) / Helpers.dayInMilliseconds) / 7);

        if (this._timeline) {
            this._timeline.setFocusedIndex(this._focusedIndex);
        }
    };

    proto.getFocusedDay = function() {
        if (this._focusedIndex === 0) {
            Debug.assert(this._today);
            return this._today;
        }

        Debug.assert(this._focusedDay);
        return this._focusedDay;
    };

    proto.getState = function() {
        var state = {};

        if (this._timeline) {
            var realized = this._timeline.getRealized();
            Debug.assert(realized.length);

            var el   = realized[0].el,
                item = el._week;

            state[item] = el._grid.scrollTop;
        }

        return state;
    };

    proto.setState = function(state) {
        Debug.assert(!this._host);
        this._positions = state;
    };

    proto.focusEvent = function (eventInfo) {
        /// <summary>Shifts the current view so that a particular date range is in view</summary>
        /// <param name="eventInfo">Object containing at least the following event info: startDate, endDate, allDayEvent</param>

        // move to the right day
        var oldIndex = this._focusedIndex;
        this.setFocusedDay(eventInfo.startDate);

        // if we didn't move, scroll immediately
        if (this._host && oldIndex === this._focusedIndex) {
            var realized = this._timeline.getRealized(),
                first    = realized[0].el;

            this._eventToFocus = eventInfo;
            first._grid.scrollTop = this._getScrollTop(first._week, first._grid);
        } else if (!eventInfo.allDayEvent) {
            this._eventToFocus = eventInfo;
        }
    };

    proto.containsDate = function(date) {
        var first = this.getItem(this._focusedIndex),
            next  = this.getItem(this._focusedIndex + 1);

        return first <= date && date < next;
    };

    proto.setLoadAnimation = function(animation) {
        this._loadAnimation = animation;
    };

    proto.showDatePicker = function() {
        this._showDatePicker();
    };

    // Jx.Component

    proto.getUI = function(ui) {
        var className = "weekview";

        if (this._isWorkWeek) {
            className += " workweek";
        }

        ui.html = tmplHost.call(this, {
            id:        this._id,
            className: className
        });
    };

    proto.activateUI = function(jobset) {
        _start("activateUI");

        // save params
        this._jobset = jobset;

        this._host = document.getElementById(this._id);
        this._dpAnchor = this._host.querySelector(".dp-anchor");
        this._getWorker();

        // check whether we're in portrait
        this._isNarrow = (this._host.offsetWidth < 1024);
        this._isTall   = (1080 < this._host.offsetHeight);

        // listen for day changes
        this._updateToday(Calendar.getToday());
        Calendar.addListener("dayChanged", this._onDayChanged, this);

        // get our ui settings
        var data = {};
        this.fire("getSettings", data);

        // create our timeline control
        var timeline = this._timeline = new Calendar.Controls.Timeline(this._host.querySelector(".timeline-host"), this._jobset, this, this._renderer, this._recycler);
        timeline.setAlwaysShowArrows(data.settings.get("alwaysShowArrows"));

        // listen for arrow setting changes
        this.on("showArrows",   this._onShowArrows);

        // listen for date selections from the date picker
        this.on("dateSelected", this._onDateSelected);

        // hook events
        timeline.addListener("focusChanged", this._onFocusChanged, this);
        timeline.addListener("itemRealized", this._onItemRealized, this);
        timeline.addListener("itemRemoved",  this._onItemRemoved,  this);

        // now initialize the timeline
        timeline.initialize(this._focusedIndex);

        // listen for pointer and key events
        this._host.addEventListener("MSPointerDown", this._onPointerDown, false);
        this._host.addEventListener("click",         this._onClick,       false);

        this._host.addEventListener("keydown", this._onKeyDown,    false);
        this._host.addEventListener("keydown", this._onKeyDownNav, false);

        this.on("resizeWindow", this._onResizeWindow);
        this.on("setScrollable", this._onSetScrollable);

        // animate
        var header  = this._host.querySelector(".header"),
            days    = this._host.querySelector(".days"),
            allDays = this._host.querySelector(".allDay"),
            grid    = this._host.querySelector(".grid");

        var onAnimationDone = function () {
            this.fire("viewReady");
        }.bind(this);

        this._loadAnimation([header, [days, allDays, grid]]).done(onAnimationDone, onAnimationDone); // complete and error callbacks

        _stop("activateUI");
    };

    proto.deactivateUI = function() {
        _start("deactivateUI");
        this._jobset.cancelAllChildJobs();

        // shut down date picker
        if (this._datePicker) {
            this.removeChild(this._datePicker);
            this._datePicker.shutdownUI();
            this._datePicker = null;
        }
        this._dpAnchor = null;

        if (this._quickEvent) {
            this._quickEvent.deactivateUI();
            this._quickEvent = null;
        }

        // shut down our timeline
        this._timeline.shutdown();
        this._timeline.removeListener("itemRemoved",  this._onItemRemoved,  this);
        this._timeline.removeListener("itemRealized", this._onItemRealized, this);
        this._timeline.removeListener("focusChanged", this._onFocusChanged, this);
        this._timeline = null;
        // remove listeners from and release our host

        this.detach("showArrows", this._onShowArrows);
        this.detach("resizeWindow", this._onResizeWindow);
        this.detach("dateSelected", this._onDateSelected);
        this.detach("setScrollable", this._onSetScrollable);

        this._host.removeEventListener("keydown",       this._onKeyDownNav,  false);
        this._host.removeEventListener("keydown",       this._onKeyDown,     false);
        this._host.removeEventListener("click",         this._onClick,       false);
        this._host.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._host = null;

        this._worker.removeListener("Week/getEvents",     this._onGetEvents,     this);
        this._worker.removeListener("Week/eventChanged",  this._onEventChanged,  this);
        this._worker.removeListener("Week/eventsChanged", this._onEventsChanged, this);
        this._worker.removeListener("Week/expandAllDay",  this._onExpandAllDay,  this);
        this._worker = null;

        Calendar.removeListener("dayChanged", this._onDayChanged, this);
        this._resetUiMembers();

        _stop("deactivateUI");
    };

    proto._onSetScrollable = function(ev) {
        if (this._timeline) {
            this._timeline.setScrollable(ev.data);
        }
    };

    proto.left = function() {
        return this._left;
    };

    proto.right = function() {
        return this._right;
    };

    proto.getItem = function(index) {
        if (index < -this._left)  { throw new Error("Index for " + Week._name + " is out of bounds (" + index + " < " + (-this._left)  + ")."); }
        if (index >  this._right) { throw new Error("Index for " + Week._name + " is out of bounds (" + index + " > " +   this._right  + ")."); }

        return new Date(this._week.getFullYear(), this._week.getMonth(), this._week.getDate() + (index * 7));
    };

    Week._hourHeight = 60;

    Week._updateFormatsForLanguage = function() {
        _start("_updateFormatsForLanguage");
        var language = Week._dayHeaderAlt.resolvedLanguage.split("-")[0]; 

        // The following code is a workaround for the fact that we're passing a non-localized pattern to the DateTimeFormatter.  
        // It is possible that there are issues in other markets as well, but these are fixes for the bugs seen so far.

        // For some markets, the day and day of week should be reversed, and there is a special character that should be inserted after the day.
        switch (language) {
            case "ta":
                // In non-portrait mode, the dayofweek string is often too long to use the full name, but we don't want to restrict to always only 2 characters from _dayHeaderShort either.
                Week._dayHeader = new Jx.DTFormatter("{dayofweek.abbreviated} {day.integer}");
                Week._dayHeaderAlt = new Jx.DTFormatter("{dayofweek.abbreviated} " + Jx.res.loadCompoundString("ShortDateFormatter", "{month.integer}", "{day.integer}"));
                break;
            case "ko":
                Week._dayHeader = new Jx.DTFormatter("{day.integer}\uC77C {dayofweek.full}");
                break;
            case "ja":
            case "zh":
                Week._dayHeader = new Jx.DTFormatter("{day.integer}\u65e5 {dayofweek.full}");
                break;
        }

        // We're not using a non-localized formatter here, but the built-in format is not ideal.
        if (language === "ja" || language === "ko") {
            var pattern = Week._dayHeaderAlt.patterns[0].replace("{dayofweek.abbreviated}", "({dayofweek.abbreviated})");
            Week._dayHeaderAlt = new Jx.DTFormatter(pattern);
        }
            
        _stop("_updateFormatsForLanguage");
    };

    // Jx Events

    function getFocusedElement(el) {
        el = el.querySelector(":focus");

        while (el && !el.hasAttribute("data-order") && !el.classList.contains("anchorText")) {
            el = el.parentElement;
        }

        return el;
    }

    function getFirstFocusable(el) {
        // exclude the date picker anchor from initial selection consideration
        var tabbable = el.querySelectorAll("[data-order]:not(.anchorText)");

        for (var i = 0, len = tabbable.length; i < len; i++) {
            el = tabbable[i];

            if (el.offsetWidth && el.offsetHeight) {
                return el;
            }
        }

        return null;
    }

    proto._onFocusChanged = function(data) {
        _start("_onFocusChanged");

        var oldIndex = this._focusedIndex,
            newIndex = data.index;

        // get the difference between the old and new focused days
        var day  = this._focusedDay,
            diff = (newIndex - oldIndex) * 7;

        // set the focused day and index
        day.setDate(day.getDate() + diff);
        this._focusedIndex = newIndex;

        // set focus to today itself, if we can
        if (data.item.isThisWeek) {
            var dayEls = data.el._headerDays;

            for (var i = 0; i < 7; i++) {
                var dayEl = dayEls[i];

                if (dayEl._isToday) {
                    Jx.safeSetActive(dayEl);
                }
            }
        } else {
            // set it active to ensure it gets keyboard events
            var firstFocusable = getFirstFocusable(data.el);

            if (firstFocusable) {
                Jx.safeSetActive(firstFocusable);
            }
        }

        // update the status of the current date chevron
        DatePickerAnchor.updateDatePickerButton(this._timeline, data);

        this._updateAria();
        _stop("_onFocusChanged");
    };

    proto._onItemRealized = function(data) {
        _start("_onItemRealized");

        var week = data.item,
            el   = data.el;
        el.jobset = data.jobset;

        var slice = Array.prototype.slice;

        // the element needs to reference the week it's currently for
        el._week = week;

        // cache some elements we'll use for recycling
        el._header     = el.querySelector(".header");
        el._headerDays = slice.call(el.querySelector(".days").children);

        el._allDay       = el.querySelector(".allDay");
        el._allDayEvents = slice.call(el._allDay.querySelectorAll(".events > div"));

        el._grid       = el.querySelector(".grid");
        el._gridEvents = slice.call(el._grid.querySelectorAll(".events > div"));

        // mark today's day as such
        var today = el.querySelector(".today");
        if (today) {
            today._isToday = true;

            var index = el._headerDays.indexOf(today);
            this._showTimeIndicator(el._grid.children[index+1]);
        }

        // set up our weekends property
        this._setupWeekends(el);

        // set the grid's scroll position to 9am
        _start("_onItemRealized:scrollGrid");
        el._grid.style.msOverflowStyle = "none";
        el._grid.scrollTop = this._getScrollTop(el._week, el._grid);
        el._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";
        _stop("_onItemRealized:scrollGrid");

        // set up our calendar event processing
        this._getEvents(week, el);
        _stop("_onItemRealized");
    };

    proto._onItemRemoved = function(data) {
        _start("_onItemRemoved");

        var week = data.item,
            id   = week.workerId;

        if (week.isThisWeek) {
            this._time.deactivateUI();
        }

        this._worker.postCommand("Week/cancel", null, id);
        delete this._workerIds[id];

        _stop("_onItemRemoved");
    };

    proto._onShowArrows = function(ev) {
        if (!ev.handled) {
            this._timeline.setAlwaysShowArrows(ev.data.value);
            ev.handled = true;
        }
    };

    proto._onDateSelected = function (ev) {
        if (!ev.handled) {
            ev.handled = true;
            this.setFocusedDay(ev.data);
        }
    };

    proto._onDayChanged = function(today) {
        var oldDay     = this._today,
            oldWeek    = this._week,
            datePicker = this._datePicker;
        this._updateToday(today);

        // hide and update date picker
        if (datePicker) {
            datePicker.hide();
            datePicker.setToday(today);
        }

        // if we were focused on this week, update our index
        if (this._focusedIndex) {
            var weeks = Math.round((this._week - oldWeek) / Helpers.dayInMilliseconds / 7);
            this._focusedIndex -= weeks;
        }

        // if we were focused on today, update our date
        if (Helpers.isSameDate(this._focusedDay, oldDay)) {
            this._focusedDay = today;
        }

        // re-initialize the timeline
        this._timeline.initialize(this._focusedIndex);
    };

    proto._getWorker = function() {
        Debug.assert(!this._worker);

        var data = {};
        this.fire("getPlatformWorker", data);

        this._worker = data.platformWorker;
        this._worker.addListener("Week/getEvents",     this._onGetEvents,     this);
        this._worker.addListener("Week/eventChanged",  this._onEventChanged,  this);
        this._worker.addListener("Week/eventsChanged", this._onEventsChanged, this);
        this._worker.addListener("Week/expandAllDay",  this._onExpandAllDay,  this);
    };

    proto._getEvents = function(week, el) {
        var year  = week.getFullYear(),
            month = week.getMonth(),
            date  = week.getDate();

        var start = new Date(year, month, date),
            end   = new Date(year, month, date + 7);

        // call our worker to get the actual events
        week.workerId = this._worker.postCommand("Week/getEvents", {
            start: start.getTime(),
            end:   end.getTime(),

            isVisible: el.jobset.isVisible
        });

        this._workerIds[week.workerId] = el;
    };

    proto._setEventHtml = function(el, data) {
        _start("_setEventHtml");

        for (var i = 0; i < 7; i++) {
            var allDayHtml = data.allDayHtml[i],
                eventHtml  = data.eventHtml[i];

            el._allDayEvents[i].innerHTML = allDayHtml;
            el._gridEvents[i].innerHTML   = eventHtml;
        }

        _stop("_setEventHtml");
    };

    proto._onGetEvents = function(data) {
        var el = this._workerIds[data.id];

        if (el) {
            _start("_onGetEvents");

            el.jobset.addUIJob(this, function() {
                _start("_onGetEvents:inner");

                this._setEventHtml(el, data);
                Animation.fadeIn([el._allDayEvents].concat(el._gridEvents)).done();

                this._updateAria();
                _stop("_onGetEvents:inner");
            }, null, People.Priority.userTileRender);

            _stop("_onGetEvents"); // used in perfbench
        }
    };

    proto._onEventsChanged = function(data) {
        var el = this._workerIds[data.id];

        if (el) {
            el.jobset.addUIJob(this, function() {
                _start("_onEventsChanged");

                var oldAllDay = el._allDayEvents,
                    oldEvents = el._gridEvents;

                el._allDayEvents = [];
                el._gridEvents   = [];

                for (var i = 0; i < 7; i++) {
                    var allDay = el._allDayEvents[i] = oldAllDay[i].cloneNode(false),
                        events = el._gridEvents[i]   = oldEvents[i].cloneNode(false);

                    allDay.style.opacity = 0;
                    events.style.opacity = 0;

                    allDay.innerHTML = data.allDayHtml[i];
                    events.innerHTML = data.eventHtml[i];

                    oldAllDay[i].parentElement.appendChild(allDay);
                    oldEvents[i].parentElement.appendChild(events);
                }

                setImmediate(function() {
                    WinJS.UI.executeTransition([el._allDayEvents, el._gridEvents], {
                        property: "opacity",
                        delay: 0,
                        duration: 250,
                        timing: "linear",
                        to: 1
                    }).done();

                    WinJS.UI.executeTransition([oldAllDay, oldEvents], {
                        property: "opacity",
                        delay: 200,
                        duration: 250,
                        timing: "linear",
                        to: 0
                    }).done(function() {
                        if (el.parentNode) {
                            for (var j = 0; j < 7; j++) {
                                oldAllDay[j].outerHTML = "";
                                oldEvents[j].outerHTML = "";
                            }
                        }
                    });
                });

                this._updateAria();
                _stop("_onEventsChanged");
            }, null, People.Priority.slowData);
        }
    };

    Week._properties = {
        busyStatus: "update",
        color:      "update",
        location:   "update",
        subject:    "update"
    };

    proto._onEventChanged = function(data) {
        _start("_onEventChanged");

        var properties = data.properties,
            updates    = [];

        for (var i = 0, len = properties.length; i < len; i++) {
            var property = properties[i];

            if (Week._properties[property]) {
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

    Week._updateBusyStatus = function(el, ev) {
        var glyph = el.querySelector(".glyph");

        Animation.fadeOut(glyph).done(function() {
            el.setAttribute("data-status", Helpers.busyStatusClasses[ev.busyStatus]);
            Animation.fadeIn(glyph);
        });
    };

    Week._updateColor = function(el, ev) {
        var color = Helpers.processEventColor(ev.color);

        el.style.color = color;
        el.querySelector(".glyph").style.backgroundColor = color;
    };

    Week._updateLocation = function(el, ev) {
        var propEl = el.querySelector(".location");

        if (propEl) {
            // the value we set depends on whether or not this is a short event
            var value;

            if (Jx.hasClass(el, "short")) {
                value = "(" + ev.location + ")";
            } else {
                value = ev.location;
            }

            // update event fields
            Animation.fadeOut(propEl).done(function () {
                propEl.innerText = value;
                Animation.fadeIn(propEl);
            });
        }
    };

    Week._updateSubject = function(el, ev) {
        var propEl = el.querySelector(".subject");

        // update event fields
        Animation.fadeOut(propEl).done(function () {
            propEl.innerText = ev.subject;
            Animation.fadeIn(propEl);
        });
    };

    Week._updateFns = {
        busyStatus: Week._updateBusyStatus,
        color:      Week._updateColor,
        location:   Week._updateLocation,
        subject:    Week._updateSubject
    };

    proto._updateEventUi = function(root, ev, properties) {
        _start("_updateEventUi");

        var id  = ev.handle,
            els = document.querySelectorAll("[data-handle='" + id + "']"),
            len = els.length;

        for (var i = 0; i < len; i++) {
            var el = els[i];

            for (var j = 0, jLen = properties.length; j < jLen; j++) {
                var property = properties[j],
                    fn       = Week._updateFns[property];

                if (fn) {
                    fn(el, ev, property);
                }
            }
        }

        _stop("_updateEventUi");
    };

    proto._onExpandAllDay = function(data) {
        var el = this._workerIds[data.id];

        if (el) {
            var index  = data.index,
                allDay = el._allDayEvents[index];
            allDay.innerHTML = data.html;
        }
    };

    function qsa(el, query) {
        return Array.prototype.slice.call(el.querySelectorAll(query));
    }

    proto._handleLeft = function(root, current) {
        return this._handleColumnNavigation(root, current, -1);
    };

    proto._handleRight = function(root, current) {
        return this._handleColumnNavigation(root, current, 1);
    };

    proto._handleColumnNavigation = function(root, current, offset) {
        /// <summary>handles navigating among columns (done with left and right arrows)</summary>
        /// <param name="root" type="DOMElement">root element of a rendered item</param>
        /// <param name="current" type="DOMElement">current element with focus</param>
        /// <param name="offset" type="Number" integer="true">the direction of movement to handle.
        ///     -1 for the previous column, 1 for the next</param>
        /// <returns type="Boolean">true if the navigation was handled, otherwise false</returns>

        Debug.assert(offset === 1 || offset === -1, "offset must be +/-1");

        // get the first item with a higher order
        var order = parseInt(current.getAttribute("data-order"), 10) + offset,
            next, done = false, handled = false;

        // find the next rendered item
        do {
            next  = root.querySelector("[data-order='" + order + "']");
            order += offset;
            if (next) {
                if (isElementRendered(next)) {
                    // focus on it
                    next.focus();
                    handled = true;
                    done = true;
                }
            } else {
                // no more elements
                done = true;
            }
        } while (!done);

        return handled;
    };

    proto._handleUp = function (root, current, preventHeaderNavigation) {
        /// <summary>handles up key presses for navigation</summary>
        /// <param name="root" type="DOMElement">root element of a rendered item</param>
        /// <param name="current" type="DOMElement">current element with focus</param>
        /// <param name="preventHeaderNavigation" type="Boolean">allow navigating up to the header.  when 
        ///     supplying navigation for tabbing, we want to exhaust all days before going to the header,
        ///     so we don't allow header navigation in the initial attempt (default is false, favoring)
        ///     normal key handling over shift-tab handling</param>
        /// <returns type="Boolean">true if the navigation was handled, otherwise false</returns>

        // get a list of all the things with the same order,
        // as well as the previous item in that list.
        var order         = parseInt(current.getAttribute("data-order"), 10),
            els           = qsa(root, "[data-order='" + order + "']"),
            index         = els.indexOf(current),
            previous      = els[index-1],
            header        = root.querySelector(".anchorText");

        // only go to the header if allowed
        if (!preventHeaderNavigation && !previous && header) {
            previous = header;
        }

        // if there is a previous item, focus it
        if (previous) {
            previous.focus();
            return true;
        }

        return false;
    };

    proto._handleDown = function(root, current) {
        // get a list of all the things with the same order,
        // as well as the next item in that list.
        var attr          = parseInt(current.getAttribute("data-order"), 10),
            order         = (isNaN(attr) ? 0 : attr),
            els           = qsa(root, "[data-order='" + order + "']"),
            index         = els.indexOf(current),
            next          = els[index+1],
            header        = root.querySelector(".anchorText"),
            headerFocused = (current === header);

        if (headerFocused) {
            // focus on the first available date thing
            next = getFirstFocusable(root);
        }

        // if there is a next item, focus it
        if (next) {
            next.focus();
            return true;
        }

        return false;
    };

    proto._handleTab = function(root, current, isShiftPressed) {
        var result;

        // a plain tab tries to go down.  then, if that failed, to the right.
        if (!isShiftPressed) {
            result = this._handleDown(root, current) ||
                     this._handleRight(root, current);
        } else {
            // a shift tab tries to go up (avoid the header initially)
            result = this._handleUp(root, current, true);

            // if that failed, we go to the last item in the previous day.  Note that this
            // is different from _handleLeft, which immediately jumps to the previous
            // header rather than considering whether there are events
            if (!result) {
                // get the first item with a higher order
                var order = parseInt(current.getAttribute("data-order"), 10) - 1,
                    next, done = false;

                // find the next rendered item
                do {
                    next = root.querySelectorAll("[data-order='" + order + "']");
                    --order;
                    if (next.length > 0) {
                        var el = next[next.length - 1];
                        if (isElementRendered(el)) {
                            // focus on it
                            el.focus();
                            result = true;
                            done = true;
                        }
                    } else {
                        // no more elements
                        done = true;
                    }
                } while (!done);

                if (!result) {
                    // no more items, so try to go to the header
                    result = this._handleUp(root, current);
                }
            }
        }

        return result;
    };

    proto._onKeyDownNav = function(ev) {
        var codes = Jx.KeyCode,
            code  = ev.keyCode;

        // we only care about arrow keys and tab
        if ((codes.leftarrow <= code && code <= codes.downarrow) || code === codes.tab) {
            ev.preventDefault();

            // we the realized list
            var realized = this._timeline.getRealized();
            Debug.assert(realized.length);

            // if we don't have a currently focused element, choose the first one
            var root          = realized[0].el,
                current       = getFocusedElement(root),
                header        = root.querySelector(".anchorText"),
                headerFocused = (header === current);

            if (!current && !headerFocused) {
                var firstFocusable = getFirstFocusable(root);

                if (firstFocusable) {
                    firstFocusable.focus();
                }

                return;
            }

            // if we do have a focused element, what we do depends on what key was pressed
            switch (code) {
            case codes.leftarrow:
                this._handleLeft(root, current);
                break;

            case codes.rightarrow:
                this._handleRight(root, current);
                break;

            case codes.uparrow:
                this._handleUp(root, current);
                break;

            case codes.downarrow:
                this._handleDown(root, current);
                break;

            case codes.tab:
                this._handleTab(root, current, ev.shiftKey);
                break;
            }
        }
    };

    proto._onAllDayClick = function(el, ev) {
        var root         = this._getItemRoot(el),
            week         = root._week,
            headerDays   = root._headerDays,
            allDayEvents = root._allDayEvents,
            index        = allDayEvents.indexOf(ev.target);

        // we could have clicked on the blank area, and not an actual day
        if (index === -1) {
            // set the index to the first day of the week
            if (this._isWorkWeek) {
                var weekStart = root._allDay.querySelector(".events:not(.weekend) .container");
                index = allDayEvents.indexOf(weekStart);
            } else {
                index = 0;
            }

            // unless we're on this week, in which case we'll create an event on today
            if (week.isThisWeek) {
                index = headerDays.indexOf(root.querySelector(".today"));
            }
        }

        var startDate = new Date(week.getFullYear(), week.getMonth(), week.getDate() + index);

        this._createEvent(ev, allDayEvents[index].parentNode, startDate, true, headerDays[index]);
    };

    proto._onGridClick = function(el, ev) {
        var root       = this._getItemRoot(el),
            week       = root._week,
            gridEvents = root._gridEvents,
            headerDays = root._headerDays,
            grid       = root._grid,
            index      = gridEvents.indexOf(ev.target);

        // figure out our pointer offset from the root of the grid
        var offset = ev.offsetY;
        for (var target = ev.target; target !== el; target = target.parentElement) {
            offset += target.offsetTop;
        }

        // translate the offset to an hour
        var hour = Math.floor(offset / Week._hourHeight);

        // we could have clicked on the times, and not an actual day
        if (index === -1) {
            // set the index to the first day of the week.
            if (this._isWorkWeek) {
                var weekStart = grid.querySelector(".events:not(.weekend) .container");
                index = gridEvents.indexOf(weekStart);
            } else {
                index = 0;
            }

            // unless we're on this week, in which case we'll create an event on today
            if (week.isThisWeek) {
                index = headerDays.indexOf(root.querySelector(".today"));
            }
        } else {
            // we're pressed, so we need to tell if we're in the same spot
            if (ev.target.parentElement !== this._focusArea.day || hour !== this._focusArea.hour) {
                return;
            }
        }

        var startDate = new Date(week.getFullYear(), week.getMonth(), week.getDate() + index, hour),
            events    = grid.querySelectorAll(".events");

        this._createEvent(ev, events[index], startDate, false, headerDays[index]);
    };

    proto._onMoreClick = function(el) {
        var allDayEl = el.parentNode;

        var root  = this._getItemRoot(allDayEl),
            week  = root._week,
            index = root._allDayEvents.indexOf(allDayEl);

        // clear out the old all day events
        allDayEl.innerHTML = "";

        // make sure keyboard keeps working for this day
        var firstInDay = root.querySelector("[data-order='" + el.getAttribute("data-order") + "']");
        firstInDay.setActive();

        // update the ui
        this._worker.postCommand("Week/expandAllDay", { index: index }, week.workerId);
    };

    proto._onDateAnchorClicked = function() {
        /// <summary>handles the date picker anchor being clicked by showing the date picker</summary>

        this._showDatePicker();
    };

    proto._showDatePicker = function() {
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
            datePicker = this._datePicker = new DatePicker(DatePicker.PickMode.monthGrid);
        
            datePicker.setIdSuffix("");  // forces the id to be "dp-flyout" for test
            datePicker.addCustomClass("weekviewPicker");  // don't set to normal view class, or style cross-contamination can occur
            datePicker.showFreeBusy = false;
            datePicker.setToday(today);
            datePicker.setFocusDate(today);

            if (this._isWorkWeek) {
                datePicker.clientView = DatePicker.ClientView.workWeek;
            } else {
                datePicker.clientView = DatePicker.ClientView.week;
            }

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

    proto._handleKeyboardAndAcc = function(ev) {
        ev.preventDefault();
        var el = ev.target;

        if (Jx.hasClass(el, "more")) {
            this._onMoreClick(el);
        } else if (Jx.hasClass(el, "event")) {
            if (this._quickEvent && this._quickEvent.isOpen()) {
                this._quickEvent.onDismiss();
            } else {
                Helpers.editEvent(this, el.getAttribute('data-handle'), el);
            }
        } else if (Jx.hasClass(el, "date")) {
            var root   = this._getItemRoot(el),
                now    = new Date(),
                week   = root._week,
                index  = root._headerDays.indexOf(el),
                events = root._grid.querySelectorAll(".events");

            var startDate = new Date(week.getFullYear(), week.getMonth(), week.getDate() + index, now.getHours());

            this._createEvent(ev, events[index], startDate, false, el);
        } else if (DatePickerAnchor.isActiveDateAnchor(el)) {
            this._showDatePicker();
        }
    };

    proto._getFocusedItem = function(ev) {
        var focused = null,
            el      = ev.target;

        // if the target is the grid itself, we're on the scrollbar and shouldn't
        // focus anything at all.
        if (ev.type !== "MSPointerCancel" && ev.type !== "pointercancel" && !el.classList.contains("grid")) {
            var offset = ev.offsetY;

            while (el && el !== this._host) {
                var classes = el.classList;

                // if we hit the grid, our focus will be on a particular hour
                if (classes.contains("hours")) {
                    focused = ev.target;
                    break;
                }

                // we hit some day's event container
                if (classes.contains("events")) {
                    focused = el;

                    // if this is on the grid, we have more work to do
                    if (el.parentElement.classList.contains("grid")) {
                        // calculate the pixel offset of the hour we're on
                        var hour = Math.floor(offset / Week._hourHeight);

                        focused = this._focusArea;
                        focused.style.top = (hour * Week._hourHeight - 1) + "px";

                        focused.hour = hour;
                        focused.day  = el;
                        el.insertBefore(focused, el.firstElementChild);
                    }

                    break;
                }

                // otherwise it'll be on particular elements
                if (classes.contains("event") || classes.contains("more") || classes.contains("allDay") || classes.contains("date") || classes.contains("activeAnchor")) {
                    focused = el;
                    break;
                }

                offset += el.offsetTop;
                el = el.parentElement;
            }
        }

        return focused;
    };

    proto._onPointerDown = function(ev) {
        // we don't support multi-touch
        if (!this._pressed) {
            // left-click, touch, or pen
            if (ev.button === 0) {
                // find out which element was actually the target of our press
                for (var el = ev.target; el; el = el.parentElement) {
                    var classes = el.classList,
                        capture = false;

                    // we want to aninmate events and the "X more" button
                    if (classes.contains("event") || classes.contains("more")) {
                        // Don't do press animation if quick event is open.
                        if (!this._quickEvent || !this._quickEvent.isOpen()) {
                            Animation.pointerDown(el);
                            el._pointerDown = true;
                        }

                        capture = true;
                    } else if (classes.contains("allDay") || classes.contains("events") || classes.contains("hours") || classes.contains("date") || classes.contains("activeAnchor")) {
                        capture = true;
                    }

                    // if we care about the press, add some endpoint listeners and save our pressed state
                    if (capture) {
                        this._host.addEventListener("MSPointerCancel", this._onClick, false);

                        // save some state
                        this._pressed = el;

                        // and get our focused item
                        this._focused = this._getFocusedItem(ev);

                        if (this._quickEvent && this._quickEvent.isOpen()) {
                            // Prevents focus from being set on the .container class while scrolling by touch
                            ev.preventDefault();                            
                        } else {
                            // Only show a pressed state if quick event isn't open.
                            this._focused.setAttribute("data-state", "pressed");
                        }

                        break;
                    }
                }
            }
        }

        // either way, we got a pointer down event
        this._gotPointerDown = true;
    };

    proto._onClick = function(ev) {
        // if we didn't get a pointer down event, then this came in through
        // accessibility.  we shouldn't honestly need this code, but the accessible
        // implementation in trident doesn't send a normal set of events (down, up,
        // then click) when uia invoke is called.
        if (!this._gotPointerDown) {
            this._handleKeyboardAndAcc(ev);
        } else if (this._pressed) {
            // if we animated the pressed element, un-animate it
            if (this._pressed._pointerDown) {
                Animation.pointerUp(this._pressed);
            }

            // remove our listeners
            this._host.removeEventListener("MSPointerCancel", this._onClick, false);

            // handle the potential "click"
            if (ev.type === "click") {
                for (var el = ev.target; el; el = el.parentElement) {
                    var classes = el.classList;

                    if (classes.contains("event")) {
                        if (el === this._pressed) {
                            if (!this._quickEvent || !this._quickEvent.isOpen()) {
                                Helpers.editEvent(this, el.getAttribute('data-handle'), el);
                            } else if (this._quickEvent) {
                                this._quickEvent.onDismiss();
                            }
                        }

                        break;
                    }

                    if (classes.contains("more")) {
                        if (el === this._pressed) {
                            this._onMoreClick(el);
                        }

                        break;
                    }

                    if (classes.contains("allDay") || classes.contains("events") || classes.contains("hours")) {
                        if (el === this._pressed) {
                            if (el.parentElement.classList.contains("grid")) {
                                this._onGridClick(el, ev);
                            } else {
                                this._onAllDayClick(el, ev);
                            }
                        }

                        break;
                    }

                    if (classes.contains("date")) {
                        if (el === this._pressed) {
                            var root   = this._getItemRoot(el),
                                now    = new Date(),
                                week   = root._week,
                                index  = root._headerDays.indexOf(el),
                                events = root._grid.querySelectorAll(".events");

                            var startDate = new Date(week.getFullYear(), week.getMonth(), week.getDate() + index, now.getHours());

                            this._createEvent(ev, events[index], startDate, false, el);
                        }

                        break;
                    }

                    if (classes.contains("activeAnchor")) {
                        if (el === this._pressed) {
                            // handle date picker wiring
                            this._onDateAnchorClicked();
                        }

                        break;
                    }
                }
            }

            // reset our pressed state
            this._pressed = null;

            // our previously focused item is now irrelevant
            this._focused.removeAttribute("data-state");
            this._focused = null;
        }

        // reset our pointer down state
        this._gotPointerDown = false;
    };

    proto._onKeyDown = function(ev) {
        switch (ev.key) {
        case "Enter":
        case "Spacebar":
            this._handleKeyboardAndAcc(ev);
            break;
        }
    };

    proto._onResizeWindow = function() {
        _start("_onResizeWindow");

        // only do work if we're activated
        if (this._host) {
            var oldNarrow      = this._isNarrow,
                oldTall        = this._isTall,
                quickEventOpen = this._quickEvent && this._quickEvent.isOpen();

            this._isNarrow = (this._host.offsetWidth < 1024);
            this._isTall   = (1080 < this._host.offsetHeight);

            var changed = (oldNarrow !== this._isNarrow || (oldTall !== this._isTall && !quickEventOpen));
            var realized = this._timeline.getRealized(true);

            if (changed) {
                for (var i = 0, len = realized.length; i < len; i++) {
                    var el   = realized[i].el;
                    var week = el._week;
                    var day  = new Date(week);

                    // update our header first
                    DatePickerAnchor.applyHeaderText(el._header, this._getHeaderText(week));

                    // we need to update the header format
                    var formatter = this._getHeaderFormatter(week);

                    for (var j = 0; j < 7; j++) {
                        var dayEl = el._headerDays[j];
                        dayEl.innerHTML = formatter.format(day);

                        day.setDate(day.getDate() + 1);
                    }
                }
            }
        }

        _stop("_onResizeWindow");
    };

    // Helpers

    proto._resetUiMembers = function() {
        this._updateToday(Calendar.getToday());
        this._host   = null;
        this._jobset = null;
        this._worker = null;

        this._isWorkWeek   = false;
        this._focusedDay   = new Date(this._today);
        this._focusedIndex = 0;

        this._time = null;
        this._focusArea = document.createElement("div");
        this._focusArea.className = "focusArea";

        this._eventToFocus = null;
        this._positions    = {};
        this._workerIds    = {};

        this._ariaDirty = false;
    };

    proto._updateToday = function(today) {
        if (!this._today || !Helpers.isSameDate(today, this._today)) {
            var offset = today.getDay() - Helpers.firstDayOfWeek;

            if (offset < 0) {
                offset += 7;
            }

            this._today = today;
            this._week  = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);

            // we round these so they end on full weeks
            this._left  = Math.ceil(Math.round((this._week - Calendar.FIRST_DAY) / Helpers.dayInMilliseconds) / 7);
            this._right = Math.floor(Math.round((Calendar.LAST_DAY - this._week) / Helpers.dayInMilliseconds) / 7);
        }
    };

    proto._getItemRoot = function(el) {
        while (el && !Jx.hasClass(el, "week")) {
            el = el.parentNode;
        }

        return el;
    };

    proto._getHeaderText = function(week) {
        var comparedDay = new Date(this._week);

        if (Helpers.isSameDate(comparedDay, week)) {
            week.isThisWeek = true;
            return Week._thisWeek;
        }

        comparedDay.setDate(comparedDay.getDate() + 7);
        if (Helpers.isSameDate(comparedDay, week)) {
            week.isNextWeek = true;
            return Week._nextWeek;
        }

        comparedDay.setDate(comparedDay.getDate() - 14);
        if (Helpers.isSameDate(comparedDay, week)) {
            week.isLastWeek = true;
            return Week._lastWeek;
        }

        var year    = week.getFullYear(),
            month   = week.getMonth(),
            lastDay = new Date(year, month, week.getDate() + 6);

        // if we're in work week, we have to make some adjustments
        if (this._isWorkWeek) {
            if (Helpers.firstDayOfWeek === 0) {
                week = new Date(year, month, week.getDate() + 1);
                lastDay.setDate(lastDay.getDate() - 1);
            } else if (Helpers.firstDayOfWeek === 1) {
                lastDay.setDate(lastDay.getDate() - 2);
            } else if (Helpers.firstDayOfWeek === 6) {
                week = new Date(year, month, week.getDate() + 2);
            }
        }

        // our header depends on whether our week spans months, years, or neither
        var text;

        if (week.getMonth() === lastDay.getMonth()) {
            text = Week._header.format(week);
        } else {
            var formatter = this._isNarrow ? Week._headerPortrait : Week._header;
            text = Week._headerRange(formatter.format(week), formatter.format(lastDay));
        }

        return text;
    };

    proto._setupWeekends = function(el) {
        _start("_setupWeekends");

        var saturday = 6 - Helpers.firstDayOfWeek,
            sunday   = saturday + 1;

        if (Helpers.firstDayOfWeek === 0) {
            sunday = sunday % 7;
        }

        Jx.addClass(el._headerDays[saturday],              "weekend");
        Jx.addClass(el._allDayEvents[saturday].parentNode, "weekend");
        Jx.addClass(el._gridEvents[saturday].parentNode,   "weekend");

        Jx.addClass(el._headerDays[sunday],              "weekend");
        Jx.addClass(el._allDayEvents[sunday].parentNode, "weekend");
        Jx.addClass(el._gridEvents[sunday].parentNode,   "weekend");

        _stop("_setupWeekends");
    };

    proto._isSameWeek = function(start, day) {
        var diff   = day - start,
            days   = Math.round(diff / Helpers.dayInMilliseconds),
            offset = Math.floor(days / 7);

        return (offset === 0);
    };

    proto._getScrollTop = function(week, el) {
        var scrollTop = el.scrollTop;

        if (week in this._positions) {
            scrollTop = this._positions[week];
            // This delete is needed for panning.
            delete this._positions[week];
        } else if (this._isTall) {
            scrollTop = Week._fourAmOffset;
        } else {
            scrollTop = Week._nineAmOffset;
        }

        if (this._eventToFocus) {
            // we only need to do work if the event is in this week
            if (this._isSameWeek(week, this._eventToFocus.startDate)) {
                scrollTop = Helpers.getIdealScrollTop(this._eventToFocus, el, scrollTop);

                // we no longer have an event to focus
                this._eventToFocus = null;
            }
        }

        return scrollTop;
    };

    proto._getHeaderFormatter = function(week) {
        if (this._isNarrow && !this._isWorkWeek) {
            return Week._dayHeaderShort;
        } else if (week.isThisWeek || week.isNextWeek || week.isLastWeek) {
            return Week._dayHeaderAlt;
        }

        return Week._dayHeader;
    };

    proto._showTimeIndicator = function(el) {
        if (!this._time) {
            this._time = new Calendar.Controls.TimeIndicator();
        }

        this._time.activateUI(el);
    };

    proto._updateAria = function() {
        if (!this._ariaDirty) {
            this._ariaDirty = true;
            this._jobset.addUIJob(this, this._doUpdateAria, null, People.Priority.accessibility);
        }
    };

    proto._doUpdateAria = function() {
        if (!this._host) {
            return;
        }

        var realized = this._timeline.getRealized(),
            visible  = realized[0].el,
            headers, alldayContainers, eventContainers;

        if (this._isWorkWeek) {
            headers = visible.querySelectorAll(".days > .date:not(.weekend)");
            alldayContainers = visible.querySelectorAll(".allDay > .events:not(.weekend) > .container");
            eventContainers  = visible.querySelectorAll(".grid   > .events:not(.weekend) > .container");
        } else {
            headers = visible._headerDays;
            alldayContainers = visible._allDayEvents;
            eventContainers  = visible._gridEvents;
        }

        // initial flow should go to the header
        var headerEl  = visible.querySelector(".anchorText"),
            ariaStart = document.getElementById("aria-flowstart");

        ariaStart.setAttribute("aria-flowto",       headerEl.id);
        headerEl.setAttribute("x-ms-aria-flowfrom", ariaStart.id);

        // loop through the days of the week and set up our tab stops.
        for (var i = 0, len = headers.length; i < len; i++) {
            var currentItem = headers[i],
                nextHeader  = headers[i + 1];

            var alldays = alldayContainers[i].querySelectorAll(".event"),
                events  = eventContainers[i].querySelectorAll(".event");

            if (i === 0) {
                headerEl.setAttribute("aria-flowto",           currentItem.id);
                currentItem.setAttribute("x-ms-aria-flowfrom", headerEl.id);
            }

            if (alldays.length) {
                var firstAllDay = alldays[0];

                currentItem.setAttribute("aria-flowto",        firstAllDay.id);
                firstAllDay.setAttribute("x-ms-aria-flowfrom", currentItem.id);

                currentItem = alldays[alldays.length - 1];
            }

            if (events.length) {
                var firstEvent = events[0];

                currentItem.setAttribute("aria-flowto",       firstEvent.id);
                firstEvent.setAttribute("x-ms-aria-flowfrom", currentItem.id);

                currentItem = events[events.length - 1];
            }

            if (nextHeader) {
                currentItem.setAttribute("aria-flowto",       nextHeader.id);
                nextHeader.setAttribute("x-ms-aria-flowfrom", currentItem.id);
            } else {
                var ariaEnd = document.getElementById("aria-flowend");

                currentItem.setAttribute("aria-flowto",    ariaEnd.id);
                ariaEnd.setAttribute("x-ms-aria-flowfrom", currentItem.id);
            }
        }

        this._ariaDirty = false;
    };

    proto._generateDatePickerConfig = function (today, startDate, isWorkWeek) {
        /// <summary>calculates the highlight and focus dates to use for the datepicker</summary>
        /// <param name="today" type="Date">the date to consider as today</param>
        /// <param name="startDate" type="Date">the first date displayed for the current week</param>
        /// <param name="isWorkWeek" type="Boolean">whether to calculate as a work week (excludes Sat, Sun)</param>
        /// <returns type="Object">data to use to configure the date picker containing the following
        ///     fields:
        ///         highlightDate:Array<Date> - array of the dates to highlight
        ///         focusDate:Date - the date to set as the focus date
        /// </returns>

        _start("_generateDatePickerConfig");

        // the config result that will be returned to the caller
        var result = {
            highlightDates: null,
            focusDate: null,
        };

        var highlights  = [],
            pickedToday = false,
            pickedDate  = new Date(today),
            months      = [];

        // add up to 7 highlight dates, but skip Sat/Sun if in work week view
        for (var i = 0; i < 7; ++i) {
            var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i),
                addDate = true;

            if (isWorkWeek) {
                var dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    addDate = false;
                }
            }

            // should we add this to the highlight?
            if (addDate) {
                highlights.push(date);

                // if today is in the week, we'll pick it for the month display
                if (Helpers.isSameDate(date, today)) {
                    pickedToday = true;
                }

                // if we haven't picked today yet, count the days from any month
                // this week crosses to determine which month to show
                if (!pickedToday) {
                    var month = date.getMonth();
                    if (months[month] === undefined) {
                        months[month] = {
                            count: 1,
                            year: date.getFullYear(),
                        };
                    } else {
                        ++months[month].count;
                    }
                }
            }
        }
        result.highlightDates = highlights;

        // if the month with today was not picked, we need to see which month
        // had the most days from this week
        if (!pickedToday) {
            var bestMonth = today.getMonth(),
                bestYear  = today.getFullYear(),
                count     = 0;

            for (var m in months) {
                var mCount = months[m].count;
                if (mCount > count) {
                    count = mCount;
                    bestMonth = m;
                    bestYear = months[m].year;
                }
            }

            // start on that month
            pickedDate = new Date(bestYear, bestMonth, 1);
        } else {
            // start at the start of the month containing today
            pickedDate.setDate(1);
        }
        result.focusDate = pickedDate;

        _stop("_generateDatePickerConfig");

        return result;
    };

    proto._configureDatePicker = function () {
        /// <summary>call prior to showing the date picker in order to ensure that the values
        ///     for display are up to date for the currently displayed week</summary>

        _start("_configureDatePicker");

        var datePicker  = this._datePicker,
            realized    = this._timeline.getRealized()[0],
            today       = Calendar.getToday(),
            config;

        // set today
        datePicker.setToday(today);

        var startDate = this.getItem(realized.index);

        config = this._generateDatePickerConfig(today, startDate, this._isWorkWeek);
        datePicker.setHighlightDates(config.highlightDates);
        datePicker.setFocusDate(config.focusDate);
        _stop("_configureDatePicker");
    };

    proto._renderer = function(week) {
        _start("_renderer");

        var data = {
            context: this,
            week: week,
            uid:  "weekview" + Jx.uid(),

            header:      this._getHeaderText(week),
            headerClass: "header"
        };

        if (week.isThisWeek) {
            data.headerClass += " thisWeek";
        }

        var html = tmplItem(data);

        _stop("_renderer");
        return html;
    };

    proto._recycler = function(old, data) {
        _start("_recycler");

        var week = data.item,
            el   = data.el;

        // the element needs to reference the week its currently for
        el._week  = week;
        el.jobset = data.jobset;

        // update our header first
        DatePickerAnchor.applyHeaderText(el._header, this._getHeaderText(week));

        // default the header to inactive
        DatePickerAnchor.deactivateHeader(el._header);

        if (old.isThisWeek) {
            Jx.removeClass(el._header, "thisWeek");
        }

        if (week.isThisWeek) {
            Jx.addClass(el._header, "thisWeek");
        }

        // now update the dates for the week.
        var dayDate = week.getDate(),
            day     = new Date(week.getFullYear(), week.getMonth(), dayDate);

        // we put a special class on the element for today
        var formatter = this._getHeaderFormatter(week),
            todayDate = -1;

        if (week.isThisWeek) {
            todayDate = this._today.getDate();
        }

        var i;
        for (i = 0; i < 7; i++) {
            var dayEl = el._headerDays[i];

            if (dayDate === todayDate) {
                Jx.addClass(dayEl, "today");
                dayEl._isToday = true;

                this._showTimeIndicator(el._grid.children[i+1]);
            } else if (dayEl._isToday) {
                Jx.removeClass(dayEl, "today");
                dayEl._isToday = false;
            }

            dayEl.innerHTML = formatter.format(day);
            dayEl.setAttribute("aria-label", _longDate.format(day));
            
            day.setDate(dayDate + 1);
            dayDate = day.getDate();
        }

        for (i = 0; i < 7; i++) {
            var allDay = el._allDayEvents[i];

            allDay.innerHTML = "";
            allDay.style.opacity = 0;

            var events = el._gridEvents[i];

            events.innerHTML = "";
            events.style.opacity = 0;
        }

        // Recycled weeks don't require getScrollTop since they only come from panning.
        _start("_recycler:scrollGrid");
        el._grid.style.msOverflowStyle = "none";
        el._grid.scrollTop = this._isTall ? Week._fourAmOffset : Week._nineAmOffset;
        el._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";
        _stop("_recycler:scrollGrid");

        // get and process events
        this._getEvents(week, el);
        _stop("_recycler");
    };

    proto._createEvent = function(ev, element, startDate, allDayEvent, focusRestore) {
        ev.stopPropagation();

        if (ev.ctrlKey) {
            if (!this._quickEvent || !this._quickEvent.isOpen()) {
                this.fire("createEvent", {startDate: startDate, allDayEvent: allDayEvent});
            } else if (this._quickEvent) {
                this._quickEvent.onDismiss();
            }
        } else {
            if (!this._quickEvent) {
                this._quickEvent = new Calendar.Controls.QuickEvent(Calendar.Views.Manager.Views.week);
                this.appendChild(this._quickEvent);
            }
            
            this._quickEvent.activateUI(element, startDate, allDayEvent, null, focusRestore);
        }            
    };    
});
