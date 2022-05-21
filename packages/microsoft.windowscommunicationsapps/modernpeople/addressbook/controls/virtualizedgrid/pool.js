
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

Jx.delayDefine(People.Grid, "Pool", function () {

     /// <disable>JS2076.IdentifierIsMiscased</disable>
     var P = window.People,
         G = P.Grid,
         S = P.Sequence;

     var Pool = G.Pool = /* @constructor */ function (place) {
         /// <summary>
         /// Pool represents a pool of anything.  It returns items in
         /// LIFO order. One can retrieve things from the pool by
         /// calling 'pop'. One returns them to the pool via 'push'.
         /// </summary>
         /// <param name="place" type="Function">The function that groups items into buckets</param>
         this._factory = null;
         this._place = place;
         this._buckets = {};
     };
     /// <enable>JS2076.IdentifierIsMiscased</enable>

     Pool.prototype.setFactory = function (factory) {
         /// <param name="factory" type="P.Callback">Sets the factory callback for creating new items</param>
         Debug.assert(this._factory === null);
         this._factory = factory;
     };

     Pool.prototype.forEach = function (fn, /*@dynamic*/context) {
         /// <summary> Apply function on each item in the pool </summary>
         /// <param name="fn" type="Function"></param>
         /// <param name="context" optional="true">function context</param>
         var buckets = this._buckets;
         for (var i in buckets) {
             buckets[i].forEach(fn, context);
         }
     };

     Pool.prototype.containsItem = function (item) {
         /// <summary> Test whether the pool contains item</summary>
         /// <param name="item" type="Object" />
         var buckets = this._buckets;
         for (var k in buckets) {
             if (buckets[k].indexOf(item) !== -1) {
                 return true;
             }
         }
         return false;
     };

     Pool.prototype.findItem = /*@dynamic*/function (test, context) {
         /// <summary> Find item in pool via test function </summary>
         /// <returns> null if not found</returns>
         /// <param name="test" type="Function"></param>
         /// <param name="context" type="Object">function context</param>
         var buckets = this._buckets;
         for (var i in buckets) {
             var bucket = buckets[i],
                 index = S.findIndex(bucket, test, context);

             if (index !== -1) {
                 return bucket[index];
             }
         }
         return null;
     };

     Pool.prototype.get = /*@dynamic*/function (bucketKey) {
         var /*@type(Array)*/bucket = this._buckets[bucketKey];
         return (bucket !== undefined && bucket.length !== 0) ? bucket.pop() : this.pop();
     };

     Pool.prototype.pop = /*@dynamic*/function () {
         /// <summary> Pop an item from the bucket with the most items</summary>
         var buckets = this._buckets,
             /*@type(Array)*/maxBucket = null,
             maxLen = 0;

         for (var i in buckets) {
             var bucket = buckets[i],
                 len = bucket.length;
             if (len > maxLen) {
                 maxBucket = bucket;
                 maxLen = len;
             }
         }

         return maxBucket !== null ? maxBucket.pop() : this._factory.invoke();
     };

     Pool.prototype.push = function (/*@dynamic*/item) {
         /// <summary> Return item back into pool </summary>
         /// <param name="item">An item of the same type returned by this._factory</param>
         var buckets = this._buckets,
             bucketKey = this._place(item),
             bucket = buckets[bucketKey];
         
         if (bucket === undefined) {
             bucket = buckets[bucketKey] = [];
         }

         bucket.push(item);
     };
     
});
