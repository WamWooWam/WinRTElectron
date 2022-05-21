
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/Jx.js" />
/// <reference path="../core/Key.js" />
/// <reference path="../core/Res.js" />

/*global Jx,Tx,Windows*/

(function () {

    function isEnUS() {
        var lang = Windows.ApplicationModel.Resources.Core.ResourceContext.getForCurrentView().languages[0];
        return lang === "en-US";
    }

    Tx.test("KeyTests.testgetLabel", function (tc) {
        if (!isEnUS()) {
            return; // It only works in en-US
        }

        var key = new Jx.Key();

        // Single key
        var single1 = key.getLabel("a");
        var single2 = key.getLabel("B ");
        var single3 = key.getLabel(" &");
        var single4 = key.getLabel("ENTER");
        var single5 = key.getLabel("plus");
              
        tc.areEqual("A", single1);
        tc.areEqual("B", single2);
        tc.areEqual("&", single3);
        tc.areEqual("Enter", single4);
        tc.areEqual("+", single5);

        // Two keys
        var double1 = key.getLabel("ctrl+c");
        var double2 = key.getLabel("ALT+ D");
        var double3 = key.getLabel("Shift +backslash");
        var double4 = key.getLabel("windows+escape ");
        var double5 = key.getLabel(" ctrl+>");

        tc.areEqual("Ctrl+C", double1);
        tc.areEqual("Alt+D", double2);
        tc.areEqual("Shift+\\", double3);
        tc.areEqual("Windows key+Esc", double4);
        tc.areEqual("Ctrl+>", double5);

        // Three keys
        var triple1 = key.getLabel(" ctrl + ALT + period ");
        tc.areEqual("Ctrl+Alt+.", triple1);

        // Four keys
        var quad1 = key.getLabel("Ctrl+alt+WINDOWS+&  ");
        tc.areEqual(quad1, "Ctrl+Alt+Windows key+&", quad1);
    });

    Tx.test("KeyTests.testMapKeyCode", function (tc) {
        if (!isEnUS()) {
            return; // It only works in en-US
        }

        var key = new Jx.Key();

        var keycode1 = key.mapKeyCode(96); // Numberpad 0, should change to 0
        var keycode2 = key.mapKeyCode(92); // Right Windows, should change to Left Windows
        var keycode3 = key.mapKeyCode(Jx.KeyCode["9"]); // 9, should stay the same
        var keycode4 = key.mapKeyCode(255);  // Doesn't exist in Jx.KeyCode, should stay the same

        tc.areEqual(Jx.KeyCode["0"], keycode1);
        tc.areEqual(Jx.KeyCode.windows, keycode2);
        tc.areEqual(Jx.KeyCode["9"], keycode3);
        tc.areEqual(255, keycode4);
    });

})();