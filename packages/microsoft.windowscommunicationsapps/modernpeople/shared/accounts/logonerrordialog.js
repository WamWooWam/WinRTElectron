
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Include.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

/*jshint browser:true*/
/*global Windows,Microsoft,People,WinJS,Jx,Debug*/

Jx.delayDefine(People.Accounts, ["showLogonErrorDialog", "showMustSignInDialog", "showNoConnectionErrorDialog"], function () {

    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform,
        Result = Plat.Result;


    // This prevents infinite platform creation loops
    var autoRetryPlatformCreation = true;

    //
    // PrimaryAccountSignIn
    //
    var PrimaryAccountSignIn = function (success, error, cancel) {
        ///<summary>Class used to drive the primary account dialog</summary>
        ///<param name="success" type="Function" optional="true">Callback on success, if applicable.</param> 
        ///<param name="error" type="Function" optional="true">Callback if there is an error, if applicable.</param> 
        ///<param name="cancel" type="Function" optional="true">Callback if dialog is canceled, if applicable.</param> 
        this._success = success || Jx.fnEmpty;
        this._error = error || Jx.fnEmpty;
        this._cancel = cancel || Jx.fnEmpty;
        this._dialogClosed = this._dialogClosed.bind(this);
    };

    PrimaryAccountSignIn.prototype.showDialog = function () {
        ///<summary>Launch the dialog</summary>
        var platform = null;
        var cancelOtherAppPromise;

        // First, signal any pending/failed primary account instances to cancel [this will cause an async verb to fire]
        try {
            platform = new Plat.Client("getPendingPrimaryAccountUser", Plat.ClientCreateOptions.failIfUnverified | Plat.ClientCreateOptions.getPendingPrimaryAccountUser);

            // We signal by sending a CancelPendingPrimaryAcount verb
            var account = platform.accountManager.defaultAccount;
            var verb = platform.createVerb("CancelPendingPrimaryAccount", "");
            cancelOtherAppPromise = platform.runResourceVerbAsync(account, "backgroundTasks", verb);
        } catch (ex) {
            if (autoRetryPlatformCreation && ex && (Plat.Result.primaryAccountAlreadyConnected === ex.number)) {
                autoRetryPlatformCreation = false;
                this._success();
                return;
            } else if (!ex || (Plat.Result.primaryAccountNotPending !== ex.number)) {
                // this is not an expected error.  We'll log it, but still try to create the platform in createPrimaryAccountUser mode
                Jx.log.exception("Platform getPendingPrimaryAccountUser", ex);
            }
            // else Plat.Result.primaryAccountNotPending === ex.number and we want to create the platform in createPrimaryAccountUser mode
        }

        WinJS.Promise.then(cancelOtherAppPromise, function () {
            // And now we can close the first platform instance, if we have one
            if (platform) {
                platform.dispose();
            }

            var dlg;

            // Then create a primary account user
            try {
                platform = new Plat.Client("createPrimaryAccountUser", Plat.ClientCreateOptions.failIfUnverified | Plat.ClientCreateOptions.createPrimaryAccountUser);
                platform.addEventListener("restartneeded", this._dialogClosed);
                this._platform = platform;

                var upsell = platform.accountManager.getAccountBySourceId("EXCH", "");
                dlg = new A.AccountDialog(upsell, A.AccountDialogMode.addPrimary, Plat.ApplicationScenario.mail, platform, "addPrimaryAccount");
            } catch (ex) {
                Jx.log.exception("Platform createPrimaryAccountUser", ex);
                this._cleanupListeners();
                var error = ex.number || Plat.Result.primaryAccountAlreadyConnected;
                if (autoRetryPlatformCreation && (Plat.Result.primaryAccountAlreadyConnected === error)) {
                    autoRetryPlatformCreation = false;
                    this._success();
                } else {
                    this._error(error);
                }
                return;
            }

            var activation = Jx.activation;
            activation.addListener(activation.suspending, this._dialogClosed, this);
            this._activation = activation;

            dlg.show(true);
            this._dlg = dlg;
            dlg.addListener("closed", this._dialogClosed, this);
        }.bind(this));
    };

    PrimaryAccountSignIn.prototype._cleanupListeners = function () {
        if (this._dlg) {
            this._dlg.removeListener("closed", this._dialogClosed, this);

            this._dlg.close();
            this._dlg = null;
        }

        if (this._activation) {
            this._activation.removeListener(this._activation.suspending, this._dialogClosed, this);
            this._activation = null;
        }

        if (this._platform) {
            this._platform.removeEventListener("restartneeded", this._dialogClosed);

            this._platform.dispose();
            this._platform = null;
        }
    };

    PrimaryAccountSignIn.prototype._dialogClosed = function () {
        var wasSuccess = this._dlg && this._dlg.wasSuccess;
        this._cleanupListeners();

        if (wasSuccess) {
            this._success();
        } else {
            autoRetryPlatformCreation = true;
            this._cancel();
        }
    };

    var requestSignInCredentialsDialog = function (success, error, cancel, originatingError) {
        ///<summary>Dialog to show when wanting credentials from the user</summary>
        ///<param name="success" type="Function" optional="true">Callback on success, if applicable.</param> 
        ///<param name="error" type="Function" optional="true">Callback if there is an error, if applicable.</param> 
        ///<param name="cancel" type="Function" optional="true">Callback if dialog is canceled, if applicable.</param> 
        ///<param name="originatingError" type="Number" optional="true">Originating error.</param> 

        var showPrompt = false;

        try {
            showPrompt = (Result.defaultAccountDoesNotExist === originatingError) && Windows.Management.Workplace.WorkplaceSettings.isMicrosoftAccountOptional;
        } catch (ex) {
            // ignore errors
            Jx.log.exception("WorkplaceSettings lookup", ex);
        }

        if (showPrompt) {
            var primaryAccountSignIn = new PrimaryAccountSignIn(success, error, cancel);
            primaryAccountSignIn.showDialog();
        } else {
            A.showCredUIAsync(success, error, cancel, originatingError);
        }
    };

    var showLogonErrorDialog = A.showLogonErrorDialog = function (retry, dismiss, hr) {
        ///<summary>Error dialog to show when failing to create the platform</summary>
        ///<param name="retry" type="Function">Callback that should retry platform creation. Returns true if the platform was
        ///successfully created which causes the dialog to dismiss.</param>
        ///<param name="dismiss" type="Function">Callback taking a single boolean parameter when the dialog is closed. True if
        ///platform was created during a retry, false if dismissed without successful creation.</param>
        ///<param name="hr" type="Number">Failure code</param>

        // Determine if we should show credUI
        var showCredUI = [
            Result.accountLocked,
            Result.accountSuspendedAbuse,
            Result.accountSuspendedCompromise,
            Result.accountUpdateRequired,
            Result.actionRequired,
            Result.authRequestThrottled,
            Result.defaultAccountDoesNotExist,
            Result.emailVerificationRequired,
            Result.forceSignIn,
            Result.parentalConsentRequired,
            Result.passwordDoesNotExist,
            Result.passwordLogonFailure,
            Result.passwordUpdateRequired,
        ].indexOf(hr) !== -1;

        Jx.log.info((("People.Accounts.showLogonErrorDialog(), hr = " + hr) + (", showCredUI = " + (showCredUI ? "true" : "false"))));

        var retryLogon = function () {
            var setError = function (error) { hr = error; };
            if (retry(setError)) {
                dismiss(true /*success*/);
            } else {
                showLogonErrorDialog(retry, dismiss, hr);
            }
        };

        if (showCredUI) {
            requestSignInCredentialsDialog(
                retryLogon /*success*/,
                function (error) {
                    showBarricadeErrorDialog(function () {
                        showLogonErrorDialog(retry, dismiss, hr);
                    }, error);
                } /*failure*/,
                function () {
                    
                    var peopleAppClass = People.App || Jx.fnEmpty;
                    if (window.People && Jx.app instanceof peopleAppClass) {
                        dismiss(false /*success*/);
                    } else {
                        
                        A.showMustSignInDialog(function () {
                            showLogonErrorDialog(retry, dismiss, hr);
                        });
                        
                    }
                    
                } /*user-canceled*/,
                hr /*originatingError*/);
        } else {
            showBarricadeErrorDialog(retryLogon, hr);
        }
    };

    var showMustSignInDialog = A.showMustSignInDialog = function (retry, forceShow) {
        ///<summary>Error dialog to show if we can't proceed because the user isn't signed-in</summary>
        ///<param name="retry" type="Function" optional="true"/>
        ///<param name="forceShow" type="Boolean" optional="true"/>
        ///<return type="Boolean">Returns true if the message was successfully displayed</return>
        return showErrorDialog("logonErrorMustSignIn", retry, forceShow);
    };

    var showNoConnectionErrorDialog = A.showNoConnectionErrorDialog = function (retry) {
        ///<summary>Error dialog to show we lose internet connectivity issues.</summary>
        ///<param name="retry" type="Function" optional="true"/>
        ///<return type="Boolean">Returns true if the message was successfully displayed</return>
        return showErrorDialog("logonErrorNoInternet", retry);
    };

    var showCantSigninInDialog = function (retry) {
        ///<summary>Error dialog to show that sign-in failed, and we're not exactly sure why. This is meant to be a catch-all error dialog.</summary>
        ///<param name="retry" type="Function" optional="true"/>
        ///<return type="Boolean">Returns true if the message was successfully displayed</return>
        return showErrorDialog("logonServerUnavailable", retry);
    };

    var showBarricadeErrorDialog = function (retry, hr) {
        // A few of the errors returned by IDCRL we can present a decipherable message for.
        switch (hr) {
            case -2147023665: /*HRESULT_FROM_WIN32(ERROR_NETWORK_UNREACHABLE)*/
                // Verify that there's really not internet
                if (P.Accounts.cannotConnectToNetwork()) {
                    showNoConnectionErrorDialog(retry);
                } else {
                    showCantSigninInDialog(retry);
                }
                break;
            case -2146893042: /*SEC_E_NO_CREDENTIALS*/
                showMustSignInDialog(retry);
                break;
            default:
                showCantSigninInDialog(retry);
                break;
        }
    };

    var showErrorDialog = function (contentId, retry, forceShow) {
        ///<summary>Error dialog to show we lose internet connectivity issues.</summary>
        ///<param name="contentId" type="String">Represents the message content string resource ID for the dialog.</param>
        ///<param name="retry" type="Function" optional="true">Callback for the retry-link, if applicable.</param> 
        ///<param name="forceShow" type="Boolean" optional="true"/>
        ///<return type="Boolean">Returns true if the message was successfully displayed</return>
        var close = function () {
            dialog.close();
        };
        var dialog = new P.AlertDialog(document.title, new ErrorContent(contentId, retry, close), { fullscreen: true });

        return dialog.show(false /*escapable*/, forceShow);
    };

    var ErrorContent = function (contentId, retry, close) {
        ///<summary>Control which provides the content (i.e. error message) for the various barricade error dialogs</summary>
        ///<param name="contentId" type="String">Represents the message content string resource ID for the dialog.</param>
        ///<param name="retry" type="Function" optional="true">Callback for the retry-link, if applicable.</param> 
        ///<param name="close" type="Function" optional="true">Callback when the dialog is closed</param>
        this.initComponent();
        this._retry = retry || Jx.fnEmpty;
        this._close = close || Jx.fnEmpty;
        this._contentId = contentId;
    };
    Jx.augment(ErrorContent, Jx.Component);

    ErrorContent.prototype.getUI = function (ui) {
        this._id = "idErrorDialogContent" + Jx.uid();
        ui.html =
            "<div id='" + this._id + "'>" +
                "<div id='dlgDescription' role='heading'>" + getCompoundString(this._contentId, document.title) + "</div>" +
            "</div>";
    };

    ErrorContent.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        var container = document.getElementById(this._id);

        // Find the link.
        var link = container.querySelector("a");
        Debug.assert(Jx.isHTMLElement(link) || !this._retry);

        if (Jx.isHTMLElement(link) && Jx.isFunction(this._retry)) {
            link.addEventListener("click", function (ev) {
                ev.preventDefault();
                this._close();
                this._retry();
            }.bind(this));
        }
        Jx.safeSetActive(link);
    };

    function getCompoundString(id, values) { return Jx.res.loadCompoundString("/accountsStrings/" + id, values); }

});

