
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx*/

//
// Tx.Toolbar
//

Tx.Toolbar = function (data) {
    Tx.chkNew(this, Tx.Toolbar);
    this._callbacks = null;
    this._data = data;
};

Tx.Toolbar.prototype = {
    dispose: function () {
        this._data = null;
        // TODO: fix this
        // Tx.chkEq(this._callbacks, null); // deactivateUI not called
    },

    render: function () {
        var s = '<div class="tx-toolbar">';

        var controls = this._data.controls;
        for (var i = 0, len = controls.length; i < len; i++) {
            var control = controls[i];
            s += Tx.format('<button id="%s">%s</button>', control.id, control.text);
        }

        s += '</div>';

        return s;
    },

    activateUI: function () {
        Tx.chkNull(this._callbacks);

        this._callbacks = new Tx.Callbacks();

        var controls = this._data.controls;
        for (var i = 0, len = controls.length; i < len; i++) {
            var control = controls[i];
            var button = document.getElementById(control.id);
            this._callbacks.ael(button, "click", control.onclick);
        }
    },

    deactivateUI: function () {
        Tx.dispose(this, "_callbacks");
    }
};
