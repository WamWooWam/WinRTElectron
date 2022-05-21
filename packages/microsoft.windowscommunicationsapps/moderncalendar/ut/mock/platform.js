
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar*/

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
// Platform
//

var Platform = Mock.Platform = function () {
    this.accountManager = new Mock.AccountManager();
    this.calendarManager = new Mock.CalendarManager(this.accountManager);
};

Platform.prototype.requestDelayedResources = function () {
};

})();

