
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />
/// <reference path="..\datepicker\DatePickerAnchor.js" />
/// <reference path="..\datepicker\DatePicker.js" />

/*jshint browser:true*/
/*global Calendar,WinJS,Jx,Debug,People,setImmediate*/

Jx.delayDefine(Calendar.Views, "Day", function() {

    function _info(evt)  { Jx.mark("Calendar:Day." + evt + ",Info,Calendar"); }
    function _start(evt) { Jx.mark("Calendar:Day." + evt + ",StartTA,Calendar"); }
    function _stop(evt)  { Jx.mark("Calendar:Day." + evt + ",StopTA,Calendar");  }

    var Helpers = Calendar.Helpers;
    var DatePickerAnchor = Calendar.Controls.DatePickerAnchor;
    var Animation = WinJS.UI.Animation;
    var _longDate = new Jx.DTFormatter("longDate");

    function tmplHost (data) {
        var html = 
            '<div id="' + data.id + '" class="dayview">' +
                '<div id="aria-flowstart" role="listitem"></div>' +
                '<div class="timeline-host"></div>' +
                '<div id="aria-flowend" role="listitem"></div>' +
                '<div class="dp-anchor"></div>' +
            '</div>';
        return html;
    }

    function tmplDay (data) {
        var html =
            '<div class="day">' +
                '<div class="header">' +
                    '<div class="dayName">' + 
                        '<div class="dateAnchor">' + 
                            '<div class="anchorText" id="da-' + data.uid + '" role="heading" tabindex="0">' + 
                                Jx.escapeHtml(data.name) + 
                            '</div>' + 
                            '<div class="dateChevron" aria-hidden="true"></div>' + 
                        '</div>' + 
                    '</div>' +
                    '<div class="fullDate">' + 
                        '<div class="fullDate-text" id="date-' + data.uid + '" tabindex="0" role="button" aria-label="' + Jx.escapeHtml(data.longDate) + '">' + 
                            Jx.escapeHtml(this._getFullDate(data.day, data.isToday, data.isTomorrow, data.isYesterday)) + 
                        '</div>' + 
                    '</div>' +
                '</div>' +
                '<div class="allDay">' +
                    '<div class="events">' +
                        '<div class="container"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="allDaySpacer">' +
                    '<div class="events"></div>' +
                '</div>' +
                '<div class="grid">' +
                    '<div class="hours" id="hours" aria-hidden="true">' + Helpers.getHoursHtml() + '</div>' +
                    '<div class="events" id="events" role="list">' +
                        '<div class="container"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        return html;
    }

    var Day = Calendar.Views.Day = function() {
        // call the jx component initialization code
        this.initComponent();
        this._id = "calDay";

        // do some one-time initialization
        if (!Day._name) {
            Helpers.ensureFormats();

            Day._name = "Calendar.Views.Day";
            Day._fourAmOffset = 240;
            Day._nineAmOffset = 540;

            // localization
            Day._yesterday = Jx.res.getString("Yesterday");
            Day._today     = Jx.res.getString("Today");
            Day._tomorrow  = Jx.res.getString("Tomorrow");

            // _fullDateWithDay can't use the Jx wrapper because the wrappers are created on demand and the customization requires an instance of DateTimeFormatter
            Day._fullDate        = new Jx.DTFormatter("month day year");
            Day._fullDateWithDay = new (Jx.dtf())("dayofweek month day year");
            Day._updateFormatsForLanguage(Day._fullDateWithDay.resolvedLanguage.split("-")[0]);
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
    };
    
    Jx.augment(Day, Jx.Component);

    Day._updateFormatsForLanguage = function (language) {
        _start("_updateFormatsForLanguage");

        switch (language) {
            case "ta":
                Day._fullDateWithDay = new Jx.DTFormatter("dayofweek.abbreviated month day year");
                break;
        }

        _stop("_updateFormatsForLanguage");
    };

    var proto = Day.prototype;

    proto.setFocusedDay = function(day) {
        // get the date without any hours, minutes, or seconds.
        // we do this because rounding below can round up a day if we're more than
        // 12 hours from midnight.  we have to round, because otherwise dst
        // differences throw us off by a day.
        day = new Date(day.getFullYear(), day.getMonth(), day.getDate());

        // force date into valid range
        if (day < Calendar.FIRST_DAY)
        {
            _info("Day for " + Day._name + " is out of bounds (" + day + " < " + Calendar.FIRST_DAY + ").");
            day = Calendar.FIRST_DAY;
        }
        else if (day > Calendar.LAST_DAY)
        {
            _info("Day for " + Day._name + " is out of bounds (" + day + " > " + Calendar.LAST_DAY  + ").");
            day = Calendar.LAST_DAY;
        }

        // set our focused index
        this._focusedIndex = Math.round((day - this._today) / Helpers.dayInMilliseconds);

        if (this._timeline) {
            this._timeline.setFocusedIndex(this._focusedIndex);
        }
    };

    proto.getFocusedDay = function() {
        return this.getItem(this._focusedIndex);
    };

    proto.getState = function() {
        var state = null;

        if (this._timeline) {
            var realized  = this._timeline.getRealized(),
                positions = {};

            for (var i = 0, len = realized.length; i < len; i++) {
                var el  = realized[i].el,
                    day = el._day;
                positions[day] = el._grid.scrollTop;
            }

            state = {
                width:     this._host.offsetWidth,
                positions: positions
            };
        }

        return state;
    };

    proto.setState = function(state) {
        Debug.assert(!this._host);
        this._lastWidth = state.width;
        this._positions = state.positions;
    };

    proto.focusEvent = function (eventInfo) {
        /// <summary>Shifts the current view so that a particular date range is in view</summary>
        /// <param name="eventInfo" type="Object">Object containing at least the following event info: startDate, endDate, allDayEvent</param>

        this._eventToFocus = eventInfo;

        if (this._host) {
            this._focusEventDay();

            if (this._eventToFocus) {
                var realized = this._timeline.getRealized(),
                    first    = realized[0].el;

                first._grid.scrollTop = this._getScrollTop(first._day, first._grid);
            }
        }
    };

    proto.containsDate = function (date) {
        var focusedDay = this.getFocusedDay();
        return Helpers.isSameDate(date, focusedDay);
    };

    proto.setLoadAnimation = function(animation) {
        this._loadAnimation = animation;
    };

    proto.showDatePicker = function() {
        this._showDatePicker();
    };

    proto.getUI = function(ui) {
        ui.html = tmplHost.call(this, {
            id: this._id
        });
    };

    function qsa(el, query) {
        return Array.prototype.slice.call(el.querySelectorAll(query));
    }

    proto.activateUI = function(jobset) {
        // save params
        this._jobset = jobset;

        this._host = document.getElementById(this._id);
        this._dpAnchor = this._host.querySelector(".dp-anchor");
        this._getWorker();

        // check whether we're in rtl or portrait
        this._isTall = (1080 < this._host.offsetHeight);

        // listen for day changes
        this._updateToday(Calendar.getToday());
        Calendar.addListener("dayChanged", this._onDayChanged, this);

        // try focus our focused event
        this._focusEventDay();

        // get our ui settings
        var data = {};
        this.fire("getSettings", data);

        // create our timeline control
        var timeline = this._timeline = new Calendar.Controls.Timeline(this._host.querySelector(".timeline-host"), this._jobset, this, this._renderer, this._recycler);
        timeline.setAlwaysShowArrows(data.settings.get("alwaysShowArrows"));

        // listen for arrow setting changes
        this.on("showArrows",   this._onShowArrows);

        // listen for selection events from the date picker
        this.on("dateSelected", this._onDateSelected);

        this.on("setScrollable", this._onSetScrollable);

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

        // post-initialize all elements are present
        // perform animations
        var realized = this._timeline.getRealized(),
            headers  = [],
            others   = [];

        for (var i = 0, len = realized.length; i < len; i++) {
            var el     = realized[i].el,
                header = el._dayName,
                other  = el.querySelectorAll(".fullDate, .allDay, .grid");

            headers.push(header);
            others.push.apply(others, other);
        }

        var firstHeader = headers.shift(),
            firstOthers = others.splice(0, 3);

        var onAnimationDone = function () {
            this.fire("viewReady");
        }.bind(this);

        this._loadAnimation([firstHeader, firstOthers, headers, others]).done(onAnimationDone, onAnimationDone); // complete and error callbacks
    };

    proto.deactivateUI = function() {
        this._jobset.cancelAllChildJobs();

        // shut down date picker
        if (this._datePicker) {
            this.removeChild(this._datePicker);
            this._datePicker.shutdownUI();
            this._datePicker = null;
        }
        this._dpAnchor = null;

        // shut down our timeline
        this._timeline.shutdown();
        this._timeline.removeListener("itemRemoved",  this._onItemRemoved,  this);
        this._timeline.removeListener("itemRealized", this._onItemRealized, this);
        this._timeline.removeListener("focusChanged", this._onFocusChanged, this);
        this._timeline = null;

        if (this._quickEvent) {
            this._quickEvent.deactivateUI();
            this._quickEvent = null;
        }

        // remove listeners from and release our host
        this.detach("showArrows",   this._onShowArrows);
        this.detach("dateSelected", this._onDateSelected);
        this.detach("resizeWindow", this._onResizeWindow);
        this.detach("setScrollable", this._onSetScrollable);

        this._host.removeEventListener("keydown", this._onKeyDownNav, false);
        this._host.removeEventListener("keydown", this._onKeyDown,    false);
        this._host.removeEventListener("click",         this._onClick,       false);
        this._host.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._host = null;

        this._worker.removeListener("Day/getEvents",     this._onGetEvents,     this);
        this._worker.removeListener("Day/eventChanged",  this._onEventChanged,  this);
        this._worker.removeListener("Day/eventsChanged", this._onEventsChanged, this);
        this._worker.removeListener("Day/expandAllDay",  this._onExpandAllDay,  this);
        this._worker = null;

        Calendar.removeListener("dayChanged", this._onDayChanged, this);
        this._resetUiMembers();
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
        if (index < -this._left)  { throw new Error("Index for " + Day._name + " is out of bounds (" + index + " < " + (-this._left)  + ")."); }
        if (index >  this._right) { throw new Error("Index for " + Day._name + " is out of bounds (" + index + " > " +   this._right  + ")."); }

        return new Date(this._today.getFullYear(), this._today.getMonth(), this._today.getDate() + index);
    };

    Day._hourHeight = 60;

    proto._generateDatePickerConfig = function (today, displayedDates) {
        /// <summary>calculates the highlight and focus dates to use for the datepicker</summary>
        /// <param name="today" type="Date">the date to consider as today</param>
        /// <param name="displayedDates" type="Array">array of the dates currently being shown in the view</param>
        /// <returns type="Date">the date to set as the focus date</returns>

        _start("_generateDatePickerConfig");

        var pickedToday = false,
            pickedDate = new Date(today),
            months = [];

        // set the highlighted dates based on the currently visible days
        for (var i = 0, len = displayedDates.length; i < len; i++) {
            var date = displayedDates[i];

            // if today is in the current view, that wins
            if (Helpers.isSameDate(date, today)) {
                pickedToday = true;
            }

            // count the number of days belonging to each month
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

        // if today not already picked, compare month tallies
        if (!pickedToday) {
            var bestMonth = today.getMonth(),
                bestYear  = today.getFullYear(),
                count     = 0;

            // take month with most days in view
            for (var m in months) {
                var mCount = months[m].count;
                if (mCount > count) {
                    count = mCount;
                    bestMonth = m;
                    bestYear = months[m].year;
                }
            }

            pickedDate = new Date(bestYear, bestMonth, 1);
        } else {
            pickedDate.setDate(1);
        }

        _stop("_generateDatePickerConfig");

        return pickedDate;
    };

    proto._configureDatePicker = function () {
        /// <summary>call before showing the datepicker to make sure all the state
        ///     values are updated properly for the current view</summary>

        _start("_configureDatePicker");

        var datePicker = this._datePicker,
            realized = this._timeline.getRealized(),
            today = Calendar.getToday(),
            pickedDate = today,
            displayedDates = [],
            that = this;

        displayedDates = realized.map(function(obj){ return that.getItem(obj.index); });

        if (displayedDates.length > 0) {
            pickedDate = this._generateDatePickerConfig(today, displayedDates);
        } else {
            pickedDate.setDate(1);
        }

        datePicker.setToday(today);
        datePicker.setHighlightDates(displayedDates);
        datePicker.setFocusDate(pickedDate);
        _stop("_configureDatePicker");
    };

    proto._onFocusChanged = function(data) {
        this._focusedIndex = data.index;

        // set it active to ensure it gets keyboard events
        // exclude the date picker button from initial focus
        var firstInDay = data.el.querySelector("[tabindex]:not(.anchorText)");
        Jx.safeSetActive(firstInDay);

        // update the status of the current date chevron
        DatePickerAnchor.updateDatePickerButton(this._timeline, data);

        this._updateAria();
    };

    proto._onItemRealized = function(data) {
        _start("_onItemRealized");

        var day = data.item,
            el  = data.el;
        el.jobset = data.jobset;

        // the element needs to reference the day it's currently for
        el._day = day;

        // cache the divs we'll reuse for recycling
        el._dayName  = el.querySelector(".dayName");
        el._fullDate = el.querySelector(".fullDate-text");

        el._allDay = el.querySelector(".allDay > .events").firstElementChild;
        el._grid   = el.querySelector(".grid");
        el._events = el._grid.querySelector(".events").firstElementChild;
        el._grid._hours = el._grid.querySelector(".hours").children;

        // set the grid's scroll position to 9am
        el._grid.style.msOverflowStyle = "none";
        el._grid.scrollTop = this._getScrollTop(day, el._grid);
        el._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";

        this._initForDayType(day, el);

        // set up our calendar event processing
        this._getEvents(day, el);
        _stop("_onItemRealized");
    };

    proto._onItemRemoved = function(data) {
        var day = data.item,
            id  = day.workerId;

        if (day._data.isToday) {
            this._time.deactivateUI();
        }

        this._worker.postCommand("Day/cancel", null, id);
        delete this._workerIds[id];
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

    proto._onDayChanged = function (today) {
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
            var offset = Math.round((today - old) / Helpers.dayInMilliseconds);
            this._focusedIndex -= offset;
        }

        // re-initialize the timeline
        this._timeline.initialize(this._focusedIndex);
    };

    proto._getWorker = function() {
        Debug.assert(!this._worker);

        var data = {};
        this.fire("getPlatformWorker", data);

        this._worker = data.platformWorker;
        this._worker.addListener("Day/getEvents",     this._onGetEvents,     this);
        this._worker.addListener("Day/eventChanged",  this._onEventChanged,  this);
        this._worker.addListener("Day/eventsChanged", this._onEventsChanged, this);
        this._worker.addListener("Day/expandAllDay",  this._onExpandAllDay,  this);
    };

    proto._getEvents = function(day, el) {
        var year  = day.getFullYear(),
            month = day.getMonth(),
            date  = day.getDate();

        var start = new Date(year, month, date),
            end   = new Date(year, month, date + 1);

        // call our worker to get the actual events
        day.workerId = this._worker.postCommand("Day/getEvents", {
            start: start.getTime(),
            end:   end.getTime(),

            isVisible: el.jobset.isVisible
        });

        this._workerIds[day.workerId] = el;
    };

    proto._onGetEvents = function(data) {
        var el = this._workerIds[data.id];

        if (el) {
            _start("_onGetEvents");
            el.jobset.addUIJob(this, function() {
                _start("_onGetEvents:inner");

                // set the html
                el._allDay.innerHTML = data.allDayHtml;
                el._events.innerHTML = data.eventHtml;

                // fade in our event ui
                Animation.fadeIn([el._allDay, el._events]).done();

                this._updateAria();
                _stop("_onGetEvents:inner");
            }, null, People.Priority.userTileRender);
            _stop("_onGetEvents");
        }
    };

    proto._onEventsChanged = function(data) {
        var el = this._workerIds[data.id];

        if (el) {
            el.jobset.addUIJob(this, function() {
                _start("_onEventsChanged");

                var oldAllDay = el._allDay,
                    oldEvents = el._events;

                el._allDay = oldAllDay.cloneNode(false);
                el._events = oldEvents.cloneNode(false);

                el._events.style.opacity = "0";
                el._allDay.style.opacity = "0";

                el._allDay.innerHTML = data.allDayHtml;
                el._events.innerHTML = data.eventHtml;

                oldAllDay.parentElement.appendChild(el._allDay);
                oldEvents.parentElement.appendChild(el._events);

                setImmediate(function() {
                    WinJS.UI.executeTransition([el._allDay, el._events], {
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
                            oldAllDay.outerHTML = "";
                            oldEvents.outerHTML = "";
                        }
                    });
                });

                this._updateAria();
                _stop("_onEventsChanged");
            }, null, People.Priority.slowData);
        }
    };

    Day._properties = {
        busyStatus: "update",
        color:      "update",
        location:   "update",
        subject:    "update",
    };

    proto._onEventChanged = function(data) {
        _start("_onEventChanged");

        var properties = data.properties,
            updates    = [];

        for (var i = 0, len = properties.length; i < len; i++) {
            var property = properties[i];

            if (Day._properties[property]) {
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

    Day._updateBusyStatus = function(el, ev) {
        var glyph = el.querySelector(".glyph");

        Animation.fadeOut(glyph).done(function() {
            el.setAttribute("data-status", Helpers.busyStatusClasses[ev.busyStatus]);
            Animation.fadeIn(glyph).done();
        });
    };

    Day._updateColor = function(el, ev) {
        var color = Helpers.processEventColor(ev.color);

        el.style.color = color;
        el.querySelector(".glyph").style.backgroundColor = color;
    };

    Day._updateLocation = function(el, ev) {
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
                Animation.fadeIn(propEl).done();
            });
        }
    };

    Day._updateSubject = function(el, ev) {
        var propEl = el.querySelector(".subject");

        // update event fields
        Animation.fadeOut(propEl).done(function () {
            propEl.innerText = ev.subject;
            Animation.fadeIn(propEl).done();
        });
    };

    Day._updateFns = {
        busyStatus: Day._updateBusyStatus,
        color:      Day._updateColor,
        location:   Day._updateLocation,
        subject:    Day._updateSubject
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
                    fn       = Day._updateFns[property];

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
            el._allDay.innerHTML = data.html;
        }
    };

    proto._onMoreClick = function(el) {
        var root = this._getItemRoot(el),
            day  = root._day;

        // update the ui
        root._allDay.innerHTML = "";

        // make sure keyboard keeps working for this day
        var firstInDay = root.querySelector("[tabindex]");
        Jx.safeSetActive(firstInDay);

        this._worker.postCommand("Day/expandAllDay", null, day.workerId);
    };

    proto._onAllDayClick = function(el, ev) {
        var root = this._getItemRoot(el),
            day  = root._day;

        var startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());

        this._createEvent(ev, root._allDay.parentNode, startDate, true, root._fullDate);
    };

    proto._onGridClick = function(el, ev) {
        var root = this._getItemRoot(el),
            day  = root._day;

        // figure out our pointer offset from the root of the grid
        var offset = ev.offsetY;
        for (var target = ev.target; target !== el; target = target.parentElement) {
            offset += target.offsetTop;
        }

        // get the hour that was clicked on
        var index   = Math.floor(Math.max(0, offset) / Day._hourHeight),
            clicked = el._hours[index];

        // only act if the element that was clicked was the same that was originaly focused
        if (clicked === this._focused) {
            var startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), index);

            this._createEvent(ev, root._events.parentNode, startDate, false, root._fullDate);
        }
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
            datePicker.addCustomClass("dayviewPicker");  // don't set to normal view class, or style cross-contamination can occur
            datePicker.showFreeBusy = false;
            datePicker.setToday(today);
            datePicker.setFocusDate(today);
            datePicker.clientView = DatePicker.ClientView.day;

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
            if (!this._quickEvent || !this._quickEvent.isOpen()) {
                Helpers.editEvent(this, el.getAttribute('data-handle'), el);
            } else if (this._quickEvent) {
                this._quickEvent.onDismiss();
            }
        } else if (Jx.hasClass(el, "fullDate-text")) {
            var root = this._getItemRoot(el),
                now  = new Date(),
                day  = root._day;

            var startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), now.getHours());

            this._createEvent(ev, root._events.parentNode, startDate, false, root._fullDate);
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
                if (classes.contains("grid")) {
                    var index = Math.floor(Math.max(0, offset) / Day._hourHeight);
                    focused = el._hours[index];
                    break;
                }

                // otherwise it'll be on particular elements
                if (classes.contains("event") || classes.contains("more") || classes.contains("allDay") || classes.contains("fullDate") || classes.contains("activeAnchor")) {
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
                var el = ev.target;

                // if the target is the grid itself, we're on the scrollbar and shouldn't
                // focus anything at all.
                if (!el.classList.contains("grid")) {
                    // find out which element was actually the target of our press
                    while (el && el !== this._host) {
                        var classes = el.classList,
                            capture = false;

                        // we want to animate events and the "X more" button
                        if (classes.contains("event") || classes.contains("more")) {
                            // Don't do press animation if quick event is open.
                            if (!this._quickEvent || !this._quickEvent.isOpen()) {
                                Animation.pointerDown(el);
                                el.animatedDown = true;
                            }

                            capture = true;
                        } else if (classes.contains("grid") || classes.contains("allDay") || classes.contains("fullDate") || classes.contains("activeAnchor")) {
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

                        el = el.parentElement;
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
            if (this._pressed.animatedDown) {
                Animation.pointerUp(this._pressed);
            }

            // remove our listeners
            this._host.removeEventListener("MSPointerCancel", Helpers._onClick, false);

            // handle the potential click
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

                    if (classes.contains("grid")) {
                        if (el === this._pressed) {
                            this._onGridClick(el, ev);
                        }

                        break;
                    }

                    if (classes.contains("allDay")) {
                        if (el === this._pressed) {
                            this._onAllDayClick(el, ev);
                        }

                        break;
                    }

                    if (classes.contains("fullDate")) {
                        if (el === this._pressed) {
                            var root = this._getItemRoot(el),
                                now  = new Date(),
                                day  = root._day;

                            var startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), now.getHours());

                            this._createEvent(ev, root._events.parentNode, startDate, false, root._fullDate);
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

    proto._handleLeft = function(realized, root) {
        // get the index of the currently focused day, as well as the previous
        var rootIndex = realized.indexOf(root),
            previous  = realized[rootIndex-1];

        // if there is a previous day, focus the first focusable thing in it
        if (previous) {
            var el = previous.querySelector("[tabindex]");
            Debug.assert(el);

            el.focus();
            return true;
        }

        return false;
    };

    proto._handleRight = function(realized, root) {
        // get the index of the currently focused day, as well as the next
        var rootIndex = realized.indexOf(root),
            next      = realized[rootIndex+1];

        // if there is a next day, focus the first focusable thing in it
        if (next) {
            var el = next.querySelector("[tabindex]");
            Debug.assert(el);

            el.focus();
            return true;
        }

        return false;
    };

    proto._handleUp = function(realized, root, current) {
        // get a list of all the focusable things in the current day,
        // the index of the current focused item, and the previous item.
        var els      = qsa(root, "[tabindex]"),
            index    = els.indexOf(current),
            previous = els[index-1];

        // if there is a previous item, focus it
        if (previous) {
            previous.focus();
            return true;
        }

        return false;
    };

    proto._handleDown = function(realized, root, current) {
        // get a list of all the focusable things in the current day,
        // the index of the current focused item, and the next item.
        var els   = qsa(root, "[tabindex]"),
            index = els.indexOf(current),
            next  = els[index+1];

        // if there is a next item, focus it
        if (next) {
            next.focus();
            return true;
        }

        return false;
    };

    proto._handleTab = function(realized, root, current, isShiftPressed) {
        var result;

        // a plain tab tries to go down.  then, if that failed, to the right.
        if (!isShiftPressed) {
            result = this._handleDown(realized, root, current) ||
                     this._handleRight(realized, root, current);
        } else {
            // a shift tab tries to go up.
            result = this._handleUp(realized, root, current);

            // if that failed, we go to the last item in the previous day
            if (!result) {
                // get the index of the currently focus day,
                // as well as the previous day.
                var rootIndex = realized.indexOf(root),
                    previous  = realized[rootIndex-1];

                // if there is a previous day, try focus the last item.
                if (previous) {
                    // get all the focusable items, as well as the last item.
                    var els  = qsa(previous, "[tabindex]"),
                        last = els[els.length-1];

                    // if there is a last item, focus it
                    if (last) {
                        last.focus();
                        result = true;
                    }
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

            // we'll need the realized list for all subsequent branches
            var realized = this._timeline.getRealized().map(function(data) { return data.el; });
            Debug.assert(realized.length);

            // if we don't have a currently focused element, choose the first one
            var current = this._host.querySelector(":focus");
            while (current && !current.hasAttribute("tabIndex")) {
                current = current.parentElement;
            }

            if (!current) {
                realized[0].querySelector(".fullDate-text").focus();
                return;
            }

            // if we do have a focused element, what we do depends on what key was pressed
            var root = this._getItemRoot(current);

            switch (code) {
            case codes.leftarrow:
                this._handleLeft(realized, root, current);
                break;

            case codes.rightarrow:
                this._handleRight(realized, root, current);
                break;

            case codes.uparrow:
                this._handleUp(realized, root, current);
                break;

            case codes.downarrow:
                this._handleDown(realized, root, current);
                break;

            case codes.tab:
                this._handleTab(realized, root, current, ev.shiftKey);
                break;
            }
        }
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
        // only do work if we're activated
        if (this._host && (!this._quickEvent || !this._quickEvent.isOpen())) {
            this._isTall = (1080 < this._host.offsetHeight);
        }
    };

    proto._resetUiMembers = function () {
        _start("resetUiMembers");
        this._updateToday(Calendar.getToday());
        this._host   = null;
        this._jobset = null;

        this._time = null;

        this._focusedIndex = 0;
        this._eventToFocus = null;

        this._lastWidth = null;
        this._positions = {};
        this._workerIds = {};

        this._ariaDirty = false;
        _stop("resetUiMembers");
    };

    proto._updateToday = function(today) {
        if (!this._today || !Helpers.isSameDate(today, this._today)) {
            this._today = today;

            // we have to round these, because dst can slightly throw things off
            this._left  = Math.round((today - Calendar.FIRST_DAY) / Helpers.dayInMilliseconds);
            this._right = Math.round((Calendar.LAST_DAY - today)  / Helpers.dayInMilliseconds);
        }
    };

    proto._getItemRoot = function(el) {
        while (el && !Jx.hasClass(el, "day")) {
            el = el.parentNode;
        }

        return el;
    };

    proto._getDayName = function(day, isToday, isTomorrow, isYesterday) {
        if (isToday) {
            return Day._today;
        }

        if (isTomorrow) {
            return Day._tomorrow;
        }

        if (isYesterday) {
            return Day._yesterday;
        }

        return Helpers.getDay(day.getDay());
    };

    proto._getFullDate = function(day, isToday, isTomorrow, isYesterday) {
        var formatter = Day._fullDate;

        if (isToday || isTomorrow || isYesterday) {
            formatter = Day._fullDateWithDay;
        }

        return formatter.format(day);
    };

    proto._processDay = function(day) {
        var data = day._data = Helpers.getDayInfo(this._today, day);

        // we also care whether or not this is a weekend
        var dayOfWeek = day.getDay(),
            isWeekend = dayOfWeek === 6 || (Calendar.DAYS_IN_WEEKEND === 2 && dayOfWeek === 0);

        data.isWeekend = isWeekend;
        data.longDate  = _longDate.format(day);

        return data;
    };

    proto._initForDayType = function(day, el) {
        // set a special class on today
        var data      = day._data,
            className = "";

        if (data.isToday) {
            className += "today";
            this._showTimeIndicator(el._grid.querySelector(".hours"));
        }

        if (data.isWeekend) {
            className += " weekend";
        }

        if (className) {
            el.className  = "day " + className;
            el._className = className;
        } else if (el._className) {
            el.className = "day";
            el._className = "";
        }
    };

    proto._focusEventDay = function () {
        _start("focusEventDay");
        // if we don't have an event to focus, we have nothing to do
        if (this._eventToFocus) {
            // if our current width does not match our last width, all bets are off
            // and we need to fully focus the event.
            var setFocusedDay = (this._host.offsetWidth !== this._lastWidth),
                startDate     = this._eventToFocus.startDate;

            // if the widths matched, we might have had the event's day in view already
            if (!setFocusedDay) {
                var day = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

                // based on whether we have a position for this day, we might not
                // have to switch focus
                setFocusedDay = !(day in this._positions);
            }

            // if we have to switch focus, do so
            if (setFocusedDay) {
                this.setFocusedDay(startDate);
            }
        }
        _stop("focusEventDay");
    };

    proto._getScrollTop = function (day, el) {
        _start("getScrollTop");
        var scrollTop;

        if (day in this._positions) {
            scrollTop = this._positions[day];
        } else if (this._isTall) {
            scrollTop = Day._fourAmOffset;
        } else {
            scrollTop = Day._nineAmOffset;
        }

        if (this._eventToFocus && !this._eventToFocus.allDayEvent) {
            // we only need to do work if the event is on this day and it's not an all day event
            if (Helpers.isSameDate(day, this._eventToFocus.startDate)) {
                scrollTop = Helpers.getIdealScrollTop(this._eventToFocus, el, scrollTop);

                // we no longer have an event to focus
                this._eventToFocus = null;
            }
        }

        _stop("getScrollTop");

        return scrollTop;
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

        var realized = this._timeline.getRealized();

        // loop through our realized items, and set up their aria flow order
        for (var i = 0, len = realized.length; i < len; i++) {
            var current = realized[i],
                next    = realized[i + 1];

            // get all the tab stops in the current day, and specifically pick out
            // the last tab stop.
            var currentStops = current.el.querySelectorAll("[tabindex]"),
                lastStop     = currentStops[currentStops.length - 1];

            // if this is the first iteration of the loop, our first tab stop has
            // nowhere to flow from.
            if (i === 0) {
                var ariaStart = document.getElementById("aria-flowstart"),
                    firstStop = currentStops[0];

                ariaStart.setAttribute("aria-flowto",        firstStop.id);
                firstStop.setAttribute("x-ms-aria-flowfrom", ariaStart.id);
            }

            // if we have a next item, flow to it.  otherwise, stop.
            if (next) {
                var nextStop = next.el.querySelector("[tabindex]");

                lastStop.setAttribute("aria-flowto",        nextStop.id);
                nextStop.setAttribute("x-ms-aria-flowfrom", lastStop.id);
            } else {
                var ariaEnd = document.getElementById("aria-flowend");

                lastStop.setAttribute("aria-flowto",       ariaEnd.id);
                ariaEnd.setAttribute("x-ms-aria-flowfrom", lastStop.id);
            }

            // update the remaining links
            var dayItemLast = currentStops.length - 1;
            for (var dayItemIndex = 0; dayItemIndex < dayItemLast; ++dayItemIndex) {
                var prevDayItem = currentStops[dayItemIndex],
                    nextDayItem = currentStops[dayItemIndex + 1];

                prevDayItem.setAttribute("aria-flowto", nextDayItem.id);
                nextDayItem.setAttribute("x-ms-aria-flowfrom", prevDayItem.id);
            }
        }

        this._ariaDirty = false;
    };

    proto._renderer = function(day) {
        var data = this._processDay(day);

        data.uid  = "dayview" + Jx.uid();
        data.name = this._getDayName(day, data.isToday, data.isTomorrow, data.isYesterday);

        return tmplDay.call(this, data);
    };

    proto._recycler = function(old, data) {
        var day = data.item,
            el  = data.el;

        // the element needs to reference the day it's currently for
        el._day   = day;
        el.jobset = data.jobset;

        // get some basic information about the day
        var info = this._processDay(day);

        // update the header
        DatePickerAnchor.applyHeaderText(el._dayName, this._getDayName(day, info.isToday, info.isTomorrow, info.isYesterday));

        el._fullDate.firstChild.nodeValue = this._getFullDate(day, info.isToday, info.isTomorrow, info.isYesterday);
        el._fullDate.setAttribute("aria-label", info.longDate);

        // default the header to inactive
        DatePickerAnchor.deactivateHeader(el._dayName);
        
        // clear out existing events
        if (el._allDay.firstChild) {
            el._allDay.innerHTML = "";
        }
        el._allDay.style.opacity = 0;

        if (el._events.firstChild) {
            el._events.innerHTML = "";
        }
        el._events.style.opacity = 0;

        this._initForDayType(day, el);

        // scroll to 9am
        el._grid.style.msOverflowStyle = "none";
        el._grid.scrollTop = this._isTall ? Day._fourAmOffset : Day._nineAmOffset;
        el._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";

        // get and process events
        this._getEvents(day, el);
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
                this._quickEvent = new Calendar.Controls.QuickEvent(Calendar.Views.Manager.Views.day);
                this.appendChild(this._quickEvent);
            }
            
            this._quickEvent.activateUI(element, startDate, allDayEvent, null, focusRestore);
        }            
    };    
});