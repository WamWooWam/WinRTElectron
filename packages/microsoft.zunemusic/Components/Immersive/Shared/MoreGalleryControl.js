/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {DynamicMoreGalleryControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Shared/MoreGalleryControl.html#dynamicMoreGalleryControlTemplate", function moreGalleryControlBase(element, options) {
            this.dataContext = MS.Entertainment.UI.Controls.DynamicMoreGalleryControl.emptyDataContext
        }, {
            initialize: function initialize() {
                if (this.dataContext && this.dataContext.begin)
                    this.dataContext.begin();
                this._initializeSelectionHandlers()
            }, _initializeSelectionHandlers: function _initializeSelectionHandlers() {
                    if (this._gallery.selectionMode !== MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none) {
                        var defaultSelectionHandlers = MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(this._clearSelection.bind(this));
                        this._gallery.addSelectionHandlers(defaultSelectionHandlers);
                        this._gallery.addSelectionHandlers({deleteMedia: this._handleItemDeleted.bind(this)})
                    }
                }, _handleItemDeleted: function _handleItemDeleted(deleted) {
                    if (deleted)
                        this._clearSelection()
                }, _clearSelection: function _clearSelection() {
                    this._gallery.clearSelection()
                }
        }, {dataContext: null}, {emptyDataContext: {
                view: null, items: null, selectedTemplate: null, modifierSelectionManager: null
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MoreGalleryControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Shared/MoreGalleryControl.html#MoreGalleryControl", function moreGalleryControlConstructor(element, options)
        {
            this.modifierSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(null, 0)
        }, {
            _bindings: null, _skipReloadOnBind: false, initialize: function initialize() {
                    if (this.dataContext.getModifierDataSource)
                        this.dataContext.getModifierDataSource().then(function getModifierFromDataContext(modifierItems) {
                            this.modifierSelectionManager.dataSource = new MS.Entertainment.ObservableArray(modifierItems)
                        }.bind(this));
                    else
                        this.reload();
                    if (this.dataContext.defaultSelectionIndex)
                        this.modifierSelectionManager.selectedIndex = this.dataContext.defaultSelectionIndex;
                    this._skipReloadOnBind = true;
                    this._bindings = WinJS.Binding.bind(this, {modifierSelectionManager: {selectedIndex: this.reload.bind(this)}});
                    this._skipReloadOnBind = false
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this.dataContext && this.dataContext.defaultSelectionIndex)
                        this.dataContext.defaultSelectionIndex = 0;
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, reload: function reload(newIndex, oldIndex) {
                    if (!this._skipReloadOnBind)
                        this.dataContext.getItems(this.modifierSelectionManager.selectedItem).then(function getItemsFromDataContext(items) {
                            this.galleryItems = items
                        }.bind(this)).then(function _setFocus() {
                            this._gallery.focusFirstItemOnPageLoad = true
                        }.bind(this))
                }
        }, {
            dataContext: null, galleryItems: null, modifierSelectionManager: null, itemTemplate: String.empty, panelTemplate: String.empty, inlineExtraData: null
        })})
})()
