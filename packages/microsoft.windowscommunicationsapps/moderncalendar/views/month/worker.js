
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function() {

/*global msWriteProfilerMark,Calendar,Jx,Debug,clearTimeout,setTimeout,postMessage,setImmediate*/

function _start(evt) { msWriteProfilerMark("Calendar:MonthWorker." + evt + ",StartTA,Calendar"); }
function _stop(evt)  { msWriteProfilerMark("Calendar:MonthWorker." + evt + ",StopTA,Calendar");  }

//
// Namespaces
//

var Helpers = Calendar.Helpers;
var _longDate = new Jx.DTFormatter("longDate");

//
// Month
//

var Month = Calendar.Views.MonthWorker = function(router, scheduler, calendarManager) {
    // save params
    this._router    = router;
    this._scheduler = scheduler;
    this._manager   = calendarManager;

    // init members
    this._requests = {};

    // bind callbacks
    this._updateEvents = this._updateEvents.bind(this);

    // register routes
    this._router.route("Month/getEvents",  this.getEvents,  this);
    this._router.route("Month/setVisible", this.setVisible, this);
    this._router.route("Month/cancel",     this.cancel,     this);

    // ensure our helper formats are loaded
    Helpers.ensureFormats();

    if (!Month._overflowEvents) {
        Month._overflowEvents = Jx.res.getFormatFunction("OverflowEvents");
        Month._accOverflow    = Jx.res.getFormatFunction("AccMonthOverflow");
    }
};

//
// Public
//

Month.prototype.getEvents = function(command) {
    Debug.assert(!this._requests[command.id]);

    var id   = command.id,
        data = command.data;

    data.start = new Date(data.start);
    data.end   = new Date(data.end);

    _start("getEvents");
    data.collection = this._manager.getEvents(data.start, data.end);
    data.job        = this._scheduler.schedule(this._processEvents, this, [id, data], data.isVisible);
    _stop("getEvents");

    this._requests[id] = data;
};

Month.prototype.setVisible = function(command) {
    var id   = command.id,
        data = this._requests[id];

    if (data) {
        data.isVisible = command.data;
        this._scheduler.setVisible(data.job, command.data);
    }
};

Month.prototype.cancel = function(command) {
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

        this._unhookEvents(id, data);
        data.collection.dispose();

        this._scheduler.cancel(data.job);
        delete this._requests[command.id];
    }

    _stop("cancel");
};

Month.prototype.dispose = function() {
    for (var id in this._requests) {
        this.cancel({ id: id });
    }

    this._requests = {};

    this._manager   = null;
    this._scheduler = null;
    this._router    = null;
};

//
// Private
//

// Helpers

function isMidnight(date) {
    return date.getTime() === (new Date(date.getFullYear(), date.getMonth(), date.getDate())).getTime();
}

function getGridIndex(item, date) {
    var index = 0,
        cmp   = Helpers.getMonthsBetween(item.date, date);

    // check to see if the date lies before or after the item's month
    if (cmp < 0) {
        index = date.getDate() - item.gridStart.getDate() + 1;
    } else if (cmp > 0) {
        index = date.getDate() + item.numDays + item.gridStartOffset;
    } else {
        index = date.getDate() + item.gridStartOffset;
    }

    return index;
}

function getOverflowAccLabel (date, numEvents) {
    return Month._accOverflow(_longDate.format(date), Month._overflowEvents(numEvents));
}

// Processing

Month.prototype._processEvents = function(id, data) {
    _start("processEvents");

    var item       = data.item,
        collection = data.collection,
        events     = [],
        allDay     = [],
        multiDay   = [],
        singleDay  = [];

    for (var i = 0, len = collection.count; i < len; i++) {
        var evt = collection.item(i);

        if (evt !== null) {
            events.push(evt);

            var processedEvent = { winrt: evt },
                startDate = evt.startDate,
                endDate   = evt.endDate;

            if (startDate >= data.end || endDate < data.start) {
                continue;
            }

            // adjust start date if it starts before this month
            if (startDate < item.gridStart) {
                startDate = item.gridStart;
                processedEvent.lastMonth = true;
            }

            // adjust end date if it ends after this month
            if (endDate >= item.gridEnd) {
                endDate = new Date(item.gridEnd.getTime() - 1);
            }

            // adjust end time if it ends at a midnight after the start time
            if (isMidnight(endDate)) {
                var perturbedDate = new Date(endDate.getTime() - 1);
                if (perturbedDate >= startDate) {
                    endDate = perturbedDate;
                }
            }

            // save the start and end dates we want to use for rendering
            processedEvent.startDate = startDate;
            processedEvent.endDate = endDate;
            processedEvent.start = startDate.getTime();
            processedEvent.end = endDate.getTime();
            processedEvent.isMultiDay = !Helpers.isSameDate(startDate, endDate);

            // get calendar color
            processedEvent.color = Helpers.processEventColor(evt.color);

            if (processedEvent.isMultiDay) {
                multiDay.push(processedEvent);
            } else if (evt.allDayEvent) {
                allDay.push(processedEvent);
            } else {
                singleDay.push(processedEvent);
            }
        }
    }

    if (data.requiresSort) {
        singleDay.sort(Helpers.orderEvents);
        data.requiresSort = false;
    }   

    var processedEvents = multiDay.concat(allDay).concat(singleDay);
    data.events = events;
    data.job    = this._scheduler.schedule(this._firstPass, this, [id, data, processedEvents], data.isVisible);

    _stop("processEvents");
};

Month.prototype._firstPass = function(id, data, processedEvents) {
    _start("firstPass");

    var item            = data.item,
        cells           = new Array(item.numWeeks * 7),
        eventsPerDay    = item.eventsPerDay;

    for (var i = 0; i < processedEvents.length; i++) {
        var evt = processedEvents[i],
            winrt = evt.winrt,
            start = getGridIndex(item, evt.startDate),
            end   = getGridIndex(item, evt.endDate),
            day   = evt.startDate.getDay(),
            col   = day >= Helpers.firstDayOfWeek ?  day - Helpers.firstDayOfWeek : day + 7 - Helpers.firstDayOfWeek,
            firstRow = true;

        while (start <= end) {
            var width = 1,
                startCell = cells[start - 1],
                cell  = startCell,
                slot  = 0,
                overflow = eventsPerDay === 0;

            if (!cell) {
                // initialize slots
                startCell = cell = cells[start - 1] = {
                    slots: overflow ? [] : [true],
                    overflow: overflow ? 1 : 0,
                    layoutData: []
                };
            } else {
                var slots = cell.slots;

                // find the first empty slot
                while (slots[slot]) {
                    slot++;
                }

                if (slot < eventsPerDay) {
                    slots[slot] = true;
                } else {
                    // all slots filled
                    cell.overflow += 1;
                    overflow = true;
                }
            }
            start++;
            col++;

            // fill up the slots for following days
            while (start <= end && col < 7) {
                width++;

                cell = cells[start - 1] || (cells[start - 1] = { slots: [], overflow: 0, layoutData: [] });
                Debug.assert(!cell[slot]);
                if (slot < eventsPerDay) {
                    cell.slots[slot] = true;   
                } else {
                    cell.overflow += 1;
                }

                start++;
                col++;
            }

            var lastRow = (start > end);

            if (!overflow) {
                var today = new Date();
                today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                var info = Helpers.getEventUiInfo(winrt, true);

                var obj = {
                    handle: info.handle,
                    statusClass: Helpers.busyStatusClasses[winrt.busyStatus],
                    left: ((col - width) * 14.28).toFixed(2) + "%",
                    bottom: "calc(" + (item.numWeeks - Math.floor((start - 2) / 7) - 1) * (100 / item.numWeeks) + "% + " + ((item.eventsPerDay - slot - 1) * item.eventHeight).toFixed(2) + "px)",
                    color: evt.color,
                    width: (width * 14.28).toFixed(2) + "%",
                    hasTime: !winrt.allDayEvent && firstRow && !evt.lastMonth,
                    subject: info.subject,
                    startTime: (firstRow && !winrt.allDayEvent ? Helpers.simpleTime.format(evt.startDate) : ""),
                    endTime: (lastRow && !winrt.allDayEvent ? Helpers.simpleTime.format(evt.endDate) : ""),
                    isMultiDay: evt.isMultiDay,
                    label: info.label
                };

                startCell.layoutData.push(obj);
            }

            col = 0;
            firstRow = false;
        }
    }

    data.job = this._scheduler.schedule(this._buildEventHtml, this, [id, data, processedEvents, cells], data.isVisible);

    _stop("firstPass");
};

Month.prototype._getEventHtml = function(item, processedEvents, cells, index) {
    var html = "";

    // determine where today is
    var now = new Date(),
        hasToday = now >= item.date && now < new Date(item.date.getFullYear(), item.date.getMonth() + 1),
        todayIndex = hasToday ? getGridIndex(item, now) - 1 : -1;

    var cell = cells[index];
    if (cell) {
        // first determine if we should indent time
        var layoutData   = cell.layoutData,
            layoutLength = layoutData.length,
            j, data;

        // render events in the cell
        for (j = 0; j < layoutLength; j++) {
            data = layoutData[j];

            if (data) {
                var eventClass = "event";
                
                if (data.isMultiDay) {
                    eventClass += " multiDay";
                }

                html += "<div id='" + data.handle + "'" + 
                        "     class='" + eventClass + "'" +
                        "     data-status='" + data.statusClass + "'" +
                        "     style='" + (this._isRtl ? "right:" : "left:") + data.left + ";" +
                        "            bottom: " + data.bottom + ";" +
                        "            width: " + data.width + ";" +
                        "            height: " + String(item.eventHeight) + "px;" +
                        "            color: " + data.color + ";'" +
                        "     role='button'" +
                        "     aria-label='" + Jx.escapeHtml(data.label) + "'" +
                        "     tabIndex='1'>";

                html += "  <div class='glyph' style='background-color:" + data.color + ";'><div class='glyphInner'></div></div>";

                if (data.isMultiDay) {
                    html += "<div class='time' style='padding-top:" + item.eventTopMargin + "px;'" + " aria-hidden='true'>" + Jx.escapeHtml(data.startTime) + "</div>";
                }

                html += "  <div class='subject' style='padding-top:" + item.eventTopMargin + "px;'" + " aria-hidden='true'>" + Jx.escapeHtml(data.subject) + "</div>";

                if (data.isMultiDay) {
                    html += "<div class='time right' style='padding-top:" + item.eventTopMargin + "px;'" + " aria-hidden='true'>" + Jx.escapeHtml(data.endTime) + "</div>";
                } else if (data.hasTime) {
                    html += "<div class='time right' style='padding-top:" + item.eventTopMargin + "px;'" + " aria-hidden='true'>" + Jx.escapeHtml(data.startTime) + "</div>";                    
                }

                html += "  <div class='overlay'></div>";
                html += "</div>";
            }
        }

        var row = Math.floor(index / 7),
            col = index % 7;

        // handle overflows
        if (cell.overflow > 0) {
            var occupiedSlots = 0;
            for (var i = 0; i < cell.slots.length; i++) {
                if (cell.slots[i]) {
                    occupiedSlots += 1;
                }
            }

            var numEvents = occupiedSlots + cell.overflow,
                date      = new Date(item.date);
            date.setDate(index - item.gridStartOffset + 1);

            html += "<div id='" + String(index - item.gridStartOffset) + "'" +
                    "     class='" + (index === todayIndex ? "overflowToday'" : "overflow'") + 
                    "     role='button'" +
                    "     aria-label='" + Jx.escapeHtml(getOverflowAccLabel(date, numEvents)) + "'" +
                    "     style='" + (this._isRtl ? "left" : "right") + ": calc(" + ((6 - col) * 14.28).toFixed(2) + "% + 2px);" + 
                    "            height: " + String((item.gridHeight / item.numWeeks) - (item.eventsPerDay * item.eventHeight) - 3) + "px;" +
                    "            top: " + String(row * (100 / item.numWeeks)) + "%;'" +
                    "     tabIndex='1'><div class='overflowInner' aria-hidden='true'>" +
                    Jx.escapeHtml(Month._overflowEvents(numEvents)) +
                    "</div></div>";
        }
    }

    return html;
};

Month.prototype._buildEventHtml = function(id, data, processedEvents, cells) {
    _start("buildEventHtml");

    var html = "";
    for (var i = 0, len = cells.length; i < len; i++) {
        if (cells[i]) {
            html += this._getEventHtml(data.item, processedEvents, cells, i);
        }
    }

    data.job = this._scheduler.schedule(this._sendEvents, this, [id, data, html], data.isVisible);
    _stop("buildEventHtml");
};

Month.prototype._sendEvents = function(id, data, html) {
    _start("sendEvents");

    var command;

    if (!data.onCollectionChanged) {
        command = "Month/getEvents";
        data.job = this._scheduler.schedule(this._hookCollection, this, [id, data], data.isVisible);
    } else {
        command = "Month/eventsChanged";

        data.job = this._scheduler.schedule(this._hookEvents, this, [id, data], data.isVisible);
        data.collection.unlock();
    }

    this._router.postMessage({
        command: command,
        id:      id,
        html:    html
    });

    _stop("sendEvents");
};

Month.prototype._hookCollection = function(id, data) {
    _start("hookCollection");

    data.onCollectionChanged = this._onCollectionChanged.bind(this, id, data);
    data.collection.addEventListener("collectionchanged", data.onCollectionChanged);
    data.collection.unlock();

    this._hookEvents(id, data);

    _stop("hookCollection");
};

Month.prototype._hookEvents = function(id, data) {
    _start("hookEvents");

    data.onItemChanged = this._onItemChanged.bind(this, id, data);
    for (var i = 0, len = data.events.length; i < len; i++) {
        data.events[i].addEventListener("changed", data.onItemChanged);
    }

    _stop("hookEvents");
};

Month.prototype._unhookEvents = function(id, data) {
    _start("unhookEvents");

    var onItemChanged = data.onItemChanged;

    if (onItemChanged) {
        var events = data.events;

        for (var i = 0, len = events.length; i < len; i++) {
            events[i].removeEventListener("changed", onItemChanged);
        }

        data.onItemChanged = null;
    }

    _stop("unhookEvents");
};

Month.prototype._onCollectionChanged = function(id, data) {
    _start("_onCollectionChanged");

    if (!data.changeTimeout) {
        this._unhookEvents(id, data);
        this._scheduler.cancel(data.job);

        var elapsedTime = Date.now() - (data.lastChanged ? data.lastChanged : 0);
        
        // We rate limit _updateEvents to once a second.  setTimeout must be a duration greater than 
        // 10ms in order to prevent an extra DLL from loading. 1000 - 990 = 10ms
        if (elapsedTime < 990) {
            data.changeTimeout = setTimeout(this._updateEvents, 1000 - elapsedTime, id, data);
        } else {
            setImmediate(this._updateEvents, id, data);
            data.changeTimeout = true;
        }
    }

    _stop("_onCollectionChanged");
};

Month.prototype._updateEvents = function(id, data) {
    if (!this._requests[id]) { return; }

    _start("_updateEvents");

    data.changeTimeout = null;
    data.lastChanged = Date.now();
    data.collection.lock();

    this._processEvents(id, data);

    _stop("_updateEvents");
};

Month.prototype._onItemChanged = function(workerId, data, evInfo) {
    _start("_onItemChanged");

    var properties = Array.prototype.slice.call(evInfo.detail[0]),
        ev         = evInfo.target;

    for (var i = 0, len = properties.length; i < len; i++) {
        var property = properties[i];

        if (property === "startDate" || property === "endDate") {
            // Since an item just changed, the collection may be out of order.
            data.requiresSort = true;
            this._onCollectionChanged(workerId, data, evInfo);
            return;
        }
    }

    postMessage({
        command:    "Month/eventChanged",
        id:         workerId,
        properties: properties,
        ev: {
            handle: ev.handle,

            busyStatus: ev.busyStatus,
            color:      ev.color,
            location:   ev.location,
            subject:    ev.subject || Helpers.noSubject
        }
    });

    _stop("_onItemChanged");
};

})();

