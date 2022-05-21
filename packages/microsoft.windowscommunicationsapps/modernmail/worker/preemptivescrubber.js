
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail.Worker, "PreemptiveScrubber", function () {
    "use strict";

    var Scrubber = Mail.Worker.PreemptiveScrubber = function (platform, selection) {
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Worker.Selection));
        this._platform = platform;
        this._selection = selection;

        this._disposer = new Mail.Disposer();
        this._priority = Mail.Priority.workerScrubber;
        this._isPaused = false;
        this._messageGetter = null;
        this._rater = null;
        this._messageScrubber = null;
        this._currentMessage = null;

        this._jobSet = this._disposer.add(Jx.scheduler.createJobSet());

        this._syncListener = this._disposer.add(new Mail.Worker.SyncListener(platform));
        this._syncHook = null;
        this._start();

        Debug.only(Object.seal(this));
        _markStop("ctor");
    };

    Scrubber.prototype = {
        dispose: function () {
            _markStart("dispose");
            Jx.dispose(this._syncHook);
            this._disposer.dispose();
            _markStop("dispose");
        },
        _disposeMessageGetter: function () {
            this._disposer.disposeNow(this._messageGetter);
            this._messageGetter = null;
        },
        _start: function () {
            var messageGetter = this._messageGetter;
            Jx.dispose(this._syncHook);
            if (this._syncListener.isSyncing()) {
                this._syncHook = new Mail.EventHook(this._syncListener, "syncStatusChanged", this._start, this);
                if (messageGetter) {
                    messageGetter.whenDirty(this._disposeMessageGetter, this);
                }
            } else {
                if (messageGetter) {
                    messageGetter.whenDirty(null);
                }
                _markAsyncStart("cycle");
                Jx.scheduler.addJob(this._jobSet, Mail.Priority.workerScrubber, "PreemptiveScrubber._createGetter", this._createGetter, this);
            }
        },
        _createGetter: function () {
            _markStart("_createGetter");
            if (!this._messageGetter) {
                this._messageGetter = this._disposer.add(new Mail.Worker.MessageGetter(this._platform));
            }
            Jx.scheduler.addJob(this._jobSet, this._priority, "PreemptiveScrubber._createRater", this._createRater, this);
            _markStop("_createGetter");
        },
        _createRater: function () {
            _markStart("_createRater");
            if (!this._rater) {
                this._rater = this._disposer.add(new Mail.Worker.Rater(this._platform, this._selection));
            }
            Debug.assert(this._messageGetter);
            this._rater.getBestMessage(this._messageGetter, this._onRaterReady, this);
            _markStop("_createRater");
        },
        _onRaterReady: function (message) {
            _markStart("_onRaterReady");
            if (message) {
                Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
                Debug.assert(!this._currentMessage);
                this._currentMessage = message;
                Jx.scheduler.addJob(this._jobSet, this._priority, "PreemptiveScrubber._createMessageScrubber", this._createMessageScrubber, this);
            } else {
                _markAsyncStop("cycle");
                _mark("no messages");
                this._messageGetter.whenDirty(this._start, this);
            }
            _markStop("_onRaterReady");
        },
        _createMessageScrubber: function () {
            _markStart("_createMessageScrubber");
            Debug.assert(Jx.isInstanceOf(this._currentMessage, Mail.UIDataModel.MailMessage));
            Debug.assert(!this._messageScrubber);
            this._messageScrubber = this._disposer.add(new Mail.Worker.AsyncMessageScrubber(this._platform, this._currentMessage, this._onMessageScrubberFinished, this));
            _markStop("_createMessageScrubber");
        },
        _onMessageScrubberFinished: function () {
            _markStart("_onMessageScrubberFinished");
            Debug.assert(this._messageScrubber);
            Debug.assert(this._messageScrubber.getObjectId() === this._currentMessage.objectId);
            this._disposer.disposeNow(this._messageScrubber);
            this._messageScrubber = null;
            this._currentMessage = null;
            _markAsyncStop("cycle");
            Jx.scheduler.addJob(this._jobSet, this._priority, "PreemptiveScrubber._restart", this._start, this);
            _markStop("_onMessageScrubberFinished");
        },
        resume: function () {
            _markStart("resume");
            if (this._isPaused) {
                this._isPaused = false;
                Jx.scheduler.resume();
            }
            _markStop("resume");
        },
        pause: function () {
            _markStart("pause");
            if (!this._isPaused) {
                this._isPaused = true;
                Jx.scheduler.pause();
            }
            _markStop("pause");
        }
    };

    function _mark(s) { Jx.mark("PreemptiveScrubber:" + s); }
    function _markStart(s) { Jx.mark("PreemptiveScrubber." + s + ",StartTA,PreemptiveScrubber"); }
    function _markStop(s) { Jx.mark("PreemptiveScrubber." + s + ",StopTA,PreemptiveScrubber"); }
    function _markAsyncStart(s) { Jx.mark("PreemptiveScrubber:" + s + ",StartTM,PreemptiveScrubber"); }
    function _markAsyncStop(s) { Jx.mark("PreemptiveScrubber:" + s + ",StopTM,PreemptiveScrubber"); }

});
