
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar*/

/// <disable>JS2005.UseShortFormInitializations</disable>
/// <disable>JS2017.AlwaysUseBracesForControlStatementBody</disable>
/// <disable>JS3053.IncorrectNumberOfArguments</disable>
/// <disable>JS2021.SeparateBinaryOperatorArgumentsWithSpaces</disable>
/// <disable>JS2030.FollowKeywordsWithSpace</disable>
/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <disable>JS3056.DeclareVariablesOnceOnly</disable>
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
/// <disable>JS3083.DoNotOverrideBuiltInFunctions</disable>
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

(function() {

//
// WorkerEx
//

var WorkerEx = Calendar.WorkerEx = function(worker) {
    // save params
    this._worker = worker;

    // init params
    this._nextId    = 1;
    this._listeners = {};

    // bind callbacks
    this._onMessage = this._onMessage.bind(this);

    // hook the actual worker
    this._worker.addEventListener("message", this._onMessage);
};

//
// Public
//

WorkerEx.prototype.postCommand = function(name, data, id) {
    id = id || this._nextId++;

    this._worker.postMessage({
        name: name,
        id:   id,
        data: data
    });

    return id;
};

WorkerEx.prototype.dispose = function() {
    this._listeners = {};

    this._worker.removeEventListener("message", this._onMessage);
    this._worker = null;
};

// Listeners

WorkerEx.prototype.addListener = function(name, fn, ctx) {
    var listeners = this._listeners[name] || (this._listeners[name] = []);
    listeners.push({ fn: fn, ctx: ctx });
};

WorkerEx.prototype.removeListener = function(name, fn, ctx) {
    var listeners = this._listeners[name];

    if (listeners) {
        for (var i = 0, len = listeners.length; i < len; i++) {
            var listener = listeners[i];

            if (listener.fn === fn && listener.ctx === ctx) {
                listeners.splice(i, 1);
                break;
            }
        }
    }
};

//
// Private
//

// Events

WorkerEx.prototype._onMessage = function(ev) {
    var data      = ev.data,
        command   = data.command,
        listeners = this._listeners[command];

    if (listeners) {
        listeners = listeners.slice();

        for (var i = 0, len = listeners.length; i < len; i++) {
            var listener = listeners[i];
            listener.fn.call(listener.ctx, data);
        }
    }
};

})();

