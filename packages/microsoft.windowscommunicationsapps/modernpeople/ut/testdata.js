
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\AnnotationInfo.js" />
/// <reference path="..\Core\AnnotationInfoType.js" />
/// <reference path="..\Core\CommentDetailsInfo.js" />
/// <reference path="..\Core\CommentInfo.js" />
/// <reference path="..\Core\ContactInfo.js" />
/// <reference path="..\Core\EntityInfo.js" />
/// <reference path="..\Core\EntityInfoType.js" />
/// <reference path="..\Core\FeedEntryInfo.js" />
/// <reference path="..\Core\FeedEntryInfoType.js" />
/// <reference path="..\Core\FeedEntryLinkDataInfo.js" />
/// <reference path="..\Core\FeedEntryPhotoAlbumDataInfo.js" />
/// <reference path="..\Core\FeedEntryPhotoDataInfo.js" />
/// <reference path="..\Core\FeedEntryStatusDataInfo.js" />
/// <reference path="..\Core\FeedEntryVideoDataInfo.js" />
/// <reference path="..\Core\FeedEntryVideoDataInfoType.js" />
/// <reference path="..\Core\FeedObjectInfo.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\Helpers\DateTimeHelper.js" />
/// <reference path="..\Core\LinkEntityInfo.js" />
/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\Core\NotificationInfo.js" />
/// <reference path="..\Core\NotificationInfoType.js" />
/// <reference path="..\Core\Permissions.js" />
/// <reference path="..\Core\PhotoAlbumInfo.js" />
/// <reference path="..\Core\PhotoInfo.js" />
/// <reference path="..\Core\PhotoTagInfo.js" />
/// <reference path="..\Core\ReactionDetailsInfo.js" />
/// <reference path="..\Core\ReactionInfo.js" />
/// <reference path="..\Platform\Configuration.js" />
/// <reference path="TestUtils.js" />

People.RecentActivity.UnitTests.TestData = function() {
    /// <summary>
    ///     Provides common test data.
    /// </summary>
};

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "contacts", {
    get: function() {
        /// <summary>
        ///     Gets an array of test publishers.
        /// </summary>
        /// <value type="Array" elementType="contactInfo"></value>
        return [ People.RecentActivity.Core.create_contactInfo('10000001', 'Publisher1_SourceId', null, 'Publisher1_Name', 'Publisher1_Picture', true), People.RecentActivity.Core.create_contactInfo('10000002', 'Publisher2_SourceId', null, 'Publisher2_Name', 'Publisher2_Picture', false) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "comments", {
    get: function() {
        /// <summary>
        ///     Gets an array of test comments.
        /// </summary>
        /// <value type="Array" elementType="commentInfo"></value>
        return [ People.RecentActivity.Core.create_commentInfo('Comment1_ID', People.RecentActivity.UnitTests.TestData.contacts[0], People.RecentActivity.Core.DateTimeHelper.parseTimeStamp('2011-02-17T00:06:46Z').getTime(), 'Comment1_Text', new Array(0)), People.RecentActivity.Core.create_commentInfo('Comment2_ID', People.RecentActivity.UnitTests.TestData.contacts[1], People.RecentActivity.Core.DateTimeHelper.parseTimeStamp('2011-02-18T00:06:46Z').getTime(), 'Comment2_Text', new Array(0)) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "reactions", {
    get: function() {
        /// <summary>
        ///     Gets an array of reactions.
        /// </summary>
        /// <value type="Array" elementType="reactionInfo"></value>
        var facebookLike = People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.like);
        return [ People.RecentActivity.Core.create_reactionInfo(facebookLike, People.RecentActivity.UnitTests.TestData.contacts[0]), People.RecentActivity.Core.create_reactionInfo(facebookLike, People.RecentActivity.UnitTests.TestData.contacts[1]) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "reactionsWithUser", {
    get: function() {
        /// <summary>
        ///     Gets an array of reactions which includes the signed in user.
        /// </summary>
        /// <value type="Array" elementType="reactionInfo"></value>
        var facebookLike = People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.like);
        return [ People.RecentActivity.Core.create_reactionInfo(facebookLike, People.RecentActivity.UnitTests.TestUtils.getUserContactInfo()), People.RecentActivity.Core.create_reactionInfo(facebookLike, People.RecentActivity.UnitTests.TestData.contacts[0]) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "textEntries", {
    get: function() {
        /// <summary>
        ///     Gets an array of text entries.
        /// </summary>
        /// <value type="Array" elementType="feedObjectInfo"></value>
        var appMention = People.RecentActivity.UnitTests.TestData.contacts[1].name;
        var link = 'http://foo.com';
        var entityTestText = People.Social.format('Contains app mention {0}, link {1}', appMention, link);
        var contactEntity = People.RecentActivity.Core.create_entityInfo(People.RecentActivity.Core.EntityInfoType.contact, People.RecentActivity.UnitTests.TestData.contacts[1], entityTestText.indexOf(appMention), appMention.length);
        var linkEntity = People.RecentActivity.Core.create_entityInfo(People.RecentActivity.Core.EntityInfoType.link, People.RecentActivity.Core.create_linkEntityInfo(link, link), entityTestText.indexOf(link), link.length);
        return [ People.RecentActivity.Core.create_feedObjectInfo('TextEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.text, People.RecentActivity.UnitTests.TestData.contacts[0], People.RecentActivity.Core.create_feedEntryStatusDataInfo(entityTestText), 'TextEntry1_Via', [ contactEntity, linkEntity ], [ People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.wallPost, People.RecentActivity.UnitTests.TestData.contacts[1]) ], false), 'TextEntry2_Link', 1297901135000, People.RecentActivity.Core.create_commentDetailsInfo(2, true, People.RecentActivity.Core.Permissions.add), People.RecentActivity.UnitTests.TestData.comments, [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactions), People.RecentActivity.Core.create_feedObjectInfo('TextEntry2_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.text, People.RecentActivity.UnitTests.TestData.contacts[1], People.RecentActivity.Core.create_feedEntryStatusDataInfo('TextEntry2_Text'), 'TextEntry2_Via', new Array(0), new Array(0), false), 'TextEntry2_Link', 1297901185000, People.RecentActivity.Core.create_commentDetailsInfo(0, true, People.RecentActivity.Core.Permissions.none), new Array(0), [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 0, People.RecentActivity.Core.Permissions.none) ], new Array(0)) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "linkEntries", {
    get: function() {
        /// <summary>
        ///     Gets an array of link entries.
        /// </summary>
        /// <value type="Array" elementType="feedObjectInfo"></value>
        return [ People.RecentActivity.Core.create_feedObjectInfo('LinkEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.link, People.RecentActivity.UnitTests.TestData.contacts[1], People.RecentActivity.Core.create_feedEntryLinkDataInfo('shared a link', 'LinkEntry1_Url', 'LinkEntry1_Title', 'LinkEntry1_Caption', 'LinkEntry1_Description', 'LinkEntry1_Title'), 'LinkEntry1_Via', new Array(0), [ People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.wallPost, People.RecentActivity.UnitTests.TestData.contacts[1]) ], false), 'LinkEntry1_Link', 1297901035000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.none) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "videoEntries", {
    get: function() {
        /// <summary>
        ///     Gets an array of video entries.
        /// </summary>
        /// <value type="Array" elementType="feedObjectInfo"></value>
        return [ People.RecentActivity.Core.create_feedObjectInfo('VideoEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.video, People.RecentActivity.UnitTests.TestData.contacts[1], People.RecentActivity.Core.create_feedEntryVideoDataInfo('VideoEntry1_Text', 'VideoEntry1_Title', 'VideoEntry1_Caption', 'VideoEntry1_Description', 'VideoEntry1_Tile', People.RecentActivity.Core.FeedEntryVideoDataInfoType.raw, 'VideoEntry1_SourceUrl', 'VideoEntry1_DisplayUrl'), 'TextEntry1_Via', new Array(0), [ People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.wallPost, People.RecentActivity.UnitTests.TestData.contacts[1]) ], false), 'VideoEntry1_Link', 1297901035000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.none) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "albumEntries", {
    get: function() {
        /// <summary>
        ///     Gets an array of album entries.
        /// </summary>
        /// <value type="Array" elementType="feedObjectInfo"></value>
        return [ People.RecentActivity.Core.create_feedObjectInfo('AlbumEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.photoAlbum, People.RecentActivity.UnitTests.TestData.contacts[1], People.RecentActivity.Core.create_feedEntryPhotoAlbumDataInfo('AlbumEntry1_Text', People.RecentActivity.UnitTests.TestData.albums[0], (People.RecentActivity.UnitTests.TestData.albums[0].data).photos, false), 'AlbumEntry1_Via', new Array(0), [ People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.wallPost, People.RecentActivity.UnitTests.TestData.contacts[1]) ], true), 'AlbumEntry1_Link', 1297901035000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "photoEntries", {
    get: function() {
        /// <summary>
        ///     Gets an array of test photo entries.
        /// </summary>
        /// <value type="Array" elementType="feedObjectInfo"></value>
        return [ People.RecentActivity.Core.create_feedObjectInfo('PhotoEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.photo, People.RecentActivity.UnitTests.TestData.contacts[1], People.RecentActivity.Core.create_feedEntryPhotoDataInfo('PhotoEntry1_Text', People.RecentActivity.UnitTests.TestData.album2Photos[0], People.RecentActivity.UnitTests.TestData.albums[1], true), 'AlbumEntry1_Via', new Array(0), [ People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.wallPost, People.RecentActivity.UnitTests.TestData.contacts[1]) ], false), 'PhotoEntry1_Link', 1297901035000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "albums", {
    get: function() {
        /// <summary>
        ///     Gets an array of test albums.
        /// </summary>
        /// <value type="Array" elementType="feedObjectInfo"></value>
        var link = 'http://foo.com';
        var entityTestText = link;
        var linkEntity = People.RecentActivity.Core.create_entityInfo(People.RecentActivity.Core.EntityInfoType.link, People.RecentActivity.Core.create_linkEntityInfo(link, link), entityTestText.indexOf(link), link.length);
        return [ People.RecentActivity.Core.create_feedObjectInfo('1000001', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, People.RecentActivity.Core.create_photoAlbumInfo('Album1_Id', People.RecentActivity.UnitTests.TestData.contacts[0], 'Album1_Name', entityTestText, [ linkEntity ], 3, People.RecentActivity.UnitTests.TestData.album1Photos[0], People.RecentActivity.UnitTests.TestData.album1Photos), 'Album1_Link', 1297901035000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser), People.RecentActivity.Core.create_feedObjectInfo('1000002', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, People.RecentActivity.Core.create_photoAlbumInfo('Album2_Id', People.RecentActivity.UnitTests.TestData.contacts[0], 'Album2_Name', 'Album2_Description', new Array(0), 1, People.RecentActivity.UnitTests.TestData.album2Photos[0], People.RecentActivity.UnitTests.TestData.album2Photos), 'Album2_Link', 1297901035000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "album1Photos", {
    get: function() {
        /// <value type="Array" elementType="feedObjectInfo"></value>
        var photo1 = People.RecentActivity.Core.create_photoInfo('Photo1_Id', 'Album1_Id', People.RecentActivity.UnitTests.TestData.contacts[0], 'Photo1_Caption', 'Photo1_OriginalSource_o.jpg', 100, 100, 'Photo1_Source_n.jpg', 50, 50, 'Photo1_ThumbnailSource_a.jpg', 30, 30);
        photo1.tags = People.RecentActivity.UnitTests.TestData.photoTags;
        var photo2 = People.RecentActivity.Core.create_photoInfo('Photo2_Id', 'Album1_Id', People.RecentActivity.UnitTests.TestData.contacts[0], 'Photo2_Caption', '/oPhoto2_OriginalSource.jpg', 100, 100, '/nPhoto2_Source.jpg', 50, 50, '/aPhoto2_ThumbnailSource.jpg', 30, 30);
        photo2.index = 1;
        var photo3 = People.RecentActivity.Core.create_photoInfo('Photo3_Id', 'Album1_Id', People.RecentActivity.UnitTests.TestData.contacts[0], 'Photo3_Caption', 'Photo3_OriginalSource_o.jpg', 100, 100, 'Photo3_Source_n.jpg', 50, 50, 'Photo3_ThumbnailSource_a.jpg', 30, 30);
        photo3.tags = People.RecentActivity.UnitTests.TestData.photoTags;
        photo3.index = 2;
        return [ People.RecentActivity.Core.create_feedObjectInfo('20000001', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photo, photo1, 'Photo1_Link', 1307387038000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser), People.RecentActivity.Core.create_feedObjectInfo('20000002', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photo, photo2, 'Photo2_Link', 1307387038000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactions), People.RecentActivity.Core.create_feedObjectInfo('20000003', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photo, photo3, 'Photo3_Link', 1307387038000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "album2Photos", {
    get: function() {
        /// <value type="Array" elementType="feedObjectInfo"></value>
        var link1 = 'http://foo1.com';
        var link2 = 'http://foo2.com';
        var entityTestText = People.Social.format('{0} AND {1}', link1, link2);
        var linkEntity1 = People.RecentActivity.Core.create_entityInfo(People.RecentActivity.Core.EntityInfoType.link, People.RecentActivity.Core.create_linkEntityInfo(link1, link1), entityTestText.indexOf(link1), link1.length);
        var linkEntity2 = People.RecentActivity.Core.create_entityInfo(People.RecentActivity.Core.EntityInfoType.link, People.RecentActivity.Core.create_linkEntityInfo(link2, link2), entityTestText.indexOf(link2), link2.length);
        var photo4 = People.RecentActivity.Core.create_photoInfo('Photo4_Id', 'Album2_Id', People.RecentActivity.UnitTests.TestData.contacts[0], entityTestText, 'Photo4_OriginalSource_o.jpg', 100, 100, '/nPhoto4_Source.jpg', 50, 50, 'Photo4_ThumbnailSource_a.jpg', 30, 30);
        photo4.entities = [ linkEntity1, linkEntity2 ];
        return [ People.RecentActivity.Core.create_feedObjectInfo('20000004', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photo, photo4, 'Photo4_Link', 1307387038000, People.RecentActivity.Core.create_commentDetailsInfo(1, true, People.RecentActivity.Core.Permissions.add), [ People.RecentActivity.UnitTests.TestData.comments[1] ], [ People.RecentActivity.Core.create_reactionDetailsInfo('1', 2, People.RecentActivity.Core.Permissions.full) ], People.RecentActivity.UnitTests.TestData.reactionsWithUser) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "photoTags", {
    get: function() {
        /// <summary>
        ///     Gets an array of test photo tags.
        /// </summary>
        /// <value type="Array" elementType="photoTagInfo"></value>
        return [ People.RecentActivity.Core.create_photoTagInfo(People.RecentActivity.UnitTests.TestData.contacts[0], 50, 50, 1297901035000), People.RecentActivity.Core.create_photoTagInfo(People.RecentActivity.UnitTests.TestData.contacts[1], 50, 50, 1297901035000) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "notifications", {
    get: function() {
        /// <summary>
        ///     Gets an array of test notifications.
        /// </summary>
        /// <value type="Array" elementType="notificationInfo"></value>
        return [ People.RecentActivity.Core.create_notificationInfo('Notification1_ID', People.RecentActivity.UnitTests.TestData.contacts[0], 1297901035000, 'Notification1_Message', 'Notification1_ObjectId', People.RecentActivity.Core.NotificationInfoType.person, 'Notification1_Link', 'Notification1_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, true), People.RecentActivity.Core.create_notificationInfo('Notification2_ID', People.RecentActivity.UnitTests.TestData.contacts[1], 1307901035000, 'Notification2_Message', 'Notification2_ObjectId', People.RecentActivity.Core.NotificationInfoType.entry, 'Notification2_Link', 'Notification2_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, false), People.RecentActivity.Core.create_notificationInfo('Notification3_ID', People.RecentActivity.UnitTests.TestData.contacts[1], 1307945035000, 'Notification3_Message', 'Notification3_ObjectId', People.RecentActivity.Core.NotificationInfoType.none, 'Notification3_Link', 'Notification3_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, false), People.RecentActivity.Core.create_notificationInfo('Notification4_ID', People.RecentActivity.UnitTests.TestData.contacts[0], 1307375035000, 'Notification4_Message', 'Notification4_ObjectId', People.RecentActivity.Core.NotificationInfoType.photoAlbum, 'Notification4_Link', 'Notification4_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, false), People.RecentActivity.Core.create_notificationInfo('Notification5_ID', People.RecentActivity.UnitTests.TestData.contacts[0], 1307377035000, 'Notification5_Message', '', People.RecentActivity.Core.NotificationInfoType.none, 'http://www.facebook.com/fakeuser/posts/1234564434343', 'Notification5_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, false), People.RecentActivity.Core.create_notificationInfo('Notification6_ID', People.RecentActivity.UnitTests.TestData.contacts[0], 1307387035000, 'Notification6_Message', '', People.RecentActivity.Core.NotificationInfoType.none, 'http://www.facebook.com/permalink.php?story_fbid=58948109280948&id=843098304', 'Notification6_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, false), People.RecentActivity.Core.create_notificationInfo('Notification7_ID', People.RecentActivity.UnitTests.TestData.contacts[0], 1307387038000, 'Notification7_Message', '', People.RecentActivity.Core.NotificationInfoType.none, 'http://www.facebook.com/photo.php?fbid=43902840938409384&set=a.34738274.324324.123323232323&type=1', 'Notification7_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, false), People.RecentActivity.Core.create_notificationInfo('Notification8_ID', People.RecentActivity.UnitTests.TestData.contacts[0], 1308387038000, 'Notification8_Message', '', People.RecentActivity.Core.NotificationInfoType.none, 'http://www.facebook.com/album.php?fbid=12293830984908302984&id=90840923808&aid=48990384098304', 'Notification8_Via', People.RecentActivity.Core.NetworkId.facebook, false, false, false) ];
    }
});

Object.defineProperty(People.RecentActivity.UnitTests.TestData, "addFeedObject", {
    get: function() {
        /// <summary>
        ///     The object used to build the AddFeedObject response.
        /// </summary>
        /// <value type="People.RecentActivity.Core.feedObjectInfo"></value>
        var linkInfo = People.RecentActivity.Core.create_feedEntryLinkDataInfo('Test text', 'http://www.bing.com/', 'Bing!!!', 'www.bing.com', 'Check out the awesome.', 'http://www.bing.com/tile.png');
        var entryInfo = People.RecentActivity.Core.create_feedEntryInfo(People.RecentActivity.Core.FeedEntryInfoType.link, People.RecentActivity.UnitTests.TestUtils.getUserContactInfo(), linkInfo, null, new Array(0), new Array(0), false);
        return People.RecentActivity.Core.create_feedObjectInfo('1238583984934', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, entryInfo, null, 0, People.RecentActivity.Core.create_commentDetailsInfo(0, true, People.RecentActivity.Core.Permissions.full), new Array(0), new Array(0), new Array(0));
    }
});