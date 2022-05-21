
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\Jx\Core\Jx.dep.js" />
/// <reference path="Namespaces.js" />

(function () {
    "use strict";

    Mail.log = Mail.writeProfilerMark = function (eventName, eventType) {
        /// <param name="eventName" type="String">arbitrary log message</param>
        /// <param name="eventType" type="Mail.LogEvent" optional="true">enum for start/stop/info/etc.</param>
        /// <param name="logLevel" type="Number" optional="true">Log level - info is the default assumption</param>
        Jx.mark(eventName + (eventType || ""));
    };

    // See http://sharepoint/sites/IE/Resources/wiki/Wiki%20Pages/Perf_IEVis%20Nested%20Events.aspx
    Mail.LogEvent = {
        start: ",StartTM,Mail",
        stop: ",StopTM,Mail"
    };

    
    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
    Debug.assert(!Jx.isObject(Debug.Mail));
    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    Debug.Mail = {
        writeProfilerMark: function (text, eventType) {
            /// <param name="text" type="String">text string to log</param>
            /// <param name="eventType" type="Mail.LogEvent" optional="true">enum for start/stop/info/etc.</param>
            Mail.writeProfilerMark("DEBUG: " + text, eventType);
        },
        logWithCallStack: function (text) {
            Mail.writeProfilerMark(text + "\r\n" + Debug.callstack());
        }
    };
    Debug.Mail.log = Debug.Mail.writeProfilerMark;
    


}());
