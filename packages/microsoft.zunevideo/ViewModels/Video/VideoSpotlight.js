/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoSpotlight: MS.Entertainment.UI.Framework.define(function videoSpotlightConstructor()
        {
            var query = new MS.Entertainment.Data.Query.videoSpotlightQuery;
            query.queryId = MS.Entertainment.UI.Monikers.homeSpotlight;
            this.viewModel = new MS.Entertainment.ViewModels.SpotlightViewModel(query);
            this.viewModel.maxItems = 5;
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)) {
                this.viewModel.getItems();
                this.viewModel.isFeatureEnabled = true
            }
            this.panelAction = new MS.Entertainment.UI.Actions.Action;
            this.panelAction.isEnabled = false
        }, {
            viewModel: null, doNotRaisePanelReady: true, features: null, panelAction: null
        }, {startupVideoSpotlight: null})})
})()
