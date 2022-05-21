
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "AccountControlBase", function () {

    var A = window.People.Accounts;
    var S = window.People.Social;
    var Plat = Microsoft.WindowsLive.Platform;
    var Market = Microsoft.WindowsLive.Market;

    var KnownAccountError = A.KnownAccountError = {
        none: 0,
        pushFailed: 1,
        badCredentials: 2,
        noCredentials: 3,
        syncFailed: 4, /* this is a catch-all error for EAS accounts*/
        removalNeeded: 5,
        ignorableCertError: 6,
        certificateNeeded: 7,
        oauthCredentialError: 8,
        // web-configurable account errors:
        reconnectNeeded: 9,
        upgradeNeeded: 10
    };
    Object.freeze(KnownAccountError);

    var AccountControlBase = A.AccountControlBase = function (platform, scenario) {
        /// <summary>A base class for controls which deal with account objects, providing
        /// some commonly-need account-specific functionality.</summary>
        /// <param name="platform" type="Plat.Client"/>
        /// <param name="scenario" type="Plat.ApplicationScenario"/>
        this._platform = platform;
        this._scenario = scenario;
    };

    // Map the current application-scenario to a app name used for our Bici points
    var mapAppScenarioToAppName = AccountControlBase.mapAppScenarioToAppName = {};
    mapAppScenarioToAppName[Plat.ApplicationScenario.calendar] = "calendar";
    mapAppScenarioToAppName[Plat.ApplicationScenario.mail] = "mail";
    mapAppScenarioToAppName[Plat.ApplicationScenario.people] = "people";
    Object.freeze(mapAppScenarioToAppName);

    // Map the current applicat-scenario to the associated account resource type. This is used for error-checking
    var mapAppScenarioToResourceType = AccountControlBase.mapAppScenarioToResourceType = {};
    mapAppScenarioToResourceType[Plat.ApplicationScenario.calendar] = Plat.ResourceType.calendar;
    mapAppScenarioToResourceType[Plat.ApplicationScenario.mail] = Plat.ResourceType.mail;
    mapAppScenarioToResourceType[Plat.ApplicationScenario.people] = Plat.ResourceType.contacts;

    // Map the current application-scenario to the associated scenario-state property of the account.
    // This is used to check for error states on web-configurable accounts. People and Chat only
    // matter in this case.
    var mapAppScenarioToScenarioState = AccountControlBase.mapAppScenarioToScenarioState = {};
    mapAppScenarioToScenarioState[Plat.ApplicationScenario.people] = "peopleScenarioState";


    AccountControlBase.prototype._launchWebAuthAddFlow = function (account, reconnect) {
        /// <summary>Invokes the WebAuth control loaded with the add-flow URL for the given account.
        /// This can be used by add, reconnect, or upgrade.</summary>
        /// <param name="account" type="Plat.Account"/>
        /// <param name="reconnect" type="Boolean" optional="true"/>
        A.getUserAuthTokenAsync(
            function (ticket) {
                this._launchWebAuthAddFlowWithTicket(account, ticket, reconnect);
            } .bind(this) /*success*/,
            function () {
                // Try without the ticket.
                this._launchWebAuthAddFlowWithTicket(account, "", reconnect);
            } .bind(this) /*failure*/);
    };

    AccountControlBase.prototype._launchWebAuthAddFlowWithTicket = function (account, ticket, reconnect) {
        /// <summary>Invokes the WebAuth control loaded with the add-flow URL for the given account.
        /// This can be used by add, reconnect, or upgrade.</summary>
        /// <param name="account" type="Plat.Account"/>
        /// <param name="ticket" type="String"/>
        /// <param name="reconnect" type="Boolean" optional="true"/>
        Debug.assert(account.getConfigureType(this._scenario) === Plat.ConfigureType.editOnWeb);
        reconnect = !!reconnect;

        try {
            var appUri = Windows.Security.Authentication.Web.WebAuthenticationBroker.getCurrentApplicationCallbackUri();

            // Get the basic URL
            var startURL = this._getBasicAccountConnectURL(account);
            // Add some addition parameters to it.
            var scenarios = account.getServerScenarios(this._scenario, reconnect);
            startURL += "&scenarios=" + scenarios;
            startURL += "&view=modern";
            startURL += "&ru=" + appUri.absoluteUri;
            if (Jx.isNonEmptyString(ticket)) {
                var start = 0;
                var length = ticket.length;

                //Extract off the "t=" from the front
                if (ticket.indexOf("t=") === 0) {
                    start = 2;
                    length -= 2;
                }
                //Extract off the "&p=" from the end
                if (ticket.indexOf("&p=") === ticket.length - 3) {
                    length -= 3;
                }
                startURL += "&wlrpsticket=" + ticket.substr(start, length);
            }
            if (reconnect) {
                startURL += "&authz=true";
            }

            Jx.log.info("Plat.ConfigureType._launchAddFlow, url: " + startURL);

            // Binding the platform object to the force-sync function ensures that the platform pointer is
            // still around when in callback returns from authenticateAsync().
            var forcePlatformSync = this._forcePlatformSync.bind(this, this._platform);

            var startURI = new Windows.Foundation.Uri(startURL);

            var status = Windows.Security.Authentication.Web.WebAuthenticationStatus;
            Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
                Windows.Security.Authentication.Web.WebAuthenticationOptions["none"],
                startURI,
                appUri).done(function (res) {
                    var statusText = "success";
                    if (res.responseStatus === status.success) {
                        if (!this._isPackageOnLockScreen()) {
                            forcePlatformSync();
                        }
                    } else if (res.responseStatus === status.errorHttp) {
                        statusText = "error";
                    } else if (res.responseStatus === status.userCancel) { statusText = "user-cancelled"; }
                    Jx.log.info("Account add response status: " + statusText + " errorDetail: " + res.responseErrorDetail);
                    NoShip.People.etw("addFlow_success");
                } .bind(this),
                function (err) { Jx.log.error("Account add failed: " + err); });

        } catch (err) {
            Jx.log.exception("AccountControlBase._launchAddFlow failed.", err);
            NoShip.People.etw("addFlow_launchFailure");
        }
    };

    AccountControlBase.prototype._manageAccountOnline = function (account) {
        /// <summary>Manage the given web-configurable account. This function simply sends
        /// the user to a profile page, loaded in IE. This is used for deleting an account as well.</summary>
        /// <param name="account" type="Plat.Account"/>
        Debug.assert(account.getConfigureType(this._scenario) === Plat.ConfigureType.editOnWeb);

        var currentVisibilityState = document.msVisibilityState;

        // Binding the platform object to the force-sync function ensures that the platform pointer is
        // still around when the user comes back to our app.
        var forcePlatformSync = this._forcePlatformSync.bind(this, this._platform);

        // Must go to web to manage this account.
        var uri = new Windows.Foundation.Uri(this._getCustomURL(account) || this._getBasicAccountConnectURL(account));
        Windows.System.Launcher.launchUriAsync(uri).done();

        // If the user has delete their account online, once they return, we want
        // to force the platform to re-sync so that the deletion is reflected
        // in the UI promptly. The only mechanism we have for detecting when
        // the user returns to our app is by listening to the 'msvisibilitychange' event.
        var onVisibilityChange = function (platform) {
            Jx.log.info("AccountControlBase._manageWebConfigurableAccount(), onVisibilityChange(), msVisibilityState = " + document.msVisibilityState);
            var oldState = currentVisibilityState;
            currentVisibilityState = document.msVisibilityState;
            if (currentVisibilityState !== oldState && currentVisibilityState === "visible") {
                if (!this._isPackageOnLockScreen()) {
                    forcePlatformSync();
                }
                document.removeEventListener("msvisibilitychange", onVisibilityChange);
            }
        } .bind(this);
        document.addEventListener("msvisibilitychange", onVisibilityChange);
    };

    AccountControlBase.prototype._getBasicAccountConnectURL = function (account) {
        /// <summary>Builds a URL to the Live site for managing the connection for the given account.
        /// This URL can be used for deleting an account as well.</summary>
        /// <param name="account" type="Plat.Account"/>
        /// <returns type="String"/>
        //

        Debug.assert(!this._getCustomURL(account), "Getting basic URL for custom account");

        var person = this._platform.accountManager.defaultAccount.meContact;
        var urlPrefix = "https://profile.live.com/cid-";
        
        if (Jx.app.getEnvironment() === "INT") {
            urlPrefix = "https://profile.live-int.com/cid-";
        }
        

        var Cid = Microsoft.WindowsLive.Cid;
        var url = urlPrefix + Cid.CidFormatter.toString(person.cid.value, Cid.CidFormat.hexidecimal) + "/services/connect/?";
        var appName = mapAppScenarioToAppName[this._scenario];
        Debug.assert(Jx.isNonEmptyString(appName), "This app should not have any web-configurable accounts.");
        url += "appid=" + account.sourceId;
        url += "&biciID=" + this._getBiciId();
        url += "&brand=" + appName;

        try {
            // Attempt to add the language and market to the url. If this fails, use the URL without it.
            // The server will fallback to using MarketSense to determine the market to use.
            var language = Windows.ApplicationModel.Resources.Core.ResourceManager.current.defaultContext.languages[0];
            if (Jx.isNonEmptyString(language)) {
                url += "&mkt=" + language;
            }
            var market = Market.get(Microsoft.WindowsLive.FallbackLogic.countryRegion);
            if (Jx.isNonEmptyString(market)) {
                url += "&psamarket=" + market;
            }
        } catch (err) {
            Jx.log.exception("AccountControlBase._getBasicAccountConnectURL(), Microsoft.WindowsLive.Market.get() failed.", err);
        }

        return url;
    };

    AccountControlBase.prototype._getCustomURL = function (account) {
        /// <summary>Gets a custom (non-standard) URL for managing the given account.  This is specifically for Skype,
        /// which isn't yet supported in the normal connect flow.</summary>
        /// <param name="account" type="Plat.Account"/>
        /// <returns type="String"/>
        if (account.sourceId === "SKYPE") {
            return "https://secure.skype.com/account/main-page";
        }
        return "";
    };

    AccountControlBase.prototype._getBiciSuffix = function () {
        Debug.assert(false, "derived classes must define this method");
    };

    AccountControlBase.prototype._getBiciId = function () {
        var prefix = mapAppScenarioToAppName[this._scenario];
        Debug.assert(Jx.isNonEmptyString(prefix), "Unknown hosting app");
        var suffix = this._getBiciSuffix();
        var biciId = prefix + suffix + "_windows81";
        this._getBiciId = function () { return biciId; };
        return biciId;
    };

    AccountControlBase.prototype._isPackageOnLockScreen = function () {
        /// <summary>Checks whether any of the apps in our package are lockscreen-enabled.</summary>
        /// <return trype="boolean"/>
        var lockScreenEnable = false;
        var WAB = Windows.ApplicationModel.Background;
        var apIds = ["Microsoft.WindowsLive.Mail", "Microsoft.WindowsLive.Calendar"];
        apIds.forEach(function (appId) {
            if (!lockScreenEnable) {
                try {
                    var status = WAB.BackgroundExecutionManager.getAccessStatus(appId);
                    if ((status === WAB.BackgroundAccessStatus.allowedMayUseActiveRealTimeConnectivity) ||
                        (status === WAB.BackgroundAccessStatus.allowedWithAlwaysOnRealTimeConnectivity)) {
                        lockScreenEnable = true;
                    }
                } catch (err) {
                    // Note: this is expected to fail in sub-branch builds, where one of the above applications
                    // is not mapped in.
                    Jx.log.exception("BackgroundExecutionManager.getAccessStatus() failed", err);
                }
            }
        });
        return lockScreenEnable;
    };

    AccountControlBase.prototype._forcePlatformConnectedIdCheckAsync = function (platform, defaultAccount) {
        /// <summary>Force the platform to check the connected account state</summary>
        /// <returns type="Promise">An async operation for the verb</returns>
        var account = defaultAccount || platform.accountManager.defaultAccount;
        var verb = platform.createVerb("ConnectedIdChange", "");
        return platform.runResourceVerbAsync(account, "backgroundTasks", verb);
    };

    AccountControlBase.prototype._forcePlatformSync = function (platform) {
        /// <summary>Force the platform to re-sync accounts data</summary>
        Jx.log.info("AccountListControl._forcePlatformSync()");
        var accountsResource = platform.accountManager.defaultAccount.getResourceByType(Plat.ResourceType.mail);
        accountsResource.isSyncNeeded = true;
        accountsResource.commit();
    };

    AccountControlBase.prototype._getCurrentError = function (account) {
        /// <summary>Checks if the given account has an actionable errror</summary>
        /// <param name="account" type="Plat.Account"/>
        /// <returns type="KnownAccountError"/>
        var error = KnownAccountError.none;
        var scenario = this._scenario;
        var configType = account.getConfigureType(scenario);

        switch (configType) {
            case Plat.ConfigureType.editOnClient:
                var resourceType = mapAppScenarioToResourceType[scenario];
                Debug.assert(Jx.isNumber(resourceType));
                var resource = account.getResourceByType(resourceType);
                var accountSettingFailed = (account.settingsResult !== Plat.Result.success);
                if (resource) {
                    if (accountSettingFailed && (resource.lastSyncResult === Plat.Result.e_HTTP_DENIED || resource.lastSyncResult === Plat.Result.ixp_E_IMAP_LOGINFAILURE)) {
                        error = KnownAccountError.badCredentials;
                    } else if (resource.lastPushResult === Plat.Result.e_SYNC_PUSH_FAILED) {
                        error = KnownAccountError.pushFailed;
                    } else if (accountSettingFailed && resource.lastSyncResult === Plat.Result.autoDiscoveryFailed) {
                        error = KnownAccountError.syncFailed;
                    } else if (accountSettingFailed && resource.lastSyncResult === Plat.Result.credentialMissing) {
                        // This indicates an account that has been roamed without it's credentials.
                        error = KnownAccountError.noCredentials;
                    } else if (resource.lastSyncResult === Plat.Result.e_GOOGLE_APPS) {
                        // The account is a Gmail EAS account. It needs to be removed. Sync'ing will no longer work for it.
                        error = KnownAccountError.removalNeeded;
                    } else if (resource.lastSyncResult === Plat.Result.e_SYNC_IGNORABLE_SERVER_CERT_FAILURE) {
                        error = KnownAccountError.ignorableCertError;
                    } else if (resource.lastSyncResult === Plat.Result.e_SYNC_CBA_FAILED) {
                        error = KnownAccountError.certificateNeeded;
                    } else if (!Jx.isNullOrUndefined(resource.lastSendMailResult) && resource.lastSendMailResult === Plat.Result.ixp_E_SMTP_535_AUTH_FAILED) {
                        error = KnownAccountError.badCredentials;
                    }
                }

                // If we get any sort of credential error, and the account supports oauth, change
                // the error type as an oauth issue. This essentially marks the account for
                // upgrade to oauth if it's connected via basic auth.
                if (account.supportsOAuth && (error === KnownAccountError.badCredentials || error === KnownAccountError.noCredentials)) {
                    error = KnownAccountError.oauthCredentialError;
                }
                break;
            case Plat.ConfigureType.editOnWeb:
                var scenarioStateProp = mapAppScenarioToScenarioState[scenario];
                // For some apps, we ignore the scenario state.
                if (Jx.isNonEmptyString(scenarioStateProp)) {
                    if (account[scenarioStateProp] === Plat.ScenarioState.error) {
                        error = KnownAccountError.reconnectNeeded;
                    } else if (account[scenarioStateProp] === Plat.ScenarioState.upgradeRequired) {
                        error = KnownAccountError.upgradeNeeded;
                    }
                }
                break;
            default:
                Debug.assert(false, "unexpected config type: " + configType);
                break;
        }

        return error;
    };

    AccountControlBase.prototype._hasDefaultAccount = function () {
        return (this._platform.accountManager.defaultAccount.lastAuthResult !== Plat.Result.defaultAccountDoesNotExist);
    };
});
