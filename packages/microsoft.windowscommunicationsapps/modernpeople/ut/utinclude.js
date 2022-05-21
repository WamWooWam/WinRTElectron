
// Copyright (C) Microsoft Corporation.  All rights reserved.

(function () {

    Tx.test("include_UnitTest.test_replacePaths", function (tc) {
        var testData = [
            ["foo", "foo"],
            ["$(modernRoot)", "../.."],
            ["modernRoot)", "modernRoot)"],
            ["$(peopleShared)", "../../people/shared"],
            ["$(modernRoot)/$(peopleRoot)", "../../../../people"],
        ];

        // Override root, since in WWA this may be different from IE.
        Include._replacements.modernRoot = "../..";
        Include._replacements.peopleRoot = "$(modernRoot)/people";

        for (var i = 0; i < testData.length; i++) {
            tc.areEqual(testData[i][1], Include.replacePaths(testData[i][0]));
        }
    });
})();