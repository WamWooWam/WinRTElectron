
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

/*

Tree Events mixin

For the events to dispatched on the ancestors, the host object needs to implement the "parent" property (see Tx.TreeNode).

event = {
    phase: "capture"/"target"/"bubble" - event phase
    cancel: true/false - set by the handlers to cancel the dispatching
    target: object where the event happened
    currentTarget: object currently handling the event
    // user data
}
*/

Tx.TreeEvents = {
    initTreeEvents: function () {
        Tx.chkUndef(this._txev); //_txev is already defined
        this._txev = {};
    },

    disposeTreeEvents: function () {
        // TODO: dump handlers
        this._txev = {}; // TODO: null?
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

    _eventListenersChain: function (ev) {
        var chain = [];

        for (var ancestor = this.parent ; ancestor; ancestor = ancestor.parent) {
            var listeners = ancestor._txev[ev.type];
            if (listeners) {
                chain = chain.concat(listeners);
            }
        }

        return chain;
    },

    dispatchEvent2: function (ev) {
        Tx.chkObj(ev);
        Tx.chkStrNE(ev.type);

        // build ancestors chain
        var i;
        var chain = this._eventListenersChain(ev);
        var chainLen = chain.length;

        // capture
        if (chainLen > 0) {
            ev.phase = "capture";
            for (i = chainLen - 1; i >= 0 && !ev.cancel; i--) {
                chain[i](ev);
            }
        }

        // target
        var listeners = this._txev[ev.type];
        if (listeners) {
            ev.phase = "target";
            var len = listeners.length;
            for (i = 0; i < len && !ev.cancel; i++) {
                listeners[i](ev);
            }
        }

        // bubble
        if (chainLen > 0) {
            ev.phase = "bubble";
            for (i = 0; i < chainLen && !ev.cancel; i++) {
                chain[i](ev);
            }
        }
    },

    _invokeListeners: function (ev, currentTarget) {
        var listeners = currentTarget._txev[ev.type];
        if (listeners) {
            ev.currentTarget = currentTarget;
            for (var i = 0; i < listeners.length && !ev.cancel; i++) {
                listeners[i](ev);
                if (ev.cancel) {
                    break;
                }
            }
        }
    },

    dispatchEvent: function (ev) {
        Tx.chkObj(ev);
        Tx.chkStrNE(ev.type);

        // build capture/bubble ancestors array
        var i, ancestors = [];
        for (var ancestor = this.parent; ancestor; ancestor = ancestor.parent) {
            ancestors.push(ancestor);
        }

        ev.target = this;

        // capture
        ev.phase = "capture";
        for (i = ancestors.length - 1; i >= 0 && !ev.cancel; i--) {
            this._invokeListeners(ev, ancestors[i]);
        }

        // target
        ev.phase = "target";
        this._invokeListeners(ev, this);

        // bubble
        ev.phase = "bubble";
        for (i = 0; i < ancestors.length && !ev.cancel; i++) {
            this._invokeListeners(ev, ancestors[i]);
        }
    }
};