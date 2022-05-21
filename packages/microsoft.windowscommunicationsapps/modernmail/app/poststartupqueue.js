
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail, "PostStartupQueue", function () {
    "use strict";
    Mail.PostStartupQueue = function (/* optional */splashScreen) {
        /// <param name="splashScreen" type="Mail.SplashScreen" />
        Debug.assert(Jx.isNullOrUndefined(splashScreen) || Jx.isInstanceOf(splashScreen, Mail.SplashScreen));
        this._queue = [];
        this._work = this._work.bind(this);
        this._isRunning = false;
        this._finishedQueuing = false;
        this._pendingTimerId = null;
        Debug.assert((Jx.isNullOrUndefined(splashScreen) && Mail.GlomManager.isChild()) ||
                     (Jx.isInstanceOf(splashScreen, Mail.SplashScreen) && Mail.GlomManager.isParent()));
        if (splashScreen) {
            this._splashScreenDismissed = !splashScreen.isShown;
            this._splashScreen = splashScreen;

            if (!this._splashScreenDismissed) {
                splashScreen.addListener(Mail.SplashScreen.Events.dismissed, this.onSplashScreenDismissed, this);
            }
        } else {
            this._splashScreenDismissed = true;
        }
    };

    Mail.PostStartupQueue.waitBetweenJobs = 100;
    Mail.PostStartupQueue.initialWait = 150;

    Mail.PostStartupQueue.prototype.queue = function (description, func) {
        /// <param name="description" type="String"/>
        /// <param name="func" type="Function"/>
        Debug.assert(Jx.isNonEmptyString(description));
        Debug.assert(Jx.isFunction(func));
        Debug.assert(!this._finishedQueuing || this._isRunning);
        this._queue.push({ description: description, func: func });
    };

    Mail.PostStartupQueue.prototype.onSplashScreenDismissed = function () {
        this._splashScreen.removeListener(Mail.SplashScreen.Events.dismissed, this.onSplashScreenDismissed, this);
        this._splashScreenDismissed = true;
        this._start();
    };

    Mail.PostStartupQueue.prototype.finishedQueuing = function () {
        this._finishedQueuing = true;
        this._start();
    };

    Mail.PostStartupQueue.prototype._start = function () {
        if (this._splashScreenDismissed &&
                this._finishedQueuing &&
                !this._isRunning &&
                (this._queue.length > 0)) {
            this._isRunning = true;
            this._pendingTimerId = window.setTimeout(this._work, Mail.PostStartupQueue.initialWait);
        }
    };

    Mail.PostStartupQueue.prototype.dispose = function () {
        Jx.dispose(this._pendingJob);
        this._isRunning = false;
        this._queue = []; // Cancel all operations.
        if (Jx.isNumber(this._pendingTimerId)) {
            clearTimeout(this._pendingTimerId);
            this._pendingTimerId = null;
        }
    };

    Mail.PostStartupQueue.prototype._work = function () {
        Debug.assert(this._isRunning);
        Debug.assert(Jx.isNumber(this._pendingTimerId));
        this._pendingTimerId = null;

        if (this._isRunning) {
            var item = this._queue.shift();
            var description = item.description;
            var func = item.func;
            this._pendingJob = Jx.scheduler.addJob(null,
                Mail.Priority.postStartupWork,
                "Mail.PostStartupQueue._work - " + description,
                function () {
                    Jx.log.info("Mail.PostStartupQueue._work started: " + description);
                    func();
                    if (this._queue.length > 0) {
                        this._pendingTimerId = window.setTimeout(this._work, Mail.PostStartupQueue.waitBetweenJobs);
                    } else {
                        this._isRunning = false;
                        Jx.log.info("post startup queue emptied");
                    }
                },
                this
            );
        }
    };

});
