
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,MSApp,Tx*/

// TODO: fire events for commands

Tx.Commands = function (navigator, config) {
    Tx.chkNew(this, Tx.Commands);
    this._navigator = navigator;
    this._config = config;
};

Tx.Commands.prototype = {
    dispose: function () {
        this._navigator = null;
        this._config = null;
    },

    close: function () {
        if (Tx.isWWA) {
            MSApp.terminateApp(new Error());
        } else {
            window.close();
        }
    },

    reload: function () {
        this._config.setAutoRun(false);
        this._config.setYieldBetweenTests(true);
        window.location.reload();
    },

    runAll: function () {
        this._config.setAutoRun(true);
        this._config.setYieldBetweenTests(true);
        this._navigator.goFirst();
    },

    goHome: function () {
        this._navigator.goHome();
    },

    goFirstPage: function () {
        this._config.setAutoRun(false);
        this._config.setYieldBetweenTests(true);
        this._navigator.goFirst();
    },

    goNextPage: function () {
        this._config.setAutoRun(false);
        this._config.setYieldBetweenTests(true);
        this._navigator.goNextPage();
    }
};
