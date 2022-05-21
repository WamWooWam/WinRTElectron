
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

(function () {

    //
    // Simple tree node
    //

    function TN() {
        this.initTreeNode();
    }

    TN.prototype.dispose = function () {
        this.disposeTreeNode();
    };

    Tx.mix(TN.prototype, Tx.TreeNode);

    //
    // Tests
    //

    Tx.test("Tx.TreeNode: ctor/dispose", function (tc) {
        var tn = new TN();

        tc.ok(Tx.isArray(tn.children));
        tc.areEqual(tn.children.length, 0);
        tc.areEqual(tn.parent, null);
       
        tn.dispose();

        tc.ok(Tx.isArray(tn.children));
        tc.areEqual(tn.children.length, 0);
        tc.areEqual(tn.parent, null);
    });

    Tx.test("Tx.TreeNode: appendChild", function (tc) {
        var parent = new TN();
        var child = new TN();

        parent.appendChild(child);

        tc.areEqual(parent.children.length, 1);
        tc.areEqual(parent.children[0], child);
        tc.areEqual(child.parent, parent);

        parent.dispose();

        tc.ok(Tx.isArray(parent.children));
        tc.areEqual(parent.children.length, 0);
        tc.areEqual(parent.parent, null);

        tc.ok(Tx.isArray(child.children));
        tc.areEqual(child.children.length, 0);
        tc.areEqual(child.parent, null);
    });

    Tx.test("Tx.TreeNode: appendChildren", function (tc) {
        var parent = new TN();
        var child0 = new TN();
        var child1 = new TN();

        parent.appendChildren(child0, child1);

        tc.areEqual(parent.children.length, 2);
        tc.areEqual(parent.children[0], child0);
        tc.areEqual(parent.children[1], child1);
        tc.areEqual(child0.parent, parent);
        tc.areEqual(child1.parent, parent);

        parent.dispose();

        tc.ok(Tx.isArray(parent.children));
        tc.areEqual(parent.children.length, 0);
        tc.areEqual(parent.parent, null);

        tc.ok(Tx.isArray(child0.children));
        tc.areEqual(child0.children.length, 0);
        tc.areEqual(child0.parent, null);

        tc.ok(Tx.isArray(child1.children));
        tc.areEqual(child1.children.length, 0);
        tc.areEqual(child1.parent, null);
    });

    Tx.test("Tx.TreeNode: isRootNode", function (tc) {
        var parent = new TN();
        var child = new TN();

        tc.ok(parent.isRootNode());
        tc.ok(child.isRootNode());

        parent.appendChild(child);

        tc.ok(parent.isRootNode());
        tc.ok(!child.isRootNode());

        parent.dispose();

        tc.ok(parent.isRootNode());
        tc.ok(child.isRootNode());
    });

    Tx.test("Tx.TreeNode: removeChildAt(0) 1 child", function (tc) {
        var parent = new TN();
        var child = new TN();

        parent.appendChild(child);
        parent.removeChildAt(0);

        tc.areEqual(parent.children.length, 0);
        tc.areEqual(child.parent, null);

        parent.dispose();
    });

    Tx.test("Tx.TreeNode: removeChildAt(0) 2 children", function (tc) {
        var parent = new TN();
        var child0 = new TN();
        var child1 = new TN();

        parent.appendChildren(child0, child1);
        parent.removeChildAt(0);

        tc.areEqual(parent.children.length, 1);
        tc.areEqual(parent.children[0], child1);
        tc.areEqual(child0.parent, null);
        tc.areEqual(child1.parent, parent);
        
        parent.dispose();
    });

    Tx.test("Tx.TreeNode: removeChildAt(1) 2 children", function (tc) {
        var parent = new TN();
        var child0 = new TN();
        var child1 = new TN();

        parent.appendChildren(child0, child1);
        parent.removeChildAt(1);

        tc.areEqual(parent.children.length, 1);
        tc.areEqual(parent.children[0], child0);
        tc.areEqual(child0.parent, parent);
        tc.areEqual(child1.parent, null);

        parent.dispose();
    });

    Tx.test("Tx.TreeNode: removeChild(0) 1 child", function (tc) {
        var parent = new TN();
        var child = new TN();

        parent.appendChild(child);
        parent.removeChild(child);

        tc.areEqual(parent.children.length, 0);
        tc.areEqual(child.parent, null);

        parent.dispose();
    });

    Tx.test("Tx.TreeNode: removeChild(0) 2 children", function (tc) {
        var parent = new TN();
        var child0 = new TN();
        var child1 = new TN();

        parent.appendChildren(child0, child1);
        parent.removeChild(child0);

        tc.areEqual(parent.children.length, 1);
        tc.areEqual(parent.children[0], child1);
        tc.areEqual(child0.parent, null);
        tc.areEqual(child1.parent, parent);

        parent.dispose();
    });

    Tx.test("Tx.TreeNode: removeChild(1) 2 children", function (tc) {
        var parent = new TN();
        var child0 = new TN();
        var child1 = new TN();

        parent.appendChildren(child0, child1);
        parent.removeChild(child1);

        tc.areEqual(parent.children.length, 1);
        tc.areEqual(parent.children[0], child0);
        tc.areEqual(child0.parent, parent);
        tc.areEqual(child1.parent, null);

        parent.dispose();
    });

    // TODO: add more tests (i.e. deep trees remove and dispose)
})();
