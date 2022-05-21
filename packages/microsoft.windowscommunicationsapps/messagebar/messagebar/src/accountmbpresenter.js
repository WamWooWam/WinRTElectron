
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="WindowsLive.ref.js" />
/// <reference path="messagebar.js" />
/// <reference path="Windows.Security.Authentication.Web.js" />
/// <reference path="Windows.UI.ViewManagement.js" />

Jx.delayDefine(Chat, "AccountMessageBarPresenter", function () {
    
    var plat = Microsoft.WindowsLive.Platform;

    Chat.AccountMessageBarPresenter = /*constructor*/function () {
    };

    var proto = Chat.AccountMessageBarPresenter.prototype;

    proto._mb = null;
    proto._platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/null;
    proto._className = null;
    proto._accounts = null;
    proto._accountMap = {};
    proto._appScenario = null;
    proto._appName = null;
    proto._relevantProperty = null;

    proto._ERROR_MESSAGE_PREFIX = "errorAccount";
    proto._ERROR_MESSAGE_PRIORITY = 4;

    proto.init = function (messageBar, platform, appScenario, className) {
        /// <summary>
        /// AccountMessageBarPresenter init
        /// </summary>
        /// <param name="messageBar" type="Chat.MessageBar">
        /// MessageBar where this presenter will add/remove messages
        /// </param>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform">the platform</param>
        /// <param name="appScenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario">
        /// ApplicationScenario of the incorporating app
        /// </param>
        /// <param name="className" type="string">
        /// Css class name to be passed to the messagebar
        /// </param>
        Debug.assert(messageBar);
        Debug.assert(platform);
        Debug.assert(!Jx.isNullOrUndefined(appScenario));

        this._mb = messageBar;
        this._platform = platform;
        this._appScenario = appScenario;
        this._className = className;

        if (this._appScenario === plat.ApplicationScenario.people) {
            this._appName = "people";
            this._relevantProperty = "peopleScenarioState";
        } else {
            Debug.assert(false, "Scenario not supported");
        }

        this._accountChanged = this._accountChanged.bind(this);
        this._collectionChanged = this._collectionChanged.bind(this);

        // Get all of the relevant accounts
        this._accounts = platform.accountManager.getConnectedAccountsByScenario(this._appScenario, plat.ConnectedFilter.normal, plat.AccountSort.name);
        if (!Jx.isNullOrUndefined(this._accounts)) {
            this._accounts.addEventListener("collectionchanged", this._collectionChanged);
            for (var i = 0; i < this._accounts.count; i++) {
                // On each account add a "changed" listener
                var account = /*@static_cast(Microsoft.WindowsLive.Platform.Account)*/this._accounts.item(i);
                this._accountMap[account.objectId] = account;
                account.addEventListener("changed", this._accountChanged);
                this._checkScenarioState(account, account[this._relevantProperty]);
            }
            this._accounts.unlock();
        }
    };

    proto.shutdown = function () {
        // Remove all the listeners we added
        for (var key in this._accountMap) {
            var account = /*@static_cast(Microsoft.WindowsLive.Platform.Account)*/this._accountMap[key];
            account.removeEventListener("changed", this._accountChanged);
        }

        if (this._accounts) {
            this._accounts.removeEventListener("collectionchanged", this._collectionChanged);
            this._accounts.dispose();
        }
    };

    proto._collectionChanged = function (ev) {
        /// <param name="ev" type="ABIEvent"></param>

        var /*@type(Microsoft.WindowsLive.Platform.CollectionChangedEventArgs)*/args = ev.detail[0];
        var type = plat.CollectionChangeType;
        // TODO: Windows 8 Bugs 452194 Remove once JSGen bug is fixed.
        /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
        var account = null;
        if (args.eType === type.itemAdded) {
            account = this._accounts.item(args.index);
            this._accountMap[account.objectId] = account;
            account.addEventListener("changed", this._accountChanged);
            this._checkScenarioState(account, account[this._relevantProperty]);
        } else if (args.eType === type.itemRemoved) {
            account = this._accountMap[args.objectId];
            if (!Jx.isNullOrUndefined(account)) {
                this._checkScenarioState(account, plat.ScenarioState.none);
                account.removeEventListener("changed", this._accountChanged);
                delete this._accountMap[account.objectId];
            } else if (!Jx.isNullOrUndefined(args.objectId)) {
                // If we couldn't find the account then attempt to at least remove any active messages
                this._mb.removeMessage(this._ERROR_MESSAGE_PREFIX + args.objectId);
            }
        }
        /// <enable>JS3057.AvoidImplicitTypeCoercion</enable>
    };

    proto._accountChanged = function (ev) {
        /// <param name="ev" type="ABIEvent"></param>

        Debug.assert(this._relevantProperty !== null);
        var account = ev.target;

        // If the relevant property was changed then check the state
        for (var prop in ev) {
            if (ev[prop] === this._relevantProperty) {
                this._checkScenarioState(account, account[this._relevantProperty]);
                break;
            }
        }
    };

    proto._checkScenarioState = function (account, scenarioState) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.Account"></param>
        var stateValues = Microsoft.WindowsLive.Platform.ScenarioState;

        if (scenarioState === stateValues.error) {
            var configType = account.getConfigureType(this._appScenario);
            if (configType === /*@static_cast(Number)*/plat.ConfigureType.editOnWeb) {
                // Add error message
                var options = {
                    messageText: Jx.res.loadCompoundString("/messagebar/messageBarAccountError", account.displayName),
                    button1: {
                        text: Jx.res.getString("/messagebar/messageBarReconnect"),
                        tooltip: Jx.res.getString("/messagebar/messageBarReconnect"),
                        callback: this._reconnectClicked.bind(this)
                    },
                    button2: {
                        text: Jx.res.getString("/messagebar/messageBarNotNow"),
                        tooltip: Jx.res.getString("/messagebar/messageBarNotNow"),
                        callback: this._notNowClicked.bind(this)
                    },
                    cssClass: this._className
                };
                this._mb.removeMessage(this._getErrorMessageId(account));
                this._mb.addErrorMessage(this._getErrorMessageId(account),
                    this._ERROR_MESSAGE_PRIORITY, options);
            }
        } else if (scenarioState === stateValues.upgradeRequired) {
            var upgradeConfigType = account.getConfigureType(this._appScenario);
            if (upgradeConfigType === /*@static_cast(Number)*/plat.ConfigureType.editOnWeb) {
                // Add error message
                var upgradeOptions = {
                    messageText: Jx.res.loadCompoundString("/messagebar/messageBarAccountUpgrade", account.displayName),
                    button1: {
                        text: Jx.res.getString("/messagebar/messageBarUpdateString"),
                        tooltip: Jx.res.getString("/messagebar/messageBarUpdateString"),
                        callback: this._reconnectClicked.bind(this)
                    },
                    button2: {
                        text: Jx.res.getString("/messagebar/messageBarNotNow"),
                        tooltip: Jx.res.getString("/messagebar/messageBarNotNow"),
                        callback: this._notNowClicked.bind(this)
                    },
                    cssClass: this._className
                };
                this._mb.removeMessage(this._getErrorMessageId(account));
                this._mb.addErrorMessage(this._getErrorMessageId(account),
                    this._ERROR_MESSAGE_PRIORITY, upgradeOptions);
            }
        } else {
            // We are no longer in an error state so remove the message
            this._mb.removeMessage(this._getErrorMessageId(account));
        }
    };

    proto._getErrorMessageId = function (account) {
        // Unique error message for the given account
        return this._ERROR_MESSAGE_PREFIX + account.objectId;
    };

    proto._getAccountByMessageId = function (id) {
        /// <param name="id" type="String"></param>
        var account = null;
        var objectId = id.slice(this._ERROR_MESSAGE_PREFIX.length);
        return this._accountMap[objectId];
    };

    proto._buildUrl = function (account) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.Account"></param>
        var person = this._platform.accountManager.defaultAccount.meContact;
        var urlPrefix = "https://profile.live.com/cid-";
        
        if (Jx.app.getEnvironment() === "INT") {
            urlPrefix = "https://profile.live-int.com/cid-";
        }
        

        var appUri = Windows.Security.Authentication.Web.WebAuthenticationBroker.getCurrentApplicationCallbackUri();
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        var wlCid = Microsoft.WindowsLive.Cid;
        var url = urlPrefix + wlCid.CidFormatter.toString(person.cid.value, wlCid.CidFormat.hexidecimal) + "/services/connect/?";
        var reconnect = account[this._relevantProperty] === Microsoft.WindowsLive.Platform.ScenarioState.error;
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        Debug.assert(Jx.isNonEmptyString(this._appName), "This app should not have any web-configurable accounts.");
        url += "appid=" + account.sourceId;
        url += "&scenarios=" + account.getServerScenarios(this._appScenario, reconnect);
        url += "&view=modern";
        url += "&biciID=" + this._appName + "infobar";
        url += "&brand=" + this._appName;
        url += "&ru=" + appUri.absoluteUri;
        url += "&authz=true";

        return url;
    };

    proto._reconnectClicked = function (target, id) {
        // Remove the message
        this._mb.removeMessage(id);

        // Build the url
        var account = this._getAccountByMessageId(id);
        var url = this._buildUrl(account);

        /// <disable>JS3053.IncorrectNumberOfArguments</disable>
        // Launch the web page
        var startURI = new Windows.Foundation.Uri(url);
        var appUri = Windows.Security.Authentication.Web.WebAuthenticationBroker.getCurrentApplicationCallbackUri();
        Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
                        Windows.Security.Authentication.Web.WebAuthenticationOptions["none"],
                        startURI,
                        appUri).then();
        /// <enable>JS3053.IncorrectNumberOfArguments</enable>
    };

    proto._notNowClicked = function (target, id) {
        // Remove the message
        this._mb.removeMessage(id);
    };

});
