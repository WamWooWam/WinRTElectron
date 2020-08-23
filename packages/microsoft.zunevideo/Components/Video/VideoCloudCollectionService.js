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
    (function(Entertainment) {
        (function(Video) {
            var VideoCloudCollectionService = (function(_super) {
                    __extends(VideoCloudCollectionService, _super);
                    function VideoCloudCollectionService() {
                        _super.call(this)
                    }
                    VideoCloudCollectionService.prototype.startSync = function() {
                        var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                        var hasGrovelEverCompleted = !!(purchaseHistoryService && purchaseHistoryService.hasGrovelEverCompleted);
                        var syncManager = new Microsoft.Entertainment.Sync.SyncManager;
                        if (syncManager && hasGrovelEverCompleted)
                            syncManager.requestSync(Microsoft.Entertainment.Sync.RequestSyncOption.checkIfDirty)
                    };
                    return VideoCloudCollectionService
                })(MS.Entertainment.UI.Framework.ObservableBase);
            Video.VideoCloudCollectionService = VideoCloudCollectionService
        })(Entertainment.Video || (Entertainment.Video = {}));
        var Video = Entertainment.Video
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
(function() {
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.videoCloudCollection, function getService() {
        return new MS.Entertainment.Video.VideoCloudCollectionService
    }, true)
})()
