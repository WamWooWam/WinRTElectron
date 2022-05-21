
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\core\TreeNode.js" />

/*global Tx,Jx*/

(function() {
   
    var TreeNodeWithName = function (name) {
        this.name = name;
    };
    
    Jx.augment(TreeNodeWithName, Jx.TreeNode);

    Tx.test("TreeNodeTests.testTreeWithOneNode", function (tc) {             
        var N = TreeNodeWithName;
        var n = new N("foo");

        tc.isTrue(n.name === "foo");
        tc.isTrue(n.getParent() === null);
        tc.isTrue(n.getChildrenCount() === 0);
    });

    Tx.test("TreeNodeTests.testTreeWithTwoNodes", function (tc) {    
        var N = TreeNodeWithName;
        var root = new N(0);
        var n1 = new N(1);
        
        root.appendChild(n1);

        tc.isTrue(root.name === 0);
        tc.isTrue(root.getParent() === null);
        tc.isTrue(root.getChildrenCount() === 1);
        tc.isTrue(root.getChild(0) === n1);

        tc.isTrue(n1.name === 1);
        tc.isTrue(n1.getParent() === root);     
        tc.isTrue(n1.getChildrenCount() === 0);
    });
    
    Tx.test("TreeNodeTests.testAppendChild", function (tc) {
        var N = TreeNodeWithName;

        var root = new N("root");
        tc.isTrue(root.getChildrenCount() === 0);

        root.appendChild(new N("child1"));
        tc.isTrue(root.getChildrenCount() === 1);
        tc.isTrue(root.getParent() === null);
        tc.isTrue(root.isRoot());

        var c1 = root.getChild(0);
        tc.isTrue(c1.name === "child1");
        tc.isTrue(c1.getChildrenCount() === 0);
        tc.isTrue(c1.getParent() === root);
        tc.isFalse(c1.isRoot());
    });

    // Verify appendChild params
    Tx.test("TreeNodeTests.testAppendChildExceptions", function (tc) {
        var N = TreeNodeWithName;
        
        // Verify that the "expectedException" fires when calling function "fn"
        var verifyException = function (expectedException, fn) {
            var lastException = null;
            try {
                fn();
            }
            catch (e) {
                lastException = e;
            }
            tc.isTrue(lastException === expectedException);
        };

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild();
        });
        
        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild(undefined);
        });

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild(1);
        });

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild(true);
        });

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild(null);
        });

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild("");
        });

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild({});
        });

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild([]);
        });

        verifyException(Jx.TreeNode.Error.invalidChild, function () {
            var c = new N();
            c.appendChild(c);
        });
    });

    // Verify append
    Tx.test("TreeNodeTests.testAppend", function (tc) {
        var N = TreeNodeWithName;

        var root = new N(0);
        var n1 = new N(1);
        var n2 = new N(2);

        root.append(n1, n2);
        tc.isTrue(root.getChildrenCount() === 2);
        tc.isTrue(root.getChild(0) === n1);
        tc.isTrue(root.getChild(1) === n2);
    });

    // Verify append with no args
    Tx.test("TreeNodeTests.testAppendNoArgs", function (tc) {
        var N = TreeNodeWithName;

        var root = new N(0);
        root.append();
        tc.isTrue(root.getChildrenCount() === 0);
    });

    // Verify _setParent
    Tx.test("TreeNodeTests.testSetParent", function (tc) {
        var N = TreeNodeWithName;

        var r = new N("r");
        var c1 = new N("c1");
        tc.isTrue(c1.getParent() === null);

        c1._setParent(r);
        tc.isTrue(c1.getParent() === r);
        tc.isFalse(c1.isRoot());
    });

    // Validate removeChild
    Tx.test("TreeNodeTests.testRemoveChild1", function (tc) {
        var N = TreeNodeWithName;

        var r = new N();
        var c1 = new N();

        r.appendChild(c1);
        tc.isTrue(r.getChildrenCount() === 1);

        r.removeChild(c1);
        tc.isTrue(r.getChildrenCount() === 0);
    });

    // Verify remove child when there are multiple children
    Tx.test("TreeNodeTests.testRemoveChild2", function (tc) {
        var N = TreeNodeWithName;

        var r = new N();
        var c1 = new N();
        var c2 = new N();

        r.appendChild(c1);
        r.appendChild(c2);
        tc.isTrue(r.getChildrenCount() === 2);

        r.removeChild(c2);
        tc.isTrue(r.getChildrenCount() === 1);
    });

    // Verify removeChildAt
    Tx.test("TreeNodeTests.testRemoveChildAt", function (tc) {
        var N = TreeNodeWithName;

        var r = new N();
        var c1 = new N();
        var c2 = new N();
        var c3 = new N();

        r.appendChild(c1);
        r.appendChild(c2);
        r.appendChild(c3);
        tc.isTrue(r.getChildrenCount() === 3);
        tc.isTrue(r.getChild(0) === c1);
        tc.isTrue(r.getChild(1) === c2);
        tc.isTrue(r.getChild(2) === c3);

        r.removeChildAt(1);
        tc.isTrue(r.getChildrenCount() === 2);
        tc.isTrue(r.getChild(0) === c1);
        tc.isTrue(r.getChild(1) === c3);
    });

    Tx.test("TreeNodeTests.testRemoveChildren", function (tc) {
        var N = TreeNodeWithName;

        var r = new N();
        var c1 = new N();
        var c2 = new N();
        var c3 = new N();

        r.appendChild(c1);
        r.appendChild(c2);
        r.appendChild(c3);
        tc.isTrue(r.getChildrenCount() === 3);
        tc.isTrue(r.getChild(0) === c1);
        tc.isTrue(r.getChild(1) === c2);
        tc.isTrue(r.getChild(2) === c3);

        r.removeChildren();
        tc.isTrue(r.getChildrenCount() === 0);      
    });

    // Verify hasChildren
    Tx.test("TreeNodeTests.testHasChildren", function (tc) {
        var N = TreeNodeWithName;

        var r = new N();
        var c1 = new N();

        tc.isFalse(r.hasChildren());

        r.appendChild(c1);
        tc.isTrue(r.hasChildren());
    });

    Tx.test("TreeNodeTests.testForEachChild", function (tc) {
        var N = TreeNodeWithName;

        var r = new N("root");
        var c1 = new N("child1");
        var c2 = new N("child2");
        var c3 = new N("child3");

        r.appendChild(c1);
        r.appendChild(c2);
        c2.appendChild(c3);
        tc.isTrue(r.getChildrenCount() === 2);
        tc.isTrue(c2.getChildrenCount() === 1);

        var s = "";

        r.forEachChild(function (node) {
            s += node.name + " " + node.getChildrenCount() + " ";
        });

        tc.isTrue(s === "child1 0 child2 1 ");
    });

    // $TODO check for null parent in test remove child 
})();