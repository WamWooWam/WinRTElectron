
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People*/

(function () {

    var P = People;
    
    Tx.test("appNavUnitTest.testBackStackHydration", function (tc) {

        // Verify that the back stack convertion is successful.
        // The back stack array gets converted to an object on suspension.
        // On resume, the object is restored to the back stack array.
        function verifyBackStackHydration(backStack) {
            var backStackToVerify = P.AppNav._rebuildBackStackFromObject(P.AppNav._convertBackStackToObject(backStack));
            for (var i = 0; i < backStack.length; i++) {
                tc.areEqual(JSON.stringify(backStack[i]), JSON.stringify(backStackToVerify[i]));
            }
        }
        
        var testData = [
            // Empty back stack
            [],
            // Single item on back stack
            [{}],
            // Single item on back stack
            [{page: "abc", id: "123", data: "%22%22"}],
            // Single item on back stack
            [{page: "abc", id: "123", property: "==&**<>"}],
            // Multiple items on stack
            [
                {page: "abc", id: "123", data: "%22%22"}, 
                {prop1: "value1", prop2: "value2"}
            ],
            // More items on stack
            [
                {page: "abc", id: "123", data: "%22%22"}, 
                {},
                {},
                {page: "abc", id: "123", data: "%22%22"},                 
                {prop1: "value1", prop2: "value2"}
            ]
        ];
        var backStackEmpty = [];
        verifyBackStackHydration(backStackEmpty);

        var backStackSingleItem1 = [{page: "abc", id: "123", data: "%22%22"}];
        verifyBackStackHydration(backStackSingleItem1);

        var backStackSingleItem2 = [{}];
        verifyBackStackHydration(backStackSingleItem2);
      
        for (var i = 0; i < testData.length; i++) {
            verifyBackStackHydration(testData[i]);
        }
    });

    Tx.test("appNavUnitTest.testAreSameLocations", function (tc) {
        var testData = [ 
            {
                loc1: {page: "viewab"},
                loc2: {page: "viewab"},
                result: true
            },

            // Location that contains all the keys for comparison
            {
                loc1: {page: "viewperson", id: "123", query: "text", data: "data value"},
                loc2: {page: "viewperson", id: "123", query: "text", data: "data value"},
                result: true
            },

            // Location that contains all the keys for comparison
            {
                loc1: {page: "viewperson", id: "123", query: "text", data: "data value1"},
                loc2: {page: "viewperson", id: "123", query: "text", data: "data value2"},
                result: false
            },

            // Properties other than the keys have no effect on comparison
            {
                loc1: {page: "viewperson", id: "123", query: "text", extra: "doesn't matter"},
                loc2: {page: "viewperson", id: "123", query: "text"},
                result: true
            },

            // Properties other than the keys have no effect on comparison
            {
                loc1: {page: "viewperson", id: "123", query: "text"},
                loc2: {page: "viewperson", id: "123", query: "text", extra: "doesn't matter"},
                result: true
            },

            // The first location is missing a key that is contained in the second location
            {
                loc1: {page: "viewperson", id: "123", query: "text"},
                loc2: {page: "viewperson", query: "text"},
                result: false
            },

            // The second location is missing a key that is contained in the first location
            {
                loc1: {page: "viewperson", id: "123", query: "text"},
                loc2: {page: "viewperson", query: "text"},
                result: false
            },

            // Empty strings are okay
            {
                loc1: {page: ""},
                loc2: {page: ""},
                result: true
            },

            // Null values are okay
            {
                loc1: {page: ""},
                loc2: {page: ""},
                result: true
            },

            // Null values are equal to empty strings
            {
                loc1: {page: ""},
                loc2: {page: null},
                result: true
            },

            // The first location contains a key property that is missing from the second location.
            // But the value for that property is empty string. So it shouldn't count.
            {
                loc1: {page: "viewperson", id: "123", query: ""},
                loc2: {page: "viewperson", id: "123"},
                result: true
            }
        ];

        for (var i = 0; i < testData.length; i++) {
            var testItem = testData[i];
            tc.areEqual(P.AppNav._areSameLocations(testItem.loc1, testItem.loc2), testItem.result);
        }
    });
    
})();