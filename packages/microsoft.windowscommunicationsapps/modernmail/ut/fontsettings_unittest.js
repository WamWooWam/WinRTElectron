
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx,Debug*/

(function () {

    var fontFamilyControl = null,
        fontSizeControl = null,
        fontColorControl = null,
        oldFontSelector = null,
        sandbox = null,
        settings = null;

    var MockFontSelector = {};

    var mfs = MockFontSelector;

    mfs.NameControl = mfs.SizeControl = mfs.ColorControl = function () {
        Debug.Events.define(this, "change");
        this._value = null;
    };


    Jx.augment(mfs.NameControl, Jx.Component);
    Jx.augment(mfs.NameControl, Jx.Events);

    mfs.NameControl.prototype.initUI = function (div) {
        if (div.id === "mailSettingsFontNameControl") {
            fontFamilyControl = this;
        } else if (div.id === "mailSettingsFontSizeControl") {
            fontSizeControl = this;
        } else if (div.id === "mailSettingsFontColorControl") {
            fontColorControl = this;
        }
    };

    Object.defineProperty(mfs.NameControl.prototype, "value", {
        get: function () { return this._value; },
        set: function (val) { this._value = val; this.raiseEvent("change", { value: val }); }
    });

    function setup (tc) {
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");

        Mail.UnitTest.initGlobals();
        Mail.Globals.appSettings = new Mail.AppSettings();

        oldFontSelector = window.FontSelector;

        window.FontSelector = MockFontSelector;

        sandbox = document.createElement("div");

        settings = new Mail.FontSettings(sandbox);

        sandbox.innerHTML = settings.getHTML();

        settings.populateControls();
        settings.update();

        tc.addCleanup(function() {
            Mail.UnitTest.restoreJx();
            Mail.Globals.appSettings.dispose();
            Mail.Globals.appSettings = null;
            Mail.UnitTest.disposeGlobals();
            sandbox = null;
            settings.dispose();
            settings = null;
            fontFamilyControl = null;
            fontSizeControl = null;
            fontColorControl = null;
            window.FontSelector = oldFontSelector;
        });
    }

    function verifyValues(tc) {
        tc.areEqual(fontFamilyControl.value, Mail.Globals.appSettings.composeFontFamily);
        tc.areEqual(fontSizeControl.value, Mail.Globals.appSettings.composeFontSize);
        tc.areEqual(fontColorControl.value, Mail.Globals.appSettings.composeFontColor);
    }

    Tx.test("FontSettings_UnitTest.End_To_End", { owner: "andrha" }, function (tc) {
        setup(tc);

        // Verify initial state
        verifyValues(tc);

        // Change the font family
        fontFamilyControl.value = "Comic Sans";
        verifyValues(tc);

        // Change the font size
        fontSizeControl.value = "12pt";
        verifyValues(tc);
    
        // Change the font color
        fontColorControl.value = "#3A3A3A";
        verifyValues(tc);

    });

})();
