
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


    Tx.test("localeHelperTests.test_basicLocaleDecode", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.LocaleHelper();

        P.LocaleHelper.setLocale("en-US");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

        P.LocaleHelper.setLocale("en-AU");
        tc.areEqual("en-AU", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("AU", helper.region);

        P.LocaleHelper.setLocale("zh-TW");
        tc.areEqual("zh-TW", helper.locale);
        tc.areEqual("zh", helper.language);
        tc.areEqual("TW", helper.region);

        P.LocaleHelper.setLocale("en-US");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

        P.LocaleHelper.setLocale("en-AU");
        tc.areEqual("en-AU", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("AU", helper.region);

        P.LocaleHelper.setLocale("zh-TW");
        tc.areEqual("zh-TW", helper.locale);
        tc.areEqual("zh", helper.language);
        tc.areEqual("TW", helper.region);

        P.LocaleHelper.setLocale("en-AU");
        tc.areEqual("en-AU", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("AU", helper.region);

        P.LocaleHelper.setLocale("en-US");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

    });

    Tx.test("localeHelperTests.test_caseLocaleDecode", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.LocaleHelper();

        P.LocaleHelper.setLocale("en-Us");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

        P.LocaleHelper.setLocale("En-Au");
        tc.areEqual("en-AU", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("AU", helper.region);

        P.LocaleHelper.setLocale("zh-tw");
        tc.areEqual("zh-TW", helper.locale);
        tc.areEqual("zh", helper.language);
        tc.areEqual("TW", helper.region);

        P.LocaleHelper.setLocale("AB-CD");
        tc.areEqual("ab-CD", helper.locale);
        tc.areEqual("ab", helper.language);
        tc.areEqual("CD", helper.region);

    });

    Tx.test("localeHelperTests.test_emptyLocaleDecode", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.LocaleHelper();

        P.LocaleHelper.setLocale("");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

        // NOTE: This test *may* break if run under WWA and the default locale is NOT en-US
        P.LocaleHelper.setLocale(null);
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

    });

    Tx.test("localeHelperTests.test_decodePartialLocale", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.LocaleHelper();

        P.LocaleHelper.setLocale("en");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

        P.LocaleHelper.setLocale("");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

        P.LocaleHelper.setLocale("zh");
        tc.areEqual("zh-ZH", helper.locale);
        tc.areEqual("zh", helper.language);
        tc.areEqual("ZH", helper.region);

        P.LocaleHelper.setLocale("ko");
        tc.areEqual("ko-KO", helper.locale);
        tc.areEqual("ko", helper.language);
        tc.areEqual("KO", helper.region);

        P.LocaleHelper.setLocale("ru");
        tc.areEqual("ru-RU", helper.locale);
        tc.areEqual("ru", helper.language);
        tc.areEqual("RU", helper.region);

        P.LocaleHelper.setLocale("-CD");
        tc.areEqual("en-CD", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("CD", helper.region);

        P.LocaleHelper.setLocale("-");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

    });

    Tx.test("localeHelperTests.test_plocCrylLanguage", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var helper = new P.LocaleHelper();

        P.LocaleHelper.setLocale("ja-ploc-jp");
        tc.areEqual("ja-JP", helper.locale);
        tc.areEqual("ja", helper.language);
        tc.areEqual("JP", helper.region);

        P.LocaleHelper.setLocale("sr-cyrl-ba");
        tc.areEqual("sr-BA", helper.locale);
        tc.areEqual("sr", helper.language);
        tc.areEqual("BA", helper.region);

        P.LocaleHelper.setLocale("sr-cyrl-cs");
        tc.areEqual("sr-CS", helper.locale);
        tc.areEqual("sr", helper.language);
        tc.areEqual("CS", helper.region);

        P.LocaleHelper.setLocale("en-locr-us");
        tc.areEqual("en-US", helper.locale);
        tc.areEqual("en", helper.language);
        tc.areEqual("US", helper.region);

        P.LocaleHelper.setLocale("ca-es-valencia");
        tc.areEqual("ca-ES", helper.locale);
        tc.areEqual("ca", helper.language);
        tc.areEqual("ES", helper.region);

    });

});