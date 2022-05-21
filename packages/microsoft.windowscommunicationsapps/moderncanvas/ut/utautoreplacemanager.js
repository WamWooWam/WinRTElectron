
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx,Jx,Calendar,$*/

(function () {

    // Override Jx getString
    Jx.res.getString = function (key) {
        return "STRING_FOR_KEY(" + key + ")";
    };

    ModernCanvas.AutoReplaceManager.Classes.testClass = {};

    ModernCanvas.AutoReplaceManager.Classes.testClass.element = {
        "smiley1": "<img src='path1' />",
        "smiley2": "<img src='path2' />",
        "smiley3": "<img src='path3' />",
        "smiley4": "<img src='path4' />"
    };
    ModernCanvas.AutoReplaceManager.Classes.testClass.bulk = {};
    ModernCanvas.AutoReplaceManager.Classes.testClass.bulk.testClass = [
        ["string", "my", "string", "your"],
        ["string", ":)", "element", "smiley2"],
        ["element", "smiley1", "element", "smiley3"],
        ["element", "smiley4", "string", "SMILE"]
    ];
    ModernCanvas.AutoReplaceManager.Classes.testClass.realTime = [
        ["one", "string", "two"],
        ["smile", "element", "smiley1"],
        ["one", "string", "three", "grave"]
    ];

    // Define the setup/teardown functions
    var unitTestElement,
        autoReplaceManager,
        parentComponent;

    function setup(tc) {
        parentComponent = new MockComponent();
        Debug.Events.define(parentComponent, "command", "beforeundoablechange", "undoablechange");
        // Add test element to the DOM
        unitTestElement = document.createElement("div");
        unitTestElement.contentEditable = true;
        document.body.appendChild(unitTestElement);

        // Initialize the AutoReplaceManager
        tc.log("Creating autoReplace manager.");
        autoReplaceManager = new ModernCanvas.AutoReplaceManager("testClass");
        parentComponent.appendChild(autoReplaceManager);
        tc.log("Attaching autoReplace manager to DOM");
        unitTestElement.addEventListener("keydown", autoReplaceManager.onKeyDown, false);
        unitTestElement.addEventListener("keyup", autoReplaceManager.onKeyUp, false);
        tc.log("Finished creating autoReplace manager.");

        // Set focus in the element
        unitTestElement.focus();
        var range = document.createRange(),
            selObj = document.getSelection();
        range.selectNodeContents(unitTestElement);
        selObj.removeAllRanges();
        selObj.addRange(range);
    }

    function cleanup(tc) {
        // Detach the autoReplace manager from the DOM
        unitTestElement.removeEventListener("keydown", autoReplaceManager.onKeyDown, false);
        unitTestElement.removeEventListener("keyup", autoReplaceManager.onKeyUp, false);

        // Remove the test element from the DOM
        unitTestElement.parentNode.removeChild(unitTestElement);

        // Throw away the AutoReplaceManager
        tc.log("Destroying autoReplace manager.");
        autoReplaceManager = null;
    }

    // Function to perform the bulk conversion of a string as both a bulkConvertString and bulkConvertElement
    function getResultsForConversion(tc, startingString) {
        var results = [];
        tc.log("Performing bulk string conversion as result 0");
        results[0] = autoReplaceManager.bulkConvertString(startingString, ["testClass"]);
        tc.log("Performing bulk element conversion as result 1");
        unitTestElement.innerHTML = startingString;
        autoReplaceManager.bulkConvertElement(unitTestElement, ["testClass"]);
        results[1] = unitTestElement.innerHTML;
        return results;
    };

    // Bulk String to String
    Tx.test("AutoReplaceManager.testBulkS2S", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var results = getResultsForConversion(tc, "This is my friend"),
            result;
        for (var m = results.length; m--;) {
            result = results[m];
            tc.log("Conversion result for result " + m + ": " + result);
            tc.areEqual("This is your friend", result);
        }
    });

    // Bulk String to Image
    Tx.test("AutoReplaceManager.testBulkS2I", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var results = getResultsForConversion(tc, "Yay :)"),
            result;
        for (var m = results.length; m--;) {
            result = results[m];
            tc.log("Conversion result for result " + m + ": " + result);
            tc.areEqual("Yay ", result.substr(0, 4));
            tc.areNotEqual(":)", result.substr(4, 2));
            tc.log("String to be replaced has been removed.");
            tc.isTrue(result.indexOf("path2") > 0);
            tc.log("Correct html was inserted.");
        }
    });

    // Bulk Image to String
    Tx.test("AutoReplaceManager.testBulkI2S", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var results = getResultsForConversion(tc, 'Yay <img data-name="smiley4"/>'),
            result;
        for (var m = results.length; m--; ) {
            result = results[m];
            tc.log("Conversion result for result " + m + ": " + result);
            tc.areEqual("Yay SMILE", result);
        }
    });

    // Bulk Image to Image
    Tx.test("AutoReplaceManager.testBulkI2I", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var results = getResultsForConversion(tc, 'Yay <img data-name="smiley1"/>'),
            result;
        for (var m = results.length; m--; ) {
            result = results[m];
            tc.log("Conversion result for result " + m + ": " + result);
            tc.areEqual("Yay ", result.substr(0, 4));
            tc.areEqual(-1, result.indexOf('<img data-name="smiley1"/>'));
            tc.isTrue(result.indexOf("path3") > 0);
        }
    });

    // Real Time String to String
    Tx.test("AutoReplaceManager.testRealTimeS2S", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        DOMx.simulateKeyStrokes("one");
        result = unitTestElement.innerHTML;
        tc.log("Typing result: " + result);
        tc.areEqual("two", result);
    });

    // Real Time String to Image
    Tx.test("AutoReplaceManager.testRealTimeS2I", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        DOMx.simulateKeyStrokes("smile");
        result = unitTestElement.innerHTML;
        tc.log("Typing result: " + result);
        tc.areEqual(-1, result.indexOf("smile"));
        tc.log("String to be replaced has been removed.");
        tc.isTrue(result.indexOf("path1") > 0);
        tc.log("Correct html was inserted.");
    });

    // Real Time String to Image
    Tx.test("AutoReplaceManager.testRealFlags", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        DOMx.simulateKeyStrokes("on");
        autoReplaceManager.setFlag("grave");
        DOMx.simulateKeyStrokes("e");
        result = unitTestElement.innerHTML;
        tc.log("Typing result: " + result);
        tc.areEqual("three", result);
    });

    //Tx.test("AutoReplaceManager.testEmpty", function (tc) {
    //        tc.cleanup = cleanup;
    //        setup(tc);

    //    });
})();