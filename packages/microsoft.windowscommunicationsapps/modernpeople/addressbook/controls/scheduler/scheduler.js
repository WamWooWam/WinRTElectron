
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../../Shared/Jx/Core/Jx.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="JobSet.js"/>

Jx.delayDefine(People, [ "Scheduler", "SchedulerVisibility" ], function () {

    "use strict";
    var P = window.People;

    var Scheduler = P.Scheduler = function () { 
    };
    Scheduler.prototype.getJobSet = function () {
        return new P.JobSet(null);
    };
    Scheduler.prototype.runVisibleJobsUntil = function (pri) {
        Jx.scheduler.runSynchronous(pri);
    };
    Scheduler.prototype.setVisibleOnly = function (untilPriority) {
    };

    var SchedulerVisibility = P.SchedulerVisibility = function () {
        document.addEventListener("visibilitychange", this._onVisibilityChange.bind(this), false);
    };
    SchedulerVisibility.prototype._onVisibilityChange = function () {
        if (document.visibilityState === "hidden") {
            Jx.scheduler.pause();
        } else {
            Jx.scheduler.resume();
        }
    };

});
