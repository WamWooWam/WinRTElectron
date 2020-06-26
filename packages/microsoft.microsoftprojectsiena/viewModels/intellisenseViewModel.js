//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var INITIAL_SELECTION_INDEX = 0,
        NO_REPLACEMENT = -1,
        NO_SELECTION = -1,
        util = AppMagic.Utility,
        IntellisenseViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function intellisenseViewModel_ctor(intellisense, categoryId) {
            this._intellisense = intellisense;
            this._categoryId = categoryId;
            AppMagic.Utility.Disposable.call(this);
            this._functionInfo = ko.observable(null);
            this._selectedIndex = ko.observable(NO_SELECTION);
            this._suggestions = ko.observable(null);
            this._suggestionsArray = ko.observableArray();
            this._renderedSuggestions = ko.observableArray()
        }, {
            _fnDiscoveryPanel: null, _functionInfo: null, _intellisense: null, _categoryId: null, _selectedIndex: null, _suggestions: null, _suggestionsArray: null, _renderedSuggestions: null, autoCorrectIdentifier: function(suggestions, text, cursor, replacementStartIndex, replacementLength) {
                    for (var nameFixed = !1, replacement, updatedText, endIndex, startIndex, i = suggestions.length - 1; i >= 0; i--) {
                        var suggestion = suggestions[i],
                            identText = suggestion.text;
                        if (cursor >= identText.length) {
                            var compareText = text.substring(cursor - identText.length, cursor);
                            if (compareText === identText)
                                return {nameFixed: !1};
                            compareText.toLowerCase() === identText.toLowerCase() && (replacement = this.replaceText(text, identText, replacementStartIndex, replacementLength, !1, !1), updatedText = replacement.updatedText, startIndex = replacement.startIndex, endIndex = replacement.endIndex, nameFixed = !0)
                        }
                    }
                    return {
                            nameFixed: nameFixed, updatedText: updatedText, startIndex: startIndex, endIndex: endIndex
                        }
                }, suggest: function(context) {
                    var result = this._intellisense.suggest(context);
                    var suggestions;
                    return suggestions = result ? this._getSuggestionsArray(result.suggestions) : [], {
                            suggestions: suggestions, replacementStartIndex: result.replacementStartIndex, replacementLength: result.replacementLength
                        }
                }, finalizeRule: function(context, text, cursor) {
                    var result = this._intellisense.autoCorrect(context),
                        nameFixed = !1,
                        updatedText = text;
                    return result !== text && (updatedText = result, nameFixed = !0), {
                            nameFixed: nameFixed, updatedText: updatedText
                        }
                }, scrollSuggestions: function(element, evt) {
                    element.scrollTop + element.offsetHeight >= element.scrollHeight * .8 && this._renderMoreSuggestions()
                }, _renderMoreSuggestions: function() {
                    for (var twoPagesOfContent = 6, renderedSuggestions = this._renderedSuggestions(), i = renderedSuggestions.length, len = Math.min(renderedSuggestions.length + twoPagesOfContent, this._suggestionsArray().length); i < len; i++)
                        renderedSuggestions.push(this._suggestionsArray()[i]);
                    this._renderedSuggestions.valueHasMutated()
                }, fnDiscoveryPanel: {get: function() {
                        return this._fnDiscoveryPanel || this.track("_fnDiscoveryPanel", new AppMagic.AuthoringTool.ViewModels.FunctionDiscoveryPanel(this._intellisense, this._categoryId)), this._fnDiscoveryPanel
                    }}, refresh: function(intellisenseContext) {
                    var result = this._intellisense.suggest(intellisenseContext);
                    this._suggestions(result);
                    this._refreshSuggestions();
                    this._refreshSelectedIndex();
                    this._refreshFunctionInfo()
                }, replaceSuggestionText: function(text, suggestion) {
                    var suggestionText = suggestion.text;
                    var isFnScope = suggestion.kind === Microsoft.AppMagic.Authoring.SuggestionKind.function,
                        isService = suggestion.kind === Microsoft.AppMagic.Authoring.SuggestionKind.service;
                    return this.replaceText(text, suggestionText, this._startIndex, this._replacementLength, isFnScope, isService)
                }, selectedIndex: {
                    get: function() {
                        return this._selectedIndex()
                    }, set: function(value) {
                            this._selectedIndex(value)
                        }
                }, suggestions: {get: function() {
                        return this._renderedSuggestions()
                    }}, tooltipContent: {get: function() {
                        var selectedIndex = this._selectedIndex(),
                            fnInfo = this._functionInfo();
                        if (selectedIndex !== NO_SELECTION) {
                            var suggestion = this._suggestionsArray.peek()[selectedIndex],
                                definition = suggestion.definition;
                            if (definition)
                                return {
                                        fnSignature: null, highlightedText: suggestion.text + ": ", definition: definition
                                    }
                        }
                        return fnInfo ? {
                                fnSignature: fnInfo.signature, highlightedText: fnInfo.highlightedText + ": ", definition: fnInfo.fnParameterDescription
                            } : null
                    }}, _replacementLength: {get: function() {
                        return this._suggestions() ? this._suggestions().replacementLength : NO_REPLACEMENT
                    }}, _getFnInfo: function() {
                    if (this._suggestions() && this._suggestions().isFunctionScope && this._fnOverloadIndex >= 0) {
                        for (var i = 0, functions = this._suggestions().functionOverloads.first(); functions.hasCurrent && i !== this._fnOverloadIndex; )
                            functions.moveNext(),
                            i++;
                        if (i === this._fnOverloadIndex) {
                            var current = functions.current,
                                diplayText = current.displayText,
                                parameterDescription = current.functionParameterDescription;
                            return {
                                    text: diplayText.text, highlightStartIndex: diplayText.highlightStart, highlightEndIndex: diplayText.highlightEnd, definition: current.definition, parameterDescription: parameterDescription
                                }
                        }
                    }
                    return null
                }, _getFnSignature: function(fnInfo) {
                    var beforeHighlightText = "",
                        highlightedText = "",
                        afterHighlightText = "";
                    if (fnInfo) {
                        var text = fnInfo.text;
                        if (fnInfo.highlightStartIndex === -1)
                            return {
                                    start: text, highlight: "", end: ""
                                };
                        var textLen = text.length;
                        beforeHighlightText = text.substring(0, fnInfo.highlightStartIndex);
                        highlightedText = text.substring(fnInfo.highlightStartIndex, fnInfo.highlightEndIndex + 1);
                        fnInfo.highlightEndIndex < textLen - 1 && (afterHighlightText = text.substring(fnInfo.highlightEndIndex + 1))
                    }
                    return {
                            start: beforeHighlightText, highlight: highlightedText, end: afterHighlightText
                        }
                }, _escapeHighlightString: function(text, startIndex, endIndex) {
                    for (var textLen = text.length, escapedText = "", highlightStart = startIndex, highlightEnd = endIndex, charactersToEscape = {
                            "<": "&lt;", ">": "&gt;"
                        }, i = 0; i < textLen; i++) {
                        var ch = text[i],
                            escaped = charactersToEscape[ch];
                        if (escaped) {
                            var numCharactersAdded = escaped.length - 1;
                            escapedText = escapedText.concat(escaped);
                            i < startIndex ? (highlightStart += numCharactersAdded, highlightEnd += numCharactersAdded) : startIndex <= i && i < endIndex && (highlightEnd += numCharactersAdded)
                        }
                        else
                            escapedText = escapedText.concat(ch)
                    }
                    return {
                            escapedString: escapedText, highlightStart: highlightStart, highlightEnd: highlightEnd
                        }
                }, _getStyledText: function(text, startIndex, endIndex) {
                    var result = this._escapeHighlightString(text, startIndex, endIndex);
                    text = result.escapedString;
                    startIndex = result.highlightStart;
                    endIndex = result.highlightEnd;
                    var textLen = text.length;
                    var styledText = text.substring(0, startIndex) + "<b>" + text.substring(startIndex, endIndex) + "<\/b>";
                    return endIndex < textLen && (styledText += text.substring(endIndex)), styledText
                }, _fnOverloadIndex: {get: function() {
                        return this._suggestions() ? this._suggestions().currentFunctionOverloadIndex : NO_REPLACEMENT
                    }}, _refreshFunctionInfo: function() {
                    var fnInfo = this._getFnInfo();
                    if (fnInfo) {
                        var fnSignature = this._getFnSignature(fnInfo),
                            fnParameterDescription = fnInfo.parameterDescription;
                        this._functionInfo({
                            signature: fnSignature, highlightedText: fnSignature.highlight, fnParameterDescription: fnParameterDescription
                        })
                    }
                    else
                        this._functionInfo(null)
                }, _refreshSelectedIndex: function() {
                    this._selectedIndex(NO_SELECTION);
                    this._suggestionsArray().length > 0 && this._selectedIndex(INITIAL_SELECTION_INDEX)
                }, _refreshSuggestions: function() {
                    var result = this._suggestions(),
                        suggestionsArray = [];
                    result && (suggestionsArray = this._getSuggestionsArray(result.suggestions));
                    this._suggestionsArray(suggestionsArray);
                    this._renderedSuggestions([]);
                    this._renderMoreSuggestions()
                }, _getSuggestionsArray: function(IntellisenseSuggestions) {
                    for (var suggestionsArray = [], suggestions = IntellisenseSuggestions.first(); suggestions.hasCurrent; ) {
                        var current = suggestions.current,
                            displayText = current.displayText;
                        suggestionsArray.push({
                            text: displayText.text, styledText: this._getStyledText(displayText.text, displayText.highlightStart, displayText.highlightEnd), definition: current.definition, kind: current.kind
                        });
                        suggestions.moveNext()
                    }
                    return suggestionsArray
                }, replaceText: function(text, suggestionText, startIndex, replacementLength, isFnScope, isService) {
                    var updatedText = text.substring(0, startIndex) + suggestionText,
                        updatedEndIndex = suggestionText.length;
                    return isFnScope ? (updatedText += "(", updatedEndIndex++) : isService && (updatedText += "!", updatedEndIndex++), startIndex + replacementLength <= text.length - 1 && (updatedText += text.substring(startIndex + replacementLength)), {
                                updatedText: updatedText, startIndex: startIndex, endIndex: updatedEndIndex
                            }
                }, _startIndex: {get: function() {
                        return this._suggestions() ? this._suggestions().replacementStartIndex : NO_REPLACEMENT
                    }}, getBracketIndices: function(script, cursorPosition) {
                    if (cursorPosition < 0 || typeof script == "undefined" || script === null)
                        return null;
                    var len = script.length;
                    if (0 < len && len >= cursorPosition) {
                        var begin,
                            end,
                            direction,
                            count = 0,
                            quoteCount = 0,
                            doubleQuoteCount = 0,
                            previousPos = cursorPosition - 1,
                            cursorChar = cursorPosition < len ? script[cursorPosition] : null,
                            previousChar = previousPos >= 0 ? script[previousPos] : null,
                            oppositeParen,
                            foundParen,
                            closeParen,
                            i = -1;
                        for (cursorChar === "(" || cursorChar === "{" || cursorChar === "[" ? (begin = cursorPosition, oppositeParen = this._getMatchingOppositeBracket(cursorChar), direction = 1, i = begin + direction, foundParen = script[begin]) : (previousChar === ")" || previousChar === "}" || previousChar === "]") && (end = previousPos, oppositeParen = this._getMatchingOppositeBracket(previousChar), direction = -1, i = end + direction, foundParen = script[end]); 0 <= i && i < len; ) {
                            var currentChar = script[i];
                            if (currentChar === '"')
                                doubleQuoteCount++;
                            else if (currentChar === "'")
                                quoteCount++;
                            else if (currentChar === foundParen && (quoteCount & 1) == 0 && (doubleQuoteCount & 1) == 0)
                                count++;
                            else if (currentChar === oppositeParen && (quoteCount & 1) == 0 && (doubleQuoteCount & 1) == 0) {
                                if (count === 0)
                                    return direction === 1 ? {
                                            open: begin, close: i
                                        } : {
                                            open: i, close: end
                                        };
                                count--
                            }
                            i += direction
                        }
                    }
                    return null
                }, _getMatchingOppositeBracket: function(paren) {
                    switch (paren) {
                        case"(":
                            return ")";
                        case")":
                            return "(";
                        case"{":
                            return "}";
                        case"}":
                            return "{";
                        case"[":
                            return "]";
                        case"]":
                            return "["
                    }
                    return ""
                }
        }, {});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {IntellisenseViewModel: IntellisenseViewModel})
})();