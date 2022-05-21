
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Namespace.js" />
/// <reference path="../../../Shared/Jx/core/Jx.js" />

/// <disable>JS2039.DoNotReturnUndefined,JS2052.UsePrefixOrPostfixOperatorsConsistently,JS3092.DeclarePropertiesBeforeUse</disable>

// Sequence: Provides helper functions operating on array-like structures: find, remove, removeIf, copy, append, insert.

Jx.delayDefine(People, "Sequence", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        Sequence = P.Sequence = {};
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var concat = Array.prototype.concat,
        indexOf = Array.prototype.indexOf,
        splice = Array.prototype.splice,
        push = Array.prototype.push;

    var append = Sequence.append = function (sequence, sequenceToAppend) {
        /// <summary>Destructively add an array (sequenceToAppend) to the end of an existing array (sequence)</summary>
        /// <param name="sequence" type="Array">The array to which to append</param>
        /// <param name="sequenceToAppend" type="Array">The array we are adding</param>
        /// <returns type="Array">The resulting array</returns>
        push.apply(sequence, sequenceToAppend);
        return sequence;
    };

    Sequence.insert = function (sequence, index, sequenceToInsert) {
        /// <summary> Destructively insert an array's items into an existing array at a specified index.  Splice
        /// requires individual items be passed to it.  This simplifies the call by calling splice.apply with the 
        /// appropriate parameters. </summary>
        /// <param name="sequence" type="Array">The array into which to insert</param>
        /// <param name="index" type="Number">The index where we want to insert</param>
        /// <param name="sequenceToInsert" type="Array">The array we are inserting</param>
        /// <returns type="Array">The resulting array</returns>
        splice.apply(sequence, append([index, 0], sequenceToInsert));
        return sequence;
    };

    Sequence.flatten = function (sequence) {
        /// <summary> Return a flattened array of individual items or arrays.  Only flattens one level deep:
        /// e.g. flatten([1,[2,3],4,[5,6],[[7,8]]]) returns [1,2,3,4,5,6,[7,8]]
        ///      flatten([]) returns []
        /// </summary>
        /// <param name="sequence" type="Array">The array to flatten</param>
        /// <returns type="Array">The resulting array</returns>
        return concat.apply([], sequence);
    };

    Sequence.binarySearch = function (sequence, /*@dynamic*/item, compare, /*@dynamic*/context) {
        /// <summary>Returns the largest index for which (compare(item,sequence[i]) >= 0).
        ///  If there is no item such that compare returns a value >= 0, it returns -1.</summary>
        /// <param name="sequence" type="Array">The sequence on which to iterate</param>
        /// <param name="item">The item to pass to the compare along with the candidate item</param>
        /// <param name="compare" type="Function">The compare function. Expected to return a negative 
        /// integer, 0, or a positive integer.</param>
        /// <param name="context" optional="true">The context parameter in which
        /// to call the test function</param>
        var beg = -1,
            end = sequence.length - 1;

        while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);

            if (compare.call(context, item, sequence[mid]) >= 0) {
                beg = mid;
            } else {
                end = mid - 1;
            }
        }
        return beg;
    };

    var findIndex = Sequence.findIndex = function (rg, fnTest, /*@dynamic*/context) {
        /// <summary> Returns -1 if item not found, and the index if found. </summary>
        /// <param name="rg" type="Array">The sequence on which to iterate</param>
        /// <param name="fnTest" type="Function">The 'find' function</param>
        /// <param name="context" optional="true" >The context object for the find function</param>
        for (var i = 0, len = rg.length; i < len; ++i) {
            if (fnTest.call(context, rg[i], i)) {
                return i;
            }
        }
        return -1;
    };

    Sequence.find = function (rg, fnTest, /*@dynamic*/context) {
        /// <summary> Returns undefined if item is found, and the item if found. </summary>
        /// <param name="rg" type="Array">The sequence on which to iterate</param>
        /// <param name="fnTest" type="Function">The 'find' function</param>
        /// <param name="context" optional="true">The context object for the find function</param>
        var index = findIndex(rg, fnTest, context);
        return index !== -1 ? rg[index] : undefined;
    };

    Sequence.isSequenceEqual = function (rg1, rg2) {
        /// <summary>Compares the elements of two sequences for equality using the provided comparator</summary>
        /// <param name="rg1" type="Array">The sequence to compare</param>
        /// <param name="rg2" type="Array">The sequence to compare</param>
        if (rg1 === rg2) { 
            return true;
        }

        var len1 = rg1.length;
        var len2 = rg2.length;
        if (len1 !== len2) {
            return false;
        }

        for (var i = 0; i < len1; ++i) {
            if (rg1[i] !== rg2[i]) {
                return false;
            }
        }

        return true;
    };

    Sequence.last = function (sequence) {
        /// <summary>Returns the last item in a sequence</summary>
        /// <param name="sequence" type="Array"></param>
        return sequence[sequence.length - 1]; 
    };

    Sequence.removeIf = function Sequence_removeIf(sequence, test, /*@dynamic*/context) {
        /// <summary> A destructive filter (alters the given sequence).  Equivalent to:
        /// sequence = sequence.filter(function (x) { return !fnTest(x); });
        /// but more efficient. </summary>
        /// <param name="sequence" type="Array">The sequence on which to iterate</param>
        /// <param name="test" type="Function">The test function</param>
        /// <param name="context" optional="true">The context object for the test function</param>
        var start = -1;
        for (var i = 0, len = sequence.length; i < len; ++i) {
            if (test.call(context, sequence[i], i)) {
                if (start === -1) {
                    start = i;
                }
            } else if (start !== -1) {
                var count = i - start;
                splice.call(sequence, start, count);
                len -= count;
                i -= count;
                start = -1;
            }
        }
        if (start !== -1) {
            sequence.length = start;
        }
    };

    Sequence.remove = function Sequence_remove(sequence, /*@dynamic*/item) {
        /// <summary> Remove item if it is in the array.  Only removes first occurence. </summary>
        /// <param name="sequence" type="Array">The sequence on which to iterate</param>
        /// <param name="item">The item to remove</param>
        var index = indexOf.call(sequence, item);
        if (index !== -1) {
            return splice.call(sequence, index, 1)[0];
        }
        return undefined;
    };

    Sequence.compareBy = function (prop, fn) {
        /// <summary>
        /// Return a comparison function accessing 'prop' of the objects being compared
        /// </summary>
        /// <param name="prop" type="String">The property to access</param>
        /// <param name="fn" type="Function" optional="true">An optional comparison function</param>
        if (!fn) {
            return function (a, b) { return a[prop] - b[prop]; };
        } else {
            return function (a, b) { return fn(a[prop], b[prop]); };
        }
    };

    Sequence.compareByAccessor = function (fnAcc) {
        return function (a, b) { return fnAcc(a) - fnAcc(b); };
    };

    Sequence.difference = function (a, b) {
        return a - b;
    };

    Sequence.value = function (key) { return this[key]; };

    Sequence.identity = function (x) { return x; };

});
