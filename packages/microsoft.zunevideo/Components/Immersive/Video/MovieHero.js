/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Components/Immersive/Video/VideoHero.js");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ImmersiveMovieHero: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ImmersiveVideoHero", "/Components/Immersive/Video/MovieHero.html#ImmersiveMovieHero", function immersiveMovieHero() {
            this._setControlVisibilityOverrides()
        }, {
            controlName: "ImmersiveMovieHero", _signedInBinding: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.ImmersiveVideoHero.prototype.initialize.call(this);
                    this._bindings = WinJS.Binding.bind(this, {dataContext: {
                            heroImageMediaItem: this._heroImageMediaItemChanged.bind(this), mediaItem: this._heroImageMediaItemChanged.bind(this)
                        }});
                    this._initializeSmartBuyStateEngine();
                    if (MS.Entertainment.UI.Framework.animationsEnabled) {
                        var logPerfTrace = function logPerfTrace() {
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioMovieDetailsRequest();
                                this.domElement.removeEventListener("animationstart", logPerfTrace)
                            }.bind(this);
                        this.domElement.addEventListener("animationstart", logPerfTrace)
                    }
                    else
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioMovieDetailsRequest()
                }, _initializeSmartBuyStateEngine: function _initializeSmartBuyStateEngine() {
                    if (this.smartBuyStateEngine) {
                        this.smartBuyStateEngine.unload();
                        this.smartBuyStateEngine = null
                    }
                    if (MS.Entertainment.Utilities.isVideoApp2) {
                        this.smartBuyStateEngine = new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine;
                        this.smartBuyStateEngine.initialize(this.dataContext.mediaItem, MS.Entertainment.ViewModels.SmartBuyButtons.getVideoDetailsButtons(this.dataContext.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.canvas), MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onVideoDetailsTwoButtonStateChanged)
                    }
                }, unload: function unload() {
                    if (this._signedInBinding) {
                        this._signedInBinding.cancel();
                        this._signedInBinding = null
                    }
                    if (this.smartBuyStateEngine) {
                        this.smartBuyStateEngine.unload();
                        this.smartBuyStateEngine = null
                    }
                    MS.Entertainment.UI.Controls.ImmersiveVideoHero.prototype.unload.call(this)
                }, _setControlVisibilityOverrides: function _setControlVisibilityOverrides() {
                    if (MS.Entertainment.Utilities.isVideoApp2)
                        this.displayActionButtons = true;
                    else
                        this.displayRating = true
                }, _setControlFocusDirectionOverrides: function _setControlFocusDirectionOverrides() {
                    this._heroViewMoreSelector = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.movieHeroViewMore;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var criticReviewsVisible = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.rottenTomatoes) && this.heroMediaItem && this.heroMediaItem.criticReview && this.heroMediaItem.criticReview.reviewScore > 0);
                    var castAndCrewVisible = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.castAndCrew) && this.heroMediaItem && this.heroMediaItem.contributors && this.heroMediaItem.contributors.length > 0);
                    if (criticReviewsVisible) {
                        this._rightOfSmartBuyButtons = MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel.cssSelectors.rottenTomatoesOverview;
                        this._rightOfOverviewViewMore = MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel.cssSelectors.rottenTomatoesViewMore
                    }
                    else if (castAndCrewVisible) {
                        this._rightOfSmartBuyButtons = MS.Entertainment.UI.Controls.CastAndCrewList.cssSelectors.castAndCrewMember;
                        this._rightOfOverviewViewMore = MS.Entertainment.UI.Controls.CastAndCrewList.cssSelectors.castAndCrewViewMore
                    }
                    else {
                        this._rightOfSmartBuyButtons = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related;
                        this._rightOfOverviewViewMore = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related
                    }
                    MS.Entertainment.UI.Controls.ImmersiveVideoHero.prototype._setControlFocusDirectionOverrides.call(this)
                }
        }, {
            displayRatingsButton: false, mediaTypeClassName: MS.Entertainment.UI.Controls.VideoHeroMediaTypes.movie, smartBuyStateEngine: null
        })})
})()
