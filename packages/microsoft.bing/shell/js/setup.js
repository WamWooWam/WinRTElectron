/// <reference path='../../common/js/tracing.js' />
(function () {
    "use strict";

    // setup trace listeners
    if (window.msWriteProfilerMark) {
        BingApp.addTraceListener(new BingApp.Classes.EtwTraceListener());
    }

    if (console && console.log) {
        BingApp.addTraceListener(new BingApp.Classes.ConsoleTraceListener());
    }

    // TODO:    read configuration file and set up trace level
    var filter = BingApp.getTraceFilter();
    filter[BingApp.TraceCategories.error] = true;
    filter[BingApp.TraceCategories.warning] = true;
    filter[BingApp.TraceCategories.perf] = true;
    filter[BingApp.TraceCategories.info] = true;
    filter[BingApp.TraceCategories.verbose] = true;
    BingApp.setTraceFilter(filter);
})();
