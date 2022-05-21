
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\Jx\Core\Jx.dep.js" />

/*jshint browser:true*/
/*global Windows,Microsoft,Debug,Jx,msWriteProfilerMark*/

var Calendar = {
    Commands:  {},
    Controls:  {},
    Helpers:   {},
    Templates: {},
    Views:     {}
};

(function() {

// function _start(evt) { Jx.mark("Calendar:Common." + evt + ",StartTA,Calendar"); }
// function _stop(evt)  { Jx.mark("Calendar:Common." + evt + ",StopTA,Calendar");  }

// Flush the ETW logs on app errors
window.addEventListener("error", function (ev) {
    msWriteProfilerMark("Unhandled exception: " + ev.message + "\n file: " + ev.filename + "\n line: " + ev.lineno + "\n column: " + ev.colno);
    if (Jx && Jx.app) {
        Jx.app.shutdownLog();
    }
}, false);

// For perf reasons avoid the WinRT calls in FRE builds
Calendar.scenario = 0;
Debug.assert(Calendar.scenario === Microsoft.WindowsLive.Platform.ApplicationScenario.calendar);

Calendar.FIRST_DAY = new Date("1/1/1900");
Calendar.LAST_DAY  = new Date("12/31/2100");

var Globalization = Windows.Globalization,
    calendar      = new Globalization.Calendar(Globalization.ApplicationLanguages.languages),
    datetime;

// calculate the min day of the user's calendar
calendar.setToMin();
datetime = calendar.getDateTime();

if (Calendar.FIRST_DAY < datetime) {
    Calendar.FIRST_DAY.setFullYear(datetime.getFullYear() + 1);
}

// calculate the max day of the user's calendar
calendar.setToMax();
datetime = calendar.getDateTime();

if (datetime < Calendar.LAST_DAY) {
    Calendar.LAST_DAY.setFullYear(datetime.getFullYear() - 1);
}

//
// Day Changes
//

Jx.mix(Calendar, Jx.Events);
Debug.Events.define(Calendar, "dayChanged");
Debug.Events.define(Calendar, "minuteChanged");

Calendar._sendDayChangedEvent = function() {
    var now   = new Date(),
        year  = now.getFullYear(),
        month = now.getMonth(),
        date  = now.getDate();

    var today    = new Date(year, month, date),
        midnight = new Date(year, month, date + 1);

    Calendar._today = today;
    Calendar.raiseEvent("dayChanged", new Date(today));

    setTimeout(Calendar._sendDayChangedEvent, midnight - now);
};

Calendar.getToday = function() {
    return new Date(Calendar._today);
};

Calendar._sendDayChangedEvent();

//
// Minute Changes
//

Calendar._sendMinuteChangedEvent = function () {
    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth(),
        date = now.getDate(),
        hours = now.getHours(),
        minutes = now.getMinutes();

    var minute = new Date(year, month, date, hours, minutes);
    var next = new Date(year, month, date, hours, minutes + 1);

    Calendar._minute = minute;
    Calendar.raiseEvent("minuteChanged", new Date(minute));

    setTimeout(Calendar._sendMinuteChangedEvent, next - now);
};

Calendar.getMinute = function() {
    return new Date(Calendar._minute);
};

Calendar._sendMinuteChangedEvent();

//
// Localized
//

Calendar.Loc = Jx.res;

Calendar.DAYS_PER_WEEK   = 7;
Calendar.MONTHS_PER_YEAR = 12;
Calendar.DEFAULT_EVENT_REMINDER = 15;
Calendar.DEFAULT_ALLDAY_EVENT_REMINDER = 1080; // is 18 hours
Calendar.DAYS_IN_WEEKEND = parseInt(Calendar.Loc.getString("DaysInWeekend"), 10);

// Various actions we can take on an event that involve sending mail
Calendar.MailAction = {
    forward:    "forward",
    reply:      "reply",
    replyAll:   "replyAll",
    accept:     "accept",
    tentative:  "tentative",
    decline:    "decline",
    cancel:     "cancel"
};

// Cliffs
Calendar.companionWidth = 546; // px

    Calendar.onDomContentLoaded = function() {
        Jx.mark("Calendar:DOMContentLoaded,StartTA,Calendar");

        Jx.Dep.collect();

        if (Jx.isRtl()) {
            document.body.classList.add("cal-rtl");
        }

        Jx.app  = new Jx.Application(Jx.AppId.calendar, true);
        Jx.root = new Calendar.App(document.getElementById("calendar"), window._platformWorker);
        // Jx.root.initialize may create views that require Jx.root to be defined which is why it is 
        // called here instead of in the Calendar.App constructor.
        Jx.root.initialize();

        window._platformWorker = null;

        Jx.mark("Calendar:DOMContentLoaded,StopTA,Calendar");
    };

    Jx.Dep.name("CalDP", [
        // TODO delay load DatePicker in event details.
        "/ModernCalendar/views/scheduler/scheduler.js",
        "/ModernCalendar/views/timeline/timeline.js",
        "/ModernCalendar/views/grid/MonthGrid.js",
        "/ModernCalendar/views/grid/YearGrid.js",
        "/ModernCalendar/views/datepicker/datepicker.js",
        "/moderncalendar/views/timeline/timeline.css",
        "/moderncalendar/views/datepicker/datepicker.css",
    ]);
    
    Jx.Dep.name("CalED", [
        "/ModernCalendar/views/eventDetails/eventDetails.js",
        "/ModernCalendar/views/eventDetails/eventDetails.css",
        "/ModernCalendar/views/eventDetails/eventDetailsAnimations.css",
        "CalSel",
        "CalCanvas",
        "CalAW",
        "CalDP",
    ]);

    Jx.Dep.name("CalSel", [
        "/ModernCalendar/views/eventDetails/calendarSelector.js",
        "/ModernCalendar/views/eventDetails/calendarSelector.css",
    ]);

    Jx.Dep.name("CalCanvas", [
        "/ModernCanvas/MCanvas.js",
        "/ModernCanvas/AutoReplaceDefinitionsDefault.js",
        "/ModernCanvas/ModernCanvasPlugins.js",
    ]);

    Jx.Dep.name("CalAW", [
        "/ModernAddressWell/AddressWell.js",
        "/resources/ModernAddressWell/css/AddressWell.css",
        "/resources/ModernAddressWell/css/CalendarAddressWellColor.css",
    ]);

})();
