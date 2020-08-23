/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/music1/fuepage.js:2 */
(function() {
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

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var FUEPage = (function(_super) {
                        __extends(FUEPage, _super);
                        function FUEPage(element, options) {
                            var _this = this;
                            _super.call(this, element, options);
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this).done(function() {
                                MS.Entertainment.UI.Framework.Navigation.raiseContentComplete(element);
                                _this._image1LoadEventBinding = MS.Entertainment.UI.Framework.addEventHandlers(_this._image1.domElement, {load: function() {
                                        MS.Entertainment.Utilities.hideElement(_this._image2.domElement);
                                        MS.Entertainment.Utilities.showElement(_this._image1.domElement)
                                    }});
                                _this._image2LoadEventBinding = MS.Entertainment.UI.Framework.addEventHandlers(_this._image2.domElement, {load: function() {
                                        MS.Entertainment.Utilities.hideElement(_this._image1.domElement);
                                        MS.Entertainment.Utilities.showElement(_this._image2.domElement)
                                    }})
                            })
                        }
                        FUEPage.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            if (this._image1LoadEventBinding) {
                                this._image1LoadEventBinding.cancel();
                                this._image1LoadEventBinding = null
                            }
                            if (this._image2LoadEventBinding) {
                                this._image2LoadEventBinding.cancel();
                                this._image2LoadEventBinding = null
                            }
                        };
                        Object.defineProperty(FUEPage.prototype, "title", {
                            get: function() {
                                var title = String.load(String.id.IDS_MUSIC_WELCOME_PAGE_TITLE);
                                var titleLowerCase = title.toLowerCase();
                                var openBoldTagIndex = titleLowerCase.indexOf("<b>");
                                var closeBoldTagIndex = titleLowerCase.indexOf("</b>");
                                var preserveBoldMarkup = openBoldTagIndex !== -1 && closeBoldTagIndex !== -1 && openBoldTagIndex < closeBoldTagIndex && titleLowerCase.lastIndexOf("<b>") === openBoldTagIndex && titleLowerCase.lastIndexOf("</b>") === closeBoldTagIndex;
                                if (preserveBoldMarkup) {
                                    title = title.replace("<b>", "OPEN_BOLD_TAG");
                                    title = title.replace("<B>", "OPEN_BOLD_TAG");
                                    title = title.replace("</b>", "CLOSE_BOLD_TAG");
                                    title = title.replace("</B>", "CLOSE_BOLD_TAG")
                                }
                                title = MS.Entertainment.Utilities.unEscapeHTML(title);
                                if (preserveBoldMarkup) {
                                    title = title.replace("OPEN_BOLD_TAG", "<b>");
                                    title = title.replace("CLOSE_BOLD_TAG", "</b>")
                                }
                                return title
                            }, enumerable: true, configurable: true
                        });
                        FUEPage.prototype.onGoPremiumClick = function() {
                            var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                            var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.subscriptionWithSignIn);
                            Controls.assert(action, "FUEPage::onGoPremiumClick() subscriptionWithSignIn action is not registered.");
                            action.execute()
                        };
                        FUEPage.prototype.onOneDriveGetMoreInfoClick = function() {
                            var supportUri = new Windows.Foundation.Uri(UI.FWLink.cloudContentV2GetMoreInfo);
                            Windows.System.Launcher.launchUriAsync(supportUri).then(function(){}, function(error) {
                                UI.Actions.fail("FUEPage::onOneDriveGetMoreInfoClick() Failed to launch help topic for the OneDrive get more information with the following failure: " + (error && error.message))
                            })
                        };
                        FUEPage.prototype.onCollectionClick = function() {
                            this._selectNavigationPivot("mymusic")
                        };
                        FUEPage.prototype.onRadioClick = function() {
                            this._selectNavigationPivot("radio")
                        };
                        FUEPage.prototype.onExploreClick = function() {
                            this._selectNavigationPivot("explore")
                        };
                        FUEPage.prototype._selectNavigationPivot = function(pivot) {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.winJSNavigation);
                            navigationService.navigateToMoniker(pivot)
                        };
                        FUEPage.isDeclarativeControlContainer = true;
                        return FUEPage
                    })(Controls.PageViewBase);
                Controls.FUEPage = FUEPage
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.FUEPage)
})();
/* >>>>>>/viewmodels/music1/fuepageviewmodel.js:107 */
(function() {
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

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var FUEPageViewModel = (function(_super) {
                    __extends(FUEPageViewModel, _super);
                    function FUEPageViewModel() {
                        var _this = this;
                        _super.call(this);
                        this._frozen = false;
                        this._disposed = false;
                        this._signInBindings = null;
                        this._subscriptionBinding = null;
                        this._signInService = null;
                        var uiSettings = new Windows.UI.ViewManagement.UISettings;
                        this._animateImages = uiSettings.animationsEnabled;
                        this._index = Math.floor(Math.random() * FUEPageViewModel._images.length);
                        this._switchImage();
                        this._startImageSwitcher();
                        this._signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._signInBindings = Entertainment.Utilities.addEventHandlers(this._signInService, {isSignedIn: function() {
                                return _this._onUserStatusChanged()
                            }});
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        this._subscriptionBinding = Entertainment.Utilities.addEventHandlers(signedInUser, {isSubscriptionChanged: function() {
                                return _this._onUserStatusChanged()
                            }});
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        this.showRadioAndExploreAction = this._isFreeStreamingEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
                        var cloudCollectionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.cloudCollection);
                        this._isCloudCollectionV2Enabled = cloudCollectionService.isV2Enabled;
                        this.showOneDriveAction = this._isCloudCollectionV2Enabled && !this._isFreeStreamingEnabled;
                        this._onUserStatusChanged();
                        var configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        configManager.fue.musicCloudContentV1CleanupDialogDismissed = true
                    }
                    Object.defineProperty(FUEPageViewModel.prototype, "image1", {
                        get: function() {
                            return this._image1
                        }, set: function(value) {
                                this.updateAndNotify("image1", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(FUEPageViewModel.prototype, "image2", {
                        get: function() {
                            return this._image2
                        }, set: function(value) {
                                this.updateAndNotify("image2", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(FUEPageViewModel.prototype, "showRadioAndExploreAction", {
                        get: function() {
                            return this._showRadioAndExploreAction
                        }, set: function(value) {
                                this.updateAndNotify("showRadioAndExploreAction", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(FUEPageViewModel.prototype, "showOneDriveAction", {
                        get: function() {
                            return this._showOneDriveAction
                        }, set: function(value) {
                                this.updateAndNotify("showOneDriveAction", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(FUEPageViewModel.prototype, "showGoPremiumAction", {
                        get: function() {
                            return this._showGoPremiumAction
                        }, set: function(value) {
                                this.updateAndNotify("showGoPremiumAction", value)
                            }, enumerable: true, configurable: true
                    });
                    FUEPageViewModel.prototype.freeze = function() {
                        this._frozen = true;
                        this._stopImageSwitcher()
                    };
                    FUEPageViewModel.prototype.thaw = function() {
                        this._frozen = false;
                        this._startImageSwitcher()
                    };
                    FUEPageViewModel.prototype.dispose = function() {
                        this._disposed = true;
                        this._stopImageSwitcher();
                        if (this._signInBindings) {
                            this._signInBindings.cancel();
                            this._signInBindings = null
                        }
                        if (this._subscriptionBinding) {
                            this._subscriptionBinding.cancel();
                            this._subscriptionBinding = null
                        }
                    };
                    FUEPageViewModel.prototype._onUserStatusChanged = function() {
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        this.showGoPremiumAction = (!this._signInService.isSignedIn || (signedInUser && !signedInUser.isSubscription)) && !this._isFreeStreamingEnabled
                    };
                    FUEPageViewModel.prototype._startImageSwitcher = function() {
                        var _this = this;
                        if (!this._animateImages)
                            return;
                        this._stopImageSwitcher();
                        this._imageSwitcherId = window.setInterval(function() {
                            if (!_this._disposed && !_this._frozen)
                                _this._switchImage();
                            else
                                _this._stopImageSwitcher()
                        }, FUEPageViewModel._switcherDuration)
                    };
                    FUEPageViewModel.prototype._stopImageSwitcher = function() {
                        if (!this._animateImages)
                            return;
                        if (this._imageSwitcherId) {
                            window.clearInterval(this._imageSwitcherId);
                            this._imageSwitcherId = 0
                        }
                    };
                    FUEPageViewModel.prototype._switchImage = function() {
                        this._index++;
                        var image = FUEPageViewModel._images[this._index % FUEPageViewModel._images.length];
                        if (this._index % 2)
                            this.image1 = image;
                        else
                            this.image2 = image
                    };
                    FUEPageViewModel._switcherDuration = 5000;
                    FUEPageViewModel._images = ["/images/FUE/fue_background1.jpg", "/images/FUE/fue_background2.jpg", "/images/FUE/fue_background3.jpg", "/images/FUE/fue_background4.jpg", "/images/FUE/fue_background5.jpg"];
                    return FUEPageViewModel
                })(MS.Entertainment.UI.Framework.ObservableBase);
            ViewModels.FUEPageViewModel = FUEPageViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
