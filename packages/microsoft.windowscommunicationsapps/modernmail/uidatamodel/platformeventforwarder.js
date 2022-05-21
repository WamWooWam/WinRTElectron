
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(Mail, "PlatformEventForwarder", function () {
    "use strict";

    var PlatformEventForwarder = Mail.PlatformEventForwarder = { };
    Jx.mix(PlatformEventForwarder, Jx.Events);
    Debug.Events.define(PlatformEventForwarder, "changed", "deleted");

    PlatformEventForwarder.initForwarder = function (source) {
        ///<param name="source">The event source: a platform object</param>
        Debug.assert(Jx.isObject(source));

        this.initEvents();
        this._eventSource = source;
        this._changedHooks = null;
        this._deletedHooks = null;

        Debug.assert(this._onPlatformChanged === PlatformEventForwarder._onPlatformChanged, "Don't override _onPlatformChanged, override _onPropertiesChanged");
    };

    PlatformEventForwarder.addListener = function (type, fn, context) {
        /// <summary>Jx.Events override.  Creates just-in-time event hooks on the source object</summary>
        Debug.assert(Jx.isNonEmptyString(type));
        Debug.assert(Jx.isFunction(fn));
        Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));

        if (type === "changed" && !this.hasListener("changed")) {
            this._createChangedHook();
        } else if (type === "deleted" && !this.hasListener("deleted")) {
            this._createDeletedHook();
        }

        Jx.addListener(this, type, fn, context);
    };

    PlatformEventForwarder._createChangedHook = function () {
        /// <summary>Creates an changed event hook on the base object.  Uses a disposer to allow derived classes to add additional hooks</summary>
        this._changedHooks = new Mail.Disposer(new Mail.EventHook(this._eventSource, "changed", this._onPlatformChanged, this));
    };
    PlatformEventForwarder._clearChangedHook = function () {
        /// <summary>Disposes of the changed event hooks created by _createChangedHook</summary>
        Jx.dispose(this._changedHooks);
        this._changedHooks = null;
    };

    PlatformEventForwarder._createDeletedHook = function () {
        /// <summary>Creates an deleted event hook on the base object.  Uses a disposer to allow derived classes to add additional hooks</summary>
        this._deletedHooks = new Mail.Disposer(new Mail.EventHook(this._eventSource, "deleted", this._onDeleted, this));
    };
    PlatformEventForwarder._clearDeletedHook = function () {
        /// <summary>Disposes of the changed event hooks created by _createDeletedHook</summary>
        Jx.dispose(this._deletedHooks);
        this._deletedHooks = null;
    };

    PlatformEventForwarder.removeListener = function (type, fn, context) {
        /// <summary>Jx.Events override.  Releases event hooks on the source object when the last listener is removed</summary>
        Debug.assert(Jx.isNonEmptyString(type));
        Debug.assert(Jx.isFunction(fn));
        Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));

        Jx.removeListener(this, type, fn, context);

        if (type === "changed" && !this.hasListener("changed")) {
            this._clearChangedHook();
        } else if (type === "deleted" && !this.hasListener("deleted")) {
            this._clearDeletedHook();
        }
    };

    PlatformEventForwarder._onPlatformChanged = function (ev) {
        ///<summary>Base change event listener - transforms the event into an array for easier consumption</summary>
        ///<param name="ev" type="Event"/>
        Debug.assert(Jx.isObject(ev));
        var properties = Array.prototype.slice.call(ev);
        properties.target = ev.target;
        this._onChanged(properties);
    };

    PlatformEventForwarder._onChanged = function (properties) {
        ///<summary>Base implementation: forwards property changes from the event source out as property changes on this object.  Derived types may override this method to modify the set of changes reported.</summary>
        ///<param name="properties" type="Array"/>
        Debug.assert(Jx.isArray(properties));
        this.raiseChanged(properties);
    };

    PlatformEventForwarder.raiseChanged = function (properties) {
        ///<summary>Invokes the changed event in a way consistent with WinRT invocations of the same event.</summary>
        ///<param name="properties" type="Array"/>
        Debug.assert(Jx.isArray(properties));
        properties = properties.filter(function (property, index, arr) {
            return arr.indexOf(property) === index; // dedupe
        });
        if (properties.length > 0) {
            properties.target = this;
            this.raiseEvent("changed", properties);
        }
    };

    PlatformEventForwarder._onDeleted = function (ev) {
        ///<summary>Deleted event listener - forwards the event on</summary>
        ///<param name="ev" type="Event"/>
        Debug.assert(Jx.isObject(ev));
        this.raiseEvent("deleted", { target: this });
    };

});

