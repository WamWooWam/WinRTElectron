
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="Job.ref.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "JobSet", function () {
    
    "use strict";

    var P = window.People,
        Priority = P.Priority;

    P.JobSet = /*@constructor*/function (realJobSet) {
        this._real = realJobSet;
    };
    P.JobSet.prototype.addUIJob = function (/* @dynamic*/uiObject, uiFunction, uiArguments, priority) {
        Jx.scheduler.addJob(this._real, priority, null, uiFunction, uiObject, uiArguments);
    };
    P.JobSet.prototype.cancelJobs = function () {
        this._real.cancelJobs();
    };
    P.JobSet.prototype.cancelAllChildJobs = function () {
        this._real.cancelJobs();
    };
    P.JobSet.prototype.setVisibility = function (isVisible) { 
        this._real.visible = isVisible;
    };
    Object.defineProperty(P.JobSet.prototype, "isVisible", { get: function () {
        return this._real.visible;
    }});
    P.JobSet.prototype.setOrder = function (order) { 
        this._real.order = order;
    };
    P.JobSet.prototype.createChild = function (jobSetName) {
        return new P.JobSet(Jx.scheduler.createJobSet(this._real));
    };
    P.JobSet.prototype.dispose = function () {
        Jx.dispose(this._real);
    };

});
