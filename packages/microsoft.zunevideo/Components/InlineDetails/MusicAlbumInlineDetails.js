/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Components.InlineDetails");
    WinJS.Namespace.define("MS.Entertainment.Pages", {MusicAlbumInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseMediaInlineDetails", null, function musicAlbumInlineDetails(element, options) {
            this.templateStorage = "/Components/InlineDetails/MusicAlbumInlineDetails.html";
            this.templateName = "music2AlbumInlineDetailsTemplate"
        }, {
            tracks: null, _songCount: 0, _signedInUser: null, _signInBindings: null, _listenerId: null, _invokedTrack: null, _eventHandlers: null, _buttonEventHandlers: null, _disableActionsOnListSelection: true, _enableCurrentButtonsBinding: true, initialize: function initialize() {
                    if (!this.media)
                        return;
                    this._list.ensureNextItemVisibleCount = 2;
                    this.LOADING_PANEL_SHOW_DELAY = 2000,
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this, arguments);
                    this.showListLoadingControl();
                    if (this.media.listenerId) {
                        this._listenerId = this.media.listenerId;
                        this.media.listenerId = null
                    }
                    this.media.location = this.originalLocation;
                    this.media = MS.Entertainment.ViewModels.MediaItemModel.augment(this.media);
                    this._formatDetailString();
                    this._setupSmartBuy();
                    if (this.originalLocation === MS.Entertainment.Data.ItemLocation.collection) {
                        this.media.fromCollection = true;
                        WinJS.Utilities.removeClass(this._list.domElement, "marketplaceTracks");
                        WinJS.Utilities.addClass(this._list.domElement, "collectionTracks");
                        this._loadLocalTracks();
                        if (this.media.hasServiceId && !this.media.hasCanonicalId) {
                            var query = new MS.Entertainment.Data.Query.Music.AlbumDetails;
                            query.id = this.media.serviceId;
                            query.idType = this.media.serviceIdType;
                            query.execute().done(function gotAlbum(albumQuery) {
                                if (WinJS.Utilities.getMember("result.item", albumQuery))
                                    this.media.canonicalId = albumQuery.result.item.canonicalId
                            }.bind(this), function albumQueryError(error) {
                                MS.Entertainment.Components.InlineDetails.fail("Album query to get canonical id failed: " + (error && error.message))
                            })
                        }
                    }
                    else {
                        if (this.media.fromCollection)
                            this.media.hydrated = false;
                        this.media.fromCollection = false;
                        WinJS.Utilities.removeClass(this._list.domElement, "collectionTracks");
                        WinJS.Utilities.addClass(this._list.domElement, "marketplaceTracks");
                        var trackBinding = WinJS.Binding.bind(this.media, {
                                tracks: this._loadServiceTracks.bind(this), isFailed: function _hydrateFailed(newValue) {
                                        if (!trackBinding || !newValue || this._unloaded)
                                            return;
                                        if (this._fallbackToCollection()) {
                                            trackBinding.cancel();
                                            trackBinding = null;
                                            this.originalLocation = MS.Entertainment.Data.ItemLocation.collection;
                                            this.initialize()
                                        }
                                    }.bind(this)
                            });
                        this.mediaBindings.push(trackBinding);
                        if (this._list && this._list.mediaContext)
                            this._list.mediaContext.containingMedia = {
                                playbackItemSource: this.media, playbackOffset: 0
                            }
                    }
                    this._hydrateMedia();
                    if (!this._eventHandlers)
                        this._eventHandlers = MS.Entertainment.Utilities.addEvents(this.domElement, {
                            iteminvoked: this._itemInvoked.bind(this), galleryFirstPageRendered: function galleryFirstPageRendered() {
                                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPopoverRequestToLoad("album")
                                }
                        });
                    if (!this._buttonEventHandlers)
                        this._buttonEventHandlers = MS.Entertainment.Utilities.addEvents(this.domElement, {iconButtonClicked: function processIconButtonClicked(event) {
                                var id = event && event.id;
                                if (id === MS.Entertainment.UI.Actions.AddTo.subMenuIds.addToMyMusic || id === MS.Entertainment.UI.Actions.ActionIdentifiers.subscriptionAddToMyMusic) {
                                    MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.media);
                                    MS.Entertainment.ViewModels.MediaItemModel.hydrateListLibraryInfoAsync(this.tracks)
                                }
                                event.stopPropagation()
                            }.bind(this)});
                    this._showPanel();
                    if (this.smartBuyStateEngine) {
                        var resumeSmartBuyEngineStateChanges = function resumeSmartBuyEngineStateChanges() {
                                if (this.smartBuyStateEngine) {
                                    this.smartBuyStateEngine.suspendStateChanges = false;
                                    this.smartBuyStateEngine.updateState()
                                }
                            }.bind(this);
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                            this.smartBuyStateEngine.suspendStateChanges = true;
                            MS.Entertainment.UI.FileTransferService.pulseAsync(this.media).done(resumeSmartBuyEngineStateChanges, resumeSmartBuyEngineStateChanges)
                        }
                    }
                }, unload: function unload() {
                    if (this._listenerId) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.unregisterListener(this._listenerId);
                        this._listenerId = null
                    }
                    if (this._signInBindings) {
                        this._signInBindings.cancel();
                        this._signInBindings = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    if (this._buttonEventHandlers) {
                        this._buttonEventHandlers.cancel();
                        this._buttonEventHandlers = null
                    }
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                }, _handleActionsReady: function _handleActionsReady(event) {
                    if (MS.Entertainment.Utilities.isMusicApp2)
                        WinJS.Promise.timeout(100).done(function focusElement() {
                            MS.Entertainment.UI.Framework.focusFirstInSubTree(event.srcElement)
                        }.bind(this))
                }, _itemInvoked: function _itemInvoked(event) {
                    event.detail.itemPromise.then(function getItemData(data) {
                        var matchingTrack = null;
                        var marketplaceTracks = this.media.marketplaceTracks;
                        if (MS.Entertainment.Data.List.isList(marketplaceTracks))
                            MS.Entertainment.Data.List.listToArray(marketplaceTracks).done(function gotItems(trackArray) {
                                marketplaceTracks = trackArray
                            });
                        if (!data.data.rights && marketplaceTracks) {
                            var found = marketplaceTracks.some(function(track) {
                                    if (track.serviceId === data.data.serviceId) {
                                        matchingTrack = track;
                                        return track
                                    }
                                });
                            if (matchingTrack)
                                data.data.rights = matchingTrack.rights
                        }
                    }.bind(this));
                    event.stopPropagation()
                }, _onFocusIn: function _onFocusIn() {
                    WinJS.Utilities.addClass(this._list.domElement, "focused")
                }, _onFocusOut: function _onFocusOut() {
                    WinJS.Utilities.removeClass(this._list.domElement, "focused")
                }, _setupSmartBuy: function _setupSmartBuy() {
                    if (this.smartBuyStateEngine)
                        this.smartBuyStateEngine.initialize(this.media, MS.Entertainment.ViewModels.SmartBuyButtons.getAlbumInlineDetailsButtons(this.media, MS.Entertainment.UI.Actions.ExecutionLocation.popover), MS.Entertainment.ViewModels.MusicStateHandlers.onAlbumPopoverStateChanged);
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
                }, _buttonChangedHandler: function _buttonChangedHandler() {
                    this._setTrackDataSource()
                }, _onClearedFilters: function _onClearedFilters() {
                    this._loadLocalTracks()
                }, _fallbackToCollection: function _fallbackToCollection() {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    return navigationService.checkUserLocation(MS.Entertainment.UI.Monikers.searchPage) && this.media && this.media.inCollection
                }, _shouldShowErrorPanel: function _shouldShowErrorPanel() {
                    return this.media && !this.media.fromCollection && !this.blockErrorPanel && !this.isFailed && !this._fallbackToCollection()
                }, _populateMusicVideoIds: function _populateMusicVideoIds(queryResult) {
                    if (!this.media.hasServiceId)
                        return;
                    var marketplaceAlbum = new MS.Entertainment.Data.Augmenter.Marketplace.EDSAlbum;
                    marketplaceAlbum.serviceId = this.media.serviceId;
                    marketplaceAlbum.serviceIdType = this.media.serviceIdType;
                    return marketplaceAlbum.hydrate({forceUpdate: true}).then(function createArrays() {
                            if (!marketplaceAlbum.tracks)
                                return WinJS.Promise.wrapError("No tracks on specified album");
                            return WinJS.Promise.join({
                                    marketplaceTracks: marketplaceAlbum.tracks.toArray(), localQueryTracks: queryResult.toArray()
                                })
                        }, function error(error){}).then(function populateMusicVideoIds(results) {
                            var musicVideoIdMap = {};
                            results.marketplaceTracks.forEach(function marketplaceTrackIterator(marketplaceTrack) {
                                musicVideoIdMap[marketplaceTrack.serviceId] = marketplaceTrack.musicVideoId
                            });
                            results.localQueryTracks.forEach(function localTrackIterator(localTrack) {
                                localTrack.musicVideoId = musicVideoIdMap[localTrack.serviceId]
                            });
                            return results.localQueryTracks
                        }, function error(error){})
                }, _loadLocalTracks: function _loadLocalTracks() {
                    var query = new MS.Entertainment.Data.Query.libraryTracks;
                    query.albumId = this.media.libraryId;
                    query.sort = Microsoft.Entertainment.Queries.TracksSortBy.numberAscending;
                    query.mediaAvailability = this.collectionFilter;
                    query.isLive = true;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.album, MS.Entertainment.Utilities.isValidServiceId(this.media.canonicalId) ? this.media.canonicalId : String.empty);
                    if (this._list && this._list.mediaContext)
                        this._list.mediaContext.containingMedia = {
                            playbackItemSource: query.clone(), playbackOffset: 0
                        };
                    query.execute().then(function(q) {
                        this.tracks = q.result.items;
                        this._songCount = this.tracks.count;
                        var binding = WinJS.Binding.bind(q.result.items, {count: this._updateHandler.bind(this)});
                        this.mediaBindings.push(binding);
                        if (this._loadedButtons)
                            this._setTrackDataSource();
                        if (this.collectionFilter && this.collectionFilter !== Microsoft.Entertainment.Platform.MediaAvailability.available) {
                            var unfilteredQuery = new MS.Entertainment.Data.Query.libraryTracks;
                            unfilteredQuery.albumId = this.media.libraryId;
                            unfilteredQuery.executeCount().done(function unfilteredQueryComplete(unfilteredTrackCount) {
                                if (unfilteredTrackCount > this._songCount)
                                    this._showCollectionFilter()
                            }.bind(this), function unfilteredQueryError() {
                                this._showCollectionFilter()
                            }.bind(this))
                        }
                        this._populateMusicVideoIds(q.result.items)
                    }.bind(this))
                }, _updateHandler: function _updateHandler(newValue, oldValue) {
                    if (oldValue !== undefined)
                        if (newValue === 0 && this._overlay)
                            this._overlay.hide()
                }, _loadServiceTracks: function loadServiceTracks(newValue, oldValue) {
                    if (oldValue === undefined && !newValue)
                        return;
                    if (this.media.tracks) {
                        this.tracks = this.media.tracks;
                        if (!this._signedInUser) {
                            this._signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            if (!this._signedInUser.isSubscription)
                                this._signInBindings = WinJS.Binding.bind(this._signedInUser, {isSubscription: this._updateSubscriptionLinkVisibility.bind(this)})
                        }
                    }
                    if (this._loadedButtons)
                        this._setTrackDataSource()
                }, _setTrackDataSource: function _setTrackDataSource() {
                    this.hideListLoadingControl();
                    this._list.dataSource = this.tracks;
                    this._findTrack()
                }, _findTrack: function findTrack() {
                    if (!this._invokedTrack || !this.tracks || this.tracks.count === 0)
                        return;
                    this.tracks.forEachAll(function findTrack(args) {
                        if ((this._invokedTrack.serviceId && this._invokedTrack.serviceId !== MS.Entertainment.Utilities.EMPTY_GUID && args.item.data.serviceId === this._invokedTrack.serviceId) || (this._invokedTrack.canonicalId && this._invokedTrack.canonicalId !== MS.Entertainment.Utilities.EMPTY_GUID && args.item.data.canonicalId === this._invokedTrack.canonicalId) || (this._invokedTrack.libraryId !== -1 && this._invokedTrack.libraryId === args.item.data.libraryId)) {
                            this._list.initialInvoked = this.tracks.indexFromKey(args.item.key);
                            args.stop = true
                        }
                    }.bind(this)).done(null, function handlerError(error) {
                        MS.Entertainment.Components.InlineDetails.fail("track.forEachAll has failed. error " + (error && error.message))
                    })
                }, _formatDetailString: function _formatDetailString() {
                    var bindingsComplete = false;
                    var formatAlbumDetailString = function formatAlbumDetailString() {
                            if (bindingsComplete) {
                                this.detailString = MS.Entertainment.Data.Factory.createAlbumDetailString(this.media, MS.Entertainment.Pages.MusicTrackAlbumInlineDetails.detailsOptions);
                                this.showExplicitLabel = this.media.isExplicit && MS.Entertainment.Utilities.isMusicApp1
                            }
                        }.bind(this);
                    this.mediaBindings.push(WinJS.Binding.bind(this.media, {
                        artistName: formatAlbumDetailString, releaseDate: formatAlbumDetailString, primaryGenre: formatAlbumDetailString, genreName: formatAlbumDetailString, label: formatAlbumDetailString
                    }));
                    bindingsComplete = true;
                    formatAlbumDetailString()
                }, _updateSubscriptionLinkVisibility: function _updateSubscriptionLinkVisibility() {
                    if (this._subscriptionLink && this._subscriptionLink.action && this._subscriptionLink.action.canExecute())
                        MS.Entertainment.ViewModels.MusicSmartBuyStateHandlers.getAlbumRights(this.media).then(function getAlbumRights_complete(rights) {
                            this.showSignupLink = (rights.subscriptionStream || rights.subscriptionDownload);
                            if (this.showSignupLink)
                                this._subscriptionLink.action.parameter = MS.Entertainment.Music.Freeplay.Events.musicPassUpsellAlbumPopoverLinkInvoked
                        }.bind(this));
                    else
                        this.showSignupLink = false
                }
        }, {
            showSignupLink: false, showExplicitLabel: false, actionButtons: null
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {MusicTrackAlbumInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.MusicAlbumInlineDetails", "Components/InlineDetails/MusicAlbumInlineDetails.html#musicAlbumInlineDetailsTemplate", function musicAlbumInlineDetails(element, options) {
            var shouldInvokeTrack = WinJS.Utilities.getMember("dataContext.invokeTrack", options);
            if (shouldInvokeTrack !== undefined)
                this._shouldInvokeTrack = shouldInvokeTrack
        }, {
            _shouldInvokeTrack: true, initialize: function initialize() {
                    if (this._shouldInvokeTrack)
                        this._invokedTrack = {
                            serviceId: this.media.serviceId, canonicalId: this.media.canonicalId, libraryId: this.media.libraryId
                        };
                    MS.Entertainment.Components.InlineDetails.assert(this.media, "Invalid MediaItem passed into MusicTrackAlbumInlineDetails");
                    this.media = this.media || {};
                    if (this.originalLocation === MS.Entertainment.Data.ItemLocation.collection) {
                        var albumIdPromise;
                        if (this.media.album)
                            albumIdPromise = MS.Entertainment.ViewModels.MediaItemModel.getLibraryIdAsync(this.media.album);
                        else if (MS.Entertainment.Utilities.isValidLibraryId(this.media.albumId))
                            albumIdPromise = WinJS.Promise.as(this.media.albumId);
                        else {
                            MS.Entertainment.Components.InlineDetails.fail("Invalid Media Item passed into MusicTrackAlbumInlineDetails");
                            albumIdPromise = WinJS.Promise.as(-1)
                        }
                        albumIdPromise.then(function gotLibraryId(albumLibraryId) {
                            var query;
                            var queryExecutePromise;
                            if (MS.Entertainment.Utilities.isValidLibraryId(albumLibraryId)) {
                                query = new MS.Entertainment.Data.Query.libraryAlbums;
                                query.albumId = albumLibraryId
                            }
                            else if (this.media.album && this.media.album.hasServiceId) {
                                query = new MS.Entertainment.Data.Query.Music.AlbumDetails;
                                query.id = this.media.album.serviceId;
                                query.idType = this.media.album.serviceIdType;
                                this.originalLocation = MS.Entertainment.Data.ItemLocation.marketplace
                            }
                            queryExecutePromise = query ? query.execute() : WinJS.Promise.wrapError("Not enough info to create a valid query");
                            return queryExecutePromise
                        }.bind(this)).done(function queryCompleted(query) {
                            if (query.result.primaryAlbum)
                                this.media = query.result.primaryAlbum;
                            else if (query.result.item)
                                this.media = query.result.item;
                            MS.Entertainment.Pages.MusicAlbumInlineDetails.prototype.initialize.apply(this)
                        }.bind(this), function queryFailed(error) {
                            MS.Entertainment.Components.InlineDetails.fail("Query failed to get library album details. Error message: " + (error && error.message));
                            MS.Entertainment.Pages.MusicAlbumInlineDetails.prototype.initialize.apply(this)
                        }.bind(this))
                    }
                    else {
                        this.media = this.media.album;
                        MS.Entertainment.Pages.MusicAlbumInlineDetails.prototype.initialize.apply(this)
                    }
                }
        }, {}, {
            artSize: {get: function() {
                    if (MS.Entertainment.Utilities.isMusicApp1)
                        return {
                                width: 215, height: 215
                            };
                    else
                        return {
                                width: 532, height: 532
                            }
                }}, detailsOptions: {get: function() {
                        if (MS.Entertainment.Utilities.isMusicApp1)
                            return null;
                        else
                            return {
                                    includeLabel: false, includeExplicit: true
                                }
                    }}
        })})
})()
