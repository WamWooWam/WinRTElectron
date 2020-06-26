//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ScreenCanvasContainerView = WinJS.Class.define(function ScreenCanvasContainerView_ctor(element) {
            this._element = element;
            this._screenCanvasParentElement = element.children[0];
            this._primaryScreenCanvas = ko.observable(null);
            this._secondaryScreenCanvas = ko.observable(null);
            var selectedScreenCanvas = ko.computed(function() {
                    return this._selectedScreenCanvas
                }, this);
            selectedScreenCanvas.subscribe(this._handleSelectedScreenCanvasChanged, this);
            this._primaryScreenCanvas(this._selectedScreenCanvas);
            AppMagic.context.addEventListener("documentdisposing", this._handleDocumentChange.bind(this));
            document.addEventListener("mousewheel", this._mousewheelHandler.bind(this), !1);
            ko.applyBindings(this, this._screenCanvasParentElement)
        }, {
            _element: null, _screenCanvasParentElement: null, _primaryScreenCanvas: null, _secondaryScreenCanvas: null, _screenTransition: null, primaryScreenCanvas: {get: function() {
                        return this._primaryScreenCanvas()
                    }}, secondaryScreenCanvas: {get: function() {
                        return this._secondaryScreenCanvas()
                    }}, screenCanvases: {get: function() {
                        return AppMagic.context.documentViewModel.canvasManager.screenCanvases
                    }}, handleAfterAddScreenCanvas: function(element, index, screenCanvas) {
                    element.nodeType === Node.ELEMENT_NODE && (element.style.display = screenCanvas === this._selectedScreenCanvas ? "block" : "none")
                }, _handleDocumentChange: function() {
                    this._secondaryScreenCanvas(null);
                    this._primaryScreenCanvas(null)
                }, _handleSelectedScreenCanvasChanged: function() {
                    this._secondaryScreenCanvas(this._primaryScreenCanvas());
                    this._primaryScreenCanvas(this._selectedScreenCanvas);
                    var primaryIndex = this.screenCanvases.indexOf(this._primaryScreenCanvas()),
                        secondaryIndex = this.screenCanvases.indexOf(this._secondaryScreenCanvas());
                    var primaryElement = this._screenCanvasParentElement.children[primaryIndex],
                        secondaryElement = secondaryIndex < 0 ? null : this._screenCanvasParentElement.children[secondaryIndex],
                        transitionType = AppMagic.context.documentViewModel.dequeueScreenTransitionType(),
                        currentTransition = this._screenTransition;
                    currentTransition === null && (currentTransition = WinJS.Promise.wrap(!0));
                    var incomingScreen = this._primaryScreenCanvas().owner,
                        outgoingScreen = null;
                    secondaryIndex >= 0 && (outgoingScreen = this._secondaryScreenCanvas().owner);
                    outgoingScreen !== null && outgoingScreen.onHidden();
                    var transition = currentTransition.then(function() {
                            return WinJS.Utilities.addClass(workspaceCanvas, "animating"), AppMagic.AuthoringTool.Animation.screenTransition(transitionType, primaryElement, secondaryElement)
                        }).then(function() {
                            WinJS.Utilities.removeClass(workspaceCanvas, "animating");
                            this._screenTransition === transition && (this._screenTransition = null);
                            incomingScreen.onVisible()
                        }.bind(this));
                    this._screenTransition = transition
                }, _selectedScreenCanvas: {get: function() {
                        return AppMagic.context.documentViewModel.canvasManager.selectedScreenCanvas
                    }}, _mousewheelHandler: function(evt) {
                    evt.ctrlKey && (evt.wheelDelta < 0 ? AppMagic.context.documentViewModel.zoom.zoomOut() : evt.wheelDelta > 0 && AppMagic.context.documentViewModel.zoom.zoomIn())
                }
        }, {});
    AppMagic.UI.Pages.define("/controls/screenCanvasContainer/screenCanvasContainer.html", ScreenCanvasContainerView)
})();