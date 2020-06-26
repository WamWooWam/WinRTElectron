//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Listbox = WinJS.Class.define(function Listbox_ctor(){}, {
            initControlContext: function(controlContext) {
                var defaultValue = controlContext.modelProperties.Default.getValue();
                this._setSelectedByValues(controlContext, [defaultValue])
            }, initView: function(container, controlContext) {
                    var listboxViewModel = new AppMagic.Controls.ListboxViewModel(controlContext);
                    util.createOrSetPrivate(controlContext, "_listboxViewModel", listboxViewModel);
                    listboxViewModel._onChangeSelectedItems(controlContext);
                    var listbox = container.children[0];
                    listbox.id = listboxViewModel.id;
                    ko.applyBindings(listboxViewModel, container)
                }, onChangeItems: function(evt, controlContext) {
                    this._restorePreviouslySelectedValues(controlContext, evt.oldValue, evt.newValue) || this._selectDefaultValues(controlContext)
                }, _restorePreviouslySelectedValues: function(controlContext, oldValues, newValues) {
                    var items = controlContext.modelProperties.Items.getValue(),
                        selecteditems = controlContext.modelProperties.SelectedItems.getValue();
                    if (items && selecteditems && oldValues && newValues) {
                        var srcToSelect = [];
                        if (selecteditems.forEach(function(selected) {
                            var oldSelection = this._searchBySrc(oldValues, selected._src);
                            if (oldSelection) {
                                var newSelection = this._searchById(newValues, oldSelection[AppMagic.Constants.Runtime.idProperty]);
                                newSelection && srcToSelect.push(newSelection._src)
                            }
                            else
                                srcToSelect.push(selected._src)
                        }.bind(this)), srcToSelect.length > 0)
                            return this._setSelectedBySrc(controlContext, srcToSelect)
                    }
                    return !1
                }, _searchBySrc: function(values, src) {
                    return values.filter(function(element) {
                            return element && element._src === src
                        })[0]
                }, _searchById: function(values, oldId) {
                    return values.filter(function(element) {
                            return element && (element[AppMagic.Constants.Runtime.oldIdProperty] === oldId || element[AppMagic.Constants.Runtime.idProperty] === oldId)
                        })[0]
                }, _selectDefaultValues: function(controlContext) {
                    var defaultItem = controlContext.modelProperties.Default.getValue();
                    this._setSelectedByValues(controlContext, [defaultItem])
                }, onChangeDefault: function(evt, controlContext) {
                    var defaultItem = null;
                    evt.newValue ? defaultItem = evt.newValue : typeof controlContext.properties.Default == "function" && (defaultItem = controlContext.properties.Default());
                    this._setSelectedByValues(controlContext, [defaultItem])
                }, onChangeSelectedItems: function(evt, controlContext) {
                    controlContext.realized && controlContext._listboxViewModel._onChangeSelectedItems(controlContext)
                }, _selectByPredicate: function(controlContext, predicate) {
                    var items = controlContext.modelProperties.Items.getValue();
                    if (items === null || predicate === null)
                        return controlContext.modelProperties.Selected.setValue(null), !1;
                    for (var selectedItems = [], i = 0; i < items.length; i++)
                        predicate(items[i]) && (items[i]._id = i + 1, selectedItems.push(this._cloneItem(items[i])));
                    if (selectedItems.length > 0)
                        controlContext.modelProperties.Selected.setValue(selectedItems[0]);
                    else if (items.length > 0) {
                        var item = items[0] || {};
                        item._id = 1;
                        selectedItems.push(this._cloneItem(item));
                        controlContext.modelProperties.Selected.setValue(selectedItems[selectedItems.length - 1])
                    }
                    return controlContext.modelProperties.SelectedItems.setValue(selectedItems), !0
                }, _setSelectedByValues: function(controlContext, values) {
                    return this._selectByPredicate(controlContext, function(item) {
                            for (var i = 0; i < values.length; i++)
                                if (item && values[i] === item.Value)
                                    return !0;
                            return !1
                        })
                }, _setSelectedBySrc: function(controlContext, srcArray) {
                    return this._selectByPredicate(controlContext, function(item) {
                            for (var i = 0; i < srcArray.length; i++)
                                if (item && srcArray[i] === item._src)
                                    return !0;
                            return !1
                        })
                }, _cloneItem: function(item) {
                    return {
                            Value: item.Value, _id: item._id, id: item._id, _src: item._src
                        }
                }, disposeView: function(container, controlContext) {
                    controlContext._listboxViewModel.dispose()
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {Listbox: Listbox})
})();