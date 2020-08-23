/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FailedPanel: MS.Entertainment.UI.Framework.defineUserControl("/Controls/FailedPanel.html#failedPanelTemplate", function failedPanelConstructor(){}, {
            defaultPrimaryStringId: String.id.IDS_FAILED_PANEL_HEADER, defaultSecondaryStringId: String.id.IDS_FAILED_PANEL_LABEL, _modelBinding: null, initialize: function initialize() {
                    if (!this.model) {
                        this.model = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                        this.model.primaryStringId = this.defaultPrimaryStringId;
                        this.model.secondaryStringId = this.defaultSecondaryStringId
                    }
                    this._updateFromModelProperties = this._updateFromModelProperties.bind(this);
                    this._modelBinding = WinJS.Binding.bind(this, {model: {
                            primaryText: this._updateFromModelProperties, primaryStringId: this._updateFromModelProperties, secondaryText: this._updateFromModelProperties, secondaryStringId: this._updateFromModelProperties, details: this._updateFromModelProperties, isVisible: this._updateFromModelProperties, className: this._updateFromModelProperties, showLoadingRing: this._updateFromModelProperties
                        }})
                }, unload: function unload() {
                    if (this._modelBinding) {
                        this._modelBinding.cancel();
                        this._modelBinding = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, onPanelClicked: function onPanelClicked() {
                    if (this.model && this.model.action && this.model.action.canExecute)
                        this.model.action.execute()
                }, _updateFromModelProperties: function _updateFromModelProperties() {
                    if (this.model) {
                        this.primaryStringId = null;
                        this.primaryText = this.model.primaryText;
                        this.primaryStringId = this.model.primaryStringId;
                        this.secondaryStringId = null;
                        this.secondaryText = this.model.secondaryText;
                        this.secondaryStringId = this.model.secondaryStringId;
                        this.details = this.model.details;
                        this.isVisible = this.model.isVisible !== undefined ? this.model.isVisible : true;
                        this.className = this.model.className;
                        this.showLoadingRing = this.model.showLoadingRing
                    }
                    else {
                        this.primaryText = null;
                        this.primaryStringId = this.defaultPrimaryStringId;
                        this.secondaryText = null;
                        this.secondaryStringId = this.defaultSecondaryStringId;
                        this.details = null;
                        this.isVisible = true;
                        this.className = null;
                        this.showLoadingRing = false
                    }
                    if (this.isVisible)
                        WinJS.Utilities.removeClass(this.failedPanelContainer, "removeFromDisplay");
                    else
                        WinJS.Utilities.addClass(this.failedPanelContainer, "removeFromDisplay")
                }
        }, {
            model: null, primaryText: null, primaryStringId: null, secondaryText: null, secondaryStringId: null, details: null, isVisible: true, showLoadingRing: false, className: null
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        FailedPanelWithNotifications: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.FailedPanel", "/Controls/FailedPanel.html#failedPanelWithNotificationsTemplate", function failedPanelWithNotificationsConstructor(){}, {
            _modelNotificationsBinding: null, initialize: function initialize() {
                    if (!this.model) {
                        this.model = new MS.Entertainment.UI.Controls.FailedPanelWithNotificationsModel;
                        this.model.primaryStringId = this.defaultPrimaryStringId;
                        this.model.secondaryStringId = this.defaultSecondaryStringId
                    }
                    this._modelNotificationsBinding = WinJS.Binding.bind(this, {model: {notifications: this._updateFromModelProperties.bind(this)}});
                    MS.Entertainment.UI.Controls.FailedPanel.prototype.initialize.call(this)
                }, unload: function unload() {
                    if (this._modelNotificationsBinding) {
                        this._modelNotificationsBinding.cancel();
                        this._modelNotificationsBinding = null
                    }
                    MS.Entertainment.UI.Controls.FailedPanel.prototype.unload.call(this)
                }, _updateFromModelProperties: function _updateFromModelProperties() {
                    if (this.model)
                        this.notifications = this.model.notifications;
                    else
                        this.notifications = null;
                    MS.Entertainment.UI.Controls.FailedPanel.prototype._updateFromModelProperties.call(this)
                }
        }, {notifications: null}), FailedPanelWithLink: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.FailedPanel", "/Controls/FailedPanel.html#failedPanelWithLinkTemplate", function failedPanelWithLinkConstructor(){}, {
                _iconBinding: null, initialize: function initialize() {
                        MS.Entertainment.UI.Controls.FailedPanel.prototype.initialize.call(this);
                        this._iconBinding = WinJS.Binding.bind(this.model, {linkIcon: this._updateIconFromModel.bind(this)})
                    }, unload: function unload() {
                        if (this._iconBinding) {
                            this._iconBinding.cancel();
                            this._iconBinding = null
                        }
                        MS.Entertainment.UI.Controls.FailedPanel.prototype.unload.call(this)
                    }, _updateIconFromModel: function _updateIconFromModel() {
                        if (this.model)
                            this.linkIcon = this.model.linkIcon;
                        else
                            this.linkIcon = null
                    }
            }, {linkIcon: null}), FailedPanelWithQuery: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.FailedPanel", "/Controls/FailedPanel.html#failedPanelWithQueryTemplate", function failedPanelWithNotificationsConstructor(){}, {
                _templateBinding: null, initialize: function initialize() {
                        MS.Entertainment.UI.Controls.FailedPanel.prototype.initialize.call(this);
                        this._templateBinding = WinJS.Binding.bind(this.model, {itemTemplate: this._updateTemplateFromModel.bind(this)});
                        if (!this.model) {
                            this.model = new MS.Entertainment.UI.Controls.FailedPanelWithQueryModel;
                            this.model.primaryStringId = this.defaultPrimaryStringId;
                            this.model.secondaryStringId = this.defaultSecondaryStringId
                        }
                        if (this.model.query)
                            this.model.query.getItems().done(function populateAlbums(items) {
                                this.queryResults = items
                            }.bind(this), function onError(error) {
                                MS.Entertainment.Music.fail("Failed panel query failed: " + error && error.message)
                            })
                    }, applyAlbumGalleryItemTemplate: function applyAlbumGalleryItemTemplate(container, item, index) {
                        var element = container.querySelector(".imageHolder");
                        if (element !== null)
                            element.style.animationDelay = (index * 50) + "ms"
                    }, unload: function unload() {
                        if (this._templateBinding) {
                            this._templateBinding.cancel();
                            this._templateBinding = null
                        }
                        MS.Entertainment.UI.Controls.FailedPanel.prototype.unload.call(this)
                    }, _updateTemplateFromModel: function _updateTemplateFromModel() {
                        if (this.model)
                            this.itemTemplate = this.model.itemTemplate;
                        else
                            this.itemTemplate = null
                    }
            }, {
                queryResults: null, itemTemplate: null
            })
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        DefaultFailedPanelModel: MS.Entertainment.defineObservable(function defaultFailedPanelModel() {
            this.instance = this
        }, {
            showLoadingRing: false, primaryText: null, primaryStringId: null, secondaryText: null, secondaryStringId: null, details: null, action: null, instance: null, className: null
        }), FailedPanelWithNotificationsModel: MS.Entertainment.defineObservable(function failedPanelWithNotificationsModel() {
                this.instance = this
            }, {
                primaryText: null, primaryStringId: null, secondaryText: null, secondaryStringId: null, details: null, notifications: null, action: null, instance: null, className: null
            }), FailedPanelWithQueryModel: MS.Entertainment.defineObservable(function FailedPanelWithQueryModel() {
                this.instance = this
            }, {
                primaryText: null, primaryStringId: null, secondaryText: null, secondaryStringId: null, details: null, action: null, instance: null, itemTemplate: null, className: null, showLoadingRing: false
            }), MarketplaceEmptyPanelModel: MS.Entertainment.defineObservable(function marketplaceEmptyPanelModel() {
                this.instance = this
            }, {
                primaryStringId: String.id.IDS_MUSIC2_MARKETPLACE_MUSIC_GALLERY_EMPTY_DESC, secondaryStringId: null, details: null
            }), SearchCollectionEmptyPanelModel: MS.Entertainment.defineObservable(function searchCollectionEmptyPanelModel() {
                this.instance = this
            }, {
                primaryStringId: String.id.IDS_MUSIC_SEARCH_MY_EMPTY_TITLE, secondaryStringId: null, details: null, isVisible: false
            }), Music2SearchCollectionEmptyPanelModel: MS.Entertainment.defineObservable(function searchCollectionEmptyPanelModel() {
                this.instance = this
            }, {
                primaryStringId: String.id.IDS_MUSIC2_SEARCH_COLLECTION_EMPTY_TITLE, secondaryStringId: String.id.IDS_MUSIC2_SEARCH_COLLECTION_EMPTY_DESC, details: null, isVisible: false
            }), SearchAllEmptyPanelModel: MS.Entertainment.defineObservable(function searchAllEmptyPanelModel() {
                this.instance = this
            }, {
                primaryStringId: String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_TITLE, secondaryStringId: String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_DESC, details: null, isVisible: false
            }), Music2SearchAllEmptyPanelModel: MS.Entertainment.defineObservable(function music2SearchAllEmptyPanelModel() {
                this.instance = this
            }, {
                primaryStringId: String.id.IDS_MUSIC2_SEARCH_ALL_EMPTY_TITLE, secondaryStringId: String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_DESC, details: null, isVisible: false
            })
    })
})()
