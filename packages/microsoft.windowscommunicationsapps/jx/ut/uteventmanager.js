
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// EventManager UTs

/// <reference path="../core/EventManager.js" />
/// <reference path="../core/TreeNode.js" />

/*global Jx,Tx*/

(function() {   

    var TreeNodeWithName = function (name) {
        this.name = name;
    };
    
    Jx.augment(TreeNodeWithName, Jx.TreeNode);
    
    Tx.test("EventManagerTests.testAddListener1", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var a = function() {};
        var b = function() {};
        var c = function() {};

        em.addListener(null, "Foo", a);
        em.addListener(null, "Foo", b);
        em.addListener(null, "Bar", c);

        tc.ok(em._jxEvents.Foo.length === 2);
        tc.ok(em._jxEvents.Foo[0].fn === a);
        tc.ok(em._jxEvents.Foo[0].context === undefined);
        tc.ok(em._jxEvents.Foo[1].fn === b);
        tc.ok(em._jxEvents.Foo[1].context === undefined);
        tc.ok(em._jxEvents.Bar.length === 1);
        tc.ok(em._jxEvents.Bar[0].fn === c);
        tc.ok(em._jxEvents.Bar[0].context === undefined);
  });
  
    Tx.test("EventManagerTests.testAddListener2", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var obj = {};

        var a = function() {};
        var b = function() {};
        var c = function() {};

        em.addListener(null, "Foo", a, obj);
        em.addListener(null, "Foo", b, obj);
        em.addListener(null, "Bar", c, obj);

        tc.ok(em._jxEvents.Foo.length === 2);
        tc.ok(em._jxEvents.Foo[0].fn === a);
        tc.ok(em._jxEvents.Foo[0].context === obj);
        tc.ok(em._jxEvents.Foo[1].fn === b);
        tc.ok(em._jxEvents.Foo[1].context === obj);
        tc.ok(em._jxEvents.Bar.length === 1);
        tc.ok(em._jxEvents.Bar[0].fn === c);
        tc.ok(em._jxEvents.Bar[0].context === obj);
    });

    Tx.test("EventManagerTests.testAddListener3", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var obj1 = {};
        var obj2 = {};

        var a = function () { };
        var b = function () { };
        var c = function () { };

        em.addListener(obj1, "Foo", a);
        em.addListener(obj1, "Foo", b);
        em.addListener(obj1, "Bar", c);

        tc.ok(obj1._jxEvents.Foo.length === 2);
        tc.ok(obj1._jxEvents.Foo[0].fn === a);
        tc.ok(obj1._jxEvents.Foo[0].context === undefined);
        tc.ok(obj1._jxEvents.Foo[1].fn === b);
        tc.ok(obj1._jxEvents.Foo[1].context === undefined);
        tc.ok(obj1._jxEvents.Bar.length === 1);
        tc.ok(obj1._jxEvents.Bar[0].fn === c);
        tc.ok(obj1._jxEvents.Bar[0].context === undefined);

        tc.ok(obj2._jxEvents === undefined);

        em.addListener(obj2, "Foo", a);
        em.addListener(obj2, "Foo", b);
        em.addListener(obj2, "Bar", c);

        tc.ok(obj1._jxEvents.Foo.length === 2);
        tc.ok(obj1._jxEvents.Foo[0].fn === a);
        tc.ok(obj1._jxEvents.Foo[0].context === undefined);
        tc.ok(obj1._jxEvents.Foo[1].fn === b);
        tc.ok(obj1._jxEvents.Foo[1].context === undefined);
        tc.ok(obj1._jxEvents.Bar.length === 1);
        tc.ok(obj1._jxEvents.Bar[0].fn === c);
        tc.ok(obj1._jxEvents.Bar[0].context === undefined);

        tc.ok(obj2._jxEvents.Foo.length === 2);
        tc.ok(obj2._jxEvents.Foo[0].fn === a);
        tc.ok(obj2._jxEvents.Foo[0].context === undefined);
        tc.ok(obj2._jxEvents.Foo[1].fn === b);
        tc.ok(obj2._jxEvents.Foo[1].context === undefined);
        tc.ok(obj2._jxEvents.Bar.length === 1);
        tc.ok(obj2._jxEvents.Bar[0].fn === c);
        tc.ok(obj2._jxEvents.Bar[0].context === undefined);
    });

    Tx.test("EventManagerTests.testRemoveListener1", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var a = function () { };
        var b = function () { };
        var c = function () { };

        em.addListener(null, "Foo", a);
        em.addListener(null, "Foo", b);
        em.addListener(null, "Foo", c);

        em.addListener(null, "Bar", a);
        em.addListener(null, "Bar", b);

        em.removeListener(null, "Foo", b);
        em.removeListener(null, "Bar", c);

        tc.ok(em._jxEvents.Foo.length === 2);
        tc.ok(em._jxEvents.Foo[0].fn === a);
        tc.ok(em._jxEvents.Foo[0].context === undefined);
        tc.ok(em._jxEvents.Foo[1].fn === c);
        tc.ok(em._jxEvents.Foo[1].context === undefined);
        tc.ok(em._jxEvents.Bar.length === 2);
        tc.ok(em._jxEvents.Bar[0].fn === a);
        tc.ok(em._jxEvents.Bar[0].context === undefined);
        tc.ok(em._jxEvents.Bar[1].fn === b);
        tc.ok(em._jxEvents.Bar[1].context === undefined);
    });

    Tx.test("EventManagerTests.testRemoveListener2", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var obj = {};

        var a = function () { };
        var b = function () { };
        var c = function () { };

        em.addListener(null, "Foo", a, obj);
        em.addListener(null, "Foo", b, obj);
        em.addListener(null, "Foo", c, obj);

        em.addListener(null, "Bar", a, obj);
        em.addListener(null, "Bar", b, obj);

        em.removeListener(null, "Foo", b, obj);
        em.removeListener(null, "Bar", c, obj);

        tc.ok(em._jxEvents.Foo.length === 2);
        tc.ok(em._jxEvents.Foo[0].fn === a);
        tc.ok(em._jxEvents.Foo[0].context === obj);
        tc.ok(em._jxEvents.Foo[1].fn === c);
        tc.ok(em._jxEvents.Foo[1].context === obj);
        tc.ok(em._jxEvents.Bar.length === 2);
        tc.ok(em._jxEvents.Bar[0].fn === a);
        tc.ok(em._jxEvents.Bar[0].context === obj);
        tc.ok(em._jxEvents.Bar[1].fn === b);
        tc.ok(em._jxEvents.Bar[1].context === obj);

        em.removeListener(null, "Foo", a);
        em.removeListener(null, "Bar", a);

        tc.ok(em._jxEvents.Foo.length === 2);
        tc.ok(em._jxEvents.Foo[0].fn === a);
        tc.ok(em._jxEvents.Foo[0].context === obj);
        tc.ok(em._jxEvents.Foo[1].fn === c);
        tc.ok(em._jxEvents.Foo[1].context === obj);
        tc.ok(em._jxEvents.Bar.length === 2);
        tc.ok(em._jxEvents.Bar[0].fn === a);
        tc.ok(em._jxEvents.Bar[0].context === obj);
        tc.ok(em._jxEvents.Bar[1].fn === b);
        tc.ok(em._jxEvents.Bar[1].context === obj);
    });

    Tx.test("EventManagerTests.testRemoveListener3", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var obj1 = {};
        var obj2 = {};

        var a = function () { };
        var b = function () { };
        var c = function () { };

        em.addListener(obj1, "Foo", a);
        em.addListener(obj1, "Foo", b);
        em.addListener(obj1, "Foo", c);

        em.addListener(obj1, "Bar", a);
        em.addListener(obj1, "Bar", b);

        em.addListener(obj2, "Foo", a);
        em.addListener(obj2, "Foo", b);
        em.addListener(obj2, "Foo", c);

        em.addListener(obj2, "Bar", a);
        em.addListener(obj2, "Bar", b);

        em.removeListener(obj1, "Foo", b);
        em.removeListener(obj1, "Bar", c);

        tc.ok(obj1._jxEvents.Foo.length === 2);
        tc.ok(obj1._jxEvents.Foo[0].fn === a);
        tc.ok(obj1._jxEvents.Foo[0].context === undefined);
        tc.ok(obj1._jxEvents.Foo[1].fn === c);
        tc.ok(obj1._jxEvents.Foo[1].context === undefined);
        tc.ok(obj1._jxEvents.Bar.length === 2);
        tc.ok(obj1._jxEvents.Bar[0].fn === a);
        tc.ok(obj1._jxEvents.Bar[0].context === undefined);
        tc.ok(obj1._jxEvents.Bar[1].fn === b);
        tc.ok(obj1._jxEvents.Bar[1].context === undefined);

        tc.ok(obj2._jxEvents.Foo.length === 3);
        tc.ok(obj2._jxEvents.Foo[0].fn === a);
        tc.ok(obj2._jxEvents.Foo[0].context === undefined);
        tc.ok(obj2._jxEvents.Foo[1].fn === b);
        tc.ok(obj2._jxEvents.Foo[1].context === undefined);
        tc.ok(obj2._jxEvents.Foo[2].fn === c);
        tc.ok(obj2._jxEvents.Foo[2].context === undefined);
        tc.ok(obj2._jxEvents.Bar.length === 2);
        tc.ok(obj2._jxEvents.Bar[0].fn === a);
        tc.ok(obj2._jxEvents.Bar[0].context === undefined);
        tc.ok(obj2._jxEvents.Bar[1].fn === b);
        tc.ok(obj2._jxEvents.Bar[1].context === undefined);

        em.removeListener(obj2, "Foo", b);
        em.removeListener(obj2, "Bar", c);

        tc.ok(obj1._jxEvents.Foo.length === 2);
        tc.ok(obj1._jxEvents.Foo[0].fn === a);
        tc.ok(obj1._jxEvents.Foo[0].context === undefined);
        tc.ok(obj1._jxEvents.Foo[1].fn === c);
        tc.ok(obj1._jxEvents.Foo[1].context === undefined);
        tc.ok(obj1._jxEvents.Bar.length === 2);
        tc.ok(obj1._jxEvents.Bar[0].fn === a);
        tc.ok(obj1._jxEvents.Bar[0].context === undefined);
        tc.ok(obj1._jxEvents.Bar[1].fn === b);
        tc.ok(obj1._jxEvents.Bar[1].context === undefined);

        tc.ok(obj2._jxEvents.Foo.length === 2);
        tc.ok(obj2._jxEvents.Foo[0].fn === a);
        tc.ok(obj2._jxEvents.Foo[0].context === undefined);
        tc.ok(obj2._jxEvents.Foo[1].fn === c);
        tc.ok(obj2._jxEvents.Foo[1].context === undefined);
        tc.ok(obj2._jxEvents.Bar.length === 2);
        tc.ok(obj2._jxEvents.Bar[0].fn === a);
        tc.ok(obj2._jxEvents.Bar[0].context === undefined);
        tc.ok(obj2._jxEvents.Bar[1].fn === b);
        tc.ok(obj2._jxEvents.Bar[1].context === undefined);
    });

    Tx.test("EventManagerTests.testFire1", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var x = null;
        var y = null;
        var z = null;

        var a = function (ev) { x = ev.data.x; };
        var b = function (ev) { y = ev.data.y; };
        var c = function (ev) { z = ev.data.z; };

        em.addListener(null, "Foo", a);
        em.addListener(null, "Foo", b);
        em.addListener(null, "Bar", c);

        em.fire(null, "Foo", { x: 1, y: 2, z: 3 });

        tc.ok(x === 1);
        tc.ok(y === 2);
        tc.ok(z === null);

        em.fire(null, "Bar", { x: 11, y: 22, z: 33 });

        tc.ok(x === 1);
        tc.ok(y === 2);
        tc.ok(z === 33);
    });

    Tx.test("EventManagerTests.testFire2", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var obj = { x: null, y: null, z: null };

        var a = function (ev) { this.x = ev.data.x; };
        var b = function (ev) { this.y = ev.data.y; };
        var c = function (ev) { this.z = ev.data.z; };

        em.addListener(null, "Foo", a, obj);
        em.addListener(null, "Foo", b, obj);
        em.addListener(null, "Bar", c, obj);

        em.fire(null, "Foo", { x: 1, y: 2, z: 3 });

        tc.ok(obj.x === 1);
        tc.ok(obj.y === 2);
        tc.ok(obj.z === null);

        em.fire(null, "Bar", { x: 11, y: 22, z: 33 });

        tc.ok(obj.x === 1);
        tc.ok(obj.y === 2);
        tc.ok(obj.z === 33);
    });

    Tx.test("EventManagerTests.testFire3", function (tc) {
        var em = Jx.EventManager;

        em._jxEvents = {};

        var obj1 = {};
        var obj2 = {};

        var x1 = null;
        var y1 = null;
        var z1 = null;

        var x2 = null;
        var y2 = null;
        var z2 = null;

        var a1 = function (ev) { x1 = ev.data.x; };
        var b1 = function (ev) { y1 = ev.data.y; };
        var c1 = function (ev) { z1 = ev.data.z; };

        var a2 = function (ev) { x2 = ev.data.x; };
        var b2 = function (ev) { y2 = ev.data.y; };
        var c2 = function (ev) { z2 = ev.data.z; };

        em.addListener(obj1, "Foo", a1);
        em.addListener(obj1, "Foo", b1);
        em.addListener(obj1, "Bar", c1);

        em.addListener(obj2, "Foo", a2);
        em.addListener(obj2, "Foo", b2);
        em.addListener(obj2, "Bar", c2);

        em.fire(obj1, "Foo", { x: 1, y: 2, z: 3 });

        tc.ok(x1 === 1);
        tc.ok(y1 === 2);
        tc.ok(z1 === null);

        tc.ok(x2 === null);
        tc.ok(y2 === null);
        tc.ok(z2 === null);

        em.fire(obj1, "Bar", { x: 11, y: 22, z: 33 });

        tc.ok(x1 === 1);
        tc.ok(y1 === 2);
        tc.ok(z1 === 33);

        tc.ok(x2 === null);
        tc.ok(y2 === null);
        tc.ok(z2 === null);

        em.fire(obj2, "Foo", { x: 111, y: 222, z: 333 });

        tc.ok(x1 === 1);
        tc.ok(y1 === 2);
        tc.ok(z1 === 33);

        tc.ok(x2 === 111);
        tc.ok(y2 === 222);
        tc.ok(z2 === null);

        em.fire(obj2, "Bar", { x: 1111, y: 2222, z: 3333 });

        tc.ok(x1 === 1);
        tc.ok(y1 === 2);
        tc.ok(z1 === 33);

        tc.ok(x2 === 111);
        tc.ok(y2 === 222);
        tc.ok(z2 === 3333);
    });

    Tx.test("EventManagerTests.testStaging1", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var route = 0;
        var direct = 0;
        var bubble = 0;

        var wrong = 0;

        var expectRouteAndBubble = function (ev) 
        {
            if (ev.stage === em.Stages.routing) { route++; }
            if (ev.stage === em.Stages.direct) { wrong++; }
            if (ev.stage === em.Stages.bubbling) { bubble++; }
        };   

        var expectDirect = function (ev) 
        {
            if (ev.stage === em.Stages.routing) { wrong++; }
            if (ev.stage === em.Stages.direct) { direct++; }
            if (ev.stage === em.Stages.bubbling) { wrong++; }
        };

        em.addListener(node1, "Event", expectRouteAndBubble);
        em.addListener(node2, "Event", expectRouteAndBubble);
        em.addListener(node3, "Event", expectDirect);

        em.fire(node3, "Event");

        tc.ok(route === 2);
        tc.ok(direct === 1);
        tc.ok(bubble === 2);

        tc.ok(wrong === 0);
    });

    Tx.test("EventManagerTests.testStaging2", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var route = 0;
        var direct = 0;
        var bubble = 0;

        var wrong = 0;

        var expectRouteAndBubble = function (ev) {
        if (ev.stage === em.Stages.routing) { route++; }
        if (ev.stage === em.Stages.direct) { wrong++; }
        if (ev.stage === em.Stages.bubbling) { bubble++; }
        };

        var expectDirect = function (ev) {
        if (ev.stage === em.Stages.routing) { wrong++; }
        if (ev.stage === em.Stages.direct) { direct++; }
        if (ev.stage === em.Stages.bubbling) { wrong++; }
        };

        var expectNothing = function (ev) {
        if (ev.stage === em.Stages.routing) { wrong++; }
        if (ev.stage === em.Stages.direct) { wrong++; }
        if (ev.stage === em.Stages.bubbling) { wrong++; }
        };

        em.addListener(node1, "Event", expectRouteAndBubble);
        em.addListener(node2, "Event", expectDirect);
        em.addListener(node3, "Event", expectNothing);

        em.fire(node2, "Event");

        tc.ok(route === 1);
        tc.ok(direct === 1);
        tc.ok(bubble === 1);

        tc.ok(wrong === 0);
    });

    Tx.test("EventManagerTests.testStaging3", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();

        node1.appendChild(node2);

        var routes = 0;
        var bubbles = 0;

        var route = 0;
        var direct = 0;
        var bubble = 0;

        var wrong = 0;

        var routesAndBubbles = function (ev) {
            if (ev.routes) { routes++; }
            if (ev.bubbles) { bubbles++; }
        };

        var expectRouteAndBubble = function (ev) {
            if (ev.stage === em.Stages.routing) { route++; }
            if (ev.stage === em.Stages.direct) { wrong++; }
            if (ev.stage === em.Stages.bubbling) { bubble++; }
        };

        var expectDirect = function (ev) {
            if (ev.stage === em.Stages.routing) { wrong++; }
            if (ev.stage === em.Stages.direct) { direct++; }
            if (ev.stage === em.Stages.bubbling) { wrong++; }
        };

        em.addListener(node1, "Event", expectRouteAndBubble);
        em.addListener(node2, "Event", expectDirect);
        em.addListener(node2, "Event", routesAndBubbles);

        em.fire(node2, "Event");

        tc.ok(routes === 1);
        tc.ok(bubbles === 1);

        tc.ok(route === 1);
        tc.ok(direct === 1);
        tc.ok(bubble === 1);

        tc.ok(wrong === 0);

        em.fire(node2, "Event", null, { routes: false });

        tc.ok(routes === 1);
        tc.ok(bubbles === 2);

        tc.ok(route === 1);
        tc.ok(direct === 2);
        tc.ok(bubble === 2);

        tc.ok(wrong === 0);

        em.fire(node2, "Event", null, { bubbles: false });

        tc.ok(routes === 2);
        tc.ok(bubbles === 2);

        tc.ok(route === 2);
        tc.ok(direct === 3);
        tc.ok(bubble === 2);

        tc.ok(wrong === 0);

        em.fire(node2, "Event", null, { routes: false, bubbles: false });

        tc.ok(routes === 2);
        tc.ok(bubbles === 2);

        tc.ok(route === 2);
        tc.ok(direct === 4);
        tc.ok(bubble === 2);

        tc.ok(wrong === 0);
    });

    Tx.test("EventManagerTests.testCancel1", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var cancelled = 0;
        var hit       = 0;

        var cancel = function (ev) {
            cancelled++;
            ev.cancel = true;
        };

        var eventHit = function (/*ev*/) {
            hit++;
        };

        em.addListener(node1, "Event", cancel);
        em.addListener(node2, "Event", eventHit);
        em.addListener(node3, "Event", eventHit);

        em.fire(node3, "Event");

        tc.ok(cancelled === 1);
        tc.ok(hit === 0);

        em.fire(node2, "Event");

        tc.ok(cancelled === 2);
        tc.ok(hit === 0);
    });

    Tx.test("EventManagerTests.testCancel2", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var cancelled = 0;
        var hit       = 0;

        var cancelDirect = function (ev) {
            if (ev.stage === em.Stages.direct) {
                cancelled++;
                ev.cancel = true;
            }
        };

        var eventHit = function (/*ev*/) {
            hit++;
        };

        em.addListener(node1, "Event", eventHit);
        em.addListener(node2, "Event", cancelDirect);
        em.addListener(node3, "Event", eventHit);

        em.fire(node3, "Event");

        tc.ok(cancelled === 0);
        tc.ok(hit === 3);

        em.fire(node2, "Event");

        tc.ok(cancelled === 1);
        tc.ok(hit === 4);
    });

    Tx.test("EventManagerTests.testCancel3", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var cancelled = 0;
        var hit       = 0;

        var cancelBubbling = function (ev) {
            if (ev.stage === em.Stages.bubbling) {
                cancelled++;
                ev.cancel = true;
            }
        };

        var eventHit = function (/*ev*/) {
            hit++;
        };

        em.addListener(node1, "Event", eventHit);
        em.addListener(node2, "Event", cancelBubbling);
        em.addListener(node3, "Event", eventHit);

        em.fire(node3, "Event");

        tc.ok(cancelled === 1);
        tc.ok(hit === 2);

        em.fire(node2, "Event");

        tc.ok(cancelled === 1);
        tc.ok(hit === 4);
    });

    Tx.test("EventManagerTests.testBroadcast1", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var broadcast = 0;
        var wrong     = 0;

        var onBroadcast = function(ev) {
            if (ev.stage === em.Stages.broadcast) {
                broadcast++;
            } else {
                wrong++;
            }
        };

        em.addListener(node1, "Event", onBroadcast);
        em.addListener(node2, "Event", onBroadcast);
        em.addListener(node3, "Event", onBroadcast);

        Jx.root = node1;

        em.broadcast("Event");

        tc.ok(broadcast === 3);
        tc.ok(wrong === 0);

        Jx.root = node2;

        em.broadcast("Event");

        tc.ok(broadcast === 5);
        tc.ok(wrong === 0);
    });

    Tx.test("EventManagerTests.testBroadcast2", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var broadcast = 0;
        var wrong     = 0;

        var onBroadcast = function(ev) {
            if (ev.stage === em.Stages.broadcast) {
                broadcast++;
            } else {
                wrong++;
            }
        };

        em.addListener(node1, "Event", onBroadcast);
        em.addListener(node2, "Event", onBroadcast);
        em.addListener(node3, "Event", onBroadcast);

        em.broadcast("Event", null, node1);

        tc.ok(broadcast === 3);
        tc.ok(wrong === 0);

        Jx.root = node1;

        em.broadcast("Event", null, node3);

        tc.ok(broadcast === 4);
        tc.ok(wrong === 0);
    });

    Tx.test("EventManagerTests.testBroadcast3", function (tc) {
        var em = Jx.EventManager;
        var N = TreeNodeWithName;

        em._jxEvents = {};

        var node1 = new N();
        var node2 = new N();
        var node3 = new N();

        node1.appendChild(node2);
        node2.appendChild(node3);

        var broadcast = 0;
        var canceled  = 0;
        var wrong     = 0;

        var onBroadcast = function(ev) {
            if (ev.stage === em.Stages.broadcast) {
                broadcast++;
            } else {
                wrong++;
            }
        };

        var cancelBroadcast = function(ev) 
        {
            canceled++;
            ev.cancel = true;
        };

        var expectNothing = function() 
        {
            wrong++;
        };

        em.addListener(node1, "Event", onBroadcast);
        em.addListener(node2, "Event", cancelBroadcast);
        em.addListener(node3, "Event", expectNothing);

        Jx.root = node1;

        em.broadcast("Event");

        tc.ok(broadcast === 1);
        tc.ok(canceled === 1);
        tc.ok(wrong === 0);

        Jx.root = node2;

        em.broadcast("Event");

        tc.ok(broadcast === 1);
        tc.ok(canceled === 2);
        tc.ok(wrong === 0);
    });
})();