/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                var SignInControl = (function(_super) {
                        __extends(SignInControl, _super);
                        function SignInControl(element, options) {
                            this.templateStorage = "/Controls/SignInControl.html";
                            this.templateName = "signInControlTemplate";
                            _super.call(this, element, options)
                        }
                        SignInControl.prototype.initialize = function() {
                            var _this = this;
                            _super.prototype.initialize.call(this);
                            this._signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            this._uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                                this._navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                this._navigationBinding = WinJS.Binding.bind(this._navigation, {currentPage: function() {
                                        return _this._onPropertyChange()
                                    }})
                            }
                            this._signInBinding = WinJS.Binding.bind(this._signIn, {
                                isSigningIn: function() {
                                    return _this._onPropertyChange()
                                }, signInError: function() {
                                        return _this._onPropertyChange()
                                    }
                            });
                            this._uiStateBinding = WinJS.Binding.bind(this._uiState, {isHubStripVisible: function() {
                                    return _this._onPropertyChange()
                                }})
                        };
                        SignInControl.prototype.unload = function() {
                            if (this._signInBinding) {
                                this._signInBinding.cancel();
                                this._signInBinding = null
                            }
                            if (this._uiStateBinding) {
                                this._uiStateBinding.cancel();
                                this._uiStateBinding = null
                            }
                            if (this._navigationBinding) {
                                this._navigationBinding.cancel();
                                this._uiStateBinding = null
                            }
                            _super.prototype.unload.call(this)
                        };
                        SignInControl.prototype.onClick = function() {
                            if (!this._signIn.isSigningIn)
                                this._signIn.signIn().done(null, function signInError(){})
                        };
                        SignInControl.prototype._onPropertyChange = function() {
                            var _this = this;
                            var isSigningIn = this._signIn.isSigningIn;
                            var signInError = (this._signIn.signInError !== 0);
                            var hubStripVisible = this._uiState.isHubStripVisible;
                            var showNotifications = this.settings || (this._navigation && this._navigation.currentPage && this._navigation.currentPage.showNotifications);
                            if (isSigningIn)
                                this._showSignedIn = true;
                            else if (signInError)
                                this._showSignedIn = false;
                            var signInNotification = (isSigningIn || signInError || this._showSignedIn);
                            this.visibility = signInNotification && (this.settings || hubStripVisible) && showNotifications;
                            if (signInError) {
                                WinJS.Utilities.removeClass(this._signInError.domElement, "hideFromDisplay");
                                WinJS.Utilities.removeClass(this._signInRetry.domElement, "hideFromDisplay")
                            }
                            else {
                                WinJS.Utilities.addClass(this._signInError.domElement, "hideFromDisplay");
                                WinJS.Utilities.addClass(this._signInRetry.domElement, "hideFromDisplay")
                            }
                            if (isSigningIn)
                                WinJS.Utilities.removeClass(this._signInProgress.domElement, "hideFromDisplay");
                            else
                                WinJS.Utilities.addClass(this._signInProgress.domElement, "hideFromDisplay");
                            if (this._showSignedIn && !signInError && !isSigningIn) {
                                WinJS.Utilities.removeClass(this._signInComplete.domElement, "hideFromDisplay");
                                WinJS.Promise.timeout(2500).then(function() {
                                    WinJS.Utilities.addClass(_this._signInComplete.domElement, "hideFromDisplay");
                                    _this.visibility = false
                                });
                                this._showSignedIn = false
                            }
                            else
                                WinJS.Utilities.addClass(this._signInComplete.domElement, "hideFromDisplay");
                            if (isSigningIn)
                                WinJS.Utilities.addClass(this._signInRetrySpinner, "spinNoticationRetrySpinner");
                            else
                                WinJS.Utilities.removeClass(this._signInRetrySpinner, "spinNoticationRetrySpinner")
                        };
                        return SignInControl
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.SignInControl = SignInControl;
                WinJS.Utilities.markSupportedForProcessing(SignInControl)
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
