
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Debug*/

/// <disable>JS2005.UseShortFormInitializations</disable>
/// <disable>JS2017.AlwaysUseBracesForControlStatementBody</disable>
/// <disable>JS3053.IncorrectNumberOfArguments</disable>
/// <disable>JS2021.SeparateBinaryOperatorArgumentsWithSpaces</disable>
/// <disable>JS2030.FollowKeywordsWithSpace</disable>
/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <disable>JS3056.DeclareVariablesOnceOnly</disable>
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
/// <disable>JS3058.DeclareVariablesBeforeUse</disable>
/// <disable>JS3083.DoNotOverrideBuiltInFunctions</disable>
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

(function() {

//
// Router
//

var Router = Calendar.Router = function() {
    // init variables
    this._source = null;
    this._routes = {};

    // bind callbacks
    this._onMessage = this._onMessage.bind(this);
};

//
// Static
//

Router.delimiter = "/";

//
// Public
//

Router.prototype.route = function(route, fn, ctx) {
    var parts   = route.split(Router.delimiter);
    this._route(parts, fn, ctx);
};

Router.prototype.dispatch = function(route, data) {
    var parts = route.split(Router.delimiter);
    this._dispatch(parts, data);
};

Router.prototype.initialize = function(source) {
    Debug.assert(!this._source);

    this._source = source;
    this._source.addEventListener("message", this._onMessage);
};

Router.prototype.postMessage = function(data) {
    this._source.postMessage(data);
};

Router.prototype.dispose = function() {
    Debug.assert(this._source);

    this._source.removeEventListener("message", this._onMessage);
    this._source = null;
};

//
// Private
//

Router.prototype._route = function(parts, fn, ctx) {
    var current = this._routes;

    while (1 < parts.length) {
        var part = parts.shift(),
            to   = current[part];

        if (!to) {
            current = current[part] = {};
        } else {
            current = to;
        }
    }

    current[parts.shift()] = { fn: fn, ctx: ctx };
};

Router.prototype._dispatch = function(parts, data) {
    var current = this._routes;

    while (parts.length && current) {
        current = current[parts.shift()];
    }

    if (current) {
        current.fn.call(current.ctx, data);
    }
};

Router.prototype._onMessage = function(ev) {
    var data  = ev.data,
        parts = data.name.split(Router.delimiter);
    this._dispatch(parts, data);
};

})();

