/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Controls/hubstrip.js", "/Framework/corefx.js", "/Framework/serviceLocator.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Shell");
    WinJS.Namespace.define("MS.Entertainment.UI.Shell", {FrontHubStrip: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Shell.GalleryHubStrip", null, function constructFrontHubStrip() {
            this._callShowElementOnHubLoad = false;
            this._showPageTitle = true;
            this._showAppPreview = true;
            this._showPivots = false;
            this._pageTitle = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).applicationTitle
        }, {
            controlName: "FrontHubStrip", getPageTitleFromNavigationService: false, _networkStatusBinding: null, _currentState: MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown, _isFrozen: false, initialize: function initialize() {
                    this._scroller.addEventListener("scroll", function() {
                        this._suppressOtherMoveToScrolling = true
                    }.bind(this));
                    MS.Entertainment.UI.Shell.GalleryHubStrip.prototype.initialize.apply(this, arguments);
                    this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
                    this._onNetworkStatusChanged(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus);
                    if (MS.Entertainment.Utilities.isMusicApp || MS.Entertainment.Utilities.isVideoApp) {
                        this.leftEdgeOffset = 120;
                        this.leftPanelOffset = 120
                    }
                    else {
                        this.leftEdgeOffset = 0;
                        this.leftPanelOffset = 0
                    }
                    this.rightEdgeOffset = 50
                }, unload: function unload() {
                    if (this._networkStatusBinding) {
                        this._networkStatusBinding.cancel();
                        this._networkStatusBinding = null
                    }
                    MS.Entertainment.UI.Shell.GalleryHubStrip.prototype.unload.call(this)
                }, freeze: function freeze() {
                    this._isFrozen = true;
                    MS.Entertainment.UI.Shell.GalleryHubStrip.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Shell.GalleryHubStrip.prototype.thaw.call(this);
                    this._isFrozen = false;
                    this._onNetworkStatusChanged(this._currentState)
                }, runHubStripAnimation: function runHubStripAnimation() {
                    var stripShownPromise = new WinJS.Promise.wrap;
                    stripShownPromise = this.moveTo(this.defaultIndex, true, true).then(function animateIn() {
                        if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFirstLaunch) {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFirstLaunch = false;
                            MS.Entertainment.Animations.HubStrip.showHubStrip(this._navigationContainer.domElement.parentElement, this._scroller).then(function updatePosition() {
                                this._updatePanelAnimations(this._scrollLeft);
                                this._focusFirstElement(this.hubs[this.defaultIndex])
                            }.bind(this))
                        }
                        else {
                            this._scroller.style.opacity = "1";
                            this._navigationContainer.domElement.parentElement.style.opacity = "1"
                        }
                    }.bind(this));
                    return stripShownPromise
                }, _focusFirstElement: function _focusFirstElement(hub) {
                    if (hub && hub.domElement)
                        this._keyboardNavigationManager.focusFirstItemInContainer(hub.domElement, false)
                }, setupAnimations: function setupAnimations() {
                    WinJS.Utilities.addClass(this._navigationContainer.domElement, "enterPageOffset2");
                    this._navigationContainer.domElement.setAttribute("data-ent-hideanimation", "exitPage");
                    this._navigationContainer.domElement.setAttribute("data-ent-showanimation", "enterPage")
                }, _onCurrentHubChanged: function _onCurrentHubChanged() {
                    MS.Entertainment.UI.Shell.GalleryHubStrip.prototype._onCurrentHubChanged.apply(this, arguments)
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                    if (!this._isFrozen)
                        switch (newValue) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                                WinJS.Utilities.removeClass(this.domElement, "offline");
                                break;
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                                WinJS.Utilities.addClass(this.domElement, "offline");
                                break
                        }
                    this._currentState = newValue
                }
        })})
})()
