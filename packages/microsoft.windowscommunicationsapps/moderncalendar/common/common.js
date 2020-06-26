var Calendar = {
    Commands: {},
    Controls: {},
    Helpers: {},
    Templates: {},
    Views: {}
};
(function() {
    window.addEventListener("error", function(n) {
        msWriteProfilerMark("Unhandled exception: " + n.message + "\n file: " + n.filename + "\n line: " + n.lineno + "\n column: " + n.colno);
        Jx && Jx.app && Jx.app.shutdownLog()
    }, false);
    Calendar.scenario = 0;
    Calendar.FIRST_DAY = new Date("1/1/1900");
    Calendar.LAST_DAY = new Date("12/31/2100");
    var i = Windows.Globalization,
        t = new i.Calendar(i.ApplicationLanguages.languages),
        n;
    t.setToMin();
    n = t.getDateTime();
    Calendar.FIRST_DAY < n && Calendar.FIRST_DAY.setFullYear(n.getFullYear() + 1);
    t.setToMax();
    n = t.getDateTime();
    n < Calendar.LAST_DAY && Calendar.LAST_DAY.setFullYear(n.getFullYear() - 1);
    Jx.mix(Calendar, Jx.Events);
    Calendar._sendDayChangedEvent = function() {
        var n = new Date,
            t = n.getFullYear(),
            i = n.getMonth(),
            r = n.getDate(),
            u = new Date(t, i, r),
            f = new Date(t, i, r + 1);
        Calendar._today = u;
        Calendar.raiseEvent("dayChanged", new Date(u));
        setTimeout(Calendar._sendDayChangedEvent, f - n)
    };
    Calendar.getToday = function() {
        return new Date(Calendar._today)
    };
    Calendar._sendDayChangedEvent();
    Calendar._sendMinuteChangedEvent = function() {
        var n = new Date,
            t = n.getFullYear(),
            i = n.getMonth(),
            r = n.getDate(),
            u = n.getHours(),
            f = n.getMinutes(),
            e = new Date(t, i, r, u, f),
            o = new Date(t, i, r, u, f + 1);
        Calendar._minute = e;
        Calendar.raiseEvent("minuteChanged", new Date(e));
        setTimeout(Calendar._sendMinuteChangedEvent, o - n)
    };
    Calendar.getMinute = function() {
        return new Date(Calendar._minute)
    };
    Calendar._sendMinuteChangedEvent();
    Calendar.Loc = Jx.res;
    Calendar.DAYS_PER_WEEK = 7;
    Calendar.MONTHS_PER_YEAR = 12;
    Calendar.DEFAULT_EVENT_REMINDER = 15;
    Calendar.DEFAULT_ALLDAY_EVENT_REMINDER = 1080;
    Calendar.DAYS_IN_WEEKEND = parseInt(Calendar.Loc.getString("DaysInWeekend"), 10);
    Calendar.MailAction = {
        forward: "forward",
        reply: "reply",
        replyAll: "replyAll",
        accept: "accept",
        tentative: "tentative",
        decline: "decline",
        cancel: "cancel"
    };
    Calendar.companionWidth = 546;
    Calendar.onDomContentLoaded = function() {
        Jx.mark("Calendar:DOMContentLoaded,StartTA,Calendar");
        Jx.Dep.collect();
        Jx.isRtl() && document.body.classList.add("cal-rtl");
        Jx.app = new Jx.Application(Jx.AppId.calendar, true);
        Jx.root = new Calendar.App(document.getElementById("calendar"), window._platformWorker);
        Jx.root.initialize();
        window._platformWorker = null;
        Jx.mark("Calendar:DOMContentLoaded,StopTA,Calendar")
    };
    Jx.Dep.name("CalDP", ["/moderncalendar/views/scheduler/scheduler.js", "/moderncalendar/views/timeline/timeline.js", "/moderncalendar/views/grid/MonthGrid.js", "/moderncalendar/views/grid/YearGrid.js", "/moderncalendar/views/datepicker/datepicker.js", "/moderncalendar/views/timeline/timeline.css", "/moderncalendar/views/datepicker/datepicker.css", ]);
    Jx.Dep.name("CalED", ["/moderncalendar/views/eventDetails/eventDetails.js", "/moderncalendar/views/eventDetails/eventDetails.css", "/moderncalendar/views/eventDetails/eventDetailsAnimations.css", "CalSel", "CalCanvas", "CalAW", "CalDP", ]);
    Jx.Dep.name("CalSel", ["/moderncalendar/views/eventDetails/calendarSelector.js", "/moderncalendar/views/eventDetails/calendarSelector.css", ]);
    Jx.Dep.name("CalCanvas", ["/modernCanvas/MCanvas.js", "/modernCanvas/AutoReplaceDefinitionsDefault.js", "/modernCanvas/ModernCanvasPlugins.js", ]);
    Jx.Dep.name("CalAW", ["/modernaddresswell/AddressWell.js", "/resources/ModernAddressWell/css/AddressWell.css", "/resources/ModernAddressWell/css/CalendarAddressWellColor.css", ])
})()