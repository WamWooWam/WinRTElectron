
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "ConversationSelection", function () {
    "use strict";
    var ConversationSelection = Mail.ConversationSelection = /*@constructor*/ function (node, view, aggregator) {
        /// <param name="node" type="Mail.MessageListTreeNode"></param>
        Debug.assert(Jx.isInstanceOf(node, Mail.MessageListTreeNode));
        Debug.assert(Jx.isObject(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(aggregator, Mail.SelectionAggregator));
        Debug.assert(!node.parent, "Child nodes should have their selection maintained by its top-level parent");

        this._markStart("Ctor", node.objectId);
        this._node = node;
        this._customChildSelection = {};
        this._selected = false;
        this._view = view;
        this._aggregator = aggregator;
        this._itemRemovedEventHook = new Mail.EventHook(this._node, "itemRemoved", this._onItemRemoved, this);
        this._markStop("Ctor");
    };

    var proto = ConversationSelection.prototype;

    proto.dispose = function () {
        Jx.dispose(this._itemRemovedEventHook);
        this._itemRemovedEventHook = null;
    };

    proto.getSelectedChildren = function (baseIndex) {
        return (this.hasCustomSelection) ? this._getCustomChildSelection(baseIndex) : this._getDefaultChildSelection(baseIndex);
    };

    proto.notifyChildDeleted = function (childId, parentIndex, selectionEditor) {
        var childIndex = this._node.findIndexById(childId);
        if (childIndex === -1) {
            // make sure it is a real delete
            this.notifyChildSelectionChanged(childId, false, parentIndex, selectionEditor);
        }
    };

    proto.notifyChildSelectionChanged = function (childId, isSelected, parentIndex, selectionEditor) {
        var logInfo = "notifyChildSelectionChanged childId:" + childId + " isSelected:= " + isSelected + " parentIndex:=" + parentIndex;
        this._markStart(logInfo);
        this._initCustomChildSelection();
        var wasSelected = this._selected;

        if (isSelected) {
            // selecting the child would make the parent selected
            this._selected = isSelected;
            this._customChildSelection[childId] = true;
        } else {
            delete this._customChildSelection[childId];
        }

        // Handle aggregation
        if (this.hasCustomSelection !== wasSelected) {
            this._selected = isSelected;
            if (wasSelected) {
                selectionEditor.deselectParent(parentIndex, this.objectId);
            } else {
                selectionEditor.select(parentIndex);
            }
        }
        this._markStop(logInfo);
    };

    proto.notifyParentSelectionChanged = function (isSelected, parentIndex, selectionEditor) {
        var logInfo = "notifyParentSelectionChanged isSelected:= " + isSelected + " parentIndex:=" + parentIndex;
        this._markStart(logInfo);
        this._selected = isSelected;

        // Handle aggregation, only do that for expanded nodes
        if (this._node.expanded) {
            if (isSelected) {
                // if an expanded node is selected, aggregate selection on the child
                var childSelection = this._getDefaultChildSelection(parentIndex);
                selectionEditor.select(childSelection.indices);
            } else {
                // if an expanded node is deselected, collapse and remove all child selection
                this._customChildSelection = {};
                selectionEditor.collapseParent(parentIndex, this.objectId);
            }
        }
        this._markStop(logInfo);
    };

    Object.defineProperty(proto, "hasCustomSelection", {
        get: function () {
            return Object.keys(this._customChildSelection).length > 0;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "objectId", {
        get: function () {
            return this._node.objectId;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "selected", {
        get: function () {
            return this._selected;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "expanded", {
        get: function () {
            return this._node.expanded;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "selectedItems", {
        get: function () {
            var items = [];
            if (!this.hasCustomSelection) {
                items.push(this._node);
            } else {
                this._node.forEach(function (childNode) {
                    if (childNode.objectId in this._customChildSelection) {
                        items.push(childNode);
                    }
                }, this);
            }
            return items;
        },
        enumerable: true
    });

    proto._onItemRemoved = function (ev) {
        // When an item is deleted from an expanded conversation which is visible, selectionchanged
        // will fire and the selection will be updated correctly.
        // We only need to worry about the case when the thread is collapsed, which is handled here.
        if (!this._node.expanded) {
            Debug.assert(Jx.isNonEmptyString(ev.objectId));
            this._aggregator.onChildItemDeleted(this, ev.objectId);
        }
    };

    proto._initCustomChildSelection = function () {
        // copy the default selection into the custom child selection object map
        if (this._selected && !this.hasCustomSelection) {
            var result = this._getDefaultChildSelection(0);
            result.ids.map(function (id) {
                this._customChildSelection[id] = true;
            }, this);
        }
    };

    proto._getDefaultChildSelection = function (baseIndex) {
        /// <returns>the indices of all its children that belongs to the current view</returns>
        Debug.assert(Jx.isNumber(baseIndex));

        var indices = [],
            ids = [],
            mailConversation = this._node.data,
            ViewCustomizations = Mail.ViewCustomizations;

        this._node.forEach(function (childNode, index) {
            if (!childNode.pendingRemoval && ViewCustomizations.shouldBeDefaultSelection(mailConversation, childNode.data, this._view)) {
                indices.push(baseIndex + index + 1);
                ids.push(childNode.objectId);
            }
        }, this);
        return {
            indices: indices,
            ids: ids
        };
    };

    proto._getCustomChildSelection = function (baseIndex) {
        /// <returns>the indices of all its children that matches the custom selection</returns>
        Debug.assert(Jx.isNumber(baseIndex));
        var indices = [],
            ids = [];
        this._node.forEach(function (childNode, index) {
            var id = childNode.objectId;
            if (id in this._customChildSelection) {
                indices.push(baseIndex + index + 1);
                ids.push(id);
            }
        }, this);

        return {
            indices: indices,
            ids: ids
        };
    };

    proto._markStart = function (evt, objectId) {
        /// <param name="objectId" type="String" optional="true">This is used by the Ctor when this.objectId is not initialize</param>
        objectId = Jx.isNonEmptyString(objectId) ? objectId : this.objectId;
        Mail.writeProfilerMark("Mail.ConversationSelection." + evt + " - " + objectId, Mail.LogEvent.start);
    };

    proto._markStop = function (evt) {
        Mail.writeProfilerMark("Mail.ConversationSelection." + evt + " - " + this.objectId, Mail.LogEvent.stop);
    };
});
