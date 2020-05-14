/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexBaseAuthInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Partners.Auth", {BaseAuth: WinJS.Class.define(function commonjs_baseauth_ctor() {
this._refreshTimer = null;
this._authToken = undefined;
this.isEntitled = false;
this.authToken;
this._entitlements = null;
this._onlineEntitlementsChecked = false;
this.getEntitlementsAsync().then(function _BaseAuth_33_1(){}, function _BaseAuth_33_2(){});
this.getEntitlementsAsync(false, true).then(function _BaseAuth_34_1(){}, function _BaseAuth_34_2(){});
CommonJS.Partners.Auth.BaseAuth.authenticators[this._partner] = this;
var that=this;
WinJS.Navigation.addEventListener("navigated", function _BaseAuth_38() {
that.closeExistingPromptControl()
})
}, {
_entitlements: null, _partner: null, _refreshTimer: null, _lastEntitlementsUpdateTime: null, _entitlementsCheckExpireTime: null, _onlineEntitlementsChecked: false, _serializedEntitlements: null, _serializeEntitlements: function _serializeEntitlements(){}, _deserializeEntitlements: function _deserializeEntitlements(){}, entitlementsCheckExpireTime: {
set: function set(value) {
if (this._entitlementsCheckExpireTime !== value) {
this._entitlementsCheckExpireTime = value
}
}, get: function get() {
return this._entitlementsCheckExpireTime
}
}, entitlements: {
set: function set(value) {
if (this._entitlements !== value) {
this._entitlements = value;
this._serializeEntitlements()
}
}, get: function get() {
if (!this._entitlements) {
this._entitlements = this._deserializeEntitlements()
}
return this._entitlements
}
}, getRefreshInterval: function getRefreshInterval() {
return 6 * 60 * 60 * 1000
}, _scheduleNextEntitlementsRefresh: function _scheduleNextEntitlementsRefresh(lastUpdateTime) {
var timestamp=lastUpdateTime ? lastUpdateTime.getTime() : 0;
if (this._lastEntitlementsUpdateTime === timestamp) {
return
}
this._lastEntitlementsUpdateTime = timestamp;
var refreshInterval=this.getRefreshInterval(),
nextRefresh=refreshInterval - (Date.now() - this._lastEntitlementsUpdateTime);
this.entitlementsCheckExpireTime = this._lastEntitlementsUpdateTime + refreshInterval;
if (nextRefresh <= 0) {
nextRefresh = refreshInterval
}
if (this._refreshTimer) {
clearTimeout(this._refreshTimer)
}
var that=this;
this._refreshTimer = setTimeout(function refresh_handler() {
that.getEntitlementsAsync(false, true).then(function _BaseAuth_119_1(){}, function _BaseAuth_119_2(){})
}, nextRefresh)
}, getEntitlementsAsync: function getEntitlementsAsync(showPrompt, bypassCache){}, showSignInPromptAsync: function showSignInPromptAsync(code) {
this.closeExistingPromptControl()
}, showSubscribePromptAsync: function showSubscribePromptAsync(code) {
this.closeExistingPromptControl()
}, closeExistingPromptControl: function closeExistingPromptControl() {
var promptControl=CommonJS.Partners.Auth.BaseAuthControl.promptControl;
if (promptControl && !promptControl.isShowing) {
promptControl.cancel()
}
}, getVaultValue: function getVaultValue(resource, userName) {
var passwordVault=new Windows.Security.Credentials.PasswordVault;
resource = this._partner + resource;
if (!userName) {
userName = resource
}
try {
var creds=passwordVault.retrieve(resource, resource);
if (creds) {
creds.retrievePassword();
return creds.password
}
}
catch(e) {}
return null
}, setVaultValue: function setVaultValue(resource, value, userName) {
var passwordVault=new Windows.Security.Credentials.PasswordVault;
resource = this._partner + resource;
if (!userName) {
userName = resource
}
try {
var creds=passwordVault.retrieve(resource, resource);
if (creds) {
passwordVault.remove(creds)
}
}
catch(e) {}
if (value) {
passwordVault.add(new Windows.Security.Credentials.PasswordCredential(resource, resource, value))
}
}, signIn: function signIn(code) {
var that=this;
return this.showSignInPromptAsync(code).then(function _BaseAuth_187() {
Windows.Storage.ApplicationData.current.signalDataChanged()
}, function _BaseAuth_189(){})
}, signOut: function signOut() {
this.authToken = null;
this.authTokenExpire = 0;
this.isEntitled = false;
Windows.Storage.ApplicationData.current.signalDataChanged();
return WinJS.Promise.wrap(null)
}, subscribe: function subscribe(code) {
var that=this;
this.showSubscribePromptAsync(code).then(function _BaseAuth_202() {
Windows.Storage.ApplicationData.current.signalDataChanged()
}, function _BaseAuth_204(){})
}, isSignedIn: {get: function get() {
return this.authToken !== null
}}, _authToken: null, authToken: {
get: function get() {
if (this._authToken === undefined) {
this._authToken = this.getVaultValue("AuthToken");
CommonJS.Partners.Debug.instance.log("AuthToken vault value: " + this._authToken);
if (this._authToken) {
WinJS.Utilities.removeClass(document.body, this._partner + "SignedOut");
WinJS.Utilities.addClass(document.body, this._partner + "SignedIn")
}
else {
WinJS.Utilities.addClass(document.body, this._partner + "SignedOut");
WinJS.Utilities.removeClass(document.body, this._partner + "SignedIn")
}
}
return this._authToken
}, set: function set(value) {
if (this._authToken !== value) {
this._authToken = value;
this.setVaultValue("AuthToken", value);
if (!value) {
this.isEntitled = false
}
if (this._authToken) {
WinJS.Utilities.removeClass(document.body, this._partner + "SignedOut");
WinJS.Utilities.addClass(document.body, this._partner + "SignedIn")
}
else {
WinJS.Utilities.addClass(document.body, this._partner + "SignedOut");
WinJS.Utilities.removeClass(document.body, this._partner + "SignedIn");
this.authTokenExpire = 0
}
}
}
}, _authTokenExpire: null, authTokenExpire: {
set: function set(value) {
CommonJS.Partners.Config.setConfig(this._partner, "AuthTokenExpireTime", value);
this._authTokenExpire = value
}, get: function get(value) {
if (!this._authTokenExpire) {
this._authTokenExpire = CommonJS.Partners.Config.getConfig(this._partner, "AuthTokenExpireTime", 0)
}
return this._authTokenExpire
}
}, _isEntitled: null, isEntitled: {
set: function set(value) {
if (this._isEntitled !== value) {
this._isEntitled = value;
if (this._isEntitled) {
WinJS.Utilities.removeClass(document.body, this._partner + "NoEntitled");
WinJS.Utilities.addClass(document.body, this._partner + "Entitled")
}
else {
WinJS.Utilities.addClass(document.body, this._partner + "NoEntitled");
WinJS.Utilities.removeClass(document.body, this._partner + "Entitled")
}
}
}, get: function get() {
return this._isEntitled
}
}
}, {
notLoggedInError: "NotLoggedIn", authenticators: {}
})})
})();
(function appexBaseAuthCtrlInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Partners.Auth", {BaseAuthControl: WinJS.Class.define(function commonjs_baseauthctrl_ctor(options) {
var that=this;
this.isShowing = false;
this.element = document.createElement("div");
CommonJS.setAutomationId(this.element);
this.element.winControl = this;
WinJS.Utilities.addClass(this.element, "authControl");
this.container = document.createElement("div");
WinJS.Utilities.addClass(this.container, "authContainer");
this.element.appendChild(this.container);
var accentBar=document.createElement("div");
WinJS.Utilities.addClass(accentBar, "accentBar authAccentBar");
this.container.appendChild(accentBar);
var closeButton=document.createElement("button");
closeButton.tabIndex = 31;
closeButton.textContent = PlatformJS.Services.resourceLoader.getString("/platform/Cancel");
CommonJS.setAutomationId(closeButton, this.element, "closeButton");
closeButton.addEventListener("click", function auth_closeBtn_click() {
that.cancel();
if (that.instrumentCancel) {
that.instrumentCancel()
}
});
WinJS.Utilities.addClass(closeButton, "authCloseButton");
this.container.appendChild(closeButton);
var logo=document.createElement("div");
WinJS.Utilities.addClass(logo, "authLogo");
this.container.appendChild(logo);
this._progressIndicator = document.createElement("progress");
WinJS.Utilities.addClass(this._progressIndicator, "authProgress platformHide");
this.container.appendChild(this._progressIndicator);
this.container.addEventListener("keydown", this._containerHandleKey.bind(this), false);
WinJS.UI.setOptions(this, options)
}, {
element: null, container: null, _onerror: null, _onsuccess: null, isShowing: false, _partner: null, _containerHandleKey: function _containerHandleKey(event) {
if (event.keyCode === WinJS.Utilities.Key.escape) {
this.cancel()
}
}, instrumentCancel: function instrumentCancel(){}, showProgress: function showProgress() {
WinJS.Utilities.removeClass(this._progressIndicator, "platformHide")
}, hideProgress: function hideProgress() {
WinJS.Utilities.addClass(this._progressIndicator, "platformHide")
}, disableUX: function disableUX(value) {
var signinButtons=document.querySelectorAll(".signInButton");
for (var i=0; i < signinButtons.length; i++) {
signinButtons[i].disabled = value
}
var bottomEdgy=document.querySelector(".articleReaderPage #bottomEdgy");
if (bottomEdgy) {
bottomEdgy.disabled = value
}
var platformPage=document.getElementById("platformPageArea");
platformPage.disabled = value;
if (value) {
WinJS.Utilities.addClass(document.body, "authOpen")
}
else {
WinJS.Utilities.removeClass(document.body, "authOpen")
}
}, showAsync: function showAsync(focusElement) {
var that=this;
this.isShowing = true;
this.disableUX(true);
document.body.appendChild(this.element);
focusElement = focusElement || this.element.querySelector(".userNameInput") || this.element.querySelector(".authCloseButton");
if (focusElement) {
focusElement.focus()
}
return new WinJS.Promise(function _BaseAuthControl_121(complete, error) {
that._onsuccess = complete;
that._onerror = error
}).then(function _BaseAuthControl_124(response) {
that.close();
return WinJS.Promise.wrap(response)
})
}, close: function close() {
if (this.isShowing) {
this.disableUX(false);
this.isShowing = false;
this._onerror = null;
this._onsuccess = null;
if (this.element && document.body.contains(this.element)) {
document.body.removeChild(this.element)
}
this.element = null;
CommonJS.Partners.Auth.BaseAuthControl.promptControl = null
}
}, cancel: function cancel() {
if (this._onerror) {
this._onerror(CommonJS.Partners.Auth.BaseAuth.notLoggedInError)
}
this.close()
}
}, {promptControl: null})})
})();
(function appexBaseAuthInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Partners.Auth", {BaseWebAuthControl: WinJS.Class.derive(CommonJS.Partners.Auth.BaseAuthControl, function commonjs_basewebauthctrl_ctor(options) {
this._url = null;
this._messageListener = null;
this.iframe = document.createElement("iframe");
this.iframe.tabIndex = 0;
this.iframe.name = this._partner.toLowerCase() + "_AuthFrame";
this.iframe.sandbox = "allow-scripts allow-forms";
WinJS.Utilities.addClass(this.iframe, "authIFrame authMainControl");
var that=this;
CommonJS.Partners.Auth.BaseAuthControl.call(this, options);
this.container.appendChild(this.iframe);
that.showProgress();
if (this.isDirty) {
this.url = options.initializeUrl ? options.initializeUrl : options.targetUrl
}
else {
this.isDirty = true;
this.url = options.targetUrl;
this.iframe.onload = function(event) {
that.hideProgress()
}
}
}, {
iframe: null, targetDomain: null, partner: null, _isDirty: null, isDirty: {
get: function get() {
if (this._isDirty === null) {
this._isDirty = CommonJS.Partners.Config.getConfig(this.partner, "IFrameDirty", false)
}
return this._isDirty
}, set: function set(value) {
this._isDirty = value;
CommonJS.Partners.Config.setConfig(this.partner, "IFrameDirty", value)
}
}, _url: null, height: {set: function set(value) {
if (value) {
this.iframe.style.height = value + "px"
}
}}, width: {set: function set(value) {
if (value) {
this.iframe.style.width = value + "px"
}
}}, url: {
set: function set(value) {
this._url = value;
if (this.isShowing) {
this.iframe.src = value
}
}, get: function get() {
return this._url
}
}, initializeUrl: null, targetUrl: null, instrumentCancel: function instrumentCancel(){}, onmessage: function onmessage(event) {
var that=this;
if (event.origin === this.targetDomain || event.origin === "ms-appx://" + Windows.ApplicationModel.Package.current.id.name.toLowerCase()) {
var cmd=event.data;
CommonJS.Partners.Debug.instance.log("Message from IFrame: ", cmd);
if (cmd) {
if (cmd.action === "success") {
this._onsuccess(cmd)
}
else if (cmd.action === "open") {
this.url = "about:blank";
this.width = cmd.data.width;
this.height = cmd.data.height;
msSetImmediate(function _BaseWebAuthControl_115() {
that.url = that.getUrl(cmd.data)
})
}
else if (cmd.action === "logout") {
this.isDirty = false;
if (this._isDisposed) {
this._finalizeCleanup()
}
else {
this.isDirty = true;
this.url = this.targetUrl;
this.iframe.onload = function(event) {
that.hideProgress()
}
}
}
else if (cmd.action === "showProgress") {
this.showProgress()
}
else if (cmd.action === "hideProgress") {
this.hideProgress()
}
}
}
}, getUrl: function getUrl(data) {
return data.url
}, showAsync: function showAsync() {
this.isShowing = true;
this.iframe.src = this.url;
var that=this;
this._messageListener = function(event) {
that.onmessage(event)
};
window.addEventListener("message", this._messageListener);
return CommonJS.Partners.Auth.BaseAuthControl.prototype.showAsync.call(this)
}, _finalizeCleanup: function _finalizeCleanup() {
this.isDirty = false;
if (this.iframe) {
this.iframe.src = "about:blank";
this.iframe.onload = null;
document.body.removeChild(this.iframe);
this.iframe = null
}
window.removeEventListener("message", this._messageListener);
this._messageListener = null
}, close: function close() {
CommonJS.Partners.Auth.BaseAuthControl.prototype.close.call(this);
if (this.iframe) {
this.iframe.src = "about:blank";
this.iframe.onload = null;
this.iframe = null
}
this.iframe = document.createElement("iframe");
WinJS.Utilities.addClass(this.iframe, "platformHidden");
document.body.appendChild(this.iframe);
this.iframe.src = this.initializeUrl;
this._isDisposed = true
}
})})
})();
(function appexBaseNativeAuthInit() {
"use strict";
WinJS.Namespace.define("CommonJS.Partners.Auth", {BaseNativeAuthControl: WinJS.Class.derive(CommonJS.Partners.Auth.BaseAuthControl, function commonjs_basenativeauthctrol_ctor(options) {
CommonJS.Partners.Auth.BaseAuthControl.call(this, options);
var form=document.createElement("div");
form.role = "form";
WinJS.Utilities.addClass(form, "authForm authMainControl");
this.container.appendChild(form);
var logo=document.createElement("div");
form.appendChild(logo);
WinJS.Utilities.addClass(logo, "authFormLogo");
var prompt=document.createElement("div");
prompt.innerText = this.getString("subscribePrompt");
form.appendChild(prompt);
WinJS.Utilities.addClass(prompt, "prompt");
var instructions=document.createElement("div");
instructions.innerText = this.getString("subscribeInstructions");
form.appendChild(instructions);
WinJS.Utilities.addClass(instructions, "instructions");
this._userNameInput = document.createElement("input");
this._userNameInput.tabIndex = 1;
this._userNameInput.type = "text";
this._userNameInput.placeholder = this.getString("userNameInput");
WinJS.Utilities.addClass(this._userNameInput, "userNameInput inputBoxContainer");
form.appendChild(this._userNameInput);
this._passwordInput = document.createElement("input");
this._passwordInput.tabIndex = 2;
this._passwordInput.type = "password";
this._passwordInput.placeholder = this.getString("passwordInput");
WinJS.Utilities.addClass(this._passwordInput, "passwordInput inputBoxContainer");
form.appendChild(this._passwordInput);
this._statusLabel = document.createElement("div");
WinJS.Utilities.addClass(this._statusLabel, "statusLabel platformHide");
form.appendChild(this._statusLabel);
if (!options.hidePrivacyPolicy) {
this._privacyPolicy = document.createElement("button");
this._privacyPolicy.tabIndex = 21;
this._privacyPolicy.innerText = this.getString("privacyPolicy");
WinJS.Utilities.addClass(this._privacyPolicy, "privacyPolicy");
form.appendChild(this._privacyPolicy);
this._privacyPolicy.onclick = this._onPrivacyPolicyClick.bind(this)
}
if (!options.hideTermsOfUse) {
this._tou = document.createElement("button");
this._tou.tabIndex = 22;
this._tou.innerText = this.getString("TermsOfUse");
WinJS.Utilities.addClass(this._tou, "tou");
form.appendChild(this._tou);
this._tou.onclick = this._onTOUClick.bind(this)
}
this._submitButton = document.createElement("button");
this._submitButton.tabIndex = 4;
WinJS.Utilities.addClass(this._submitButton, "submitButton");
this._submitButton.innerText = this.getString("submit");
form.appendChild(this._submitButton);
this._submitButton.onclick = this._onSubmitClick.bind(this);
this._passwordInput.addEventListener("keydown", this._handleKey.bind(this), false);
this._userNameInput.addEventListener("keydown", this._handleKey.bind(this), false);
if (!options.hideCreateAccount) {
this._createAccountButton = document.createElement("button");
this._createAccountButton.tabIndex = 6;
this._createAccountButton.innerText = this.getString("createAccountButton");
WinJS.Utilities.addClass(this._createAccountButton, "createAccountButton");
form.appendChild(this._createAccountButton);
this._createAccountButton.onclick = this._onCreateAccountClick.bind(this)
}
if (!options.hideForgotPassword) {
this._forgotPasswordButton = document.createElement("button");
this._forgotPasswordButton.tabIndex = 5;
this._forgotPasswordButton.innerText = this.getString("forgotPasswordButton");
WinJS.Utilities.addClass(this._forgotPasswordButton, "forgotPasswordButton");
form.appendChild(this._forgotPasswordButton);
this._forgotPasswordButton.onclick = this._onForgotPasswordClick.bind(this)
}
this.customContainer = document.createElement("div");
WinJS.Utilities.addClass(this.customContainer, "customContainer");
form.appendChild(this.customContainer)
}, {
getString: function getString(stringId) {
return PlatformJS.Services.resourceLoader.getString("/platform/" + stringId)
}, _handleKey: function _handleKey(event) {
var that=this;
if (event.keyCode === WinJS.Utilities.Key.enter) {
that._submitButton.focus()
}
}, _partner: null, _userNameInput: null, _userNameInputOverlay: null, _passwordInput: null, _passwordInputOverlay: null, _statusLabel: null, _partnerStringPrefix: null, customContainer: null, validateAsync: function validateAsync(userName, password) {
return WinJS.Promise.wrap({})
}, _onCreateAccountClick: function _onCreateAccountClick(e){}, _onForgotPasswordClick: function _onForgotPasswordClick(e){}, _onPrivacyPolicyClick: function _onPrivacyPolicyClick(e){}, _onTOUClick: function _onTOUClick(e){}, _onSubmitClick: function _onSubmitClick(e) {
var userName=this._userNameInput.value;
var password=this._passwordInput.value;
var that=this;
this._submitButton.disabled = true;
WinJS.Utilities.addClass(that._statusLabel, "platformHide");
this.showProgress();
that.validateAsync(userName, password).then(function _BaseNativeAuthControl_166(response) {
that.hideProgress();
that._onsuccess(response)
}, function _BaseNativeAuthControl_171(error) {
that._submitButton.disabled = false;
that.hideProgress();
WinJS.Utilities.removeClass(that._statusLabel, "platformHide");
if (typeof error === "string") {
that._statusLabel.innerText = error
}
else {
that._statusLabel.innerText = that.getString("validateError")
}
})
}
})})
})();
(function _DynamicPanoAuth_1() {
"use strict";
WinJS.Namespace.define("DynamicPanoJS", {
AuthControl: WinJS.Class.derive(CommonJS.Partners.Auth.BaseNativeAuthControl, function dynamic_pano_auth_ctrl_ctor(options) {
this._partner = options.authProvider._partner;
this._authProvider = options.authProvider;
this._instrumentationId = options.instrumentationId || "";
options.hidePrivacyPolicy = !options.authProvider.authInfo.privacyurl;
options.hideTermsOfUse = !options.authProvider.authInfo.termsofuseurl;
options.hideCreateAccount = !options.authProvider.authInfo.registrationurl;
options.hideForgotPassword = !options.authProvider.authInfo.forgotpasswordurl;
CommonJS.Partners.Auth.BaseNativeAuthControl.call(this, options);
WinJS.Utilities.addClass(this.element, "dynamicAuthControl");
if (options.authProvider.authInfo.subscriptiondescription) {
var subscribeInstructions=document.createElement("div");
subscribeInstructions.innerText = PlatformJS.Services.resourceLoader.getString("/platform/subscribeNow");
this.customContainer.appendChild(subscribeInstructions);
WinJS.Utilities.addClass(subscribeInstructions, "subscribeInstructions");
var subscribeInfo=document.createElement("div");
subscribeInfo.innerHTML = options.authProvider.authInfo.subscriptiondescription;
this.customContainer.appendChild(subscribeInfo);
WinJS.Utilities.addClass(subscribeInfo, "subscribeInfo")
}
this._subscribeButton = document.createElement("button");
this._subscribeButton.tabIndex = 11;
this._subscribeButton.innerText = PlatformJS.Services.resourceLoader.getString("/Platform/subscribeButton");
WinJS.Utilities.addClass(this._subscribeButton, "subscribeButton");
this.customContainer.appendChild(this._subscribeButton);
this._subscribeButton.onclick = this._onSubscribeClick.bind(this);
var logo=this.element.querySelector(".authFormLogo");
logo.style.backgroundImage = "url(" + this._authProvider.authInfo.logo + ")";
var dynamicPanoAccentColor=null;
var dynamicPanoAccent=document.querySelector(".dynamicPanoAccent");
if (dynamicPanoAccent) {
dynamicPanoAccentColor = window.getComputedStyle(dynamicPanoAccent).backgroundColor
}
if (!dynamicPanoAccentColor) {
dynamicPanoAccentColor = this._authProvider.authInfo.accentColor
}
if (dynamicPanoAccentColor) {
var authAccentBarList=this.container.getElementsByClassName("authAccentBar");
for (var i=0; i < authAccentBarList.length; i++) {
authAccentBarList[i].style.backgroundColor = dynamicPanoAccentColor
}
var promptControlList=this.container.getElementsByClassName("prompt");
for (var j=0; j < promptControlList.length; j++) {
promptControlList[j].style.backgroundColor = dynamicPanoAccentColor
}
}
}, {
_authProvider: null, instrumentCancel: function instrumentCancel() {
DynamicPanoJS.Auth.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "Cancel", null, this._instrumentationId)
}, _onCreateAccountClick: function _onCreateAccountClick(e) {
DynamicPanoJS.Auth.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "CreateAccount", null, this._instrumentationId, e);
var url=this._authProvider.authInfo.registrationurl;
window.open(url)
}, _onForgotPasswordClick: function _onForgotPasswordClick(e) {
DynamicPanoJS.Auth.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "ForgotPassword", null, this._instrumentationId, e);
var url=this._authProvider.authInfo.forgotpasswordurl;
window.open(url)
}, _onPrivacyPolicyClick: function _onPrivacyPolicyClick(e) {
DynamicPanoJS.Auth.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "PrivacyPolicy", null, this._instrumentationId, e);
var url=this._authProvider.authInfo.privacyurl;
window.open(url)
}, _onTOUClick: function _onTOUClick(e) {
DynamicPanoJS.Auth.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "TermsOfUse", null, this._instrumentationId, e);
var url=this._authProvider.authInfo.termsofuseurl;
window.open(url)
}, validateAsync: function validateAsync(userName, password) {
var that=this;
if (!userName || !password) {
return WinJS.Promise.wrapError(PlatformJS.Services.resourceLoader.getString("/Platform/credentialsInvalid"))
}
return this._authProvider.loginAsync(userName, password).then(function _DynamicPanoAuth_97(result) {
DynamicPanoJS.Auth.logPaywallAppAction("appsignin", null, that._instrumentationId);
return WinJS.Promise.as(result)
}, function _DynamicPanoAuth_100(error) {
DynamicPanoJS.Auth.logPaywallAppAction("appsigninerror", {error: error}, that._instrumentationId);
throw error;
})
}, _onSubscribeClick: function _onSubscribeClick(e) {
DynamicPanoJS.Auth.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "Subscribe", null, this._instrumentationId, e);
var url=this._authProvider.authInfo.subscriptionurl;
window.open(url)
}
}), Auth: WinJS.Class.mix(WinJS.Class.derive(CommonJS.Partners.Auth.BaseAuth, function dynamic_pano_auth_ctor(partnerId, authInfo, instrumentationId) {
Object.defineProperties(this, WinJS.Utilities.createEventProperties("authchanged"));
this._partner = partnerId;
this._lastGatewayShowing = null;
this._entitlements = null;
this._instrumentationId = instrumentationId;
this.authInfo = authInfo;
this.authUrlAppId = authInfo.authUrl;
if (!this.authStatus.expirationTime) {
this.authStatus.expirationTime = Date.now() + this.authInfo.meteringtimems
}
if (!this.authStatus.articlesRead) {
this.authStatus.articlesRead = {}
}
var dynamicPanoAccent=document.querySelector(".dynamicPanoAccent");
if (dynamicPanoAccent) {
this.authInfo.accentColor = window.getComputedStyle(dynamicPanoAccent).backgroundColor
}
CommonJS.Partners.Auth.BaseAuth.call(this)
}, {
_instrumentationId: null, authInfo: null, _authStatus: null, authStatus: {get: function get() {
if (!this._authStatus) {
try {
var stringToParse=Windows.Storage.ApplicationData.current.localSettings.values[this._partner + "_AuthStatus"];
this._authStatus = JSON.parse(stringToParse)
}
catch(e) {
this._authStatus = {}
}
}
return this._authStatus
}}, _isEntitled: false, isEntitled: {
get: function get() {
return this._isEntitled
}, set: function set(value) {
var previousValue=this._isEntitled;
this._isEntitled = value;
if (value !== previousValue) {
this.dispatchEvent("authchanged")
}
}
}, _persistAuthStatus: function _persistAuthStatus() {
var stringToSave=JSON.stringify(this.authStatus);
Windows.Storage.ApplicationData.current.localSettings.values[this._partner + "_AuthStatus"] = stringToSave
}, _serializeEntitlements: function _serializeEntitlements() {
if (this._entitlements) {
var serializer=new XMLSerializer;
var serialized=serializer.serializeToString(this._entitlements);
if (this._serializedEntitlements !== serialized) {
CommonJS.Partners.Config.setConfig(this._partner, "Entitlements", serialized)
}
}
else {
CommonJS.Partners.Config.setConfig(this._partner, "Entitlements", null);
this._serializedEntitlements = null
}
}, _deserializeEntitlements: function _deserializeEntitlements() {
var serialized=CommonJS.Partners.Config.getConfig(this._partner, "Entitlements", "");
this._serializedEntitlements = serialized;
if (serialized) {
return this._parseEntitlements(serialized)
}
else {
return null
}
}, getRefreshInterval: function getRefreshInterval() {
return this.authInfo.authrefreshintervalms
}, loginAsync: function loginAsync(userName, password) {
var url=this.authInfo.authurl;
var that=this;
url = url.format(encodeURIComponent(userName), encodeURIComponent(password));
return WinJS.xhr({
url: url, headers: {"If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"}, type: "GET"
}).then(function _DynamicPanoAuth_209(response) {
if (response.status === 200) {
var xml=response.responseXML;
if (xml) {
var status=xml.querySelector("response");
var message=xml.querySelector("message");
var uuid=xml.querySelector("userid");
var errorMessage=null;
if (status && status.textContent !== "success") {
errorMessage = PlatformJS.Services.resourceLoader.getString("/Platform/credentialsInvalid")
}
else if (!uuid) {
errorMessage = PlatformJS.Services.resourceLoader.getString("/Platform/validateError")
}
else if (!that._containsActiveProduct(xml)) {
errorMessage = PlatformJS.Services.resourceLoader.getString("/Platform/entitlementsInvalid")
}
if (errorMessage !== null) {
if (message) {
return WinJS.Promise.wrapError(message.textContent)
}
else {
return WinJS.Promise.wrapError(errorMessage)
}
}
}
return WinJS.Promise.wrap(xml)
}
else {
return WinJS.Promise.wrapError(PlatformJS.Services.resourceLoader.getString("/Platform/credentialsInvalid"))
}
})
}, signOut: function signOut(source) {
var attributes={source: source ? source : "Unknown"};
DynamicPanoJS.Auth.logPaywallAppAction("appsignout", attributes, this._instrumentationId);
return CommonJS.Partners.Auth.BaseAuth.prototype.signOut.call(this)
}, showSignInPromptAsync: function showSignInPromptAsync(code) {
CommonJS.Partners.Auth.BaseAuth.prototype.showSignInPromptAsync.call(this);
var that=this;
CommonJS.Partners.Auth.BaseAuthControl.promptControl = this.promptControl = new DynamicPanoJS.AuthControl({
authProvider: this, instrumentationId: this._instrumentationId
});
DynamicPanoJS.Auth.logPaywallAppAction(Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, null, this._instrumentationId);
return this.promptControl.showAsync(this.promptControl.container).then(function _DynamicPanoAuth_263(xml) {
DynamicPanoJS.Auth.logPaywallAppAction(Microsoft.Bing.AppEx.Telemetry.AppActionOperation.close, null, that._instrumentationId);
if (xml) {
var uuid=xml.querySelector("userid");
if (uuid) {
that.authToken = uuid.textContent;
that.entitlements = xml;
that._scheduleNextEntitlementsRefresh(new Date);
return WinJS.Promise.wrap(that._checkEntitlement(xml))
}
}
return WinJS.Promise.wrapError("AuthError")
}, function _DynamicPanoAuth_276(error) {
DynamicPanoJS.Auth.logPaywallAppAction(Microsoft.Bing.AppEx.Telemetry.AppActionOperation.close, {error: error}, that._instrumentationId);
return WinJS.Promise.wrapError("AuthError")
})
}, dismissSignInPrompt: function dismissSignInPrompt() {
if (this.promptControl) {
this.promptControl.cancel();
this.promptControl = null
}
}, showSubscribePromptAsync: function showSubscribePromptAsync() {
var url=this.authInfo.subscriptionUrl;
window.open(url);
return WinJS.Promise.wrap(true)
}, showToast: function showToast() {
var that=this,
message=PlatformJS.Services.resourceLoader.getString("/Platform/InvalidSubscriptionMessage"),
buttonLabel=PlatformJS.Services.resourceLoader.getString("/Platform/subscribeButton"),
messageBar=new CommonJS.MessageBar(message);
messageBar.addButton(buttonLabel, function _DynamicPanoAuth_304() {
messageBar.hide();
that.showSubscribePromptAsync().then(function _DynamicPanoAuth_306(){}, function(){})
});
messageBar.addButton(PlatformJS.Services.resourceLoader.getString("/Platform/Dismiss"), function _DynamicPanoAuth_308() {
messageBar.hide()
});
messageBar.show()
}, _checkEntitlement: function _checkEntitlement(xml) {
this.isEntitled = this._containsActiveProduct(xml) ? true : false;
return this.isEntitled
}, _containsActiveProduct: function _containsActiveProduct(xml) {
if (xml) {
var products=xml.querySelectorAll("product");
if (products.length) {
for (var i=0; i < products.length; i++) {
if (products[i].textContent === "Win8") {
return true
}
}
}
}
return false
}, _parseEntitlements: function _parseEntitlements(dataString) {
var parser=new DOMParser;
return parser.parseFromString(dataString, "text/xml")
}, _getEntitlementsAsync: function _getEntitlementsAsync(authToken, bypassCache) {
var that=this;
var url=this.authInfo.authrefreshurl;
url = url.format(encodeURIComponent(authToken));
var promise=WinJS.xhr({
url: url, headers: {"If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"}, type: "GET"
}).then(function _DynamicPanoAuth_351(response) {
that.entitlements = null;
if (response.status === 200) {
var xml=response.responseXML;
if (xml) {
var status=xml.querySelector("response");
if (status && status.textContent !== "success") {
var error=xml.querySelector("message");
if (error) {
return WinJS.Promise.wrapError(error.textContent)
}
else {
return WinJS.Promise.wrapError(PlatformJS.Services.resourceLoader.getString("/Platform/credentialsInvalid"))
}
}
var uuid=xml.querySelector("userid");
if (uuid && uuid.textContent !== that.authToken) {
that.authToken = uuid.textContent
}
}
that.entitlements = xml;
that._onlineEntitlementsChecked = true;
that._scheduleNextEntitlementsRefresh(new Date);
return WinJS.Promise.wrap(xml)
}
});
return promise.then(function _DynamicPanoAuth_380() {
return WinJS.Promise.wrap(that._checkEntitlement(that.entitlements))
}, function _DynamicPanoAuth_382() {
try {
that._scheduleNextEntitlementsRefresh(new Date)
}
catch(error) {}
return WinJS.Promise.wrap(that._checkEntitlement(that.entitlements))
})
}, getAuthTokenAsync: function getAuthTokenAsync() {
return WinJS.Promise.wrap(this.authToken)
}, getEntitlementsAsync: function getEntitlementsAsync(showPrompt, bypassCache, isBlockingPrompt, localQueryOnly) {
var that=this;
var isOnline=!localQueryOnly && PlatformJS.Utilities.hasInternetConnection();
return this.getAuthTokenAsync().then(function _DynamicPanoAuth_401(authToken) {
if (authToken) {
var promise=null;
if (that.entitlements && ((Date.now() < that.entitlementsCheckExpireTime || !that._onlineEntitlementsChecked) && !bypassCache || !isOnline)) {
promise = WinJS.Promise.wrap(that._checkEntitlement(that.entitlements))
}
if (!promise) {
if (isOnline) {
promise = that._getEntitlementsAsync(authToken, bypassCache)
}
else {
promise = WinJS.Promise.wrap(false)
}
}
return promise.then(function _DynamicPanoAuth_419(isEntitled) {
if (!isEntitled) {
return that.handleEntitlementsErrorAsync(showPrompt, isBlockingPrompt)
}
else {
return WinJS.Promise.wrap(isEntitled)
}
})
}
else {
return that.handleEntitlementsErrorAsync(showPrompt, isBlockingPrompt)
}
}, function _DynamicPanoAuth_429() {
return that.handleEntitlementsErrorAsync(showPrompt, isBlockingPrompt)
})
}, handleEntitlementsErrorAsync: function handleEntitlementsErrorAsync(showPrompt, isBlockingPrompt) {
var that=this;
if (that.isSignedIn) {
that.signOut("EntitlementsError")
}
if (showPrompt) {
if (this.isSignedIn && !isBlockingPrompt) {
this.showToast();
return WinJS.Promise.wrap(false)
}
else {
return this.showSignInPromptAsync(PlatformJS.Services.resourceLoader.getString("/Platform/loginPromptContentLocked")).then(function _DynamicPanoAuth_446(isEntitled) {
if (!isEntitled && showPrompt) {
that.showToast()
}
return WinJS.Promise.wrap(isEntitled)
}, function _DynamicPanoAuth_452(error) {
return WinJS.Promise.wrap(false)
})
}
}
else {
return WinJS.Promise.wrap(false)
}
}, isReadingAllowed: function isReadingAllowed(articleId, clusterIndex, itemIndex, paywallSetting) {
try {
switch (this.authInfo.meteringtype) {
case"TimeBased":
return this._isReadingAllowedTimeOnly(articleId);
case"CountPerTime":
return this._isReadingAllowedQuantityPerTime(articleId);
case"CountBased":
return this._isReadingAllowedQuantityOnly(articleId);
case"FlagBased":
return this._isReadingAllowedFlagBased(paywallSetting);
default:
return false
}
}
catch(error) {
return true
}
}, _isReadingAllowedTimeOnly: function _isReadingAllowedTimeOnly(articleId) {
var expirationTime=this.authStatus.expirationTime || 0;
if (!expirationTime) {
return true
}
if (Date.now() < expirationTime) {
return true
}
return false
}, _isReadingAllowedQuantityPerTime: function _isReadingAllowedQuantityPerTime(articleId) {
var expirationTime=this.authStatus.expirationTime || 0;
if (!expirationTime) {
return true
}
if (Date.now() > expirationTime) {
return true
}
if (this._isArticleReadBefore(articleId)) {
return true
}
var countOfRead=this.authStatus.countOfRead || 0;
if (countOfRead < this.authInfo.meteringquantity) {
return true
}
return false
}, _isReadingAllowedQuantityOnly: function _isReadingAllowedQuantityOnly(articleId) {
if (this._isArticleReadBefore(articleId)) {
return true
}
var countOfRead=this.authStatus.countOfRead || 0;
if (countOfRead < this.authInfo.meteringquantity) {
return true
}
return false
}, _isReadingAllowedFlagBased: function _isReadingAllowedFlagBased(paywall) {
if (paywall === true || (typeof paywall === "string" && paywall.toLowerCase() === "free") || paywall === undefined) {
return true
}
return false
}, _isArticleReadBefore: function _isArticleReadBefore(articleId) {
if (!this.authStatus.articlesRead) {
return false
}
return this.authStatus.articlesRead[articleId]
}, markAsRead: function markAsRead(articleId) {
try {
if (!this.isReadingAllowed(articleId) || this._isArticleReadBefore(articleId)) {
return
}
this.authStatus.articlesRead[articleId] = true;
switch (this.authInfo.meteringtype) {
case"TimeBased":
return this._markAsReadTimeOnly();
case"CountPerTime":
return this._markAsReadQuantityPerTime(articleId);
case"CountBased":
return this._markAsReadQuantityOnly();
default:
return true
}
}
catch(error) {
return true
}
}, _markAsReadTimeOnly: function _markAsReadTimeOnly() {
var expirationTime=this.authStatus.expirationTime || 0;
var now=Date.now();
if (now > expirationTime) {
var expirationIntervalMs=this.authInfo.meteringtimems;
this.authStatus.expirationTime = now + expirationIntervalMs
}
this._persistAuthStatus();
return true
}, _markAsReadQuantityPerTime: function _markAsReadQuantityPerTime(articleId) {
var expirationTime=this.authStatus.expirationTime || 0;
var now=Date.now();
if (now > expirationTime) {
var expirationIntervalMs=this.authInfo.meteringtimems;
this.authStatus.expirationTime = now + expirationIntervalMs;
this.authStatus.articlesRead = {};
this.authStatus.countOfRead = 0
}
this.authStatus.articlesRead[articleId] = true;
var countOfRead=this.authStatus.countOfRead || 0;
this.authStatus.countOfRead = countOfRead + 1;
this._persistAuthStatus();
return true
}, _markAsReadQuantityOnly: function _markAsReadQuantityOnly() {
var countOfRead=this.authStatus.countOfRead || 0;
this.authStatus.countOfRead = countOfRead + 1;
this._persistAuthStatus();
return true
}
}, {
logPaywallAppAction: function logPaywallAppAction(operation, attributes, instrumentationId) {
if (!attributes) {
attributes = {}
}
attributes.partnerCode = instrumentationId;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction(operation, attributes)
}, logPaywallUserAction: function logPaywallUserAction(operation, element, attributes, instrumentationId) {
if (!attributes) {
attributes = {}
}
attributes.partnerCode = instrumentationId;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction(operation, element, attributes)
}, validateAuthInfo: function validateAuthInfo(authInfo) {
var requiredFields=['meteringtype', 'paywalltype'];
var requiredNumberFields=['authrefreshintervalms', 'meteringquantity', 'meteringtimems'];
var requiredUrlFields=['authrefreshurl', 'authurl', 'logo', 'subscriptionurl'];
if (authInfo.paywalltype !== "RESTAuthentication") {
return false
}
for (var i=0; i < requiredFields.length; i++) {
if (authInfo[requiredFields[i]] === undefined) {
return false
}
}
for (var j=0; j < requiredNumberFields.length; j++) {
if (isNaN(parseInt(authInfo[requiredNumberFields[j]]))) {
return false
}
}
for (var k=0; k < requiredUrlFields.length; k++) {
if (authInfo[requiredUrlFields[k]] === undefined) {
return false
}
try {
var uri=new Windows.Foundation.Uri(authInfo[requiredUrlFields[k]])
}
catch(e) {
return false
}
}
return true
}
}), WinJS.Utilities.eventMixin), PaywallManager: WinJS.Class.define(function paywallManager_ctor(){}, {
_authProviders: {}, getAuthProvider: function getAuthProvider(partnerId, authInfo, instrumentationId) {
var key=partnerId + "-" + instrumentationId;
if (!this._authProviders[key]) {
if (DynamicPanoJS.Auth.validateAuthInfo(authInfo)) {
this._authProviders[key] = new DynamicPanoJS.Auth(partnerId, authInfo, instrumentationId)
}
else {
throw"AuthInfo invalid or not supported.";
}
}
return this._authProviders[key]
}
}, {
_instance: null, instance: {get: function get() {
if (!DynamicPanoJS.PaywallManager._instance) {
DynamicPanoJS.PaywallManager._instance = new DynamicPanoJS.PaywallManager
}
return DynamicPanoJS.PaywallManager._instance
}}
})
})
})();
(function _PaywallControlBase_7() {
"use strict";
WinJS.Namespace.define("CommonJS.Partners.Auth", {
defaultSettings: {accentColor: null}, PaywallControlBase: WinJS.Class.define(function paywallcontrolbase_ctor(element, options) {
this._platformPageArea = document.getElementById("platformPageArea");
var elem=this._element = element || document.createElement("div");
elem.winControl = this;
CommonJS.Utils.markDisposable(elem);
this._eventManager = CommonJS.Utils.getEventListenerManager(this, "Paywall listeners");
this._paywallProvider = options.paywallProvider;
this._instrumentationId = options.instrumentationId || "";
this._isShowing = false;
this._createPaywallUIElements(options)
}, {
_eventManager: null, _element: null, _container: null, _isShowing: false, _platformPageArea: null, _closeButton: null, _paywallProvider: null, _instrumentationId: null, _onerror: null, _onsuccess: null, loginAsync: function loginAsync() {
this.dispose();
return WinJS.Promise.wrapError("NotImplemented")
}, subscribeAsync: function subscribeAsync() {
this.dispose();
return WinJS.Promise.wrapError("NotImplemented")
}, logoutAsync: function logoutAsync() {
this.dispose();
return WinJS.Promise.wrapError("NotImplemented")
}, dispose: function dispose() {
if (this._isShowing) {
this._disableUX(false);
this._isShowing = false;
this._onerror = null;
this._onsuccess = null;
if (this._element && this._platformPageArea.contains(this._element)) {
this._platformPageArea.removeChild(this._element)
}
this._element = null
}
this._eventManager.dispose()
}, _cancel: function _cancel() {
if (this._onerror) {
this._onerror("NotLoggedIn")
}
this.dispose()
}, _createPaywallUIElements: function _createPaywallUIElements(options) {
var that=this;
var element=this._element;
CommonJS.setAutomationId(element);
element.winControl = this;
WinJS.Utilities.addClass(element, "authControl");
this._eventManager.add(element, "keydown", this._onKeyDown.bind(this), "Paywall keydown");
this._eventManager.add(element, "focusout", this._onFocusOut.bind(this), "Paywall focusout");
var container=this._container = document.createElement("div");
WinJS.Utilities.addClass(container, "authContainer");
element.appendChild(container);
var accentBar=document.createElement("div");
WinJS.Utilities.addClass(accentBar, "accentBar authAccentBar");
container.appendChild(accentBar);
var closeButton=this._closeButton = document.createElement("button");
closeButton.tabIndex = 31;
closeButton.textContent = PlatformJS.Services.resourceLoader.getString("/platform/Cancel");
CommonJS.setAutomationId(closeButton, element, "closeButton");
WinJS.Utilities.addClass(closeButton, "authCloseButton");
container.appendChild(closeButton);
this._eventManager.add(closeButton, "click", this._onCancelButtonClick.bind(this), "Paywall cancel click");
var logo=document.createElement("div");
WinJS.Utilities.addClass(logo, "authLogo");
container.appendChild(logo);
var progressIndicator=this._progressIndicator = document.createElement("progress");
WinJS.Utilities.addClass(progressIndicator, "authProgress platformHide");
container.appendChild(progressIndicator)
}, _onFocusOut: function _onFocusOut(event) {
if (event.relatedTarget && WinJS.Utilities.hasClass(event.relatedTarget, "articleContainer") && event.srcElement) {
event.srcElement.focus()
}
}, _onKeyDown: function _onKeyDown(event) {
if (event.keyCode === WinJS.Utilities.Key.escape) {
this._cancel()
}
else if (event.keyCode === WinJS.Utilities.Key.tab) {
if (event.target === this._closeButton && !event.shiftKey) {
event.preventDefault();
this._element.focus()
}
else if ((event.target.tabIndex === 0 || event.target.tabIndex === 1) && event.shiftKey) {
event.preventDefault();
this._closeButton.focus()
}
}
event.cancelBubble = true;
event.stopPropagation()
}, _onCancelButtonClick: function _onCancelButtonClick() {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(this._paywallProvider, this._instrumentationId);
attributes.partnerCode = this._instrumentationId;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "Cancel", attributes);
this._cancel()
}, _showProgress: function _showProgress() {
WinJS.Utilities.removeClass(this._progressIndicator, "platformHide")
}, _hideProgress: function _hideProgress() {
WinJS.Utilities.addClass(this._progressIndicator, "platformHide")
}, _disableUX: function _disableUX(value) {
this._disableBottomEdgy(value)
}, _disableBottomEdgy: function _disableBottomEdgy(value) {
var appbarDoms=WinJS.Utilities.query(".win-appbar");
for (var i=0; i < appbarDoms.length; i++) {
var appbarControl=appbarDoms[i].winControl;
if (appbarControl && appbarControl.placement === "bottom") {
appbarControl.disabled = value
}
}
}, _showAsync: function _showAsync(focusElement, instrumentationDialogType) {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(this._paywallProvider, this._instrumentationId);
attributes.partnerCode = this._instrumentationId;
attributes.dialogType = instrumentationDialogType || "Login";
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction(Microsoft.Bing.AppEx.Telemetry.AppActionOperation.open, attributes);
var that=this;
this._isShowing = true;
this._disableUX(true);
this._platformPageArea.appendChild(this._element);
if (focusElement) {
focusElement.focus()
}
else {
this._element.focus()
}
return new WinJS.Promise(function _PaywallControlBase_209(complete, error) {
that._onsuccess = complete;
that._onerror = error
}).then(function _PaywallControlBase_213(response) {
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction(Microsoft.Bing.AppEx.Telemetry.AppActionOperation.close, attributes);
that.dispose();
return WinJS.Promise.wrap(response)
}, function _PaywallControlBase_218(error) {
attributes.error = error;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction(Microsoft.Bing.AppEx.Telemetry.AppActionOperation.close, attributes);
that.dispose();
return WinJS.Promise.wrapError(error)
})
}, _getErrorMessageFromResponse: function _getErrorMessageFromResponse(response) {
var message;
if (response.message !== "") {
message = response.message
}
else {
message = this._getString(response.errorMessageResourceKey)
}
return message
}, _getString: function _getString(stringId) {
return PlatformJS.Services.resourceLoader.getString("/platform/" + stringId)
}
}, {
logPaywallAppAction: function logPaywallAppAction(operation, attributes) {
if (!attributes) {
attributes = {}
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.paywall, null, operation, 0, JSON.stringify(attributes))
}, logPaywallUserAction: function logPaywallUserAction(operation, element, attributes) {
if (!attributes) {
attributes = {}
}
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.ActionContext.paywall, element, operation, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(attributes))
}
})
})
})();
(function _PaywallControlFactory_6() {
"use strict";
WinJS.Namespace.define("CommonJS.Partners.Auth.PaywallControlFactory", {createPaywallControl: function createPaywallControl(paywallProvider, instrumentationId) {
var paywallControl=null;
var options={
paywallProvider: paywallProvider, instrumentationId: instrumentationId
};
try {
if (paywallProvider && paywallProvider.paywallType) {
switch (paywallProvider.paywallType) {
case"RESTAuthentication":
paywallControl = new CommonJS.Partners.Auth.RestPaywallControl(null, options);
break;
case"OAuth":
paywallControl = new CommonJS.Partners.Auth.OAuthPaywallControl(null, options);
break;
default:
throw"Invalid or unknown paywall type specified: " + paywallProvider.paywallType;
}
;
}
else {
throw"Invalid paywall provider specified. Cannot instantiate a paywall control.";
}
}
catch(error) {
debugger;
paywallControl = new CommonJS.Partners.Auth.PaywallControlBase(null, options)
}
return paywallControl
}})
})();
(function _RestPaywallControl_6() {
"use strict";
WinJS.Namespace.define("CommonJS.Partners.Auth", {RestPaywallControl: WinJS.Class.derive(CommonJS.Partners.Auth.PaywallControlBase, function restpaywallcontrol_ctor(element, options) {
CommonJS.Partners.Auth.PaywallControlBase.call(this, element, options)
}, {
_userNameInput: null, _passwordInput: null, _statusLabel: null, _customContainer: null, loginAsync: function loginAsync() {
return this._showAsync()
}, subscribeAsync: function subscribeAsync() {
var url=this._paywallProvider.paywallSettings.subscriptionurl;
if (url) {
this._launchBrowser(url)
}
this.dispose();
return WinJS.Promise.wrap(false)
}, logoutAsync: function logoutAsync() {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(this._paywallProvider, this._instrumentationId);
attributes.partnerCode = this._instrumentationId;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction("appsignout", attributes);
this.dispose();
return this._paywallProvider.logoutAsync()
}, _createPaywallUIElements: function _createPaywallUIElements(options) {
CommonJS.Partners.Auth.PaywallControlBase.prototype._createPaywallUIElements.call(this, options);
var paywallSettings=options.paywallProvider.paywallSettings;
var form=document.createElement("div");
form.role = "form";
WinJS.Utilities.addClass(form, "authForm authMainControl");
this._container.appendChild(form);
var logo=document.createElement("div");
form.appendChild(logo);
WinJS.Utilities.addClass(logo, "authFormLogo");
var prompt=document.createElement("div");
prompt.innerText = this._getString("subscribePrompt");
form.appendChild(prompt);
WinJS.Utilities.addClass(prompt, "prompt");
var instructions=document.createElement("div");
instructions.innerText = this._getString("subscribeInstructions");
form.appendChild(instructions);
WinJS.Utilities.addClass(instructions, "instructions");
var userNameInput=this._userNameInput = document.createElement("input");
userNameInput.tabIndex = 1;
userNameInput.type = "text";
userNameInput.placeholder = this._getString("userNameInput");
this._eventManager.add(userNameInput, "keydown", this._handleKey.bind(this), "Paywall username keydown");
this._eventManager.add(userNameInput, "click", this._inputClick.bind(this), "Paywall username click");
WinJS.Utilities.addClass(this._userNameInput, "userNameInput inputBoxContainer");
form.appendChild(this._userNameInput);
var passwordInput=this._passwordInput = document.createElement("input");
passwordInput.tabIndex = 2;
passwordInput.type = "password";
passwordInput.placeholder = this._getString("passwordInput");
this._eventManager.add(passwordInput, "keydown", this._handleKey.bind(this), "Paywall password keydown");
this._eventManager.add(passwordInput, "click", this._inputClick.bind(this), "Paywall password click");
WinJS.Utilities.addClass(this._passwordInput, "passwordInput inputBoxContainer");
form.appendChild(this._passwordInput);
var statusLabel=this._statusLabel = document.createElement("div");
WinJS.Utilities.addClass(statusLabel, "statusLabel platformHide");
form.appendChild(statusLabel);
var submitButton=this._submitButton = document.createElement("button");
submitButton.tabIndex = 4;
WinJS.Utilities.addClass(submitButton, "submitButton");
submitButton.innerText = this._getString("submit");
form.appendChild(submitButton);
this._eventManager.add(submitButton, "click", this._onSubmitClick.bind(this), "Paywall submit click");
if (paywallSettings.privacyurl) {
var privacyPolicy=this._privacyPolicy = document.createElement("button");
privacyPolicy.tabIndex = 21;
privacyPolicy.innerText = this._getString("privacyPolicy");
WinJS.Utilities.addClass(privacyPolicy, "privacyPolicy");
form.appendChild(privacyPolicy);
this._eventManager.add(privacyPolicy, "click", this._onPrivacyPolicyClick.bind(this), "Paywall privacy click")
}
if (paywallSettings.termsofuseurl) {
var tou=this._tou = document.createElement("button");
tou.tabIndex = 22;
tou.innerText = this._getString("TermsOfUse");
WinJS.Utilities.addClass(tou, "tou");
form.appendChild(tou);
this._eventManager.add(tou, "click", this._onTOUClick.bind(this), "Paywall tou click")
}
if (paywallSettings.registrationurl) {
var createAccountButton=this._createAccountButton = document.createElement("button");
createAccountButton.tabIndex = 6;
createAccountButton.innerText = this._getString("createAccountButton");
WinJS.Utilities.addClass(createAccountButton, "createAccountButton");
form.appendChild(createAccountButton);
this._eventManager.add(createAccountButton, "click", this._onCreateAccountClick.bind(this), "Paywall create click")
}
if (paywallSettings.forgotpasswordurl) {
var forgotPasswordButton=this._forgotPasswordButton = document.createElement("button");
forgotPasswordButton.tabIndex = 5;
forgotPasswordButton.innerText = this._getString("forgotPasswordButton");
WinJS.Utilities.addClass(forgotPasswordButton, "forgotPasswordButton");
form.appendChild(forgotPasswordButton);
this._eventManager.add(forgotPasswordButton, "click", this._onForgotPasswordClick.bind(this), "Paywall forgot click")
}
this._customContainer = document.createElement("div");
WinJS.Utilities.addClass(this._customContainer, "customContainer");
form.appendChild(this._customContainer);
WinJS.Utilities.addClass(this._element, "dynamicAuthControl");
if (paywallSettings.subscriptiondescription) {
var subscribeInstructions=document.createElement("div");
subscribeInstructions.innerText = this._getString("subscribeNow");
this._customContainer.appendChild(subscribeInstructions);
WinJS.Utilities.addClass(subscribeInstructions, "subscribeInstructions");
var subscribeInfo=document.createElement("div");
subscribeInfo.innerHTML = paywallSettings.subscriptiondescription;
this._customContainer.appendChild(subscribeInfo);
WinJS.Utilities.addClass(subscribeInfo, "subscribeInfo")
}
var subscribeButton=this._subscribeButton = document.createElement("button");
subscribeButton.tabIndex = 11;
subscribeButton.innerText = this._getString("subscribeButton");
WinJS.Utilities.addClass(subscribeButton, "subscribeButton");
this._customContainer.appendChild(subscribeButton);
this._eventManager.add(subscribeButton, "click", this._onSubscribeClick.bind(this), "Paywall subscribe click");
var logo=this._element.querySelector(".authFormLogo");
logo.style.backgroundImage = "url(" + paywallSettings.logo + ")";
var dynamicPanoAccentColor=null;
var dynamicPanoAccent=document.querySelector(".dynamicPanoAccent");
if (dynamicPanoAccent) {
dynamicPanoAccentColor = window.getComputedStyle(dynamicPanoAccent).backgroundColor
}
if (!dynamicPanoAccentColor) {
dynamicPanoAccentColor = this._paywallProvider.paywallSettings.accentColor || CommonJS.Partners.Auth.defaultSettings.accentColor
}
if (dynamicPanoAccentColor) {
var authAccentBarList=this._container.getElementsByClassName("authAccentBar");
for (var i=0; i < authAccentBarList.length; i++) {
authAccentBarList[i].style.backgroundColor = dynamicPanoAccentColor
}
var promptControlList=this._container.getElementsByClassName("prompt");
for (var j=0; j < promptControlList.length; j++) {
promptControlList[j].style.backgroundColor = dynamicPanoAccentColor
}
}
}, _launchBrowser: function _launchBrowser(url, telemetryElement) {
if (telemetryElement) {
var attributes={partnerCode: this._instrumentationId};
CommonJS.Partners.Auth.PaywallControlBase.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, telemetryElement, attributes)
}
var uri=new Windows.Foundation.Uri(url);
Windows.System.Launcher.launchUriAsync(uri)
}, _onCreateAccountClick: function _onCreateAccountClick() {
this._launchBrowser(this._paywallProvider.paywallSettings.registrationurl, "CreateAccount")
}, _onForgotPasswordClick: function _onForgotPasswordClick() {
this._launchBrowser(this._paywallProvider.paywallSettings.forgotpasswordurl, "ForgotPassword")
}, _onPrivacyPolicyClick: function _onPrivacyPolicyClick() {
this._launchBrowser(this._paywallProvider.paywallSettings.privacyurl, "PrivacyPolicy")
}, _onTOUClick: function _onTOUClick() {
this._launchBrowser(this._paywallProvider.paywallSettings.termsofuseurl, "TermsOfUse")
}, _onSubscribeClick: function _onSubscribeClick() {
this._launchBrowser(this._paywallProvider.paywallSettings.subscriptionurl, "Subscribe")
}, _getString: function _getString(stringId) {
return PlatformJS.Services.resourceLoader.getString("/platform/" + stringId)
}, _handleKey: function _handleKey(event) {
var that=this;
if (event.keyCode === WinJS.Utilities.Key.enter) {
that._submitButton.focus()
}
}, _inputClick: function _inputClick(event) {
var element=event.srcElement;
if (element) {
element.select()
}
}, _onSubmitClick: function _onSubmitClick() {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(this._paywallProvider, this._instrumentationId);
attributes.partnerCode = this._instrumentationId;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallUserAction(Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, "Submit", attributes);
var userName=this._userNameInput.value;
var password=this._passwordInput.value;
var that=this;
this._submitButton.disabled = true;
WinJS.Utilities.addClass(that._statusLabel, "platformHide");
this._showProgress();
this._paywallProvider.loginAsync(userName, password, null).then(function _RestPaywallControl_247(response) {
that._hideProgress();
if (response.success) {
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction("appsignin", attributes);
that._onsuccess(response)
}
else {
that._submitButton.disabled = false;
WinJS.Utilities.removeClass(that._statusLabel, "platformHide");
if (response.message !== "") {
that._statusLabel.innerText = response.message
}
else {
that._statusLabel.innerText = that._getString(response.errorMessageResourceKey)
}
attributes.error = that._statusLabel.innerText;
CommonJS.Partners.Auth.PaywallControlBase.logPaywallAppAction("appsigninerror", attributes)
}
}, function loginError(e) {
that._onerror()
})
}
}, {})})
})();
(function _OAuthPaywallControl_6() {
"use strict";
var BaseControl=CommonJS.Partners.Auth.PaywallControlBase;
WinJS.Namespace.define("CommonJS.Partners.Auth", {OAuthPaywallControl: WinJS.Class.derive(BaseControl, function restpaywallcontrol_ctor(element, options) {
var paywallSettings=options.paywallProvider.paywallSettings;
if (paywallSettings.custom) {
this._redirectUrl = paywallSettings.custom.toLowerCase().split(";")
}
else {
this._redirectUrl = []
}
if (paywallSettings.redirecturl) {
this._redirectUrl.push(paywallSettings.redirecturl.toLowerCase())
}
BaseControl.call(this, element, options)
}, {
_redirectUrl: null, _statusLabel: null, loginAsync: function loginAsync() {
if (this._instrumentationId === "NY") {
NYT.UPT.instance.recordLogin()
}
var paywallSettings=this._paywallProvider.paywallSettings;
this._setWebViewHeight(paywallSettings.authheight);
var webViewElement=this._webViewElement;
webViewElement.navigate(paywallSettings.authurl);
this._setStatusLabelHeight(paywallSettings.authheight);
return this._showAsync(this._closeButton, "Login")
}, subscribeAsync: function subscribeAsync() {
var paywallSettings=this._paywallProvider.paywallSettings;
if (paywallSettings.subscriptionurl) {
this._setWebViewHeight(paywallSettings.subscribeheight);
var webViewElement=this._webViewElement;
webViewElement.navigate(paywallSettings.subscriptionurl);
this._setStatusLabelHeight(paywallSettings.subscribeheight);
return this._showAsync(this._closeButton, "Subscribe")
}
else {
this.dispose();
return WinJS.Promise.wrap(false)
}
}, logoutAsync: function logoutAsync() {
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(this._paywallProvider, this._instrumentationId);
attributes.partnerCode = this._instrumentationId;
BaseControl.logPaywallAppAction("appsignout", attributes);
this.dispose();
return this._paywallProvider.logoutAsync()
}, _createPaywallUIElements: function _createPaywallUIElements(options) {
BaseControl.prototype._createPaywallUIElements.call(this, options);
var paywallSettings=options.paywallProvider.paywallSettings;
var logo=this._element.querySelector(".authLogo");
logo.style.backgroundImage = "url(" + paywallSettings.logo + ")";
var webViewElement=this._webViewElement = document.createElement("x-ms-webview");
this._eventManager.add(webViewElement, "MSWebViewNavigationStarting", this._onWebViewNavigationStarting.bind(this), "Paywall web navstart");
WinJS.Utilities.addClass(webViewElement, "authWebView authMainControl");
this._container.appendChild(webViewElement);
var statusLabel=this._statusLabel = document.createElement("div");
WinJS.Utilities.addClass(statusLabel, "authStatusLabel authWebView authMainControl platformHide");
this._container.appendChild(statusLabel)
}, _setStatusLabelHeight: function _setStatusLabelHeight(height) {
if (height) {
this._statusLabel.style.height = height;
this._statusLabel.style.lineHeight = height
}
}, _onFocusOut: function _onFocusOut(event) {
if (event.relatedTarget && event.target === this._webViewElement) {
var relationship=this._element.compareDocumentPosition(event.relatedTarget);
var staying=relationship & Node.DOCUMENT_POSITION_CONTAINED_BY;
if (!staying) {
relationship = event.relatedTarget.compareDocumentPosition(this._element);
staying = relationship & Node.DOCUMENT_POSITION_CONTAINED_BY
}
if (!staying) {
this._closeButton.focus()
}
}
else {
BaseControl.prototype._onFocusOut(event)
}
}, _setWebViewHeight: function _setWebViewHeight(heightSetting) {
if (heightSetting) {
this._webViewElement.style.height = heightSetting
}
}, _onWebViewNavigationStarting: function _onWebViewNavigationStarting(event) {
var that=this;
console.log(event.uri);
var currentUri=event.uri,
currentUriLowerCase=currentUri.toLowerCase();
if (this._redirectUrl && this._redirectUrl.length && this._redirectUrl.reduce(function matchUrl(previous, current) {
return previous || (current && currentUriLowerCase.indexOf(current) === 0)
}, false)) {
WinJS.Utilities.addClass(that._webViewElement, "platformHide");
event.preventDefault();
that._statusLabel.innerText = that._paywallProvider.paywallSettings.subscriptiondescription || "";
WinJS.Utilities.removeClass(that._statusLabel, "platformHide");
this._showProgress();
this._paywallProvider.loginAsync(null, null, currentUri).then(function _OAuthPaywallControl_153(response) {
that._hideProgress();
var attributes=DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(that._paywallProvider, that._instrumentationId);
attributes.partnerCode = that._instrumentationId;
if (response.success) {
BaseControl.logPaywallAppAction("appsignin", attributes);
that._onsuccess(response)
}
else {
that._statusLabel.innerText = that._getErrorMessageFromResponse(response);
attributes.error = that._statusLabel.innerText;
BaseControl.logPaywallAppAction("appsigninerror", attributes)
}
}, function loginError(e) {
that._hideProgress();
that._statusLabel.innerText = PlatformJS.Services.resourceLoader.getString("/Platform/validateError")
})
}
}
}, {})})
})()