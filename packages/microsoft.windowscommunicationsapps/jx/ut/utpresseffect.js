
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Tx,WinJS*/
(function () {

    var PressEffect = Jx.PressEffect;

    var sandbox;
    function setup(tc) {
        sandbox = document.getElementById("sandbox");
        WinJS.UI.disableAnimations();
        var msSetPointerCapture = HTMLElement.prototype.msSetPointerCapture,
            msReleasePointerCapture = HTMLElement.prototype.msReleasePointerCapture;
        HTMLElement.prototype.msSetPointerCapture = function () { };
        HTMLElement.prototype.msReleasePointerCapture = function () { };

        tc.cleanup = function () {
            sandbox.innerText = "";
            sandbox = null;
            WinJS.UI.enableAnimations();
            HTMLElement.prototype.msSetPointerCapture = msSetPointerCapture;
            HTMLElement.prototype.msReleasePointerCapture = msReleasePointerCapture;
        };
    }

    function firePointerEvent(target, type, options) {
        options = options || {};
        var ev = document.createEvent("MSPointerEvent");
        ev.initPointerEvent(
            type,
            options.canBubble !== false,
            options.cancelable !== false,
            options.view || null,
            options.detail || null,
            options.screenX || 0,
            options.screenY || 0,
            options.clientX || 0,
            options.clientY || 0,
            options.ctrlKey || false,
            options.altKey || false,
            options.shiftKey || false,
            options.metaKey || false,
            options.button || 0,
            options.relatedTarget || null,
            options.offsetX || 0,
            options.offsetY || 0,
            options.width || 0,
            options.height || 0,
            options.pressure || 0,
            options.rotation || 0,
            options.tiltX || 0,
            options.tiltY || 0,
            options.pointerId || 0,
            options.pointerType || 0,
            options.hwTimestamp || 0,
            options.isPrimary !== false
        );
        target.dispatchEvent(ev);
    }

    Tx.test("PressEffect.testEffects", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute", "animation", "className" ]);

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerDown");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");
        tc.areEqual(sandbox.querySelector(".pressed").id, "div1");
        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerUp");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);
        tc.areEqual(sandbox.querySelector(".pressed"), null);

        effect.dispose();
    });

    Tx.test("PressEffect.testUnpressable", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'></div><div id='div2'></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute" ]);

        firePointerEvent(sandbox.querySelector("#div2"), "MSPointerDown");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);
        firePointerEvent(sandbox.querySelector("#div2"), "MSPointerUp");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);

        effect.dispose();
    });

    Tx.test("PressEffect.testPressChild", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'><div class='child'></div><div class='child2'></div></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute" ]);

        firePointerEvent(sandbox.querySelector("#div1 .child"), "MSPointerDown");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");
        firePointerEvent(sandbox.querySelector("#div1 .child2"), "MSPointerUp");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);

        effect.dispose();
    });

    Tx.test("PressEffect.testMultipress", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'></div><div id='div2' class='pressable'></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute" ]);

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerDown");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");

        firePointerEvent(sandbox.querySelector("#div2"), "MSPointerDown");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");
        tc.areEqual(sandbox.querySelectorAll("[data-state='pressed']").length, 1);

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerUp");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);

        effect.dispose();
    });

    Tx.test("PressEffect.testMultiPointer", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute" ]);

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerDown", { pointerId: 1 });
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerDown", { pointerId: 2 });
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerUp", { pointerId: 2 });
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerUp", { pointerId: 1 });
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);

        effect.dispose();
    });

    Tx.test("PressEffect.testCancel", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute" ]);

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerDown");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerCancel");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);

        effect.dispose();
    });

    Tx.test("PressEffect.testLostCapture", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'></div><div id='capture'></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute" ], "#capture");

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerDown", { pointerType: "touch" });
        tc.areEqual(sandbox.querySelector("[data-state='pressed']").id, "div1");

        firePointerEvent(sandbox.querySelector("#capture"), "MSLostPointerCapture");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);

        effect.dispose();
    });

    Tx.test("PressEffect.testNesting", function (tc) {
        setup(tc);

        sandbox.innerHTML = "<div id='div1' class='pressable'><div id='div2' class='pressable'></div>";

        var effect = new PressEffect(sandbox, ".pressable", [ "attribute" ]);

        firePointerEvent(sandbox.querySelector("#div2"), "MSPointerDown");
        tc.areEqual(sandbox.querySelector("#div1").getAttribute("data-state"), "pressed");
        tc.areEqual(sandbox.querySelector("#div2").getAttribute("data-state"), "pressed");

        firePointerEvent(sandbox.querySelector("#div1"), "MSPointerUp");
        tc.areEqual(sandbox.querySelector("[data-state='pressed']"), null);

        effect.dispose();
    });

})();
