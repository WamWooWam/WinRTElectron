/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        VideoHeroMediaTypes: {
            tv: "mediatype-tvSeries", movie: "mediatype-movie"
        }, ImmersiveVideoHero: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", null, function immersiveVideoHero() {
                this.uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState)
            }, {
                _eventHandler: null, uiStateService: null, _navigationEventHandlers: null, initialize: function initialize() {
                        MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.initialize.call(this);
                        this.displayHeroContent = MS.Entertainment.UI.NetworkStatusService.isOnline()
                    }, freeze: function immersiveVideoHero_freeze() {
                        MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.freeze.call(this)
                    }, thaw: function immersiveVideoHero_thaw() {
                        MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.thaw.call(this)
                    }, unload: function unload() {
                        if (this._navigationEventHandlers) {
                            this._navigationEventHandlers.cancel();
                            this._navigationEventHandlers = null
                        }
                        if (this.dataContext.dispose)
                            this.dataContext.dispose();
                        MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.unload.call(this)
                    }, _heroImageMediaItemChanged: function _heroImageMediaItemChanged() {
                        if (this.heroImageMediaItem && this.heroImageMediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries)
                            return;
                        this.heroMediaItem = this.heroImageMediaItem;
                        var promise;
                        if (this.heroImageMediaItem.hydrate)
                            promise = this.heroImageMediaItem.hydrate();
                        else
                            promise = WinJS.Promise.as();
                        promise.done(function onMediaItemHydrate() {
                            if (this.domElement)
                                WinJS.Utilities.addClass(this.domElement, this.mediaTypeClassName)
                        }.bind(this))
                    }, heroImageMediaItem: {get: function get() {
                            var heroMediaItem = null;
                            if (this.dataContext)
                                heroMediaItem = this.dataContext.heroImageMediaItem ? this.dataContext.heroImageMediaItem : this.dataContext.mediaItem;
                            return heroMediaItem
                        }}
            }, {
                heroMediaItem: null, mediaTypeClassName: String.empty, displayHeroContent: true, displayRating: false, displayReview: false, displayActionButtons: false
            }, {
                cssSelectors: {
                    noOp: ".currentPage :focus", related: ".currentPage .related .template-fullBleedThumbnail", movieHeroViewMore: ".currentPage .movieOverviewFrame .viewMoreRow .template-moreButton .win-focusable", tvHeroViewMore: ".currentPage .viewMoreRow.overview .template-moreButton .win-focusable", smartBuyButton: ".currentPage .contextButtonGroup > .contextButtonContainer:not(.removeFromDisplay) .iconButton,.currentPage .contextButtonGroup > .contextButtonContainer:not(.removeFromDisplay) .control-modifierActionButton,.currentPage .contextButtonGroup .contextButtonContainer .win-ratingpicker-ratebutton"
                }, forceShowAnimationOnLoadOrTimeout: MS.Entertainment.Utilities.weakElementBindingInitializer(function forceShowAnimationOnLoadOrTimeout(sourceValue, targetElement, elementProperty) {
                        if (sourceValue && !(Array.isArray(sourceValue) && sourceValue.length === 0)) {
                            MS.Entertainment.Utilities.showElement(targetElement);
                            if (targetElement.showTimeout) {
                                targetElement.showTimeout.cancel();
                                targetElement.showTimeout = null
                            }
                        }
                        else if (!targetElement.showTimeout)
                            targetElement.showTimeout = WinJS.Promise.timeout(1000).then(function showElementTimeout() {
                                MS.Entertainment.Utilities.showElement(this);
                                this.showTimeout.cancel();
                                this.showTimeout = null
                            }.bind(targetElement))
                    })
            })
    })
})()
