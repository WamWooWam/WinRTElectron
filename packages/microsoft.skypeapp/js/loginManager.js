

msWriteProfilerMark("SkypeDebugETW:loginManager,StartTM");
(function (global) {
    "use strict";
    

    var userIdentity = null;
    var accountsAreLinked = false;
    var skypename = null;
    var password = null;

    var authAction = {
        LOGIN: 0,
        SKYPE: 1,
        OTHER: 2
    };

    var errorType = {
        LOGIN: 0,
        LINK: 1
    };

    msWriteProfilerMark("SkypeDebugETW:loginManager,enums,StartTM");

    var logoutErrors = Object.create(Object.prototype, {
        UNEXPECTED_ERROR:{ get: function() { return  { id: -1, errorMessage: "login_error_internalError", retryButton: true, backButton: false, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        LIVEID_DIALOG_ERROR: { get: function () { return { id: Skype.LoginManager.ErrorCodes.LiveIDDialogError, errorMessage: "linkOrCreateAccount_error_internalError", retryButton: true, backButton: false, tryToSignOut: true }; }, enumerable: true },
        LOGOUTREASON_HTTPS_PROXY_AUTH_FAILED:{ get: function() { return  { id: LibWrap.Account.logoutreason_HTTPS_PROXY_AUTH_FAILED, errorMessage: "login_error_connectionError", retryButton: true, backButton: false, tryToSignOut: false }; }, enumerable: true },
        LOGOUTREASON_SOCKS_PROXY_AUTH_FAILED:{ get: function() { return  { id: LibWrap.Account.logoutreason_SOCKS_PROXY_AUTH_FAILED, errorMessage: "login_error_connectionError", retryButton: true, backButton: false, tryToSignOut: false }; }, enumerable: true },
        LOGOUTREASON_P2P_CONNECT_FAILED:{ get: function() { return  { id: LibWrap.Account.logoutreason_P2P_CONNECT_FAILED, errorMessage: "login_error_connectionError", retryButton: true, backButton: false, tryToSignOut: false }; }, enumerable: true },
        LOGOUTREASON_SERVER_CONNECT_FAILED:{ get: function() { return  { id: LibWrap.Account.logoutreason_SERVER_CONNECT_FAILED, errorMessage: "login_error_connectionError", retryButton: true, backButton: false, tryToSignOut: false }; }, enumerable: true },
        LOGOUTREASON_SERVER_OVERLOADED:{ get: function() { return  { id: LibWrap.Account.logoutreason_SERVER_OVERLOADED, errorMessage: "login_error_connectionError", retryButton: true, backButton: false, tryToSignOut: false }; }, enumerable: true },
        LOGOUTREASON_DB_IN_USE:{ get: function() { return  { id: LibWrap.Account.logoutreason_DB_IN_USE, errorMessage: "login_error_databaseAccessError", retryButton: true, backButton: false, tryToSignOut: false }; }, enumerable: true },
        LOGOUTREASON_INVALID_SKYPENAME:{ get: function() { return  { id: LibWrap.Account.logoutreason_INVALID_SKYPENAME, errorMessage: "login_error_authError", retryButton: true, backButton: false, tryToSignOut: true }; }, enumerable: true },
        LOGOUTREASON_REJECTED_AS_UNDERAGE:{ get: function() { return  { id: LibWrap.Account.logoutreason_REJECTED_AS_UNDERAGE, errorMessage: "login_error_skypeAccountUnderAgeError", retryButton: false, backButton: false, tryToSignOut: true }; }, enumerable: true },
        LOGOUTREASON_INCORRECT_PASSWORD:{ get: function() { return  { id: LibWrap.Account.logoutreason_INCORRECT_PASSWORD, errorMessage: "login_error_authError", retryButton: true, backButton: false, tryToSignOut: true }; }, enumerable: true },
        LOGOUTREASON_TOO_MANY_LOGIN_ATTEMPTS:{ get: function() { return  { id: LibWrap.Account.logoutreason_TOO_MANY_LOGIN_ATTEMPTS, errorMessage: "login_error_tooManyLoginsError", retryButton: false, backButton: false, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        LOGOUTREASON_PASSWORD_HAS_CHANGED:{ get: function() { return  { id: LibWrap.Account.logoutreason_PASSWORD_HAS_CHANGED, errorMessage: "login_error_serverAuthValidationError", retryButton: true, backButton: false, tryToSignOut: true }; }, enumerable: true },
        LOGOUTREASON_PERIODIC_UIC_UPDATE_FAILED:{ get: function() { return  { id: LibWrap.Account.logoutreason_PERIODIC_UIC_UPDATE_FAILED, errorMessage: "login_error_serverAuthValidationError", retryButton: true, backButton: false, tryToSignOut: true }; }, enumerable: true },
        LOGOUTREASON_DB_DISK_FULL:{ get: function() { return  { id: LibWrap.Account.logoutreason_DB_DISK_FULL, errorMessage: "login_error_internalError", retryButton: true, backButton: false, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        LOGOUTREASON_DB_IO_ERROR:{ get: function() { return  { id: LibWrap.Account.logoutreason_DB_IO_ERROR, errorMessage: "login_error_internalError", retryButton: true, backButton: false, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        LOGOUTREASON_DB_CORRUPT:{ get: function() { return  { id: LibWrap.Account.logoutreason_DB_CORRUPT, errorMessage: "login_error_internalError", retryButton: true, backButton: false, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        LOGOUTREASON_DB_FAILURE:{ get: function() { return  { id: LibWrap.Account.logoutreason_DB_FAILURE, errorMessage: "login_error_internalError", retryButton: true, backButton: false, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        LOGOUTREASON_INVALID_APP_ID:{ get: function() { return  { id: LibWrap.Account.logoutreason_INVALID_APP_ID, errorMessage: "login_error_internalError", retryButton: true, backButton: false, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        LOGOUTREASON_UNSUPPORTED_VERSION:{ get: function() { return  { id: LibWrap.Account.logoutreason_UNSUPPORTED_VERSION, errorMessage: "login_error_unsupportedVersionError", retryButton: true, backButton: false, tryToSignOut: false, params: ["ms-windows-store:updates"] }; }, enumerable: true },
        LOGOUTREASON_ATO_BLOCKED:{ get: function() { return  { id: LibWrap.Account.logoutreason_ATO_BLOCKED, errorMessage: "login_error_atoBlocked", retryButton: false, backButton: false, tryToSignOut: false, params: ["http://go.skype.com/account.recovery.modern"] }; }, enumerable: true },
        LOGOUTREASON_REMOTE_LOGOUT:{ get: function() { return  { id: LibWrap.Account.logoutreason_REMOTE_LOGOUT, errorMessage: "login_error_serverAuthValidationError", retryButton: true, backButton: false, tryToSignOut: true }; }, enumerable: true },
        LOGOUTREASON_ACCESS_TOKEN_RENEWAL_FAILED:{ get: function() { return  { id: LibWrap.Account.logoutreason_ACCESS_TOKEN_RENEWAL_FAILED, errorMessage: "login_error_serverAuthValidationError", retryButton: true, backButton: false, tryToSignOut: true }; }, enumerable: true },
    });

    var linkErrors = Object.create(Object.prototype, {
        UNEXPECTED_ERROR:{ get: function() { return  { id: -1, errorMessage: "login_error_internalError", retryButton: false, backButton: true, tryToSignOut: true, params: ["https://www.skype.com/go/support"] }; }, enumerable: true },
        AUTH_RESULT_AUTH_INVALID_SKYPE_AUTHENTICATION:{ get: function() { return  { id: LibWrap.WrSkyLib.auth_RESULT_AUTH_INVALID_SKYPE_AUTHENTICATION, errorMessage: "linkOrCreateAccount_error_authError", retryButton: false, backButton: true, tryToSignOut: false }; }, enumerable: true },
        AUTH_RESULT_AUTH_INVALID_OAUTH_AUTHENTICATION:{ get: function() { return  { id: LibWrap.WrSkyLib.auth_RESULT_AUTH_INVALID_OAUTH_AUTHENTICATION, errorMessage: "linkOrCreateAccount_error_authError", retryButton: false, backButton: true, tryToSignOut: false }; }, enumerable: true },
        AUTH_RESULT_AUTH_USER_IS_UNDERAGE:{ get: function() { return  { id: LibWrap.WrSkyLib.auth_RESULT_AUTH_USER_IS_UNDERAGE, errorMessage: "linkOrCreateAccount_error_msAccountUnderAgeError", retryButton: false, backButton: true, tryToSignOut: true }; }, enumerable: true },
        AUTH_RESULT_AUTH_PARTNER_INTERNAL_ERROR:{ get: function() { return  { id: LibWrap.WrSkyLib.auth_RESULT_AUTH_PARTNER_INTERNAL_ERROR, errorMessage: "linkOrCreateAccount_error_internalError", retryButton: false, backButton: true, tryToSignOut: false }; }, enumerable: true },
        AUTH_RESULT_AUTH_PARTNER_TIMEOUT:{ get: function() { return  { id: LibWrap.WrSkyLib.auth_RESULT_AUTH_PARTNER_TIMEOUT, errorMessage: "linkOrCreateAccount_error_timeoutError", retryButton: false, backButton: true, tryToSignOut: false }; }, enumerable: true },
    });
    msWriteProfilerMark("SkypeDebugETW:loginManager,enums,StopTM");

    
    
    var storedUserIdentity = {
        getValue: function () {
            return Windows.Storage.ApplicationData.current.localSettings.values[LibWrap.AccountManager.local_SETTINGS_KEY_USER_CID];
        },
        isSame: function (customerId) {
            var id = this.getValue();
            
            return !id || id === customerId;
        },
        save: function(customerId) {
            Windows.Storage.ApplicationData.current.localSettings.values[LibWrap.AccountManager.local_SETTINGS_KEY_USER_CID] = customerId;
        },
        reset: function () {
            Windows.Storage.ApplicationData.current.localSettings.values.remove(LibWrap.AccountManager.local_SETTINGS_KEY_USER_CID);
        }
    };

    function onAuthTokenRequest(args) {
        
        var fullScope = args.detail[1].getCount() > 0 ? args.detail[1].get(0) : null;
        var partnerId = args.detail[0];

        log("[LiveID] authtokenrequest for {0}, {1}".format(partnerId, fullScope));
        if (partnerId == LibWrap.WrSkyLib.partner_ID_PARTNER_MICROSOFT && fullScope) {
            var scope = fullScope.split("::")[1];
            log("[LiveID] Generate token for '{0}'".format(scope));
            authUser(authAction.OTHER, scope).then(
                function (accessToken) {
                    lib.putAuthTokens(LibWrap.WrSkyLib.partner_ID_PARTNER_MICROSOFT, args.detail[1], accessToken, 0, "");
                },
                function onError(authStatus) {
                    log("[LiveID] Cannot update accessToken: {0}/{1}/{2}/{3}".format(fullScope, authStatus.name, authStatus.message, authStatus.description, authStatus));

                    
                    
                    if (!lib.loggedIn && !lib.loginInProgress) {
                        invalidateCurrentUser();
                    }
                }
            );
        }
    }
    global.traceFunction && (onAuthTokenRequest = global.traceFunction(onAuthTokenRequest, "LoginManager,onAuthTokenRequest"));

    function grabAccessToken(serviceResponse) {
        var accessToken = "";
        var pairs = serviceResponse.split("&");
        if (pairs.length > 0) {
            for (var i = 0; i < pairs.length; i++) {
                if (pairs[i].substr(0, 2) === "t=") {
                    accessToken = pairs[i].substr(2, pairs[i].length - 2);
                    break;
                }
            }
        }
        return accessToken;
    }

    var _activeAuthPromises = [];

    function authUser(action, serviceScope) {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            var ticketRequests = [];

            var scope, silent = true;
            switch (action) {
                case authAction.SKYPE:
                    scope = (LibWrap.Build.getBuildType() === LibWrap.BuildType.buildtype_REAL_ENV) ? "skype.com" : "skype.net";
                    break;
                case authAction.LOGIN:
                    silent = false;
                    scope = "login.{0}".format((LibWrap.Build.getBuildType() === LibWrap.BuildType.buildtype_REAL_ENV) ? "skype.com" : "skype.net");
                    break;
                case authAction.OTHER:
                    if (!serviceScope) {
                        throw new Error("Invalid serviceScope");
                    }
                    scope = serviceScope;
                    break;
                default:
                    throw new Error("Invalid auth action");
            }

            var liveId = Windows.Security.Authentication.OnlineId;
            var promptType = silent ? liveId.CredentialPromptType.doNotPrompt : liveId.CredentialPromptType.promptIfNeeded;

            var serviceTicketRequest = liveId.OnlineIdServiceTicketRequest(scope, "MBI_SSL");
            ticketRequests.push(serviceTicketRequest);
            log("[LiveID] requesting token for {0}:{1}".format(ticketRequests[0].service, ticketRequests[0].policy));

            try {
                var authenticator = new liveId.OnlineIdAuthenticator();
                var authPromise = authenticator.authenticateUserAsync(ticketRequests, promptType);
                authPromise.done(
                    function (user) {
                        if (!isValidCurrentUser(user.safeCustomerId)) {
                            
                            invalidateCurrentUser();
                        } else {
                            storedUserIdentity.save(user.safeCustomerId);
                            userIdentity = user;
                            var accessToken = grabAccessToken(userIdentity.tickets[0].value);
                            var svcInfo = userIdentity.tickets[0].request;
                            log("[LiveID] AT for {0}:{1}:{2}".format(svcInfo.service, svcInfo.policy, accessToken));
                            completeCallback(accessToken);
                        }
                    },
                    function (error) {
                        if (error != "Canceled" && !willForceLibLogout(error)) {
                            errorCallback(error);
                        }
                        
                    }
                );

                _activeAuthPromises.push(authPromise);
            } catch (e) {
                errorCallback(e);
            }
        });
    }

    function willForceLibLogout(error) {
        
        var cannotUpdateTokenSilently = -2147023579;
        if (error.number === cannotUpdateTokenSilently) {
            log("[LiveID] Inconsistent application state (0x80070525), force logout");
            internalLogout();
            return true;
        }
        return false;
    }

    function internalLogout() {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            
            lib && lib.logoutUser(true);

            
            Skype.Application.LoginHandlerManager.instance.removeEventListener(Skype.Application.LoginHandlerManager.Events.LOGOUT, onServerSideLogout);

            
            Skype.UI.disposeAll();

            if (Skype.LoginManager.canSignOutLiveIdUser()) {
                Skype.LoginManager.signOutLiveIdUser().done(completeCallback, errorCallback);
            } else {
                completeCallback();
            }
        });
    }

    function onLogin() {
        
        Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGOUT, onServerSideLogout);
    }
    global.traceFunction && (onLogin = global.traceFunction(onLogin, "LoginManager,onLogin"));

    function onServerSideLogout(e) {
        
        Skype.Application.LoginHandlerManager.instance.removeEventListener(Skype.Application.LoginHandlerManager.Events.LOGOUT, onServerSideLogout);
        storedUserIdentity.reset();
        Skype.UI.disposeAll();
        if (Skype.Application.state.page.name !== "policyWarning") {
            Skype.UI.navigate("login", { state: "logout" });
        }
    }

    function cancelActiveAuthRequests() {
        while (_activeAuthPromises.length) {
            var p = _activeAuthPromises.shift();
            p.cancel();
        }
    }

    
    function init() {
        lib.addEventListener("authtokenrequest", onAuthTokenRequest);
        lib.addEventListener("loginpartially", finishLogin);
        Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGIN_READONLY, onLogin);
    }

    function login() {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            authUser(authAction.LOGIN).then(
                function (accessToken) {
                    if (!Skype.Application.state.policy.application.enabled) {
                        
                        errorCallback({ name: "Canceled", message: "policy_dialog_skype_blocked_body_text".translate(), description: "" });
                        return;
                    }
                    lib.loginWithOAuth(LibWrap.WrSkyLib.partner_ID_PARTNER_MICROSOFT, accessToken, "", true, true);
                    completeCallback();
                },
                errorCallback);
        });
    }

    function finishLogin() {
            lib.finishLogin();
    }

    function logout() {
        Skype.Statistics.sendStats(Skype.Statistics.event.msaLogin_Logout);
        return internalLogout();
    }

    function canSignOutUser() {
        var authenticator = new Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator();
        return authenticator.canSignOut;
    }

    function signOutLiveIdUser() {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            var authenticator = new Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator();
            if (authenticator.canSignOut) {
                authenticator.signOutUserAsync().then(function () {
                    storedUserIdentity.reset();
                    cancelActiveAuthRequests();
                    completeCallback();
                }, errorCallback);
            } else {
                errorCallback();
            }
        });
    }

    function getUserEmail() {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            if (userIdentity === null) {
                authUser(authAction.SKYPE).done(
                    function () {
                        completeCallback(userIdentity.signInName);
                    },
                    errorCallback);
            } else {
                completeCallback(userIdentity.signInName);
            }
        });
    }

    function isValidCurrentUser(safeCustomerId) {
        var authenticator = new Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator();
        safeCustomerId = safeCustomerId || authenticator.authenticatedSafeCustomerId;
        var isSameUser = storedUserIdentity.isSame(safeCustomerId);
        log("[LiveID] storedCustomerId({0}) === safeCustomerId ({1}) => {2}".format(storedUserIdentity.getValue(), safeCustomerId, isSameUser));
        return isSameUser;
    }
    
    function invalidateCurrentUser() {
        
        if (!lib) {
            log("[LiveID] Cannot invalidate user login, lib is not available");
            return;
        }
        log("[LiveID] Invalidating user login");
        storedUserIdentity.reset();
        WinJS.Application.sessionState = {};

        if (lib.loggedIn) {
            lib.invalidateUserLogin();
        } else {
            if (Skype.UI) {
                if (Skype.Application.state.forcedOffline) {
                    endForcedOffline();
                } else {
                    Skype.UI.navigate("login", { state: "logout", error: logoutErrors.LOGOUTREASON_INVALID_SKYPENAME.id });
                }
            }
        }
    }
        
    
    function setSkypeCredentials(usr, pwd) {
        skypename = usr;
        password = pwd;
    }

    function startForcedOffline() {
        
        Skype.Application.state.forcedOffline = true;

        logout();

        
        Skype.Notifications.Tiles.clear();
        Skype.Notifications.Tiles.showOfflineTile();
    }

    function endForcedOffline() {
        Skype.Application.state.forcedOffline = false;

        
        var libStarted = (lib && lib.getLibStatus() !== LibWrap.WrSkyLib.libstatus_CONSTRUCTED);
        if (libStarted) {
            Skype.UI.navigate("login", { state: "useLiveIDAccount" });
        } else {
            Skype.LibraryManager.instance.unblockStart();
        }

        Skype.Notifications.Tiles.clear();
    }

    function linkAccounts(allowSpam, allowSms) {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            lib.addEventListener("accountpartnerlinkresult", function (e) {
                if (e.detail[0] === LibWrap.WrSkyLib.auth_RESULT_AUTH_OK) {
                    accountsAreLinked = true;
                    completeCallback();
                } else {
                    accountsAreLinked = false;
                    errorCallback(e.detail[0]);
                }
            });
            authUser(authAction.SKYPE).then(
                function(accessToken) {
                    var reason = "Connect from Win8 client {0}".format(Skype.Version.skypeVersion);
                    lib.linkAccountWithPartner(LibWrap.WrSkyLib.partner_ID_PARTNER_MICROSOFT, accessToken, skypename, password, reason, allowSpam, allowSms);
                },
                errorCallback);
        });
    }

    function getMsUserAvatarUri() {
        
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            if (userIdentity === null) {
                authUser(authAction.SKYPE).done(
                    function () {
                        completeCallback("https://cid-{0}.users.storage.live.com/users/0x{0}/myprofile/expressionprofile/profilephoto:{1}/{2}?ck={3}&ex={4}&fofoff={5}".format(userIdentity.safeCustomerId, "UserTileStatic", "avt.jpg", "2", "1", "1"));
                    },
                    errorCallback);
            } else {
                completeCallback("https://cid-{0}.users.storage.live.com/users/0x{0}/myprofile/expressionprofile/profilephoto:{1}/{2}?ck={3}&ex={4}&fofoff={5}".format(userIdentity.safeCustomerId, "UserTileStatic", "avt.jpg", "2", "1", "1"));
            }
        });
    }

    function getSkypeUserAvatar() {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            lib.addEventListener("accountavatarresult", function (e) {
                if (e.detail[0] === 0) {
                    
                    completeCallback(e.detail[2]);
                } else {
                    
                    log("[LiveID] Error while getting skype avatar - ({0}), {1}".format(e.detail[0], e.detail[1]));
                    errorCallback(e.detail[0], e.detail[1]);
                }
            });

            lib.getAccountAvatar(LibWrap.WrSkyLib.partner_ID_PARTNER_MICROSOFT, "", skypename, password, skypename);
        });
    }

    function getSuggestedAccounts() {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            function onResults(e) {
                if (e.detail[0] === 0) {
                    var suggestedAccounts = [];
                    var accountsCount = e.detail[1].getCount();
                    for (var i = 0; i < accountsCount; i++) {
                        var account = {};
                        account.username = e.detail[1].get(i);
                        account.name = e.detail[2].get(i);
                        account.avatar = e.detail[3].get(i);
                        suggestedAccounts.push(account);
                    }
                    completeCallback(suggestedAccounts);
                } else {
                    errorCallback(e.detail[0]);
                }
                lib.removeEventListener("suggestedaccountsresult", onResults);
            }

            lib.addEventListener("suggestedaccountsresult", onResults);

            authUser(authAction.SKYPE).then(
                function (accessToken) {
                    lib.getSuggestedAccounts(LibWrap.WrSkyLib.partner_ID_PARTNER_MICROSOFT, accessToken);
                },
                errorCallback);
        });
    }

    
    function getErrorByLibCode(type, code) {
        var errors = (type === errorType.LINK) ? linkErrors : logoutErrors;
        for (var key in errors) {
            var error = errors[key];
            if (error.id === code) {
                return error;
            }
        }
        return (type === errorType.LINK) ? linkErrors.UNEXPECTED_ERROR : logoutErrors.UNEXPECTED_ERROR;
    }

    WinJS.Namespace.define("Skype.LoginManager", {
        init: init,
        login: login,
        finishLogin: finishLogin,
        logout: logout,
        isValidCurrentUser: isValidCurrentUser,
        invalidateCurrentUser: invalidateCurrentUser,
        canSignOutLiveIdUser: canSignOutUser,
        signOutLiveIdUser: signOutLiveIdUser,
        userEmail: getUserEmail,

        ErrorCodes: {
            LiveIDDialogError: -2
        },
        ErrorType: errorType,
        getErrorByLibCode: getErrorByLibCode,

        setSkypeCredentials: setSkypeCredentials,
        linkAccounts: linkAccounts,
        accountsAreLinked: accountsAreLinked,
        getMsUserAvatarUri: getMsUserAvatarUri,
        getSkypeUserAvatar: getSkypeUserAvatar,
        getSuggestedAccounts: getSuggestedAccounts,

        startForcedOffline: startForcedOffline,
        endForcedOffline: endForcedOffline
    });
})(this || window);
msWriteProfilerMark("SkypeDebugETW:loginManager,StopTM");
