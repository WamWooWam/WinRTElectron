
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global  Jx, Mail, Debug, requestAnimationFrame */
/*jshint browser:true*/

Jx.delayDefine(Mail, "StartupHelper", function () {
    "use strict";

    var StartupHelper = Mail.StartupHelper = /*@constructor*/ function () {
        /// <summary>A small class that handles app restart and maintain the first run flag</summary>
        this._localSettings = Jx.appData.localSettings().container("Mail.StartupHelper");
        this._restartAppOnDialogDismissed = false;
        this._isAccountDialogOpened = false;
        this._isOAuthFlowOpened = false;

        // binding callbacks
        this.clearFirstRunFlag = this.clearFirstRunFlag.bind(this);
    };

    StartupHelper._StorageName = {
        firstRunFlag: "mail-firstRunFlag"
    };

    var prototype = StartupHelper.prototype;
    prototype.clearFirstRunFlag = function () {
        this._localSettings.set(Mail.StartupHelper._StorageName.firstRunFlag, "0");
    };

    prototype.dispose = function () {
        this.clearFirstRunFlag();
    };

    prototype.restart = function () {
        _markStart("restart");
        // When the user enters a wrong password in an EASI id flow, all the accounts will be removed
        // This will trigger a restart, we should only restart the app when the dialog is dismissed
        if (this._isAccountDialogOpened || this._isOAuthFlowOpened) {
            this._restartAppOnDialogDismissed = true;
            _mark("restart - skipped because account dialog is open");
            _markStop("restart");
            return;
        }

        var splashScreen = Mail.Globals.splashScreen;
        Debug.assert(Jx.isObject(splashScreen));
        splashScreen.prepareForRestart();
        // We want the un-hidden splash screen to paint before restarting the app,
        // so we have to reload after an animation frame. We do this because while the page
        // is reloading IE won't paint our app and will show whatever they were showing before
        // we called reload.
        requestAnimationFrame(function () {
            _mark("restart-callback");
            window.location.reload();
        });
        _markStop("restart");
    };

    prototype.onAccountDialogOpened = function () {
        this._isAccountDialogOpened = true;
    };

    prototype.onAccountDialogClosed = function (hasValidAccount) {
        /// <param name="hasValidAccount" type="Boolean"></param>
        Debug.assert(Jx.isBoolean(hasValidAccount));
        this._isAccountDialogOpened = false;
        if (!hasValidAccount && this._restartAppOnDialogDismissed) {
            this.restart();
            return;
        }
        this._restartAppOnDialogDismissed = false;
    };

    prototype.onOAuthFlowOpened = function () {
        this._isOAuthFlowOpened = true;
    };

    prototype.onOAuthFlowClosed = function (hasValidAccount) {
        /// <param name="hasValidAccount" type="Boolean"></param>
        this._isOAuthFlowOpened = false;
        // We might have tried restarting when the OAuth flow was up. Check that and that we have a 
        // valid account. Also, ensure that the account dialog is not showing. (It usually does
        // after the OAuth flow closes.)
        if (!this._isAccountDialogOpened && !hasValidAccount && this._restartAppOnDialogDismissed) {
            this.restart();
            return;
        }
        this._restartAppOnDialogDismissed = false;
    };

    Object.defineProperty(prototype, "isFirstRun", {
        get: function () {
            var firstRunFlag = this._localSettings.get(Mail.StartupHelper._StorageName.firstRunFlag);
            return !Jx.isNonEmptyString(firstRunFlag);
        }, enumerable: true
    });

    function _mark(s) { Jx.mark("Mail.StartupHelper:" + s); }
    function _markStart(s) { Jx.mark("Mail.StartupHelper." + s + ",StartTA,Mail,StartupHelper"); }
    function _markStop(s) { Jx.mark("Mail.StartupHelper." + s + ",StopTA,Mail,StartupHelper"); }
});
