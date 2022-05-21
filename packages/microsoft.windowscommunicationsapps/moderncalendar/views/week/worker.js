
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Week.js" />

/*global Jx,Debug,Calendar,clearTimeout,setTimeout,setImmediate*/

(function() {

    function _start(evt) { Jx.mark("Calendar:WeekWorker." + evt + ",StartTA,Calendar"); }
    function _stop(evt)  { Jx.mark("Calendar:WeekWorker." + evt + ",StopTA,Calendar");  }

    var Helpers = Calendar.Helpers;

    function tmplAllDayEvent(data) {
        var startHtml = data.start ? '<div class="startTime" aria-hidden="true">' + data.start + '</div>' : '';
        var endHtml = data.end ? '<div class="endTime" aria-hidden="true">' + data.end + '</div>' : '';

        var html =
            '<div id="' + Helpers.getIdFromEventHandle(data.handle, data.isCrossDay) + '" data-handle="' + data.handle + '" class="event" style="color:' + data.color + ';" data-status="' + data.status + '" tabIndex="0" data-order="' + data.order + '" role="button" aria-label="' + Jx.escapeHtml(data.label) + '">' +
                '<div class="glyph" style="background-color:' + data.color + ';">' + 
                    '<div class="glyphInner"></div>' + 
                '</div>' +
                startHtml +
                '<div class="subject" aria-hidden="true">' + Jx.escapeHtml(data.subject) + '</div>' +
                endHtml +
                '<div class="overlay"></div>' +
            '</div>';

        return html;
    }

    function tmplDetailsOneLine(data) {
        var locationHtml = data.location ? '(' + Jx.escapeHtml(data.location) + ')' : '';

        var html =
            '<span class="subject">' + Jx.escapeHtml(data.subject) + '</span>' + 
            ' ' +
            '<span class="location">' + locationHtml + '</span>';

        return html;
    }

    function tmplDetails(data) {
        var html =
            '<div class="subject">' + Jx.escapeHtml(data.subject) + '</div>' + 
            '<div class="location">' + Jx.escapeHtml(data.location) + '</div>';

        return html;
    }

    function tmplEvent(data) {
        var detailHtml = data.isOneLine ? tmplDetailsOneLine(data) : tmplDetails(data);

        var html =
            '<div id="' + Helpers.getIdFromEventHandle(data.handle, data.isCrossDay) + '" data-handle="' + data.handle + '" class="' + data.className + '" data-status="' + data.status + '" tabIndex="0" data-order="' + data.order + '" role="button" aria-label="' + Jx.escapeHtml(data.label) + '" style="' +
                'position: absolute;' +
                'top:' + data.top + '%;' +
                data.dir + ':' + data.left + '%;' +
                'width:' + data.width + ';' +
                'height:' + data.height + '%;' +
                'color:' + data.color + ';' +
                '">' +
                '<div class="glyph" style="background-color:' + data.color + ';' + data.glyphHeight + ';">' + 
                    '<div class="glyphInner"></div>' + 
                '</div>' +
                '<div class="details" aria-hidden="true">' +
                    detailHtml + 
                '</div>' +
                '<div class="overlay"></div>' +
            '</div>';

        return html;
    }

    var Week = Calendar.Views.WeekWorker = function(router, scheduler, calendarManager) {
        // save params
        this._router    = router;
        this._scheduler = scheduler;
        this._manager   = calendarManager;

        // init members
        this._requests = {};

        // bind callbacks
        this._updateEvents = this._updateEvents.bind(this);

        // register routes
        this._router.route("Week/getEvents",    this.getEvents,    this);
        this._router.route("Week/setVisible",   this.setVisible,   this);
        this._router.route("Week/expandAllDay", this.expandAllDay, this);
        this._router.route("Week/cancel",       this.cancel,       this);

        if (!Week._allDayMore) {
            Helpers.ensureFormats();
            Week._allDayMore = Jx.res.getFormatFunction("AllDayMore");
        }
    };

    var proto = Week.prototype;

    proto.getEvents = function(command) {
        Debug.assert(!this._requests[command.id]);

        var id   = command.id,
            data = command.data;

        data.id    = id;
        data.start = new Date(data.start);
        data.end   = new Date(data.end);

        _start("getEvents");
        data.collection = this._manager.getEvents(data.start, data.end);
        data.job        = this._scheduler.schedule(this._splitEventsByDay, this, [data], data.isVisible);
        _stop("getEvents");

        this._requests[id] = data;
    };

    proto.setVisible = function(command) {
        var data = command.data;

        if (data) {
            data.isVisible = command.data;
            this._scheduler.setVisible(data.job, command.data);
        }
    };

    proto.expandAllDay = function(command) {
        var data = this._requests[command.id];

        if (data) {
            var index = command.data.index;
            this._scheduler.schedule(this._expandAllDay, this, [data, index], true);
        }
    };

    proto.cancel = function(command) {
        _start("cancel");

        var id   = command.id,
            data = this._requests[id];

        if (data) {
            var onCollectionChanged = data.onCollectionChanged;

            if (onCollectionChanged) {
                data.collection.removeEventListener("collectionchanged", onCollectionChanged);
                // data.changeTimeout may be an integer, null or true
                // True is used to prevent _onCollectionChanged from firing multiple setImmedites.
                if (data.changeTimeout !== true) {
                    clearTimeout(data.changeTimeout);
                }
            }

            this._unhookEvents(data);
            data.collection.dispose();

            this._scheduler.cancel(data.job);
            delete this._requests[command.id];
        }

        _stop("cancel");
    };

    proto.dispose = function() {
        for (var id in this._requests) {
            this.cancel({ id: id });
        }

        this._requests = {};

        this._manager   = null;
        this._scheduler = null;
        this._router    = null;
    };

    proto._splitEventsByDay = function(data) {
        _start("_splitEventsByDay");

        // get the start times of each day this week
        var startWeek = new Date(data.start);
        var endWeek   = (new Date(startWeek.getFullYear(), startWeek.getMonth(), startWeek.getDate() + 7)).getTime();
        var times     = new Array(7);
        var day       = new Date(startWeek);
        var i, len;

        for (i = 0; i < 7; i++) {
            times[i] = day.getTime();
            day.setDate(day.getDate() + 1);
        }

        // this is a two-pass process:
        //   1. split the events up into the proper days.
        //   2. lay out the events for each day within that day.

        var events     = [[], [], [], [], [], [], []];
        var first      = 0;
        var collection = Helpers.getCollection(startWeek, endWeek, data.collection);

        if (data.requiresSort) {
            collection.sort(Helpers.orderEvents);
            data.requiresSort = false;
        }

        for (i = 0, len = collection.length; i < len; i++) {
            var current    = collection[i];

            var winrt      = current.winrt;
            var startDate  = winrt.startDate;
            var endDate    = winrt.endDate;
            var start      = current.start;
            var end        = current.end;
            var isMultiDay = false;
            var isCrossDay = !Helpers.isSameDate(startDate, endDate);

            // calculate if this is a multi-day event
            if (!winrt.allDayEvent && isCrossDay) {
                // we only care about events that span a full day
                var nextDay = new Date(startDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);

                if (nextDay <= endDate) {
                    isMultiDay = true;
                }
            }

            // the start date could be way before this week.  make sure we
            // don't waste time looping through irrelevant days
            if (start < times[0]) {
                startDate = new Date(startWeek);
            } else {
                // we want to move the start to the beginning of the day
                startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            }

            // loop through the days of this week, seeing which days this
            // event falls on
            while (times[first] < startDate && first < 7) {
                first++;
            }

            if (start === end && first < 7) {
                events[first].push({ start: start, end: end, isMultiDay: isMultiDay, isCrossDay: isCrossDay, winrt: winrt });
            } else {
                for (var j = first; j < 7 && startDate < end; j++) {
                    events[j].push({ start: start, end: end, isMultiDay: isMultiDay, isCrossDay: isCrossDay, winrt: winrt });
                    startDate.setDate(startDate.getDate() + 1);
                }
            }
        }

        // start building the ui
        data.events = events;
        data.days   = new Array(7);
        data.job    = this._scheduler.schedule(this._processEvents, this, [data], data.isVisible);

        _stop("_splitEventsByDay");
    };

    proto._processEvents = function(data) {
        _start("_processEvents");

        var week = data.start;
        var eventEndBorders = {};
        var events;
        var i;
        var len;
        var current;

        for (var index = 0; index < 7; index++) {
            var day = data.days[index] = new Date(week.getFullYear(), week.getMonth(), week.getDate() + index);
            var dayStart = day.getTime();

            events = data.events[index];
            events.allDay = 0;

            var columns = [],
                cluster = { width: 1 },
                max     = 0;

            var j, k, column;

            for (i = 0, len = events.length; i < len; i++) {
                // get the current event
                current = events[i];
                var winrt = current.winrt;

                if (!winrt.allDayEvent && !current.isMultiDay) {
                    // cache some commonly used values
                    var startDate = winrt.startDate,
                        endDate   = winrt.endDate;

                    if (day < startDate) {
                        current.dayStart = dayStart + startDate.getHours() * Helpers.hourInMilliseconds + startDate.getMinutes() * Helpers.minuteInMilliseconds;
                    } else {
                        current.dayStart = dayStart;
                    }

                    if (Helpers.isSameDate(day, endDate)) {
                        current.dayEnd = dayStart + endDate.getHours() * Helpers.hourInMilliseconds + endDate.getMinutes() * Helpers.minuteInMilliseconds;
                    } else {
                        current.dayEnd = dayStart + Helpers.dayInMilliseconds;
                    }

                    current.length = current.dayEnd - current.dayStart;

                    // we always want our events to display at a certain minimum size
                    if (current.length <= Helpers.shortEventLength) {
                        current.uiLength = Helpers.shortEventLength;
                        current.uiEnd    = current.dayStart + current.uiLength;
                        current.isShort  = true;
                    } else {
                        current.uiLength = current.length;
                        current.uiEnd    = current.dayEnd;

                        if (current.length <= Helpers.mediumEventLength) {
                            current.isMedium = true;
                        }
                    }

                    eventEndBorders[current.uiEnd] = true;

                    // run the algorithm to figure out which column the event belongs in
                    for (j = 0; j <= i; j++) {
                        column = columns[j];

                        if (!column) {
                            column = { uiEnd: Helpers.zeroYearTime };
                            cluster.width = j + 1;
                        }

                        // the column value represents the lowest point in this column.  so,
                        // if nothing is in the column yet or if this event starts after the
                        // column ends, use it.
                        if (column.uiEnd <= current.dayStart) {
                            for (k = j + 1; k < cluster.width && columns[k].uiEnd <= column.dayStart; k++) {
                                column.width++;
                            }

                            // we don't know how many columns this cluster will eventually take.
                            // -1 signifies "all the remaining space".
                            if (k === cluster.width) {
                                column.width = -1;
                            }

                            // if this is the first column and the item starts after the
                            // latest ending time of the previous set of events, start a new
                            // set of events.
                            if (j === 0) {
                                if (max <= current.dayStart) {
                                    cluster = { width: 1 };
                                    columns = [];
                                }
                            }

                            max = Math.max(max, current.uiEnd);

                            columns[j] = current;
                            current.cluster  = cluster;
                            current.position = j;
                            current.width    = 1;

                            break;
                        }
                    }
                } else {
                    events.allDay++;
                }
            }

            for (i = 0, len = cluster.width; i < len; i++) {
                column = columns[i];

                for (j = i + 1; j < len && columns[j].uiEnd <= column.dayStart; j++) {
                    column.width++;
                }
            }

            events.allDayHtml = "";
            events.eventHtml  = "";
        }

        for (index = 0; index < 7; index++) {
            events = data.events[index];

            for (i = 0, len = events.length; i < len; i++) {
                // get the current event
                current = events[i];

                if (eventEndBorders[current.dayStart]) {
                    current.hasPreviousEvent = true;
                }
            }
        }

        // start building our ui
        data.job = this._scheduler.schedule(this._buildAllDayHtml, this, [data], data.isVisible);
        _stop("_processEvents");
    };

    proto._buildAllDayHtml = function(data) {
        _start("_buildAllDayHtml");

        var events = data.events,
            days   = data.days;

        for (var index = 0; index < 7; index++) {
            var dayEvents = events[index];
            dayEvents.allDayHtml = this._getAllDayHtmlForDay(dayEvents, index, days[index], false);
        }

        // continue building ui
        data.job = this._scheduler.schedule(this._buildEventHtml, this, [data], data.isVisible);
        _stop("_buildAllDayHtml");
    };

    proto._getAllDayHtmlForDay = function(events, index, day, showAll) {
        _start("_getAllDayHtmlForDay");

        var nextDay  = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1),
            showMore = !showAll && (3 < events.allDay),
            limit    = showMore ? 2 : events.allDay,
            html     = "";

        for (var i = 0, count = 0, len = events.length; i < len && count < limit; i++) {
            var current = events[i],
                winrt   = current.winrt;

            if (winrt.allDayEvent || current.isMultiDay) {
                var info = Helpers.getEventUiInfo(winrt, false);

                info.order = index;
                info.start = "";
                info.end   = "";
                info.isCrossDay = current.isCrossDay;

                // if this is a multi-day event, we might need to add the start or
                // end time.
                if (current.isMultiDay) {
                    if (day <= current.start) {
                        info.start = Helpers.simpleTime.format(winrt.startDate);
                    } else if (current.end <= nextDay) {
                        info.end   = Helpers.simpleTime.format(winrt.endDate);
                    }
                }

                // run the template and append the resulting html
                html += tmplAllDayEvent.call(this, info);
                count++;
            }
        }

        // add the more button
        if (showMore) {
            html += "<div class='more' tabIndex='0' data-order='" + index + "' role='button'>" + Jx.escapeHtml(Week._allDayMore(events.allDay - 2)) + "</div>";
        }

        _stop("_getAllDayHtmlForDay");
        return html;
    };

    proto._buildEventHtml = function(data) {
        _start("_buildEventHtml");

        for (var index = 0; index < 7; index++) {
            var events = data.events[index],
                day    = data.days[index];
            events.eventHtml = this._getEventHtmlForDay(events, day, index);
        }

        // continue building ui
        data.job = this._scheduler.schedule(this._sendEvents, this, [data], data.isVisible);
        _stop("_buildEventHtml");
    };

    proto._getEventHtmlForDay = function(events, day, index) {
        _start("_getEventHtmlForDay");

        var html = "";

        for (var i = 0, len = events.length; i < len; i++) {
            var current = events[i],
                winrt   = current.winrt;

            if (!winrt.allDayEvent && !current.isMultiDay) {
                var time = day.getTime();

                // if the event was shorter than the minimum, we lay it out a bit
                // differently than a normal event.
                var currentWidth = (current.width === -1) ? (current.cluster.width - current.position) : current.width;

                var topPos = (current.dayStart - time) * Helpers.percentageOfDay,
                    left   = current.position * 100 / current.cluster.width,
                    width  = currentWidth * 100 / current.cluster.width,
                    height;

                var className   = "event",
                    glyphHeight = current.length * Helpers.percentageOfDay;

                if (current.isShort) {
                    height     = current.uiLength * Helpers.percentageOfDay;
                    className += " short";
                } else {
                    height = glyphHeight;
                }

                if (current.hasPreviousEvent) {
                    className += " hasPreviousEvent";
                }

                // recurring events need the time on the id
                var info = Helpers.getEventUiInfo(winrt, false);

                info.className = className;
                info.order     = index;

                info.dir  = this._isRtl ? "right" : "left";
                info.left = left;

                info.top    = topPos;
                info.width  = (left + width !== 100 ? "calc(" + width + "% - 1px)" : width + "%");
                info.height = height - 100 / 24 / 60; // reduce height by one pixel

                info.glyphHeight = (glyphHeight < height) ? "height: " + (100 * glyphHeight / height) + "%" : "";
                info.isOneLine   = current.isShort || current.isMedium;

                info.isCrossDay = current.isCrossDay; 

                html += tmplEvent(info);
            }
        }

        _stop("_getEventHtmlForDay");
        return html;
    };

    proto._sendEvents = function(data) {
        _start("_sendEvents");

        var command;

        if (!data.onCollectionChanged) {
            command = "Week/getEvents";
            data.job = this._scheduler.schedule(this._hookCollection, this, [data], data.isVisible);
        } else {
            command = "Week/eventsChanged";

            data.job = this._scheduler.schedule(this._hookEvents, this, [data], data.isVisible);
            data.collection.unlock();
        }

        this._router.postMessage({
            command: command,
            id:      data.id,

            allDayHtml: data.events.map(function(day) { return day.allDayHtml; }),
            eventHtml:  data.events.map(function(day) { return day.eventHtml;  })
        });

        _stop("_sendEvents");
    };

    proto._expandAllDay = function(data, index) {
        _start("_expandAllDay");

        var events = data.events[index],
            day    = data.days[index],
            html   = this._getAllDayHtmlForDay(events, index, day, true);

        this._router.postMessage({
            command: "Week/expandAllDay",
            id:      data.id,
            index:   index,
            html:    html
        });

        _stop("_expandAllDay");
    };

    proto._hookCollection = function(data) {
        _start("_hookCollection");

        data.onCollectionChanged = this._onCollectionChanged.bind(this, data);
        data.collection.addEventListener("collectionchanged", data.onCollectionChanged);
        data.collection.unlock();

        this._hookEvents(data);
        _stop("_hookCollection");
    };

    proto._hookEvents = function(data) {
        _start("_hookEvents");

        data.onItemChanged = this._onItemChanged.bind(this, data);

        for (var index = 0; index < 7; index++) {
            var events = data.events[index];

            for (var i = 0, len = events.length; i < len; i++) {
                events[i].winrt.addEventListener("changed", data.onItemChanged);
            }
        }

        _stop("_hookEvents");
    };

    proto._unhookEvents = function(data) {
        _start("_unhookEvents");

        var onItemChanged = data.onItemChanged;

        if (onItemChanged) {
            for (var index = 0; index < 7; index++) {
                var events = data.events[index];

                for (var i = 0, len = events.length; i < len; i++) {
                    events[i].winrt.removeEventListener("changed", onItemChanged);
                }
            }

            data.onItemChanged = null;
        }

        _stop("_unhookEvents");
    };

    // Updates

    proto._onCollectionChanged = function(data) {
        _start("_onCollectionChanged");

        if (!data.changeTimeout) {
            this._unhookEvents(data);
            this._scheduler.cancel(data.job);

            var elapsedTime = Date.now() - (data.lastChanged ? data.lastChanged : 0);

            // We rate limit _updateEvents to once a second.  setTimeout must be a duration greater than 
            // 10ms in order to prevent an extra DLL from loading. 1000 - 990 = 10ms
            if (elapsedTime < 990) {
                data.changeTimeout = setTimeout(this._updateEvents, 1000 - elapsedTime, data);
            } else {
                setImmediate(this._updateEvents, data);
                data.changeTimeout = true;
            }
        }

        _stop("_onCollectionChanged");
    };

    proto._updateEvents = function(data) {
        if (!this._requests[data.id]) { return; }

        _start("_updateEvents");

        data.changeTimeout = null;
        data.lastChanged = Date.now();
        data.collection.lock();

        this._splitEventsByDay(data);

        _stop("_updateEvents");
    };

    proto._onItemChanged = function(data, ev) {
        _start("_onItemChanged");

        var properties = Array.prototype.slice.call(ev.detail[0]),
            target     = ev.target;

        for (var i = 0, len = properties.length; i < len; i++) {
            var property = properties[i];

            if (property === "startDate" || property === "endDate") {
                // Since an item just changed, the collection may be out of order.
                data.requiresSort = true;
                this._onCollectionChanged(data, ev);
                return;
            }
        }

        this._router.postMessage({
            command:    "Week/eventChanged",
            id:         data.id,
            properties: properties,
            ev: {
                handle: target.handle,

                busyStatus: target.busyStatus,
                color:      target.color,
                location:   target.location,
                subject:    target.subject || Helpers.noSubject
            }
        });

        _stop("_onItemChanged");
    };

})();
