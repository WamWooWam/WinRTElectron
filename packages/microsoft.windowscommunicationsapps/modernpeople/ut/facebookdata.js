
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\EntityInfoType.js" />
/// <reference path="..\Core\FeedEntryInfoType.js" />
/// <reference path="..\Core\FeedEntryVideoDataInfoType.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\NotificationInfoType.js" />
/// <reference path="..\Core\Permissions.js" />
/// <reference path="TestData.js" />
/// <reference path="TestUtils.js" />

People.RecentActivity.UnitTests.FacebookData = function() {
    /// <summary>
    ///     Test payload for Windows Live.
    /// </summary>
    /// <field name="_feedEntryPayloadTemplate" type="String" static="true"></field>
    /// <field name="_propertiesTemplate" type="String" static="true"></field>
    /// <field name="_messageTagsTemplate" type="String" static="true"></field>
    /// <field name="_feedEntrySampleReactionTemplate" type="String" static="true"></field>
    /// <field name="_commentPayloadTemplate" type="String" static="true"></field>
    /// <field name="_commentPlayloadWithObjectIdTemplate" type="String" static="true"></field>
    /// <field name="_commentsPayloadTemplate" type="String" static="true"></field>
    /// <field name="_likesPayloadTemplate" type="String" static="true"></field>
    /// <field name="_contactInfoQueryPayload" type="String" static="true"></field>
    /// <field name="_contactInfoSingleQueryPayload" type="String" static="true"></field>
    /// <field name="_commentAddedPayload" type="String" static="true"></field>
    /// <field name="_likePayload" type="String" static="true"></field>
    /// <field name="_likePayloadWithObjectId" type="String" static="true"></field>
    /// <field name="_notificationPayloadTemplate" type="String" static="true"></field>
    /// <field name="_notificationsPayloadTemplate" type="String" static="true"></field>
    /// <field name="_notificationsProfilePayloadTemplate" type="String" static="true"></field>
    /// <field name="_notificationsContactIdPayloadTemplate" type="String" static="true"></field>
    /// <field name="_notificationsPhotoIdPayloadTemplate" type="String" static="true"></field>
    /// <field name="_notificationsAlbumIdPayloadTemplate" type="String" static="true"></field>
    /// <field name="_fqlResultSetPayloadTemplate" type="String" static="true"></field>
    /// <field name="_albumPayloadTempalte" type="String" static="true"></field>
    /// <field name="_photoPayloadTemplate" type="String" static="true"></field>
    /// <field name="_photoTagPayloadTemplate" type="String" static="true"></field>
};


People.RecentActivity.UnitTests.FacebookData._feedEntryPayloadTemplate = '{\r\n                "post_id":"{0}",\r\n                "actor_id":{1},\r\n                "message":"{2}",\r\n                "created_time":{3},\r\n                "attribution":"{4}",\r\n                "attachment": {5},\r\n                {6},\r\n                "target_id":{7},\r\n                "permalink":"{8}",\r\n                "tagged_ids":[{9}],\r\n                "message_tags":{10}\r\n            }';
People.RecentActivity.UnitTests.FacebookData._propertiesTemplate = '{\r\n                "name":"By",\r\n                "text":"{0}"\r\n            },\r\n            {\r\n                "name":"Photos",\r\n                "text":"{1}"\r\n            }';
People.RecentActivity.UnitTests.FacebookData._messageTagsTemplate = '"{0}":[\r\n                {\r\n                    "id":{1},\r\n                    "name":"{2}",\r\n                    "type":"user",\r\n                    "offset":{0},\r\n                    "length":{3}\r\n                }\r\n            ]';
People.RecentActivity.UnitTests.FacebookData._feedEntrySampleReactionTemplate = '"comment_info":{ "can_comment":{0}, "comment_count":{1} }, "likes":{ "href":"http:\\/\\/www.facebook.com\\/social_graph.php?node_id=10150420203095467&class=LikeManager", "count":{2}, "sample":[ {3} ], "friends":[ {4} ], "user_likes":{5}, "can_like":{6} }';
People.RecentActivity.UnitTests.FacebookData._commentPayloadTemplate = '{\r\n               "fromid":{0},\r\n               "time":{1},\r\n               "text":"{2}",\r\n               "id":"{3}",\r\n               "likes":0,\r\n               "user_likes":false\r\n            }';
People.RecentActivity.UnitTests.FacebookData._commentPlayloadWithObjectIdTemplate = '{\r\n               "fromid":{0},\r\n               "time":{1},\r\n               "text":"{2}",\r\n               "id":"{3}",\r\n               "object_id":{4}\r\n            }';
People.RecentActivity.UnitTests.FacebookData._commentsPayloadTemplate = '{\r\n                "data":[\r\n                   {\r\n                      "name":"commentsInfo",\r\n                      "fql_result_set":[\r\n                         {0}\r\n                      ]\r\n                   },\r\n                   {1}\r\n                ]\r\n            }';
People.RecentActivity.UnitTests.FacebookData._likesPayloadTemplate = '{\r\n                "data":[\r\n                   {\r\n                      "name":"likesInfo",\r\n                      "fql_result_set":[\r\n                         {0}\r\n                      ]\r\n                   },\r\n                   {1}\r\n                ]\r\n            }';
People.RecentActivity.UnitTests.FacebookData._contactInfoQueryPayload = '{\r\n                "name":"profileInfo",\r\n                "fql_result_set":[\r\n                    {\r\n                        "id":10000002,\r\n                        "name":"Publisher2_Name",\r\n                        "pic_square":"Publisher2_Picture"\r\n                    }\r\n                ]\r\n            }';
People.RecentActivity.UnitTests.FacebookData._contactInfoSingleQueryPayload = '{\r\n                "id":{0},\r\n                "name":"{1}",\r\n                "pic_square":"{2}"\r\n            }';
People.RecentActivity.UnitTests.FacebookData._commentAddedPayload = '{"id": "{0}"}';
People.RecentActivity.UnitTests.FacebookData._likePayload = '{ "user_id":{0} }';
People.RecentActivity.UnitTests.FacebookData._likePayloadWithObjectId = '{ "user_id":{0}, "object_id":{1} }';
People.RecentActivity.UnitTests.FacebookData._notificationPayloadTemplate = '{\r\n            "notification_id":"{0}",\r\n            "sender_id":{1},\r\n            "updated_time":{2},\r\n            "title_text":"{3}",\r\n            "href":"{4}",\r\n            "is_unread":{5},\r\n            "object_id":"{6}",\r\n            "object_type":"{7}"\r\n         }';
People.RecentActivity.UnitTests.FacebookData._notificationsPayloadTemplate = '{\r\n                "data":[\r\n                   {\r\n                      "name":"notificationsInfo",\r\n                      "fql_result_set":[\r\n                         {0}\r\n                      ]\r\n                   },\r\n                   {1}\r\n                ]\r\n            }';
People.RecentActivity.UnitTests.FacebookData._notificationsProfilePayloadTemplate = '{\r\n                "name":"profileInfo",\r\n                "fql_result_set":[\r\n                    {\r\n                        "id":10000001,\r\n                        "name":"Publisher1_Name",\r\n                        "pic_square":"Publisher1_Picture"\r\n                    },\r\n                    {\r\n                        "id":10000002,\r\n                        "name":"Publisher2_Name",\r\n                        "pic_square":"Publisher2_Picture"\r\n                    }\r\n                ]\r\n           }';
People.RecentActivity.UnitTests.FacebookData._notificationsContactIdPayloadTemplate = '{\r\n                "id":{0},\r\n                "username":"{1}"\r\n            }';
People.RecentActivity.UnitTests.FacebookData._notificationsPhotoIdPayloadTemplate = '{\r\n                "object_id":{0},\r\n                "pid":"{1}"\r\n            }';
People.RecentActivity.UnitTests.FacebookData._notificationsAlbumIdPayloadTemplate = '{\r\n                "aid":"{0}",\r\n                "object_id":{1}\r\n            }';
People.RecentActivity.UnitTests.FacebookData._fqlResultSetPayloadTemplate = '{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }';
People.RecentActivity.UnitTests.FacebookData._albumPayloadTempalte = '{\r\n                "aid":"{0}",\r\n                "owner":{1},\r\n                "cover_pid":"{2}",\r\n                "name":"{3}",\r\n                "modified":{4},\r\n                "description":"{5}",\r\n                "size":{6},\r\n                "link":"{7}",\r\n                "object_id":{8}\r\n            }';
People.RecentActivity.UnitTests.FacebookData._photoPayloadTemplate = '{\r\n                "pid":"{0}",\r\n                "aid":"{1}",\r\n                "owner":"{2}",\r\n                "link":"{3}",\r\n                "caption":"{4}",\r\n                "object_id":{5},\r\n                "created":{6},\r\n                "src_big":"{7}",\r\n                "src_big_height":{8},\r\n                "src_big_width":{9},\r\n                "src":"{10}",\r\n                "src_height":{11},\r\n                "src_width":{12},\r\n                "src_small":"{13}",\r\n                "src_small_height":{14},\r\n                "src_small_width":{15}\r\n            }';
People.RecentActivity.UnitTests.FacebookData._photoTagPayloadTemplate = '{\r\n                "subject":{0},\r\n                "xcoord":{1},\r\n                "ycoord":{2},\r\n                "created":{3}\r\n            }';

People.RecentActivity.UnitTests.FacebookData.getFeedEntryPayload = function(entry) {
    /// <summary>
    ///     Gets the feed entry payload.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.Core.feedObjectInfo">The entry.</param>
    /// <returns type="String"></returns>
    var attachment = null;
    var message = null;
    var entryInfo = entry.data;
    switch (entryInfo.type) {
        case People.RecentActivity.Core.FeedEntryInfoType.link:
            var link = entryInfo.data;
            message = link.text;
            attachment = People.Social.format('{\r\n                             "media":[\r\n                                {\r\n                                   "href":"",\r\n                                   "alt":"",\r\n                                   "type":"{0}",\r\n                                   "src":"{1}"\r\n                                }\r\n                             ],\r\n                             "name":"{2}",\r\n                             "href":"{3}",\r\n                             "caption":"{4}",\r\n                             "description":"{5}",\r\n                             "properties":{},\r\n                             "icon":"http:\\/\\/photos-d.ak.fbcdn.net\\/photos-ak-snc1\\/v43\\/247\\/30713015083\\/app_2_30713015083_1733.gif"\r\n                          }', 'link', link.tile, link.title, link.url, link.caption, link.description);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.video:
            var video = entryInfo.data;
            message = video.text;
            attachment = People.Social.format('{\r\n                             "media":[\r\n                                {\r\n                                   "href":"",\r\n                                   "alt":"",\r\n                                   "type":"{0}",\r\n                                   "src":"{1}",\r\n                                   "video":\r\n                                   {\r\n                                       "display_url":"{2}",\r\n                                       "source_url":"{3}",\r\n                                       "source_type":"{4}"\r\n                                   }\r\n                                }\r\n                             ],\r\n                             "name":"{5}",\r\n                             "caption":"{6}",\r\n                             "description":"{7}",\r\n                             "properties":{},\r\n                             "icon":"http:\\/\\/photos-d.ak.fbcdn.net\\/photos-ak-snc1\\/v43\\/247\\/30713015083\\/app_2_30713015083_1733.gif"\r\n                            }', 'video', video.tile, video.displayUrl, video.sourceUrl, People.RecentActivity.UnitTests.FacebookData._getVideoType(video.sourceType), video.title, video.caption, video.description);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.photo:
            var photoDataInfo = entryInfo.data;
            var album = photoDataInfo.album.data;
            var photo = photoDataInfo.photo.data;
            message = photoDataInfo.text;
            attachment = People.Social.format('{\r\n                                "media":[\r\n                                {\r\n                                   "href":"",\r\n                                   "alt":"",\r\n                                   "type":"{0}",\r\n                                   "photo":\r\n                                   {\r\n                                       "aid":"{1}",\r\n                                       "pid":"{2}",\r\n                                       "owner":{3},\r\n                                       "index":{4}\r\n                                   }\r\n                                }\r\n                             ],\r\n                             "name":"",\r\n                             "caption":"",\r\n                             "description":"",\r\n                             "properties":[],\r\n                             "icon":""\r\n                             }', 'photo', album.id, photo.id, photo.owner.id, photo.index + 1);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.photoAlbum:
            var albumDataInfo = entryInfo.data;
            album = albumDataInfo.album.data;
            message = albumDataInfo.text;
            var properties = '';
            if (entryInfo.isShared) {
                properties = People.Social.format('{\r\n                "name":"By",\r\n                "text":"{0}"\r\n            },\r\n            {\r\n                "name":"Photos",\r\n                "text":"{1}"\r\n            }', album.owner.name, album.photos.length);
            }

            attachment = People.Social.format('{\r\n                             "media":[\r\n                                {\r\n                                   "type":"photo",\r\n                                   "photo":\r\n                                   {\r\n                                       "aid":"{0}",\r\n                                       "pid":"{1}",\r\n                                       "owner":{7},\r\n                                       "index":{2}\r\n                                   }\r\n                                },\r\n                                {\r\n                                   "type":"photo",\r\n                                   "photo":\r\n                                   {\r\n                                       "aid":"{0}",\r\n                                       "pid":"{3}",\r\n                                       "owner":{7},\r\n                                       "index":{4}\r\n                                   }\r\n                                },\r\n                                {\r\n                                   "type":"photo",\r\n                                   "photo":\r\n                                   {\r\n                                       "aid":"{0}",\r\n                                       "pid":"{5}",\r\n                                       "owner":{7},\r\n                                       "index":{6}\r\n                                   }\r\n                                }\r\n                             ],\r\n                             "name":"",\r\n                             "caption":"",\r\n                             "description":"",\r\n                             "properties":[{8}],\r\n                             "icon":""\r\n                             }', album.id, (album.photos[0].data).id, (album.photos[0].data).index + 1, (album.photos[1].data).id, (album.photos[1].data).index + 1, (album.photos[2].data).id, (album.photos[2].data).index + 1, parseInt(entryInfo.publisher.id), properties);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.text:
            var status = entryInfo.data;
            message = status.text;
            attachment = '{"description":""}';
            break;
    }

    var commentList = People.RecentActivity.UnitTests.FacebookData._getCommentsList(entry.comments);
    var sampleLikePublisherId = null;
    var friendLikePublisherId = null;
    var userLike = false;
    for (var n = 0; n < entry.reactions.length; n++) {
        var reaction = entry.reactions[n];
        if (reaction.publisher.id === People.RecentActivity.UnitTests.TestUtils.getUserContactInfo().id) {
            userLike = true;
        }

        if (friendLikePublisherId == null && reaction.publisher.isFriend) {
            friendLikePublisherId = reaction.publisher.id;
        }
        else if (sampleLikePublisherId == null && !reaction.publisher.isFriend) {
            sampleLikePublisherId = reaction.publisher.id;
        }    
    }

    var reactions = People.Social.format(
        '"comment_info":{ "can_comment":{0}, "comment_count":{1} }, "likes":{ "href":"http:\\/\\/www.facebook.com\\/social_graph.php?node_id=10150420203095467&class=LikeManager", "count":{2}, "sample":[ {3} ], "friends":[ {4} ], "user_likes":{5}, "can_like":{6} }',
        !!(entry.commentDetails.permissions & People.RecentActivity.Core.Permissions.add),
        entry.commentDetails.count,
        entry.reactionDetails[0].count,
        sampleLikePublisherId,
        friendLikePublisherId,
        userLike,
        !!(entry.reactionDetails[0].permissions & People.RecentActivity.Core.Permissions.add));

    var tags = People.RecentActivity.UnitTests.FacebookData._getMessageTagList((entry.data).entities);
    var messageTags = (!Jx.isNonEmptyString(tags)) ? '[]' : '{' + tags + '}';
    return People.Social.format('{\r\n                "post_id":"{0}",\r\n                "actor_id":{1},\r\n                "message":"{2}",\r\n                "created_time":{3},\r\n                "attribution":"{4}",\r\n                "attachment": {5},\r\n                {6},\r\n                "target_id":{7},\r\n                "permalink":"{8}",\r\n                "tagged_ids":[{9}],\r\n                "message_tags":{10}\r\n            }', entry.id, parseInt(entryInfo.publisher.id), message, entry.timestamp / 1000, entryInfo.via, attachment, reactions, parseInt((entryInfo.annotations[0].data).id), entry.url, People.RecentActivity.UnitTests.TestData.contacts[1].id, messageTags);
};

People.RecentActivity.UnitTests.FacebookData.getContactPayload = function(contact) {
    /// <summary>
    ///     Gets the contact payload.
    /// </summary>
    /// <param name="contact" type="People.RecentActivity.Core.contactInfo">The contact.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "id":{0},\r\n                "name":"{1}",\r\n                "pic_square":"{2}"\r\n            }', contact.id, contact.name, contact.picture);
};

People.RecentActivity.UnitTests.FacebookData.getContactList = function(contacts) {
    /// <summary>
    ///     Gets the payload for an array of contacts.
    /// </summary>
    /// <param name="contacts" type="Array" elementType="contactInfo">The contacts.</param>
    /// <returns type="String"></returns>
    var contactList = [];
    for (var n = 0; n < contacts.length; n++) {
        var contact = contacts[n];
        contactList.push(People.RecentActivity.UnitTests.FacebookData.getContactPayload(contact));
    }

    return contactList.join(',');
};

People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload = function(contacts) {
    /// <summary>
    ///     Gets the contact result set payload.
    /// </summary>
    /// <param name="contacts" type="Array" elementType="contactInfo">The contacts.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'profileInfo', People.RecentActivity.UnitTests.FacebookData.getContactList(contacts));
};

People.RecentActivity.UnitTests.FacebookData.getFeedResultSetPayload = function(entries) {
    /// <summary>
    ///     Gets the feed result set payload.
    /// </summary>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'feedInfo', People.RecentActivity.UnitTests.FacebookData._getFeedObjectList(entries));
};

People.RecentActivity.UnitTests.FacebookData.getAlbumResultSetPayload = function(albums) {
    /// <summary>
    ///     Gets the album result set payload.
    /// </summary>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The albums.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'albumInfo', People.RecentActivity.UnitTests.FacebookData._getFeedObjectList(albums));
};

People.RecentActivity.UnitTests.FacebookData.refreshAlbumsPayload = function(albums) {
    /// <summary>
    ///     Gets the response payload for RefreshAlbums call.
    /// </summary>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The albums.</param>
    /// <returns type="String"></returns>
    var albumResultSet = People.RecentActivity.UnitTests.FacebookData.getAlbumResultSetPayload(albums);
    var photos = [];
    for (var n = 0; n < albums.length; n++) {
        var album = albums[n];
        photos.push((album.data).cover);
    }

    var photoResultSet = People.RecentActivity.UnitTests.FacebookData.getPhotoResultSetPayload(photos);
    var profileResultSet = People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload(People.RecentActivity.UnitTests.TestData.contacts);
    return People.Social.format('{ "data":[{0},{1},{2}] }', albumResultSet, photoResultSet, profileResultSet);
};

People.RecentActivity.UnitTests.FacebookData.getFeedPayload = function(entries) {
    /// <summary>
    ///     Gets the response payload for getting a feed or a feed entry.
    /// </summary>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                    "data":[\r\n                        {0},\r\n                        {1}\r\n                    ]\r\n                }', People.RecentActivity.UnitTests.FacebookData.getFeedResultSetPayload(entries), People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload(People.RecentActivity.UnitTests.TestData.contacts));
};

People.RecentActivity.UnitTests.FacebookData.getFeedObjectPayload = function(feedObject) {
    /// <summary>
    ///     Gets the response payload for adding a feed object.
    /// </summary>
    /// <param name="feedObject" type="People.RecentActivity.Core.feedObjectInfo">The added feed object.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{"id":"{0}"}', feedObject.id);
};

People.RecentActivity.UnitTests.FacebookData.getAlbumsPayload = function(albums) {
    /// <summary>
    ///     Gets the response payload for GetFeedObject call for an album.
    /// </summary>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The albums.</param>
    /// <returns type="String"></returns>
    var albumResultSet = People.RecentActivity.UnitTests.FacebookData.getAlbumResultSetPayload(albums);
    var photos = [];
    for (var n = 0; n < albums.length; n++) {
        var album = albums[n];
        photos.push((album.data).cover);
    }

    var photoResultSet = People.RecentActivity.UnitTests.FacebookData.getPhotoResultSetPayload(photos);
    var commentResultSet = People.RecentActivity.UnitTests.FacebookData.getCommentResultSetPayload(albums);
    var reactionResultSet = People.RecentActivity.UnitTests.FacebookData.getReactionResultSetPayload(albums);
    var profileResultSet = People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload(People.RecentActivity.UnitTests.TestData.contacts);
    return People.Social.format('{\r\n                    "data":[\r\n                        {0},\r\n                        {1},\r\n                        {2},\r\n                        {3},\r\n                        {4}\r\n                    ]\r\n                }', albumResultSet, photoResultSet, commentResultSet, reactionResultSet, profileResultSet);
};

People.RecentActivity.UnitTests.FacebookData.getPhotosPayload = function(photos) {
    /// <summary>
    ///     Gets the photos payload.
    /// </summary>
    /// <param name="photos" type="Array" elementType="feedObjectInfo">The photos.</param>
    /// <returns type="String"></returns>
    var photoResultSet = People.RecentActivity.UnitTests.FacebookData.getPhotoResultSetPayload(photos);
    var commentResultSet = People.RecentActivity.UnitTests.FacebookData.getCommentResultSetPayload(photos);
    var reactionResultSet = People.RecentActivity.UnitTests.FacebookData.getReactionResultSetPayload(photos);
    var profileResultSet = People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload(People.RecentActivity.UnitTests.TestData.contacts);
    return People.Social.format('{\r\n                    "data":[\r\n                        {0},\r\n                        {1},\r\n                        {2},\r\n                        {3}\r\n                    ]\r\n                }', photoResultSet, commentResultSet, reactionResultSet, profileResultSet);
};

People.RecentActivity.UnitTests.FacebookData.refreshAlbumPayload = function(album, photos) {
    /// <summary>
    ///     Refreshes the album payload.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.Core.feedObjectInfo">The album.</param>
    /// <param name="photos" type="Array" elementType="feedObjectInfo">The photos.</param>
    /// <returns type="String"></returns>
    var photoResultSet = People.RecentActivity.UnitTests.FacebookData.getPhotoResultSetPayload(photos);
    var profileResultSet = People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload(People.RecentActivity.UnitTests.TestData.contacts);
    var albumResultSet = People.RecentActivity.UnitTests.FacebookData.getAlbumResultSetPayload([ album ]);
    return People.Social.format('{\r\n                    "data":[\r\n                        {0},\r\n                        {1},\r\n                        {2}\r\n                    ]\r\n                }', photoResultSet, profileResultSet, albumResultSet);
};

People.RecentActivity.UnitTests.FacebookData.getPhotoResultSetPayload = function(photos) {
    /// <summary>
    ///     Gets the photo result set payload.
    /// </summary>
    /// <param name="photos" type="Array" elementType="feedObjectInfo">The photos.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'photoInfo', People.RecentActivity.UnitTests.FacebookData._getFeedObjectList(photos));
};

People.RecentActivity.UnitTests.FacebookData.refreshPhotoPayload = function(photo, tags) {
    /// <summary>
    ///     Gets the photo refresh payload.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Core.feedObjectInfo">The photo.</param>
    /// <param name="tags" type="Array" elementType="photoTagInfo">The tags.</param>
    /// <returns type="String"></returns>
    var contacts = [];
    for (var n = 0; n < tags.length; n++) {
        var tag = tags[n];
        contacts.push(tag.contact);
    }

    return People.Social.format('{\r\n                    "data":[\r\n                        {0},\r\n                        {1},\r\n                        {2}\r\n                    ]\r\n                }', People.RecentActivity.UnitTests.FacebookData.getPhotoTagResultSetPayload(tags), People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload(contacts), People.RecentActivity.UnitTests.FacebookData.getPhotoResultSetPayload([ photo ]));
};

People.RecentActivity.UnitTests.FacebookData.getPhotoTagResultSetPayload = function(tags) {
    /// <summary>
    ///     Gets the photo tag result set payload.
    /// </summary>
    /// <param name="tags" type="Array" elementType="photoTagInfo">The tags.</param>
    /// <returns type="String"></returns>
    var tagList = [];
    for (var n = 0; n < tags.length; n++) {
        var tag = tags[n];
        tagList.push(People.Social.format('{\r\n                "subject":{0},\r\n                "xcoord":{1},\r\n                "ycoord":{2},\r\n                "created":{3}\r\n            }', tag.contact.id, tag.x, tag.y, tag.timestamp / 1000));
    }

    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'photoTagInfo', tagList.join(','));
};

People.RecentActivity.UnitTests.FacebookData.getCommentResultSetPayload = function(objs) {
    /// <summary>
    ///     Gets the comment result set payload.
    /// </summary>
    /// <param name="objs" type="Array" elementType="feedObjectInfo">The objs.</param>
    /// <returns type="String"></returns>
    var commentList = [];
    for (var n = 0; n < objs.length; n++) {
        var obj = objs[n];
        for (var o = 0; o < obj.comments.length; o++) {
            var comment = obj.comments[o];
            commentList.push(People.Social.format('{\r\n               "fromid":{0},\r\n               "time":{1},\r\n               "text":"{2}",\r\n               "id":"{3}",\r\n               "object_id":{4}\r\n            }', comment.publisher.id, comment.timestamp / 1000, comment.text, comment.id, obj.id));
        }    
    }

    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'commentsInfo', commentList.join(','));
};

People.RecentActivity.UnitTests.FacebookData.getReactionResultSetPayload = function(objs) {
    /// <summary>
    ///     Gets the reaction result set payload.
    /// </summary>
    /// <param name="objs" type="Array" elementType="feedObjectInfo">The objs.</param>
    /// <returns type="String"></returns>
    var reactionList = [];
    for (var n = 0; n < objs.length; n++) {
        var obj = objs[n];
        for (var o = 0; o < obj.reactions.length; o++) {
            var reaction = obj.reactions[o];
            reactionList.push(People.Social.format('{ "user_id":{0}, "object_id":{1} }', reaction.publisher.id, obj.id));
        }    
    }

    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'likesInfo', reactionList.join(','));
};

People.RecentActivity.UnitTests.FacebookData.getCommentPayload = function(comment) {
    /// <summary>
    ///     Gets the comment payload.
    /// </summary>
    /// <param name="comment" type="People.RecentActivity.Core.commentInfo">The comment.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n               "fromid":{0},\r\n               "time":{1},\r\n               "text":"{2}",\r\n               "id":"{3}",\r\n               "likes":0,\r\n               "user_likes":false\r\n            }', parseInt(comment.publisher.id), comment.timestamp / 1000, comment.text, comment.id);
};

People.RecentActivity.UnitTests.FacebookData.getCommentAddedPayload = function(comment) {
    /// <summary>
    ///     Gets the comment added payload.
    /// </summary>
    /// <param name="comment" type="People.RecentActivity.Core.commentInfo">The comment.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{"id": "{0}"}', comment.id);
};

People.RecentActivity.UnitTests.FacebookData.getCommentsPayload = function(comments) {
    /// <summary>
    ///     Gets the comments payload.
    /// </summary>
    /// <param name="comments" type="Array" elementType="commentInfo">The comments.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "data":[\r\n                   {\r\n                      "name":"commentsInfo",\r\n                      "fql_result_set":[\r\n                         {0}\r\n                      ]\r\n                   },\r\n                   {1}\r\n                ]\r\n            }', People.RecentActivity.UnitTests.FacebookData._getCommentsList(comments), '{\r\n                "name":"profileInfo",\r\n                "fql_result_set":[\r\n                    {\r\n                        "id":10000002,\r\n                        "name":"Publisher2_Name",\r\n                        "pic_square":"Publisher2_Picture"\r\n                    }\r\n                ]\r\n            }');
};

People.RecentActivity.UnitTests.FacebookData.getLikesPayload = function(reactions) {
    /// <summary>
    ///     Gets the likes payload.
    /// </summary>
    /// <param name="reactions" type="Array" elementType="reactionInfo">The reactions.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "data":[\r\n                   {\r\n                      "name":"likesInfo",\r\n                      "fql_result_set":[\r\n                         {0}\r\n                      ]\r\n                   },\r\n                   {1}\r\n                ]\r\n            }', People.RecentActivity.UnitTests.FacebookData._getLikesList(reactions), '{\r\n                "name":"profileInfo",\r\n                "fql_result_set":[\r\n                    {\r\n                        "id":10000002,\r\n                        "name":"Publisher2_Name",\r\n                        "pic_square":"Publisher2_Picture"\r\n                    }\r\n                ]\r\n            }');
};

People.RecentActivity.UnitTests.FacebookData.getNotificationPayload = function(notification) {
    /// <summary>
    ///     Gets the notification payload.
    /// </summary>
    /// <param name="notification" type="People.RecentActivity.Core.notificationInfo">The notification.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n            "notification_id":"{0}",\r\n            "sender_id":{1},\r\n            "updated_time":{2},\r\n            "title_text":"{3}",\r\n            "href":"{4}",\r\n            "is_unread":{5},\r\n            "object_id":"{6}",\r\n            "object_type":"{7}"\r\n         }', notification.id, notification.publisher.id, notification.timestamp / 1000, notification.message, notification.link, (notification.isUnread) ? '1' : '0', notification.objectId, People.RecentActivity.UnitTests.FacebookData._getNotificationInfoType(notification.objectType));
};

People.RecentActivity.UnitTests.FacebookData.getNotificationsPayload = function(notifications) {
    /// <summary>
    ///     Gets the notifications payload.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications.</param>
    /// <returns type="String"></returns>
    return People.Social.format('{\r\n                "data":[\r\n                   {\r\n                      "name":"notificationsInfo",\r\n                      "fql_result_set":[\r\n                         {0}\r\n                      ]\r\n                   },\r\n                   {1}\r\n                ]\r\n            }', People.RecentActivity.UnitTests.FacebookData._getNotificationsList(notifications), '{\r\n                "name":"profileInfo",\r\n                "fql_result_set":[\r\n                    {\r\n                        "id":10000001,\r\n                        "name":"Publisher1_Name",\r\n                        "pic_square":"Publisher1_Picture"\r\n                    },\r\n                    {\r\n                        "id":10000002,\r\n                        "name":"Publisher2_Name",\r\n                        "pic_square":"Publisher2_Picture"\r\n                    }\r\n                ]\r\n           }');
};

People.RecentActivity.UnitTests.FacebookData.getNotificationsContactIdPayload = function(notifications) {
    /// <summary>
    ///     Gets the notifications contact ID payload.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications.</param>
    /// <returns type="String"></returns>
    var fbPostMatch1 = new RegExp('^https?://[^/]+/([^/]+)/posts/([^/?&]+)$', 'i');
    var contactIdPayload = [];
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        var matches = fbPostMatch1.exec(notification.link);
        if (matches != null) {
            contactIdPayload.push(People.Social.format('{\r\n                "id":{0},\r\n                "username":"{1}"\r\n            }', notification.publisher.id, matches[1]));
        }    
    }

    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'profileInfo', contactIdPayload.join(',\n'));
};

People.RecentActivity.UnitTests.FacebookData.getNotificationsPhotoIdPayload = function(notifications) {
    /// <summary>
    ///     Gets the notifications photo ID payload.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications.</param>
    /// <returns type="String"></returns>
    var fbPhotoMatch = new RegExp('^https?://[^/]+/photo\\.php\\?fbid=([^&]+)&set=[^&]+&type=1$', 'i');
    var photoIdPayload = [];
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        var matches = fbPhotoMatch.exec(notification.link);
        if (matches != null) {
            var objectId = matches[1];
            var number = parseInt(objectId);
            if (objectId !== number.toString()) {
                objectId = '"' + objectId + '"';
            }

            photoIdPayload.push(People.Social.format('{\r\n                "object_id":{0},\r\n                "pid":"{1}"\r\n            }', objectId, notification.id + notification.message));
        }    
    }

    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'photoInfo', photoIdPayload.join(',\n'));
};

People.RecentActivity.UnitTests.FacebookData.getNotificationsAlbumIdPayload = function(notifications) {
    /// <summary>
    ///     Gets the notifications album ID payload.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications.</param>
    /// <returns type="String"></returns>
    var fbAlbumMatch = new RegExp('^https?://[^/]+/album\\.php\\?fbid=([^&]+)&id=[^&]+&aid=[^&]+$', 'i');
    var albumIdPayload = [];
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        var matches = fbAlbumMatch.exec(notification.link);
        if (matches != null) {
            var objectId = matches[1];
            var number = parseInt(objectId);
            if (objectId !== number.toString()) {
                objectId = '"' + objectId + '"';
            }

            albumIdPayload.push(People.Social.format('{\r\n                "aid":"{0}",\r\n                "object_id":{1}\r\n            }', notification.message + notification.id, objectId));
        }    
    }

    return People.Social.format('{\r\n                "name":"{0}",\r\n                "fql_result_set":[\r\n                    {1}\r\n                ]\r\n            }', 'albumInfo', albumIdPayload.join(',\n'));
};

People.RecentActivity.UnitTests.FacebookData._getFeedObjectList = function(objs) {
    /// <param name="objs" type="Array" elementType="feedObjectInfo"></param>
    /// <returns type="String"></returns>
    var objList = [];
    for (var n = 0; n < objs.length; n++) {
        var obj = objs[n];
        switch (obj.type) {
            case People.RecentActivity.Core.FeedObjectInfoType.entry:
                objList.push(People.RecentActivity.UnitTests.FacebookData.getFeedEntryPayload(obj));
                break;
            case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
                objList.push(People.RecentActivity.UnitTests.FacebookData._getAlbumPayload(obj));
                break;
            case People.RecentActivity.Core.FeedObjectInfoType.photo:
                objList.push(People.RecentActivity.UnitTests.FacebookData._getPhotoPayload(obj));
                break;
        }    
    }

    return objList.join(',');
};

People.RecentActivity.UnitTests.FacebookData._getAlbumPayload = function(album) {
    /// <param name="album" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <returns type="String"></returns>
    var albumInfo = album.data;
    return People.Social.format('{\r\n                "aid":"{0}",\r\n                "owner":{1},\r\n                "cover_pid":"{2}",\r\n                "name":"{3}",\r\n                "modified":{4},\r\n                "description":"{5}",\r\n                "size":{6},\r\n                "link":"{7}",\r\n                "object_id":{8}\r\n            }', albumInfo.id, albumInfo.owner.id, (albumInfo.cover.data).id, albumInfo.name, album.timestamp / 1000, albumInfo.description, albumInfo.totalCount, album.url, album.id);
};

People.RecentActivity.UnitTests.FacebookData._getPhotoPayload = function(photo) {
    /// <param name="photo" type="People.RecentActivity.Core.feedObjectInfo"></param>
    /// <returns type="String"></returns>
    var photoInfo = photo.data;
    return People.Social.format('{\r\n                "pid":"{0}",\r\n                "aid":"{1}",\r\n                "owner":"{2}",\r\n                "link":"{3}",\r\n                "caption":"{4}",\r\n                "object_id":{5},\r\n                "created":{6},\r\n                "src_big":"{7}",\r\n                "src_big_height":{8},\r\n                "src_big_width":{9},\r\n                "src":"{10}",\r\n                "src_height":{11},\r\n                "src_width":{12},\r\n                "src_small":"{13}",\r\n                "src_small_height":{14},\r\n                "src_small_width":{15}\r\n            }', photoInfo.id, photoInfo.albumId, photoInfo.owner.id, photo.url, photoInfo.caption, photo.id, photo.timestamp / 1000, photoInfo.originalSource, photoInfo.originalSourceHeight, photoInfo.originalSourceWidth, photoInfo.source, photoInfo.sourceHeight, photoInfo.sourceWidth, photoInfo.thumbnailSource, photoInfo.thumbnailSourceHeight, photoInfo.thumbnailSourceWidth);
};

People.RecentActivity.UnitTests.FacebookData._getLikesList = function(reactions) {
    /// <param name="reactions" type="Array" elementType="reactionInfo"></param>
    /// <returns type="String"></returns>
    var reactionList = [];
    for (var n = 0; n < reactions.length; n++) {
        var reaction = reactions[n];
        reactionList.push(People.Social.format('{ "user_id":{0} }', reaction.publisher.id));
    }

    return reactionList.join(',');
};

People.RecentActivity.UnitTests.FacebookData._getCommentsList = function(comments) {
    /// <param name="comments" type="Array" elementType="commentInfo"></param>
    /// <returns type="String"></returns>
    var commentList = [];
    for (var n = 0; n < comments.length; n++) {
        var comment = comments[n];
        commentList.push(People.RecentActivity.UnitTests.FacebookData.getCommentPayload(comment));
    }

    return commentList.join(',');
};

People.RecentActivity.UnitTests.FacebookData._getNotificationsList = function(notifications) {
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    /// <returns type="String"></returns>
    var notificationList = [];
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        notificationList.push(People.RecentActivity.UnitTests.FacebookData.getNotificationPayload(notification));
    }

    return notificationList.join(',\n');
};

People.RecentActivity.UnitTests.FacebookData._getMessageTagList = function(entities) {
    /// <param name="entities" type="Array" elementType="entityInfo"></param>
    /// <returns type="String"></returns>
    var tags = [];
    for (var n = 0; n < entities.length; n++) {
        var entity = entities[n];
        if (entity.type === People.RecentActivity.Core.EntityInfoType.contact) {
            var contact = entity.data;
            tags.push(People.Social.format('"{0}":[\r\n                {\r\n                    "id":{1},\r\n                    "name":"{2}",\r\n                    "type":"user",\r\n                    "offset":{0},\r\n                    "length":{3}\r\n                }\r\n            ]', entity.offset, contact.id, contact.name, entity.length));
        }    
    }

    return tags.join(',');
};

People.RecentActivity.UnitTests.FacebookData._getNotificationInfoType = function(objectType) {
    /// <param name="objectType" type="People.RecentActivity.Core.NotificationInfoType"></param>
    /// <returns type="String"></returns>
    switch (objectType) {
        case People.RecentActivity.Core.NotificationInfoType.person:
            return 'friend';
        case People.RecentActivity.Core.NotificationInfoType.entry:
            return 'stream';
        case People.RecentActivity.Core.NotificationInfoType.photo:
            return 'photo';
        case People.RecentActivity.Core.NotificationInfoType.photoAlbum:
            return 'album';
        case People.RecentActivity.Core.NotificationInfoType.video:
            return 'video';
        case People.RecentActivity.Core.NotificationInfoType.none:
            return '';
        default:
            return 'event';
    }
};

People.RecentActivity.UnitTests.FacebookData._getVideoType = function(videoType) {
    /// <param name="videoType" type="People.RecentActivity.Core.FeedEntryVideoDataInfoType"></param>
    /// <returns type="String"></returns>
    switch (videoType) {
        case People.RecentActivity.Core.FeedEntryVideoDataInfoType.embed:
            return 'html';
        case People.RecentActivity.Core.FeedEntryVideoDataInfoType.raw:
            return 'raw';
        default:
            return 'none';
    }
};