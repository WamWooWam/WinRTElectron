/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels.Video");
    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
    MS.Entertainment.ViewModels.Video.assert(MS.Entertainment.appMode !== undefined, "File was loaded in startup path, this make slow down perf since we are creating a config object");
    if (MS.Entertainment.Utilities.isVideoApp1)
        WinJS.Namespace.define("MS.Entertainment.ViewModels.Video", {ReviewTemplates: {
                rottenTomatoesOverviewControl: "/Components/Immersive/Video/MovieImmersiveTemplates.html#rottenTomatoesOverviewTemplate", rottenTomatoesReviewControl: "/Components/Immersive/Video/MovieImmersiveTemplates.html#rottenTomatoesReviewTemplate", rottenTomatoesImmersivePanel: "/Components/Immersive/Video/MovieImmersiveTemplates.html#rottenTomatoesImmersivePanelTemplate"
            }});
    else
        WinJS.Namespace.define("MS.Entertainment.ViewModels.Video", {ReviewTemplates: {
                rottenTomatoesOverviewControl: "/Components/Video2/MovieDetailsPage.html#rottenTomatoesOverviewTemplate", rottenTomatoesReviewControl: "/Components/Video2/MovieDetailsPage.html#rottenTomatoesReviewTemplate", rottenTomatoesImmersivePanel: "/Components/Video2/MovieDetailsPage.html#rottenTomatoesImmersivePanelTemplate"
            }});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {RottenTomatoesOverviewControl: MS.Entertainment.UI.Framework.defineUserControl(MS.Entertainment.ViewModels.Video.ReviewTemplates.rottenTomatoesOverviewControl, function RottenTomatoesOverviewControl(){}, {
            controlName: "RottenTomatoesOverviewControl", allowAnimations: false, onClickWithContext: null, initialize: function initalize() {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    this.visible = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.rottenTomatoes) && this.mediaItem && this.mediaItem.criticReview && this.mediaItem.criticReview.reviewScore > 0);
                    if (!this.visible)
                        return;
                    this._setControlFocusability();
                    this._setStyle();
                    this._setTomatoIcon();
                    this.onClickWithContext = WinJS.Utilities.markSupportedForProcessing(this._onClick.bind(this))
                }, _makeFocusable: function _makeFocusable(control) {
                    if (control) {
                        WinJS.Utilities.addClass(control, "acc-keyboardFocusTarget");
                        WinJS.Utilities.addClass(control, "win-focusable")
                    }
                }, _setControlFocusability: function _setControlFocusability() {
                    if (MS.Entertainment.Utilities.isApp2)
                        this._makeFocusable(this._overviewControl);
                    else
                        this._makeFocusable(this._subtitle)
                }, _setTomatoIcon: function _setTomatoIcon() {
                    if (this.mediaItem && this.mediaItem.criticReview && this.mediaItem.criticReview.reviewScore >= 0)
                        if (this.mediaItem.criticReview.reviewScore >= 75 && this.mediaItem.criticReview.reviewScoreCount >= 40)
                            this.tomatoIcon = MS.Entertainment.UI.Controls.RottenTomatoesOverviewControl.iconCertifiedFresh;
                        else if (this.mediaItem.criticReview.reviewScore >= 60)
                            this.tomatoIcon = MS.Entertainment.UI.Controls.RottenTomatoesOverviewControl.iconFresh;
                        else
                            this.tomatoIcon = MS.Entertainment.UI.Controls.RottenTomatoesOverviewControl.iconRotten;
                    if (this._tomatoImageElement)
                        if (this.tomatoIcon)
                            this._tomatoImageElement.src = "ms-appx://" + this.tomatoIcon;
                        else
                            MS.Entertainment.Utilities.hideElement(this._tomatoImageElement)
                }, _setStyle: function _setStyle() {
                    if (this.mediaItem && this.mediaItem.criticReview && this.mediaItem.criticReview.reviewScore >= 0 && this._scorePercentageProgressBar)
                        if (this.mediaItem.criticReview.reviewScore >= 60) {
                            WinJS.Utilities.removeClass(this._scorePercentageProgressBar, "state-scoreRotten");
                            WinJS.Utilities.addClass(this._scorePercentageProgressBar, "state-scoreFresh")
                        }
                        else {
                            WinJS.Utilities.removeClass(this._scorePercentageProgressBar, "state-scoreFresh");
                            WinJS.Utilities.addClass(this._scorePercentageProgressBar, "state-scoreRotten")
                        }
                }, _onKeyDown: function _onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space || event.keyCode === WinJS.Utilities.Key.invokeButton)
                        this._onClick()
                }, _onClick: function onClick() {
                    var focusableElement = MS.Entertainment.Utilities.isVideoApp2 && this.domElement && this.domElement.querySelector(".win-focusable");
                    if (focusableElement)
                        MS.Entertainment.UI.Framework.focusElement(focusableElement);
                    if (this.mediaItem && this.mediaItem.criticReview && this.mediaItem.criticReview.url && MS.Entertainment.Utilities.verifyUrl(this.mediaItem.criticReview.url))
                        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(this.mediaItem.criticReview.url))
                }
        }, {
            tomatoIcon: null, visible: false
        }, {
            iconFresh: MS.Entertainment.UI.Framework.lazyDefine(function() {
                return "/images/ThirdParty/ico_RottenTomatoes_Fresh." + MS.Entertainment.Utilities.getPackageImageFileExtension()
            }), iconRotten: MS.Entertainment.UI.Framework.lazyDefine(function() {
                    return "/images/ThirdParty/ico_RottenTomatoes_Rotten." + MS.Entertainment.Utilities.getPackageImageFileExtension()
                }), iconCertifiedFresh: MS.Entertainment.UI.Framework.lazyDefine(function() {
                    return "/images/ThirdParty/ico_RottenTomatoes_CertifiedFresh." + MS.Entertainment.Utilities.getPackageImageFileExtension()
                })
        })}),
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {RottenTomatoesReviewControl: MS.Entertainment.UI.Framework.defineUserControl(MS.Entertainment.ViewModels.Video.ReviewTemplates.rottenTomatoesReviewControl, function RottenTomatoesReviewControl(){}, {
            controlName: "RottenTomatoesReviewControl", allowAnimations: false, onClickWithContext: null, initialize: function initalize() {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    this.visible = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.rottenTomatoes) && this.criticReview && this.criticReview.criticName && this.criticReview.publication && this.criticReview.scoreDescription && this.criticReview.scoreDescription !== "none");
                    if (!this.visible)
                        return;
                    this._setTomatoIcon();
                    this.onClickWithContext = WinJS.Utilities.markSupportedForProcessing(this._onClick.bind(this))
                }, _setTomatoIcon: function _setTomatoIcon() {
                    switch (this.criticReview.scoreDescription) {
                        case"fresh":
                            this.tomatoIcon = MS.Entertainment.UI.Controls.RottenTomatoesOverviewControl.iconFresh;
                            break;
                        case"rotten":
                            this.tomatoIcon = MS.Entertainment.UI.Controls.RottenTomatoesOverviewControl.iconRotten;
                            break;
                        case"none":
                            this.tomatoIcon = null;
                            break;
                        default:
                            MS.Entertainment.Framework.fail("Unknown RottenTomatos ScoreDescription: " + this.criticReview.scoreDescription)
                    }
                    if (this._tomatoImageElement)
                        if (this.tomatoIcon)
                            this._tomatoImageElement.src = "ms-appx://" + this.tomatoIcon;
                        else
                            MS.Entertainment.Utilities.hideElement(this._tomatoImageElement)
                }, _onKeyDown: function onKeyDown() {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space || event.keyCode === WinJS.Utilities.Key.invokeButton)
                        this._onClick()
                }, _onClick: function onClick() {
                    var focusableElement = MS.Entertainment.Utilities.isVideoApp2 && this.domElement && this.domElement.querySelector(".win-focusable");
                    if (focusableElement)
                        MS.Entertainment.UI.Framework.focusElement(focusableElement);
                    if (this.criticReview && this.criticReview.publicationUrl && MS.Entertainment.Utilities.verifyUrl(this.criticReview.publicationUrl))
                        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(this.criticReview.publicationUrl))
                }
        }, {
            tomatoIcon: null, visible: true
        })}),
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {RottenTomatoesImmersivePanel: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", MS.Entertainment.ViewModels.Video.ReviewTemplates.rottenTomatoesImmersivePanel, function rottenTomatoesImmersivePanelConstructor() {
            if (this.isViewMore)
                this._initializeFocusBind = WinJS.Binding.bind(this, {criticListView: function setFirstTimeRenderBind() {
                        if (this.criticListView)
                            this._focusHandler(true)
                    }.bind(this)})
        }, {
            keyboardNavigationManager: null, _focusInitialized: false, _focusEventHandlers: null, _initializeFocusBind: null, isViewMore: false, initialize: function initialize() {
                    this._focusEventHandlers = [MS.Entertainment.Utilities.addEvents(this, {focusin: this._focusHandler.bind(this)})];
                    if (MS.Entertainment.Utilities.isApp1)
                        this.keyboardNavigationManager = new MS.Entertainment.Framework.VerticalKeyboardNavigationManager(this.domElement, null, true);
                    else
                        this.criticListView.keyboardNavigable = true;
                    var promise = this.dataContext.previousSignal ? WinJS.Binding.unwrap(this.dataContext.previousSignal).promise : WinJS.Promise.wrap();
                    promise.done(function showFrame() {
                        this.visible = !!this.dataContext.mediaItem.criticReview.reviewScore;
                        if (this.dataContext.visibleSignal)
                            WinJS.Binding.unwrap(this.dataContext.visibleSignal).complete()
                    }.bind(this))
                }, unload: function unload() {
                    if (this._focusEventHandlers) {
                        for (var focusEventHandler in this._focusEventHandlers)
                            this._focusEventHandlers[focusEventHandler].cancel();
                        this._focusEventHandlers = null
                    }
                    if (this._initializeFocusBind) {
                        this._initializeFocusBind.cancel();
                        this._initializeFocusBind = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.unload.call(this)
                }, _scrollToTop: function _scrollToTop() {
                    if (this.domElement)
                        this.domElement.scrollTop = 0
                }, _focusHandler: function _focusHandler(event) {
                    var force = event === true;
                    WinJS.Promise.timeout(1).done(function delayFocusItem() {
                        if (!this._focusInitialized || force) {
                            var querySelectorString = ".contentRow .win-focusable";
                            var firstListItem = this.rottenTomatoesOverview.domElement.querySelector(querySelectorString);
                            if (firstListItem)
                                if (MS.Entertainment.Utilities.isApp1 && !this.isViewMore)
                                    this.keyboardNavigationManager.setFocusedItem(firstListItem, true);
                                else if (this.isViewMore)
                                    MS.Entertainment.UI.Framework.focusElement(firstListItem);
                            if (this._focusInitialized)
                                return;
                            if (this.rottenTomatoesOverview)
                                this._focusEventHandlers.push(MS.Entertainment.Utilities.addEvents(this.rottenTomatoesOverview, {focusin: this._scrollToTop.bind(this)}));
                            this.criticListView.domElement.tabIndex = -1;
                            this._setControlFocusDirectionOverrides();
                            if (MS.Entertainment.UI.Framework.focusedItemInContainer(this.domElement))
                                this._focusInitialized = true
                        }
                    }.bind(this))
                }, _setControlFocusDirectionOverrides: function _setControlFocusDirectionOverrides() {
                    if (this.isViewMore)
                        return;
                    var rightOfCriticReviews = null;
                    var rightOfCriticReviewsViewMore = null;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var castAndCrewVisible = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.castAndCrew) && this.dataContext.mediaItem && this.dataContext.mediaItem.contributors && this.dataContext.mediaItem.contributors.length > 0);
                    if (castAndCrewVisible) {
                        rightOfCriticReviews = MS.Entertainment.UI.Controls.CastAndCrewList.cssSelectors.castAndCrewMember;
                        rightOfCriticReviewsViewMore = MS.Entertainment.UI.Controls.CastAndCrewList.cssSelectors.castAndCrewViewMore
                    }
                    else {
                        rightOfCriticReviews = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related;
                        rightOfCriticReviewsViewMore = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related
                    }
                    var belowCriticReviews = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp;
                    if (this.dataContext && this.dataContext.frame && !this.dataContext.frame.hideViewMoreIfEnoughSpace)
                        belowCriticReviews = MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel.cssSelectors.rottenTomatoesViewMore;
                    var middleCriticReviewFocusDirectionMap = JSON.stringify({
                            left: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.smartBuyButton, right: rightOfCriticReviews
                        });
                    var topCriticReviewFocusDirectionMap = JSON.stringify({
                            left: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.smartBuyButton, right: rightOfCriticReviews, up: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp
                        });
                    var bottomCriticReviewFocusDirectionMap = JSON.stringify({
                            left: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.smartBuyButton, right: rightOfCriticReviews, down: belowCriticReviews
                        });
                    var bottomCriticReviewItemClass = "bottomCriticReviewItem";
                    var criticReviewItems = this.domElement.querySelectorAll(MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel.cssSelectors.rottenTomatoesOverview);
                    if (criticReviewItems && criticReviewItems.length > 0) {
                        if (criticReviewItems.length === 1) {
                            var onlyCriticReviewFocusDirectionMap = JSON.stringify({
                                    left: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.smartBuyButton, right: rightOfCriticReviews, down: belowCriticReviews, up: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp
                                });
                            criticReviewItems[0].setAttribute("data-win-focus", onlyCriticReviewFocusDirectionMap);
                            WinJS.Utilities.addClass(criticReviewItems[0], bottomCriticReviewItemClass)
                        }
                        else {
                            criticReviewItems[0].setAttribute("data-win-focus", topCriticReviewFocusDirectionMap);
                            WinJS.Utilities.removeClass(criticReviewItems[0], bottomCriticReviewItemClass);
                            criticReviewItems[criticReviewItems.length - 1].setAttribute("data-win-focus", bottomCriticReviewFocusDirectionMap);
                            WinJS.Utilities.addClass(criticReviewItems[criticReviewItems.length - 1], bottomCriticReviewItemClass)
                        }
                        for (var i = 1; i < criticReviewItems.length - 1; i++) {
                            criticReviewItems[i].setAttribute("data-win-focus", middleCriticReviewFocusDirectionMap);
                            WinJS.Utilities.removeClass(criticReviewItems[i], bottomCriticReviewItemClass)
                        }
                    }
                    var bottomCriticReviewItemSelector = ".currentPage ." + bottomCriticReviewItemClass;
                    var criticReviewViewMoreItemFocusDirectionMap = JSON.stringify({
                            left: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.movieHeroViewMore, right: rightOfCriticReviewsViewMore, down: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp, up: bottomCriticReviewItemSelector
                        });
                    var criticReviewViewMore = document.querySelector(MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel.cssSelectors.rottenTomatoesViewMore);
                    if (criticReviewViewMore)
                        criticReviewViewMore.setAttribute("data-win-focus", criticReviewViewMoreItemFocusDirectionMap)
                }
        }, {
            visible: false, criticListView: null
        }, {cssSelectors: {
                rottenTomatoesViewMore: ".currentPage .viewMoreRow.reviews .inlineCaretButton", rottenTomatoesOverview: ".currentPage .rottenTomatoesPanel .win-focusable"
            }})})
})();
(function runCriticReviewVoiceMixins() {
    if (WinJS.Utilities.getMember("MS.Entertainment.UI.App2.VoicePropertyMixin")) {
        WinJS.Class.mix(MS.Entertainment.UI.Controls.RottenTomatoesOverviewControl, MS.Entertainment.UI.App2.VoicePropertyMixin);
        WinJS.Class.mix(MS.Entertainment.UI.Controls.RottenTomatoesReviewControl, MS.Entertainment.UI.App2.VoicePropertyMixin)
    }
})()
