
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UnitTests.create_mockLogEntry = function(name, parameters) {
    var o = { };
    if (parameters == null) {
        parameters = new Array(0);
    }

    o.name = name;
    o.parameters = parameters;
    return o;
};