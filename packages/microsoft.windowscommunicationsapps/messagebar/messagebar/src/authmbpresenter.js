
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Jx,Chat,Debug,Microsoft,Windows*/

Jx.delayDefine(Chat, "AuthMessageBarPresenter", function () {

    // Perf: use hardcoded platform enums to avoid expensive WinRT calls at JS load time

    var _platResTypeMail = 2;

    var _platResults = {
        msgBar:  {
            accountUpdateRequired: -2138701819,
            accountLocked: -2138701817
        },
        credUI: {
            passwordUpdateRequired: -2138701820,
            forceSignIn: -2138701818,
            parentalConsentRequired: -2138701816,
            emailVerificationRequired: -2138701815,
            actionRequired: -2138701812,
            accountSuspendedCompromise: -2138701814,
            accountSuspendedAbuse: -2138701813,
            authRequestThrottled: -2138701808,
            passwordDoesNotExist: -2146893042,
            passwordLogonFailure: -2147023570
        },
        proxyCanary: {
            e_HTTP_PROXY_AUTH_REQ: -2063532024
        },
        ignored: {
            success: 0,
            defaultAccountDoesNotExist: -2147023579
        },
    };


    // Validate platform enums
    (function () {
        var plat = Microsoft.WindowsLive.Platform;
        var results = plat.Result;
        for (var i in _platResults) {
            for (var j in _platResults[i]) {
                Debug.assert(_platResults[i][j] === results[j], "Invalid platform HRESULT");
            }
        }
        Debug.assert(_platResTypeMail === plat.ResourceType.mail, "Invalid platform resource type");
    })();


    Chat.AuthMessageBarPresenter = /*constructor*/ function () {
    };

    var proto = Chat.AuthMessageBarPresenter.prototype;

    proto._mb = null;
    proto._account = null;
    proto._platform = null;
    proto._className = null;
    proto._isMail = false;
    proto._authErrorMsgId = "authErrorMessage";

    proto.init = function (messageBar, platform, className, isMail) {
        /// <summary>
        /// AuthMessageBarPresenter init
        /// </summary>
        /// <param name="messageBar" type="Chat.MessageBar">
        /// MessageBar where this presenter will add/remove messages
        /// </param>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">
        /// Account to listen for auth changes
        /// </param>
        /// <param name="className" type="string">
        /// Css class name to be passed to the messagebar
        /// </param>
        /// <param name="isMail" type="bool" optional="true">
        /// Determines if the presenter is being hosted in the Mail app
        /// </param>
        Debug.assert(Jx.isObject(messageBar));
        Debug.assert(Jx.isObject(platform));
        Debug.assert(Jx.isNonEmptyString(className));
        Debug.assert(Jx.isBoolean(isMail) || Jx.isNullOrUndefined(isMail));

        this._mb = messageBar;
        this._account = platform.accountManager.defaultAccount;
        this._platform = platform;
        this._className = className;
        this._isMail = Boolean(isMail);

        this._accountChanged = this._accountChanged.bind(this);
        this._account.addEventListener("changed", this._accountChanged);

        // Check initial state
        this._checkErrorState(this._account.lastAuthResult);
    };

    proto.shutdown = function () {
        if (this._account) {
            this._account.removeEventListener("changed", this._accountChanged);
        }
    };

    proto._accountChanged = function (ev) {
        var account = ev.target;
        this._checkErrorState(account.lastAuthResult);
    };

    proto._hasOwnValue = function (obj, val) {
        for (var prop in obj) {
            if (obj[prop] === val) {
                return true;
            }
        }

        return false;
    };

    proto._checkErrorState = function (lastAuthResult) {
        var options = null;
        if (this._hasOwnValue(_platResults.msgBar, lastAuthResult)) {
            options = {
                messageText: Jx.res.loadCompoundString("/messagebar/messageBarIDCRLError", this._account.emailAddress),
                button1: {
                    text: Jx.res.getString("/messagebar/messageBarUpdate"),
                    tooltip: Jx.res.getString("/messagebar/messageBarUpdate"),
                    callback: this._fixClicked.bind(this)
                },
                button2: {
                    text: Jx.res.getString("/messagebar/messageBarCloseText"),
                    tooltip: Jx.res.getString("/messagebar/messageBarCloseText"),
                    callback: this._closeClicked.bind(this)
                },
                cssClass: this._className
            };

            // Remove any auth error message and add the most recent one into the message bar
            this._mb.removeMessage(this._authErrorMsgId);
            var messagePriority = 2;
            this._mb.addErrorMessage(this._authErrorMsgId, messagePriority, options);
        } else if (this._hasOwnValue(_platResults.credUI, lastAuthResult)) {
            // Mail handles the emailVerificationRequired error differently so ignore it here
            if (!this._isMail || (lastAuthResult !== _platResults.credUI.emailVerificationRequired)) {
                this._launchCredUI();
            }
        } else if (this._hasOwnValue(_platResults.ignored, lastAuthResult)) {
            this._mb.removeMessage(this._authErrorMsgId);
        } else if (!this._hasOwnValue(_platResults.proxyCanary, lastAuthResult)) {
            // Unknow auth error, attempt to launch the Cred UI. Don't launch for proxy
            // errors as that is handled by ProxyAuthenticator.js
            this._launchCredUI();
        }
    };

    proto._closeClicked = function (target, id) {
        // Remove the message with the given id
        this._mb.removeMessage(id);
    };

    proto._fixClicked = function (target, id) {
        // Remove the message with the given id
        this._mb.removeMessage(id);

        // Launch the CredUI
        this._launchCredUI();
    };

    proto._launchCredUI = function () {
        var clientAuth = new Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator();

        var serviceUrl = "ssl.live.com";
        
        if (Jx.app.getEnvironment() === "INT") {
            serviceUrl = "ssl.live-int.com";
        }
        

        var clientAuthRequest = new Windows.Security.Authentication.OnlineId.OnlineIdServiceTicketRequest(serviceUrl, "MBI_SSL");
        var promptType = Windows.Security.Authentication.OnlineId.CredentialPromptType.promptIfNeeded;
        try {
            clientAuth.authenticateUserAsync(
                [clientAuthRequest],
                promptType).then(this._onCredUiSuccess.bind(this), this._onCredUiFailure.bind(this));
        } catch (e) {
            Jx.log.exception("Exception from authenticateUserAsync", e);
        }
    };

    proto._onCredUiSuccess = function () {
        this._account.lastAuthResult = 0;
        var resource = this._account.getResourceByType(_platResTypeMail);
        if (Jx.isObject(resource)) {
            resource.isSyncNeeded = true;
        }
        this._account.commit();
    };

    proto._onCredUiFailure = function (authStatus) {
        if (authStatus) {
            Jx.log.info("authenticateUserAsync failed with " + authStatus.number);
        }
    };

});
