/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {MusicPlaylistInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseMediaInlineDetails", null, function musicPlaylistInlineDetails(element, options) {
            this.templateStorage = "/Components/InlineDetails/MusicPlaylistInlineDetails.html";
            if (MS.Entertainment.Utilities.isMusicApp1)
                this.templateName = "musicPlaylistInlineDetailsTemplate";
            else
                this.templateName = "music2PlaylistInlineDetailsTemplate";
            this.moveUpAction = new MS.Entertainment.UI.Actions.Playlists.MoveTrackUpAction;
            this.moveDownAction = new MS.Entertainment.UI.Actions.Playlists.MoveTrackDownAction;
            if (MS.Entertainment.Utilities.isMusicApp2) {
                this.playlistSize = {
                    width: 532, height: 532
                };
                this._supportsReorder = false
            }
        }, {
            playlistSize: {
                width: 215, height: 215
            }, tracks: null, _songCount: 0, _queryResults: null, _lastInvokedIndex: -1, _currentMoveUpButton: null, _currentMoveDownButton: null, eventHandlers: null, _playlistQuery: null, _disableActionsOnListSelection: true, _browseAlbumsButtonFocused: false, _enableCurrentButtonsBinding: true, _currentFilterZeroSongs: false, _localTrackQuery: null, _supportsReorder: true, _updateImmediately: false, _smartBuyStateEngineBindings: null, initialize: function initialize() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this, arguments);
                    if (MS.Entertainment.Utilities.isMusicApp2)
                        this._list.ensureNextItemVisibleCount = 2;
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("playlist")
                    });
                    this.moveUpAction.playlist = this.media;
                    this.moveDownAction.playlist = this.media;
                    this.moveUpAction.bind("isEnabled", this._onMoveUpEnabled.bind(this));
                    this.moveDownAction.bind("isEnabled", this._onMoveDownEnabled.bind(this));
                    MS.Entertainment.UI.assert(this.originalLocation === MS.Entertainment.Data.ItemLocation.collection, "playlists not supported in marketplace view");
                    MS.Entertainment.UI.assert(this.media.inCollection, "media item in collection view is not in collection");
                    this._showPanel(true);
                    this._setupSmartBuy();
                    var removeItemCallback = this._removeItem.bind(this);
                    this._list.invocationHelper.addInvocationHandlers({removeFromPlaylist: removeItemCallback});
                    WinJS.Promise.timeout().then(function() {
                        if (!this.smartBuyStateEngine)
                            return;
                        this._loadLocalTracks()
                    }.bind(this));
                    this._formatDetailString();
                    this._formatPlaylistName();
                    this._formatPlaylistDuration();
                    this._formatPlaylistSubtitle();
                    this._setupPlaylistChangedListener();
                    if (MS.Entertainment.Utilities.isMusicApp1) {
                        this._list.addSelectionHandlers({removeFromPlaylist: removeItemCallback});
                        this._eventHandlers = MS.Entertainment.Utilities.addEvents(this.domElement, {iteminvoked: this._itemInvoked.bind(this)});
                        this._shareModel()
                    }
                    else
                        this._updateImmediately = true
                }, freeze: function freeze() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this);
                    if (this._playlistQuery && this._playlistQuery.pause)
                        this._playlistQuery.pause()
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    if (this._playlistQuery && this._playlistQuery.unpause)
                        this._playlistQuery.unpause();
                    if (MS.Entertainment.Utilities.isMusicApp2) {
                        this._loadLocalTracks();
                        MS.Entertainment.UI.Framework.focusFirstInSubTree(this._actionColumn)
                    }
                }, _setupPlaylistChangedListener: function _setupPlaylistChangedListener() {
                    this._playlistQuery = new MS.Entertainment.Data.Query.libraryPlaylists;
                    this._playlistQuery.isLive = true;
                    this._playlistQuery.playlistId = this.media.libraryId;
                    this._playlistQuery.execute().done(function getResults(results) {
                        var recentResults = results;
                        recentResults.result.items.setNotificationHandler(new MS.Entertainment.UI.Actions.Playlists.playlistDataNotificationHandler(null, this._handleRecentPlaylistDataNotifications.bind(this)))
                    }.bind(this), function onError(){})
                }, _handleRecentPlaylistDataNotifications: function _handleRecentPlaylistDataNotifications(newItems, oldItems) {
                    var currentIndex = newItems.length ? newItems.length - 1 : -1;
                    var newItem = currentIndex >= 0 ? newItems[currentIndex] : null;
                    while (currentIndex > 0 && newItem && newItem.data.libraryId !== this.media.libraryId) {
                        currentIndex--;
                        newItem = newItems[currentIndex]
                    }
                    {};
                    if (!newItem || newItem.data.libraryId !== this.media.libraryId)
                        return;
                    MS.Entertainment.Utilities.copyAugmentedProperties(newItem.data, this.media);
                    this.media.tracks = this.tracks;
                    var countPromise = WinJS.Promise.wrap(newItem.data.count);
                    if (this._list.dataSource && MS.Entertainment.Utilities.isMusicApp1)
                        countPromise = this._list.dataSource.getCount();
                    countPromise.done(function updateCount(count) {
                        if (count === 0 && this.media.count) {
                            count = this.media.count;
                            this._showTracks(true)
                        }
                        if (this._songCount !== count)
                            this.smartBuyStateEngine.updateState();
                        this._songCount = count;
                        this._formatDetailString(this._songCount);
                        this._formatPlaylistName();
                        this._formatPlaylistDuration();
                        this.playlistDuration = newItem.data.duration ? MS.Entertainment.Utilities.formatTimeString(newItem.data.duration) : String.empty;
                        if (this._songCount === 0)
                            this._showTracks(false)
                    }.bind(this), function handlerError(error) {
                        MS.Entertainment.Pages.fail("Failed to get count. Error message: " + error && error.message)
                    })
                }, _handleActionsReady: function _handleActionsReady(event) {
                    if (MS.Entertainment.Utilities.isMusicApp2 && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).overlayVisible && MS.Entertainment.UI.Framework.canMoveFocus(event.srcElement) && this._songCount)
                        MS.Entertainment.UI.Framework.focusFirstInSubTree(event.srcElement)
                }, _setupSmartBuy: function _setupSmartBuy() {
                    if (this.smartBuyStateEngine) {
                        this.smartBuyStateEngine.initialize(this.media, MS.Entertainment.ViewModels.SmartBuyButtons.getPlaylistInlineDetailsButtons(this.media, MS.Entertainment.UI.Actions.ExecutionLocation.popover), function onPlaylistPopoverStateChanged(stateInfo) {
                            if (stateInfo && this.originalLocation !== MS.Entertainment.Data.ItemLocation.collection || (!this.media.inCollection && !stateInfo.canPlay) || this.media.count <= 0)
                                this._showTracks(false);
                            var buttons;
                            if (this.smartBuyStateEngine)
                                buttons = MS.Entertainment.ViewModels.MusicStateHandlers.onPlaylistPopoverStateChanged.call(this.smartBuyStateEngine, stateInfo);
                            else
                                buttons = WinJS.Promise.wrap([]);
                            return buttons
                        }.bind(this), {updateImmediately: this._updateImmediately});
                        if (MS.Entertainment.Utilities.isMusicApp2)
                            this._smartBuyStateEngineBindings = WinJS.Binding.bind(this.smartBuyStateEngine, {currentButtons: function updateButtons(newValue) {
                                    if (newValue && newValue.length) {
                                        this.actionButtons = new MS.Entertainment.ObservableArray(newValue).bindableItems;
                                        if (!this.domElement.contains(document.activeElement))
                                            WinJS.Promise.timeout(50).done(function setFocus() {
                                                MS.Entertainment.UI.Framework.focusFirstInSubTree(this._actionColumn)
                                            }.bind(this))
                                    }
                                }.bind(this)})
                    }
                }, unload: function unload() {
                    if (this._eventHandlers)
                        this._eventHandlers.cancel();
                    if (this._playlistQuery) {
                        this._playlistQuery.dispose();
                        this._playlistQuery = null
                    }
                    if (this._localTrackQuery) {
                        this._localTrackQuery.dispose();
                        this._localTrackQuery = null
                    }
                    if (this._smartBuyStateEngineBindings) {
                        this._smartBuyStateEngineBindings.cancel();
                        this._smartBuyStateEngineBindings = null
                    }
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                }, _buttonChangedHandler: function _buttonChangedHandler() {
                    this._setTrackDataSource()
                }, _setTrackDataSource: function _setTrackDataSource() {
                    this._list.dataSource = this.tracks;
                    this._showTracks(this._songCount > 0)
                }, _itemInvoked: function _itemInvoked(event) {
                    event.detail.itemPromise.then(function getItemData(data) {
                        if (this._lastInvokedIndex !== data.index || event.detail.rerender) {
                            this._updateParameters(data.data.playlistItemId, data.index);
                            var trackDomElement = this._list.getElementAtIndex(data.index);
                            var buttonContainer = trackDomElement.querySelector(".inlineDetailsMoveTrackUpButton");
                            var moveUpControl = buttonContainer ? buttonContainer.winControl : null;
                            MS.Entertainment.UI.assert(moveUpControl, "the move track up button is missing");
                            if (moveUpControl) {
                                this._currentMoveUpButton = moveUpControl;
                                this._setControlOptions(moveUpControl, this.moveUpAction)
                            }
                            buttonContainer = trackDomElement.querySelector(".inlineDetailsMoveTrackDownButton");
                            var moveDownControl = buttonContainer ? buttonContainer.winControl : null;
                            MS.Entertainment.UI.assert(moveDownControl, "the move track down button is missing");
                            if (moveDownControl) {
                                this._currentMoveDownButton = moveDownControl;
                                this._setControlOptions(moveDownControl, this.moveDownAction)
                            }
                            this._lastInvokedIndex = data.index
                        }
                        else {
                            this._currentMoveUpButton = null;
                            this._currentMoveDownButton = null;
                            this._lastInvokedIndex = -1
                        }
                    }.bind(this));
                    event.stopPropagation()
                }, _updateParameters: function _updateParameters(playlistItemId, index) {
                    var parameter = {
                            playlistContentId: playlistItemId, index: index, postExecute: this._swapItems.bind(this)
                        };
                    this.moveUpAction.parameter = parameter;
                    this.moveDownAction.parameter = parameter
                }, _onMoveUpEnabled: function _onMoveUpEnabled(enabled) {
                    if (this._currentMoveUpButton)
                        this._currentMoveUpButton.isDisabled = !enabled
                }, _onMoveDownEnabled: function _onMoveDownEnabled(enabled) {
                    if (this._currentMoveDownButton)
                        this._currentMoveDownButton.isDisabled = !enabled
                }, _onFocusIn: function _onFocusIn() {
                    WinJS.Utilities.addClass(this._list.domElement, "focused")
                }, _onFocusOut: function _onFocusOut() {
                    WinJS.Utilities.removeClass(this._list.domElement, "focused")
                }, _setControlOptions: function _setControlOptions(control, action) {
                    if (control) {
                        control.action = action;
                        control.text = action.title;
                        control.icon = action.iconInfo.icon;
                        control.isDisabled = !action.isEnabled;
                        control.tabIndex = action.tabIndex;
                        control.automationId = action.automationId
                    }
                }, _swapItems: function _swapItems(index, insertBefore) {
                    var key = null;
                    if (this._list && this._list.dataSource)
                        key = this._list.dataSource.keyFromIndex(index);
                    MS.Entertainment.Pages.assert(!!key, "Key not found for index: " + index);
                    if (key) {
                        var insertIndex = insertBefore < this._songCount ? insertBefore : insertBefore - 1;
                        var nextKey = this._list.dataSource.keyFromIndex(insertIndex);
                        MS.Entertainment.Pages.assert(!!nextKey, "Key not found for index: " + insertIndex);
                        if (nextKey) {
                            if (insertBefore < this._songCount)
                                this._list.internalDataSource.moveBefore(key, nextKey);
                            else
                                this._list.internalDataSource.moveAfter(key, nextKey);
                            this._list.getFirstVisibleIndex().then(function updateIndex(firstIndex) {
                                if (insertBefore <= firstIndex) {
                                    if (firstIndex > 0)
                                        this._list.setFirstVisibleIndex(firstIndex - 1)
                                }
                                else
                                    this._list.getLastVisibleIndex().then(function updateIndex(lastIndex) {
                                        if (insertBefore > lastIndex - 1)
                                            this._list.ensureVisible(insertBefore);
                                        else
                                            this._list.setFirstVisibleIndex(firstIndex)
                                    }.bind(this))
                            }.bind(this));
                            var newIndex = insertBefore < index ? insertBefore : insertBefore - 1;
                            var oldParameter = this.moveUpAction.parameter;
                            this._updateParameters(oldParameter.playlistitemId, newIndex);
                            this._lastInvokedIndex = newIndex
                        }
                    }
                }, _removeItem: function _removeItem(eventArgs) {
                    if (!this._supportsReorder) {
                        this._localTrackQuery.forceLiveRefresh();
                        this._playlistQuery.forceLiveRefresh();
                        return
                    }
                    var removedIndices = (eventArgs.detail && eventArgs.detail.removedIndices) || [];
                    var complete = eventArgs.detail && eventArgs.detail.complete;
                    var returnValues = eventArgs.detail && eventArgs.detail.returnValues;
                    if (complete) {
                        var removedItems = 0;
                        removedIndices.forEach(function removeItem(index) {
                            if (index === this._lastInvokedIndex)
                                this._lastInvokedIndex = -1;
                            this._list.dataSource.removeAt(index - removedItems);
                            removedItems++
                        }.bind(this));
                        this._list.clearSelection()
                    }
                    else {
                        if (returnValues)
                            returnValues.updatedIndex = this._lastInvokedIndex;
                        {};
                        return this._lastInvokedIndex
                    }
                }, _resetReorderControl: function _resetReorderControl() {
                    if (this._lastInvokedIndex === -1)
                        return;
                    var trackDomElement = this._list.getElementAtIndex(this._lastInvokedIndex);
                    var invokedContainer = MS.Entertainment.Utilities.findParentElementByClassName(trackDomElement, "invoked");
                    if (invokedContainer)
                        WinJS.Utilities.removeClass(invokedContainer, "invoked");
                    this._lastInvokedIndex = -1
                }, _selectedIndicesChanged: function _selectedIndicesChanged(newValue, oldValue) {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype._selectedIndicesChanged.call(this, newValue, oldValue);
                    if (newValue.length > 0) {
                        this._resetReorderControl();
                        this._lastInvokedIndex = -1
                    }
                }, _onClearedFilters: function _onClearedFilters() {
                    this._loadLocalTracks()
                }, _loadLocalTracks: function loadLocalTracks() {
                    var query = new MS.Entertainment.Data.Query.libraryPlaylistMediaItems;
                    query.playlistId = this.media.libraryId;
                    query.mediaAvailability = this.collectionFilter;
                    query.isLive = false;
                    if (!this._supportsReorder) {
                        query.isLive = true;
                        this._localTrackQuery = query
                    }
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.playlist, MS.Entertainment.Utilities.isValidServiceId(this.media.cloudSyncItemId) ? this.media.cloudSyncItemId : String.empty);
                    this._list.mediaContext.containingMedia = {
                        playbackItemSource: query.clone(), playbackOffset: 0
                    };
                    query.execute().then(function queryComplete(q) {
                        this._queryResults = q.result.items;
                        this._songCount = this._queryResults.count;
                        this._formatDetailString(this._songCount);
                        this.tracks = q.result.items;
                        this._currentFilterZeroSongs = false;
                        if (this._loadedButtons)
                            this._setTrackDataSource();
                        if (this._songCount > 0 || MS.Entertainment.Utilities.isMusicApp2)
                            this._subTitleText.removeAttribute("tabindex");
                        else
                            this._subTitleText.setAttribute("tabindex", 0);
                        if (this.collectionFilter && this.collectionFilter !== Microsoft.Entertainment.Platform.MediaAvailability.available) {
                            var unfilteredQuery = new MS.Entertainment.Data.Query.libraryPlaylistMediaItems;
                            unfilteredQuery.playlistId = this.media.libraryId;
                            unfilteredQuery.executeCount().done(function unfilteredQueryComplete(unfilteredTrackCount) {
                                if (unfilteredTrackCount > this._songCount) {
                                    this._showCollectionFilter();
                                    if (this._songCount === 0) {
                                        this._subTitleText.removeAttribute("tabindex");
                                        this.detailString = String.empty;
                                        this._currentFilterZeroSongs = true;
                                        this._showTracks(false)
                                    }
                                }
                            }.bind(this), function unfilteredQueryError() {
                                this._showCollectionFilter()
                            }.bind(this))
                        }
                    }.bind(this))
                }, _formatDetailString: function _formatDetailString(count) {
                    if (count === null || count === undefined)
                        count = this.media.count;
                    var details;
                    var formattedCount;
                    if (count === 1)
                        details = String.load(String.id.IDS_DETAILS_PLAYLIST_SONG_COUNT);
                    else if (count > 1) {
                        formattedCount = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(count);
                        details = String.load(String.id.IDS_DETAILS_PLAYLIST_SONGS_COUNT).format(formattedCount)
                    }
                    else if (MS.Entertainment.Utilities.isMusicApp1)
                        details = String.load(String.id.IDS_MUSIC_EMPTY_PLAYLIST);
                    else
                        details = String.load(String.id.IDS_MUSIC2_EMPTY_PLAYLIST);
                    this.detailString = details;
                    this._formatPlaylistSubtitle()
                }, _formatPlaylistDuration: function _formatDurationString() {
                    this.playlistDuration = this.media.duration ? MS.Entertainment.Utilities.formatTimeString(this.media.duration) : String.empty
                }, _formatPlaylistName: function _formatPlaylistName() {
                    this.playlistName = this.media.name || String.load(String.id.IDS_MUSIC_PLAYLIST_LABEL)
                }, _formatPlaylistSubtitle: function _formatPlaylistSubtitle() {
                    if (this.playlistDuration)
                        this.playlistSubtitle = String.load(String.id.IDS_COMMA_SEPARATOR).format(this.detailString, this.playlistDuration);
                    else
                        this.playlistSubtitle = this.detailString
                }, _showTracks: function _showTracks(show) {
                    if (show) {
                        this._showElement(this._tracksPanel, true);
                        this._showElement(this._emptyPanel, false)
                    }
                    else {
                        this._showElement(this._tracksPanel, false);
                        if (this._currentFilterZeroSongs) {
                            WinJS.Utilities.removeClass(this._currentFilterZeroSongsText, "removeFromDisplay");
                            WinJS.Utilities.addClass(this._browseLinks, "removeFromDisplay")
                        }
                        else {
                            WinJS.Utilities.addClass(this._currentFilterZeroSongsText, "removeFromDisplay");
                            WinJS.Utilities.removeClass(this._browseLinks, "removeFromDisplay");
                            if (!this._browseAlbumsButtonFocused)
                                WinJS.Promise.timeout(250).done(function setFocus() {
                                    MS.Entertainment.UI.Framework.focusElement(this._browseAlbumsButton);
                                    this._browseAlbumsButtonFocused = true;
                                    this._focusOverriden = true
                                }.bind(this))
                        }
                        this._showElement(this._emptyPanel, true);
                        MS.Entertainment.Utilities.showElement(this._emptyPanel)
                    }
                }, onBrowseAlbums: function onBrowseAlbums(event) {
                    this._sendTelemetryEvent("MusicPlaylistInlineDetails_BrowseAlbums");
                    this._makeActivePlaylist();
                    if (this._overlay && MS.Entertainment.Utilities.isMusicApp1)
                        this._overlay.hide();
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    navigationService.navigateTo(MS.Entertainment.UI.Monikers.musicCollection, MS.Entertainment.UI.Monikers.musicCollectionByAlbum, null, {
                        selectHub: true, disableSavingSelectedHub: true
                    })
                }, onBrowseAllMusic: function onBrowseAllMusic(event) {
                    this._sendTelemetryEvent("MusicPlaylistInlineDetails_BrowseAllMusic");
                    this._makeActivePlaylist();
                    if (this._overlay && MS.Entertainment.Utilities.isMusicApp1)
                        this._overlay.hide();
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    navigationService.navigateTo(MS.Entertainment.UI.Monikers.musicMarketplace, MS.Entertainment.UI.Monikers.musicMarketplaceAlbums)
                }, _sendTelemetryEvent: function _sendTelemetryEvent(event) {
                    MS.Entertainment.Utilities.Telemetry.logTelemetryEvent(event)
                }, _makeActivePlaylist: function _makeActivePlaylist() {
                    var playlistProvider = (new Microsoft.Entertainment.Platform.MediaStore).playlistProvider;
                    playlistProvider.setPlaylistDateEditedToNowAsync(this.media.libraryId)
                }
        }, {
            moveUpAction: null, moveDownAction: null, playlistDuration: null, playlistName: null, playlistSubtitle: null, actionButtons: null
        })})
})()
