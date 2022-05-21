
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft,Windows*/

Jx.delayDefine(Mail, "SuspendResumeHelper", function () {
    "use strict";

    Mail.SuspendResumeHelper = /*@constructor*/ function (platform, appState) {
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"></param>
        /// <param name="appState" type="Mail.AppState"></param>
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isInstanceOf(appState, Mail.AppState));
        this._platform = platform;
        this._appState = appState;
        this._lastTelemetryReport = 0;
        this._telemetryJob = null;
        this._suspended = false;

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(Jx.activation, Jx.activation.suspending, this._suspendingListener, this),
            new Mail.EventHook(Jx.activation, Jx.activation.resuming, this._resumingListener, this),
            new Mail.EventHook(document, "msvisibilitychange", this._updateAppVisibility, this, false)
        );

        Debug.only(Object.seal(this));

        this._updateAppVisibility();
    };

    Mail.SuspendResumeHelper.prototype._updateAppVisibility = function () {
        Mail.log("SuspendResumeHelper._updateAppVisibility", Mail.LogEvent.start);
        if (this._platform && !this._suspended) {
            var visible = !document.msHidden;
            this._platform.mailManager.setMailVisible(visible);
            if (visible) {
                this._reportTelemetryOnMailVisible();
                this._appState.onAppVisible();
            } else {
                this._appState.setAppInvisible();
            }
        }
        Mail.log("SuspendResumeHelper._updateAppVisibility", Mail.LogEvent.stop);
    };

    Mail.SuspendResumeHelper.prototype._suspendingListener = function () {
        Mail.log("Mail_platform_suspend", Mail.LogEvent.start);
        Debug.assert(Jx.isInstanceOf(this._platform, Microsoft.WindowsLive.Platform.Client));

        this._updateAppVisibility();

        Debug.assert(!this._suspended);
        this._suspended = true;
        this._platform.suspend();

        Mail.log("Mail_platform_suspend", Mail.LogEvent.stop);
    };

    Mail.SuspendResumeHelper.prototype._resumingListener = function () {
        Mail.log("Mail_platform_resume", Mail.LogEvent.start);

        Debug.assert(Jx.isInstanceOf(this._platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(this._suspended);
        this._suspended = false;
        this._platform.resume();
        this._updateAppVisibility();

        var WAB = Windows.ApplicationModel.Background,
            backgroundStatus = null;

        try {
            backgroundStatus = WAB.BackgroundExecutionManager.getAccessStatus();
        } catch (e) {
            Jx.log.exception("BackgroundExecutionManager.getAccessStatus() failed.", e);
        }

        if (Jx.isValidNumber(backgroundStatus) &&
            (backgroundStatus !== WAB.BackgroundAccessStatus.allowedWithAlwaysOnRealTimeConnectivity) &&
            (backgroundStatus !== WAB.BackgroundAccessStatus.allowedMayUseActiveRealTimeConnectivity)) {
            // Force sync on resume ONLY if we are NOT a lock screen app
            Jx.startupSync(this._platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
        }

        Mail.log("Mail_platform_resume", Mail.LogEvent.stop);
        Jx.ptStopResume(Jx.TimePoint.responsive);
    };

    Mail.SuspendResumeHelper.prototype._reportTelemetryOnMailVisible = function () {
        Mail.writeProfilerMark("SuspendResumeHelper._reportTelemetryOnMailVisible", Mail.LogEvent.start);

        // Start a new job if it's been more than 4 hours since we last reported telemetry and
        // there is no outstanding job already. It's possible that there is an outstanding job
        // queued from more than 4 hours ago (e.g. we scheduled a job and then got suspended).
        if (((Date.now() - this._lastTelemetryReport) > Mail.Utilities.msInFourHours) &&
            (!this._telemetryJob)) {
            this._telemetryJob = Jx.scheduler.addJob(null,
                Mail.Priority.reportTelemetryOnVisible,
                "Mail telemetry reporting on visible",
                function () {
                    Mail.Instrumentation.instrumentConversationThreading();
                    Mail.Instrumentation.instrumentEmailProviders();

                    Debug.assert((Date.now() - this._lastTelemetryReport) > Mail.Utilities.msInFourHours);
                    this._lastTelemetryReport = Date.now();
                    this._telemetryJob = null;
                },
                this
            );
        }

        Mail.writeProfilerMark("SuspendResumeHelper._reportTelemetryOnMailVisible", Mail.LogEvent.stop);
    };

    Mail.SuspendResumeHelper.prototype.dispose = function () {
        this._appState.setAppInvisible();
        this._appState = null;
        this._platform = null;

        Jx.dispose(this._telemetryJob);
        this._telemetryJob = null;

        Jx.dispose(this._disposer);
        this._disposer = null;
    };

});
