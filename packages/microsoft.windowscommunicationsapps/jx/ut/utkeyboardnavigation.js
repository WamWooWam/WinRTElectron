
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Tx*/
(function  () {

    var KeyboardNavigation = Jx.KeyboardNavigation;

    var sandbox;
    function setup(tc) {
        sandbox = document.getElementById("sandbox");
        tc.cleanup = function () {
            sandbox.innerText = "";
            sandbox = null;
        };
    }

    function repeat(template, count) {
        var result = "";
        for (var i = 0; i < count; ++i) {
            result += template;
        }
        return result;
    }

    function sendKey(key, element)  {
        var evt = document.createEvent("KeyboardEvent");
        evt.initKeyboardEvent("keydown", true, true, null, key, null, null, null, null);
        element.dispatchEvent(evt);
    }

    Tx.test("KeyboardNavigation.testHome", function (tc) {
        setup(tc);
        sandbox.innerHTML =
            "<div>Dummy</div>" +
            repeat("<div class='test' tabIndex='-1'>Item</div>", 10);

        var k = new KeyboardNavigation(sandbox, "vertical");
        sandbox.children[5].focus();
        sendKey("Home", sandbox);

        tc.areEqual(document.activeElement, sandbox.children[1]);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testEnd", function (tc) {
        setup(tc);
        sandbox.innerHTML =
            repeat("<div class='test' tabIndex='-1'>Item</div>", 10) +
            "<div>Dummy</div>";

        var k = new KeyboardNavigation(sandbox, "vertical");
        sandbox.children[5].focus();
        sendKey("End", sandbox);

        tc.areEqual(document.activeElement, sandbox.children[9]);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testVerticalArrows", function (tc) {
        setup(tc);
        sandbox.innerHTML =
            "<div>Dummy</div>" +
            repeat("<div class='test' tabIndex='-1'>Item</div>", 2) +
            "<div>Dummy</div>" +
            repeat("<div class='test' tabIndex='-1'>Item</div>", 4) +
            "<div>Dummy</div>";

        var k = new KeyboardNavigation(sandbox, "vertical");
        sandbox.children[1].focus();

        sendKey("Up", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[1]);
        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[2]);
        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[4]);
        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[5]);
        sendKey("Up", sandbox);
        sendKey("Up", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[2]);
        sendKey("Down", sandbox);
        sendKey("Down", sandbox);
        sendKey("Down", sandbox);
        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[7]);
        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[7]);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testHorizontalArrows", function (tc) {
        setup(tc);
        sandbox.innerHTML =
            "<div>Dummy</div>" +
            repeat("<div class='test' tabIndex='-1'>Item</div>", 2) +
            "<div>Dummy</div>" +
            repeat("<div class='test' tabIndex='-1'>Item</div>", 4) +
            "<div>Dummy</div>";

        var k = new KeyboardNavigation(sandbox, "horizontal");
        sandbox.children[1].focus();

        sendKey("Left", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[1]);
        sendKey("Right", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[2]);
        sendKey("Right", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[4]);
        sendKey("Right", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[5]);
        sendKey("Left", sandbox);
        sendKey("Left", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[2]);
        sendKey("Right", sandbox);
        sendKey("Right", sandbox);
        sendKey("Right", sandbox);
        sendKey("Right", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[7]);
        sendKey("Right", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[7]);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testPaging", function (tc) {
        setup(tc);
        sandbox.innerHTML =
            "<div style='height:50px;overflow:scroll'>" +
                repeat("<div class='test' style='height:10px' tabIndex='-1'>Item</div>", 50) +
            "</div>";
        var scroller = sandbox.firstChild;

        var k = new KeyboardNavigation(scroller, "vertical");
        scroller.firstChild.focus();

        sendKey("PageDown", scroller);
        tc.areEqual(document.activeElement, scroller.children[4]);
        sendKey("Up", scroller);
        tc.areEqual(document.activeElement, scroller.children[3]);

        sendKey("PageDown", scroller);
        tc.areEqual(document.activeElement, scroller.children[4]);
        sendKey("PageDown", scroller);
        tc.areEqual(document.activeElement, scroller.children[9]);
        sendKey("PageDown", scroller);
        tc.areEqual(document.activeElement, scroller.children[14]);

        sendKey("PageUp", scroller);
        tc.areEqual(document.activeElement, scroller.children[10]);
        sendKey("PageUp", scroller);
        tc.areEqual(document.activeElement, scroller.children[5]);
        sendKey("PageUp", scroller);
        tc.areEqual(document.activeElement, scroller.children[0]);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testExclude", function (tc) {
        setup(tc);
        sandbox.innerHTML =
            repeat("<div tabIndex='-1'>Item</div>", 2) +
            repeat("<div class='skip' tabIndex='-1'>Item</div>", 2) +
            repeat("<div style='display:none' tabIndex='-1'>Item</div>", 2) +
            repeat("<div tabIndex='-1'>Item</div>", 2);

        var k = new KeyboardNavigation(sandbox, "vertical", null, ".skip");
        sandbox.firstChild.focus();

        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[1]);
        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[6]);
        sendKey("Down", sandbox);
        tc.areEqual(document.activeElement, sandbox.children[7]);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testUpdate", function (tc) {
        setup(tc);
        sandbox.innerHTML = repeat("<div tabIndex='-1'>Item</div>", 5);

        var k = new KeyboardNavigation(sandbox, "vertical");
        sandbox.firstChild.focus();

        sandbox.firstChild.removeNode(true);
        k.update();
        tc.areEqual(sandbox.firstChild.tabIndex, 0);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testComponentUpdate", function (tc) {
        setup(tc);
        sandbox.innerHTML = repeat("<div tabIndex='-1'>Item</div>", 5);

        var component = new Jx.Component();
        var k = new KeyboardNavigation(sandbox, "vertical", component);
        sandbox.firstChild.focus();

        sandbox.firstChild.removeNode(true);
        component.fire("contentUpdated");
        tc.areEqual(sandbox.firstChild.tabIndex, 0);
        k.dispose();
    });

    Tx.test("KeyboardNavigation.testReset", function (tc) {
        setup(tc);
        sandbox.innerHTML = repeat("<div tabIndex='-1'>Item</div>", 5);

        var component = new Jx.Component();
        var k = new KeyboardNavigation(sandbox, "vertical", component);

        sandbox.insertAdjacentHTML("afterbegin", repeat("<div tabIndex='-1'>Item</div>", 3));
        tc.areEqual(sandbox.children[0].tabIndex, -1);
        tc.areEqual(sandbox.children[3].tabIndex, 0);

        k.update(false); // no reset
        tc.areEqual(sandbox.children[0].tabIndex, -1);
        tc.areEqual(sandbox.children[3].tabIndex, 0);

        k.update(true); // reset
        tc.areEqual(sandbox.children[0].tabIndex, 0);
        tc.areEqual(sandbox.children[3].tabIndex, -1);

        k.dispose();
    });

})();

