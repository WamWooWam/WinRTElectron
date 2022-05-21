
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.config = {
    debuggerOnError: true, // true to break in debugger (if present) on test errors, false to continue
    useTryCatch: true, // true to log test failures and continue, false to break at the actual error
    autoRun: false, // true to move to the next test htm page automatically, false to wait for the user.
    autoClose: false, // true to close the app after the last page, false to wait for the user.
    yieldBetweenTests: false, // call setImmediate between tests
    timeoutMs: 500, // timeout for async operations
    isLab: false, // true if we want to run in 'lab' mode. Useful for increased timeouts by default.
    isBvt: false, // true if we are running Tx BVTs.
    wttTaskGuid: "", // WTT requires a task GUID when running in the lab for BVTs.
    shortcutKeys: true, // true to register the Tx keyboard shortcuts - see Tx\ui\TxShortcuts.js
    useConsole: false, // Visual Studio console output
    garbageCollect: false, // calls GarbageCollect between tests, used for leaks detection
    srcPath: "/Tx", // path to Tx sources
    homePage: "",
    pageFilter: "", // string: substring match, regex: match, array of url strings: match
    protocolArgs: {}, // arguments passed in from the protocol command line.
    pages: []
};

// TODO: convert it to Tx.Model
Tx.Config = function (data) {
    Tx.chkNew(this, Tx.Config);
    this._data = data;
    this._storage = null;
};

Tx.Config.prototype = {
    dispose: function () {
        this._data = null;
        this._storage = null;
    },

    loadStorage: function (storage) {
        this._storage = storage;
        var data = storage.load();
        Tx.mix(this._data, data);
    },

    saveStorage: function () {
        if (this._storage) {
            this._storage.save(this._data);
        }
    },

    getSrcPath: function () {
        return this._data.srcPath;
    },

    getHomePage: function () {
        return this._data.homePage;
    },

    setHomePage: function (url) {
        Tx.chkStrNE(url);
        this._data.homePage = url;
        this.saveStorage();
    },

    getAutoRun: function () {
        return this._data.autoRun;
    },

    setAutoRun: function (v) {
        Tx.chkBool(v);
        this._data.autoRun = v;
        this.saveStorage();
    },

    getYieldBetweenTests: function () {
        return this._data.yieldBetweenTests;
    },

    setYieldBetweenTests: function (v) {
        Tx.chkBool(v);
        this._data.yieldBetweenTests = v;
        this.saveStorage();
    },

    getAutoClose: function () {
        return this._data.autoClose;
    },

    setAutoClose: function (v) {
        Tx.chkBool(v);
        this._data.autoClose = v;
        this.saveStorage();
    },

    getPageFilter: function () {
        return this._data.pageFilter;
    },

    setPageFilter: function (v) {
        this._data.pageFilter = v;
        this.saveStorage();
    },

    getPages: function () {
        // filtering
        var pageFilter = this._data.pageFilter.toLowerCase();
        if (pageFilter !== "") {
            var filteredPages = [];
            var pages = this._data.pages;
            for (var i = 0, len = pages.length; i < len; i++) {
                var page = pages[i];
                if (page.htm.toLowerCase().indexOf(pageFilter) >= 0) {
                    filteredPages.push(page);
                }
            }
            return filteredPages;
        }
        return this._data.pages;
    }
};

