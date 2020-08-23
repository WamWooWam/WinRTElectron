/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/imageidtypes.js", "/Framework/imageloader.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingMetadata: MS.Entertainment.UI.Framework.defineUserControl("/Controls/NowPlaying/NowPlayingMetadata.html#nowPlayingMetadataTemplate", function(element, options) {
            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState)
        }, {
            _uiStateService: null, _modelItem: null, _mainTitle: String.empty, _secondaryTitle: String.empty, _durationText: String.empty, _playlistButtonVisible: false, initialize: function initialize(){}, modelItem: {
                    get: function() {
                        return this._modelItem
                    }, set: function(value) {
                            if (value !== this._modelItem) {
                                var oldValue = this._modelItem;
                                this._modelItem = value;
                                this.notify("modelItem", value, oldValue);
                                if (this._initialized && !this._unloaded)
                                    this._modelItemChanged(value, oldValue)
                            }
                        }
                }, mainTitle: {
                    get: function() {
                        return this._mainTitle
                    }, set: function(value) {
                            if (value !== this._mainTitle) {
                                var oldValue = this._mainTitle;
                                this._mainTitle = value;
                                this.notify("mainTitle", value, oldValue);
                                if (this._initialized && !this._unloaded) {
                                    this._mainTitleText.textContent = value;
                                    if (value)
                                        WinJS.Utilities.removeClass(this._mainTitleText, "removeFromDisplay");
                                    else
                                        WinJS.Utilities.addClass(this._mainTitleText, "removeFromDisplay")
                                }
                            }
                        }
                }, subTitle: {
                    get: function() {
                        return this._subTitle
                    }, set: function(value) {
                            if (value !== this._subTitle) {
                                var oldValue = this._subTitle;
                                this._subTitle = value;
                                this.notify("subTitle", value, oldValue);
                                if (this._initialized && !this._unloaded) {
                                    this._subTitleText.textContent = value;
                                    if (value)
                                        WinJS.Utilities.removeClass(this._subTitleText, "removeFromDisplay");
                                    else
                                        WinJS.Utilities.addClass(this._subTitleText, "removeFromDisplay")
                                }
                            }
                        }
                }, durationText: {
                    get: function() {
                        return this._durationText
                    }, set: function(value) {
                            if (value !== this._durationText) {
                                var oldValue = this._durationText;
                                this._durationText = value;
                                this.notify("durationText", value, oldValue);
                                if (this._initialized && !this._unloaded) {
                                    this._timeText.textContent = value;
                                    if (!MS.Entertainment.Utilities.isMusicApp2)
                                        if (value)
                                            WinJS.Utilities.removeClass(this._timeText, "removeFromDisplay");
                                        else
                                            WinJS.Utilities.addClass(this._timeText, "removeFromDisplay")
                                }
                            }
                        }
                }, playlistButtonVisible: {
                    get: function() {
                        return this._playlistButtonVisible
                    }, set: function(value) {
                            if (value !== this._playlistButtonVisible) {
                                var oldValue = this._playlistButtonVisible;
                                this._playlistButtonVisible = value;
                                this.notify("playlistButtonVisible", value, oldValue);
                                if (this._initialized && !this._unloaded)
                                    if (value)
                                        WinJS.Utilities.removeClass(this._playlistButton, "hideFromDisplay");
                                    else
                                        WinJS.Utilities.addClass(this._playlistButton, "hideFromDisplay")
                            }
                        }
                }, unload: function unload() {
                    if (this._modelPropertyChangedHandlers) {
                        this._modelPropertyChangedHandlers.cancel();
                        this._modelPropertyChangedHandlers = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _modelItemChanged: function _modelItemChanged() {
                    var that = this;
                    if (this.modelItem && this.modelItem.mediaType >= 0) {
                        switch (this.modelItem.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.video:
                                this.mainTitle = this.modelItem.name;
                                this.subTitle = MS.Entertainment.Formatters.formatGenre(this.modelItem);
                                if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this.modelItem)) {
                                    if (this.modelItem.seriesTitle)
                                        this.mainTitle = this.modelItem.seriesTitle;
                                    else if (this.modelItem.ParentSeries)
                                        this.mainTitle = this.modelItem.ParentSeries.Name;
                                    if (this.modelItem.seasonNumber > -1 && this.modelItem.episodeNumber && this.modelItem.name)
                                        this.subTitle = String.load(String.id.IDS_TV_NUMBERED_EPISODE_SEASON_TITLE).format(this.modelItem.seasonNumber, this.modelItem.episodeNumber, this.modelItem.name);
                                    else if (this.modelItem.name)
                                        this.subTitle = this.modelItem.name
                                }
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.track:
                                this.mainTitle = this.modelItem.name;
                                this.subTitle = String.empty;
                                if (this._modelPropertyChangedHandlers) {
                                    this._modelPropertyChangedHandlers.cancel();
                                    this._modelPropertyChangedHandlers = null
                                }
                                this._modelPropertyChangedHandlers = WinJS.Binding.bind(this.modelItem, {
                                    name: function _modelItemPropertyChanged() {
                                        this.mainTitle = that.modelItem.name
                                    }.bind(this), artistName: function _modelItemPropertyChanged() {
                                            this.subTitle = MS.Entertainment.Formatters.formatAlbumAndArtistHelper(that.modelItem)
                                        }.bind(this)
                                }, false);
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.game:
                                this.mainTitle = this.modelItem.name;
                                this.subTitle = this.modelItem.primaryGenre;
                                break;
                            default:
                                this.mainTitle = this.modelItem.name;
                                this.subTitle = MS.Entertainment.Formatters.formatAlbumAndArtistHelper(this.modelItem);
                                break
                        }
                        var doNothing = function doNothing(){};
                        if (this.modelItem.hydrate)
                            this.modelItem.hydrate({forceUpdate: this.modelItem.fromCollection}).done(doNothing, doNothing)
                    }
                    else {
                        this.mainTitle = String.empty;
                        this.subTitle = String.empty
                    }
                }
        }, {playlistButtonClick: function playlistButtonClick() {
                if (this.onPlaylistClicked)
                    this.onPlaylistClicked()
            }})})
})()
