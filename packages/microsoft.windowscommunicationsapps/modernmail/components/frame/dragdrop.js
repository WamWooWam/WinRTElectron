
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "DragDrop", function () {
    "use strict";

    // The default dataTransfer object exposed during drag/drop operations is incredibly
    // limited in the functionality it provides. Only string data can be added to it and only
    // the final drop event has access to that data. This class exists to fill that gap. Richer
    // data is attached to the event object and all stages of drag/drop can interrogate said
    // data. Currently this is specific to list view events but could be generalized further
    // for other drag/drop scenarios.

    var DragDrop = Mail.DragDrop = function (root, selection, dragSource) {
        Debug.assert(Jx.isHTMLElement(root));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isObject(dragSource));

        this._root = root;
        this._selection = selection;
        this._dragSource = dragSource;
        this._detail = null;
        this._hovered = [];

        // Message list events to scope the raw drag/drop events around
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(root, "itemdragstart", this._onDragStart, this),
            new Mail.EventHook(root, "itemdragend", this._onDragEnd, this),
            new Mail.EventHook(document, "msvisibilitychange", this._onVisibilityChange, this)
        );
        this._hooks = null;
    };

    DragDrop.prototype.dispose = function () {
        Jx.dispose(this._disposer);
        Jx.dispose(this._hooks);
    };

    DragDrop.prototype._onDragStart = function (ev) {
        // Track the starting view so it can be provided to all the forwarded events
        Debug.assert(this._detail === null);
        var detail = this._detail = {
            dragElement: ev.target,
            selection: this._selection,
            messages: this._dragSource.resolveDrag(ev.detail.dragInfo)
        };

        if (detail.messages.length > 0) {
            // Only hook the events to forward for the duration of the drag/drop operation
            var root = this._root;
            this._hooks = new Mail.Disposer(
                new Mail.EventHook(root, "dragenter", this._onDragEnter, this),
                new Mail.EventHook(root, "dragleave", this._onDragLeave, this),
                new Mail.EventHook(root, "dragover", this._onDragOver, this),
                new Mail.EventHook(root, "drop", this._forwardEvent, this)
            );

            root.classList.add("dragging");
            this._forwardEvent(ev);
        } else {
            // Don't allow the drag if no messages were selected
            ev.preventDefault();
        }
    };

    DragDrop.prototype._onDragEnd = function (ev) {
        if (this._detail) {
            this._forwardEvent(ev);
            this._endDrag();
        }
    };

    DragDrop.prototype._onDragEnter = function (ev) {
        // Update the hover state before forwarding the enter event
        this._updateHover(ev.target);
        this._forwardEvent(ev);
    };

    DragDrop.prototype._onDragLeave = function (ev) {
        this._forwardEvent(ev);
    };

    DragDrop.prototype._onDragOver = function (ev) {
        this._forwardEvent(ev);
        if (this._hovered.length) {
            ev.dataTransfer.effectAllowed = "move";
            ev.preventDefault();
        } else {
            ev.dataTransfer.effectAllowed = "none";
        }
    };

    DragDrop.prototype._updateHover = function (target) {
        // The :hover psuedo class isn't evaluated during a drag/drop operation. Instead this
        // class adds 'hover' class to the ancestor elements marked as 'draghoverable'. This enables
        // similiar styling that is normally achieved via the :hover psuedo class.
        var hovered = [],
            root = this._root.parentElement,
            candidate = target;

        // Add hover to newly hovered elements
        while (candidate && candidate !== root) {
            if (candidate.classList.contains("draghoverable")) {
                candidate.classList.add("hover");
                hovered.push(candidate);
            }
            candidate = candidate.parentElement;
        }

        // Clear from elements no longer hovered
        this._hovered.forEach(function (elem) {
            if (hovered.indexOf(elem) === -1) {
                Debug.assert(elem.msMatchesSelector(".draghoverable.hover"));
                elem.classList.remove("hover");
            }
        });
        this._hovered = hovered;
    };

    DragDrop.prototype._endDrag = function () {
        Jx.dispose(this._hooks);
        this._detail = null;
        this._updateHover(null);
        this._root.classList.remove("dragging");
    };

    DragDrop.prototype._forwardEvent = function (original) {
        // Converts the original drag event to a more useful event with source information
        Debug.assert(this._detail !== null);

        var ev = document.createEvent("CustomEvent");
        ev.initCustomEvent("mail" + original.type, true, true, this._detail);
        original.target.dispatchEvent(ev);
    };

    DragDrop.prototype._onVisibilityChange = function (ev) {
        // This is essentially a hack but it's possible to lose visibility/focus in the
        // app and never receive the drag end event. This is here to avoid leaking our
        // CSS classes in the DOM when that happens.
        var detail = this._detail;
        if (ev.target.msHidden && detail) {
            var custom = document.createEvent("CustomEvent");
            custom.initCustomEvent("maildragend", true, true, detail);
            detail.dragElement.dispatchEvent(custom);

            this._endDrag();
        }
    };

});
