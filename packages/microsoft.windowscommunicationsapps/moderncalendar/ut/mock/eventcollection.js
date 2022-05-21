
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Debug,Microsoft */

// JSCop doesn't like aligning equal signs between lines
/// <disable>JS2021.SeparateBinaryOperatorArgumentsWithSpaces</disable>

// JSCop doesn't like "var fn = function() {};"
/// <disable>JS2030.FollowKeywordsWithSpace</disable>

// JSCop wants us to camel-case our namespaces and classes
/// <disable>JS2076.IdentifierIsMiscased</disable>

// JSCop doesn't like implicit number to string conversions
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>

// JSCop doesn't understand Jx.augment
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

(function() {

//
// Namespaces
//

var Mock       = Calendar.Mock,
    Platform   = Microsoft.WindowsLive.Platform,
    ChangeType = Platform.CollectionChangeType,
    Recurrence = Platform.Calendar.RecurrenceType;

//
// EventCollection
//

var EventCollection = Mock.EventCollection = function(start, end) {
    this._start = start;
    this._end   = end;

    this._calendarSources = [];
    this._eventSources    = [];

    this._events = [];
};

Jx.augment(EventCollection, Jx.Events);

Debug.Events.define(EventCollection.prototype, "collectionchanged");

//
// Public
//

// Collection

Object.defineProperty(EventCollection.prototype, "count", {
    get: function() {
        return this._events.length;
    }
});

EventCollection.prototype.item = function(index) {
    return this._events[index];
};

EventCollection.prototype.lock   = Jx.fnEmpty;
EventCollection.prototype.unlock = Jx.fnEmpty;

EventCollection.prototype.addEventListener    = EventCollection.prototype.addListener;
EventCollection.prototype.removeEventListener = EventCollection.prototype.removeListener;

EventCollection.prototype.dispose = function() {
    var i,
        len;

    // clear our events
    var events = this._events;
    this._events = [];

    for (i = 0, len = events.length; i < len; i++) {
        var ev = events[i];

        ev.removeListener("changed", this._onEventChanged, this);
        events[i].dispose();
    }

    // stop listening for events
    for (i = 0, len = this._calendarSources.length; i < len; i++) {
        var calendarSource = this._calendarSources[i];

        calendarSource.removeListener("calendarAdded",   this._onCalendarAdded,   this);
        calendarSource.removeListener("calendarRemoved", this._onCalendarRemoved, this);
    }

    for (i = 0, len = this._eventSources.length; i < len; i++) {
        var eventSource = this._eventSources[i];

        eventSource.removeListener("eventAdded",   this._onEventAdded,   this);
        eventSource.removeListener("eventRemoved", this._onEventRemoved, this);
    }

    this._calendarSources = null;
    this._eventSources    = null;

    // stop firing events
    this.disposeEvents();
};

// Data Sources

EventCollection.prototype.addCalendarSource = function(source) {
    var calendars = source.calendars;

    for (var i = 0, len = calendars.length; i < len; i++) {
        this.addEventSource(calendars[i]);
    }

    source.addListener("calendarAdded",   this._onCalendarAdded,   this);
    source.addListener("calendarRemoved", this._onCalendarRemoved, this);

    this._calendarSources.push(source);
};

EventCollection.prototype.addEventSource = function(source) {
    this._addInstance(source.instance);
    this._addRecurring(source.recurring);

    source.addListener("eventAdded",   this._onEventAdded,   this);
    source.addListener("eventRemoved", this._onEventRemoved, this);

    this._eventSources.push(source);
};

//
// Private
//

// Static

// Helpers

EventCollection.prototype._sortEvents = function() {
    this._events.sort(Mock.eventComparer);
};

EventCollection.prototype._addInstance = function(events) {
    var added = [];

    for (var i = 0, len = events.length; i < len; i++) {
        var ev = events[i];

        if (ev.startDate < this._end) {
            if (ev.endDate > this._start) {
                var instance = new Mock.EventInstance(ev);
                instance.addListener("changed", this._onEventChanged, this);

                this._events.push(instance);
                added.push(instance);
            }
        } else {
            break;
        }
    }

    this._sortEvents();
    this._fireAdds(added);
};

EventCollection.prototype._addRecurring = function(events) {
    var added = [];

    for (var i = 0, len = events.length; i < len; i++) {
        var ev         = events[i],
            exceptions = ev.getExceptions();

        var recurrence = ev.recurrence,
            evStart    = new Date(ev.startDate),
            evEnd      = new Date(ev.endDate);

        while (evStart < this._end) {
            if (evEnd > this._start) {
                var instance = new Mock.EventOccurrence(ev, exceptions[evStart], evStart);
                instance.addListener("changed", this._onEventChanged, this);

                this._events.push(instance);
                added.push(instance);
            }

            switch (ev.recurrence.recurrenceType) {
            case Recurrence.daily:
                evStart.setDate(evStart.getDate() + 1);
                evEnd.setDate(evEnd.getDate() + 1);
                break;

            case Recurrence.weekly:
                evStart.setDate(evStart.getDate() + 7);
                evEnd.setDate(evEnd.getDate() + 7);
                break;

            case Recurrence.monthly:
                evStart.setMonth(evStart.getMonth() + 1);
                evEnd.setMonth(evEnd.getMonth() + 1);
                break;

            case Recurrence.yearly:
                evStart.setFullYear(evStart.getFullYear() + 1);
                evEnd.setFullYear(evEnd.getFullYear() + 1);
                break;

            default:
                evStart = this._end;
                break;
            }
        }
    }

    this._sortEvents();
    this._fireAdds(added);
};

EventCollection.prototype._removeEvents = function(events) {
    for (var i = 0, len = events.length; i < len; i++) {
        var ev = events[i];

        for (var j = this._events.length; j--;) {
            var instance = this._events[j];

            if (instance.id === ev.id) {
                instance.removeListener("changed", this._onEventChanged, this);
                this._events.splice(j, 1);

                this.raiseEvent("collectionchanged", {
                    target: this,
                    eType:  ChangeType.itemRemoved,
                    index:  j
                });
            }
        }
    }
};

EventCollection.prototype._fireAdds = function(added) {
    var events = this._events;

    added.forEach(function(ev) {
        ev._index = events.indexOf(ev);
    });

    added.sort(function(a, b) {
        a._index - b._index;
    });

    added.forEach(function(ev) {
        this.raiseEvent("collectionchanged", {
            target: this,
            eType:  ChangeType.itemAdded,
            index:  ev._index
        });
    }, this);
};

// Events

EventCollection.prototype._onCalendarAdded = function(calendar) {
    this.addEventSource(calendar);
};

EventCollection.prototype._onCalendarRemoved = function(calendar) {
    var index = this._eventSources.indexOf(calendar);

    if (index !== -1) {
        calendar.removeListener("eventAdded",   this._onEventAdded,   this);
        calendar.removeListener("eventRemoved", this._onEventRemoved, this);

        this._eventSources.splice(index, 1);
    }

    // save the old length
    var len = this._events.length;

    // try to remove the instance and recurring events
    this._removeEvents(calendar.instance);
    this._removeEvents(calendar.recurring);
};

EventCollection.prototype._onEventAdded = function(ev) {
    // save the old length
    var len = this._events.length;

    // try and add the event
    if (ev.recurring) {
        this._addRecurring([ev]);
    } else {
        this._addInstance([ev]);
    }
};

EventCollection.prototype._onEventRemoved = function(ev) {
    // save the old length
    var len = this._events.length;

    // try remove the event
    this._removeEvents([ev]);
};

EventCollection.prototype._onEventChanged = function(ev) {
    var property = ev.detail[0][0];

    // certain properties can result in needing to reorder our events
    if (property === "startDate" || property === "endDate" || property === "busyStatus") {
        this._sortEvents();
        // TODO: figure out what has changed and fire an event
    }
};

})();

