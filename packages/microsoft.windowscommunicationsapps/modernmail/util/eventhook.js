
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "EventHook", function () {
    "use strict";

    // Disposable wrapper for event listeners. Ideally the target class uses Mail.Disposer
    // and simply calls disposer.add(new Mail.EventHook(...)) to establish the event listener

    var EventHook = Mail.EventHook = function (src, ev, func, target, capture) {
        Debug.assert(Jx.isObject(src));
        Debug.assert(Jx.isString(ev));
        Debug.assert(Jx.isFunction(func));
        Debug.assert(Jx.isUndefined(target) || Jx.isObject(target));
        Debug.assert(Jx.isUndefined(capture) || Jx.isBoolean(capture));

        var handler = this._onEvent;
        this._capture = !!capture;

        if (src.addListener) {
            // Prefer Jx.Events style since they don't require explicit binding
            Debug.assert(Jx.isFunction(src.addListener));
            Debug.assert(Jx.isFunction(src.removeListener));
            Debug.assert(Jx.isUndefined(capture), "Capture only valid for DOM/WinRT events");

            src.addListener(ev, handler, this);
        } else {
            // Fallback to standard addEventListener with explicit binding
            Debug.assert(Jx.isFunction(src.addEventListener));
            Debug.assert(Jx.isFunction(src.removeEventListener));
            Debug.assert(!src.removeListener);

            handler = this._onEvent.bind(this);
            src.addEventListener(ev, handler, this._capture);
        }

        this._src = src;
        this._ev = ev;
        this._func = func;
        this._target = target;
        this._handler = handler;

        Debug.only(register(this));
        Debug.only(Object.seal(this));
    };

    // Remove the event listener when the hook object is disposed
    EventHook.prototype.dispose = function () {
        var src = this._src;
        if (src) {
            Debug.only(unregister(this));

            this._src = null;
            if (src.removeListener) {
                src.removeListener(this._ev, this._handler, this);
            } else {
                src.removeEventListener(this._ev, this._handler, this._capture);
            }
        }
    };

    EventHook.prototype._onEvent = function () {
        // This check safeguards against bad event dispatch implementations that
        // still callback after being removed. Trident has this bug if you unhook
        // an event listener instance from another listener for the same event.
        if (this._src) {
            this._func.apply(this._target, arguments);
        }
    };

    function getEventManagerProxy (src) {
        return {
            addListener: function (ev, func, target) {
                Jx.EventManager.addListener(src, ev, func, target);
            },
            removeListener: function (ev, func, target) {
                Jx.EventManager.removeListener(src, ev, func, target);
            }
        };
    }

    // Adapter for the global Jx.EventManager events with Jx.root broadcast source
    EventHook.getGlobalRootSource = function () {
        return getEventManagerProxy(Jx.root);
    };

    // Adapter for the global Jx.EventManager events with null broadcast source
    EventHook.globalSource = getEventManagerProxy(null);

    EventHook.createGlobalHook = function (ev, func, target) {
        return new EventHook(EventHook.globalSource, ev, func, target);
    };

    // Adapter for normal Jx.EventManager sources
    EventHook.createEventManagerHook = function (src, ev, func, target) {
        return new EventHook({
            addListener: function (evParam, funcParam, targetParam) { src.on(evParam, funcParam, targetParam); },
            removeListener: function (evParam, funcParam, targetParam) { src.detach(evParam, funcParam, targetParam); },
        }, ev, func, target);
    };

    
    // Track outstanding event hooks so that it's easier to debug leaked event handlers
    EventHook.hooks = [];
    function register(hook) {
        EventHook.hooks.push(hook);
        // Turn on callstack tracking if more verbose logging is needed
        //hook.callstack = Debug.callstack(1);
    }
    function unregister(hook) {
        var index = EventHook.hooks.indexOf(hook);
        Debug.assert(index !== -1);
        if (index !== -1) {
            EventHook.hooks.splice(index, 1);
        }
    }
    

});
