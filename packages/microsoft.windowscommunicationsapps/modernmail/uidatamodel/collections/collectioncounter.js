
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Collection.js" />

Jx.delayDefine(Mail, "CollectionCounter", function () {
    "use strict";

    var defaultMax = 999,
        defaultDelay = 200, // msec
        overflowGlyph = "\u207a"; // special '+'

    Mail.CollectionCounter = /*@constructor*/function (/*@type(Mail.Collection)*/collection, /*@optional*/max, /*@optional*/delay) {
        /// <summary>This class monitors the count of items in a collection and batches the
        /// changes. Additionally, it provides for a max count and overflow glyph, useful for
        /// pieces of the UI that show things like 999+.</summary>
        Mail.CollectionWrapper.call(this, collection, "count:" + collection.name);

        this._max = max || defaultMax;
        this._delay = delay || defaultDelay;
        this._timer = null;
        this._onTimeout = this._onTimeout.bind(this);
    };

    Jx.inherit(Mail.CollectionCounter, Mail.CollectionWrapper);

    Mail.CollectionCounter.prototype.dispose = function () {
        if (this._collection) {
            Mail.CollectionWrapper.prototype.dispose.call(this);
            clearTimeout(this._timer);
            Jx.dispose(this._collection);
            this._collection = null;
        }
    };

    Object.defineProperty(Mail.CollectionCounter.prototype, "displayCount", { get: function () {
        var count = this._collection.count;
        return count > 0 ? String(Math.min(count, this._max)) : "";
    }, enumerable: true });

    Object.defineProperty(Mail.CollectionCounter.prototype, "overflowGlyph", { get: function () {
        return this._collection.count > this._max ? overflowGlyph : "";
    }, enumerable: true });

    Mail.CollectionCounter.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this._collection.count);
        return this._collection[index];
    };

    Mail.CollectionCounter.prototype._onCollectionChanged = function (/*@dynamic*/ev) {
        if (ev.eType === Microsoft.WindowsLive.Platform.CollectionChangeType.reset) {
            // Fire reset events immediately
            clearTimeout(this._timer);
            this._onTimeout();
        } else if (!this._timer) {
            // Start a new batched update
            this._timer = setTimeout(this._onTimeout, this._delay);
        }
    };

    Mail.CollectionCounter.prototype._onTimeout = function () {
        // Fire a collection reset event to signal the count changed
        this._timer = null;
        this._raiseChange({ eType: Microsoft.WindowsLive.Platform.CollectionChangeType.reset });
    };
});

