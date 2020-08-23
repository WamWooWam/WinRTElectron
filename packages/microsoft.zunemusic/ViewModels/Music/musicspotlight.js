/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/playbackhelpers.js", "/ViewModels/Home/SpotlightViewModel.js", "/ViewModels/Music/MusicEngageViewModel.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicSpotlight: MS.Entertainment.UI.Framework.define(function musicSpotlightConstructor() {
            var query = new MS.Entertainment.Data.Query.MusicMediaDiscoverySpotlightQuery;
            query.queryId = MS.Entertainment.UI.Monikers.homeSpotlight;
            this.viewModel = new MS.Entertainment.ViewModels.MusicEngageViewModel(query);
            this.viewModel.maxItems = MS.Entertainment.Utilities.isMusicApp2 ? 6 : 4;
            if (MS.Entertainment.Utilities.isMusicApp1) {
                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                var browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails);
                WinJS.Promise.timeout(500).then(function() {
                    var nowPlayingSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).nowPlayingSession;
                    if (nowPlayingSession)
                        nowPlayingSession.bind("currentTransportState", function updateActionState() {
                            browseAction.requeryCanExecute()
                        })
                });
                browseAction.title = String.load(String.id.IDS_HOME_NOW_PLAYING_LC);
                browseAction.parameter = {showNowPlaying: true};
                browseAction.canExecute = function browseCanExecuteOverride(parameter) {
                    var nowPlayingSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).nowPlayingSession;
                    return nowPlayingSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing
                };
                this.panelAction = {action: browseAction}
            }
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)) {
                this.viewModel.getItems();
                this.viewModel.isFeatureEnabled = true
            }
        }, {
            viewModel: null, doNotRaisePanelReady: true, features: null, dispose: function dispose() {
                    if (this.viewModel && this.viewModel.dispose) {
                        this.viewModel.dispose();
                        this.viewModel = null
                    }
                }
        })})
})()
