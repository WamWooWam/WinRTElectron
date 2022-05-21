
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Calendar,Microsoft,Debug,clearTimeout,setTimeout*/

(function() {

function _start(evt) { Jx.mark("Calendar:FreeBusyWorker." + evt + ",StartTA,Calendar"); }
function _stop(evt)  { Jx.mark("Calendar:FreeBusyWorker." + evt + ",StopTA,Calendar");  }

var Helpers = Calendar.Helpers;
var BusyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus;
var _shortTime = new Jx.DTFormatter("shortTime");

function tmplEvent(data) {
    var s = 
        '<div class="event" data-status="' + data.status + '" title="' + data.tooltipHtml + '" ' + 
            'style="color: ' + data.color + '; ' + data.dir + ': ' + (data.offset - 1) + 'px; width: ' + (data.width) + 'px;">' + 
            '<div class="glyph" style="background-color: ' + data.color + ';">' + 
                '<div class="glyphInner"></div>' + 
            '</div>' + 
            '<div class="subject">' + 
                data.subjectHtml + 
            '</div>' + 
        '</div>';
    return s;
}

//
// FreeBusyWorker
//

var FreeBusy = Calendar.Views.FreeBusyWorker = function(router, scheduler, accountManager, calendarManager) {
    // save params
    this._router    = router;
    this._scheduler = scheduler;
    this._accounts  = accountManager;
    this._manager   = calendarManager;

    // init members
    this._requests = {};

    // bind callbacks
    this._updateEvents = this._updateEvents.bind(this);

    // register routes
    this._router.route("FreeBusy/initialize",   this.initialize,   this);
    this._router.route("FreeBusy/refresh",      this.refresh,      this);
    this._router.route("FreeBusy/setVisible",   this.setVisible,   this);
    this._router.route("FreeBusy/setSelected",  this.setSelected,  this);
    this._router.route("FreeBusy/setWorkHours", this.setWorkHours, this);
    this._router.route("FreeBusy/setCalendar",  this.setCalendar,  this);
    this._router.route("FreeBusy/setAttendees", this.setAttendees, this);

    this._router.route("FreeBusy/pause",  this.pause,  this);
    this._router.route("FreeBusy/resume", this.resume, this);
    this._router.route("FreeBusy/cancel", this.cancel, this);

    // ensure our helper formats are loaded
    Helpers.ensureFormats();
    FreeBusy._unknown        = Jx.res.getString("FreeBusyUnknown");
    FreeBusy._rangeFormatter = Jx.res.getFormatFunction("DateRange");
};

//
// Public
//

FreeBusy.prototype.initialize = function(command) {
    Debug.assert(!this._requests[command.id]);
    _start("initialize");

    var id   = command.id,
        data = command.data;
    data.id = id;

    data.visible.start = new Date(data.visible.start);
    data.visible.end   = new Date(data.visible.end);

    data.selected.start = new Date(data.selected.start);
    data.selected.end   = new Date(data.selected.end);

    data.results = {};
    data.aria    = {};

    // get the right account
    data.account = this._accounts.loadAccount(data.accountId);

    // set some extra data based on whether we're working with work hours
    this._setHourBoundaries(data);

    // get our events and schedules
    this._adjustForDst(data);
    this._getEvents(data);
    this._getSchedules(data);

    // save this request
    this._requests[id] = data;

    _stop("initialize");
};

FreeBusy.prototype.refresh = function(command) {
    Debug.assert(this._requests[command.id]);
    _start("refresh");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        // re-get our events
        this._disposeEvents(data);
        this._getEvents(data);

        // re-get our schedules
        this._disposeSchedules(data);
        this._getSchedules(data);
    }

    _stop("refresh");
};

FreeBusy.prototype.setVisible = function(command) {
    Debug.assert(this._requests[command.id]);
    _start("setVisible");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        data.visible.start = new Date(command.data.start);
        data.visible.end   = new Date(command.data.end);

        // re-get our events
        this._disposeEvents(data);
        this._getEvents(data);

        // re-get our schedules
        this._disposeSchedules(data);
        this._adjustForDst(data);
        this._getSchedules(data);
    }

    _stop("setVisible");
};

FreeBusy.prototype.setSelected = function(command) {
    Debug.assert(this._requests[command.id]);
    _start("setSelected");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        data.selected.start = new Date(command.data.start);
        data.selected.end   = new Date(command.data.end);

        data.aria = {};

        this._getMeAria(data);
        this._getAria(data);
    }

    _stop("setSelected");
};

FreeBusy.prototype.setWorkHours = function(command) {
    Debug.assert(this._requests[command.id]);
    _start("setWorkHours");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        var workHours = command.data.workHours;

        if (workHours !== data.workHours) {
            data.workHours = workHours;
            this._setHourBoundaries(data);

            // re-process events and schedules
            this._updateEvents(data);
            this._updateSchedules(data);
        }
    }

    _stop("setWorkHours");
};

FreeBusy.prototype.setCalendar = function(command) {
    Debug.assert(this._requests[command.id]);
    _start("setCalendar");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        var calendarId = command.data.calendarId,
            accountId  = command.data.accountId;

        if (calendarId !== data.calendarId) {
            data.calendarId = calendarId;

            // re-get our events
            this._disposeEvents(data);
            this._getEvents(data);
        }

        if (accountId !== data.accountId) {
            data.accountId = accountId;
            data.account   = this._accounts.loadAccount(data.accountId);

            // re-get our schedules
            this._disposeSchedules(data);
            this._getSchedules(data);
        }
    }

    _stop("setCalendar");
};

FreeBusy.prototype.setAttendees = function(command) {
    _start("setAttendees");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        var attendees = data.attendees = command.data.attendees,
            request   = data.request;

        // if we have an unfinished request, we need to verify it's still valid
        if (request) {
            var valid = request.attendees.some(function(attendee) {
                return (attendees.indexOf(attendee) !== -1);
            });

            if (!valid) {
                var winrt = request.winrt;

                winrt.removeEventListener("changed", request.onChanged);
                winrt.dispose();

                data.request = null;
            }
        }

        // we need to prune our old results
        var results = data.results;
        data.results = {};

        for (var i = 0, len = attendees.length; i < len; i++) {
            var attendee = attendees[i],
                result   = results[attendee];

            if (result) {
                data.results[attendee] = result;
            }
        }

        // reset our request queue
        data.requestQueue = null;

        // now if we don't an outstanding request, make one
        if (!data.request) {
            this._getSchedules(data);
        }
    }

    _stop("setAttendees");
};

FreeBusy.prototype.pause = function(command) {
    Debug.assert(this._requests[command.id]);
    _start("pause");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        data.paused = true;
    }

    _stop("pause");
};

FreeBusy.prototype.resume = function(command) {
    Debug.assert(this._requests[command.id]);
    _start("resume");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        data.paused = false;

        if (data.dirtyEvents) {
            this._getEvents(data);
            data.dirtyEvents = false;
            data.dirtyMeAria = false;
        } else if (data.dirtyMeAria) {
            this._getMeAria(data);
            data.dirtyMeAria = false;
        }

        if (data.dirtySchedules) {
            this._getSchedules(data);
            data.dirtySchedules = false;
            data.dirtyAria      = false;
        } else if (data.dirtyAria) {
            this._getAria(data);
            data.dirtyAria = false;
        }
    }

    _stop("resume");
};

FreeBusy.prototype.cancel = function(command) {
    _start("cancel");

    var id   = command.id,
        data = this._requests[id];

    if (data) {
        this._disposeEvents(data);
        this._disposeSchedules(data);

        delete this._requests[command.id];
    }

    _stop("cancel");
};

FreeBusy.prototype.dispose = function() {
    for (var id in this._requests) {
        this.cancel({ id: id });
    }

    this._requests = {};

    this._manager   = null;
    this._accounts  = null;
    this._scheduler = null;
    this._router    = null;
};

//
// Private
//

FreeBusy._invalidResult = "INVALID";

FreeBusy._hourWidth    = 160;
FreeBusy._halfWidth    = FreeBusy._hourWidth / 2;
FreeBusy._numberOfDays = 35;

FreeBusy._resultsPerDay = 24 * 2; // the data comes in per half hour
FreeBusy._resultLength  = FreeBusy._numberOfDays * FreeBusy._resultsPerDay;

FreeBusy._workStart = 8;
FreeBusy._workEnd   = 19;
FreeBusy._workHours = FreeBusy._workEnd - FreeBusy._workStart;

// Utils

FreeBusy._getNormalizedStatus = function(freebusy, index) {
    var status = parseInt(freebusy.charAt(index), 10);

    if (isNaN(status) || status < BusyStatus.free || BusyStatus.outOfOffice < status) {
        status = BusyStatus.outOfOffice + 1;
    }

    return status;
};

FreeBusy._formatScheduleBlock = function(start, end, status) {
    var first      = _shortTime.format(start),
        second     = Helpers.isSameDate(start, end) ? _shortTime.format(end) : Helpers.dateAndTime.format(end),
        statusText = FreeBusy._unknown;

    if (BusyStatus.free <= status && status <= BusyStatus.outOfOffice) {
        statusText = Helpers.accEventStatuses[status];
    }

    return FreeBusy._rangeFormatter(first, second) + ", " + statusText + "; ";
};

FreeBusy.prototype._setHourBoundaries = function(data) {
    if (data.workHours) {
        data.startBoundary = FreeBusy._workStart;
        data.endBoundary   = FreeBusy._workEnd;

        data.hourOffset  = FreeBusy._workStart;
        data.hoursPerDay = FreeBusy._workHours;
    } else {
        // set invalid hours, as we don't want to arbitrarily bound
        // our data in this case.
        data.startBoundary = -1;
        data.endBoundary   = 25;

        data.hourOffset  = 0;
        data.hoursPerDay = 24;
    }

    data.startStatusBoundary = data.startBoundary * 2;
    data.endStatusBoundary   = data.endBoundary   * 2;
};

// Calendar Event

FreeBusy.prototype._getEvents = function(data) {
    _start("_getEvents");

    if (!data.paused) {
        data.collection  = this._manager.getEvents(data.visible.start, data.visible.end);
        data.jobIdEvents = this._scheduler.schedule(this._processEvents, this, [data]);
    } else {
        data.dirtyEvents = true;
    }

    _stop("_getEvents");
};

FreeBusy._statusSorter = function(a, b) {
    var result = a.status - b.status;

    if (!result) {
        result = a.start - b.start;
    }

    return result;
};

FreeBusy.prototype._processEvents = function(data) {
    _start("_processEvents");

    var blocks  = data.blocks = [],
        current = { end: 0, status: 0 },
        stack   = [],
        stacked;

    for (var i = 0, len = data.collection.count; i < len; i++) {
        var ev = data.collection.item(i);

        // ensure the event is valid
        if (ev && ev.busyStatus !== BusyStatus.free && ev.calendar.id === data.calendarId) {
            var startDate  = ev.startDate,
                endDate    = ev.endDate,
                busyStatus = ev.busyStatus;

            // ignore zero-duration events.  include events that end after the
            // current event or that are higher priority.
            if (startDate < endDate && (current.end < endDate || current.status < busyStatus)) {
                // adjust the event to ensure it's in our visible region
                if (startDate < data.visible.start) {
                    startDate = data.visible.start;
                }

                if (data.visible.end < endDate) {
                    endDate = data.visible.end;
                }

                // then adjust to make sure it's within our boundaries
                var startHours = startDate.getHours(),
                    endHours   = endDate.getHours();

                if (startHours < data.startBoundary) {
                    startDate.setHours(data.startBoundary);
                    startDate.setMinutes(0);
                } else if (data.endBoundary <= startHours) {
                    startDate.setHours(data.startBoundary + 24);
                    startDate.setMinutes(0);
                }

                if (endHours < data.startBoundary) {
                    endDate.setHours(data.endBoundary - 24);
                    endDate.setMinutes(0);
                } else if (data.endBoundary <= endHours) {
                    endDate.setHours(data.endBoundary);
                    endDate.setMinutes(0);
                }

                // ensure we still have a valid event
                if (startDate < endDate) {
                    // make sure we're dealing with the most valid current event
                    if (current.end <= startDate && stack.length) {
                        stack.sort(FreeBusy._statusSorter);

                        do {
                            stacked = stack.pop();

                            // if the stacked event ends later, consider it current
                            if (current.end < stacked.end) {
                                // consider the stacked event to have started when
                                // its higher priority conflict ended.
                                stacked.start = current.end;

                                // create a new ui block if the stacked event has
                                // room and is equal or higher priority.
                                if (stacked.start < startDate || busyStatus <= stacked.status) {
                                    blocks.push(stacked);
                                }

                                // the stacked event is now our current event.
                                current = stacked;
                            }
                        } while (current.end <= startDate && stack.length);
                    }

                    // we can be dealing with multiple potential cases.
                    if (current.end <= startDate) {
                        // this event doesn't overlap at all.  add it.
                        current = { ev: ev, start: startDate, end: endDate, status: busyStatus };
                        blocks.push(current);
                    } else if (current.status < busyStatus) {
                        // this event overlaps and is a higher priority based on
                        // busy status.  save the old event if it's long enough.
                        if (endDate < current.end) {
                            stack.push({ ev: current.ev, start: current.start, end: current.end, status: current.status });
                        }

                        // shorten the previous entry
                        current.end = startDate;

                        // add this new event.
                        current = { ev: ev, start: startDate, end: endDate, status: busyStatus };
                        blocks.push(current);
                    } else {
                        // this event overlaps.  it's effectively a lower-
                        // priority, longer-lasting event.
                        stack.push({ ev: ev, start: startDate, end: endDate, status: busyStatus });
                    }
                }
            }
        }
    }

    // add any remaining stacked events
    if (stack.length) {
        stack.sort(FreeBusy._statusSorter);

        do {
            stacked = stack.pop();

            // we only care about it if it goes later than the current event.
            if (current.end < stacked.end) {
                // consider the stacked event to have started when its higher
                // priority conflict ended.
                stacked.start = current.end;
                blocks.push(stacked);

                // the stacked event is now our current event.
                current = stacked;
            }
        } while (stack.length);
    }

    data.jobIdEvents = this._scheduler.schedule(this._buildEventHtml, this, [data]);
    _stop("_processEvents");
};

FreeBusy.prototype._buildEventHtml = function(data) {
    _start("_buildEventHtml");

    var anchor = data.visible.start,
        blocks = data.blocks,
        html   = "";

    for (var i = 0, len = blocks.length; i < len; i++) {
        var block = blocks[i],
            start = block.start,
            end   = block.end,
            ev    = block.ev;

        var startDay    = Math.floor((start - anchor) / Helpers.dayInMilliseconds),
            startHours  = (start.getHours() - data.hourOffset),
            startOffset = (startDay * data.hoursPerDay) + startHours + (start.getMinutes() / 60);

        var endDay    = Math.floor((end - anchor) / Helpers.dayInMilliseconds),
            endHours  = (end.getHours() - data.hourOffset),
            endOffset = (endDay * data.hoursPerDay) + endHours + (end.getMinutes() / 60);

        var width = endOffset - startOffset;

        var subjectHtml = Jx.escapeHtml(ev.subject || Helpers.noSubject),
            startDate   = ev.startDate,
            endDate     = ev.endDate,
            isSameDate  = Helpers.isSameDate(startDate, endDate),
            from        = Helpers.dateAndTime.format(startDate),
            to          = isSameDate ? _shortTime.format(endDate) : Helpers.dateAndTime.format(endDate),
            rangeHtml   = Jx.escapeHtml(FreeBusy._rangeFormatter(from, to)),
            tooltipHtml = subjectHtml + " (" + rangeHtml + ")";

        html += tmplEvent({
            status: Helpers.busyStatusClasses[block.status],
            color:  Helpers.processEventColor(ev.color),

            dir: this._isRtl ? "right" : "left",
            subjectHtml: subjectHtml,
            tooltipHtml: tooltipHtml,

            offset: startOffset * FreeBusy._hourWidth,
            width:  width       * FreeBusy._hourWidth
        });
    }

    data.jobIdEvents = this._scheduler.schedule(this._sendEvents, this, [data, html]);
    _stop("_buildEventHtml");
};

FreeBusy.prototype._sendEvents = function(data, html) {
    _start("_sendEvents");

    data.jobIdEvents = null;
    var command;

    if (!data.onCollectionChanged) {
        command = "FreeBusy/getEvents";
        data.jobIdEvents = this._scheduler.schedule(this._hookCollection, this, [data]);
    } else {
        command = "FreeBusy/eventsChanged";
        data.collection.unlock();

        this._getMeAria(data);
    }

    this._router.postMessage({
        command: command,
        id:      data.id,

        html: html
    });

    _stop("_sendEvents");
};

FreeBusy.prototype._disposeEvents = function(data) {
    var onCollectionChanged = data.onCollectionChanged;

    if (onCollectionChanged) {
        data.collection.removeEventListener("collectionchanged", onCollectionChanged);
        data.onCollectionChanged = null;

        clearTimeout(data.changeTimeout);
    }

    data.collection.dispose();
    data.collection = null;

    this._scheduler.cancel(data.jobIdEvents);
    data.jobIdEvents = null;
};

// Listeners

FreeBusy.prototype._hookCollection = function(data) {
    _start("_hookCollection");

    data.jobIdEvents = null;

    data.onCollectionChanged = this._onCollectionChanged.bind(this, data);
    data.collection.addEventListener("collectionchanged", data.onCollectionChanged);
    data.collection.unlock();

    this._getMeAria(data);

    _stop("_hookCollection");
};

FreeBusy.prototype._getMeAria = function(data) {
    _start("_getMeAria");

    if (!data.paused) {
        if (!data.jobIdEvents) {
            data.jobIdEvents = this._scheduler.schedule(this._calculateMeAria, this, [data]);
        }
    } else {
        data.dirtyMeAria = true;
    }

    _stop("_getMeAria");
};

FreeBusy.prototype._calculateMeAria = function(data) {
    _start("_calculateMeAria");

    data.jobIdEvents = null;

    var blocks = data.blocks,
        label  = "",
        start, end;

    if (blocks.length) {
        var i, len, block;

        // iterate our blocks until we reach the selected time
        for (i = 0, len = blocks.length; i < len; i++) {
            block = blocks[i];

            if (data.selected.start < block.end) {
                break;
            }
        }

        // now build up our aria label until we're outside the selected range
        start = data.selected.start;
        end   = start;

        for (; i < len; i++) {
            block = blocks[i];

            // we've reached the end, so we're done iterating these blocks
            if (data.selected.end <= block.start) {
                break;
            }

            if (start < block.start) {
                end   = block.start;

                label = FreeBusy._formatScheduleBlock(start, end, BusyStatus.free);
                start = end;
            }

            end = new Date(Math.min(data.selected.end, block.end));

            label += FreeBusy._formatScheduleBlock(start, end, block.ev.busyStatus);
            start  = end;
        }

        // handle the potential free block at the end
        if (end < data.selected.end) {
            start  = end;
            end    = data.selected.end;
            label += FreeBusy._formatScheduleBlock(start, end, BusyStatus.free);
        }
    } else {
        start  = data.selected.start;
        end    = data.selected.end;
        label += FreeBusy._formatScheduleBlock(start, end, BusyStatus.free);
    }

    this._router.postMessage({
        command: "FreeBusy/meAria",
        id:      data.id,

        label: label
    });

    _stop("_calculateMeAria");
};

// Updates

FreeBusy.prototype._onCollectionChanged = function(data) {
    _start("_onCollectionChanged");

    if (!data.changeTimeout) {
        this._scheduler.cancel(data.jobIdEvents);
        data.changeTimeout = setTimeout(this._updateEvents, 1000, data);
    }

    _stop("_onCollectionChanged");
};

FreeBusy.prototype._updateEvents = function(data) {
    if (!this._requests[data.id]) { return; }

    _start("_updateEvents");

    this._scheduler.cancel(data.jobIdEvents);
    clearTimeout(data.changeTimeout);

    data.changeTimeout = null;
    data.collection.lock();

    this._processEvents(data);

    _stop("_updateEvents");
};

// Schedules

FreeBusy._attendeeChunkSize = 5;

FreeBusy.prototype._adjustForDst = function(data) {
    var range = data.visible,
        start = range.start,
        end   = range.end;

    var firstOffset = start.getTimezoneOffset(),
        lastOffset  = end.getTimezoneOffset();

    if (firstOffset !== lastOffset) {
        var current = new Date(start),
            block   = 0;

        // run forward through the days, until we find the one that switches timezone offsets
        while (current < end && current.getTimezoneOffset() === firstOffset) {
            current.setDate(current.getDate() + 1);

            // every day we move forward, is equal to 48 schedule blocks
            block += 48;
        }

        // roll back one day
        current.setDate(current.getDate() - 1);
        block -= 48;

        // run forward through the hours, until we find the one that switches timezone offsets
        while (current < end && current.getTimezoneOffset() === firstOffset) {
            current.setMinutes(current.getMinutes() + 30);
            block += 1;
        }

        // calculate the time difference, and fit it to the 30 minute periods of data we get
        var diff   = lastOffset - firstOffset,
            repeat = Math.abs(Math.floor(diff / 30));

        // our adjustment is different, depending on whether we went in to or out of dst
        if (diff < 0) {
            // in this case, we're losing time.  we'll repeat the last valid block.
            data.adjustSchedule = function(schedule) {
                var value  = schedule[block-1],
                    insert = "";

                // depending on the time difference, we may need to repeat multiple times
                for (var i = 0; i < repeat; i++) {
                    insert += value;
                }

                // splice the string and insert the repeated block
                return (schedule.substring(0, block) + insert + schedule.substring(block));
            };
        } else {
            // we're losing time here.  in this case, we'll compare blocks on each side
            // of the switch and take the higher-order value.
            data.adjustSchedule = function(schedule) {
                var begin = block - repeat,
                    value = "";

                for (var i = 0; i < repeat; i++) {
                    var left  = parseInt(schedule.charAt(begin + i), 10),
                        right = parseInt(schedule.charAt(begin + i + repeat), 10);

                    // we have to make sure we're inserting valid values
                    if (!isNaN(left)) {
                        value += isNaN(right) ? left : Math.max(left, right);
                    } else {
                        value += isNaN(right) ? "X" : right;
                    }
                }

                return (schedule.substring(0, begin) + value + schedule.substring(block + repeat));
            };
        }
    } else {
        // if the offsets are the same, we don't need to do any adjustment
        data.adjustSchedule = function(schedule) {
            return schedule;
        };
    }
};

FreeBusy.prototype._getSchedules = function(data) {
    _start("_getSchedules");
    Debug.assert(!data.request);

    if (!data.paused) {
        // build our queue, if we don't have one
        if (!data.requestQueue) {
            data.requestQueue = data.attendees.filter(function(attendee) {
                return !data.results[attendee];
            });
        }

        // make sure we have requests to make
        if (data.requestQueue.length) {
            // we don't want to make massive requests, so we only grab a few off the queue
            var attendees = data.requestQueue.splice(0, FreeBusy._attendeeChunkSize);
            var request   = data.request = {
                attendees: attendees,
                winrt:     this._manager.requestFreeBusyData(data.account, data.visible.start, data.visible.end, attendees)
            };

            request.onChanged = this._onRequestChanged.bind(this, data, request);
            request.winrt.addEventListener("changed", request.onChanged);
        }
    } else {
        data.dirtySchedules = true;
    }

    _stop("_getSchedules");
};

var Platform       = Microsoft.WindowsLive.Platform,
    FreeBusyStatus = Platform.Calendar.FreeBusyStatus,
    SearchStatus   = Platform.SearchStatusCode;

function getAttendeeStatusClass(value) {
    var status = "unknown";

    if (BusyStatus.tentative <= value && value <= BusyStatus.outOfOffice) {
        status = Helpers.busyStatusClasses[value];
    }

    return status;
}

FreeBusy.prototype._getAttendeeHtml = function(freebusy, startBoundary, endBoundary) {
    var html  = "",
        dir   = this._isRtl ? "right" : "left",
        left  = 0,
        width = 0,
        last  = 0;

    for (var i = 0; i < FreeBusy._resultLength; i++) {
        var indexInDay = i % FreeBusy._resultsPerDay,
            validSlot  = startBoundary <= indexInDay && indexInDay < endBoundary;

        var current = FreeBusy._getNormalizedStatus(freebusy, i);

        // we only have to create a new div at this point if we've changed values
        if (current !== last) {
            if (last) {
                html += (width - 1) + "px;'></div>";
            }

            if (current && validSlot) {
                html += "<div class='status " + getAttendeeStatusClass(current) + "' style='" + dir + ": " + left + "px; width: ";
                width = 0;
            } else {
                last  = 0;
            }
        }

        if (validSlot) {
            last   = current;
            left  += FreeBusy._halfWidth;
            width += FreeBusy._halfWidth;
        }
    }

    if (last) {
        html += (width - 1) + "px;'></div>";
    }

    return html;
};

FreeBusy.prototype._onRequestChanged = function(data, request) {
    _start("_onRequestChanged");

    var winrt = request.winrt;

    if (winrt.status) {
        var attendees = request.attendees,
            results   = data.results,
            aria      = data.aria,
            html      = {},
            i, len, attendee;

        // only loop through the results if the request was a success
        if (winrt.status === SearchStatus.success) {
            var collection    = winrt.results,
                startBoundary = data.startStatusBoundary,
                endBoundary   = data.endStatusBoundary;

            for (i = 0, len = collection.count; i < len; i++) {
                var item = collection.item(i);
                attendee = item.attendee;

                // ensure we still care about this attendee and that we requested his info
                if (data.attendees.indexOf(attendee) !== -1 && attendees.indexOf(attendee) !== -1) {
                    var status   = item.status,
                        freebusy = data.adjustSchedule(item.freebusy),
                        attendeeHtml;

                    if (status === FreeBusyStatus.success && freebusy) {
                        results[attendee] = freebusy;
                        attendeeHtml = this._getAttendeeHtml(freebusy, startBoundary, endBoundary);
                    } else {
                        results[attendee] = FreeBusy._invalidResult;
                        attendeeHtml = "<div class='status unknown' style='width: 100%; height: 100%;'></div>";
                    }

                    html[attendee] = attendeeHtml;
                    aria[attendee] = null;
                }
            }

            collection.dispose();
        }

        // send unknown for any attendees we didn't get data for
        for (i = 0, len = attendees.length; i < len; i++) {
            attendee = attendees[i];

            // ensure we still care about this attendee
            if (!results[attendee] && data.attendees.indexOf(attendee) !== -1) {
                results[attendee] = FreeBusy._invalidResult;
                html[attendee]    = "<div class='status unknown' style='width: 100%; height: 100%;'></div>";
                aria[attendee]    = null;
            }
        }

        this._router.postMessage({
            command: "FreeBusy/schedules",
            id:      data.id,

            html: html
        });

        winrt.removeEventListener("changed", request.onChanged);
        winrt.dispose();
        data.request = null;

        this._getSchedules(data);
        this._getAria(data);
    }

    _stop("_onRequestChanged");
};

FreeBusy.prototype._getAria = function(data) {
    _start("_getAria");

    if (!data.paused) {
        if (!data.jobIdAria) {
            data.jobIdAria = this._scheduler.schedule(this._calculateAria, this, [data]);
        }
    } else {
        data.dirtyAria = true;
    }

    _stop("_getAria");
};

FreeBusy.prototype._calculateAria = function(data) {
    _start("_calculateAria");

    data.jobIdAria = null;

    var results   = data.results,
        aria      = data.aria,
        labels    = {},
        hasLabels = false;

    var startIndex = Math.floor((data.selected.start - data.visible.start) / Helpers.hourInMilliseconds * 2),
        endIndex   = Math.ceil((data.selected.end    - data.visible.start) / Helpers.hourInMilliseconds * 2);

    // we can only build aria labels for attendees we have results for
    for (var attendee in results) {
        var label = aria[attendee] || "";

        // only build labels we don't already have
        if (!label) {
            var result = results[attendee],
                start, end, prev, current;

            if (result === FreeBusy._invalidResult) {
                if (!data.fullUnknown) {
                    data.fullUnknown = FreeBusy._formatScheduleBlock(data.selected.start, data.selected.end, -1);
                }

                label = data.fullUnknown;
            } else {
                start = new Date(data.selected.start);
                prev  = FreeBusy._getNormalizedStatus(result, startIndex);

                for (var j = startIndex + 1; j < endIndex; j++) {
                    current = FreeBusy._getNormalizedStatus(result, j);

                    if (current !== prev) {
                        end = new Date(data.visible.start);
                        end.setMinutes(j * 30);

                        label += FreeBusy._formatScheduleBlock(start, end, prev);

                        start = end;
                        prev  = current;
                    }
                }

                end = new Date(data.visible.start);
                end.setMinutes(j * 30);

                label += FreeBusy._formatScheduleBlock(start, end, prev);
            }

            aria[attendee] = labels[attendee] = label;
            hasLabels = true;
        }
    }

    if (hasLabels) {
        this._router.postMessage({
            command: "FreeBusy/attendeeAria",
            id:      data.id,

            labels: labels
        });
    }

    _stop("_calculateAria");
};

FreeBusy.prototype._updateSchedules = function(data) {
    _start("_updateSchedules");

    var attendees = data.attendees,
        results   = data.results,
        html      = {};

    var startBoundary = data.startStatusBoundary,
        endBoundary   = data.endStatusBoundary;

    for (var i = 0, len = attendees.length; i < len; i++) {
        var attendee = attendees[i],
            result   = results[attendee];

        if (result) {
            html[attendee] = this._getAttendeeHtml(result, startBoundary, endBoundary);
        }
    }

    this._router.postMessage({
        command: "FreeBusy/schedules",
        id:      data.id,

        html: html
    });

    _stop("_updateSchedules");
};

FreeBusy.prototype._disposeSchedules = function(data) {
    _start("_disposeSchedules");

    // first cancel our outstanding request, if we have one
    var request = data.request;

    if (request) {
        var winrt = request.winrt;

        winrt.removeEventListener("changed", request.onChanged);
        winrt.dispose();

        data.request = null;
    }

    // our existing results are invalid
    data.results = {};
    data.aria    = {};

    // clear our request queue
    data.requestQueue = null;

    // cancel any outstanding aria job
    this._scheduler.cancel(data.jobIdAria);
    data.jobIdAria = null;

    _stop("_disposeSchedules");
};

})();
