
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "SelectionAggregator", function () {
    "use strict";

    var SelectionAggregator = Mail.SelectionAggregator = function (collection, model, view, handler) {
        ///<summary>
        ///This class is responsible for parent-child selection aggregating in checkbox selection mode
        ///</summary>
        _markStart("Ctor");
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isObject(model));
        Debug.assert(Jx.isObject(view));
        Debug.assert(Jx.isObject(handler));

        this._collection = collection;
        this._model = model;
        this._view = view;
        this._selectedParentNodes = [];
        this._treeView = collection.getTreeView();
        this._handler = handler;
        this._initializeSelection();

        this._modelEventHooks = new Mail.Disposer(
            new Mail.EventHook(model, "selectionchanging", this._onSelectionChanging, this),
            new Mail.EventHook(model, "selectionchanged", this._onSelectionChanged, this),
            new Mail.EventHook(model, "iteminvoked", this._onTapInvoked, this)
            );
        this._exitSelectionModeJob = null;
        _markStop("Ctor");
    };
    Jx.inherit(SelectionAggregator, Jx.Events);

    var proto = SelectionAggregator.prototype;
    Debug.Events.define(proto, "selectionchanging", "selectionchanged", "iteminvoked");

    proto._initializeSelection = function () {
        _markStart("_initializeSelection");
        var selectionEditor = new SelectionEditor(this);
        this._model.selection().indices.forEach(function (index) {
            this._notifySelectionChanged(index, true/*add*/, selectionEditor);
        }, this);
        _markStop("_initializeSelection");
    };

    proto.dispose = function () {
        _markStart("dispose");
        for (var node in this._selectedParentNodes) {
            Jx.dispose(this._selectedParentNodes[node]);
        }
        this._selectedParentNodes = {};
        Jx.dispose(this._modelEventHooks);
        Jx.dispose(this._exitSelectionModeJob);

        _markStop("dispose");
    };

    //
    // SelectionModel method forwarding
    //
    proto.isValidIndex = function (index) {
        return this._model.isValidIndex(index);
    };

    proto.addSelection = function (indices, suppressEvents) {
        var logInfo = Jx.isArray(indices) ? indices.join(",") : indices;
        _markInfo("addSelection indices:=[" + logInfo + "] suppressEvents: " + suppressEvents);
        return this._model.addSelection(indices, suppressEvents);
    };

    proto.removeSelection = function (indices, suppressEvents) {
        var logInfo = Jx.isArray(indices) ? indices.join(",") : indices;
        _markInfo("removeSelection indices:=[" + logInfo + "]  suppressEvents: " + suppressEvents);
        return this._model.removeSelection(indices, suppressEvents);
    };

    proto.setSelection = function (index, scrollBehavior, viaKeyboard, suppressEvents) {
        return this._model.setSelection(index, scrollBehavior, suppressEvents);
    };

    proto.setSelectionRange = function (range, suppressEvents) {
        return this._model.setSelectionRange(range, suppressEvents);
    };

    proto.findIndexByElement = function (element) {
        return this._model.findIndexByElement(element);
    };

    proto.ensureVisible = function (index) {
        return this._model.ensureVisible(index);
    };

    proto.selection = function () {
        // compute the selected indices without aggregation
        var modelSelection = this._model.selection();
        modelSelection.logicalItems = this._getLogicallySelectedItems(modelSelection);
        return modelSelection;
    };

    function delegateModelProperty(propertyName, readOnly) {
        Debug.assert(Mail.SelectionModel.prototype.hasOwnProperty(propertyName));

        var descriptor = {
            get: function () {
                return this._model[propertyName];
            },
            enumerable : true
        };

        if (!readOnly) {
            descriptor.set = function (value) {
                this._model[propertyName] = value;
            };
        }
        Object.defineProperty(proto, propertyName, descriptor);
    }

    delegateModelProperty("currentItem", false /*readOnly*/);
    delegateModelProperty("selectionPivot", false /*readOnly*/);
    delegateModelProperty("indexOfFirstVisible", false /*readOnly*/);
    delegateModelProperty("tapBehavior", false /*readOnly*/);
    delegateModelProperty("listViewElement", true /*readOnly*/);

    //
    // Node Expansion handler implementation
    //
    proto.onNodeExpanded = function (ev) {
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isNumber(ev.index));
        Debug.assert(ev.index >= 0);

        var expandedIndex = ev.index,
            node = this._collection.item(expandedIndex);

        _markStart("onNodeExpanded index:=" + expandedIndex + " id:=" + node.objectId);

        var selectionNode = this._getSelectionNode(node, false /*autoCreate*/);
        if (selectionNode) {
            // if the conversation is selected
            var items = selectionNode.getSelectedChildren(expandedIndex);
            this.addSelection(items.indices, true /*suppressEvent*/);
        }

        this._model.ensureVisible(expandedIndex);

        _markStop("onNodeExpanded index:=" + expandedIndex + " id:=" + node.objectId);
    };

    proto.getNodeSelection = function (node) {
        // Given a node, this return the children that are selected
        return this._getSelectionNode(node, false /*autoCreate*/);
    };

    //
    // Event Listeners
    //
    proto._shouldAllowTapSelection = function (newSelection) {
        var newIndices = newSelection.getIndices(),
            diff = this._model.selection().diff(newIndices);
        if ((diff.added.length + diff.removed.length) === 1) {
            var indexTapped = (diff.added.length === 1) ? diff.added[0] : diff.removed[0];
            if (!this._model.isValidIndex(indexTapped)) {
                return false;
            }
            var nodeTapped = this._collection.item(indexTapped);
            return (nodeTapped.totalCount <= 1);
        }
        return true;
    };

    proto._onSelectionChanging = function (/*@dynamic*/ ev) {
        // shift-click can deselect the parent while keeping some children selected, which would messes up the aggregation logic
        // we need to pre-emptively add the parent if there are child in the selection from the
        var newSelection = Mail.SelectionHelper.filterUnselectableItems(this._collection, ev.detail.newSelection),
            allowTapSelection = this._shouldAllowTapSelection(newSelection);

        // we should prevent the tap behavior before check whether selection is empty
        if (!allowTapSelection) {
            ev.detail.preventTapBehavior();
        }
    };

    proto._onSelectionChanged = function (ev) {
        _markStart("onSelectionChanged");
        Debug.assert(Jx.isObject(ev.diff));

        var selectionEditor = new SelectionEditor(this),
            diff = ev.diff;

        diff.added.forEach(function (index) {
            this._notifySelectionChanged(index, true /*isSelected*/, selectionEditor);
        }, this);
        diff.removed.forEach(function (index) {
            this._notifySelectionChanged(index, false /*isSelected*/, selectionEditor);
        }, this);
        diff.deletedItems.forEach(function (item) {
            // if the only selected child got deleted, how to update the parent?
            this._notifyItemDeleted(item, selectionEditor);
        }, this);

        // Only run the pending collapse after processing all indices, as a collapse can shift the indices in the diff
        if (selectionEditor.hasPendingCollapse) {
            this._treeView.collapse();
        }

        // now the aggregator has completed running, if this leads to no selection, exit selection mode
        // this is to work around the problem that the aggregator deselects everything, if we raise selection changed
        // display item manager will set selection on the thing again
        if (selectionEditor.shouldExitSelectionMode || Object.keys(this._selectedParentNodes).length === 0) {
            this._exitSelectionMode();
        } else {
            this.raiseEvent("selectionchanged", ev);
        }
        _markStop("onSelectionChanged");
    };

    proto._onTapInvoked = function (/*@dynamic*/ ev) {
        this.raiseEvent("iteminvoked", ev);
    };

    ///
    /// Aggregation Helpers
    ///
    proto._notifyParentSelectionChanged = function (index, node, isSelected, selectionEditor) {
        _markStart("_notifyParentSelectionChanged");
        var wasSelected = this._isParentNodeSelected(node);

        if (isSelected !== wasSelected) {
            // Do not call notifyParentSelectionChanged(true) to a node that is already selected
            // new parent is selected, create the node
            var selectionNode = this._getSelectionNode(node, isSelected);

            selectionNode.notifyParentSelectionChanged(isSelected, index, selectionEditor);

            if (!isSelected) {
                this._removeNodeFromSelection(selectionNode.objectId);
            }
        }
        _markStop("_notifyParentSelectionChanged");
    };

    proto._notifyChildSelectionChanged = function (index, parentNode, isSelected, selectionEditor) {
        _markStart("_notifyChildSelectionChanged");
        var affectedNode = this._collection.item(index),
            parentNodeSelection = this._getSelectionNode(parentNode, isSelected /*autoCreate*/);

        if (parentNodeSelection) {
            var parentIndex = this._treeView.activeConversationIndex;
            Debug.assert(this._treeView.activeConversation.objectId === parentNode.objectId);
            parentNodeSelection.notifyChildSelectionChanged(affectedNode.objectId, isSelected, parentIndex, selectionEditor);

            if (!parentNodeSelection.selected) {
                this._removeNodeFromSelection(parentNodeSelection.objectId);
            }
        }
        _markStop("_notifyChildSelectionChanged");
    };

    proto.onChildItemDeleted = function (selectionNode, childId) {
        Debug.assert(Jx.isObject(selectionNode));
        Debug.assert(Jx.isNonEmptyString(childId));
        var selectionChangedEvent = {
            diff: {
                added: [],
                removed: [],
                deletedItems: []
            }
        };
        selectionChangedEvent.diff.deletedItems.push({
            parentId : selectionNode.objectId,
            objectId : childId
        });
        this._onSelectionChanged(selectionChangedEvent);
    };

    proto._notifyItemDeleted = function (item, selectionEditor) {
        var isParent = !Boolean(item.parentId);
        if (isParent) {
            this._removeNodeFromSelection(item.objectId);
        } else {
            var parentId = item.parentId,
                selectionNode = this._selectedParentNodes[parentId];
            if (selectionNode) {
                var parentIndex = this._treeView.findIndexByThreadId(parentId),
                    childId = item.objectId;
                Debug.assert(parentIndex !== -1);
                selectionNode.notifyChildDeleted(childId, parentIndex, selectionEditor);

                if (!selectionNode.selected) {
                    this._removeNodeFromSelection(parentId);
                }
            }
        }
    };

    proto._notifySelectionChanged = function (index, isSelected, selectionEditor) {
        if (!this._model.isValidIndex(index)) {
            return;
        }

        var affectedNode = this._collection.item(index),
            isChild = Boolean(affectedNode.parent),
            parentNode = (isChild) ? affectedNode.parent : affectedNode;
        if (isChild) {
            this._notifyChildSelectionChanged(index, parentNode, isSelected, selectionEditor);
        } else {
            this._notifyParentSelectionChanged(index, parentNode, isSelected, selectionEditor);
        }
    };

    proto._exitSelectionMode = function () {
        this._exitSelectionModeJob = Jx.scheduler.addJob(null,
            Mail.Priority.messageListExitSelectionMode,
            "exit selection mode",
            function () {
                this._exitSelectionModeJob = null;
                this._handler.exitSelectionMode();
            },
            this
        );
        this._exitSelectionMode = Jx.fnEmpty;
    };

    ///
    /// Selection Node management
    ///
    proto._getSelectionNode = function (parentNode, autoCreate) {
        Debug.assert(Jx.isObject(parentNode));
        var id = parentNode.objectId,
            node = this._selectedParentNodes[id];
        if (!node && autoCreate) {
            _markInfo("SelectionAggregator._addNode id:=" + id);
            node = this._selectedParentNodes[id] = new Mail.ConversationSelection(parentNode, this._view, this);
        }
        return node;
    };

    proto._removeNodeFromSelection = function (id) {
        var node = this._selectedParentNodes[id];
        if (node) {
            _markInfo("SelectionAggregator._removeNode id:=" + id);
            Jx.dispose(node);
            delete this._selectedParentNodes[id];
        }
    };

    proto._getLogicallySelectedItems = function (modelSelection) {
        // walk through the selection and return the de-aggregated ids
        var items = [];
        modelSelection.items.forEach(function (item) {
            if (!item.parent) {
                var parentId = item.objectId,
                    selection = this._selectedParentNodes[parentId];
                if (selection) {
                    items = items.concat(selection.selectedItems);
                }
            }
        }, this);
        return items;
    };

    proto.isOnlySelectedConversation = function (id) {
        return (id in this._selectedParentNodes) && Object.keys(this._selectedParentNodes).length === 1;
    };

    proto._isParentNodeSelected = function (parentNode) {
        return (parentNode.objectId in this._selectedParentNodes);
    };

    function _markStart(str) {
        Mail.writeProfilerMark("SelectionAggregator." + str, Mail.LogEvent.start);
    }
    function _markStop(str) {
        Mail.writeProfilerMark("SelectionAggregator." + str, Mail.LogEvent.stop);
    }
    function _markInfo(str) {
        Mail.writeProfilerMark("SelectionAggregator." + str);
    }

    var SelectionEditor = function (aggregator) {
        // A private helper class passed towards the ConversationSelection nodes during selection aggregation
        this._shouldExitSelectionMode = false;
        this._hasPendingCollapse = false;
        this._aggregator = aggregator;
    };

    SelectionEditor.prototype.select = function (items) {
        this._aggregator.addSelection(items, true /*suppressEvent*/);
    };

    SelectionEditor.prototype.deselectParent = function (parentIndex, parentId) {
        Debug.assert(Jx.isNumber(parentIndex));
        if (this._aggregator.isOnlySelectedConversation(parentId)) {
            this._shouldExitSelectionMode = true;
        } else {
            // Mark the parent node for collapse when it is deselected.
            // The actual collapse is executed after all indices are processed to avoid shifting the indices in the middle
            this._aggregator.removeSelection(parentIndex, true /*suppressEvent*/);
            this._hasPendingCollapse = true;
        }
    };

    SelectionEditor.prototype.collapseParent = function (parentIndex, parentId) {
        Debug.assert(Jx.isNumber(parentIndex));
        if (this._aggregator.isOnlySelectedConversation(parentId)) {
            this._shouldExitSelectionMode = true;
        } else {
            this._hasPendingCollapse = true;
        }
    };

    Object.defineProperty(SelectionEditor.prototype, "shouldExitSelectionMode", {
        get: function () {
            return this._shouldExitSelectionMode;
        }
    });

    Object.defineProperty(SelectionEditor.prototype, "hasPendingCollapse", {
        get: function () {
            return this._hasPendingCollapse;
        }
    });
});

