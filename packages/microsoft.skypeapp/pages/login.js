

(function () {
    "use strict";

    Skype.UI.Page.define("/pages/login.html", "div.login.fragment", {
        useOneInstance: true,
        disposeOnHide: true,
        endOfLifeError: false,

        onRender: function () {
            log("login.onRender()");
            this.regEventListener(this.element.querySelector("button.retryButton"), "click", this.onRetryButton.bind(this));
        },

        
        onShow: function (options) {
            
            var currentState = options && options.state;
            var erroCode = options && options.error;

            log("login.onShow(" + currentState + ")");

            switch (currentState) {
                
                case "splash":
                    this.startConnectingAnim();
                    break;
                case "useLiveIDAccount":
                    this.loginWithLiveId();
                    break;
                case "logout":
                    this.stopConnectingAnim();
                    
                    if (!erroCode && (lib.logoutReason === 0 || lib.logoutReason === LibWrap.Account.logoutreason_LOGOUT_CALLED)) {
                        this.clearError();
                        this.loginWithLiveId();
                    } else {
                        this.updateError(erroCode);
                    }
                    break;
                case "force logout":
                    this.logoutUser();
                    
                    this.startConnectingAnim();
                    break;
                case "logoutLiveId":
                    
                    Skype.LoginManager.signOutLiveIdUser();
                    this.loginWithLiveId();
                    break;
            }
        },

        loginWithLiveId: function () {
            log("login.loginWithLiveId()");
            this.startConnectingAnim();
            Skype.LoginManager.login().then(
                function () {
                    log("[LiveID] Successfully logged into Windows Live with LiveID. Login to Skype now...");
                    this.startConnectingAnim();
                }.bind(this),
                function (authStatus) {
                    log("[LiveID] The Windows Live dialog error: {0}/{1}/{2}".format(authStatus.name, authStatus.message, authStatus.description));
                    if (authStatus.name === "Canceled") {
                        log("[LiveID] The Windows Live dialog is closed by user");
                        Skype.UI.navigate("login", { state: "useLiveIDAccount" });
                    } else {
                        this.setError(Skype.LoginManager.ErrorCodes.LiveIDDialogError);
                    }
                }.bind(this));
        },

        logoutUser: function () {
            log("[LiveID] Starting logout..");
            Skype.LoginManager.logout();
        },

        
        updateError: function (errorCode) {
            
            log("[LiveID] Login error: code [{0}]".format(LibWrap.Account.logoutreasontoString(lib.logoutReason)));
            Skype.Statistics.sendStats(Skype.Statistics.event.msaLogin_Failed, "1_{0}".format(lib.logoutReason));

            if (!errorCode && lib.logoutReason === LibWrap.Account.logoutreason_NO_SUCH_IDENTITY) {
                
                if (Skype.LoginManager.accountsAreLinked) {
                    Skype.UI.navigate("login", { state: "useLiveIDAccount" });
                } else {
                    log("[LiveID] Windows LiveID account is not linked to Skype account, starting linking");
                    Skype.UI.navigate('linkOrCreateAccount');
                }
            } else {
                this.setError(errorCode);
            }
        },

        onRetryButton: function () {
            this.clearError();
            Skype.UI.navigate("login", { state: "useLiveIDAccount" });
        },

        setError: function (errorCode) {
            var endOfLifeErrorCode = 24;

            log("login.setError(" + errorCode + ")");
            var titleEl = this.element.querySelector("h2.errorTitle");
           
            var errorId = errorCode || lib.logoutReason;

            var error = Skype.LoginManager.getErrorByLibCode(Skype.LoginManager.ErrorType.LOGIN, errorId);
            var errorElem = this.element.querySelector("div.error");
            var msg = error.params ? error.errorMessage.translate(error.params) : error.errorMessage.translate();
            WinJS.Utilities.setInnerHTML(errorElem.querySelector("div.message"), msg);
            
            if (endOfLifeErrorCode === error.id) {
                          
                titleEl.textContent = "login_end_of_life_title".translate();
                WinJS.Utilities.removeClass(titleEl, "hidden");
                
                var forwardLink = "https://go.skype.com/help.faq.getskypedesktop?intsrc=client-_-windows8_{0}-_-{1}-_-decom_info".format(Skype.Version.getPlatformId(), Skype.Version.uiVersion(false));

                msg = error.params ? error.errorMessage.translate(forwardLink) : error.errorMessage.translate();
                WinJS.Utilities.setInnerHTML(errorElem.querySelector("div.message"), msg);

                this.element.querySelector("button.getSkypeButton").addEventListener("click", this.launchWin32DownloadUri, false);
                WinJS.Utilities.removeClass(this.element.querySelector("button.getSkypeButton"), "hidden");

            } else {

                
                titleEl.textContent = "login_general_error_title".translate();
                WinJS.Utilities.removeClass(titleEl, "hidden");

                if (error.retryButton) {
                  
                    WinJS.Utilities.removeClass(this.element.querySelector("button.retryButton"), "hidden");
                }
                if (error.tryToSignOut) {
                    var dummyFn = function dummy() {
                    };
                    Skype.LoginManager.signOutLiveIdUser().then(dummyFn, dummyFn);
                }

            }

            WinJS.Utilities.removeClass(errorElem, "hidden");
            this.stopConnectingAnim();
        },

        launchWin32DownloadUri: function () {

            
            var uriToLaunch = "https://go.skype.com/help.faq.seewhatyoucandodesktop?intsrc=client-_-windows8_{0}-_-{1}-_-decom_download".format(Skype.Version.getPlatformId(), Skype.Version.uiVersion(false));

            var uri = new Windows.Foundation.Uri(uriToLaunch);
            Windows.System.Launcher.launchUriAsync(uri).done(
                    function (success) {
                        if (success) {
                            log("URI " + uri.absoluteUri + " launched.");
                        } else {

                            log("URI launch failed.");
                        }
                    });
        },

        clearError: function () {
            WinJS.Utilities.addClass(this.element.querySelector("div.error"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("button.retryButton"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("h2.errorTitle"), "hidden");
        },

        
        startConnectingAnim: function () {
            log("login.startConnectingAnim");
            WinJS.Utilities.addClass(this.element, 'CONNECTING');
        },

        stopConnectingAnim: function () {
            log("login.stopConnectingAnim");
            WinJS.Utilities.removeClass(this.element, 'CONNECTING');
        }
    });
})();