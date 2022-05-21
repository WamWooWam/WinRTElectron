
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar*/

var MockAccountManager = function() {
};

MockAccountManager.prototype.loadAccount = function(id) {
    return {
        id: id
    };
};

var MockPlatformWorker = function(platform) {
    this._platform = platform;

    // initialize members
    this._listeners    = [];
    this._workerGlobal = new MockWorkerGlobal(this);

    // create and initialize the router
    this._router = new Calendar.Router();
    this._router.initialize(this._workerGlobal);

    // create our scheduler
    this._scheduler = new Calendar.Scheduler();

    // initialize our view code
    this._month    = new Calendar.Views.MonthWorker(this._router,    this._scheduler, platform.calendarManager);
    this._week     = new Calendar.Views.WeekWorker(this._router,     this._scheduler, platform.calendarManager);
    this._day      = new Calendar.Views.DayWorker(this._router,      this._scheduler, platform.calendarManager);
    this._freebusy = new Calendar.Views.FreeBusyWorker(this._router, this._scheduler, new MockAccountManager(), platform.calendarManager);
    this._agenda   = new Calendar.Views.AgendaWorker(this._router,   this._scheduler, platform.calendarManager);
};

MockPlatformWorker.prototype.dispose = function() {
    this._freebusy.dispose();
    this._day.dispose();
    this._week.dispose();
    this._month.dispose();
    this._agenda.dispose();

    this._freebusy = null;
    this._day      = null;
    this._week     = null;
    this._month    = null;
    this._agenda   = null;

    this._scheduler.reset();
    this._router.dispose();
    this._workerGlobal.dispose();

    this._scheduler    = null;
    this._router       = null;
    this._workerGlobal = null;
    this._listeners    = null;
    this._platform     = null;
};

MockPlatformWorker.prototype.postMessage = function(data) {
    this._workerGlobal.sendMessage({ data: data });
};

MockPlatformWorker.prototype.sendMessage = function(data) {
    this._listeners.forEach(function(listener) {
        listener(data);
    });
};

MockPlatformWorker.prototype.addEventListener = function(name, callback) {
    this._listeners.push(callback);
};

MockPlatformWorker.prototype.removeEventListener = function(name, callback) {
    var index = this._listeners.indexOf(callback);

    if (index !== -1) {
        this._listeners.splice(index, 1);
    }
};

var MockWorkerGlobal = function(worker) {
    this._worker = worker;

    // initialize members
    this._listeners = [];
};

MockWorkerGlobal.prototype.dispose = function() {
    this._listeners = null;
    this._worker    = null;
};

MockWorkerGlobal.prototype.postMessage = function(data) {
    this._worker.sendMessage({ data: data });
};

MockWorkerGlobal.prototype.sendMessage = function(data) {
    this._listeners.forEach(function(listener) {
        listener(data);
    });
};

MockWorkerGlobal.prototype.addEventListener = function(name, callback) {
    this._listeners.push(callback);
};

MockWorkerGlobal.prototype.removeEventListener = function(name, callback) {
    var index = this._listeners.indexOf(callback);

    if (index !== -1) {
        this._listeners.splice(index, 1);
    }
};

