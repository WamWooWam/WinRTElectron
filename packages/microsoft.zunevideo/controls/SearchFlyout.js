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
                var SearchFlyout = (function(_super) {
                        __extends(SearchFlyout, _super);
                        function SearchFlyout(element, options) {
                            _super.call(this, element, options)
                        }
                        Object.defineProperty(SearchFlyout.prototype, "templateStorage", {
                            get: function() {
                                return "/Controls/SearchFlyout.html"
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(SearchFlyout.prototype, "templateName", {
                            get: function() {
                                return "control-searchFlyout"
                            }, enumerable: true, configurable: true
                        });
                        SearchFlyout.prototype.initialize = function() {
                            var _this = this;
                            MS.Entertainment.Utilities.schedulePromiseIdle().done(function() {
                                if (_this._searchBox && _this._searchBox.element)
                                    MS.Entertainment.UI.Framework.focusFirstInSubTree(_this._searchBox.element)
                            })
                        };
                        SearchFlyout.prototype.unload = function() {
                            _super.prototype.unload.call(this)
                        };
                        SearchFlyout.prototype.searchQuerySubmitted = function(event) {
                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                            return MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted({
                                    language: event.detail.language, queryText: event.detail.queryText
                                })
                        };
                        SearchFlyout.prototype.searchSuggestionsRequested = function(event) {
                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                            return MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSuggestionRequested({
                                    language: event.detail.language, linguisticDetails: event.detail.linguisticDetails, queryText: event.detail.queryText, request: event.detail
                                })
                        };
                        return SearchFlyout
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.SearchFlyout = SearchFlyout
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.SearchFlyout)
