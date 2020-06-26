(function(n) {
    function t(n) {
        console.warn("Calendar:PlatformWorker." + n + ",StartTA,Calendar")
    }

    function i(n) {
        console.warn("Calendar:PlatformWorker." + n + ",StopTA,Calendar")
    }

    function u() {
        var r = Microsoft.WindowsLive.Platform,
            u = r.ClientCreateOptions;
        try {
            t("CreatePlatform");
            n._platform = new r.Client("calendarWorker", u.failIfNoUser | u.failIfUnverified);
            n._manager = n._platform.calendarManager;
            i("CreatePlatform")
        } catch (f) {
            console.warn("Calendar:PlatformWorker.CreatePlatform Error: " + f.number)
        }
        return n._platform
    }

    function f(t) {
        n._isRtl = t;
        r && (n._month._isRtl = t,
            n._week._isRtl = t,
            n._day._isRtl = t,
            n._freeBusy._isRtl = t,
            n._agenda._isRtl = t)
    }

    function e(t, i, u) {
        var e = u.calendarManager;
        n._month = new Calendar.Views.MonthWorker(t, i, e);
        n._week = new Calendar.Views.WeekWorker(t, i, e);
        n._day = new Calendar.Views.DayWorker(t, i, e);
        n._freeBusy = new Calendar.Views.FreeBusyWorker(t, i, u.accountManager, e);
        n._agenda = new Calendar.Views.AgendaWorker(t, i, e);
        r = true;
        n._isRtl && f(n._isRtl)
    }
    var o, r;
    n.Calendar = n.Calendar || {
        Helpers: {},
        Views: {}
    };
    t("ImportScripts");
    n.importScripts("/microsoft.windowscommunicationsapps/dist/shim.js", "Router.js", "/microsoft.windowscommunicationsapps/Jx/JxWorker.js", "../Scheduler/Scheduler.js", "../Helpers/Data.js", "../Month/Worker.js", "../Week/Worker.js", "../Day/Worker.js", "../FreeBusy/Worker.js", "../Agenda/AgendaHelpers.js", "../Agenda/AgendaWorker.js");
    i("ImportScripts");
    t("createAppData");
    o = Windows.Storage.ApplicationData.current.localSettings;
    i("createAppData");
    Jx.startSession();
    u();
    n._router = new Calendar.Router;
    n._router.initialize(n);
    n._scheduler = new Calendar.Scheduler(100);
    r = false;
    n._platform ? e(n._router, n._scheduler, n._platform) : n._router.route("Worker/restartPlatform", function() {
        u() && e(n._router, n._scheduler, n._platform)
    });
    n._router.route("Worker/DOMContentLoaded", function(n) {
        f(n.data.isRtl)
    })
})(this)