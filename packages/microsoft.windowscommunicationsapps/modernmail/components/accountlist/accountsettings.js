
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft,People */

Jx.delayDefine(Mail, "AccountSettings", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform;

    Mail.AccountSettings = {};

    var isDialogOpened = false;
    Mail.AccountSettings.onDialogOpened = function () { isDialogOpened = true; };
    Mail.AccountSettings.onDialogClosed = function () { isDialogOpened = false; };

    Mail.AccountSettings._launchUpdateAccountDialog = function (account, dialogMode) {
        /// <param name="account" type="P.IAccount"/>
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        if (isDialogOpened) {
            return;
        }

        var appScenario = Microsoft.WindowsLive.Platform.ApplicationScenario.mail;
        var dialog = new window.People.Accounts.AccountDialog(account, dialogMode, appScenario, Mail.Globals.platform);
        dialog.show();
    };

    Mail.AccountSettings._launchGmailDowngradeDialog = function (account) {
        /// <param name="account" type="P.IAccount"/>
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        if (isDialogOpened) {
            return;
        }
        var dialog = new People.Accounts.AccountBarricadeDialog(account);
        dialog.showGmailDowngradeDialog(Mail.Globals.platform);
    };

    Mail.AccountSettings.launchPerAccountSettings = function (account, explicitLaunch) {
        /// <param name="account" type="P.IAccount"/>
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        if (isDialogOpened || !explicitLaunch) {
            return;
        }

        setTimeout(function () {
            People.Accounts.showAccountSettingsPage(Mail.Globals.platform,
                Microsoft.WindowsLive.Platform.ApplicationScenario.mail,
                People.Accounts.AccountSettingsPage.perAccountSettings,
                { launchedFromApp: true, account: account });
        }, 300);
    };

    var errorsFixableByUpdateAccountDialog = [
        P.Result.ixp_E_IMAP_LOGINFAILURE,
        P.Result.ixp_E_SMTP_535_AUTH_FAILED,
        P.Result.e_HTTP_DENIED,
        P.Result.autoDiscoveryFailed,
        P.Result.nteDecryptionFailure,
        P.Result.credentialMissing // account roamed with no credentials
    ];

    var errorsFixableByPerAccountSettings = [
        P.Result.e_SYNC_IGNORABLE_SERVER_CERT_FAILURE,
        P.Result.e_SYNC_CBA_FAILED
    ];

    var getCheckSettingsString = function () {
        var checkSettings = Jx.res.getString("/accountsStrings/alc-errorText");
        getCheckSettingsString = function () { return checkSettings; };
        return checkSettings;
    };

    var getNeedAttentionString = function () {
        var checkSettings = Jx.res.getString("/accountsStrings/alc-attentionNeededText");
        getNeedAttentionString = function () { return checkSettings; };
        return checkSettings;
    };

    Mail.AccountSettings.createErrorHandler = function (account, resource) {
        /// <param name="account" type="P.IAccount"/>
        /// <param name="accountResource" type="P.IAccountResource" optional="true"/>
        /// <returns type="MailAccountErrorHandler"/>
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        Debug.assert(Jx.isNullOrUndefined(resource) || Jx.isInstanceOf(resource, Microsoft.WindowsLive.Platform.IAccountResource));

        Mail.writeProfilerMark("AccountSettings_doesAccountRequireAttention", Mail.LogEvent.start);
        resource = resource || account.getResourceByType(P.ResourceType.mail);
        var lastSyncResult = resource ? resource.lastSyncResult : 0,
            lastPushResult = resource ? resource.lastPushResult : 0,
            lastSendMailResult = (resource && resource.lastSendMailResult) ? resource.lastSendMailResult : 0,
            result = {
                hasError : false,
                handler : Jx.fnEmpty,
                errorText : ""
            };

        // None of these error cases apply to the default account. The Platform might decide to
        // tell us otherwise, but we should ignore it, as we don't have UI to handle these for the default account.
        if (!account.isDefault) {
            if (lastSyncResult === P.Result.e_GOOGLE_APPS) {
                Jx.log.info("Account " + account.objectId + " requires reconnection due to errorCode - e_GOOGLE_APPS");
                result = {
                    hasError : true,
                    handler: Mail.AccountSettings._launchGmailDowngradeDialog.bind(null, account),
                    errorText : getNeedAttentionString()
                };
            } else if (errorsFixableByPerAccountSettings.indexOf(lastSyncResult) !== -1 || lastPushResult === P.Result.e_SYNC_PUSH_FAILED) {
                Jx.log.info("Account " + account.objectId + " requires attention due to errorCode - " + lastSyncResult);
                result = {
                    hasError: true,
                    handler: Mail.AccountSettings.launchPerAccountSettings.bind(null, account),
                    errorText: getCheckSettingsString()
                };
            } else if (errorsFixableByUpdateAccountDialog.indexOf(lastSyncResult) !== -1 && !Mail.AccountSettings.isSetupCompleted(account)) {
                Jx.log.info("Account " + account.objectId + " requires attention due to errorCode - " + lastSyncResult);
                var errorText = account.supportsOAuth ? getNeedAttentionString() : getCheckSettingsString();
                result = {
                    hasError: true,
                    handler: Mail.AccountSettings._launchUpdateAccountDialog.bind(null, account, People.Accounts.AccountDialogMode.update),
                    errorText: errorText
                };
            } else if (lastSendMailResult === P.Result.ixp_E_SMTP_535_AUTH_FAILED) {
                Jx.log.info("Account " + account.objectId + " requires attention due to errorCode - " + lastSendMailResult);
                var errorText = account.supportsOAuth ? getNeedAttentionString() : getCheckSettingsString();
                result = {
                    hasError: true,
                    handler: Mail.AccountSettings._launchUpdateAccountDialog.bind(null, account, People.Accounts.AccountDialogMode.updateSmtp),
                    errorText: errorText
                };
            }
        }
        Mail.writeProfilerMark("AccountSettings_doesAccountRequireAttention", Mail.LogEvent.stop);
        return result;
    };

    Mail.AccountSettings.isSetupCompleted = function (account) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount"/>
        Debug.assert(Jx.isObject(account));
        return (account.settingsResult === P.Result.success);
    };
});
