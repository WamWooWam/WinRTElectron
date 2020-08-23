/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ToggleModifier: MS.Entertainment.UI.Framework.defineUserControl("/Controls/ToggleModifier.html#toggleModifierTemplate", function modifierConstructor() {
            this._observableArrayChanged = this._observableArrayChanged.bind(this);
            this.selectionManager = new MS.Entertainment.UI.Framework.SelectionManager
        }, {
            _selectionManagerBindings: null, openPopup: null, minItems: 0, identifier: "", initialize: function initialize() {
                    this.bind("items", this._itemsChanged.bind(this));
                    this.bind("selectedItem", this._selectedItemChanged.bind(this));
                    this._selectionManagerBindings = WinJS.Binding.bind(this, {selectionManager: {selectedIndex: this._selectionManagerSelectionChanged.bind(this)}})
                }, unload: function unload() {
                    if (this._selectionManagerBindings) {
                        this._selectionManagerBindings.cancel();
                        this._selectionManagerBindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, setTabPanel: function setTabPanel(tabPanel) {
                    MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this.domElement, tabPanel, "aria-controls")
                }, _itemsChanged: function _itemsChanged(newValue, oldValue) {
                    if (oldValue && oldValue instanceof MS.Entertainment.ObservableArray)
                        oldValue.removeChangeListener(this._observableArrayChanged);
                    if (newValue && newValue instanceof MS.Entertainment.ObservableArray)
                        newValue.addChangeListener(this._observableArrayChanged);
                    if (this.selectionManager)
                        this.selectionManager.dataSource = this.items;
                    this._constrainSelectedItem();
                    if (!isNaN(this.tabIndex))
                        if (this.items && this.items.length > 1)
                            this._modifierContainer.setAttribute("tabindex", this.tabIndex);
                        else
                            this._modifierContainer.setAttribute("tabIndex", -1)
                }, _observableArrayChanged: function _observableArrayChanged() {
                    this._constrainSelectedItem()
                }, _selectedItemChanged: function _selectedItemChanged() {
                    var label;
                    var labelType;
                    this._constrainSelectedItem();
                    if (this.selectionManager)
                        this.selectionManager.selectedItem = this.selectedItem;
                    label = this.selectedItem ? this.selectedItem.label : "";
                    labelType = typeof label;
                    switch (labelType) {
                        case"string":
                            this.labelControl.stringId = null;
                            this.labelControl.text = label;
                            break;
                        case"number":
                            this.labelControl.text = null;
                            this.labelControl.stringId = label;
                            label = String.load(label);
                            break;
                        default:
                            MS.Entertainment.UI.Controls.assert(false, "Unrecognized label type in modifier control.");
                            break
                    }
                    (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceModifierControl_SelectionChanged(label, this.identifier)
                }, _selectionManagerSelectionChanged: function _selectionManagerSelectionChanged(newValue, oldValue) {
                    if (oldValue !== undefined)
                        this.selectedItem = this.selectionManager.selectedItem
                }, _constrainSelectedItem: function _constrainSelectedItem() {
                    if (!this.items)
                        this.selectedItem = null;
                    else if (this.items.length <= this.minItems)
                        this.selectedItem = null;
                    else if (this.items.indexOf(WinJS.Binding.unwrap(this.selectedItem)) < 0)
                        this.selectedItem = this.selectionManager.selectedItem
                }, onKeyDown: function onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                        this.onClicked()
                }, onClicked: function onClicked() {
                    if (!this.items || this.items.length <= 1)
                        return;
                    var index = this.items.indexOf(WinJS.Binding.unwrap(this.selectedItem));
                    index = (index + 1) % this.items.length;
                    var oldSelectedItem = this.selectedItem;
                    this.selectedItem = this.getItem(index);
                    this._selectedItemChanged(this.selectedItem, oldSelectedItem)
                }, getItem: function getItem(index) {
                    var items = WinJS.Binding.unwrap(this.items);
                    if (items instanceof MS.Entertainment.ObservableArray)
                        return items.item(index);
                    else if (Array.isArray(items))
                        return items[index];
                    else
                        MS.Entertainment.UI.Controls.assert(false, "Unrecognized items list type in modifier control.")
                }
        }, {
            tabIndex: 0, items: null, selectedItem: null, selectionManager: null, descriptionLabel: null, descriptionLabelText: null
        }, null)})
})()
