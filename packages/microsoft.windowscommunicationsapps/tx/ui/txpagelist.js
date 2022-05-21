
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx*/

Tx.PageList = function (model, commands) {
    Tx.chkNew(this, Tx.PageList);
    this._model = model;
    this._commands = commands;
    this._callbacks = null;
};

Tx.PageList.prototype = {
    dispose: function () {
        Tx.dispose(this, "_model");
        Tx.chkEq(this._callbacks, null); // deactivateUI not called
    },

    render: function () {
        var s = '<div class="tx-pagenote"><b>Note: </b>You can now click on individual unit test pages and the page filter input box now supports the enter key.</div>';

        s += '<div class="tx-pagefilter">Page filter: <input id="txPageFilter" value="' + this._model.get("pageFilter") + '"/></div>';

        s += '<div class="tx-pagelist">';

        var pages = this._model.get("pages");

        for (var i = 0, len = pages.length; i < len; i++) {
            s += '<div class="tx-pagelist-item">' + pages[i].htm + '</div>';
        }

        s += '</div>';

        return s;
    },

    activateUI: function () {
        Tx.chkNull(this._callbacks);

        var txPageFilter = document.getElementById("txPageFilter");

        this._callbacks = new Tx.Callbacks()
            .ael(txPageFilter, "change", function (ev) {
                this._model.set("pageFilter", ev.target.value);
            }, this)
            .ael(txPageFilter, "keydown", function (ev) {
                if (ev.keyCode === 13) {
                    this._model.set("pageFilter", ev.target.value);
                    this._commands.goNextPage();

                    ev.stopPropagation();
                }
            }, this)
            .ael(document.querySelector(".tx-pagelist"), "click", function(ev) {
                var src = ev.srcElement;

                if (src.className === "tx-pagelist-item") {
                    this._model.set("pageFilter", src.innerText);
                    this._commands.goNextPage();
                    this._model.set("pageFilter", "");

                    ev.stopPropagation();
                }
            }, this);

        txPageFilter.setActive();
    },

    deactivateUI: function () {
        Tx.dispose(this, "_callbacks");
    }
};
