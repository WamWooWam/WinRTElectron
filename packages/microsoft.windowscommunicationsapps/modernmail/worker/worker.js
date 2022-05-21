
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, getMailPlatform */
/*jshint browser:true*/

(function () {
    "use strict";

    var Worker = Mail.Worker;

    window.addEventListener("DOMContentLoaded", function () {
        _markStart("DOMContentLoaded");
        // Keep track of loaded scripts and assert if it finds duplicates
        Debug.only(Jx.Dep.collect());
        window.workerWindow = new WorkerWindow();
        _markStop("DOMContentLoaded");
    }, false);

    window.addEventListener("beforeunload", function () {
        _markStart("beforeunload");
        Debug.assert(window.workerWindow);
        Debug.assert(Jx.isInstanceOf(window.workerWindow, WorkerWindow));
        window.workerWindow.dispose();
        _markStop("beforeunload");
    }, false);

    var WorkerWindow = function () {
        _markStart("ctor");
        Jx.init({
            bici: false,
            launch: false,
            loc: false,
            perfTools: false
        });
        Jx.initGlomManager();
        this._initialized = false;
        this._scrubber = null;
        this._selection = null;
        this._platform = null;

        Mail.Globals.appSettings = new Mail.AppSettings();

        var disposer = this._disposer = new Mail.Disposer();
        var parent = Jx.glomManager.getParentGlom();
        Debug.Events.define(parent, "shutdown", "start", "pause", "resume", "suspend", "accountChanged", "viewChanged", "messageChanged");
        disposer.addMany(
            new Mail.EventHook(parent, "shutdown", this._onShutdown, this),
            new Mail.EventHook(parent, "start", this._onStart, this),
            new Mail.EventHook(parent, "pause", this._onPause, this),
            new Mail.EventHook(parent, "resume", this._onUnPause, this),
            new Mail.EventHook(parent, "accountChanged", this._onSelectionChanged, this),
            new Mail.EventHook(parent, "viewChanged", this._onSelectionChanged, this),
            new Mail.EventHook(parent, "messageChanged", this._onSelectionChanged, this)
        );

        var activation = Jx.activation;
        disposer.addMany(
            new Mail.EventHook(activation,  activation.suspending, this._onSuspend, this),
            new Mail.EventHook(activation,  activation.resuming, this._onResume, this)
        );

        Debug.only(Object.seal(this));

        this._initialize();
        _markStop("ctor");
    };

    WorkerWindow.prototype = {
        dispose: function () {
            _markStart("dispose");
            this._disposer.dispose();
            _markStop("dispose");
        },
        _initialize: function () {
            if (this._initialized) {
                return;
            }

            var platform = getMailPlatform();
            
            if (!platform) {
                Debug.loadMockPlatform().done(function () {
                    this._initialize();
                }.bind(this));
                return;
            }
            
            this._platform = this._disposer.add(platform);

            _markStart("_onInit");
            platform.mailManager.setMailVisible(false);

            this._initialized = true;
            this._selection = this._disposer.add(new Worker.Selection(platform));

            _markStop("_onInit");
        },
        _onShutdown: function () {
            _markStart("_onShutdown");
            this.dispose();
            _markStop("_onShutdown");
            window.close();
        },
        _onStart: function () {
            _markStart("_onStart");
            if (!this._scrubber) {
                Debug.assert(this._selection);
                this._scrubber = this._disposer.add(new Worker.PreemptiveScrubber(this._platform, this._selection));
            }
            this._scrubber.resume();
            _markStop("_onStart");
        },
        _onPause: function () {
            _markStart("_onPause");
            if (this._scrubber) {
                this._scrubber.pause();
            }
            _markStop("_onPause");
        },
        _onUnPause: function () {
            _markStart("_onUnPause");
            if (this._scrubber) {
                this._scrubber.resume();
            }
            _markStop("_onUnPause");
        },
        _onSelectionChanged: function (evt) {
            Debug.assert(this._selection);
            this._selection.onSelectionChanged(evt);
        },
        _onSuspend: function () {
            _markStart("_onSuspend");
            this._platform.suspend();
            Jx.glomManager.pauseMessages();
            _markStop("_onSuspend");
        },
        _onResume: function () {
            _markStart("_onResume");
            this._platform.resume();
            Jx.glomManager.resumeMessages();
            _markStop("_onResume");
        }
    };

    //function _mark(s) { Jx.mark("WorkerWindow:" + s); }
    function _markStart(s) { Jx.mark("WorkerWindow." + s + ",StartTA,WorkerWindow"); }
    function _markStop(s) { Jx.mark("WorkerWindow." + s + ",StopTA,WorkerWindow"); }
    //function _markAsyncStart(s) { Jx.mark("WorkerWindow:" + s + ",StartTM,WorkerWindow"); }
    //function _markAsyncStop(s) { Jx.mark("WorkerWindow:" + s + ",StopTM,WorkerWindow"); }

})();

