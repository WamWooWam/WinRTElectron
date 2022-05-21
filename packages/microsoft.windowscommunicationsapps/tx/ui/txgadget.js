
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.Gadget = {
    initGadget: function (model) {
        this.model = model;
        this.initEvents();
    },

    disposeGadget: function () {
        this.disposeEvents();
        this.model = null;
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
