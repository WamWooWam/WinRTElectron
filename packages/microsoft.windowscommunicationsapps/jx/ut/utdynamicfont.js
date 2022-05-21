
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\views\datepicker\DatePickerAnchor.js" />

/*jshint browser:true*/
/*global Tx,Jx*/

(function() {
    var host;
    var origGetInputLanguages;

    var DF = Jx.DynamicFont;

    function setup() {
        host = document.getElementById("host");
        origGetInputLanguages = DF._getApplicationLanguages;
    }
 
    function cleanup() {
        DF._getApplicationLanguages = origGetInputLanguages;
        host.innerText = "";
        host = null;
    }

    function compareLists(lhs, rhs) {
        var same = false;
        var llen = lhs.length;
        var rlen = rhs.length;

        if (llen === rlen) {
            for (var i = 0; i < llen && lhs[i] === rhs[i]; ++i) {}
            
            same = (i === llen);
        }

        return same;
    }

    function mockGetInputLanguages(languages) {
        DF._getApplicationLanguages = function () {
            return languages;
        };
    }

    function runLanguageResolveCases(tc, cases) {
        // process each test case
        for (var i = 0, len = cases.length; i < len; ++i) {
            var testCase = cases[i];

            // clear cached results to force new calculation
            DF.resetPrimaryAndAuthoringFonts();

            // mock the call to get the current language list
            mockGetInputLanguages(testCase.languages);

            // load the languages
            DF._calculateFonts();

            // check primary and authoring fonts
            tc.isTrue(compareLists(testCase.primaryFonts, DF._primaryFontFamily), "(primary) " + testCase.comment);
            tc.isTrue(compareLists(testCase.authoringFonts, DF._authoringFontFamily), "(authoring) " + testCase.comment);
        }
    }

    /*
        Tests
    */
    Tx.test("DynamicFont.testSingleLanguageFonts",  { owner: "anselr" }, function(tc) {
        /// <summary>tests getting the font family settings for a few languages</summary>

        tc.cleanup = cleanup;
        setup();

        var cases = [
            {
                comment: "en-US, maps to und (not found in mapping)",
                languages: ["en-US"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"],
            },
            {
                comment: "ja, direct lookup",
                languages: ["ja"], 
                primaryFonts: ["Color Emoji", "Meiryo UI", "Segoe UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Meiryo", "Calibri", "Segoe UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"],
            },
            {
                comment: "zh-Hant-hk, uses alias",
                languages: ["zh-Hant-hk"], 
                primaryFonts: ["Color Emoji", "Microsoft JhengHei UI", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Microsoft JhengHei UI", "Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Malgun Gothic", "sans-serif"],
            },
            {
                comment: "zh-Hans-cn, uses alias",
                languages: ["zh-Hans-cn"], 
                primaryFonts: ["Color Emoji", "Microsoft YaHei UI", "Segoe UI", "Meiryo UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Microsoft YaHei UI", "Calibri", "Segoe UI", "Meiryo", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"],
            },
            {
                comment: "sd-arab-pk, maps to und-arab (direct reference to und-arab)",
                languages: ["sd-arab-pk"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Arial", "Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
            },
        ];

        runLanguageResolveCases(tc, cases);
    });

    Tx.test("DynamicFont.testMultiLanguageFonts",  { owner: "anselr" }, function(tc) {
        /// <summary>tests getting the font family settings when a few languages are set</summary>

        tc.cleanup = cleanup;
        setup();

        var cases = [
            {
                comment: "en-US, ja, zh-Hans-cn, zh-Hant-hk",
                languages: ["en-US", "ja", "zh-Hans-cn", "zh-Hant-hk"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Calibri", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Segoe UI", "Malgun Gothic", "sans-serif"],
            },
            {
                comment: "en-US, zh-Hans-cn, ja, zh-Hant-hk",
                languages: ["en-US", "zh-Hans-cn", "ja", "zh-Hant-hk"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Microsoft YaHei UI", "Meiryo UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Calibri", "Microsoft YaHei UI", "Meiryo", "Microsoft JhengHei UI", "Segoe UI", "Malgun Gothic", "sans-serif"],
            },
            {
                comment: "en-US, zh-Hans-cn, zh-Hant-hk, ja",
                languages: ["en-US", "zh-Hans-cn", "zh-Hant-hk", "ja"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Meiryo UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Calibri", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Meiryo", "Segoe UI", "Malgun Gothic", "sans-serif"],
            },
            {
                comment: "en-US, zh-Hant-hk, zh-Hans-cn, ja",
                languages: ["en-US", "zh-Hant-hk", "zh-Hans-cn", "ja"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Microsoft JhengHei UI", "Microsoft YaHei UI", "Meiryo UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Calibri", "Microsoft JhengHei UI", "Microsoft YaHei UI", "Meiryo", "Segoe UI", "Malgun Gothic", "sans-serif"],
            },
        ];

        runLanguageResolveCases(tc, cases);
    });

    Tx.test("DynamicFont.testIgnoreExtensions",  { owner: "anselr" }, function(tc) {
        /// <summary>tests language strings that require pruning trailing -values</summary>

        tc.cleanup = cleanup;
        setup();

        var cases = [
            {
                comment: "zh-Hans-cn-ca-chinese",
                languages: ["zh-Hans-cn-ca-chinese"], 
                primaryFonts: ["Color Emoji", "Microsoft YaHei UI", "Segoe UI", "Meiryo UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
                authoringFonts: ["Color Emoji", "Microsoft YaHei UI", "Calibri", "Segoe UI", "Meiryo", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"],
            },
        ];

        runLanguageResolveCases(tc, cases);
    });

    Tx.test("DynamicFont.testNonUiFontFamilies",  { owner: "anselr" }, function(tc) {
        /// <summary>tests configurations that differ due to having non-ui font specifications</summary>

        tc.cleanup = cleanup;
        setup();

        var cases = [
            {
                comment: "th, en",
                languages: ["th", "en"], 
                primaryFonts: ["Color Emoji", "Leelawadee", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
                authoringFonts: ["Color Emoji", "Browallia New", "Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
            },
            {
                comment: "en, th",
                languages: ["en", "th"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Leelawadee", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
                authoringFonts: ["Color Emoji", "Calibri", "Leelawadee UI", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic"],
            },
            {
                comment: "km, en",
                languages: ["km", "en"], 
                primaryFonts: ["Color Emoji", "Khmer UI", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
                authoringFonts: ["Color Emoji", "DaunPenh", "Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
            },
            {
                comment: "en, km",
                languages: ["en", "km"], 
                primaryFonts: ["Color Emoji", "Segoe UI", "Khmer UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
                authoringFonts: ["Color Emoji", "Calibri", "Leelawadee UI", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic"],
            },
            {
                comment: "km, th",
                languages: ["km", "th"], 
                primaryFonts: ["Color Emoji", "Khmer UI", "Leelawadee", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic"],
                authoringFonts: ["Color Emoji", "DaunPenh", "Leelawadee UI", "Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI"],
            },
            {
                comment: "th, km",
                languages: ["th", "km"], 
                primaryFonts: ["Color Emoji", "Leelawadee", "Khmer UI", "Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic"],
                authoringFonts: ["Color Emoji", "Browallia New", "Leelawadee UI", "Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI"],
            },
        ];

        runLanguageResolveCases(tc, cases);
    });

})();