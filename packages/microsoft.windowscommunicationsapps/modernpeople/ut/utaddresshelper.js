
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Include*/

Include.initializeFileScope(function () {
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    // Shortcut for the changing namespace
    var P = People;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var throwOnAssert = null;

    function setup () {
        
        throwOnAssert = Debug.throwOnAssert;
        Debug.throwOnAssert = true;
        
        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }
        if (!Jx.loc) {
            Jx.loc = {
                getString: function () { return 'not initialized'; }
            };
        }
    }

    function cleanup () {
        
        Debug.throwOnAssert = throwOnAssert;
        
        // Set back to the default
        P.LocaleHelper.setLocale(null);
    }

    Tx.test("addressHelperTests.test_addressEditFieldOrdering", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var testData =
        {
            "en-US": 0,
            "en-AU": 0,
            "en-GB": 0,
            "pt-br": 0,
            "pt-pt": 0,
            "ru": 0,
            "ru-ru": 0,
            "ru-mo": 0,
            "en-JP": 1,
            "ja-JP": 1,
            "zh-TW": 1,
            "ko-KP": 2,
            "ko-KR": 2,
            "zh-CN": 2,
            "zh-hk": 0,
            "zh-sg": 0,
            "it-IT": 3,
            "it-CH": 3,
            "nl-be": 3,
            "nl-nl": 3,
            "fr": 3,
            "fr-fr": 3,
            "fr-ca": 0,
            "fr-be": 3,
            "fr-lu": 3,
            "fr-ch": 3,
            "de-de": 3,
            "de-at": 3,
            "de-li": 3,
            "de-lu": 3,
            "de-ch": 3,
            "pl": 3,
            "es-ar": 3,
            "es-bo": 3,
            "es-cl": 3,
            "es-co": 3,
            "es-cr": 3,
            "es-do": 3,
            "es-ec": 3,
            "es-sv": 3,
            "es-gt": 3,
            "es-hn": 3,
            "es-mx": 3,
            "es-ni": 3,
            "es-pa": 3,
            "es-py": 3,
            "es-pe": 3,
            "es-pr": 3,
            "es-es": 3,
            "es-uy": 3,
            "es-ve": 3,
            "ab-cd": 0,
            "uz-uz": 0,
            "sv-se": 0,
            "ro-ro": 0,
            "": 0,
            "-": 0,
            "-$$": 0,
            "Invalid-Locale": 0
        };

        var helper = new P.AddressHelper();

        for (var key in testData) {
            P.LocaleHelper.setLocale(key);
            tc.areEqual(testData[key], helper.getAddressEditFieldOrder(), "Testing - " + key);
        }

    });

    Tx.test("addressHelperTests.test_addressEditFieldOrderingStrings", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var testData =
        {
            // Default ordering
            "en-US": ["street", "city", "state", "zipCode", "country"],
            // Order 1 (zh-TW, JP)
            "ja-JP": ["zipCode", "state", "city", "street", "country"],
            // Order 1 (ko, zh-CN)
            "zh-CN": ["state", "city", "street", "zipCode", "country"],
            // Order 2 (It, nl, fr, de, pl, es)
            "it-IT": ["street", "zipCode", "city", "state", "country"]
        };
        var helper = new P.AddressHelper();

        for (var key in testData) {
            P.LocaleHelper.setLocale(key);
            var expected = testData[key];
            var actual = helper.getAddressEditFieldOrderStrings();
            tc.areEqual(expected.length, actual.length, "Testing - " + key);
            for (var lp = 0; lp < expected.length; lp++) {
                tc.areEqual(expected[lp], actual[lp], "Testing - " + key);
            }
        }
    });

    function _testFormatting(tc, helper, testData) {
        var count = testData.length;
        for (var lp = 0; lp < count; lp++) {
            var data = testData[lp];

            tc.areEqual(data.expected, helper.formatViewAddressAsString(data.address, false));
        }
    }

    Tx.test("addressHelperTests.test_addressViewFieldOrderingStrings", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var testData =
        {
            // Default ordering
            "en-US": ["street", "city", "state", "zipCode", "country"],

            "it-XX": ["street", "city", "state", "zipCode", "country"],
            "de-XX": ["street", "city", "state", "zipCode", "country"],
            "de-AU": ["street", "city", "state", "zipCode", "country"],

            // Order 1 (zh-TW, JP)
            "zh-TW": ["zipCode", "state", "city", "street", "country"],
            "ja-JP": ["zipCode", "state", "city", "street", "country"],
            "en-JP": ["zipCode", "state", "city", "street", "country"],
            // Order 1 (ko, zh-CN)
            "zh-CN": ["state", "city", "street", "zipCode", "country"],
            
            // Order 2 (It, nl, fr, de, pl, es)
            "it-IT": ["street", "zipCode", "city", "state", "country"],
            "de-DE": ["street", "zipCode", "city", "state", "country"],
            "fr-FR": ["street", "zipCode", "city", "state", "country"],
            "ko-KR": ["country", "state", "city", "street", "zipCode" ],
            "ko-KP": ["country", "state", "city", "street", "zipCode"],
            "nl-BE": ["street", "zipCode", "city", "state", "country"],
            "nl-NL": ["street", "zipCode", "city", "state", "country"],
            "pl-PL": ["street", "zipCode", "city", "state", "country"],
            "pt-BR": ["street", "city", "state", "country", "zipCode"],
            "ru-RU": ["street", "city", "state", "country", "zipCode"],
            "zh-CN": ["country", "state", "city", "street", "zipCode" ],
            "es-ES": ["street", "zipCode", "city", "state", "country"],
            "es-AR": ["street", "zipCode", "city", "state", "country"],
            "es-BO": ["street", "zipCode", "city", "state", "country"],
            "es-PE": ["street", "zipCode", "city", "state", "country"],
            "es-VE": ["street", "zipCode", "city", "state", "country"],
            "es-GT": ["street", "zipCode", "city", "state", "country"]
        };

        var helper = new P.AddressHelper();

        for (var key in testData) {
            P.LocaleHelper.setLocale(key);
            var expected = testData[key];
            var actual = helper.getAddressViewFieldOrderStrings();
            tc.areEqual(expected.length, actual.length, "Testing - " + key);
            for (var lp = 0; lp < expected.length; lp++) {
                tc.areEqual(expected[lp], actual[lp], "Testing - " + key);
            }
        }
    });

    Tx.test("addressHelperTests.test_defaultAddressViewAsString", function (tc) {
        tc.cleanup = cleanup;
        setup();

        P.LocaleHelper.setLocale("en-US");
        var helper = new P.AddressHelper();

        // ["#street", "\n", "#city", ", ", "#state", " ", "#zipCode", "\n", "#country"];
        var testData = [
            {
                address: {},
                expected: ""
            },
            {
                address: {
                    street: "One Microsoft Way"
                },
                expected: "One Microsoft Way"
            },
            {
                address: {
                    street: "One Microsoft Way\nOffice 123"
                },
                expected: "One Microsoft Way\nOffice 123"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond"
                },
                expected: "One Microsoft Way\nRedmond"
            },
            {
                address: {
                    street: "Office 123\nOne Microsoft Way",
                    city: "Redmond"
                },
                expected: "Office 123\nOne Microsoft Way\nRedmond"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA"
                },
                expected: "One Microsoft Way\nRedmond, WA"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA",
                    zipCode: "98052"
                },
                expected: "One Microsoft Way\nRedmond, WA 98052"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA",
                    zipCode: "98052",
                    country: "United States"
                },
                expected: "One Microsoft Way\nRedmond, WA 98052\nUnited States"
            },
            {
                address: {
                    country: "United States"
                },
                expected: "United States"
            },
            {
                address: {
                    state: "WA"
                },
                expected: "WA"
            },
            {
                address: {
                    city: "Redmond"
                },
                expected: "Redmond"
            },
            {
                address: {
                    zipCode: "98052"
                },
                expected: "98052"
            },
            {
                address: {
                    state: "WA",
                    zipCode: "98052"
                },
                expected: "WA 98052"
            },
            {
                address: {
                    city: "Redmond",
                    zipCode: "98052"
                },
                expected: "Redmond, 98052"
            },
            {
                address: {
                    city: "Redmond",
                    state: "WA"
                },
                expected: "Redmond, WA"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    country: "United States"
                },
                expected: "One Microsoft Way\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    country: "United States"
                },
                expected: "One Microsoft Way\nRedmond\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    state: "WA",
                    country: "United States"
                },
                expected: "One Microsoft Way\nWA\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    zipCode: "98052",
                    country: "United States"
                },
                expected: "One Microsoft Way\n98052\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way\n",
                    zipCode: "98052",
                    country: "United States"
                },
                expected: "One Microsoft Way\n98052\nUnited States"
            }
        ];

        _testFormatting(tc, helper, testData);
    });

    Tx.test("addressHelperTests.test_zhTWAddressViewAsString", function (tc) {
        tc.cleanup = cleanup;
        setup();

        P.LocaleHelper.setLocale("zh-TW");
        var helper = new P.AddressHelper();

        // Chinese - Traditional - Taiwan
        // 1. Postal Code
        // 2. City + Address1
        // 3. [Address 2]
        // "zh-TW": ["#zipCode", "\n", "#state", "#city", "#street", "\n", "#country"],
        var testData = [
            {
                address: {},
                expected: ""
            },
            {
                address: {
                    street: "One Microsoft Way"
                },
                expected: "One Microsoft Way"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond"
                },
                expected: "RedmondOne Microsoft Way"
            },
            {
                address: {
                    street: "One Microsoft Way\n",
                    city: "Redmond"
                },
                expected: "RedmondOne Microsoft Way"
            },
            {
                address: {
                    street: "Office 123\nOne Microsoft Way",
                    city: "Redmond"
                },
                expected: "RedmondOffice 123\nOne Microsoft Way"
            },
            {
                address: {
                    street: "Office 123\nOne Microsoft Way\n",
                    city: "Redmond"
                },
                expected: "RedmondOffice 123\nOne Microsoft Way"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA"
                },
                expected: "WARedmondOne Microsoft Way"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA",
                    zipCode: "98052"
                },
                expected: "98052\nWARedmondOne Microsoft Way"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA",
                    zipCode: "98052",
                    country: "United States"
                },
                expected: "98052\nWARedmondOne Microsoft Way\nUnited States"
            },
            {
                address: {
                    country: "United States"
                },
                expected: "United States"
            },
            {
                address: {
                    state: "WA"
                },
                expected: "WA"
            },
            {
                address: {
                    city: "Redmond"
                },
                expected: "Redmond"
            },
            {
                address: {
                    zipCode: "98052"
                },
                expected: "98052"
            },
            {
                address: {
                    state: "WA",
                    zipCode: "98052"
                },
                expected: "98052\nWA"
            },
            {
                address: {
                    city: "Redmond",
                    zipCode: "98052"
                },
                expected: "98052\nRedmond"
            },
            {
                address: {
                    city: "Redmond",
                    state: "WA"
                },
                expected: "WARedmond"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    country: "United States"
                },
                expected: "One Microsoft Way\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    country: "United States"
                },
                expected: "RedmondOne Microsoft Way\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    state: "WA",
                    country: "United States"
                },
                expected: "WAOne Microsoft Way\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    zipCode: "98052",
                    country: "United States"
                },
                expected: "98052\nOne Microsoft Way\nUnited States"
            }
        ];

        _testFormatting(tc, helper, testData);
    });

    Tx.test("addressHelperTests.test_nlAddressViewAsString", function (tc) {
        tc.cleanup = cleanup;
        setup();

        P.LocaleHelper.setLocale("nl-NL");
        var helper = new P.AddressHelper();

        // Dutch (Netherlands, Belgium)
        // 1. Address1
        // 2. [Address2]
        // 3. PostalCode CITY
        // 4. Country
        //"nl-??": ["#street", "\n", "#zipCode", " ", "%city", "\n", "#state", "\n", "#country"],
        var testData = [
            {
                address: {},
                expected: ""
            },
            {
                address: {
                    street: "One Microsoft Way"
                },
                expected: "One Microsoft Way"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond"
                },
                expected: "One Microsoft Way\nREDMOND"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA"
                },
                expected: "One Microsoft Way\nREDMOND\nWA"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA",
                    zipCode: "98052"
                },
                expected: "One Microsoft Way\n98052 REDMOND\nWA"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    state: "WA",
                    zipCode: "98052",
                    country: "United States"
                },
                expected: "One Microsoft Way\n98052 REDMOND\nWA\nUnited States"
            },
            {
                address: {
                    country: "United States"
                },
                expected: "United States"
            },
            {
                address: {
                    state: "WA"
                },
                expected: "WA"
            },
            {
                address: {
                    city: "Redmond"
                },
                expected: "REDMOND"
            },
            {
                address: {
                    zipCode: "98052"
                },
                expected: "98052"
            },
            {
                address: {
                    state: "WA",
                    zipCode: "98052"
                },
                expected: "98052\nWA"
            },
            {
                address: {
                    city: "Redmond",
                    zipCode: "98052"
                },
                expected: "98052 REDMOND"
            },
            {
                address: {
                    city: "Redmond",
                    state: "WA"
                },
                expected: "REDMOND\nWA"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    country: "United States"
                },
                expected: "One Microsoft Way\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    city: "Redmond",
                    country: "United States"
                },
                expected: "One Microsoft Way\nREDMOND\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    state: "WA",
                    country: "United States"
                },
                expected: "One Microsoft Way\nWA\nUnited States"
            },
            {
                address: {
                    street: "One Microsoft Way",
                    zipCode: "98052",
                    country: "United States"
                },
                expected: "One Microsoft Way\n98052\nUnited States"
            }
        ];

        _testFormatting(tc, helper, testData);
    });

});
