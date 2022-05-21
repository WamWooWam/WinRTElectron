
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "SelectionHelper", function () {
    "use strict";

    Mail.SelectionHelper = {};

    Mail.SelectionHelper.EventTypes = {
        itemAdded: "itemAdded",
        itemRemoved: "itemRemoved",
        itemMoved: "itemMoved"
    };

    Mail.SelectionHelper.filterUnselectableItems = function (collection, selection) {
        /// <param name="collection" type="Mail.MessageListCollection"></param>
        /// <param name="selection" type="WinJS.UI._Selection"></param>
        selection.getIndices().forEach(function (index) {
            var item = /*@static_cast(Mail.ListViewItem)*/collection.item(index);
            if (!item.selectable) {
                selection.remove(index);
            }
        });
        return selection;
    };


    Mail.SelectionHelper.hasSelectableItems = function (collection) {
        /// <summary>
        /// Not all items in the collection is selectable (i.e. End Of List Items)
        /// </summary>
        /// <param name="collection" type="Mail.TrailingItemCollection"></param>
        Mail.writeProfilerMark("Mail.SelectionHelper.hasSelectableItems", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(collection));
        var result = false;

        // Walk the collection to find the first selectable item.  Since selectable items are generally added from
        // the top, this loop should terminate quite fast.
        for (var i = 0, iMax = collection.count; i < iMax; i++) {
            var item = /*@static_cast(Mail.ListViewItem)*/ collection.item(i);
            if (item.selectable && !item.pendingRemoval) {
                result = true;
                break;
            }
        }
        Mail.writeProfilerMark("Mail.SelectionHelper.hasSelectableItems", Mail.LogEvent.stop);
        return result;
    };

    Mail.SelectionHelper.preventEmptySelectionChanging = function (/*@dynamic*/collection, selectionEvent) {
        /// <summary>Prevents the changing event from selecting nothing if the collection is not empty. Returns true if the selection was prevented.</summary>
        /// <param name="selectionEvent" type="Event"/>
        Debug.assert(Jx.isObject(selectionEvent.detail), "selectionEvent.detail is undefined");
        Debug.assert(Jx.isObject(selectionEvent.detail.newSelection), "selectionEvent.detail.newSelection is undefined");
        Debug.assert(Jx.isObject(collection), "collection is null");

        // If the new selection tries to select the item at the "totalCount" index, then they've
        // tried to select the hint item.  This items says something like "To get messages older
        // than one week, go to Settings".  We don't want to allow the user to select this item,
        // so we'll take it out of the selection.
        // (Note: the later check for no selection must run after this.)
        var newSelection = /*@static_cast(WinJS.UI._Selection)*/selectionEvent.detail.newSelection;
        Mail.SelectionHelper.filterUnselectableItems(collection, newSelection);


        if (newSelection.count() === 0 && Mail.SelectionHelper.hasSelectableItems(collection)) {
            // suppress the selection change if the user is deselecting the last selected item
            selectionEvent.preventDefault();
            return true;
        }

        return false;
    };

    var eventMap = {},
        selectionHelperEventTypes = Mail.SelectionHelper.EventTypes,
        changeType = Microsoft.WindowsLive.Platform.CollectionChangeType;

    eventMap[changeType.itemAdded] = selectionHelperEventTypes.itemAdded;
    eventMap[changeType.itemRemoved] = selectionHelperEventTypes.itemRemoved;
    eventMap[changeType.itemChanged] = selectionHelperEventTypes.itemMoved;

    Mail.SelectionHelper.getEventType = function (platformEventType) {
        /// <param name="name" type="Number"></param>
        Debug.assert(Jx.isValidNumber(platformEventType));
        Debug.assert(platformEventType in eventMap, "invalid event type");
        var result = eventMap[platformEventType];

        // Asserting the result is a valid selectionHelperEventType
        Debug.assert(Object.keys(selectionHelperEventTypes).map(function (key) {
            return selectionHelperEventTypes[key];
        }).indexOf(result) !== -1, String(result)  + " is not a valid Mail.SelectionHelper.EventTypes");
        return result;
    };


    Mail.SelectionHelper.getUpdatedIndex = function (eventType, /*@dynamic*/changeEvent, oldIndex) {
        /// <summary>Returns an index adjusted for the given event type</summary>
        /// <param name="eventType" type="String">See Mail.SelectionHelper.EventTypes</param>
        /// <param name="changeEvent" type="Object">Change event object</param>
        /// <param name="oldIndex" type="Number"></param>
        Debug.assert(Jx.isNonEmptyString(eventType));
        Debug.assert(Jx.isObject(changeEvent));
        Debug.assert(Jx.isNumber(oldIndex));

        var eventTypes = Mail.SelectionHelper.EventTypes;
        if (oldIndex !== -1) {
            switch (eventType) {
                case eventTypes.itemAdded:
                    Debug.assert(Jx.isNumber(changeEvent.index));

                    if (oldIndex >= changeEvent.index) {
                        return oldIndex + 1;
                    }
                    break;

                case eventTypes.itemRemoved:
                    Debug.assert(Jx.isNumber(changeEvent.index));

                    if (oldIndex > changeEvent.index) {
                        return oldIndex - 1;
                    }
                    // Note: if the item itself is removed, leave the index as is. We let the caller handle that case.

                    break;

                case eventTypes.itemMoved:

                    Debug.assert(Jx.isNumber(changeEvent.index));
                    Debug.assert(Jx.isNumber(changeEvent.previousIndex));

                    // The selected item has moved, update the displayed index
                    if (oldIndex === changeEvent.previousIndex) {
                        return changeEvent.index;
                    }

                    var toAboveOldIndex = changeEvent.index < oldIndex,
                        fromAboveOldIndex = changeEvent.previousIndex < oldIndex,
                        toBelowOldIndex = changeEvent.index > oldIndex,
                        fromBelowOldIndex = changeEvent.previousIndex > oldIndex,
                        toOldIndex = changeEvent.index === oldIndex;
                    if ((toAboveOldIndex && fromBelowOldIndex) || (fromBelowOldIndex && toOldIndex)) {
                        return oldIndex + 1;
                    } else if ((fromAboveOldIndex && toBelowOldIndex) || (fromAboveOldIndex && toOldIndex)) {
                        return oldIndex - 1;
                    }

                    break;

                default:
                    Debug.assert(false, "Unknown eventType:" + eventType);
                    break;
            }
        }

        return oldIndex;
    };
});

