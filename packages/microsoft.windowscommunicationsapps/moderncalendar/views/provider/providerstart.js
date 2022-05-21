
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/

/*global Calendar,Debug,Jx*/

// This file bootstraps the provider page, setting it up to launch once the DOMContentLoaded event has fired.

document.addEventListener("DOMContentLoaded", function () {
    Jx.mark("CalendarProvider.DOMContentLoaded,StartTA,Calendar");

    Debug.assert(Jx.isObject(document.getElementById("providerRoot")), "Unexpected: providerRoot is not defined after DOMContentLoaded event");

    Jx.app  = new Jx.Application(Jx.AppId.calendar, true);
    Jx.root = new Calendar.ProviderPage();

    Jx.mark("CalendarProvider.DOMContentLoaded,StopTA,Calendar");
}, false);