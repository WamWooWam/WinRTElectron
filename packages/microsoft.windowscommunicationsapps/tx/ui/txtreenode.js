
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.TreeNode = {
    initTreeNode: function () {
        this.parent = null;
        this.children = [];
    },

    disposeTreeNode: function () {
        this.removeChildren();
        if (this.parent) {
            this.parent.removeChild(this);
        }
    },

    isRootNode: function () {
        return this.parent === null;
    },

    // TODO: rename it to addChild
    appendChild: function (child) {
        Tx.chkObj(child);
        Tx.chkNotEq(child, this); // can't add itself
        Tx.chkNull(child.parent); // parent should be null

        this.children.push(child);
        child.parent = this;
    },

    // TODO: rename it to addChildren
    appendChildren: function () {
        var args = arguments;
        for (var i = 0, len = args.length; i < len; i++) {
            this.appendChild(args[i]);
        }
    },

    removeChildAt: function (index) {
        Tx.chkNumRange(index, 0, this.children.length - 1);

        var children = this.children;
        var child = children[index];
        children.splice(index, 1);
        child.parent = null;
        child.dispose();
    },

    removeChild: function (child) {
        var children = this.children;
        var index = children.indexOf(child);
        if (index >= 0) {
            children[index].parent = null;
            children.splice(index, 1);
        }
    },

    removeChildren: function () {
        var children = this.children;
        for (var i = 0, len = children.length; i < len; i++) {
            var child = children[i];
            child.parent = null;
            child.dispose();
        }
        this.children = [];
    }

    // TODO: detach children
};

