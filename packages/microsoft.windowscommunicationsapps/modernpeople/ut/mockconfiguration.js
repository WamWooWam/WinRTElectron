
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Platform\Configuration.js" />

People.RecentActivity.UnitTests.MockConfiguration = function() {
    /// <summary>
    ///     Configuration for unit test.
    /// </summary>
    /// <field name="_isOnline$1" type="Boolean"></field>
    People.RecentActivity.Platform.Configuration.call(this);
};

Jx.inherit(People.RecentActivity.UnitTests.MockConfiguration, People.RecentActivity.Platform.Configuration);


People.RecentActivity.UnitTests.MockConfiguration.prototype._isOnline$1 = false;

Object.defineProperty(People.RecentActivity.UnitTests.MockConfiguration.prototype, "isOnline", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the user is in online mode or not.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isOnline$1;
    },
    set: function(value) {
        this._isOnline$1 = value;
    },
    configurable: true
});