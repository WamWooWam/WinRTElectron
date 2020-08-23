/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/framework/data/queries/spotlightqueries.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function() {
    "use strict";
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        SpotlightQueryType: {
            SpotlightMusic: "spotlight", SpotlightVideo: "spotlight"
        }, recommendationBrowseFields: [MS.Entertainment.Data.Query.edsFields.allTimeAverageRating, MS.Entertainment.Data.Query.edsFields.explanations, MS.Entertainment.Data.Query.edsFields.id, MS.Entertainment.Data.Query.edsFields.images, MS.Entertainment.Data.Query.edsFields.mediaGroup, MS.Entertainment.Data.Query.edsFields.mediaItemType, MS.Entertainment.Data.Query.edsFields.name, MS.Entertainment.Data.Query.edsFields.vuiDisplayName, MS.Entertainment.Data.Query.edsFields.zuneId], createEditorialHeaders: function createEditorialHeaders() {
                var architectureStringMap = {
                        0: "x86", 5: "arm", 9: "x64"
                    };
                var currentPackage = Windows.ApplicationModel.Package.current;
                var architecture = currentPackage.id.architecture;
                var mappedArchitecture = architectureStringMap[architecture];
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (configurationManager.service.targetedProgrammingArchitecture)
                    mappedArchitecture = configurationManager.service.targetedProgrammingArchitecture;
                var spotlightHeaders = {
                        "User-Agent": configurationManager.service.targetedProgrammingClientOs, "X-Application": MS.Entertainment.Utilities.isVideoApp ? "Video" : "Music", "X-Membership-Level": configurationManager.service.lastSignedInUserMembership || "Free", "X-Parent-Control": configurationManager.service.lastSignedInUserParentControl.toString(), "X-Client-Version": configurationManager.service.targetedProgrammingClientVersion, "X-Client-Architecture": mappedArchitecture
                    };
                if (MS.Entertainment.Utilities.isMusicApp)
                    spotlightHeaders["X-Music-Subscription"] = configurationManager.service.lastSignedInUserSubscription.toString();
                return spotlightHeaders
            }
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {spotlightContentQuery: MSE.derive(MSE.Data.ServiceWrapperQuery, null, {
            spotlight: String.empty, getResourceEndpointID: function getResourceEndpointID() {
                    return MS.Entertainment.Endpoint.id.seid_CdfXboxLiveDotCom
                }, createHeaders: function createHeaders() {
                    return MS.Entertainment.Data.Query.createEditorialHeaders()
                }, createParameters: function createParameters() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (configurationManager.service.enableTimeTravel)
                        return {StartDate: configurationManager.service.timeTravelStartDate};
                    else
                        return null
                }, getSpotlightFeedVersionSubPath: function getSpotlightFeedVersionSubPath() {
                    return String.empty
                }, createResourceURI: function() {
                    return this.getResourceEndpoint() + this.getSpotlightFeedVersionSubPath() + this.spotlight
                }, pluralizers: ["Content/SlotGroup", "SlotGroup/Slot"], resultAugmentation: MSE.Data.Augmenter.Spotlight.SpotlightContent
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {MusicMediaDiscoverySpotlightQuery: MSE.derive(MSE.Data.Query.spotlightContentQuery, null, {
            serviceType: MS.Entertainment.Data.ServiceWrapperQuery.ServiceTypes.json, spotlight: MSE.Data.Query.SpotlightQueryType.SpotlightMusic, getResourceEndpointID: function getResourceEndpointID() {
                    return MS.Entertainment.Endpoint.id.seid_MediaDiscovery
                }, getSpotlightFeedVersionSubPath: function getSpotlightFeedVersionSubPath() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    return configurationManager.service.musicAppSpotlightVersion
                }, createResourceURI: function createResourceURI() {
                    return MS.Entertainment.Utilities.UriFactory.create(this.getResourceEndpointID(), this.getSpotlightFeedVersionSubPath() + "spotlight")
                }
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {videoSpotlightQuery: MSE.derive(MSE.Data.Query.spotlightContentQuery, null, {
            spotlight: MSE.Data.Query.SpotlightQueryType.SpotlightVideo, getResourceEndpointID: function getResourceEndpointID() {
                    return MS.Entertainment.Endpoint.id.seid_MediaDiscovery
                }, getResourceUriSuffix: function getResourceUriSuffix() {
                    var serviceConfig = (new Microsoft.Entertainment.Configuration.ConfigurationManager).service;
                    return serviceConfig.videoAppSpotlightSuffix
                }, createResourceURI: function createResourceURI() {
                    var uri;
                    var abTestingConfig = (new Microsoft.Entertainment.Configuration.ConfigurationManager).abTestingOverrides;
                    if (abTestingConfig && abTestingConfig.videoSpotlightFeedUrl)
                        uri = abTestingConfig.videoSpotlightFeedUrl;
                    else
                        uri = MS.Entertainment.Utilities.UriFactory.create(this.getResourceEndpoint(), this.getResourceUriSuffix());
                    return uri
                }, pluralizers: [MSE.Data.Query.marketplaceWrapperQuery.slotGroupPluralizer, MSE.Data.Query.marketplaceWrapperQuery.slotPluralizer], resultAugmentation: MSE.Data.Augmenter.Spotlight.VideoSpotlightContent
        })});
    var xuidTokenTable = {};
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {EdsVideoRecommendations: MSE.derive(MSE.Data.Query.EDSDeviceQuery, null, {
            chunkSize: 20, requestFields: MS.Entertainment.Data.Query.recommendationBrowseFields, useApp2UserIfAvailable: true, includeContentRestrictionHeader: true, enabledImpressionGuid: true, queryType: "videoRecommendations", createResourceURI: function() {
                    var configurationManager;
                    var currentUserXuid;
                    var uri = this.getResourceEndpoint(MS.Entertainment.Data.Query.edsEndpointType.recommendations);
                    var contentRestrictionSuffixString = String.empty;
                    if (MS.Entertainment.Utilities.isVideoApp2) {
                        configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        currentUserXuid = configurationManager.service.lastSignedInUserXuid || 0;
                        if (!xuidTokenTable[currentUserXuid])
                            xuidTokenTable[currentUserXuid] = MS.Entertainment.Utilities.getSessionUniqueInteger() + 1;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService))
                            contentRestrictionSuffixString = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionService).getUniqueBrowseFilterRestrictionValue();
                        uri = MS.Entertainment.Utilities.UriFactory.appendQuery(uri, {random: xuidTokenTable[currentUserXuid] + contentRestrictionSuffixString})
                    }
                    return uri
                }, createParameters: function createParameters() {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var movieMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                    var types = [];
                    var typeArray = null;
                    if (movieMarketplaceEnabled && (!this.desiredMediaItemTypes || this.desiredMediaItemTypes === "all" || this.desiredMediaItemTypes === "movies"))
                        types.push(MS.Entertainment.Data.Query.edsMediaType.movie);
                    if (tvMarketplaceEnabled && (!this.desiredMediaItemTypes || this.desiredMediaItemTypes === "all" || this.desiredMediaItemTypes === "tv"))
                        types.push(MS.Entertainment.Data.Query.edsMediaType.tvSeries);
                    typeArray = MS.Entertainment.Data.Query.edsArray(types);
                    return {
                            desiredMediaItemTypes: typeArray, firstPartyOnly: true
                        }
                }, resultAugmentation: MSE.Data.Augmenter.Marketplace.EdsRecommendedVideoList, useCache: false
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        MusicUpdatePanel: MSE.deferredDerive(MS.Entertainment.Data.ServiceWrapperQuery, null, {
            chunked: false, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.IntroPanelResult, createResourceURI: function() {
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_WinPhoneXboxDotCom, "x8/feeds/1.1/Upgrade-Music")
                }, pluralizers: ["BodyText/p"]
        }), VideoUpdatePanel: MS.Entertainment.deferredDerive(MS.Entertainment.Data.ServiceWrapperQuery, null, {
                chunked: false, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.IntroPanelResult, createResourceURI: function() {
                        return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_WinPhoneXboxDotCom, "x8/feeds/1.1/Upgrade-Video")
                    }, pluralizers: ["BodyText/p"]
            })
    })
})()
})();
/* >>>>>>/controls/carousel.js:119 */
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
                var CarouselJumpButton = (function() {
                        function CarouselJumpButton(position, totalCount) {
                            this.position = position;
                            this.totalCount = totalCount;
                            this.checked = false
                        }
                        Object.defineProperty(CarouselJumpButton.prototype, "position", {
                            get: function() {
                                return this._position
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(CarouselJumpButton.prototype, "totalCount", {
                            get: function() {
                                return this._totalCount
                            }, enumerable: true, configurable: true
                        });
                        return CarouselJumpButton
                    })();
                var Carousel = (function(_super) {
                        __extends(Carousel, _super);
                        function Carousel(element, options) {
                            var _this = this;
                            _super.call(this, element, options);
                            this._isUpdating = false;
                            this._autoCycleCarousel = false;
                            this._frozen = false;
                            this._currentPageNumber = 0;
                            this._jumpButtons = new MS.Entertainment.ObservableArray;
                            UI.Framework.processDeclarativeControlContainer(this);
                            this._pageChangedHandler = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {pagevisibilitychanged: function() {
                                    return _this._refreshJumpButtons()
                                }})
                        }
                        Object.defineProperty(Carousel.prototype, "_cycleDelayMs", {
                            get: function() {
                                if (!this._uiSettings)
                                    this._uiSettings = new Windows.UI.ViewManagement.UISettings;
                                return this._uiSettings.messageDuration * 1000
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(Carousel.prototype, "currentFlipViewPage", {
                            get: function() {
                                return this._flipView.currentPage
                            }, set: function(value) {
                                    this._flipView.currentPage = value;
                                    this._refreshJumpButtons()
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(Carousel.prototype, "dataSource", {
                            get: function() {
                                return this._dataSource
                            }, set: function(value) {
                                    this._dataSource = value;
                                    this._dataSourceChanged()
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(Carousel.prototype, "jumpButtons", {
                            get: function() {
                                return this._jumpButtons
                            }, enumerable: true, configurable: true
                        });
                        Carousel.prototype.freeze = function() {
                            _super.prototype.freeze.call(this);
                            this.stopCarouselTimer();
                            this._frozen = true
                        };
                        Carousel.prototype.thaw = function() {
                            _super.prototype.thaw.call(this);
                            this._frozen = false;
                            this.startCarouselTimer()
                        };
                        Carousel.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            this.stopCarouselTimer();
                            if (this._firstTimeRenderHandlers) {
                                this._firstTimeRenderHandlers.cancel();
                                this._firstTimeRenderHandlers = null
                            }
                            if (this._pageChangedHandler) {
                                this._pageChangedHandler.cancel();
                                this._pageChangedHandler = null
                            }
                        };
                        Carousel.prototype._findIndexFromJumpButton = function(element) {
                            var index = -1;
                            var children = (this._jumpButtonList && this._jumpButtonList.domElement && this._jumpButtonList.domElement.children);
                            if (children)
                                for (var i = 0; i < children.length; i++)
                                    if (children[i] === element || children[i].contains(element)) {
                                        index = i;
                                        break
                                    }
                            return index
                        };
                        Carousel.prototype._dataSourceChanged = function() {
                            var _this = this;
                            this._isUpdating = true;
                            this._flipView.itemDataSource = null;
                            this.jumpButtons.clear();
                            if (this.dataSource) {
                                this._flipView.itemDataSource = new WinJS.Binding.List(this.dataSource).dataSource;
                                var index = 0;
                                this.dataSource.forEach(function(item) {
                                    var result = WinJS.Binding.as(new CarouselJumpButton(index + 1, _this.dataSource.length));
                                    ++index;
                                    _this.jumpButtons.push(result)
                                });
                                this._jumpButtonList.dataSource = this.jumpButtons;
                                this._firstTimeRenderHandlers = UI.Framework.addEventHandlers(this.domElement, {pagevisibilitychanged: function() {
                                        _this.startCarouselTimer();
                                        _this._firstTimeRenderHandlers.cancel();
                                        _this._firstTimeRenderHandlers = null
                                    }})
                            }
                        };
                        Carousel.prototype._cycleCarousel = function() {
                            var _this = this;
                            if (!this._unloaded && !this._frozen)
                                this._flipView.count().done(function(count) {
                                    if (!_this._unloaded && !_this._frozen && _this._autoCycleCarousel) {
                                        _this._isUpdating = true;
                                        if (_this._currentPageNumber < count - 1)
                                            ++_this._currentPageNumber;
                                        else
                                            _this._currentPageNumber = 0;
                                        _this.currentFlipViewPage = _this._currentPageNumber;
                                        _this.startCarouselTimer()
                                    }
                                }, function(error) {
                                    Controls.fail("Error occurred while getting the item count from the carousel: " + (error && error.message))
                                })
                        };
                        Carousel.prototype.startCarouselTimer = function() {
                            var _this = this;
                            if (!this._unloaded && !this._frozen) {
                                this.stopCarouselTimer();
                                this._autoCycleCarousel = true;
                                this._cycleTimer = WinJS.Promise.timeout(this._cycleDelayMs);
                                this._cycleTimer.done(function() {
                                    return _this._cycleCarousel()
                                }, function(error) {
                                    Controls.assert(WinJS.Promise.isCanceledError(error), "Unexpected error occurred in carousel timer.")
                                })
                            }
                        };
                        Carousel.prototype.stopCarouselTimer = function() {
                            this._autoCycleCarousel = false;
                            if (this._cycleTimer) {
                                this._cycleTimer.cancel();
                                this._cycleTimer = null
                            }
                        };
                        Carousel.prototype._onKeyDown = function(event) {
                            if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                                this._onInvoke()
                        };
                        Carousel.prototype._onInvoke = function() {
                            this._flipView.forceLayout();
                            this.stopCarouselTimer()
                        };
                        Carousel.prototype._onPageSelected = function() {
                            this._suppressAutomaticUnloadingForFlipViewElements();
                            if (this._isUpdating)
                                this._isUpdating = false;
                            else
                                this.stopCarouselTimer();
                            this._currentPageNumber = this.currentFlipViewPage;
                            this._refreshJumpButtons()
                        };
                        Carousel.prototype._refreshJumpButtons = function() {
                            for (var i = 0; i < this._jumpButtons.length; i++)
                                this._jumpButtons.item(i).checked = (i === this._currentPageNumber)
                        };
                        Carousel.prototype._suppressAutomaticUnloadingForFlipViewElements = function() {
                            if (this._unloaded || !this._flipView || !this._flipView.element)
                                return;
                            var winItems = WinJS.Utilities.query(".win-item", this._flipView.element);
                            winItems.forEach(function(item) {
                                var firstChild = item.firstElementChild;
                                if (!firstChild)
                                    return;
                                firstChild.suppressUnload = true
                            })
                        };
                        Carousel.isDeclarativeControlContainer = true;
                        return Carousel
                    })(UI.Framework.UserControl);
                Controls.Carousel = Carousel
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.Carousel)
})();
/* >>>>>>/viewmodels/music/heromodule.js:334 */
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
            var HeroModuleAutomationIds = (function() {
                    function HeroModuleAutomationIds(){}
                    HeroModuleAutomationIds.MEDIA_DETAILS_AUTOMATION_ID = "HeroModule_MediaDetailsAction";
                    HeroModuleAutomationIds.FLEX_HUB_ITEM_AUTOMATION_ID = "HeroModule_FlexHubNavigateAction";
                    HeroModuleAutomationIds.MEDIA_POPOVER_AUTOMATION_ID = "HeroModule_MediaPopoverAction";
                    HeroModuleAutomationIds.WEB_ITEM_AUTOMATION_ID = "HeroModule_WebAction";
                    return HeroModuleAutomationIds
                })();
            ViewModels.HeroModuleAutomationIds = HeroModuleAutomationIds;
            var HeroModule = (function(_super) {
                    __extends(HeroModule, _super);
                    function HeroModule() {
                        _super.call(this, "heroModule");
                        this._heroQueryWatcher = null
                    }
                    HeroModule.prototype.dispose = function() {
                        this._heroQueryWatcher = null;
                        _super.prototype.dispose.call(this)
                    };
                    HeroModule.prototype.getItems = function() {
                        var _this = this;
                        if (this._getItemsPromise)
                            return this._getItemsPromise;
                        var query = new MS.Entertainment.Data.Query.MusicMediaDiscoverySpotlightQuery;
                        query.queryId = MS.Entertainment.UI.Monikers.homeSpotlight;
                        query.chunkSize = 5;
                        query.chunked = false;
                        this._queryWatcher.registerQuery(query);
                        this._getItemsPromise = query.execute().then(function(queryResult) {
                            query.dispose();
                            return queryResult.result.itemsArray || []
                        }, function(error) {
                            query.dispose();
                            return _this.wrapModuleError(error, "Failed to get spotlight media items.")
                        }).then(function(resultItems) {
                            return {items: resultItems.map(_this._wrapItem)}
                        });
                        return this._getItemsPromise
                    };
                    HeroModule.prototype._createHeaderAction = function() {
                        return null
                    };
                    Object.defineProperty(HeroModule.prototype, "_queryWatcher", {
                        get: function() {
                            if (!this._heroQueryWatcher)
                                this._heroQueryWatcher = new MS.Entertainment.Framework.QueryWatcher("HeroModule");
                            return this._heroQueryWatcher
                        }, enumerable: true, configurable: true
                    });
                    HeroModule.prototype._wrapItem = function(spotlightItem) {
                        var actionId = null;
                        var automationId = null;
                        var actionParameter = null;
                        var mediaItem = spotlightItem;
                        if (spotlightItem.clone)
                            mediaItem = spotlightItem.clone();
                        MS.Entertainment.UI.assert(spotlightItem.type, "Expected item type to be defined.");
                        if (spotlightItem.type)
                            switch (spotlightItem.type) {
                                case MS.Entertainment.Data.Augmenter.Spotlight.ActionType.Web:
                                    actionId = MS.Entertainment.UI.Actions.ActionIdentifiers.externalAdNavigate;
                                    automationId = HeroModuleAutomationIds.WEB_ITEM_AUTOMATION_ID;
                                    actionParameter = {link: spotlightItem.actionTarget};
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Album:
                                    actionId = MS.Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate;
                                    automationId = HeroModuleAutomationIds.MEDIA_DETAILS_AUTOMATION_ID;
                                    actionParameter = {
                                        data: mediaItem, location: MS.Entertainment.Data.ItemLocation.marketplace, isFromSpotlight: true
                                    };
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Artist:
                                    actionId = MS.Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate;
                                    automationId = HeroModuleAutomationIds.MEDIA_DETAILS_AUTOMATION_ID;
                                    actionParameter = {
                                        data: mediaItem, location: MS.Entertainment.Data.ItemLocation.marketplace
                                    };
                                    break;
                                default:
                                    MS.Entertainment.UI.fail("Unexpected mediaType!");
                                    break
                            }
                        return {
                                actionId: actionId, automationId: automationId, actionParameter: actionParameter, mediaItem: mediaItem, imageUri: spotlightItem.imagePrimaryUrl, imageResizeUri: spotlightItem.imagePrimaryUrl, imagePrimaryUrl: spotlightItem.imagePrimaryUrl, primaryText: spotlightItem.primaryText, secondaryText: spotlightItem.secondaryText, mediaType: spotlightItem.mediaType
                            }
                    };
                    return HeroModule
                })(ViewModels.ModuleBase);
            ViewModels.HeroModule = HeroModule
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/framework/abtests.js:446 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
this.scriptValidator("/Framework/debug.js");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Utilities;
        (function(Utilities) {
            var ABGroup = (function() {
                    function ABGroup(abGroupName, percentage) {
                        this.abGroupName = abGroupName;
                        this.percentage = percentage
                    }
                    return ABGroup
                })();
            Utilities.ABGroup = ABGroup
        })(Utilities = Entertainment.Utilities || (Entertainment.Utilities = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Utilities;
        (function(Utilities) {
            var ABTestsEnum = (function() {
                    function ABTestsEnum(){}
                    ABTestsEnum.testABTests = "testABTests";
                    ABTestsEnum.musicUpsellBannerMessage = "musicUpsellBannerMessage";
                    ABTestsEnum.musicUpsellBannerAction = "musicUpsellBannerAction";
                    ABTestsEnum.videoPostRoll = "videoPostRoll";
                    ABTestsEnum.videoPostRollNoMovieMarketplace = "videoPostRollNoMovieMarketplace";
                    ABTestsEnum.videoPostRollNoTvMarketplace = "videoPostRollNoTvMarketplace";
                    return ABTestsEnum
                })();
            Utilities.ABTestsEnum = ABTestsEnum;
            var ABGroupNames;
            (function(ABGroupNames) {
                var MusicUpsellBannerMessage = (function() {
                        function MusicUpsellBannerMessage(){}
                        MusicUpsellBannerMessage.option1 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT";
                        MusicUpsellBannerMessage.option2 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT2";
                        MusicUpsellBannerMessage.option3 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT3";
                        MusicUpsellBannerMessage.option4 = "IDS_MUSIC_UPSELL_BANNER_{0}TEXT4";
                        return MusicUpsellBannerMessage
                    })();
                ABGroupNames.MusicUpsellBannerMessage = MusicUpsellBannerMessage;
                var MusicUpsellBannerAction = (function() {
                        function MusicUpsellBannerAction(){}
                        MusicUpsellBannerAction.option1 = "IDS_MUSIC_UPSELL_BANNER_SIGN_{0}_ACTION";
                        MusicUpsellBannerAction.option2 = "IDS_MUSIC_UPSELL_BANNER_SIGN_{0}_ACTION2";
                        return MusicUpsellBannerAction
                    })();
                ABGroupNames.MusicUpsellBannerAction = MusicUpsellBannerAction;
                var VideoPostRoll = (function() {
                        function VideoPostRoll(){}
                        VideoPostRoll.Control = "Control";
                        VideoPostRoll.MovieStore = "MovieStore";
                        VideoPostRoll.TvStore = "TvStore";
                        return VideoPostRoll
                    })();
                ABGroupNames.VideoPostRoll = VideoPostRoll;
                var VideoPostRollNoMovieMarketplace = (function() {
                        function VideoPostRollNoMovieMarketplace(){}
                        VideoPostRollNoMovieMarketplace.Control = "Control";
                        VideoPostRollNoMovieMarketplace.TvStore = "TvStore";
                        return VideoPostRollNoMovieMarketplace
                    })();
                ABGroupNames.VideoPostRollNoMovieMarketplace = VideoPostRollNoMovieMarketplace;
                var VideoPostRollNoTvMarketplace = (function() {
                        function VideoPostRollNoTvMarketplace(){}
                        VideoPostRollNoTvMarketplace.Control = "Control";
                        VideoPostRollNoTvMarketplace.MovieStore = "MovieStore";
                        return VideoPostRollNoTvMarketplace
                    })();
                ABGroupNames.VideoPostRollNoTvMarketplace = VideoPostRollNoTvMarketplace
            })(ABGroupNames = Utilities.ABGroupNames || (Utilities.ABGroupNames = {}))
        })(Utilities = Entertainment.Utilities || (Entertainment.Utilities = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/framework/abtestingutilities.js:529 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
this.scriptValidator("/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Utilities");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Utilities;
        (function(Utilities) {
            var ABTesting = (function() {
                    function ABTesting(){}
                    ABTesting.registerABTest = function(abTest, abGroups) {
                        MS.Entertainment.UI.Framework.assert(abTest, "Calling registerABTest with an empty abTest name");
                        MS.Entertainment.UI.Framework.assert(abGroups, "Calling registerABTest an empty list of groups");
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        MS.Entertainment.UI.Framework.assert(configurationManager.abTestingOverrides[abTest] !== undefined, "Calling registerABTest on a test that was not registered in ConfigurationManager");
                        if (configurationManager.abTestingOverrides[abTest] === undefined)
                            return;
                        var numGroups = abGroups.length;
                        if (numGroups === 0)
                            return;
                        if (ABTesting._abGroups === null)
                            ABTesting._abGroups = [];
                        if (ABTesting._abGroups[abTest])
                            return;
                        var percentages = 0;
                        var i = 0;
                        var validPercentages = true;
                        for (i = 0; i < abGroups.length; i++) {
                            if (abGroups[i].percentage === undefined || typeof abGroups[i].percentage !== "number") {
                                validPercentages = false;
                                break
                            }
                            percentages = percentages + abGroups[i].percentage
                        }
                        validPercentages = validPercentages && percentages === 100;
                        if (!validPercentages) {
                            var numGroups = abGroups.length;
                            var percentPerGroup = 100 / numGroups;
                            for (i = 0; i < abGroups.length; i++)
                                abGroups[i].percentage = percentPerGroup
                        }
                        ABTesting._abGroups[abTest] = abGroups
                    };
                    ABTesting.isABTestRegistered = function(abTest) {
                        return (ABTesting._abGroups && ABTesting._abGroups[abTest])
                    };
                    ABTesting.getABGroupOverride = function(abTest) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        return configurationManager.abTestingOverrides[abTest]
                    };
                    ABTesting.getABGroupNumber = function(abTest) {
                        MS.Entertainment.UI.Framework.assert(ABTesting.isABTestRegistered(abTest), "Calling getABGroupNumber on a group that is not registered");
                        var abGroupNumber = ABTesting.getABGroupOverride(abTest);
                        if (abGroupNumber !== undefined && abGroupNumber === -1) {
                            var settingsStorage = null;
                            if (MS.Entertainment.Utilities.isApp1)
                                settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                            else
                                settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                            abGroupNumber = settingsStorage.values["ABTests_" + abTest]
                        }
                        return abGroupNumber
                    };
                    ABTesting.getABGroupName = function(abTest) {
                        MS.Entertainment.UI.Framework.assert(ABTesting.isABTestRegistered(abTest), "Calling getABGroupName on a group that is not registered");
                        if (!ABTesting.isABTestRegistered(abTest))
                            return String.empty;
                        var abGroupNumber = ABTesting.getABGroupNumber(abTest);
                        if (abGroupNumber !== undefined && abGroupNumber !== -1)
                            return ABTesting._abGroups[abTest][abGroupNumber] ? ABTesting._abGroups[abTest][abGroupNumber].abGroupName : String.empty;
                        return String.empty
                    };
                    ABTesting.createABGroupNumber = function(abTest) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        MS.Entertainment.UI.Framework.assert(configurationManager.abTestingOverrides[abTest] !== undefined, "Calling createABGroupName on a test that was not registered in ConfigurationManager");
                        if (configurationManager.abTestingOverrides[abTest] === undefined)
                            return String.empty;
                        var abGroupName = ABTesting.getABGroupName(abTest);
                        if (!abGroupName) {
                            var abGroups = null;
                            MS.Entertainment.UI.Framework.assert(ABTesting.isABTestRegistered(abTest), "Calling createABGroupName on a group that is not registered");
                            if (ABTesting.isABTestRegistered(abTest))
                                abGroups = ABTesting._abGroups[abTest];
                            if (!abGroups)
                                return String.empty;
                            var flightNumber = configurationManager.telemetry.flightNumber;
                            var randNum = Math.floor(flightNumber / 100);
                            var sumPerc = 0;
                            var abGroupNumber = 0;
                            while (randNum > sumPerc) {
                                sumPerc += abGroups[abGroupNumber].percentage;
                                abGroupNumber++
                            }
                            abGroupNumber = abGroupNumber === 0 ? 0 : abGroupNumber - 1;
                            abGroupName = abGroups[abGroupNumber].abGroupName;
                            var settingsStorage = null;
                            if (MS.Entertainment.Utilities.isApp1)
                                settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                            else
                                settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                            settingsStorage.values["ABTests_" + abTest] = abGroupNumber;
                            ABTesting.logABGroupCreate(abTest)
                        }
                        return abGroupName
                    };
                    ABTesting.getABGroupNameForTelemetry = function(abTest) {
                        var abGroupName = String.empty;
                        if (!ABTesting.isABTestRegistered(abTest))
                            return abGroupName;
                        var abGroupOverride = ABTesting.getABGroupOverride(abTest);
                        if (abGroupOverride === undefined || abGroupOverride === -1 || typeof abGroupOverride !== "number") {
                            var abGroupNameT = ABTesting.getABGroupName(abTest);
                            if (abGroupNameT)
                                abGroupName = abGroupNameT
                        }
                        return abGroupName
                    };
                    ABTesting.logABGroupCreate = function(abTest) {
                        var abGroupName = ABTesting.getABGroupNameForTelemetry(abTest);
                        if (abGroupName !== String.empty)
                            MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray("ABGroupCreated", [{
                                    parameterName: "GroupName", parameterValue: abGroupName
                                }])
                    };
                    ABTesting.logABGroupName = function(datapoint, abTest) {
                        var abGroupName = ABTesting.getABGroupNameForTelemetry(abTest);
                        if (!!abGroupName)
                            datapoint.appendParameter(abTest, abGroupName)
                    };
                    ABTesting.setABGroupNumber = function(abTest, abGroupNumber) {
                        var settingsStorage = null;
                        if (MS.Entertainment.Utilities.isApp1)
                            settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                        else
                            settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                        settingsStorage.values["ABTests_" + abTest] = abGroupNumber
                    };
                    ABTesting._abGroups = null;
                    return ABTesting
                })();
            Utilities.ABTesting = ABTesting
        })(Utilities = Entertainment.Utilities || (Entertainment.Utilities = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/framework/externalnavigateaction.js:677 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";

    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {externalNavigateAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function externalNavigateActionConstructor() {
            this.base();
            this.isExternalAction = true
        }, {
            executed: function executed(param) {
                var link = this._extractLink(param);
                window.open(link, "_blank")
            }, canExecute: function canExecute(param) {
                    this.useOverrideTitleIfExists();
                    var link = this._extractLink(param);
                    this._applyAutomationId(param);
                    return (link) && (typeof link === "string")
                }, _applyAutomationId: function _applyAutomationId(param) {
                    if (param && param.automationId)
                        this.automationId = param.automationId
                }, _extractLink: function _extractLink(param) {
                    var url = null;
                    MS.Entertainment.UI.Actions.assert(param, "External navigation action requires a valid link.");
                    if (param && param.link)
                        url = param.link;
                    else if (typeof param === "string")
                        url = param;
                    return url
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {externalAdNavigateAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.externalNavigateAction", function externalAdNavigateActionConstructor() {
            this.base()
        }, {executed: function executed(param) {
                var link = this._extractLink(param);
                MS.Entertainment.Utilities.Telemetry.logAdClicked(link);
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(link)).done(function launchSuccess(s){}, function launchFailure(e){})
            }})});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate, function() {
        return new MS.Entertainment.UI.Actions.externalNavigateAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.externalAdNavigate, function() {
        return new MS.Entertainment.UI.Actions.externalAdNavigateAction
    })
})()
})();
/* >>>>>>/monikers.js:725 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {Monikers: {
            actorDetailsPage: "actorDetailsPage", albumDetails: "albumDetails", albumMusicVideos: "albumMusicVideos", albumMusicVideosMarketplace: "albumMusicVideosMarketplace", allVideoCollection: "allVideoCollection", allVideoCollectionPanel: "allVideoCollectionPanel", artistAlbums: "artistAlbums", artistAlbumsCollection: "artistAlbumsCollection", artistAlbumsMarketplace: "artistAlbumsMarketplace", artistMusicVideos: "artistMusicVideos", artistMusicVideosMarketplace: "artistMusicVideosMarketplace", artistSearchAction: "artistSearchAction", artistSearchActionPivot: "artistSearchActionPivot", browseByActor: "browseByActor", browseByActorHub: "browseByActorHub", browseMoviesByActor: "browseMoviesByActor", browseTVSeriesByActor: "browseTVSeriesByActor", companionFeatured: "companionFeatured", companionFeaturedGamesPanel: "companionFeaturedGamesPanel", companionFeaturedMusicPanel: "companionFeaturedMusicPanel", companionFeaturedMoviesPanel: "companionFeaturedMoviesPanel", companionFeaturedTVPanel: "companionFeaturedTVPanel", companionNowPlaying: "companionNowPlaying", companionNowPlayingPanel: "companionNowPlayingPanel", companionQuickplay: "companionQuickplay", companionQuickplayPanel: "companionQuickplayPanel", companionSearch: "companionSearch", companionSearchPanel: "companionSearchPanel", dashboard: "dashboard", fullScreenNowPlaying: "fullScreenNowPlaying", homeHub: "homeHub", homeSpotlight: "homeSpotlight", filteredMovieMarketplace: "filteredMovieMarketplace", filteredTvMarketplace: "filteredTvMarketplace", filteredMovieMarketplaceSingleStudio: "filteredMovieMarketplaceSingleStudio", filteredMovieMarketplaceSingleStudioPanel: "filteredMovieMarketplaceSingleStudioPanel", filteredTvMarketplaceSingleNetwork: "filteredTvMarketplaceSingleNetwork", filteredTvMarketplaceSingleNetworkPanel: "filteredTvMarketplaceSingleNetworkPanel", flexHubPage: "flexHubPage", flexHub: "flexHub", flexHubPanel: "flexHubPanel", featuredSetsPage: "featuredSetsPage", featuredSets: "featuredSets", featuredSetsPanel: "featuredSetsPanel", immersiveDetails: "immersiveDetails", albumsSearch: "albumsSearch", allMusicSearch: "allMusicSearch", allVideoSearch: "allVideoSearch", allVideoSearchPanel: "allVideoSearchPanel", artistsSearch: "artistsSearch", searchPage: "searchPage", playlistsSearch: "playlistsSearch", playlistDetails: "playlistDetails", tracksSearch: "tracksSearch", musicVideosSearch: "musicVideosSearch", movieCollection: "movieCollection", movieCollectionPanel: "movieCollectionPanel", movieDetailsPage: "movieDetailsPage", movieMarketplace: "movieMarketplace", movieMarketplaceFeatured: "movieMarketplaceFeatured", movieMarketplaceFeaturedPanel: "movieMarketplaceFeaturedPanel", movieMarketplaceNewReleases: "movieMarketplaceNewReleases", movieMarketplaceNewReleasesPanel: "movieMarketplaceNewReleasesPanel", movieMarketplaceTopPurchased: "movieMarketplaceTopPurchased", movieMarketplaceTopPurchasedPanel: "movieMarketplaceTopPurchasedPanel", movieMarketplaceTopRented: "movieMarketplaceTopRented", movieMarketplaceTopRentedPanel: "movieMarketplaceTopRentedPanel", movieMarketplaceTopRated: "movieMarketplaceTopRated", movieMarketplaceTopRatedPanel: "movieMarketplaceTopRatedPanel", movieMarketplaceHub: "movieMarketplaceHub", movieMarketplacePanel: "movieMarketplacePanel", movieMarketplacePanel2: "movieMarketplacePanel2", movieRecommendations: "movieRecommendations", movieRecommendationsPanel: "movieRecommendationsPanel", movieSpotlight: "movieSpotlight", studioAndNetworkGallery: "studioAndNetworkGallery", movieStudioGalleryHub: "movieStudioGalleryHub", movieStudioGalleryHubPanel: "movieStudioGalleryHubPanel", movieTrailerBrowse: "movieTrailerBrowse", musicHub: "musicHub", musicCollection: "musicCollection", musicCollectionHub: "musicCollectionHub", musicCollectionPanel: "musicCollectionPanel", musicPlaylistCollection: "musicPlaylistCollection", musicMarketplace: "musicMarketplace", musicMarketplaceAlbums: "musicMarketplaceAlbums", musicMarketplaceAlbumsPanel: "musicMarketplaceAlbumsPanel", musicMarketplaceArtists: "musicMarketplaceArtists", musicMarketplaceArtistsPanel: "musicMarketplaceArtistsPanel", musicMarketplaceFeatured: "musicMarketplaceFeatured", musicMarketplaceFeaturedPanel: "musicMarketplaceFeaturedPanel", musicMarketplaceGenres: "musicMarketplaceGenres", musicMarketplaceGenresPanel: "musicMarketplaceGenresPanel", musicMarketplaceHub: "musicMarketplaceHub", musicMarketplacePanel: "musicMarketplacePanel", musicCollectionByAlbum: "musicCollectionByAlbum", musicCollectionByAlbumPanel: "musicCollectionByAlbumPanel", musicCollectionByArtist: "musicCollectionByArtist", musicCollectionByArtistPanel: "musicCollectionByArtistPanel", musicCollectionSmartDJs: "musicCollectionSmartDJs", musicCollectionSmartDJsPivot: "musicCollectionSmartDJsPivot", musicCollectionBySong: "musicCollectionBySong", musicCollectionBySongPanel: "musicCollectionBySongPanel", musicCollectionPlaylists: "musicCollectionPlaylists", musicCollectionPlaylistsPanel: "musicCollectionPlaylistsPanel", musicCollectionNewlyAdded: "musicCollectionNewlyAdded", musicCollectionMusicVideos: "musicCollectionMusicVideos", musicExploreHub: "musicExploreHub", musicNewReleases: "musicNewReleases", musicNewReleasesPanel: "musicNewReleasesPanel", musicNewReleasesGallery: "musicNewReleasesGallery", musicNewVideosGallery: "musicNewVideosGallery", musicPopularGallery: "musicPopularGallery", musicRecentsPanel: "musicRecentsPanel", musicSmartDJs: "musicSmartDJs", musicSmartDJsPanel: "musicSmartDJsPanel", musicTopMusic: "musicTopMusic", musicTopArtistsPanel: "musicTopArtistsPanel", musicTopAlbumsPanel: "musicTopAlbumsPanel", musicTopVideosPanel: "musicTopVideosPanel", musicVideoCollection: "musicVideoCollection", musicVideoCollectionPanel: "musicVideoCollectionPanel", navigationPopover: "navigationPopover", otherVideoCollection: "otherVideoCollection", otherVideoCollectionPanel: "otherVideoCollectionPanel", playToSpinner: "playToSpinner", playToLandingPage: "playToLandingPage", recommendationsPage: "recommendationsPage", recommendations: "recommendations", recommendationsPanel: "recommendationsPanel", root: "root", searchHub: "searchHub", selectPlaylist: "selectPlaylist", selectPlaylistPivot: "selectPlaylistPivot", tempMusicPanel: "tempMusicPanel", tempSocialPanel: "tempSocialPanel", tempVideoPanel: "tempVideoPanel", tvCollection: "tvCollection", tvCollectionPanel: "tvCollectionPanel", tvDetailsPage: "tvDetailsPage", tvMarketplace: "tvMarketplace", tvMarketplaceFeatured: "tvMarketplaceFeatured", tvMarketplaceFeaturedPanel: "tvMarketplaceFeaturedPanel", tvMarketplaceNewReleases: "tvMarketplaceNewReleases", tvMarketplaceNewReleasesPanel: "tvMarketplaceNewReleasesPanel", tvMarketplaceLastNight: "tvMarketplaceLastNight", tvMarketplaceLastNightPanel: "tvMarketplaceLastNightPanel", tvMarketplaceTopPurchased: "tvMarketplaceTopPurchased", tvMarketplaceTopPurchasedPanel: "tvMarketplaceTopPurchasedPanel", tvMarketplaceTopRated: "tvMarketplaceTopRated", tvMarketplaceTopRatedPanel: "tvMarketplaceTopRatedPanel", tvMarketplaceGenres: "tvMarketplaceGenres", tvMarketplaceGenresPanel: "tvMarketplaceGenresPanel", tvMarketplaceHub: "tvMarketplaceHub", tvMarketplaceNetworks: "tvMarketplaceNetworks", tvMarketplaceNetworksPanel: "tvMarketplaceNetworksPanel", tvMarketplacePanel: "tvMarketplacePanel", tvMarketplacePanel2: "tvMarketplacePanel2", tvNetworkGallery: "tvNetworkGallery", tvNetworkGalleryHub: "tvNetworkGalleryHub", tvNetworkGalleryHubPanel: "tvNetworkGalleryHubPanel", tvRecommendations: "tvRecommendations", tvRecommendationsPanel: "tvRecommendationsPanel", tvSpotlight: "tvSpotlight", videoHub: "videoHub", videoHubIsolated: "videoHubIsolated", videoCollection: "videoCollection", videoCollectionHub: "videoCollectionHub", videoCollectionPanel: "videoCollectionPanel", videoMarketplace: "videoMarketplace", videoMovieCollectionPanel: "videoMovieCollectionPanel", videoOtherCollectionPanel: "videoOtherCollectionPanel", videoTvCollectionPanel: "videoTvCollectionPanel", videoWatchlist: "videoWatchlist", videoWatchlistPage: "videoWatchlistPage", videoWatchlistPanel: "videoWatchlistPanel", movieStorePage: "movieStorePage", tvStorePage: "tvStorePage", welcomeHub: "welcomeHub", welcomePanel: "welcomePanel"
        }})
})()
})();
/* >>>>>>/viewmodels/music1/playbackprivileges.js:736 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var UI = MS.Entertainment.UI;
            var PlaybackPrivilegesNotifierService = (function() {
                    function PlaybackPrivilegesNotifierService() {
                        var _this = this;
                        MS.Entertainment.Utilities.schedulePromiseNormal().done(function() {
                            return _this._delayInitialize()
                        }, function(){})
                    }
                    PlaybackPrivilegesNotifierService.prototype.dispose = function() {
                        this._isDisposed = true;
                        this._clearHandlers()
                    };
                    PlaybackPrivilegesNotifierService.prototype._clearHandlers = function() {
                        if (this._signInHandlers) {
                            this._signInHandlers.cancel();
                            this._signInHandlers = null
                        }
                        if (this._signInUserHandlers) {
                            this._signInUserHandlers.cancel();
                            this._signInUserHandlers = null
                        }
                    };
                    PlaybackPrivilegesNotifierService.prototype._delayInitialize = function() {
                        var _this = this;
                        if (this._isDisposed)
                            return;
                        this._clearHandlers();
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        var signIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                        this._signInUserHandlers = MS.Entertainment.Utilities.addEventHandlers(signedInUser, {hasExplicitPrivilegeChanged: function() {
                                return _this._handleHasExplicitPrivilegeChanged()
                            }});
                        this._signInHandlers = MS.Entertainment.Utilities.addEventHandlers(signIn, {isSignedInChanged: function() {
                                return _this._handleHasExplicitPrivilegeChanged()
                            }});
                        this._handleHasExplicitPrivilegeChanged()
                    };
                    PlaybackPrivilegesNotifierService.prototype._handleHasExplicitPrivilegeChanged = function() {
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        var signIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                        var listNotificationService = Entertainment.ServiceLocator.getService(Entertainment.Services.listNotification);
                        if (signedInUser.hasExplicitPrivilege || !signIn.isSignedIn)
                            listNotificationService.clear(UI.NotificationCategoryEnum.explicitPrivileges, true);
                        else if (listNotificationService.indexOfNotificationByCategory(UI.NotificationCategoryEnum.explicitPrivileges) < 0)
                            var notification = listNotificationService.createAndSend(UI.NotificationCategoryEnum.explicitPrivileges, String.load(String.id.IDS_MUSIC_EXPLORE_CHILD_EXPLICIT_BANNER_NOTIFICATION_TITLE), String.empty, [UI.Actions.ActionIdentifiers.externalNavigate], [{
                                        parameter: {
                                            link: MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_XBoxLiveSSL) + "/Account/Settings", automationId: UI.AutomationIds.settingsAccountPrivacy
                                        }, title: String.load(String.id.IDS_MUSIC_EXPLORE_CHILD_EXPLICIT_BANNER_NOTIFICATION_BODY)
                                    }], false, false, "explicitNotification")
                    };
                    PlaybackPrivilegesNotifierService.factory = function() {
                        return new PlaybackPrivilegesNotifierService
                    };
                    return PlaybackPrivilegesNotifierService
                })();
            ViewModels.PlaybackPrivilegesNotifierService = PlaybackPrivilegesNotifierService;
            MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.playbackPrivilegesNotifier, PlaybackPrivilegesNotifierService.factory)
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
