
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Debug,setImmediate*/

/// <disable>JS2005.UseShortFormInitializations</disable>
/// <disable>JS2021.SeparateBinaryOperatorArgumentsWithSpaces</disable>
/// <disable>JS2030.FollowKeywordsWithSpace</disable>
/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
/// <disable>JS3058.DeclareVariablesBeforeUse</disable>
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

(function() {

//
// Namespaces
//

var Mock = Calendar.Mock;

//
// FreeBusyRequest
//

var FreeBusyRequest = Mock.FreeBusyRequest = function(attendees) {
    this.status = 1;
    this.count  = attendees.length;

    this.results = [];

    this.results.count   = this.count;
    this.results.dispose = Jx.fnEmpty;
    this.results.item    = function(index) {
        return this[index];
    };

    for (var i = 0, len = this.count; i < len; i++) {
        var result = {
            attendee: attendees[i],
            status:   1,

            _index: i
        };

        Object.defineProperty(result, "freebusy", {
            get: function() {
                return FreeBusyRequest.results[this._index % FreeBusyRequest.results.length] || "";
            }
        });

        this.results.push(result);
    }
};

//
// Public
//

FreeBusyRequest.results = [];

// API

FreeBusyRequest.prototype.addEventListener = function(type, fn) {
    Debug.assert(type === "changed");
    setImmediate(fn);
};

FreeBusyRequest.prototype.removeEventListener = function(type) {
    Debug.assert(type === "changed");
};

FreeBusyRequest.prototype.dispose = Jx.fnEmpty;

})();

