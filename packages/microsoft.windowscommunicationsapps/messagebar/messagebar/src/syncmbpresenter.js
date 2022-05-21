
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Jx, Chat, Microsoft, Debug, Windows, People, Mail*/
/*jshint browser:true*/

Jx.delayDefine(Chat, "SyncMessageBarPresenter", function () {
    "use strict";

    var Platform = Microsoft.WindowsLive.Platform,
        MessageBarPriority = Chat.MessageBar.Priority;

    function _mark(s) { Jx.mark("SyncMessageBarPresenter." + s); }
    function _markStart(s) { Jx.mark("SyncMessageBarPresenter." + s + ",StartTA,Shared"); }
    function _markStop(s) { Jx.mark("SyncMessageBarPresenter." + s + ",StopTA,Shared"); }

    Chat.SyncMessageBarPresenter = /*constructor*/function () { };

    var proto = Chat.SyncMessageBarPresenter.prototype;

    proto._initialized = false;
    proto._mb = null;
    proto._platform = null;
    proto._className = null;
    proto._resourceType = null;
    proto._accounts = null;
    proto._resources = {};
    proto._moreDetailsFlyout = null;
    proto._checkedNetworkConnection = false;
    proto._hasNetworkConnection = false;
    proto._errorDisabled = false;
    proto._appScenario = null;

    proto._syncing = {};
    proto._sending = {};
    proto._syncingOrSending = { count: 0, previousCount: 0 };
    proto._SYNC_MESSAGE_ID = "easSync";
    proto._SYNC_ALL_MESSSAGE_ID = "syncAll";
    proto._STATUS_MESSAGE_PREFIX = "statusEasResource-";
    proto._ERROR_MESSAGE_PREFIX = "errorEasResource-";
    proto._SYNC_MESSAGE_PREFIX = "sync";
    proto._SEND_MESSAGE_PREFIX = "send";
    // _getResourceByMessageId() assumes _SYNC_MESSAGE_PREFIX and _SEND_MESSAGE_PREFIX are the same length
    Debug.assert(proto._SYNC_MESSAGE_PREFIX.length === proto._SEND_MESSAGE_PREFIX.length);
    proto._syncStatusShownTime = 0;
    proto._syncStatusDisabled = false;
    proto._clearSyncStatusTimer = -1;
    proto._errorDuration = null;
    proto._online = true;

    proto._policyEnforcementAttempted = {}; // Object to remember which accounts we have attempted to enforce policies on.

    proto.init = function (messageBar, platform, appScenario, className, options) {
        /// <summary>
        /// SyncMessageBarPresenter init
        /// </summary>
        /// <param name="messageBar" type="Chat.MessageBar">
        /// MessageBar where this presenter will add/remove messages
        /// </param>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client">the platform</param>
        /// <param name="appScenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario">
        /// ApplicationScenario of the incorporating app
        /// </param>
        /// <param name="className" type="String">
        /// Css class name to passed to the messagebar
        /// </param>
        /// <param name="options" type="SyncMessageBarOptions" optional="True">
        /// Apps that host this control can specify some options
        /// </param>
        _markStart("init");

        Debug.assert(messageBar);
        Debug.assert(platform);
        Debug.assert(!Jx.isNullOrUndefined(appScenario));

        this._mb = messageBar;
        this._platform = platform;
        this._className = className;
        this._appScenario = appScenario;

        this._isRetail = Jx.appData.localSettings().get("RetailExperience") || false;

        if (this._syncStatusDisabled) {
            this._mb.disableMessage(this._SYNC_MESSAGE_ID);
        }

        // Listen for connectivity changes
        Windows.Networking.Connectivity.NetworkInformation.addEventListener("networkstatuschanged", this._onNetworkStatusChanged.bind(this));

        options = options || {};
        this._checkIsSyncingAll = Boolean(options.checkIsSyncingAll);
        this._showCredError = Jx.isBoolean(options.showCredError) ? options.showCredError : true;
        this._showFolderSyncError = Boolean(options.showFolderSyncError);

        // Get the appropriate resource type based on the provided app scenario
        if (appScenario === Platform.ApplicationScenario.mail) {
            this._resourceType = Platform.ResourceType.mail;
        } else if (appScenario === Platform.ApplicationScenario.calendar) {
            this._resourceType = Platform.ResourceType.calendar;
        } else if (appScenario === Platform.ApplicationScenario.people) {
            this._resourceType = Platform.ResourceType.contacts;
        }
        Debug.assert(this._resourceType !== null);

        this._resourceChanged = this._resourceChanged.bind(this);
        this._collectionChanged = this._collectionChanged.bind(this);

        // Get all of the relevant accounts
        this._accounts = platform.accountManager.getConnectedAccountsByScenario(appScenario, Platform.ConnectedFilter.normal, Platform.AccountSort.name);
        this._accounts.addEventListener("collectionchanged", this._collectionChanged);
        for (var i = 0; i < this._accounts.count; i++) {
            // On each account find the relevant resource and add a "changed" listener
            var account = this._accounts.item(i);
            this._addResource(account);
        }
        this._accounts.unlock();

        // Add the default account if we are running the Mail application scenario and the
        // mailScenarioState is unknown. On the first run, we don't know what scenarios the default account
        // supports, so it won't be in this._accounts, but we still want to know when it is syncing.
        var defaultAccount = platform.accountManager.defaultAccount;
        if ((appScenario === Platform.ApplicationScenario.mail) &&
            (defaultAccount.mailScenarioState === Platform.ScenarioState.unknown)) {
            this._addResource(defaultAccount);
        }

        this._initialized = true;
        _markStop("init");
    };

    proto._getErrorDuration = function () {
        var errorDuration = this._errorDuration;
        if (errorDuration === null) {
            // Get the ease of access notification time value
            // Also convert to milliseconds
            errorDuration = this._errorDuration = new Windows.UI.ViewManagement.UISettings().messageDuration * 1000;
            Debug.assert(errorDuration > 11);   // This is going to be used for timeouts.  Less than 11ms isn't a valuable timeout.
        }
        return errorDuration;
    };

    proto._getMessageDuration = function () {
        // Normal messages - not errors - tend to be small and need only half the time.
        return this._getErrorDuration() / 2;
    };

    proto.disableSyncStatus = function () {
        this._syncStatusDisabled = true;

        if (this._mb) {
            this._mb.disableMessage(this._SYNC_MESSAGE_ID);
        }
    };

    proto.unDisableSyncStatus = function (oneTime) {
        /// <param name="oneTime" type="Boolean">Whether to enable the sync status one time only</param>

        var wasDisabled = this._syncStatusDisabled;
        this._syncStatusDisabled = false;

        if (oneTime) {
            this._syncStatusEnabledOneTime = true;
        }

        if (this._mb) {
            this._mb.unDisableMessage(this._SYNC_MESSAGE_ID);

            // if the sync status was previously disabled, update ourselves as if
            // any existing sync state is new to force the message to be shown.
            // we need to do this because any earlier syncs would have been dropped.
            if (!this._isRetail && wasDisabled) {
                this._syncingOrSending.previousCount = 0;
                this._updateSyncStatus();
            }
        }
    };

    proto.disableCredentialMissingErrorMessage = function () {
        this._errorDisabled = true;
    };

    proto.shutdown = function () {
        // Remove all the listeners we added
        _markStart("shutdown");

        // Must get the account objects from our stored copy in this_resources where
        //  we actually added the event listeners not from this._accounts WinRT object
        //  which may be in unexpected state especially during rehydration
        for (var key in this._resources) {
            var resource = this._resources[key].resource;
            this._removeResource(resource);
        }

        if (this._accounts) {
            this._accounts.removeEventListener("collectionchanged", this._collectionChanged);
            this._accounts.dispose();
        }

        _markStop("shutdown");
    };

    proto.setClassName = function (className) {
        this._className = className;

        for (var key in this._resources) {
            var item = this._resources[key];
            this._updateSync(item.resource);
        }
    };

    proto._collectionChanged = function (ev) {
        /// <param name="ev" type="Event" />
        var args = ev.detail[0];
        var type = Platform.CollectionChangeType;
        var account = null;
        if (args.eType === type.itemAdded) {
            account = this._accounts.item(args.index);
            this._addResource(account);
        } else if (args.eType === type.itemRemoved) {
            var resource = null;
            // Find the account that was just removed
            for (var key in this._resources) {
                var obj = this._resources[key];
                if (obj.account.objectId === args.objectId) {
                    resource = obj.resource;
                    break;
                }
            }
            if (resource !== null) {
                this._removeResource(resource);
            }
        }
    };

    proto._addResource = function (account) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />

        var syncResource = account.getResourceByType(this._resourceType);
        if (syncResource && !(syncResource.objectId in this._resources)) {
            Debug.assert(Jx.isValidNumber(syncResource.lastSendMailResult) === (this._resourceType === Platform.ResourceType.mail));
            Debug.assert(Jx.isBoolean(syncResource.isSendingMail) === (this._resourceType === Platform.ResourceType.mail));
            Debug.assert(Jx.isBoolean(syncResource.isSyncingAllMail) === (this._resourceType === Platform.ResourceType.mail));
            Debug.assert(Jx.isValidNumber(syncResource.syncWindowSize) === (this._resourceType === Platform.ResourceType.mail));

            this._resources[syncResource.objectId] = { resource: syncResource, account: account };

            syncResource.addEventListener("changed", this._resourceChanged);

            // Always show sync status when adding an account.
            // But only if we're already initialized.
            if (this._initialized) {
                this.unDisableSyncStatus(this._syncStatusDisabled);
            }

            // Get initial state
            this._updateSync(syncResource);
        }
    };

    proto._removeResource = function (syncResource) {
        /// <param name="syncResource" type="Microsoft.WindowsLive.Platform.IAccountResource" />

        syncResource.removeEventListener("changed", this._resourceChanged);

        // Remove any error message for this resource as it is no longer valid.
        this._mb.removeMessage(this._getErrorMessageId(syncResource, false /* sendStatus */));
        this._mb.removeMessage(this._getErrorMessageId(syncResource, true /* sendStatus */));

        // Call updateSync to simulate the sync end with this resource
        this._updateSync(syncResource, true /*forceSyncEnd*/);

        delete this._resources[syncResource.objectId];
    };

    proto._resourceChanged = function (ev) {
        /// <param name="ev" type="Event" />
        var resource = ev.target;
        this._updateSync( resource);
    };

    proto._updateSync = function (resource, forceSyncEnd) {
        /// <param name="resource" type="Microsoft.WindowsLive.Platform.IAccountResource" />
        /// <param name="forceSyncEnd" type="Boolean" optional="true" />
        var resourceId = resource.objectId;

        this._syncingOrSending.previousCount = this._syncingOrSending.count;

        // Store the resource's isSynchronizing state
        if ((resource.isSynchronizing || resource.isSyncNeeded || !resource.isInitialSyncFinished) && !forceSyncEnd) {
            if (!this._syncing[resourceId]) {
                _mark("Starting sync for " + resourceId);
                this._syncing[resourceId] = true;
            }
        } else {
            if (this._syncing[resourceId]) {
                _mark("Ending sync for " + resourceId);
                this._syncing[resourceId] = false;

                // Check the error state now that sync has completed for this resource.
                // If there is no network connection, don't show an error since we expect failure
                // and the "offline" case is gracefully handled by _updateSyncStatus().
                if (!forceSyncEnd) {
                    this._checkErrorState(resource, true /* checkNetworkConnection */, false /* checkSendResult */);
                }
            }
        }

        // Store the resource's isSendingMail state
        if (resource.isSendingMail && !forceSyncEnd) {
            if (!this._sending[resourceId]) {
                _mark("Starting send mail for " + resourceId);
                this._sending[resourceId] = true;
            }
        } else {
            if (this._sending[resourceId]) {
                _mark("Ending send mail for " + resourceId);
                this._sending[resourceId] = false;

                // Check the error state now that sync has completed for this resource.
                // If there is no network connection, don't show an error since we expect failure
                // and the "offline" case is gracefully handled by _updateSyncStatus().
                if (!forceSyncEnd) {
                    this._checkErrorState(resource, true /* checkNetworkConnection */, true /* checkSendResult */);
                }
            }
        }

        // Combine the isSynchronizing and isSendingMail properties for the "Syncing..." status message
        if ((resource.isSynchronizing || resource.isSendingMail || resource.isSyncNeeded || !resource.isInitialSyncFinished) && !forceSyncEnd) {
            if (!this._syncingOrSending[resourceId]) {
                this._syncingOrSending[resourceId] = true;
                this._syncingOrSending.count++;
            }
        } else {
            if (this._syncingOrSending[resourceId]) {
                this._syncingOrSending[resourceId] = false;
                this._syncingOrSending.count--;
            }
        }
        _mark("syncingOrSending count: " + this._syncingOrSending.count);

        if (!this._isRetail && this._checkIsSyncingAll) { // If hosted by the Mail app, check for sync all
            var messageId = this._getSyncAllMessageId(resource);
            if (resource.isSyncingAllMail && !forceSyncEnd && this._isConnectedToInternet()) {
                var windowSize = resource.syncWindowSize;

                Debug.assert(windowSize === Platform.SyncWindowSize.all || windowSize === Platform.SyncWindowSize.oneMonth);

                var resId = windowSize === Platform.SyncWindowSize.all ? "/messagebar/messageBarSyncingAll" : "/messagebar/messageBarSyncingOneMonth",
                    resourceString = Jx.res.loadCompoundString(resId, this._getAccountFromResource(resource).displayName),
                    options = {
                        messageText: resourceString,
                        tooltip: resourceString,
                        cssClass: this._className
                    };
                this._mb.addStatusMessage(messageId, MessageBarPriority.medium, options);
            } else {
                this._mb.removeMessage(messageId);
            }
        }

        if (!this._isRetail) {
            this._updateSyncStatus();
        }
    };

    proto._getSyncAllMessageId = function (resource) {
        return this._SYNC_ALL_MESSSAGE_ID + resource.objectId;
    };

    proto._updateSyncStatus = function () {
        if (this._syncingOrSending.count > 0 && this._syncingOrSending.previousCount === 0) {
            if (!this._syncStatusDisabled) {
                // One or more resources isSynchronizing (or isSendingMail) so show the syncing status message
                var resourceName = null;
                var online = this._online = this._isConnectedToInternet();
                if (online) {
                    resourceName = "/messagebar/messageBarSyncing";
                } else {
                    resourceName = "/messagebar/messageBarOffline";
                }

                var resourceString = Jx.res.getString(resourceName);
                var options = {
                    messageText: resourceString,
                    tooltip: resourceString,
                    cssClass: this._className
                };

                this._mb.addStatusMessage(this._SYNC_MESSAGE_ID, MessageBarPriority.low, options);

                // if this status was only enabled once, set it back disabled now
                if (this._syncStatusEnabledOneTime) {
                    this._syncStatusDisabled = true;
                    this._syncStatusEnabledOneTime = false;
                }

                this._syncStatusShownTime = Date.now();
                // We got an instruction to sync again before the previous syncing message was dismissed.
                // Therefore, we should cancel that timeout.
                Jx.dispose(this._clearSyncStatusTimer);
                this._clearSyncStatusTimer = null;
            }
        } else if (this._syncingOrSending.previousCount > 0 && this._syncingOrSending.count === 0) {
            // One or more resources was syncing so a sync has just completed.
            // We should dismiss the syncing status. However, if a sync completed very quickly,
            // we should show the status for a minimum amount of time to give the user a chance to
            // see the syncing status. Therefore, we subtract the time that has passed from _getMessageDuration.
            // If there is still some time to go, we dismiss the sync status in a callback.
            // After dismissing the sync message, we show "Up to date".
            Jx.dispose(this._clearSyncStatusTimer);
            this._clearSyncStatusTimer = null;
            var timeDelta = this._getMessageDuration() - (Date.now() - this._syncStatusShownTime);
            if (timeDelta > 11) {   // don't bother with a timer for <11ms
                this._clearSyncStatusTimer = new Jx.Timer(timeDelta, this._showUpToDate, this);
            } else {
                // if time delta is negative or huge, we should dismiss immediately. This is typically
                // an edge case such as the user changing the system clock mid-sync, or a very long sync.
                this._showUpToDate();
            }
        }
    };

    proto._showUpToDate = function () {
        this._syncStatusShownTime = 0;
        Jx.dispose(this._clearSyncStatusTimer);
        this._clearSyncStatusTimer = null;

        this._mb.removeMessage(this._SYNC_MESSAGE_ID);
        // If we're offline, don't show "up to date", just clear and return.
        if (!this._online) {
            this._clearMessage();
            return;
        }
        var locString = Jx.res.getString("/messagebar/messageBarUpToDate");
        var options = {
            messageText: locString,
            tooltip: locString,
            cssClass: this._className
        };
        this._mb.addStatusMessage(this._SYNC_MESSAGE_ID, MessageBarPriority.low, options);
        this._clearSyncStatusTimer = new Jx.Timer(this._getMessageDuration(), this._clearMessage, this);
    };
    proto._clearMessage = function () {
        Jx.dispose(this._clearSyncStatusTimer);
        this._clearSyncStatusTimer = null;
        this._mb.removeMessage(this._SYNC_MESSAGE_ID);
        if (this._syncStatusDisabled) {
            this.disableSyncStatus();
        }
    };

    var minimumConnectivityLevel = Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
    proto._onNetworkStatusChanged = function () {
        this._checkedNetworkConnection = false;

        if (!this._isRetail) {
            this._updateSyncStatus();
        }
    };

    proto._isConnectedToInternet = function () {
        _markStart("_isConnectedToInternet");

        if (!this._checkedNetworkConnection) {
            _markStart("_isConnectedToInternet:check");

            var Connectivity = Windows.Networking.Connectivity,
                connectivityLevel = Connectivity.NetworkConnectivityLevel.none;

            try {
                var connectionProfile = Connectivity.NetworkInformation.getInternetConnectionProfile();

                if (connectionProfile) {
                    connectivityLevel = connectionProfile.getNetworkConnectivityLevel();
                }
            } catch (e) {
                Jx.log.exception("Exception from Connectivity.NetworkInformation", e);
            }

            this._hasNetworkConnection = (connectivityLevel >= minimumConnectivityLevel);
            this._checkedNetworkConnection = true;

            _markStop("_isConnectedToInternet:check");
        }

        _markStop("_isConnectedToInternet");
        return this._hasNetworkConnection;
    };

    proto._checkErrorState = function (resource, checkNetworkConnection, checkSendResult) {
        var account = null;
        var server = null;
        var messageText = null;
        var button1Text = null;
        var button1Tooltip = null;
        var button1Callback = null;
        var textButtonText = null;
        var textButtonTooltip = null;
        var textButtonCallback = null;
        var newError = false;
        var lastSyncResult;
        var options;

        // Start by looking at the send mail result if it's available. If it is not available or is S_OK, look at the last sync result instead.

        if (checkSendResult) {
            lastSyncResult = resource.lastSendMailResult;
        } else {
            lastSyncResult = resource.lastSyncResult;
        }

        _mark("Checking error state for resource: " + resource.objectId +
            " checkNetworkConnection: " + checkNetworkConnection +
            " checkSendResult: " + checkSendResult +
            " lastSyncResult: " + lastSyncResult);
        Debug.assert(Jx.isValidNumber(lastSyncResult));

        var hasSyncError   = true;
        if (lastSyncResult === Platform.Result.success || // Never show an error for S_OK.
            lastSyncResult === Platform.Result.serverNotAttempted || // Never show an error for this value. It means we haven't yet attempted to sync.
            lastSyncResult === Platform.Result.autoDiscoveryNotAttempted) { // Never show an error for this value. It means we haven't yet attempted to sync.
            this._mb.removeMessage(this._getErrorMessageId(resource, checkSendResult));
            hasSyncError = false;
        }

        if (hasSyncError) {
            if (!checkNetworkConnection || this._isConnectedToInternet()) {
                switch (lastSyncResult) {
                    case Platform.Result.e_HTTP_DENIED: // This HRESULT is required to match those that the account list in people and mail are using
                    case Platform.Result.e_HTTP_UNEXPECTED_CONTENT:
                    case Platform.Result.ixp_E_IMAP_LOGINFAILURE: //    -2030042862 Bad password from IMAP
                        if (this._showCredError) {
                            messageText = Jx.res.loadCompoundString("/messagebar/messageBarAuthFailure", this._getEmail(resource));

                            if (this._isEasType(resource)) {
                                button1Text = Jx.res.getString("/messagebar/messageBarFix");
                                button1Tooltip = button1Text;
                                button1Callback = this._fixClicked.bind(this);
                            }
                            newError = true;
                        }
                        break;

                    case Platform.Result.e_NEXUS_APPLY_POLICY_NEEDED:
                    case Platform.Result.e_NEXUS_UNABLE_TO_COMPLY_WITH_POLICY:
                        // Never handle policy errors when we are checking the send result
                        if (checkSendResult) {
                            break;
                        }

                        account = this._getAccountFromResource(resource);
                        server = this._getServerFromAccount(account);
                        Debug.assert(Jx.isObject(server));

                        var syncComplianceResults = server.policyComplianceResults;

                        if ((syncComplianceResults & Platform.PolicyComplianceResults.userCanceledPolicyDialog) !== 0 ||
                            (!Jx.isNullOrUndefined(this._policyEnforcementAttempted[server.objectId]))) {
                            // if the user has already seen the policy dialog and either canceled it or attempted to apply change, then just show them the message bar.

                            var enforceableErrors = this._policyResultsContainEnforceableErrors(syncComplianceResults);

                            if (enforceableErrors) {
                                messageText = Jx.res.loadCompoundString("/messagebar/messageBarApplyPolicyNeeded", this._getEmail(resource));

                                button1Text = Jx.res.getString("/messagebar/messageBarContinue");
                                button1Tooltip = button1Text;
                                button1Callback = this._applyPolicyClicked.bind(this);
                            } else {
                                messageText = Jx.res.loadCompoundString("/messagebar/messageBarUnableToComply", this._getEmail(resource));

                                button1Text = Jx.res.getString("/messagebar/messageBarRetry");
                                button1Tooltip = button1Text;
                                button1Callback = this._applyPolicyClicked.bind(this);
                            }

                            textButtonText = Jx.res.getString("/messagebar/messageBarMoreDetails");
                            textButtonTooltip = textButtonText;
                            textButtonCallback = this._policyMoreDetailsClicked.bind(this);

                            newError = true;
                        } else {
                            newError = false;
                            this._applyPolicyClicked(null, this._getErrorMessageId(resource, checkSendResult));
                        }
                        break;

                    case Platform.Result.e_NEXUS_STATUS_MAXIMUM_DEVICES_REACHED:
                        messageText = Jx.res.getString("/messagebar/messageBarDeviceLimitReached");

                        newError = true;
                        break;

                    case -2147012867:
                        // ERROR_INTERNET_CANNOT_CONNECT
                        // This hresult is currently not projected into javascript and it will soon be replaced
                        //  when most wininet errors are replaced by XHR equivalents
                        // TODO replace with equivalent XHR error when this wininet error is no longer in use
                        messageText = Jx.res.loadCompoundString("/messagebar/messageBarConnectionFailure", this._getAccountFromResource(resource).displayName);
                        newError = true;

                        break;

                    case Platform.Result.credentialMissing:
                        if (!this._errorDisabled && this._showCredError) {
                            // FUTURE: provide a more specific error message here [this change came after UI Freeze,
                            // so we had to reuse the closest string we could find]
                            messageText = Jx.res.loadCompoundString("/messagebar/messageBarConnectionError", this._getEmail(resource));
                            button1Text = Jx.res.getString("/messagebar/messageBarUpdate");
                            button1Tooltip = button1Text;
                            button1Callback = this._fixClicked.bind(this);

                            newError = true;
                        }
                        break;

                    case Platform.Result.invalidServerCertificate:
                    case Platform.Result.certBadChain:
                    case Platform.Result.certBadPurpose:
                    case Platform.Result.certBadRole:
                    case Platform.Result.certChainValidityBadNesting:
                    case Platform.Result.certCNNoMatch:
                    case Platform.Result.certExpired:
                    case Platform.Result.certInvalidName:
                    case Platform.Result.certInvalidPolicy:
                    case Platform.Result.certLengthConstraintViolated:
                    case Platform.Result.certMissingImportantField:
                    case Platform.Result.certNotIssuedByParent:
                    case Platform.Result.certRevocationCheckFailed:
                    case Platform.Result.certRevoked:
                    case Platform.Result.certUntrustedRoot:
                    case Platform.Result.certUntrustedTestRoot:
                    case Platform.Result.certWithUnknowExtMarkedCritical:
                    case Platform.Result.certWrongUsage:
                        messageText = Jx.res.loadCompoundString("/messagebar/messageBarInvalidServerCertificate", this._getEmail(resource));
                        newError = true;
                        break;

                    case Platform.Result.autoDiscoveryFailed:
                        // Don't show an error for this value, but don't clear an existing error either.
                        // This error error can be occur as a secondary error as a result of some sync errors. It's best
                        // to leave the error bar alone here so the first sync error can be dealt with appropriately.
                        break;
                    default:
                        // All other errors
                        _mark("Showing status message for " + lastSyncResult);
                        messageText = Jx.res.loadCompoundString("/messagebar/messageBarConnectionError", this._getEmail(resource));

                        // Show the sync error status message
                        options = {
                            messageText: messageText,
                            tooltip: messageText,
                            cssClass: this._className
                        };

                        var statusMessageId = this._getStatusMessageId(resource, checkSendResult);

                        // Remove any existing status message for this account then add our new one
                        this._mb.removeMessage(statusMessageId);
                        this._mb.addStatusMessage(statusMessageId, MessageBarPriority.high, options);

                        // Remove the status message after the calculated time
                        new Jx.Timer(this._getErrorDuration(), function () {
                            this._mb.removeMessage(statusMessageId);
                        }, this);
                        break;
                }
            }
        } else if (this._showFolderSyncError) { // If hosted by the Mail app, check for folder sync error
            account = this._getAccountFromResource(resource);
            Debug.assert(!Jx.isNullOrUndefined(account.folderStateResult));
            var folderError = account.folderStateResult;
            if (folderError === Platform.Result.localFolderChangesLost) {
                messageText = Jx.res.getString("/messagebar/messageBarAccountFolderSyncFail");
                newError = true;
                // Only show error message bar once.
                // UI's responsability to clear error state after user has been notified.
                account.folderStateResult = 0;
                account.commit();
            }
        }
        
        if (newError) {
            _mark("Showing error message for " + lastSyncResult);
        } else if (this._resourceType === Platform.ResourceType.mail && resource.oofLastSyncResult !== Platform.Result.success) {
            // Check OOF setting sync result and show error message if needed.
            account = this._getAccountFromResource(resource);
            var oofLastSyncResult = resource.oofLastSyncResult;
            if (oofLastSyncResult === Platform.Result.serverNotAttempted) {
                messageText = Jx.res.loadCompoundString("/messagebar/oofSettingNotSynced", account.displayName);
                button1Callback = this._oofSyncTryAgainClicked.bind(this);
            } else {
                messageText = Jx.res.loadCompoundString("/messagebar/oofSettingRejectedByServer", account.displayName);
                button1Callback = this._oofSettingTryAgainClicked.bind(this);
            }
            button1Text = button1Tooltip = Jx.res.getString("/messagebar/oofSettingSyncErrorActionButtonText");
            newError = true;

            _mark("Showing error message for OOF setting " + oofLastSyncResult);
        }

        if (newError) {
            // Remove any error message for this resource and add the most recent one
            //  into the message bar
            options = {
                messageText: messageText,
                button2: {
                    text: Jx.res.getString("/messagebar/messageBarCloseText"),
                    tooltip: Jx.res.getString("/messagebar/messageBarCloseTooltip"),
                    callback: this._closeClicked.bind(this)
                },
                cssClass: this._className
            };

            if (button1Text) {
                options.button1 = {
                    text: button1Text,
                    tooltip: button1Tooltip,
                    callback: button1Callback
                };
            }

            if (textButtonText) {
                options.textButton = {
                    text: textButtonText,
                    tooltip: textButtonTooltip,
                    callback: textButtonCallback
                };
            }

            var messageId = this._getErrorMessageId(resource, checkSendResult);
            this._mb.removeMessage(messageId);
            this._mb.addErrorMessage(messageId, MessageBarPriority.high, options);
        }
    };

    proto._getStatusMessageId = function (resource, sendStatus) {
        // Unique status message for the given resource
        var syncOrSendPrefix = sendStatus ? this._SEND_MESSAGE_PREFIX : this._SYNC_MESSAGE_PREFIX;
        return this._STATUS_MESSAGE_PREFIX + syncOrSendPrefix + resource.objectId;
    };

    proto._getErrorMessageId = function (resource, sendStatus) {
        // Unique error message for the given resource
        var syncOrSendPrefix = sendStatus ? this._SEND_MESSAGE_PREFIX : this._SYNC_MESSAGE_PREFIX;
        return this._ERROR_MESSAGE_PREFIX + syncOrSendPrefix + resource.objectId;
    };

    proto._getResourceByMessageId = function (id) {
        /// <returns type="Microsoft.WindowsLive.Platform.IAccountResource" />

        // The id will either be:
        //     this._ERROR_MESSAGE_PREFIX + this._SYNC_MESSAGE_PREFIX + objectId
        //  or:
        //     this._ERROR_MESSAGE_PREFIX + this._SEND_MESSAGE_PREFIX + objectId
        // However _SYNC_MESSAGE_PREFIX and _SEND_MESSAGE_PREFIX are the same length, so we don't
        // need to know which one we have before slicing it.
        var objectId = id.slice(this._ERROR_MESSAGE_PREFIX.length + this._SYNC_MESSAGE_PREFIX.length);
        return this._resources[objectId].resource;
    };

    proto._getAccountFromResource = function (resource) {
        /// <returns type="Microsoft.WindowsLive.Platform.IAccount" />
        return this._resources[resource.objectId].account;
    };

    proto._getServerFromAccount = function (account) {
        /// <returns type="Microsoft.WindowsLive.Platform.IAccountServerConnectionSettings" />
        return account.getServerByType(Platform.ServerType.eas);
    };

    proto._getEmail = function (resource) {
        var account = this._getAccountFromResource(resource);
        return account.emailAddress;
    };

    proto._isEasType = function (resource) {
        var account = this._getAccountFromResource(resource);
        return (account.accountType === Platform.AccountType.eas);
    };

    proto._fixClicked = function (target, id) {
        // Remove the message with the given id
        this._mb.removeMessage(id);

        // Get the account associated with this message
        var resource = this._getResourceByMessageId(id);
        var account = this._getAccountFromResource(resource);

        // Launch the account dialog
        var dlg = new People.Accounts.AccountDialog(account, People.Accounts.AccountDialogMode.update, this._appScenario, this._platform);
        dlg.show();
    };

    proto._applyPolicyClicked = function (target, id) {
        var that = this,
            resource = this._getResourceByMessageId(id),
            account = this._getAccountFromResource(resource),
            server = this._getServerFromAccount(account),
            accountId = account.objectId,
            easPolicy = server.getClientSecurityPolicy();

        // Dismiss this message
        that._mb.removeMessage(id);

        var applyPolicyComplete = function () {
            _mark("applyAsync completed successfully for account " + accountId);
            // Flag the account so the platform can tell we attempted to apply policies
            server.policyApplyAttempted = true;

            // Flag local state so we can tell if the user has already attempted to apply policy
            // This keeps the policy dialog from spamming the user on successive sync policy failures.
            that._policyEnforcementAttempted[server.objectId] = true;

            // Kick off a sync for this account
            resource.isSyncNeeded = true;
            resource.commit();
            account.commit();
        };

        var applyPolicyError = function (value) {
            _mark("applyAsync returned " + value.number + " for account " + accountId);

            // If the call to applyAsync() fails for most reasons, flag the account so the platform
            // will attempt to sync. The one exception where we don't want to attempt to sync is if
            // the user cancelled out of the Windows UI. If the user did cancel the Windows UI, we
            // should show our message bar again
            if (value.number === Platform.Result.e_NEXUS_USER_CANCELLED_POLICY) {
                // update the flags so we can tell the user
                // to accept the PolicyDialog if they want their mail
                server.policyComplianceResults |= Platform.PolicyComplianceResults.userCanceledPolicyDialog;

                account.commit();
                that._checkErrorState(resource, false /*checkNetworkConnection*/, false /*checkSendResult*/);
            } else {
                applyPolicyComplete(null);
            }
        };

        try {
            _mark("Calling applyAsync for account " + accountId);
            easPolicy.applyAsync().then(applyPolicyComplete, applyPolicyError);
        } catch (ex) {
            // applyAsync() can fail if there is another system popup on the screen. In this case, the failure
            // is expected and the exception should have an HRESULT of E_ACCESSDENIED (-2147024891). If the exception
            // is anything other than E_ACCESSDENIED, this is a new issue that should be investigated.
            Debug.assert(ex.number === -2147024891 /*E_ACCESSDENIED*/);
            _mark("applyAsync threw exception " + ex.number + " for account " + accountId);
        }
    };

    proto._policyMoreDetailsClicked = function (target, id) {
        var resource = this._getResourceByMessageId(id),
            account = this._getAccountFromResource(resource),
            server = this._getServerFromAccount(account),
            policyResults = server.policyComplianceResults,
            enforceableErrors = this._policyResultsContainEnforceableErrors(policyResults);

        if (!this._moreDetailsFlyout) {
            this._moreDetailsFlyout = new Chat.SyncMessageBarFlyout();
        }

        this._moreDetailsFlyout.init(this._getEmail(resource), policyResults, enforceableErrors);

        this._moreDetailsFlyout.show(target, "bottom");
    };

    proto._closeClicked = function (target, id) {
        // Remove the message with the given id
        this._mb.removeMessage(id);
    };

    proto._policyResultsContainEnforceableErrors = function (policyComplianceResults) {
        /// <summary>Returns true if the given policy compliance results contain errors
        /// that we consider enforceable. Enforceable errors are those that an end user is
        /// likely able to address on their own, such as bad passwords or BitLocker being suspended.
        /// Unenforceable errors are those that require configuration changes on the mail server or
        /// purchasing a different version of Windows.</summary>
        /// <param name="policyComplianceResults" type="Microsoft.WindowsLive.Platform.PolicyComplianceResults" />
        /// <returns type="Boolean" />
        var resultsFlags = Platform.PolicyComplianceResults,
            enforceableErrors = policyComplianceResults &
                                    (resultsFlags.userNotAnAdmin |
                                     resultsFlags.userCanceledPolicyDialog |
                                     resultsFlags.usersCannotChangePassword |
                                     resultsFlags.connectedUserPasswordIsWeak |
                                     resultsFlags.userHasBlankPassword |
                                     resultsFlags.connectedAdminPasswordIsWeak |
                                     resultsFlags.adminsHaveBlankPasswords |
                                     resultsFlags.notProtectedBitLocker |       
                                     resultsFlags.notProtected3rdParty |        
                                     resultsFlags.protectionSuspendedBitLocker |
                                     resultsFlags.protectionSuspended3rdParty |
                                     resultsFlags.osVolumeNotProtectedBitLocker |
                                     resultsFlags.osVolumeNotProtected3rdParty |
                                     resultsFlags.protectionNotYetEnabledBitLocker |
                                     resultsFlags.protectionNotYetEnabled3rdParty);

        Debug.assert(policyComplianceResults !== resultsFlags.compliant, "We shouldn't be calling this function without some policy error");

        return Boolean(enforceableErrors);
    };
    
    proto._oofSyncTryAgainClicked = function (target, id) {
        this._mb.removeMessage(id);

        var resource = this._getResourceByMessageId(id),
            account = this._getAccountFromResource(resource);
        // Mark the account as needing a sync.
        resource.isSyncNeeded = true;
        try {
            account.commit();
        } catch (err) {
            Jx.log.exception("Chat.SyncMessageBarPresenter._oofSyncTryAgainClicked failed to call account.commit.", err);
        }
    };

    proto._oofSettingTryAgainClicked = function (target, id) {
        Debug.assert(this._resourceType === Platform.ResourceType.mail);
        
        this._mb.removeMessage(id);

        var resource = this._getResourceByMessageId(id),
            account = this._getAccountFromResource(resource);
        Mail.AccountSettings.launchPerAccountSettings(account, true);
    };

});
