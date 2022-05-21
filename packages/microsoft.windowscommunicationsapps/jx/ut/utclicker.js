
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Tx*/
(function  () {

    var Clicker = Jx.Clicker;

    var sandbox;
    function setup(tc) {
        sandbox = document.getElementById("sandbox");
        tc.cleanup = function () {
            sandbox.innerText = "";
            sandbox = null;
        };
    }

    function sendKey(key, element)  {
        var evt = document.createEvent("KeyboardEvent");
        evt.initKeyboardEvent("keydown", true, true, null, key, null, null, null, null);
        element.dispatchEvent(evt);
    }

    Tx.test("Clicker.testClick", function (tc) {
        setup(tc);
        sandbox.innerHTML = "<div>Text</div><div>Other</div>";

        var o = { clicked: 0 };
        var c = new Clicker(sandbox.firstElementChild, function () {
            this.clicked++;
        }, o);

        sandbox.click();
        tc.areEqual(o.clicked, 0);

        sandbox.firstElementChild.click();
        tc.areEqual(o.clicked, 1);

        sandbox.firstElementChild.click();
        tc.areEqual(o.clicked, 2);

        sandbox.lastElementChild.click();
        tc.areEqual(o.clicked, 2);

        c.dispose();
    });

    Tx.test("Clicker.testChildClick", function (tc) {
        setup(tc);
        sandbox.innerHTML = "<div class='a'><span class='b'>Text</span><span class='c'>Text2</span></div>";

        var clicked = 0;
        var c = new Clicker(sandbox.firstElementChild, function () {
            clicked++;
        });

        sandbox.querySelector(".b").click();
        tc.areEqual(clicked, 1);

        sandbox.querySelector(".c").click();
        tc.areEqual(clicked, 2);

        c.dispose();
    });

    Tx.test("Clicker.testDefaultKeys", function (tc) {
        setup(tc);
        sandbox.innerHTML = "<div>Test</div>";

        var clicked = 0;
        var c = new Clicker(sandbox.firstElementChild, function () {
            clicked++;
        });

        sandbox.firstElementChild.focus();
        tc.areEqual(clicked, 0);

        sendKey("Spacebar", sandbox.firstElementChild);
        tc.areEqual(clicked, 1);

        sendKey("Q", sandbox.firstElementChild);
        tc.areEqual(clicked, 1);

        sendKey("Enter", sandbox.firstElementChild);
        tc.areEqual(clicked, 2);

        c.dispose();
    });

    Tx.test("Clicker.testCustomKeys", function (tc) {
        setup(tc);
        sandbox.innerHTML = "<div>Test</div>";

        var clicked = 0;
        var c = new Clicker(sandbox.firstElementChild, function () {
            clicked++;
        }, null, [ "Z" ]);

        sandbox.firstElementChild.focus();
        tc.areEqual(clicked, 0);

        sendKey("Spacebar", sandbox.firstElementChild);
        tc.areEqual(clicked, 0);

        sendKey("Z", sandbox.firstElementChild);
        tc.areEqual(clicked, 1);

        sendKey("Enter", sandbox.firstElementChild);
        tc.areEqual(clicked, 1);

        c.dispose();
    });


})();

