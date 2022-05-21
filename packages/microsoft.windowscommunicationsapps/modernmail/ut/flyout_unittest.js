
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var sandbox;
    function setup(tc) {
        sandbox = document.getElementById("sandbox");
        WinJS.UI.disableAnimations();

        tc.cleanup = function () {
            WinJS.UI.enableAnimations();
            sandbox.innerText = "";
            sandbox = null;
        };
    }

    var TestContent = function (html) {
        Mail.FlyoutContent.call(this);
        this._html = html;
        this.activated = this.deactivated = 0;
    }
    Jx.inherit(TestContent, Mail.FlyoutContent);
    TestContent.prototype.setFlyout = function (flyout) {
        this._flyout = this.flyout = flyout;
    };
    TestContent.prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "'>" + this._html + "</div>";
    };
    TestContent.prototype.onActivateUI = function (ui) {
        this.activated++;
    };
    TestContent.prototype.onDeactivateUI = function (ui) {
        this.deactivated++;
    };

    Tx.test("Flyout.testHost", function (tc) {
        setup(tc);

        var content1 = new TestContent("<div>Hi</div>"),
            flyout1 = new Mail.Flyout(sandbox, content1, { anchor: sandbox, className: "hi" });

        tc.ok(sandbox.querySelector(".mailFlyout.hi"));
        tc.areEqual(content1.flyout, flyout1);
        tc.areEqual(content1.activated, 0);
        tc.areEqual(content1.deactivated, 0);

        var content2 = new TestContent("<div>Bye</div>"),
            flyout2 = new Mail.Flyout(sandbox, content2, { anchor: sandbox, className: "bye" });

        tc.ok(sandbox.querySelector(".mailFlyout.bye"));
        tc.areEqual(sandbox.querySelectorAll(".mailFlyout").length, 2);
        tc.areEqual(content2.flyout, flyout2);
        tc.areEqual(content2.activated, 0);
        tc.areEqual(content2.deactivated, 0);

        flyout1.dispose();
        tc.ok(sandbox.querySelector(".bye"));
        tc.ok(!sandbox.querySelector(".hi"));
        tc.areEqual(content1.activated, 0);
        tc.areEqual(content1.deactivated, 0);
        tc.areEqual(content1.flyout, null);

        flyout2.dispose();
        tc.ok(!sandbox.querySelector(".bye"));
        tc.areEqual(content2.activated, 0);
        tc.areEqual(content2.deactivated, 0);
        tc.areEqual(content2.flyout, null);
    });

    Tx.asyncTest("Flyout.testContent", function (tc) {
        tc.stop();
        setup(tc);

        var content = new TestContent("<div class='foo'>Foo</div>"),
            flyout = new Mail.Flyout(sandbox, content, { anchor: sandbox, className: "host" });

        tc.areEqual(content.flyout, flyout);
        tc.ok(sandbox.querySelector(".host"));
        tc.ok(!sandbox.querySelector(".foo"));

        flyout.show().then(function () {
            // Show the content should activate the component
            tc.ok(sandbox.querySelector(".foo"));
            tc.areEqual(content.activated, 1);
            tc.areEqual(content.deactivated, 0);

            return flyout.hide();
        }).then(function () {
            // Hide should deactivate the component
            tc.ok(!sandbox.querySelector(".foo"));
            tc.ok(sandbox.querySelector(".host"));
            tc.areEqual(content.activated, 1);
            tc.areEqual(content.deactivated, 1);
            tc.areEqual(content.flyout, flyout);

            return flyout.show();
        }).then(function () {
            // Show again to re-activate the component
            tc.ok(sandbox.querySelector(".foo"));
            tc.areEqual(content.activated, 2);
            tc.areEqual(content.deactivated, 1);

            return flyout.hide();
        }).then(function () {
            // And hide again
            tc.ok(!sandbox.querySelector(".foo"));
            tc.ok(sandbox.querySelector(".host"));
            tc.areEqual(content.activated, 2);
            tc.areEqual(content.deactivated, 2);

            flyout.dispose();
            tc.ok(!sandbox.querySelector(".host"));
            tc.areEqual(content.activated, 2);
            tc.areEqual(content.deactivated, 2);
            tc.areEqual(content.flyout, null);

            tc.start();
        });
    });

    Tx.asyncTest("Flyout.testReplace", function (tc) {
        setup(tc);
        tc.stop();

        var content1 = new TestContent("<div class='foo'>Foo</div>"),
            content2 = new TestContent("<div class='bar'>Bar</div>"),
            flyout = new Mail.Flyout(sandbox, content1, { anchor: sandbox, className: "host" }),
            host = sandbox.querySelector(".host");

        tc.areEqual(content1.flyout, flyout);
        tc.ok(host);
        tc.ok(!sandbox.querySelector(".foo"));

        flyout.show().then(function () {
            tc.ok(foo = sandbox.querySelector(".foo"));
            tc.areEqual(content1.activated, 1);
            tc.areEqual(content1.deactivated, 0);

            return flyout.replace(content1);
        }).then(function () {
            // Replaced with the same content but on a different host
            var newHost = sandbox.querySelector(".host");
            tc.ok(newHost);
            tc.ok(host !== newHost);

            tc.ok(sandbox.querySelector(".foo"));
            tc.ok(content1.flyout);
            tc.ok(content1.flyout !== flyout);
            tc.areEqual(content1.activated, 2);
            tc.areEqual(content1.deactivated, 1);

            return content1.flyout.replace(content2);
        }).then(function () {
            // Replaced with different content
            tc.ok(!sandbox.querySelector(".foo"));
            tc.areEqual(content1.flyout, null);
            tc.areEqual(content1.activated, 2);
            tc.areEqual(content1.deactivated, 2);

            tc.ok(sandbox.querySelector(".bar"));
            tc.ok(content2.flyout);
            tc.areEqual(content2.activated, 1);
            tc.areEqual(content2.deactivated, 0);

            tc.ok(!sandbox.querySelector(".foo"));

            return content2.flyout.hide();
        }).then(function () {
            tc.ok(!sandbox.querySelector(".bar"));
            tc.areEqual(content2.activated, 1);
            tc.areEqual(content2.deactivated, 1);

            content2.flyout.dispose();
            tc.areEqual(content2.activated, 1);
            tc.areEqual(content2.deactivated, 1);
            tc.areEqual(content2.flyout, null);

            tc.start();
        });

    });

    Tx.asyncTest("Flyout.testSingleShow", function (tc) {
        setup(tc);
        tc.stop();

        var content = new TestContent("<div class='foo'>Foo</div>"),
            flyout = new Mail.Flyout(sandbox, content, { anchor: sandbox, className: "host", singleShow: true });

        tc.ok(sandbox.querySelector(".host"));
        tc.ok(!sandbox.querySelector(".foo"));

        flyout.show().then(function () {
            tc.ok(sandbox.querySelector(".foo"));
            tc.areEqual(content.activated, 1);
            tc.areEqual(content.deactivated, 0);

            return flyout.hide();
        }).then(function () {
            // Hiding the flyout should both deactivate and self-dispose the flyout
            tc.ok(!sandbox.querySelector(".foo"));
            tc.ok(!sandbox.querySelector(".host"));
            tc.areEqual(content.activated, 1);
            tc.areEqual(content.deactivated, 1);
            tc.areEqual(content.flyout, null);

            tc.start();
        });
    });

})();
