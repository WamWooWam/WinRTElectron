/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicEngageViewModel: MS.Entertainment.deferredDerive("MS.Entertainment.ViewModels.SpotlightViewModel", function spotlightViewModelConstructor(query) {
            MS.Entertainment.UI.Framework.loadTemplate("Components/Music/MusicDashboardTemplates.html#dashboardEngagePanelButton", null, true);
            this.base(query);
            this._smartBuyStateEngine = new MS.Entertainment.ViewModels.SmartBuyStateEngine;
            this._smartBuyStateEngine.initialize({}, MS.Entertainment.ViewModels.SmartBuyButtons.getEngagePanelButtons(MS.Entertainment.UI.Actions.ExecutionLocation.engage), MS.Entertainment.ViewModels.MusicStateHandlers.onMusicOpportunitiesChanged, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.engage});
            this._featuredObjectAnchor = WinJS.Binding.as({
                bindableItems: null, smartBuyStateEngine: WinJS.Binding.as(this._smartBuyStateEngine)
            });
            this.featuredObject = this._featuredObjectAnchor
        }, {
            _smartBuyStateEngine: null, _featuredObjectAnchor: null, dispose: function dispose() {
                    if (this._smartBuyStateEngine) {
                        this._smartBuyStateEngine.unload();
                        this._smartBuyStateEngine = null
                    }
                }, _createFeaturedObject: function _createFeaturedObject() {
                    this._featuredObjectAnchor.bindableItems = this.items && this.items.bindableItems;
                    return this._featuredObjectAnchor
                }
        })})
})()
