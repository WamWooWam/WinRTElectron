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
        var ViewModels;
        (function(ViewModels) {
            var BaseDemoViewModel = (function(_super) {
                    __extends(BaseDemoViewModel, _super);
                    function BaseDemoViewModel() {
                        _super.apply(this, arguments)
                    }
                    Object.defineProperty(BaseDemoViewModel.prototype, "title", {
                        get: function() {
                            return this._title
                        }, set: function(value) {
                                this.updateAndNotify("title", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseDemoViewModel.prototype, "marketingMessages", {
                        get: function() {
                            return this._marketingMessages
                        }, set: function(value) {
                                this.updateAndNotify("marketingMessages", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseDemoViewModel.prototype, "subTitle", {
                        get: function() {
                            return this._subTitle
                        }, set: function(value) {
                                this.updateAndNotify("subTitle", value)
                            }, enumerable: true, configurable: true
                    });
                    return BaseDemoViewModel
                })(MS.Entertainment.UI.Framework.ObservableBase);
            ViewModels.BaseDemoViewModel = BaseDemoViewModel;
            var DemoRadioCollection = (function(_super) {
                    __extends(DemoRadioCollection, _super);
                    function DemoRadioCollection() {
                        _super.call(this);
                        this.title = String.load(String.id.IDS_DEMO_MUSIC_RADIO_HEADER);
                        this.subTitle = String.load(String.id.IDS_DEMO_MUSIC_RADIO_SUBTITLE);
                        this.marketingMessages = [String.load(String.id.IDS_DEMO_MUSIC_RADIO_MESSAGE_1), String.load(String.id.IDS_DEMO_MUSIC_RADIO_MESSAGE_2), String.load(String.id.IDS_DEMO_MUSIC_RADIO_MESSAGE_3), ]
                    }
                    DemoRadioCollection.createDemoRadioCollection = function() {
                        return new DemoRadioCollection
                    };
                    return DemoRadioCollection
                })(BaseDemoViewModel);
            ViewModels.DemoRadioCollection = DemoRadioCollection;
            var DemoExplorePage = (function(_super) {
                    __extends(DemoExplorePage, _super);
                    function DemoExplorePage() {
                        _super.call(this);
                        this.title = String.load(String.id.IDS_DEMO_MUSIC_EXPLORE_HEADER);
                        this.subTitle = String.load(String.id.IDS_DEMO_MUSIC_EXPLORE_SUBTITLE);
                        var firstMarketingMessage = String.load(String.id.IDS_DEMO_MUSIC_EXPLORE_MESSAGE_1);
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay))
                            firstMarketingMessage = String.load(String.id.IDS_DEMO_MUSIC_EXPLORE_MESSAGE_1_FREE);
                        this.marketingMessages = [firstMarketingMessage, String.load(String.id.IDS_DEMO_MUSIC_EXPLORE_MESSAGE_2), String.load(String.id.IDS_DEMO_MUSIC_EXPLORE_MESSAGE_3), ]
                    }
                    DemoExplorePage.createDemoExplorePage = function() {
                        return new DemoExplorePage
                    };
                    return DemoExplorePage
                })(BaseDemoViewModel);
            ViewModels.DemoExplorePage = DemoExplorePage
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
