
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Debug,Microsoft,createMockPlatformCollection */

(function() {

//
// Namespaces
//

var Mock       = Calendar.Mock,
    BusyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus;

//
// CalendarManager
//

var CalendarManager = Mock.CalendarManager = function(accountManager) {
    this.calendars = [];
    this._accountManager = accountManager;
};

Jx.augment(CalendarManager, Jx.Events);

Debug.Events.define(CalendarManager.prototype, "calendarAdded", "calendarRemoved");

//
// Public
//

// Testing

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// Data

CalendarManager.prototype.dumpStore = function() {
    // save the calendars
    var calendars = this.calendars;

    // clear them out
    this.calendars = [];

    // notify that we've removed all the calendars
    for (var i = 0, len = calendars.length; i < len; i++) {
        var calendar = calendars[i];

        this.raiseEvent("calendarRemoved", calendar);
        calendar.dispose();
    }
};

// Calendars

CalendarManager.prototype.addCalendar = function () {
    // regardless of the account passed in, create a new account for each calendar added.
    // This is weird, but I didn't want to change it since
    // some tests seem to take advantage of this (at least in free/busy)
    var account = this._accountManager.generateNewAccount();

    // create and add the calendar
    var calendar = new Mock.Calendar(account);
    this.calendars.push(calendar);

    // notify that we've added it
    this.raiseEvent("calendarAdded", calendar);

    // and return the new calendar
    return calendar;
};

CalendarManager.prototype.getAllCalendars = function() {
    return new Mock.CalendarCollection(this);
};

CalendarManager.prototype.getAllCalendarsForAccount = function (account) {
    var calendars = [];

    for (var i = 0; i < this.calendars.length; i++) {
        var calendar = this.calendars[i];

        if (account.objectId === calendar.account.objectId) {
            calendars.push(calendar);
        }
    }

    return createMockPlatformCollection(calendars);
};

// Events

CalendarManager.prototype.getEvents = function(start, end) {
    if (this.generateFakeData) {
        // temporarily prevent raising events on the individual calendars.
        // this is safe because we know nobody is listening to the range of
        // dates that we would potentially add events for.
        var proto = Mock.Calendar.prototype,
            raise = proto.raiseEvent;
        proto.raiseEvent = function () {};

        var ev, i, j, calendar;

        for (i = this.calendars.length; i < 3; i++) {
            this.addCalendar();
        }

        if (!this._days) {
            this._days = {};
        }

        if (this.generateMonthData) {
            if (!(start in this._days)) {
                var startTime   = start.getTime(),
                    endTime     = end.getTime(),
                    fifteenMins = 60 * 15 * 1000;

                for (i = 0; i < 3; i++) {
                    calendar = this.calendars[i];

                    for (j = 0; j < 6; j++) {
                        ev  = calendar.createEvent();

                        ev.allDayEvent = (Math.random() < 0.4);

                        // round random start time to nearest 15 minute interval
                        var time = getRandomInt(startTime, endTime);
                        ev.startDate = new Date(Math.floor(time / fifteenMins) * fifteenMins);

                        // if multiday
                        if (Math.random() < 0.3) {
                            // pick random end time within range
                            time = getRandomInt(time, endTime);
                            ev.endDate = new Date(Math.floor(time / fifteenMins) * fifteenMins);
                        } else {
                            // pick random end time within same day
                            ev.endDate = new Date(ev.startDate.getFullYear(),
                                                  ev.startDate.getMonth(),
                                                  ev.startDate.getDate(),
                                                  getRandomInt(ev.startDate.getHours(), 23),
                                                  getRandomInt(ev.startDate.getMinutes(), 59));
                        }

                        ev.subject = (ev.allDayEvent ? "All Day " : "") + "Event " + ev.startDate.getDate() + " " + ev.endDate.getDate();
                        ev.busyStatus = getRandomInt(BusyStatus.free, BusyStatus.workingElsewhere);
                        ev.commit();
                    }
                }

                this._days[start] = true;
            }
        } else {
            var day   = new Date(start.getFullYear(), start.getMonth(), start.getDate()),
                limit = new Date(end.getFullYear(),   end.getMonth(),   end.getDate() + 1);

            while (day < limit) {
                if (!(day in this._days)) {
                    var year  = day.getFullYear(),
                        month = day.getMonth(),
                        date  = day.getDate();

                    for (i = 0; i < 3; i++) {
                        calendar = this.calendars[i];

                        for (j = 0; j < 2; j++) {
                            ev = calendar.createEvent();

                            ev.allDayEvent = (Math.random() < 0.4);

                            if (ev.allDayEvent) {
                                ev.startDate = new Date(year, month, date);
                                ev.endDate   = new Date(year, month, date + 1);
                            } else {
                                ev.startDate = new Date(year, month, date,
                                                        getRandomInt(0, 23),
                                                        getRandomInt(0, 3) * 15);
                                ev.endDate   = new Date(year, month, date,
                                                        getRandomInt(ev.startDate.getHours(), 23),
                                                        ev.startDate.getMinutes() + 15);
                            }

                            ev.subject    = ev.startDate.getHours() + ":" + ev.startDate.getMinutes() + " - " + ev.endDate.getHours() + ":" + ev.endDate.getMinutes();
                            ev.location   = "Dan's Office (50/1108)";
                            ev.busyStatus = getRandomInt(BusyStatus.free, BusyStatus.workingElsewhere);

                            ev.commit();
                        }
                    }

                    this._days[day] = true;
                }

                day.setDate(day.getDate() + 1);
            }
        }

        // restore raising events on calendars
        proto.raiseEvent = raise;
    }

    // create a new collection
    var events = new Mock.EventCollection(start, end);

    // add ourself as the sole calendar source
    events.addCalendarSource(this);

    return events;
};

CalendarManager.prototype.getEventFromID = function(id) {
    // loop through each calendar and try to get the event from them
    for (var i = 0, len = this.calendars.length; i < len; i++) {
        var ev = this.calendars[i].getEventFromID(id);

        // if we got an event, return it
        if (ev) {
            return ev;
        }
    }

    return null;
};

CalendarManager.prototype.getEventFromHandle = function(handle) {
    // loop through each calendar and try to get the event from them
    for (var i = 0, len = this.calendars.length; i < len; i++) {
        var ev = this.calendars[i].getEventFromHandle(handle);

        // if we got an event, return it
        if (ev) {
            return ev;
        }
    }

    return null;
};

CalendarManager.prototype.getEventsFromUID = function (uid) {
    // Consumers that use this method don't currently depend on change events.  The mock collection returned here does not fire change events.

    var events = [];

    // Find all appropriate events
    for (var i = 0, len = this.calendars.length; i < len; i++) {
        var calendar = this.calendars[i];

        var j, len2, ev;
        // Check the calendar's collections for this event
        // instance collection
        for (j = 0, len2 = calendar.instance.length; j < len2; j++) {
            ev = calendar.instance[j];

            if (ev.uid === uid) {
                events.push(new Mock.EventInstance(ev));
            }
        }

        // recurring collection
        for (j = 0, len2 = calendar.recurring.length; j < len2; j++) {
            ev = calendar.recurring[j];

            if (ev.uid === uid) {
                events.push(new Mock.EventInstance(ev));
            }
        }
    }

    return createMockPlatformCollection(events);
};

CalendarManager.prototype.requestFreeBusyData = function(account, start, end, attendees) {
    return new Mock.FreeBusyRequest(attendees);
};

})();

