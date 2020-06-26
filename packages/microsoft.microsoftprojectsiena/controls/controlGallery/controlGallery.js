//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var templateStore = Microsoft.AppMagic.Authoring.DocumentFactory.templateStore,
        ControlGalleryView = WinJS.Class.define(function ControlGalleryView_ctor(element) {
            this._controlGroupCrumbs = ko.observableArray();
            this._title = ko.observable(AppMagic.AuthoringStrings.Visuals);
            this._controls = ko.observableArray(this._shellViewModel.getControls(this.title));
            this._findBoxFilterText = ko.observable("");
            this._findBoxEditable = ko.observable(!1);
            ko.applyBindings(this, element);
            this._filterElement = document.getElementById("controlGalleryFilterInput");
            var visible = ko.computed(function() {
                    return this._viewModel.visible
                }, this);
            visible.subscribe(this._handleVisibleChanged.bind(this));
            this._handleVisibleChanged();
            document.addEventListener("click", this._handleDocumentClicked.bind(this), !0);
            this._controlGroupCrumbs.subscribe(function() {
                WinJS.UI.Animation.enterContent(controlGalleryHeader);
                WinJS.UI.Animation.enterContent(controlGalleryList)
            })
        }, {
            _title: null, _controls: null, _controlGroupCrumbs: null, _findBoxFilterText: null, _findBoxEditable: null, _filterElement: null, _handleBackClicked: function() {
                    this._resetFindBox();
                    var title = this._controlGroupCrumbs.pop();
                    this._displayControlGroup(title)
                }, _handleDocumentClicked: function(evt) {
                    for (var clickInControlGallery = !1, element = evt.srcElement; element; ) {
                        if (element.id in {
                            controlGallery: 1, headerAddVisualButton: 1
                        } || WinJS.Utilities.hasClass(element, "addVisualButton") || WinJS.Utilities.hasClass(element, "addVisual") || WinJS.Utilities.hasClass(element, "addVisualText") || WinJS.Utilities.hasClass(element, "expressView")) {
                            clickInControlGallery = !0;
                            break
                        }
                        element = element.parentElement
                    }
                    clickInControlGallery || (this._viewModel.visible = !1)
                }, handleKeyDown: function(item, element, evt) {
                    return AppMagic.KeyboardHandlers.isEnterOrSpacePressed(evt) ? (this._handleControlTileClicked(item), !1) : !0
                }, _handleControlTileClicked: function(item) {
                    if (item.controlGroup) {
                        this._controlGroupCrumbs.push(this._title());
                        this._displayControlGroup(item.title);
                        return
                    }
                    item.template && this._viewModel.addControl(item.template, item.variant, item.isComposite)
                }, _handleFindBoxFocus: function() {
                    this._findBoxEditable(!0)
                }, _handleFindBoxBlur: function() {
                    this._findBoxEditable(this._findBoxFilterText() !== "")
                }, _filterControls: function() {
                    var filterText = this._filterElement.value;
                    this._findBoxFilterText(filterText);
                    filterText = filterText.trim();
                    filterText === "" ? this._displayControlGroup(this.title) : this._controls(this._shellViewModel.getFilteredLeafControls(this.title, filterText))
                }, _handleVisibleChanged: function() {
                    this._viewModel.visible ? (WinJS.Utilities.addClass(controlGallery, "expanded"), WinJS.UI.Animation.enterContent(controlGallery)) : WinJS.UI.Animation.exitContent(controlGallery).then(function() {
                        WinJS.Utilities.removeClass(controlGallery, "expanded");
                        this.resetGallery()
                    }.bind(this))
                }, _displayControlGroup: function(title) {
                    this._title(title);
                    this._controls(this._shellViewModel.getControls(title));
                    controlGalleryList.scrollTop = 0
                }, _resetFindBox: function() {
                    this._findBoxFilterText("");
                    this._findBoxEditable(!1)
                }, _shellViewModel: {get: function() {
                        return AppMagic.context.shellViewModel.controlGallery
                    }}, _viewModel: {get: function() {
                        return AppMagic.context.documentViewModel.controlGallery
                    }}, resetGallery: function() {
                    this._controlGroupCrumbs().length > 0 && this._controlGroupCrumbs([]);
                    this._title(AppMagic.AuthoringStrings.Visuals);
                    this._controls(this._shellViewModel.getControls(AppMagic.AuthoringStrings.Visuals));
                    this._resetFindBox()
                }, controls: {get: function() {
                        return this._controls()
                    }}, title: {get: function() {
                        return this._title()
                    }}, backButtonVisible: {get: function() {
                        return this._controlGroupCrumbs().length > 0
                    }}, findBoxEditable: {get: function() {
                        return this._findBoxEditable()
                    }}, findBoxFilterText: {
                    get: function() {
                        return this._findBoxFilterText()
                    }, set: function(value) {
                            this._findBoxFilterText(value)
                        }
                }
        }, {});
    WinJS.UI.Pages.define("/controls/controlGallery/controlGallery.html", {
        ready: function(element, options) {
            var view = new ControlGalleryView(element);
            AppMagic.context.views.add("ControlGalleryView", view)
        }, unload: function() {
                AppMagic.context.views.remove("ControlGalleryView")
            }
    })
})();