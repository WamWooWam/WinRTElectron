
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Microsoft,setImmediate,Tx,WinJS*/
(function() {
    var List = Jx.List;

    var host;

    //
    // Setup
    //
    function setup(tc) {
        host = document.getElementById("sandbox");
        WinJS.UI.disableAnimations();
        tc.cleanup = function () {
            host.innerText = "";
            host = null;
            WinJS.UI.enableAnimations();
        };
    }

    function factory(item) {
        var component = new Jx.Component();
        component.initComponent();
        component.getUI = function (ui) { ui.html = "<div>" + item + "</div>"; };
        return component;
    }
    
    //
    // Utils
    //

    var ChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType;

    var Source = function(items) {
        this.items = items;
        this.listeners = [];
    };

    Object.defineProperty(Source.prototype, "count", {
        get: function() {
            return this.items.length;
        }
    });

    Source.prototype.item = function(index) {
        return this.items[index];
    };

    Source.prototype.add = function(index, item) {
        this.items.splice(index, 0, item);
        this.listeners.forEach(function(listener) {
            listener({
                target: this,
                eType:  ChangeType.itemAdded,
                index:  index
            });
        }, this);
    };

    Source.prototype.remove = function(index) {
        this.items.splice(index, 1);
        this.listeners.forEach(function(listener) {
            listener({
                target: this,
                eType:  ChangeType.itemRemoved,
                index:  index
            });
        }, this);
    };

    Source.prototype.move = function (from, to) {
        var item = this.items.splice(from, 1)[0];
        this.items.splice(to, 0, item);
        this.listeners.forEach(function(listener) {
            listener({
                target: this,
                eType:  ChangeType.itemChanged,
                index:  to,
                previousIndex: from
            });
        }, this);
    };

    Source.prototype.reset = function (items) {
        this.items = items;
        this.listeners.forEach(function(listener) {
            listener({
                target: this,
                eType: ChangeType.reset
            });
        }, this);
    };

    Source.prototype.addEventListener = function(type, fn) {
        this.listeners.push(fn);
    };

    Source.prototype.removeEventListener = function(type, fn) {
        var index = this.listeners.indexOf(fn);
        this.listeners.splice(index, 1);
    };

    function qsa(el, query) {
        return Array.prototype.slice.call(el.querySelectorAll(query));
    }

    //
    // Tests
    //

    Tx.test("List.testInitialRender", function (tc) {
        setup(tc);

        var list = new List({ factory: factory }); 
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        var items = qsa(host, ".list div");

        tc.areEqual(3,   items.length,       "Items Rendered");
        tc.areEqual("3", items[0].innerText, "Item 1");
        tc.areEqual("2", items[1].innerText, "Item 2");
        tc.areEqual("1", items[2].innerText, "Item 3");

        list.shutdownUI();
    });

    Tx.asyncTest("List.testAdd", function (tc) {
        tc.stop();
        setup(tc);

        var list = new List({ factory: factory }); 
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        source.add(1, 5);

        list.waitForAnimation().then(function() {
            var items = qsa(host, ".list div");
            tc.areEqual(4,   items.length,       "Items Rendered");
            tc.areEqual("5", items[1].innerText, "New Item");

            list.shutdownUI();
            tc.start();
        });
    });

    Tx.asyncTest("List.testRemove", function (tc) {
        tc.stop();
        setup(tc);

        var list = new List({ factory: factory }); 
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        source.remove(1);

        list.waitForAnimation().then(function () {
            var items = qsa(host, ".list div");
            tc.areEqual(2,   items.length,       "Items Rendered");
            tc.areEqual("3", items[0].innerText, "Item 1");
            tc.areEqual("1", items[1].innerText, "Item 2");

            list.shutdownUI();
            tc.start();
        });
    });

    Tx.asyncTest("List.testMove", function (tc) {
        tc.stop();
        setup(tc);

        var list = new List({ factory: factory }); 
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        source.move(0, 2);

        list.waitForAnimation().then(function () {
            var items = qsa(host, ".list div");
            tc.areEqual(3,   items.length,       "Items Rendered");
            tc.areEqual("2", items[0].innerText, "Item 1");
            tc.areEqual("1", items[1].innerText, "Item 1");
            tc.areEqual("3", items[2].innerText, "Item 2");

            list.shutdownUI();
            tc.start();
        });
    });

    Tx.test("List.testReset", function (tc) {
        setup(tc);

        var list = new List({ factory: factory }); 
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        source.reset([4, 5]);

        var items = qsa(host, ".list div");
        tc.areEqual(2,   items.length,       "Items Rendered");
        tc.areEqual("4", items[0].innerText, "Item 1");
        tc.areEqual("5", items[1].innerText, "Item 2");

        list.shutdownUI();
    });

    Tx.test("List.testSetSource", function (tc) {
        setup(tc);

        var list = new List({ factory: factory }); 
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        var newSource = new Source([4, 5]);
        list.setSource(newSource);

        var items = qsa(host, ".list div");
        tc.areEqual(2,   items.length,       "Items Rendered");
        tc.areEqual("4", items[0].innerText, "Item 1");
        tc.areEqual("5", items[1].innerText, "Item 2");

        list.shutdownUI();
    });

    Tx.test("List.testReactivate", function (tc) {
        setup(tc);

        var list = new List({ factory: factory }); 
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);
        list.deactivateUI();

        var newSource = new Source([4, 5]);
        list.setSource(newSource);
        list.activateUI();

        var items = qsa(host, ".list div");
        tc.areEqual(2,   items.length,       "Items Rendered");
        tc.areEqual("4", items[0].innerText, "Item 1");
        tc.areEqual("5", items[1].innerText, "Item 2");

        list.shutdownUI();
    });

    Tx.asyncTest("List.testComponents", function (tc) {
        tc.stop();
        setup(tc);

        var activated = 0, deactivated = 0, shutdown = 0;
        var list = new List({
            factory: function (value) {
                var component = new Jx.Component();
                component.initComponent();
                component.getUI = function (ui) { ui.html = "<div id=" + this._id + ">C" + value + "</div>"; };
                component.activateUI = function () { tc.ok(host.querySelector("#" + this._id)); ++activated; };
                component.deactivateUI = function () { ++deactivated; };
                component.shutdownComponent = function () { ++shutdown; };
                return component;
            }
        });
        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        tc.areEqual(activated, 3);
        var items = qsa(host, ".list div");
        tc.areEqual(3,   items.length,       "Items Rendered");
        tc.areEqual("C3", items[0].innerText, "Item 1");
        tc.areEqual("C2", items[1].innerText, "Item 2");
        tc.areEqual("C1", items[2].innerText, "Item 3");

        source.add(1, 5);
        source.remove(3);

        list.waitForAnimation().then(function() {
            tc.areEqual(activated, 4);
            tc.areEqual(deactivated, 1);
            tc.areEqual(shutdown, 1);

            items = qsa(host, ".list div");
            tc.areEqual(3,   items.length,       "Items Rendered");
            tc.areEqual("C3", items[0].innerText, "Item 1");
            tc.areEqual("C5", items[1].innerText, "Item 2");
            tc.areEqual("C2", items[2].innerText, "Item 3");

            list.shutdownUI();
            tc.areEqual(deactivated, 4);
            tc.areEqual(shutdown, 4);

            tc.start();
        });
    });

    Tx.asyncTest("List.testGetTarget", function (tc) {
        tc.stop();
        setup(tc);

        var list = new List({
            factory: function (value) {
                var component = new Jx.Component();
                component.initComponent();
                component.getUI = function (ui) { ui.html = "<div id='c" + value + "'><div class='child'></div></div>"; };
                component.value = value;
                return component;
            }
        });

        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        tc.areEqual(list.getTarget({ target: host.querySelector("#c3") }).value, 3);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c2") }).value, 2);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c1") }).value, 1);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c2 .child") }).value, 2);
        tc.areEqual(list.getTarget({ target: host }), null);
        tc.areEqual(list.getTarget({ target: null }), null);

        source.add(1, 5);

        tc.areEqual(list.getTarget({ target: host.querySelector("#c5") }).value, 5);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c3") }).value, 3);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c2") }).value, 2);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c1") }).value, 1);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c1 .child") }).value, 1);
        
        source.remove(3);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c5") }).value, 5);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c3") }).value, 3);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c2") }).value, 2);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c1") }), null);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c1 .child") }), null);

        source.move(0, 2);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c5") }).value, 5);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c3") }).value, 3);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c2") }).value, 2);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c1") }), null);

        source.move(1, 0);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c5") }).value, 5);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c3") }).value, 3);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c2") }).value, 2);
        tc.areEqual(list.getTarget({ target: host.querySelector("#c1") }), null);

        list.waitForAnimation().then(function() {
            tc.areEqual(list.getTarget({ target: host.querySelector("#c5") }).value, 5);
            tc.areEqual(list.getTarget({ target: host.querySelector("#c3") }).value, 3);
            tc.areEqual(list.getTarget({ target: host.querySelector("#c2") }).value, 2);
            tc.areEqual(list.getTarget({ target: host.querySelector("#c1") }), null);

            list.shutdownUI();
            tc.start();
        });
    });
    
    Tx.asyncTest("List.testRequestAnimation", function (tc) {
        tc.stop();
        setup(tc);

        var requestCallback = null,
            list = new List({
                factory: factory,
                requestAnimation: function () {
                    return new WinJS.Promise(function (c) {
                        requestCallback = c;
                    });
                }
            });

        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        tc.areEqual(requestCallback, null);
        source.add(1, 5);
        tc.ok(requestCallback);

        var animationsComplete = function () { tc.fail(); };
        list.waitForAnimation().then(function () { animationsComplete(); });

        setImmediate(function () {
            animationsComplete = function () { tc.start(); };
            requestCallback();
        });
    });

    Tx.asyncTest("List.testWaitAtShutdown", function (tc) {
        tc.stop();
        setup(tc);

        var requestCallback = null,
            list = new List({
                factory: factory,
                requestAnimation: function () {
                    return new WinJS.Promise(function (c) {
                        requestCallback = c;
                    });
                }
            });

        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        source.add(1, 5);

        setImmediate(function () {
            var complete = false;
            list.waitForAnimation().then(function () { complete = true; });

            tc.areEqual(complete, false);
            list.shutdownUI(); // Shutdown should cause waitForAnimation to trigger immediately
            tc.areEqual(complete, true);
            tc.start();
        });
    });

    Tx.asyncTest("List.testCanceledWait", function (tc) {
        tc.stop();
        setup(tc);

        var requestCallback = null,
            list = new List({
                factory: factory,
                requestAnimation: function () {
                    return new WinJS.Promise(function (c) {
                        requestCallback = c;
                    });
                }
            });

        var source = new Source([3, 2, 1]);
        list.setSource(source);
        list.initUI(host);

        source.add(1, 5);

        var animationsComplete = function () { tc.fail(); };
        list.waitForAnimation().then(function () { animationsComplete(); });
        list.waitForAnimation().cancel(); // A canceled wait should not cancel the animation or a different waiter

        setImmediate(function () {
            animationsComplete = function () { tc.start(); };
            requestCallback();
        });
    });

})();
