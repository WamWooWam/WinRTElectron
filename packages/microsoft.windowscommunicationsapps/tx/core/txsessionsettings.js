
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,window*/

Tx.SessionSettings = function () {
    Tx.chkNew(this, Tx.SessionSettings);
    this.load();
};

Tx.SessionSettings.prototype = {
    dispose: function () {
        this.save();
    },

    load: function () {
    },

    save: function () {
    },

    set: function (prop, value) {
        window.sessionStorage["tx" + prop] = value;
    },

    get: function (prop) {
        return window.sessionStorage["tx" + prop];
    }
};
