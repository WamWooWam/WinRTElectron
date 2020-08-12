

(function () {
    "use strict";

    Skype.UI.Page.define("/pages/linkOrCreateAccount.html", "div.fragment.linkOrCreateAccount", {
        useOneInstance: true,
        disposeOnHide: true,
        
        userField: null,
        passField: null,
        signinBtn: null,
        allowSpam: null,
        allowSms: null,
        suggestedAccounts: null,
        currentMainControl: "startUsingSkype",
        currentControl: "startUsingSkype",
        previousControl: "startUsingSkype",

        
        onRender: function () {
            Skype.OmnitureReporter.init();

            this.userField = this.element.querySelector("div.skypeUserCredentials #username");
            this.passField = this.element.querySelector("div.skypeUserCredentials #password");
            this.signinBtn = this.element.querySelector("div.skypeUserCredentials button");
            this.allowSms = this.element.querySelector("#allowSms");
            this.allowSpam = this.element.querySelector("#allowSpam");
            this.anotherAccountBtn = this.element.querySelector("div.selectSkypeAccount button");

            this.regEventListener(this.passField, "input", this.signinEnabledCheck.bind(this));
            this.regEventListener(this.userField, "input", this.signinEnabledCheck.bind(this));
            this.regEventListener(this.signinBtn, "click", this.onSigninClicked.bind(this));

            
            this.registerHandlerForControl("button.backbutton", "click", this.onNavigateBack.bind(this));
            this.registerHandlerForControl("a.problems", "click", function () { this.goToUrl("https://login.skype.com/account/password-reset-request"); });
            this.registerHandlerForControl("a.cancelMerge", "click", function () { this.navigateTo("startUsingSkype"); });
            this.registerHandlerForControl("button.existingUser", "click", this.onExistingUserClicked.bind(this));
            this.registerHandlerForControl("div.acceptTermsOfUse button", "click", this.onAcceptTermsOfUse);
            this.registerHandlerForControl("div.mergeAccounts button", "click", this.onMergeAccounts);
            this.registerHandlerForControl("button.newUser", "click", this.onNewUserClicked.bind(this));

            this.registerLinkHandlerForControl("a.helpLink", function() { this.goToUrl("https://support.skype.com/faq/FA12060/"); }.bind(this));
            this.registerLinkHandlerForControl("#msaLoginChangeLink", this.signOutMSA.bind(this));
            this.registerLinkHandlerForControl("li.switchMSA", this.signOutMSA.bind(this));
            this.registerLinkHandlerForControl("li.switchSkype", this.onSwitchSkypeOptionInvoked.bind(this));
            this.registerLinkHandlerForControl("li.createSkype.signOut", function () { this.navigateTo("acceptTermsOfUse"); }.bind(this));
            this.registerLinkHandlerForControl("li.createSkype.noSignOut", function () { this.navigateTo("acceptTermsOfUse"); }.bind(this));
            
            this.regEventListener(this.anotherAccountBtn, "click", this.anotherAccountClicked.bind(this));

            
            this.signinEnabledCheck();
            this.setControlState("div.startUsingSkype", true);

            this.regEventListener(lib, "authtokenresult", this.handleAuthTokenResult.bind(this));
            this.regEventListener(lib, "partnerlinkinforesult", this.handleAccountLinkedResult.bind(this));

            Skype.LoginManager.userEmail().done(function (email) {
                this.setControlHtml("#msaLoginEmail", "linkOrCreateAccount_startUsingSkype_account_text".translate(email));
                this.setControlAria("#msaLoginChangeLink", "linkOrCreateAccount_startUsingSkype_account_aria".translate(email));
            }.bind(this), function onError() { });

            this.regEventListener(window, "keydown", function (args) {
                if (args.keyCode === WinJS.Utilities.Key.backspace && Skype.Application.state.page.name === "linkOrCreateAccount") {
                    if (Skype.UI.Util.activeElementCantBeBlured()) {
                        return;
                    }
                    this.onNavigateBack();
                }
            }.bind(this));

            this.setControlState("#msaLoginChangeLink", Skype.LoginManager.canSignOutLiveIdUser());

            
            this.handleAriaLabels();
        },

        onExistingUserClicked: function () {
            this.disableControl("button.existingUser");
            this.disableControl("button.newUser");

            this.getSuggestedAccounts(false);
            Skype.OmnitureReporter.trackAction(Skype.OmnitureReporter.actions.mergeAccounts);
        },

        onNewUserClicked: function () {
            this.disableControl("button.existingUser");
            this.disableControl("button.newUser");

            this.getSuggestedAccounts(true);
            Skype.OmnitureReporter.trackAction(Skype.OmnitureReporter.actions.createTechnicalAccount);
        },
        
        handleAriaLabels: function() {
            
            document.querySelector("button.existingUser").setAttribute("aria-label", "linkOrCreateAccount_startUsingSkype_existingSkypeUser_button_aria".translate());
            document.querySelector("button.newUser").setAttribute("aria-label", "linkOrCreateAccount_startUsingSkype_newSkypeUser_button_aria".translate());

            if (Skype.LoginManager.canSignOutLiveIdUser()) {
                Skype.LoginManager.userEmail().done(function(email) {
                    document.querySelector("#msaLoginChangeLink").setAttribute("aria-label", "linkOrCreateAccount_startUsingSkype_account_change_link_aria".translate(email));
                });
            }
        },

        anotherAccountClicked: function () {
            if (this.currentControl == "selectSkypeAccount") {
                
                this.selectedAccount = null;
                this.userField.value = this.passField.value = "";
                this.navigateTo("skypeUserCredentials");
                this.previousControl = "selectSkypeAccount";
            } else if (this.currentControl == "remindSkypeAccount") {
                this.navigateTo("acceptTermsOfUse");
            }
        },

        signOutMSA: function () {
            Skype.UI.navigate("login", { state: "logoutLiveId" });
        },

        onReady: function() {
            this.suggestedAccountsList = this.element.querySelector("div.accountsList").winControl;
            this.regEventListener(this.suggestedAccountsList, 'iteminvoked', this.onAccountSelected.bind(this));
        },

        onShow: function () {
            this.navigateTo("startUsingSkype");
        },

        
        navigateTo: function (control) {
            if (control !== this.currentControl) {
                
                var mainControl;

                if (control === "acceptTermsOfUse") {
                    mainControl = "createNewAccount";
                    this.previousControl = "startUsingSkype";
                } else if (["selectSkypeAccount", "remindSkypeAccount", "skypeUserCredentials", "accountUserCredentials", "mergeAccounts", "accountAlreadyLinked"].indexOf(control) !== -1) {
                    mainControl = "linkSkypeAccount";
                    switch (control) {
                        case "accountUserCredentials":
                            this.previousControl = this.currentControl === "selectSkypeAccount" ? "selectSkypeAccount" : "remindSkypeAccount";
                            break;
                        case "mergeAccounts":
                            this.previousControl = this.currentControl === "accountUserCredentials" ? "accountUserCredentials" : "skypeUserCredentials";
                            break;
                        default:
                            this.previousControl = "startUsingSkype";
                            break;
                    }
                } else {
                    mainControl = "startUsingSkype";
                    this.previousControl = "startUsingSkype";
                }

                if (mainControl !== this.currentMainControl) {
                    this.setControlState("div." + this.currentMainControl, false);
                    this.setControlState("div." + mainControl, true);
                    this.setControlState("button.backbutton", (mainControl !== "startUsingSkype"));
                    this.currentMainControl = mainControl;
                }
                this.setControlState("div." + this.currentControl, false);
                this.currentControl = control;
            }
            
            this.setControlState("div." + control, true);

            this.updateUIElements();

            this.focusControl("div." + control);

            this.element._name = 'foo';
            Skype.UI.animate(this.element);

            
            this.regImmediate(Skype.OmnitureReporter.trackPage, control);
        },

        getSuggestedAccounts: function (remindAccounts) {
            this.regPromise(Skype.LoginManager.getSuggestedAccounts()).then(
                function (suggestedAccounts) {

                    var hasSuggestions = suggestedAccounts && suggestedAccounts.length && suggestedAccounts[0].username !== "";
                    if (hasSuggestions) {
                        for (var i = 0; i < suggestedAccounts.length; i++) {
                            suggestedAccounts[i].avatarUrl = suggestedAccounts[i].avatar || "https://api.skype.com/users/{0}/profile/avatar".format(suggestedAccounts[i].username);
                            suggestedAccounts[i].ariaLabel = "linkOrCreateAccount_skypeUserCredentials_existing_skype_name_aria".translate(suggestedAccounts[i].name);
                        }
                        this.suggestedAccountsList.itemDataSource = new WinJS.Binding.List(suggestedAccounts).dataSource;

                        this.navigateTo(remindAccounts ? "remindSkypeAccount" : "selectSkypeAccount");
                    } else {
                        this.navigateTo(remindAccounts ? "acceptTermsOfUse" : "skypeUserCredentials");
                    }
                }.bind(this),
                function (errorCode) {
                    log("[LiveID] Error while requesting suggested accounts: " + errorCode);
                    this.navigateTo(remindAccounts ? "acceptTermsOfUse" : "skypeUserCredentials");
                    Skype.OmnitureReporter.trackAction(Skype.OmnitureReporter.actions.error(errorCode));
                }.bind(this)
            );
        },
        
        updateUIElements: function () {
            switch (this.currentControl) {
                case "selectSkypeAccount":
                    this.setControlText("div.linkSkypeAccount h2.controlTitle", "linkOrCreateAccount_suggestAccounts_title".translate());
                    this.setControlAria("div.selectSkypeAccount", "linkOrCreateAccount_suggestAccounts_title".translate());
                    this.setControlText("div.selectSkypeAccount > p", "linkOrCreateAccount_suggestAccounts_text".translate());
                    this.setControlText("div.selectSkypeAccount > button", "linkOrCreateAccount_mergeAccounts_another_account_button".translate());
                    break;

                case "remindSkypeAccount":
                    this.setControlText("div.linkSkypeAccount h2.controlTitle", "linkOrCreateAccount_remindAccounts_title".translate());
                    this.setControlAria("div.remindSkypeAccount", "linkOrCreateAccount_remindAccounts_title".translate());
                    this.setControlText("div.remindSkypeAccount > p", "linkOrCreateAccount_remindAccounts_title".translate());
                    this.setControlText("div.remindSkypeAccount > button", "linkOrCreateAccount_remindAccounts_create_account".translate());

                    break;
                case "accountUserCredentials":
                    this.setControlText("div.linkSkypeAccount h2.controlTitle", "linkOrCreateAccount_selectedAccount_title".translate());
                    this.setControlAria("div.accountUserCredentials", "linkOrCreateAccount_selectedAccount_title".translate());
                    this.signinEnabledCheck();
                    this.setControlState("#username", false);
                    this.setControlState("#accountContact", true);

                    var template = document.querySelector("#accountContactTemplate");
                    var result = template.renderItem(WinJS.Promise.wrap({ data: this.selectedAccount }));

                    this.element.querySelector("#accountContact").innerHTML = "";
                    this.element.querySelector("#accountContact").appendChild(result.element._value);

                    
                    this.passField.disabled = false;
                    this.clearError();
                    break;
                case "skypeUserCredentials":
                    this.setControlText("div.linkSkypeAccount h2.controlTitle", "linkOrCreateAccount_skypeUserCredentials_title".translate());
                    this.setControlAria("div.skypeUserCredentials", "linkOrCreateAccount_skypeUserCredentials_title".translate());
                    this.signinEnabledCheck();
                    this.setControlState("#username", true);
                    this.setControlState("#accountContact", false);
                    this.userField.disabled = false;
                    this.passField.disabled = false;
                    this.clearError();
                    break;
                case "mergeAccounts":
                    this.enableControl("div.mergeAccounts button");
                    this.setControlText("div.linkSkypeAccount h2.controlTitle", "linkOrCreateAccount_mergeAccounts_title".translate());
                    Skype.LoginManager.userEmail().done(
                        function (email) {
                            this.setControlHtml("#liveIdUsername", email);
                            this.setControlHtml("#mergeAccountsNote", "linkOrCreateAccount_mergeAccounts_note".translate(email));
                            this.setControlAria("#accountsAriaLabel", "linkOrCreateAccount_mergeAccounts_accounts_aria".translate(email, this.userField.value));
                        }.bind(this));
                    this.setControlHtml("#skypeUsername", this.userField.value);
                    Skype.LoginManager.getMsUserAvatarUri().done(
                        function(uri) {
                            this.element.querySelector("#liveIdAvatarImg").src = uri;
                        }.bind(this));
                    this.getSkypeAvatar();
                    
                    break;
                case "accountAlreadyLinked":
                    this.setControlText("div.linkSkypeAccount h2.controlTitle", "linkOrCreateAccount_accountAlreadyLinked_title".translate());
                    

                    this.setControlText("div.{0} div.error div.message".format(this.currentMainControl), "linkOrCreateAccount_accountAlreadyLinked_error".translate(this.userField.value));

                    var canSignOut = Skype.LoginManager.canSignOutLiveIdUser();

                    var ariaLabel = canSignOut ? "linkOrCreateAccount_accountAlreadyLinked_error_aria_signOut".translate(this.userField.value) : "linkOrCreateAccount_accountAlreadyLinked_error_aria_noSignOut".translate(this.userField.value);
                    this.setControlAria("div.{0} div.error".format(this.currentMainControl), ariaLabel);

                    this.element.querySelector("div.accountAlreadyLinked > ul").className = canSignOut ? "signOut" : "noSignOut";

                    this.setControlState("div.{0} div.error".format(this.currentMainControl), true);
                    break;
                case "acceptTermsOfUse":
                    this.setControlText("div.createNewAccount h2.controlTitle", "linkOrCreateAccount_acceptTermsOfUse_title".translate());
                    this.setControlHtml("div.acceptTermsOfUse #confirmationText", "linkOrCreateAccount_acceptTermsOfUse_confirmation_text".translate("https://www.skype.com/go/tos", "https://www.skype.com/go/privacy"));
                    this.enableControl("div.acceptTermsOfUse button");
                    break;
                case "startUsingSkype":
                    this.enableControl("button.existingUser");
                    this.enableControl("button.newUser");
                    break;
            }
        },

        onAccountSelected: function (e) {
            e.detail.itemPromise.then(function (item) {
                this.selectedAccount = item.data;
                this.userField.value = item.data.username;
                this.navigateTo("accountUserCredentials");
            }.bind(this));
        },
        
        onSwitchSkypeOptionInvoked: function () {
            this.userField.value = this.passField.value = "";
            this.navigateTo("skypeUserCredentials");
        },
        
        getSkypeAvatar: function () {
            if (this.selectedAccount && this.selectedAccount.avatar) {
                this.element.querySelector("#skypeAvatarImg").src = this.selectedAccount.avatar;
            } else {
                this.regPromise(Skype.LoginManager.getSkypeUserAvatar())
                    .then(
                        function (binaryData) {
                            
                            var bytes = binaryData.getAsBase64();
                            if (this && this.element && bytes) {
                                this.element.querySelector("#skypeAvatarImg").src = "data:image/jpeg;base64," + bytes;
                            }
                        }.bind(this),
                        function () {
                            log("[LiveID] Using default avatar");
                        }
                    );
            }
        },

        
        goToUrl: function (uri) {
            Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(uri));
        },

        setControlText: function (query, text) {
            var control = this.element.querySelector(query);
            if (control) {
                control.textContent = text;
            }
        },

        setControlHtml: function (query, text) {
            var control = this.element.querySelector(query);
            if (control) {
                WinJS.Utilities.setInnerHTML(control, text);
            }
        },

        setControlAria: function (query, text) {
            var control = this.element.querySelector(query);
            if (control) {
                control.setAttribute("aria-label", text);
            }
        },

        registerHandlerForControl: function (query, eventName, eventHandler) {
            var control = this.element.querySelector(query);
            if (control) {
                this.regEventListener(control, eventName, eventHandler.bind(this));
            }
        },
        
        registerLinkHandlerForControl: function (query, eventHandler) {
            var control = this.element.querySelector(query);
            if (control) {
                this.regEventListener(control, "click", eventHandler.bind(this));
                this.regEventListener(control, "keypress", function(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space) {
                        eventHandler();
                    }
                });
            }
        },

        setControlState: function (query, isVisible) {
            var control = this.element.querySelector(query);
            if (control) {
                (isVisible) ? WinJS.Utilities.removeClass(control, "hidden") : WinJS.Utilities.addClass(control, "hidden");
            }
        },

        enableControl: function (query) {
            var control = this.element.querySelector(query);
            if (control) {
                control.disabled = false;
            }
        },

        disableControl: function (query) {
            var control = this.element.querySelector(query);
            if (control) {
                control.disabled = true;
            }
        },

        focusControl: function (query) {
            var control = this.element.querySelector(query);
            if (control) {
                control.focus();
            }
        },


        onNavigateBack: function () {
            this.clearError();
            if (this.previousControl === "logout") {
                Skype.UI.navigate("login", { state: "useLiveIDAccount" });
            } else if (this.currentControl !== "startUsingSkype") {
                this.navigateTo(this.previousControl);
            }
        },

        clearError: function () {
            this.setControlState("div.{0} div.error".format(this.currentMainControl), false);
        },

        setError: function (errorCode) {
            
            this.setControlState("div." + this.currentControl, false);
            this.previousControl = this.currentControl;
            this.currentControl = "error";
            
            
            var error = Skype.LoginManager.getErrorByLibCode(Skype.LoginManager.ErrorType.LINK, errorCode);
            var msg = error.params ? error.errorMessage.translate(error.params) : error.errorMessage.translate();
            this.setControlHtml("div.{0} div.error div.message".format(this.currentMainControl), msg);
            this.setControlText("div.{0} h2.controlTitle".format(this.currentMainControl), "login_general_error_title".translate());

            this.setControlState("div.{0} div.error".format(this.currentMainControl), true);
            this.setControlState("button.backbutton", error.backButton);

            this.setControlAria("div.{0}".format(this.currentMainControl), "login_general_error_title".translate() + msg);
            this.focusControl("div.{0}".format(this.currentMainControl));

            if (error.tryToSignOut) {
                this.previousControl = "logout";
                var dummyFn = function dummy() {};
                Skype.LoginManager.signOutLiveIdUser().then(dummyFn, dummyFn);
            }
        },

        setLoginError: function () {
            
            this.setControlText("div.{0} div.error div.message".format(this.currentMainControl), "login_error".translate());
            this.setControlAria("div.{0} div.error".format(this.currentMainControl), "login_error".translate());
            this.setControlState("div.{0} div.error".format(this.currentMainControl), true);
            this.focusControl("div.{0} div.error".format(this.currentMainControl));
            this.userField.disabled = false;
            this.passField.disabled = false;
            this.passField.value = "";
            this.signinEnabledCheck();

            var errorCode = "authTokenError";
            Skype.OmnitureReporter.trackAction(Skype.OmnitureReporter.actions.error(errorCode));
        },


        
        signinEnabledCheck: function () {
            this.signinBtn.disabled = !(this.userField.value && this.passField.value);
        },

        handleAuthTokenResult: function(e) {
            if (e.detail[0]) {
                this.clearError();
                Skype.LoginManager.setSkypeCredentials(this.userField.value, this.passField.value);

                
                lib.getPartnerLinkInfo("999", this.userField.value, this.passField.value);
            } else {
                log("[LiveID] Skype credentials check failed");
                this.setLoginError();
            }
        },

        handleAccountLinkedResult: function (e) {
            var linkedToID = e.detail[2];

            var linkedSkype = e.detail[1];
            var linkedMSA = e.detail.length > 4 && e.detail[4];

            if (linkedToID) {
                if (Skype.LoginManager.isValidCurrentUser(linkedToID)) {
                    log("[LiveID] Your MS and skype account are already linked, loging in");

                    this.navigateTo("login");
                } else {
                    log("[LiveID] Given skype account is already linked");
                    this.navigateTo("accountAlreadyLinked");
                    Skype.OmnitureReporter.trackAction(Skype.OmnitureReporter.actions.error(LibWrap.WrSkyLib.auth_RESULT_AUTH_ANOTHER_MAPPING_EXISTS));
                }
            } else {
                this.navigateTo("mergeAccounts");
            }
        },

        onSigninClicked: function (e) {
            this.signinBtn.disabled = true;
            this.userField.disabled = true;
            this.passField.disabled = true;

            lib.requestWebSessionWithPassword(this.userField.value, this.passField.value);
        },

        onMergeAccounts: function () {
            this.disableControl("div.mergeAccounts button");
            Skype.LoginManager.linkAccounts(false, false).then(
                function () {
                    log("[LiveID] Accounts are linked");
                    Skype.Statistics.sendStats(Skype.Statistics.event.msaLinking_AccountsLinkSuccess);
                    Skype.UI.navigate("login", { state: "useLiveIDAccount" });
                },
                function (errorCode) {
                    this.enableControl("div.mergeAccounts button");
                    log("[LiveID] Link accounts error: code [{0}]".format(errorCode));

                    if (errorCode === LibWrap.WrSkyLib.auth_RESULT_AUTH_ANOTHER_MAPPING_EXISTS) {
                        log("[LiveID] Skype account already linked");
                        this.navigateTo("accountAlreadyLinked");
                    } else {
                        this.setError(errorCode);
                    }
                    Skype.OmnitureReporter.trackAction(Skype.OmnitureReporter.actions.error(errorCode));
                }.bind(this)
            );
        },

        onAcceptTermsOfUse: function () {
            this.disableControl("div.acceptTermsOfUse button");
            Skype.LoginManager.setSkypeCredentials("", "");
            this.regPromise(Skype.LoginManager.linkAccounts(this.allowSpam.checked, this.allowSms.checked))
                .then(function () {
                    
                    this.regTimeout(function () { Skype.UI.navigate("login", { state: "useLiveIDAccount" }); }, 1000);
                    log("[LiveID] Account created and linked");
                    Skype.Statistics.sendStats(Skype.Statistics.event.msaLinking_NewUserCreated);
                }.bind(this),
                function (errorCode) {
                    this.enableControl("div.acceptTermsOfUse button");
                    log("[LiveID] Create new account and link error: code [{0}]".format(errorCode));
                    this.setError(errorCode);
                            
                    Skype.OmnitureReporter.trackAction(Skype.OmnitureReporter.actions.error("create_account_" + errorCode));
                }.bind(this)
            );
        },
    });
})();