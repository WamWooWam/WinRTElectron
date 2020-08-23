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
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
            var Utilities = MS.Entertainment.Utilities;
            var NowPlayingTemplates = (function() {
                    function NowPlayingTemplates(){}
                    NowPlayingTemplates.songs = {
                        debugId: "nowPlayingSongs", unsnappedItemTemplate: "select(.template-nowPlayingSongTemplate)", snappedItemTemplate: "select(.templateid-nowPlayingSnappedSongTemplate)", tap: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, layout: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Layout.list, orientation: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Orientation.vertical, zoomedOutLayout: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.ZoomedOutLayout.list, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.inline, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, itemsDraggable: true, forceInteractive: true, maxRows: NaN, minimumListLength: 1, grouped: false, hideShadow: true, allowZoom: false, allowSelectAll: false, delayHydrateLibraryId: true, selectionStyleFilled: false, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, selectionMode: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.single, strings: {countFormatStringId: String.id.IDS_MUSIC_TYPE_TRACK_PLURAL}, listViewClassName: "gallery-songs"
                    };
                    return NowPlayingTemplates
                })();
            ViewModels.NowPlayingTemplates = NowPlayingTemplates;
            var ChildNowPlayingVisualizationViewModel = (function(_super) {
                    __extends(ChildNowPlayingVisualizationViewModel, _super);
                    function ChildNowPlayingVisualizationViewModel() {
                        _super.apply(this, arguments)
                    }
                    ChildNowPlayingVisualizationViewModel.prototype.navigateToArtist = function() {
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (!sessionMgr.primarySession)
                            return;
                        if (WinJS.Utilities.getMember("primarySession.currentMedia.artist", sessionMgr)) {
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var artistDetailsNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate);
                            var hasLibraryId = Utilities.isValidLibraryId(sessionMgr.primarySession.currentMedia.artist.libraryId);
                            artistDetailsNavigateAction.parameter = {
                                data: sessionMgr.primarySession.currentMedia.artist, location: hasLibraryId ? MS.Entertainment.Data.ItemLocation.collection : MS.Entertainment.Data.ItemLocation.marketplace
                            };
                            artistDetailsNavigateAction.execute()
                        }
                    };
                    return ChildNowPlayingVisualizationViewModel
                })(ViewModels.BaseChildNowPlayingVisualizationViewModel);
            ViewModels.ChildNowPlayingVisualizationViewModel = ChildNowPlayingVisualizationViewModel;
            var NowPlayingVisualizationViewModel = (function(_super) {
                    __extends(NowPlayingVisualizationViewModel, _super);
                    function NowPlayingVisualizationViewModel() {
                        _super.call(this);
                        this._count = 0;
                        this._hideSavePlaylistButton = true;
                        this._hideFullScreenButton = true;
                        this.title = String.empty;
                        this.subTitle = String.empty
                    }
                    NowPlayingVisualizationViewModel.prototype.onThaw = function() {
                        _super.prototype.onThaw.call(this);
                        this._displayRequestActive()
                    };
                    NowPlayingVisualizationViewModel.prototype.onFreeze = function() {
                        _super.prototype.onFreeze.call(this);
                        this._displayRequestRelease()
                    };
                    NowPlayingVisualizationViewModel.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._releaseOverlay()
                    };
                    Object.defineProperty(NowPlayingVisualizationViewModel.prototype, "count", {
                        get: function() {
                            return this._count
                        }, set: function(value) {
                                this.updateAndNotify("count", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingVisualizationViewModel.prototype, "isExcludedFromPageState", {
                        get: function() {
                            return this._isExcludedFromPageState
                        }, set: function(value) {
                                this.updateAndNotify("isExcludedFromPageState", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingVisualizationViewModel.prototype, "title", {
                        get: function() {
                            return this._title
                        }, set: function(value) {
                                this.updateAndNotify("title", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingVisualizationViewModel.prototype, "subTitle", {
                        get: function() {
                            return this._subTitle
                        }, set: function(value) {
                                this.updateAndNotify("subTitle", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingVisualizationViewModel.prototype, "moduleState", {
                        get: function() {
                            return this._moduleState
                        }, set: function(value) {
                                this.updateAndNotify("moduleState", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingVisualizationViewModel.prototype, "hideSavePlaylistButton", {
                        get: function() {
                            return this._hideSavePlaylistButton
                        }, set: function(value) {
                                this.updateAndNotify("hideSavePlaylistButton", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingVisualizationViewModel.prototype, "hideFullScreenButton", {
                        get: function() {
                            return this._hideFullScreenButton
                        }, set: function(value) {
                                this.updateAndNotify("hideFullScreenButton", value)
                            }, enumerable: true, configurable: true
                    });
                    NowPlayingVisualizationViewModel.prototype.refreshItems = function(){};
                    NowPlayingVisualizationViewModel.prototype.reload = function() {
                        return this.load()
                    };
                    NowPlayingVisualizationViewModel.prototype.freeze = function(){};
                    NowPlayingVisualizationViewModel.prototype.thaw = function(){};
                    NowPlayingVisualizationViewModel.prototype.load = function() {
                        var _this = this;
                        return _super.prototype.load.call(this).then(function() {
                                _this.moduleState = 2;
                                return _this
                            }, function() {
                                _this.moduleState = -1;
                                return _this
                            })
                    };
                    NowPlayingVisualizationViewModel.prototype._onMediaCollectionSizeChanges = function(args) {
                        return WinJS.Promise.join([_super.prototype._onMediaCollectionSizeChanges.call(this, args), this._updateTitlesAndCounts()])
                    };
                    NowPlayingVisualizationViewModel.prototype.createChildNowPlayingingVisualizationViewModel = function(mediaItem, ordinal) {
                        return new ChildNowPlayingVisualizationViewModel(mediaItem, ordinal)
                    };
                    NowPlayingVisualizationViewModel.prototype._updateTitlesAndCounts = function() {
                        var _this = this;
                        var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var mediaCollection = sessionManager.primarySession && sessionManager.primarySession.mediaCollection;
                        var smartDJSeed = sessionManager.primarySession && sessionManager.primarySession.smartDJSeed;
                        if (smartDJSeed)
                            this.title = String.load(String.id.IDS_MUSIC_NOW_PLAYING_ARTIST_RADIO).format(smartDJSeed.name);
                        else
                            this.title = String.load(String.id.IDS_MUSIC_NOW_PLAYING_SC);
                        return ((mediaCollection) ? (mediaCollection.getCount()) : (WinJS.Promise.as(0))).then(function(count) {
                                if (!smartDJSeed)
                                    _this.subTitle = MS.Entertainment.Formatters.formatCount(count, MS.Entertainment.Formatters.trackCountText);
                                else
                                    _this.subTitle = String.empty;
                                _this.count = count;
                                _this._updateSavePlaylistButtonVisibility();
                                _this.hideFullScreenButton = _this.count <= 0;
                                return _this
                            })
                    };
                    NowPlayingVisualizationViewModel.prototype._updateSavePlaylistButtonVisibility = function() {
                        var sessionManager = null;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        this.hideSavePlaylistButton = this.count <= 0 || !sessionManager || !!(sessionManager.playContext && sessionManager.playContext.activationFilePath)
                    };
                    NowPlayingVisualizationViewModel.prototype.savePlaylist = function(event) {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var savePlaylistAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.saveNowPlayingPlaylist);
                        savePlaylistAction.automationId = MS.Entertainment.UI.AutomationIds.playlistSaveNowPlayingPlaylistNameEntry;
                        savePlaylistAction.parameter = {showPlaylistPopover: false};
                        savePlaylistAction.referenceContainer = {domElement: event.target};
                        savePlaylistAction.execute()
                    };
                    NowPlayingVisualizationViewModel.prototype.showFullScreenNowPlaying = function() {
                        var _this = this;
                        if (this.disposed)
                            return;
                        var overlay = this._fullScreenOverlay;
                        if (!overlay) {
                            this._releaseOverlay();
                            overlay = this._fullScreenOverlay = MS.Entertainment.UI.Controls.VisualizationContainer.showOverlay(this);
                            if (this._fullScreenOverlay) {
                                this._displayRequestActive();
                                this._fullScreenOverlayHandlers = Utilities.addEventHandlers(this._fullScreenOverlay, {close: function() {
                                        _this._releaseOverlay()
                                    }})
                            }
                        }
                        this.dispatchEvent("fullScreenShown");
                        return overlay
                    };
                    NowPlayingVisualizationViewModel.prototype.navigateToArtist = function() {
                        if (this.currentChild && this.currentChild instanceof ChildNowPlayingVisualizationViewModel)
                            this.currentChild.navigateToArtist()
                    };
                    NowPlayingVisualizationViewModel.prototype._displayRequestActive = function() {
                        var sessionManager = null;
                        if (this._fullScreenOverlay && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager)) {
                            sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            sessionManager.displayRequestActive()
                        }
                    };
                    NowPlayingVisualizationViewModel.prototype._displayRequestRelease = function() {
                        var sessionManager = null;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager)) {
                            sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            sessionManager.displayRequestRelease()
                        }
                    };
                    NowPlayingVisualizationViewModel.prototype._releaseOverlay = function() {
                        this._displayRequestRelease();
                        if (this._fullScreenOverlayHandlers) {
                            this._fullScreenOverlayHandlers.cancel();
                            this._fullScreenOverlayHandlers = null
                        }
                        this._fullScreenOverlay = null
                    };
                    return NowPlayingVisualizationViewModel
                })(MS.Entertainment.ViewModels.BaseNowPlayingVisualizationViewModel);
            ViewModels.NowPlayingVisualizationViewModel = NowPlayingVisualizationViewModel;
            var NowPlayingViewModel = (function(_super) {
                    __extends(NowPlayingViewModel, _super);
                    function NowPlayingViewModel(view) {
                        _super.call(this, view);
                        this._viewStateViewModel = null;
                        this._nowPlayingVisualization = null;
                        this._primarySessionBindings = null;
                        this._mediaCollectionBindings = null;
                        this._listNotificationHandlerHandlers = null;
                        this.__delayInitializeSignal = null;
                        this._emptyViewActions = null;
                        this.selectedTemplate = MS.Entertainment.ViewModels.NowPlayingTemplates.songs;
                        this.refresh()
                    }
                    NowPlayingViewModel.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        if (this._nowPlayingVisualization) {
                            this._nowPlayingVisualization.dispose();
                            this._nowPlayingVisualization = null
                        }
                        if (this._nowPlayingVisualizationHandler) {
                            this._nowPlayingVisualizationHandler.cancel();
                            this._nowPlayingVisualizationHandler = null
                        }
                        if (this._primarySessionBindings) {
                            this._primarySessionBindings.cancel();
                            this._primarySessionBindings = null
                        }
                        if (this._mediaCollectionBindings) {
                            this._mediaCollectionBindings.cancel();
                            this._mediaCollectionBindings = null
                        }
                        if (this._listNotificationHandlerHandlers) {
                            this._listNotificationHandlerHandlers.cancel();
                            this._listNotificationHandlerHandlers = null
                        }
                        if (this._nowPlayingListBinding) {
                            this._nowPlayingListBinding.release();
                            this._nowPlayingListBinding = null
                        }
                        if (this._delayInitializeScripts) {
                            this._delayInitializeScripts.cancel();
                            this._delayInitializeScripts = null
                        }
                    };
                    NowPlayingViewModel.prototype.getViewDefinition = function(view) {
                        return MS.Entertainment.ViewModels.NowPlayingViewModel.Views[view]
                    };
                    Object.defineProperty(NowPlayingViewModel.prototype, "enableDelayInitialize", {
                        get: function() {
                            return true
                        }, enumerable: true, configurable: true
                    });
                    NowPlayingViewModel.prototype.delayInitialize = function() {
                        var _this = this;
                        this._delayInitializeScripts = MS.Entertainment.Utilities.schedulePromiseBelowNormal(null, "NowPlayingPageDelayedScripts").then(function() {
                            return WinJS.UI.Fragments.renderCopy("/Components/Music1/NowPlayingPageDelayedScripts.html")
                        }).then(null, function(error) {
                            MS.Entertainment.ViewModels.assert(WinJS.Promise.isCanceledError(error), "Failed to load delayed scripts. error: " + (error && error.message))
                        }).then(function() {
                            if (_this._disposed)
                                return;
                            _this._delayInitializeScripts = null;
                            _this.nowPlayingVisualization.load();
                            _super.prototype.delayInitialize.call(_this);
                            _this._initializeEmptyViewStateActions();
                            _this._raiseDelayLoadedEvent();
                            _this._delayInitializeSignal.complete()
                        })
                    };
                    Object.defineProperty(NowPlayingViewModel.prototype, "nowPlayingVisualization", {
                        get: function() {
                            if (!this._nowPlayingVisualization && !this._disposed) {
                                this._nowPlayingVisualization = new NowPlayingVisualizationViewModel;
                                this._nowPlayingVisualizationHandler = MS.Entertainment.Utilities.addEventHandlers(this._nowPlayingVisualization, {fullScreenShown: this._raiseShouldClearSelection.bind(this)})
                            }
                            return this._nowPlayingVisualization
                        }, enumerable: true, configurable: true
                    });
                    NowPlayingViewModel.prototype.loadModules = function(){};
                    NowPlayingViewModel.prototype.freeze = function(){};
                    NowPlayingViewModel.prototype.thaw = function(){};
                    Object.defineProperty(NowPlayingViewModel.prototype, "delayInitializePromise", {
                        get: function() {
                            return this._delayInitializeSignal.promise
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingViewModel.prototype, "_delayInitializeSignal", {
                        get: function() {
                            if (!this.__delayInitializeSignal)
                                this.__delayInitializeSignal = new MS.Entertainment.UI.Framework.Signal;
                            return this.__delayInitializeSignal
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(NowPlayingViewModel.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = new Array;
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_ERROR_HEADER), String.load(String.id.IDS_MUSIC_ERROR_DETAILS), []);
                                viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_TITLE), String.load(String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_SUBTITLE), this._initializeEmptyViewStateActions());
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    NowPlayingViewModel.prototype._initializeEmptyViewStateActions = function() {
                        if (!this._emptyViewActions)
                            this._emptyViewActions = new MS.Entertainment.ObservableArray;
                        if (this.isDelayInitialized && this._emptyViewActions.length === 0)
                            this._populateObservableArrayWithEmptyActions(this._emptyViewActions);
                        return this._emptyViewActions
                    };
                    NowPlayingViewModel.prototype._populateObservableArrayWithEmptyActions = function(array) {
                        var actions = this._createEmptyViewStateActions();
                        if (actions && actions.length)
                            array.spliceArray(0, 0, actions)
                    };
                    NowPlayingViewModel.prototype._createEmptyViewStateActions = function() {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var emptyActions = [];
                        emptyActions.push(new ViewModels.ActionItem(String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_ACTION_COLLECTION, String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_ACTION_COLLECTION_DESC, actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.collectionNavigate), MS.Entertainment.UI.Icon.mediaMusic));
                        var featureEnablement = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.featureEnablement);
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.smartDJMarketplace))
                            emptyActions.push(new ViewModels.ActionItem(String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_ACTION_RADIO, String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_ACTION_RADIO_DESC, actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.radioNavigate), MS.Entertainment.UI.Icon.smartDjNoRing));
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                            emptyActions.push(new ViewModels.ActionItem(String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_ACTION_EXPLORE, String.id.IDS_MUSIC_NOW_PLAYING_EMPTY_ACTION_EXPLORE_DESC, actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.exploreHubNavigate), MS.Entertainment.UI.Icon.explore));
                        return emptyActions
                    };
                    NowPlayingViewModel.prototype.createSelectionHandlers = function() {
                        var _this = this;
                        var shouldClearSelection = function() {
                                return _this._raiseShouldClearSelection()
                            };
                        var removeItem = function(eventArgs) {
                                return _this._raiseShouldClearSelection()
                            };
                        var result = [];
                        if (MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers)
                            result.push(MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(shouldClearSelection, removeItem));
                        result.push({
                            deleteMedia: shouldClearSelection, findAlbumInfo: shouldClearSelection, findArtistInfo: shouldClearSelection, playSelectionContinuous: shouldClearSelection, removeFromNowPlaying: removeItem
                        });
                        return result
                    };
                    NowPlayingViewModel.prototype._onPlaylistCountChanged = function(args) {
                        if (!args || !args.detail || args.detail.newValue === 0)
                            this.viewStateViewModel.viewState = 0;
                        else
                            this.viewStateViewModel.viewState = 2
                    };
                    NowPlayingViewModel.prototype._onPrimarySessionIdChanged = function() {
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var currentOrdinal = -1;
                        if (this._mediaCollectionBindings) {
                            this._mediaCollectionBindings.cancel();
                            this._mediaCollectionBindings = null
                        }
                        if (sessionMgr.primarySession) {
                            this._mediaCollectionBindings = MS.Entertainment.Utilities.addEventHandlers(sessionMgr.primarySession, {
                                mediaCollectionChanged: this._onMediaCollectionChanged.bind(this), currentOrdinalChanged: this._onCurrentOrdinalChanged.bind(this)
                            });
                            currentOrdinal = sessionMgr.primarySession.currentOrdinal
                        }
                        this._onMediaCollectionChanged();
                        this._onCurrentOrdinalChanged(new MS.Entertainment.UI.Framework.PropertyChangedEventArgs(currentOrdinal))
                    };
                    NowPlayingViewModel.prototype._onMediaCollectionChanged = function() {
                        var _this = this;
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var playbackSession = sessionMgr.primarySession;
                        var currentMediaCollection = playbackSession && playbackSession.mediaCollection;
                        var listNotificationHandler = null;
                        var getCountPromise = null;
                        if (this._listNotificationHandlerHandlers) {
                            this._listNotificationHandlerHandlers.cancel();
                            this._listNotificationHandlerHandlers = null
                        }
                        if (this._nowPlayingListBinding) {
                            this._nowPlayingListBinding.release();
                            this._nowPlayingListBinding = null
                        }
                        if (currentMediaCollection) {
                            listNotificationHandler = new ViewModels.NowPlayingListNotificationHandler;
                            this._nowPlayingListBinding = currentMediaCollection.createListBinding(listNotificationHandler);
                            this._listNotificationHandlerHandlers = MS.Entertainment.Utilities.addEventHandlers(listNotificationHandler, {countChanged: this._onPlaylistCountChanged.bind(this)});
                            getCountPromise = currentMediaCollection.getCount()
                        }
                        else
                            getCountPromise = WinJS.Promise.as(0);
                        this._setItems(currentMediaCollection || new MS.Entertainment.Data.VirtualList);
                        getCountPromise.done(function(count) {
                            _this._onPlaylistCountChanged(new MS.Entertainment.UI.Framework.PropertyChangedEventArgs(count))
                        }, function(error) {
                            MS.Entertainment.ViewModels.fail("Failed to get initial count from media collection. error: " + (error && error.message))
                        })
                    };
                    NowPlayingViewModel.prototype._onCurrentOrdinalChanged = function(args) {
                        if (args && args.detail && args.detail.newValue >= 0 && !isNaN(args.detail.newValue) && typeof args.detail.newValue === "number")
                            this.primaryItemIndex = args.detail.newValue;
                        else
                            this.primaryItemIndex = -1
                    };
                    NowPlayingViewModel.prototype._handleBeginQuery = function(view, pivot, modifier, secondaryModifier, filter) {
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (this._primarySessionBindings) {
                            this._primarySessionBindings.cancel();
                            this._primarySessionBindings = null
                        }
                        this._primarySessionBindings = MS.Entertainment.Utilities.addEventHandlers(sessionMgr, {primarySessionIdChanged: this._onPrimarySessionIdChanged.bind(this)});
                        this._onPrimarySessionIdChanged()
                    };
                    NowPlayingViewModel.prototype._onItemsChanged = function(newItems, oldItems) {
                        this._updateSelectionHandlers()
                    };
                    NowPlayingViewModel.prototype.createContainingMedia = function() {
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var playbackSession = sessionMgr.primarySession;
                        var containingMedia = {
                                playbackItemSource: playbackSession, playbackOffset: 0
                            };
                        return containingMedia
                    };
                    NowPlayingViewModel.ViewTypes = {nowPlaying: "nowPlaying"};
                    NowPlayingViewModel.Views = {nowPlaying: new MS.Entertainment.ViewModels.NodeValues(null, null, null, null, null)};
                    return NowPlayingViewModel
                })(ViewModels.QueryViewModel);
            ViewModels.NowPlayingViewModel = NowPlayingViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
