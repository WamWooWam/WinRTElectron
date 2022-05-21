
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Windows,Microsoft,Chat,Jx,Debug*/

Jx.delayDefine(Mail, "AccountSyncStatus", function () {
    "use strict";

    var Platform = Microsoft.WindowsLive.Platform;

    var AccountSyncStatus = Mail.AccountSyncStatus = function (messageBar, selection, platform) {
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(messageBar, Chat.MessageBar));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isInstanceOf(platform, Platform.Client));

        this._messageBar = messageBar;
        this._selection = selection;
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(selection, "navChanged", this._onNavChanged, this),
            new Mail.EventHook(Jx.activation, Jx.activation.resuming, this._onResume, this)
        );
        this._cleanupTimer = null;
        // Get the ease of access notification time value
        // Also convert to milliseconds and cut in half since our strings are pretty small.
        this._messageDuration = new Windows.UI.ViewManagement.UISettings().messageDuration * 1000 / 2;

        this._accounts = this._disposer.add(new Mail.QueryCollection(platform.accountManager.getConnectedAccountsByScenario, platform.accountManager,
            [Platform.ApplicationScenario.mail, Platform.ConnectedFilter.normal, Platform.AccountSort.name]));
        this._accounts.unlock();

        // We only want to show a string once a minute per account, so we'll keep a map of times per account
        this._lastViewed = {};

        Object.seal(this);

        this._showMessage();
        _markStop("ctor");
    };

    // Abstracted away for unit testing purposes
    AccountSyncStatus._getNow = function () {
        return Date.now();
    };

    AccountSyncStatus.prototype = {
        dispose: function () {
            _markStart("dispose");
            this._disposer.dispose();
            this._disposer = null;
            _markStop("dispose");
        },
        _onResume: function () {
            _markStart("_onResume");
            this._showMessage();
            _markStop("_onResume");
        },
        _onNavChanged: function (ev) {
            _markStart("_onNavChanged");
            Debug.assert(Jx.isObject(ev));
            Debug.assert(Jx.isBoolean(ev.accountChanged));
            if (ev.accountChanged) {
                this._showMessage();
            }
            _markStop("_onNavChanged");
        },
        _showMessage: function () {
            var now = AccountSyncStatus._getNow(),
                account = this._selection.account,
                accountId = account.objectId,
                lastViewed = this._lastViewed,
                lastViewedTime = lastViewed[accountId] || 0,
                timeSinceLastViewed = now - lastViewedTime;
            if (timeSinceLastViewed < 60 * 1000) {  // if saw a message less than a minute ago...
                _mark("_showMessage: already seen before: " + timeSinceLastViewed);
                return;
            }
            _markStart("_showMessage");
            lastViewed[accountId] = now;
            var str = this._getStringForAccount(account);
            if (Jx.isNonEmptyString(str)) {
                this._messageBar.addStatusMessage(
                    "AccountSyncStatus",
                    Chat.MessageBar.Priority.superLow,
                    {
                        messageText: str,
                        tooltip: str,
                        cssClass: "mailMessageBar"
                    }
                );
                this._cleanupTimer = this._disposer.replace(this._cleanupTimer,
                    new Jx.Timer(this._messageDuration, this._hideMessage, this)
                );
            }
            _markStop("_showMessage");
        },
        _hideMessage: function () {
            this._messageBar.removeMessage("AccountSyncStatus");
        },
        _getStringForAccount: function (account) {
            Debug.assert(Jx.isInstanceOf(account, Mail.Account));
            _mark("_getStringForAccount");
            var accountResource = account.mailResource;
            if (!accountResource) {
                return null;
            }
            Debug.assert(Jx.isValidNumber(accountResource.lastPushResult));
            Debug.assert(Jx.isValidNumber(account.syncType));
            if ((accountResource.lastPushResult === Platform.Result.success) && (account.syncType === Platform.SyncType.push)) {
                if (this._accounts.count <= 1) {
                    return Jx.res.getString("mailSyncUpToDate");
                }
                return Jx.res.loadCompoundString("mailSyncUpToDate_withEmail", account.emailAddress);
            }
            var time = accountResource.lastSyncTime;
            var timeString = this._getTimeString(time);
            _mark("_getStringForAccount: time=" + time + ", timeString=" + timeString);
            if (timeString === null) {
                return null;
            }
            Debug.assert(Jx.isNonEmptyString(timeString));
            if (this._accounts.count <= 1) {
                return Jx.res.loadCompoundString("mailSyncLastUpdated", timeString);
            }
            return Jx.res.loadCompoundString("mailSyncLastUpdated_withEmail", account.emailAddress, timeString);
        },
        _getTimeString: function (time) {
            _mark("_getTimeString");
            var timeSince = (AccountSyncStatus._getNow() - time) / 1000; // Time since "time" (in seconds)
            if (timeSince < 30) {
                return Jx.res.getString("mailSyncInterval_seconds");
            }
            if (timeSince < 90) {
                return Jx.res.getString("mailSyncInterval_minute");
            }
            if (timeSince < 60*59.5) {        // almost one hour
                return Jx.res.loadCompoundString("mailSyncInterval_minutes", Math.round(timeSince / 60));   // convert to minutes
            }
            if (timeSince < 60*89.5) {        // almost 90 minutes
                return Jx.res.loadCompoundString("mailSyncInterval_hour");
            }
            if (timeSince < 60*60*23.5) {     // almost one hour
                return Jx.res.loadCompoundString("mailSyncInterval_hours", Math.round(timeSince / 60 / 60));   // convert to hours
            }
            if (timeSince < 60*60*47.5) {   // almost two days
                return Jx.res.loadCompoundString("mailSyncInterval_day");
            }
            var days = Math.round(timeSince / 60 / 60 / 24);
            if (days < 366) {
                return Jx.res.loadCompoundString("mailSyncInterval_days", days);
            }
            return null;
        }
    };

    function _mark(s) { Jx.mark("AccountSyncStatus:" + s); }
    function _markStart(s) { Jx.mark("AccountSyncStatus." + s + ",StartTA,Mail,AccountSyncStatus"); }
    function _markStop(s) { Jx.mark("AccountSyncStatus." + s + ",StopTA,Mail,AccountSyncStatus"); }
    //function _markAsyncStart(s) { Jx.mark("AccountSyncStatus:" + s + ",StartTM,Mail,AccountSyncStatus"); }
    //function _markAsyncStop(s) { Jx.mark("AccountSyncStatus:" + s + ",StopTM,Mail,AccountSyncStatus"); }
});