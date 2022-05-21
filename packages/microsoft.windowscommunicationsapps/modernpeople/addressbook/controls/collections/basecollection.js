
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="Windows.ApplicationModel.Contacts.js" />

/// <reference path="../../../Shared/JSUtil/Include.js" />
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="CollectionItem.ref.js"/>
/// <reference path="../../../../shared/Jx/Core/Jx.dep.js" />

Jx.delayDefine(People, "Collection", function () {
    
    "use strict";
    var P = window.People;

    P.Collection = /* @constructor*/function (collectionName) {
        /// <summary>This is a base class that represents an array of CollectionItems.  It supports deferred queries and
        /// dehydration.</summary>
        this.initEvents();

        this.name = collectionName;

        // Specifies the number of items in the collection.  Although it is available as a field for fast access, it should
        // not be written to by consuming code.
        this.length = 0;

        // Determines whether the collection remembers a length from a previous session.  In most cases, this will be
        // sufficient to perform initial layout.  Actual data and correct counts will become available when the load 
        // event fires.
        this.isHydrated = false;

        // Determines whether the collection has been loaded.  When this is false, the length may be valid as a result of
        // dehydration information, but getItem should not be called.  The consumer should call load to request that the
        // collection load its data.  A "load" event will be fired when that completes, at which point the length may have
        // changed and getItem can be called freely.  Like length, this property should not be written to by consuming code.
        this.isLoaded = false;
    };
    Jx.inherit(P.Collection, Jx.Events); 
    Debug.Events.define(P.Collection.prototype, "load", "changesPending", "changesApplied");



    P.Collection.prototype.getItem = function (index) {
        /// <summary>Retreives an item from the collection by index</summary>
        /// <param name="index" type="Number"/>
        /// <returns type="P.CollectionItem"/>
        Debug.assert(false, "Collection.getItem should be overridden in derived types");
    };
    P.Collection.prototype.load = function (jobSet) {
        /// <summary>Requests that the collection load its data</summary>
        /// <param name="jobSet" type="P.JobSet">A JobSet that can be used to queue I/O to the scheduler</param>
        Debug.assert(false, "Collection.load should be overridden in derived types if they support delayed loading");
    };
    P.Collection.prototype.hydrate = function (data) {
        /// <summary>Requests that the collection quickly rehydrate itself from stored state</summary>
        /// <param name="data" type="Object">The object returned from the last call to dehydrate</param>
        /// <returns type="Boolean">Returns true if the collection could be rehydrated, false if not</returns>
        Debug.assert(false, "Collection.hydrate should be overridden in derived types");
    };
    P.Collection.prototype.dehydrate = function () {
        /// <summary>Requests that the collection store state for future rehydration</summary>
        /// <returns type="Object">The value to pass to the next call to hydrate</returns>
        Debug.assert(false, "Collection.dehydrate should be overridden in derived types");
    };
    P.Collection.prototype.acceptPendingChanges = function () {
        /// <summary>Applies buffered-up changes to the collection and returns them</summary>
        Debug.assert(false, "Collection.acceptPendingChanges should be overridden in derived types");        
    };
    P.Collection.prototype.replace = function (/*@dynamic*/replacement, jobSet) {
        /// <summary>Optional method for performing an inline replacement of the collection contents. Not all collections
        /// will implement this. Useful for operations such as search or filter where we want to dynamically change the
        /// contents of a collection but not throw away the actual collection.</summary>
        /// <param name="replacement">The replacement object, specific to each collection implementation.</param>
        /// <param name="jobSet" type="P.JobSet"/>
        Debug.assert(false, "Collection.replace should be overridden in derived types");
    };


    P.Collection.prototype.dispose = function () {
        /// <summary>Cleans up the collection</summary>
    };

});
