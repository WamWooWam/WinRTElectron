
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.View = {
    initView: function (model) {
        this.model = model;
        this.initEvents();
    },

    disposeView: function () {
        this.disposeEvents();
    },

    html: function () {
        return "";
    },

    activate: function () {
    },

    deactivate: function () {
    },

    eradicate: function () {
    }
};

Tx.mix(Tx.View, Tx.Events);