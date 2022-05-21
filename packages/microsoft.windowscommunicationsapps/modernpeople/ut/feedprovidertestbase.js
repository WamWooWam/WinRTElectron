
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\BICI\BiciHelper.js" />
/// <reference path="..\Core\CommentInfo.js" />
/// <reference path="..\Core\FeedEntryInfo.js" />
/// <reference path="..\Core\FeedObjectInfo.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Core\NotificationInfo.js" />
/// <reference path="..\Core\ReactionInfo.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Platform\Configuration.js" />
/// <reference path="..\Platform\Platform.js" />
/// <reference path="..\Providers\Cache\AlbumCache.js" />
/// <reference path="..\Providers\Cache\FeedCache.js" />
/// <reference path="..\Providers\Cache\FeedObjectCache.js" />
/// <reference path="..\Providers\Cache\NotificationCache.js" />
/// <reference path="..\Providers\Providers\FeedProvider.js" />
/// <reference path="FeedProviderEventsWrapper.js" />
/// <reference path="MockConfiguration.js" />
/// <reference path="MockPlatform.js" />
/// <reference path="TestData.js" />
/// <reference path="TestUtils.js" />

People.RecentActivity.UnitTests.FeedProviderTestBase = function() {
    /// <summary>
    ///     Base class for feed provider unit tests.
    /// </summary>
    /// <field name="_feedProvider" type="People.RecentActivity.Providers.FeedProvider"></field>
    /// <field name="_feedCache" type="People.RecentActivity.Providers.FeedCache"></field>
    /// <field name="_albumCache" type="People.RecentActivity.Providers.AlbumCache"></field>
    /// <field name="_feedObjectCache" type="People.RecentActivity.Providers.FeedObjectCache"></field>
    /// <field name="_notificationCache" type="People.RecentActivity.Providers.NotificationCache"></field>
    /// <field name="_wrapper" type="People.RecentActivity.UnitTests.FeedProviderEventsWrapper"></field>
    /// <field name="_networkId" type="String"></field>
    /// <field name="_success" type="Boolean"></field>
};

function GetWrappedCallback (fn) { 
    return fn;
}

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._feedProvider = null;
People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._feedCache = null;
People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._albumCache = null;
People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._feedObjectCache = null;
People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._notificationCache = null;
People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._wrapper = null;
People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._networkId = null;
People.RecentActivity.UnitTests.FeedProviderTestBase.prototype._success = false;

Object.defineProperty(People.RecentActivity.UnitTests.FeedProviderTestBase.prototype, "testFeedProvider", {
    get: function() {
        /// <summary>
        ///     Gets the feed provider.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.FeedProvider"></value>
        return this._feedProvider;
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.FeedProviderTestBase.prototype, "feedCache", {
    get: function() {
        /// <summary>
        ///     Gets the feed cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.FeedCache"></value>
        return this._feedCache;
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.FeedProviderTestBase.prototype, "albumCache", {
    get: function() {
        /// <summary>
        ///     Gets the album cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.AlbumCache"></value>
        return this._albumCache;
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.FeedProviderTestBase.prototype, "feedObjectCache", {
    get: function() {
        /// <summary>
        ///     Gets the feed object cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.FeedObjectCache"></value>
        return this._feedObjectCache;
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.FeedProviderTestBase.prototype, "notificationCache", {
    get: function() {
        /// <summary>
        ///     Gets the notification cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.NotificationCache"></value>
        return this._notificationCache;
    }
});

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.baseSetUp = function(networkId, success) {
    /// <summary>
    ///     Contains common set up.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="success" type="Boolean">if set to <c>true</c>, indicating positive tests.</param>
    this._success = success;
    this._networkId = networkId;
    var mockConfig = new People.RecentActivity.UnitTests.MockConfiguration();
    mockConfig.isOnline = true;
    People.RecentActivity.Platform.Configuration.instance = mockConfig;
    People.RecentActivity.Platform.Platform.instance = new People.RecentActivity.UnitTests.MockPlatform();
    this._wrapper = new People.RecentActivity.UnitTests.FeedProviderEventsWrapper();
    this._feedProvider = People.RecentActivity.UnitTests.TestUtils.getFeedProvider(networkId, this._wrapper);
    this._feedCache = this._feedProvider.feedCache;
    this._feedCache.clear();
    this._albumCache = this._feedProvider.albumCache;
    this._albumCache.clear();
    this._feedObjectCache = this._feedProvider.feedObjectCache;
    this._feedObjectCache.clear();
    this._notificationCache = this._feedProvider.notificationCache;
    this._notificationCache.clear();
    People.RecentActivity.Core.BiciHelper.disableUploads();
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.baseTearDown = function(networkId) {
    /// <summary>
    ///     Contains common tear down.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    People.RecentActivity.Platform.Configuration.instance = new People.RecentActivity.Platform.Configuration();
    this._feedCache.clear();
    this._albumCache.clear();
    this._notificationCache.clear();
    People.RecentActivity.Core.BiciHelper.enableUploads();
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.refreshFeedEntries = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshFeedEntries(System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext">The test context.</param>
    var that = this;
    
    this._feedCache.clear();
    var entryToUpdate = People.RecentActivity.UnitTests.TestData.linkEntries[0];
    entryToUpdate.commentDetails.count = 2;
    var cachedentriesCompleted = function(result, entries, userState) {
        tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
        tc.isNotNull(entries);
        tc.areEqual(2, entries.length);
        People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, entryToUpdate, entries[0]);
        People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.textEntries[1], entries[1]);
    };
    var refreshEntriesCompleted = function(result, entriesToAdd, entriesToUpdate, entriesToRemove, userState) {
        var cachedEntries = that._feedCache.getFeedEntries(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(entriesToAdd);
            tc.areEqual(4, entriesToAdd.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.textEntries[0], entriesToAdd[3], false, false, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.videoEntries[0], entriesToAdd[2], false, false, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albumEntries[0], entriesToAdd[1], false, false, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.photoEntries[0], entriesToAdd[0], false, false, false, true);
            tc.isNotNull(entriesToRemove);
            tc.areEqual(1, entriesToRemove.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.textEntries[1], entriesToRemove[0]);
            tc.isNotNull(entriesToUpdate);
            tc.areEqual(1, entriesToUpdate.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.linkEntries[0], entriesToUpdate[0]);
            // Verify the retrieved entries are put to cache.
            tc.isNotNull(cachedEntries);
            tc.areEqual(5, cachedEntries.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.photoEntries[0], cachedEntries[0], false, false, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albumEntries[0], cachedEntries[1], false, false, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.videoEntries[0], cachedEntries[2], false, false, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.textEntries[0], cachedEntries[3], false, false, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.linkEntries[0], cachedEntries[4]);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(entriesToAdd);
            tc.areEqual(0, entriesToAdd.length);
            tc.isNotNull(entriesToRemove);
            tc.areEqual(0, entriesToRemove.length);
            tc.isNotNull(entriesToUpdate);
            tc.areEqual(0, entriesToUpdate.length);
            tc.isNotNull(cachedEntries);
            tc.areEqual(2, cachedEntries.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, entryToUpdate, cachedEntries[0]);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.textEntries[1], cachedEntries[1]);
        }
    };
    cachedentriesCompleted = GetWrappedCallback(cachedentriesCompleted);
    this._wrapper.getCachedFeedEntriesCompleted = cachedentriesCompleted;
    refreshEntriesCompleted = GetWrappedCallback(refreshEntriesCompleted);
    this._wrapper.refreshFeedEntriesCompleted = refreshEntriesCompleted;
    this._feedCache.addCacheEntry(this._feedProvider.contactId, [ entryToUpdate, People.RecentActivity.UnitTests.TestData.textEntries[1] ]);
    this._feedProvider.refreshFeedEntries(null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.refreshAlbums = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshAlbums(System.Object)" />.
    /// </summary>
    /// <param name="tc.start" type="Tx.TestContext"/>
    var that = this;
    
    this._albumCache.clear();
    var albumToUpdate = People.RecentActivity.UnitTests.TestData.albums[0];
    (albumToUpdate.data).name = 'New Name';
    var cachedalbumsCompleted = function(result, albums, userState) {
        tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
        tc.isNotNull(albums);
        tc.areEqual(1, albums.length);
        People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, albumToUpdate, albums[0]);
    };
    var refreshAlbumsCompleted = function(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState) {
        var cachedAlbums = that._albumCache.getAlbums(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(albumsToAdd);
            tc.areEqual(1, albumsToAdd.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[1], albumsToAdd[0], true, false, true);
            tc.isNotNull(albumsToUpdate);
            tc.areEqual(1, albumsToUpdate.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[0], albumsToUpdate[0], true, false, true);
            // Verify the retrieved entries are put to cache.
            tc.isNotNull(cachedAlbums);
            tc.areEqual(2, cachedAlbums.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[0], cachedAlbums[0], true, false, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[1], cachedAlbums[1], true, false, true);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(albumsToAdd);
            tc.areEqual(0, albumsToAdd.length);
            tc.isNotNull(albumsToRemove);
            tc.areEqual(0, albumsToRemove.length);
            tc.isNotNull(albumsToUpdate);
            tc.areEqual(0, albumsToUpdate.length);
            tc.isNotNull(cachedAlbums);
            tc.areEqual(1, cachedAlbums.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, albumToUpdate, cachedAlbums[0]);
        }
    };
    cachedalbumsCompleted = GetWrappedCallback(cachedalbumsCompleted);
    this._wrapper.getCachedAlbumsCompleted = cachedalbumsCompleted;
    refreshAlbumsCompleted = GetWrappedCallback(refreshAlbumsCompleted);
    this._wrapper.refreshAlbumsCompleted = refreshAlbumsCompleted;
    // Add initial cached albums, so album 0 will be updated and album 1 will be added.
    this._albumCache.addCacheEntry(this._feedProvider.contactId, [ albumToUpdate ]);
    this._feedProvider.refreshAlbums(null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.refreshAlbum = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshAlbum(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>    
    this._albumCache.clear();
    
    var cachedAlbum = People.RecentActivity.UnitTests.TestData.albums[0];
    cachedAlbum.data.photos = [ People.RecentActivity.UnitTests.TestData.album1Photos[0], People.RecentActivity.UnitTests.TestData.album1Photos[1] ];
    cachedAlbum.data.photos[0].data.caption = 'New Caption';
    
    // The new album object after refresh, photo 0 is updated, photo 1 is removed, photo 2 is added.
    var newAlbum = People.RecentActivity.UnitTests.TestData.albums[0];
    newAlbum.data.totalCount = 2;
    newAlbum.data.photos = [ People.RecentActivity.UnitTests.TestData.album1Photos[0], People.RecentActivity.UnitTests.TestData.album1Photos[2] ];
    
    var that = this;
    this._wrapper.refreshAlbumCompleted = function(result, album, photosToAdd, photosToUpdate, photosToRemove, userState) {
        var cachedAlbums = that._albumCache.getAlbums(that._feedProvider.contactId);
        
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(album);
            
            tc.isNotNull(photosToAdd);
            tc.areEqual(1, photosToAdd.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.album1Photos[2], photosToAdd[0], true);
            
            tc.isNotNull(photosToUpdate);
            tc.areEqual(1, photosToUpdate.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.album1Photos[0], photosToUpdate[0], true);
            
            tc.isNotNull(photosToRemove);
            tc.areEqual(1, photosToRemove.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.album1Photos[1], photosToRemove[0], true);
            
            // Verify cache is updated.
            tc.isNotNull(cachedAlbums);
            tc.areEqual(1, cachedAlbums.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, newAlbum, cachedAlbums[0]);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            
            tc.isNotNull(photosToAdd);
            tc.areEqual(0, photosToAdd.length);
            
            tc.isNotNull(photosToRemove);
            tc.areEqual(0, photosToRemove.length);
            
            tc.isNotNull(photosToUpdate);
            tc.areEqual(0, photosToUpdate.length);
            
            tc.isNotNull(cachedAlbums);
            tc.areEqual(1, cachedAlbums.length);
            
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, cachedAlbum, cachedAlbums[0]);
        }
    };
    
    // Add the test album to cache first.
    this._albumCache.addCacheEntry(this._feedProvider.contactId, [ cachedAlbum ]);
    this._feedProvider.refreshAlbum(cachedAlbum, null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.refreshPhoto = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshPhoto(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._albumCache.clear();
    var cachedAlbum = People.RecentActivity.UnitTests.TestData.albums[1];
    var albumInfo = (cachedAlbum.data);
    (albumInfo.photos[0].data).caption = 'Updated_Caption';
    (albumInfo.photos[0].data).tags = new Array(0);
    var refreshPhotoCompleted = function(result, photo, tagsToAdd, tagsToRemove, userState) {
        var cachedAlbums = that._albumCache.getAlbums(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(photo);
            tc.isNotNull(tagsToAdd);
            tc.areEqual(2, tagsToAdd.length);
            People.RecentActivity.UnitTests.TestUtils.verifyPhotoTag(tc, People.RecentActivity.UnitTests.TestData.photoTags[0], tagsToAdd[0]);
            People.RecentActivity.UnitTests.TestUtils.verifyPhotoTag(tc, People.RecentActivity.UnitTests.TestData.photoTags[1], tagsToAdd[1]);
            tc.isNotNull(tagsToRemove);
            tc.areEqual(0, tagsToRemove.length);
            // Verify cache is updated.
            tc.isNotNull(cachedAlbums);
            tc.areEqual(1, cachedAlbums.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[1], cachedAlbums[0]);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(tagsToAdd);
            tc.areEqual(0, tagsToAdd.length);
            tc.isNotNull(tagsToRemove);
            tc.areEqual(0, tagsToRemove.length);
            tc.isNotNull(cachedAlbums);
            tc.areEqual(1, cachedAlbums.length);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, cachedAlbum, cachedAlbums[0]);
        }
    };
    refreshPhotoCompleted = GetWrappedCallback(refreshPhotoCompleted);
    this._wrapper.refreshPhotoCompleted = refreshPhotoCompleted;
    // Add the test album to cache first.
    this._albumCache.addCacheEntry(this._feedProvider.contactId, [ cachedAlbum ]);
    this._feedProvider.refreshPhoto(albumInfo.photos[0], null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.refreshComment = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshComments(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedCache.clear();
    var refreshCommentsCompleted = function(result, entry, commentsToAdd, commentsToRemove, userState) {
        var cachedEntries = that._feedCache.getFeedEntries(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(entry);
            tc.isNotNull(commentsToAdd);
            tc.areEqual(2, commentsToAdd.length);
            People.RecentActivity.UnitTests.TestUtils.verifyComment(tc, People.RecentActivity.UnitTests.TestData.comments[0], commentsToAdd[0]);
            People.RecentActivity.UnitTests.TestUtils.verifyComment(tc, People.RecentActivity.UnitTests.TestData.comments[1], commentsToAdd[1]);
            tc.isNotNull(commentsToRemove);
            tc.areEqual(1, commentsToRemove.length);
            People.RecentActivity.UnitTests.TestUtils.verifyComment(tc, People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry().comments[0], commentsToRemove[0]);
            // Verify cache is updated.
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(2, cachedEntries[0].comments.length);
            tc.areEqual(2, cachedEntries[0].commentDetails.count);
            People.RecentActivity.UnitTests.TestUtils.verifyComment(tc, People.RecentActivity.UnitTests.TestData.comments[0], cachedEntries[0].comments[0]);
            People.RecentActivity.UnitTests.TestUtils.verifyComment(tc, People.RecentActivity.UnitTests.TestData.comments[1], cachedEntries[0].comments[1]);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(entry);
            tc.isNotNull(commentsToAdd);
            tc.isNotNull(commentsToRemove);
            tc.areEqual(0, commentsToAdd.length);
            tc.areEqual(0, commentsToRemove.length);
            // Verify cache is not updated.
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(1, cachedEntries[0].comments.length);
            tc.areEqual(1, cachedEntries[0].commentDetails.count);
            People.RecentActivity.UnitTests.TestUtils.verifyComment(tc, People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry().comments[0], cachedEntries[0].comments[0]);
        }
    };
    refreshCommentsCompleted = GetWrappedCallback(refreshCommentsCompleted);
    this._wrapper.refreshCommentsCompleted = refreshCommentsCompleted;
    // Add the test entry to cache first.
    this._feedCache.addCacheEntry(this._feedProvider.contactId, [ People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry() ]);
    this._feedProvider.refreshComments(People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry(), null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.refreshReaction = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshReactions(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedCache.clear();
    var refreshReactionsCompleted = function(result, entry, reactionsToAdd, reactionsToRemove, userState) {
        var cachedEntries = that._feedCache.getFeedEntries(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(entry);
            tc.isNotNull(reactionsToAdd);
            tc.areEqual(2, reactionsToAdd.length);
            People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, People.RecentActivity.UnitTests.TestData.reactions[0], reactionsToAdd[0]);
            People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, People.RecentActivity.UnitTests.TestData.reactions[1], reactionsToAdd[1]);
            tc.isNotNull(reactionsToRemove);
            tc.areEqual(1, reactionsToRemove.length);
            People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry().reactions[0], reactionsToRemove[0]);
            // Verify the cache is updated.
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(2, cachedEntries[0].reactions.length);
            tc.areEqual(2, cachedEntries[0].reactionDetails[0].count);
            People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, People.RecentActivity.UnitTests.TestData.reactions[0], cachedEntries[0].reactions[0]);
            People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, People.RecentActivity.UnitTests.TestData.reactions[1], cachedEntries[0].reactions[1]);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(entry);
            tc.isNotNull(reactionsToAdd);
            tc.isNotNull(reactionsToRemove);
            tc.areEqual(0, reactionsToAdd.length);
            tc.areEqual(0, reactionsToRemove.length);
            // Verify the cache is not updated.
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(1, cachedEntries[0].reactions.length);
            tc.areEqual(1, cachedEntries[0].reactionDetails[0].count);
            People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry().reactions[0], cachedEntries[0].reactions[0]);
        }
    };
    refreshReactionsCompleted = GetWrappedCallback(refreshReactionsCompleted);
    this._wrapper.refreshReactionsCompleted = refreshReactionsCompleted;
    this._feedCache.addCacheEntry(this._feedProvider.contactId, [ People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry() ]);
    this._feedProvider.refreshReactions(People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry(), null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.getFeedEntry = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedObjectCache.clear();
    var getFeedObjectCompleted = function(result, obj, userState) {
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(obj);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.linkEntries[0], obj, false, false, false, true);
            var cachedFeedEntry = that._feedObjectCache.getFeedObjectByInfo(obj);
            tc.isNotNull(cachedFeedEntry);
            // Verify the entry is added to cache as well.
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.linkEntries[0], cachedFeedEntry, false, false, false, true);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(obj);
            tc.isNull(obj.data);
        }
    };
    getFeedObjectCompleted = GetWrappedCallback(getFeedObjectCompleted);
    this._wrapper.getFeedObjectCompleted = getFeedObjectCompleted;
    var info = People.RecentActivity.Core.create_feedObjectInfo('LinkEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, null, null, 0, null, null, null, null);
    this._feedProvider.getFeedObject(info, null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.getAlbum = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedObjectCache.clear();
    var getFeedObjectCompleted = function(result, obj, userState) {
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(obj);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[0], obj, false, false, true);
            var cachedAlbum = that._feedObjectCache.getFeedObjectByInfo(obj);
            tc.isNotNull(cachedAlbum);
            // Verify the entry is added to cache as well.
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[0], cachedAlbum, false, false, true);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(obj);
            tc.isNull(obj.data);
        }
    };
    getFeedObjectCompleted = GetWrappedCallback(getFeedObjectCompleted);
    this._wrapper.getFeedObjectCompleted = getFeedObjectCompleted;
    var info = People.RecentActivity.Core.create_feedObjectInfo('Album1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, null, null, 0, null, null, null, null);
    this._feedProvider.getFeedObject(info, null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.getPhoto = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedObjectCache.clear();
    var getFeedObjectCompleted = function(result, obj, userState) {
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(obj);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.album2Photos[0], obj);
            var cachedPhoto = that._feedObjectCache.getFeedObjectByInfo(obj);
            tc.isNotNull(cachedPhoto);
            // Verify the photo is added to cache as well.
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.album2Photos[0], cachedPhoto);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(obj);
            tc.isNull(obj.data);
        }
    };
    getFeedObjectCompleted = GetWrappedCallback(getFeedObjectCompleted);
    this._wrapper.getFeedObjectCompleted = getFeedObjectCompleted;
    var info = People.RecentActivity.Core.create_feedObjectInfo('Photo4_Id', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photo, null, null, 0, null, null, null, null);
    this._feedProvider.getFeedObject(info, null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.getCachedFeedEntry = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetCachedFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedCache.clear();
    var getCachedFeedObjectCompleted = function(result, obj, userState) {
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(obj);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.textEntries[0], obj);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(obj);
            tc.isNull(obj.data);
        }
    };
    getCachedFeedObjectCompleted = GetWrappedCallback(getCachedFeedObjectCompleted);
    this._wrapper.getCachedFeedObjectCompleted = getCachedFeedObjectCompleted;
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.getCachedAlbum = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetCachedFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._albumCache.clear();
    var getCachedFeedObjectCompleted = function(result, obj, userState) {
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(obj);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.albums[0], obj);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(obj);
            tc.isNull(obj.data);
        }
    };
    getCachedFeedObjectCompleted = GetWrappedCallback(getCachedFeedObjectCompleted);
    this._wrapper.getCachedFeedObjectCompleted = getCachedFeedObjectCompleted;
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.getCachedPhoto = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetCachedFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._albumCache.clear();
    var getCachedFeedObjectCompleted = function(result, obj, userState) {
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(obj);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.album2Photos[0], obj);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(obj);
            tc.isNull(obj.data);
        }
    };
    getCachedFeedObjectCompleted = GetWrappedCallback(getCachedFeedObjectCompleted);
    this._wrapper.getCachedFeedObjectCompleted = getCachedFeedObjectCompleted;
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.removeReaction = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RemoveReaction(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.ReactionInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedCache.clear();
    var obj = {};
    var reactionRemoved = function(result, entry, reaction, userState) {
        var cachedEntries = that._feedCache.getFeedEntries(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.isNotNull(entry);
            tc.areEqual(People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry().id, entry.id);
            People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry().reactions[0], reaction);
            // Verify the cached reaction is deleted too.
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(0, cachedEntries[0].reactions.length);
            tc.areEqual(0, cachedEntries[0].reactionDetails[0].count);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(entry);
            tc.isNotNull(reaction);
            // Verify the cached reaction is still there.
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(1, cachedEntries[0].reactions.length);
            tc.areEqual(1, cachedEntries[0].reactionDetails[0].count);
        }
    };
    reactionRemoved = GetWrappedCallback(reactionRemoved);
    this._wrapper.reactionRemoved = reactionRemoved;
    this._feedCache.addCacheEntry(this._feedProvider.contactId, [ People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry() ]);
    this._feedProvider.removeReaction(People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry(), People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry().reactions[0], obj);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.addComment = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddComment(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.CommentInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedCache.clear();
    var commentAdded = function(result, entry, comment, userState) {
        var cachedEntries = that._feedCache.getFeedEntries(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            People.RecentActivity.UnitTests.TestUtils.verifyAddedComment(tc, People.RecentActivity.UnitTests.TestData.comments[0], comment);
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(2, cachedEntries[0].comments.length);
            tc.areEqual(2, cachedEntries[0].commentDetails.count);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(entry);
            tc.isNotNull(comment);
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(1, cachedEntries[0].comments.length);
            tc.areEqual(1, cachedEntries[0].commentDetails.count);
        }
    };
    commentAdded = GetWrappedCallback(commentAdded);
    this._wrapper.commentAdded = commentAdded;
    this._feedCache.addCacheEntry(this._feedProvider.contactId, [ People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry() ]);
    this._feedProvider.addComment(People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry(), People.RecentActivity.UnitTests.TestData.comments[0], null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.addReaction = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddReaction(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.ReactionInfo,System.Object)" />.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._feedCache.clear();
    var reactionAdded = function(result, entry, reaction, userState) {
        var cachedEntries = that._feedCache.getFeedEntries(that._feedProvider.contactId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            People.RecentActivity.UnitTests.TestUtils.verifyAddedReaction(tc, People.RecentActivity.UnitTests.TestData.reactions[0], reaction);
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(2, cachedEntries[0].reactions.length);
            tc.areEqual(2, cachedEntries[0].reactionDetails[0].count);
        }
        else {
            tc.isTrue(result.code !== People.RecentActivity.Core.ResultCode.success);
            tc.isNotNull(entry);
            tc.isNotNull(reaction);
            tc.isNotNull(cachedEntries);
            tc.areEqual(1, cachedEntries.length);
            tc.areEqual(1, cachedEntries[0].reactions.length);
            tc.areEqual(1, cachedEntries[0].reactionDetails[0].count);
        }
    };
    reactionAdded = GetWrappedCallback(reactionAdded);
    this._wrapper.reactionAdded = reactionAdded;
    this._feedCache.addCacheEntry(this._feedProvider.contactId, [ People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry() ]);
    this._feedProvider.addReaction(People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry(), People.RecentActivity.UnitTests.TestData.reactions[0], null);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.refreshNotifications = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshNotifications(System.Object)" /> functionality.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._notificationCache.clear();
    var token = {};
    var testNotifications = People.RecentActivity.UnitTests.TestUtils.getNotificationsData(People.RecentActivity.UnitTests.TestData.notifications, this._networkId);
    testNotifications.reverse();
    var updated = People.RecentActivity.UnitTests.TestUtils.getNotificationData(testNotifications[6], this._networkId);
    updated.isUnread = true;
    var initialCache = [ updated, testNotifications[7] ];
    var getCachedNotificationsCompleted = function(result, notifications, userState) {
        tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
        tc.isNotNull(notifications);
        tc.areEqual(token, userState);
        var cached = that._notificationCache.getNotifications(that._networkId);
        People.RecentActivity.UnitTests.TestUtils.verifyNotifications(tc, notifications, initialCache, false);
    };
    var refreshNotificationsCompleted = function(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState) {
        tc.isNotNull(notificationsToAdd);
        tc.isNotNull(notificationsToRemove);
        tc.isNotNull(notificationsToUpdate);
        tc.areEqual(token, userState);
        var cached = that._notificationCache.getNotifications(that._networkId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.areEqual(0, notificationsToRemove.length);
            People.RecentActivity.UnitTests.TestUtils.verifyNotifications(tc, testNotifications, cached, false);
            tc.areEqual(6, notificationsToAdd.length);
            People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, testNotifications[0], notificationsToAdd[0], false);
            People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, testNotifications[1], notificationsToAdd[1], false);
            People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, testNotifications[2], notificationsToAdd[2], false);
            People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, testNotifications[3], notificationsToAdd[3], false);
            People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, testNotifications[4], notificationsToAdd[4], false);
            People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, testNotifications[5], notificationsToAdd[5], false);
            tc.areEqual(1, notificationsToUpdate.length);
            People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, testNotifications[6], notificationsToUpdate[0], false);
        }
        else {
            tc.areEqual(People.RecentActivity.Core.ResultCode.invalidUserCredential, result.code);
            tc.areEqual(0, notificationsToAdd.length);
            tc.areEqual(0, notificationsToUpdate.length);
            tc.areEqual(0, notificationsToRemove.length);
            People.RecentActivity.UnitTests.TestUtils.verifyNotifications(tc, initialCache, cached, false);
        }
    };
    refreshNotificationsCompleted = GetWrappedCallback(refreshNotificationsCompleted);
    this._wrapper.refreshNotificationsCompleted = refreshNotificationsCompleted;
    getCachedNotificationsCompleted = GetWrappedCallback(getCachedNotificationsCompleted);
    this._wrapper.getCachedNotificationsCompleted = getCachedNotificationsCompleted;
    this._notificationCache.addCacheEntry(this._networkId, initialCache);
    this._feedProvider.refreshNotifications(token);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.markNotificationsRead = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.MarkNotificationsRead(People.RecentActivity.Core.NotificationInfo[],System.Object)" /> functionality.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    this._notificationCache.clear();
    var token = {};
    var testNotifications = People.RecentActivity.UnitTests.TestUtils.getNotificationsData(People.RecentActivity.UnitTests.TestData.notifications, this._networkId).slice(0, 2);
    var markNotificationsReadCompleted = function(result, notifications, userState) {
        tc.isNotNull(notifications);
        tc.areEqual(token, userState);
        var cached = that._notificationCache.getNotifications(that._networkId);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            People.RecentActivity.UnitTests.TestUtils.verifyNotifications(tc, testNotifications, notifications, true);
            tc.areEqual(testNotifications.length, cached.length);
            for (var n = 0; n < cached.length; n++) {
                var notification = cached[n];
                tc.isFalse(notification.isUnread);
            }

        }
        else {
            tc.areEqual(People.RecentActivity.Core.ResultCode.failure, result.code);
            People.RecentActivity.UnitTests.TestUtils.verifyNotifications(tc, testNotifications, notifications, false);
            tc.areEqual(testNotifications.length, cached.length);
            for (var i = 0; i < cached.length; i++) {
                tc.areEqual(testNotifications[i].isUnread, cached[i].isUnread);
            }        
        }
    };
    markNotificationsReadCompleted = GetWrappedCallback(markNotificationsReadCompleted);
    this._wrapper.markNotificationsReadCompleted = markNotificationsReadCompleted;
    this._notificationCache.addCacheEntry(this._networkId, testNotifications);
    this._feedProvider.markNotificationsRead(testNotifications, token);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.getUnreadNotificationsCount = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetUnreadNotificationsCount(System.Object)" /> functionality.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    var token = {};
    var getUnreadNotificationsCountCompleted = function(result, unreadCount, userState) {
        tc.areEqual(token, userState);
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            tc.areEqual(9, unreadCount);
        }
        else {
            tc.areEqual(People.RecentActivity.Core.ResultCode.invalidUserCredential, result.code);
            tc.areEqual(0, unreadCount);
        }
    };
    getUnreadNotificationsCountCompleted = GetWrappedCallback(getUnreadNotificationsCountCompleted);
    this._wrapper.getUnreadNotificationsCountCompleted = getUnreadNotificationsCountCompleted;
    this._feedProvider.getUnreadNotificationsCount(token);
};

People.RecentActivity.UnitTests.FeedProviderTestBase.prototype.addFeedObject = function(tc) {
    /// <summary>
    ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> functionality.
    /// </summary>
    /// <param name="tc" type="Tx.TestContext"/>
    var that = this;
    
    var token = {};
    var testPost = People.RecentActivity.UnitTests.TestData.addFeedObject;
    var testEntry = testPost.data;
    var entry = People.RecentActivity.Core.create_feedEntryInfo(testEntry.type, null, testEntry.data, null, null, null, false);
    testPost = People.RecentActivity.Core.create_feedObjectInfo(null, testPost.sourceId, testPost.type, entry, null, 0, null, null, null, null);
    var addFeedObjectCompleted = function(result, obj, userState) {
        if (that._success) {
            tc.areEqual(People.RecentActivity.Core.ResultCode.success, result.code);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, People.RecentActivity.UnitTests.TestData.addFeedObject, obj, true, true);
        }
        else {
            tc.areEqual(People.RecentActivity.Core.ResultCode.failure, result.code);
            tc.isNull(obj);
        }
    };
    addFeedObjectCompleted = GetWrappedCallback(addFeedObjectCompleted);
    this._wrapper.addFeedObjectCompleted = addFeedObjectCompleted;
    this._feedProvider.addFeedObject(testPost, token);
};