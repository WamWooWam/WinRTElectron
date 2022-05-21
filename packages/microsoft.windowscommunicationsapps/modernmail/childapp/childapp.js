
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Debug,Jx,WinJS */
/*jshint browser:true*/

(function() {
    "use strict";

    function ensurePlatform() {
        
        // Load the mock platform if we're in the test app
        if (Debug.loadMockPlatform) {
            return Debug.loadMockPlatform();
        }
        

        return window.getMailPlatform();
    }

    window.addEventListener("DOMContentLoaded", function() {
        // Keep track of loaded scripts and assert if it finds duplicates
        Debug.only(Jx.Dep.collect());

        // Title must be set before Jx.Application because 
        // it can be used in startup dialogs
        document.title = Jx.res.getString("mailAppTitle");

        Jx.app = new Jx.Application(Jx.AppId.mail, true);

        // Create the logger
        Jx.log = new Jx.Log();
        Jx.log.enabled = true;
        Jx.log.level = Jx.LOG_VERBOSE;
        Mail.log("Mail_FirstAvailable");

        // If the app requires a mandatory update, we should abort app launch
        // Jx.launch will take over and show the update dialog
        if (Jx.launch.getCurrentAppStatus() === Jx.Launch.AppStatus.mandatoryUpdate) {
            Debug.Mail.log("mandatory update, restart required!");
            return;
        }

        Debug.hookPromiseErrors(/*assertOnException:*/true);

        WinJS.Promise.then(ensurePlatform(), function (platform) {
            var app = Jx.root = new Mail.CompApp(platform);
            app.buildUI();
            document.addEventListener("msvisibilitychange", app.handleVisibilityChange, false);
        });

        Debug.assert(document.msHidden); // The child app should start hidden

        Mail.log("Mail_DOMContentLoaded_end");
    }, false);
}());

Jx.delayDefine(Mail, "CompApp", function () {
    "use strict";

    var BaseApp = Mail.BaseApp;
    Mail.CompApp = function (platform) {
        BaseApp.call(this, platform);
    };

    var proto = Mail.CompApp.prototype;
    Jx.mix(proto, BaseApp.prototype);

    proto._onResume = function () {
        this._platform.resume();
    };

    proto._onSuspend = function () {
        this._platform.suspend();
    };

    proto.handleVisibilityChange = function (event) {
        if (!event.target.msHidden) {
            Jx.glomManager.getParentGlom().postMessage("childGlomVisible");
        }
    };

    proto.buildUI = function () {
        this._buildFrame();
    };

    proto._buildFrame = function () {
        this._appState = new Mail.AppState();
        BaseApp.prototype._buildFrame.call(this, this._appState);

        // Child windows can finish startup synchronously
        this._frame.postStartupWork();

        Mail.log("load share handler", Mail.LogEvent.start);
        this._shareHandler = new Mail.ShareHandler();
        Mail.log("load share handler", Mail.LogEvent.stop);

        Mail.log("Mail_Launch_DeferredTasks", Mail.LogEvent.start);
        if (Jx.isObject(Jx.launch) && Jx.isFunction(Jx.launch.startDeferredTasks)) {
            Jx.launch.startDeferredTasks(this._platform);
        }
        Mail.log("Mail_Launch_DeferredTasks", Mail.LogEvent.stop);

        Mail.log("ComposeLoad", Mail.LogEvent.start);
        Mail.Utilities.ComposeHelper.ensureComposeFiles();
        Mail.log("ComposeLoad", Mail.LogEvent.stop);
    };

    proto.activateUI = function () {
        BaseApp.prototype.activateUI.call(this);

        var activation = Jx.activation;
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(activation, activation.resuming, this._onResume, this),
            new Mail.EventHook(activation, activation.suspending, this._onSuspend, this)
        );
    };

    proto.deactivateUI = function () {
        BaseApp.prototype.deactivateUI.call(this);
        Jx.dispose(this._disposer);
    };

    Mail.CompApp.rootElementId = "idCompApp";
});
