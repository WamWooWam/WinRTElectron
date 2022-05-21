
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global location,Tx,MSApp*/

Tx.Navigator = function (runner, config) {
    Tx.chkNew(this, Tx.Navigator);
    Tx.chkIf(Tx.isMain);

    this._config = config;
    this._runner = runner;
    this._taskDrains = 0;

    // hook up the events
    this._callbacks = new Tx.Callbacks()
        .ael(runner, "nextPage", this._onNextPage, this);
};

Tx.Navigator.prototype = {
    dispose: function () {
        this._callbacks.dispose();
        this._callbacks = null;

        this._config = null;
        this._runner = null;
    },

    goHome: function () {
        this._navigate(this._config.getHomePage()); 
    },

    goResults: function () {
        // TODO: move the results page to config
        this._navigate(this._config.getSrcPath() + "/ui/TxResults.htm"); 
    },

    goFirst: function () {
        var pages = this._config.getPages();
        if (pages.length > 0) {
            this._navigate(pages[0].htm);
        }
    },

    goNextPage: function () {
        var i = this._indexOfCurrentPage(); // i is -1 if not found

        // get the next page (first page if not found)
        var nextIndex = i + 1;
        var pages = this._config.getPages();

        if (nextIndex < pages.length) {
            // found the next page
            var url = pages[nextIndex].htm;
            this._navigate(url);
        } else {
            // it was the last page, we're done
            this._runner.onSuiteStop();
            if (this._config.getAutoClose()) {
                this._runner.commands.close();
            } else {
                this.goResults();
            }
        }
    },

    _onNextPage: function () {
        if (this._config.getAutoRun()) {
            this.goNextPage();
        }
    },

    _indexOfCurrentPage: function () {
        var pathname = location.pathname;
        var pages = this._config.getPages();

        for (var i = 0, len = pages.length; i < len; i++) {
            if (pages[i].htm === pathname) {
                return i;
            }
        }
        return -1;
    },

    _navigate: function (url) {
        Tx.chkStrNE(url);
        Tx.mark("Tx.Navigator._navigate: " + url + ",Info,Tx");

        this._taskDrains = 0;
        this._onIdle(function () { 
            location.href = url; 
        });
    },

    _filter: function (pages, filter) {
        Tx.chkArr(pages);
        Tx.assert(Tx.isString(filter) || Tx.isArray(filter) || Tx.isRegExp(filter));
        
        var filteredPages = [];

        // TODO: this loop can be optimized
        for (var i = 0, len = pages.length; i < len; i++) {
            var page = pages[i];
            var src = page.htm;

            if (Tx.isString(filter)) {
                // substring match
                if (src.indexOf(filter) >= 0) {
                    filteredPages.push(page);
                }
            } else if (Tx.isRegExp(filter)) {
                // regexp match
                if (filter.test(src)) {
                    filteredPages.push(page);
                }
            } else if (Tx.isArray(filter)) {
                // list of urls match
                for (var j = 0, flen = filter.length; j < flen; j++) {
                    if (filter[i] === src) {
                        filteredPages.push(page);
                        break;
                    }
                }
            } else {
                Tx.assert(false);
            }
        }

        return filteredPages;
    },
    _onIdle: function (fn) {
        // Drains the queue of lingering async operations left behind by tests, calls fn when the queue is empty
        if (MSApp.isTaskScheduledAtPriorityOrHigher(MSApp.IDLE)) {
            var that = this;
            this._taskDrains++;
            Tx.assert(this._taskDrains < 1000); // too many task drains, possible infinite loop
            MSApp.execAsyncAtPriority(function () {
                that._onIdle(fn);
            }, MSApp.IDLE);
        } else {
            fn();
        }
    }
};
