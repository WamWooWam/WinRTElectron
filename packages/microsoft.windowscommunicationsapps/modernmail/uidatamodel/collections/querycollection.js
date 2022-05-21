
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "QueryCollection", function () {
    "use strict";

    var QueryCollection = Mail.QueryCollection = /*@constructor*/function (fn, context, args, async, collectionName) {
        /// <summary>Executes a platform query and wraps the result in a mail collection. This
        /// is useful for getting the better iterators and the Jx.Events.addListener instead
        /// of the standard addEventListener requiring bind. Additionally, this class can take
        /// delay execution of the query at a specified priority if provided.</summary>
        Debug.assert(Jx.isFunction(fn));
        Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));
        Debug.assert(Jx.isNullOrUndefined(args) || Jx.isArray(args));
        Debug.assert(Jx.isNullOrUndefined(async) || Jx.isBoolean(async));
        Debug.assert(Jx.isNullOrUndefined(collectionName) || Jx.isNonEmptyString(collectionName));
        Mail.Collection.call(this, collectionName || "<query>");

        this._fn = fn;
        this._context = context;
        this._args = args;

        this._listener = null;
        this._collection = null;
        this._count = 0;
        this._async = async;

        if (!async) {
            this.execQuery();
            var collection = this._collection;
            this._count = collection ? collection.count : 0;
        }
    };
    Jx.inherit(QueryCollection, Mail.Collection);

    QueryCollection.prototype.dispose = function () {
        if (this._collection) {
            this._collection.removeEventListener("collectionchanged", this._listener);
            Jx.dispose(this._collection);
            this._collection = null;
        }
    };

    Object.defineProperty(QueryCollection.prototype, "count", { get: function () {
        return this._count;
    }, enumerable: true });

    QueryCollection.prototype.item = function (index) {
        Debug.assert(Jx.isObject(this._collection));
        return this._collection.item(index);
    };

    QueryCollection.prototype.unlock = function () {
        if (this.locked) {
            Mail.Collection.prototype.unlock.call(this);
            if (this._collection) {
                this._unlock();
            }
        }
    };

    QueryCollection.prototype._unlock = function () {
        var collection = this._collection;
        if (collection) {
            // If the query executed async, fire off a reset to signal query completion
            if (this._async && collection.count > 0) {
                this._count = collection.count;
                this._raiseChange({ eType: Microsoft.WindowsLive.Platform.CollectionChangeType.reset });
            }

            // Unlock the underlying collection for further updates
            Debug.assert(this._count === collection.count);
            collection.unlock();
        }
    };

    QueryCollection.prototype._onCollectionChanged = function (/*@dynamic*/ev) {
        // Keep our count in sync with the real collection
        var collection = this._collection;
        this._count = collection ? collection.count : 0;

        // Forward the event
        this._raiseChange({
            eType: ev.eType,
            objectId: ev.objectId,
            index: ev.index,
            previousIndex: ev.previousIndex
        });
    };

    QueryCollection.prototype.execQuery = function () {
        _markStart("execQuery:" + this._logString);
        Debug.assert(this._collection === null, "should not be able to execute the query twice");
        this._listener = this._onCollectionChanged.bind(this);
        var collection = this._collection = this._fn.apply(this._context, this._args);
        if (collection) {
            collection.addEventListener("collectionchanged", this._listener);
            if (!this.locked) {
                this._unlock();
            }
        }
        _markStop("execQuery:" + this._logString);
    };

    QueryCollection.prototype.keepInView = function () {
        return this._collection;
    };


    Mail.ScheduledQueryCollection = /*@constructor*/function (fn, context, args, priority, scheduler, desc) {
        /// <summary>Executes a platform query and wraps the result in a mail collection. This
        /// is useful for getting the better iterators and the Jx.Events.addListener instead
        /// of the standard addEventListener requiring bind. Additionally, this class can take
        /// delay execution of the query at a specified priority if provided.</summary>
        /// <param name='fn' type='Function' />
        /// <param name='context'/>
        /// <param name='args' type='Array' />
        /// <param name='priority' type='Object'/>
        /// <param name='scheduler' type='Jx.Scheduler'/>
        /// <param name='desc' type='String' />
        Debug.assert(Jx.isFunction(fn));
        Debug.assert(Jx.isArray(args));
        Debug.assert(Jx.isObject(scheduler));
        Debug.assert(scheduler.isValidPriority(priority));
        Mail.QueryCollection.call(this, fn, context, args, true /*async*/, desc);

        // Queue the query to execute later
        this._job = scheduler.addJob(null, priority, desc, this._onExecQuery, this);
    };
    Jx.inherit(Mail.ScheduledQueryCollection, QueryCollection);

    Mail.ScheduledQueryCollection.prototype.execQuery = function () {
        Jx.dispose(this._job);
        this._job = null;
        Mail.QueryCollection.prototype.execQuery.call(this);
    };

    Mail.ScheduledQueryCollection.prototype._onExecQuery = function () {
        Mail.QueryCollection.prototype.execQuery.call(this);
    };

    Mail.ScheduledQueryCollection.prototype.dispose = function () {
        Jx.dispose(this._job);
        this._job = null;
        Mail.QueryCollection.prototype.dispose.call(this);
    };

    function _markStart(str) {
        Jx.mark("Mail.QueryCollection." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.QueryCollection." + str + ",StopTA,Mail");
    }

});

