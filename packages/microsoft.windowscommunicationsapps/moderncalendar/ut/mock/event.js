
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function() {
/*global Calendar,Debug,Jx,Microsoft*/

//
// Namespaces
//

var Mock     = Calendar.Mock,
    Platform = Microsoft.WindowsLive.Platform.Calendar;

//
// Event
//

var Event = Mock.Event = function(calendar) {
    this.calendar = calendar;

    this.startDate = new Date(Event.DEFAULT_DATE);
    this.endDate   = new Date(Event.DEFAULT_DATE);

    this.color = calendar.color;

    this._store      = {};
    this._exceptions = {};
};

Jx.augment(Event, Jx.Events);

Debug.Events.define(Event.prototype, "changed", "exceptionAdded");

//
// Static
//

Event.DEFAULT_DATE = new Date("1/31/1601 4:00pm");
Event.FIELDS       = [
    "allDayEvent",
    "busyStatus",
    "color",
    "endDate",
    "id",
    "handle",
    "location",
    "recurring",
    "recurrence",
    "startDate",
    "subject",
    "objectId"
];

//
// Public
//

// Events

Debug.Events.define(Event.prototype, "commit");

// Fields

Event.prototype.id     = 0;
Event.prototype.handle = 0;

Event.prototype.subject  = "";
Event.prototype.location = "";

Event.prototype.busyStatus = Platform.BusyStatus.free;

Event.prototype.allDayEvent = false;
Event.prototype.recurring   = false;
Event.prototype.recurrence  = {
    recurrenceType: Platform.RecurrenceType.daily
};

// Occurrences

Event.prototype.getOccurrence = function(start) {
    return new Mock.EventOccurrence(this, this._exceptions[start], start);
};

Event.prototype.createException = function(start) {
    // create the exception
    var exception = new Mock.Event(this.calendar);

    // copy its values from the series
    for (var i = 0, len = Event.FIELDS.length; i < len; i++) {
        var field = Event.FIELDS[i];
        exception[field] = Mock.copy(this[field]);
    }

    // overwrite with the correct start and end dates
    exception.startDate = new Date(start);
    exception.endDate   = new Date(start.getTime() + this.endDate.getTime() - this.startDate.getTime());

    // save it
    exception.commit();
    this._exceptions[start] = exception;

    // notify listeners
    this.raiseEvent("exceptionAdded", {
        start:     start,
        exception: exception
    });
};

Event.prototype.getExceptions = function() {
    return this._exceptions;
};

// Properties & Store

Event.prototype.commit = function() {
    var store = this._store;

    if (!this.id) {
        this.id     = ++Event._id;
        this.handle = String(this.id);
        this.objectId = this.handle;
    }

    for (var i = 0, len = Event.FIELDS.length; i < len; i++) {
        var field  = Event.FIELDS[i],
            stored = store[field],
            value  = this[field];

        if (!Mock.areEqual(value, stored)) {
            store[field] = Mock.copy(value);

            this.raiseEvent("changed", {
                target: this,
                detail: [[field]],

                previous: stored,
                current:  value
            });
        }
    }

    this.raiseEvent("commit", this);
};

Event.prototype.validate = function () {
    return 0; // success
};

// Shutdown

Event.prototype.dispose = function() {
    for (var key in this._exceptions) {
        this._exceptions[key].dispose();
    }

    this._store      = null;
    this._exceptions = null;

    this.disposeEvents();
};

Event.prototype.addEventListener    = Event.prototype.addListener;
Event.prototype.removeEventListener = Event.prototype.removeListener;

//
// Private
//

Event._id = 0;

})();

