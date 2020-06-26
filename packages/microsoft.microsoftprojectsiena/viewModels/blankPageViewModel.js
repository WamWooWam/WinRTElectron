//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var BlankPageViewModel = WinJS.Class.define(function BlankPageViewModel_ctor(shell, isPreview, entityManager, selectionManager, canvasManager, screenDropDown, visualDropDown, documentLayoutManager) {
            this._shell = shell;
            this._isPreview = isPreview;
            this._entityManager = entityManager;
            this._selectionManager = selectionManager;
            this._canvasManager = canvasManager;
            this._screenDropDown = screenDropDown;
            this._visualDropDown = visualDropDown;
            this._blankPageShortcuts = new AppMagic.AuthoringTool.Shortcuts.BlankPageShortcutProvider(this);
            this._documentLayoutManager = documentLayoutManager
        }, {
            _canvasManager: null, _entityManager: null, _isPreview: null, _selectionManager: null, _screenDropDown: null, _shell: null, _visualDropDown: null, _blankPageShortcuts: null, _documentLayoutManager: null, _eventTracker: null, blankPageShortcuts: {get: function() {
                        return this._blankPageShortcuts
                    }}, canvasHeight: {get: function() {
                        return this._documentLayoutManager.height + "px"
                    }}, canvasWidth: {get: function() {
                        return this._documentLayoutManager.width + "px"
                    }}, handleAddVisual: function() {
                    AppMagic.context.documentViewModel.controlGallery.showVisualGallery()
                }, handleCanvasMouseDown: function(data, evt) {
                    for (var element = evt.target; element !== evt.currentTarget; element = element.parentNode)
                        if (element === headerAddVisualButton || element === screenDropDown || element === visualDropDown)
                            return !0;
                    var visualContainer = this._getActiveVisualContainer(),
                        transformedEvent = this._transformMouseEventToCanvas(evt, visualContainer);
                    return this._canvasManager.selectedScreenCanvas.handleCanvasPointerDown(data, transformedEvent), !0
                }, selectedCenter: {get: function() {
                        return this._selectionManager.selectedCenter
                    }}, _getActiveVisualContainer: function() {
                    for (var elements = blankPage.getElementsByClassName("visualContainer"), i = 0; i < elements.length; i++) {
                        var element = elements[i],
                            canvasViewModel = ko.dataFor(element);
                        if (canvasViewModel === this._canvasManager.selectedScreenCanvas)
                            return element
                    }
                    return null
                }, _transformMouseEventToCanvas: function(evt, element) {
                    var bounds = element.getBoundingClientRect(),
                        scale = element.offsetWidth / bounds.width;
                    return {
                            button: evt.button, currentTarget: element, stopPropagation: evt.stopPropagation.bind(evt), offsetX: (evt.clientX - bounds.left) * scale, offsetY: (evt.clientY - bounds.top) * scale
                        }
                }, isPreview: {get: function() {
                        return this._isPreview()
                    }}, screenDropDown: {get: function() {
                        return this._screenDropDown
                    }}, screens: {get: function() {
                        return this._entityManager.screens()
                    }}, selection: {get: function() {
                        return this._selectionManager
                    }}, visualDropDown: {get: function() {
                        return this._visualDropDown
                    }}
        });
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {BlankPageViewModel: BlankPageViewModel})
})(Windows);