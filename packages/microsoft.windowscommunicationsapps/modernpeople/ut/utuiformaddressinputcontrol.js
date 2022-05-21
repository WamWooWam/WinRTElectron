
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../../Shared/Jx/core/Jx.js"/>
/// <reference path="Scripts/TestMockIMePeople.js"/>

/*global Tx,People,Debug,Jx,document,Mocks,Microsoft,Windows,Include*/

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

    Tx.test("UiFormAddressInputControlTests.test_CheckFieldOrder", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var formData = {
            cssPrefix: "testStyle-",
            loc: { getString: function (locId) { return ""; } }
        };
        var uiForm = new P.UiForm(formData);
        var myDiv = document.createElement('div');
        var fieldName = "fieldName";
        var fieldAttr = {};
        var value = {};
        var validator = function (uiform, fieldName, fieldAttr, value) {
            return true;
        };

        var testData = ["en-US", "ja-JP", "zh-CN", "it-IT"];
        var helper = new P.AddressHelper();

        for (var lp = 0; lp < testData.length; lp++) {
            P.LocaleHelper.setLocale(testData[lp]);
            myDiv.innerHTML = "";
            // A successful creation
            var control = new P.UiFormAddressInputControl(uiForm, myDiv, fieldName, fieldAttr, value, validator);

            var expectedOrder = helper.getAddressEditFieldOrderStrings();

            var results = myDiv.querySelectorAll(".testStyle-fieldInput");
            var count = results.length;
            tc.areEqual(expectedOrder.length, count);
            for (var lp2 = 0; lp2 < count; lp2++) {
                var el = results.item(lp2);

                tc.areEqual("editInput_fieldName-" + expectedOrder[lp2], el.id);
            }
        }
    });

    Tx.test("UiFormAddressInputControlTests.test_CheckContainerContentsPreserved", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var formData = {
            cssPrefix: "testStyle-",
            loc: { getString: function (locId) { return ""; } }
        };
        var uiForm = new P.UiForm(formData);
        var myDiv = document.createElement('div');
        var fieldName = "fieldName";
        var fieldAttr = {};
        var value = {};
        var validator = function (uiform, fieldName, fieldAttr, value) {
            return true;
        };

        P.LocaleHelper.setLocale(null);
        myDiv.innerHTML = "<div id='preservedDivId' />";
        var result = myDiv.querySelector("#preservedDivId");
        tc.areEqual("preservedDivId", result.id);

        // A successful creation
        var control = new P.UiFormAddressInputControl(uiForm, myDiv, fieldName, fieldAttr, value, validator);

        // Check that the added preservedDivId is still present in the Div
        var checkExist = myDiv.querySelector("#preservedDivId");
        tc.areEqual("preservedDivId", checkExist.id);
    });
});