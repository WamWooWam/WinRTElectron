
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Tx*/

(function () {
    function _markStart(s) { Tx.mark("Tx.Suite." + s + ",StartTA,Tx"); }
    function _markStop(s) { Tx.mark("Tx.Suite." + s + ",StopTA,Tx"); }

    Tx.Suite = function (runner, config) {
        Tx.chkNew(this, Tx.Suite);
        Tx.chkObj(runner);
        Tx.chkObj(config);

        _markStart("ctor");

        this._runner = runner;

        this._storage = new Tx.SuiteStorage();
        this._config = new Tx.Config(config);
        this._config.loadStorage(this._storage);
        this._config.setHomePage(window.location.pathname);

        var commands = this._runner.commands;
        this._toolbar = new Tx.Toolbar({
            controls: [
                { id: "txtbHome", text: "Home (F2)", onclick: function () { commands.goHome(); } },
                { id: "txtbRunAll", text: "Run All (F3)", onclick: function () { commands.runAll(); } },
                { id: "txtbNextPage", text: "Next Page (F8)", onclick: function () { commands.goNextPage(); } },
                { id: "txtbReload", text: "Reload (F5)", onclick: function () { commands.reload(); } },
                { id: "txtbClose", text: "Close (F4)", onclick: function () { commands.close(); } }
            ]
        });

        var pages = this._config.getPages();

        window.sessionStorage.txPages = JSON.stringify(pages);

        this._model = new Tx.Model({ pages: pages, pageFilter: this._config.getPageFilter() });

        this._pagelist = new Tx.PageList(this._model, commands);

        this._callbacks = null;

        _markStop("ctor");
    };

    Tx.Suite.prototype = {
        dispose: function () {
            _markStart("dispose");

            Tx.dispose(this, "_toolbar", "_pagelist", "_model", "_config", "_storage");
            this._runner = null;
            Tx.chkEq(this._callbacks, null); // deactivateUI not called

            _markStop("dispose");
        },

        show: function (e) {
            Tx.chkElem(e);

            this._runner.onSuiteStart();

            e.innerHTML = this.render();
            this.activateUI();
        },

        render: function () {
            var s = this._toolbar.render() + this._pagelist.render();
            return s;
        },

        activateUI: function () {
            this._toolbar.activateUI();
            this._pagelist.activateUI();

            this._callbacks = new Tx.Callbacks()
                .ael(this._model, "change:pageFilter", function (ev) {
                    this._config.setPageFilter(ev.value);
                }, this);
        },

        deactivateUI: function () {
            Tx.dispose(this, "_callbacks");

            this._pagelist.deactivateUI();
            this._toolbar.deactivateUI();
        }
    };
})();