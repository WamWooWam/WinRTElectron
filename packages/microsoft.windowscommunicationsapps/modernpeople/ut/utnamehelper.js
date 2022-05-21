
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Include,Debug*/

Include.initializeFileScope(function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
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


    Tx.test("nameHelperTests.test_basicNameOrder", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.NameHelper();

        var locales = {
            "en-US": true,
            "be-BY": false,
            "en-ID": false,  
            "hu-HU": false,
            "ja-JP": false,
            "en-AU": true,
            "kk-KZ": false,
            "km-KH": false,
            "ko-KR": false,
            "ky-KG": false,
            "ru-RU": false,
            "uk-UA": false,
            "vi-VN": false,
            "zh-CN": false,
            "zh-HK": false,
            "zh-TW": false,
            "en-GB": true
        };

        for (var loc in locales) {
            P.LocaleHelper.setLocale(loc);
            tc.isTrue(helper.IsFirstLast() === locales[loc], "Checking [" + loc + "]");
        }
    });

    Tx.test("nameHelperTests.test_LanguageLocales", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.NameHelper();

        var locales = {
            "en-US": true,
            "xx-BY": true,
            "xx-ID": true,  
            "xx-HU": true,
            "en-JP": true,
            "xx-KZ": true,
            "xx-KH": true,
            "xx-KR": true,
            "xx-KG": true,
            "xx-RU": true,
            "xx-UA": true,
            "xx-VN": true,
            "xx-CN": true,
            "xx-HK": true,
            "xx-TW": true
        };

        for (var loc in locales) {
            P.LocaleHelper.setLocale(loc);
            tc.isTrue(helper.IsFirstLast() === locales[loc], "Checking [" + loc + "]");
        }
    });

    Tx.test("nameHelperTests.test_RegionLocales", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.NameHelper();

        var locales = {
            "en-US": true,
            "be-XX": true,
            "en-XX": true,  
            "hu-XX": true,
            "ja-XX": true,
            "en-XX": true,
            "kk-XX": true,
            "km-XX": true,
            "ko-XX": true,
            "ky-XX": true,
            "ru-XX": true,
            "uk-XX": true,
            "vi-XX": true,
            "zh-XX": true,
            "en-XX": true
        };

        for (var loc in locales) {
            P.LocaleHelper.setLocale(loc);
            tc.isTrue(helper.IsFirstLast() === locales[loc], "Checking [" + loc + "]");
        }
    });

});