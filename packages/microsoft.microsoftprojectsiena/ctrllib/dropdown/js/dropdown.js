//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var util = AppMagic.Utility,
        Dropdown = WinJS.Class.define(function Dropdown_ctor(){}, {
            initControlContext: function(controlContext) {
                this._selectDefaultValue(controlContext)
            }, initView: function(container, controlContext) {
                    var dropdownElementChildren = container.children;
                    var dropdownElement = dropdownElementChildren[0],
                        id = util.generateRandomId("dropdown");
                    controlContext.id = id;
                    dropdownElement.id = id;
                    controlContext.openState = AppMagic.Constants.DialogState.closed;
                    var element = this._createFlyoutDivForDropdownList(controlContext, id);
                    element.setAttribute("data-bind", "style: { left: left, top: top, width: width}");
                    var viewmodel = new AppMagic.Controls.DropDownListViewModel(controlContext);
                    controlContext.viewmodel = viewmodel;
                    viewmodel.onChangeSelectedItem(controlContext);
                    controlContext.isParentScreenActive.subscribe(function() {
                        this.OpenAjax.isReplicable || viewmodel.closeFlyout()
                    }, this);
                    ko.applyBindings(viewmodel, container);
                    ko.applyBindings(viewmodel, element);
                    var templateName = "appmagic-dropdownFlyout-template";
                    ko.renderTemplate(templateName, viewmodel, {name: templateName}, element);
                    this._appendDropdownListFlyoutToDom(element, container)
                }, onChangeItems: function(evt, controlContext) {
                    this._restorePreviouslySelectedValue(controlContext, evt.oldValue, evt.newValue) || this._selectDefaultValue(controlContext)
                }, _createFlyoutDivForDropdownList: function(controlContext, id) {
                    var element = document.createElement("div");
                    return WinJS.Utilities.addClass(element, "appmagic-dropdownFlyout"), element.id = "appmagic-dropdownFlyout" + id, util.createOrSetPrivate(controlContext, "element", element), element
                }, _appendDropdownListFlyoutToDom: function(element, container) {
                    for (var referenceNode = container, parentNode = referenceNode; referenceNode !== null && typeof referenceNode == "object" && referenceNode.classList && !referenceNode.classList.contains("canvasContainer") && referenceNode.id !== "publishedCanvas"; )
                        parentNode = referenceNode,
                        referenceNode = referenceNode.parentNode;
                    parentNode.appendChild(element)
                }, _selectByPredicate: function(controlContext, predicate) {
                    for (var i = 0, items = controlContext.modelProperties.Items.getValue(); i < items.length && !predicate(items[i]); )
                        i++;
                    if (items.length > 0) {
                        i = i < items.length ? i : 0;
                        var item = items[i];
                        item === null ? controlContext.modelProperties.Selected.setValue({
                            Value: null, index: i, _src: null
                        }) : controlContext.modelProperties.Selected.setValue({
                            Value: item.Value, index: i, _src: item._src
                        })
                    }
                    else
                        controlContext.modelProperties.Selected.setValue(null);
                    return items.length > 0
                }, _selectBySrc: function(controlContext, src) {
                    return this._selectByPredicate(controlContext, function(item) {
                            return item && item._src === src
                        })
                }, _selectByValue: function(controlContext, value) {
                    return this._selectByPredicate(controlContext, function(item) {
                            return item && item.Value === value
                        })
                }, _restorePreviouslySelectedValue: function(controlContext, oldValues, newValues) {
                    var items = controlContext.modelProperties.Items.getValue(),
                        selected = controlContext.modelProperties.Selected.getValue();
                    if (items && selected && oldValues && newValues) {
                        var oldSelection = this._searchBySrc(oldValues, selected._src),
                            newSelection = oldSelection ? this._searchById(newValues, oldSelection[AppMagic.Constants.Runtime.idProperty]) : this._searchBySrc(newValues, selected._src);
                        if (newSelection)
                            return this._selectBySrc(controlContext, newSelection._src)
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
                }, _selectDefaultValue: function(controlContext) {
                    var items = controlContext.modelProperties.Items.getValue(),
                        defaultValue = controlContext.modelProperties.Default.getValue();
                    if (items === null) {
                        controlContext.modelProperties.Selected.setValue(null);
                        return
                    }
                    this._selectByValue(controlContext, defaultValue)
                }, onChangeSelected: function(evt, controlContext) {
                    if (controlContext.realized)
                        controlContext.viewmodel.onChangeSelectedItem(controlContext)
                }, onChangeDefault: function(evt, controlContext) {
                    evt.newValue && this._selectDefaultValue(controlContext)
                }, disposeView: function(container, controlContext) {
                    var elementId = "appmagic-dropdownFlyout" + controlContext.id,
                        element = document.getElementById(elementId);
                    element && element.parentNode && element.parentNode.removeChild(element);
                    controlContext.viewmodel.dispose()
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {Dropdown: Dropdown})
})();