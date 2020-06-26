//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        MAX_ITEMS = 500,
        ListboxViewModel = WinJS.Class.define(function ListboxViewModel_ctor(controlContext) {
            this._controlContext = controlContext;
            this._properties = controlContext.properties;
            this._modelProperties = controlContext.modelProperties;
            this._behaviors = controlContext.behaviors;
            this._defaultChanged = !0;
            this._id = util.generateRandomId("listbox");
            this._previousItemsArray = null;
            this._currentItemsArray = ko.computed(this._computeItemsArray.bind(this, controlContext))
        }, {
            _currentItemsArray: null, _controlContext: null, _properties: null, _behaviors: null, _id: null, _defaultChanged: null, modelProperties: {get: function() {
                        return this._modelProperties
                    }}, controlContext: {get: function() {
                        return this._controlContext
                    }}, properties: {get: function() {
                        return this._properties
                    }}, behaviors: {get: function() {
                        return this._behaviors
                    }}, id: {get: function() {
                        return this._id
                    }}, defaultChanged: {get: function() {
                        return this._defaultChanged
                    }}, currentItemsArray: {get: function() {
                        return this._currentItemsArray
                    }}, onClickParent: function(listboxViewModel) {
                    listboxViewModel.controlContext.viewState.disabled() || listboxViewModel.behaviors.OnSelect()
                }, onClickItem: function(listboxItemViewModel, keyEvent) {
                    var parentViewModel = listboxItemViewModel.parentViewModel;
                    parentViewModel.controlContext.viewState.disabled() || (parentViewModel.properties.SelectMultiple() ? keyEvent.shiftKey ? parentViewModel._setSelectedItemsWithShift(listboxItemViewModel, parentViewModel) : parentViewModel._setSelectedItemsWithoutShift(listboxItemViewModel, parentViewModel) : parentViewModel._setSelectedItemsSingle(listboxItemViewModel, parentViewModel), parentViewModel._setSelectedItem(parentViewModel))
                }, onKeyDown: function(listboxViewModel, keyEvent) {
                    var itemsLength = listboxViewModel.currentItemsArray().length,
                        lastSelectedItem = listboxViewModel.properties.Selected(),
                        listOffsetHeight = document.getElementById(listboxViewModel.id).offsetHeight,
                        listItemOffsetHeight = document.getElementById(listboxViewModel.id).firstElementChild.firstElementChild.offsetHeight,
                        skipCount = listOffsetHeight / listItemOffsetHeight - 1;
                    if (lastSelectedItem)
                        switch (keyEvent.key) {
                            case AppMagic.Constants.Keys.down:
                                lastSelectedItem.id < itemsLength && listboxViewModel._updateSelectionsOnKeydown(listboxViewModel, lastSelectedItem.id);
                                break;
                            case AppMagic.Constants.Keys.up:
                                lastSelectedItem.id > 1 && listboxViewModel._updateSelectionsOnKeydown(listboxViewModel, lastSelectedItem.id - 2);
                                break;
                            case AppMagic.Constants.Keys.pageDown:
                                lastSelectedItem.id + skipCount - 1 < itemsLength ? listboxViewModel._updateSelectionsOnKeydown(listboxViewModel, lastSelectedItem.id + skipCount - 1) : listboxViewModel._updateSelectionsOnKeydown(listboxViewModel, itemsLength - 1);
                                break;
                            case AppMagic.Constants.Keys.pageUp:
                                lastSelectedItem.id - skipCount - 1 > 0 ? listboxViewModel._updateSelectionsOnKeydown(listboxViewModel, lastSelectedItem.id - skipCount - 1) : listboxViewModel._updateSelectionsOnKeydown(listboxViewModel, 0);
                                break;
                            default:
                                break
                        }
                }, _onChangeSelectedItems: function(controlContext) {
                    for (var items = this.currentItemsArray(), selectedItems = controlContext.properties.SelectedItems(), k = 0; k < items.length; k++)
                        items[k].selected(!1);
                    if (selectedItems)
                        for (var i = 0; i < selectedItems.length; i++)
                            for (var j = 0; j < items.length; j++) {
                                var selectedItem = selectedItems[i],
                                    item = items[j];
                                item.id === selectedItem.id && item.selected(!0)
                            }
                }, _computeItemsArray: function(controlContext) {
                    if (this._currentItemsArray)
                        for (var j = 0; j < this._currentItemsArray().length; j++)
                            this._currentItemsArray()[j].dispose();
                    var defaultItemsArray = controlContext.properties.Items(),
                        itemsArray = [];
                    if (!defaultItemsArray)
                        return itemsArray;
                    for (var i = 0; i < defaultItemsArray.length; i++) {
                        var item = defaultItemsArray[i] || {};
                        if (AppMagic.Utility.createOrSetPrivate(item, "_id", i + 1), item.Value || (item.Value = null), item._id > MAX_ITEMS) {
                            item.Value = AppMagic.Strings.ControlMaxItemLimitReached;
                            var maxItemClone = new AppMagic.Controls.ListboxItemViewModel(item, this, !1, controlContext);
                            itemsArray.push(maxItemClone);
                            break
                        }
                        var newItem = new AppMagic.Controls.ListboxItemViewModel(item, this, !1, controlContext);
                        itemsArray.push(newItem)
                    }
                    return itemsArray
                }, _setSelectedItem: function(parentViewModel) {
                    var currentlySelectedItems = parentViewModel.properties.SelectedItems();
                    if (currentlySelectedItems) {
                        if (currentlySelectedItems.length > 0) {
                            var lastElement = currentlySelectedItems[currentlySelectedItems.length - 1],
                                clonedItem = parentViewModel._cloneItem(lastElement);
                            parentViewModel.properties.Selected(clonedItem)
                        }
                        else
                            parentViewModel.properties.Selected(null);
                        parentViewModel.behaviors.OnChange()
                    }
                }, _updateSelectionsOnKeydown: function(listboxViewModel, offset) {
                    offset = Math.floor(offset);
                    var itemToSelect = listboxViewModel.currentItemsArray()[offset],
                        clonedItems = listboxViewModel._cloneItem(itemToSelect);
                    listboxViewModel.currentItemsArray().forEach(function(entry) {
                        entry.hasFocus(!1)
                    });
                    itemToSelect.hasFocus(!0);
                    listboxViewModel.properties.Selected(clonedItems);
                    listboxViewModel.properties.SelectedItems([clonedItems]);
                    listboxViewModel.behaviors.OnChange()
                }, _setSelectedItemsWithShift: function(listboxItemViewModel, parentViewModel) {
                    for (var newSelectedItems = [], newSelectedItem, newItem, currentlySelectedItem = parentViewModel.properties.Selected(), end = listboxItemViewModel.id, start = currentlySelectedItem !== null ? currentlySelectedItem.id : end, currentlySelectedItems = parentViewModel.properties.SelectedItems(), k = 0; k < currentlySelectedItems.length; k++)
                        newSelectedItems.push(currentlySelectedItems[k]);
                    var addItem = function(copyIndex) {
                            newItem = parentViewModel.currentItemsArray()[copyIndex - 1];
                            for (var j = 0; j < newSelectedItems.length; j++)
                                if (newSelectedItems[j].id === newItem.id)
                                    return;
                            newSelectedItem = parentViewModel._cloneItem(newItem);
                            newSelectedItems.push(newSelectedItem)
                        },
                        i;
                    if (start <= end)
                        for (i = start; i <= end; i++)
                            addItem(i);
                    else
                        for (i = start; i >= end; i--)
                            addItem(i);
                    parentViewModel.properties.SelectedItems(newSelectedItems)
                }, _setSelectedItemsWithoutShift: function(listboxItemViewModel, parentViewModel) {
                    var newSelectedItems = [],
                        currentlySelectedItems = parentViewModel.properties.SelectedItems(),
                        newSelectedItem,
                        itemAlredySelected = !1;
                    if (currentlySelectedItems)
                        for (var i = 0; i < currentlySelectedItems.length; i++)
                            currentlySelectedItems[i].id !== listboxItemViewModel.id ? (newSelectedItem = this._cloneItem(currentlySelectedItems[i]), newSelectedItems.push(newSelectedItem)) : itemAlredySelected = !0;
                    itemAlredySelected || (newSelectedItem = this._cloneItem(listboxItemViewModel), newSelectedItems.push(newSelectedItem));
                    parentViewModel.properties.SelectedItems(newSelectedItems)
                }, _setSelectedItemsSingle: function(listboxItemViewModel, parentViewModel) {
                    var newSelectedItem = parentViewModel._cloneItem(listboxItemViewModel);
                    parentViewModel.properties.SelectedItems([newSelectedItem])
                }, _cloneItem: function(item) {
                    if (item === null || typeof item != "object")
                        return item;
                    var copy = {
                            Value: item.Value, _id: item._id
                        };
                    return item.hasOwnProperty("id") && !copy.hasOwnProperty("id") && (copy.id = item.id), item.hasOwnProperty("_src") && (copy._src = item._src), item.hasOwnProperty("_id") && !copy.hasOwnProperty("id") && (copy.id = item._id), typeof item.value == "function" && (copy.Value = item.value()), copy
                }, dispose: function() {
                    this._currentItemsArray().forEach(function(item) {
                        item.dispose()
                    });
                    this._currentItemsArray.dispose()
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {ListboxViewModel: ListboxViewModel})
})();