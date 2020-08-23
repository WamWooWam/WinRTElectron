/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/serviceLocator.js", "/Framework/utilities.js", "/ViewModels/MediaItemModel.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SnappedDetails: MS.Entertainment.UI.Framework.defineUserControl("/Components/ImmersiveDetails/SnappedDetails.html#snappedDetailsTemplate", function immersiveDetailsConstructor(element, options) {
            this.modelItem = {}
        }, {
            _initialized: false, _sessionMgr: null, _currentDetailsTemplatePath: null, _detailsDataContext: null, _uiStateEventHandler: null, initialize: function initialize() {
                    this.delayInitialize()
                }, _delayInitialized: function delayInitialized() {
                    if (this._uiStateEventHandler) {
                        this._uiStateEventHandler.cancel();
                        this._uiStateEventHandler = null
                    }
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager)) {
                        this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        this.detailsReady = true;
                        this._initialized = true
                    }
                    else
                        this._uiStateEventHandler = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {stageThreeActivatedChanged: function stageThreeActivatedChanged(e) {
                                if (e.detail.newValue)
                                    this._delayInitialized()
                            }.bind(this)})
                }, updateModelItem: function updateModelItem(newModel) {
                    if (newModel && newModel !== this.modelItem && (!this.modelItem || !this.modelItem.isEqual || !this.modelItem.isEqual(newModel)))
                        this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(newModel))
                }, _convertToTvSeries: function _convertToTvSeries(modelItem) {
                    var seriesMediaItem = MS.Entertainment.Data.augment({
                            id: modelItem.seriesId, libraryId: modelItem.seriesLibraryId, title: {$value: modelItem.seriesTitle}
                        }, MS.Entertainment.Data.Augmenter.Marketplace.TVSeries);
                    if (!this.modelItem || modelItem.seriesId !== this.modelItem.serviceId)
                        this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(seriesMediaItem))
                }, _convertToArtist: function _convertToArtist(modelItem) {
                    var artistMediaItem = MS.Entertainment.Data.augment({
                            id: modelItem.artistServiceId, libraryId: modelItem.artistId, name: modelItem.artistName
                        }, MS.Entertainment.Data.Augmenter.Marketplace.Music.Artist);
                    this._updateMetaData(MS.Entertainment.ViewModels.MediaItemModel.augment(artistMediaItem))
                }, _updateMetaData: function _updateMetaData(modelItem) {
                    var defaultIndex = 0;
                    if (!modelItem || !modelItem.mediaType)
                        return;
                    if (!this.modelItem)
                        MS.Entertainment.Utilities.empty(this.detailsContentContainer);
                    switch (modelItem.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.game:
                            return;
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            if (MS.Entertainment.Platform.PlaybackHelpers.isMusicVideo(modelItem) && modelItem.hasServiceId) {
                                this._convertToArtist(modelItem);
                                return
                            }
                            if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(modelItem))
                                this.setDetailsTemplate("/Components/ImmersiveDetails/SnappedTvEpisodeDetails.html#tvEpisodeOverviewTemplate", {modelItem: modelItem});
                            else
                                this.setDetailsTemplate("/Components/ImmersiveDetails/SnappedMovieDetails.html#movieOverviewTemplate", {modelItem: modelItem});
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                        case Microsoft.Entertainment.Queries.ObjectType.person:
                        case Microsoft.Entertainment.Queries.ObjectType.track:
                            return;
                        default:
                            this.setDetailsTemplate("/Components/ImmersiveDetails/SnappedMovieDetails.html#movieOverviewTemplate", {modelItem: modelItem});
                            break
                    }
                    if (modelItem.hydrate)
                        modelItem.hydrate();
                    this.modelItem = modelItem
                }, setDetailsTemplate: function setDetailsTemplate(templatePath, modelItem) {
                    if (this._currentDetailsTemplatePath !== templatePath) {
                        this._currentDetailsTemplatePath = templatePath;
                        MS.Entertainment.Utilities.empty(this.detailsContentContainer);
                        MS.Entertainment.UI.Framework.loadTemplate(templatePath).then(function renderControl(controlInstance) {
                            this._detailsDataContext = WinJS.Binding.as({dataContext: modelItem});
                            return controlInstance.render(this._detailsDataContext, this.detailsContentContainer)
                        }.bind(this))
                    }
                    else
                        this._detailsDataContext.dataContext.modelItem = modelItem.modelItem
                }
        }, {
            modelItem: null, playbackSession: null, detailsReady: false
        })})
})()
