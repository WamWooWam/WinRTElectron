
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />

/*global msWriteProfilerMark,Debug,Calendar,Jx,Windows*/

(function () {

function _start(evt) { msWriteProfilerMark("Calendar:Helpers." + evt + ",StartTA,Calendar"); }
function _stop(evt)  { msWriteProfilerMark("Calendar:Helpers." + evt + ",StopTA,Calendar");  }

//
// Namespaces
//

var Helpers = Calendar.Helpers;

//
// Dates
//

Helpers.isSameDate = function(a, b) {
    return a.getDate()     === b.getDate() &&
           a.getMonth()    === b.getMonth() &&
           a.getFullYear() === b.getFullYear();
};

Helpers.isSameMonth = function (a, b) {
    return a.getMonth() === b.getMonth() &&
           a.getFullYear() === b.getFullYear();
};

Helpers.isSameYear = function (a, b) {
    return a.getFullYear() === b.getFullYear();
};

Helpers.isPreviousMonth = function (a, b) {
    // advance the query month and then see if they are the same month
    var qDate = new Date(a.getFullYear(), a.getMonth() + 1, 1);

    return Helpers.isSameMonth(qDate, b);
};

Helpers.isNextMonth = function (a, b) {
    // rewind the query month and then see if they are the same month
    var qDate = new Date(a.getFullYear(), a.getMonth() - 1, 1);

    return Helpers.isSameMonth(qDate, b);
};

Helpers.getMonthsBetween = function (from, to) {
    return 12 * (to.getFullYear() - from.getFullYear()) + to.getMonth() - from.getMonth();
};

Helpers.getYearsBetween = function (from, to) {
    return (to.getFullYear() - from.getFullYear());
};

Helpers.getDayInfo = function(today, day) {
    // build up state about whether the day is today, yesterday, or tomorrow
    var comparedDay = new Date(today);

    var isToday     = Helpers.isSameDate(day, comparedDay),
        isTomorrow  = false,
        isYesterday = false;

    if (!isToday) {
        comparedDay.setDate(comparedDay.getDate() + 1);
        isTomorrow = Helpers.isSameDate(day, comparedDay);

        if (!isTomorrow) {
            comparedDay.setDate(comparedDay.getDate() - 2);
            isYesterday = Helpers.isSameDate(day, comparedDay);
        }
    }

    return {
        day: day,

        isYesterday: isYesterday,
        isToday:     isToday,
        isTomorrow:  isTomorrow
    };
};

//
// Colors
//

Helpers._eventColors = {};

Helpers.processEventColor = function (integer) {
    return Helpers._eventColors[integer] ||
          (Helpers._eventColors[integer] = "#" + ("00000" + integer.toString(16)).substr(-6));
};

//
// Views
//

// JS Date object represents time in ms
Helpers.minuteInMilliseconds = 1000 * 60;
Helpers.hourInMilliseconds = 1000 * 60 * 60;
Helpers.dayInMilliseconds = 1000 * 60 * 60 * 24;

var _longDate = new Jx.DTFormatter("longDate");
var _shortTime = new Jx.DTFormatter("shortTime");
var _shortDate = new Jx.DTFormatter("shortDate");

Helpers.dateAndTime = {
    format: function (date) {
        return _longDate.format(date) + " " + _shortTime.format(date);
    }
};

Helpers.shortDateAndTime = {
    format: function (date) {
        // This is in all of the builtin formats so it is probably useful somewhere, especially since
        // dates can have LTR characters mixed with RTL characters. 
        var directionMarker = Jx.isRtl() ? "\u200F" : "\u200E";  // RLM / LRM
        return (_shortDate.format(date) + directionMarker + " " + _shortTime.format(date));
    }
};

Helpers.ensureFormats = function() {
    _start("ensureFormats");

    var res = Jx.res;

    // load some datetime formats we'll need for events
    Helpers.noSubject = res.getString("NoSubject");
    Helpers.accEvent  = res.getFormatFunction("AccEvent");
    Helpers.accAllDay = res.getFormatFunction("AccEventAllDay");
    Helpers.accAllDayWithDate = res.getFormatFunction("AccEventAllDayWithDate");

    var Formatter = Windows.Globalization.DateTimeFormatting.DateTimeFormatter;

    Helpers._simpleTimeWithMinutes    = new Formatter("hour minute");
    Helpers._simpleTimeWithoutMinutes = new Formatter("hour");

    // here we remove the space from the pattern.  we want "8AM" instead of "8 AM".
    // "\u200b" is a zero-width space, so the line can still break between characters.
    Helpers._simpleTimeWithMinutes = new Formatter(Helpers._simpleTimeWithMinutes.patterns[0].replace(" ", "\u200b"));
    Helpers._simpleTimeWithoutMinutes = new Formatter(Helpers._simpleTimeWithoutMinutes.patterns[0].replace(" ", "\u200b"));
    // Only replace the period pattern as there may be special unicode white space characters roaming about.
    Helpers._simpleTimeWithMinutesNoPeriod = new Formatter(Helpers._simpleTimeWithMinutes.patterns[0].replace(/\{period\.abbreviated\}/, ""));

    Helpers.simpleTimeWithMinutes = {
        format: function(date) {
            return Helpers._simpleTimeWithMinutes.format(date).toLocaleLowerCase();
        }
    };

    Helpers.simpleTimeWithMinutesNoPeriod = {
        format: function(date) {
            return Helpers._simpleTimeWithMinutesNoPeriod.format(date).toLocaleLowerCase();
        }
    };

    Helpers.simpleTimeWithoutMinutes = {
        format: function(date) {
            return Helpers._simpleTimeWithoutMinutes.format(date).toLocaleLowerCase();
        }
    };

    Helpers.simpleTime = {
        format: function(date) {
            if (date.getMinutes()) {
                return Helpers.simpleTimeWithMinutes.format(date);
            }

            return Helpers.simpleTimeWithoutMinutes.format(date);
        }
    };

    Helpers.simpleTimeUpper = {
        format: function(date) {
            if (date.getMinutes()) {
                return Helpers._simpleTimeWithMinutes.format(date);
            }

            return Helpers._simpleTimeWithoutMinutes.format(date);
        },
    };

    Helpers.dateUID = function(date) {
        return date.toDateString().replace(/ /g, "-");
    };

    // In ms
    Helpers.shortEventLength  = 1000 * 60 * 30;     // <= 30 minutes
    Helpers.mediumEventLength = 1000 * 60 * 60 - 1; // <  60 minutes

    Helpers.percentageOfDay = 100 / Helpers.dayInMilliseconds;

    Helpers.busyStatusClasses = [
        "free",
        "tentative",
        "busy",
        "outOfOffice",
        "workingElsewhere"
    ];

    Helpers.accEventStatuses = [
        res.getString("EventStatusFree"),
        res.getString("EventStatusTentative"),
        res.getString("EventStatusBusy"),
        res.getString("EventStatusOOF"),
        res.getString("EventStatusElsewhere")
    ];

    Helpers.firstDayOfWeek = Windows.System.UserProfile.GlobalizationPreferences.weekStartsOn;

    var zeroYear = new Date(0, 0, 1);
    zeroYear.setFullYear(0);

    Helpers.zeroYearTime = zeroYear.getTime();

    // once they're loaded, turns this function into a noop
    Helpers.ensureFormats = Jx.fnEmpty;
    _stop("ensureFormats");
};

Helpers.getEventUiInfo = function(ev, verbose) {
    // we'll need some datetime formats
    Helpers.ensureFormats();

    // we escape user input since it will end up in the ui
    var subject    = ev.subject || Helpers.noSubject,
        place      = ev.location,
        statusText = Helpers.accEventStatuses[ev.busyStatus],
        startDate  = ev.startDate,
        endDate    = ev.endDate,
        calendar   = "",
        email      = "",
        start, end, label;

    try {
        calendar = ev.calendar.name;
        email    = ev.calendar.account.emailAddress;
    } catch (ex) {
        Jx.log.error("Event " + ev.id + " has no calendar.");
    }

    // our acc label format depends on whether the event is all day or not
    if (ev.allDayEvent) {
        if (verbose) {
            start = _longDate.format(startDate);
            end   = _longDate.format(endDate);
            label = Helpers.accAllDayWithDate(start, end, subject, place, calendar, email, statusText);
        } else {
            label = Helpers.accAllDay(subject, place, calendar, email, statusText);
        }
    } else {
        // we use a longer date format if the event is multi-day
        if (Helpers.isSameDate(startDate, endDate) && !verbose) {
            start = _shortTime.format(startDate);
            end   = _shortTime.format(endDate);
        } else {
            start = Helpers.dateAndTime.format(startDate);
            end   = Helpers.dateAndTime.format(endDate);
        }

        label = Helpers.accEvent(start, end, subject, place, calendar, email, statusText);
    }

    return {
        handle: ev.handle,

        subject:  subject,
        location: place,
        label:    label,

        calendar: calendar,
        email: email,
        statusText: statusText,

        color:  Helpers.processEventColor(ev.color),
        status: Helpers.busyStatusClasses[ev.busyStatus]
    };
};

var multiDayUniqueId = 0;
Helpers.getIdFromEventHandle = function (handle, isCrossDay) {
    var uniqueHandleSuffix = isCrossDay ? '-' + (multiDayUniqueId++) : '';
    return handle + uniqueHandleSuffix;
};

Helpers.getNowDate = function () {
    // Overridable for UT's
    return new Date();
};

Helpers.roundDateDown = function (date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

Helpers.getDaysUntilStart = function (evt) {
    /// <summary>Helper function for BICI that wants to know how many days there are</summary>
    /// <param name="evt" type="Microsoft.WindowsLive.Platform.Calendar.IEvent">Event to check</param>

    Debug.assert(!Jx.isNullOrUndefined(evt), "Event is required");

    // Could be repurposed to diff two dates, but so far all consumers are using the current date
    return Math.ceil((Helpers.roundDateDown(evt.startDate) - Helpers.roundDateDown(Helpers.getNowDate())) / Helpers.dayInMilliseconds);
};

Helpers.orderEvents = function(first, second) {
    var start1 = first.start;
    var start2 = second.start;

    if (start1 < start2) {
        return -1;
    } else if (start1 > start2) {
        return 1;
    }

    var winrt1 = first.winrt;
    var winrt2 = second.winrt;
    var busyStatus1 = winrt1.busyStatus;
    var busyStatus2 = winrt2.busyStatus;

    // reverse order
    if (busyStatus1 > busyStatus2) {
        return -1;
    } else if (busyStatus1 < busyStatus2) {
        return 1;
    }

    var end1 = first.end;
    var end2 = second.end;

    // reverse order
    if (end1 > end2) {
        return -1;
    } else if (end1 < end2) {
        return 1;
    }

    var id1 = winrt1.id;
    var id2 = winrt2.id;

    if (id1 < id2) {
        return -1;
    } else if (id1 > id2) {
        return 1;
    }

    return 0;
};

Helpers.getCollection = function(startDate, endDate, collection) {
    var events = [];

    for (var i = 0, len = collection.count; i < len; i++) {
        var winrt = collection.item(i);

        if (winrt) {
            var start = winrt.startDate.getTime();
            var end   = winrt.endDate.getTime();

            if (start <= endDate && end >= startDate) {
                events.push({
                    winrt: winrt,
                    start: start,
                    end: end,
                });
            }
        }
    }

    return events;
};


})();

