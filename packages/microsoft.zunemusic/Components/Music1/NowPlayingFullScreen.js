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
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
                var ViewModels = MS.Entertainment.ViewModels;
                var Framework = MS.Entertainment.UI.Framework;
                var Utilities = MS.Entertainment.Utilities;
                var Controls = MS.Entertainment.UI.Controls;
                var VisualizationContainer = (function(_super) {
                        __extends(VisualizationContainer, _super);
                        function VisualizationContainer(element, options) {
                            this.templateStorage = "/Components/Music1/NowPlayingFullScreenPage.html";
                            this.templateName = "nowPlayingFullScreen";
                            this._lastVisualizationIndex = -1;
                            this._swapCount = 0;
                            this.classBackwardDirection = "state-backward";
                            this.classForwardDirection = "state-foreward";
                            _super.call(this, element, options)
                        }
                        Object.defineProperty(VisualizationContainer.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    if (value !== this.dataContext) {
                                        this.updateAndNotify("dataContext", value);
                                        this._initializeDataContextMediaChanges()
                                    }
                                }, enumerable: true, configurable: true
                        });
                        VisualizationContainer.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            var uiSettings = new Windows.UI.ViewManagement.UISettings;
                            this._interactionTimerTimeoutMS = uiSettings.messageDuration * 1000;
                            if (Framework.Navigation && Framework.Navigation.getJournal)
                                this._navigationHandlers = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.UI.Framework.Navigation.getJournal(), {navigated: this.exit.bind(this)});
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState)) {
                                var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                this._uiStateHandlers = MS.Entertainment.Utilities.addEventHandlers(uiState, {isSnappedChanged: this._handleIsSnappedChanaged.bind(this)})
                            }
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.interactionNotifier)) {
                                this._interactionHandler = this._handlerUserInteractions.bind(this);
                                var interactionNotifier = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.interactionNotifier);
                                interactionNotifier.addInteractionListener(this._interactionHandler);
                                this._interactionHandler()
                            }
                            this._swapVisualizations()
                        };
                        VisualizationContainer.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            this._swapCount = -1;
                            if (this._navigationHandlers) {
                                this._navigationHandlers.cancel();
                                this._navigationHandlers = null
                            }
                            if (this._uiStateHandlers) {
                                this._uiStateHandlers.cancel();
                                this._uiStateHandlers = null
                            }
                            if (this._interactionHandler) {
                                var interactionNotifier = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.interactionNotifier);
                                interactionNotifier.removeInteractionListener(this._interactionHandler);
                                this._interactionHandler = null
                            }
                            if (this._interactionTimer) {
                                this._interactionTimer.cancel();
                                this._interactionTimer = null
                            }
                            this._releaseOverlay();
                            this._releaseDataContextMediaChanges();
                            this._releaseNextChildHandlers()
                        };
                        VisualizationContainer.prototype.exit = function() {
                            if (!this._exiting) {
                                this._swapCount = -1;
                                this._exiting = true;
                                if (this._visualization1)
                                    this._visualization1.exitting();
                                if (this._visualization2)
                                    this._visualization2.exitting();
                                if (this._overlay)
                                    this._overlay.hide()
                            }
                        };
                        VisualizationContainer.prototype.setOverlay = function(overlay) {
                            this._releaseOverlay();
                            if (overlay) {
                                this._overlay = overlay;
                                this._overlay.showAnimation = this._showAnimation.bind(this);
                                this._overlay.hideAnimation = this._hideAnimation.bind(this)
                            }
                        };
                        VisualizationContainer.prototype._clickExitNowPlaying = function() {
                            this.exit()
                        };
                        VisualizationContainer.prototype._initializeDataContextMediaChanges = function() {
                            this._releaseDataContextMediaChanges();
                            if (this.dataContext && !this._unloaded) {
                                this._dataContextMediaChangeHandlers = WinJS.Binding.bind(this.dataContext, {currentChild: this._swapVisualizations.bind(this)});
                                this._swapVisualizations()
                            }
                        };
                        VisualizationContainer.prototype._releaseDataContextMediaChanges = function() {
                            if (this._dataContextMediaChangeHandlers) {
                                this._dataContextMediaChangeHandlers.cancel();
                                this._dataContextMediaChangeHandlers = null
                            }
                        };
                        VisualizationContainer.prototype._initializeNextChildHandlers = function() {
                            var _this = this;
                            this._releaseNextChildHandlers();
                            this._nextChildBindings = WinJS.Binding.bind(this.dataContext, {nextChild: function() {
                                    if (_this._nextChildBindings)
                                        _this._prepareHiddenVisualization()
                                }});
                            this._prepareHiddenVisualization()
                        };
                        VisualizationContainer.prototype._releaseNextChildHandlers = function() {
                            if (this._nextChildBindings) {
                                this._nextChildBindings.cancel();
                                this._nextChildBindings = null
                            }
                        };
                        VisualizationContainer.prototype._swapVisualizations = function() {
                            var _this = this;
                            if (!this.dataContext || this._unloaded || !this._initialized || !this._visualization1 || !this._visualization2)
                                return;
                            var currentSwapCount = ++this._swapCount;
                            this._currentSwapAnimation = WinJS.Promise.as(this._currentSwapAnimation).then(function() {
                                if (!_this.dataContext || _this._unloaded || !_this._initialized || !_this._visualization1 || !_this._visualization2 || currentSwapCount !== _this._swapCount)
                                    return;
                                var showVisualization = null;
                                var hideVisualization = null;
                                var animationPromises = [];
                                _this._lastVisualizationIndex = (_this._lastVisualizationIndex + 1) % 2;
                                if (_this._lastVisualizationIndex === 0) {
                                    showVisualization = _this._visualization1;
                                    hideVisualization = _this._visualization2
                                }
                                else {
                                    showVisualization = _this._visualization2;
                                    hideVisualization = _this._visualization1
                                }
                                _this._releaseNextChildHandlers();
                                showVisualization.parentDataContext = _this.dataContext;
                                showVisualization.dataContext = _this.dataContext.currentChild;
                                showVisualization.entering();
                                if (_this.dataContext.lastDirection === 2) {
                                    Utilities.safeRemoveClass(hideVisualization.domElement, _this.classForwardDirection);
                                    Utilities.safeRemoveClass(showVisualization.domElement, _this.classForwardDirection);
                                    Utilities.safeAddClass(hideVisualization.domElement, _this.classBackwardDirection);
                                    Utilities.safeAddClass(showVisualization.domElement, _this.classBackwardDirection)
                                }
                                else {
                                    Utilities.safeRemoveClass(hideVisualization.domElement, _this.classBackwardDirection);
                                    Utilities.safeRemoveClass(showVisualization.domElement, _this.classBackwardDirection);
                                    Utilities.safeAddClass(hideVisualization.domElement, _this.classForwardDirection);
                                    Utilities.safeAddClass(showVisualization.domElement, _this.classForwardDirection)
                                }
                                if (currentSwapCount > 1) {
                                    hideVisualization.domElement.style.zIndex = "-1";
                                    showVisualization.domElement.style.zIndex = "0";
                                    animationPromises.push(Utilities.hideElement(hideVisualization.domElement, null, "data-ent-loadanimation", "data-ent-unloadanimation"));
                                    animationPromises.push(Utilities.showElement(showVisualization.domElement, null, "data-ent-unloadanimation", "data-ent-loadanimation"))
                                }
                                else {
                                    Utilities.hideElementNoAnimation(hideVisualization.domElement);
                                    Utilities.showElementNoAnimation(showVisualization.domElement)
                                }
                                return WinJS.Promise.join(animationPromises).then(null, function(){}).then(function() {
                                        if (currentSwapCount === _this._swapCount) {
                                            _this._initializeNextChildHandlers();
                                            hideVisualization.exitting();
                                            showVisualization.entered()
                                        }
                                    })
                            })
                        };
                        VisualizationContainer.prototype._prepareHiddenVisualization = function() {
                            if (!this.dataContext || this._unloaded || !this._initialized || !this._visualization1 || !this._visualization2)
                                return;
                            var hideVisualization = null;
                            if (this._lastVisualizationIndex === 0)
                                hideVisualization = this._visualization2;
                            else
                                hideVisualization = this._visualization1;
                            hideVisualization.dataContext = this.dataContext.nextChild
                        };
                        VisualizationContainer.prototype._handleIsSnappedChanaged = function(args) {
                            if (args && args.detail && args.detail.newValue)
                                this.exit()
                        };
                        VisualizationContainer.prototype._handlerUserInteractions = function() {
                            var _this = this;
                            if (!this.domElement || this._unloaded)
                                return;
                            if (this._interactionTimer) {
                                this._interactionTimer.cancel();
                                this._interactionTimer = null;
                                this.domElement.style.cursor = "default";
                                WinJS.Utilities.query(VisualizationContainer.s_userInteractionRequiredSelector, this.domElement).forEach(function(element) {
                                    if (WinJS.Utilities.hasClass(element, "hideFromDisplay"))
                                        Utilities.showElement(element)
                                });
                                WinJS.Utilities.query(VisualizationContainer.s_noUserInteractionRequiredSelector, this.domElement).forEach(function(element) {
                                    if (!WinJS.Utilities.hasClass(element, "hideFromDisplay"))
                                        Utilities.hideElement(element)
                                })
                            }
                            if (this._interactionTimerTimeoutMS > 0)
                                this._interactionTimer = WinJS.Promise.timeout(this._interactionTimerTimeoutMS).then(function() {
                                    if (!_this.domElement || _this._unloaded)
                                        return;
                                    _this.domElement.style.cursor = "none";
                                    WinJS.Utilities.query(VisualizationContainer.s_userInteractionRequiredSelector, _this.domElement).forEach(function(element) {
                                        if (!WinJS.Utilities.hasClass(element, "hideFromDisplay"))
                                            Utilities.hideElement(element)
                                    });
                                    WinJS.Utilities.query(VisualizationContainer.s_noUserInteractionRequiredSelector, _this.domElement).forEach(function(element) {
                                        if (WinJS.Utilities.hasClass(element, "hideFromDisplay"))
                                            Utilities.showElement(element)
                                    })
                                }, function(){})
                        };
                        VisualizationContainer.prototype._releaseOverlay = function() {
                            if (this._overlay) {
                                this._overlay.showAnimation = null;
                                this._overlay.hideAnimation = null;
                                this._overlay = null
                            }
                        };
                        VisualizationContainer.prototype._showAnimation = function(element) {
                            var _this = this;
                            var result = null;
                            if (this._animationContainer) {
                                if (this._visualization1)
                                    this._visualization1.entering();
                                this._enterAnimationPromise = result = Utilities.enterElement(this._animationContainer);
                                this._enterAnimationPromise.then(null, function(){}).done(function() {
                                    if (_this._visualization1)
                                        _this._visualization1.entered();
                                    _this._enterAnimationPromise = null
                                })
                            }
                            else {
                                if (this._visualization1)
                                    this._visualization1.entered();
                                this._enterAnimationPromise = null
                            }
                            return WinJS.Promise.as(result)
                        };
                        VisualizationContainer.prototype._hideAnimation = function(element) {
                            var result = null;
                            if (this._animationContainer)
                                result = Utilities.exitElement(this._animationContainer);
                            return WinJS.Promise.as(result)
                        };
                        VisualizationContainer.showOverlay = function(dataContext) {
                            var canShow = true;
                            var newControl = null;
                            var overlay = null;
                            var options = {
                                    allowTypeToSearch: false, userControl: "MS.Entertainment.UI.Controls.VisualizationContainer", customStyle: "overlay-nowPlayingFullScreen", top: 0, left: 0, bottom: 0, right: 0, persistOnNavigate: false, dontWaitForContent: false, enableKeyboardLightDismiss: true, userControlOptions: {dataContext: dataContext}
                                };
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState)) {
                                var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                canShow = !uiState.isSnapped
                            }
                            if (canShow) {
                                newControl = document.createElement("div");
                                overlay = new Controls.Overlay(newControl, options);
                                overlay.show()
                            }
                            else
                                MS.Entertainment.UI.Controls.fail("NowPlayingFullScreen::showOverlay() Currently can't show full screen now playing. Are you in snapped mode?");
                            return overlay
                        };
                        VisualizationContainer.isDeclarativeControlContainer = false;
                        VisualizationContainer.s_userInteractionRequiredSelector = "[data-ent-usage='userInteractionRequired']";
                        VisualizationContainer.s_noUserInteractionRequiredSelector = "[data-ent-usage='noUserInteractionRequired']";
                        return VisualizationContainer
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.VisualizationContainer = VisualizationContainer;
                var NowPlayingFullScreenVisualization = (function(_super) {
                        __extends(NowPlayingFullScreenVisualization, _super);
                        function NowPlayingFullScreenVisualization(element, options) {
                            this.templateStorage = "/Components/Music1/NowPlayingFullScreenPage.html";
                            this.templateName = "nowPlayingFullScreenVisualization";
                            this.animationClass = "anim-nowPlayingFullScreen-panning";
                            this.animationOffsets = ["25% 25%", "50% 25%", "75% 25%", "25% 50%", "50% 50%", "75% 50%"];
                            _super.call(this, element, options)
                        }
                        Object.defineProperty(NowPlayingFullScreenVisualization.prototype, "parentDataContext", {
                            get: function() {
                                return this._parentDataContext
                            }, set: function(value) {
                                    this.updateAndNotify("parentDataContext", value)
                                }, enumerable: true, configurable: true
                        });
                        NowPlayingFullScreenVisualization.prototype.entering = function() {
                            this._entering = true;
                            this._exitting = false
                        };
                        NowPlayingFullScreenVisualization.prototype.entered = function() {
                            this._entering = false;
                            this._exitting = false;
                            this._beginAnimations()
                        };
                        NowPlayingFullScreenVisualization.prototype.exitting = function() {
                            this._entering = false;
                            this._exitting = true;
                            this._stopAnimations()
                        };
                        NowPlayingFullScreenVisualization.prototype._getCanAnimate = function() {
                            var canAnimate = _super.prototype._getCanAnimate.call(this);
                            return canAnimate && !this._exitting && !this._entering
                        };
                        NowPlayingFullScreenVisualization.prototype._showChildAnimation = function(element) {
                            var result;
                            if (element)
                                if (!this._entering && !this._exitting)
                                    result = MS.Entertainment.Utilities.showElement(element);
                                else {
                                    MS.Entertainment.UI.Framework.clearHideAnimations(element);
                                    MS.Entertainment.Utilities.showElementNoAnimation(element)
                                }
                            return WinJS.Promise.as(result)
                        };
                        NowPlayingFullScreenVisualization.prototype._hideChildAnimation = function(element) {
                            var result;
                            if (element)
                                if (!this._entering)
                                    result = MS.Entertainment.Utilities.hideElement(element);
                                else {
                                    MS.Entertainment.UI.Framework.clearShowAnimations(element);
                                    MS.Entertainment.Utilities.hideElementNoAnimation(element)
                                }
                            return WinJS.Promise.as(result)
                        };
                        NowPlayingFullScreenVisualization.prototype._metadataKeyDown = function(event) {
                            switch (event.keyCode) {
                                case WinJS.Utilities.Key.enter:
                                case WinJS.Utilities.Key.space:
                                    this._metadataClick();
                                    break;
                                default:
                                    break
                            }
                        };
                        NowPlayingFullScreenVisualization.prototype._metadataClick = function() {
                            if (this.dataContext instanceof MS.Entertainment.ViewModels.ChildNowPlayingVisualizationViewModel)
                                this.dataContext.navigateToArtist()
                        };
                        NowPlayingFullScreenVisualization.isDeclarativeControlContainer = false;
                        return NowPlayingFullScreenVisualization
                    })(MS.Entertainment.UI.Controls.BaseNowPlayingVisualization);
                Controls.NowPlayingFullScreenVisualization = NowPlayingFullScreenVisualization
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
