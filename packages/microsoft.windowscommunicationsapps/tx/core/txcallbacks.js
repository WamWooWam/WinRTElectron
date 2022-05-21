
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

//
// Tx.Callbacks
//

Tx.Callbacks = function () {
    Tx.chkNew(this, Tx.Callbacks);
    this._map = [];
};

Tx.Callbacks.prototype = {
    dispose: function () {
        for (var i = 0, len = this._map.length; i < len; i++) {
            var item = this._map[i];
            item.target.removeEventListener(item.eventType, item.fn, item.capture);
        }
        this._map = []; // TODO: null?
    },

    ael: function (target, eventType, fn, bindObj, capture) {
        Tx.assert(Tx.isObject(target) || Tx.isFunction(target));
        Tx.chkFn(target.addEventListener);
        Tx.chkFn(target.removeEventListener);
        Tx.chkStrNE(eventType);
        Tx.chkFn(fn);
        Tx.chkObjOpt(bindObj);

        fn = bindObj ? fn.bind(bindObj) : fn;

        // TODO: check dups in debug

        this._map.push({ target: target, eventType: eventType, fn: fn, capture: Boolean(capture) });

        target.addEventListener(eventType, fn, capture);

        return this;
    },

    rel: function (target, eventType, fn, bindObj, capture) {
        Tx.chkObj(target);
        Tx.chkFn(target.addEventListener);
        Tx.chkFn(target.removeEventListener);
        Tx.chkStrNE(eventType);
        Tx.chkFn(fn);
        Tx.chkObjOpt(bindObj);

        fn = bindObj ? fn.bind(bindObj) : fn;

        for (var i = 0, len = this._map.length; i < len; i++) {
            var item = this._map[i];
            if (item.target === target && item.eventType === eventType && item.fn === fn && item.capture === Boolean(capture)) {
                this._map.splice(i, 1);
                target.removeEventListener(eventType, fn, capture);
                break;
            }
        }

        this._map.push({ target: target, eventType: eventType, fn: fn, capture: Boolean(capture) });

        return this;
    }
};
