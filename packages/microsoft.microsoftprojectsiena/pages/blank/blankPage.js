//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var MouseButtons = {left: 0},
        BlankPageView = WinJS.Class.define(function BlankPageView_ctor(element) {
            var zoom = ko.computed(function() {
                    return this._zoomViewModel
                }, this);
            zoom.subscribe(function() {
                this._registerZoomHandlers()
            }, this);
            this._registerZoomHandlers();
            window.onresize = this._onResize.bind(this);
            document.addEventListener("mousedown", this._handleMouseDown.bind(this), !0);
            document.addEventListener("mouseup", this._handleMouseUp.bind(this), !0);
            this._documentLayoutManager.addEventListener("layoutenginechange", this._onLayoutEngineChange.bind(this));
            var documentViewModel = ko.computed(function() {
                    return AppMagic.context.documentViewModel
                }),
                expressViewVisiblity = ko.computed(function() {
                    return AppMagic.context.documentViewModel.configuration.visibility
                });
            documentViewModel.subscribe(this._onResize, this);
            expressViewVisiblity.subscribe(this._onResize, this);
            workspaceCanvas.addEventListener("mousedown", function(evt) {
                evt.stopPropagation();
                evt.ctrlKey || (AppMagic.context.documentViewModel.selection.selectCanvas(null), AppMagic.context.documentViewModel.selection.clearVisuals(), AppMagic.context.documentViewModel.focusToScreenCanvas())
            }, !1);
            var viewModel = ko.computed(function() {
                    return this._viewModel
                }, this);
            ko.applyBindings(viewModel, element);
            var computedCanvas = ko.computed(function() {
                    return this._documentLayoutManager.width + this._documentLayoutManager.height * 1e4
                }, this);
            computedCanvas.subscribe(this._updateCanvasSizer, this);
            this._zoomViewModel.fitToPage(AppMagic.AuthoringTool.Constants.Zoom.Source.automatic);
            this._updateCanvas()
        }, {
            _normalizedScrollCenter: null, _getAvailableSize: function() {
                    return {
                            width: canvasGrid.offsetWidth, height: canvasGrid.offsetHeight
                        }
                }, _getCanvasSize: function() {
                    var transformedCanvasBounds = canvasScaler.getBoundingClientRect();
                    return {
                            width: transformedCanvasBounds.width, height: transformedCanvasBounds.height
                        }
                }, _getScrollableSize: function() {
                    var canvasSize = this._getCanvasSize(),
                        margin = AppMagic.AuthoringTool.Constants.ScreenCanvasMargin;
                    return {
                            width: canvasSize.width + margin * 2, height: canvasSize.height + margin * 2
                        }
                }, _getNormalizedScrollCenter: function() {
                    var centerX = canvasGrid.scrollLeft + canvasGrid.offsetWidth / 2,
                        centerY = canvasGrid.scrollTop + canvasGrid.offsetHeight / 2,
                        scrollableSize = this._getScrollableSize();
                    return {
                            x: centerX / scrollableSize.width, y: centerY / scrollableSize.height
                        }
                }, _getZoomLevel: function() {
                    var zoom = this._zoomViewModel.zoomScale;
                    return this._isPreview && (zoom = Math.min(blankPage.offsetWidth / this._documentLayoutManager.width, blankPage.offsetHeight / this._documentLayoutManager.height)), zoom
                }, _handleMouseDown: function(evt) {
                    visualDropDown.contains(evt.target) || (AppMagic.context.documentViewModel.visualDropDown.visualDropDownVisible = !1);
                    screenDropDown.contains(evt.target) || (AppMagic.context.documentViewModel.screenDropDown.visualDropDownVisible = !1);
                    evt.target === blankPage && (AppMagic.context.documentViewModel.selection.clearVisuals(), AppMagic.context.documentViewModel.selection.selectCanvas(null))
                }, _handleMouseUp: function(evt) {
                    if (evt.button === MouseButtons.left) {
                        var activeElement = document.activeElement;
                        activeElement === appBarScreenListContainer || topAppBar.contains(evt.target) || topAppBar.contains(activeElement) || topAppBar.winControl.hidden || topAppBar.winControl.hide()
                    }
                }, _onLayoutEngineChange: function() {
                    this._updateCanvas()
                }, _onBeforeZoomChanged: function() {
                    this._normalizedScrollCenter = this._getNormalizedScrollCenter()
                }, _onAfterZoomChanged: function() {
                    if (this._updateCanvas(), AppMagic.context.documentViewModel.selection.visuals.length > 0) {
                        var center = this._viewModel.selectedCenter;
                        this._scrollToCanvasCenter(center)
                    }
                    else
                        this._scrollToNormalizedCenter(this._normalizedScrollCenter);
                    this._normalizedScrollCenter = null
                }, _onResize: function() {
                    setImmediate(function() {
                        AppMagic.context.documentViewModel.isPreview || (this._zoomViewModel.fitToPage(AppMagic.AuthoringTool.Constants.Zoom.Source.automatic), this._updateCanvas())
                    }.bind(this))
                }, _registerZoomHandlers: function() {
                    this._zoomViewModel.addEventListener("beforeZoomChange", this._onBeforeZoomChanged.bind(this));
                    this._zoomViewModel.addEventListener("afterZoomChange", this._onAfterZoomChanged.bind(this))
                }, _scrollTo: function(scrollLeft, scrollTop) {
                    canvasGrid.style.visibility = "hidden";
                    canvasGrid.scrollLeft = Math.max(0, scrollLeft);
                    canvasGrid.scrollTop = Math.max(0, scrollTop);
                    canvasGrid.style.visibility = "visible"
                }, _scrollToCanvasCenter: function(center) {
                    var centerX = center.x * this._zoomViewModel.zoomScale,
                        centerY = center.y * this._zoomViewModel.zoomScale,
                        margin = AppMagic.AuthoringTool.Constants.ScreenCanvasMargin;
                    centerX += margin;
                    centerY += margin;
                    var scrollLeft = centerX - canvasGrid.offsetWidth / 2,
                        scrollTop = centerY - canvasGrid.offsetHeight / 2;
                    this._scrollTo(scrollLeft, scrollTop)
                }, _scrollToNormalizedCenter: function(center) {
                    var scrollableSize = this._getScrollableSize(),
                        centerX = center.x * scrollableSize.width,
                        centerY = center.y * scrollableSize.height,
                        scrollLeft = centerX - canvasGrid.offsetWidth / 2,
                        scrollTop = centerY - canvasGrid.offsetHeight / 2;
                    this._scrollTo(scrollLeft, scrollTop)
                }, _updateCanvas: function() {
                    this._updateZoom();
                    this._updateScrollLimits()
                }, _updateScrollLimits: function() {
                    var scrollableX,
                        scrollableY;
                    if (this._isPreview)
                        scrollableX = 0,
                        scrollableY = 0;
                    else {
                        var availableSize = this._getAvailableSize(),
                            scrollableSize = this._getScrollableSize();
                        scrollableX = Math.max(0, scrollableSize.width - availableSize.width);
                        scrollableY = Math.max(0, scrollableSize.height - availableSize.height)
                    }
                    canvasGrid.style.msScrollLimit = "0px 0px " + scrollableX.toString() + "px " + scrollableY.toString() + "px";
                    canvasGrid.style["overflow-x"] = scrollableX === 0 ? "visible" : "scroll";
                    canvasGrid.style["overflow-y"] = scrollableY === 0 ? "visible" : "scroll"
                }, _updateZoom: function() {
                    var zoom = this._getZoomLevel();
                    canvasScaler.style.transform = "scale(" + zoom.toString() + ", " + zoom.toString() + ")";
                    this._updateCanvasSizer()
                }, _updateCanvasSizer: function() {
                    var canvasSize = this._getCanvasSize();
                    canvasSizer.style.width = canvasSize.width.toString() + "px";
                    canvasSizer.style.height = canvasSize.height.toString() + "px"
                }, _isPreview: {get: function() {
                        return AppMagic.context.documentViewModel.isPreview
                    }}, _viewModel: {get: function() {
                        return AppMagic.context.documentViewModel.blankPage
                    }}, _zoomViewModel: {get: function() {
                        return AppMagic.context.documentViewModel.zoom
                    }}, _documentLayoutManager: {get: function() {
                        return AppMagic.context.documentViewModel.documentLayoutManager
                    }}
        }, {});
    WinJS.UI.Pages.define("/pages/blank/blankPage.html", {ready: function(element) {
            new BlankPageView(element)
        }})
})();