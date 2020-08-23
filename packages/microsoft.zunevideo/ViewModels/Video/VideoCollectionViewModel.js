/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoCollectionQueryViewModelBaseMixIn: {
            items: null, titleOverride: null, hideHubs: false, modifierSelectionManager: null
        }});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoCollectionQueryViewModelBase: WinJS.Class.mix(function observableQuery() {
            this._initObservable(Object.create(MS.Entertainment.ViewModels.VideoCollectionQueryViewModelBaseMixIn))
        }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, WinJS.Binding.expandProperties(MS.Entertainment.ViewModels.VideoCollectionQueryViewModelBaseMixIn))});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoCollection: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.VideoCollectionQueryViewModelBase", function collectionConstructor(view, hub) {
            MS.Entertainment.ViewModels.VideoCollectionQueryViewModelBase.prototype.constructor.call(this);
            if (this.isValidView(view))
                this.view = view;
            this.hub = hub;
            this.modifierSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(null, 0, this.settingsKey);
            this.queryWatcher = new MS.Entertainment.Framework.QueryWatcher("videos");
            this._updateNavigationHandler();
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var moviesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
            var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
            this._isMarketplaceEnabled = (moviesMarketplaceEnabled || tvMarketplaceEnabled)
        }, {
            hub: null, isDisposed: true, _isMarketplaceEnabled: false, _folderQuery: null, _requestQuery: null, _responseQuery: null, _folderStack: [], isCurrentQuery: function isCurrentQuery() {
                    return this._requestQuery === this._responseQuery
                }, _view: null, view: {
                    get: function() {
                        return this._view
                    }, set: function(value) {
                            if (this._view !== value) {
                                this._view = value;
                                this._viewChanged()
                            }
                        }
                }, settingsKey: {get: function() {
                        return "videoCollectionModifier-" + this.view
                    }}, _sort: null, sort: {
                    get: function() {
                        return this._sort
                    }, set: function(value) {
                            if (this._sort !== value) {
                                this._sort = value;
                                this._sortChanged()
                            }
                        }
                }, tvSubType: "episodes", queryWatcher: null, beginQuery: function collectionBeginQuery() {
                    if (!this.sort)
                        return;
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    var query;
                    var taskKeyGetter = null;
                    var notifier = null;
                    var titleOverride = null;
                    var hideHubs = false;
                    if (this.view === "tv")
                        query = new MS.Entertainment.ViewModels.VideoCollection.Queries[this.view][this.tvSubType];
                    else
                        query = new MS.Entertainment.ViewModels.VideoCollection.Queries[this.view];
                    query.category = MS.Entertainment.ViewModels.VideoCollection.Categories[this.view];
                    query.sort = MS.Entertainment.ViewModels.VideoCollection.Sorts[this.view]().types[this.sort];
                    query.chunkSize = 10;
                    query.queryId = MS.Entertainment.UI.Monikers.videoCollectionPanel;
                    if (MS.Entertainment.UI.FileTransferService)
                        switch (this.view) {
                            case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.movies:
                                taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("libraryId");
                                notifier = MS.Entertainment.UI.FileTransferNotifiers.genericFile;
                                break;
                            case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.tv:
                                switch (this.tvSubType) {
                                    case MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.episodes:
                                        taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("libraryId");
                                        notifier = MS.Entertainment.UI.FileTransferNotifiers.genericFile;
                                        break;
                                    case MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.seasons:
                                        taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("seasonLibraryId");
                                        notifier = MS.Entertainment.UI.FileTransferNotifiers.episodeCollection;
                                        break;
                                    case MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.series:
                                        taskKeyGetter = MS.Entertainment.UI.FileTransferService.keyFromProperty("seriesLibraryId");
                                        notifier = MS.Entertainment.UI.FileTransferNotifiers.episodeCollection;
                                        break
                                }
                                break
                        }
                    if (taskKeyGetter) {
                        var notifications = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                        var sender = notifications.createSender();
                        notifications.modifyQuery(query)
                    }
                    query.isLive = true;
                    this.disposeQuery();
                    this._requestQuery = query;
                    this.queryWatcher.registerQuery(query);
                    var clearListTimeout = WinJS.Promise.timeout(500).then(function clearList() {
                            this._setItems(null)
                        }.bind(this));
                    if (MS.Entertainment.Utilities.isVideoApp2)
                        if (this.hub && this.hub.title && this.modifierSelectionManager && this.modifierSelectionManager.selectedItem && this.modifierSelectionManager.selectedItem.label)
                            titleOverride = String.load(String.id.IDS_VIDEO_VIEW_BY_TITLE).format(this.hub.title, String.load(this.modifierSelectionManager.selectedItem.label));
                    if (this.view === MS.Entertainment.ViewModels.VideoCollection.ViewTypes.other) {
                        var folderQuery = new MS.Entertainment.Data.Query.LibraryFolders;
                        this.queryWatcher.registerQuery(folderQuery);
                        this._folderQuery = folderQuery;
                        if (this._folderStack.length > 0) {
                            this._overrideShellBackButton(true, MS.Entertainment.Shell.BackButton.ButtonMode.backButton);
                            var parentFolder = this._folderStack[this._folderStack.length - 1];
                            folderQuery.parentFolderId = parentFolder.folderId;
                            query.folderId = parentFolder.folderId;
                            titleOverride = parentFolder.name;
                            hideHubs = true
                        }
                        else {
                            this._overrideShellBackButton(this._isMarketplaceEnabled);
                            query.folderId = -1
                        }
                        folderQuery.chunkSize = 10000;
                        folderQuery.sort = (MS.Entertainment.ViewModels.VideoCollection.Sorts[this.view]().types[this.sort] === MS.Entertainment.ViewModels.VideoCollection.Sorts.other().types.dateAdded) ? Microsoft.Entertainment.Queries.FoldersSortBy.dateModifiedDescending : Microsoft.Entertainment.Queries.FoldersSortBy.titleAscending;
                        this._responseQuery = query;
                        folderQuery.execute().then(function(folderResults) {
                            query.getItems().then(function(videoResults) {
                                clearListTimeout.cancel();
                                clearListTimeout = null;
                                this._responseQuery = query;
                                if (videoResults && videoResults.insertRangeAtStart && folderResults && folderResults.result && folderResults.result.itemsArray && folderResults.result.itemsArray.length > 0)
                                    videoResults.insertRangeAtStart(folderResults.result.itemsArray);
                                this._setItems(videoResults);
                                eventProvider.traceNavigable_Loading_Done("videos")
                            }.bind(this))
                        }.bind(this))
                    }
                    else
                        query.execute().then(function(q) {
                            clearListTimeout.cancel();
                            this._responseQuery = query;
                            this._setItems(q.result.items);
                            if (taskKeyGetter) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener("videoCollection", taskKeyGetter, sender, notifier)
                            }
                            eventProvider.traceNavigable_Loading_Done("videos")
                        }.bind(this), function(q) {
                            MS.Entertainment.ViewModels.fail("VideoCollectionViewModel_beginQuery failed while retrieving videos from the database.")
                        });
                    this.titleOverride = titleOverride;
                    this.hideHubs = hideHubs;
                    if (this.view !== MS.Entertainment.ViewModels.VideoCollection.ViewTypes.other) {
                        var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                        purchaseHistoryService.grovel(false, false, true)
                    }
                }, _overrideShellBackButton: function _overrideShellBackButton(alwaysShow, backButtonMode) {
                    var backButtonService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.backButton);
                    if (backButtonService) {
                        backButtonService.overrideShowBackButton = alwaysShow;
                        backButtonService.overrideBackButtonMode = backButtonMode
                    }
                }, _setItems: function _setItems(items) {
                    if (this.items !== items) {
                        var oldValue = this.items;
                        this.items = items;
                        this.dispatchEvent(MS.Entertainment.ViewModels.VideoCollection.events.itemsChanged, {
                            sender: this, newValue: this.items, oldValue: oldValue
                        })
                    }
                }, _viewChanged: function collectionViewChanged() {
                    try {
                        Windows.Storage.ApplicationData.current.localSettings.values["VideoCollectionView"] = this.view
                    }
                    catch(e) {}
                }, _sortChanged: function collectionSortChanged() {
                    if (this.view === MS.Entertainment.ViewModels.VideoCollection.ViewTypes.tv)
                        switch (this.sort) {
                            case MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.seasons:
                                this.tvSubType = MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.seasons;
                                break;
                            case MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.episodes:
                                this.tvSubType = MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.episodes;
                                break;
                            default:
                                this.tvSubType = MS.Entertainment.ViewModels.VideoCollection.SubViewTypes.series;
                                break
                        }
                }, _updateNavigationHandler: function _updateNavigationHandler() {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    var page = WinJS.Binding.unwrap(navigationService.currentPage);
                    page.onNavigateTo = function() {
                        this._overrideShellBackButton(true)
                    }.bind(this);
                    var oldNavigateAway = page.onNavigateAway || function(){};
                    page.onNavigateAway = function() {
                        var currentHub = WinJS.Binding.unwrap(navigationService.currentHub);
                        if (currentHub && currentHub.iaNode && currentHub.iaNode.moniker === MS.Entertainment.UI.Monikers.otherVideoCollection) {
                            if (navigationService.navigationDirection === MS.Entertainment.Navigation.NavigationDirection.forward) {
                                oldNavigateAway();
                                if (this._isMarketplaceEnabled)
                                    this._overrideShellBackButton(false);
                                return false
                            }
                            if (navigationService.navigationDirection === MS.Entertainment.Navigation.NavigationDirection.backward) {
                                var canOpenParentFolder = (this._folderStack && this._folderStack.length > 0);
                                if (canOpenParentFolder) {
                                    this._overrideShellBackButton(true);
                                    this._folderStack.pop();
                                    this.beginQuery();
                                    return true
                                }
                                else {
                                    page.onNavigateAway = oldNavigateAway;
                                    this._overrideShellBackButton(false);
                                    oldNavigateAway();
                                    return false
                                }
                            }
                        }
                        this._overrideShellBackButton(false)
                    }.bind(this)
                }, isValidView: function isValidView(view) {
                    return (view in MS.Entertainment.ViewModels.VideoCollection.ViewTypes)
                }, resetDefaults: function resetDefaults() {
                    for (var view in MS.Entertainment.ViewModels.VideoCollection.ViewTypes)
                        try {
                            delete Windows.Storage.ApplicationData.current.localSettings.values["CollectionFilter-" + view]
                        }
                        catch(e) {}
                }, openFolder: function openFolder(folder) {
                    if (folder.folderId >= 0) {
                        this._folderStack.push(folder);
                        this.beginQuery()
                    }
                }, getQuery: function getQuery() {
                    return this._requestQuery
                }, dispose: function dispose() {
                    this.disposeQuery();
                    this.isDisposed = true
                }, disposeQuery: function disposeQuery() {
                    if (this._folderQuery && this._folderQuery.dispose) {
                        this._folderQuery.dispose();
                        this._folderQuery = null
                    }
                    if (this._requestQuery && this._requestQuery.dispose) {
                        this._requestQuery.dispose();
                        this._requestQuery = null
                    }
                    var fileTransferService = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                    if (fileTransferService)
                        fileTransferService.unregisterListener("videoCollection")
                }
        }, {
            ViewTypes: {
                movies: "movies", tv: "tv", other: "other"
            }, SubViewTypes: {
                    episodes: "episodes", seasons: "seasons", series: "series"
                }, Categories: {get: function categories_get() {
                        return {
                                movies: Microsoft.Entertainment.Queries.VideoType.movie, tv: Microsoft.Entertainment.Queries.VideoType.tvEpisode, other: Microsoft.Entertainment.Queries.VideoType.other
                            }
                    }}, Sorts: {
                    movies: function sorts_movies_get() {
                        return {
                                values: ["mostRecent", "dateAdded", "title"], mostRecent: {
                                        value: "mostRecent", title: String.id.IDS_VIDEO2_SORTS_MOST_RECENT_VUI_GUI
                                    }, dateAdded: {
                                        value: "dateAdded", title: String.id.IDS_VIDEO_COLLECTION_DATEADDED_SORT_2
                                    }, title: {
                                        value: "title", title: String.id.IDS_VIDEO_COLLECTION_ALPHA_SORT_2
                                    }, types: {
                                        mostRecent: Microsoft.Entertainment.Queries.VideosSortBy.dateAddedOrLastPlayingDescending, dateAdded: Microsoft.Entertainment.Queries.VideosSortBy.dateAddedDescending, title: Microsoft.Entertainment.Queries.VideosSortBy.titleAscending
                                    }
                            }
                    }, tv: function sorts_tv_get() {
                            return {
                                    values: ["mostRecent", "dateAdded", "series"], mostRecent: {
                                            value: "mostRecent", title: String.id.IDS_VIDEO2_SORTS_MOST_RECENT_VUI_GUI
                                        }, dateAdded: {
                                            value: "dateAdded", title: String.id.IDS_VIDEO_COLLECTION_DATEADDED_SORT_2
                                        }, series: {
                                            value: "series", title: String.id.IDS_VIDEO_COLLECTION_ALPHA_SORT_2
                                        }, types: {
                                            mostRecent: Microsoft.Entertainment.Queries.TVSeriesSortBy.latestActivityDescending, dateAdded: Microsoft.Entertainment.Queries.TVSeriesSortBy.dateLastEpisodeAddedDescending, series: Microsoft.Entertainment.Queries.TVSeriesSortBy.titleAscending
                                        }
                                }
                        }, other: function sorts_other_get() {
                            return {
                                    values: ["dateAdded", "title"], dateAdded: {
                                            value: "dateAdded", title: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_VIDEO_COLLECTION_DATEADDED_SORT : String.id.IDS_VIDEO_COLLECTION_DATEADDED_SORT_2
                                        }, title: {
                                            value: "title", title: MS.Entertainment.Utilities.isApp1 ? String.id.IDS_VIDEO_COLLECTION_ALPHA_SORT : String.id.IDS_VIDEO_COLLECTION_ALPHA_SORT_2
                                        }, types: {
                                            dateAdded: Microsoft.Entertainment.Queries.VideosSortBy.dateAddedDescending, title: Microsoft.Entertainment.Queries.VideosSortBy.titleAscending
                                        }
                                }
                        }
                }, Queries: {get: function queries_get() {
                        return {
                                movies: MS.Entertainment.Data.Query.libraryVideoMovies, tv: {
                                        episodes: MS.Entertainment.Data.Query.libraryVideoTV, seasons: MS.Entertainment.Data.Query.libraryTVSeasons, series: MS.Entertainment.Data.Query.libraryTVSeries
                                    }, other: MS.Entertainment.Data.Query.LibraryVideoFolder
                            }
                    }}, Templates: {get: function templates_get() {
                        return MS.Entertainment.ViewModels.VideoCollectionTemplates
                    }}, events: {
                    itemsChanged: "itemsChanged", modelActionsChanged: "modelActionsChanged"
                }
        })})
})()
