
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="MockLogEntry.js" />

People.RecentActivity.UnitTests.MockLog = function() {
    /// <summary>
    ///     Provides a logger for unit tests.
    /// </summary>
    /// <field name="_entries" type="Array" static="true">A list of entries.</field>
};


People.RecentActivity.UnitTests.MockLog._entries = [];

People.RecentActivity.UnitTests.MockLog.reset = function() {
    /// <summary>
    ///     Resets the log.
    /// </summary>
    People.RecentActivity.UnitTests.MockLog._entries.length = 0;
};

People.RecentActivity.UnitTests.MockLog.add = function(name, parameters) {
    /// <summary>
    ///     Adds an entry.
    /// </summary>
    /// <param name="name" type="String"></param>
    /// <param name="parameters" type="Array" elementType="Object"></param>
    People.RecentActivity.UnitTests.MockLog._entries.push(People.RecentActivity.UnitTests.create_mockLogEntry(name, parameters));
};

People.RecentActivity.UnitTests.MockLog.get = function(index) {
    /// <summary>
    ///     Gets a log entry.
    /// </summary>
    /// <param name="index" type="Number" integer="true"></param>
    /// <returns type="People.RecentActivity.UnitTests.mockLogEntry"></returns>
    return People.RecentActivity.UnitTests.MockLog._entries[index];
};

People.RecentActivity.UnitTests.MockLog.getCount = function() {
    /// <summary>
    ///     Gets the number of entries in the log.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return People.RecentActivity.UnitTests.MockLog._entries.length;
};