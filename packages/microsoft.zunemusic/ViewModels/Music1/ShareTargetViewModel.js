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
            var Share;
            (function(Share) {
                MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels.Share");
                var Data = MS.Entertainment.Data;
                var Utilities = MS.Entertainment.Utilities;
                var ShareTarget = (function() {
                        function ShareTarget() {
                            this._executingBackgroundTask = false;
                            this._loggedStarted = false;
                            this._loggedDataRetrieved = false
                        }
                        ShareTarget.prototype.handleHidden = function() {
                            if (!this._executingBackgroundTask)
                                this.reportCompleted()
                        };
                        ShareTarget.prototype.reportStarted = function() {
                            if (this.shareOperation && !this._loggedStarted) {
                                this._loggedStarted = true;
                                this.shareOperation.reportStarted()
                            }
                        };
                        ShareTarget.prototype.reportDataRetrieved = function() {
                            if (this.shareOperation && !this._loggedDataRetrieved) {
                                this._loggedDataRetrieved = true;
                                this.shareOperation.reportDataRetrieved()
                            }
                        };
                        ShareTarget.prototype.reportSubmittedBackgroundTask = function() {
                            this._executingBackgroundTask = true;
                            if (this.shareOperation)
                                this.shareOperation.reportDataRetrieved()
                        };
                        ShareTarget.prototype.reportCompleted = function() {
                            this._executingBackgroundTask = false;
                            if (this.shareOperation) {
                                var shareOperation = this.shareOperation;
                                this.shareOperation = null;
                                WinJS.Promise.timeout(500).done(function() {
                                    shareOperation.reportCompleted()
                                })
                            }
                        };
                        ShareTarget.prototype.reportError = function() {
                            this._executingBackgroundTask = false;
                            if (this.shareOperation) {
                                this.shareOperation.reportError(String.empty);
                                this.shareOperation = null
                            }
                        };
                        return ShareTarget
                    })();
                Share.ShareTarget = ShareTarget;
                MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.shareTarget, function() {
                    return new ShareTarget
                });
                var ShareTargetViewModel = (function(_super) {
                        __extends(ShareTargetViewModel, _super);
                        function ShareTargetViewModel() {
                            this.enableDelayInitialize = true;
                            _super.call(this, "shareTarget");
                            this._isCreatePlaylistDisabled = true;
                            this._viewStateViewModel = null;
                            this._viewStateBindings = null;
                            this._listEventHandlers = null;
                            this._pivotsSelectionManager = null;
                            this._feedbackUrl = "microsoftmusic://feedback/?url={0}";
                            this._loadingHeader = String.empty;
                            this._webPageLoader = new WebPageLoader;
                            this.onCreatePlaylistInvoke = this.onCreatePlaylistInvoke.bind(this);
                            this.updatePendingTitle = this.updatePendingTitle.bind(this);
                            WinJS.Utilities.markSupportedForProcessing(this.onCreatePlaylistInvoke);
                            WinJS.Utilities.markSupportedForProcessing(this.updatePendingTitle)
                        }
                        ShareTargetViewModel.prototype.load = function() {
                            this.refresh()
                        };
                        ShareTargetViewModel.prototype.dispose = function() {
                            _super.prototype.dispose.call(this);
                            if (this._webPageLoader) {
                                this._webPageLoader.dispose();
                                this._webPageLoader = null
                            }
                            if (this._viewStateBindings) {
                                this._viewStateBindings.cancel();
                                this._viewStateBindings = null
                            }
                            if (this._listEventHandlers) {
                                this._listEventHandlers.cancel();
                                this._listEventHandlers = null
                            }
                        };
                        ShareTargetViewModel.prototype.delayInitialize = function() {
                            this._raiseDelayLoadedEvent()
                        };
                        ShareTargetViewModel.prototype.loadModules = function(){};
                        ShareTargetViewModel.prototype.freeze = function(){};
                        ShareTargetViewModel.prototype.thaw = function(){};
                        Object.defineProperty(ShareTargetViewModel.prototype, "viewStateViewModel", {
                            get: function() {
                                var _this = this;
                                if (!this._viewStateViewModel) {
                                    var viewStateItems = [];
                                    viewStateItems[-1] = new ViewModels.ViewStateItem(null, null, []);
                                    viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_MUSIC_SHARE_NO_ARTIST_FOUND), String.load(String.id.IDS_MUSIC_SHARE_NO_ARTIST_FOUND_SUB), []);
                                    this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems);
                                    this._viewStateBindings = MS.Entertainment.UI.Framework.addEventHandlers(this._viewStateViewModel, {viewStateChanged: function() {
                                            _this.isCreatePlaylistDisabled = (_this.viewStateViewModel.viewState !== 2);
                                            if (_this.viewStateViewModel.viewState === 0)
                                                _this._getEmptyStateDefaultSites()
                                        }})
                                }
                                return this._viewStateViewModel
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ShareTargetViewModel.prototype, "title", {
                            get: function() {
                                return this._title || String.empty
                            }, set: function(value) {
                                    this.updateAndNotify("title", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ShareTargetViewModel.prototype, "pendingTitle", {
                            get: function() {
                                return this._pendingTitle
                            }, set: function(value) {
                                    this.updateAndNotify("pendingTitle", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ShareTargetViewModel.prototype, "loadingHeader", {
                            get: function() {
                                return this._loadingHeader
                            }, set: function(value) {
                                    this.updateAndNotify("loadingHeader", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ShareTargetViewModel.prototype, "defaultSites", {
                            get: function() {
                                return this._defaultSites
                            }, set: function(value) {
                                    this.updateAndNotify("defaultSites", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ShareTargetViewModel.prototype, "feedbackUrl", {
                            get: function() {
                                return this._feedbackUrl
                            }, set: function(value) {
                                    this.updateAndNotify("feedbackUrl", value)
                                }, enumerable: true, configurable: true
                        });
                        ShareTargetViewModel.prototype.getQueryOptions = function(view, pivot, modifier, secondaryModifier, filter) {
                            return {
                                    webPageLoader: this._webPageLoader, url: (this._activeTestHook && this._activeTestHook.urlOverride) ? this._activeTestHook.urlOverride : this._url
                                }
                        };
                        ShareTargetViewModel.prototype.createTestHook = function() {
                            this._activeTestHook = this._activeTestHook || {
                                urlOverride: null, actionOverride: null
                            };
                            return this._activeTestHook
                        };
                        ShareTargetViewModel.prototype.onCreatePlaylistInvoke = function() {
                            var _this = this;
                            var action = this._createPlaylistAction();
                            var createPromise = new MS.Entertainment.UI.Framework.Signal;
                            var shareTarget = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareTarget);
                            this.title = this.pendingTitle;
                            shareTarget.reportSubmittedBackgroundTask();
                            var params = {
                                    name: this.title, completeCallback: function(playlistId) {
                                            createPromise.complete(playlistId)
                                        }, failedCallback: function(error) {
                                            var message = (error && error.message) || String.empty;
                                            Share.fail("Failed to create playlist. " + message)
                                        }
                                };
                            this.viewStateViewModel.viewState = 1;
                            this.loadingHeader = String.load(String.id.IDS_MUSIC_SHARE_LOADING_CREATING_PLAYLIST);
                            if (this.selectedPivot.id === ShareTargetViewModel.PivotTypes.artists)
                                params.artists = this.items;
                            else if (this.selectedPivot.id === ShareTargetViewModel.PivotTypes.tracks)
                                params.songs = this.items;
                            action.parameter = params;
                            return action.execute().then(function() {
                                    return createPromise.promise
                                }).then(function(playlistId) {
                                    var promise;
                                    if (!document.hidden)
                                        promise = _this._launchMusicApplication(playlistId);
                                    return WinJS.Promise.as(promise)
                                }).then(null, function(){}).then(function() {
                                    var shareTarget = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareTarget);
                                    shareTarget.reportCompleted()
                                })
                        };
                        ShareTargetViewModel.prototype._launchMusicApplication = function(playlistId) {
                            if (!MS.Entertainment.Utilities.isValidLibraryId(playlistId))
                                return WinJS.Promise.wrapError(new Error("Invalid playlist id. Id: " + playlistId));
                            var launchInfo = "microsoftmusic://details/?id={0}&location=collection&desiredMediaItemType=musicPlaylist&idType=library";
                            launchInfo = launchInfo.format(playlistId);
                            var appAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                            appAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppMusicApp;
                            appAction.parameter = {
                                uri: launchInfo, appendSource: true, appendGamerTag: false
                            };
                            return appAction.execute()
                        };
                        ShareTargetViewModel.prototype.updatePendingTitle = function(title) {
                            this.pendingTitle = title
                        };
                        ShareTargetViewModel.prototype._onDelayBeginQuery = function() {
                            var _this = this;
                            var delayPromise;
                            var shareTarget;
                            var shareData;
                            this.loadingHeader = String.load(String.id.IDS_MUSIC_SHARE_LOADING_FINDING_MUSIC);
                            this.viewStateViewModel.viewState = 1;
                            shareTarget = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareTarget);
                            shareTarget.reportStarted();
                            if (!this._url) {
                                shareData = shareTarget.shareOperation && shareTarget.shareOperation.data;
                                if (shareData && shareData.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri))
                                    delayPromise = shareData.getUriAsync().then(function(uri) {
                                        _this._url = uri && uri.rawUri;
                                        _this.feedbackUrl = _this._feedbackUrl.format(encodeURI(_this._url))
                                    })
                            }
                            delayPromise = WinJS.Promise.as(delayPromise).then(function() {
                                shareTarget.reportDataRetrieved()
                            }, function(error) {
                                shareTarget.reportError();
                                return WinJS.Promise.wrapError(error)
                            });
                            var telemetryParameterArray = [{
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.PivotSelected, parameterValue: this.selectedPivot.id
                                    }];
                            if (this._url)
                                telemetryParameterArray.push({
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.Url, parameterValue: this._url
                                });
                            MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.ShareEDSWebQueryInitiated, telemetryParameterArray);
                            return WinJS.Promise.as(delayPromise)
                        };
                        ShareTargetViewModel.prototype._onQueryCompleted = function(query) {
                            _super.prototype._onQueryCompleted.call(this, query);
                            if (query && query.result && query.result.items && query.result.items.count === 0)
                                this.viewStateViewModel.viewState = 0;
                            else {
                                this.viewStateViewModel.viewState = 2;
                                this.title = query.webSiteTitle;
                                this.pendingTitle = query.webSiteTitle
                            }
                            var telemetryParameterArray = [{
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.PivotSelected, parameterValue: this.selectedPivot.id
                                    }, {
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.Url, parameterValue: this._url || String.empty
                                    }, {
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.ItemCount, parameterValue: (query && query.result && query.result.items && query.result.items.count) || 0
                                    }];
                            MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.ShareEDSWebQueryComplete, telemetryParameterArray)
                        };
                        ShareTargetViewModel.prototype._onQueryFailed = function(error) {
                            _super.prototype._onQueryFailed.call(this, error);
                            if (error && error.originalError && error.originalError.message === EDSWebSiteQuery.regionError) {
                                this.viewStateViewModel.viewState = -1;
                                this.viewStateViewModel.title = String.load(String.id.IDS_MUSIC_SHARE_REGION_NOT_SUPPORTED);
                                this.viewStateViewModel.subTitle = String.load(String.id.IDS_MUSIC_SHARE_REGION_NOT_SUPPORTED_SUB)
                            }
                            else if (!WinJS.Promise.isCanceledError(error)) {
                                this.viewStateViewModel.viewState = -1;
                                this.viewStateViewModel.title = String.load(String.id.IDS_MUSIC_SHARE_SERVICE_DOWN);
                                this.viewStateViewModel.subTitle = String.load(String.id.IDS_MUSIC_SHARE_SERVICE_DOWN_SUB)
                            }
                        };
                        ShareTargetViewModel.prototype._onItemsChanged = function(newItems, oldItems) {
                            var _this = this;
                            _super.prototype._onItemsChanged.call(this, newItems, oldItems);
                            if (this._listEventHandlers) {
                                this._listEventHandlers.cancel();
                                this._listEventHandlers = null
                            }
                            if (newItems)
                                this._listEventHandlers = MS.Entertainment.Utilities.addEventHandlers(newItems, {countChanged: function(args) {
                                        if (args.detail.newValue === 0)
                                            _this.viewStateViewModel.viewState = 0
                                    }})
                        };
                        Object.defineProperty(ShareTargetViewModel.prototype, "isCreatePlaylistDisabled", {
                            get: function() {
                                return this._isCreatePlaylistDisabled
                            }, set: function(value) {
                                    this.updateAndNotify("isCreatePlaylistDisabled", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ShareTargetViewModel.prototype, "selectedPivot", {
                            get: function() {
                                return this.pivotsSelectionManager ? this.pivotsSelectionManager.selectedItem : null
                            }, enumerable: true, configurable: true
                        });
                        ShareTargetViewModel.prototype.getViewDefinition = function(view) {
                            return MS.Entertainment.ViewModels.Share.ShareTargetViewModel.Views[view]
                        };
                        ShareTargetViewModel.prototype.getPivotDefinition = function(view) {
                            return MS.Entertainment.ViewModels.Share.ShareTargetViewModel.Pivots[view]
                        };
                        ShareTargetViewModel.prototype._createPlaylistAction = function() {
                            return (this._activeTestHook && this._activeTestHook.actionOverride) ? this._activeTestHook.actionOverride : new MS.Entertainment.UI.Actions.Playlists.CreateWebPlaylistAction
                        };
                        ShareTargetViewModel.prototype._getEmptyStateDefaultSites = function() {
                            var _this = this;
                            if (!this.defaultSites) {
                                var defaults = new MS.Entertainment.Data.Query.Music.WebPlaylist.DefaultSites;
                                return defaults.execute().then(function() {
                                        _this.defaultSites = defaults.result && defaults.result.itemsArray;
                                        if (_this.defaultSites && _this.defaultSites.length > 0)
                                            _this.viewStateViewModel.subTitle = String.load(String.id.IDS_MUSIC_SHARE_ALTERNATIVES_TEXT);
                                        else
                                            _this.viewStateViewModel.subTitle = String.load(String.id.IDS_MUSIC_SHARE_NO_ARTIST_FOUND_SUB)
                                    }, function() {
                                        _this.defaultSites = null
                                    }).then(function() {
                                        defaults.dispose()
                                    })
                            }
                        };
                        ShareTargetViewModel.ViewTypes = {shareTarget: "shareTarget"};
                        ShareTargetViewModel.PivotTypes = {
                            artists: "artists", tracks: "tracks"
                        };
                        ShareTargetViewModel.Views = {shareTarget: new MS.Entertainment.ViewModels.NodeValues(null, null, null, null, null)};
                        ShareTargetViewModel.Pivots = {shareTarget: {itemFactory: function itemFactory() {
                                    return [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.Share.ShareTargetViewModel.PivotTypes.artists, String.load(String.id.IDS_MUSIC_ARTISTS_PIVOT_TC), new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.ViewModels.Share.EDSWebSiteArtistQuery, null, {selectedTemplate: MS.Entertainment.ViewModels.Share.MusicShareTemplates.artists})), new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.Share.ShareTargetViewModel.PivotTypes.tracks, String.load(String.id.IDS_MUSIC_SONGS_PIVOT_TC), new MS.Entertainment.ViewModels.NodeValues(MS.Entertainment.ViewModels.Share.EDSWebSiteSongsQuery, null, {selectedTemplate: MS.Entertainment.ViewModels.Share.MusicShareTemplates.songs})), ]
                                }}};
                        return ShareTargetViewModel
                    })(MS.Entertainment.ViewModels.QueryViewModel);
                Share.ShareTargetViewModel = ShareTargetViewModel;
                var MusicShareTemplates = (function() {
                        function MusicShareTemplates(){}
                        MusicShareTemplates.artists = {
                            debugId: "artists", itemTemplate: "select(.templateid-shareFlyoutArtistTemplate)", zoomedOutLayout: null, layout: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Layout.list, orientation: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Orientation.vertical, headerPosition: null, maxRows: NaN, minimumListLength: 1, forceInteractive: true, delayHydrateLibraryId: false, selectionStyleFilled: false, allowSelectAll: false, allowZoom: false, grouperKeyAsData: false, swipeBehavior: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.none, invokeBehavior: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.none, tap: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Tap.none, selectionMode: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none
                        };
                        MusicShareTemplates.songs = {
                            debugId: "songs", itemTemplate: "select(.templateid-shareFlyoutSongTemplate)", zoomedOutLayout: null, layout: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Layout.list, orientation: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Orientation.vertical, headerPosition: null, maxRows: NaN, minimumListLength: 1, forceInteractive: false, delayHydrateLibraryId: false, selectionStyleFilled: false, allowSelectAll: false, allowZoom: false, grouperKeyAsData: false, swipeBehavior: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.none, invokeBehavior: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.none, tap: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.Tap.none, selectionMode: MS.Entertainment.UI.Controls && MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none
                        };
                        return MusicShareTemplates
                    })();
                Share.MusicShareTemplates = MusicShareTemplates;
                var EDSWebSiteQuery = (function(_super) {
                        __extends(EDSWebSiteQuery, _super);
                        function EDSWebSiteQuery() {
                            _super.call(this);
                            this.minPopularity = -1;
                            this.aggregateChunks = true;
                            this.chunkSize = 25;
                            this._visitedItems = 0;
                            this._webPageLoader = null;
                            this._titleOverride = null;
                            this.autoUpdateProperties.enabled = false
                        }
                        EDSWebSiteQuery.prototype.dispose = function() {
                            _super.prototype.dispose.call(this);
                            this._releaseInnerQuery()
                        };
                        Object.defineProperty(EDSWebSiteQuery.prototype, "webSiteTitle", {
                            get: function() {
                                return this._titleOverride || (this._innerQuery && this._innerQuery.webSiteTitle)
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EDSWebSiteQuery.prototype, "html", {
                            get: function() {
                                return this._innerQuery && this._innerQuery.html
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EDSWebSiteQuery.prototype, "visitedItems", {
                            get: function() {
                                return this._visitedItems
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EDSWebSiteQuery.prototype, "webPageLoader", {
                            get: function() {
                                return this._innerQuery && this._innerQuery.webPageLoader
                            }, set: function(value) {
                                    if (this._innerQuery)
                                        this._innerQuery.webPageLoader = value;
                                    this._webPageLoader = value
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EDSWebSiteQuery.prototype, "isXboxServiceUrl", {
                            get: function() {
                                var isXboxServiceUrl = false;
                                var endpointId = MS.Entertainment.Endpoint.id.seid_PCMarketplace;
                                var endpoint = MS.Entertainment.Endpoint.load(endpointId);
                                if (endpoint && this.url)
                                    isXboxServiceUrl = this.url.toLowerCase().indexOf(endpoint.toLowerCase()) === 0;
                                return isXboxServiceUrl
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EDSWebSiteQuery.prototype, "_loadedCDS", {
                            get: function() {
                                return this._innerQuery && this._innerQuery.loadedCDS
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EDSWebSiteQuery.prototype, "_focusedData", {
                            get: function() {
                                return this._innerQuery && this._innerQuery.focusedData
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(EDSWebSiteQuery.prototype, "_unfocusedData", {
                            get: function() {
                                return this._innerQuery && this._innerQuery.unfocusedData
                            }, enumerable: true, configurable: true
                        });
                        EDSWebSiteQuery.prototype.createAsyncModel = function(startIndex, count) {
                            this._titleOverride = null;
                            if (this.isXboxServiceUrl)
                                return this._loadChunkFromQueryParameters();
                            else
                                return this._loadNextChunkFromWebSite(startIndex, count)
                        };
                        EDSWebSiteQuery.prototype._loadChunkFromQueryParameters = function() {
                            var _this = this;
                            return this._extractMediaItemFromUrl().then(function(mediaItem) {
                                    _this._titleOverride = (mediaItem && mediaItem.name);
                                    return _this._loadItemsFromMediaItem(mediaItem)
                                }).then(function(items) {
                                    return {items: items}
                                })
                        };
                        EDSWebSiteQuery.prototype._loadItemsFromMediaItem = function(mediaItem) {
                            return WinJS.Promise.wrapError(new Error("Method not implemented"))
                        };
                        EDSWebSiteQuery.prototype._loadNextChunkFromWebSite = function(startIndex, count) {
                            return WinJS.Promise.wrapError(new Error("Method not implemented"))
                        };
                        EDSWebSiteQuery.prototype._extractMediaItemFromUrl = function() {
                            var promise;
                            if (this.isXboxServiceUrl) {
                                var uri = new Windows.Foundation.Uri(this.url);
                                var queryParsed = uri.queryParsed;
                                var type = null;
                                var id = null;
                                var mediaQuery = null;
                                if (queryParsed) {
                                    type = queryParsed.getFirstValueByName("type") || String.empty;
                                    id = queryParsed.getFirstValueByName("id");
                                    type = type.toLowerCase()
                                }
                                if (type && type in EDSWebSiteQuery._musicQueries)
                                    mediaQuery = new EDSWebSiteQuery._musicQueries[type];
                                if (id && mediaQuery) {
                                    mediaQuery.id = id;
                                    mediaQuery.idType = Data.Query.edsIdType.zuneCatalog;
                                    promise = mediaQuery.execute().then(function() {
                                        return (mediaQuery.result && mediaQuery.result.item)
                                    })
                                }
                            }
                            return WinJS.Promise.as(promise)
                        };
                        EDSWebSiteQuery.prototype._getArtists = function(startIndex, count) {
                            var _this = this;
                            var featureEnablement = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.featureEnablement);
                            if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                return WinJS.Promise.wrapError(new Error(EDSWebSiteQuery.regionError));
                            var getItemsPromise;
                            if (this.currentChunk && this.currentChunk.items)
                                getItemsPromise = WinJS.Promise.as(this.currentChunk.items);
                            else {
                                var query = this._createInnerQuery();
                                this._visitedItems = 0;
                                this._onResetState();
                                getItemsPromise = query.getItems()
                            }
                            return getItemsPromise.then(function(items) {
                                    var result;
                                    if (items) {
                                        var chunkSize = Math.min(_this.chunkSize, items.count - startIndex);
                                        result = items.itemsFromIndex(startIndex, 0, chunkSize - 1)
                                    }
                                    else
                                        result = WinJS.Promise.as(null);
                                    return result
                                }).then(function(args) {
                                    var result = null;
                                    if (args && args.items) {
                                        _this._visitedItems += args.items.length;
                                        result = args.items
                                    }
                                    return result
                                })
                        };
                        EDSWebSiteQuery.prototype._calculateNextChunkKey = function(result) {
                            var chunk = null;
                            var items = null;
                            var innerHasNextChunk = false;
                            var innerSize = 0;
                            if (this._innerQuery && this._innerQuery.result && this._innerQuery.result.items) {
                                items = this._innerQuery.result.items;
                                innerHasNextChunk = (this._innerQuery.hasNextChunk) || (items && this._visitedItems < items.count)
                            }
                            if (innerHasNextChunk && this._visitedItems > 0)
                                chunk = {
                                    startIndex: this._visitedItems, items: items
                                };
                            return chunk
                        };
                        EDSWebSiteQuery.prototype._calculatePreviousChunkKey = function(result) {
                            return null
                        };
                        EDSWebSiteQuery.prototype._onResetState = function(){};
                        EDSWebSiteQuery.prototype._createInnerQuery = function() {
                            this._releaseInnerQuery();
                            this._innerQuery = new WebSiteArtistsQuery;
                            this._innerQuery.url = this.url;
                            this._innerQuery.minFocusedSuccessCount = this.minFocusedSuccessCount;
                            this._innerQuery.maxFocusRank = this.maxFocusRank;
                            this._innerQuery.minPopularity = this.minPopularity;
                            this._innerQuery.webPageLoader = this._webPageLoader;
                            return this._innerQuery
                        };
                        EDSWebSiteQuery.prototype._releaseInnerQuery = function() {
                            if (this._innerQuery) {
                                this._innerQuery.dispose();
                                this._innerQuery = null
                            }
                        };
                        EDSWebSiteQuery.regionError = "regionError";
                        EDSWebSiteQuery._musicQueries = {
                            artist: Data.Query.Music.ArtistDetails, album: Data.Query.Music.AlbumWithTracks, track: Data.Query.Music.SongDetails
                        };
                        return EDSWebSiteQuery
                    })(Data.ModelQuery);
                Share.EDSWebSiteQuery = EDSWebSiteQuery;
                var EDSWebSiteArtistQuery = (function(_super) {
                        __extends(EDSWebSiteArtistQuery, _super);
                        function EDSWebSiteArtistQuery() {
                            _super.apply(this, arguments);
                            this._seenIds = null
                        }
                        EDSWebSiteArtistQuery.prototype._loadItemsFromMediaItem = function(mediaItem) {
                            var promise;
                            var mediaType = null;
                            var artist;
                            if (mediaItem)
                                mediaType = mediaItem.mediaType;
                            switch (mediaType) {
                                case Microsoft.Entertainment.Queries.ObjectType.album:
                                    artist = mediaItem.artist;
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.track:
                                    artist = mediaItem.artist;
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.person:
                                    artist = mediaItem;
                                    break
                            }
                            if (artist)
                                promise = WinJS.Promise.as(new Data.VirtualList(null, [artist]));
                            return WinJS.Promise.as(promise)
                        };
                        EDSWebSiteArtistQuery.prototype._loadNextChunkFromWebSite = function(startIndex, count) {
                            var _this = this;
                            return this._getArtists(startIndex, count).then(function(artists) {
                                    var matchPromises = [];
                                    artists = artists || [];
                                    matchPromises = artists.map(function(artist, index, source) {
                                        return _this._searchForMatch(artist.data)
                                    });
                                    return WinJS.Promise.join(matchPromises)
                                }).then(function(artists) {
                                    var seenIds = _this._seenIds || {};
                                    artists = artists.filter(function(artist, index, source) {
                                        var keep = false;
                                        if (artist && !seenIds[artist.canonicalId]) {
                                            seenIds[artist.canonicalId] = true;
                                            keep = true
                                        }
                                        return keep
                                    });
                                    return {items: new Data.VirtualList(null, artists)}
                                })
                        };
                        EDSWebSiteArtistQuery.prototype._onResetState = function() {
                            _super.prototype._onResetState.call(this);
                            this._seenIds = {}
                        };
                        EDSWebSiteArtistQuery.prototype._searchForMatch = function(artist) {
                            var promise;
                            var query = new Data.Query.Music.ArtistSearch;
                            var cancelTimer;
                            var returnPromise;
                            query.search = Utilities.trimCharacterDirection(artist && artist.name);
                            query.chunkSize = 1;
                            query.chunked = false;
                            cancelTimer = WinJS.Promise.timeout(3000);
                            cancelTimer.done(function() {
                                if (returnPromise) {
                                    returnPromise.cancel();
                                    returnPromise = null
                                }
                                cancelTimer = null
                            }, function(){});
                            returnPromise = query.execute().then(function() {
                                var match = null;
                                var artists = query.result && query.result.itemsArray;
                                var name;
                                var search = query.search ? query.search.toLowerCase() : String.empty;
                                if (artists && artists[0] && (Utilities.trimCharacterDirection(artists[0].name || String.empty).toLowerCase() === search || Utilities.trimCharacterDirection(artists[0].sortName || String.empty).toLowerCase() === search))
                                    match = artists[0];
                                if (cancelTimer) {
                                    cancelTimer.cancel();
                                    cancelTimer = null
                                }
                                returnPromise = null;
                                return match
                            }, function(error) {
                                if (cancelTimer) {
                                    cancelTimer.cancel();
                                    cancelTimer = null
                                }
                                returnPromise = null;
                                return null
                            });
                            return returnPromise
                        };
                        return EDSWebSiteArtistQuery
                    })(EDSWebSiteQuery);
                Share.EDSWebSiteArtistQuery = EDSWebSiteArtistQuery;
                var EDSWebSiteSongsQuery = (function(_super) {
                        __extends(EDSWebSiteSongsQuery, _super);
                        function EDSWebSiteSongsQuery() {
                            _super.apply(this, arguments);
                            this._seenIds = null
                        }
                        EDSWebSiteSongsQuery.prototype._loadItemsFromMediaItem = function(mediaItem) {
                            var promise;
                            var mediaType = null;
                            var tracks;
                            if (mediaItem)
                                mediaType = mediaItem.mediaType;
                            switch (mediaType) {
                                case Microsoft.Entertainment.Queries.ObjectType.album:
                                    promise = WinJS.Promise.as(mediaItem.tracks);
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.track:
                                    promise = WinJS.Promise.as(new Data.VirtualList(null, [mediaItem]));
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.person:
                                    if (mediaItem.hasCanonicalId) {
                                        var query = new Data.Query.Music.ArtistTopSongs;
                                        query.id = mediaItem.canonicalId;
                                        query.impressionGuid = mediaItem.impressionGuid;
                                        promise = query.getItems()
                                    }
                                    break
                            }
                            return WinJS.Promise.as(promise)
                        };
                        EDSWebSiteSongsQuery.prototype._loadNextChunkFromWebSite = function(startIndex, count) {
                            var _this = this;
                            return this._getArtists(startIndex, count).then(function(items) {
                                    return _this._beginSearchForSongs(items)
                                }).then(function(tracks) {
                                    var seenIds = _this._seenIds || {};
                                    tracks = tracks.filter(function(track, index, source) {
                                        var keep = false;
                                        if (track && !seenIds[track.canonicalId]) {
                                            seenIds[track.canonicalId] = true;
                                            keep = true
                                        }
                                        return keep
                                    });
                                    return {items: new Data.VirtualList(null, tracks)}
                                })
                        };
                        EDSWebSiteSongsQuery.prototype._onResetState = function() {
                            _super.prototype._onResetState.call(this);
                            this._trackSearchSuccesses = [0, 0];
                            this._seenIds = {}
                        };
                        EDSWebSiteSongsQuery.prototype._beginSearchForSongs = function(artists) {
                            var _this = this;
                            if (!this._focusedData || !this._focusedData.stringOffsets || !this._focusedData.stringMap)
                                return WinJS.Promise.as([]);
                            var searches = [];
                            artists.forEach(function(artist, index, source) {
                                var artistName = artist.data.sortName || artist.data.name;
                                var namePositions = _this._inRangePositions(_this._focusedData.stringMap[artistName.toLowerCase()], artist.data);
                                if (namePositions)
                                    namePositions.forEach(function(position, index, source) {
                                        searches.push({
                                            position: position, tracks: [_this._extractCDSEntry(position, true), _this._extractCDSEntry(position, false)], artist: artistName
                                        })
                                    })
                            });
                            this._searchComparer = this._searchComparer || Data.Comparer.createPropertyComparer("position");
                            searches = searches.sort(this._searchComparer);
                            return this._searchForTracks(searches)
                        };
                        EDSWebSiteSongsQuery.prototype._searchForTracks = function(searches) {
                            var _this = this;
                            var promises = [];
                            searches = searches || [];
                            var executeSearch = function(subSearches) {
                                    var subPromises = [];
                                    subSearches = subSearches || [];
                                    subPromises = subSearches.map(function(search, index, source) {
                                        return _this._beginSearchForArtistTrack(search)
                                    });
                                    promises = promises.concat(subPromises);
                                    return WinJS.Promise.join(subPromises)
                                };
                            return executeSearch(searches.splice(0, 1)).then(function() {
                                    return executeSearch(searches.splice(0, 2))
                                }).then(function() {
                                    executeSearch(searches);
                                    return WinJS.Promise.join(promises)
                                })
                        };
                        EDSWebSiteSongsQuery.prototype._beginSearchForArtistTrack = function(search) {
                            var _this = this;
                            var trackIndex = 0;
                            if (this._trackSearchSuccesses[1] > this._trackSearchSuccesses[0])
                                trackIndex = 1;
                            return this._searchForArtistTrack(search.artist, search.tracks[trackIndex]).then(function(track) {
                                    var promise;
                                    if (track)
                                        promise = WinJS.Promise.as(track);
                                    else {
                                        trackIndex = (trackIndex + 1) % 2;
                                        promise = _this._searchForArtistTrack(search.artist, search.tracks[trackIndex])
                                    }
                                    return promise
                                }).then(function(track) {
                                    if (track)
                                        _this._trackSearchSuccesses[trackIndex] += 1;
                                    return track
                                })
                        };
                        EDSWebSiteSongsQuery.prototype._searchForArtistTrack = function(artistName, trackName) {
                            var _this = this;
                            if (!artistName || !trackName)
                                return WinJS.Promise.as(null);
                            var returnPromise;
                            var query = new Data.Query.Music.SongSearch;
                            var cancelTimer;
                            query.search = trackName + " " + artistName;
                            query.chunkSize = 3;
                            query.chunked = false;
                            cancelTimer = WinJS.Promise.timeout(3000);
                            cancelTimer.done(function() {
                                if (returnPromise) {
                                    returnPromise.cancel();
                                    returnPromise = null
                                }
                                cancelTimer = null
                            }, function(){});
                            returnPromise = query.execute().then(function() {
                                var tracks = (query.result && query.result.itemsArray) || [];
                                var track = null;
                                var searchTrackName = null;
                                var searchArtistName = null;
                                var searchArtistSortName = null;
                                trackName = trackName.toLowerCase();
                                artistName = artistName.toLowerCase();
                                for (var i = 0; i < tracks.length && !track; i++) {
                                    track = tracks[i];
                                    if (track && track.artist) {
                                        searchTrackName = Utilities.trimCharacterDirection(track.mainTitle || String.empty).toLowerCase();
                                        searchArtistName = Utilities.trimCharacterDirection(track.artist.name || String.empty).toLowerCase();
                                        searchArtistSortName = Utilities.trimCharacterDirection(track.artist.sortName || String.empty).toLowerCase()
                                    }
                                    if (!track || !track.artist || (searchArtistName !== artistName && searchArtistSortName !== artistName) || !_this._prefixMatches(searchTrackName, trackName))
                                        track = null
                                }
                                if (cancelTimer) {
                                    cancelTimer.cancel();
                                    cancelTimer = null
                                }
                                return track
                            }, function(error) {
                                if (cancelTimer) {
                                    cancelTimer.cancel();
                                    cancelTimer = null
                                }
                                returnPromise = null;
                                return null
                            });
                            return returnPromise
                        };
                        EDSWebSiteSongsQuery.prototype._prefixMatches = function(value1, value2) {
                            if (!value1 || !value2)
                                return false;
                            var prefixMatches = false;
                            var startedMatch = false;
                            var minPrefix = 3;
                            var i = 0;
                            var ignorableChars = 5;
                            for (var j = 0; j < minPrefix && i < value1.length && j < value2.length; j++)
                                if (value1[i] === value2[j]) {
                                    i++;
                                    startedMatch = true
                                }
                                else if (startedMatch || j >= ignorableChars) {
                                    startedMatch = false;
                                    break
                                }
                                else
                                    minPrefix++;
                            prefixMatches = (j === minPrefix) && startedMatch;
                            return prefixMatches
                        };
                        EDSWebSiteSongsQuery.prototype._inRangePositions = function(positions, artist) {
                            var newPositions = [];
                            var cdsPosition = 0;
                            var stringPosition = 0;
                            var minCDSPosition = 0;
                            var maxCDSPosition = this._loadedCDS - 1;
                            if (artist && artist.chunkInformation) {
                                minCDSPosition = artist.chunkInformation.firstIndex;
                                maxCDSPosition = artist.chunkInformation.lastIndex
                            }
                            if (this._focusedData && positions)
                                for (var i = 0; i < positions.length; i++) {
                                    stringPosition = positions[i];
                                    cdsPosition = this._focusedData.getCDSPosition(stringPosition);
                                    if (cdsPosition >= minCDSPosition && cdsPosition <= maxCDSPosition)
                                        newPositions.push(positions[i]);
                                    else if (positions[i] > maxCDSPosition)
                                        break
                                }
                            return newPositions
                        };
                        EDSWebSiteSongsQuery.prototype._extractCDSEntry = function(neighborStart, after) {
                            if (!this._focusedData || !this._focusedData.strings)
                                return null;
                            var result = String.empty;
                            var strings;
                            if (this._focusedData.focusOffset < 0 || !this._unfocusedData || !this._unfocusedData.strings)
                                strings = this._focusedData.strings;
                            else {
                                neighborStart += this._focusedData.focusOffset;
                                strings = this._unfocusedData.strings
                            }
                            if (after)
                                result = strings[neighborStart + 1];
                            else
                                result = strings[neighborStart - 1];
                            return result
                        };
                        return EDSWebSiteSongsQuery
                    })(EDSWebSiteQuery);
                Share.EDSWebSiteSongsQuery = EDSWebSiteSongsQuery;
                var WebSiteArtistsQuery = (function(_super) {
                        __extends(WebSiteArtistsQuery, _super);
                        function WebSiteArtistsQuery() {
                            _super.call(this);
                            this.minPopularity = -1;
                            this._html = null;
                            this.enablePatternSearch = false;
                            this.minFocusedSuccessCount = WebSiteArtistsQuery.s_minFocusedSuccessCount;
                            this.minFocusedSuccessFamiliarity = WebSiteArtistsQuery.s_minFocusedSuccessFamiliarity;
                            this.maxFocusRank = WebSiteArtistsQuery.s_maxFocusRank;
                            this._htmlToCDSParser = new HTMLToCDSParser;
                            this._htmlFocuser = new MS.Entertainment.ViewModels.Share.HTMLFocuser
                        }
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "webPageLoader", {
                            get: function() {
                                var value = this._webPageLoader;
                                if (!value) {
                                    this._ownedWebPageLoader = this._ownedWebPageLoader || new WebPageLoader;
                                    value = this._ownedWebPageLoader
                                }
                                return value
                            }, set: function(value) {
                                    this._releaseOwnedWebPageLoaded();
                                    this._webPageLoader = value
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "webSiteTitle", {
                            get: function() {
                                return this.webPageLoader && this.webPageLoader.documentTitle
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "minFocusedSuccessCount", {
                            get: function() {
                                return this._minFocusedSuccessCount
                            }, set: function(value) {
                                    if (typeof value !== "number" || isNaN(value))
                                        value = WebSiteArtistsQuery.s_minFocusedSuccessCount;
                                    this._minFocusedSuccessCount = value
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "minFocusedSuccessFamiliarity", {
                            get: function() {
                                return this._minFocusedSuccessFamiliarity
                            }, set: function(value) {
                                    if (typeof value !== "number" || isNaN(value))
                                        value = WebSiteArtistsQuery.s_minFocusedSuccessFamiliarity;
                                    this._minFocusedSuccessFamiliarity = value
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "maxFocusRank", {
                            get: function() {
                                return this._maxFocusRank
                            }, set: function(value) {
                                    if (typeof value !== "number" || isNaN(value))
                                        value = WebSiteArtistsQuery.s_maxFocusRank;
                                    this._maxFocusRank = value
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "hasNextChunk", {
                            get: function() {
                                return !!this._innerQuery && this._innerQuery.hasNextChunk
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "cds", {
                            get: function() {
                                return this._innerQuery ? this._innerQuery.text : null
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "html", {
                            get: function() {
                                return this._html
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "focusedData", {
                            get: function() {
                                return this._focusedData
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "unfocusedData", {
                            get: function() {
                                return this._unfocusedData
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebSiteArtistsQuery.prototype, "loadedCDS", {
                            get: function() {
                                return this._innerQuery ? this._innerQuery.visitedText : 0
                            }, enumerable: true, configurable: true
                        });
                        WebSiteArtistsQuery.prototype._releaseOwnedWebPageLoaded = function() {
                            if (this._ownedWebPageLoader) {
                                this._ownedWebPageLoader.dispose();
                                this._ownedWebPageLoader = null
                            }
                        };
                        WebSiteArtistsQuery.prototype.dispose = function() {
                            _super.prototype.dispose.call(this);
                            this._releaseOwnedWebPageLoaded();
                            if (this._htmlToCDSParser) {
                                this._htmlToCDSParser.dispose();
                                this._htmlToCDSParser = null
                            }
                            if (this._htmlFocuser) {
                                this._htmlFocuser.dispose();
                                this._htmlFocuser = null
                            }
                            this._releaseInnerQuery()
                        };
                        WebSiteArtistsQuery.prototype.createAsyncModel = function(startIndex, count) {
                            var _this = this;
                            var promise;
                            if (!this.url)
                                promise = WinJS.Promise.as(null);
                            else
                                promise = this.webPageLoader.start(this.url).then(function(html) {
                                    if (!_this._htmlToCDSParser)
                                        return WinJS.Promise.wrapError(new Error("WebSideArtistsQuery failled at createAsyncModel. It's likely it's been disposed of"));
                                    _this._html = html;
                                    _this._htmlToCDSParser.html = html;
                                    return _this._htmlToCDSParser.start()
                                }).then(function(data) {
                                    _this._unfocusedData = data;
                                    return _this._searchAndExtractArtists(data)
                                }).then(function(focusedResult) {
                                    _this._releaseInnerQuery();
                                    _this._focusedData = focusedResult.focusedData;
                                    _this._innerQuery = focusedResult.innerQuery;
                                    return {items: focusedResult.artists}
                                });
                            return promise
                        };
                        WebSiteArtistsQuery.prototype._searchAndExtractArtists = function(data) {
                            var _this = this;
                            var possibleArtists = [];
                            var signal = new MS.Entertainment.UI.Framework.Signal;
                            var currentFocusRank = 0;
                            var currentFocusResult;
                            var _searchAndExtractArtistsIteration = function() {
                                    _this._focusAndExtractArtists(data, currentFocusRank).then(function(focusResult) {
                                        possibleArtists.push(focusResult);
                                        currentFocusResult = focusResult;
                                        if (currentFocusRank === -1)
                                            return WinJS.Promise.as(true);
                                        else
                                            return _this._isFocusResultSuccessful(focusResult)
                                    }).done(function(resultSuccessful) {
                                        if (resultSuccessful)
                                            signal.complete(currentFocusResult);
                                        else if (currentFocusRank === -1)
                                            signal.complete(currentFocusResult);
                                        else if (currentFocusRank >= _this.maxFocusRank) {
                                            currentFocusRank = -1;
                                            _searchAndExtractArtistsIteration()
                                        }
                                        else {
                                            currentFocusRank++;
                                            _searchAndExtractArtistsIteration()
                                        }
                                    }, function(error) {
                                        var result = _this._getBestMatchedSearch(possibleArtists);
                                        if (result)
                                            signal.complete(result);
                                        else
                                            signal.error(error)
                                    })
                                };
                            _searchAndExtractArtistsIteration();
                            return signal.promise
                        };
                        WebSiteArtistsQuery.prototype._getBestMatchedSearch = function(possibleArtists) {
                            var result = null;
                            if (possibleArtists)
                                for (var i = 0; i < possibleArtists.length; i++)
                                    if (!result || (possibleArtists[i].artists && result.artists.count < possibleArtists[i].artists.count))
                                        result = possibleArtists[i];
                            return result
                        };
                        WebSiteArtistsQuery.prototype._focusAndExtractArtists = function(data, focusRank) {
                            var _this = this;
                            if (!this._htmlFocuser)
                                return WinJS.Promise.wrapError(new Error("WebSideArtistsQuery failed at _focusAndExtractArtists. It's likely it's been disposed of"));
                            var pendingFocusedData = null;
                            var promise;
                            var query = new MS.Entertainment.ViewModels.Share.SortedExtractArtists;
                            this._htmlFocuser.unfocusedData = data;
                            this._htmlFocuser.focusRank = focusRank;
                            promise = this._htmlFocuser.start().then(function(data) {
                                pendingFocusedData = data;
                                query.focusedData = data;
                                query.minPopularity = _this.minPopularity;
                                return query.execute()
                            }).then(function() {
                                return {
                                        artists: query.result && query.result.items, innerQuery: query, focusedData: pendingFocusedData
                                    }
                            }, function(error) {
                                query.dispose();
                                return WinJS.Promise.wrapError(error)
                            });
                            return promise
                        };
                        WebSiteArtistsQuery.prototype._isFocusResultSuccessful = function(focusResult) {
                            var _this = this;
                            var result;
                            if (focusResult && focusResult.innerQuery && focusResult.artists && focusResult.artists.count && focusResult.focusedData && focusResult.focusedData.strings && focusResult.focusedData.strings.length) {
                                var weightedArtistCount = 0;
                                var artistNameLength = 0;
                                result = focusResult.artists.forEach(function(iterator) {
                                    var artist = iterator.item.data;
                                    var artistName = artist.sortName || artist.name;
                                    var currentArtistCount = 0;
                                    if (artistName) {
                                        currentArtistCount++;
                                        artistNameLength += artistName.length;
                                        var duplicates = focusResult.focusedData.stringMap[artistName.toLocaleLowerCase()] || [];
                                        for (var i = 1; i < duplicates.length; i++)
                                            if (focusResult.focusedData.getCDSPosition(duplicates[i]) < focusResult.innerQuery.visitedText)
                                                currentArtistCount++;
                                            else
                                                break
                                    }
                                    currentArtistCount = currentArtistCount * (artist.familiarity / _this.minFocusedSuccessFamiliarity);
                                    weightedArtistCount += currentArtistCount
                                }).then(function() {
                                    var queryText = focusResult.innerQuery.text || String.empty;
                                    var averageArtistNameLength = artistNameLength / focusResult.artists.count;
                                    var averageStringLength = focusResult.focusedData.stringOffsets[focusResult.focusedData.strings.length - 1] / focusResult.focusedData.strings.length;
                                    var textVisitedPercentage = Math.min(1.0, !queryText.length ? 0 : (focusResult.innerQuery.visitedText / focusResult.innerQuery.text.length));
                                    var stringsVisited = focusResult.focusedData.strings.length * textVisitedPercentage;
                                    var weightedSuccessCount = _this.minFocusedSuccessCount + (_this.minFocusedSuccessCount * (averageStringLength / averageArtistNameLength) * Math.log(stringsVisited / weightedArtistCount));
                                    return weightedArtistCount >= weightedSuccessCount
                                })
                            }
                            else
                                result = WinJS.Promise.as(false);
                            return result
                        };
                        WebSiteArtistsQuery.prototype._releaseInnerQuery = function() {
                            if (this._innerQuery) {
                                this._innerQuery.dispose();
                                this._innerQuery = null
                            }
                        };
                        WebSiteArtistsQuery.s_minFocusedSuccessCount = 7;
                        WebSiteArtistsQuery.s_minFocusedSuccessFamiliarity = .56;
                        WebSiteArtistsQuery.s_maxFocusRank = 3;
                        return WebSiteArtistsQuery
                    })(Data.ModelQuery);
                Share.WebSiteArtistsQuery = WebSiteArtistsQuery;
                var SortedExtractArtists = (function(_super) {
                        __extends(SortedExtractArtists, _super);
                        function SortedExtractArtists() {
                            _super.call(this);
                            this._nextTextChunk = String.empty;
                            this.stampChunkInformation = true
                        }
                        Object.defineProperty(SortedExtractArtists.prototype, "focusedData", {
                            get: function() {
                                return this._focusedData
                            }, set: function(value) {
                                    if (this._focusedData !== value) {
                                        this._focusedData = value;
                                        this._text = null
                                    }
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(SortedExtractArtists.prototype, "text", {
                            get: function() {
                                if (!this._text && this.focusedData)
                                    this._text = this.focusedData.cds;
                                return this._text
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(SortedExtractArtists.prototype, "nextTextChunk", {
                            get: function() {
                                var returnText = String.empty;
                                var lastSepartor = -1;
                                if (this.text && this.visitedText < this.text.length) {
                                    if (this.visitedText !== this._nextTextChunkOffset || !this._nextTextChunk) {
                                        this._nextTextChunkOffset = this.visitedText;
                                        this._nextTextChunk = this.text.substring(this._nextTextChunkOffset, this._nextTextChunkOffset + this.maxTextChunkSize) || String.empty;
                                        if (this._nextTextChunk.length + this.visitedText < this.text.length)
                                            lastSepartor = this._nextTextChunk.lastIndexOf(this._focusedData.cdsSepartor);
                                        if (lastSepartor > 0)
                                            this._nextTextChunk = this._nextTextChunk.substring(0, lastSepartor + 1)
                                    }
                                    returnText = this._nextTextChunk
                                }
                                return returnText
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(SortedExtractArtists.prototype, "filterWords", {
                            get: function() {
                                return this._filterWords
                            }, set: function(value) {
                                    this._filterWords = value || []
                                }, enumerable: true, configurable: true
                        });
                        SortedExtractArtists.prototype._createResultAugmentation = function() {
                            return MS.Entertainment.Data.define(null, {items: MS.Entertainment.Data.Property.sort("response.artists", this._compareArtists.bind(this), this._keepArtist.bind(this), Data.Augmenter.EchoNest.Artist)})
                        };
                        SortedExtractArtists.prototype._keepArtist = function(artist) {
                            var keep = true;
                            var artistName = artist ? (artist.sortName || artist.name) : null;
                            var filterWords = this.filterWords || [];
                            if (!artistName || artistName.length <= 1 || filterWords.indexOf(artistName.toLowerCase()) >= 0 || (artistName.length <= 3 && artistName[0].match(/[0-9]/)))
                                keep = false;
                            return keep
                        };
                        SortedExtractArtists.prototype._compareArtists = function(artist1, artist2) {
                            var artistName1 = artist1 ? (artist1.sortName || artist1.name || String.empty) : String.empty;
                            artistName1 = artistName1.toLowerCase();
                            var artistName2 = artist2 ? (artist2.sortName || artist2.name || String.empty) : String.empty;
                            artistName2 = artistName2.toLowerCase();
                            var namePosition1 = this._getFirstInRangeCDSPosition(artistName1, artist1);
                            var namePosition2 = this._getFirstInRangeCDSPosition(artistName2, artist2);
                            if (namePosition1 < 0)
                                namePosition1 = this._slowGetFirstInCDSPosition(artistName1, artist1);
                            if (namePosition2 < 0)
                                namePosition2 = this._slowGetFirstInCDSPosition(artistName2, artist2);
                            var result;
                            if (namePosition1 === namePosition2)
                                result = 0;
                            else if (namePosition1 < 0)
                                result = 1;
                            else if (namePosition2 < 0)
                                result = -1;
                            else if (namePosition1 < namePosition2)
                                result = -1;
                            else
                                result = 1;
                            return result
                        };
                        SortedExtractArtists.prototype._preInnerExecute = function() {
                            var _this = this;
                            var promiseResult = _super.prototype._preInnerExecute.call(this);
                            if (this.isLoadingFromStart)
                                this.resultAugmentation = this._createResultAugmentation();
                            if (!this._filterWords) {
                                var filters = new MS.Entertainment.Data.Query.Music.WebPlaylist.Filters;
                                promiseResult = promiseResult.then(function() {
                                    return filters.execute()
                                }).then(function() {
                                    _this._filterWords = (filters.result && filters.result.words) || []
                                }, function() {
                                    _this._filterWords = []
                                }).then(function() {
                                    filters.dispose()
                                })
                            }
                            return promiseResult
                        };
                        SortedExtractArtists.prototype._getFirstInRangeCDSPosition = function(value, artist) {
                            var firstCDSPosition = -1;
                            var cdsPosition = 0;
                            var stringPosition = 0;
                            var positions = null;
                            var minCDSPosition = 0;
                            var maxCDSPosition = this.visitedText - 1;
                            if (artist && artist.chunkInformation) {
                                minCDSPosition = artist.chunkInformation.firstIndex;
                                maxCDSPosition = artist.chunkInformation.lastIndex
                            }
                            if (this.focusedData && value) {
                                positions = this.focusedData.stringMap[value] || [];
                                for (var i = 0; i < positions.length; i++) {
                                    stringPosition = positions[i];
                                    cdsPosition = this.focusedData.getCDSPosition(stringPosition);
                                    if (cdsPosition >= minCDSPosition && cdsPosition <= maxCDSPosition) {
                                        firstCDSPosition = cdsPosition;
                                        break
                                    }
                                    else if (cdsPosition > maxCDSPosition)
                                        break
                                }
                            }
                            return firstCDSPosition
                        };
                        SortedExtractArtists.prototype._slowGetFirstInCDSPosition = function(value, artist) {
                            var firstCDSPosition = -1;
                            var minCDSPosition = 0;
                            var maxCDSPosition = this.visitedText - 1;
                            if (artist && artist.chunkInformation) {
                                minCDSPosition = artist.chunkInformation.firstIndex;
                                maxCDSPosition = artist.chunkInformation.lastIndex
                            }
                            if (this.focusedData && value && value.length > 1) {
                                firstCDSPosition = this.focusedData.searchCDS(value, minCDSPosition);
                                if (firstCDSPosition > maxCDSPosition)
                                    firstCDSPosition = -1
                            }
                            return firstCDSPosition
                        };
                        return SortedExtractArtists
                    })(Data.Query.Music.EchoNest.ExtractArtists);
                Share.SortedExtractArtists = SortedExtractArtists;
                var WebPageLoader = (function() {
                        function WebPageLoader() {
                            this._completed = false;
                            this._frameUris = null;
                            this._retryCount = 0;
                            this._maxRetryCount = 1;
                            this._firstLongRunningScriptTimeStamp = -1;
                            this._stabilizeTimeMS = 0
                        }
                        WebPageLoader.prototype.dispose = function() {
                            this.cancel()
                        };
                        Object.defineProperty(WebPageLoader.prototype, "documentTitle", {
                            get: function() {
                                return this._documentTitle
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(WebPageLoader.prototype, "isSupported", {
                            get: function() {
                                var isSupported = true;
                                try {
                                    var webView = document.createElement("x-ms-webview");
                                    isSupported = !!webView.navigate
                                }
                                catch(e) {
                                    isSupported = false
                                }
                                return isSupported
                            }, enumerable: true, configurable: true
                        });
                        WebPageLoader.prototype.start = function(url) {
                            var _this = this;
                            if (url !== this._url)
                                this.cancel();
                            if (!this._workerPromise) {
                                this._url = url;
                                var html = String.empty;
                                this._workerPromise = this._loadRoot().then(function(rootHtml) {
                                    html = rootHtml;
                                    return _this._loadFrames()
                                }).then(function(framesHtml) {
                                    if (framesHtml)
                                        html = html + "\r\n" + framesHtml;
                                    return html
                                }, function(e) {
                                    _this.cancel();
                                    return WinJS.Promise.wrapError(e)
                                })
                            }
                            return this._workerPromise
                        };
                        WebPageLoader.prototype.cancel = function() {
                            this._documentTitle = null;
                            this._url = null;
                            this._frameUris = null;
                            if (this._workerPromise) {
                                this._workerPromise.cancel();
                                this._workerPromise = null
                            }
                            this._cancelWebViewWork()
                        };
                        WebPageLoader.prototype._cancelWebViewWork = function() {
                            this._completed = false;
                            this._loadedOnce = false;
                            this._loading = false;
                            this._retry = false;
                            this._firstLongRunningScriptTimeStamp = -1;
                            this._retryCount = 0;
                            this._clearWebViewHandlers();
                            this._stabilizeTimeMS = WebPageLoader.s_maxStabilizeTimeMS;
                            if (this._webPageLoadSignal) {
                                this._webPageLoadSignal.promise.cancel();
                                this._webPageLoadSignal = null
                            }
                            if (this._webPageStabilizeTimer) {
                                this._webPageStabilizeTimer.cancel();
                                this._webPageStabilizeTimer = null
                            }
                            this._clearWebView()
                        };
                        WebPageLoader.prototype._clearWebView = function() {
                            if (this._webView) {
                                document.body.removeChild(this._webView);
                                this._webView = null
                            }
                        };
                        WebPageLoader.prototype._loadRoot = function() {
                            return this._startWebViewLoad(this._url)
                        };
                        WebPageLoader.prototype._loadFrames = function() {
                            var _this = this;
                            var framesSignal = new MS.Entertainment.UI.Framework.Signal;
                            var html = [];
                            var frameUris = null;
                            frameUris = this._frameUris;
                            this._frameUris = null;
                            var loadNextFrame = function(newHtml) {
                                    var nextUri;
                                    if (newHtml)
                                        html.push(newHtml);
                                    if (!frameUris || !frameUris.length)
                                        framesSignal.complete(html.join("\r\n"));
                                    else {
                                        nextUri = frameUris.shift().rawUri;
                                        if (nextUri && MS.Entertainment.Utilities.verifyUrl(nextUri))
                                            _this._startWebViewLoad(nextUri).done(loadNextFrame, framesSignal.error);
                                        else
                                            loadNextFrame()
                                    }
                                };
                            loadNextFrame();
                            return framesSignal.promise
                        };
                        WebPageLoader.prototype._startWebViewLoad = function(url) {
                            var _this = this;
                            this._cancelWebViewWork();
                            return this._loadWebSite(url).then(function() {
                                    if (_this._webView && url === _this._url)
                                        _this._documentTitle = _this._webView.documentTitle;
                                    return _this._selectAll()
                                }).then(function() {
                                    return _this._copyHtml()
                                }).then(function(html) {
                                    _this._clearWebView();
                                    return html
                                }, function(error) {
                                    _this._workerPromise = null;
                                    _this._cancelWebViewWork();
                                    return WinJS.Promise.wrapError(error)
                                })
                        };
                        WebPageLoader.prototype._loadWebSite = function(url) {
                            var _this = this;
                            if (!this._webPageLoadSignal)
                                this._webPageLoadSignal = new MS.Entertainment.UI.Framework.Signal;
                            if (!this._webView) {
                                try {
                                    this._webView = document.createElement("x-ms-webview")
                                }
                                catch(e) {
                                    this._webView = null
                                }
                                if (this._webView && !this._webView.navigate)
                                    this._webView = null;
                                if (this._webView) {
                                    this._webView.style.display = "none";
                                    document.body.appendChild(this._webView)
                                }
                            }
                            if (!this._webViewHandlers && this._webView)
                                this._webViewHandlers = Utilities.addEventHandlers(this._webView, {
                                    MSWebViewLongRunningScriptDetected: this._onLongRunningScriptDetected.bind(this), MSWebViewNavigationStarting: this._onNavigationStarting.bind(this), MSWebViewDOMContentLoaded: this._domContentLoaded.bind(this), MSWebViewNavigationCompleted: this._navigationCompleted.bind(this), MSWebViewFrameNavigationStarting: this._frameNavigationStarting.bind(this), MSWebViewFrameDOMContentLoaded: this._frameDOMContentLoaded.bind(this), MSWebViewFrameNavigationCompleted: this._frameNavigationCompleted.bind(this)
                                });
                            if (this._webView)
                                this._navigate(url);
                            else
                                this._webPageLoadSignal.complete();
                            return WinJS.Promise.any([this._webPageLoadSignal.promise, WinJS.Promise.timeout(WebPageLoader.s_maxLoadTimeMS)]).then(function() {
                                    if (_this._webView)
                                        _this._webView.stop()
                                })
                        };
                        WebPageLoader.prototype._selectAll = function() {
                            var _this = this;
                            var scriptDonePromise;
                            if (!this._webView)
                                scriptDonePromise = WinJS.Promise.as();
                            else
                                scriptDonePromise = new WinJS.Promise(function(c, e, p) {
                                    var operation = _this._webView.invokeScriptAsync("eval", "document.body.createTextRange().select()");
                                    operation.oncomplete = c;
                                    operation.onerror = e;
                                    operation.start()
                                });
                            return scriptDonePromise
                        };
                        WebPageLoader.prototype._copyHtml = function() {
                            var _this = this;
                            var getDataPackage;
                            if (!this._webView)
                                getDataPackage = WinJS.Promise.as();
                            else
                                getDataPackage = new WinJS.Promise(function(c, e, p) {
                                    var asyncOperation = _this._webView.captureSelectedContentToDataPackageAsync();
                                    asyncOperation.onerror = e;
                                    asyncOperation.oncomplete = function() {
                                        c(asyncOperation.result && asyncOperation.result.getView())
                                    };
                                    asyncOperation.start()
                                });
                            return getDataPackage.then(function(dataView) {
                                    if (dataView)
                                        return dataView.getHtmlFormatAsync()
                                }).then(function(html) {
                                    return html || String.empty
                                })
                        };
                        WebPageLoader.prototype._clearWebViewHandlers = function() {
                            if (this._webViewHandlers) {
                                this._webViewHandlers.cancel();
                                this._webViewHandlers = null
                            }
                        };
                        WebPageLoader.prototype._navigate = function(url) {
                            if (this._webView)
                                this._webView.navigate(url || this._webView.src)
                        };
                        WebPageLoader.prototype._onLongRunningScriptDetected = function(eventArgs) {
                            var timeStampDetlaMS = -1;
                            if (this._firstLongRunningScriptTimeStamp >= 0)
                                timeStampDetlaMS = eventArgs.timeStamp - this._firstLongRunningScriptTimeStamp;
                            else
                                this._firstLongRunningScriptTimeStamp = eventArgs.timeStamp;
                            if (timeStampDetlaMS > 1000) {
                                if (this._webView)
                                    this._webView.stop();
                                this._finalizeWebPageLoad();
                                this._firstLongRunningScriptTimeStamp = Number.POSITIVE_INFINITY
                            }
                        };
                        WebPageLoader.prototype._onNavigationStarting = function() {
                            if (this._loadedOnce || this._loading)
                                this._retry = true;
                            this._loading = true
                        };
                        WebPageLoader.prototype._domContentLoaded = function() {
                            if (this._loadedOnce && !this._loading)
                                this._finalizeWebPageLoad()
                        };
                        WebPageLoader.prototype._navigationCompleted = function() {
                            this._loadedOnce = true;
                            this._loading = false;
                            if (this._retry && this._retryCount < this._maxRetryCount) {
                                this._retryCount++;
                                this._navigate()
                            }
                            else
                                this._finalizeWebPageLoad()
                        };
                        WebPageLoader.prototype._frameNavigationStarting = function(args) {
                            var _this = this;
                            this._frameUris = this._frameUris || [];
                            var uri = new Windows.Foundation.Uri(args.uri);
                            var contains = true;
                            if (uri.host)
                                contains = this._frameUris.some(function(existing, index, source) {
                                    return existing.host.toLowerCase() === uri.host.toLowerCase()
                                });
                            if (!contains)
                                this._frameUris.push(uri);
                            args.preventDefault();
                            if (!this._loadedOnce || this._loading)
                                WinJS.Promise.timeout(this._stabilizeTimeMS).done(function() {
                                    if (!_this._loadedOnce || _this._loading)
                                        _this._navigationCompleted();
                                    else
                                        _this._finalizeWebPageLoad()
                                });
                            else
                                this._finalizeWebPageLoad()
                        };
                        WebPageLoader.prototype._frameDOMContentLoaded = function() {
                            if (this._loadedOnce && !this._loading)
                                this._finalizeWebPageLoad()
                        };
                        WebPageLoader.prototype._frameNavigationCompleted = function() {
                            if (this._loadedOnce && !this._loading)
                                this._finalizeWebPageLoad()
                        };
                        WebPageLoader.prototype._finalizeWebPageLoad = function() {
                            var _this = this;
                            if (this._completed)
                                return;
                            var promises = [];
                            if (this._webPageStabilizeTimer)
                                promises.push(this._webPageStabilizeTimer);
                            if (this._stabilizeTimeMS >= 0) {
                                promises.push(WinJS.Promise.timeout(this._stabilizeTimeMS));
                                this._stabilizeTimeMS -= WebPageLoader.s_stabilizeTimeStepMS
                            }
                            this._webPageStabilizeTimer = WinJS.Promise.join(promises);
                            var currentTimer = this._webPageStabilizeTimer;
                            currentTimer.done(function() {
                                if (currentTimer !== _this._webPageStabilizeTimer)
                                    return;
                                _this._completed = true;
                                _this._clearWebViewHandlers();
                                if (_this._webPageLoadSignal)
                                    _this._webPageLoadSignal.complete()
                            }, function() {
                                return
                            })
                        };
                        WebPageLoader.s_maxStabilizeTimeMS = 3000;
                        WebPageLoader.s_stabilizeTimeStepMS = 500;
                        WebPageLoader.s_maxLoadTimeMS = 11000;
                        return WebPageLoader
                    })();
                Share.WebPageLoader = WebPageLoader;
                var WorkerBase = (function() {
                        function WorkerBase(workFile) {
                            this._workFile = workFile;
                            this._autoTerminateWorker = true
                        }
                        WorkerBase.prototype.dispose = function() {
                            this.cancel();
                            this._terminateWorker()
                        };
                        WorkerBase.prototype.start = function() {
                            this.cancel();
                            if (!this._workerSignal)
                                this._workerSignal = new MS.Entertainment.UI.Framework.Signal;
                            if (!this._worker)
                                this._worker = new Worker(this._workFile);
                            if (!this._workerMessages)
                                this._workerMessages = Utilities.addEventHandlers(this._worker, {message: this._recieveMessage.bind(this)});
                            this._onStarted();
                            this._workerSignal.promise.done(null, this.cancel.bind(this));
                            return this._workerSignal.promise
                        };
                        WorkerBase.prototype.cancel = function() {
                            if (this._workerMessages) {
                                this._workerMessages.cancel();
                                this._workerMessages = null
                            }
                            if (this._autoTerminateWorker)
                                this._terminateWorker();
                            if (this._workerSignal) {
                                this._workerSignal.promise.cancel();
                                this._workerSignal = null
                            }
                        };
                        WorkerBase.prototype._terminateWorker = function() {
                            if (this._worker) {
                                this._worker.terminate();
                                this._worker = null
                            }
                        };
                        WorkerBase.prototype._postMessage = function(data) {
                            if (this._worker)
                                this._worker.postMessage(JSON.stringify(data))
                        };
                        WorkerBase.prototype._complete = function(promiseResult) {
                            if (this._workerSignal)
                                this._workerSignal.complete(promiseResult);
                            this.cancel()
                        };
                        WorkerBase.prototype._onStarted = function(){};
                        WorkerBase.prototype._onReceivedMessage = function(data){};
                        WorkerBase.prototype._recieveMessage = function(args) {
                            var detail = (args && args.data);
                            var parsedDetail = null;
                            try {
                                parsedDetail = JSON.parse(detail)
                            }
                            catch(error) {
                                parsedDetail = null
                            }
                            this._onReceivedMessage(parsedDetail)
                        };
                        return WorkerBase
                    })();
                Share.WorkerBase = WorkerBase;
                var HTMLToCDSParser = (function(_super) {
                        __extends(HTMLToCDSParser, _super);
                        function HTMLToCDSParser() {
                            _super.call(this, "/ViewModels/Music1/ShareTargetHtmlParserWorker.js")
                        }
                        HTMLToCDSParser.prototype._onStarted = function() {
                            this._postMessage({
                                type: "html", data: this.html
                            })
                        };
                        HTMLToCDSParser.prototype._onReceivedMessage = function(data) {
                            if (data && data.type === "result") {
                                var result = new HTMLToCDSParserData;
                                if (data && data.data) {
                                    result.strings = data.data.strings;
                                    result.stringOffsets = data.data.stringOffsets;
                                    result.stringMap = data.data.stringMap;
                                    result.tagMap = data.data.tagMap
                                }
                                this._complete(result)
                            }
                        };
                        return HTMLToCDSParser
                    })(WorkerBase);
                Share.HTMLToCDSParser = HTMLToCDSParser;
                var HTMLFocuser = (function(_super) {
                        __extends(HTMLFocuser, _super);
                        function HTMLFocuser() {
                            _super.call(this, "/ViewModels/Music1/ShareTargetFocusWorker.js");
                            this.focusRank = 0;
                            this._autoTerminateWorker = false;
                            this._hasNewFocusedData = false;
                            this._hasNewPatternDistanceForgiveness = false
                        }
                        Object.defineProperty(HTMLFocuser.prototype, "unfocusedData", {
                            get: function() {
                                return this._unfocusedData
                            }, set: function(value) {
                                    if (value !== this._unfocusedData) {
                                        this._hasNewFocusedData = true;
                                        this._unfocusedData = value
                                    }
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(HTMLFocuser.prototype, "patternDistanceForgiveness", {
                            get: function() {
                                return this._patternDistanceForgiveness
                            }, set: function(value) {
                                    if (value !== this._patternDistanceForgiveness) {
                                        this._hasNewPatternDistanceForgiveness = true;
                                        this._patternDistanceForgiveness = value
                                    }
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(HTMLFocuser.prototype, "patternThreshold", {
                            get: function() {
                                return this._patternThreshold
                            }, set: function(value) {
                                    if (value !== this._patternThreshold) {
                                        this._hasNewPatternThreshold = true;
                                        this._patternThreshold = value
                                    }
                                }, enumerable: true, configurable: true
                        });
                        HTMLFocuser.prototype._onStarted = function() {
                            var inputData = {
                                    htmlData: null, focusRank: this.focusRank
                                };
                            if (this._hasNewPatternDistanceForgiveness) {
                                this._hasNewPatternDistanceForgiveness = false;
                                inputData.patternDistanceForgiveness = this.patternDistanceForgiveness
                            }
                            if (this._hasNewPatternThreshold) {
                                this._hasNewPatternThreshold = false;
                                inputData.patternThreshold = this.patternThreshold
                            }
                            if (this._hasNewFocusedData) {
                                this._hasNewFocusedData = false;
                                inputData.htmlData = {
                                    strings: this.unfocusedData && this.unfocusedData.strings, stringOffsets: this.unfocusedData && this.unfocusedData.stringOffsets, stringMap: this.unfocusedData && this.unfocusedData.stringMap, tagMap: this.unfocusedData && this.unfocusedData.tagMap
                                }
                            }
                            this._postMessage({
                                type: "input", data: inputData
                            })
                        };
                        HTMLFocuser.prototype._onReceivedMessage = function(data) {
                            if (data && data.type === "result") {
                                var result = new FocusedHTMLToCDSData;
                                if (data && data.data) {
                                    result.strings = data.data.strings;
                                    result.stringOffsets = data.data.stringOffsets;
                                    result.stringMap = data.data.stringMap;
                                    result.focusOffset = data.data.focusOffset
                                }
                                this._complete(result)
                            }
                        };
                        return HTMLFocuser
                    })(WorkerBase);
                Share.HTMLFocuser = HTMLFocuser;
                var CDSFactory = (function() {
                        function CDSFactory() {
                            this.cdsSepartor = "\",\"";
                            this.cdsStartEnd = "\"";
                            this.strings = null;
                            this.stringMap = null;
                            this._cds = null;
                            this._cdsLowerCase = null
                        }
                        Object.defineProperty(CDSFactory.prototype, "cds", {
                            get: function() {
                                if (!this._cds && this.strings)
                                    this._cds = this.cdsStartEnd + this.strings.join(this.cdsSepartor) + this.cdsStartEnd;
                                return this._cds
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(CDSFactory.prototype, "cdsLowerCase", {
                            get: function() {
                                if (!this._cdsLowerCase && this.cds)
                                    this._cdsLowerCase = this.cds.toLowerCase();
                                return this._cdsLowerCase
                            }, enumerable: true, configurable: true
                        });
                        CDSFactory.prototype.getCDSPosition = function(stringIndex) {
                            var position = -1;
                            if (this.stringOffsets && stringIndex >= 0 && stringIndex < this.stringOffsets.length) {
                                position = 1;
                                if (stringIndex > 0)
                                    position += this.stringOffsets[stringIndex - 1] + (stringIndex * this.cdsSepartor.length)
                            }
                            return position
                        };
                        CDSFactory.prototype.searchCDS = function(value, startIndex) {
                            var index = -1;
                            if (this.cdsLowerCase)
                                index = this.cdsLowerCase.indexOf(value.toLowerCase());
                            return index
                        };
                        return CDSFactory
                    })();
                Share.CDSFactory = CDSFactory;
                var HTMLToCDSParserData = (function(_super) {
                        __extends(HTMLToCDSParserData, _super);
                        function HTMLToCDSParserData() {
                            _super.apply(this, arguments)
                        }
                        return HTMLToCDSParserData
                    })(CDSFactory);
                Share.HTMLToCDSParserData = HTMLToCDSParserData;
                var FocusedHTMLToCDSData = (function(_super) {
                        __extends(FocusedHTMLToCDSData, _super);
                        function FocusedHTMLToCDSData() {
                            _super.apply(this, arguments)
                        }
                        return FocusedHTMLToCDSData
                    })(CDSFactory);
                Share.FocusedHTMLToCDSData = FocusedHTMLToCDSData
            })(Share = ViewModels.Share || (ViewModels.Share = {}))
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
