

(function () {
    "use strict";

    var accessTokenManager = WinJS.Class.define(function (futureAccessList, tokenFlushCount) {
        this._futureAccessList = futureAccessList || Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList;
        this._tokenFlushCount = tokenFlushCount || 100;

    }, {
        _futureAccessList: null,

        _checkFileAsync: function (accessToken) {
            var that = this;
            return new WinJS.Promise(function (complete) {
                that._futureAccessList.getFileAsync(accessToken).then(function (file) {
                    complete({fileExists: true, accessToken: accessToken});
                }, function () {
                    complete({fileExists: false, accessToken: accessToken});
                });
            });
        },

        _collectAccessCacheAsync: function () {
            var promises = [];
            log("AccesTokenManager: _collectAccessCacheAsync started");
            for (var i = 0; i < this._futureAccessList.entries.length; i++) {
                promises.push(this._checkFileAsync(this._futureAccessList.entries[i].token));
            }
            var that = this;
            return new WinJS.Promise(function (complete) {
                WinJS.Promise.join(promises).done(function (checkFileResults) {
                    for (var i = 0; i < checkFileResults.length; i++) {
                        if (!checkFileResults[i].fileExists) {
                            that._futureAccessList.remove(checkFileResults[i].accessToken);
                        }
                    }
                    log("AccesTokenManager: _collectAccessCacheAsync finished");
                    complete();
                });
            });
        },

        _cleanupAsync: function () {
            var that = this;
            return new WinJS.Promise(function (complete) {
                that._collectAccessCacheAsync().then(function () {
                    
                    log("AccesTokenManager: _cleanupAsync started");
                    var flushCount = that._tokenFlushCount;
                    var itemCntToStay = that._futureAccessList.maximumItemsAllowed - flushCount;
                    var itemCntToRemove = that._futureAccessList.entries.length - itemCntToStay;
                    var accListCopy = [];
                    var entries = that._futureAccessList.entries;
                    for (var i = that._futureAccessList.entries.length - 1; i >= 0; i--) {
                        accListCopy.push(entries[i]);
                    }
                    accListCopy.sort(function (a, b) {
                        return a.metadata - b.metadata;
                    });
                    for (var j = 0; j < itemCntToRemove; j++) {
                        that._futureAccessList.remove(accListCopy[j].token);
                    }
                    log("AccesTokenManager: _cleanupAsync finished");
                    complete();
                });
            });
        },

        addAsync: function (file) {
            var timestamp = ((new Date()).getTime() / 1000);
            var that = this;
            return new WinJS.Promise(function (complete) {
                var maxItems = that._futureAccessList.maximumItemsAllowed;
                if (that._futureAccessList.entries.length + 1 > maxItems) {
                    that._cleanupAsync().then(function () {
                        complete(that._futureAccessList.add(file, timestamp));
                    });
                } else {
                    complete(that._futureAccessList.add(file, timestamp));
                }
            });
        },

        getFileAsync: function (accessToken) {
            if (!this._futureAccessList.containsItem(accessToken)) {
                return null;
            }
            var that = this;
            return new WinJS.Promise(function (completed, error) {
                that._futureAccessList.getFileAsync(accessToken).then(function (file) {
                    completed(file);
                }, function (err) {
                    log("AccesTokenManager: unable to access file ({0}), removing token".format(err));
                    that._futureAccessList.remove(accessToken);
                    error();
                });
            });
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.AccessTokenManager();
                }
                return instance;
            }
        },
    });

    var instance;

    WinJS.Namespace.define("Skype", {
        AccessTokenManager: accessTokenManager
    });
}());