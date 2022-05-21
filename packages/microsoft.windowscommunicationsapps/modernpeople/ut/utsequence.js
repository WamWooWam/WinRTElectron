
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,window,Include*/

Include.initializeFileScope(function () {
    var P = window.People,
        S = P.Sequence;

    // Simple equality test that uses context parameter
    function test(candidate) {
        return candidate === this.value;
    }

    Tx.test("sequenceTests.testFindIndex", function (tc) {
        var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        for (var i = 0; i < 12; ++i) {
            tc.areEqual(arr.indexOf(i), S.findIndex(arr, test, {value: i }));
        }
    });

    Tx.test("sequenceTests..testIsSequenceEqual", function (tc) {
        tc.isTrue(S.isSequenceEqual([],[]));
        tc.isTrue(S.isSequenceEqual([1,2,3], [1,2,3]));
        tc.isFalse(S.isSequenceEqual([1,2,3,4], [1,2,3]));
        tc.isFalse(S.isSequenceEqual([1,3,2], [1,2,3]));
    });

    Tx.test("sequenceTests..testRemoveIf", function (tc) {
        var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            copy = arr.slice();
        S.removeIf(arr, test, { value: 1 });
        tc.isTrue(S.isSequenceEqual(arr, copy.slice(1,copy.length)));
        S.removeIf(arr, function(a) { return a <= 9 && a >= 3; });
        tc.isTrue(S.isSequenceEqual(arr, [2,10]));
    });

});
