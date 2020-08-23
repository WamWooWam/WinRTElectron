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
                (function(Video) {
                    var VideoPostRoll = (function(_super) {
                            __extends(VideoPostRoll, _super);
                            function VideoPostRoll(element, options) {
                                this.templateStorage = "/Controls/Video/VideoPostRoll.html";
                                this.templateName = "template-videoPostRoll";
                                _super.call(this, element, options)
                            }
                            Object.defineProperty(VideoPostRoll.prototype, "viewModel", {
                                get: function() {
                                    return this._viewModel
                                }, set: function(value) {
                                        this.updateAndNotify("viewModel", value)
                                    }, enumerable: true, configurable: true
                            });
                            VideoPostRoll.showVideoPostRollOverlay = function(viewModel) {
                                var overlay = new MS.Entertainment.UI.Controls.Overlay(null, {
                                        userControl: MS.Entertainment.UI.Controls.Video.VideoPostRoll, userControlOptions: {viewModel: viewModel}, customStyle: "videoPostRollOverlay", dismissOnAppBarShown: true, enableKeyboardLightDismiss: true, top: null, left: null, right: null, bottom: null
                                    });
                                overlay.setAccessibilityTitle(viewModel.upsellMessageText);
                                MS.Entertainment.Utilities.Telemetry.logVideoPostRollAction(viewModel.abTestName, viewModel.abGroupName, MS.Entertainment.ViewModels.VideoPostRollActions.ShowPostRoll);
                                overlay.show().done(function(overlay) {
                                    if (overlay && overlay.hideReason === MS.Entertainment.UI.Controls.OverlayHideReasons.lightDismiss) {
                                        MS.Entertainment.Utilities.Telemetry.logVideoPostRollAction(viewModel.abTestName, viewModel.abGroupName, MS.Entertainment.ViewModels.VideoPostRollActions.DismissPostRoll);
                                        return
                                    }
                                })
                            };
                            return VideoPostRoll
                        })(MS.Entertainment.UI.Framework.UserControl);
                    Video.VideoPostRoll = VideoPostRoll
                })(Controls.Video || (Controls.Video = {}));
                var Video = Controls.Video
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(ViewModels) {
            var VideoPostRollViewModel = (function(_super) {
                    __extends(VideoPostRollViewModel, _super);
                    function VideoPostRollViewModel() {
                        _super.call(this);
                        this._isValid = false;
                        this._abTestName = null;
                        this._abGroupName = null;
                        this._titleIcon = null;
                        this._titleText = null;
                        this._upsellMessageText = null;
                        this._upsellButtonText = null;
                        this._upsellButtonAction = null;
                        this._upsellItems = null;
                        this._cssClass = null;
                        this.initialize()
                    }
                    Object.defineProperty(VideoPostRollViewModel.prototype, "isValid", {
                        get: function() {
                            return this._isValid
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "abTestName", {
                        get: function() {
                            return this._abTestName
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "abGroupName", {
                        get: function() {
                            return this._abGroupName
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "titleIcon", {
                        get: function() {
                            return this._titleIcon
                        }, set: function(value) {
                                this.updateAndNotify("titleIcon", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "titleText", {
                        get: function() {
                            return this._titleText
                        }, set: function(value) {
                                this.updateAndNotify("titleText", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "upsellMessageText", {
                        get: function() {
                            return this._upsellMessageText
                        }, set: function(value) {
                                this.updateAndNotify("upsellMessageText", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "upsellButtonText", {
                        get: function() {
                            return this._upsellButtonText
                        }, set: function(value) {
                                this.updateAndNotify("upsellButtonText", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "upsellButtonAction", {
                        get: function() {
                            return this._upsellButtonAction
                        }, set: function(value) {
                                this.updateAndNotify("upsellButtonAction", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "upsellItems", {
                        get: function() {
                            return this._upsellItems
                        }, set: function(value) {
                                this.updateAndNotify("upsellItems", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollViewModel.prototype, "cssClass", {
                        get: function() {
                            return this._cssClass
                        }, set: function(value) {
                                this.updateAndNotify("cssClass", value)
                            }, enumerable: true, configurable: true
                    });
                    VideoPostRollViewModel.prototype.initialize = function() {
                        var _this = this;
                        var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var videoPostRollLastReset = config.video.videoPostRollResetDate;
                        var videoPostRollNextReset = new Date(videoPostRollLastReset.getFullYear(), videoPostRollLastReset.getMonth(), (videoPostRollLastReset.getDate() + config.video.videoPostRollResetInterval));
                        var today = new Date;
                        if (today >= videoPostRollNextReset) {
                            config.video.showVideoPostRollCount = 0;
                            config.video.videoPostRollResetDate = today
                        }
                        if (config.shell.retailExperience || (config.video.showVideoPostRollCount >= config.video.showVideoPostRollMax))
                            return;
                        config.video.showVideoPostRollCount++;
                        VideoPostRollHelpers.registerABTests();
                        this._abTestName = VideoPostRollHelpers.abTestName;
                        this._abGroupName = VideoPostRollHelpers.abGroupName;
                        this._isValid = (Entertainment.Utilities.ABTesting.getABGroupNumber(this._abTestName) > 0);
                        if (this.isValid) {
                            this.titleIcon = Entertainment.UI.Icon.xboxXenonLogo;
                            this.titleText = Entertainment.ServiceLocator.getService(Entertainment.Services.uiState).applicationTitle;
                            var groupOptions = this.getGroupOptions(this._abGroupName);
                            this.cssClass = groupOptions.cssClass;
                            this.upsellMessageText = String.load(groupOptions.upsellMessageTextStringId);
                            this.upsellButtonText = String.load(groupOptions.upsellButtonTextStringId);
                            this.upsellButtonAction = groupOptions.upsellButtonAction;
                            if (groupOptions.upsellEditorialQuery) {
                                var listIndex = 0;
                                var query = groupOptions.upsellEditorialQuery;
                                query.queryId = "upsellEditorialQuery";
                                this.upsellItems = null;
                                query.execute().done(function(queryResult) {
                                    query.dispose();
                                    var editorialItems = [];
                                    var randomItems = [];
                                    if (WinJS.Utilities.getMember("result.entriesArray.length", queryResult) > listIndex) {
                                        var listItems = queryResult.result.entriesArray[listIndex].editorialItems;
                                        var maxRandomItems = groupOptions.upsellEditorialMaxItems;
                                        if (listItems) {
                                            for (var i = 0; i < maxRandomItems && listItems.length > 0; i++) {
                                                var randomIndex = Math.floor(Math.random() * listItems.length);
                                                var randomItem = listItems.splice(randomIndex, 1)[0];
                                                randomItems.push(randomItem)
                                            }
                                            editorialItems = randomItems.map(function(item) {
                                                return Entertainment.Utilities.convertEditorialItem(item.editorialItem)
                                            })
                                        }
                                    }
                                    _this.upsellItems = new Entertainment.ObservableArray(editorialItems)
                                }, function(error) {
                                    query.dispose()
                                })
                            }
                        }
                    };
                    VideoPostRollViewModel.prototype.getGroupOptions = function(groupName) {
                        var upsellButtonTextStringId;
                        var upsellButtonAction = null;
                        var upsellEditorialQuery = null;
                        var upsellEditorialMaxItems = 2;
                        var navigatePage = Entertainment.UI.Monikers.root;
                        var navigatePanel = null;
                        switch (groupName) {
                            case Entertainment.Utilities.ABGroupNames.VideoPostRoll.MovieStore:
                                navigatePanel = Entertainment.UI.Monikers.movieMarketplacePanel;
                                upsellButtonTextStringId = String.id.IDS_VIDEO_UPSELL_BROWSE_NEW_MOVIES_SC;
                                upsellEditorialQuery = new Entertainment.Data.Query.MovieHub;
                                upsellEditorialMaxItems = 4;
                                break;
                            case Entertainment.Utilities.ABGroupNames.VideoPostRoll.TvStore:
                                navigatePanel = Entertainment.UI.Monikers.tvMarketplacePanel;
                                upsellButtonTextStringId = String.id.IDS_VIDEO_UPSELL_BROWSE_NEW_TV_SC;
                                upsellEditorialQuery = new Entertainment.Data.Query.TvHub;
                                upsellEditorialMaxItems = 3;
                                break
                        }
                        upsellButtonAction = this.createVideoPostRollNavigateAction(VideoPostRollActions.NavigateUpsell, navigatePanel);
                        return {
                                upsellMessageTextStringId: String.id.IDS_VIDEO_UPSELL_VIEW_NEW_RELEASES_SC, upsellButtonTextStringId: upsellButtonTextStringId, cssClass: "videoPostRoll-greyTheme", upsellButtonAction: upsellButtonAction, upsellEditorialQuery: upsellEditorialQuery, upsellEditorialMaxItems: upsellEditorialMaxItems
                            }
                    };
                    VideoPostRollViewModel.prototype.createVideoPostRollNavigateAction = function(videoPostRollAction, panel) {
                        if (!panel)
                            panel = null;
                        var action = Entertainment.ServiceLocator.getService(Entertainment.Services.actions).getAction(Entertainment.UI.Actions.ActionIdentifiers.videoPostRollNavigate);
                        action.parameter = {
                            page: Entertainment.UI.Monikers.root, panel: panel, abTestName: this._abTestName, abGroupName: this._abGroupName, videoPostRollAction: videoPostRollAction
                        };
                        return action
                    };
                    return VideoPostRollViewModel
                })(Entertainment.UI.Framework.ObservableBase);
            ViewModels.VideoPostRollViewModel = VideoPostRollViewModel;
            var VideoPostRollHelpers = (function() {
                    function VideoPostRollHelpers(){}
                    Object.defineProperty(VideoPostRollHelpers, "abTestName", {
                        get: function() {
                            return this._abTestName
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoPostRollHelpers, "abGroupName", {
                        get: function() {
                            return this._abGroupName
                        }, enumerable: true, configurable: true
                    });
                    VideoPostRollHelpers.registerABTests = function() {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var movieMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                        var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                        var marketplaceEnabled = movieMarketplaceEnabled || tvMarketplaceEnabled;
                        var abTestName = null;
                        if (movieMarketplaceEnabled && tvMarketplaceEnabled)
                            abTestName = MS.Entertainment.Utilities.ABTestsEnum.videoPostRoll;
                        else if (movieMarketplaceEnabled)
                            abTestName = MS.Entertainment.Utilities.ABTestsEnum.videoPostRollNoTvMarketplace;
                        else if (tvMarketplaceEnabled)
                            abTestName = MS.Entertainment.Utilities.ABTestsEnum.videoPostRollNoMovieMarketplace;
                        this._abTestName = abTestName;
                        var groups = new Array;
                        groups.push(new MS.Entertainment.Utilities.ABGroup(MS.Entertainment.Utilities.ABGroupNames.VideoPostRoll.Control));
                        if (movieMarketplaceEnabled)
                            groups.push(new MS.Entertainment.Utilities.ABGroup(MS.Entertainment.Utilities.ABGroupNames.VideoPostRoll.MovieStore));
                        if (tvMarketplaceEnabled)
                            groups.push(new MS.Entertainment.Utilities.ABGroup(MS.Entertainment.Utilities.ABGroupNames.VideoPostRoll.TvStore));
                        MS.Entertainment.Utilities.ABTesting.registerABTest(this._abTestName, groups);
                        MS.Entertainment.Utilities.ABTesting.createABGroupNumber(this._abTestName);
                        this._abGroupName = MS.Entertainment.Utilities.ABTesting.getABGroupName(this._abTestName)
                    };
                    VideoPostRollHelpers.unregisterTests = function() {
                        this._abTestName = null;
                        this._abGroupName = null;
                        var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        config.abTestingOverrides.videoPostRoll = -1;
                        config.abTestingOverrides.videoPostRollNoMovieMarketplace = -1;
                        config.abTestingOverrides.videoPostRollNoTvMarketplace = -1
                    };
                    VideoPostRollHelpers._abTestName = null;
                    VideoPostRollHelpers._abGroupName = null;
                    return VideoPostRollHelpers
                })();
            ViewModels.VideoPostRollHelpers = VideoPostRollHelpers;
            var VideoPostRollActions = (function() {
                    function VideoPostRollActions(){}
                    VideoPostRollActions.ShowPostRoll = "ShowPostRoll";
                    VideoPostRollActions.DismissPostRoll = "DismissPostRoll";
                    VideoPostRollActions.NavigateHome = "NavigateHome";
                    VideoPostRollActions.NavigateUpsell = "NavigateUpsell";
                    return VideoPostRollActions
                })();
            ViewModels.VideoPostRollActions = VideoPostRollActions
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.Video.VideoPostRoll)
