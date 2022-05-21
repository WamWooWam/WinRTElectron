
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Calendar,Debug,clearTimeout,setTimeout,setImmediate*/

(function() {

    function _start(s) { Jx.mark("DayWorker." + s + ",StartTA,Calendar"); }
    function _stop(s)  { Jx.mark("DayWorker." + s + ",StopTA,Calendar");  }

    var Helpers = Calendar.Helpers;

    function tmplAllDayEvent (data) {
        var startHtml = data.start ? '<div class="startTime" aria-hidden="true">' + data.start + '</div>' : '';
        var endHtml = data.end ? '<div class="endTime" aria-hidden="true">' + data.end + '</div>' : '';

        var html = 
        '<div id="' + Helpers.getIdFromEventHandle(data.handle, data.isCrossDay) + '" data-handle="' + data.handle + '" class="' + data.className + '" tabindex="0" data-status="' + data.status + '" role="button" aria-label="' + Jx.escapeHtml(data.label) + '" style="color:' + data.color + '">' +
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

    function tmplDetailsOneLine (data) {
        var locationHtml = data.location ? '(' + Jx.escapeHtml(data.location) + ')' : '';

        var html =
            '<span class="subject">' + Jx.escapeHtml(data.subject) + '</span>' + 
            ' ' +
            '<span class="location">' + locationHtml + '</span>';

        return html;
    }

    function tmplDetails (data) {
        var html =
            '<div class="subject">' + Jx.escapeHtml(data.subject) + '</div>' +
            '<div class="location">' + Jx.escapeHtml(data.location) + '</div>';

        return html;
    }

    function tmplEvent (data) {
        var detailHtml = data.isOneLine ? tmplDetailsOneLine(data) : tmplDetails(data);

        var html =
            '<div id="' + Helpers.getIdFromEventHandle(data.handle, data.isCrossDay) + '" data-handle="' + data.handle + '" class="' + data.className + '" tabindex="0" data-status="' + data.status + '" role="button" aria-label="' + Jx.escapeHtml(data.label) + '" style="' +
                'position:absolute;' +
                'top:' + data.top + '%;' +
                data.dir + ':' + data.left + '%;' +
                'width:' + data.width + ';' +
                'height:' + data.height + '%;' +
                'color:' + data.color + ';' +
            '">' +
                '<div class="glyph" style="background-color: ' + data.color + ';' + data.glyphHeight + ';">' + 
                    '<div class="glyphInner"></div>' + 
                '</div>' +
                '<div class="details" aria-hidden="true">' +
                    detailHtml +
                '</div>' +
                '<div class="overlay"></div>' +
            '</div>';

        return html;
    }

    var Day = Calendar.Views.DayWorker = function(router, scheduler, calendarManager) {
        // save params
        this._router    = router;
        this._scheduler = scheduler;
        this._manager   = calendarManager;

        // init members
        this._requests = {};

        // bind callbacks
        this._updateEvents = this._updateEvents.bind(this);

        // register routes
        this._router.route("Day/getEvents",    this.getEvents,    this);
        this._router.route("Day/setVisible",   this.setVisible,   this);
        this._router.route("Day/expandAllDay", this.expandAllDay, this);
        this._router.route("Day/cancel",       this.cancel,       this);

        if (!Day._allDayMore) {
            Helpers.ensureFormats();
            Day._allDayMore = Jx.res.getFormatFunction("AllDayMore");
        }
    };

    Day.prototype.getEvents = function(command) {
        Debug.assert(!this._requests[command.id]);

        var id   = command.id,
            data = command.data;

        data.id    = id;
        data.start = new Date(data.start);
        data.end   = new Date(data.end);

        _start("getEvents");
        data.collection = this._manager.getEvents(data.start, data.end);
        data.job        = this._scheduler.schedule(this._processEvents, this, [data], data.isVisible);
        _stop("getEvents");

        this._requests[id] = data;
    };

    Day.prototype.setVisible = function(command) {
        var data = command.data;

        if (data) {
            data.isVisible = command.data;
            this._scheduler.setVisible(data.job, command.data);
        }
    };

    Day.prototype.expandAllDay = function(command) {
        var id   = command.id,
            data = this._requests[id];

        if (data) {
            this._scheduler.schedule(this._expandAllDay, this, [data], true);
        }
    };

    Day.prototype.cancel = function(command) {
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

    Day.prototype.dispose = function() {
        for (var id in this._requests) {
            this.cancel({ id: id });
        }

        this._requests = {};

        this._manager   = null;
        this._scheduler = null;
        this._router    = null;
    };

    Day.prototype._processEvents = function(data) {
        _start("_processEvents");

        var startDay = new Date(data.start);
        var endDay   = (new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + 1)).getTime();
        var startNum = startDay.getTime();
        var events   = Helpers.getCollection(startDay, endDay, data.collection);

        if (data.requiresSort) {
            events.sort(Helpers.orderEvents);
            data.requiresSort = false;
        }

        events.allDay = 0;

        var columns = [];
        var cluster = { width: 1 };
        var max     = 0;

        var i, j, k, len, column, eventEndBorders = {};
        var current;

        for (i = 0, len = events.length; i < len; i++) {
            current = events[i];

            // cache some commonly used values
            var winrt     = current.winrt;
            var startDate = winrt.startDate;
            var endDate   = winrt.endDate;

            current.isCrossDay = !Helpers.isSameDate(startDate, endDate);

            // calculate if this is a multi-day event
            if (!winrt.allDayEvent && current.isCrossDay) {
                // we only care about events that span a full day
                var nextDay = new Date(startDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);

                if (nextDay <= endDate) {
                    current.isMultiDay = true;
                }                    
            }

            // the only events we'll do further processing on are single-day events
            if (!winrt.allDayEvent && !current.isMultiDay) {
                if (Helpers.isSameDate(startDay, startDate)) {
                    current.dayStart = startNum + startDate.getHours() * Helpers.hourInMilliseconds + startDate.getMinutes() * Helpers.minuteInMilliseconds;
                } else {
                    current.dayStart = startNum;
                }

                if (Helpers.isSameDate(startDay, endDate)) {
                    current.dayEnd = startNum + endDate.getHours() * Helpers.hourInMilliseconds + endDate.getMinutes() * Helpers.minuteInMilliseconds;
                } else {
                    current.dayEnd = startNum + Helpers.dayInMilliseconds;
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

        for (i = 0, len = events.length; i < len; i++) {
            current = events[i];

            if (eventEndBorders[current.dayStart]) {
                current.hasPreviousEvent = true;
            }
        }

        // save the events
        data.events = events;

        // start building our ui
        data.allDayHtml = "";
        data.eventHtml  = "";

        data.job = this._scheduler.schedule(this._buildAllDayHtml, this, [data], data.isVisible);
        _stop("_processEvents");
    };

    Day.prototype._buildAllDayHtml = function(data) {
        _start("_buildAllDayHtml");

        var events = data.events,
            day    = data.start;

        data.allDayHtml = this._getAllDayHtml(events, day, false);
        data.job        = this._scheduler.schedule(this._buildEventHtml, this, [data], data.isVisible);

        _stop("_buildAllDayHtml");
    };

    Day.prototype._getAllDayHtml = function(events, day, showAll) {
        var nextDay  = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1),
            showMore = !showAll && (3 < events.allDay),
            limit    = showMore ? 2 : events.allDay,
            html     = "";

        var className = "event";

        // if we're expanding the all-day area, each event should take 100% width
        if (showAll) {
            className += " full";
        }

        for (var i = 0, count = 0, len = events.length; i < len && count < limit; i++) {
            var current = events[i],
                winrt   = current.winrt;

            if (winrt.allDayEvent || current.isMultiDay) {
                var info = Helpers.getEventUiInfo(winrt, false);

                info.className = className;
                info.start     = "";
                info.end       = "";
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
            html += "<div class='more' tabIndex='0' role='button'>" + Jx.escapeHtml(Day._allDayMore(events.allDay - 2)) + "</div>";
        }

        return html;
    };

    Day.prototype._buildEventHtml = function(data) {
        _start("_buildEventHtml");

        var events = data.events,
            day    = data.start;

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
                    width  = currentWidth     * 100 / current.cluster.width,
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

                info.dir    = this._isRtl ? "right" : "left";
                info.left   = left;
                info.top    = topPos;
                info.width  = (left + width !== 100 ? "calc(" + width + "% - 1px)" : width + "%");
                info.height = height - 100 / 24 / 60; // reduce height by one pixel

                info.className   = className;
                info.glyphHeight = (glyphHeight < height) ? "height: " + (100 * glyphHeight / height) + "%" : "";
                info.isOneLine   = current.isShort || current.isMedium;

                info.isCrossDay = current.isCrossDay; 

                data.eventHtml += tmplEvent.call(this, info);
            }
        }

        data.job = this._scheduler.schedule(this._sendEvents, this, [data], data.isVisible);
        _stop("_buildEventHtml");
    };

    Day.prototype._sendEvents = function(data) {
        _start("_sendEvents");

        var command;

        if (!data.onCollectionChanged) {
            command = "Day/getEvents";
            data.job = this._scheduler.schedule(this._hookCollection, this, [data], data.isVisible);
        } else {
            command = "Day/eventsChanged";

            data.job = this._scheduler.schedule(this._hookEvents, this, [data], data.isVisible);
            data.collection.unlock();
        }

        this._router.postMessage({
            command: command,
            id:      data.id,

            allDayHtml: data.allDayHtml,
            eventHtml:  data.eventHtml
        });

        _stop("_sendEvents");
    };

    Day.prototype._expandAllDay = function(data) {
        _start("_expandAllDay");

        var events = data.events,
            day    = data.start,
            html   = this._getAllDayHtml(events, day, true);

        this._router.postMessage({
            command: "Day/expandAllDay",
            id:      data.id,
            html:    html
        });

        _stop("_expandAllDay");
    };

    Day.prototype._hookCollection = function(data) {
        _start("_hookCollection");

        data.onCollectionChanged = this._onCollectionChanged.bind(this, data);
        data.collection.addEventListener("collectionchanged", data.onCollectionChanged);
        data.collection.unlock();

        this._hookEvents(data);
        _stop("_hookCollection");
    };

    Day.prototype._hookEvents = function(data) {
        _start("_hookEvents");

        data.onItemChanged = this._onItemChanged.bind(this, data);

        for (var i = 0, len = data.events.length; i < len; i++) {
            data.events[i].winrt.addEventListener("changed", data.onItemChanged);
        }

        _stop("_hookEvents");
    };

    Day.prototype._unhookEvents = function(data) {
        _start("_unhookEvents");

        var onItemChanged = data.onItemChanged;

        if (onItemChanged) {
            for (var i = 0, len = data.events.length; i < len; i++) {
                data.events[i].winrt.removeEventListener("changed", onItemChanged);
            }

            data.onItemChanged = null;
        }

        _stop("_unhookEvents");
    };

    // Updates

    Day.prototype._onCollectionChanged = function(data) {
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

    Day.prototype._updateEvents = function(data) {
        if (!this._requests[data.id]) { return; }

        _start("_updateEvents");

        data.changeTimeout = null;
        data.lastChanged = Date.now();
        data.collection.lock();

        this._processEvents(data);

        _stop("_updateEvents");
    };

    Day.prototype._onItemChanged = function(data, ev) {
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
            command:    "Day/eventChanged",
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

