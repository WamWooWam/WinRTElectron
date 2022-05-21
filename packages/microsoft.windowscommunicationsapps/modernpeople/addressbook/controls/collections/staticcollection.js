
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/JSUtil/Hydration.js"/>
/// <reference path="BaseCollection.js"/>
/// <reference path="CollectionItem.ref.js" />

/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>

Jx.delayDefine(People, "StaticCollection", function () {
    "use strict";
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.StaticCollection = /* @constructor*/function (items, collectionName) {
        ///<summary>This is an implementation of Collection that is static backed by an array</summary>
        ///<param name="items" type="Array">An array of controls to be rendered</param>
        ///<param name="collectionName" type="String">An identifier for debugging</param>
        P.Collection.call(this, collectionName);
        Debug.assert(Array.isArray(items));
        this._items = items;
        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.StaticCollection, P.Collection);
    P.StaticCollection.prototype.getItem = function (index) {
        /// <summary>Retreives an item from the collection by index</summary>
        /// <param name="index" type="Number"/>
        /// <returns type="Object"/>
        Debug.assert(this.isLoaded, "Attempting to retrieve items from collection [" + this.name + "] before it is loaded");
        return this._items[index];
    };

    P.StaticCollection.prototype.load = function () {
        ///<summary>With a StaticCollection there is nothing to load asyncronously</summary>
    };
    P.StaticCollection.prototype.hydrate = function () {
        ///<summary>With a StaticCollection there is nothing to hydrate</summary>
    };
    P.StaticCollection.prototype.dehydrate = function () {
        ///<summary>With a StaticCollection there is nothing to dehydrate</summary>
    };
    P.StaticCollection.prototype.dispose = function () {
        ///<summary>With a StaticCollection there is nothing to dispose</summary>
    };
    P.StaticCollection.prototype.loadComplete = function () {
        /// <summary>Marks the collection as loaded</summary>
        Debug.assert(!this.isLoaded, "Attempting to mark collection [" + this.name + "] as loaded redundantly");
        this.length = this._items.length;

        this.isLoaded = true;
        this.raiseEvent("load", { target: this, length: this.length });
    };
    P.StaticCollection.prototype.acceptPendingChanges = function () {
        // The StaticCollection does not support making changes after construction,
        // so acceptPendingChanges is a no-op.
    };
});

