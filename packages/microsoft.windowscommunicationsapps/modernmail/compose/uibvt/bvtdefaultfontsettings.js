
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global WinJS, setTimeout, BVT, ComposeLfm */

(function () {
    var timeoutMs = 15000;
    var composeLfm = new ComposeLfm();
    var defaultFontLfm = new DefaultFontSettingsLfm();

    // testInitialize function that launches Compose if necessary
    var testInitialize = function (tc) {
        tc.stop();
        defaultFontLfm.showDefaultFontSettings();
        this._oldFontColor = defaultFontLfm.fontColor();
        this._oldFontStyle = defaultFontLfm.fontStyle();
        this._oldFontSize = defaultFontLfm.fontSize();
    };

    // testCleanup function that cleans up after running a test. Not to be confused with tc.cleanup
    var testCleanup = function (tc) {
        defaultFontLfm.setValuesAsync(this._oldFontColor, this._oldFontSize, this._oldFontStyle)
        .done(function () {
            defaultFontLfm.hideDefaultFontSettings();

            if (BVT.isVisible(composeLfm.objectModel.window)) {
                composeLfm.discardDraft();
            }

            setTimeout(function () {
                // Arbitrarily waiting 3 seconds here after the test completes to allow for tester
                // inspection. After 3 seconds tc.start() continues with the next test in this file.
                tc.start();
            }, 3000);
        });
    };

    // Set the default font values and verify they were set correctly.
    var _setDefaultValues = function (tc) {
        var fontColorToSetTo = defaultFontLfm.yellow;
        var fontSizeToSetTo = "24pt";
        var fontStyleToSetTo = "Verdana";

        return defaultFontLfm.setValuesAsync(fontColorToSetTo, fontSizeToSetTo, fontStyleToSetTo)
        .then(function () {
            tc.strictEqual(defaultFontLfm.fontColor(), fontColorToSetTo, "The color that was set does not match what we tried to set.");
            tc.strictEqual(defaultFontLfm.fontStyle(), fontStyleToSetTo, "The style that was set does not match what we tried to set.");
            tc.strictEqual(defaultFontLfm.fontSize(), fontSizeToSetTo, "The Size that was set does not match what we tried to set.");
        });
    };

    // Get the signature block and make sure that all the fonts that are set in the default font settings are applied
    var _verifySignatureBlock = function (tc) {
        var signatureBlockFonts = debugModernCanvas.getCanvasElement().querySelectorAll(".defaultFont"),
            currentBlock;

        for (var i = 0; i < signatureBlockFonts.length; i++) {
            currentBlock = signatureBlockFonts[i];

            //Check that the signature block has the new fonts set applied to all the font tags
            tc.strictEqual(currentBlock.currentStyle.color.toLowerCase(), defaultFontLfm.fontColor().toLowerCase(), "The signature font color does not match what was set.");
            tc.strictEqual(currentBlock.currentStyle.fontFamily.toLowerCase(), defaultFontLfm.fontStyle().toLowerCase(), "The signature font style does not match what was set.");
            tc.strictEqual(currentBlock.currentStyle.fontSize.toLowerCase(), defaultFontLfm.fontSize().toLowerCase(), "The signature font size does not match what was set.");
        }
    };

    BVT.Test("FontSettings_SettingsCheck", { timeoutMs: timeoutMs }, function (tc) {
        testInitialize(tc);

        _setDefaultValues(tc)
        .then(function () {
            return MailTest.createMessage();
        })
        .then(function () {
            return new WinJS.Promise(function (complete /*, error, progress*/) {
                _verifySignatureBlock(tc);
                complete();
            });
        })
        .done(function (/*success*/) {
            // This is the success function. It gets called if all previous promises returned success.
            testCleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            testCleanup(tc);
        });
    });

    BVT.Test("FontSettings_DraftUpdateCheck", { timeoutMs: timeoutMs }, function (tc) {
        testInitialize(tc);

        MailTest.createMessage()
        .then(function () {
            _verifySignatureBlock(tc);
            return _setDefaultValues(tc);
        })
        .then(function () {
            _verifySignatureBlock(tc);
        })
        .done(function (/*success*/) {
            // This is the success function. It gets called if all previous promises returned success.
            testCleanup(tc);
        },
        function (failure) {
            tc.error(failure);
            testCleanup(tc);
        });
    });

})();
