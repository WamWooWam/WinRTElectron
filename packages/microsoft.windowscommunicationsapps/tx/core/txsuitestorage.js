
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Tx*/

//
// Tx.SuiteStorage
//

Tx.SuiteStorage = function () {
    Tx.chkNew(this, Tx.SuiteStorage);
};

Tx.SuiteStorage.prototype = {
    dispose: function () {
    },

    load: function () {
        var n = window.name;
        if (n === "") {
            return {};
        }
        return JSON.parse(n);
    },

    save: function (data) {
        window.name = JSON.stringify(data);
    }
};
