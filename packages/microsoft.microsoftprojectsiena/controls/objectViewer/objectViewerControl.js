//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var hiddenGridSelector = ".hiddenGrid",
        hiddenGridHeaderSelector = ".hiddenGridHeader",
        objectViewerGridHeadersSelector = ".objectViewerGridHeaders",
        objectViewerGridCellsSelector = ".objectViewerGridCells",
        onMsPointerMoveResizeThrottle = 100,
        numExtraPixelsRenderedForSmoothScrolling = 100,
        ObjectViewerControl = WinJS.Class.define(function ObjectViewerControl_ctor(element) {
            this._element = element;
            this._viewModel = element.viewModel;
            this._gridCellsElement = element.querySelector(objectViewerGridCellsSelector);
            this._gridHeaders = element.querySelector(objectViewerGridHeadersSelector);
            var isLengthsInitialized = !1,
                initializeIfNeededAndCallRealize = function() {
                    isLengthsInitialized || (isLengthsInitialized = !0, this._initializeWidthsAndHeights());
                    this._cacheGridCellsElementDimensions();
                    this._callRealizeCells()
                }.bind(this);
            setImmediate(initializeIfNeededAndCallRealize);
            ko.applyBindings(this._viewModel, element.children[0]);
            this._eventTracker = new AppMagic.Utility.EventTracker;
            this._eventTracker.add(this._gridCellsElement, "scroll", this._onScroll, this);
            var events = AppMagic.AuthoringTool.ObjectViewer.ObjectViewerViewModel.events;
            this._eventTracker.add(this._viewModel, events.datachanged, initializeIfNeededAndCallRealize, this);
            this._eventTracker.add(this._viewModel, events.mspointerdownresizecolwidth, this._onMsPointerDownResizeColWidth, this);
            this._eventTracker.add(this._viewModel, events.mspointerdownresizerowheight, this._onMsPointerDownResizeRowHeight, this);
            this._eventTracker.add(this._viewModel, events.notifyshow, initializeIfNeededAndCallRealize, this);
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                this._eventTracker.dispose()
            }.bind(this))
        }, {
            _element: null, _viewModel: null, _eventTracker: null, _gridCellsElement: null, _scrollTimeout: null, _gridHeaders: null, _gridCellsElementOffsetWidth: null, _gridCellsElementOffsetHeight: null, _cacheGridCellsElementDimensions: function() {
                    this._gridCellsElementOffsetWidth = this._gridCellsElement.offsetWidth;
                    this._gridCellsElementOffsetHeight = this._gridCellsElement.offsetHeight
                }, _initializeWidthsAndHeights: function() {
                    var measurer = new AppMagic.AuthoringTool.ObjectViewer.TextMeasurer(this._element.querySelector(hiddenGridHeaderSelector));
                    this._viewModel.initializeSizes(measurer);
                    measurer.hideContainer()
                }, _onScroll: function() {
                    this._callRealizeCells();
                    this._gridHeaders.scrollLeft = this._gridCellsElement.scrollLeft
                }, _callRealizeCells: function() {
                    var controls = AppMagic.Constants.Controls;
                    this._viewModel.realizeCells(this._gridCellsElement.scrollLeft, this._gridCellsElement.scrollTop - numExtraPixelsRenderedForSmoothScrolling, this._gridCellsElementOffsetWidth, this._gridCellsElementOffsetHeight + 2 * numExtraPixelsRenderedForSmoothScrolling, controls.ObjectViewerControl.GridWidthResizerThicknessPixels, controls.ObjectViewerControl.GridHeightResizerThicknessPixels)
                }, _onMsPointerDownResizeRowHeight: function(evt) {
                    var detail = evt.detail,
                        clickEvent = detail.event,
                        clickTarget = clickEvent.target,
                        rowIndex = detail.index,
                        pointerId = clickEvent.pointerId;
                    var initialClickY = clickEvent.y,
                        initialHeight = this._viewModel.getRowHeight(rowIndex),
                        msPointerMoveTimeout = null,
                        onMsPointerMoveResize = function(evt2) {
                            var delta = evt2.y - initialClickY,
                                controls = AppMagic.Constants.Controls;
                            this._viewModel.setRowHeight(rowIndex, Math.max(controls.ObjectViewerControl.GridMinRowHeightPixels, initialHeight + delta));
                            msPointerMoveTimeout !== null && clearTimeout(msPointerMoveTimeout);
                            msPointerMoveTimeout = setTimeout(function() {
                                this._cacheGridCellsElementDimensions();
                                this._callRealizeCells();
                                msPointerMoveTimeout = null
                            }.bind(this), onMsPointerMoveResizeThrottle)
                        }.bind(this),
                        originalCursor = document.body.style.cursor;
                    document.body.style.cursor = "row-resize";
                    this._setResizeEventListeners(clickTarget, pointerId, onMsPointerMoveResize, originalCursor)
                }, _onMsPointerDownResizeColWidth: function(evt) {
                    var detail = evt.detail,
                        clickEvent = detail.event,
                        clickTarget = clickEvent.target,
                        colIndex = detail.index,
                        pointerId = clickEvent.pointerId;
                    var initialClickX = clickEvent.x,
                        initialWidth = this._viewModel.getColWidth(colIndex),
                        msPointerMoveTimeout = null,
                        onMsPointerMoveResize = function(evt2) {
                            var delta = evt2.x - initialClickX,
                                controls = AppMagic.Constants.Controls;
                            this._viewModel.setColWidth(colIndex, Math.max(controls.ObjectViewerControl.GridMinColWidthPixels, initialWidth + delta));
                            msPointerMoveTimeout !== null && clearTimeout(msPointerMoveTimeout);
                            msPointerMoveTimeout = setTimeout(function() {
                                this._cacheGridCellsElementDimensions();
                                this._callRealizeCells();
                                msPointerMoveTimeout = null
                            }.bind(this), onMsPointerMoveResizeThrottle)
                        }.bind(this),
                        originalCursor = document.body.style.cursor;
                    document.body.style.cursor = "col-resize";
                    this._setResizeEventListeners(clickTarget, pointerId, onMsPointerMoveResize, originalCursor)
                }, _setResizeEventListeners: function(clickTarget, pointerId, onMsPointerMoveResize, originalCursor) {
                    var onMsPointerUpResizeColWidth = function() {
                            clickTarget.removeEventListener("MSPointerMove", onMsPointerMoveResize);
                            clickTarget.removeEventListener("MSPointerUp", onMsPointerUpResizeColWidth);
                            clickTarget.removeEventListener("MSLostPointerCapture", onMsPointerUpResizeColWidth);
                            clickTarget.msReleasePointerCapture(pointerId);
                            document.body.style.cursor = originalCursor
                        };
                    clickTarget.addEventListener("MSPointerMove", onMsPointerMoveResize);
                    clickTarget.addEventListener("MSPointerUp", onMsPointerUpResizeColWidth);
                    clickTarget.addEventListener("MSLostPointerCapture", onMsPointerUpResizeColWidth);
                    clickTarget.msSetPointerCapture(pointerId)
                }
        });
    AppMagic.UI.Pages.define("/controls/objectViewer/objectViewerControl.html", ObjectViewerControl)
})();