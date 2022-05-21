
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People, "loadSocialModel", function () {

People.loadSocialModel = Jx.fnEmpty;

People.loadSocialImports();
People.loadSocialCore();
People.loadSocialPlatform();
People.loadSocialProviders();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.create_actionState = function(context, userState) {
    var o = { };
    Debug.assert(context != null, 'context');
    o.context = context;
    o.userState = userState;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of an annotation.
/// </summary>
People.RecentActivity.AnnotationType = {
    /// <field name="none" type="Number" integer="true" static="true">An unknown annotation.</field>
    none: 0,
    /// <field name="wallPost" type="Number" integer="true" static="true">A wall post.</field>
    wallPost: 1,
    /// <field name="retweetedBy" type="Number" integer="true" static="true">Retweeted by a given person.</field>
    retweetedBy: 2,
    /// <field name="inReplyTo" type="Number" integer="true" static="true">In reply to a given person.</field>
    inReplyTo: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the action of a collection change.
/// </summary>
People.RecentActivity.NotifyCollectionChangedAction = {
    /// <field name="add" type="Number" integer="true" static="true">Items were added.</field>
    add: 0,
    /// <field name="remove" type="Number" integer="true" static="true">Items were removed.</field>
    remove: 1,
    /// <field name="replace" type="Number" integer="true" static="true">Items were replaced.</field>
    replace: 2,
    /// <field name="reset" type="Number" integer="true" static="true">The collection was reset.</field>
    reset: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of an entity.
/// </summary>
People.RecentActivity.EntityType = {
    /// <field name="none" type="Number" integer="true" static="true">No entity type.</field>
    none: 0,
    /// <field name="contact" type="Number" integer="true" static="true">A contact.</field>
    contact: 1,
    /// <field name="link" type="Number" integer="true" static="true">A link entity.</field>
    link: 2,
    /// <field name="hashTag" type="Number" integer="true" static="true">A hash tag (e.g. "#hash")</field>
    hashTag: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of a video.
/// </summary>
People.RecentActivity.FeedEntryVideoType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="embed" type="Number" integer="true" static="true">An embeddable video.</field>
    embed: 1,
    /// <field name="raw" type="Number" integer="true" static="true">A raw (HTML5) video.</field>
    raw: 2
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="FeedEntry.js" />

/// <summary>
///     Represents the type of a <see cref="T:People.RecentActivity.FeedEntry" />.
/// </summary>
People.RecentActivity.FeedEntryType = {
    /// <field name="none" type="Number" integer="true" static="true">No or an unknown type.</field>
    none: 0,
    /// <field name="text" type="Number" integer="true" static="true">A text entry.</field>
    text: 1,
    /// <field name="link" type="Number" integer="true" static="true">A link entry.</field>
    link: 2,
    /// <field name="video" type="Number" integer="true" static="true">A video entry.</field>
    video: 3,
    /// <field name="photo" type="Number" integer="true" static="true">A photo entry.</field>
    photo: 4,
    /// <field name="photoAlbum" type="Number" integer="true" static="true">A photo album entry.</field>
    photoAlbum: 5
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="FeedObject.js" />

/// <summary>
///     Represents types for a <see cref="T:People.RecentActivity.FeedObject" />.
/// </summary>
People.RecentActivity.FeedObjectType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="entry" type="Number" integer="true" static="true">A feed entry.</field>
    entry: 1,
    /// <field name="photo" type="Number" integer="true" static="true">A photo.</field>
    photo: 2,
    /// <field name="photoAlbum" type="Number" integer="true" static="true">A photo album.</field>
    photoAlbum: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of a reaction.
/// </summary>
People.RecentActivity.NetworkReactionType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="like" type="Number" integer="true" static="true">A Facebook like.</field>
    like: 1,
    /// <field name="retweet" type="Number" integer="true" static="true">A retweet</field>
    retweet: 2,
    /// <field name="favorite" type="Number" integer="true" static="true">A favorite</field>
    favorite: 3
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <summary>
///     Represents the type of a feed object.
/// </summary>
People.RecentActivity.NotificationType = {
    /// <field name="none" type="Number" integer="true" static="true">No type.</field>
    none: 0,
    /// <field name="entry" type="Number" integer="true" static="true">A feed entry.</field>
    entry: 1,
    /// <field name="photo" type="Number" integer="true" static="true">A photo.</field>
    photo: 2,
    /// <field name="photoAlbum" type="Number" integer="true" static="true">A photo album.</field>
    photoAlbum: 3,
    /// <field name="video" type="Number" integer="true" static="true">A video.</field>
    video: 4,
    /// <field name="person" type="Number" integer="true" static="true">A person.</field>
    person: 5
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.create_photoCollectionLockToken = function(photoId) {
    var o = { };
    Debug.assert(Jx.isNonEmptyString(photoId), '!string.IsNullOrEmpty(photoId)');
    o.photoId = photoId;
    return o;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\AnnotationInfoType.js" />
/// <reference path="AnnotationRetweetData.js" />
/// <reference path="AnnotationType.js" />
/// <reference path="ContactCache.js" />

People.RecentActivity.Annotation = function(info) {
    /// <summary>
    ///     Represents a single annotation.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_annotationInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_annotationInfo">The annotation info.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};


People.RecentActivity.Annotation.prototype._info = null;

Object.defineProperty(People.RecentActivity.Annotation.prototype, "type", {
    get: function() {
        /// <summary>
        ///     Gets the annotation type.
        /// </summary>
        /// <value type="People.RecentActivity.AnnotationType"></value>
        return this._info.type;
    }
});

Object.defineProperty(People.RecentActivity.Annotation.prototype, "data", {
    get: function() {
        /// <summary>
        ///     Gets the associated data.
        /// </summary>
        /// <value type="Object"></value>
        switch (this._info.type) {
            case People.RecentActivity.Core.AnnotationInfoType.retweetedBy:
                // wrap the info in a simple container which exposes some more useful properties.
                return new People.RecentActivity.AnnotationRetweetData(this._info.data);
            case People.RecentActivity.Core.AnnotationInfoType.inReplyTo:
            case People.RecentActivity.Core.AnnotationInfoType.wallPost:
                // find or create a new contact for this reply/retweet.
                return People.RecentActivity.ContactCache.findOrCreateContact(this._info.data);
        }

        Debug.assert(false, 'Unknown annotation type: ' + this._info.type);
        return null;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />

People.RecentActivity.AnnotationRetweetData = function(info) {
    /// <summary>
    ///     Provides a container with information about a retweet.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_annotationRetweetInfo">The retweet info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_annotationRetweetInfo">The info.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};


People.RecentActivity.AnnotationRetweetData.prototype._info = null;

Object.defineProperty(People.RecentActivity.AnnotationRetweetData.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return People.RecentActivity.ContactCache.findOrCreateContact(this._info.publisher);
    }
});

Object.defineProperty(People.RecentActivity.AnnotationRetweetData.prototype, "text", {
    get: function() {
        /// <summary>
        ///     Gets the text.
        /// </summary>
        /// <value type="String"></value>
        return this._info.text;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="Events\NotifyCollectionChangedEventArgs.js" />

People.RecentActivity.Collection = function() {
    /// <summary>
    ///     Provides a base class for collections.
    /// </summary>
    /// <field name="_items" type="Array">The items.</field>
    this._items = [];
};

Jx.mix(People.RecentActivity.Collection.prototype, Jx.Events);
Jx.mix(People.RecentActivity.Collection.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.Collection.prototype, "collectionchanged", "propertychanged");

People.RecentActivity.Collection.prototype._items = null;

Object.defineProperty(People.RecentActivity.Collection.prototype, "count", {
    get: function() {
        /// <summary>
        ///     Gets the number of items.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._items.length;
    }
});

Object.defineProperty(People.RecentActivity.Collection.prototype, "items", {
    get: function() {
        /// <summary>
        ///     Gets the underlying list of items.
        /// </summary>
        /// <value type="Array"></value>
        return this._items;
    }
});

People.RecentActivity.Collection.prototype.sort = function(callback) {
    /// <summary>
    ///     Resorts the collection, raising an event if needed.
    /// </summary>
    /// <param name="callback" type="Function">The sort callback.</param>
    Debug.assert(callback != null, 'callback != null');
    var clone = Array.apply(null, this._items);
    this._items.sort(callback);
    // simply walk over the clone and items, and compare. as soon as we find a difference,
    // consider the collection to be "reset" (figuring out which items got moved is pointless.)
    for (var i = 0, len = clone.length; i < len; i++) {
        if (clone[i] !== this._items[i]) {
            this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 3, null, -1, null, -1));
            break;
        }    
    }
};

People.RecentActivity.Collection.prototype.toArray = function() {
    /// <summary>
    ///     Turns the collection into an array.
    /// </summary>
    /// <returns type="Array" elementType="Object"></returns>
    return this._items;
};

People.RecentActivity.Collection.prototype.clearInternal = function() {
    /// <summary>
    ///     Clears the collection.
    /// </summary>
    var count = this._items.length;
    this._items.length = 0;
    if (!!count) {
        this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 3, null, -1, null, -1));
        this.onPropertyChanged('Count');
    }
};

People.RecentActivity.Collection.prototype.addInternal = function(item) {
    /// <summary>
    ///     Adds an item.
    /// </summary>
    /// <param name="item" type="Object">The item to add.</param>
    Debug.assert(item != null, 'item != null');
    this._items.push(item);
    this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 0, [ item ], this._items.length - 1, null, -1));
    this.onPropertyChanged('Count');
};

People.RecentActivity.Collection.prototype.addRangeInternal = function(items) {
    /// <summary>
    ///     Adds a range of items.
    /// </summary>
    /// <param name="items" type="Array" elementType="Object">The items to add.</param>
    Debug.assert(items != null, 'items != null');
    if (items.length > 0) {
        this._items.push.apply(this._items, items);
        this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 0, items, this._items.length - items.length, null, -1));
        this.onPropertyChanged('Count');
    }
};

People.RecentActivity.Collection.prototype.insertRangeInternal = function(index, items) {
    /// <summary>
    ///     Inserts a range of items.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index to insert the items at.</param>
    /// <param name="items" type="Array" elementType="Object">The items to insert.</param>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(items != null, 'items != null');
    if (items.length > 0) {
        if (index < this._items.length) {
            this._items.splice.apply(this._items, [index, 0].concat(items));
            this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 0, items, index, null, -1));
            this.onPropertyChanged('Count');
        }
        else {
            // we can just append the items.
            this.addRangeInternal(items);
        }    
    }
};

People.RecentActivity.Collection.prototype.insertInternal = function(index, item) {
    /// <summary>
    ///     Inserts an item.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index of the new item.</param>
    /// <param name="item" type="Object">The item to insert.</param>
    Debug.assert(index >= 0, 'index >= 0');
    if (index < this._items.length) {
        this._items.splice(index, 0, item);
        this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 0, [ item ], index, null, -1));
        this.onPropertyChanged('Count');
    }
    else {
        // just append the item.
        this.addInternal(item);
    }
};

People.RecentActivity.Collection.prototype.removeInternal = function(item) {
    /// <summary>
    ///     Removes an item.
    /// </summary>
    /// <param name="item" type="Object">The item to remove.</param>
    var index = this._items.indexOf(item);
    if (index !== -1) {
        this.removeAtInternal(index);
    }
};

People.RecentActivity.Collection.prototype.removeRangeInternal = function(items) {
    /// <summary>
    ///     Removes a set of items.
    /// </summary>
    /// <param name="items" type="Array" elementType="Object">The items to remove.</param>
    Debug.assert(items != null, 'items');
    if (items.length > 0) {
        // we need to find buckets of items that can be removed in one go.
        // this keeps track of the current bucket.
        var bucket = [];
        var index = 0;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            var ix = this._items.indexOf(item);
            if (ix !== -1) {
                this._items.splice(ix, 1);
                if ((!bucket.length) || (ix === index)) {
                    // this is the first item in the bucket, or the item falls in the same bucket.
                    bucket.push(item);
                }
                else {
                    // we found the end of a bucket.
                    this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 1, null, -1, bucket, index));
                    bucket.length = 0;
                    bucket.push(item);
                }

                index = ix;
            }        
        }

        if (bucket.length > 0) {
            // there are still items left in the bucket.
            this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 1, null, -1, bucket, index));
        }

        this.onPropertyChanged('Count');
    }
};

People.RecentActivity.Collection.prototype.removeAtInternal = function(index) {
    /// <summary>
    ///     Removes an item by index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index of the item.</param>
    Debug.assert((index >= 0) && (index < this._items.length), '(index >= 0) && (index < this.items.Count)');
    var item = this._items[index];
    this._items.splice(index, 1);
    this.onCollectionChanged(new People.RecentActivity.NotifyCollectionChangedEventArgs(this, 1, null, -1, [ item ], index));
    this.onPropertyChanged('Count');
};

People.RecentActivity.Collection.prototype.onCollectionChanged = function(args) {
    /// <summary>
    ///     Invokes the <see cref="E:People.RecentActivity.Collection.CollectionChanged" /> event.
    /// </summary>
    /// <param name="args" type="People.RecentActivity.NotifyCollectionChangedEventArgs">The event arguments.</param>
    Debug.assert(args != null, 'args != null');
    this.raiseEvent("collectionchanged", args);
};

People.RecentActivity.Collection.prototype.onPropertyChanged = function(propertyName) {
    /// <summary>
    ///     Invokes the <see cref="E:People.RecentActivity.Collection.PropertyChanged" /> event.
    /// </summary>
    /// <param name="propertyName" type="String">The name of the property.</param>
    Debug.assert(Jx.isNonEmptyString(propertyName), '!string.IsNullOrEmpty(propertyName)');
    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="NotifyCollectionChangedAction.js" />

People.RecentActivity.NotifyCollectionChangedEventArgs = function(sender, action, newItems, newItemIndex, oldItems, oldItemIndex) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.NotifyCollectionChangedEventHandler" /> delegate.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="action" type="People.RecentActivity.NotifyCollectionChangedAction">The action.</param>
    /// <param name="newItems" type="Array" elementType="Object">The new items.</param>
    /// <param name="newItemIndex" type="Number" integer="true">The new item index.</param>
    /// <param name="oldItems" type="Array" elementType="Object">The old items.</param>
    /// <param name="oldItemIndex" type="Number" integer="true">The old item index.</param>
    /// <field name="_action$1" type="People.RecentActivity.NotifyCollectionChangedAction">The action.</field>
    /// <field name="_newItems$1" type="Array" elementType="Object">The new items, if any.</field>
    /// <field name="_newItemIndex$1" type="Number" integer="true">The new item index, if any.</field>
    /// <field name="_oldItems$1" type="Array" elementType="Object">The old items, if any.</field>
    /// <field name="_oldItemIndex$1" type="Number" integer="true">The old item index, if any.</field>
    this._newItemIndex$1 = -1;
    this._oldItemIndex$1 = -1;
    People.RecentActivity.EventArgs.call(this, sender);
    this._action$1 = action;
    this._newItemIndex$1 = newItemIndex;
    this._newItems$1 = newItems;
    this._oldItemIndex$1 = oldItemIndex;
    this._oldItems$1 = oldItems;
};

Jx.inherit(People.RecentActivity.NotifyCollectionChangedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.NotifyCollectionChangedEventArgs.prototype._action$1 = 0;
People.RecentActivity.NotifyCollectionChangedEventArgs.prototype._newItems$1 = null;
People.RecentActivity.NotifyCollectionChangedEventArgs.prototype._oldItems$1 = null;

Object.defineProperty(People.RecentActivity.NotifyCollectionChangedEventArgs.prototype, "action", {
    get: function() {
        /// <summary>
        ///     Gets the action.
        /// </summary>
        /// <value type="People.RecentActivity.NotifyCollectionChangedAction"></value>
        return this._action$1;
    }
});

Object.defineProperty(People.RecentActivity.NotifyCollectionChangedEventArgs.prototype, "newItemIndex", {
    get: function() {
        /// <summary>
        ///     Gets the index of the new items.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._newItemIndex$1;
    }
});

Object.defineProperty(People.RecentActivity.NotifyCollectionChangedEventArgs.prototype, "newItems", {
    get: function() {
        /// <summary>
        ///     Gets the new items.
        /// </summary>
        /// <value type="Array" elementType="Object"></value>
        return this._newItems$1;
    }
});

Object.defineProperty(People.RecentActivity.NotifyCollectionChangedEventArgs.prototype, "oldItemIndex", {
    get: function() {
        /// <summary>
        ///     Gets the index of the old items.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._oldItemIndex$1;
    }
});

Object.defineProperty(People.RecentActivity.NotifyCollectionChangedEventArgs.prototype, "oldItems", {
    get: function() {
        /// <summary>
        ///     Gets the old items.
        /// </summary>
        /// <value type="Array" elementType="Object"></value>
        return this._oldItems$1;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />
/// <reference path="Helpers\EntityHelper.js" />

People.RecentActivity.Comment = function(info) {
    /// <summary>
    ///     Represents a single comment.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_commentInfo">The comment info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_commentInfo">The underlying info.</field>
    /// <field name="_publisher" type="People.RecentActivity.Contact">The publisher.</field>
    /// <field name="_timestamp" type="Date">The timestamp.</field>
    /// <field name="_entities" type="Array" elementType="Entity">The entities.</field>
    /// <field name="_isPublishedInApp" type="Boolean">Whether the post was published during this app session by the user.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
    this._publisher = People.RecentActivity.ContactCache.findOrCreateContact(info.publisher);
    this._timestamp = new Date(info.timestamp);
};


People.RecentActivity.Comment.prototype._info = null;
People.RecentActivity.Comment.prototype._publisher = null;
People.RecentActivity.Comment.prototype._timestamp = null;
People.RecentActivity.Comment.prototype._entities = null;
People.RecentActivity.Comment.prototype._isPublishedInApp = false;

Object.defineProperty(People.RecentActivity.Comment.prototype, "id", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the comment.
        /// </summary>
        /// <value type="String"></value>
        return this._info.id;
    }
});

Object.defineProperty(People.RecentActivity.Comment.prototype, "text", {
    get: function() {
        /// <summary>
        ///     Gets the text.
        /// </summary>
        /// <value type="String"></value>
        return this._info.text;
    }
});

Object.defineProperty(People.RecentActivity.Comment.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return this._publisher;
    }
});

Object.defineProperty(People.RecentActivity.Comment.prototype, "timestamp", {
    get: function() {
        /// <summary>
        ///     Gets the timestamp.
        /// </summary>
        /// <value type="Date"></value>
        return this._timestamp;
    }
});

Object.defineProperty(People.RecentActivity.Comment.prototype, "entities", {
    get: function() {
        /// <summary>
        ///     Gets the entities.
        /// </summary>
        /// <value type="Array" elementType="Entity"></value>
        if (this._entities == null) {
            this._entities = People.RecentActivity.EntityHelper.createEntities(this._info.entities);
        }

        return this._entities;
    }
});

Object.defineProperty(People.RecentActivity.Comment.prototype, "isPublishedInApp", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the post was published during this app session by the user.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isPublishedInApp;
    },
    set: function(value) {
        this._isPublishedInApp = value;
    }
});

Object.defineProperty(People.RecentActivity.Comment.prototype, "sortOrder", {
    get: function() {
        /// <value type="Number" integer="true"></value>
        return this._timestamp.getTime();
    }
});

Object.defineProperty(People.RecentActivity.Comment.prototype, "info", {
    get: function() {
        /// <summary>
        ///     Gets the underlying info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_commentInfo"></value>
        return this._info;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\CommentInfo.js" />
/// <reference path="..\Core\ETW\EtwEventName.js" />
/// <reference path="..\Core\ETW\EtwHelper.js" />
/// <reference path="..\Core\Permissions.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="ActionState.js" />
/// <reference path="Collection.js" />
/// <reference path="Comment.js" />
/// <reference path="Events\CommentActionCompletedEventArgs.js" />
/// <reference path="Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="FeedObject.js" />
/// <reference path="Helpers\CollectionHelper.js" />
/// <reference path="Network.js" />

People.RecentActivity.CommentCollection = function(provider, network, obj) {
    /// <summary>
    ///     Provides a collection for comments.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The entry.</param>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The provider.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The parent network.</field>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_map$1" type="Object">A map of ID &lt;--&gt; Comment instances.</field>
    /// <field name="_totalCount$1" type="Number" integer="true">The total number of comments.</field>
    /// <field name="_permissions$1" type="People.RecentActivity.Core.Permissions">The permissions.</field>
    People.RecentActivity.Collection.call(this);
    Debug.assert(provider != null, 'provider != null');
    Debug.assert(network != null, 'network != null');
    Debug.assert(obj != null, 'obj != null');

    var details = obj.objectInfo.commentDetails;

    this._map$1 = {};
    this._network$1 = network;
    this._obj$1 = obj;
    this._provider$1 = provider;
    this._totalCount$1 = details.count;
    this._permissions$1 = details.permissions;
    this._addRangeByInfo$1(this._obj$1.objectInfo.comments);
};

Jx.inherit(People.RecentActivity.CommentCollection, People.RecentActivity.Collection);

Debug.Events.define(People.RecentActivity.CommentCollection.prototype, "refreshcompleted", "addcommentcompleted");

People.RecentActivity.CommentCollection.prototype._provider$1 = null;
People.RecentActivity.CommentCollection.prototype._network$1 = null;
People.RecentActivity.CommentCollection.prototype._obj$1 = null;
People.RecentActivity.CommentCollection.prototype._map$1 = null;
People.RecentActivity.CommentCollection.prototype._totalCount$1 = 0;
People.RecentActivity.CommentCollection.prototype._permissions$1 = 0;
People.RecentActivity.CommentCollection.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "icon", {
    get: function() {
        /// <summary>
        ///     Gets the icon.
        /// </summary>
        /// <value type="String"></value>
        return this._obj$1.objectInfo.commentDetails.icon;
    }
});

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "maximumLength", {
    get: function() {
        /// <summary>
        ///     Gets the maximum length of a comment.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._obj$1.objectInfo.commentDetails.maximumLength;
    }
});

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "totalCount", {
    get: function() {
        /// <summary>
        ///     Gets the total number of comments available. Use <see cref="M:People.RecentActivity.CommentCollection.Refresh(System.Object)" /> to load additional comments.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._totalCount$1;
    },
    set: function(value) {
        Debug.assert(value >= 0, 'value >= 0');
        if (this._totalCount$1 !== value) {
            this._totalCount$1 = value;
            this.onPropertyChanged('TotalCount');
        }

    }
});

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "totalCountEnabled", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the total count is enabled.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._obj$1.objectInfo.commentDetails.countEnabled;
    }
});

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "remainingCount", {
    get: function() {
        /// <summary>
        ///     Gets the remaining count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._totalCount$1 - this.count;
    }
});

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "permissions", {
    get: function() {
        /// <summary>
        ///     Gets the permissions.
        /// </summary>
        /// <value type="People.RecentActivity.Core.Permissions"></value>
        return this._permissions$1;
    },
    set: function(value) {
        if (value !== this._permissions$1) {
            this._permissions$1 = value;
            this.onPropertyChanged('Permissions');
        }

    }
});

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network$1;
    }
});

Object.defineProperty(People.RecentActivity.CommentCollection.prototype, "prefix", {
    get: function() {
        /// <summary>
        ///     Gets the comment prefix, if any.
        /// </summary>
        /// <value type="String"></value>
        return this._obj$1.objectInfo.commentDetails.prefix;
    }
});

People.RecentActivity.CommentCollection.prototype.dispose = function () {
    /// <summary>Disposes the collection.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // clear our references.
        People.Social.clearKeys(this._map$1);

        this._network$1 = null;
        this._obj$1 = null;
        this._provider$1 = null;
    }
};

People.RecentActivity.CommentCollection.prototype.add = function(comment, userState) {
    /// <summary>
    ///     Adds a comment.
    /// </summary>
    /// <param name="comment" type="String">The comment to add.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(Jx.isNonEmptyString(comment), '!string.IsNullOrEmpty(comment)');
    Debug.assert((this._permissions$1 & People.RecentActivity.Core.Permissions.add) === People.RecentActivity.Core.Permissions.add, '(this.permissions & Permissions.Add) == Permissions.Add');
    // add the comment, but don't add it to the collection right away.
    // the providers have to fill in a few blanks, like the ID.
    var objectInfo = this._obj$1.objectInfo;
    var commentInfo = People.RecentActivity.Core.create_commentInfo(null, this._network$1.user.info, new Date().getTime(), comment, null);
    People.RecentActivity.Core.EtwHelper.writeCommentEvent(People.RecentActivity.Core.EtwEventName.uiAddCommentStart, objectInfo, commentInfo);
    this._provider$1.addComment(objectInfo, commentInfo, People.RecentActivity.create_actionState(this._obj$1, userState));
};

People.RecentActivity.CommentCollection.prototype.refresh = function(userState) {
    /// <summary>
    ///     Refreshes the collection, loading additional comments and updating existing ones.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    var objectInfo = this._obj$1.objectInfo;
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRefreshCommentsStart, objectInfo);
    this._provider$1.refreshComments(objectInfo, People.RecentActivity.create_actionState(this._obj$1, userState));
};

People.RecentActivity.CommentCollection.prototype.updateDetails = function(details) {
    /// <summary>
    ///     Updates the details.
    /// </summary>
    /// <param name="details" type="People.RecentActivity.Core.create_commentDetailsInfo">The details.</param>
    Debug.assert(details != null, 'details != null');
    this.totalCount = details.count;
    this.permissions = details.permissions;
};

People.RecentActivity.CommentCollection.prototype.onRefreshCompleted = function(result, commentsToAdd, commentsToRemove, userState) {
    /// <summary>
    ///     Occurs when the comments were refreshed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="commentsToAdd" type="Array" elementType="commentInfo">The comments to add.</param>
    /// <param name="commentsToRemove" type="Array" elementType="commentInfo">The comments to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(commentsToAdd != null, 'commentsToAdd != null');
    Debug.assert(commentsToRemove != null, 'commentsToRemove != null');
    var updated = false;
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        this._addRangeByInfo$1(commentsToAdd);
        this._removeRangeByInfo$1(commentsToRemove);
        updated = (commentsToAdd.length > 0) || (commentsToRemove.length > 0);
    }

    this.raiseEvent("refreshcompleted", new People.RecentActivity.RefreshActionCompletedEventArgs(this, result, updated, userState));
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRefreshCommentsEnd, this._obj$1.objectInfo);
};

People.RecentActivity.CommentCollection.prototype.onCommentAdded = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a comment was added.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_commentInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    var comment = null;
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        comment = this._addUserCommentByInfo$1(info);
        // also make sure the total count is increased.
        ++this.totalCount;
    }

    this.raiseEvent("addcommentcompleted", new People.RecentActivity.CommentActionCompletedEventArgs(this, result, comment, userState));
    People.RecentActivity.Core.EtwHelper.writeCommentEvent(People.RecentActivity.Core.EtwEventName.uiAddCommentEnd, this._obj$1.objectInfo, info);
};

People.RecentActivity.CommentCollection.prototype._addUserCommentByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_commentInfo"></param>
    /// <returns type="People.RecentActivity.Comment"></returns>
    Debug.assert(info != null, 'info != null');
    if (!!Jx.isUndefined(this._map$1[info.id])) {
        // add the comment to the collection and map.
        var comment = new People.RecentActivity.Comment(info);
        comment.isPublishedInApp = true;
        this._map$1[comment.id] = comment;
        this.addInternal(comment);
        return comment;
    }

    return this._map$1[info.id];
};

People.RecentActivity.CommentCollection.prototype._addRangeByInfo$1 = function(info) {
    /// <param name="info" type="Array" elementType="commentInfo"></param>
    Debug.assert(info != null, 'info != null');
    if (info.length > 0) {
        // some comments will be older, some comments will be newer.
        var comments = [];
        for (var i = 0, len = info.length; i < len; i++) {
            var id = info[i].id;
            if (!!Jx.isUndefined(this._map$1[id])) {
                var comment = new People.RecentActivity.Comment(info[i]);
                this._map$1[id] = comment;
                comments.push(comment);
            }        
        }

        if (comments.length > 0) {
            // now that we have all of the new entries, sort-insert them.
            People.RecentActivity.CollectionHelper.addSortableItems(this, comments, false);
            if (this.count > this.totalCount) {
                // we got more items back than we expected, increase the total count.
                this.totalCount = this.count;
            }        
        }    
    }
};

People.RecentActivity.CommentCollection.prototype._removeByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_commentInfo"></param>
    /// <returns type="People.RecentActivity.Comment"></returns>
    Debug.assert(info != null, 'info != null');
    if (!Jx.isUndefined(this._map$1[info.id])) {
        var comment = this._map$1[info.id];
        delete this._map$1[info.id];
        this.removeInternal(comment);
        return comment;
    }

    return null;
};

People.RecentActivity.CommentCollection.prototype._removeRangeByInfo$1 = function(info) {
    /// <param name="info" type="Array" elementType="commentInfo"></param>
    Debug.assert(info != null, 'info != null');
    var removed = 0;
    for (var i = 0, len = info.length; i < len; i++) {
        if (this._removeByInfo$1(info[i]) != null) {
            removed++;
        }    
    }

    // decrease the total count.
    this.totalCount = this.totalCount - removed;
};

People.RecentActivity.CommentCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets a comment at the given index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <param name="value" type="People.RecentActivity.Comment"></param>
    /// <returns type="People.RecentActivity.Comment"></returns>
    Debug.assert((index >= 0) && (index < this.count), '(index >= 0) && (index < this.Count)');
    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.LinkUrlTransform = function(regex) {
    /// <summary>
    ///     Represents a single video URL transform.
    /// </summary>
    /// <param name="regex" type="RegExp">The regular expression which represents the video URL.</param>
    /// <field name="_regex" type="RegExp">The regex.</field>
    Debug.assert(regex != null, 'regex');
    this._regex = regex;
};


People.RecentActivity.LinkUrlTransform.prototype._regex = null;

People.RecentActivity.LinkUrlTransform.prototype.isMatch = function(url) {
    /// <summary>
    ///     Tests whether the URL matches the given transform.
    /// </summary>
    /// <param name="url" type="String">The URL to test.</param>
    /// <returns type="Boolean"></returns>
    return this._regex.test(url);
};

People.RecentActivity.LinkUrlTransform.prototype.createPreviewUrl = function(url) {
    /// <summary>
    ///     Creates a preview URL for the given URL.
    /// </summary>
    /// <param name="url" type="String">The URL to create a preview URL for.</param>
    /// <returns type="String"></returns>
    // If we don't have enough information, bail out.
    if (!Jx.isNonEmptyString(url)) {
        return null;
    }

    // attempt to match the string against this particular URL.
    var matches = this._regex.exec(url);
    if ((matches != null) && (matches.length > 1)) {
        // yup, found something we can use -- format the output.
        return decodeURIComponent(matches[1]);
    }

    return null;
};

People.RecentActivity.LinkUrlTransform.prototype.createEmbedUrl = function(url) {
    /// <summary>
    ///     Creates an embed URL for the given URL.
    /// </summary>
    /// <param name="url" type="String">The URL to create an embed URL for.</param>
    /// <returns type="String"></returns>
    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.VideoUrlTransform = function(regex, embedUrlFormat, previewUrlFormat) {
    /// <summary>
    ///     Represents a single video URL transform.
    /// </summary>
    /// <param name="regex" type="RegExp">The regular expression which represents the video URL.</param>
    /// <param name="embedUrlFormat" type="String">The format of the embed URL.</param>
    /// <param name="previewUrlFormat" type="String">The format of the preview URL.</param>
    /// <field name="_regex" type="RegExp"></field>
    /// <field name="_embedUrlFormat" type="String"></field>
    /// <field name="_previewUrlFormat" type="String"></field>
    Debug.assert(regex != null, 'regex');
    Debug.assert(Jx.isNonEmptyString(embedUrlFormat) || Jx.isNonEmptyString(previewUrlFormat), 'embedUrlFormat or previewUrlFormat must be a non-empty string');
    this._regex = regex;
    this._embedUrlFormat = embedUrlFormat;
    this._previewUrlFormat = previewUrlFormat;
};


People.RecentActivity.VideoUrlTransform.prototype._regex = null;
People.RecentActivity.VideoUrlTransform.prototype._embedUrlFormat = null;
People.RecentActivity.VideoUrlTransform.prototype._previewUrlFormat = null;

People.RecentActivity.VideoUrlTransform.prototype.isMatch = function(url) {
    /// <summary>
    ///     Tests whether the URL matches the given transform.
    /// </summary>
    /// <param name="url" type="String">The URL to test.</param>
    /// <returns type="Boolean"></returns>
    return this._regex.test(url);
};

People.RecentActivity.VideoUrlTransform.prototype.createPreviewUrl = function(url) {
    /// <summary>
    ///     Creates a preview URL for the given URL.
    /// </summary>
    /// <param name="url" type="String">The URL to create a preview URL for.</param>
    /// <returns type="String"></returns>
    // If we don't have enough information, bail out.
    if (!Jx.isNonEmptyString(this._previewUrlFormat) || !Jx.isNonEmptyString(url)) {
        return null;
    }

    // attempt to match the string against this particular URL.
    var parts = (this._regex.exec(url));
    if ((parts != null) && (!!parts.length)) {
        // yup, found something we can use -- format the output.
        // remove the first string in the list -- it's the entire matched string.
        parts.shift();
        return People.Social.format(this._previewUrlFormat, parts);
    }

    return null;
};

People.RecentActivity.VideoUrlTransform.prototype.createEmbedUrl = function(url) {
    /// <summary>
    ///     Creates an embed URL for the given URL.
    /// </summary>
    /// <param name="url" type="String">The URL to create an embed URL for.</param>
    /// <returns type="String"></returns>
    // If we don't have enough information, bail out.
    if (!Jx.isNonEmptyString(this._previewUrlFormat) || !Jx.isNonEmptyString(url)) {
        return null;
    }

    // attempt to match the string against this particular URL.
    var parts = (this._regex.exec(url));
    if ((parts != null) && (!!parts.length)) {
        // yup, found something we can use -- format the output.
        // remove the first string in the list -- it's the entire matched string.
        parts.shift();
        return People.Social.format(this._embedUrlFormat, parts);
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Providers\FeedProviderFactory.js" />
/// <reference path="LinkUrlTransform.js" />
/// <reference path="VideoUrlTransform.js" />

People.RecentActivity.Configuration = function() {
    /// <summary>
    ///     Provides some common configuration values.
    /// </summary>
    /// <field name="_videoUrlTransforms" type="Array" elementType="IUrlTransform" static="true">The possible video URL transforms.</field>
    /// <field name="_linkUrlTransforms" type="Array" elementType="IUrlTransform" static="true">The possible link URL transforms.</field>
    /// <field name="_shareSupportedDataFormats" type="Array" elementType="String" static="true">The data types supported by the share target.</field>
    /// <field name="_credentialUpdateUrl" type="String" static="true">The credential update URLs.</field>
    /// <field name="_networkReconnectUri" type="String" static="true">The format string containing the reconnect URI.</field>
    /// <field name="_info" type="People.RecentActivity.Core.create_configurationInfo" static="true">The configuration info.</field>
};


People.RecentActivity.Configuration._videoUrlTransforms = null;
People.RecentActivity.Configuration._linkUrlTransforms = null;
People.RecentActivity.Configuration._shareSupportedDataFormats = [ Windows.ApplicationModel.DataTransfer.StandardDataFormats.uri ];
People.RecentActivity.Configuration._credentialUpdateUrl = 'https://profile.live.com/services/connect/?appid={0}&scenarios=dashboard_agg,status_publish&view=trident&authz=true&biciID=peoplenotifpane&brand=people&ru=http%3A%2F%2Fprofile.live.com%2Fservices%3Fview%3Dmanage';
People.RecentActivity.Configuration._networkReconnectUri = 'wlpeople:connectAccount,accountObjectId={0}&reconnect={1}';
People.RecentActivity.Configuration._info = null;

Object.defineProperty(People.RecentActivity.Configuration, "aggregatedNetworkId", {
    get: function() {
        /// <summary>
        ///     Gets the aggregated network ID.
        /// </summary>
        /// <value type="String"></value>
        return People.RecentActivity.Configuration._getInfo().aggregatedNetworkId;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "whatsNewPersonId", {
    get: function() {
        /// <summary>
        ///     Gets the What's New person ID.
        /// </summary>
        /// <value type="String"></value>
        return People.RecentActivity.Configuration._getInfo().whatsNewPersonId;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "maximumEntryCount", {
    get: function() {
        /// <summary>
        ///     Gets the maximum number of entries.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Configuration._getInfo().maximumEntryCount;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "batchEntryCount", {
    get: function() {
        /// <summary>
        ///     Gets the batch entry count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Configuration._getInfo().batchEntryCount;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "maximumReactionCount", {
    get: function() {
        /// <summary>
        ///     Gets the maximum number of reactions retrieved by the providers.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Configuration._getInfo().maximumReactionCount;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "maximumTagCount", {
    get: function() {
        /// <summary>
        ///     Gets the maximum number of tags.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return People.RecentActivity.Configuration._getInfo().maximumTagCount;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "videoUrlTransforms", {
    get: function() {
        /// <summary>
        ///     Gets the video URL transforms.
        /// </summary>
        /// <value type="Array" elementType="IUrlTransform"></value>
        return People.RecentActivity.Configuration._videoUrlTransforms;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "linkUrlTransforms", {
    get: function() {
        /// <summary>
        ///     Gets the link unwrap regex.
        /// </summary>
        /// <value type="Array" elementType="IUrlTransform"></value>
        return People.RecentActivity.Configuration._linkUrlTransforms;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "shareSupportedDataFormats", {
    get: function() {
        /// <summary>
        ///     Gets the supported share target data formats.
        /// </summary>
        /// <value type="Array" elementType="String"></value>
        return People.RecentActivity.Configuration._shareSupportedDataFormats;
    }
});

Object.defineProperty(People.RecentActivity.Configuration, "maxStackableEntries", {
    get: function() {
        /// <summary>
        ///     Gets the max number of stackable entries.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        var screenHeight = window.screen.height;
        var max;
        if (screenHeight < 1024) {
            max = 2;
        }
        else if (screenHeight < 1360) {
            max = 3;
        }
        else if (screenHeight < 1650) {
            max = 4;
        }
        else {
            max = 5;
        }

        return max;
    }
});

People.RecentActivity.Configuration.getUpdateCredentialsUrl = function(networkId) {
    /// <summary>
    ///     Gets the "update credentials" URL for a specific network.
    /// </summary>
    /// <param name="networkId" type="String">The network ID.</param>
    /// <returns type="String"></returns>
    if (!Jx.isNonEmptyString(networkId)) {
        // use the default URL.
        networkId = People.RecentActivity.Core.NetworkId.facebook;
    }

    return People.Social.format(People.RecentActivity.Configuration._credentialUpdateUrl, networkId);
};

People.RecentActivity.Configuration.getNetworkReconnectUrl = function(networkObjectId, reconnect) {
    /// <summary>
    ///     Gets the "network reconnect" URL for a specific network.
    /// </summary>
    /// <param name="networkObjectId" type="String">The network's object ID.</param>
    /// <param name="reconnect" type="Boolean">Whether to attempt a reconnect.</param>
    /// <returns type="String"></returns>
    Debug.assert(Jx.isNonEmptyString(networkObjectId), 'networkObjectId');
    return People.Social.format(People.RecentActivity.Configuration._networkReconnectUri, networkObjectId, reconnect);
};

People.RecentActivity.Configuration._getInfo = function() {
    /// <returns type="People.RecentActivity.Core.create_configurationInfo"></returns>
    if (People.RecentActivity.Configuration._info == null) {
        // get the config from the provider.
        People.RecentActivity.Configuration._info = People.RecentActivity.Providers.FeedProviderFactory.instance.getConfiguration();
    }

    return People.RecentActivity.Configuration._info;
};


(function() {
    var videoUrlTransforms = [];
    videoUrlTransforms.push(new People.RecentActivity.VideoUrlTransform(new RegExp('^(?:https?://)?(?:www\\.)?youtube.com/watch\\?(?:(?!v=).*?&)?v=(.+?)(?:&|$)', 'i'), 'http://www.youtube.com/embed/{0}?autoplay=1', 'http://img.youtube.com/vi/{0}/0.jpg'));
    videoUrlTransforms.push(new People.RecentActivity.VideoUrlTransform(new RegExp('^(?:https?://)?(?:www\\.)?youtu.be/(.+)$', 'i'), 'http://www.youtube.com/embed/{0}?autoplay=1', 'http://img.youtube.com/vi/{0}/0.jpg'));
    videoUrlTransforms.push(new People.RecentActivity.VideoUrlTransform(new RegExp('^(?:https?://)?(?:www\\.)?youtube.com/v/(.+?)(?:\\?.*)?$', 'i'), 'http://www.youtube.com/embed/{0}?autoplay=1', 'http://img.youtube.com/vi/{0}/0.jpg'));
    videoUrlTransforms.push(new People.RecentActivity.VideoUrlTransform(new RegExp('^(?:https?://)?(?:www\\.)?vimeo.com/(.+)$', 'i'), 'http://player.vimeo.com/video/{0}?title=0&byline=0&autoplay=1&wmode=transparent', null));
    People.RecentActivity.Configuration._videoUrlTransforms = videoUrlTransforms;
    var linkUrlTransforms = [];
    linkUrlTransforms.push(new People.RecentActivity.LinkUrlTransform(new RegExp('^(?:https?://)?external\\.ak\\.fbcdn\\.net/safe_image\\.php\\?(?:(?!url=).*?&)?url=(.+?)(?:&|$)', 'i')));
    linkUrlTransforms.push(new People.RecentActivity.LinkUrlTransform(new RegExp('^(?:https?://)?s\\-external\\.ak\\.fbcdn\\.net/safe_image\\.php\\?(?:(?!url=).*?&)?url=(.+?)(?:&|$)', 'i')));
    linkUrlTransforms.push(new People.RecentActivity.LinkUrlTransform(new RegExp('^(?:https?://)?fbexternal-a.akamaihd.net/safe_image\\.php\\?(?:(?!url=).*?&)?url=(.+?)(?:&|$)', 'i')));
    People.RecentActivity.Configuration._linkUrlTransforms = linkUrlTransforms;
})();
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\TemporaryContactInfo.js" />
/// <reference path="..\Platform\AuthInfo.js" />
/// <reference path="..\Platform\Platform.js" />

People.RecentActivity.Contact = function(info) {
    /// <summary>
    ///     Represents a single contact.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_contactInfo">The contact info.</field>
    /// <field name="_person" type="Microsoft.WindowsLive.Platform.Person">The underlying platform person.</field>
    /// <field name="_temporaryContact" type="People.RecentActivity.Core.create_temporaryContactInfo">The temporary contact.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};

People.RecentActivity.Contact.prototype._info = null;
People.RecentActivity.Contact.prototype._person = null;
People.RecentActivity.Contact.prototype._temporaryContact = null;

Object.defineProperty(People.RecentActivity.Contact.prototype, "id", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the contact.
        /// </summary>
        /// <value type="String"></value>
        return this._info.id;
    }
});

Object.defineProperty(People.RecentActivity.Contact.prototype, "sourceId", {
    get: function() {
        /// <summary>
        ///     Gets the source ID.
        /// </summary>
        /// <value type="String"></value>
        return this._info.sourceId;
    }
});

Object.defineProperty(People.RecentActivity.Contact.prototype, "isFriend", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the contact is a friend.
        /// </summary>
        /// <value type="Boolean"></value>
        if (this._info.isFriend) {
            return true;
        }

        this._ensurePerson();
        return (this._person != null) ? true : false;
    }
});

Object.defineProperty(People.RecentActivity.Contact.prototype, "name", {
    get: function() {
        /// <summary>
        ///     Gets the name.
        /// </summary>
        /// <value type="String"></value>
        return this._info.name;
    }
});

Object.defineProperty(People.RecentActivity.Contact.prototype, "picture", {
    get: function() {
        /// <summary>
        ///     Gets the optional display picture.
        /// </summary>
        /// <value type="String"></value>
        return this._info.picture;
    }
});

Object.defineProperty(People.RecentActivity.Contact.prototype, "personId", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the person for the contact.
        /// </summary>
        /// <value type="String"></value>
        this._ensurePerson();
        return (this._person != null) ? this._person.objectId : '';
    }
});

Object.defineProperty(People.RecentActivity.Contact.prototype, "networkHandle", {
    get: function() {
        /// <summary>
        ///     Gets the network handle (if any.)
        /// </summary>
        /// <value type="String"></value>
        return this._info.networkHandle;
    }
});

Object.defineProperty(People.RecentActivity.Contact.prototype, "info", {
    get: function() {
        /// <summary>
        ///     Gets the underlying contact info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_contactInfo"></value>
        return this._info;
    }
});

People.RecentActivity.Contact.prototype.update = function (info) {
    /// <summary>
    ///     Updates the contact.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo">The updated contact info.</param>
    this._ensurePerson();

    // Ensure the new data is "better" than the old data. In this case it means valid pictures.
    if (this._person == null &&
        Jx.isNonEmptyString(info.picture) &&
        Jx.isNonEmptyString(info.largePicture)) {
        this._info = info;

        // We'll need to regenerate the temporary contact next time.
        this._temporaryContact = null;
    }
};

People.RecentActivity.Contact.prototype.getDataContext = function() {
    /// <summary>
    ///     Gets the data context for this person.
    /// </summary>
    /// <returns type="Object"></returns>
    this._ensurePerson();

    if (this._person == null) {
        if (this._temporaryContact == null) {
            var name = this._info.name;
            if (!Jx.isNonEmptyString(name)) {
                var sourceId = this._info.sourceId;

                Jx.log.write(4, 'Getting network name for network:' + sourceId);

                var info = People.RecentActivity.Platform.AuthInfo.getInstance(sourceId);

                // if info is null, which is weird and means this contact's source id is something we don't support (not FB or TWITR), i don't know
                // how that would happen, but in case it happens, we just use sourceId as network name. (added logging for future diagnosis.)
                var networkName = (info != null) ? info.networkName : sourceId;
                name = Jx.res.loadCompoundString('/strings/raContactFallbackName', networkName);
            }

            // we're either not a friend, or we failed to retrieve the contact from the platform.
            this._temporaryContact = People.RecentActivity.Core.create_temporaryContactInfo(
                this._info.id,
                this._info.sourceId,
                this._info.networkHandle,
                name,
                this._info.picture,
                this._info.largePicture,
                this._info.profileUrl);
        }

        return this._temporaryContact;
    }

    return this._person;
};

People.RecentActivity.Contact.prototype._ensurePerson = function() {
    if (this._person != null) {
        return;
    }

    this._person = People.RecentActivity.Platform.Platform.instance.getPlatformPerson(this._info);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Contact.js" />

People.RecentActivity.ContactCache = function() {
    /// <summary>
    ///     Provides a contact cache.
    /// </summary>
    /// <field name="_map" type="Object" static="true">The map of contacts.</field>
};


People.RecentActivity.ContactCache._map = {};

People.RecentActivity.ContactCache.findContact = function(info) {
    /// <summary>
    ///     Finds a contact.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo">The contact info.</param>
    /// <returns type="People.RecentActivity.Contact"></returns>
    Debug.assert(info != null, 'info != null');
    var key = People.RecentActivity.ContactCache._getKey(info);
    if (!Jx.isUndefined(People.RecentActivity.ContactCache._map[key])) {
        return People.RecentActivity.ContactCache._map[key];
    }

    return null;
};

People.RecentActivity.ContactCache.findOrCreateContact = function(info) {
    /// <summary>
    ///     Finds or creates a contact.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo">The contact info.</param>
    /// <returns type="People.RecentActivity.Contact"></returns>
    Debug.assert(info != null, 'info != null');

    var contact = People.RecentActivity.ContactCache.findContact(info);
    if (contact == null) {
        // initialize a new Contact instance.
        contact = new People.RecentActivity.Contact(info);

        var key = People.RecentActivity.ContactCache._getKey(info);
        People.RecentActivity.ContactCache._map[key] = contact;
    }
    else {
        contact.update(info);
    }

    return contact;
};

People.RecentActivity.ContactCache.clear = function() {
    /// <summary>
    ///     Clears the cache.
    /// </summary>
    People.Social.clearKeys(People.RecentActivity.ContactCache._map);
};

People.RecentActivity.ContactCache._getKey = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo"></param>
    /// <returns type="String"></returns>
    Debug.assert(info != null, 'info != null');
    return info.sourceId + ':' + info.id;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\EntityInfoType.js" />
/// <reference path="ContactCache.js" />
/// <reference path="EntityType.js" />

People.RecentActivity.Entity = function(info) {
    /// <summary>
    ///     Represents a single entity.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_entityInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_entityInfo">The entity info.</field>
    /// <field name="_data" type="Object">The data.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};


People.RecentActivity.Entity.prototype._info = null;
People.RecentActivity.Entity.prototype._data = null;

Object.defineProperty(People.RecentActivity.Entity.prototype, "type", {
    get: function() {
        /// <summary>
        ///     Gets the type of the entity.
        /// </summary>
        /// <value type="People.RecentActivity.EntityType"></value>
        return this._info.type;
    }
});

Object.defineProperty(People.RecentActivity.Entity.prototype, "data", {
    get: function() {
        /// <summary>
        ///     Gets the data.
        /// </summary>
        /// <value type="Object"></value>
        if (this._data == null) {
            switch (this._info.type) {
                case People.RecentActivity.Core.EntityInfoType.contact:
                    this._data = People.RecentActivity.ContactCache.findOrCreateContact(this._info.data);
                    break;
                case People.RecentActivity.Core.EntityInfoType.hashTag:
                case People.RecentActivity.Core.EntityInfoType.link:
                    this._data = this._info.data;
                    break;
                default:
                    Debug.assert(false, 'Unknown entity type: ' + this._info.type);
                    break;
            }        
        }

        return this._data;
    }
});

Object.defineProperty(People.RecentActivity.Entity.prototype, "offset", {
    get: function() {
        /// <summary>
        ///     Gets the offset.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info.offset;
    }
});

Object.defineProperty(People.RecentActivity.Entity.prototype, "length", {
    get: function() {
        /// <summary>
        ///     Gets the length.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info.length;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.FeedEntryLinkData = function(info) {
    /// <summary>
    ///     Provides data for link entries.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedEntryLinkDataInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_feedEntryLinkDataInfo">The info.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};


People.RecentActivity.FeedEntryLinkData.prototype._info = null;

Object.defineProperty(People.RecentActivity.FeedEntryLinkData.prototype, "caption", {
    get: function() {
        /// <summary>
        ///     Gets the caption.
        /// </summary>
        /// <value type="String"></value>
        return this._info.caption;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryLinkData.prototype, "description", {
    get: function() {
        /// <summary>
        ///     Gets the description.
        /// </summary>
        /// <value type="String"></value>
        return this._info.description;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryLinkData.prototype, "text", {
    get: function() {
        /// <summary>
        ///     Gets the text.
        /// </summary>
        /// <value type="String"></value>
        return this._info.text;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryLinkData.prototype, "tile", {
    get: function() {
        /// <summary>
        ///     Gets the tile.
        /// </summary>
        /// <value type="String"></value>
        return this._info.tile;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryLinkData.prototype, "title", {
    get: function() {
        /// <summary>
        ///     Gets the title.
        /// </summary>
        /// <value type="String"></value>
        return this._info.title;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryLinkData.prototype, "url", {
    get: function() {
        /// <summary>
        ///     Gets the URL.
        /// </summary>
        /// <value type="String"></value>
        return this._info.url;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Network.js" />
/// <reference path="..\PhotoAlbum.js" />

People.RecentActivity.FeedEntryPhotoAlbumData = function(network, info) {
    /// <summary>
    ///     Represents data for a photo album.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedEntryPhotoAlbumDataInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_feedEntryPhotoAlbumDataInfo">The info.</field>
    /// <field name="_network" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_album" type="People.RecentActivity.PhotoAlbum">The album.</field>
    /// <field name="_photos" type="Array" elementType="Photo">The photos.</field>
    Debug.assert(network != null, 'network != null');
    Debug.assert(info != null, 'info != null');
    this._info = info;
    this._network = network;
};


People.RecentActivity.FeedEntryPhotoAlbumData.prototype._info = null;
People.RecentActivity.FeedEntryPhotoAlbumData.prototype._network = null;
People.RecentActivity.FeedEntryPhotoAlbumData.prototype._album = null;
People.RecentActivity.FeedEntryPhotoAlbumData.prototype._photos = null;

Object.defineProperty(People.RecentActivity.FeedEntryPhotoAlbumData.prototype, "album", {
    get: function() {
        /// <summary>
        ///     Gets the album.
        /// </summary>
        /// <value type="People.RecentActivity.PhotoAlbum"></value>
        if (this._album == null) {
            this._album = this._network.albums.findOrCreateAlbumByInfo(this._info.album);
        }

        return this._album;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryPhotoAlbumData.prototype, "displayPhotos", {
    get: function() {
        /// <summary>
        ///     Gets the photos to display.
        /// </summary>
        /// <value type="Array" elementType="Photo"></value>
        if (this._photos == null) {
            // create all the photos.
            var album = this.album;
            this._photos = new Array(this._info.displayPhotos.length);
            for (var i = 0, len = this._photos.length; i < len; i++) {
                // initialiaze the photo (or grab an existing one if possible)
                this._photos[i] = album.photos.findOrCreatePhotoByInfo(this._info.displayPhotos[i]);
            }        
        }

        return this._photos;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryPhotoAlbumData.prototype, "text", {
    get: function() {
        /// <summary>
        ///     Gets the text.
        /// </summary>
        /// <value type="String"></value>
        return this._info.text;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryPhotoAlbumData.prototype, "isTagged", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether someone was tagged in this album.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isTagged;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Network.js" />
/// <reference path="..\Photo.js" />
/// <reference path="..\PhotoAlbum.js" />

People.RecentActivity.FeedEntryPhotoData = function(network, info) {
    /// <summary>
    ///     Represents data for a photo entry.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedEntryPhotoDataInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_feedEntryPhotoDataInfo">The info.</field>
    /// <field name="_network" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_photo" type="People.RecentActivity.Photo">The photo.</field>
    /// <field name="_album" type="People.RecentActivity.PhotoAlbum">The album.</field>
    Debug.assert(network != null, 'network != null');
    Debug.assert(info != null, 'info != null');
    this._info = info;
    this._network = network;
};


People.RecentActivity.FeedEntryPhotoData.prototype._info = null;
People.RecentActivity.FeedEntryPhotoData.prototype._network = null;
People.RecentActivity.FeedEntryPhotoData.prototype._photo = null;
People.RecentActivity.FeedEntryPhotoData.prototype._album = null;

Object.defineProperty(People.RecentActivity.FeedEntryPhotoData.prototype, "album", {
    get: function() {
        /// <summary>
        ///     Gets the parent album.
        /// </summary>
        /// <value type="People.RecentActivity.PhotoAlbum"></value>
        if (this._album == null) {
            var info = this._info.album;
            if (info != null) {
                var albumInfo = info.data;
                if ((albumInfo.owner != null) && (albumInfo.name != null)) {
                    this._album = this._network.albums.findOrCreateAlbumByInfo(info);
                }            
            }        
        }

        return this._album;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryPhotoData.prototype, "photo", {
    get: function() {
        /// <summary>
        ///     Gets the photo.
        /// </summary>
        /// <value type="People.RecentActivity.Photo"></value>
        if (this._photo == null) {
            this._photo = this._network.albums.findOrCreatePhotoByInfo(this._info.photo, this._info.album);
        }

        return this._photo;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryPhotoData.prototype, "text", {
    get: function() {
        /// <summary>
        ///     Gets the text.
        /// </summary>
        /// <value type="String"></value>
        return this._info.text;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryPhotoData.prototype, "isTagged", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether someone was tagged in this photo.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isTagged;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.FeedEntryTextData = function(info) {
    /// <summary>
    ///     Provides data for text entries.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedEntryStatusDataInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_feedEntryStatusDataInfo">The data.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};


People.RecentActivity.FeedEntryTextData.prototype._info = null;

Object.defineProperty(People.RecentActivity.FeedEntryTextData.prototype, "text", {
    get: function() {
        /// <summary>
        ///     Gets the text.
        /// </summary>
        /// <value type="String"></value>
        return this._info.text;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="FeedEntryVideoType.js" />

People.RecentActivity.FeedEntryVideoData = function(info) {
    /// <summary>
    ///     Provides data fro a video entry.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedEntryVideoDataInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_feedEntryVideoDataInfo">The info.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};


People.RecentActivity.FeedEntryVideoData.prototype._info = null;

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "caption", {
    get: function() {
        /// <summary>
        ///     Gets the caption.
        /// </summary>
        /// <value type="String"></value>
        return this._info.caption;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "description", {
    get: function() {
        /// <summary>
        ///     Gets the description.
        /// </summary>
        /// <value type="String"></value>
        return this._info.description;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "displayUrl", {
    get: function() {
        /// <summary>
        ///     Gets the display URL.
        /// </summary>
        /// <value type="String"></value>
        return this._info.displayUrl;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "sourceType", {
    get: function() {
        /// <summary>
        ///     Gets the source type.
        /// </summary>
        /// <value type="People.RecentActivity.FeedEntryVideoType"></value>
        return this._info.sourceType;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "sourceUrl", {
    get: function() {
        /// <summary>
        ///     Gets the source URL.
        /// </summary>
        /// <value type="String"></value>
        return this._info.sourceUrl;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "text", {
    get: function() {
        /// <summary>
        ///     Gets the text.
        /// </summary>
        /// <value type="String"></value>
        return this._info.text;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "tile", {
    get: function() {
        /// <summary>
        ///     Gets the tile.
        /// </summary>
        /// <value type="String"></value>
        return this._info.tile;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntryVideoData.prototype, "title", {
    get: function() {
        /// <summary>
        ///     Gets the title.
        /// </summary>
        /// <value type="String"></value>
        return this._info.title;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Core\ResultInfo.js" />

People.RecentActivity.ActionCompletedEventArgs = function(sender, result, userState) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.ActionCompletedEventHandler" /> class.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_result$1" type="People.RecentActivity.Core.ResultInfo">The result of the operation.</field>
    /// <field name="_userState$1" type="Object">The user state.</field>
    People.RecentActivity.EventArgs.call(this, sender);
    this._result$1 = result;
    this._userState$1 = userState;
};

Jx.inherit(People.RecentActivity.ActionCompletedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.ActionCompletedEventArgs.prototype._result$1 = null;
People.RecentActivity.ActionCompletedEventArgs.prototype._userState$1 = null;

Object.defineProperty(People.RecentActivity.ActionCompletedEventArgs.prototype, "result", {
    get: function() {
        /// <summary>
        ///     Gets the result of the action.
        /// </summary>
        /// <value type="People.RecentActivity.Core.ResultInfo"></value>
        return this._result$1;
    }
});

Object.defineProperty(People.RecentActivity.ActionCompletedEventArgs.prototype, "userState", {
    get: function() {
        /// <summary>
        ///     Gets the user state.
        /// </summary>
        /// <value type="Object"></value>
        return this._userState$1;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultCode.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\Comment.js" />
/// <reference path="ActionCompletedEventArgs.js" />

People.RecentActivity.CommentActionCompletedEventArgs = function(sender, result, comment, userState) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.CommentActionCompletedEventHandler" /> delegate.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="comment" type="People.RecentActivity.Comment">The comment.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_comment$2" type="People.RecentActivity.Comment">The comment.</field>
    People.RecentActivity.ActionCompletedEventArgs.call(this, sender, result, userState);
    Debug.assert((result.code !== People.RecentActivity.Core.ResultCode.success) || (comment != null), '(result.Code != ResultCode.Success) || (comment != null)');
    this._comment$2 = comment;
};

Jx.inherit(People.RecentActivity.CommentActionCompletedEventArgs, People.RecentActivity.ActionCompletedEventArgs);


People.RecentActivity.CommentActionCompletedEventArgs.prototype._comment$2 = null;

Object.defineProperty(People.RecentActivity.CommentActionCompletedEventArgs.prototype, "comment", {
    get: function() {
        /// <summary>
        ///     Gets the comment.
        /// </summary>
        /// <value type="People.RecentActivity.Comment"></value>
        return this._comment$2;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\FeedObject.js" />
/// <reference path="ActionCompletedEventArgs.js" />

People.RecentActivity.FeedObjectActionCompletedEventArgs = function(sender, result, obj, userState) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.FeedObjectActionCompletedEventHandler" /> delegate.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_obj$2" type="People.RecentActivity.FeedObject">The object.</field>
    People.RecentActivity.ActionCompletedEventArgs.call(this, sender, result, userState);
    this._obj$2 = obj;
};

Jx.inherit(People.RecentActivity.FeedObjectActionCompletedEventArgs, People.RecentActivity.ActionCompletedEventArgs);


People.RecentActivity.FeedObjectActionCompletedEventArgs.prototype._obj$2 = null;

Object.defineProperty(People.RecentActivity.FeedObjectActionCompletedEventArgs.prototype, "feedObject", {
    get: function() {
        /// <summary>
        ///     Gets the feed object.
        /// </summary>
        /// <value type="People.RecentActivity.FeedObject"></value>
        return this._obj$2;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="ActionCompletedEventArgs.js" />

People.RecentActivity.GetMoreActionCompletedEventArgs = function(sender, result, count, userState) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.GetMoreActionCompletedEventHandler" /> delegate.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="count" type="Number" integer="true">The count.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_count$2" type="Number" integer="true">The count of more entries retrieved.</field>
    People.RecentActivity.ActionCompletedEventArgs.call(this, sender, result, userState);
    Debug.assert(count >= 0, 'count');
    this._count$2 = count;
};

Jx.inherit(People.RecentActivity.GetMoreActionCompletedEventArgs, People.RecentActivity.ActionCompletedEventArgs);


People.RecentActivity.GetMoreActionCompletedEventArgs.prototype._count$2 = 0;

Object.defineProperty(People.RecentActivity.GetMoreActionCompletedEventArgs.prototype, "count", {
    get: function() {
        /// <summary>
        ///     Gets The count of more entries retrieved.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._count$2;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="..\Reaction.js" />
/// <reference path="ActionCompletedEventArgs.js" />

People.RecentActivity.ReactionActionCompletedEventArgs = function(sender, result, reaction, userState) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.ReactionActionCompletedEventHandler" /> delegate.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="reaction" type="People.RecentActivity.Reaction">The reaction.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_reaction$2" type="People.RecentActivity.Reaction">The reaction.</field>
    People.RecentActivity.ActionCompletedEventArgs.call(this, sender, result, userState);
    Debug.assert(reaction != null, 'reaction != null');
    this._reaction$2 = reaction;
};

Jx.inherit(People.RecentActivity.ReactionActionCompletedEventArgs, People.RecentActivity.ActionCompletedEventArgs);


People.RecentActivity.ReactionActionCompletedEventArgs.prototype._reaction$2 = null;

Object.defineProperty(People.RecentActivity.ReactionActionCompletedEventArgs.prototype, "reaction", {
    get: function() {
        /// <summary>
        ///     Gets the reaction.
        /// </summary>
        /// <value type="People.RecentActivity.Reaction"></value>
        return this._reaction$2;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\ResultInfo.js" />
/// <reference path="ActionCompletedEventArgs.js" />

People.RecentActivity.RefreshActionCompletedEventArgs = function(sender, result, updated, userState) {
    /// <summary>
    ///     Represents event arguments for a refresh completed event.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="updated" type="Boolean">Whether refresh resulted in a collection change.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_updated$2" type="Boolean">Whether the refresh resulted in an update of the collection.</field>
    People.RecentActivity.ActionCompletedEventArgs.call(this, sender, result, userState);
    this._updated$2 = updated;
};

Jx.inherit(People.RecentActivity.RefreshActionCompletedEventArgs, People.RecentActivity.ActionCompletedEventArgs);


People.RecentActivity.RefreshActionCompletedEventArgs.prototype._updated$2 = false;

Object.defineProperty(People.RecentActivity.RefreshActionCompletedEventArgs.prototype, "isUpdated", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the refresh resulted in the collection being updated.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._updated$2;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Core\Events\EventArgs.js" />
/// <reference path="..\..\Core\ResultCode.js" />

People.RecentActivity.ShareOperationActionCompletedEventArgs = function(sender, result, shareOperation, userState) {
    /// <summary>
    ///     Provides event arguments for the <see cref="T:People.RecentActivity.ShareOperationActionCompletedEventHandler" /> class.
    /// </summary>
    /// <param name="sender" type="Object">The sender.</param>
    /// <param name="result" type="People.RecentActivity.Core.ResultCode">The result of the operation.</param>
    /// <param name="shareOperation" type="People.RecentActivity.Core.create_shareOperationInfo">The share operation info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    /// <field name="_result$1" type="People.RecentActivity.Core.ResultCode">The result of the operation.</field>
    /// <field name="_shareOperation$1" type="People.RecentActivity.Core.create_shareOperationInfo">The share operation info.</field>
    /// <field name="_userState$1" type="Object">The user state.</field>
    People.RecentActivity.EventArgs.call(this, sender);
    this._result$1 = result;
    this._shareOperation$1 = shareOperation;
    this._userState$1 = userState;
};

Jx.inherit(People.RecentActivity.ShareOperationActionCompletedEventArgs, People.RecentActivity.EventArgs);


People.RecentActivity.ShareOperationActionCompletedEventArgs.prototype._result$1 = 0;
People.RecentActivity.ShareOperationActionCompletedEventArgs.prototype._shareOperation$1 = null;
People.RecentActivity.ShareOperationActionCompletedEventArgs.prototype._userState$1 = null;

Object.defineProperty(People.RecentActivity.ShareOperationActionCompletedEventArgs.prototype, "result", {
    get: function() {
        /// <summary>
        ///     Gets the result of the operation.
        /// </summary>
        /// <value type="People.RecentActivity.Core.ResultCode"></value>
        return this._result$1;
    }
});

Object.defineProperty(People.RecentActivity.ShareOperationActionCompletedEventArgs.prototype, "shareInfo", {
    get: function() {
        /// <summary>
        ///     Gets the share operation info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_shareOperationInfo"></value>
        return this._shareOperation$1;
    }
});

Object.defineProperty(People.RecentActivity.ShareOperationActionCompletedEventArgs.prototype, "userState", {
    get: function() {
        /// <summary>
        ///     Gets the user state.
        /// </summary>
        /// <value type="Object"></value>
        return this._userState$1;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="Configuration.js" />
/// <reference path="Events\ActionCompletedEventArgs.js" />
/// <reference path="Events\GetMoreActionCompletedEventArgs.js" />
/// <reference path="Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="FeedEntryCollection.js" />
/// <reference path="Network.js" />

People.RecentActivity.Feed = function(provider, network) {
    /// <summary>
    ///     Represents the feed for a single network.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <field name="_provider" type="People.RecentActivity.Core.IFeedProvider">The feed provider.</field>
    /// <field name="_network" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_entries" type="People.RecentActivity.FeedEntryCollection">The entry collection.</field>
    /// <field name="_initializeStarted" type="Boolean">Whether the feed has been initialized.</field>
    /// <field name="_initializeCompleted" type="Boolean">Whether initializing the feed has been completed.</field>
    /// <field name="_initializeFromHydration" type="Boolean">Whether we're initializing from hydration.</field>
    /// <field name="_hasMoreEntries" type="Boolean">Whether there are more entries to request.</field>
    /// <field name="_isGettingMoreEntries" type="Boolean">Whether more entries are being retrieved.</field>
    /// <field name="_isRefreshing" type="Boolean">Whether the feed is refreshing itself;</field>
    Debug.assert(network != null, 'network != null');

    this._network = network;
    this._provider = provider;
    this._entries = new People.RecentActivity.FeedEntryCollection(this._provider, this._network);
};

Jx.mix(People.RecentActivity.Feed.prototype, Jx.Events);
Jx.mix(People.RecentActivity.Feed.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.Feed.prototype, "getmoreentriescompleted", "refreshcompleted", "initializecompleted", "addentrycompleted", "ensureuptodatecompleted");

People.RecentActivity.Feed.prototype._provider = null;
People.RecentActivity.Feed.prototype._network = null;
People.RecentActivity.Feed.prototype._entries = null;
People.RecentActivity.Feed.prototype._initializeStarted = false;
People.RecentActivity.Feed.prototype._initializeCompleted = false;
People.RecentActivity.Feed.prototype._initializeFromHydration = false;
People.RecentActivity.Feed.prototype._hasMoreEntries = false;
People.RecentActivity.Feed.prototype._isGettingMoreEntries = false;
People.RecentActivity.Feed.prototype._isRefreshing = false;
People.RecentActivity.Feed.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.Feed.prototype, "entries", {
    get: function() {
        /// <summary>
        ///     Gets the list of entries.
        /// </summary>
        /// <value type="People.RecentActivity.FeedEntryCollection"></value>
        return this._entries;
    }
});

Object.defineProperty(People.RecentActivity.Feed.prototype, "initialized", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether <see cref="M:People.RecentActivity.Feed.Initialize(System.Object)" /> has completed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._initializeCompleted;
    }
});

Object.defineProperty(People.RecentActivity.Feed.prototype, "hasMoreEntries", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the feed has more entries.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._hasMoreEntries;
    }
});

Object.defineProperty(People.RecentActivity.Feed.prototype, "isGettingMoreEntries", {
    get: function() {
        /// <summary>
        ///     Whether more entries are being retrieved.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isGettingMoreEntries;
    }
});

Object.defineProperty(People.RecentActivity.Feed.prototype, "isRefreshing", {
    get: function() {
        /// <summary>
        ///     Whether the feed is refreshing itself.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isRefreshing;
    }
});

Object.defineProperty(People.RecentActivity.Feed.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network the feed represents.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network;
    }
});

People.RecentActivity.Feed.prototype.dispose = function () {
    /// <summary>Disposes the instance.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // dispose the entries.
        this._entries.dispose();

        // release other references.
        this._network = null;
        this._provider = null;
    }
};

People.RecentActivity.Feed.prototype.initializeFromHydration = function(userState) {
    /// <summary>
    ///     Initializes from hydration.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this._initializeStarted) {
        this._initializeStarted = true;
        this._initializeFromHydration = true;
        this._provider.getCachedFeedEntries(false, userState);
    }
};

People.RecentActivity.Feed.prototype.initialize = function(userState) {
    /// <summary>
    ///     Initializes the feed.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this._initializeStarted) {
        this._initializeStarted = true;
        this._provider.refreshFeedEntries(userState);
    }
};

People.RecentActivity.Feed.prototype.refresh = function(userState) {
    /// <summary>
    ///     Refreshes the feed.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(this._initializeCompleted, 'this.initializeCompleted');
    if (!this._isRefreshing) {
        this._isRefreshing = true;
        this._provider.refreshFeedEntries(userState);
    }
};

People.RecentActivity.Feed.prototype.ensureUpToDate = function(batchOnly, userState) {
    /// <summary>
    ///     Ensures that the feed is fully up to date and in sync with the underlying infrastructure.
    ///     Can only be called after <see cref="M:People.RecentActivity.Feed.Initialize" /> or <see cref="M:People.RecentActivity.Feed.InitializeFromHydration" />
    ///     have been called. A <see cref="M:People.RecentActivity.Feed.Refresh" /> call must still be made to get new entries.
    /// </summary>
    /// <param name="batchOnly" type="Boolean">Whether to sync up to batch size of feed entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(this._initializeCompleted, 'this.initializeCompleted');
    Jx.log.write(4, People.Social.format('Feed::EnsureUpToDate(batchOnly:{0})', batchOnly));
    if (batchOnly) {
        // we need to reset this variable if we only get batch size of entries from cache.
        this._isGettingMoreEntries = false;
    }

    this._provider.getCachedFeedEntries(batchOnly, userState);
};

People.RecentActivity.Feed.prototype.getMoreEntries = function(userState) {
    /// <summary>
    ///     Gets more entries.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(this._initializeCompleted, 'this.initializeCompleted');
    if (!this._isGettingMoreEntries) {
        this._isGettingMoreEntries = true;
        this._provider.getMoreFeedEntries(userState);
    }
};

People.RecentActivity.Feed.prototype.add = function(entry, userState) {
    /// <summary>
    ///     Adds a new entry to the feed.
    /// </summary>
    /// <param name="entry" type="People.RecentActivity.Core.create_feedObjectInfo">The entry to add.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._provider.addFeedObject(entry, userState);
};

People.RecentActivity.Feed.prototype.onRefreshFeedEntriesCompleted = function(result, entriesToAdd, entriesToUpdate, entriesToRemove, hasMoreEntries, userState) {
    /// <summary>
    ///     Occurs when the <see cref="M:People.RecentActivity.Feed.Refresh(System.Object)" /> operation completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entriesToAdd" type="Array" elementType="feedObjectInfo">The entries to add.</param>
    /// <param name="entriesToUpdate" type="Array" elementType="feedObjectInfo">The entries to update.</param>
    /// <param name="entriesToRemove" type="Array" elementType="feedObjectInfo">The entries to remove.</param>
    /// <param name="hasMoreEntries" type="Boolean">Whether there are more entries to request.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(entriesToAdd != null, 'entriesToAdd != null');
    Debug.assert(entriesToUpdate != null, 'entriesToUpdate != null');
    Debug.assert(entriesToRemove != null, 'entriesToRemove != null');

    this._isRefreshing = false;
    var updated = false;

    if (result.isSuccessOrPartialFailure) {
        if (entriesToAdd.length > 0) {
            updated = true;
            this._entries.onFeedEntriesAdded(entriesToAdd);
        }

        if (entriesToUpdate.length > 0) {
            this._entries.onFeedEntriesUpdated(entriesToUpdate);
        }

        if (entriesToRemove.length > 0) {
            updated = true;
            this._entries.onFeedEntriesRemoved(entriesToRemove);
        }    
    }

    this._hasMoreEntries = hasMoreEntries;

    if (!this._initializeCompleted) {
        // this refresh call was for initialization.
        this._onInitializeCompleted(result, userState);
    }
    else {
        this.raiseEvent("refreshcompleted", new People.RecentActivity.RefreshActionCompletedEventArgs(this, result, updated, userState));
    }
};

People.RecentActivity.Feed.prototype.onGetCachedFeedEntriesCompleted = function(result, entries, userState) {
    /// <summary>
    ///     Occurs when <see cref="M:People.RecentActivity.Feed.Initialize(System.Object)" /> completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(entries != null, 'entries != null');
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        if (this._initializeCompleted) {
            // if we're already initialized this means this is a "EnsureUpToDate" call, which means that the entries
            // we got from the provider are *real* entries. we have to replace our current set of entries.
            this._entries.onFeedEntriesReplaced(entries);
        }
        else {
            if (entries.length > 0) {
                // let's add these cached entries to the feed.
                this._entries.onFeedEntriesAdded(entries);
            }        
        }    
    }

    if (this._initializeCompleted) {
        // we've already completed the Initialize() call, so this must be a "EnsureUpToDate" call.
        this._onEnsureUpToDateCompleted(result, userState);
    }
    else if (this._initializeFromHydration) {
        // only mark as complete if we were actually hydrating. otherwise, this is a callback
        // that is part of the initialize/refresh flow to get us cached entries early on.
        this._onInitializeCompleted(result, userState);
    }
};

People.RecentActivity.Feed.prototype.onGetMoreEntriesCompleted = function(result, entries, hasMoreEntries, userState) {
    /// <summary>
    ///     Occurs when more entries have been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="hasMoreEntries" type="Boolean">Whether there are more entries to request.</param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(entries != null, 'entries != null');

    this.raiseEvent("getmoreentriescompleted", new People.RecentActivity.GetMoreActionCompletedEventArgs(this, result, entries.length, userState));

    if (entries.length > 0) {
        this._entries.onFeedEntriesAdded(entries);
    }

    this._hasMoreEntries = hasMoreEntries;
    this._isGettingMoreEntries = false;
};

People.RecentActivity.Feed.prototype.onAddEntryCompleted = function(result, info, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    this.raiseEvent("addentrycompleted", new People.RecentActivity.ActionCompletedEventArgs(this, result, userState));
};

People.RecentActivity.Feed.prototype._onEnsureUpToDateCompleted = function(result, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="userState" type="Object"></param>
    this.raiseEvent("ensureuptodatecompleted", new People.RecentActivity.ActionCompletedEventArgs(this, result, userState));
};

People.RecentActivity.Feed.prototype._onInitializeCompleted = function(result, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="userState" type="Object"></param>
    this._initializeCompleted = true;
    this.raiseEvent("initializecompleted", new People.RecentActivity.ActionCompletedEventArgs(this, result, userState));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="CommentCollection.js" />
/// <reference path="FeedObjectType.js" />
/// <reference path="Network.js" />
/// <reference path="ReactionTypeCollection.js" />

People.RecentActivity.FeedObject = function(provider, network, info) {
    /// <summary>
    ///     Provides a base feed object.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The parent network.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The entry info.</param>
    /// <field name="_provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</field>
    /// <field name="_info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</field>
    /// <field name="_network" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_comments" type="People.RecentActivity.CommentCollection">The comments.</field>
    /// <field name="_reactions" type="People.RecentActivity.ReactionTypeCollection">The reactions.</field>
    /// <field name="_timestamp" type="Date">The timestamp.</field>
    Debug.assert(provider != null, 'provider != null');
    Debug.assert(network != null, 'network != null');
    Debug.assert(info != null, 'info != null');

    this._info = info;
    this._network = network;
    this._provider = provider;
    this._timestamp = new Date(info.timestamp);
    this._comments = new People.RecentActivity.CommentCollection(provider, network, this);
    this._reactions = new People.RecentActivity.ReactionTypeCollection(provider, network, this);
};

People.RecentActivity.FeedObject.prototype._provider = null;
People.RecentActivity.FeedObject.prototype._info = null;
People.RecentActivity.FeedObject.prototype._network = null;
People.RecentActivity.FeedObject.prototype._comments = null;
People.RecentActivity.FeedObject.prototype._reactions = null;
People.RecentActivity.FeedObject.prototype._timestamp = null;
People.RecentActivity.FeedObject.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "id", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the object.
        /// </summary>
        /// <value type="String"></value>
        return this._info.id;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "sourceId", {
    get: function() {
        /// <summary>
        ///     Gets the source ID of the object.
        /// </summary>
        /// <value type="String"></value>
        return this._info.sourceId;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "objectInfo", {
    get: function() {
        /// <summary>
        ///     Gets the underlying info instance.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_feedObjectInfo"></value>
        return this._info;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "objectType", {
    get: function() {
        /// <summary>
        ///     Gets the type of the feed entry.
        /// </summary>
        /// <value type="People.RecentActivity.FeedObjectType"></value>
        return this._info.type;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "url", {
    get: function() {
        /// <summary>
        ///     Gets the url of the web page for the object.
        /// </summary>
        /// <value type="String"></value>
        return this._info.url;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "timestamp", {
    get: function() {
        /// <summary>
        ///     Gets the timestamp.
        /// </summary>
        /// <value type="Date"></value>
        return this._timestamp;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "comments", {
    get: function() {
        /// <summary>
        ///     Gets the comments.
        /// </summary>
        /// <value type="People.RecentActivity.CommentCollection"></value>
        return this._comments;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "reactions", {
    get: function() {
        /// <summary>
        ///     Gets the reactions.
        /// </summary>
        /// <value type="People.RecentActivity.ReactionTypeCollection"></value>
        return this._reactions;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the parent network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network;
    }
});

Object.defineProperty(People.RecentActivity.FeedObject.prototype, "provider", {
    get: function() {
        /// <summary>
        ///     Gets the provider.
        /// </summary>
        /// <value type="People.RecentActivity.Core.IFeedProvider"></value>
        return this._provider;
    }
});

People.RecentActivity.FeedObject.prototype.dispose = function () {
    /// <summary>Disposes the instance.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // let the super class dispose itself.
        this.onDisposed();

        // clean up comments, reactions, etc.
        this._comments.dispose();
        this._reactions.dispose();
        
        // clean up references.
        this._info = null;
        this._network = null;
        this._provider = null;
    }
};

People.RecentActivity.FeedObject.prototype.onDisposed = function () {
    /// <summary>Occurs when the instance has been disposed.</summary>
};

People.RecentActivity.FeedObject.prototype.onUpdated = function(info) {
    /// <summary>
    ///     Occurs when the object has been updated.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The updated info.</param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === this._info.type, 'info.Type == this.info.Type');

    // update the comments and reaction collections.
    this._comments.updateDetails(info.commentDetails);
    this._reactions.updateDetails(info.reactionDetails);
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\FeedEntryInfoType.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />
/// <reference path="Entity.js" />
/// <reference path="EntityType.js" />
/// <reference path="Entries\FeedEntryLinkData.js" />
/// <reference path="Entries\FeedEntryPhotoAlbumData.js" />
/// <reference path="Entries\FeedEntryPhotoData.js" />
/// <reference path="Entries\FeedEntryTextData.js" />
/// <reference path="Entries\FeedEntryVideoData.js" />
/// <reference path="FeedEntryType.js" />
/// <reference path="FeedObject.js" />
/// <reference path="Helpers\AnnotationHelper.js" />
/// <reference path="Helpers\EntityHelper.js" />
/// <reference path="Network.js" />

People.RecentActivity.FeedEntry = function(provider, network, info) {
    /// <summary>
    ///     Represents a single feed entry.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The parent network.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The entry info.</param>
    /// <field name="_info$1" type="People.RecentActivity.Core.create_feedEntryInfo">The feed entry info.</field>
    /// <field name="_publisher$1" type="People.RecentActivity.Contact">The publisher.</field>
    /// <field name="_entities$1" type="Array" elementType="Entity">The entities.</field>
    /// <field name="_annotations$1" type="Array" elementType="Annotation">The annotations.</field>
    /// <field name="_data$1" type="Object">The data.</field>
    People.RecentActivity.FeedObject.call(this, provider, network, info);

    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'info.Type == FeedObjectInfoType.Entry');

    this._info$1 = info.data;
    this._publisher$1 = People.RecentActivity.ContactCache.findOrCreateContact(this._info$1.publisher);
};

Jx.inherit(People.RecentActivity.FeedEntry, People.RecentActivity.FeedObject);

People.RecentActivity.FeedEntry.prototype._info$1 = null;
People.RecentActivity.FeedEntry.prototype._publisher$1 = null;
People.RecentActivity.FeedEntry.prototype._entities$1 = null;
People.RecentActivity.FeedEntry.prototype._annotations$1 = null;
People.RecentActivity.FeedEntry.prototype._data$1 = null;

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return this._publisher$1;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "data", {
    get: function() {
        /// <summary>
        ///     Gets the data for the entry.
        /// </summary>
        /// <value type="Object"></value>
        if (this._data$1 == null) {
            switch (this._info$1.type) {
                case People.RecentActivity.Core.FeedEntryInfoType.link:
                    this._data$1 = new People.RecentActivity.FeedEntryLinkData(this._info$1.data);
                    break;

                case People.RecentActivity.Core.FeedEntryInfoType.photo:
                    this._data$1 = new People.RecentActivity.FeedEntryPhotoData(this.network, this._info$1.data);
                    break;

                case People.RecentActivity.Core.FeedEntryInfoType.photoAlbum:
                    this._data$1 = new People.RecentActivity.FeedEntryPhotoAlbumData(this.network, this._info$1.data);
                    break;

                case People.RecentActivity.Core.FeedEntryInfoType.text:
                    this._data$1 = new People.RecentActivity.FeedEntryTextData(this._info$1.data);
                    break;

                case People.RecentActivity.Core.FeedEntryInfoType.video:
                    this._data$1 = new People.RecentActivity.FeedEntryVideoData(this._info$1.data);
                    break;

                default:
                    Debug.assert(false, 'Unknown entry type: ' + this._info$1.type);
                    break;
            }        
        }

        return this._data$1;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "entryType", {
    get: function() {
        /// <summary>
        ///     Gets the via ("via network/publisher/...")
        ///     Gets the type of the feed entry.
        /// </summary>
        /// <value type="People.RecentActivity.FeedEntryType"></value>
        return this._info$1.type;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "via", {
    get: function() {
        /// <summary>
        ///     Gets the via ("via network/publisher/...")
        /// </summary>
        /// <value type="String"></value>
        return this._info$1.via;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "entities", {
    get: function() {
        /// <summary>
        ///     Gets the entities.
        /// </summary>
        /// <value type="Array" elementType="Entity"></value>
        if (this._entities$1 == null) {
            this._entities$1 = People.RecentActivity.EntityHelper.createEntities(this._info$1.entities);
        }

        return this._entities$1;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "annotations", {
    get: function() {
        /// <summary>
        ///     Gets the annotations.
        /// </summary>
        /// <value type="Array" elementType="Annotation"></value>
        if (this._annotations$1 == null) {
            this._annotations$1 = People.RecentActivity.AnnotationHelper.createAnnotations(this._info$1);
        }

        return this._annotations$1;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "isShared", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this post was shared.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info$1.isShared;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "parentId", {
    get: function() {
        /// <summary>
        ///     Gets the parent ID.
        /// </summary>
        /// <value type="String"></value>
        return this._info$1.parentId;
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "sortOrder", {
    get: function() {
        /// <value type="Number" integer="true"></value>
        return this.timestamp.getTime();
    }
});

Object.defineProperty(People.RecentActivity.FeedEntry.prototype, "entryInfo", {
    get: function() {
        /// <summary>
        ///     Gets the entry info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_feedEntryInfo"></value>
        return this._info$1;
    }
});

People.RecentActivity.FeedEntry.prototype.onDisposed = function () {
    /// <summary>Occurs when the instance has been disposed.</summary>
    this._annotations$1 = null;
    this._data$1 = null;
    this._entities$1 = null;
    this._info$1 = null;
    this._publisher$1 = null;
};

People.RecentActivity.FeedEntry.prototype.containsEntityType = function(type) {
    /// <summary>
    ///     Checks whether the entry has an entity of the given type.
    /// </summary>
    /// <param name="type" type="People.RecentActivity.EntityType">The type of entity.</param>
    /// <returns type="Boolean"></returns>
    return this.findEntityByType(type) != null;
};

People.RecentActivity.FeedEntry.prototype.findEntityByType = function(type) {
    /// <summary>
    ///     Finds the first entity of the given type.
    /// </summary>
    /// <param name="type" type="People.RecentActivity.EntityType">The type of the entity.</param>
    /// <returns type="People.RecentActivity.Entity"></returns>
    var entities = this.entities;
    for (var i = 0, len = entities.length; i < len; i++) {
        if (entities[i].type === type) {
            return entities[i];
        }    
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="Collection.js" />
/// <reference path="FeedEntry.js" />
/// <reference path="Helpers\CollectionHelper.js" />
/// <reference path="Network.js" />

People.RecentActivity.FeedEntryCollection = function(provider, network) {
    /// <summary>
    ///     Represents a collection of <see cref="T:People.RecentActivity.FeedEntry" /> instances.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The parent network.</param>
    /// <field name="_map$1" type="Object">The ID &lt;--&gt; Entry mapping.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The provider.</field>
    People.RecentActivity.Collection.call(this);

    Debug.assert(network != null, 'network != null');

    this._map$1 = {};
    this._network$1 = network;
    this._provider$1 = provider;
};

Jx.inherit(People.RecentActivity.FeedEntryCollection, People.RecentActivity.Collection);

People.RecentActivity.FeedEntryCollection.prototype._map$1 = null;
People.RecentActivity.FeedEntryCollection.prototype._network$1 = null;
People.RecentActivity.FeedEntryCollection.prototype._provider$1 = null;
People.RecentActivity.FeedEntryCollection.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.FeedEntryCollection.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network$1;
    }
});

People.RecentActivity.FeedEntryCollection.prototype.dispose = function () {
    /// <summary>Disposes the collection.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // dispose each entry.
        for (var i = this.count - 1; i >= 0; i--) {
            this.item(i).dispose();
        }

        // clear references, maps.
        People.Social.clearKeys(this._map$1);

        this._network$1 = null;
        this._provider$1 = null;
    }
};

People.RecentActivity.FeedEntryCollection.prototype.findOrCreateEntryByInfo = function(info) {
    /// <summary>
    ///     Finds or creates a new entry.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The entry info.</param>
    /// <returns type="People.RecentActivity.FeedEntry"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'info.Type == FeedObjectInfoType.Entry');

    var entry = this.findEntryByInfo(info);
    if (entry == null) {
        // create a new entry and add it to the feed.
        entry = this._addByInfo$1(info);
    }

    return entry;
};

People.RecentActivity.FeedEntryCollection.prototype.findEntryByInfo = function(info) {
    /// <summary>
    ///     Finds an entry.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The entry info.</param>
    /// <returns type="People.RecentActivity.FeedEntry"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'info.Type == FeedObjectInfoType.Entry');

    var id = this._getObjectKey$1(info);
    if (!Jx.isUndefined(this._map$1[id])) {
        return this._map$1[id];
    }

    return null;
};

People.RecentActivity.FeedEntryCollection.prototype.onFeedEntriesReplaced = function(entries) {
    /// <summary>
    ///     Occurs when feed entries were replaced.
    /// </summary>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The entries.</param>
    Debug.assert(entries != null, 'entries != null');

    // clear out the current map and entries.
    this.clearInternal();
    People.Social.clearKeys(this._map$1);

    if (entries.length > 0) {
        // add all the entries!
        this.onFeedEntriesAdded(entries);
    }
};

People.RecentActivity.FeedEntryCollection.prototype.onFeedEntriesAdded = function(entries) {
    /// <summary>
    ///     Occurs when feed entries were added.
    /// </summary>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The new feed entries.</param>
    Debug.assert(entries != null, 'entries != null');
    Debug.assert(entries.length > 0, 'entries.Length > 0');

    this._addRangeByInfo$1(entries);
};

People.RecentActivity.FeedEntryCollection.prototype.onFeedEntriesUpdated = function(entries) {
    /// <summary>
    ///     Occurs when feed entries were updated.
    /// </summary>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The updated feed entries.</param>
    Debug.assert(entries != null, 'entries != null');
    Debug.assert(entries.length > 0, 'entries.Length > 0');

    for (var i = 0, len = entries.length; i < len; i++) {
        var entry = this.findEntryByInfo(entries[i]);
        if (entry != null) {
            entry.onUpdated(entries[i]);
        }    
    }
};

People.RecentActivity.FeedEntryCollection.prototype.onFeedEntriesRemoved = function(entries) {
    /// <summary>
    ///     Occurs when feed entries were removed.
    /// </summary>
    /// <param name="entries" type="Array" elementType="feedObjectInfo">The removed feed entries.</param>
    Debug.assert(entries != null, 'entries != null');
    Debug.assert(entries.length > 0, 'entries.Length > 0');

    this._removeRangeByInfo$1(entries);
};

People.RecentActivity.FeedEntryCollection.prototype._addByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="People.RecentActivity.FeedEntry"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'info.Type == FeedObjectInfoType.Entry');

    var id = this._getObjectKey$1(info);
    if (Jx.isUndefined(this._map$1[id])) {
        // initialize a new feed object, and add it.
        // fetch the correct network for this object.
        var network = this._network$1.identity.networks.findById(info.sourceId);

        var entry = new People.RecentActivity.FeedEntry(this._provider$1, network, info);
        this._map$1[id] = entry;
        People.RecentActivity.CollectionHelper.addSortableItem(this, entry, true);

        return entry;
    }
    else {
        // return the existing object.
        return this._map$1[id];
    }
};

People.RecentActivity.FeedEntryCollection.prototype._addRangeByInfo$1 = function(info) {
    /// <param name="info" type="Array" elementType="feedObjectInfo"></param>
    Debug.assert(info != null, 'info != null');

    if (info.length > 0) {
        var entries = [];
        var networks = this._network$1.identity.networks;

        for (var i = 0, len = info.length; i < len; i++) {
            // initialize a new instance of the feed entry, and add it to the map.
            var entryInfo = info[i];

            Debug.assert(entryInfo.type === People.RecentActivity.Core.FeedObjectInfoType.entry, 'entryInfo.Type == FeedObjectInfoType.Entry');

            var id = this._getObjectKey$1(entryInfo);
            if (Jx.isUndefined(this._map$1[id])) {
                // make sure we look up the correct network for this entry.
                var entry = new People.RecentActivity.FeedEntry(this._provider$1, networks.findById(entryInfo.sourceId), entryInfo);

                this._map$1[id] = entry;
                entries.push(entry);
            }        
        }

        if (entries.length > 0) {
            // after we've gotten all the entries, sort-insert the items.
            People.RecentActivity.CollectionHelper.addSortableItems(this, entries, true);
        }    
    }
};

People.RecentActivity.FeedEntryCollection.prototype._removeRangeByInfo$1 = function(info) {
    /// <param name="info" type="Array" elementType="feedObjectInfo"></param>
    Debug.assert(info != null, 'info != null');

    var list = [];

    for (var i = 0, len = info.length; i < len; i++) {
        var id = this._getObjectKey$1(info[i]);
        if (!Jx.isUndefined(this._map$1[id])) {
            list.push(this._map$1[id]);
            delete this._map$1[id];
        }    
    }

    this.removeRangeInternal(list);
};

People.RecentActivity.FeedEntryCollection.prototype._getObjectKey$1 = function(obj) {
    /// <param name="obj" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="String"></returns>
    Debug.assert(obj != null, 'obj');

    return obj.sourceId + ';' + obj.id;
};

People.RecentActivity.FeedEntryCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets the <see cref="T:People.RecentActivity.FeedEntry" /> at the given index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <param name="value" type="People.RecentActivity.FeedEntry"></param>
    /// <returns type="People.RecentActivity.FeedEntry"></returns>
    Debug.assert((index >= 0) && (index < this.count), '(index >= 0) && (index < this.Count)');

    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Annotation.js" />

People.RecentActivity.AnnotationHelper = function() {
    /// <summary>
    ///     Provides helpers for annotations.
    /// </summary>
};

People.RecentActivity.AnnotationHelper.createAnnotations = function(info) {
    /// <summary>
    ///     Creates annotations from the given info objects.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedEntryInfo">The info.</param>
    /// <returns type="Array" elementType="Annotation"></returns>
    Debug.assert(info != null, 'info != null');
    var output = [];
    // first add all the normal annotations, if we have one.
    var annotations = info.annotations;
    if (annotations != null) {
        for (var i = 0, len = annotations.length; i < len; i++) {
            output.push(new People.RecentActivity.Annotation(annotations[i]));
        }    
    }

    return output;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Collection.js" />

People.RecentActivity.CollectionHelper = function() {
    /// <summary>
    ///     Provides helpers for collections.
    /// </summary>
};

People.RecentActivity.CollectionHelper.addSortableItems = function(collection, items, reverse) {
    /// <summary>
    ///     Adds items to a collection based on their correct sort order. Will try to minimize the
    ///     number of collection changes that happen by bucketing items.
    /// </summary>
    /// <param name="collection" type="People.RecentActivity.Collection">The collection to add the entries to.</param>
    /// <param name="items" type="Array" elementType="ISortable">The items to add.</param>
    /// <param name="reverse" type="Boolean">Whether to reverse sort the items.</param>
    Debug.assert(collection != null, 'collection != null');
    Debug.assert(items != null, 'items != null');
    Debug.assert(items.length > 0, 'items.Length > 0');
    // some entries will be older, some entries will be newer.
    var original = Array.apply(null, collection.items);
    var list = [];
    list.push.apply(list, original);
    list.push.apply(list, items);
    // once we've created a combined list of entries, sort them.
    list.sort(function(a, b) {
        var sa = (a).sortOrder;
        var sb = (b).sortOrder;
        return (reverse) ? sb - sa : sa - sb;
    });
    // now that we've sorted everything into place, we need to find the original items and 
    // create buckets from the new items that we can insert.
    var start = 0;
    for (var i = 0, count = original.length; i < count; i++) {
        var index = list.indexOf(original[i]);
        var chunk = index - start;
        if (chunk > 0) {
            // c-c-combo breaker! get the chunk of items we need to add, and insert them.
            collection.insertRangeInternal(start, list.slice(start, start + chunk));
        }

        start = index + 1;
    }

    if (start !== list.length) {
        // append whatever we didnt add yet.
        collection.addRangeInternal(list.slice(start));
    }
};

People.RecentActivity.CollectionHelper.addSortableItem = function(collection, item, reverse) {
    /// <summary>
    ///     Adds a single item at the correct index.
    /// </summary>
    /// <param name="collection" type="People.RecentActivity.Collection">The collection.</param>
    /// <param name="item" type="People.RecentActivity.ISortable">The item to add.</param>
    /// <param name="reverse" type="Boolean">Whether to reverse sort the item.</param>
    Debug.assert(collection != null, 'collection != null');
    Debug.assert(item != null, 'item != null');
    var inserted = false;
    var order = item.sortOrder;
    var items = collection.items;
    for (var i = 0, count = items.length; !inserted && (i < count); i++) {
        // simply traverse the collection until we find a spot.
        var comparison = order - (items[i]).sortOrder;
        if ((!comparison) || (!reverse && (comparison < 0)) || (reverse && (comparison > 0))) {
            // found the right spot to insert the item.
            collection.insertInternal(i, item);
            inserted = true;
        }    
    }

    if (!inserted) {
        // append it to the end.
        collection.addInternal(item);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Entity.js" />

People.RecentActivity.EntityHelper = function() {
    /// <summary>
    ///     Provides helpers for entities.
    /// </summary>
};

People.RecentActivity.EntityHelper.createEntities = function(entities) {
    /// <summary>
    ///     Creates entities from the given info objects.
    /// </summary>
    /// <param name="entities" type="Array" elementType="entityInfo">The entity infos.</param>
    /// <returns type="Array" elementType="Entity"></returns>
    if ((entities == null) || (!entities.length)) {
        return new Array(0);
    }

    var output = new Array(entities.length);
    for (var i = 0, len = entities.length; i < len; i++) {
        output[i] = new People.RecentActivity.Entity(entities[i]);
    }

    return output;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Platform\SocialCapabilities.js" />
/// <reference path="..\Providers\FeedProviderFactory.js" />
/// <reference path="..\Providers\IdentityType.js" />
/// <reference path="MeIdentity.js" />
/// <reference path="NetworkCollection.js" />
/// <reference path="PermanentIdentity.js" />
/// <reference path="TemporaryIdentity.js" />
/// <reference path="WhatsNewIdentity.js" />

People.RecentActivity.Identity = function(identityId, identityType) {
    /// <summary>
    ///     Represents a single identity.
    /// </summary>
    /// <param name="identityId" type="String">The identity ID.</param>
    /// <param name="identityType" type="People.RecentActivity.Providers.IdentityType">The identity type.</param>
    /// <field name="_networks" type="People.RecentActivity.NetworkCollection">The list of networks.</field>
    /// <field name="_me" type="People.RecentActivity.Identity" static="true">The identity representing the signed-in user.</field>
    /// <field name="_whatsNew" type="People.RecentActivity.Identity" static="true">The identify representing what's new.</field>
    /// <field name="_meId" type="String" static="true">The Me ID.</field>
    /// <field name="_identityId" type="String">The ID.</field>
    /// <field name="_identityType" type="People.RecentActivity.Providers.IdentityType">The identity type.</field>
    /// <field name="_disposed" type="Boolean">Whether the instance has been disposed.</field>
    /// <field name="_capabilities" type="People.RecentActivity.Platform.SocialCapabilities">The capabilities.</field>
    Debug.assert(Jx.isNonEmptyString(identityId), '!string.IsNullOrEmpty(identityId)');
    this._identityId = identityId;
    this._identityType = identityType;
};


People.RecentActivity.Identity._me = null;
People.RecentActivity.Identity._whatsNew = null;
People.RecentActivity.Identity._meId = null;

People.RecentActivity.Identity.createIdentity = function(id) {
    /// <summary>
    ///     Creates an instance of the <see cref="T:People.RecentActivity.Identity" /> class for a friend.
    /// </summary>
    /// <param name="id" type="String">The ID of the friend.</param>
    /// <returns type="People.RecentActivity.Identity"></returns>
    Debug.assert(Jx.isNonEmptyString(id), '!string.IsNullOrEmpty(id)');
    // also catch the case where the ID is "me" because this is a magic ID.
    if ((id.toLowerCase() === 'me') || (id === People.RecentActivity.Identity._getMeId())) {
        return People.RecentActivity.Identity.createMeIdentity();
    }
    else {
        return new People.RecentActivity.PermanentIdentity(id);
    }
};

People.RecentActivity.Identity.createTemporaryIdentity = function(contact) {
    /// <summary>
    ///     Creates an instance of the <see cref="T:People.RecentActivity.Identity" /> class for a non-friend.
    /// </summary>
    /// <param name="contact" type="People.RecentActivity.Core.create_temporaryContactInfo">The contact info.</param>
    /// <returns type="People.RecentActivity.Identity"></returns>
    Debug.assert(contact != null, 'contact != null');
    return new People.RecentActivity.TemporaryIdentity(contact);
};

People.RecentActivity.Identity.createWhatsNewIdentity = function() {
    /// <summary>
    ///     Creates a new person that represents the What's New feed.
    /// </summary>
    /// <returns type="People.RecentActivity.Identity"></returns>
    if (People.RecentActivity.Identity._whatsNew == null) {
        // initialize a new "What's New" identity.. but do it only once.
        People.RecentActivity.Identity._whatsNew = new People.RecentActivity.WhatsNewIdentity();
    }
    else {
        People.RecentActivity.Identity._whatsNew.refreshNetworks();
    }

    return People.RecentActivity.Identity._whatsNew;
};

People.RecentActivity.Identity.createMeIdentity = function() {
    /// <summary>
    ///     Creates the an identity for the user.
    /// </summary>
    /// <returns type="People.RecentActivity.Identity"></returns>
    if (People.RecentActivity.Identity._me == null) {
        // initialize a new "Me" identity.. but do it only once.
        People.RecentActivity.Identity._me = new People.RecentActivity.MeIdentity(People.RecentActivity.Identity._getMeId());
    }
    else {
        People.RecentActivity.Identity._me.refreshNetworks();
    }

    return People.RecentActivity.Identity._me;
};

People.RecentActivity.Identity.createFromDataContext = function(person, contactInfo) {
    /// <summary>
    ///     Creates a new <see cref="T:People.RecentActivity.Identity" /> from a given context.
    /// </summary>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">A Person object from the platform.</param>
    /// <param name="contactInfo" type="People.RecentActivity.Core.create_temporaryContactInfo">A temporary contact blob.</param>
    /// <returns type="People.RecentActivity.Identity"></returns>
    if (person != null && person.isInAddressBook) {
        return People.RecentActivity.Identity.createIdentity(person.objectId);
    }
    else if (contactInfo != null && Jx.isNonEmptyString(contactInfo.objectId) && Jx.isNonEmptyString(contactInfo.objectSourceId)) {
        return People.RecentActivity.Identity.createTemporaryIdentity(contactInfo);
    }
    else {
        return null;
    }
};

People.RecentActivity.Identity._getMeId = function() {
    /// <returns type="String"></returns>
    if (!Jx.isNonEmptyString(People.RecentActivity.Identity._meId)) {
        // query the ID of the me person from the account.
        try {
            var me = Jx.root._platformCache.getDefaultMeContact();
            People.RecentActivity.Identity._meId = me.objectId;
        } catch (err) {
            Jx.log.exception("People.RecentActivity.Identity._getMeId: failed to get ME contact.", err);
        }
    }

    // Can return null or undefined if we fail to get the me Id above.
    return People.RecentActivity.Identity._meId;
};


People.RecentActivity.Identity.prototype._networks = null;
People.RecentActivity.Identity.prototype._identityId = null;
People.RecentActivity.Identity.prototype._identityType = 0;
People.RecentActivity.Identity.prototype._disposed = false;
People.RecentActivity.Identity.prototype._capabilities = null;

Object.defineProperty(People.RecentActivity.Identity.prototype, "capabilities", {
    get: function() {
        /// <summary>
        ///     Gets the social capabilities.
        /// </summary>
        /// <value type="People.RecentActivity.Platform.SocialCapabilities"></value>
        if (this._capabilities == null) {
            if (this.isWhatsNew) {
                // use the default constructor without passing any objects in.
                this._capabilities = People.RecentActivity.Platform.SocialCapabilities.whatsNewCapabilities;
            }
            else if (this.isMe) {
                this._capabilities = People.RecentActivity.Platform.SocialCapabilities.meCapabilities;
            }
            else {
                // pass in the data context, which can either be a Person or a TemporaryContactInfo
                this._capabilities = new People.RecentActivity.Platform.SocialCapabilities(this.getDataContext());
            }        
        }

        return this._capabilities;
    }
});

Object.defineProperty(People.RecentActivity.Identity.prototype, "id", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the person.
        /// </summary>
        /// <value type="String"></value>
        return this._identityId;
    }
});

Object.defineProperty(People.RecentActivity.Identity.prototype, "isMe", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the identity represents "Me".
        /// </summary>
        /// <value type="Boolean"></value>
        return false;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Identity.prototype, "isTemporary", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is a temporary identity.
        /// </summary>
        /// <value type="Boolean"></value>
        return false;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Identity.prototype, "isWhatsNew", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this person represents the What's New feed.
        /// </summary>
        /// <value type="Boolean"></value>
        return false;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.Identity.prototype, "networks", {
    get: function() {
        /// <summary>
        ///     Gets the list of networks.
        /// </summary>
        /// <value type="People.RecentActivity.NetworkCollection"></value>
        this._ensureNetworks();
        return this._networks;
    }
});

Object.defineProperty(People.RecentActivity.Identity.prototype, "type", {
    get: function() {
        /// <summary>
        ///     Gets the type of the identity.
        /// </summary>
        /// <value type="People.RecentActivity.Providers.IdentityType"></value>
        return this._identityType;
    }
});

People.RecentActivity.Identity.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the intance.
    /// </summary>
    if (!this._disposed) {
        if (!this.isMe && !this.isWhatsNew) {
            // We don't actually dispose MeIdentity or WhatsNew identities.
            this._disposed = true;
        }

        this.onDisposed();
    }
};

People.RecentActivity.Identity.prototype.refreshNetworks = function() {
    /// <summary>
    ///     Refresh the networks for this identity.
    /// </summary>
    if (this._networks != null) {
        this.onRefreshNetworks();
    }
};

People.RecentActivity.Identity.prototype.ensureFactory = function() {
    /// <summary>
    ///     Ensures that the identity has created a factory.
    /// </summary>
    this._ensureNetworks();
};

People.RecentActivity.Identity.prototype.onDisposed = function() {
    /// <summary>
    ///     Occurs when the instance is being disposed.
    /// </summary>
    if (this.isMe || this.isWhatsNew) {
        // We don't dispose Me and WhatsNew identity.
        return;
    }

    if (this._networks != null) {
        for (var i = 0, len = this._networks.count; i < len; i++) {
            this._networks.item(i).dispose();
        }

        this._networks = null;
    }

    if (this._capabilities != null) {
        this._capabilities.dispose();
        this._capabilities = null;
    }
};

People.RecentActivity.Identity.prototype.onEnsureNetworks = function() {
    /// <summary>
    ///     Ensures that we have networks.
    /// </summary>
    /// <returns type="People.RecentActivity.NetworkCollection"></returns>
    // fetch the networks for the current ID and create a new collection.
    var networks = People.RecentActivity.Providers.FeedProviderFactory.instance.getNetworks(this._identityId);
    var collection = new People.RecentActivity.NetworkCollection(this);
    collection.addRangeByInfo(networks);
    return collection;
};

People.RecentActivity.Identity.prototype.onRefreshNetworks = function() {
    /// <summary>
    ///     Refreshes the networks for this identity.
    /// </summary>
    // fetch the networks for the current ID and update the collection.
    var info = People.RecentActivity.Providers.FeedProviderFactory.instance.getNetworks(this._identityId);
    this._networks.updateByInfo(info);
};

People.RecentActivity.Identity.prototype._ensureNetworks = function() {
    if (this._networks == null) {
        this._networks = this.onEnsureNetworks();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Providers\IdentityType.js" />
/// <reference path="Identity.js" />

People.RecentActivity.PermanentIdentity = function(id) {
    /// <summary>
    ///     Provides an identity for permanent (non-temporary) contacts.
    /// </summary>
    /// <param name="id" type="String">The ID of the contact.</param>
    /// <field name="_person$1" type="Microsoft.WindowsLive.Platform.Person">The person.</field>
    People.RecentActivity.Identity.call(this, id, People.RecentActivity.Providers.IdentityType.person);
};

Jx.inherit(People.RecentActivity.PermanentIdentity, People.RecentActivity.Identity);


People.RecentActivity.PermanentIdentity.prototype._person$1 = null;

Object.defineProperty(People.RecentActivity.PermanentIdentity.prototype, "name", {
    get: function() {
        /// <summary>
        ///     Gets the name.
        /// </summary>
        /// <value type="String"></value>
        var person = this._getPerson$1();
        if (person != null) {
            return person.calculatedUIName;
        }

        return null;
    },
    configurable: true
});

People.RecentActivity.PermanentIdentity.prototype.getDataContext = function() {
    /// <summary>
    ///     Gets the data context.
    /// </summary>
    /// <returns type="Object"></returns>
    return this._getPerson$1();
};

People.RecentActivity.PermanentIdentity.prototype._getPerson$1 = function() {
    /// <returns type="Microsoft.WindowsLive.Platform.Person"></returns>
    if (this._person$1 == null) {
        try {
            // fetch the person object from the platform.
            var cache = Jx.root.getPlatformCache();
            var client = cache.getPlatform();
            this._person$1 = client.peopleManager.tryLoadPerson(this.id);
            // check to see if this contact really represents the me-contact. if so, instead of returning the 
            // Person object we should return the contact object.
            var me = cache.getDefaultMeContact();
            if (this._person$1.objectId === me.objectId) {
                this._person$1 = me;
            }

        }
        catch (e) {
            // failed to query platform, log exception.
            Jx.log.write(2, 'Failed to query platform: ' + e.toString());
        }    
    }

    return this._person$1;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="PermanentIdentity.js" />

People.RecentActivity.MeIdentity = function(id) {
    /// <summary>
    ///     Provides an identity for "Me".
    /// </summary>
    /// <param name="id" type="String">The ID of "Me".</param>
    People.RecentActivity.PermanentIdentity.call(this, id);
};

Jx.inherit(People.RecentActivity.MeIdentity, People.RecentActivity.PermanentIdentity);

Object.defineProperty(People.RecentActivity.MeIdentity.prototype, "isMe", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this identity represents "Me".
        /// </summary>
        /// <value type="Boolean"></value>
        return true;
    },
    configurable: true
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\Core\FeedObjectInfo.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="..\Providers\FeedProviderFactory.js" />
/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />
/// <reference path="Events\FeedObjectActionCompletedEventArgs.js" />
/// <reference path="Feed.js" />
/// <reference path="FeedObjectType.js" />
/// <reference path="Identity.js" />
/// <reference path="NetworkCapabilities.js" />
/// <reference path="NotificationFeed.js" />
/// <reference path="PhotoAlbumCollection.js" />

People.RecentActivity.Network = function(identity, info) {
    /// <summary>
    ///     Represents a single network.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_networkInfo">The network info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_networkInfo">The network info.</field>
    /// <field name="_capabilities" type="People.RecentActivity.NetworkCapabilities">The capabilities.</field>
    /// <field name="_identity" type="People.RecentActivity.Identity">The person.</field>
    /// <field name="_provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</field>
    /// <field name="_feed" type="People.RecentActivity.Feed">The feed.</field>
    /// <field name="_albums" type="People.RecentActivity.PhotoAlbumCollection">The photo albums.</field>
    /// <field name="_notifications" type="People.RecentActivity.NotificationFeed">The notifications for the network.</field>
    /// <field name="_name" type="String">The name.</field>
    /// <field name="_icon" type="String">The icon.</field>
    /// <field name="_disposed" type="Boolean">Whether or not the instance has been disposed.</field>
    Debug.assert(identity != null, 'identity != null');
    Debug.assert(info != null, 'info != null');

    this._info = info;
    this._capabilities = new People.RecentActivity.NetworkCapabilities(info);
    this._identity = identity;
    this._name = info.name;
    this._icon = info.icon;
};

Jx.mix(People.RecentActivity.Network.prototype, Jx.Events);
Jx.mix(People.RecentActivity.Network.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.Network.prototype, "getobjectcompleted", "propertychanged");

People.RecentActivity.Network.prototype._info = null;
People.RecentActivity.Network.prototype._capabilities = null;
People.RecentActivity.Network.prototype._identity = null;
People.RecentActivity.Network.prototype._provider = null;
People.RecentActivity.Network.prototype._feed = null;
People.RecentActivity.Network.prototype._albums = null;
People.RecentActivity.Network.prototype._notifications = null;
People.RecentActivity.Network.prototype._name = null;
People.RecentActivity.Network.prototype._icon = null;
People.RecentActivity.Network.prototype._disposed = false;

Object.defineProperty(People.RecentActivity.Network.prototype, "id", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the network.
        /// </summary>
        /// <value type="String"></value>
        return this._info.id;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "objectId", {
    get: function() {
        /// <summary>
        ///     Gets the account ID of the network in the platform.
        /// </summary>
        /// <value type="String"></value>
        return this._info.objectId;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "icon", {
    get: function() {
        /// <summary>
        ///     Gets the icon of the network.
        /// </summary>
        /// <value type="String"></value>
        return this._icon;
    },
    set: function(value) {
        if (value !== this._icon) {
            this._icon = value;
            this._onPropertyChanged('Icon');
        }
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "name", {
    get: function() {
        /// <summary>
        ///     Gets the name of the network.
        /// </summary>
        /// <value type="String"></value>
        return this._name;
    },
    set: function(value) {
        if (value !== this._name) {
            this._name = value;
            this._onPropertyChanged('Name');
        }
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "capabilities", {
    get: function() {
        /// <summary>
        ///     Gets the network capabilities.
        /// </summary>
        /// <value type="People.RecentActivity.NetworkCapabilities"></value>
        return this._capabilities;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "albums", {
    get: function() {
        /// <summary>
        ///     Gets the photo albums.
        /// </summary>
        /// <value type="People.RecentActivity.PhotoAlbumCollection"></value>
        if (this._albums == null) {
            this._albums = new People.RecentActivity.PhotoAlbumCollection(this._getProvider(), this);
        }

        return this._albums;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "feed", {
    get: function() {
        /// <summary>
        ///     Gets the feed.
        /// </summary>
        /// <value type="People.RecentActivity.Feed"></value>
        if (this._feed == null) {
            this._feed = new People.RecentActivity.Feed(this._getProvider(), this);
        }

        return this._feed;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "notifications", {
    get: function() {
        /// <summary>
        ///     Gets the notifications.
        /// </summary>
        /// <value type="People.RecentActivity.NotificationFeed"></value>
        // We need to make sure that there is a valid user before comparing the person ID to support the MockData.
        if (this._notifications == null && this._info.isNotificationsEnabled) {
            this._notifications = new People.RecentActivity.NotificationFeed(this);
        }

        return this._notifications;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "user", {
    get: function() {
        /// <summary>
        ///     Gets the "Me" contact for the network. This is the Contact belonging
        ///     to the signed in user.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return People.RecentActivity.ContactCache.findOrCreateContact(this._info.user);
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "isAggregatedNetwork", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the network represents the aggregated network.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isAggregatedNetwork;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "identity", {
    get: function() {
        /// <summary>
        ///     Gets the person this network belongs to.
        /// </summary>
        /// <value type="People.RecentActivity.Identity"></value>
        return this._identity;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "shareRefreshDelay", {
    get: function () {
        /// <summary>
        ///     Gets the underlying info.
        /// </summary>
        /// <value type="Number"></value>
        return this._info.shareRefreshDelay;
    }
});

Object.defineProperty(People.RecentActivity.Network.prototype, "info", {
    get: function() {
        /// <summary>
        ///     Gets the underlying info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_networkInfo"></value>
        return this._info;
    }
});

People.RecentActivity.Network.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;

        if (this._provider != null) {
            this._provider.dispose();
        }

        if (this._albums != null) {
            this._albums.dispose();
        }

        if (this._feed != null) {
            this._feed.dispose();
        }

        this._provider = null;
    }
};

People.RecentActivity.Network.prototype.getObject = function(id, type, userState) {
    /// <summary>
    ///     Gets a single object.
    /// </summary>
    /// <param name="id" type="String">The ID of the object.</param>
    /// <param name="type" type="People.RecentActivity.FeedObjectType">The type of the object.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(Jx.isNonEmptyString(id), '!string.IsNullOrEmpty(id)');

    var info = People.RecentActivity.Core.create_feedObjectInfo(id, this._info.id, type, null, null, 0, null, null, null, null);
    this._getProvider().getCachedFeedObject(info, userState);
};

People.RecentActivity.Network.prototype.onUpdated = function(networkInfo) {
    /// <param name="networkInfo" type="People.RecentActivity.Core.create_networkInfo"></param>
    Debug.assert(networkInfo != null, 'networkInfo != null');

    if (this._disposed) {
        return;
    }

    if (networkInfo.id === this._info.id) {
        if (Jx.isNonEmptyString(networkInfo.icon)) {
            this.icon = networkInfo.icon;
        }

        if (Jx.isNonEmptyString(networkInfo.name)) {
            this.name = networkInfo.name;
        }
    }
    else {
        // this is likely because we're in an aggregated scenario.
        Debug.assert(this.isAggregatedNetwork, 'this.IsAggregatedNetwork');

        var network = this._identity.networks.findById(networkInfo.id);
        if (network != null) {
            // pass along the update to the real network. we need to do this because when we're using the aggregated
            // network, it is very likely that the real network does not have its own provider, and will never receive
            // the update event otherwise.
            network.onUpdated(networkInfo);
        }    
    }
};

People.RecentActivity.Network.prototype.onRefreshFeedEntriesCompleted = function (result, entriesToAdd, entriesToUpdate, entriesToRemove, hasMoreEntries, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entriesToAdd" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="entriesToUpdate" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="entriesToRemove" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="hasMoreEntries" type="Boolean"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(entriesToAdd != null, 'entriesToAdd != null');
    Debug.assert(entriesToUpdate != null, 'entriesToUpdate != null');
    Debug.assert(entriesToRemove != null, 'entriesToRemove != null');

    if (this._disposed) {
        return;
    }

    this.feed.onRefreshFeedEntriesCompleted(result, entriesToAdd, entriesToUpdate, entriesToRemove, hasMoreEntries, userState);
};

People.RecentActivity.Network.prototype.onGetCachedFeedEntriesCompleted = function(result, entries, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(entries != null, 'entries != null');

    if (this._disposed) {
        return;
    }

    this.feed.onGetCachedFeedEntriesCompleted(result, entries, userState);
};

People.RecentActivity.Network.prototype.onRefreshCommentsCompleted = function(result, info, commentsToAdd, commentsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="commentsToAdd" type="Array" elementType="commentInfo"></param>
    /// <param name="commentsToRemove" type="Array" elementType="commentInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(commentsToAdd != null, 'commentsToAdd != null');
    Debug.assert(commentsToRemove != null, 'commentsToRemove != null');
    Debug.assert(userState != null, 'userState != null');

    if (this._disposed) {
        return;
    }

    // fetch the context and tell it we're done refreshing!
    var state = userState;

    var obj = state.context;
    obj.comments.onRefreshCompleted(result, commentsToAdd, commentsToRemove, state.userState);
};

People.RecentActivity.Network.prototype.onRefreshReactionsCompleted = function(result, info, reactionsToAdd, reactionsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="reactionsToAdd" type="Array" elementType="reactionInfo"></param>
    /// <param name="reactionsToRemove" type="Array" elementType="reactionInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(reactionsToAdd != null, 'reactionsToAdd != null');
    Debug.assert(reactionsToRemove != null, 'reactionsToRemove != null');
    Debug.assert(userState != null, 'userState != null');

    if (this._disposed) {
        return;
    }

    // fetch the context and tell it we're done refreshing!
    var state = userState;

    var obj = state.context;
    obj.reactions.onRefreshCompleted(result, reactionsToAdd, reactionsToRemove, state.userState);
};

People.RecentActivity.Network.prototype.onCommentAdded = function(result, info, comment, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="comment" type="People.RecentActivity.Core.create_commentInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(userState != null, 'userState != null');

    if (this._disposed) {
        return;
    }

    // we've added a comment, pass along the notification.
    var state = userState;

    var obj = state.context;
    obj.comments.onCommentAdded(result, comment, state.userState);
};

People.RecentActivity.Network.prototype.onReactionAdded = function(result, info, reaction, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(reaction != null, 'reaction != null');
    Debug.assert(userState != null, 'userState != null');

    if (this._disposed) {
        return;
    }

    // we've added a reaction, pass it along good sir.
    var state = userState;

    var obj = state.context;
    obj.reactions.onReactionAdded(result, reaction, state.userState);
};

People.RecentActivity.Network.prototype.onReactionRemoved = function(result, info, reaction, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="reaction" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(reaction != null, 'reaction != null');
    Debug.assert(userState != null, 'userState != null');

    if (this._disposed) {
        return;
    }

    // we've removed a reaction, boo!
    var state = userState;

    var obj = state.context;
    obj.reactions.onReactionRemoved(result, reaction, state.userState);
};

People.RecentActivity.Network.prototype.onGetCachedAlbumsCompleted = function(result, albums, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="albums" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(albums != null, 'albums != null');

    if (this._disposed) {
        return;
    }

    this.albums.onGetCachedAlbumsCompleted(result, albums, userState);
};

People.RecentActivity.Network.prototype.onRefreshAlbumsCompleted = function(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="albumsToAdd" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="albumsToUpdate" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="albumsToRemove" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(albumsToAdd != null, 'albumsToAdd != null');
    Debug.assert(albumsToUpdate != null, 'albumsToUpdate != null');
    Debug.assert(albumsToRemove != null, 'albumsToRemove != null');

    if (this._disposed) {
        return;
    }

    this.albums.onRefreshAlbumsCompleted(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState);
};

People.RecentActivity.Network.prototype.onRefreshAlbumCompleted = function(result, info, photosToAdd, photosToUpdate, photosToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="photosToAdd" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="photosToUpdate" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="photosToRemove" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'info.Type == FeedObjectInfoType.PhotoAlbum');
    Debug.assert(photosToAdd != null, 'photosToAdd != null');
    Debug.assert(photosToUpdate != null, 'photosToUpdate != null');
    Debug.assert(photosToRemove != null, 'photosToRemove != null');
    Debug.assert(userState != null, 'userState != null');

    if (this._disposed) {
        return;
    }

    // pass along the refresh and update changes.
    var state = userState;

    var album = state.context;
    album.onUpdated(info);
    album.onRefreshAlbumCompleted(result, photosToAdd, photosToUpdate, photosToRemove, state.userState);
};

People.RecentActivity.Network.prototype.onRefreshPhotoCompleted = function(result, info, tagsToAdd, tagsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="tagsToAdd" type="Array" elementType="photoTagInfo"></param>
    /// <param name="tagsToRemove" type="Array" elementType="photoTagInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');
    Debug.assert(userState != null, 'userState != null');

    if (this._disposed) {
        return;
    }

    // pass along the refresh and update changes.
    var state = userState;

    var photo = state.context;
    photo.onUpdated(info);
    photo.onRefreshPhotoCompleted(result, tagsToAdd, tagsToRemove, state.userState);

    var album = photo.album;
    if (album != null) {
        // tell the photo to re-sort itself.
        album.photos.sort(function(a, b) {
            return (a).index - (b).index;
        });
    }
};

People.RecentActivity.Network.prototype.onGetMoreEntriesCompleted = function(result, entries, hasMoreEntries, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="entries" type="Array" elementType="feedObjectInfo"></param>
    /// <param name="hasMoreEntries" type="Boolean"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(entries != null, 'entries != null');

    if (this._disposed) {
        return;
    }

    this.feed.onGetMoreEntriesCompleted(result, entries, hasMoreEntries, userState);
};

People.RecentActivity.Network.prototype.onGetCachedFeedObjectCompleted = function(result, info, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');

    if (this._disposed) {
        return;
    }

    result = this._onGetObjectCompleted(result, info, userState, false);
    if (result.code !== People.RecentActivity.Core.ResultCode.success) {
        // apparently we couldn't grab the object from cache, try live data instead.
        this._getProvider().getFeedObject(info, userState);
    }
};

People.RecentActivity.Network.prototype.onGetFeedObjectCompleted = function(result, info, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(info != null, 'info != null');

    if (this._disposed) {
        return;
    }

    this._onGetObjectCompleted(result, info, userState, true);
};

People.RecentActivity.Network.prototype.onFeedObjectAdded = function(result, info, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    if (this._disposed) {
        return;
    }

    this._feed.onAddEntryCompleted(result, info, userState);
};

People.RecentActivity.Network.prototype.onRefreshNotificationsCompleted = function(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="notificationsToAdd" type="Array" elementType="notificationInfo"></param>
    /// <param name="notificationsToUpdate" type="Array" elementType="notificationInfo"></param>
    /// <param name="notificationsToRemove" type="Array" elementType="notificationInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(notificationsToAdd != null, 'notificationsToAdd != null');
    Debug.assert(notificationsToUpdate != null, 'notificationsToUpdate != null');
    Debug.assert(notificationsToRemove != null, 'notificationsToRemove != null');

    if (this._disposed) {
        return;
    }

    this._notifications.onRefreshNotificationsCompleted(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState);
};

People.RecentActivity.Network.prototype.onGetCachedNotificationsCompleted = function(result, notifications, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(notifications != null, 'notifications != null');

    if (this._disposed) {
        return;
    }

    this._notifications.onGetCachedNotificationsCompleted(result, notifications, userState);
};

People.RecentActivity.Network.prototype.onMarkNotificationsReadCompleted = function(result, notifications, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    /// <param name="userState" type="Object"></param>
    Debug.assert(notifications != null, 'notifications != null');

    if (this._disposed) {
        return;
    }

    this._notifications.onMarkNotificationsReadCompleted(result, notifications, userState);
};

People.RecentActivity.Network.prototype.onGetUnreadNotificationsCountCompleted = function(result, unreadCount, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="unreadCount" type="Number" integer="true"></param>
    /// <param name="userState" type="Object"></param>
    if (this._disposed) {
        return;
    }

    this._notifications.onGetUnreadNotificationsCountCompleted(result, unreadCount, userState);
};

People.RecentActivity.Network.prototype.ensureProvider = function() {
    /// <summary>
    ///     Ensures that a new provider has been initialized.
    /// </summary>
    if (this._provider == null) {
        // initialize a new provider, and then get the initial batch of entries.
        this._provider = People.RecentActivity.Providers.FeedProviderFactory.instance.createFeedProvider(this._identity.id, this._identity.type, this._info, this);
    }
};

People.RecentActivity.Network.prototype.refreshNotifications = function(userState) {
    /// <summary>
    ///     Refreshes the notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider().refreshNotifications(userState);
};

People.RecentActivity.Network.prototype.getCachedNotifications = function(userState) {
    /// <summary>
    ///     Gets the cached notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider().getCachedNotifications(userState);
};

People.RecentActivity.Network.prototype.markNotificationsRead = function(notifications, userState) {
    /// <summary>
    ///     Marks the notifications as read.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to update.</param>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider().markNotificationsRead(notifications, userState);
};

People.RecentActivity.Network.prototype.getUnreadNotificationsCount = function(userState) {
    /// <summary>
    ///     Gets the count of unread notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._getProvider().getUnreadNotificationsCount(userState);
};

People.RecentActivity.Network.prototype._getProvider = function() {
    /// <returns type="People.RecentActivity.Core.IFeedProvider"></returns>
    this.ensureProvider();
    return this._provider;
};

People.RecentActivity.Network.prototype._onGetObjectCompleted = function(result, info, userState, raiseEventOnFailure) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <param name="userState" type="Object"></param>
    /// <param name="raiseEventOnFailure" type="Boolean"></param>
    /// <returns type="People.RecentActivity.Core.ResultInfo"></returns>
    Debug.assert(info != null, 'info != null');

    var obj = null;

    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        switch (info.type) {
            case People.RecentActivity.Core.FeedObjectInfoType.entry:
                obj = this.feed.entries.findOrCreateEntryByInfo(info);
                break;
            case People.RecentActivity.Core.FeedObjectInfoType.photo:
                obj = this.albums.findOrCreatePhotoByInfo(info);
                break;
            case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
                obj = this.albums.findOrCreateAlbumByInfo(info);
                break;
        }

        if (obj == null) {
            // apparently we retrieved the object, but we don't understand what it is.
            Debug.assert(false, 'Unknown object type: ' + info.type);
            result.code = People.RecentActivity.Core.ResultCode.failure;
        }    
    }

    if ((result.code === People.RecentActivity.Core.ResultCode.success) || raiseEventOnFailure) {
        this.raiseEvent("getobjectcompleted", new People.RecentActivity.FeedObjectActionCompletedEventArgs(this, result, obj, userState));
    }

    return result;
};

People.RecentActivity.Network.prototype._onPropertyChanged = function(propertyName) {
    /// <param name="propertyName" type="String"></param>
    Debug.assert(Jx.isNonEmptyString(propertyName), '!string.IsNullOrEmpty(propertyName)');

    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="NetworkReaction.js" />

People.RecentActivity.NetworkCapabilities = function(info) {
    /// <summary>
    ///     Represents the capabilities of a single network.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_networkInfo">The network info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_networkInfo">The network info.</field>
    /// <field name="_reactions" type="Array" elementType="NetworkReaction">The reactions types.</field>
    /// <field name="_reactionMap" type="Object">The map of reaction types.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
    this._reactions = new Array(info.reactions.length);
    this._reactionMap = {};
    for (var i = 0, len = info.reactions.length; i < len; i++) {
        var reaction = new People.RecentActivity.NetworkReaction(info.reactions[i]);
        this._reactions[i] = reaction;
        this._reactionMap[reaction.id] = reaction;
    }

};


People.RecentActivity.NetworkCapabilities.prototype._info = null;
People.RecentActivity.NetworkCapabilities.prototype._reactions = null;
People.RecentActivity.NetworkCapabilities.prototype._reactionMap = null;

Object.defineProperty(People.RecentActivity.NetworkCapabilities.prototype, "commentsEnabled", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether comments are enabled on this network.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isCommentingEnabled;
    }
});

Object.defineProperty(People.RecentActivity.NetworkCapabilities.prototype, "reactions", {
    get: function() {
        /// <summary>
        ///     Gets a list of reaction types for this network.
        /// </summary>
        /// <value type="Array" elementType="NetworkReaction"></value>
        return this._reactions;
    }
});

People.RecentActivity.NetworkCapabilities.prototype.findReactionType = function(info) {
    /// <summary>
    ///     Finds a reaction by ID.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_networkReactionInfo">The reaction info.</param>
    /// <returns type="People.RecentActivity.NetworkReaction"></returns>
    Debug.assert(info != null, 'info != null');
    if (!Jx.isUndefined(this._reactionMap[info.id])) {
        return this._reactionMap[info.id];
    }

    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Collection.js" />
/// <reference path="Configuration.js" />
/// <reference path="Identity.js" />
/// <reference path="Network.js" />

People.RecentActivity.NetworkCollection = function(identity) {
    /// <summary>
    ///     Provides a collection of <see cref="T:People.RecentActivity.Network" /> instances.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
    /// <field name="_identity$1" type="People.RecentActivity.Identity">The identity.</field>
    /// <field name="_map$1" type="Object">A map of networks.</field>
    /// <field name="_aggregatedNetwork$1" type="People.RecentActivity.Network">The aggregated network.</field>
    People.RecentActivity.Collection.call(this);
    Debug.assert(identity != null, 'identity != null');
    this._identity$1 = identity;
    this._map$1 = {};
};

Jx.inherit(People.RecentActivity.NetworkCollection, People.RecentActivity.Collection);


People.RecentActivity.NetworkCollection.prototype._identity$1 = null;
People.RecentActivity.NetworkCollection.prototype._map$1 = null;
People.RecentActivity.NetworkCollection.prototype._aggregatedNetwork$1 = null;

Object.defineProperty(People.RecentActivity.NetworkCollection.prototype, "aggregatedNetwork", {
    get: function() {
        /// <summary>
        ///     Gets the aggregated network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._aggregatedNetwork$1;
    }
});

People.RecentActivity.NetworkCollection.prototype.findById = function(id) {
    /// <summary>
    ///     Attempts to find a network by ID.
    /// </summary>
    /// <param name="id" type="String">The ID of the network.</param>
    /// <returns type="People.RecentActivity.Network"></returns>
    if (!Jx.isUndefined(this._map$1[id])) {
        return this._map$1[id];
    }

    return null;
};

People.RecentActivity.NetworkCollection.prototype.addByInfo = function(info) {
    /// <summary>
    ///     Adds a network by info.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_networkInfo">The network info.</param>
    Debug.assert(info != null, 'info != null');
    var network = new People.RecentActivity.Network(this._identity$1, info);
    if (info.id === People.RecentActivity.Configuration.aggregatedNetworkId) {
        // we found the aggregated network, yay.
        this._aggregatedNetwork$1 = network;
    }

    this._map$1[info.id] = network;
    this.addInternal(network);
};

People.RecentActivity.NetworkCollection.prototype.addRangeByInfo = function(info) {
    /// <summary>
    ///     Adds a range of networks.
    /// </summary>
    /// <param name="info" type="Array" elementType="networkInfo">The info.</param>
    Debug.assert(info != null, 'info != null');
    if (info.length > 0) {
        var networks = new Array(info.length);
        // build a list of network intances.
        for (var i = 0, len = info.length; i < len; i++) {
            var network = new People.RecentActivity.Network(this._identity$1, info[i]);
            if (info[i].id === People.RecentActivity.Configuration.aggregatedNetworkId) {
                // we found the aggregated network.
                this._aggregatedNetwork$1 = network;
            }

            this._map$1[network.id] = network;
            networks[i] = network;
        }

        this.addRangeInternal(networks);
    }
};

People.RecentActivity.NetworkCollection.prototype.insertByInfo = function(index, info) {
    /// <summary>
    ///     Inserts a network by info.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index of the new item.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_networkInfo">The network info.</param>
    Debug.assert(info != null, 'info != null');
    var network = new People.RecentActivity.Network(this._identity$1, info);
    if (info.id === People.RecentActivity.Configuration.aggregatedNetworkId) {
        // we found the aggregated network, yay.
        this._aggregatedNetwork$1 = network;
    }

    this._map$1[info.id] = network;
    this.insertInternal(index, network);
};

People.RecentActivity.NetworkCollection.prototype.updateByInfo = function(info) {
    /// <summary>
    ///     Adds and removes elements to match the most up-to-date list.
    /// </summary>
    /// <param name="info" type="Array" elementType="networkInfo">The current list of networks.</param>
    var added = [];
    var removed = [];
    var infoMap = {};
    var networksChanged = false;
    // Create a map of the incoming networks.
    for (var n = 0; n < info.length; n++) {
        var networkInfo = info[n];
        infoMap[networkInfo.id] = networkInfo;
    }

    // Find the removed networks, dispose them, and add them to the list.
    for (var n = 0, coll = this.items; n < coll.length; n++) {
        var network = coll[n];
        if (!!Jx.isUndefined(infoMap[network.id])) {
            delete this._map$1[network.id];
            if (network.id === People.RecentActivity.Configuration.aggregatedNetworkId) {
                this._aggregatedNetwork$1 = null;
            }

            network.dispose();
            removed.push(network);
            networksChanged = true;
        }    
    }

    // Remove the networks.
    this.removeRangeInternal(removed);
    // For each new network, insert it into the correct position.
    for (var i = 0; i < info.length; i++) {
        var found = this.findById(info[i].id);
        if (found == null) {
            this.insertByInfo(i, info[i]);
            networksChanged = true;
        }    
    }

    // If we added or removed any networks, the aggregated network needs to be recreated and appended to the list.
    if (networksChanged && !Jx.isUndefined(infoMap[People.RecentActivity.Configuration.aggregatedNetworkId])) {
        // Remove current all network.
        var allNetwork = this.findById(People.RecentActivity.Configuration.aggregatedNetworkId);
        allNetwork.dispose();
        this.removeInternal(allNetwork);
        // Create a new one at the end of the list.
        this.addByInfo(infoMap[People.RecentActivity.Configuration.aggregatedNetworkId]);
    }
};

People.RecentActivity.NetworkCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets a network by index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index of the network.</param>
    /// <param name="value" type="People.RecentActivity.Network"></param>
    /// <returns type="People.RecentActivity.Network"></returns>
    Debug.assert((index >= 0) && (index < this.count), '(index >= 0) && (index < this.Count)');
    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Network.js" />
/// <reference path="NetworkReactionType.js" />

People.RecentActivity.NetworkReaction = function(info) {
    /// <summary>
    ///     Represents a single reaction type for a <see cref="T:People.RecentActivity.Network" />.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_networkReactionInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_networkReactionInfo">The info.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
};


People.RecentActivity.NetworkReaction.prototype._info = null;

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "id", {
    get: function() {
        /// <summary>
        ///     Gets the identifier for this network reaction.
        /// </summary>
        /// <value type="String"></value>
        return this._info.id;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "iconFeed", {
    get: function() {
        /// <summary>
        ///     Gets the URL of the icon for dark backgrounds when it is active.
        /// </summary>
        /// <value type="String"></value>
        return this._info.iconFeed;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "iconSelfPage", {
    get: function() {
        /// <summary>
        ///     Gets the URL of the icon for light backgrounds when it is active.
        /// </summary>
        /// <value type="String"></value>
        return this._info.iconSelfPage;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "iconClass", {
    get: function() {
        /// <summary>
        ///     Gets the CSS class that can be applied to tweak the UX for each reaction type.
        /// </summary>
        /// <value type="String"></value>
        return this._info.iconClass;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "isCountShown", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the count should be shown.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isCountShown;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "isToggle", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the reaction is a toggle.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isToggle;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "stringId", {
    get: function() {
        /// <summary>
        ///     Gets the string ID associated with the reaction.
        /// </summary>
        /// <value type="String"></value>
        return this._info.stringId;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "type", {
    get: function() {
        /// <summary>
        ///     Gets the type of the reaction.
        /// </summary>
        /// <value type="People.RecentActivity.NetworkReactionType"></value>
        return this._info.type;
    }
});

Object.defineProperty(People.RecentActivity.NetworkReaction.prototype, "info", {
    get: function() {
        /// <summary>
        ///     Gets the underlying info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_networkReactionInfo"></value>
        return this._info;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />
/// <reference path="NotificationType.js" />

People.RecentActivity.NotificationEntry = function(info) {
    /// <summary>
    ///     Represents a single notification.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_notificationInfo">The notification info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_notificationInfo">The notification info.</field>
    /// <field name="_publisher" type="People.RecentActivity.Contact">The publisher contact.</field>
    /// <field name="_timestamp" type="Date">The timestamp.</field>
    /// <field name="_isUnread" type="Boolean">Whether the notification should appear to be unread.</field>
    /// <field name="_isUnreadInUI" type="Boolean">Whether the notification is unread in the UI.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
    this._publisher = People.RecentActivity.ContactCache.findOrCreateContact(info.publisher);
    this._timestamp = new Date(info.timestamp);
    this._isUnread = info.isUnread;
    this._isUnreadInUI = info.isUnread;
};

Jx.mix(People.RecentActivity.NotificationEntry.prototype, Jx.Events);
Jx.mix(People.RecentActivity.NotificationEntry.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.NotificationEntry.prototype, "propertychanged");

People.RecentActivity.NotificationEntry.prototype._info = null;
People.RecentActivity.NotificationEntry.prototype._publisher = null;
People.RecentActivity.NotificationEntry.prototype._timestamp = null;
People.RecentActivity.NotificationEntry.prototype._isUnread = false;
People.RecentActivity.NotificationEntry.prototype._isUnreadInUI = false;

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "id", {
    get: function() {
        /// <summary>
        ///     Gets the ID of the notification.
        /// </summary>
        /// <value type="String"></value>
        return this._info.id;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher of the notification.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return this._publisher;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "timestamp", {
    get: function() {
        /// <summary>
        ///     Gets the timestamp of the notification.
        /// </summary>
        /// <value type="Date"></value>
        return this._timestamp;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "message", {
    get: function() {
        /// <summary>
        ///     Gets the message of the notification.
        /// </summary>
        /// <value type="String"></value>
        return this._info.message;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "objectId", {
    get: function() {
        /// <summary>
        ///     Gets the object ID to which the notification refers.
        /// </summary>
        /// <value type="String"></value>
        return this._info.objectId;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "objectType", {
    get: function() {
        /// <summary>
        ///     Gets the type of the object to which the notification refers.
        /// </summary>
        /// <value type="People.RecentActivity.NotificationType"></value>
        return this._info.objectType;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "link", {
    get: function() {
        /// <summary>
        ///     Gets the link to the notification source.
        /// </summary>
        /// <value type="String"></value>
        return this._info.link;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "via", {
    get: function() {
        /// <summary>
        ///     Gets the name of the network the notification was retrieved from.
        /// </summary>
        /// <value type="String"></value>
        return this._info.via;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "sourceId", {
    get: function() {
        /// <summary>
        ///     Gets the source ID of the network the notification was retrieved from.
        /// </summary>
        /// <value type="String"></value>
        return this._info.sourceId;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "isReply", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is a notification for a reply to a post.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isReply;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "isShare", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is a notification for a shared post.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info.isShare;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "isUnread", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the notification is currently unread.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isUnread;
    },
    set: function(value) {
        if (value !== this._isUnread) {
            this._isUnread = value;
            if (value) {
                // also mark it as unread in the UI.
                this.isUnreadInUI = true;
            }

            this._onPropertyChanged('IsUnread');
        }

    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "isUnreadInUI", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether the notification has been marked as unread in the UI.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isUnreadInUI;
    },
    set: function(value) {
        if (value !== this._isUnreadInUI) {
            this._isUnreadInUI = value;
            this._onPropertyChanged('IsUnreadInUI');
        }

    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "info", {
    get: function() {
        /// <summary>
        ///     Gets the underlying info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_notificationInfo"></value>
        return this._info;
    }
});

Object.defineProperty(People.RecentActivity.NotificationEntry.prototype, "sortOrder", {
    get: function() {
        /// <value type="Number" integer="true"></value>
        return this._timestamp.getTime();
    }
});

People.RecentActivity.NotificationEntry.prototype.onRefreshed = function(info) {
    /// <summary>
    ///     Occurs when the entry has been updated.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_notificationInfo">The updated info.</param>
    Debug.assert(info != null, 'info != null');
    this._info.isUnread = info.isUnread;
    this.isUnread = info.isUnread;
};

People.RecentActivity.NotificationEntry.prototype._onPropertyChanged = function(propertyName) {
    /// <summary>
    ///     Invokes the <see cref="E:People.RecentActivity.NotificationEntry.PropertyChanged" /> event.
    /// </summary>
    /// <param name="propertyName" type="String">The name of the property.</param>
    Debug.assert(Jx.isNonEmptyString(propertyName), '!string.IsNullOrEmpty(propertyName)');
    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Collection.js" />
/// <reference path="Helpers\CollectionHelper.js" />
/// <reference path="Network.js" />
/// <reference path="NotificationEntry.js" />

People.RecentActivity.NotificationCollection = function(network) {
    /// <summary>
    ///     Represents a collection of <see cref="T:People.RecentActivity.NotificationEntry" /> instances.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The current network.</param>
    /// <field name="_map$1" type="Object">The ID &lt;--&gt; NotificationEntry mapping.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_unreadCount$1" type="Number" integer="true">The number of unread notifications.</field>
    /// <field name="_unreadUICount$1" type="Number" integer="true">The number of unread notifications in the UI.</field>
    People.RecentActivity.Collection.call(this);
    Debug.assert(network != null, 'network != null');
    this._map$1 = {};
    this._network$1 = network;
};

Jx.inherit(People.RecentActivity.NotificationCollection, People.RecentActivity.Collection);


People.RecentActivity.NotificationCollection.prototype._map$1 = null;
People.RecentActivity.NotificationCollection.prototype._network$1 = null;
People.RecentActivity.NotificationCollection.prototype._unreadCount$1 = 0;
People.RecentActivity.NotificationCollection.prototype._unreadUICount$1 = 0;

Object.defineProperty(People.RecentActivity.NotificationCollection.prototype, "unreadCount", {
    get: function() {
        /// <summary>
        ///     Gets the number of unread notifications.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._unreadCount$1;
    },
    set: function(value) {
        if (value !== this._unreadCount$1) {
            this._unreadCount$1 = value;
            this.onPropertyChanged('UnreadCount');
        }

    }
});

Object.defineProperty(People.RecentActivity.NotificationCollection.prototype, "unreadUICount", {
    get: function() {
        /// <summary>
        ///     Gets the number of unread notifications in the UI.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._unreadUICount$1;
    },
    set: function(value) {
        if (value !== this._unreadUICount$1) {
            this._unreadUICount$1 = value;
            this.onPropertyChanged('UnreadUICount');
        }

    }
});

People.RecentActivity.NotificationCollection.prototype.findNotification = function(info) {
    /// <summary>
    ///     Finds a notification.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_notificationInfo">The notification info.</param>
    /// <returns type="People.RecentActivity.NotificationEntry"></returns>
    Debug.assert(info != null, 'info != null');
    return this.findNotificationById(info.id);
};

People.RecentActivity.NotificationCollection.prototype.findNotificationById = function(id) {
    /// <summary>
    ///     Finds a notification by ID.
    /// </summary>
    /// <param name="id" type="String">The ID of the notification.</param>
    /// <returns type="People.RecentActivity.NotificationEntry"></returns>
    Debug.assert(Jx.isNonEmptyString(id), '!string.IsNullOrEmpty(id)');
    if (!Jx.isUndefined(this._map$1[id])) {
        return this._map$1[id];
    }

    return null;
};

People.RecentActivity.NotificationCollection.prototype.markAllNotificationsRead = function(userState) {
    /// <summary>
    ///     Mark all unread notifications as read.
    /// </summary>
    /// <param name="userState" type="Object"></param>
    var notificationsInfo = [];
    for (var n = 0, coll = this.items; n < coll.length; n++) {
        var notification = coll[n];
        var notificationInfo = notification.info;
        if (notificationInfo.isUnread) {
            notificationsInfo.push(notificationInfo);
        }    
    }

    if (notificationsInfo.length > 0) {
        this._network$1.markNotificationsRead(notificationsInfo, userState);
    }
};

People.RecentActivity.NotificationCollection.prototype.markAllNotificationsReadInUI = function() {
    /// <summary>
    ///     Marks all notifications as read in the UI.
    /// </summary>
    for (var n = 0, coll = this.items; n < coll.length; n++) {
        var notification = coll[n];
        notification.isUnreadInUI = false;
    }

    this._updateUnreadCount$1();
};

People.RecentActivity.NotificationCollection.prototype.onNotificationsAdded = function(notifications) {
    /// <summary>
    ///     Occurs when notifications were added.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The new notifications.</param>
    Debug.assert(notifications != null, 'notifications != null');
    Debug.assert(notifications.length > 0, 'notifications.Length > 0');
    this._addRangeByInfo$1(notifications);
    this._updateUnreadCount$1();
};

People.RecentActivity.NotificationCollection.prototype.onRefreshNotificationsCompleted = function(notificationsToAdd, notificationsToUpdate, notificationsToRemove) {
    /// <summary>
    ///     Occurs when the notification refresh has completed.
    /// </summary>
    /// <param name="notificationsToAdd" type="Array" elementType="notificationInfo">The entries to add.</param>
    /// <param name="notificationsToUpdate" type="Array" elementType="notificationInfo">The entries to update.</param>
    /// <param name="notificationsToRemove" type="Array" elementType="notificationInfo">The entries to remove.</param>
    Debug.assert(notificationsToAdd != null, 'notificationsToAdd != null');
    Debug.assert(notificationsToUpdate != null, 'notificationsToUpdate != null');
    Debug.assert(notificationsToRemove != null, 'notificationsToRemove != null');
    if (notificationsToAdd.length > 0) {
        this._addRangeByInfo$1(notificationsToAdd);
    }

    if (notificationsToUpdate.length > 0) {
        this._updateRangeByInfo$1(notificationsToUpdate);
    }

    if (notificationsToRemove.length > 0) {
        this._removeRangeByInfo$1(notificationsToRemove);
    }

    // if the unread count changed, raise the event only once.
    this._updateUnreadCount$1();
};

People.RecentActivity.NotificationCollection.prototype.onNotificationsMarkedAsRead = function(notifications) {
    /// <summary>
    ///     Occurs when notifications were marked as read.
    /// </summary>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The notifications to update.</param>
    Debug.assert(notifications != null, 'notifications != null');
    Debug.assert(notifications.length > 0, 'notifications.Length > 0');
    for (var i = 0, len = notifications.length; i < len; i++) {
        var notificationInfo = notifications[i];
        var notification = this.findNotification(notificationInfo);
        if (notification != null) {
            if (notification.info.isUnread) {
                this._unreadCount$1--;
            }

            notification.onRefreshed(notificationInfo);
        }    
    }

    this._updateUnreadCount$1();
};

People.RecentActivity.NotificationCollection.prototype._updateUnreadCount$1 = function() {
    // even though we have to loop through all the items here, this won't actually be
    // executed that much, and on top of that it simplifies the logic around keeping track of the count
    // in this class significantly.
    var unreadCount = 0;
    var unreadCountUI = 0;
    for (var n = 0, coll = this.items; n < coll.length; n++) {
        var entry = coll[n];
        if (entry.isUnread) {
            unreadCount++;
        }

        if (entry.isUnreadInUI) {
            unreadCountUI++;
        }    
    }

    this.unreadCount = unreadCount;
    this.unreadUICount = unreadCountUI;
};

People.RecentActivity.NotificationCollection.prototype._addRangeByInfo$1 = function(info) {
    /// <param name="info" type="Array" elementType="notificationInfo"></param>
    Debug.assert(info != null, 'info != null');
    if (info.length > 0) {
        var notifications = [];
        for (var i = 0, len = info.length; i < len; i++) {
            // initialize a new instance of the notification, and add it to the map.
            var notificationInfo = info[i];
            if (!!Jx.isUndefined(this._map$1[notificationInfo.id])) {
                var notification = new People.RecentActivity.NotificationEntry(notificationInfo);
                this._map$1[notificationInfo.id] = notification;
                notifications.push(notification);
            }        
        }

        if (notifications.length > 0) {
            // after we've gotten all the notifications, sort-insert the items.
            People.RecentActivity.CollectionHelper.addSortableItems(this, notifications, true);
        }    
    }
};

People.RecentActivity.NotificationCollection.prototype._updateRangeByInfo$1 = function(notifications) {
    /// <param name="notifications" type="Array" elementType="notificationInfo"></param>
    Debug.assert(notifications != null, 'notifications != null');
    Debug.assert(notifications.length > 0, 'notifications.Length > 0');
    var notificationsToAdd = [];
    for (var i = 0, len = notifications.length; i < len; i++) {
        var notificationInfo = notifications[i];
        var notification = this.findNotification(notificationInfo);
        if (notification != null) {
            if (notificationInfo.timestamp === notification.timestamp.getTime()) {
                notification.onRefreshed(notificationInfo);
            }
            else {
                this._removeByInfo$1(notification.info);
                var notificationToAdd = new People.RecentActivity.NotificationEntry(notificationInfo);
                this._map$1[notificationInfo.id] = notificationToAdd;
                notificationsToAdd.push(notificationToAdd);
            }        
        }    
    }

    if (notificationsToAdd.length > 0) {
        // after we've gotten all the notifications, sort-insert the items.
        People.RecentActivity.CollectionHelper.addSortableItems(this, notificationsToAdd, true);
    }
};

People.RecentActivity.NotificationCollection.prototype._removeByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_notificationInfo"></param>
    Debug.assert(info != null, 'info != null');
    if (!Jx.isUndefined(this._map$1[info.id])) {
        var notification = this._map$1[info.id];
        delete this._map$1[info.id];
        this.removeInternal(notification);
    }
};

People.RecentActivity.NotificationCollection.prototype._removeRangeByInfo$1 = function(info) {
    /// <param name="info" type="Array" elementType="notificationInfo"></param>
    Debug.assert(info != null, 'info != null');
    for (var i = 0, len = info.length; i < len; i++) {
        this._removeByInfo$1(info[i]);
    }
};

People.RecentActivity.NotificationCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets the <see cref="T:People.RecentActivity.NotificationEntry" /> at the given index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <param name="value" type="People.RecentActivity.NotificationEntry"></param>
    /// <returns type="People.RecentActivity.NotificationEntry"></returns>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(index < this.count, 'index < this.Count');
    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ETW\EtwEventName.js" />
/// <reference path="..\Core\ETW\EtwHelper.js" />
/// <reference path="..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="Events\ActionCompletedEventArgs.js" />
/// <reference path="Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="Network.js" />
/// <reference path="NotificationCollection.js" />

People.RecentActivity.NotificationFeed = function(network) {
    /// <summary>
    ///     Represents the notifications for a single network.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <field name="_refreshUnreadCountTimeout" type="Number" integer="true" static="true">Represents the number of milliseconds between refreshes (5 minutes).</field>
    /// <field name="_network" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_notifications" type="People.RecentActivity.NotificationCollection">The notification collection.</field>
    /// <field name="_initializeStarted" type="Boolean">Whether the object been initialized.</field>
    /// <field name="_initializeCompleted" type="Boolean">Whether initialization has been completed.</field>
    /// <field name="_initializeFromHydration" type="Boolean">Whether we're initializing from hydration.</field>
    /// <field name="_initializationResult" type="People.RecentActivity.Core.ResultInfo">The result of the initialization.</field>
    /// <field name="_unreadCount" type="Number" integer="true">The current count of unread notifications.</field>
    /// <field name="_refreshEnabled" type="Boolean">Whether auto refresh is enabled.</field>
    Debug.assert(network != null, 'network != null');
    this._network = network;
    this._notifications = new People.RecentActivity.NotificationCollection(network);
};

Jx.mix(People.RecentActivity.NotificationFeed.prototype, Jx.Events);
Jx.mix(People.RecentActivity.NotificationFeed.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.NotificationFeed.prototype, "refreshcompleted", "initializecompleted", "markallnotificationsreadcompleted", "propertychanged");

People.RecentActivity.NotificationFeed._refreshUnreadCountTimeout = 300000;
People.RecentActivity.NotificationFeed.prototype._network = null;
People.RecentActivity.NotificationFeed.prototype._notifications = null;
People.RecentActivity.NotificationFeed.prototype._initializeStarted = false;
People.RecentActivity.NotificationFeed.prototype._initializeCompleted = false;
People.RecentActivity.NotificationFeed.prototype._initializeFromHydration = false;
People.RecentActivity.NotificationFeed.prototype._initializationResult = null;
People.RecentActivity.NotificationFeed.prototype._unreadCount = 0;
People.RecentActivity.NotificationFeed.prototype._refreshEnabled = true;

Object.defineProperty(People.RecentActivity.NotificationFeed.prototype, "notifications", {
    get: function() {
        /// <summary>
        ///     Gets the list of notifications.
        /// </summary>
        /// <value type="People.RecentActivity.NotificationCollection"></value>
        return this._notifications;
    }
});

Object.defineProperty(People.RecentActivity.NotificationFeed.prototype, "initialized", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether <see cref="M:People.RecentActivity.NotificationFeed.Initialize(System.Object)" /> has been called.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._initializeCompleted;
    }
});

Object.defineProperty(People.RecentActivity.NotificationFeed.prototype, "unreadCount", {
    get: function() {
        /// <summary>
        ///     Gets the number of unread notifications for the network.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._unreadCount;
    },
    set: function(value) {
        if (this._unreadCount !== value) {
            this._unreadCount = value;
            this._onPropertyChanged('UnreadCount');
        }

    }
});

People.RecentActivity.NotificationFeed.prototype.initializeFromHydration = function(userState) {
    /// <summary>
    ///     Initializes from hydration.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this._initializeStarted) {
        this._initializeStarted = true;
        this._initializeFromHydration = true;
        this._network.getCachedNotifications(userState);
    }
    else if (this._initializeCompleted) {
        this._onInitializeCompleted(this._initializationResult, userState);
    }
};

People.RecentActivity.NotificationFeed.prototype.initialize = function(userState) {
    /// <summary>
    ///     Initializes the notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this._initializeStarted) {
        this._initializeStarted = true;
        this._network.refreshNotifications(userState);
    }
    else if (this._initializeCompleted) {
        this._onInitializeCompleted(this._initializationResult, userState);
    }
};

People.RecentActivity.NotificationFeed.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the object.
    /// </summary>
};

People.RecentActivity.NotificationFeed.prototype.refresh = function(userState) {
    /// <summary>
    ///     Refreshes the notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(this._initializeCompleted, 'this.initializeCompleted');
    this._network.refreshNotifications(userState);
};

People.RecentActivity.NotificationFeed.prototype.markAllNotificationsRead = function(userState) {
    /// <summary>
    ///     Marks all unread notifications as read.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (this._notifications.unreadCount > 0) {
        this._notifications.markAllNotificationsRead(userState);
    }
    else {
        this.unreadCount = 0;
        this._onMarkAllNotificationsReadCompleted(new People.RecentActivity.Core.ResultInfo(People.RecentActivity.Core.ResultCode.success), userState);
    }
};

People.RecentActivity.NotificationFeed.prototype.markAllNotificationsReadInUI = function() {
    /// <summary>
    ///     Marks all notifications as being "read" in the UI. This is a synchronous operation.
    /// </summary>
    this._notifications.markAllNotificationsReadInUI();
};

People.RecentActivity.NotificationFeed.prototype.refreshUnreadCount = function(userState) {
    /// <summary>
    ///     Refresh the count of unread notifications.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.uiGetUnreadNotificationsCountStart, this._network.id, this._network.identity.id);
    this._network.getUnreadNotificationsCount(userState);
};

People.RecentActivity.NotificationFeed.prototype.onRefreshNotificationsCompleted = function(result, notificationsToAdd, notificationsToUpdate, notificationsToRemove, userState) {
    /// <summary>
    ///     Called when the refresh operation completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notificationsToAdd" type="Array" elementType="notificationInfo">The entries to add.</param>
    /// <param name="notificationsToUpdate" type="Array" elementType="notificationInfo">The entries to update.</param>
    /// <param name="notificationsToRemove" type="Array" elementType="notificationInfo">The entries to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(notificationsToAdd != null, 'notificationsToAdd != null');
    Debug.assert(notificationsToUpdate != null, 'notificationsToUpdate != null');
    Debug.assert(notificationsToRemove != null, 'notificationsToRemove != null');
    var updated = false;
    if (result.isSuccessOrPartialFailure) {
        updated = (notificationsToAdd.length > 0) || (notificationsToRemove.length > 0);
        this._notifications.onRefreshNotificationsCompleted(notificationsToAdd, notificationsToUpdate, notificationsToRemove);
    }

    if (!this._initializeCompleted) {
        this._initializationResult = result;
        this._onInitializeCompleted(this._initializationResult, userState);
    }
    else {
        this.raiseEvent("refreshcompleted", new People.RecentActivity.RefreshActionCompletedEventArgs(this, result, updated, userState));
    }
};

People.RecentActivity.NotificationFeed.prototype.onGetCachedNotificationsCompleted = function(result, notifications, userState) {
    /// <summary>
    ///     Called when the cached notifications were retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The cached entries.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(notifications != null, 'notifications != null');
    
    if ((result.code === People.RecentActivity.Core.ResultCode.success) && (notifications.length > 0)) {
        this._notifications.onNotificationsAdded(notifications);
    }

    if (this._initializeFromHydration) {
        this._initializationResult = result;
        this._onInitializeCompleted(this._initializationResult, userState);
    }
};

People.RecentActivity.NotificationFeed.prototype.onMarkNotificationsReadCompleted = function(result, notifications, userState) {
    /// <summary>
    ///     Called when the notifications have been marked as read.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="notifications" type="Array" elementType="notificationInfo">The updated notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        this._notifications.onNotificationsMarkedAsRead(notifications);
        // We can assume that we know the count to be zero.
        this.unreadCount = 0;
    }

    this._onMarkAllNotificationsReadCompleted(result, userState);
};

People.RecentActivity.NotificationFeed.prototype.onGetUnreadNotificationsCountCompleted = function(result, unreadCount, userState) {
    /// <summary>
    ///     Called when the notifications unread count has been retrieved.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="unreadCount" type="Number" integer="true">The number of unread notifications.</param>
    /// <param name="userState" type="Object">The user state.</param>
    // We will update regardless of result since a failed call will return a count of zero.
    this.unreadCount = unreadCount;
    People.RecentActivity.Core.EtwHelper.writeFeedEvent(People.RecentActivity.Core.EtwEventName.uiGetUnreadNotificationsCountEnd, this._network.id, this._network.identity.id);
};

People.RecentActivity.NotificationFeed.prototype._onInitializeCompleted = function(result, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="userState" type="Object"></param>
    this._initializeCompleted = true;
    this.raiseEvent("initializecompleted", new People.RecentActivity.ActionCompletedEventArgs(this, result, userState));
};

People.RecentActivity.NotificationFeed.prototype._onPropertyChanged = function(propertyName) {
    /// <param name="propertyName" type="String"></param>
    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};

People.RecentActivity.NotificationFeed.prototype._onMarkAllNotificationsReadCompleted = function(result, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="userState" type="Object"></param>
    this.raiseEvent("markallnotificationsreadcompleted", new People.RecentActivity.ActionCompletedEventArgs(this, result, userState));
};

People.RecentActivity.NotificationFeed.prototype._onAutoRefreshUnreadCountTimerElapsed = function() {
    Debug.assert(this._refreshEnabled, 'this.refreshEnabled');
    this.refreshUnreadCount();
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="ActionState.js" />
/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />
/// <reference path="Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="FeedObject.js" />
/// <reference path="Helpers\EntityHelper.js" />
/// <reference path="Network.js" />
/// <reference path="PhotoAlbum.js" />
/// <reference path="PhotoTagCollection.js" />

People.RecentActivity.Photo = function(provider, network, album, info) {
    /// <summary>
    ///     Represents a single photo.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="album" type="People.RecentActivity.PhotoAlbum">The album.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <field name="_album$1" type="People.RecentActivity.PhotoAlbum">The parent album.</field>
    /// <field name="_info$1" type="People.RecentActivity.Core.create_photoInfo">The photo info.</field>
    /// <field name="_entities$1" type="Array" elementType="Entity">The entities.</field>
    /// <field name="_tags$1" type="People.RecentActivity.PhotoTagCollection">The tags.</field>
    /// <field name="_caption$1" type="String">The caption.</field>
    /// <field name="_index$1" type="Number" integer="true">The index.</field>
    /// <field name="_isLocked$1" type="Boolean">Whether the photo has been locked.</field>
    People.RecentActivity.FeedObject.call(this, provider, network, info);
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');
    this._album$1 = album;
    this._info$1 = info.data;
    this._caption$1 = this._info$1.caption;

    // The index could be -1 if we don't know the correct index, force it to zero.
    var index = this._info$1.index;
    this._index$1 = index >= 0 ? index : 0;
};

Jx.inherit(People.RecentActivity.Photo, People.RecentActivity.FeedObject);

Jx.mix(People.RecentActivity.Photo.prototype, Jx.Events);
Jx.mix(People.RecentActivity.Photo.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.Photo.prototype, "propertychanged", "refreshcompleted");

People.RecentActivity.Photo.prototype._album$1 = null;
People.RecentActivity.Photo.prototype._info$1 = null;
People.RecentActivity.Photo.prototype._entities$1 = null;
People.RecentActivity.Photo.prototype._tags$1 = null;
People.RecentActivity.Photo.prototype._caption$1 = null;
People.RecentActivity.Photo.prototype._index$1 = 0;
People.RecentActivity.Photo.prototype._isLocked$1 = false;

Object.defineProperty(People.RecentActivity.Photo.prototype, "album", {
    get: function() {
        /// <summary>
        ///     Gets the parent album.
        /// </summary>
        /// <value type="People.RecentActivity.PhotoAlbum"></value>
        return this._album$1;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "caption", {
    get: function() {
        /// <summary>
        ///     Gets the caption.
        /// </summary>
        /// <value type="String"></value>
        return this._caption$1;
    },
    set: function(value) {
        if (value !== this._caption$1) {
            this._caption$1 = value;
            this._onPropertyChanged$1('Caption');
        }

    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "entities", {
    get: function() {
        /// <summary>
        ///     Gets the entities of the caption.
        /// </summary>
        /// <value type="Array" elementType="Entity"></value>
        if (this._entities$1 == null) {
            this._entities$1 = People.RecentActivity.EntityHelper.createEntities(this._info$1.entities);
        }

        return this._entities$1;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "index", {
    get: function() {
        /// <summary>
        ///     Gets the index of the photo.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._index$1;
    },
    set: function(value) {
        if (this._index$1 !== value) {
            this._index$1 = value;
            this._onPropertyChanged$1('Index');
        }

    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "owner", {
    get: function() {
        /// <summary>
        ///     Gets the owner of the photo.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return People.RecentActivity.ContactCache.findOrCreateContact(this._info$1.owner);
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "tags", {
    get: function() {
        /// <summary>
        ///     Gets the tags.
        /// </summary>
        /// <value type="People.RecentActivity.PhotoTagCollection"></value>
        if (this._tags$1 == null) {
            this._tags$1 = new People.RecentActivity.PhotoTagCollection(this.provider, this.network, this);
        }

        return this._tags$1;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "source", {
    get: function() {
        /// <summary>
        ///     Gets the source.
        /// </summary>
        /// <value type="String"></value>
        return this._info$1.source;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "sourceHeight", {
    get: function() {
        /// <summary>
        ///     Gets the source height.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info$1.sourceHeight;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "sourceWidth", {
    get: function() {
        /// <summary>
        ///     Gets the source width.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info$1.sourceWidth;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "originalSource", {
    get: function() {
        /// <summary>
        ///     Gets the original photo source.
        /// </summary>
        /// <value type="String"></value>
        return this._info$1.originalSource;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "originalHeight", {
    get: function() {
        /// <summary>
        ///     Gets the height of the original photo.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info$1.originalSourceHeight;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "originalWidth", {
    get: function() {
        /// <summary>
        ///     Gets the width of the original photo.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info$1.originalSourceWidth;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "thumbnailSource", {
    get: function() {
        /// <summary>
        ///     Gets the thumbnail source.
        /// </summary>
        /// <value type="String"></value>
        return this._info$1.thumbnailSource;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "thumbnailHeight", {
    get: function() {
        /// <summary>
        ///     Gets the thumbnail height.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info$1.thumbnailSourceHeight;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "thumbnailWidth", {
    get: function() {
        /// <summary>
        ///     Gets the thumbnail width.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._info$1.thumbnailSourceWidth;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "isLandscape", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is a landscape photo.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info$1.sourceWidth >= this._info$1.sourceHeight;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "isPortrait", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is a portrait photo.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._info$1.sourceHeight >= this._info$1.sourceWidth;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "sortOrder", {
    get: function() {
        /// <value type="Number" integer="true"></value>
        return this._info$1.index;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "isLocked", {
    get: function() {
        /// <summary>
        ///     Gets or sets a value indicating whether the photo has been locked.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isLocked$1;
    },
    set: function(value) {
        this._isLocked$1 = value;
    }
});

Object.defineProperty(People.RecentActivity.Photo.prototype, "photoInfo", {
    get: function() {
        /// <summary>
        ///     Gets the photo info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_photoInfo"></value>
        return this._info$1;
    }
});

People.RecentActivity.Photo.prototype.onDisposed = function () {
    /// <summary>Disposes the instance.</summary>

    // release references.
    this._album$1 = null;
    this._entities$1 = null;
    this._info$1 = null;

    if (this._tags$1 != null) {
        // clear out the tags collection.
        this._tags$1.dispose();
        this._tags$1 = null;
    }
};

People.RecentActivity.Photo.prototype.refresh = function(userState) {
    /// <summary>
    ///     Refreshes the photo.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this.provider.refreshPhoto(this.objectInfo, People.RecentActivity.create_actionState(this, userState));
};

People.RecentActivity.Photo.prototype.onUpdated = function(info) {
    /// <summary>
    ///     Occurs when the instance has been updated.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    Debug.assert(info != null, 'info != null');
    
    var photo = info.data;
    this.caption = photo.caption;

    if (!this._isLocked$1 && photo.index >= 0) {
        // only update the index if the photo wasn't locked. if it was, the index is now being managed by
        // the model, and we should ignore any updates we get from the provider layer. if the index is
        // less than zero, assume the update is invalid and ignore.
        this.index = photo.index;
    }

    People.RecentActivity.FeedObject.prototype.onUpdated.call(this, info);
};

People.RecentActivity.Photo.prototype.onRefreshPhotoCompleted = function(result, tagsToAdd, tagsToRemove, userState) {
    /// <summary>
    ///     Occurs when the <see cref="M:People.RecentActivity.Photo.Refresh(System.Object)" /> operation completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="tagsToAdd" type="Array" elementType="photoTagInfo">The tags to add.</param>
    /// <param name="tagsToRemove" type="Array" elementType="photoTagInfo">The tags to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(tagsToAdd != null, 'tagsToAdd != null');
    Debug.assert(tagsToRemove != null, 'tagsToRemove != null');
    var updated = false;
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        var tags = this.tags;
        // add and remove the various tags.
        tags.addRangeByInfo(tagsToAdd);
        tags.removeRangeByInfo(tagsToRemove);
        updated = (tagsToAdd.length > 0) || (tagsToRemove.length > 0);
    }

    this.raiseEvent("refreshcompleted", new People.RecentActivity.RefreshActionCompletedEventArgs(this, result, updated, userState));
};

People.RecentActivity.Photo.prototype._onPropertyChanged$1 = function(propertyName) {
    /// <param name="propertyName" type="String"></param>
    Debug.assert(Jx.isNonEmptyString(propertyName), '!string.IsNullOrEmpty(propertyName)');
    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\Events\NotifyPropertyChangedEventArgs.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="ActionState.js" />
/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />
/// <reference path="Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="FeedObject.js" />
/// <reference path="Helpers\EntityHelper.js" />
/// <reference path="Network.js" />
/// <reference path="Photo.js" />
/// <reference path="PhotoCollection.js" />

People.RecentActivity.PhotoAlbum = function(provider, network, info) {
    /// <summary>
    ///     Represents a single photo album.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <field name="fakeAlbumId" type="String" static="true">The fake album ID.</field>
    /// <field name="_info$1" type="People.RecentActivity.Core.create_photoAlbumInfo">The info.</field>
    /// <field name="_photos$1" type="People.RecentActivity.PhotoCollection">The underlying photo collection.</field>
    /// <field name="_cover$1" type="People.RecentActivity.Photo">The cover photo.</field>
    /// <field name="_entities$1" type="Array" elementType="Entity">The entities;</field>
    /// <field name="_name$1" type="String">The name of the album.</field>
    /// <field name="_description$1" type="String">The description.</field>
    People.RecentActivity.FeedObject.call(this, provider, network, info);
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'info.Type == FeedObjectInfoType.PhotoAlbum');

    this._info$1 = info.data;

    this._photos$1 = new People.RecentActivity.PhotoCollection(provider, network, this);
    this._photos$1.addRangeByInfo(this._info$1.photos);

    // when we create an album from a single photo, it is possible that the cover has bogus data.
    // in this case we shouldn't construct one.
    if ((this._info$1.cover != null) && (this._info$1.cover.id != null)) {
        this._cover$1 = this._photos$1.findOrCreatePhotoByInfo(this._info$1.cover);
    }

    this._description$1 = this._info$1.description;
    this._name$1 = this._info$1.name;
};

Jx.inherit(People.RecentActivity.PhotoAlbum, People.RecentActivity.FeedObject);

Jx.mix(People.RecentActivity.PhotoAlbum.prototype, Jx.Events);
Jx.mix(People.RecentActivity.PhotoAlbum.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.PhotoAlbum.prototype, "propertychanged", "refreshcompleted");

People.RecentActivity.PhotoAlbum.fakeAlbumId = '__fake_album_id__';
People.RecentActivity.PhotoAlbum.prototype._info$1 = null;
People.RecentActivity.PhotoAlbum.prototype._photos$1 = null;
People.RecentActivity.PhotoAlbum.prototype._cover$1 = null;
People.RecentActivity.PhotoAlbum.prototype._entities$1 = null;
People.RecentActivity.PhotoAlbum.prototype._name$1 = null;
People.RecentActivity.PhotoAlbum.prototype._description$1 = null;

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "albumId", {
    get: function() {
        /// <summary>
        ///     Gets the album ID.
        /// </summary>
        /// <value type="String"></value>
        return this._info$1.id;
    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "cover", {
    get: function() {
        /// <summary>
        ///     Gets the cover photo.
        /// </summary>
        /// <value type="People.RecentActivity.Photo"></value>
        return this._cover$1;
    },
    set: function(value) {
        if (value !== this._cover$1) {
            this._cover$1 = value;
            this._onPropertyChanged$1('Cover');
        }

    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "description", {
    get: function() {
        /// <summary>
        ///     Gets the description.
        /// </summary>
        /// <value type="String"></value>
        return this._description$1;
    },
    set: function(value) {
        if (value !== this._description$1) {
            this._description$1 = value;
            this._onPropertyChanged$1('Description');
        }

    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "entities", {
    get: function() {
        /// <summary>
        ///     Gets the entities.
        /// </summary>
        /// <value type="Array" elementType="Entity"></value>
        if (this._entities$1 == null) {
            this._entities$1 = People.RecentActivity.EntityHelper.createEntities(this._info$1.entities);
        }

        return this._entities$1;
    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "isFakeAlbum", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is fake album.
        /// </summary>
        /// <value type="Boolean"></value>
        return this.id === '__fake_album_id__';
    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "name", {
    get: function() {
        /// <summary>
        ///     Gets the name.
        /// </summary>
        /// <value type="String"></value>
        return this._name$1;
    },
    set: function(value) {
        if (value !== this._name$1) {
            this._name$1 = value;
            this._onPropertyChanged$1('Name');
        }

    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "owner", {
    get: function() {
        /// <summary>
        ///     Gets the album owner.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return People.RecentActivity.ContactCache.findOrCreateContact(this._info$1.owner);
    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "photos", {
    get: function() {
        /// <summary>
        ///     Gets the photos.
        /// </summary>
        /// <value type="People.RecentActivity.PhotoCollection"></value>
        return this._photos$1;
    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "sortOrder", {
    get: function() {
        /// <value type="Number" integer="true"></value>
        return this.timestamp.getTime();
    }
});

Object.defineProperty(People.RecentActivity.PhotoAlbum.prototype, "albumInfo", {
    get: function() {
        /// <summary>
        ///     Gets the info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_photoAlbumInfo"></value>
        return this._info$1;
    }
});

People.RecentActivity.PhotoAlbum.prototype.onDisposed = function () {
    /// <summary>Disposes the instance.</summary>
        
    // dispose each photo.
    this._photos$1.dispose();
    this._photos$1 = null;

    // release references.
    this._cover$1 = null;
    this._entities$1 = null;
    this._info$1 = null;
};

People.RecentActivity.PhotoAlbum.prototype.refresh = function(userState) {
    /// <summary>
    ///     Refreshes the album.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    // refresh the album, passing in "this" as the context, obviously.
    this.provider.refreshAlbum(this.objectInfo, People.RecentActivity.create_actionState(this, userState));
};

People.RecentActivity.PhotoAlbum.prototype.onUpdated = function(info) {
    /// <summary>
    ///     Occurs when the instance has been updated.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    Debug.assert(info != null, 'info != null');
    var album = info.data;
    if ((this._cover$1 == null) || (this._cover$1.id !== album.cover.id)) {
        if ((album.cover != null) && (album.cover.id != null)) {
            // the cover has changed, so swap it out for the correct one.
            this.cover = this._photos$1.findOrCreatePhotoByInfo(album.cover);
        }    
    }

    this.description = album.description;
    this.name = album.name;
    this._photos$1.totalCount = album.totalCount;
    People.RecentActivity.FeedObject.prototype.onUpdated.call(this, info);
};

People.RecentActivity.PhotoAlbum.prototype.onRefreshAlbumCompleted = function(result, photosToAdd, photosToUpdate, photosToRemove, userState) {
    /// <summary>
    ///     Occurs when the <see cref="M:People.RecentActivity.PhotoAlbum.Refresh(System.Object)" /> operation completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="photosToAdd" type="Array" elementType="feedObjectInfo">The photos to add.</param>
    /// <param name="photosToUpdate" type="Array" elementType="feedObjectInfo">The photos to update.</param>
    /// <param name="photosToRemove" type="Array" elementType="feedObjectInfo">The photos to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(photosToAdd != null, 'photosToAdd != null');
    Debug.assert(photosToUpdate != null, 'photosToUpdate != null');
    Debug.assert(photosToRemove != null, 'photosToRemove != null');
    var updated = false;
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        var photos = this.photos;
        // add and remove the various photos.
        photos.addRangeByInfo(photosToAdd);
        photos.removeRangeByInfo(photosToRemove);
        for (var i = 0, len = photosToUpdate.length; i < len; i++) {
            var photo = photos.findPhotoByInfo(photosToUpdate[i]);
            if (photo != null) {
                photo.onUpdated(photosToUpdate[i]);
            }        
        }

        updated = (photosToAdd.length > 0) || (photosToRemove.length > 0);
        // once everything has been added, removed and updated, resort the collection to make sure all of our ducks are in a row.
        photos.sort(function(a, b) {
            return (a).index - (b).index;
        });
    }

    this.raiseEvent("refreshcompleted", new People.RecentActivity.RefreshActionCompletedEventArgs(this, result, updated, userState));
};

People.RecentActivity.PhotoAlbum.prototype._onPropertyChanged$1 = function(propertyName) {
    /// <param name="propertyName" type="String"></param>
    Debug.assert(Jx.isNonEmptyString(propertyName), '!string.IsNullOrEmpty(propertyName)');
    this.raiseEvent("propertychanged", new People.RecentActivity.NotifyPropertyChangedEventArgs(this, propertyName));
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Common\Social.Utilities.js" />
/// <reference path="..\Core\CommentDetailsInfo.js" />
/// <reference path="..\Core\FeedObjectInfo.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\Permissions.js" />
/// <reference path="..\Core\PhotoAlbumInfo.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="Collection.js" />
/// <reference path="Events\ActionCompletedEventArgs.js" />
/// <reference path="Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="Helpers\CollectionHelper.js" />
/// <reference path="Network.js" />
/// <reference path="Photo.js" />
/// <reference path="PhotoAlbum.js" />

People.RecentActivity.PhotoAlbumCollection = function(provider, network) {
    /// <summary>
    ///     Provides a collection of photo albums.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The provider.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_map$1" type="Object">A map of photo albums.</field>
    /// <field name="_mapFake$1" type="Object">A map of fake albums.</field>
    /// <field name="_initializeCompleted$1" type="Boolean">Whether initialize has been completed.</field>
    /// <field name="_initializeStarted$1" type="Boolean">Whether initialize has been started.</field>
    /// <field name="_initializeFromHydration$1" type="Boolean">Whether we're initializing from hydration.</field>
    /// <field name="_orphanedPhotos$1" type="Object">A list of orphaned photos.</field>
    People.RecentActivity.Collection.call(this);
    Debug.assert(provider != null, 'provider != null');
    Debug.assert(network != null, 'network != null');

    this._map$1 = {};
    this._mapFake$1 = {};
    this._mapUnnamed = {};

    this._network$1 = network;
    this._orphanedPhotos$1 = {};
    this._provider$1 = provider;
};

Jx.inherit(People.RecentActivity.PhotoAlbumCollection, People.RecentActivity.Collection);

Debug.Events.define(People.RecentActivity.PhotoAlbumCollection.prototype, "initializecompleted", "refreshcompleted");

People.RecentActivity.PhotoAlbumCollection.prototype._provider$1 = null;
People.RecentActivity.PhotoAlbumCollection.prototype._network$1 = null;
People.RecentActivity.PhotoAlbumCollection.prototype._map$1 = null;
People.RecentActivity.PhotoAlbumCollection.prototype._mapFake$1 = null;
People.RecentActivity.PhotoAlbumCollection.prototype._mapUnnamed = null;
People.RecentActivity.PhotoAlbumCollection.prototype._initializeCompleted$1 = false;
People.RecentActivity.PhotoAlbumCollection.prototype._initializeStarted$1 = false;
People.RecentActivity.PhotoAlbumCollection.prototype._initializeFromHydration$1 = false;
People.RecentActivity.PhotoAlbumCollection.prototype._orphanedPhotos$1 = null;
People.RecentActivity.PhotoAlbumCollection.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.PhotoAlbumCollection.prototype, "initialized", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether initialization has been completed.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._initializeCompleted$1;
    }
});

People.RecentActivity.PhotoAlbumCollection.prototype.dispose = function () {
    /// <summary>Disposes the instance.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;
        
        // clear out the maps.
        People.Social.clearKeys(this._map$1);
        People.Social.clearKeys(this._mapFake$1);
        People.Social.clearKeys(this._orphanedPhotos$1);

        // dispose each photo album in the collection, releasing references.
        for (var i = this.count - 1; i >= 0; i--) {
            this.item(i).dispose();
        }

        // release references to parent objects.
        this._network$1 = null;
        this._provider$1 = null;
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype.initializeFromHydration = function(userState) {
    /// <summary>
    ///     Initializes the photo albums from hydration.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this._initializeStarted$1) {
        this._initializeStarted$1 = true;
        this._initializeFromHydration$1 = true;
        this._provider$1.getCachedAlbums(userState);
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype.initialize = function(userState) {
    /// <summary>
    ///     Initializes the photo albums.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    if (!this._initializeStarted$1) {
        this._initializeStarted$1 = true;
        this._provider$1.refreshAlbums(userState);
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype.refresh = function(userState) {
    /// <summary>
    ///     Refreshes the photo albums.
    /// </summary>
    /// <param name="userState" type="Object"></param>
    Debug.assert(this._initializeCompleted$1, 'this.initializeCompleted');

    this._provider$1.refreshAlbums(userState);
};

People.RecentActivity.PhotoAlbumCollection.prototype.findAlbumByInfo = function(info) {
    /// <summary>
    ///     Finds an album by ID.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.PhotoAlbum"></returns>
    Debug.assert(info != null, 'info != null');

    return this.findAlbumById(info.data.id);
};

People.RecentActivity.PhotoAlbumCollection.prototype.findOrCreateAlbumByInfo = function(info) {
    /// <summary>
    ///     Finds or creates an album.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.PhotoAlbum"></returns>
    Debug.assert(info != null, 'info != null');

    var album = this.findAlbumByInfo(info);
    if (album == null) {
        // add the new album to the collection.
        album = this._addByInfo$1(info);
    }

    return album;
};

People.RecentActivity.PhotoAlbumCollection.prototype.findAlbumById = function(id) {
    /// <summary>
    ///     Finds an album by ID.
    /// </summary>
    /// <param name="id" type="String">The ID of the album.</param>
    /// <returns type="People.RecentActivity.PhotoAlbum"></returns>
    Debug.assert(Jx.isNonEmptyString(id), '!string.IsNullOrEmpty(id)');

    if (!Jx.isUndefined(this._map$1[id])) {
        return this._map$1[id];
    }

    if (!Jx.isUndefined(this._mapFake$1[id])) {
        return this._mapFake$1[id];
    }

    if (!Jx.isUndefined(this._mapUnnamed[id])) {
        return this._mapUnnamed[id];
    }

    return null;
};

People.RecentActivity.PhotoAlbumCollection.prototype.findPhotoByInfo = function(info) {
    /// <summary>
    ///     Finds a photo.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Photo"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');

    var photoInfo = info.data;

    var album = this.findAlbumById(photoInfo.albumId);
    if (album != null) {
        // we found the parent album for this photo, so now retrieve the photo.
        return album.photos.findPhotoByInfo(info);
    }

    if (!Jx.isUndefined(this._orphanedPhotos$1[photoInfo.id])) {
        return this._orphanedPhotos$1[photoInfo.id];
    }

    return null;
};

People.RecentActivity.PhotoAlbumCollection.prototype.findOrCreatePhotoByInfo = function(info, albumInfo) {
    /// <summary>
    ///     Finds or creates a photo.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The photo info.</param>
    /// <param name="albumInfo" type="People.RecentActivity.Core.create_feedObjectInfo">The album info.</param>
    /// <returns type="People.RecentActivity.Photo"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');

    var photoInfo = info.data;

    if (Jx.isNonEmptyString(photoInfo.albumId)) {
        var album = this.findAlbumById(photoInfo.albumId);
        if (album == null) {
            // add the new album.
            album = this._createAlbum(info, albumInfo);
        }

        return album.photos.findOrCreatePhotoByInfo(info);
    }

    // the parent album for this photo is not available -- so create a new dummy photo.
    var photo = new People.RecentActivity.Photo(this._provider$1, this._network$1, null, info);
    this._orphanedPhotos$1[photoInfo.id] = photo;

    return photo;
};

People.RecentActivity.PhotoAlbumCollection.prototype.onGetCachedAlbumsCompleted = function(result, albums, userState) {
    /// <summary>
    ///     Occurs when the <c>GetCachedAlbums</c> call completes.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="albums" type="Array" elementType="feedObjectInfo">The albums.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(albums != null, 'albums != null');
    if ((result.code === People.RecentActivity.Core.ResultCode.success) && (albums.length > 0)) {
        this._addRangeByInfo$1(albums);
    }

    if (this._initializeFromHydration$1) {
        // only mark as complete when we were initializing from hydration -- otherwise
        // this simply means we got cached albums from the initialize/refresh flow.
        this._onInitializeCompleted$1(result, userState);
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype.onRefreshAlbumsCompleted = function(result, albumsToAdd, albumsToUpdate, albumsToRemove, userState) {
    /// <summary>
    ///     Occurs when refreshing the albums has been completed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="albumsToAdd" type="Array" elementType="feedObjectInfo">The albums to add.</param>
    /// <param name="albumsToUpdate" type="Array" elementType="feedObjectInfo">The albums to update.</param>
    /// <param name="albumsToRemove" type="Array" elementType="feedObjectInfo">The albums to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(albumsToAdd != null, 'albumsToAdd != null');
    Debug.assert(albumsToUpdate != null, 'albumsToUpdate != null');
    Debug.assert(albumsToRemove != null, 'albumsToRemove != null');

    var updated = false;

    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        if (albumsToAdd.length > 0) {
            updated = true;
            this._addRangeByInfo$1(albumsToAdd);
        }

        if (albumsToUpdate.length > 0) {
            this._updateRangeByInfo$1(albumsToUpdate);
        }

        if (albumsToRemove.length > 0) {
            updated = true;
            this._removeRangeByInfo$1(albumsToRemove);
        }    
    }

    if (!this._initializeCompleted$1) {
        // this call was to initialize the albums.
        this._onInitializeCompleted$1(result, userState);
    }
    else {
        this.raiseEvent("refreshcompleted", new People.RecentActivity.RefreshActionCompletedEventArgs(this, result, updated, userState));
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._getAlbumKey$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="String"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'info.Type == FeedObjectInfoType.PhotoAlbum');

    var albumInfo = info.data;
    return albumInfo.id;
};

People.RecentActivity.PhotoAlbumCollection.prototype._createAlbum = function (photoInfo, albumInfo) {
    /// <param name="photoInfo" type="People.RecentActivity.Core.create_photoInfo">The photo info.</param>
    /// <param name="albumInfo" type="People.RecentActivity.Core.create_feedObjectInfo">The album info.</param>
    if (albumInfo != null) {
        if (Jx.isNonEmptyString(albumInfo.data.name)) {
            return this._addByInfo$1(albumInfo);
        }
        else {
            // this album has no name, so treat it special. we don't put it in the collection, but we still push it 
            // into a map so we can find it later, when needed.
            return this._addUnnamedAlbumByInfo(albumInfo);
        }
    }
    else {
        return this._addFakeAlbumByInfo$1(photoInfo);
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._addFakeAlbumByInfo$1 = function(photo) {
    /// <param name="photo" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="People.RecentActivity.PhotoAlbum"></returns>
    Debug.assert(photo != null, 'photo != null');

    var photoInfo = photo.data;
    var albumInfo = People.RecentActivity.Core.create_photoAlbumInfo(photoInfo.albumId, photoInfo.owner, '', '', new Array(0), 1, photo, [ photo ]);

    var commentInfo = People.RecentActivity.Core.create_commentDetailsInfo(0, true, People.RecentActivity.Core.Permissions.none);
        commentInfo.icon = photo.commentDetails.icon;

    var objectInfo = People.RecentActivity.Core.create_feedObjectInfo('__fake_album_id__', photo.sourceId, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, albumInfo, null, photo.timestamp, commentInfo, new Array(0), new Array(0), new Array(0));

    // now that we've created a fake album info, we can add it.
    var key = this._getAlbumKey$1(objectInfo);

    if (Jx.isUndefined(this._mapFake$1[key])) {
        var album = new People.RecentActivity.PhotoAlbum(this._provider$1, this._network$1.identity.networks.findById(objectInfo.sourceId), objectInfo);

        // only add fake albums to the map, do not add them to the collection!
        this._mapFake$1[key] = album;

        return album;
    }
    else {
        // return the existing fake album.
        return this._mapFake$1[key];
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._addUnnamedAlbumByInfo = function (albumInfo) {
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    Debug.assert(albumInfo != null, "albumInfo != null");

    var key = this._getAlbumKey$1(albumInfo);

    if (Jx.isUndefined(this._mapUnnamed[key])) {
        // initialize a new album for this info and store it.
        var album = new People.RecentActivity.PhotoAlbum(this._provider$1, this._network$1.identity.networks.findById(albumInfo.sourceId), albumInfo);
        this._mapUnnamed[key] = album;
        return album;
    }
    else {
        // this unnamed album already exists.
        return this._mapUnnamed[key];
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._addByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="People.RecentActivity.PhotoAlbum"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'info.Type == FeedObjectInfoType.PhotoAlbum');

    var key = this._getAlbumKey$1(info);

    if (Jx.isUndefined(this._map$1[key])) {
        // initialize a new album for this info and store it.
        // fetch the correct network for the photo album, of course.
        var album = new People.RecentActivity.PhotoAlbum(this._provider$1, this._network$1.identity.networks.findById(info.sourceId), info);
        this._map$1[key] = album;

        People.RecentActivity.CollectionHelper.addSortableItem(this, album, true);

        return album;
    }
    else {
        return this._map$1[key];
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._addRangeByInfo$1 = function(infos) {
    /// <param name="infos" type="Array" elementType="People.RecentActivity.Core.create_feedObjectInfo"></param>
    Debug.assert(infos != null, 'infos != null');

    var networks = this._network$1.identity.networks;
    var items = [];

    for (var i = 0, len = infos.length; i < len; i++) {
        var info = infos[i];
        
        Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'info.Type == FeedObjectInfoType.PhotoAlbum');

        var key = this._getAlbumKey$1(info);
        if (Jx.isUndefined(this._map$1[key])) {
            // make sure we fetch the correct network for this photo album.
            var albumInfo = info.data;

            if (Jx.isNonEmptyString(albumInfo.name)) {
                // create the album.
                var album = new People.RecentActivity.PhotoAlbum(this._provider$1, this._network$1.identity.networks.findById(info.sourceId), info);
                this._map$1[key] = album;
                items.push(album);
            }
            else {
                // create the unnamed album, keep it in the map, but don't push it into the collection.
                this._addUnnamedAlbumByInfo(info);
            }
        }    
    }

    if (items.length > 0) {
        People.RecentActivity.CollectionHelper.addSortableItems(this, items, true);
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._removeByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'info.Type == FeedObjectInfoType.PhotoAlbum');

    var key = this._getAlbumKey$1(info);

    if (!Jx.isUndefined(this._map$1[key])) {
        var album = this._map$1[key];
        delete this._map$1[key];
        this.removeInternal(album);
    }

    // also attempt to remove from the fake map and unnamed maps.
    delete this._mapFake$1[key];
    delete this._mapUnnamed[key];
};

People.RecentActivity.PhotoAlbumCollection.prototype._removeRangeByInfo$1 = function(infos) {
    /// <param name="infos" type="Array" elementType="feedObjectInfo"></param>
    Debug.assert(infos != null, 'infos != null');

    for (var i = 0, len = infos.length; i < len; i++) {
        this._removeByInfo$1(infos[i]);
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._updateRangeByInfo$1 = function(infos) {
    /// <param name="infos" type="Array" elementType="feedObjectInfo"></param>
    Debug.assert(infos != null, 'infos != null');

    for (var i = 0, len = infos.length; i < len; i++) {
        var info = infos[i];

        Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, 'info.Type == FeedObjectInfoType.PhotoAlbum');

        var key = this._getAlbumKey$1(info);

        if (!Jx.isUndefined(this._map$1[key])) {
            this._map$1[key].onUpdated(info);
        }
        else if (!Jx.isUndefined(this._mapFake$1[key])) {
            this._mapFake$1[key].onUpdated(info);
        }
        else if (!Jx.isUndefined(this._mapUnnamed[key])) {
            // the unnamed album was updated. check to see if it has a name now.
            var album = this._mapUnnamed[key];
                album.onUpdated(info);

            if (!Jx.isNonEmptyString(album.name)) {
                // promote this album to a full-fledged one.
                this._map$1[key] = album;
                delete this._mapUnnamed[key];
                People.RecentActivity.CollectionHelper.addSortableItem(this, album, true);
            }
        }
    }
};

People.RecentActivity.PhotoAlbumCollection.prototype._onInitializeCompleted$1 = function(result, userState) {
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo"></param>
    /// <param name="userState" type="Object"></param>
    this._initializeCompleted$1 = true;
    this.raiseEvent("initializecompleted", new People.RecentActivity.ActionCompletedEventArgs(this, result, userState));
};

People.RecentActivity.PhotoAlbumCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets an album by index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <param name="value" type="People.RecentActivity.PhotoAlbum"></param>
    /// <returns type="People.RecentActivity.PhotoAlbum"></returns>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(index < this.count, 'index < this.Count');

    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Common\Social.Utilities.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="Collection.js" />
/// <reference path="Helpers\CollectionHelper.js" />
/// <reference path="Network.js" />
/// <reference path="Photo.js" />
/// <reference path="PhotoAlbum.js" />
/// <reference path="PhotoCollectionLockToken.js" />

People.RecentActivity.PhotoCollection = function(provider, network, album) {
    /// <summary>
    ///     Provides a colletion for photos.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="album" type="People.RecentActivity.PhotoAlbum">The parent album.</param>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The provider.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_map$1" type="Object">The map.</field>
    /// <field name="_album$1" type="People.RecentActivity.PhotoAlbum">The parent album.</field>
    /// <field name="_totalCount$1" type="Number" integer="true">The total number of items.</field>
    /// <field name="_locks$1" type="Object">The locks.</field>
    /// <field name="_locksScheduledToRemove$1" type="Object">The list of photos that are scheduled to be removed, but are currently locked.</field>
    People.RecentActivity.Collection.call(this);

    Debug.assert(provider != null, 'provider != null');
    Debug.assert(network != null, 'network != null');
    Debug.assert(album != null, 'album != null');

    this._album$1 = album;
    this._locks$1 = {};
    this._locksScheduledToRemove$1 = {};
    this._map$1 = {};
    this._network$1 = network;
    this._provider$1 = provider;
    this._totalCount$1 = album.albumInfo.totalCount;
};

Jx.inherit(People.RecentActivity.PhotoCollection, People.RecentActivity.Collection);

People.RecentActivity.PhotoCollection.prototype._provider$1 = null;
People.RecentActivity.PhotoCollection.prototype._network$1 = null;
People.RecentActivity.PhotoCollection.prototype._map$1 = null;
People.RecentActivity.PhotoCollection.prototype._album$1 = null;
People.RecentActivity.PhotoCollection.prototype._totalCount$1 = 0;
People.RecentActivity.PhotoCollection.prototype._locks$1 = null;
People.RecentActivity.PhotoCollection.prototype._locksScheduledToRemove$1 = null;
People.RecentActivity.PhotoCollection.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.PhotoCollection.prototype, "totalCount", {
    get: function() {
        /// <summary>
        ///     Gets the total count.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._totalCount$1;
    },
    set: function(value) {
        // Adjust the value to account for the locked items.
        value = Math.max(value, Object.keys(this._map$1).length);

        if (this._totalCount$1 !== value) {
            this._totalCount$1 = value;
            this.onPropertyChanged('TotalCount');
        }

    }
});

People.RecentActivity.PhotoCollection.prototype.dispose = function () {
    /// <summary>Disposes the instance.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // dispose each photo.
        for (var i = this.count - 1; i >= 0; i--) {
            this.item(i).dispose();
        }

        // clean up maps.
        People.Social.clearKeys(this._locks$1);
        People.Social.clearKeys(this._locksScheduledToRemove$1);
        People.Social.clearKeys(this._map$1);

        // release references.
        this._album$1 = null;
        this._network$1 = null;
        this._provider$1 = null;
    }
};

People.RecentActivity.PhotoCollection.prototype.lock = function(photoId) {
    /// <summary>
    ///     Locks a photo by ID. The photo will not be removed when a refresh is triggered.
    /// </summary>
    /// <param name="photoId" type="String">The ID of the photo.</param>
    /// <returns type="People.RecentActivity.photoCollectionLockToken"></returns>
    Debug.assert(Jx.isNonEmptyString(photoId), '!string.IsNullOrEmpty(photoId)');

    Jx.log.write(4, 'PhotoCollection::Lock(' + photoId + ')');

    // add a lock for the photo of this ID. note that we allow locking the same photo multiple times,
    // as some Identity instances are "static" -- such as the What's New and Me identities.
    if (!!Jx.isUndefined(this._locks$1[photoId])) {
        this._locks$1[photoId] = [];
    }

    var token = People.RecentActivity.create_photoCollectionLockToken(photoId);
    this._locks$1[photoId].push(token);

    return token;
};

People.RecentActivity.PhotoCollection.prototype.unlock = function(token) {
    /// <summary>
    ///     Releases all locked photos.
    /// </summary>
    /// <param name="token" type="People.RecentActivity.photoCollectionLockToken">The lock token.</param>
    Debug.assert(token != null, 'token != null');

    var photoId = token.photoId;
    Jx.log.write(4, 'PhotoCollection::Unlock(' + photoId + ')');

    if (!Jx.isUndefined(this._locks$1[photoId])) {
        // remove the token from the lock list, if possible.
        var tokens = this._locks$1[photoId];

        var index = tokens.indexOf(token);
        if (index !== -1) {
            tokens.splice(index, 1);

            if (!tokens.length) {
                // there are no more locks for this photo, remove it from the map.
                delete this._locks$1[photoId];

                // check to see if this photo was scheduled to be removed.
                if (!Jx.isUndefined(this._locksScheduledToRemove$1[photoId])) {
                    Jx.log.write(4, 'PhotoCollection::Unlock() --> References == 0, cleaning up photo');

                    this.removeByInfo(this._locksScheduledToRemove$1[photoId]);
                    delete this._locksScheduledToRemove$1[photoId];
                }            
            }        
        }    
    }
};

People.RecentActivity.PhotoCollection.prototype.addByInfo = function(info) {
    /// <summary>
    ///     Adds a photo by info.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Photo"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');

    var key = this._getPhotoKey$1(info);
    if (!!Jx.isUndefined(this._map$1[key])) {
        // create a new photo instance and insert it into place.
        var photo = new People.RecentActivity.Photo(this._provider$1, this._network$1, this._album$1, info);
        this._map$1[key] = photo;

        // adjust the total count if needed.
        this._adjustTotalCount$1();

        People.RecentActivity.CollectionHelper.addSortableItem(this, photo, false);
    }

    return this._map$1[key];
};

People.RecentActivity.PhotoCollection.prototype.addRangeByInfo = function(infos) {
    /// <summary>
    ///     Adds a range of photos by info.
    /// </summary>
    /// <param name="infos" type="Array" elementType="feedObjectInfo">The info objects.</param>
    Debug.assert(infos != null, 'infos != null');

    var photos = [];
    for (var i = 0, len = infos.length; i < len; i++) {
        var info = infos[i];

        Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');

        var key = this._getPhotoKey$1(info);
        if (!!Jx.isUndefined(this._map$1[key])) {
            // add this photo to the collection.
            var photo = new People.RecentActivity.Photo(this._provider$1, this._network$1, this._album$1, info);
            this._map$1[key] = photo;

            photos.push(photo);
        }    
    }

    if (photos.length > 0) {
        // adjust the total count if needed.
        this._adjustTotalCount$1();

        // add the photos and sort them by index.
        People.RecentActivity.CollectionHelper.addSortableItems(this, photos, false);
    }
};

People.RecentActivity.PhotoCollection.prototype.removeByInfo = function(info) {
    /// <summary>
    ///     Removes a photo.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The photo info.</param>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');

    var key = this._getPhotoKey$1(info);
    if (!Jx.isUndefined(this._map$1[key])) {
        var photo = this._map$1[key];

        if (!Jx.isUndefined(this._locks$1[info.id])) {
            // this photo has been locked, so wait for it to become unlocked.
            Jx.log.write(4, 'PhotoCollection::RemoveByInfo() --> Photo is locked [' + info.id + ']');
            this._locksScheduledToRemove$1[info.id] = info;

            // once we know the photo is scheduled to be removed, we should mark it as locked, so it ignored 
            // updates to the index, and so on.
            photo.isLocked = true;
        }
        else {
            // remove the photo from the collection.
            delete this._map$1[key];
            this.removeInternal(photo);
        }

        this._adjustTotalCount$1();
    }
};

People.RecentActivity.PhotoCollection.prototype.removeRangeByInfo = function(info) {
    /// <summary>
    ///     Removes a set of photos.
    /// </summary>
    /// <param name="info" type="Array" elementType="feedObjectInfo">The photos to remove.</param>
    Debug.assert(info != null, 'info != null');

    for (var i = 0, len = info.length; i < len; i++) {
        this.removeByInfo(info[i]);
    }

    // after removing everything, update the indices of any items scheduled to be removed.
    // they will basically just be positioned at the end of the photo album. note that we don't have
    // to re-sort -- the caller is responsible for that.
    var countScheduled = Object.keys(this._locksScheduledToRemove$1).length;
    if (countScheduled > 0) {
        var count = this.count;
        var index = count - countScheduled;

        for (var k in this._locksScheduledToRemove$1) {
            var kvp = { key: k, value: this._locksScheduledToRemove$1[k] };
            var photo = this._map$1[this._getPhotoKey$1(kvp.value)];

            photo.index = index++;
        }    
    }
};

People.RecentActivity.PhotoCollection.prototype.findOrCreatePhotoByInfo = function(info) {
    /// <summary>
    ///     Finds or creates a new <see cref="T:People.RecentActivity.Photo" /> instance by ID.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Photo"></returns>
    Debug.assert(info != null, 'info != null');

    var key = this._getPhotoKey$1(info);
    if (!Jx.isUndefined(this._map$1[key])) {
        // we already have this photo.
        return this._map$1[key];
    }

    // we don't have this photo, so add it.
    return this.addByInfo(info);
};

People.RecentActivity.PhotoCollection.prototype.findPhotoByInfo = function(info) {
    /// <summary>
    ///     Finds a photo.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo">The info.</param>
    /// <returns type="People.RecentActivity.Photo"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');

    var key = this._getPhotoKey$1(info);
    if (!Jx.isUndefined(this._map$1[key])) {
        return this._map$1[key];
    }

    return null;
};

People.RecentActivity.PhotoCollection.prototype._adjustTotalCount$1 = function() {
    this.totalCount = Math.max(Object.keys(this._map$1).length, this._totalCount$1);
};

People.RecentActivity.PhotoCollection.prototype._getPhotoKey$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_feedObjectInfo"></param>
    /// <returns type="String"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type === People.RecentActivity.Core.FeedObjectInfoType.photo, 'info.Type == FeedObjectInfoType.Photo');

    return info.data.id;
};

People.RecentActivity.PhotoCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets a photo by index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index of the photo.</param>
    /// <param name="value" type="People.RecentActivity.Photo"></param>
    /// <returns type="People.RecentActivity.Photo"></returns>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(index < this.count, 'index < this.Count');

    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />

People.RecentActivity.PhotoTag = function(info) {
    /// <summary>
    ///     Represents a photo tag.
    /// </summary>
    /// <param name="info" type="People.RecentActivity.Core.create_photoTagInfo">The photo tag info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_photoTagInfo">The underlying info.</field>
    /// <field name="_contact" type="People.RecentActivity.Contact">The tagged contact.</field>
    /// <field name="_timestamp" type="Date">The timestamp.</field>
    Debug.assert(info != null, 'info != null');
    this._info = info;
    this._contact = People.RecentActivity.ContactCache.findOrCreateContact(info.contact);
    this._timestamp = new Date(info.timestamp);
};


People.RecentActivity.PhotoTag.prototype._info = null;
People.RecentActivity.PhotoTag.prototype._contact = null;
People.RecentActivity.PhotoTag.prototype._timestamp = null;

Object.defineProperty(People.RecentActivity.PhotoTag.prototype, "x", {
    get: function() {
        /// <summary>
        ///     Gets the x position of the tag, measured as float point percentage from 0
        ///     to 100, from left edge of the photo.
        /// </summary>
        /// <value type="Number"></value>
        return this._info.x;
    }
});

Object.defineProperty(People.RecentActivity.PhotoTag.prototype, "y", {
    get: function() {
        /// <summary>
        ///     Gets the y position of the tag, measured as float point percentage from 0
        ///     to 100, from top edge of the photo.
        /// </summary>
        /// <value type="Number"></value>
        return this._info.y;
    }
});

Object.defineProperty(People.RecentActivity.PhotoTag.prototype, "contact", {
    get: function() {
        /// <summary>
        ///     Gets the tagged contact.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return this._contact;
    }
});

Object.defineProperty(People.RecentActivity.PhotoTag.prototype, "timestamp", {
    get: function() {
        /// <summary>
        ///     Gets the timestamp.
        /// </summary>
        /// <value type="Date"></value>
        return this._timestamp;
    }
});

Object.defineProperty(People.RecentActivity.PhotoTag.prototype, "sortOrder", {
    get: function() {
        /// <value type="Number" integer="true"></value>
        return this._timestamp.getTime();
    }
});

Object.defineProperty(People.RecentActivity.PhotoTag.prototype, "info", {
    get: function() {
        /// <summary>
        ///     Gets the underlying info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_photoTagInfo"></value>
        return this._info;
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Collection.js" />
/// <reference path="Network.js" />
/// <reference path="Photo.js" />
/// <reference path="PhotoTag.js" />

People.RecentActivity.PhotoTagCollection = function(provider, network, photo) {
    /// <summary>
    ///     Provides a collection for photo tags.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="photo" type="People.RecentActivity.Photo">The photo.</param>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The feed provider.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The network.</field>
    /// <field name="_photo$1" type="People.RecentActivity.Photo">The photo.</field>
    /// <field name="_map$1" type="Object">The map.</field>
    People.RecentActivity.Collection.call(this);
    Debug.assert(provider != null, 'provider != null');
    Debug.assert(network != null, 'network != null');
    Debug.assert(photo != null, 'photo != null');

    this._map$1 = {};
    this._network$1 = network;
    this._photo$1 = photo;
    this._provider$1 = provider;

    // add the initial set of tags, if there are any.
    var info = photo.photoInfo;
    if (info.tags != null) {
        this.addRangeByInfo(info.tags);
    }
};

Jx.inherit(People.RecentActivity.PhotoTagCollection, People.RecentActivity.Collection);

People.RecentActivity.PhotoTagCollection.prototype._provider$1 = null;
People.RecentActivity.PhotoTagCollection.prototype._network$1 = null;
People.RecentActivity.PhotoTagCollection.prototype._photo$1 = null;
People.RecentActivity.PhotoTagCollection.prototype._map$1 = null;
People.RecentActivity.PhotoTagCollection.prototype._isDisposed = false;

People.RecentActivity.PhotoTagCollection.prototype.dispose = function () {
    /// <summary>Disposes the instance.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // clean up maps.
        People.Social.clearKeys(this._map$1);

        // release references.
        this._network$1 = null;
        this._photo$1 = null;
        this._provider$1 = null;
    }
};

People.RecentActivity.PhotoTagCollection.prototype.findUser = function() {
    /// <summary>
    ///     Finds the tag of the user, or <c>null</c> if there is no user tag.
    /// </summary>
    /// <returns type="People.RecentActivity.PhotoTag"></returns>
    var user = this._network$1.user;
    var id = user.sourceId + ';' + user.id;
    if (!Jx.isUndefined(this._map$1[id])) {
        return this._map$1[id];
    }

    return null;
};

People.RecentActivity.PhotoTagCollection.prototype.addRangeByInfo = function(info) {
    /// <summary>
    ///     Adds a range of tags.
    /// </summary>
    /// <param name="info" type="Array" elementType="photoTagInfo">The info.</param>
    Debug.assert(info != null, 'info != null');
    var tags = [];
    for (var i = 0, len = info.length; i < len; i++) {
        var tagInfo = info[i];
        var key = this._getKey$1(tagInfo);
        if (!!Jx.isUndefined(this._map$1[key])) {
            var tag = new People.RecentActivity.PhotoTag(tagInfo);
            this._map$1[key] = tag;
            tags.push(tag);
        }    
    }

    if (tags.length > 0) {
        this.addRangeInternal(tags);
    }
};

People.RecentActivity.PhotoTagCollection.prototype.removeRangeByInfo = function(info) {
    /// <summary>
    ///     Removes a range of tags.
    /// </summary>
    /// <param name="info" type="Array" elementType="photoTagInfo">The info.</param>
    Debug.assert(info != null, 'info != null');
    for (var i = 0, len = info.length; i < len; i++) {
        var key = this._getKey$1(info[i]);
        if (!Jx.isUndefined(this._map$1[key])) {
            var tag = this._map$1[key];
            delete this._map$1[key];
            this.removeInternal(tag);
        }    
    }
};

People.RecentActivity.PhotoTagCollection.prototype._getKey$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_photoTagInfo"></param>
    /// <returns type="String"></returns>
    Debug.assert(info != null, 'info != null');
    var contactInfo = info.contact;
    return contactInfo.sourceId + ';' + contactInfo.id;
};

People.RecentActivity.PhotoTagCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets a photo tag by index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <param name="value" type="People.RecentActivity.PhotoTag"></param>
    /// <returns type="People.RecentActivity.PhotoTag"></returns>
    Debug.assert(index >= 0, 'index >= 0');
    Debug.assert(index < this.count, 'index < this.Count');
    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="Contact.js" />
/// <reference path="ContactCache.js" />
/// <reference path="Network.js" />
/// <reference path="NetworkReaction.js" />

People.RecentActivity.Reaction = function(network, info) {
    /// <summary>
    ///     Represents a single reaction.
    /// </summary>
    /// <param name="network" type="People.RecentActivity.Network">The parent network.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo">The info.</param>
    /// <field name="_info" type="People.RecentActivity.Core.create_reactionInfo">The reaction info.</field>
    /// <field name="_network" type="People.RecentActivity.Network">The parent network.</field>
    /// <field name="_type" type="People.RecentActivity.NetworkReaction">The type of the reaction.</field>
    /// <field name="_publisher" type="People.RecentActivity.Contact">The publisher of the reaction.</field>
    Debug.assert(network != null, 'network != null');
    Debug.assert(info != null, 'info != null');

    this._info = info;
    this._network = network;
    this._type = this._network.capabilities.findReactionType(info.type);
    this._publisher = People.RecentActivity.ContactCache.findOrCreateContact(info.publisher);
};

People.RecentActivity.Reaction.prototype._info = null;
People.RecentActivity.Reaction.prototype._network = null;
People.RecentActivity.Reaction.prototype._type = null;
People.RecentActivity.Reaction.prototype._publisher = null;
People.RecentActivity.Reaction.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.Reaction.prototype, "type", {
    get: function() {
        /// <summary>
        ///     Gets the type of the reaction.
        /// </summary>
        /// <value type="People.RecentActivity.NetworkReaction"></value>
        return this._type;
    }
});

Object.defineProperty(People.RecentActivity.Reaction.prototype, "publisher", {
    get: function() {
        /// <summary>
        ///     Gets the publisher.
        /// </summary>
        /// <value type="People.RecentActivity.Contact"></value>
        return this._publisher;
    }
});

Object.defineProperty(People.RecentActivity.Reaction.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network;
    }
});

People.RecentActivity.Reaction.prototype.dispose = function () {
    /// <summary>Disposes the instance.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // clear our references.
        this._info = null;
        this._network = null;
        this._publisher = null;
        this._type = null;
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ETW\EtwEventName.js" />
/// <reference path="..\Core\ETW\EtwHelper.js" />
/// <reference path="..\Core\Permissions.js" />
/// <reference path="..\Core\ReactionInfo.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="ActionState.js" />
/// <reference path="Collection.js" />
/// <reference path="NetworkReaction.js" />
/// <reference path="Reaction.js" />
/// <reference path="Events\ReactionActionCompletedEventArgs.js" />
/// <reference path="FeedObject.js" />
/// <reference path="Network.js" />

People.RecentActivity.ReactionCollection = function(provider, network, obj, type) {
    /// <summary>
    ///     Provides a collection of reactions.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The parent network.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The parent feed object.</param>
    /// <param name="type" type="People.RecentActivity.NetworkReaction">The type.</param>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The provider.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The parent network.</field>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The parent object.</field>
    /// <field name="_type$1" type="People.RecentActivity.NetworkReaction">The type of the reaction.</field>
    /// <field name="_map$1" type="Object">A map of "contact.id &lt;--&gt; reaction" instances.</field>
    /// <field name="_totalCount$1" type="Number" integer="true">The total number of reactions.</field>
    /// <field name="_permissions$1" type="People.RecentActivity.Core.Permissions">The permissions.</field>
    People.RecentActivity.Collection.call(this);

    Debug.assert(provider != null, 'provider != null');
    Debug.assert(network != null, 'network != null');
    Debug.assert(obj != null, 'obj != null');
    Debug.assert(type != null, 'type != null');

    this._network$1 = network;
    this._obj$1 = obj;
    this._provider$1 = provider;
    this._type$1 = type;
    this._map$1 = {};
};

Jx.inherit(People.RecentActivity.ReactionCollection, People.RecentActivity.Collection);

Debug.Events.define(People.RecentActivity.ReactionCollection.prototype, "addreactioncompleted", "removereactioncompleted");

People.RecentActivity.ReactionCollection.prototype._provider$1 = null;
People.RecentActivity.ReactionCollection.prototype._network$1 = null;
People.RecentActivity.ReactionCollection.prototype._obj$1 = null;
People.RecentActivity.ReactionCollection.prototype._type$1 = null;
People.RecentActivity.ReactionCollection.prototype._map$1 = null;
People.RecentActivity.ReactionCollection.prototype._totalCount$1 = 0;
People.RecentActivity.ReactionCollection.prototype._permissions$1 = 0;
People.RecentActivity.ReactionCollection.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.ReactionCollection.prototype, "type", {
    get: function() {
        /// <summary>
        ///     Gets the type.
        /// </summary>
        /// <value type="People.RecentActivity.NetworkReaction"></value>
        return this._type$1;
    }
});

Object.defineProperty(People.RecentActivity.ReactionCollection.prototype, "totalCount", {
    get: function() {
        /// <summary>
        ///     Gets the total number of reactions.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._totalCount$1;
    },
    set: function(value) {
        Debug.assert(value >= 0, 'value >= 0');

        if (value !== this._totalCount$1) {
            this._totalCount$1 = value;
            this.onPropertyChanged('TotalCount');
        }

    }
});

Object.defineProperty(People.RecentActivity.ReactionCollection.prototype, "remainingCount", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating the number of remaining reactions that can be loaded.
        /// </summary>
        /// <value type="Number" integer="true"></value>
        return this._totalCount$1 - this.count;
    }
});

Object.defineProperty(People.RecentActivity.ReactionCollection.prototype, "permissions", {
    get: function() {
        /// <summary>
        ///     Gets the permissions.
        /// </summary>
        /// <value type="People.RecentActivity.Core.Permissions"></value>
        return this._permissions$1;
    },
    set: function(value) {
        if (this._permissions$1 !== value) {
            this._permissions$1 = value;
            this.onPropertyChanged('Permissions');
        }

    }
});

Object.defineProperty(People.RecentActivity.ReactionCollection.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network$1;
    }
});

People.RecentActivity.ReactionCollection.prototype.dispose = function () {
    /// <summary>Disposes the collection.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // clear references, clean up maps.
        People.Social.clearKeys(this._map$1);

        this._network$1 = null;
        this._obj$1 = null;
        this._provider$1 = null;
        this._type$1 = null;
    }
};

People.RecentActivity.ReactionCollection.prototype.add = function(userState) {
    /// <summary>
    ///     Adds a reaction.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert((this._permissions$1 & People.RecentActivity.Core.Permissions.add) === People.RecentActivity.Core.Permissions.add, '(this.permissions & Permissions.Add) == Permissions.Add');

    // reactions are light-weight and are added right away. add it to the collection
    // and the map, and then raise the event right away.
    var reactionInfo = People.RecentActivity.Core.create_reactionInfo(this._type$1.info, this._network$1.info.user);
    var objectInfo = this._obj$1.objectInfo;

    Debug.assert(!this._containsInfo$1(reactionInfo), '!this.ContainsInfo(reactionInfo)');

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.uiAddReactionStart, objectInfo, reactionInfo);

    // perform the add operation first, so the outgoing request can be made.
    this._provider$1.addReaction(objectInfo, reactionInfo, People.RecentActivity.create_actionState(this._obj$1, userState));
};

People.RecentActivity.ReactionCollection.prototype.remove = function(userState) {
    /// <summary>
    ///     Removes a reaction.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert((this._permissions$1 & People.RecentActivity.Core.Permissions.remove) === People.RecentActivity.Core.Permissions.remove, '(this.permissions & Permissions.Remove) == Permissions.Remove');

    // reactions are light-weight and are removed right away. remove it from the collection
    // and the map, and then raise the event right away.
    var reactionInfo = People.RecentActivity.Core.create_reactionInfo(this._type$1.info, this._network$1.info.user);
    var objectInfo = this._obj$1.objectInfo;

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.uiRemoveReactionStart, objectInfo, reactionInfo);

    // actually make the outgoing request first, so the request can be made.
    this._provider$1.removeReaction(objectInfo, reactionInfo, People.RecentActivity.create_actionState(this._obj$1, userState));
};

People.RecentActivity.ReactionCollection.prototype.containsUser = function() {
    /// <summary>
    ///     Gets a value indicating whether the current user has reacted.
    /// </summary>
    /// <returns type="Boolean"></returns>
    return this.findUser() != null;
};

People.RecentActivity.ReactionCollection.prototype.findUser = function() {
    /// <summary>
    ///     Gets the user reaction, if any.
    /// </summary>
    /// <returns type="People.RecentActivity.Reaction"></returns>
    try {
        var key = this._getContactKey$1(this._network$1.info.user);
        if (!Jx.isUndefined(this._map$1[key])) {
            return this._map$1[key];
        }
    } catch (ex) {
        Jx.log.exception("People.RecentActivity.ReactionCollection.findUser: Exception looking up the user's reaction in the collection.  Assuming none and returning null.", ex);
    }

    return null;
};

People.RecentActivity.ReactionCollection.prototype.updateDetails = function(details) {
    /// <summary>
    ///     Updates the details.
    /// </summary>
    /// <param name="details" type="People.RecentActivity.Core.create_reactionDetailsInfo">The details.</param>
    Debug.assert(details != null, 'details != null');
    Debug.assert(details.id === this._type$1.id, 'details.Id == this.type.Id');

    // update the permissions and count.
    this.permissions = details.permissions;
    this.totalCount = details.count;
};

People.RecentActivity.ReactionCollection.prototype.addRangeByInfo = function(info) {
    /// <summary>
    ///     Adds a set of reactions.
    /// </summary>
    /// <param name="info" type="Array" elementType="reactionInfo">The reaction info objects.</param>
    Debug.assert(info != null, 'info != null');

    if (info.length > 0) {
        var reactions = [];

        for (var i = 0, len = info.length; i < len; i++) {
            Debug.assert(info[i].type.id === this._type$1.id, 'info[i].Type.Id == this.type.Id');

            var key = this._getContactKey$1(info[i].publisher);
            if (!!Jx.isUndefined(this._map$1[key])) {
                reactions.push(this._createAndAddToMap$1(info[i]));
            }        
        }

        this.addRangeInternal(reactions);

        if (this.count > this.totalCount) {
            // we got back more than we expected, set the total count.
            this.totalCount = this.count;
        }    
    }
};

People.RecentActivity.ReactionCollection.prototype.removeRangeByInfo = function(info) {
    /// <summary>
    ///     Removes a set of reactions.
    /// </summary>
    /// <param name="info" type="Array" elementType="reactionInfo">The reaction info objects.</param>
    Debug.assert(info != null, 'info != null');

    var removed = 0;

    for (var i = 0, len = info.length; i < len; i++) {
        Debug.assert(info[i].type.id === this._type$1.id, 'info[i].Type.Id == this.type.Id');

        if (this._removeByInfo$1(info[i]) != null) {
            removed++;
        }    
    }

    // decrease the total number of reactions.
    this.totalCount = this.totalCount - removed;
};

People.RecentActivity.ReactionCollection.prototype.onReactionAdded = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a reaction was added.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(info != null, 'info != null');

    var reaction = null;

    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        // increase the total count, then add the reaction to the collection.
        this._totalCount$1++;
        reaction = this._addByInfo$1(info);
        this.onPropertyChanged('TotalCount');
    }
    else {
        // create a dummy reaction.
        reaction = new People.RecentActivity.Reaction(this._network$1, info);
    }

    this.raiseEvent("addreactioncompleted", new People.RecentActivity.ReactionActionCompletedEventArgs(this, result, reaction, userState));

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.uiAddReactionEnd, this._obj$1.objectInfo, info);
};

People.RecentActivity.ReactionCollection.prototype.onReactionRemoved = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a reaction was removed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(info != null, 'info != null');

    var reaction = null;

    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        // remove it from the collection, and decrease the total count.
        this._totalCount$1--;
        reaction = this._removeByInfo$1(info);

        Debug.assert(reaction != null, 'reaction');

        this.onPropertyChanged('TotalCount');
    }
    else {
        // create a dummy reaction.
        reaction = new People.RecentActivity.Reaction(this._network$1, info);
    }

    this.raiseEvent("removereactioncompleted", new People.RecentActivity.ReactionActionCompletedEventArgs(this, result, reaction, userState));

    People.RecentActivity.Core.EtwHelper.writeReactionEvent(People.RecentActivity.Core.EtwEventName.uiRemoveReactionEnd, this._obj$1.objectInfo, info);
};

People.RecentActivity.ReactionCollection.prototype._containsInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <returns type="Boolean"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type.id === this._type$1.id, 'info.Type.Id == this.type.Id');

    return !Jx.isUndefined(this._map$1[this._getContactKey$1(info.publisher)]);
};

People.RecentActivity.ReactionCollection.prototype._addByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <returns type="People.RecentActivity.Reaction"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type.id === this._type$1.id, 'info.Type.Id == this.type.Id');

    var key = this._getContactKey$1(info.publisher);
    if (!!Jx.isUndefined(this._map$1[key])) {
        var reaction = this._createAndAddToMap$1(info);
        this.addInternal(reaction);

        return reaction;
    }

    return this._map$1[key];
};

People.RecentActivity.ReactionCollection.prototype._createAndAddToMap$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <returns type="People.RecentActivity.Reaction"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type.id === this._type$1.id, 'info.Type.Id == this.type.Id');

    // create a new reaction, and add it to the map and collection.
    var reaction = new People.RecentActivity.Reaction(this._network$1, info);
    var keyContact = this._getContactKey$1(info.publisher);
    this._map$1[keyContact] = reaction;

    return reaction;
};

People.RecentActivity.ReactionCollection.prototype._removeByInfo$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo"></param>
    /// <returns type="People.RecentActivity.Reaction"></returns>
    Debug.assert(info != null, 'info != null');
    Debug.assert(info.type.id === this._type$1.id, 'info.Type.Id == this.type.Id');

    var key = this._getContactKey$1(info.publisher);
    if (!Jx.isUndefined(this._map$1[key])) {
        // remove the entry that we just mapped to.
        var reaction = this._map$1[key];
        delete this._map$1[key];
        this.removeInternal(reaction);

        return reaction;
    }

    return null;
};

People.RecentActivity.ReactionCollection.prototype._getContactKey$1 = function(info) {
    /// <param name="info" type="People.RecentActivity.Core.create_contactInfo"></param>
    /// <returns type="String"></returns>
    Debug.assert(info != null, 'info != null');

    return info.sourceId + ':' + info.id;
};

People.RecentActivity.ReactionCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets the <see cref="T:People.RecentActivity.Reaction" /> at the given index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index of the item.</param>
    /// <param name="value" type="People.RecentActivity.Reaction"></param>
    /// <returns type="People.RecentActivity.Reaction"></returns>
    Debug.assert((index >= 0) && (index < this.count), '(index >= 0) && (index < this.Count)');

    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ETW\EtwEventName.js" />
/// <reference path="..\Core\ETW\EtwHelper.js" />
/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ResultInfo.js" />
/// <reference path="ActionState.js" />
/// <reference path="Collection.js" />
/// <reference path="Events\RefreshActionCompletedEventArgs.js" />
/// <reference path="FeedObject.js" />
/// <reference path="Network.js" />
/// <reference path="ReactionCollection.js" />

People.RecentActivity.ReactionTypeCollection = function(provider, network, obj) {
    /// <summary>
    ///     Provides a collection of reaction types.
    /// </summary>
    /// <param name="provider" type="People.RecentActivity.Core.IFeedProvider">The provider.</param>
    /// <param name="network" type="People.RecentActivity.Network">The network.</param>
    /// <param name="obj" type="People.RecentActivity.FeedObject">The feed object.</param>
    /// <field name="_provider$1" type="People.RecentActivity.Core.IFeedProvider">The feed provider.</field>
    /// <field name="_network$1" type="People.RecentActivity.Network">The feed.</field>
    /// <field name="_obj$1" type="People.RecentActivity.FeedObject">The feed object.</field>
    /// <field name="_map$1" type="Object">A map.</field>
    People.RecentActivity.Collection.call(this);

    Debug.assert(network != null, 'network != null');
    Debug.assert(obj != null, 'obj != null');
    Debug.assert(provider != null, 'provider != null');

    this._network$1 = network;
    this._obj$1 = obj;
    this._provider$1 = provider;
    this._map$1 = {};

    // initialize the collections, one for each reaction type.
    var types = this._network$1.capabilities.reactions;

    for (var i = 0, len = types.length; i < len; i++) {
        var collection = new People.RecentActivity.ReactionCollection(this._provider$1, this._network$1, obj, types[i]);
        this.addInternal(collection);
        this._map$1[types[i].id] = collection;
    }

    // also initialize the total number of reactions.
    this.updateDetails(obj.objectInfo.reactionDetails);

    // and don't forget to initialize the first batch of reactions (if any.)
    this._addRangeByInfo$1(obj.objectInfo.reactions);
};

Jx.inherit(People.RecentActivity.ReactionTypeCollection, People.RecentActivity.Collection);

Debug.Events.define(People.RecentActivity.ReactionTypeCollection.prototype, "refreshcompleted");

People.RecentActivity.ReactionTypeCollection.prototype._provider$1 = null;
People.RecentActivity.ReactionTypeCollection.prototype._network$1 = null;
People.RecentActivity.ReactionTypeCollection.prototype._obj$1 = null;
People.RecentActivity.ReactionTypeCollection.prototype._map$1 = null;
People.RecentActivity.ReactionTypeCollection.prototype._isDisposed = false;

Object.defineProperty(People.RecentActivity.ReactionTypeCollection.prototype, "network", {
    get: function() {
        /// <summary>
        ///     Gets the network.
        /// </summary>
        /// <value type="People.RecentActivity.Network"></value>
        return this._network$1;
    }
});

People.RecentActivity.ReactionTypeCollection.prototype.dispose = function () {
    /// <summary>Disposes the collection.</summary>
    if (!this._isDisposed) {
        this._isDisposed = true;

        // dispose each child collection.
        for (var i = this.count - 1; i >= 0; i--) {
            this.item(i).dispose();
        }

        // clear references, clean up map.
        People.Social.clearKeys(this._map$1);

        this._network$1 = null;
        this._obj$1 = null;
        this._provider$1 = null;
    }
};

People.RecentActivity.ReactionTypeCollection.prototype.refresh = function(userState) {
    /// <summary>
    ///     Refreshes the reactions, loading additional reactions and deleting old ones.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    var objectInfo = this._obj$1.objectInfo;
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRefreshReactionsStart, objectInfo);
    this._provider$1.refreshReactions(objectInfo, People.RecentActivity.create_actionState(this._obj$1, userState));
};

People.RecentActivity.ReactionTypeCollection.prototype.updateDetails = function(details) {
    /// <summary>
    ///     Updates the details.
    /// </summary>
    /// <param name="details" type="Array" elementType="reactionDetailsInfo">The details.</param>
    Debug.assert(details != null, 'details != null');
    for (var i = 0, len = details.length; i < len; i++) {
        var id = details[i].id;
        if (!Jx.isUndefined(this._map$1[id])) {
            // update the total count on the collection.
            this._map$1[id].updateDetails(details[i]);
        }    
    }
};

People.RecentActivity.ReactionTypeCollection.prototype.onRefreshCompleted = function(result, reactionsToAdd, reactionsToRemove, userState) {
    /// <summary>
    ///     Invokes the <see cref="E:People.RecentActivity.ReactionTypeCollection.RefreshCompleted" /> event.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="reactionsToAdd" type="Array" elementType="reactionInfo">The reactions to add.</param>
    /// <param name="reactionsToRemove" type="Array" elementType="reactionInfo">The reactions to remove.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(reactionsToAdd != null, 'reactionsToAdd != null');
    Debug.assert(reactionsToRemove != null, 'reactionsToRemove != null');
    var updated = false;
    if (result.code === People.RecentActivity.Core.ResultCode.success) {
        this._addRangeByInfo$1(reactionsToAdd);
        this._removeRangeByInfo$1(reactionsToRemove);
        updated = (reactionsToAdd.length > 0) || (reactionsToRemove.length > 0);
    }

    this.raiseEvent("refreshcompleted", new People.RecentActivity.RefreshActionCompletedEventArgs(this, result, updated, userState));
    People.RecentActivity.Core.EtwHelper.writeFeedObjectEvent(People.RecentActivity.Core.EtwEventName.uiRefreshReactionsEnd, this._obj$1.objectInfo);
};

People.RecentActivity.ReactionTypeCollection.prototype.onReactionAdded = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a reaction was added.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(info != null, 'info != null');
    if (!Jx.isUndefined(this._map$1[info.type.id])) {
        this._map$1[info.type.id].onReactionAdded(result, info, userState);
    }
};

People.RecentActivity.ReactionTypeCollection.prototype.onReactionRemoved = function(result, info, userState) {
    /// <summary>
    ///     Occurs when a reaction was removed.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultInfo">The result.</param>
    /// <param name="info" type="People.RecentActivity.Core.create_reactionInfo">The info.</param>
    /// <param name="userState" type="Object">The user state.</param>
    Debug.assert(info != null, 'info != null');
    if (!Jx.isUndefined(this._map$1[info.type.id])) {
        this._map$1[info.type.id].onReactionRemoved(result, info, userState);
    }
};

People.RecentActivity.ReactionTypeCollection.prototype._addRangeByInfo$1 = function(reactions) {
    /// <param name="reactions" type="Array" elementType="reactionInfo"></param>
    Debug.assert(reactions != null, 'reactions != null');
    // separate the reactions into buckets and then for each bucket add
    // the entries to the appropriate collection.
    var buckets = this._getBuckets$1(reactions);
    if (Object.keys(buckets).length > 0) {
        for (var k in buckets) {
            var entry = { key: k, value: buckets[k] };
            this._map$1[entry.key].addRangeByInfo(entry.value);
        }    
    }
};

People.RecentActivity.ReactionTypeCollection.prototype._removeRangeByInfo$1 = function(reactions) {
    /// <param name="reactions" type="Array" elementType="reactionInfo"></param>
    Debug.assert(reactions != null, 'reactions != null');
    // separate the reactions into buckets and then for each bucket remove
    // the entries from the appropriate collection.
    var buckets = this._getBuckets$1(reactions);
    if (Object.keys(buckets).length > 0) {
        for (var k in buckets) {
            var entry = { key: k, value: buckets[k] };
            this._map$1[entry.key].removeRangeByInfo(entry.value);
        }    
    }
};

People.RecentActivity.ReactionTypeCollection.prototype._getBuckets$1 = function(reactions) {
    /// <param name="reactions" type="Array" elementType="reactionInfo"></param>
    /// <returns type="Object"></returns>
    var buckets = {};
    for (var i = 0, len = reactions.length; i < len; i++) {
        var reaction = reactions[i];
        var id = reaction.type.id;
        if (!Jx.isUndefined(this._map$1[id])) {
            // store this reaction in the appropriate bucket.
            var list = null;
            if (!Jx.isUndefined(buckets[id])) {
                list = buckets[id];
            }
            else {
                list = [];
                buckets[id] = list;
            }

            list.push(reaction);
        }    
    }

    return buckets;
};

People.RecentActivity.ReactionTypeCollection.prototype.item = function(index) {
    /// <summary>
    ///     Gets a <see cref="T:People.RecentActivity.ReactionCollection" /> by index.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The index.</param>
    /// <param name="value" type="People.RecentActivity.ReactionCollection"></param>
    /// <returns type="People.RecentActivity.ReactionCollection"></returns>
    Debug.assert((index >= 0) && (index < this.count), '(index >= 0) && (index < this.Count)');
    return this.items[index];
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\shared\WinJS\WinJS.ref.js" />
/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\ResultCode.js" />
/// <reference path="..\Core\ShareOperationInfo.js" />
/// <reference path="Events\ShareOperationActionCompletedEventArgs.js" />

People.RecentActivity.ShareOperationParser = function(shareData, parseOrder) {
    /// <summary>
    ///     Handles the processing of share operations.
    /// </summary>
    /// <param name="shareData" type="Windows.ApplicationModel.DataTransfer.DataPackageView">The share operation.</param>
    /// <param name="parseOrder" type="Array" elementType="String">The array of string format IDs that specifies the order of processing.</param>
    /// <field name="_shareData" type="Windows.ApplicationModel.DataTransfer.DataPackageView">The share data.</field>
    /// <field name="_parseOrder" type="Array" elementType="String">The array of format IDs that specifies the order of processing.</field>
    /// <field name="_result" type="People.RecentActivity.Core.ResultCode">The parser result.</field>
    /// <field name="_shareInfo" type="People.RecentActivity.Core.create_shareOperationInfo">The parsed share info.</field>
    /// <field name="_userState" type="Object">The passed in user state.</field>
    Debug.assert(parseOrder != null, 'parseOrder');
    this._shareData = shareData;
    this._parseOrder = parseOrder;
};

Jx.mix(People.RecentActivity.ShareOperationParser.prototype, Jx.Events);
Jx.mix(People.RecentActivity.ShareOperationParser.prototype, People.Social.Events);

Debug.Events.define(People.RecentActivity.ShareOperationParser.prototype, "completed");

People.RecentActivity.ShareOperationParser.prototype._shareData = null;
People.RecentActivity.ShareOperationParser.prototype._parseOrder = null;
People.RecentActivity.ShareOperationParser.prototype._result = 0;
People.RecentActivity.ShareOperationParser.prototype._shareInfo = null;
People.RecentActivity.ShareOperationParser.prototype._userState = null;

Object.defineProperty(People.RecentActivity.ShareOperationParser.prototype, "result", {
    get: function() {
        /// <summary>
        ///     Gets the result of the parse operation.
        /// </summary>
        /// <value type="People.RecentActivity.Core.ResultCode"></value>
        return this._result;
    }
});

Object.defineProperty(People.RecentActivity.ShareOperationParser.prototype, "shareInfo", {
    get: function() {
        /// <summary>
        ///     Gets the parsed share info.
        /// </summary>
        /// <value type="People.RecentActivity.Core.create_shareOperationInfo"></value>
        return this._shareInfo;
    }
});

People.RecentActivity.ShareOperationParser.prototype.process = function(userState) {
    /// <summary>
    ///     Process the share data.
    /// </summary>
    /// <param name="userState" type="Object">The user state.</param>
    this._userState = userState;
    this._parseInternal(0);
};

People.RecentActivity.ShareOperationParser.prototype._parseInternal = function(index) {
    /// <summary>
    ///     Parse each type, one at a time.
    /// </summary>
    /// <param name="index" type="Number" integer="true">The current index in the order list.</param>
    var that = this;
    
    if (index >= this._parseOrder.length) {
        this._onCompleted(People.RecentActivity.Core.ResultCode.failure, null);
        return;
    }

    var format = this._parseOrder[index];
    if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink) {
        this._shareData.getWebLinkAsync().done(function(value) {
            var linkUri = value;
            if (linkUri != null) {
                var scheme = linkUri.schemeName.toUpperCase();
                if ((scheme === 'HTTP') || (scheme === 'HTTPS')) {
                    that._onCompleted(People.RecentActivity.Core.ResultCode.success, People.RecentActivity.Core.create_shareOperationInfo(format, linkUri, that._shareData));
                    return null;
                }            
            }

            // skip on to the next one.
            that._parseInternal(index + 1);
            return null;
        }, this._onPromiseError);
    }
    else {
        this._parseInternal(index + 1);
    }
};

People.RecentActivity.ShareOperationParser.prototype._onCompleted = function(result, shareInfo) {
    /// <summary>
    ///     Raises the completed event.
    /// </summary>
    /// <param name="result" type="People.RecentActivity.Core.ResultCode">The result.</param>
    /// <param name="shareInfo" type="People.RecentActivity.Core.create_shareOperationInfo">The share info.</param>
    this._result = result;
    this._shareInfo = shareInfo;
    this.raiseEvent("completed", new People.RecentActivity.ShareOperationActionCompletedEventArgs(this, result, shareInfo, this._userState));
};

People.RecentActivity.ShareOperationParser.prototype._onPromiseError = function(e) {
    /// <summary>
    ///     Handles the promise errors.
    /// </summary>
    /// <param name="e" type="Error">The error.</param>
    /// <returns type="WinJS.Promise"></returns>
    Jx.log.write(2, 'An error occurred while trying to get the share data: ' + e.message);
    this._onCompleted(People.RecentActivity.Core.ResultCode.failure, null);
    return null;
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Providers\FeedProviderFactory.js" />
/// <reference path="..\Providers\IdentityType.js" />
/// <reference path="Identity.js" />
/// <reference path="NetworkCollection.js" />

People.RecentActivity.TemporaryIdentity = function(contactInfo) {
    /// <summary>
    ///     Provides an identity for temporary contacts.
    /// </summary>
    /// <param name="contactInfo" type="People.RecentActivity.Core.create_temporaryContactInfo">The contact info.</param>
    /// <field name="_contact$1" type="People.RecentActivity.Core.create_temporaryContactInfo">The contact info.</field>
    People.RecentActivity.Identity.call(this, contactInfo.objectId, People.RecentActivity.Providers.IdentityType.contact);
    this._contact$1 = contactInfo;
};

Jx.inherit(People.RecentActivity.TemporaryIdentity, People.RecentActivity.Identity);


People.RecentActivity.TemporaryIdentity.prototype._contact$1 = null;

Object.defineProperty(People.RecentActivity.TemporaryIdentity.prototype, "isTemporary", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is a temporary contact.
        /// </summary>
        /// <value type="Boolean"></value>
        return true;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.TemporaryIdentity.prototype, "name", {
    get: function() {
        /// <summary>
        ///     Gets the name.
        /// </summary>
        /// <value type="String"></value>
        return this._contact$1.name;
    },
    configurable: true
});

People.RecentActivity.TemporaryIdentity.prototype.getDataContext = function() {
    /// <summary>
    ///     Gets the data context.
    /// </summary>
    /// <returns type="Object"></returns>
    return this._contact$1;
};

People.RecentActivity.TemporaryIdentity.prototype.onEnsureNetworks = function() {
    /// <summary>
    ///     Ensures that there are networks.
    /// </summary>
    /// <returns type="People.RecentActivity.NetworkCollection"></returns>
    // fetch the single network.
    var network = People.RecentActivity.Providers.FeedProviderFactory.instance.getNetwork(this._contact$1.objectSourceId);
    var networks = new People.RecentActivity.NetworkCollection(this);
    networks.addByInfo(network);
    return networks;
};

People.RecentActivity.TemporaryIdentity.prototype.onRefreshNetworks = function() {
    /// <summary>
    ///     Refreshes the networks for this identity.
    /// </summary>
    // We should ignore this request for temporary contacts.
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="ContactCache.js" />
/// <reference path="Identity.js" />



People.RecentActivity.TestHooks = function() {
    /// <summary>
    ///     Functions to be used by test cases.
    /// </summary>
};

People.RecentActivity.TestHooks.clearContactCache = function() {
    /// <summary>
    ///     Clear the ContactCache.
    /// </summary>
    People.RecentActivity.ContactCache.clear();
};

People.RecentActivity.TestHooks.ensureIdentityCreatesFactory = function(identity) {
    /// <summary>
    ///     Ensures that the given <see cref="T:People.RecentActivity.Identity" /> object creates a new factory.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity.</param>
    Debug.assert(identity != null, 'identity != null');
    identity.ensureFactory();
};

People.RecentActivity.TestHooks.ensureNetworksCreatesProvider = function(identity) {
    /// <summary>
    ///     Ensures that a network creates a new feed provider.
    /// </summary>
    /// <param name="identity" type="People.RecentActivity.Identity">The identity holding on to the networks.</param>
    Debug.assert(identity != null, 'identity != null');
    for (var i = 0, len = identity.networks.count; i < len; i++) {
        identity.networks.item(i).ensureProvider();
    }
};


;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Providers\IdentityType.js" />
/// <reference path="Configuration.js" />
/// <reference path="Identity.js" />

People.RecentActivity.WhatsNewIdentity = function() {
    /// <summary>
    ///     Represents the What's New identity.
    /// </summary>
    People.RecentActivity.Identity.call(this, People.RecentActivity.Configuration.whatsNewPersonId, People.RecentActivity.Providers.IdentityType.person);
};

Jx.inherit(People.RecentActivity.WhatsNewIdentity, People.RecentActivity.Identity);

Object.defineProperty(People.RecentActivity.WhatsNewIdentity.prototype, "isWhatsNew", {
    get: function() {
        /// <summary>
        ///     Gets a value indicating whether this is the What's New identity.
        /// </summary>
        /// <value type="Boolean"></value>
        return true;
    },
    configurable: true
});

Object.defineProperty(People.RecentActivity.WhatsNewIdentity.prototype, "name", {
    get: function() {
        /// <summary>
        ///     Gets the name.
        /// </summary>
        /// <value type="String"></value>
        throw new Error("Cannot get name of What's New identity.");
    },
    configurable: true
});

People.RecentActivity.WhatsNewIdentity.prototype.getDataContext = function() {
    /// <summary>
    ///     Gets the data context.
    /// </summary>
    /// <returns type="Object"></returns>
    throw new Error("Cannot get data context of What's New identity.");
};
});