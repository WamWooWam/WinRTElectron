//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Cache = AppMagic.Services.Cache,
        Channel = AppMagic.Services.Channel,
        NO_PARAMETERS = {},
        API_BASE = "https://apis.live.net/v5.0/",
        CACHE_ID = "skydrive",
        CACHE_ALBUM_TAG = "albums",
        CACHE_PHOTO_TAG = "photos.",
        processError = function(resp) {
            return AppMagic.Services.Results.createError(resp.toString())
        },
        processAlbums = function(resp) {
            var albums = resp.data.map(function(album) {
                    return {
                            id: album.id, name: album.name, description: album.description, count: album.count
                        }
                }),
                resultSet = AppMagic.Services.Results.createSet(albums);
            return Cache.set(CACHE_ID, CACHE_ALBUM_TAG, resultSet), resultSet
        },
        processPhotos = function(resp) {
            var photos = resp.data.map(function(photo) {
                    return {
                            id: photo.id, name: photo.name, description: photo.description, source: photo.source, width: photo.width, height: photo.height, location: photo.location, images: photo.images
                        }
                }),
                resultSet = AppMagic.Services.Results.createSet(photos);
            return resp.data.length > 0 && Cache.set(CACHE_ID, CACHE_PHOTO_TAG + resp.data[0].parent_id, resultSet), resultSet
        },
        SkyDrive = WinJS.Class.define(function SkyDrive_ctor(){}, {
            _getBaseChannel: function() {
                return new Channel(API_BASE)
            }, _get: function(channel, fn) {
                    return this.authenticate().then(function(token) {
                            return channel.param("access_token", token).get().then(fn, processError)
                        })
                }, configure: function(config) {
                    return !0
                }, albums: function() {
                    var albums = Cache.get(CACHE_ID, CACHE_ALBUM_TAG);
                    if (albums)
                        return albums;
                    var channel = this._getBaseChannel().path("me").path("albums");
                    return this._get(channel, processAlbums)
                }, photos: function(album) {
                    var photos = Cache.get(CACHE_ID, CACHE_PHOTO_TAG + album.id);
                    if (photos)
                        return photos;
                    var channel = this._getBaseChannel().path(album.id).path("photos");
                    return this._get(channel, processPhotos)
                }
        }, {});
    WinJS.Class.mix(SkyDrive, AppMagic.Services.Auth.Mixins.MicrosoftAccount);
    WinJS.Namespace.define("AppMagic.Services", {SkyDrive: SkyDrive})
})();