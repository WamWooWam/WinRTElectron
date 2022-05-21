
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />

/*global Debug,Jx,Calendar*/

Jx.delayDefine(Calendar.Views, 'AgendaHelpers', function () {

    function _start(evt) { Jx.mark('Calendar:AgendaHelpers.' + evt + ',StartTA,Calendar'); }
    function _stop(evt) { Jx.mark('Calendar:AgendaHelpers.' + evt + ',StopTA,Calendar'); }

    //
    // Namespaces
    //

    var Helpers = Calendar.Helpers;

    //
    // Agenda Helpers
    //

    var AgendaHelpers = Calendar.Views.AgendaHelpers = {};

    // Change type enum
    AgendaHelpers.ChangeType = {
        add: 0,
        remove: 1,
        change: 2,
    };

    AgendaHelpers.ensureInitialized = function () {
        /// <summary>Ensure that the helpers have been initialized before use</summary>
        if (!AgendaHelpers._initialized) {
            AgendaHelpers._initialized = true;

            // Ensure the calendar helpers are initialized
            Helpers.ensureFormats();

            // Get and cache the strings
            AgendaHelpers._yesterday = Jx.res.getString('Yesterday');
            AgendaHelpers._today = Jx.res.getString('Today');
            AgendaHelpers._tomorrow = Jx.res.getString('Tomorrow');

            AgendaHelpers._heroUpNext = Jx.res.getString('UpNext');
            AgendaHelpers._heroNow = Jx.res.getString('Now');
            AgendaHelpers._heroInOneMinute = Jx.res.getString('InOneMinute');

            // Get and cache the string format funtions
            AgendaHelpers._heroInMinutes = { format: Jx.res.getFormatFunction('InMinutes') };            
            AgendaHelpers._timeRange = { format: Jx.res.getFormatFunction('AgendaTimeRange') };

            // Get and cache the accessibility string format functions
            AgendaHelpers._accEventAllDay = { format: Jx.res.getFormatFunction('AccEventAllDay') };
            AgendaHelpers._accEventAllDayWithDate = { format: Jx.res.getFormatFunction('AccEventAllDayWithDate') };
            AgendaHelpers._accAgendaAllDayMultiDay = { format: Jx.res.getFormatFunction('AccAgendaAllDayMultiDay') };
            
            AgendaHelpers._accAgendaHero = { format: Jx.res.getFormatFunction('AccAgendaHero') };
            AgendaHelpers._accAgendaEvent = { format: Jx.res.getFormatFunction('AccAgendaEvent') };
            AgendaHelpers._accAgendaEventMultiDay = { format: Jx.res.getFormatFunction('AccAgendaEventMultiDay') };

            // Initialized our date/time formatters
            AgendaHelpers._timeWithMinutes = new Jx.DTFormatter('hour minute');
            AgendaHelpers._shortDate = new Jx.DTFormatter("shortDate");
            AgendaHelpers._dayFull = new Jx.DTFormatter('{dayofweek.full}');
            AgendaHelpers._fullDateWithDay = new Jx.DTFormatter('dayofweek month day year');
            AgendaHelpers._fullDateWithDayAndTime = new Jx.DTFormatter('dayofweek month day year hour minute');
        }
    };

    AgendaHelpers.registerInteractiveHandlers = function (el) {
        /// <summary>adds handlers to the element for hover and active states if needed</summary>
        /// <param name="el" type="DOMElement">header element to register on</param>

        // does it already have handlers?
        var anchorHandlers = el._anchorHandlers,
            anchorEl = el;

        if (!anchorHandlers) {
            anchorHandlers = {};
            anchorEl._anchorHandlers = anchorHandlers;

            anchorHandlers.onMouseOver = function (ev) {
                if (anchorEl) {
                    anchorEl.classList.add("hover");
                }

                ev.stopPropagation();
                ev.preventDefault();
            };

            anchorHandlers.onMouseOut = function (ev) {
                if (anchorEl) {
                    var cl = anchorEl.classList;
                    cl.remove("hover");
                    cl.remove("active");
                }

                ev.stopPropagation();
                ev.preventDefault();
            };

            anchorHandlers.onMouseDown = function (ev) {
                if (anchorEl) {
                    anchorEl.classList.add("active");
                }

                ev.stopPropagation();
                ev.preventDefault();
            };

            anchorHandlers.onMouseUp = function (ev) {
                if (anchorEl) {
                    anchorEl.classList.remove("active");
                }

                ev.stopPropagation();
                ev.preventDefault();
            };

            anchorHandlers.onMouseClick = function () {
                if (anchorEl) {
                    var cl = anchorEl.classList;
                    cl.remove("active");
                    cl.remove("hover");
                }

                // allow propagation to the centralized handler on each view
            };

            anchorEl.addEventListener("mouseover", anchorHandlers.onMouseOver);
            anchorEl.addEventListener("mouseout", anchorHandlers.onMouseOut);
            anchorEl.addEventListener("mousedown", anchorHandlers.onMouseDown);
            anchorEl.addEventListener("mouseup", anchorHandlers.onMouseUp);
            anchorEl.addEventListener("click", anchorHandlers.onMouseClick);
        }
    };

    AgendaHelpers.unregisterInteractiveHandlers = function (el) {
        /// <summary>removes handlers from the element for hover and active states if present</summary>
        /// <param name="el" type="DOMElement">header element to remove from</param>

        // does it have handlers?
        var anchorHandlers = el._anchorHandlers,
            anchorEl = el;

        if (anchorHandlers) {
            anchorEl._anchorHandlers = null;

            anchorEl.removeEventListener("mouseover", anchorHandlers.onMouseOver);
            anchorEl.removeEventListener("mouseout", anchorHandlers.onMouseOut);
            anchorEl.removeEventListener("mousedown", anchorHandlers.onMouseDown);
            anchorEl.removeEventListener("mouseup", anchorHandlers.onMouseUp);
            anchorEl.removeEventListener("click", anchorHandlers.onMouseClick);
        }
    };

    AgendaHelpers.getDayFromDate = function (date, dayOffset) {
        /// <summary>Takes a date object and returns only the year/month/day parts of it in a new date object</summary>
        /// <param name="date">The Date object to extract the day from</param>
        /// <param name="dayOffset" optional="True">The number of days to offset by (e.g. a value of 1 would give you tomorrows "day")</param>
        /// <returns>A new Date object with just year/month/day filled in</returns>
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');
        Debug.assert(Jx.isUndefined(dayOffset) || Jx.isValidNumber(dayOffset), 'Jx.isUndefined(dayOffset) || Jx.isValidNumber(dayOffset)');

        dayOffset = Jx.isValidNumber(dayOffset) ? dayOffset : 0;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset);
    };

    AgendaHelpers.containsDate = function (start, end, date) {
        /// <summary>Given a start and end date, determines whether the given date falls within the range</summary>
        /// <param name="start">The Date object denoting the lower bound (inclusive)</param>
        /// <param name="end">The Date object denoting the upper bound (exclusive)</param>
        /// <param name="date">The Date object to compare</param>
        /// <returns>True if the date falls within the range, false otherwise</returns>
        Debug.assert(Jx.isDate(start), 'Jx.isDate(start)');
        Debug.assert(Jx.isDate(end), 'Jx.isDate(end)');
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');

        return start.getTime() <= date.getTime() && date.getTime() < end.getTime();
    };

    AgendaHelpers.compareDates = function (date1, date2) {
        /// <summary>Compares two Date objects</summary>
        /// <param name="date1">The first Date object</param>
        /// <param name="date2">The second Date object</param>
        /// <returns>A value less than zero if date1 is less than date2, zero if the items are equivalent, or a value greater than zero if date1 is greater than date2</returns>
        Debug.assert(Jx.isDate(date1), 'Jx.isDate(date1)');
        Debug.assert(Jx.isDate(date2), 'Jx.isDate(date2)');

        return date1.getTime() - date2.getTime();
    };

    AgendaHelpers.getEventDaySpans = function (event) {
        /// <summary>Breaks an event into day spans</summary>
        /// <param name="event">The WinRT event object</param>
        /// <returns>The array of day break times</returns>
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');

        _start('getEventDaySpans');

        var spans = [];
        var next = new Date(event.startDate.getTime());
        var end = new Date(event.endDate.getTime());

        // We always want to push the start date
        do {
            spans.push(next);
            next = AgendaHelpers.getDayFromDate(next, 1);
        } while (next.getTime() < end.getTime());

        // Push the end date
        spans.push(end);

        _stop('getEventDaySpans');

        return spans;
    };

    AgendaHelpers.showInAllDayCard = function (event) {
        /// <summary>Determines whether the event should be shown in the all day card</summary>
        /// <param name="event">The WinRT event object</param>
        /// <returns>True if the event should be shown in the all day card, false otherwise</returns>
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');

        if (event.allDayEvent) {
            // The event is an all day event, no debate here
            return true;
        }

        if (event.endDate.getTime() - event.startDate.getTime() >= Helpers.dayInMilliseconds) {
            // The event is greater than or equal to 24 hours
            return true;
        }

        return false;
    };

    AgendaHelpers.isWithinWeek = function (today, date) {
        /// <summary>Determines whether the given date occurs within the next week</summary>
        /// <param name="today">The today reference Date object</param>
        /// <param name="date">The Date object to compare</param>
        /// <returns>True if the date occurs within the next week, false otherwise</returns>
        Debug.assert(Jx.isDate(today), 'Jx.isDate(today)');
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');

        today = AgendaHelpers.getDayFromDate(today);
        var end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8);

        return AgendaHelpers.containsDate(today, end, date);
    };

    AgendaHelpers.getDateString = function (today, date) {
        /// <summary>Creates a date string relative to today's date</summary>
        /// <param name="today">The Date object representing today's date</param>
        /// <param name="date">The date object to process</param>
        /// <returns>The formatted date string</returns>
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');

        var info = Helpers.getDayInfo(today, date);

        if (info.isToday) {
            return AgendaHelpers._today;
        } else if (info.isTomorrow) {
            return AgendaHelpers._tomorrow;
        } else {
            return AgendaHelpers._fullDateWithDay.format(date);
        }
    };

    AgendaHelpers.getRelativeDateString = function (today, base, date) {
        /// <summary>Generates a string representing a date relative to now</summary>
        /// <param name="today">The Date object representing today's date</param>
        /// <param name="base">The base Date object that represents the date this item will show up on</param>
        /// <param name="date">The Date object representing the date to format</param>
        /// <returns>A formatted date string</returns>
        Debug.assert(Jx.isDate(base), 'Jx.isDate(base)');
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');

        if (Helpers.isSameDate(today, base)) {
            // This date will be shown on today's items, use relative dates
            var dayInfo = Helpers.getDayInfo(today, date);

            if (dayInfo.isYesterday) {
                return AgendaHelpers._yesterday;
            } else if (dayInfo.isToday) {
                return AgendaHelpers._today;
            } else if (dayInfo.isTomorrow) {
                return AgendaHelpers._tomorrow;
            }
        }

        if (AgendaHelpers.isWithinWeek(today, date)) {
            // It's within a week into the future, show days of the week
            return AgendaHelpers._dayFull.format(date);
        }
        
        // If all else fails, show an explicit short date
        return AgendaHelpers._shortDate.format(date);
    };

    AgendaHelpers.getTimeRange = function (today, start, end, showInAllDayCard, event) {
        /// <summary>Generates a UI string representing a range of time</summary>
        /// <param name="today">The Date object representing today's date</param>
        /// <param name="start">The Date object representing the start of the range</param>
        /// <param name="end">The Date object representing the end of the range</param>
        /// <param name="showInAllDayCard">Indicates whether the item is being treated as an all day event</param>
        /// <param name="event">The WinRT event object</param>
        /// <returns>A formatted time range string</returns>
        Debug.assert(Jx.isDate(start), 'Jx.isDate(start)');
        Debug.assert(Jx.isDate(end), 'Jx.isDate(end)');
        Debug.assert(Jx.isBoolean(showInAllDayCard), 'Jx.isBoolean(showInAllDayCard)');
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');

        _start('getTimeRange');
        
        var range = {
            startHtml: null,
            fullHtml: null,
        };

        if (start.getTime() === end.getTime()) {
            // We can save ourselves some processing
            range.fullHtml = Jx.escapeHtml(AgendaHelpers._timeWithMinutes.format(start));
            return range;
        }

        var endMinusOne = new Date(end.getTime() - 1);
        var eventEndMinusOne = new Date(event.endDate.getTime() - 1);

        var sameStart = Helpers.isSameDate(start, event.startDate);
        var sameEnd = Helpers.isSameDate(endMinusOne, eventEndMinusOne);

        if (!showInAllDayCard) {
            // This event will be shown in a normal card
            var startFormat = sameStart ? AgendaHelpers._timeWithMinutes.format(start) : AgendaHelpers.getRelativeDateString(today, start, event.startDate);
            var endFormat = sameEnd ? AgendaHelpers._timeWithMinutes.format(end) : AgendaHelpers.getRelativeDateString(today, start, eventEndMinusOne);
            var fullFormat = (startFormat !== endFormat) ? AgendaHelpers._timeRange.format(startFormat, endFormat) : startFormat;

            range.fullHtml = Jx.escapeHtml(fullFormat);
        } else if (!event.allDayEvent) {
            // This event will be shown in the all day section, but is not strictly an all day event
            if (sameStart && !sameEnd) {
                range.startHtml = Jx.escapeHtml(Helpers.simpleTimeUpper.format(start));
            }
        }

        _stop('getTimeRange');

        return range;
    };

    AgendaHelpers.getHeroHeader = function (now, heroItem) {
        /// <summary>Creates the header string for a given hero item</summary>
        /// <param name="now">The "now" time to calculate relative to</param>
        /// <param name="heroItem">The wrapped event item representing the hero</param>
        /// <returns>The header string for the given item</returns>
        if (Jx.isObject(heroItem)) {
            var startInfo = Helpers.getDayInfo(now, heroItem.startDate);

            // Start diff in minutes
            var startDiff = (heroItem.startDate - now) / Helpers.minuteInMilliseconds;

            if (startInfo.isTomorrow) {
                return AgendaHelpers._tomorrow;
            } else {
                if (startDiff <= 0) {
                    // Start was in the past
                    return AgendaHelpers._heroNow;
                } else if (startDiff <= 1) {
                    // Starts within one minute
                    return AgendaHelpers._heroInOneMinute;
                } else if (startDiff <= 15) {
                    // Starts within 15 minutes
                    return AgendaHelpers._heroInMinutes.format(Math.ceil(startDiff));
                } else {
                    // Starts sometime in the future
                    return AgendaHelpers._heroUpNext;
                }
            }
        }

        // No item to examine, just return null
        return null;
    };

    AgendaHelpers.getEventLabel = function (event, item, now, isHero) {
        /// <summary>Creates the header string for a given hero item</summary>
        /// <param name="event">The event object</param>
        /// <param name="item">The item containing a single day of the event</param>
        /// <param name="now">The "now" time to calculate relative to</param>
        /// <param name="isHero">Whether this is a hero item</param>
        /// <returns>The header string for the given item</returns>
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
        Debug.assert(Jx.isDate(now), 'Jx.isDate(now)');
        Debug.assert(Jx.isUndefined(isHero) || Jx.isBoolean(isHero), 'Jx.isUndefined(isHero) || Jx.isBoolean(isHero)');

        var startDate = item.startDate;
        var endDate = item.endDate;
        var eventStartDate = event.startDate;
        var eventEndDate = event.endDate;
        var eventEndDateMinusOne = new Date(eventEndDate.getTime() - 1);
        var allDayEvent = event.allDayEvent;

        var subject = event.subject;
        var location = event.location;
        var calendar = event.calendar;
        var email = event.email;
        var statusText = event.statusText;

        if (event.showInAllDayCard) {
            if (allDayEvent && !item.multiDay) {
                return AgendaHelpers._accEventAllDay.format(subject, location, calendar, email, statusText);
            } else if (!allDayEvent) {
                return AgendaHelpers._accAgendaAllDayMultiDay.format(
                    AgendaHelpers._fullDateWithDayAndTime.format(eventStartDate),
                    AgendaHelpers._fullDateWithDayAndTime.format(eventEndDate),
                    subject,
                    location,
                    calendar,
                    email,
                    statusText);
            } else {
                return AgendaHelpers._accEventAllDayWithDate.format(
                    AgendaHelpers._fullDateWithDay.format(eventStartDate),
                    AgendaHelpers._fullDateWithDay.format(eventEndDateMinusOne),
                    subject,
                    location,
                    calendar,
                    email,
                    statusText);
            }
        } else {
            var date = AgendaHelpers.getDateString(now, startDate);
            var startTime = !item.multiDay ? AgendaHelpers._timeWithMinutes.format(startDate) : AgendaHelpers._fullDateWithDayAndTime.format(eventStartDate);
            var endTime = !item.multiDay ? AgendaHelpers._timeWithMinutes.format(endDate) : AgendaHelpers._fullDateWithDayAndTime.format(eventEndDate);

            if (isHero) {
                var relativeTime = AgendaHelpers.getHeroHeader(now, item);
                return AgendaHelpers._accAgendaHero.format(date, relativeTime, startTime, endTime, subject, location, calendar, email, statusText);
            } else if (item.multiDay) {
                return AgendaHelpers._accAgendaEventMultiDay.format(date, startTime, endTime, subject, location, calendar, email, statusText);
            } else {
                return AgendaHelpers._accAgendaEvent.format(date, startTime, endTime, subject, location, calendar, email, statusText);
            }
        }
    };

    AgendaHelpers.wrapEvent = function (rangeStart, rangeEnd, event) {
        /// <summary>Wrap an event with UI-specific data</summary>
        /// <param name="event">A WinRT Platform event object</param>
        /// <returns>A wrapped event containing only valid event pieces</returns>
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');

        _start('wrapEvent');

        // Get the time spans
        var spans = AgendaHelpers.getEventDaySpans(event);
        var spansLength = spans.length;

        // Get the verbose info for the event
        var uiInfo = Helpers.getEventUiInfo(event);

        // Fill in the common properties
        var handle = uiInfo.handle;
        var showInAllDayCard = AgendaHelpers.showInAllDayCard(event);

        // Initialize the wrapper
        var items = [];
        var wrapper = {
            allDayEvent: event.allDayEvent,
            startDate: event.startDate,
            endDate: event.endDate,
            handle: handle,
            objectId: event.objectId,

            // Raw event properties for later label calculation
            subject: uiInfo.subject,
            location: uiInfo.location,
            statusText: uiInfo.statusText,
            calendar: uiInfo.calendar,
            email: uiInfo.email,

            showInAllDayCard: showInAllDayCard,
            items: items
        };
        
        // Get the common properties for the event pieces
        var busyStatus = event.busyStatus;
        var multiDay = spansLength > 2;

        // UI properties - escaped HTML
        var colorHtml = Jx.escapeHtml(uiInfo.color);
        var handleHtml = Jx.escapeHtml(handle);
        var locationHtml = Jx.escapeHtml(uiInfo.location);
        var subjectHtml = Jx.escapeHtml(uiInfo.subject);

        // Iterate through the spans
        var start = spans[0];

        for (var i = 1, len = spansLength; i < len; i++) {
            var end = spans[i];

            // Make sure we don't try to render pieces of the event that fall out of range.
            if (AgendaHelpers.containsDate(rangeStart, rangeEnd, start)) {
                var timeRange = AgendaHelpers.getTimeRange(rangeStart, start, end, showInAllDayCard, event);

                var item = {
                    // Event properties
                    startDate: start,
                    endDate: end,
                    busyStatus: busyStatus,
                    multiDay: multiDay,                    

                    // UI properties
                    busyStatusClass: uiInfo.status,
                    timeRange: timeRange,

                    // UI properties - escaped HTML
                    colorHtml: colorHtml,
                    handleHtml: handleHtml,
                    locationHtml: locationHtml,
                    subjectHtml: subjectHtml,
                };

                // Calculate the event label
                item.label = AgendaHelpers.getEventLabel(wrapper, item, rangeStart);

                // Convert the Date objects to their integer values for serialization
                item.startDate = item.startDate.getTime();
                item.endDate = item.endDate.getTime();

                items.push(item);
            }

            // We'll use the end time as the start for the next span
            start = end;
        }

        // Convert the Date objects to their integer values for serialization
        wrapper.startDate = wrapper.startDate.getTime();
        wrapper.endDate = wrapper.endDate.getTime();

        _stop('wrapEvent');

        return wrapper;
    };

});
