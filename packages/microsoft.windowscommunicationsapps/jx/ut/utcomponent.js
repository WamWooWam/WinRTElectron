
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Component UTs

/// <reference path="../core/Component.js" />

/*global Jx,Tx*/

// Verify default Component values
Tx.test("ComponentTests.testDefaults", function (tc) {
    var CompA = function (name) {
        this.initComponent();
        this.name = name;
    };

    Jx.augment(CompA, Jx.Component);

    var c = new CompA("c");
    tc.ok(c.name === "c");
    tc.ok(c.getParent() === null);
    tc.ok(c.isRoot());
    tc.ok(c.getChildrenCount() === 0);
    tc.ok("on" in c && "fire" in c);
    tc.ok("initAttr" in c);
    tc.ok("onActivateUI" in c);
    tc.ok("onDeactivateUI" in c);
        
    c.shutdownComponent();
});

Tx.test("ComponentTests.testQueryService", function (tc) {

    // build a component tree root = C -> B -> A

    var CompA = function () {
        this.initComponent();
    };
    Jx.augment(CompA, Jx.Component);
    CompA.prototype.onQueryService = function (serviceName) {
        return (serviceName === "aaa") ? { aaa: true } : null;
    };

    var CompB = function () {
        this.initComponent();
        this.append(new CompA());
    };
    Jx.augment(CompB, Jx.Component);

    var CompC = function () {
        this.initComponent();
        this.append(new CompB());
    };
    Jx.augment(CompC, Jx.Component);
    CompC.prototype.onQueryService = function (serviceName) {
        return (serviceName === "ccc") ? { ccc: true } : null;
    };

    // create the component tree starting with the root
    var c = new CompC();

    // get the leaf node
    var a = c.getChild(0).getChild(0);

    // query some services
    var srv = a.queryService("aaa");
    tc.isTrue("aaa" in srv);
    srv = a.queryService("ccc");
    tc.isTrue("ccc" in srv);
    srv = a.queryService("unknown");
    tc.areEqual(srv, null);

    a.shutdownComponent();
});
