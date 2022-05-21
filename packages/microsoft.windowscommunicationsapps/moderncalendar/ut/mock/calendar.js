
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Debug*/

// JSCop doesn't like aligning equal signs between lines
/// <disable>JS2021.SeparateBinaryOperatorArgumentsWithSpaces</disable>

// JSCop doesn't like "var fn = function() {};"
/// <disable>JS2030.FollowKeywordsWithSpace</disable>

// JSCop wants us to camel-case our namespaces and classes
/// <disable>JS2076.IdentifierIsMiscased</disable>

// JSCop doesn't like us creating a local alias for Mock.Calendar
/// <disable>JS3056.DeclareVariablesOnceOnly</disable>

// JSCop doesn't like implicit number to string conversions
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>

// JSCop doesn't understand Jx.augment
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

(function() {

//
// Namespaces
//

var Mock = this.Calendar.Mock;

//
// Calendar
//

var Calendar = Mock.Calendar = function(account) {
    this.instance  = [];
    this.recurring = [];
    this.id = ++Calendar.lastId;

    this.color = Calendar.COLORS.shift();
    this.name  = "Calendar " + this.id;
    Calendar.COLORS.push(this.color);

    if (account) {
        this.account = account;
    } else {
        this.account = {
            objectId: ++Calendar.lastId,
            emailAddress: "fake@fake.com"
        };
    }
};

Jx.augment(Calendar, Jx.Events);

Debug.Events.define(Calendar.prototype, "eventAdded", "eventRemoved");

//
// Static
//

Calendar.COLORS = [
    229797,  // blue
    6530102, // green
    10683139 // red
];

Calendar.lastId = 0;

//
// Public
//

Calendar.prototype.dispose = function() {
    var instance  = this.instance,
        recurring = this.recurring;

    this.instance  = null;
    this.recurring = null;

    this._disposeEvents(instance);
    this._disposeEvents(recurring);

    this.disposeEvents();
};

Calendar.prototype.createEvent = function() {
    // create the event
    var ev = new Mock.Event(this);

    // listen for commits on the event
    ev.addListener("commit", this._onEventCommit, this);

    return ev;
};

Calendar.prototype.getEvents = function(start, end) {
    // create the collection
    var events = new Mock.EventCollection(start, end);

    // add ourself as the only event source
    events.addEventSource(this);

    return events;
};

Calendar.prototype.getEventFromID = function(id) {
    // our ids are ints
    id = parseInt(id, 10);

    // try find it in both of our lists
    return this._findEvent(this.instance,  id) ||
           this._findEvent(this.recurring, id) ||
           null;
};

Calendar.prototype.getEventFromHandle = function(handle) {
    var parts = handle.split("."),
        id    = parts[0],
        date  = parts[1],
        ev    = this.getEventFromID(id);

    if (ev && date) {
        ev = ev.getOccurrence(new Date(date));
    }

    return ev;
};

//
// Private
//

// Helpers

Calendar.prototype._findEvent = function(array, id) {
    for (var i = 0, len = array.length; i < len; i++) {
        var ev = array[i];

        if (ev.id === id) {
            return new Mock.EventInstance(ev);
        }
    }

    return null;
};

Calendar.prototype._disposeEvents = function(events) {
    for (var i = 0, len = events.length; i < len; i++) {
        var ev = events[i];

        this.raiseEvent("eventRemoved", ev);
        ev.dispose();
    }
};

// Events

Calendar.prototype._onEventCommit = function(ev) {
    var instance  = this.instance.indexOf(ev),
        recurring = this.recurring.indexOf(ev);

    if (ev.recurring) {
        if (instance !== -1) {
            this.instance.splice(instance, 1);
            this.raiseEvent("eventRemoved", ev);
        }

        if (recurring === -1) {
            this.recurring.push(ev);
            this.raiseEvent("eventAdded", ev);
        }
    } else {
        if (recurring !== -1) {
            this.recurring.splice(recurring, 1);
            this.raiseEvent("eventRemoved", ev);
        }

        if (instance === -1) {
            this.instance.push(ev);
            this.instance.sort(Mock.eventComparer);
            this.raiseEvent("eventAdded", ev);
        }
    }
};

})();

