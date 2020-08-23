/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ImmersiveRelatedGridItems: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Shared/RelatedGridItems.html#ImmersiveRelatedGridItems", function immersiveRelatedGridItems(element, options) {
            this.dataContext = options.dataContext || MS.Entertainment.UI.Controls.ImmersiveRelatedGridItems.emptyDataContext
        }, {
            className: null, fixedColumnCount: null, fixedRowCount: null, rowLayout: false, itemSize: null, itemTemplates: [], propertyName: null, initialize: function initialize() {
                    if (this.dataContext.selectedTemplate) {
                        this.className = this.dataContext.selectedTemplate.className || this.className;
                        this._grid.fixedColumnCount = this.dataContext.selectedTemplate.fixedColumnCount || this.fixedColumnCount;
                        this._grid.fixedRowCount = this.dataContext.selectedTemplate.fixedRowCount || this.fixedRowCount;
                        this._grid.rowLayout = this.dataContext.selectedTemplate.rowLayout || this.rowLayout;
                        this._grid.itemSize = this.dataContext.selectedTemplate.itemSize || this.itemSize;
                        this._grid.itemTemplates = this.dataContext.selectedTemplate.itemTemplates || this.itemTemplates;
                        this._grid.propertyName = this.dataContext.selectedTemplate.propertyName || this.propertyName
                    }
                    this._grid.dataSource = this.dataContext.items;
                    var promise = this.dataContext.previousSignal ? WinJS.Binding.unwrap(this.dataContext.previousSignal).promise : WinJS.Promise.wrap();
                    promise.done(function showFrame() {
                        this.visible = true;
                        if (this.dataContext.visibleSignal)
                            WinJS.Binding.unwrap(this.dataContext.visibleSignal).complete();
                        WinJS.Promise.timeout(1000).done(function() {
                            this.setInitialTabIndex()
                        }.bind(this))
                    }.bind(this))
                }, setInitialTabIndex: function setInitialTabIndex() {
                    var querySelectorString = ".win-focusable";
                    var firstListItem = this.domElement && this.domElement.querySelector(querySelectorString);
                    if (firstListItem)
                        firstListItem.tabIndex = 0;
                    else
                        WinJS.Promise.timeout(1000).then(function() {
                            this.setInitialTabIndex()
                        }.bind(this))
                }
        }, {items: null}, {emptyDataContext: {
                selectedTemplate: {}, items: null
            }})})
})()
