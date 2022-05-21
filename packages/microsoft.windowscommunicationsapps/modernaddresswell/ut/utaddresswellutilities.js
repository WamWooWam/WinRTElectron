
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,WinJS,window,document,AddressWell*/

(function () {
    /// <summary>
    /// Test the AddressWell.Utilities file.
    /// </summary>

    // Temporary variables that will be changed by the tests
    var _originalMSApp;
    var _originalURL;
    var _originalGetUserTile;
    var _originalWinJS;
    var _originalJxFault;

    var _stylesheetCount;

    function setup () {
        /// <summary>
        /// Saves variables that will be changed by the tests
        /// </summary>

        _originalMSApp = window.MSApp;
        _originalURL = window.URL;
        _originalGetUserTile = AddressWell.getUserTile;
        _originalWinJS = window.WinJS;
        _originalJxFault = Jx.fault;

        WinJS = { UI: {} };
        Jx.fault = function () { };

        _stylesheetCount = document.styleSheets.length;
    }

    function cleanup () {
        /// <summary>
        /// Restores variables that were changed by the tests
        /// </summary>

        window.MSApp = _originalMSApp;
        window.URL = _originalURL;
        AddressWell.getUserTile = _originalGetUserTile;
        window.WinJS = _originalWinJS;
        Jx.fault = _originalJxFault;

        var colorSheet = document.getElementById(AddressWell.colorCssId);
        if (colorSheet) {
            colorSheet.parentNode.removeChild(colorSheet);
        }

        if (document.styleSheets.length !== _stylesheetCount) {
            throw new Error("Did not clean up all stylesheets added during unit testing");
        }
    }

    Tx.test("AddressWellUtilitiesUnitTests.testScrollIntoContainerTopNotInView", function (tc) {
        /// <summary>
        /// Tests the case when top of element is not in view
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var container = { scrollTop: 50, offsetHeight: 100 };
        var element = { offsetTop: 0, offsetHeight: 50 };

        AddressWell.scrollIntoContainer(container, element);
        tc.areEqual(element.offsetTop, container.scrollTop, "Container's scrollTop should have been set");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testScrollIntoContainerBottomNotInView", function (tc) {
        /// <summary>
        /// Tests the case when bottom of element is not in view
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var container = { scrollTop: 50, offsetHeight: 100 };
        var element = { offsetTop: 140, offsetHeight: 20 };

        AddressWell.scrollIntoContainer(container, element);
        tc.areEqual(element.offsetTop, container.scrollTop, "Container's scrollTop should have been set");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testScrollIntoContainerInView", function (tc) {
        /// <summary>
        /// Tests the case when both top and bottom of element are in view
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var container = { scrollTop: 50, offsetHeight: 100 };
        var element = { offsetTop: 60, offsetHeight: 20 };

        AddressWell.scrollIntoContainer(container, element);
        tc.areEqual(50, container.scrollTop, "Container's scrollTop should not have been changed");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testPointerAnimation", function (tc) {
        /// <summary>
        /// Tests that the function calls the appropriate WinJS animation.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var downCount = 0;
        var upCount = 0;
        WinJS = {
            UI: {
                Animation: {
                    pointerDown: function (element) { downCount++; },
                    pointerUp: function (element) { upCount++; }
                }
            }
        };

        var msPointerUpCount = 0;
        var msPointerOutCount = 0;
        var mockElement = {};
        mockElement.addEventListener = function (name, handler, isCapture) {
            if (name === AddressWell.Events.msPointerUp) {
                msPointerUpCount++;
            } else if (name === AddressWell.Events.msPointerOut) {
                msPointerOutCount++;
            } else {
                tc.fail("Invalid event name for element.addEventListener");
            }
        };
        mockElement.removeEventListener = function (name, handler, isCapture) {
            if (name === AddressWell.Events.msPointerUp) {
                msPointerUpCount--;
            } else if (name === AddressWell.Events.msPointerOut) {
                msPointerOutCount--;
            } else {
                tc.fail("Invalid event name for element.removeEventListener");
            }
        };

        // Invalid element
        AddressWell.performPointerAnimation(null);
        tc.areEqual(0, downCount, "Invalid element should not trigger pointer down");
        tc.areEqual(0, msPointerUpCount, "Invalid element should not trigger pointer up handler");
        tc.areEqual(0, msPointerOutCount, "Invalid element should not trigger pointer out handler");

        // Pointer Down
        AddressWell.performPointerAnimation(mockElement);
        tc.areEqual(1, downCount, "Should trigger pointer down");
        tc.areEqual(1, msPointerUpCount, "Should trigger pointer up handler");
        tc.areEqual(1, msPointerOutCount, "Should trigger pointer out handler");
        tc.isNotNull(AddressWell.currentPointerDownElement, "pointer down element should not be null");

        // Pointer up
        AddressWell.resetPointerElement();
        tc.areEqual(1, upCount, "Pointer up should have been fired");
        tc.areEqual(0, msPointerUpCount, "Pointer up handler should be 0");
        tc.areEqual(0, msPointerOutCount, "Pointer out handler should be 0");
        tc.isNull(AddressWell.currentPointerDownElement, "pointer down element should be null");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testColorConstructorRGB", function (tc) {
        /// <summary>
        /// Verifies the constructor works correctly when passed r,g,b values
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var r = 0xFF;
        var g = 0x98;
        var b = 0x19;

        var color = new AddressWell.Color(r, g, b);

        tc.areEqual(r, color._r, "Unexpected value for R");
        tc.areEqual(g, color._g, "Unexpected value for G");
        tc.areEqual(b, color._b, "Unexpected value for B");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testColorConstructorSingle", function (tc) {
        /// <summary>
        /// Verifies that the constructor works correctly when passed a single numeric value
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var numericColor = 0x123456;

        var color = new AddressWell.Color(numericColor);

        tc.areEqual(0x12, color._r, "Unexpected value for R");
        tc.areEqual(0x34, color._g, "Unexpected value for G");
        tc.areEqual(0x56, color._b, "Unexpected value for B");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testColorStringValueLeadingZeros", function (tc) {
        /// <summary>Verifies that stringValue has the correct representation of the color</summary>
        tc.cleanup = cleanup;
        setup();

        var color = new AddressWell.Color(0x00456A);

        tc.areEqual("#00456a", color.stringValue, "Unexpected hex representation of color");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testColorStringValue", function (tc) {
        /// <summary>Verifies that stringValue has the correct representation of the color</summary>
        tc.cleanup = cleanup;
        setup();

        var color = new AddressWell.Color(0xBB5692);

        tc.areEqual("#bb5692", color.stringValue, "Unexpected hex representation of color");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testColorCombineSingleColor", function (tc) {
        /// <summary>Verifies AddressWell.Color.combine when there is only one color</summary>
        tc.cleanup = cleanup;
        setup();

        var color1 = new AddressWell.Color(0x50, 0x50, 0x50);

        var colorResult = AddressWell.Color.combine(color1, 0.5);

        tc.areEqual("#282828", colorResult.stringValue, "Unexpected value for combined color");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testColorCombineFractional", function (tc) {
        /// <summary>Verifies AddressWell.Color.combine when the color numbers will be fractional</summary>
        tc.cleanup = cleanup;
        setup();

        var color1 = new AddressWell.Color(255, 169, 20);
        var color2 = new AddressWell.Color(169, 255, 72);

        var colorResult = AddressWell.Color.combine(color1, 0.25, color2, 0.75);

        tc.areEqual("#bee93b", colorResult.stringValue, "Unexpected value for combined color");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testUpdateColor", function (tc) {
        /// <summary>Verifies updateColor works correctly</summary>
        tc.cleanup = cleanup;
        setup();

        AddressWell.updateColor(0xA0BB15);

        var dynamicStyle = document.getElementById(AddressWell.colorCssId);

        tc.isNotNull(dynamicStyle, "Unable to find dynamically added styles foo" + Jx.isWWA);
        tc.isNotNull(dynamicStyle.style, "Unable to find dynamically added styles");
        tc.areEqual(_stylesheetCount + 1, document.styleSheets.length, "Unexpected number of styleSheets in the page");

        var updatedColorFound = false;
        var rules = dynamicStyle.sheet.rules;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules.item(i);
            // The browser may choose to return text that's formatted differently than the text we sent it
            // Check for the hex value as well as the r, g, b string
            var hexIsPresent = rule.cssText.indexOf("a0bb15") >= 0;
            var rgbIsPresent = rule.cssText.indexOf("160, 187, 21") >= 0;
            if (hexIsPresent || rgbIsPresent) {
                updatedColorFound = true;
                break;
            }
            
        }

        tc.isTrue(updatedColorFound, "Could not find color in stylesheet");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testUpdateColorTwice", function (tc) {
        /// <summary>Verifies updateColor works correctly when called twice</summary>
        tc.cleanup = cleanup;
        setup();

        AddressWell.updateColor(0xA0BB15);
        AddressWell.updateColor(0x119944);

        var dynamicStyle = document.getElementById(AddressWell.colorCssId);

        tc.isNotNull(dynamicStyle, "Unable to find dynamically added styles");
        tc.isNotNull(dynamicStyle.style, "Unable to find dynamically added styles");
        tc.areEqual(_stylesheetCount + 1, document.styleSheets.length, "Unexpected number of styleSheets in the page");

        var rules = dynamicStyle.sheet.rules;
        for (var i = 0; i < rules.length; i++) {
            var rule = rules.item(i);
            // The browser may choose to return text that's formatted differently than the text we sent it
            // Check for the hex value as well as the r, g, b string
            var hexIsPresent = rule.cssText.indexOf("119944") >= 0;
            var rgbIsPresent = rule.cssText.indexOf("17, 153, 68") >= 0;
            if (hexIsPresent || rgbIsPresent) {
                updatedColorFound = true;
                break;
            }
        }
        tc.isTrue(updatedColorFound, "Could not find color in stylesheet");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testIsEmailValid", function (tc) {
        /// <summary>
        /// Tests whether a given email is in a valid format.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Invalid emails
        tc.isFalse(AddressWell.isEmailValid(""), "invalid 1");
        tc.isFalse(AddressWell.isEmailValid(" "), "invalid 2");
        tc.isFalse(AddressWell.isEmailValid("@"), "invalid 3");
        tc.isFalse(AddressWell.isEmailValid(".@."), "invalid 4");
        tc.isFalse(AddressWell.isEmailValid(".com"), "invalid 5");
        tc.isFalse(AddressWell.isEmailValid("someone@"), "invalid 6");
        tc.isFalse(AddressWell.isEmailValid("someone@hotmail"), "invalid 7");
        tc.isFalse(AddressWell.isEmailValid("some(paranthesis)@hotmail.com"), "invalid 8");
        tc.isFalse(AddressWell.isEmailValid("emptyDomainBrackets@[]"), "invalid 9");
        tc.isFalse(AddressWell.isEmailValid("emailWithoutDomain"), "invalid 10");
        tc.isFalse(AddressWell.isEmailValid("[123]"), "invalid 11");
        tc.isFalse(AddressWell.isEmailValid("[]"), "invalid 12");
        tc.isFalse(AddressWell.isEmailValid("text before bracket [123] text after bracket"), "invalid 13");
        tc.isFalse(AddressWell.isEmailValid("email1@hotmail.com email2@hotmail.com"), "invalid 14");

        // Valid emails
        tc.isTrue(AddressWell.isEmailValid("name@hotmail.com"), "valid 1");
        tc.isTrue(AddressWell.isEmailValid("name+tag@hotmail.com"), "valid 2");
        tc.isTrue(AddressWell.isEmailValid("name\tag@hotmail.com"), "valid 3");
        tc.isTrue(AddressWell.isEmailValid("!#$%&'+-/=.?^`\"{|}~@hotmail.com"), "valid 4");
        tc.isTrue(AddressWell.isEmailValid("ipAddressDomain@[10.10.10.10]"), "valid 5");
        tc.isTrue(AddressWell.isEmailValid('"emailInQuotes"@hotmail.com'), "valid 6");
        tc.isTrue(AddressWell.isEmailValid('"spaces here"@hotmail.com'), "valid 7");
    });

    Tx.test("AddressWellUtilitiesUnitTests.testIsEmailDomainValid", function (tc) {
        /// <summary>
        /// Tests whether a given email's domain is valid.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Bad domains
        tc.isFalse(AddressWell.isEmailDomainValid("someone@hotmai.com"));
        tc.isFalse(AddressWell.isEmailDomainValid("someone@yaho.com"));

        // Valid domains
        tc.isTrue(AddressWell.isEmailDomainValid("someone@hotmail.com"));
        tc.isTrue(AddressWell.isEmailDomainValid("someone@yahoo.com"));
    });

})();