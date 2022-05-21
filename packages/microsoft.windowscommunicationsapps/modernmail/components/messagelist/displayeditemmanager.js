
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "DisplayedItemManager", function () {
    "use strict";

    var SelectionModel = Mail.SelectionModel,
        ScrollOptions = SelectionModel.ScrollOptions,
        SelectionHelper = Mail.SelectionHelper,
        SelectionHelperEventTypes = SelectionHelper.EventTypes;

    Mail.DisplayedItemManager = function (collection, model, selection) {
        /// <summary>
        /// The term displayedItem refers to the message that is displayed in the reading pane.
        /// This class is responsible for keeping tracks of the displayedItem when selection changes
        /// </summary>
        /// <param name="collection" type="Mail.TrailingItemCollection"></param>
        /// <param name="model" type="Mail.SelectionModel">The model is implemented by Mail.SelectionAggregator in selection mode</param>
        /// <param name="selection" type="Mail.Selection"></param>
        Debug.assert(Jx.isInstanceOf(collection, Mail.TrailingItemCollection));
        Debug.assert(Jx.isInstanceOf(model, SelectionModel));
        Debug.assert(Jx.isObject(selection));
        this._collection = collection;
        this._model = model;
        this._selection = selection;
        this._view = selection.view;

        this._displayedIndex = -1;
        this._displayedItem = null;
        this._displayedItemParentId = null;
        this._displayedItemHook = null;

        // hook events
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(this._collection, "itemAdded", this._onItemAdded, this),
            new Mail.EventHook(this._collection, "itemRemoved", this._onItemRemoved, this),
            new Mail.EventHook(this._collection, "itemMoved", this._onItemMoved, this),
            new Mail.EventHook(this._collection, "reset", this._onReset, this),
            Mail.EventHook.createGlobalHook(Mail.Commands.Events.showNextMessage, this._selectNextMessage, this),
            Mail.EventHook.createGlobalHook(Mail.Commands.Events.showPreviousMessage, this._selectPreviousMessage, this));
    };

    Mail.DisplayedItemManager.prototype.dispose = function () {
        // unhook events
        Jx.dispose(this._disposer);
    };

    Object.defineProperty(Mail.DisplayedItemManager.prototype, "displayedItem", {
        get : function () { return this._displayedItem; },
        enumerable : true
    });

    Mail.DisplayedItemManager.prototype.setModel = function (model) {
        this._model = model;
    };

    Mail.DisplayedItemManager.prototype._findNewDisplayedIndex = function () {
        var newDisplayedIndex = -1,
            prevDisplayId = (this._displayedItem) ? this._displayedItem.objectId : "",
            newSelection = this._model.selection();

        if (prevDisplayId) {
            // start with matching the parent in view
            _mark("_findNewDisplayedIndex - trying to keep " + prevDisplayId + " in view");
            newDisplayedIndex = newSelection.indexOfObject(prevDisplayId);
        }

        // If it is not, use the first item in the current selection
        if (newDisplayedIndex === -1) {
            var newIndices = newSelection.indices;
            if (newIndices.length > 1) {
                // In selection mode, the expanded header can be selected with its children. We need to filter it out first
                newIndices = newIndices.filter(function (index) {
                    var node = this._collection.item(index);
                    return !node.expanded;
                }, this);
            }
            Debug.assert(newIndices.length >= 1);
            _mark("_findNewDisplayedIndex - no displayed item: setting first index from selection" + newSelection[0]);
            newDisplayedIndex = newIndices[0];
        }
        return newDisplayedIndex;
    };

    Mail.DisplayedItemManager.prototype.handleSelectionChange = function (newSelection, fromKeyboard) {
        /// <param name="newSelection" type="Mail.FilteredSelection"></param>
        /// <param name="fromKeyboard" type="Boolean"></param>
        Debug.assert(Jx.isInstanceOf(newSelection, Mail.FilteredSelection));
        var newIndex = -1;

        _markStart("_onSelectionChanged");
        if (newSelection.length === 0) {
            newIndex = this.handleSelectedItemDeleted();
        } else {
            // Try to keep the last displayed item if it is still selected
            newIndex = this._findNewDisplayedIndex();
            var newNode = this._collection.item(newIndex),
                selectedItems = newSelection.logicalItems,
                displayedItem = Mail.DisplayedItem.create(this._view, newNode, null /*childId*/, this._model.getNodeSelection(newNode));
            this.setDisplayItems(newIndex, displayedItem, selectedItems, fromKeyboard);
        }
        _markStop("_onSelectionChanged");
        return newIndex;
    };

    Mail.DisplayedItemManager.prototype._findNextSelectableIndex = function (current) {
        Debug.assert(Jx.isNumber(current));
        var count = this._collection.mailItems.count;
        current = Mail.Validators.clamp(current, 0, count - 1);

        for (var i = current; i < count; i++) {
            var node = this._collection.item(i);
            if (!node.pendingRemoval && node.selectable) {
                return i;
            }
        }
        return -1;
    };

    Mail.DisplayedItemManager.prototype._findPrevSelectableIndex = function (current) {
        Debug.assert(Jx.isNumber(current));
        current = Mail.Validators.clamp(current, 0, this._collection.mailItems.count - 1);
        for (var i = current; i >= 0; i--) {
            var node = this._collection.item(i);
            if (!node.pendingRemoval && node.selectable) {
                return i;
            }
        }
        return -1;
    };

    function belongsToParent(collection, index, parentId) {
        Debug.assert(Jx.isObject(collection));
        if (index < 0 || index >= collection.count) {
            return false;
        }
        var node = collection.item(index);
        return node.isDescendant(parentId);
    }

    Mail.DisplayedItemManager.prototype.handleSelectedItemDeleted = function () {
        var oldDisplayedIndex = this._displayedIndex,
            previousParentId = this._displayedItemParentId,
            newDisplayedIndex = -1;

        Debug.assert(Jx.isValidNumber(oldDisplayedIndex));
        if (!SelectionHelper.hasSelectableItems(this._collection)) {
            return newDisplayedIndex;
        }

        _markStart("handleSelectedItemDeleted");
        var prevIndex = this._findPrevSelectableIndex(oldDisplayedIndex - 1),
            prevNodeBelongsToParent = belongsToParent(this._collection, prevIndex, previousParentId),
            prevNodeIsLastChildInParent = prevNodeBelongsToParent && !belongsToParent(this._collection, oldDisplayedIndex, previousParentId);

        // We no longer have a selection so we need to choose the next item to select in the list. The rules are as follows:
        // If the previous item belongs to the same parent and it is the last item in the conversation
        //   move back 1
        // Else
        //   move forward 1
        if (prevNodeIsLastChildInParent) {
            newDisplayedIndex = prevIndex;
        } else {
            // Move forward 1
            // The last item may not always be selectable, we need to walk the collection to find the selectable item
            newDisplayedIndex = this._findNextSelectableIndex(oldDisplayedIndex);
        }
        Debug.assert(this._model.isValidIndex(newDisplayedIndex), "We should be able to select something since the collection is not empty");
        _markStop("handleSelectedItemDeleted");
        return newDisplayedIndex;
    };

    Mail.DisplayedItemManager.prototype.clear = function () {
        this.setDisplayItems(-1, null, [], false);
    };

    Mail.DisplayedItemManager.prototype.setDisplayItem = function (index, childId) {
        Debug.assert(index >= 0 && index < this._collection.count);
        Debug.assert(Jx.isNullOrUndefined(childId) || Jx.isNonEmptyString(childId));

        var node = this._collection.item(index),
            displayedItem = Mail.DisplayedItem.create(this._view, node, childId, this._model.getNodeSelection(node));
        this.setDisplayItems(index, displayedItem, [node], false);
    };

    Mail.DisplayedItemManager.prototype.setDisplayItems = function (index, displayedItem, selectedNodes, keyboard) {
        /// <param name="index" type="Number">The index of the list of displayedItems to forward</param>
        /// <param name="keyboard" type="Boolean">Need to set that information to delay reading pane loading</param>
        /// <param name="selectedNodes" type="Array">An array of objects which can either be messages or conversations</param>
        Debug.assert(Jx.isNumber(index));
        Debug.assert(Jx.isBoolean(keyboard));
        Debug.assert(Jx.isArray(selectedNodes));

        var displayedItemObjectId = (displayedItem) ? displayedItem.objectId : "",
            logEventName = "setDisplayItems - index:=" + index + " id:=" + displayedItemObjectId + " keyboard:=" + keyboard;
        _markStart(logEventName);

        // Keep the locality info of the current display item regardless its validity.
        // We need this info to preserve the selection locality when the current item is deleted
        this._displayedIndex = index;
        this._displayedItem = this._disposer.replace(this._displayedItem, displayedItem);
        this._hookDisplayedItem();
        this._displayedItemParentId = (this._displayedItem) ? this._displayedItem.parentId : "";

        this._updateAppSelection(keyboard, index, selectedNodes);
        _markStop(logEventName);
    };

    Mail.DisplayedItemManager.prototype._hookDisplayedItem = function () {
        this._disposer.disposeNow(this._displayedItemHook);
        this._displayedItemHook = null;

        if (this._displayedItem) {
            this._displayedItemHook = this._disposer.add(new Mail.Disposer(
                new Mail.EventHook(this._displayedItem, "messageChanged", this._onDisplayedItemChanged, this),
                new Mail.EventHook(this._displayedItem, "requestExpansion", this._onRequestExpansion, this)
            ));
        }
    };

    Mail.DisplayedItemManager.prototype._updateAppSelection = function (keyboardInvoked, displayedIndex, selected) {
        ///<param name="keyboardInvoked" type="Boolean"/>
        ///<param name="displayedItem" type="Mail.MessageListTreeNode"/>
        ///<param name="displayedIndex" type="Number"/>
        ///<param name="selected" type="Array"/>
        Debug.assert(Jx.isBoolean(keyboardInvoked));
        Debug.assert(Jx.isValidNumber(displayedIndex));
        Debug.assert(Jx.isArray(selected));

        _markStart("_updateAppSelection - changing selection");

        var message = this._displayedItem ? this._displayedItem.message : null,
            hasDisplayItem = false,
            filteredSelection = [];

        if (message) {
            filteredSelection = selected.filter(function (mailItem) {
                    return !mailItem.pendingRemoval;
                }).map(function (/*@type(Mail.MessageListTreeNode)*/ item) {
                    return item.data;
                });
            hasDisplayItem = filteredSelection.length > 0;
        }

        if (!hasDisplayItem) {
            Debug.assert(filteredSelection.length === 0, "If we have no display item, filteredSelection should be empty.");
            this._selection.clearMessageSelection();
        } else {
            Debug.Mail.log("_updateAppSelection - new selection: " + String(displayedIndex));
            Debug.assert(filteredSelection.length > 0, "If we have a display item, filteredSelection should be non-empty.");
            this._selection.updateMessages(message, displayedIndex, filteredSelection, keyboardInvoked);
        }
        _markStop("_updateAppSelection - changing selection");
    };

    ///
    /// Handles Ctrl + , and Ctrl + . navigation
    ///
    Mail.DisplayedItemManager.prototype._selectNextMessage = function () {
        // setSelection is smart enough to handle invalid selection indices
        this._model.setSelection(this._displayedIndex + 1, ScrollOptions.ensureVisible, true /*viaKeyboard*/);
    };

    Mail.DisplayedItemManager.prototype._selectPreviousMessage = function () {
        // setSelection is smart enough to handle invalid selection indices
        this._model.setSelection(this._displayedIndex - 1, ScrollOptions.ensureVisible, true /*viaKeyboard*/);
    };

    ///
    /// Collection change handlers
    ///
    Mail.DisplayedItemManager.prototype._handleCollectionChange = function (eventType, /*@dynamic*/changeEvent) {
        /// <param name="eventType" type="String"/>
        /// <param name="changeEvent" type="Event"/>
        Debug.assert(Jx.isNonEmptyString(eventType));
        Debug.assert(Jx.isObject(changeEvent));

        if (this._collection.count === 0) {
            this.clear();
            return;
        }

        // Update indices based on change type. do not update the displayed index even when it is deleted.
        // We need the locality information to handle delete
        this._displayedIndex = SelectionHelper.getUpdatedIndex(eventType, changeEvent, this._displayedIndex);
    };

    Mail.DisplayedItemManager.prototype._onReset = function () {
        this._displayedIndex = -1;
        this._disposer.disposeNow(this._displayedItemHook);
        this._disposer.disposeNow(this._displayedItem);
        this._displayedItemHook = null;
        this._displayedItem = null;
        this._displayedItemParentId = null;
    };

    Mail.DisplayedItemManager.prototype._onItemAdded = function (ev) {
        this._handleCollectionChange(SelectionHelperEventTypes.itemAdded, ev);
    };

    Mail.DisplayedItemManager.prototype._onItemRemoved = function (ev) {
        this._handleCollectionChange(SelectionHelperEventTypes.itemRemoved, ev);
    };

    Mail.DisplayedItemManager.prototype._onItemMoved = function (ev) {
        this._handleCollectionChange(SelectionHelperEventTypes.itemMoved, ev);
    };

    Mail.DisplayedItemManager.prototype._onRequestExpansion = function (ev) {
        /// Auto exapnd when a childItem is added to the displayed item.
        Debug.assert(Jx.isNonEmptyString(ev.messageId));
        var treeView = this._collection.getTreeView();
        treeView.expand(this._displayedIndex, ev.messageId);
    };

    Mail.DisplayedItemManager.prototype._onDisplayedItemChanged = function () {
        /// Update the app selection if the active message of the current displayed item is deleted.
        var newMessage = this._displayedItem.message,
            selectedItems = this._selection.messages;
        Debug.assert(Jx.isObject(newMessage));
        this._selection.updateMessages(newMessage, this._displayedIndex, selectedItems, false);
    };

    function _mark(s) { Jx.mark("DisplayedItemManager." + s); }
    function _markStart(s) { Jx.mark("DisplayedItemManager." + s + ",StartTA,DisplayedItemManager"); }
    function _markStop(s) { Jx.mark("DisplayedItemManager." + s + ",StopTA,DisplayedItemManager"); }
});
