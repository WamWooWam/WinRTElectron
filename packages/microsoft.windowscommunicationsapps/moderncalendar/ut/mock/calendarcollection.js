
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Debug*/

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

var Mock = Calendar.Mock;

//
// CalendarCollection
//

var CalendarCollection = Mock.CalendarCollection = function(source) {
    this._source    = source;
    this._calendars = source.calendars.slice();

    source.addListener("calendarAdded",   this._onCalendarAdded,   this);
    source.addListener("calendarRemoved", this._onCalendarRemoved, this);
};

Jx.augment(CalendarCollection, Jx.Events);

Debug.Events.define(CalendarCollection.prototype, "collectionchanged");

//
// Public
//

// Collection

Object.defineProperty(CalendarCollection.prototype, "count", {
    get: function() {
        return this._calendars.length;
    }
});

CalendarCollection.prototype.item = function(index) {
    return this._calendars[index];
};

CalendarCollection.prototype.lock   = Jx.fnEmpty;
CalendarCollection.prototype.unlock = Jx.fnEmpty;

CalendarCollection.prototype.addEventListener    = CalendarCollection.prototype.addListener;
CalendarCollection.prototype.removeEventListener = CalendarCollection.prototype.removeListener;

CalendarCollection.prototype.dispose = function() {
    // clear out calendars
    var calendars = this._calendars;
    this._calendars = null;

    for (var i = 0, len = calendars.length; i < len; i++) {
        calendars[i].dispose();
    }

    // stop listening for events
    this._source.removeListener("calendarAdded",   this._onCalendarAdded,   this);
    this._source.removeListener("calendarRemoved", this._onCalendarRemoved, this);
    this._source = null;

    // stop firing events
    this.disposeEvents();
};

//
// Private
//

// Events

CalendarCollection.prototype._onCalendarAdded = function(calendar) {
    if (this._calendars.indexOf(calendar) === -1) {
        this._calendars.push(calendar);
        this.raiseEvent("collectionchanged");
    }
};

CalendarCollection.prototype._onCalendarRemoved = function(calendar) {
    var index = this._calendars.indexOf(calendar);

    if (index !== -1) {
        this._calendars.splice(index, 1);
        this.raiseEvent("collectionchanged");
    }
};

})();

