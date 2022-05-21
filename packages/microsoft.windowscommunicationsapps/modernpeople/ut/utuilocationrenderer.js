
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../../Shared/Jx/core/Jx.js"/>
/// <reference path="Scripts/TestMockIMePeople.js"/>

/*global Tx,People,Debug,Jx,document,Include*/

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
        
        P.LocaleHelper.setLocale(null);
    }

    function _findAllChildIds(element, ids) {
        var children = element.children;
        var count = children.length;
        for (var lp = 0; lp < count; lp++) {
            var child = children[lp];
            if (child.id) {
                ids.push(child.id);
            }
            _findAllChildIds(child, ids);
        }

        return ids;
    }

    Tx.test("UiLocationRendererTests.test_CheckDefinition", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var locationRenderer = P.UiFormRenderers.getRenderer("location");

        tc.isTrue(Boolean(locationRenderer));
        tc.isTrue(locationRenderer.field !== null);
        tc.isFalse(Boolean(locationRenderer.section));
    });

    Tx.test("UiLocationRendererTests.test_CheckFullFieldOrder", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var formData = {
            cssPrefix: "testStyle-",
            loc: { getString: function (locId) { return ""; } }
        };
        var uiForm = new P.UiForm(formData);

        var value = { street: "One Microsoft Way", city: "Redmond", state: "WA", zipCode: "98052", country: "United States" };

        var testData = ["en-US", "zh-TW", "de-DE", "fr-FR", "it-IT", "ja-JP", "ko-KO", "nl-BL", "pl-PL", "pt-BR", "ru-RU", "zh-CN", "es-ES"];
        var helper = new P.AddressHelper();
        var renderer = P.UiFormRenderers.getRenderer("location");

        for (var lp = 0; lp < testData.length; lp++) {
            P.LocaleHelper.setLocale(testData[lp]);
            var myDiv = document.createElement('div');
            myDiv.id = "parentDiv";
            tc.isTrue(renderer.field(uiForm, myDiv, value, "fieldName"));

            var expectedOrder = helper.getAddressViewFieldOrderStrings();
            var results = _findAllChildIds(myDiv, []);

            var count = results.length;
            tc.areEqual(expectedOrder.length, count);
            for (var lp2 = 0; lp2 < count; lp2++) {
                var childId = results[lp2];

                tc.areEqual("parentDiv-" + expectedOrder[lp2], childId);
            }
        }
    });

    Tx.test("UiLocationRendererTests.test_CheckPartialFieldOrder", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var formData = {
            cssPrefix: "testStyle-",
            loc: { getString: function (locId) { return ""; } }
        };
        var uiForm = new P.UiForm(formData);

        var value = { zipCode: "98052", country: "United States" };

        var testData = ["en-US", "zh-TW", "de-DE", "fr-FR", "it-IT", "ja-JP", "ko-KO", "nl-BL", "pl-PL", "pt-BR", "ru-RU", "zh-CN", "es-ES" ];

        var helper = new P.AddressHelper();
        var renderer = P.UiFormRenderers.getRenderer("location");

        for (var lp = 0; lp < testData.length; lp++) {
            P.LocaleHelper.setLocale(testData[lp]);
            var myDiv = document.createElement('div');
            myDiv.id = "parentDiv";
            tc.isTrue(renderer.field(uiForm, myDiv, value, "fieldName"));

            var expectedOrder = helper.getAddressViewFieldOrderStrings();
            var expOrder = [];
            for (var lp3 = 0; lp3 < expectedOrder.length; lp3++) {
                if (value[expectedOrder[lp3]]) {
                    expOrder.push(expectedOrder[lp3]);
                }
            }

            var results = _findAllChildIds(myDiv, []);

            var count = results.length;
            tc.areEqual(expOrder.length, count);
            for (var lp2 = 0; lp2 < count; lp2++) {
                var childId = results[lp2];

                tc.areEqual("parentDiv-" + expOrder[lp2], childId);
            }
        }
    });

    Tx.test("UiLocationRendererTests.test_CheckMultilineStreetFieldOrder", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var formData = {
            cssPrefix: "testStyle-",
            loc: { getString: function (locId) { return ""; } }
        };
        var uiForm = new P.UiForm(formData);

        var value = { street: "Address 1\nAddress 2", zipCode: "98052", country: "United States" };

        var testData = ["en-US", "zh-TW", "de-DE", "fr-FR", "it-IT", "ja-JP", "ko-KO", "nl-BL", "pl-PL", "pt-BR", "ru-RU", "zh-CN", "es-ES"];
        var helper = new P.AddressHelper();
        var renderer = P.UiFormRenderers.getRenderer("location");

        for (var lp = 0; lp < testData.length; lp++) {
            P.LocaleHelper.setLocale(testData[lp]);
            var myDiv = document.createElement('div');
            myDiv.id = "parentDiv";
            tc.isTrue(renderer.field(uiForm, myDiv, value, "fieldName"));

            var expectedOrder = helper.getAddressViewFieldOrderStrings();
            var expOrder = [];
            for (var lp3 = 0; lp3 < expectedOrder.length; lp3++) {
                if (value[expectedOrder[lp3]]) {
                    expOrder.push(expectedOrder[lp3]);
                }
                if (expectedOrder[lp3] === 'street') {
                    expOrder.push(expectedOrder[lp3] + "_1");
                }
            }

            var results = _findAllChildIds(myDiv, []);

            var count = results.length;
            tc.areEqual(expOrder.length, count);
            for (var lp2 = 0; lp2 < count; lp2++) {
                var childId = results[lp2];

                tc.areEqual("parentDiv-" + expOrder[lp2], childId);
            }
        }
    });

});