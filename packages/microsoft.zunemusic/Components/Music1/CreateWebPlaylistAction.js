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
        var UI;
        (function(UI) {
            var Actions;
            (function(Actions) {
                var Playlists;
                (function(Playlists) {
                    var CreateWebPlaylistAction = (function(_super) {
                            __extends(CreateWebPlaylistAction, _super);
                            function CreateWebPlaylistAction() {
                                _super.apply(this, arguments);
                                this.automationId = MS.Entertainment.UI.AutomationIds.playlistWebCreatePlaylistAction
                            }
                            CreateWebPlaylistAction._createPlaylist = function(originalName) {
                                var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                                var playlistProvider = mediaStore.playlistProvider;
                                var signal = new MS.Entertainment.UI.Framework.Signal;
                                var nameToUse = originalName;
                                var counter = 0;
                                var tryCreatePlaylist = function() {
                                        playlistProvider.createPlaylistAsync(Microsoft.Entertainment.Platform.PlaylistType.static, nameToUse, false).done(function(result) {
                                            return signal.complete(result)
                                        }, function(error) {
                                            if (error.number !== Playlists.ERROR_PLAYLIST_ALREADY_EXISTS)
                                                signal.error(error);
                                            else {
                                                ++counter;
                                                var decimalNumberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                                                nameToUse = originalName + " " + decimalNumberFormatter.format(counter);
                                                tryCreatePlaylist()
                                            }
                                        })
                                    };
                                try {
                                    tryCreatePlaylist()
                                }
                                catch(error) {
                                    signal.error(error)
                                }
                                return signal.promise
                            };
                            CreateWebPlaylistAction._appendToWebPlaylist = function(playlistLibraryId, playlistName, items) {
                                var libraryIds = [];
                                var serviceMediaIds = [];
                                var mediaTypes = [];
                                items = items.filter(function(item) {
                                    return !!item
                                });
                                var addFromMarketplace = false;
                                items.forEach(function(mediaItem) {
                                    libraryIds.push(mediaItem.libraryId);
                                    serviceMediaIds.push(!MS.Entertainment.Utilities.isEmptyGuid(mediaItem.zuneId) ? mediaItem.zuneId : MS.Entertainment.Utilities.EMPTY_GUID);
                                    mediaTypes.push(mediaItem.mediaType);
                                    addFromMarketplace = addFromMarketplace || (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && !mediaItem.inCollection)
                                });
                                var addItemsPromise;
                                if (addFromMarketplace)
                                    addItemsPromise = MS.Entertainment.Platform.PurchaseHelpers.tryAddNonCollectionMediaToLibrary(items).then(function(result) {
                                        libraryIds = result.mediaIdentifiers.map(function(item) {
                                            return item.libraryId
                                        });
                                        mediaTypes = result.mediaIdentifiers.map(function(item) {
                                            return item.libraryType
                                        });
                                        serviceMediaIds = result.mediaIdentifiers.map(function(item) {
                                            return item.mediaId
                                        });
                                        return {
                                                libraryIds: libraryIds, mediaTypes: mediaTypes, serviceMediaIds: serviceMediaIds
                                            }
                                    });
                                else
                                    addItemsPromise = WinJS.Promise.as({
                                        libraryIds: libraryIds, mediaTypes: mediaTypes, serviceMediaIds: serviceMediaIds
                                    });
                                return addItemsPromise.then(function(addedItems) {
                                        var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                                        var playlistProvider = mediaStore.playlistProvider;
                                        return playlistProvider.appendPlaylistItemsAsync(playlistLibraryId, addedItems.libraryIds, addedItems.serviceMediaIds, addedItems.mediaTypes, Microsoft.Entertainment.Platform.MediaAvailability.undefined)
                                    }).then(function() {
                                        return MS.Entertainment.ViewModels.MediaItemModel.hydrateListLibraryInfoAsync(items)
                                    }, function(error) {
                                        if (error.number === Playlists.ERROR_MAXIMUM_PLAYLIST_LENGTH_EXCEEDED) {
                                            var maxPlaylistItemCount = (new Microsoft.Entertainment.Configuration.ConfigurationManager).groveler.maxPlaylistItemCount;
                                            MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_CLOUD_SYNC_PLAYLIST_FULL_DIALOG_TITLE).format(playlistName), String.load(String.id.IDS_CLOUD_SYNC_PLAYLIST_FULL_DIALOG_MESSAGE).format(maxPlaylistItemCount))
                                        }
                                    })
                            };
                            CreateWebPlaylistAction.prototype.executed = function(param) {
                                var songListPromise;
                                if (param.songs)
                                    songListPromise = WinJS.Promise.as(param.songs);
                                else if (param.artists) {
                                    var query = new MS.Entertainment.Music.MultiArtistTopSongsQuery;
                                    query.artists = param.artists;
                                    query.count = CreateWebPlaylistAction.MAX_ARTIST_SEED_PLAYLIST_LENGTH;
                                    songListPromise = query.execute().then(function(queryResult) {
                                        return queryResult.result.items
                                    }, function(error) {
                                        var message = (error && error.message) || String.empty;
                                        return WinJS.Promise.wrapError(new Error("Couldn't retrieve top songs for artist group: " + message))
                                    })
                                }
                                else
                                    songListPromise = WinJS.Promise.wrapError(new Error("Expected songs or artists in action parameters."));
                                var createResult;
                                var songList;
                                WinJS.Promise.as(songListPromise).then(function(list) {
                                    songList = list;
                                    return CreateWebPlaylistAction._createPlaylist(param.name)
                                }).then(function(result) {
                                    if (!result)
                                        return WinJS.Promise.wrapError(new Error("Create Playlist returned success, but did not return a valid ICreatePlaylistResult."));
                                    createResult = result;
                                    return MS.Entertainment.Data.List.listToArray(songList)
                                }).then(function(mediaItems) {
                                    var appendItemsPromise;
                                    if (mediaItems.length)
                                        appendItemsPromise = CreateWebPlaylistAction._appendToWebPlaylist(createResult.playlistId, param.name, mediaItems);
                                    return appendItemsPromise
                                }).done(function() {
                                    if (param.completeCallback)
                                        param.completeCallback(createResult.playlistId)
                                }, function(error) {
                                    MS.Entertainment.UI.Actions.fail("Failed to create web playlist. Reason: " + error && error.message);
                                    if (param.failedCallback)
                                        param.failedCallback(error)
                                })
                            };
                            CreateWebPlaylistAction.prototype.canExecute = function(param) {
                                return true
                            };
                            CreateWebPlaylistAction.MAX_ARTIST_SEED_PLAYLIST_LENGTH = 100;
                            return CreateWebPlaylistAction
                        })(MS.Entertainment.UI.Actions.Action);
                    Playlists.CreateWebPlaylistAction = CreateWebPlaylistAction
                })(Playlists = Actions.Playlists || (Actions.Playlists = {}))
            })(Actions = UI.Actions || (UI.Actions = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
