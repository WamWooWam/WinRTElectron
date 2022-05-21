
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Debug,Jx,Windows */
/*jshint browser:true*/

(function () {
    "use strict";

    window.addEventListener("beforeunload", function () {
        if (!Mail.errorOccurred) {
            Mail.log("Mail_beforeunload", Mail.LogEvent.start);
            Jx.app.shutdownUI();
            // Can't do this after Jx.app.shutdown (the log won't exist anymore), so we have to do this here
            Mail.log("Mail_beforeunload", Mail.LogEvent.stop);
            Jx.app.shutdown();
        }
    }, false);

    // Hooks window.onerror to set Mail.errorOccurred flag.
    window.addEventListener("error", function (/*@dynamic*/ev) {
        if (Jx.log) {
            Jx.log.info("Mail.errorOccurred set to true.");
            Jx.log.error("Unhandled exception: " + ev.message + "\n  file: " + ev.filename + "\n  line: " + ev.lineno + "\n  column: " + ev.colno);
        }
        Jx.app.shutdownLog();
        Mail.errorOccurred = true;
    }, false);
}());


Jx.delayDefine(Mail, "BaseApp", function () {
    "use strict";

    var BaseApp = Mail.BaseApp = function (platform) {
        Mail.log("App_Ctor", Mail.LogEvent.start);
        Debug.only(Jx.loadScript("/ModernMail/Util/MailDebug.js"));
        Debug.only(Jx.loadScript("/ModernMail/Debug/DebugSnapshot.js"));
        Debug.only(Jx.loadScript("/ModernMail/Util/IdleDetector.js"));

        this._name = "Mail.BaseApp";
        this.initComponent();

        this._platform = Mail.Globals.platform = platform;

        this._appState = null;
        this._shareHandler = null;
        Object.defineProperty(Mail.Globals, "appState", { get: this._getAppState.bind(this), enumerable: true });

        this._settings = Mail.Globals.appSettings = new Mail.AppSettings();

        this._postStartupQueue = null;

        Mail.log("App_Ctor", Mail.LogEvent.stop);
    };

    Jx.augment(BaseApp, Jx.Component);
    var prototype = BaseApp.prototype;

    prototype._getAppState = function () {
        Debug.assert(Jx.isInstanceOf(this._appState, Mail.AppState));
        return this._appState;
    };

    prototype._buildFrame = function (appState) {
        Debug.assert(Jx.isInstanceOf(appState, Mail.AppState));
        Mail.log("App_Ctor_Children", Mail.LogEvent.start);

        this._appState = appState;
        this._frame = new Mail.CompFrame(this._platform, appState);
        this.appendChild(this._frame);
        Mail.log("App_Ctor_Children", Mail.LogEvent.stop);

        Jx.app.initUI(document.getElementById(Mail.CompApp.rootElementId));
    };

    prototype.getUI = function (ui) {
        /// <param name="ui" type="JxUI"></param>
        Mail.log("App_getUI", Mail.LogEvent.start);
        Debug.assert(this.getChildrenCount() === 1, "The app only supports one child");

        var uiFrame = Jx.getUI(this.getChild(0));
        ui.html = uiFrame.html;
        Debug.assert(uiFrame.css === "");

        Mail.log("App_getUI", Mail.LogEvent.stop);
    };

   prototype._onCommandsRequested = function (event) {
        // create it
        this._settingsPane = new Mail.CompSettingsPane();
        this.appendChild(this._settingsPane);

        // tell it to register for listeners
        var pane = event.target;
        this._settingsPane.activateUI(pane);
        this._settingsPane.appendCommands(event.request.applicationCommands);

        this._commandRequestedHook.dispose();
    };

   prototype.activateUI = function () {
        Debug.Mail.log("BaseApp.activateUI", Mail.LogEvent.start);
        Jx.Component.prototype.activateUI.call(this);

        Debug.Mail.log("Jx.res.processAll", Mail.LogEvent.start);
        // Process localization of DOM elements
        Jx.res.processAll(document.documentElement);
        Debug.assert(document.title === Jx.res.getString("mailAppTitle"), "Title not localized");
        Debug.Mail.log("Jx.res.processAll", Mail.LogEvent.stop);

        // register our settings commands
        Mail.log("Mail_Register_Settings_Command", Mail.LogEvent.start);

        this._commandRequestedHook = new Mail.EventHook(
            Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView(),
            "commandsrequested",
            this._onCommandsRequested,
            this
        );

        Mail.log("Mail_Register_Settings_Command", Mail.LogEvent.stop);
        Debug.Mail.log("BaseApp.activateUI", Mail.LogEvent.stop);
   };

   prototype.deactivateUI = function () {
        Jx.Component.prototype.deactivateUI.call(this);

        Jx.dispose(this._commandRequestedHook);
        Jx.dispose(this._postStartupQueue);
    };

   prototype.shutdownComponent = function () {
        Jx.Component.prototype.shutdownComponent.call(this);

        Jx.dispose(this._platform);
        this._platform = null;
        Jx.dispose(this._appState);
        this._appState = null;
        Jx.dispose(this._shareHandler);
        this._shareHandler = null;
        Jx.dispose(Mail.Globals.appSettings);
    };

    
   prototype.appStateReady = function () {
        return !Jx.isNullOrUndefined(this._appState);
    };
    
});

