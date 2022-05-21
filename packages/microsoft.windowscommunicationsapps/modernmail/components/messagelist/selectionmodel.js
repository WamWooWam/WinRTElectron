
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "SelectionModel", function () {
    "use strict";

    Mail.SelectionModel = /*@constructor*/ function (collection, listView) {
        ///<summary>
        ///Abstracts listview selection and provides notifications when these change.
        ///Does its best to provide the invocation type (keyboard vs. touch) when selection changes.
        ///</summary>
        ///<param name="collection" type="Mail.MessageListCollection" />
        ///<param name="listView" type="WinJS.UI.ListView" />
        _markStart("_ctor");
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isObject(listView));

        this._collection = collection;
        this._listView = listView;

        // Always run selectionChanged after a setImmediate for two reasons:
        //   1. Ensure we get the invoke event before raising this event so we can include the invoke type (keyboard vs. mouse)
        //   2. Allow the listview to run the full tap animation
        this._selectionChangedJob = null;

        // Always run invoke event after a setImmediate to allow listview to run the full tap animation
        this._invokeJob = null;
        this._pendingInvoke = null;
        this._lastInvokeType = InvokeTypes.unknown;
        this._viaKeyboardIndex = -1;
        this._selection = new Mail.FilteredSelection(this._listView.selection.getIndices(), this._collection);

        this._hookListViewEvents();
        _markStop("_ctor");
    };
    Jx.inherit(Mail.SelectionModel, Jx.Events);
    Debug.Events.define(Mail.SelectionModel.prototype, "selectionchanging", "selectionchanged", "iteminvoked");

    // Public
    var ScrollOptions = Mail.SelectionModel.ScrollOptions = {
        none: "none",
        ensureVisible: "ensureVisible",
        scrollToTop: "scrollToTop"
    };

    var InvokeTypes = Mail.SelectionModel.InvokeTypes = {
        unknown: "unknown",
        keyboard: "keyboard",
        tap: "tap" // Also includes click
    };

    Mail.SelectionModel.prototype.selectAll = function () {
        this._listView.selection.selectAll();
    };

    Mail.SelectionModel.prototype.dispose = function () {
        _markStart("dispose");

        this._clearAsyncSelectionChange();
        this._clearAsyncInvoke();
        Jx.dispose(this._listViewEventHook);

        this._listView = null;
        this._collection = null;
        this._viaKeyboardIndex = -1;

        _markStop("dispose");
    };

    // ListView methods and properties forwarding
    Mail.SelectionModel.prototype.findIndexByElement = function (element) {
        Debug.assert(Jx.isHTMLElement(element));
        return this._listView.indexOfElement(element);
    };

    Object.defineProperty(Mail.SelectionModel.prototype, "currentItem", {
        get: function () {
            return this._listView.currentItem;
        },
        set: function (currentItem) {
            return this._listView.currentItem = currentItem;
        },
        enumerable: true
    });

    Object.defineProperty(Mail.SelectionModel.prototype, "selectionPivot", {
        get: function () {
            return this._listView.selection._pivot;
        },
        set: function (pivot) {
            return this._listView.selection._pivot = pivot;
        },
        enumerable: true
    });

    Object.defineProperty(Mail.SelectionModel.prototype, "tapBehavior", {
        get: function () {
            return this._listView.tapBehavior;
        },
        set: function (behavior) {
            return this._listView.tapBehavior = behavior;
        },
        enumerable: true
    });

    Object.defineProperty(Mail.SelectionModel.prototype, "indexOfFirstVisible", {
        get: function () {
            return this._listView.indexOfFirstVisible;
        },
        set: function (indexOfFirstVisible) {
            return this._listView.indexOfFirstVisible = indexOfFirstVisible;
        },
        enumerable: true
    });

    Object.defineProperty(Mail.SelectionModel.prototype, "listViewElement", {
        get: function () {
            return this._listView.element;
        },
        enumerable: true
    });

    Mail.SelectionModel.prototype.isValidIndex = function (index) {
        return index >= 0 && index < this._collection.count;
    };

    Mail.SelectionModel.prototype.selection = function () {
        return this._selection;
    };

    Mail.SelectionModel.prototype.addSelection = function (items, suppressEvents) {
        return this._changeSelection(this._listView.selection.add, [items], suppressEvents);
    };

    Mail.SelectionModel.prototype.removeSelection = function (items, suppressEvents) {
        return this._changeSelection(this._listView.selection.remove, [items], suppressEvents);
    };

    Mail.SelectionModel.prototype.setSelectionRange = function (range, suppressEvents) {
        return this._changeSelection(this._listView.selection.set, [range], suppressEvents);
    };

    Mail.SelectionModel.prototype.setSelection = function (index, scrollBehavior, viaKeyboard, suppressEvents) {
        ///<summary>Set the selection if it is valid</summary>
        ///<param name="index" type="Number" />
        ///<param name="scrollBehavior" type="String">See Mail.SelectionModel.ScrollOptions</param>
        ///<param name="viaKeyboard" type="Boolean" optional="true">
        ///Caller can specify this selection to be set "via keyboard." This will usually mean the resulting selectionChanged
        ///event will have the invokeType of keyboard.
        ///</param>
        ///<param name="suppressEvents" type="Boolean" optional="true">
        ///Do not fire selectionchanged upon programmatic selection
        ///</param>
        Debug.assert(Jx.isNumber(index));
        Debug.assert(Jx.isString(scrollBehavior));

        _markStart("_setSelection index:= " + index);
        // If the caller wants this to simulate a keyboard interaction, save this index.
        // The next time it is selected, we'll assume it was because of this interaction and
        // automatically use invokeType = "keyboard".
        // This value is cleared every time the selection changes, so it may sometimes get lost.
        if (viaKeyboard) {
            this._viaKeyboardIndex = index;
        }

        var count = this._collection.count,
            setSelectionPromise = null;

        if (count !== 0) {
            // Fix up the index if necessary
            index = Mail.Validators.clamp(index, 0, count - 1);
            setSelectionPromise = this._changeSelection(this._listView.selection.set, [index], suppressEvents).then(
                this._handleScrollOption.bind(this, index, scrollBehavior));
        } else {
            setSelectionPromise = this._changeSelection(this._listView.selection.clear, [], suppressEvents);
        }
        _markStop("_setSelection index:= " + index);
        return setSelectionPromise;
    };

    Mail.SelectionModel.prototype.getNodeSelection = function (/*node*/) {
        // Given a node, this return the children that are selected, which is null in non-selection mode
        return null;
    };

    // Listeners
    Mail.SelectionModel.prototype._hookListViewEvents = function () {
        _markStart("_hookListViewEvents");
        this._listViewEventHook = new Mail.Disposer(
           new Mail.EventHook(this._listView, "selectionchanging", this._onSelectionChanging, this),
           new Mail.EventHook(this._listView, "selectionchanged", this._onSelectionChanged, this),
           new Mail.EventHook(this._listView, "iteminvoked", this._onTapInvoked, this),
           new Mail.EventHook(this._listView, "keyboardnavigating", this._onKeyboardNavigating, this)
           );
        _markStop("_hookListViewEvents");
    };

    Mail.SelectionModel.prototype._onSelectionChanging = function (/*@dynamic*/ ev) {
        if (this._isListViewEventInvalid(ev.detail.newSelection.getIndices())) {
            ev.preventDefault();
            return;
        }

        this.raiseEvent("selectionchanging", ev);
    };

    Mail.SelectionModel.prototype._onSelectionChanged = function (ev) {
        _markStart("_onSelectionChanged");
        this._clearAsyncSelectionChange();

        if (this._isListViewEventInvalid(this._listView.selection.getIndices())) {
            return;
        }

        // Delay this call until tapInvoked or keyboardInvoked have a chance to fire.
        // It may the case that neither of them fire, which indicates a selection change via a multiselect action.
        this._selectionChangedJob = Jx.scheduler.addJob(null,
            Mail.Priority.messageListSetSelection,
            "selection model - selection changed",
            function () {
                _markStart("_selectionChangedAsyncId");
                // this._runPendingInvoke may lead to another selectionChanged, we must not clear
                // this._selectionChangedJob after calling it
                this._selectionChangedJob = null;

                // update the selection object
                var oldSelection = this._selection;
                this._selection = new Mail.FilteredSelection(this._listView.selection.getIndices(), this._collection);

                if (this._pendingInvoke) {
                    this._runPendingInvoke();
                }

                var viaKeyboardIndex = this._viaKeyboardIndex;
                this._viaKeyboardIndex = -1;
                ev.invokeType = this._selection.isIndexSelected(viaKeyboardIndex) ? InvokeTypes.keyboard : this._lastInvokeType;
                ev.diff = oldSelection.diff(this._selection.indices);
                oldSelection.dispose();
                this._lastInvokeType = InvokeTypes.unknown;
                this.raiseEvent("selectionchanged", ev);

                _markStop("_selectionChangedAsyncId");
            },
            this
        );
        _markStop("_onSelectionChanged");
    };

    Mail.SelectionModel.prototype._onTapInvoked = function (/*@dynamic*/ ev) {
        _markStart("_onTapInvoked");
        this._clearAsyncInvoke();

        if (this._isListViewEventInvalid([ev.detail.itemIndex])) {
            return;
        }

        this._lastInvokeType = InvokeTypes.tap;
        // We always want to allow the listview tap animation to start here, so we will fire this event after
        // a setImmediate. We will keep track of the method and the async id. We may need one or the other
        // depending on the situation:
        //
        // If a selectionchange is fired due to this invocation, then we will run the pendingInvoke operation
        // before raising the selectionchange event. At that time we will also clear the _invokeJob.
        //
        // If a selectionchange does not occur due to this invoke, then we will run it on the setImmediate.
        this._pendingInvoke = this._handleItemInvoke.bind(this, ev);
        this._invokeJob = Jx.scheduler.addJob(null, Mail.Priority.messageListPendingInvoke, "selection model - run pending invoke",
            function () {
                this._invokeJob = null;
                this._runPendingInvoke();
            }, this);
        _markStop("_onTapInvoked");
    };

    Mail.SelectionModel.prototype._handleItemInvoke = function (/*@dynamic*/ ev) {
        var index = ev.detail.itemIndex,
            item = this._collection.item(index);
        if (Jx.isFunction(item.onInvoke)) {
            item.onInvoke.call(item);
            return;
        }
        this.raiseEvent("iteminvoked", ev);
    };

    Mail.SelectionModel.prototype._runPendingInvoke = function () {
        _markStart("_runPendingInvoke");
        Debug.assert(Jx.isFunction(this._pendingInvoke));
        this._pendingInvoke();
        this._clearAsyncInvoke();
        _markStop("_runPendingInvoke");
    };

    Mail.SelectionModel.prototype._onKeyboardNavigating = function () {
        this._lastInvokeType = InvokeTypes.keyboard;
    };

    // Helpers
    Mail.SelectionModel.prototype._clearAsyncSelectionChange = function () {
        Jx.dispose(this._selectionChangedJob);
        this._selectionChangedJob = null;
    };

    Mail.SelectionModel.prototype._clearAsyncInvoke = function () {
        this._pendingInvoke = null;
        Jx.dispose(this._invokeJob);
        this._invokeJob = null;
    };

    Mail.SelectionModel.prototype._isListViewEventInvalid = function (/*@type(Array)*/ indices) {
        // The ListView fires the selection change event asynchronously and it does not cancel the selection
        // during datasource invalidation (e.g. folder/account switches)
        // Upon rapid folder switching, it is possible that the selectionchanged/selectionchanging/iteminvoked
        // event from the previous folder gets fired on the new folder. When this happens,
        // the selection indice may be out of bound. We should bail out and ignore the selection change event
        Debug.assert(Jx.isArray(indices), "The indices should be an array");

        _markStart("_isListViewEventInvalid");

        var count = this._collection.count;
        var isValid = indices.some(function (index) {
            return (index >= count);
        });

        _markStop("_isListViewEventInvalid");
        return isValid;
    };

    Mail.SelectionModel.prototype._changeSelection = function (op, args, suppressEvents) {
        _markStart("_changeSelection");
        Debug.assert(Jx.isFunction(op));
        Debug.assert(Jx.isArray(args));
        if (suppressEvents) {
            Jx.dispose(this._listViewEventHook);
            this._clearAsyncSelectionChange();
        }
        _markStart("_changeSelection-listview");
        var promise = op.apply(this._listView.selection, args);
        _markStop("_changeSelection-listview");
        promise = promise.then(function () {
            if (suppressEvents) {
                this._selection = new Mail.FilteredSelection(this._listView.selection.getIndices(), this._collection);
                this._lastInvokeType = InvokeTypes.unknown;
                this._hookListViewEvents();
            }
        }.bind(this));
        _markStop("_changeSelection");
        return promise;
    };

    Mail.SelectionModel.prototype._handleScrollOption = function (index, scrollBehavior) {
        /// We need to set the currentItem to update the shift selection pivot.
        /// However, we should set hasFocus to false, as it set focus on the message list
        if (Jx.isObject(this._listView)) {
            // WinLive # 629835 - Listview may throw when calling this method asynchronously like we're doing here.
            // Will remove the try/catch when the Windows bug is fixed.
            try {
                this._listView.currentItem = { index: index, hasFocus: false };
            } catch (e) {
                Jx.log.warning("SelectionModel._setSelectionInternal - this._listView.currentItem exception. Keyboard focus may be off as a result.");
            }
        }

        var scrollOption = Jx.isString(scrollBehavior) ? scrollBehavior : ScrollOptions.none;
        switch (scrollOption) {
        case ScrollOptions.scrollToTop:
            this._listView.indexOfFirstVisible = 0;
            break;
        case ScrollOptions.ensureVisible:
            this.ensureVisible(index, true /*snapToParent*/);
            break;
        case ScrollOptions.none:
            break;
        default:
            Debug.assert(false, "Invalid scroll options");
            break;
        }
    };

    Mail.SelectionModel.prototype.ensureVisible = function (index, /*@optional*/ snapToParent) {
        Debug.assert(Jx.isNumber(index));
        var logInfo = "SelectionMode.ensureVisible index:=" + index + " snapToParent:=" + Boolean(snapToParent);
        _markStart(logInfo);
        if (snapToParent) {
            var node = this._collection.item(index),
                treeView = this._collection.getTreeView(),
                activeNode = treeView.activeConversation,
                activeNodeIndex = treeView.activeConversationIndex,
                itemsInHalfAPage = window.innerHeight / 56 / 2; // 56px is the item height
            // if the current index belongs to the active thread and the thread header is within the same page, scroll to the header instead
            if (activeNode && node.isDescendant(activeNode.objectId) && (Math.abs(activeNodeIndex - index) < itemsInHalfAPage)) {
                index = activeNodeIndex;
            }
        }
        this._listView.ensureVisible(index);
        _markStop(logInfo);
    };

    function _markStart(s) { Jx.mark("SelectionModel." + s + ",StartTA,SelectionModel"); }
    function _markStop(s) { Jx.mark("SelectionModel." + s + ",StopTA,SelectionModel"); }
});

