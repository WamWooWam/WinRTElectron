//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RestFunctionSelectorMenuSelector = ".rest-function-selector-menu",
        RestFunctionSelectorSelector = ".rest-function-selector",
        RestConnectionDataView = WinJS.Class.define(function RestConnectionDataView_ctor(element) {
            this._element = element;
            this._viewModel = element.viewModel;
            this._parentViewModel = element.parentViewModel;
            var eventTracker = new AppMagic.Utility.EventTracker,
                events = AppMagic.AuthoringTool.ViewModels.ImportedRestConfigViewModel.events;
            eventTracker.add(element.viewModel, events.mspointerdownresizecolwidth, this._onMsPointerDownResizeColWidth, this);
            eventTracker.add(element.viewModel, events.restconnectiondatavisible, this._onRestConnectionDataVisible, this);
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                eventTracker.dispose()
            });
            ko.applyBindings(element.viewModel, element.children[0])
        }, {
            _element: null, _viewModel: null, _parentViewModel: null, _onMsPointerDownResizeColWidth: function(evt) {
                    var detail = evt.detail,
                        clickEvent = detail.event,
                        clickTarget = clickEvent.target,
                        colIndex = detail.index,
                        pointerId = clickEvent.pointerId;
                    var initialClickX = clickEvent.x,
                        initialWidth = this._viewModel.getColWidth(colIndex),
                        onMsPointerMoveResize = function(evt2) {
                            var delta = evt2.x - initialClickX,
                                controls = AppMagic.Constants.Controls;
                            this._viewModel.setColWidth(colIndex, Math.max(controls.ImportedRestConfigControl.GridMinColWidthPixels, initialWidth + delta))
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
                }, _onRestConnectionDataVisible: function(ev) {
                    if (ev.detail.type) {
                        var restConnectionElement;
                        restConnectionElement = ev.detail.type === "function" ? this._element.getElementsByClassName("rest-data-connection-container") : this._element.getElementsByClassName("rest-service-key-config-container");
                        WinJS.UI.Animation.enterContent(restConnectionElement, AppMagic.Constants.Animation.EnterContentAnimationOffset)
                    }
                }
        });
    WinJS.UI.Pages.define("/backStages/data/restConnections/restConnectionDataView.html", {ready: function(element, options) {
            new RestConnectionDataView(element)
        }})
})();