
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.Events = {
    initEvents: function () {
        Tx.chkUndef(this._txev); //_txev is already defined
        this._txev = {};
    },

    disposeEvents: function () {
        // TODO: dump handlers
        this._txev = null;
    },

    addEventListener: function (type, fn) {
        Tx.chkStrNE(type);
        Tx.chkFn(fn);

        var events = this._txev;

        // get or create the callbacks array
        var callbacks = (events[type] = events[type] || []);

        // add the callback
        callbacks.push(fn);
    },

    removeEventListener: function (type, fn) {
        Tx.chkStrNE(type);
        Tx.chkFn(fn);

        // TODO: assert if it's called from dispachEvent

        // get the callbacks array
        var callbacks = this._txev[type];
        if (callbacks) {
            // find the callback
            var i = callbacks.indexOf(fn);
            if (i >= 0) {
                // remove the callback
                callbacks.splice(i, 1);
            }
        }
    },

    dispatchEvent: function (ev) {
        Tx.chkObj(ev);
        Tx.chkStrNE(ev.type);

            // get the callbacks array
        var callbacks = this._txev[ev.type];
        if (callbacks) {
            for (var i = 0, len = callbacks.length; i < len; i++) {
                callbacks[i](ev);
            }
        }
    }
};
