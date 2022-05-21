
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//


/*global  Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/
Jx.delayDefine(Mail, "IdleDetector", function () {
    "use strict";

    var ETWListener = function () {
        this._eventsToLookFor = [];
        this._origProfilerMark = window.msWriteProfilerMark;
        window.msWriteProfilerMark = this._writeProfilerMark.bind(this);
    };
    ETWListener.prototype = {
        addETWListener: function (str, handler, context) {
            this._eventsToLookFor.push({ str: str, handler: handler, context: context });
        },
        _writeProfilerMark: function (profileStr) {
            this._origProfilerMark.call(window, profileStr);
            for (var i = 0, iMax = this._eventsToLookFor.length; i < iMax; ++i) {
                if (profileStr === this._eventsToLookFor[i].str) {
                    var event = this._eventsToLookFor[i];
                    event.handler.call(event.context, profileStr);
                    break;
                }
            }
        },
        dispose: function () {
            window.msWriteProfilerMark = this._origProfilerMark;
        }
    };


    Mail.IdleTimerChecker = /* @constructor */ function () {
        this._originalSetTimeout = window.setTimeout;
        this._runningTimers = {};
        this._timerCount = 0;

        this._captureSetTimeout = this._captureSetTimeout.bind(this);
        window.setTimeout = this._captureSetTimeout;
    };

    Mail.IdleTimerChecker.prototype._captureSetTimeout = function (expression, timeout) {
        /// <param name="expression" type="Function" />
        /// <param name="timeout" type="Number" />
        var timerID = /*@static_cast(Number)*/ this._originalSetTimeout.call(window, expression, timeout);
        if (timeout < 60000) {
            // Ignoring timers greater than 1 minute as they are not good indicators of the application being "Busy"
            Jx.log.info("Setting timeout " + timerID.toString() + " for " + timeout.toString() + "ms");

            this._runningTimers[timerID] = Date.now() + timeout;
            idleDetector.resetIdleSecondsCount();
            ++this._timerCount;
            if (this._timerCount % 1000) {
                // Make sure we periodicly clear expired timers incase we are capturing them while idledetector is not running.
                this._clearExpiredTimers();
            }
        }

        return timerID;
    };

    Mail.IdleTimerChecker.prototype._clearExpiredTimers = function () {
        // Remove any expired counters and count the remainder
        var timersToDelete = [],
            remainingTimerCount = 0,
            now = Date.now(),
            i = 0;

        for (var prop in this._runningTimers) {
            if (this._runningTimers.hasOwnProperty(prop)) {
                if (this._runningTimers[prop] < now) {
                    timersToDelete.push(prop);
                } else {
                    ++remainingTimerCount;
                }
            }
        }
        // Expired timers are stored in an array and deleted after iteration of runningTimers is complete to avoid
        // changing the state of runningTimers while iterating it.
        var timersToDeleteCount = timersToDelete.length;
        for (; i < timersToDeleteCount; ++i) {
            delete this._runningTimers[timersToDelete[i]];
        }
        Debug.assert(remainingTimerCount === Object.keys(this._runningTimers).length);
        return remainingTimerCount;
    };

    Mail.IdleTimerChecker.prototype.isIdle = function () {
        var remainingTimerCount = this._clearExpiredTimers();
        if (remainingTimerCount !== 0) {
            Jx.log.warning(" Running timer count is " + remainingTimerCount.toString());
        }
        return remainingTimerCount === 0;
    };

    Mail.IdleAccountSyncChecker = function () {
    };
    Mail.IdleAccountSyncChecker.prototype.isIdle = function () {
        var syncingAccounts = 0,
            platformNamespace = Microsoft.WindowsLive.Platform,
            allAccounts = Mail.Globals.platform.accountManager.getConnectedAccountsByScenario(platformNamespace.ApplicationScenario.mail,
                                                                                              platformNamespace.ConnectedFilter.normal,
                                                                                              platformNamespace.AccountSort.name);
        for (var iAccount = 0, iMaxAccount = allAccounts.count; iAccount < iMaxAccount; ++iAccount ) {
            var mailResource = allAccounts.item(iAccount).getResourceByType(platformNamespace.ResourceType.mail),
                isSyncing = mailResource ? mailResource.isSynchronizing : false;
            if (isSyncing) {
                ++syncingAccounts;
            }
        }
        allAccounts.dispose();

        if (syncingAccounts) {
            Jx.log.warning(" Syncing " + syncingAccounts.toString() + " accounts.");
        }
        return syncingAccounts === 0;
    };

    Mail.IdleSchedulerChecker = function () {
        this._doingWork = Jx.scheduler.testGetJobCount() > 0;
        this._ETWListener = new ETWListener();
        this._ETWListener.addETWListener("WinJS.Scheduler:timeslice,StartTM", function () {
            Mail.log("IdleDetector: WinJS Working");
            this._doingWork = true;
        }.bind(this));
        this._ETWListener.addETWListener("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
            Mail.log("IdleDetector: WinJS Done");
            this._doingWork = false;
            idleDetector.resetIdleSecondsCount();
        }.bind(this));
    };

    Mail.IdleSchedulerChecker.prototype.isIdle = function () {
        if (this._doingWork) {
            Jx.log.warning(" WinJS Scheduler doing work ");
        }
        return !this._doingWork;

    };

    var idleDetector = window.Mail.IdleDetector = {};
    idleDetector.enable = function () {
        var scheduler = Jx.scheduler;
        var hasAppState = Jx.root && Jx.root.appStateReady();

        // If appState or scheduler do not exist yet, then try agian later.
        if (!hasAppState || Jx.isNullOrUndefined(scheduler)) {
            window.setTimeout(idleDetector.enable, 1000);
            return;
        }

        // If this is the first call, _checkers won't be initiailzed.
        // If it has been initialized, then just reset to detect agian.
        if (idleDetector._checkers.length > 0) {
            idleDetector._IdleFired = false;
            idleDetector._idleSecondsCount = 0;
            return;
        }

        // Checks for the following activites:
        //     Any running Timers
        //     Selected Folder Syncing
        //     Any Syncing Mail Accounts
        //     Scheduler has no tasks to perform
        idleDetector._checkers = [new Mail.IdleTimerChecker(), new Mail.IdleSchedulerChecker(), new Mail.IdleAccountSyncChecker()];
        window.setInterval(idleDetector._checkIsIdle, 1000);
    };

    idleDetector._idleSecondsCount = 0;
    idleDetector._successiveIdlesRequired = 3;
    idleDetector._IdleFired = false;
    idleDetector._iFramePendingCount = 0;
    idleDetector._checkers = [];
    idleDetector.alwaysOn = false;

    idleDetector.resetIdleSecondsCount = function () {
        idleDetector._idleSecondsCount = 0;
    };

    idleDetector._checkIsIdle = function () {
        var isIdle = true;
        for (var i = 0, iMax = idleDetector._checkers.length; i < iMax; ++i) {
            if (!idleDetector._checkers[i].isIdle()) {
                isIdle = false;
            }
        }
        if (isIdle) {
            ++idleDetector._idleSecondsCount;
            if (idleDetector._idleSecondsCount === idleDetector._successiveIdlesRequired) {
                if (!idleDetector._IdleFired || idleDetector.alwaysOn) {
                    Jx.log.warning("Application is Idle");
                    Mail.log("MailApplicationIdle", Mail.LogEvent.info);
                    idleDetector._IdleFired = true;
                }
            }
        } else {
            Jx.log.warning("Application is Busy");
            idleDetector.resetIdleSecondsCount();
        }

    };

});


