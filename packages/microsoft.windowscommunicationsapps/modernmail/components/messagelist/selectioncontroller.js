
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "SelectionController", function () {
    "use strict";

    var ScrollOptions = Mail.SelectionModel.ScrollOptions,
        keyboardInvokeDelay = 400; // .4 seconds

    var SelectionController = Mail.SelectionController = /* @constructor*/function (collection, selection, model, handler) {
        ///<summary>Manages the list of selected indexes and fires notifications when these change</summary>
        ///<param name="collection" type="Mail.TrailingItemCollection" />
        ///<param name="selection" type="Mail.Selection" />
        ///<param name="model" type="Mail.SelectionModel">The model is implemented by Mail.SelectionAggregator in selection mode</param>
        ///<param name="handler" type="Mail.SelectionHandler" />
        Mail.writeProfilerMark("SelectionController_ctor", Mail.LogEvent.start);

        Debug.assert(Jx.isInstanceOf(collection, Mail.TrailingItemCollection));
        Debug.assert(Jx.isObject(model));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isInstanceOf(handler, Mail.SelectionHandler));

        // static_cast collection to a MessageListCollection since it implements a superset of that class
        this._model = model;
        this._collection = collection;
        this._view = selection.view;
        this._handler = handler;
        this._treeView = collection.getTreeView();
        this._displayedItemManager = new Mail.DisplayedItemManager(collection, model, selection);
        this._nodeExpansionHandler = new Mail.SimpleNodeExpansionHandler(selection.view, collection, model);
        this._selection = selection;

        this._tryInvokeAsyncId = -1; // Asynchronously invoke an item
        this._tryAnimationJob = null; // Asynchronously animate to the reading pane in one-pane mode

        var listViewElement = model.listViewElement;
        Debug.assert(Jx.isHTMLElement(listViewElement));

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(this._treeView, "collapsing", this._onNodeCollapsing, this),
            new Mail.EventHook(this._treeView, "expanded", this._onNodeExpanded, this),
            new Mail.EventHook(listViewElement, "keydown", this._onKeyDown, this, true),
            new Mail.EventHook(this._collection, "beginChanges", this._onBeginChanges, this),
            new Mail.EventHook(this._collection, "itemRemoved", this._onItemRemoved, this),
            new Mail.EventHook(this._collection, "endChanges", this._onEndChanges, this)
        );
        this._createModelEventHooks();
        Mail.writeProfilerMark("SelectionController_ctor", Mail.LogEvent.stop);
    };

    // Public
    var prototype = SelectionController.prototype;
    prototype.dispose = function () {
        Mail.writeProfilerMark("SelectionController.dispose", Mail.LogEvent.start);
        this._clearAsyncOperations();

        Jx.dispose(this._disposer);
        this._disposer = null;

        this._model = null;
        this._treeView = null;
        this._collection = null;

        Jx.dispose(this._displayedItemManager);
        this._displayedItemManager = null;
        Mail.writeProfilerMark("SelectionController.dispose", Mail.LogEvent.stop);
    };

    prototype._createModelEventHooks = function () {
        this._modelEventHook = this._disposer.add(new Mail.Disposer(
            new Mail.EventHook(this._model, "selectionchanging", this._onSelectionChanging, this),
            new Mail.EventHook(this._model, "selectionchanged", this._onSelectionChanged, this),
            new Mail.EventHook(this._model, "iteminvoked", this._onItemInvoked, this)
        ));
    };

    prototype.setInitialSelection = function (messageId, indexHint, scrollOption) {
        ///<param name="messageId" type="String" optional="true" />
        ///<param name="indexHint" type="Number" optional="true" />
        ///<param name="scrollOption" type="String" optional="true" />
        Mail.writeProfilerMark("SelectionController.setInitialSelection", Mail.LogEvent.start);

        Debug.assert(Jx.isNullOrUndefined(indexHint) || Jx.isNumber(indexHint));
        Debug.assert(Jx.isNullOrUndefined(messageId) || Jx.isNonEmptyString(messageId));
        Debug.assert(Jx.isNullOrUndefined(scrollOption) || Jx.isNonEmptyString(scrollOption));

        if (this._collection.mailItems.count > 0) {
            var index = this._collection.findIndexByMessageId(messageId, indexHint); // if message Id is null, this will return -1

            if (index === -1) {
                // Default to 0
                index = 0;
                messageId = null;
            }
            scrollOption = Jx.isNonEmptyString(scrollOption) ? scrollOption : ScrollOptions.ensureVisible;
            var node = this._collection.item(index),
                displayedItemInfo = Mail.DisplayedItemRetriever.create(this._view, node).findMessage(messageId),
                displayedIndex = (node.expanded) ? index + displayedItemInfo.offset : index;

            this._displayedItemManager.setDisplayItem(displayedIndex, messageId);
            // this._setSelection will expand the thread if it is not already expanded, such that index no longer referred to the selected thread.
            // Do not access the local variable index after this line
            this._setSelection(displayedIndex, scrollOption, { childIdToSelect: messageId});
        } else {
            this.clearDisplayedItem();
        }

        Mail.writeProfilerMark("SelectionController.setInitialSelection", Mail.LogEvent.stop);
    };

    prototype.setModel = function (model) {
        this._disposer.disposeNow(this._modelEventHook);
        this._modelEventHook = null;
        this._model = model;

        this._displayedItemManager.setModel(model);
        // We need to ask the displayItemManager to keep the reading pane in sync in all cases
        this._updateDisplayedItem();
        this._createModelEventHooks();
    };

    prototype.exitSelectionMode = function () {
        // If the user exits out of selection mode using the button on the app bar.  It is possible that more than one item is
        // selected.  The code below try to select one single item that matches the one in the reading pane
        var prevDisplayedItem = this._displayedItemManager.displayedItem,
            newDisplayIndex = -1;
        if (prevDisplayedItem) {
            var prevId = prevDisplayedItem.objectId,
                nodeIndex = Mail.Collection.findIndexById(this._collection, prevId);

            if (this._model.isValidIndex(nodeIndex)) {
                var node = this._collection.item(nodeIndex);
                if (node.expanded) {
                    var result = Mail.DisplayedItemRetriever.create(this._view, node).findMessage(prevId);
                    Debug.assert(result.offset !== -1);
                    newDisplayIndex = result.offset + nodeIndex;
                } else {
                    newDisplayIndex = nodeIndex;
                }
            }
        }

        if (!this._model.isValidIndex(newDisplayIndex)) {
            // in case the item is deleted, try to select something else
            newDisplayIndex = this._displayedItemManager.handleSelectedItemDeleted();
        }

        if (newDisplayIndex !== -1) {
            this._model.setSelection(newDisplayIndex, ScrollOptions.ensureVisible, true /*suppressEvents*/);
        }
    };

    prototype.setNodeExpansionHandler = function (expansionHandler) {
        this._nodeExpansionHandler = expansionHandler;
    };

    prototype.clearDisplayedItem = function () {
        this._displayedItemManager.clear();
    };

    // Collection listeners
    prototype._onNodeCollapsing = function (/*@dynamic*/ev) {
        Debug.assert(Jx.isNumber(ev.index));
        Debug.assert(Jx.isNumber(ev.firstMessageIndex));
        Debug.assert(Jx.isNumber(ev.lastMessageIndex));
        Debug.assert(ev.firstMessageIndex >= 0);
        Debug.assert(ev.lastMessageIndex >= 0);
        Debug.assert(ev.index >= 0);

        // Be proactive about removing the collapsed messages from the selection.
        // We need to do this or ListView can lose our selection state these messages were the last item in a selection range.
        var toBeRemoved = [];
        for (var i = ev.firstMessageIndex; i <= ev.lastMessageIndex; i++) {
            toBeRemoved.push(i);
        }
        // Do not suppress event here, if this is an aggregate collapse due to the last child message deletion
        // We will lost the selection change
        this._model.removeSelection(toBeRemoved, false /*suppressEvents*/);
    };

    prototype._onNodeExpanded = function (/*@dynamic*/ev) {
        this._nodeExpansionHandler.onNodeExpanded(ev);
    };

    // Model listeners
    prototype._onBeginChanges = function () {
        this._hasSelectableItemsBeforeCurrentOperation = Mail.SelectionHelper.hasSelectableItems(this._collection);
    };

    Mail.SelectionController.prototype._onEndChanges = function () {
        _markStart("_onEndChanges");
        var hasSelectableItemsBefore = this._hasSelectableItemsBeforeCurrentOperation;
        this._hasSelectableItemsBeforeCurrentOperation = false;

        if (!hasSelectableItemsBefore && Mail.SelectionHelper.hasSelectableItems(this._collection)) {
            // We just added an item, select it
            this._setSelection(0, ScrollOptions.none);
        }
        _markStop("_onEndChanges");
    };


    prototype._onItemRemoved = function (evt) {
        _markStart("_onItemRemoved");
        if (this._selection.messages.length === 1) {
            var displayedItemManager = this._displayedItemManager,
                displayedItem = this._displayedItemManager.displayedItem;
            if (displayedItem) {
                // We're looking for an instance where we've got a message selected and its parent conversation was deleted
                var message = displayedItem.message;
                var itemId = evt.objectId; // could be a message or conversation
                if (message.objectId !== itemId && displayedItem.objectId === itemId) {
                    // So now we're going to pretend the current item is deleted and move selection accordingly.
                    var newIndex = displayedItemManager.handleSelectedItemDeleted();
                    _mark("_onItemRemoved: setting expected selection to " + newIndex);
                    this._setSelection(newIndex, ScrollOptions.none, { viaKeyboard: false });
                }
            }
        }
        _markStop("_onItemRemoved");
    };

    prototype._onItemInvoked = function (/*@dynamic*/ev) {
        var index = ev.detail.itemIndex;
        this._tryInvokeItem(index);
    };

    prototype._onSelectionChanging = function (/*@dynamic*/ev) {
        Debug.assert(Jx.isFunction(ev.preventDefault));
        Debug.assert(Jx.isFunction(ev.detail.preventTapBehavior));

        if (!Mail.SelectionHelper.preventEmptySelectionChanging(this._collection, ev)) {
            Mail.log("SelectionController_onSelectionChanging", Mail.LogEvent.start);

            var newIndices = ev.detail.newSelection.getIndices(),
                diff = this._model.selection().diff(newIndices);
            if ((diff.added.length + diff.removed.length) === 1) {
                var indexTapped = (diff.added.length === 1) ? diff.added[0] : diff.removed[0];
                // If the difference in selection is caused by a delete, the indexTapped could be invalid
                if (this._model.isValidIndex(indexTapped) && !this._shouldAllowTapSelection(indexTapped)) {
                    Debug.Mail.log("Preventing tap behavior for selection on index:" + indexTapped);
                    ev.detail.preventTapBehavior();
                }
            }
            Mail.log("SelectionController_onSelectionChanging", Mail.LogEvent.stop);
        }
    };

    prototype._isConversationIndex = function (index) {
        if (index > this._collection.count || index < 0) {
            return false;
        }
        var item = this._collection.item(index);
        return item.type === "conversation";
    };

    prototype._onSelectionChanged = function (/*@dynamic*/ev) {
        this._clearAsyncInvoke();
        if (Mail.SelectionHelper.hasSelectableItems(this._collection)) {
            Mail.writeProfilerMark("SelectionController._onSelectionChanged_nonEmptyCollection", Mail.LogEvent.stop);
            var newSelection = this._model.selection(),
                fromKeyboard = ev.invokeType === Mail.SelectionModel.InvokeTypes.keyboard;

            // Ensure we set focus so we keep keyboard interactions consistent
            var newDisplayIndex = this._displayedItemManager.handleSelectionChange(newSelection, fromKeyboard);

            if (newSelection.length === 0) {
                // Use alwaysAllowTapSelection because it looks better when we select the next item,
                // even if its a thread header with multiple messages.
                this._setSelection(newDisplayIndex, ScrollOptions.ensureVisible, { alwaysAllowTapSelection: true });
            } else if (newSelection.length === 1 && !fromKeyboard) {
                this._model.currentItem = { index: newSelection.indices[0], hasFocus: false };
            }

            if (fromKeyboard && newSelection.length === 1 && this._isConversationIndex(newSelection.indices[0])) {
                // Special case: if this is a keyboard selection on a thread, we should treat it as a delayed invocation
                this._tryInvokeAsync(newSelection.indices[0], keyboardInvokeDelay, true /*suppressNavigation*/);
            }
            Mail.writeProfilerMark("SelectionController._onSelectionChanged_nonEmptyCollection", Mail.LogEvent.stop);
        } else {
            this.clearDisplayedItem();
        }
    };

    // DOM listeners
    function mirrorKeyInRTL(direction) {
        Debug.assert(direction === "Left" || direction === "Right");
        if (Jx.isRtl()) {
            direction = (direction === "Left") ? "Right" : "Left";
        }
        return direction;
    }

    prototype._onKeyDown = function (ev) {
        /// <summary>We will intercept left and right arrow keys in cases where we can collapse or expand the current selection</summary>
        /// <param name="ev" type="Event"></param>
        Debug.assert(Jx.isObject(ev));
        var key = ev.key;
        if (key === "Left" || key === "Right") {
            _markStart("_onKeyDown key:=" + key);
            var selection = this._model.selection(),
                selectedIndex = selection.length === 1 ? selection.indices[0] : -1;

            if (this._model.isValidIndex(selectedIndex)) {
                var selectedNode = this._collection.item(selectedIndex),
                    expand = (key === mirrorKeyInRTL("Right"));

                if (expand && !selectedNode.expanded && (selectedNode.totalCount > 1)) {
                    this._treeView.expand(selectedIndex);
                    ev.stopImmediatePropagation();
                }

                if (!expand && this._treeView.expanded) {
                    Debug.assert(this._treeView.activeConversationIndex !== -1);
                    // Set the selection on the thread header, which will collapse it automatically.
                    this._setSelection(this._treeView.activeConversationIndex, ScrollOptions.ensureVisible, { viaKeyboard: false });
                    ev.stopImmediatePropagation();
                }
            }
            _markStop("_onKeyDown key:=" + key);
        }
    };

    // Helpers

    // Override Mail.SelectionManagerBase.prototype._setSelection
    prototype._setSelection = function (index, scrollBehavior, /*@dynamic*/options) {
        ///<summary>Sets the selection and "invokes" the selection to initiate expand/collapse as necessary</summary>
        ///<param name="index" type="Number" />
        ///<param name="scrollBehavior" type="String"></param>
        ///<param name="options" type="Object" optional="true">
        ///- name="viaKeyboard" type="Boolean"
        ///- name="alwaysAllowTapSelection" type="Boolean" - If true, will select a thread header even if there are 2+ messages (normal behavior is to not select until it expands)
        ///- name="childIdToSelect" type="String" - If index is a thread, we will use this messageId to determine which message to show in the reading pane
        ///</param>

        _markStart("_setSelection");
        // Fix up parameters
        options = options || {};
        options.viaKeyboard = (Jx.isNullOrUndefined(options.viaKeyboard)) ? false : options.viaKeyboard;
        var childIdToSelect = options.childIdToSelect;

        // validation
        Debug.assert(Jx.isNumber(index));
        Debug.assert(Jx.isNonEmptyString(scrollBehavior));
        Debug.assert(Jx.isUndefined(options) || Jx.isObject(options));
        Debug.assert(!options.viaKeyboard || !Jx.isNonEmptyString(childIdToSelect),
            "Using a messageId with viaKeyboard is not currently supported");

        if (!this._model.isValidIndex(index)) {
            _markStop("_setSelection");
            return;
        }

        // Programmatically setting the selection should always trump any existing expand/collapse operations.
        this._clearAsyncOperations();

        // Evaluate shouldAllowSelection before calling invokeItem. If _tryInvokeItem() ends up expanding the thread,
        // then this._shouldAllowTapSelection() may return true when it should have been false.
        var shouldAllowSelection = options.alwaysAllowTapSelection || options.viaKeyboard || this._shouldAllowTapSelection(index);

        // If this was not a "keyboard" selection, try to invoke the item immediately.
        // Else, the default keyboard delayed invoke logic will handle this.
        //
        // Note: It's important to call this BEFORE calling _setSelection because
        // this call will remove any pending selection operations.
        if (!options.viaKeyboard && !options.disableInvoke) {
            this._tryInvokeItem(index, true /*suppressNavigation*/, childIdToSelect);
        }

        if (shouldAllowSelection) {
            this._model.setSelection(index, scrollBehavior, options.viaKeyboard);
        }
        _markStop("_setSelection");
    };

    prototype._shouldAllowTapSelection = function (index) {
        var node = this._collection.item(index),
            isCollapsedMultiItemHeader = (node.totalCount > 1) && !node.expanded;
        return !isCollapsedMultiItemHeader;
    };

    prototype._clearAsyncInvoke = function () {
        if (this._tryInvokeAsyncId !== -1) {
            clearTimeout(this._tryInvokeAsyncId);
            this._tryInvokeAsyncId = -1;
        }
    };

    prototype._clearAsyncAnimation = function () {
        Jx.dispose(this._tryAnimationJob);
        this._tryAnimationJob = null;
    };

    prototype._tryInvokeAsync = function (index, delay, suppressNavigation) {
        /// <param name="index" type="Number"></param>
        /// <param name="delay" type="Number"></param>
        /// <param name="suppressNavigation" type="Boolean" optional="true"></param>
        Debug.assert(this._model.isValidIndex(index));
        Debug.assert(Jx.isNumber(delay));

        // Clear any pending invocations/expansions
        this._clearAsyncOperations();

        this._tryInvokeAsyncId = setTimeout(this._tryInvokeItem.bind(this, index, suppressNavigation), delay);
    };

    prototype._clearAsyncOperations = function () {
        this._clearAsyncInvoke();
        this._clearAsyncAnimation();
        this._treeView.clearPendingExpandCollapse();
    };

    prototype._tryInvokeItem = function (index, /*@optional*/suppressNavigation, /*@optional*/childIdToSelect) {
        /// <param name="index" type="Number"></param>
        /// <param name="suppressNavigation" type="Boolean"></param>
        /// <param name="childIdToSelect" type="type">The childrenNode to select after an expansion</param>
        Debug.assert(Jx.isNumber(index));
        Mail.writeProfilerMark("SelectionController._tryInvokeItem - index:" + String(index), Mail.LogEvent.start);

        if (this._model.isValidIndex(index)) {
            this._clearAsyncOperations();
            // Calling toggleExpansion may collapse the active thread, which makes the index no longer meaningful
            // We need to cache the invoked item before toggling the expansion
            var invokedItem = /*@static_cast(Mail.MessageListTreeNode)*/ this._collection.item(index),
                isConversation = (invokedItem.type === "conversation"),
                hasChildren = invokedItem.totalCount > 1,
                // In selection mode, tapping on an item should select it instead of activating it
                tryNavigation = !suppressNavigation && !hasChildren;

            if (invokedItem.pendingRemoval) {
                Jx.log.warning("SelectionController._tryInvokeItem - ignoring the invoke event as item is pending removal");
                Mail.writeProfilerMark("SelectionController._tryInvokeItem - index:" + String(index), Mail.LogEvent.stop);
                return;
            }

            if (isConversation) {
                // We need to invoke the node as long as it is not a leave node
                // Expanding a single item parent will enable it to auto-expand when children are added
                this._toggleExpansion(index, childIdToSelect);
            }

            if (tryNavigation) {
                this._tryOnePaneNavigation(invokedItem);
            }
        }
        Mail.writeProfilerMark("SelectionController._tryInvokeItem - index:" + String(index), Mail.LogEvent.stop);
    };

    prototype._updateDisplayedItem = function () {
        var currentSelection = this._model.selection(),
            newDisplayIndex = this._displayedItemManager.handleSelectionChange(currentSelection, false /*viaKeyboard*/);
        if (currentSelection.length === 0 && newDisplayIndex !== -1) {
            this._setSelection(newDisplayIndex, ScrollOptions.ensureVisible, {
                alwaysAllowTapSelection: true,
                disableInvoke: true // Our PM what the thread to stay collapsed after exiting out of selection mode
            });
        }
    };

    prototype._tryOnePaneNavigation = function (invokedItem) {
        /// <param name="invokedItem" type="Mail.MessageListTreeNode"></param>
        Debug.assert(Jx.isInstanceOf(invokedItem, Mail.MessageListTreeNode));
        Debug.assert(Jx.isInstanceOf(invokedItem.data, Mail.UIDataModel.MailItem));

        if (Mail.guiState.isOnePane && !this._handler.isSelectionMode) {
            // Run this after an setImmediate in order to ensure we get the selectionChanged event before evaluating "sameness."
            // Note: No need to clear out an existing this._tryAnimationJob here because it will have already been cleared by invokeItem.
            this._tryAnimationJob = Jx.scheduler.addJob(null,
                Mail.Priority.messageListTryAnimation,
                "threaded selection controller - one pane animation",
                function () {
                    if (Mail.guiState.isOnePane) {
                        var lastDisplayedItem = this._displayedItemManager.displayedItem,
                            sameMessage = lastDisplayedItem && lastDisplayedItem.objectId === invokedItem.objectId;
                        Mail.Globals.animator.animateNavigateForward(Jx.fnEmpty, sameMessage);
                    }
                },
                this
            );
        }
    };

    prototype._toggleExpansion = function (index, /*@optional*/ childIdToSelect) {
        /// <summary>Expands/collapses the thread at the given index.</summary>
        /// <param name="index" type="Number"></param>
        Debug.assert(this._model.isValidIndex(index));
        Debug.assert(this._isConversationIndex(index));
        Mail.writeProfilerMark("SelectionController._toggleExpansion - index:= " + String(index), Mail.LogEvent.start);
        var node = this._collection.item(index);
        if (!node.expanded) {
            this._treeView.expand(index, childIdToSelect).then(function () {
                if (!this._treeView.expanded) {
                    this._model.ensureVisible(this._treeView.activeConversationIndex);
                }
            }.bind(this));
        } else {
            this._treeView.collapse();
        }
        Mail.writeProfilerMark("SelectionController._toggleExpansion - index:= " + String(index), Mail.LogEvent.stop);
    };

    SelectionController.getSelectionRange = function (pressedIndex, shiftKey, selectionModel) {
        /// <summary>Compute the new selection range based on shiftKey, the pressedIndex and currentSelection</summary>
        /// <param name="pressedIndex" type="Number"></param>
        /// <param name="shiftKey" type="Boolean"></param>
        /// <param name="selectionModel" type="Mail.SelectionModel"></param>
        Debug.assert(Jx.isValidNumber(pressedIndex));
        Debug.assert(Jx.isBoolean(shiftKey));
        Debug.assert(Jx.isObject(selectionModel));
        var currentSelection = selectionModel.selection().indices,
            first = pressedIndex,
            last = first;

        if (shiftKey) {
            var pivot = selectionModel.selectionPivot;
            if (pivot === -1) {
                pivot = (currentSelection.length > 0) ? currentSelection[currentSelection.length - 1] : pressedIndex;
            }
            first = Math.min(pressedIndex, pivot);
            last = Math.max(pressedIndex, pivot);
        }
        return {
            firstIndex: first,
            lastIndex: last
        };
    };

    prototype.onCheckBoxClicked = function (srcElement, shiftKey) {
        Mail.writeProfilerMark("SelectionController._onCheckBoxClicked", Mail.LogEvent.start);
        Debug.assert(Jx.isHTMLElement(srcElement));
        var index = this._model.findIndexByElement(srcElement),
            selectionRange = Mail.SelectionController.getSelectionRange(index, shiftKey, this._model);

        if (!shiftKey) {
            // if the shift key is not pressed, update the currentItem so the selection pivot will be updated
            this._model.currentItem = {
                index: index
            };
        }

        if (this._handler.isSelectionMode) {
            if (shiftKey) {
                this._model.addSelection(selectionRange);
            } else {
                var currentSelection = this._model.selection(),
                    isSelected = currentSelection.isIndexSelected(index),
                    toggleSelection = (isSelected) ? this._model.removeSelection : this._model.addSelection;
                toggleSelection.call(this._model, index);
            }
        } else {
            this._model.setSelectionRange(selectionRange, true /*suppressEvent*/).then(function () {
                this._handler.startSelectionMode();
            }.bind(this));
        }
        Mail.writeProfilerMark("SelectionController._onCheckBoxClicked", Mail.LogEvent.stop);
    };

    Mail.SimpleNodeExpansionHandler = function (view, collection, model) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isObject(model));

        this._view = view;
        this._collection = collection;
        this._model = model;
    };

    Mail.SimpleNodeExpansionHandler.prototype.onNodeExpanded = function (ev) {
        Debug.assert(Boolean(ev));
        Debug.assert(Jx.isNumber(ev.index));
        Debug.assert(ev.index >= 0);
        var expandedIndex = ev.index,
            node = this._collection.item(expandedIndex),
            finalIndex = expandedIndex + 1;

        if (node.totalCount <= 1) {
            return;
        }

        var displayedItemInfo = Mail.DisplayedItemRetriever.create(this._view, node).findMessage(ev.childIdToSelect);
        if (displayedItemInfo.offset !== -1) {
            finalIndex = expandedIndex + displayedItemInfo.offset;
        }

        if (finalIndex !== -1) {
            this._model.setSelection(finalIndex, ScrollOptions.ensureVisible, false);
        }
    };

    function _mark(s) { Jx.mark("SelectionController:" + s); }
    function _markStart(s) { Jx.mark("SelectionController." + s + ",StartTA,SelectionController"); }
    function _markStop(s) { Jx.mark("SelectionController." + s + ",StopTA,SelectionController"); }
    //function _markAsyncStart(s) { Jx.mark("SelectionController:" + s + ",StartTM,SelectionController"); }
    //function _markAsyncStop(s) { Jx.mark("SelectionController:" + s + ",StopTM,SelectionController"); }

});
