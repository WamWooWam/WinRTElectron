//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Cache = AppMagic.Services.Cache,
        Channel = AppMagic.Services.Channel,
        NO_PARAMETERS = {},
        API_BASE = "https://graph.facebook.com/",
        CACHE_ID = "facebook",
        CACHE_FRIENDS_TAG = "friends",
        processError = function(resp) {
            return AppMagic.Services.Results.createError(resp.error.message)
        },
        processFriends = function(resp) {
            var friends = resp.data.map(function(friend) {
                    var age;
                    return age = friend.birthday ? Math.floor((Date.now() - Date.parse(friend.birthday)) / 1e3 / 60 / 60 / 24 / 365) : Math.floor(Math.random() * 25 + 10), {
                            id: friend.id, name: friend.name, age: age, image: friend.picture.data.url
                        }
                }),
                result = AppMagic.Services.Results.createSet(friends);
            return Cache.set(CACHE_ID, CACHE_FRIENDS_TAG, result), result
        },
        Facebook = WinJS.Class.define(function Facebook_ctor(){}, {
            _getBaseChannel: function() {
                return new Channel(API_BASE)
            }, _get: function(channel, fn) {
                    var that = this,
                        attempt = function(retry) {
                            return that.authenticate(!retry).then(function(token) {
                                    var p = channel.param("access_token", token.accessToken).get();
                                    return retry && p.then(null, attempt.bind(null, !1)), p
                                })
                        };
                    return attempt(!0).then(fn, processError)
                }, configure: function(config) {
                    return !0
                }, friends: function() {
                    var res = Cache.get(CACHE_ID, CACHE_FRIENDS_TAG);
                    if (res)
                        return res;
                    var channel = this._getBaseChannel().path("me").path("friends").param("fields", "id,name,birthday,picture");
                    return this._get(channel, processFriends)
                }
        }, {});
    WinJS.Class.mix(Facebook, AppMagic.Services.Auth.Mixins.Facebook);
    WinJS.Namespace.define("AppMagic.Services", {Facebook: Facebook})
})();