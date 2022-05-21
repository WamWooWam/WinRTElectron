
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Core\ResultInfo.js" />

People.RecentActivity.UnitTests.FeedProviderEventsWrapper = function() {
    /// <summary>
    ///     Wrapper class for the FeedProviderEvents.
    /// </summary>
    /// <field name="refreshFeedEntriesCompleted" type="Function">Event raised when the feed refresh completes.</field>
    /// <field name="getCachedFeedEntriesCompleted" type="Function">Event raised when the cached feed fetch completes.</field>
    /// <field name="refreshAlbumsCompleted" type="Function">Event raised when the album refresh completes.</field>
    /// <field name="getCachedAlbumsCompleted" type="Function">Event raised when the cached albums fetch completes.</field>
    /// <field name="refreshAlbumCompleted" type="Function">Event raised when the album refresh completes.</field>
    /// <field name="refreshPhotoCompleted" type="Function">Event raised when the photo refresh completes.</field>
    /// <field name="refreshCommentsCompleted" type="Function">Event raised when the comment refresh completes.</field>
    /// <field name="refreshReactionsCompleted" type="Function">Event raised when the reaction refresh completes.</field>
    /// <field name="commentAdded" type="Function">Event raised when a comment is added.</field>
    /// <field name="reactionAdded" type="Function">Event raised when a reaction is added.</field>
    /// <field name="reactionRemoved" type="Function">Event raised when a reaction is removed.</field>
    /// <field name="getFeedObjectCompleted" type="Function">Event raised when a feed object is retrieved.</field>
    /// <field name="getCachedFeedObjectCompleted" type="Function">Event raised when a cached feed object is retrieved.</field>
    /// <field name="addFeedObjectCompleted" type="Function">Event raised when a feed object has been added.</field>
    /// <field name="refreshNotificationsCompleted" type="Function">Event raised when the notification refresh completes.</field>
    /// <field name="getCachedNotificationsCompleted" type="Function">Event raised when the cached notification fetch completes.</field>
    /// <field name="markNotificationsReadCompleted" type="Function">Event raised when the notifications have been marked as read.</field>
    /// <field name="getUnreadNotificationsCountCompleted" type="Function">Event raised when the notifications have been marked as read.</field>
};


People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.refreshFeedEntriesCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.getCachedFeedEntriesCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.refreshAlbumsCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.getCachedAlbumsCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.refreshAlbumCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.refreshPhotoCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.refreshCommentsCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.refreshReactionsCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.commentAdded = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.reactionAdded = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.reactionRemoved = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.getFeedObjectCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.getCachedFeedObjectCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.addFeedObjectCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.refreshNotificationsCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.getCachedNotificationsCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.markNotificationsReadCompleted = null;
People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.getUnreadNotificationsCountCompleted = null;

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onRefreshFeedEntriesCompleted = function(result, entriesToAdd, entriesToUpdate, entriesToRemove, hasMoreEntries, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entriesToAdd" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="entriesToUpdate" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="entriesToRemove" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="hasMoreEntries" type="Boolean"></param>
    /// <param name="userState" type="Object"></param>
    if (this.refreshFeedEntriesCompleted != null) {
        this.refreshFeedEntriesCompleted(result, entriesToAdd, entriesToUpdate, entriesToRemove, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onGetCachedFeedEntriesCompleted = function(result, entries, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.getCachedFeedEntriesCompleted != null) {
        this.getCachedFeedEntriesCompleted(result, entries, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onRefreshCommentsCompleted = function(result, entry, commentsToAdd, commentsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="commentsToAdd" type="Array" elementType="commentInfo"></param>
    /// <param name="commentsToRemove" type="Array" elementType="commentInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.refreshCommentsCompleted != null) {
        this.refreshCommentsCompleted(result, entry, commentsToAdd, commentsToRemove, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onRefreshReactionsCompleted = function(result, entry, reactionsToAdd, reactionsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="reactionsToAdd" type="Array" elementType="reactionInfo"></param>
    /// <param name="reactionsToRemove" type="Array" elementType="reactionInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.refreshReactionsCompleted != null) {
        this.refreshReactionsCompleted(result, entry, reactionsToAdd, reactionsToRemove, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onCommentAdded = function(result, entry, comment, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="comment" type="People.RecentActivity.Core.commentInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.commentAdded != null) {
        this.commentAdded(result, entry, comment, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onReactionAdded = function(result, entry, reaction, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="reaction" type="People.RecentActivity.Core.reactionInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.reactionAdded != null) {
        this.reactionAdded(result, entry, reaction, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onReactionRemoved = function(result, entry, reaction, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="reaction" type="People.RecentActivity.Core.reactionInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.reactionRemoved != null) {
        this.reactionRemoved(result, entry, reaction, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onGetMoreEntriesCompleted = function(result, entries, hasMoreEntries, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="hasMoreEntries" type="Boolean"></param>
    /// <param name="userState" type="Object"></param>
    // TODO (jietang): Implement me.
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onGetCachedFeedObjectCompleted = function(result, info, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.getCachedFeedObjectCompleted != null) {
        this.getCachedFeedObjectCompleted(result, info, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onGetFeedObjectCompleted = function(result, info, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.getFeedObjectCompleted != null) {
        this.getFeedObjectCompleted(result, info, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onFeedObjectAdded = function(result, info, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.addFeedObjectCompleted != null) {
        this.addFeedObjectCompleted(result, info, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onGetCachedAlbumsCompleted = function(result, albums, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="albums" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.getCachedAlbumsCompleted != null) {
        this.getCachedAlbumsCompleted(result, albums, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onRefreshAlbumsCompleted = function(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="albumsToAdd" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="albumsToUpdate" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="albumsToRemove" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.refreshAlbumsCompleted != null) {
        this.refreshAlbumsCompleted(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onRefreshAlbumCompleted = function(result, album, photosToAdd, photosToUpdate, photosToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="album" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="photosToAdd" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="photosToUpdate" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="photosToRemove" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.refreshAlbumCompleted != null) {
        this.refreshAlbumCompleted(result, album, photosToAdd, photosToUpdate, photosToRemove, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onRefreshPhotoCompleted = function(result, photo, tagsToAdd, tagsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="photo" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="tagsToAdd" type="Array" elementType="photoTagInfo"></param>
    /// <param name="tagsToRemove" type="Array" elementType="photoTagInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.refreshPhotoCompleted != null) {
        this.refreshPhotoCompleted(result, photo, tagsToAdd, tagsToRemove, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onRefreshNotificationsCompleted = function(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="notificationsToAdd" type="Array" elementType="notificationInfo"></param>
    /// <param name="notificationsToUpdate" type="Array" elementType="notificationInfo"></param>
    /// <param name="notificationsToRemove" type="Array" elementType="notificationInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.refreshNotificationsCompleted != null) {
        this.refreshNotificationsCompleted(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onGetCachedNotificationsCompleted = function(result, notifications, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.getCachedNotificationsCompleted != null) {
        this.getCachedNotificationsCompleted(result, notifications, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onMarkNotificationsReadCompleted = function(result, notifications, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this.markNotificationsReadCompleted != null) {
        this.markNotificationsReadCompleted(result, notifications, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onGetUnreadNotificationsCountCompleted = function(result, unreadCount, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="unreadCount" type="Number" integer="true"></param>
    /// <param name="userState" type="Object"></param>
    if (this.getUnreadNotificationsCountCompleted != null) {
        this.getUnreadNotificationsCountCompleted(result, unreadCount, userState);
    }
};

People.RecentActivity.UnitTests.FeedProviderEventsWrapper.prototype.onUpdated = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.networkInfo"></param>
    // TODO (jietang): Add unit tests.
};