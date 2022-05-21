
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
// EventInstance
//

var EventInstance = Mock.EventInstance = function(ev) {
    // cache our backing event
    this._ev = ev;

    // create a local cache of the event's values
    for (var i = 0, len = Event.FIELDS.length; i < len; i++) {
        var field = Event.FIELDS[i],
            value = Mock.copy(this._ev[field]);

        this[field] = value;
    }

    // the calendar won't change, so just reference it directly
    this.calendar = ev.calendar;

    // listen for changes on it
    this._ev.addListener("changed", this._onEventChanged, this);
};

Jx.augment(EventInstance, Jx.Events);

Debug.Events.define(EventInstance.prototype, "changed");

//
// Public
//

// Methods

EventInstance.prototype.dispose = function() {
    this._ev.removeListener("changed", this._onEventChanged, this);
    this._ev = null;

    this.disposeEvents();
};

EventInstance.prototype.commit = function() {
    for (var i = 0, len = Event.FIELDS.length; i < len; i++) {
        var field = Event.FIELDS[i],
            old   = this._ev[field],
            value = this[field];

        if (!Mock.areEqual(value, old)) {
            this._ev[field] = value;

            this.raiseEvent("changed", {
                target: this,
                detail: [[field]],

                previous: old,
                current:  value
            });
        }
    }

    this._ev.commit();
};

EventInstance.prototype.addEventListener    = EventInstance.prototype.addListener;
EventInstance.prototype.removeEventListener = EventInstance.prototype.removeListener;

//
// Private
//

EventInstance.prototype._onEventChanged = function(ev) {
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

