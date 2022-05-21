
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

var Mock     = Calendar.Mock,
    Event    = Mock.Event,
    Platform = Microsoft.WindowsLive.Platform.Calendar;

//
// EventOccurrence
//

var EventOccurrence = Mock.EventOccurrence = function(series, exception, start) {
    // cache our params
    this._series    = series;
    this._exception = exception;

    this._start = new Date(start);

    // create a local cache of values
    var base = this._exception || this._series;

    for (var i = 0, len = Event.FIELDS.length; i < len; i++) {
        var field = Event.FIELDS[i],
            value = Mock.copy(base[field]);

        this[field] = value;
    }

    // handles are special for occurrences
    this.handle = this.id + "." + this._start.getTime();

    // the calendar won't change, so just reference it directly
    this.calendar = base.calendar;

    // listen for changes on it
    series.addListener("changed", this._onSeriesChanged, this);

    // if we have an exception, listen for changes on that too
    if (exception) {
        exception.addListener("changed", this._onExceptionChanged, this);
    } else {
        // otherwise override our series dates with our occurrence dates
        this.startDate = new Date(start);
        this.endDate   = new Date(start.getTime() + this._series.endDate.getTime() - this._series.startDate.getTime());

        // and listen for an exception to be added
        this._series.addListener("exceptionAdded", this._onExceptionAdded, this);
    }
};

Jx.augment(EventOccurrence, Jx.Events);

Debug.Events.define(EventOccurrence.prototype, "changed");

//
// Public
//

// Methods

EventOccurrence.prototype.dispose = function() {
    this._series.removeListener("changed", this._onSeriesChanged, this);

    if (this._exception) {
        this._exception.removeListener("changed", this._onExceptionChanged, this);
    } else {
        this._series.removeListener("exceptionAdded", this._onExceptionAdded, this);
    }

    this._series    = null;
    this._exception = null;

    this.disposeEvents();
};

EventOccurrence.prototype.commit = function() {
    // if we don't have an exception yet, create one
    if (!this._exception) {
        this._series.createException(this._start);
    }

    // save our updated values to the exception
    for (var i = 0, len = Event.FIELDS.length; i < len; i++) {
        var field = Event.FIELDS[i],
            old   = this._exception[field],
            value = this[field];

        if (!Mock.areEqual(value, old)) {
            this._exception[field] = value;

            this.raiseEvent("changed", {
                target: this,
                detail: [[field]],

                previous: old,
                current:  value
            });
        }
    }

    // and commit it
    this._exception.commit();
};

EventOccurrence.prototype.addEventListener    = EventOccurrence.prototype.addListener;
EventOccurrence.prototype.removeEventListener = EventOccurrence.prototype.removeListener;

//
// Private
//

EventOccurrence.prototype._onSeriesChanged = function(ev) {
    var field = ev.detail[0][0],
        old   = ev.previous,
        value = ev.current;

    // we only update our public field if it hasn't been changed
    if (Mock.areEqual(this[field], old)) {
        this[field] = Mock.copy(value);

        this.raiseEvent("changed", {
            target: this,
            detail: [[field]],

            previous: old,
            current:  value
        });

        if (this._exception) {
            this._exception[field] = Mock.copy(value);
            this._exception.commit();
        }
    }
};

EventOccurrence.prototype._onExceptionAdded = function(ev) {
    if (ev.start.getTime() === this._start.getTime()) {
        this._exception = ev.exception;
        this._exception.addListener("changed", this._onExceptionChanged, this);

        this._series.removeListener("exceptionAdded", this._onExceptionAdded, this);
    }
};

EventOccurrence.prototype._onExceptionChanged = function(ev) {
    var field = ev.detail[0][0],
        old   = ev.previous,
        value = ev.current;

    // we only update our public field if it hasn't been changed
    if (Mock.areEqual(this[field], old)) {
        this[field] = Mock.copy(value);

        this.raiseEvent("changed", {
            target: this,
            detail: [[field]],

            previous: old,
            current:  value
        });
    }
};

})();

