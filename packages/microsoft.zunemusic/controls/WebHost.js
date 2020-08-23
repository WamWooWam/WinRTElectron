/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WebHostPurchasePrompt: MS.Entertainment.UI.Framework.defineUserControl("/Controls/WebHost.html#webHostPurchasePromptTemplate", function webHostPurchasePromptConstructor(element, options){}, {
            initialize: function initialize() {
                this.promptOnPurchase.title = String.load(String.id.IDS_SETTINGS_PROMPT_TOGGLE_TITLE);
                this.promptOnPurchase.checked = (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase
            }, submit: function submit() {
                    (new Microsoft.Entertainment.Configuration.ConfigurationManager).generalSettings.alwaysPromptOnPurchase = this.promptOnPurchase.checked
                }
        }, {description: null})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WebHost: MS.Entertainment.UI.Framework.defineUserControl("/Controls/WebHost.html#webHostTemplate", function(element, options) {
            this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
            this._eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
            this.onIFrameLoadHandler = this.onIFrameLoad.bind(this);
            this.onReadyStateChangeHandler = this.onReadyStateChange.bind(this)
        }, {
            _webIFrame: null, _authWithCTP: true, _signIn: null, _eventProvider: null, _loadAuthenticatedUrlOnInitialize: false, _initialized: false, _signInBound: false, _hasValidTicket: false, _signedInOnStart: false, _parentOverlay: null, onIFrameLoadHandler: null, onReadyStateChangeHandler: null, title: null, sourceUrl: null, authenticatedSourceUrl: null, webHostExperienceFactory: null, webHostExperience: null, firstPromptOnPurchaseTitle: null, firstPromptOnPurchaseDescription: null, cancelListener: null, finishedListener: null, errorListener: null, showBackButton: false, showCancelButton: false, isDialog: false, frameWidth: "100%", frameHeight: "100%", signInOverride: false, taskId: String.empty, flowId: String.empty, onMessage: null, timer: null, isSettingsFlow: false, skipPurchasePrompt: false, setOverlay: function setOverlay(instance) {
                    this._parentOverlay = instance
                }, onSessionTimeout: function onSessionTimeout() {
                    var that = this;
                    WinJS.Promise.timeout().then(function() {
                        var buttons = [{
                                    title: String.load(String.id.IDS_YES_BUTTON), isEnabled: true, isAvailable: true, execute: function onYes(overlay) {
                                            overlay.hide();
                                            that.loadAuthenticatedUrl()
                                        }
                                }, {
                                    title: String.load(String.id.IDS_NO_BUTTON), isEnabled: true, isAvailable: true, execute: function onNo(overlay) {
                                            overlay.hide();
                                            if (that.webHostExperience && that.webHostExperience.cancelReceived)
                                                that.webHostExperience.cancelReceived();
                                            if (that.cancelListener)
                                                that.cancelListener()
                                        }
                                }];
                        MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_DIALOG_SESSION_TIMED_OUT_TITLE), String.load(String.id.IDS_DIALOG_SESSION_TIMED_OUT_MESSAGE), {
                            buttons: buttons, defaultButtonIndex: 0, cancelButtonIndex: 1
                        })
                    })
                }, onIFrameLoad: function onIFrameLoad() {
                    if (this.timer) {
                        window.clearTimeout(this.timer);
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        this.timer = window.setTimeout(this.onTimerHandler.bind(this), configurationManager.shell.webBlendLoadTimeoutMS)
                    }
                    if (this._webIFrame && this._webIFrame.contentWindow)
                        this._webIFrame.contentWindow.focus()
                }, onReadyStateChange: function onReadyStateChange() {
                    var readyStateProperty;
                    try {
                        readyStateProperty = this._webIFrame.readyState
                    }
                    catch(e) {
                        return
                    }
                    if (readyStateProperty && readyStateProperty === "loading") {
                        if (this._webHostWaitCursor && this._webIFrame) {
                            this._webHostWaitCursor.isBusy = true;
                            WinJS.UI.Animation.fadeOut(this._webIFrame)
                        }
                    }
                    else if (readyStateProperty && readyStateProperty === "interactive") {
                        window.clearTimeout(this.timer);
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        this.timer = window.setTimeout(this.onTimerHandler.bind(this), configurationManager.shell.webBlendLoadTimeoutMS)
                    }
                }, onErrorHandler: function onErrorHandler(errorCode, showError) {
                    if (this._unloaded)
                        return;
                    if (this._webHostWaitCursor)
                        this._webHostWaitCursor.isBusy = false;
                    if (this.timer) {
                        window.clearTimeout(this.timer);
                        this.timer = null
                    }
                    if (this._eventProvider)
                        this._eventProvider.traceWebExperience_Error(this.currentUrl, errorCode);
                    var telemetryParameterArray = [{
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.CurrentPage, parameterValue: this.currentUrl || " "
                            }, {
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.TaskId, parameterValue: this.taskId || " "
                            }, {
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.ErrorCode, parameterValue: errorCode || " "
                            }];
                    MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.WebBlendError, telemetryParameterArray);
                    if (this.webHostExperience && this.webHostExperience.errorReceived)
                        this.webHostExperience.errorReceived(errorCode, !showError);
                    if (this.errorListener)
                        this.errorListener(errorCode)
                }, onTimerHandler: function onTimerHandler() {
                    if (this.timer && this._hasValidTicket) {
                        window.clearTimeout(this.timer);
                        this.timer = null;
                        if (!this._unloaded)
                            this.onErrorHandler(0x80070461)
                    }
                }, loadAuthenticatedUrl: function loadAuthenticatedUrl() {
                    if (!this._initialized) {
                        this._loadAuthenticatedUrlOnInitialize = true;
                        return
                    }
                    if (this._webHostWaitCursor)
                        this._webHostWaitCursor.isBusy = true;
                    if (this.signInOverride)
                        this._loadAuthenticatedUrlOnSignIn();
                    else {
                        this._signedInOnStart = this._signIn.isSignedIn;
                        var container = document.querySelector(".webHostOverlayContainer");
                        if (container)
                            WinJS.Utilities.addClass(container, "hideFromDisplay");
                        this._signIn.signIn().then(function(value) {
                            var shouldAllowFlow = true;
                            if (value === MS.Entertainment.Utilities.SignIn.SignInResult.success) {
                                if (!MS.Entertainment.Utilities.isApp2)
                                    if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).isParentallyControlled) {
                                        shouldAllowFlow = false;
                                        MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_CHILD_AGE_GATING_TITLE), String.load(String.id.IDS_CHILD_AGE_GATING_MESSAGE))
                                    }
                            }
                            else
                                shouldAllowFlow = false;
                            if (shouldAllowFlow)
                                this._loadAuthenticatedUrlOnSignIn();
                            else
                                this._onFlowCancelled()
                        }.bind(this), this._onFlowCancelled.bind(this))
                    }
                }, _onFlowCancelled: function _onFlowCancelled() {
                    if (this._webHostWaitCursor)
                        this._webHostWaitCursor.isBusy = false;
                    if (this.cancelListener)
                        this.cancelListener()
                }, _loadAuthenticatedUrlOnSignIn: function _loadAuthenticatedUrlOnSignIn() {
                    this._webIFrame.addEventListener("load", this.onIFrameLoadHandler.bind(this));
                    this._webIFrame.addEventListener("readystatechange", this.onReadyStateChangeHandler.bind(this));
                    WinJS.UI.Animation.fadeOut(this._webIFrame);
                    this._loadModernAuthenticatedUrlOnSignIn()
                }, _loadModernAuthenticatedUrlOnSignIn: function _loadModernAuthenticatedUrlOnSignIn() {
                    var ticketType = MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL;
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (config.service.enableSecureAuth)
                        ticketType = MS.Entertainment.Utilities.SignIn.TicketType.SA_20MIN;
                    var promptType = this._getPromptTypeOnLoad();
                    this.postFirstPromptCallback = this.postFirstPromptCallback || WinJS.Promise.as;
                    this._signIn.getPassportTicket(ticketType, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PassportTicket), this.signInOverride, promptType).then(function(xboxTicket) {
                        return this._firstPromptOnPurchase()
                    }.bind(this)).then(function() {
                        return this.postFirstPromptCallback(this.appPostDataParams)
                    }.bind(this)).then(function complete() {
                        this._hasValidTicket = true;
                        var container = document.querySelector(".webHostOverlayContainer");
                        if (container)
                            WinJS.Utilities.removeClass(container, "hideFromDisplay");
                        var form = document.createElement("form");
                        form.id = "xbl-webblender-nav-driver";
                        form.method = "post";
                        form.target = this._webIFrame.name;
                        var currentPackage = Windows.ApplicationModel.Package.current;
                        var aumid = currentPackage.id.familyName + "!" + currentPackage.id.name + ".Application";
                        this._addPostDataProperty(form, "Aumid", aumid);
                        var launchTime = (new Date).getTime();
                        this._addPostDataProperty(form, "_LaunchTime", launchTime);
                        this._addPostDataProperty(form, "Offer", this.offer);
                        this._addPostDataProperty(form, "FlowId", this.flowId);
                        this._addPostDataProperty(form, "client", "X13");
                        if (this.appPostDataParams)
                            this._addPostDataParams(this.appPostDataParams, form);
                        var formContainer = document.createElement("div");
                        formContainer.style.display = "none";
                        formContainer.appendChild(form);
                        this._webIFrame.appendChild(formContainer);
                        this.authenticatedSourceUrl = this._addCultureParam(this.authenticatedSourceUrl);
                        this.currentUrl = this.authenticatedSourceUrl;
                        form.action = this.authenticatedSourceUrl;
                        form.submit();
                        WinJS.UI.Animation.fadeIn(this._webIFrame);
                        if (this._webHostWaitCursor)
                            this._webHostWaitCursor.isBusy = false;
                        if (this._eventProvider)
                            this._eventProvider.traceWebExperience_Start(this.taskId);
                        var telemetryParameterArray = [{
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.CurrentPage, parameterValue: this.currentUrl
                                }, {
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.TaskId, parameterValue: this.taskId
                                }];
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.WebBlendLaunch, telemetryParameterArray)
                    }.bind(this), function(err) {
                        if (this._webHostWaitCursor)
                            this._webHostWaitCursor.isBusy = false;
                        if (this.cancelListener)
                            this.cancelListener()
                    }.bind(this))
                }, _getPromptTypeOnLoad: function _getPromptTypeOnLoad() {
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    var promptType = Microsoft.Entertainment.Util.SignInPromptType.promptIfNeeded;
                    var promptedOnSignIn = !this._signedInOnStart && signedInUser.canSignOut;
                    if (config.generalSettings.alwaysPromptOnPurchase && !this.isSettingsFlow && !this.skipPurchasePrompt && !promptedOnSignIn && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT) && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.TOU))
                        promptType = Microsoft.Entertainment.Util.SignInPromptType.retypeCredentials;
                    return promptType
                }, _addCultureParam: function _addCultureParam(url) {
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var cultureParam = "Culture=" + config.marketplace.marketplaceCulture;
                    if (url && url.indexOf("?") > -1)
                        url = url + "&" + cultureParam;
                    else
                        url = url + "?" + cultureParam;
                    return url
                }, _addPostDataProperty: function _addPostDataProperty(form, name, value) {
                    var input = document.createElement("INPUT");
                    input.name = name;
                    input.type = "hidden";
                    input.value = value;
                    form.appendChild(input)
                }, _firstPromptOnPurchase: function _firstPromptOnPurchase() {
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (config.generalSettings.promptOnPurchaseFirstRun && config.generalSettings.alwaysPromptOnPurchase && !this.isSettingsFlow && !this.skipPurchasePrompt && !MS.Entertainment.Utilities.isApp2 && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT) && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.TOU)) {
                        config.generalSettings.promptOnPurchaseFirstRun = false;
                        var firstPromptOnPurchaseTitle = this.firstPromptOnPurchaseTitle || String.load(String.id.IDS_WEBHOST_FIRST_PURCHASE_PROMPT_TITLE);
                        var firstPromptOnPurchaseDescription = this.firstPromptOnPurchaseDescription || String.load(String.id.IDS_WEBHOST_FIRST_PURCHASE_PROMPT_DESCRIPTION);
                        return MS.Entertainment.UI.Shell.showDialog(firstPromptOnPurchaseTitle, "MS.Entertainment.UI.Controls.WebHostPurchasePrompt", {
                                width: "100%", height: "410px", buttons: [WinJS.Binding.as({
                                            title: String.load(String.id.IDS_WEBHOST_FIRST_PURCHASE_PROMPT_BUTTON_NEXT), execute: function execute_next(dialog) {
                                                    dialog.userControlInstance.submit();
                                                    dialog.hide()
                                                }
                                        }), WinJS.Binding.as({
                                            title: String.load(String.id.IDS_CANCEL_BUTTON_TC), execute: function execute_cancel(dialog) {
                                                    dialog.hide()
                                                }
                                        })], defaultButtonIndex: 0, cancelButtonIndex: 1, userControlOptions: {description: firstPromptOnPurchaseDescription}
                            })
                    }
                    else
                        return WinJS.Promise.wrap()
                }, initialize: function initialize() {
                    this.debugWebMessages = [];
                    if (this.webHostExperienceFactory)
                        this.webHostExperience = this.webHostExperienceFactory();
                    if (this.webHostExperience && this.webHostExperience.startListener)
                        this.webHostExperience.startListener();
                    if (!this.flowId)
                        try {
                            this.flowId = Microsoft.Entertainment.Marketplace.Marketplace.generateGuid()
                        }
                        catch(e) {}
                    this.onMessage = function(event) {
                        this._onModernWebBlendMessage(event)
                    }.bind(this);
                    if (this.frameWidth) {
                        this._webIFrame.style.width = this.frameWidth;
                        this._webIFrame.style.marginLeft = "calc((100% - " + this.frameWidth + ") / 2)"
                    }
                    if (this.frameHeight) {
                        this._webIFrame.style.height = this.frameHeight;
                        this._webIFrame.style.marginTop = "calc((100% - " + this.frameHeight + ") / 2)"
                    }
                    window.addEventListener("message", this.onMessage, false);
                    this._onSignInChange = this._onSignInChange.bind(this);
                    this._signIn.bind("isSignedIn", this._onSignInChange);
                    this._initialized = true;
                    this._signInBound = true;
                    if (this.sourceUrl && this.sourceUrl !== "") {
                        var url = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/" + this.sourceUrl;
                        this._webIFrame.src = url;
                        this.currentUrl = url;
                        this._eventProvider.traceWebExperience_Start(this.title)
                    }
                    else if ((this.authenticatedSourceUrl && this.authenticatedSourceUrl !== "") || (this.taskId === "TOU") || this._loadAuthenticatedUrlOnInitialize)
                        this.loadAuthenticatedUrl()
                }, _onModernWebBlendMessage: function _onModernWebBlendMessage(e) {
                    if ((e.origin !== MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_ModernPurchase)) && (e.origin !== "ms-appx://" + Windows.ApplicationModel.Package.current.id.name.toLowerCase()))
                        return;
                    var messageStruct;
                    var messageRaw = e.data;
                    if (this.debugWebMessages)
                        this.debugWebMessages.unshift(messageRaw);
                    MS.Entertainment.UI.Controls.assert(messageRaw.match(/^{/i), "Message received in non-JSON format");
                    try {
                        messageStruct = JSON.parse(messageRaw)
                    }
                    catch(error_1) {
                        MS.Entertainment.UI.Controls.fail(messageRaw);
                        return
                    }
                    if (!messageStruct.message)
                        return;
                    messageStruct.message = messageStruct.message.trim();
                    messageStruct.verb = messageStruct.message;
                    if (!MS.Entertainment.UI.Controls.WebHostMessage.validateWebHostMessage(this.taskId, messageStruct))
                        return;
                    if (messageStruct.flowId !== this.flowId && messageStruct.message !== "NAVIGATION_ERROR")
                        return;
                    switch (messageStruct.verb) {
                        case"done":
                            if (messageStruct.status === "success") {
                                this._eventProvider.traceWebExperience_Finish(this.title);
                                if (this.webHostExperience && this.webHostExperience.finishedReceived)
                                    this.webHostExperience.finishedReceived();
                                if (this.finishedListener)
                                    this.finishedListener()
                            }
                            else if (messageStruct.status === "cancel") {
                                this._eventProvider.traceWebExperience_Cancel(this.title);
                                if (this.webHostExperience && this.webHostExperience.cancelReceived)
                                    this.webHostExperience.cancelReceived();
                                if (this.cancelListener)
                                    this.cancelListener()
                            }
                            else if (messageStruct.status === "error")
                                this.onErrorHandler(messageStruct.errorCode);
                            else if (messageStruct.status === "parent_actor_required") {
                                if (this.webHostExperience && this.webHostExperience.cancelReceived)
                                    this.webHostExperience.cancelReceived();
                                if (this.cancelListener)
                                    this.cancelListener()
                            }
                            break;
                        case"error":
                            if (this.timer) {
                                window.clearTimeout(this.timer);
                                this.timer = null;
                                if (this._webHostWaitCursor)
                                    this._webHostWaitCursor.isBusy = false
                            }
                            this.onErrorHandler(messageStruct.code);
                            break;
                        case"ready":
                            if (this._parentOverlay && this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.TOU)
                                this._parentOverlay.lightDismissEnabled = false;
                            if (this._webHostWaitCursor)
                                this._webHostWaitCursor.isBusy = false;
                            WinJS.UI.Animation.fadeIn(this._webIFrame);
                            if (this.timer) {
                                window.clearTimeout(this.timer);
                                this.timer = null
                            }
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioWebBlendRequestToLoad(this.currentUrl);
                            this._eventProvider.traceWebExperience_PageLoad(this.currentUrl);
                            if (this.webHostExperience && this.webHostExperience.pageLoadReceived)
                                this.webHostExperience.pageLoadReceived(this.currentUrl);
                            break;
                        case"authRequest":
                            var relyingParty = messageStruct.relyingParty;
                            var isValidUrl = MS.Entertainment.Utilities.verifyUrl(relyingParty);
                            MS.Entertainment.UI.Controls.assert(isValidUrl, "Relying party received is not a http url");
                            if (isValidUrl)
                                this._signIn.getXTokenByRelyingParty(relyingParty, this.signInOverride).done(function success(header) {
                                    if (this._webIFrame && this._webIFrame.contentWindow) {
                                        var json = JSON.stringify({
                                                message: "authResponse", relyingParty: relyingParty, auth: header.value, flowId: this.flowId
                                            });
                                        this._webIFrame.contentWindow.postMessage(json, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_ModernPurchase))
                                    }
                                }.bind(this), function err(){});
                            break;
                        case"NAVIGATION_ERROR":
                            if (this.timer) {
                                window.clearTimeout(this.timer);
                                this.timer = null;
                                if (this._webHostWaitCursor)
                                    this._webHostWaitCursor.isBusy = false
                            }
                            this.onErrorHandler(messageStruct.httpStatus, true);
                            break
                    }
                    if (this.webHostExperience && this.webHostExperience.messageReceived) {
                        var sendMessageFunction = function(message) {
                                if (this._webIFrame && this._webIFrame.contentWindow)
                                    this._webIFrame.contentWindow.postMessage(message, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_AuthTransfer))
                            };
                        this.webHostExperience.messageReceived(messageStruct, this, sendMessageFunction)
                    }
                }, _onSignInChange: function _onSignInChange(isSignedIn) {
                    if (this._signInBound && !isSignedIn && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT) && (this.taskId !== MS.Entertainment.UI.Controls.WebHost.TaskId.TOU)) {
                        if (this._webHostWaitCursor)
                            this._webHostWaitCursor.isBusy = false;
                        if (this.timer) {
                            window.clearTimeout(this.timer);
                            this.timer = null
                        }
                        if (this.cancelListener)
                            this.cancelListener()
                    }
                }, unload: function unload() {
                    window.removeEventListener("message", this.onMessage, false);
                    if (this._onSignInChange)
                        this._signIn.unbind("isSignedIn", this._onSignInChange);
                    this._signIn = null;
                    this._eventProvider = null;
                    if (this.webHostExperience) {
                        this.webHostExperience.dispose();
                        this.webHostExperience = null
                    }
                    this.cancelListener = null;
                    this.finishedListener = null;
                    this.errorListener = null;
                    this._webIFrame.removeEventListener("load", this.onIFrameLoadHandler);
                    this._webIFrame.removeEventListener("readystatechange", this.onReadyStateChangeHandler);
                    this._webIFrame.src = "";
                    this._webHostWaitCursor = null;
                    this.debugWebMessages = null;
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _appendWebBlendParams: function _appendWebBlendParams(url) {
                    var webBlendParams = "skin=x8&client=x8&hev=1.0&clientRelease=X8GA";
                    var clientVersionString = MS.Entertainment.Utilities.getClientVersionString();
                    if (clientVersionString)
                        webBlendParams = webBlendParams + "&clientVersion=" + clientVersionString;
                    var appId;
                    if (MS.Entertainment.Utilities.isMusicApp)
                        appId = "music";
                    else if (MS.Entertainment.Utilities.isVideoApp)
                        appId = "video";
                    else
                        appId = String.empty;
                    if (appId)
                        webBlendParams = webBlendParams + "&appId=" + appId;
                    if ((new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.applyBackgroundOnAccountCreation && (this.taskId === MS.Entertainment.UI.Controls.WebHost.TaskId.TOU || this.taskId === MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT))
                        WinJS.Utilities.addClass(this._webIFrame, "webHostDarkBackground");
                    if (this.isDialog)
                        webBlendParams = webBlendParams + "&dialog=true";
                    else
                        webBlendParams = webBlendParams + "&dialog=false";
                    if (url && url.indexOf("?") > -1)
                        url = url + "&" + webBlendParams;
                    else
                        url = url + "?" + webBlendParams;
                    return url
                }, _addPostDataParams: function _addPostDataParams(postDataParams, form) {
                    var postDataParam;
                    for (name in postDataParams) {
                        postDataParam = postDataParams[name];
                        if (postDataParam !== null && typeof postDataParam != 'undefined' && postDataParam.key !== null && typeof postDataParam.key != 'undefined') {
                            var value;
                            if (postDataParam.value !== null)
                                value = postDataParam.value;
                            else
                                value = String.empty;
                            this._addPostDataProperty(form, postDataParam.key, value)
                        }
                    }
                }
        }, {
            currentUrl: null, debugWebMessages: []
        }, {TaskId: {
                ACCOUNT: "ACCOUNT", CREATEACCOUNT: "CREATEACCOUNT", MUSIC: "MUSIC", SUBSCRIPTIONSIGNUP: "SUBSCRIPTIONSIGNUP", TOU: "TOU", VIDEO: "VIDEO"
            }})})
})()
