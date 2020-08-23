/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Shell");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Shell", {BackButton: MS.Entertainment.UI.Framework.define(function BackButton() {
            this._navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
            this._backButton = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.backButton);
            this._backButtonBling = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.backButtonBling);
            this._navigationWrapper = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.navigationWrapper);
            this.setButtonMode(MS.Entertainment.Shell.BackButton.ButtonMode.homeButton);
            this._navigation.addEventListener("canNavigateBackChanged", this._backButtonCallBack.bind(this));
            this._navigation.addEventListener("hasBackStackChanged", this._backStackChangedCallback.bind(this));
            this._backStackChangedCallback();
            this._backButtonCallBack()
        }, {
            _initialized: false, _backButton: null, _backButtonBling: null, _navigation: null, _navigationWrapped: null, _overrideShowBackButton: false, _overrideBackButtonMode: null, overrideShowBackButton: {
                    get: function() {
                        return this._overrideShowBackButton
                    }, set: function(value) {
                            this._overrideShowBackButton = value;
                            this._backButtonCallBack();
                            this._backStackChangedCallback()
                        }
                }, overrideBackButtonMode: {
                    get: function() {
                        return this._overrideBackButtonMode
                    }, set: function(value) {
                            this._overrideBackButtonMode = value;
                            this._backStackChangedCallback()
                        }
                }, _backButtonCallBack: function() {
                    if (this.overrideShowBackButton || (this._navigation && this._navigation.canNavigateBack && !this._navigation.overrideHideBackButton))
                        this.showBackButton(false);
                    else
                        this.hideBackButton(false)
                }, _backStackChangedCallback: function _backStackChangedCallback() {
                    if (MS.Entertainment.Utilities.isApp2)
                        this.setButtonMode(MS.Entertainment.Shell.BackButton.ButtonMode.backButton);
                    else if (this.overrideBackButtonMode)
                        this.setButtonMode(this.overrideBackButtonMode);
                    else if (this._navigation.canNavigateBack)
                        if (this._navigation.hasBackStack)
                            this.setButtonMode(MS.Entertainment.Shell.BackButton.ButtonMode.backButton);
                        else
                            this.setButtonMode(MS.Entertainment.Shell.BackButton.ButtonMode.homeButton)
                }, showBackButton: function showBackButton(fastShow) {
                    if (this.overrideShowBackButton || (this._navigation && this._navigation.canNavigateBack))
                        if (fastShow)
                            this._showBackButtonContainer();
                        else if (this._backButton && this._backButton.domElement) {
                            this._navigationWrapper.style.opacity = String.empty;
                            this._backButton.domElement.style.display = String.empty;
                            if (this._backButtonBling)
                                this._backButtonBling.style.display = String.empty;
                            MS.Entertainment.Utilities.showElement(this._backButton.domElement)
                        }
                }, _showBackButtonContainer: function _showBackButtonContainer() {
                    if (this._backButton && this._backButton.domElement && WinJS.Utilities.hasClass(this._backButton.domElement, "hideFromDisplay")) {
                        this._backButton.domElement.style.display = String.empty;
                        if (this._backButtonBling)
                            this._backButtonBling.style.display = String.empty;
                        WinJS.Utilities.removeClass(this._backButton.domElement, "hideFromDisplay");
                        WinJS.Utilities.removeClass(this._backButton.domElement, "exitPage")
                    }
                    if (this._navigationWrapper)
                        this._navigationWrapper.style.opacity = String.empty
                }, hideBackButton: function hideBackButton(fastHide) {
                    if (fastHide)
                        this._hideBackButtonContainer();
                    else if (this._backButton && this._backButton.domElement) {
                        var completionHandler = function forceHide() {
                                this._backButton.domElement.style.display = "none";
                                if (this._backButtonBling)
                                    this._backButtonBling.style.display = "none";
                                this._navigationWrapper.style.opacity = 0
                            }.bind(this);
                        MS.Entertainment.Utilities.hideElement(this._backButton.domElement, 200).done(completionHandler, completionHandler)
                    }
                }, _hideBackButtonContainer: function _hideBackButtonContainer() {
                    if (this._navigationWrapper)
                        this._navigationWrapper.style.opacity = 0;
                    if (this._backButton && this._backButton.domElement) {
                        this._backButton.domElement.style.display = String.empty;
                        if (this._backButtonBling)
                            this._backButtonBling.style.display = String.empty;
                        WinJS.Utilities.addClass(this._backButton.domElement, "hideFromDisplay");
                        WinJS.Utilities.addClass(this._backButton.domElement, "exitPage")
                    }
                }, setButtonMode: function setButtonMode(buttonMode) {
                    if (this._backButton && this._backButton.domElement) {
                        var backButtonButton = this._backButton.domElement.querySelector(".win-backbutton");
                        if (buttonMode === MS.Entertainment.Shell.BackButton.ButtonMode.backButton) {
                            WinJS.Utilities.removeClass(backButtonButton, "homeIcon");
                            backButtonButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_BACK_BUTTON))
                        }
                        else if (buttonMode === MS.Entertainment.Shell.BackButton.ButtonMode.homeButton) {
                            WinJS.Utilities.addClass(backButtonButton, "homeIcon");
                            backButtonButton.setAttribute("aria-label", String.load(String.id.IDS_ACC_HOME_BUTTON))
                        }
                        else
                            MS.Entertainment.UI.Shell.fail("Unexpected buttonMode passed to setButtonMode: " + buttonMode)
                    }
                }
        }, {ButtonMode: {
                backButton: "backButton", homeButton: "homeButton"
            }})});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.backButton, function getBackButtonService() {
        return new MS.Entertainment.Shell.BackButton
    })
})()
