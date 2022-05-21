
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People, "loadSocialPlatform", function () {

People.loadSocialPlatform = Jx.fnEmpty;

People.loadSocialImports();
People.loadSocialCore();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the current authentication status.
/// </summary>
People.RecentActivity.Platform.AuthenticationStatus = {
    /// <field name="none" type="Number" integer="true" static="true">We haven't got any authentication information yet.</field>
    none: 0,

    /// <field name="authenticated" type="Number" integer="true" static="true">We are authenticated and we successfully got all information.</field>
    authenticated: 1,

    /// <field name="authenticatedPendingTokenRefresh" type="Number" integer="true" static="true">We are authenticated but need to refresh token.</field>
    authenticatedPendingTokenRefresh: 2,

    /// <field name="tokenRetrievalFailed" type="Number" integer="true" static="true">We are authenticated but we failed to get token from contact platform.</field>
    tokenRetrievalFailed: 3,

    /// <field name="userIdRetrievalFailed" type="Number" integer="true" static="true">We are authenticated but we failed to get user id from contact platform.</field>
    userIdRetrievalFailed: 4,

    /// <field name="disconnected" type="Number" integer="true" static="true">This network is already disconnected.</field>
    disconnected: 5
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\EventArgs.js" />
/// <reference path="..\Core\NetworkId.js" />
/// <reference path="AuthenticationStatus.js" />
/// <reference path="Configuration.js" />
/// <reference path="ConnectedNetworkChangedEventArgs.js" />
/// <reference path="ContactId.js" />
/// <reference path="Platform.js" />
/// <reference path="PsaStatus.js" />

People.RecentActivity.Platform.AuthInfo = function(userId) {
    /// <summary>
    ///     Encapsulates Auth Information for a signed in user.
    /// </summary>
    /// <param name="userId" type="People.RecentActivity.Platform.ContactId">The user id.</param>
    /// <field name="_instances" type="Object" static="true">The <see cref="T:People.RecentActivity.Platform.AuthInfo" /> instances, keyed by network ID.</field>
    /// <field name="_userId" type="People.RecentActivity.Platform.ContactId"></field>
    /// <field name="_initialized" type="Boolean" static="true"></field>
    /// <field name="_token" type="String"></field>
    /// <field name="_networkName" type="String"></field>
    /// <field name="_socialScenarioState" type="People.RecentActivity.Platform.PsaStatus"></field>
    /// <field name="_publishScenarioState" type="People.RecentActivity.Platform.PsaStatus"></field>
    /// <field name="_status" type="People.RecentActivity.Platform.AuthenticationStatus"></field>
    /// <field name="_isBetaAccount" type="Boolean"></field>
    Debug.assert(userId != null, 'userId');
    
    this._networkName = '';
    this._userId = userId;
};

Jx.mix(People.RecentActivity.Platform.AuthInfo.prototype, Jx.Events);
Jx.mix(People.RecentActivity.Platform.AuthInfo.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.Platform.AuthInfo.prototype, "authenticationstatuschanged");

People.RecentActivity.Platform.AuthInfo._instances = {};
People.RecentActivity.Platform.AuthInfo._initialized = false;

People.RecentActivity.Platform.AuthInfo.getInstance = function(networkId) {
    /// <summary>
    ///     Gets authentication information for the given network.
    /// </summary>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <returns type="People.RecentActivity.Platform.AuthInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    Debug.assert(People.RecentActivity.Platform.AuthInfo._initialized, 'initialized');

    if (!Jx.isUndefined(People.RecentActivity.Platform.AuthInfo._instances[networkId])) {
        return People.RecentActivity.Platform.AuthInfo._instances[networkId];
    }

    return null;
};

People.RecentActivity.Platform.AuthInfo.hasBetaAccount = function() {
    /// <summary>
    ///     Checks whether the user has a BETA (dogfood) account.
    /// </summary>
    /// <returns type="Boolean"></returns>
    var networks = [ People.RecentActivity.Core.NetworkId.twitter ];
    for (var i = 0, len = networks.length; i < len; i++) {
        var instance = People.RecentActivity.Platform.AuthInfo.getInstance(networks[i]);
        if ((instance != null) && instance._isBetaAccount) {
            return true;
        }    
    }

    return false;
};

People.RecentActivity.Platform.AuthInfo.initialize = function() {
    /// <summary>
    ///     Initializes AuthInfo for all supported networks.
    /// </summary>
    if (!People.RecentActivity.Platform.AuthInfo._initialized) {
        Jx.log.write(4, 'AuthInfo.Initialize()');

        People.RecentActivity.Platform.AuthInfo._initialized = true;
        People.RecentActivity.Platform.Platform.instance.addListener("connectednetworkchanged", People.RecentActivity.Platform.AuthInfo._onConnectedNetworkChanged);

        for (var n = 0, coll = People.RecentActivity.Platform.Configuration.instance.supportedNetworks; n < coll.length; n++) {
            var networkId = coll[n];
            var info = new People.RecentActivity.Platform.AuthInfo(new People.RecentActivity.Platform.ContactId('', networkId));
            People.RecentActivity.Platform.AuthInfo._instances[networkId] = info;
        }    
    }
};

People.RecentActivity.Platform.AuthInfo._onConnectedNetworkChanged = function(e) {
    /// <param name="e" type="People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs"></param>
    Debug.assert(e != null, 'e');

    Jx.log.write(4, People.Social.format('AuthInfo.OnConnectedNetworkChanged({0},{1},{2})', e.sourceId, e.type, (e.token != null) ? e.token.length : 0));

    // fetch the auth info.
    var authInfo = People.RecentActivity.Platform.AuthInfo.getInstance(e.sourceId);
    Debug.assert(authInfo != null, 'authInfo');

    switch (e.type) {
        case People.RecentActivity.Platform.ConnectedNetworkChangedEventType.connected:
            Jx.log.write(4, People.Social.format('AuthInfo.OnConnectedNetworkChanged::Connected({0},{1},{2})', authInfo.status, authInfo.isInfoValid, (authInfo.token != null) ? authInfo.token.length : 0));

            authInfo.networkName = e.networkName;
            authInfo.socialScenarioState = e.socialScenarioState;
            authInfo.publishScenarioState = e.publishScenarioState;
            authInfo._setAuthInfo(e.userId, e.token);

            break;

        case People.RecentActivity.Platform.ConnectedNetworkChangedEventType.disconnected:
            authInfo.status = People.RecentActivity.Platform.AuthenticationStatus.disconnected;
            authInfo.socialScenarioState = e.socialScenarioState;
            authInfo.publishScenarioState = e.publishScenarioState;
            break;

        case People.RecentActivity.Platform.ConnectedNetworkChangedEventType.updated:
            if (Jx.isNonEmptyString(e.networkName)) {
                authInfo.networkName = e.networkName;
            }

            break;

        case People.RecentActivity.Platform.ConnectedNetworkChangedEventType.scenarioStateUpdated:
            authInfo.publishScenarioState = e.publishScenarioState;
            authInfo.socialScenarioState = e.socialScenarioState;
            break;

        case People.RecentActivity.Platform.ConnectedNetworkChangedEventType.userIdUpdated:
            authInfo._setAuthInfo(e.userId);
            break;
    }
};

People.RecentActivity.Platform.AuthInfo.prototype._userId = null;
People.RecentActivity.Platform.AuthInfo.prototype._token = null;
People.RecentActivity.Platform.AuthInfo.prototype._tokenFromPlatform = null;
People.RecentActivity.Platform.AuthInfo.prototype._socialScenarioState = 0;
People.RecentActivity.Platform.AuthInfo.prototype._publishScenarioState = 0;
People.RecentActivity.Platform.AuthInfo.prototype._status = 0;
People.RecentActivity.Platform.AuthInfo.prototype._isBetaAccount = false;
People.RecentActivity.Platform.AuthInfo.prototype._isRefreshingToken = false;

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "token", {
    get: function() {
        /// <summary>
        ///     Gets the token.
        /// </summary>
        /// <value type="String"></value>
        return this._token;
    },
    set: function(value) {
        this._token = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "userId", {
    get: function() {
        /// <summary>
        ///     Gets the signed in user's contact id for the given network network.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.ContactId"></value>
        return this._userId;
    }
});

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "status", {
    get: function() {
        /// <summary>
        ///     Gets the current authentication status.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.AuthenticationStatus"></value>
        return this._status;
    },
    set: function(value) {
        Debug.assert(!!value, 'status');

        if (this._status !== value) {
            this._status = value;

            Jx.log.write(4, 'AuthInfo.AuthenticationStatusChanged.Invoke()');

            if (value == People.RecentActivity.Platform.AuthenticationStatus.disconnected) {
                // in a disconnected state it doesn't make sense to hold on to an old token.
                this._token = null;

                if (this._tokenFromPlatform) {
                    // detach from the platform token until we become connected again.
                    this._tokenFromPlatform.removeEventListener('changed', this._onPlatformTokenPropertyChanged.bind(this), false);
                    this._tokenFromPlatform = null;
                }
            }

            this.raiseEvent("authenticationstatuschanged", new People.RecentActivity.EventArgs(this));
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "networkName", {
    get: function() {
        /// <summary>
        ///     Gets the name of the network the auth info is associated with..
        /// </summary>
        /// <value type="String"></value>
        return this._networkName;
    },
    set: function(value) {
        this._networkName = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "socialScenarioState", {
    get: function() {
        /// <summary>
        ///     Gets the current PSA state for the social scenario.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.PsaStatus"></value>
        return this._socialScenarioState;
    },
    set: function(value) {
        this._socialScenarioState = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "publishScenarioState", {
    get: function() {
        /// <summary>
        ///     Gets the current PSA state for the publish scenario.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.PsaStatus"></value>
        return this._publishScenarioState;
    },
    set: function(value) {
        this._publishScenarioState = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "isBetaAccount", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is a BETA account.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isBetaAccount;
    }
});

Object.defineProperty(People.RecentActivity.Platform.AuthInfo.prototype, "isInfoValid", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the user id and token are valid.
        /// </summary>
        /// <value type="Boolean"></value>
        return Jx.isNonEmptyString(this._userId.id) && Jx.isNonEmptyString(this._token);
    }
});

People.RecentActivity.Platform.AuthInfo.prototype.refreshToken = function() {
    /// <summary>
    ///     Refreshes the token, only for SUP token.
    /// </summary>
    var sourceId = this._userId.sourceId;
    if (sourceId === People.RecentActivity.Core.NetworkId.facebook) {
        // for Facebook, we need to try and get the token from the platform.
        this._requestFacebookToken();
    }
    else {
        // for anything SUP-related we need to do a Windows auth query.
        this._requestSupToken();
    }
};

People.RecentActivity.Platform.AuthInfo.prototype._onAuthenticationFailed = function(ex) {
    /// <param name="ex" type="Error"></param>
    /// <returns type="WinJS.Promise"></returns>
    Jx.log.write(2, People.Social.format('Failed to get SUP token: {0}.', ex.message));

    this._isRefreshingToken = false;
    this._updateStatus(true);

    // Need to reset the status so we can refresh token again for next request.
    this._status = People.RecentActivity.Platform.AuthenticationStatus.authenticatedPendingTokenRefresh;

    return null;
};

People.RecentActivity.Platform.AuthInfo.prototype._onUserAuthenticated = function(value) {
    /// <param name="value" type="Object"></param>
    /// <returns type="WinJS.Promise"></returns>
    this._isRefreshingToken = false;

    var identity = value;

    Jx.log.write(4, People.Social.format('AuthInfo.OnUserAuthenticated({0},{1})', identity != null, (identity.tickets != null) ? identity.tickets.length : 0));

    if ((identity != null) && (identity.tickets != null)) {
        var supTarget = People.RecentActivity.Platform.Configuration.instance.supTarget.toUpperCase();
        var supPolicy = People.RecentActivity.Platform.Configuration.instance.supPolicy.toUpperCase();

        for (var n = 0; n < identity.tickets.length; n++) {
            var ticket = identity.tickets[n];
            var target = ticket.request;

            Jx.log.write(4, People.Social.format('AuthInfo.OnUserAuthenticated::Ticket({0},{1})', target.service, target.policy));

            // check to see if this is the target+policy that we requested.
            if ((target.service.toUpperCase() === supTarget) && (target.policy.toUpperCase() === supPolicy)) {
                Jx.log.write(4, People.Social.format('AuthInfo.OnUserAuthenticated({0}, {1}', ticket.value, identity.isBetaAccount));

                this._token = ticket.value;
                this._isBetaAccount = identity.isBetaAccount;
            }        
        }    
    }

    this._updateStatus(true);

    // Need to reset the status so we can refresh token again for next request.
    this._status = People.RecentActivity.Platform.AuthenticationStatus.authenticatedPendingTokenRefresh;

    return null;
};

People.RecentActivity.Platform.AuthInfo.prototype._requestSupToken = function() {
    Jx.log.write(4, 'AuthInfo.RequestSupToken');
    
    // we make several requests in rapid succession, so we don't want to hit Windows with a bunch of auth requests
    // all at the same time when just one will suffice. 
    if (!this._isRefreshingToken) {
        this._isRefreshingToken = true;

        var authenticator = new Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator();

        var target = new Windows.Security.Authentication.OnlineId.OnlineIdServiceTicketRequest(
            People.RecentActivity.Platform.Configuration.instance.supTarget,
            People.RecentActivity.Platform.Configuration.instance.supPolicy);

        var authOperation = authenticator.authenticateUserAsync([target], Windows.Security.Authentication.OnlineId.CredentialPromptType.doNotPrompt);
            authOperation.done(this._onUserAuthenticated.bind(this), this._onAuthenticationFailed.bind(this));
    }
};

People.RecentActivity.Platform.AuthInfo.prototype._requestFacebookToken = function () {
    Jx.log.write(4, 'AuthInfo::RequestFacebookToken');

    if (this._tokenFromPlatform == null) {
        var sourceId = this._userId.sourceId;

        var account = People.RecentActivity.Platform.Platform.instance.getAccount(sourceId);
        if (account) {
            // attempt to fetch the token.
            var token = account.getTokenByScheme('Oauth2');
            if (token) {
                // also make sure we monitor the token property, to make sure we pick up changes here, in case
                // the platform is late in syncing down the token.
                this._tokenFromPlatform = token;
                this._tokenFromPlatform.addEventListener('changed', this._onPlatformTokenPropertyChanged.bind(this), false);
            }
            else {
                // we couldn't get the wrapper token object, fail.
                Jx.log.write(4, 'AuthInfo::RequestFacebookToken: Failed to get token object.');
            }
        } 
        else {
            // we failed to get the account, so we also can't get a token.
            Jx.log.write(4, 'AuthInfo::RequestFacebookToken: Failed to get account.');
        }
    }

    if (this._tokenFromPlatform != null) {
        // is the token non-empty? if so, yay.
        this._token = this._tokenFromPlatform.token;
    }

    this._updateStatus(true);
};

People.RecentActivity.Platform.AuthInfo.prototype._onPlatformTokenPropertyChanged = function (e) {
    /// <param name="e" type="Microsoft.WindowsLive.Platform.ObjectChangedEventArgs"></param>
    Debug.assert(e != null, 'e');

    // figure out if the token has been updated.
    var changes = e.detail[0];

    for (var i = 0, len = changes.length; i < len; i++) {
        if (changes[i] === 'token') {
            // the token was updated, so requery it.
            this._requestFacebookToken();
            break;
        }
    }
};

People.RecentActivity.Platform.AuthInfo.prototype._setAuthInfo = function(userId, token) {
    /// <param name="userId" type="String"></param>
    /// <param name="token" type="String"></param>
    if (Jx.isNonEmptyString(token)) {
        // we got passed in a token (usually this happens on initial connect), so take it.
        this._token = token;
    }

    this._setUserId(userId);
    this._updateStatus(false);
};

People.RecentActivity.Platform.AuthInfo.prototype._setUserId = function(userId) {
    /// <param name="userId" type="String"></param>
    this._userId.id = userId;
};

People.RecentActivity.Platform.AuthInfo.prototype._updateStatus = function(tokenRefreshed) {
    /// <param name="tokenRefreshed" type="Boolean"></param>
    if (!Jx.isNonEmptyString(this._userId.id)) {
        Jx.log.write(3, People.Social.format('AuthInfo.UpdateStatus: {0} user id is null or empty!', this._userId.sourceId));
        this.status = People.RecentActivity.Platform.AuthenticationStatus.userIdRetrievalFailed;
    }
    else if (!Jx.isNonEmptyString(this._token)) {
        if (!tokenRefreshed) {
            // we still need to refresh the token.
            Jx.log.write(4, 'AuthInfo::UpdateStatus: Still need to refresh the token.');
            this.status = People.RecentActivity.Platform.AuthenticationStatus.authenticatedPendingTokenRefresh;
        }
        else {
            // we tried to refresh the token, but alas.
            Jx.log.write(3, People.Social.format('AuthInfo.UpdateStatus: {0} token is null or empty!', this._userId.sourceId));
            this.status = People.RecentActivity.Platform.AuthenticationStatus.tokenRetrievalFailed;;
        }
    }
    else {
        // we've been properly authenticated.
        this.status = People.RecentActivity.Platform.AuthenticationStatus.authenticated;
    }

    Jx.log.write(4, People.Social.format('AuthInfo.UpdateStatus({0},{1},{2})', this._status, this._userId.sourceId, (this._token != null) ? this._token.length : 0));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Core\NetworkReactionInfo.js" />
/// <reference path="..\Core\NetworkReactionInfoType.js" />
/// <reference path="AuthInfo.js" />

People.RecentActivity.Platform.Configuration = function() {
    /// <summary>
    ///     Contains config related properties we might change for test purpose.
    /// </summary>
    /// <field name="_instance" type="People.RecentActivity.Platform.Configuration" static="true"></field>
    /// <field name="_reactionNetworkMap" type="Object" static="true"></field>
    /// <field name="_reactionTypeMap" type="Object" static="true"></field>
    /// <field name="_supportedNetworks" type="Array" elementType="String"></field>
    /// <field name="_commentIcons" type="Object" static="true"></field>
    /// <field name="_isOnline" type="Boolean"></field>
};


People.RecentActivity.Platform.Configuration._instance = null;
People.RecentActivity.Platform.Configuration._reactionNetworkMap = null;
People.RecentActivity.Platform.Configuration._reactionTypeMap = null;
People.RecentActivity.Platform.Configuration._reactionIdMap = null;
People.RecentActivity.Platform.Configuration._commentIcons = null;

Object.defineProperty(People.RecentActivity.Platform.Configuration, "instance", {
    get: function() {
        /// <summary>
        ///     Gets or sets the instance of <see cref="T:People.RecentActivity.Platform.Configuration" />.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.Configuration"></value>
        if (People.RecentActivity.Platform.Configuration._instance == null) {
            // create a default instance.
            People.RecentActivity.Platform.Configuration._instance = new People.RecentActivity.Platform.Configuration();
        }

        return People.RecentActivity.Platform.Configuration._instance;
    },
    set: function(value) {
        Debug.assert(value != null, 'instance');
        People.RecentActivity.Platform.Configuration._instance = value;
    }
});


People.RecentActivity.Platform.Configuration.prototype._supportedNetworks = null;
People.RecentActivity.Platform.Configuration.prototype._isOnline = true;

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "cacheEnabled", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether caching is enabled.
        /// </summary>
        /// <value type="Boolean"></value>
        return true;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "isOnline", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the user is in online mode, which means both IE set to online and internet access is available.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isOnline && window.navigator.onLine;
    },
    set: function(value) {
        this._isOnline = value;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "isRetailMode", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the app is currently in retail mode.
        /// </summary>
        /// <value type="Boolean"></value>
        return (Jx.appData == null || Jx.appData.localSettings() == null) ? false : Jx.appData.localSettings().get('RetailExperience');
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "environment", {
    get: function() {
        /// <summary>
        ///     Gets the environment.
        /// </summary>
        /// <value type="String"></value>
        return Jx.app.getEnvironment();
    }
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supRootUrl", {
    get: function() {
        /// <summary>
        ///     Gets the SUP root URL.
        /// </summary>
        /// <value type="String"></value>
        return 'http://co1msg1012522.msgr-tst.com';
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supApiRootUrl", {
    get: function() {
        /// <summary>
        ///     Gets the SUP JSON api root URL.
        /// </summary>
        /// <value type="String"></value>
        var env = this.environment.toUpperCase();
        switch (env) {
            case 'PROD':
                // check to see which endpoint we need to hit, depending on whether this is a DF account or not.
                if (People.RecentActivity.Platform.AuthInfo.hasBetaAccount()) {
                    return 'https://df-feeds.live.net';
                }
                else {
                    return 'https://feeds.live.net';
                }

            case 'INT':
                return 'https://sup.live-int.com';
            default:
                Debug.assert(false, 'Unknown environment: ' + env);
                return null;
        }

    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supTarget", {
    get: function() {
        /// <summary>
        ///     Gets the SUP target for RPS auth.
        /// </summary>
        /// <value type="String"></value>
        var env = this.environment.toUpperCase();
        switch (env) {
            case 'PROD':
                return 'ssl.live.com';
            case 'INT':
                return 'ssl.live-int.com';
            default:
                Debug.assert(false, 'Unknown environment: ' + env);
                return null;
        }

    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supPolicy", {
    get: function() {
        /// <summary>
        ///     Gets the SUP policy for RPS auth.
        /// </summary>
        /// <value type="String"></value>
        return 'mbi_ssl';
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "shareAnythingApiRootUrl", {
    get: function() {
        /// <summary>
        ///     Gets the Share Anything API root URL.
        /// </summary>
        /// <value type="String"></value>
        var env = this.environment.toUpperCase();
        switch (env) {
            case 'PROD':
                // check to see which endpoint we need to hit, depending on whether this is a DF account or not.
                if (People.RecentActivity.Platform.AuthInfo.hasBetaAccount()) {
                    return 'https://api-df.live.net';
                }
                else {
                    return 'https://api.live.net';
                }

            case 'INT':
                return 'https://api.live-tst.net';
            default:
                Debug.assert(false, 'Unknown environment: ' + env);
                return null;
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "shareAnythingApiAppId", {
    get: function() {
        /// <summary>
        ///     Gets the Share Anything API root URL.
        /// </summary>
        /// <value type="String"></value>
        var env = this.environment.toUpperCase();
        switch (env) {
            case 'PROD':
                return '1141135368';
            case 'INT':
                return '1745014021';
            default:
                Debug.assert(false, 'Unknown environment: ' + env);
                return null;
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "soxeEndpointUrl", {
    get: function() {
        /// <summary>
        ///     Gets the SOXE URL.
        /// </summary>
        /// <value type="String"></value>
        var env = this.environment.toUpperCase();
        switch (env) {
            case 'PROD':
                // check to see which endpoint we need to hit, depending on whether this is a DF account or not.
                if (People.RecentActivity.Platform.AuthInfo.hasBetaAccount()) {
                    return 'https://profile-df.live.com/handlers/soxe.mvc';
                }
                else {
                    return 'https://profile.live.com/handlers/soxe.mvc';
                }

            case 'INT':
                return 'https://profile.live-int.com/handlers/soxe.mvc';
            default:
                Debug.assert(false, 'Unknown environment: ' + env);
                return null;
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "soxeTarget", {
    get: function() {
        /// <summary>
        ///     Gets the SOXE target for RPS auth.
        /// </summary>
        /// <value type="String"></value>
        var env = this.environment.toUpperCase();
        switch (env) {
            case 'PROD':
                return 'profile.live.com';
            case 'INT':
                return 'profile.live-int.com';
            default:
                Debug.assert(false, 'Unknown environment: ' + env);
                return null;
        }

    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "soxePolicy", {
    get: function() {
        /// <summary>
        ///     Gets the SOXE policy for RPS auth.
        /// </summary>
        /// <value type="String"></value>
        return 'mbi_ssl';
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "snRootUrl", {
    get: function() {
        /// <summary>
        ///     Gets the SN API root URL.
        /// </summary>
        /// <value type="String"></value>
        return 'http://api.live.net';
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "legacyRestRootUrl", {
    get: function() {
        /// <summary>
        ///     Gets the Legacy REST root URL.
        /// </summary>
        /// <value type="String"></value>
        return 'https://api.facebook.com';
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "fqlRootUrl", {
    get: function() {
        /// <summary>
        ///     Gets the FQL root URL.
        /// </summary>
        /// <value type="String"></value>
        return 'https://graph.facebook.com';
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "graphApiRootUrl", {
    get: function() {
        /// <summary>
        ///     Gets the graph API root URL.
        /// </summary>
        /// <value type="String"></value>
        return 'https://graph.facebook.com';
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedContacts", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached contacts.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 20;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedEntriesPerContact", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached entries per contact.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 250;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedAlbumsPerContact", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached albums per contact.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 100;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedPhotosPerAlbum", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached photos per album.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 2000;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedPhotoTagsPerPhoto", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached photo tags per photo.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 100;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "feedEntriesBatchSize", {
    get: function() {
        /// <summary>
        ///     Gets the number of feed entries per batch we retrieve.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 50;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "feedEntriesMinBatchSize", {
    get: function () {
        /// <summary>
        ///     Gets the minimum number of feed entries per batch required to consider it to be "complete."
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 40;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "feedEntriesMaxCount", {
    get: function() {
        /// <summary>
        ///     Gets the max count of feed entries we will retrieve.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 250;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedCommentsPerEntry", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached comments per entry.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 50;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedReactionsPerEntry", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached reactions per entry.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 100;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedNotificationsPerNetwork", {
    get: function() {
        /// <summary>
        ///     Gets the max number of cached notifications per network.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 100;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "maxCachedFeedObjects", {
    get: function() {
        /// <summary>
        ///     Gets the max cached feed objects in FeedObjectCache.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 50;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "offlineCacheRetrievalThreshold", {
    get: function() {
        /// <summary>
        ///     Gets the threshold in seconds elapsed since last time the cache is updated for a contact.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return 259200;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supportedNetworks", {
    get: function() {
        /// <summary>
        ///     Gets all supported networks, which are normally an aggregate of networks we support for RA and Photo.
        /// </summary>
        /// <value type="Array" elementType="String"></value>
        if (this._supportedNetworks == null) {
            this._supportedNetworks = this._getSupportedNetworks();
        }

        return this._supportedNetworks;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supportedNetworksForRecentActivity", {
    get: function() {
        /// <summary>
        ///     Gets the supported networks.
        /// </summary>
        /// <value type="Array" elementType="String"></value>
        return [ People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.NetworkId.twitter ];
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supportedNetworksForPhoto", {
    get: function() {
        /// <summary>
        ///     Gets the supported networks for photos.
        /// </summary>
        /// <value type="Array" elementType="String"></value>
        return [ People.RecentActivity.Core.NetworkId.facebook ];
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supportedNetworksForNotification", {
    get: function() {
        /// <summary>
        ///     Gets the supported networks for notifications
        /// </summary>
        /// <value type="Array" elementType="String"></value>
        return [ People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.NetworkId.twitter ];
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "supportedNetworksForShare", {
    get: function() {
        /// <summary>
        ///     Gets the supported networks for sharing.
        /// </summary>
        /// <value type="Array" elementType="String"></value>
        return [ People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.NetworkId.twitter ];
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "aggregatedNetworkId", {
    get: function() {
        /// <summary>
        ///     Gets the aggregated network ID.
        /// </summary>
        /// <value type="String"></value>
        return People.RecentActivity.Core.NetworkId.all;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Platform.Configuration.prototype, "whatsNewPersonId", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the What's New person.
        /// </summary>
        /// <value type="String"></value>
        return '__WHATSNEW__';
    },
    configurable: true
});

People.RecentActivity.Platform.Configuration.prototype.getNetworkReactionInfos = function(networkId) {
    /// <summary>
    ///     Gets an array of <see cref="T:People.RecentActivity.Core.NetworkReactionInfo" /> for a given network..
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <returns type="Array" elementType="networkReactionInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    this._initializeReactionMaps();
    return People.RecentActivity.Platform.Configuration._reactionNetworkMap[networkId] || [];
};

People.RecentActivity.Platform.Configuration.prototype.getNetworkReactionInfoByType = function(type) {
    /// <summary>
    ///     Gets the network reaction info based on the reaction type.(e.g. like)
    /// </summary>
    /// <param name="type" type="People.RecentActivity.Core.NetworkReactionInfoType">The type.</param>
    /// <returns type="People.RecentActivity.Core.create_networkReactionInfo"></returns>
    Debug.assert(type !== People.RecentActivity.Core.NetworkReactionInfoType.none, 'type');
    this._initializeReactionMaps();
    return People.RecentActivity.Platform.Configuration._reactionTypeMap[type];
};

People.RecentActivity.Platform.Configuration.prototype.getNetworkReactionInfoById = function (id) {
    /// <summary>
    ///     Gets the network reaction info based on the reaction ID.
    /// </summary>
    /// <param name="id" type="String"></param>
    Debug.assert(Jx.isNonEmptyString(id), 'Jx.isNonEmptyString(id)');

    this._initializeReactionMaps();

    return People.RecentActivity.Platform.Configuration._reactionIdMap[id];
};

People.RecentActivity.Platform.Configuration.prototype.getCommentIcon = function(networkId) {
    /// <summary>
    ///     Gets the icon for comments for a specific network.
    /// </summary>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    if (People.RecentActivity.Platform.Configuration._commentIcons == null) {
        var icons = {};
        icons[People.RecentActivity.Core.NetworkId.facebook] = '\ue206';
        icons[People.RecentActivity.Core.NetworkId.twitter] = '\ue248';
        People.RecentActivity.Platform.Configuration._commentIcons = icons;
    }

    return People.RecentActivity.Platform.Configuration._commentIcons[networkId];
};

People.RecentActivity.Platform.Configuration.prototype.getShareRefreshDelay = function (networkId) {
    /// <summary>
    ///     Gets the delay between sharing and refreshing the feed for a specific network.
    /// </summary>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <returns type="Number">The delay time, in milliseconds.</returns>
    switch (networkId) {
        case People.RecentActivity.Core.NetworkId.twitter:
            return 3000;

        default:
            return 0;
    }
};

People.RecentActivity.Platform.Configuration.prototype._initializeReactionMaps = function() {
    /// <summary>
    ///     Initializes the reaction maps.
    /// </summary>
    if (People.RecentActivity.Platform.Configuration._reactionNetworkMap != null) {
        return;
    }

    People.RecentActivity.Platform.Configuration._reactionNetworkMap = {};
    People.RecentActivity.Platform.Configuration._reactionTypeMap = {};
    People.RecentActivity.Platform.Configuration._reactionIdMap = {};

    // Initialize maps for network reaction info.
    // First up: Facebook
    People.RecentActivity.Platform.Configuration._reactionNetworkMap[People.RecentActivity.Core.NetworkId.facebook] = [
        People.RecentActivity.Core.create_networkReactionInfo('1', People.RecentActivity.Core.NetworkReactionInfoType.like, '/strings/raItemReaction-Like-', '\ue209', '\ue203', 'ra-networkReactionFBLike', true, false)
    ];

    // Close runner up: Twitter
    People.RecentActivity.Platform.Configuration._reactionNetworkMap[People.RecentActivity.Core.NetworkId.twitter] = [
        People.RecentActivity.Core.create_networkReactionInfo('3', People.RecentActivity.Core.NetworkReactionInfoType.favorite, '/strings/raItemReaction-Favorite-', '\ue249', '\ue113', 'ra-networkReactionTWITRFavorite', false, true),
        People.RecentActivity.Core.create_networkReactionInfo('2', People.RecentActivity.Core.NetworkReactionInfoType.retweet, '/strings/raItemReaction-Retweet-', '\ue207', '\ue201', 'ra-networkReactionTWITRRetweet', false, false)
    ];

    for (var n = 0, coll = this.supportedNetworksForRecentActivity; n < coll.length; n++) {
        var networkId = coll[n];

        var networkReactionInfos = People.RecentActivity.Platform.Configuration._reactionNetworkMap[networkId];
        if (networkReactionInfos != null) {
            for (var o = 0; o < networkReactionInfos.length; o++) {
                var info = networkReactionInfos[o];
                People.RecentActivity.Platform.Configuration._reactionTypeMap[info.type] = info;
                People.RecentActivity.Platform.Configuration._reactionIdMap[info.id] = info;
            }        
        }    
    }
};

People.RecentActivity.Platform.Configuration.prototype._getSupportedNetworks = function() {
    /// <returns type="Array" elementType="String"></returns>
    var networks = [];
        networks.push.apply(networks, this.supportedNetworksForRecentActivity);
    for (var n = 0, coll = this.supportedNetworksForPhoto; n < coll.length; n++) {
        var network = coll[n];
        if (networks.indexOf(network) === -1) {
            networks.push(network);
        }    
    }

    return networks;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\EventArgs.js" />
/// <reference path="ConnectedNetworkChangedEventType.js" />
/// <reference path="PsaStatus.js" />

People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs = function(sender, type, sourceId) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.Platform.ConnectedNetworkChangedEventHandler" />.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="type" type="People.RecentActivity.Platform.ConnectedNetworkChangedEventType">The event type.</param>
    /// <param name="sourceId" type="String">The source id.</param>
    /// <field name="_type$1" type="People.RecentActivity.Platform.ConnectedNetworkChangedEventType"></field>
    /// <field name="_souceId$1" type="String"></field>
    /// <field name="_networkName$1" type="String"></field>
    /// <field name="_networkIcon$1" type="String"></field>
    /// <field name="_token$1" type="String"></field>
    /// <field name="_userId$1" type="String"></field>
    /// <field name="_socialScenarioState$1" type="People.RecentActivity.Platform.PsaStatus"></field>
    /// <field name="_publishScenarioState$1" type="People.RecentActivity.Platform.PsaStatus"></field>
    People.RecentActivity.EventArgs.call(this, sender);
    Debug.assert(!!type, 'type');
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    this._type$1 = type;
    this._souceId$1 = sourceId;
};

Jx.inherit(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._type$1 = 0;
People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._souceId$1 = null;
People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._networkName$1 = null;
People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._networkIcon$1 = null;
People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._token$1 = null;
People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._userId$1 = null;
People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._socialScenarioState$1 = 0;
People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype._publishScenarioState$1 = 0;

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "type", {
    get: function() {
        /// <summary>
        ///     Gets the event type.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.ConnectedNetworkChangedEventType"></value>
        return this._type$1;
    }
});

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "sourceId", {
    get: function() {
        /// <summary>
        ///     Gets the source id for the network.
        /// </summary>
        /// <value type="String"></value>
        return this._souceId$1;
    }
});

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "networkIcon", {
    get: function() {
        /// <summary>
        ///     Gets or sets the network icon.
        /// </summary>
        /// <value type="String"></value>
        return this._networkIcon$1;
    },
    set: function(value) {
        this._networkIcon$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "networkName", {
    get: function() {
        /// <summary>
        ///     Gets or sets the network name.
        /// </summary>
        /// <value type="String"></value>
        return this._networkName$1;
    },
    set: function(value) {
        this._networkName$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "token", {
    get: function() {
        /// <summary>
        ///     Gets or sets the token.
        /// </summary>
        /// <value type="String"></value>
        return this._token$1;
    },
    set: function(value) {
        this._token$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "userId", {
    get: function() {
        /// <summary>
        ///     Gets or sets the user id.
        /// </summary>
        /// <value type="String"></value>
        return this._userId$1;
    },
    set: function(value) {
        this._userId$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "socialScenarioState", {
    get: function() {
        /// <summary>
        ///     Gets or sets the current social scenario state.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.PsaStatus"></value>
        return this._socialScenarioState$1;
    },
    set: function(value) {
        this._socialScenarioState$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs.prototype, "publishScenarioState", {
    get: function() {
        /// <summary>
        ///     Gets or sets the current publish scenario state.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.PsaStatus"></value>
        return this._publishScenarioState$1;
    },
    set: function(value) {
        this._publishScenarioState$1 = value;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the event type.
/// </summary>
People.RecentActivity.Platform.ConnectedNetworkChangedEventType = {
    /// <field name="none" type="Number" integer="true" static="true">An unknown change.</field>
    none: 0,

    /// <field name="connected" type="Number" integer="true" static="true">A network is connected.</field>
    connected: 1,

    /// <field name="disconnected" type="Number" integer="true" static="true">A network is disconnected.</field>
    disconnected: 2,

    /// <field name="updated" type="Number" integer="true" static="true">A network has been updated.</field>
    updated: 3,

    /// <field name="scenarioStateUpdated" type="Number">The scenario state was updated.</field>
    scenarioStateUpdated: 4,

    /// <field name="userIdUpdated" type="Number">The user ID was updated.</field>
    userIdUpdated: 5,
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Platform.ContactId = function(id, sourceId) {
    /// <summary>
    ///     Represents a contact id.
    /// </summary>
    /// <param name="id" type="String">The id.</param>
    /// <param name="sourceId" type="String">The source network id.</param>
    /// <field name="sourceId" type="String">The source network id of the contact.</field>
    /// <field name="id" type="String">The id of the contact.</field>
    Debug.assert(id != null, 'id');
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    this.id = id;
    this.sourceId = sourceId;
};


People.RecentActivity.Platform.ContactId.prototype.sourceId = null;
People.RecentActivity.Platform.ContactId.prototype.id = null;

People.RecentActivity.Platform.ContactId.prototype.equals = function(contactId) {
    /// <summary>
    ///     Returns if two <see cref="T:People.RecentActivity.Platform.ContactId" /> are equal.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The <see cref="T:People.RecentActivity.Platform.ContactId" /> to compare.</param>
    /// <returns type="Boolean"></returns>
    if (contactId == null) {
        return false;
    }

    return contactId.id.toUpperCase() === this.id.toUpperCase() && contactId.sourceId.toUpperCase() === this.sourceId.toUpperCase();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ContactInfo.js" />
/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Core\NetworkInfo.js" />
/// <reference path="AuthInfo.js" />
/// <reference path="Configuration.js" />
/// <reference path="ConnectedNetworkChangedEventArgs.js" />
/// <reference path="ConnectedNetworkChangedEventType.js" />
/// <reference path="ContactId.js" />
/// <reference path="MockPlatform.js" />
/// <reference path="PsaStatus.js" />
/// <reference path="RealPlatform.js" />

People.RecentActivity.Platform.Platform = function() {
    /// <summary>
    ///     Represents the contact platform.
    /// </summary>
    /// <field name="_networkMap" type="Object">The network map.</field>
    /// <field name="_allNetworkName" type="String">The All network name.</field>
    /// <field name="_instance" type="People.RecentActivity.Platform.Platform" static="true">The instance.</field>
    /// <field name="_initialized" type="Boolean">Whether the platform has been initialized.</field>
    this._networkMap = {};
    this._allNetworkName = Jx.res.getString('/strings/raNetworkAllName');
};

Jx.mix(People.RecentActivity.Platform.Platform.prototype, Jx.Events);
Jx.mix(People.RecentActivity.Platform.Platform.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.Platform.Platform.prototype, "connectednetworkchanged");

People.RecentActivity.Platform.Platform._instance = null;

Object.defineProperty(People.RecentActivity.Platform.Platform, "instance", {
    get: function() {
        /// <summary>
        ///     Gets or sets the instance of <see cref="T:People.RecentActivity.Platform.Platform" />.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.Platform"></value>
        if (People.RecentActivity.Platform.Platform._instance == null) {
            People.RecentActivity.Platform.Platform._instance = new People.RecentActivity.Platform.RealPlatform();
            
            
            if (Jx.root.getPlatform().isMock) {
                // we have to use the mock platform instead.
                People.RecentActivity.Platform.Platform._instance = new People.RecentActivity.Platform.MockPlatform();
            }
            

            People.RecentActivity.Platform.Platform._instance.initialize();
        }

        return People.RecentActivity.Platform.Platform._instance;
    },
    set: function(value) {
        Debug.assert(value != null, 'platform');
        People.RecentActivity.Platform.Platform._instance = value;
        People.RecentActivity.Platform.Platform._instance.initialize();
    }
});

People.RecentActivity.Platform.Platform.findContactBySourceId = function(contacts, sourceId) {
    /// <summary>
    ///     Finds a contact by source ID.
    /// </summary>
    /// <param name="contacts" type="Microsoft.WindowsLive.Platform.Collection">The contacts.</param>
    /// <param name="sourceId" type="String">The source ID.</param>
    /// <returns type="Microsoft.WindowsLive.Platform.Contact"></returns>
    if ((contacts == null) || (!contacts.count)) {
        // no contacts available, short-circuit.
        return null;
    }

    for (var i = 0, len = contacts.count; i < len; i++) {
        var contact = contacts.item(i);
        if (contact.account.sourceId === sourceId) {
            // we found the appropriate contact.
            return contact;
        }    
    }

    return null;
};

People.RecentActivity.Platform.Platform.getNicknameBySourceId = function(dataSource, sourceId) {
    /// <summary>
    ///     Gets a nickname by source ID.
    /// </summary>
    /// <param name="dataSource" type="People.IdentityControlDataSource">The data source.</param>
    /// <param name="sourceId" type="String">The source ID.</param>
    /// <returns type="String"></returns>
    Debug.assert(dataSource != null, 'dataSource != null');
    switch (dataSource.objectType) {
        case 'literal':
            // use the aggregated result, a literal contact has no linked contacts.
            return dataSource.nickname;
        case 'MeContact':
            // unfortunately "Me" doesn't have a nickname associated with it.
            return '';
        default:
            // find the appropriate contact (based on the context ID).
            var contact = People.RecentActivity.Platform.Platform.findContactBySourceId((dataSource.linkedContacts), sourceId);
            return (contact != null) ? contact.nickname : '';
    }
};


People.RecentActivity.Platform.Platform.prototype._networkMap = null;
People.RecentActivity.Platform.Platform.prototype._allNetworkName = null;
People.RecentActivity.Platform.Platform.prototype._initialized = false;

People.RecentActivity.Platform.Platform.prototype.getContactId = function(personId, networkId) {
    /// <summary>
    ///     Gets a <see cref="T:People.RecentActivity.Platform.ContactId" /> for the given person+network combination.
    /// </summary>
    /// <param name="personId" type="String">The ID of the person.</param>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <returns type="People.RecentActivity.Platform.ContactId"></returns>
    Debug.assert(Jx.isNonEmptyString(personId), 'personId');
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    if (personId === People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId || networkId === People.RecentActivity.Platform.Configuration.instance.aggregatedNetworkId) {
        // For user's WNF, we use the fake id to initialize contact id.
        // For aggregated network, doesn't make sense to get the person's per network contact id, we
        // just use the personId here.
        return new People.RecentActivity.Platform.ContactId(personId, networkId);
    }

    if (personId === this.getUserPersonId()) {
        return People.RecentActivity.Platform.AuthInfo.getInstance(networkId).userId;
    }

    var person = Jx.root.getPlatform().peopleManager.tryLoadPerson(personId);
    if (person == null) {
        return null;
    }

    var contact = this.getContactForNetwork(person, networkId);
    if (contact != null) {
        // we found a contact for the given network.
        return new People.RecentActivity.Platform.ContactId(contact.thirdPartyObjectId, networkId);
    }

    return null;
};

People.RecentActivity.Platform.Platform.prototype.getNetworks = function(personId) {
    /// <summary>
    ///     Gets the networks for a person.
    /// </summary>
    /// <param name="personId" type="String">The person ID.</param>
    /// <returns type="Array" elementType="networkInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(personId), 'personId');

    // create a list of networks we support.
    var networks = [];

    if (Jx.root == null) {
        Jx.log.write(3, People.Social.format('Platform.GetNetworks({0}): Jx.root is null. The app might be shutting down.', personId));
        return networks;
    }

    if ((personId === People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId) || (personId === this.getUserPersonId())) {
        networks.push.apply(networks, this.getMePersonNetworks());
    }
    else {
        networks.push.apply(networks, this._getPersonNetworks(personId));
    }

    var aggregated = this._createNetworkInfo(People.RecentActivity.Platform.Configuration.instance.aggregatedNetworkId, null, null, this._allNetworkName, null);

    // Append the aggregated network.
    networks.push(aggregated);
    return networks;
};

People.RecentActivity.Platform.Platform.prototype.getUserConnectableNetworks = function() {
    /// <summary>
    ///     Gets the connectable networks for the user.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    return this.getConnectableNetworks();
};

People.RecentActivity.Platform.Platform.prototype.getContactInfoDetails = function(info) {
    /// <summary>
    ///     Gets the contact info details.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo">The info.</param>
    // For real platform, we don't query LiveComm here, since it will be done at model layer.
};

People.RecentActivity.Platform.Platform.prototype.getPlatformPerson = function(info) {
    /// <summary>
    ///     Gets the platform person information.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo">The contact info.</param>
    /// <returns type="Microsoft.WindowsLive.Platform.Person"></returns>
    Debug.assert(info != null, 'info');
    var person = null;
    if (Jx.root == null) {
        Jx.log.write(2, People.Social.format('Platform.GetPlatformPerson({0},{1}): Jx.root is null!', info.id, info.name));
        return null;
    }

    try {
        var platform = Jx.root.getPlatformCache();
        if (info.id === People.RecentActivity.Platform.AuthInfo.getInstance(info.sourceId).userId.id) {
            person = platform.getDefaultMeContact();
        }
        else {
            person = platform.getPlatform().peopleManager.tryLoadPersonBySourceIDAndObjectID(info.sourceId, info.id);
        }

    }
    catch (ex) {
        Jx.log.write(2, People.Social.format('Platform.GetPlatformPerson({0},{1}): Failed to get person info from LiveComm: {2}.', info.id, info.name, ex.message));
        return null;
    }

    return person;
};

People.RecentActivity.Platform.Platform.prototype.getUserPersonId = function() {
    /// <summary>
    ///     Gets me person id.
    /// </summary>
    /// <returns type="String"></returns>
    return this.getUserPerson().objectId;
};

People.RecentActivity.Platform.Platform.prototype.getNetworkInfoById = function(sourceId, objectId, networkIcon, networkName) {
    /// <summary>
    ///     Gets the <see cref="T:People.RecentActivity.Core.NetworkInfo" /> instance by ID.
    /// </summary>
    /// <param name="sourceId" type="String">The source id.</param>
    /// <param name="objectId" type="String">The object id.</param>
    /// <param name="networkIcon" type="String">The network icon.</param>
    /// <param name="networkName" type="String">The provided network name.</param>
    /// <returns type="People.RecentActivity.Core.create_networkInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    Debug.assert(this.isNetworkSupported(sourceId), 'networkName');

    if (!!Jx.isUndefined(this._networkMap[sourceId])) {
        var user = this._getUserContactInfo(sourceId);

        if (!Jx.isNonEmptyString(networkName)) {
            // attempt to get the network name from LiveID.
            networkName = People.RecentActivity.Platform.AuthInfo.getInstance(sourceId).networkName;
        }

        this._networkMap[sourceId] = this._createNetworkInfo(sourceId, objectId, networkIcon, networkName, user);
    }

    return this._networkMap[sourceId];
};

People.RecentActivity.Platform.Platform.prototype.getUserPerson = function() {
    /// <summary>
    ///     Gets the user person.
    /// </summary>
    /// <returns type="Microsoft.WindowsLive.Platform.Person"></returns>
    // get the "me" person by simply asking for the Me contact, and then getting the Person object from it.
    var account = Jx.root.getPlatformCache().getDefaultAccount();
    return account.meContact.person;
};

People.RecentActivity.Platform.Platform.prototype.initialize = function() {
    /// <summary>
    ///     Initializes this instance.
    /// </summary>
    if (!this._initialized) {
        this._initialized = true;
        People.RecentActivity.Platform.AuthInfo.initialize();
        this.onInitialize();
    }
};

People.RecentActivity.Platform.Platform.prototype.getMePersonNetworks = function() {
    /// <summary>
    ///     Gets me person networks.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    return this._getPersonNetworks(this.getUserPersonId());
};

People.RecentActivity.Platform.Platform.prototype.getContactForNetwork = function(person, networkId) {
    /// <summary>
    ///     Gets the contact for a network.
    /// </summary>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">The person.</param>
    /// <param name="networkId" type="String">The network id.</param>
    /// <returns type="Microsoft.WindowsLive.Platform.Contact"></returns>
    Debug.assert(person != null, 'person');
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    var collection = person.linkedContacts;
    collection.lock();
    try {
        for (var i = 0, count = collection.count; i < count; i++) {
            // fetch the contact, and check the ID of the network.
            var contact = collection.item(i);
            if (this.getSourceId(contact) === networkId) {
                return contact;
            }        
        }

    }
    finally {
        // always make sure we unlock the collection.
        collection.unlock();
    }

    return null;
};

People.RecentActivity.Platform.Platform.prototype.isNetworkSupported = function(sourceId) {
    /// <summary>
    ///     Determines whether a network is supported.
    /// </summary>
    /// <param name="sourceId" type="String">The source id for the network.</param>
    /// <returns type="Boolean"></returns>
    return (People.RecentActivity.Platform.Configuration.instance.supportedNetworks.indexOf(sourceId) !== -1);
};

People.RecentActivity.Platform.Platform.prototype.onConnectedNetworkChanged = function(type, sourceId, networkIcon, networkName, token, userId, socialScenarioState, publishScenarioState) {
    /// <summary>
    ///     Called when the connected networks are changed.
    /// </summary>
    /// <param name="type" type="People.RecentActivity.Platform.ConnectedNetworkChangedEventType">The event type.</param>
    /// <param name="sourceId" type="String">The source id.</param>
    /// <param name="networkIcon" type="String">The network icon.</param>
    /// <param name="networkName" type="String">The network name.</param>
    /// <param name="token" type="String">The token.</param>
    /// <param name="userId" type="String">The user id.</param>
    /// <param name="socialScenarioState" type="People.RecentActivity.Platform.PsaStatus">The social scenario state.</param>
    /// <param name="publishScenarioState" type="People.RecentActivity.Platform.PsaStatus">The publish scenario state.</param>
    Jx.log.write(4, People.Social.format('Platform.OnConnectedNetworkChanged({0},{1},{2},{3},{4})', type, sourceId, networkIcon, networkName, token != null));

    if (token != null) {
        Jx.log.pii('Token: ' + token);
    }

    var args = new People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs(this, type, sourceId);
    args.networkIcon = networkIcon;
    args.networkName = networkName;
    args.token = token;
    args.userId = userId;
    args.socialScenarioState = socialScenarioState;
    args.publishScenarioState = publishScenarioState;

    this.raiseEvent("connectednetworkchanged", args);
};

People.RecentActivity.Platform.Platform.prototype.onNetworkNameUpdated = function(sourceId, networkName) {
    /// <summary>
    ///     Called when the name of a network was updated.
    /// </summary>
    /// <param name="sourceId" type="String">The source ID.</param>
    /// <param name="networkName" type="String">The network name.</param>
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    if (!Jx.isUndefined(this._networkMap[sourceId])) {
        // update the name on the cached network info, then raise the event.
        this._networkMap[sourceId].name = networkName;

        this.onConnectedNetworkChanged(
            People.RecentActivity.Platform.ConnectedNetworkChangedEventType.updated,
            sourceId,
            null,   // networkICon
            networkName,
            null,   // token
            null,   // thirdPartyUserId
            0,      // socialScenarioState
            0);     // publishScenarioState
    }
};

People.RecentActivity.Platform.Platform.prototype.onNetworkIconUpdated = function(sourceId, networkIcon) {
    /// <summary>
    ///     Called when the icon of the network was updated.
    /// </summary>
    /// <param name="sourceId" type="String">The source ID.</param>
    /// <param name="networkIcon" type="String">The network icon.</param>
    Debug.assert(Jx.isNonEmptyString(sourceId), '!string.IsNullOrEmpty(sourceId)');
    if (!Jx.isUndefined(this._networkMap[sourceId])) {
        // update the name of the cached network info, then raise the event.
        this._networkMap[sourceId].icon = networkIcon;

        this.onConnectedNetworkChanged(
            People.RecentActivity.Platform.ConnectedNetworkChangedEventType.updated,
            sourceId,
            networkIcon,
            null,   // networkName
            null,   // token
            null,   // thirdPartyUserId
            0,      // socialScenarioState
            0);     // publishScenarioState
    }
};

People.RecentActivity.Platform.Platform.prototype.onNetworkScenarioStateChanged = function (sourceId, socialScenarioState, publishScenarioState) {
    /// <summary>Called when the social and/or publish scenario state have changed.</summary>
    if (!Jx.isUndefined(this._networkMap[sourceId])) {
        // update the third party user ID.
        this.onConnectedNetworkChanged(
            People.RecentActivity.Platform.ConnectedNetworkChangedEventType.scenarioStateUpdated,
            sourceId,
            null,   // networkIcon
            null,   // networkName
            null,   // token
            null,   // thirdPartyUserId
            socialScenarioState,
            publishScenarioState);
    }
};

People.RecentActivity.Platform.Platform.prototype.onNetworkThirdPartyUserIdChanged = function (sourceId, thirdPartyUserId) {
    /// <summary>Called when the third party user ID of a network has changed.</summary>
    if (!Jx.isUndefined(this._networkMap[sourceId])) {
        // update the third party user ID.
        this.onConnectedNetworkChanged(
            People.RecentActivity.Platform.ConnectedNetworkChangedEventType.userIdUpdated,
            sourceId,
            null,   // networkIcon
            null,   // networkName
            null,   // token
            thirdPartyUserId,
            0,      // socialScenarioState
            0);     // publishScenarioState
    }
};

People.RecentActivity.Platform.Platform.prototype._getPersonNetworks = function(personId) {
    /// <param name="personId" type="String"></param>
    /// <returns type="Array" elementType="networkInfo"></returns>
    // fetch the person from the platform.
    var person = Jx.root.getPlatform().peopleManager.tryLoadPerson(personId);
    if (person == null) {
        // apparently this person does not exist, which is kind of weird.
        return new Array(0);
    }

    var networks = [];
    var collection = person.linkedContacts;
    collection.lock();
    try {
        for (var i = 0; i < collection.count; i++) {
            var contact = collection.item(i);
            var sourceId = this.getSourceId(contact);
            if (this.isNetworkSupported(sourceId)) {
                networks.push(this.getNetworkInfoById(sourceId, this.getObjectId(contact), this.getNetworkIcon(contact), this.getNetworkName(contact)));
            }        
        }

    }
    finally {
        collection.unlock();
    }

    return networks;
};

People.RecentActivity.Platform.Platform.prototype._getUserContactInfo = function(networkId) {
    /// <param name="networkId" type="String"></param>
    /// <returns type="People.RecentActivity.Core.create_contactInfo"></returns>
    var id = People.RecentActivity.Platform.AuthInfo.getInstance(networkId).userId.id;

    if (Jx.isNonEmptyString(id)) {
        var info = People.RecentActivity.Core.create_contactInfo(id, networkId, '', '', '', true);
        this.getContactInfoDetails(info);
        return info;
    }
    else {
        Jx.log.write(3, People.Social.format('Platform._getUserContactInfo({0}): userId is null or empty', networkId));
        return null;
    }
};

People.RecentActivity.Platform.Platform.prototype._createNetworkInfo = function(networkId, networkObjectId, networkIcon, networkName, userContact) {
    /// <param name="networkId" type="String"></param>
    /// <param name="networkObjectId" type="String"></param>
    /// <param name="networkIcon" type="String"></param>
    /// <param name="networkName" type="String"></param>
    /// <param name="userContact" type="People.RecentActivity.Core.create_contactInfo"></param>
    /// <returns type="People.RecentActivity.Core.create_networkInfo"></returns>
    Jx.log.write(4, People.Social.format('Platform.CreateNetworkInfo({0},{1},{2}).', networkId, networkName, userContact != null));

    if (userContact != null) {
        Jx.log.pii(People.Social.format('{0}, {1}', userContact.id, userContact.name));
    }

    var configuration = People.RecentActivity.Platform.Configuration.instance;

    return People.RecentActivity.Core.create_networkInfo(
        networkId,
        networkObjectId,
        networkIcon,
        networkName,
        networkId === People.RecentActivity.Core.NetworkId.all, // isAggregated
        true, // isCommentsEnabled
        true, // isNotificationsEnabled
        configuration.getNetworkReactionInfos(networkId),
        userContact,
        configuration.getShareRefreshDelay(networkId));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the current PSA status.
/// </summary>
People.RecentActivity.Platform.PsaStatus = {
    /// <field name="none" type="Number" integer="true" static="true">We haven't got any information yet.</field>
    none: 0,
    /// <field name="connected" type="Number" integer="true" static="true">The account is connected.</field>
    connected: 1,
    /// <field name="error" type="Number" integer="true" static="true">There is a PSA error that may prevent correct functionality.</field>
    error: 2,
    /// <field name="disconnected" type="Number" integer="true" static="true">The account is disconnected.</field>
    disconnected: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\NetworkId.js" />
/// <reference path="AuthInfo.js" />
/// <reference path="Platform.js" />
/// <reference path="PsaStatus.js" />

People.RecentActivity.Platform.RealPlatform = function() {
    /// <summary>
    ///     Represents the real contact platform.
    /// </summary>
    /// <field name="_fakeCid$1" type="String" static="true"></field>
    /// <field name="_accountCollectionChangedHandler$1" type="Microsoft.WindowsLive.Platform.Function"></field>
    /// <field name="_accountChangedHandler$1" type="Microsoft.WindowsLive.Platform.Function"></field>
    /// <field name="_accounts$1" type="Array"></field>
    /// <field name="_accountMap$1" type="Object"></field>
    /// <field name="_collection$1" type="Microsoft.WindowsLive.Platform.Collection"></field>
    People.RecentActivity.Platform.Platform.call(this);
    this._accountChangedHandler$1 = this._onAccountPropertyChanged$1.bind(this);
    this._accountCollectionChangedHandler$1 = this._onAccountCollectionChanged$1.bind(this);
    this._accounts$1 = [];
    this._accountMap$1 = {};
};

Jx.inherit(People.RecentActivity.Platform.RealPlatform, People.RecentActivity.Platform.Platform);

People.RecentActivity.Platform.RealPlatform._fakeCid$1 = '__cid__';
People.RecentActivity.Platform.RealPlatform.prototype._accountCollectionChangedHandler$1 = null;
People.RecentActivity.Platform.RealPlatform.prototype._accountChangedHandler$1 = null;
People.RecentActivity.Platform.RealPlatform.prototype._accounts$1 = null;
People.RecentActivity.Platform.RealPlatform.prototype._accountMap$1 = null;
People.RecentActivity.Platform.RealPlatform.prototype._collection$1 = null;

People.RecentActivity.Platform.RealPlatform.prototype.getAccount = function (sourceId) {
    /// <summary>Gets an account by source ID.</summary>
    return this._accountMap$1[sourceId];
};

People.RecentActivity.Platform.RealPlatform.prototype.getUserPersonCid = function() {
    /// <summary>
    ///     Gets the user person CID.
    /// </summary>
    /// <returns type="String"></returns>
    try {
        var cid = Jx.root.getPlatformCache().getDefaultMeContact().cid.value;
        return Microsoft.WindowsLive.Cid.CidFormatter.toString(cid, Microsoft.WindowsLive.Cid.CidFormat.decimal);
    }
    catch (ex) {
        Jx.log.write(2, 'Failed to get cid from platform: ' + ex.message);
        return '__cid__';
    }
};

People.RecentActivity.Platform.RealPlatform.prototype.onInitialize = function() {
    /// <summary>
    ///     Called when the platform is initialized.
    /// </summary>
    var manager = Jx.root.getPlatform().accountManager;

    // fetch the connected accounts for the Social scenario.
    this._collection$1 = manager.getConnectedAccountsByScenario(Microsoft.WindowsLive.Platform.ApplicationScenario.social, Microsoft.WindowsLive.Platform.ConnectedFilter.normal, Microsoft.WindowsLive.Platform.AccountSort.rank);

    if (this._collection$1 == null) {
        Jx.log.write(2, 'The platform returned null from getConnectedAccountsByScenario');
        return;
    }

    // monitor the collection for any changes.
    this._collection$1.addEventListener('collectionchanged', this._accountCollectionChangedHandler$1);

    // populate the list of accounts (do not touch the platform collection every single time)
    for (var i = 0; i < this._collection$1.count; i++) {
        var account = this._collection$1.item(i);
            account.addEventListener('changed', this._accountChangedHandler$1);

        this._accounts$1.push(account);
        this._accountMap$1[account.sourceId] = account;
    }

    Jx.log.write(4, People.Social.format('RealPlatform.OnInitialize(Count={0})', this._collection$1.count));

    // once we're done we can unlock it.
    this._collection$1.unlock();
    for (var i = 0, len = this._accounts$1.length; i < len; i++) {
        var account = this._accounts$1[i];

        if (this.isNetworkSupported(account.sourceId)) {
            this._populateAuthInfoFromAccount$1(account);
        }    
    }
};

People.RecentActivity.Platform.RealPlatform.prototype.getSourceId = function(contact) {
    /// <summary>
    ///     Gets the source id for a contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return contact.account.sourceId;
};

People.RecentActivity.Platform.RealPlatform.prototype.getObjectId = function(contact) {
    /// <summary>
    ///     Gets the object ID for a contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return contact.account.objectId;
};

People.RecentActivity.Platform.RealPlatform.prototype.getNetworkName = function(contact) {
    /// <summary>
    ///     Gets the network name of the contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    Debug.assert(contact != null, 'contact');

    return this._getNetworkNameFromAccount$1(contact.account);
};

People.RecentActivity.Platform.RealPlatform.prototype.getNetworkIcon = function(contact) {
    /// <summary>
    ///     Gets the network icon of the contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    Debug.assert(contact != null, 'contact != null');

    return this._getNetworkIconFromAccount$1(contact.account);
};

People.RecentActivity.Platform.RealPlatform.prototype.getMePersonNetworks = function() {
    /// <summary>
    ///     Gets me person networks.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    // Need to special case me person, since in M3 me person's linked contacts don't include 3rd party me contact, we need to get all connected account.
    var networks = [];

    for (var i = 0, len = this._accounts$1.length; i < len; i++) {
        // only add networks we support of course.
        var account = this._accounts$1[i];

        if (this.isNetworkSupported(account.sourceId)) {
            networks.push(
                this.getNetworkInfoById(
                    account.sourceId,
                    account.objectId,
                    this._getNetworkIconFromAccount$1(account),
                    this._getNetworkNameFromAccount$1(account)));
        }    
    }

    return networks;
};

People.RecentActivity.Platform.RealPlatform.prototype.getConnectableNetworks = function() {
    /// <summary>
    ///     Gets the info for the user's connectable networks.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    var networks = [];

    var collection = Jx.root.getPlatform().accountManager.getConnectableAccountsByScenario(Microsoft.WindowsLive.Platform.ApplicationScenario.publish, Microsoft.WindowsLive.Platform.ConnectableFilter.normal);
        collection.lock();

    try {
        for (var i = 0; i < collection.count; i++) {
            var account = collection.item(i);
            var sourceId = account.sourceId;

            if (this.isNetworkSupported(sourceId)) {
                networks.push(this.getNetworkInfoById(sourceId, account.objectId, account.iconMediumUrl, account.displayName));
            }        
        }

    }
    finally {
        collection.unlock();
    }

    return networks;
};

People.RecentActivity.Platform.RealPlatform.prototype._getNetworkNameFromAccount$1 = function(account) {
    /// <param name="account" type="Microsoft.WindowsLive.Platform.Account"></param>
    /// <returns type="String"></returns>
    Debug.assert(account != null, 'account');

    var displayName = account.displayName;
    var serviceName = account.serviceName;

    Jx.log.write(4, People.Social.format('RealPlatform.GetNetworkNameFromAccount({0},{1})', displayName, serviceName));

    if (Jx.isNonEmptyString(displayName)) {
        return displayName;
    }

    if (Jx.isNonEmptyString(serviceName)) {
        return serviceName;
    }

    return null;
};

People.RecentActivity.Platform.RealPlatform.prototype._getNetworkIconFromAccount$1 = function(account) {
    /// <param name="account" type="Microsoft.WindowsLive.Platform.Account"></param>
    /// <returns type="String"></returns>
    Debug.assert(account != null, 'account != null');

    return account.iconMediumUrl;
};

People.RecentActivity.Platform.RealPlatform.prototype._populateAuthInfoFromAccount$1 = function(account) {
    /// <param name="account" type="Microsoft.WindowsLive.Platform.Account"></param>
    Jx.log.write(4, People.Social.format('RealPlatform.PopulateAuthInfoFromAccount({0},{1},{2},{3},{4})', account.sourceId, account.displayName, account.serviceName, account.socialScenarioState, account.publishScenarioState));

    this.onConnectedNetworkChanged(
        1,
        account.sourceId,
        account.iconMediumUrl,
        account.displayName || account.serviceName,
        null, // token
        account.thirdPartyUserId,
        this._getPsaStatus$1(account.socialScenarioState),
        this._getPsaStatus$1(account.publishScenarioState));
};

People.RecentActivity.Platform.RealPlatform.prototype._getPsaStatus$1 = function(scenarioState) {
    /// <param name="scenarioState" type="Microsoft.WindowsLive.Platform.ScenarioState"></param>
    /// <returns type="People.RecentActivity.Platform.PsaStatus"></returns>
    if (scenarioState === Microsoft.WindowsLive.Platform.ScenarioState.connected) {
        return 1;
    }

    // We should only get accounts that are connected, upgradeRequired, or error, so just assume error here.
    return 2;
};

People.RecentActivity.Platform.RealPlatform.prototype._onAccountCollectionChanged$1 = function(e) {
    /// <param name="e" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs"></param>
    Debug.assert(e != null, 'e');

    var accounts = e.target;

    switch (e.eType) {
        case Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded:
            var account = accounts.item(e.index);
                account.addEventListener('changed', this._accountChangedHandler$1);

           var sourceId = account.sourceId;

            // cache the account locally.
            this._accounts$1.splice(e.index, 0, account);
            this._accountMap$1[sourceId] = account;

            if (this.isNetworkSupported(sourceId)) {
                var authInfo = People.RecentActivity.Platform.AuthInfo.getInstance(sourceId);
                if (authInfo.status !== 1) {
                    // populate the auth info from the account.
                    this._populateAuthInfoFromAccount$1(account);
                }            
            }

            break;
        case Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved:

            var account = this._accounts$1[e.index];
                account.removeEventListener('changed', this._accountChangedHandler$1);

            var sourceId = account.sourceId;

            // remove the account from the local cache.
            this._accounts$1.splice(e.index, 1);
            delete this._accountMap$1[sourceId];

            if (this.isNetworkSupported(sourceId)) {
                // we've got a new network, notify whoever is listening.
                this.onConnectedNetworkChanged(2, sourceId, null, null, null, null, 3, 3);
            }

            break;
    }
};

People.RecentActivity.Platform.RealPlatform.prototype._onAccountPropertyChanged$1 = function(e) {
    /// <param name="e" type="Microsoft.WindowsLive.Platform.ObjectChangedEventArgs"></param>
    Debug.assert(e != null, 'e');

    var account = e.target;

    // figure out if the name of the network has changed.
    var detail = e.detail;
    var changes = detail[0];

    for (var i = 0, len = changes.length; i < len; i++) {
        switch (changes[i]) {
            case 'displayName':
            case 'serviceName':
                Jx.log.write(4, 'Network name for ' + account.sourceId + ' has changed.');

                // the name of the network has been updated.
                this.onNetworkNameUpdated(account.sourceId, this._getNetworkNameFromAccount$1(account));
                break;

            case 'iconMediumUrl':
                Jx.log.write(4, 'Network icon for ' + account.sourceId + ' has changed.');

                // the icon of the network has been updated.
                this.onNetworkIconUpdated(account.sourceId, this._getNetworkIconFromAccount$1(account));
                break;

            case 'publishScenarioState':
            case 'socialScenarioState':
                Jx.log.write(4, changes[i] + ' for ' + account.sourceId + ' has changed.');

                this.onNetworkScenarioStateChanged(
                    account.sourceId,
                    this._getPsaStatus$1(account.socialScenarioState),
                    this._getPsaStatus$1(account.publishScenarioState));

                break;
            
            case 'thirdPartyUserId':
                Jx.log.write(4, 'ThirdPartyUserId for ' + account.sourceId + ' has changed.');

                // surface the change to AuthInfo.
                this.onNetworkThirdPartyUserIdChanged(account.sourceId, account.thirdPartyUserId);
                break;

            default:
                // we don't need this in ship or retail, but it's nice to have otherwise.
                Jx.log.write(4, 'Ignoring updated property for ' + account.sourceId + ': ' + changes[i]);
                break;
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="AuthInfo.js" />
/// <reference path="Configuration.js" />
/// <reference path="ConnectedNetworkChangedEventArgs.js" />
/// <reference path="Platform.js" />

People.RecentActivity.Platform.SocialCapabilities = function(target) {
    /// <summary>
    ///     Used to notify UI to show or hide a specific social section in the landing page.
    /// </summary>
    /// <param name="target" type="Object">The person or a temporary contact.</param>
    /// <field name="_recentActivity" type="String" static="true"></field>
    /// <field name="_photo" type="String" static="true"></field>
    /// <field name="_notification" type="String" static="true"></field>
    /// <field name="_share" type="String" static="true"></field>
    /// <field name="_personId" type="String"></field>
    /// <field name="_isUserPerson" type="Boolean"></field>
    /// <field name="_isWhatsNew" type="Boolean"></field>
    /// <field name="_isMe" type="Boolean"></field>
    /// <field name="_temporaryContactSourceId" type="String"></field>
    /// <field name="_capabilityMap" type="Object" static="true"></field>
    /// <field name="_meCapabilities" type="People.RecentActivity.Platform.SocialCapabilities" static="true"></field>
    /// <field name="_whatsNewCapabilities" type="People.RecentActivity.Platform.SocialCapabilities" static="true"></field>
    /// <field name="_initialized" type="Boolean"></field>
    /// <field name="_canShowWhatsNew" type="Boolean"></field>
    /// <field name="_canShowPhotos" type="Boolean"></field>
    /// <field name="_canShowNotifications" type="Boolean"></field>
    /// <field name="_canShare" type="Boolean"></field>
    /// <field name="_accountResourceChangedHandler" type="Microsoft.WindowsLive.Platform.Function"></field>
    /// <field name="_accountResource" type="Microsoft.WindowsLive.Platform.AccountResource"></field>
    if (target == null) {
        this._personId = People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId;
        this._isWhatsNew = true;
    }
    else {
        var type = target.objectType;
        if (type === 'literal') {
            this._temporaryContactSourceId = target.objectSourceId;
        }
        else {
            var person = target;
            this._personId = person.objectId;
            this._isMe = person.objectId === People.RecentActivity.Platform.SocialCapabilities._getMePerson().objectId;
        }    
    }

    this._isUserPerson = this._isWhatsNew || this._isMe;
    this._initialize();
};

Jx.mix(People.RecentActivity.Platform.SocialCapabilities.prototype, Jx.Events);
Jx.mix(People.RecentActivity.Platform.SocialCapabilities.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.Platform.SocialCapabilities.prototype, "propertychanged");

People.RecentActivity.Platform.SocialCapabilities._recentActivity = 'ra';
People.RecentActivity.Platform.SocialCapabilities._photo = 'photo';
People.RecentActivity.Platform.SocialCapabilities._notification = 'notification';
People.RecentActivity.Platform.SocialCapabilities._share = 'share';
People.RecentActivity.Platform.SocialCapabilities._capabilityMap = null;
People.RecentActivity.Platform.SocialCapabilities._meCapabilities = null;
People.RecentActivity.Platform.SocialCapabilities._whatsNewCapabilities = null;

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities, "meCapabilities", {
    get: function() {
        /// <summary>
        ///     Gets me capabilities.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.SocialCapabilities"></value>
        if (People.RecentActivity.Platform.SocialCapabilities._meCapabilities == null) {
            People.RecentActivity.Platform.SocialCapabilities._meCapabilities = new People.RecentActivity.Platform.SocialCapabilities(People.RecentActivity.Platform.SocialCapabilities._getMePerson());
        }

        return People.RecentActivity.Platform.SocialCapabilities._meCapabilities;
    }
});

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities, "whatsNewCapabilities", {
    get: function() {
        /// <summary>
        ///     Gets whatsnew capabilities.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.SocialCapabilities"></value>
        if (People.RecentActivity.Platform.SocialCapabilities._whatsNewCapabilities == null) {
            People.RecentActivity.Platform.SocialCapabilities._whatsNewCapabilities = new People.RecentActivity.Platform.SocialCapabilities();
        }

        return People.RecentActivity.Platform.SocialCapabilities._whatsNewCapabilities;
    }
});

People.RecentActivity.Platform.SocialCapabilities._getMePerson = function() {
    /// <returns type="Microsoft.WindowsLive.Platform.Person"></returns>
    return Jx.root.getPlatformCache().getDefaultMeContact();
};


People.RecentActivity.Platform.SocialCapabilities.prototype._personId = null;
People.RecentActivity.Platform.SocialCapabilities.prototype._isUserPerson = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._isWhatsNew = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._isMe = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._temporaryContactSourceId = null;
People.RecentActivity.Platform.SocialCapabilities.prototype._initialized = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._canShowWhatsNew = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._canShowPhotos = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._canShowNotifications = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._canShare = false;
People.RecentActivity.Platform.SocialCapabilities.prototype._accountResourceChangedHandler = null;
People.RecentActivity.Platform.SocialCapabilities.prototype._accountResource = null;

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities.prototype, "initialized", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the class is initialized.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._initialized;
    },
    set: function(value) {
        if (this._initialized !== value) {
            this._initialized = value;
            this._onPropertyChanged('Initialized');
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities.prototype, "canShowWhatsNew", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether WhatsNew section should be shown.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._canShowWhatsNew;
    },
    set: function(value) {
        if (this._canShowWhatsNew !== value) {
            this._canShowWhatsNew = value;
            this._onPropertyChanged('CanShowWhatsNew');
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities.prototype, "canShowPhotos", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether Photo section should be shown.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._canShowPhotos;
    },
    set: function(value) {
        if (this._canShowPhotos !== value) {
            this._canShowPhotos = value;
            this._onPropertyChanged('CanShowPhotos');
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities.prototype, "canShowNotifications", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether Notification section should be shown.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._canShowNotifications;
    },
    set: function(value) {
        if (this._canShowNotifications !== value) {
            this._canShowNotifications = value;
            this._onPropertyChanged('CanShowNotifications');
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities.prototype, "canShare", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether sharing should be allowed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._canShare;
    },
    set: function(value) {
        if (this._canShare !== value) {
            this._canShare = value;
            this._onPropertyChanged('CanShare');
        }

    }
});

Object.defineProperty(People.RecentActivity.Platform.SocialCapabilities.prototype, "whatsNewNetworks", {
    get: function() {
        /// <summary>
        ///     Gets the networks the user is connected to.
        /// </summary>
        /// <value type="Array" elementType="networkInfo"></value>
        return this._getFilteredNetworks('ra');
    }
});

People.RecentActivity.Platform.SocialCapabilities.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    this._removeAccountResourceEventListener();
    if (this._initialized) {
        People.RecentActivity.Platform.Platform.instance.removeListenerSafe("connectednetworkchanged", this._onConnectedNetworkChanged, this);
    }
};

People.RecentActivity.Platform.SocialCapabilities.prototype._initialize = function() {
    /// <summary>
    ///     Initializes this instance.
    /// </summary>
    if (People.RecentActivity.Platform.SocialCapabilities._capabilityMap == null) {
        People.RecentActivity.Platform.SocialCapabilities._capabilityMap = {};
        People.RecentActivity.Platform.SocialCapabilities._capabilityMap['ra'] = People.RecentActivity.Platform.Configuration.instance.supportedNetworksForRecentActivity;
        People.RecentActivity.Platform.SocialCapabilities._capabilityMap['photo'] = People.RecentActivity.Platform.Configuration.instance.supportedNetworksForPhoto;
        People.RecentActivity.Platform.SocialCapabilities._capabilityMap['notification'] = People.RecentActivity.Platform.Configuration.instance.supportedNetworksForNotification;
        People.RecentActivity.Platform.SocialCapabilities._capabilityMap['share'] = People.RecentActivity.Platform.Configuration.instance.supportedNetworksForShare;
    }

    this._accountResource = Jx.root.getPlatformCache().getDefaultAccount().getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.accounts);
    Debug.assert(this._accountResource != null, 'accountResource');
    if (Jx.isUndefined(this._accountResource.isInitialSyncFinished)) {
        // This is the mock platform.
        Jx.log.write(4, 'SocialCapabilities.Initialize(mockPlatform:true)');
        this._initializeInternal();
    }
    else if (this._isAccountResourceReady()) {
        // The real platform is up and ready to go.
        Jx.log.write(4, 'SocialCapabilities.Initialize(isInitialSyncFinished:true,hasEverSynchronized:true)');
        this._initializeInternal();
    }
    else {
        // The real platform is present, but not yet ready to go.
        Jx.log.write(4, People.Social.format('SocialCapabilities.Initialize(isInitialSyncFinished:{0},hasEverSynchronized:{1})', this._accountResource.isInitialSyncFinished, this._accountResource.hasEverSynchronized));
        this._addAccountResourceEventListener();
    }
};

People.RecentActivity.Platform.SocialCapabilities.prototype._initializeInternal = function() {
    People.RecentActivity.Platform.Platform.instance.addListener("connectednetworkchanged", this._onConnectedNetworkChanged, this);

    var networks = this._getLinkedNetworks();
    Debug.assert(networks != null, 'networks');

    Jx.log.write(4, People.Social.format('SocialCapabilities.InitializeInternal(): {0}', this._getSourceIds(networks)));

    this.canShowWhatsNew = this._canShowSocialContent(networks, 'ra');

    // We don't show photos on main landing page.
    this.canShowPhotos = !this._isWhatsNew && this._canShowSocialContent(networks, 'photo');

    // We only show notifications for me tab.
    this.canShowNotifications = this._isMe && this._canShowSocialContent(networks, 'notification');

    this.canShare = this._canShowSocialContent(networks, 'share');

    this.initialized = true;
};

People.RecentActivity.Platform.SocialCapabilities.prototype._isAccountResourceReady = function() {
    /// <summary>
    ///     Checks whether the <see cref="T:Microsoft.WindowsLive.Platform.AccountResource" /> is initialized and ready to go.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this._accountResource.isInitialSyncFinished && this._accountResource.hasEverSynchronized;
};

People.RecentActivity.Platform.SocialCapabilities.prototype._tryInitializeInternal = function() {
    /// <summary>
    ///     Checks whether the <see cref="T:Microsoft.WindowsLive.Platform.AccountResource" /> is ready and initializes the object if it is.
    /// </summary>
    if (this._isAccountResourceReady()) {
        this._removeAccountResourceEventListener();
        this._initializeInternal();
    }
};

People.RecentActivity.Platform.SocialCapabilities.prototype._onAccountResourcePropertyChanged = function(e) {
    /// <param name="e" type="Microsoft.WindowsLive.Platform.ObjectChangedEventArgs"></param>
    Debug.assert(e != null, 'e != null');
    var detail = e.detail;
    var changes = detail[0];
    for (var i = 0, len = changes.length; i < len; i++) {
        switch (changes[i]) {
            case 'isInitialSyncFinished':
                Jx.log.write(4, People.Social.format('SocialCapabilities.OnAccountResoucePropertyChanged(isInitialSyncFinished:{0})', this._accountResource.isInitialSyncFinished));
                this._tryInitializeInternal();
                break;
            case 'hasEverSynchronized':
                Jx.log.write(4, People.Social.format('SocialCapabilities.OnAccountResoucePropertyChanged(hasEverSynchronized:{0})', this._accountResource.hasEverSynchronized));
                this._tryInitializeInternal();
                break;
        }    
    }
};

People.RecentActivity.Platform.SocialCapabilities.prototype._onPropertyChanged = function(propertyName) {
    /// <param name="propertyName" type="String"></param>
    Debug.assert(Jx.isNonEmptyString(propertyName), 'propertyName');
    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};

People.RecentActivity.Platform.SocialCapabilities.prototype._onConnectedNetworkChanged = function(e) {
    /// <param name="e" type="People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs"></param>
    switch (e.type) {
        case 1:
            // Get the networks associated with the person, we don't need that for user person, since they are the same as the connected networks.
            var networks = (!this._isUserPerson) ? this._getLinkedNetworks() : new Array(0);
            if (!this._canShowWhatsNew && this._isSocialContentSupported(e.sourceId, networks, 'ra')) {
                this.canShowWhatsNew = true;
            }

            // We don't show photos on main landing page.
            if (!this._isWhatsNew && !this._canShowPhotos && this._isSocialContentSupported(e.sourceId, networks, 'photo')) {
                this.canShowPhotos = true;
            }

            // We only show notifications for me tab.
            if (this._isMe && !this._canShowNotifications && this._isSocialContentSupported(e.sourceId, networks, 'notification')) {
                this.canShowNotifications = true;
            }

            if (!this._canShare && this._isSocialContentSupported(e.sourceId, networks, 'share')) {
                this.canShare = true;
            }

            break;
        case 2:
            var networks = this._getLinkedNetworks();
            if (this._canShowWhatsNew && !this._canShowSocialContent(networks, 'ra')) {
                this.canShowWhatsNew = false;
            }

            if (!this._isWhatsNew && this._canShowPhotos && !this._canShowSocialContent(networks, 'photo')) {
                this.canShowPhotos = false;
            }

            if (this._isMe && this._canShowNotifications && !this._canShowSocialContent(networks, 'notification')) {
                this.canShowNotifications = false;
            }

            if (this._canShare && !this._canShowSocialContent(networks, 'share')) {
                this.canShare = false;
            }

            break;
    }
};

People.RecentActivity.Platform.SocialCapabilities.prototype._canShowSocialContent = function(networks, type) {
    /// <summary>
    ///     Determines whether a certain social section can be shown based on a person's networks.
    /// </summary>
    /// <param name="networks" type="Array" elementType="networkInfo">The networks associated with a person.</param>
    /// <param name="type" type="String">The social content type.</param>
    /// <returns type="Boolean"></returns>
    for (var n = 0; n < networks.length; n++) {
        var network = networks[n];
        if ((People.RecentActivity.Platform.SocialCapabilities._capabilityMap[type].indexOf(network.id) !== -1)) {
            if (this._isUserPerson) {
                // If networks are for the user person, which means the user is already connected to the networks.
                return true;
            }

            var authStatus = People.RecentActivity.Platform.AuthInfo.getInstance(network.id).status;
            if (authStatus === People.RecentActivity.Platform.AuthenticationStatus.authenticated ||
                authStatus === People.RecentActivity.Platform.AuthenticationStatus.authenticatedPendingTokenRefresh) {
                // Which means the network is already connected, so we can show the social content.
                return true;
            }
        }
    }

    return false;
};

People.RecentActivity.Platform.SocialCapabilities.prototype._isSocialContentSupported = function(sourceId, networks, type) {
    /// <summary>
    ///     Determines if certain type of social content is supported for a connected network for the current person.
    /// </summary>
    /// <param name="sourceId" type="String">The connected network source id.</param>
    /// <param name="networks" type="Array" elementType="networkInfo">The associated networks if the person is a non user person.</param>
    /// <param name="type" type="String">The type.</param>
    /// <returns type="Boolean"></returns>
    if (People.RecentActivity.Platform.SocialCapabilities._capabilityMap[type].indexOf(sourceId) === -1) {
        return false;
    }

    if (this._isUserPerson) {
        return true;
    }

    Debug.assert(networks != null, 'networks');
    // Check if the connected network is one of the person's associated networks.
    for (var n = 0; n < networks.length; n++) {
        var network = networks[n];
        if (network.id === sourceId) {
            return true;
        }    
    }

    return false;
};

People.RecentActivity.Platform.SocialCapabilities.prototype._getFilteredNetworks = function(type) {
    /// <summary>
    ///     Gets the linked networks for the current person or temporary contact, filtered on the type.
    /// </summary>
    /// <param name="type" type="String">The type.</param>
    /// <returns type="Array" elementType="networkInfo"></returns>
    var filtered = [];
    var networks = this._getLinkedNetworks();
    for (var i = 0, len = networks.length; i < len; i++) {
        // simply check whether this network supports a given type.
        var network = networks[i];
        if ((People.RecentActivity.Platform.SocialCapabilities._capabilityMap[type].indexOf(network.id) !== -1)) {
            filtered.push(network);
        }    
    }

    return networks;
};

People.RecentActivity.Platform.SocialCapabilities.prototype._getLinkedNetworks = function () {
    /// <summary>
    ///     Gets the linked networks for the current person or temporary contact.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    if (this._personId != null) {
        // We have a person, let's get the networks from the platform.
        return People.RecentActivity.Platform.Platform.instance.getNetworks(this._personId);
    }

    return [People.RecentActivity.Platform.Platform.instance.getNetworkInfoById(this._temporaryContactSourceId)];
};

People.RecentActivity.Platform.SocialCapabilities.prototype._addAccountResourceEventListener = function() {
    if (this._accountResourceChangedHandler == null) {
        this._accountResourceChangedHandler = this._onAccountResourcePropertyChanged.bind(this);
        this._accountResource.addEventListener('changed', this._accountResourceChangedHandler);
    }
};

People.RecentActivity.Platform.SocialCapabilities.prototype._removeAccountResourceEventListener = function() {
    if (this._accountResourceChangedHandler != null) {
        this._accountResource.removeEventListener('changed', this._accountResourceChangedHandler);
        this._accountResourceChangedHandler = null;
    }
};

People.RecentActivity.Platform.SocialCapabilities.prototype._getSourceIds = function(networks) {
    /// <param name="networks" type="Array" elementType="networkInfo"></param>
    /// <returns type="String"></returns>
    var sourceIds = networks.map(function(item) {
        return (item).id;
    });
    return sourceIds.join(',');
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Core\Events\EventArgs.js" />

People.RecentActivity.Platform.TokenRefreshedEventArgs = function(sender, token, isBetaAccount) {
    /// <summary>
    ///     Provides event arguments for token refreshed event.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="token" type="String">The token.</param>
    /// <param name="isBetaAccount" type="Boolean">Whether the account is in beta.</param>
    /// <field name="_token$1" type="String"></field>
    /// <field name="_isBetaAccount$1" type="Boolean"></field>
    People.RecentActivity.EventArgs.call(this, sender);
    this._token$1 = token;
    this._isBetaAccount$1 = isBetaAccount;
};

Jx.inherit(People.RecentActivity.Platform.TokenRefreshedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.Platform.TokenRefreshedEventArgs.prototype._token$1 = null;
People.RecentActivity.Platform.TokenRefreshedEventArgs.prototype._isBetaAccount$1 = false;

Object.defineProperty(People.RecentActivity.Platform.TokenRefreshedEventArgs.prototype, "token", {
    get: function() {
        /// <summary>
        ///     Gets the token.
        /// </summary>
        /// <value type="String"></value>
        return this._token$1;
    }
});

Object.defineProperty(People.RecentActivity.Platform.TokenRefreshedEventArgs.prototype, "isBetaAccount", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the account is a beta account.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isBetaAccount$1;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Configuration.js" />
/// <reference path="Platform.js" />



People.RecentActivity.Platform.MockPlatform = function() {
    /// <summary>
    ///     Represents the mock platform.
    /// </summary>
    People.RecentActivity.Platform.Platform.call(this);
};

Jx.inherit(People.RecentActivity.Platform.MockPlatform, People.RecentActivity.Platform.Platform);

People.RecentActivity.Platform.MockPlatform.prototype.getAccount = function (sourceId) {
    /// <summary>Gets an account by source ID.</summary>
    return null;
};

People.RecentActivity.Platform.MockPlatform.prototype.getContactInfoDetails = function(info) {
    /// <summary>
    ///     Gets the contact info details.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo">The info.</param>
    Debug.assert(info != null, 'info');
    var person = this.getPlatformPerson(info);
    if (person != null) {
        info.personId = person.objectId;
        info.name = person.calculatedUIName;
        info.isFriend = true;
    }
};

People.RecentActivity.Platform.MockPlatform.prototype.getUserPersonCid = function() {
    /// <summary>
    ///     Gets the user person cid.
    /// </summary>
    /// <returns type="String"></returns>
    var contact = this.getContactForNetwork(this.getUserPerson(), 'WL');
    return Microsoft.WindowsLive.Cid.CidFormatter.toString(contact.cid.value, Microsoft.WindowsLive.Cid.CidFormat.decimal);
};

People.RecentActivity.Platform.MockPlatform.prototype.onInitialize = function() {
    /// <summary>
    ///     Called when the platform is initialized.
    /// </summary>
    var person = this.getUserPerson();
    for (var n = 0, coll = People.RecentActivity.Platform.Configuration.instance.supportedNetworks; n < coll.length; n++) {
        var sourceId = coll[n];
        var contact = this.getContactForNetwork(person, sourceId);
        if (contact != null) {
            this.onConnectedNetworkChanged(1, sourceId, null, contact.network.name, contact.network.authToken, contact.thirdPartyObjectId, 1, 1);
        }    
    }
};

People.RecentActivity.Platform.MockPlatform.prototype.getSourceId = function(contact) {
    /// <summary>
    ///     Gets the object ID for a contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return contact.network.sourceId;
};

People.RecentActivity.Platform.MockPlatform.prototype.getObjectId = function(contact) {
    /// <summary>
    ///     Gets the object ID for a contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return null;
};

People.RecentActivity.Platform.MockPlatform.prototype.getNetworkName = function(contact) {
    /// <summary>
    ///     Gets the network name of the contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return contact.network.name;
};

People.RecentActivity.Platform.MockPlatform.prototype.getNetworkIcon = function(contact) {
    /// <summary>
    ///     Gets the network icon of the contact.
    /// </summary>
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact">The contact.</param>
    /// <returns type="String"></returns>
    return null;
};

People.RecentActivity.Platform.MockPlatform.prototype.getConnectableNetworks = function() {
    /// <summary>
    ///     Gets the info for the user's connectable networks.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    return new Array(0);
};


;});