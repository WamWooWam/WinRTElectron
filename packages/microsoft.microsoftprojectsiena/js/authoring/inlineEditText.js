//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(global) {"use strict";
    ko.bindingHandlers.inlineEditText = {init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var disposed = !1,
                observableText = valueAccessor();
            var text = ko.utils.unwrapObservable(observableText);
            var controlWidget = typeof viewModel.controlWidget == "undefined" ? viewModel.OpenAjax : viewModel.controlWidget;
            var blockPressEventInEditMode = function(evt) {
                    controlWidget.mode() === "edit" && (evt.stopImmediatePropagation(), evt.stopPropagation())
                };
            element.addEventListener("click", blockPressEventInEditMode, !1);
            var updateText = function(newText) {
                    text = newText;
                    controlWidget.updatePropertyValue(observableText.propertyName, text)
                },
                rangeSelector = function(copiedText) {
                    var selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        var range = selection.getRangeAt(0);
                        if (range.deleteContents(), copiedText !== null) {
                            selection.removeAllRanges();
                            var textNode = document.createTextNode(copiedText);
                            range.insertNode(textNode)
                        }
                        text !== element.innerText && updateText(element.innerText)
                    }
                };
            element.oncut = function(evt) {
                evt.preventDefault();
                var content = document.getSelection().getRangeAt(0).cloneContents().textContent;
                window.clipboardData.setData("Text", content);
                rangeSelector(null)
            };
            element.onpaste = function(evt) {
                evt.preventDefault();
                var copiedText = window.clipboardData.getData("Text");
                rangeSelector(copiedText)
            };
            var shortcutsHandler = function(evt) {
                    if (evt.ctrlKey && (evt.key === "b" || evt.key === "i" || evt.key === "u") && evt.preventDefault(), evt.keyCode === 13) {
                        var selection = window.getSelection(),
                            range = selection.getRangeAt(0),
                            node = document.createElement("br");
                        range.deleteContents();
                        range.insertNode(node);
                        range.setStartAfter(node);
                        range.collapse(!1);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        evt.preventDefault()
                    }
                },
                valueChangedHandler = function(evt) {
                    disposed || text === element.innerText || updateText(element.innerText)
                },
                onTextUpdated = function(newValue) {
                    newValue === null && (newValue = "");
                    element.innerText = newValue
                };
            observableText.subscribe(function(newValue) {
                newValue === null && (newValue = "");
                newValue !== text && (text = newValue, onTextUpdated(text))
            });
            onTextUpdated(text);
            var mode = controlWidget.mode(),
                onModeUpdated = function(newMode, disableSelectionInViewMode) {
                    viewModel.isTemplate && (newMode === "edit" ? (element.onkeydown = function(evt) {
                        shortcutsHandler(evt)
                    }, element.onkeyup = function(evt) {
                        valueChangedHandler(evt)
                    }, element.onkeypress = function(evt) {
                            setImmediate(valueChangedHandler.bind(null, evt))
                        }, element.ondragenter = element.ondragleave = function() {
                            return !1
                        }, element.contentEditable = "true", element.setAttribute("unselectable", "off")) : newMode === "view" && (disableSelectionInViewMode && element.setAttribute("unselectable", "on"), element.removeAttribute("contenteditable"), element.parentElement.scrollTop = 0, element.onkeydown = null, element.onkeyup = null, element.onkeypress = null, element.ondragenter = null, element.ondragleave = null))
                };
            controlWidget.mode.subscribe(function(newMode) {
                newMode !== mode && (mode = newMode, onModeUpdated(mode, controlWidget.getControlInfo().template.className !== "AppMagic.Controls.Label"))
            });
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                disposed = !0;
                element.onkeydown = null;
                element.onkeyup = null;
                element.onkeypress = null;
                element.onpaste = null;
                element.oncut = null;
                element.ondragenter = null;
                element.ondragleave = null;
                element.removeEventListener("click", blockPressEventInEditMode, !1)
            })
        }}
})(this);