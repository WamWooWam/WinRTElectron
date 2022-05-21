
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.TestStore = function () {
    Tx.chkNew(this, Tx.TestStore);

    this._tests = [];
    this._index = 0; // always >= 0
};

Tx.TestStore.prototype = {
    dispose: function () {
        var tests = this._tests;
        for (var i = 0, len = tests.length; i < len; i++) {
            tests[i].dispose();
        }
        this._tests = [];
    },

    add: function (test) {
        Tx.chkObj(test);
        this._tests.push(test);
    },

    next: function () {
        if (this._index < this._tests.length) {
            this._index++;
        }
    },

    current: function () {
        if (this._index < this._tests.length) {
            return this._tests[this._index];
        }
        // return undefined;
    },

    isEmpty: function () {
        return this._index >= this._tests.length;
    },

    getCount: function () {
        return this._tests.length;
    }
};
