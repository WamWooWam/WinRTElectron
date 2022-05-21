
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\CommentDetailsInfo.js" />
/// <reference path="..\Core\CommentInfo.js" />
/// <reference path="..\Core\ContactInfo.js" />
/// <reference path="..\Core\EntityInfoType.js" />
/// <reference path="..\Core\FeedEntryInfo.js" />
/// <reference path="..\Core\FeedEntryInfoType.js" />
/// <reference path="..\Core\FeedObjectInfo.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\Helpers\DateTimeHelper.js" />
/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Core\NetworkInfo.js" />
/// <reference path="..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\Core\NotificationInfo.js" />
/// <reference path="..\Core\NotificationInfoType.js" />
/// <reference path="..\Core\Permissions.js" />
/// <reference path="..\Core\ReactionDetailsInfo.js" />
/// <reference path="..\Core\ReactionInfo.js" />
/// <reference path="..\Platform\AuthInfo.js" />
/// <reference path="..\Platform\Configuration.js" />
/// <reference path="..\Providers\FeedProviderFactory.js" />
/// <reference path="FeedProviderEventsWrapper.js" />
/// <reference path="TestData.js" />

People.RecentActivity.UnitTests.TestUtils = function() {
    /// <summary>
    ///     Provides test util methods.
    /// </summary>
    /// <field name="_fbPostMatch1" type="RegExp" static="true"></field>
    /// <field name="_fbPostMatch2" type="RegExp" static="true"></field>
    /// <field name="_fbPhotoMatch" type="RegExp" static="true"></field>
    /// <field name="_fbAlbumMatch" type="RegExp" static="true"></field>
    /// <field name="_contact" type="People.RecentActivity.Core.contactInfo" static="true"></field>
};


People.RecentActivity.UnitTests.TestUtils._fbPostMatch1 = new RegExp('^https?://[^/]+/[^/]+/posts/([^/?&]+)$', 'i');
People.RecentActivity.UnitTests.TestUtils._fbPostMatch2 = new RegExp('^https?://[^/]+/permalink\\.php\\?story_fbid=([^&]+)&id=([^&]+)$', 'i');
People.RecentActivity.UnitTests.TestUtils._fbPhotoMatch = new RegExp('^https?://[^/]+/photo\\.php\\?fbid=([^&]+)&set=[^&]+&type=1$', 'i');
People.RecentActivity.UnitTests.TestUtils._fbAlbumMatch = new RegExp('^https?://[^/]+/album\\.php\\?fbid=([^&]+)&id=[^&]+&aid=[^&]+$', 'i');
People.RecentActivity.UnitTests.TestUtils._contact = People.RecentActivity.Core.create_contactInfo('10000000', 'FB', null, 'PERSON_NAME', 'PERSON_PICTURE', false);

People.RecentActivity.UnitTests.TestUtils.getUserContactInfo = function() {
    /// <summary>
    ///     Gets the mock contact info for the signed in user.
    /// </summary>
    /// <returns type="People.RecentActivity.Core.contactInfo"></returns>
    return People.RecentActivity.UnitTests.TestUtils._contact;
};

People.RecentActivity.UnitTests.TestUtils.getNetworkInfo = function(networkId) {
    /// <summary>
    ///     Gets the network info.
    /// </summary>
    /// <param name="networkId" type="String">The ID of the network.</param>
    /// <returns type="People.RecentActivity.Core.networkInfo"></returns>
    return People.RecentActivity.Core.create_networkInfo(networkId, null, null, 'NETWORK_NAME', false, true, false, [], People.RecentActivity.UnitTests.TestUtils._contact);
};

People.RecentActivity.UnitTests.TestUtils.getFeedProvider = function(networkId, events) {
    /// <summary>
    ///     Gets the test feed provider.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="events" type="People.RecentActivity.UnitTests.FeedProviderEventsWrapper">The events.</param>
    /// <returns type="People.RecentActivity.Core.IFeedProvider"></returns>
    return People.RecentActivity.Providers.FeedProviderFactory.instance.createFeedProvider('PERSON_ID', 0, People.RecentActivity.UnitTests.TestUtils.getNetworkInfo(networkId), events);
};

People.RecentActivity.UnitTests.TestUtils.getTestFeedEntry = function() {
    /// <summary>
    ///     Gets the test feed entry.
    /// </summary>
    /// <returns type="People.RecentActivity.Core.feedObjectInfo"></returns>
    return People.RecentActivity.Core.create_feedObjectInfo('ENTRY_ID', 'FB', People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.none, People.RecentActivity.UnitTests.TestUtils._contact, null, null, null, null, false), null, 0, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.Core.create_commentInfo('Comment0_ID', People.RecentActivity.UnitTests.TestData.contacts[1], People.RecentActivity.Core.DateTimeHelper.parseTimeStamp('2011-02-15T00:06:46Z').getTime(), 'Comment0_Text', new Array(0)) ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 1, People.RecentActivity.Core.Permissions.full) ], [ People.RecentActivity.Core.create_reactionInfo(People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.like), People.RecentActivity.UnitTests.TestUtils.getUserContactInfo()) ]);
};

People.RecentActivity.UnitTests.TestUtils.verifyFeedObject = function (tc, expected, actual, skipVerifyCommentReaction, skipVerifyTimestamp, skipVerifyPhotosInAlbum, expectNoComments) {
    /// <summary>
    ///     Verifies the feed object.
    /// </summary>
    /// <param name="expected" type="People.RecentActivity.Core.feedObjectInfo">The expected.</param>
    /// <param name="actual" type="People.RecentActivity.Core.feedObjectInfo">The actual.</param>
    /// <param name="skipVerifyCommentReaction" type="Boolean">if set to <c>true</c>, skip verifying comment and reaction data.</param>
    /// <param name="skipVerifyTimestamp" type="Boolean">if set to <c>true</c>, skip verifying the timestamp.</param>
    /// <param name="skipVerifyPhotosInAlbum" type="Boolean">if set to <c>true</c>, skip verifying the photos in an album.</param>
    /// <param name="expectNoComments" type="Boolean">if set to <c>true</c>, verify no comments present.</param>
    tc.isNotNull(actual);
    tc.areEqual(expected.id, actual.id);
    tc.areEqual(expected.sourceId, actual.sourceId);
    tc.areEqual(expected.type, actual.type);
    tc.areEqual(expected.url, actual.url);
    if (!skipVerifyTimestamp) {
        tc.areEqual(expected.timestamp, actual.timestamp);
    }
    else {
        tc.isNotNull(actual.timestamp);
    }

    switch (expected.type) {
        case People.RecentActivity.Core.FeedObjectInfoType.entry:
            People.RecentActivity.UnitTests.TestUtils._verifyFeedEntry(tc, expected.data, actual.data);
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
            People.RecentActivity.UnitTests.TestUtils._verifyAlbum(tc, expected.data, actual.data, skipVerifyPhotosInAlbum);
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            People.RecentActivity.UnitTests.TestUtils._verifyPhoto(tc, expected.data, actual.data);
            break;
    }

    if (!skipVerifyCommentReaction) {
        tc.areEqual(expected.commentDetails.count, actual.commentDetails.count);
        tc.areEqual(expected.commentDetails.permissions, actual.commentDetails.permissions);
        if (People.RecentActivity.Platform.AuthInfo.getInstance(People.RecentActivity.Core.NetworkId.facebook) != null) {
            if (expectNoComments) {
                tc.areEqual(0, actual.comments.length);
            }
            else {
	            tc.areEqual(expected.comments.length, actual.comments.length);
        	    for (var i = 0; i < expected.comments.length; i++) {
                	People.RecentActivity.UnitTests.TestUtils.verifyComment(tc, expected.comments[i], actual.comments[i]);
	         }
	    }

            tc.areEqual(expected.reactionDetails.length, actual.reactionDetails.length);
            for (var i = 0; i < expected.reactionDetails.length; i++) {
                tc.areEqual(expected.reactionDetails[i].id, actual.reactionDetails[i].id);
                tc.areEqual(expected.reactionDetails[i].count, actual.reactionDetails[i].count);
                tc.areEqual(expected.reactionDetails[i].permissions, actual.reactionDetails[i].permissions);
            }

            for (var i = 0; i < expected.reactions.length; i++) {
                People.RecentActivity.UnitTests.TestUtils.verifyReaction(tc, expected.reactions[i], actual.reactions[i]);
            }        
        }    
    }
};

People.RecentActivity.UnitTests.TestUtils.verifyPhotoTag = function(tc, expected, actual) {
    /// <param name="tc" type="Tx.TestContext">The test context.</param>
    /// <param name="expected" type="People.RecentActivity.Core.photoTagInfo"></param>
    /// <param name="actual" type="People.RecentActivity.Core.photoTagInfo"></param>
    tc.areEqual(expected.timestamp, actual.timestamp);
    tc.areEqual(expected.x, actual.x);
    tc.areEqual(expected.y, actual.y);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected.contact, actual.contact);
};

People.RecentActivity.UnitTests.TestUtils._verifyFeedEntry = function(tc, expected, actual) {
    /// <param name="expected" type="People.RecentActivity.Core.feedEntryInfo"></param>
    /// <param name="actual" type="People.RecentActivity.Core.feedEntryInfo"></param>
    switch (expected.type) {
        case People.RecentActivity.Core.FeedEntryInfoType.text:
            var expectedStatusData = expected.data;
            var actualStatusData = actual.data;
            tc.areEqual(expectedStatusData.text, actualStatusData.text);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.link:
            var expectedLinkData = expected.data;
            var actualLinkData = actual.data;
            tc.areEqual(expectedLinkData.caption, actualLinkData.caption);
            tc.areEqual(expectedLinkData.description, actualLinkData.description);
            tc.areEqual(expectedLinkData.text, actualLinkData.text);
            tc.areEqual(expectedLinkData.tile, actualLinkData.tile);
            tc.areEqual(expectedLinkData.title, actualLinkData.title);
            tc.areEqual(expectedLinkData.url, actualLinkData.url);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.video:
            var expectedVideoData = expected.data;
            var actualVideoData = actual.data;
            tc.areEqual(expectedVideoData.caption, actualVideoData.caption);
            tc.areEqual(expectedVideoData.description, actualVideoData.description);
            tc.areEqual(expectedVideoData.displayUrl, actualVideoData.displayUrl);
            tc.areEqual(expectedVideoData.sourceType, actualVideoData.sourceType);
            tc.areEqual(expectedVideoData.sourceUrl, actualVideoData.sourceUrl);
            tc.areEqual(expectedVideoData.text, actualVideoData.text);
            tc.areEqual(expectedVideoData.tile, actualVideoData.tile);
            tc.areEqual(expectedVideoData.title, actualVideoData.title);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.photoAlbum:
            var expectedAlbumData = expected.data;
            var actualAlbumData = actual.data;
            tc.areEqual(expectedAlbumData.text, actualAlbumData.text);
            tc.areEqual(expectedAlbumData.isTagged, actualAlbumData.isTagged);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, expectedAlbumData.album, actualAlbumData.album, true);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.photo:
            var expectedPhotoData = expected.data;
            var actualPhotoData = actual.data;
            tc.areEqual(expectedPhotoData.text, actualPhotoData.text);
            tc.areEqual(expectedPhotoData.isTagged, actualPhotoData.isTagged);
            // Skip verifying comments/reactions for the album here, since they are not yet retrieved yet.
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, expectedPhotoData.album, actualPhotoData.album, true);
            People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, expectedPhotoData.photo, actualPhotoData.photo, true);
            break;
    }

    tc.areEqual(expected.via, actual.via);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected.publisher, actual.publisher);
    People.RecentActivity.UnitTests.TestUtils._verifyEntities(tc, expected.entities, actual.entities);
    People.RecentActivity.UnitTests.TestUtils._verifyAnnotations(tc, expected.annotations, actual.annotations);
    tc.areEqual(expected.isShared, actual.isShared);
};

People.RecentActivity.UnitTests.TestUtils._verifyPhoto = function(tc, expected, actual) {
    /// <param name="expected" type="People.RecentActivity.Core.photoInfo"></param>
    /// <param name="actual" type="People.RecentActivity.Core.photoInfo"></param>
    tc.areEqual(expected.id, actual.id);
    tc.areEqual(expected.albumId, actual.albumId);
    tc.areEqual(expected.caption, actual.caption);
    tc.areEqual(expected.originalSource, actual.originalSource);
    tc.areEqual(expected.originalSourceHeight, actual.originalSourceHeight);
    tc.areEqual(expected.originalSourceWidth, actual.originalSourceWidth);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected.owner, actual.owner);
    People.RecentActivity.UnitTests.TestUtils._verifyEntities(tc, expected.entities, actual.entities);
};

People.RecentActivity.UnitTests.TestUtils._verifyEntities = function(tc, expected, actual) {
    /// <param name="expected" type="Array" elementType="entityInfo"></param>
    /// <param name="actual" type="Array" elementType="entityInfo"></param>
    tc.areEqual(expected.length, actual.length);
    for (var i = 0; i < expected.length; i++) {
        tc.areEqual(expected[i].length, actual[i].length);
        tc.areEqual(expected[i].offset, actual[i].offset);
        tc.areEqual(expected[i].type, actual[i].type);
        switch (expected[i].type) {
            case People.RecentActivity.Core.EntityInfoType.contact:
                People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected[i].data, actual[i].data);
                break;
            case People.RecentActivity.Core.EntityInfoType.link:
                var expectedEntity = expected[i].data;
                var actualEntity = actual[i].data;
                tc.areEqual(expectedEntity.url, actualEntity.url);
                tc.areEqual(expectedEntity.displayUrl, actualEntity.displayUrl);
                break;
        }    
    }
};

People.RecentActivity.UnitTests.TestUtils._verifyAnnotations = function(tc, expected, actual) {
    /// <param name="expected" type="Array" elementType="annotationInfo"></param>
    /// <param name="actual" type="Array" elementType="annotationInfo"></param>
    tc.areEqual(expected.length, actual.length);
    for (var i = 0; i < expected.length; i++) {
        tc.areEqual(expected[i].type, actual[i].type);
        People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected[i].data, actual[i].data);
    }
};

People.RecentActivity.UnitTests.TestUtils._verifyAlbum = function(tc, expected, actual, skipVerifyPhotosInAlbum) {
    /// <param name="expected" type="People.RecentActivity.Core.photoAlbumInfo"></param>
    /// <param name="actual" type="People.RecentActivity.Core.photoAlbumInfo"></param>
    /// <param name="skipVerifyPhotosInAlbum" type="Boolean"></param>
    tc.areEqual(expected.id, actual.id);
    tc.areEqual(expected.description, actual.description);
    tc.areEqual(expected.name, actual.name);
    tc.areEqual(expected.totalCount, actual.totalCount);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected.owner, actual.owner);
    People.RecentActivity.UnitTests.TestUtils._verifyEntities(tc, expected.entities, actual.entities);
    // Skip verifying comments/reactions for the cover photo here, since they are not yet retrieved yet.
    People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, expected.cover, actual.cover, true);
    if (skipVerifyPhotosInAlbum) {
        return;
    }

    tc.areEqual(expected.photos.length, actual.photos.length);
    for (var i = 0; i < expected.photos.length; i++) {
        // Skip verifying comments/reactions for the photos here, since they are not yet retrieved yet.
        People.RecentActivity.UnitTests.TestUtils.verifyFeedObject(tc, expected.photos[i], actual.photos[i], true);
    }
};

People.RecentActivity.UnitTests.TestUtils.verifyContact = function(tc, expected, actual) {
    /// <summary>
    ///     Verifies the contact.
    /// </summary>
    /// <param name="expected" type="People.RecentActivity.Core.contactInfo">The expected.</param>
    /// <param name="actual" type="People.RecentActivity.Core.contactInfo">The actual.</param>
    if (expected != null && actual != null) {
        tc.areEqual(expected.id, actual.id);
        tc.areEqual(expected.name, actual.name);
        tc.areEqual(expected.picture, actual.picture);
    }
    else {
        tc.areEqual(expected, actual);
    }
};

People.RecentActivity.UnitTests.TestUtils.verifyComment = function(tc, expected, actual) {
    /// <summary>
    ///     Verifies the comment.
    /// </summary>
    /// <param name="expected" type="People.RecentActivity.Core.commentInfo">The expected.</param>
    /// <param name="actual" type="People.RecentActivity.Core.commentInfo">The actual.</param>
    tc.areEqual(expected.id, actual.id);
    tc.areEqual(expected.text, actual.text);
    tc.areEqual(expected.timestamp, actual.timestamp);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected.publisher, actual.publisher);
};

People.RecentActivity.UnitTests.TestUtils.verifyAddedComment = function(tc, expected, actual) {
    /// <summary>
    ///     Verifies the added comment.
    /// </summary>
    /// <param name="expected" type="People.RecentActivity.Core.commentInfo">The expected.</param>
    /// <param name="actual" type="People.RecentActivity.Core.commentInfo">The actual.</param>
    tc.areEqual(expected.id, actual.id);
    tc.areEqual(expected.text, actual.text);
    tc.isNotNull(actual.timestamp);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, People.RecentActivity.UnitTests.TestUtils.getUserContactInfo(), actual.publisher);
};

People.RecentActivity.UnitTests.TestUtils.verifyAddedReaction = function(tc, expected, actual) {
    /// <summary>
    ///     Verifies the added reaction.
    /// </summary>
    /// <param name="expected" type="People.RecentActivity.Core.reactionInfo">The expected.</param>
    /// <param name="actual" type="People.RecentActivity.Core.reactionInfo">The actual.</param>
    tc.areEqual(expected.type.id, actual.type.id);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, People.RecentActivity.UnitTests.TestUtils.getUserContactInfo(), actual.publisher);
};

People.RecentActivity.UnitTests.TestUtils.verifyReaction = function(tc, expected, actual) {
    /// <summary>
    ///     Verifies the reaction.
    /// </summary>
    /// <param name="expected" type="People.RecentActivity.Core.reactionInfo">The expected.</param>
    /// <param name="actual" type="People.RecentActivity.Core.reactionInfo">The actual.</param>
    tc.areEqual(expected.type.id, actual.type.id);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected.publisher, actual.publisher);
};

People.RecentActivity.UnitTests.TestUtils.getNotificationData = function(notification, networkId) {
    /// <summary>
    ///     Gets an initialized notification.
    /// </summary>
    /// <param name="notification" type="People.RecentActivity.Core.notificationInfo">The notification to initialize.</param>
    /// <param name="networkId" type="String">The current network's ID.</param>
    /// <returns type="People.RecentActivity.Core.notificationInfo"></returns>
    var networkInfo = People.RecentActivity.UnitTests.TestUtils.getNetworkInfo(networkId);
    return People.RecentActivity.Core.create_notificationInfo(notification.id, notification.publisher, notification.timestamp, notification.message, notification.objectId, notification.objectType, notification.link, networkInfo.name, networkInfo.id, notification.isReply, notification.isShare, notification.isUnread);
};

People.RecentActivity.UnitTests.TestUtils.getNotificationsData = function(notifications, networkId) {
    /// <summary>
    ///     Gets an array of initialized notifications.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to initialize.</param>
    /// <param name="networkId" type="String">The current network's ID.</param>
    /// <returns type="Array" elementType="notificationInfo"></returns>
    var initializedNotifications = new Array(notifications.length);
    for (var i = 0; i < notifications.length; i++) {
        initializedNotifications[i] = People.RecentActivity.UnitTests.TestUtils.getNotificationData(notifications[i], networkId);
    }

    return initializedNotifications;
};

People.RecentActivity.UnitTests.TestUtils.verifyNotifications = function(tc, expected, actual, markedRead) {
    /// <summary>
    ///     Verifies the notifications.
    /// </summary>
    /// <param name="expected" type="Array" elementType="notificationInfo">The expected notifications.</param>
    /// <param name="actual" type="Array" elementType="notificationInfo">The actual notifications.</param>
    /// <param name="markedRead" type="Boolean">Whether the notifications have been marked read.</param>
    tc.areEqual(expected.length, actual.length);
    for (var i = 0; i < expected.length; i++) {
        People.RecentActivity.UnitTests.TestUtils.verifyNotification(tc, expected[i], actual[i], markedRead);
    }
};

People.RecentActivity.UnitTests.TestUtils.verifyNotification = function(tc, expected, actual, markedRead) {
    /// <summary>
    ///     Verifies the notification.
    /// </summary>
    /// <param name="expected" type="People.RecentActivity.Core.notificationInfo">The expected notification.</param>
    /// <param name="actual" type="People.RecentActivity.Core.notificationInfo">The actual notification.</param>
    /// <param name="markedRead" type="Boolean">Whether the notification has been marked read.</param>
    var expectedObjectId = expected.objectId;
    var expectedObjectType = expected.objectType;
    tc.areEqual(expected.id, actual.id);
    tc.areEqual(expected.timestamp, actual.timestamp);
    tc.areEqual(expected.message, actual.message);
    tc.areEqual(expected.link, actual.link);
    tc.areEqual(expected.via, actual.via);
    tc.areEqual(actual.sourceId, actual.sourceId);
    People.RecentActivity.UnitTests.TestUtils.verifyContact(tc, expected.publisher, actual.publisher);
    // Special validation for ObjectId and ObjectType.
    if (!Jx.isNonEmptyString(expectedObjectId) || expectedObjectType === People.RecentActivity.Core.NotificationInfoType.none) {
        var linkMatches = People.RecentActivity.UnitTests.TestUtils._fbPostMatch1.exec(expected.link);
        if (linkMatches != null) {
            expectedObjectId = People.Social.format('{0}_{1}', expected.publisher.id, linkMatches[1]);
            expectedObjectType = People.RecentActivity.Core.NotificationInfoType.entry;
        }    
    }

    if (!Jx.isNonEmptyString(expectedObjectId) || expectedObjectType === People.RecentActivity.Core.NotificationInfoType.none) {
        var linkMatches = People.RecentActivity.UnitTests.TestUtils._fbPostMatch2.exec(expected.link);
        if (linkMatches != null) {
            expectedObjectId = People.Social.format('{0}_{1}', linkMatches[2], linkMatches[1]);
            expectedObjectType = People.RecentActivity.Core.NotificationInfoType.entry;
        }    
    }

    if (!Jx.isNonEmptyString(expectedObjectId) || expectedObjectType === People.RecentActivity.Core.NotificationInfoType.none) {
        var linkMatches = People.RecentActivity.UnitTests.TestUtils._fbPhotoMatch.exec(expected.link);
        if (linkMatches != null) {
            expectedObjectId = expected.id + expected.message;
            expectedObjectType = People.RecentActivity.Core.NotificationInfoType.photo;
        }    
    }

    if (!Jx.isNonEmptyString(expectedObjectId) || expectedObjectType === People.RecentActivity.Core.NotificationInfoType.none) {
        var linkMatches = People.RecentActivity.UnitTests.TestUtils._fbAlbumMatch.exec(expected.link);
        if (linkMatches != null) {
            expectedObjectId = expected.message + expected.id;
            expectedObjectType = People.RecentActivity.Core.NotificationInfoType.photoAlbum;
        }    
    }

    tc.areEqual(expectedObjectId, actual.objectId);
    tc.areEqual(expectedObjectType, actual.objectType);
    // Special validation for IsUnread.
    if (!markedRead) {
        tc.areEqual(expected.isUnread, actual.isUnread);
    }
    else {
        tc.areEqual(false, actual.isUnread);
    }
};