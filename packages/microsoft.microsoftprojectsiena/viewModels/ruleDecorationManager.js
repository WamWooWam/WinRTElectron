//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ErrorMessageBoundsOffset = 5,
        SquigglyScalingFactor = .3,
        MaxSquigglesPerError = 10,
        RuleDecorationManager = WinJS.Class.define(function RuleDecorationManager_ctor(element, textArea) {
            this._element = element;
            this._errorMessages = [];
            this._textArea = textArea;
            this._squigglyContainer = AppMagic.Utility.getFirstDescendantByClass("squigglyContainer", element);
            this._macroHighlights = ko.observableArray();
            this._bracketHighlights = ko.observableArray();
            this._squigglies = ko.observableArray()
        }, {
            _bracketHighlights: null, _element: null, _errorMessages: null, _macroHighlights: null, _squigglies: null, _squigglyContainer: null, _textArea: null, bracketHighlights: {get: function() {
                        return this._bracketHighlights()
                    }}, errorMessages: {get: function() {
                        return this._errorMessages
                    }}, macroHighlights: {get: function() {
                        return this._macroHighlights()
                    }}, squigglies: {get: function() {
                        return this._squigglies()
                    }}, updateBracketHighlights: function(bracketIndices) {
                    if (this._bracketHighlights.removeAll(), bracketIndices)
                        for (var bracket in bracketIndices) {
                            var bracketIndex = bracketIndices[bracket],
                                boundsInfo = this._getBounds(bracketIndex, bracketIndex + 1);
                            boundsInfo && this._addBracketHighlights(boundsInfo.rects)
                        }
                }, updateErrors: function(errors) {
                    this._errorMessages = [];
                    for (var squigglies = [], i = 0, len = errors.length; i < len; i++) {
                        var textSpan = errors[i].textSpan,
                            boundsInfo = this._getBounds(textSpan.min, textSpan.lim);
                        boundsInfo && this._addMessageAndSquigglies(boundsInfo, errors[i].message, squigglies)
                    }
                    this._squigglies(squigglies)
                }, updateMacroHighlights: function(spans) {
                    this._macroHighlights.removeAll();
                    var container = WinJS.Utilities.query(".macroHighlightContainer", this._element);
                    if (!(container.length <= 0))
                        for (var containerRect = container[0].getBoundingClientRect(), spansIt = spans.first(); spansIt.hasCurrent; spansIt.moveNext()) {
                            var boundsInfo = this._getBounds(spansIt.current.min, spansIt.current.lim);
                            if (boundsInfo !== null)
                                for (var j = 0; j < boundsInfo.rects.length; j++) {
                                    var rect = boundsInfo.rects[j];
                                    this._macroHighlights.push({
                                        left: (rect.left - containerRect.left).toString() + "px", height: rect.height.toString() + "px", top: (rect.top - containerRect.top).toString() + "px", width: rect.width.toString() + "px"
                                    })
                                }
                        }
                }, _addBracketHighlights: function(rects) {
                    var childElements = WinJS.Utilities.query(".bracketHighlightContainer", this._element);
                    if (childElements.length > 0)
                        for (var bracketHighlightContainer = childElements[0], containerRect = bracketHighlightContainer.getBoundingClientRect(), i = 0, len = rects.length; i < len; i++) {
                            var rect = rects[i];
                            this._bracketHighlights.push({
                                left: (rect.left - containerRect.left).toString() + "px", height: rect.height.toString() + "px", top: (rect.top - containerRect.top).toString() + "px", width: rect.width.toString() + "px"
                            })
                        }
                }, _addMessageAndSquigglies: function(boundsInfo, message, squigglies) {
                    for (var containerRect = this._squigglyContainer.getBoundingClientRect(), rects = boundsInfo.rects, isMissingChar = boundsInfo.isMissingChar, i = 0, len = Math.min(MaxSquigglesPerError, rects.length); i < len; i++) {
                        var rect = rects[i],
                            leftPos = isMissingChar ? rect.left + rect.width : rect.left,
                            width = isMissingChar || rect.width === 0 ? rect.height * SquigglyScalingFactor : rect.width;
                        this._errorMessages.push({
                            message: message, bottom: rect.top + rect.height + ErrorMessageBoundsOffset, left: leftPos - ErrorMessageBoundsOffset, right: leftPos + rect.width + ErrorMessageBoundsOffset, top: rect.top - ErrorMessageBoundsOffset
                        });
                        squigglies.push({
                            left: (leftPos - containerRect.left).toString() + "px", top: (rect.bottom - containerRect.top).toString() + "px", width: width.toString() + "px"
                        })
                    }
                }, _getBounds: function(startIndex, endIndex) {
                    var isMissingChar = !1,
                        textRange = this._textArea.createTextRange(),
                        len = textRange.text.length;
                    return startIndex < 0 || startIndex > len || endIndex < startIndex || endIndex > len ? null : (startIndex === endIndex && startIndex === len && (startIndex--, isMissingChar = !0), textRange.moveStart("character", startIndex), textRange.moveEnd("character", endIndex - len), {
                                rects: AppMagic.AuthoringTool.Utility.getTextRangeClientRectsWithScaling(textRange), isMissingChar: isMissingChar
                            })
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {RuleDecorationManager: RuleDecorationManager})
})();