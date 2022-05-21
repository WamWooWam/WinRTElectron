
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// JSCop doesn't like "new Array(length)", but it's faster
/// <disable>JS2005.UseShortFormInitializations</disable>

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

/*global Calendar,Event*/

(function() {

//
// Namespaces
//

var Mock = Calendar.Mock = {};

//
// Helpers
//

Mock.eventComparer = function(a, b) {
    var result = a.startDate.getTime() - b.startDate.getTime();

    if (!result) {
        result = b.busyStatus - a.busyStatus;

        if (!result) {
            result = b.endDate.getTime() - a.endDate.getTime();
        }
    }

    return result;
};


Mock.areEqual = function(a, b) {
    var typeA = typeof a,
        typeB = typeof b;

    if (typeA === typeB) {
        if (typeA === "object") {
            a = JSON.stringify(a);
            b = JSON.stringify(b);
        }

        return a === b;
    }

    return false;
};

Mock.copy = function(obj) {
    var ret = obj;

    if (Array.isArray(obj)) {
        ret = new Array(obj.length);

        for (var i = 0, len = obj.length; i < len; i++) {
            ret[i] = Event.copy(obj[i]);
        }
    } else if (typeof obj === "object") {
        if (obj instanceof Date) {
            ret = new Date(obj.getTime());
        } else {
            ret = {};

            for (var prop in obj) {
                ret[prop] = Mock.copy(obj[prop]);
            }
        }
    }

    return ret;
};

})();

