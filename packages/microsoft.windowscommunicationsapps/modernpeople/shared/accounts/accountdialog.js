
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Jx,Debug,People,Microsoft,Windows,WinJS*/

Jx.delayDefine(People.Accounts, ["AccountFields", "AccountDialog", "AccountDialogMode", "AccountDialogEvents"], function () {

    var P = window.People,
        A = P.Accounts,
        Plat = Microsoft.WindowsLive.Platform,
        Crypto = Windows.Security.Cryptography;

    var AccountDialogEvents = A.AccountDialogEvents = {
        newAccountAdded: "People.Accounts.AccountDialogEvents.newAccountAdded",
        launchingOAuthFlow: "People.Accounts.AccountDialogEvents.launchingOAuthFlow",
        closingOAuthFlow: "People.Accounts.AccountDialogEvents.closingOAuthFlow"
    };
    Object.freeze(AccountDialogEvents);

    var AccountDialogMode = A.AccountDialogMode = {
        add: 0,
        update: 1,
        updateSmtp: 2,
        easiID: 3,
        addPrimary: 4
    };
    Object.freeze(AccountDialogMode);

    var AccountDialogLayout = {
        abbreviated: 0,
        intermediate: 1,
        full: 2,
        fullImap: 3,
        smtpOnly: 4,
        oauth: 5
    };
    Object.freeze(AccountDialogLayout);

    var AutoSelectCertResult = {
        noCerts: 0,
        success: 1,
        multipleSubjects: 2
    };
    Object.freeze(AutoSelectCertResult);

    var _timeoutThreshold = 120000;

    var AccountDialog = A.AccountDialog = function (account, mode, scenario, platform, entryPoint, suggestedEmailAddress, suggestedAccountName) {
        ///<summary>Overlay dialog for adding a new EAS account</summary>
        ///<param name="account" type="Plat.Account">The platform account. This can either be an upsell or an existing connected (EAS) account.
        /// When a upsell is given, the dialog will create a new contact templated by the upsell. Otherwise, the dialog will be used.
        /// to update the account's existing information.</param>
        ///<param name="mode" type="A.AccountDialogMode"/>
        // <param name="scenario" type="Plat.ApplicationScenario" optional="true">This is needed for the addition and easiId scenarios</param>
        // <param name="platform" type="Plat.Client" optional="true">This is needed for the addition and easiId scenarios</param>
        // <param name="entryPoint" type="number" optional="true">This is used for bici</param>
        // <param name="suggestedEmailAddress" type="String" optional="true">For Easi ID or Primary Account, the email address they are trying to connect</param>
        // <param name="suggestedAccountName" type="String" optional="true">For Primary Account, the name to use for the account, if specified</param>
        Debug.assert(Jx.isObject(account));
        Debug.assert(Jx.isNumber(mode));
        Debug.assert(!Jx.isNullOrUndefined(platform));

        this._keyboardShowingListener = this._onKeyboardShowing.bind(this);
        this._keyboardHidingListener = this._onKeyboardHiding.bind(this);

        var assetSource = account;

        this._dialogMode = mode;
        this._platform = platform;
        var titleResId = "actdlgTitle";
        var actionBtnResId = "actdlgAdd";
        var descriptionText = "";
        var dialogTitle = "";
        var accountColor = account.color.toString(16);
        this._cachedOAuthData = null;
        this._suggestedEmail = suggestedEmailAddress;
        switch (mode) {
            case A.AccountDialogMode.add:
                Debug.assert((account.accountType === Plat.AccountType.easAccountFactory) || (account.accountType === Plat.AccountType.imapAccountFactory));
                Debug.assert(Jx.isNumber(scenario));
                // This is an Upsell. Treat it accordingly.
                this._template = account;
                if (account.sourceId === "IMAP") {
                    // Prevent the title and description from reading "Add your Other Account account".
                    assetSource = { displayName: getString("actdlgOtherAccount"), iconMediumUrl: account.iconMediumUrl };
                }
                descriptionText = getCompoundString("actdlgDescription", [assetSource.displayName]);
                this._scenario = scenario;

                if (account.supportsOAuth) {
                    titleResId = "actdlgTitle-OAuth";
                }
                break;
            case A.AccountDialogMode.addPrimary:
                Debug.assert(account.accountType === Plat.AccountType.easAccountFactory);
                Debug.assert(Jx.isNumber(scenario));
                // This is an Upsell. Treat it accordingly.
                this._template = account;
                titleResId = "actdlgTitle-AddWorkAccount";
                this._accountName = suggestedAccountName || getString("actdlgWorkAccount");
                assetSource = { displayName: this._accountName, iconMediumUrl: "" };
                descriptionText = getString("actdlgDescription-AddWorkAccount");
                dialogTitle = getCompoundString("actdlgTitle-AddWorkAccount", [Jx.escapeHtml(this._accountName)]);
                accountColor = "2072b8";
                this._scenario = scenario;
                break;
            case A.AccountDialogMode.update:
                Debug.assert((account.accountType === Plat.AccountType.eas) || (account.accountType === Plat.AccountType.imap));
                Debug.assert(account.objectId !== "0");
                Debug.assert(account.emailAddress.length > 0);
                Debug.assert(!account.isDefault);
                titleResId = (account.supportsOAuth ? "actdlgTitle-UpdateOAuth" : "actdlgTitle-Update");
                descriptionText = getString("actdlgDescription-Update");
                actionBtnResId = "actdlgUpdate";
                this._account = account;

                break;
            case A.AccountDialogMode.updateSmtp:
                Debug.assert(account.accountType === Plat.AccountType.imap);
                Debug.assert(account.objectId !== "0");
                Debug.assert(account.emailAddress.length > 0);
                Debug.assert(!account.isDefault);
                titleResId = (account.supportsOAuth ? "actdlgTitle-UpdateOAuth" : "actdlgTitle-Update");
                descriptionText = getString("actdlgDescription-UpdateSmtp");
                actionBtnResId = "actdlgUpdate";
                this._account = account;

                break;
            case A.AccountDialogMode.easiID:
                Debug.assert((account.accountType === Plat.AccountType.easAccountFactory) || (account.accountType === Plat.AccountType.imapAccountFactory));
                Debug.assert(Jx.isNumber(scenario));
                Debug.assert(Jx.isNonEmptyString(suggestedEmailAddress));
                descriptionText = getString("actdlgDescription-EasiID");
                if (account.supportsOAuth) {
                    titleResId = "actdlgTitle-OAuth";
                } else if (!Jx.isNonEmptyString(assetSource.displayName)) {
                    dialogTitle = getString("easiIdTitle");
                }
                this._template = account;
                this._scenario = scenario;

                break;
            default:
                Debug.assert(false, "Unknown account-dialog mode.");
                break;
        }

        // Update Bici values
        this._bici = {
            configSource: P.Bici.ConfigSource.notAttempted,
            entryPoint: entryPoint || P.Bici.EntryPoint.other,
            result: Plat.Result.userCanceled,
            server: "",
            sourceId: account.sourceId,
            syncProtocol: P.Bici.SyncProtocol.unknown
        };

        // Brand the header based on the current upsell/account
        var headerColor;
        var titleColor;
        var hexColor = accountColor;
        if (accountColor !== "0" && hexColor !== "ffffffff") {
            // We're not going to show the default grey header color. Use white as
            // the title color.
            headerColor = "#" + hexColor;
            titleColor = "White";
        }

        if (!Jx.isNonEmptyString(dialogTitle)) {
            dialogTitle = getCompoundString(titleResId, [assetSource.displayName]);
        }
 
        var dialogLayout = (mode === AccountDialogMode.updateSmtp) ? AccountDialogLayout.smtpOnly : AccountDialogLayout.abbreviated;

        // Check if this account supports OAuth.
        if (account.supportsOAuth) {
            dialogLayout = AccountDialogLayout.oauth;
            descriptionText = "";
        }

        var addButton = new P.DialogButton("actdlgAdd", getString(actionBtnResId), "submit"),
            fields = this._fields = new AccountFields(account, descriptionText, mode, scenario, suggestedEmailAddress, dialogLayout),
            dialog = this._dialog = new P.FormDialog(dialogTitle, fields, { headerColor: headerColor, headerIcon: assetSource.iconMediumUrl, titleColor: titleColor} /*options*/),
            closeButton = new P.CloseButton("actdlgCancel", getString("actdlgCancel"), dialog);

        fields.setDialogButtons(addButton, closeButton);

        this._mainAction = this._createAccount;

        dialog.addListener("submit", this._mainDialogActionHandler, this);
        addButton.addListener("click", this._mainDialogActionHandler, this);
        addButton.autofocus = true;
        dialog.buttons = [addButton, closeButton];

        // Subscribe to dialog opened and closed event
        dialog.addListener("opened", this._onOpened.bind(this), this);
        dialog.addListener("closed", this._onClosed.bind(this), this);
    };
    Jx.inherit(AccountDialog, Jx.Events);
    Debug.Events.define(AccountDialog.prototype, "closed");

    AccountDialog.prototype._onKeyboardShowing = function (e) {
        ///<summary>Invoked when the onscreen keyboard is shown.</summary>
        e.ensuredFocusedElementInView = true;

        // The OSK is being displayed ensure that if it covers a portion of our
        // last input field, that we dynamically move everything up so that all
        // the input fields are visible. Note: this may be at the sacrifice of the
        // title and description.
        var submitBtn = document.getElementById("actdlgAdd");
        var submitBtnBottom = submitBtn.getBoundingClientRect().bottom + 7;
        if (submitBtnBottom > e.occludedRect.y) {
            var dialogBox = document.getElementById("dlg-box");
            var form = document.getElementById("dlg-form");
            dialogBox.style.position = "fixed";
            dialogBox.style.msOverflowStyle = "scrollbar"; //force the scrollbar to show.
            // Trap the pointer-down event to prevent the OSK from dismissing when the user scrolls/pans vertically.
            this._pointerDownTrap = function (ev) { ev.preventDefault(); };
            dialogBox.addEventListener("MSPointerDown", this._pointerDownTrap, false);

            // Calculate the y-adjustment value needed keep the buttons from being truncated.
            var yAdjustValue = (submitBtnBottom - e.occludedRect.y);
            var top = -yAdjustValue;
            // Make sure we're not going to push anything off the top of the screen.
            if (form.offsetTop < yAdjustValue) {
                // We need more space. Shrink the height of the dialog. This will
                // enable scrolling of the dialog contents.
                form.style.pixelHeight = form.offsetHeight - (yAdjustValue - form.offsetTop);
                top = -form.offsetTop;
            }
            dialogBox.style.top = top + "px";
            msSetImmediate(function () { document.activeElement.scrollIntoView(); });
        }
    };

    AccountDialog.prototype._onKeyboardHiding = function () {
        ///<summary>Invoked when the onscreen keyboard is hidden.</summary>
        // It's possible the user hit the cancel button while the onscreen keyboard
        // was present. In which case our UI will be gone by the time we get this event.
        if (this._dialog.hasUI()) {
            var dialogBox = document.getElementById("dlg-box");
            var form = document.getElementById("dlg-form");
            dialogBox.style.position = "";
            dialogBox.style.top = "";
            form.style.height = "";
            dialogBox.style.msOverflowStyle = "";
            if (this._pointerDownTrap) {
                dialogBox.removeEventListener("MSPointerDown", this._pointerDownTrap, false);
                this._pointerDownTrap = null;
            }
        }
    };

    AccountDialog.prototype.show = function (forceShow) {
        ///<summary>Show the account dialog</summary>
        ///<param name="forceShow" type="Boolean" optional="true">If true will force any current dialogs to dismiss so this one can be displayed.</param>
        if (this._fields.layoutMode === AccountDialogLayout.oauth) {
            if (this._dialog.canShow() || forceShow) {
                if (forceShow) {
                    this._dialog.closeActive();
                }

                // The dialog will not actually show until the OAuth control goes away.
                // We still need to reserve the next showing so that another A.Dialog doesn't
                // try to show in the interim. 
                if (this._dialog.reserveNextShowing()) {
                    var emailAddress = this._suggestedEmail;
                    if (this._account) {
                        emailAddress = emailAddress || this._account.emailAddress;
                    }

                    if (this._launchOAuthFlow(emailAddress, forceShow)) {
                        return true;
                    }
                }
            }

        } else {

            return this._dialog.show(true/*escapable*/, forceShow);
        }
        return false;
    };

    AccountDialog.prototype.close = function () {
        ///<summary>Close the account dialog</summary>
        this._dialog.close();
    };

    AccountDialog.prototype._launchOAuthFlow = function (email, forceShow) {
        ///<summary>Launches the brokered OAuth flow. This is run prior to connecting
        ///an OAuth-supported account.</summary>
        ///<param name="email" type="String" optional="true">
        Jx.log.info("Invoking OAuth flow");
        var authenticateOp = this._promise = A.authenticateOAuthAsync(email);
        authenticateOp.done(
            function (res) {
                Jx.EventManager.broadcast(A.AccountDialogEvents.closingOAuthFlow);
                if (Jx.isObject(res) &&
                    Jx.isNonEmptyString(res.emailAddress) &&
                    Jx.isNonEmptyString(res.accessToken) &&
                    Jx.isNonEmptyString(res.refreshToken) &&
                    Jx.isObject(res.accessTokenExpiry)) {

                    this._cachedOAuthData = res;
                    this._createAccount();
                } else {
                    Jx.log.error("We didn't get back the data we expected from authenticateOAuthAsync. Failing out.");
                    this._handleOAuthFlowError(new Error(-2147418113/*E_UNEXPECTED*/, "unexpected oauth results"));
                }
            }.bind(this)/*onComplete*/,
            function (err) {
                this._handleOAuthFlowError(err);
                Jx.EventManager.broadcast(A.AccountDialogEvents.closingOAuthFlow);
            }.bind(this)/*onError*/,
            function () {
                if (this._ensureDialogShowing(forceShow)) {
                    this._fields.showProgress();
                } else {
                    authenticateOp.cancel();
                }
            }.bind(this)/*onProgress*/);

        Jx.EventManager.broadcast(A.AccountDialogEvents.launchingOAuthFlow);

        return authenticateOp;
    };

    AccountDialog.prototype._ensureDialogShowing = function (forceShow) {
        if (!this._dialog.isShowing()) {
            return this._dialog.show(forceShow);
        }
        return true;
    };

    AccountDialog.prototype._handleOAuthFlowError = function (err, forceShow) {
        ///<summary>Handler for an OAuth-flow specific error. That is
        ///an error which occurs before we try to connect the account.</summary>
        Jx.log.error("OAuth Failure: " + err);

        // We're trying here to decipher between a user-cancellation and an actual error.
        // Errors should have actual numerical value.
        if (Jx.isNumber(err) || (err && err.number)) {
            if (this._ensureDialogShowing(forceShow)) {

                var account = this._template || this._account;

                // Show a generic error message, and set the "conenct" button's text to "Yes".
                var errorText = getCompoundString("actdlgOAuthUnknownError", Jx.escapeHtml(account.displayName));
                this._fields.showError(errorText, getString("barDlgYesButton"));

                // Determine which email-hint to pass the OAuth flow. Give preference to whatever
                // we have in our cached OAuth data, if anything.
                var emailAddress = this._suggestedEmail;
                if (this._cachedOAuthData) {
                    emailAddress = this._cachedOAuthData.emailAddress || emailAddress;
                } else if (this._account) {
                    emailAddress = emailAddress || this._account.emailAddress;
                }

                // Update the submit action to retry the OAuth flow, rather than re-attempt to connect the account.
                this._mainAction = this._launchOAuthFlow.bind(this, emailAddress);
            }
        } else {
            // Assume user cancellation
            Jx.log.info("User cancelled OAuth flow. Exiting dialog.");

            if (this._dialog.isShowing()) {
                // Close the dialog.
                this.close();
            } else {
                // Unsure that we don't hold onto the next-show reservation.
                this._dialog.cancelReservation();
            }
        }
    };


    AccountDialog.prototype._fallbackToBasicAuth = function () {
        ///<summary>Switch the dialog flow from OAuth to basic auth.
        ///This essentially amounts to updating the layout mode of the fields
        ///and updating the main-action of the dialog.</summary>

        this._fields.updateLayout(AccountDialogLayout.abbreviated);
        this._fields.reapplyAccount(this._account);
        this._fields.email = this._cachedOAuthData.emailAddress;
        this._cachedOAuthData = null;
        this._mainAction = this._createAccount;
    };

    AccountDialog.prototype._validateInput = function () {
        var fields = this._fields;
        fields.showProgress();
        Jx.safeSetActive(document.getElementById("dlg-title"));

        if (fields.layoutMode !== AccountDialogLayout.oauth) {
            // At least need an email, password, and server.
            if (!Jx.isNonEmptyString(fields.email) || !_looksLikeAnEmail(fields.email)) {
                return new Error("invalid email");
            } else if (!Jx.isNonEmptyString(fields.server) && ((fields.layoutMode === AccountDialogLayout.full) || (fields.layoutMode === AccountDialogLayout.fullImap))) {
                return new Error("empty server");
            } else if (!Jx.isNonEmptyString(fields.password) && (fields.layoutMode !== AccountDialogLayout.smtpOnly)) {
                return new Error("empty password");
            } else if ((fields.layoutMode === AccountDialogLayout.fullImap) && !_looksLikeAPort(fields.port)) {
                return new Error("invalid IMAP port");
            } else if ((fields.layoutMode === AccountDialogLayout.fullImap) && !Jx.isNonEmptyString(fields.smtpServer)) {
                return new Error("empty SMTP server");
            } else if ((fields.layoutMode === AccountDialogLayout.fullImap) && !_looksLikeAPort(fields.smtpPort)) {
                return new Error("invalid SMTP port");
            } else if ((fields.layoutMode === AccountDialogLayout.fullImap) && (fields.smtpRequiresAuth && !fields.smtpReuseCreds)) {
                if (!Jx.isNonEmptyString(fields.smtpUsername)) {
                    return new Error("empty SMTP username");
                } else if (!Jx.isNonEmptyString(fields.smtpPassword)) {
                    return new Error("empty SMTP password");
                }
            }
        }
    };

    function _looksLikeAnEmail(email) {
        // Performs a very crude validation of the email address to
        // see if it somewhat resembles a valid address.
        var emailValidator = /^.+@.+\..+$/;
        return emailValidator.test(email);
    }

    function _looksLikeAPort(port) {
        return (!isNaN(port) && parseInt(port, 10) > 0);
    }

    var _base64Encode = function (binaryData) {
        _base64Encode = Crypto.CryptographicBuffer.encodeToBase64String;
        return _base64Encode(binaryData);
    };

    AccountDialog.prototype._encryptPassword = function (password) {
        var provider = Crypto.DataProtection.DataProtectionProvider("local=user");
        var binary = Crypto.CryptographicBuffer.convertStringToBinary(password, Crypto.BinaryStringEncoding.utf8);
        return provider.protectAsync(binary);
    };

    AccountDialog.prototype._switchToAddMode = function () {
        Debug.assert(this._fields.layoutMode === AccountDialogLayout.oauth, "Switching to add-mode is intended solely for the OAuth scenario");
        Debug.assert(this._dialogMode === AccountDialogMode.update || this._dialogMode === AccountDialogMode.updateSmtp);
        Debug.assert(Jx.isObject(this._account));

        this._dialogMode = AccountDialogMode.add;

        var dialogTitle = getCompoundString("actdlgTitle-OAuth", [Jx.escapeHtml(this._account.displayName)]);
        this._dialog.updateTitle(dialogTitle);

        this._template = this._account; // The existing account will serve as our template.
        this._account = null;
    };

    AccountDialog.prototype._initAccount = function (encryptedData) {
        var fields = this._fields;
        this._upgradedImapTemplate = null;

        if (fields.layoutMode === AccountDialogLayout.oauth && Jx.isNullOrUndefined(this._template)) {
            // The user is supposed to be updating the email of an existing account.
            // However, once we launch the OAuth dialog, we don't have any control over
            // what email address the user enters. He may decide to change it on us.
            // That's fine. We'll simply leave the existing account in the error state
            // and create a new one.
            if (this._account.emailAddress !== this._cachedOAuthData.emailAddress) {
                this._switchToAddMode();
            }
        }

        if (!Jx.isNullOrUndefined(this._template)) {
            var templateToUse = null;
            if ((this._template.accountType === Plat.AccountType.imapAccountFactory) && (fields.layoutMode === AccountDialogLayout.abbreviated)) {
                // Check to see if the user opted to upgrade to EAS, if it's available.
                if (fields.syncContactsAndCal) {
                    templateToUse = findEasUpsell(this._template, this._scenario);
                    Debug.assert(templateToUse);
                }

                if (!templateToUse) {
                    this._upgradedImapTemplate = templateToUse = this._platform.accountManager.getConnectableAccountByEmailDomain("IMAP", fields.email);
                    if (templateToUse && templateToUse.accountType === Plat.AccountType.popAccountFactory) {
                        return Plat.Result.cannotCreatePopAccounts;
                    }
                }
            }
            if (!Jx.isObject(templateToUse)) {
                templateToUse = this._template;
            }

            var email = fields.email;
            if (fields.layoutMode === AccountDialogLayout.oauth) {
                email = this._cachedOAuthData.emailAddress;
            }
            this._account = templateToUse.createConnectedAccount(email);
        } else {
            // This will ensure that the Platform excepts any changes we make to the account.
            this._account.getResourceByType(Plat.ResourceType.mail).isSyncNeeded = true;
        }

        var settings = getIncomingServerSettings(this._account);
        var smtpSettings = this._account.getServerByType(Plat.ServerType.smtp);
        switch (fields.layoutMode) {
            case AccountDialogLayout.fullImap:
                settings.useSsl = fields.useSsl;
                smtpSettings.server = fields.smtpServer;
                smtpSettings.port = fields.smtpPort;
                smtpSettings.useSsl = fields.smtpUseSsl;
                /* falls through */
            case AccountDialogLayout.full:
                settings.server = fields.server;
                settings.port = fields.port;
                /* falls through */
            case AccountDialogLayout.intermediate:
                settings.domain = fields.domain;
                settings.userId = fields.username;
                if (Jx.isObject(smtpSettings)) {
                    if (fields.smtpRequiresAuth && !fields.smtpReuseCreds) {
                        smtpSettings.userId = fields.smtpUsername;
                        smtpSettings.serverRequiresLogin = true;
                    } else {
                        smtpSettings.userId = fields.username;
                    }
                }
                break;
            case AccountDialogLayout.smtpOnly:
                smtpSettings.userId = fields.smtpUsername;
                break;
            case AccountDialogLayout.abbreviated:
            case AccountDialogLayout.oauth:
                // Ignore server settings in abbreviated or oauth mode.
                break;
        }
        if (encryptedData[0]) {
            if (fields.layoutMode !== AccountDialogLayout.oauth) {
                settings.setPasswordCookie(_base64Encode(encryptedData[0]));
            } else {
                this._account.setAuthTokens(_base64Encode(encryptedData[0])/*encryptedRefreshToken*/,
                                            _base64Encode(encryptedData[1])/*encryptedAccessToken*/,
                                            this._cachedOAuthData.accessTokenExpiry);
            }
        }

        if (Jx.isObject(smtpSettings)) {
            if (encryptedData[1]) {
                smtpSettings.setPasswordCookie(_base64Encode(encryptedData[1]));
            } else if (encryptedData[0]) {
                smtpSettings.setPasswordCookie(_base64Encode(encryptedData[0]));
            }
        }

        if (!Jx.isNonEmptyString(settings.server)) {
            // If there is no server, autodiscover should occur. Ensure that the initial auth result is
            // properly set.
            this._account.settingsResult = Plat.Result.autoDiscoveryNotAttempted;
        } else if (this._dialogMode === AccountDialogMode.update) {
            this._account.settingsResult = Plat.Result.serverNotAttempted;
        }

        if (this._ignorableCertErrorContent) {
            this._ignorableCertErrorContent.setAccount(this._account);
            var mailResource = this._account.getResourceByType(Plat.ResourceType.mail);
            // If the user has seen a message for an ignorable certificate error before--in this session of the dialog--
            // make the ignore flags on the account for all pertinent errors.
            if (this._ignorableCertErrorContent.expiredSeen) {
                settings.ignoreServerCertificateExpired = true; // Ignore this error.
                mailResource.serverCertificateExpired = false; // Clear the error, since we're ignoring it.

            }
            if (this._ignorableCertErrorContent.mismatchedDomainSeen) {
                settings.ignoreServerCertificateMismatchedDomain = true; // Ignore this error.
                mailResource.serverCertificateMismatchedDomain = false; // Clear the error, since we're ignoring it.
            }
            if (this._ignorableCertErrorContent.unknownCASeen) {
                settings.ignoreServerCertificateUnknownCA = true; // Ignore this error.
                mailResource.serverCertificateUnknownCA = false; // Clear the error, since we're ignoring it.
            }
        }

        // Is there a certificate that we need to try using from this account?
        if (this._hasAutoSelectedCertificate(fields.email)) {
            Debug.assert(settings.serverType === Plat.ServerType.eas, "It shouldn't be possible to get into this scenario for any but EAS accounts");

            if (settings.serverType === Plat.ServerType.eas) {
                settings.certificateThumbPrint = this._selectedCerts[fields.email].thumbPrint;

                var issuerList = this._issuerList;
                if (issuerList[fields.server] && issuerList[fields.server][fields.domain]) {
                    // Restore the issuer list.
                    settings.issuerList = issuerList[fields.server][fields.domain];
                }
            }
        }

        if ((this._dialogMode === AccountDialogMode.add) || (this._dialogMode === AccountDialogMode.addPrimary)) {
            // If possible, set the acount to 'push', otherwise default
            // to polling every 30 mins.
            if (this._platform.accountManager.canSetSyncTypePush()) {
                this._account.syncType = Plat.SyncType.push;
            } else {
                this._account.syncType = Plat.SyncType.poll;
                this._account.pollInterval = 30;
            }
        }
    };

    AccountDialog.prototype._updateBiciProperties = function () {
        ///<summary>Update the cached Bici properties</summary>

        if (this._dialogMode === AccountDialogMode.update) {
            return;
        }

        var configSource = P.Bici.ConfigSource.manual;
        var account = this._account || this._upgradedImapTemplate || this._template;
        var server = "";
        var hasServer = false;

        // Determine the SyncProtocol
        var serverType = Plat.ServerType.eas;
        var syncProtocol = P.Bici.SyncProtocol.eas;
        if (account.accountType === Plat.AccountType.imap || account.accountType === Plat.AccountType.imapAccountFactory) {
            serverType = Plat.ServerType.imap;
            syncProtocol = P.Bici.SyncProtocol.imap;
        } else if (account.accountType === Plat.AccountType.pop || account.accountType === Plat.AccountType.popAccountFactory) {
            serverType = Plat.ServerType.pop;
            syncProtocol = P.Bici.SyncProtocol.pop;
        }

        // Determine the Server Domain
        var settings = account.getServerByType(serverType);
        if (!Jx.isNullOrUndefined(settings)) {
            server = settings.server;
        }
        hasServer = Jx.isNonEmptyString(server);
        if (!hasServer) {
            var emailAddress = account.emailAddress || this._fields.email;
            if (Jx.isNonEmptyString(emailAddress)) {
                var emailParts = emailAddress.split("@");
                if (emailParts.length > 1) {
                    emailParts.shift();
                    server = emailParts.join("");
                }
            }
        }
        server = server.toLowerCase();
        
        if (this._fields.layoutMode === AccountDialogLayout.oauth) {
            configSource = P.Bici.ConfigSource.oauth2;
        } else {
            // Determine the Config Source
            switch (serverType) {
                case Plat.ServerType.eas:
                    if (hasServer && !settings.supportsAdvancedProperties) {
                        configSource = P.Bici.ConfigSource.catalogConfig;
                    } else if (hasServer) {
                        configSource = P.Bici.ConfigSource.manual;
                    } else if (Jx.isNonEmptyString(settings.domain) || (settings.userId !== account.emailAddress)) {
                        configSource = P.Bici.ConfigSource.autoDiscoverByUserDomain;
                    } else {
                        configSource = P.Bici.ConfigSource.autoDiscoverByEmail;
                    }
                    break;
                case Plat.ServerType.imap:
                    // assume manual, unless all of the settings are the same as on the imap template
                    configSource = P.Bici.ConfigSource.manual;
                    if (Jx.isObject(this._upgradedImapTemplate)) {
                        var templateSettings = this._upgradedImapTemplate.getServerByType(serverType);
                        var smtpSettings = account.getServerByType(Plat.ServerType.smtp);
                        var templateSmtpSettings = this._upgradedImapTemplate.getServerByType(Plat.ServerType.smtp);
                        if (Jx.isObject(templateSettings) && Jx.isObject(smtpSettings) && Jx.isObject(templateSmtpSettings) &&
                            (templateSettings.server === settings.server) && (templateSettings.port === settings.port) && (templateSettings.useSsl === settings.useSsl) &&
                            (templateSmtpSettings.server === smtpSettings.server) && (templateSmtpSettings.port === smtpSettings.port) && (templateSmtpSettings.useSsl === smtpSettings.useSsl)) {
                            configSource = P.Bici.ConfigSource.accountsConfig;
                        }
                    }
                    break;
                default:
                    configSource = P.Bici.ConfigSource.pop;
                    break;
            }
        }

        // Cache the new values
        this._bici.configSource = configSource;
        this._bici.server = server;
        this._bici.sourceId = account.sourceId;
        this._bici.syncProtocol = syncProtocol;
    };

    AccountDialog.prototype._logStep = function (result, startTime) {
        ///<summary>Called to log the results of an account step</summary>
        ///<param name="result" type="Plat.Result">The result of the attempt.</param>
        ///<param name="startTime" type="Plat.Result">The time the attempt started.</param>

        // Save the result, for later [ignore non-numbers, since that indicates an error in the input validation]
        if (Jx.isNumber(result)) {
            this._bici.result = result;

            // Log the step [if this was an account add attempt]
            if ((this._dialogMode !== AccountDialogMode.update) && (this._dialogMode !== AccountDialogMode.updateSmtp)) {
                var endTime = Date.now();
                var latency = endTime - startTime;
                Jx.bici.addToStream(Microsoft.WindowsLive.Instrumentation.Ids.Platform.accountDialogStep, this._bici.sourceId, this._bici.server, this._bici.syncProtocol, this._bici.result, this._bici.configSource, this._bici.entryPoint, latency);
                if (result !== Plat.Result.success &&
                    this._bici.syncProtocol === P.Bici.SyncProtocol.imap &&
                    this._bici.configSource === P.Bici.ConfigSource.accountsConfig) {
                    Jx.fault("AccountDialogIMAPFault", "accountdialog.js", result);
                }
            }
        }
    };

    AccountDialog.prototype._onOpened = function () {
        Jx.log.info("Opening account dialog.");

        if (Jx.isNullOrUndefined(this._inputPane)) {
            var inputPane = this._inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            inputPane.addEventListener("showing", this._keyboardShowingListener);
            inputPane.addEventListener("hiding", this._keyboardHidingListener);
        }
    };

    AccountDialog.prototype._onClosed = function () {
        Jx.log.info("Closing account dialog.");

        if (this._inputPane) {
            var inputPane = this._inputPane;
            inputPane.removeEventListener("showing", this._keyboardShowingListener);
            inputPane.removeEventListener("hiding", this._keyboardHidingListener);
        }

        // Cancel the promise if the user closes the dialog. If the promise has already completed
        // (either success or failure) then this is a no-op.
        if (!Jx.isNullOrUndefined(this._promise)) {
            this._promise.cancel();
        }

        // Log the overall dialog result [if this was an account add attempt]
        if ((this._dialogMode !== AccountDialogMode.update) && (this._dialogMode !== AccountDialogMode.updateSmtp)) {
            Jx.bici.addToStream(Microsoft.WindowsLive.Instrumentation.Ids.Platform.accountDialogOverall, this._bici.sourceId, this._bici.server, this._bici.syncProtocol, this._bici.result, this._bici.configSource, this._bici.entryPoint);
        }

        this.raiseEvent("closed");
    };

    AccountDialog.prototype._commitAccount = function () {
        var startDateTime = new Date();
        this._account.settingsChangedTime = startDateTime;
        var initialWaitPromise = P.Promises.waitForSettingsResult(this._account, startDateTime);
        return P.Promises.commitAndWaitForPromise(_timeoutThreshold, this._account, initialWaitPromise, "accountAdd_commit");
    };

    AccountDialog.prototype._mainDialogActionHandler = function () {
        ///<summary>Handler for the dialog's submit event and "connect" button.
        ///This merely calls the _mainAction() function, which in most cases will
        ///be _createAccount. However, in the OAuth flow, this can set to re-launch
        ///the OAuth dialog.</summary>
        Debug.assert(Jx.isFunction(this._mainAction));
        this._mainAction.call(this);
    };

    AccountDialog.prototype._createAccount = function () {
        Jx.mark("Accounts.AccountDialog._createAccount,StartTA,People");

        var startTime = Date.now();
        var that = this;

        this._promise =
            P.Promises.synchronousPromise(function () {
                return that._validateInput();
            }).then(function () {
                var fields = that._fields;
                
                var encryptionPromise1 = WinJS.Promise.wrap(null);
                var encryptionPromise2 = WinJS.Promise.wrap(null);

                if (fields.layoutMode !== AccountDialogLayout.oauth) {
                    // We need to encrypt the normal password, unless we are only updating the SMTP credentials
                    if (fields.layoutMode !== AccountDialogLayout.smtpOnly) {
                        encryptionPromise1 = that._encryptPassword(fields.password);
                    }

                    // We may need to encrypt the SMTP password as well.
                    if ((fields.layoutMode === AccountDialogLayout.smtpOnly) ||
                        ((fields.layoutMode === AccountDialogLayout.fullImap) && (fields.smtpRequiresAuth && !fields.smtpReuseCreds))) {
                        encryptionPromise2 = that._encryptPassword(fields.smtpPassword);
                    }
                } else {
                    encryptionPromise1 = that._encryptPassword(that._cachedOAuthData.refreshToken);
                    encryptionPromise2 = that._encryptPassword(that._cachedOAuthData.accessToken);
                }

                return WinJS.Promise.join([encryptionPromise1, encryptionPromise2]);

            }).then(function (encryptedData) {
                return P.Promises.synchronousPromise(function () {
                    var error = that._initAccount(encryptedData);
                    that._updateBiciProperties();
                    if (!Jx.isNullOrUndefined(error)) {
                        // In order for synchronousPromise() to handle the error properly,
                        // we need to return an Error object.
                        return new Error(error, error);
                    }
                });
            }).then(function () {
                // If a certificiate was auto-selected, and we're re-attempting connection,
                // we may need the user's permission to use this certificate. Invoke code that will
                // prompt the user if such is the case. Note: if the user declines to let us use the
                // certificate, we'll still let the account be added, but the user will have to pick the
                // correct certificate in account settings.
                if (that._hasAutoSelectedCertificate(that._fields.email)) {
                    return A.CertificateUtils.invokeCertificatePromptIfNeededAsync(that._selectedCerts[that._fields.email]);
                } else {
                    return WinJS.Promise.wrap(null);
                }
            }).then(function () {
                return that._commitAccount();
            }, function (err) {
                // The user denied us access to the auto-select certificate. Allow the
                // account-add to continue. It will fail and close the dialog, leaving the
                // account in an error state.
                if (err === A.CertPromptResult.accessDenied || err === A.CertPromptResult.failedToOpenKey) {
                    return that._commitAccount();
                }
                return WinJS.Promise.wrapError(err);
            }).then(function (authResult) {
                if (authResult === Plat.Result.serverNotAttempted) {
                    // The autodiscovery pass has completed. Wait for sync to finish.
                    var waitPromise = P.Promises.waitForPropertyChange(that._account, "settingsResult");
                    // There's a small window-of-opportunity in which the settingsResult could have changed,
                    // before we re-hooked our listener in the line above. Manually check for any changes below.
                    if (that._account.settingsResult !== Plat.Result.serverNotAttempted) {
                        waitPromise.cancel();
                        return that._account.settingsResult;
                    } else {
                        return P.Promises.errorIfTimeout(waitPromise, _timeoutThreshold);
                    }
                }
                return authResult;
            }).then(function (authResult) {
                if (authResult === Plat.Result.success) {
                    return;
                } else if (authResult === Plat.Result.e_NEXUS_APPLY_POLICY_NEEDED || authResult === Plat.Result.e_NEXUS_UNABLE_TO_COMPLY_WITH_POLICY) {
                    return;
                } else {
                    return WinJS.Promise.wrapError(authResult);
                }
            }).then(function () {
                Jx.mark("Accounts.AccountDialog._createAccount,StopTA,AccountDialog");
                Jx.log.info("Account add success");
                that._setSyncType();
                that._logStep(Plat.Result.success, startTime);
                Jx.EventManager.fireDirect(null, A.AccountDialogEvents.newAccountAdded, { account: that._account });
                that._launchContactsFlowIfNeeded();
                that._purgeDuplicateIfNeeded();
                that.wasSuccess = true;
                that._dialog.close();
            }, function (err) {
                Jx.mark("Accounts.AccountDialog._createAccount,StopTA,AccountDialog");
                that._logStep(err, startTime);
                that._failure(err);
            }

            );
    };

    AccountDialog.prototype._closeWithCertSelectionNeeded = function () {
        Jx.log.info("Closing with cert selection neeeded.");

        this._account.settingsResult = Plat.Result.certSelectionNeeded;
        this._account.commit();

        this.wasSuccess = true;
        this._dialog.close();
    };

    AccountDialog.prototype._failure = function (err) {
        Jx.log.error("Account add failure: " + err);

        var postFailureOp = Jx.fnEmpty,
            deleteAccountOnFailure = true;

        // If the failure occurs because of a user-cancel, we
        // won't be in the DOM anymore at this point. So, skip
        // the DOM operations.
        if (this._dialog.hasUI()) {
            var errMsg = "";
            var showErrorMsg = true;
            var errorMessageContent = null;
            if (this._account) {
                var fields = this._fields;
                // If we started with an IMAP upsell, we might have upgraded based on the Platform lookup,
                // to a specific upsell, like Gmail. In such cases, we want to apply the alternate upsell's properties
                // to the dialog fields, in case we are about to show the full mode. Also, this will ensure the add-contact-and-calendar
                // checkbox appears for Gmail.
                if (!Jx.isNullOrUndefined(this._upgradedImapTemplate) && (fields.layoutMode === AccountDialogLayout.abbreviated)) {
                    fields.reapplyAccount(this._upgradedImapTemplate);
                }

                // Convert err structure to a number (if this isn't already a number)
                if (!Jx.isNumber(err) && err && err.number) {
                    err = err.number;
                }

                if (err === Plat.Result.e_HTTP_SERVICE_UNAVAIL || err === Plat.Result.e_HTTP_GATEWAY_TIMEOUT) {
                    errMsg = getCompoundString("actdlgServiceUnavailableError", [Jx.escapeHtml(this._account.emailAddress)]);
                } else if (err === -2067070966 /*LMCSTORE_E_DUPLICATE_INDEXED_ID*/ || err === Plat.Result.cannotAddAliasOfMicrosoftAccount) {
                    // We attempted to add the same account twice. Inform the user of the "error"
                    errMsg = getString("actdlgDuplicateAccountError");

                    if (fields.layoutMode === AccountDialogLayout.oauth) {
                        this._mainAction = this._launchOAuthFlow.bind(this, this._account.emailAddress);
                    }
                } else if ((err === Plat.Result.e_HTTP_DENIED || err === Plat.Result.ixp_E_IMAP_LOGINFAILURE || err === Plat.Result.cannotMakeMicrosoftAccountAsPrimaryAccount) && !this._badCredsErrAlreadySeen) {
                    // The user-entered crendentials were bad. Tell the user this,
                    // and don't fallback, if we're not already in full mode.
                    if (this._dialogMode === AccountDialogMode.addPrimary) {
                        errMsg = getCompoundString("actdlgBadWorkCredentialsError", [Jx.escapeHtml(this._accountName)]);
                    } else {
                        errMsg = getString("actdlgBadCredentialsError");
                    }

                    
                    if (fields.layoutMode === AccountDialogLayout.oauth) {
                        // If this in an OAuth account, check to see if the account still supports OAuth.
                        if (!this._account.supportsOAuth) {
                            Jx.log.info("This account no longer supports OAuth. Downgrading the dialog to basic auth.");
                            this._fallbackToBasicAuth();
                        } else {
                            // OAuth is still supported for this account. Set the main action
                            // to re-launch the OAuth flow.
                            this._mainAction = this._launchOAuthFlow.bind(this, this._account.emailAddress);
                        }
                    } else {
                        this._badCredsErrAlreadySeen = true;
                    }
                } else if (err === Plat.Result.credentialMissing) {
                    // If this in an OAuth account, check to see if the account still supports OAuth.
                    if (fields.layoutMode === AccountDialogLayout.oauth && !this._account.supportsOAuth) {
                        Jx.log.info("This account no longer supports OAuth. Downgrading the dialog to basic auth.");
                        this._fallbackToBasicAuth();
                    }
                } else if (err === Plat.Result.e_GOOGLE_APPS) {
                    // The user tried to connect to a Google server via EAS, but
                    // Google doesn't allow EAS accounts anymore.
                    errMsg = getString("actdlgGmailEasNotSupportedError");
                } else if (err === Plat.Result.certUntrustedRoot || err === Plat.Result.invalidServerCertificate) {
                    errMsg = getString("actdlgCertMissingError");
                } else if (err === Plat.Result.e_SYNC_IGNORABLE_SERVER_CERT_FAILURE) {

                    // An ignorable certificate error has been found. Create an extended
                    // error message for the user.
                    if (!this._ignorableCertErrorContent) {
                        this._ignorableCertErrorContent = new IgnorableCertErrorContent();
                        this._ignorableCertErrorContent.setAccount(this._account);
                    }

                    this._ignorableCertErrorContent.updateError();
                    errorMessageContent = this._ignorableCertErrorContent;
                } else if (err === Plat.Result.e_SYNC_CBA_FAILED) {
                    // If we hit a certificate-base-authenticate error, check to
                    // see if we've already tried to auto-select a certificate.
                    if (!this._hasAutoSelectedCertificate(this._account.emailAddress)) {
                        // We haven't hit this error yet for this account, attempt to auto-select a certificate.
                        var result = this._autoSelectCert();
                        showErrorMsg = false;
                        if (result === AutoSelectCertResult.noCerts) {
                            Jx.log.error("Auto-selecting certificate failed: no certs found.");
                            errMsg = getString("actdlgCertMissingError");
                            showErrorMsg = true;
                        } else if (result === AutoSelectCertResult.multipleSubjects) {
                            Jx.log.error("Auto-selecting certificate failed: multiple subjects.");
                            // There are multitple valid certificates on the machine, assigned to
                            // different users. We can't proceed without the user explicitly picking
                            // a cert. Leave the account in error state, and close the dialog.
                            postFailureOp = this._closeWithCertSelectionNeeded;
                            deleteAccountOnFailure = false;
                        } else {
                            Debug.assert(result === AutoSelectCertResult.success);
                            Jx.log.info("Auto-selecting a certificate, and re-attempting account connection.");
                            // We potentially-valid certificate was found. Attempt to reconnect on
                            // the user's behalf.
                            postFailureOp = this._createAccount;
                        }
                    } else {
                        Jx.log.error("Reconnection attempted failed after auto-selecting certificate.");
                        // We've already auto-selected a certficate and attempted a re-connect,
                        // with the same error. We're not going to attempt to auto-select a different
                        // cert. Exit out of the dialog.
                        postFailureOp = this._closeWithCertSelectionNeeded;
                        deleteAccountOnFailure = false;
                    }
                } else if (err === -2147023674 /*network not present*/ || A.cannotConnectToNetwork()) {
                    errMsg = getString("actdlgNoInternetError");
                } else if (err === Plat.Result.e_NEXUS_STATUS_MAXIMUM_DEVICES_REACHED) {
                    errMsg = Jx.res.getString("/messagebar/messageBarDeviceLimitReached");
                } else {
                    var account = this._template || this._account;
                    if (fields.layoutMode === AccountDialogLayout.oauth) {
                        errMsg = getCompoundString("actdlgOAuthUnknownError", Jx.escapeHtml(account.displayName));
                    } else {
                      var serverType = Plat.ServerType.eas;
                      if (account.accountType === Plat.AccountType.imap || account.accountType === Plat.AccountType.imapAccountFactory) {
                          serverType = Plat.ServerType.imap;
                      }
                      var settings = account.getServerByType(serverType);
                      // Not all upsells support manually setting the server address, or a domain.
                      // In such cases, do not show the full dialog.
                      if (settings.supportsAdvancedProperties || (this._dialogMode === AccountDialogMode.addPrimary)) {
                          if ((fields.layoutMode !== AccountDialogLayout.full) || (fields.layoutMode !== AccountDialogLayout.fullImap)) {
                              if ((serverType !== Plat.ServerType.imap) && (fields.layoutMode === AccountDialogLayout.abbreviated)) {
                                  errMsg = getCompoundString("actdlgAutoDiscoveryInitialFailure", [Jx.escapeHtml(fields.email)]);
                                  fields.updateLayout(AccountDialogLayout.intermediate);
                              } else if ((serverType === Plat.ServerType.imap) || (fields.layoutMode === AccountDialogLayout.intermediate)) {
                                  fields.updateLayout((this._account.accountType === Plat.AccountType.imap) ? AccountDialogLayout.fullImap : AccountDialogLayout.full);
                                  errMsg = getCompoundString("actdlgAutoDiscoveryUtterFailure", [Jx.escapeHtml(fields.email)]);
                              }
                          }
                      }
                   }
                }
            }

            if (showErrorMsg) {
                if (errorMessageContent) {
                    this._fields.showBarricadeError(errorMessageContent);
                } else {
                    this._fields.ensureValidFocus();
                    var buttonText = (this._fields.layoutMode === AccountDialogLayout.oauth ? getString("actdlgTryAgain") : "");
                    this._fields.showError(errMsg, buttonText);
                }
            }
        }

        // If we're dealing with adding an new account (i.e. we have an upsell),
        // don't leave stray accounts in the DB if a failure happens after commit
        if (deleteAccountOnFailure && (this._dialogMode !== AccountDialogMode.update) && (this._dialogMode !== AccountDialogMode.updateSmtp)) {
            Debug.assert(this._template);
            var accountCopy = this._account;
            this._account = null;
            if (accountCopy && accountCopy.canDelete) {
                accountCopy.deleteObject();
            }
        }

        postFailureOp.call(this);
    };

    AccountDialog.prototype._setSyncType = function () {
        // If this is an IMAP account, make sure the sync type is set to polling if the account can't support push
        if (this._account.accountType === Plat.AccountType.imap) {
            var imapSettings = this._account.getServerByType(Plat.ServerType.imap);
            Debug.assert(Jx.isObject(imapSettings));
            if (Jx.isObject(imapSettings)) {
                if (!imapSettings.pushSupported) {
                    this._account.syncType = Plat.SyncType.poll;
                    this._account.pollInterval = 30;
                    this._account.commit();
                }
            }
        }
    };

    AccountDialog.prototype._autoSelectCert = function () {
        // Queries for the list of available certificates on the users machines,
        // and attempts to auto-select the best one to use for connecting.
        var certs = this._platform.accountManager.queryForCertificateCollection(this._account);
        if (Jx.isObject(certs)) {
            // If there are multiple pontentailly-valid certificates for this source assigned to
            // more than one user, we can't safely auto-select a certificate.
            if (certs.hasMultipleSubjects) {
                return AutoSelectCertResult.multipleSubjects; // failed to auto-select
            } else if (certs.count > 0) {
                // There were multiple potentially-valid certificates, select the first one
                // from the list. Note: certificates are sorted based on expiry date. So,
                // we're guaranteed to get the one which will expire last.
                var cert = certs.item(0);
                // cache the auto-selected cert to be used on re-connect attempt
                this._selectedCerts = this._selectedCerts || {};
                this._selectedCerts[this._account.emailAddress] = cert;

                // We also need to cache the issuer list.
                var settings = getIncomingServerSettings(this._account);
                var issuerList = this._issuerList = this._issuerList || {};
                issuerList[settings.server] = issuerList[settings.server] || {};
                issuerList[settings.server][settings.domain] = settings.issuerList;

                return AutoSelectCertResult.success;
            }
        }

        return AutoSelectCertResult.noCerts; // auto-select failed.
    };

    AccountDialog.prototype._hasAutoSelectedCertificate = function (emailAddress) {
        // Checks if a certificate has been auto-selected for this account. Note: this is not
        // meant to tell us if the certificate on a currently connected account was added
        // as the result of auto-selection.
        return Jx.isObject(this._selectedCerts) && Jx.isObject(this._selectedCerts[emailAddress]);
    };

    AccountDialog.prototype._launchContactsFlowIfNeeded = function () {
        ///<summary>Invoked after successful connection of the account. Checks to see
        ///if there is a PSA connection that should be launched.</summary>
        var account = this._account;
        Debug.assert(account);
        // Don't perform this check/operation for any scenario but 'add'.
        // We shouldn't have this state any other way.
        if (account && (account.accountType === Plat.AccountType.imap) && (this._dialogMode === AccountDialogMode.add)) {
            var otherSupportedUpsells = account.getOtherConnectableAccounts(Plat.ApplicationScenario.people);
            if (otherSupportedUpsells && otherSupportedUpsells.count > 0) {
                // Look if an upsell is interesting to us
                for (var i = 0; i < otherSupportedUpsells.count; i++) {
                    var candidateUpsell = otherSupportedUpsells.item(i);
                    if (candidateUpsell && candidateUpsell.accountType === Plat.AccountType.withoutPlugins) {
                        var contactsResource = candidateUpsell.getResourceByType(Plat.ResourceType.contactAgg);
                        if (contactsResource && !contactsResource.isEnabled) {
                            var launcher = new People.Accounts.FlowLauncher(this._platform, Plat.ApplicationScenario.people);
                            launcher.launchManageFlow(candidateUpsell);
                            break;
                        }
                    }
                }
            }
        }
    };

    AccountDialog.prototype._purgeDuplicateIfNeeded = function () {
        ///<summary>Invoked after successful connection of the account. Checks to see
        ///if there's already duplicate account of a less type which should be purged.
        ///This is the cover the scenario where a user connects Gmail via IMAP, then
        /// later via EAS.</summary>
        var account = this._account;
        Debug.assert(account);
        // Don't perform this check/operation for any scenario but 'add'.
        // We shouldn't have this state any other way.
        if (account && !account.isEasi && (account.accountType === Plat.AccountType.eas) && (this._dialogMode === AccountDialogMode.add)) {

            var connectedAccounts = this._platform.accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.mail, Plat.ConnectedFilter.normal, Plat.AccountSort.name);
            for (var i = 0, count = connectedAccounts.count; i < count; i++) {
                var connectedAccount = connectedAccounts.item(i);
                if ((!connectedAccount.isDefault) &&
                    (connectedAccount.emailAddress === account.emailAddress) &&
                    (connectedAccount.accountType === Plat.AccountType.imap)) {
                    // Found an IMAP account for with the same email address as the EAS one
                    // that we just added. Eliminate the IMAP one.
                    connectedAccount.deleteObject();

                    // If the IMAP account was using the last push slot, we can switch the new account to push in its place
                    if ((Plat.SyncType.poll === account.syncType) && this._platform.accountManager.canSetSyncTypePush()) {
                        this._account.syncType = Plat.SyncType.push;
                        this._account.commit();
                    }
                    break;
                }
            }
        }
    };

    var AccountFields = A.AccountFields = function (account, descriptionText, mode, scenario, suggestedEmailAddress, layoutMode) {
        ///<summary>Content body containing the input fields for the account dialog</summary>
        ///<param name="account" type="Plat.Account"/>
        ///<param name="descriptionText" type="String"/>
        ///<param name="mode" type="AccountDialogMode"/>
        // <param name="scenario" type="Plat.ApplicationScenario" optional="true">This is currently only need for the addition scenario</param>
        // <param name="suggestedEmailAddress" type="String" optional="true">Optional override for the email-address field's value. Without this, we'll use account.emailAdress</param>
        this.initComponent();
        this._account = account;
        this._descriptionText = descriptionText;
        this._layoutMode = layoutMode;
        this._previousLayoutMode = this._layoutMode;
        this._mode = mode;
        this._allowEmailEditing = (mode !== AccountDialogMode.update),
        this._isImap = Jx.isObject(this._account.getServerByType(Plat.ServerType.imap));
        this._scenario = scenario;
        this._emailAddress = suggestedEmailAddress || account.emailAddress;
    };
    Jx.augment(AccountFields, Jx.Component);

    AccountFields.prototype.getUI = function (ui) {
        ///<summary>Creates the input fields for each of the account properties</summary>
        ///<param name="ui" type="Object">Contains html and css strings</param>
        var account = this._account;
        this._id = "actdlgFields" + Jx.uid();

        function getServerHtml(serverInputId, serverLabelId, classNames) {
            return "<div id='" + serverInputId + "Label' class='" + classNames + "' role='sectionhead'>" + getString(serverLabelId) + "</div>" +
                       "<div class='actdlg-input " + classNames + "'  data-fullLayout='true'><input id='" + serverInputId + "' aria-labelledby='" + serverInputId + "Label' type='url' maxlength='64'></div>";
        }
        function getServerAndPortHtml(serverInputId, serverLabelId, portInputId) {
            return "<div class='floatLeft showInFullImap hidden'>" +
                        getServerHtml(serverInputId, serverLabelId, "") +
                    "</div>" +
                    "<div class='floatRight showInFullImap hidden'>" +
                        "<div id='" + portInputId + "Label' role='sectionhead'>" + getString("actdlgPortLabel") + "</div>" +
                        "<div class='actdlg-portInput'><input id='" + portInputId + "' aria-labelledby='" + portInputId + "Label' type='number' maxlength='5'></div>" +
                    "</div>" +
                    "<div class='clear'></div>";
        }

        ui.html =
            "<div id='" + this._id + "'>" +
                "<div id='actdlgFieldsContainer'>" +
                    "<div id='dlgDescription' class='actdlg-description' role='heading'>" + Jx.escapeHtml(this._descriptionText) + "</div>" +
                /* Status/Error */
                    "<div id='actdlgStatus'><progress id='actdlgProgress' class='hidden spinner showInProgress' role='progressbar' aria-describeby='actdlgStatusText'></progress><span id='actdlgStatusText' role='status' aria-live='polite'></span></div>" +
                /* Email address */
                    "<div id='actdlgEmailLabel' class='showInAbbreviated showInIntermediate showInFull showInFullImap hidden' role='sectionhead' >" + getString("actdlgEmailLabel") + "</div>" +
                    "<div class='actdlg-input showInAbbreviated showInIntermediate showInFull showInFullImap hidden'><input id='actdlgEmail' aria-labelledby='actdlgEmailLabel' type='email' value='" + Jx.escapeHtml(this._emailAddress) + "' maxlength='100' " + (this._allowEmailEditing ? "" : "readonly") + "></div>" +
                /* Server */
                    getServerHtml("actdlgServer", "actdlgServerLabel", "showInFull hidden") +
                /* Domain */
                    "<div id='actdlgDomainLabel' class='showInIntermediate showInFull hidden' role='sectionhead'>" + getString("actdlgDomainLabel") + "</div>" +
                    "<div class='actdlg-input showInIntermediate showInFull hidden'><input id='actdlgDomain' aria-labelledby='actdlgDomainLabel' type='text' maxlength='256'></div>" +
                /* Username */
                    "<div id='actdlgUsernameLabel' class='showInIntermediate showInFull showInFullImap hidden' role='sectionhead'>" + getString("actdlgUsernameLabel") + "</div>" +
                    "<div class='actdlg-input showInIntermediate showInFull showInFullImap hidden'><input id='actdlgUsername' aria-labelledby='actdlgUsernameLabel' type='text' maxlength='64'></div>" +
                /* Password */
                    "<div id='actdlgPasswordLabel' class='showInAbbreviated showInIntermediate showInFull showInFullImap hidden' role='sectionhead'>" + getString("actdlgPasswordLabel") + "</div>" +
                    "<div class='actdlg-input showInAbbreviated showInIntermediate showInFull showInFullImap hidden'><input id='actdlgPassword' aria-labelledby='actdlgPasswordLabel' type='password' maxlength='256'></div>" +
                /* Add Google Contacts and Calendar*/
                        "<label class='showOnlyInAbbreviated hidden actdlg-checkbox'><input id='actdlgSyncContactsAndCal' class='actdlg-checkbox-input' type='checkbox' aria-label='" + Jx.escapeHtml(getCompoundString("actdlgContactsAndCal", [account.displayName])) + "'>" + Jx.escapeHtml(getCompoundString("actdlgContactsAndCal", [account.displayName])) + "</label>" +
                /* IMAP Server and Port */
                    getServerAndPortHtml("actdlgImapServer", "actdlgImapServerLabel", "actdlgPort") +
                /* IMAP Use SSL*/
                        "<div class='actdlg-checkbox showInFullImap hidden' role='sectionhead'><label><input id='actdlgUseSsl' class='actdlg-checkbox-input' type='checkbox' aria-label='" + Jx.escapeHtml(getString("actdlgImapSslLabel")) + "'>" + getString("actdlgImapSslLabel") + "</label></div>" +
                /* SMTP Server and Port */
                    getServerAndPortHtml("actdlgSmtpServer", "actdlgSmtpServerLabel", "actdlgSmtpPort") +
                /* SMTP Use SSL*/
                        "<div class='actdlg-checkbox showInFullImap hidden' role='sectionhead'><label><input id='actdlgSmtpUseSsl' class='actdlg-checkbox-input' type='checkbox' aria-label='" + Jx.escapeHtml(getString("actdlgSmtpSslLabel")) + "'>" + getString("actdlgSmtpSslLabel") + "</label></div>" +
                /* SMTP Requires Auth*/
                        "<div class='actdlg-checkbox showInFullImap hidden' role='sectionhead'><label><input id='actdlgSmtpRequiresAuth' class='actdlg-checkbox-input' type='checkbox' aria-label='" + Jx.escapeHtml(getString("actdlgSmtpRequiresAuthLabel")) + "' checked>" + getString("actdlgSmtpRequiresAuthLabel") + "</label></div>" +
                /* SMTP Re-use Creds*/
                        "<div class='actdlg-checkbox showInFullImap hidden' role='sectionhead'><label><input id='actdlgSmtpReuseCreds' class='actdlg-checkbox-input' type='checkbox' aria-label='" + Jx.escapeHtml(getString("actdlgSmtpReuseCredsLabel")) + "' checked>" + getString("actdlgSmtpReuseCredsLabel") + "</label></div>" +
                /* SMTP Username */
                    "<div id='actdlgSmtpCredsHeaderLabel' class='showInDontReuseCreds hidden' role='sectionhead'>" + getString("actdlgSmtpCredsHeaderLabel") + "</div>" +
                    "<div id='actdlgSmtpUsernameLabel' class='showInDontReuseCreds hidden' role='sectionhead'>" + getString("actdlgSmtpUsernameLabel") + "</div>" +
                    "<div class='actdlg-input showInDontReuseCreds hidden'><input id='actdlgSmtpUsername' aria-labelledby='actdlgSmtpUsernameLabel' type='text' maxlength='64'></div>" +
                /* SMTP Password */
                    "<div id='actdlgSmtpPasswordLabel' role='sectionhead' class='showInDontReuseCreds hidden'>" + getString("actdlgPasswordLabel") + "</div>" +
                    "<div class='actdlg-input showInDontReuseCreds hidden'><input id='actdlgSmtpPassword' aria-labelledby='actdlgSmtpPasswordLabel' type='password' maxlength='256'></div>" +
                /* Advanced link */
                    "<div class='actdlg-link hidden'><a id='actdlgShowAdvancedLink' tabIndex='0' aria-live='polite'>" + getString("actdlgSeeMore") + "</a></div>" +
                "</div>" +
                "<div id='actdlgBarricadeError'></div>" +
            "</div>";
    };

    AccountFields.prototype.activateUI = function () {
        ///<summary>Sets the localized placeholder text once the UI is created</summary>
        var inputs = this._inputs = {
            email: document.getElementById("actdlgEmail"),
            server: document.getElementById("actdlgServer"),
            port: document.getElementById("actdlgPort"),
            domain: document.getElementById("actdlgDomain"),
            username: document.getElementById("actdlgUsername"),
            password: document.getElementById("actdlgPassword"),
            imapServer: document.getElementById("actdlgImapServer"),
            smtpServer: document.getElementById("actdlgSmtpServer"),
            smtpPort: document.getElementById("actdlgSmtpPort"),
            smtpUsername: document.getElementById("actdlgSmtpUsername"),
            smtpPassword: document.getElementById("actdlgSmtpPassword")
        };
        var checkBoxes = this._checkBoxes = {
            ssl: document.getElementById("actdlgUseSsl"),
            smtpSsl: document.getElementById("actdlgSmtpUseSsl"),
            smtpRequiresAuth: document.getElementById("actdlgSmtpRequiresAuth"),
            smtpReuseCreds: document.getElementById("actdlgSmtpReuseCreds"),
            syncContactsAndCal: document.getElementById("actdlgSyncContactsAndCal")
        };
        this._status = document.getElementById("actdlgStatus");
        this._statusText = document.getElementById("actdlgStatusText");
        this._progress = document.getElementById("actdlgProgress");
        this._advancedLink = document.getElementById("actdlgShowAdvancedLink");
        this._descriptionText = document.getElementById("dlgDescription");
        this._container = document.getElementById(this._id);

        this._advancedLink.addEventListener("click", this._onAdvancedLink.bind(this), false);
        this._advancedLink.addEventListener("keydown", function (ev) { if (ev.key === "Spacebar" || ev.key === "Enter") { this._onAdvancedLink(ev); } } .bind(this), false);

        checkBoxes.smtpRequiresAuth.addEventListener("change", function () {
            checkBoxes.smtpReuseCreds.disabled = checkBoxes.smtpRequiresAuth.checked ? "" : "disabled";
            this._updateSmtpCredInputsVisiblity();
        } .bind(this));
        checkBoxes.smtpReuseCreds.addEventListener("change", this._updateSmtpCredInputsVisiblity.bind(this));
        checkBoxes.syncContactsAndCal.addEventListener("change", function () {
            this._isImap = (Jx.isObject(this._account.getServerByType(Plat.ServerType.imap)) && !this.syncContactsAndCal);
        } .bind(this));

        checkBoxes.ssl.addEventListener("change", function () {
            inputs.port.value = checkBoxes.ssl.checked ? 993 : 143;
        });
        checkBoxes.smtpSsl.addEventListener("change", function () {
            inputs.smtpPort.value = checkBoxes.smtpSsl.checked ? 465 : 25;
        });

        // Ensure the initial values of the controls are correct.
        this._reset();

        this.updateLayout(this._layoutMode);

        // This trap corresponds to our custom OSK handling which traps the pointer-down event
        // when the keyboard is up to prevent it from dismissing when the users scrolls/pans. This
        // code here makes sure the user can still set focus to the dialog fields.
        var stopEventPropagation = function (ev) { ev.stopPropagation(); };
        for (var name in inputs) {
            inputs[name].addEventListener("MSPointerDown", stopEventPropagation, false);
        }

        var focusWatcher = function () {
            // The user--presumably--changed the focus before the focus timer expired. Clear the timer
            // so we don't override the user's desired input focus.
            var activateElement = document.activeElement;
            for (var name in inputs) {
                if (inputs[name] === activateElement) {
                    clearTimeout(focusTimerID);
                    document.removeEventListener("focus", focusWatcher, true);
                    break;
                }
            }
        };
        document.addEventListener("focus", focusWatcher, true);

        // IE has a bug which causes the input focus does not work properly set when
        // when we set the focus immediately. This is the workaround they suggested.
        var focusTimerID = setTimeout(function () {
            this.ensureValidFocus();
            document.removeEventListener("focus", focusWatcher, true);
        } .bind(this), 100);

        this._activated = true;

        Jx.Component.prototype.activateUI.call(this);
    };

    Object.defineProperty(AccountFields.prototype, "email", {
        get: function () { return this._inputs.email.value; },
        set: function (value) { this._inputs.email.value = value; }
    });
    Object.defineProperty(AccountFields.prototype, "server", {
        get: function () { return (!this._isImap ? this._inputs.server.value : this._inputs.imapServer.value); }
    });
    Object.defineProperty(AccountFields.prototype, "port", {
        get: function () { return this._inputs.port.value; }
    });
    Object.defineProperty(AccountFields.prototype, "useSsl", {
        get: function () { return this._checkBoxes.ssl.checked; }
    });
    Object.defineProperty(AccountFields.prototype, "domain", {
        get: function () { return this._inputs.domain.value; }
    });
    Object.defineProperty(AccountFields.prototype, "username", {
        get: function () { return this._inputs.username.value; }
    });
    Object.defineProperty(AccountFields.prototype, "password", {
        get: function () { return this._inputs.password.value; }
    });
    Object.defineProperty(AccountFields.prototype, "smtpServer", {
        get: function () { return this._inputs.smtpServer.value; }
    });
    Object.defineProperty(AccountFields.prototype, "smtpPort", {
        get: function () { return this._inputs.smtpPort.value; }
    });
    Object.defineProperty(AccountFields.prototype, "smtpUsername", {
        get: function () { return this._inputs.smtpUsername.value; }
    });
    Object.defineProperty(AccountFields.prototype, "smtpPassword", {
        get: function () { return this._inputs.smtpPassword.value; }
    });
    Object.defineProperty(AccountFields.prototype, "smtpUseSsl", {
        get: function () { return this._checkBoxes.smtpSsl.checked; }
    });
    Object.defineProperty(AccountFields.prototype, "smtpRequiresAuth", {
        get: function () { return this._checkBoxes.smtpRequiresAuth.checked; }
    });
    Object.defineProperty(AccountFields.prototype, "smtpReuseCreds", {
        get: function () { return this._checkBoxes.smtpReuseCreds.checked; }
    });
    Object.defineProperty(AccountFields.prototype, "syncContactsAndCal", {
        get: function () { return this._checkBoxes.syncContactsAndCal.checked; }
    });
    Object.defineProperty(AccountFields.prototype, "layoutMode", {
        get: function () { return this._layoutMode; }
    });

    AccountFields.prototype.setDialogButtons = function (addButton, closeButton) {
        ///<summary>Passes in the connect and cancel buttons of the dialog</summary>
        ///<param name="addButton" type="P.DialogButton"/>
        ///<param name="closeButton" type="P.DialogButton"/>
        this._addButton = addButton;
        this._closeButton = closeButton;
    };

    AccountFields.prototype.showProgress = function () {
        ///<summary>Displays sync text when starting to add an account</summary>
        var errorPlaceholder = this._container.querySelector("#actdlgBarricadeError");
        // If a barricade error was showing, we need to do some additional update to the dialog state.
        if (errorPlaceholder.hasChildNodes()) {
            Debug.assert(Jx.isHTMLElement(this._fields));

            // Show the fields.
            Jx.removeClass(this._fields, "hidden");

            // Clear out the barricade error.
            errorPlaceholder.innerHTML = "";

            // Restore the dialog buttons to their defaults.
            this._addButton.value = getString("actdlgAdd");
            this._addButton.type = "submit";
            this._closeButton.type = "button";
        }

        this._addButton.disabled = true;
        this._checkBoxes.syncContactsAndCal.disabled = true;
        Jx.addClass(this._status, "dlg-progress");
        Jx.addClass(this._descriptionText, "hidden");
        Jx.removeClass(this._status, "dlg-error");

        if (this._layoutMode === AccountDialogLayout.oauth) {
            this._statusText.innerText = getString("actdlgStatus-OAuth");
            // We don't show the "connect" button in this layout during progress,
            // because the user doesn't click it to start the flow.
            this._addButton.hide(true);
        } else if ((this._mode === AccountDialogMode.update) || (this._mode === AccountDialogMode.updateSmtp)) {
            this._statusText.innerText = getString("actdlgStatus-Updating");
        } else {
            this._statusText.innerText = getString("actdlgStatus");
        }
        this._statusText.scrollIntoView();
    };

    AccountFields.prototype.showError = function (errorText, buttonText) {
        ///<summary>Displays an error if something fails with adding the account</summary>
        ///<parameter name="errorText" type="String" optional="true"/>
        ///<parameter name="buttonText" type="String" optional="true"/>
        this._addButton.value = buttonText || getString("actdlgAdd");
        this._addButton.hide(false);
        this._addButton.disabled = false;
        this._checkBoxes.syncContactsAndCal.disabled = false;
        Jx.addClass(this._status, "dlg-error");
        Jx.addClass(this._descriptionText, "hidden");
        Jx.removeClass(this._status, "dlg-progress");

        this._statusText.innerHTML = errorText || getString("actdlgError");
        this._statusText.scrollIntoView();
    };

    AccountFields.prototype.showBarricadeError = function (errorContent) {
        ///<summary>Displays an error, and hides the other dialog fields.</summary>
        ///<parameter name="errorContent" type="Jx.Component"/>
        Jx.removeClass(this._status, "dlg-progress");

        var errorPlaceholder = this._container.querySelector("#actdlgBarricadeError");
        var fields = this._fields = this._container.querySelector("#actdlgFieldsContainer");

        // Hide the input controls.
        Jx.addClass(fields, "hidden");

        // Show the barricade error content.
        errorPlaceholder.innerHTML = Jx.getUI(errorContent).html;
        errorContent.activateUI();

        // For Narrator, set the error text.
        this._statusText.innerText = errorContent.getErrorSummaryText();

        // Update the dialog buttons, so that "cancel" is the default action.
        this._addButton.disabled = false;
        this._addButton.hide(false);
        this._addButton.value = getString("actdlgConnectAnyway");
        this._addButton.type = "button";
        this._closeButton.type = "submit";
        this._closeButton.focus();
    };

    AccountFields.prototype.updateLayout = function (layoutMode) {
        ///<summary>Hides/shows dialog fields based on the given layout-mode</summary>
        ///<parameter name="layoutMode" type="AccountDialogLayout"/>
        var dlg = document.getElementById("dlg-box");
        switch (layoutMode) {
            case AccountDialogLayout.abbreviated:
                ["intermediate", "full", "fullImap", "dontReuseCreds", "oauth"].forEach(function (className) { Jx.removeClass(dlg, className); });
                Jx.addClass(dlg, "abbreviated");
                this._advancedLink.innerText = getString("actdlgSeeMore");
                break;
            case AccountDialogLayout.intermediate:
                ["full", "fullImap", "oauth"].forEach(function (className) { Jx.removeClass(dlg, className); });
                Jx.addClass(dlg, "intermediate");
                this._advancedLink.innerText = getString("actdlgSeeMore");
                break;
            case AccountDialogLayout.full:
                Debug.assert(this._layoutMode !== AccountDialogLayout.fullImap);
                Jx.addClass(dlg, "full");
                this._advancedLink.innerText = getString("actdlgSeeLess");
                break;
            case AccountDialogLayout.fullImap:
                Debug.assert(this._layoutMode !== AccountDialogLayout.full);
                Jx.addClass(dlg, "fullImap");
                this._advancedLink.innerText = getString("actdlgSeeLess");
                break;
            case AccountDialogLayout.smtpOnly:
                ["abbreviated", "intermediate", "full", "fullImap", "oauth"].forEach(function (className) { Jx.removeClass(dlg, className); });
                Jx.addClass(dlg, "dontReuseCreds");
                this._advancedLink.innerText = getString("actdlgSeeMore");
                break;
            case AccountDialogLayout.oauth:
                ["abbreviated", "intermediate", "full", "fullImap"].forEach(function (className) { Jx.removeClass(dlg, className); });
                Jx.addClass(dlg, "oauth");
                break;
        }

        this._layoutMode = layoutMode;
    };

    AccountFields.prototype.ensureValidFocus = function () {
        ///<summary>Ensures focus is either in the email or password fields</summary>
        // Ensure we have initial focus somewhere useful.
        if (this.hasUI()) {
            var inputs = this._inputs;
            if (!this._allowEmailEditing) {
                // The email field isn't editable. So, put focus on the password field.
                inputs.password.focus();
            } else if (Jx.isNonEmptyString(this.email) && !Jx.isNonEmptyString(this.password) && this._layoutMode === AccountDialogLayout.abbreviated) {
                // The email field contains a value, the password is empty, and we're in abbreviated mode. Set focus to password.
                inputs.password.focus();
            } else {
                inputs.email.focus();
            }
        }
    };

    AccountFields.prototype.reapplyAccount = function (account) {
        ///<summary>Re-applies the settings values for a particular account that's been updated.
        ///This is mainly to support IMAP SRS lookup scenario, where a valid upsell was found for
        ///the given email domain.</summary>
        ///<parameter name="account" type="Plat.Acccount"/>
        this._account = account;
        this._reset();
    };

    AccountFields.prototype._reset = function () {
        ///<summary>Resets the default states of the inputs.</summary>

        //Note: this is not a true reset. The email and passwords fields we don't touch. We don't need to.
        if (this._layoutMode !== AccountDialogLayout.oauth) {

            var checkboxes = this._checkBoxes;
            var inputs = this._inputs;
            var account = this._account;

            if (account) {
                var settings = getIncomingServerSettings(account) || {};
                var smtpSettings = account.getServerByType(Plat.ServerType.smtp) || {};

                if (this._isImap && (account.accountType === Plat.AccountType.imapAccountFactory)) {
                    // Convert the setting to local-editable objects. This is only pertinent to the upsell versions.
                    settings = { server: settings.server, domain: settings.domain, userId: settings.userId, supportsAdvancedProperties: settings.supportsAdvancedProperties, port: settings.port, useSsl: settings.useSsl };
                    smtpSettings = { server: smtpSettings.server, domain: smtpSettings.domain, userId: smtpSettings.userId, supportsAdvancedProperties: smtpSettings.supportsAdvancedProperties, port: smtpSettings.port, useSsl: smtpSettings.useSsl };

                    // This is an IMAP upsell, ensure the default port and SSL settings are applied.
                    settings.port = _looksLikeAPort(settings.port) ? settings.port : 993;
                    smtpSettings.port = _looksLikeAPort(smtpSettings.port) ? smtpSettings.port : 465;
                    settings.useSsl = true;
                    smtpSettings.useSsl = true;

                    if (findEasUpsell(account, this._scenario)) {
                        // EAS is supported, give the user the option to upgrade.
                        Jx.removeClass(checkboxes.syncContactsAndCal.parentElement, "hidden");
                    }
                }

                inputs.server.value = settings.server;
                inputs.domain.value = settings.domain;
                inputs.username.value = settings.userId;
                if (this._isImap) {
                    inputs.imapServer.value = settings.server;
                    inputs.port.value = settings.port;
                    inputs.smtpPort.value = smtpSettings.port;
                    inputs.smtpServer.value = smtpSettings.server;
                    inputs.smtpUsername.value = smtpSettings.userId;
                    checkboxes.ssl.checked = settings.useSsl;
                    checkboxes.smtpSsl.checked = smtpSettings.useSsl;
                    checkboxes.smtpRequiresAuth.checked = true;
                    checkboxes.smtpReuseCreds.checked = true;
                }

                if (settings.supportsAdvancedProperties || (this._mode === AccountDialogMode.addPrimary)) {
                    Jx.removeClass(document.querySelector(".actdlg-link"), "hidden");
                }
            }
        }
    };

    AccountFields.prototype._updateSmtpCredInputsVisiblity = function () {
        ///<summary>Updates the visibility of the username and password field for SMTP based the current state of the dialog</summary>
        var dlg = document.getElementById("dlg-box");
        var cb = this._checkBoxes;
        var fn = ((cb.smtpRequiresAuth.checked && !cb.smtpReuseCreds.checked) ? Jx.addClass : Jx.removeClass);
        fn.call(Jx, dlg, "dontReuseCreds");
    };

    AccountFields.prototype._onAdvancedLink = function (ev) {
        ///<summary>Click handler for the show-advanced link</summary>
        ///<param name="ev" type="Event">Event object.</param>
        ev.preventDefault();
        if (this._layoutMode !== AccountDialogLayout.full && this._layoutMode !== AccountDialogLayout.fullImap) {
            this._previousLayoutMode = this._layoutMode;
            this.updateLayout(this._isImap ? AccountDialogLayout.fullImap : AccountDialogLayout.full);
        } else {
            var nextLayoutMode = this._previousLayoutMode;
            this._previousLayoutMode = this._layoutMode;
            this.updateLayout(nextLayoutMode);
            this._reset(); // Clear out anything the user may have changed.
        }

        Jx.safeSetActive(this._advancedLink);
    };

    function getString(id) { return Jx.res.getString("/accountsStrings/" + id); }
    function getCompoundString(id, values) { return Jx.res.loadCompoundString("/accountsStrings/" + id, values); }

    function findEasUpsell(imapUpsell, scenario) {
        // Check to see if EAS is also support for this upsell.
        var otherSupportedUpsells = imapUpsell.getOtherConnectableAccounts(scenario);
        if (otherSupportedUpsells && otherSupportedUpsells.count > 0) {
            for (var i = 0; i < otherSupportedUpsells.count; i++) {
                var upsell = otherSupportedUpsells.item(i);
                if (upsell && upsell.accountType === Plat.AccountType.easAccountFactory) {
                    // EAS upsell found.
                    return upsell;
                }
            }
        }
        return null;
    }

    function getIncomingServerSettings(account) {
        // Returns the EAS or IMAP server object based on the type of account given.
        return account.getServerByType(Plat.ServerType.eas) || account.getServerByType(Plat.ServerType.imap);
    }

    var IgnorableCertErrors = {
        expired: "Expired",
        mismatched: "MismatchedDomain",
        unknownCA: "UnknownCA"
    };
    Object.freeze(IgnorableCertErrors);

    var IgnorableCertErrorContent = function () {
        ///<summary>Control which provides the content (i.e. error message) for ignorable certificate errors.</summary>
        this.initComponent();

        this._account = null;
        this._errors = [];
        this._shownError = {};
    };
    Jx.augment(IgnorableCertErrorContent, Jx.Component);

    Object.defineProperty(IgnorableCertErrorContent.prototype, "expiredSeen", {
        get: function () { return this._shownError[this._account.emailAddress][IgnorableCertErrors.expired] || false; }
    });
    Object.defineProperty(IgnorableCertErrorContent.prototype, "mismatchedDomainSeen", {
        get: function () { return this._shownError[this._account.emailAddress][IgnorableCertErrors.mismatched] || false; }
    });
    Object.defineProperty(IgnorableCertErrorContent.prototype, "unknownCASeen", {
        get: function () { return this._shownError[this._account.emailAddress][IgnorableCertErrors.unknownCA] || false; }
    });

    IgnorableCertErrorContent.prototype.setAccount = function (account) {
        Debug.assert(Jx.isObject(account));
        this._account = account;
        this._shownError[this._account.emailAddress] = this._shownError[this._account.emailAddress] || {};
    };

    IgnorableCertErrorContent.prototype.updateError = function () {
        var mailResource = this._account.getResourceByType(Plat.ResourceType.mail);
        var errors = [];
        if (mailResource.serverCertificateExpired && !this.expiredSeen) { errors.push(IgnorableCertErrors.expired); }
        if (mailResource.serverCertificateMismatchedDomain && !this.mismatchedDomainSeen) { errors.push(IgnorableCertErrors.mismatched); }
        if (mailResource.serverCertificateUnknownCA && !this.unknownCASeen) { errors.push(IgnorableCertErrors.unknownCA); }

        this._errors = errors;
    };

    IgnorableCertErrorContent.prototype.getUI = function (ui) {
        var genericMessage =  this._errors.length > 1 ? getString('iceGenericMessage_multiple') : getString("iceGenericMessage");
        ui.html =
            "<div class='iceDialogContent' aria-relevant='all' aria-atomic='false' aria-live='polite'>" +
                "<div class='dlg-subheader' role='heading'>" + genericMessage + "</div><br>" +
                "<div>" + getString("actdlgICE_ImpactStatement") + "</div><br>" +
                this._errors.reduce(function (html, error) {
                    return html + "<div class='dlg-error'>" + IgnorableCertErrorContent._getBriefErrorText(error) + "</div>" +
                                  "<div>" + IgnorableCertErrorContent._getDetailedErrorText(error) + "</div><br>";
                }, "") +
                "<div>" + getString("actdlgICE_Recommendation") + "</div>" +
            "</div>";
    };

    IgnorableCertErrorContent.prototype.getErrorSummaryText = function () {
        return getString("iceGenericMessage");
    };

    IgnorableCertErrorContent._getBriefErrorText = function (error) {
        return getString("ice_" + error + "_Brief");
    };

    IgnorableCertErrorContent._getDetailedErrorText = function (error) {
        return getString("ice_" + error + "_Detailed");
    };

    IgnorableCertErrorContent.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);

        Jx.log.info("IgnorableCertErrorContent.activateUI, error = " + this._error);

        // Cache the knowledge about us displaying this error to the user.
        this._errors.forEach(function (error) {
            this._shownError[this._account.emailAddress][error] = true;
        }.bind(this));
    };
});
