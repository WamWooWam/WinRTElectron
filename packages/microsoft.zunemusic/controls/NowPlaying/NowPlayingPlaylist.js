/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/Components/Playback/PlaybackEventNotifications.js");
(function(undefined) {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingPlaylist: MS.Entertainment.UI.Framework.defineUserControl("/Controls/NowPlaying/NowPlayingPlaylist.html#nowPlayingPlaylistTemplate", function nowPlayingPlaylistConstructor(element, options) {
            this._bindingsToDetach = [];
            this.closeAction = new MS.Entertainment.UI.Actions.Action;
            this.closeAction.executed = this.closeButtonClick.bind(this);
            this.closeAction.canExecute = function closeButtonCanExecute() {
                return true
            };
            if (options.dataContext) {
                this.dataSource = options.dataContext.dataSource || this.dataSource;
                this.playbackSession = options.dataContext.playbackSession || this.playbackSession;
                this.galleryTemplate = options.dataContext.galleryTemplate || this.galleryTemplate
            }
        }, {
            _bindingsToDetach: null, _eventHandlers: null, _hasSetFocus: false, _uiStateBindings: null, _selectionEvents: null, _invocationHelperEvents: null, galleryTemplate: null, jumpToCurrentIndex: true, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.assert(this.galleryTemplate, "No gallery template was supplied to the NowPlayingPlaylist. This needs to happen before initialization");
                    if (this.galleryView)
                        this.galleryView.mediaContext = {containingMedia: null};
                    if (this.galleryView && this.galleryTemplate) {
                        this.galleryView.itemTemplate = this.galleryTemplate.itemTemplate || this.galleryView.itemTemplate;
                        this.galleryView.layout = this.galleryTemplate.layout || this.galleryView.layout;
                        if (this.galleryTemplate.galleryClass)
                            WinJS.Utilities.addClass(this.galleryView.domElement, this.galleryTemplate.galleryClass);
                        if (this.galleryView.setReadyStateCallback && this._handleReadyStateChanges)
                            this.galleryView.setReadyStateCallback(this._handleReadyStateChanges.bind(this))
                    }
                    if (this.galleryTemplate.ensureNextItemVisibleCount > 0)
                        this.galleryView.ensureNextItemVisibleCount = this.galleryTemplate.ensureNextItemVisibleCount;
                    this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                    this.bind("dataSource", this._dataSourceChanged.bind(this));
                    var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                    this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                        MSPointerDown: this.galleryMouseDown, pointerdown: this.galleryMousedown, keydown: this._keyDown.bind(this)
                    });
                    this._uiStateBindings = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {isSnapped: this._onSnappedChanged.bind(this)});
                    this._updateContainingMedia()
                }, unload: function unload() {
                    this._detachBindings();
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    if (this._uiStateBindings) {
                        this._uiStateBindings.cancel();
                        this._uiStateBindings = null
                    }
                    if (this._invocationHelperEvents) {
                        this._invocationHelperEvents.cancel();
                        this._invocationHelperEvents = null
                    }
                    if (this._selectionEvents) {
                        this._selectionEvents.cancel();
                        this._selectionEvents = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _onSnappedChanged: function _onSnappedChanged(newValue, oldValue) {
                    if (oldValue !== undefined && newValue && this.galleryView) {
                        this.galleryView.clearSelection();
                        this.galleryView.clearInvocation()
                    }
                }, _detachBindings: function _detachBindings() {
                    this._bindingsToDetach.forEach(function(e) {
                        e.source.unbind(e.name, e.action)
                    });
                    this._bindingsToDetach = []
                }, _initializeBinding: function _initializeBinding(source, name, action) {
                    source.bind(name, action);
                    this._bindingsToDetach.push({
                        source: source, name: name, action: action
                    })
                }, _keyDown: function _keyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.escape)
                        this.closeButtonClick()
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    this._detachBindings();
                    if (this.playbackSession) {
                        this._initializeBinding(this.playbackSession, "currentOrdinal", this._currentOrdinalChanged.bind(this));
                        this._initializeBinding(this.playbackSession, "mediaCollection", this._mediaCollectionChanged.bind(this));
                        this._initializeBinding(this.playbackSession, "smartDJSeed", this._smartDJSeedChanged.bind(this))
                    }
                    this._updateContainingMedia()
                }, _smartDJSeedChanged: function _smartDJSeedChanged() {
                    if (this._unloaded)
                        return;
                    this.playlistTitle = this._getPlaylistTitle()
                }, _mediaCollectionChanged: function _mediaCollectionChanged(newVal, oldVal) {
                    if (this._unloaded)
                        return;
                    var showHeader = false;
                    if (this.playbackSession) {
                        showHeader = !!this.playbackSession.smartDJSeed;
                        var oldDataSource = this.dataSource;
                        this.dataSource = this.playbackSession.mediaCollection || null;
                        this._dataSourceChanged(this.dataSource, oldDataSource)
                    }
                    this.playlistTitle = this._getPlaylistTitle()
                }, _getPlaylistTitle: function _getPlaylistTitle() {
                    var playlistTitle = String.empty;
                    var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    var smartDJSeed = this.playbackSession && this.playbackSession.smartDJSeed;
                    if (!uiState.isSnapped)
                        playlistTitle = smartDJSeed ? String.load(String.id.IDS_SMARTDJ_CARD_LABEL) : String.empty;
                    else if (smartDJSeed)
                        playlistTitle = smartDJSeed.name;
                    return playlistTitle
                }, _dataSourceChanged: function _dataSourceChanged(newVal, oldVal) {
                    if (this.galleryView && this.galleryView.dataSource !== newVal)
                        this.galleryView.dataSource = newVal
                }, _updateContainingMedia: function _updateContainingMedia() {
                    if (this.galleryView && this.galleryView.mediaContext)
                        this.galleryView.mediaContext.containingMedia = {
                            playbackItemSource: this.playbackSession || this.dataSource, playbackOffset: 0
                        }
                }, _currentOrdinalChanged: function _currentOrdinalChanged() {
                    if (!this.jumpToCurrentIndex)
                        return;
                    if (this.playbackSession && this.galleryView)
                        if (this.playbackSession.currentOrdinal !== null && this.playbackSession.currentOrdinal !== undefined) {
                            this.selectedIndex = this.playbackSession.currentOrdinal;
                            if (this.galleryView.dataSource)
                                this.galleryView.ensureVisible(this.playbackSession.currentOrdinal);
                            else
                                this.galleryView.initialVisible = this.playbackSession.currentOrdinal
                        }
                        else
                            this.selectedIndex = -1
                }
        }, {
            items: null, dataSource: null, playbackSession: null, playlistTitle: "", selectedIndex: -1, closeClicked: null, saveButtonClick: function saveButtonClick() {
                    MS.Entertainment.UI.Controls.NewPlaylistOverlay.show(this.playbackSession.mediaCollection)
                }, closeButtonClick: function closeButtonClick(event) {
                    if (this.closeClicked)
                        this.closeClicked()
                }, galleryMouseDown: function galleryMouseDown(event) {
                    event.cancelBubble = true
                }
        }, {})})
})()
