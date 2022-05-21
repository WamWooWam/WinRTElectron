
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People,Include*/

Include.initializeFileScope(function () {
    People.inPeopleApp = false;

    Tx.test("uriGeneratorTests.test_getUri", function (tc) {
        var dataObj = {
            x: 1,
            y: 2
        };
        var dataObj2 = {
            x: ",,",
            y: "&id=that"
        };
        var testData = [
            ["doit", "1", null, "wlpeople:doit,1,"],
            ["doit", "2", "", "wlpeople:doit,2,%22%22"],
            ["doit#", "0&#=", "", "wlpeople:doit%23,0%26%23%3D,%22%22"],
            ["doit", "000", "", "wlpeople:doit,000,%22%22"],
            ["abc", "5x-y", "{}", "wlpeople:abc,5x-y,%22%7B%7D%22"],
            ["abc", "id", '{"x":1}', "wlpeople:abc,id,%22%7B%5C%22x%5C%22%3A1%7D%22"],
            ["abc", "id", '{"x":1,"y":2}', "wlpeople:abc,id,%22%7B%5C%22x%5C%22%3A1%2C%5C%22y%5C%22%3A2%7D%22"],
            ["abc", "id", dataObj, "wlpeople:abc,id,%7B%22x%22%3A1%2C%22y%22%3A2%7D"],
            ["abc", "id", dataObj2, "wlpeople:abc,id,%7B%22x%22%3A%22%2C%2C%22%2C%22y%22%3A%22%26id%3Dthat%22%7D"]
       ];

        var i, len;
        for (i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][3], People.Nav.getUri(testData[i][0], testData[i][1], testData[i][2]));
        }

         // Set the in app nav flag to true
        People.inPeopleApp = true;
 
  
        testData = [
            ["doit", "1", null, "#page=doit&id=1&data="],
            ["doit", "2", "", "#page=doit&id=2&data=%22%22"],
            ["doit#", "0&#=", "", "#page=doit%23&id=0%26%23%3D&data=%22%22"],
            ["doit", "000", "", "#page=doit&id=000&data=%22%22"],
            ["abc", "5x-y", "{}", "#page=abc&id=5x-y&data=%22%7B%7D%22"],
            ["abc", "id", '{"x":1}', "#page=abc&id=id&data=%22%7B%5C%22x%5C%22%3A1%7D%22"],
            ["abc", "id", '{"x":1,"y":2}', "#page=abc&id=id&data=%22%7B%5C%22x%5C%22%3A1%2C%5C%22y%5C%22%3A2%7D%22"],
            ["abc", "id", dataObj, "#page=abc&id=id&data=%7B%22x%22%3A1%2C%22y%22%3A2%7D"],
            ["abc", "id", dataObj2, "#page=abc&id=id&data=%7B%22x%22%3A%22%2C%2C%22%2C%22y%22%3A%22%26id%3Dthat%22%7D"]
        ];
 
        for (i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][3], People.Nav.getUri(testData[i][0], testData[i][1], testData[i][2]));
        }

        // Revert to default value
        People.inPeopleApp = false;
    });

    Tx.test("uriGeneratorTests.test_getUriWithVerb", function (tc) {
        var i, len;
        var testData = [
            ["verbtest", "1", null, "addverb", "wlpeople:verbtest,1,,addverb"],
            ["verbtest", "2", null, "", "wlpeople:verbtest,2,,"],
            ["verbtest", "3", null, null, "wlpeople:verbtest,3,"]
        ];
        for (i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][4], People.Nav.getUri(testData[i][0], testData[i][1], testData[i][2], testData[i][3]));
        }

        // Set the in app nav flag to true
        People.inPeopleApp = true;

        testData = [
            ["verbtest", "1", null, "addverb", "#page=verbtest&id=1&data=&verb=addverb"],
            ["verbtest", "2", null, "", "#page=verbtest&id=2&data=&verb="],
            ["verbtest", "3", null, null, "#page=verbtest&id=3&data="]
        ];

        for (i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][4], People.Nav.getUri(testData[i][0], testData[i][1], testData[i][2], testData[i][3]));
        }

        // Revert to default value
        People.inPeopleApp = false;
    });

    Tx.test("uriGeneratorTests.test_getViewAddressBookUri", function (tc) {
        var testData = [
            [null, "wlpeople:viewab,,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][1], People.Nav.getViewAddressBookUri(testData[i][0]));
        }
    });

    Tx.test("uriGeneratorTests.test_getProfileDetailUri", function (tc) {
        var testData = [
            ["testid", null, "wlpeople:viewprofile,testid,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][2], People.Nav.getProfileDetailUri(testData[i][0], testData[i][1]));
        }
    });

    Tx.test("uriGeneratorTests.test_getEditProfileDetailUri", function (tc) {
        var testData = [
            ["testid", null, "wlpeople:editprofile,testid,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][2], People.Nav.getEditProfileDetailUri(testData[i][0], testData[i][1]));
        }
    });

    Tx.test("uriGeneratorTests.test_getCreateContactUri", function (tc) {
        var testData = [
            [null, "wlpeople:createcontact,,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][1], People.Nav.getCreateContactUri(testData[i][0]));
        }
    });

    Tx.test("uriGeneratorTests.test_getMeProfileUri", function (tc) {
        var testData = [
            [null, "wlpeople:viewmeprofile,,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][1], People.Nav.getMeProfileUri(testData[i][0]));
        }
    });

    Tx.test("uriGeneratorTests.test_getEditMePictureUri", function (tc) {
        var testData = [
            [null, "wlpeople:editmepicture,,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][1], People.Nav.getEditMePictureUri(testData[i][0]));
        }
    });

    Tx.test("uriGeneratorTests.test_getViewRAUri", function (tc) {
        var testData = [
            ["testid", null, "wlpeople:viewra,testid,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][2], People.Nav.getViewRAUri(testData[i][0], testData[i][1]));
        }
    });

    Tx.test("uriGeneratorTests.test_getRASelfpageUri", function (tc) {
        var testData = [
            ["RAid", null, "wlpeople:viewraitem,RAid,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][2], People.Nav.getRASelfpageUri(testData[i][0], testData[i][1]));
        }
    });

    Tx.test("uriGeneratorTests.test_getWhatsNewUri", function (tc) {
        var testData = [
            [null, "wlpeople:whatsnew,,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][1], People.Nav.getWhatsNewUri(testData[i][0]));
        }
    });

    Tx.test("uriGeneratorTests.test_getNotificationUri", function (tc) {
        var testData = [
            [null, "wlpeople:notification,,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][1], People.Nav.getNotificationUri(testData[i][0]));
        }
    });

    Tx.test("uriGeneratorTests.test_getLinkPersonUri", function (tc) {
        var testData = [
            ["testid", null, "wlpeople:linkperson,testid,"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][2], People.Nav.getLinkPersonUri(testData[i][0], testData[i][1]));
        }
    });

    Tx.test("uriGeneratorTests.test_getViewPersonUri", function (tc) {
        var testData = [
            ["testid", null, "wlpeople:viewperson,testid,"],
            [null, { id: "idRAFof12345", name: "Bob Joe", userTile: "http://www.live.com/xxx", userId: "facebook1234567", network: "FB" }, "wlpeople:viewperson,,%7B%22id%22%3A%22idRAFof12345%22%2C%22name%22%3A%22Bob%20Joe%22%2C%22userTile%22%3A%22http%3A//www.live.com/xxx%22%2C%22userId%22%3A%22facebook1234567%22%2C%22network%22%3A%22FB%22%7D"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][2], People.Nav.getViewPersonUri(testData[i][0], testData[i][1]));
        }
    });

    Tx.test("uriGeneratorTests.test_getViewPersonUriWithVerb", function (tc) {
        var testData = [
            ["testid", null, "verb", "wlpeople:viewperson,testid,,verb"],
            [null, { id: "idRAFof12345", name: "Bob Joe", userTile: "http://www.live.com/xxx", userId: "facebook1234567", network: "FB" }, "verb", "wlpeople:viewperson,,%7B%22id%22%3A%22idRAFof12345%22%2C%22name%22%3A%22Bob%20Joe%22%2C%22userTile%22%3A%22http%3A//www.live.com/xxx%22%2C%22userId%22%3A%22facebook1234567%22%2C%22network%22%3A%22FB%22%7D,verb"]
        ];

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][3], People.Nav.getViewPersonUri(testData[i][0], testData[i][1], testData[i][2]));
        }
    });

    Tx.test("uriGeneratorTests.test_getSearchUri", function (tc) {
        var testData = [
            { query: "xyz abc", locale: "en-us", expected: "#page=allcontacts&query=xyz%20abc&data=\"en-us\"" }
        ];

        // Set the in app nav flag to true
        People.inPeopleApp = true;

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i].expected, People.Nav.getAllContactsSearchUri(testData[i].query, testData[i].locale));
        }

        // Revert to default value
        People.inPeopleApp = false;
    });

    Tx.test("uriGeneratorTests.test_convertProtocolPathToHash", function (tc) {
        var testData = [
            // Empty path
            ["", null],

            // Invalid path
            ["  ", null],
            [" search", null],
            ["aaaa", null],
            ["aaaa,dkjdia#,,", null],

            // Pages that doesn't require id.
            // Notification page
            ["notification", "#page=notification&id=&data="],
            ["notification,", "#page=notification&id=&data="],
            ["notification,,", "#page=notification&id=&data="],
            // Tailing white spaces are trimmed
            ["notification  ", "#page=notification&id=&data="],
            // View Me page:
            ["viewme,1234,eeee", "#page=viewme&id=1234&data="],
            ["viewme,123,%7B%22x%22%3A1%2C%22y%22%3A2%7D", "#page=viewme&id=123&data=%7B%22x%22%3A1%2C%22y%22%3A2%7D"],
            ["viewme,1234,eeee,jjiehew", "#page=viewme&id=1234&data="],

            // Pages that require an id.
            // View profile page: does not check the validaty of the id
            ["viewprofile, ,", "#page=viewprofile&id=%20&data="],
            ["viewprofile, ,,", "#page=viewprofile&id=%20&data="],
            // View profile page: with id.
            ["viewprofile,123", "#page=viewprofile&id=123&data="],
            // View profile page: id with deep linking data
            ["viewprofile,123,%7B%22x%22%3A1%2C%22y%22%3A2%7D", "#page=viewprofile&id=123&data=%7B%22x%22%3A1%2C%22y%22%3A2%7D"],
            // View profile page: invalid deep linking data gets dropped
            ["viewprofile,123,%7B%22x%22%3A1%2C%22y%22%3A2%7D%7D", "#page=viewprofile&id=123&data="]
        ];

        // Set the in app nav flag to true
        People.inPeopleApp = true;

        for (var i = 0, len = testData.length; i < len; i++) {
            tc.areEqual(testData[i][1], People.Nav.convertProtocolPathToHash(testData[i][0]));
        }

        // Revert to default value
        People.inPeopleApp = false;
    });
});
