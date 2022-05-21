
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\CommentDetailsInfo.js" />
/// <reference path="..\Core\CommentInfo.js" />
/// <reference path="..\Core\ContactInfo.js" />
/// <reference path="..\Core\FeedEntryInfo.js" />
/// <reference path="..\Core\FeedEntryInfoType.js" />
/// <reference path="..\Core\FeedEntryLinkDataInfo.js" />
/// <reference path="..\Core\FeedEntryStatusDataInfo.js" />
/// <reference path="..\Core\FeedObjectInfo.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\NetworkReactionInfo.js" />
/// <reference path="..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\Core\Permissions.js" />
/// <reference path="..\Core\ReactionDetailsInfo.js" />
/// <reference path="..\Core\ReactionInfo.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="MockLog.js" />

People.RecentActivity.UnitTests.MockProvider = function(personId, events) {
    /// <summary>
    ///     Provides a mock provider.
    /// </summary>
    /// <param name="personId" type="String"></param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents"></param>
    /// <field name="_contact1" type="People.RecentActivity.Core.contactInfo" static="true"></field>
    /// <field name="_contact2" type="People.RecentActivity.Core.contactInfo" static="true"></field>
    /// <field name="_comment1" type="People.RecentActivity.Core.commentInfo" static="true"></field>
    /// <field name="_comment2" type="People.RecentActivity.Core.commentInfo" static="true"></field>
    /// <field name="_comment3" type="People.RecentActivity.Core.commentInfo" static="true"></field>
    /// <field name="_reactiontype1" type="People.RecentActivity.Core.networkReactionInfo" static="true"></field>
    /// <field name="_reaction1" type="People.RecentActivity.Core.reactionInfo" static="true"></field>
    /// <field name="_reaction2" type="People.RecentActivity.Core.reactionInfo" static="true"></field>
    /// <field name="_entry1" type="People.RecentActivity.Core.feedObjectInfo" static="true"></field>
    /// <field name="_entry2" type="People.RecentActivity.Core.feedObjectInfo" static="true"></field>
    /// <field name="_entry3" type="People.RecentActivity.Core.feedObjectInfo" static="true"></field>
    /// <field name="_personId" type="String"></field>
    /// <field name="_events" type="People.RecentActivity.Core.IFeedProviderEvents"></field>
    /// <field name="_initialRefresh" type="Boolean"></field>
    this._personId = personId;
    this._events = events;
};


People.RecentActivity.UnitTests.MockProvider._contact1 = People.RecentActivity.Core.create_contactInfo('CONTACT_ID_1', 'CONTACT_SOURCE_1', null, 'CONTACT_NAME_1', 'http://picture-1', true);
People.RecentActivity.UnitTests.MockProvider._contact2 = People.RecentActivity.Core.create_contactInfo('CONTACT_ID_2', 'CONTACT_SOURCE_2', null, 'CONTACT_NAME_2', 'http://picture-2', false);
People.RecentActivity.UnitTests.MockProvider._comment1 = People.RecentActivity.Core.create_commentInfo('COMMENT_ID_1', People.RecentActivity.UnitTests.MockProvider._contact1, new Date(2011, 2, 21, 12, 12, 12).getTime(), 'COMMENT_TEXT_1', []);
People.RecentActivity.UnitTests.MockProvider._comment2 = People.RecentActivity.Core.create_commentInfo('COMMENT_ID_2', People.RecentActivity.UnitTests.MockProvider._contact2, new Date(2011, 2, 21, 11, 11, 11).getTime(), 'COMMENT_TEXT_2', []);
People.RecentActivity.UnitTests.MockProvider._comment3 = People.RecentActivity.Core.create_commentInfo('COMMENT_ID_3', People.RecentActivity.UnitTests.MockProvider._contact2, new Date(2011, 2, 21, 10, 10, 10).getTime(), 'COMMENT_TEXT_3', []);
People.RecentActivity.UnitTests.MockProvider._reactiontype1 = People.RecentActivity.Core.create_networkReactionInfo('REACTIONTYPE_ID_1', People.RecentActivity.Core.NetworkReactionInfoType.like, 'REACTIONTYPE_NAME_1', 'feed-icon', 'selfpage-icon', 'css-class', false, false);
People.RecentActivity.UnitTests.MockProvider._reaction1 = People.RecentActivity.Core.create_reactionInfo(People.RecentActivity.UnitTests.MockProvider._reactiontype1, People.RecentActivity.UnitTests.MockProvider._contact1);
People.RecentActivity.UnitTests.MockProvider._reaction2 = People.RecentActivity.Core.create_reactionInfo(People.RecentActivity.UnitTests.MockProvider._reactiontype1, People.RecentActivity.UnitTests.MockProvider._contact2);
People.RecentActivity.UnitTests.MockProvider._entry1 = People.RecentActivity.Core.create_feedObjectInfo('ENTRY_ID_1', 'NETWORK_ID', People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.text, People.RecentActivity.UnitTests.MockProvider._contact1, People.RecentActivity.Core.create_feedEntryStatusDataInfo('TEXT'), 'VIA_1', null, null, false), null, new Date(2011, 2, 18, 13, 37).getTime(), People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.full), [ People.RecentActivity.UnitTests.MockProvider._comment1 ], [ People.RecentActivity.Core.create_reactionDetailsInfo('REACTIONTYPE_ID_1', 1, People.RecentActivity.Core.Permissions.full) ], [ People.RecentActivity.UnitTests.MockProvider._reaction1 ]);
People.RecentActivity.UnitTests.MockProvider._entry2 = People.RecentActivity.Core.create_feedObjectInfo('ENTRY_ID_2', 'NETWORK_ID', People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.link, People.RecentActivity.UnitTests.MockProvider._contact2, People.RecentActivity.Core.create_feedEntryLinkDataInfo('TEXT', 'http://example.com', 'TITLE', 'CAPTION', 'DESCRIPTION', 'http://tile'), 'VIA_2', null, null, false), null, new Date(2011, 2, 18, 23, 59).getTime(), People.RecentActivity.Core.create_commentDetailsInfo(0, true, People.RecentActivity.Core.Permissions.full), [], [], []);
People.RecentActivity.UnitTests.MockProvider._entry3 = People.RecentActivity.Core.create_feedObjectInfo('ENTRY_ID_3', 'NETWORK_ID', People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.text, People.RecentActivity.UnitTests.MockProvider._contact1, People.RecentActivity.Core.create_feedEntryStatusDataInfo('TEXT'), 'VIA_3', null, null, false), null, new Date(2011, 2, 28, 12, 15).getTime(), People.RecentActivity.Core.create_commentDetailsInfo(0, true, People.RecentActivity.Core.Permissions.full), new Array(0), [ People.RecentActivity.Core.create_reactionDetailsInfo('REACTIONTYPE_ID_1', 2, People.RecentActivity.Core.Permissions.full) ], []);
People.RecentActivity.UnitTests.MockProvider.prototype._personId = null;
People.RecentActivity.UnitTests.MockProvider.prototype._events = null;
People.RecentActivity.UnitTests.MockProvider.prototype._initialRefresh = true;

People.RecentActivity.UnitTests.MockProvider.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
};

People.RecentActivity.UnitTests.MockProvider.prototype.refreshFeedEntries = function(userState) {
    /// <summary>
    ///     Refreshes the feed entries.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.UnitTests.MockLog.add('MockProvider.RefreshFeedEntries', [ userState ]);
    if (this._initialRefresh) {
        this._initialRefresh = false;
        this._events.onRefreshFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [ People.RecentActivity.UnitTests.MockProvider._entry1, People.RecentActivity.UnitTests.MockProvider._entry2 ], [], [], false, userState);
    }
    else {
        this._events.onRefreshFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [ People.RecentActivity.UnitTests.MockProvider._entry3 ], [ People.RecentActivity.Core.create_feedObjectInfo('ENTRY_ID_1', 'NETWORK_ID', People.RecentActivity.Core.FeedObjectInfoType.entry, null, null, 0, People.RecentActivity.Core.create_commentDetailsInfo(2, true, People.RecentActivity.Core.Permissions.full), null, [ People.RecentActivity.Core.create_reactionDetailsInfo('REACTIONTYPE_ID_1', 1, People.RecentActivity.Core.Permissions.full) ], null) ], [ People.RecentActivity.Core.create_feedObjectInfo('ENTRY_ID_2', 'NETWORK_ID', People.RecentActivity.Core.FeedObjectInfoType.entry, null, null, 0, People.RecentActivity.Core.create_commentDetailsInfo(0, true, People.RecentActivity.Core.Permissions.full), null, [], null) ], false, userState);
    }
};

People.RecentActivity.UnitTests.MockProvider.prototype.getCachedFeedEntries = function(returnBatch, userState) {
    /// <summary>
    ///     Gets the cached feed entries.
    /// </summary>
    /// <param name="returnBatch" type="Boolean">Whether to only return batch size or all entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.UnitTests.MockLog.add('MockProvider.GetCachedFeedEntries', [ userState ]);
    this._events.onGetCachedFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [ People.RecentActivity.UnitTests.MockProvider._entry1 ], userState);
};

People.RecentActivity.UnitTests.MockProvider.prototype.refreshComments = function(entry, userState) {
    /// <summary>
    ///     Gets or refreshes the comments of a feed entry.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo">The feed entry.</param>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.UnitTests.MockLog.add('MockProvider.RefreshComments', [ entry, userState ]);
    this._events.onRefreshCommentsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), entry, [ People.RecentActivity.UnitTests.MockProvider._comment2, People.RecentActivity.UnitTests.MockProvider._comment3 ], [ People.RecentActivity.UnitTests.MockProvider._comment1 ], userState);
};

People.RecentActivity.UnitTests.MockProvider.prototype.refreshReactions = function(entry, userState) {
    /// <summary>
    ///     Gets or refreshes the reactions of a feed entry.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo">The feed entry.</param>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.UnitTests.MockLog.add('MockProvider.RefreshReactions', [ entry, userState ]);
    this._events.onRefreshReactionsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), entry, [ People.RecentActivity.UnitTests.MockProvider._reaction2 ], [ People.RecentActivity.UnitTests.MockProvider._reaction1 ], userState);
};

People.RecentActivity.UnitTests.MockProvider.prototype.addComment = function(entry, comment, userState) {
    /// <summary>
    ///     Adds a comment for a feed entry.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo">The feed entry.</param>
    /// <param name="comment" type="People.RecentActivity.Core.commentInfo">The comment to add.</param>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.UnitTests.MockLog.add('MockProvider.AddComment', [ entry, comment, userState ]);
    this._events.onCommentAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), entry, People.RecentActivity.Core.create_commentInfo('COMMENT_ID_4', People.RecentActivity.UnitTests.MockProvider._contact1, new Date().getTime(), comment.text, null), userState);
};

People.RecentActivity.UnitTests.MockProvider.prototype.addReaction = function(entry, reaction, userState) {
    /// <summary>
    ///     Adds a reaction for a feed entry.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo">The feed entry.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.UnitTests.MockLog.add('MockProvider.AddReaction', [ entry, reaction, userState ]);
    this._events.onReactionAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), entry, reaction, userState);
};

People.RecentActivity.UnitTests.MockProvider.prototype.removeReaction = function(entry, reaction, userState) {
    /// <summary>
    ///     Deletes a reaction.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo">The feed entry to delete the reaction from.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.reactionInfo">The reaction to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.UnitTests.MockLog.add('MockProvider.RemoveReaction', [ entry, reaction, userState ]);
    this._events.onReactionRemoved(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), entry, reaction, userState);
};

People.RecentActivity.UnitTests.MockProvider.prototype.refreshAlbums = function(userState) {
    /// <summary>
    ///     Refreshes the albums.
    /// </summary>
    /// <param name="userState" type="Object"></param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.getCachedAlbums = function(userState) {
    /// <summary>
    ///     Gets the cached albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.refreshAlbum = function(album, userState) {
    /// <summary>
    ///     Refreshes the album including its metadata and photos.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.Core.feedObjectInfo">The album.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.refreshPhoto = function(photo, userState) {
    /// <summary>
    ///     Refreshes the photo including its metadata and photo tags.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Core.feedObjectInfo">The photo.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.getFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.getCachedFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single, cached, feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.addFeedObject = function(info, userState) {
    /// <summary>
    ///     Adds a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.feedObjectInfo">The feed object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.getMoreFeedEntries = function(userState) {
    /// <summary>
    ///     Gets more entries.
    /// </summary>
    /// <param name="userState" type="Object"></param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.refreshNotifications = function(userState) {
    /// <summary>
    ///     Refreshes the notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.getCachedNotifications = function(userState) {
    /// <summary>
    ///     Retrieves the previously cached set of notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.markNotificationsRead = function(notifications, userState) {
    /// <summary>
    ///     Marks the specified notifications as read.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to mark as read.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.UnitTests.MockProvider.prototype.getUnreadNotificationsCount = function(userState) {
    /// <summary>
    ///     Gets the count of unread notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
};