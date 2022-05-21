
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Share, Microsoft, Jx, Windows*/

Share.RequestHelper = function (shareOperation, quickLink) {
    /// <summary>
    /// RequestHelper class used to make calls to services
    /// </summary>
    ///<param name="shareOperation" optional="true" type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">ShareOperation for this request</param>
    ///<param name="quickLink" optional="true" type="Windows.ApplicationModel.DataTransfer.ShareTarget.QuickLink">The quicklink for this share</param>

    this._shareOperation = shareOperation;
    this._quickLink = quickLink;
};

Share.RequestHelper.prototype.sendMessageToOutbox = function (mailMessage, account, platform) {
    /// <summary>
    /// Sends the mail to the outbox.
    /// </summary>
    /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message to send to the outbox.</param>
    /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">The Account from which the message is being sent.</param>
    /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client">The platform used to send the mail messages.</param>

    this._mailMessage = mailMessage;

    // Wrap platform references in a try catch to better handle the platform unexpectedly crashing.
    try {
        var mailManager = platform.mailManager;
        var Platform = Microsoft.WindowsLive.Platform;

        this._resourceChanged = this._resourceChanged.bind(this);
        this._resource = account.getResourceByType(Platform.ResourceType.mail);
        this._resource.addEventListener("changed", this._resourceChanged);

        this._mailMessage.moveToOutbox();

        mailManager.ensureMailView(Platform.MailViewType.outbox, this._mailMessage.accountId, "");

        // Set a listener for mailMessage errors
        this._mailMessage.addEventListener("changed", this._mailMessageChanged.bind(this));

        Jx.log.verbose("Sending Mail Message to outbox");

        this._mailMessage.commit();
        this._mailMessageId = this._mailMessage.objectId;
        Jx.log.info("Sent mail message ID: " + this._mailMessageId);
    } catch (e) {
        Jx.fault("ShareToMail.MailSendFailure", "OutboxCommitFailure", e);
        this._mailError = Share.MailConstants.MailError.preOutboxError;
        this.mailSent = true;
        this._endTransfer(false);
    }
};

Share.RequestHelper.prototype._resourceChanged = function () {
    /// <summary>
    /// Checks to see if the mail is done sending. When it is, checks to see if it was sent successfully.
    /// </summary>

    // Don't process this if the mail objects have been cleaned up already
    if (!this._resource) {
        return;
    }

    // Check to see if we're done with the send operation yet
    if (!this._resource.isSendingMail) {
        // Remove the event listener; once we're no longer sending mail we don't care about further updates
        this._resource.removeEventListener("changed", this._resourceChanged);

        var hresult = this._resource.lastSendMailResult;
        if (hresult !== 0 && this._mailMessage.isInSpecialFolderType(Microsoft.WindowsLive.Platform.MailFolderType.outbox)) {
            // Determine which error message to display
            var Result = Microsoft.WindowsLive.Platform.Result;
            var isAuthError = [
                Result.authNotAttempted,
                Result.credentialMissing,
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
                Result.ixp_E_IMAP_LOGINFAILURE,
                Result.ixp_E_SMTP_535_AUTH_FAILED,
                Result.e_HTTP_DENIED,
                Result.autoDiscoveryFailed,
                Result.nteDecryptionFailure,
                -2147023665, // 0x800704CF, HRESULT_FROM_WIN32(ERROR_NETWORK_UNREACHABLE) - we get this one when the platform needs auth and disconnected from the internet
                -2146893042 // 0x8009030E, SEC_E_NO_CREDENTIALS
            ].indexOf(hresult) !== -1;

            if (isAuthError) {
                this._mailError = Share.MailConstants.MailError.authError;
            } else if (this._checkForInternetConnection()) {
                this._mailError = Share.MailConstants.MailError.outboxError;

                // Report this error, because all we had was a generic error message to show
                Jx.fault("ShareToMail.MailSendFailure", "LastSendMailResult", hresult);
            } 
        }

        this._endTransfer(false);
    }
};

Share.RequestHelper.prototype._getInternetConnectionProfile = function () {
    /// <summary>
    /// Wrapper around Windows.Networking.Connectiity.NetworkInformation.getInternetConnectionProfile so it can be overridden in tests.
    /// </summary>
    return Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
};

Share.RequestHelper.prototype._checkForInternetConnection = function () {
    /// <summary>
    /// Checks to see if we have an internet connection, and if not, sets the _mailError variable accordingly.
    /// </summary>
    /// <returns type="Boolean">True if there does appear to be an internet connection, false otherwise.</returns>

    try {
        // connectionProfile may be null if there is no current connection.
        var connectionProfile = this._getInternetConnectionProfile();
        if (connectionProfile && connectionProfile.getNetworkConnectivityLevel() === Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess) {
            return true;
        }
    } catch (e) {
        Jx.log.exception("Exception from Connectivity.NetworkInformation", e);
    }

    this._mailError = Share.MailConstants.MailError.internetError;
    return false;
};

Share.RequestHelper.prototype._mailMessageChanged = function (ev) {
    /// <summary>
    /// Function used to watch the mailMessage for error state, if we enter an error state close the program.
    /// </summary>
    /// <param name="ev" type="Event">The event object containing the mailMessage event.</param>

    var message = ev.target;
    var sendError = null;

    // If syncStatus indicates that there has been an error, log the error
    if (message.syncStatus !== 0) {
        sendError = {
            faultLocation: "MessageSyncStatus",
            message: "Received syncStatus error from mailMessage",
            number: message.syncStatus
        };
    }

    if (sendError) {
        this.mailSent = true;
        this._mailError = Share.MailConstants.MailError.outboxError;

        var internetError = Share.MailConstants.hresultResourceNotFound;
        if (sendError.number === internetError) {
            // Check to see if we're not connected to the Internet
            this._checkForInternetConnection();
        }

        if (this._mailError !== Share.MailConstants.MailError.internetError) {
            // Record that the mail failed to send (only for errors that are not internet error)
            Jx.fault("ShareToMail.MailSendFailure", sendError.faultLocation, sendError);
        }

        // Call endTransfer with the mail leg set to finished.
        // This will report the error to the share platform, and the user will get an error toast.
        this._endTransfer(false);
    }
};

Share.RequestHelper.prototype.cancel = function (mailMessage) {
    /// <summary>
    /// Cancels any pending share, and notifies the sharing platform that everything is complete.
    /// </summary>
    /// <param name="mailMessage" type="Microsoft.WindowsLive.Platform.IMailMessage">The mail message that has been sent to the outbox</param>

    Jx.log.verbose("RequestHelper received request to cancel");

    // mailSent will be true if we've already sent the mail, or if there was never a mail to send.
    if (!this.mailSent) {
        // Delete the mail to prevent it from being sent
        // We're only showing the cancel UX when the user isn't connected, so it shouldn't be possible to get here while the message is already sending.

        mailMessage.deleteObject();
        this.mailSent = true;
    }

    this._endTransfer(true);
};

Share.RequestHelper.prototype._endTransfer = function (isCancel) {
    /// <summary>
    /// Callback Used to call doneTransfer after the sharing request has completed.
    /// </summary>
    /// <param name="isCancel" type="Boolean">Indicates whether this is a cancel event that should complete immediately</param>

    Jx.log.verbose("Share.RequestHelper.endTransfer");

    if (this._resource) {
        this._resource.removeEventListener("changed", this._resourceChanged);
        this._resource = null;
    }

    if (this._mailMessage) {
        this._mailMessage.removeEventListener("changed", this._mailMessageChanged);
        this._mailMessage = null;
    }

    if (isCancel) {
        Jx.log.verbose("Share.RequestHelper calling reportCompleted in cancel case");
    } else {
        // Fire the success event
        Jx.EventManager.fire(null, Share.MailConstants.messageSentEvent);
    }

    this._reportCompleted();
};

Share.RequestHelper.prototype._reportCompleted = function () {
    ///<summary>
    /// Calls report completed
    ///</summary>

    if (!this._isCompleted) {
        Jx.log.verbose("Share.RequestHelper.reportCompleted; mailError: " + this._mailError);

        if (this._mailError === Share.MailConstants.MailError.outboxError) {
            // Report error in the case that we have a sync error
            this._shareOperation.reportError(Jx.res.getString(Share.Constants.stringsPrefix + "mailInOutboxError"));
        } else if (this._mailError === Share.MailConstants.MailError.internetError) {
            // We couldn't send the mail because we were not connected
            this._shareOperation.reportError(Jx.res.getString(Share.MailConstants.stringsPrefix + "offlineSendError"));
        } else if (this._mailError === Share.MailConstants.MailError.preOutboxError) {
            // Report error in the case that we have failed to make it to the outbox
            this._shareOperation.reportError(Jx.res.getString(Share.Constants.stringsPrefix + "mailGenericNotInOutboxError"));
        } else if (this._mailError === Share.MailConstants.MailError.authError) {
            // Report error in the case that we had an authentication problem
            this._shareOperation.reportError(Jx.res.getString(Share.MailConstants.stringsPrefix + "accountError"));
        } else if (!Jx.isNullOrUndefined(this._quickLink)) {
            this._shareOperation.reportCompleted(this._quickLink);
        } else {
            this._shareOperation.reportCompleted();
        }

        this._isCompleted = true;
    }
};

Share.RequestHelper.prototype._shareOperation = null;
Share.RequestHelper.prototype.mailSent = false; // Have we succesfully sent the expected mail
Share.RequestHelper.prototype._mailError = Share.MailConstants.MailError.none; // Has the mail in the outbox occured an error
Share.RequestHelper.prototype._resource = null;
Share.RequestHelper.prototype._mailMessageId = null;
Share.RequestHelper.prototype._mailMessage = null;
Share.RequestHelper.prototype._quickLink = null;
Share.RequestHelper.prototype._isCompleted = false; // Indicates whether reportCompleted has been called.
