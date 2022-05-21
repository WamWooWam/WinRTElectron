
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People, "loadSocialProviders", function () {

People.loadSocialProviders = Jx.fnEmpty;

People.loadSocialImports();
People.loadSocialCore();
People.loadSocialPlatform();

/// <disable>JS2076.IdentifierIsMiscased</disable>
var InstruPropertyId = Microsoft.WindowsLive.Instrumentation.PropertyId;
var InstruScenarioId = Microsoft.WindowsLive.Instrumentation.ScenarioId;
var InstruApiId = Microsoft.WindowsLive.Instrumentation.ApiId;
var InstruErrorType = Microsoft.WindowsLive.Instrumentation.ErrorType;
/// <enable>JS2076.IdentifierIsMiscased</enable>

;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents cache location.
/// </summary>
People.RecentActivity.Providers.CacheLocation = {
    /// <field name="none" type="Number" integer="true" static="true">Unknown location.</field>
    none: 0,
    /// <field name="contactDataCache" type="Number" integer="true" static="true">In contact data cache(e.g. FeedCache or AlbumCache)</field>
    contactDataCache: 1,
    /// <field name="feedObjectCache" type="Number" integer="true" static="true">In feed object cache.</field>
    feedObjectCache: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_feedObjectRefreshInfo = function(objectsAdded, objectsUpdated, objectsRemoved) {
    var o = { };
    if (objectsAdded == null) {
        objectsAdded = new Array(0);
    }

    if (objectsUpdated == null) {
        objectsUpdated = new Array(0);
    }

    if (objectsRemoved == null) {
        objectsRemoved = new Array(0);
    }

    o.objectsAdded = objectsAdded;
    o.objectsUpdated = objectsUpdated;
    o.objectsRemoved = objectsRemoved;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_feedObjectSearchResult = function(obj, location) {
    var o = { };
    o.feedObject = obj;
    o.location = location;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_notificationRefreshInfo = function(notificationsAdded, notificationsUpdated, notificationsRemoved) {
    var o = { };
    if (notificationsAdded == null) {
        notificationsAdded = new Array(0);
    }

    if (notificationsUpdated == null) {
        notificationsUpdated = new Array(0);
    }

    if (notificationsRemoved == null) {
        notificationsRemoved = new Array(0);
    }

    o.notificationsAdded = notificationsAdded;
    o.notificationsUpdated = notificationsUpdated;
    o.notificationsRemoved = notificationsRemoved;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_photoTagRefreshInfo = function(tagsAdded, tagsRemoved) {
    var o = { };
    if (tagsAdded == null) {
        tagsAdded = new Array(0);
    }

    if (tagsRemoved == null) {
        tagsRemoved = new Array(0);
    }

    o.photoTagsAdded = tagsAdded;
    o.photoTagsRemoved = tagsRemoved;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_resourceRefreshInfo = function(resourcesAdded, resourcesUpdated, resourcesRemoved) {
    var o = { };
    o.resourcesAdded = resourcesAdded;
    o.resourcesUpdated = resourcesUpdated;
    o.resourcesRemoved = resourcesRemoved;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_commentRefreshInfo = function(commentsAdded, commentsRemoved) {
    var o = { };
    if (commentsAdded == null) {
        commentsAdded = new Array(0);
    }

    if (commentsRemoved == null) {
        commentsRemoved = new Array(0);
    }

    o.commentsAdded = commentsAdded;
    o.commentsRemoved = commentsRemoved;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_reactionRefreshInfo = function(reactionsAdded, reactionsRemoved) {
    var o = { };
    if (reactionsAdded == null) {
        reactionsAdded = new Array(0);
    }

    if (reactionsRemoved == null) {
        reactionsRemoved = new Array(0);
    }

    o.reactionsAdded = reactionsAdded;
    o.reactionsRemoved = reactionsRemoved;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represent user identity type.
/// </summary>
People.RecentActivity.Providers.IdentityType = {
    /// <field name="person" type="Number" integer="true" static="true">Person Id.</field>
    person: 0,
    /// <field name="contact" type="Number" integer="true" static="true">Contact Id.</field>
    contact: 1
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.create_socialNodeContext = function(userIdentity) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(userIdentity), 'userIdentity');
    o.userIdentity = userIdentity;
    o.photoMap = {};
    o.albumMap = {};
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\..\Platform\ContactId.js" />
/// <reference path="AlbumInfoCollection.js" />
/// <reference path="CommentInfoCollection.js" />
/// <reference path="CommentRefreshInfo.js" />
/// <reference path="ContactDataCacheDictionary.js" />
/// <reference path="FeedEntryInfoCollection.js" />
/// <reference path="FeedObjectCache.js" />
/// <reference path="FeedObjectRefreshInfo.js" />
/// <reference path="FeedObjectSearchResult.js" />
/// <reference path="ReactionInfoCollection.js" />
/// <reference path="ReactionRefreshInfo.js" />

People.RecentActivity.Providers.ContactDataCache = function(userIdentity, cacheDict) {
    /// <summary>
    ///     Provides common functionalities to access contact data in cache.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <param name="cacheDict" type="People.RecentActivity.Providers.ContactDataCacheDictionary">The instance of <see cref="T:People.RecentActivity.Providers.ContactDataCacheDictionary" /> to access cache.</param>
    /// <field name="_userIdentity" type="String"></field>
    /// <field name="_cacheDict" type="People.RecentActivity.Providers.ContactDataCacheDictionary"></field>
    /// <field name="_feedObjectCache" type="People.RecentActivity.Providers.FeedObjectCache"></field>
    Debug.assert(Jx.isNonEmptyString(userIdentity), 'userIdentity');
    Debug.assert(cacheDict != null, 'cacheDict');
    this._userIdentity = userIdentity;
    this._cacheDict = cacheDict;
    this._feedObjectCache = People.RecentActivity.Providers.FeedObjectCache.getInstance(userIdentity);
};


People.RecentActivity.Providers.ContactDataCache.prototype._userIdentity = null;
People.RecentActivity.Providers.ContactDataCache.prototype._cacheDict = null;
People.RecentActivity.Providers.ContactDataCache.prototype._feedObjectCache = null;

Object.defineProperty(People.RecentActivity.Providers.ContactDataCache.prototype, "cacheDictionary", {
    get: function() {
        /// <summary>
        ///     Gets the cache dictionary.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.ContactDataCacheDictionary"></value>
        return this._cacheDict;
    }
});

Object.defineProperty(People.RecentActivity.Providers.ContactDataCache.prototype, "userIdentity", {
    get: function() {
        /// <summary>
        ///     Gets the user identity for this cache.
        /// </summary>
        /// <value type="String"></value>
        return this._userIdentity;
    }
});

People.RecentActivity.Providers.ContactDataCache.prototype.addComment = function(contactId, feedObject, comment) {
    /// <summary>
    ///     Adds a comment for a cached feed object.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment.</param>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(feedObject != null, 'feedObject');
    Debug.assert(comment != null, 'comment');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    var objects = this._cacheDict.item(contactId);
    var result = this.getObjectByObjectInfo(objects, feedObject);
    feedObject = result.feedObject;
    var commentCollection = new People.RecentActivity.Providers.CommentInfoCollection(feedObject.comments);
    commentCollection.add(comment);
    feedObject.comments = commentCollection.toArray();
    feedObject.commentDetails.count = commentCollection.count;
    this.commit(result, contactId, objects);
};

People.RecentActivity.Providers.ContactDataCache.prototype.refreshComments = function(contactId, feedObject, comments) {
    /// <summary>
    ///     Refreshes the comments for a cached feed object.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="comments" type="Array" elementType="commentInfo">The comments.</param>
    /// <returns type="People.RecentActivity.Providers.commentRefreshInfo"></returns>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(feedObject != null, 'feedObject');
    Debug.assert(comments != null, 'comments');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return People.RecentActivity.Providers.create_commentRefreshInfo(comments, new Array(0));
    }

    var objects = this._cacheDict.item(contactId);
    var result = this.getObjectByObjectInfo(objects, feedObject);
    var cachedObj = result.feedObject;
    var commentCollection = new People.RecentActivity.Providers.CommentInfoCollection(feedObject.comments);
    var refreshInfo = commentCollection.refresh(comments);
    var updated = false;
    if (refreshInfo.commentsAdded.length > 0 || refreshInfo.commentsRemoved.length > 0) {
        cachedObj.comments = commentCollection.toArray();
        cachedObj.commentDetails.count = feedObject.commentDetails.count;
        updated = true;
    }

    if (updated || !result.location) {
        // If the cached object is updated or the object is not yet in cache, commit it to cache.
        this.commit(result, contactId, objects);
    }

    return refreshInfo;
};

People.RecentActivity.Providers.ContactDataCache.prototype.addReaction = function(contactId, feedObject, reaction) {
    /// <summary>
    ///     Adds a reaction for a cached feed object.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(feedObject != null, 'feedObject');
    Debug.assert(reaction != null, 'reaction');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    var objects = this._cacheDict.item(contactId);
    var result = this.getObjectByObjectInfo(objects, feedObject);
    feedObject = result.feedObject;
    var reactionCollection = new People.RecentActivity.Providers.ReactionInfoCollection(feedObject.reactions);
    reactionCollection.add(reaction);
    feedObject.reactions = reactionCollection.toArray();
    var reactionDetail = this._getReactionDetailsInfo(feedObject, reaction);
    Debug.assert(reactionDetail != null, 'reactionDetail != null');
    reactionDetail.count++;
    this.commit(result, contactId, objects);
};

People.RecentActivity.Providers.ContactDataCache.prototype.refreshReactions = function(contactId, feedObject, reactions) {
    /// <summary>
    ///     Refreshes the reactions for a cached feed object.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="reactions" type="Array" elementType="reactionInfo">The reactions.</param>
    /// <returns type="People.RecentActivity.Providers.reactionRefreshInfo"></returns>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(feedObject != null, 'feedObject');
    Debug.assert(reactions != null, 'reactions');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return People.RecentActivity.Providers.create_reactionRefreshInfo(reactions, new Array(0));
    }

    var objects = this._cacheDict.item(contactId);
    var result = this.getObjectByObjectInfo(objects, feedObject);
    var cachedObj = result.feedObject;
    var reactionCollection = new People.RecentActivity.Providers.ReactionInfoCollection(feedObject.reactions);
    var refreshInfo = reactionCollection.refresh(reactions);
    var updated = false;
    if (refreshInfo.reactionsAdded.length > 0 || refreshInfo.reactionsRemoved.length > 0) {
        cachedObj.reactions = reactionCollection.toArray();
        cachedObj.reactionDetails = feedObject.reactionDetails;
        updated = true;
    }

    if (updated || !result.location) {
        // If the cached object is updated or the object is not yet in cache, commit it to cache.
        this.commit(result, contactId, objects);
    }

    return refreshInfo;
};

People.RecentActivity.Providers.ContactDataCache.prototype.removeReaction = function(contactId, feedObject, reaction) {
    /// <summary>
    ///     Removes a reaction for a cached feed object.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(feedObject != null, 'feedObject');
    Debug.assert(reaction != null, 'reaction');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    var objects = this._cacheDict.item(contactId);
    var result = this.getObjectByObjectInfo(objects, feedObject);
    feedObject = result.feedObject;
    var reactionCollection = new People.RecentActivity.Providers.ReactionInfoCollection(feedObject.reactions);
    if (!reactionCollection.remove(reaction)) {
        return;
    }

    feedObject.reactions = reactionCollection.toArray();
    var reactionDetail = this._getReactionDetailsInfo(feedObject, reaction);
    Debug.assert(reactionDetail != null, 'reactionDetail');
    reactionDetail.count--;
    this.commit(result, contactId, objects);
};

People.RecentActivity.Providers.ContactDataCache.prototype.removeFeedObject = function(contactId, feedObject) {
    /// <summary>
    ///     Removes a cached top level feed object(feed entry or album).
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(feedObject != null, 'feedObject');
    Debug.assert(feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry || feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'type');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    var cachedObjs = this.cacheDictionary.item(contactId);
    // No object found.
    if (!cachedObjs.length) {
        return;
    }

    var objCollection = this.getCollection(cachedObjs);
    if (objCollection.remove(feedObject)) {
        // Only update cache if the collection is changed.
        cachedObjs = objCollection.toArray();
        this.addCacheEntry(contactId, cachedObjs);
    }
};

People.RecentActivity.Providers.ContactDataCache.prototype.addCacheEntry = function(contactId, objects) {
    /// <summary>
    ///     Adds a cache entry for the contact.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="objects" type="Array" elementType="feedObjectInfo">The objects to cache.</param>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(objects != null, 'objects');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    this._cacheDict.add(contactId, objects);
};

People.RecentActivity.Providers.ContactDataCache.prototype.removeCacheEntry = function(contactId) {
    /// <summary>
    ///     Removes the cache entry for a contact.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    Debug.assert(contactId != null, 'contactId != null');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    this._cacheDict.remove(contactId);
};

People.RecentActivity.Providers.ContactDataCache.prototype.clear = function() {
    /// <summary>
    ///     Clear all cached contacts' feed objects for the user.
    /// </summary>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    this._cacheDict.clear();
};

People.RecentActivity.Providers.ContactDataCache.prototype.refreshFeedObjects = function(contactId, feedObjs) {
    /// <summary>
    ///     Refreshes the cached top level objects(feed entries or albums) with newly retrieved objects.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="feedObjs" type="Array" elementType="feedObjectInfo">The new objects.</param>
    /// <returns type="People.RecentActivity.Providers.feedObjectRefreshInfo"></returns>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(feedObjs != null, 'feedObjs');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return People.RecentActivity.Providers.create_feedObjectRefreshInfo(feedObjs, new Array(0), new Array(0));
    }

    var cachedObjs = this.cacheDictionary.item(contactId);
    var objCollection = this.getCollection(cachedObjs);
    var refreshInfo = objCollection.refresh(feedObjs);
    if (refreshInfo.objectsAdded.length > 0 || refreshInfo.objectsRemoved.length > 0 || refreshInfo.objectsUpdated.length > 0) {
        feedObjs = objCollection.toArray();
        this.addCacheEntry(contactId, feedObjs);
    }

    return refreshInfo;
};

People.RecentActivity.Providers.ContactDataCache.prototype.getFeedObjects = function(contactId) {
    /// <summary>
    ///     Gets the cached top level feed objects(feed entry or album) for a user's contact.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <returns type="Array" elementType="feedObjectInfo"></returns>
    Debug.assert(contactId != null, 'contactId');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return new Array(0);
    }

    // When offline, only retrieve cache if the last update time is within 72 hours.
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        var lastUpdateTime = this._cacheDict.getLastUpdateTime(contactId);
        if ((lastUpdateTime == null) || (new Date().getTime() - lastUpdateTime.getTime()) / 1000 > People.RecentActivity.Platform.Configuration.instance.offlineCacheRetrievalThreshold) {
            return new Array(0);
        }    
    }

    return this._cacheDict.item(contactId);
};

People.RecentActivity.Providers.ContactDataCache.prototype.addMoreFeedObjects = function(contactId, objs) {
    /// <summary>
    ///     Adds more feed objects to cache. (only for top leve objects: entry and album).
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="objs" type="Array" elementType="feedObjectInfo">The objs.</param>
    if (objs == null || !objs.length) {
        return;
    }

    var type = objs[0].type;
    Debug.assert(type === People.RecentActivity.Core.FeedObjectInfoType.entry || type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'type');
    var cachedObjs = this.getFeedObjects(contactId);
    var collection = (type === People.RecentActivity.Core.FeedObjectInfoType.entry) ? new People.RecentActivity.Providers.FeedEntryInfoCollection(cachedObjs) : new People.RecentActivity.Providers.AlbumInfoCollection(cachedObjs);
    collection.merge(objs);
    this.addCacheEntry(contactId, collection.toArray());
};

People.RecentActivity.Providers.ContactDataCache.prototype.getObjectByObjectInfo = function(objects, objectInfo) {
    /// <summary>
    ///     Gets the feed object by object info.
    /// </summary>
    /// <param name="objects" type="Array" elementType="feedObjectInfo">The objects to search.</param>
    /// <param name="objectInfo" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object info.</param>
    /// <returns type="People.RecentActivity.Providers.feedObjectSearchResult"></returns>
    var cachedObjs = this.getCollection(objects);
    var cachedObj = (objectInfo.type !== People.RecentActivity.Core.FeedObjectInfoType.photo) ? cachedObjs.findObjectByInfo(objectInfo) : new People.RecentActivity.Providers.AlbumInfoCollection(objects).findPhotoByInfo(objectInfo);
    if (cachedObj != null) {
        return People.RecentActivity.Providers.create_feedObjectSearchResult(cachedObj, 1);
    }

    cachedObj = this._feedObjectCache.getFeedObjectByInfo(objectInfo);
    if (cachedObj != null) {
        return People.RecentActivity.Providers.create_feedObjectSearchResult(cachedObj, 2);
    }

    Jx.log.write(3, People.Social.format('GetObjectByObjectInfo: object with type {0} and Id {1} is not found in cache!', objectInfo.type, objectInfo.id));
    // We return the passed in object as is.
    return People.RecentActivity.Providers.create_feedObjectSearchResult(objectInfo, 0);
};

People.RecentActivity.Providers.ContactDataCache.prototype.commit = function(result, contactId, objects) {
    /// <summary>
    ///     Commits the changed content back to cache.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Providers.feedObjectSearchResult">The cache search result.</param>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="objects" type="Array" elementType="feedObjectInfo">The cached objects.</param>
    if (result.location === 1) {
        this.addCacheEntry(contactId, objects);
    }
    else {
        this._feedObjectCache.addFeedObject(result.feedObject);
    }
};

People.RecentActivity.Providers.ContactDataCache.prototype._getReactionDetailsInfo = function(feedObject, reaction) {
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <returns type="People.RecentActivity.Core.create_reactionDetailsInfo"></returns>
    for (var n = 0; n < feedObject.reactionDetails.length; n++) {
        var reactionDetail = feedObject.reactionDetails[n];
        if (reaction.type.id === reactionDetail.id) {
            return reactionDetail;
        }    
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\..\Platform\ContactId.js" />
/// <reference path="..\Helpers\SocialHelper.js" />
/// <reference path="AlbumDictionary.js" />
/// <reference path="AlbumInfoCollection.js" />
/// <reference path="ContactDataCache.js" />
/// <reference path="FeedObjectInfoCollection.js" />
/// <reference path="FeedObjectRefreshInfo.js" />
/// <reference path="PhotoInfoCollection.js" />
/// <reference path="PhotoTagInfoCollection.js" />
/// <reference path="PhotoTagRefreshInfo.js" />

People.RecentActivity.Providers.AlbumCache = function(userIdentity) {
    /// <summary>
    ///     Provides access to album cache.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <field name="_instances$1" type="Object" static="true">A map of instances, keyed by user's identity.</field>
    People.RecentActivity.Providers.ContactDataCache.call(this, userIdentity, new People.RecentActivity.Providers.AlbumDictionary(userIdentity));
};

Jx.inherit(People.RecentActivity.Providers.AlbumCache, People.RecentActivity.Providers.ContactDataCache);


People.RecentActivity.Providers.AlbumCache._instances$1 = {};

People.RecentActivity.Providers.AlbumCache.getInstance = function(userIdentity) {
    /// <summary>
    ///     Gets the album cache for a user.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <returns type="People.RecentActivity.Providers.AlbumCache"></returns>
    Debug.assert(userIdentity != null, 'userIdentity');
    if (!!Jx.isUndefined(People.RecentActivity.Providers.AlbumCache._instances$1[userIdentity])) {
        People.RecentActivity.Providers.AlbumCache._instances$1[userIdentity] = new People.RecentActivity.Providers.AlbumCache(userIdentity);
    }

    return People.RecentActivity.Providers.AlbumCache._instances$1[userIdentity];
};

People.RecentActivity.Providers.AlbumCache.prototype.getAlbums = function(contactId) {
    /// <summary>
    ///     Gets the cached albums for a user's contact.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <returns type="Array" elementType="feedObjectInfo"></returns>
    return this.getFeedObjects(contactId);
};

People.RecentActivity.Providers.AlbumCache.prototype.refreshAlbums = function(contactId, albums) {
    /// <summary>
    ///     Refreshes the cached albums with newly retrieved albums.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The new albums.</param>
    /// <returns type="People.RecentActivity.Providers.feedObjectRefreshInfo"></returns>
    return this.refreshFeedObjects(contactId, albums);
};

People.RecentActivity.Providers.AlbumCache.prototype.refreshAlbum = function(contactId, album, photos) {
    /// <summary>
    ///     Refreshes an album in the cache, including its meta data and photos.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo">The album.</param>
    /// <param name="photos" type="Array" elementType="feedObjectInfo">The photos.</param>
    /// <returns type="People.RecentActivity.Providers.feedObjectRefreshInfo"></returns>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(album != null, 'album');
    Debug.assert(photos != null, 'photos');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return People.RecentActivity.Providers.create_feedObjectRefreshInfo(photos, new Array(0), new Array(0));
    }

    var cachedAlbums = this.cacheDictionary.item(contactId);
    var result = this.getObjectByObjectInfo(cachedAlbums, album);
    var albumUpdated = false;
    if (!!result.location) {
        // Refresh the album meta data first.
        albumUpdated = People.RecentActivity.Providers.SocialHelper.updateAlbum(result.feedObject, album);
    }

    var albumInfo = result.feedObject.data;
    if (albumInfo.totalCount !== photos.length) {
        albumInfo.totalCount = photos.length;
        albumUpdated = true;
    }

    var photoCollection = new People.RecentActivity.Providers.PhotoInfoCollection((album.data).photos);
    var refreshInfo = photoCollection.refresh(photos);
    if (refreshInfo.objectsAdded.length > 0 || refreshInfo.objectsRemoved.length > 0 || refreshInfo.objectsUpdated.length > 0) {
        albumInfo.photos = photoCollection.toArray();
        albumUpdated = true;
    }

    if (albumUpdated || !result.location) {
        // If the cached object is updated or the object is not yet in cache, commit it to cache.
        this.commit(result, contactId, cachedAlbums);
    }

    return refreshInfo;
};

People.RecentActivity.Providers.AlbumCache.prototype.refreshPhoto = function(contactId, photo, photoTags) {
    /// <summary>
    ///     Refreshes a photo in the cache, including its meta data and photo tags.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <param name="photoTags" type="Array" elementType="photoTagInfo">The photo tags.</param>
    /// <returns type="People.RecentActivity.Providers.photoTagRefreshInfo"></returns>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(photo != null, 'photo');
    Debug.assert(photoTags != null, 'photoTags');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return People.RecentActivity.Providers.create_photoTagRefreshInfo(photoTags, new Array(0));
    }

    var cachedAlbums = this.cacheDictionary.item(contactId);
    var result = this.getObjectByObjectInfo(cachedAlbums, photo);
    var photoUpdated = false;
    if (!!result.location) {
        // Refresh the photo meta data first.
        photoUpdated = People.RecentActivity.Providers.SocialHelper.updatePhoto(result.feedObject, photo);
    }

    var photoInfo = result.feedObject.data;
    var photoTagCollection = new People.RecentActivity.Providers.PhotoTagInfoCollection((photo.data).tags);
    var refreshInfo = photoTagCollection.refresh(photoTags);
    if (refreshInfo.photoTagsAdded.length > 0 || refreshInfo.photoTagsRemoved.length > 0) {
        photoInfo.tags = photoTagCollection.toArray();
        photoUpdated = true;
    }

    if (photoUpdated || !result.location) {
        // If the cached object is updated or the object is not yet in cache, commit it to cache.
        this.commit(result, contactId, cachedAlbums);
    }

    return refreshInfo;
};

People.RecentActivity.Providers.AlbumCache.prototype.findObjectById = function(contactId, id, type) {
    /// <summary>
    ///     Finds the cached object by id.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="id" type="String">The id.</param>
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType">The type.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum || type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'type');
    var albums = this.getFeedObjects(contactId);
    var albumCollection = new People.RecentActivity.Providers.AlbumInfoCollection(albums);
    if (type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum) {
        return albumCollection.findObjectById(id);
    }
    else {
        return albumCollection.findPhotoById(id);
    }
};

People.RecentActivity.Providers.AlbumCache.prototype.getCollection = function(feedObjs) {
    /// <summary>
    ///     Gets the corresponding collection for the feed objects.
    /// </summary>
    /// <param name="feedObjs" type="Array" elementType="feedObjectInfo">The feed objects.</param>
    /// <returns type="People.RecentActivity.Providers.FeedObjectInfoCollection"></returns>
    return new People.RecentActivity.Providers.AlbumInfoCollection(feedObjs);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="Cache.js" />

People.RecentActivity.Providers.CacheDictionary = function(userIdentity, type) {
    /// <summary>
    ///     Represents a virtual dictionary for cached data, which contains common logics to limit the number of cached
    ///     entries and kick out stalest entry upon overflow.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <param name="type" type="String">The cache type.</param>
    /// <field name="_cachedEntryListKey" type="String"></field>
    /// <field name="_cachedEntryKeyPrefix" type="String"></field>
    /// <field name="_userIdentity" type="String"></field>
    /// <field name="_cachedEntryList" type="Array">
    ///     Keeps track of current cached entries for this user, sorted by access time, so cachedEntryList[0] is always
    ///     least accessed. This list is cached too with the key in the format of userIdentity_datatype.
    
    /// </field>
    Debug.assert(Jx.isNonEmptyString(userIdentity), 'userIdentity');
    Debug.assert(Jx.isNonEmptyString(type), 'type');
    this._userIdentity = userIdentity;
    this._cachedEntryListKey = this._userIdentity + '_' + type;
    this._cachedEntryKeyPrefix = this._cachedEntryListKey;
    this._initializeCachedEntryList();
    People.RecentActivity.Providers.Cache.events.addListener("quotaexceeded", this._onQuotaExceeded, this);
};


People.RecentActivity.Providers.CacheDictionary.prototype._cachedEntryListKey = null;
People.RecentActivity.Providers.CacheDictionary.prototype._cachedEntryKeyPrefix = null;
People.RecentActivity.Providers.CacheDictionary.prototype._userIdentity = null;
People.RecentActivity.Providers.CacheDictionary.prototype._cachedEntryList = null;

Object.defineProperty(People.RecentActivity.Providers.CacheDictionary.prototype, "count", {
    get: function() {
        /// <summary>
        ///     Gets the count of cached entries for the user.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._cachedEntryList.length;
    }
});

People.RecentActivity.Providers.CacheDictionary.prototype.clear = function() {
    /// <summary>
    ///     Clears all cached entries for the user.
    /// </summary>
    for (var i = 0; i < this._cachedEntryList.length; i++) {
        this.removeInternal(this._cachedEntryList[i]);
    }

    People.RecentActivity.Providers.Cache.remove(this._cachedEntryListKey);
};

People.RecentActivity.Providers.CacheDictionary.prototype.addInternal = function(identifier, value) {
    /// <summary>
    ///     Adds an entry to cache.
    /// </summary>
    /// <param name="identifier" type="String">The identifier for the entry.</param>
    /// <param name="value" type="Object">The value.</param>
    Debug.assert(Jx.isNonEmptyString(identifier), 'identifier');
    Debug.assert(value != null, 'value');
    this._appendIdentifier(identifier);
    People.RecentActivity.Providers.Cache.add(this.getKey(identifier), value);
};

People.RecentActivity.Providers.CacheDictionary.prototype.removeInternal = function(identifier) {
    /// <summary>
    ///     Removes an entry from cache.
    /// </summary>
    /// <param name="identifier" type="String">The identifier for the entry.</param>
    Debug.assert(Jx.isNonEmptyString(identifier), 'identifier');
    People.RecentActivity.Providers.Cache.remove(this.getKey(identifier));
    this._removeIdentifier(identifier);
    this.onRemove(identifier);
};

People.RecentActivity.Providers.CacheDictionary.prototype.onRemove = function(identifier) {
    /// <summary>
    ///     Called when a cached entry is being removed.
    /// </summary>
    /// <param name="identifier" type="String">The identifier.</param>
    return;
};

People.RecentActivity.Providers.CacheDictionary.prototype.getKey = function(identifier) {
    /// <summary>
    ///     Gets the cache key from an identifier.
    /// </summary>
    /// <param name="identifier" type="String">The identifier.</param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(identifier), 'identifier');
    return this._cachedEntryKeyPrefix + '_' + identifier;
};

People.RecentActivity.Providers.CacheDictionary.prototype._initializeCachedEntryList = function() {
    this._cachedEntryList = People.RecentActivity.Providers.Cache.get(this._cachedEntryListKey);
    // We haven't stored anything for this user yet.
    if (this._cachedEntryList == null) {
        this._cachedEntryList = [];
    }

    // If cached entries are already more than limit(e.g. limit is reduced), trim extra entries.
    for (var i = 0; i < this._cachedEntryList.length - this.maxCachedEntries; i++) {
        this.removeInternal(this._cachedEntryList[i]);
    }
};

People.RecentActivity.Providers.CacheDictionary.prototype._appendIdentifier = function(identifier) {
    /// <param name="identifier" type="String"></param>
    var index = this._cachedEntryList.indexOf(identifier);
    // If the identifier is already in the end, we don't need to do anything.
    if (this._cachedEntryList.length > 0 && index === this._cachedEntryList.length - 1) {
        return;
    }

    if (index >= 0) {
        // Remove the existing one from the list.
        this._cachedEntryList.splice(index, 1);
    }
    else if (this.count === this.maxCachedEntries) {
        // Remove the first one in the list, since it is the least accessed one.
        this.removeInternal(this._cachedEntryList[0]);
    }

    // Append this contact to the end of the list, since it is the one accessed last.
    this._cachedEntryList.push(identifier);
    this._writeCachedEntryListToCache();
};

People.RecentActivity.Providers.CacheDictionary.prototype._removeIdentifier = function(identifier) {
    /// <param name="identifier" type="String"></param>
    var index = this._cachedEntryList.indexOf(identifier);
    if (index >= 0) {
        this._cachedEntryList.splice(index, 1);
        this._writeCachedEntryListToCache();
    }
};

People.RecentActivity.Providers.CacheDictionary.prototype._writeCachedEntryListToCache = function() {
    // Update the cache.
    People.RecentActivity.Providers.Cache.add(this._cachedEntryListKey, this._cachedEntryList);
};

People.RecentActivity.Providers.CacheDictionary.prototype._onQuotaExceeded = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    var count = this._cachedEntryList.length;
    if (!count) {
        // nothing to remove, this cache dictionary is empty.
        return;
    }

    var removeCount = Math.ceil(count / 2);
    if (removeCount > 0) {
        // cache the WN ID so we don't have to fetch it every time.
        var whatsNewId = People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId;
        // the index to remove items at.
        var index = 0;
        // clean out the oldest half of the cache, ignoring what's new.
        while (removeCount > 0 && index < count) {
            var identifier = this._cachedEntryList[index];
            if (identifier.indexOf(whatsNewId) === -1) {
                // remove this data since it's below the cut line and not what's new.
                this.removeInternal(identifier);
                removeCount--;
                count--;
            }
            else {
                // step the index forward past the what's new data, but don't count the removal.
                index++;
            }        
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\Helpers\DateTimeHelper.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\..\Platform\ContactId.js" />
/// <reference path="Cache.js" />
/// <reference path="CacheDictionary.js" />

People.RecentActivity.Providers.ContactDataCacheDictionary = function(userIdentity, type) {
    /// <summary>
    ///     Provides a base cache dictionary for contact data based cache, e.g. feed and album.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType">The data type.</param>
    People.RecentActivity.Providers.CacheDictionary.call(this, userIdentity, type.toString().substr(0, 1));
};

Jx.inherit(People.RecentActivity.Providers.ContactDataCacheDictionary, People.RecentActivity.Providers.CacheDictionary);

Object.defineProperty(People.RecentActivity.Providers.ContactDataCacheDictionary.prototype, "maxCachedEntries", {
    get: function() {
        /// <summary>
        ///     Gets the max cached entries for the user.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedContacts;
    },
    configurable: true
});

People.RecentActivity.Providers.ContactDataCacheDictionary.prototype.add = function(contactId, entries) {
    /// <summary>
    ///     Adds a contact to cache.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries to cache.</param>
    Debug.assert(contactId != null, 'contactId');
    Debug.assert(entries != null, 'entries');
    var maxEntries = this.maxEntriesPerContact;
    if (entries != null && entries.length > maxEntries) {
        entries = entries.slice(entries.length - maxEntries, entries.length - maxEntries + maxEntries);
    }

    var identifier = this._getIdentifier$1(contactId);
    this.addInternal(identifier, entries);
    People.RecentActivity.Providers.Cache.add(this._getLastUpdateTimeKey$1(identifier), new Date());
};

People.RecentActivity.Providers.ContactDataCacheDictionary.prototype.remove = function(contactId) {
    /// <summary>
    ///     Removes a contact from cache.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    Debug.assert(contactId != null, 'contactId');
    var identifier = this._getIdentifier$1(contactId);
    this.removeInternal(identifier);
    People.RecentActivity.Providers.Cache.remove(this._getLastUpdateTimeKey$1(identifier));
};

People.RecentActivity.Providers.ContactDataCacheDictionary.prototype.getLastUpdateTime = function(contactId) {
    /// <summary>
    ///     Gets the last update time for a contact's entry.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <returns type="Date"></returns>
    var timeStamp = People.RecentActivity.Providers.Cache.get(this._getLastUpdateTimeKey$1(this._getIdentifier$1(contactId)));
    if (!Jx.isNonEmptyString(timeStamp)) {
        return Date.empty;
    }

    return People.RecentActivity.Core.DateTimeHelper.parseTimeStamp(timeStamp);
};

People.RecentActivity.Providers.ContactDataCacheDictionary.prototype.onRemove = function(identifier) {
    /// <summary>
    ///     Called when a cached entry is being removed.
    /// </summary>
    /// <param name="identifier" type="String">The identifier.</param>
    People.RecentActivity.Providers.Cache.remove(this._getLastUpdateTimeKey$1(identifier));
};

People.RecentActivity.Providers.ContactDataCacheDictionary.prototype._getIdentifier$1 = function(contactId) {
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId"></param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(contactId.sourceId), 'contactId.SourceId');
    Debug.assert(Jx.isNonEmptyString(contactId.id), 'contactId.Id');
    return contactId.sourceId + '_' + contactId.id;
};

People.RecentActivity.Providers.ContactDataCacheDictionary.prototype._getLastUpdateTimeKey$1 = function(identifier) {
    /// <param name="identifier" type="String"></param>
    /// <returns type="String"></returns>
    return this.getKey(identifier) + '_lastupdated';
};

People.RecentActivity.Providers.ContactDataCacheDictionary.prototype.item = function(contacId) {
    /// <summary>
    ///     Gets an array of <see cref="T:People.RecentActivity.Core.FeedObjectInfo" /> with the given id of the cached contact.
    /// </summary>
    /// <param name="contacId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="value" type="Array" elementType="feedObjectInfo"></param>
    /// <returns type="Array" elementType="feedObjectInfo"></returns>
    return People.RecentActivity.Providers.Cache.get(this.getKey(this._getIdentifier$1(contacId))) || new Array(0);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="ContactDataCacheDictionary.js" />

People.RecentActivity.Providers.AlbumDictionary = function(userIdentity) {
    /// <summary>
    ///     Represents a album cache dictionary.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    People.RecentActivity.Providers.ContactDataCacheDictionary.call(this, userIdentity, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum);
};

Jx.inherit(People.RecentActivity.Providers.AlbumDictionary, People.RecentActivity.Providers.ContactDataCacheDictionary);

Object.defineProperty(People.RecentActivity.Providers.AlbumDictionary.prototype, "maxEntriesPerContact", {
    get: function() {
        /// <summary>
        ///     Gets the max size of the collection.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedAlbumsPerContact;
    },
    configurable: true
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="ResourceRefreshInfo.js" />

People.RecentActivity.Providers.ResourceInfoCollection = function (resources) {
    /// <summary>
    ///     The base class for different resource info collection classes.
    /// </summary>
    /// <param name="resources" type="Array" elementType="Object">The array of resources.</param>
    /// <field name="resources" type="Array">The underlying resource objects.</field>
    /// <field name="map" type="Object">The map for quick loop up.</field>
    Debug.assert(resources != null, 'resources');
    this._initializeCollection(resources);
};


People.RecentActivity.Providers.ResourceInfoCollection.prototype.resources = null;
People.RecentActivity.Providers.ResourceInfoCollection.prototype.map = null;

Object.defineProperty(People.RecentActivity.Providers.ResourceInfoCollection.prototype, "count", {
    get: function () {
        /// <summary>
        ///     Gets the count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.resources.length;
    }
});

Object.defineProperty(People.RecentActivity.Providers.ResourceInfoCollection.prototype, "batchSize", {
    get: function () {
        /// <summary>
        ///     Gets the batch size.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.maxSize;
    },
    configurable: true
});

People.RecentActivity.Providers.ResourceInfoCollection.prototype.isUpdated = function (oldResource, newResource) {
    /// <summary>
    ///     Determines whether a resource with the same id is updated.
    /// </summary>
    /// <param name="oldResource" type="Object">The old resource.</param>
    /// <param name="newResource" type="Object">The new resource.</param>
    /// <returns type="Boolean"></returns>
    return false;
};

People.RecentActivity.Providers.ResourceInfoCollection.prototype.findResourceById = function (id) {
    /// <summary>
    ///     Finds the resource by id.
    /// </summary>
    /// <param name="id" type="String">The id.</param>
    /// <returns type="Object"></returns>
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    return this.map[id];
};

People.RecentActivity.Providers.ResourceInfoCollection.prototype.refreshInternal = function (resources) {
    /// <summary>
    ///     Refreshes the resource collection with a new array of resources.
    /// </summary>
    /// <param name="resources" type="Array" elementType="Object">The array of resources, in chronological order.</param>
    /// <returns type="People.RecentActivity.Providers.resourceRefreshInfo"></returns>
    Debug.assert(resources != null, 'resources');
    Debug.assert(this.maxSize > 0, 'maxsize');
    var batchSize = this.batchSize;
    var count = this.count;
    if (resources.length > batchSize) {
        resources = resources.slice(0, batchSize);
    }

    var currentResources = Array.apply(null, this.resources);
    var resourcesAdded = [];
    var resourcesUpdated = [];
    for (var i = resources.length - 1; i >= 0; i--) {
        var resource = resources[i];
        var resourceId = this.getId(resource);

        if (Jx.isUndefined(this.map[resourceId])) {
            // The resource is newly added.
            // Maintain chronological order
            resourcesAdded.unshift(resource);
        }
        else {
            // Already exists in the cache
            var cached = this.map[resourceId];

            if (this.isUpdated(cached, resource)) {
                // Maintain chronological order
                resourcesUpdated.unshift(resource);
            }

            this.onRefreshed(cached, resource);

            // Remove it from cached collection, then in the end, we will know what entries to remove.)
            var index = currentResources.indexOf(cached);
            if (index !== -1) {
                currentResources.splice(index, 1);
            }
        }
    }

    // The rest items in currentResources will be items to remove.
    var resourcesRemoved = currentResources;
    var hasUpdate = true;

    if (!resourcesAdded.length && !resourcesUpdated.length && resourcesRemoved.length === Math.max(count - batchSize, 0)) {
        // if currently we have more than one batch, and the new resources are same as the first batch, we treat it as not updated.
        hasUpdate = false;
        resourcesRemoved.length = 0;
    }

    if (hasUpdate) {
        // Reinitialize the new collection with new resources.
        this._initializeCollection(resources);
    }

    return People.RecentActivity.Providers.create_resourceRefreshInfo(resourcesAdded, resourcesUpdated, resourcesRemoved);
};

People.RecentActivity.Providers.ResourceInfoCollection.prototype.addInternal = function (resource) {
    /// <summary>
    ///     Adds the specified resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    Debug.assert(resource != null, 'resource');
    if (this.resources.length === this.maxSize) {
        // Removes the oldest one.
        delete this.map[this.getId(this.resources[0])];
        this.resources.shift();
    }

    this.resources.push(resource);
    this.map[this.getId(resource)] = resource;
};

People.RecentActivity.Providers.ResourceInfoCollection.prototype.removeInternal = function (resource) {
    /// <summary>
    ///     Removes the specified resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(resource != null, 'resource');

    var id = this.getId(resource);

    if (!Jx.isUndefined(this.map[id])) {
        var entry = this.map[id];
        delete this.map[id];

        var index = this.resources.indexOf(entry);
        if (index !== -1) {
            this.resources.splice(index, 1);
        }

        return true;
    }
    else {
        Jx.log.write(3, People.Social.format('RemoveInternal: the resource with Id {0} is not found!', id));
        return false;
    }
};

People.RecentActivity.Providers.ResourceInfoCollection.prototype.mergeInternal = function (resources) {
    /// <summary>
    ///     Merges the resources to current collection while maintaining chronological order.
    /// </summary>
    /// <param name="resources" type="Array" elementType="Object">The resources.</param>
    Debug.assert(resources != null, 'resources');

    if (this.count >= this.maxSize) {
        return;
    }

    var newResources = [];

    // Iterate through the incoming resources first, they're older.
    for (var i = 0, len = resources.length; i < len; i++) {
        var resource = resources[i];
        var id = this.getId(resource);

        // This is the one we retrieved most recently, assume it's more accurate.
        newResources.push(resource);

        if (!Jx.isUndefined(this.map[id])) {
            // The entry already existed in the collection, remove the old one.
            this.removeInternal(resource);
        }
    }

    // The collection should contain only the unique resources, append them now.
    newResources.push.apply(newResources, this.resources);

    var maxSize = this.maxSize;
    var newResourcesLen = newResources.length;

    if (newResourcesLen > maxSize) {
        // We have too many entries, we need to slice off the start of the array since they are in
        // chronological order and we only want the newest entries.
        newResources = newResources.slice(
            newResourcesLen - maxSize,
            newResourcesLen);
    }

    this._initializeCollection(newResources);
};

People.RecentActivity.Providers.ResourceInfoCollection.prototype.onRefreshed = function (cached, resource) {
    /// <summary>
    ///     Called when a cached resource is refreshed with a new resource.
    /// </summary>
    /// <param name="cached" type="Object">The cached.</param>
    /// <param name="resource" type="Object">The new resource.</param>
};

People.RecentActivity.Providers.ResourceInfoCollection.prototype._initializeCollection = function (resources) {
    /// <param name="resources" type="Array" elementType="Object"></param>
    this.resources = Array.apply(null, resources);
    this.map = {};

    for (var i = 0, len = resources.length; i < len; i++) {
        var id = this.getId(resources[i]);

        Debug.assert(Jx.isNonEmptyString(id), 'id');
        Debug.assert(Jx.isUndefined(this.map[id]), 'id already exists in map');

        this.map[id] = resources[i];
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="FeedObjectRefreshInfo.js" />
/// <reference path="ResourceInfoCollection.js" />

People.RecentActivity.Providers.FeedObjectInfoCollection = function(objects) {
    /// <summary>
    ///     Represents a collection of <see cref="T:People.RecentActivity.Core.FeedObjectInfo" />.
    /// </summary>
    /// <param name="objects" type="Array" elementType="feedObjectInfo">The objects.</param>
    People.RecentActivity.Providers.ResourceInfoCollection.call(this, objects);
};

Jx.inherit(People.RecentActivity.Providers.FeedObjectInfoCollection, People.RecentActivity.Providers.ResourceInfoCollection);

Object.defineProperty(People.RecentActivity.Providers.FeedObjectInfoCollection.prototype, "maxSize", {
    get: function() {
        /// <summary>
        ///     Gets the max size of the collection.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this.getMaxSize();
    },
    configurable: true
});

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.findObjectById = function(id) {
    /// <summary>
    ///     Finds the object by id.
    /// </summary>
    /// <param name="id" type="String">The id.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    return this.findResourceById(id);
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.findObjectByInfo = function(info) {
    /// <summary>
    ///     Finds the object by info.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(info != null, 'info');
    return this.findResourceById(info.id);
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.refresh = function(objects) {
    /// <summary>
    ///     Refreshes the collection with a new array of <see cref="T:People.RecentActivity.Core.FeedObjectInfo" />.
    /// </summary>
    /// <param name="objects" type="Array" elementType="feedObjectInfo">The array of <see cref="T:People.RecentActivity.Core.FeedObjectInfo" /></param>
    /// <returns type="People.RecentActivity.Providers.feedObjectRefreshInfo"></returns>
    var refreshInfo = this.refreshInternal(objects);
    return People.RecentActivity.Providers.create_feedObjectRefreshInfo(refreshInfo.resourcesAdded, refreshInfo.resourcesUpdated, refreshInfo.resourcesRemoved);
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.add = function(feedObject) {
    /// <summary>
    ///     Adds the specified feed object.
    /// </summary>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    this.addInternal(feedObject);
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.remove = function(feedObject) {
    /// <summary>
    ///     Removes the specified feed object.
    /// </summary>
    /// <param name="feedObject" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <returns type="Boolean"></returns>
    return this.removeInternal(feedObject);
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.merge = function(objects) {
    /// <summary>
    ///     Merges the feed objects to current collection while maintaining chronological order.
    /// </summary>
    /// <param name="objects" type="Array" elementType="feedObjectInfo">The objects.</param>
    this.mergeInternal(objects);
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.toArray = function() {
    /// <summary>
    ///     Converts the collection to an array.
    /// </summary>
    /// <returns type="Array" elementType="feedObjectInfo"></returns>
    return this.resources;
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.isUpdated = function(oldResource, newResource) {
    /// <summary>
    ///     Determines whether a feed object with the same id is updated.
    /// </summary>
    /// <param name="oldResource" type="Object">The old object.</param>
    /// <param name="newResource" type="Object">The new object.</param>
    /// <returns type="Boolean"></returns>
    var oldObject = oldResource;
    var newObject = newResource;
    if (oldObject.commentDetails.count !== newObject.commentDetails.count) {
        return true;
    }

    if (oldObject.commentDetails.permissions !== newObject.commentDetails.permissions) {
        return true;
    }

    for (var i = 0, len = oldObject.reactionDetails.length; i < len; i++) {
        if (oldObject.reactionDetails[i].count !== newObject.reactionDetails[i].count) {
            return true;
        }

        if (oldObject.reactionDetails[i].permissions !== newObject.reactionDetails[i].permissions) {
            return true;
        }    
    }

    return false;
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.onRefreshed = function(cached, resource) {
    /// <summary>
    ///     Called when a cached resource is refreshed with a new resource.
    /// </summary>
    /// <param name="cached" type="Object">The cached.</param>
    /// <param name="resource" type="Object">The new resource.</param>
    var cachedObj = cached;
    var obj = resource;
    obj.comments = cachedObj.comments;
    obj.reactions = cachedObj.reactions;
    People.RecentActivity.Providers.ResourceInfoCollection.prototype.onRefreshed.call(this, cached, resource);
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.getMaxSize = function() {
    /// <summary>
    ///     Gets the max size of the collection.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return -1;
};

People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.getId = function(resource) {
    /// <summary>
    ///     Gets the id for the given resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="String"></returns>
    Debug.assert(resource != null, 'resource');
    var feedObject = resource;
    Debug.assert(feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'type');
    return feedObject.id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="FeedObjectInfoCollection.js" />
/// <reference path="PhotoInfoCollection.js" />

People.RecentActivity.Providers.AlbumInfoCollection = function(albums) {
    /// <summary>
    ///     Represents a collection of albums.
    /// </summary>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The albums.</param>
    People.RecentActivity.Providers.FeedObjectInfoCollection.call(this, albums);
};

Jx.inherit(People.RecentActivity.Providers.AlbumInfoCollection, People.RecentActivity.Providers.FeedObjectInfoCollection);

People.RecentActivity.Providers.AlbumInfoCollection.prototype.findObjectByInfo = function(info) {
    /// <summary>
    ///     Finds the object by info.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(info != null, 'info');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum || info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'type');
    switch (info.type) {
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
            return this.findResourceById((info.data).id);
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            return this.findPhotoByInfo(info);
        default:
            Debug.assert(false, 'Unsupported object type: ' + info.type);
            return null;
    }
};

People.RecentActivity.Providers.AlbumInfoCollection.prototype.findPhotoByInfo = function(photo) {
    /// <summary>
    ///     Finds the photo by info.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(photo != null, 'photo');
    Debug.assert(photo.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'type');
    var album = this.findObjectById((photo.data).albumId);
    if (album == null) {
        return null;
    }

    return new People.RecentActivity.Providers.PhotoInfoCollection((album.data).photos).findObjectByInfo(photo);
};

People.RecentActivity.Providers.AlbumInfoCollection.prototype.findPhotoById = function(id) {
    /// <summary>
    ///     Finds the photo by its pid.
    /// </summary>
    /// <param name="id" type="String">The pid.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    var albums = this.resources;
    for (var n = 0; n < albums.length; n++) {
        var album = albums[n];
        var photo = new People.RecentActivity.Providers.PhotoInfoCollection((album.data).photos).findObjectById(id);
        if (photo != null) {
            return photo;
        }    
    }

    return null;
};

People.RecentActivity.Providers.AlbumInfoCollection.prototype.isUpdated = function(oldResource, newResource) {
    /// <summary>
    ///     Determines whether a feed object with the same id is updated.
    /// </summary>
    /// <param name="oldResource" type="Object">The old object.</param>
    /// <param name="newResource" type="Object">The new object.</param>
    /// <returns type="Boolean"></returns>
    if (People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.isUpdated.call(this, oldResource, newResource)) {
        return true;
    }

    var oldAlbum = (oldResource).data;
    var newAlbum = (newResource).data;
    if (oldAlbum.cover.id !== newAlbum.cover.id) {
        return true;
    }

    if (oldAlbum.description !== newAlbum.description) {
        return true;
    }

    if (oldAlbum.name !== newAlbum.name) {
        return true;
    }

    if (oldAlbum.totalCount !== newAlbum.totalCount) {
        return true;
    }

    return false;
};

People.RecentActivity.Providers.AlbumInfoCollection.prototype.onRefreshed = function(cached, resource) {
    /// <summary>
    ///     Called when a cached resource is refreshed with a new resource.
    /// </summary>
    /// <param name="cached" type="Object">The cached.</param>
    /// <param name="resource" type="Object">The new resource.</param>
    var cachedObj = cached;
    var obj = resource;
    // Keep cached album's comment and reaction information, we don't retrieve any comments/reactions for the new album at this time.
    obj.commentDetails = cachedObj.commentDetails;
    obj.reactionDetails = cachedObj.reactionDetails;
    var cachedAlbum = cachedObj.data;
    var album = obj.data;
    // Keep cached album's photos. We don't retrieve any photos for the new album at this time.
    album.photos = cachedAlbum.photos;
    People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.onRefreshed.call(this, cached, resource);
};

People.RecentActivity.Providers.AlbumInfoCollection.prototype.getMaxSize = function() {
    /// <summary>
    ///     Gets the max size of the collection.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return People.RecentActivity.Platform.Configuration.instance.maxCachedAlbumsPerContact;
};

People.RecentActivity.Providers.AlbumInfoCollection.prototype.getId = function(resource) {
    /// <summary>
    ///     Gets the id for the given resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="String"></returns>
    Debug.assert(resource != null, 'resource');
    var album = resource;
    Debug.assert(album.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'type');
    // Return the album id, instead of the object id.
    return (album.data).id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.LocalStorage = function() {
    /// <summary>
    ///     Represents HTML 5 local storage.
    /// </summary>
    /// <field name="_cacheVersionKey" type="String" static="true">The cache version key.</field>
    /// <field name="_cacheVersion" type="Number" integer="true" static="true">The cache version.</field>
    var version = this.item('__CacheVersion');

    if (Jx.isNullOrUndefined(version) || (version < 1)) {
        // either we have no version (cache is empty or it's the RTM/GA cache which wasn't versioned yet), or
        // the version doesn't match what we expect, which means we have to clear the cache to prevent
        // us pulling in data that doesn't match our code anymore.
        this.clear();
    }
};

People.RecentActivity.Providers.LocalStorage._cacheVersionKey = '__CacheVersion';
People.RecentActivity.Providers.LocalStorage._cacheVersion = 1;

Object.defineProperty(People.RecentActivity.Providers.LocalStorage, "isSupported", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether local storage is supported.
        /// </summary>
        /// <value type="Boolean"></value>
        var storage = null;

        try {
            // In case this throws an exception.
            storage = window.localStorage;
        }
        catch (ex) {
            Jx.log.write(3, People.Social.format('Failed to get localStorage: {0}.', ex.message));
        }

        return !Jx.isNullOrUndefined(storage);
    }
});

People.RecentActivity.Providers.LocalStorage.prototype.add = function(key, value) {
    /// <summary>
    ///     Adds an entry to the cache.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <param name="value" type="Object">The value.</param>
    window.localStorage.setItem(key, JSON.stringify(value));
};

People.RecentActivity.Providers.LocalStorage.prototype.remove = function(key) {
    /// <summary>
    ///     Removes the entry with the specified key.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    window.localStorage.removeItem(key);
};

People.RecentActivity.Providers.LocalStorage.prototype.clear = function() {
    /// <summary>
    ///     Clears the cache.
    /// </summary>
    // clear local storage.
    window.localStorage.clear();

    // push the new cache version.
    this.add('__CacheVersion', 1);
};

People.RecentActivity.Providers.LocalStorage.prototype.item = function(key) {
    /// <summary>
    ///     Gets the <see cref="T:System.Object" /> with the specified key.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <param name="value" type="Object"></param>
    /// <returns type="Object"></returns>
    var cached = window.localStorage[key];
    return (cached == null) ? null : JSON.parse(cached);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.MemoryStorage = function() {
    /// <summary>
    ///     Represents an in-memory storage.
    /// </summary>
    /// <field name="_storage" type="Object">The storage data.</field>
    this._storage = {};
};

People.RecentActivity.Providers.MemoryStorage.prototype.add = function(key, value) {
    /// <summary>
    ///     Adds an entry to the cache.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <param name="value" type="Object">The value.</param>
    this._storage[key] = JSON.stringify(value);
};

People.RecentActivity.Providers.MemoryStorage.prototype.remove = function(key) {
    /// <summary>
    ///     Removes the entry with the specified key.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    delete this._storage[key];
};

People.RecentActivity.Providers.MemoryStorage.prototype.clear = function() {
    /// <summary>
    ///     Clears the cache.
    /// </summary>
    People.Social.clearKeys(this._storage);
};

People.RecentActivity.Providers.MemoryStorage.prototype.item = function(key) {
    /// <summary>
    ///     Gets the <see cref="T:System.Object" /> with the specified key.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <param name="value" type="Object"></param>
    /// <returns type="Object"></returns>
    var cached = this._storage[key];
    return (cached == null) ? null : JSON.parse(this._storage[key]);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="LocalStorage.js" />
/// <reference path="MemoryStorage.js" />

People.RecentActivity.Providers.Cache = function() {
    /// <summary>
    ///     Provides methods to access underlying cache.
    /// </summary>
    /// <field name="_cache" type="People.RecentActivity.Providers.ICache" static="true"></field>
};

People.RecentActivity.Providers.Cache.events = {};
Jx.mix(People.RecentActivity.Providers.Cache.events, Jx.Events);
Jx.mix(People.RecentActivity.Providers.Cache.events, People.Social.Events);

Debug.Events.define(People.RecentActivity.Providers.Cache.events, "quotaexceeded");

People.RecentActivity.Providers.Cache._cache = null;

People.RecentActivity.Providers.Cache.add = function(key, value) {
    /// <summary>
    ///     Adds an entry to the cache.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <param name="value" type="Object">The value.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(Jx.isNonEmptyString(key), 'key');
    Debug.assert(value != null, 'value');
    try {
        People.RecentActivity.Providers.Cache._cache.add(key, value);
        return true;
    }
    catch (ex) {
        Jx.log.write(2, People.Social.format('Failed to add key value to cache! Error: {0}.', ex.message));
        Jx.log.pii(People.Social.format('Key:{0}, Value:{1}', key, JSON.stringify(value)));
    }

    // Try cleaning up the cache first and retry the add.
    Jx.log.write(3, 'Attempting cache cleanup...');
    People.RecentActivity.Providers.Cache.events.raiseEvent("quotaexceeded", new People.RecentActivity.EventArgs(null));
    try {
        Jx.log.write(4, 'Retrying to add stuff to cache...');
        People.RecentActivity.Providers.Cache._cache.add(key, value);
        return true;
    }
    catch (ex) {
        Jx.log.write(2, People.Social.format('Unfortunately cache write failed again! Error: {0}.', ex.message));
    }

    return false;
};

People.RecentActivity.Providers.Cache.get = function(key) {
    /// <summary>
    ///     Gets the <see cref="T:System.Object" /> with the specified key.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <returns type="Object"></returns>
    Debug.assert(Jx.isNonEmptyString(key), 'key');
    try {
        return People.RecentActivity.Providers.Cache._cache.item(key);
    }
    catch (ex) {
        // Ignore the failure, and log the error.
        Jx.log.write(2, People.Social.format('Failed to get cached entry! Error: {0}.', ex.message));
        Jx.log.pii('Key:' + key);
        return null;
    }
};

People.RecentActivity.Providers.Cache.remove = function(key) {
    /// <summary>
    ///     Removes the entry with the specified key.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(Jx.isNonEmptyString(key), 'key');
    try {
        People.RecentActivity.Providers.Cache._cache.remove(key);
        return true;
    }
    catch (ex) {
        // Ignore the failure, and log the error.
        Jx.log.write(2, People.Social.format('Failed to remove cached entry! Error: {0}.', ex.message));
        Jx.log.pii('Key:' + key);
        return false;
    }
};

People.RecentActivity.Providers.Cache.clear = function() {
    /// <summary>
    ///     Clears the underlaying <see cref="T:People.RecentActivity.Providers.ICache" />.
    /// </summary>
    People.RecentActivity.Providers.Cache._cache.clear();
};


(function() {
    if (People.RecentActivity.Providers.LocalStorage.isSupported) {
        People.RecentActivity.Providers.Cache._cache = new People.RecentActivity.Providers.LocalStorage();
    }
    else {
        People.RecentActivity.Providers.Cache._cache = new People.RecentActivity.Providers.MemoryStorage();
    }

})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\CommentInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="CommentRefreshInfo.js" />
/// <reference path="ResourceInfoCollection.js" />

People.RecentActivity.Providers.CommentInfoCollection = function(comments) {
    /// <summary>
    ///     Represents a collection of <see cref="T:People.RecentActivity.Core.CommentInfo" />.
    /// </summary>
    /// <param name="comments" type="Array" elementType="commentInfo">The comments.</param>
    People.RecentActivity.Providers.ResourceInfoCollection.call(this, comments);
};

Jx.inherit(People.RecentActivity.Providers.CommentInfoCollection, People.RecentActivity.Providers.ResourceInfoCollection);

Object.defineProperty(People.RecentActivity.Providers.CommentInfoCollection.prototype, "maxSize", {
    get: function() {
        /// <summary>
        ///     Gets the max size of the collection.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedCommentsPerEntry;
    },
    configurable: true
});

People.RecentActivity.Providers.CommentInfoCollection.prototype.refresh = function(comments) {
    /// <summary>
    ///     Refreshes the collection with a new array of <see cref="T:People.RecentActivity.Core.CommentInfo" />.
    /// </summary>
    /// <param name="comments" type="Array" elementType="commentInfo">The array of <see cref="T:People.RecentActivity.Core.CommentInfo" /></param>
    /// <returns type="People.RecentActivity.Providers.commentRefreshInfo"></returns>
    var refreshInfo = this.refreshInternal(comments);
    return People.RecentActivity.Providers.create_commentRefreshInfo(refreshInfo.resourcesAdded, refreshInfo.resourcesRemoved);
};

People.RecentActivity.Providers.CommentInfoCollection.prototype.add = function(comment) {
    /// <summary>
    ///     Adds the specified comment.
    /// </summary>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment.</param>
    this.addInternal(comment);
};

People.RecentActivity.Providers.CommentInfoCollection.prototype.remove = function(comment) {
    /// <summary>
    ///     Removes the specified comment.
    /// </summary>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment.</param>
    /// <returns type="Boolean"></returns>
    return this.removeInternal(comment);
};

People.RecentActivity.Providers.CommentInfoCollection.prototype.toArray = function() {
    /// <summary>
    ///     Converts the collection to an array.
    /// </summary>
    /// <returns type="Array" elementType="commentInfo"></returns>
    return this.resources;
};

People.RecentActivity.Providers.CommentInfoCollection.prototype.getId = function(resource) {
    /// <summary>
    ///     Gets the id for the given resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="String"></returns>
    Debug.assert(resource != null, 'resource');
    var comment = resource;
    return comment.id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\ContactId.js" />
/// <reference path="ContactDataCache.js" />
/// <reference path="FeedDictionary.js" />
/// <reference path="FeedEntryInfoCollection.js" />
/// <reference path="FeedObjectInfoCollection.js" />

People.RecentActivity.Providers.FeedCache = function(userIdentity) {
    /// <summary>
    ///     Provides access to feed cache.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <field name="_instances$1" type="Object" static="true">A map of instances, keyed by user's identity.</field>
    People.RecentActivity.Providers.ContactDataCache.call(this, userIdentity, new People.RecentActivity.Providers.FeedDictionary(userIdentity));
};

Jx.inherit(People.RecentActivity.Providers.FeedCache, People.RecentActivity.Providers.ContactDataCache);


People.RecentActivity.Providers.FeedCache._instances$1 = {};

People.RecentActivity.Providers.FeedCache.getInstance = function(userIdentity) {
    /// <summary>
    ///     Gets the feed cache for a user.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <returns type="People.RecentActivity.Providers.FeedCache"></returns>
    Debug.assert(userIdentity != null, 'userIdentity');
    if (!!Jx.isUndefined(People.RecentActivity.Providers.FeedCache._instances$1[userIdentity])) {
        People.RecentActivity.Providers.FeedCache._instances$1[userIdentity] = new People.RecentActivity.Providers.FeedCache(userIdentity);
    }

    return People.RecentActivity.Providers.FeedCache._instances$1[userIdentity];
};

People.RecentActivity.Providers.FeedCache.prototype.getFeedEntries = function(contactId) {
    /// <summary>
    ///     Gets the cached feed entries for a user's contact.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <returns type="Array" elementType="feedObjectInfo"></returns>
    return this.getFeedObjects(contactId);
};

People.RecentActivity.Providers.FeedCache.prototype.addMoreFeedEntries = function(contactId, entries) {
    /// <summary>
    ///     Adds more feed entries to cache..
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    this.addMoreFeedObjects(contactId, entries);
};

People.RecentActivity.Providers.FeedCache.prototype.refreshFeedEntries = function(contactId, entries) {
    /// <summary>
    ///     Refreshes the cached feed entries with newly retrieved entries.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The new feed entries.</param>
    /// <returns type="People.RecentActivity.Providers.feedObjectRefreshInfo"></returns>
    return this.refreshFeedObjects(contactId, entries);
};

People.RecentActivity.Providers.FeedCache.prototype.findObjectById = function(contactId, id, type) {
    /// <summary>
    ///     Finds the cached object by id.
    /// </summary>
    /// <param name="contactId" type="People.RecentActivity.Platform.ContactId">The contact id.</param>
    /// <param name="id" type="String">The id.</param>
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType">The type.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'type');

    var objects = this.getFeedObjects(contactId);
    var entries = new People.RecentActivity.Providers.FeedEntryInfoCollection(objects);

    return entries.findObjectById(id);
};

People.RecentActivity.Providers.FeedCache.prototype.getCollection = function(feedObjs) {
    /// <summary>
    ///     Gets the corresponding collection for the feed objects.
    /// </summary>
    /// <param name="feedObjs" type="Array" elementType="feedObjectInfo">The feed objects.</param>
    /// <returns type="People.RecentActivity.Providers.FeedObjectInfoCollection"></returns>
    return new People.RecentActivity.Providers.FeedEntryInfoCollection(feedObjs);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="ContactDataCacheDictionary.js" />

People.RecentActivity.Providers.FeedDictionary = function(userIdentity) {
    /// <summary>
    ///     Represents a feed cache dictionary.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    People.RecentActivity.Providers.ContactDataCacheDictionary.call(this, userIdentity, People.RecentActivity.Core.FeedObjectInfoType.entry);
};

Jx.inherit(People.RecentActivity.Providers.FeedDictionary, People.RecentActivity.Providers.ContactDataCacheDictionary);

Object.defineProperty(People.RecentActivity.Providers.FeedDictionary.prototype, "maxEntriesPerContact", {
    get: function() {
        /// <summary>
        ///     Gets the max size of the collection.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedEntriesPerContact;
    },
    configurable: true
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="FeedObjectInfoCollection.js" />

People.RecentActivity.Providers.FeedEntryInfoCollection = function(entries) {
    /// <summary>
    ///     Represents a collection of feed entries.
    /// </summary>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    People.RecentActivity.Providers.FeedObjectInfoCollection.call(this, entries);
};

Jx.inherit(People.RecentActivity.Providers.FeedEntryInfoCollection, People.RecentActivity.Providers.FeedObjectInfoCollection);

Object.defineProperty(People.RecentActivity.Providers.FeedEntryInfoCollection.prototype, "batchSize", {
    get: function() {
        /// <summary>
        ///     Gets the batch size.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.feedEntriesBatchSize;
    },
    configurable: true
});

People.RecentActivity.Providers.FeedEntryInfoCollection.prototype.getMaxSize = function() {
    /// <summary>
    ///     Gets the max size of the collection.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return People.RecentActivity.Platform.Configuration.instance.maxCachedEntriesPerContact;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="FeedObjectCacheDictionary.js" />

People.RecentActivity.Providers.FeedObjectCache = function(userIdentity) {
    /// <summary>
    ///     Provides access to feed object cache.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <field name="_instances" type="Object" static="true">A map of instances, keyed by user's identity.</field>
    /// <field name="_userIdentity" type="String"></field>
    /// <field name="_cacheDict" type="People.RecentActivity.Providers.FeedObjectCacheDictionary"></field>
    this._userIdentity = userIdentity;
    this._cacheDict = new People.RecentActivity.Providers.FeedObjectCacheDictionary(userIdentity);
};


People.RecentActivity.Providers.FeedObjectCache._instances = {};

People.RecentActivity.Providers.FeedObjectCache.getInstance = function(userIdentity) {
    /// <summary>
    ///     Gets the feed object cache for a user.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <returns type="People.RecentActivity.Providers.FeedObjectCache"></returns>
    Debug.assert(userIdentity != null, 'userIdentity');
    var key = userIdentity;
    if (!Jx.isUndefined(People.RecentActivity.Providers.FeedObjectCache._instances[key])) {
        // we already have a cache for this user.
        return People.RecentActivity.Providers.FeedObjectCache._instances[key];
    }

    // initialize a new cache.
    var cache = new People.RecentActivity.Providers.FeedObjectCache(userIdentity);
    People.RecentActivity.Providers.FeedObjectCache._instances[key] = cache;
    return cache;
};


People.RecentActivity.Providers.FeedObjectCache.prototype._userIdentity = null;
People.RecentActivity.Providers.FeedObjectCache.prototype._cacheDict = null;

People.RecentActivity.Providers.FeedObjectCache.prototype.addFeedObject = function(obj) {
    /// <summary>
    ///     Adds feed object to the cache.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed obj.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    this._cacheDict.add(obj);
};

People.RecentActivity.Providers.FeedObjectCache.prototype.getFeedObject = function(identifier, type) {
    /// <summary>
    ///     Gets the feed object from cache.
    /// </summary>
    /// <param name="identifier" type="String">The identifier.</param>
    /// <param name="type" type="String">The type of the object</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return null;
    }

    return this._cacheDict.item(identifier, type);
};

People.RecentActivity.Providers.FeedObjectCache.prototype.getFeedObjectByInfo = function(info) {
    /// <summary>
    ///     Gets the cached feed object by info.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return null;
    }

    return this._cacheDict.getFeedObjectByInfo(info);
};

People.RecentActivity.Providers.FeedObjectCache.prototype.clear = function() {
    /// <summary>
    ///     Clear all cached feed objects from the cache.
    /// </summary>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    this._cacheDict.clear();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="Cache.js" />
/// <reference path="CacheDictionary.js" />

People.RecentActivity.Providers.FeedObjectCacheDictionary = function(userIdentity) {
    /// <summary>
    ///     Represents a feed object cache dictionary.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    People.RecentActivity.Providers.CacheDictionary.call(this, userIdentity, 'o');
};

Jx.inherit(People.RecentActivity.Providers.FeedObjectCacheDictionary, People.RecentActivity.Providers.CacheDictionary);

Object.defineProperty(People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype, "maxCachedEntries", {
    get: function() {
        /// <summary>
        ///     Gets the max cached entries for the user.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedFeedObjects;
    },
    configurable: true
});

People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype.add = function(obj) {
    /// <summary>
    ///     Adds the specified feed object to cache.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The obj.</param>
    this.addInternal(this._getIdentifier$1(obj), obj);
};

People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype.getFeedObjectByInfo = function(info) {
    /// <summary>
    ///     Gets the cached feed object by info.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    return this._item(this._getIdentifier$1(info));
};

People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype.item = function (identifier, type) {
    /// <summary>
    ///     Gets a <see cref="T:People.RecentActivity.Core.FeedObjectInfo" /> with the given id.
    /// </summary>
    /// <param name="identifier" type="String">The identifier for the object.</param>
    /// <param name="type" type="String">The type of the object</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    return this._item(this._makeIdentifier(identifier, type));
};

People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype.remove = function (identifier, type) {
    /// <summary>
    ///     Removes a feed object from cache.
    /// </summary>
    /// <param name="identifier" type="String">The identifier for the object.</param>
    this.removeInternal(this._makeIdentifier(identifier, type));
};

People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype._getIdentifier$1 = function(obj) {
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="String"></returns>
    Debug.assert(obj != null, 'obj');
    var identifier = null;
    switch (obj.type) {
        case People.RecentActivity.Core.FeedObjectInfoType.entry:
            identifier = obj.id;
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            identifier = (obj.data).id;
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
            identifier = (obj.data).id;
            break;
    }

    Debug.assert(Jx.isNonEmptyString(identifier), 'identifier');
    return this._makeIdentifier(identifier, obj.type);
};

People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype._item = function (identifier) {
    /// <summary>
    ///     Gets a <see cref="T:People.RecentActivity.Core.FeedObjectInfo" /> with the given id.
    /// </summary>
    /// <param name="identifier" type="String">The identifier for the object.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    return People.RecentActivity.Providers.Cache.get(this.getKey(identifier));
};

People.RecentActivity.Providers.FeedObjectCacheDictionary.prototype._makeIdentifier = function (identifier, type) {
    /// <param name="identifier" type="String">The identifier for the object.</param>
    /// <param name="type" type="String">The type of the object</param>
    Debug.assert(Jx.isNumber(type), 'invalid type');
    Debug.assert(Jx.isNonEmptyString(identifier), 'invalid identifier');
    return type + '_' + identifier;
}

;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="Cache.js" />
/// <reference path="NotificationInfoCollection.js" />
/// <reference path="NotificationRefreshInfo.js" />

People.RecentActivity.Providers.NotificationCache = function(userIdentity) {
    /// <summary>
    ///     Provides access to notification cache.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <field name="_instances" type="Object" static="true">A map of instances, keyed by user's identity.</field>
    /// <field name="_userIdentity" type="String"></field>
    this._userIdentity = userIdentity;
};


People.RecentActivity.Providers.NotificationCache._instances = {};

People.RecentActivity.Providers.NotificationCache.getInstance = function(userIdentity) {
    /// <summary>
    ///     Gets the notification cache for a user.
    /// </summary>
    /// <param name="userIdentity" type="String">The user's identity, which is the user's cid.</param>
    /// <returns type="People.RecentActivity.Providers.NotificationCache"></returns>
    Debug.assert(userIdentity != null, 'userIdentity');
    var key = userIdentity;
    if (!Jx.isUndefined(People.RecentActivity.Providers.NotificationCache._instances[key])) {
        // we already have a cache for this user.
        return People.RecentActivity.Providers.NotificationCache._instances[key];
    }

    // initialize a new cache.
    var cache = new People.RecentActivity.Providers.NotificationCache(userIdentity);
    People.RecentActivity.Providers.NotificationCache._instances[key] = cache;
    return cache;
};


People.RecentActivity.Providers.NotificationCache.prototype._userIdentity = null;

People.RecentActivity.Providers.NotificationCache.prototype.addCacheEntry = function(networkId, notifications) {
    /// <summary>
    ///     Adds a cache entry of notifications for a network.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to cache.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    var maxEntries = People.RecentActivity.Platform.Configuration.instance.maxCachedNotificationsPerNetwork;
    if (notifications != null && notifications.length > maxEntries) {
        notifications = notifications.slice(notifications.length - maxEntries, notifications.length - maxEntries + maxEntries);
    }

    People.RecentActivity.Providers.Cache.add(this._getKey(networkId), notifications);
};

People.RecentActivity.Providers.NotificationCache.prototype.getNotifications = function(networkId) {
    /// <summary>
    ///     Gets the cached notifications for a network.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <returns type="Array" elementType="notificationInfo"></returns>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return new Array(0);
    }

    return People.RecentActivity.Providers.Cache.get(this._getKey(networkId)) || new Array(0);
};

People.RecentActivity.Providers.NotificationCache.prototype.refreshNotifications = function(networkId, notifications) {
    /// <summary>
    ///     Refreshes the cached notifications with newly retrieved notifications.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The new notifications.</param>
    /// <returns type="People.RecentActivity.Providers.notificationRefreshInfo"></returns>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return People.RecentActivity.Providers.create_notificationRefreshInfo(notifications, new Array(0), new Array(0));
    }

    var cachedNotifications = this.getNotifications(networkId);
    var notificationCollection = new People.RecentActivity.Providers.NotificationInfoCollection(cachedNotifications);
    var refreshInfo = notificationCollection.refresh(notifications);
    if (refreshInfo.notificationsAdded.length > 0 || refreshInfo.notificationsRemoved.length > 0 || refreshInfo.notificationsUpdated.length > 0) {
        notifications = notificationCollection.toArray();
        this.addCacheEntry(networkId, notifications);
    }

    return refreshInfo;
};

People.RecentActivity.Providers.NotificationCache.prototype.markNotificationsRead = function(networkId, notifications) {
    /// <summary>
    ///     Marks the specified notifications as read.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to update.</param>
    Debug.assert(notifications != null, 'notifications');
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    var cachedNotifications = this.getNotifications(networkId);
    var notificationCollection = new People.RecentActivity.Providers.NotificationInfoCollection(cachedNotifications);
    var updated = false;
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        var cached = notificationCollection.findNotificationById(notification.id);
        if (cached != null && cached.isUnread) {
            cached.isUnread = false;
            if (!updated) {
                updated = true;
            }        
        }    
    }

    if (updated) {
        notifications = notificationCollection.toArray();
        this.addCacheEntry(networkId, notifications);
    }
};

People.RecentActivity.Providers.NotificationCache.prototype.clear = function() {
    /// <summary>
    ///     Clear all cached notification
    /// </summary>
    if (!People.RecentActivity.Platform.Configuration.instance.cacheEnabled) {
        return;
    }

    var networks = People.RecentActivity.Platform.Configuration.instance.supportedNetworksForNotification;
    for (var n = 0; n < networks.length; n++) {
        var network = networks[n];
        People.RecentActivity.Providers.Cache.remove(this._getKey(network));
    }
};

People.RecentActivity.Providers.NotificationCache.prototype.getLastReadTime = function(networkId) {
    /// <summary>
    ///     Gets the last read time for notifications.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <returns type="Date"></returns>
    var timeStamp = Jx.appData.localSettings().get(this._getLastReadTimeKey(networkId));
    if (Jx.isNullOrUndefined(timeStamp)) {
        return Date.empty;
    }

    return timeStamp;
};

People.RecentActivity.Providers.NotificationCache.prototype.updateLastReadTime = function(networkId, time) {
    /// <summary>
    ///     Updates the last read time for notifications.
    /// </summary>
    /// <param name="networkId" type="String">The network id.</param>
    /// <param name="time" type="Date">The time stamp.</param>
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    Debug.assert(time != null, 'time');
    var storedTime = this.getLastReadTime(networkId);
    if ((storedTime == null) || time > storedTime) {
        Jx.appData.localSettings().set(this._getLastReadTimeKey(networkId), time);
    }
};

People.RecentActivity.Providers.NotificationCache.prototype._getLastReadTimeKey = function(networkId) {
    /// <param name="networkId" type="String"></param>
    /// <returns type="String"></returns>
    return this._getKey(networkId) + '_lastread';
};

People.RecentActivity.Providers.NotificationCache.prototype._getKey = function(networkId) {
    /// <param name="networkId" type="String"></param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(networkId), 'networkId');
    return this._userIdentity + '_n_' + networkId;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\NotificationInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="NotificationRefreshInfo.js" />
/// <reference path="ResourceInfoCollection.js" />

People.RecentActivity.Providers.NotificationInfoCollection = function(notifications) {
    /// <summary>
    ///     Represents a collection of <see cref="T:People.RecentActivity.Core.NotificationInfo" />.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications.</param>
    People.RecentActivity.Providers.ResourceInfoCollection.call(this, notifications);
};

Jx.inherit(People.RecentActivity.Providers.NotificationInfoCollection, People.RecentActivity.Providers.ResourceInfoCollection);

Object.defineProperty(People.RecentActivity.Providers.NotificationInfoCollection.prototype, "maxSize", {
    get: function() {
        /// <summary>
        ///     Gets the max size of the collection.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedNotificationsPerNetwork;
    },
    configurable: true
});

People.RecentActivity.Providers.NotificationInfoCollection.prototype.findNotificationById = function(id) {
    /// <summary>
    ///     Finds the notification by id.
    /// </summary>
    /// <param name="id" type="String">The id.</param>
    /// <returns type="People.RecentActivity.Core.create_notificationInfo"></returns>
    return this.findResourceById(id);
};

People.RecentActivity.Providers.NotificationInfoCollection.prototype.refresh = function(notifications) {
    /// <summary>
    ///     Refreshes the collection with a new array of <see cref="T:People.RecentActivity.Core.NotificationInfo" />.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The array of <see cref="T:People.RecentActivity.Core.NotificationInfo" /></param>
    /// <returns type="People.RecentActivity.Providers.notificationRefreshInfo"></returns>
    var refreshInfo = this.refreshInternal(notifications);
    return People.RecentActivity.Providers.create_notificationRefreshInfo(refreshInfo.resourcesAdded, refreshInfo.resourcesUpdated, refreshInfo.resourcesRemoved);
};

People.RecentActivity.Providers.NotificationInfoCollection.prototype.toArray = function() {
    /// <summary>
    ///     Converts the collection to an array.
    /// </summary>
    /// <returns type="Array" elementType="notificationInfo"></returns>
    return this.resources;
};

People.RecentActivity.Providers.NotificationInfoCollection.prototype.isUpdated = function(oldResource, newResource) {
    /// <summary>
    ///     Determines whether a notification with the same id is updated.
    /// </summary>
    /// <param name="oldResource" type="Object">The old notification.</param>
    /// <param name="newResource" type="Object">The new notification.</param>
    /// <returns type="Boolean"></returns>
    var oldObject = oldResource;
    var newObject = newResource;
    if (oldObject.timestamp !== newObject.timestamp || oldObject.isUnread !== newObject.isUnread) {
        return true;
    }

    return false;
};

People.RecentActivity.Providers.NotificationInfoCollection.prototype.getId = function(resource) {
    /// <summary>
    ///     Gets the id for the given resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="String"></returns>
    Debug.assert(resource != null, 'resource');
    var notification = resource;
    return notification.id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="FeedObjectInfoCollection.js" />

People.RecentActivity.Providers.PhotoInfoCollection = function(photo) {
    /// <summary>
    ///     Represents a collection of photos.
    /// </summary>
    /// <param name="photo" type="Array" elementType="feedObjectInfo">The photos.</param>
    People.RecentActivity.Providers.FeedObjectInfoCollection.call(this, photo);
};

Jx.inherit(People.RecentActivity.Providers.PhotoInfoCollection, People.RecentActivity.Providers.FeedObjectInfoCollection);

People.RecentActivity.Providers.PhotoInfoCollection.prototype.findObjectByInfo = function(info) {
    /// <summary>
    ///     Finds the object by info.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(info != null, 'info');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'type');
    return this.findResourceById((info.data).id);
};

People.RecentActivity.Providers.PhotoInfoCollection.prototype.isUpdated = function(oldResource, newResource) {
    /// <summary>
    ///     Determines whether a feed object with the same id is updated.
    /// </summary>
    /// <param name="oldResource" type="Object">The old object.</param>
    /// <param name="newResource" type="Object">The new object.</param>
    /// <returns type="Boolean"></returns>
    if (People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.isUpdated.call(this, oldResource, newResource)) {
        return true;
    }

    var oldPhoto = (oldResource).data;
    var newPhoto = (newResource).data;
    if (oldPhoto.caption !== newPhoto.caption) {
        return true;
    }

    if (oldPhoto.index !== newPhoto.index) {
        return true;
    }

    return false;
};

People.RecentActivity.Providers.PhotoInfoCollection.prototype.onRefreshed = function(cached, resource) {
    /// <summary>
    ///     Called when a cached resource is refreshed with a new resource.
    /// </summary>
    /// <param name="cached" type="Object">The cached.</param>
    /// <param name="resource" type="Object">The new resource.</param>
    var cachedObj = cached;
    var obj = resource;
    // Keep cached photo's comment and reaction information, we don't retrieve any comments/reactions for the new photo at this time.
    obj.commentDetails = cachedObj.commentDetails;
    obj.reactionDetails = cachedObj.reactionDetails;
    var cachedPhoto = cachedObj.data;
    var photo = obj.data;
    // Keep cached photo's tags. We don't retrieve any tags for the new photo at this time.
    photo.tags = cachedPhoto.tags;
    People.RecentActivity.Providers.FeedObjectInfoCollection.prototype.onRefreshed.call(this, cached, resource);
};

People.RecentActivity.Providers.PhotoInfoCollection.prototype.getMaxSize = function() {
    /// <summary>
    ///     Gets the max size of the collection.
    /// </summary>
    /// <returns type="Number" integer="true"></returns>
    return People.RecentActivity.Platform.Configuration.instance.maxCachedPhotosPerAlbum;
};

People.RecentActivity.Providers.PhotoInfoCollection.prototype.getId = function(resource) {
    /// <summary>
    ///     Gets the id for the given resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="String"></returns>
    Debug.assert(resource != null, 'resource');
    var photo = resource;
    Debug.assert(photo.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'type');
    // Return the photo id, instead of the object id.
    return (photo.data).id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\PhotoTagInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="PhotoTagRefreshInfo.js" />
/// <reference path="ResourceInfoCollection.js" />

People.RecentActivity.Providers.PhotoTagInfoCollection = function(photoTags) {
    /// <summary>
    ///     Represents a collection of photo tags.
    /// </summary>
    /// <param name="photoTags" type="Array" elementType="photoTagInfo">The photo tags.</param>
    People.RecentActivity.Providers.ResourceInfoCollection.call(this, photoTags);
};

Jx.inherit(People.RecentActivity.Providers.PhotoTagInfoCollection, People.RecentActivity.Providers.ResourceInfoCollection);

Object.defineProperty(People.RecentActivity.Providers.PhotoTagInfoCollection.prototype, "maxSize", {
    get: function() {
        /// <summary>
        ///     Gets the max size of the collection.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedPhotoTagsPerPhoto;
    },
    configurable: true
});

People.RecentActivity.Providers.PhotoTagInfoCollection.prototype.refresh = function(photoTags) {
    /// <summary>
    ///     Refreshes the collection with a new array of <see cref="T:People.RecentActivity.Core.PhotoTagInfo" />.
    /// </summary>
    /// <param name="photoTags" type="Array" elementType="photoTagInfo">The array of <see cref="T:People.RecentActivity.Core.PhotoTagInfo" /></param>
    /// <returns type="People.RecentActivity.Providers.photoTagRefreshInfo"></returns>
    var refreshInfo = this.refreshInternal(photoTags);
    return People.RecentActivity.Providers.create_photoTagRefreshInfo(refreshInfo.resourcesAdded, refreshInfo.resourcesRemoved);
};

People.RecentActivity.Providers.PhotoTagInfoCollection.prototype.toArray = function() {
    /// <summary>
    ///     Converts the collection to an array.
    /// </summary>
    /// <returns type="Array" elementType="photoTagInfo"></returns>
    return this.resources;
};

People.RecentActivity.Providers.PhotoTagInfoCollection.prototype.getId = function(resource) {
    /// <summary>
    ///     Gets the id for the given resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="String"></returns>
    Debug.assert(resource != null, 'resource');
    var photoTag = resource;
    return photoTag.contact.id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ReactionInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="ReactionRefreshInfo.js" />
/// <reference path="ResourceInfoCollection.js" />

People.RecentActivity.Providers.ReactionInfoCollection = function(reactions) {
    /// <summary>
    ///     Represents a collection of <see cref="T:People.RecentActivity.Core.ReactionInfo" />.
    /// </summary>
    /// <param name="reactions" type="Array" elementType="reactionInfo">The reactions.</param>
    People.RecentActivity.Providers.ResourceInfoCollection.call(this, reactions);
};

Jx.inherit(People.RecentActivity.Providers.ReactionInfoCollection, People.RecentActivity.Providers.ResourceInfoCollection);

Object.defineProperty(People.RecentActivity.Providers.ReactionInfoCollection.prototype, "maxSize", {
    get: function() {
        /// <summary>
        ///     Gets the max size of the collection.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Platform.Configuration.instance.maxCachedReactionsPerEntry;
    },
    configurable: true
});

People.RecentActivity.Providers.ReactionInfoCollection.prototype.refresh = function(reactions) {
    /// <summary>
    ///     Refreshes the collection with a new array of <see cref="T:People.RecentActivity.Core.ReactionInfo" />.
    /// </summary>
    /// <param name="reactions" type="Array" elementType="reactionInfo">The array of <see cref="T:People.RecentActivity.Core.ReactionInfo" /></param>
    /// <returns type="People.RecentActivity.Providers.reactionRefreshInfo"></returns>
    var refreshInfo = this.refreshInternal(reactions);
    return People.RecentActivity.Providers.create_reactionRefreshInfo(refreshInfo.resourcesAdded, refreshInfo.resourcesRemoved);
};

People.RecentActivity.Providers.ReactionInfoCollection.prototype.add = function(reaction) {
    /// <summary>
    ///     Adds the specified reaction.
    /// </summary>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    this.addInternal(reaction);
};

People.RecentActivity.Providers.ReactionInfoCollection.prototype.remove = function(reaction) {
    /// <summary>
    ///     Removes the specified reaction.
    /// </summary>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <returns type="Boolean"></returns>
    return this.removeInternal(reaction);
};

People.RecentActivity.Providers.ReactionInfoCollection.prototype.toArray = function() {
    /// <summary>
    ///     Converts the collection to an array.
    /// </summary>
    /// <returns type="Array" elementType="reactionInfo"></returns>
    return this.resources;
};

People.RecentActivity.Providers.ReactionInfoCollection.prototype.getId = function(resource) {
    /// <summary>
    ///     Gets the id for the given resource.
    /// </summary>
    /// <param name="resource" type="Object">The resource.</param>
    /// <returns type="String"></returns>
    Debug.assert(resource != null, 'resource');
    var reaction = resource;
    return People.Social.format('{0}_{1}', reaction.type.id, reaction.publisher.id);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.CollectionHelper = function() {
    /// <summary>
    ///     Contains collection related helper methods.
    /// </summary>
};

People.RecentActivity.Providers.CollectionHelper.joinKeys = function(items, wrapInQuotes) {
    /// <param name="items" type="System.Collections.Generic.IEnumerable"></param>
    /// <param name="wrapInQuotes" type="Boolean"></param>
    /// <returns type="String"></returns>
    var output = '';
    for (var n = 0; n < items.length; n++) {
        var key = items[n];
        if (output.length > 0) {
            output += ',';
        }

        if (wrapInQuotes) {
            output += "'";
            output += key;
            output += "'";
        }
        else {
            output += key;
        }    
    }

    return output;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\EntityInfo.js" />
/// <reference path="..\..\Core\EntityInfoType.js" />
/// <reference path="..\..\Core\LinkEntityInfo.js" />

People.RecentActivity.Providers.EntityHelper = function() {
    /// <summary>
    ///     The entity helper class to create different types of entities.
    /// </summary>
    /// <field name="_urlRegex" type="String" static="true"></field>
};


People.RecentActivity.Providers.EntityHelper._urlRegex = 'https?://[^\\s/\\[\\]()\\?!]+(/[^\\s()\\[\\]<>:;]*)?';

People.RecentActivity.Providers.EntityHelper.getLinkEntities = function(text) {
    /// <summary>
    ///     Gets the link entities.
    /// </summary>
    /// <param name="text" type="String">The text.</param>
    /// <returns type="Array" elementType="entityInfo"></returns>
    var entities = [];
    if (!Jx.isNonEmptyString(text)) {
        return new Array(0);
    }

    // gi means global(find all matches), and case insensitive.
    var regex = new RegExp(People.RecentActivity.Providers.EntityHelper._urlRegex, 'gi');
    var matches;
    while ((matches = regex.exec(text)) != null && matches.length > 0) {
        var match = matches[0];
        var entity = People.RecentActivity.Core.create_entityInfo(People.RecentActivity.Core.EntityInfoType.link, People.RecentActivity.Core.create_linkEntityInfo(match, match), regex.lastIndex - match.length, match.length);
        entities.push(entity);
    }

    return entities;
};

People.RecentActivity.Providers.EntityHelper.sortEntities = function(entities) {
    /// <summary>
    ///     Sorts entities based on offset.
    /// </summary>
    /// <param name="entities" type="Array">The entities.</param>
    Debug.assert(entities != null, 'entities');
    entities.sort(function(a, b) {
        return (a).offset - (b).offset;
    });
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ConfigurationInfo.js" />
/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Platform\Configuration.js" />
/// <reference path="..\Platform\Platform.js" />
/// <reference path="IdentityType.js" />
/// <reference path="Providers\FacebookProvider.js" />
/// <reference path="Providers\FeedAggregator.js" />
/// <reference path="Providers\RetailModeProvider.js" />
/// <reference path="Providers\SupProvider.js" />

People.RecentActivity.Providers.FeedProviderFactory = function() {
    /// <summary>
    ///     Provides a factory for feed provider consumers.
    /// </summary>
    /// <field name="_instance" type="People.RecentActivity.Providers.FeedProviderFactory" static="true">The instance of the factory.</field>
};

People.RecentActivity.Providers.FeedProviderFactory._instance = null;

Object.defineProperty(People.RecentActivity.Providers.FeedProviderFactory, "instance", {
    get: function() {
        /// <summary>
        ///     Gets or sets the instance of the <see cref="T:People.RecentActivity.Providers.FeedProviderFactory" />.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.FeedProviderFactory"></value>
        if (People.RecentActivity.Providers.FeedProviderFactory._instance == null) {
            // create a default instance.
            People.RecentActivity.Providers.FeedProviderFactory._instance = new People.RecentActivity.Providers.FeedProviderFactory();
        }

        return People.RecentActivity.Providers.FeedProviderFactory._instance;
    },
    set: function(value) {
        Debug.assert(value != null, 'instance');

        People.RecentActivity.Providers.FeedProviderFactory._instance = value;
    }
});

People.RecentActivity.Providers.FeedProviderFactory.prototype.createFeedProvider = function(identityId, identityType, network, events) {
    /// <summary>
    ///     Creates a new feed provider.
    /// </summary>
    /// <param name="identityId" type="String">The identity id.</param>
    /// <param name="identityType" type="People.RecentActivity.Providers.IdentityType">The identity type.</param>
    /// <param name="network" type="People.RecentActivity.Core.create_networkInfo">The network.</param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents">The event handler.</param>
    /// <returns type="People.RecentActivity.Core.IFeedProvider"></returns>
    Debug.assert(Jx.isNonEmptyString(identityId), 'identityId');
    Debug.assert(network != null, 'network');
    Debug.assert(events != null, 'events');

    var provider = null;

    switch (network.id) {
        case People.RecentActivity.Core.NetworkId.facebook:
            provider = new People.RecentActivity.Providers.FacebookProvider(identityId, identityType, network, events, false, null);
            break;

        case People.RecentActivity.Core.NetworkId.twitter:
            provider = new People.RecentActivity.Providers.SupProvider(identityId, identityType, network, events, false, null);
            break;

        case People.RecentActivity.Core.NetworkId.all:
            provider = this._getAllNetworkProvider(identityId, identityType, events);
            break;

        default:
            throw new Error('Unsupported Social Network!');
    }

    if (People.RecentActivity.Platform.Configuration.instance.isRetailMode) {
        provider = new People.RecentActivity.Providers.RetailModeProvider(provider, events);
    }

    return provider;
};

People.RecentActivity.Providers.FeedProviderFactory.prototype.getNetworks = function(personId) {
    /// <summary>
    ///     Gets the networks for a given person.
    /// </summary>
    /// <param name="personId" type="String">The person ID.</param>
    /// <returns type="Array" elementType="networkInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(personId), 'personId');

    return People.RecentActivity.Platform.Platform.instance.getNetworks(personId);
};

People.RecentActivity.Providers.FeedProviderFactory.prototype.getUserConnectableNetworks = function() {
    /// <summary>
    ///     Gets the connetable networks for the user.
    /// </summary>
    /// <returns type="Array" elementType="networkInfo"></returns>
    return People.RecentActivity.Platform.Platform.instance.getUserConnectableNetworks();
};

People.RecentActivity.Providers.FeedProviderFactory.prototype.getNetwork = function(sourceId) {
    /// <summary>
    ///     Gets a single network info instance.
    /// </summary>
    /// <param name="sourceId" type="String">The source ID.</param>
    /// <returns type="People.RecentActivity.Core.create_networkInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(sourceId), '!string.IsNullOrEmpty(sourceId)');

    return People.RecentActivity.Platform.Platform.instance.getNetworkInfoById(sourceId);
};

People.RecentActivity.Providers.FeedProviderFactory.prototype.getConfiguration = function() {
    /// <summary>
    ///     Gets the configuration.
    /// </summary>
    /// <returns type="People.RecentActivity.Core.create_configurationInfo"></returns>
    var config = People.RecentActivity.Platform.Configuration.instance;

    return People.RecentActivity.Core.create_configurationInfo(
        config.maxCachedEntriesPerContact,
        config.feedEntriesBatchSize,
        config.maxCachedReactionsPerEntry,
        config.maxCachedPhotoTagsPerPhoto,
        config.aggregatedNetworkId,
        config.whatsNewPersonId);
};

People.RecentActivity.Providers.FeedProviderFactory.prototype._getAllNetworkProvider = function(identityId, identityType, events) {
    /// <param name="identityId" type="String"></param>
    /// <param name="identityType" type="People.RecentActivity.Providers.IdentityType"></param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents"></param>
    /// <returns type="People.RecentActivity.Core.IFeedProvider"></returns>
    // It doesn't make sense to have a FeedAggregator just for a network.
    Debug.assert(!identityType, 'identityType');

    var networks = People.RecentActivity.Platform.Platform.instance.getNetworks(identityId);

    // Exclude the aggregated network.
    networks = networks.filter(function(network) {
        return (network).id !== People.RecentActivity.Platform.Configuration.instance.aggregatedNetworkId;
    });

    Debug.assert(networks.length > 0, 'networks.Length');

    if (networks.length === 1) {
        Jx.log.write(4, People.Social.format('FeedProviderFactory.GetAllNetworkProvider({0}): only 1 network: {1}', identityId, networks[0].id));

        // If there is only one network for this person, just create a regular feed provider.
        return this.createFeedProvider(identityId, identityType, networks[0], events);
    }

    Jx.log.write(4, People.Social.format('FeedProviderFactory.GetAllNetworkProvider({0}): creating FeedAggregator.', identityId));

    // We need to aggregate multiple networks, so create a FeedAggregator.
    return new People.RecentActivity.Providers.FeedAggregator(identityId, networks, events);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\CommentDetailsInfo.js" />
/// <reference path="..\..\Core\ContactInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\Core\Permissions.js" />
/// <reference path="..\..\Core\PhotoAlbumInfo.js" />
/// <reference path="..\..\Core\PhotoInfo.js" />
/// <reference path="..\..\Core\ReactionDetailsInfo.js" />
/// <reference path="..\..\Platform\AuthInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\..\Platform\Platform.js" />
/// <reference path="..\Helpers\EntityHelper.js" />
/// <reference path="..\Helpers\SocialHelper.js" />
/// <reference path="..\Serializers\Sup\Picture.js" />
/// <reference path="..\Validators\FacebookValidator.js" />
/// <reference path="..\Validators\SupValidator.js" />

(function () {
    var supUserTileNormalSize = 'UserTileL';
    var supUserTileLargeSize = 'UserTileXL';
    var fakeAlbumObjectId = '__fake_album_id__';
    var facebookProfilePictureFormat = 'http://graph.facebook.com/{0}/picture?type=large';
    var facebookProfileUrlFormat = 'http://www.facebook.com/#!/profile.php?id={0}';

    People.RecentActivity.Providers.SocialCache = function (networkId) {
        /// <summary>
        ///     Provides an in memory cache for all social networks.
        /// </summary>
        /// <param name="networkId" type="String">The network id.</param>
        /// <field name="_contactDict" type="Object"></field>
        /// <field name="_photoDict" type="Object"></field>
        /// <field name="_albumDict" type="Object"></field>
        /// <field name="_usernameToContactIdMap" type="Object"></field>
        /// <field name="_objectIdToPhotoIdMap" type="Object"></field>
        /// <field name="_objectIdToAlbumIdMap" type="Object"></field>
        /// <field name="_networkId" type="String"></field>
        /// <field name="_me" type="People.RecentActivity.Core.create_contactInfo"></field>
        this._contactDict = {};
        this._photoDict = {};
        this._albumDict = {};
        this._usernameToContactIdMap = {};
        this._objectIdToPhotoIdMap = {};
        this._objectIdToAlbumIdMap = {};
        this._networkId = networkId;
    };

    People.RecentActivity.Providers.SocialCache.prototype._networkId = null;
    People.RecentActivity.Providers.SocialCache.prototype._me = null;

    Object.defineProperty(People.RecentActivity.Providers.SocialCache.prototype, "meContact", {
        get: function () {
            /// <summary>
            ///     Gets me contact for the network.
            /// </summary>
            /// <value type="People.RecentActivity.Core.create_contactInfo"></value>
            if (this._me == null) {
                this._me = this.getContact(People.RecentActivity.Platform.AuthInfo.getInstance(this._networkId).userId.id);
            }

            return this._me;
        }
    });

    People.RecentActivity.Providers.SocialCache.prototype.clear = function () {
        /// <summary>
        ///     Clears all cached content.
        /// </summary>
        People.Social.clearKeys(this._contactDict);
        People.Social.clearKeys(this._albumDict);
        People.Social.clearKeys(this._photoDict);
        People.Social.clearKeys(this._objectIdToAlbumIdMap);
        People.Social.clearKeys(this._objectIdToPhotoIdMap);
        People.Social.clearKeys(this._usernameToContactIdMap);
    };

    People.RecentActivity.Providers.SocialCache.prototype.getContact = function (id) {
        /// <summary>
        ///     Gets a contact from cache, if not existing, a new one will be created.
        /// </summary>
        /// <param name="id" type="String">The id.</param>
        /// <returns type="People.RecentActivity.Core.create_contactInfo"></returns>
        Debug.assert(Jx.isNonEmptyString(id), 'id');

        var key = this._getKey(id);
        var contact;

        if (!Jx.isUndefined(this._contactDict[key])) {
            contact = this._contactDict[key];
        }
        else {
            contact = People.RecentActivity.Core.create_contactInfo(id, this._networkId, '', '', '', false);
            this._contactDict[key] = contact;
        }

        People.RecentActivity.Platform.Platform.instance.getContactInfoDetails(contact);
        return contact;
    };

    People.RecentActivity.Providers.SocialCache.prototype.refreshContact = function (contact) {
        /// <summary>
        ///     Refreshes the contact info in the cache with the contact's info retrieved from the network.
        /// </summary>
        /// <param name="contact" type="Object">The contact object from the network.</param>
        if (contact == null) {
            Jx.log.write(3, People.Social.format('SocialCache.RefreshContact({0}): null contact!', contact));
            return;
        }

        this.refreshContacts([contact]);
    };

    People.RecentActivity.Providers.SocialCache.prototype.refreshContacts = function (contacts) {
        /// <summary>
        ///     Refreshes the contacts' info in the cache with contacts' info retrieved from network.
        /// </summary>
        /// <param name="contacts" type="Array" elementType="Object">The array of objects which contain the contact info from the network.</param>
        if (!People.RecentActivity.Providers.Utilities.isArray(contacts)) {
            Jx.log.write(3, 'SocialCache.RefreshContacts()');
            return;
        }

        switch (this._networkId) {
            case People.RecentActivity.Core.NetworkId.facebook:
                var fbContacts = contacts;
                for (var n = 0; n < fbContacts.length; n++) {
                    var fbContact = fbContacts[n];
                    if (!People.RecentActivity.Providers.FacebookValidator.validateContact(fbContact)) {
                        continue;
                    }

                    var contact = this.getContact(fbContact.id.toString());
                    if (contact.personId == null) {
                        contact.name = fbContact.name || contact.name;
                        contact.picture = fbContact.pic_square || contact.picture;
                        contact.isFriend = false;
                        contact.largePicture = People.Social.format(facebookProfilePictureFormat, contact.id);
                        contact.profileUrl = People.Social.format(facebookProfileUrlFormat, contact.id);
                    }
                }

                break;
            case People.RecentActivity.Core.NetworkId.twitter:
                var users = contacts;
                for (var n = 0; n < users.length; n++) {
                    var user = users[n];
                    if (!People.RecentActivity.Providers.SupValidator.validateContact(user)) {
                        continue;
                    }

                    var contact = this.getContact(user.ObjectId);
                    contact.networkHandle = user.ScreenName;

                    if (contact.personId == null) {
                        contact.name = user.Name || contact.name;
                        contact.isFriend = false;
                        contact.profileUrl = user.ProfileUrl;

                        this._updateSupUserProfilePics(contact, user);
                    }
                }

                break;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype.getPhoto = function (id) {
        /// <summary>
        ///     Gets the photo from cache, if not available, a new one will be created with the id.
        /// </summary>
        /// <param name="id" type="String">The photo id.</param>
        /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
        Debug.assert(Jx.isNonEmptyString(id), 'id');

        var key = this._getKey(id);
        var config = People.RecentActivity.Platform.Configuration.instance;

        if (Jx.isUndefined(this._photoDict[key])) {
            var info = People.RecentActivity.Core.create_photoInfo(id, null, null, null, null, 0, 0, null, 0, 0, null, 0, 0);
            var reactionInfo = config.getNetworkReactionInfos(this._networkId);
            var reactions = new Array(reactionInfo.length);

            for (var i = 0, len = reactionInfo.length; i < len; i++) {
                // Permissino will be updated later if we can access this photo from service.
                reactions[i] = People.RecentActivity.Core.create_reactionDetailsInfo(reactionInfo[i].id, 0, People.RecentActivity.Core.Permissions.none);
            }

            var commentInfo = People.RecentActivity.Core.create_commentDetailsInfo(0, this._networkId !== People.RecentActivity.Core.NetworkId.twitter, People.RecentActivity.Core.Permissions.none);
            commentInfo.icon = config.getCommentIcon(this._networkId);
            this._photoDict[key] = People.RecentActivity.Core.create_feedObjectInfo(null/* This object id will be populated later.*/, this._networkId, People.RecentActivity.Core.FeedObjectInfoType.photo, info, null, 0, commentInfo, new Array(0), reactions, new Array(0));
        }

        return this._photoDict[key];
    };

    People.RecentActivity.Providers.SocialCache.prototype.refreshPhoto = function (entry, photo) {
        /// <summary>
        ///     Refreshes the photo in the cache with information retrieved from network.
        /// </summary>
        /// <param name="entry" type="People.RecentActivity.Providers.Sup.FeedEntry">The parent feed entry, if available.</param>
        /// <param name="photo" type="Object">The photo.</param>
        if (photo == null) {
            Jx.log.write(3, People.Social.format('SocialCache.RefreshPhoto({0}): null photo!', photo));
            return;
        }

        this.refreshPhotos(entry, [photo]);
    };

    People.RecentActivity.Providers.SocialCache.prototype.refreshPhotos = function (entry, photos) {
        /// <summary>
        ///     Refreshes the photos in the cache with information retrieved from network.
        /// </summary>
        /// <param name="entry" type="People.RecentActivity.Providers.Sup.FeedEntry">The parent feed entry, if available.</param>
        /// <param name="photos" type="Array" elementType="Object">The photos.</param>
        if (!People.RecentActivity.Providers.Utilities.isArray(photos)) {
            Jx.log.write(3, 'SocialCache.RefreshPhotos()');
            return;
        }

        switch (this._networkId) {
            case People.RecentActivity.Core.NetworkId.facebook:
                var fbPhotos = photos;
                for (var n = 0; n < fbPhotos.length; n++) {
                    var fbPhoto = fbPhotos[n];

                    if (!People.RecentActivity.Providers.FacebookValidator.validatePhoto(fbPhoto)) {
                        continue;
                    }

                    var obj = this.getPhoto(fbPhoto.pid);
                    var photo = obj.data;

                    // This ID is Facebook object id, which is different than photo id(pid).
                    obj.id = (!Jx.isNullOrUndefined(fbPhoto.object_id)) ? fbPhoto.object_id.toString() : obj.id;
                    obj.url = fbPhoto.link || obj.url;
                    obj.timestamp = (!isNaN(fbPhoto.created)) ? People.RecentActivity.Providers.SocialHelper.getValidTime(fbPhoto.created) : obj.timestamp;
                    photo.caption = fbPhoto.caption || photo.caption;

                    // Sometimes due to permission issue photo aid comes back as 0, then we use existing AlbumId which might be
                    // already set from feed response earlier.
                    photo.albumId = (Jx.isNonEmptyString(fbPhoto.aid)) ? fbPhoto.aid : photo.albumId;

                    // Get the contact from cache, if not available, a new one will be created, and information
                    // should be refreshed later.
                    photo.owner = (!Jx.isNullOrUndefined(fbPhoto.owner)) ? this.getContact(fbPhoto.owner.toString()) : photo.owner;

                    // If we already got entities for this photo, which means it is a photo from feed, so ignore here,
                    // since in feed we can have @mention entities.
                    if (!photo.entities.length) {
                        // Although photo's caption allows @mention, but we can't get this info from Facebook, so
                        // We only populate link entities here.
                        photo.entities = People.RecentActivity.Providers.EntityHelper.getLinkEntities(photo.caption);
                    }

                    // Since we can get this photo from service, enable reaction permissions.
                    this._updateFacebookReactions(obj, fbPhoto.comment_info, fbPhoto.like_info);

                    // Populate different sizes of the images for the photo.
                    this._populateFacebookPhotoImages(photo, fbPhoto);
                }

                break;
            case People.RecentActivity.Core.NetworkId.twitter:
                // Twitter does not have albums, and as such should always have a parent entry.
                Debug.assert(entry != null, 'entry');

                var twitterPhotos = photos;
                for (var n = 0; n < twitterPhotos.length; n++) {
                    var twitterPhoto = twitterPhotos[n];

                    if (!People.RecentActivity.Providers.SupValidator.validatePhoto(twitterPhoto)) {
                        continue;
                    }

                    var obj = this.getPhoto(twitterPhoto.ObjectId);
                    var photo = obj.data;

                    // Use the activity id as the photo feed object id, since we use this id to query for comments/reactions in self page for photo entry,
                    // but we need to use the activity id for Twitter to get the entry's comments/reactions.
                    obj.id = (Jx.isNonEmptyString(twitterPhoto.activityObjectId)) ? twitterPhoto.activityObjectId : obj.id;
                    obj.url = twitterPhoto.url || obj.url;
                    obj.timestamp = (!isNaN(twitterPhoto.timestamp)) ? twitterPhoto.timestamp : obj.timestamp;

                    photo.owner = (twitterPhoto.author != null && Jx.isNonEmptyString(twitterPhoto.author.ObjectId)) ? this.getContact(twitterPhoto.author.ObjectId) : photo.owner;
                    photo.albumId = '__fake_twitter_aid__' + twitterPhoto.ObjectId;

                    this.refreshContact(twitterPhoto.author);

                    // once the author has been refreshed, get the comment prefix for this photo as well.
                    var screenName = (twitterPhoto.author != null) ? twitterPhoto.author.ScreenName : '';

                    obj.commentDetails.prefix = People.RecentActivity.Providers.SocialHelper.getTwitterCommentPrefix(screenName);

                    var limit = entry.Reactions.ReplyReaction.TextLimit;
                    if (limit > 0) {
                        obj.commentDetails.maximumLength = limit;
                    }

                    // Populate different sizes of the images for the photo.
                    this._populateTwitterPhotoImages(photo, twitterPhoto.Streams);

                    // Since we can get this photo from service, enable reaction permissions.
                    this._enableSupReactions(obj);
                }

                break;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype.getAlbum = function (id) {
        /// <summary>
        ///     Gets the album from cache, if not available, a new one will be created with the id.
        /// </summary>
        /// <param name="id" type="String">The album id.</param>
        /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
        Debug.assert(Jx.isNonEmptyString(id), 'id');

        var key = this._getKey(id);
        if (Jx.isUndefined(this._albumDict[key])) {
            var info = People.RecentActivity.Core.create_photoAlbumInfo(id, null, null, null, new Array(0), 0, null, new Array(0));
            var likeInfo = People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.like);

            var commentInfo = People.RecentActivity.Core.create_commentDetailsInfo(0, this._networkId !== People.RecentActivity.Core.NetworkId.twitter, People.RecentActivity.Core.Permissions.none);
            commentInfo.icon = People.RecentActivity.Platform.Configuration.instance.getCommentIcon(this._networkId);

            this._albumDict[key] = People.RecentActivity.Core.create_feedObjectInfo(fakeAlbumObjectId, this._networkId, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, info, null, 0, commentInfo, new Array(0), [People.RecentActivity.Core.create_reactionDetailsInfo(likeInfo.id, 0, People.RecentActivity.Core.Permissions.none)], new Array(0));
        }

        return this._albumDict[key];
    };

    People.RecentActivity.Providers.SocialCache.prototype.refreshAlbums = function (albums) {
        /// <summary>
        ///     Refreshes the albums in the cache with information retrieved from network.
        /// </summary>
        /// <param name="albums" type="Array" elementType="Object">The albums.</param>
        if (!People.RecentActivity.Providers.Utilities.isArray(albums)) {
            Jx.log.write(3, 'SocialCache.RefreshAlbums()');
            return;
        }

        switch (this._networkId) {
            case People.RecentActivity.Core.NetworkId.facebook:
                var fbAlbums = albums;
                for (var n = 0; n < fbAlbums.length; n++) {
                    var fbAlbum = fbAlbums[n];
                    if (!People.RecentActivity.Providers.FacebookValidator.validateAlbum(fbAlbum)) {
                        continue;
                    }

                    var obj = this.getAlbum(fbAlbum.aid);
                    var album = obj.data;
                    // This ID is Facebook object id, which is different than album id (aid).
                    obj.id = (!Jx.isNullOrUndefined(fbAlbum.object_id)) ? fbAlbum.object_id.toString() : obj.id;
                    obj.url = fbAlbum.link || obj.url;
                    obj.timestamp = (!isNaN(fbAlbum.modified)) ? People.RecentActivity.Providers.SocialHelper.getValidTime(fbAlbum.modified) : obj.timestamp;
                    album.name = fbAlbum.name || album.name;
                    album.description = fbAlbum.description || album.description;
                    album.totalCount = (!isNaN(fbAlbum.size)) ? fbAlbum.size : album.totalCount;
                    // Get the photo from cache, if not available, a new one will be created, and information
                    // should be refreshed later.
                    album.cover = (Jx.isNonEmptyString(fbAlbum.cover_pid)) ? this.getPhoto(fbAlbum.cover_pid) : album.cover;
                    // Get the contact from cache, if not available, a new one will be created, and information
                    // should be refreshed later.
                    album.owner = (!Jx.isNullOrUndefined(fbAlbum.owner)) ? this.getContact(fbAlbum.owner.toString()) : album.owner;
                    // Album's description might have link in it.
                    album.entities = People.RecentActivity.Providers.EntityHelper.getLinkEntities(album.description);
                    // Since we can get this album from service, enable reaction permissions.
                    this._updateFacebookReactions(obj, fbAlbum.comment_info, fbAlbum.like_info);
                }

                break;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype.getContactId = function (username) {
        /// <summary>
        ///     Retrieve the contact ID from the cache.
        /// </summary>
        /// <param name="username" type="String">The username to look for.</param>
        /// <returns type="String"></returns>
        Debug.assert(Jx.isNonEmptyString(username), 'username');
        var key = this._getKey(username);
        return this._usernameToContactIdMap[key];
    };

    People.RecentActivity.Providers.SocialCache.prototype.updateContactIdMap = function (contactIds) {
        /// <summary>
        ///     Updates the contact ID cache with the latest data.
        /// </summary>
        /// <param name="contactIds" type="Array" elementType="Object">The array of contact ID info.</param>
        Debug.assert(contactIds != null, 'contactIds');
        Debug.assert(contactIds.length > 0, 'contactIds.Length');
        switch (this._networkId) {
            case People.RecentActivity.Core.NetworkId.facebook:
                for (var n = 0; n < contactIds.length; n++) {
                    var contactId = contactIds[n];
                    var key = this._getKey(contactId.username);
                    this._usernameToContactIdMap[key] = contactId.id.toString();
                }

                break;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype.getPhotoId = function (objectId) {
        /// <summary>
        ///     Retrieve the photo ID from the cache.
        /// </summary>
        /// <param name="objectId" type="String">The object ID of the photo.</param>
        /// <returns type="String"></returns>
        Debug.assert(Jx.isNonEmptyString(objectId), 'objectId');
        var key = this._getKey(objectId);
        return this._objectIdToPhotoIdMap[key];
    };

    People.RecentActivity.Providers.SocialCache.prototype.updatePhotoIdMap = function (photoIds) {
        /// <summary>
        ///     Updates the photo ID cache with the latest data.
        /// </summary>
        /// <param name="photoIds" type="Array" elementType="Object">The array of photo ID info.</param>
        Debug.assert(photoIds != null, 'photoIds');
        Debug.assert(photoIds.length > 0, 'photoIds.Length');
        switch (this._networkId) {
            case People.RecentActivity.Core.NetworkId.facebook:
                for (var n = 0; n < photoIds.length; n++) {
                    var photoId = photoIds[n];
                    var key = this._getKey(photoId.object_id.toString());
                    this._objectIdToPhotoIdMap[key] = photoId.pid;
                }

                break;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype.getAlbumId = function (objectId) {
        /// <summary>
        ///     Retrieve the album ID from the cache.
        /// </summary>
        /// <param name="objectId" type="String">The object ID of the album.</param>
        /// <returns type="String"></returns>
        Debug.assert(Jx.isNonEmptyString(objectId), 'objectId');
        var key = this._getKey(objectId);
        return this._objectIdToAlbumIdMap[key];
    };

    People.RecentActivity.Providers.SocialCache.prototype.updateAlbumIdMap = function (albumIds) {
        /// <summary>
        ///     Updates the album ID cache with the latest data.
        /// </summary>
        /// <param name="albumIds" type="Array" elementType="Object">The array of album ID info.</param>
        Debug.assert(albumIds != null, 'albumIds');
        Debug.assert(albumIds.length > 0, 'albumIds.Length');
        switch (this._networkId) {
            case People.RecentActivity.Core.NetworkId.facebook:
                for (var n = 0; n < albumIds.length; n++) {
                    var albumId = albumIds[n];
                    var key = this._getKey(albumId.object_id.toString());
                    this._objectIdToAlbumIdMap[key] = albumId.aid;
                }

                break;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype._getKey = function (id) {
        /// <param name="id" type="String"></param>
        /// <returns type="String"></returns>
        return this._networkId + id;
    };

    People.RecentActivity.Providers.SocialCache.prototype._populateFacebookPhotoImages = function (photo, fbPhoto) {
        /// <param name="photo" type="People.RecentActivity.Core.create_photoInfo"></param>
        /// <param name="fbPhoto" type="People.RecentActivity.Providers.Facebook.FbPhotoInfo"></param>
        var pictures = [];
        pictures.push(People.RecentActivity.Providers.Sup.create_picture(fbPhoto.src_small, fbPhoto.src_small_height, fbPhoto.src_small_width));
        pictures.push(People.RecentActivity.Providers.Sup.create_picture(fbPhoto.src, fbPhoto.src_height, fbPhoto.src_width));
        pictures.push(People.RecentActivity.Providers.Sup.create_picture(fbPhoto.src_big, fbPhoto.src_big_height, fbPhoto.src_big_width));
        // Try to get the big picture, it will fall back to next biggest one if not available.
        var pic = this._getPicture(pictures, 2);
        // If pic != null, it means at least one size of picture is available.
        if (pic != null) {
            // We use fbPhoto.BigSource for photo.OriginalSource(for self page) and Source(for feed view), and fbPhoto.Source for photo.ThumbnailSource.
            // We don't use fbPhoto.SmallSource since it is too small, which is only used for fallback purpose.
            photo.originalSource = photo.source = pic.Url;
            photo.originalSourceHeight = photo.sourceHeight = (!isNaN(pic.Height)) ? pic.Height : 0;
            photo.originalSourceWidth = photo.sourceWidth = (!isNaN(pic.Width)) ? pic.Width : 0;
            // Try to get the medium size.
            pic = this._getPicture(pictures, 1);
            photo.thumbnailSource = pic.Url;
            photo.thumbnailSourceHeight = (!isNaN(pic.Height)) ? pic.Height : 0;
            photo.thumbnailSourceWidth = (!isNaN(pic.Width)) ? pic.Width : 0;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype._populateTwitterPhotoImages = function (photo, twitterPictures) {
        /// <param name="photo" type="People.RecentActivity.Core.create_photoInfo"></param>
        /// <param name="twitterPictures" type="Array" elementType="picture"></param>
        if (!People.RecentActivity.Providers.Utilities.isArray(twitterPictures)) {
            return;
        }

        var map = {};
        for (var n = 0; n < twitterPictures.length; n++) {
            var picture = twitterPictures[n];
            if (!Jx.isNonEmptyString(picture.Size)) {
                continue;
            }

            map[picture.Size] = picture;
        }

        var pictures = [];
        pictures.push(map['Small'] || People.RecentActivity.Providers.Sup.create_picture());
        pictures.push(map['Medium'] || People.RecentActivity.Providers.Sup.create_picture());
        pictures.push(map['Large'] || People.RecentActivity.Providers.Sup.create_picture());
        // It is possible that not all sizes are available, so we fall back to next available size.
        var pic = this._getPicture(pictures, 0);
        if (pic != null) {
            photo.thumbnailSource = pic.Url || '';
            photo.thumbnailSourceWidth = (!isNaN(pic.Width)) ? pic.Width : 0;
            photo.thumbnailSourceHeight = (!isNaN(pic.Height)) ? pic.Height : 0;
            // If the first call to GetPicture doesn't return null, the following calls won't return null either,
            // because there will be at least one valid picture to fall back to.
            pic = this._getPicture(pictures, 1);
            photo.source = pic.Url || '';
            photo.sourceWidth = (!isNaN(pic.Width)) ? pic.Width : 0;
            photo.sourceHeight = (!isNaN(pic.Height)) ? pic.Height : 0;
            pic = this._getPicture(pictures, 2);
            photo.originalSource = pic.Url || '';
            photo.originalSourceWidth = (!isNaN(pic.Width)) ? pic.Width : 0;
            photo.originalSourceHeight = (!isNaN(pic.Height)) ? pic.Height : 0;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype._getPicture = function (pictures, index) {
        /// <param name="pictures" type="Array"></param>
        /// <param name="index" type="Number" integer="true"></param>
        /// <returns type="People.RecentActivity.Providers.Sup.picture"></returns>
        var len = pictures.length;
        Debug.assert(index < len && index >= 0, People.Social.format('index:{0}; len:{1}', index, len));
        var j = 0, i = index;
        while (j < len) {
            if (Jx.isNonEmptyString(pictures[i].Url)) {
                return pictures[i];
            }

            if (index === len - 1) {
                // if we want to get the largest, we need to fall back to the second largest and so on.
                i--;
            }
            else {
                i = (i + 1) % len;
            }

            j++;
        }

        Jx.log.write(3, 'SocialCache.GetPicture: pictures are all invalid!');
        return null;
    };

    People.RecentActivity.Providers.SocialCache.prototype._updateSupUserProfilePics = function (contact, user) {
        /// <param name="contact" type="People.RecentActivity.Core.create_contactInfo"></param>
        /// <param name="user" type="People.RecentActivity.Providers.Sup.User"></param>
        var picStreams = user.ProfilePicStreams;

        // If there are no profile picture streams to check, just bail out early.
        if (!People.RecentActivity.Providers.Utilities.isArray(picStreams)) {
            Jx.log.write(3, 'SocialCache._updateSupUserProfilePics: No ProfilePicStreams available for the user:');
            Jx.log.pii(People.Social.format('{0}, {1}', user.ObjectId, user.Name));
            return;
        }

        // Find the sizes we are looking for in the array.
        var picture = null;
        var largePicture = null;

        for (var n = 0, len = picStreams.length; n < len; n++) {
            var picStream = picStreams[n];

            switch (picStream.Size) {
                case supUserTileNormalSize:
                    picture = picStream.Url;
                    break;

                case supUserTileLargeSize:
                    largePicture = picStream.Url;
                    break;
            }
        }

        // Update the contact object with the pictures we found.
        if (Jx.isNonEmptyString(picture)) {
            contact.picture = picture;
        }
        else {
            Jx.log.write(3, People.Social.format('SocialCache._updateSupUserProfilePics: No \'{0}\' tile found for the user:', supUserTileNormalSize));
            Jx.log.pii(People.Social.format('{0}, {1}', user.ObjectId, user.Name));
        }

        if (Jx.isNonEmptyString(largePicture)) {
            contact.largePicture = largePicture;
        }
        else {
            Jx.log.write(3, People.Social.format('SocialCache._updateSupUserProfilePics: No \'{0}\' tile found for the user:', supUserTileLargeSize));
            Jx.log.pii(People.Social.format('{0}, {1}', user.ObjectId, user.Name));
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype._updateFacebookReactions = function (obj, commentInfo, likeInfo) {
        /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
        /// <param name="commentInfo" type="People.RecentActivity.Providers.Facebook.FbObjectCommentsInfo"></param>
        /// <param name="likeInfo" type="People.RecentActivity.Providers.Facebook.FbObjectLikesInfo"></param>
        // update the permissions for the comments.
        obj.commentDetails.permissions = ((commentInfo == null) || commentInfo.can_comment) ? People.RecentActivity.Core.Permissions.add : People.RecentActivity.Core.Permissions.none;
        // update permissions and count for the likes.
        var likeReactionDetails = obj.reactionDetails[0];
        likeReactionDetails.permissions = ((likeInfo == null) || likeInfo.can_like) ? People.RecentActivity.Core.Permissions.full : People.RecentActivity.Core.Permissions.none;
        if (likeInfo != null && !Jx.isNullOrUndefined(likeInfo.like_count)) {
            likeReactionDetails.count = likeInfo.like_count;
        }
    };

    People.RecentActivity.Providers.SocialCache.prototype._enableSupReactions = function (obj) {
        /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
        obj.commentDetails.permissions = People.RecentActivity.Core.Permissions.add;

        var conf = People.RecentActivity.Platform.Configuration.instance;

        for (var n = 0; n < obj.reactionDetails.length; n++) {
            var detail = obj.reactionDetails[n];

            var info = conf.getNetworkReactionInfoById(detail.id);
            if (info.type === People.RecentActivity.Core.NetworkReactionInfoType.retweet) {
                // retweet can (at most) only have add -- we don't support removing yet.
                detail.permissions = People.RecentActivity.Core.Permissions.add;
            }
            else {
                // give full permissions to everything else.
                detail.permissions = People.RecentActivity.Core.Permissions.full;
            }
        }
    };
})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.SocialHelper = function() {
    /// <summary>
    ///     Contains helper methods.
    /// </summary>
};

People.RecentActivity.Providers.SocialHelper.updateAlbum = function(oldAlbum, newAlbum) {
    /// <summary>
    ///     Updates an old album with information in a new album.
    /// </summary>
    /// <param name="oldAlbum" type="People.RecentActivity.Core.create_feedObjectInfo">The old album.</param>
    /// <param name="newAlbum" type="People.RecentActivity.Core.create_feedObjectInfo">The new album.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(oldAlbum != null, 'oldAlbum != null');
    Debug.assert(newAlbum != null, 'newAlbum != null');
    // oldAlbumn might only have a aid, so populate all meaningful fields to oldAlbum.
    // newAlbum won't have any comments/reactions/photos at this point, so we don't populate these fields.
    var updated = false;
    if (oldAlbum.id !== newAlbum.id) {
        oldAlbum.id = newAlbum.id;
        updated = true;
    }

    if (oldAlbum.url !== newAlbum.url) {
        oldAlbum.url = newAlbum.url;
        updated = true;
    }

    if (oldAlbum.timestamp !== newAlbum.timestamp) {
        oldAlbum.timestamp = newAlbum.timestamp;
        updated = true;
    }

    var oldAlbumInfo = oldAlbum.data;
    var newAlbumInfo = newAlbum.data;
    if (oldAlbumInfo.cover == null || oldAlbumInfo.cover.id !== newAlbumInfo.cover.id) {
        oldAlbumInfo.cover = newAlbumInfo.cover;
        updated = true;
    }

    if (oldAlbumInfo.description !== newAlbumInfo.description) {
        oldAlbumInfo.description = newAlbumInfo.description;
        oldAlbumInfo.entities = newAlbumInfo.entities;
        updated = true;
    }

    if (oldAlbumInfo.name !== newAlbumInfo.name) {
        oldAlbumInfo.name = newAlbumInfo.name;
        updated = true;
    }

    if (oldAlbumInfo.owner == null || oldAlbumInfo.owner.id !== newAlbumInfo.owner.id) {
        oldAlbumInfo.owner = newAlbumInfo.owner;
        updated = true;
    }

    if (oldAlbumInfo.totalCount !== newAlbumInfo.totalCount) {
        oldAlbumInfo.totalCount = newAlbumInfo.totalCount;
        updated = true;
    }

    return updated;
};

People.RecentActivity.Providers.SocialHelper.updatePhoto = function(oldPhoto, newPhoto) {
    /// <summary>
    ///     Updates an old photo with information in a new photo.
    /// </summary>
    /// <param name="oldPhoto" type="People.RecentActivity.Core.create_feedObjectInfo">The old photo.</param>
    /// <param name="newPhoto" type="People.RecentActivity.Core.create_feedObjectInfo">The new photo.</param>
    /// <returns type="Boolean"></returns>
    var updated = false;
    var oldPhotoInfo = oldPhoto.data;
    var newPhotoInfo = newPhoto.data;
    if (oldPhoto.url !== newPhoto.url) {
        oldPhoto.url = newPhoto.url;
        updated = true;
    }

    if (oldPhoto.timestamp !== newPhoto.timestamp) {
        oldPhoto.timestamp = newPhoto.timestamp;
        updated = true;
    }

    if (oldPhotoInfo.caption !== newPhotoInfo.caption) {
        oldPhotoInfo.caption = newPhotoInfo.caption;
        oldPhotoInfo.entities = newPhotoInfo.entities;
        updated = true;
    }

    // If the index is less than zero, assume it's invalid and ignore the change.
    if (oldPhotoInfo.index !== newPhotoInfo.index && newPhotoInfo.index >= 0) {
        oldPhotoInfo.index = newPhotoInfo.index;
        updated = true;
    }

    if (oldPhotoInfo.owner == null || oldPhotoInfo.owner.id !== newPhotoInfo.owner.id) {
        oldPhotoInfo.owner = newPhotoInfo.owner;
        updated = true;
    }

    return updated;
};

People.RecentActivity.Providers.SocialHelper.joinContactIds = function(contactIdMap) {
    /// <param name="contactIdMap" type="Object"></param>
    /// <returns type="String"></returns>
    return People.RecentActivity.Providers.SocialHelper._joinContactIdMap(contactIdMap, function(entry) {
        return entry.value.id;
    });
};

People.RecentActivity.Providers.SocialHelper.joinSourceIdsAndContactIds = function(contactIdMap) {
    /// <param name="contactIdMap" type="Object"></param>
    /// <returns type="String"></returns>
    return People.RecentActivity.Providers.SocialHelper._joinContactIdMap(contactIdMap, function(entry) {
        return entry.key + ':' + entry.value.id;
    });
};

People.RecentActivity.Providers.SocialHelper.getValidTime = function(time) {
    /// <summary>
    ///     Gets the valid time from the time Facebook returns us.
    /// </summary>
    /// <param name="time" type="Number" integer="true">The time.</param>
    /// <returns type="Number" integer="true"></returns>
    // Facebook returns number of seconds, we want miliseconds.
    return (Jx.isUndefined(time)) ? 0 : time * 1000;
};

People.RecentActivity.Providers.SocialHelper.getTwitterEntryUrl = function(screenName, objectId) {
    /// <summary>
    ///     Gets the entry URL for a Twitter entry.
    /// </summary>
    /// <param name="screenName" type="String">The screen name.</param>
    /// <param name="objectId" type="String">The object ID.</param>
    /// <returns type="String"></returns>
    if (!Jx.isNonEmptyString(screenName) || !Jx.isNonEmptyString(objectId)) {
        return '';
    }

    return 'http://www.twitter.com/' + screenName + '/status/' + objectId;
};

People.RecentActivity.Providers.SocialHelper.getTwitterCommentPrefix = function(screenName) {
    /// <summary>
    ///     Gets the Twitter comment prefix.
    /// </summary>
    /// <param name="screenName" type="String">The screen name.</param>
    /// <returns type="String"></returns>
    if (!Jx.isNonEmptyString(screenName)) {
        Jx.log.write(3, People.Social.format('SocialHelper.GetTwitterCommentPrefix({0}): null or empty screenName ', screenName));
    }

    return '@' + screenName + ' ';
};

People.RecentActivity.Providers.SocialHelper.mergePhotos = function (oldPhotos, newPhotos, updateIndex) {
    /// <summary>
    ///     Merges the new photos into the set of old photos, preferring the old photo in the case of collisions.
    /// </summary>
    /// <param name="oldPhotos" type="Array" elementType="feedObjectInfo">The "old" photo objects.</param>
    /// <param name="newPhotos" type="Array" elementType="feedObjectInfo">The "new" photo objects.</param>
    /// <returns type="Array" elementType="feedObjectInfo">A new array containing the combination of the two arrays.</returns>
    if (oldPhotos == null || oldPhotos.length === 0) {
        return Array.apply(null, newPhotos);
    }

    var clone = Array.apply(null, oldPhotos);

    if (newPhotos == null || newPhotos.length === 0) {
        return clone;
    }

    var map = {};

    for (var i = 0, len = oldPhotos.length; i < len; i++) {
        map[oldPhotos[i].data.id] = true;
    }

    for (var i = 0, len = newPhotos.length; i < len; i++) {
        if (Jx.isUndefined(map[newPhotos[i].data.id])) {
            var newPhoto = newPhotos[i];

            if (updateIndex) {
                newPhoto.data.index = clone.length;
            }

            clone.push(newPhoto);
        }
    }

    return clone;
};

People.RecentActivity.Providers.SocialHelper._joinContactIdMap = function(contactIdMap, getItemToJoin) {
    /// <param name="contactIdMap" type="Object"></param>
    /// <param name="getItemToJoin" type="System.Func`2"></param>
    /// <returns type="String"></returns>
    Debug.assert(contactIdMap != null, 'contactIdMap');
    Debug.assert(getItemToJoin != null, 'getItemToJoin');
    var output = '';
    for (var k in contactIdMap) {
        var entry = { key: k, value: contactIdMap[k] };
        if (output.length > 0) {
            output += ',';
        }

        output += getItemToJoin(entry);
    }

    return output;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

(function () {

    function getSafeStringLength(s) {
        /// <summary>
        ///     Gets the string length, or 'null' if the string is undefined.
        /// </summary>
        /// <param name="s" type="Object">A object or string</param>
        if (Jx.isUndefined(s)) {
            return 'undefined';
        } else if (s === null) {
            return 'null';
        }

        return s.toString().length;
    };

    People.RecentActivity.Providers.FacebookValidator = function () {
        /// <summary>
        ///     Validates data returned from Facebook.
        /// </summary>
    };

    People.RecentActivity.Providers.FacebookValidator.validateFeedEntry = function (entry) {
        /// <summary>
        ///     Validates the feed entry.
        /// </summary>
        /// <param name="entry" type="People.RecentActivity.Providers.Facebook.FbFeedEntryInfo">The entry.</param>
        /// <returns type="Boolean"></returns>
        if (entry == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateFeedEntry({0}): null entry!', entry));
            return false;
        }

        if (Jx.isNullOrUndefined(entry.actor_id)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateFeedEntry({0})', getSafeStringLength(entry.actor_id)));
            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.FacebookValidator.validateContact = function (contact) {
        /// <summary>
        ///     Validates the contact.
        /// </summary>
        /// <param name="contact" type="People.RecentActivity.Providers.Facebook.FbContactInfo">The contact.</param>
        /// <returns type="Boolean"></returns>
        if (contact == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateContact({0}): null contact!', contact));
            return false;
        }

        var unexpected = Jx.isNullOrUndefined(contact.id);
        if (unexpected || !Jx.isNonEmptyString(contact.name) || !Jx.isNonEmptyString(contact.pic_square)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateContact({0},{1},{2})',
                getSafeStringLength(contact.id),
                getSafeStringLength(contact.name),
                getSafeStringLength(contact.pic_square)));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.FacebookValidator.validateAlbum = function (album) {
        /// <summary>
        ///     Validates the album.
        /// </summary>
        /// <param name="album" type="People.RecentActivity.Providers.Facebook.FbAlbumInfo">The album.</param>
        /// <returns type="Boolean"></returns>
        if (album == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateAlbum({0}): null album!', album));
            return false;
        }

        var unexpected = !Jx.isNonEmptyString(album.aid);
        if (unexpected || !Jx.isNonEmptyString(album.cover_pid) || Jx.isNullOrUndefined(album.description) || !Jx.isNonEmptyString(album.link) || Jx.isNullOrUndefined(album.name) || Jx.isNullOrUndefined(album.object_id) || Jx.isNullOrUndefined(album.owner) || isNaN(album.size) || isNaN(album.modified)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateAlbum({0},{1},{2},{3},{4},{5},{6},{7},{8})',
                getSafeStringLength(album.aid),
                getSafeStringLength(album.cover_pid),
                getSafeStringLength(album.description),
                getSafeStringLength(album.link),
                getSafeStringLength(album.name),
                getSafeStringLength(album.object_id),
                album.owner,
                album.size,
                album.modified));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.FacebookValidator.validatePhoto = function (photo) {
        /// <summary>
        ///     Validates the photo.
        /// </summary>
        /// <param name="photo" type="People.RecentActivity.Providers.Facebook.FbPhotoInfo">The photo.</param>
        /// <returns type="Boolean"></returns>
        if (photo == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidatePhoto({0}): null photo!', photo));
            return false;
        }

        var unexpected = !Jx.isNonEmptyString(photo.pid) || (!Jx.isNonEmptyString(photo.src_small) && !Jx.isNonEmptyString(photo.src) && !Jx.isNonEmptyString(photo.src_big));
        if (unexpected || !Jx.isNonEmptyString(photo.aid) || Jx.isNullOrUndefined(photo.caption) || !Jx.isNonEmptyString(photo.link) || Jx.isNullOrUndefined(photo.object_id) || Jx.isNullOrUndefined(photo.owner) || isNaN(photo.created) || isNaN(photo.src_big_height) || isNaN(photo.src_big_width) || isNaN(photo.src_height) || isNaN(photo.src_width) || isNaN(photo.src_small_height) || isNaN(photo.src_small_width)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidatePhoto({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15})',
                getSafeStringLength(photo.aid),
                getSafeStringLength(photo.caption),
                getSafeStringLength(photo.link),
                getSafeStringLength(photo.object_id),
                photo.owner,
                getSafeStringLength(photo.pid),
                photo.created,
                getSafeStringLength(photo.src_big),
                photo.src_big_height,
                photo.src_big_width,
                getSafeStringLength(photo.src),
                photo.src_height,
                photo.src_width,
                getSafeStringLength(photo.src_small),
                photo.src_small_height,
                photo.src_small_width));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.FacebookValidator.validateNotification = function (notification) {
        /// <summary>
        ///     Validates the notification.
        /// </summary>
        /// <param name="notification" type="People.RecentActivity.Providers.Facebook.FbNotificationInfo">The notification.</param>
        /// <returns type="Boolean"></returns>
        if (notification == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateNotification({0}): null notification!', notification));
            return false;
        }

        var unexpected = !Jx.isNonEmptyString(notification.notification_id) || Jx.isNullOrUndefined(notification.sender_id) || !Jx.isNonEmptyString(notification.title_text) || !Jx.isNonEmptyString(notification.href);
        if (unexpected || isNaN(notification.updated_time) || isNaN(notification.is_unread) || Jx.isNullOrUndefined(notification.object_id) || !Jx.isNonEmptyString(notification.object_type)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateNotification({0},{1},{2},{3},{4},{5},{6},{7})',
                getSafeStringLength(notification.notification_id),
                getSafeStringLength(notification.sender_id),
                getSafeStringLength(notification.title_text),
                notification.updated_time,
                getSafeStringLength(notification.href),
                notification.is_unread,
                getSafeStringLength(notification.object_id),
                notification.object_type));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.FacebookValidator.validatePhotoMedia = function (media) {
        /// <summary>
        ///     Validates the photo media.
        /// </summary>
        /// <param name="media" type="People.RecentActivity.Providers.Facebook.MediaInfo">The media.</param>
        /// <returns type="Boolean"></returns>
        if (media == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidatePhotoMedia({0}): null media!', media));
            return false;
        }

        if (media.photo == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidatePhotoMedia({0}): null media.Photo!', media.photo));
            return false;
        }

        if (!Jx.isNonEmptyString(media.photo.pid) || !Jx.isNonEmptyString(media.photo.aid)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidatePhotoMedia({0},{1})',
                getSafeStringLength(media.photo.pid),
                getSafeStringLength(media.photo.aid)));

            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.FacebookValidator.validateVideoMedia = function (media) {
        /// <summary>
        ///     Validates the video media.
        /// </summary>
        /// <param name="media" type="People.RecentActivity.Providers.Facebook.MediaInfo">The media.</param>
        /// <returns type="Boolean"></returns>
        if (media == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateVideoMedia({0}): null media!', media));
            return false;
        }

        if (media.video == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateVideoMedia({0}): null media.Video!', media.video));
            return false;
        }

        if (!Jx.isNonEmptyString(media.video.source_url) && !Jx.isNonEmptyString(media.video.display_url)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateVideoMedia({0},{1})',
                getSafeStringLength(media.video.source_url),
                getSafeStringLength(media.video.display_url)));

            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.FacebookValidator.validateCommentsInfo = function (info) {
        /// <summary>
        ///     Validates the comments info.
        /// </summary>
        /// <param name="info" type="People.RecentActivity.Providers.Facebook.FbFeedEntryCommentsInfo">The info.</param>
        /// <returns type="Boolean"></returns>
        if (info == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateCommentsInfo({0}): null info!', info));
            return false;
        }

        var unexpected = isNaN(info.comment_count);
        if (unexpected || Jx.isNullOrUndefined(info.can_comment)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateCommentsInfo({0},{1})', info.comment_count, info.can_comment));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.FacebookValidator.validateLikesInfo = function (info) {
        /// <summary>
        ///     Validates the likes info.
        /// </summary>
        /// <param name="info" type="People.RecentActivity.Providers.Facebook.FbFeedEntryLikesInfo">The info.</param>
        /// <returns type="Boolean"></returns>
        if (info == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateLikesInfo({0}): null info!', info));
            return false;
        }

        var unexpected = isNaN(info.count);
        if (unexpected || Jx.isNullOrUndefined(info.can_like) || Jx.isNullOrUndefined(info.user_likes)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateLikesInfo({0},{1})', info.count, info.can_like));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.FacebookValidator.validateComment = function (comment, requireObjectId) {
        /// <summary>
        ///     Validates the comment.
        /// </summary>
        /// <param name="comment" type="People.RecentActivity.Providers.Facebook.FbCommentInfo">The comment.</param>
        /// <param name="requireObjectId" type="Boolean">Whether the comment is required to have an object ID.</param>
        /// <returns type="Boolean"></returns>
        if (comment == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateComment({0}): null comment!', comment));
            return false;
        }

        if (Jx.isNullOrUndefined(comment.fromid) || !Jx.isNonEmptyString(comment.id) || !Jx.isNonEmptyString(comment.text) || (requireObjectId && Jx.isNullOrUndefined(comment.object_id))) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateComment({0},{1},{2},{3})',
                getSafeStringLength(comment.fromid),
                getSafeStringLength(comment.id),
                getSafeStringLength(comment.text),
                getSafeStringLength(comment.object_id)));

            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.FacebookValidator.validateLike = function (like) {
        /// <summary>
        ///     Validates the like.
        /// </summary>
        /// <param name="like" type="People.RecentActivity.Providers.Facebook.FbLikeInfo">The like.</param>
        /// <returns type="Boolean"></returns>
        if (like == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateLike({0}): null like!', like));
            return false;
        }

        if (Jx.isNullOrUndefined(like.object_id) || Jx.isNullOrUndefined(like.user_id)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateLike({0},{1})',
                getSafeStringLength(like.object_id),
                getSafeStringLength(like.user_id)));

            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.FacebookValidator.validatePhotoTag = function (tag) {
        /// <summary>
        ///     Validates the photo tag.
        /// </summary>
        /// <param name="tag" type="People.RecentActivity.Providers.Facebook.FbPhotoTagInfo">The tag.</param>
        /// <returns type="Boolean"></returns>
        if (tag == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidatePhotoTag({0}): null tag!', tag));
            return false;
        }

        var unexpected = Jx.isNullOrUndefined(tag.subject) || !Jx.isNonEmptyString(tag.subject.toString());
        if (unexpected || isNaN(tag.xcoord) || isNaN(tag.ycoord)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidatePhotoTag({0},{1},{2})',
                getSafeStringLength(tag.subject),
                tag.xcoord,
                tag.ycoord));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.FacebookValidator.validateMessageTag = function (tag) {
        /// <summary>
        ///     Validates the message tag.
        /// </summary>
        /// <param name="tag" type="People.RecentActivity.Providers.Facebook.TagInfo">The tag.</param>
        /// <returns type="Boolean"></returns>
        if (tag == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateMessageTag({0}): null tag!', tag));
            return false;
        }

        if (Jx.isNullOrUndefined(tag.id) || isNaN(tag.length) || isNaN(tag.offset)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateMessageTag({0},{1},{2})',
                getSafeStringLength(tag.id),
                tag.length,
                tag.offset));
            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.FacebookValidator.validateResultSet = function (result) {
        /// <summary>
        ///     Validates the result set.
        /// </summary>
        /// <param name="result" type="People.RecentActivity.Providers.Facebook.FqlResultInfo">The result.</param>
        /// <returns type="Boolean"></returns>
        if (result == null) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateResultSet({0}): null result!', result));
            return false;
        }

        if (!People.RecentActivity.Providers.Utilities.isArray(result.fql_result_set)) {
            Jx.log.write(3, People.Social.format('FacebookValidator.ValidateResultSet({0}): ResultSet is not an array!', result.name));
            return false;
        }

        return true;
    };

})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Utilities.js" />

(function () {

    function getSafeStringLength(s) {
        /// <summary>
        ///     Gets the string length, or 'null' if the string is undefined.
        /// </summary>
        if (Jx.isUndefined(s)) {
            return 'undefined';
        } else if (s === null) {
            return 'null';
        }

        return s.toString().length;
    };

    People.RecentActivity.Providers.SupValidator = function () {
        /// <summary>
        ///     Validates the data returned from Sup.
        /// </summary>
    };

    People.RecentActivity.Providers.SupValidator.validateFeedEntry = function (entry) {
        /// <summary>
        ///     Validates the feed entry.
        /// </summary>
        /// <param name="entry" type="People.RecentActivity.Providers.Sup.FeedEntry">The entry.</param>
        /// <returns type="Boolean"></returns>
        if (entry == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateFeedEntry({0}): null entry!', entry));
            return false;
        }

        var unexpected = !Jx.isNonEmptyString(entry.ObjectId) || !Jx.isNonEmptyString(entry.SourceId) || !Jx.isNonEmptyString(entry.Type) || entry.Author == null || !Jx.isNonEmptyString(entry.Author.ObjectId);
        if (unexpected || !Jx.isNonEmptyString(entry.Published) || entry.Message == null) {
            Jx.log.write(
                3,
                People.Social.format(
                    'SupValidator.ValidateFeedEntry({0},{1},{2},{3},{4},{5})',
                    getSafeStringLength(entry.ObjectId),
                    entry.SourceId,
                    entry.Published,
                    entry.Author != null ? getSafeStringLength(entry.Author.ObjectId) + ';' + getSafeStringLength(entry.Author.ScreenName) : '',
                    entry.Message != null ? getSafeStringLength(entry.Message.Text) : '',
                    entry.Type));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.SupValidator.validateContact = function (contact) {
        /// <summary>
        ///     Validates the contact.
        /// </summary>
        /// <param name="contact" type="People.RecentActivity.Providers.Sup.User">The contact.</param>
        /// <returns type="Boolean"></returns>
        if (contact == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateContact({0}): null contact!', contact));
            return false;
        }

        var unexpected = !Jx.isNonEmptyString(contact.ObjectId);

        if (unexpected || !Jx.isNonEmptyString(contact.Name) || !Jx.isNonEmptyString(contact.ScreenName) || !Jx.isNonEmptyString(contact.SourceId)) {
            Jx.log.write(
                3,
                People.Social.format(
                    'SupValidator.ValidateContact({0},{1},{2},{3})',
                    getSafeStringLength(contact.ObjectId),
                    getSafeStringLength(contact.Name),
                    getSafeStringLength(contact.ScreenName),
                    contact.SourceId));
        }

        return !unexpected;
    };

    People.RecentActivity.Providers.SupValidator.validatePhoto = function (photo) {
        /// <summary>
        ///     Validates the photo.
        /// </summary>
        /// <param name="photo" type="People.RecentActivity.Providers.Sup.Photo">The photo.</param>
        /// <returns type="Boolean"></returns>
        if (photo == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidatePhoto({0}): null photo!', photo));
            return false;
        }

        var expected = true;
        var isStreamArray;
        if (!(isStreamArray = People.RecentActivity.Providers.Utilities.isArray(photo.Streams)) || !Jx.isNonEmptyString(photo.activityObjectId) || photo.author == null || !Jx.isNonEmptyString(photo.author.ObjectId) || !Jx.isNonEmptyString(photo.author.ScreenName) || !Jx.isNonEmptyString(photo.ObjectId) || !Jx.isNonEmptyString(photo.SourceId) || isNaN(photo.timestamp) || !Jx.isNonEmptyString(photo.url)) {
            expected = false;
        }

        if (expected) {
            for (var n = 0; n < photo.Streams.length; n++) {
                var picture = photo.Streams[n];
                if (!Jx.isNonEmptyString(picture.Url) || !Jx.isNonEmptyString(picture.Size) || isNaN(picture.Height) || isNaN(picture.Width)) {
                    expected = false;
                    break;
                }
            }
        }

        if (!expected) {
            var authorId = null;
            var screenName = null;

            if (photo.author != null) {
                authorId = photo.author.ObjectId;
                screenName = photo.author.ScreenName;
            }

            Jx.log.write(3, People.Social.format(
                'SupValidator.ValidatePhoto({0},{1},{2},{3},{4},{5},{6})',
                getSafeStringLength(photo.activityObjectId),
                getSafeStringLength(authorId),
                getSafeStringLength(screenName),
                getSafeStringLength(photo.ObjectId),
                photo.SourceId,
                photo.timestamp,
                getSafeStringLength(photo.url)));

            if (isStreamArray) {
                for (var n = 0; n < photo.Streams.length; n++) {
                    var picture = photo.Streams[n];

                    Jx.log.write(3, People.Social.format(
                        'SupValidator.ValidatePhoto({0},{1},{2},{3})',
                        picture.Size,
                        getSafeStringLength(picture.Url),
                        picture.Height,
                        picture.Width));
                }
            }
        }

        return Jx.isNonEmptyString(photo.ObjectId);
    };

    People.RecentActivity.Providers.SupValidator.validateEntity = function (entity) {
        /// <summary>
        ///     Validates the entity.
        /// </summary>
        /// <param name="entity" type="People.RecentActivity.Providers.Sup.Entity">The entity.</param>
        /// <returns type="Boolean"></returns>
        if (entity == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateEntity({0}): null entity!', entity));
            return false;
        }

        if (!Jx.isNonEmptyString(entity.Type) || isNaN(entity.Start) || isNaN(entity.End) || (entity.User == null && entity.Link == null)) {
            Jx.log.write(3, People.Social.format(
                'SupValidator.ValidateEntity({0},{1},{2},{3},{4})',
                entity.Type,
                entity.Start,
                entity.End,
                entity.User != null ? getSafeStringLength(entity.User.Name) : '',
                entity.Link != null ? getSafeStringLength(entity.Link.Url) : ''));

            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.SupValidator.validateMessage = function (message) {
        /// <summary>
        ///     Validates the message.
        /// </summary>
        /// <param name="message" type="People.RecentActivity.Providers.Sup.Message">The message.</param>
        /// <returns type="Boolean"></returns>
        if (message == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateMessage({0}): null message!', getSafeStringLength(message)));
            return false;
        }

        if (!Jx.isNonEmptyString(message.Text)) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateMessage({0})', getSafeStringLength(message.Text)));
            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.SupValidator.validateLink = function (link) {
        /// <summary>
        ///     Validates the link.
        /// </summary>
        /// <param name="link" type="People.RecentActivity.Providers.Sup.Link">The link.</param>
        /// <returns type="Boolean"></returns>
        if (link == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateLink({0}): null link!', link));
            return false;
        }

        if (!Jx.isNonEmptyString(link.Url)) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateLink({0},{1})',
                getSafeStringLength(link.Url),
                getSafeStringLength(link.SafeUrl)));

            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.SupValidator.validateReplyDetail = function (reactions) {
        /// <summary>
        ///     Validates the reply detail.
        /// </summary>
        /// <param name="reactions" type="People.RecentActivity.Providers.Sup.Reactions">The reactions.</param>
        /// <returns type="Boolean"></returns>
        if (reactions == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateReplyDetail({0}): null reactions!', reactions));
            return false;
        }

        if (reactions.ReplyReaction == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateReplyDetail({0}): null reactions.Reply!', reactions.ReplyReaction));
            return false;
        }

        var reply = reactions.ReplyReaction;
        if (isNaN(reply.Count) || Jx.isNullOrUndefined(reply.CanReact) || isNaN(reply.TextLimit)) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateReplyDetail({0},{1},{2})', reply.Count, reply.CanReact, reply.TextLimit));
        }

        return true;
    };

    People.RecentActivity.Providers.SupValidator.validateRetweetDetail = function (reactions) {
        /// <summary>
        ///     Validates the retweet detail.
        /// </summary>
        /// <param name="reactions" type="People.RecentActivity.Providers.Sup.Reactions">The reactions.</param>
        /// <returns type="Boolean"></returns>
        if (reactions == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateRetweetDetail({0}): null reactions!', reactions));
            return false;
        }

        if (reactions.RetweetReaction == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateRetweetDetail({0}): null reactions.Retweet!', reactions.RetweetReaction));
            return false;
        }

        var retweet = reactions.RetweetReaction;
        if (isNaN(retweet.Count) || Jx.isNullOrUndefined(retweet.CanReact)) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateRetweetDetail({0},{1})', retweet.Count, retweet.CanReact));
        }

        return true;
    };

    People.RecentActivity.Providers.SupValidator.validateFavoriteDetail = function (reactions) {
        /// <summary>
        ///     Validates the favorite detail.
        /// </summary>
        /// <param name="reactions" type="People.RecentActivity.Providers.Sup.Reactions">The reactions.</param>
        /// <returns type="Boolean"></returns>
        if (reactions == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateFavoriteDetail({0}): null reactions!', reactions));
            return false;
        }

        if (reactions.FavoriteReaction == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateFavoriteDetail({0}): null reactions.Favorite!', reactions.FavoriteReaction));
            return false;
        }

        var favorte = reactions.FavoriteReaction;
        if (Jx.isNullOrUndefined(favorte.HasReacted) || Jx.isNullOrUndefined(favorte.CanReact)) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateFavoriteDetail({0},{1})', favorte.HasReacted, favorte.CanReact));
        }

        return true;
    };

    People.RecentActivity.Providers.SupValidator.validateReply = function (reaction) {
        /// <summary>
        ///     Validates the reply.
        /// </summary>
        /// <param name="reaction" type="People.RecentActivity.Providers.Sup.ReactionContent">The reaction.</param>
        /// <returns type="Boolean"></returns>
        if (reaction == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateReply({0}): null reaction!', reaction));
            return false;
        }

        if (!Jx.isNonEmptyString(reaction.ObjectId) || reaction.Author == null || !Jx.isNonEmptyString(reaction.Author.ObjectId) || reaction.Message == null || !Jx.isNonEmptyString(reaction.Message.Text)) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateReply({0},{1},{2})',
                reaction.ObjectId,
                reaction.Author != null ? getSafeStringLength(reaction.Author.ObjectId) + ';' + getSafeStringLength(reaction.Author.ScreenName) : '',
                reaction.Message != null ? getSafeStringLength(reaction.Message.Text) : ''));

            return false;
        }

        return true;
    };

    People.RecentActivity.Providers.SupValidator.validateRetweet = function (reaction) {
        /// <summary>
        ///     Validates the retweet.
        /// </summary>
        /// <param name="reaction" type="People.RecentActivity.Providers.Sup.ReactionContent">The reaction.</param>
        /// <returns type="Boolean"></returns>
        if (reaction == null) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateRetweet({0}): null reaction!', reaction));
            return false;
        }

        if (reaction.Author == null || !Jx.isNonEmptyString(reaction.Author.ObjectId)) {
            Jx.log.write(3, People.Social.format('SupValidator.ValidateRetweet({0})',
                reaction.Author != null ? getSafeStringLength(reaction.Author.ObjectId) + ';' + getSafeStringLength(reaction.Author.ScreenName) : ''));

            return false;
        }

        return true;
    };

})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.Utilities = function() {
    /// <summary>
    ///     Provides general utility methods.
    /// </summary>
};

People.RecentActivity.Providers.Utilities.isArray = function(obj) {
    /// <summary>
    ///     Determines whether the specified obj is an array.
    /// </summary>
    /// <param name="obj" type="Object">The obj.</param>
    /// <returns type="Boolean"></returns>
    if (Jx.isArray(obj)) {
        return true;
    }

    if (obj != null) {
        Jx.log.write(4, 'Utilities.IsArray: obj is not an array.');
    }

    return false;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.HttpResponseHeaders = function(headers) {
    /// <summary>
    ///     Provides a HTTP response.
    /// </summary>
    /// <param name="headers" type="String">The headers.</param>
    /// <field name="_headers" type="String">The status.</field>
    /// <field name="_parsedHeaders" type="Object">The body.</field>
    /// <field name="_initialized" type="Boolean">Whether the class has been initialized.</field>
    Debug.assert(headers != null, 'headers');
    this._headers = headers;
    this._parsedHeaders = {};
};

People.RecentActivity.Providers.HttpResponseHeaders.prototype._headers = null;
People.RecentActivity.Providers.HttpResponseHeaders.prototype._parsedHeaders = null;
People.RecentActivity.Providers.HttpResponseHeaders.prototype._initialized = false;

Object.defineProperty(People.RecentActivity.Providers.HttpResponseHeaders.prototype, "headers", {
    get: function() {
        /// <summary>
        ///     Gets the headers.
        /// </summary>
        /// <value type="String"></value>
        return this._headers;
    }
});

People.RecentActivity.Providers.HttpResponseHeaders.prototype._ensureInitialized = function() {
    /// <summary>
    ///     Ensure that the class has been initialized.
    /// </summary>
    if (this._initialized) {
        return;
    }

    this._parseHeaders(this._headers);
    this._initialized = true;
};

People.RecentActivity.Providers.HttpResponseHeaders.prototype._parseHeaders = function(headers) {
    /// <summary>
    ///     Parse the header string.
    /// </summary>
    /// <param name="headers" type="String">The header string.</param>
    Debug.assert(headers != null, 'headers != null');
    People.Social.clearKeys(this._parsedHeaders);
    var splitHeaders = headers.split('\r\n');
    for (var n = 0; n < splitHeaders.length; n++) {
        var splitHeader = splitHeaders[n];
        var colonIndex = splitHeader.indexOf(':');
        if (colonIndex === -1) {
            // We don't have a valid header field.
            continue;
        }

        // Parse the key and value out of the string.
        var key = splitHeader.substring(0, colonIndex);
        var value = splitHeader.substring(colonIndex + 1, splitHeader.length);
        if (!Jx.isNonEmptyString(key)) {
            // We don't have a valid key.
            continue;
        }

        // Normalize the key to upper-case, trim the value.
        key = key.toUpperCase();
        value = value.trim();
        var currentValue = this._parsedHeaders[key];
        if (!Jx.isNonEmptyString(currentValue)) {
            // There is no current value, just replace it.
            this._parsedHeaders[key] = value;
        }
        else {
            // Only append the new value if it's not empty.
            if (Jx.isNonEmptyString(value)) {
                this._parsedHeaders[key] = currentValue + ',' + value;
            }        
        }    
    }
};

People.RecentActivity.Providers.HttpResponseHeaders.prototype.item = function(name) {
    /// <summary>
    ///     Gets the specified header.
    /// </summary>
    /// <param name="name" type="String">The header name.</param>
    /// <param name="value" type="String"></param>
    /// <returns type="String"></returns>
    Debug.assert(name != null, 'name must not be null.');
    this._ensureInitialized();
    return this._parsedHeaders[name.toUpperCase()];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\Requests\RequestContext.js" />

People.RecentActivity.Providers.AggregationState = function() {
    /// <summary>
    ///     Represents the aggregation state.
    /// </summary>
    /// <field name="aggregateFeedEntryKey" type="String" static="true">The aggregation state dictionary key used for aggregating feed entries.</field>
    /// <field name="aggregateCachedFeedEntryKey" type="String" static="true">The aggregation state dictionary key used for aggregating cached feed entries.</field>
    /// <field name="aggregateAlbumKey" type="String" static="true">The aggregation state dictionary key used for aggregating albums.</field>
    /// <field name="aggregateCachedAlbumKey" type="String" static="true">The aggregation state dictionary key used for aggregating cached albums.</field>
    /// <field name="aggregateNotificationKey" type="String" static="true">The aggregation state dictionary key used for aggregating notifications.</field>
    /// <field name="aggregateCachedNotificationKey" type="String" static="true">The aggregation state dictionary key used for aggregating cached notifications.</field>
    /// <field name="aggregateUnreadNotificationCountKey" type="String" static="true">The aggregation state dictionary key used for aggregating notifications.</field>
    /// <field name="aggregateMarkedReadNotificationKey" type="String" static="true">The aggregation state dictionary key used for aggregating marked read notifications.</field>
    /// <field name="_aggregationStateMap" type="Object" static="true"></field>
    /// <field name="_objectList" type="Array"></field>
    /// <field name="_cachedObjectList" type="Array"></field>
    /// <field name="_queuedObjects" type="Array"></field>
    /// <field name="_count" type="Number" integer="true"></field>
    /// <field name="_totalRequests" type="Number" integer="true"></field>
    /// <field name="_outstandingRequests" type="Number" integer="true"></field>
    /// <field name="_failedRequests" type="Number" integer="true"></field>
    /// <field name="_succeededRequests" type="Number" integer="true"></field>
    /// <field name="_failedAuthentication" type="Number" integer="true"></field>
    /// <field name="_recordScenario" type="Boolean"></field>
    /// <field name="_scenarioId" type="Microsoft.WindowsLive.Instrumentation.ScenarioId"></field>
    /// <field name="_scenarioDuration" type="Number" integer="true"></field>
    /// <field name="_scenarioRequestSize" type="Number" integer="true"></field>
    /// <field name="_scenarioErrorCode" type="Number" integer="true"></field>
    /// <field name="_scenarioErrorType" type="Microsoft.WindowsLive.Instrumentation.ErrorType"></field>
    /// <field name="_errorMap" type="Object"></field>
    this._objectList = [];
    this._cachedObjectList = [];
    this._queuedObjects = [];
    this._scenarioId = InstruScenarioId.unknown;
    this._scenarioErrorType = InstruErrorType.success;
    this._errorMap = {};
};


People.RecentActivity.Providers.AggregationState.aggregateFeedEntryKey = 'f';
People.RecentActivity.Providers.AggregationState.aggregateCachedFeedEntryKey = 'cf';
People.RecentActivity.Providers.AggregationState.aggregateAlbumKey = 'a';
People.RecentActivity.Providers.AggregationState.aggregateCachedAlbumKey = 'ca';
People.RecentActivity.Providers.AggregationState.aggregateNotificationKey = 'n';
People.RecentActivity.Providers.AggregationState.aggregateCachedNotificationKey = 'cn';
People.RecentActivity.Providers.AggregationState.aggregateUnreadNotificationCountKey = 'u';
People.RecentActivity.Providers.AggregationState.aggregateMarkedReadNotificationKey = 'rn';
People.RecentActivity.Providers.AggregationState._aggregationStateMap = {};

People.RecentActivity.Providers.AggregationState.contains = function(key) {
    /// <summary>
    ///     Determines whether we have an aggregation state available with the specified key.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <returns type="Boolean"></returns>
    Debug.assert(Jx.isNonEmptyString(key), 'key');
    return !Jx.isUndefined(People.RecentActivity.Providers.AggregationState._aggregationStateMap[key]);
};

People.RecentActivity.Providers.AggregationState.getAggregationState = function(key) {
    /// <summary>
    ///     Gets the aggregation state.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    /// <returns type="People.RecentActivity.Providers.AggregationState"></returns>
    Debug.assert(Jx.isNonEmptyString(key), 'key');
    if (!!Jx.isUndefined(People.RecentActivity.Providers.AggregationState._aggregationStateMap[key])) {
        People.RecentActivity.Providers.AggregationState._aggregationStateMap[key] = new People.RecentActivity.Providers.AggregationState();
    }

    return People.RecentActivity.Providers.AggregationState._aggregationStateMap[key];
};

People.RecentActivity.Providers.AggregationState.removeAggregationState = function(key) {
    /// <summary>
    ///     Removes the aggregation state.
    /// </summary>
    /// <param name="key" type="String">The key.</param>
    Debug.assert(Jx.isNonEmptyString(key), 'key');
    if (!Jx.isUndefined(People.RecentActivity.Providers.AggregationState._aggregationStateMap[key])) {
        delete People.RecentActivity.Providers.AggregationState._aggregationStateMap[key];
    }
};

People.RecentActivity.Providers.AggregationState.removeAggregationStatesByAggregatorId = function(aggregatorId) {
    /// <summary>
    ///     Removes the aggregation states associated with a person.
    /// </summary>
    /// <param name="aggregatorId" type="String">The aggregator id.</param>
    Debug.assert(Jx.isNonEmptyString(aggregatorId), 'aggregatorId');
    var length = aggregatorId.length;
    for (var n = 0, coll = Object.keys(People.RecentActivity.Providers.AggregationState._aggregationStateMap); n < coll.length; n++) {
        var key = coll[n];
        if (key.substr(0, length) === aggregatorId) {
            delete People.RecentActivity.Providers.AggregationState._aggregationStateMap[key];
        }    
    }
};


People.RecentActivity.Providers.AggregationState.prototype._count = 0;
People.RecentActivity.Providers.AggregationState.prototype._totalRequests = 0;
People.RecentActivity.Providers.AggregationState.prototype._outstandingRequests = 0;
People.RecentActivity.Providers.AggregationState.prototype._failedRequests = 0;
People.RecentActivity.Providers.AggregationState.prototype._succeededRequests = 0;
People.RecentActivity.Providers.AggregationState.prototype._failedAuthentication = 0;
People.RecentActivity.Providers.AggregationState.prototype._recordScenario = false;
People.RecentActivity.Providers.AggregationState.prototype._scenarioDuration = 0;
People.RecentActivity.Providers.AggregationState.prototype._scenarioRequestSize = 0;
People.RecentActivity.Providers.AggregationState.prototype._scenarioErrorCode = 0;

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "count", {
    get: function() {
        /// <summary>
        ///     Gets the count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._count;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "objectList", {
    get: function() {
        /// <summary>
        ///     Gets the objects returned from each provider or each outgoing request.
        /// </summary>
        /// <value type="Array"></value>
        return this._objectList;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "cachedObjectList", {
    get: function() {
        /// <summary>
        ///     Gets the previous cached objects from each provider or each outgoing request.
        /// </summary>
        /// <value type="Array"></value>
        return this._cachedObjectList;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "queuedObjects", {
    get: function() {
        /// <summary>
        ///     Gets the queued objects from each provider or each outgoing request.
        /// </summary>
        /// <value type="Array"></value>
        return this._queuedObjects;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "outstandingRequests", {
    get: function() {
        /// <summary>
        ///     Gets the number of outstanding requests.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._outstandingRequests;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "totalRequests", {
    get: function() {
        /// <summary>
        ///     Gets the number of total networks to aggregate.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._totalRequests;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "aggregationResult", {
    get: function() {
        /// <summary>
        ///     Gets the aggregation result.
        /// </summary>
        /// <value type="People.RecentActivity.Core.ResultInfo"></value>
        var result = new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.failure);
        if (!this._failedRequests) {
            result.code = People.RecentActivity.Core.ResultCode.success;
        }
        else {
            result.errorMap = this._errorMap;
            if (!this._succeededRequests) {
                result.code = (this._failedAuthentication > 0) ? People.RecentActivity.Core.ResultCode.invalidUserCredential : People.RecentActivity.Core.ResultCode.failure;
            }
            else {
                result.code = (this._failedAuthentication > 0) ? People.RecentActivity.Core.ResultCode.partialFailureWithInvalidUserCredential : People.RecentActivity.Core.ResultCode.partialFailure;
            }        
        }

        return result;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "recordScenario", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the scenario should be recorded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._recordScenario;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "scenarioId", {
    get: function() {
        /// <summary>
        ///     Gets the current scenario id.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Instrumentation.ScenarioId"></value>
        return this._scenarioId;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "scenarioDuration", {
    get: function() {
        /// <summary>
        ///     Gets the total duration of the scenario's requests.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._scenarioDuration;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "scenarioRequestSize", {
    get: function() {
        /// <summary>
        ///     Gets the total size of the scenario's requests.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._scenarioRequestSize;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "scenarioErrorCode", {
    get: function() {
        /// <summary>
        ///     Gets the first error code encountered during the scenario's requests.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._scenarioErrorCode;
    }
});

Object.defineProperty(People.RecentActivity.Providers.AggregationState.prototype, "scenarioErrorType", {
    get: function() {
        /// <summary>
        ///     Gets the first error type encountered during the scenario's requests.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Instrumentation.ErrorType"></value>
        return this._scenarioErrorType;
    }
});

People.RecentActivity.Providers.AggregationState.prototype.reset = function(totalRequests) {
    /// <summary>
    ///     Resets the aggregation state.
    /// </summary>
    /// <param name="totalRequests" type="Number" integer="true">The total requests to send.</param>
    Debug.assert(totalRequests >= 0, 'totalRequests');
    this._totalRequests = this._outstandingRequests = totalRequests;
    this._failedRequests = 0;
    this._succeededRequests = 0;
    this._failedAuthentication = 0;
    this._recordScenario = false;
    this._scenarioId = InstruScenarioId.unknown;
    this._scenarioDuration = 0;
    this._scenarioRequestSize = 0;
    this._scenarioErrorCode = 0;
    this._scenarioErrorType = InstruErrorType.success;
    this._objectList.length = 0;
    this._cachedObjectList.length = 0;
    People.Social.clearKeys(this._errorMap);
    this._errorMap = {};
    this._count = 0;
};

People.RecentActivity.Providers.AggregationState.prototype.updateState = function(result, objs) {
    /// <summary>
    ///     Updates the state for one outgoing request.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result of the request.</param>
    /// <param name="objs" type="Array" elementType="Object">The objs returned if any.</param>
    this.updateStateWithCachedObjects(result, objs, null);
};

People.RecentActivity.Providers.AggregationState.prototype.updateStateWithCachedObjects = function(result, objs, cachedObjs) {
    /// <summary>
    ///     Updates the state for one outgoing request.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result of the request.</param>
    /// <param name="objs" type="Array" elementType="Object">The objs returned if any.</param>
    /// <param name="cachedObjs" type="Array" elementType="Object">The previous cached objs.</param>
    this._updateStateInternal(result, objs, cachedObjs, 0);
};

People.RecentActivity.Providers.AggregationState.prototype.updateStateWithCount = function(result, count) {
    /// <summary>
    ///     Updates the state with a count to be aggregated.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result of the request.</param>
    /// <param name="count" type="Number" integer="true">The count.</param>
    this._updateStateInternal(result, null, null, count);
};

People.RecentActivity.Providers.AggregationState.prototype.updateScenarioInstrumentation = function(scenarioId, context) {
    /// <summary>
    ///     Updates the scenario instrumentation for aggregated scenarios
    /// </summary>
    /// <param name="scenarioId" type="Microsoft.WindowsLive.Instrumentation.ScenarioId">The current scenario ID.</param>
    /// <param name="context" type="People.RecentActivity.Providers.RequestContext">The most recent request context.</param>
    Debug.assert(this._scenarioId === InstruScenarioId.unknown || this._scenarioId === scenarioId, 'scenarioIds between requests must match.');
    this._recordScenario = true;
    this._scenarioId = scenarioId;
    this._scenarioDuration += context.scenarioDuration;
    this._scenarioRequestSize += context.scenarioSizeInBytes;
    // Only capture the first error
    if (!this._scenarioErrorCode && !!context.errorCode) {
        this._scenarioErrorCode = context.errorCode;
        this._scenarioErrorType = context.errorType;
    }
};

People.RecentActivity.Providers.AggregationState.prototype._updateStateInternal = function(result, objs, cachedObjs, count) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="objs" type="Array" elementType="Object"></param>
    /// <param name="cachedObjs" type="Array" elementType="Object"></param>
    /// <param name="count" type="Number" integer="true"></param>
    if (!this._outstandingRequests) {
        return;
    }

    this._outstandingRequests--;
    if (objs != null) {
        this._objectList.push.apply(this._objectList, objs);
    }

    if (cachedObjs != null) {
        this._cachedObjectList.push.apply(this._cachedObjectList, cachedObjs);
    }

    this._count += count;
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        this._succeededRequests++;
    }
    else {
        this._failedRequests++;
        this._populateErrorMap(result);
        if (result.code === People.RecentActivity.Core.ResultCode.invalidUserCredential || result.code === People.RecentActivity.Core.ResultCode.invalidPermissions) {
            this._failedAuthentication++;
        }    
    }
};

People.RecentActivity.Providers.AggregationState.prototype._populateErrorMap = function(resultInfo) {
    /// <param name="resultInfo" type="People.RecentActivity.Core.ResultInfo"></param>
    if (resultInfo.errorMap != null) {
        for (var n = 0, coll = Object.keys(resultInfo.errorMap); n < coll.length; n++) {
            var sourceId = coll[n];
            this._errorMap[sourceId] = resultInfo.errorMap[sourceId];
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Platform\ContactId.js" />
/// <reference path="..\..\Platform\Platform.js" />
/// <reference path="..\Cache\AlbumCache.js" />
/// <reference path="..\Cache\FeedCache.js" />
/// <reference path="..\Cache\NotificationCache.js" />

People.RecentActivity.Providers.ProviderBase = function(events) {
    /// <summary>
    ///     The base class for providers.
    /// </summary>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents">The events.</param>
    /// <field name="feedInitialized" type="Boolean">Whether the feed is initialized.</field>
    /// <field name="feedInitializing" type="Boolean">Whether the feed is being initialized.</field>
    /// <field name="albumInitialized" type="Boolean">Whether the album is initialized.</field>
    /// <field name="notificationsInitialized" type="Boolean">Whether the notification is initialized.</field>
    /// <field name="_contactId" type="People.RecentActivity.Platform.ContactId">The contact id associated with the provider.</field>
    /// <field name="_events" type="People.RecentActivity.Core.IFeedProviderEvents">The events.</field>
    /// <field name="_feedCache" type="People.RecentActivity.Providers.FeedCache">The feed cache.</field>
    /// <field name="_albumCache" type="People.RecentActivity.Providers.AlbumCache">The album cache.</field>
    /// <field name="_notificationCache" type="People.RecentActivity.Providers.NotificationCache">The notification cache.</field>
    Debug.assert(events != null, 'events');

    this._events = events;
};

People.RecentActivity.Providers.ProviderBase.prototype.feedInitialized = false;
People.RecentActivity.Providers.ProviderBase.prototype.feedInitializing = false;
People.RecentActivity.Providers.ProviderBase.prototype.albumInitialized = false;
People.RecentActivity.Providers.ProviderBase.prototype.notificationsInitialized = false;
People.RecentActivity.Providers.ProviderBase.prototype._contactId = null;
People.RecentActivity.Providers.ProviderBase.prototype._events = null;
People.RecentActivity.Providers.ProviderBase.prototype._feedCache = null;
People.RecentActivity.Providers.ProviderBase.prototype._albumCache = null;
People.RecentActivity.Providers.ProviderBase.prototype._notificationCache = null;

Object.defineProperty(People.RecentActivity.Providers.ProviderBase.prototype, "feedCache", {
    get: function() {
        /// <summary>
        ///     Gets the feed cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.FeedCache"></value>
        if (this._feedCache == null) {
            this._feedCache = People.RecentActivity.Providers.FeedCache.getInstance(People.RecentActivity.Platform.Platform.instance.getUserPersonCid());
        }

        return this._feedCache;
    }
});

Object.defineProperty(People.RecentActivity.Providers.ProviderBase.prototype, "albumCache", {
    get: function() {
        /// <summary>
        ///     Gets the album cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.AlbumCache"></value>
        if (this._albumCache == null) {
            this._albumCache = People.RecentActivity.Providers.AlbumCache.getInstance(People.RecentActivity.Platform.Platform.instance.getUserPersonCid());
        }

        return this._albumCache;
    }
});

Object.defineProperty(People.RecentActivity.Providers.ProviderBase.prototype, "notificationCache", {
    get: function() {
        /// <summary>
        ///     Gets the notification cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.NotificationCache"></value>
        if (this._notificationCache == null) {
            this._notificationCache = People.RecentActivity.Providers.NotificationCache.getInstance(People.RecentActivity.Platform.Platform.instance.getUserPersonCid());
        }

        return this._notificationCache;
    }
});

Object.defineProperty(People.RecentActivity.Providers.ProviderBase.prototype, "events", {
    get: function() {
        /// <summary>
        ///     Gets the events.
        /// </summary>
        /// <value type="People.RecentActivity.Core.IFeedProviderEvents"></value>
        return this._events;
    },
    set: function(value) {
        Debug.assert(value != null, 'value');
        this._events = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.ProviderBase.prototype, "contactId", {
    get: function() {
        /// <summary>
        ///     Gets the contact id.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.ContactId"></value>
        return this._contactId;
    },
    set: function(value) {
        this._contactId = value;
    }
});

People.RecentActivity.Providers.ProviderBase.prototype.hasUpdate = function(refreshInfo) {
    /// <summary>
    ///     Determines whether the specified refresh info has any update.
    /// </summary>
    /// <param name="refreshInfo" type="People.RecentActivity.Providers.feedObjectRefreshInfo">The refresh info.</param>
    /// <returns type="Boolean"></returns>
    return refreshInfo.objectsAdded.length > 0 || refreshInfo.objectsUpdated.length > 0 || refreshInfo.objectsRemoved.length > 0;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\Core\NotificationInfo.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Platform\AuthInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\..\Platform\ConnectedNetworkChangedEventArgs.js" />
/// <reference path="..\..\Platform\ConnectedNetworkChangedEventType.js" />
/// <reference path="..\..\Platform\ContactId.js" />
/// <reference path="..\..\Platform\Platform.js" />
/// <reference path="..\Cache\CommentRefreshInfo.js" />
/// <reference path="..\Cache\ContactDataCache.js" />
/// <reference path="..\Cache\FeedObjectCache.js" />
/// <reference path="..\Cache\FeedObjectRefreshInfo.js" />
/// <reference path="..\Cache\NotificationRefreshInfo.js" />
/// <reference path="..\Cache\PhotoTagRefreshInfo.js" />
/// <reference path="..\Cache\ReactionRefreshInfo.js" />
/// <reference path="..\IdentityType.js" />
/// <reference path="..\Requests\RequestContext.js" />
/// <reference path="AggregationState.js" />
/// <reference path="ProviderBase.js" />

People.RecentActivity.Providers.FeedProvider = function(identityId, identityType, network, events, aggregated, aggregatorId) {
    /// <summary>
    ///     Base class for feed provider.
    /// </summary>
    /// <param name="identityId" type="String">The identity.</param>
    /// <param name="identityType" type="People.RecentActivity.Providers.IdentityType">The identity type.</param>
    /// <param name="network" type="People.RecentActivity.Core.create_networkInfo">The network.</param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents">The events.</param>
    /// <param name="aggregated" type="Boolean">If the provider will be part of a FeedAggregator.</param>
    /// <param name="aggregatorId" type="String">The aggregator id.</param>
    /// <field name="_fakeIdSegment$1" type="String" static="true">The fake id segment.</field>
    /// <field name="networkId" type="String">The network id.</field>
    /// <field name="_aggregatorId$1" type="String">The aggregator id.</field>
    /// <field name="_requestMap$1" type="Object">The request map, keyed by source id.</field>
    /// <field name="_feedEntryBatchSize$1" type="Number" integer="true">The feed entry batch size.</field>
    /// <field name="_feedEntryMinBatchSize" type="Number" integer="true">The number of entries required to still be considered a "complete" batch.</field>
    /// <field name="_feedEntriesMaxCount" type="Number" integer="true">The maximum number of entries to return.</field>
    /// <field name="_serializer$1" type="People.RecentActivity.Providers.ISerializer">The associated serializer.</field>
    /// <field name="_requestFactory$1" type="People.RecentActivity.Providers.IRequestFactory">The associated request factory.</field>
    /// <field name="_feedObjectCache$1" type="People.RecentActivity.Providers.FeedObjectCache">The feed object cache.</field>
    /// <field name="_seeMoreTimeOffset$1" type="Number" integer="true">The time stamp used for getting more entries.</field>
    /// <field name="_aggregated$1" type="Boolean">Whether the feed provider is part of feed aggregator.</field>
    /// <field name="_totalEntryCount$1" type="Number" integer="true">The total count of entries we retrieved so far.</field>
    /// <field name="_hasMoreEntries$1" type="Boolean">Whether we still can retrieve more entries.</field>
    /// <field name="_isRefreshingFeed$1" type="Boolean">Whether we are refreshing feed.</field>
    /// <field name="_isGettingMoreEntries$1" type="Boolean">Whether we are getting more entries.</field>
    People.RecentActivity.Providers.ProviderBase.call(this, events);
    
    Debug.assert(Jx.isNonEmptyString(identityId), 'identityId');
    Debug.assert(network != null, 'network');
    
    if (aggregated) {
        Debug.assert(Jx.isNonEmptyString(aggregatorId), 'aggregatorId');
    }

    this._aggregatorId$1 = aggregatorId;
    this._requestMap$1 = {};
    this._aggregated$1 = aggregated;
    this.networkId = network.id;

    var config = People.RecentActivity.Platform.Configuration.instance;
    this._feedEntryBatchSize$1 = config.feedEntriesBatchSize;
    this._feedEntryMinBatchSize = config.feedEntriesMinBatchSize;
    this._feedEntriesMaxCount = config.feedEntriesMaxCount;
    
    switch (identityType) {
        case 0:
            this.contactId = People.RecentActivity.Platform.Platform.instance.getContactId(identityId, network.id);
            break;
        case 1:
            this.contactId = new People.RecentActivity.Platform.ContactId(identityId, network.id);
            break;
        default:
            throw new Error('Unknown identity type!');
    }

    People.RecentActivity.Platform.Platform.instance.addListener("connectednetworkchanged", this._onConnectedNetworkChanged$1, this);
};

Jx.inherit(People.RecentActivity.Providers.FeedProvider, People.RecentActivity.Providers.ProviderBase);


People.RecentActivity.Providers.FeedProvider._fakeIdSegment$1 = 'fake';
People.RecentActivity.Providers.FeedProvider.prototype.networkId = null;
People.RecentActivity.Providers.FeedProvider.prototype._aggregatorId$1 = null;
People.RecentActivity.Providers.FeedProvider.prototype._requestMap$1 = null;
People.RecentActivity.Providers.FeedProvider.prototype._feedEntryBatchSize$1 = 0;
People.RecentActivity.Providers.FeedProvider.prototype._feedEntryMinBatchSize = 0;
People.RecentActivity.Providers.FeedProvider.prototype._feedEntriesMaxCount = 0;
People.RecentActivity.Providers.FeedProvider.prototype._serializer$1 = null;
People.RecentActivity.Providers.FeedProvider.prototype._requestFactory$1 = null;
People.RecentActivity.Providers.FeedProvider.prototype._feedObjectCache$1 = null;
People.RecentActivity.Providers.FeedProvider.prototype._seeMoreTimeOffset$1 = 0;
People.RecentActivity.Providers.FeedProvider.prototype._aggregated$1 = false;
People.RecentActivity.Providers.FeedProvider.prototype._totalEntryCount$1 = 0;
People.RecentActivity.Providers.FeedProvider.prototype._hasMoreEntries$1 = true;
People.RecentActivity.Providers.FeedProvider.prototype._isRefreshingFeed$1 = false;
People.RecentActivity.Providers.FeedProvider.prototype._isGettingMoreEntries$1 = false;

Object.defineProperty(People.RecentActivity.Providers.FeedProvider.prototype, "requestFactory", {
    get: function() {
        /// <summary>
        ///     Gets or sets the request factory.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.IRequestFactory"></value>
        return this._requestFactory$1;
    },
    set: function(value) {
        this._requestFactory$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.FeedProvider.prototype, "feedObjectCache", {
    get: function() {
        /// <summary>
        ///     Gets the feed object cache.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.FeedObjectCache"></value>
        if (this._feedObjectCache$1 == null) {
            this._feedObjectCache$1 = People.RecentActivity.Providers.FeedObjectCache.getInstance(People.RecentActivity.Platform.Platform.instance.getUserPersonCid());
        }

        return this._feedObjectCache$1;
    }
});

Object.defineProperty(People.RecentActivity.Providers.FeedProvider.prototype, "serializer", {
    get: function() {
        /// <summary>
        ///     Gets or sets the serializer.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.ISerializer"></value>
        return this._serializer$1;
    },
    set: function(value) {
        this._serializer$1 = value;
    }
});

People.RecentActivity.Providers.FeedProvider.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    People.RecentActivity.Platform.Platform.instance.removeListenerSafe("connectednetworkchanged", this._onConnectedNetworkChanged$1, this);
    for (var k in this._requestMap$1) {
        var entry = { key: k, value: this._requestMap$1[k] };
        entry.value.cancel();
    }

    People.Social.clearKeys(this._requestMap$1);
    this._serializer$1.dispose();
};

People.RecentActivity.Providers.FeedProvider.prototype.getCachedFeedEntries = function(returnBatch, userState) {
    /// <summary>
    ///     Gets the cached feed entries for a contact.
    /// </summary>
    /// <param name="returnBatch" type="Boolean">Whether to only return batch size or all entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedFeedStart, this.networkId, this.contactId.id);

    // if there is a see more request ongoing, we need to cancel it, since we will start over.
    var key = People.RecentActivity.Core.EtwEventName.providerGetMoreFeedEntriesStart;
    if (!Jx.isUndefined(this._requestMap$1[key])) {
        this._requestMap$1[key].cancel();
        this._isGettingMoreEntries$1 = false;
    }

    var entries = this._getCachedFeedObjects$1(People.RecentActivity.Core.FeedObjectInfoType.entry);

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedFeedEnd, this.networkId, this.contactId.id);

    if (returnBatch && entries.length > this._feedEntryBatchSize$1) {
        // If this is part of initializing feed with cached entries first, we give back only the batch size.
        entries = entries.slice(entries.length - this._feedEntryBatchSize$1, entries.length - this._feedEntryBatchSize$1 + this._feedEntryBatchSize$1);
    }

    if (!this.feedInitializing) {
        // this call is not part of feed initialization, so we need to support see more.
        this._seeMoreTimeOffset$1 = (!entries.length) ? 0 : entries[0].timestamp;
        this._totalEntryCount$1 = entries.length;
        this._hasMoreEntries$1 = (this._totalEntryCount$1 < this._feedEntriesMaxCount);

        Jx.log.write(4, People.Social.format('FeedProvider.GetCachedFeedEntries(totalEntryCount:{0}):{1}', this._totalEntryCount$1, this.networkId));

        // we need to mark feedInitialized true here, since the feed is initialized with cached entries.
        this.feedInitialized = true;
    }

    this.events.onGetCachedFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), entries, userState);
};

People.RecentActivity.Providers.FeedProvider.prototype.refreshFeedEntries = function(userState) {
    /// <summary>
    ///     Refreshes the feed entries of a contact.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (this._isRefreshingFeed$1 || this._isGettingMoreEntries$1) {
        Jx.log.write(3, People.Social.format('FeedProvider.RefreshFeedEntries({0},{1}):{2}', this._isRefreshingFeed$1, this._isGettingMoreEntries$1, this.networkId));
        // if we are still getting more entries, return immediately.
        this.events.onRefreshFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], [], [], false, userState);
        return;
    }

    if (!this.feedInitialized) {
        People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetFeedStart, this.networkId, this.contactId.id);
        this.feedInitializing = true;
        // Gives back cached entries if available when first time retrieving the contact's feed.
        // Only returns cached entries when not aggregated, since FeedAggregator will return aggregated cached entries.
        if (!this._aggregated$1) {
            this.getCachedFeedEntries(true, userState);
        }    
    }

    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.feedInitializing = false;
        this.feedInitialized = true;
        this.events.onRefreshFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], [], [], false, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerRefreshFeedStart, this.networkId, this.contactId.id);
    this._isRefreshingFeed$1 = true;
    var requestContext = this._createRequestContext$1(1, null, null, null, userState);
    requestContext.isAggregated = this._aggregated$1;
    var request = this.requestFactory.createGetFeedRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRefreshFeedStart, request);
    request.execute(this._onFeedEntriesRefreshed$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.getMoreFeedEntries = function(userState) {
    /// <summary>
    ///     Gets more entries.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this.feedInitialized || this._isRefreshingFeed$1 || this._isGettingMoreEntries$1) {
        Jx.log.write(3, People.Social.format('FeedProvider.GetMoreFeedEntries({0},{1},{2}):{3}', this.feedInitialized, this._isRefreshingFeed$1, this._isGettingMoreEntries$1, this.networkId));
        // if we are still refreshing feed, return immediately.
        this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], false, userState);
        return;
    }

    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], false, userState);
        return;
    }

    var key = this._getAggregationKey$1('f');
    if (!this._hasMoreEntries$1) {
        if (this._aggregated$1 && People.RecentActivity.Providers.AggregationState.contains(key)) {
            People.RecentActivity.Providers.AggregationState.getAggregationState(key).updateState(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), []);
        }

        Jx.log.write(4, 'FeedProvider.GetMoreFeedEntries(hasMoreEntries:false):' + this.networkId);
        this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], false, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetMoreFeedEntriesStart, this.networkId, this.contactId.id);
    this._isGettingMoreEntries$1 = true;
    var requestContext = this._createRequestContext$1(1, null, null, null, userState);
    requestContext.feedTimeOffset = this._seeMoreTimeOffset$1;
    if (this._aggregated$1 && People.RecentActivity.Providers.AggregationState.contains(key)) {
        requestContext.isAggregated = true;
    }

    var request = this.requestFactory.createGetFeedRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerGetMoreFeedEntriesStart, request);
    request.execute(this._onMoreFeedEntriesRetrieved$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.refreshComments = function(obj, userState) {
    /// <summary>
    ///     Gets or refreshes the comments of a feed entry.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshCommentsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), obj, [], [], userState);
        return;
    }

    if (this._isFakeObject$1(obj)) {
        this.events.onRefreshCommentsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), obj, [], [], userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshCommentsStart, obj);
    var requestContext = this._createRequestContext$1(2, obj, null, null, userState);
    var request = this.requestFactory.createGetCommentsRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRefreshCommentsStart + obj.id, request);
    request.execute(this._onCommentsRefreshed$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.refreshReactions = function(obj, userState) {
    /// <summary>
    ///     Gets or refreshes the reactions of a feed entry.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshReactionsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), obj, [], [], userState);
        return;
    }

    if (this._isFakeObject$1(obj)) {
        this.events.onRefreshReactionsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), obj, [], [], userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshReactionsStart, obj);
    // get all the reactions that need to be refreshed.
    // note that some reactions (those displayed in the feed only) are not refreshed.
    var reactionInfos = [];
    reactionInfos.push.apply(reactionInfos, People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfos(obj.sourceId));
    // update the aggregation state.
    People.RecentActivity.Providers.AggregationState.getAggregationState(this._getAggregationKey$1(obj.id)).reset(reactionInfos.length);
    // send request for each type of reactions this network supports.
    for (var i = 0, len = reactionInfos.length; i < len; i++) {
        var requestContext = this._createRequestContext$1(3, obj, null, null, userState);
        requestContext.reactionType = reactionInfos[i].type;
        var request = this.requestFactory.createGetReactionsRequest(requestContext);
        this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRefreshReactionsStart + obj.id + requestContext.reactionType, request);
        request.execute(this._onReactionsRefreshed$1.bind(this));
    }
};

People.RecentActivity.Providers.FeedProvider.prototype.addComment = function(obj, comment, userState) {
    /// <summary>
    ///     Posts the comment.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment to add.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onCommentAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), obj, null, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeCommentEvent(People.RecentActivity.Core.EtwEventName.providerAddCommentStart, obj, comment);
    var requestContext = this._createRequestContext$1(4, obj, comment, null, userState);
    var request = this.requestFactory.createAddCommentRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerAddCommentStart, request);
    request.execute(this._onCommentAdded$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.addReaction = function(obj, reaction, userState) {
    /// <summary>
    ///     Adds a reaction.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onReactionAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), obj, reaction, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.providerAddReactionStart, obj, reaction);
    var requestContext = this._createRequestContext$1(5, obj, null, reaction, userState);
    var request = this.requestFactory.createAddReactionRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerAddReactionStart, request);
    request.execute(this._onReactionAdded$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.removeReaction = function(obj, reaction, userState) {
    /// <summary>
    ///     Deletes a reaction.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onReactionRemoved(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), obj, reaction, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.providerRemoveReactionStart, obj, reaction);

    var requestContext = this._createRequestContext$1(0, obj, null, reaction, userState);

    var request = this.requestFactory.createRemoveReactionRequest(requestContext);
    if (request == null) {
        // we couldn't create a request for this operation, so fail it.
        this.events.onReactionRemoved(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.failure), obj, reaction, userState);
        return;
    }

    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRemoveReactionStart, request);

    request.execute(this._onReactionRemoved$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.refreshAlbums = function(userState) {
    /// <summary>
    ///     Refreshes the albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this.albumInitialized) {
        People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetAlbumsStart, this.networkId, this.contactId.id);
        // Gives back cached albums if available when first time retrieving the contact's albums.
        if (!this._aggregated$1) {
            this.getCachedAlbums(userState);
        }    
    }

    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshAlbumsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], [], [], userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerRefreshAlbumsStart, this.networkId, this.contactId.id);
    var requestContext = this._createRequestContext$1(7, null, null, null, userState);
    var request = this.requestFactory.createGetAlbumsRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRefreshAlbumsStart, request);
    request.execute(this._onAlbumsRefreshed$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.getCachedAlbums = function(userState) {
    /// <summary>
    ///     Gets the cached albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedAlbumsStart, this.networkId, this.contactId.id);

    var albums = this._getCachedFeedObjects$1(People.RecentActivity.Core.FeedObjectInfoType.photoAlbum);

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedAlbumsEnd, this.networkId, this.contactId.id);

    this.events.onGetCachedAlbumsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), albums, userState);
};

People.RecentActivity.Providers.FeedProvider.prototype.refreshAlbum = function(album, userState) {
    /// <summary>
    ///     Refreshes the album including its metadata and photos.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo">The album.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshAlbumCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), album, [], [], [], userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshAlbumStart, album);
    var requestContext = this._createRequestContext$1(8, album, null, null, userState);
    var request = this.requestFactory.createRefreshAlbumRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRefreshAlbumStart + album.id, request);
    request.execute(this._onAlbumRefreshed$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.refreshPhoto = function(photo, userState) {
    /// <summary>
    ///     Refreshes the photo including its metadata and photo tags.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshPhotoCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), photo, [], [], userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshPhotoStart, photo);
    var requestContext = this._createRequestContext$1(9, photo, null, null, userState);
    var request = this.requestFactory.createRefreshPhotoRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRefreshPhotoStart + photo.id, request);
    request.execute(this._onPhotoRefreshed$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.getFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onGetFeedObjectCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), info, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerGetFeedObjectStart, info);
    var requestContext = this._createRequestContext$1(0, info, null, null, userState);
    var request = this.requestFactory.createGetFeedObjectRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerGetFeedObjectStart, request);
    request.execute(this._onFeedObjectReceived$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.getCachedFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single, cached, feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(info != null, 'info');
    Debug.assert(this.networkId === info.sourceId, People.Social.format('networkId:{0}; info.SourceId:{1}', this.networkId, info.sourceId));

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedFeedObjectStart, info);

    var obj = this._findObjectById$1(info.id, info.sourceId, info.type);
    
    // For entries we need to replace the album/photo with the specific cached object.
    if (!Jx.isNullOrUndefined(obj) && obj.type === People.RecentActivity.Core.FeedObjectInfoType.entry) {
        var entry = obj.data;

        // Photo entries need the photo object replaced.
        if (entry.type === People.RecentActivity.Core.FeedEntryInfoType.photo) {
            var photo = entry.data.photo;
            var album = entry.data.album;

            var cachePhoto = this._findObjectById$1(photo.data.id, photo.sourceId, photo.type);

            if (cachePhoto !== null) {
                // We found a suitable replacement, go ahead and replace it.
                entry.data.photo = cachePhoto;

                // Merge the existing album with the cached photo to ensure the cached photo is in the album.
                album.data.photos = People.RecentActivity.Providers.SocialHelper.mergePhotos([cachePhoto], album.data.photos, false);
            }
        }

        // Both photos and albums need to have the album replaced.
        if (entry.type === People.RecentActivity.Core.FeedEntryInfoType.photo ||
            entry.type === People.RecentActivity.Core.FeedEntryInfoType.photoAlbum) {
            var album = entry.data.album;
            var cacheAlbum = this._findObjectById$1(album.data.id, album.sourceId, album.type);

            if (cacheAlbum !== null) {
                // We found a suitable replacement, ensure the album's photos exist in the cached copy.
                var mergedPhotos = People.RecentActivity.Providers.SocialHelper.mergePhotos(cacheAlbum.data.photos, album.data.photos, true);

                // Replace the photos and ensure the total count is correct post-merge.
                cacheAlbum.data.photos = mergedPhotos;
                cacheAlbum.data.totalCount = mergedPhotos.length;

                // Now check the feed object cache for updates.
                for (var i = 0, len = mergedPhotos.length; i < len; i++) {
                    var cachedPhoto = this.feedObjectCache.getFeedObject(mergedPhotos[i].data.id, entry.type);

                    if (!Jx.isNullOrUndefined(cachedPhoto)) {
                        // We found the photo in the feed object cache, replace it in the array, ensuring that the index is kept unchanged.
                        cachedPhoto.data.index = mergedPhotos[i].data.index;
                        mergedPhotos[i] = cachedPhoto;
                    }
                }

                // Go ahead and replace the entry's album.
                entry.data.album = cacheAlbum;
            }
        }
    }

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedFeedObjectEnd, info);

    if (obj != null) {
        this.events.onGetCachedFeedObjectCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), obj, userState);
    }
    else {
        this.events.onGetCachedFeedObjectCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.failure), info, userState);
    }
};

People.RecentActivity.Providers.FeedProvider.prototype.addFeedObject = function(info, userState) {
    /// <summary>
    ///     Adds a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onFeedObjectAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), info, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerAddFeedObjectStart, info);
    var requestContext = this._createRequestContext$1(13, info, null, null, userState);
    var request = this.requestFactory.createAddFeedObjectRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerAddFeedObjectStart, request);
    request.execute(this._onFeedObjectAdded$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.refreshNotifications = function(userState) {
    /// <summary>
    ///     Refresh the notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshNotificationsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], [], [], userState);
        return;
    }

    if (!this.notificationsInitialized && !this._aggregated$1) {
        // Gives back cached notifications if available when first time retrieving the contact's feed.
        this.getCachedNotifications(userState);
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerRefreshNotificationsStart, this.networkId, this.contactId.id);
    var requestContext = this._createRequestContext$1(6, null, null, null, userState);
    requestContext.isAggregated = this._aggregated$1;
    var request = this.requestFactory.createRefreshNotificationsRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerRefreshNotificationsStart, request);
    request.execute(this._onRefreshNotificationsCompleted$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.getCachedNotifications = function(userState) {
    /// <summary>
    ///     Retrieves the cached notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    // We won't retrieve cached notifications when offline.
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onGetCachedNotificationsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedNotificationsStart, this.networkId, this.contactId.id);

    var notifications = this._getCachedNotificationsInternal$1();

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetCachedNotificationsEnd, this.networkId, this.contactId.id);

    if (!this.notificationsInitialized) {
        // This call is the first time initializing notifications.
        this.notificationsInitialized = true;
    }

    this.events.onGetCachedNotificationsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), notifications, userState);
};

People.RecentActivity.Providers.FeedProvider.prototype.markNotificationsRead = function(notifications, userState) {
    /// <summary>
    ///     Marks the specified notifications as read.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to mark as read.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onMarkNotificationsReadCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), notifications, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerMarkNotificationsReadStart, this.networkId, this.contactId.id);
    var requestContext = this._createRequestContext$1(0, null, null, null, userState);
    requestContext.notifications = notifications;
    requestContext.isAggregated = this._aggregated$1;
    var request = this.requestFactory.createMarkNotificationsReadRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerMarkNotificationsReadStart, request);
    request.execute(this._onMarkNotificationsReadCompleted$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.getUnreadNotificationsCount = function(userState) {
    /// <summary>
    ///     Gets the count of unread notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onGetUnreadNotificationsCountCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), 0, userState);
        return;
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetUnreadNotificationsCountStart, this.networkId, this.contactId.id);
    var requestContext = this._createRequestContext$1(10, null, null, null, userState);
    requestContext.isAggregated = this._aggregated$1;
    var request = this.requestFactory.createGetUnreadNotificationsCountRequest(requestContext);
    this._setRequestMap$1(People.RecentActivity.Core.EtwEventName.providerGetUnreadNotificationsCountStart, request);
    request.execute(this._onGetUnreadNotificationsCountCompleted$1.bind(this));
};

People.RecentActivity.Providers.FeedProvider.prototype.getNotificationsFromResponse = function(response) {
    /// <summary>
    ///     Gets the notifications from response.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <returns type="Array" elementType="notificationInfo"></returns>
    return response.data;
};

People.RecentActivity.Providers.FeedProvider.prototype.getUnreadNotificationsCountFromResponse = function(response) {
    /// <summary>
    ///     Gets the unread notifications count internal.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <returns type="Number" integer="true"></returns>
    return response.data;
};

People.RecentActivity.Providers.FeedProvider.prototype._onFeedEntriesRefreshed$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for RefreshFeedEntries has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerRefreshFeedEnd, this.networkId, this.contactId.id);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRefreshFeedStart];
    
    var requestContext = response.requestContext;
    var entries = response.data || [];

    if (!this.feedInitialized) {
        // This refresh call is the first time initializing contact's feed.
        this.feedInitialized = true;
        this.feedInitializing = false;
        People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetFeedEnd, this.networkId, this.contactId.id);
    }

    // Update cache if necessary and get refresh info.
    var refreshInfo = this._refreshCachedFeedObjects$1(response, entries, People.RecentActivity.Core.FeedObjectInfoType.entry);

    // if this is the first time here or the feed is refreshed again with updates, we need to set/reset the see more variables.
    if (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success && (!this._seeMoreTimeOffset$1 || this.hasUpdate(refreshInfo))) {
        // Track the oldest entry rendered.
        this._seeMoreTimeOffset$1 = (!entries.length) ? 0 : entries[0].timestamp;
        this._totalEntryCount$1 = entries.length;

        // Compare the number of entries received (not just the valid ones) to see if we think there might be more.
        this._hasMoreEntries$1 = (requestContext.numEntriesReceived >= this._feedEntryMinBatchSize);

        Jx.log.write(4, People.Social.format('FeedProvider.OnFeedEntriesRefreshed(totalEntryCount:{0}):{1}', this._totalEntryCount$1, this.networkId));
    }

    this.events.onRefreshFeedEntriesCompleted(response.resultInfo, refreshInfo.objectsAdded, refreshInfo.objectsUpdated, refreshInfo.objectsRemoved, this._hasMoreEntries$1, requestContext.userState);
    this._isRefreshingFeed$1 = false;
};

People.RecentActivity.Providers.FeedProvider.prototype._onMoreFeedEntriesRetrieved$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for GetMoreFeedEntries has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetMoreFeedEntriesEnd, this.networkId, this.contactId.id);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerGetMoreFeedEntriesStart];

    var requestContext = response.requestContext;
    var entries = response.data || [];

    var key = this._getAggregationKey$1('f');
    var state = null;

    // It is an aggregation scenario in which we need to update aggregation state.
    // For example, if the feed aggregator only has one supported provider to get feed,
    // then we don't need to update aggregation state(aggregation state should already be removed in this case).
    if (this._aggregated$1 && People.RecentActivity.Providers.AggregationState.contains(key)) {
        state = People.RecentActivity.Providers.AggregationState.getAggregationState(key);
        var context = response.requestContext;
        state.updateScenarioInstrumentation(context.scenarioId, context);
        state.updateState(response.resultInfo, entries);
    }

    if (response.success) {
        if (entries.length > 0) {
            if (state == null) {
                // we only update cache here if it is not aggregated scenario, otherwise we will update cache in FeedAggregator with the actual
                // entries we return.
                this.feedCache.addMoreFeedEntries(this.contactId, entries);
            }

            this._seeMoreTimeOffset$1 = entries[0].timestamp;
            this._totalEntryCount$1 += entries.length;

            Jx.log.write(4, People.Social.format('FeedProvider.OnMoreFeedEntriesRetrieved(totalEntryCount:{0}):{1}', this._totalEntryCount$1, this.networkId));
        }

        if (this._totalEntryCount$1 >= this._feedEntriesMaxCount ||
            requestContext.numEntriesReceived < this._feedEntryMinBatchSize) {
            // We already reached max count or we didn't receive a whole batch of entries from the service.
            this._hasMoreEntries$1 = false;

            Jx.log.write(4, 'FeedProvider.OnMoreFeedEntriesRetrieved(hasMoreEntries:false):' + this.networkId);
        }    
    }

    this.events.onGetMoreEntriesCompleted(response.resultInfo, entries, this._hasMoreEntries$1, requestContext.userState);
    this._isGettingMoreEntries$1 = false;
};

People.RecentActivity.Providers.FeedProvider.prototype._onAlbumsRefreshed$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for RefreshAlbums has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerRefreshAlbumsEnd, this.networkId, this.contactId.id);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRefreshAlbumsStart];

    var albums = response.data;

    if (!this.albumInitialized) {
        // This refresh call is the first time initializing contact's albums.
        this.albumInitialized = true;
        People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetAlbumsEnd, this.networkId, this.contactId.id);
    }

    // Update cache and get refresh info.
    var refreshInfo = this._refreshCachedFeedObjects$1(response, albums, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum);

    this.events.onRefreshAlbumsCompleted(response.resultInfo, refreshInfo.objectsAdded, refreshInfo.objectsUpdated, refreshInfo.objectsRemoved, response.requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onAlbumRefreshed$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for RefreshAlbum has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    var requestContext = response.requestContext;
    var album = requestContext.feedObject;

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshAlbumEnd, album);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRefreshAlbumStart + album.id];

    var photos = response.data;

    // Update cache and get refresh info.
    var refreshInfo = (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) ?
        this.albumCache.refreshAlbum(this.contactId, album, photos) :
        People.RecentActivity.Providers.create_feedObjectRefreshInfo();

    this.events.onRefreshAlbumCompleted(response.resultInfo, album, refreshInfo.objectsAdded, refreshInfo.objectsUpdated, refreshInfo.objectsRemoved, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onPhotoRefreshed$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for RefreshPhoto has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    var requestContext = response.requestContext;
    var photo = requestContext.feedObject;

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshPhotoEnd, photo);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRefreshPhotoStart + photo.id];

    var photoTags = response.data;

    // Update cache and get refresh info.
    var refreshInfo = (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) ?
        this.albumCache.refreshPhoto(this.contactId, photo, photoTags) :
        People.RecentActivity.Providers.create_photoTagRefreshInfo();

    this.events.onRefreshPhotoCompleted(response.resultInfo, photo, refreshInfo.photoTagsAdded, refreshInfo.photoTagsRemoved, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onCommentsRefreshed$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for RefreshComments has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    var requestContext = response.requestContext;
    var obj = requestContext.feedObject;

    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshCommentsEnd, obj);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRefreshCommentsStart + obj.id];

    var comments = response.data;

    // Update cache and get refresh info.
    var refreshInfo = (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) ?
        this._getFeedObjectCache$1(obj.type).refreshComments(this.contactId, obj, comments) :
        People.RecentActivity.Providers.create_commentRefreshInfo();

    this.events.onRefreshCommentsCompleted(response.resultInfo, obj, refreshInfo.commentsAdded, refreshInfo.commentsRemoved, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onReactionsRefreshed$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for RefreshReactions has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    var requestContext = response.requestContext;
    var obj = requestContext.feedObject;
    var reactions = response.data;

    var key = this._getAggregationKey$1(obj.id);
    var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(key);
    aggregationState.updateState(response.resultInfo, reactions);

    // All outstanding requests have come back.
    if (!aggregationState.outstandingRequests) {
        People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerRefreshReactionsEnd, obj);
        delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRefreshReactionsStart + obj.id + requestContext.reactionType];

        var result = aggregationState.aggregationResult;

        // Update cache and get refresh info.
        var refreshInfo = (result.code !== People.RecentActivity.Core.ResultCode.failure) ?
            this._getFeedObjectCache$1(obj.type).refreshReactions(this.contactId, obj, aggregationState.objectList) :
            People.RecentActivity.Providers.create_reactionRefreshInfo();

        People.RecentActivity.Providers.AggregationState.removeAggregationState(key);

        this.events.onRefreshReactionsCompleted(result, obj, refreshInfo.reactionsAdded, refreshInfo.reactionsRemoved, requestContext.userState);
    }
};

People.RecentActivity.Providers.FeedProvider.prototype._onCommentAdded$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for AddComment has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    var requestContext = response.requestContext;
    var comment = response.data || requestContext.comment;
    var obj = requestContext.feedObject;

    People.RecentActivity.Core.EtwHelper.writeCommentEvent(People.RecentActivity.Core.EtwEventName.providerAddCommentEnd, obj, comment);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerAddCommentStart];

    if (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) {
        this._getFeedObjectCache$1(obj.type).addComment(this.contactId, obj, comment);
    }

    this.events.onCommentAdded(response.resultInfo, obj, comment, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onReactionAdded$1 = function(response) {
    /// <summary>
    ///     Occurs when the request for AddReaction has completed.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    var requestContext = response.requestContext;
    var obj = requestContext.feedObject;
    var reaction = response.data || requestContext.reaction;

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.providerAddReactionEnd, obj, reaction);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerAddReactionStart];

    if (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) {
        this._getFeedObjectCache$1(obj.type).addReaction(this.contactId, obj, reaction);
    }

    this.events.onReactionAdded(response.resultInfo, obj, reaction, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onReactionRemoved$1 = function(response) {
    /// <summary>
    ///     Occurs when a reaction is deleted.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');

    var requestContext = response.requestContext;
    var obj = requestContext.feedObject;
    var reaction = requestContext.reaction;

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.providerRemoveReactionEnd, obj, reaction);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRemoveReactionStart];

    if (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) {
        this._getFeedObjectCache$1(obj.type).removeReaction(this.contactId, obj, reaction);
    }

    this.events.onReactionRemoved(response.resultInfo, obj, reaction, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onFeedObjectReceived$1 = function(response) {
    /// <summary>
    ///     Occurs when a feed object is retrieved.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerGetFeedObjectEnd, response.requestContext.feedObject);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerGetFeedObjectStart];
    var objects = response.data || [];
    Debug.assert(objects.length <= 1, 'objects.Length:' + objects.length);
    var obj = null;
    var result = response.resultInfo;
    if (result.code === People.RecentActivity.Core.ResultCode.success && objects.length > 0) {
        obj = objects[0];
        this.feedObjectCache.addFeedObject(obj);
    }
    else {
        // if nothing returned, treat it as failure.
        result.code = People.RecentActivity.Core.ResultCode.failure;
        obj = response.requestContext.feedObject;
    }

    this.events.onGetFeedObjectCompleted(result, obj, response.requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onFeedObjectAdded$1 = function(response) {
    /// <summary>
    ///     Occurs when a feed object is added.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response data.</param>
    Debug.assert(response != null, 'response != null');
    var info = response.data;
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.providerAddFeedObjectEnd, info);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerAddFeedObjectStart];
    this.events.onFeedObjectAdded(response.resultInfo, info, response.requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onRefreshNotificationsCompleted$1 = function(response) {
    /// <summary>
    ///     Occurs when the refresh request completes.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');
    var requestContext = response.requestContext;
    var notifications = this.getNotificationsFromResponse(response);
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerRefreshNotificationsEnd, this.networkId, this.contactId.id);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerRefreshNotificationsStart];
    if (!this.notificationsInitialized) {
        // This refresh call is the first time initializing notifications.
        this.notificationsInitialized = true;
    }

    var refreshInfo = this._refreshCachedNotifications$1(response, notifications);
    this.events.onRefreshNotificationsCompleted(response.resultInfo, refreshInfo.notificationsAdded, refreshInfo.notificationsUpdated, refreshInfo.notificationsRemoved, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onMarkNotificationsReadCompleted$1 = function(response) {
    /// <summary>
    ///     Occurs when the request to mark notifications as read completes.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    Debug.assert(response != null, 'response');
    var requestContext = response.requestContext;
    var notifications = requestContext.notifications;
    var notificationsInfo = notifications;
    if (this._aggregated$1) {
        var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(this._getAggregationKey$1('rn'));
        aggregationState.updateScenarioInstrumentation(InstruScenarioId.modernPeople_MarkNotificationsRead, requestContext);
    }

    if (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) {
        notificationsInfo = new Array(notifications.length);
        for (var i = 0, len = notificationsInfo.length; i < len; i++) {
            notificationsInfo[i] = People.RecentActivity.Core.create_notificationInfo(notifications[i].id, notifications[i].publisher, notifications[i].timestamp, notifications[i].message, notifications[i].objectId, notifications[i].objectType, notifications[i].link, notifications[i].via, notifications[i].sourceId, notifications[i].isReply, notifications[i].isShare, false);
        }

        var cache = this.notificationCache;
        cache.markNotificationsRead(this.networkId, notificationsInfo);
    }

    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerMarkNotificationsReadEnd, this.networkId, this.contactId.id);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerMarkNotificationsReadStart];
    this.events.onMarkNotificationsReadCompleted(response.resultInfo, notificationsInfo, requestContext.userState);
};

People.RecentActivity.Providers.FeedProvider.prototype._onGetUnreadNotificationsCountCompleted$1 = function(response) {
    /// <summary>
    ///     Occurs when the request to get the unread notifications count completes.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.providerGetUnreadNotificationsCountEnd, this.networkId, this.contactId.id);
    delete this._requestMap$1[People.RecentActivity.Core.EtwEventName.providerGetUnreadNotificationsCountStart];
    if (this._aggregated$1) {
        var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(this._getAggregationKey$1('u'));
        aggregationState.updateScenarioInstrumentation(InstruScenarioId.modernPeople_GetUnreadNotificationsCount, response.requestContext);
    }

    var result = response.resultInfo;
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        this.events.onGetUnreadNotificationsCountCompleted(result, this.getUnreadNotificationsCountFromResponse(response), response.requestContext.userState);
    }
    else {
        this.events.onGetUnreadNotificationsCountCompleted(result, 0, response.requestContext.userState);
    }
};

People.RecentActivity.Providers.FeedProvider.prototype._createRequestContext$1 = function(expectedResponse, entry, comment, reaction, userState) {
    /// <param name="expectedResponse" type="People.RecentActivity.Providers.KnownType"></param>
    /// <param name="entry" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo"></param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <param name="userState" type="Object"></param>
    /// <returns type="People.RecentActivity.Providers.RequestContext"></returns>
    var authInfo = People.RecentActivity.Platform.AuthInfo.getInstance(this.networkId);
    Debug.assert(authInfo != null, 'authInfo');

    var contactIds = {};
    contactIds[this.networkId] = this.contactId;

    var requestContext = new People.RecentActivity.Providers.RequestContext(authInfo, contactIds, this.serializer);
    requestContext.expectedResponse = expectedResponse;
    requestContext.feedObject = entry;
    requestContext.comment = comment;
    requestContext.reaction = reaction;
    requestContext.userState = userState;

    return requestContext;
};

People.RecentActivity.Providers.FeedProvider.prototype._getFeedObjectCache$1 = function(type) {
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType"></param>
    /// <returns type="People.RecentActivity.Providers.ContactDataCache"></returns>
    switch (type) {
        case People.RecentActivity.Core.FeedObjectInfoType.entry:
            return this.feedCache;
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            return this.albumCache;
        default:
            Debug.assert(false, 'Unsupported feed object type');
            return null;
    }
};

People.RecentActivity.Providers.FeedProvider.prototype._findObjectById$1 = function(id, sourceId, type) {
    /// <param name="id" type="String"></param>
    /// <param name="sourceId" type="String"></param>
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType"></param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    var obj = this._getFeedObjectCache$1(type).findObjectById(this.contactId, id, type);

    if (Jx.isNullOrUndefined(obj)) {
        // We couldn't find the object in the normal cache, check the feed object cache.
        obj = this.feedObjectCache.getFeedObject(id, type);
    }

    return obj;
};

People.RecentActivity.Providers.FeedProvider.prototype._refreshCachedFeedObjects$1 = function(response, objs, type) {
    /// <param name="response" type="People.RecentActivity.Providers.IResponse"></param>
    /// <param name="objs" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType"></param>
    /// <returns type="People.RecentActivity.Providers.feedObjectRefreshInfo"></returns>
    Debug.assert(type === People.RecentActivity.Core.FeedObjectInfoType.entry || type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'type:' + type);

    var result = response.resultInfo;
    var cache = this._getFeedObjectCache$1(type);
    var key = (type === People.RecentActivity.Core.FeedObjectInfoType.entry) ? 'f' : 'a';
    var state = People.RecentActivity.Providers.AggregationState.getAggregationState(this._getAggregationKey$1(key));

    // If the provider is not part of aggregation or only aggregate one network, easy.
    if (!this._aggregated$1 || state.totalRequests === 1) {
        return (result.code === People.RecentActivity.Core.ResultCode.success) ? cache.refreshFeedObjects(this.contactId, objs) : People.RecentActivity.Providers.create_feedObjectRefreshInfo();
    }

    // It is part of aggregation.
    state.updateScenarioInstrumentation(response.requestContext.scenarioId, response.requestContext);

    var cachedObjects = this._getCachedFeedObjects$1(type);

    if (result.code !== People.RecentActivity.Core.ResultCode.success) {
        // If this provider is part of aggregator, when the request fails, we return cached objects as if we get them from service, otherwise in the case of partial failure,
        // UI will delete all current entries from the failed networks, since they would come back as entriesToRemove.
        state.updateStateWithCachedObjects(result, cachedObjects, cachedObjects);

        return People.RecentActivity.Providers.create_feedObjectRefreshInfo();
    }

    Debug.assert(objs != null, 'objs');

    // The request succeeds and is part of aggregation, so update aggregation state.
    // we don't actually update cache here since for aggregation scenario we will update cache in FeedAggregator with the actual
    // entries we return.
    state.updateStateWithCachedObjects(result, objs, cachedObjects);

    return People.RecentActivity.Providers.create_feedObjectRefreshInfo();
};

People.RecentActivity.Providers.FeedProvider.prototype._refreshCachedNotifications$1 = function(response, notifications) {
    /// <param name="response" type="People.RecentActivity.Providers.IResponse"></param>
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    /// <returns type="People.RecentActivity.Providers.notificationRefreshInfo"></returns>
    var result = response.resultInfo;
    var cache = this.notificationCache;
    var state = People.RecentActivity.Providers.AggregationState.getAggregationState(this._getAggregationKey$1('n'));
    if (!this._aggregated$1 || state.totalRequests === 1) {
        return (result.code === People.RecentActivity.Core.ResultCode.success) ? cache.refreshNotifications(this.networkId, notifications) : People.RecentActivity.Providers.create_notificationRefreshInfo();
    }

    // It is part of aggregation.
    state.updateScenarioInstrumentation(InstruScenarioId.modernPeople_GetNotifications, response.requestContext);
    // Get the cached notifications first.
    var cachedNotifications = this._getCachedNotificationsInternal$1();
    if (result.code !== People.RecentActivity.Core.ResultCode.success) {
        // If this provider is part of aggregator, when the request fails, we return cached objects as if we get them from service, otherwise in the case of partial failure,
        // UI will delete all current entries from the failed networks, since they would come back as entriesToRemove.
        state.updateStateWithCachedObjects(result, cachedNotifications, cachedNotifications);
        return People.RecentActivity.Providers.create_notificationRefreshInfo();
    }

    Debug.assert(notifications != null, 'notifications');
    // The request succeeds and is part of aggregation, so update aggregation state.
    state.updateStateWithCachedObjects(result, notifications, cachedNotifications);
    return People.RecentActivity.Providers.create_notificationRefreshInfo();
};

People.RecentActivity.Providers.FeedProvider.prototype._getCachedFeedObjects$1 = function(type) {
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType"></param>
    /// <returns type="Array" elementType="feedObjectInfo"></returns>
    var cache = this._getFeedObjectCache$1(type);

    return cache.getFeedObjects(this.contactId);
};

People.RecentActivity.Providers.FeedProvider.prototype._getCachedNotificationsInternal$1 = function() {
    /// <returns type="Array" elementType="notificationInfo"></returns>
    return this.notificationCache.getNotifications(this.networkId);
};

People.RecentActivity.Providers.FeedProvider.prototype._isFakeObject$1 = function(obj) {
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="Boolean"></returns>
    Debug.assert(obj != null, 'obj');
    return obj.id.indexOf('fake') >= 0;
};

People.RecentActivity.Providers.FeedProvider.prototype._setRequestMap$1 = function(key, request) {
    /// <param name="key" type="String"></param>
    /// <param name="request" type="People.RecentActivity.Providers.IRequest"></param>
    if (!Jx.isUndefined(this._requestMap$1[key])) {
        // Cancel the old request.
        this._requestMap$1[key].cancel();
    }

    this._requestMap$1[key] = request;
};

People.RecentActivity.Providers.FeedProvider.prototype._getAggregationKey$1 = function(key) {
    /// <param name="key" type="String"></param>
    /// <returns type="String"></returns>
    return this._aggregatorId$1 + '_' + key;
};

People.RecentActivity.Providers.FeedProvider.prototype._onConnectedNetworkChanged$1 = function(e) {
    /// <param name="e" type="People.RecentActivity.Platform.ConnectedNetworkChangedEventArgs"></param>
    Debug.assert(e != null, 'e');
    // ignore any changes for networks that are outside this provider.
    if (e.sourceId === this.networkId) {
        switch (e.type) {
            case People.RecentActivity.Platform.ConnectedNetworkChangedEventType.updated:
                this.events.onUpdated(People.RecentActivity.Platform.Platform.instance.getNetworkInfoById(this.networkId));
                break;
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\Cache\SocialCache.js" />
/// <reference path="..\IdentityType.js" />
/// <reference path="..\RequestFactories\FacebookRequestFactory.js" />
/// <reference path="..\Serializers\FacebookSerializer.js" />
/// <reference path="FeedProvider.js" />

People.RecentActivity.Providers.FacebookProvider = function(identityId, identityType, network, events, aggregated, aggregatiorId) {
    /// <summary>
    ///     Facebook feed provider.
    /// </summary>
    /// <param name="identityId" type="String">The identity id.</param>
    /// <param name="identityType" type="People.RecentActivity.Providers.IdentityType">The identity type.</param>
    /// <param name="network" type="People.RecentActivity.Core.create_networkInfo">The network.</param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents">The events.</param>
    /// <param name="aggregated" type="Boolean">If the provider will be part of a FeedAggregator.</param>
    /// <param name="aggregatiorId" type="String">The aggregator id.</param>
    People.RecentActivity.Providers.FeedProvider.call(this, identityId, identityType, network, events, aggregated, aggregatiorId);
    Debug.assert(network.id === People.RecentActivity.Core.NetworkId.facebook, 'network.Id');
    this.serializer = new People.RecentActivity.Providers.FacebookSerializer(new People.RecentActivity.Providers.SocialCache(network.id));
    this.requestFactory = new People.RecentActivity.Providers.FacebookRequestFactory();
};

Jx.inherit(People.RecentActivity.Providers.FacebookProvider, People.RecentActivity.Providers.FeedProvider);
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Cache\FeedEntryInfoCollection.js" />
/// <reference path="..\Cache\FeedObjectRefreshInfo.js" />
/// <reference path="..\Cache\NotificationInfoCollection.js" />
/// <reference path="..\Cache\NotificationRefreshInfo.js" />
/// <reference path="AggregationState.js" />
/// <reference path="FacebookProvider.js" />
/// <reference path="ProviderBase.js" />
/// <reference path="SupProvider.js" />

People.RecentActivity.Providers.FeedAggregator = function(personId, networks, events) {
    /// <summary>
    ///     Represents a feed aggregator.
    /// </summary>
    /// <param name="personId" type="String">The person id.</param>
    /// <param name="networks" type="Array" elementType="networkInfo">The networks to aggregate.</param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents">The events.</param>
    /// <field name="_personId$1" type="String">The person id.</field>
    /// <field name="_aggregatorId$1" type="String">The id for the aggregator.</field>
    /// <field name="_networks$1" type="Array" elementType="networkInfo">The networks to aggregate.</field>
    /// <field name="_providerMap$1" type="Object">The provider map, keyed by source id.</field>
    /// <field name="_supportedProviders$1" type="Object">The supported provider map, keyed by the type of the objects to aggregate.</field>
    /// <field name="_feedEntryBatchSize$1" type="Number" integer="true">The feed entry batch size.</field>
    /// <field name="_feedEntryMinBatchSize" type="Number" integer="true">The number of entries required to still be considered a "complete" batch.</field>
    /// <field name="_feedEntriesMaxCount" type="Number" integer="true">The maximum number of entries to return.</field>
    /// <field name="_providers$1" type="Array" elementType="IFeedProvider">The providers for aggregation.</field>
    /// <field name="_totalEntryCount$1" type="Number" integer="true">The total count of entries we retrieved so far.</field>
    /// <field name="_hasMoreEntries$1" type="Boolean">Whether we still can retrieve more entries.</field>
    /// <field name="_isRefreshingFeed$1" type="Boolean">Whether we are refreshing feed.</field>
    /// <field name="_isGettingMoreEntries$1" type="Boolean">Whether we are getting more entries.</field>
    /// <field name="_returnBatch$1" type="Boolean">Whether to return batch size of cached objects.</field>
    People.RecentActivity.Providers.ProviderBase.call(this, events);

    Debug.assert(Jx.isNonEmptyString(personId), 'personId');
    Debug.assert(networks != null && networks.length > 1, 'networks');

    this._providerMap$1 = {};
    this._supportedProviders$1 = {};
    this._totalEntryCount$1 = -1;

    this._personId$1 = personId;
    this._networks$1 = networks;

    var config = People.RecentActivity.Platform.Configuration.instance;
    this._feedEntryBatchSize$1 = config.feedEntriesBatchSize;
    this._feedEntryMinBatchSize = config.feedEntriesMinBatchSize;
    this._feedEntriesMaxCount = config.feedEntriesMaxCount;

    // use the current time as the id, we use this id to indicate the aggregation states associated with this aggregator.
    this._aggregatorId$1 = new Date().getTime().toString();

    this._initializeProviders$1();
};

Jx.inherit(People.RecentActivity.Providers.FeedAggregator, People.RecentActivity.Providers.ProviderBase);

People.RecentActivity.Providers.FeedAggregator.prototype._personId$1 = null;
People.RecentActivity.Providers.FeedAggregator.prototype._aggregatorId$1 = null;
People.RecentActivity.Providers.FeedAggregator.prototype._networks$1 = null;
People.RecentActivity.Providers.FeedAggregator.prototype._feedEntryBatchSize$1 = 0;
People.RecentActivity.Providers.FeedAggregator.prototype._feedEntryMinBatchSize = 0;
People.RecentActivity.Providers.FeedAggregator.prototype._feedEntriesMaxCount = 0;
People.RecentActivity.Providers.FeedAggregator.prototype._providers$1 = null;
People.RecentActivity.Providers.FeedAggregator.prototype._hasMoreEntries$1 = true;
People.RecentActivity.Providers.FeedAggregator.prototype._isRefreshingFeed$1 = false;
People.RecentActivity.Providers.FeedAggregator.prototype._isGettingMoreEntries$1 = false;
People.RecentActivity.Providers.FeedAggregator.prototype._returnBatch$1 = false;

People.RecentActivity.Providers.FeedAggregator.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the aggregator.
    /// </summary>
    for (var n = 0; n < this._providers$1.length; n++) {
        var provider = this._providers$1[n];
        provider.dispose();
    }

    People.RecentActivity.Providers.AggregationState.removeAggregationStatesByAggregatorId(this._aggregatorId$1);
};

People.RecentActivity.Providers.FeedAggregator.prototype.refreshFeedEntries = function(userState) {
    /// <summary>
    ///     Refreshes the feed entries.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    var that = this;
    
    if (this._isRefreshingFeed$1 || this._isGettingMoreEntries$1) {
        Jx.log.write(3, People.Social.format('FeedAggregator.RefreshFeedEntries({0},{1})', this._isRefreshingFeed$1, this._isGettingMoreEntries$1));

        // if we are still getting more entries, return immediately.
        this.events.onRefreshFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], [], [], false, userState);
        return;
    }

    if (!this.feedInitialized) {
        this.feedInitializing = true;
        this.getCachedFeedEntries(true, userState);
    }

    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.feedInitializing = false;
        this.feedInitialized = true;

        this.events.onRefreshFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], [], [], false, userState);
        return;
    }

    // we need to ensure a clean start, in case we have old queued objects from previous see more scenarios.
    People.RecentActivity.Providers.AggregationState.removeAggregationState(this._getAggregationKey$1('f'));
    this._aggregateAsync$1(0, 'f', function(provider) {
        that._isRefreshingFeed$1 = true;
        provider.refreshFeedEntries(userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.getCachedFeedEntries = function(returnBatch, userState) {
    /// <summary>
    ///     Gets the cached feed entries.
    /// </summary>
    /// <param name="returnBatch" type="Boolean">Whether to only return batch size or all entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    // we need to remove the aggregation state for feed entry to ensure a clean start, otherwise if GetMoreFeedEntries is called later, we
    // might have dirty queued objects from previous RefreshFeedEntries or GetMoreFeedEntries call.
    People.RecentActivity.Providers.AggregationState.removeAggregationState(this._getAggregationKey$1('f'));
    // if we want to get cached feed entries, we will cancel concurrent see more requests in individual provider, since they are invalid anymore.
    this._isGettingMoreEntries$1 = false;
    // this is safe since this call will be synchronous, otherwise we need to let this flow through userState or something.
    this._returnBatch$1 = returnBatch;
    this._aggregateAsync$1(0, 'cf', function(provider) {
        provider.getCachedFeedEntries(returnBatch, userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.refreshAlbums = function(userState) {
    /// <summary>
    ///     Refreshes the albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this.albumInitialized) {
        this.getCachedAlbums(userState);
    }

    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshAlbumsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], [], [], userState);
        return;
    }

    this._aggregateAsync$1(1, 'a', function(provider) {
        provider.refreshAlbums(userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.getCachedAlbums = function(userState) {
    /// <summary>
    ///     Gets the cached albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._aggregateAsync$1(1, 'ca', function(provider) {
        provider.getCachedAlbums(userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.refreshAlbum = function(album, userState) {
    /// <summary>
    ///     Refreshes the album including its metadata and photos.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo">The album.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(album).refreshAlbum(album, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.refreshPhoto = function(photo, userState) {
    /// <summary>
    ///     Refreshes the photo including its metadata and photo tags.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(photo).refreshPhoto(photo, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.refreshComments = function(info, userState) {
    /// <summary>
    ///     Gets or refreshes the comments.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).refreshComments(info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.refreshReactions = function(info, userState) {
    /// <summary>
    ///     Gets or refreshes the reactions.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).refreshReactions(info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.addComment = function(info, comment, userState) {
    /// <summary>
    ///     Adds a comment.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment to add.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).addComment(info, comment, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.addReaction = function(info, reaction, userState) {
    /// <summary>
    ///     Adds a reaction.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).addReaction(info, reaction, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.removeReaction = function(info, reaction, userState) {
    /// <summary>
    ///     Deletes a reaction.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).removeReaction(info, reaction, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.getCachedFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single, cached, feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).getCachedFeedObject(info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.getFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).getCachedFeedObject(info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.addFeedObject = function(info, userState) {
    /// <summary>
    ///     Adds a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider$1(info).addFeedObject(info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.getMoreFeedEntries = function(userState) {
    /// <summary>
    ///     Gets more entries.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    var that = this;
    
    if (!this.feedInitialized || this._isRefreshingFeed$1 || this._isGettingMoreEntries$1) {
        Jx.log.write(3, People.Social.format('FeedAggregator.GetMoreFeedEntries({0},{1},{2})', this.feedInitialized, this._isRefreshingFeed$1, this._isGettingMoreEntries$1));
        // if we are still refreshing feed, return immediately.
        this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], false, userState);
        return;
    }

    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], false, userState);
        return;
    }

    var providers = this._getSupportedProvidersByObjectType$1(0);
    if (providers.length === 1) {
        // we don't need aggregation state in this case, so remove it just in case.
        People.RecentActivity.Providers.AggregationState.removeAggregationState(this._getAggregationKey$1('f'));
        this._isGettingMoreEntries$1 = true;
        // There is only one provider, so no need to go through the aggregating algorithm.
        providers[0].getMoreFeedEntries(userState);
        return;
    }

    // we need to apply aggregation algorithm.
    if (!this._hasMoreEntries$1) {
        Jx.log.write(4, 'FeedAggregator.GetMoreFeedEntries(hasMoreEntries:false)');
        this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], false, userState);
        return;
    }

    var key = this._getAggregationKey$1('f');
    var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(key);
    var queuedObjCount = aggregationState.queuedObjects.length;
    Jx.log.write(4, People.Social.format('FeedAggregator.GetMoreFeedEntries(queuedObjCount:{0})', queuedObjCount));
    if (queuedObjCount < this._feedEntryBatchSize$1) {
        // which means we need to get more entries from all providers.
        this._aggregateAsync$1(0, 'f', function(provider) {
            that._isGettingMoreEntries$1 = true;
            provider.getMoreFeedEntries(userState);
        });
        return;
    }

    var networks = this._getSupportedNetworks$1(0);
    providers = this._getProvidersForMoreEntries$1(aggregationState, networks);
    Jx.log.write(4, People.Social.format('FeedAggregator.GetMoreFeedEntries(providers.Count:{0})', providers.length));
    if (!providers.length) {
        // We don't need to ask for more entries from any provider, current queued objects are good enough.
        var entries = aggregationState.queuedObjects.splice(queuedObjCount - this._feedEntryBatchSize$1, this._feedEntryBatchSize$1);

        // update totalEntryCount
        this._totalEntryCount$1 += entries.length;
        Jx.log.write(4, People.Social.format('FeedAggregator.GetMoreFeedEntries(totalEntryCount:{0})', this._totalEntryCount$1));

        if (this._totalEntryCount$1 >= this._feedEntryMinBatchSize) {
            // We already reached max count or no more entries are available from service.
            this._hasMoreEntries$1 = false;

            // we are done, so remove the aggregation state.
            People.RecentActivity.Providers.AggregationState.removeAggregationState(key);
        }

        // update the cache by appending the actual entries we will return for each network.
        this._updateFeedObjectsCache$1(entries, People.RecentActivity.Core.FeedObjectInfoType.entry, true);
        this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), entries, this._hasMoreEntries$1, userState);
        return;
    }

    // Reset aggregation state.
    aggregationState.reset(providers.length);
    this._isGettingMoreEntries$1 = true;
    for (var n = 0; n < providers.length; n++) {
        var provider = providers[n];
        provider.getMoreFeedEntries(userState);
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype.refreshNotifications = function(userState) {
    /// <summary>
    ///     Refreshes the notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onRefreshNotificationsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], [], [], userState);
        return;
    }

    if (!this.notificationsInitialized) {
        // Gives back cached notifications if available when first time retrieving the contact's feed.
        this.getCachedNotifications(userState);
    }

    this._aggregateAsync$1(2, 'n', function(provider) {
        provider.refreshNotifications(userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.getCachedNotifications = function(userState) {
    /// <summary>
    ///     Retrieves the previously cached set of notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    // We won't retrieve cached notifications when offline.
    if (!People.RecentActivity.Platform.Configuration.instance.isOnline) {
        this.events.onGetCachedNotificationsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.userOffline), [], userState);
        return;
    }

    this._aggregateAsync$1(2, 'cn', function(provider) {
        provider.getCachedNotifications(userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.markNotificationsRead = function(notifications, userState) {
    /// <summary>
    ///     Marks the specified notifications as read.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to mark as read.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(notifications != null, 'notifications');
    var map = {};
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        var list = map[notification.publisher.sourceId];
        if (list == null) {
            list = [];
            map[notification.publisher.sourceId] = list;
        }

        list.push(notification);
    }

    People.RecentActivity.Providers.AggregationState.getAggregationState(this._getAggregationKey$1('rn')).reset(Object.keys(map).length);
    for (var k in map) {
        var entry = { key: k, value: map[k] };
        var provider = this._providerMap$1[entry.key];
        Debug.assert(provider != null, 'provider');
        provider.markNotificationsRead(entry.value, userState);
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype.getUnreadNotificationsCount = function(userState) {
    /// <summary>
    ///     Gets the count of unread notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._aggregateAsync$1(2, 'u', function(provider) {
        provider.getUnreadNotificationsCount(userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.onUpdated = function(info) {
    /// <summary>
    ///     Occurs when a network has been updated.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_networkInfo">The info.</param>
    // pass along the update.
    this.events.onUpdated(info);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onRefreshFeedEntriesCompleted = function(result, entriesToAdd, entriesToUpdate, entriesToRemove, hasMoreEntries, userState) {
    /// <summary>
    ///     Called when the refresh operation completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entriesToAdd" type="Array" elementType="feedObjectInfo">The entries to add.</param>
    /// <param name="entriesToUpdate" type="Array" elementType="feedObjectInfo">The entries to update.</param>
    /// <param name="entriesToRemove" type="Array" elementType="feedObjectInfo">The entries to remove.</param>
    /// <param name="hasMoreEntries" type="Boolean">Whether there are more entries to request.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this.feedInitialized) {
        // This refresh call is the first time initializing contact's feed.
        this.feedInitialized = true;
        this.feedInitializing = false;
    }

    var key = this._getAggregationKey$1('f');
    var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(key);
    if (aggregationState.totalRequests === 1) {
        // No need to aggregate, act as passthrough.
        this._tryRecordScenario$1(aggregationState);

        this.events.onRefreshFeedEntriesCompleted(result, entriesToAdd, entriesToUpdate, entriesToRemove, hasMoreEntries, userState);

        this._isRefreshingFeed$1 = false;
        People.RecentActivity.Providers.AggregationState.removeAggregationState(key);
        return;
    }

    // All requests came back.
    if (!aggregationState.outstandingRequests) {
        this._tryRecordScenario$1(aggregationState);

        result = aggregationState.aggregationResult;
        var entries = this._extractAggregatedObjects$1(aggregationState.objectList, this._feedEntryBatchSize$1, this._getFeedObjectTimestamp$1);

        // update the cache with the actual entries we will return for each network.
        this._updateFeedObjectsCache$1(entries, People.RecentActivity.Core.FeedObjectInfoType.entry, false);
        var cachedEntries = this._extractAggregatedObjects$1(aggregationState.cachedObjectList, this._feedEntryBatchSize$1, this._getFeedObjectTimestamp$1);
        var refreshInfo = (result.code !== People.RecentActivity.Core.ResultCode.failure) ? new People.RecentActivity.Providers.FeedEntryInfoCollection(cachedEntries).refresh(entries) : People.RecentActivity.Providers.create_feedObjectRefreshInfo();

        // if this is the first time here or the feed is refreshed again with updates, we need to set/reset the see more variables.
        if (result.isSuccessOrPartialFailure && (this._totalEntryCount$1 === -1 || this.hasUpdate(refreshInfo))) {
            this._totalEntryCount$1 = entries.length;

            Jx.log.write(4, People.Social.format('FeedAggregator.OnRefreshFeedEntriesCompleted(totalEntryCount:{0})', this._totalEntryCount$1));

            // We have a full batch, we can likely get more entries.
            this._hasMoreEntries$1 = (this._totalEntryCount$1 >= this._feedEntryMinBatchSize);

            // Clear out queued objects if any, since we are starting over.
            aggregationState.queuedObjects.length = 0;

            // populate the queued objects with the rest in object list.
            aggregationState.queuedObjects.push.apply(aggregationState.queuedObjects, aggregationState.objectList);
        }

        this.events.onRefreshFeedEntriesCompleted(result, refreshInfo.objectsAdded, refreshInfo.objectsUpdated, refreshInfo.objectsRemoved, this._hasMoreEntries$1, userState);
        this._isRefreshingFeed$1 = false;
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype.onGetCachedFeedEntriesCompleted = function(result, entries, userState) {
    /// <summary>
    ///     Called when the cached feed entries were retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The cached entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var that = this;
    this._onGetAggregatedObjectsCompleted$1(
        result,
        entries,
        'cf',
        this._returnBatch$1 ? this._feedEntryBatchSize$1 : -1,
        this._getFeedObjectTimestamp$1,
        function (resultInfo, objs) {
            if (!that.feedInitializing) {
                // this call is not part of feed initialization, so we need to support see more.
                that._totalEntryCount$1 = objs.length;
                that._hasMoreEntries$1 = (that._totalEntryCount$1 < that._feedEntriesMaxCount);

                Jx.log.write(4, People.Social.format('FeedAggregator.OnGetCachedFeedEntriesCompleted(totalEntryCount:{0})', that._totalEntryCount$1));

                // we need to mark feedInitialized true here, since the feed is initialized with cached entries.
                that.feedInitialized = true;
            }

            that.events.onGetCachedFeedEntriesCompleted(resultInfo, objs, userState);
        });
};

People.RecentActivity.Providers.FeedAggregator.prototype.onRefreshCommentsCompleted = function(result, info, commentsToAdd, commentsToRemove, userState) {
    /// <summary>
    ///     Called when comments were received.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="commentsToAdd" type="Array" elementType="commentInfo">The comments to add.</param>
    /// <param name="commentsToRemove" type="Array" elementType="commentInfo">The comments to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshCommentsCompleted(result, info, commentsToAdd, commentsToRemove, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onRefreshReactionsCompleted = function(result, info, reactionsToAdd, reactionsToRemove, userState) {
    /// <summary>
    ///     Called when reactions were received.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="reactionsToAdd" type="Array" elementType="reactionInfo">The reactions to add.</param>
    /// <param name="reactionsToRemove" type="Array" elementType="reactionInfo">The reactions to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshReactionsCompleted(result, info, reactionsToAdd, reactionsToRemove, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onCommentAdded = function(result, info, comment, userState) {
    /// <summary>
    ///     Called when a comment was posted.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onCommentAdded(result, info, comment, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onReactionAdded = function(result, info, reaction, userState) {
    /// <summary>
    ///     Called when a reaction was added.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onReactionAdded(result, info, reaction, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onReactionRemoved = function(result, info, reaction, userState) {
    /// <summary>
    ///     Called when a reaction was deleted.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onReactionRemoved(result, info, reaction, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onGetCachedAlbumsCompleted = function(result, albums, userState) {
    /// <summary>
    ///     Occurs when cached albums have been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The cached albums.</param>
    /// <param name="userState" type="Object">The user state.</param>
    // TODO(M4): Do real aggregation across networks.
    this.events.onGetCachedAlbumsCompleted(result, albums, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onRefreshAlbumsCompleted = function(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState) {
    /// <summary>
    ///     Occurs when albums have been refreshed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="albumsToAdd" type="Array" elementType="feedObjectInfo">The albums to add.</param>
    /// <param name="albumsToUpdate" type="Array" elementType="feedObjectInfo">The albums to update.</param>
    /// <param name="albumsToRemove" type="Array" elementType="feedObjectInfo">The albums to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    // TODO(M4): Do real aggregation across networks.
    this.events.onRefreshAlbumsCompleted(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onRefreshAlbumCompleted = function(result, album, photosToAdd, photosToUpdate, photosToRemove, userState) {
    /// <summary>
    ///     Occurs when the album is refreshed
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo">The album.</param>
    /// <param name="photosToAdd" type="Array" elementType="feedObjectInfo">The photos to add.</param>
    /// <param name="photosToUpdate" type="Array" elementType="feedObjectInfo">The photos to update.</param>
    /// <param name="photosToRemove" type="Array" elementType="feedObjectInfo">The photos to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshAlbumCompleted(result, album, photosToAdd, photosToUpdate, photosToRemove, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onRefreshPhotoCompleted = function(result, photo, tagsToAdd, tagsToRemove, userState) {
    /// <summary>
    ///     Occurs when the photo is refreshed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <param name="tagsToAdd" type="Array" elementType="photoTagInfo">The tags to add.</param>
    /// <param name="tagsToRemove" type="Array" elementType="photoTagInfo">The tags to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshPhotoCompleted(result, photo, tagsToAdd, tagsToRemove, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onGetCachedFeedObjectCompleted = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a single, cached, feed object has been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The cached object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetCachedFeedObjectCompleted(result, info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onGetFeedObjectCompleted = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a single feed object has been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetFeedObjectCompleted(result, info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onFeedObjectAdded = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a feed object has been added.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onFeedObjectAdded(result, info, userState);
};

People.RecentActivity.Providers.FeedAggregator.prototype.onGetMoreEntriesCompleted = function(result, entries, hasMoreEntries, userState) {
    /// <summary>
    ///     Occurs when more entries were retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    /// <param name="hasMoreEntries" type="Boolean">Whether there are more entries to request.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var providers = this._getSupportedProvidersByObjectType$1(0);
    if (providers.length === 1) {
        this._isGettingMoreEntries$1 = false;

        // not an aggregation.
        this.events.onGetMoreEntriesCompleted(result, entries, hasMoreEntries, userState);
        return;
    }

    var key = this._getAggregationKey$1('f');
    var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(key);

    // All requests came back.
    if (!aggregationState.outstandingRequests) {
        this._tryRecordScenario$1(aggregationState);

        result = aggregationState.aggregationResult;

        // merge the new objects with queued objects, then de-dupe the result.
        // we need to dedupe, otherwise we might be merging two overlapping sets, 
        // sort them, and then return duplicate entries to the model.
        var map = {};
        var queuedObjs = aggregationState.queuedObjects;
        queuedObjs.push.apply(queuedObjs, aggregationState.objectList);

        this._dedupeObjects$1(queuedObjs, function (obj) {
            // the key can be relatively simple, just concatting the source ID and the entry ID should be sufficient.
            var item = obj;
            return item.sourceId + ';' + item.id;
        });

        var batch = this._extractAggregatedObjects$1(queuedObjs, this._feedEntryBatchSize$1, this._getFeedObjectTimestamp$1);

        // update the cache by appending the actual entries we will return for each network.
        this._updateFeedObjectsCache$1(batch, People.RecentActivity.Core.FeedObjectInfoType.entry, true);
        this._totalEntryCount$1 += batch.length;

        Jx.log.write(4, People.Social.format('FeedAggregator.OnGetMoreEntriesCompleted(totalEntryCount:{0})', this._totalEntryCount$1));

        if (this._totalEntryCount$1 >= this._feedEntriesMaxCount ||
            (result.code === People.RecentActivity.Core.ResultCode.success && batch.length < People.RecentActivity.Platform.Configuration.prototype.feedEntriesBatchSize)) {
            // We already reached max count or no more entries are available from service.
            this._hasMoreEntries$1 = false;
            Jx.log.write(4, 'FeedAggregator.OnGetMoreEntriesCompleted(hasMoreEntries:false)');

            // we are done, so remove the aggregation state.
            People.RecentActivity.Providers.AggregationState.removeAggregationState(key);
        }

        this.events.onGetMoreEntriesCompleted(result, batch, this._hasMoreEntries$1, userState);
        this._isGettingMoreEntries$1 = false;
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype.onRefreshNotificationsCompleted = function(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState) {
    /// <summary>
    ///     Called when the notifications have been refreshed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notificationsToAdd" type="Array" elementType="notificationInfo">The notifications to add.</param>
    /// <param name="notificationsToUpdate" type="Array" elementType="notificationInfo">The notifications to update.</param>
    /// <param name="notificationsToRemove" type="Array" elementType="notificationInfo">The notifications to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>

    // If this was the first time the refresh call is completed, we've now initialized notifications.
    this.notificationsInitialized = true;
    
    var key = this._getAggregationKey$1('n');

    var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(key);
    if (aggregationState.totalRequests === 1) {
        // No need to aggregate, act as passthrough.
        this._tryRecordScenario$1(aggregationState);
        this.events.onRefreshNotificationsCompleted(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState);

        return;
    }

    // All requests came back.
    if (!aggregationState.outstandingRequests) {
        this._tryRecordScenario$1(aggregationState);

        result = aggregationState.aggregationResult;

        var notifications = this._extractAggregatedObjects$1(aggregationState.objectList, People.RecentActivity.Platform.Configuration.instance.maxCachedNotificationsPerNetwork, this._getNotificationTimestamp$1);

        // update the cache with the actual notifications we will return for each network.
        this._updateNotificationsCache$1(notifications);

        var cachedNotifications = this._extractAggregatedObjects$1(aggregationState.cachedObjectList, People.RecentActivity.Platform.Configuration.instance.maxCachedNotificationsPerNetwork, this._getNotificationTimestamp$1);
        var refreshInfo = (result.code !== People.RecentActivity.Core.ResultCode.failure) ? new People.RecentActivity.Providers.NotificationInfoCollection(cachedNotifications).refresh(notifications) : People.RecentActivity.Providers.create_notificationRefreshInfo();

        People.RecentActivity.Providers.AggregationState.removeAggregationState(key);

        this.events.onRefreshNotificationsCompleted(result, refreshInfo.notificationsAdded, refreshInfo.notificationsUpdated, refreshInfo.notificationsRemoved, userState);
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype.onGetCachedNotificationsCompleted = function(result, notifications, userState) {
    /// <summary>
    ///     Called when the cached notifications have been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var that = this;
    
    this._onGetAggregatedObjectsCompleted$1(result, notifications, 'cn', People.RecentActivity.Platform.Configuration.instance.maxCachedNotificationsPerNetwork, this._getNotificationTimestamp$1,
        function (resultInfo, objs) {
            // we're done getting all the cached notifications -- so we've initialized notifications.
            that.notificationsInitialized = true;
            that.events.onGetCachedNotificationsCompleted(resultInfo, objs, userState);
        });
};

People.RecentActivity.Providers.FeedAggregator.prototype.onMarkNotificationsReadCompleted = function(result, notifications, userState) {
    /// <summary>
    ///     Called when the notifications have been marked as read.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The updated notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var that = this;
    
    this._onGetAggregatedObjectsCompleted$1(result, notifications, 'rn', People.RecentActivity.Platform.Configuration.instance.maxCachedNotificationsPerNetwork, this._getNotificationTimestamp$1, function(resultInfo, objs) {
        that.events.onMarkNotificationsReadCompleted(resultInfo, objs, userState);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype.onGetUnreadNotificationsCountCompleted = function(result, unreadCount, userState) {
    /// <summary>
    ///     Called when the notifications unread count has been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="unreadCount" type="Number" integer="true">The number of unread notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var key = this._getAggregationKey$1('u');
    var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(key);
    if (aggregationState.totalRequests === 1) {
        // No need to aggregate, act as passthrough.
        this._tryRecordScenario$1(aggregationState);
        this.events.onGetUnreadNotificationsCountCompleted(result, unreadCount, userState);
        return;
    }

    aggregationState.updateStateWithCount(result, unreadCount);
    // All requests came back.
    if (!aggregationState.outstandingRequests) {
        this._tryRecordScenario$1(aggregationState);
        result = aggregationState.aggregationResult;
        People.RecentActivity.Providers.AggregationState.removeAggregationState(key);
        this.events.onGetUnreadNotificationsCountCompleted(result, aggregationState.count, userState);
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype._initializeProviders$1 = function() {
    // Only aggregate when the person has more than one network, otherwise it will be just a pass through.
    var aggregated = (this._networks$1.length > 1) ? true : false;
    var providerList = [];
    var supNetworks = [];
    var provider;
    for (var n = 0; n < this._networks$1.length; n++) {
        var network = this._networks$1[n];
        if (network.id === People.RecentActivity.Core.NetworkId.facebook) {
            provider = new People.RecentActivity.Providers.FacebookProvider(this._personId$1, 0, network, this, aggregated, this._aggregatorId$1);
            providerList.push(provider);
            this._providerMap$1[network.id] = provider;
        }
        else {
            supNetworks.push(network);
        }    
    }

    for (var n = 0; n < supNetworks.length; n++) {
        var network = supNetworks[n];
        provider = new People.RecentActivity.Providers.SupProvider(this._personId$1, 0, network, this, aggregated, this._aggregatorId$1);
        providerList.push(provider);
        this._providerMap$1[network.id] = provider;
    }

    this._providers$1 = providerList;
};

People.RecentActivity.Providers.FeedAggregator.prototype._getProvider$1 = function(obj) {
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="People.RecentActivity.Core.IFeedProvider"></returns>
    Debug.assert(obj != null, 'obj');
    var provider = this._providerMap$1[obj.sourceId];
    Debug.assert(provider != null, 'provider');
    return provider;
};

People.RecentActivity.Providers.FeedAggregator.prototype._aggregateAsync$1 = function(type, aggregationStateKey, action) {
    /// <param name="type" type="People.RecentActivity.Providers.AggregateObjectType"></param>
    /// <param name="aggregationStateKey" type="String"></param>
    /// <param name="action" type="System.Action`1"></param>
    var supportedProviders = this._getSupportedProvidersByObjectType$1(type);
    People.RecentActivity.Providers.AggregationState.getAggregationState(this._getAggregationKey$1(aggregationStateKey)).reset(supportedProviders.length);
    for (var n = 0; n < supportedProviders.length; n++) {
        var provider = supportedProviders[n];
        action(provider);
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype._onGetAggregatedObjectsCompleted$1 = function(result, objs, key, maxSize, getTimestamp, action) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="objs" type="Array" elementType="Object"></param>
    /// <param name="key" type="String"></param>
    /// <param name="maxSize" type="Number" integer="true"></param>
    /// <param name="getTimestamp" type="System.Func`2"></param>
    /// <param name="action" type="System.Action`2"></param>
    key = this._getAggregationKey$1(key);
    var aggregationState = People.RecentActivity.Providers.AggregationState.getAggregationState(key);
    if (aggregationState.totalRequests === 1) {
        this._tryRecordScenario$1(aggregationState);
        action(result, objs);
        return;
    }

    aggregationState.updateState(result, objs);
    if (!aggregationState.outstandingRequests) {
        this._tryRecordScenario$1(aggregationState);
        result = aggregationState.aggregationResult;
        objs = this._extractAggregatedObjects$1(aggregationState.objectList, maxSize, getTimestamp);
        People.RecentActivity.Providers.AggregationState.removeAggregationState(key);
        action(result, objs);
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype._getSupportedProvidersByObjectType$1 = function(type) {
    /// <param name="type" type="People.RecentActivity.Providers.AggregateObjectType"></param>
    /// <returns type="Array"></returns>
    if (Jx.isUndefined(this._supportedProviders$1[type])) {
        this._supportedProviders$1[type] = this._getSupportedProviders$1(this._getSupportedNetworks$1(type));
    }

    return this._supportedProviders$1[type];
};

People.RecentActivity.Providers.FeedAggregator.prototype._getSupportedProviders$1 = function(networks) {
    /// <param name="networks" type="Array" elementType="String"></param>
    /// <returns type="Array"></returns>
    var supportedProviders = [];
    for (var n = 0; n < networks.length; n++) {
        var network = networks[n];
        var provider = this._providerMap$1[network];
        if (provider != null) {
            if (supportedProviders.indexOf(provider) === -1) {
                supportedProviders.push(provider);
            }

            if (supportedProviders.length === this._providers$1.length) {
                // Multiple networks can share the same provider, we already get all available providers.
                break;
            }        
        }    
    }

    return supportedProviders;
};

People.RecentActivity.Providers.FeedAggregator.prototype._extractAggregatedObjects$1 = function(objs, maxSize, getTimestamp) {
    /// <param name="objs" type="Array"></param>
    /// <param name="maxSize" type="Number" integer="true"></param>
    /// <param name="getTimestamp" type="System.Func`2"></param>
    /// <returns type="Array" elementType="Object"></returns>
    this._sortObjects$1(objs, getTimestamp);
    return (maxSize === -1) ? objs : objs.splice(Math.max(objs.length - maxSize, 0), maxSize);
};

People.RecentActivity.Providers.FeedAggregator.prototype._sortObjects$1 = function(objs, getTimestamp) {
    /// <param name="objs" type="Array"></param>
    /// <param name="getTimestamp" type="System.Func`2"></param>
    objs.sort(function(a, b) {
        return (getTimestamp(a) - getTimestamp(b));
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype._dedupeObjects$1 = function(objs, getKey) {
    /// <param name="objs" type="Array"></param>
    /// <param name="getKey" type="System.Func`2"></param>
    var map = {};
    // walk backwards so we keep the "freshest" objects.
    for (var i = objs.length - 1; i >= 0; i--) {
        var id = getKey(objs[i]);
        if (!Jx.isUndefined(map[id])) {
            // we've already seen this object before, remove it.
            objs.splice(i, 1);
        }

        map[id] = true;
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype._getSupportedNetworks$1 = function(type) {
    /// <param name="type" type="People.RecentActivity.Providers.AggregateObjectType"></param>
    /// <returns type="Array" elementType="String"></returns>
    var that = this;
    
    var config = People.RecentActivity.Platform.Configuration.instance;
    var networks = [];
    switch (type) {
        case 0:
            networks = config.supportedNetworksForRecentActivity;
            break;
        case 1:
            networks = config.supportedNetworksForPhoto;
            break;
        case 2:
            networks = config.supportedNetworksForNotification;
            break;
    }

    return networks.filter(function(network) {
        return !Jx.isUndefined(that._providerMap$1[network]);
    });
};

People.RecentActivity.Providers.FeedAggregator.prototype._getFeedObjectTimestamp$1 = function(obj) {
    /// <param name="obj" type="Object"></param>
    /// <returns type="Number" integer="true"></returns>
    return (obj).timestamp;
};

People.RecentActivity.Providers.FeedAggregator.prototype._getNotificationTimestamp$1 = function(obj) {
    /// <param name="obj" type="Object"></param>
    /// <returns type="Number" integer="true"></returns>
    return (obj).timestamp;
};

People.RecentActivity.Providers.FeedAggregator.prototype._tryRecordScenario$1 = function(state) {
    /// <param name="state" type="People.RecentActivity.Providers.AggregationState"></param>
    Debug.assert(state != null, 'state');
    if (state.recordScenario && state.scenarioId !== InstruScenarioId.unknown) {
        People.RecentActivity.Core.BiciHelper.recordScenarioQos(state.scenarioId, state.scenarioDuration, state.scenarioRequestSize, state.scenarioErrorCode, state.scenarioErrorType, null);
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype._getAggregationKey$1 = function(key) {
    /// <param name="key" type="String"></param>
    /// <returns type="String"></returns>
    return this._aggregatorId$1 + '_' + key;
};

People.RecentActivity.Providers.FeedAggregator.prototype._getProvidersForMoreEntries$1 = function(aggregationState, supportedNetworks) {
    /// <param name="aggregationState" type="People.RecentActivity.Providers.AggregationState"></param>
    /// <param name="supportedNetworks" type="Array" elementType="String"></param>
    /// <returns type="Array"></returns>
    // a map whose key is source id and value is the first index of this network's entry(the oldest) showing up in the queued objects.
    var map = {};
    var queuedObjs = aggregationState.queuedObjects;
    var count = queuedObjs.length;
    // loop through queued objects in chronological order.)
    for (var i = 0; i < count; i++) {
        var entry = queuedObjs[i];
        if (Jx.isUndefined(map[entry.sourceId])) {
            map[entry.sourceId] = i;
            if (Object.keys(map).length === supportedNetworks.length) {
                // we got all we need.
                break;
            }        
        }    
    }

    var providers = [];
    for (var n = 0; n < supportedNetworks.length; n++) {
        var network = supportedNetworks[n];
        // for any network which we don't have queued entries for OR the oldest entry for a network falls within the latest batch,
        // we need to ask for more entries from this network.
        // For example, if FB oldest entry in the list is the 30th entry, then we still need to ask more entries from FB to compare them with the entries from 31st to 50th.
        if (Jx.isUndefined(map[network]) || map[network] > count - this._feedEntryBatchSize$1) {
            var provider = this._providerMap$1[network];
            if (providers.indexOf(provider) === -1) {
                providers.push(provider);
                Jx.log.write(4, People.Social.format('FeedAggregator.GetProvidersForMoreEntries(network:{0})', network));
            }        
        }    
    }

    return providers;
};

People.RecentActivity.Providers.FeedAggregator.prototype._updateFeedObjectsCache$1 = function(objs, type, append) {
    /// <param name="objs" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType"></param>
    /// <param name="append" type="Boolean"></param>
    Debug.assert(type === People.RecentActivity.Core.FeedObjectInfoType.entry || type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'type');

    var map = {};

    // build map to get entries for each network.
    for (var n = 0; n < objs.length; n++) {
        var obj = objs[n];
        var sourceId = obj.sourceId;
        if (Jx.isUndefined(map[sourceId])) {
            map[sourceId] = [];
        }

        map[sourceId].push(obj);
    }

    // update cache for each network.
    for (var k in map) {
        var entry = { key: k, value: map[k] };

        var provider = this._providerMap$1[entry.key];
        if (provider != null) {
            var cache = (type === People.RecentActivity.Core.FeedObjectInfoType.entry) ? provider.feedCache : provider.albumCache;

            if (!append) {
                cache.addCacheEntry(provider.contactId, entry.value);
            }
            else {
                cache.addMoreFeedObjects(provider.contactId, entry.value);
            }        
        }    
    }
};

People.RecentActivity.Providers.FeedAggregator.prototype._updateNotificationsCache$1 = function(notifications) {
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    var map = {};
    var sourceId = null;
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        sourceId = notification.sourceId;
        if (Jx.isUndefined(map[sourceId])) {
            map[sourceId] = [];
        }

        map[sourceId].push(notification);
    }

    for (var k in map) {
        var entry = { key: k, value: map[k] };
        sourceId = entry.key;
        var provider = this._providerMap$1[sourceId];
        if (provider != null) {
            provider.notificationCache.addCacheEntry(sourceId, entry.value);
        }    
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="ProviderBase.js" />

People.RecentActivity.Providers.RetailModeProvider = function(provider, events) {
    /// <summary>
    ///     Provides a provider for retail mode.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents">The events.</param>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The underlying provider.</field>
    People.RecentActivity.Providers.ProviderBase.call(this, events);
    this._provider$1 = provider;
    // Makes the underlying provider to call back to this instance.
    (this._provider$1).events = this;
};

Jx.inherit(People.RecentActivity.Providers.RetailModeProvider, People.RecentActivity.Providers.ProviderBase);


People.RecentActivity.Providers.RetailModeProvider.prototype._provider$1 = null;

People.RecentActivity.Providers.RetailModeProvider.prototype.dispose = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    this._provider$1.dispose();
};

People.RecentActivity.Providers.RetailModeProvider.prototype.refreshFeedEntries = function(userState) {
    /// <summary>
    ///     Refreshes the feed entries.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this.feedInitialized) {
        this.getCachedFeedEntries(true, userState);
        this.feedInitialized = true;
    }

    this.events.onRefreshFeedEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], [], [], false, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.getCachedFeedEntries = function(returnBatch, userState) {
    /// <summary>
    ///     Gets the cached feed entries.
    /// </summary>
    /// <param name="returnBatch" type="Boolean">Whether to only return batch size or all entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._provider$1.getCachedFeedEntries(returnBatch, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.refreshAlbums = function(userState) {
    /// <summary>
    ///     Refreshes the albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this.albumInitialized) {
        this.getCachedAlbums(userState);
        this.albumInitialized = true;
    }

    this.events.onRefreshAlbumsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], [], [], userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.getCachedAlbums = function(userState) {
    /// <summary>
    ///     Gets the cached albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._provider$1.getCachedAlbums(userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.refreshAlbum = function(album, userState) {
    /// <summary>
    ///     Refreshes the album including its metadata and photos.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo">The album.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshAlbumCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), album, [], [], [], userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.refreshPhoto = function(photo, userState) {
    /// <summary>
    ///     Refreshes the photo including its metadata and photo tags.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshPhotoCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), photo, [], [], userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.refreshComments = function(info, userState) {
    /// <summary>
    ///     Gets or refreshes the comments.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshCommentsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), info, [], [], userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.refreshReactions = function(info, userState) {
    /// <summary>
    ///     Gets or refreshes the reactions.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshReactionsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), info, [], [], userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.addComment = function(info, comment, userState) {
    /// <summary>
    ///     Adds a comment.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment to add.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onCommentAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), info, comment, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.addReaction = function(info, reaction, userState) {
    /// <summary>
    ///     Adds a reaction.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onReactionAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), info, reaction, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.removeReaction = function(info, reaction, userState) {
    /// <summary>
    ///     Deletes a reaction.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The object info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onReactionRemoved(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), info, reaction, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.getCachedFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single, cached, feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._provider$1.getCachedFeedObject(info, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.getFeedObject = function(info, userState) {
    /// <summary>
    ///     Gets a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetFeedObjectCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), info, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.addFeedObject = function(info, userState) {
    /// <summary>
    ///     Adds a single feed object.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onFeedObjectAdded(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), info, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.getMoreFeedEntries = function(userState) {
    /// <summary>
    ///     Gets more entries.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetMoreEntriesCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], false, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.refreshNotifications = function(userState) {
    /// <summary>
    ///     Refreshes the notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this.notificationsInitialized) {
        this.getCachedNotifications(userState);
        this.notificationsInitialized = true;
    }

    this.events.onRefreshNotificationsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), [], [], [], userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.getCachedNotifications = function(userState) {
    /// <summary>
    ///     Retrieves the previously cached set of notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._provider$1.getCachedNotifications(userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.markNotificationsRead = function(notifications, userState) {
    /// <summary>
    ///     Marks the specified notifications as read.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to mark as read.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var notificationsMap = {};
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        var sourceId = notification.sourceId;
        if (!!Jx.isUndefined(notificationsMap[sourceId])) {
            notificationsMap[sourceId] = [];
        }

        notificationsMap[sourceId].push(notification);
    }

    var cache = this.notificationCache;
    for (var k in notificationsMap) {
        var pair = { key: k, value: notificationsMap[k] };
        notifications = pair.value;
        cache.markNotificationsRead(pair.key, notifications);
    }
};

People.RecentActivity.Providers.RetailModeProvider.prototype.getUnreadNotificationsCount = function(userState) {
    /// <summary>
    ///     Gets the count of unread notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    var cache = this.notificationCache;
    var count = 0;
    for (var n = 0, coll = People.RecentActivity.Platform.Configuration.instance.supportedNetworksForNotification; n < coll.length; n++) {
        var sourceId = coll[n];
        var notifications = cache.getNotifications(sourceId);
        for (var o = 0; o < notifications.length; o++) {
            var notification = notifications[o];
            if (notification.isUnread) {
                count++;
            }        
        }    
    }

    this.events.onGetUnreadNotificationsCountCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), count, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onUpdated = function(info) {
    /// <summary>
    ///     Occurs when the network was updated.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_networkInfo">The info.</param>
    this.events.onUpdated(info);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onRefreshFeedEntriesCompleted = function(result, entriesToAdd, entriesToUpdate, entriesToRemove, hasMoreEntries, userState) {
    /// <summary>
    ///     Called when the refresh operation completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entriesToAdd" type="Array" elementType="feedObjectInfo">The entries to add.</param>
    /// <param name="entriesToUpdate" type="Array" elementType="feedObjectInfo">The entries to update.</param>
    /// <param name="entriesToRemove" type="Array" elementType="feedObjectInfo">The entries to remove.</param>
    /// <param name="hasMoreEntries" type="Boolean">Whether there are more entries to request.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onGetCachedFeedEntriesCompleted = function(result, entries, userState) {
    /// <summary>
    ///     Called when the cached feed entries were retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The cached entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetCachedFeedEntriesCompleted(result, entries, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onRefreshCommentsCompleted = function(result, info, commentsToAdd, commentsToRemove, userState) {
    /// <summary>
    ///     Called when comments were received.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="commentsToAdd" type="Array" elementType="commentInfo">The comments to add.</param>
    /// <param name="commentsToRemove" type="Array" elementType="commentInfo">The comments to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onRefreshReactionsCompleted = function(result, info, reactionsToAdd, reactionsToRemove, userState) {
    /// <summary>
    ///     Called when reactions were received.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="reactionsToAdd" type="Array" elementType="reactionInfo">The reactions to add.</param>
    /// <param name="reactionsToRemove" type="Array" elementType="reactionInfo">The reactions to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onCommentAdded = function(result, info, comment, userState) {
    /// <summary>
    ///     Called when a comment was posted.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo">The comment.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onReactionAdded = function(result, info, reaction, userState) {
    /// <summary>
    ///     Called when a reaction was added.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onReactionRemoved = function(result, info, reaction, userState) {
    /// <summary>
    ///     Called when a reaction was deleted.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onGetCachedAlbumsCompleted = function(result, albums, userState) {
    /// <summary>
    ///     Occurs when cached albums have been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The cached albums.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetCachedAlbumsCompleted(result, albums, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onRefreshAlbumsCompleted = function(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState) {
    /// <summary>
    ///     Occurs when albums have been refreshed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="albumsToAdd" type="Array" elementType="feedObjectInfo">The albums to add.</param>
    /// <param name="albumsToUpdate" type="Array" elementType="feedObjectInfo">The albums to update.</param>
    /// <param name="albumsToRemove" type="Array" elementType="feedObjectInfo">The albums to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onRefreshAlbumCompleted = function(result, album, photosToAdd, photosToUpdate, photosToRemove, userState) {
    /// <summary>
    ///     Occurs when the album is refreshed
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo">The album.</param>
    /// <param name="photosToAdd" type="Array" elementType="feedObjectInfo">The photos to add.</param>
    /// <param name="photosToUpdate" type="Array" elementType="feedObjectInfo">The photos to update.</param>
    /// <param name="photosToRemove" type="Array" elementType="feedObjectInfo">The photos to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onRefreshPhotoCompleted = function(result, photo, tagsToAdd, tagsToRemove, userState) {
    /// <summary>
    ///     Occurs when the photo is refreshed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <param name="tagsToAdd" type="Array" elementType="photoTagInfo">The tags to add.</param>
    /// <param name="tagsToRemove" type="Array" elementType="photoTagInfo">The tags to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onGetCachedFeedObjectCompleted = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a single, cached, feed object has been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The cached object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetCachedFeedObjectCompleted(result, info, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onGetFeedObjectCompleted = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a single feed object has been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onFeedObjectAdded = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a feed object has been added.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onGetMoreEntriesCompleted = function(result, entries, hasMoreEntries, userState) {
    /// <summary>
    ///     Occurs when more entries were retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    /// <param name="hasMoreEntries" type="Boolean">Whether there are more entries to request.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onRefreshNotificationsCompleted = function(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState) {
    /// <summary>
    ///     Called when the notifications have been refreshed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notificationsToAdd" type="Array" elementType="notificationInfo">The notifications to add.</param>
    /// <param name="notificationsToUpdate" type="Array" elementType="notificationInfo">The notifications to update.</param>
    /// <param name="notificationsToRemove" type="Array" elementType="notificationInfo">The notifications to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onGetCachedNotificationsCompleted = function(result, notifications, userState) {
    /// <summary>
    ///     Called when the cached notifications have been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetCachedNotificationsCompleted(result, notifications, userState);
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onMarkNotificationsReadCompleted = function(result, notifications, userState) {
    /// <summary>
    ///     Called when the notifications have been marked as read.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The updated notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
};

People.RecentActivity.Providers.RetailModeProvider.prototype.onGetUnreadNotificationsCountCompleted = function(result, unreadCount, userState) {
    /// <summary>
    ///     Called when the notifications unread count has been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="unreadCount" type="Number" integer="true">The number of unread notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\AnnotationInfoType.js" />
/// <reference path="..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Core\NotificationInfo.js" />
/// <reference path="..\..\Core\NotificationInfoType.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\Cache\SocialCache.js" />
/// <reference path="..\IdentityType.js" />
/// <reference path="..\RequestFactories\SupRequestFactory.js" />
/// <reference path="..\Serializers\SupSerializer.js" />
/// <reference path="FeedProvider.js" />

People.RecentActivity.Providers.SupProvider = function(identityId, identityType, network, events, aggregated, aggregatorId) {
    /// <summary>
    ///     SUP feed provider.
    /// </summary>
    /// <param name="identityId" type="String">The identity id.</param>
    /// <param name="identityType" type="People.RecentActivity.Providers.IdentityType">The identity type.</param>
    /// <param name="network" type="People.RecentActivity.Core.create_networkInfo">The network.</param>
    /// <param name="events" type="People.RecentActivity.Core.IFeedProviderEvents">The events.</param>
    /// <param name="aggregated" type="Boolean">If the provider will be part of a FeedAggregator.</param>
    /// <param name="aggregatorId" type="String">The aggregator id.</param>
    /// <field name="_notificationReturnedThreshold$2" type="Number" integer="true" static="true"></field>
    People.RecentActivity.Providers.FeedProvider.call(this, identityId, identityType, network, events, aggregated, aggregatorId);
    this.serializer = new People.RecentActivity.Providers.SupSerializer(new People.RecentActivity.Providers.SocialCache(network.id));
    this.requestFactory = new People.RecentActivity.Providers.SupRequestFactory();
};

Jx.inherit(People.RecentActivity.Providers.SupProvider, People.RecentActivity.Providers.FeedProvider);


People.RecentActivity.Providers.SupProvider._notificationReturnedThreshold$2 = 7 * 24 * 3600000;

People.RecentActivity.Providers.SupProvider.prototype.refreshAlbums = function (userState) {
    /// <summary>
    ///     Refreshes the albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshAlbumsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), new Array(0), new Array(0), new Array(0), userState);
};

People.RecentActivity.Providers.SupProvider.prototype.getCachedAlbums = function(userState) {
    /// <summary>
    ///     Gets the cached albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onGetCachedAlbumsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), new Array(0), userState);
};

People.RecentActivity.Providers.SupProvider.prototype.refreshAlbum = function(album, userState) {
    /// <summary>
    ///     Refreshes the album including its metadata and photos.
    /// </summary>
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo">The album.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshAlbumCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), album, new Array(0), new Array(0), new Array(0), userState);
};

People.RecentActivity.Providers.SupProvider.prototype.refreshPhoto = function(photo, userState) {
    /// <summary>
    ///     Refreshes the photo including its metadata and photo tags.
    /// </summary>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo">The photo.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this.events.onRefreshPhotoCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), photo, new Array(0), new Array(0), userState);
};

People.RecentActivity.Providers.SupProvider.prototype.refreshComments = function(obj, userState) {
    /// <summary>
    ///     Gets or refreshes the comments of a feed entry.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (obj.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum && obj.sourceId === People.RecentActivity.Core.NetworkId.twitter) {
        this.events.onRefreshCommentsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), obj, new Array(0), new Array(0), userState);
        return;
    }

    People.RecentActivity.Providers.FeedProvider.prototype.refreshComments.call(this, obj, userState);
};

People.RecentActivity.Providers.SupProvider.prototype.refreshReactions = function(obj, userState) {
    /// <summary>
    ///     Gets or refreshes the reactions of a feed entry.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (obj.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum && obj.sourceId === People.RecentActivity.Core.NetworkId.twitter) {
        this.events.onRefreshReactionsCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), obj, new Array(0), new Array(0), userState);
        return;
    }

    People.RecentActivity.Providers.FeedProvider.prototype.refreshReactions.call(this, obj, userState);
};

People.RecentActivity.Providers.SupProvider.prototype.markNotificationsRead = function(notifications, userState) {
    /// <summary>
    ///     Marks the specified notifications as read.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to mark as read.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(notifications != null, 'notifications != null');
    // Mark notifications as read in cache.
    this.notificationCache.markNotificationsRead(this.networkId, notifications);
    var timeStamp = 0;
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        if (notification.timestamp > timeStamp) {
            timeStamp = notification.timestamp;
        }

        notification.isUnread = false;
    }

    // Update the last read time for the notifications.
    this.notificationCache.updateLastReadTime(this.networkId, new Date(timeStamp));
    this.events.onMarkNotificationsReadCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), notifications, userState);
};

People.RecentActivity.Providers.SupProvider.prototype.getNotificationsFromResponse = function(response) {
    /// <summary>
    ///     Gets the notifications from response.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <returns type="Array" elementType="notificationInfo"></returns>
    // For SupProvider, we get feed entries as notifications, so we need to convert them to notification info.
    var entries = response.data;
    if (entries == null || !entries.length) {
        return new Array(0);
    }

    var notifications = [];
    var lastReadTime = this.notificationCache.getLastReadTime(this.networkId);
    for (var n = 0; n < entries.length; n++) {
        var entry = entries[n];
        if (this._isNotificationRecent$2(entry)) {
            // Add this feed entry to cache so we don't need to send request when opening self page.
            this.feedObjectCache.addFeedObject(entry);
            notifications.push(this._toNotification$2(entry, lastReadTime));
        }    
    }

    return notifications;
};

People.RecentActivity.Providers.SupProvider.prototype.getUnreadNotificationsCountFromResponse = function(response) {
    /// <summary>
    ///     Gets the unread notifications count internal.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <returns type="Number" integer="true"></returns>
    // We get all notifications back, and check each of them for read vs. unread.
    var entries = response.data;
    if (entries == null || !entries.length) {
        return 0;
    }

    var unreadCount = 0;
    var lastReadTime = this.notificationCache.getLastReadTime(this.networkId);
    for (var n = 0; n < entries.length; n++) {
        var entry = entries[n];
        if (this._isNotificationRecent$2(entry) && this._isNotificationUnread$2(entry, lastReadTime)) {
            unreadCount++;
        }    
    }

    return unreadCount;
};

People.RecentActivity.Providers.SupProvider.prototype._toNotification$2 = function(entry, lastReadTime) {
    /// <param name="entry" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="lastReadTime" type="Date"></param>
    /// <returns type="People.RecentActivity.Core.create_notificationInfo"></returns>
    var info = entry.data;
    return People.RecentActivity.Core.create_notificationInfo(entry.id, this._getNotificationPublisher$2(info), entry.timestamp, this._getNotificationMessage$2(info), entry.id, this._getNotificationType$2(entry.type), entry.url, info.via, entry.sourceId, this._isNotificationReply$2(info), this._isNotificationShare$2(info), this._isNotificationUnread$2(entry, lastReadTime));
};

People.RecentActivity.Providers.SupProvider.prototype._isNotificationReply$2 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Core.create_feedEntryInfo"></param>
    /// <returns type="Boolean"></returns>
    return this._getAnnotation$2(entry, People.RecentActivity.Core.AnnotationInfoType.inReplyTo) != null;
};

People.RecentActivity.Providers.SupProvider.prototype._isNotificationShare$2 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Core.create_feedEntryInfo"></param>
    /// <returns type="Boolean"></returns>
    return this._getAnnotation$2(entry, People.RecentActivity.Core.AnnotationInfoType.retweetedBy) != null;
};

People.RecentActivity.Providers.SupProvider.prototype._isNotificationUnread$2 = function(entry, lastReadTime) {
    /// <param name="entry" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="lastReadTime" type="Date"></param>
    /// <returns type="Boolean"></returns>
    return (lastReadTime !== Date.empty && lastReadTime.getTime() >= entry.timestamp) ? false : true;
};

People.RecentActivity.Providers.SupProvider.prototype._isNotificationRecent$2 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="Boolean"></returns>
    return new Date().getTime() - entry.timestamp <= People.RecentActivity.Providers.SupProvider._notificationReturnedThreshold$2;
};

People.RecentActivity.Providers.SupProvider.prototype._getNotificationPublisher$2 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Core.create_feedEntryInfo"></param>
    /// <returns type="People.RecentActivity.Core.create_contactInfo"></returns>
    var annotation = this._getAnnotation$2(entry, People.RecentActivity.Core.AnnotationInfoType.retweetedBy);
    if (annotation != null) {
        // we have a retweet annotation, which means we need to return the
        // retweeter's contact info, not the retweeted publisher's info.
        return (annotation.data).publisher;
    }
    else {
        return entry.publisher;
    }
};

People.RecentActivity.Providers.SupProvider.prototype._getNotificationMessage$2 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Core.create_feedEntryInfo"></param>
    /// <returns type="String"></returns>
    // if this is a retweeted/shared message, we should grab the retweeted text, not the original text.
    var annotation = this._getAnnotation$2(entry, People.RecentActivity.Core.AnnotationInfoType.retweetedBy);
    if (annotation != null) {
        var info = annotation.data;
        return info.text;
    }

    switch (entry.type) {
        case People.RecentActivity.Core.FeedEntryInfoType.text:
            return (entry.data).text;
        case People.RecentActivity.Core.FeedEntryInfoType.link:
            return (entry.data).text;
        case People.RecentActivity.Core.FeedEntryInfoType.photo:
            return (entry.data).text;
        case People.RecentActivity.Core.FeedEntryInfoType.photoAlbum:
            return (entry.data).text;
        case People.RecentActivity.Core.FeedEntryInfoType.video:
            return (entry.data).text;
        default:
            return '';
    }
};

People.RecentActivity.Providers.SupProvider.prototype._getNotificationType$2 = function(entryType) {
    /// <param name="entryType" type="People.RecentActivity.Core.FeedObjectInfoType"></param>
    /// <returns type="People.RecentActivity.Core.NotificationInfoType"></returns>
    switch (entryType) {
        case People.RecentActivity.Core.FeedObjectInfoType.entry:
            return People.RecentActivity.Core.NotificationInfoType.entry;
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            return People.RecentActivity.Core.NotificationInfoType.photo;
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
            return People.RecentActivity.Core.NotificationInfoType.photoAlbum;
        default:
            return People.RecentActivity.Core.NotificationInfoType.none;
    }
};

People.RecentActivity.Providers.SupProvider.prototype._getAnnotation$2 = function(info, type) {
    /// <param name="info" type="People.RecentActivity.Core.create_feedEntryInfo"></param>
    /// <param name="type" type="People.RecentActivity.Core.AnnotationInfoType"></param>
    /// <returns type="People.RecentActivity.Core.create_annotationInfo"></returns>
    for (var i = 0, len = info.annotations.length; i < len; i++) {
        var annotation = info.annotations[i];
        if (annotation.type === type) {
            return annotation;
        }    
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Platform\AuthenticationStatus.js" />
/// <reference path="RequestContext.js" />

People.RecentActivity.Providers.DelayedRequest = function(creator, context) {
    /// <summary>
    ///     Provides a request that knows how to delay itself until authentication has happened.
    /// </summary>
    /// <param name="creator" type="Function">The creator.</param>
    /// <param name="context" type="People.RecentActivity.Providers.RequestContext">The context.</param>
    /// <field name="_creator" type="Function">The creator callback.</field>
    /// <field name="_context" type="People.RecentActivity.Providers.RequestContext">The context.</field>
    /// <field name="_callback" type="Function">The callback, if any.</field>
    /// <field name="_request" type="People.RecentActivity.Providers.IRequest">The real request.</field>
    /// <field name="_canceled" type="Boolean">Whether the request hass been cancelled.</field>
    Debug.assert(creator != null, 'creator');
    Debug.assert(context != null, 'context');

    this._creator = creator;
    this._context = context;
};

People.RecentActivity.Providers.DelayedRequest.createRequest = function(creator, context) {
    /// <summary>
    ///     Creates a new request.
    /// </summary>
    /// <param name="creator" type="Function">The creator of the real request.</param>
    /// <param name="context" type="People.RecentActivity.Providers.RequestContext">The context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(creator != null, 'creator');
    Debug.assert(context != null, 'context');

    var info = context.authInfo;

    if (info.status == People.RecentActivity.Platform.AuthenticationStatus.authenticated) {
        // no need to marshall the request, the authentication status is already changed..
        return creator(context);
    }

    return new People.RecentActivity.Providers.DelayedRequest(creator, context);
};

People.RecentActivity.Providers.DelayedRequest.prototype._creator = null;
People.RecentActivity.Providers.DelayedRequest.prototype._context = null;
People.RecentActivity.Providers.DelayedRequest.prototype._callback = null;
People.RecentActivity.Providers.DelayedRequest.prototype._request = null;
People.RecentActivity.Providers.DelayedRequest.prototype._canceled = false;

People.RecentActivity.Providers.DelayedRequest.prototype.execute = function(callback) {
    /// <summary>
    ///     Executes the request.
    /// </summary>
    /// <param name="callback" type="Function">The callback.</param>
    var info = this._context.authInfo;

    if (info.status === People.RecentActivity.Platform.AuthenticationStatus.authenticated) {
        // looks like the authentication status is changed, and we don't need to refresh token.
        var request = this._creator(this._context);
        if (request) {
            this._request = request;
            this._request.execute(callback);
        }
        else {
            // we couldn't create the underlying request (probably because it's not supported), so bail out "gracefuly".
            // create a generic error response and pass it to the callback.
            this._fail(People.RecentActivity.Core.ResultCode.failure, callback);
        }
    }
    else if ((info.status === People.RecentActivity.Platform.AuthenticationStatus.disconnected) ||
             (info.status === People.RecentActivity.Platform.AuthenticationStatus.tokenRetrievalFailed)) {
        // we tried to authenticated, but got disconnected in the mean-time or we failed to grab a token.
        this._fail(People.RecentActivity.Core.ResultCode.invalidUserCredential, callback);
    }
    else {
        // we need to wait for authentication status to change.
        this._callback = callback;

        info.addListener("authenticationstatuschanged", this._onAuthenticated, this);

        if (info.status === People.RecentActivity.Platform.AuthenticationStatus.authenticatedPendingTokenRefresh) {
            // ask for a new token.
            info.refreshToken();
        }
    }
};

People.RecentActivity.Providers.DelayedRequest.prototype.cancel = function() {
    /// <summary>
    ///     Cancels the request.
    /// </summary>
    this._callback = null;
    this._canceled = true;

    this._context.authInfo.removeListenerSafe("authenticationstatuschanged", this._onAuthenticated, this);

    if (this._request != null) {
        this._request.cancel();
        this._request = null;
    }
};

People.RecentActivity.Providers.DelayedRequest.prototype._fail = function (resultCode, callback) {
    /// <summary>Fails the request.</summary>
    var result = new People.RecentActivity.Core.ResultInfo(resultCode);

    var feedObject = this._context.feedObject;
    if (feedObject) {
        result.errorMap[feedObject.sourceId] = resultCode;
    }

    var response = new People.RecentActivity.Providers.SocialHttpResponse(
        result,
        null,
        null,
        new People.RecentActivity.Providers.HttpResponse(0, '', '', null, null),
        this._context);

    callback(response);
};

People.RecentActivity.Providers.DelayedRequest.prototype._onAuthenticated = function(e) {
    /// <param name="e" type="People.RecentActivity.EventArgs"></param>
    Debug.assert(e != null, 'e');

    if (this._canceled) {
        return;
    }

    var info = e.sender;

    Jx.log.write(4, People.Social.format('DelayedRequest.OnAuthenticated({0},{1})', info.userId.sourceId, info.status));

    if (info.status === People.RecentActivity.Platform.AuthenticationStatus.authenticatedPendingTokenRefresh) {
        // we've got more info about the account, but we still need an actual token...
        info.refreshToken();
    }
    else {
        // we're done, so remove the listener and execute the request.
        info.removeListenerSafe("authenticationstatuschanged", this._onAuthenticated, this);

        // null out the callback to prevent a circular reference between the request and the object holding on to the request.
        var callback = this._callback;
        this._callback = null;

        this.execute(callback);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Requests\DelayedRequest.js" />
/// <reference path="..\Requests\FqlRequest.js" />
/// <reference path="..\Requests\GraphRequest.js" />
/// <reference path="..\Requests\LegacyRestRequest.js" />
/// <reference path="..\Requests\RequestContext.js" />

People.RecentActivity.Providers.FacebookRequestFactory = function() {
    /// <summary>
    ///     Provides a factory to create requests to access Facebook.
    /// </summary>
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createGetFeedRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createGetFeedRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createGetAlbumsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get albums.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createGetAlbumsRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createRefreshAlbumRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh album.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createRefreshAlbumRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createRefreshPhotoRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh photo.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createRefreshPhotoRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createGetFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get a feed object.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createGetFeedObjectRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createAddFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a new feed object to the current feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.GraphRequest.createAddFeedObjectRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createGetCommentsRequest = function(requestContext) {
    /// <summary>
    ///     Create a request to get comments for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createGetCommentsRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createGetReactionsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get reactions for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createGetReactionsRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createAddCommentRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a comment to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.GraphRequest.createAddCommentRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createAddReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a reaction to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.GraphRequest.createAddReactionRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createRemoveReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to remove a reaction from a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.GraphRequest.createRemoveReactionRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createRefreshNotificationsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh the user's notifications.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createRefreshNotificationsRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createMarkNotificationsReadRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to mark the user's notifications read.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.LegacyRestRequest.createMarkNotificationsReadRequest, requestContext);
};

People.RecentActivity.Providers.FacebookRequestFactory.prototype.createGetUnreadNotificationsCountRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get the user's unread notifications count.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.FqlRequest.createGetUnreadNotificationsCountRequest, requestContext);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Requests\DelayedRequest.js" />
/// <reference path="..\Requests\RequestContext.js" />
/// <reference path="..\Requests\ShareAnythingRequest.js" />
/// <reference path="..\Requests\SupRequest.js" />

People.RecentActivity.Providers.SupRequestFactory = function() {
    /// <summary>
    ///     Represents sup request factory.
    /// </summary>
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createGetFeedRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createGetFeedRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createGetAlbumsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get albums.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    throw new Error('Not Supported!');
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createRefreshAlbumRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh album.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    throw new Error('Not Supported!');
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createRefreshPhotoRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh photo.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    throw new Error('Not Supported!');
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createGetFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get a feed object.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createGetFeedObjectRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createAddFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a new feed object to the current feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.ShareAnythingRequest.createAddFeedObjectRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createGetCommentsRequest = function(requestContext) {
    /// <summary>
    ///     Create a request to get comments for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createGetCommentsRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createGetReactionsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get reactions for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createGetReactionsRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createAddCommentRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a comment to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createAddCommentRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createAddReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a reaction to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createAddReactionRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createRemoveReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to remove a reaction from a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createRemoveReactionRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createRefreshNotificationsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get the user's notifications.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createRefreshNotificationsRequest, requestContext);
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createMarkNotificationsReadRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to mark the user's notifications read.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    throw new Error('Not Supported!');
};

People.RecentActivity.Providers.SupRequestFactory.prototype.createGetUnreadNotificationsCountRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get the user's unread notifications count.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return People.RecentActivity.Providers.DelayedRequest.createRequest(People.RecentActivity.Providers.SupRequest.createRefreshNotificationsRequest, requestContext);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciHelper.js" />
/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyApiCallNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyScenarioType.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\..\Platform\AuthenticationStatus.js" />
/// <reference path="..\Http\HttpRequest.js" />
/// <reference path="..\Http\HttpResponse.js" />
/// <reference path="..\Responses\SocialHttpResponse.js" />
/// <reference path="..\Uri.js" />
/// <reference path="RequestContext.js" />

People.RecentActivity.Providers.SocialHttpRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents the base class for all social network requests.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_httpRequest" type="People.RecentActivity.Providers.HttpRequest"></field>
    /// <field name="_requestContext" type="People.RecentActivity.Providers.RequestContext"></field>
    /// <field name="_canceled" type="Boolean"></field>
    Debug.assert(requestContext != null, 'requestContext');
    if (uri != null) {
        this._httpRequest = new People.RecentActivity.Providers.HttpRequest(method, uri);
        // add headers (if-modified-since to bypass buggy cache of IE)
        this.addHeader('If-Modified-Since', 'Sat, 1 Jan 2000 00:00:00 GMT');
    }

    this._requestContext = requestContext;
};


People.RecentActivity.Providers.SocialHttpRequest.prototype._httpRequest = null;
People.RecentActivity.Providers.SocialHttpRequest.prototype._requestContext = null;
People.RecentActivity.Providers.SocialHttpRequest.prototype._canceled = false;

Object.defineProperty(People.RecentActivity.Providers.SocialHttpRequest.prototype, "body", {
    get: function() {
        /// <summary>
        ///     Gets or sets the request body.
        /// </summary>
        /// <value type="String"></value>
        return this._httpRequest.body;
    },
    set: function(value) {
        this._httpRequest.body = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpRequest.prototype, "requestContext", {
    get: function() {
        /// <summary>
        ///     Gets the request context.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.RequestContext"></value>
        return this._requestContext;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpRequest.prototype, "canceled", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the request is already canceled.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._canceled;
    }
});

People.RecentActivity.Providers.SocialHttpRequest.prototype.addHeader = function(name, value) {
    /// <summary>
    ///     Adds a header.
    /// </summary>
    /// <param name="name" type="String">The name of the header.</param>
    /// <param name="value" type="String">The value of the header.</param>
    this._httpRequest.addHeader(name, value);
};

People.RecentActivity.Providers.SocialHttpRequest.prototype.execute = function(callback) {
    /// <summary>
    ///     Executes the request.
    /// </summary>
    /// <param name="callback" type="Function">The callback.</param>
    var authStatus = this._requestContext.authInfo.status;
    if (authStatus !== People.RecentActivity.Platform.AuthenticationStatus.authenticated) {
        var response = new People.RecentActivity.Providers.SocialHttpResponse(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.invalidUserCredential), null, null, new People.RecentActivity.Providers.HttpResponse(0, '', '', null, null), this._requestContext);
        response.subErrorCode = authStatus;
        this._requestContext.errorType = InstruErrorType.client;
        this._reportInstrumentation(response, 0);
        callback(response);
    }
    else {
        this._requestContext.startTime = new Date();
        var body = this.body;
        var bodyLength = (body != null) ? body.length : 0;
        this._requestContext.requestSizeInBytes = bodyLength;
        this._requestContext.scenarioSizeInBytes = this._requestContext.scenarioSizeInBytes + bodyLength;
        this._httpRequest.execute(this.onResponseReceived.bind(this), callback);
    }
};

People.RecentActivity.Providers.SocialHttpRequest.prototype.cancel = function() {
    /// <summary>
    ///     Cancels the request.
    /// </summary>
    this._canceled = true;
};

People.RecentActivity.Providers.SocialHttpRequest.prototype.onResponseReceived = function(response) {
    /// <summary>
    ///     Called when the response is received.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.HttpResponse">The response.</param>
    var that = this;
    
    var jobSet;
    try {
        jobSet = Jx.root.getJobSet();
    }
    catch (ex) {
        Jx.log.write(2, People.Social.format('SocialHttpRquest.OnResponseReceived(): Fail to get job set! The app might be shutting down: {0}', ex.message));
        return;
    }

    var duration = new Date().getTime() - this._requestContext.startTime.getTime();
    this._requestContext.scenarioDuration = this._requestContext.scenarioDuration + duration;
    this._requestContext.errorType = InstruErrorType.success;
    var callback = response.userState;
    if (callback == null || this._canceled) {
        return;
    }

    jobSet.addUIJob(null, function() {
        var result;
        // When deserialzing, we need to update result again based on response body.
        if (response.status === 200 || response.status === 201 || response.status === 204) {
            result = People.RecentActivity.Core.ResultCode.success;
        }
        else if (response.status === 401 || response.status === 403) {
            result = People.RecentActivity.Core.ResultCode.invalidUserCredential;
        }
        else {
            result = People.RecentActivity.Core.ResultCode.failure;
        }

        var socialResponse = new People.RecentActivity.Providers.SocialHttpResponse(new People.RecentActivity.Core.ResultInfo(result), null, null, response, that._requestContext);
        that._requestContext.serializer.deserialize(socialResponse, that._requestContext.expectedResponseFormat, that._requestContext.expectedResponse);
        if (!socialResponse.success) {
            var resultInfo = socialResponse.resultInfo;
            resultInfo.errorMap[that._requestContext.authInfo.userId.sourceId] = resultInfo.code;
            that._requestContext.errorType = InstruErrorType.fault;
        }

        that._reportInstrumentation(socialResponse, duration);
        callback(socialResponse);
    }, null, People.Priority.socialData);
};

People.RecentActivity.Providers.SocialHttpRequest.prototype.reportScenario = function() {
    var context = this._requestContext;
    if (context.scenarioId !== InstruScenarioId.unknown) {
        People.RecentActivity.Core.BiciHelper.recordScenarioQos(context.scenarioId, context.scenarioDuration, context.scenarioSizeInBytes, context.errorCode, context.errorType, null);
    }
};

People.RecentActivity.Providers.SocialHttpRequest.prototype._reportInstrumentation = function(response, duration) {
    /// <param name="response" type="People.RecentActivity.Providers.IResponse"></param>
    /// <param name="duration" type="Number" integer="true"></param>
    var context = this._requestContext;
    var sourceId = context.authInfo.userId.sourceId;
    context.errorCode = this._getHResult(response);
    if (this._requestContext.thirdPartyApiName !== People.RecentActivity.Core.BiciThirdPartyApiCallNames.unknown) {
        Debug.assert(context.thirdPartyScenarioType !== People.RecentActivity.Core.BiciThirdPartyScenarioType.unknown, "Third party scenario type must not be 'Unknown'");
        People.RecentActivity.Core.BiciHelper.createThirdPartyAPICallDatapoint(sourceId, context.thirdPartyApiName, response.status, context.thirdPartyScenarioType);
    }

    if (this._requestContext.liveCommApiName !== People.RecentActivity.Core.BiciLiveCommApiNames.none) {
        People.RecentActivity.Core.BiciHelper.createHttpCallCompleteDatapoint(sourceId, context.liveCommApiName, context.errorCode, duration);
    }

    if (context.propertyId !== InstruPropertyId.unknown && context.scenarioId !== InstruScenarioId.unknown && context.apiId !== InstruApiId.unknown) {
        People.RecentActivity.Core.BiciHelper.recordDependentApiQos(context.scenarioId, context.apiId, context.propertyId, duration, context.requestSizeInBytes, context.errorCode, context.errorType, null);
    }

    if (this._requestContext.scenarioComplete && !this._requestContext.isAggregated) {
        this.reportScenario();
    }
};

People.RecentActivity.Providers.SocialHttpRequest.prototype._getHResult = function(response) {
    /// <param name="response" type="People.RecentActivity.Providers.IResponse"></param>
    /// <returns type="Number" integer="true"></returns>
    if (response.success) {
        return 0;
    }

    var status = response.status;
    // Ensure that subcode isn't NaN, otherwise the HResult will be corrupted.
    var subcode = (isNaN(response.subErrorCode)) ? 0 : response.subErrorCode;
    return (2264924160 | (16777215 & ((Math.max(0, Math.min(status, 999)) * 10000) + Math.max(0, Math.min(subcode, 9999))))) >>> 0;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\..\Platform\Platform.js" />
/// <reference path="..\Uri.js" />
/// <reference path="RequestContext.js" />
/// <reference path="SocialHttpRequest.js" />

People.RecentActivity.Providers.ShareAnythingRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents a Sup request.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_shareAnythingPathFormat$1" type="String" static="true"></field>
    People.RecentActivity.Providers.SocialHttpRequest.call(this, method, uri, requestContext);
    this.addHeader('Authorization', 'WLID1.0 ' + requestContext.authInfo.token);
    this.addHeader('AppId', People.RecentActivity.Platform.Configuration.instance.shareAnythingApiAppId);
};

Jx.inherit(People.RecentActivity.Providers.ShareAnythingRequest, People.RecentActivity.Providers.SocialHttpRequest);


People.RecentActivity.Providers.ShareAnythingRequest._shareAnythingPathFormat$1 = 'users({0})/{1}';

People.RecentActivity.Providers.ShareAnythingRequest.createAddFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject != null');
    Debug.assert(requestContext.feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'requestContext.FeedObject.Type == FeedObjectInfoType.Entry');
    Debug.assert((requestContext.feedObject.data).type === People.RecentActivity.Core.FeedEntryInfoType.text, '((FeedEntryInfo)requestContext.FeedObject.Data).Type == FeedEntryInfoType.Text');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.shareAnythingPostActivity;
    requestContext.propertyId = InstruPropertyId.shareAnything;
    requestContext.scenarioId = InstruScenarioId.modernPeople_PostShare;
    requestContext.apiId = InstruApiId.shareAnything_Status;
    requestContext.expectedResponseFormat = 3;
    var request = new People.RecentActivity.Providers.ShareAnythingRequest(1, People.RecentActivity.Providers.ShareAnythingRequest._getUrl$1('status'), requestContext);
    request.addHeader('Content-Type', 'application/atom+xml');
    request.body = requestContext.serializer.serialize(requestContext.feedObject, 13);
    return request;
};

People.RecentActivity.Providers.ShareAnythingRequest._getUrl$1 = function(path) {
    /// <summary>
    ///     Generates the URI for the Share Anything API request.
    /// </summary>
    /// <param name="path" type="String">The requested path (e.g. "status").</param>
    /// <returns type="People.RecentActivity.Providers.Uri"></returns>
    var cid = People.RecentActivity.Platform.Platform.instance.getUserPersonCid();
    return new People.RecentActivity.Providers.Uri(People.RecentActivity.Platform.Configuration.instance.shareAnythingApiRootUrl, People.Social.format('users({0})/{1}', cid, path));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyApiCallNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyScenarioType.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Uri.js" />
/// <reference path="FbGetFeedRequest.js" />
/// <reference path="FbGetNotificationsRequest.js" />
/// <reference path="RequestContext.js" />
/// <reference path="SocialHttpRequest.js" />

People.RecentActivity.Providers.FqlRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents a FQL request.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="feedInfoQuery" type="String" static="true">Feed info query name.</field>
    /// <field name="commentsInfoQuery" type="String" static="true">Comments info query name.</field>
    /// <field name="likesInfoQuery" type="String" static="true">Likes info query name.</field>
    /// <field name="notificationsInfoQuery" type="String" static="true">The name of the query to get notification info.</field>
    /// <field name="profileInfoQuery" type="String" static="true">The profile info for the people represented in the notifications.</field>
    /// <field name="albumInfoQuery" type="String" static="true">The album info query name.</field>
    /// <field name="photoInfoQuery" type="String" static="true">The photo info query name.</field>
    /// <field name="photoTagInfoQuery" type="String" static="true">The photo tag info query name.</field>
    /// <field name="query" type="String" static="true">The query param name for an FQL query.</field>
    /// <field name="_queryPath$1" type="String" static="true"></field>
    /// <field name="_profileSelect$1" type="String" static="true"></field>
    /// <field name="_feedEntrySelect$1" type="String" static="true"></field>
    /// <field name="_feedEntrySelectWhatsNewTemplate$1" type="String" static="true"></field>
    /// <field name="_feedEntrySelectRecentActivityTemplate$1" type="String" static="true"></field>
    /// <field name="_albumSelect$1" type="String" static="true"></field>
    /// <field name="_photoSelect$1" type="String" static="true"></field>
    /// <field name="_commentSelect$1" type="String" static="true"></field>
    /// <field name="_commentSelectTemplate$1" type="String" static="true"></field>
    /// <field name="_getFeedQueryTemplate$1" type="String" static="true"></field>
    /// <field name="_refreshAlbumsQueryTemplate$1" type="String" static="true"></field>
    /// <field name="_refreshAlbumQueryTemplate$1" type="String" static="true"></field>
    /// <field name="_getAlbumQueryTemplate$1" type="String" static="true"></field>
    /// <field name="_getPhotoQueryTemplate$1" type="String" static="true"></field>
    /// <field name="_refreshPhotoQueryTemplate$1" type="String" static="true"></field>
    /// <field name="_excludedAppStoryDomains$1" type="Array" elementType="String" static="true"></field>
    People.RecentActivity.Providers.SocialHttpRequest.call(this, method, uri, requestContext);
};

Jx.inherit(People.RecentActivity.Providers.FqlRequest, People.RecentActivity.Providers.SocialHttpRequest);


People.RecentActivity.Providers.FqlRequest.feedInfoQuery = 'feedInfo';
People.RecentActivity.Providers.FqlRequest.commentsInfoQuery = 'commentsInfo';
People.RecentActivity.Providers.FqlRequest.likesInfoQuery = 'likesInfo';
People.RecentActivity.Providers.FqlRequest.notificationsInfoQuery = 'notificationsInfo';
People.RecentActivity.Providers.FqlRequest.profileInfoQuery = 'profileInfo';
People.RecentActivity.Providers.FqlRequest.albumInfoQuery = 'albumInfo';
People.RecentActivity.Providers.FqlRequest.photoInfoQuery = 'photoInfo';
People.RecentActivity.Providers.FqlRequest.photoTagInfoQuery = 'photoTagInfo';
People.RecentActivity.Providers.FqlRequest.query = 'q';
People.RecentActivity.Providers.FqlRequest._queryPath$1 = 'fql';
People.RecentActivity.Providers.FqlRequest._profileSelect$1 = 'id, name, pic_square';
People.RecentActivity.Providers.FqlRequest._feedEntrySelect$1 = 'post_id, actor_id, target_id, message, created_time, attribution, attachment, comment_info, likes, permalink, tagged_ids, message_tags, type';
People.RecentActivity.Providers.FqlRequest._feedEntrySelectWhatsNewTemplate$1 = "SELECT {0} FROM stream WHERE filter_key in (SELECT filter_key FROM stream_filter WHERE uid=me() AND type='newsfeed') AND {1} AND {2}";
People.RecentActivity.Providers.FqlRequest._feedEntrySelectRecentActivityTemplate$1 = 'SELECT {0} FROM stream WHERE source_id = {1} AND {2}';
People.RecentActivity.Providers.FqlRequest._albumSelect$1 = 'aid, owner, cover_pid, name, modified, description, size, link, object_id, like_info, comment_info';
People.RecentActivity.Providers.FqlRequest._photoSelect$1 = 'pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, like_info, comment_info';
People.RecentActivity.Providers.FqlRequest._commentSelect$1 = 'fromid, time, text, id';
People.RecentActivity.Providers.FqlRequest._commentSelectTemplate$1 = "\"{0}\":\"SELECT {1} FROM comment WHERE {2} = '{3}' ORDER BY time DESC\"," + '"{4}":"SELECT {5} FROM profile WHERE id IN (SELECT fromid FROM #{0})"';
People.RecentActivity.Providers.FqlRequest._getFeedQueryTemplate$1 = '"{0}":"{1}",' + '"{2}":"SELECT {3} FROM profile WHERE id IN (SELECT actor_id, target_id, tagged_ids, likes.sample, likes.friends FROM #{0})"';
People.RecentActivity.Providers.FqlRequest._refreshAlbumsQueryTemplate$1 = '"{0}":"SELECT {1} FROM album WHERE owner = {2} ORDER BY created DESC",' + '"{3}":"SELECT {4} FROM photo WHERE pid IN (SELECT cover_pid FROM #{0})"';
People.RecentActivity.Providers.FqlRequest._refreshAlbumQueryTemplate$1 = "\"{0}\":\"SELECT {1} FROM photo WHERE aid = '{2}' ORDER BY created DESC LIMIT 300\"," + "\"{3}\":\"SELECT {4} FROM album WHERE aid = '{2}'\"";
People.RecentActivity.Providers.FqlRequest._getAlbumQueryTemplate$1 = "\"{0}\":\"SELECT {1} FROM album WHERE {2} = '{3}' OR object_id = {3}\"," + '"{4}":"SELECT {5} FROM photo WHERE pid IN (SELECT cover_pid FROM #{0})",' + '"{6}":"SELECT {7}, object_id FROM comment WHERE object_id IN (SELECT object_id FROM #{0}) ORDER BY time DESC",' + '"{8}":"SELECT user_id, object_id FROM like WHERE object_id IN (SELECT object_id FROM #{0})",' + '"{9}":"SELECT {10} FROM profile WHERE id IN (SELECT fromid FROM #{6}) OR id IN (SELECT user_id FROM #{8})"';
People.RecentActivity.Providers.FqlRequest._getPhotoQueryTemplate$1 = "\"{0}\":\"SELECT {1} FROM photo WHERE {2} = '{3}' OR object_id = {3}\"," + '"{4}":"SELECT {5}, object_id FROM comment WHERE object_id IN (SELECT object_id FROM #{0}) ORDER BY time DESC",' + '"{6}":"SELECT user_id, object_id FROM like WHERE object_id IN (SELECT object_id FROM #{0})",' + '"{7}":"SELECT {8} FROM profile WHERE id IN (SELECT fromid FROM #{4}) OR id IN (SELECT user_id FROM #{6})"';
People.RecentActivity.Providers.FqlRequest._refreshPhotoQueryTemplate$1 = "\"{0}\":\"SELECT subject, xcoord, ycoord, created FROM photo_tag WHERE pid = '{1}'\"," + '"{2}":"SELECT {3} FROM profile WHERE id IN (SELECT subject FROM #{0})",' + "\"{4}\":\"SELECT {5} FROM photo WHERE pid = '{1}'\"";
People.RecentActivity.Providers.FqlRequest._excludedAppStoryDomains$1 = [ 'http://apps.facebook.com', 'https://apps.facebook.com', 'http://zynga.com', 'http://www.zynga.com' ];

People.RecentActivity.Providers.FqlRequest.createGetFeedRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext.contactIdMap != null, 'requestContext.ContactIdMap');
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    var query = null;
    var contactId = requestContext.contactIdMap[People.RecentActivity.Core.NetworkId.facebook];
    // This requires a second request, delay the scenario recording.
    requestContext.scenarioComplete = false;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.feeds;
    var timeOffset = requestContext.feedTimeOffset;
    if (contactId.id === People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId) {
        requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetActivities;
        if (timeOffset === -1) {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetContactsActivities;
            requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetContactsActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetWhatsNewActivities;
        }
        else {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetMoreContactsActivities;
            requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetMoreContactsActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetMoreWhatsNewActivities;
        }

        query = People.Social.format("SELECT {0} FROM stream WHERE filter_key in (SELECT filter_key FROM stream_filter WHERE uid=me() AND type='newsfeed') AND {1} AND {2}", 'post_id, actor_id, target_id, message, created_time, attribution, attachment, comment_info, likes, permalink, tagged_ids, message_tags, type', People.RecentActivity.Providers.FqlRequest._getEntryFilter$1(), People.RecentActivity.Providers.FqlRequest._getAppStoryFilter$1());
    }
    else {
        requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetContactsActivities;
        if (timeOffset === -1) {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetActivities;
            requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetRecentActivities;
        }
        else {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetMoreActivities;
            requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetMoreActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetMoreRecentActivities;
        }

        query = People.Social.format('SELECT {0} FROM stream WHERE source_id = {1} AND {2}', 'post_id, actor_id, target_id, message, created_time, attribution, attachment, comment_info, likes, permalink, tagged_ids, message_tags, type', contactId.id, People.RecentActivity.Providers.FqlRequest._getEntryFilter$1());
    }

    if (requestContext.feedTimeOffset > 0) {
        // Facebook expects number of seconds.
        query += ' AND created_time < ';
        query += requestContext.feedTimeOffset / 1000;
    }

    query += ' ORDER BY created_time DESC ';
    query += ' LIMIT ' + People.RecentActivity.Platform.Configuration.instance.feedEntriesBatchSize;
    query = People.Social.format(People.RecentActivity.Providers.FqlRequest._getFeedQueryTemplate$1, 'feedInfo', query, 'profileInfo', 'id, name, pic_square');
    url.addQueryParameter('q', '{' + query + '}');
    return new People.RecentActivity.Providers.FbGetFeedRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createGetAlbumsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get albums.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext.contactIdMap != null, 'requestContext.ContactIdMap');
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    var query = People.Social.format(People.RecentActivity.Providers.FqlRequest._refreshAlbumsQueryTemplate$1, 'albumInfo', 'aid, owner, cover_pid, name, modified, description, size, link, object_id, like_info, comment_info', requestContext.contactIdMap[People.RecentActivity.Core.NetworkId.facebook].id, 'photoInfo', 'pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, like_info, comment_info');
    url.addQueryParameter('q', '{' + query + '}');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetAlbums;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetAlbums;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.photos;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetAlbums;
    requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetAlbums;
    return new People.RecentActivity.Providers.FqlRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createRefreshAlbumRequest = function(requestContext) {
    /// <summary>
    ///     Creates the refresh album request.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject');
    var album = requestContext.feedObject.data;
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    var query = People.Social.format(People.RecentActivity.Providers.FqlRequest._refreshAlbumQueryTemplate$1, 'photoInfo', 'pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, like_info, comment_info', album.id, 'albumInfo', 'aid, owner, cover_pid, name, modified, description, size, link, object_id, like_info, comment_info');
    url.addQueryParameter('q', '{' + query + '}');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetPhotos;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetPhotos;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.photos;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetPhotos;
    requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetPhotos;
    return new People.RecentActivity.Providers.FqlRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createRefreshPhotoRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh a photo.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject');
    var photo = requestContext.feedObject.data;
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    var query = People.Social.format(People.RecentActivity.Providers.FqlRequest._refreshPhotoQueryTemplate$1, 'photoTagInfo', photo.id, 'profileInfo', 'id, name, pic_square', 'photoInfo', 'pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, like_info, comment_info');
    url.addQueryParameter('q', '{' + query + '}');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetPhoto;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetPhoto;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.photos;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetPhoto;
    requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetPhoto;
    return new People.RecentActivity.Providers.FqlRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createGetFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get a feed object.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var obj = requestContext.feedObject;
    Debug.assert(obj != null, 'obj');
    Debug.assert(Jx.isNonEmptyString(obj.id), 'obj.Id');
    var query = null;
    switch (obj.type) {
        case People.RecentActivity.Core.FeedObjectInfoType.entry:
            query = People.Social.format(People.RecentActivity.Providers.FqlRequest._getFeedQueryTemplate$1, 'feedInfo', People.Social.format("SELECT {0} FROM stream WHERE post_id = '{1}'", 'post_id, actor_id, target_id, message, created_time, attribution, attachment, comment_info, likes, permalink, tagged_ids, message_tags, type', obj.id), 'profileInfo', 'id, name, pic_square');
            requestContext.expectedResponse = 1;
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetActivity;
            requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetActivity;
            requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.feeds;
            requestContext.propertyId = InstruPropertyId.facebook;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetActivity;
            requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetActivity;
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
            query = People.Social.format(People.RecentActivity.Providers.FqlRequest._getAlbumQueryTemplate$1, 'albumInfo', 'aid, owner, cover_pid, name, modified, description, size, link, object_id, like_info, comment_info', 'aid', obj.id/* obj.Id is supposed to be Facebook aid here.*/, 'photoInfo', 'pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, like_info, comment_info', 'commentsInfo', 'fromid, time, text, id', 'likesInfo', 'profileInfo', 'id, name, pic_square');
            requestContext.expectedResponse = 7;
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetAlbum;
            requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetAlbum;
            requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.photos;
            requestContext.propertyId = InstruPropertyId.facebook;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetAlbum;
            requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetAlbum;
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            query = People.Social.format(People.RecentActivity.Providers.FqlRequest._getPhotoQueryTemplate$1, 'photoInfo', 'pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, like_info, comment_info', 'pid', obj.id/* obj.Id is supposed to be Facebook pid here.*/, 'commentsInfo', 'fromid, time, text, id', 'likesInfo', 'profileInfo', 'id, name, pic_square');
            requestContext.expectedResponse = 8;
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetPhoto;
            requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetPhoto;
            requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.photos;
            requestContext.propertyId = InstruPropertyId.facebook;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetPhoto;
            requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetPhoto;
            break;
        default:
            Debug.assert(false, 'Unexpected feed object type: ' + obj.type);
            break;
    }

    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    url.addQueryParameter('q', '{' + query + '}');
    return (obj.type === People.RecentActivity.Core.FeedObjectInfoType.entry) ? new People.RecentActivity.Providers.FbGetFeedRequest(0, url, requestContext) : new People.RecentActivity.Providers.FqlRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createGetCommentsRequest = function(requestContext) {
    /// <summary>
    ///     Create a request to get comments for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject');
    var query = People.Social.format(People.RecentActivity.Providers.FqlRequest._commentSelectTemplate$1, 'commentsInfo', 'fromid, time, text, id', (requestContext.feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry) ? 'post_id' : 'object_id', requestContext.feedObject.id, 'profileInfo', 'id, name, pic_square');
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    url.addQueryParameter('q', '{' + query + '}');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetComments;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetComments;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.readActivityReactions;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetComments;
    requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetComments;
    return new People.RecentActivity.Providers.FqlRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createGetReactionsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get reactions for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject');
    var query = People.Social.format("\"{0}\":\"SELECT user_id FROM like WHERE {1} = '{2}'\"," + '"{3}":"SELECT {4} FROM profile WHERE id IN (SELECT user_id FROM #{0})"', 'likesInfo', (requestContext.feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry) ? 'post_id' : 'object_id', requestContext.feedObject.id, 'profileInfo', 'id, name, pic_square');
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    url.addQueryParameter('q', '{' + query + '}');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetLikes;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetLikes;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.readActivityReactions;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetReactions;
    requestContext.apiId = InstruApiId.facebook_Fql_MultiQuery_GetLikes;
    return new People.RecentActivity.Providers.FqlRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createRefreshNotificationsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get notifications for the user.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var query = People.Social.format('"{0}":"SELECT notification_id, sender_id, updated_time, title_text, href, is_unread, object_id, object_type FROM notification WHERE recipient_id = me() AND is_hidden = 0",' + '"{1}":"SELECT id, name, pic_square FROM profile WHERE id IN (SELECT sender_id FROM #{0})"', 'notificationsInfo', 'profileInfo');
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    url.addQueryParameter('q', '{' + query + '}');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetNotifications;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetNotifications;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.readNotifications;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetNotifications;
    requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetSocialNotifications;
    // This requires a second request, delay the scenario recording.
    requestContext.scenarioComplete = false;
    return new People.RecentActivity.Providers.FbGetNotificationsRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.createGetUnreadNotificationsCountRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get the user's unread notifications count.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var query = "SELECT '' FROM notification WHERE recipient_id = me() AND is_unread = 1 AND is_hidden = 0";
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, false);
    url.addQueryParameter('q', query);
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetUnreadNotificationCount;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetUnreadNotificationCount;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.readNotifications;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetUnreadNotificationsCount;
    requestContext.apiId = InstruApiId.facebook_Fql_Query_GetUnreadNotificationCount;
    return new People.RecentActivity.Providers.FqlRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FqlRequest.getBaseUrl = function(requestContext, isMultiQuery) {
    /// <summary>
    ///     Gets the base url for FQL.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <param name="isMultiQuery" type="Boolean">if set to <c>true</c> [is multi query].</param>
    /// <returns type="People.RecentActivity.Providers.Uri"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var uri = new People.RecentActivity.Providers.Uri(People.RecentActivity.Platform.Configuration.instance.fqlRootUrl, 'fql');
    var authInfo = requestContext.authInfo;
    Debug.assert(authInfo != null, 'authInfo');
    uri.addQueryParameter('access_token', authInfo.token);
    return uri;
};

People.RecentActivity.Providers.FqlRequest._getAppStoryFilter$1 = function() {
    /// <returns type="String"></returns>
    var domainFilters = People.RecentActivity.Providers.FqlRequest._excludedAppStoryDomains$1.map(function(obj) {
        var domain = obj;
        return People.Social.format("substr(attachment.href, 0, {0}) = '{1}'", domain.length, domain);
    });
    return People.Social.format('NOT ((type = 237 OR type = 272) AND ({0}))', domainFilters.join(' OR '));
};

People.RecentActivity.Providers.FqlRequest._getEntryFilter$1 = function() {
    /// <returns type="Object"></returns>
    // This is to exclude deleted entries which FB sometimes returns
    return "NOT (permalink = '')";
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyApiCallNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyScenarioType.js" />
/// <reference path="..\..\Core\EntityInfoType.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Helpers\EntityHelper.js" />
/// <reference path="..\Uri.js" />
/// <reference path="FqlRequest.js" />
/// <reference path="RequestContext.js" />
/// <reference path="SocialHttpRequest.js" />

People.RecentActivity.Providers.FbGetFeedRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents the FQL request to get feed.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_albumInfoMultiQueryTemplate$2" type="String" static="true"></field>
    /// <field name="_photoInfoMultiQueryTemplate$2" type="String" static="true"></field>
    /// <field name="_multiQueryTemplate$2" type="String" static="true"></field>
    /// <field name="_contactInfoQueryTemplate$2" type="String" static="true"></field>
    /// <field name="_ownerSubQuery$2" type="String" static="true"></field>
    /// <field name="_callback$2" type="Function"></field>
    /// <field name="_feedResponse$2" type="People.RecentActivity.Providers.IResponse"></field>
    /// <field name="_feedInfoRequest$2" type="People.RecentActivity.Providers.IRequest"></field>
    People.RecentActivity.Providers.FqlRequest.call(this, method, uri, requestContext);
};

Jx.inherit(People.RecentActivity.Providers.FbGetFeedRequest, People.RecentActivity.Providers.FqlRequest);


People.RecentActivity.Providers.FbGetFeedRequest._albumInfoMultiQueryTemplate$2 = '"{0}":"SELECT aid, owner, cover_pid, name, modified, description, size, link, object_id, comment_info, like_info FROM album WHERE aid IN ({1})",';
People.RecentActivity.Providers.FbGetFeedRequest._photoInfoMultiQueryTemplate$2 = '"{0}":"SELECT pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, comment_info, like_info FROM photo WHERE pid IN ({1})",';
People.RecentActivity.Providers.FbGetFeedRequest._multiQueryTemplate$2 = '"{0}":"{1}"';
People.RecentActivity.Providers.FbGetFeedRequest._contactInfoQueryTemplate$2 = 'SELECT id, name, pic_square FROM profile WHERE id IN ({0})';
People.RecentActivity.Providers.FbGetFeedRequest._ownerSubQuery$2 = 'SELECT owner FROM #';
People.RecentActivity.Providers.FbGetFeedRequest.prototype._callback$2 = null;
People.RecentActivity.Providers.FbGetFeedRequest.prototype._feedResponse$2 = null;
People.RecentActivity.Providers.FbGetFeedRequest.prototype._feedInfoRequest$2 = null;

People.RecentActivity.Providers.FbGetFeedRequest.prototype.execute = function(callback) {
    /// <summary>
    ///     Executes the request.
    /// </summary>
    /// <param name="callback" type="Function">The callback.</param>
    if (callback == null) {
        return;
    }

    this._callback$2 = callback;
    this.onExecute();
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype.cancel = function() {
    /// <summary>
    ///     Cancels the request.
    /// </summary>
    if (this._feedInfoRequest$2 != null) {
        this._feedInfoRequest$2.cancel();
    }

    People.RecentActivity.Providers.FqlRequest.prototype.cancel.call(this);
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype.onExecute = function() {
    /// <summary>
    ///     Called when the request is about to execute.
    /// </summary>
    People.RecentActivity.Providers.FqlRequest.prototype.execute.call(this, this.onFeedEntriesRetrieved.bind(this));
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype.onFeedEntriesRetrieved = function(feedResponse) {
    /// <summary>
    ///     Called when feed entries are retrieved.
    /// </summary>
    /// <param name="feedResponse" type="People.RecentActivity.Providers.IResponse">The feed response.</param>
    var entries = feedResponse.data;
    if (!feedResponse.success || entries == null || !entries.length) {
        // No need to get publisher info since no entries.
        this.reportScenario();
        this._callback$2(feedResponse);
        return;
    }

    if (this.requestContext.requestState == null) {
        // We don't need to send the second request to get extra info.
        this._populateEntityInfo$2(entries);
        this.reportScenario();
        this._callback$2(feedResponse);
        return;
    }

    this._feedResponse$2 = feedResponse;
    var contactId = this.requestContext.contactIdMap[People.RecentActivity.Core.NetworkId.facebook];
    var timeOffset = this.requestContext.feedTimeOffset;
    if (contactId.id === People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId) {
        if (timeOffset === -1) {
            this.requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetContactsActivities2;
            this.requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetContactsActivities2;
        }
        else {
            this.requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetMoreContactsActivities2;
            this.requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetMoreContactsActivities2;
        }

    }
    else {
        if (timeOffset === -1) {
            this.requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetActivities2;
            this.requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetActivities2;
        }
        else {
            this.requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetMoreActivities2;
            this.requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetMoreActivities2;
        }    
    }

    this.requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.feeds;
    this.requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetPhotosAlbumsVideos;
    this._feedInfoRequest$2 = this.createGetFeedInfoRequest(this.requestContext);
    this._feedInfoRequest$2.execute(this._onMoreFeedInfoRetrieved$2.bind(this));
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype.createGetFeedInfoRequest = function(requestContext) {
    /// <summary>
    ///     Creates the get feed info request.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext"></param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var states = requestContext.requestState;
    Debug.assert(states != null, 'states');
    Debug.assert(states.length === 2, 'states.Length:' + states.length);
    // The list contains the photo ids we need to get information for.
    var photos = states[0];
    // The list contains the album ids we need to get information for.
    var albums = states[1];
    var url = this._getUrl$2(requestContext, albums, photos);
    requestContext.expectedResponse = 11;
    // This is the last request of the scenario.
    requestContext.scenarioComplete = true;
    return this.onCreateGetFeedInfoRequest(url, requestContext);
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype.onCreateGetFeedInfoRequest = function(url, requestContext) {
    /// <summary>
    ///     Called when creating get feed info request.
    /// </summary>
    /// <param name="url" type="People.RecentActivity.Providers.Uri">The URL.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return new People.RecentActivity.Providers.SocialHttpRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype._onMoreFeedInfoRetrieved$2 = function(response) {
    /// <param name="response" type="People.RecentActivity.Providers.IResponse"></param>
    this._populateEntityInfo$2(this._feedResponse$2.data);
    this._callback$2(this._feedResponse$2);
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype._populateEntityInfo$2 = function(objects) {
    /// <param name="objects" type="Array" elementType="feedObjectInfo"></param>
    // Populate @mention entity info.
    for (var n = 0; n < objects.length; n++) {
        var obj = objects[n];
        var entry = obj.data;
        if (entry.entities == null || !entry.entities.length) {
            continue;
        }

        entry.entities = entry.entities.filter(function(item) {
            var entity = item;
            if (entity.type !== People.RecentActivity.Core.EntityInfoType.contact) {
                return true;
            }

            var contact = entity.data;
            if (!Jx.isNonEmptyString(contact.name)) {
                return false;
            }

            // Excludes contact entity with a offset < 0.
            return entity.offset >= 0;
        });
        // Sort entities based on their offsets.
        People.RecentActivity.Providers.EntityHelper.sortEntities(entry.entities);
        var entities = entry.entities;
        // Handle http://www.iwebcam.com/Veneficus, where Veneficus is actually a @mention.
        for (var i = 1, len = entities.length; i < len; i++) {
            var current = entities[i];
            var previous = entities[i - 1];
            if (previous.type === People.RecentActivity.Core.EntityInfoType.link && (previous.offset + previous.length) > current.offset) {
                // adjust the link length.
                previous.length = current.offset - previous.offset;
                var info = previous.data;
                info.url = info.displayUrl = info.url.substr(0, previous.length);
            }        
        }    
    }
};

People.RecentActivity.Providers.FbGetFeedRequest.prototype._getUrl$2 = function(requestContext, albums, photos) {
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext"></param>
    /// <param name="albums" type="Array"></param>
    /// <param name="photos" type="Array"></param>
    /// <returns type="People.RecentActivity.Providers.Uri"></returns>
    // We need a multi query, since we at least need Contact query to query photo or album owner.
    var queries = '';
    var contactQuery = '';
    if (albums.length > 0) {
        var albumIds = "'" + albums.join("','") + "'";
        queries += People.Social.format('"{0}":"SELECT aid, owner, cover_pid, name, modified, description, size, link, object_id, comment_info, like_info FROM album WHERE aid IN ({1})",', 'albumInfo', albumIds);
        contactQuery += People.Social.format('SELECT id, name, pic_square FROM profile WHERE id IN ({0})', 'SELECT owner FROM #' + 'albumInfo');
    }

    if (photos.length > 0) {
        var photoIds = "'" + photos.join("','") + "'";
        queries += People.Social.format('"{0}":"SELECT pid, aid, owner, link, caption, object_id, created, src_small, src_small_height, src_small_width, src, src_height, src_width, src_big, src_big_height, src_big_width, comment_info, like_info FROM photo WHERE pid IN ({1})",', 'photoInfo', photoIds);
        if (!contactQuery.length) {
            contactQuery += People.Social.format('SELECT id, name, pic_square FROM profile WHERE id IN ({0})', 'SELECT owner FROM #' + 'photoInfo');
        }
        else {
            contactQuery += People.Social.format(' OR id IN ({0})', 'SELECT owner FROM #' + 'photoInfo');
        }    
    }

    // Add contact query to the end of the multiquery.
    queries += People.Social.format('"{0}":"{1}"', 'profileInfo', contactQuery);
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    url.addQueryParameter('q', '{' + queries + '}');
    return url;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyApiCallNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyScenarioType.js" />
/// <reference path="..\..\Core\NotificationInfoType.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\Cache\SocialCache.js" />
/// <reference path="..\Helpers\CollectionHelper.js" />
/// <reference path="..\Uri.js" />
/// <reference path="FqlRequest.js" />
/// <reference path="RequestContext.js" />
/// <reference path="SocialHttpRequest.js" />

People.RecentActivity.Providers.FbGetNotificationsRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents the FQL request to get feed.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_albumInfoMultiQueryTemplate$2" type="String" static="true"></field>
    /// <field name="_photoInfoMultiQueryTemplate$2" type="String" static="true"></field>
    /// <field name="_userInfoMultiQueryTemplate$2" type="String" static="true"></field>
    /// <field name="_fbPostMatch1$2" type="RegExp" static="true"></field>
    /// <field name="_fbPostMatch2$2" type="RegExp" static="true"></field>
    /// <field name="_fbPhotoMatch$2" type="RegExp" static="true"></field>
    /// <field name="_fbAlbumMatch$2" type="RegExp" static="true"></field>
    /// <field name="_callback$2" type="Function"></field>
    /// <field name="_notificationsResponse$2" type="People.RecentActivity.Providers.IResponse"></field>
    /// <field name="_albumIds$2" type="Object"></field>
    /// <field name="_photoIds$2" type="Object"></field>
    /// <field name="_usernames$2" type="Object"></field>
    /// <field name="_cache$2" type="People.RecentActivity.Providers.SocialCache"></field>
    /// <field name="_moreInfoRequest$2" type="People.RecentActivity.Providers.IRequest"></field>
    People.RecentActivity.Providers.FqlRequest.call(this, method, uri, requestContext);
    this._albumIds$2 = {};
    this._photoIds$2 = {};
    this._usernames$2 = {};
};

Jx.inherit(People.RecentActivity.Providers.FbGetNotificationsRequest, People.RecentActivity.Providers.FqlRequest);


People.RecentActivity.Providers.FbGetNotificationsRequest._albumInfoMultiQueryTemplate$2 = '"{0}":"SELECT object_id, aid FROM album WHERE object_id IN ({1})"';
People.RecentActivity.Providers.FbGetNotificationsRequest._photoInfoMultiQueryTemplate$2 = '"{0}":"SELECT object_id, pid FROM photo WHERE object_id IN ({1})"';
People.RecentActivity.Providers.FbGetNotificationsRequest._userInfoMultiQueryTemplate$2 = '"{0}":"SELECT username, id FROM profile WHERE username IN ({1})"';
People.RecentActivity.Providers.FbGetNotificationsRequest._fbPostMatch1$2 = new RegExp('^https?://[^/]+/([^/]+)/posts/([^/?&]+)', 'i');
People.RecentActivity.Providers.FbGetNotificationsRequest._fbPostMatch2$2 = new RegExp('^https?://[^/]+/permalink\\.php\\?story_fbid=([^&]+)&id=([^&]+)', 'i');
People.RecentActivity.Providers.FbGetNotificationsRequest._fbPhotoMatch$2 = new RegExp('^https?://[^/]+/photo\\.php\\?fbid=([^&]+)', 'i');
People.RecentActivity.Providers.FbGetNotificationsRequest._fbAlbumMatch$2 = new RegExp('^https?://[^/]+/album\\.php\\?fbid=([^&]+)', 'i');
People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._callback$2 = null;
People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._notificationsResponse$2 = null;
People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._albumIds$2 = null;
People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._photoIds$2 = null;
People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._usernames$2 = null;
People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._cache$2 = null;
People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._moreInfoRequest$2 = null;

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype.execute = function(callback) {
    /// <summary>
    ///     Executes the request.
    /// </summary>
    /// <param name="callback" type="Function">The callback.</param>
    Debug.assert(callback != null, 'callback');
    this._callback$2 = callback;
    this.onExecute();
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype.cancel = function() {
    /// <summary>
    ///     Cancels the request.
    /// </summary>
    if (this._moreInfoRequest$2 != null) {
        this._moreInfoRequest$2.cancel();
    }

    People.RecentActivity.Providers.FqlRequest.prototype.cancel.call(this);
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype.onExecute = function() {
    /// <summary>
    ///     Called when the request is about to execute.
    /// </summary>
    People.RecentActivity.Providers.FqlRequest.prototype.execute.call(this, this.onNotificationsRetrieved.bind(this));
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype.onNotificationsRetrieved = function(notificationsResponse) {
    /// <summary>
    ///     Called when notifications are retrieved.
    /// </summary>
    /// <param name="notificationsResponse" type="People.RecentActivity.Providers.IResponse">The feed response.</param>
    var notifications = notificationsResponse.data;
    if (!notificationsResponse.success || notifications == null || !notifications.length) {
        // No need to get publisher info since no entries.
        this.reportScenario();
        this._callback$2(notificationsResponse);
        return;
    }

    if (this.requestContext.requestState == null) {
        // We don't need to send the second request to get extra info.
        this.reportScenario();
        this._callback$2(notificationsResponse);
        return;
    }

    this._notificationsResponse$2 = notificationsResponse;
    // Process the set of notifications that need additional information.
    var states = this.requestContext.requestState;
    var infoNeeded = states[0];
    this._cache$2 = states[1];
    this._processNotifications$2(infoNeeded);
    if (!Object.keys(this._albumIds$2).length && !Object.keys(this._photoIds$2).length && !Object.keys(this._usernames$2).length) {
        // We already had all necessary data cached.
        this._callback$2(notificationsResponse);
        return;
    }

    this.requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.fqlGetNotifications2;
    this.requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.fqlGetNotifications2;
    this.requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.readNotifications;
    this.requestContext.propertyId = InstruPropertyId.facebook;
    this.requestContext.scenarioId = InstruScenarioId.modernPeople_GetNotifications;
    this.requestContext.apiId = InstruApiId.facebook_Fql_Multiquery_GetSocialNotifications;
    this._moreInfoRequest$2 = this.createGetMoreInfoRequest(this.requestContext);
    this._moreInfoRequest$2.execute(this._onMoreInfoRetrieved$2.bind(this));
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype.createGetMoreInfoRequest = function(requestContext) {
    /// <summary>
    ///     Creates the get feed info request.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext"></param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(Object.keys(this._albumIds$2).length > 0 || Object.keys(this._photoIds$2).length > 0 || Object.keys(this._usernames$2).length > 0, People.Social.format('count: {0},{1},{2}', Object.keys(this._albumIds$2).length, Object.keys(this._photoIds$2).length, Object.keys(this._usernames$2).length));
    var queries = [];
    var albumKeys = Object.keys(this._albumIds$2);
    var photoKeys = Object.keys(this._photoIds$2);
    var usernameKeys = Object.keys(this._usernames$2);
    if (albumKeys.length > 0) {
        queries.push(People.Social.format('"{0}":"SELECT object_id, aid FROM album WHERE object_id IN ({1})"', 'albumInfo', People.RecentActivity.Providers.CollectionHelper.joinKeys(albumKeys, true)));
    }

    if (photoKeys.length > 0) {
        queries.push(People.Social.format('"{0}":"SELECT object_id, pid FROM photo WHERE object_id IN ({1})"', 'photoInfo', People.RecentActivity.Providers.CollectionHelper.joinKeys(photoKeys, true)));
    }

    if (usernameKeys.length > 0) {
        queries.push(People.Social.format('"{0}":"SELECT username, id FROM profile WHERE username IN ({1})"', 'profileInfo', People.RecentActivity.Providers.CollectionHelper.joinKeys(usernameKeys, true)));
    }

    var queryString = queries.join(',');
    var url = People.RecentActivity.Providers.FqlRequest.getBaseUrl(requestContext, true);
    url.addQueryParameter('q', '{' + queryString + '}');
    requestContext.expectedResponse = 12;
    // This is the last request of the scenario.
    requestContext.scenarioComplete = true;
    return this.onCreateMoreInfoRequest(url, requestContext);
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype.onCreateMoreInfoRequest = function(url, requestContext) {
    /// <summary>
    ///     Called when creating get more info request.
    /// </summary>
    /// <param name="url" type="People.RecentActivity.Providers.Uri">The URL.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    return new People.RecentActivity.Providers.SocialHttpRequest(0, url, requestContext);
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._onMoreInfoRetrieved$2 = function(response) {
    /// <param name="response" type="People.RecentActivity.Providers.IResponse"></param>
    if (response.resultInfo.code === People.RecentActivity.Core.ResultCode.success) {
        this._populateNotificationInfo$2(response.data);
    }

    this._callback$2(this._notificationsResponse$2);
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._processNotifications$2 = function(notifications) {
    /// <summary>
    ///     Process notifications to determine what additional information will be required.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to process.</param>
    for (var n = 0; n < notifications.length; n++) {
        var notification = notifications[n];
        Debug.assert(notification.objectType === People.RecentActivity.Core.NotificationInfoType.none || !Jx.isNonEmptyString(notification.objectId), People.Social.format('ObjectType:{0}; ObjectId:{1}', notification.objectType, notification.objectId));
        Debug.assert(Jx.isNonEmptyString(notification.link), 'FbGetNotificationsRequest.ProcessNotifications: notification.Link must not be null or empty');
        // Ensure that the object type is null in case we don't successfully parse the notification.
        notification.objectType = People.RecentActivity.Core.NotificationInfoType.none;
        // Try to parse the link as a post link (for someone with a vanity username).
        var matches = People.RecentActivity.Providers.FbGetNotificationsRequest._fbPostMatch1$2.exec(notification.link);
        if (matches != null) {
            var username = matches[1];
            var contactId = this._cache$2.getContactId(username);
            notification.objectId = matches[2];
            notification.objectType = People.RecentActivity.Core.NotificationInfoType.entry;
            if (Jx.isNonEmptyString(contactId)) {
                notification.objectId = People.Social.format('{0}_{1}', contactId, notification.objectId);
            }
            else {
                this._addNotificationToDictionary$2(this._usernames$2, username, notification);
            }

            continue;
        }

        // Try to parse the link as a post link (for someone without a vanity username).
        matches = People.RecentActivity.Providers.FbGetNotificationsRequest._fbPostMatch2$2.exec(notification.link);
        if (matches != null) {
            notification.objectId = People.Social.format('{0}_{1}', matches[2], matches[1]);
            notification.objectType = People.RecentActivity.Core.NotificationInfoType.entry;
            continue;
        }

        // Try to parse the link as a photo link.
        matches = People.RecentActivity.Providers.FbGetNotificationsRequest._fbPhotoMatch$2.exec(notification.link);
        if (matches != null) {
            var objectId = matches[1];
            var photoId = this._cache$2.getPhotoId(objectId);
            if (Jx.isNonEmptyString(photoId)) {
                objectId = photoId;
            }
            else {
                this._addNotificationToDictionary$2(this._photoIds$2, objectId, notification);
            }

            notification.objectId = objectId;
            notification.objectType = People.RecentActivity.Core.NotificationInfoType.photo;
            continue;
        }

        // Try to parse the link as a photo album link.
        matches = People.RecentActivity.Providers.FbGetNotificationsRequest._fbAlbumMatch$2.exec(notification.link);
        if (matches != null) {
            var objectId = matches[1];
            var albumId = this._cache$2.getAlbumId(objectId);
            if (Jx.isNonEmptyString(albumId)) {
                objectId = albumId;
            }
            else {
                this._addNotificationToDictionary$2(this._albumIds$2, objectId, notification);
            }

            notification.objectId = objectId;
            notification.objectType = People.RecentActivity.Core.NotificationInfoType.photoAlbum;
            continue;
        }    
    }
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._populateNotificationInfo$2 = function(extraInfo) {
    /// <param name="extraInfo" type="Object"></param>
    Debug.assert(extraInfo != null, 'extraInfo');
    var profileInfo = extraInfo['profileInfo'];
    var albumInfo = extraInfo['albumInfo'];
    var photoInfo = extraInfo['photoInfo'];
    if (!People.RecentActivity.Providers.Utilities.isArray(profileInfo)) {
        Jx.log.write(3, 'FbGetNotificationsRequest.PopulateNotificationInfo(): profileInfo');
    }
    else {
        for (var n = 0; n < profileInfo.length; n++) {
            var profile = profileInfo[n];
            var profileNotifications = this._usernames$2[profile.username];
            if (profileNotifications != null) {
                for (var o = 0; o < profileNotifications.length; o++) {
                    var profileNotification = profileNotifications[o];
                    profileNotification.objectId = People.Social.format('{0}_{1}', profile.id, profileNotification.objectId);
                }            
            }        
        }

        this._cache$2.updateContactIdMap(profileInfo);
    }

    if (!People.RecentActivity.Providers.Utilities.isArray(albumInfo)) {
        Jx.log.write(3, 'FbGetNotificationsRequest.PopulateNotificationInfo(): albumInfo');
    }
    else {
        for (var n = 0; n < albumInfo.length; n++) {
            var album = albumInfo[n];
            var albumNotifications = this._albumIds$2[album.object_id.toString()];
            if (albumNotifications != null) {
                for (var o = 0; o < albumNotifications.length; o++) {
                    var albumNotification = albumNotifications[o];
                    albumNotification.objectId = album.aid;
                }            
            }        
        }

        this._cache$2.updateAlbumIdMap(albumInfo);
    }

    if (!People.RecentActivity.Providers.Utilities.isArray(photoInfo)) {
        Jx.log.write(3, 'FbGetNotificationsRequest.PopulateNotificationInfo(): photoInfo');
    }
    else {
        for (var n = 0; n < photoInfo.length; n++) {
            var photo = photoInfo[n];
            var photoNotifications = this._photoIds$2[photo.object_id.toString()];
            if (photoNotifications != null) {
                for (var o = 0; o < photoNotifications.length; o++) {
                    var photoNotification = photoNotifications[o];
                    photoNotification.objectId = photo.pid;
                }            
            }        
        }

        this._cache$2.updatePhotoIdMap(photoInfo);
    }
};

People.RecentActivity.Providers.FbGetNotificationsRequest.prototype._addNotificationToDictionary$2 = function(dictionary, key, notification) {
    /// <param name="dictionary" type="Object"></param>
    /// <param name="key" type="String"></param>
    /// <param name="notification" type="People.RecentActivity.Core.create_notificationInfo"></param>
    if (!!Jx.isUndefined(dictionary[key])) {
        dictionary[key] = [];
    }

    dictionary[key].push(notification);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyApiCallNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyScenarioType.js" />
/// <reference path="..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Uri.js" />
/// <reference path="RequestContext.js" />
/// <reference path="SocialHttpRequest.js" />

People.RecentActivity.Providers.GraphRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents a Graph API request.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    People.RecentActivity.Providers.SocialHttpRequest.call(this, method, uri, requestContext);
};

Jx.inherit(People.RecentActivity.Providers.GraphRequest, People.RecentActivity.Providers.SocialHttpRequest);

People.RecentActivity.Providers.GraphRequest.createAddFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a new feed object to the current feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext != null');
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject != null');
    Debug.assert(requestContext.feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'requestContext.FeedObject.Type == FeedObjectInfoType.Entry');
    var entryInfo = requestContext.feedObject.data;
    var contactId = requestContext.contactIdMap[People.RecentActivity.Core.NetworkId.facebook];
    var url = null;
    switch (entryInfo.type) {
        case People.RecentActivity.Core.FeedEntryInfoType.text:
        case People.RecentActivity.Core.FeedEntryInfoType.link:
        case People.RecentActivity.Core.FeedEntryInfoType.video:
            url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Platform.Configuration.instance.graphApiRootUrl, contactId.id + '/feed');
            break;
        default:
            Debug.assert(false, 'Unsupported FeedEntryInfoType: ' + entryInfo.type.toString());
            break;
    }

    People.RecentActivity.Providers.GraphRequest._addAuthQueryParam$1(url, requestContext);
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.graphPostActivity;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.graphPostActivity;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.publishStatus;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_PostShare;
    requestContext.apiId = InstruApiId.facebook_Graph_PostFeed;
    var request = new People.RecentActivity.Providers.GraphRequest(1, url, requestContext);
    request.addHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.body = requestContext.serializer.serialize(requestContext.feedObject, 13);
    return request;
};

People.RecentActivity.Providers.GraphRequest.createAddCommentRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a comment to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject');
    Debug.assert(requestContext.comment != null, 'requestContext.Comment');
    Debug.assert(requestContext.comment.text != null, 'requestContext.Comment.Text');
    var url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Platform.Configuration.instance.graphApiRootUrl, requestContext.feedObject.id + '/comments');
    url.addQueryParameter('message', requestContext.comment.text);
    People.RecentActivity.Providers.GraphRequest._addAuthQueryParam$1(url, requestContext);
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.graphPostComment;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.graphPostComment;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.writeActivityReactions;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_PostComment;
    requestContext.apiId = InstruApiId.facebook_Graph_PostComment;
    return new People.RecentActivity.Providers.GraphRequest(1, url, requestContext);
};

People.RecentActivity.Providers.GraphRequest.createAddReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a reaction to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject');
    Debug.assert(requestContext.reaction != null, 'requestContext.Reaction');
    var url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Platform.Configuration.instance.graphApiRootUrl, requestContext.feedObject.id + '/likes');
    People.RecentActivity.Providers.GraphRequest._addAuthQueryParam$1(url, requestContext);
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.graphPostLike;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.graphPostLike;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.writeActivityReactions;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_PostReaction;
    requestContext.apiId = InstruApiId.facebook_Graph_PostLike;
    requestContext.expectedResponseFormat = 2;
    return new People.RecentActivity.Providers.GraphRequest(1, url, requestContext);
};

People.RecentActivity.Providers.GraphRequest.createRemoveReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to remove a reaction from a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.feedObject != null, 'requestContext.FeedObject');
    Debug.assert(requestContext.reaction != null, 'requestContext.Reaction');
    var url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Platform.Configuration.instance.graphApiRootUrl, requestContext.feedObject.id + '/likes');
    People.RecentActivity.Providers.GraphRequest._addAuthQueryParam$1(url, requestContext);
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.graphDeleteLike;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.graphDeleteLike;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.writeActivityReactions;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_DeleteReaction;
    requestContext.apiId = InstruApiId.facebook_Graph_DeleteLike;
    return new People.RecentActivity.Providers.GraphRequest(2, url, requestContext);
};

People.RecentActivity.Providers.GraphRequest._addAuthQueryParam$1 = function(uri, requestContext) {
    /// <param name="uri" type="People.RecentActivity.Providers.Uri"></param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext"></param>
    Debug.assert(requestContext.authInfo != null, 'requestContext.AuthInfo');
    uri.addQueryParameter('access_token', requestContext.authInfo.token);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyApiCallNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyScenarioType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Uri.js" />
/// <reference path="RequestContext.js" />
/// <reference path="SocialHttpRequest.js" />

People.RecentActivity.Providers.LegacyRestRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents a FQL request.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_notificationsMarkReadPath$1" type="String" static="true"></field>
    /// <field name="_notificationIdsParameter$1" type="String" static="true"></field>
    People.RecentActivity.Providers.SocialHttpRequest.call(this, method, uri, requestContext);
};

Jx.inherit(People.RecentActivity.Providers.LegacyRestRequest, People.RecentActivity.Providers.SocialHttpRequest);


People.RecentActivity.Providers.LegacyRestRequest._notificationsMarkReadPath$1 = 'method/notifications.markRead';
People.RecentActivity.Providers.LegacyRestRequest._notificationIdsParameter$1 = 'notification_ids';

People.RecentActivity.Providers.LegacyRestRequest.createMarkNotificationsReadRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.notifications != null, 'requestContext.Notifications');
    Debug.assert(requestContext.notifications.length > 0, 'requestContext.Notifications.Length');
    var url = People.RecentActivity.Providers.LegacyRestRequest.getBaseUrl(requestContext, 'method/notifications.markRead');
    var notifications = requestContext.notifications;
    var notificationIds = new Array(notifications.length);
    for (var i = 0, len = notifications.length; i < len; i++) {
        notificationIds[i] = notifications[i].id;
    }

    url.addQueryParameter('notification_ids', notificationIds.join(','));
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.legacyApiMarkNotificationRead;
    requestContext.thirdPartyApiName = People.RecentActivity.Core.BiciThirdPartyApiCallNames.legacyApiMarkNotificationRead;
    requestContext.thirdPartyScenarioType = People.RecentActivity.Core.BiciThirdPartyScenarioType.writeNotifications;
    requestContext.propertyId = InstruPropertyId.facebook;
    requestContext.scenarioId = InstruScenarioId.modernPeople_MarkNotificationsRead;
    requestContext.apiId = InstruApiId.facebook_LegacyRest_MarkNotificationsRead;
    return new People.RecentActivity.Providers.LegacyRestRequest(0, url, requestContext);
};

People.RecentActivity.Providers.LegacyRestRequest.getBaseUrl = function(requestContext, methodPath) {
    /// <summary>
    ///     Gets the base url for FQL.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <param name="methodPath" type="String">The path of the method we intend to call.</param>
    /// <returns type="People.RecentActivity.Providers.Uri"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var uri = new People.RecentActivity.Providers.Uri(People.RecentActivity.Platform.Configuration.instance.legacyRestRootUrl, methodPath);
    var authInfo = requestContext.authInfo;
    Debug.assert(authInfo != null, 'authInfo');
    uri.addQueryParameter('access_token', authInfo.token);
    uri.addQueryParameter('format', 'json');
    return uri;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Helpers\CollectionHelper.js" />
/// <reference path="..\Helpers\SocialHelper.js" />
/// <reference path="..\Uri.js" />
/// <reference path="RequestContext.js" />
/// <reference path="SocialHttpRequest.js" />

People.RecentActivity.Providers.SupRequest = function(method, uri, requestContext) {
    /// <summary>
    ///     Represents a Sup request.
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_applicationId$1" type="String" static="true"></field>
    /// <field name="_replySegment$1" type="String" static="true"></field>
    /// <field name="_favoriteSegment$1" type="String" static="true"></field>
    /// <field name="_retweetSegment$1" type="String" static="true"></field>
    /// <field name="_reactionUrlSegment$1" type="String" static="true"></field>
    People.RecentActivity.Providers.SocialHttpRequest.call(this, method, uri, requestContext);
    var context = new Jx.TransactionContext(requestContext.scenarioId, 1033);
    var apiContext = context.getNextTransactionContext(InstruPropertyId.psa);
    this.addHeader('X-AppId', '484AAC02-7F59-41B7-9601-772045DCC569');
    this.addHeader('WLAuthToken', requestContext.authInfo.token);
    //this.addHeader('TransactionContext', apiContext.toBase64String());
};

Jx.inherit(People.RecentActivity.Providers.SupRequest, People.RecentActivity.Providers.SocialHttpRequest);


People.RecentActivity.Providers.SupRequest._applicationId$1 = '484AAC02-7F59-41B7-9601-772045DCC569';
People.RecentActivity.Providers.SupRequest._replySegment$1 = 'replies';
People.RecentActivity.Providers.SupRequest._favoriteSegment$1 = 'favorites';
People.RecentActivity.Providers.SupRequest._retweetSegment$1 = 'retweets';
People.RecentActivity.Providers.SupRequest._reactionUrlSegment$1 = 'feeds/reactions/{0}:{1}/{2}';

Object.defineProperty(People.RecentActivity.Providers.SupRequest, "_supApiRoot$1", {
    get: function() {
        /// <summary>
        ///     Gets the sup API root.
        /// </summary>
        /// <value type="String"></value>
        return People.RecentActivity.Platform.Configuration.instance.supApiRootUrl;
    }
});

People.RecentActivity.Providers.SupRequest.createGetFeedRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var contactIdMap = requestContext.contactIdMap;
    Debug.assert(requestContext.contactIdMap != null, 'requestContext.ContactIdMap');
    Debug.assert(Object.keys(requestContext.contactIdMap).length > 0, 'requestContext.ContactIdMap.Count');
    var contactId = contactIdMap[Object.keys(contactIdMap)[0]];
    var url;
    var queryParams = '&count=' + People.RecentActivity.Platform.Configuration.instance.feedEntriesBatchSize;
    var timeOffset = requestContext.feedTimeOffset;
    if (timeOffset > 0) {
        var timeStamp = new Date(requestContext.feedTimeOffset);
        queryParams += '&until=' + timeStamp.toISOString();
    }

    if (contactId.id === People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId) {
        url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Providers.SupRequest._supApiRoot$1, 'feeds/whatsnew?sourceids=' + People.RecentActivity.Providers.CollectionHelper.joinKeys(Object.keys(contactIdMap)) + queryParams);
        if (timeOffset === -1) {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetWhatsNewActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetWhatsNewActivities;
        }
        else {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetMoreWhatsNewActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetMoreWhatsNewActivities;
        }

        requestContext.apiId = InstruApiId.psa_SN_ActivityStreamAPI_WhatsNew;
    }
    else {
        url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Providers.SupRequest._supApiRoot$1, 'feeds/recentactivity?ids=' + People.RecentActivity.Providers.SocialHelper.joinSourceIdsAndContactIds(contactIdMap) + queryParams);
        if (timeOffset === -1) {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetRecentActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetRecentActivities;
        }
        else {
            requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetMoreRecentActivities;
            requestContext.scenarioId = InstruScenarioId.modernPeople_GetMoreRecentActivities;
        }

        requestContext.apiId = InstruApiId.psa_SN_ActivityStreamAPI_RecentActivity;
    }

    requestContext.propertyId = InstruPropertyId.psa;
    return new People.RecentActivity.Providers.SupRequest(0, url, requestContext);
};

People.RecentActivity.Providers.SupRequest.createGetFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get a feed object.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var obj = requestContext.feedObject;
    Debug.assert(obj != null, 'obj');
    Debug.assert(Jx.isNonEmptyString(obj.id), 'obj.Id');
    Debug.assert(Jx.isNonEmptyString(obj.sourceId), 'obj.SourceId');
    var url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Providers.SupRequest._supApiRoot$1, People.Social.format('feeds/activities/{0}:{1}', obj.sourceId, obj.id));
    requestContext.expectedResponse = 1;
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetActivity;
    requestContext.propertyId = InstruPropertyId.psa;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetActivity;
    requestContext.apiId = InstruApiId.psa_SN_ActivityStreamAPI_RecentActivity;
    return new People.RecentActivity.Providers.SupRequest(0, url, requestContext);
};

People.RecentActivity.Providers.SupRequest.createGetCommentsRequest = function(requestContext) {
    /// <summary>
    ///     Create a request to get comments for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var obj = requestContext.feedObject;
    Debug.assert(obj != null, 'obj');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetAtReplies;
    requestContext.propertyId = InstruPropertyId.psa;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetReactions;
    requestContext.apiId = InstruApiId.psa_SN_ReactionsAPI_Replies_Get;
    return new People.RecentActivity.Providers.SupRequest(0, People.RecentActivity.Providers.SupRequest._getReactionsUrl$1(obj, 'replies'), requestContext);
};

People.RecentActivity.Providers.SupRequest.createGetReactionsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get reactions for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var obj = requestContext.feedObject;
    Debug.assert(obj != null, 'obj');
    var reactionType = requestContext.reactionType;
    Debug.assert(reactionType !== People.RecentActivity.Core.NetworkReactionInfoType.none, 'reactionType');
    var reactionSegment = People.RecentActivity.Providers.SupRequest._getReactionSegment$1(reactionType);
    Debug.assert(reactionSegment != null, 'reactionSegment');
    requestContext.propertyId = InstruPropertyId.psa;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetReactions;
    if (reactionType === People.RecentActivity.Core.NetworkReactionInfoType.retweet) {
        requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetRetweets;
        requestContext.apiId = InstruApiId.psa_SN_ReactionsAPI_Retweets_Get;
    }
    else if (reactionType === People.RecentActivity.Core.NetworkReactionInfoType.favorite) {
        requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetFavorite;
        requestContext.apiId = InstruApiId.psa_SN_ReactionsAPI_Favorites_Get;
    }

    return new People.RecentActivity.Providers.SupRequest(0, People.RecentActivity.Providers.SupRequest._getReactionsUrl$1(obj, reactionSegment), requestContext);
};

People.RecentActivity.Providers.SupRequest.createAddCommentRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a comment to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var obj = requestContext.feedObject;
    Debug.assert(obj != null, 'obj');
    var comment = requestContext.comment;
    Debug.assert(comment != null, 'comment');
    Debug.assert(Jx.isNonEmptyString(comment.text), 'comment.Text');
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supPostAtReply;
    requestContext.propertyId = InstruPropertyId.psa;
    requestContext.scenarioId = InstruScenarioId.modernPeople_PostReaction;
    requestContext.apiId = InstruApiId.psa_SN_ReactionsAPI_Replies_Post;
    var request = new People.RecentActivity.Providers.SupRequest(1, People.RecentActivity.Providers.SupRequest._getReactionsUrl$1(obj, 'replies'), requestContext);
    request.body = comment.text;
    return request;
};

People.RecentActivity.Providers.SupRequest.createAddReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a reaction to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    var obj = requestContext.feedObject;
    Debug.assert(obj != null, 'obj');
    var reaction = requestContext.reaction;
    Debug.assert(reaction != null, 'reaction');
    var reactionSegment = People.RecentActivity.Providers.SupRequest._getReactionSegment$1(reaction.type.type);
    Debug.assert(reactionSegment != null, 'reactionSegment');
    requestContext.propertyId = InstruPropertyId.psa;
    requestContext.scenarioId = InstruScenarioId.modernPeople_PostReaction;
    if (reaction.type.type === People.RecentActivity.Core.NetworkReactionInfoType.retweet) {
        requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supPostRetweet;
        requestContext.apiId = InstruApiId.psa_SN_ReactionsAPI_Retweets_Post;
    }
    else if (reaction.type.type === People.RecentActivity.Core.NetworkReactionInfoType.favorite) {
        requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supPostFavorite;
        requestContext.apiId = InstruApiId.psa_SN_ReactionsAPI_Favorites_Post;
        requestContext.expectedResponseFormat = 0;
    }

    return new People.RecentActivity.Providers.SupRequest(1, People.RecentActivity.Providers.SupRequest._getReactionsUrl$1(obj, reactionSegment), requestContext);
};

People.RecentActivity.Providers.SupRequest.createRemoveReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to remove a reaction from a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');

    var obj = requestContext.feedObject;
    Debug.assert(obj != null, 'obj');

    var reaction = requestContext.reaction;
    Debug.assert(reaction != null, 'reaction');

    var reactionType = reaction.type.type;
    if (reactionType === People.RecentActivity.Core.NetworkReactionInfoType.retweet) {
        // removing retweets is not supported, so we can't create a request for this.
        return null;
    }

    var reactionSegment = People.RecentActivity.Providers.SupRequest._getReactionSegment$1(reactionType);
    Debug.assert(reactionSegment != null, 'reactionSegment');

    requestContext.propertyId = InstruPropertyId.psa;
    requestContext.scenarioId = InstruScenarioId.modernPeople_DeleteReaction;

    if (reactionType === People.RecentActivity.Core.NetworkReactionInfoType.retweet) {
        requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supDeleteRetweet;
    }
    else if (reactionType === People.RecentActivity.Core.NetworkReactionInfoType.favorite) {
        requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supDeleteFavorite;
        requestContext.apiId = InstruApiId.psa_SN_ReactionsAPI_Favorites_Delete;
    }

    return new People.RecentActivity.Providers.SupRequest(2, People.RecentActivity.Providers.SupRequest._getReactionsUrl$1(obj, reactionSegment), requestContext);
};

People.RecentActivity.Providers.SupRequest.createRefreshNotificationsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get notifications for the user.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    Debug.assert(requestContext != null, 'requestContext');
    Debug.assert(requestContext.authInfo != null, 'requestContext.AuthInfo');
    var url = new People.RecentActivity.Providers.Uri(People.RecentActivity.Providers.SupRequest._supApiRoot$1, People.Social.format('feeds/notifications?sourceids={0}', requestContext.authInfo.userId.sourceId));
    requestContext.expectedResponse = 6;
    requestContext.liveCommApiName = People.RecentActivity.Core.BiciLiveCommApiNames.supGetNotifications;
    requestContext.propertyId = InstruPropertyId.psa;
    requestContext.scenarioId = InstruScenarioId.modernPeople_GetNotifications;
    requestContext.apiId = InstruApiId.psa_SN_ActivityStreamAPI_Notifications;
    return new People.RecentActivity.Providers.SupRequest(0, url, requestContext);
};

People.RecentActivity.Providers.SupRequest._getReactionsUrl$1 = function(obj, reactionSegment) {
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="reactionSegment" type="String"></param>
    /// <returns type="People.RecentActivity.Providers.Uri"></returns>
    return new People.RecentActivity.Providers.Uri(People.RecentActivity.Providers.SupRequest._supApiRoot$1, People.Social.format('feeds/reactions/{0}:{1}/{2}', obj.sourceId, obj.id, reactionSegment));
};

People.RecentActivity.Providers.SupRequest._getReactionSegment$1 = function(type) {
    /// <param name="type" type="People.RecentActivity.Core.NetworkReactionInfoType"></param>
    /// <returns type="String"></returns>
    switch (type) {
        case People.RecentActivity.Core.NetworkReactionInfoType.retweet:
            return 'retweets';
        case People.RecentActivity.Core.NetworkReactionInfoType.favorite:
            return 'favorites';
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\BICI\BiciLiveCommApiNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyApiCallNames.js" />
/// <reference path="..\..\Core\BICI\BiciThirdPartyScenarioType.js" />
/// <reference path="..\..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\Platform\AuthInfo.js" />

People.RecentActivity.Providers.RequestContext = function(authInfo, contactIdMap, serializer) {
    /// <summary>
    ///     Encapsulates context information needed for a request.
    /// </summary>
    /// <param name="authInfo" type="People.RecentActivity.Platform.AuthInfo"></param>
    /// <param name="contactIdMap" type="Object"></param>
    /// <param name="serializer" type="People.RecentActivity.Providers.ISerializer"></param>
    /// <field name="_authInfo" type="People.RecentActivity.Platform.AuthInfo"></field>
    /// <field name="_contactIdMap" type="Object"></field>
    /// <field name="_serializer" type="People.RecentActivity.Providers.ISerializer"></field>
    /// <field name="_feedObject" type="People.RecentActivity.Core.create_feedObjectInfo"></field>
    /// <field name="_comment" type="People.RecentActivity.Core.create_commentInfo"></field>
    /// <field name="_reaction" type="People.RecentActivity.Core.create_reactionInfo"></field>
    /// <field name="_reactionType" type="People.RecentActivity.Core.NetworkReactionInfoType"></field>
    /// <field name="_notifications" type="Array" elementType="notificationInfo"></field>
    /// <field name="_expectedResponse" type="People.RecentActivity.Providers.KnownType"></field>
    /// <field name="_expectedResponseFormat" type="People.RecentActivity.Providers.ResponseFormat"></field>
    /// <field name="_feedTimeOffset" type="Number" integer="true"></field>
    /// <field name="_userState" type="Object"></field>
    /// <field name="_requestState" type="Object"></field>
    /// <field name="_startTime" type="Date"></field>
    /// <field name="_thirdPartyApiName" type="People.RecentActivity.Core.BiciThirdPartyApiCallNames"></field>
    /// <field name="_thirdPartyScenarioType" type="People.RecentActivity.Core.BiciThirdPartyScenarioType"></field>
    /// <field name="_liveCommApiName" type="People.RecentActivity.Core.BiciLiveCommApiNames"></field>
    /// <field name="_propertyId" type="Microsoft.WindowsLive.Instrumentation.PropertyId"></field>
    /// <field name="_scenarioId" type="Microsoft.WindowsLive.Instrumentation.ScenarioId"></field>
    /// <field name="_apiId" type="Microsoft.WindowsLive.Instrumentation.ApiId"></field>
    /// <field name="_errorType" type="Microsoft.WindowsLive.Instrumentation.ErrorType"></field>
    /// <field name="_errorCode" type="Number" integer="true"></field>
    /// <field name="_requestSizeInBytes" type="Number" integer="true"></field>
    /// <field name="_scenarioSizeInBytes" type="Number" integer="true"></field>
    /// <field name="_scenarioComplete" type="Boolean"></field>
    /// <field name="_scenarioDuration" type="Number" integer="true"></field>
    /// <field name="_isAggregated" type="Boolean"></field>
    /// <field name="_numEntriesReceived" type="Boolean"></field>
    this._feedTimeOffset = -1;
    this._startTime = new Date();
    Debug.assert(authInfo != null, 'authInfo');
    Debug.assert(serializer != null, 'serializer');
    this._authInfo = authInfo;
    this._contactIdMap = contactIdMap;
    this._serializer = serializer;
    this._expectedResponseFormat = 1;
    this._propertyId = InstruPropertyId.unknown;
    this._scenarioId = InstruScenarioId.unknown;
    this._apiId = InstruApiId.unknown;
    this._errorType = InstruErrorType.success;
    this._scenarioComplete = true;
};


People.RecentActivity.Providers.RequestContext.prototype._authInfo = null;
People.RecentActivity.Providers.RequestContext.prototype._contactIdMap = null;
People.RecentActivity.Providers.RequestContext.prototype._serializer = null;
People.RecentActivity.Providers.RequestContext.prototype._feedObject = null;
People.RecentActivity.Providers.RequestContext.prototype._comment = null;
People.RecentActivity.Providers.RequestContext.prototype._reaction = null;
People.RecentActivity.Providers.RequestContext.prototype._reactionType = 0;
People.RecentActivity.Providers.RequestContext.prototype._notifications = null;
People.RecentActivity.Providers.RequestContext.prototype._expectedResponse = 0;
People.RecentActivity.Providers.RequestContext.prototype._expectedResponseFormat = 0;
People.RecentActivity.Providers.RequestContext.prototype._userState = null;
People.RecentActivity.Providers.RequestContext.prototype._requestState = null;
People.RecentActivity.Providers.RequestContext.prototype._thirdPartyApiName = 0;
People.RecentActivity.Providers.RequestContext.prototype._thirdPartyScenarioType = 0;
People.RecentActivity.Providers.RequestContext.prototype._liveCommApiName = 0;
People.RecentActivity.Providers.RequestContext.prototype._propertyId = 0;
People.RecentActivity.Providers.RequestContext.prototype._scenarioId = 0;
People.RecentActivity.Providers.RequestContext.prototype._apiId = 0;
People.RecentActivity.Providers.RequestContext.prototype._errorType = 0;
People.RecentActivity.Providers.RequestContext.prototype._errorCode = 0;
People.RecentActivity.Providers.RequestContext.prototype._requestSizeInBytes = 0;
People.RecentActivity.Providers.RequestContext.prototype._scenarioSizeInBytes = 0;
People.RecentActivity.Providers.RequestContext.prototype._scenarioComplete = false;
People.RecentActivity.Providers.RequestContext.prototype._scenarioDuration = 0;
People.RecentActivity.Providers.RequestContext.prototype._isAggregated = false;
People.RecentActivity.Providers.RequestContext.prototype._numEntriesReceived = 0;

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "authInfo", {
    get: function() {
        /// <summary>
        ///     Gets the auth info for the signed in user.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.AuthInfo"></value>
        return this._authInfo;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "contactIdMap", {
    get: function() {
        /// <summary>
        ///     Gets or sets the contact id map.
        /// </summary>
        /// <value type="Object"></value>
        return this._contactIdMap;
    },
    set: function(value) {
        this._contactIdMap = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "serializer", {
    get: function() {
        /// <summary>
        ///     Gets the serializer.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.ISerializer"></value>
        return this._serializer;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "expectedResponse", {
    get: function() {
        /// <summary>
        ///     Gets or sets the expected response type.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.KnownType"></value>
        return this._expectedResponse;
    },
    set: function(value) {
        this._expectedResponse = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "expectedResponseFormat", {
    get: function() {
        /// <summary>
        ///     Gets or sets the expected response format.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.ResponseFormat"></value>
        return this._expectedResponseFormat;
    },
    set: function(value) {
        this._expectedResponseFormat = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "feedObject", {
    get: function() {
        /// <summary>
        ///     Gets or sets the feed object.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_feedObjectInfo"></value>
        return this._feedObject;
    },
    set: function(value) {
        this._feedObject = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "comment", {
    get: function() {
        /// <summary>
        ///     Gets or sets the comment.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_commentInfo"></value>
        return this._comment;
    },
    set: function(value) {
        this._comment = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "reaction", {
    get: function() {
        /// <summary>
        ///     Gets or sets the reaction.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_reactionInfo"></value>
        return this._reaction;
    },
    set: function(value) {
        this._reaction = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "reactionType", {
    get: function() {
        /// <summary>
        ///     Gets or sets the type of the reaction for refreshing reactions.
        /// </summary>
        /// <value type="People.RecentActivity.Core.NetworkReactionInfoType"></value>
        return this._reactionType;
    },
    set: function(value) {
        this._reactionType = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "feedTimeOffset", {
    get: function() {
        /// <summary>
        ///     Gets or sets the feed time offset used to retrieve more feed entries.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._feedTimeOffset;
    },
    set: function(value) {
        this._feedTimeOffset = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "notifications", {
    get: function() {
        /// <summary>
        ///     Gets or sets the notifications.
        /// </summary>
        /// <value type="Array" elementType="notificationInfo"></value>
        return this._notifications;
    },
    set: function(value) {
        this._notifications = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "userState", {
    get: function() {
        /// <summary>
        ///     Gets or sets the user state.
        /// </summary>
        /// <value type="Object"></value>
        return this._userState;
    },
    set: function(value) {
        this._userState = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "requestState", {
    get: function() {
        /// <summary>
        ///     Gets or sets the request state you want to keep across requests.
        /// </summary>
        /// <value type="Object"></value>
        return this._requestState;
    },
    set: function(value) {
        this._requestState = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "startTime", {
    get: function() {
        /// <summary>
        ///     Gets or sets the request start time.
        /// </summary>
        /// <value type="Date"></value>
        return this._startTime;
    },
    set: function(value) {
        this._startTime = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "thirdPartyApiName", {
    get: function() {
        /// <summary>
        ///     Gets or sets the name of the third party API for quota tracking purpose.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciThirdPartyApiCallNames"></value>
        return this._thirdPartyApiName;
    },
    set: function(value) {
        this._thirdPartyApiName = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "thirdPartyScenarioType", {
    get: function() {
        /// <summary>
        ///     Gets or sets the type of the third party scenario for quota tracking purposes.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciThirdPartyScenarioType"></value>
        return this._thirdPartyScenarioType;
    },
    set: function(value) {
        this._thirdPartyScenarioType = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "liveCommApiName", {
    get: function() {
        /// <summary>
        ///     Gets or sets the name of the http request for QoS reporting purpose.
        /// </summary>
        /// <value type="People.RecentActivity.Core.BiciLiveCommApiNames"></value>
        return this._liveCommApiName;
    },
    set: function(value) {
        this._liveCommApiName = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "propertyId", {
    get: function() {
        /// <summary>
        ///     Gets or sets the property ID for Metron reporting purposes.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Instrumentation.PropertyId"></value>
        return this._propertyId;
    },
    set: function(value) {
        this._propertyId = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "scenarioId", {
    get: function() {
        /// <summary>
        ///     Gets or sets the scenario ID for Metron reporting purposes.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Instrumentation.ScenarioId"></value>
        return this._scenarioId;
    },
    set: function(value) {
        this._scenarioId = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "apiId", {
    get: function() {
        /// <summary>
        ///     Gets or sets the API ID for Metron reporting purposes.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Instrumentation.ApiId"></value>
        return this._apiId;
    },
    set: function(value) {
        this._apiId = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "errorType", {
    get: function() {
        /// <summary>
        ///     Gets or sets the error type for Metron reporting purposes.
        /// </summary>
        /// <value type="Microsoft.WindowsLive.Instrumentation.ErrorType"></value>
        return this._errorType;
    },
    set: function(value) {
        this._errorType = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "errorCode", {
    get: function() {
        /// <summary>
        ///     Gets or sets the error code.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._errorCode;
    },
    set: function(value) {
        this._errorCode = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "requestSizeInBytes", {
    get: function() {
        /// <summary>
        ///     Gets or sets the request size.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._requestSizeInBytes;
    },
    set: function(value) {
        this._requestSizeInBytes = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "scenarioSizeInBytes", {
    get: function() {
        /// <summary>
        ///     Gets or sets the scenario size.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._scenarioSizeInBytes;
    },
    set: function(value) {
        this._scenarioSizeInBytes = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "scenarioComplete", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the scenario is complete.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._scenarioComplete;
    },
    set: function(value) {
        this._scenarioComplete = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "scenarioDuration", {
    get: function() {
        /// <summary>
        ///     Gets or sets the duration of the scenario.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._scenarioDuration;
    },
    set: function(value) {
        this._scenarioDuration = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "isAggregated", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the request is used during aggregation.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isAggregated;
    },
    set: function(value) {
        this._isAggregated = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.RequestContext.prototype, "numEntriesReceived", {
    get: function () {
        /// <summary>
        ///     Gets the number of entries received during the request.
        /// </summary>
        /// <returns type="Number"></returns>
        return this._numEntriesReceived;
    },
    set: function (value) {
        /// <summary>
        ///     Sets the number of entries received during the request.
        /// </summary>
        /// <param name="value" type="Number"></param>
        this._numEntriesReceived = value;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Uri.js" />
/// <reference path="HttpResponse.js" />

People.RecentActivity.Providers.HttpRequest = function(method, uri) {
    /// <summary>
    ///     Provides a simply wrapper around <see cref="T:System.Net.XmlHttpRequest" />
    /// </summary>
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod">The method.</param>
    /// <param name="uri" type="People.RecentActivity.Providers.Uri">The URI.</param>
    /// <field name="_request" type="XMLHttpRequest">The request.</field>
    /// <field name="_executing" type="Boolean">Whether the request is being executed.</field>
    /// <field name="_body" type="String">The request body.</field>
    /// <field name="_callback" type="Function">The callback.</field>
    /// <field name="_userState" type="Object">The user state.</field>
    Debug.assert(uri != null, 'uri');
    this._request = new XMLHttpRequest();
    this._request.open(this._getMethod(method), uri.toString(), true);
};


People.RecentActivity.Providers.HttpRequest.prototype._request = null;
People.RecentActivity.Providers.HttpRequest.prototype._executing = false;
People.RecentActivity.Providers.HttpRequest.prototype._body = null;
People.RecentActivity.Providers.HttpRequest.prototype._callback = null;
People.RecentActivity.Providers.HttpRequest.prototype._userState = null;

Object.defineProperty(People.RecentActivity.Providers.HttpRequest.prototype, "body", {
    get: function() {
        /// <summary>
        ///     Gets or sets the request body.
        /// </summary>
        /// <value type="String"></value>
        return this._body;
    },
    set: function(value) {
        this._body = value;
    }
});

People.RecentActivity.Providers.HttpRequest.prototype.addHeader = function(name, value) {
    /// <summary>
    ///     Adds a header.
    /// </summary>
    /// <param name="name" type="String">The name of the header.</param>
    /// <param name="value" type="String">The value of the header.</param>
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    Debug.assert(value != null, 'value');
    this._request.setRequestHeader(name, value);
};

People.RecentActivity.Providers.HttpRequest.prototype.execute = function(callback, userState) {
    /// <summary>
    ///     Executes the request.
    /// </summary>
    /// <param name="callback" type="Function">The callback.</param>
    /// <param name="userState" type="Object">The user state passed to <see cref="T:People.RecentActivity.Providers.HttpResponse" />.</param>
    if (!this._executing) {
        this._executing = true;
        this._callback = callback;
        this._userState = userState;
        this._request.onreadystatechange = this._onReadyStateChanged.bind(this);
        this._request.send(this._body);
    }
};

People.RecentActivity.Providers.HttpRequest.prototype._getMethod = function(method) {
    /// <param name="method" type="People.RecentActivity.Providers.HttpMethod"></param>
    /// <returns type="String"></returns>
    switch (method) {
        case 2:
            return 'DELETE';
        case 0:
            return 'GET';
        case 1:
            return 'POST';
    }

    Debug.assert(false, 'Unknown HTTP method: ' + method);
    return 'GET';
};

People.RecentActivity.Providers.HttpRequest.prototype._onReadyStateChanged = function() {
    if (this._request.readyState === 4) {
        // we're done, extract the information.
        if (this._callback != null) {
            this._callback(new People.RecentActivity.Providers.HttpResponse(this._request.status, this._request.getAllResponseHeaders(), this._request.responseText, this._request.responseXML, this._userState));
        }

        this._callback = null;
        this._request.onreadystatechange = null;
        this._request = null;
        this._executing = false;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="HttpResponseHeaders.js" />

People.RecentActivity.Providers.HttpResponse = function(status, headers, body, document, userState) {
    /// <summary>
    ///     Provides a HTTP response.
    /// </summary>
    /// <param name="status" type="People.RecentActivity.Providers.HttpStatusCode">The status.</param>
    /// <param name="headers" type="String">The headers.</param>
    /// <param name="body" type="String">The body.</param>
    /// <param name="document" type="XmlDocument">The document.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_status" type="People.RecentActivity.Providers.HttpStatusCode">The status.</field>
    /// <field name="_body" type="String">The body.</field>
    /// <field name="_headers" type="People.RecentActivity.Providers.HttpResponseHeaders">The headers.</field>
    /// <field name="_document" type="XmlDocument">The document.</field>
    /// <field name="_userState" type="Object">The user state passed from HttpRequest.</field>
    Debug.assert(headers != null, 'headers');
    Debug.assert(body != null, 'body');
    this._status = status;
    this._headers = new People.RecentActivity.Providers.HttpResponseHeaders(headers);
    this._body = body;
    this._document = document;
    this._userState = userState;
};


People.RecentActivity.Providers.HttpResponse.prototype._status = 0;
People.RecentActivity.Providers.HttpResponse.prototype._body = null;
People.RecentActivity.Providers.HttpResponse.prototype._headers = null;
People.RecentActivity.Providers.HttpResponse.prototype._document = null;
People.RecentActivity.Providers.HttpResponse.prototype._userState = null;

Object.defineProperty(People.RecentActivity.Providers.HttpResponse.prototype, "status", {
    get: function() {
        /// <summary>
        ///     Gets the status.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.HttpStatusCode"></value>
        return this._status;
    }
});

Object.defineProperty(People.RecentActivity.Providers.HttpResponse.prototype, "headers", {
    get: function() {
        /// <summary>
        ///     Gets the headers.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.HttpResponseHeaders"></value>
        return this._headers;
    }
});

Object.defineProperty(People.RecentActivity.Providers.HttpResponse.prototype, "body", {
    get: function() {
        /// <summary>
        ///     Gets the response body.
        /// </summary>
        /// <value type="String"></value>
        return this._body;
    }
});

Object.defineProperty(People.RecentActivity.Providers.HttpResponse.prototype, "document", {
    get: function() {
        /// <summary>
        ///     Gets the response body as an <see cref="T:System.Xml.XmlDocument" />.
        /// </summary>
        /// <value type="XmlDocument"></value>
        return this._document;
    }
});

Object.defineProperty(People.RecentActivity.Providers.HttpResponse.prototype, "userState", {
    get: function() {
        /// <summary>
        ///     Gets or sets the user state passed from HttpRequest.
        /// </summary>
        /// <value type="Object"></value>
        return this._userState;
    },
    set: function(value) {
        this._userState = value;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\Http\HttpResponse.js" />
/// <reference path="..\Http\HttpResponseHeaders.js" />
/// <reference path="..\Requests\RequestContext.js" />

People.RecentActivity.Providers.SocialHttpResponse = function(resultInfo, data, error, httpResponse, requestContext) {
    /// <summary>
    ///     Represents the response from social networks.
    /// </summary>
    /// <param name="resultInfo" type="People.RecentActivity.Core.ResultInfo">The result info.</param>
    /// <param name="data" type="Object">The deserialized data from response if applicable.</param>
    /// <param name="error" type="Object">The deserialized error from response if applicable.</param>
    /// <param name="httpResponse" type="People.RecentActivity.Providers.HttpResponse">The http response.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_httpResponse" type="People.RecentActivity.Providers.HttpResponse"></field>
    /// <field name="_requextContext" type="People.RecentActivity.Providers.RequestContext"></field>
    /// <field name="_resultInfo" type="People.RecentActivity.Core.ResultInfo"></field>
    /// <field name="_data" type="Object"></field>
    /// <field name="_error" type="Object"></field>
    /// <field name="_subErrorCode" type="Number" integer="true"></field>
    Debug.assert(resultInfo != null, 'resultInfo');
    Debug.assert(requestContext != null, 'requestContext');
    this._resultInfo = resultInfo;
    this._data = data;
    this._error = error;
    this._httpResponse = httpResponse;
    this._requextContext = requestContext;
};


People.RecentActivity.Providers.SocialHttpResponse.prototype._httpResponse = null;
People.RecentActivity.Providers.SocialHttpResponse.prototype._requextContext = null;
People.RecentActivity.Providers.SocialHttpResponse.prototype._resultInfo = null;
People.RecentActivity.Providers.SocialHttpResponse.prototype._data = null;
People.RecentActivity.Providers.SocialHttpResponse.prototype._error = null;
People.RecentActivity.Providers.SocialHttpResponse.prototype._subErrorCode = 0;

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "success", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this <see cref="T:People.RecentActivity.Providers.SocialHttpResponse" /> is success.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._resultInfo.code === People.RecentActivity.Core.ResultCode.success;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "resultInfo", {
    get: function() {
        /// <summary>
        ///     Gets or sets the result info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.ResultInfo"></value>
        return this._resultInfo;
    },
    set: function(value) {
        this._resultInfo = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "error", {
    get: function() {
        /// <summary>
        ///     Gets or sets the error object if applicable.
        /// </summary>
        /// <value type="Object"></value>
        return this._error;
    },
    set: function(value) {
        this._error = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "subErrorCode", {
    get: function() {
        /// <summary>
        ///     Gets or sets the sub error code.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._subErrorCode;
    },
    set: function(value) {
        this._subErrorCode = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "data", {
    get: function() {
        /// <summary>
        ///     Gets or sets the deserialized data if applicable.
        /// </summary>
        /// <value type="Object"></value>
        return this._data;
    },
    set: function(value) {
        this._data = value;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "status", {
    get: function() {
        /// <summary>
        ///     Gets the status.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.HttpStatusCode"></value>
        return this._httpResponse.status;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "headers", {
    get: function() {
        /// <summary>
        ///     Gets the headers.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.HttpResponseHeaders"></value>
        return this._httpResponse.headers;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "body", {
    get: function() {
        /// <summary>
        ///     Gets the response body.
        /// </summary>
        /// <value type="String"></value>
        return this._httpResponse.body;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "document", {
    get: function() {
        /// <summary>
        ///     Gets the response body as an <see cref="T:System.Xml.XmlDocument" />.
        /// </summary>
        /// <value type="XmlDocument"></value>
        return this._httpResponse.document;
    }
});

Object.defineProperty(People.RecentActivity.Providers.SocialHttpResponse.prototype, "requestContext", {
    get: function() {
        /// <summary>
        ///     Gets the request context.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.RequestContext"></value>
        return this._requextContext;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\CommentInfo.js" />
/// <reference path="..\RetailModeHelper.js" />

People.RecentActivity.Providers.CommentNodeHandler = function() {
    /// <summary>
    ///     Represents a node handler to handle Comment tag.
    /// </summary>
};

People.RecentActivity.Providers.CommentNodeHandler.prototype.process = function(node, context) {
    /// <summary>
    ///     Processes the node.
    /// </summary>
    /// <param name="node" type="Windows.Data.Xml.Dom.IXmlNode">The node.</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(node != null, 'node');
    Debug.assert(context != null, 'context');
    var comment = node;
    var authorId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(comment, 'Author');
    if (authorId == null) {
        return null;
    }

    var text = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(comment, 'Text');
    if (text == null) {
        return null;
    }

    return People.RecentActivity.Core.create_commentInfo(context.parentObjectId + '_' + context.index, People.RecentActivity.Providers.RetailModeHelper.createContactInfo(authorId, context.contactId.sourceId), People.RecentActivity.Providers.RetailModeHelper.getTimestamp(comment), text, new Array(0));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Platform\ContactId.js" />
/// <reference path="..\..\Cache\AlbumCache.js" />
/// <reference path="..\..\Cache\ContactDataCache.js" />
/// <reference path="..\..\Cache\FeedCache.js" />
/// <reference path="..\..\Cache\FeedObjectCache.js" />
/// <reference path="..\NodeHandlerLookup.js" />
/// <reference path="..\RetailModeHelper.js" />

People.RecentActivity.Providers.ContactNodeHandler = function() {
    /// <summary>
    ///     Represents a node handler to handle Contact node.
    /// </summary>
    /// <field name="_albumsTag" type="String" static="true">The albums tag.</field>
    /// <field name="_feedTag" type="String" static="true">The feed tag.</field>
};


People.RecentActivity.Providers.ContactNodeHandler._albumsTag = 'Albums';
People.RecentActivity.Providers.ContactNodeHandler._feedTag = 'Feed';

People.RecentActivity.Providers.ContactNodeHandler.prototype.process = function (node, context) {
    /// <summary>
    ///     Processes the node.
    /// </summary>
    /// <param name="node" type="Windows.Data.Xml.Dom.IXmlNode">The node.</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(node != null, 'node');
    Debug.assert(context != null, 'context');
    var contact = node;
    var contactId = this._getContactId(contact);
    if (contactId == null) {
        return null;
    }

    Jx.log.write(4, People.Social.format('Processing contact {0}:{1}...', contactId.sourceId, contactId.id));
    context.contactId = contactId;
    // Clears maps for old contact.
    People.Social.clearKeys(context.albumMap);
    People.Social.clearKeys(context.photoMap);
    // Process albums
    this._populateContactDataCache(contact, 'Albums', context, People.RecentActivity.Providers.AlbumCache.getInstance(context.userIdentity), People.RecentActivity.Providers.FeedObjectCache.getInstance(context.userIdentity));
    // Process feed entries
    return this._populateContactDataCache(contact, 'Feed', context, People.RecentActivity.Providers.FeedCache.getInstance(context.userIdentity), People.RecentActivity.Providers.FeedObjectCache.getInstance(context.userIdentity));
};

People.RecentActivity.Providers.ContactNodeHandler.prototype._getContactId = function(contact) {
    /// <param name="contact" type="Windows.Data.Xml.Dom.XmlElement"></param>
    /// <returns type="People.RecentActivity.Platform.ContactId"></returns>
    var contactId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(contact, 'ObjectId');
    var sourceId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(contact, 'SourceId');
    if (contactId == null || sourceId == null) {
        return null;
    }

    return new People.RecentActivity.Platform.ContactId(contactId, sourceId);
};

People.RecentActivity.Providers.ContactNodeHandler.prototype._populateContactDataCache = function(contact, tag, context, cache, objCache) {
    /// <param name="contact" type="Windows.Data.Xml.Dom.XmlElement"></param>
    /// <param name="tag" type="String"></param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <param name="cache" type="People.RecentActivity.Providers.ContactDataCache"></param>
    /// <param name="objCache" type="People.RecentActivity.Providers.FeedObjectCache"></param>
    /// <returns type="Array" elementType="feedObjectInfo"></returns>
    var node = contact.selectSingleNode(tag);
    if (node == null) {
        return null;
    }

    var objs = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item(tag).process(node, context);
    if (objs == null || !objs.length) {
        return null;
    }

    // Ensure that every feed object is in the feed object cache.
    for (var n = 0; n < objs.length; n++) {
        var obj = objs[n];
        objCache.addFeedObject(obj);
    }

    // Sort the feed objects and add them to the contact's cache.
    objs.sort(People.RecentActivity.Providers.RetailModeHelper.feedObjectSorter);
    cache.addCacheEntry(context.contactId, objs);
    // Return the objects for What's New feed aggregation.
    return objs;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\NodeHandlerLookup.js" />

People.RecentActivity.Providers.EnumerableNodeHandler = function(childTag) {
    /// <summary>
    ///     Represents a node handler to handle a enumerable node.
    /// </summary>
    /// <param name="childTag" type="String">The childTag to enumerate.</param>
    /// <field name="_childTag" type="String">The child tag.</field>
    Debug.assert(Jx.isNonEmptyString(childTag), 'childTag');
    this._childTag = childTag;
};


People.RecentActivity.Providers.EnumerableNodeHandler.prototype._childTag = null;

Object.defineProperty(People.RecentActivity.Providers.EnumerableNodeHandler.prototype, "childTag", {
    get: function() {
        /// <summary>
        ///     Gets the tag.
        /// </summary>
        /// <value type="String"></value>
        return this._childTag;
    }
});

People.RecentActivity.Providers.EnumerableNodeHandler.prototype.process = function(node, context) {
    /// <summary>
    ///     Processes the node.
    /// </summary>
    /// <param name="node" type="Windows.Data.Xml.Dom.IXmlNode">The node.</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(node != null, 'node');
    var element = node;
    var subNodes = element.selectNodes(this._childTag);
    if (subNodes == null || !subNodes.size) {
        Jx.log.write(3, People.Social.format('No {0} tags found!', this._childTag));
        return null;
    }

    return this.onProcess(subNodes, context);
};

People.RecentActivity.Providers.EnumerableNodeHandler.prototype.onProcess = function(nodes, context) {
    /// <summary>
    ///     Called when on process.
    /// </summary>
    /// <param name="nodes" type="Windows.Data.Xml.Dom.XmlNodeList">The nodes to enumerate</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(nodes != null, 'nodes');
    var objects = [];
    for (var i = 0, len = nodes.size; i < len; i++) {
        context.index = i;
        var node = nodes.getAt(i);
        var data = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item(this._childTag).process(node, context);
        if (data != null) {
            objects.push(data);
        }    
    }

    return objects;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\NodeHandlerLookup.js" />
/// <reference path="EnumerableNodeHandler.js" />

People.RecentActivity.Providers.ContactsNodeHandler = function(tag) {
    /// <summary>
    ///     Represents a node handler to handle Contacts node.
    /// </summary>
    /// <param name="tag" type="String">The tag for the contacts node.</param>
    People.RecentActivity.Providers.EnumerableNodeHandler.call(this, tag);
};

Jx.inherit(People.RecentActivity.Providers.ContactsNodeHandler, People.RecentActivity.Providers.EnumerableNodeHandler);

People.RecentActivity.Providers.ContactsNodeHandler.prototype.onProcess = function(nodes, context) {
    /// <summary>
    ///     Called when on process.
    /// </summary>
    /// <param name="nodes" type="Windows.Data.Xml.Dom.XmlNodeList">The nodes to enumerate</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(nodes != null, 'nodes');
    Debug.assert(context != null, 'context');
    var entriesMap = {};
    for (var i = 0, len = nodes.size; i < len; i++) {
        var node = nodes.getAt(i);
        var entries = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item(this.childTag).process(node, context);
        if (entries == null || !entries.length) {
            continue;
        }

        var sourceId = context.contactId.sourceId;
        if (!!Jx.isUndefined(entriesMap[sourceId])) {
            entriesMap[sourceId] = [];
        }

        entriesMap[sourceId].push.apply(entriesMap[sourceId], entries);
    }

    return entriesMap;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\CommentDetailsInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\..\Core\FeedEntryPhotoAlbumDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryPhotoDataInfo.js" />
/// <reference path="..\..\..\Core\FeedEntryStatusDataInfo.js" />
/// <reference path="..\..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\..\Core\NetworkId.js" />
/// <reference path="..\..\..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\..\Core\Permissions.js" />
/// <reference path="..\..\..\Core\PhotoAlbumInfo.js" />
/// <reference path="..\..\..\Core\PhotoInfo.js" />
/// <reference path="..\..\..\Core\ReactionDetailsInfo.js" />
/// <reference path="..\..\..\Platform\Configuration.js" />
/// <reference path="..\..\Helpers\SocialHelper.js" />
/// <reference path="..\NodeHandlerLookup.js" />
/// <reference path="..\RetailModeHelper.js" />

People.RecentActivity.Providers.FeedObjectNodeHandler = function(tag) {
    /// <summary>
    ///     Represents a node handler to handle feed object node(FeedEntry, Album, Photo)
    /// </summary>
    /// <param name="tag" type="String">The tag.</param>
    /// <field name="_feedEntryTag" type="String" static="true">The feed entry tag.</field>
    /// <field name="_albumTag" type="String" static="true">The album tag.</field>
    /// <field name="_photoTag" type="String" static="true">The photo tag.</field>
    /// <field name="_photosTag" type="String" static="true">The photos tag.</field>
    /// <field name="_commentsTag" type="String" static="true">The comments tag.</field>
    /// <field name="_likesTag" type="String" static="true">The likes tag.</field>
    /// <field name="_tag" type="String">The tag.</field>
    this._tag = tag;
};


People.RecentActivity.Providers.FeedObjectNodeHandler._feedEntryTag = 'FeedEntry';
People.RecentActivity.Providers.FeedObjectNodeHandler._albumTag = 'Album';
People.RecentActivity.Providers.FeedObjectNodeHandler._photoTag = 'Photo';
People.RecentActivity.Providers.FeedObjectNodeHandler._photosTag = 'Photos';
People.RecentActivity.Providers.FeedObjectNodeHandler._commentsTag = 'Comments';
People.RecentActivity.Providers.FeedObjectNodeHandler._likesTag = 'Likes';
People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._tag = null;

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype.process = function(node, context) {
    /// <summary>
    ///     Processes the node.
    /// </summary>
    /// <param name="node" type="Windows.Data.Xml.Dom.IXmlNode">The node.</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(node != null, 'node');
    Debug.assert(context != null, 'context');
    var obj = node;
    var objectId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'ObjectId');
    if (objectId == null) {
        return null;
    }

    var type = People.RecentActivity.Core.FeedObjectInfoType.none;
    var data = null;
    switch (this._tag) {
        case 'FeedEntry':
            type = People.RecentActivity.Core.FeedObjectInfoType.entry;
            data = this._toFeedEntryInfo(context, obj);
            break;
        case 'Album':
            type = People.RecentActivity.Core.FeedObjectInfoType.photoAlbum;
            data = this._toPhotoAlbumInfo(context, obj, objectId);
            break;
        case 'Photo':
            type = People.RecentActivity.Core.FeedObjectInfoType.photo;
            data = this._toPhotoInfo(context, obj, objectId);
            break;
    }

    if (data == null) {
        return null;
    }

    var sourceId = context.contactId.sourceId;
    var commentDetail = People.RecentActivity.Core.create_commentDetailsInfo(0, sourceId !== People.RecentActivity.Core.NetworkId.twitter, People.RecentActivity.Core.Permissions.full);
    commentDetail.icon = People.RecentActivity.Platform.Configuration.instance.getCommentIcon(sourceId);
    commentDetail.maximumLength = (sourceId === People.RecentActivity.Core.NetworkId.twitter) ? 140 : -1;
    if (sourceId === People.RecentActivity.Core.NetworkId.twitter) {
        // we should also set the prefix.
        commentDetail.prefix = People.RecentActivity.Providers.SocialHelper.getTwitterCommentPrefix(this._createContactInfo(context).networkHandle);
    }

    var feedObj = People.RecentActivity.Core.create_feedObjectInfo(objectId, sourceId, type, data, 'about:blank', People.RecentActivity.Providers.RetailModeHelper.getTimestamp(obj), commentDetail, new Array(0), [ People.RecentActivity.Core.create_reactionDetailsInfo(this._getReactionId(context), 0, People.RecentActivity.Core.Permissions.full) ], new Array(0));
    this._populateCommentsAndReactions(feedObj, context, obj);
    // Cache photo and album for later lookup in photo or album feed entry.
    switch (type) {
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            context.photoMap[objectId] = feedObj;
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
            context.albumMap[objectId] = feedObj;
            break;
    }

    return feedObj;
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._toFeedEntryInfo = function(context, obj) {
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <param name="obj" type="Windows.Data.Xml.Dom.XmlElement"></param>
    /// <returns type="Object"></returns>
    var type = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'Type');
    if (type == null) {
        return null;
    }

    var data = null;
    switch (type.toLowerCase()) {
        case 'album':
            var album = this._getAlbumOrPhotoFromFeedEntryNode(People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, obj, context);
            if (album == null) {
                return null;
            }

            var albumInfo = album.data;
            var albumPhotos = albumInfo.photos;
            Debug.assert(albumPhotos != null, 'albumPhotos');
            var displayPhotos = albumPhotos.slice(0, Math.min(3, albumPhotos.length));
            data = People.RecentActivity.Core.create_feedEntryPhotoAlbumDataInfo(albumInfo.description, album, displayPhotos, false);
            break;
        case 'photo':
            var photoAlbum = this._getAlbumOrPhotoFromFeedEntryNode(People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, obj, context);
            if (photoAlbum == null) {
                return null;
            }

            var photo = this._getAlbumOrPhotoFromFeedEntryNode(People.RecentActivity.Core.FeedObjectInfoType.photo, obj, context);
            if (photo == null) {
                return null;
            }

            var photoInfo = photo.data;
            data = People.RecentActivity.Core.create_feedEntryPhotoDataInfo(photoInfo.caption, photo, photoAlbum, false);
            break;
        case 'text':
            var text = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'TextMessage');
            if (text == null) {
                return null;
            }

            data = People.RecentActivity.Core.create_feedEntryStatusDataInfo(text);
            break;
        default:
            Jx.log.write(3, People.Social.format('Unsupported type: {0}. Entry xml: {1}.', type, obj.getXml()));
            return null;
    }

    return People.RecentActivity.Core.create_feedEntryInfo(this._getEntryType(type), this._createContactInfo(context), data, People.RecentActivity.Providers.RetailModeHelper.getNetworkName(context.contactId.sourceId), new Array(0), new Array(0), false);
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._toPhotoAlbumInfo = function(context, obj, albumId) {
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <param name="obj" type="Windows.Data.Xml.Dom.XmlElement"></param>
    /// <param name="albumId" type="String"></param>
    /// <returns type="Object"></returns>
    var photosNode = obj.selectSingleNode('Photos');
    if (photosNode == null) {
        Jx.log.write(3, People.Social.format('No {0} tag found in Album: {1}!', 'Photos', obj.getXml()));
        return null;
    }

    context.parentObjectId = albumId;
    var photos = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item('Photos').process(photosNode, context);
    if (photos == null || !photos.length) {
        return null;
    }

    var name = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'AlbumName');
    return People.RecentActivity.Core.create_photoAlbumInfo(albumId, this._createContactInfo(context), name || '', '', new Array(0), photos.length, photos[0], photos);
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._toPhotoInfo = function(context, obj, photoId) {
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <param name="obj" type="Windows.Data.Xml.Dom.XmlElement"></param>
    /// <param name="photoId" type="String"></param>
    /// <returns type="Object"></returns>
    Debug.assert(Jx.isNonEmptyString(context.parentObjectId), 'context.AlbumObjectId');
    var caption = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'Caption');
    var sourceUrl = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'Source');
    var sourceHeight = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'SourceHeight');
    var sourceWidth = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(obj, 'SourceWidth');
    if (!Jx.isNonEmptyString(sourceUrl) || !Jx.isNonEmptyString(sourceHeight) || !Jx.isNonEmptyString(sourceWidth)) {
        return null;
    }

    var height = 0;
    var width = 0;
    try {
        height = parseInt(sourceHeight);
        width = parseInt(sourceWidth);
    }
    catch (e) {
        Jx.log.write(3, 'Invalid SourceHeight or SourceWidth! Photo xml: ' + obj.getXml());
        return null;
    }

    var photo = People.RecentActivity.Core.create_photoInfo(photoId, context.parentObjectId, this._createContactInfo(context), caption || '', sourceUrl, height, width, sourceUrl, height, width, sourceUrl, height, width);
    photo.index = context.index;
    return photo;
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._populateCommentsAndReactions = function(feedObj, context, node) {
    /// <param name="feedObj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <param name="node" type="Windows.Data.Xml.Dom.XmlElement"></param>
    if (feedObj.type === People.RecentActivity.Core.FeedObjectInfoType.entry && (feedObj.data).type !== People.RecentActivity.Core.FeedEntryInfoType.text) {
        // This is a photo or album entry, so we can get comments/reactions from the photo or album.
        var entry = feedObj.data;
        var obj = null;
        switch (entry.type) {
            case People.RecentActivity.Core.FeedEntryInfoType.photoAlbum:
                var albumData = entry.data;
                obj = albumData.album;
                break;
            case People.RecentActivity.Core.FeedEntryInfoType.photo:
                var photoData = entry.data;
                obj = photoData.photo;
                break;
        }

        if (obj != null) {
            Debug.assert(obj.comments != null, 'obj.Comments');
            Debug.assert(obj.commentDetails != null, 'obj.CommentDetails');
            Debug.assert(obj.reactions != null);
            Debug.assert(obj.reactionDetails != null, 'obj.ReactionDetails');
            Debug.assert(obj.reactionDetails.length > 0, 'obj.ReactionDetails.Length');
            feedObj.comments = obj.comments;
            feedObj.commentDetails = obj.commentDetails;
            feedObj.reactions = obj.reactions;
            feedObj.reactionDetails = obj.reactionDetails;
        }

    }
    else {
        var commentsNode = node.selectSingleNode('Comments');
        if (commentsNode != null) {
            context.parentObjectId = feedObj.id;
            feedObj.comments = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item('Comments').process(commentsNode, context) || new Array(0);
            feedObj.commentDetails.count = feedObj.comments.length;
        }

        var reactionsNode = node.selectSingleNode('Likes');
        if (reactionsNode != null) {
            feedObj.reactions = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item('Likes').process(reactionsNode, context) || new Array(0);
            feedObj.reactionDetails[0].count = feedObj.reactions.length;
        }    
    }
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._getAlbumOrPhotoFromFeedEntryNode = function(type, entry, context) {
    /// <param name="type" type="People.RecentActivity.Core.FeedObjectInfoType"></param>
    /// <param name="entry" type="Windows.Data.Xml.Dom.XmlElement"></param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <returns type="People.RecentActivity.Core.create_feedObjectInfo"></returns>
    Debug.assert(type === People.RecentActivity.Core.FeedObjectInfoType.photo || type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'type');
    var tagName = (type === People.RecentActivity.Core.FeedObjectInfoType.photo) ? 'PhotoObjectId' : 'AlbumObjectId';
    var id = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(entry, tagName);
    if (id == null) {
        return null;
    }

    var map = (type === People.RecentActivity.Core.FeedObjectInfoType.photo) ? context.photoMap : context.albumMap;
    if (map == null && !!Jx.isUndefined(map[id])) {
        Jx.log.write(3, People.Social.format('No existing object found! ContactId: {0}. {1}:{2}.', context.contactId.id, tagName, id));
        return null;
    }

    return map[id];
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._getReactionId = function(context) {
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <returns type="String"></returns>
    var config = People.RecentActivity.Platform.Configuration.instance;
    return (context.contactId.sourceId === People.RecentActivity.Core.NetworkId.twitter) ? config.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.retweet).id : config.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.like).id;
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._createContactInfo = function(context) {
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext"></param>
    /// <returns type="People.RecentActivity.Core.create_contactInfo"></returns>
    Debug.assert(context.contactId != null, 'context.ContactId');
    return People.RecentActivity.Providers.RetailModeHelper.createContactInfo(context.contactId.id, context.contactId.sourceId);
};

People.RecentActivity.Providers.FeedObjectNodeHandler.prototype._getEntryType = function(type) {
    /// <param name="type" type="String"></param>
    /// <returns type="People.RecentActivity.Core.FeedEntryInfoType"></returns>
    switch (type) {
        case 'text':
            return People.RecentActivity.Core.FeedEntryInfoType.text;
        case 'photo':
            return People.RecentActivity.Core.FeedEntryInfoType.photo;
        case 'album':
            return People.RecentActivity.Core.FeedEntryInfoType.photoAlbum;
        default:
            return People.RecentActivity.Core.FeedEntryInfoType.none;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="NodeHandlers\CommentNodeHandler.js" />
/// <reference path="NodeHandlers\ContactNodeHandler.js" />
/// <reference path="NodeHandlers\ContactsNodeHandler.js" />
/// <reference path="NodeHandlers\EnumerableNodeHandler.js" />
/// <reference path="NodeHandlers\FeedObjectNodeHandler.js" />
/// <reference path="NodeHandlers\NotificationNodeHandler.js" />
/// <reference path="NodeHandlers\NotificationsNodeHandler.js" />
/// <reference path="NodeHandlers\ReactionNodeHandler.js" />

People.RecentActivity.Providers.NodeHandlerLookup = function() {
    /// <summary>
    ///     Provides the ability to look up a NodeHandler from a tag name.
    /// </summary>
    /// <field name="_handlerMap" type="Object" static="true">The handlers map.</field>
    /// <field name="_handlers" type="People.RecentActivity.Providers.NodeHandlerLookup" static="true">The singleton instance.</field>
    // Register predefined handlers.
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap = {};
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Contacts'] = new People.RecentActivity.Providers.ContactsNodeHandler('Contact');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Contact'] = new People.RecentActivity.Providers.ContactNodeHandler();
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Notifications'] = new People.RecentActivity.Providers.NotificationsNodeHandler('Notification');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Notification'] = new People.RecentActivity.Providers.NotificationNodeHandler();
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Feed'] = new People.RecentActivity.Providers.EnumerableNodeHandler('FeedEntry');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['FeedEntry'] = new People.RecentActivity.Providers.FeedObjectNodeHandler('FeedEntry');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Albums'] = new People.RecentActivity.Providers.EnumerableNodeHandler('Album');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Album'] = new People.RecentActivity.Providers.FeedObjectNodeHandler('Album');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Photos'] = new People.RecentActivity.Providers.EnumerableNodeHandler('Photo');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Photo'] = new People.RecentActivity.Providers.FeedObjectNodeHandler('Photo');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Comments'] = new People.RecentActivity.Providers.EnumerableNodeHandler('Comment');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Comment'] = new People.RecentActivity.Providers.CommentNodeHandler();
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Likes'] = new People.RecentActivity.Providers.EnumerableNodeHandler('Like');
    People.RecentActivity.Providers.NodeHandlerLookup._handlerMap['Like'] = new People.RecentActivity.Providers.ReactionNodeHandler();
};


People.RecentActivity.Providers.NodeHandlerLookup._handlerMap = null;
People.RecentActivity.Providers.NodeHandlerLookup._handlers = null;

Object.defineProperty(People.RecentActivity.Providers.NodeHandlerLookup, "handlers", {
    get: function() {
        /// <summary>
        ///     Gets the handler lookup instance.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.NodeHandlerLookup"></value>
        if (People.RecentActivity.Providers.NodeHandlerLookup._handlers == null) {
            People.RecentActivity.Providers.NodeHandlerLookup._handlers = new People.RecentActivity.Providers.NodeHandlerLookup();
        }

        return People.RecentActivity.Providers.NodeHandlerLookup._handlers;
    }
});

People.RecentActivity.Providers.NodeHandlerLookup.prototype.item = function(tag) {
    /// <summary>
    ///     Gets the <see cref="T:People.RecentActivity.Providers.ISocialXmlNodeHandler" /> with the specified tag.
    /// </summary>
    /// <param name="tag" type="String"></param>
    /// <param name="value" type="People.RecentActivity.Providers.ISocialXmlNodeHandler"></param>
    /// <returns type="People.RecentActivity.Providers.ISocialXmlNodeHandler"></returns>
    Debug.assert(Jx.isNonEmptyString(tag), 'tag');
    Debug.assert(!Jx.isUndefined(People.RecentActivity.Providers.NodeHandlerLookup._handlerMap[tag]), 'handlerMap');
    return People.RecentActivity.Providers.NodeHandlerLookup._handlerMap[tag];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\NotificationInfo.js" />
/// <reference path="..\..\..\Core\NotificationInfoType.js" />
/// <reference path="..\RetailModeHelper.js" />

People.RecentActivity.Providers.NotificationNodeHandler = function() {
    /// <summary>
    ///     Represents a node handler for Notification node.
    /// </summary>
};

People.RecentActivity.Providers.NotificationNodeHandler.prototype.process = function(node, context) {
    /// <summary>
    ///     Processes the node.
    /// </summary>
    /// <param name="node" type="Windows.Data.Xml.Dom.IXmlNode">The node.</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(node != null, 'node');
    Debug.assert(context != null, 'context');
    var notification = node;
    var message = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(notification, 'Message');
    if (message == null) {
        return null;
    }

    var objectId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(notification, 'ObjectId');
    if (objectId == null) {
        return null;
    }

    var type = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(notification, 'ObjectType');
    if (type == null) {
        return null;
    }

    var sourceId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(notification, 'SourceId');
    if (sourceId == null) {
        return null;
    }

    var publisherId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(notification, 'Publisher');
    if (publisherId == null) {
        return null;
    }

    return People.RecentActivity.Core.create_notificationInfo(context.index + '_' + objectId, People.RecentActivity.Providers.RetailModeHelper.createContactInfo(publisherId, sourceId), People.RecentActivity.Providers.RetailModeHelper.getTimestamp(notification), message, objectId, this._getNotificationType(type), 'about:blank', People.RecentActivity.Providers.RetailModeHelper.getNetworkName(sourceId), sourceId, false, false, true);
};

People.RecentActivity.Providers.NotificationNodeHandler.prototype._getNotificationType = function(type) {
    /// <param name="type" type="String"></param>
    /// <returns type="People.RecentActivity.Core.NotificationInfoType"></returns>
    switch (type.toLowerCase()) {
        case 'entry':
            return People.RecentActivity.Core.NotificationInfoType.entry;
        case 'photo':
            return People.RecentActivity.Core.NotificationInfoType.photo;
        case 'album':
            return People.RecentActivity.Core.NotificationInfoType.photoAlbum;
        default:
            return People.RecentActivity.Core.NotificationInfoType.none;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\NodeHandlerLookup.js" />
/// <reference path="EnumerableNodeHandler.js" />

People.RecentActivity.Providers.NotificationsNodeHandler = function(tag) {
    /// <summary>
    ///     Represents a node handler to handle Notifications node.
    /// </summary>
    /// <param name="tag" type="String">The tag for the notifications node.</param>
    People.RecentActivity.Providers.EnumerableNodeHandler.call(this, tag);
};

Jx.inherit(People.RecentActivity.Providers.NotificationsNodeHandler, People.RecentActivity.Providers.EnumerableNodeHandler);

People.RecentActivity.Providers.NotificationsNodeHandler.prototype.onProcess = function(nodes, context) {
    /// <summary>
    ///     Called when on process.
    /// </summary>
    /// <param name="nodes" type="Windows.Data.Xml.Dom.XmlNodeList">The nodes to enumerate</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(nodes != null, 'nodes');
    Debug.assert(context != null, 'context');
    var notificationsMap = {};
    for (var i = 0, len = nodes.size; i < len; i++) {
        var node = nodes.getAt(i);
        context.index = i;
        var notification = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item(this.childTag).process(node, context);
        if (notification == null) {
            continue;
        }

        var sourceId = notification.sourceId;
        if (!!Jx.isUndefined(notificationsMap[sourceId])) {
            notificationsMap[sourceId] = [];
        }

        notificationsMap[sourceId].push(notification);
    }

    return notificationsMap;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\..\Core\NetworkId.js" />
/// <reference path="..\..\..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\..\Core\ReactionInfo.js" />
/// <reference path="..\..\..\Platform\Configuration.js" />
/// <reference path="..\RetailModeHelper.js" />

People.RecentActivity.Providers.ReactionNodeHandler = function() {
    /// <summary>
    ///     Represents a node handler to handle Like node.
    /// </summary>
};

People.RecentActivity.Providers.ReactionNodeHandler.prototype.process = function(node, context) {
    /// <summary>
    ///     Processes the node.
    /// </summary>
    /// <param name="node" type="Windows.Data.Xml.Dom.IXmlNode">The node.</param>
    /// <param name="context" type="People.RecentActivity.Providers.socialNodeContext">The context.</param>
    /// <returns type="Object"></returns>
    Debug.assert(node != null, 'node');
    Debug.assert(context != null, 'context');
    var like = node;
    var authorId = People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue(like, 'Author');
    if (authorId == null) {
        return null;
    }

    var author = People.RecentActivity.Providers.RetailModeHelper.createContactInfo(authorId, context.contactId.sourceId);
    var config = People.RecentActivity.Platform.Configuration.instance;
    var reaction = (context.contactId.sourceId === People.RecentActivity.Core.NetworkId.twitter) ? config.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.retweet) : config.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.like);
    return People.RecentActivity.Core.create_reactionInfo(reaction, author);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ContactInfo.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\..\Platform\ContactId.js" />
/// <reference path="..\Cache\Cache.js" />
/// <reference path="..\Cache\FeedCache.js" />
/// <reference path="..\Cache\NotificationCache.js" />
/// <reference path="NodeHandlerLookup.js" />
/// <reference path="SocialNodeContext.js" />

People.RecentActivity.Providers.RetailModeHelper = function() {
    /// <summary>
    ///     Provides retail mode support for social experience.
    /// </summary>
    /// <field name="_filePath" type="String" static="true">The file path.</field>
    /// <field name="_completed" type="WinJS.Function" static="true">The promise onCompleted callback.</field>
    /// <field name="_error" type="WinJS.Function" static="true">The promise onError callback.</field>
    /// <field name="_platform" type="Microsoft.WindowsLive.Platform.Client" static="true">The platform.</field>
    /// <field name="_userCid" type="String" static="true">The current user cid.</field>
};


People.RecentActivity.Providers.RetailModeHelper._filePath = null;
People.RecentActivity.Providers.RetailModeHelper._completed = null;
People.RecentActivity.Providers.RetailModeHelper._error = null;
People.RecentActivity.Providers.RetailModeHelper._platform = null;
People.RecentActivity.Providers.RetailModeHelper._userCid = null;

People.RecentActivity.Providers.RetailModeHelper.populateDemoDataAsync = function(path, platform) {
    /// <summary>
    ///     Populates the demo data async.
    /// </summary>
    /// <param name="path" type="String">The path of the xml file containing social demo data.</param>
    /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client">The platform.</param>
    /// <returns type="WinJS.Promise"></returns>
    Debug.assert(Jx.isNonEmptyString(path), 'path');
    Debug.assert(platform != null, 'platform');
    People.RecentActivity.Providers.RetailModeHelper._filePath = path;
    People.RecentActivity.Providers.RetailModeHelper._platform = platform;
    // Clears existing data first.
    People.RecentActivity.Providers.RetailModeHelper.clearDemoData();
    try {
        People.RecentActivity.Providers.RetailModeHelper._userCid = People.RecentActivity.Providers.RetailModeHelper._getUserCid(platform);
    }
    catch (ex) {
        Jx.log.write(2, 'Failed to get the user cid: ' + ex.message);
    }

    return new WinJS.Promise(People.RecentActivity.Providers.RetailModeHelper._onPromiseInitialized);
};

People.RecentActivity.Providers.RetailModeHelper.clearDemoData = function() {
    /// <summary>
    ///     Clears the data in the cache.
    /// </summary>
    try {
        People.RecentActivity.Providers.Cache.clear();
    }
    catch (ex) {
        Jx.log.write(2, 'RetailModeHelper.ClearDemoData: failed to clear the cache: ' + ex.message);
    }
};

People.RecentActivity.Providers.RetailModeHelper.feedObjectSorter = function(a, b) {
    /// <summary>
    ///     The sort call back for feed objects.
    /// </summary>
    /// <param name="a" type="Object">The object a.</param>
    /// <param name="b" type="Object">The object b.</param>
    /// <returns type="Number" integer="true"></returns>
    return ((a).timestamp - (b).timestamp);
};

People.RecentActivity.Providers.RetailModeHelper.validateAndGetNodeValue = function(parent, tagName) {
    /// <summary>
    ///     Validates and gets node value.
    /// </summary>
    /// <param name="parent" type="Windows.Data.Xml.Dom.XmlElement">The parent.</param>
    /// <param name="tagName" type="String">The node name.</param>
    /// <returns type="String"></returns>
    var node = parent.selectSingleNode(tagName);
    var value = (node != null) ? node.innerText : null;
    if (!Jx.isNonEmptyString(value)) {
        Jx.log.write(3, People.Social.format('No {0} found or invalid for {1}: {2}!', tagName, parent.nodeName, parent.getXml()));
        return null;
    }

    return value;
};

People.RecentActivity.Providers.RetailModeHelper.getNetworkName = function(sourceId) {
    /// <summary>
    ///     Gets the network name from source id.
    /// </summary>
    /// <param name="sourceId" type="String">The source id.</param>
    /// <returns type="String"></returns>
    switch (sourceId) {
        case People.RecentActivity.Core.NetworkId.facebook:
            return 'Facebook';
        case People.RecentActivity.Core.NetworkId.twitter:
            return 'Twitter';
    }

    Jx.log.write(3, 'Unsupported source id: ' + sourceId);
    return '';
};

People.RecentActivity.Providers.RetailModeHelper.getTimestamp = function(node) {
    /// <summary>
    ///     Gets the timestamp from a node.
    /// </summary>
    /// <param name="node" type="Windows.Data.Xml.Dom.XmlElement">The node that contains a Timestamp node.</param>
    /// <returns type="Number" integer="true"></returns>
    Debug.assert(node != null, 'node');
    node = node.selectSingleNode('Timestamp');
    if (node == null || !Jx.isNonEmptyString(node.innerText)) {
        return new Date().getTime();
    }

    var minutes = 0;
    try {
        minutes = parseInt(node.innerText);
    }
    catch (e) {
        Jx.log.write(2, 'Unexpected time stamp format:' + node.innerText);
    }

    return new Date().getTime() + minutes * 60 * 1000;
};

People.RecentActivity.Providers.RetailModeHelper.createContactInfo = function(id, sourceId) {
    /// <summary>
    ///     Creates a contact info object.
    /// </summary>
    /// <param name="id" type="String">The id.</param>
    /// <param name="sourceId" type="String">The source id.</param>
    /// <returns type="People.RecentActivity.Core.create_contactInfo"></returns>
    Debug.assert(Jx.isNonEmptyString(id), 'id');
    Debug.assert(Jx.isNonEmptyString(sourceId), 'sourceId');
    var handle = '';
    if (sourceId === People.RecentActivity.Core.NetworkId.twitter) {
        var person = People.RecentActivity.Providers.RetailModeHelper._platform.peopleManager.tryLoadPersonBySourceIDAndObjectID(sourceId, id);
        if (person == null) {
            // In retail mode, if person is null, it means it is me person.
            person = People.RecentActivity.Providers.RetailModeHelper._platform.accountManager.defaultAccount.meContact.person;
            Debug.assert(person != null, 'person');
        }

        // In retail mode, twitter screen name is not populated, so we just use first name.
        handle = person.firstName;
    }

    return People.RecentActivity.Core.create_contactInfo(id, sourceId, handle, '', '', true);
};

People.RecentActivity.Providers.RetailModeHelper._getUserCid = function(platform) {
    /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"></param>
    /// <returns type="String"></returns>
    var cid = platform.accountManager.defaultAccount.meContact.cid.value;
    return Microsoft.WindowsLive.Cid.CidFormatter.toString(cid, Microsoft.WindowsLive.Cid.CidFormat.decimal);
};

People.RecentActivity.Providers.RetailModeHelper._onPromiseInitialized = function(completed, error) {
    /// <param name="completed" type="WinJS.Function"></param>
    /// <param name="error" type="WinJS.Function"></param>
    People.RecentActivity.Providers.RetailModeHelper._completed = completed;
    People.RecentActivity.Providers.RetailModeHelper._error = error;
    if (People.RecentActivity.Providers.RetailModeHelper._userCid == null) {
        People.RecentActivity.Providers.RetailModeHelper._onError(new Error('Failed to get user cid from platform!'));
        return;
    }

    try {
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(new Windows.Foundation.Uri(People.RecentActivity.Providers.RetailModeHelper._filePath)).then(People.RecentActivity.Providers.RetailModeHelper._onFileLoaded, People.RecentActivity.Providers.RetailModeHelper._onLoadError).done(People.RecentActivity.Providers.RetailModeHelper._onXmlLoaded, People.RecentActivity.Providers.RetailModeHelper._onLoadError);
    }
    catch (ex) {
        People.RecentActivity.Providers.RetailModeHelper._onError(ex);
    }
};

People.RecentActivity.Providers.RetailModeHelper._onFileLoaded = function(result) {
    /// <param name="result" type="Object"></param>
    /// <returns type="WinJS.Promise"></returns>
    Debug.assert(result != null, 'result');
    var file = result;
    try {
        return Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file);
    }
    catch (ex) {
        People.RecentActivity.Providers.RetailModeHelper._onError(ex);
        return null;
    }
};

People.RecentActivity.Providers.RetailModeHelper._onXmlLoaded = function(result) {
    /// <param name="result" type="Object"></param>
    /// <returns type="WinJS.Promise"></returns>
    Debug.assert(result != null, 'result');
    try {
        var doc = result;
        if (!People.RecentActivity.Providers.RetailModeHelper._processContacts(doc)) {
            return null;
        }

        People.RecentActivity.Providers.RetailModeHelper._processNotifications(doc);
        People.RecentActivity.Providers.RetailModeHelper._onCompleted();
    }
    catch (ex) {
        People.RecentActivity.Providers.RetailModeHelper._onError(ex);
    }

    return null;
};

People.RecentActivity.Providers.RetailModeHelper._onLoadError = function(error) {
    /// <param name="error" type="Error"></param>
    /// <returns type="WinJS.Promise"></returns>
    People.RecentActivity.Providers.RetailModeHelper._onError(error);
    return null;
};

People.RecentActivity.Providers.RetailModeHelper._onCompleted = function() {
    Jx.log.write(4, 'Successfully populated social data!');
    if (People.RecentActivity.Providers.RetailModeHelper._completed != null) {
        People.RecentActivity.Providers.RetailModeHelper._completed({});
    }
};

People.RecentActivity.Providers.RetailModeHelper._onError = function(ex) {
    /// <param name="ex" type="Error"></param>
    Jx.log.write(2, 'Failed to populate social data: ' + ex.message);
    if (People.RecentActivity.Providers.RetailModeHelper._error != null) {
        People.RecentActivity.Providers.RetailModeHelper._error(ex);
    }
};

People.RecentActivity.Providers.RetailModeHelper._processContacts = function(doc) {
    /// <param name="doc" type="Windows.Data.Xml.Dom.XmlDocument"></param>
    /// <returns type="Boolean"></returns>
    var contacts = doc.selectSingleNode('/Social/Contacts');
    if (contacts == null) {
        People.RecentActivity.Providers.RetailModeHelper._onError(new Error('Invalid xml, no Contacts node found!'));
        return false;
    }

    var entriesMap = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item('Contacts').process(contacts, People.RecentActivity.Providers.create_socialNodeContext(People.RecentActivity.Providers.RetailModeHelper._userCid));
    if (entriesMap == null || !Object.keys(entriesMap).length) {
        People.RecentActivity.Providers.RetailModeHelper._onError(new Error('Invalid xml, feed data is invalid or missing for all contacts!'));
        return false;
    }

    var feedCache = People.RecentActivity.Providers.FeedCache.getInstance(People.RecentActivity.Providers.RetailModeHelper._userCid);
    var whatsNewId = People.RecentActivity.Platform.Configuration.instance.whatsNewPersonId;
    for (var k in entriesMap) {
        var pair = { key: k, value: entriesMap[k] };
        var entries = pair.value;
        entries.sort(People.RecentActivity.Providers.RetailModeHelper.feedObjectSorter);
        feedCache.addCacheEntry(new People.RecentActivity.Platform.ContactId(whatsNewId, pair.key), entries);
    }

    return true;
};

People.RecentActivity.Providers.RetailModeHelper._processNotifications = function(doc) {
    /// <param name="doc" type="Windows.Data.Xml.Dom.XmlDocument"></param>
    var notificationsNode = doc.selectSingleNode('/Social/Notifications');
    if (notificationsNode == null) {
        return;
    }

    var notificationsMap = People.RecentActivity.Providers.NodeHandlerLookup.handlers.item('Notifications').process(notificationsNode, People.RecentActivity.Providers.create_socialNodeContext(People.RecentActivity.Providers.RetailModeHelper._userCid));
    if (notificationsMap == null || !Object.keys(notificationsMap).length) {
        return;
    }

    var cache = People.RecentActivity.Providers.NotificationCache.getInstance(People.RecentActivity.Providers.RetailModeHelper._userCid);
    for (var k in notificationsMap) {
        var pair = { key: k, value: notificationsMap[k] };
        var notifications = pair.value;
        notifications.sort(People.RecentActivity.Providers.RetailModeHelper._notificationSorter);
        cache.addCacheEntry(pair.key, notifications);
    }
};

People.RecentActivity.Providers.RetailModeHelper._notificationSorter = function(a, b) {
    /// <param name="a" type="Object"></param>
    /// <param name="b" type="Object"></param>
    /// <returns type="Number" integer="true"></returns>
    return ((a).timestamp - (b).timestamp);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ETW\EtwEventName.js" />
/// <reference path="..\..\Core\ETW\EtwHelper.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\Cache\SocialCache.js" />

People.RecentActivity.Providers.Serializer = function(socialCache) {
    /// <summary>
    ///     Base class for serializers.
    /// </summary>
    /// <param name="socialCache" type="People.RecentActivity.Providers.SocialCache">The social in memory cache.</param>
    /// <field name="unexpectedResponseFormatError" type="Number" integer="true" static="true">Reserved sub error code when serice changed response format and broke us.</field>
    /// <field name="urlRegex" type="String" static="true">Regex to match a url.</field>
    /// <field name="socialCache" type="People.RecentActivity.Providers.SocialCache">The social in memory cache.</field>
    Debug.assert(socialCache != null, 'socialCache');
    this.socialCache = socialCache;
};


People.RecentActivity.Providers.Serializer.unexpectedResponseFormatError = 9000;
People.RecentActivity.Providers.Serializer.urlRegex = "((http|https):\\/\\/)[^\\s]*[^\\s?.!(;:'>\\[\\],]";
People.RecentActivity.Providers.Serializer.prototype.socialCache = null;

People.RecentActivity.Providers.Serializer.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    this.socialCache.clear();
};

People.RecentActivity.Providers.Serializer.prototype.deserialize = function(response, format, type) {
    /// <summary>
    ///     Deserializes the specified response.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="format" type="People.RecentActivity.Providers.ResponseFormat">The expected response format.</param>
    /// <param name="type" type="People.RecentActivity.Providers.KnownType">The expected type.</param>
    Debug.assert(response != null, 'response');
    Debug.assert(response.body != null, 'response.Body');
    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialProviderDeserializeStart, [ response.requestContext.liveCommApiName, type ]);
    var responseBody = response.body;
    var responseObj = null;
    try {
        Jx.log.write(4, 'Serializer::Deserialize(' + format + ',' + type + ')');
        switch (format) {
            case 1:
                responseObj = JSON.parse(responseBody);
                break;
            case 2:
                if (!Jx.isNonEmptyString(responseBody)) {
                    // deserialize an empty object.
                    responseObj = {};
                }
                else {
                    responseObj = JSON.parse(responseBody);
                }

                break;
            case 3:
                var doc = new Windows.Data.Xml.Dom.XmlDocument();
                doc.loadXml(responseBody);
                responseObj = doc;
                break;
            case 0:
                responseObj = responseBody;
                break;
        }

    }
    catch (ex) {
        Jx.log.write(2, 'Serializer::Deserialize(' + format + ',' + type + '): Could not parse responseBody: ' + ex.toString() + ', success: ' + response.success);
        if (response.success && !!type) {
            // We encountered an unexpected deserialization error.
            Jx.log.write(1, People.Social.format('Unexpected parser error when deserialzing to type {0}: {1}.', type.toString(), ex.message));
            this.setResponse(response, People.RecentActivity.Core.ResultCode.failure, null, responseObj, 9000);
            return;
        }    
    }

    // We need to update response result again based on response body.
    this.updateResult(response, format, responseObj);
    if (response.resultInfo.code !== People.RecentActivity.Core.ResultCode.success) {
        return;
    }

    switch (type) {
        case 1:
            this.deserializeFeedEntries(response, responseObj);
            break;
        case 7:
            this.deserializeAlbumsOrPhotos(response, responseObj);
            break;
        case 8:
            this.deserializeAlbumsOrPhotos(response, responseObj);
            break;
        case 9:
            this.deserializePhotoTags(response, responseObj);
            break;
        case 2:
            this.deserializeComments(response, responseObj);
            break;
        case 3:
            this.deserializeReactions(response, responseObj);
            break;
        case 4:
            this.deserializeComment(response, responseObj);
            break;
        case 5:
            this.deserializeReaction(response, responseObj);
            break;
        case 6:
            this.deserializeNotifications(response, responseObj);
            break;
        case 10:
            this.deserializeUnreadNotificationsCount(response, responseObj);
            break;
        case 11:
            this.deserializeFeedExtraInfo(response, responseObj);
            break;
        case 12:
            this.deserializeNotificationsExtraInfo(response, responseObj);
            break;
        case 13:
            this.deserializeFeedObjectInfo(response, responseObj);
            break;
    }

    People.RecentActivity.Core.EtwHelper.writeUnofficialEvent(People.RecentActivity.Core.EtwEventName.unofficialProviderDeserializeStop, [ response.requestContext.liveCommApiName, type ]);
};

People.RecentActivity.Providers.Serializer.prototype.serialize = function(obj, type) {
    /// <summary>
    ///     Serializes the specified obj.
    /// </summary>
    /// <param name="obj" type="Object">The obj.</param>
    /// <param name="type" type="People.RecentActivity.Providers.KnownType">The expected type.</param>
    /// <returns type="String"></returns>
    switch (type) {
        case 13:
            return this.serializeFeedObject(obj);
        default:
            throw new Error('Not Implemented');
    }
};

People.RecentActivity.Providers.Serializer.prototype.deserializeFeedExtraInfo = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the feed extra info.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.deserializeContacts = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the contacts.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.deserializeAlbumsOrPhotos = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the albums or photos.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.deserializePhotoTags = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the photo tags.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.deserializeNotifications = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the notifications.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.deserializeNotificationsExtraInfo = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the notifications extra info.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.deserializeUnreadNotificationsCount = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the unread notifications count.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.deserializeFeedObjectInfo = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the feed object response
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
};

People.RecentActivity.Providers.Serializer.prototype.serializeFeedObject = function(obj) {
    /// <summary>
    ///     Serializes a feed object.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <returns type="String"></returns>
    return null;
};

People.RecentActivity.Providers.Serializer.prototype.setResponse = function(response, resultCode, data, error, subErrorCode) {
    /// <summary>
    ///     Sets the response.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="resultCode" type="People.RecentActivity.Core.ResultCode">The result code.</param>
    /// <param name="data" type="Object">The data.</param>
    /// <param name="error" type="Object">The error.</param>
    /// <param name="subErrorCode" type="Number" integer="true">The sub error code.</param>
    response.resultInfo.code = resultCode;
    response.data = data;
    response.error = error;
    response.subErrorCode = this.normalizeErrorCode(subErrorCode);
};

People.RecentActivity.Providers.Serializer.prototype.setUnexpectedFormatResponse = function(response, errorMsg) {
    /// <summary>
    ///     Sets the response when an unexpected response format is encountered.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="errorMsg" type="String">The error message.</param>
    if (Jx.isNonEmptyString(errorMsg)) {
        Jx.log.write(2, errorMsg);
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.failure, null, null, 9000);
};

People.RecentActivity.Providers.Serializer.prototype.setReactionCount = function(obj, reactionTypeId, count) {
    /// <summary>
    ///     Sets the reaction count for a feed object.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The obj.</param>
    /// <param name="reactionTypeId" type="String">The reaction type id.</param>
    /// <param name="count" type="Number" integer="true">The count.</param>
    Debug.assert(obj != null, 'obj');
    Debug.assert(obj.reactionDetails != null, 'obj.ReactionDetails');
    for (var n = 0; n < obj.reactionDetails.length; n++) {
        var detail = obj.reactionDetails[n];
        if (detail.id === reactionTypeId) {
            detail.count = count;
            break;
        }    
    }
};

People.RecentActivity.Providers.Serializer.prototype.normalizeErrorCode = function(errorCode) {
    /// <param name="errorCode" type="Number" integer="true"></param>
    /// <returns type="Number" integer="true"></returns>
    return (isNaN(errorCode)) ? 0 : errorCode;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\AnnotationInfo.js" />
/// <reference path="..\..\Core\AnnotationInfoType.js" />
/// <reference path="..\..\Core\CommentDetailsInfo.js" />
/// <reference path="..\..\Core\CommentInfo.js" />
/// <reference path="..\..\Core\EntityInfo.js" />
/// <reference path="..\..\Core\EntityInfoType.js" />
/// <reference path="..\..\Core\FeedEntryInfo.js" />
/// <reference path="..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\Core\FeedEntryLinkDataInfo.js" />
/// <reference path="..\..\Core\FeedEntryPhotoAlbumDataInfo.js" />
/// <reference path="..\..\Core\FeedEntryPhotoDataInfo.js" />
/// <reference path="..\..\Core\FeedEntryStatusDataInfo.js" />
/// <reference path="..\..\Core\FeedEntryVideoDataInfo.js" />
/// <reference path="..\..\Core\FeedEntryVideoDataInfoType.js" />
/// <reference path="..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\Core\NotificationInfo.js" />
/// <reference path="..\..\Core\NotificationInfoType.js" />
/// <reference path="..\..\Core\Permissions.js" />
/// <reference path="..\..\Core\PhotoTagInfo.js" />
/// <reference path="..\..\Core\ReactionDetailsInfo.js" />
/// <reference path="..\..\Core\ReactionInfo.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Cache\SocialCache.js" />
/// <reference path="..\Helpers\EntityHelper.js" />
/// <reference path="..\Helpers\SocialHelper.js" />
/// <reference path="..\UriQueryBuilder.js" />
/// <reference path="..\Utilities.js" />
/// <reference path="..\Validators\FacebookValidator.js" />
/// <reference path="Serializer.js" />

People.RecentActivity.Providers.FacebookSerializer = function(socialCache) {
    /// <summary>
    ///     Serialzer to serialize/deserialize Facebook content.
    /// </summary>
    /// <param name="socialCache" type="People.RecentActivity.Providers.SocialCache">The social in memory cache.</param>
    /// <field name="_legacyRestAuthErrorCode$1" type="Number" integer="true" static="true"></field>
    /// <field name="_legacyRestScopeErrorCode$1" type="Number" integer="true" static="true"></field>
    /// <field name="_graphAuthErrorCode$1" type="Number" integer="true" static="true"></field>
    /// <field name="_graphPermissionErrorCode$1" type="Number" integer="true" static="true"></field>
    /// <field name="_maxReturnedLikes$1" type="Number" integer="true" static="true"></field>
    /// <field name="_maxReturnedComments$1" type="Number" integer="true" static="true"></field>
    /// <field name="_userTagType$1" type="String" static="true"></field>
    /// <field name="_pageTagType$1" type="String" static="true"></field>
    /// <field name="_fakeCommentId$1" type="String" static="true"></field>
    /// <field name="_likeReaction$1" type="People.RecentActivity.Core.create_networkReactionInfo"></field>
    this._likeReaction$1 = People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.like);
    People.RecentActivity.Providers.Serializer.call(this, socialCache);
};

Jx.inherit(People.RecentActivity.Providers.FacebookSerializer, People.RecentActivity.Providers.Serializer);

People.RecentActivity.Providers.FacebookSerializer._legacyRestAuthErrorCode$1 = 190;
People.RecentActivity.Providers.FacebookSerializer._legacyRestScopeErrorCode$1 = 200;
People.RecentActivity.Providers.FacebookSerializer._graphAuthErrorCode$1 = 190;
People.RecentActivity.Providers.FacebookSerializer._graphPermissionErrorCode$1 = 200;
People.RecentActivity.Providers.FacebookSerializer._maxReturnedLikes$1 = 100;
People.RecentActivity.Providers.FacebookSerializer._maxReturnedComments$1 = 100;
People.RecentActivity.Providers.FacebookSerializer._userTagType$1 = 'user';
People.RecentActivity.Providers.FacebookSerializer._pageTagType$1 = 'page';
People.RecentActivity.Providers.FacebookSerializer._fakeCommentId$1 = '__fake_comment_id__';

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeFeedEntries = function (response, responseObj) {
    /// <summary>
    ///     Deserializes the feed entries.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeFeedEntries()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeFeedEntries()');
        return;
    }

    var entries = [];
    // Contains photos showing up in the feed, we need to retrieve more photo information in the second request since
    // Facebook only gives back the id.
    var photoIds = [];
    // Contains albums showing up in the feed, we need to retrieve more album information in the second request since
    // Facebook only gives back the id.
    var albumIds = [];
    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        if (!People.RecentActivity.Providers.FacebookValidator.validateResultSet(result)) {
            continue;
        }

        switch (result.name) {
            case 'feedInfo':
                var fbEntries = result.fql_result_set;
                var fbEntriesLength = fbEntries.length;
                response.requestContext.numEntriesReceived = fbEntriesLength;

                // Start with the oldest entry.
                for (var i = fbEntriesLength - 1; i >= 0; i--) {
                    var fbEntry = fbEntries[i];
                    if (!People.RecentActivity.Providers.FacebookValidator.validateFeedEntry(fbEntry)) {
                        continue;
                    }

                    var entryData;
                    var type;
                    var isShared = false;
                    var isTagged = false;

                    var commentDetail = this._getCommentDetailsInfo$1(fbEntry);
                    var reactionDetails = this._getReactionDetailsInfo$1(fbEntry);
                    var reactions = this._toReactionInfoArray$1(fbEntry.likes);

                    // Gets entity info.
                    var entities = this._getContactEntities$1(fbEntry);
                    entities = entities.concat(People.RecentActivity.Providers.EntityHelper.getLinkEntities(fbEntry.message));
                    People.RecentActivity.Providers.EntityHelper.sortEntities(entities);

                    var publisherId = fbEntry.actor_id.toString();

                    // Facebook has deprecated type property, the logic below is recommended by FB to tell the post type.
                    // Hopefully they will make it easier in the future.
                    var attachment = fbEntry.attachment;
                    if (attachment == null) {
                        if (!Jx.isNonEmptyString(fbEntry.message)) {
                            // Skip, since there are nothing to display.
                            continue;
                        }

                        type = People.RecentActivity.Core.FeedEntryInfoType.text;
                        entryData = People.RecentActivity.Core.create_feedEntryStatusDataInfo(fbEntry.message);
                    }
                    else {
                        var sharedType = this._getSharedObjectType$1(attachment);
                        isShared = sharedType !== People.RecentActivity.Core.FeedObjectInfoType.none;

                        var medias = this._getMediaInfo$1(attachment);
                        if (medias.length > 0 && medias[0].type !== 'link') {
                            var media = medias[0];
                            switch (media.type) {
                                case 'video':
                                    type = People.RecentActivity.Core.FeedEntryInfoType.video;

                                    if (!People.RecentActivity.Providers.FacebookValidator.validateVideoMedia(media)) {
                                        continue;
                                    }

                                    entryData = People.RecentActivity.Core.create_feedEntryVideoDataInfo(fbEntry.message, attachment.name, attachment.caption, attachment.description, media.src, this._getVideoType$1(media.video), media.video.source_url || media.video.display_url, media.video.display_url || media.video.source_url);
                                    break;

                                case 'photo':
                                    if (!People.RecentActivity.Providers.FacebookValidator.validatePhotoMedia(media)) {
                                        Jx.log.write(3, 'FacebookSerializer.DeserializeFeedEntries(): photo entry.');
                                        continue;
                                    }

                                    var aid = media.photo.aid;
                                    var owner = media.photo.owner;

                                    // If this is not a shared entry and the photo owner is different from the publisher, then this is a tagged entry.
                                    if (!isShared && !Jx.isNullOrUndefined(owner) && (owner.toString().toUpperCase() !== publisherId.toUpperCase())) {
                                        isTagged = true;
                                    }

                                    var album = this.socialCache.getAlbum(aid);

                                    // If it is a shared album, medias.Length is also 1, but we want to treat it is an album.
                                    if (medias.length === 1 && sharedType !== People.RecentActivity.Core.FeedObjectInfoType.photoAlbum) {
                                        var pid = media.photo.pid;
                                        if (!isShared && !isTagged && (photoIds.indexOf(pid) !== -1)) {
                                            // This is a photo entry where the photo owner is tagged which we couldn't differentiate with the existing photo upload entry.
                                            // so skip.
                                            continue;
                                        }

                                        type = People.RecentActivity.Core.FeedEntryInfoType.photo;

                                        var photo = this.socialCache.getPhoto(pid);

                                        this._populatePhotoId$1(photoIds, pid);
                                        this._populateAlbumId$1(albumIds, aid);

                                        // Populate photo and album information already available in feed response.
                                        this._populatePhotoInfo$1(photo, media);

                                        var photoInfo = photo.data;

                                        // The photo's entity info is the same as the feed entry's. The entity info is applied to the photo's caption.
                                        photoInfo.entities = entities;

                                        // If not shared, populate the sample reactions/comments for the photos since they are the same as the feed entry.
                                        // Shared photo/album entry has different reaction stream for the photo/album.
                                        if (!isShared) {
                                            photo.commentDetails = commentDetail;
                                            photo.reactionDetails = reactionDetails;
                                        }

                                        this._populateAlbumFromPhoto$1(album, photo);

                                        entryData = People.RecentActivity.Core.create_feedEntryPhotoDataInfo(fbEntry.message, photo, album, isTagged);
                                        break;
                                    }

                                    // It is an album entry.
                                    if (!isShared && !isTagged && (albumIds.indexOf(aid) !== -1)) {
                                        // This is an album entry where the album owner is tagged which we couldn't differentiate with the existing album upload entry.
                                        // so skip.
                                        continue;
                                    }

                                    type = People.RecentActivity.Core.FeedEntryInfoType.photoAlbum;
                                    this._populateAlbumId$1(albumIds, aid);

                                    var photos = [];
                                    for (var o = 0; o < medias.length; o++) {
                                        var photoMedia = medias[o];
                                        if (!People.RecentActivity.Providers.FacebookValidator.validatePhotoMedia(photoMedia)) {
                                            Jx.log.write(3, 'FacebookSerializer.DeserializeFeedEntries(): album entry.');
                                            continue;
                                        }

                                        var pid = photoMedia.photo.pid;
                                        var photo = this.socialCache.getPhoto(pid);
                                        this._populatePhotoId$1(photoIds, pid);
                                        this._populatePhotoInfo$1(photo, photoMedia);
                                        photos.push(photo);
                                    }

                                    if (!photos.length) {
                                        continue;
                                    }

                                    this._populateAlbum$1(album, photos, attachment);

                                    if (!isShared) {
                                        album.commentDetails = commentDetail;
                                        album.reactionDetails = reactionDetails;
                                    }

                                    entryData = People.RecentActivity.Core.create_feedEntryPhotoAlbumDataInfo(fbEntry.message, album, photos, isTagged);
                                    break;

                                default:
                                    continue;
                            }

                        }
                        else if (Jx.isNonEmptyString(attachment.href) || medias.length > 0) {
                            if (!Jx.isNonEmptyString(attachment.name) && !Jx.isNonEmptyString(attachment.caption) && !Jx.isNonEmptyString(attachment.description)) {
                                // This is an unsupported link type.
                                continue;
                            }

                            // Handle link here instead of in above switch block, since media might be null for link.
                            type = People.RecentActivity.Core.FeedEntryInfoType.link;
                            var linkTile = null;
                            var href = attachment.href;
                            if (medias.length > 0) {
                                linkTile = medias[0].src;
                                href = (!Jx.isNonEmptyString(medias[0].href)) ? href : medias[0].href;
                            }

                            entryData = People.RecentActivity.Core.create_feedEntryLinkDataInfo(fbEntry.message, href, attachment.name, attachment.caption, attachment.description, linkTile);
                        }
                        else if (Jx.isNonEmptyString(fbEntry.message)) {
                            type = People.RecentActivity.Core.FeedEntryInfoType.text;
                            entryData = People.RecentActivity.Core.create_feedEntryStatusDataInfo(fbEntry.message);
                        }
                        else {
                            continue;
                        }                    
                    }

                    var publisher = this.socialCache.getContact(publisherId);
                    var data = People.RecentActivity.Core.create_feedEntryInfo(type, publisher, entryData, fbEntry.attribution, entities, this._getAnnotations$1(fbEntry), isShared);
                    var entry = People.RecentActivity.Core.create_feedObjectInfo(fbEntry.post_id, People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, data, fbEntry.permalink, People.RecentActivity.Providers.SocialHelper.getValidTime(fbEntry.created_time), commentDetail, [], reactionDetails, reactions);
                    entries.push(entry);
                }

                break;

            case 'profileInfo':
                this.socialCache.refreshContacts(result.fql_result_set);
                break;
        }

        this.setResponse(response, People.RecentActivity.Core.ResultCode.success, entries, null);

        // Pass photoIds, albumIds to next request.
        if (photoIds.length > 0 || albumIds.length > 0) {
            response.requestContext.requestState = [ photoIds, albumIds ];
        }    
    }
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeComments = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the comments.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeComments()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeComments()');
        return;
    }

    var comments = [];
    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        if (!People.RecentActivity.Providers.FacebookValidator.validateResultSet(result)) {
            continue;
        }

        switch (result.name) {
            case 'commentsInfo':
                for (var o = 0; o < result.fql_result_set.length; o++) {
                    var fbComment = result.fql_result_set[o];
                    var comment = this._toCommentInfo$1(fbComment);
                    if (comment != null) {
                        comments.push(comment);
                    }                
                }

                break;
            case 'profileInfo':
                // This result set contains detail contact info(id, name, pic)
                this.socialCache.refreshContacts(result.fql_result_set);
                break;
        }    
    }

    // When comments.Count equals to the max returned comments, it is mostly likely the actual number of
    // comments is bigger, so we still use original count.
    if (comments.length < 100) {
        response.requestContext.feedObject.commentDetails.count = comments.length;
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, comments, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeReactions = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the reactions.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeReactions()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeReactions()');
        return;
    }

    var reactions = [];
    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        if (!People.RecentActivity.Providers.FacebookValidator.validateResultSet(result)) {
            continue;
        }

        switch (result.name) {
            case 'likesInfo':
                for (var o = 0; o < result.fql_result_set.length; o++) {
                    var like = result.fql_result_set[o];
                    if (Jx.isNullOrUndefined(like.user_id)) {
                        Jx.log.write(3, People.Social.format('FacebookSerializer.DeserializeReactions({0}): null like.Uid', like.user_id));
                        continue;
                    }

                    var reaction = People.RecentActivity.Core.create_reactionInfo(this._likeReaction$1, this.socialCache.getContact(like.user_id.toString()));
                    reactions.push(reaction);
                }

                break;
            case 'profileInfo':
                // This result set contains detail contact info(id, name, pic)
                this.socialCache.refreshContacts(result.fql_result_set);
                break;
        }    
    }

    // When reactions.Count equals to the max returned likes, it is mostly likely the actual number of
    // likes is bigger, so we still use original count.
    if (reactions.length < 100) {
        this.setReactionCount(response.requestContext.feedObject, this._likeReaction$1.id, reactions.length);
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, reactions, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeComment = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the comment.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    // Only Id is returned from FB.
    var fbComment = responseObj;
    if (!Jx.isNonEmptyString(fbComment.id)) {
        Jx.log.write(3, People.Social.format('FacebookSerializer.DeserializeComment({0}): null or empty fbComment.Id!', fbComment.id));
    }

    var text = response.requestContext.comment.text;
    var comment = People.RecentActivity.Core.create_commentInfo(fbComment.id || '__fake_comment_id__', this.socialCache.meContact, new Date().getTime(), text, People.RecentActivity.Providers.EntityHelper.getLinkEntities(text));
    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, comment, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeReaction = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the reaction.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var reaction = People.RecentActivity.Core.create_reactionInfo(response.requestContext.reaction.type, this.socialCache.meContact);
    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, reaction, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeFeedExtraInfo = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the feed extra info.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeFeedExtraInfo()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeFeedExtraInfo()');
        return;
    }

    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        switch (result.name) {
            case 'albumInfo':
                this.socialCache.refreshAlbums(result.fql_result_set);
                break;
            case 'photoInfo':
                this.socialCache.refreshPhotos(null, result.fql_result_set);
                break;
            case 'profileInfo':
                this.socialCache.refreshContacts(result.fql_result_set);
                break;
        }    
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, responseObj, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeAlbumsOrPhotos = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the albums or photos.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeAlbumsOrPhotos()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The reponse format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeAlbumsOrPhotos()');
        return;
    }

    var objs = [];
    // A map from obj's Fb objId to the object.
    var objMap = {};
    var expectedResponse = response.requestContext.expectedResponse;
    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        if (!People.RecentActivity.Providers.FacebookValidator.validateResultSet(result)) {
            continue;
        }

        var obj = null;
        switch (result.name) {
            case 'albumInfo':
                for (var o = 0; o < result.fql_result_set.length; o++) {
                    var album = result.fql_result_set[o];
                    // Exclude empty albums.
                    if (album.size <= 0) {
                        continue;
                    }

                    if (!Jx.isNonEmptyString(album.aid)) {
                        continue;
                    }

                    obj = this.socialCache.getAlbum(album.aid);
                    if (expectedResponse === 7) {
                        objs.push(obj);
                        if (!Jx.isNullOrUndefined(album.object_id)) {
                            objMap[album.object_id.toString()] = obj;
                        }                    
                    }                
                }

                this.socialCache.refreshAlbums(result.fql_result_set);
                if (expectedResponse === 8 && result.fql_result_set.length > 0) {
                    var len = result.fql_result_set.length;
                    if (len !== 1) {
                        Jx.log.write(3, People.Social.format('FacebookSerializer.DeserializeAlbumsOrPhotos({0}): there are more than one album!', len));
                        continue;
                    }

                    if (obj != null) {
                        // This is a RefreshAlbum call, so we need to update the album as well.);
                        People.RecentActivity.Providers.SocialHelper.updateAlbum(response.requestContext.feedObject, obj);
                    }                
                }

                break;
            case 'photoInfo':
                if (expectedResponse === 8) {
                    // We are deserializing photos (as a result of RefreshPhotos call).
                    // Process photos in reverse (starting with the oldest), but assign indices starting from zero (to ensure proper sorting).
                    for (var i = result.fql_result_set.length - 1, index = 0; i >= 0; i--, index++) {
                        var photo = result.fql_result_set[i];
                        if (!People.RecentActivity.Providers.FacebookValidator.validatePhoto(photo)) {
                            continue;
                        }

                        obj = this.socialCache.getPhoto(photo.pid);
                        obj.data.index = index;
                        objs.push(obj);

                        if (!Jx.isNullOrUndefined(photo.object_id)) {
                            objMap[photo.object_id.toString()] = obj;
                        }                    
                    }

                    var feedObj = response.requestContext.feedObject;
                    if (feedObj.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum) {
                        var album = feedObj.data;
                        // Sometimes the Facebook returned album size is not the same as the real total photo count in the album.
                        album.totalCount = result.fql_result_set.length;
                    }                
                }

                // When deserializing albums, we still need this to refresh album cover photo info.
                this.socialCache.refreshPhotos(null, result.fql_result_set);
                break;
            case 'commentsInfo':
                var commentMap = {};
                for (var o = 0; o < result.fql_result_set.length; o++) {
                    var fbComment = result.fql_result_set[o];
                    if (!People.RecentActivity.Providers.FacebookValidator.validateComment(fbComment, true)) {
                        continue;
                    }

                    if (!!Jx.isUndefined(commentMap[fbComment.object_id.toString()])) {
                        commentMap[fbComment.object_id.toString()] = [];
                    }

                    (commentMap[fbComment.object_id.toString()]).push(this._toCommentInfo$1(fbComment));
                }

                for (var k in commentMap) {
                    var entry = { key: k, value: commentMap[k] };
                    obj = objMap[entry.key];
                    // Sometime there are comments for empty albums, which we don't show and are already excluded from the objMap.
                    if (obj == null) {
                        continue;
                    }

                    var comments = entry.value;
                    obj.commentDetails.count = comments.length;
                    // This is no way to get comment permission from Facebook for photo/album
                    obj.commentDetails.permissions = People.RecentActivity.Core.Permissions.add;
                    obj.comments = comments;
                }

                break;
            case 'likesInfo':
                var likeMap = {};
                for (var o = 0; o < result.fql_result_set.length; o++) {
                    var like = result.fql_result_set[o];
                    if (!People.RecentActivity.Providers.FacebookValidator.validateLike(like)) {
                        continue;
                    }

                    if (!!Jx.isUndefined(likeMap[like.object_id.toString()])) {
                        likeMap[like.object_id.toString()] = [];
                    }

                    (likeMap[like.object_id.toString()]).push(People.RecentActivity.Core.create_reactionInfo(this._likeReaction$1, this.socialCache.getContact(like.user_id.toString())));
                }

                for (var k in likeMap) {
                    var entry = { key: k, value: likeMap[k] };
                    obj = objMap[entry.key];
                    // Sometime there are likes for empty albums, which we don't show and are already excluded from the objMap.
                    if (obj == null) {
                        continue;
                    }

                    var likes = entry.value;
                    obj.reactionDetails = [ People.RecentActivity.Core.create_reactionDetailsInfo(this._likeReaction$1.id, likes.length, People.RecentActivity.Core.Permissions.full) ];
                    obj.reactions = likes;
                }

                break;
            case 'profileInfo':
                this.socialCache.refreshContacts(result.fql_result_set);
                break;
        }    
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, objs, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializePhotoTags = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the photo tags.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializePhotoTags()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializePhotoTags()');
        return;
    }

    var photoTags = [];
    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        if (!People.RecentActivity.Providers.FacebookValidator.validateResultSet(result)) {
            continue;
        }

        switch (result.name) {
            case 'photoTagInfo':
                for (var o = 0; o < result.fql_result_set.length; o++) {
                    var tag = result.fql_result_set[o];
                    if (!People.RecentActivity.Providers.FacebookValidator.validatePhotoTag(tag)) {
                        continue;
                    }

                    photoTags.push(People.RecentActivity.Core.create_photoTagInfo(this.socialCache.getContact(tag.subject.toString()), (!isNaN(tag.xcoord)) ? tag.xcoord : 0, (!isNaN(tag.ycoord)) ? tag.ycoord : 0, People.RecentActivity.Providers.SocialHelper.getValidTime(tag.created)));
                }

                break;
            case 'profileInfo':
                this.socialCache.refreshContacts(result.fql_result_set);
                break;
            case 'photoInfo':
                var len = result.fql_result_set.length;
                // We should only get one photo back.
                if (len !== 1) {
                    Jx.log.write(3, People.Social.format('FacebookSerializer.DeserializePhotoTags({0}): len is not 1!', len));
                    continue;
                }

                var photo = result.fql_result_set[0];
                if (!People.RecentActivity.Providers.FacebookValidator.validatePhoto(photo)) {
                    continue;
                }

                var obj = this.socialCache.getPhoto(photo.pid);
                this.socialCache.refreshPhotos(null, result.fql_result_set);
                People.RecentActivity.Providers.SocialHelper.updatePhoto(response.requestContext.feedObject, obj);
                break;
        }    
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, photoTags, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeNotifications = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the notifications.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeNotifications()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The reponse format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeNotifications()');
        return;
    }

    var notifications = [];
    var moreInfo = [];
    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        if (!People.RecentActivity.Providers.FacebookValidator.validateResultSet(result)) {
            continue;
        }

        if (result.name === 'notificationsInfo') {
            for (var i = result.fql_result_set.length - 1; i >= 0; i--) {
                var fbNotification = result.fql_result_set[i];
                if (!People.RecentActivity.Providers.FacebookValidator.validateNotification(fbNotification)) {
                    continue;
                }

                var notification = People.RecentActivity.Core.create_notificationInfo(fbNotification.notification_id, this.socialCache.getContact(fbNotification.sender_id.toString()), People.RecentActivity.Providers.SocialHelper.getValidTime(fbNotification.updated_time), fbNotification.title_text, fbNotification.object_id, this._getNotificationObjectType$1(fbNotification.object_type), fbNotification.href, response.requestContext.authInfo.networkName, response.requestContext.authInfo.userId.sourceId, false, false, !!fbNotification.is_unread);
                if (!Jx.isNonEmptyString(notification.objectId) || notification.objectType === People.RecentActivity.Core.NotificationInfoType.none) {
                    moreInfo.push(notification);
                }

                notifications.push(notification);
            }

        }
        else if (result.name === 'profileInfo') {
            // This result set contains detail contact info(id, name, pic)
            this.socialCache.refreshContacts(result.fql_result_set);
        }    
    }

    if (moreInfo.length > 0) {
        response.requestContext.requestState = [ moreInfo, this.socialCache ];
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, notifications, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeNotificationsExtraInfo = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the notifications extra info.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeNotificationsExtraInfo()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeNotificationsExtraInfo()');
        return;
    }

    var extraInfo = {};
    for (var n = 0; n < results.length; n++) {
        var result = results[n];
        if (Jx.isNonEmptyString(result.name)) {
            extraInfo[result.name] = result.fql_result_set;
        }    
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, extraInfo, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeUnreadNotificationsCount = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the unread notifications count.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var info = responseObj;
    if (info == null) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeUnreadNotificationsCount()');
        return;
    }

    var results = info.data;
    if (!People.RecentActivity.Providers.Utilities.isArray(results)) {
        // The response format is unexpected due to breaking changes at service side.
        this.setUnexpectedFormatResponse(response, 'FacebookSerializer.DeserializeUnreadNotificationsCount()');
        return;
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, results.length, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.deserializeFeedObjectInfo = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the add feed object response.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    // Only Id is returned from FB.
    var fbPost = responseObj;
    if (!Jx.isNonEmptyString(fbPost.id)) {
        // For some reason the call to Facebook was successful, but they didn't return the expected response.
        Jx.log.write(3, People.Social.format('FacebookSerializer.DeserializeFeedObjectInfo({0}): null or empty fbPost.Id!', fbPost.id));
        this.setResponse(response, People.RecentActivity.Core.ResultCode.success, null, null);
        return;
    }

    // Get the passed in objects.
    var feedObject = response.requestContext.feedObject;
    Debug.assert(feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'feedObject.Type == FeedObjectInfoType.Entry');
    var feedEntry = feedObject.data;
    // Locate the entities
    var entities = [];
    switch (feedEntry.type) {
        case People.RecentActivity.Core.FeedEntryInfoType.text:
            var statusData = feedEntry.data;
            entities = People.RecentActivity.Providers.EntityHelper.getLinkEntities(statusData.text);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.link:
            var linkData = feedEntry.data;
            entities = People.RecentActivity.Providers.EntityHelper.getLinkEntities(linkData.text);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.video:
            var videoData = feedEntry.data;
            entities = People.RecentActivity.Providers.EntityHelper.getLinkEntities(videoData.text);
            break;
        default:
            Debug.assert(false, 'Unsupported FeedEntryInfoType: ' + feedEntry.type.toString());
            break;
    }

    // Create the entry info.
    var newFeedEntry = People.RecentActivity.Core.create_feedEntryInfo(feedEntry.type, this.socialCache.meContact, feedEntry.data, null, entities, [], false);
    // Assume zero comments and reactions, full permissions.
    var commentDetails = People.RecentActivity.Core.create_commentDetailsInfo(0, true, People.RecentActivity.Core.Permissions.full);
    var reactionDetails = People.RecentActivity.Core.create_reactionDetailsInfo(this._likeReaction$1.id, 0, People.RecentActivity.Core.Permissions.full);
    // Create the new feed object.
    var newFeedObject = People.RecentActivity.Core.create_feedObjectInfo(fbPost.id, People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, newFeedEntry, null, new Date().getTime(), commentDetails, [], [ reactionDetails ], []);
    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, newFeedObject, null);
};

People.RecentActivity.Providers.FacebookSerializer.prototype.serializeFeedObject = function(obj) {
    /// <summary>
    ///     Serializes a feed object.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <returns type="String"></returns>
    Debug.assert(obj.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'obj.Type == FeedObjectInfoType.Entry');
    var entryInfo = obj.data;
    var formPost = new People.RecentActivity.Providers.UriQueryBuilder();
    switch (entryInfo.type) {
        case People.RecentActivity.Core.FeedEntryInfoType.text:
            var status = entryInfo.data;
            formPost.add('message', status.text);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.link:
            var link = entryInfo.data;
            formPost.add('message', link.text);
            formPost.add('name', link.title);
            formPost.add('caption', link.caption);
            formPost.add('description', link.description);
            formPost.add('picture', link.tile);
            formPost.add('link', link.url);
            break;
        case People.RecentActivity.Core.FeedEntryInfoType.video:
            var video = entryInfo.data;
            formPost.add('message', video.text);
            formPost.add('link', video.displayUrl);
            break;
        default:
            Debug.assert(false, 'Unsupported FeedEntryInfoType: ' + entryInfo.type.toString());
            break;
    }

    return formPost.toString();
};

People.RecentActivity.Providers.FacebookSerializer.prototype.updateResult = function(response, format, responseObj) {
    /// <summary>
    ///     Updates response result based on response obj if necessary.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="format" type="People.RecentActivity.Providers.ResponseFormat">The response format.</param>
    /// <param name="responseObj" type="Object">The response obj, if one was parsed, null otherwise.</param>
    var legacyRestError;
    var error;
    if ((error = this._getGraphError$1(responseObj)) != null) {
        Jx.log.write(2, People.Social.format('FacebookSerializer.UpdateResult(GraphError,{0},{1}', error.type, error.message));
        var errorCode = this.normalizeErrorCode(error.code);
        switch (errorCode) {
            case 190:
                response.resultInfo.code = People.RecentActivity.Core.ResultCode.invalidUserCredential;
                break;
            case 200:
                response.resultInfo.code = People.RecentActivity.Core.ResultCode.invalidPermissions;
                break;
            default:
                response.resultInfo.code = People.RecentActivity.Core.ResultCode.failure;
                break;
        }

        response.subErrorCode = errorCode;
        response.error = responseObj;
    }
    else if ((legacyRestError = this._getLegacyRestError$1(responseObj)) != null) {
        Jx.log.write(2, People.Social.format('FacebookSerializer.UpdateResult(LegacyRestError,{0},{1}', legacyRestError.error_code, legacyRestError.error_msg));
        var errorCode = this.normalizeErrorCode(legacyRestError.error_code);
        // Special handle for auth related failure.
        switch (errorCode) {
            case 190:
            case 200:
                response.resultInfo.code = People.RecentActivity.Core.ResultCode.invalidUserCredential;
                break;
            default:
                response.resultInfo.code = People.RecentActivity.Core.ResultCode.failure;
                break;
        }

        response.subErrorCode = errorCode;
        response.error = responseObj;
    }
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getLegacyRestError$1 = function(obj) {
    /// <param name="obj" type="Object"></param>
    /// <returns type="People.RecentActivity.Providers.Facebook.LegacyRestErrorInfo"></returns>
    var error = obj;
    if (error != null && !Jx.isUndefined(error.error_code)) {
        return error;
    }

    return null;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getGraphError$1 = function(obj) {
    /// <param name="obj" type="Object"></param>
    /// <returns type="People.RecentActivity.Providers.Facebook.GraphApiErrorInfo"></returns>
    var error = obj;
    if (error != null && error.error != null) {
        return error.error;
    }

    return null;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getAnnotations$1 = function(fbEntry) {
    /// <param name="fbEntry" type="People.RecentActivity.Providers.Facebook.FbFeedEntryInfo"></param>
    /// <returns type="Array" elementType="annotationInfo"></returns>
    if (Jx.isNullOrUndefined(fbEntry.target_id)) {
        return [];
    }

    return [ People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.wallPost, this.socialCache.getContact(fbEntry.target_id.toString())) ];
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getContactEntities$1 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Providers.Facebook.FbFeedEntryInfo"></param>
    /// <returns type="Array" elementType="entityInfo"></returns>
    var tags = entry.message_tags;
    if (!Jx.isNonEmptyString(entry.message) || tags == null || (!Jx.isUndefined(tags.length) && !tags.length)) {
        return [];
    }

    var entities = [];
    for (var i = 0, len = entry.message.length; i < len; i++) {
        var tag = (tags[i] == null) ? null : tags[i][0];
        if (tag != null && (tag.type === 'user' || tag.type === 'page')) {
            if (!People.RecentActivity.Providers.FacebookValidator.validateMessageTag(tag)) {
                continue;
            }

            var tagged = this.socialCache.getContact(tag.id.toString());
            var entity = People.RecentActivity.Core.create_entityInfo(People.RecentActivity.Core.EntityInfoType.contact, tagged, tag.offset, tag.length);
            entities.push(entity);
        }    
    }

    return entities;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getMediaInfo$1 = function(attachment) {
    /// <param name="attachment" type="People.RecentActivity.Providers.Facebook.AttachmentInfo"></param>
    /// <returns type="Array" elementType="MediaInfo"></returns>
    var media = attachment.media;
    if (People.RecentActivity.Providers.Utilities.isArray(media)) {
        return media;
    }

    return [];
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getCommentDetailsInfo$1 = function(fbEntry) {
    /// <param name="fbEntry" type="People.RecentActivity.Providers.Facebook.FbFeedEntryInfo"></param>
    /// <returns type="People.RecentActivity.Core.create_commentDetailsInfo"></returns>
    var count = (People.RecentActivity.Providers.FacebookValidator.validateCommentsInfo(fbEntry.comment_info)) ? fbEntry.comment_info.comment_count : 0;
    // Gets comment and reaction info.
    var commentDetail = People.RecentActivity.Core.create_commentDetailsInfo(count, true, this._getCommentPermission$1(fbEntry.comment_info));
    commentDetail.icon = People.RecentActivity.Platform.Configuration.instance.getCommentIcon(People.RecentActivity.Core.NetworkId.facebook);
    commentDetail.maximumLength = -1;
    return commentDetail;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getCommentPermission$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Providers.Facebook.FbFeedEntryCommentsInfo"></param>
    /// <returns type="People.RecentActivity.Core.Permissions"></returns>
    var permission = People.RecentActivity.Core.Permissions.none;
    if (info != null && info.can_comment) {
        permission |= People.RecentActivity.Core.Permissions.add;
    }

    return permission;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getReactionDetailsInfo$1 = function(fbEntry) {
    /// <param name="fbEntry" type="People.RecentActivity.Providers.Facebook.FbFeedEntryInfo"></param>
    /// <returns type="Array" elementType="reactionDetailsInfo"></returns>
    var count = (People.RecentActivity.Providers.FacebookValidator.validateLikesInfo(fbEntry.likes)) ? fbEntry.likes.count : 0;
    var reactionDetailsInfo = People.RecentActivity.Core.create_reactionDetailsInfo(this._likeReaction$1.id, count, this._getLikePermission$1(fbEntry.likes));
    return [ reactionDetailsInfo ];
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getLikePermission$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Providers.Facebook.FbFeedEntryLikesInfo"></param>
    /// <returns type="People.RecentActivity.Core.Permissions"></returns>
    return (info != null && info.can_like) ? People.RecentActivity.Core.Permissions.full : People.RecentActivity.Core.Permissions.none;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._populatePhotoId$1 = function(photoIds, pid) {
    /// <param name="photoIds" type="Array"></param>
    /// <param name="pid" type="String"></param>
    if (photoIds.indexOf(pid) === -1) {
        photoIds.push(pid);
    }
};

People.RecentActivity.Providers.FacebookSerializer.prototype._populateAlbumId$1 = function(albumIds, aid) {
    /// <param name="albumIds" type="Array"></param>
    /// <param name="aid" type="String"></param>
    if (albumIds.indexOf(aid) === -1) {
        albumIds.push(aid);
    }
};

People.RecentActivity.Providers.FacebookSerializer.prototype._populatePhotoInfo$1 = function(photo, media) {
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="media" type="People.RecentActivity.Providers.Facebook.MediaInfo"></param>
    photo.url = media.href;
    if (!Jx.isNullOrUndefined(media.photo.fbid)) {
        photo.id = media.photo.fbid.toString();
    }

    var photoInfo = photo.data;

    // Index is available from response here, and Facebook returns index 1 based, make it 0 based.
    if (!Jx.isNullOrUndefined(media.photo.index) && media.photo.index > 0) {
        photoInfo.index = media.photo.index - 1;
    }

    photoInfo.albumId = media.photo.aid;

    if (!Jx.isNullOrUndefined(media.photo.owner)) {
        photoInfo.owner = this.socialCache.getContact(media.photo.owner.toString());
    }

    photoInfo.caption = media.alt;
    photoInfo.source = photoInfo.thumbnailSource = photoInfo.originalSource = this._getHiResImgSource(media.src);

    var height = media.photo.height;
    if (!isNaN(height)) {
        photoInfo.sourceHeight = photoInfo.thumbnailSourceHeight = photoInfo.originalSourceHeight = height;
    }

    var width = media.photo.width;
    if (!isNaN(width)) {
        photoInfo.sourceWidth = photoInfo.thumbnailSourceWidth = photoInfo.originalSourceWidth = width;
    }
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getHiResImgSource = function (sourceUri) {
    /// <param name="sourceUri" type="String">URI for the image</param>

    // currently known way to get Hi-Res image in the most performant way is to replace_s by _n at the end of the URI
    var hiResImgSource = sourceUri;

    if (!Jx.isNullOrUndefined(sourceUri)) {
        var strToReplace = '_s.jpg';
        // make sure that the string being replaced is at the end of the URI
        if (sourceUri.indexOf(strToReplace) === (sourceUri.length - strToReplace.length)) {
            hiResImgSource = sourceUri.replace(strToReplace, '_n.jpg');
        }
    }
    return hiResImgSource;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._populateAlbumFromPhoto$1 = function (album, photo) {
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    var photoInfo = photo.data;
    var albumInfo = album.data;
    albumInfo.owner = photoInfo.owner;
    albumInfo.totalCount = 1;
    albumInfo.cover = photo;
    albumInfo.photos = People.RecentActivity.Providers.SocialHelper.mergePhotos(albumInfo.photos, [photo], false);
};

People.RecentActivity.Providers.FacebookSerializer.prototype._populateAlbum$1 = function(album, photos, attachment) {
    /// <param name="album" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="photos" type="Array"></param>
    /// <param name="attachment" type="People.RecentActivity.Providers.Facebook.AttachmentInfo"></param>
    var albumInfo = album.data;
    var photo = photos[0];
    albumInfo.owner = (photo.data).owner;
    albumInfo.photos = People.RecentActivity.Providers.SocialHelper.mergePhotos(albumInfo.photos, photos, false);
    albumInfo.name = attachment.name;
    albumInfo.description = attachment.description;
    album.url = attachment.href;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._toCommentInfo$1 = function(fbComment) {
    /// <param name="fbComment" type="People.RecentActivity.Providers.Facebook.FbCommentInfo"></param>
    /// <returns type="People.RecentActivity.Core.create_commentInfo"></returns>
    if (!People.RecentActivity.Providers.FacebookValidator.validateComment(fbComment, false)) {
        return null;
    }

    return People.RecentActivity.Core.create_commentInfo(fbComment.id, this.socialCache.getContact(fbComment.fromid.toString()), People.RecentActivity.Providers.SocialHelper.getValidTime(fbComment.time), fbComment.text, People.RecentActivity.Providers.EntityHelper.getLinkEntities(fbComment.text));
};

People.RecentActivity.Providers.FacebookSerializer.prototype._toReactionInfoArray$1 = function(likes) {
    /// <param name="likes" type="People.RecentActivity.Providers.Facebook.FbFeedEntryLikesInfo"></param>
    /// <returns type="Array" elementType="reactionInfo"></returns>
    var reactions = [];
    if (likes == null) {
        return reactions;
    }

    if (likes.user_likes) {
        var reaction = People.RecentActivity.Core.create_reactionInfo(this._likeReaction$1, this.socialCache.meContact);
        reactions.push(reaction);
    }

    if (People.RecentActivity.Providers.Utilities.isArray(likes.friends)) {
        for (var n = 0; n < likes.friends.length; n++) {
            var userId = likes.friends[n];
            var reaction = People.RecentActivity.Core.create_reactionInfo(this._likeReaction$1, this.socialCache.getContact(userId.toString()));
            reactions.push(reaction);
        }    
    }

    if (People.RecentActivity.Providers.Utilities.isArray(likes.sample)) {
        for (var n = 0; n < likes.sample.length; n++) {
            var userId = likes.sample[n];
            var reaction = People.RecentActivity.Core.create_reactionInfo(this._likeReaction$1, this.socialCache.getContact(userId.toString()));
            reactions.push(reaction);
        }    
    }

    return reactions;
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getVideoType$1 = function(video) {
    /// <param name="video" type="People.RecentActivity.Providers.Facebook.FbVideoInfo"></param>
    /// <returns type="People.RecentActivity.Core.FeedEntryVideoDataInfoType"></returns>
    switch (video.source_type) {
        case 'html':
            return People.RecentActivity.Core.FeedEntryVideoDataInfoType.embed;
        case 'raw':
            return People.RecentActivity.Core.FeedEntryVideoDataInfoType.raw;
        default:
            return People.RecentActivity.Core.FeedEntryVideoDataInfoType.none;
    }
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getNotificationObjectType$1 = function(objectType) {
    /// <param name="objectType" type="String"></param>
    /// <returns type="People.RecentActivity.Core.NotificationInfoType"></returns>
    if (objectType == null) {
        return People.RecentActivity.Core.NotificationInfoType.none;
    }

    switch (objectType.toLowerCase()) {
        case 'stream':
            return People.RecentActivity.Core.NotificationInfoType.entry;
        case 'photo':
            return People.RecentActivity.Core.NotificationInfoType.photo;
        case 'album':
            return People.RecentActivity.Core.NotificationInfoType.photoAlbum;
        case 'video':
            return People.RecentActivity.Core.NotificationInfoType.video;
        case 'friend':
            return People.RecentActivity.Core.NotificationInfoType.person;
        default:
            return People.RecentActivity.Core.NotificationInfoType.none;
    }
};

People.RecentActivity.Providers.FacebookSerializer.prototype._getSharedObjectType$1 = function(attachment) {
    /// <param name="attachment" type="People.RecentActivity.Providers.Facebook.AttachmentInfo"></param>
    /// <returns type="People.RecentActivity.Core.FeedObjectInfoType"></returns>
    var isShared = false;
    var isAlbum = false;
    if (People.RecentActivity.Providers.Utilities.isArray(attachment.properties)) {
        for (var n = 0; n < attachment.properties.length; n++) {
            var property = attachment.properties[n];
            if (Jx.isNullOrUndefined(property.name)) {
                continue;
            }

            var name = property.name.toString().toUpperCase();
            if (name === 'BY') {
                isShared = true;
            }
            else if (name === 'PHOTOS') {
                isAlbum = true;
            }        
        }    
    }

    if (!isShared) {
        return People.RecentActivity.Core.FeedObjectInfoType.none;
    }

    if (isAlbum) {
        return People.RecentActivity.Core.FeedObjectInfoType.photoAlbum;
    }

    return People.RecentActivity.Core.FeedObjectInfoType.photo;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\AnnotationInfo.js" />
/// <reference path="..\..\Core\AnnotationInfoType.js" />
/// <reference path="..\..\Core\AnnotationRetweetInfo.js" />
/// <reference path="..\..\Core\CommentDetailsInfo.js" />
/// <reference path="..\..\Core\CommentInfo.js" />
/// <reference path="..\..\Core\EntityInfo.js" />
/// <reference path="..\..\Core\EntityInfoType.js" />
/// <reference path="..\..\Core\FeedEntryInfo.js" />
/// <reference path="..\..\Core\FeedEntryInfoType.js" />
/// <reference path="..\..\Core\FeedEntryPhotoDataInfo.js" />
/// <reference path="..\..\Core\FeedEntryStatusDataInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfo.js" />
/// <reference path="..\..\Core\FeedObjectInfoType.js" />
/// <reference path="..\..\Core\Helpers\DateTimeHelper.js" />
/// <reference path="..\..\Core\LinkEntityInfo.js" />
/// <reference path="..\..\Core\NetworkId.js" />
/// <reference path="..\..\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\Core\Permissions.js" />
/// <reference path="..\..\Core\PhotoAlbumInfo.js" />
/// <reference path="..\..\Core\ReactionDetailsInfo.js" />
/// <reference path="..\..\Core\ReactionInfo.js" />
/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Platform\Configuration.js" />
/// <reference path="..\Cache\SocialCache.js" />
/// <reference path="..\Helpers\EntityHelper.js" />
/// <reference path="..\Helpers\SocialHelper.js" />
/// <reference path="..\Utilities.js" />
/// <reference path="..\Validators\SupValidator.js" />
/// <reference path="Serializer.js" />

People.RecentActivity.Providers.SupSerializer = function(socialCache) {
    /// <summary>
    ///     Represents sup serializer.
    /// </summary>
    /// <param name="socialCache" type="People.RecentActivity.Providers.SocialCache">The social in memory cache.</param>
    /// <field name="_atomNamespace$1" type="String" static="true">The namespace for ATOM properties.</field>
    /// <field name="_liveNamespace$1" type="String" static="true">The namespace for Live properties.</field>
    /// <field name="_queriedServicesHeaderError$1" type="String" static="true">The property name for error in QueriedServicesError header.</field>
    /// <field name="_emoji$1" type="String" static="true">The first unicode char for an emoji, which consists of two unicode chars.</field>
    /// <field name="_shareAnythingNamespaces$1" type="String" static="true">The namespaces for doing lookups in ShareAnything responses.</field>
    /// <field name="_retweetReaction$1" type="People.RecentActivity.Core.create_networkReactionInfo"></field>
    /// <field name="_favoriteReaction$1" type="People.RecentActivity.Core.create_networkReactionInfo"></field>
    this._retweetReaction$1 = People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.retweet);
    this._favoriteReaction$1 = People.RecentActivity.Platform.Configuration.instance.getNetworkReactionInfoByType(People.RecentActivity.Core.NetworkReactionInfoType.favorite);
    People.RecentActivity.Providers.Serializer.call(this, socialCache);
};

Jx.inherit(People.RecentActivity.Providers.SupSerializer, People.RecentActivity.Providers.Serializer);


People.RecentActivity.Providers.SupSerializer._atomNamespace$1 = 'http://www.w3.org/2005/Atom';
People.RecentActivity.Providers.SupSerializer._liveNamespace$1 = 'http://api.live.com/schemas';
People.RecentActivity.Providers.SupSerializer._queriedServicesHeaderError$1 = 'Error=';
People.RecentActivity.Providers.SupSerializer._emoji$1 = '\ud83d';
People.RecentActivity.Providers.SupSerializer._shareAnythingNamespaces$1 = null;
(function() {
    People.RecentActivity.Providers.SupSerializer._shareAnythingNamespaces$1 = People.Social.format('xmlns:atom="{0}" xmlns:live="{1}"', 'http://www.w3.org/2005/Atom', 'http://api.live.com/schemas');
})();
People.RecentActivity.Providers.SupSerializer.prototype.deserializeFeedEntries = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the feed entries.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var feedResponse = responseObj;
    // If feedResponse.Activities doesn't exist, then it should be a single activity response.
    var feed = feedResponse.Activities || [ responseObj ];
    this._deserializeFeedEntriesInternal$1(feed, response);
};

People.RecentActivity.Providers.SupSerializer.prototype.deserializeComments = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the comments.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var reactionResponse = responseObj;
    var comments = [];
    if (reactionResponse.ReplyReaction == null) {
        Jx.log.write(3, People.Social.format('SupSerializer.DeserializeComments({0}): null reactionResponse.ReplyReaction!', reactionResponse.ReplyReaction));
    }
    else {
        var replies = reactionResponse.ReplyReaction.Replies;
        if (People.RecentActivity.Providers.Utilities.isArray(replies)) {
            for (var n = 0; n < replies.length; n++) {
                var reply = replies[n];
                var comment = this._toCommentInfo$1(reply);
                if (comment != null) {
                    comments.push(comment);
                }            
            }        
        }    
    }

    response.requestContext.feedObject.commentDetails.count = comments.length;
    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, comments, null);
};

People.RecentActivity.Providers.SupSerializer.prototype.deserializeReactions = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the reactions.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var reactionResponse = responseObj;
    var reactions = [];
    var reactionTypeId = null;
    var reactionType = response.requestContext.reactionType;
    var count = 0;
    switch (reactionType) {
        case People.RecentActivity.Core.NetworkReactionInfoType.retweet:
            reactionTypeId = this._retweetReaction$1.id;
            if (reactionResponse.RetweetReaction == null) {
                Jx.log.write(3, People.Social.format('SupSerializer.DeserializeReactions({0}): null reactionResponse.RetweetReaction!', reactionResponse.RetweetReaction));
                break;
            }

            var retweets = reactionResponse.RetweetReaction.Retweets;
            count = reactionResponse.RetweetReaction.Count;
            if (isNaN(count)) {
                Jx.log.write(3, People.Social.format('SupSerializer.DeserializeReactions({0})', count));
                count = 0;
            }

            if (People.RecentActivity.Providers.Utilities.isArray(retweets)) {
                for (var n = 0; n < retweets.length; n++) {
                    var retweet = retweets[n];
                    if (!People.RecentActivity.Providers.SupValidator.validateRetweet(retweet)) {
                        continue;
                    }

                    var reaction = People.RecentActivity.Core.create_reactionInfo(this._retweetReaction$1, this._toContactInfo$1(retweet.Author));
                    reactions.push(reaction);
                }            
            }

            break;
        case People.RecentActivity.Core.NetworkReactionInfoType.favorite:
            reactionTypeId = this._favoriteReaction$1.id;
            if (reactionResponse.FavoriteReaction == null) {
                Jx.log.write(3, People.Social.format('SupSerializer.DeserializeReactions({0}): null reactionResponse.FavoriteReaction!', reactionResponse.FavoriteReaction));
                break;
            }

            var reacted = reactionResponse.FavoriteReaction.HasReacted;
            if (Jx.isNullOrUndefined(reacted)) {
                Jx.log.write(3, People.Social.format('SupSerializer.DeserializeReactions({0}): null reacted!', reacted));
            }

            if (reacted) {
                count = 1;
                reactions.push(People.RecentActivity.Core.create_reactionInfo(this._favoriteReaction$1, this.socialCache.meContact));
            }

            break;
        default:
            Debug.assert(false, 'Unrecognized reaction type: ' + reactionType);
            break;
    }

    this.setReactionCount(response.requestContext.feedObject, reactionTypeId, count);
    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, reactions, null);
};

People.RecentActivity.Providers.SupSerializer.prototype.deserializeComment = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the comment.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var reply = responseObj;
    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, this._toCommentInfo$1(reply), null);
};

People.RecentActivity.Providers.SupSerializer.prototype.deserializeReaction = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the reaction.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var reactionContent = responseObj;
    var reactionType = response.requestContext.reaction.type.type;
    var reaction = null;
    switch (reactionType) {
        case People.RecentActivity.Core.NetworkReactionInfoType.retweet:
            People.RecentActivity.Providers.SupValidator.validateRetweet(reactionContent);
            reaction = People.RecentActivity.Core.create_reactionInfo(this._retweetReaction$1, this._toContactInfo$1(reactionContent.Author));
            break;
        case People.RecentActivity.Core.NetworkReactionInfoType.favorite:
            reaction = People.RecentActivity.Core.create_reactionInfo(this._favoriteReaction$1, this.socialCache.meContact);
            break;
        default:
            Debug.assert(false, 'Unrecognized reaction type: ' + reactionType);
            break;
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, reaction, null);
};

People.RecentActivity.Providers.SupSerializer.prototype.deserializeNotifications = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the notifications.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    var feedResponse = responseObj;
    var feed = feedResponse.Notifications;
    this._deserializeFeedEntriesInternal$1(feed, response);
};

People.RecentActivity.Providers.SupSerializer.prototype.deserializeFeedObjectInfo = function(response, responseObj) {
    /// <summary>
    ///     Deserializes the add feed object response.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="responseObj" type="Object">The response obj.</param>
    // The response doesn't contain the post ID (and is unusable), just return null and deal with it upstream.
    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, null, null);
};

People.RecentActivity.Providers.SupSerializer.prototype.updateResult = function(response, format, responseObj) {
    /// <summary>
    ///     Updates response result based on response obj if necessary.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="format" type="People.RecentActivity.Providers.ResponseFormat">The response format.</param>
    /// <param name="responseObj" type="Object">The response obj, if one was parsed, null otherwise.</param>
    switch (format) {
        case 1:
            if (!response.success) {
                // Reset code to generic failure for sup case, since InvalidUserCredential should come from header if any.
                response.resultInfo.code = People.RecentActivity.Core.ResultCode.failure;
            }

            if (responseObj != null) {
                var error = responseObj;
                if (!Jx.isUndefined(error.Status)) {
                    Jx.log.write(4, People.Social.format('SupSerializer.UpdateResult(SupError,{0},{1})', error.Status, error.Message));
                    response.error = responseObj;
                }            
            }

            break;
        case 3:
            if (responseObj != null) {
                // Check the body for the error subcode
                var doc = responseObj;
                var node = doc.selectSingleNodeNS('/atom:entry/live:subCode/text()', People.RecentActivity.Providers.SupSerializer._shareAnythingNamespaces$1);
                if (node != null) {
                    // Capture the error subcode.
                    response.subErrorCode = parseInt(node.nodeValue);
                }            
            }

            break;
    }

    // "Check for network-specific errors.
    var code = this._getResultCodeFromQueriedServicesHeader$1(response, People.RecentActivity.Core.NetworkId.twitter);
    if (code !== People.RecentActivity.Core.ResultCode.none) {
        // Override the code with 
        response.resultInfo.code = code;
    }
};

People.RecentActivity.Providers.SupSerializer.prototype.serializeFeedObject = function(obj) {
    /// <summary>
    ///     Serializes a feed object.
    /// </summary>
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo">The feed object.</param>
    /// <returns type="String"></returns>
    Debug.assert(obj.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'obj.Type == FeedObjectInfoType.Entry');
    var entry = obj.data;
    Debug.assert(entry.type === People.RecentActivity.Core.FeedEntryInfoType.text, 'entry.Type == FeedEntryInfoType.Text');
    var text = entry.data;
    var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
    var xmlEntry = xmlDoc.createElementNS('http://www.w3.org/2005/Atom', 'entry');
    var xmlTitle = xmlDoc.createElementNS('http://www.w3.org/2005/Atom', 'title');
    xmlDoc.appendChild(xmlEntry);
    xmlEntry.appendChild(xmlTitle);
    xmlTitle.appendChild(xmlDoc.createTextNode(text.text));
    var xmlNetworks = xmlDoc.createElementNS('http://api.live.com/schemas', 'live:networks');
    var xmlSourceId = xmlDoc.createElementNS('http://api.live.com/schemas', 'live:sourceId');
    xmlEntry.appendChild(xmlNetworks);
    xmlNetworks.appendChild(xmlSourceId);
    xmlSourceId.appendChild(xmlDoc.createTextNode(obj.sourceId));
    return xmlDoc.getXml();
};

People.RecentActivity.Providers.SupSerializer.prototype._deserializeFeedEntriesInternal$1 = function(feed, response) {
    /// <param name="feed" type="Array" elementType="FeedEntry"></param>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse"></param>
    if (!People.RecentActivity.Providers.Utilities.isArray(feed)) {
        this.setUnexpectedFormatResponse(response, 'SupSerializer.DeserializeFeedEntriesInternal()');
        return;
    }

    var entries = [];
    var feedLength = feed.length;
    response.requestContext.numEntriesReceived = feedLength;

    for (var n = 0; n < feedLength; n++) {
        var feedEntry = feed[n];
        if (!People.RecentActivity.Providers.SupValidator.validateFeedEntry(feedEntry)) {
            continue;
        }

        var entryData;
        var type;
        var entry = feedEntry;
        var timeStamp = People.RecentActivity.Core.DateTimeHelper.parseTimeStamp(entry.Published);
        var url = People.RecentActivity.Providers.SocialHelper.getTwitterEntryUrl(entry.Author.ScreenName, entry.ObjectId);
        if (entry.OriginalActivity != null) {
            entry = entry.OriginalActivity;
        }

        var author = this._toContactInfo$1(entry.Author);
        var entities = this._getEntities$1(entry.Message);
        var annotations = this._getAnnotations$1(feedEntry);
        var commentDetail = this._getCommentDetails$1(entry);
        var reactionDetails = this._getReactionDetails$1(entry);
        var reactions = this._getReactions$1(entry);
        switch (entry.Type) {
            case 'Photo':
                type = People.RecentActivity.Core.FeedEntryInfoType.photo;

                var p = entry.Photo;
                if (p == null) {
                    Jx.log.write(3, People.Social.format('SupSerializer.DeserializeFeedEntriesInternal({0}): null entry.Photo!', p));
                    continue;
                }

                p.author = entry.Author;
                p.url = url;
                p.timestamp = timeStamp.getTime();

                // Sometimes photo doesn't have a object id in twitter.
                if (!Jx.isNonEmptyString(p.ObjectId)) {
                    p.ObjectId = entry.ObjectId + '_p';
                }

                p.activityObjectId = entry.ObjectId;

                var photo = this.socialCache.getPhoto(entry.Photo.ObjectId);
                this.socialCache.refreshPhoto(entry, entry.Photo);

                // Photo should have the same reactions as entry.
                photo.commentDetails = commentDetail;
                photo.reactionDetails = reactionDetails;
                photo.reactions = reactions;

                var photoInfo = photo.data;
                photoInfo.caption = (entry.Message != null) ? entry.Message.Text : '';
                photoInfo.entities = entities;

                // Create a fake album for all Twitter photo.
                var albumInfo = People.RecentActivity.Core.create_photoAlbumInfo(photoInfo.albumId, photoInfo.owner, '', '', [], 1, photo, [ photo ]);
                var commentInfo = People.RecentActivity.Core.create_commentDetailsInfo(0, entry.SourceId !== People.RecentActivity.Core.NetworkId.twitter, People.RecentActivity.Core.Permissions.none);
                commentInfo.icon = People.RecentActivity.Platform.Configuration.instance.getCommentIcon(entry.SourceId);
                var album = People.RecentActivity.Core.create_feedObjectInfo(albumInfo.id, photo.sourceId, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, albumInfo, null, photo.timestamp, commentInfo, [], [], []);

                entryData = People.RecentActivity.Core.create_feedEntryPhotoDataInfo(photoInfo.caption, photo, album, false);
                break;

            default:
                // It wasn't a photo, since this is just Twitter we should treat everything else as a message.
                if (!People.RecentActivity.Providers.SupValidator.validateMessage(entry.Message)) {
                    continue;
                }

                // We render twitter links and videos as text entry.
                type = People.RecentActivity.Core.FeedEntryInfoType.text;
                entryData = People.RecentActivity.Core.create_feedEntryStatusDataInfo(entry.Message.Text);
                break;
        }

        var entryInfo = People.RecentActivity.Core.create_feedEntryInfo(type, author, entryData, entry.Attribution, entities, annotations, false);

        if (Jx.isNonEmptyString(entry.InReplyToObjectId)) {
            entryInfo.parentId = entry.InReplyToObjectId;
        }

        var obj = People.RecentActivity.Core.create_feedObjectInfo(entry.ObjectId, entry.SourceId, People.RecentActivity.Core.FeedObjectInfoType.entry, entryInfo, url, timeStamp.getTime(), commentDetail, [], reactionDetails, reactions);
        entries.unshift(obj);
    }

    this.setResponse(response, People.RecentActivity.Core.ResultCode.success, entries, null);
};

People.RecentActivity.Providers.SupSerializer.prototype._toContactInfo$1 = function(contact) {
    /// <param name="contact" type="People.RecentActivity.Providers.Sup.User"></param>
    /// <returns type="People.RecentActivity.Core.create_contactInfo"></returns>
    Debug.assert(contact != null, 'contact != null');
    var contactInfo = this.socialCache.getContact(contact.ObjectId);
    this.socialCache.refreshContact(contact);
    return contactInfo;
};

People.RecentActivity.Providers.SupSerializer.prototype._toCommentInfo$1 = function(reply) {
    /// <param name="reply" type="People.RecentActivity.Providers.Sup.ReactionContent"></param>
    /// <returns type="People.RecentActivity.Core.create_commentInfo"></returns>
    if (!People.RecentActivity.Providers.SupValidator.validateReply(reply)) {
        return null;
    }

    return People.RecentActivity.Core.create_commentInfo(reply.ObjectId, this._toContactInfo$1(reply.Author), People.RecentActivity.Core.DateTimeHelper.parseTimeStamp(reply.Published).getTime(), reply.Message.Text, this._getEntities$1(reply.Message));
};

People.RecentActivity.Providers.SupSerializer.prototype._getReactions$1 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Providers.Sup.FeedEntry"></param>
    /// <returns type="Array" elementType="reactionInfo"></returns>
    var reactions = [];
    if (entry.Reactions != null && entry.Reactions.FavoriteReaction != null && entry.Reactions.FavoriteReaction.HasReacted) {
        var favoriteReaction = People.RecentActivity.Core.create_reactionInfo(this._favoriteReaction$1, this.socialCache.meContact);
        reactions = [ favoriteReaction ];
    }

    return reactions;
};

People.RecentActivity.Providers.SupSerializer.prototype._getReactionDetails$1 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Providers.Sup.FeedEntry"></param>
    /// <returns type="Array" elementType="reactionDetailsInfo"></returns>
    var reactionDetails = [];
    var count = 0;
    var permission = People.RecentActivity.Core.Permissions.none;
    if (People.RecentActivity.Providers.SupValidator.validateRetweetDetail(entry.Reactions)) {
        var retweet = entry.Reactions.RetweetReaction;
        count = (!isNaN(retweet.Count)) ? retweet.Count : 0;
        permission = (retweet.CanReact) ? People.RecentActivity.Core.Permissions.add : People.RecentActivity.Core.Permissions.none;
    }

    var reactionInfo = this._retweetReaction$1;
    var reactionDetail = People.RecentActivity.Core.create_reactionDetailsInfo(reactionInfo.id, count, permission);
    reactionDetails.push(reactionDetail);
    count = 0;
    permission = People.RecentActivity.Core.Permissions.none;
    if (People.RecentActivity.Providers.SupValidator.validateFavoriteDetail(entry.Reactions)) {
        var favorite = entry.Reactions.FavoriteReaction;
        count = (favorite.HasReacted) ? 1 : 0;
        permission = (favorite.CanReact) ? People.RecentActivity.Core.Permissions.full : People.RecentActivity.Core.Permissions.none;
    }

    reactionInfo = this._favoriteReaction$1;
    reactionDetail = People.RecentActivity.Core.create_reactionDetailsInfo(reactionInfo.id, count, permission);
    reactionDetails.push(reactionDetail);
    return reactionDetails;
};

People.RecentActivity.Providers.SupSerializer.prototype._getCommentDetails$1 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Providers.Sup.FeedEntry"></param>
    /// <returns type="People.RecentActivity.Core.create_commentDetailsInfo"></returns>
    var count = 0, limit = 0;
    var permission = People.RecentActivity.Core.Permissions.none;
    if (People.RecentActivity.Providers.SupValidator.validateReplyDetail(entry.Reactions)) {
        var reply = entry.Reactions.ReplyReaction;
        count = (!isNaN(reply.Count)) ? reply.Count : 0;
        permission = (reply.CanReact) ? People.RecentActivity.Core.Permissions.full : People.RecentActivity.Core.Permissions.none;
        limit = (!isNaN(reply.TextLimit)) ? reply.TextLimit : 0;
    }

    var commentDetail = People.RecentActivity.Core.create_commentDetailsInfo(count, entry.SourceId !== People.RecentActivity.Core.NetworkId.twitter, permission);
    commentDetail.icon = People.RecentActivity.Platform.Configuration.instance.getCommentIcon(entry.SourceId);
    if (limit > 0) {
        commentDetail.maximumLength = limit;
    }

    if (entry.SourceId === People.RecentActivity.Core.NetworkId.twitter) {
        // we should also set the prefix.
        commentDetail.prefix = People.RecentActivity.Providers.SocialHelper.getTwitterCommentPrefix(entry.Author.ScreenName);
    }

    return commentDetail;
};

People.RecentActivity.Providers.SupSerializer.prototype._getAnnotations$1 = function(entry) {
    /// <param name="entry" type="People.RecentActivity.Providers.Sup.FeedEntry"></param>
    /// <returns type="Array" elementType="annotationInfo"></returns>
    // process annotations
    var annotations = [];
    if ((entry.OriginalActivity != null) && (entry.ResharedMessage != null)) {
        // This is a Twitter retweet.
        var info = People.RecentActivity.Core.create_annotationRetweetInfo(this._toContactInfo$1(entry.Author), entry.ResharedMessage.Text);
        annotations.push(People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.retweetedBy, info));
    }

    if (Jx.isNonEmptyString(entry.InReplyToObjectId) && entry.InReplyToUser != null) {
        annotations.push(People.RecentActivity.Core.create_annotationInfo(People.RecentActivity.Core.AnnotationInfoType.inReplyTo, this._toContactInfo$1(entry.InReplyToUser)));
    }

    return annotations;
};

People.RecentActivity.Providers.SupSerializer.prototype._getEntities$1 = function(message) {
    /// <param name="message" type="People.RecentActivity.Providers.Sup.Message"></param>
    /// <returns type="Array" elementType="entityInfo"></returns>
    if (message == null || !People.RecentActivity.Providers.Utilities.isArray(message.Entities)) {
        Jx.log.write(3, 'SupSerializer.GetEntities()');
        return [];
    }

    // Process entities.
    var entities = [];
    for (var n = 0; n < message.Entities.length; n++) {
        var entity = message.Entities[n];
        if (!People.RecentActivity.Providers.SupValidator.validateEntity(entity)) {
            continue;
        }

        var entityType = People.RecentActivity.Core.EntityInfoType.none;
        var data = null;
        switch (entity.Type) {
            case 'UserMention':
                entityType = People.RecentActivity.Core.EntityInfoType.contact;
                if (!People.RecentActivity.Providers.SupValidator.validateContact(entity.User)) {
                    continue;
                }

                data = this._toContactInfo$1(entity.User);
                break;
            case 'Hashtag':
                entityType = People.RecentActivity.Core.EntityInfoType.hashTag;
                if (!People.RecentActivity.Providers.SupValidator.validateLink(entity.Link)) {
                    continue;
                }

                data = entity.Link.Url;
                break;
            case 'Url':
                entityType = People.RecentActivity.Core.EntityInfoType.link;
                if (!People.RecentActivity.Providers.SupValidator.validateLink(entity.Link)) {
                    continue;
                }

                data = People.RecentActivity.Core.create_linkEntityInfo(entity.DisplayUrl || entity.Link.Url, entity.Link.Url);
                break;
        }

        if (entityType !== People.RecentActivity.Core.EntityInfoType.none) {
            var info = People.RecentActivity.Core.create_entityInfo(entityType, data, entity.Start, entity.End - entity.Start);
            entities.push(info);
        }    
    }

    People.RecentActivity.Providers.EntityHelper.sortEntities(entities);
    return entities;
};

People.RecentActivity.Providers.SupSerializer.prototype._getResultCodeFromQueriedServicesHeader$1 = function(response, networkId) {
    /// <summary>
    ///     Retrieves the result code for the specified service.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.IResponse">The response.</param>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <returns type="People.RecentActivity.Core.ResultCode"></returns>
    var queriedServices = response.headers.item('X-QueriedServices');
    // The API currently returns "XQueriedServices," but this is changing after M3.
    if (!Jx.isNonEmptyString(queriedServices)) {
        queriedServices = response.headers.item('XQueriedServices');
    }

    // The header wasn't found, likely there was an error in the body.
    if (!Jx.isNonEmptyString(queriedServices)) {
        return People.RecentActivity.Core.ResultCode.none;
    }

    var error = null;
    var services = queriedServices.split(',');
    var header = 'Error=';
    var headerLength = header.length;
    for (var n = 0; n < services.length; n++) {
        var service = services[n];
        var trimmedService = service.trim();
        var parameters = trimmedService.split(';');
        if (parameters.length > 0) {
            var currentNetworkId = parameters[0].trim();
            if (currentNetworkId !== networkId) {
                // Skip this service.
                continue;
            }

            // Iterate over the rest of the parameters, if any, and look for the error.
            for (var i = 1; i < parameters.length; i++) {
                var parameter = parameters[i].trim();
                if (parameter.substr(0, headerLength) === header) {
                    error = parameter.substring(headerLength, parameter.length);
                }            
            }        
        }    
    }

    if (error == null) {
        return People.RecentActivity.Core.ResultCode.none;
    }

    switch (error) {
        case 'Disconnected':
            return People.RecentActivity.Core.ResultCode.invalidUserCredential;
        default:
            return People.RecentActivity.Core.ResultCode.failure;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="UriQueryBuilder.js" />

People.RecentActivity.Providers.Uri = function(rootUrl, path) {
    /// <summary>
    ///     Provides a class for URIs.
    /// </summary>
    /// <param name="rootUrl" type="String">The root URL (without the path).</param>
    /// <param name="path" type="String">The path.</param>
    /// <field name="_parseRe" type="RegExp" static="true">The regular expression used to parse URIs.</field>
    /// <field name="_rootUrl" type="String">The host.</field>
    /// <field name="_path" type="String">The path.</field>
    /// <field name="_query" type="People.RecentActivity.Providers.UriQueryBuilder">The query parameters.</field>
    Debug.assert(Jx.isNonEmptyString(rootUrl), 'rootUrl');
    Debug.assert(path != null, 'path');
    if ((!path.length) || (path.charAt(0) !== '/')) {
        path = '/' + path;
    }

    this._rootUrl = rootUrl;
    this._path = path;
    this._query = new People.RecentActivity.Providers.UriQueryBuilder();
};


People.RecentActivity.Providers.Uri._parseRe = new RegExp('^(https?://[^/]+?)(/(.*?)(\\?(.*))?)?$', 'i');
People.RecentActivity.Providers.Uri.prototype._rootUrl = null;
People.RecentActivity.Providers.Uri.prototype._path = null;
People.RecentActivity.Providers.Uri.prototype._query = null;

Object.defineProperty(People.RecentActivity.Providers.Uri.prototype, "host", {
    get: function() {
        /// <summary>
        ///     Gets the host.
        /// </summary>
        /// <value type="String"></value>
        return this._rootUrl;
    }
});

Object.defineProperty(People.RecentActivity.Providers.Uri.prototype, "path", {
    get: function() {
        /// <summary>
        ///     Gets the path.
        /// </summary>
        /// <value type="String"></value>
        return this._path;
    }
});

Object.defineProperty(People.RecentActivity.Providers.Uri.prototype, "query", {
    get: function() {
        /// <summary>
        ///     Gets the query parameters.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.UriQueryBuilder"></value>
        return this._query;
    }
});

People.RecentActivity.Providers.Uri.prototype.addQueryParameter = function(name, value) {
    /// <summary>
    ///     Adds a query parameter.
    /// </summary>
    /// <param name="name" type="String">The name.</param>
    /// <param name="value" type="String">The value.</param>
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    this._query.add(name, value);
};

People.RecentActivity.Providers.Uri.prototype.toString = function() {
    /// <summary>
    ///     Gets the fully formatted URI.
    /// </summary>
    /// <returns type="String"></returns>
    var builder = this._rootUrl + this._path;
    if (this._query.count > 0) {
        builder += '?' + this._query;
    }

    return builder;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.UriQueryBuilder = function() {
    /// <summary>
    ///     Provides a class for building URI queries.
    /// </summary>
    /// <field name="_queryParams" type="Object">The query parameters.</field>
    this._queryParams = {};
};


People.RecentActivity.Providers.UriQueryBuilder.prototype._queryParams = null;

Object.defineProperty(People.RecentActivity.Providers.UriQueryBuilder.prototype, "count", {
    get: function() {
        /// <summary>
        ///     Gets the current parameter count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return Object.keys(this._queryParams).length;
    }
});

People.RecentActivity.Providers.UriQueryBuilder.prototype.add = function(name, value) {
    /// <summary>
    ///     Adds a query parameter.
    /// </summary>
    /// <param name="name" type="String">The name.</param>
    /// <param name="value" type="String">The value.</param>
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    this._queryParams[name] = value;
};

People.RecentActivity.Providers.UriQueryBuilder.prototype.remove = function(name) {
    /// <summary>
    ///     Removes a query parameter.
    /// </summary>
    /// <param name="name" type="String">The parameter name.</param>
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    delete this._queryParams[name];
};

People.RecentActivity.Providers.UriQueryBuilder.prototype.toString = function() {
    /// <summary>
    ///     Gets the fully formatted query string.
    /// </summary>
    /// <returns type="String"></returns>
    var output = '';
    for (var k in this._queryParams) {
        var entry = { key: k, value: this._queryParams[k] };
        if (output.length > 0) {
            output += '&';
        }

        var key = entry.key;
        var value = entry.value;
        value = (Jx.isNonEmptyString(value)) ? encodeURIComponent(value) : '';
        output += key;
        output += '=';
        output += value;
    }

    return output;
};

People.RecentActivity.Providers.UriQueryBuilder.prototype.item = function(name) {
    /// <summary>
    ///     Gets the query parameter specified.
    /// </summary>
    /// <param name="name" type="String">The parameter name.</param>
    /// <param name="value" type="String"></param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(name), 'name');
    return this._queryParams[name];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.Providers.Sup.create_picture = function(url, height, width) {
    var o = { };
    o.Url = url;
    o.Height = height;
    o.Width = width;
    return o;
};
});