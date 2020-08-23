/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FlipView: MS.Entertainment.UI.Framework.defineUserControl("/Controls/FlipView.html#flipViewTemplate", function flipViewConstructor(element, options){}, {
            horizontal: false, itemClicked: null, mediaType: "video", _pendingSelectIndex: -1, _itemTemplateProvider: null, _itemTemplate: null, itemTemplate: {
                    get: function() {
                        return this._itemTemplate
                    }, set: function(value) {
                            if (value !== this._itemTemplate) {
                                this._itemTemplateProvider = null;
                                this._itemTemplate = value;
                                if (this._itemTemplate)
                                    this._loadTemplate(this._itemTemplate, this, "_itemTemplateProvider")
                            }
                        }
                }, selectIndex: function selectIndex(index) {
                    this._pendingSelectIndex = (index !== undefined) ? index : this._pendingSelectIndex;
                    if (this._pendingSelectIndex >= 0 && this.flipViewContainer.winControl)
                        if (this._pendingSelectIndex !== this.flipViewContainer.winControl.currentPage) {
                            if (this._pendingSelectIndex === this.flipViewContainer.winControl.currentPage - 1)
                                this.flipViewContainer.winControl.previous();
                            else
                                this.flipViewContainer.winControl.currentPage = this._pendingSelectIndex;
                            this._pendingSelectIndex = -1
                        }
                }, initialize: function initialize() {
                    var that = this;
                    this.bind("dataSource", this._beginUpdateLayout.bind(this));
                    this.bind("selectedIndex", this._selectedIndexChanged.bind(this))
                }, ensureVisible: function ensureVisible(index) {
                    this.selectIndex(index)
                }, _loadTemplate: function flipViewLoadTemplate(fragment, element, name, finish) {
                    MS.Entertainment.UI.Framework.loadTemplate(fragment).then(function(frag) {
                        element[name] = frag;
                        if (!finish && typeof finish === "function")
                            finish()
                    })
                }, _beginUpdateLayout: function flipViewBeginUpdateLayout() {
                    var that = this;
                    if (!this.dataSource || (that.dataSource.items !== null && that.dataSource.items !== undefined && this.dataSource.items.count === undefined)) {
                        MS.Entertainment.Utilities.empty(that.flipViewContainer);
                        return
                    }
                    if (this.itemTemplate === null)
                        throw new Error("No item rendering template specified.");
                    if (this.grouped && !this.groupTemplate)
                        throw new Error("No group header template specified for grouped list.");
                    if (this._itemTemplate && !this._itemTemplateProvider) {
                        MS.Entertainment.UI.Framework.loadTemplate(this._itemTemplate).then(function(frag) {
                            that._itemTemplateProvider = frag;
                            that._beginUpdateLayout()
                        });
                        return
                    }
                    this._updateLayout()
                }, _selectedIndexChanged: function _selectedIndexChanged() {
                    this.selectIndex(this.selectedIndex)
                }, _updateLayout: function flipViewUpdateLayout() {
                    var that = this;
                    if (this.dataSource === null || this.dataSource.length === 0) {
                        MS.Entertainment.Utilities.empty(that.flipViewContainer);
                        return
                    }
                    if (this._itemTemplateProvider === null)
                        throw new Error("No item rendering template loaded.");
                    var flipView = new WinJS.UI.FlipView(this.flipViewContainer, {
                            horizontal: this.horizontal, itemDataSource: this.dataSource, itemTemplate: WinJS.UI.simpleItemRenderer(function flipViewItemRenderer(item) {
                                    var dataObject = item.data;
                                    var tagName = that._itemTemplateProvider.element.tagName;
                                    if (tagName === null || tagName === undefined)
                                        tagName = "DIV";
                                    var container = document.createElement(tagName);
                                    var requestedImage;
                                    if (that.mediaType === "track")
                                        requestedImage = MS.Entertainment.ImageRequested.albumImage;
                                    else
                                        requestedImage = MS.Entertainment.ImageRequested.primaryImage;
                                    MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(dataObject, 300, 300, requestedImage).then(function imageUriAvailable(uri) {
                                        dataObject.imageUri = uri;
                                        that._itemTemplateProvider.render(dataObject, container);
                                        container.serviceId = dataObject.serviceId
                                    }.bind(this));
                                    return container
                                })
                        });
                    if (this._pendingSelectIndex >= 0)
                        this.selectIndex();
                    flipView.addEventListener("pageselected", function(event) {
                        if (that.selectedIndex !== flipView.currentPage) {
                            this.selectedIndex = flipView.currentPage;
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("iteminvoked", true, true);
                            domEvent.detail = {
                                itemPromise: this.dataSource.itemFromIndex(flipView.currentPage), itemIndex: flipView.currentPage
                            };
                            this.domElement.dispatchEvent(domEvent)
                        }
                    }.bind(this), false)
                }
        }, {
            dataSource: null, selectedIndex: 0
        })})
})()
